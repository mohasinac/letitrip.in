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
}

/**
 * Shipping address
 */
export interface ShippingAddressBE {
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
}

/**
 * Order entity from backend/Firestore
 */
export interface OrderBE {
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
  items: OrderItemBE[];
  itemCount: number;

  // Pricing
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;

  // Coupon
  couponId: string | null;
  couponCode: string | null;
  couponDiscount: number;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  paymentGateway: string | null;
  paidAt: Timestamp | null;

  // Shipping
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddressBE;
  trackingNumber: string | null;
  estimatedDelivery: Timestamp | null;
  deliveredAt: Timestamp | null;

  // Status
  status: OrderStatus;
  cancelledAt: Timestamp | null;
  cancelReason: string | null;
  refundAmount: number | null;
  refundedAt: Timestamp | null;

  // Notes
  customerNotes: string | null;
  adminNotes: string | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Order list item (minimal fields)
 */
export interface OrderListItemBE {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  shopName: string | null;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Timestamp;
}

/**
 * Create order request
 */
export interface CreateOrderRequestBE {
  userId: string;
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
 * Update payment status request
 */
export interface UpdatePaymentStatusBE {
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentGateway?: string;
}

/**
 * Update order status request
 */
export interface UpdateOrderStatusRequestBE {
  status: string;
  notes?: string;
}

/**
 * Create shipment request
 */
export interface CreateShipmentRequestBE {
  trackingNumber: string;
  carrier: string;
  eta?: string; // ISO date
}

/**
 * Cancel order request
 */
export interface CancelOrderRequestBE {
  reason: string;
}

/**
 * Order filters for list queries
 */
export interface OrderFiltersBE {
  userId?: string;
  shopId?: string;
  sellerId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  search?: string; // Search in orderNumber, userEmail
  minTotal?: number;
  maxTotal?: number;
  createdAfter?: string; // ISO date
  createdBefore?: string; // ISO date
}

/**
 * Order list response
 */
export interface OrderListResponseBE {
  orders: OrderListItemBE[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Order detail response
 */
export interface OrderDetailResponseBE {
  order: OrderBE;
}

/**
 * Order stats response
 */
export interface OrderStatsResponseBE {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
}

/**
 * Bulk order operation request
 */
export interface BulkOrderOperationBE {
  orderIds: string[];
  operation: "confirm" | "ship" | "deliver" | "cancel";
  trackingNumber?: string;
  cancelReason?: string;
}

/**
 * Bulk order operation response
 */
export interface BulkOrderOperationResponseBE {
  success: number;
  failed: number;
  errors: Array<{
    orderId: string;
    error: string;
  }>;
}
