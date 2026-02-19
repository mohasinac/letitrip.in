/**
 * Admin Orders API Route
 * GET  /api/admin/orders — List all orders with pagination & filtering
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { orderRepository } from "@/repositories";
import { applySieveToArray } from "@/helpers";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/admin/orders
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==pending)
 *  - sorts    (string)  — Sieve sorts (e.g. -createdAt)
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — results per page (default 50)
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
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

    const allOrders = await orderRepository.findAll();

    const sieveResult = await applySieveToArray({
      items: allOrders,
      model: { filters, sorts, page, pageSize },
      fields: {
        id: { canFilter: true, canSort: false },
        userId: { canFilter: true, canSort: false },
        userName: { canFilter: true, canSort: true },
        userEmail: { canFilter: true, canSort: true },
        productId: { canFilter: true, canSort: false },
        productTitle: { canFilter: true, canSort: true },
        status: { canFilter: true, canSort: true },
        paymentStatus: { canFilter: true, canSort: true },
        paymentMethod: { canFilter: true, canSort: true },
        totalPrice: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => Number(v),
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
        },
      },
      options: {
        defaultPageSize: 50,
        maxPageSize: 200,
      },
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
