/**
 * JSON-LD to Google Merchant API Transformer
 *
 * Transforms existing JSON-LD structured data (from seo.ts) to
 * Google Merchant API ProductInput format.
 */
import {
  AVAILABILITY_MAP,
  CONDITION_MAP,
  DEFAULT_GOOGLE_PRODUCT_CATEGORY,
  GENDER_MAP,
  MERCHANT_CONFIG,
  SHIPPING_CONFIG,
} from "./constants";
import type { MerchantShipping, ProductInput } from "./types";

/**
 * Image type that can be either a string URL or an ImageObject
 */
type JsonLdImage =
  | string
  | {
      "@type": "ImageObject";
      url: string;
      description?: string;
      width?: number;
      height?: number;
    };

/**
 * JSON-LD Product type from seo.ts
 */
type JsonLdProduct = {
  "@type": "Product";
  "@id": string;
  name: string;
  url: string;
  sku: string;
  productID?: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  category?: string | string[];
  keywords?: string;
  image: JsonLdImage[];
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: string;
    price: string;
    availability: string;
    itemCondition: string;
    priceValidUntil?: string;
  };
  size?: string;
  additionalProperty?: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string | number;
    unitText?: string;
  }>;
  isVariantOf?: { "@id": string };
  inProductGroupWithID?: string;
};

/**
 * JSON-LD ProductGroup type from seo.ts
 */
type JsonLdProductGroup = {
  "@context": "https://schema.org";
  "@graph": Array<
    | {
        "@type": "ProductGroup";
        "@id": string;
        name: string;
        description?: string;
        url: string;
        productGroupID: string;
        image: JsonLdImage[];
        variesBy?: string[];
        keywords?: string;
        category?: string;
        offers: unknown;
        hasVariant: Array<{ "@id": string }>;
      }
    | JsonLdProduct
  >;
};

/**
 * Extract URL from an image (handles both string and ImageObject)
 */
function getImageUrl(image: JsonLdImage): string {
  if (typeof image === "string") {
    return image;
  }
  return image.url;
}

/**
 * Convert price string to micros (Google uses 1,000,000 = 1 currency unit)
 * Example: "123.45" -> "123450000"
 */
function priceToMicros(price: string): string {
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) {
    throw new Error(`Invalid price value: ${price}`);
  }
  return Math.round(numericPrice * 1_000_000).toString();
}

/**
 * Extract gender from additionalProperty array
 */
function extractGender(
  additionalProperty?: JsonLdProduct["additionalProperty"]
): string | undefined {
  if (!additionalProperty) return undefined;

  const genderProp = additionalProperty.find(
    (prop) => prop.name.toLowerCase() === "gender"
  );

  if (!genderProp) return undefined;

  const genderValue = String(genderProp.value).toLowerCase();
  return GENDER_MAP[genderValue];
}

/**
 * Create shipping configuration for Merchant API
 */
function createShipping(): MerchantShipping[] {
  return [
    {
      price: {
        amountMicros: SHIPPING_CONFIG.price.amountMicros,
        currencyCode: SHIPPING_CONFIG.price.currencyCode,
      },
      country: SHIPPING_CONFIG.country,
      service: SHIPPING_CONFIG.service,
      minHandlingTime: SHIPPING_CONFIG.minHandlingTime,
      maxHandlingTime: SHIPPING_CONFIG.maxHandlingTime,
      minTransitTime: SHIPPING_CONFIG.minTransitTime,
      maxTransitTime: SHIPPING_CONFIG.maxTransitTime,
    },
  ];
}

/**
 * Transform a JSON-LD Product to Merchant API ProductInput
 *
 * @param jsonLd - JSON-LD Product structured data from generateProductStructuredData()
 * @param options - Optional configuration
 * @returns ProductInput ready for Merchant API submission
 */
