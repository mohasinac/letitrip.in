import { withProviders } from "@/providers.config";
import { removeFromWishlist } from "@mohasinac/appkit/features/wishlist/actions/wishlist-actions";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const productId = (params as { productId: string }).productId;
      await removeFromWishlist(user!.uid, productId);
      return successResponse(null, "Removed from wishlist");
    },
  }),
);