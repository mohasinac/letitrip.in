/**
 * Shared Shipping Configuration
 * Client-safe shipping constants (no secrets)
 */

/**
 * Shipping Status
 */
export const SHIPPING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  RTO: "rto", // Return to Origin
  CANCELLED: "cancelled",
} as const;

export type ShippingStatus = typeof SHIPPING_STATUS[keyof typeof SHIPPING_STATUS];

/**
 * Courier Partners
 */
export const COURIER_PARTNERS = [
  "BlueDart",
  "Delhivery",
  "DTDC",
  "Ecom Express",
  "FedEx",
  "Shadowfax",
  "Xpressbees",
] as const;

export type CourierPartner = typeof COURIER_PARTNERS[number];

/**
 * Shipping Status Display Info
 */
export function getShippingStatusInfo(status: string): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    pending: {
      label: "Pending",
      color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      icon: "⏳",
    },
    confirmed: {
      label: "Confirmed",
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      icon: "✓",
    },
    picked_up: {
      label: "Picked Up",
      color: "text-indigo-700 dark:text-indigo-300",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      icon: "📦",
    },
    in_transit: {
      label: "In Transit",
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      icon: "🚚",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "text-cyan-700 dark:text-cyan-300",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      icon: "🏃",
    },
    delivered: {
      label: "Delivered",
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      icon: "✅",
    },
    rto: {
      label: "Return to Origin",
      color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      icon: "↩️",
    },
    cancelled: {
      label: "Cancelled",
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      icon: "❌",
    },
  };
  
  return statusMap[status] || {
    label: status,
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    icon: "📋",
  };
}

/**
 * Shipping Configuration
 */
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 1000, // Free shipping above this amount (INR)
  DEFAULT_CHARGE: 50, // Default shipping charge (INR)
  WEIGHT_UNIT: "kg",
  DIMENSION_UNIT: "cm",
  DEFAULT_DIMENSIONS: {
    length: 20,
    breadth: 15,
    height: 10,
  },
  MIN_WEIGHT: 0.1, // Minimum weight in kg
  ESTIMATED_DELIVERY_DAYS: {
    metro: 2, // Metro cities
    tier1: 3, // Tier 1 cities
    tier2: 4, // Tier 2 cities
    tier3: 5, // Tier 3 cities
    default: 5, // Default estimate
  },
} as const;

/**
 * Check if order is eligible for free shipping
 */
export function isEligibleForFreeShipping(amount: number): boolean {
  return amount >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD;
}

/**
 * Calculate shipping cost
 */
export function calculateShippingCost(amount: number, weight?: number): number {
  if (isEligibleForFreeShipping(amount)) {
    return 0;
  }
  
  // Base charge
  let charge = SHIPPING_CONFIG.DEFAULT_CHARGE;
  
  // Additional charge for heavy items (above 2kg)
  if (weight && weight > 2) {
    const extraWeight = weight - 2;
    charge += Math.ceil(extraWeight) * 10; // ₹10 per kg
  }
  
  return charge;
}

/**
 * Get amount needed for free shipping
 */
export function amountNeededForFreeShipping(currentAmount: number): number {
  const needed = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - currentAmount;
  return Math.max(0, needed);
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDeliveryDate(
  orderDate: Date = new Date(),
  cityTier: 'metro' | 'tier1' | 'tier2' | 'tier3' | 'default' = 'default'
): Date {
  const days = SHIPPING_CONFIG.ESTIMATED_DELIVERY_DAYS[cityTier];
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate;
}

/**
 * Format estimated delivery
 */
export function formatEstimatedDelivery(cityTier: 'metro' | 'tier1' | 'tier2' | 'tier3' | 'default' = 'default'): string {
  const days = SHIPPING_CONFIG.ESTIMATED_DELIVERY_DAYS[cityTier];
  
  if (days === 2) return "Within 2 days";
  if (days <= 3) return "Within 3 days";
  return `Within ${days} days`;
}

/**
 * Get courier partner display name
 */
export function getCourierPartnerInfo(partner: string): {
  name: string;
  logo?: string;
  trackingUrl?: string;
} {
  const partnerMap: Record<string, { name: string; logo?: string; trackingUrl?: string }> = {
    BlueDart: {
      name: "BlueDart",
      trackingUrl: "https://www.bluedart.com/tracking",
    },
    Delhivery: {
      name: "Delhivery",
      trackingUrl: "https://www.delhivery.com/track",
    },
    DTDC: {
      name: "DTDC",
      trackingUrl: "https://www.dtdc.in/tracking.asp",
    },
    "Ecom Express": {
      name: "Ecom Express",
      trackingUrl: "https://ecomexpress.in/tracking/",
    },
    FedEx: {
      name: "FedEx",
      trackingUrl: "https://www.fedex.com/fedextrack/",
    },
    Shadowfax: {
      name: "Shadowfax",
      trackingUrl: "https://www.shadowfax.in/track",
    },
    Xpressbees: {
      name: "Xpressbees",
      trackingUrl: "https://www.xpressbees.com/shipment/tracking",
    },
  };
  
  return partnerMap[partner] || { name: partner };
}

/**
 * Calculate total package weight
 */
export function calculatePackageWeight(items: Array<{ weight?: number; quantity: number }>): number {
  return items.reduce((total, item) => {
    const itemWeight = item.weight || 0.5; // Default 0.5kg if not specified
    return total + itemWeight * item.quantity;
  }, 0);
}

/**
 * Validate shipping address
 */
export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}
