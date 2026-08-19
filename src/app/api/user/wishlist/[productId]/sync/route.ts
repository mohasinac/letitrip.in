import {
  wishlistRepository,
  productRepository,
  ProductStatusValues,
  successResponse,
  errorResponse,
  createRouteHandler,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const uid = user!.uid;
      const productId = (params as { productId: string }).productId;

      const items = await wishlistRepository.getWishlistItems(uid);
      const item = items.find((i) => i.productId === productId);
      if (!item) {
        return errorResponse("Item not in wishlist", 404, "NOT_FOUND");
      }

      const product = await productRepository.findById(productId).catch(() => null);
      const isGone =
        !product ||
        product.status === ProductStatusValues.ARCHIVED ||
        product.status === ProductStatusValues.DRAFT ||
        product.status === ProductStatusValues.IN_REVIEW;

      if (isGone) {
        await wishlistRepository.removeItem(uid, productId);
        return successResponse({ removed: true });
      }

      const snapshot = {
        title: product.title,
        thumb: product.images?.[0],
        currentPrice: product.price,
      };
      await wishlistRepository.syncSnapshots(uid, [{ productId, snapshot }]);
      return successResponse({ removed: false, snapshot });
    },
  }),
);
