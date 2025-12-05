/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/cart.transforms
 * @description This file contains functionality related to cart.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * CART TYPE TRANSFORMATIONS
 *
 * Functions to convert between Backend (BE) and Frontend (FE) cart types.
 */

import { formatPrice } from "@/lib/price.utils";
import { Timestamp } from "firebase/firestore";
import { AddToCartRequestBE, CartBE, CartItemBE } from "../backend/cart.types";
import {
  AddToCartFormFE,
  CartFE,
  CartItemFE,
  CartSummaryFE,
} from "../frontend/cart.types";

/**
 * Parse Firestore Timestamp or ISO string to Date
 */
/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

/**
 * Parses date
 *
 * @param {Timestamp | string | null} date - The date
 *
 * @returns {any} The parsedate result
 */

function parseDate(date: Timestamp | string | null): Date | null {
  if (!date) return null;
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return new Date(date);
}

/**
 * Format relative time
 */
/**
 * Formats relative time
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatrelativetime result
 */

/**
 * Formats relative time
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatrelativetime result
 */

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just added";
  if (diffMins < 60)
    return `Added ${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `Added ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `Added ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

/**
 * Format expiration time
 */
/**
 * Formats expires in
 *
 * @param {Date | null} expiresAt - The expires at
 *
 * @returns {string} The formatexpiresin result
 */

/**
 * Formats expires in
 *
 * @param {Date | null} expiresAt - The expires at
 *
 * @returns {string} The formatexpiresin result
 */

function formatExpiresIn(expiresAt: Date | null): string | null {
  if (!expiresAt) return null;

  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 0) return "Expired";
  if (diffMins < 60)
    return `Expires in ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  return `Expires in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
}

/**
 * Transform Backend Cart Item to Frontend
 */
/**
 * Performs to f e cart item operation
 *
 * @param {CartItemBE} itemBE - The item b e
 *
 * @returns {any} The tofecartitem result
 */

/**
 * Performs to f e cart item operation
 *
 * @param {CartItemBE} itemBE - The item b e
 *
 * @returns {any} The tofecartitem result
 */

function toFECartItem(itemBE: CartItemBE): CartItemFE {
  const addedAt = parseDate(itemBE.addedAt) || new Date();

  return {
    /** Id */
    id: itemBE.id,
    /** Product Id */
    productId: itemBE.productId,
    /** Product Name */
    productName: itemBE.productName,
    /** Product Slug */
    productSlug: itemBE.productSlug,
    /** Product Image */
    productImage: itemBE.productImage,
    /** Variant Id */
    variantId: itemBE.variantId,
    /** Variant Name */
    variantName: itemBE.variantName,
    /** Sku */
    sku: itemBE.sku,
    /** Price */
    price: itemBE.price,
    /** Quantity */
    quantity: itemBE.quantity,
    /** Max Quantity */
    maxQuantity: itemBE.maxQuantity,
    /** Subtotal */
    subtotal: itemBE.subtotal,
    /** Discount */
    discount: itemBE.discount,
    /** Total */
    total: itemBE.total,
    /** Shop Id */
    shopId: itemBE.shopId,
    /** Shop Name */
    shopName: itemBE.shopName,
    /** Is Available */
    isAvailable: itemBE.isAvailable,
    addedAt,

    /** Formatted Price */
    formattedPrice: formatPrice(itemBE.price),
    /** Formatted Subtotal */
    formattedSubtotal: formatPrice(itemBE.subtotal),
    /** Formatted Total */
    formattedTotal: formatPrice(itemBE.total),

    /** Is Out Of Stock */
    isOutOfStock: !itemBE.isAvailable || itemBE.maxQuantity === 0,
    /** Is Low Stock */
    isLowStock:
      itemBE.isAvailable && itemBE.maxQuantity > 0 && itemBE.maxQuantity <= 5,
    /** Can Increment */
    canIncrement: itemBE.isAvailable && itemBE.quantity < itemBE.maxQuantity,
    /** Can Decrement */
    canDecrement: itemBE.quantity > 1,
    /** Has Discount */
    hasDiscount: itemBE.discount > 0,

    /** Added Time Ago */
    addedTimeAgo: formatRelativeTime(addedAt),
  };
}

/**
 * Group cart items by shop
 */
/**
 * Performs group items by shop operation
 *
 * @param {CartItemFE[]} items - The items
 *
 * @returns {any} The groupitemsbyshop result
 */

/**
 * Performs group items by shop operation
 *
 * @param {CartItemFE[]} items - The items
 *
 * @returns {any} The groupitemsbyshop result
 */

function groupItemsByShop(items: CartItemFE[]): Map<string, CartItemFE[]> {
  const grouped = new Map<string, CartItemFE[]>();

  items.forEach((item) => {
    const shopKey = item.shopId || "default";
    if (!grouped.has(shopKey)) {
      grouped.set(shopKey, []);
    }
    grouped.get(shopKey)!.push(item);
  });

  return grouped;
}

/**
 * Get validation errors
 */
/**
 * Retrieves validation errors
 *
 * @param {CartItemFE[]} items - The items
 *
 * @returns {string} The validationerrors result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Retrieves validation errors
 *
 * @param {CartItemFE[]} items - The items
 *
 * @returns {string} The validationerrors result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

function getValidationErrors(items: CartItemFE[]): string[] {
  const errors: string[] = [];

  const unavailableItems = items.filter((item) => !item.isAvailable);
  if (unavailableItems.length > 0) {
    errors.push(
      `${unavailableItems.length} item${
        unavailableItems.length > 1 ? "s" : ""
      } unavailable`
    );
  }

  const overQuantityItems = items.filter(
    (item) => item.quantity > item.maxQuantity
  );
  if (overQuantityItems.length > 0) {
    errors.push(
      `${overQuantityItems.length} item${
        overQuantityItems.length > 1 ? "s exceed" : " exceeds"
      } available stock`
    );
  }

  return errors;
}

/**
 * Get validation warnings
 */
/**
 * Retrieves validation warnings
 *
 * @param {CartItemFE[]} items - The items
 *
 * @returns {string} The validationwarnings result
 */

/**
 * Retrieves validation warnings
 *
 * @param {CartItemFE[]} items - The items
 *
 * @returns {string} The validationwarnings result
 */

function getValidationWarnings(items: CartItemFE[]): string[] {
  const warnings: string[] = [];

  const lowStockItems = items.filter((item) => item.isLowStock);
  if (lowStockItems.length > 0) {
    warnings.push(
      `${lowStockItems.length} item${
        lowStockItems.length > 1 ? "s have" : " has"
      } low stock`
    );
  }

  return warnings;
}

/**
 * Transform Backend Cart to Frontend Cart
 */
/**
 * Performs to f e cart operation
 *
 * @param {CartBE} cartBE - The cart b e
 *
 * @returns {any} The tofecart result
 *
 * @example
 * toFECart(cartBE);
 */

/**
 * Performs to f e cart operation
 *
 * @param {CartBE} cartBE - The cart b e
 *
 * @returns {any} The tofecart result
 *
 * @example
 * toFECart(cartBE);
 */

export function toFECart(cartBE: CartBE): CartFE {
  const createdAt = parseDate(cartBE.createdAt) || new Date();
  const updatedAt = parseDate(cartBE.updatedAt) || new Date();
  const expiresAt = parseDate(cartBE.expiresAt);

  /**
   * Performs items operation
   *
   * @returns {any} The items result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs items operation
   *
   * @returns {any} The items result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const items = (cartBE.items || []).map(toFECartItem);
  const itemsByShop = groupItemsByShop(items);
  const validationErrors = getValidationErrors(items);
  const validationWarnings = getValidationWarnings(items);

  return {
    /** Id */
    id: cartBE.id,
    /** User Id */
    userId: cartBE.userId,
    items,
    /** Item Count */
    itemCount: cartBE.itemCount,
    /** Subtotal */
    subtotal: cartBE.subtotal,
    /** Discount */
    discount: cartBE.discount,
    /** Tax */
    tax: cartBE.tax,
    /** Total */
    total: cartBE.total,
    createdAt,
    updatedAt,
    expiresAt,

    /** Formatted Subtotal */
    formattedSubtotal: formatPrice(cartBE.subtotal),
    /** Formatted Discount */
    formattedDiscount: formatPrice(cartBE.discount),
    /** Formatted Tax */
    formattedTax: formatPrice(cartBE.tax),
    /** Formatted Total */
    formattedTotal: formatPrice(cartBE.total),

    /** Is Empty */
    isEmpty: items.length === 0,
    /** Has Items */
    hasItems: items.length > 0,
    /** Has Unavailable Items */
    hasUnavailableItems: items.some((item) => !item.isAvailable),
    /** Has Discount */
    hasDiscount: cartBE.discount > 0,

    itemsByShop,
    /** Shop Ids */
    shopIds: Array.from(itemsByShop.keys()),

    /** Can Checkout */
    canCheckout: items.length > 0 && validationErrors.length === 0,
    validationErrors,
    validationWarnings,

    /** Expires In */
    expiresIn: formatExpiresIn(expiresAt),
  };
}

/**
 * Transform Frontend Cart to Cart Summary
 */
/**
 * Performs to f e cart summary operation
 *
 * @param {CartFE} cartFE - The cart f e
 *
 * @returns {any} The tofecartsummary result
 *
 * @example
 * toFECartSummary(cartFE);
 */

/**
 * Performs to f e cart summary operation
 *
 * @param {CartFE} cartFE - The cart f e
 *
 * @returns {any} The tofecartsummary result
 *
 * @example
 * toFECartSummary(cartFE);
 */

export function toFECartSummary(cartFE: CartFE): CartSummaryFE {
  const savings = cartFE.discount;

  return {
    /** Item Count */
    itemCount: cartFE.itemCount,
    /** Subtotal */
    subtotal: cartFE.subtotal,
    /** Discount */
    discount: cartFE.discount,
    /** Tax */
    tax: cartFE.tax,
    /** Total */
    total: cartFE.total,
    /** Formatted Subtotal */
    formattedSubtotal: cartFE.formattedSubtotal,
    /** Formatted Discount */
    formattedDiscount: cartFE.formattedDiscount,
    /** Formatted Tax */
    formattedTax: cartFE.formattedTax,
    /** Formatted Total */
    formattedTotal: cartFE.formattedTotal,
    savings,
    /** Formatted Savings */
    formattedSavings: formatPrice(savings),
  };
}

/**
 * Transform Frontend Add to Cart Form to Backend Request
 */
/**
 * Performs to b e add to cart request operation
 *
 * @param {AddToCartFormFE} formData - The form data
 *
 * @returns {any} The tobeaddtocartrequest result
 *
 * @example
 * toBEAddToCartRequest(formData);
 */

/**
 * Performs to b e add to cart request operation
 *
 * @param {AddToCartFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeaddtocartrequest result
 *
 * @example
 * toBEAddToCartRequest(/** Form Data */
  formData);
 */

export function toBEAddToCartRequest(
  /** Form Data */
  formData: AddToCartFormFE
): AddToCartRequestBE {
  return {
    /** Product Id */
    productId: formData.productId,
    /** Variant Id */
    variantId: formData.variantId,
    /** Quantity */
    quantity: formData.quantity,
  };
}

/**
 * Create empty cart
 */
/**
 * Creates a new empty cart
 *
 * @param {string} userId - user identifier
 *
 * @returns {string} The emptycart result
 *
 * @example
 * createEmptyCart("example");
 */

/**
 * Creates a new empty cart
 *
 * @param {string} userId - user identifier
 *
 * @returns {string} The emptycart result
 *
 * @example
 * createEmptyCart("example");
 */

export function createEmptyCart(userId: string): CartFE {
  const now = new Date();

  return {
    /** Id */
    id: "",
    userId,
    /** Items */
    items: [],
    /** Item Count */
    itemCount: 0,
    /** Subtotal */
    subtotal: 0,
    /** Discount */
    discount: 0,
    /** Tax */
    tax: 0,
    /** Total */
    total: 0,
    /** Created At */
    createdAt: now,
    /** Updated At */
    updatedAt: now,
    /** Expires At */
    expiresAt: null,

    /** Formatted Subtotal */
    formattedSubtotal: formatPrice(0),
    /** Formatted Discount */
    formattedDiscount: formatPrice(0),
    /** Formatted Tax */
    formattedTax: formatPrice(0),
    /** Formatted Total */
    formattedTotal: formatPrice(0),

    /** Is Empty */
    isEmpty: true,
    /** Has Items */
    hasItems: false,
    /** Has Unavailable Items */
    hasUnavailableItems: false,
    /** Has Discount */
    hasDiscount: false,

    /** Items By Shop */
    itemsByShop: new Map(),
    /** Shop Ids */
    shopIds: [],

    /** Can Checkout */
    canCheckout: false,
    /** Validation Errors */
    validationErrors: [],
    /** Validation Warnings */
    validationWarnings: [],

    /** Expires In */
    expiresIn: null,
  };
}
