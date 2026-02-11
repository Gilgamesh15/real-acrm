import { and, desc, eq, inArray } from "drizzle-orm";
import { data } from "react-router";
import Stripe from "stripe";

import * as schema from "~/../db/schema";
import { OrderConfirmationEmail } from "~/components/emails/order-confirmation-email";
import { type DbTransactionClient, db } from "~/lib/db";
import type { Logger } from "~/lib/logger.server";
import { logger } from "~/lib/logger.server";
import { resend } from "~/lib/resend";
import type { CreateOrderSchemaType } from "~/lib/schemas";
import { stripe } from "~/lib/stripe";
import type { DBQueryResult } from "~/lib/types";
import {
  calculatePiecePrice,
  createIdentificationNumber,
  orderDetailsFromOrder,
  orderStatusFromOrder,
} from "~/lib/utils";

const APP_URL = process.env.VITE_APP_URL;

class OrderService {
  constructor(private logger: Logger) {}

  // ========================== COMPLETE ORDER ==========================
  async completeOrder(stripeSessionId: string) {
    try {
      this.logger.info("Starting order completion", { stripeSessionId });

      const transactionResult = await db.transaction(async (tx) => {
        this.logger.debug("Starting order completion transaction", {
          stripeSessionId,
        });

        // 1. Get the order with all necessary relations
        const order = await tx.query.orders.findFirst({
          where: eq(schema.orders.stripeCheckoutSessionId, stripeSessionId),
          with: {
            items: {
              with: {
                piece: true,
                product: true,
              },
            },
            events: {
              orderBy: desc(schema.orderTimelineEvents.timestamp),
            },
          },
        });

        if (!order) {
          this.logger.error("Order not found", { stripeSessionId });
          throw data(
            {
              success: false,
              order: null,
              issues: null,
              message: "Order not found",
            },
            { status: 404 }
          );
        }

        // Check for idempotency - if order already has a "processing" or "completed" event
        const existingCompletion = order.events.find(
          (e) => e.status === "processing"
        );
        if (existingCompletion) {
          this.logger.warn("Order already processed, skipping", {
            stripeSessionId,
            orderId: order.id,
            existingStatus: existingCompletion.status,
          });
          // Return special marker to indicate already processed
          return { alreadyProcessed: true, orderId: order.id };
        }

        // Extract userId from order (not passed as param since webhook won't have it)
        const userId = order.userId;

        this.logger.debug("Order found", {
          stripeSessionId,
          orderId: order.id,
          userId,
          itemCount: order.items.length,
        });

        const orderStatus = orderStatusFromOrder(order);

        // 2. Validate that order is pending
        if (orderStatus !== "pending") {
          this.logger.error("Order is not in pending status", {
            stripeSessionId,
            orderId: order.id,
            currentStatus: orderStatus,
          });
          throw data(
            {
              success: false,
              order: null,
              issues: null,
              message: `Order is not pending (current status: ${orderStatus})`,
            },
            { status: 400 }
          );
        }

        this.logger.debug("Order status validated as pending", {
          stripeSessionId,
          orderId: order.id,
        });

        this.logger.info("Retrieving Stripe checkout session data", {
          stripeSessionId,
          orderId: order.id,
        });

        const stripeSession = await stripe.checkout.sessions.retrieve(
          stripeSessionId,
          {
            expand: ["customer", "customer_details", "collected_information"],
          }
        );

        this.logger.debug("Stripe session data retrieved", {
          stripeSessionId,
          hasCustomerDetails: !!stripeSession.customer_details,
          hasShipping: !!stripeSession.collected_information?.shipping_details,
        });

        const issuesBuilder = new CompleteOrderIssues();

        // 3. Validate that products are in checkout
        for (const item of order.items) {
          if (item.product && item.product.status !== "in_checkout") {
            issuesBuilder.addCompleteIssueProductNotInCheckout(
              { productId: item.product.id, productName: item.product.name },
              item.product.status
            );
          }
        }

        // 5. Validate that standalone pieces are in checkout
        for (const item of order.items) {
          if (item.piece.status !== "in_checkout") {
            issuesBuilder.addCompleteIssuePieceNotInCheckout(
              { pieceId: item.piece.id, pieceName: item.piece.name },
              item.piece.status
            );
          }
        }

        // 6. Validate that pieces are reserved by this specific user
        for (const item of order.items) {
          if (item.piece.reservedByUserId !== userId) {
            issuesBuilder.addCompleteIssuePieceNotReservedByUser(
              { pieceId: item.piece.id, pieceName: item.piece.name },
              userId,
              item.piece.reservedByUserId
            );
          }
        }

        // Check for piece/product validation issues before Stripe validation
        if (issuesBuilder.hasIssues()) {
          const issues = issuesBuilder.getIssues();
          this.logger.error("Order completion validation failed", {
            stripeSessionId,
            orderId: order.id,
            issueCount: issues.length,
            issues,
          });
          throw data(
            {
              success: false,
              order: null,
              issues,
              message: "Order validation failed",
            },
            { status: 400 }
          );
        }

        this.logger.info("Piece/product validations passed", {
          stripeSessionId,
          orderId: order.id,
        });

        const pieceIds = order.items.map((item) => item.pieceId);
        const productIds = order.items
          .filter((item) => item.product)
          .map((item) => item.productId)
          .filter((id): id is string => id !== null && id !== undefined);

        this.logger.debug("Processing order items", {
          stripeSessionId,
          orderId: order.id,
          productCount: productIds.length,
          pieceCount: pieceIds.length,
        });

        // 1. Mark all products as sold
        if (productIds.length > 0) {
          await tx
            .update(schema.products)
            .set({ status: "sold" })
            .where(inArray(schema.products.id, productIds));

          this.logger.info("Products marked as sold", {
            stripeSessionId,
            orderId: order.id,
            productIds,
          });
        }

        // 2. Mark all pieces as sold (keep reservation fields as-is per requirements)
        if (pieceIds.length > 0) {
          await tx
            .update(schema.pieces)
            .set({ status: "sold" })
            .where(inArray(schema.pieces.id, pieceIds));

          this.logger.info("Pieces marked as sold", {
            stripeSessionId,
            orderId: order.id,
            pieceIds,
          });
        }

        // Extract Stripe data
        const customerDetails = stripeSession.customer_details;
        const shippingDetails =
          stripeSession.collected_information?.shipping_details;

        // Create a new issues builder for Stripe validation
        const stripeIssuesBuilder = new CompleteOrderIssues();

        // Validate delivery method
        const deliveryMethod = order.deliveryMethod;
        if (!deliveryMethod) {
          stripeIssuesBuilder.addStripeDataMissing("deliveryMethod");
        } else if (
          deliveryMethod !== "courier" &&
          deliveryMethod !== "locker"
        ) {
          stripeIssuesBuilder.addDeliveryMethodInvalid(deliveryMethod);
        }

        // Validate required customer details
        if (!customerDetails?.name) {
          stripeIssuesBuilder.addStripeDataMissing("customerName");
        }
        if (!customerDetails?.email) {
          stripeIssuesBuilder.addStripeDataMissing("customerEmail");
        }
        if (!customerDetails?.phone) {
          stripeIssuesBuilder.addStripeDataMissing("customerPhone");
        }

        // Validate billing address
        if (!customerDetails?.address?.city) {
          stripeIssuesBuilder.addStripeDataMissing("billingAddressCity");
        }
        if (!customerDetails?.address?.country) {
          stripeIssuesBuilder.addStripeDataMissing("billingAddressCountry");
        }
        if (!customerDetails?.address?.line1) {
          stripeIssuesBuilder.addStripeDataMissing("billingAddressLine1");
        }
        if (!customerDetails?.address?.postal_code) {
          stripeIssuesBuilder.addStripeDataMissing("billingAddressPostalCode");
        }

        // Validate delivery-method-specific requirements
        if (deliveryMethod === "courier") {
          if (!shippingDetails?.name) {
            stripeIssuesBuilder.addStripeDataMissing("shippingName");
          }
          if (!shippingDetails?.address?.city) {
            stripeIssuesBuilder.addStripeDataMissing("shippingAddressCity");
          }
          if (!shippingDetails?.address?.country) {
            stripeIssuesBuilder.addStripeDataMissing("shippingAddressCountry");
          }
          if (!shippingDetails?.address?.line1) {
            stripeIssuesBuilder.addStripeDataMissing("shippingAddressLine1");
          }
          if (!shippingDetails?.address?.postal_code) {
            stripeIssuesBuilder.addStripeDataMissing(
              "shippingAddressPostalCode"
            );
          }
        } else if (deliveryMethod === "locker") {
          // For locker delivery, we need the locker code from order (should be set pre-checkout)
          if (!order.lockerCode) {
            stripeIssuesBuilder.addStripeDataMissing("lockerCode");
          }
          // Delivery name should come from shipping details or fall back to billing name
          if (!shippingDetails?.name && !customerDetails?.name) {
            stripeIssuesBuilder.addStripeDataMissing("deliveryName");
          }
        }

        // Check for Stripe validation issues
        if (stripeIssuesBuilder.hasIssues()) {
          const stripeIssues = stripeIssuesBuilder.getIssues();
          this.logger.error("Stripe data validation failed", {
            stripeSessionId,
            orderId: order.id,
            issueCount: stripeIssues.length,
            issues: stripeIssues,
          });
          throw data(
            {
              success: false,
              order: null,
              issues: stripeIssues,
              message: "Stripe data validation failed",
            },
            { status: 400 }
          );
        }

        this.logger.info("All validations passed", {
          stripeSessionId,
          orderId: order.id,
        });

        // 3. Update order with Stripe data (fields validated above)
        await tx
          .update(schema.orders)
          .set({
            // Personal information
            billingName: customerDetails!.name!,
            deliveryName: shippingDetails?.name ?? customerDetails!.name!,
            email: customerDetails!.email!,
            phoneNumber: customerDetails!.phone!,

            // Billing information
            billingAddressCity: customerDetails!.address!.city!,
            billingAddressCountry: customerDetails!.address!.country!,
            billingAddressLine1: customerDetails!.address!.line1!,
            billingAddressLine2: customerDetails!.address?.line2 ?? null,
            billingAddressPostalCode: customerDetails!.address!.postal_code!,

            // Shipping/delivery information (only for courier)
            ...(deliveryMethod === "courier" && {
              shippingAddressCity: shippingDetails!.address!.city!,
              shippingAddressCountry: shippingDetails!.address!.country!,
              shippingAddressLine1: shippingDetails!.address!.line1!,
              shippingAddressLine2: shippingDetails!.address?.line2 ?? null,
              shippingAddressPostalCode: shippingDetails!.address!.postal_code!,
            }),
          })
          .where(eq(schema.orders.id, order.id));

        this.logger.info(
          "Order updated with Stripe customer and shipping details",
          { stripeSessionId, orderId: order.id, deliveryMethod }
        );

        // 4. Create processing order event
        await tx.insert(schema.orderTimelineEvents).values({
          orderId: order.id,
          status: "processing",
        });

        this.logger.info("Order marked as processing", {
          stripeSessionId,
          orderId: order.id,
        });
        return { alreadyProcessed: false, orderId: order.id };
      });

      // Handle idempotency - order was already processed
      if (transactionResult.alreadyProcessed) {
        return data(
          {
            success: true,
            order: null,
            issues: null,
            message: "Order already processed",
            alreadyProcessed: true,
          },
          { status: 200 }
        );
      }

      const orderId = transactionResult.orderId;

      // 5. Fetch the completed order with images for email
      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: {
          items: {
            with: {
              product: {
                with: {
                  images: true,
                },
              },
              piece: {
                with: {
                  images: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        this.logger.error(
          "Order not found after transaction - database integrity issue",
          { stripeSessionId, orderId }
        );
        throw data(
          {
            success: false,
            order: null,
            issues: null,
            message:
              "Order not found after transaction - database integrity issue",
          },
          { status: 500 }
        );
      }

      // 6. Send customer confirmation email (blocking)
      this.logger.info("Sending customer confirmation email", {
        stripeSessionId,
        orderId: order.id,
      });

      const orderDetails = orderDetailsFromOrder(order);

      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL!,
          to: orderDetails.email,
          subject: `ACRM - Potwierdzenie zamówienia #${order.orderNumber}`,
          react: <OrderConfirmationEmail order={order} />,
        });

        this.logger.info("Customer confirmation email sent", {
          stripeSessionId,
          orderId: order.id,
          email: orderDetails.email,
        });
      } catch (emailError) {
        this.logger.error("Failed to send customer confirmation email", {
          err: emailError,
          stripeSessionId,
          orderId: order.id,
        });
        throw data(
          {
            success: false,
            order,
            issues: [
              {
                code: "complete-email-failed",
                message: "Failed to send customer confirmation email",
                errorDetails:
                  emailError instanceof Error
                    ? emailError.message
                    : String(emailError),
              } satisfies CompleteOrderEmailFailedIssue,
            ],
            message: "Failed to send customer confirmation email",
          },
          { status: 500 }
        );
      }

      // 7. Send admin notification email (non-blocking)
      const companyEmail = process.env.COMPANY_EMAIL;
      if (companyEmail) {
        resend.emails
          .send({
            from: process.env.COMPANY_EMAIL!,
            to: companyEmail,
            subject: `Nowe zamówienie - ${order.orderNumber}`,
            html: `
  <p><strong>Nowe zamówienie #${order.orderNumber}</strong></p>
  <p>Email: ${orderDetails.email}</p>
  <p>Przedmioty: ${order.items.length}</p>
  <p>Suma: ${(order.totalInGrosz / 100).toFixed(2)} PLN</p>
`,
          })
          .catch((emailError) => {
            this.logger.error("Failed to send admin notification email", {
              err: emailError,
              stripeSessionId,
              orderId: order.id,
              companyEmail,
            });
          });

        this.logger.info("Admin notification email queued", {
          stripeSessionId,
          orderId: order.id,
          companyEmail,
        });
      } else {
        this.logger.warn("COMPANY_EMAIL not set, skipping admin notification", {
          stripeSessionId,
          orderId: order.id,
        });
      }

      this.logger.info("Order completion finished successfully", {
        stripeSessionId,
        orderId: order.id,
      });

      return data(
        {
          success: true,
          order,
          issues: null,
          message: "Order completed successfully",
        },
        { status: 200 }
      );
    } catch (err) {
      // Re-throw if already a data() response
      if (err && typeof err === "object" && "status" in err) {
        throw err;
      }

      this.logger.error("Failed to complete order ", { err, stripeSessionId });
      throw data(
        {
          success: false,
          order: null,
          issues: null,
          message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
        },
        { status: 500 }
      );
    }
  }

  // ========================== CANCEL ORDER ==========================
  async cancelOrder(orderId: string) {
    try {
      this.logger.info("Starting order cancellation", { orderId });

      await db.transaction(async (tx) => {
        this.logger.debug("Starting order cancellation transaction", {
          orderId,
        });

        // 1. Get the order with its items
        const order = await tx.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          with: {
            items: {
              with: {
                piece: true,
                product: {
                  with: {
                    pieces: true,
                  },
                },
              },
            },
            events: {
              orderBy: desc(schema.orderTimelineEvents.timestamp),
            },
          },
        });

        if (!order) {
          this.logger.error("Order not found for cancellation", { orderId });
          throw data(
            {
              success: false,
              order: null,
              issues: null,
              message: "Order not found",
            },
            { status: 404 }
          );
        }

        this.logger.debug("Order found", {
          orderId,
          itemCount: order.items.length,
        });

        const orderStatus = orderStatusFromOrder(order);

        // 2. Check if order is already cancelled or completed
        if (orderStatus !== "pending") {
          this.logger.error("Cannot cancel order - not in pending status", {
            orderId,
            orderStatus,
          });
          throw data(
            {
              success: false,
              order: null,
              issues: null,
              message: `Order is not pending (current status: ${orderStatus})`,
            },
            { status: 400 }
          );
        }

        // 3. Check if the Stripe session was paid
        if (order.stripeCheckoutSessionId) {
          try {
            const stripeSession = await stripe.checkout.sessions.retrieve(
              order.stripeCheckoutSessionId
            );

            if (stripeSession.payment_status === "paid") {
              this.logger.error(
                "Cannot cancel order - Stripe session is already paid",
                {
                  orderId,
                  stripeCheckoutSessionId: order.stripeCheckoutSessionId,
                  paymentStatus: stripeSession.payment_status,
                }
              );
              throw data(
                {
                  success: false,
                  order: null,
                  issues: null,
                  message:
                    "Cannot cancel order - payment has already been processed",
                },
                { status: 403 }
              );
            }
          } catch (stripeError) {
            // If it's already a data() response (our custom error), re-throw it
            if (
              stripeError &&
              typeof stripeError === "object" &&
              "status" in stripeError
            ) {
              throw stripeError;
            }

            // Log Stripe API errors but continue with cancellation
            // The session might be expired or invalid, which is fine for cancellation
            this.logger.warn(
              "Failed to retrieve Stripe session during cancellation",
              {
                stripeError,
                orderId,
                stripeCheckoutSessionId: order.stripeCheckoutSessionId,
              }
            );
          }
        }

        // 4. Get all piece IDs from order items
        const pieceIds = order.items
          .map((item) => item.pieceId)
          .filter((id): id is string => id !== null && id !== undefined);
        const productIds = order.items
          .map((item) => item.productId)
          .filter((id): id is string => id !== null && id !== undefined);

        this.logger.debug("Releasing order items", {
          orderId,
          pieceCount: pieceIds.length,
          productCount: productIds.length,
        });

        // 5. Release all reserved pieces
        if (pieceIds.length > 0) {
          await tx
            .update(schema.pieces)
            .set({
              reservedUntil: null,
              reservedByUserId: null,
              status: "published",
            })
            .where(
              and(
                inArray(schema.pieces.id, pieceIds),
                eq(schema.pieces.status, "in_checkout")
              )
            );

          this.logger.info("Pieces released and status reset to published", {
            orderId,
            pieceIds,
          });
        }

        // 6. If implementing one-time product purchases, release products too
        if (productIds.length > 0) {
          await tx
            .update(schema.products)
            .set({
              status: "published",
            })
            .where(
              and(
                inArray(schema.products.id, productIds),
                eq(schema.products.status, "in_checkout")
              )
            );

          this.logger.info("Products released and status reset to published", {
            orderId,
            productIds,
          });
        }

        // 7. Create cancellation timeline event
        await tx.insert(schema.orderTimelineEvents).values({
          orderId: order.id,
          status: "cancelled",
        });

        this.logger.info("Order cancelled and items released", {
          orderId,
          pieceIds,
          productIds,
        });
      });

      this.logger.info("Order cancellation completed successfully", {
        orderId,
      });
    } catch (err) {
      // Re-throw if already a data() response
      if (err && typeof err === "object" && "status" in err) {
        throw err;
      }

      this.logger.error("Failed to cancel order", { err, orderId });
      throw data(
        {
          success: false,
          order: null,
          issues: null,
          message: "Failed to cancel order",
        },
        { status: 500 }
      );
    }
  }
  // ========================== CREATE ORDER ==========================

  async createOrder(
    args: CreateOrderSchemaType,
    userId: string | undefined
  ): Promise<
    | {
        order: DBQueryResult<
          "orders",
          {
            with: {
              items: {
                with: {
                  piece: {
                    with: {
                      brand: true;
                      category: true;
                    };
                  };
                  product: true;
                };
              };
            };
          }
        >;
        stripeSession: Stripe.Checkout.Session;
      }
    | {
        issues: CheckoutIssues["issues"];
      }
  > {
    const { pieces: pieceArgs = [], ...opts } = args;

    // Non-blocking: attempt to save default locker if requested
    if (
      userId &&
      opts.deliveryMethod === "locker" &&
      opts.saveLocker &&
      opts.lockerCode
    ) {
      db.update(schema.users)
        .set({ defaultLockerName: opts.lockerCode })
        .where(eq(schema.users.id, userId))
        .then(() => {
          this.logger.info("Default locker saved for user", {
            userId,
            lockerCode: opts.lockerCode,
          });
        })
        .catch((err) => {
          this.logger.error("Failed to save default locker (non-blocking)", {
            err,
            userId,
            lockerCode: opts.lockerCode,
          });
        });
    }

    try {
      this.logger.info("Starting order creation", { pieceArgs, userId });

      const { orderId, stripeSession, issues } = await db.transaction(
        async (tx) => {
          this.logger.debug("Starting order creation transaction", {
            pieceArgs,
          });

          const issuesBuilder = new CheckoutIssues();

          // Sanitization
          const pieces = await tx.query.pieces.findMany({
            where: inArray(
              schema.pieces.id,
              pieceArgs.map((piece) => piece.id)
            ),
            with: {
              discount: {
                columns: { amountOffInGrosz: true, percentOff: true },
              },
              product: {
                with: {
                  discount: {
                    columns: { amountOffInGrosz: true, percentOff: true },
                  },
                },
              },
              brand: true,
              size: true,
              images: true,
            },
          });

          this.logger.debug("Fetched pieces", {
            pieceCount: pieces.length,
          });

          // 1. Check products status - if not published or in_checkout, it's a data integrity issue
          for (const pieceArg of pieceArgs) {
            const productIdArg = pieceArg.productId;
            if (!productIdArg) {
              continue;
            }
            const pieceWithProduct = pieces.find(
              (piece) => piece.product?.id === productIdArg
            );
            if (!pieceWithProduct || !pieceWithProduct.product) {
              issuesBuilder.addIssueProductNotFound(productIdArg);
              continue;
            }

            if (
              pieceWithProduct.product.status !== "published" &&
              pieceWithProduct.product.status !== "in_checkout"
            ) {
              issuesBuilder.addIssueProductStatusInvalid(
                {
                  productId: pieceWithProduct.product.id,
                  productName: pieceWithProduct.product.name,
                },
                pieceWithProduct.product.status
              );
            }
          }

          // 2. Check pieces status - if not published or in_checkout, it's a data integrity issue
          for (const piece of pieces) {
            if (
              piece.status !== "published" &&
              piece.status !== "in_checkout"
            ) {
              issuesBuilder.addIssuePieceStatusInvalid(
                { pieceId: piece.id, pieceName: piece.name },
                piece.status
              );
            }
          }

          // 3. Check pieces are not reserved by another user
          for (const piece of pieces) {
            if (piece.reservedUntil && piece.reservedUntil > new Date()) {
              if (!userId || piece.reservedByUserId !== userId) {
                issuesBuilder.addIssuePieceReserved(
                  { pieceId: piece.id, pieceName: piece.name },
                  piece.reservedUntil
                );
              }
            }
          }

          // Check for any validation issues
          if (issuesBuilder.hasIssues()) {
            const issues = issuesBuilder.getIssues();
            this.logger.error("Order creation validation failed", {
              issueCount: issues.length,
              issues,
            });

            return {
              issues,
              orderId: null,
              stripeSession: null,
            };
          }

          // Pre-generate order ID for use in order creation and Stripe metadata
          const orderId = crypto.randomUUID();

          this.logger.info(
            "All validations passed, proceeding with order creation",
            { userId, orderId }
          );

          const sessionExpiresAt = new Date(Date.now() + 60 * 30 * 1000); // 30 minutes

          // Update reservations
          await tx
            .update(schema.pieces)
            .set({
              reservedUntil: sessionExpiresAt,
              reservedByUserId: userId ?? null,
              status: "in_checkout",
            })
            .where(
              inArray(
                schema.pieces.id,
                pieces.map((piece) => piece.id)
              )
            );

          await tx
            .update(schema.products)
            .set({
              status: "in_checkout",
            })
            .where(
              inArray(
                schema.products.id,
                pieceArgs
                  .map((piece) => piece.productId)
                  .filter((id): id is string => id !== null && id !== undefined)
              )
            );

          this.logger.info("Pieces reserved for user", {
            pieceIds: pieces.map((piece) => piece.id),
            userId,
            sessionExpiresAt,
          });

          const orderItems: Omit<
            typeof schema.orderItems.$inferInsert,
            "orderId"
          >[] = [];

          for (const piece of pieces) {
            const isWithProduct = pieceArgs.some(
              (pieceArg) => pieceArg.productId === piece.productId
            );

            // For standalone pieces, null out product so only piece discount applies.
            // For pieces with product, calculatePiecePrice applies both discounts
            // (piece discount first, then product discount on the result).
            const priceData = calculatePiecePrice(
              isWithProduct ? piece : { ...piece, product: null }
            );

            orderItems.push({
              pieceId: piece.id,
              ...(isWithProduct && piece.product
                ? { productId: piece.product.id }
                : {}),
              discountAmountInGrosz: priceData.discountAmountInGrosz,
              taxInGrosz: priceData.taxInGrosz,
              lineTotalInGrosz: priceData.lineTotalInGrosz,
              unitPriceInGrosz: priceData.unitPriceInGrosz,
            });
          }

          const orderNumber = createIdentificationNumber();
          const subtotalInGrosz = orderItems.reduce(
            (acc, item) =>
              acc + item.lineTotalInGrosz + item.discountAmountInGrosz,
            0
          );
          const taxInGrosz = orderItems.reduce(
            (acc, item) => acc + item.taxInGrosz,
            0
          );
          const totalDiscountInGrosz = orderItems.reduce(
            (acc, item) => acc + item.discountAmountInGrosz,
            0
          );
          const totalInGrosz = orderItems.reduce(
            (acc, item) => acc + item.lineTotalInGrosz,
            0
          );

          const orderData: typeof schema.orders.$inferInsert = {
            id: orderId,
            userId: userId ?? null,
            orderNumber: orderNumber,
            subtotalInGrosz,
            taxInGrosz,
            totalDiscountInGrosz,
            totalInGrosz,
            deliveryMethod: opts.deliveryMethod,
            lockerCode:
              opts.deliveryMethod === "locker" ? opts.lockerCode : null,
          };

          const createdOrder = await tx
            .insert(schema.orders)
            .values(orderData)
            .returning()
            .then((order) => order[0]);

          const createdOrderItems = await tx
            .insert(schema.orderItems)
            .values(
              orderItems.map((item) => ({
                ...item,
                orderId: createdOrder.id,
              }))
            )
            .returning();

          // Create order timeline event (pending status)
          await tx.insert(schema.orderTimelineEvents).values({
            orderId: createdOrder.id,
            status: "pending",
          });

          this.logger.info("Order created successfully", {
            orderId: createdOrder.id,
            orderNumber,
            totalInGrosz,
            itemCount: orderItems.length,
            deliveryMethod: opts.deliveryMethod,
          });

          this.logger.info("Creating Stripe checkout session", {
            orderId: createdOrder.id,
            userId,
          });

          const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

          for (const item of createdOrderItems) {
            const piece = pieces.find((p) => p.id === item.pieceId);
            if (!piece) {
              this.logger.warn(
                "Piece not found for Stripe line item - data inconsistency",
                { pieceId: item.pieceId, orderId: createdOrder.id }
              );
              continue;
            }

            const name =
              item.productId && piece.product
                ? `${piece.name} (${piece.product.name})`
                : piece.name;

            lineItems.push({
              price_data: {
                currency: "pln",
                product_data: {
                  name,
                  images: piece.images.map((image) => image.url),
                  description: `${piece.size.name} - ${piece.brand.name}`,
                },
                unit_amount: item.lineTotalInGrosz,
              },
              quantity: 1,
            });
          }

          this.logger.info("Created line items", {
            orderId: createdOrder.id,
            lineItemCount: lineItems.length,
          });

          let sessionArgs: Stripe.Checkout.SessionCreateParams = {
            mode: "payment",
            currency: "pln",
            locale: "pl",
            expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
            line_items: lineItems,
            allow_promotion_codes: true,
            phone_number_collection: {
              enabled: true,
            },
            billing_address_collection: "required",
            shipping_address_collection:
              opts.deliveryMethod === "courier"
                ? {
                    allowed_countries: ["PL"],
                  }
                : undefined,
            metadata: {
              orderId: createdOrder.id,
            },
            name_collection: {
              individual: {
                enabled: true,
              },
            },
            success_url: `${APP_URL}/zamowienie/${createdOrder.orderNumber}/sukces`,
            cancel_url: `${APP_URL}/`,
            //consent_collection: {
            //  terms_of_service: "required",
            //},
          };

          if (userId) {
            const user = await tx.query.users.findFirst({
              where: eq(schema.users.id, userId),
            });

            if (user && !user.isAnonymous) {
              const stripeCustomerId = await this.confirmStripeCustomerId(
                userId,
                tx
              );

              sessionArgs = {
                ...sessionArgs,
                customer: stripeCustomerId,
                billing_address_collection: "required",
                customer_update: {
                  address: "auto",
                  name: "auto",
                  shipping: "auto",
                },
              };
            } else {
              sessionArgs = {
                ...sessionArgs,
                customer_creation: "always",
              };
            }
          } else {
            sessionArgs = {
              ...sessionArgs,
              customer_creation: "always",
            };
          }

          const stripeSession =
            await stripe.checkout.sessions.create(sessionArgs);

          await tx
            .update(schema.orders)
            .set({
              stripeCheckoutSessionId: stripeSession.id,
            })
            .where(eq(schema.orders.id, createdOrder.id));

          this.logger.info("Stripe checkout session created", {
            orderId: createdOrder.id,
            stripeSessionId: stripeSession.id,
          });

          return {
            issues: null,
            orderId,
            stripeSession,
          };
        }
      );

      if (issues || !orderId || !stripeSession) {
        return {
          issues,
        };
      }

      const order = await db.query.orders.findFirst({
        where: eq(schema.orders.id, orderId),
        with: {
          items: {
            with: {
              piece: {
                with: {
                  brand: true,
                  category: true,
                },
              },
              product: true,
            },
          },
        },
      });
      if (!order) {
        this.logger.error("Order not found", { orderId });
        const issues = new CheckoutIssues();
        issues.addIssueOrderNotFound(orderId as string);
        return {
          issues: issues.getIssues(),
        };
      }

      return {
        order,
        stripeSession,
      };
    } catch (err) {
      this.logger.error("Create checkout session error", { err });
      throw err;
    }
  }

  public async confirmStripeCustomerId(
    userId: string,
    txContext?: DbTransactionClient
  ): Promise<string | undefined> {
    const executeInContext = async (
      tx: DbTransactionClient
    ): Promise<string | undefined> => {
      const user = await tx.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });

      if (!user) {
        return undefined;
      }

      const stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          phone: user.phoneNumber ?? undefined,
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.firstName
                ? user.firstName
                : user.lastName
                  ? user.lastName
                  : undefined,
        });

        await tx
          .update(schema.users)
          .set({
            stripeCustomerId: customer.id,
          })
          .where(eq(schema.users.id, user.id));

        return customer.id;
      }

      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);

        if (!customer.deleted) {
          return stripeCustomerId;
        } else {
          // Customer is deleted, create new one
          const newCustomer = await stripe.customers.create({
            email: user.email,
            phone: user.phoneNumber ?? undefined,
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName
                  ? user.firstName
                  : user.lastName
                    ? user.lastName
                    : undefined,
          });

          await tx
            .update(schema.users)
            .set({
              stripeCustomerId: newCustomer.id,
            })
            .where(eq(schema.users.id, user.id));

          return newCustomer.id;
        }
      } catch (error) {
        // Customer doesn't exist in Stripe, create new one
        if (
          error instanceof Stripe.errors.StripeError &&
          error.code === "resource_missing"
        ) {
          this.logger.warn(`Stripe customer not found, creating new customer`, {
            userId,
            stripeCustomerId,
          });

          const newCustomer = await stripe.customers.create({
            email: user.email,
            phone: user.phoneNumber ?? undefined,
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName
                  ? user.firstName
                  : user.lastName
                    ? user.lastName
                    : undefined,
          });

          await tx
            .update(schema.users)
            .set({
              stripeCustomerId: newCustomer.id,
            })
            .where(eq(schema.users.id, user.id));

          return newCustomer.id;
        }

        // Re-throw other errors
        throw error;
      }
    };

    // Use provided transaction context or create a new one
    if (txContext) {
      return await executeInContext(txContext);
    }
    return await db.transaction(async (tx) => executeInContext(tx));
  }
}

