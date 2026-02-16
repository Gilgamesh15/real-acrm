import { NotFoundError } from "db/error";
import { generateSlug } from "db/models/shared";
import type {
  Size,
  SizeCreateSchema,
  SizeQuerySchema,
  SizeUpdateSchema,
} from "db/models/sizes.model";
import { asc, desc, eq } from "drizzle-orm";
import type z from "zod";

import { sizes as sizesTable } from "~/../db/schema";

import type { AdminAppState, UnauthenticatedAppState } from "./shared";

export async function getSizes(
  state: UnauthenticatedAppState,
  args: z.infer<typeof SizeQuerySchema>
): Promise<Size[]> {
  const { db } = state;
  const { limit, offset, sortOrder, sortBy } = args;

  const orderBy =
    sortOrder === "asc" ? asc(sizesTable[sortBy]) : desc(sizesTable[sortBy]);

  return db.query.sizes.findMany({
    limit,
    offset,
    orderBy,
  });
}

export async function createSize(
  state: UnauthenticatedAppState,
  args: z.infer<typeof SizeCreateSchema>
): Promise<Size> {
  const { db } = state;

  const slug = await generateSizeSlug(state, args.name);

  const size = await db
    .insert(sizesTable)
    .values({
      name: args.name,
      slug,
    })
    .returning()
    .then((result) => result[0]);

  return size;
}

/**
 * @throws {NotFoundError}
 */
export async function updateSize(
  state: AdminAppState,
  slug: string,
  args: z.infer<typeof SizeUpdateSchema>
): Promise<Size> {
  const { db } = state;

  const existing = await db.query.sizes.findFirst({
    where: eq(sizesTable.slug, slug),
  });

  if (!existing) {
    throw new NotFoundError(
      "Rozmiar nie została znaleziona",
      sizesTable._.name,
      slug
    );
  }

  const newSlug = args.name
    ? await generateSizeSlug(state, args.name)
    : existing.slug;

  const size = await db
    .update(sizesTable)
    .set({
      name: args.name,
      slug: newSlug,
    })
    .where(eq(sizesTable.id, existing.id))
    .returning()
    .then((result) => result[0]);

  return size;
}

/**
 * @throws {NotFoundError}
 */
export async function deleteSize(
  state: AdminAppState,
  slug: string
): Promise<Size> {
  const { db } = state;

  const existing = await db.query.sizes.findFirst({
    where: eq(sizesTable.slug, slug),
  });

  if (!existing) {
    throw new NotFoundError(
      "Rozmiar nie została znaleziona",
      sizesTable._.name,
      slug
    );
  }

  await db.delete(sizesTable).where(eq(sizesTable.slug, slug));

  return existing;
}

/**
 * @throws {NotFoundError}
 */
export async function getSizeBySlug(
  state: UnauthenticatedAppState,
  slug: string
): Promise<Size> {
  const { db } = state;

  const existing = await db.query.sizes.findFirst({
    where: eq(sizesTable.slug, slug),
  });

  if (!existing) {
    throw new NotFoundError(
      "Rozmiar nie została znaleziona",
      sizesTable._.name,
      slug
    );
  }

  return existing;
}

// ========================== HELPERS ==========================

async function generateSizeSlug(
  state: UnauthenticatedAppState,
  name: string
): Promise<string> {
  const { db } = state;

  return generateSlug(name, async (slug) => {
    const existing = await db.query.sizes.findFirst({
      where: eq(sizesTable.slug, slug),
      columns: { id: true },
    });
    return !!existing;
  });
}
