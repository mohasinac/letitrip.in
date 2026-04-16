import "@/providers.config";
/**
 * Seller Offers API Route
 * GET /api/seller/offers — Returns all incoming offers for the authenticated seller
 */
import { createApiHandler } from "@mohasinac/appkit/http";
import { successResponse } from "@mohasinac/appkit/next";
import { offerRepository } from "@mohasinac/appkit/repositories";

export const GET = createApiHandler({
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
    );
    const sorts =
      url.searchParams.get("sorts") ??
      url.searchParams.get("sort") ??
      "-createdAt";

    const filterParts: string[] = [];
    const status = url.searchParams.get("status");
    if (status && status !== "all") filterParts.push(`status==${status}`);
    const extraFilters = url.searchParams.get("filters");
    if (extraFilters) filterParts.push(extraFilters);

    const result = await offerRepository.findBySeller(user!.uid, {
      filters: filterParts.join(",") || undefined,
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

