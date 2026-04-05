import "@/providers.config";
/**
 * User Orders API — Collection
 *
 * GET /api/user/orders — List the authenticated user's orders
 *
 * Supports optional status filter via `?status=pending|confirmed|shipped|...`
 * Returns orders ordered by date descending.
 *
 * Note: Order creation is intentionally omitted here — orders are created
 * server-side when a checkout session is completed (future payment integration).
 */

import { orderRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createRouteHandler } from "@mohasinac/next";
import { getSearchParams, getStringParam } from "@/lib/api/request-helpers";
import type { OrderStatus } from "@/db/schema";
import { serverLogger } from "@/lib/server-logger";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

/**
 * GET /api/user/orders
 *
 * Returns all orders for the authenticated user.
 * Optional query param: ?status=<OrderStatus>
 */
export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user, request }) => {
    const searchParams = getSearchParams(request);
    const statusParam = getStringParam(searchParams, "status");

    let orders;

    if (statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)) {
      // Filter by status within this user's orders
      const allOrders = await orderRepository.findByUser(user!.uid);
      orders = allOrders.filter((o) => o.status === statusParam);
    } else {
      orders = await orderRepository.findByUser(user!.uid);
    }

    // Sort by orderDate desc (Firestore index not guaranteed here)
    orders.sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );

    serverLogger.info("Orders listed", {
      userId: user!.uid,
      count: orders.length,
    });

    return successResponse({
      orders,
      total: orders.length,
    });
  },
});
