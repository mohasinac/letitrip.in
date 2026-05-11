"use server";

/**
 * Wishlist Server Actions â€” thin entrypoint
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
  WishlistFullError,
  WISHLIST_MAX,
} from "@mohasinac/appkit";
import type { UserWishlistItem } from "@mohasinac/appkit";

export type EnrichedWishlistItem = UserWishlistItem;

export async function addToWishlistAction(
  productId: string,
): Promise<
  | { ok: true; count: number; limit: number; isFull: boolean }
  | { ok: false; code: "WISHLIST_FULL"; limit: number; current: number }
> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `wishlist:add:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");
  try {
    const { count } = await addToWishlist(user.uid, productId);
    return {
      ok: true,
      count,
      limit: WISHLIST_MAX,
      isFull: count >= WISHLIST_MAX,
    };
  } catch (e) {
    if (e instanceof WishlistFullError) {
      return {
        ok: false,
        code: "WISHLIST_FULL",
        limit: e.limit,
        current: e.current,
      };
    }
    throw e;
  }
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

