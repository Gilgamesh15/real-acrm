import { AppError, InternalServerError, UnauthorizedError } from "db/error";
import type { DBUser } from "db/schema";
import type { AppLoadContext } from "react-router";
import type {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from "react-router";
import SuperJSON from "superjson";
import z from "zod";

import type { Logger } from "~/lib/logger.server";
import type { ServerSession } from "~/lib/types";

type AppContext = { session: ServerSession | null; logger: Logger };

/**
 * Protection function that validates request context and returns either
 * a resource object or an error Response
 */
type ProtectFn<TProtectResult extends object = {}> = (
  ctx: AppContext
) => TProtectResult | true;

export class AppResponse {
  public static to(body?: unknown, init?: ResponseInit): Response {
    return Response.json(SuperJSON.serialize(body), init);
  }

  public static async from(response: Response): Promise<unknown> {
    const body = await response.json();
    return SuperJSON.deserialize(body);
  }

  public static fromError(error: unknown): Response {
    if (error instanceof AppError) {
      return this.to(error.toJSON(), { status: error.status });
    }

    let message = "Internal Server Error";
    if (typeof error === "string") {
      message = error;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      message = error.message;
    }

    const newError = new InternalServerError(message);

    return this.to(newError.toJSON(), { status: newError.status });
  }
}

export type AdminResource = { user: DBUser };

export const adminOnly: ProtectFn<AdminResource> = (ctx: AppContext) => {
  if (ctx.session?.user?.role === "admin") {
    return { user: ctx.session.user };
  }
  throw new UnauthorizedError(
    "Unauthorized",
    "adminOnly",
    ctx.session?.user?.id
  );
};

export type AuthenticatedResource = { user: DBUser };
export const authenticatedOnly: ProtectFn<AuthenticatedResource> = (
  ctx: AppContext
) => {
  if (ctx.session !== null && !ctx.session.user.isAnonymous) {
    return { user: ctx.session.user };
  }
  throw new UnauthorizedError(
    "Unauthorized",
    "authenticatedOnly",
    ctx.session?.user?.id
  );
};

export type AnyoneResource = { user?: DBUser };

export const anyone: ProtectFn<AnyoneResource> = (ctx) =>
  ctx.session?.user ? { user: ctx.session.user } : { user: undefined };

/**
 * Goals:
 * 1. Extract context and pass it to the handler
 * 2. Protect the resource from unauthorized access and pass success resource of the protectFn to the handler if provided
 */
function createHandler<
  THandlerArgs extends
    | LoaderFunctionArgs<AppLoadContext>
    | ActionFunctionArgs<AppLoadContext>,
  TProtectResult extends object = {},
>(
  protect: ProtectFn<TProtectResult>,
  handler: (
    args: Omit<THandlerArgs, "context"> & TProtectResult & AppContext
  ) => Promise<Response> | Response
) {
  return (async (args) => {
    try {
      const { context } = args;

      const { logger } = context;
      const { session } = context;

      const protectResult = await protect({ session, logger });

      const result = await handler({
        request: args.request,
        unstable_pattern: args.unstable_pattern,
        params: args.params,
        session,
        logger,
        ...(typeof protectResult === "object" ? protectResult : {}),
      } as Omit<THandlerArgs, "context"> & TProtectResult & AppContext);

      return result;
    } catch (error) {
      return AppResponse.fromError(error);
    }
  }) satisfies LoaderFunction | ActionFunction;
}

const parseParams = (
  searchParams: URLSearchParams
): Record<string, string | string[] | undefined> => {
  const result: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of searchParams.entries()) {
    const existing = result[key];

    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  }

  return result;
};

/**
 * Goals:
 * 1. All goals achieved from createHandler
 * 2. Extract params from URL and pass it to the loader
 * 3. Validate the parsed params against the schema
 */
export const createLoader = <
  TLoaderArgs extends LoaderFunctionArgs<AppLoadContext>,
  TProtectResult extends object = {},
  TSchema extends z.ZodType<unknown, unknown> = z.ZodType<unknown, unknown>,
>(
  schema: TSchema,
  protect: ProtectFn<TProtectResult>,
  handler: (
    args: Omit<TLoaderArgs, "context"> &
      TProtectResult &
      AppContext & { args: z.infer<TSchema> }
  ) => Promise<Response> | Response
) => {
  return createHandler(protect, async (baseHandlerArgs) => {
    const url = new URL(baseHandlerArgs.request.url);
    const parseResult = schema.safeParse(parseParams(url.searchParams));

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues
        .map((issue) => issue.message)
        .join(", ");

      return AppResponse.to({ error: errorMessage }, { status: 400 });
    }

    return await handler({
      ...baseHandlerArgs,
      args: parseResult.data as z.infer<TSchema>,
    } as Omit<TLoaderArgs, "context"> &
      TProtectResult &
      AppContext & { args: z.infer<TSchema> });
  });
};

export function combineActions(
  actions: Partial<Record<"POST" | "PUT" | "DELETE", ActionFunction>>
) {
  return ((args) => {
    const { request } = args;

    const method = request.method;
    if (method === "POST" && actions.POST) {
      return actions.POST(args);
    }
    if (method === "PUT" && actions.PUT) {
      return actions.PUT(args);
    }
    if (method === "DELETE" && actions.DELETE) {
      return actions.DELETE(args);
    }

    return AppResponse.to({ error: "Method not allowed" }, { status: 405 });
  }) satisfies ActionFunction;
}

export const createAction = <
  TActionArgs extends ActionFunctionArgs<AppLoadContext>,
  TProtectResult extends object = {},
  TSchema extends z.ZodType<unknown, unknown> = z.ZodType<unknown, unknown>,
>(
  schema: TSchema | undefined,
  protect: ProtectFn<TProtectResult>,
  handler: (
    args: Omit<TActionArgs, "context"> &
      TProtectResult &
      AppContext & { args: z.infer<TSchema> }
  ) => Promise<Response> | Response
) => {
  return createHandler(protect, async (baseHandlerArgs) => {
    let args: z.infer<TSchema> | undefined = undefined;
    if (schema) {
      const body = await baseHandlerArgs.request.json();
      const parseResult = schema.safeParse(body);
      if (!parseResult.success) {
        const errorMessage = parseResult.error.issues
          .map((issue) => issue.message)
          .join(", ");

        return AppResponse.to({ error: errorMessage }, { status: 400 });
      }

      args = parseResult.data as z.infer<TSchema>;
    }

    return await handler({
      ...baseHandlerArgs,
      args,
    } as Omit<TActionArgs, "context"> &
      TProtectResult &
      AppContext & { args: z.infer<TSchema> });
  });
};
