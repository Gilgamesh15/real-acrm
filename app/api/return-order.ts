import * as schema from "db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { type LoaderFunctionArgs, data } from "react-router";
import { loggerContext } from "~/context/logger-context.server";

import { db } from "~/lib/db";
import { orderStatusFromOrder } from "~/lib/utils";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const logger = context.get(loggerContext);
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("orderNumber");
  const email = url.searchParams.get("email");

  if (!orderNumber || !email) {
    return data(
      { success: false, error: "Brak wymaganych danych" },
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
          piece: {
            with: {
              images: {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return data(
      { success: false, error: "Zamówienie nie znalezione" },
      { status: 404 }
    );
  }

  const status = orderStatusFromOrder(order);
  if (status === "pending" || status === "cancelled") {
    logger.info("STATUS:"+status)
    return data(
      {
        success: false,
        error: "Zamówienie musi być opłacone, aby złożyć zwrot",
      },
      { status: 400 }
    );
  }

  return data({
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        id: item.id,
        pieceId: item.pieceId,
        pieceName: item.piece.name,
        pieceImage: item.piece.images[0]?.url ?? null,
        unitPriceInGrosz: item.unitPriceInGrosz,
        lineTotalInGrosz: item.lineTotalInGrosz,
        discountAmountInGrosz: item.discountAmountInGrosz,
      })),
    },
  });
}
