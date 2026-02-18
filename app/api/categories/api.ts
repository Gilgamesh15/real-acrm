import { initContract } from "@ts-rest/core";
import { SCategory, SImage } from "db/db-zod-schemas";
import * as schema from "db/schema";
import { asc, eq, getTableColumns, gte } from "drizzle-orm";
import { type LoaderFunctionArgs, data } from "react-router";
import superjson from "superjson";
import z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { db } from "~/lib/db";

const c = initContract();

export const categoriesContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/categories",
      query: z.object({}),
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

export async function loader({ context }: LoaderFunctionArgs) {
  const logger = context.get(loggerContext);

  const start = performance.now();
  logger.debug("Loading categories loader", {
    start,
  });
  try {
    const categories = await db
      .select({
        ...getTableColumns(schema.categories),
        image: getTableColumns(schema.images),
      })
      .from(schema.categories)
      .innerJoin(
        schema.images,
        eq(schema.categories.id, schema.images.categoryId)
      )
      .where(gte(schema.categories.featuredOrder, 0))
      .orderBy(asc(schema.categories.featuredOrder));

    logger.debug("Categories loader completed", {
      end: performance.now(),
      duration: performance.now() - start,
    });

    return data(
      superjson.serialize({ categories } satisfies z.infer<
        (typeof categoriesContract.get.all.responses)["200"]
      >),
      {
        status: 200,
        headers: {
          // 1 hour
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    logger.error("Failed to fetch categories", { error });
    return data(superjson.serialize({ error: "Failed to fetch categories" }), {
      status: 500,
    });
  }
}
