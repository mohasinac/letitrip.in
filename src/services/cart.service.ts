/**
 * @fileoverview Service Module
 * @module src/services/cart.service
 * @description This file contains service functions for cart operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { apiService } from "./api.service";
import { CartBE } from "@/types/backend/cart.types";
import {
  CartFE,
  CartItemFE,
  AddToCartFormFE,
} from "@/types/frontend/cart.types";
import {
  toFECart,
  toBEAddToCartRequest,
} from "@/types/transforms/cart.transforms";

/**
 * Cart Service - Updated with new type system
 * All methods return FE types for UI, transform BE responses automatically
 */
class CartService {
  /**
   * Get user cart (returns UI-optimized cart)
   */
  async get(): Promise<CartFE> {
    const cartBE = await apiService.get<CartBE>("/cart");
    return toFECart(cartBE);
  }

  /**
   * Add item to cart
   */
  async addItem(formData: AddToCartFormFE): Promise<CartFE> {
    const request = toBEAddToCartRequest(formData);
    const cartBE = await apiService.post<CartBE>("/cart", request);
    return toFECart(cartBE);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, quantity: number): Promise<CartFE> {
    const cartBE = await apiService.patch<CartBE>(`/cart/${itemId}`, {
      quantity,
    });
    return toFECart(cartBE);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<CartFE> {
    const cartBE = await apiService.delete<CartBE>(`/cart/${itemId}`);
    return toFECart(cartBE);
  }

  /**
   * Clear cart
   */
  async clear(): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>("/cart");
  }

  /**
   * Merge guest cart with user cart (on login)
   */
  async mergeGuestCart(guestItems: CartItemFE[]): Promise<CartFE> {
    const cartBE = await apiService.post<CartBE>("/cart/merge", {
      /** Guest Cart Items */
      guestCartItems: guestItems,
    });
    return toFECart(cartBE);
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(code: string): Promise<CartFE> {
    const cartBE = await apiService.post<CartBE>("/cart/coupon", { code });
    return toFECart(cartBE);
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(): Promise<CartFE> {
    const cartBE = await apiService.delete<CartBE>("/cart/coupon");
    return toFECart(cartBE);
  }

  /**
   * Get cart item count
   */
  async getItemCount(): Promise<number> {
    const result = await apiService.get<{ count: number }>("/cart/count");
    return result.count;
  }

  /**
   * Validate cart (check stock, prices)
   */
  async validate(): Promise<{
    /** Valid */
    valid: boolean;
    /** Errors */
    errors: Array<{ itemId: string; productId: string; error: string }>;
  }> {
    return apiService.get("/cart/validate");
  }

  // Local storage helpers for guest cart
  private readonly GUEST_CART_KEY = "guest_cart";

  getGuestCart(): CartItemFE[] {
    if (typeof window === "undefined") return [];

    try {
      const cart = localStorage.getItem(this.GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }

  setGuestCart(items: CartItemFE[]): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
  }

  addToGuestCart(
    /** Item */
    item: Omit<
      CartItemFE,
      | "id"
      | "addedAt"
      | "formattedPrice"
      | "formattedSubtotal"
      | "formattedTotal"
      | "isOutOfStock"
      | "isLowStock"
      | "canIncrement"
      | "canDecrement"
      | "hasDiscount"
      | "addedTimeAgo"
    >,
  ): void {
    const cart = this.getGuestCart();

    // Check if item already exists
    /**
 * Performs existing index operation
 *
 * @param {any} (i - The (i
 *
 * @returns {any} The existingindex result
 *
 */
const existingIndex = cart.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += item.quantity;
    } else {
      // Add new item with computed fields
      const now = new Date();
      cart.push({
        ...item,
        /** Id */
        id: `guest_${Date.now()}_${Math.random()}`,
        /** Added At */
        addedAt: now,
        /** Formatted Price */
        formattedPrice: `₹${item.price}`,
        /** Formatted Subtotal */
        formattedSubtotal: `₹${item.subtotal}`,
        /** Formatted Total */
        formattedTotal: `₹${item.total}`,
        /** Is Out Of Stock */
        isOutOfStock: !item.isAvailable,
        /** Is Low Stock */
        isLowStock: item.maxQuantity <= 5,
        /** Can Increment */
        canIncrement: item.quantity < item.maxQuantity,
        /** Can Decrement */
        canDecrement: item.quantity > 1,
        /** Has Discount */
        hasDiscount: item.discount > 0,
        /** Added Time Ago */
        addedTimeAgo: "Just added",
      } as CartItemFE);
    }

    this.setGuestCart(cart);
  }

  // Add to guest cart with full product details
  addToGuestCartWithDetails(product: {
    /** Product Id */
    productId: string;
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
    /** Quantity */
    quantity: number;
    /** Variant Id */
    variantId?: string;
  }): void {
    const subtotal = product.price * product.quantity;
    this.addToGuestCart({
      /** Product Id */
      productId: product.productId,
      /** Product Name */
      productName: product.name,
      /** Product Slug */
      productSlug: product.name.toLowerCase().replace(/\s+/g, "-"),
      /** Product Image */
      productImage: product.image,
      /** Variant Id */
      variantId: product.variantId || null,
      /** Variant Name */
      variantName: null,
      /** Sku */
      sku: "",
      /** Price */
      price: product.price,
      /** Quantity */
      quantity: product.quantity,
      /** Max Quantity */
      maxQuantity: 100,
      subtotal,
      /** Discount */
      discount: 0,
      /** Total */
      total: subtotal,
      /** Shop Id */
      shopId: product.shopId,
      /** Shop Name */
      shopName: product.shopName,
      /** Is Available */
      isAvailable: /**
 * Performs index operation
 *
 * @param {any} (i - The (i
 *
 * @returns {any} The index result
 *
 */
true,
    });
  }

  updateGuestCartItem(itemId: string, quantity: number): void {
    const cart = this.getGuestCart();
    const index = cart.findIndex((i) => i.id === itemId);

    if (index >= 0) {
      if (quantity /**
 * Performs filtered operation
 *
 * @param {any} (i - The (i
 *
 * @returns {any} The filtered result
 *
 */
<= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
      this.setGuestCart(cart);
    }
  }

  /**
 * Performs cart operation
 *
 * @returns {any} The cart result
 *
 */
removeFromGuestCart(itemId: string): void {
    const cart = this.getGuestCart();
    const filtered = cart.filter((i) => i.id !== itemId);
    this.setGuestCart(filtered);
  }

  clearGuestCart(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.GUEST_CART_KEY);
  }

  getGuestCartItemCount(): number {
    const cart = this.getGuestCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cartService = new CartService();
