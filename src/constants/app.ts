/**
 * Global Application Constants
 * Centralized configuration for the entire application
 */

// Authentication & Session
export const AUTH_CONSTANTS = {
  SESSION_COOKIE_NAME: 'user_session',
  AUTH_TOKEN_COOKIE: 'auth_token',
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  USER_DATA_COOKIE: 'user_data',
  LAST_VISITED_PAGE_COOKIE: 'last_visited_page',
  SESSION_DURATION_DAYS: 30,
  REFRESH_TOKEN_DURATION_DAYS: 90,
  COOKIE_CONSENT_DURATION_DAYS: 365,
} as const;

// Cookie Management
export const COOKIE_CONSTANTS = {
  SESSION_COOKIE_NAME: 'app_session',
  SESSION_EXPIRY_DAYS: 30,
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const,
  PATH: '/',
} as const;

// Storage & Upload
export const STORAGE_CONSTANTS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  STORAGE_FOLDERS: {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    USERS: 'users',
    UPLOADS: 'uploads',
    THUMBNAILS: 'thumbnails',
    BANNERS: 'banners',
    HERO: 'hero',
  },
  CACHE_DURATION_SECONDS: {
    IMAGES: 86400, // 24 hours
    THUMBNAILS: 604800, // 7 days
    STATIC: 2592000, // 30 days
  },
} as const;

// Database Collections
export const DATABASE_CONSTANTS = {
  COLLECTIONS: {
    USERS: 'users',
    SESSIONS: 'sessions',
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    CARTS: 'carts',
    BROWSING_HISTORY: 'browsing_history',
    SETTINGS: 'settings',
    ANALYTICS: 'analytics',
  },
  BATCH_SIZE: 500,
  QUERY_TIMEOUT_MS: 30000,
} as const;

// API Configuration
export const API_CONSTANTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    CATEGORIES: '/api/categories',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    STORAGE: '/api/storage',
    ADMIN: '/api/admin',
    SESSIONS: '/api/sessions',
    ANALYTICS: '/api/analytics',
  },
} as const;

// UI & UX Constants
export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  TOAST_DURATION_MS: 3000,
  DEBOUNCE_DELAY_MS: 300,
  POLLING_INTERVAL_MS: 5000,
} as const;

// Role-Based Access
export const ROLE_CONSTANTS = {
  ROLES: {
    ADMIN: 'admin',
    SELLER: 'seller',
    USER: 'user',
    GUEST: 'guest',
  },
  PERMISSIONS: {
    admin: [
      'admin:read',
      'admin:write',
      'admin:delete',
      'seller:read',
      'seller:write',
      'seller:delete',
      'user:read',
      'user:write',
      'user:delete',
      'products:manage',
      'orders:manage',
      'categories:manage',
      'users:manage',
      'analytics:view',
      'system:configure',
    ],
    seller: [
      'seller:read',
      'seller:write',
      'user:read',
      'user:write',
      'products:create',
      'products:update',
      'products:read',
      'orders:read',
      'orders:update',
      'analytics:view',
    ],
    user: [
      'user:read',
      'user:write',
      'products:read',
      'orders:create',
      'orders:read',
      'cart:manage',
      'profile:update',
    ],
    guest: [
      'products:read',
      'categories:read',
    ],
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    REQUIRED: 'Authentication required',
    INVALID_TOKEN: 'Invalid or expired token',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already registered',
    WEAK_PASSWORD: 'Password does not meet security requirements',
  },
  STORAGE: {
    NO_FILE: 'No file provided',
    INVALID_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File size exceeds limit',
    UPLOAD_FAILED: 'Upload failed',
    DOWNLOAD_FAILED: 'Download failed',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
  },
  GENERAL: {
    SERVER_ERROR: 'Server error occurred',
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'Access denied',
    BAD_REQUEST: 'Invalid request',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Logged in successfully',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PASSWORD_RESET_SENT: 'Password reset link sent to your email',
    PASSWORD_CHANGED: 'Password changed successfully',
  },
  GENERAL: {
    SAVED: 'Saved successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    CREATED: 'Created successfully',
  },
  STORAGE: {
    UPLOADED: 'File uploaded successfully',
  },
} as const;

// Page Redirect Routes
export const REDIRECT_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/account/dashboard',
  HOME: '/',
  ADMIN: '/admin',
  NOT_FOUND: '/not-found',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = [
  '/account',
  '/admin',
  '/profile',
  '/orders',
  '/wishlist',
  '/settings',
] as const;

// Public Routes (no authentication required)
export const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/categories',
  '/about',
  '/contact',
  '/help',
  '/faq',
  '/privacy',
  '/terms',
  '/cookies',
] as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
} as const;

export default {
  AUTH_CONSTANTS,
  COOKIE_CONSTANTS,
  STORAGE_CONSTANTS,
  DATABASE_CONSTANTS,
  API_CONSTANTS,
  UI_CONSTANTS,
  ROLE_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REDIRECT_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  FEATURE_FLAGS,
};
