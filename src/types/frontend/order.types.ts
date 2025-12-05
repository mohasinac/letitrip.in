/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/order.types
 * @description This file contains TypeScript type definitions for order
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Subtotal */
  subtotal: number;
  /** Discount */
  discount: number;
  /** Tax */
  tax: number;
  /** Total */
  total: number;

  // Formatted
  formattedPrice: string; // "₹1,999"
  /** Formatted Subtotal */
  formattedSubtotal: string;
  /** Formatted Total */
  formattedTotal: string;

  // Backwards compatibility (admin pages)
  variant?: string | null; // Alias for variantName
  shopId?: string | null; // For admin pages
  shopName?: string | null; // For admin pages
}

/**
 * Shipping address for frontend
 */
export interface ShippingAddressFE {
  /** Id */
  id: string;
  /** Full Name */
  fullName: string;
  /** Phone Number */
  phoneNumber: string;
  /** Address Line1 */
  addressLine1: string;
  /** Address Line2 */
  addressLine2: string | null;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Postal Code */
  postalCode: string;
  /** Country */
  country: string;
  /** Is Default */
  isDefault: boolean;

  // Formatted
  formattedAddress: string; // Full address as single string
  shortAddress: string; // City, State

  // Backwards compatibility (admin pages)
  name?: string; // Alias for fullName
  phone?: string; // Alias for phoneNumber
  line1?: string; // Alias for addressLine1
  line2?: string | null; // Alias for addressLine2
  pincode?: string; // Alias for postalCode
}

/**
 * Order entity for frontend (UI-optimized)
 */
export interface OrderFE {
  /** Id */
  id: string;
  /** Order Number */
  orderNumber: string;

  // User
  /** User Id */
  userId: string;
  /** User Email */
  userEmail: string;
  /** User Name */
  userName: string;

  // Shop/Seller
  /** Shop Id */
  shopId: string | null;
  /** Shop Name */
  shopName: string | null;
  /** Seller Id */
  sellerId: string | null;

  // Items
  /** Items */
  items: OrderItemFE[];
  /** Item Count */
  itemCount: number;

  // Pricing
  /** Subtotal */
  subtotal: number;
  /** Discount */
  discount: number;
  /** Tax */
  tax: number;
  /** Shipping Cost */
  shippingCost: number;
  /** Total */
  total: number;

  // Formatted pricing
  formattedSubtotal: string; // "₹4,500"
  /** Formatted Discount */
  formattedDiscount: string;
  /** Formatted Tax */
  formattedTax: string;
  /** Formatted Shipping */
  formattedShipping: string;
  /** Formatted Total */
  formattedTotal: string;

  // Coupon
  /** Coupon Id */
  couponId: string | null;
  /** Coupon Code */
  couponCode: string | null;
  /** Coupon Discount */
  couponDiscount: number;
  /** Formatted Coupon Discount */
  formattedCouponDiscount: string;
  /** Has Coupon */
  hasCoupon: boolean;

  // Payment
  /** Payment Method */
  paymentMethod: PaymentMethod;
  /** Payment Status */
  paymentStatus: PaymentStatus;
  /** Payment Id */
  paymentId: string | null;
  /** Payment Gateway */
  paymentGateway: string | null;
  /** Paid At */
  paidAt: Date | null;

  // Payment states
  /** Is Paid */
  isPaid: boolean;
  /** Is Pending */
  isPending: boolean;
  /** Is Failed */
  isFailed: boolean;
  /** Is Refunded */
  isRefunded: boolean;

  // Shipping
  /** Shipping Method */
  shippingMethod: ShippingMethod;
  /** Shipping Address */
  shippingAddress: ShippingAddressFE;
  /** Tracking Number */
  trackingNumber: string | null;
  /** Estimated Delivery */
  estimatedDelivery: Date | null;
  /** Delivered At */
  deliveredAt: Date | null;

  // Shipping states
  /** Has Tracking */
  hasTracking: boolean;
  /** Is Delivered */
  isDelivered: boolean;

  // Status
  /** Status */
  status: OrderStatus;
  /** Cancelled At */
  cancelledAt: Date | null;
  /** Cancel Reason */
  cancelReason: string | null;
  /** Refund Amount */
  refundAmount: number | null;
  /** Refunded At */
  refundedAt: Date | null;

  // Status states
  /** Is Pending Order */
  isPendingOrder: boolean;
  /** Is Confirmed */
  isConfirmed: boolean;
  /** Is Processing */
  isProcessing: boolean;
  /** Is Shipped */
  isShipped: boolean;
  /** Is Cancelled */
  isCancelled: boolean;
  /** Can Cancel */
  canCancel: boolean;
  /** Can Track */
  canTrack: boolean;

  // Notes
  /** Customer Notes */
  customerNotes: string | null;
  /** Admin Notes */
  adminNotes: string | null;

  // Timestamps
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // Formatted dates
  orderDate: string; // "Nov 13, 2025"
  orderTime: string; // "2:30 PM"
  estimatedDeliveryDisplay: string; // "Expected by Nov 20"
  deliveryStatus: string; // "Delivered on Nov 18" or "In transit"

  // Progress
  progressPercentage: number; // 0-100
  /** Progress Steps */
  progressSteps: OrderProgressStep[];
  /** Current Step */
  currentStep: number;

  // Badges
  badges: string[]; // ["Express", "COD", "Cancelled", etc.]

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;

  // Backwards compatibility (admin pages)
  customerId?: string; // Use userId
  billingAddress?: ShippingAddressFE | null; // Admin pages may need this
  shippingProvider?: string | null; // For shipment display
  internalNotes?: string | null; // Alias for adminNotes
  shipping?: number; // Alias for shippingCost
}

