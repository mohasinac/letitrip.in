/**
 * Status Enums
 *
 * Centralized status constants for orders, auctions, products, and other entities.
 * Use these enums for consistency across the application.
 *
 * @example
 * ```tsx
 * import { ORDER_STATUS, AUCTION_STATUS } from '@/constants/statuses';
 *
 * if (order.status === ORDER_STATUS.DELIVERED) {
 *   // Show review prompt
 * }
 * ```
 */

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  RETURNED: "returned",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/**
 * Order status labels for display
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.REFUNDED]: "Refunded",
  [ORDER_STATUS.RETURNED]: "Returned",
};

/**
 * Auction Status
 */
export const AUCTION_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  ENDING_SOON: "ending_soon",
  ENDED: "ended",
  CANCELLED: "cancelled",
  SUSPENDED: "suspended",
} as const;

export type AuctionStatus =
  (typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS];

/**
 * Auction status labels for display
 */
export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  [AUCTION_STATUS.DRAFT]: "Draft",
  [AUCTION_STATUS.SCHEDULED]: "Scheduled",
  [AUCTION_STATUS.ACTIVE]: "Active",
  [AUCTION_STATUS.ENDING_SOON]: "Ending Soon",
  [AUCTION_STATUS.ENDED]: "Ended",
  [AUCTION_STATUS.CANCELLED]: "Cancelled",
  [AUCTION_STATUS.SUSPENDED]: "Suspended",
};

/**
 * Product Status
 */
export const PRODUCT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
  SUSPENDED: "suspended",
} as const;

export type ProductStatus =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

/**
 * Product status labels for display
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [PRODUCT_STATUS.DRAFT]: "Draft",
  [PRODUCT_STATUS.ACTIVE]: "Active",
  [PRODUCT_STATUS.OUT_OF_STOCK]: "Out of Stock",
  [PRODUCT_STATUS.DISCONTINUED]: "Discontinued",
  [PRODUCT_STATUS.SUSPENDED]: "Suspended",
};

/**
 * Shop Status
 */
export const SHOP_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  CLOSED: "closed",
} as const;

export type ShopStatus = (typeof SHOP_STATUS)[keyof typeof SHOP_STATUS];

/**
 * Shop status labels for display
 */
export const SHOP_STATUS_LABELS: Record<ShopStatus, string> = {
  [SHOP_STATUS.PENDING]: "Pending Approval",
  [SHOP_STATUS.ACTIVE]: "Active",
  [SHOP_STATUS.SUSPENDED]: "Suspended",
  [SHOP_STATUS.CLOSED]: "Closed",
};

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * Payment status labels for display
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "Pending",
  [PAYMENT_STATUS.AUTHORIZED]: "Authorized",
  [PAYMENT_STATUS.CAPTURED]: "Paid",
  [PAYMENT_STATUS.FAILED]: "Failed",
  [PAYMENT_STATUS.REFUNDED]: "Refunded",
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: "Partially Refunded",
};

/**
 * User Role
 */
export const USER_ROLE = {
  USER: "user",
  SELLER: "seller",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/**
 * User role labels for display
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLE.USER]: "User",
  [USER_ROLE.SELLER]: "Seller",
  [USER_ROLE.ADMIN]: "Admin",
  [USER_ROLE.SUPER_ADMIN]: "Super Admin",
};

/**
 * Verification Status
 */
export const VERIFICATION_STATUS = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

/**
 * Verification status labels for display
 */
export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  [VERIFICATION_STATUS.UNVERIFIED]: "Unverified",
  [VERIFICATION_STATUS.PENDING]: "Pending Verification",
  [VERIFICATION_STATUS.VERIFIED]: "Verified",
  [VERIFICATION_STATUS.REJECTED]: "Rejected",
};

/**
 * Return/Refund Status
 */
export const RETURN_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  IN_TRANSIT: "in_transit",
  RECEIVED: "received",
  REFUNDED: "refunded",
} as const;

export type ReturnStatus = (typeof RETURN_STATUS)[keyof typeof RETURN_STATUS];

/**
 * Return status labels for display
 */
export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  [RETURN_STATUS.REQUESTED]: "Requested",
  [RETURN_STATUS.APPROVED]: "Approved",
  [RETURN_STATUS.REJECTED]: "Rejected",
  [RETURN_STATUS.IN_TRANSIT]: "In Transit",
  [RETURN_STATUS.RECEIVED]: "Received",
  [RETURN_STATUS.REFUNDED]: "Refunded",
};

/**
 * Helper to get status variant (for UI styling)
 */
export function getStatusVariant(
  status: string,
): "default" | "success" | "warning" | "error" | "info" {
  const successStatuses = [
    ORDER_STATUS.DELIVERED,
    AUCTION_STATUS.ACTIVE,
    PRODUCT_STATUS.ACTIVE,
    SHOP_STATUS.ACTIVE,
    PAYMENT_STATUS.CAPTURED,
    VERIFICATION_STATUS.VERIFIED,
  ];

  const warningStatuses = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PROCESSING,
    AUCTION_STATUS.ENDING_SOON,
    PRODUCT_STATUS.OUT_OF_STOCK,
    VERIFICATION_STATUS.PENDING,
  ];

  const errorStatuses = [
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.REFUNDED,
    AUCTION_STATUS.CANCELLED,
    AUCTION_STATUS.SUSPENDED,
    PRODUCT_STATUS.SUSPENDED,
    SHOP_STATUS.SUSPENDED,
    PAYMENT_STATUS.FAILED,
    VERIFICATION_STATUS.REJECTED,
  ];

  if (successStatuses.includes(status as any)) return "success";
  if (warningStatuses.includes(status as any)) return "warning";
  if (errorStatuses.includes(status as any)) return "error";

  return "default";
}
