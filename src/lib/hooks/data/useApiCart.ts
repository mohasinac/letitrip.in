/**
 * API-based Cart Hook
 * Replaces useFirebase.ts cart functionality with API service calls
 */

import { useState, useEffect, useCallback } from "react";
import { CartService, CartData } from "@/lib/api";
import { useAuth } from "@/contexts/SessionAuthContext";
import type { CartItem } from "@/contexts/CartContext";

export function useApiCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await CartService.getCart();
      setCart(data);
    } catch (err: any) {
      console.error("API cart error:", err);
      setError(err.message || "Failed to load cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        setError(null);
        const item: Partial<CartItem> = {
          productId,
          quantity,
        };
        const updatedCart = await CartService.addItem(item as CartItem);
        setCart(updatedCart);
        return updatedCart;
      } catch (err: any) {
        console.error("Add to cart error:", err);
        setError(err.message || "Failed to add item to cart");
        throw err;
      }
    },
    []
  );

  const updateCart = useCallback(
    async (items: CartItem[]) => {
      try {
        setError(null);
        const updatedCart = await CartService.saveCart(items);
        setCart(updatedCart);
        return updatedCart;
      } catch (err: any) {
        console.error("Update cart error:", err);
        setError(err.message || "Failed to update cart");
        throw err;
      }
    },
    []
  );

  const clearCart = useCallback(async () => {
    try {
      setError(null);
      await CartService.clearCart();
      setCart(null);
    } catch (err: any) {
      console.error("Clear cart error:", err);
      setError(err.message || "Failed to clear cart");
      throw err;
    }
  }, []);

  const syncCart = useCallback(async () => {
    try {
      setError(null);
      const result = await CartService.syncCart();
      setCart(result.cart);
      return result;
    } catch (err: any) {
      console.error("Sync cart error:", err);
      setError(err.message || "Failed to sync cart");
      throw err;
    }
  }, []);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCart,
    clearCart,
    syncCart,
    refetch: fetchCart,
  };
}

