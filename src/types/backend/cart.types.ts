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
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: string | null;
  variantName: string | null;
  sku: string;
  price: number;
  quantity: number;
  maxQuantity: number; // Stock limit
  subtotal: number;
  discount: number;
  total: number;
  shopId: string | null;
  shopName: string | null;
  isAvailable: boolean;
  addedAt: Timestamp;
}

/**
 * Cart entity from backend/Firestore
 */
export interface CartBE {
  id: string;
  userId: string;
  items: CartItemBE[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp | null;
}

/**
 * Add to cart request
 */
export interface AddToCartRequestBE {
  productId: string;
  variantId?: string;
  quantity: number;
}

/**
 * Update cart item request
 */
export interface UpdateCartItemRequestBE {
  quantity: number;
}

/**
 * Apply coupon request
 */
export interface ApplyCouponRequestBE {
  couponCode: string;
}

/**
 * Cart response
 */
export interface CartResponseBE {
  cart: CartBE;
}

/**
 * Cart validation response
 */
export interface CartValidationResponseBE {
  isValid: boolean;
  errors: Array<{
    itemId: string;
    productId: string;
    error: string;
  }>;
  warnings: Array<{
    itemId: string;
    productId: string;
    warning: string;
  }>;
}
