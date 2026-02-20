/**
 * Notifications Collection Schema
 *
 * Firestore schema definition for the in-app notification system.
 * Supports order updates, bid events, review responses, system messages, and promotions.
 */

// ============================================
// NOTIFICATION TYPE ENUMS & INTERFACES
// ============================================

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "bid_placed"
  | "bid_outbid"
  | "bid_won"
  | "bid_lost"
  | "review_approved"
  | "review_replied"
  | "product_available"
  | "promotion"
  | "system"
  | "welcome";

export type NotificationPriority = "low" | "normal" | "high";

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface NotificationDocument {
  id: string;
  userId: string; // Target user (recipient)
  type: NotificationType;
  priority: NotificationPriority;

  // Content
  title: string;
  message: string;
  imageUrl?: string;

  // Navigation — where to go when clicked
  actionUrl?: string;
  actionLabel?: string;

  // State
  isRead: boolean;
  readAt?: Date;

  // Related entities (for deep-linking)
  relatedId?: string; // orderId, productId, bidId, etc.
  relatedType?: "order" | "product" | "bid" | "review" | "blog" | "user";

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export const NOTIFICATIONS_COLLECTION = "notifications" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * - userId + createdAt DESC: User's notifications newest-first
 * - userId + isRead + createdAt DESC: Unread-first notifications
 * - userId + type: Filter by notification type
 */
export const NOTIFICATIONS_INDEXED_FIELDS = [
  "userId",
  "isRead",
  "createdAt",
  "type",
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * Notification Relationships
 *
 * notifications.userId ──FK──> users.uid
 * notifications.relatedId ──optionalFK──> orders.id | products.id | bids.id | reviews.id
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================

export const NOTIFICATION_FIELDS = {
  ID: "id",
  USER_ID: "userId",
  TYPE: "type",
  PRIORITY: "priority",
  TITLE: "title",
  MESSAGE: "message",
  IMAGE_URL: "imageUrl",
  ACTION_URL: "actionUrl",
  ACTION_LABEL: "actionLabel",
  IS_READ: "isRead",
  READ_AT: "readAt",
  RELATED_ID: "relatedId",
  RELATED_TYPE: "relatedType",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",

  TYPE_VALUES: {
    ORDER_PLACED: "order_placed" as NotificationType,
    ORDER_CONFIRMED: "order_confirmed" as NotificationType,
    ORDER_SHIPPED: "order_shipped" as NotificationType,
    ORDER_DELIVERED: "order_delivered" as NotificationType,
    ORDER_CANCELLED: "order_cancelled" as NotificationType,
    BID_PLACED: "bid_placed" as NotificationType,
    BID_OUTBID: "bid_outbid" as NotificationType,
    BID_WON: "bid_won" as NotificationType,
    BID_LOST: "bid_lost" as NotificationType,
    REVIEW_APPROVED: "review_approved" as NotificationType,
    REVIEW_REPLIED: "review_replied" as NotificationType,
    PRODUCT_AVAILABLE: "product_available" as NotificationType,
    PROMOTION: "promotion" as NotificationType,
    SYSTEM: "system" as NotificationType,
    WELCOME: "welcome" as NotificationType,
  },

  PRIORITY_VALUES: {
    LOW: "low" as NotificationPriority,
    NORMAL: "normal" as NotificationPriority,
    HIGH: "high" as NotificationPriority,
  },
} as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type NotificationCreateInput = Omit<
  NotificationDocument,
  "id" | "createdAt" | "updatedAt" | "isRead" | "readAt"
>;

export type NotificationUpdateInput = {
  isRead?: boolean;
  readAt?: Date;
};

// ============================================
// 6. QUERY HELPERS
// ============================================

export const notificationQueryHelpers = {
  byUser: (userId: string) => ({
    field: NOTIFICATION_FIELDS.USER_ID,
    value: userId,
  }),
  unreadByUser: (userId: string) => [
    { field: NOTIFICATION_FIELDS.USER_ID, value: userId },
    { field: NOTIFICATION_FIELDS.IS_READ, value: false },
  ],
};
