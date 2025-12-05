/**
 * @fileoverview TypeScript Module
 * @module src/constants/statuses
 * @description This file contains functionality related to statuses
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Status Constants
 * Centralized location for all entity status values
 */

// =============================================================================
// USER ROLES
// =============================================================================
/**
 * User Roles
 * @constant
 */
export const USER_ROLES = {
  /** A D M I N */
  ADMIN: "admin",
  /** S E L L E R */
  SELLER: "seller",
  /** U S E R */
  USER: "user",
  /** G U E S T */
  GUEST: "guest",
} as const;

/**
 * UserRole type
 * 
 * @typedef {Object} UserRole
 * @description Type definition for UserRole
 */
/**
 * UserRole type definition
 *
 * @typedef {(typeof USER_ROLES)[keyof typeof USER_ROLES]} UserRole
 * @description Type definition for UserRole
 */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// =============================================================================
// PRODUCT STATUS
// =============================================================================
/**
 * Product Status
 * @constant
 */
export const PRODUCT_STATUS = {
  /** D R A F T */
  DRAFT: "draft",
  /** P E N D I N G */
  PENDING: "pending",
  /** P U B L I S H E D */
  PUBLISHED: "published",
  /** A R C H I V E D */
  ARCHIVED: "archived",
  /** R E J E C T E D */
  REJECTED: "rejected",
} as const;

/**
 * ProductStatus type
 * 
 * @typedef {Object} ProductStatus
 * @description Type definition for ProductStatus
 */
/**
 * ProductStatus type definition
 *
 * @typedef {(typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]} ProductStatus
 * @description Type definition for ProductStatus
 */
export type ProductStatus =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

// =============================================================================
// AUCTION STATUS
// =============================================================================
/**
 * Auction Status
 * @constant
 */
export const AUCTION_STATUS = {
  /** D R A F T */
  DRAFT: "draft",
  /** S C H E D U L E D */
  SCHEDULED: "scheduled",
  /** A C T I V E */
  ACTIVE: "active",
  /** E N D E D */
  ENDED: "ended",
  /** C A N C E L L E D */
  CANCELLED: "cancelled",
  /** S O L D */
  SOLD: "sold",
  /** U N S O L D */
  UNSOLD: "unsold",
} as const;

/**
 * AuctionStatus type
 * 
 * @typedef {Object} AuctionStatus
 * @description Type definition for AuctionStatus
 */
/**
 * AuctionStatus type definition
 *
 * @typedef {(typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS]} AuctionStatus
 * @description Type definition for AuctionStatus
 */
export type AuctionStatus =
  (typeof AUCTION_STATUS)[keyof typeof AUCTION_STATUS];

// =============================================================================
// ORDER STATUS
// =============================================================================
/**
 * Order Status
 * @constant
 */
export const ORDER_STATUS = {
  /** P E N D I N G */
  PENDING: "pending",
  /** C O N F I R M E D */
  CONFIRMED: "confirmed",
  /** P R O C E S S I N G */
  PROCESSING: "processing",
  /** S H I P P E D */
  SHIPPED: "shipped",
  /** OUT_FOR_DELIVERY */
  OUT_FOR_DELIVERY: "out_for_delivery",
  /** D E L I V E R E D */
  DELIVERED: "delivered",
  /** C A N C E L L E D */
  CANCELLED: "cancelled",
  /** R E T U R N E D */
  RETURNED: "returned",
  /** R E F U N D E D */
  REFUNDED: "refunded",
} as const;

/**
 * OrderStatus type
 * 
 * @typedef {Object} OrderStatus
 * @description Type definition for OrderStatus
 */
/**
 * OrderStatus type definition
 *
 * @typedef {(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]} OrderStatus
 * @description Type definition for OrderStatus
 */
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Order status flow - defines valid transitions
/**
 * Order Status Flow
 * @constant
 */
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
/**
 * Payment Status
 * @constant
 */
