import type { MetaDescriptor } from "react-router";

import LogoPng from "/logo-dark.png";

const BASE_URL = import.meta.env.VITE_APP_URL || "https://acrm.pl";

type MetaProps = {
  // Required
  title: string;
  description: string;

  // Optional - URL defaults to current page
  url?: string;

  // Optional - Images
  image?: string;
  imageWidth?: number;
  imageHeight?: number;

  // Optional - Type specific
  type?: "website" | "product" | "article";

  // Optional - Product specific (only if type="product")
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: "in stock" | "out of stock" | "preorder";
  productBrand?: string;
  productCondition?: "new" | "used" | "refurbished";

  // Optional - Control indexing
  noindex?: boolean;

  // Optional - Override defaults
  siteName?: string;
  locale?: string;
};

/**
 * Generates complete meta tags for SEO and social sharing
 * Use this in your route's meta function
 *
 * @example
 * export const meta: MetaFunction<typeof loader> = ({ data }) => {
 *   return generateMeta({
 *     title: "Product Name",
 *     description: "Product description...",
 *     url: "https://acrm.pl/ubrania/product-slug",
 *     image: data.product.images[0].url,
 *     type: "product",
 *     productPrice: 99.99,
 *     productAvailability: "in stock"
 *   });
 * };
 */
export function generateMeta(props: MetaProps): MetaDescriptor[] {
  const {
    title,
    description,
    url,
    image = LogoPng,
    imageWidth = 1200,
    imageHeight = 630,
    type = "website",
    productPrice,
    productCurrency = "PLN",
    productAvailability,
    productBrand,
    productCondition = "used",
    noindex = false,
    siteName = "ACRM | Fashion Projects",
    locale = "pl_PL",
  } = props;

  // Build full title with site name (unless it already includes it)
  const fullTitle = title.includes("ACRM") ? title : `${title} | ACRM`;

  // Ensure absolute URLs
  const absoluteUrl = url?.startsWith("http") ? url : `${BASE_URL}${url || ""}`;
  const absoluteImage = image?.startsWith("http")
    ? image
    : `${BASE_URL}${image}`;

  const meta: MetaDescriptor[] = [
    // Basic SEO
    { title: fullTitle },
    { name: "description", content: description },

    // Open Graph (Facebook, LinkedIn, WhatsApp)
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: absoluteUrl },
    { property: "og:image", content: absoluteImage },
    { property: "og:image:width", content: String(imageWidth) },
    { property: "og:image:height", content: String(imageHeight) },
    { property: "og:site_name", content: siteName },
    { property: "og:locale", content: locale },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: absoluteImage },

    // Canonical URL
    { tagName: "link", rel: "canonical", href: absoluteUrl },

    // Robots
    {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    },

    // Language
    { name: "language", content: "Polish" },
  ];

  // Add product-specific meta tags
  if (type === "product") {
    if (productPrice !== undefined) {
      meta.push(
        { property: "product:price:amount", content: String(productPrice) },
        { property: "product:price:currency", content: productCurrency }
      );
    }

    if (productAvailability) {
      meta.push({
        property: "product:availability",
        content: productAvailability,
      });
    }

    if (productBrand) {
      meta.push({ property: "product:brand", content: productBrand });
    }

    if (productCondition) {
      meta.push({ property: "product:condition", content: productCondition });
    }
  }

  return meta;
}

/**
 * Helper to create a concise product description from piece data
 */
export function createProductDescription(piece: {
  name: string;
  brand: { name: string };
  size: { name: string };
  category?: { name: string } | null;
  priceInGrosz: number;
}): string {
  const price = (piece.priceInGrosz / 100).toFixed(2);
  const parts = [
    `${piece.brand.name} ${piece.name}`,
    `rozmiar ${piece.size.name}`,
  ];

  if (piece.category?.name) {
    parts.push(piece.category.name);
  }

  parts.push(`Cena: ${price} zł`);
  parts.push("Darmowa dostawa InPost");

  return parts.join(". ") + ".";
}

/**
 * Helper to create a category description
 */
export function createCategoryDescription(category: {
  name: string;
  description?: string;
  pieceCount?: number;
}): string {
  const parts = [`Przeglądaj ${category.name.toLowerCase()}`];

  if (category.pieceCount) {
    parts.push(`${category.pieceCount} unikalnych ubrań`);
  }

  parts.push("Marki premium w przystępnych cenach");
  parts.push("Darmowa dostawa");
  parts.push("Zwroty do 14 dni");

  return parts.join(". ") + ".";
}

/**
 * Helper to create product group description
 */
export function createProductGroupDescription(product: {
  name: string;
  description?: string;
  pieceCount?: number;
}): string {
  const parts = [`${product.name} - kompletny zestaw`];

  if (product.pieceCount) {
    parts.push(`${product.pieceCount} dostępnych ubrań z projektu`);
  }

  if (product.description) {
    // Extract first sentence or first 100 chars from rich text
    const plainText =
      typeof product.description === "string"
        ? product.description
        : JSON.stringify(product.description);
    const firstSentence = plainText.split(".")[0];
    if (firstSentence && firstSentence.length < 150) {
      parts.push(firstSentence);
    }
  }

  parts.push("Wysyłka w 24h");

  return parts.join(". ") + ".";
}
