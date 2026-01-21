/**
 * Google Merchant Center API Constants and Mappings
 *
 * Maps JSON-LD/Schema.org values to Merchant API enum values
 */
import type {
  MerchantAvailability,
  MerchantCondition,
  MerchantGender,
} from "./types";

/**
 * Map Schema.org availability URLs to Merchant API availability values
 */
export const AVAILABILITY_MAP: Record<string, MerchantAvailability> = {
  "https://schema.org/InStock": "IN_STOCK",
  "https://schema.org/OutOfStock": "OUT_OF_STOCK",
  "https://schema.org/LimitedAvailability": "IN_STOCK", // Treat limited as in stock
  "https://schema.org/SoldOut": "OUT_OF_STOCK",
  "https://schema.org/PreOrder": "PREORDER",
  "https://schema.org/BackOrder": "BACKORDER",
};

/**
 * Map Schema.org item condition URLs to Merchant API condition values
 */
export const CONDITION_MAP: Record<string, MerchantCondition> = {
  "https://schema.org/NewCondition": "NEW",
  "https://schema.org/UsedCondition": "USED",
  "https://schema.org/RefurbishedCondition": "REFURBISHED",
  "https://schema.org/DamagedCondition": "USED",
};

/**
 * Map lowercase gender to Merchant API gender values
 */
export const GENDER_MAP: Record<string, MerchantGender> = {
  male: "MALE",
  female: "FEMALE",
  unisex: "UNISEX",
};

/**
 * Default Google Product Category for apparel
 * 1604 = Clothing & Accessories > Clothing
 * @see https://support.google.com/merchants/answer/6324436
 */
export const DEFAULT_GOOGLE_PRODUCT_CATEGORY = "1604";

/**
 * Feed configuration for Poland
 */
export const MERCHANT_CONFIG = {
  feedLabel: "PL",
  contentLanguage: "pl",
  defaultSizeSystem: "EU",
  channel: "ONLINE" as const,
  currency: "PLN",
} as const;

/**
 * Shipping configuration for InPost Poland
 * Free shipping, 0-1 day handling, 1-2 day transit
 */
export const SHIPPING_CONFIG = {
  price: {
    amountMicros: "0", // Free shipping
    currencyCode: "PLN",
  },
  country: "PL",
  service: "InPost",
  minHandlingTime: 0,
  maxHandlingTime: 1,
  minTransitTime: 1,
  maxTransitTime: 2,
} as const;
