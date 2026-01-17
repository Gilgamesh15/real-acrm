/**
 * SEO Structured Data Generation
 *
 * Generates Google-compliant JSON-LD structured data for:
 * - Products (individual pieces)
 * - ProductGroups (bundles/projects with piece variants)
 * - Organization
 * - BreadcrumbList
 * - WebSite / WebPage
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/product
 * @see https://developers.google.com/search/docs/appearance/structured-data/product-variants
 * @see https://developers.google.com/search/docs/appearance/structured-data/shipping-policy
 * @see https://developers.google.com/search/docs/appearance/structured-data/return-policy
 */
import type { DBQueryResult } from "~/lib/types";
import type { RichText } from "~/lib/types";

import { calculateProductPrice, priceFromGrosz } from "./utils";
import LogoPng from "/logo-dark.png";

const BASE_URL = import.meta.env.VITE_APP_URL;
const FOUNDING_DATE = import.meta.env.VITE_FOUNDING_DATE;
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL;
const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL;
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL;

// ============================================================================
// Type Definitions (Google-compliant JSON-LD structures)
// ============================================================================

type ImageObject = {
  "@type": "ImageObject";
  url: string;
  description?: string;
  width?: number;
  height?: number;
};

type Brand = {
  "@type": "Brand";
  name: string;
};

type QuantitativeValue = {
  "@type": "QuantitativeValue";
  minValue: number;
  maxValue: number;
  unitCode: string;
};

type OpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
};

type DefinedRegion = {
  "@type": "DefinedRegion";
  addressCountry: string;
  addressRegion?: string;
};

type ShippingDeliveryTime = {
  "@type": "ShippingDeliveryTime";
  handlingTime: QuantitativeValue;
  transitTime: QuantitativeValue;
  businessDays?: OpeningHoursSpecification;
  cutOffTime?: string;
};

type MonetaryAmount = {
  "@type": "MonetaryAmount";
  value: string;
  currency: string;
};

type OfferShippingDetails = {
  "@type": "OfferShippingDetails";
  shippingRate: MonetaryAmount;
  shippingDestination: DefinedRegion;
  deliveryTime: ShippingDeliveryTime;
  shippingOrigin?: DefinedRegion;
};

type MerchantReturnPolicy = {
  "@type": "MerchantReturnPolicy";
  applicableCountry: string;
  returnPolicyCategory: string;
  merchantReturnDays: number;
  returnMethod: string | string[];
  returnFees: string;
  merchantReturnLink?: string;
  refundType?: string;
  returnLabelSource?: string;
};

type Offer = {
  "@type": "Offer";
  url: string;
  priceCurrency: string;
  price: string;
  availability: string;
  itemCondition: string;
  priceValidUntil?: string;
  shippingDetails?: OfferShippingDetails;
  hasMerchantReturnPolicy?: MerchantReturnPolicy;
};

type AggregateOffer = {
  "@type": "AggregateOffer";
  priceCurrency: string;
  lowPrice: string;
  highPrice: string;
  offerCount: number;
  availability: string;
  shippingDetails?: OfferShippingDetails;
  hasMerchantReturnPolicy?: MerchantReturnPolicy;
};

type PropertyValue = {
  "@type": "PropertyValue";
  name: string;
  value: string | number;
  unitText?: string;
};

type Product = {
  "@context"?: "https://schema.org";
  "@type": "Product";
  "@id": string;
  name: string;
  url: string;
  sku: string;
  productID?: string;
  brand: Brand;
  category?: string | string[];
  keywords?: string;
  image: (ImageObject | string)[];
  offers: Offer;
  size?: string;
  additionalProperty?: PropertyValue[];
  isVariantOf?: { "@id": string };
  inProductGroupWithID?: string;
};

type ProductGroup = {
  "@type": "ProductGroup";
  "@id": string;
  name: string;
  description?: string;
  url: string;
  productGroupID: string;
  image: (ImageObject | string)[];
  variesBy?: string[];
  keywords?: string;
  category?: string;
  offers: AggregateOffer;
  hasVariant: { "@id": string }[];
};

