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

import { db } from "~/lib/db";

const c = initContract();

export const piecesContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/pieces",
      query: z.object({
        limit: z.coerce.number().int().min(1).max(50).optional().default(16),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
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

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { logger } = context;
  const { session } = context;
  const userId = session?.user.id;

  const url = new URL(request.url);

  const { success, data: args } = piecesContract.get.all.query.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
  });

  if (!success) {
    return data(superjson.serialize({ error: "Invalid query parameters" }), {
      status: 400,
    });
  }

  const { limit, offset } = args;

  logger.debug("Pieces loader args", { limit, offset });

  const start = performance.now();
  logger.debug("Loading pieces loader", {
    start,
  });

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
        and(
          or(
            eq(schema.pieces.status, "published"),
            ...(userId
              ? [
                  and(
                    eq(schema.pieces.status, "in_checkout"),
                    eq(schema.pieces.reservedByUserId, userId)
                  ),
                ]
              : [])
          ),
          gte(schema.pieces.homeFeaturedOrder, 0)
        )
      )
      .orderBy(desc(schema.pieces.homeFeaturedOrder))
      .offset(offset)
      .limit(limit);

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

    logger.debug("Pieces loader completed", {
      end: performance.now(),
      duration: performance.now() - start,
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
