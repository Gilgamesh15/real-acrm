import { initContract } from "@ts-rest/core";
import {
  SBrand,
  SCategory,
  SDiscount,
  SImage,
  SPiece,
  SSize,
} from "db/db-zod-schemas";
import * as schema from "db/schema";
import { and, asc, desc, eq, gte, or, sql } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import superjson from "superjson";
import z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";

const c = initContract();

export const piecesContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/pieces",
      query: z.object({}),
      responses: {
        200: z.object({
          pieces: z.array(
            SPiece.extend({
              images: z.array(SImage),
              discount: SDiscount.nullable(),
              brand: SBrand.nullable(),
              size: SSize.nullable(),
              category: SCategory.nullable(),
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
  const session = context.get(sessionContext);
  const userId = session?.user.id;

  try {
    const piecesRes = await db
      .select()
      .from(schema.pieces)
      .leftJoinLateral(
        db
          .select()
          .from(schema.images)
          .where(eq(schema.images.pieceId, schema.pieces.id))
          .limit(1)
          .orderBy(asc(schema.images.displayOrder))
          .as("images"),
        sql`true`
      )
      .leftJoin(schema.brands, eq(schema.pieces.brandId, schema.brands.id))
      .leftJoin(schema.sizes, eq(schema.pieces.sizeId, schema.sizes.id))
      .leftJoin(
        schema.categories,
        eq(schema.pieces.categoryId, schema.categories.id)
      )
      .leftJoin(
        schema.discounts,
        eq(schema.pieces.discountId, schema.discounts.id)
      )
      .where(
        or(
          // it is featured
          gte(schema.pieces.homeFeaturedOrder, 0),
          // it is published
          eq(schema.pieces.status, "published"),
          // or in checkout and user is the one who reserved it
          ...(userId
            ? [
                and(
                  eq(schema.pieces.status, "in_checkout"),
                  eq(schema.pieces.reservedByUserId, userId)
                ),
              ]
            : [])
        )
      )
      .orderBy(desc(schema.pieces.homeFeaturedOrder))
      .limit(16);

    const pieces = piecesRes.map((item) => {
      const images = piecesRes
        .filter((i) => i.images?.pieceId === item.pieces.id)
        .map((i) => i.images)
        .filter((i) => i !== null);

      const discount =
        piecesRes.find((i) => i.pieces.discountId === item.pieces.discountId)
          ?.discounts ?? null;
      const brand =
        piecesRes.find((i) => i.pieces.brandId === item.pieces.brandId)
          ?.brands ?? null;
      const size =
        piecesRes.find((i) => i.pieces.sizeId === item.pieces.sizeId)?.sizes ??
        null;
      const category =
        piecesRes.find((i) => i.pieces.categoryId === item.pieces.categoryId)
          ?.categories ?? null;

      return {
        ...item.pieces,
        images,
        discount,
        brand,
        size,
        category,
      };
    });

    return data(
      superjson.serialize({ pieces } satisfies z.infer<
        (typeof piecesContract.get.all.responses)["200"]
      >),
      {
        status: 200,
        headers: {
          // 5 minutes
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (error) {
    logger.error("Failed to fetch pieces", { error });
    return data(superjson.serialize({ error: "Failed to fetch pieces" }), {
      status: 500,
    });
  }
}
