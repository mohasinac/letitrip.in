/**
 * @fileoverview TypeScript Module
 * @module src/constants/limits
 * @description This file contains functionality related to limits
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Numeric Limits and Configuration Constants
 * Centralized location for all limit-related values
 */

// =============================================================================
// PAGINATION LIMITS
// =============================================================================
/**
 * Pagination
 * @constant
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  ADMIN_PAGE_SIZE: 25,
} as const;

// =============================================================================
// PRODUCT LIMITS
// =============================================================================
/**
 * Product Limits
 * @constant
 */
export const PRODUCT_LIMITS = {
  MAX_IMAGES: 10,
  MAX_VIDEOS: 3,
  MIN_PRICE: 1,
  MAX_PRICE: 100000000, // 10 crores
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 5000,
  MIN_TITLE_LENGTH: 3,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_TAGS: 20,
  MAX_VARIANTS: 50,
} as const;

// =============================================================================
// AUCTION LIMITS
// =============================================================================
/**
 * Auction Limits
 * @constant
 */
export const AUCTION_LIMITS = {
  MIN_STARTING_BID: 1,
  MAX_STARTING_BID: 100000000, // 10 crores
  MIN_BID_INCREMENT: 1,
  MIN_DURATION_HOURS: 1,
  MAX_DURATION_DAYS: 30,
  MAX_ACTIVE_PER_SHOP: 5,
  BID_EXTENSION_MINUTES: 5, // Time added when bid in last minutes
  BID_EXTENSION_THRESHOLD_MINUTES: 5, // Trigger extension when this much time left
} as const;

// =============================================================================
// UPLOAD LIMITS
// =============================================================================
/**
 * Upload Limits
 * @constant
 */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],
  MAX_DIMENSIONS: {
    /** Width */
    width: 4096,
    /** Height */
    height: 4096,
  },
  THUMBNAIL_SIZE: {
    /** Width */
    width: 300,
    /** Height */
    height: 300,
  },
} as const;

// =============================================================================
// SHOP LIMITS
// =============================================================================
/**
 * Shop Limits
 * @constant
 */
export const SHOP_LIMITS = {
  MAX_PRODUCTS: 10000,
  MAX_ACTIVE_AUCTIONS: 5,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_BANNER_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// =============================================================================
// USER LIMITS
// =============================================================================
/**
 * User Limits
 * @constant
 */
export const USER_LIMITS = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_BIO_LENGTH: 500,
  MAX_ADDRESSES: 10,
  MAX_WISHLIST_ITEMS: 200,
  MAX_CART_ITEMS: 50,
  MAX_CART_QUANTITY_PER_ITEM: 99,
} as const;

// =============================================================================
// CATEGORY LIMITS
// =============================================================================
/**
 * Category Limits
 * @constant
 */
export const CATEGORY_LIMITS = {
  MAX_DEPTH: 5, // Max nesting levels
  MAX_CHILDREN: 50, // Max direct children per category
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// =============================================================================
// REVIEW/RATING LIMITS
// =============================================================================
/**
 * Review Limits
 * @constant
 */
export const REVIEW_LIMITS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 2000,
  MAX_REVIEW_IMAGES: 5,
} as const;

// =============================================================================
// ORDER LIMITS
// =============================================================================
/**
 * Order Limits
 * @constant
 */
export const ORDER_LIMITS = {
  MIN_ORDER_VALUE: 1,
  MAX_ORDER_VALUE: 10000000, // 1 crore
  MAX_ITEMS_PER_ORDER: 50,
  CANCELLATION_WINDOW_HOURS: 24,
  RETURN_WINDOW_DAYS: 7,
  REFUND_WINDOW_DAYS: 14,
} as const;

// =============================================================================
// RATE LIMITS
// =============================================================================
/**
 * Rate Limits
 * @constant
 */
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  API_REQUESTS_PER_HOUR: 1000,
  LOGIN_ATTEMPTS_PER_HOUR: 10,
  PASSWORD_RESET_REQUESTS_PER_DAY: 5,
  EMAIL_VERIFICATION_REQUESTS_PER_DAY: 3,
  BID_REQUESTS_PER_MINUTE: 20,
} as const;

// =============================================================================
// COUPON LIMITS
// =============================================================================
/**
 * Coupon Limits
 * @constant
 */
export const COUPON_LIMITS = {
  MIN_CODE_LENGTH: 4,
  MAX_CODE_LENGTH: 20,
  MAX_DISCOUNT_PERCENT: 90,
  MAX_USES_PER_USER: 1,
  MAX_TOTAL_USES: 1000000,
} as const;

// =============================================================================
// SEARCH LIMITS
// =============================================================================
/**
 * Search Limits
 * @constant
 */
export const SEARCH_LIMITS = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,
  MAX_RESULTS: 100,
  MAX_SUGGESTIONS: 10,
  DEBOUNCE_MS: 300,
} as const;

// =============================================================================
// VIEWING HISTORY LIMITS
// =============================================================================
/**
 * History Limits
 * @constant
 */
export const HISTORY_LIMITS = {
  MAX_RECENTLY_VIEWED: 50,
  MAX_COMPARISON_ITEMS: 4,
  HISTORY_RETENTION_DAYS: 90,
} as const;

// =============================================================================
// BLOG LIMITS
// =============================================================================
/**
 * Blog Limits
 * @constant
 */
export const BLOG_LIMITS = {
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  MIN_CONTENT_LENGTH: 100,
  MAX_CONTENT_LENGTH: 50000,
  MAX_EXCERPT_LENGTH: 300,
  MAX_TAGS: 10,
} as const;

// =============================================================================
// SUPPORT TICKET LIMITS
// =============================================================================
/**
 * Ticket Limits
 * @constant
 */
export const TICKET_LIMITS = {
  MIN_SUBJECT_LENGTH: 10,
  MAX_SUBJECT_LENGTH: 200,
  MIN_MESSAGE_LENGTH: 20,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_ATTACHMENTS: 5,
  MAX_OPEN_TICKETS_PER_USER: 10,
} as const;
