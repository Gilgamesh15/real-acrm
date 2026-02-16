import { NotFoundError } from "db/error";
import type {
  Brand,
  BrandCreateSchema,
  BrandQuerySchema,
  BrandUpdateSchema,
} from "db/models/brands.model";
import { generateSlug } from "db/models/shared";
import { asc, desc, eq } from "drizzle-orm";
import type z from "zod";

import { brands as brandsTable } from "~/../db/schema";

import type { AdminAppState, UnauthenticatedAppState } from "./shared";

export async function getBrands(
  state: UnauthenticatedAppState,
  args: z.infer<typeof BrandQuerySchema>
): Promise<Brand[]> {
  const { db } = state;
  const { limit, offset, sortOrder, sortBy } = args;

  const orderBy =
    sortOrder === "asc" ? asc(brandsTable[sortBy]) : desc(brandsTable[sortBy]);

  return db.query.brands.findMany({
    limit,
    offset,
    orderBy,
  });
}

export async function createBrand(
  state: UnauthenticatedAppState,
  args: z.infer<typeof BrandCreateSchema>
): Promise<Brand> {
  const { db } = state;

  const slug = await generateBrandSlug(state, args.name);

  const brand = await db
    .insert(brandsTable)
    .values({
      name: args.name,
      slug,
    })
    .returning()
    .then((result) => result[0]);

  return brand;
}

/**
 * @throws {NotFoundError}
 */
export async function updateBrand(
  state: AdminAppState,
  slug: string,
  args: z.infer<typeof BrandUpdateSchema>
): Promise<Brand> {
  const { db } = state;

  const existing = await db.query.brands.findFirst({
    where: eq(brandsTable.slug, slug),
  });

  if (!existing) {
    throw new NotFoundError(
      "Marka nie została znaleziona",
      brandsTable._.name,
      slug
    );
  }

  const newSlug = args.name
    ? await generateBrandSlug(state, args.name)
    : existing.slug;

  const brand = await db
    .update(brandsTable)
    .set({
      name: args.name,
      slug: newSlug,
    })
    .where(eq(brandsTable.id, existing.id))
    .returning()
    .then((result) => result[0]);

  return brand;
}

/**
 * @throws {NotFoundError}
 */
export async function deleteBrand(
  state: AdminAppState,
  slug: string
): Promise<Brand> {
  const { db } = state;

  const existing = await db.query.brands.findFirst({
    where: eq(brandsTable.slug, slug),
  });

  if (!existing) {
    throw new NotFoundError(
      "Marka nie została znaleziona",
      brandsTable._.name,
      slug
    );
  }

  await db.delete(brandsTable).where(eq(brandsTable.slug, slug));

  return existing;
}

/**
 * @throws {NotFoundError}
 */
export async function getBrandBySlug(
  state: UnauthenticatedAppState,
  slug: string
): Promise<Brand> {
  const { db } = state;

  const existing = await db.query.brands.findFirst({
    where: eq(brandsTable.slug, slug),
  });

  if (!existing) {
    throw new NotFoundError(
      "Marka nie została znaleziona",
      brandsTable._.name,
      slug
    );
  }

  return existing;
}

// ========================== HELPERS ==========================

async function generateBrandSlug(
  state: UnauthenticatedAppState,
  name: string
): Promise<string> {
  const { db } = state;

  return generateSlug(name, async (slug) => {
    const existing = await db.query.brands.findFirst({
      where: eq(brandsTable.slug, slug),
      columns: { id: true },
    });
    return !!existing;
  });
}
