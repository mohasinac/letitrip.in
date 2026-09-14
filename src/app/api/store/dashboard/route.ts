import { withProviders } from "@/providers.config";
/**
 * Store Dashboard Statistics
 * GET /api/store/dashboard
 *
 * Returns aggregated stats for the authenticated seller's store.
 * All queries run in parallel via Promise.all to stay within the 10 s limit.
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  storeRepository,
  productRepository,
  orderRepository,
  reviewRepository,
  payoutRepository,
  sieveFilter,
  SIEVE_OP,
} from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";
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
          totalOrders: 0,
          pendingOrders: 0,
          averageRating: undefined,
          currency: "₹",
        });
      }

      serverLogger.info("Store dashboard stats requested", { storeId: store.id });

      const storeId = store.id;

      const pendingProcessingFilter = [
        sieveFilter("status", SIEVE_OP.EQ, "pending"),
        sieveFilter("status", SIEVE_OP.EQ, "processing"),
      ].join("|");

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

      const activeListings = allProducts.filter((p) => (p as any).status === "published").length;

      // Sum revenue from delivered + processing orders (non-cancelled)
      const revenueOrders = (ordersResult.items as any[]).filter(
        (o) => o.status !== "CANCELLED" && o.status !== "REFUNDED",
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
