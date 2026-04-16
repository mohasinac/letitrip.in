"use client";

import { addToWishlistAction, removeFromWishlistAction } from "@/actions";
import {
  useWishlistToggle as useAppkitWishlistToggle,
  type UseWishlistToggleReturn,
} from "@mohasinac/appkit/features/wishlist";

/**
 * useWishlistToggle
 * Manages wishlist add/remove for a single product.
 * Tracks the in-wishlist state locally (optimistic).
 *
 * Uses Server Actions — bypasses the HTTP service layer for lower latency.
 *
 * @param productId      - The product to watch
 * @param initial        - Whether the product is already in the wishlist
 *
 * @example
 * const { inWishlist, isLoading, toggle } = useWishlistToggle(productId, initialInWishlist);
 */
export function useWishlistToggle(
  productId: string,
  initial = false,
): UseWishlistToggleReturn {
  return useAppkitWishlistToggle(productId, initial, {
    addToWishlist: addToWishlistAction,
    removeFromWishlist: removeFromWishlistAction,
  });
}