type VariantProduct = {
  "@type": "Product";
  "@id": string;
  name: string;
  url: string;
  sku: string;
  isVariantOf: { "@id": string };
  inProductGroupWithID?: string;
  brand: Brand;
  size?: string;
  category?: string;
  image: (ImageObject | string)[];
  offers: Offer;
  additionalProperty?: PropertyValue[];
};

type BreadcrumbListItem = {
  "@type": "ListItem";
  position: number;
  item: {
    "@type": "WebPage";
    "@id": string;
    name: string;
    image?: string;
  };
};

type BreadcrumbList = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItem[];
};

type PostalAddress = {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressCountry: string;
};

type ContactPoint = {
  "@type": "ContactPoint";
  contactType: string;
  email?: string;
  availableLanguage: string[];
  areaServed: string;
};

type Organization = {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  alternateName?: string;
  legalName: string;
  url: string;
  logo: string;
  description: string;
  foundingDate?: string;
  address: PostalAddress;
  contactPoint: ContactPoint[];
  sameAs?: string[];
  taxID: string;
  vatID: string;
  areaServed: {
    "@type": "Country";
    name: string;
  };
  brand?: Brand;
  slogan?: string;
};

type WebSite = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  url: string;
  name: string;
  description: string;
  publisher: { "@id": string };
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
  inLanguage: string;
};

type WebPage = {
  "@context": "https://schema.org";
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  description?: string;
  isPartOf: { "@id": string };
  about?: { "@id": string };
  inLanguage: string;
};

/**
 * Maps database product/piece status to Schema.org availability
 * @see https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
 */
const AVAILABILITY_MAP: Record<string, string> = {
  published: "https://schema.org/InStock",
  in_checkout: "https://schema.org/LimitedAvailability", // Reserved during checkout
  sold: "https://schema.org/SoldOut",
  draft: "https://schema.org/OutOfStock", // Not ready for sale
  return_requested: "https://schema.org/SoldOut", // Pending return
  returned: "https://schema.org/OutOfStock", // Needs manual review before relisting
};

/**
 * Creates shipping details for InPost Poland delivery
 * - FREE shipping always
 * - Ships within 24h (0-1 day handling)
 * - InPost transit 1-2 days
 * - 7 days/week operation with 22:00 cutoff
 * - Ships from Kraków, Poland to Poland only
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/shipping-policy
 */
function createShippingDetails(): OfferShippingDetails {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0", // Free shipping - always
      currency: "PLN",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "PL",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "d", // Google recommends lowercase 'd' for days
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 2, // InPost Poland typically 1-2 days
        unitCode: "d",
      },
      businessDays: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "https://schema.org/Monday",
          "https://schema.org/Tuesday",
          "https://schema.org/Wednesday",
          "https://schema.org/Thursday",
          "https://schema.org/Friday",
          "https://schema.org/Saturday",
          "https://schema.org/Sunday",
        ],
      },
      cutOffTime: "22:00:00+01:00", // 22:00 CET cutoff
    },
    shippingOrigin: {
      "@type": "DefinedRegion",
      addressCountry: "PL",
      addressRegion: "PL-MA", // Małopolskie (Kraków)
    },
  };
}

/**
 * Creates merchant return policy
 * - 14 days return window (EU standard, no reason needed)
 * - Customer pays return shipping
 * - Returns accepted via mail or InPost locker drop-off
 * - Return addresses:
 *   - Mail: Nad Sudołem 24/22, 31-228 Kraków
 *   - Locker: KRA380M, Pachońskiego 8A, 31-223 Kraków (24/7)
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/return-policy
 */
