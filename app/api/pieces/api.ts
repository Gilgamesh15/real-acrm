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
import {
  and,
  asc,
  desc,
  eq,
  exists,
  getTableColumns,
  gte,
  isNull,
  lte,
  or,
} from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import superjson from "superjson";
import z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { db } from "~/lib/db";

const c = initContract();

const pieceColumns = getTableColumns(schema.pieces);
type PieceColumns = keyof typeof pieceColumns;
const pieceColumnsKeys = Object.keys(pieceColumns);

export const piecesContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/pieces",
      query: z.object({
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
        scope: z.enum(["featured"]).optional(),
        orderBy: z
          .enum(pieceColumnsKeys as [PieceColumns, ...[PieceColumns]])
          .optional()
          .default("name"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
        images: z.enum(["primary", "all"]).optional().default("all"),
        cache: z.coerce.number().optional(),
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

export async function loader({ request, context }: LoaderFunctionArgs) {
  const logger = context.get(loggerContext);
  const url = new URL(request.url);
  const parse = piecesContract.get.all.query.safeParse({
    limit: url.searchParams.get("limit"),
    offset: url.searchParams.get("offset"),
    scope: url.searchParams.get("scope"),
    orderBy: url.searchParams.get("orderBy"),
    sortOrder: url.searchParams.get("sortOrder"),
    images: url.searchParams.get("images"),
    cache: url.searchParams.get("cache"),
  });

  if (!parse.success) {
    return data(superjson.serialize({ error: parse.error.issues }), {
      status: 400,
    });
  }

  const {
    limit,
    offset,
    scope,
    orderBy: orderByParam,
    sortOrder: sortOrderParam,
    images: imagesParam,
    cache,
  } = parse.data;

  try {
    const publicWhere = and(
      eq(schema.pieces.status, "published"),
      or(
        isNull(schema.pieces.reservedUntil),
        lte(schema.pieces.reservedUntil, new Date())
      ),
      or(
        isNull(schema.pieces.productId),
        exists(
          db
            .select({ id: schema.products.id })
            .from(schema.products)
            .where(
              and(
                eq(schema.products.id, schema.pieces.productId),
                eq(schema.products.status, "published")
              )
            )
        )
      )
    );
    const where =
      scope === "featured"
        ? and(publicWhere, gte(schema.pieces.homeFeaturedOrder, 0))
        : publicWhere;

    const orderBy =
      sortOrderParam === "asc"
        ? asc(schema.pieces[orderByParam])
        : desc(schema.pieces[orderByParam]);

    const pieces = await db.query.pieces.findMany({
      limit,
      offset,
      where,
      orderBy,
      with: {
        discount: true,
        images:
          imagesParam === "primary"
            ? {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              }
            : true,
        brand: true,
        size: true,
        category: true,
      },
    });

    return data(superjson.serialize({ pieces }), {
      status: 200,
      headers: {
        ...(cache ? { "Cache-Control": `public, max-age=${cache}` } : {}),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch pieces", { error });
    return data(superjson.serialize({ error: "Failed to fetch pieces" }), {
      status: 500,
    });
  }
}
