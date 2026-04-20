"use server";

/**
 * Wishlist Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { requireAuthUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError } from "@mohasinac/appkit";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistForUser,
} from "@mohasinac/appkit";
import type { UserWishlistItem } from "@mohasinac/appkit";

export type { UserWishlistItem };
export type EnrichedWishlistItem = UserWishlistItem;

export async function addToWishlistAction(productId: string): Promise<void> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `wishlist:add:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");
  return addToWishlist(user.uid, productId);
}

export async function removeFromWishlistAction(
  productId: string,
): Promise<void> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `wishlist:remove:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");
  return removeFromWishlist(user.uid, productId);
}

export async function getWishlistAction(): Promise<{
  items: UserWishlistItem[];
  meta: { total: number };
}> {
  const user = await requireAuthUser();
  return getWishlistForUser(user.uid);
}

