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
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { cartRepository } from "@mohasinac/appkit/features/cart/repository/cart.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { normalizeListingType } from "@mohasinac/appkit/features/products/utils/listing-type";
import { ProductStatusValues } from "@mohasinac/appkit/features/products/schemas/firestore";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { resolveStoreNameForCart } from "@/lib/cart/resolve-store-name";

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

    // Merge each guest item â€” skip products that are unavailable, continue on others.
    // Product lookups are independent reads across (up to 50) distinct product
    // docs, so they're batched in parallel; addItem writes stay sequential
    // because they all read-modify-write the same single cart document.
    let cart = await cartRepository.getOrCreate(user!.uid);

    const products = await Promise.all(
      items.map((item) => productRepository.findById(item.productId)),
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = products[i];
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
        storeId: product.storeId,
        /*
         * 🛑 `product.storeName` is an OPTIONAL denormalised mirror kept in
         * step by the `storeNameBackfill` job, so `?? ""` writes an EMPTY name
         * whenever that mirror has not caught up — measured 2026-10-21: 1 of
         * 14 live products has it unset.
         *
         * The emptiness then outlives the cart. Checkout does not re-resolve;
         * it reads this very snapshot (`firstItem.storeName || firstItem.storeId`),
         * so a blank here is what makes the checkout seller heading fall back
         * to a raw `store-…` slug. Hydrate from the canonical store doc, the
         * way `POST /api/cart` already does.
         */
        storeName: await resolveStoreNameForCart(product.storeName, product.storeId),
        listingType: normalizeListingType(product),
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
