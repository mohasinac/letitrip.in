/**
 * API Configuration
 */

export const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  VERSION: 'v1',
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // per window
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  // Cache settings
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    LONG_TTL: 3600, // 1 hour
    SHORT_TTL: 60, // 1 minute
  },
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    REVIEWS: (id: string) => `/products/${id}/reviews`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    PRODUCTS: (id: string) => `/categories/${id}/products`,
  },
  
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
  },
  
  // Coupons
  COUPONS: {
    LIST: '/coupons',
    DETAIL: (id: string) => `/coupons/${id}`,
    VALIDATE: '/coupons/validate',
    APPLY: '/coupons/apply',
    USAGE: (id: string) => `/coupons/${id}/usage`,
  },
  
  // Payment
  PAYMENT: {
    RAZORPAY: {
      CREATE_ORDER: '/payment/razorpay/create-order',
      VERIFY: '/payment/razorpay/verify',
      CAPTURE: '/payment/razorpay/capture',
      REFUND: '/payment/razorpay/refund',
      WEBHOOK: '/payment/razorpay/webhook',
    },
  },
  
  // Shipping
  SHIPPING: {
    SHIPROCKET: {
      RATES: '/shipping/shiprocket/rates',
      CREATE_ORDER: '/shipping/shiprocket/create-order',
      TRACK: '/shipping/shiprocket/track',
      CANCEL: '/shipping/shiprocket/cancel',
      SERVICEABILITY: '/shipping/shiprocket/serviceability',
    },
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    ORDERS: '/user/orders',
    WISHLIST: '/user/wishlist',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    COUPONS: '/admin/coupons',
    ANALYTICS: '/admin/analytics',
  },
};

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

export const ERROR_MESSAGES = {
  INVALID_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  COUPON_EXPIRED: 'Coupon has expired',
  COUPON_USAGE_EXCEEDED: 'Coupon usage limit exceeded',
  COUPON_NOT_APPLICABLE: 'Coupon is not applicable to this order',
  PAYMENT_FAILED: 'Payment processing failed',
  SHIPPING_UNAVAILABLE: 'Shipping not available to this location',
} as const;
