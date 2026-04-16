"use server";

/**
 * Wishlist Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { requireAuth } from "@/lib/firebase/auth-server";
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
  const user = await requireAuth();
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
  const user = await requireAuth();
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
  const user = await requireAuth();
  return getWishlistForUser(user.uid);
}

