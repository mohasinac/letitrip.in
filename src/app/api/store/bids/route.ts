import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { bidRepository, productRepository, storeRepository } from "@mohasinac/appkit";

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId") ?? undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    if (productId) {
      // Verify the product belongs to this store
      const product = await productRepository.findById(productId);
      if (!product || product.storeId !== store.id) {
        return ApiErrors.forbidden("Product does not belong to your store");
      }
      const result = await bidRepository.list({
        filters: `productId==${productId}`,
        sorts: "-bidDate",
        page,
        pageSize,
      });
      return successResponse({ bids: result.items, total: result.total, productId });
    }

    // Get store's auction product IDs (up to 30 for Firestore `in` query limit)
    const auctionResult = await productRepository.list(
      { filters: `storeId==${store.id},listingType==auction`, sorts: "-createdAt", page: 1, pageSize: 30 },
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
      sorts: "-bidDate",
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
