import { withProviders } from "@/providers.config";
/**
 * Seller Offers API Route
 * GET /api/store/offers — Returns all incoming offers for the authenticated seller
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { offerRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createApiHandler({
  roles: [...ROLES_STORE_READ],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
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

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) {
      return successResponse({ items: [], total: 0, page, pageSize, totalPages: 0, hasMore: false });
    }
    const result = await offerRepository.findByStore(store.id, {
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
}));