export function transformPieceToProductInput(
  jsonLd: JsonLdProduct,
  options?: {
    itemGroupId?: string;
  }
): ProductInput {
  // Extract first image as main, rest as additional
  const images = jsonLd.image || [];
  const mainImage = images[0] ? getImageUrl(images[0]) : undefined;
  const additionalImages = images.slice(1).map((img) => getImageUrl(img));

  if (!mainImage) {
    throw new Error(`Product ${jsonLd.sku} has no images`);
  }

  // Map availability
  const availability =
    AVAILABILITY_MAP[jsonLd.offers.availability] || "OUT_OF_STOCK";

  // Map condition (all items are used in this secondhand store)
  const condition = CONDITION_MAP[jsonLd.offers.itemCondition] || "USED";

  // Extract gender
  const gender = extractGender(jsonLd.additionalProperty);

  // Build product types from category
  const productTypes: string[] = [];
  if (jsonLd.category) {
    if (Array.isArray(jsonLd.category)) {
      productTypes.push(...jsonLd.category);
    } else {
      productTypes.push(jsonLd.category);
    }
  }

  const productInput: ProductInput = {
    channel: MERCHANT_CONFIG.channel,
    offerId: jsonLd.sku,
    contentLanguage: MERCHANT_CONFIG.contentLanguage,
    feedLabel: MERCHANT_CONFIG.feedLabel,
    attributes: {
      title: jsonLd.name,
      link: jsonLd.url,
      imageLink: mainImage,
      availability,
      condition,
      price: {
        amountMicros: priceToMicros(jsonLd.offers.price),
        currencyCode: jsonLd.offers.priceCurrency,
      },
      brand: jsonLd.brand.name,
      googleProductCategory: DEFAULT_GOOGLE_PRODUCT_CATEGORY,
      shipping: createShipping(),
    },
  };

  // Add optional fields
  if (additionalImages.length > 0) {
    productInput.attributes.additionalImageLinks = additionalImages;
  }

  if (jsonLd.size) {
    productInput.attributes.size = jsonLd.size;
    productInput.attributes.sizeSystem = MERCHANT_CONFIG.defaultSizeSystem;
  }

  if (gender) {
    productInput.attributes.gender = gender as "MALE" | "FEMALE" | "UNISEX";
  }

  if (productTypes.length > 0) {
    productInput.attributes.productTypes = productTypes;
  }

  // Set itemGroupId for variants (pieces in a product bundle)
  if (options?.itemGroupId || jsonLd.inProductGroupWithID) {
    productInput.attributes.itemGroupId =
      options?.itemGroupId || jsonLd.inProductGroupWithID;
  }

  // Default age group for apparel
  productInput.attributes.ageGroup = "ADULT";

  return productInput;
}

/**
 * Transform a JSON-LD ProductGroup to array of Merchant API ProductInputs
 *
 * Each piece (variant) in the ProductGroup becomes a separate ProductInput,
 * linked by itemGroupId.
 *
 * @param jsonLd - JSON-LD ProductGroup structured data from generateProductGroupStructuredData()
 * @returns Array of ProductInputs, one for each variant piece
 */
export function transformProductGroupToProductInputs(
  jsonLd: JsonLdProductGroup
): ProductInput[] {
  const productInputs: ProductInput[] = [];

  // Find the ProductGroup to get the groupId
  const productGroup = jsonLd["@graph"].find(
    (item) => item["@type"] === "ProductGroup"
  ) as { productGroupID: string } | undefined;

  if (!productGroup) {
    throw new Error("No ProductGroup found in JSON-LD graph");
  }

  const itemGroupId = productGroup.productGroupID;

  // Find all Product variants
  const variants = jsonLd["@graph"].filter(
    (item) => item["@type"] === "Product"
  ) as JsonLdProduct[];

  for (const variant of variants) {
    const productInput = transformPieceToProductInput(variant, {
      itemGroupId,
    });
    productInputs.push(productInput);
  }

  return productInputs;
}
