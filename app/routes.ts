import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  // API
  ...prefix("/api", [
    route("/products", "./api/products/api.ts"),
    route("/featured-products", "./api/featured-products/api.ts"),
    route("/pieces", "./api/pieces/api.ts"),
    route("/categories", "./api/categories/api.ts"),
    route("/tags", "./api/tags/index.ts"),

    // Brands
    ...prefix("/brands", [
      index("./api/brands/brands.handlers.ts"),
      route("/:slug", "./api/brands/:slug/brands-by-slug.handlers.ts"),
    ]),

    // Sizes
    ...prefix("/sizes", [
      index("./api/sizes/sizes.handlers.ts"),
      route("/:slug", "./api/sizes/:slug/sizes-by-slug.handlers.ts"),
    ]),
  ]),
  // API
  route("/api/auth/*", "./api/auth.ts"),
  route("/api/cart", "./api/cart.ts"),
  route("/api/filter-items", "./api/filter-items.ts"),
  route("/api/openmap-search", "./api/openmap-search.ts"),
  route("/api/inpost-lockers", "./api/inpost-lockers.ts"),
  route("/api/default-locker", "./api/default-locker.ts"),
  route("/api/webhooks/stripe", "./api/stripe-webhook.ts"),
  route("/api/create-order", "./api/create-order.ts"),
  route("/sitemap.xml", "./api/sitemap.ts"),
  route("/robots.txt", "./api/robots.ts"),
  route("/site.webmanifest", "./api/webmanifest.ts"),
  route("/api/cancel-order", "./api/cancel-order.ts"),
  route("/api/pending-order", "./api/pending-order.ts"),
  route("/api/return-order", "./api/return-order.ts"),
  route("/api/create-return", "./api/create-return.ts"),
  route(
    "/api/google-consent-traceability",
    "./api/google-consent-traceability.ts"
  ),
  route("/produkt/*", "./legacy-product-detail-redirect.page.tsx"),
  route("/produkty/*", "./legacy-product-browse-redirect.page.tsx"),

  // Account
  ...prefix("/konto", [
    layout("./routes/account/account.layout.tsx", [
      index("./routes/account/profile.page.tsx"),
      ...prefix("/zamowienia", [
        index("./routes/account/orders-list.page.tsx"),
        route(":orderNumber", "./routes/account/orders-detail.page.tsx"),
      ]),
      route("prywatnosc", "./routes/account/privacy.page.tsx"),
    ]),
  ]),

  // Main
  layout("./routes/main/main.layout.tsx", [
    // Home
    index("./routes/main/home.page.tsx"),

    // Product
    ...prefix("/projekty", [
      index("./routes/main/products/products-browse.page.tsx"),
      route(
        "/:productSlug",
        "./routes/main/products/single-product/product-detail.page.tsx"
      ),
    ]),

    // Categories
    route("/kategorie/*", "./routes/main/pieces/pieces-browse.page.tsx"),
    // Pieces
    route("/ubrania/:pieceSlug", "./routes/main/pieces/piece-detail.page.tsx"),

    // Legal
    route("/regulamin", "./routes/main/legal/terms-of-service.page.tsx"),
    route("/reklamacje", "./routes/main/legal/claims.page.tsx"),
    route(
      "/odstapienie-od-umowy",
      "./routes/main/legal/right-of-withdrawal.page.tsx"
    ),
    route(
      "/polityka-prywatnosci",
      "./routes/main/legal/privacy-policy.page.tsx"
    ),
    route("o-nas", "./routes/main/legal/about-us/about-us.page.tsx"),
    ...prefix("/kontakt", [
      index("./routes/main/contact/contact.page.tsx"),
      route("/sukces", "./routes/main/contact/contact-success.page.tsx"),
    ]),
    route("/faq", "./routes/main/faq.page.tsx"),

    // returns
    ...prefix("/zwroty", [
      index("./routes/main/returns/return-request.page.tsx"),
      route(
        "sukces/:returnReqNumber",
        "./routes/main/returns/return-success.page.tsx"
      ),
    ]),

    // order summary
    route(
      "/zamowienie/:orderNumber/sukces",
      "./routes/main/order-success.page.tsx"
    ),
  ]),

  // Auth
  layout("./routes/auth/auth.layout.tsx", [
    route("zaloguj-sie", "./routes/auth/login.page.tsx"),
    route("zarejestruj-sie", "./routes/auth/register.page.tsx"),
    route("zapomniales-hasla", "./routes/auth/forgot-password.page.tsx"),
    route("resetuj-haslo/:token?", "./routes/auth/reset-password.page.tsx"),
    route("potwierdz-email", "./routes/auth/verify-email.page.tsx"),
  ]),

  // Admin
  ...prefix("/admin", [
    index("./routes/admin/admin.page.tsx"),

    layout("./routes/admin/admin.layout.tsx", [
      // Products
      ...prefix("/products", [
        index("./routes/admin/products/admin-products-list.page.tsx"),
        route(
          "/create",
          "./routes/admin/products/admin-products-create.page.tsx"
        ),
        route(
          "/:productId/edit",
          "./routes/admin/products/admin-products-edit.page.tsx"
        ),
      ]),
      // Clothes
      ...prefix("/pieces", [
        index("./routes/admin/pieces/admin-pieces-list.page.tsx"),
        route("/create", "./routes/admin/pieces/admin-pieces-create.page.tsx"),
        route(
          "/:pieceId/edit",
          "./routes/admin/pieces/admin-pieces-edit.page.tsx"
        ),
      ]),
      // Categories
      ...prefix("/categories", [
        index("./routes/admin/categories/admin-categories-list.page.tsx"),
        route(
          "/create",
          "./routes/admin/categories/admin-categories-create.page.tsx"
        ),
        route(
          "/:categoryId/edit",
          "./routes/admin/categories/admin-categories-edit.page.tsx"
        ),
      ]),
      // Brands
      ...prefix("/brands", [
        index("./routes/admin/brands/admin-brands-list.page.tsx"),
        route("/create", "./routes/admin/brands/admin-brands-create.page.tsx"),
        route(
          "/:slug/edit",
          "./routes/admin/brands/admin-brands-edit.page.tsx"
        ),
      ]),
      // Sizes
      ...prefix("/sizes", [
        index("./routes/admin/sizes/admin-sizes-list.page.tsx"),
        route("/create", "./routes/admin/sizes/admin-sizes-create.page.tsx"),
        route("/:slug/edit", "./routes/admin/sizes/admin-sizes-edit.page.tsx"),
      ]),
      // Tags
      ...prefix("/tags", [
        index("./routes/admin/tags/admin-tags-list.page.tsx"),
        route("/create", "./routes/admin/tags/admin-tags-create.page.tsx"),
        route("/:tagId/edit", "./routes/admin/tags/admin-tags-edit.page.tsx"),
      ]),
      // Featured products
      route("/featured", "./routes/admin/featured-products-edit.page.tsx"),
      // Top featured pieces
      route(
        "/top-featured-pieces",
        "./routes/admin/top-featured-pieces-edit.page.tsx"
      ),
      route(
        "/top-featured-products",
        "./routes/admin/top-featured-products-edit.page.tsx"
      ),
      // Users
      route("/users", "./routes/admin/admin-users-list.page.tsx"),
      // Orders
      ...prefix("/orders", [
        index("./routes/admin/orders/admin-orders-list.page.tsx"),
        route(
          "/:orderId",
          "./routes/admin/orders/admin-orders-detail.page.tsx"
        ),
      ]),
      // Returns
      ...prefix("/returns", [
        index("./routes/admin/returns/admin-returns-list.page.tsx"),
        route(
          "/:returnId",
          "./routes/admin/returns/admin-returns-detail.page.tsx"
        ),
      ]),

      // Discounts
      ...prefix("/discounts", [
        index("./routes/admin/discounts/admin-discounts-list.page.tsx"),
        route(
          "/create",
          "./routes/admin/discounts/admin-discounts-create.page.tsx"
        ),
        route(
          "/:discountId/edit",
          "./routes/admin/discounts/admin-discounts-edit.page.tsx"
        ),
      ]),
    ]),
  ]),

  // 404
  route("*", "./routes/404.page.tsx"),
] satisfies RouteConfig;
