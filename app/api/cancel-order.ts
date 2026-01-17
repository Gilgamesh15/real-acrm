import { orderService } from "db/services/order.service";
import { type ActionFunctionArgs, data } from "react-router";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const userId = session.user.id;

  try {
    const { orderId } = (await request.json()) as {
      orderId: string;
    };

    if (!orderId) {
      return data(
        { success: false, error: "Order ID required" },
        { status: 400 }
      );
    }

    await orderService.cancelOrder(orderId);

    logger.info("Order cancelled successfully", { orderId, userId });

    return data({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Failed to cancel order", { error, userId });
    return data(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
