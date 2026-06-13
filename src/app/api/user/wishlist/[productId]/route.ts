import { withProviders } from "@/providers.config";
import {
  removeFromWishlist,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
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
