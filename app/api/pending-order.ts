import * as schema from "db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { type LoaderFunctionArgs, data } from "react-router";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import { stripe } from "~/lib/stripe";
import type { DBQueryArgs, DBQueryResult } from "~/lib/types";

export const orderProductSelect = {
  columns: {
    description: false,
  },
  with: {
    discount: true,
    pieces: {
      with: {
        discount: true,
        brand: true,
        category: true,
        size: true,
        images: {
          limit: 1,
          orderBy: asc(schema.images.displayOrder),
        },
      },
      orderBy: asc(schema.pieces.productDisplayOrder),
    },
    images: {
      limit: 1,
      orderBy: asc(schema.images.displayOrder),
    },
  },
} as const satisfies DBQueryArgs<"products">;

export type OrderProduct = DBQueryResult<"products", typeof orderProductSelect>;

export const orderPieceSelect = {
  with: {
    discount: true,
    images: {
      limit: 1,
      orderBy: asc(schema.images.displayOrder),
    },
    brand: true,
    category: true,
    size: true,
  },
} as const satisfies DBQueryArgs<"pieces">;

export type OrderPiece = DBQueryResult<"pieces", typeof orderPieceSelect>;

export async function loader({ context }: LoaderFunctionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const userId = session.user.id;

  try {
    // Find the user's most recent order
    const pendingOrder = await db.query.orders.findFirst({
      where: eq(schema.orders.userId, userId),
      with: {
        items: {
          with: {
            piece: orderPieceSelect,
            product: orderProductSelect,
          },
        },
        events: {
          orderBy: desc(schema.orderTimelineEvents.timestamp),
        },
      },
      orderBy: desc(schema.orders.createdAt),
    });

    // No order found
    if (!pendingOrder) {
      return data(
        { order: null, stripeCheckoutUrl: null, success: true },
        { status: 200 }
      );
    }

    // Check if latest event status is "pending" (or no events = pending)
    const latestEvent = pendingOrder.events[0];
    const isPending = !latestEvent || latestEvent.status === "pending";

    if (!isPending) {
      return data(
        { order: null, stripeCheckoutUrl: null, success: true },
        { status: 200 }
      );
    }

    // Fetch Stripe checkout URL if session exists
    let stripeCheckoutUrl: string | null = null;
    if (pendingOrder.stripeCheckoutSessionId) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(
          pendingOrder.stripeCheckoutSessionId
        );
        stripeCheckoutUrl = stripeSession.url;
      } catch (stripeError) {
        logger.warn("Failed to retrieve Stripe session URL", {
          stripeError,
          stripeCheckoutSessionId: pendingOrder.stripeCheckoutSessionId,
        });
      }
    }

    return data(
      { order: pendingOrder, stripeCheckoutUrl, success: true },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to fetch pending order", { error, userId });
    return data(
      {
        order: null,
        stripeCheckoutUrl: null,
        success: false,
        error: "Failed to fetch pending order",
      },
      { status: 500 }
    );
  }
}
