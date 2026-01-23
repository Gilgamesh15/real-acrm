import { eq } from "drizzle-orm";
import { redirect } from "react-router";

import * as schema from "~/../db/schema";
import { db } from "~/lib/db";

import type { Route } from "./+types/legacy-product-detail-redirect.page";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Produkt -> Projekt
  if (path.startsWith("/produkt/")) {
    const productSlug = path.split("/").pop();
    if (!productSlug) {
      throw redirect("/projekty");
    }

    const product = await db.query.products.findFirst({
      where: eq(schema.products.slug, productSlug),
    });
    if (!product) {
      throw redirect("/projekty");
    }

    return redirect(`/projekty/${product.slug}`);
  }

  throw redirect("/");
}
