"use client";

import { useState, useEffect, useCallback } from "react";
import { logError } from "@/lib/firebase-error-logger";
import { cartService } from "@/services/cart.service";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItemFE, CartFE } from "@/types";

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartFE | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);

  // Transform guest cart items to full CartItemFE objects
  const transformGuestItems = useCallback(
    (items: CartItemFE[]): CartItemFE[] => {
      const now = new Date();
      return items.map((item) => {
        const subtotal = item.price * item.quantity;
        const discount = item.discount || 0;
        const total = subtotal - discount;

        return {
          ...item,
          // Ensure all required fields are present
          id: item.id || `guest_${Date.now()}_${Math.random()}`,
          productSlug:
            item.productSlug ||
            item.productName.toLowerCase().replace(/\s+/g, "-"),
          variantId: item.variantId || null,
          variantName: item.variantName || null,
          sku: item.sku || "",
          maxQuantity: item.maxQuantity || 100,
          subtotal,
          discount,
          total,
          isAvailable: item.isAvailable !== false,
          addedAt: item.addedAt || now,
          // Computed fields
          formattedPrice: `₹${item.price.toLocaleString("en-IN")}`,
          formattedSubtotal: `₹${subtotal.toLocaleString("en-IN")}`,
          formattedTotal: `₹${total.toLocaleString("en-IN")}`,
          isOutOfStock: item.isAvailable === false,
          isLowStock: (item.maxQuantity || 100) <= 5,
          canIncrement: item.quantity < (item.maxQuantity || 100),
          canDecrement: item.quantity > 1,
          hasDiscount: discount > 0,
          addedTimeAgo: item.addedTimeAgo || "Recently added",
        };
      });
    },
    []
  );

  // Load cart data
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
        const transformedItems = transformGuestItems(guestItems);

        // For guest cart, create a minimal CartFE-like structure
        const subtotal = transformedItems.reduce(
          (sum, item) => sum + item.total,
          0
        );
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        // Create a minimal CartFE object for guest users
        setCart({
          id: "guest",
          userId: "guest",
          items: transformedItems,
          itemCount: transformedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          subtotal,
          discount: 0,
          tax,
          total,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: null,
          formattedSubtotal: `₹${subtotal.toLocaleString("en-IN")}`,
          formattedDiscount: "₹0",
          formattedTax: `₹${tax.toLocaleString("en-IN")}`,
          formattedTotal: `₹${total.toLocaleString("en-IN")}`,
          isEmpty: transformedItems.length === 0,
          hasItems: transformedItems.length > 0,
          hasUnavailableItems: false,
          hasDiscount: false,
          itemsByShop: new Map(),
          shopIds: [],
          canCheckout: transformedItems.length > 0,
          validationErrors: [],
          validationWarnings: [],
          expiresIn: null,
        } as CartFE);
      }
    } catch (err: any) {
      console.error("Failed to load cart:", err);
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [user, transformGuestItems]);

  // Add item to cart (with optional product details for guest users)
  const addItem = useCallback(
    async (
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
          await cartService.addItem({
            productId,
            quantity,
            variantId: variant,
          });
          await loadCart();
        } else {
          // Guest user - add to localStorage
          if (!productDetails) {
            throw new Error("Product details required for guest cart");
          }

          cartService.addToGuestCartWithDetails({
            productId,
            quantity,
            variantId: variant,
            ...productDetails,
          });

          await loadCart();
        }
      } catch (err: any) {
        logError(err, {
          component: "useCart.addItem",
          productId,
          quantity,
          variantId,
        });
        throw err;
      }
    },
    [user, loadCart]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        if (user) {
          // Authenticated user
          await cartService.updateItem(itemId, quantity);
          await loadCart();
        } else {
          // Guest user
          cartService.updateGuestCartItem(itemId, quantity);
          await loadCart();
        }
      } catch (err: any) {
        logError(err, { component: "useCart.updateItem", itemId, quantity });
        throw err;
      }
    },
    [user, loadCart]
  );

  // Remove item
  const removeItem = useCallback(
    async (itemId: string) => {
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
        logError(err, { component: "useCart.removeItem", itemId });
        throw err;
      }
    },
    [user, loadCart]
  );

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
      logError(err, { component: "useCart.clearCart" });
      throw err;
    }
  }, [user, loadCart]);

  // Apply coupon
  const applyCoupon = useCallback(
    async (code: string) => {
      try {
        if (!user) {
          throw new Error("Please login to apply coupons");
        }

        const result = await cartService.applyCoupon(code);

        // Update cart with new totals
        if (cart) {
          setCart({
            ...cart,
            discount: result.discount,
            tax: result.tax,
            total: result.total,
            // Note: shipping and couponCode not in CartSummaryFE yet
          });
        }

        return result;
      } catch (err: any) {
        logError(err, { component: "useCart.applyCoupon", code });
        throw err;
      }
    },
    [user, cart]
  );

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
          tax: result.tax,
          total: result.total,
          // Note: shipping and couponCode not in CartSummaryFE yet
        });
      }
    } catch (err: any) {
      logError(err, { component: "useCart.removeCoupon" });
      throw err;
    }
  }, [user, cart]);

  // Merge guest cart on login
  const mergeGuestCart = useCallback(async () => {
    if (!user) return;

    const guestItems = cartService.getGuestCart();
    if (guestItems.length === 0) return;

    try {
      setIsMerging(true);
      setMergeSuccess(false);
      setError(null);

      // API accepts minimal item data, type signature is misleading
      await cartService.mergeGuestCart(
        guestItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
        })) as any as CartItemFE[]
      );

      // Clear guest cart after merge
      cartService.clearGuestCart();

      // Show success message
      setMergeSuccess(true);
      setTimeout(() => setMergeSuccess(false), 3000);

      // Reload cart
      await loadCart();
    } catch (err: any) {
      console.error("Failed to merge guest cart:", err);
      setError(err.message || "Failed to merge cart items");
    } finally {
      setIsMerging(false);
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
    isMerging,
    mergeSuccess,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    refresh: loadCart,
  };
}
