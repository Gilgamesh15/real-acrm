import * as schema from "db/schema";
import { eq, inArray } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { z } from "zod";

import { ReturnRequestAdminEmail } from "~/components/emails/return-request-admin-email";
import { ReturnRequestCustomerEmail } from "~/components/emails/return-request-customer-email";
import { db } from "~/lib/db";
import { resend } from "~/lib/resend";

const CreateReturnSchema = z.object({
  orderId: z.string().uuid(),
  orderItemIds: z.array(z.string().uuid()).min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email(),
});

const ERROR_MESSAGE =
  "Przepraszamy za niedogodności. Spróbuj ponownie przesłać formularz. Jeśli problem się powtarza, skontaktuj się z nami pod adresem kontakt@acrm.pl";

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;
  const formData = await request.formData();

  const parsed = CreateReturnSchema.safeParse({
    orderId: formData.get("orderId"),
    orderItemIds: formData.getAll("orderItemIds"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
  });

  if (!parsed.success) {
    logger.error("Invalid return data", { errors: parsed.error.flatten() });
    return data({ success: false, error: ERROR_MESSAGE }, { status: 400 });
  }

  const { orderId, orderItemIds, customerName, customerPhone, customerEmail } =
    parsed.data;

  try {
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
      with: {
        items: {
          with: {
            piece: true,
          },
        },
      },
    });

    if (!order) {
      logger.error("Order not found for return", { orderId });
      return data({ success: false, error: ERROR_MESSAGE }, { status: 404 });
    }

    // Validate all orderItemIds belong to this order
    const validItemIds = order.items.map((i) => i.id);
    const allValid = orderItemIds.every((id) => validItemIds.includes(id));
    if (!allValid) {
      logger.error("Invalid order item IDs", { orderItemIds, validItemIds });
      return data({ success: false, error: ERROR_MESSAGE }, { status: 400 });
    }

    // Validate items are in "sold" status
    const selectedItems = order.items.filter((item) =>
      orderItemIds.includes(item.id)
    );
    const allSold = selectedItems.every(
      (item) => item.piece.status === "sold"
    );
    if (!allSold) {
      logger.error("Some items are not in sold status", {
        items: selectedItems.map((i) => ({
          id: i.id,
          status: i.piece.status,
        })),
      });
      return data({ success: false, error: ERROR_MESSAGE }, { status: 400 });
    }

    // Update piece statuses to "return_requested"
    const pieceIds = selectedItems.map((item) => item.pieceId);
    await db
      .update(schema.pieces)
      .set({ status: "return_requested" })
      .where(inArray(schema.pieces.id, pieceIds));

    // Prepare email data
    const emailItems = selectedItems.map((item) => ({
      name: item.piece.name,
      lineTotalInGrosz: item.lineTotalInGrosz,
    }));
    const totalRefundInGrosz = selectedItems.reduce(
      (sum, item) => sum + item.lineTotalInGrosz,
      0
    );

    // Send admin email
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: process.env.COMPANY_EMAIL!,
        subject: `ACRM - Nowe zgłoszenie zwrotu #${order.orderNumber}`,
        react: (
          <ReturnRequestAdminEmail
            orderNumber={order.orderNumber}
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            items={emailItems}
            totalRefundInGrosz={totalRefundInGrosz}
          />
        ),
      });
    } catch (emailError) {
      logger.error("Failed to send admin return email", { err: emailError });
    }

    // Send customer confirmation email
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: customerEmail,
        subject: `ACRM - Potwierdzenie zgłoszenia zwrotu #${order.orderNumber}`,
        react: (
          <ReturnRequestCustomerEmail
            orderNumber={order.orderNumber}
            items={emailItems}
            totalRefundInGrosz={totalRefundInGrosz}
          />
        ),
      });
    } catch (emailError) {
      logger.error("Failed to send customer return email", {
        err: emailError,
      });
    }

    return data({ success: true });
  } catch (error) {
    logger.error("Failed to create return", { error });
    return data({ success: false, error: ERROR_MESSAGE }, { status: 500 });
  }
}
