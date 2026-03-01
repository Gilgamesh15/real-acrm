CREATE TYPE "public"."delivery_method" AS ENUM('locker', 'courier');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'unisex');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'cancelled', 'processing', 'in_transit', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'in_checkout', 'sold', 'return_requested', 'returned');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT -1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" uuid,
	"featured_order" integer DEFAULT -1 NOT NULL,
	"path" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" text NOT NULL,
	"consent_id" uuid NOT NULL,
	"categories" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount_off_in_grosz" integer,
	"name" text,
	"percent_off" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "either_percent_off_or_amount_off_in_grosz_check" CHECK ("discounts"."percent_off" IS NOT NULL OR "discounts"."amount_off_in_grosz" IS NOT NULL),
	CONSTRAINT "percent_off_range_check" CHECK ("discounts"."percent_off" IS NULL OR ("discounts"."percent_off" >= 1 AND "discounts"."percent_off" <= 100)),
	CONSTRAINT "amount_off_positive_check" CHECK ("discounts"."amount_off_in_grosz" IS NULL OR "discounts"."amount_off_in_grosz" > 0)
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alt" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"filesize" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"display_order" integer DEFAULT -1 NOT NULL,
	"piece_id" uuid,
	"product_id" uuid,
	"category_id" uuid,
	"tag_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "filesize_positive_check" CHECK ("images"."filesize" > 0),
	CONSTRAINT "width_positive_check" CHECK ("images"."width" > 0),
	CONSTRAINT "height_positive_check" CHECK ("images"."height" > 0)
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" integer NOT NULL,
	"unit" text DEFAULT 'mm' NOT NULL,
	"display_order" integer DEFAULT -1 NOT NULL,
	"piece_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"discount_amount_in_grosz" integer NOT NULL,
	"line_total_in_grosz" integer NOT NULL,
	"tax_in_grosz" integer NOT NULL,
	"unit_price_in_grosz" integer NOT NULL,
	"product_id" uuid,
	"piece_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "order_status" NOT NULL,
	"order_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"stripe_checkout_session_id" text,
	"subtotal_in_grosz" integer NOT NULL,
	"tax_in_grosz" integer NOT NULL,
	"total_discount_in_grosz" integer NOT NULL,
	"total_in_grosz" integer NOT NULL,
	"phone_number" text,
	"email" text,
	"billing_name" text,
	"billing_address_city" text,
	"billing_address_country" text,
	"billing_address_line1" text,
	"billing_address_line2" text,
	"billing_address_postal_code" text,
	"delivery_name" text,
	"delivery_method" "delivery_method",
	"locker_code" text,
	"shipping_address_city" text,
	"shipping_address_country" text,
	"shipping_address_line1" text,
	"shipping_address_line2" text,
	"shipping_address_postal_code" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pieces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gender" "gender" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"price_in_grosz" integer NOT NULL,
	"keywords" text[] DEFAULT '{}',
	"home_featured_order" integer DEFAULT -1 NOT NULL,
	"reserved_until" timestamp,
	"reserved_by_user_id" text,
	"product_display_order" integer DEFAULT -1 NOT NULL,
	"brand_id" uuid,
	"size_id" uuid,
	"category_id" uuid,
	"product_id" uuid,
	"discount_id" uuid,
	"description" jsonb,
	"meta_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"og_description" text NOT NULL,
	"bullet_points" text[] DEFAULT '{}',
	"condition" text NOT NULL,
	"color" text,
	"material" text,
	"pattern" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_in_grosz_check" CHECK ("pieces"."price_in_grosz" > 0)
);
--> statement-breakpoint
CREATE TABLE "piece_to_tags" (
	"piece_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "piece_to_tags_piece_id_tag_id_pk" PRIMARY KEY("piece_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"keywords" text[] DEFAULT '{}',
	"description" jsonb NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"home_featured_order" integer DEFAULT -1 NOT NULL,
	"featured_order" integer DEFAULT -1 NOT NULL,
	"discount_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sizes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT -1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"featured_order" integer DEFAULT -1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"name" text DEFAULT 'Better Auth User',
	"image" text,
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone_number" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"role" text,
	"stripe_customer_id" text,
	"accepted_terms" boolean DEFAULT false,
	"accepted_marketing" boolean DEFAULT false,
	"accepted_privacy" boolean DEFAULT false,
	"default_locker_name" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"is_anonymous" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_piece_id_pieces_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."pieces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_piece_id_pieces_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_piece_id_pieces_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_timeline_events" ADD CONSTRAINT "order_timeline_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_reserved_by_user_id_users_id_fk" FOREIGN KEY ("reserved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_size_id_sizes_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piece_to_tags" ADD CONSTRAINT "piece_to_tags_piece_id_pieces_id_fk" FOREIGN KEY ("piece_id") REFERENCES "public"."pieces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piece_to_tags" ADD CONSTRAINT "piece_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "brands_name_unaccent_trgm_idx" ON "brands" USING gin (unaccent(lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_index" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_name_unaccent_trgm_idx" ON "categories" USING gin (unaccent(lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_index" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_id_index" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_featured_order_index" ON "categories" USING btree ("featured_order") WHERE "categories"."featured_order" > -1;--> statement-breakpoint
CREATE INDEX "consent_records_visitor_id_index" ON "consent_records" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "consent_records_consent_id_index" ON "consent_records" USING btree ("consent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "discounts_name_index" ON "discounts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "images_piece_id_index" ON "images" USING btree ("piece_id");--> statement-breakpoint
CREATE INDEX "images_product_id_index" ON "images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "images_category_id_index" ON "images" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "images_tag_id_index" ON "images" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "images_tag_id_unique" ON "images" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "images_category_tag_unique" ON "images" USING btree ("category_id","tag_id");--> statement-breakpoint
CREATE INDEX "measurements_piece_id_index" ON "measurements" USING btree ("piece_id");--> statement-breakpoint
CREATE INDEX "measurements_piece_id_display_order_index" ON "measurements" USING btree ("piece_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscribers_email_index" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "order_items_order_id_index" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_index" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_items_piece_id_index" ON "order_items" USING btree ("piece_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_items_order_id_piece_id_index" ON "order_items" USING btree ("order_id","piece_id");--> statement-breakpoint
CREATE INDEX "order_timeline_events_order_id_index" ON "order_timeline_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_index" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_order_number_index" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_stripe_checkout_session_id_index" ON "orders" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "pieces_name_unaccent_trgm_idx" ON "pieces" USING gin (unaccent(lower("name")) gin_trgm_ops) WHERE "pieces"."status" = 'published' OR "pieces"."status" = 'in_checkout';--> statement-breakpoint
CREATE UNIQUE INDEX "pieces_slug_index" ON "pieces" USING btree ("slug") WHERE "pieces"."status" = 'published' OR "pieces"."status" = 'in_checkout';--> statement-breakpoint
CREATE INDEX "pieces_brand_id_index" ON "pieces" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "pieces_size_id_index" ON "pieces" USING btree ("size_id");--> statement-breakpoint
CREATE INDEX "pieces_category_id_index" ON "pieces" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "pieces_discount_id_index" ON "pieces" USING btree ("discount_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pieces_home_featured_order_product_id_index" ON "pieces" USING btree ("home_featured_order","product_id") WHERE "pieces"."product_id" IS NOT NULL AND "pieces"."home_featured_order" > -1;--> statement-breakpoint
CREATE UNIQUE INDEX "pieces_product_display_order_product_id_index" ON "pieces" USING btree ("product_display_order","product_id") WHERE "pieces"."product_id" IS NOT NULL AND "pieces"."product_display_order" > -1;--> statement-breakpoint
CREATE INDEX "pieces_product_id_index" ON "pieces" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "pieces_reserved_by_user_id_index" ON "pieces" USING btree ("reserved_by_user_id");--> statement-breakpoint
CREATE INDEX "piece_to_tags_piece_id_index" ON "piece_to_tags" USING btree ("piece_id");--> statement-breakpoint
CREATE INDEX "piece_to_tags_tag_id_index" ON "piece_to_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_index" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_status_index" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_name_unaccent_trgm_idx" ON "products" USING gin (unaccent(lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "products_featured_order_index" ON "products" USING btree ("featured_order") WHERE "products"."featured_order" > -1;--> statement-breakpoint
CREATE INDEX "products_discount_id_index" ON "products" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sizes_name_unaccent_trgm_idx" ON "sizes" USING gin (unaccent(lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sizes_slug_index" ON "sizes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_name_unaccent_trgm_idx" ON "tags" USING gin (unaccent(lower("name")) gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_index" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_featured_order_index" ON "tags" USING btree ("featured_order") WHERE "tags"."featured_order" > -1;--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");