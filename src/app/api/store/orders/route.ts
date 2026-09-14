import { withProviders } from "@/providers.config";
/**
 * Seller Orders API Route
 *
 * GET /api/store/orders
 * Returns the authenticated seller's store's orders.
 *
 * Strategy: resolve the caller's store → one `storeId ==` query. `storeId` is
 * the field a cart is SPLIT on, so it is exactly "this store's orders".
 *
 * It used to fetch every product first and pass their ids as a
 * `productId in [...]` clause; Firestore caps `in` at 30 values, so this route
 * was a permanent 500 for any store past its 30th listing.
 */

import { orderRepository, storeRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { sortBy, ORDER_FIELDS } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { mergeOrderScopeFilter } from "@mohasinac/appkit";

const DEFAULT_SORTS = sortBy(ORDER_FIELDS.ORDER_DATE);

/**
 * GET /api/store/orders
 *
 * Returns paginated orders for the authenticated seller's products.
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==pending)
 *  - sorts    (string)  — Sieve sorts (e.g. -createdAt)
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — results per page (default 20)
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user, request }) => {
    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    // `searchTxt` is an `array-contains` clause, which Sieve cannot express —
    // so it travels alongside `filters`, not inside it.
    const search = getStringParam(searchParams, "q")?.trim() || undefined;

    const store = await storeRepository.findByOwnerId(user!.uid);
    serverLogger.info("Seller orders list requested", {
      storeId: store?.id,
      filters,
      sorts,
      page,
      pageSize,
    });

    if (!store) {
      return successResponse({
        orders: [],
        meta: { page, limit: pageSize, total: 0, totalPages: 0, hasMore: false },
      });
    }

    /*
     * Scope by `storeId` — the field a cart is SPLIT on, so it is exactly "this
     * store's orders". This used to fetch every product first and pass the ids
     * as a `productId in [...]` clause, which Firestore caps at 30 values: with
     * 65 products in the only real seller's store, this route was a permanent
     * 500 for them (and fine for every small store, which is why it survived).
     * The store is already resolved above, so this also deletes a whole
     * Firestore query from the request.
     */
    const sieveResult = await orderRepository.listForSeller(store.id, {
      filters,
      sorts,
      page,
      pageSize,
    }, { search });

    return successResponse({
      orders: sieveResult.items,
      meta: {
        page: sieveResult.page,
        limit: sieveResult.pageSize,
        total: sieveResult.total,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  },
}));