function createReturnPolicy(): MerchantReturnPolicy {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "PL",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: [
      "https://schema.org/ReturnByMail",
      "https://schema.org/ReturnAtKiosk", // InPost locker drop-off
    ],
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    merchantReturnLink: `${BASE_URL}/reklamacje`,
    refundType: "https://schema.org/FullRefund",
    returnLabelSource: "https://schema.org/CustomerResponsibility",
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data from category path
 */
export function generateBreadcrumbListStructuredData(
  category: DBQueryResult<
    "categories",
    {
      with: {
        image: true;
      };
    }
  >
): BreadcrumbList {
  const itemListElement: BreadcrumbListItem[] = [];

  let position = 1;

  itemListElement.push({
    "@type": "ListItem" as const,
    position: position++,
    item: {
      "@type": "WebPage" as const,
      "@id": `${BASE_URL}/`,
      name: "Home",
    },
  });

  // Add each category in the path
  for (let i = 0; i < category.path.length; i++) {
    const segment = category.path[i];
    const slugPath = category.path
      .slice(0, i + 1)
      .map((p) => p.slug)
      .join("/");

    itemListElement.push({
      "@type": "ListItem" as const,
      position: position++,
      item: {
        "@type": "WebPage" as const,
        "@id": `${BASE_URL}/kategorie/${slugPath}`,
        name: segment.name,
      },
    });
  }

  // for last category, add image
  if (category.image) {
    itemListElement[itemListElement.length - 1].item.image = category.image.url;
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

/**
 * Generates Schema.org Product structured data for a piece
 */
export function generateProductStructuredData(
  piece: DBQueryResult<
    "pieces",
    {
      with: {
        brand: true;
        category: true;
        images: true;
        size: true;
        measurements: true;
        piecesToTags: {
          with: {
            tag: true;
          };
        };
      };
    }
  >
): Product {
  const price = priceFromGrosz(piece.priceInGrosz);

  const productUrl = `${BASE_URL}/ubrania/${piece.slug}`;

  const schema: Product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl,
    name: piece.name,
    url: productUrl,
    sku: piece.id,
    productID: piece.id,

    // Brand
    brand: {
      "@type": "Brand",
      name: piece.brand.name,
    },

    // Category as text (simple format)
    category: piece.category?.name,

    // Images
    image: piece.images.map((img) => ({
      "@type": "ImageObject" as const,
      url: img.url,
      description: img.alt,
      width: img.width,
      height: img.height,
    })),

    // Offer information
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PLN",
      price: price.toFixed(2),
      availability:
        AVAILABILITY_MAP[piece.status] || "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/UsedCondition",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      shippingDetails: createShippingDetails(),
      hasMerchantReturnPolicy: createReturnPolicy(),
    },

    // Size
    size: piece.size.name,
  };

  // Tags as additional categories/types
  if (piece.piecesToTags && piece.piecesToTags.length > 0) {
    schema.category = piece.category
      ? [piece.category.name, ...piece.piecesToTags.map((pt) => pt.tag.name)]
      : piece.piecesToTags.map((pt) => pt.tag.name);

    const existingKeywords = piece.keywords || [];
    schema.keywords = [
      ...existingKeywords,
      ...piece.piecesToTags.map((pt) => pt.tag.name),
    ].join(", ");
  }

  // Build additionalProperty array
  const additionalProperties: PropertyValue[] = [];

  // Add gender
  if (piece.gender) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Gender",
      value: piece.gender,
    });
  }

  // Add measurements
  if (piece.measurements && piece.measurements.length > 0) {
    additionalProperties.push(
      ...piece.measurements.map((m) => ({
        "@type": "PropertyValue" as const,
        name: m.name,
        value: m.value,
        unitText: m.unit,
      }))
    );
  }

  if (additionalProperties.length > 0) {
    schema.additionalProperty = additionalProperties;
  }

  return schema;
}

/**
 * Generates Schema.org ProductGroup structured data
 */
