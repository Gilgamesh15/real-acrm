import * as schema from "db/schema";
import { and, asc, eq, exists, inArray, isNull, or } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";

import { db } from "~/lib/db";
import type { DBQueryArgs, DBQueryResult, LocalStorageCart } from "~/lib/types";

const getCartProductSelect = (ids: string[]) =>
  ({
    where: and(
      inArray(schema.products.id, ids),
      inArray(schema.products.status, ["published", "in_checkout"]),
      exists(
        db
          .select({ id: schema.pieces.id })
          .from(schema.pieces)
          .where(
            and(
              eq(schema.pieces.productId, schema.products.id),
              inArray(schema.pieces.status, ["published", "in_checkout"])
            )
          )
      )
    ),
    columns: {
      description: false,
    },
    with: {
      pieces: {
        columns: {
          description: false,
        },
        where: inArray(schema.pieces.status, ["published", "in_checkout"]),
        with: {
          brand: true,
          category: true,
          size: true,
          images: {
            limit: 1,
            orderBy: asc(schema.images.displayOrder),
          },
          discount: true,
        },
        orderBy: asc(schema.pieces.productDisplayOrder),
      },
      images: {
        limit: 1,
        orderBy: asc(schema.images.displayOrder),
      },
      discount: true,
    },
  }) satisfies DBQueryArgs<"products">;

export type CartProduct = DBQueryResult<
  "products",
  ReturnType<typeof getCartProductSelect>
>;

const getCartPieceSelect = (ids: string[]) =>
  ({
    where: and(
      inArray(schema.pieces.id, ids),
      inArray(schema.pieces.status, ["published", "in_checkout"]),
      or(
        isNull(schema.pieces.productId),
        exists(
          db
            .select({ id: schema.products.id })
            .from(schema.products)
            .where(
              and(
                eq(schema.products.id, schema.pieces.productId),
                inArray(schema.products.status, ["published", "in_checkout"])
              )
            )
        )
      )
    ),
    columns: {
      description: false,
    },
    with: {
      images: {
        limit: 1,
        orderBy: asc(schema.images.displayOrder),
      },
      brand: true,
      category: true,
      size: true,
      discount: true,
    },
  }) satisfies DBQueryArgs<"pieces">;

export type CartPiece = DBQueryResult<
  "pieces",
  ReturnType<typeof getCartPieceSelect>
>;
export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;

  try {
    const cartData = (await request.json()) as LocalStorageCart;

    if (cartData.length === 0) {
      return data(
        {
          products: [] as CartProduct[],
          pieces: [] as CartPiece[],
          missingProductIds: [] as string[],
          missingPieceIds: [] as string[],
          error: null,
          success: true,
          message: "Cart is empty",
        },
        { status: 200 }
      );
    }

    const productIds: Set<string> = new Set();
    const pieceIds: Set<string> = new Set();

    for (const item of cartData) {
      if (item.productId) {
        productIds.add(item.productId);
      } else {
        pieceIds.add(item.pieceId);
      }
    }

    const [products, pieces] = await Promise.all([
      productIds.size > 0
        ? db.query.products.findMany(
            getCartProductSelect(Array.from(productIds))
          )
        : Promise.resolve([]),
      pieceIds.size > 0
        ? db.query.pieces.findMany(getCartPieceSelect(Array.from(pieceIds)))
        : Promise.resolve([]),
    ]);

    const fetchedProductIds = new Set(products.map((p) => p.id));
    const fetchedPieceIds = new Set(pieces.map((p) => p.id));

    const missingProductIds = Array.from(productIds).filter(
      (id) => !fetchedProductIds.has(id)
    );
    const missingPieceIds = Array.from(pieceIds).filter(
      (id) => !fetchedPieceIds.has(id)
    );

    if (missingProductIds.length || missingPieceIds.length) {
      logger.info("Cart contains missing items", {
        missingProductIds,
        missingPieceIds,
      });
    }

    return data(
      {
        products,
        pieces,
        missingProductIds,
        missingPieceIds,
        success: true,
        message: "Cart items fetched successfully",
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to fetch cart items", {
      error,
    });

    return data(
      {
        success: false,
        error: "Failed to fetch cart items",
        message: "Failed to fetch cart items",
        products: [] as CartProduct[],
        pieces: [] as CartPiece[],
        missingProductIds: [] as string[],
        missingPieceIds: [] as string[],
      },
      { status: 500 }
    );
  }
}
