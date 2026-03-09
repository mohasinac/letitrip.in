"use server";

/**
 * Wishlist Server Actions
 *
 * Mutations for the user wishlist that call the repository directly.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
import { wishlistRepository } from "@/repositories";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";
import type { WishlistItem } from "@/repositories";

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
 * Get all wishlist items for the authenticated user.
 * Prefer the API route + useQuery pattern for reads; use this only in RSC.
 */
export async function getWishlistAction(): Promise<WishlistItem[]> {
  const user = await requireAuth();
  return wishlistRepository.getWishlistItems(user.uid);
}
