import { eq } from "drizzle-orm";
import { redirect } from "react-router";

import * as schema from "~/../db/schema";
import { db } from "~/lib/db";
import { getSlugPath } from "~/lib/utils";

import type { Route } from "./+types/legacy-product-browse-redirect.page";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Produkty -> Kategorie
  if (path.startsWith("/produkty/")) {
    const categorySlug = path.split("/").pop();
    if (!categorySlug) {
      throw redirect("/kategorie");
    }

    const category = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, categorySlug),
    });
    if (!category) {
      throw redirect("/kategorie");
    }

    return redirect(`/kategorie/${getSlugPath(category)}`);
  }

  throw redirect("/kategorie");
}
