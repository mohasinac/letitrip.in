import "@/providers.config";
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

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { productRepository } from "@/repositories";
import {
  isAlgoliaConfigured,
  indexProducts,
  ALGOLIA_INDEX_NAME,
} from "@mohasinac/appkit/providers/search-algolia";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ValidationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

async function loadPublishedProducts() {
  const items = [] as Awaited<
    ReturnType<typeof productRepository.list>
  >["items"];
  let page = 1;

  while (true) {
    const result = await productRepository.list(
      {
        filters: "status==published",
        sorts: "-createdAt",
        page: String(page),
        pageSize: "200",
      },
      { status: "published" },
    );
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
    // Guard: Algolia must be configured
    if (!isAlgoliaConfigured()) {
      throw new ValidationError(ERROR_MESSAGES.ADMIN.ALGOLIA_NOT_CONFIGURED);
    }

    const published = await loadPublishedProducts();

    serverLogger.info("Starting Algolia sync", {
      total: published.total,
      published: published.total,
      index: ALGOLIA_INDEX_NAME,
    });

    // Bulk index — createApiHandler catches errors and formats them
    const result = await indexProducts(published.items);

    serverLogger.info("Algolia sync completed", {
      indexed: result.indexed,
      index: ALGOLIA_INDEX_NAME,
    });

    return successResponse(
      {
        indexed: result.indexed,
        index: ALGOLIA_INDEX_NAME,
        skipped: published.total - result.indexed,
      },
      SUCCESS_MESSAGES.ADMIN.ALGOLIA_SYNCED,
    );
  },
});
