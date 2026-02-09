import { isbot } from "isbot";
import type { MiddlewareFunction } from "react-router";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { auth } from "~/lib/auth.server";
import type { ServerSession } from "~/lib/types";

export const sessionMiddleware: MiddlewareFunction = async (
  { request, context },
  next
) => {
  if (isbot(request.headers.get("user-agent"))) {
    context.set(sessionContext, null);
    return next();
  }
  const logger = context.get(loggerContext);
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/webhooks")) {
    logger.info("Session middleware skipping for webhook", { url });
    return next();
  }

  logger.info("Session middleware started");
  let session = await auth.api.getSession({
    headers: request.headers,
  });

  logger.info("Session middleware got session", { session });

  let setCookieHeader: string | null = null;

  if (!session) {
    logger.info("Session middleware no session, signing in anonymous");
    const anonymousResponse = await auth.api.signInAnonymous({
      headers: request.headers,
      asResponse: true,
    });

    logger.info("Session middleware signed in anonymous", {
      anonymousResponse,
    });

    setCookieHeader = anonymousResponse.headers.get("set-cookie");

    const data = (await anonymousResponse.json()) as {
      session: ServerSession;
    };
    session = data.session;
  }

  logger.info("Session middleware setting session", { session });

  context.set(sessionContext, session);

  const response = (await next()) as Response;

  if (setCookieHeader) {
    response.headers.set("set-cookie", setCookieHeader);
  }

  logger.info("Session middleware response", { response });

  return response;
};
