import { BadRequestError, NotFoundError } from "db/error";
import type {
  NewsletterSubscribeSchema,
  NewsletterSubscriber,
  NewsletterSubscriberQuerySchema,
  NewsletterUnsubscribeSchema,
} from "db/models/newsletter-subscribers.model";
import { asc, desc, eq } from "drizzle-orm";
import type Stripe from "stripe";
import type z from "zod";

import { newsletterSubscribers as newsletterSubscribersTable } from "~/../db/schema";
import { WelcomeDiscountEmail } from "~/components/emails/welcome-discount-email";
import type { EmailClient } from "~/lib/resend";

import type { UnauthenticatedAppState } from "./shared";

export async function getNewsletterSubscribers(
  state: UnauthenticatedAppState,
  args: z.infer<typeof NewsletterSubscriberQuerySchema>
): Promise<NewsletterSubscriber[]> {
  const { db } = state;
  const { limit, offset, sortOrder, sortBy } = args;

  const orderBy =
    sortOrder === "asc"
      ? asc(newsletterSubscribersTable[sortBy])
      : desc(newsletterSubscribersTable[sortBy]);

  const newsletterSubscribers = await db.query.newsletterSubscribers.findMany({
    limit,
    offset,
    orderBy,
  });

  return newsletterSubscribers.map((subscriber) => {
    // eslint-disable-next-line tsPlugin/no-unused-vars
    const { unsubscribeToken: _, ...rest } = subscriber;

    return {
      ...rest,
      subscribed: isSubscribed(subscriber),
    };
  });
}

export async function subscribeToNewsletter(
  state: UnauthenticatedAppState & { emailClient: EmailClient; stripe: Stripe },
  args: z.infer<typeof NewsletterSubscribeSchema>
): Promise<NewsletterSubscriber> {
  const { db, emailClient, stripe } = state;

  const email = args.email.toLowerCase();

  const existing = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribersTable.email, email),
  });

  const isPreviouslySubscribed = existing ? isSubscribed(existing) : false;

  if (existing && isPreviouslySubscribed) {
    throw new BadRequestError("Email jest już subskrybowany", {
      email,
    });
  }

  const unsubscribeToken = crypto.randomUUID();
  const subscribedAt = new Date();

  let newsletterSubscriber: typeof newsletterSubscribersTable.$inferSelect;

  if (existing) {
    newsletterSubscriber = await db
      .update(newsletterSubscribersTable)
      .set({
        unsubscribeToken,
        subscribedAt,
      })
      .where(eq(newsletterSubscribersTable.email, email))
      .returning()
      .then((result) => result[0]);
  } else {
    newsletterSubscriber = await db
      .insert(newsletterSubscribersTable)
      .values({
        email,
        unsubscribeToken,
        subscribedAt,
      })
      .returning()
      .then((result) => result[0]);
  }

  if (!newsletterSubscriber.welcomeCodeSent) {
    const coupon = await upsertWelcomeCoupon(stripe, {
      currency: "pln",
      duration: "once",
      name: "Witaj w ACRM!",
      percent_off: 10,
    });

    const code = await stripe.promotionCodes.create({
      promotion: {
        type: "coupon",
        coupon: coupon.id,
      },
      metadata: {
        newsletterSubscriberEmail: email,
      },
      max_redemptions: 1,
      expires_at: Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000), // 30 days,
    });

    newsletterSubscriber = await db
      .update(newsletterSubscribersTable)
      .set({ welcomeCodeSent: true })
      .where(eq(newsletterSubscribersTable.email, email))
      .returning()
      .then((result) => result[0]);

    await emailClient.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: "ACRM - Dziękujemy za zapisanie się do newslettera!",
      react: (
        <WelcomeDiscountEmail
          discountCode={code.code}
          unsubscribeToken={newsletterSubscriber.unsubscribeToken}
        />
      ),
    });
  }

  // eslint-disable-next-line tsPlugin/no-unused-vars
  const { unsubscribeToken: _, ...rest } = newsletterSubscriber;

  return {
    ...rest,
    subscribed: isSubscribed(newsletterSubscriber),
  };
}

/**
 * @throws {NotFoundError}
 */
export async function unsubscribeFromNewsletter(
  state: UnauthenticatedAppState,
  args: z.infer<typeof NewsletterUnsubscribeSchema>
): Promise<NewsletterSubscriber> {
  const { db } = state;

  const existing = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribersTable.unsubscribeToken, args.token),
  });

  if (!existing) {
    throw new NotFoundError(
      "Email nie został znaleziony",
      newsletterSubscribersTable._.name,
      args.token
    );
  }

  const newsletterSubscriber = await db
    .update(newsletterSubscribersTable)
    .set({
      unsubscribedAt: new Date(),
    })
    .where(eq(newsletterSubscribersTable.unsubscribeToken, args.token))
    .returning()
    .then((result) => result[0]);

  // eslint-disable-next-line tsPlugin/no-unused-vars
  const { unsubscribeToken: _, ...rest } = newsletterSubscriber;

  return {
    ...rest,
    subscribed: isSubscribed(newsletterSubscriber),
  };
}

export async function getNewsletterSubscriberByEmail(
  state: UnauthenticatedAppState,
  email: string
): Promise<NewsletterSubscriber | null> {
  const { db } = state;
  const newsletterSubscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribersTable.email, email),
  });

  if (!newsletterSubscriber) {
    throw new NotFoundError(
      "Email nie został znaleziony",
      newsletterSubscribersTable._.name,
      email
    );
  }

  // eslint-disable-next-line tsPlugin/no-unused-vars
  const { unsubscribeToken: _, ...rest } = newsletterSubscriber;

  return {
    ...rest,
    subscribed: isSubscribed(newsletterSubscriber),
  };
}

// ========================== HELPER FUNCTIONS ==========================
function isSubscribed(
  subscriber: typeof newsletterSubscribersTable.$inferSelect
): boolean {
  return (
    subscriber.unsubscribedAt === null ||
    subscriber.subscribedAt > subscriber.unsubscribedAt
  );
}

const WELCOME_COUPON_ID = "welcome_coupon";

async function upsertWelcomeCoupon(
  stripe: Stripe,
  args: Omit<Stripe.CouponCreateParams, "id">
) {
  try {
    return await stripe.coupons.retrieve(WELCOME_COUPON_ID);
  } catch {
    return await stripe.coupons.create({ ...args, id: WELCOME_COUPON_ID });
  }
}
