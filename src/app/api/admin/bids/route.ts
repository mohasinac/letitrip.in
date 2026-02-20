/**
 * Admin Bids API Route
 * GET  /api/admin/bids — List all bids with pagination, filtering & sorting
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { bidRepository } from "@/repositories";
import { applySieveToArray } from "@/helpers";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/admin/bids
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==active, productId==xyz)
 *  - sorts    (string)  — Sieve sorts (e.g. -bidDate)
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
    const sorts = getStringParam(searchParams, "sorts") || "-bidDate";

    serverLogger.info("Admin bids list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const allBids = await bidRepository.findAll();

    const sieveResult = await applySieveToArray({
      items: allBids,
      model: { filters, sorts, page, pageSize },
      fields: {
        id: { canFilter: true, canSort: false },
        productId: { canFilter: true, canSort: false },
        productTitle: { canFilter: true, canSort: true },
        userId: { canFilter: true, canSort: false },
        userName: { canFilter: true, canSort: true },
        userEmail: { canFilter: true, canSort: true },
        bidAmount: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => Number(v),
        },
        status: { canFilter: true, canSort: true },
        isWinning: {
          canFilter: true,
          canSort: false,
          parseValue: (v: string) => v === "true",
        },
        bidDate: {
          canFilter: true,
          canSort: true,
          parseValue: (v: string) => new Date(v),
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
      bids: sieveResult.items,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
      },
    });
  },
});
