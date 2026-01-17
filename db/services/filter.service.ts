import * as schema from "db/schema";
import {
  and,
  asc,
  desc,
  eq,
  exists,
  gte,
  inArray,
  isNull,
  lte,
  ne,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "~/lib/db";
import type { Logger } from "~/lib/logger.server";
import { logger } from "~/lib/logger.server";
import type { DBQueryArgs, DBQueryResult } from "~/lib/types";
import { type FilterArgs, priceFromGrosz } from "~/lib/utils";

class FilterService {
  constructor(private logger: Logger) {}

  static SIMILARITY_LOWER_BOUND = 0.12; // Lowered to catch more results

  // Pieces: Much stronger weights
  static PIECE_SIMILARITY_NAME_MULTIPLIER = 1.2;
  static PIECE_SIMILARITY_BRAND_MULTIPLIER = 0.8;
  static PIECE_SIMILARITY_SIZE_MULTIPLIER = 0.4;
  static PIECE_SIMILARITY_CATEGORY_MULTIPLIER = 0.6;
  static PIECE_SIMILARITY_KEYWORDS_MULTIPLIER = 0.5;

  // Products: Stronger weights
  static PRODUCT_SIMILARITY_NAME_MULTIPLIER = 1.0;
  static PRODUCT_SIMILARITY_KEYWORDS_MULTIPLIER = 0.6;
  static PRODUCT_SIMILARITY_BRAND_MULTIPLIER = 0.4;
  static PRODUCT_SIMILARITY_SIZE_MULTIPLIER = 0.3;
  static PRODUCT_SIMILARITY_CATEGORY_MULTIPLIER = 0.3;

  async findFiltered<
    TProductArgs extends DBQueryArgs<"products", "one">,
    TPieceArgs extends DBQueryArgs<"pieces", "one">,
  >(
    search: string,
    {
      product = {} as TProductArgs,
      piece = {} as TPieceArgs,
    }: { product: TProductArgs; piece: TPieceArgs },
    take: number = 10
  ) {
    // Length penalty factor: shorter queries get boosted
    const searchLength = search.length;
    const lengthBoost = sql<number>`GREATEST(1.0, 1.5 - (${searchLength}::float / 20.0))`;
    const rankedPieces = db.$with("ranked_pieces").as(
      db
        .select({
          id: schema.pieces.id,
          _type: sql<"piece">`'piece'`.as("_type"),
          score: sql<number>`
            (
              similarity(unaccent(lower(${schema.pieces.name})), unaccent(lower(${search}))) * ${FilterService.PIECE_SIMILARITY_NAME_MULTIPLIER} + 
              similarity(unaccent(lower(${schema.brands.name})), unaccent(lower(${search}))) * ${FilterService.PIECE_SIMILARITY_BRAND_MULTIPLIER} + 
              similarity(unaccent(lower(${schema.sizes.name})), unaccent(lower(${search}))) * ${FilterService.PIECE_SIMILARITY_SIZE_MULTIPLIER} + 
              COALESCE(similarity(unaccent(lower(${schema.categories.name})), unaccent(lower(${search}))), 0) * ${FilterService.PIECE_SIMILARITY_CATEGORY_MULTIPLIER} + 
              COALESCE(
                (SELECT SUM(similarity(unaccent(lower(k)), unaccent(lower(${search}))))
                 FROM unnest(${schema.pieces.keywords}) AS k),
                0
              ) * ${FilterService.PIECE_SIMILARITY_KEYWORDS_MULTIPLIER} +
              -- Prefix match bonus
              CASE 
                WHEN unaccent(lower(${schema.pieces.name})) LIKE unaccent(lower(${search})) || '%' THEN 0.3
                WHEN unaccent(lower(${schema.brands.name})) LIKE unaccent(lower(${search})) || '%' THEN 0.25
                ELSE 0
              END
            ) * ${lengthBoost}
          `.as("score"),
        })
        .from(schema.pieces)
        .innerJoin(schema.brands, eq(schema.pieces.brandId, schema.brands.id))
        .innerJoin(schema.sizes, eq(schema.pieces.sizeId, schema.sizes.id))
        .leftJoin(
          schema.categories,
          eq(schema.pieces.categoryId, schema.categories.id)
        )
        .where(
          and(
            eq(schema.pieces.status, "published"),
            or(
              isNull(schema.pieces.reservedUntil),
              lte(schema.pieces.reservedUntil, new Date())
            ),
            or(
              isNull(schema.pieces.productId),
              exists(
                db
                  .select({ id: schema.products.id })
                  .from(schema.products)
                  .where(
                    and(
                      eq(schema.products.id, schema.pieces.productId),
                      eq(schema.products.status, "published")
                    )
                  )
              )
            ),
            sql`(
              (
                similarity(unaccent(lower(${schema.pieces.name})), unaccent(lower(${search}))) * ${FilterService.PIECE_SIMILARITY_NAME_MULTIPLIER} + 
                similarity(unaccent(lower(${schema.brands.name})), unaccent(lower(${search}))) * ${FilterService.PIECE_SIMILARITY_BRAND_MULTIPLIER} + 
                similarity(unaccent(lower(${schema.sizes.name})), unaccent(lower(${search}))) * ${FilterService.PIECE_SIMILARITY_SIZE_MULTIPLIER} + 
                COALESCE(similarity(unaccent(lower(${schema.categories.name})), unaccent(lower(${search}))), 0) * ${FilterService.PIECE_SIMILARITY_CATEGORY_MULTIPLIER} + 
                COALESCE(
                  (SELECT SUM(similarity(unaccent(lower(k)), unaccent(lower(${search}))))
                   FROM unnest(${schema.pieces.keywords}) AS k),
                  0
                ) * ${FilterService.PIECE_SIMILARITY_KEYWORDS_MULTIPLIER} +
                CASE 
                  WHEN unaccent(lower(${schema.pieces.name})) LIKE unaccent(lower(${search})) || '%' THEN 0.3
                  WHEN unaccent(lower(${schema.brands.name})) LIKE unaccent(lower(${search})) || '%' THEN 0.25
                  ELSE 0
                END
              ) * ${lengthBoost}
            ) > ${FilterService.SIMILARITY_LOWER_BOUND}`
          )
        )
        .orderBy(desc(sql`score`))
        .limit(take)
    );

    // ✅ Products - completely rewritten
    const rankedProducts = db.$with("ranked_products").as(
      db
        .select({
          id: schema.products.id,
          _type: sql<"product">`'product'`.as("_type"),
          score: sql<number>`
            (
              similarity(unaccent(lower(${schema.products.name})), unaccent(lower(${search}))) * ${FilterService.PRODUCT_SIMILARITY_NAME_MULTIPLIER} +
              COALESCE(
                (SELECT SUM(similarity(unaccent(lower(k)), unaccent(lower(${search}))))
                 FROM unnest(${schema.products.keywords}) AS k),
                0
              ) * ${FilterService.PRODUCT_SIMILARITY_KEYWORDS_MULTIPLIER} +
              COALESCE(
                (SELECT MAX(similarity(unaccent(lower(b.name)), unaccent(lower(${search}))))
                 FROM ${schema.pieces} pc
                 JOIN ${schema.brands} b ON b.id = pc.brand_id
                 WHERE pc.product_id = "products"."id"
                   AND pc.status = 'published'),
                0
              ) * ${FilterService.PRODUCT_SIMILARITY_BRAND_MULTIPLIER} +
              COALESCE(
                (SELECT MAX(similarity(unaccent(lower(s.name)), unaccent(lower(${search}))))
                 FROM ${schema.pieces} pc
                 JOIN ${schema.sizes} s ON s.id = pc.size_id
                 WHERE pc.product_id = "products"."id"
                   AND pc.status = 'published'),
                0
              ) * ${FilterService.PRODUCT_SIMILARITY_SIZE_MULTIPLIER} +
              COALESCE(
                (SELECT MAX(similarity(unaccent(lower(c.name)), unaccent(lower(${search}))))
                 FROM ${schema.pieces} pc
                 JOIN ${schema.categories} c ON c.id = pc.category_id
                 WHERE pc.product_id = "products"."id"
                   AND pc.status = 'published'),
                0
              ) * ${FilterService.PRODUCT_SIMILARITY_CATEGORY_MULTIPLIER} +
              CASE 
                WHEN unaccent(lower(${schema.products.name})) LIKE unaccent(lower(${search})) || '%' THEN 0.3
                ELSE 0
              END
            ) * ${lengthBoost}
          `.as("score"),
        })
        .from(schema.products)
        .where(
          and(
            eq(schema.products.status, "published"),
            exists(
              db
                .select({ id: schema.pieces.id })
                .from(schema.pieces)
                .where(
                  and(
                    eq(schema.pieces.productId, schema.products.id),
                    or(
                      isNull(schema.pieces.reservedUntil),
                      lte(schema.pieces.reservedUntil, new Date())
                    ),
                    eq(schema.pieces.status, "published")
                  )
                )
            ),
            sql`(
              (
                similarity(unaccent(lower(${schema.products.name})), unaccent(lower(${search}))) * ${FilterService.PRODUCT_SIMILARITY_NAME_MULTIPLIER} +
                COALESCE(
                  (SELECT SUM(similarity(unaccent(lower(k)), unaccent(lower(${search}))))
                   FROM unnest(${schema.products.keywords}) AS k),
                  0
                ) * ${FilterService.PRODUCT_SIMILARITY_KEYWORDS_MULTIPLIER} +
                COALESCE(
                  (SELECT MAX(similarity(unaccent(lower(b.name)), unaccent(lower(${search}))))
                   FROM ${schema.pieces} pc
                   JOIN ${schema.brands} b ON b.id = pc.brand_id
                   WHERE pc.product_id = "products"."id"
                     AND pc.status = 'published'),
                  0
                ) * ${FilterService.PRODUCT_SIMILARITY_BRAND_MULTIPLIER} +
                COALESCE(
                  (SELECT MAX(similarity(unaccent(lower(s.name)), unaccent(lower(${search}))))
                   FROM ${schema.pieces} pc
                   JOIN ${schema.sizes} s ON s.id = pc.size_id
                   WHERE pc.product_id = "products"."id"
                     AND pc.status = 'published'),
                  0
                ) * ${FilterService.PRODUCT_SIMILARITY_SIZE_MULTIPLIER} +
                COALESCE(
                  (SELECT MAX(similarity(unaccent(lower(c.name)), unaccent(lower(${search}))))
                   FROM ${schema.pieces} pc
                   JOIN ${schema.categories} c ON c.id = pc.category_id
                   WHERE pc.product_id = "products"."id"
                     AND pc.status = 'published'),
                  0
                ) * ${FilterService.PRODUCT_SIMILARITY_CATEGORY_MULTIPLIER} +
                CASE 
                  WHEN unaccent(lower(${schema.products.name})) LIKE unaccent(lower(${search})) || '%' THEN 0.3
                  ELSE 0
                END
              ) * ${lengthBoost}
            ) > ${FilterService.SIMILARITY_LOWER_BOUND}`
          )
        )
        .orderBy(desc(sql`score`))
        .limit(take)
    );

    // Rest of your code remains the same...
    const rankedIds = await db
      .with(rankedPieces, rankedProducts)
      .select({
        id: sql<string>`id`,
        _type: sql<"piece" | "product">`_type`,
        score: sql<number>`score`,
      })
      .from(
        sql`(
 SELECT * FROM ${rankedPieces}
 UNION ALL
 SELECT * FROM ${rankedProducts}
) AS combined`
      )
      .orderBy(desc(sql`score`))
      .limit(take);
    const pieceIds = rankedIds
      .filter((r) => r._type === "piece")
      .map((r) => r.id);
    const productIds = rankedIds
      .filter((r) => r._type === "product")
      .map((r) => r.id);

    const [pieces, products] = await Promise.all([
      db.query.pieces.findMany({
        where: inArray(schema.pieces.id, pieceIds),
        ...piece,
      }),
      db.query.products.findMany({
        where: inArray(schema.products.id, productIds),
        ...product,
      }),
    ]);

    const results = rankedIds
      .map((ranked) => {
        if (ranked._type === "piece") {
          const piece = pieces.find((p) => p.id === ranked.id);
          return {
            ...piece,
            _type: "piece" as const,
          };
        } else {
          const product = products.find((p) => p.id === ranked.id);
          return {
            ...product,
            _type: "product" as const,
          };
        }
      })
      .filter((i) => i !== undefined) as (
      | (DBQueryResult<"pieces", TPieceArgs> & { _type: "piece" })
      | (DBQueryResult<"products", TProductArgs> & { _type: "product" })
    )[];

    return results;
  }

  async findFilteredPieces<TArgs extends DBQueryArgs<"pieces", "one">>(
    args: TArgs = {} as TArgs,
    {
      category,
      brands: brandGroups,
      sizes: sizeGroups,
      tags,
      gender,
      priceMin,
      priceMax,
      limit,
      offset,
      sortBy,
      sortOrder,
      search,
    }: FilterArgs
  ) {
    const conditions = [];

    // Status condition: piece must be published AND (no product OR product is published)
    conditions.push(eq(schema.pieces.status, "published"));
    conditions.push(
      or(
        isNull(schema.pieces.productId),
        exists(
          db
            .select({ id: schema.products.id })
            .from(schema.products)
            .where(
              and(
                eq(schema.products.id, schema.pieces.productId),
                eq(schema.products.status, "published")
              )
            )
        )
      )
    );
    conditions.push(
      or(
        isNull(schema.pieces.reservedUntil),
        lte(schema.pieces.reservedUntil, new Date())
      )
    );

    // Brand groups filter - find pieces whose brand belongs to one of these brand groups (by slug)
    if (brandGroups && brandGroups.length > 0) {
      conditions.push(
        exists(
          db
            .select({ id: schema.brands.id })
            .from(schema.brands)
            .innerJoin(
              schema.brandGroups,
              eq(schema.brands.groupId, schema.brandGroups.id)
            )
            .where(
              and(
                eq(schema.brands.id, schema.pieces.brandId),
                inArray(schema.brandGroups.slug, brandGroups)
              )
            )
        )
      );
    }

    // Size groups filter - find pieces whose size belongs to one of these size groups (by slug)
    if (sizeGroups && sizeGroups.length > 0) {
      conditions.push(
        exists(
          db
            .select({ id: schema.sizes.id })
            .from(schema.sizes)
            .innerJoin(
              schema.sizeGroups,
              eq(schema.sizes.groupId, schema.sizeGroups.id)
            )
            .where(
              and(
                eq(schema.sizes.id, schema.pieces.sizeId),
                inArray(schema.sizeGroups.slug, sizeGroups)
              )
            )
        )
      );
    }

    // Gender filter
    if (gender !== undefined) {
      conditions.push(eq(schema.pieces.gender, gender));
    }

    // Price range filters
    if (priceMin !== undefined) {
      console.log("priceMin", priceMin);
      conditions.push(gte(schema.pieces.priceInGrosz, priceMin * 100));
    }
    if (priceMax !== undefined) {
      console.log("priceMax", priceMax);
      conditions.push(lte(schema.pieces.priceInGrosz, priceMax * 100));
    }

    // Category filter - find pieces whose category matches the slug
    // OR a descendant (category's path contains a category with this slug)
    if (category !== undefined) {
      conditions.push(
        exists(
          db
            .select({ id: schema.categories.id })
            .from(schema.categories)
            .where(
              and(
                eq(schema.categories.id, schema.pieces.categoryId),
                or(
                  eq(schema.categories.slug, category),
                  sql`EXISTS (
                  SELECT 1 FROM jsonb_array_elements(${schema.categories.path}) AS elem
                  WHERE (elem->>'slug')::text = ${category}
                )`
                )
              )
            )
        )
      );
    }

    // Tags filter - piece must have any of these tags (by slug)
    if (tags && tags.length > 0) {
      conditions.push(
        exists(
          db
            .select({ pieceId: schema.piecesToTags.pieceId })
            .from(schema.piecesToTags)
            .innerJoin(
              schema.tags,
              eq(schema.piecesToTags.tagId, schema.tags.id)
            )
            .where(
              and(
                eq(schema.piecesToTags.pieceId, schema.pieces.id),
                inArray(schema.tags.slug, tags)
              )
            )
        )
      );
    }

    // Build orderBy clause
    let orderByClause;
    const direction = sortOrder === "desc" ? desc : asc;

    console.log("sortBy", sortBy);
    switch (sortBy) {
      case "price":
        console.log("sortBy", sortBy);
        orderByClause = direction(schema.pieces.priceInGrosz);
        break;
      case "alphabetical":
        orderByClause = direction(schema.pieces.name);
        break;
      case "date":
      default:
        orderByClause = direction(schema.pieces.createdAt);
        break;
    }

    const whereClause = and(...conditions);

    // Get paginated results
    const pieces = (await db.query.pieces.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause,
      ...args,
    })) as DBQueryResult<"pieces", TArgs>[];

    // Get total count with same filters
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.pieces)
      .where(whereClause);

    return {
      pieces,
      total: count,
    };
  }

  async findFilteredProducts<TArgs extends DBQueryArgs<"products", "one">>(
    args: TArgs = {} as TArgs,
    {
      category,
      brands: brandGroups,
      sizes: sizeGroups,
      tags,
      priceMin,
      priceMax,
      limit,
      offset,
      sortBy,
      sortOrder,
      search,
    }: FilterArgs
  ) {
    const conditions = [];

    // Status condition: product must be published AND have at least one published piece
    conditions.push(eq(schema.products.status, "published"));
    conditions.push(
      exists(
        db
          .select({ id: schema.pieces.id })
          .from(schema.pieces)
          .where(
            and(
              eq(schema.pieces.productId, schema.products.id),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              ),
              eq(schema.pieces.status, "published")
            )
          )
      )
    );

    // Brand groups filter - product must have at least one piece with a brand in these groups (by slug)
    if (brandGroups && brandGroups.length > 0) {
      conditions.push(
        exists(
          db
            .select({ id: schema.pieces.id })
            .from(schema.pieces)
            .innerJoin(
              schema.brands,
              eq(schema.pieces.brandId, schema.brands.id)
            )
            .innerJoin(
              schema.brandGroups,
              eq(schema.brands.groupId, schema.brandGroups.id)
            )
            .where(
              and(
                eq(schema.pieces.productId, schema.products.id),
                eq(schema.pieces.status, "published"),
                or(
                  isNull(schema.pieces.reservedUntil),
                  lte(schema.pieces.reservedUntil, new Date())
                ),
                inArray(schema.brandGroups.slug, brandGroups)
              )
            )
        )
      );
    }

    // Size groups filter - product must have at least one piece with a size in these groups (by slug)
    if (sizeGroups && sizeGroups.length > 0) {
      conditions.push(
        exists(
          db
            .select({ id: schema.pieces.id })
            .from(schema.pieces)
            .innerJoin(schema.sizes, eq(schema.pieces.sizeId, schema.sizes.id))
            .innerJoin(
              schema.sizeGroups,
              eq(schema.sizes.groupId, schema.sizeGroups.id)
            )
            .where(
              and(
                eq(schema.pieces.productId, schema.products.id),
                eq(schema.pieces.status, "published"),
                or(
                  isNull(schema.pieces.reservedUntil),
                  lte(schema.pieces.reservedUntil, new Date())
                ),
                inArray(schema.sizeGroups.slug, sizeGroups)
              )
            )
        )
      );
    }

    // Category filter - product must have at least one piece in this category or its descendants (by slug)
    if (category !== undefined) {
      conditions.push(
        exists(
          db
            .select({ id: schema.pieces.id })
            .from(schema.pieces)
            .innerJoin(
              schema.categories,
              eq(schema.pieces.categoryId, schema.categories.id)
            )
            .where(
              and(
                eq(schema.pieces.productId, schema.products.id),
                eq(schema.pieces.status, "published"),
                or(
                  isNull(schema.pieces.reservedUntil),
                  lte(schema.pieces.reservedUntil, new Date())
                ),
                or(
                  eq(schema.categories.slug, category),
                  sql`EXISTS (
                    SELECT 1 FROM jsonb_array_elements(${schema.categories.path}) AS elem
                    WHERE (elem->>'slug')::text = ${category}
                  )`
                )
              )
            )
        )
      );
    }

    // Tags filter - product must have at least one piece with any of these tags (by slug)
    if (tags && tags.length > 0) {
      conditions.push(
        exists(
          db
            .select({ id: schema.pieces.id })
            .from(schema.pieces)
            .innerJoin(
              schema.piecesToTags,
              eq(schema.piecesToTags.pieceId, schema.pieces.id)
            )
            .innerJoin(
              schema.tags,
              eq(schema.piecesToTags.tagId, schema.tags.id)
            )
            .where(
              and(
                eq(schema.pieces.productId, schema.products.id),
                eq(schema.pieces.status, "published"),
                or(
                  isNull(schema.pieces.reservedUntil),
                  lte(schema.pieces.reservedUntil, new Date())
                ),
                inArray(schema.tags.slug, tags)
              )
            )
        )
      );
    }

    // Price range filters - calculated from product's pieces with skew applied
    if (priceMin !== undefined) {
      conditions.push(
        sql`(
          SELECT ROUND(
            (SUM("pieces"."price_in_grosz") * (100 - ${schema.products.pricePercentageSkew})) / 100
          )
          FROM ${schema.pieces}
          WHERE "pieces"."product_id" = ${schema.products.id}
            AND ${schema.pieces.status} = 'published'
            AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW())
            AND (pieces.product_id IS NULL OR pieces.product_id IN (SELECT id FROM products WHERE status = 'published') AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW()))
        ) >= ${priceMin}`
      );
    }

    if (priceMax !== undefined) {
      conditions.push(
        sql`(
          SELECT ROUND(
            (SUM("pieces"."price_in_grosz") * (100 - ${schema.products.pricePercentageSkew})) / 100
          )
          FROM ${schema.pieces}
          WHERE "pieces"."product_id" = ${schema.products.id}
            AND ${schema.pieces.status} = 'published'
            AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW())
            AND (pieces.product_id IS NULL OR pieces.product_id IN (SELECT id FROM products WHERE status = 'published') AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW()))
        ) <= ${priceMax}`
      );
    }

    // Build orderBy clause
    let orderByClause;
    const direction = sortOrder === "desc" ? desc : asc;

    switch (sortBy) {
      case "price":
        // Order by calculated price from pieces
        orderByClause = direction(
          sql`(
            SELECT ROUND(
              (SUM("pieces"."price_in_grosz") * (100 - ${schema.products.pricePercentageSkew})) / 100
            )
            FROM ${schema.pieces}
            WHERE "pieces"."product_id" = ${schema.products.id}
              AND ${schema.pieces.status} = 'published'
              AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW())
              AND (pieces.product_id IS NULL OR pieces.product_id IN (SELECT id FROM products WHERE status = 'published') AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW()))
          )`
        );
        break;
      case "alphabetical":
        orderByClause = direction(schema.products.name);
        break;
      case "date":
      default:
        orderByClause = direction(schema.products.createdAt);
        break;
    }

    const whereClause = and(...conditions);

    // Get paginated results
    const products = (await db.query.products.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: orderByClause,
      ...args,
    })) as DBQueryResult<"products", TArgs>[];

    // Get total count with same filters
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.products)
      .where(whereClause);

    return {
      products,
      total: count,
    };
  }
  /**
   * 1. Get all eligible pieces meaning descending from the category we are sent
   * 2. Get all brand groups, size groups, categories(all descending) and tags for these pieces also price range
   */
  async getPieceFilterData(categorySlug?: string) {
    // Base condition: piece must be published AND (no product OR product is published)
    const baseConditions = [
      eq(schema.pieces.status, "published"),
      or(
        isNull(schema.pieces.productId),
        exists(
          db
            .select({ id: schema.products.id })
            .from(schema.products)
            .where(
              and(
                eq(schema.products.id, schema.pieces.productId),
                eq(schema.products.status, "published"),
                or(
                  isNull(schema.pieces.reservedUntil),
                  lte(schema.pieces.reservedUntil, new Date())
                )
              )
            )
        )
      ),
    ];

    // Add category filter if provided - piece's category must be the specified category
    // OR a descendant (category's path contains the specified category)
    if (categorySlug) {
      // First get the category ID from the slug
      const category = await db.query.categories.findFirst({
        where: eq(schema.categories.slug, categorySlug),
        columns: { id: true },
      });

      if (category) {
        baseConditions.push(
          and(
            or(
              eq(schema.pieces.categoryId, category.id),
              exists(
                db
                  .select({ id: schema.categories.id })
                  .from(schema.categories)
                  .where(
                    and(
                      eq(schema.categories.id, schema.pieces.categoryId),
                      sql`EXISTS (
                    SELECT 1 FROM jsonb_array_elements(${schema.categories.path}) AS elem
                    WHERE (elem->>'slug')::text = ${categorySlug}
                    )`
                    )
                  )
              )
            ),
            ne(schema.pieces.categoryId, category.id)
          )
        );
      }
    }

    // Get all eligible piece IDs first
    const eligiblePieces = await db
      .select({ id: schema.pieces.id })
      .from(schema.pieces)
      .where(and(...baseConditions));

    const pieceIds = eligiblePieces.map((p) => p.id);

    if (pieceIds.length === 0) {
      return {
        brandGroups: [],
        sizeGroups: [],
        categories: [],
        tags: [],
        priceRange: { min: 0, max: 0 },
      };
    }

    const childCategories = alias(schema.categories, "child");

    // Get all filter data in parallel
    const [brandGroups, sizeGroups, categories, tags, priceRange] =
      await Promise.all([
        // Get brand groups for eligible pieces
        db
          .selectDistinct({
            id: schema.brandGroups.id,
            name: schema.brandGroups.name,
            slug: schema.brandGroups.slug,
            displayOrder: schema.brandGroups.displayOrder,
          })
          .from(schema.brandGroups)
          .innerJoin(
            schema.brands,
            eq(schema.brands.groupId, schema.brandGroups.id)
          )
          .innerJoin(schema.pieces, eq(schema.pieces.brandId, schema.brands.id))
          .where(inArray(schema.pieces.id, pieceIds))
          .orderBy(schema.brandGroups.displayOrder, schema.brandGroups.name),

        // Get size groups for eligible pieces
        db
          .selectDistinct({
            id: schema.sizeGroups.id,
            name: schema.sizeGroups.name,
            slug: schema.sizeGroups.slug,
            displayOrder: schema.sizeGroups.displayOrder,
          })
          .from(schema.sizeGroups)
          .innerJoin(
            schema.sizes,
            eq(schema.sizes.groupId, schema.sizeGroups.id)
          )
          .innerJoin(schema.pieces, eq(schema.pieces.sizeId, schema.sizes.id))
          .where(inArray(schema.pieces.id, pieceIds))
          .orderBy(schema.sizeGroups.displayOrder, schema.sizeGroups.name),
        db
          .selectDistinct({
            id: schema.categories.id,
            name: schema.categories.name,
            slug: schema.categories.slug,
            path: schema.categories.path,
            image: sql`(
              SELECT url FROM images 
              WHERE category_id = ${schema.categories.id} 
              ORDER BY display_order ASC 
              LIMIT 1
            )`.as("image"),
          })
          .from(schema.categories)
          .innerJoin(
            schema.pieces,
            eq(schema.pieces.categoryId, schema.categories.id)
          )
          .where(
            // 👇 properly correlated leaf check
            notExists(
              db
                .select()
                .from(childCategories)
                .where(eq(childCategories.parentId, schema.categories.id))
            )
          )
          .orderBy(schema.categories.name),

        // Get tags for eligible pieces
        db
          .selectDistinct({
            id: schema.tags.id,
            name: schema.tags.name,
            slug: schema.tags.slug,
          })
          .from(schema.tags)
          .innerJoin(
            schema.piecesToTags,
            eq(schema.piecesToTags.tagId, schema.tags.id)
          )
          .where(inArray(schema.piecesToTags.pieceId, pieceIds))
          .orderBy(schema.tags.name),

        // Get price range for eligible pieces
        db
          .select({
            min: sql<number>`MIN(${schema.pieces.priceInGrosz})`,
            max: sql<number>`MAX(${schema.pieces.priceInGrosz})`,
          })
          .from(schema.pieces)
          .where(inArray(schema.pieces.id, pieceIds))
          .then((result) => result[0] || { min: 0, max: 0 }),
      ]);

    return {
      brandGroups,
      sizeGroups,
      categories,
      tags,
      priceRange: {
        min: priceFromGrosz(priceRange.min),
        max: priceFromGrosz(priceRange.max),
      },
    };
  }

  /**
   * 1. Get all eligible products meaning all of them
   * 2. Get all brand groups, size groups, categories(all) and tags for the products's pieces
   * 3. Also price range (calculated dynamically from pieces)
   */
  async getProductFilterData() {
    // Base condition: product must be published AND have at least one published piece
    const baseConditions = [
      eq(schema.products.status, "published"),
      exists(
        db
          .select({ id: schema.pieces.id })
          .from(schema.pieces)
          .where(
            and(
              eq(schema.pieces.productId, schema.products.id),
              eq(schema.pieces.status, "published"),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              )
            )
          )
      ),
    ];

    // Get all eligible product IDs first
    const eligibleProducts = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(and(...baseConditions));

    const productIds = eligibleProducts.map((p) => p.id);

    if (productIds.length === 0) {
      return {
        brandGroups: [],
        sizeGroups: [],
        categories: [],
        tags: [],
        priceRange: { min: 0, max: 0 },
      };
    }

    // Get all filter data in parallel based on the product's pieces
    const [brandGroups, sizeGroups, categories, tags, priceRange] =
      await Promise.all([
        // Get brand groups from pieces of eligible products
        db
          .selectDistinct({
            id: schema.brandGroups.id,
            name: schema.brandGroups.name,
            slug: schema.brandGroups.slug,
            displayOrder: schema.brandGroups.displayOrder,
          })
          .from(schema.brandGroups)
          .innerJoin(
            schema.brands,
            eq(schema.brands.groupId, schema.brandGroups.id)
          )
          .innerJoin(schema.pieces, eq(schema.pieces.brandId, schema.brands.id))
          .where(
            and(
              inArray(schema.pieces.productId, productIds),
              eq(schema.pieces.status, "published"),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              )
            )
          )
          .orderBy(schema.brandGroups.displayOrder, schema.brandGroups.name),

        // Get size groups from pieces of eligible products
        db
          .selectDistinct({
            id: schema.sizeGroups.id,
            name: schema.sizeGroups.name,
            slug: schema.sizeGroups.slug,
            displayOrder: schema.sizeGroups.displayOrder,
          })
          .from(schema.sizeGroups)
          .innerJoin(
            schema.sizes,
            eq(schema.sizes.groupId, schema.sizeGroups.id)
          )
          .innerJoin(schema.pieces, eq(schema.pieces.sizeId, schema.sizes.id))
          .where(
            and(
              inArray(schema.pieces.productId, productIds),
              eq(schema.pieces.status, "published"),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              )
            )
          )
          .orderBy(schema.sizeGroups.displayOrder, schema.sizeGroups.name),

        // Get categories from pieces of eligible products
        db
          .selectDistinct({
            id: schema.categories.id,
            name: schema.categories.name,
            slug: schema.categories.slug,
          })
          .from(schema.categories)
          .innerJoin(
            schema.pieces,
            eq(schema.pieces.categoryId, schema.categories.id)
          )
          .where(
            and(
              inArray(schema.pieces.productId, productIds),
              eq(schema.pieces.status, "published"),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              )
            )
          )
          .orderBy(schema.categories.name),

        // Get tags from pieces of eligible products
        db
          .selectDistinct({
            id: schema.tags.id,
            name: schema.tags.name,
            slug: schema.tags.slug,
          })
          .from(schema.tags)
          .innerJoin(
            schema.piecesToTags,
            eq(schema.piecesToTags.tagId, schema.tags.id)
          )
          .innerJoin(
            schema.pieces,
            eq(schema.pieces.id, schema.piecesToTags.pieceId)
          )
          .where(
            and(
              inArray(schema.pieces.productId, productIds),
              eq(schema.pieces.status, "published"),
              or(
                isNull(schema.pieces.reservedUntil),
                lte(schema.pieces.reservedUntil, new Date())
              )
            )
          )
          .orderBy(schema.tags.name),

        // Get price range from products - calculate dynamically from pieces
        db
          .select({
            min: sql<number>`MIN(
          (
            SELECT ROUND(
              (SUM("pieces"."price_in_grosz") * (100 - ${schema.products.pricePercentageSkew})) / 100
            )
            FROM ${schema.pieces}
            WHERE "pieces"."product_id" = ${schema.products.id}
              AND ${schema.pieces.status} = 'published'
              AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW())
              AND (pieces.product_id IS NULL OR pieces.product_id IN (SELECT id FROM products WHERE status = 'published') AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW()))
          )
        )`,
            max: sql<number>`MAX(
          (
            SELECT ROUND(
              (SUM("pieces"."price_in_grosz") * (100 - ${schema.products.pricePercentageSkew})) / 100
            )
            FROM ${schema.pieces}
            WHERE "pieces"."product_id" = ${schema.products.id}
              AND ${schema.pieces.status} = 'published'
              AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW())
              AND (pieces.product_id IS NULL OR pieces.product_id IN (SELECT id FROM products WHERE status = 'published') AND (pieces.reserved_until IS NULL OR pieces.reserved_until > NOW()))
          )
        )`,
          })
          .from(schema.products)
          .where(inArray(schema.products.id, productIds))
          .then((result) => result[0] || { min: 0, max: 0 }),
      ]);

    return {
      brandGroups,
      sizeGroups,
      categories,
      tags,
      priceRange: {
        min: priceFromGrosz(priceRange.min),
        max: priceFromGrosz(priceRange.max),
      },
    };
  }

  async findSimilarPieces<TArgs extends DBQueryArgs<"pieces", "one">>(
    pieceId: string,
    args: TArgs = {} as TArgs,
    limit: number = 4
  ) {
    const sourcePiece = await db.query.pieces.findFirst({
      where: eq(schema.pieces.id, pieceId),
      with: {
        brand: true,
        size: true,
        category: true,
      },
    });

    if (!sourcePiece) {
      return [];
    }

    // Similarity multipliers
    const BRAND_EXACT_MATCH_BONUS = 2.0;
    const CATEGORY_SIMILARITY_MULTIPLIER = 1.2;
    const PRICE_PROXIMITY_MULTIPLIER = 0.8;
    const NAME_SIMILARITY_MULTIPLIER = 0.6;
    const SIZE_SIMILARITY_MULTIPLIER = 0.3;
    const GENDER_MATCH_BONUS = 0.5;

    const priceBuffer = sourcePiece.priceInGrosz * 0.3;
    const minPrice = sourcePiece.priceInGrosz - priceBuffer;
    const maxPrice = sourcePiece.priceInGrosz + priceBuffer;

    const similarPieces = await db
      .select({
        id: schema.pieces.id,
        score: sql<number>`
        (
          CASE 
            WHEN ${schema.pieces.brandId} = ${sourcePiece.brandId} THEN ${sql.raw(BRAND_EXACT_MATCH_BONUS.toString())}
            ELSE similarity(unaccent(lower(${schema.brands.name})), unaccent(lower(${sourcePiece.brand.name}))) * 0.5
          END +
          
          COALESCE(
            similarity(
              unaccent(lower(${schema.categories.name})), 
              unaccent(lower(${sourcePiece.category?.name || ""}))
            ), 
            0
          ) * ${sql.raw(CATEGORY_SIMILARITY_MULTIPLIER.toString())} +
          
          CASE 
            WHEN ${schema.pieces.priceInGrosz} BETWEEN ${minPrice} AND ${maxPrice} THEN
              (1.0 - ABS(${schema.pieces.priceInGrosz} - ${sourcePiece.priceInGrosz})::float / ${sql.raw(priceBuffer.toString())}) * ${sql.raw(PRICE_PROXIMITY_MULTIPLIER.toString())}
            ELSE 0
          END +
          
          similarity(
            unaccent(lower(${schema.pieces.name})), 
            unaccent(lower(${sourcePiece.name}))
          ) * ${sql.raw(NAME_SIMILARITY_MULTIPLIER.toString())} +
          
          similarity(
            unaccent(lower(${schema.sizes.name})), 
            unaccent(lower(${sourcePiece.size.name}))
          ) * ${sql.raw(SIZE_SIMILARITY_MULTIPLIER.toString())} +
          
          CASE 
            WHEN ${schema.pieces.gender} = ${sourcePiece.gender} THEN ${sql.raw(GENDER_MATCH_BONUS.toString())}
            ELSE 0
          END
        )
      `.as("score"),
      })
      .from(schema.pieces)
      .innerJoin(schema.brands, eq(schema.pieces.brandId, schema.brands.id))
      .innerJoin(schema.sizes, eq(schema.pieces.sizeId, schema.sizes.id))
      .leftJoin(
        schema.categories,
        eq(schema.pieces.categoryId, schema.categories.id)
      )
      .where(
        and(
          sql`${schema.pieces.id} != ${pieceId}`,
          eq(schema.pieces.status, "published"),
          or(
            isNull(schema.pieces.reservedUntil),
            lte(schema.pieces.reservedUntil, new Date())
          ),
          or(
            isNull(schema.pieces.productId),
            exists(
              db
                .select({ id: schema.products.id })
                .from(schema.products)
                .where(
                  and(
                    eq(schema.products.id, schema.pieces.productId),
                    eq(schema.products.status, "published"),
                    or(
                      isNull(schema.pieces.reservedUntil),
                      lte(schema.pieces.reservedUntil, new Date())
                    )
                  )
                )
            )
          ),
          // Duplicate the scoring logic in WHERE clause
          sql`(
            CASE 
              WHEN ${schema.pieces.brandId} = ${sourcePiece.brandId} THEN ${sql.raw(BRAND_EXACT_MATCH_BONUS.toString())}
              ELSE similarity(unaccent(lower(${schema.brands.name})), unaccent(lower(${sourcePiece.brand.name}))) * 0.5
            END +
            COALESCE(
              similarity(
                unaccent(lower(${schema.categories.name})), 
                unaccent(lower(${sourcePiece.category?.name || ""}))
              ), 
              0
            ) * ${sql.raw(CATEGORY_SIMILARITY_MULTIPLIER.toString())} +
            CASE 
              WHEN ${schema.pieces.priceInGrosz} BETWEEN ${minPrice} AND ${maxPrice} THEN
                (1.0 - ABS(${schema.pieces.priceInGrosz} - ${sourcePiece.priceInGrosz})::float / ${sql.raw(priceBuffer.toString())}) * ${sql.raw(PRICE_PROXIMITY_MULTIPLIER.toString())}
              ELSE 0
            END +
            similarity(
              unaccent(lower(${schema.pieces.name})), 
              unaccent(lower(${sourcePiece.name}))
            ) * ${sql.raw(NAME_SIMILARITY_MULTIPLIER.toString())} +
            similarity(
              unaccent(lower(${schema.sizes.name})), 
              unaccent(lower(${sourcePiece.size.name}))
            ) * ${sql.raw(SIZE_SIMILARITY_MULTIPLIER.toString())} +
            CASE 
              WHEN ${schema.pieces.gender} = ${sourcePiece.gender} THEN ${sql.raw(GENDER_MATCH_BONUS.toString())}
              ELSE 0
            END
          ) > 0.5`
        )
      )
      .orderBy(desc(sql`score`))
      .limit(limit);

    const pieceIds = similarPieces.map((p) => p.id);

    if (pieceIds.length === 0) {
      return [];
    }

    const pieces = (await db.query.pieces.findMany({
      where: inArray(schema.pieces.id, pieceIds),
      ...args,
    })) as DBQueryResult<"pieces", TArgs>[];

    return pieceIds
      .map((id) => pieces.find((p) => p.id === id))
      .filter((p) => p !== undefined) as DBQueryResult<"pieces", TArgs>[];
  }
}
const filterService = new FilterService(
  logger.child({ service: "FilterService" })
);

export { filterService, FilterService };
