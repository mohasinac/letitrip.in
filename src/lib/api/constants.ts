/**
 * API Route Constants
 * Centralized API route definitions to avoid conflicts
 */

export const API_ROUTES = {
  // Auth
  AUTH: {
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    LOGOUT: '/api/auth/logout',
  },
  
  // Admin
  ADMIN: {
    USERS: '/api/admin/users',
    CATEGORIES: '/api/admin/categories',
    PRODUCTS: '/api/admin/products',
    ORDERS: '/api/admin/orders',
    ANALYTICS: '/api/admin/analytics',
    THEME_SETTINGS: '/api/admin/theme-settings',
    GAME_SETTINGS: '/api/admin/game/settings',
  },
  
  // Beyblades
  BEYBLADES: {
    BASE: '/api/beyblades',
    BY_ID: (id: string) => `/api/beyblades/${id}`,
    INIT: '/api/beyblades/init',
    UPLOAD_IMAGE: '/api/beyblades/upload-image',
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/api/categories',
    BY_ID: (id: string) => `/api/categories/${id}`,
    FEATURED: '/api/categories/featured',
  },
  
  // Content
  CONTENT: {
    BASE: '/api/content',
    BY_SLUG: (slug: string) => `/api/content/${slug}`,
  },
  
  // Storage
  STORAGE: {
    UPLOAD: '/api/storage/upload',
    GET: '/api/storage/get',
    DELETE: '/api/storage/delete',
  },
  
  // Contact
  CONTACT: '/api/contact',
  
  // Cookies & Consent
  COOKIES: '/api/cookies',
  CONSENT: '/api/consent',
  
  // Sessions
  SESSIONS: '/api/sessions',
  
  // Hero Banner
  HERO_BANNER: '/api/hero-banner',
  
  // Health & Errors
  HEALTH: '/api/health',
  ERRORS: '/api/errors',
  
  // Upload
  UPLOAD: '/api/upload',
} as const;

/**
 * API Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
} as const;

/**
 * API Response Status Codes
 */
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

/**
 * API Error Messages
 */
export const API_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  INVALID_REQUEST: 'Invalid request',
} as const;
