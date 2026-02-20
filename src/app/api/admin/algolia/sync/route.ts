/**
 * Admin Algolia Sync Route
 *
 * POST /api/admin/algolia/sync
 *
 * Fetches all published products from Firestore and bulk-saves them to the
 * Algolia search index. Admin-only. Idempotent — safe to run multiple times.
 *
 * Use this endpoint after bulk product changes, initial setup, or to repair
 * index drift between Firestore and Algolia.
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { productRepository } from "@/repositories";
import {
  isAlgoliaConfigured,
  indexProducts,
  ALGOLIA_INDEX_NAME,
} from "@/lib/search/algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const POST = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    // Guard: Algolia must be configured
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    // Fetch all products and filter to published ones
    const allProducts = await productRepository.findAll();
    const published = allProducts.filter((p) => p.status === "published");

    serverLogger.info("Starting Algolia sync", {
      total: allProducts.length,
      published: published.length,
      index: ALGOLIA_INDEX_NAME,
    });

    // Bulk index — createApiHandler catches errors and formats them
    const result = await indexProducts(published);

    serverLogger.info("Algolia sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_INDEX_NAME,
        skipped: allProducts.length - published.length,
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_SYNCED,
    );
  },
});
