/**
 * Google Merchant Center Sync API Endpoint
 *
 * Admin-only endpoint for manually triggering Merchant Center sync operations.
 *
 * POST /api/merchant-sync
 *
 * Request body:
 * - { action: "syncPiece", pieceId: "uuid" } - Sync a single piece
 * - { action: "syncProduct", productId: "uuid" } - Sync a product bundle
 * - { action: "fullSync" } - Sync all published items
 * - { action: "status" } - Get configuration status
 */
import { merchantService } from "db/services/merchant.service";
import { type ActionFunctionArgs, data } from "react-router";
import z from "zod";

import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";

const SyncActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("syncPiece"),
    pieceId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("syncProduct"),
    productId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("fullSync"),
  }),
  z.object({
    action: z.literal("status"),
  }),
]);

export async function action({ request, context }: ActionFunctionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);

  // Admin-only endpoint
  if (session.user.role !== "admin") {
    logger.warn("Unauthorized merchant sync attempt", {
      userId: session.user.id,
    });
    return data({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parseResult = SyncActionSchema.safeParse(body);

    if (!parseResult.success) {
      return data(
        {
          success: false,
          error: "Invalid request",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { action: syncAction } = parseResult.data;

    logger.info("Merchant sync action requested", {
      action: syncAction,
      userId: session.user.id,
    });

    switch (syncAction) {
      case "syncPiece": {
        const { pieceId } = parseResult.data;
        const result = await merchantService.syncPiece(pieceId);
        return data(result, { status: result.success ? 200 : 500 });
      }

      case "syncProduct": {
        const { productId } = parseResult.data;
        const result = await merchantService.syncProduct(productId);
        return data(result, { status: result.success ? 200 : 500 });
      }

      case "fullSync": {
        const result = await merchantService.fullSync();
        return data(result, { status: result.success ? 200 : 500 });
      }

      case "status": {
        const isConfigured = merchantService.isConfigured();
        const configStatus = merchantService.getConfigurationStatus();
        return data({
          success: true,
          isConfigured,
          configStatus,
        });
      }
    }
  } catch (error) {
    logger.error("Merchant sync error", { error, userId: session.user.id });
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
