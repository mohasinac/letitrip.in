import "@/providers.config";
/**
 * Admin Reviews API Route
 * GET /api/admin/reviews
 */
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { buildSieveFilters } from "@mohasinac/utils";
import { piiBlindIndex } from "@/lib/pii";
import { REVIEW_FIELDS } from "@/db/schema";
import { reviewRepository } from "@/repositories";

export const GET = createApiHandler({
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      200,
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
      buildSieveFilters(["", filters], ["", qFilter]) || undefined;

    // Avoid forcing extra composite indices for exact blind-index lookups.
    const effectiveSorts = q ? undefined : sorts;

    const result = await reviewRepository.listAll({
      filters: effectiveFilters,
      sorts: effectiveSorts,
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
});
