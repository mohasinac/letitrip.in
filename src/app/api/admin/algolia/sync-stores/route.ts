import "@/providers.config";
/**
 * Admin Algolia Sync Stores Route
 *
 * POST /api/admin/algolia/sync-stores
 *
 * Fetches all active + public stores from Firestore and bulk-saves them to
 * the Algolia stores index. Admin-only. Idempotent.
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import { storeRepository } from "@/repositories";
import {
  isAlgoliaConfigured,
  indexStores,
  ALGOLIA_STORES_INDEX_NAME,
} from "@mohasinac/appkit/providers/search-algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";

async function loadEligibleStores() {
  const items = [] as Awaited<
    ReturnType<typeof storeRepository.listAllStores>
  >["items"];
  let page = 1;

  while (true) {
    const result = await storeRepository.listAllStores({
      filters: "status==active,isPublic==true",
      sorts: "-createdAt",
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

    const eligible = await loadEligibleStores();

    serverLogger.info("Starting Algolia stores sync", {
      total: eligible.total,
      eligible: eligible.total,
      index: ALGOLIA_STORES_INDEX_NAME,
    });

    const result = await indexStores(eligible.items);

    serverLogger.info("Algolia stores sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_STORES_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_STORES_INDEX_NAME,
        skipped: eligible.total - result.indexed,
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_STORES_SYNCED,
    );
  },
});
