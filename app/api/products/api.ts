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
  eq,
  getTableColumns,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import superjson from "superjson";
import z from "zod";

import { db } from "~/lib/db";

const c = initContract();

export const productsContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/products",
      query: z.object({}),
      responses: {
        200: z.object({
          products: z.array(
            SProduct.omit({ description: true }).extend({
              images: z.array(SImage),
              pieces: z.array(
                SPiece.extend({
                  images: z.array(SImage),
                  discount: SDiscount.nullable(),
                  brand: SBrand.nullable(),
                  size: SSize.nullable(),
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

export async function loader({ context }: LoaderFunctionArgs) {
  const { logger } = context;
  const { session } = context;
  const userId = session?.user.id;

  const start = performance.now();
  logger.debug("Loading products loader", {
    start,
  });
  try {
    // eslint-disable-next-line tsPlugin/no-unused-vars
    const { description: _, ...productsColumns } = getTableColumns(
      schema.products
    );

    const productsRes = await db
      .select({
        products: productsColumns,
        discounts: schema.discounts,
        images: schema.images,
      })
      .from(schema.products)
      .leftJoin(
        schema.discounts,
        eq(schema.products.discountId, schema.discounts.id)
      )
      .leftJoinLateral(
        db
          .select()
          .from(schema.images)
          .limit(1)
          .orderBy(asc(schema.images.displayOrder))
          .where(eq(schema.images.productId, schema.products.id))
          .as("images"),
        sql`true`
      )
      .where(eq(schema.products.status, "published"))
      .limit(16);

    const piecesRes = await db
      .select()
      .from(schema.pieces)
      .where(
        and(
          or(
            eq(schema.pieces.status, "published"),
            lte(schema.pieces.reservedUntil, new Date()),
            ...(userId ? [eq(schema.pieces.reservedByUserId, userId)] : [])
          ),
          inArray(
            schema.pieces.productId,
            productsRes.map((i) => i.products.id)
          )
        )
      )
      .leftJoinLateral(
        db
          .select()
          .from(schema.images)
          .limit(1)
          .orderBy(asc(schema.images.displayOrder))
          .where(eq(schema.images.pieceId, schema.pieces.id))
          .as("images"),
        sql`true`
      )
      .leftJoin(
        schema.discounts,
        eq(schema.discounts.id, schema.pieces.discountId)
      )
      .leftJoin(schema.brands, eq(schema.brands.id, schema.pieces.brandId))
      .leftJoin(schema.sizes, eq(schema.sizes.id, schema.pieces.sizeId))
      .leftJoin(
        schema.categories,
        eq(schema.categories.id, schema.pieces.categoryId)
      );

    const products = productsRes.map((item) => ({
      ...item.products,
      images: productsRes
        .filter((i) => i.images?.productId === item.products.id)
        .map((i) => i.images)
        .filter((i) => i !== null),
      discount:
        productsRes.find((i) => i.products.discountId === i.discounts?.id)
          ?.discounts ?? null,
      pieces: piecesRes
        .filter((i) => i.pieces.productId === item.products.id)
        .map((i) => ({
          ...i.pieces,
          brand:
            piecesRes.find((j) => j.brands?.id === i.pieces.brandId)?.brands ??
            null,
          size:
            piecesRes.find((j) => j.sizes?.id === i.pieces.sizeId)?.sizes ??
            null,
          images: piecesRes
            .filter((j) => j.images?.pieceId === i.pieces.id)
            .map((j) => j.images)
            .filter((j) => j !== null),
          category:
            piecesRes.find((j) => j.categories?.id === i.pieces.categoryId)
              ?.categories ?? null,
          discount:
            piecesRes.find((j) => j.discounts?.id === i.pieces.discountId)
              ?.discounts ?? null,
        })),
    }));

    logger.debug("Products loader completed", {
      end: performance.now(),
      duration: performance.now() - start,
    });

    return data(superjson.serialize({ products }), {
      status: 200,
      headers: {
        // 10 minutes
        "Cache-Control": `public, max-age=600`,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch products", { error });
    return data(superjson.serialize({ error: "Failed to fetch products" }), {
      status: 500,
    });
  }
}
