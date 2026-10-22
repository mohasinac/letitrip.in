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

import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { orderRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { ORDER_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { ROLES_STORE_WRITE } from "@/constants";
import { mergeOrderScopeFilter } from "@mohasinac/appkit/features/orders/constants/order-scope";
import { VALID_ORDER_TYPES } from "@mohasinac/appkit/features/orders/constants/order-lane-tabs";

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
    const rawFilters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

    /*
     * Lane (provenance) filter — the seller's half of the tabs `/user/orders`
     * has had. `SellerOrdersView` emits it inside `filters` as
     * `orderType==auction`, the same shape the buyer's view uses.
     *
     * 🛑 `standard` is deliberately NOT pushed into Firestore. Orders written
     * before `orderType` existed carry no value, and an equality EXCLUDES every
     * document that lacks the field — so the most-used tab would silently hide
     * every legacy order. Stripped from the query here and refined in memory
     * below, exactly as `/api/user/orders` does.
     */
    const laneFromFilters = rawFilters?.match(/orderType==([\w-]+)/)?.[1];
    const lane =
      laneFromFilters && VALID_ORDER_TYPES.has(laneFromFilters) ? laneFromFilters : undefined;
    const refineStandardInMemory = lane === "standard";
    const filters = refineStandardInMemory
      ? // Drop just this clause, keeping any others (status, scope) intact.
        rawFilters
          ?.split(",")
          .filter((clause) => !clause.startsWith("orderType=="))
          .join(",") || undefined
      : rawFilters;
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
        items: [],
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

    /*
     * The one in-memory refinement, over ONE page of results.
     *
     * 🛑 So the count it produces describes that PAGE, not the result set.
     * Assigning it to `total` would tell the pager there is exactly one page,
     * which is the bug `/api/user/orders` had until 2026-08-24: the default
     * "Normal" lane — the most common view on the screen — could never be
     * paged past page 1. `truncated` reports the honest shape instead: the
     * total is a FLOOR, and the pager offers Next without claiming a last page.
     */
    const refined = refineStandardInMemory
      ? sieveResult.items.filter((o) => !o.orderType || o.orderType === "standard")
      : sieveResult.items;

    /*
     * 🛑 `revealOrders`, never the raw rows.
     *
     * `OrderRepository.mapDoc` is deliberately NOT overridden (see its own
     * comment), so a sieve result carries the three `ORDER_PII_FIELDS` as
     * stored `enc:v1:…` ciphertext. This route returned them verbatim, and
     * `SellerOrdersView`'s row subtitle — `toStringValue(item.userName, …)` —
     * rendered the ciphertext: measured live as
     * `enc:v1:8plr3ZzKBqejPPti:MCZsrfOidLkSL6EogbxlCzU=:…` where the buyer's
     * name belongs.
     *
     * 🛑 THE SAME BUG WAS ALREADY FOUND AND FIXED ONE ROUTE OVER.
     * `/api/admin/orders` carries a comment recording it ("measured live at 3
     * visible `enc:v1:` strings") and `/api/store/fulfillment` had already
     * chosen `revealOrders` — this route is the sibling nobody back-ported to,
     * which is Root Cause #59's shape on the PII axis.
     *
     * REVEAL, not mask, and the choice is per audience rather than uniform:
     * these are the seller's OWN orders and they have to pack and address
     * them, which is the identical reasoning `/api/store/fulfillment` states
     * ("a seller packing their own order needs the real name on the label").
     * The ADMIN list masks instead, because an admin browsing a list does not
     * need plaintext and the detail view reveals on demand.
     *
     * 🛑 Why the branded type did not catch this: `Encrypted<string>` is erased
     * at the serialisation boundary. It makes an appkit-internal reader a
     * compile error, but the client receives JSON typed `string`, so nothing
     * downstream of `successResponse` can be protected by it. A route is where
     * the brand has to be honoured, because it is the last place it exists.
     */
    const items = orderRepository.revealOrders(
      refined as Parameters<typeof orderRepository.revealOrders>[0],
    );

    const truncated = refineStandardInMemory;
    const total = truncated
      ? Math.max(items.length, (sieveResult.page - 1) * sieveResult.pageSize + items.length)
      : sieveResult.total;
    const totalPages = truncated
      ? sieveResult.hasMore
        ? sieveResult.page + 1
        : sieveResult.page
      : sieveResult.totalPages;

    return successResponse({
      items,
      meta: {
        page: sieveResult.page,
        limit: sieveResult.pageSize,
        total,
        totalPages,
        hasMore: sieveResult.hasMore,
        truncated,
      },
    });
  },
}));

