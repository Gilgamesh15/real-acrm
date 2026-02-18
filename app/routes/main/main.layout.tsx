import * as schema from "db/schema";
import { asc, eq, getTableColumns, sql } from "drizzle-orm";
import { Outlet, useLoaderData } from "react-router";

import { Footer } from "~/components/features/footer/footer";
import { Navbar } from "~/components/features/navigation/navbar";
import { CartProvider } from "~/components/features/providers/cart-provider";
import { CheckoutDialogProvider } from "~/components/features/providers/checkout-dialog-provider";
import { CheckoutProvider } from "~/components/features/providers/checkout-provider";
import { CheckoutRecoveryDialogProvider } from "~/components/features/providers/checkout-recovery-dialog-provider";
import { db } from "~/lib/db";
import { generateOrganizationStructuredData } from "~/lib/seo";

import type { Route } from "./+types/main.layout";

export async function loader() {
  const categoriesPromise = db
    .select({
      ...getTableColumns(schema.categories),
      image: getTableColumns(schema.images),
      piecesCount: sql<number>`
        (SELECT
          COUNT(DISTINCT pieces.id)
        FROM 
          ${schema.pieces} 
        WHERE 
          pieces.category_id = categories.id AND pieces.status = 'published')`,
    })
    .from(schema.categories)
    .leftJoin(schema.images, eq(schema.categories.id, schema.images.categoryId))
    .orderBy(asc(schema.categories.updatedAt))
    .then((res) => res);

  const tagsPromise = db
    .select({
      ...getTableColumns(schema.tags),
      image: getTableColumns(schema.images),
    })
    .from(schema.tags)
    .leftJoin(schema.images, eq(schema.tags.id, schema.images.tagId))
    .then((res) => res);

  return {
    categoriesPromise,
    tagsPromise,
  };
}

export const meta: Route.MetaFunction = () => [
  { "script:ld+json": generateOrganizationStructuredData() },
];

export default function MainLayout() {
  const { categoriesPromise, tagsPromise } = useLoaderData<typeof loader>();

  return (
    <CartProvider>
      <CheckoutProvider>
        <CheckoutDialogProvider>
          <CheckoutRecoveryDialogProvider>
            <Navbar
              categoriesPromise={categoriesPromise}
              tagsPromise={tagsPromise}
            >
              <Outlet />
            </Navbar>
            <Footer categoriesPromise={categoriesPromise} />
          </CheckoutRecoveryDialogProvider>
        </CheckoutDialogProvider>
      </CheckoutProvider>
    </CartProvider>
  );
}
