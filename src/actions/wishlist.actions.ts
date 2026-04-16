"use server";

/**
 * Wishlist Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError } from "@mohasinac/appkit/errors";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistForUser,
} from "@mohasinac/appkit/features/wishlist";
import type { EnrichedWishlistItem } from "@mohasinac/appkit/features/wishlist";

export type { EnrichedWishlistItem };

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
  items: EnrichedWishlistItem[];
  meta: { total: number };
}> {
  const user = await requireAuthUser();
  return getWishlistForUser(user.uid);
}