// ========================== COMPLETE ORDER ISSUES ==========================
type CompleteOrderProductNotInCheckoutIssue = {
  code: "complete-product-not-in-checkout";
  message: string;
  productId: string;
  currentStatus: string;
};

type CompleteOrderProductPieceNotInCheckoutIssue = {
  code: "complete-product-piece-not-in-checkout";
  message: string;
  productId: string;
  pieceId: string;
  currentStatus: string;
};

type CompleteOrderPieceNotInCheckoutIssue = {
  code: "complete-piece-not-in-checkout";
  message: string;
  pieceId: string;
  currentStatus: string;
};

type CompleteOrderPieceNotReservedByUserIssue = {
  code: "complete-piece-not-reserved-by-user";
  message: string;
  pieceId: string;
  expectedUserId: string | null;
  actualUserId: string | null;
};

type CompleteOrderProductPieceNotReservedByUserIssue = {
  code: "complete-product-piece-not-reserved-by-user";
  message: string;
  productId: string;
  pieceId: string;
  expectedUserId: string;
  actualUserId: string | null;
};

type CompleteOrderStripeDataMissingIssue = {
  code: "complete-stripe-data-missing";
  message: string;
  field: string;
};

type CompleteOrderDeliveryMethodInvalidIssue = {
  code: "complete-delivery-method-invalid";
  message: string;
  deliveryMethod: string | null;
};

