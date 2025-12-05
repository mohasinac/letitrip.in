/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/cart.types
 * @description This file contains TypeScript type definitions for cart
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * FRONTEND CART TYPES
 *
 * These types are optimized for UI components and include computed fields,
 * formatted data, and UI-specific properties.
 */

/**
 * Cart item for frontend
 */
export interface CartItemFE {
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
  /** Max Quantity */
  maxQuantity: number;
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
  addedAt: Date;

  // Formatted
  formattedPrice: string; // "₹1,999"
  /** Formatted Subtotal */
  formattedSubtotal: string;
  /** Formatted Total */
  formattedTotal: string;

  // UI states
  /** Is Out Of Stock */
  isOutOfStock: boolean;
  /** Is Low Stock */
  isLowStock: boolean;
  /** Can Increment */
  canIncrement: boolean;
  /** Can Decrement */
  canDecrement: boolean;
  /** Has Discount */
  hasDiscount: boolean;

  // Time
  addedTimeAgo: string; // "Added 2 hours ago"
}

/**
 * Cart entity for frontend (UI-optimized)
 */
export interface CartFE {
  /** Id */
  id: string;
  /** User Id */
  userId: string;
  /** Items */
  items: CartItemFE[];
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
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;
  /** Expires At */
  expiresAt: Date | null;

  // Formatted pricing
  /** Formatted Subtotal */
  formattedSubtotal: string;
  /** Formatted Discount */
  formattedDiscount: string;
  /** Formatted Tax */
  formattedTax: string;
  /** Formatted Total */
  formattedTotal: string;

  // UI states
  /** Is Empty */
  isEmpty: boolean;
  /** Has Items */
  hasItems: boolean;
  /** Has Unavailable Items */
  hasUnavailableItems: boolean;
  /** Has Discount */
  hasDiscount: boolean;

  // Grouping
  /** Items By Shop */
  itemsByShop: Map<string, CartItemFE[]>;
  /** Shop Ids */
  shopIds: string[];

  // Validation
  /** Can Checkout */
  canCheckout: boolean;
  /** Validation Errors */
  validationErrors: string[];
  /** Validation Warnings */
  validationWarnings: string[];

  // Time
  expiresIn: string | null; // "Expires in 30 minutes"
}

/**
 * Add to cart form data
 */
export interface AddToCartFormFE {
  /** Product Id */
  productId: string;
  /** Variant Id */
  variantId?: string;
  /** Quantity */
  quantity: number;
}

/**
 * Cart summary for checkout
 */
export interface CartSummaryFE {
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
  /** Formatted Subtotal */
  formattedSubtotal: string;
  /** Formatted Discount */
  formattedDiscount: string;
  /** Formatted Tax */
  formattedTax: string;
  /** Formatted Total */
  formattedTotal: string;
  /** Savings */
  savings: number;
  /** Formatted Savings */
  formattedSavings: string;
}

/**
 * Cart validation result
 */
export interface CartValidationFE {
  /** Is Valid */
  isValid: boolean;
  /** Can Checkout */
  canCheckout: boolean;
  /** Errors */
  errors: Array<{
    /** Item Id */
    itemId: string;
    /** Product Id */
    productId: string;
    /** Product Name */
    productName: string;
    /** Error */
    error: string;
  }>;
  /** Warnings */
  warnings: Array<{
    /** Item Id */
    itemId: string;
    /** Product Id */
    productId: string;
    /** Product Name */
    productName: string;
    /** Warning */
    warning: string;
  }>;
}
