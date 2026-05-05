import { withProviders } from "@/providers.config";
/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  userRepository,
  productRepository,
  orderRepository,
  reviewRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
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

    // Sum revenue from delivered orders (capped fetch — avoids scanning full collection for large datasets)
    const deliveredOrders = await orderRepository.findByStatus("delivered").catch(() => []);
    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + (Number((order as any).totalPrice ?? 0) || 0),
      0,
    );

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
