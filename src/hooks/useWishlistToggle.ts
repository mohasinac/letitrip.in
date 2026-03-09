"use client";

import { useState, useCallback } from "react";
import { wishlistService } from "@/services";

/**
 * useWishlistToggle
 * Manages wishlist add/remove for a single product.
 * Tracks the in-wishlist state locally (optimistic).
 *
 * @param productId      - The product to watch
 * @param initial        - Whether the product is already in the wishlist
 *
 * @example
 * const { inWishlist, isLoading, toggle } = useWishlistToggle(productId, initialInWishlist);
 */
export function useWishlistToggle(productId: string, initial = false) {
  const [inWishlist, setInWishlist] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(async () => {
    const prev = inWishlist;
    setInWishlist(!inWishlist);
    setIsLoading(true);
    try {
      if (prev) {
        await wishlistService.remove(productId);
      } else {
        await wishlistService.add(productId);
      }
    } catch (err) {
      // Rollback optimistic state so the UI isn't stuck
      setInWishlist(prev);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [productId, inWishlist]);

  return { inWishlist, isLoading, toggle };
}
