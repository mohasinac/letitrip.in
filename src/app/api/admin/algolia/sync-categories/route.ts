import "@/providers.config";
/**
 * Admin Algolia Sync Categories Route
 *
 * POST /api/admin/algolia/sync-categories
 *
 * Fetches all active categories from Firestore and bulk-saves them to the
 * Algolia categories index. Admin-only. Idempotent.
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { categoriesRepository } from "@/repositories";
import {
  isAlgoliaConfigured,
  indexCategories,
  ALGOLIA_CATEGORIES_INDEX_NAME,
} from "@mohasinac/appkit/providers/search-algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";

async function loadActiveCategories() {
  const items = [] as Awaited<
    ReturnType<typeof categoriesRepository.list>
  >["items"];
  let page = 1;

  while (true) {
    const result = await categoriesRepository.list({
      filters: "isActive==true",
      sorts: "order",
      page: String(page),
      pageSize: "200",
    });
    items.push(...result.items);
    if (!result.hasMore) {
      return { items, total: result.total };
    }
    page += 1;
  }
}

export const POST = createRouteHandler({
  auth: true,
  roles: ["admin"],
  handler: async () => {
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    const active = await loadActiveCategories();

    serverLogger.info("Starting Algolia categories sync", {
      total: active.total,
      active: active.total,
      index: ALGOLIA_CATEGORIES_INDEX_NAME,
    });

    const result = await indexCategories(active.items);

    serverLogger.info("Algolia categories sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_CATEGORIES_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_CATEGORIES_INDEX_NAME,
        skipped: active.total - result.indexed,
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_CATEGORIES_SYNCED,
    );
  },
});
