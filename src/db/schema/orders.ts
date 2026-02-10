/**
 * Orders Collection Schema
 *
 * Firebase Firestore collection for product orders (renamed from bookings)
 */

import { generateOrderId, type GenerateOrderIdInput } from "@/utils";

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface OrderDocument {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paymentMethod?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  orderDate: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: RefundStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type RefundStatus = "pending" | "processing" | "completed" | "rejected";

export const ORDER_COLLECTION = "orders" as const;

// ============================================
// 2. INDEXED FIELDS (Must match firestore.indexes.json)
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * SYNC REQUIRED: Update firestore.indexes.json when changing these
 * Deploy: firebase deploy --only firestore:indexes
 */
export const ORDER_INDEXED_FIELDS = [
  "userId", // For user's orders
  "productId", // For product's orders
  "status", // For filtering by status
  "paymentStatus", // For payment queries
  "orderDate", // For date-based sorting
  "createdAt", // For sorting by creation date
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) orders
 * products (1) ----< (N) orders
 *
 * Foreign Keys:
 * - orders/{id}.userId references users/{uid}
 * - orders/{id}.productId references products/{id}
 *
 * CASCADE BEHAVIOR:
 * When user is deleted:
 * 1. Keep orders for historical records
 * 2. Anonymize user data (set userName to "Deleted User")
 *
 * When product is deleted:
 * 1. Cancel all pending orders
 * 2. Keep orders for records and seller reputation
 * 3. Set pending orders status to 'cancelled'
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default order data
 */
export const DEFAULT_ORDER_DATA: Partial<OrderDocument> = {
  status: "pending",
  paymentStatus: "pending",
  currency: "INR",
  quantity: 1,
};

/**
 * Fields that are publicly readable (by order owner)
 */
export const ORDER_PUBLIC_FIELDS = [
  "id",
  "productId",
  "productTitle",
  "quantity",
  "unitPrice",
  "totalPrice",
  "currency",
  "status",
  "paymentStatus",
  "shippingAddress",
  "trackingNumber",
  "notes",
  "orderDate",
  "shippingDate",
  "deliveryDate",
  "createdAt",
] as const;

/**
 * Fields that users can update
 */
export const ORDER_UPDATABLE_FIELDS = ["notes", "shippingAddress"] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new orders
 */
export type OrderCreateInput = Omit<
  OrderDocument,
  "id" | "createdAt" | "updatedAt" | "orderDate"
>;

/**
 * Type for updating orders (user updates)
 */
export type OrderUpdateInput = Partial<
  Pick<OrderDocument, (typeof ORDER_UPDATABLE_FIELDS)[number]>
>;

/**
 * Type for admin order updates
 */
export type OrderAdminUpdateInput = Partial<
  Omit<OrderDocument, "id" | "createdAt">
>;

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const orderQueryHelpers = {
  byUser: (userId: string) => ["userId", "==", userId] as const,
  byProduct: (productId: string) => ["productId", "==", productId] as const,
  byStatus: (status: OrderStatus) => ["status", "==", status] as const,
  byPaymentStatus: (status: PaymentStatus) =>
    ["paymentStatus", "==", status] as const,
  confirmed: () => ["status", "==", "confirmed"] as const,
  pending: () => ["status", "==", "pending"] as const,
  shipped: () => ["status", "==", "shipped"] as const,
  delivered: () => ["status", "==", "delivered"] as const,
  paid: () => ["paymentStatus", "==", "paid"] as const,
  recentOrders: (date: Date) => ["orderDate", ">=", date] as const,
} as const;

// ============================================
// 7. ID GENERATION HELPER
// ============================================

/**
 * Generate SEO-friendly order ID
 * Pattern: order-{product-count}-{date}-{random-number}
 *
 * @param productCount - Number of items in order
 * @param date - Order date (optional, defaults to now)
 * @returns SEO-friendly order ID
 *
 * Example: createOrderId(3) → "order-3-20260207-a7b2c9"
 */
export function createOrderId(productCount: number, date?: Date): string {
  return generateOrderId({ productCount, date });
}
