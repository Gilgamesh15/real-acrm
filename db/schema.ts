import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { ConsentCategories } from "~/components/features/cookie-consent";
import type { RichText, TreeNodePathSegment } from "~/lib/types";

export const genderEnum = pgEnum("gender", ["male", "female", "unisex"]);

export const deliveryMethodEnum = pgEnum("delivery_method", [
  "locker",
  "courier",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "cancelled",
  "processing",
  "in_transit",
  "delivered",
]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "in_checkout",
  "sold",
  "return_requested",
  "returned",
]);
export const returnStatusEnum = pgEnum("return_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "set null",
    }),
    // order for home page
    featuredOrder: integer("featured_order").notNull().default(-1),
    path: jsonb("path").notNull().$type<Array<TreeNodePathSegment>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("categories_name_unaccent_trgm_idx").using(
      "gin",
      sql`unaccent(lower(${table.name})) gin_trgm_ops`
    ),
    uniqueIndex().on(table.slug),
    index().on(table.parentId),
    uniqueIndex()
      .on(table.featuredOrder)
      .where(sql`${table.featuredOrder} > -1`),
  ]
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_hierarchy",
  }),
  children: many(categories, {
    relationName: "category_hierarchy",
  }),
  pieces: many(pieces),
  image: one(images),
}));

export const users = pgTable("users", {
  // Better auth requires these fields
  name: text("name").default("Better Auth User"),
  image: text("image"),
  //
  id: text("id").primaryKey(),

  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  role: text("role"),
  stripeCustomerId: text("stripe_customer_id"),

  // legal
  acceptedTerms: boolean("accepted_terms").default(false),
  acceptedMarketing: boolean("accepted_marketing").default(false),
  acceptedPrivacy: boolean("accepted_privacy").default(false),

  // preferences
  defaultLockerName: text("default_locker_name"),

  // better auth admin plugin
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),

  // anonymous user
  isAnonymous: boolean("is_anonymous").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
  returns: many(returns),
  reservedPieces: many(pieces, {
    relationName: "reserved_pieces",
  }),
}));

export const sizes = pgTable(
  "sizes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),

    groupId: uuid("group_id").references(() => sizeGroups.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("sizes_name_unaccent_trgm_idx").using(
      "gin",
      sql`unaccent(lower(${table.name})) gin_trgm_ops`
    ),
    index().on(table.groupId),
  ]
);

export const sizesRelations = relations(sizes, ({ one, many }) => ({
  group: one(sizeGroups, {
    fields: [sizes.groupId],
    references: [sizeGroups.id],
  }),
  pieces: many(pieces),
}));

export const sizeGroups = pgTable(
  "size_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),
    // order for filters
    displayOrder: integer("display_order").notNull().default(-1),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex().on(table.slug),
    uniqueIndex()
      .on(table.displayOrder)
      .where(sql`${table.displayOrder} > -1`),
  ]
);

export const sizeGroupsRelations = relations(sizeGroups, ({ many }) => ({
  sizes: many(sizes),
}));

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),

    groupId: uuid("group_id").references(() => brandGroups.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("brands_name_unaccent_trgm_idx").using(
      "gin",
      sql`unaccent(lower(${table.name})) gin_trgm_ops`
    ),
    index().on(table.groupId),
  ]
);

export const brandsRelations = relations(brands, ({ one, many }) => ({
  group: one(brandGroups, {
    fields: [brands.groupId],
    references: [brandGroups.id],
  }),
  pieces: many(pieces),
}));

export const brandGroups = pgTable(
  "brand_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    // order for filters
    displayOrder: integer("display_order").notNull().default(-1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex().on(table.slug),
    uniqueIndex()
      .on(table.displayOrder)
      .where(sql`${table.displayOrder} > -1`),
  ]
);

export const brandGroupsRelations = relations(brandGroups, ({ many }) => ({
  brands: many(brands),
}));

export const orderTimelineEvents = pgTable(
  "order_timeline_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    status: orderStatusEnum("status").notNull(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),

    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [index().on(table.orderId)]
);

export const orderTimelineEventsRelations = relations(
  orderTimelineEvents,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderTimelineEvents.orderId],
      references: [orders.id],
    }),
  })
);