/**
 * Order progress step
 */
export interface OrderProgressStep {
  /** Label */
  label: string;
  /** Status */
  status: "completed" | "current" | "pending";
  /** Date */
  date: Date | null;
  /** Description */
  description: string;
}

/**
 * Order card for lists (minimal fields)
 */
export interface OrderCardFE {
  /** Id */
  id: string;
  /** Order Number */
  orderNumber: string;
  /** Shop Name */
  shopName: string | null;
  /** Item Count */
  itemCount: number;
  /** Total */
  total: number;
  /** Formatted Total */
  formattedTotal: string;
  /** Status */
  status: OrderStatus;
  /** Payment Status */
  paymentStatus: PaymentStatus;
  /** Order Date */
  orderDate: string;
  /** Badges */
  badges: string[];
  /** Is Paid */
  isPaid: boolean;
  /** Can Cancel */
  canCancel: boolean;

  // Backwards compatibility (admin pages)
  /** Shipping Address */
  shippingAddress?: {
    /** Name */
    name: string;
    /** Phone */
    phone: string;
  };
  createdAt?: string; // Alias for orderDate
  items?: any[]; // For item count display
  paymentMethod?: string; // For display
}

/**
 * Order filters for frontend
 */
export interface OrderFiltersFE {
  /** Status */
  status?: OrderStatus[];
  /** Payment Status */
  paymentStatus?: PaymentStatus[];
  /** Payment Method */
  paymentMethod?: PaymentMethod[];
  /** Search */
  search?: string;
  /** Price Range */
  priceRange?: {
    /** Min */
    min: number | null;
    /** Max */
    max: number | null;
  };
  /** Date Range */
  dateRange?: {
    /** From */
    from: Date | null;
    /** To */
    to: Date | null;
  };
  /** Sort By */
  sortBy?: "orderNumber" | "createdAt" | "total" | "status";
  /** Sort Order */
  sortOrder?: "asc" | "desc";
}

/**
 * Order form data (for creating orders)
 */
export interface OrderFormFE {
  /** Items */
  items: Array<{
    /** Product Id */
    productId: string;
    /** Quantity */
    quantity: number;
    /** Variant Id */
    variantId?: string;
  }>;
  /** Shipping Address */
  shippingAddress: {
    /** Name */
    name: string;
    /** Phone */
    phone: string;
    /** Line1 */
    line1: string;
    /** Line2 */
    line2?: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** Pincode */
    pincode: string;
    /** Country */
    country: string;
  };
  /** Billing Address */
  billingAddress?: {
    /** Name */
    name: string;
    /** Phone */
    phone: string;
    /** Line1 */
    line1: string;
    /** Line2 */
    line2?: string;
    /** City */
    city: string;
    /** State */
    state: string;
    /** Pincode */
    pincode: string;
    /** Country */
    country: string;
  };
  /** Payment Method */
  paymentMethod: string;
  /** Coupon Code */
  couponCode?: string;
  /** Customer Notes */
  customerNotes?: string;
}

/**
 * Order stats for dashboard
 */
export interface OrderStatsFE {
  /** Total Orders */
  totalOrders: number;
  /** Pending Orders */
  pendingOrders: number;
  /** Completed Orders */
  completedOrders: number;
  /** Cancelled Orders */
  cancelledOrders: number;
  /** Total Revenue */
  totalRevenue: number;
  /** Formatted Revenue */
  formattedRevenue: string;
  /** Average Order Value */
  averageOrderValue: number;
  /** Formatted Average Order Value */
  formattedAverageOrderValue: string;
  /** Orders Today */
  ordersToday: number;
  /** Orders This Week */
  ordersThisWeek: number;
  /** Orders This Month */
  ordersThisMonth: number;
  growthRate: string; // "+12% from last month"
}

/**
 * Create order form data
 */
export interface CreateOrderFormFE {
  /** Items */
  items: Array<{
    /** Product Id */
    productId: string;
    /** Variant Id */
    variantId?: string;
    /** Quantity */
    quantity: number;
  }>;
  /** Shipping Address Id */
  shippingAddressId: string;
  /** Payment Method */
  paymentMethod: PaymentMethod;
  /** Shipping Method */
  shippingMethod: ShippingMethod;
  /** Coupon Code */
  couponCode?: string;
  /** Customer Notes */
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

/**
 * Order Status Colors
 * @constant
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "yellow",
  [OrderStatus.CONFIRMED]: "blue",
  [OrderStatus.PROCESSING]: "purple",
  [OrderStatus.SHIPPED]: "indigo",
  [OrderStatus.DELIVERED]: "green",
  [OrderStatus.CANCELLED]: "red",
  [OrderStatus.REFUNDED]: "orange",
};

/**
 * Payment Status Labels
 * @constant
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PROCESSING]: "Processing",
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
};

/**
 * Payment Status Colors
 * @constant
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "yellow",
  [PaymentStatus.PROCESSING]: "blue",
  [PaymentStatus.COMPLETED]: "green",
  [PaymentStatus.FAILED]: "red",
  [PaymentStatus.REFUNDED]: "orange",
};

/**
 * Payment Method Labels
 * @constant
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CARD]: "Card",
  [PaymentMethod.UPI]: "UPI",
  [PaymentMethod.NET_BANKING]: "Net Banking",
  [PaymentMethod.WALLET]: "Wallet",
  [PaymentMethod.COD]: "Cash on Delivery",
};

/**
 * Shipping Method Labels
 * @constant
 */
export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  [ShippingMethod.STANDARD]: "Standard",
  [ShippingMethod.EXPRESS]: "Express",
  [ShippingMethod.OVERNIGHT]: "Overnight",
  [ShippingMethod.PICKUP]: "Store Pickup",
};
