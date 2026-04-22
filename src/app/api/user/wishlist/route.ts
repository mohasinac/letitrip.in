import { withProviders } from "@/providers.config";
/**
 * User Wishlist API — Collection
 *
 * GET  /api/user/wishlist — List current user's wishlist items (with product details)
 * POST /api/user/wishlist — Add a product to the wishlist
 */

import { wishlistRepository } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { z } from "zod";

const addSchema = z.object({
  productId: z.string().min(1),
});

/**
 * GET /api/user/wishlist
 *
 * Returns wishlist items with product details for the authenticated user.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const items = await wishlistRepository.getWishlistItems(user!.uid);

    // Fetch product details for each wishlist item
    const productResults = await Promise.allSettled(
      items.map((item) => productRepository.findById(item.productId)),
    );

    const enriched = items
      .map((item, i) => {
        const result = productResults[i];
        const product = result.status === "fulfilled" ? result.value : null;
        return { ...item, product };
      })
      .filter((item) => item.product !== null);

    return successResponse({
      items: enriched,
      meta: { total: enriched.length },
    });
  },
}));

/**
 * POST /api/user/wishlist
 *
 * Body: { productId: string }
 * Adds a product to the user's wishlist (idempotent).
 */
export const POST = withProviders(createRouteHandler<(typeof addSchema)["_output"]>({
  auth: true,
  schema: addSchema,
  handler: async ({ user, body }) => {
    const { productId } = body!;

    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      return errorResponse(ERROR_MESSAGES.PRODUCT.NOT_FOUND, 404);
    }

    await wishlistRepository.addItem(user!.uid, productId);

    return successResponse({ productId }, SUCCESS_MESSAGES.WISHLIST.ADDED, 201);
  },
}));

