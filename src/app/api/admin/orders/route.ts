import "@/providers.config";
/**
 * Admin Orders API Route
 * GET  /api/admin/orders — List all orders with pagination & filtering
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { orderRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

/**
 * GET /api/admin/orders
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==pending)
 *  - sorts    (string)  — Sieve sorts (e.g. -createdAt)
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — results per page (default 50)
 */
export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    serverLogger.info("Admin orders list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const sieveResult = await orderRepository.listAll({
      filters,
      sorts,
      page,
      pageSize,
    });

    return successResponse({
      orders: sieveResult.items,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
      },
    });
  },
});

