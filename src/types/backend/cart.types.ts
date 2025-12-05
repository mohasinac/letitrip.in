/**
 * @fileoverview Type Definitions
 * @module src/types/backend/cart.types
 * @description This file contains TypeScript type definitions for cart
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * BACKEND CART TYPES
 *
 * These types match the API response structure and Firestore documents exactly.
 */

import { Timestamp } from "firebase/firestore";

/**
 * Cart item
 */
export interface CartItemBE {
  /** Id */
  id: string;
  /** Product Id */
  productId: string;
  /** Product Name */
  productName: string;
  /** Product Slug */
  productSlug: string;
  /** Product Image */
  productImage: string;
  /** Variant Id */
  variantId: string | null;
  /** Variant Name */
  variantName: string | null;
  /** Sku */
  sku: string;
  /** Price */
  price: number;
  /** Quantity */
  quantity: number;
  maxQuantity: number; // Stock limit
  /** Subtotal */
  subtotal: number;
  /** Discount */
  discount: number;
  /** Total */
  total: number;
  /** Shop Id */
  shopId: string | null;
  /** Shop Name */
  shopName: string | null;
  /** Is Available */
  isAvailable: boolean;
  /** Added At */
  addedAt: Timestamp;
}

/**
 * Cart entity from backend/Firestore
 */
export interface CartBE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Items */
  items: CartItemBE[];
  /** Item Count */
  itemCount: number;
  /** Subtotal */
  subtotal: number;
  /** Discount */
  discount: number;
  /** Tax */
  tax: number;
  /** Total */
  total: number;
  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
  /** Expires At */
  expiresAt: Timestamp | null;
}

/**
 * Add to cart request
 */
export interface AddToCartRequestBE {
  /** Product Id */
  productId: string;
  /** Variant Id */
  variantId?: string;
  /** Quantity */
  quantity: number;
}

/**
 * Update cart item request
 */
export interface UpdateCartItemRequestBE {
  /** Quantity */
  quantity: number;
}

/**
 * Apply coupon request
 */
export interface ApplyCouponRequestBE {
  /** Coupon Code */
  couponCode: string;
}

/**
 * Cart response
 */
export interface CartResponseBE {
  /** Cart */
  cart: CartBE;
}

/**
 * Cart validation response
 */
export interface CartValidationResponseBE {
  /** Is Valid */
  isValid: boolean;
  /** Errors */
  errors: Array<{
    /** Item Id */
    itemId: string;
    /** Product Id */
    productId: string;
    /** Error */
    error: string;
  }>;
  /** Warnings */
  warnings: Array<{
    /** Item Id */
    itemId: string;
    /** Product Id */
    productId: string;
    /** Warning */
    warning: string;
  }>;
}
