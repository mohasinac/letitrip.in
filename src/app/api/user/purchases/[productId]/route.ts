import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderRepository, reviewRepository, ROUTES } from "@mohasinac/appkit";
import { shortOrderRef } from "@mohasinac/appkit/features/orders/utils/order-ref";
import { ROLES_AUTHENTICATED } from "@/constants";

/**
 * GET /api/user/purchases/[productId] — "have I bought this, and did I review it?"
 *
 * Backs the strip on a product page that gets a buyer from the item to their
 * own order and their own review. Both answers are per-viewer.
 *
 * ── The 90-day window is REAL and must be surfaced ────────────────────────
 *
 * 🛑 `OrderDocument.items[]` holds OBJECTS, so Firestore's `array-contains`
 * cannot match a nested `productId`, and there is no denormalised flat array
 * of product ids on the order. The only queryable field is the FLAT
 * `productId`, which describes just the representative line — so a multi-line
 * order containing this product would not match it.
 *
 * So this reuses `findRecentByUser`, a bounded 90-day window already ordered
 * `orderDate desc`, and scans `items[]` in memory. One read, no new index,
 * correct for multi-line orders — and bounded to 90 days.
 *
 * `windowDays` is returned so the CLIENT can say so. A buyer whose purchase is
 * older than the window must be told "no order in the last 90 days", never
 * "you haven't bought this" — reporting a filtered empty result as an absolute
 * zero is the defect `UserOrdersView` documents at length, and the buyer has
 * no way to check it.
 */
const WINDOW_DAYS = 90;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ user, params }) => {
      const productId = (params as { productId: string }).productId;

      /*
       * Both reads in parallel — independent, and the page is waiting on both
       * before it can render either affordance (Rule #6's round-trip budget).
       */
      const [recentOrders, reviews] = await Promise.all([
        orderRepository.findRecentByUser(user!.uid),
        /*
         * 🛑 NO SORT. `userId` and `productId` are both `canFilter` in the
         * reviews Sieve config, and a two-equality query is served by
         * Firestore's zigzag merge join with no composite index. There is no
         * `(userId, productId)` index, so adding an `orderBy` — or a `status`
         * clause — raises FAILED_PRECONDITION, which every caller in this
         * codebase swallows into an empty result (Root Cause #59).
         */
        reviewRepository.listForProduct(productId, {
          filters: `userId==${user!.uid}`,
        }),
      ]);

      const matching = recentOrders.find(
        (o) =>
          o.items?.some((it) => it.productId === productId) ||
          o.productId === productId,
      );

      const review = reviews?.items?.[0] ?? null;

      const res = successResponse({
        order: matching
          ? {
              id: matching.id,
              shortRef: shortOrderRef(matching.id),
              status: matching.status,
              orderDate: matching.orderDate ?? matching.createdAt ?? null,
              trackHref: String(ROUTES.USER.ORDER_TRACK(matching.id)),
              detailHref: String(ROUTES.USER.ORDER_DETAIL(matching.id)),
            }
          : null,
        review: review
          ? { id: review.id, rating: review.rating, status: review.status }
          : null,
        windowDays: WINDOW_DAYS,
      });
      // Per-viewer by construction — never shared, never edge-cached.
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    },
  }),
);
