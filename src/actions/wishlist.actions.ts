"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
import { requireAuthUser, normalizeError } from "@mohasinac/appkit";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit";
import { AuthorizationError } from "@mohasinac/appkit";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistForUser,
  WishlistFullError,
  WISHLIST_MAX,
  addItemToCart,
  productRepository,
} from "@mohasinac/appkit";
import type { UserWishlistItem } from "@mohasinac/appkit";

const RATE_LIMIT_MSG = "Too many requests. Please slow down.";

export type EnrichedWishlistItem = UserWishlistItem;

export async function addToWishlistAction(
  productId: string,
): Promise<ActionResult<| { ok: true; count: number; limit: number; isFull: boolean }
  | { ok: false; code: "WISHLIST_FULL"; limit: number; current: number }>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
    const rl = await rateLimitByIdentifier(
      `wishlist:add:${user.uid}`,
      RateLimitPresets.API,
    );
    if (!rl.success)
      throw new AuthorizationError(RATE_LIMIT_MSG);
    try {
      const { count } = await addToWishlist(user.uid, productId);
      return {
        ok: true,
        count,
        limit: WISHLIST_MAX,
        isFull: count >= WISHLIST_MAX,
      };
    } catch (e: unknown) {
      void normalizeError(e);
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
  });
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
    throw new AuthorizationError(RATE_LIMIT_MSG);
  return removeFromWishlist(user.uid, productId);
}

export async function getWishlistAction(): Promise<ActionResult<{
  items: UserWishlistItem[];
  meta: { total: number };
}>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
    return getWishlistForUser(user.uid);
  });
}

export async function addWishlistItemToCartAction(
  productId: string,
): Promise<ActionResult<{ success: boolean }>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
    const rl = await rateLimitByIdentifier(`cart:add:${user.uid}`, RateLimitPresets.API);
    if (!rl.success) throw new AuthorizationError(RATE_LIMIT_MSG);

    const product = await productRepository.findById(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);

    await addItemToCart(user.uid, {
      productId,
      productTitle: product.title,
      productImage: product.mainImage ?? product.images?.[0] ?? "",
      price: product.price,
      currency: product.currency,
      quantity: 1,
      storeId: product.storeId,
      storeName: product.storeName ?? "",
      listingType: product.listingType ?? "standard",
    });
    return { success: true };
  });
}