type CompleteOrderEmailFailedIssue = {
  code: "complete-email-failed";
  message: string;
  errorDetails: string;
};

type CompleteOrderIssue =
  | CompleteOrderProductNotInCheckoutIssue
  | CompleteOrderProductPieceNotInCheckoutIssue
  | CompleteOrderPieceNotInCheckoutIssue
  | CompleteOrderPieceNotReservedByUserIssue
  | CompleteOrderProductPieceNotReservedByUserIssue
  | CompleteOrderStripeDataMissingIssue
  | CompleteOrderDeliveryMethodInvalidIssue
  | CompleteOrderEmailFailedIssue;

// ========================== CHECKOUT ISSUES ==========================

type BaseIssue = {
  code: string;
  message: string;
};

type PiecePartOfProductIssue = BaseIssue & {
  code: "piece-part-of-product";
  pieceId: string;
  productId: string;
};

type ProductPieceStatusInvalidIssue = BaseIssue & {
  code: "product-piece-status-invalid";
  productId: string;
  pieceId: string;
  currentStatus: string;
};

type PieceStatusInvalidIssue = BaseIssue & {
  code: "piece-status-invalid";
  pieceId: string;
  currentStatus: string;
};

type ProductNoFreePiecesIssue = BaseIssue & {
  code: "product-no-free-pieces";
  productId: string;
};

