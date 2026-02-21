/**
 * Admin Reviews API Route
 * GET /api/admin/reviews — List ALL reviews with Sieve filtering, sorting, and pagination
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { reviewRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/admin/reviews
 *
 * Returns all reviews across all products, paginated and filterable via the
 * Sieve DSL. Unlike the public GET /api/reviews (which requires a productId),
 * this endpoint is admin-only and operates on the full review dataset.
 *
 * Query params:
 *  - filters  (string)  — Sieve filters (e.g. status==pending, rating>=4)
 *  - sorts    (string)  — Sieve sorts (e.g. -createdAt)
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — results per page (default 50, max 200)
 *
 * Filterable / sortable fields:
 *  id, productId, productTitle, userId, userName, userEmail,
 *  status, rating, verified, helpfulCount, createdAt
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

    serverLogger.info("Admin reviews list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const sieveResult = await reviewRepository.listAll({
      filters,
      sorts,
      page,
      pageSize,
    });

    return successResponse({
      reviews: sieveResult.items,
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
