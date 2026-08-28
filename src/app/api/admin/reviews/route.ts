import { withProviders } from "@/providers.config";
import { SORT_DROPPED_FOR_EXACT_SEARCH, withDegraded } from "@mohasinac/appkit";
/**
 * Admin Reviews API Route
 * GET /api/admin/reviews
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { piiBlindIndex } from "@mohasinac/appkit/server";
import {
  REVIEW_FIELDS,
  ROLES_ADMIN_MOD,
} from "@/constants";
import { reviewRepository } from "@mohasinac/appkit";

export const GET = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:reviews:read",
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
    );
    const filters = url.searchParams.get("filters") ?? undefined;
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";
    const q = url.searchParams.get("q")?.trim() || "";

    const qFilter = q
      ? `${REVIEW_FIELDS.USER_NAME_INDEX}==${piiBlindIndex(q)}`
      : undefined;
    const effectiveFilters =
      [filters, qFilter].filter(Boolean).join(",") || undefined;

    // The sort is genuinely unavailable here: `q` resolves through an HMAC
    // blind index or an exact name match, and preserving the caller's sort
    // across these three endpoints was MEASURED at 14 more composite indexes
    // — to order a set an exact email match bounds at one row. Dropping it is
    // the right trade. Dropping it silently was not: the sort dropdown went on
    // displaying "Oldest" over unsorted rows, so the compromise now travels on
    // the response.
    const effectiveSorts = q ? undefined : sorts;
    const degraded = q ? [SORT_DROPPED_FOR_EXACT_SEARCH] : [];

    const result = await reviewRepository.listAll({
      filters: effectiveFilters,
      sorts: effectiveSorts,
      page,
      pageSize,
    });
    return successResponse(withDegraded({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    }, degraded));
  },
}));
