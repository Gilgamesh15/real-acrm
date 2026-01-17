import type { LoaderFunctionArgs } from "react-router";
import { SitemapStream, streamToPromise } from "sitemap";

import { db } from "~/lib/db";
import { getSlugPath } from "~/lib/utils";

const BASE_URL = import.meta.env.VITE_APP_URL;

type SitemapEntry = {
  url: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

/**
 * Generates XML sitemap for the website
 * Called by React Router's sitemap route handler
 */
export async function loader({}: LoaderFunctionArgs) {
  const entries: SitemapEntry[] = [];

  // ==========================================
  // STATIC ROUTES
  // ==========================================

  // Homepage - highest priority, changes frequently
  entries.push({
    url: "/", // Changed: relative URL
    changefreq: "daily",
    priority: 1.0,
  });

  // Main product browsing pages
  entries.push({
    url: "/projekty",
    changefreq: "daily",
    priority: 0.8,
  });

  // Legal pages - low priority, rarely change
  const legalPages = [
    "/regulamin",
    "/regulamin/reklamacje",
    "/regulamin/odstapienie-od-umowy",
    "/regulamin/polityka-prywatnosci",
    "/regulamin/o-nas",
  ];

  for (const page of legalPages) {
    entries.push({
      url: page,
      changefreq: "monthly",
      priority: 0.3,
    });
  }

  // Returns page
  entries.push({
    url: "/zwroty",
    changefreq: "monthly",
    priority: 0.4,
  });

  // ==========================================
  // DYNAMIC ROUTES FROM DATABASE
  // ==========================================

  try {
    // Products (projekty)
    const products = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.status, "published"),
      columns: {
        slug: true,
        updatedAt: true,
      },
    });

    for (const product of products) {
      entries.push({
        url: `/projekty/${product.slug}`,
        lastmod: product.updatedAt?.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    // Pieces (ubrania) - only published ones
    const pieces = await db.query.pieces.findMany({
      where: (pieces, { eq }) => eq(pieces.status, "published"),
      columns: {
        slug: true,
        updatedAt: true,
      },
    });

    for (const piece of pieces) {
      entries.push({
        url: `/ubrania/${piece.slug}`,
        lastmod: piece.updatedAt?.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.8,
      });
    }

    // Categories - build nested paths
    const categories = await db.query.categories.findMany({
      columns: {
        id: true,
        slug: true,
        name: true,
        updatedAt: true,
        path: true,
      },
    });

    for (const category of categories) {
      const slugPath = getSlugPath(category);

      entries.push({
        url: `/kategorie/${slugPath}`,
        lastmod: category.updatedAt?.toISOString().split("T")[0],
        changefreq: "weekly",
        priority: 0.9,
      });
    }
  } catch (error) {
    console.error("Error fetching sitemap data:", error);
    // Continue with static routes even if DB queries fail
  }

  // ==========================================
  // GENERATE XML
  // ==========================================

  const sitemap = await generateSitemapXML(entries); // Added await

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}

/**
 * Converts sitemap entries to XML format using sitemap library
 */
async function generateSitemapXML(entries: SitemapEntry[]): Promise<string> {
  const stream = new SitemapStream({ hostname: BASE_URL });

  for (const entry of entries) {
    stream.write({
      url: entry.url, // Now relative URLs
      lastmod: entry.lastmod,
      changefreq: entry.changefreq,
      priority: entry.priority,
    });
  }

  stream.end();

  const data = await streamToPromise(stream);
  return data.toString();
}
