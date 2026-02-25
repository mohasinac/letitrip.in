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
    setIsLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.remove(productId);
        setInWishlist(false);
      } else {
        await wishlistService.add(productId);
        setInWishlist(true);
      }
    } catch (err) {
      // Re-throw so the caller can handle and display the error
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [productId, inWishlist]);

  return { inWishlist, isLoading, toggle };
}
