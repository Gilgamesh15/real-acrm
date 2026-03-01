import * as schema from "db/schema";
import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import z from "zod";

import { db } from "~/lib/db";

const subscribeSchema = z.object({
  email: z.email("Nieprawidłowy adres email"),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const { logger } = context;

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check if already subscribed
    const existing = await db
      .select({ id: schema.newsletterSubscribers.id })
      .from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ success: true, alreadySubscribed: true });
    }

    await db.insert(schema.newsletterSubscribers).values({
      email: email.toLowerCase(),
    });

    return Response.json({ success: true, alreadySubscribed: false });
  } catch (error) {
    logger.error("Newsletter subscription failed", { error });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