export const returns = pgTable(
  "returns",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    returnNumber: text("return_number").notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "restrict",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "set null",
      }),
    // contact details
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phoneNumber: text("phone_number").notNull(),
    email: text("email").notNull(),

    // address
    city: text("city").notNull(),
    country: text("country").notNull().default("PL"),
    line1: text("line1").notNull(),
    line2: text("line2"),
    postalCode: text("postal_code").notNull(),
    state: text("state").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.orderId),
    index().on(table.userId),
    uniqueIndex().on(table.returnNumber),
  ]
);

export const returnsRelations = relations(returns, ({ one, many }) => ({
  user: one(users, {
    fields: [returns.userId],
    references: [users.id],
  }),
  items: many(returnItems),
  order: one(orders, {
    fields: [returns.orderId],
    references: [orders.id],
  }),
}));

export const returnTimelineEvents = pgTable(
  "return_timeline_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: returnStatusEnum("status").notNull(),
    returnItemId: uuid("return_item_id")
      .notNull()
      .references(() => returnItems.id, {
        onDelete: "cascade",
      }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [index().on(table.returnItemId)]
);

export const returnTimelineEventsRelations = relations(
  returnTimelineEvents,
  ({ one }) => ({
    returnItem: one(returnItems, {
      fields: [returnTimelineEvents.returnItemId],
      references: [returnItems.id],
    }),
  })
);

export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    alt: text("alt").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    filesize: integer("filesize").notNull(), // bytes
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    displayOrder: integer("display_order").default(-1).notNull(),

    pieceId: uuid("piece_id").references(() => pieces.id, {
      onDelete: "set null",
    }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    tagId: uuid("tag_id").references(() => tags.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.pieceId),
    index().on(table.productId),
    index().on(table.categoryId),
    index().on(table.tagId),
    check("filesize_positive_check", sql`${table.filesize} > 0`),
    check("width_positive_check", sql`${table.width} > 0`),
    check("height_positive_check", sql`${table.height} > 0`),
    uniqueIndex("images_tag_id_unique").on(table.tagId),
    uniqueIndex("images_category_tag_unique").on(table.categoryId, table.tagId),
  ]
);

export const imagesRelations = relations(images, ({ one }) => ({
  category: one(categories, {
    fields: [images.categoryId],
    references: [categories.id],
  }),
  piece: one(pieces, {
    fields: [images.pieceId],
    references: [pieces.id],
  }),
  products: one(products, {
    fields: [images.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [images.tagId],
    references: [tags.id],
  }),
}));

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    keywords: text("keywords").array().default([]),
    description: jsonb("description").notNull().$type<RichText>(),
    status: productStatusEnum("status").default("draft").notNull(),
    // order for top of home page
    homeFeaturedOrder: integer("home_featured_order").default(-1).notNull(),
    // order for bottom of home page
    featuredOrder: integer("featured_order").default(-1).notNull(),
    pricePercentageSkew: integer("price_percentage_skew").notNull().default(0), // if pieces cost 10000 grosz + 5000 grosz and skew is 10 then the price will be (10000 grosz + 5000 grosz) * 0.90 =  13500 grosz

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex().on(table.slug),
    index().on(table.status),
    index("products_name_unaccent_trgm_idx").using(
      "gin",
      sql`unaccent(lower(${table.name})) gin_trgm_ops`
    ),
    uniqueIndex()
      .on(table.featuredOrder)
      .where(sql`${table.featuredOrder} > -1`),
  ]
);

