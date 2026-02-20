import * as schema from "db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

import { db } from "~/lib/db";
import { orderStatusFromOrder } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber");
  const email = url.searchParams.get("email");

  if (!orderNumber || !email) {
    return data(
      { success: false as const, error: "Brak wymaganych danych" },
      { status: 400 }
    );
  }

  const order = await db.query.orders.findFirst({
    where: and(
      eq(schema.orders.orderNumber, orderNumber.toUpperCase()),
      eq(schema.orders.email, email.toLowerCase())
    ),
    with: {
      events: { orderBy: desc(schema.orderTimelineEvents.timestamp) },
      items: {
        with: {
          product: {
            with: {
              images: { limit: 1, orderBy: asc(schema.images.displayOrder) },
            },
          },
          piece: {
            with: {
              images: { limit: 1, orderBy: asc(schema.images.displayOrder) },
              brand: true,
              size: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return data(
      { success: false as const, error: "Zamówienie nie znalezione" },
      { status: 404 }
    );
  }

  const status = orderStatusFromOrder(order);
  if (status === "pending" || status === "cancelled") {
    return data(
      {
        success: false as const,
        error: "Zamówienie musi być opłacone, aby złożyć zwrot",
      },
      { status: 400 }
    );
  }

  const hasEligibleItems = order.items.some(
    (item) => item.piece.status === "sold"
  );

  if (!hasEligibleItems) {
    return data(
      {
        success: false as const,
        error: "Żaden przedmiot z tego zamówienia nie kwalifikuje się do zwrotu",
      },
      { status: 400 }
    );
  }

  return data({
    success: true as const,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      deliveryName: order.deliveryName,
      phoneNumber: order.phoneNumber,
      email: order.email,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        pieceId: item.pieceId,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              images: item.product.images,
            }
          : null,
        piece: {
          id: item.piece.id,
          name: item.piece.name,
          status: item.piece.status,
          images: item.piece.images,
          brand: item.piece.brand,
          size: item.piece.size,
        },
        unitPriceInGrosz: item.unitPriceInGrosz,
        lineTotalInGrosz: item.lineTotalInGrosz,
        discountAmountInGrosz: item.discountAmountInGrosz,
        taxInGrosz: item.taxInGrosz,
      })),
    },
  });
}
