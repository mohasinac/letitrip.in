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

import { orderRepository } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/server";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/server";
import type { OrderStatus } from "@mohasinac/appkit/server";
import { OrderStatusValues } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";

const VALID_STATUSES: OrderStatus[] = [
  OrderStatusValues.PENDING,
  OrderStatusValues.CONFIRMED,
  OrderStatusValues.SHIPPED,
  OrderStatusValues.DELIVERED,
  OrderStatusValues.CANCELLED,
  OrderStatusValues.RETURNED,
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
    const filters =
      statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
        ? `status==${statusParam}`
        : undefined;
    const result = await orderRepository.listForUser(user!.uid, {
      filters,
      sorts: "-orderDate",
      page: "1",
      pageSize: "5000",
    });
    const orders = result.items;

    serverLogger.info("Orders listed", {
      userId: user!.uid,
      count: result.total,
    });

    return successResponse({
      orders,
      total: result.total,
    });
  },
});

