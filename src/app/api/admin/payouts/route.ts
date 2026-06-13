import { withProviders } from "@/providers.config";
/**
 * Admin Payouts API
 *
 * GET /api/admin/payouts — List all payouts (filterable by status)
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { buildSieveFilters } from "@mohasinac/appkit";
import { payoutRepository } from "@mohasinac/appkit";
import { piiBlindIndex } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { PAYOUT_FIELDS, sortBy, sieveFilter, SIEVE_OP, PayoutStatusValues, COMMON_FIELDS } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

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
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:payouts:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
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
      payoutRepository.list({ sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"), page: "1", pageSize: "1" }),
      payoutRepository.list({
        filters: sieveFilter(PAYOUT_FIELDS.STATUS, SIEVE_OP.EQ, PayoutStatusValues.PENDING),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters: sieveFilter(PAYOUT_FIELDS.STATUS, SIEVE_OP.EQ, PayoutStatusValues.PROCESSING),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters: sieveFilter(PAYOUT_FIELDS.STATUS, SIEVE_OP.EQ, PayoutStatusValues.COMPLETED),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
        page: "1",
        pageSize: "1",
      }),
      payoutRepository.list({
        filters: sieveFilter(PAYOUT_FIELDS.STATUS, SIEVE_OP.EQ, PayoutStatusValues.FAILED),
        sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
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
}));

