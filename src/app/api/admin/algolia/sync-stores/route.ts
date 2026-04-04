/**
 * Admin Algolia Sync Stores Route
 *
 * POST /api/admin/algolia/sync-stores
 *
 * Fetches all active + public stores from Firestore and bulk-saves them to
 * the Algolia stores index. Admin-only. Idempotent.
 */

import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import { storeRepository } from "@/repositories";
import {
  isAlgoliaConfigured,
  indexStores,
  ALGOLIA_STORES_INDEX_NAME,
} from "@mohasinac/search-algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const POST = createRouteHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    const allStores = await storeRepository.findAll();
    const eligible = allStores.filter(
      (s) => s.status === "active" && s.isPublic,
    );

    serverLogger.info("Starting Algolia stores sync", {
      total: allStores.length,
      eligible: eligible.length,
      index: ALGOLIA_STORES_INDEX_NAME,
    });

    const result = await indexStores(eligible);

    serverLogger.info("Algolia stores sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_STORES_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_STORES_INDEX_NAME,
        skipped: allStores.length - eligible.length,
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_STORES_SYNCED,
    );
  },
});
