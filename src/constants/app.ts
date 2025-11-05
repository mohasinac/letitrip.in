/**
 * Global Application Constants
 * Centralized configuration for the entire application
 */

// Authentication & Session
export const AUTH_CONSTANTS = {
  // Cookie Names
  SESSION_COOKIE_NAME: "session",
  AUTH_TOKEN_COOKIE: "auth_token",
  REFRESH_TOKEN_COOKIE: "refresh_token",
  USER_DATA_COOKIE: "user_data",
  LAST_VISITED_PAGE_COOKIE: "last_visited_page",
  
  // Session Duration (in seconds)
  SESSION_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
  SESSION_DURATION_DAYS: 7,
  REFRESH_TOKEN_DURATION_DAYS: 90,
  COOKIE_CONSENT_DURATION_DAYS: 365,
  
  // Cache Settings
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  SESSION_ACTIVITY_UPDATE_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
  CACHE_CLEANUP_INTERVAL_MS: 60 * 1000, // 1 minute
  
  // Session Cleanup
  EXPIRED_SESSION_CLEANUP_LIMIT: 500,
  ACTIVE_SESSION_QUERY_LIMIT: 1000,
  RECENT_ACTIVITY_THRESHOLD_MS: 30 * 60 * 1000, // 30 minutes
} as const;

// Cookie Management
export const COOKIE_CONSTANTS = {
  SESSION_COOKIE_NAME: "app_session",
  SESSION_EXPIRY_DAYS: 30,
  SECURE: process.env.NODE_ENV === "production",
  SAME_SITE: "lax" as const,
  PATH: "/",
} as const;

// Storage & Upload
export const STORAGE_CONSTANTS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB in bytes
  MAX_VIDEO_SIZE_MB: 50,
  MAX_VIDEO_SIZE_BYTES: 50 * 1024 * 1024, // 50MB in bytes
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/quicktime"],
  STORAGE_FOLDERS: {
    PRODUCTS: "products",
    CATEGORIES: "categories",
    USERS: "users",
    UPLOADS: "uploads",
    THUMBNAILS: "thumbnails",
    BANNERS: "banners",
    HERO: "hero",
  },
  CACHE_DURATION_SECONDS: {
    IMAGES: 86400, // 24 hours
    THUMBNAILS: 604800, // 7 days
    STATIC: 2592000, // 30 days
  },
  CACHE_DURATION_MS: {
    IMAGES: 86400 * 1000, // 24 hours
    THUMBNAILS: 604800 * 1000, // 7 days
    STATIC: 2592000 * 1000, // 30 days
  },
} as const;

// Database Collections
export const DATABASE_CONSTANTS = {
  COLLECTIONS: {
    // E-commerce
    USERS: "users",
    SESSIONS: "sessions",
    CATEGORIES: "categories",
    PRODUCTS: "products",
    ORDERS: "orders",
    CARTS: "carts",
    BROWSING_HISTORY: "browsing_history",
    SETTINGS: "settings",
    ANALYTICS: "analytics",
    REVIEWS: "reviews",
    ADDRESSES: "addresses",
    SHIPMENTS: "shipments",
    COUPONS: "coupons",
    SALES: "sales",
    NOTIFICATIONS: "notifications",
    ALERTS: "alerts",
    
    // Game
    BEYBLADE_STATS: "beyblade_stats",
    ARENAS: "arenas",
    MATCHES: "matches",
    PLAYER_STATS: "player_stats",
  },
  STORAGE_BUCKETS: {
    PRODUCTS: "products",
    BEYBLADES: "beyblades",
    ARENAS: "arenas",
    AVATARS: "avatars",
    GENERAL: "general",
  },
  BATCH_SIZE: 500,
  QUERY_TIMEOUT_MS: 30000,
  DEFAULT_PAGE_LIMIT: 20,
  MAX_PAGE_LIMIT: 100,
} as const;

// API Configuration
export const API_CONSTANTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  ENDPOINTS: {
    AUTH: "/api/auth",
    USERS: "/api/users",
    CATEGORIES: "/api/categories",
    PRODUCTS: "/api/products",
    ORDERS: "/api/orders",
    STORAGE: "/api/storage",
    ADMIN: "/api/admin",
    SESSIONS: "/api/sessions",
    ANALYTICS: "/api/analytics",
  },
} as const;

