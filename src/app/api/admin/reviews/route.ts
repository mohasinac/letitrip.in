import "@/providers.config";
/**
 * Admin Reviews API Route
 * GET /api/admin/reviews
 */
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
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
    const result = await reviewRepository.listAll({
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
});