type PieceReservedIssue = BaseIssue & {
  code: "piece-reserved";
  pieceId: string;
  reservedUntil: string;
};

type ProductStatusInvalidIssue = BaseIssue & {
  code: "product-status-invalid";
  productId: string;
  currentStatus: string;
};

type ProductNotFoundIssue = BaseIssue & {
  code: "product-not-found";
  productId: string;
};

type OrderNotFoundIssue = BaseIssue & {
  code: "order-not-found";
  orderId: string;
};

type CheckoutIssue =
  | PiecePartOfProductIssue
  | ProductStatusInvalidIssue
  | ProductPieceStatusInvalidIssue
  | PieceStatusInvalidIssue
  | ProductNoFreePiecesIssue
  | PieceReservedIssue
  | ProductNotFoundIssue
  | OrderNotFoundIssue;

const orderService = new OrderService(
  logger.child({ service: "OrderService" })
);

export { orderService, OrderService };

class CompleteOrderIssues {
  private issues: CompleteOrderIssue[] = [];

  public addCompleteIssueProductNotInCheckout(
    { productId, productName }: { productId: string; productName: string },
    currentStatus: string
  ) {
    this.issues.push({
      code: "complete-product-not-in-checkout",
      message: `Produkt "${productName}" nie jest w statusie in_checkout (aktualny status: ${currentStatus})`,
      productId,
      currentStatus,
    } satisfies CompleteOrderProductNotInCheckoutIssue);
  }

