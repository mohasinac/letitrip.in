import { withProviders } from "@/providers.config";
/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { analyticsRollupRepository } from "@mohasinac/appkit/features/admin/repository/analytics-rollup.repository";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { orderRepository, reviewRepository } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  handler: async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      disabledUsers,
      adminUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      pendingReviews,
    ] = await Promise.all([
      userRepository.count().catch(() => 0),
      userRepository.countActive().catch(() => 0),
      userRepository.countNewSince(thirtyDaysAgo).catch(() => 0),
      userRepository.countDisabled().catch(() => 0),
      userRepository.countByRole("admin").catch(() => 0),
      productRepository.count().catch(() => 0),
      orderRepository.count().catch(() => 0),
      orderRepository.findPending().then((r) => r.length).catch(() => 0),
      reviewRepository.findPending().then((r) => r.length).catch(() => 0),
    ]);

    // Revenue is pre-computed daily by the `revenueRollup` scheduled Firebase
    // Function into analytics/dashboardRollup — a single-doc read here
    // instead of scanning every delivered order on every dashboard load
    // (CLAUDE.md Rule #6). Falls back to 0 until the first rollup run.
    const rollup = await safeRead(
    () => analyticsRollupRepository.getDashboardRollup(),
    {
      route: "/api/admin/dashboard",
      key: "analytics.getDashboardRollup",
      fallback: null,
    },
  );
    const totalRevenue = rollup?.totalRevenue ?? 0;

    return successResponse({
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        newThisMonth: newUsers,
        disabled: disabledUsers,
        admins: adminUsers,
      },
      products: {
        total: totalProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      reviews: {
        pending: pendingReviews,
      },
      revenue: {
        total: totalRevenue,
      },
    });
  },
}));
