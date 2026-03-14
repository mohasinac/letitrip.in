/**
 * Admin Algolia Sync Categories Route
 *
 * POST /api/admin/algolia/sync-categories
 *
 * Fetches all active categories from Firestore and bulk-saves them to the
 * Algolia categories index. Admin-only. Idempotent.
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { categoriesRepository } from "@/repositories";
import {
  isAlgoliaConfigured,
  indexCategories,
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

    const allCategories = await categoriesRepository.findAll();
    const active = allCategories.filter((c) => c.isActive);

    serverLogger.info("Starting Algolia categories sync", {
      total: allCategories.length,
      active: active.length,
      index: ALGOLIA_CATEGORIES_INDEX_NAME,
    });

    const result = await indexCategories(active);

    serverLogger.info("Algolia categories sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_CATEGORIES_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_CATEGORIES_INDEX_NAME,
        skipped: allCategories.length - active.length,
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_CATEGORIES_SYNCED,
    );
  },
});
