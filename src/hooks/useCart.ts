/**
 * Enhanced Cart Hook using new API services
 */

import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '@/lib/api/cart';
import type { Cart, CartItem } from '@/types';
import type { AddToCartRequest, UpdateCartItemRequest } from '@/lib/api/cart';

export interface UseCartReturn {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  total: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  validateCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Enhanced cart hook with comprehensive cart management
 */
export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartAPI.addToCart({ productId, quantity });
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartAPI.updateCartItem({ productId, quantity });
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartAPI.removeFromCart(productId);
      setCart(updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await cartAPI.clearCart();
      setCart(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const validation = await cartAPI.validateCart();
      
      if (!validation.valid && validation.issues.length > 0) {
        const issueMessages = validation.issues.map(issue => issue.message).join(', ');
        setError(`Cart validation issues: ${issueMessages}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cart validation failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await cartAPI.applyCoupon(couponCode);
      
      if (!result.success) {
        setError(result.message);
        throw new Error(result.message);
      }

      // Refetch cart to get updated totals
      await fetchCart();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply coupon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeCoupon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await cartAPI.removeCoupon();
      
      // Refetch cart to get updated totals
      await fetchCart();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove coupon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const refetch = useCallback(() => fetchCart(), [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Calculate cart metrics
  const itemCount = cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;
  const total = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return {
    cart,
    loading,
    error,
    itemCount,
    total,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    validateCart,
    applyCoupon,
    removeCoupon,
    refetch,
    clearError,
  };
}

/**
 * Hook for cart totals and calculations
 */
export function useCartTotals() {
  const [totals, setTotals] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTotals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const totalsData = await cartAPI.getCartTotal();
      setTotals(totalsData);
    } catch (err) {
      console.error('Failed to fetch cart totals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cart totals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return {
    totals,
    loading,
    error,
    refetch: fetchTotals,
  };
}
