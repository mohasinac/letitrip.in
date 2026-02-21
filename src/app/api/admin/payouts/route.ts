/**
 * Admin Payouts API
 *
 * GET /api/admin/payouts — List all payouts (filterable by status)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { payoutRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/admin/payouts
 *
 * Query params:
 *  - filters  (string) — Sieve filters (e.g. status==pending)
 *  - sorts    (string) — Sieve sorts (e.g. -createdAt)
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 50, max 200)
 *
 * summary stats are always computed from the full unfiltered dataset.
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

    serverLogger.info("Admin payouts list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const allPayouts = await payoutRepository.findAll();

    // Summary always computed from the full dataset regardless of active filter
    const summary = {
      total: allPayouts.length,
      pending: allPayouts.filter((p) => p.status === "pending").length,
      processing: allPayouts.filter((p) => p.status === "processing").length,
      completed: allPayouts.filter((p) => p.status === "completed").length,
      failed: allPayouts.filter((p) => p.status === "failed").length,
      totalAmount: allPayouts.reduce((sum, p) => sum + p.amount, 0),
    };

    const sieveResult = await payoutRepository.list({
      filters,
      sorts,
      page,
      pageSize,
    });

    return successResponse({
      payouts: sieveResult.items,
      summary,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  },
});