export function generateProductGroupStructuredData(
  product: DBQueryResult<
    "products",
    {
      with: {
        images: true;
        pieces: {
          with: {
            size: true;
            brand: true;
            category: true;
            images: true;
          };
        };
      };
    }
  >
): {
  "@context": "https://schema.org";
  "@graph": (ProductGroup | VariantProduct)[];
} {
  const productGroupUrl = `${BASE_URL}/projekty/${product.slug}`;
  const productGroupId = `${productGroupUrl}#product-group`;

  // Determine what varies across pieces
  const variesBy: string[] = [];

  const uniqueSizes = new Set(product.pieces.map((p) => p.size.id));
  if (uniqueSizes.size > 1) {
    variesBy.push("https://schema.org/size");
  }

  const uniqueBrands = new Set(product.pieces.map((p) => p.brand.id));
  if (uniqueBrands.size > 1) {
    variesBy.push("https://schema.org/brand");
  }

  const uniqueGenders = new Set(product.pieces.map((p) => p.gender));
  if (uniqueGenders.size > 1) {
    variesBy.push("https://schema.org/suggestedGender");
  }

  const descriptionText = extractTextFromRichText(product.description);

  // Get available pieces (published and not reserved)
  const availablePieces = product.pieces.filter(
    (p) =>
      p.status === "published" &&
      (p.reservedUntil === null || p.reservedUntil < new Date())
  );

  // Calculate product price: sum of available pieces with skew discount
  // Formula: productPrice = sum(availablePieces) * (100 - skew) / 100
  const productPrice = priceFromGrosz(
    calculateProductPrice(product).lineTotalInGrosz
  );

  // Get primary category from pieces (use most common category)
  const categoryNames = product.pieces
    .map((p) => p.category?.name)
    .filter((name): name is string => name !== undefined && name !== null);
  const primaryCategory =
    categoryNames.length > 0 ? categoryNames[0] : undefined;

  const graph: (ProductGroup | VariantProduct)[] = [];

  const hasPublishedPieces = product.pieces.some(
    (p) =>
      p.status === "published" &&
      (p.reservedUntil === null || p.reservedUntil < new Date())
  );

  const hasInCheckoutPieces = product.pieces.some(
    (p) =>
      p.status === "in_checkout" &&
      p.reservedUntil !== null &&
      p.reservedUntil > new Date()
  );

  // ProductGroup
  const productGroup: ProductGroup = {
    "@type": "ProductGroup",
    "@id": productGroupId,
    name: product.name,
    description: descriptionText,
    url: productGroupUrl,
    productGroupID: product.id,

    image: product.images.map((img) => ({
      "@type": "ImageObject" as const,
      url: img.url,
      description: img.alt,
      width: img.width,
      height: img.height,
    })),

    variesBy: variesBy.length > 0 ? variesBy : undefined,
    keywords: product.keywords?.join(", ") || undefined,
    category: primaryCategory,

    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PLN",
      lowPrice: productPrice.toFixed(2),
      highPrice: productPrice.toFixed(2), // Same price - bundle sold as unit
      offerCount: availablePieces.length,
      availability: hasPublishedPieces
        ? "https://schema.org/InStock"
        : hasInCheckoutPieces
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/OutOfStock",
      shippingDetails: createShippingDetails(),
      hasMerchantReturnPolicy: createReturnPolicy(),
    },

    hasVariant: product.pieces.map((piece) => ({
      "@id": `${BASE_URL}/ubrania/${piece.slug}#product`,
    })),
  };

  graph.push(productGroup);

  // Each piece as a variant
  for (const piece of product.pieces) {
    const pieceUrl = `${BASE_URL}/ubrania/${piece.slug}`;
    const pieceId = `${pieceUrl}#product`;

    // Individual piece price (no skew - skew applies to bundle total only)
    const piecePrice = priceFromGrosz(piece.priceInGrosz);

    const additionalProperties: PropertyValue[] = [];

    if (piece.gender) {
      additionalProperties.push({
        "@type": "PropertyValue",
        name: "Gender",
        value: piece.gender,
      });
    }

    const variantProduct: VariantProduct = {
      "@type": "Product",
      "@id": pieceId,
      name: piece.name,
      url: pieceUrl,
      sku: piece.id,

      isVariantOf: {
        "@id": productGroupId,
      },
      inProductGroupWithID: product.id, // Links variant to parent ProductGroup

      brand: {
        "@type": "Brand",
        name: piece.brand.name,
      },

      size: piece.size.name,
      category: piece.category?.name,

      image: piece.images.map((img) => ({
        "@type": "ImageObject" as const,
        url: img.url,
        description: img.alt,
        width: img.width,
        height: img.height,
      })),

      offers: {
        "@type": "Offer",
        url: pieceUrl,
        priceCurrency: "PLN",
        price: piecePrice.toFixed(2),
        availability: AVAILABILITY_MAP[piece.status],
        itemCondition: "https://schema.org/UsedCondition",
        shippingDetails: createShippingDetails(),
        hasMerchantReturnPolicy: createReturnPolicy(),
      },

      additionalProperty:
        additionalProperties.length > 0 ? additionalProperties : undefined,
    };

    graph.push(variantProduct);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Helper to extract plain text from RichText
 */
function extractTextFromRichText(richText: RichText): string {
  if (!richText) return "";

  try {
    if (typeof richText === "string") return richText;

    const extractText = (node: any): string => {
      if (!node) return "";
      if (typeof node === "string") return node;

      if (Array.isArray(node)) {
        return node.map(extractText).join(" ");
      }

      if (typeof node === "object") {
        if ("text" in node && node.text) return node.text;
        if ("children" in node && node.children) {
          return extractText(node.children);
        }
      }

      return "";
    };

    return extractText(richText).trim();
  } catch (e) {
    console.error("Error extracting text from RichText:", e);
    return "";
  }
}

/**
 * Generates Schema.org Organization structured data for ACRM
 *
 * This represents your company as a legal entity selling secondhand fashion.
 * Should be included on every page, typically in the site layout/header.
 *
 * @param options - Configuration options
 * @returns JSON-LD structured data for Organization
 *
 * @example
 * const orgSchema = generateOrganizationStructuredData({
 *   logoUrl: 'https://yourstore.com/logo.png',
 *   socialLinks: ['https://instagram.com/acrm', 'https://facebook.com/acrm']
 * });
 */
export function generateOrganizationStructuredData(): Organization {
  const organizationId = `${BASE_URL}/#organization`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: "ACRM | Fashion Projects",
    alternateName: "ACRM Sp. z o.o.",
    legalName: "ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
    url: BASE_URL,
    logo: LogoPng,
    description:
      "ACRM offers unique secondhand clothing and curated fashion sets for young people seeking stylish, affordable pieces. Discover vintage finds and one-of-a-kind garments at unbeatable prices.",
    foundingDate: FOUNDING_DATE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "ul. Nad Sudołem 24/22",
      addressLocality: "Kraków",
      postalCode: "31-228", // Update with actual postal code if different
      addressCountry: "PL",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "pomoc@acrm.pl",
        availableLanguage: ["Polish", "English"],
        areaServed: "PL",
      },
    ],
    sameAs: [INSTAGRAM_URL, TIKTOK_URL, YOUTUBE_URL],
    taxID: "9452316835", // NIP
    vatID: "PL9452316835", // VAT format: country code + NIP
    areaServed: {
      "@type": "Country",
      name: "Poland",
    },
    brand: {
      "@type": "Brand",
      name: "ACRM | Fashion Projects",
    },
    slogan: "NOWA ERA | Pokolenie przyszłości",
  };
}

