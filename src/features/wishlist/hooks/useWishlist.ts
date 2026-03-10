"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistService } from "@/services";
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
 * Wraps `wishlistService.list()` for the wishlist page.
 * Pass `enabled: false` when the user is not authenticated.
 */
export function useWishlist(enabled = true) {
  return useQuery<WishlistResponse>({
    queryKey: ["user", "wishlist"],
    queryFn: () => wishlistService.list(),
    enabled,
  });
}
