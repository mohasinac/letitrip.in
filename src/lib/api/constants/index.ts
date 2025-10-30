/**
 * API Constants Index
 * Central export for all system constants and utilities
 */

export * from "./system";

// Re-export commonly used constants
export {
  RATING_CONSTANTS,
  SELLER_CONSTANTS,
  ORDER_CONSTANTS,
  PRODUCT_CONSTANTS,
  AUCTION_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  calculateWeightedRating,
  calculateSellerPerformance,
  calculateConversionRate,
} from "./system";

// API Response Helpers
export const API_RESPONSES = {
  SUCCESS: (data: any, message = "Success") => ({
    success: true,
    data,
    message,
  }),

  ERROR: (message: string, code = "UNKNOWN_ERROR") => ({
    success: false,
    error: message,
    code,
  }),

  VALIDATION_ERROR: (errors: any) => ({
    success: false,
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    errors,
  }),

  NOT_FOUND: (resource = "Resource") => ({
    success: false,
    error: `${resource} not found`,
    code: "NOT_FOUND",
  }),

  UNAUTHORIZED: (message = "Unauthorized access") => ({
    success: false,
    error: message,
    code: "UNAUTHORIZED",
  }),

  FORBIDDEN: (message = "Access forbidden") => ({
    success: false,
    error: message,
    code: "FORBIDDEN",
  }),
};

// Common HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "text/plain",
    "application/msword",
  ],
} as const;

// Cache Durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