  public addCompleteIssuePieceNotInCheckout(
    { pieceId, pieceName }: { pieceId: string; pieceName: string },
    currentStatus: string
  ) {
    this.issues.push({
      code: "complete-piece-not-in-checkout",
      message: `Ubranie "${pieceName}" nie jest w statusie in_checkout (aktualny status: ${currentStatus})`,
      pieceId,
      currentStatus,
    } satisfies CompleteOrderPieceNotInCheckoutIssue);
  }

  public addCompleteIssuePieceNotReservedByUser(
    { pieceId, pieceName }: { pieceId: string; pieceName: string },
    expectedUserId: string | null,
    actualUserId: string | null
  ) {
    this.issues.push({
      code: "complete-piece-not-reserved-by-user",
      message: `Ubranie "${pieceName}" nie jest zarezerwowane przez tego użytkownika`,
      pieceId,
      expectedUserId,
      actualUserId,
    } satisfies CompleteOrderPieceNotReservedByUserIssue);
  }

  public addStripeDataMissing(field: string) {
    this.issues.push({
      code: "complete-stripe-data-missing",
      message: `Brakujące dane ze Stripe: ${field}`,
      field,
    } satisfies CompleteOrderStripeDataMissingIssue);
  }

  public addDeliveryMethodInvalid(deliveryMethod: string | null) {
    this.issues.push({
      code: "complete-delivery-method-invalid",
      message: `Nieprawidłowa metoda dostawy: ${deliveryMethod}`,
      deliveryMethod,
    } satisfies CompleteOrderDeliveryMethodInvalidIssue);
  }

