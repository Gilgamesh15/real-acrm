import { initContract } from "@ts-rest/core";
import type {
  InternalServerErrorJSON,
  NotFoundErrorJSON,
  UnauthorizedErrorJSON,
  ValidationErrorJSON,
} from "db/error";
import {
  BrandCreateSchema,
  BrandQuerySchema,
  BrandResponseSchema,
  BrandUpdateSchema,
} from "db/models/brands.model";
import z from "zod";

const c = initContract();

export const brandsContract = {
  get: c.query({
    method: "GET",
    path: "/brands",
    query: BrandQuerySchema.extend({
      cache: z.coerce.number().optional(),
    }),
    responses: {
      200: z.object({
        brands: z.array(BrandResponseSchema),
      }),
      400: c.type<ValidationErrorJSON>(),
      500: c.type<InternalServerErrorJSON>(),
    },
    strictStatusCodes: true,
  }),
  create: c.mutation({
    method: "POST",
    path: "/brands",
    body: BrandCreateSchema,
    responses: {
      201: z.object({
        brand: BrandResponseSchema,
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
      path: "/brands/:slug",
      query: z.object({
        cache: z.coerce.number().optional(),
      }),
      pathParams: z.object({
        slug: z.string(),
      }),
      responses: {
        200: z.object({
          brand: BrandResponseSchema,
        }),
        400: c.type<ValidationErrorJSON>(),
        404: c.type<NotFoundErrorJSON>(),
        500: c.type<InternalServerErrorJSON>(),
      },
      strictStatusCodes: true,
    }),
    update: c.mutation({
      method: "PUT",
      path: "/brands/:slug",
      body: BrandUpdateSchema,
      pathParams: z.object({
        slug: z.string(),
      }),
      responses: {
        200: z.object({
          brand: BrandResponseSchema,
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
      path: "/brands/:slug",
      body: c.noBody(),
      pathParams: z.object({
        slug: z.string(),
      }),
      responses: {
        200: z.object({
          brand: BrandResponseSchema,
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
