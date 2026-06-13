import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, ApiErrors, sortBy, sieveFilter, sieveAnd, SIEVE_OP, BID_FIELDS, PRODUCT_FIELDS, COMMON_FIELDS } from "@mohasinac/appkit";
import { bidRepository, productRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId") ?? undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    if (productId) {
      // Verify the product belongs to this store
      const product = await productRepository.findById(productId);
      if (!product || product.storeId !== store.id) {
        return ApiErrors.forbidden("Product does not belong to your store");
      }
      const result = await bidRepository.list({
        filters: sieveFilter(BID_FIELDS.PRODUCT_ID, SIEVE_OP.EQ, productId),
        sorts: sortBy(BID_FIELDS.BID_DATE),
        page,
        pageSize,
      });
      return successResponse({ bids: result.items, total: result.total, productId });
    }

    // Get store's auction product IDs (up to 30 for Firestore `in` query limit)
    const auctionResult = await productRepository.list(
      { filters: sieveAnd(sieveFilter(PRODUCT_FIELDS.STORE_ID, SIEVE_OP.EQ, store.id), sieveFilter(PRODUCT_FIELDS.LISTING_TYPE, SIEVE_OP.EQ, "auction")), sorts: sortBy(COMMON_FIELDS.CREATED_AT), page: 1, pageSize: 30 },
      { storeId: store.id },
    );

    if (auctionResult.items.length === 0) {
      return successResponse({ bids: [], total: 0, auctions: [] });
    }

    const productIds = auctionResult.items.map((p) => p.id);
    const auctionSummary = auctionResult.items.map((p) => ({
      id: p.id,
      title: p.title ?? p.id,
    }));

    const result = await bidRepository.list({
      filters: productIds.map((id) => `productId==${id}`).join("|"),
      sorts: sortBy(BID_FIELDS.BID_DATE),
      page,
      pageSize,
    });

    return successResponse({
      bids: result.items,
      total: result.total,
      auctions: auctionSummary,
    });
  },
}));
