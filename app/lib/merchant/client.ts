/**
 * Google Merchant Center API Client
 *
 * Handles authentication and API calls to Google Merchant Center
 * using the Merchant API (not the deprecated Content API).
 *
 * @see https://developers.google.com/merchant/api
 */
import { google } from "googleapis";

import type { Logger } from "~/lib/logger.server";
import { logger as rootLogger } from "~/lib/logger.server";

import { MERCHANT_CONFIG } from "./constants";
import type { BatchResult, ProductInput, ProductListResponse } from "./types";

/**
 * Environment variables for Google Merchant API authentication
 */
const MERCHANT_ID = process.env.GOOGLE_MERCHANT_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const DATA_SOURCE_ID = process.env.GOOGLE_MERCHANT_DATA_SOURCE_ID;

/**
 * Google Merchant API Client
 *
 * Uses Service Account authentication for server-to-server communication.
 */
class MerchantApiClient {
  private logger: Logger;
  private auth: InstanceType<typeof google.auth.JWT> | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Get or create authenticated JWT client
   */
  private async getAuth() {
    if (this.auth) {
      return this.auth;
    }

    if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_KEY) {
      throw new Error(
        "Missing Google Service Account credentials. " +
          "Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY environment variables."
      );
    }

    // Parse the private key (it may have escaped newlines)
    const privateKey = SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n");

    this.auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/content"],
    });

    return this.auth;
  }

  /**
   * Get the account name in Merchant API format
   */
  private getAccountName(): string {
    if (!MERCHANT_ID) {
      throw new Error("Missing GOOGLE_MERCHANT_ID environment variable.");
    }
    return `accounts/${MERCHANT_ID}`;
  }

  /**
   * Get the data source name in Merchant API format
   */
  private getDataSourceName(): string {
    if (!DATA_SOURCE_ID) {
      throw new Error(
        "Missing GOOGLE_MERCHANT_DATA_SOURCE_ID environment variable."
      );
    }
    return `accounts/${MERCHANT_ID}/dataSources/${DATA_SOURCE_ID}`;
  }

  /**
   * Make an authenticated request to the Merchant API
   */
  private async request<T>(
    method: "GET" | "POST" | "DELETE",
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const auth = await this.getAuth();
    const accessToken = await auth.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Failed to obtain access token");
    }

    const baseUrl = "https://merchantapi.googleapis.com/products/v1beta";
    const url = `${baseUrl}/${endpoint}`;

    this.logger.debug("Merchant API request", { method, url });

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error("Merchant API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Merchant API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // DELETE requests may return empty response
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Insert or update a product in Merchant Center
   *
   * @param productInput - The product data to submit
   * @returns The created/updated product
   */
  async upsertProduct(productInput: ProductInput): Promise<void> {
    const accountName = this.getAccountName();
    const dataSource = this.getDataSourceName();

    // The endpoint includes the data source
    const endpoint = `${accountName}/productInputs:insert?dataSource=${encodeURIComponent(dataSource)}`;

    this.logger.info("Upserting product", { offerId: productInput.offerId });

    await this.request<unknown>("POST", endpoint, productInput);

    this.logger.info("Product upserted successfully", {
      offerId: productInput.offerId,
    });
  }

  /**
   * Batch upsert multiple products
   *
   * Note: The Merchant API doesn't have a native batch endpoint for productInputs,
   * so we process them sequentially with error handling.
   *
   * @param inputs - Array of product inputs to submit
   * @returns Batch result with success/failure counts
   */
  async batchUpsertProducts(inputs: ProductInput[]): Promise<BatchResult> {
    const result: BatchResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const input of inputs) {
      try {
        await this.upsertProduct(input);
        result.successful++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          offerId: input.offerId,
          error: error instanceof Error ? error.message : String(error),
        });
        this.logger.error("Failed to upsert product", {
          offerId: input.offerId,
          error,
        });
      }
    }

    this.logger.info("Batch upsert completed", {
      successful: result.successful,
      failed: result.failed,
    });

    return result;
  }

  /**
   * Delete a product from Merchant Center
   *
   * @param offerId - The offer ID of the product to delete
   */
  async deleteProduct(offerId: string): Promise<void> {
    const accountName = this.getAccountName();
    const dataSource = this.getDataSourceName();

    // Build the product input name
    const name = `${accountName}/productInputs/${MERCHANT_CONFIG.feedLabel}~${MERCHANT_CONFIG.contentLanguage}~${offerId}`;
    const endpoint = `${name}?dataSource=${encodeURIComponent(dataSource)}`;

    this.logger.info("Deleting product", { offerId });

    await this.request<void>("DELETE", endpoint);

    this.logger.info("Product deleted successfully", { offerId });
  }

  /**
   * List products from Merchant Center
   *
   * @param pageToken - Optional token for pagination
   * @param pageSize - Number of products per page (default: 250)
   * @returns List of products with optional next page token
   */
  async listProducts(
    pageToken?: string,
    pageSize: number = 250
  ): Promise<ProductListResponse> {
    const accountName = this.getAccountName();

    let endpoint = `${accountName}/products?pageSize=${pageSize}`;
    if (pageToken) {
      endpoint += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    this.logger.debug("Listing products", { pageSize, pageToken });

    const response = await this.request<{
      products?: unknown[];
      nextPageToken?: string;
    }>("GET", endpoint);

    return {
      products: (response.products || []) as ProductListResponse["products"],
      nextPageToken: response.nextPageToken,
    };
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!(
      MERCHANT_ID &&
      SERVICE_ACCOUNT_EMAIL &&
      SERVICE_ACCOUNT_KEY &&
      DATA_SOURCE_ID
    );
  }

  /**
   * Get configuration status for debugging
   */
  getConfigurationStatus(): Record<string, boolean> {
    return {
      GOOGLE_MERCHANT_ID: !!MERCHANT_ID,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!SERVICE_ACCOUNT_EMAIL,
      GOOGLE_SERVICE_ACCOUNT_KEY: !!SERVICE_ACCOUNT_KEY,
      GOOGLE_MERCHANT_DATA_SOURCE_ID: !!DATA_SOURCE_ID,
    };
  }
}

// Export singleton instance
const merchantApiClient = new MerchantApiClient(
  rootLogger.child({ service: "MerchantApiClient" })
);

export { merchantApiClient, MerchantApiClient };
