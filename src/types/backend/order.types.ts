/**
 * @fileoverview Type Definitions
 * @module src/types/backend/order.types
 * @description This file contains TypeScript type definitions for order
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * BACKEND ORDER TYPES
 *
 * These types match the API response structure and Firestore documents exactly.
 * Used for data received from backend services.
 */

import { Timestamp } from "firebase/firestore";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
} from "../shared/common.types";

/**
 * Order item
 */
export interface OrderItemBE {
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
}

/**
 * Shipping address
 */
export interface ShippingAddressBE {
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
}

/**
 * Order entity from backend/Firestore
 */
export interface OrderBE {
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
  items: OrderItemBE[];
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

  // Coupon
  /** Coupon Id */
  couponId: string | null;
  /** Coupon Code */
  couponCode: string | null;
  /** Coupon Discount */
  couponDiscount: number;

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
  paidAt: Timestamp | null;

  // Shipping
  /** Shipping Method */
  shippingMethod: ShippingMethod;
  /** Shipping Address */
  shippingAddress: ShippingAddressBE;
  billingAddress?: ShippingAddressBE | null; // Optional billing address
  shippingProvider?: string | null; // Provider name (India Post, Delhivery, etc.)
  /** Tracking Number */
  trackingNumber: string | null;
  /** Estimated Delivery */
  estimatedDelivery: Timestamp | null;
  /** Delivered At */
  deliveredAt: Timestamp | null;

  // Status
  /** Status */
  status: OrderStatus;
  /** Cancelled At */
  cancelledAt: Timestamp | null;
  /** Cancel Reason */
  cancelReason: string | null;
  /** Refund Amount */
  refundAmount: number | null;
  /** Refunded At */
  refundedAt: Timestamp | null;

  // Notes
  /** Customer Notes */
  customerNotes: string | null;
  /** Admin Notes */
  adminNotes: string | null;

  // Timestamps
  /** Created At */
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;

  // Metadata
  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Order list item (minimal fields)
 */
export interface OrderListItemBE {
  /** Id */
  id: string;
  /** Order Number */
  orderNumber: string;
  /** User Id */
  userId: string;
  /** User Email */
  userEmail: string;
  /** Shop Name */
  shopName: string | null;
  /** Item Count */
  itemCount: number;
  /** Total */
  total: number;
  /** Status */
  status: OrderStatus;
  /** Payment Status */
  paymentStatus: PaymentStatus;
  /** Created At */
  createdAt: Timestamp;

  // Optional fields for admin views
  /** Shipping Address */
  shippingAddress?: ShippingAddressBE;
  /** Payment Method */
  paymentMethod?: PaymentMethod;
}

/**
 * Create order request
 */
export interface CreateOrderRequestBE {
  /** User Id */
  userId: string;
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
 * Update payment status request
 */
export interface UpdatePaymentStatusBE {
  /** Payment Status */
  paymentStatus: PaymentStatus;
  /** Payment Id */
  paymentId?: string;
  /** Payment Gateway */
  paymentGateway?: string;
}

/**
 * Update order status request
 */
export interface UpdateOrderStatusRequestBE {
  /** Status */
  status: string;
  /** Notes */
  notes?: string;
}

/**
 * Create shipment request
 */
export interface CreateShipmentRequestBE {
  /** Tracking Number */
  trackingNumber: string;
  /** Carrier */
  carrier: string;
  eta?: string; // ISO date
}

/**
 * Cancel order request
 */
export interface CancelOrderRequestBE {
  /** Reason */
  reason: string;
}

/**
 * Order filters for list queries
 */
export interface OrderFiltersBE {
  /** User Id */
  userId?: string;
  /** Shop Id */
  shopId?: string;
  /** Seller Id */
  sellerId?: string;
  /** Status */
  status?: OrderStatus | OrderStatus[];
  /** Payment Status */
  paymentStatus?: PaymentStatus | PaymentStatus[];
  /** Payment Method */
  paymentMethod?: PaymentMethod | PaymentMethod[];
  search?: string; // Search in orderNumber, userEmail
  /** Min Total */
  minTotal?: number;
  /** Max Total */
  maxTotal?: number;
  createdAfter?: string; // ISO date
  createdBefore?: string; // ISO date
}

/**
 * Order list response
 */
export interface OrderListResponseBE {
  /** Orders */
  orders: OrderListItemBE[];
  /** Pagination */
  pagination: {
    /** Page */
    page: number;
    /** Limit */
    limit: number;
    /** Total Pages */
    totalPages: number;
    /** Total Items */
    totalItems: number;
    /** Has Next Page */
    hasNextPage: boolean;
    /** Has Prev Page */
    hasPrevPage: boolean;
  };
}

/**
 * Order detail response
 */
export interface OrderDetailResponseBE {
  /** Order */
  order: OrderBE;
}

/**
 * Order stats response
 */
export interface OrderStatsResponseBE {
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
  /** Average Order Value */
  averageOrderValue: number;
  /** Orders Today */
  ordersToday: number;
  /** Orders This Week */
  ordersThisWeek: number;
  /** Orders This Month */
  ordersThisMonth: number;
}

/**
 * Bulk order operation request
 */
export interface BulkOrderOperationBE {
  /** Order Ids */
  orderIds: string[];
  /** Operation */
  operation: "confirm" | "ship" | "deliver" | "cancel";
  /** Tracking Number */
  trackingNumber?: string;
  /** Cancel Reason */
  cancelReason?: string;
}

/**
 * Bulk order operation response
 */
export interface BulkOrderOperationResponseBE {
  /** Success */
  success: number;
  /** Failed */
  failed: number;
  /** Errors */
  errors: Array<{
    /** Order Id */
    orderId: string;
    /** Error */
    error: string;
  }>;
}
