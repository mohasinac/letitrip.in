/**
 * @fileoverview Cart Management Hook
 * @module src/hooks/useCart
 * @description Custom React hook for managing shopping cart state and operations.
 * Handles both authenticated and guest user carts with automatic synchronization.
 *
 * @created 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { cartService } from "@/services/cart.service";
import type { CartFE, CartItemFE } from "@/types/frontend/cart.types";
import { useCallback, useEffect, useState } from "react";

/**
 * Cart state and operations object returned by useCart hook
 * @typedef {Object} UseCartReturn
 * @property {CartFE | null} cart - Current cart state with all items and calculations
 * @property {boolean} loading - Loading state indicator
 * @property {string | null} error - Error message if operation failed
 * @property {boolean} isMerging - Whether cart merge is in progress
 * @property {boolean} mergeSuccess - Whether cart merge completed successfully
 * @property {Function} addItem - Adds item to cart
 * @property {Function} updateItem - Updates item quantity
 * @property {Function} removeItem - Removes item from cart
 * @property {Function} clearCart - Clears all cart items
 * @property {Function} refresh - Manually refreshes cart data
 */

/**
 * Custom React hook for comprehensive shopping cart management.
 *
 * Features:
 * - Automatic cart loading on mount and auth changes
 * - Guest cart support with localStorage
 * - Authenticated cart with API sync
 * - Cart merging when guest logs in
 * - Optimistic updates with rollback
 * - Error handling and logging
 * - Real-time cart calculations
 *
 * @hook
 * @returns {UseCartReturn} Cart state and operation functions
 *
 * @throws {Error} When cart operations fail (caught and set in error state)
 *
 * @example
 * // Basic usage in a component
 * /**
 * Performs checkout page operation
 *
 * @returns {any} The checkoutpage result
 *
 */
function CheckoutPage() {
 *   const { cart, loading, addItem, removeItem, error } = useCart();
 *
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <div>
 *       <h2>Cart ({cart?.itemCount} items)</h2>
 *       {cart?.items.map(item => (
 *         <CartItem
 *           key={item.id}
 *           item={item}
 *           onRemove={() => removeItem(item.id)}
 *         />
 *       ))}
 *       <Total amount={cart?.formattedTotal} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Adding item with product details (guest mode)
 * const { addItem } = useCart();
 *
 * await addItem(
 *   "product-123",
 *   2, // quantity
 *   "variant-456", // optional variant
 *   {
 *     name: "Product Name",
 *     price: 1999,
 *     image: "/images/product.jpg",
 *     shopId: "shop-789",
 *     shopName: "Shop Name"
 *   }
 * );
 */
/**
 * Custom React hook for cart
 *
 * @returns {any} The usecart result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useCart();
 */

/**
 * Custom React hook for cart
 *
 * @returns {any} The usecart result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useCart();
 */

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartFE | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);

  // Transform guest cart items to full CartItemFE objects
  /**
 * Transforms guest items
 *
 * @param {CartItemFE[]} (items - The (items
 *
 * @returns {CartItemFE[] =>} The transformguestitems result
 *
 */
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
          /** Id */
          id: item.id || `guest_${Date.now()}_${Math.random()}`,
          /** Product Slug */
          productSlug:
            item.productSlug ||
            item.productName.toLowerCase().replace(/\s+/g, "-"),
          /** Variant Id */
          variantId: item.variantId || null,
          /** Variant Name */
          variantName: item.variantName || null,
          /** Sku */
          sku: item.sku || "",
          /** Max Quantity */
          maxQuantity: item.maxQuantity || 100,
          subtotal,
          discount,
          total,
          /** Is Available */
          isAvailable: item.isAvailable !== false,
          /** Added At */
          addedAt: item.addedAt || now,
          // Computed fields
          /** Formatted Price */
          formattedPrice: `₹${item.price.toLocaleString("en-IN")}`,
          /** Formatted Subtotal */
          formattedSubtotal: `₹${subtotal.toLocaleString("en-IN")}`,
          /** Formatted Total */
          formattedTotal: `₹${total.toLocaleString("en-IN")}`,
          /** Is Out Of Stock */
          isOutOfStock: item.isAvailable === false,
          /** Is Low Stock */
          isLowStock: (item.maxQuantity || 100) <= 5,
          /** Can Increment */
          canIncrement: item.quantity < (item.maxQuantity || 100),
          /** Can Decrement */
          canDecrement: item.quantity > 1,
          /** Has Discount */
          hasDiscount: discount > 0,
          /** Add/**
 * Performs load cart operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loadcart result
 *
 */
