import { initContract } from "@ts-rest/core";
import type {
  InternalServerErrorJSON,
  NotFoundErrorJSON,
  UnauthorizedErrorJSON,
  ValidationErrorJSON,
} from "db/error";
import {
  SizeCreateSchema,
  SizeQuerySchema,
  SizeResponseSchema,
  SizeUpdateSchema,
} from "db/models/sizes.model";
import z from "zod";

const c = initContract();

export const sizesContract = {
  get: c.query({
    method: "GET",
    path: "/sizes",
    query: SizeQuerySchema.extend({
      cache: z.coerce.number().optional(),
    }),
    responses: {
      200: z.object({
        sizes: z.array(SizeResponseSchema),
      }),
      400: c.type<ValidationErrorJSON>(),
      500: c.type<InternalServerErrorJSON>(),
    },
    strictStatusCodes: true,
  }),
  create: c.mutation({
    method: "POST",
    path: "/sizes",
    body: SizeCreateSchema,
    responses: {
      201: z.object({
        size: SizeResponseSchema,
      }),
      400: c.type<ValidationErrorJSON>(),
      401: c.type<UnauthorizedErrorJSON>(),
      500: c.type<InternalServerErrorJSON>(),
    },
    strictStatusCodes: true,
  }),
  bySlug: {
    get: c.query({
      method: "GET",
      path: "/sizes/:slug",
      query: z.object({
        cache: z.coerce.number().optional(),
      }),
      pathParams: z.object({
        slug: z.string(),
      }),
      responses: {
        200: z.object({
          size: SizeResponseSchema,
        }),
        400: c.type<ValidationErrorJSON>(),
        404: c.type<NotFoundErrorJSON>(),
        500: c.type<InternalServerErrorJSON>(),
      },
      strictStatusCodes: true,
    }),
    update: c.mutation({
      method: "PUT",
      path: "/sizes/:slug",
      body: SizeUpdateSchema,
      pathParams: z.object({
        slug: z.string(),
      }),
      responses: {
        200: z.object({
          size: SizeResponseSchema,
        }),
        401: c.type<UnauthorizedErrorJSON>(),
        400: c.type<ValidationErrorJSON>(),
        404: c.type<NotFoundErrorJSON>(),
        500: c.type<InternalServerErrorJSON>(),
      },
      strictStatusCodes: true,
    }),
    delete: c.mutation({
      method: "DELETE",
      path: "/sizes/:slug",
      body: c.noBody(),
      pathParams: z.object({
        slug: z.string(),
      }),
      responses: {
        200: z.object({
          size: SizeResponseSchema,
        }),
        401: c.type<UnauthorizedErrorJSON>(),
        400: c.type<ValidationErrorJSON>(),
        404: c.type<NotFoundErrorJSON>(),
        500: c.type<InternalServerErrorJSON>(),
      },
      strictStatusCodes: true,
    }),
  },
};
