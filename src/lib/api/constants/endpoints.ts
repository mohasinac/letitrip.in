/**
 * API Endpoint Constants
 * Centralized endpoint definitions for type-safe API calls
 * 
 * Usage:
 *   import { API_ENDPOINTS } from '@/lib/api/constants/endpoints';
 *   const url = API_ENDPOINTS.PRODUCTS.GET('my-product-slug');
 */

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: {
    LIST: '/api/products',
    GET: (slug: string) => `/api/products/${slug}`,
    CREATE: '/api/admin/products',
    UPDATE: (id: string) => `/api/admin/products/${id}`,
    DELETE: (id: string) => `/api/admin/products/${id}`,
    STATS: '/api/admin/products/stats',
    SEARCH: '/api/products/search',
  },

  // Orders
  ORDERS: {
    LIST: '/api/orders',
    GET: (id: string) => `/api/orders/${id}`,
    CREATE: '/api/orders/create',
    UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
    TRACK: '/api/orders/track',
    
    // Admin endpoints
    ADMIN_LIST: '/api/admin/orders',
    ADMIN_GET: (id: string) => `/api/admin/orders/${id}`,
    ADMIN_UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
    ADMIN_STATS: '/api/admin/orders/stats',
    
    // Seller endpoints
    SELLER_LIST: '/api/seller/orders',
    SELLER_GET: (id: string) => `/api/seller/orders/${id}`,
    SELLER_UPDATE_STATUS: (id: string) => `/api/seller/orders/${id}/status`,
  },

  // Users
  USERS: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    ADDRESSES: '/api/user/addresses',
    ADD_ADDRESS: '/api/user/addresses',
    UPDATE_ADDRESS: (id: string) => `/api/user/addresses/${id}`,
    DELETE_ADDRESS: (id: string) => `/api/user/addresses/${id}`,
    
    // Admin endpoints
    ADMIN_LIST: '/api/admin/users',
    ADMIN_GET: (id: string) => `/api/admin/users/${id}`,
    ADMIN_UPDATE: (id: string) => `/api/admin/users/${id}`,
    ADMIN_DELETE: (id: string) => `/api/admin/users/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/api/categories',
    GET: (slug: string) => `/api/categories/${slug}`,
    TREE: '/api/categories?format=tree',
    FEATURED: '/api/categories?featured=true',
    
    // Admin endpoints
    ADMIN_LIST: '/api/admin/categories',
    ADMIN_CREATE: '/api/admin/categories',
    ADMIN_UPDATE: (id: string) => `/api/admin/categories/${id}`,
    ADMIN_DELETE: (id: string) => `/api/admin/categories/${id}`,
    ADMIN_BATCH_UPDATE: '/api/admin/categories/batch-update',
    
    // Seller endpoints
    SELLER_LEAF: '/api/seller/products/categories/leaf',
  },

  // Reviews
  REVIEWS: {
    LIST: '/api/reviews',
    GET: (id: string) => `/api/reviews/${id}`,
    CREATE: '/api/reviews',
    BY_PRODUCT: (productId: string) => `/api/reviews/product/${productId}`,
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
    
    // Admin endpoints
    ADMIN_LIST: '/api/admin/reviews',
    ADMIN_APPROVE: (id: string) => `/api/admin/reviews/${id}/approve`,
    ADMIN_REJECT: (id: string) => `/api/admin/reviews/${id}/reject`,
    ADMIN_DELETE: (id: string) => `/api/admin/reviews/${id}`,
  },

  // Authentication
  AUTH: {
    ME: '/api/auth/me',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // Search
  SEARCH: {
    GLOBAL: '/api/search',
    PRODUCTS: '/api/products?search=',
    CATEGORIES: '/api/categories?search=',
  },

  // Upload/Storage endpoints
  UPLOAD: {
    IMAGE: '/api/storage/upload/image',
    MULTIPLE: '/api/storage/upload/multiple',
    VIDEO: '/api/storage/upload/video',
    DELETE: '/api/storage/delete',
    DELETE_MULTIPLE: '/api/storage/delete/multiple',
    LIST: '/api/storage/list',
    METADATA: '/api/storage/metadata',
  },

  // Payment gateways
  PAYMENT: {
    RAZORPAY: {
      CREATE_ORDER: '/api/payment/razorpay/create-order',
      VERIFY: '/api/payment/razorpay/verify',
      CAPTURE: '/api/payment/razorpay/capture',
    },
    PAYPAL: {
      CREATE_ORDER: '/api/payment/paypal/create-order',
      CAPTURE: '/api/payment/paypal/capture',
    },
  },

  // Miscellaneous
  HEALTH: '/api/health',
  ERRORS: '/api/errors',
  CONTACT: '/api/contact',
  CONSENT: '/api/consent',
  COOKIES: '/api/cookies',
  HERO_BANNER: '/api/hero-banner',
  SESSIONS: '/api/sessions',
  CONTENT: (slug: string) => `/api/content/${slug}`,
} as const;

/**
 * Helper to build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Type-safe endpoint builder
 */
export function buildEndpoint(
  endpoint: string,
  params?: Record<string, any>
): string {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryString(params)}`;
}
