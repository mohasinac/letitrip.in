import { withProviders } from "@/providers.config";
/**
 * Public Coupons List API
 * GET /api/coupons — Returns paginated active coupons with Sieve filtering.
 *
 * No auth required. Always enforces validity.isActive==true.
 * Query params: page, pageSize, sorts, filters (Sieve)
 */

import { createRouteHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { couponsRepository } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 12),
      );
      const sorts =
        url.searchParams.get("sorts") ??
        url.searchParams.get("sort") ??
        "-createdAt";

      // Merge caller-supplied filters with the mandatory active guard
      const extraFilters = url.searchParams.get("filters") ?? "";
      const filters = extraFilters
        ? `validity.isActive==true,${extraFilters}`
        : "validity.isActive==true";

      const result = await couponsRepository.list({
        filters,
        sorts,
        page,
        pageSize,
      });

      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);
