/**
 * SHARED TYPES - Common Enums and Base Types
 * Used by both Frontend and Backend
 */

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
  FIXED = "fixed",
  FREE_SHIPPING = "free-shipping",
}

/**
 * Coupon Scope
 */
export enum CouponScope {
  PRODUCT = "product",
  CATEGORY = "category",
  SHOP = "shop",
  GLOBAL = "global",
}

// ==================== BASE TYPES ====================

/**
 * Currency
 */
export type Currency = "INR";

/**
 * ISO 8601 Timestamp String
 */
export type ISOTimestamp = string;

/**
 * Firebase Timestamp
 */
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/**
 * File Upload Status
 */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * Sort Order
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort Field Generic
 */
export type SortField<T> = keyof T | string;

// ==================== UTILITY TYPES ====================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * Extract enum values as union type
 */
export type EnumValues<T> = T[keyof T];

// ==================== COMMON INTERFACES ====================

/**
 * Base Entity Interface
 * All entities extend this
 */
export interface BaseEntity {
  id: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Timestamped Entity (without ID)
 */
export interface Timestamped {
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Soft Deletable
 */
export interface SoftDeletable {
  deletedAt: ISOTimestamp | null;
  isDeleted: boolean;
}

/**
 * User Reference (minimal user info)
 */
export interface UserReference {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Shop Reference (minimal shop info)
 */
export interface ShopReference {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

/**
 * Category Reference (minimal category info)
 */
export interface CategoryReference {
  id: string;
  name: string;
  slug: string;
}

/**
 * Product Reference (minimal product info)
 */
export interface ProductReference {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

/**
 * Address Interface
 */
export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Coordinates (for maps)
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Image/Media Metadata
 */
export interface MediaMeta {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
}

/**
 * SEO Metadata
 */
export interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

/**
 * Price Range
 */
export interface PriceRange {
  min: number;
  max: number;
  currency: Currency;
}

/**
 * Date Range
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Stats/Metrics Interface
 */
export interface EntityMetrics {
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

// ==================== VALIDATION ====================

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ==================== PAGINATION ====================

/**
 * Paginated Response (Backend)
 */
export interface PaginatedResponseBE<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated Response (Frontend)
 */
export interface PaginatedResponseFE<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
