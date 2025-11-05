/**
 * Shared API Configuration
 * Constants that can be safely used on both client and server
 */

/**
 * API Endpoints
 * Use these for making API calls from the frontend
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VERIFY: "/api/auth/verify",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },

  // Products
  PRODUCTS: {
    LIST: "/api/products",
    DETAIL: (id: string) => `/api/products/${id}`,
    SEARCH: "/api/products/search",
    CATEGORIES: "/api/products/categories",
    REVIEWS: (id: string) => `/api/products/${id}/reviews`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/api/categories",
    DETAIL: (id: string) => `/api/categories/${id}`,
    PRODUCTS: (id: string) => `/api/categories/${id}/products`,
  },

  // Cart
  CART: {
    GET: "/api/cart",
    ADD: "/api/cart/add",
    UPDATE: "/api/cart/update",
    REMOVE: "/api/cart/remove",
    CLEAR: "/api/cart/clear",
  },

  // Orders
  ORDERS: {
    LIST: "/api/orders",
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: "/api/orders",
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
    TRACK: (id: string) => `/api/orders/${id}/track`,
  },

  // Coupons
  COUPONS: {
    LIST: "/api/coupons",
    DETAIL: (id: string) => `/api/coupons/${id}`,
    VALIDATE: "/api/coupons/validate",
    APPLY: "/api/coupons/apply",
    USAGE: (id: string) => `/api/coupons/${id}/usage`,
  },

  // Payment
  PAYMENT: {
    RAZORPAY: {
      CREATE_ORDER: "/api/payment/razorpay/create-order",
      VERIFY: "/api/payment/razorpay/verify",
      CAPTURE: "/api/payment/razorpay/capture",
      REFUND: "/api/payment/razorpay/refund",
    },
  },

  // Shipping
  SHIPPING: {
    SHIPROCKET: {
      RATES: "/api/shipping/shiprocket/rates",
      CREATE_ORDER: "/api/shipping/shiprocket/create-order",
      TRACK: "/api/shipping/shiprocket/track",
      CANCEL: "/api/shipping/shiprocket/cancel",
      SERVICEABILITY: "/api/shipping/shiprocket/serviceability",
    },
  },

  // User
  USER: {
    PROFILE: "/api/user/profile",
    ADDRESSES: "/api/user/addresses",
    ORDERS: "/api/user/orders",
    WISHLIST: "/api/user/wishlist",
  },

  // Admin
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    PRODUCTS: "/api/admin/products",
    ORDERS: "/api/admin/orders",
    USERS: "/api/admin/users",
    COUPONS: "/api/admin/coupons",
    ANALYTICS: "/api/admin/analytics",
  },
} as const;

/**
 * HTTP Status Codes
 */
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
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INVALID_REQUEST: "Invalid request",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  COUPON_EXPIRED: "Coupon has expired",
  COUPON_USAGE_EXCEEDED: "Coupon usage limit exceeded",
  COUPON_NOT_APPLICABLE: "Coupon is not applicable to this order",
  PAYMENT_FAILED: "Payment processing failed",
  SHIPPING_UNAVAILABLE: "Shipping not available to this location",
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZES: [10, 20, 50, 100] as const,
} as const;

/**
 * API Request Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 120000, // 2 minutes
  LONG_RUNNING: 300000, // 5 minutes
} as const;

/**
 * Helper to build query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Helper to build full API URL
 */
export function buildApiUrl(endpoint: string, params?: Record<string, any>): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  const queryString = params ? buildQueryString(params) : '';
  return `${baseUrl}${endpoint}${queryString}`;
}
