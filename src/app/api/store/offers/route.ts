import { withProviders } from "@/providers.config";
/**
 * Seller Offers API Route
 * GET /api/store/offers â€” Returns all incoming offers for the authenticated seller
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { offerRepository, storeRepository, maskOfferForSeller } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";

export const GET = withProviders(createApiHandler({
  roles: [...ROLES_STORE_READ],
    permission: "store:api:read",
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

    // The sibling server action (`listSellerOffers`) already masks; this route
    // did not, so the seller's own list leaked every buyer's full name and
    // email. Same helper, same guarantee, both read paths.
    return successResponse({
      items: result.items.map(maskOfferForSeller),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  },
}));
