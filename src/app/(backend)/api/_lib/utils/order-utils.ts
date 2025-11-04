import { CartItem } from "@/lib/contexts/CartContext";
import { OrderItem, OrderSummary } from "@/types/shared/order";

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
