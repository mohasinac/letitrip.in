import "@/providers.config";
/**
 * Admin Payouts API
 *
 * GET /api/admin/payouts — List all payouts (filterable by status)
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
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

    serverLogger.info("Admin payouts list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    // Compute summary counts + paginated results in parallel (Rule 8 — no findAll())
    const [
      allResult,
      pendingResult,
      processingResult,
      completedResult,
      failedResult,
      sieveResult,
    ] = await Promise.all([
      payoutRepository.list({ sorts: "createdAt", page: "1", pageSize: "1" }),
      payoutRepository.list({
        filters: "status==pending",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters: "status==processing",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters: "status==completed",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters: "status==failed",
        sorts: "createdAt",
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      }),
    ]);

    // Summary always computed from full dataset regardless of active filter
    const summary = {
      total: allResult.total,
      pending: pendingResult.total,
      processing: processingResult.total,
      completed: completedResult.total,
      failed: failedResult.total,
      totalAmount: sieveResult.items.reduce((sum, p) => sum + p.amount, 0),
    };

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