// UI & UX Constants
export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 10,
  },
  TOAST_DURATION_MS: 3000,
  TOAST_DURATION_SECONDS: 3,
  DEBOUNCE_DELAY_MS: 300,
  POLLING_INTERVAL_MS: 5000,
  ANIMATION_DURATION_MS: 200,
  MODAL_TRANSITION_MS: 150,
} as const;

// Role-Based Access
export const ROLE_CONSTANTS = {
  ROLES: {
    ADMIN: "admin" as const,
    SELLER: "seller" as const,
    USER: "user" as const,
    GUEST: "guest" as const,
  },
  PERMISSIONS: {
    admin: [
      "admin:read",
      "admin:write",
      "admin:delete",
      "seller:read",
      "seller:write",
      "seller:delete",
      "user:read",
      "user:write",
      "user:delete",
      "products:manage",
      "orders:manage",
      "categories:manage",
      "users:manage",
      "analytics:view",
      "system:configure",
    ],
    seller: [
      "seller:read",
      "seller:write",
      "user:read",
      "user:write",
      "products:create",
      "products:update",
      "products:read",
      "orders:read",
      "orders:update",
      "analytics:view",
    ],
    user: [
      "user:read",
      "user:write",
      "products:read",
      "orders:create",
      "orders:read",
      "cart:manage",
      "profile:update",
    ],
    guest: ["products:read", "categories:read"],
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    REQUIRED: "Authentication required",
    INVALID_TOKEN: "Invalid or expired token",
    INVALID_CREDENTIALS: "Invalid email or password",
    USER_NOT_FOUND: "User not found",
    EMAIL_EXISTS: "Email already registered",
    WEAK_PASSWORD: "Password does not meet security requirements",
  },
  STORAGE: {
    NO_FILE: "No file provided",
    INVALID_TYPE: "Invalid file type",
    FILE_TOO_LARGE: "File size exceeds limit",
    UPLOAD_FAILED: "Upload failed",
    DOWNLOAD_FAILED: "Download failed",
  },
  VALIDATION: {
    REQUIRED_FIELD: "This field is required",
    INVALID_FORMAT: "Invalid format",
    INVALID_EMAIL: "Invalid email address",
    INVALID_PHONE: "Invalid phone number",
  },
  GENERAL: {
    SERVER_ERROR: "Server error occurred",
    NOT_FOUND: "Resource not found",
    FORBIDDEN: "Access denied",
    BAD_REQUEST: "Invalid request",
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Logged in successfully",
    REGISTER_SUCCESS: "Registration successful",
    LOGOUT_SUCCESS: "Logged out successfully",
    PASSWORD_RESET_SENT: "Password reset link sent to your email",
    PASSWORD_CHANGED: "Password changed successfully",
  },
  GENERAL: {
    SAVED: "Saved successfully",
    UPDATED: "Updated successfully",
    DELETED: "Deleted successfully",
    CREATED: "Created successfully",
  },
  STORAGE: {
    UPLOADED: "File uploaded successfully",
  },
} as const;

// Page Redirect Routes
export const REDIRECT_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/account/dashboard",
  HOME: "/",
  ADMIN: "/admin",
  NOT_FOUND: "/not-found",
  UNAUTHORIZED: "/unauthorized",
} as const;

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = [
  "/account",
  "/admin",
  "/profile",
  "/orders",
  "/wishlist",
  "/settings",
] as const;

// Public Routes (no authentication required)
export const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/categories",
  "/about",
  "/contact",
  "/help",
  "/faq",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MAX_QUANTITY: 999999,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY === "true",
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
  DEBUG_MODE: process.env.NODE_ENV === "development",
} as const;

export default {
  AUTH_CONSTANTS,
  COOKIE_CONSTANTS,
  STORAGE_CONSTANTS,
  DATABASE_CONSTANTS,
  API_CONSTANTS,
  UI_CONSTANTS,
  ROLE_CONSTANTS,
  HTTP_STATUS,
  VALIDATION_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REDIRECT_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  FEATURE_FLAGS,
};

// Type exports for better TypeScript support
export type UserRole = typeof ROLE_CONSTANTS.ROLES[keyof typeof ROLE_CONSTANTS.ROLES];
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
