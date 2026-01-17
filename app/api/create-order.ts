import { orderService } from "db/services/order.service";
import { type ActionFunctionArgs } from "react-router";
import type z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { CreateOrderSchema } from "~/lib/schemas";

export async function action({ request, context }: ActionFunctionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);

  const userId = session.user.id;

  const args = (await request.json()) as z.infer<typeof CreateOrderSchema>;

  logger.debug("Creating order with the following args:", { args });
  logger.info("Creating order IDENTIFICATION", { args });
  return await orderService.createOrder(args, userId);
}
