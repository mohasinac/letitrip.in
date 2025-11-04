/**
 * Backend API Types
 * Types specific to the backend/API layer
 */

import { EntityId } from "../shared/common";
import { User, UserRole } from "../shared/user";

/**
 * User context passed to controllers
 * Contains authenticated user information
 */
export interface UserContext {
  user: {
    id: EntityId;
    uid?: string; // Firebase UID
    email: string;
    role: UserRole;
    name?: string;
    isEmailVerified?: boolean;
  };
  token?: string;
}

/**
 * Request context (used in middleware)
 */
export interface RequestContext {
  user?: UserContext["user"];
  requestId: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Controller base input
 */
export interface ControllerInput {
  context?: UserContext;
}

/**
 * Register input
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  isOver18?: boolean;
  acceptTerms?: boolean;
}

/**
 * Login input
 */
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Change password input
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update profile input
 */
export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
  preferredCurrency?: string;
}

/**
 * Create product input
 */
export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold?: number;
  weight: number;
  weightUnit: "kg" | "g" | "lb" | "oz";
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  images: Array<{ url: string; alt: string; order: number }>;
  videos?: Array<{
    url: string;
    title: string;
    thumbnail?: string;
    duration?: number;
    order: number;
  }>;
  category: string;
  tags?: string[];
  status?: "active" | "draft" | "archived";
  isFeatured?: boolean;
  sellerId?: string;
  condition?: "new" | "used-mint" | "used-good" | "used-fair" | "damaged";
  returnable?: boolean;
  returnPeriod?: number;
  features?: string[];
  specifications?: Record<string, string>;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

/**
 * Update product input
 */
export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: EntityId;
}

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentIds?: string[];
  isActive?: boolean;
  featured?: boolean;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    altText?: string;
    keywords?: string[];
  };
}

/**
 * Update category input
 */
export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: EntityId;
}

/**
 * Create order input
 */
export interface CreateOrderInput {
  userId: EntityId;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: "razorpay" | "cod";
  couponCode?: string;
  notes?: string;
}

/**
 * Update order status input
 */
export interface UpdateOrderStatusInput {
  orderId: EntityId;
  status: string;
  notes?: string;
  trackingNumber?: string;
}

/**
 * Add to cart input
 */
export interface AddToCartInput {
  productId: EntityId;
  quantity: number;
}

/**
 * Update cart item input
 */
export interface UpdateCartItemInput {
  itemId: EntityId;
  quantity: number;
}

/**
 * Create review input
 */
export interface CreateReviewInput {
  productId: EntityId;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

/**
 * Update review input
 */
export interface UpdateReviewInput {
  reviewId: EntityId;
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
  status?: "pending" | "approved" | "rejected";
}

/**
 * Verify payment input
 */
export interface VerifyPaymentInput {
  orderId: EntityId;
  paymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

/**
 * File upload input
 */
export interface UploadFileInput {
  file: File | Buffer;
  folder: string;
  filename?: string;
  metadata?: Record<string, any>;
}

/**
 * Delete file input
 */
export interface DeleteFileInput {
  filePath: string;
}

/**
 * Pagination input
 */
export interface PaginationInput {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Search input
 */
export interface SearchInput extends PaginationInput {
  query?: string;
  filters?: Record<string, any>;
}
