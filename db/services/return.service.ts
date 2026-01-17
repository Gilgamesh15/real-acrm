import * as schema from "db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import z from "zod";

import { db } from "~/lib/db";
import type { Logger } from "~/lib/logger.server";
import { logger } from "~/lib/logger.server";
import type { DBQueryArgs, DBQueryResult } from "~/lib/types";
import { createIdentificationNumber } from "~/lib/utils";

class ReturnService {
  constructor(private logger: Logger) {}

  async findMany<TArgs extends DBQueryArgs<"returns", "many">>(
    args: TArgs = {} as TArgs
  ) {
    return (await db.query.returns.findMany({
      ...args,
    })) as DBQueryResult<"returns", TArgs>[];
  }

  async findByReturnNumber<TArgs extends DBQueryArgs<"returns", "one">>(
    returnNumber: string,
    args: TArgs = {} as TArgs
  ) {
    return (await db.query.returns.findFirst({
      where: eq(schema.returns.returnNumber, returnNumber),
      ...args,
    })) as DBQueryResult<"returns", TArgs>;
  }

  async findById<TArgs extends DBQueryArgs<"returns", "one">>(
    id: string,
    args: TArgs = {} as TArgs
  ) {
    return (await db.query.returns.findFirst({
      where: eq(schema.returns.id, id),
      ...args,
    })) as DBQueryResult<"returns", TArgs>;
  }

  static MarkItemAsReturnedSchema = z.object({
    returnId: z.string(),
    itemId: z.string(),
  });

  async markItemAsAccepted(
    rawArgs: z.infer<typeof ReturnService.MarkItemAsReturnedSchema>
  ) {
    try {
      const parse = ReturnService.MarkItemAsReturnedSchema.safeParse(rawArgs);
      if (!parse.success) {
        this.logger.warn("Invalid input for markItemAsReturned", {
          issues: parse.error.issues,
        });
        return {
          success: false,
          message: "Invalid input",
          status: 400,
          data: null,
        };
      }

      const { returnId, itemId } = parse.data;

      const returnItem = await db.query.returnItems.findFirst({
        where: eq(schema.returnItems.id, itemId),
      });

      if (!returnItem) {
        this.logger.warn("Return item not found", { returnId, itemId });
        return {
          success: false,
          message: "Return item not found",
          status: 404,
          data: null,
        };
      }

      await db.insert(schema.returnTimelineEvents).values({
        returnItemId: itemId,
        status: "accepted",
        timestamp: new Date(),
      });

      return {
        success: true,
        message: "Item marked as accepted",
        status: 200,
        data: null,
      };
    } catch (error) {
      this.logger.error("Error marking item as returned", { error });
      return {
        success: false,
        message: "Error marking item as returned",
        status: 500,
        data: null,
      };
    }
  }

  static MarkItemAsRejectedSchema = z.object({
    returnId: z.string(),
    itemId: z.string(),
  });

  async markItemAsRejected(
    rawArgs: z.infer<typeof ReturnService.MarkItemAsRejectedSchema>
  ) {
    try {
      const parse = ReturnService.MarkItemAsRejectedSchema.safeParse(rawArgs);
      if (!parse.success) {
        this.logger.warn("Invalid input for markItemAsRejected", {
          issues: parse.error.issues,
        });
        return {
          success: false,
          message: "Invalid input",
          status: 400,
          data: null,
        };
      }

      const { returnId, itemId } = parse.data;

      const returnItem = await db.query.returnItems.findFirst({
        where: eq(schema.returnItems.id, itemId),
      });

      if (!returnItem) {
        this.logger.warn("Return item not found", { returnId, itemId });
        return {
          success: false,
          message: "Return item not found",
          status: 404,
          data: null,
        };
      }

      await db.insert(schema.returnTimelineEvents).values({
        returnItemId: itemId,
        status: "rejected",
        timestamp: new Date(),
      });

      return {
        success: true,
        message: "Item marked as rejected",
        status: 200,
        data: null,
      };
    } catch (error) {
      this.logger.error("Error marking item as rejected", { error });
      return {
        success: false,
        message: "Error marking item as rejected",
        status: 500,
        data: null,
      };
    }
  }

  static ValidateReturnOrderSchema = z.object({
    orderNumber: z.string(),
    email: z.string().email(),
  });

