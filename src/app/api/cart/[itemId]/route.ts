import { withProviders } from "@/providers.config";
/**
 * POST /api/cart/merge
 *
 * Merges guest cart items (sent from the client's localStorage) into the
 * authenticated user's Firestore cart.
 *
 * Called automatically by `useGuestCartMerge` immediately after login.
 * Skips any products that no longer exist or are unavailable.
 */

import { z } from "zod";
import { handleApiError } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { cartRepository } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import { ProductStatusValues } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";

const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50), // Reasonable cap to prevent abuse
});

export const POST = withProviders(createRouteHandler<(typeof mergeCartSchema)["_output"]>({
  auth: true,
  schema: mergeCartSchema,
  handler: async ({ user, body }) => {
    const { items } = body!;

    // Merge each guest item â€” skip products that are unavailable, continue on others
    let cart = await cartRepository.getOrCreate(user!.uid);

    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.status !== ProductStatusValues.PUBLISHED) continue;
      if (product.availableQuantity < 1) continue;

      const safeQty = Math.min(item.quantity, product.availableQuantity);

      cart = await cartRepository.addItem(user!.uid, {
        productId: product.id,
        productTitle: product.title,
        productImage: product.mainImage,
        price: product.price,
        currency: product.currency,
        quantity: safeQty,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        isAuction: product.isAuction ?? false,
      });
    }

    serverLogger.info("Guest cart merged", {
      uid: user!.uid,
      requested: items.length,
    });

    return successResponse({
      cart,
      itemCount: cartRepository.getItemCount(cart),
      subtotal: cartRepository.getSubtotal(cart),
    });
  },
}));
