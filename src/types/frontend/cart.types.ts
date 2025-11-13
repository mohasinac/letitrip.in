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
  maxQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
  shopId: string | null;
  shopName: string | null;
  isAvailable: boolean;
  addedAt: Date;

  // Formatted
  formattedPrice: string; // "₹1,999"
  formattedSubtotal: string;
  formattedTotal: string;

  // UI states
  isOutOfStock: boolean;
  isLowStock: boolean;
  canIncrement: boolean;
  canDecrement: boolean;
  hasDiscount: boolean;

  // Time
  addedTimeAgo: string; // "Added 2 hours ago"
}

/**
 * Cart entity for frontend (UI-optimized)
 */
export interface CartFE {
  id: string;
  userId: string;
  items: CartItemFE[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;

  // Formatted pricing
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTax: string;
  formattedTotal: string;

  // UI states
  isEmpty: boolean;
  hasItems: boolean;
  hasUnavailableItems: boolean;
  hasDiscount: boolean;

  // Grouping
  itemsByShop: Map<string, CartItemFE[]>;
  shopIds: string[];

  // Validation
  canCheckout: boolean;
  validationErrors: string[];
  validationWarnings: string[];

  // Time
  expiresIn: string | null; // "Expires in 30 minutes"
}

/**
 * Add to cart form data
 */
export interface AddToCartFormFE {
  productId: string;
  variantId?: string;
  quantity: number;
}

/**
 * Cart summary for checkout
 */
export interface CartSummaryFE {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTax: string;
  formattedTotal: string;
  savings: number;
  formattedSavings: string;
}

/**
 * Cart validation result
 */
export interface CartValidationFE {
  isValid: boolean;
  canCheckout: boolean;
  errors: Array<{
    itemId: string;
    productId: string;
    productName: string;
    error: string;
  }>;
  warnings: Array<{
    itemId: string;
    productId: string;
    productName: string;
    warning: string;
  }>;
}
