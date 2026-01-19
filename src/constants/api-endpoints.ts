/**
 * API Endpoints
 *
 * Centralized API endpoint paths for consistent API calls.
 * Use these constants instead of hardcoded strings.
 *
 * @example
 * ```tsx
 * import { API_ENDPOINTS } from '@/constants/api-endpoints';
 *
 * const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST);
 * const product = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
 * ```
 */

const API_BASE = "/api";

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    SESSION: `${API_BASE}/auth/session`,
    REFRESH: `${API_BASE}/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },

  // Users
  USERS: {
    LIST: `${API_BASE}/users`,
    DETAIL: (id: string) => `${API_BASE}/users/${id}`,
    ME: `${API_BASE}/user/me`,
    UPDATE_PROFILE: `${API_BASE}/user/profile`,
    UPDATE_PASSWORD: `${API_BASE}/user/password`,
  },

  // Products
  PRODUCTS: {
    LIST: `${API_BASE}/products`,
    DETAIL: (id: string) => `${API_BASE}/products/${id}`,
    BY_SLUG: (slug: string) => `${API_BASE}/products/slug/${slug}`,
    CREATE: `${API_BASE}/products`,
    UPDATE: (id: string) => `${API_BASE}/products/${id}`,
    DELETE: (id: string) => `${API_BASE}/products/${id}`,
    REVIEWS: (id: string) => `${API_BASE}/products/${id}/reviews`,
    SIMILAR: (id: string) => `${API_BASE}/products/${id}/similar`,
  },

  // Auctions
  AUCTIONS: {
    LIST: `${API_BASE}/auctions`,
    DETAIL: (id: string) => `${API_BASE}/auctions/${id}`,
    CREATE: `${API_BASE}/auctions`,
    UPDATE: (id: string) => `${API_BASE}/auctions/${id}`,
    DELETE: (id: string) => `${API_BASE}/auctions/${id}`,
    BIDS: (id: string) => `${API_BASE}/auctions/${id}/bids`,
    PLACE_BID: (id: string) => `${API_BASE}/auctions/${id}/bid`,
    AUTO_BID: (id: string) => `${API_BASE}/auctions/${id}/auto-bid`,
    WATCH: (id: string) => `${API_BASE}/auctions/${id}/watch`,
    UNWATCH: (id: string) => `${API_BASE}/auctions/${id}/unwatch`,
    MY_BIDS: `${API_BASE}/auctions/my-bids`,
    WATCHLIST: `${API_BASE}/auctions/watchlist`,
    WON: `${API_BASE}/auctions/won`,
  },

  // Categories
  CATEGORIES: {
    LIST: `${API_BASE}/categories`,
    DETAIL: (id: string) => `${API_BASE}/categories/${id}`,
    BY_SLUG: (slug: string) => `${API_BASE}/categories/slug/${slug}`,
    TREE: `${API_BASE}/categories/tree`,
  },

  // Shops
  SHOPS: {
    LIST: `${API_BASE}/shops`,
    DETAIL: (id: string) => `${API_BASE}/shops/${id}`,
    BY_SLUG: (slug: string) => `${API_BASE}/shops/slug/${slug}`,
    CREATE: `${API_BASE}/shops`,
    UPDATE: (id: string) => `${API_BASE}/shops/${id}`,
    PRODUCTS: (id: string) => `${API_BASE}/shops/${id}/products`,
    AUCTIONS: (id: string) => `${API_BASE}/shops/${id}/auctions`,
    REVIEWS: (id: string) => `${API_BASE}/shops/${id}/reviews`,
  },

  // Cart
  CART: {
    GET: `${API_BASE}/cart`,
    ADD: `${API_BASE}/cart`,
    UPDATE: (id: string) => `${API_BASE}/cart/${id}`,
    REMOVE: (id: string) => `${API_BASE}/cart/${id}`,
    CLEAR: `${API_BASE}/cart/clear`,
    VALIDATE: `${API_BASE}/cart/validate`,
  },

  // Orders
  ORDERS: {
    LIST: `${API_BASE}/orders`,
    DETAIL: (id: string) => `${API_BASE}/orders/${id}`,
    CREATE: `${API_BASE}/orders`,
    UPDATE: (id: string) => `${API_BASE}/orders/${id}`,
    CANCEL: (id: string) => `${API_BASE}/orders/${id}/cancel`,
    TRACK: (id: string) => `${API_BASE}/orders/${id}/track`,
  },

  // Payments
  PAYMENTS: {
    CREATE_INTENT: `${API_BASE}/payments/create-intent`,
    CONFIRM: `${API_BASE}/payments/confirm`,
    RAZORPAY_CALLBACK: `${API_BASE}/payments/razorpay/callback`,
  },

  // Addresses
  ADDRESSES: {
    LIST: `${API_BASE}/user/addresses`,
    DETAIL: (id: string) => `${API_BASE}/user/addresses/${id}`,
    CREATE: `${API_BASE}/user/addresses`,
    UPDATE: (id: string) => `${API_BASE}/user/addresses/${id}`,
    DELETE: (id: string) => `${API_BASE}/user/addresses/${id}`,
    SET_DEFAULT: (id: string) => `${API_BASE}/user/addresses/${id}/default`,
  },

  // Reviews
  REVIEWS: {
    LIST: `${API_BASE}/reviews`,
    DETAIL: (id: string) => `${API_BASE}/reviews/${id}`,
    CREATE: `${API_BASE}/reviews`,
    UPDATE: (id: string) => `${API_BASE}/reviews/${id}`,
    DELETE: (id: string) => `${API_BASE}/reviews/${id}`,
    HELPFUL: (id: string) => `${API_BASE}/reviews/${id}/helpful`,
  },

  // Search
  SEARCH: {
    GLOBAL: `${API_BASE}/search`,
    PRODUCTS: `${API_BASE}/search/products`,
    AUCTIONS: `${API_BASE}/search/auctions`,
    SHOPS: `${API_BASE}/search/shops`,
    SUGGESTIONS: `${API_BASE}/search/suggestions`,
  },

  // Media
  MEDIA: {
    UPLOAD: `${API_BASE}/media/upload`,
    DELETE: (id: string) => `${API_BASE}/media/${id}`,
  },

  // Coupons
  COUPONS: {
    VALIDATE: `${API_BASE}/coupons/validate`,
    APPLY: `${API_BASE}/coupons/apply`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: `${API_BASE}/analytics/dashboard`,
    SALES: `${API_BASE}/analytics/sales`,
    TRAFFIC: `${API_BASE}/analytics/traffic`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: `${API_BASE}/notifications`,
    MARK_READ: (id: string) => `${API_BASE}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE}/notifications/read-all`,
  },

  // System
  HEALTH: `${API_BASE}/health`,
  CONFIG: `${API_BASE}/config`,
} as const;

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
