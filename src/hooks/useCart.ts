"use client";

import { useState, useEffect, useCallback } from 'react';
import { cartService, CartSummary } from '@/services/cart.service';
import { useAuth } from '@/contexts/AuthContext';
import type { CartItem } from '@/types';

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart (authenticated or guest)
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (user) {
        // Authenticated user - fetch from API
        const data = await cartService.get();
        setCart(data);
      } else {
        // Guest user - load from localStorage
        const guestItems = cartService.getGuestCart();
        
        // Calculate guest cart summary
        const subtotal = guestItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal > 5000 ? 0 : 100;
        const tax = subtotal * 0.18;
        const total = subtotal + shipping + tax;
        
        setCart({
          items: guestItems,
          subtotal,
          shipping,
          tax,
          discount: 0,
          total,
          itemCount: guestItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      }
    } catch (err: any) {
      console.error('Failed to load cart:', err);
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item to cart (with optional product details for guest users)
  const addItem = useCallback(async (
    productId: string, 
    quantity: number = 1, 
    variant?: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    }
  ) => {
    try {
      if (user) {
        // Authenticated user
        await cartService.addItem({ productId, quantity, variant });
        await loadCart();
      } else {
        // Guest user - add to localStorage
        if (!productDetails) {
          throw new Error('Product details required for guest cart');
        }
        
        cartService.addToGuestCartWithDetails({
          productId,
          quantity,
          variant,
          ...productDetails,
        });
        
        await loadCart();
      }
    } catch (err: any) {
      console.error('Failed to add item:', err);
      throw err;
    }
  }, [user, loadCart]);

  // Update item quantity
  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (user) {
        // Authenticated user
        await cartService.updateItem(itemId, { quantity });
        await loadCart();
      } else {
        // Guest user
        cartService.updateGuestCartItem(itemId, quantity);
        await loadCart();
      }
    } catch (err: any) {
      console.error('Failed to update item:', err);
      throw err;
    }
  }, [user, loadCart]);

  // Remove item
  const removeItem = useCallback(async (itemId: string) => {
    try {
      if (user) {
        // Authenticated user
        await cartService.removeItem(itemId);
        await loadCart();
      } else {
        // Guest user
        cartService.removeFromGuestCart(itemId);
        await loadCart();
      }
    } catch (err: any) {
      console.error('Failed to remove item:', err);
      throw err;
    }
  }, [user, loadCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (user) {
        // Authenticated user
        await cartService.clear();
        await loadCart();
      } else {
        // Guest user
        cartService.clearGuestCart();
        await loadCart();
      }
    } catch (err: any) {
      console.error('Failed to clear cart:', err);
      throw err;
    }
  }, [user, loadCart]);

  // Apply coupon
  const applyCoupon = useCallback(async (code: string) => {
    try {
      if (!user) {
        throw new Error('Please login to apply coupons');
      }

      const result = await cartService.applyCoupon({ code });
      
      // Update cart with new totals
      if (cart) {
        setCart({
          ...cart,
          discount: result.discount,
          shipping: result.shipping,
          tax: result.tax,
          total: result.total,
          couponCode: result.couponCode,
        });
      }

      return result;
    } catch (err: any) {
      console.error('Failed to apply coupon:', err);
      throw err;
    }
  }, [user, cart]);

  // Remove coupon
  const removeCoupon = useCallback(async () => {
    try {
      if (!user) {
        return;
      }

      const result = await cartService.removeCoupon();
      
      // Update cart with recalculated totals
      if (cart) {
        setCart({
          ...cart,
          discount: 0,
          shipping: result.shipping,
          tax: result.tax,
          total: result.total,
          couponCode: undefined,
        });
      }
    } catch (err: any) {
      console.error('Failed to remove coupon:', err);
      throw err;
    }
  }, [user, cart]);

  // Merge guest cart on login
  const mergeGuestCart = useCallback(async () => {
    if (!user) return;

    const guestItems = cartService.getGuestCart();
    if (guestItems.length === 0) return;

    try {
      await cartService.mergeGuestCart({
        guestCartItems: guestItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
        })),
      });

      // Clear guest cart after merge
      cartService.clearGuestCart();
      
      // Reload cart
      await loadCart();
    } catch (err: any) {
      console.error('Failed to merge guest cart:', err);
    }
  }, [user, loadCart]);

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (user) {
      mergeGuestCart();
    }
  }, [user, mergeGuestCart]);

  return {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    refresh: loadCart,
  };
}
