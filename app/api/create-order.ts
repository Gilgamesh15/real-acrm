import { orderService } from "db/services/order.service";
import { type ActionFunctionArgs, data } from "react-router";
import type z from "zod";

import { auth } from "~/lib/auth.server";
import { CreateOrderSchema } from "~/lib/schemas";

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;
  const { session } = context;

  let userId = session?.user.id;

  let anonomousHeaders: Headers | null = null;

  if (!userId) {
    logger.info("No session, creating anonymous session for order");
    const { response, headers } = await auth.api.signInAnonymous({
      headers: request.headers,
      returnHeaders: true,
    });

    anonomousHeaders = headers;

    userId = response?.user?.id;
  }

  const args = (await request.json()) as z.infer<typeof CreateOrderSchema>;

  logger.debug("Creating order with the following args:", { args });
  logger.info("Creating order IDENTIFICATION", { args });

  const result = await orderService.createOrder(args, userId);

  if ("issues" in result) {
    throw data(result, {
      status: 400,
      headers: anonomousHeaders ?? undefined,
    });
  }

  return data(result, {
    headers: anonomousHeaders ?? undefined,
  });
}
