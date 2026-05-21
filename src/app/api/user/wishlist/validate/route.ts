import {
  wishlistRepository,
  productRepository,
  ProductStatusValues,
  successResponse,
  createRouteHandler,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;

      const items = await wishlistRepository.getWishlistItems(uid);
      if (items.length === 0) {
        return successResponse({ removedCount: 0, removedProductIds: [] });
      }

      const results = await Promise.allSettled(
        items.map((item) => productRepository.findById(item.productId)),
      );

      const staleProductIds: string[] = [];
      items.forEach((item, i) => {
        const result = results[i];
        if (result.status === "rejected" || result.value === null) {
          // Doc deleted from DB — gone for good.
          staleProductIds.push(item.productId);
          return;
        }
        const { status } = result.value;
        // Only remove truly unpublished listings. Sold/OOS items may come back
        // (restock, relist after auction, pre-order reopened) so we keep them.
        if (
          status === ProductStatusValues.ARCHIVED ||
          status === ProductStatusValues.DRAFT ||
          status === ProductStatusValues.IN_REVIEW
        ) {
          staleProductIds.push(item.productId);
        }
      });

      if (staleProductIds.length > 0) {
        await Promise.allSettled(
          staleProductIds.map((productId) =>
            wishlistRepository.removeItem(uid, productId),
          ),
        );
      }

      return successResponse({
        removedCount: staleProductIds.length,
        removedProductIds: staleProductIds,
      });
    },
  }),
);
