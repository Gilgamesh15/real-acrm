import { newsletterSubscribers as newsletterSubscribersTable } from "db/schema";
import { getTableColumns } from "drizzle-orm";
import z from "zod";

import { PaginationSchema, SortOrderSchema } from "./shared";

export const NewsletterSubscribeSchema = z.object({
  email: z.email(),
});

export const NewsletterUnsubscribeSchema = z.object({
  token: z.string(),
});

const newsletterSubscriberColumns = getTableColumns(newsletterSubscribersTable);
type NewsletterSubscriberColumnsKey = keyof typeof newsletterSubscriberColumns;
const newsletterSubscriberColumnsNames = Object.keys(
  newsletterSubscriberColumns
) as NewsletterSubscriberColumnsKey[];

export const NewsletterSubscriberQuerySchema = PaginationSchema.extend({
  sortOrder: SortOrderSchema,
  sortBy: z
    .enum(newsletterSubscriberColumnsNames)
    .optional()
    .default("createdAt"),
});

export const NewsletterSubscriberResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  subscribed: z.boolean(),
  subscribedAt: z.date(),
  unsubscribedAt: z.date().nullable(),
  welcomeCodeSent: z.boolean(),
  createdAt: z.date(),
});

export type NewsletterSubscriber = z.infer<
  typeof NewsletterSubscriberResponseSchema
>;
