import { withProviders } from "@/providers.config";
/**
 * Store Dashboard Statistics
 * GET /api/store/dashboard
 *
 * Returns aggregated stats for the authenticated seller's store.
 * All queries run in parallel via Promise.all to stay within the 10 s limit.
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { OrderStatusValues } from "@mohasinac/appkit/features/orders/schemas/firestore";
import { payoutRepository } from "@mohasinac/appkit/features/payments/repository/payout.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { orderRepository, reviewRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { safeRead } from "@mohasinac/appkit/server";
import { LOW_STOCK_THRESHOLD } from "@mohasinac/appkit/features/store-extensions/constants/alert-metrics";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);

      if (!store) {
        return successResponse({
          totalRevenue: 0,
          pendingPayouts: 0,
          activeListings: 0,
          lowStockListings: 0,
          outOfStockListings: 0,
          totalOrders: 0,
          pendingOrders: 0,
          averageRating: undefined,
          currency: "₹",
        });
      }

      serverLogger.info("Store dashboard stats requested", { storeId: store.id });

      const storeId = store.id;

      /*
       * 🛑 The pipe joins the VALUES, not two whole clauses.
       *
       * `[sieveFilter(s,EQ,"pending"), sieveFilter(s,EQ,"processing")].join("|")`
       * produces `status==pending|status==processing`, so the value parsed is
       * `pending` OR the literal string `status==processing` — which matches no
       * document. The count silently lost every processing order.
       *
       * Comma is not the alternative: `sieveMultiEq` joins with "," which is an
       * AND of two equalities on one field and can never match anything
       * (Root Cause #59). Same-field OR is one clause with piped values
       * (Root Cause #35).
       */
      const pendingProcessingFilter = sieveFilter(
        "status",
        SIEVE_OP.EQ,
        `${OrderStatusValues.PENDING}|${OrderStatusValues.PROCESSING}`,
      );

      /*
       * The two order queries are scoped by `storeId`, which is what lets them
       * join this round at all.
       *
       * They used to sit in a SECOND await below, because they needed the
       * product-id list from the first — `.where(productId, "in", productIds)`.
       * Firestore caps `in` at 30 values and nothing bounded that array, so for
       * any store past its 30th listing both queries threw, and both
       * `.catch(() => ({items:[]}))` handlers turned the throw into a dashboard
       * reporting zero orders and ₹0 revenue with no error anywhere. Root Cause
       * #59's swallow, on the seller's own headline numbers. Measured: the only
       * real seller has 65 products.
       *
       * Dropping the dependency also halves the round trips, which Rule #6
       * budgets at ~3 sequential Firestore hops per request.
       */
      const [allProducts, ordersResult, pendingOrdersResult, ratingAggregate, pendingPayouts] =
        await Promise.all([
          safeRead(() => productRepository.findByStore(storeId), {
            route: "/store",
            key: "products.findByStore",
            fallback: [],
          }),
          orderRepository
            .listForSeller(storeId, { page: 1, pageSize: 500 })
            .catch(() => ({ items: [], total: 0 })),
          orderRepository
            .listForSeller(storeId, {
              filters: pendingProcessingFilter,
              page: 1,
              pageSize: 500,
            })
            .catch(() => ({ items: [], total: 0 })),
          reviewRepository.getApprovedRatingAggregateByStore(storeId).catch(() => ({ count: 0, avgRating: 0 })),
          safeRead(
            () => payoutRepository.findByStoreAndStatus(storeId, "pending"),
            {
              route: "/store",
              key: "payouts.findByStoreAndStatus",
              fallback: [],
            },
          ),
        ]);

      const publishedProducts = allProducts.filter(
         
        (p) => (p as any).status === "published",
      );
      const activeListings = publishedProducts.length;

      /*
       * Low and out of stock, from the products list ALREADY fetched.
       *
       * The dashboard had no stock figure at all — `/api/store/dashboard`
       * greps zero for "stock" — so a seller saw six tiles and none of them
       * said anything about the lifecycle event that matters most on a
       * catalogue where 76–93% of listings are sold out.
       *
       * 🛑 Computed from `availableQuantity`, not `stockQuantity`:
       * purchasability gates on the first in three places, and reporting the
       * second would tell a seller they have stock while buyers cannot buy.
       *
       * No extra read. `allProducts` is already in hand and already filtered
       * for this exact tile set, so this is two reduces over an array rather
       * than a query — and `LOW_STOCK_THRESHOLD` is shared with the alert
       * evaluator and the products column so all three agree on "low".
       */
      const lowStockListings = publishedProducts.filter((p) => {
         
        const q = Number((p as any).availableQuantity ?? (p as any).stockQuantity ?? 0) || 0;
        return q > 0 && q <= LOW_STOCK_THRESHOLD;
      }).length;
      const outOfStockListings = publishedProducts.filter((p) => {
         
        const q = Number((p as any).availableQuantity ?? (p as any).stockQuantity ?? 0) || 0;
        return q <= 0;
      }).length;

      /*
       * 🛑 Lowercase. `OrderStatusValues` is lowercase and always has been, so
       * `o.status !== "CANCELLED"` was true for EVERY order including the
       * cancelled ones — the exclusion never excluded anything and the seller's
       * headline revenue counted cancelled and refunded orders.
       *
       * Compared against the constants rather than string literals so the next
       * casing drift is a compile error instead of silently inflated revenue.
       */
      const revenueOrders = (ordersResult.items as any[]).filter(
        (o) =>
          o.status !== OrderStatusValues.CANCELLED &&
          o.status !== OrderStatusValues.REFUNDED,
      );
      const totalRevenue = revenueOrders.reduce(
        (sum: number, o: any) => sum + (Number(o.totalAmount ?? o.totalPrice ?? 0) || 0),
        0,
      );

      // Average rating from pre-computed aggregate (no limit, full store history)
      const averageRating = ratingAggregate.count > 0 ? ratingAggregate.avgRating : undefined;

      // Pending payouts total, decimal rupees
      const pendingPayoutsTotal = (pendingPayouts as any[]).reduce(
        (sum: number, p: any) => sum + (Number(p.amount ?? 0) || 0),
        0,
      );

      return successResponse({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingPayouts: Math.round(pendingPayoutsTotal * 100) / 100,
        activeListings,
        totalOrders: ordersResult.total,
        pendingOrders: pendingOrdersResult.total,
        averageRating,
        currency: "₹",
      });
    },
  }),
);