ed Time Ago */
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
       /**
 * Performs subtotal operation
 *
 * @param {any} (sum - The (sum
 * @param {any} item - The item
 *
 * @returns {any} The subtotal result
 *
 */
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
          /** Id */
          id: "guest",
          /** User Id */
          userId: "guest",
          /** Items */
          items: transformedItems,
          /** Item Count */
          itemCount: transformedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          subtotal,
          /** Discount */
          discount: 0,
          tax,
          total,
          /** Created At */
          createdAt: new Date(),
          /** Updated At */
          updatedAt: new Date(),
          /** Expires At */
          expiresAt: null,
          /** Formatted Subtotal */
          formattedSubtotal: `₹${subtotal.toLocaleString("en-IN")}`,
          /** Formatted Discount */
          formattedDiscount: "₹0",
          /** Formatted Tax */
          formattedTax: `₹${tax.toLocaleString("en-IN")}`,
          /** Formatted Total */
          formattedTotal: `₹${total.toLocaleString("en-IN")}`,
          /** Is Empty */
          isEmpty: transformedItems.length === 0,
          /** Has Items */
          hasItems: transformedItems.length > 0,
          /** Has Unavailable Items */
          hasUnavailableItems: false,
          /** Has Discount */
          hasDiscount: false,
          /** Items By Shop */
          itemsByShop: new Map(),
          /** Shop Ids */
          shopIds: [],
          /** Can Checkout */
          canCheckout: transformedItems.length > 0,
          /** Validation Errors */
          validationErrors: [],
          /** Validation Warnings */
          validationWarnings: [],
          /** Expires In */
          expiresIn: null,
        } as CartFE);
      }
    } catch (err: any) {
      logError(err as Error, {
        /** Component */
        component: "useCart.loadCart",
      });
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [user, transformGuestItems]);

  // Add item to cart (with optional product details for guest users)
  const addItem = useCallback(
    async (
      /** Product Id */
      productId: string,
      /** Quantity */
      quantity: number = 1,
      /** Variant */
      variant?: string,
      /** Product Details */
      productDetails?: {
        /** Name */
        name: string;
        /** Price */
        price: number;
        /** Image */
        image: string;
        /** Shop Id */
        shopId: string;
        /** Shop Name */
        shopName: string;
      }
    ) => {
      try {
        if (user) {
          // Authenticated user
          await cartService.addItem({
            productId,
            quantity,
            /** Variant Id */
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
            /** Variant Id */
  /**
 * Updates item
 *
 * @param {string} async(itemId - The async(itemid
 * @param {number} quantity - The quantity
 *
 * @returns {Promise<any>} The updateitem result
 *
 */
          variantId: variant,
            ...productDetails,
          });

          await loadCart();
        }
      } catch (err: any) {
        logError(err, {
          /** Component */
          component: "useCart.addItem",
          /** Metadata */
          metadata: { productId, quantity, variant },
        });
        throw err;
      }
    },
    [user, loadCart]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (itemId: string, quantity: /**
 * Performs remove item operation
 *
 * @param {string} async(itemId - The async(itemid
 *
 * @returns {Promise<any>} The removeitem result
 *
 */
number) => {
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
        logError(err, {
          /** Component */
          component: "useCart.updateItem",
          /** Metadata */
          met/**
 * Performs clear cart operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The clearcart result
 *
 */
adata: { itemId, quantity },
        });
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
          await cartService.removeItem(item/**
 * Performs apply coupon operation
 *
 * @param {string} async(code - The async(code
 *
 * @returns {Promise<any>} The applycoupon result
 *
 */
Id);
          await loadCart();
        } else {
          // Guest user
          cartService.removeFromGuestCart(itemId);
          await loadCart();
        }
      } catch (err: any) {
        logError(err, {
          /** Component */
          component: "useCart.removeItem",
          /** Metadata */
          metadata: { itemId },
        });
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
      logError/**
 * Performs remove coupon operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The removecoupon result
 *
 */
(err, { component: "useCart.clearCart" });
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
            /** Discount */
            discount: result.discount,
            /** Ta/**
 * Performs merge guest cart operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The mergeguestcart result
 *
 */
x */
            tax: result.tax,
            /** Total */
            total: result.total,
            // Note: shipping and couponCode not in CartSummaryFE yet
          });
        }

        return result;
      } catch (err: any) {
        logError(err, {
          /** Component */
          component: "useCart.applyCoupon",
          /** Metadata */
          metadata: { code },
        });
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
          /** Discount */
          discount: 0,
          /** Tax */
          tax: result.tax,
          /** Total */
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
          /** Product Id */
          productId: item.productId,
          /** Quantity */
          quantity: item.quantity,
          /** Variant Id */
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
      logError(err as Error, {
        /** Component */
        component: "useCart.mergeGuestCart",
      });
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
    /** Refresh */
    refresh: loadCart,
  };
}
