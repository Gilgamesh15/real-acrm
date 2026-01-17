import * as schema from "db/schema";
import { eq, inArray } from "drizzle-orm";
import { type ActionFunctionArgs, data } from "react-router";
import { z } from "zod";

import { db } from "~/lib/db";
import { createIdentificationNumber } from "~/lib/utils";

const CreateReturnSchema = z.object({
  orderId: z.string().uuid(),
  orderItemIds: z.array(z.string().uuid()).min(1),
  email: z.string().email(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const parsed = CreateReturnSchema.safeParse({
    orderId: formData.get("orderId"),
    orderItemIds: formData.getAll("orderItemIds"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return data({ success: false, error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const { orderId, orderItemIds, email } = parsed.data;

  // Fetch order and validate
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, orderId),
    with: { items: true },
  });

  if (!order) {
    return data(
      { success: false, error: "Zamówienie nie znalezione" },
      { status: 404 }
    );
  }

  // Validate all orderItemIds belong to this order
  const validItemIds = order.items.map((i) => i.id);
  const allValid = orderItemIds.every((id) => validItemIds.includes(id));
  if (!allValid) {
    return data(
      { success: false, error: "Nieprawidłowe przedmioty" },
      { status: 400 }
    );
  }

  // Get personal info and address from the order
  // Use billing address as the return address
  const firstName = order.deliveryName?.split(" ")[0] ?? "";
  const lastName = order.deliveryName?.split(" ").slice(1).join(" ") ?? "";
  const phoneNumber = order.phoneNumber ?? "";
  const city = order.billingAddressCity ?? "";
  const country = order.billingAddressCountry ?? "PL";
  const line1 = order.billingAddressLine1 ?? "";
  const line2 = order.billingAddressLine2 ?? null;
  const postalCode = order.billingAddressPostalCode ?? "";
  const state = order.billingAddressCity ?? ""; // Using city as state since Poland doesn't use states

  // Create return in transaction
  const returnNumber = "ZWR-" + createIdentificationNumber();

  try {
    await db.transaction(async (tx) => {
      // Create return record
      const [createdReturn] = await tx
        .insert(schema.returns)
        .values({
          returnNumber,
          orderId,
          userId: order.userId,
          email,
          firstName,
          lastName,
          phoneNumber,
          city,
          country,
          line1,
          line2,
          postalCode,
          state,
        })
        .returning();

      if (!createdReturn) {
        throw new Error("Failed to create return");
      }

      // Create return items
      await tx.insert(schema.returnItems).values(
        orderItemIds.map((orderItemId) => ({
          returnId: createdReturn.id,
          orderItemId,
        }))
      );

      // Create timeline events for each return item
      const createdItems = await tx.query.returnItems.findMany({
        where: eq(schema.returnItems.returnId, createdReturn.id),
      });

      await tx.insert(schema.returnTimelineEvents).values(
        createdItems.map((item) => ({
          returnItemId: item.id,
          status: "pending" as const,
        }))
      );

      // Update piece statuses
      const pieceIds = order.items
        .filter((item) => orderItemIds.includes(item.id))
        .map((item) => item.pieceId);

      await tx
        .update(schema.pieces)
        .set({ status: "return_requested" })
        .where(inArray(schema.pieces.id, pieceIds));
    });

    return data({ success: true, returnNumber });
  } catch (error) {
    console.error("Failed to create return:", error);
    return data(
      { success: false, error: "Nie udało się utworzyć wniosku o zwrot" },
      { status: 500 }
    );
  }
}
