/**
 * Admin Newsletter API Route
 * GET /api/admin/newsletter — List all subscribers with Sieve filtering and stats
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { newsletterRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/admin/newsletter
 *
 * Returns all newsletter subscribers, paginated and filterable via Sieve DSL.
 * Also returns aggregate stats (total, active, unsubscribed, sources).
 *
 * Query params:
 *  - filters  (string) — Sieve filters (e.g. status==active, source==homepage)
 *  - sorts    (string) — Sieve sorts (e.g. -createdAt)
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 50, max 200)
 *
 * Filterable/sortable fields: email, status, source, createdAt, unsubscribedAt
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async ({ request }: { request: NextRequest }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    serverLogger.info("Admin newsletter subscribers list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const [sieveResult, stats] = await Promise.all([
      newsletterRepository.list({ filters, sorts, page, pageSize }),
      newsletterRepository.getStats(),
    ]);

    return successResponse({
      subscribers: sieveResult.items,
      meta: {
        total: sieveResult.total,
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
      stats,
    });
  },
});
