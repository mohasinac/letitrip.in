/**
 * CART TYPE TRANSFORMATIONS
 *
 * Functions to convert between Backend (BE) and Frontend (FE) cart types.
 */

import { formatPrice } from "@letitrip/react-library";
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
function toFECartItem(itemBE: CartItemBE): CartItemFE {
  const addedAt = parseDate(itemBE.addedAt) || new Date();

  return {
    id: itemBE.id,
    productId: itemBE.productId,
    productName: itemBE.productName,
    productSlug: itemBE.productSlug,
    productImage: itemBE.productImage,
    variantId: itemBE.variantId,
    variantName: itemBE.variantName,
    sku: itemBE.sku,
    price: itemBE.price,
    quantity: itemBE.quantity,
    maxQuantity: itemBE.maxQuantity,
    subtotal: itemBE.subtotal,
    discount: itemBE.discount,
    total: itemBE.total,
    shopId: itemBE.shopId,
    shopName: itemBE.shopName,
    isAvailable: itemBE.isAvailable,
    addedAt,

    formattedPrice: formatPrice(itemBE.price),
    formattedSubtotal: formatPrice(itemBE.subtotal),
    formattedTotal: formatPrice(itemBE.total),

    isOutOfStock: !itemBE.isAvailable || itemBE.maxQuantity === 0,
    isLowStock:
      itemBE.isAvailable && itemBE.maxQuantity > 0 && itemBE.maxQuantity <= 5,
    canIncrement: itemBE.isAvailable && itemBE.quantity < itemBE.maxQuantity,
    canDecrement: itemBE.quantity > 1,
    hasDiscount: itemBE.discount > 0,

    addedTimeAgo: formatRelativeTime(addedAt),
  };
}

/**
 * Group cart items by shop
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
function getValidationErrors(items: CartItemFE[]): string[] {
  const errors: string[] = [];

  const unavailableItems = items.filter((item) => !item.isAvailable);
  if (unavailableItems.length > 0) {
    errors.push(
      `${unavailableItems.length} item${
        unavailableItems.length > 1 ? "s" : ""
      } unavailable`,
    );
  }

  const overQuantityItems = items.filter(
    (item) => item.quantity > item.maxQuantity,
  );
  if (overQuantityItems.length > 0) {
    errors.push(
      `${overQuantityItems.length} item${
        overQuantityItems.length > 1 ? "s exceed" : " exceeds"
      } available stock`,
    );
  }

  return errors;
}

/**
 * Get validation warnings
 */
function getValidationWarnings(items: CartItemFE[]): string[] {
  const warnings: string[] = [];

  const lowStockItems = items.filter((item) => item.isLowStock);
  if (lowStockItems.length > 0) {
    warnings.push(
      `${lowStockItems.length} item${
        lowStockItems.length > 1 ? "s have" : " has"
      } low stock`,
    );
  }

  return warnings;
}

/**
 * Transform Backend Cart to Frontend Cart
 */
export function toFECart(cartBE: CartBE): CartFE {
  const createdAt = parseDate(cartBE.createdAt) || new Date();
  const updatedAt = parseDate(cartBE.updatedAt) || new Date();
  const expiresAt = parseDate(cartBE.expiresAt);

  const items = (cartBE.items || []).map(toFECartItem);
  const itemsByShop = groupItemsByShop(items);
  const validationErrors = getValidationErrors(items);
  const validationWarnings = getValidationWarnings(items);

  return {
    id: cartBE.id,
    userId: cartBE.userId,
    items,
    itemCount: cartBE.itemCount,
    subtotal: cartBE.subtotal,
    discount: cartBE.discount,
    tax: cartBE.tax,
    total: cartBE.total,
    couponCode: cartBE.couponCode,
    createdAt,
    updatedAt,
    expiresAt,

    formattedSubtotal: formatPrice(cartBE.subtotal),
    formattedDiscount: formatPrice(cartBE.discount),
    formattedTax: formatPrice(cartBE.tax),
    formattedTotal: formatPrice(cartBE.total),

    isEmpty: items.length === 0,
    hasItems: items.length > 0,
    hasUnavailableItems: items.some((item) => !item.isAvailable),
    hasDiscount: cartBE.discount > 0,

    itemsByShop,
    shopIds: Array.from(itemsByShop.keys()),

    canCheckout: items.length > 0 && validationErrors.length === 0,
    validationErrors,
    validationWarnings,

    expiresIn: formatExpiresIn(expiresAt),
  };
}

/**
 * Transform Frontend Cart to Cart Summary
 */
export function toFECartSummary(cartFE: CartFE): CartSummaryFE {
  const savings = cartFE.discount;

  return {
    itemCount: cartFE.itemCount,
    subtotal: cartFE.subtotal,
    discount: cartFE.discount,
    tax: cartFE.tax,
    total: cartFE.total,
    formattedSubtotal: cartFE.formattedSubtotal,
    formattedDiscount: cartFE.formattedDiscount,
    formattedTax: cartFE.formattedTax,
    formattedTotal: cartFE.formattedTotal,
    savings,
    formattedSavings: formatPrice(savings),
  };
}

/**
 * Transform Frontend Add to Cart Form to Backend Request
 */
export function toBEAddToCartRequest(
  formData: AddToCartFormFE,
): AddToCartRequestBE {
  return {
    productId: formData.productId,
    variantId: formData.variantId,
    quantity: formData.quantity,
  };
}

/**
 * Create empty cart
 */
export function createEmptyCart(userId: string): CartFE {
  const now = new Date();

  return {
    id: "",
    userId,
    items: [],
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    couponCode: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: null,

    formattedSubtotal: formatPrice(0),
    formattedDiscount: formatPrice(0),
    formattedTax: formatPrice(0),
    formattedTotal: formatPrice(0),

    isEmpty: true,
    hasItems: false,
    hasUnavailableItems: false,
    hasDiscount: false,

    itemsByShop: new Map(),
    shopIds: [],

    canCheckout: false,
    validationErrors: [],
    validationWarnings: [],

    expiresIn: null,
  };
}
