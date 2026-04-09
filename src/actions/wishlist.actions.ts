"use server";

/**
 * Wishlist Server Actions
 *
 * Mutations for the user wishlist that call the repository directly.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { wishlistRepository, productRepository } from "@/repositories";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import type { WishlistItem } from "@/repositories";
import type { ProductDocument } from "@/db/schema";

export interface EnrichedWishlistItem {
  productId: string;
  addedAt: Date;
  product: ProductDocument | null;
}

/**
 * Add a product to the authenticated user's wishlist.
 */
export async function addToWishlistAction(productId: string): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `wishlist:add:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!productId || typeof productId !== "string") {
    throw new ValidationError("productId is required");
  }

  await wishlistRepository.addItem(user.uid, productId);
}

/**
 * Remove a product from the authenticated user's wishlist.
 */
export async function removeFromWishlistAction(
  productId: string,
): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `wishlist:remove:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!productId || typeof productId !== "string") {
    throw new ValidationError("productId is required");
  }

  await wishlistRepository.removeItem(user.uid, productId);
}

/**
 * Get all wishlist items for the authenticated user, enriched with product details.
 */
export async function getWishlistAction(): Promise<{
  items: EnrichedWishlistItem[];
  meta: { total: number };
}> {
  const user = await requireAuth();
  const items = await wishlistRepository.getWishlistItems(user.uid);

  const productResults = await Promise.allSettled(
    items.map((item) => productRepository.findById(item.productId)),
  );

  const enriched: EnrichedWishlistItem[] = items.map((item, i) => {
    const result = productResults[i];
    const product =
      result.status === "fulfilled" ? (result.value ?? null) : null;
    return { ...item, product };
  });

  return { items: enriched, meta: { total: enriched.length } };
}
