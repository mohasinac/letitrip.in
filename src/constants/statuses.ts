/**
 * Status Constants
 * Centralized location for all entity status values
 */

// =============================================================================
// USER ROLES
// =============================================================================
export const USER_ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  USER: "user",
  GUEST: "guest",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// =============================================================================
// PRODUCT STATUS
// =============================================================================
export const PRODUCT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  REJECTED: "rejected",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

// =============================================================================
// AUCTION STATUS
// =============================================================================
export const AUCTION_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  ACTIVE: "active",
  ENDED: "ended",
  CANCELLED: "cancelled",
  SOLD: "sold",
  UNSOLD: "unsold",
} as const;

export type AuctionStatus = (typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS];

// =============================================================================
// ORDER STATUS
// =============================================================================
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  REFUNDED: "refunded",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Order status flow - defines valid transitions
export const ORDER_STATUS_FLOW = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
  [ORDER_STATUS.RETURNED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
} as const;

// =============================================================================
// PAYMENT STATUS
// =============================================================================
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// =============================================================================
// SHOP STATUS
// =============================================================================
export const SHOP_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  CLOSED: "closed",
} as const;

export type ShopStatus = (typeof SHOP_STATUS)[keyof typeof SHOP_STATUS];

// =============================================================================
// VERIFICATION STATUS
// =============================================================================
export const VERIFICATION_STATUS = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// =============================================================================
// TICKET STATUS
// =============================================================================
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  WAITING_ON_CUSTOMER: "waiting_on_customer",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// =============================================================================
// TICKET PRIORITY
// =============================================================================
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

// =============================================================================
// RETURN STATUS
// =============================================================================
export const RETURN_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  PICKUP_SCHEDULED: "pickup_scheduled",
  PICKED_UP: "picked_up",
  RECEIVED: "received",
  REFUND_INITIATED: "refund_initiated",
  COMPLETED: "completed",
} as const;

export type ReturnStatus = (typeof RETURN_STATUS)[keyof typeof RETURN_STATUS];

// =============================================================================
// BLOG STATUS
// =============================================================================
export const BLOG_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type BlogStatus = (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS];

// =============================================================================
// COUPON STATUS
// =============================================================================
export const COUPON_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
} as const;

export type CouponStatus = (typeof COUPON_STATUS)[keyof typeof COUPON_STATUS];

// =============================================================================
// BID STATUS
// =============================================================================
export const BID_STATUS = {
  ACTIVE: "active",
  OUTBID: "outbid",
  WINNING: "winning",
  WON: "won",
  LOST: "lost",
  CANCELLED: "cancelled",
} as const;

export type BidStatus = (typeof BID_STATUS)[keyof typeof BID_STATUS];

// =============================================================================
// STATUS LABELS (for UI display)
// =============================================================================
export const STATUS_LABELS = {
  order: {
    [ORDER_STATUS.PENDING]: "Pending",
    [ORDER_STATUS.CONFIRMED]: "Confirmed",
    [ORDER_STATUS.PROCESSING]: "Processing",
    [ORDER_STATUS.SHIPPED]: "Shipped",
    [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
    [ORDER_STATUS.DELIVERED]: "Delivered",
    [ORDER_STATUS.CANCELLED]: "Cancelled",
    [ORDER_STATUS.RETURNED]: "Returned",
    [ORDER_STATUS.REFUNDED]: "Refunded",
  },
  product: {
    [PRODUCT_STATUS.DRAFT]: "Draft",
    [PRODUCT_STATUS.PENDING]: "Pending Review",
    [PRODUCT_STATUS.PUBLISHED]: "Published",
    [PRODUCT_STATUS.ARCHIVED]: "Archived",
    [PRODUCT_STATUS.REJECTED]: "Rejected",
  },
  auction: {
    [AUCTION_STATUS.DRAFT]: "Draft",
    [AUCTION_STATUS.SCHEDULED]: "Scheduled",
    [AUCTION_STATUS.ACTIVE]: "Live",
    [AUCTION_STATUS.ENDED]: "Ended",
    [AUCTION_STATUS.CANCELLED]: "Cancelled",
    [AUCTION_STATUS.SOLD]: "Sold",
    [AUCTION_STATUS.UNSOLD]: "Unsold",
  },
} as const;

// =============================================================================
// STATUS COLORS (for UI styling)
// =============================================================================
export const STATUS_COLORS = {
  order: {
    [ORDER_STATUS.PENDING]: "yellow",
    [ORDER_STATUS.CONFIRMED]: "blue",
    [ORDER_STATUS.PROCESSING]: "blue",
    [ORDER_STATUS.SHIPPED]: "purple",
    [ORDER_STATUS.OUT_FOR_DELIVERY]: "purple",
    [ORDER_STATUS.DELIVERED]: "green",
    [ORDER_STATUS.CANCELLED]: "red",
    [ORDER_STATUS.RETURNED]: "orange",
    [ORDER_STATUS.REFUNDED]: "gray",
  },
  product: {
    [PRODUCT_STATUS.DRAFT]: "gray",
    [PRODUCT_STATUS.PENDING]: "yellow",
    [PRODUCT_STATUS.PUBLISHED]: "green",
    [PRODUCT_STATUS.ARCHIVED]: "gray",
    [PRODUCT_STATUS.REJECTED]: "red",
  },
  auction: {
    [AUCTION_STATUS.DRAFT]: "gray",
    [AUCTION_STATUS.SCHEDULED]: "blue",
    [AUCTION_STATUS.ACTIVE]: "green",
    [AUCTION_STATUS.ENDED]: "gray",
    [AUCTION_STATUS.CANCELLED]: "red",
    [AUCTION_STATUS.SOLD]: "green",
    [AUCTION_STATUS.UNSOLD]: "orange",
  },
} as const;
