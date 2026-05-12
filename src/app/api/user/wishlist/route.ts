import { withProviders } from "@/providers.config";
/**
 * User Wishlist API — Collection
 *
 * GET  /api/user/wishlist — List current user's wishlist items (with product details)
 * POST /api/user/wishlist — Add a product to the wishlist (capped at WISHLIST_MAX)
 */

import { wishlistRepository } from "@mohasinac/appkit";
import {
  productRepository,
  normalizeListingType,
} from "@mohasinac/appkit";
import { WishlistFullError } from "@mohasinac/appkit";
import { WISHLIST_MAX } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
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
      meta: {
        total: enriched.length,
        limit: WISHLIST_MAX,
        isFull: enriched.length >= WISHLIST_MAX,
      },
    });
  },
}));

/**
 * POST /api/user/wishlist
 *
 * Body: { productId: string }
 * Adds a product to the user's wishlist. Idempotent on re-add of an existing item.
 * Returns 409 WISHLIST_FULL when the user has WISHLIST_MAX (20) items and the product
 * is not already in their wishlist.
 */
export const POST = withProviders(createRouteHandler<(typeof addSchema)["_output"]>({
  auth: true,
  schema: addSchema,
  handler: async ({ user, body }) => {
    const { productId } = body!;

    const product = await productRepository.findById(productId);
    if (!product) {
      return errorResponse(ERROR_MESSAGES.PRODUCT.NOT_FOUND, 404);
    }

    // SB1-G — canonical listingType drives the snapshot's `productType` tag.
    const lt = normalizeListingType(
      product as {
        listingType?: "standard" | "auction" | "pre-order" | "prize-draw" | "bundle";
        isAuction?: boolean;
        isPreOrder?: boolean;
      },
    );
    const productType: "product" | "auction" | "preorder" =
      lt === "auction" ? "auction" : lt === "pre-order" ? "preorder" : "product";

    const snapshot = {
      title: (product as { title?: string }).title,
      thumb: (product as { images?: string[] }).images?.[0],
      currentPrice: (product as { price?: number }).price,
    };

    try {
      const count = await wishlistRepository.addItem(user!.uid, productId, {
        productType,
        priceAtAdd: snapshot.currentPrice,
        productSnapshot: snapshot,
      });
      return successResponse(
        { productId, count, limit: WISHLIST_MAX, isFull: count >= WISHLIST_MAX },
        SUCCESS_MESSAGES.WISHLIST.ADDED,
        201,
      );
    } catch (e) {
      if (e instanceof WishlistFullError) {
        return errorResponse(
          `Wishlist full (${e.current}/${e.limit}). Remove an item to add new ones.`,
          409,
          { code: "WISHLIST_FULL", limit: e.limit, current: e.current },
        );
      }
      throw e;
    }
  },
}));
