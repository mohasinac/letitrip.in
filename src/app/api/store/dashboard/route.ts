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

      const [allProducts, , , approvedReviews, pendingPayouts] =
        await Promise.all([
          productRepository.findByStore(storeId).catch(() => []),
          // listForSeller needs productIds — defer to inline below
          Promise.resolve(null),
          Promise.resolve(null),
          reviewRepository.findApprovedByStore(storeId).catch(() => []),
          payoutRepository.findByStoreAndStatus(storeId, "pending").catch(() => []),
        ]);

      const productIds = allProducts.map((p) => p.id);
      const activeListings = allProducts.filter((p) => (p as any).status === "published").length;

      const pendingProcessingFilter = [
        sieveFilter("status", SIEVE_OP.EQ, "pending"),
        sieveFilter("status", SIEVE_OP.EQ, "processing"),
      ].join("|");

      const [ordersResult, pendingOrdersResult] = await Promise.all([
        productIds.length > 0
          ? orderRepository.listForSeller(productIds, { page: 1, pageSize: 50 }).catch(() => ({
              items: [],
              total: 0,
            }))
          : Promise.resolve({ items: [], total: 0 }),
        productIds.length > 0
          ? orderRepository
              .listForSeller(productIds, {
                filters: pendingProcessingFilter,
                page: 1,
                pageSize: 50,
              })
              .catch(() => ({ items: [], total: 0 }))
          : Promise.resolve({ items: [], total: 0 }),
      ]);

      // Sum revenue from delivered + processing orders (non-cancelled)
      const revenueOrders = (ordersResult.items as any[]).filter(
        (o) => o.status !== "CANCELLED" && o.status !== "REFUNDED",
      );
      const totalRevenuePaise = revenueOrders.reduce(
        (sum: number, o: any) => sum + (Number(o.totalAmount ?? o.totalPrice ?? 0) || 0),
        0,
      );

      // Average rating
      const ratings = (approvedReviews as any[]).map((r) => Number(r.rating ?? 0)).filter(Boolean);
      const averageRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
          : undefined;

      // Pending payouts total (paise)
      const pendingPayoutsPaise = (pendingPayouts as any[]).reduce(
        (sum: number, p: any) => sum + (Number(p.amount ?? 0) || 0),
        0,
      );

      return successResponse({
        totalRevenue: Math.round(totalRevenuePaise / 100), // paise → rupees
        pendingPayouts: Math.round(pendingPayoutsPaise / 100),
        activeListings,
        totalOrders: ordersResult.total,
        pendingOrders: pendingOrdersResult.total,
        averageRating,
        currency: "₹",
      });
    },
  }),
);
