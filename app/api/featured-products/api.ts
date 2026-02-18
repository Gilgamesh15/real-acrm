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
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import superjson from "superjson";
import z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";

const c = initContract();

export const featuredProductsContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/featured-products",
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
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const userId = session?.user.id;

  try {
    // eslint-disable-next-line tsPlugin/no-unused-vars
    const { description: _description, ...productCols } = getTableColumns(
      schema.products
    );

    const productsRes = await db
      .select({
        products: productCols,
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
          .where(eq(schema.images.productId, schema.products.id))
          .limit(1)
          .orderBy(asc(schema.images.displayOrder))
          .as("images"),
        sql`true`
      )
      .where(
        and(
          eq(schema.products.status, "published"),
          gte(schema.products.featuredOrder, 0),
          exists(
            db
              .select({ one: sql`1` })
              .from(schema.pieces)
              .where(
                and(
                  or(
                    eq(schema.pieces.status, "published"),
                    lte(schema.pieces.reservedUntil, new Date()),
                    ...(userId
                      ? [eq(schema.pieces.reservedByUserId, userId)]
                      : [])
                  ),
                  eq(schema.products.id, schema.pieces.productId)
                )
              )
          )
        )
      )
      .orderBy(desc(schema.products.featuredOrder))
      .limit(15);

    if (productsRes.length === 0) {
      return data(
        superjson.serialize({ products: [] } satisfies z.infer<
          (typeof featuredProductsContract.get.all.responses)["200"]
        >),
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300",
          },
        }
      );
    }

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
          .where(eq(schema.images.pieceId, schema.pieces.id))
          .limit(1)
          .orderBy(asc(schema.images.displayOrder))
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

    const products = productsRes.map((item) => {
      const images = productsRes
        .filter((i) => i.images?.productId === item.products.id)
        .map((i) => i.images)
        .filter((i) => i !== null);

      const discount = item.discounts ?? null;

      const pieces = piecesRes
        .filter((i) => i.pieces.productId === item.products.id)
        .map((i) => {
          const brand =
            piecesRes.find((j) => j.brands?.id === i.pieces.brandId)?.brands ??
            null;
          const size =
            piecesRes.find((j) => j.sizes?.id === i.pieces.sizeId)?.sizes ??
            null;
          const images = piecesRes
            .filter((j) => j.images?.pieceId === i.pieces.id)
            .map((j) => j.images)
            .filter((j) => j !== null);
          const category =
            piecesRes.find((j) => j.categories?.id === i.pieces.categoryId)
              ?.categories ?? null;
          const discount =
            piecesRes.find((j) => j.discounts?.id === i.pieces.discountId)
              ?.discounts ?? null;
          return {
            ...i.pieces,
            brand,
            size,
            images,
            category,
            discount,
          };
        });

      return {
        ...item.products,
        images,
        discount,
        pieces,
      };
    });

    return data(
      superjson.serialize({ products } satisfies z.infer<
        (typeof featuredProductsContract.get.all.responses)["200"]
      >),
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (error) {
    logger.error("Failed to fetch featured products", { error });
    return data(
      superjson.serialize({ error: "Failed to fetch featured products" }),
      {
        status: 500,
      }
    );
  }
}
