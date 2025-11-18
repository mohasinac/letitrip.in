/**
 * SHARED TYPES - Common Enums and Base Types
 * Used by both Frontend and Backend
 */

// ==================== BASE TYPES ====================

/**
 * Firestore Timestamp structure
 */
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/**
 * ISO Date string
 */
export type ISOTimestamp = string;

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

/**
 * Category reference for products
 */
export interface CategoryReference {
  id: string;
  name: string;
  slug: string;
}

/**
 * Shop reference for products
 */
export interface ShopReference {
  id: string;
  name: string;
  slug: string;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort field type
 */
export type SortField<T = any> = keyof T | string;

// ==================== ENUMS ====================

/**
 * User Roles
 */
export enum UserRole {
  ADMIN = "admin",
  SELLER = "seller",
  USER = "user",
  GUEST = "guest",
}

/**
 * User Status
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  SUSPENDED = "suspended",
}

/**
 * Entity Status (Generic)
 */
export enum Status {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

/**
 * Product Status
 */
export enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
  OUT_OF_STOCK = "out-of-stock",
}

/**
 * Product Condition
 */
export enum ProductCondition {
  NEW = "new",
  REFURBISHED = "refurbished",
  USED = "used",
}

/**
 * Shipping Class
 */
export enum ShippingClass {
  STANDARD = "standard",
  EXPRESS = "express",
  OVERNIGHT = "overnight",
}

/**
 * Auction Type
 */
export enum AuctionType {
  REGULAR = "regular",
  REVERSE = "reverse",
  SILENT = "silent",
}

/**
 * Auction Status
 */
export enum AuctionStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  EXTENDED = "extended",
  ENDED = "ended",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

/**
 * Order Status
 */
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

/**
 * Payment Status
 */
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

/**
 * Payment Method
 */
export enum PaymentMethod {
  CARD = "card",
  UPI = "upi",
  NET_BANKING = "net-banking",
  WALLET = "wallet",
  COD = "cod",
}

/**
 * Shipping Method
 */
export enum ShippingMethod {
  STANDARD = "standard",
  EXPRESS = "express",
  OVERNIGHT = "overnight",
  PICKUP = "pickup",
}

/**
 * Support Ticket Status
 */
export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in-progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
  ESCALATED = "escalated",
}

/**
 * Support Ticket Category
 */
export enum TicketCategory {
  ORDER_ISSUE = "order-issue",
  RETURN_REFUND = "return-refund",
  PRODUCT_QUESTION = "product-question",
  ACCOUNT = "account",
  PAYMENT = "payment",
  OTHER = "other",
}

/**
 * Support Ticket Priority
 */
export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * Notification Type
 */
export enum NotificationType {
  ORDER = "order",
  AUCTION = "auction",
  PRODUCT = "product",
  SYSTEM = "system",
  PROMO = "promo",
}

/**
 * Media Type
 */
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
}

/**
 * Coupon Type
 */
export enum CouponType {
  PERCENTAGE = "percentage",
  FLAT = "flat",
  BOGO = "bogo",
  TIERED = "tiered",
  FREE_SHIPPING = "free-shipping",
}

/**
 * Coupon Status
 */
export enum CouponStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired",
  USED_UP = "used-up",
}

/**
 * Coupon Applicability
 */
export enum CouponApplicability {
  ALL = "all",
  CATEGORY = "category",
  PRODUCT = "product",
}

/**
 * Return Status
 */
export enum ReturnStatus {
  REQUESTED = "requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  ITEM_RECEIVED = "item-received",
  REFUND_PROCESSED = "refund-processed",
  COMPLETED = "completed",
  ESCALATED = "escalated",
}

/**
 * Return Reason
 */
export enum ReturnReason {
  DEFECTIVE = "defective",
  WRONG_ITEM = "wrong-item",
  NOT_AS_DESCRIBED = "not-as-described",
  DAMAGED = "damaged",
  CHANGED_MIND = "changed-mind",
  OTHER = "other",
}

// ==================== PAGINATION ====================

/**
 * Cursor-based pagination metadata (from API)
 */
export interface CursorPaginationMeta {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
  count: number;
}

/**
 * Offset-based pagination metadata (from API)
 */
export interface OffsetPaginationMeta {
  page: number;
  limit: number;
  total?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages?: number;
}

/**
 * Paginated Response (Backend) - API response with cursor-based pagination
 */
export interface PaginatedResponseBE<T> {
  success: boolean;
  data: T[];
  count: number;
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}

/**
 * Paginated Response (Frontend) - Simplified for UI consumption
 */
export interface PaginatedResponseFE<T> {
  data: T[];
  count: number;
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}
