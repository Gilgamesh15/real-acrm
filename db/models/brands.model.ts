import { brands as brandsTable } from "db/schema";
import { getTableColumns } from "drizzle-orm";
import z from "zod";

import { NameSchema, PaginationSchema, SortOrderSchema } from "./shared";

export const BrandCreateSchema = z.object({
  name: NameSchema,
});

export const BrandUpdateSchema = z.object({
  name: NameSchema.optional(),
});

const brandColumns = getTableColumns(brandsTable);
type BrandColumnsKey = keyof typeof brandColumns;
const brandColumnsNames = Object.keys(brandColumns) as BrandColumnsKey[];

export const BrandQuerySchema = PaginationSchema.extend({
  sortOrder: SortOrderSchema,
  sortBy: z.enum(brandColumnsNames).optional().default("createdAt"),
  orderedOnly: z.coerce.boolean().optional().default(false),
});

export const BrandResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Brand = z.infer<typeof BrandResponseSchema>;
