/**
 * @fileoverview Type Definitions
 * @module src/types/shared/common.types
 * @description This file contains TypeScript type definitions for common
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * SHARED TYPES - Common Enums and Base Types
 * Used by both Frontend and Backend
 */

// ==================== BASE TYPES ====================

/**
 * Firestore Timestamp structure
 */
export interface FirebaseTimestamp {
  /** _seconds */
  _seconds: number;
  /** _nanoseconds */
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
  /** Id */
  id: string;
  /** Created At */
  createdAt: FirebaseTimestamp;
  /** Updated At */
  updatedAt: FirebaseTimestamp;
}

/**
 * Category reference for products
 */
export interface CategoryReference {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
}

/**
 * Shop reference for products
 */
export interface ShopReference {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  /** Field */
  field: string;
  /** Message */
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
  /** Limit */
  limit: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Next Cursor */
  nextCursor: string | null;
  /** Count */
  count: number;
}

/**
 * Offset-based pagination metadata (from API)
 */
export interface OffsetPaginationMeta {
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Total */
  total?: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Has Prev Page */
  hasPrevPage: boolean;
  /** Total Pages */
  totalPages?: number;
}

/**
 * Paginated Response (Backend) - API response with cursor-based pagination
 */
export interface PaginatedResponseBE<T> {
  /** Success */
  success: boolean;
  /** Data */
  data: T[];
  /** Count */
  count: number;
  /** Pagination */
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}

/**
 * Paginated Response (Frontend) - Simplified for UI consumption
 */
export interface PaginatedResponseFE<T> {
  /** Data */
  data: T[];
  /** Count */
  count: number;
  /** Pagination */
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}

// ==================== BULK ACTIONS ====================

/**
 * Result of a bulk action operation on a single item
 */
export interface BulkActionResult {
  /** Id */
  id: string;
  /** Success */
  success: boolean;
  /** Error */
  error?: string;
  /** Data */
  data?: any;
}

/**
 * Response from bulk action API
 */
export interface BulkActionResponse {
  /** Success */
  success: boolean;
  /** Results */
  results: BulkActionResult[];
  /** Summary */
  summary?: {
    /** Total */
    total: number;
    /** Successful */
    successful: number;
    /** Failed */
    failed: number;
  };
}

/**
 * Bulk action request
 */
export interface BulkActionRequest {
  /** Action */
  action: string;
  /** Ids */
  ids: string[];
  /** Data */
  data?: any;
}
