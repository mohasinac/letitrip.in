/**
 * Shared Order Utilities
 * Pure functions for order calculations and formatting
 * Can be used on both client and server
 */

import { CartItem } from "@/lib/contexts/CartContext";
import { OrderItem, OrderSummary } from "@/types/shared/order";

// Core utility functions (moved from backend)

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number

  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Convert cart items to order items
 */
export function cartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    sellerId: item.sellerId,
    sellerName: item.sellerName,
    sku: item.sku,
    slug: item.slug,
  }));
}

/**
 * Calculate order totals
 */
export function calculateOrderTotals(
  items: OrderItem[],
  couponDiscount: number = 0
): OrderSummary {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate shipping (free over ₹1000)
  const shipping = subtotal > 1000 ? 0 : 50;

  // Apply coupon discount
  const discount = Math.min(couponDiscount, subtotal);

  // Calculate tax (18% GST on subtotal - discount)
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.18);

  // Calculate total
  const total = subtotal - discount + shipping + tax;

  return {
    subtotal,
    shipping,
    discount,
    tax,
    total,
  };
}

/**
 * Validate cart items before order creation
 */
export function validateOrderItems(items: OrderItem[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push("Cart is empty");
  }

  items.forEach((item, index) => {
    if (!item.productId) {
      errors.push(`Item ${index + 1}: Missing product ID`);
    }
    if (!item.name) {
      errors.push(`Item ${index + 1}: Missing product name`);
    }
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Invalid quantity`);
    }
    if (item.price <= 0) {
      errors.push(`Item ${index + 1}: Invalid price`);
    }
    // Seller ID is optional - will use default if not provided
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Convert amount for PayPal (INR to USD with 7% fee)
 */
export function convertToUSDWithFee(amountInINR: number, exchangeRate: number = 83): number {
  const amountInUSD = amountInINR / exchangeRate;
  const fee = amountInUSD * 0.07; // 7% PayPal fee
  return Math.ceil((amountInUSD + fee) * 100) / 100; // Round up to 2 decimals
}

/**
 * Get order status display info
 */
export function getOrderStatusInfo(status: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    pending_payment: {
      label: "Pending Payment",
      color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    pending_approval: {
      label: "Pending Approval",
      color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    processing: {
      label: "Processing",
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    shipped: {
      label: "Shipped",
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    in_transit: {
      label: "In Transit",
      color: "text-indigo-700 dark:text-indigo-300",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "text-cyan-700 dark:text-cyan-300",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    },
    delivered: {
      label: "Delivered",
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    cancelled: {
      label: "Cancelled",
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    refunded: {
      label: "Refunded",
      color: "text-gray-700 dark:text-gray-300",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
    },
  };

  return statusMap[status] || {
    label: status,
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  };
}

// Additional client-friendly utilities

/**
 * Format order number for display
 */
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber.replace('ORD-', '#');
}

/**
 * Calculate savings from discount and compare price
 */
export function calculateSavings(
  price: number,
  compareAtPrice?: number,
  discount?: number
): number {
  let savings = 0;
  
  if (compareAtPrice && compareAtPrice > price) {
    savings += compareAtPrice - price;
  }
  
  if (discount) {
    savings += discount;
  }
  
  return savings;
}

/**
 * Calculate percentage saved
 */
export function calculateSavingsPercentage(
  price: number,
  compareAtPrice: number
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Check if order is eligible for free shipping
 */
export function isEligibleForFreeShipping(
  subtotal: number,
  freeShippingThreshold: number = 1000
): boolean {
  return subtotal >= freeShippingThreshold;
}

/**
 * Calculate amount needed for free shipping
 */
export function amountNeededForFreeShipping(
  subtotal: number,
  freeShippingThreshold: number = 1000
): number {
  const needed = freeShippingThreshold - subtotal;
  return needed > 0 ? needed : 0;
}

/**
 * Format order status for UI badge
 */
export function getOrderStatusBadge(status: string): {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  label: string;
} {
  const statusMap: Record<string, { variant: any; label: string }> = {
    pending_payment: { variant: 'warning', label: 'Pending Payment' },
    pending_approval: { variant: 'warning', label: 'Awaiting Approval' },
    processing: { variant: 'info', label: 'Processing' },
    shipped: { variant: 'info', label: 'Shipped' },
    in_transit: { variant: 'info', label: 'In Transit' },
    out_for_delivery: { variant: 'info', label: 'Out for Delivery' },
    delivered: { variant: 'success', label: 'Delivered' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    refunded: { variant: 'default', label: 'Refunded' },
  };
  
  return statusMap[status] || { variant: 'default', label: status };
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: string): boolean {
  const cancellableStatuses = ['pending_payment', 'pending_approval', 'processing'];
  return cancellableStatuses.includes(status);
}

/**
 * Check if order can be returned
 */
export function canReturnOrder(
  status: string,
  deliveryDate: Date,
  returnPeriodDays: number = 7
): boolean {
  if (status !== 'delivered') return false;
  
  const now = new Date();
  const daysSinceDelivery = Math.floor(
    (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceDelivery <= returnPeriodDays;
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDeliveryDate(
  orderDate: Date,
  estimatedDays: number = 5
): Date {
  const delivery = new Date(orderDate);
  delivery.setDate(delivery.getDate() + estimatedDays);
  return delivery;
}

/**
 * Format price in INR
 */
export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Calculate order progress (0-100%)
 */
export function getOrderProgress(status: string): number {
  const progressMap: Record<string, number> = {
    pending_payment: 10,
    pending_approval: 20,
    processing: 40,
    shipped: 60,
    in_transit: 70,
    out_for_delivery: 90,
    delivered: 100,
    cancelled: 0,
    refunded: 0,
  };
  
  return progressMap[status] || 0;
}

/**
 * Group order items by seller
 */
export function groupItemsBySeller<T extends { sellerId?: string; sellerName?: string }>(
  items: T[]
): Record<string, { seller: { id: string; name: string }; items: T[] }> {
  const grouped: Record<string, { seller: { id: string; name: string }; items: T[] }> = {};
  
  items.forEach((item) => {
    const sellerId = item.sellerId || 'default';
    const sellerName = item.sellerName || 'JustForView';
    
    if (!grouped[sellerId]) {
      grouped[sellerId] = {
        seller: { id: sellerId, name: sellerName },
        items: [],
      };
    }
    
    grouped[sellerId].items.push(item);
  });
  
  return grouped;
}

/**
 * Calculate order weight (for shipping)
 */
export function calculateTotalWeight<T extends { weight?: number; quantity: number }>(
  items: T[]
): number {
  return items.reduce((total, item) => {
    const itemWeight = item.weight || 0.5; // Default 0.5kg if not specified
    return total + itemWeight * item.quantity;
  }, 0);
}

/**
 * Check if COD is available for order
 */
export function isCODAvailable(
  total: number,
  maxCODAmount: number = 50000
): boolean {
  return total <= maxCODAmount;
}

/**
 * Validate coupon applicability (basic check)
 */
export function canApplyCoupon(
  subtotal: number,
  minOrderAmount?: number,
  maxDiscount?: number
): { canApply: boolean; reason?: string } {
  if (minOrderAmount && subtotal < minOrderAmount) {
    return {
      canApply: false,
      reason: `Minimum order amount of ${formatPrice(minOrderAmount)} required`,
    };
  }
  
  return { canApply: true };
}
