import "@/providers.config";
/**
 * Admin Algolia Clear Pages Route
 *
 * POST /api/admin/algolia/clear-pages
 *
 * Removes ALL records from the pages_nav Algolia index without deleting the
 * index itself (settings and configuration are preserved). Admin-only.
 *
 * Use with caution — run a sync-pages immediately after to repopulate.
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  isAlgoliaConfigured,
  clearAlgoliaIndex,
  ALGOLIA_PAGES_INDEX_NAME,
} from "@mohasinac/appkit/providers/search-algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";

export const POST = createRouteHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    serverLogger.warn("Clearing Algolia pages_nav index", {
      index: ALGOLIA_PAGES_INDEX_NAME,
    });

    await clearAlgoliaIndex(ALGOLIA_PAGES_INDEX_NAME);

    serverLogger.warn("Algolia pages_nav index cleared", {
      index: ALGOLIA_PAGES_INDEX_NAME,
    });

    return successResponse(
      { index: ALGOLIA_PAGES_INDEX_NAME },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_PAGES_CLEARED,
    );
  },
});
