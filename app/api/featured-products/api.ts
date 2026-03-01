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

import { db } from "~/lib/db";

const c = initContract();

export const featuredProductsContract = {
  get: {
    all: c.query({
      method: "GET",
      path: "/featured-products",
      query: z.object({
        limit: z.coerce.number().int().min(1).max(50).optional().default(15),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
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

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { logger } = context;
  const { session } = context;
  const userId = session?.user.id;

  const url = new URL(request.url);
  const { success, data: args } =
    featuredProductsContract.get.all.query.safeParse({
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });

  if (!success) {
    return data(superjson.serialize({ error: "Invalid query parameters" }), {
      status: 400,
    });
  }

  const { limit, offset } = args;

  try {
    // eslint-disable-next-line tsPlugin/no-unused-vars
    const { description: _description, ...productCols } = getTableColumns(
      schema.products
    );

    const productsRes = await db
      .select({
        products: productCols,
        discounts: schema.discounts,
      })
      .from(schema.products)
      .leftJoin(
        schema.discounts,
        eq(schema.products.discountId, schema.discounts.id)
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
      .offset(offset)
      .limit(limit);

    if (productsRes.length === 0) {
      return data(
        superjson.serialize({ products: [] } satisfies z.infer<
          (typeof featuredProductsContract.get.all.responses)["200"]
        >),
        {
          status: 200,
          headers: { "Cache-Control": "public, max-age=300" },
        }
      );
    }

    const productIds = productsRes.map((i) => i.products.id);

    const [productImagesRes, piecesRes] = await Promise.all([
      db
        .select()
        .from(schema.images)
        .where(inArray(schema.images.productId, productIds))
        .orderBy(asc(schema.images.displayOrder)),

      db
        .select()
        .from(schema.pieces)
        .where(
          and(
            or(
              eq(schema.pieces.status, "published"),
              lte(schema.pieces.reservedUntil, new Date()),
              ...(userId ? [eq(schema.pieces.reservedByUserId, userId)] : [])
            ),
            inArray(schema.pieces.productId, productIds)
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
        ),
    ]);

    const products = productsRes.map((item) => {
      const images = productImagesRes.filter(
        (img) => img.productId === item.products.id
      );
      const discount = item.discounts ?? null;
      const pieces = piecesRes
        .filter((i) => i.pieces.productId === item.products.id)
        .map((i) => ({
          ...i.pieces,
          brand: i.brands ?? null,
          size: i.sizes ?? null,
          images: piecesRes
            .filter((j) => j.images?.pieceId === i.pieces.id)
            .map((j) => j.images)
            .filter((j) => j !== null),
          category: i.categories ?? null,
          discount: i.discounts ?? null,
        }));

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
        headers: { "Cache-Control": "public, max-age=300" },
      }
    );
  } catch (error) {
    logger.error("Failed to fetch featured products", { error });
    return data(
      superjson.serialize({ error: "Failed to fetch featured products" }),
      { status: 500 }
    );
  }
}
