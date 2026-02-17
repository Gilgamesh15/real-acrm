import { initContract } from "@ts-rest/core";
import {
  SBrand,
  SCategory,
  SDiscount,
  SImage,
  SPiece,
  SProduct,
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

const productColumns = getTableColumns(schema.products);
type ProductColumns = keyof typeof productColumns;
const productColumnsKeys = Object.keys(productColumns);

export const productsContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/products",
      query: z.object({
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
        scope: z.enum(["featured", "all"]).optional().default("all"),
        orderBy: z
          .enum(productColumnsKeys as [ProductColumns, ...[ProductColumns]])
          .optional()
          .default("name"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
        images: z.enum(["primary", "all"]).optional().default("all"),
        piecesImages: z.enum(["primary", "all"]).optional().default("all"),
        description: z.coerce.boolean().optional().default(false),
        cache: z.coerce.number().optional(),
      }),
      responses: {
        200: z.object({
          products: z.array(
            SProduct.extend({
              images: z.array(SImage),
              pieces: z.array(
                SPiece.extend({
                  images: z.array(SImage),
                  discount: SDiscount.nullable(),
                  brand: SBrand,
                  //.nullable()
                  size: SSize,
                  //.nullable(),
                  category: SCategory.nullable(),
                })
              ),
              discount: SDiscount.nullable(),
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
  const parse = productsContract.get.all.query.safeParse({
    limit: url.searchParams.get("limit"),
    offset: url.searchParams.get("offset"),
    scope: url.searchParams.get("scope"),
    orderBy: url.searchParams.get("orderBy"),
    sortOrder: url.searchParams.get("sortOrder"),
    images: url.searchParams.get("images"),
    piecesImages: url.searchParams.get("piecesImages"),
    description: url.searchParams.get("description"),
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
    piecesImages: piecesImagesParam,
    cache,
  } = parse.data;

  try {
    const publicWhere = and(
      exists(
        db
          .select()
          .from(schema.pieces)
          .where(
            and(
              eq(schema.pieces.productId, schema.products.id),
              eq(schema.pieces.status, "published"),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              )
            )
          )
      ),
      eq(schema.products.status, "published")
    );
    const where =
      scope === "featured"
        ? and(publicWhere, gte(schema.pieces.homeFeaturedOrder, 0))
        : publicWhere;

    const orderBy =
      sortOrderParam === "asc"
        ? asc(schema.products[orderByParam])
        : desc(schema.products[orderByParam]);

    const products = await db.query.products.findMany({
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
        pieces: {
          with: {
            discount: true,
            images:
              piecesImagesParam === "primary"
                ? {
                    limit: 1,
                    orderBy: asc(schema.images.displayOrder),
                  }
                : true,
            brand: true,
            size: true,
            category: true,
          },
        },
      },
    });

    return data(superjson.serialize({ products }), {
      status: 200,
      headers: {
        ...(cache ? { "Cache-Control": `public, max-age=${cache}` } : {}),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch products", { error });
    return data(superjson.serialize({ error: "Failed to fetch products" }), {
      status: 500,
    });
  }
}
