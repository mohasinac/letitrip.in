"use client";

import { useUserWishlist } from "@mohasinac/feat-wishlist";
import type { ProductDocument } from "@/db/schema";

export interface WishlistItem {
  productId: string;
  addedAt: string;
  product: ProductDocument | null;
}

export interface WishlistResponse {
  items: WishlistItem[];
  meta: { total: number };
}

/**
 * useWishlist
 * Fetches the wishlist (with product details) via GET /api/user/wishlist.
 * Pass `enabled: false` when the user is not authenticated.
 */
export function useWishlist(enabled = true) {
  return useUserWishlist<ProductDocument>({
    enabled,
    endpoint: "/api/user/wishlist",
    queryKey: ["user", "wishlist"],
  });
}
