/**
 * Google Merchant Center API Type Definitions
 *
 * Types matching Google Merchant API ProductInput structure
 * @see https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs
 */

/**
 * Price in Merchant API format
 * Google uses micros (1,000,000 = 1 unit of currency)
 */
export type MerchantPrice = {
  amountMicros: string;
  currencyCode: string;
};

/**
 * Shipping specification for Merchant API
 */
export type MerchantShipping = {
  price: MerchantPrice;
  country: string;
  region?: string;
  service?: string;
  minHandlingTime?: number;
  maxHandlingTime?: number;
  minTransitTime?: number;
  maxTransitTime?: number;
};

/**
 * Product attributes for Merchant API
 * @see https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs#Attributes
 */
export type ProductAttributes = {
  // Required fields
  title: string;
  link: string;
  imageLink: string;
  availability: MerchantAvailability;
  condition: MerchantCondition;
  price: MerchantPrice;

  // Recommended fields
  brand?: string;
  gtin?: string;
  mpn?: string;
  description?: string;

  // Apparel-specific fields
  gender?: MerchantGender;
  ageGroup?: MerchantAgeGroup;
  color?: string;
  size?: string;
  sizeSystem?: string;
  sizeType?: string;
  itemGroupId?: string;

  // Additional fields
  additionalImageLinks?: string[];
  googleProductCategory?: string;
  productTypes?: string[];
  shipping?: MerchantShipping[];
  customLabel0?: string;
  customLabel1?: string;
  customLabel2?: string;
  customLabel3?: string;
  customLabel4?: string;
};

/**
 * Merchant API availability values
 */
export type MerchantAvailability = "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER" | "BACKORDER";

/**
 * Merchant API condition values
 */
export type MerchantCondition = "NEW" | "REFURBISHED" | "USED";

/**
 * Merchant API gender values
 */
export type MerchantGender = "MALE" | "FEMALE" | "UNISEX";

/**
 * Merchant API age group values
 */
export type MerchantAgeGroup = "NEWBORN" | "INFANT" | "TODDLER" | "KIDS" | "ADULT";

/**
 * ProductInput for Merchant API
 * This is the main type submitted to the API
 * @see https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs
 */
export type ProductInput = {
  name?: string;
  product?: string;
  channel: "ONLINE";
  offerId: string;
  contentLanguage: string;
  feedLabel: string;
  attributes: ProductAttributes;
};

/**
 * Response from product insert/update operations
 */
export type ProductInputResponse = {
  name: string;
  product: string;
  channel: "ONLINE";
  offerId: string;
  contentLanguage: string;
  feedLabel: string;
  attributes: ProductAttributes;
};

/**
 * Batch operation result
 */
export type BatchResult = {
  successful: number;
  failed: number;
  errors: Array<{
    offerId: string;
    error: string;
  }>;
};

/**
 * Product list response
 */
export type ProductListResponse = {
  products: ProductInputResponse[];
  nextPageToken?: string;
};

/**
 * Sync operation result
 */
export type SyncResult = {
  success: boolean;
  message: string;
  syncedCount: number;
  failedCount: number;
  errors: Array<{
    id: string;
    type: "piece" | "product";
    error: string;
  }>;
};
