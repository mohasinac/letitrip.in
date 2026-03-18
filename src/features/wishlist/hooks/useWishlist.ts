"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";
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
  return useQuery<WishlistResponse>({
    queryKey: ["user", "wishlist"],
    queryFn: () =>
      apiClient.get<WishlistResponse>(API_ENDPOINTS.USER.WISHLIST.LIST),
    enabled,
  });
}