  public hasIssues(): boolean {
    return this.issues.length > 0;
  }

  getIssues() {
    return this.issues;
  }
}

class CheckoutIssues {
  private issues: CheckoutIssue[] = [];

  public addIssuePieceStatusInvalid(
    { pieceId, pieceName }: { pieceId: string; pieceName: string },
    currentStatus: string
  ) {
    this.issues.push({
      code: "piece-status-invalid",
      message: `Ubranie "${pieceName}" nie jest dostępne do zakupu (status: ${currentStatus}). Usuń je z koszyka i spróbuj ponownie.`,
      pieceId,
      currentStatus,
    } satisfies PieceStatusInvalidIssue);
  }

  public addIssuePieceReserved(
    { pieceId, pieceName }: { pieceId: string; pieceName: string },
    reservedUntil: Date
  ) {
    this.issues.push({
      code: "piece-reserved",
      message: `Ubranie "${pieceName}" jest aktualnie zarezerwowane do ${new Date(reservedUntil).toLocaleString("pl-PL")}.`,
      pieceId,
      reservedUntil: reservedUntil.toISOString(),
    } satisfies PieceReservedIssue);
  }

  public addIssueProductStatusInvalid(
    { productId, productName }: { productId: string; productName: string },
    currentStatus: string
  ) {
    this.issues.push({
      code: "product-status-invalid",
      message: `Produkt "${productName}" nie jest dostępny do zakupu (status: ${currentStatus}). Usuń go z koszyka i spróbuj ponownie.`,
      productId,
      currentStatus,
    } satisfies ProductStatusInvalidIssue);
  }

  public addIssueProductNotFound(productId: string) {
    this.issues.push({
      code: "product-not-found",
      message: `Produkt o ID "${productId}" nie został znaleziony.`,
      productId,
    } satisfies ProductNotFoundIssue);
  }

  public addIssueOrderNotFound(orderId: string) {
    this.issues.push({
      code: "order-not-found",
      message: `Zamówienie o ID "${orderId}" nie zostało znalezione.`,
      orderId,
    } satisfies OrderNotFoundIssue);
  }

  public hasIssues(): boolean {
    return this.issues.length > 0;
  }

  public getIssues() {
    return this.issues;
  }
}
