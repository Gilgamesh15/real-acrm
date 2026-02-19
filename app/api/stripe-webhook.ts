import { data } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import Stripe from "stripe";

import { orderService } from "~/../db/services/order.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;

  if (request.method !== "POST") {
    logger.warn("Stripe webhook received non-POST request", {
      method: request.method,
    });
    throw data({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.text();

    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      logger.warn("Stripe webhook missing signature header");
      throw data(
        { message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      logger.error("Stripe webhook signature verification failed", {
        error: err,
      });
      throw data({ message: `Webhook Error: ${err}` }, { status: 400 });
    }

    logger.info("Stripe webhook received", { eventType: event.type });

    const stripeSession = event.data.object as Stripe.Checkout.Session;

    switch (event.type) {
      case "checkout.session.completed":
        await orderService.completeOrder(stripeSession.id);
        logger.info("Order completed via Stripe webhook", {
          stripeSessionId: stripeSession.id,
        });
        break;

      case "checkout.session.expired":
        await orderService.cancelOrderByStripeSession(stripeSession.id);
        logger.info("Order cancelled - Stripe session expired", {
          stripeSessionId: stripeSession.id,
        });
        break;
      default:
        logger.warn("Unhandled Stripe webhook event type", {
          eventType: event.type,
        });
        throw data(
          { message: `Unhandled event type: ${event.type}` },
          { status: 400 }
        );
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Stripe webhook processing failed", { error });
    throw data({ message: `Webhook error: ${error}` }, { status: 200 });
  }
}
