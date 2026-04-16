import "@/providers.config";
/**
 * Admin Payouts API
 *
 * GET /api/admin/payouts — List all payouts (filterable by status)
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit/http";
import { successResponse } from "@mohasinac/appkit/next";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { buildSieveFilters } from "@mohasinac/appkit/utils";
import { payoutRepository } from "@mohasinac/appkit/repositories";
import { piiBlindIndex } from "@mohasinac/appkit/security";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { PAYOUT_FIELDS } from "@/db/schema";

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
    const q = getStringParam(searchParams, "q")?.trim().toLowerCase() || "";

    serverLogger.info("Admin payouts list requested", {
      filters,
      sorts,
      page,
      pageSize,
      q: q ? "[redacted]" : "",
    });

    // Summary counts always use the full unfiltered dataset (1-doc count queries)
    const [
      allResult,
      pendingResult,
      processingResult,
      completedResult,
      failedResult,
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
    ]);

    const summary = {
      total: allResult.total,
      pending: pendingResult.total,
      processing: processingResult.total,
      completed: completedResult.total,
      failed: failedResult.total,
    };

    const qFilter = q
      ? q.includes("@")
        ? `${PAYOUT_FIELDS.SELLER_EMAIL_INDEX}==${piiBlindIndex(q)}`
        : `${PAYOUT_FIELDS.SELLER_NAME}==${q}`
      : undefined;

    const effectiveFilters =
      buildSieveFilters(["", filters], ["", qFilter]) || undefined;

    // Avoid forcing extra composite indices for exact blind-index lookups.
    const effectiveSorts = q ? undefined : sorts;

    const sieveResult = await payoutRepository.list({
      filters: effectiveFilters,
      sorts: effectiveSorts,
      page: String(page),
      pageSize: String(pageSize),
    });

    return successResponse({
      payouts: sieveResult.items,
      summary: {
        ...summary,
        totalAmount: sieveResult.items.reduce((sum, p) => sum + p.amount, 0),
      },
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

