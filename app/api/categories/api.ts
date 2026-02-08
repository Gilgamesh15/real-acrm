import { initContract } from "@ts-rest/core";
import { SCategory, SImage } from "db/db-zod-schemas";
import * as schema from "db/schema";
import { asc, desc, getTableColumns, gte } from "drizzle-orm";
import { type LoaderFunctionArgs, data } from "react-router";
import superjson from "superjson";
import z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { db } from "~/lib/db";

const c = initContract();

const categoryColumns = getTableColumns(schema.categories);
type CategoryColumns = keyof typeof categoryColumns;
const categoryColumnsKeys = Object.keys(categoryColumns);

export const categoriesContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/categories",
      query: z.object({
        scope: z.enum(["featured", "all"]).optional().default("all"),
        orderBy: z
          .enum(categoryColumnsKeys as [CategoryColumns, ...[CategoryColumns]])
          .optional()
          .default("updatedAt"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
        cache: z.coerce.number().optional(),
      }),
      responses: {
        200: z.object({
          categories: z.array(
            SCategory.extend({
              image: SImage.nullable(),
            })
          ),
        }),
      },
      strictStatusCodes: true,
    }),
  },
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const logger = context.get(loggerContext);
  const url = new URL(request.url);
  const parse = categoriesContract.get.all.query.safeParse({
    scope: url.searchParams.get("scope"),
    orderBy: url.searchParams.get("orderBy"),
    sortOrder: url.searchParams.get("sortOrder"),
    cache: url.searchParams.get("cache"),
  });

  if (!parse.success) {
    return data(superjson.serialize({ error: parse.error.issues }), {
      status: 400,
    });
  }

  const {
    scope,
    orderBy: orderByParam,
    sortOrder: sortOrderParam,
    cache,
  } = parse.data;

  try {
    const where =
      scope === "featured"
        ? gte(schema.categories.featuredOrder, 0)
        : undefined;

    const orderBy =
      sortOrderParam === "asc"
        ? asc(schema.categories[orderByParam])
        : desc(schema.categories[orderByParam]);

    const categories = await db.query.categories.findMany({
      with: {
        image: true,
      },
      where,
      orderBy,
    });

    return data(superjson.serialize({ categories }), {
      status: 200,
      headers: {
        ...(cache ? { "Cache-Control": `public, max-age=${cache}` } : {}),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch categories", { error });
    return data(superjson.serialize({ error: "Failed to fetch categories" }), {
      status: 500,
    });
  }
}