/**
 * Generates Schema.org WebSite structured data
 *
 * Represents the website itself and enables sitelinks search box in Google.
 * Should be included on the homepage.
 */
export function generateWebSiteStructuredData(): WebSite {
  const websiteId = `${BASE_URL}/#website`;
  const organizationId = `${BASE_URL}/#organization`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: BASE_URL,
    name: "ACRM | Fashion Projects",
    description:
      "Sklep z projektami mody z second-handu. Unikalne zestawy w topowych stylach. Marki premium jak Dickies, Nike, Carhartt w przystępnych cenach. Darmowa dostawa, wysyłka w 24h, zwroty do 14 dni.",
    publisher: {
      "@id": organizationId,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/kategorie?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "pl-PL",
  };
}

/**
 * Generates Schema.org WebPage structured data
 *
 * Represents individual pages on your site.
 */
export function generateWebPageStructuredData(): WebPage {
  const pageId = `${BASE_URL}/#webpage`;
  const websiteId = `${BASE_URL}/#website`;
  const organizationId = `${BASE_URL}/#organization`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageId,
    url: BASE_URL,
    name: "ACRM | Fashion Projects",
    description:
      "Sklep z projektami mody z second-handu. Unikalne zestawy w topowych stylach. Marki premium jak Dickies, Nike, Carhartt w przystępnych cenach. Darmowa dostawa, wysyłka w 24h, zwroty do 14 dni.",
    isPartOf: {
      "@id": websiteId,
    },
    about: {
      "@id": organizationId,
    },
    inLanguage: "pl-PL",
  };
}
