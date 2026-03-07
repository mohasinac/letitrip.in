"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGuestCartItems,
  addToGuestCart,
  clearGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
} from "@/utils";
import type { GuestCartItem } from "@/utils";

/**
 * useGuestCart
 *
 * React state wrapper around the guest cart stored in localStorage.
 * Hydrates from localStorage after mount (safe for SSR).
 *
 * @example
 * const { items, count, add, clear } = useGuestCart();
 */
export function useGuestCart() {
  const [items, setItems] = useState<GuestCartItem[]>([]);

  // Hydrate from localStorage on client-side mount only
  useEffect(() => {
    setItems(getGuestCartItems());
  }, []);

  const add = useCallback(
    (
      productId: string,
      quantity: number,
      snapshot?: {
        productTitle?: string;
        productImage?: string;
        price?: number;
      },
    ) => {
      const updated = addToGuestCart(productId, quantity, snapshot);
      setItems(updated);
    },
    [],
  );

  const remove = useCallback((productId: string) => {
    const updated = removeFromGuestCart(productId);
    setItems(updated);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const updated = updateGuestCartQuantity(productId, quantity);
    setItems(updated);
  }, []);

  const clear = useCallback(() => {
    clearGuestCart();
    setItems([]);
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, add, remove, updateQuantity, clear };
}