export const PAYMENT_STATUS = {
  /** P E N D I N G */
  PENDING: "pending",
  /** P R O C E S S I N G */
  PROCESSING: "processing",
  /** C O M P L E T E D */
  COMPLETED: "completed",
  /** F A I L E D */
  FAILED: "failed",
  /** R E F U N D E D */
  REFUNDED: "refunded",
  /** PARTIALLY_REFUNDED */
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

/**
 * PaymentStatus type
 * 
 * @typedef {Object} PaymentStatus
 * @description Type definition for PaymentStatus
 */
/**
 * PaymentStatus type definition
 *
 * @typedef {(typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]} PaymentStatus
 * @description Type definition for PaymentStatus
 */
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// =============================================================================
// SHOP STATUS
// =============================================================================
/**
 * Shop Status
 * @constant
 */
export const SHOP_STATUS = {
  /** P E N D I N G */
  PENDING: "pending",
  /** A C T I V E */
  ACTIVE: "active",
  /** S U S P E N D E D */
  SUSPENDED: "suspended",
  /** C L O S E D */
  CLOSED: "closed",
} as const;

/**
 * ShopStatus type
 * 
 * @typedef {Object} ShopStatus
 * @description Type definition for ShopStatus
 */
/**
 * ShopStatus type definition
 *
 * @typedef {(typeof SHOP_STATUS)[keyof typeof SHOP_STATUS]} ShopStatus
 * @description Type definition for ShopStatus
 */
export type ShopStatus = (typeof SHOP_STATUS)[keyof typeof SHOP_STATUS];

// =============================================================================
// VERIFICATION STATUS
// =============================================================================
/**
 * Verification Status
 * @constant
 */
export const VERIFICATION_STATUS = {
  /** U N V E R I F I E D */
  UNVERIFIED: "unverified",
  /** P E N D I N G */
  PENDING: "pending",
  /** V E R I F I E D */
  VERIFIED: "verified",
  /** R E J E C T E D */
  REJECTED: "rejected",
} as const;

/**
 * VerificationStatus type
 * 
 * @typedef {Object} VerificationStatus
 * @description Type definition for VerificationStatus
 */
/**
 * VerificationStatus type definition
 *
 * @typedef {(typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS]} VerificationStatus
 * @description Type definition for VerificationStatus
 */
export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// =============================================================================
// TICKET STATUS
// =============================================================================
/**
 * Ticket Status
 * @constant
 */
export const TICKET_STATUS = {
  /** O P E N */
  OPEN: "open",
  /** IN_PROGRESS */
  IN_PROGRESS: "in_progress",
  /** WAITING_ON_CUSTOMER */
  WAITING_ON_CUSTOMER: "waiting_on_customer",
  /** R E S O L V E D */
  RESOLVED: "resolved",
  /** C L O S E D */
  CLOSED: "closed",
} as const;

/**
 * TicketStatus type
 * 
 * @typedef {Object} TicketStatus
 * @description Type definition for TicketStatus
 */
/**
 * TicketStatus type definition
 *
 * @typedef {(typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]} TicketStatus
 * @description Type definition for TicketStatus
 */
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// =============================================================================
// TICKET PRIORITY
// =============================================================================
/**
 * Ticket Priority
 * @constant
 */
export const TICKET_PRIORITY = {
  /** L O W */
  LOW: "low",
  /** M E D I U M */
  MEDIUM: "medium",
  /** H I G H */
  HIGH: "high",
  /** U R G E N T */
  URGENT: "urgent",
} as const;

/**
 * TicketPriority type
 * 
 * @typedef {Object} TicketPriority
 * @description Type definition for TicketPriority
 */
/**
 * TicketPriority type definition
 *
 * @typedef {(typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY]} TicketPriority
 * @description Type definition for TicketPriority
 */
export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

// =============================================================================
// RETURN STATUS
// =============================================================================
/**
 * Return Status
 * @constant
 */
export const RETURN_STATUS = {
  /** R E Q U E S T E D */
  REQUESTED: "requested",
  /** A P P R O V E D */
  APPROVED: "approved",
  /** R E J E C T E D */
  REJECTED: "rejected",
  /** PICKUP_SCHEDULED */
  PICKUP_SCHEDULED: "pickup_scheduled",
  /** PICKED_UP */
  PICKED_UP: "picked_up",
  /** R E C E I V E D */
  RECEIVED: "received",
  /** REFUND_INITIATED */
  REFUND_INITIATED: "refund_initiated",
  /** C O M P L E T E D */
  COMPLETED: "completed",
} as const;

/**
 * ReturnStatus type
 * 
 * @typedef {Object} ReturnStatus
 * @description Type definition for ReturnStatus
 */
/**
 * ReturnStatus type definition
 *
 * @typedef {(typeof RETURN_STATUS)[keyof typeof RETURN_STATUS]} ReturnStatus
 * @description Type definition for ReturnStatus
 */
export type ReturnStatus = (typeof RETURN_STATUS)[keyof typeof RETURN_STATUS];

// =============================================================================
// BLOG STATUS
// =============================================================================
/**
 * Blog Status
 * @constant
 */
export const BLOG_STATUS = {
  /** D R A F T */
  DRAFT: "draft",
  /** P U B L I S H E D */
  PUBLISHED: "published",
  /** A R C H I V E D */
  ARCHIVED: "archived",
} as const;

/**
 * BlogStatus type
 * 
 * @typedef {Object} BlogStatus
 * @description Type definition for BlogStatus
 */
/**
 * BlogStatus type definition
 *
 * @typedef {(typeof BLOG_STATUS)[keyof typeof BLOG_STATUS]} BlogStatus
 * @description Type definition for BlogStatus
 */
export type BlogStatus = (typeof BLOG_STATUS)[keyof typeof BLOG_STATUS];

// =============================================================================
// COUPON STATUS
// =============================================================================
/**
 * Coupon Status
 * @constant
 */
export const COUPON_STATUS = {
  /** A C T I V E */
  ACTIVE: "active",
  /** I N A C T I V E */
  INACTIVE: "inactive",
  /** E X P I R E D */
  EXPIRED: "expired",
} as const;

/**
 * CouponStatus type
 * 
 * @typedef {Object} CouponStatus
 * @description Type definition for CouponStatus
 */
/**
 * CouponStatus type definition
 *
 * @typedef {(typeof COUPON_STATUS)[keyof typeof COUPON_STATUS]} CouponStatus
 * @description Type definition for CouponStatus
 */
export type CouponStatus = (typeof COUPON_STATUS)[keyof typeof COUPON_STATUS];

// =============================================================================
// BID STATUS
// =============================================================================
/**
 * Bid Status
 * @constant
 */
export const BID_STATUS = {
  /** A C T I V E */
  ACTIVE: "active",
  /** O U T B I D */
  OUTBID: "outbid",
  /** W I N N I N G */
  WINNING: "winning",
  /** W O N */
  WON: "won",
  /** L O S T */
  LOST: "lost",
  /** C A N C E L L E D */
  CANCELLED: "cancelled",
} as const;

/**
 * BidStatus type
 * 
 * @typedef {Object} BidStatus
 * @description Type definition for BidStatus
 */
/**
 * BidStatus type definition
 *
 * @typedef {(typeof BID_STATUS)[keyof typeof BID_STATUS]} BidStatus
 * @description Type definition for BidStatus
 */
export type BidStatus = (typeof BID_STATUS)[keyof typeof BID_STATUS];

// =============================================================================
// STATUS LABELS (for UI display)
// =============================================================================
/**
 * Status Labels
 * @constant
 */
export const STATUS_LABELS = {
  /** Order */
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
  /** Product */
  product: {
    [PRODUCT_STATUS.DRAFT]: "Draft",
    [PRODUCT_STATUS.PENDING]: "Pending Review",
    [PRODUCT_STATUS.PUBLISHED]: "Published",
    [PRODUCT_STATUS.ARCHIVED]: "Archived",
    [PRODUCT_STATUS.REJECTED]: "Rejected",
  },
  /** Auction */
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
/**
 * Status Colors
 * @constant
 */
export const STATUS_COLORS = {
  /** Order */
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
  /** Product */
  product: {
    [PRODUCT_STATUS.DRAFT]: "gray",
    [PRODUCT_STATUS.PENDING]: "yellow",
    [PRODUCT_STATUS.PUBLISHED]: "green",
    [PRODUCT_STATUS.ARCHIVED]: "gray",
    [PRODUCT_STATUS.REJECTED]: "red",
  },
  /** Auction */
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
