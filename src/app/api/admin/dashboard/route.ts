/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  userRepository,
  productRepository,
  orderRepository,
} from "@/repositories";

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Parallel execution of all count queries for speed
    const [
      totalUsers,
      activeUsers,
      newUsers,
      disabledUsers,
      adminUsers,
      totalProducts,
      totalOrders,
    ] = await Promise.all([
      userRepository.count().catch(() => 0),
      userRepository.countActive().catch(() => 0),
      userRepository.countNewSince(thirtyDaysAgo).catch(() => 0),
      userRepository.countDisabled().catch(() => 0),
      userRepository.countByRole("admin").catch(() => 0),
      productRepository.count().catch(() => 0),
      orderRepository.count().catch(() => 0),
    ]);

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
      },
    });
  },
});
