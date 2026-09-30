import { withProviders } from "@/providers.config";
/**
 * Seller Offers API Route
 * GET /api/store/offers â€” Returns all incoming offers for the authenticated seller
 */
import { createApiHandler } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { offerRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";
import { offerDocumentToOffer } from "@mohasinac/appkit/server";

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

    // `searchTxt` is an `array-contains` clause, which Sieve cannot express —
    // so it travels alongside `filters`, not inside it.
    const search = url.searchParams.get("q")?.trim() || undefined;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) {
      return successResponse({ items: [], total: 0, page, pageSize, totalPages: 0, hasMore: false });
    }
    const result = await offerRepository.findByStore(store.id, {
      filters: filterParts.join(",") || undefined,
      sorts,
      page,
      pageSize,
    }, { search });

    /*
     * 🛑 `buyerIdentity: "masked"` — ONE mechanism, not two.
     *
     * This was `offerDocumentToOffer(maskOfferForSeller(o))` with the old
     * `includeBuyerIdentity` flag left off, and the two halves cancelled: the
     * mask produced "M*** U***" and the adapter then dropped the key, so all
     * 13 rows here rendered "Unknown buyer" and the seller could not tell two
     * offers on one listing apart. The masking now lives inside the adapter,
     * so there is no longer a way to apply half of it.
     *
     * The seller sees a masked name on purpose: enough to distinguish two
     * buyers and to address them, not enough to contact them off-platform.
     */
    return successResponse({
      items: result.items.map((o) => offerDocumentToOffer(o, { buyerIdentity: "masked" })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  },
}));
