/**
 * Merchant Center Sync Service
 *
 * Business logic for syncing products to Google Merchant Center.
 * Uses existing JSON-LD generation as the source of truth.
 */

import * as schema from "db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "~/lib/db";
import type { Logger } from "~/lib/logger.server";
import { logger } from "~/lib/logger.server";
import { merchantApiClient } from "~/lib/merchant/client";
import {
  transformPieceToProductInput,
  transformProductGroupToProductInputs,
} from "~/lib/merchant/transformer";
import type { SyncResult } from "~/lib/merchant/types";
import {
  generateProductStructuredData,
  generateProductGroupStructuredData,
} from "~/lib/seo";

class MerchantService {
  constructor(private logger: Logger) {}

  /**
   * Check if the merchant API client is properly configured
   */
  isConfigured(): boolean {
    return merchantApiClient.isConfigured();
  }

  /**
   * Get configuration status for debugging
   */
  getConfigurationStatus() {
    return merchantApiClient.getConfigurationStatus();
  }

  /**
   * Sync a single piece to Merchant Center
   *
   * @param pieceId - The ID of the piece to sync
   */
  async syncPiece(pieceId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: "Merchant API not configured",
        };
      }

      // Fetch piece with all required relations for JSON-LD generation
      const piece = await db.query.pieces.findFirst({
        where: eq(schema.pieces.id, pieceId),
        with: {
          brand: true,
          category: true,
          images: {
            orderBy: (images, { asc }) => [asc(images.displayOrder)],
          },
          size: true,
          measurements: {
            orderBy: (measurements, { asc }) => [asc(measurements.displayOrder)],
          },
          piecesToTags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!piece) {
        this.logger.warn("Piece not found for sync", { pieceId });
        return {
          success: false,
          message: "Piece not found",
        };
      }

      // Only sync published pieces
      if (piece.status !== "published") {
        this.logger.info("Skipping non-published piece", {
          pieceId,
          status: piece.status,
        });

        // If piece was previously synced but is no longer published, delete it
        if (piece.status === "sold" || piece.status === "draft") {
          try {
            await merchantApiClient.deleteProduct(piece.id);
            this.logger.info("Deleted non-published piece from Merchant Center", {
              pieceId,
            });
          } catch (deleteError) {
            // Ignore errors when deleting (product might not exist)
            this.logger.debug("Could not delete piece (may not exist)", {
              pieceId,
              error: deleteError,
            });
          }
        }

        return {
          success: true,
          message: `Piece skipped (status: ${piece.status})`,
        };
      }

      // Generate JSON-LD
      const jsonLd = generateProductStructuredData(piece);

      // Transform to Merchant API format
      const productInput = transformPieceToProductInput(jsonLd);

      // Submit to Merchant Center
      await merchantApiClient.upsertProduct(productInput);

      this.logger.info("Piece synced successfully", { pieceId });

      return {
        success: true,
        message: "Piece synced successfully",
      };
    } catch (error) {
      this.logger.error("Failed to sync piece", { pieceId, error });
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sync a product bundle to Merchant Center
   *
   * All pieces in the bundle are synced with the same itemGroupId.
   *
   * @param productId - The ID of the product to sync
   */
  async syncProduct(productId: string): Promise<{
    success: boolean;
    message: string;
    syncedPieces?: number;
  }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: "Merchant API not configured",
        };
      }

      // Fetch product with all required relations
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, productId),
        with: {
          images: {
            orderBy: (images, { asc }) => [asc(images.displayOrder)],
          },
          pieces: {
            with: {
              size: true,
              brand: true,
              category: true,
              images: {
                orderBy: (images, { asc }) => [asc(images.displayOrder)],
              },
            },
          },
        },
      });

      if (!product) {
        this.logger.warn("Product not found for sync", { productId });
        return {
          success: false,
          message: "Product not found",
        };
      }

      // Only sync published products
      if (product.status !== "published") {
        this.logger.info("Skipping non-published product", {
          productId,
          status: product.status,
        });
        return {
          success: true,
          message: `Product skipped (status: ${product.status})`,
          syncedPieces: 0,
        };
      }

      // Generate JSON-LD for the product group
      const jsonLd = generateProductGroupStructuredData(product);

      // Transform to Merchant API format (array of ProductInputs)
      const productInputs = transformProductGroupToProductInputs(jsonLd);

      // Batch submit to Merchant Center
      const batchResult = await merchantApiClient.batchUpsertProducts(productInputs);

      if (batchResult.failed > 0) {
        this.logger.warn("Some pieces failed to sync", {
          productId,
          successful: batchResult.successful,
          failed: batchResult.failed,
          errors: batchResult.errors,
        });
      }

      this.logger.info("Product synced", {
        productId,
        piecessynced: batchResult.successful,
      });

      return {
        success: batchResult.failed === 0,
        message:
          batchResult.failed === 0
            ? "Product synced successfully"
            : `Synced ${batchResult.successful}/${productInputs.length} pieces`,
        syncedPieces: batchResult.successful,
      };
    } catch (error) {
      this.logger.error("Failed to sync product", { productId, error });
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Full sync: sync all published pieces and products
   *
   * @returns Summary of the sync operation
   */
  async fullSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      message: "",
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: "Merchant API not configured",
          syncedCount: 0,
          failedCount: 0,
          errors: [],
        };
      }

      this.logger.info("Starting full sync");

      // Sync all published standalone pieces (pieces not in a product)
      const standalonePieces = await db.query.pieces.findMany({
        where: eq(schema.pieces.status, "published"),
        columns: {
          id: true,
          productId: true,
        },
      });

      const piecesWithoutProduct = standalonePieces.filter((p) => !p.productId);

      this.logger.info("Syncing standalone pieces", {
        count: piecesWithoutProduct.length,
      });

      for (const piece of piecesWithoutProduct) {
        const pieceResult = await this.syncPiece(piece.id);
        if (pieceResult.success) {
          result.syncedCount++;
        } else {
          result.failedCount++;
          result.errors.push({
            id: piece.id,
            type: "piece",
            error: pieceResult.message,
          });
        }
      }

      // Sync all published products
      const products = await db.query.products.findMany({
        where: eq(schema.products.status, "published"),
        columns: {
          id: true,
        },
      });

      this.logger.info("Syncing products", { count: products.length });

      for (const product of products) {
        const productResult = await this.syncProduct(product.id);
        if (productResult.success) {
          result.syncedCount += productResult.syncedPieces || 0;
        } else {
          result.failedCount++;
          result.errors.push({
            id: product.id,
            type: "product",
            error: productResult.message,
          });
        }
      }

      result.success = result.failedCount === 0;
      result.message = result.success
        ? `Full sync completed: ${result.syncedCount} items synced`
        : `Full sync completed with errors: ${result.syncedCount} synced, ${result.failedCount} failed`;

      this.logger.info("Full sync completed", {
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
      });

      return result;
    } catch (error) {
      this.logger.error("Full sync failed", { error });
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        syncedCount: result.syncedCount,
        failedCount: result.failedCount,
        errors: result.errors,
      };
    }
  }

  /**
   * Handle piece status change
   *
   * Call this when a piece status changes to sync/unsync from Merchant Center.
   *
   * @param pieceId - The ID of the piece
   * @param newStatus - The new status of the piece
   */
  async onPieceStatusChange(
    pieceId: string,
    newStatus: string
  ): Promise<void> {
    try {
      if (!this.isConfigured()) {
        this.logger.debug("Merchant API not configured, skipping status change handler");
        return;
      }

      if (newStatus === "published") {
        // Sync the piece
        await this.syncPiece(pieceId);
      } else {
        // Remove from Merchant Center
        try {
          await merchantApiClient.deleteProduct(pieceId);
          this.logger.info("Removed piece from Merchant Center", { pieceId });
        } catch (error) {
          // Ignore errors when deleting (product might not exist)
          this.logger.debug("Could not delete piece (may not exist)", {
            pieceId,
            error,
          });
        }
      }
    } catch (error) {
      this.logger.error("Error handling piece status change", {
        pieceId,
        newStatus,
        error,
      });
    }
  }

  static SyncPieceSchema = z.object({
    pieceId: z.string().uuid(),
  });

  static SyncProductSchema = z.object({
    productId: z.string().uuid(),
  });
}

const merchantService = new MerchantService(
  logger.child({ service: "MerchantService" })
);

export { merchantService, MerchantService };
