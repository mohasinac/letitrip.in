import "@/providers.config";
/**
 * Admin Algolia Clear Stores Route
 *
 * POST /api/admin/algolia/clear-stores
 *
 * Removes ALL records from the stores Algolia index without deleting the
 * index itself. Admin-only. Run a sync immediately after to repopulate.
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  isAlgoliaConfigured,
  clearAlgoliaIndex,
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

    serverLogger.warn("Clearing Algolia stores index", {
      index: ALGOLIA_STORES_INDEX_NAME,
    });

    await clearAlgoliaIndex(ALGOLIA_STORES_INDEX_NAME);

    serverLogger.warn("Algolia stores index cleared", {
      index: ALGOLIA_STORES_INDEX_NAME,
    });

    return successResponse(
      { index: ALGOLIA_STORES_INDEX_NAME },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_STORES_CLEARED,
    );
  },
});