export const productsRelations = relations(products, ({ many }) => ({
  pieces: many(pieces),
  images: many(images),
}));

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    subtotalInGrosz: integer("subtotal_in_grosz").notNull(),
    taxInGrosz: integer("tax_in_grosz").notNull(),
    totalDiscountInGrosz: integer("total_discount_in_grosz").notNull(),
    totalInGrosz: integer("total_in_grosz").notNull(),

    // Contact information - optional until webhook
    phoneNumber: text("phone_number"),
    email: text("email"),

    // Billing information - optional until webhook
    billingName: text("billing_name"),
    billingAddressCity: text("billing_address_city"),
    billingAddressCountry: text("billing_address_country"),
    billingAddressLine1: text("billing_address_line1"),
    billingAddressLine2: text("billing_address_line2"),
    billingAddressPostalCode: text("billing_address_postal_code"),

    // Delivery information - optional until webhook
    deliveryName: text("delivery_name"),
    deliveryMethod: deliveryMethodEnum("delivery_method"), // "courier" | "locker"

    // Locker delivery fields
    lockerCode: text("locker_code"),

    // Courier delivery fields
    shippingAddressCity: text("shipping_address_city"),
    shippingAddressCountry: text("shipping_address_country"),
    shippingAddressLine1: text("shipping_address_line1"),
    shippingAddressLine2: text("shipping_address_line2"),
    shippingAddressPostalCode: text("shipping_address_postal_code"),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "set null",
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.userId),
    index().on(table.orderNumber),
    index().on(table.stripeCheckoutSessionId),
  ]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  events: many(orderTimelineEvents),
  returns: many(returns),
}));

export const returnItems = pgTable(
  "return_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    returnId: uuid("return_id")
      .notNull()
      .references(() => returns.id, {
        onDelete: "cascade",
      }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.returnId),
    index().on(table.orderItemId),
    uniqueIndex().on(table.returnId, table.orderItemId),
  ]
);

export const returnItemsRelations = relations(returnItems, ({ one, many }) => ({
  return: one(returns, {
    fields: [returnItems.returnId],
    references: [returns.id],
  }),
  events: many(returnTimelineEvents),
  orderItem: one(orderItems, {
    fields: [returnItems.orderItemId],
    references: [orderItems.id],
  }),
}));

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, {
        onDelete: "cascade",
      }),
    discountAmountInGrosz: integer("discount_amount_in_grosz").notNull(),
    lineTotalInGrosz: integer("line_total_in_grosz").notNull(),
    taxInGrosz: integer("tax_in_grosz").notNull(),
    unitPriceInGrosz: integer("unit_price_in_grosz").notNull(),

    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    pieceId: uuid("piece_id")
      .references(() => pieces.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.orderId),
    index().on(table.productId),
    index().on(table.pieceId),
    uniqueIndex().on(table.orderId, table.pieceId),
  ]
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  piece: one(pieces, {
    fields: [orderItems.pieceId],
    references: [pieces.id],
  }),
}));

export const piecesToTags = pgTable(
  "piece_to_tags",
  {
    pieceId: uuid("piece_id")
      .notNull()
      .references(() => pieces.id, {
        onDelete: "cascade",
      }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, {
        onDelete: "cascade",
      }),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.pieceId, table.tagId] }),
    index().on(table.pieceId),
    index().on(table.tagId),
  ]
);

export const piecesToTagsRelations = relations(piecesToTags, ({ one }) => ({
  piece: one(pieces, {
    fields: [piecesToTags.pieceId],
    references: [pieces.id],
    relationName: "piece_to_tags",
  }),
  tag: one(tags, {
    fields: [piecesToTags.tagId],
    references: [tags.id],
  }),
}));

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    // order for home page
    featuredOrder: integer("featured_order").default(-1).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tags_name_unaccent_trgm_idx").using(
      "gin",
      sql`unaccent(lower(${table.name})) gin_trgm_ops`
    ),
    uniqueIndex().on(table.slug),
    uniqueIndex()
      .on(table.featuredOrder)
      .where(sql`${table.featuredOrder} > -1`),
  ]
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
  piecesToTags: many(piecesToTags),
  image: one(images),
}));

