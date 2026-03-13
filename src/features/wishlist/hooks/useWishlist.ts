"use client";

import { useQuery } from "@tanstack/react-query";
import { getWishlistAction } from "@/actions";
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
 * Fetches the wishlist (with product details) via Server Action (2-hop).
 * Pass `enabled: false` when the user is not authenticated.
 */
export function useWishlist(enabled = true) {
  return useQuery<WishlistResponse>({
    queryKey: ["user", "wishlist"],
    queryFn: async () => {
      const result = await getWishlistAction();
      return result as unknown as WishlistResponse;
    },
    enabled,
  });
}
