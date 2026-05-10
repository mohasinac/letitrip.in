import {
  wishlistRepository,
  productRepository,
  successResponse,
  createRouteHandler,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;

      // Get all wishlist items for this user
      const items = await wishlistRepository.getWishlistItems(uid);
      if (items.length === 0) {
        return successResponse({ removedCount: 0, removedProductIds: [] });
      }

      // Check each product in parallel
      const results = await Promise.allSettled(
        items.map((item) => productRepository.findById(item.productId)),
      );

      const staleProductIds: string[] = [];
      items.forEach((item, i) => {
        const result = results[i];
        if (result.status === "rejected" || result.value === null) {
          staleProductIds.push(item.productId);
        }
      });

      // Remove stale items from wishlist subcollection
      if (staleProductIds.length > 0) {
        await Promise.allSettled(
          staleProductIds.map((productId) => wishlistRepository.removeItem(uid, productId)),
        );
      }

      return successResponse({
        removedCount: staleProductIds.length,
        removedProductIds: staleProductIds,
      });
    },
  }),
);
