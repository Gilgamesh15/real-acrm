import { initContract } from "@ts-rest/core";
import type {
  InternalServerErrorJSON,
  NotFoundErrorJSON,
  ValidationErrorJSON,
} from "db/error";
import {
  NewsletterSubscribeSchema,
  NewsletterSubscriberQuerySchema,
  NewsletterSubscriberResponseSchema,
  NewsletterUnsubscribeSchema,
} from "db/models/newsletter-subscribers.model";
import z from "zod";

const c = initContract();

export const newsletterContract = {
  get: c.query({
    method: "GET",
    path: "/newsletter",
    query: NewsletterSubscriberQuerySchema.extend({
      cache: z.coerce.number().optional(),
    }),
    responses: {
      200: z.object({
        subscribers: z.array(NewsletterSubscriberResponseSchema),
      }),
      400: c.type<ValidationErrorJSON>(),
      500: c.type<InternalServerErrorJSON>(),
    },
    strictStatusCodes: true,
  }),
  subscribe: c.mutation({
    method: "POST",
    path: "/newsletter/subscribe",
    body: NewsletterSubscribeSchema,
    responses: {
      201: z.object({
        subscriber: NewsletterSubscriberResponseSchema,
      }),
      400: c.type<ValidationErrorJSON>(),
      500: c.type<InternalServerErrorJSON>(),
    },
    strictStatusCodes: true,
  }),
  byEmail: {
    get: c.query({
      method: "GET",
      path: "/newsletter/:email",
      query: z.object({
        cache: z.coerce.number().optional(),
      }),
      params: z.object({
        email: z.string(),
      }),
      responses: {
        200: z.object({
          subscriber: NewsletterSubscriberResponseSchema,
        }),
        404: c.type<NotFoundErrorJSON>(),
        500: c.type<InternalServerErrorJSON>(),
      },
      strictStatusCodes: true,
    }),
  },
  unsubscribe: c.mutation({
    method: "POST",
    path: "/newsletter/unsubscribe",
    body: NewsletterUnsubscribeSchema,
    responses: {
      200: z.object({
        subscriber: NewsletterSubscriberResponseSchema,
      }),
      400: c.type<ValidationErrorJSON>(),
      404: c.type<NotFoundErrorJSON>(),
      500: c.type<InternalServerErrorJSON>(),
    },
    strictStatusCodes: true,
  }),
};
