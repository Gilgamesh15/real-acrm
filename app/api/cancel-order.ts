import { orderService } from "db/services/order.service";
import { type ActionFunctionArgs, data } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;
  const { session } = context;
  const userId = session?.user.id;

  if (!userId) {
    return data(
      { success: false, error: "User not authenticated" },
      { status: 401 }
    );
  }

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
