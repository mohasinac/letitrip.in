/**
 * FRONTEND ORDER TYPES
 *
 * These types are optimized for UI components and include computed fields,
 * formatted data, and UI-specific properties.
 */

import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
} from "../shared/common.types";

/**
 * Order item for frontend
 */
export interface OrderItemFE {
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
  subtotal: number;
  discount: number;
  tax: number;
  total: number;

  // Formatted
  formattedPrice: string; // "₹1,999"
  formattedSubtotal: string;
  formattedTotal: string;
}

/**
 * Shipping address for frontend
 */
export interface ShippingAddressFE {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;

  // Formatted
  formattedAddress: string; // Full address as single string
  shortAddress: string; // City, State
}

/**
 * Order entity for frontend (UI-optimized)
 */
export interface OrderFE {
  id: string;
  orderNumber: string;

  // User
  userId: string;
  userEmail: string;
  userName: string;

  // Shop/Seller
  shopId: string | null;
  shopName: string | null;
  sellerId: string | null;

  // Items
  items: OrderItemFE[];
  itemCount: number;

  // Pricing
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;

  // Formatted pricing
  formattedSubtotal: string; // "₹4,500"
  formattedDiscount: string;
  formattedTax: string;
  formattedShipping: string;
  formattedTotal: string;

  // Coupon
  couponId: string | null;
  couponCode: string | null;
  couponDiscount: number;
  formattedCouponDiscount: string;
  hasCoupon: boolean;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  paymentGateway: string | null;
  paidAt: Date | null;

  // Payment states
  isPaid: boolean;
  isPending: boolean;
  isFailed: boolean;
  isRefunded: boolean;

  // Shipping
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddressFE;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;

  // Shipping states
  hasTracking: boolean;
  isDelivered: boolean;

  // Status
  status: OrderStatus;
  cancelledAt: Date | null;
  cancelReason: string | null;
  refundAmount: number | null;
  refundedAt: Date | null;

  // Status states
  isPendingOrder: boolean;
  isConfirmed: boolean;
  isProcessing: boolean;
  isShipped: boolean;
  isCancelled: boolean;
  canCancel: boolean;
  canTrack: boolean;

  // Notes
  customerNotes: string | null;
  adminNotes: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Formatted dates
  orderDate: string; // "Nov 13, 2025"
  orderTime: string; // "2:30 PM"
  estimatedDeliveryDisplay: string; // "Expected by Nov 20"
  deliveryStatus: string; // "Delivered on Nov 18" or "In transit"

  // Progress
  progressPercentage: number; // 0-100
  progressSteps: OrderProgressStep[];
  currentStep: number;

  // Badges
  badges: string[]; // ["Express", "COD", "Cancelled", etc.]

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Order progress step
 */
export interface OrderProgressStep {
  label: string;
  status: "completed" | "current" | "pending";
  date: Date | null;
  description: string;
}

/**
 * Order card for lists (minimal fields)
 */
export interface OrderCardFE {
  id: string;
  orderNumber: string;
  shopName: string | null;
  itemCount: number;
  total: number;
  formattedTotal: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  badges: string[];
  isPaid: boolean;
  canCancel: boolean;
}

/**
 * Order filters for frontend
 */
export interface OrderFiltersFE {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  paymentMethod?: PaymentMethod[];
  search?: string;
  priceRange?: {
    min: number | null;
    max: number | null;
  };
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  sortBy?: "orderNumber" | "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
}

/**
 * Order form data (for creating orders)
 */
export interface OrderFormFE {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  couponCode?: string;
  customerNotes?: string;
}

/**
 * Order stats for dashboard
 */
export interface OrderStatsFE {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  formattedRevenue: string;
  averageOrderValue: number;
  formattedAverageOrderValue: string;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  growthRate: string; // "+12% from last month"
}

/**
 * Create order form data
 */
export interface CreateOrderFormFE {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  couponCode?: string;
  customerNotes?: string;
}

/**
 * UI Constants
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
  [OrderStatus.REFUNDED]: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "yellow",
  [OrderStatus.CONFIRMED]: "blue",
  [OrderStatus.PROCESSING]: "purple",
  [OrderStatus.SHIPPED]: "indigo",
  [OrderStatus.DELIVERED]: "green",
  [OrderStatus.CANCELLED]: "red",
  [OrderStatus.REFUNDED]: "orange",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PROCESSING]: "Processing",
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "yellow",
  [PaymentStatus.PROCESSING]: "blue",
  [PaymentStatus.COMPLETED]: "green",
  [PaymentStatus.FAILED]: "red",
  [PaymentStatus.REFUNDED]: "orange",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CARD]: "Card",
  [PaymentMethod.UPI]: "UPI",
  [PaymentMethod.NET_BANKING]: "Net Banking",
  [PaymentMethod.WALLET]: "Wallet",
  [PaymentMethod.COD]: "Cash on Delivery",
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  [ShippingMethod.STANDARD]: "Standard",
  [ShippingMethod.EXPRESS]: "Express",
  [ShippingMethod.OVERNIGHT]: "Overnight",
  [ShippingMethod.PICKUP]: "Store Pickup",
};