export const pieces = pgTable(
  "pieces",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    gender: genderEnum("gender").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: productStatusEnum("status").default("draft").notNull(),
    priceInGrosz: integer("price_in_grosz").notNull(),
    keywords: text("keywords").array().default([]),
    // order for top of home page
    homeFeaturedOrder: integer("home_featured_order").default(-1).notNull(),
    reservedUntil: timestamp("reserved_until"),
    reservedByUserId: text("reserved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    productDisplayOrder: integer("product_display_order").default(-1).notNull(),

    brandId: uuid("brand_id")
      .references(() => brands.id, {
        onDelete: "set null",
      })
      .notNull(),
    sizeId: uuid("size_id")
      .references(() => sizes.id, {
        onDelete: "set null",
      })
      .notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("pieces_name_unaccent_trgm_idx")
      .using("gin", sql`unaccent(lower(${table.name})) gin_trgm_ops`)
      .where(
        sql`${table.status} = 'published' OR ${table.status} = 'in_checkout'`
      ),
    uniqueIndex()
      .on(table.slug)
      .where(
        sql`${table.status} = 'published' OR ${table.status} = 'in_checkout'`
      ),
    index().on(table.brandId),
    index().on(table.sizeId),
    index().on(table.categoryId),
    uniqueIndex()
      .on(table.homeFeaturedOrder, table.productId)
      .where(
        sql`${table.productId} IS NOT NULL AND ${table.homeFeaturedOrder} > -1`
      ),
    check("price_in_grosz_check", sql`${table.priceInGrosz} > 0`),
    uniqueIndex()
      .on(table.productDisplayOrder, table.productId)
      .where(
        sql`${table.productId} IS NOT NULL AND ${table.productDisplayOrder} > -1`
      ),
    index().on(table.productId),
    index().on(table.reservedByUserId),
  ]
);

export const piecesRelations = relations(pieces, ({ one, many }) => ({
  brand: one(brands, {
    fields: [pieces.brandId],
    references: [brands.id],
  }),
  reservedByUser: one(users, {
    fields: [pieces.reservedByUserId],
    references: [users.id],
    relationName: "reserved_pieces",
  }),
  size: one(sizes, {
    fields: [pieces.sizeId],
    references: [sizes.id],
  }),
  category: one(categories, {
    fields: [pieces.categoryId],
    references: [categories.id],
  }),
  images: many(images),
  measurements: many(measurements),
  piecesToTags: many(piecesToTags, {
    relationName: "piece_to_tags",
  }),
  product: one(products, {
    fields: [pieces.productId],
    references: [products.id],
  }),
}));

export const measurements = pgTable(
  "measurements",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: text("name").notNull(),
    value: integer("value").notNull(),
    unit: text("unit").notNull().default("mm"),
    // order for appearing in the UI
    displayOrder: integer("display_order").notNull().default(-1),

    pieceId: uuid("piece_id")
      .notNull()
      .references(() => pieces.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index().on(table.pieceId),
    index().on(table.pieceId, table.displayOrder),
  ]
);

export const measurementsRelations = relations(measurements, ({ one }) => ({
  piece: one(pieces, {
    fields: [measurements.pieceId],
    references: [pieces.id],
  }),
}));

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    amountOffInGrosz: integer("amount_off_in_grosz"),
    maxUsages: integer("max_usages"),
    name: text("name"),
    percentOff: integer("percent_off"),
    expiresAt: timestamp("expires_at"),
    usages: integer("usages").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex().on(table.name),
    check(
      "either_percent_off_or_amount_off_in_grosz_check",
      sql`${table.percentOff} IS NOT NULL OR ${table.amountOffInGrosz} IS NOT NULL`
    ),
  ]
);

export const couponsToProducts = pgTable(
  "coupons_to_products",
  {
    couponId: uuid("coupon_id")
      .references(() => coupons.id, {
        onDelete: "cascade",
      })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.couponId, table.productId] }),
    index().on(table.couponId),
    index().on(table.productId),
  ]
);

export const promotionCodes = pgTable(
  "promotion_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    redeemableByUserId: text("redeemable_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      }
    ),
    expiresAt: timestamp("expires_at"),
    maxUsages: integer("max_usages"),
    couponId: uuid("coupon_id")
      .references(() => coupons.id, {
        onDelete: "set null",
      })
      .notNull(),
    firstTimeTransaction: boolean("first_time_transaction")
      .default(false)
      .notNull(),
    minimumAmountInGrosz: integer("minimum_amount_in_grosz"),
    usages: integer("usages").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex().on(table.code)]
);

export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    visitorId: text("visitor_id").notNull(),
    consentId: uuid("consent_id").notNull(),
    categories: jsonb("categories").notNull().$type<ConsentCategories>(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [index().on(table.visitorId), index().on(table.consentId)]
);
