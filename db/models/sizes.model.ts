import { sizes as sizesTable } from "db/schema";
import { getTableColumns } from "drizzle-orm";
import z from "zod";

import { NameSchema, PaginationSchema, SortOrderSchema } from "./shared";

export const SizeCreateSchema = z.object({
  name: NameSchema,
});

export const SizeUpdateSchema = z.object({
  name: NameSchema.optional(),
});

const sizeColumns = getTableColumns(sizesTable);
type SizeColumnsKey = keyof typeof sizeColumns;
const sizeColumnsNames = Object.keys(sizeColumns) as SizeColumnsKey[];

export const SizeQuerySchema = PaginationSchema.extend({
  sortOrder: SortOrderSchema,
  sortBy: z.enum(sizeColumnsNames).optional().default("createdAt"),
  orderedOnly: z.coerce.boolean().optional().default(false),
});

export const SizeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Size = z.infer<typeof SizeResponseSchema>;
