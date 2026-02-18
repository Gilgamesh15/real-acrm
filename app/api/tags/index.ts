import * as schema from "db/schema";
import { and, asc, desc, eq, isNull, lte, or } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import superjson from "superjson";

import { db } from "~/lib/db";

export async function loader({ context }: LoaderFunctionArgs) {
  const { logger } = context;

  try {
    const tags = await db.query.tags.findMany({
      with: {
        image: true,
        piecesToTags: {
          orderBy: desc(schema.piecesToTags.createdAt),
          limit: 4,
          with: {
            piece: {
              with: {
                discount: true,
                brand: true,
                size: true,
                category: true,
                images: {
                  limit: 1,
                  orderBy: asc(schema.images.displayOrder),
                },
              },
            },
          },
          where: (piecesToTags, { exists }) =>
            exists(
              db
                .select()
                .from(schema.pieces)
                .where(
                  and(
                    eq(schema.pieces.id, piecesToTags.pieceId),
                    eq(schema.pieces.status, "published"),
                    or(
                      isNull(schema.pieces.reservedUntil),
                      lte(schema.pieces.reservedUntil, new Date())
                    )
                  )
                )
            ),
        },
      },
      orderBy: asc(schema.tags.featuredOrder),
    });

    return data(superjson.serialize(tags), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    logger.error("Failed to fetch tags", { error });
    return data(superjson.serialize({ error: "Failed to fetch tags" }), {
      status: 500,
    });
  }
}