  async validateReturnOrder(
    rawArgs: z.infer<typeof ReturnService.ValidateReturnOrderSchema>
  ) {
    try {
      const parse = ReturnService.ValidateReturnOrderSchema.safeParse(rawArgs);
      if (!parse.success) {
        this.logger.warn("Invalid input for validateReturnOrder", {
          issues: parse.error.issues,
        });
        return {
          success: false,
          message: "Invalid input",
          status: 400,
          data: null,
        };
      }

      const { orderNumber, email } = parse.data;

      // Find order by orderNumber and email
      const order = await db.query.orders.findFirst({
        where: and(
          eq(schema.orders.orderNumber, orderNumber),
          eq(schema.orders.email, email)
        ),
        with: {
          events: {
            orderBy: desc(schema.orderTimelineEvents.timestamp),
          },
          items: {
            with: {
              product: true,
              piece: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn("Order not found for return validation", {
          orderNumber,
          email,
        });
        return {
          success: true,
          message: "Order not found or not eligible for return",
          status: 200,
          data: null,
        };
      }

      // Check if order is eligible for return
      // Order should be delivered (have a "delivered" timeline event)
      const hasDeliveredEvent = order.events.some(
        (event) => event.status === "delivered"
      );

      if (!hasDeliveredEvent) {
        this.logger.warn("Order not delivered, not eligible for return", {
          orderId: order.id,
        });
        return {
          success: true,
          message: "Order not eligible for return",
          status: 200,
          data: null,
        };
      }

      // Check if order already has a return
      const existingReturn = await db.query.returns.findFirst({
        where: eq(schema.returns.orderId, order.id),
      });

      if (existingReturn) {
        this.logger.warn("Order already has a return", { orderId: order.id });
        return {
          success: true,
          message: "Order already has a return",
          status: 200,
          data: null,
        };
      }

      this.logger.info("Order validated for return", { orderId: order.id });
      return {
        success: true,
        message: "Order is eligible for return",
        status: 200,
        data: order,
      };
    } catch (error) {
      this.logger.error("Error validating return order", { error });
      return {
        success: false,
        message: "Error validating return order",
        status: 500,
        data: null,
      };
    }
  }

  static CreateReturnSchema = z.object({
    orderId: z.string().uuid(),
    orderItemIds: z.array(z.string().uuid()),
    personalInfo: z.object({
      firstName: z.string(),
      lastName: z.string(),
      phoneNumber: z.string(),
      email: z.string().email(),
    }),
    address: z.object({
      city: z.string(),
      country: z.string().default("PL"),
      line1: z.string(),
      line2: z.string().optional(),
      postalCode: z.string(),
      state: z.string(),
    }),
  });

  async createReturn(
    rawArgs: z.infer<typeof ReturnService.CreateReturnSchema>
  ) {
    try {
      const parse = ReturnService.CreateReturnSchema.safeParse(rawArgs);
      if (!parse.success) {
        this.logger.warn("Invalid input for createReturn", {
          issues: parse.error.issues,
        });
        return {
          success: false,
          message: "Invalid input",
          status: 400,
          data: null,
        };
      }

      const { orderId, orderItemIds, personalInfo, address } = parse.data;

      // Verify order exists
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: {
          items: {
            where: inArray(schema.orderItems.id, orderItemIds),
            with: {
              product: true,
              piece: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn("Order not found for return creation", { orderId });
        return {
          success: false,
          message: "Order not found",
          status: 404,
          data: null,
        };
      }

      if (order.items.length !== orderItemIds.length) {
        this.logger.warn("Some order items not found", {
          orderId,
          requestedItems: orderItemIds.length,
          foundItems: order.items.length,
        });
        return {
          success: false,
          message: "Some order items not found",
          status: 400,
          data: null,
        };
      }

      let returnId: string = "";
      let returnNumber: string = "";

      await db.transaction(async (tx) => {
        // Create return record
        returnNumber = "ZWR-" + createIdentificationNumber();
        const [createdReturn] = await tx
          .insert(schema.returns)
          .values({
            returnNumber,
            orderId,
            userId: order.userId ?? undefined,
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            phoneNumber: personalInfo.phoneNumber,
            email: personalInfo.email,
            city: address.city,
            country: address.country,
            line1: address.line1,
            line2: address.line2 ?? null,
            postalCode: address.postalCode,
            state: address.state,
          })
          .returning();

        if (!createdReturn) {
          throw new Error("Failed to create return");
        }

        returnId = createdReturn.id;

        // Create returnItems for each orderItemId
        const returnItemsData = orderItemIds.map((orderItemId) => ({
          returnId: createdReturn.id,
          orderItemId,
        }));

        await tx.insert(schema.returnItems).values(returnItemsData);

        // Create returnTimelineEvents with status "pending" for each returnItem
        const createdReturnItems = await tx.query.returnItems.findMany({
          where: eq(schema.returnItems.returnId, createdReturn.id),
        });

        await tx.insert(schema.returnTimelineEvents).values(
          createdReturnItems.map((item) => ({
            returnItemId: item.id,
            status: "pending" as const,
            timestamp: new Date(),
          }))
        );

        // Update product/piece statuses to "return_requested"
        const productIds: string[] = [];
        const pieceIds: string[] = [];

        for (const item of order.items) {
          if (item.productId) {
            productIds.push(item.productId);
          }
          if (item.pieceId) {
            pieceIds.push(item.pieceId);
          }
        }

        if (productIds.length > 0) {
          await tx
            .update(schema.products)
            .set({ status: "return_requested" })
            .where(inArray(schema.products.id, productIds));
        }

        if (pieceIds.length > 0) {
          await tx
            .update(schema.pieces)
            .set({ status: "return_requested" })
            .where(inArray(schema.pieces.id, pieceIds));
        }

        // Note: Order status enum doesn't have "return_requested",
        // so we'll use "pending" or skip this if not needed
        // The return itself tracks the return status
      });

      this.logger.info("Return created successfully", { returnId, orderId });
      return {
        success: true,
        message: "Return created successfully",
        status: 200,
        data: { returnId, returnNumber },
      };
    } catch (error) {
      this.logger.error("Error creating return", { error });
      return {
        success: false,
        message: "Error creating return",
        status: 500,
        data: null,
      };
    }
  }
}

const returnService = new ReturnService(
  logger.child({ service: "ReturnService" })
);

export { returnService, ReturnService };
