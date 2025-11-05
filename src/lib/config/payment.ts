/**
 * Shared Payment Configuration
 * Client-safe payment constants (no secrets)
 */

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  RAZORPAY: "razorpay",
  PAYPAL: "paypal",
  COD: "cod",
  UPI: "upi",
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * Razorpay Frontend Configuration
 * (No secrets - safe for client-side)
 */
export const RAZORPAY_OPTIONS = {
  theme: {
    color: "#3B82F6",
  },
  modal: {
    backdropclose: false,
    escape: false,
    handleback: false,
    confirm_close: true,
  },
} as const;

/**
 * Supported Currencies
 */
export const SUPPORTED_CURRENCIES = ["INR", "USD"] as const;
export const DEFAULT_CURRENCY = "INR";

export type Currency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Payment Method Display Info
 */
export function getPaymentMethodInfo(method: string): {
  label: string;
  icon: string;
  description: string;
} {
  const methodMap: Record<string, { label: string; icon: string; description: string }> = {
    razorpay: {
      label: "Card / UPI / Wallet",
      icon: "💳",
      description: "Pay securely with card, UPI, or wallet",
    },
    paypal: {
      label: "PayPal",
      icon: "🅿️",
      description: "Pay with your PayPal account",
    },
    cod: {
      label: "Cash on Delivery",
      icon: "💵",
      description: "Pay when you receive your order",
    },
    upi: {
      label: "UPI",
      icon: "📱",
      description: "Pay using UPI apps like Google Pay, PhonePe",
    },
  };
  
  return methodMap[method] || {
    label: method,
    icon: "💰",
    description: "Payment method",
  };
}

/**
 * Payment Status Display Info
 */
export function getPaymentStatusInfo(status: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: {
      label: "Pending",
      color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    processing: {
      label: "Processing",
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    completed: {
      label: "Completed",
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    failed: {
      label: "Failed",
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    cancelled: {
      label: "Cancelled",
      color: "text-gray-700 dark:text-gray-300",
      bgColor: "bg-gray-100 dark:bg-gray-900/20",
    },
    refunded: {
      label: "Refunded",
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  };
  
  return statusMap[status] || {
    label: status,
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  };
}

/**
 * COD Limits
 */
export const COD_CONFIG = {
  MAX_AMOUNT: 50000, // Maximum amount for COD in INR
  MIN_AMOUNT: 1, // Minimum amount for COD
  CHARGE: 50, // Additional COD handling charge
} as const;

/**
 * Check if COD is available
 */
export function isCODAvailable(amount: number): boolean {
  return amount >= COD_CONFIG.MIN_AMOUNT && amount <= COD_CONFIG.MAX_AMOUNT;
}

/**
 * Calculate total with COD charge
 */
export function calculateTotalWithCOD(amount: number): number {
  return amount + COD_CONFIG.CHARGE;
}

/**
 * Currency Symbols
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
} as const;

/**
 * Format amount with currency
 */
export function formatAmount(amount: number, currency: Currency = "INR"): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  
  if (currency === "INR") {
    return `${symbol}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
