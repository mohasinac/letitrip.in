import "@/providers.config";
/**
 * Admin Algolia Clear Products Route
 *
 * POST /api/admin/algolia/clear-products
 *
 * Removes ALL records from the products Algolia index without deleting the
 * index itself (settings and configuration are preserved). Admin-only.
 *
 * Use with caution — run a sync immediately after to repopulate.
 */

import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import {
  isAlgoliaConfigured,
  clearAlgoliaIndex,
  ALGOLIA_INDEX_NAME,
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

    serverLogger.warn("Clearing Algolia products index", {
      index: ALGOLIA_INDEX_NAME,
    });

    await clearAlgoliaIndex(ALGOLIA_INDEX_NAME);

    serverLogger.warn("Algolia products index cleared", {
      index: ALGOLIA_INDEX_NAME,
    });

    return successResponse(
      { index: ALGOLIA_INDEX_NAME },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_PRODUCTS_CLEARED,
    );
  },
});
