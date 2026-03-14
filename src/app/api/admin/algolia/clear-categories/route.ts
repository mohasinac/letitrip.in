/**
 * Admin Algolia Clear Categories Route
 *
 * POST /api/admin/algolia/clear-categories
 *
 * Removes ALL records from the categories Algolia index without deleting the
 * index itself. Admin-only. Run a sync immediately after to repopulate.
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  isAlgoliaConfigured,
  clearAlgoliaIndex,
  ALGOLIA_CATEGORIES_INDEX_NAME,
} from "@/lib/search/algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

export const POST = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    serverLogger.warn("Clearing Algolia categories index", {
      index: ALGOLIA_CATEGORIES_INDEX_NAME,
    });

    await clearAlgoliaIndex(ALGOLIA_CATEGORIES_INDEX_NAME);

    serverLogger.warn("Algolia categories index cleared", {
      index: ALGOLIA_CATEGORIES_INDEX_NAME,
    });

    return successResponse(
      { index: ALGOLIA_CATEGORIES_INDEX_NAME },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_CATEGORIES_CLEARED,
    );
  },
});
