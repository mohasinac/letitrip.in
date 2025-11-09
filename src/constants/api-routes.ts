/**
 * API Route Constants
 * Centralized API endpoints for consistent route management across the application
 */

// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  SESSION: "/auth/session",
  SESSIONS: "/auth/sessions",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
} as const;

// User Routes
export const USER_ROUTES = {
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
  AVATAR: "/users/me/avatar",
  CHANGE_PASSWORD: "/user/change-password",
  ADDRESSES: "/user/addresses",
  ADDRESS_BY_ID: (id: string) => `/user/addresses/${id}`,
  ORDERS: "/user/orders",
  ORDER_BY_ID: (id: string) => `/user/orders/${id}`,
  WISHLIST: "/user/wishlist",
  VIEWING_HISTORY: "/user/viewing-history",
} as const;

// Product Routes
export const PRODUCT_ROUTES = {
  LIST: "/products",
  BY_ID: (id: string) => `/products/${id}`,
  BY_SLUG: (slug: string) => `/products/${slug}`,
  REVIEWS: (productId: string) => `/products/${productId}/reviews`,
  RELATED: (productId: string) => `/products/${productId}/related`,
} as const;

// Auction Routes
export const AUCTION_ROUTES = {
  LIST: "/auctions",
  BY_ID: (id: string) => `/auctions/${id}`,
  BY_SLUG: (slug: string) => `/auctions/${slug}`,
  BIDS: (auctionId: string) => `/auctions/${auctionId}/bids`,
  PLACE_BID: (auctionId: string) => `/auctions/${auctionId}/bids`,
  AUTO_BID: (auctionId: string) => `/auctions/${auctionId}/auto-bid`,
  WATCH: (auctionId: string) => `/auctions/${auctionId}/watch`,
  MY_BIDS: "/auctions/my-bids",
  WATCHLIST: "/auctions/watchlist",
  WON: "/auctions/won",
} as const;

// Category Routes
export const CATEGORY_ROUTES = {
  LIST: "/categories",
  BY_ID: (id: string) => `/categories/${id}`,
  BY_SLUG: (slug: string) => `/categories/${slug}`,
  TREE: "/categories/tree",
  PRODUCTS: (categoryId: string) => `/categories/${categoryId}/products`,
} as const;

// Shop Routes
export const SHOP_ROUTES = {
  LIST: "/shops",
  BY_ID: (id: string) => `/shops/${id}`,
  BY_SLUG: (slug: string) => `/shops/${slug}`,
  PRODUCTS: (shopId: string) => `/shops/${shopId}/products`,
  AUCTIONS: (shopId: string) => `/shops/${shopId}/auctions`,
  REVIEWS: (shopId: string) => `/shops/${shopId}/reviews`,
} as const;

// Cart Routes
export const CART_ROUTES = {
  GET: "/cart",
  ADD: "/cart",
  UPDATE: (itemId: string) => `/cart/${itemId}`,
  REMOVE: (itemId: string) => `/cart/${itemId}`,
  CLEAR: "/cart/clear",
  MERGE: "/cart/merge",
  VALIDATE: "/cart/validate",
} as const;

// Order Routes
export const ORDER_ROUTES = {
  LIST: "/orders",
  CREATE: "/orders",
  BY_ID: (id: string) => `/orders/${id}`,
  CANCEL: (id: string) => `/orders/${id}/cancel`,
  TRACKING: (id: string) => `/orders/${id}/tracking`,
  INVOICE: (id: string) => `/orders/${id}/invoice`,
} as const;

// Coupon Routes
export const COUPON_ROUTES = {
  LIST: "/coupons",
  VALIDATE: "/coupons/validate",
  APPLY: "/coupons/apply",
} as const;

// Media Routes
export const MEDIA_ROUTES = {
  UPLOAD: "/media/upload",
  UPLOAD_MULTIPLE: "/media/upload-multiple",
  DELETE: "/media/delete",
  LIST: "/media",
} as const;

// Search Routes
export const SEARCH_ROUTES = {
  PRODUCTS: "/search/products",
  AUCTIONS: "/search/auctions",
  SHOPS: "/search/shops",
  GLOBAL: "/search",
} as const;

// Review Routes
export const REVIEW_ROUTES = {
  CREATE: "/reviews",
  BY_ID: (id: string) => `/reviews/${id}`,
  UPDATE: (id: string) => `/reviews/${id}`,
  DELETE: (id: string) => `/reviews/${id}`,
  HELPFUL: (id: string) => `/reviews/${id}/helpful`,
  MEDIA: "/reviews/media",
} as const;

// Admin Routes
export const ADMIN_ROUTES = {
  // Dashboard
  DASHBOARD: "/admin/dashboard",

  // Hero Slides
  HERO_SLIDES: "/admin/hero-slides",
  HERO_SLIDE_BY_ID: (id: string) => `/admin/hero-slides/${id}`,
  HERO_SLIDES_BULK: "/admin/hero-slides/bulk",

  // Categories
  CATEGORIES: "/admin/categories",
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
  CATEGORIES_BULK: "/admin/categories/bulk",

  // Users
  USERS: "/admin/users",
  USER_BY_ID: (id: string) => `/admin/users/${id}`,
  USERS_BULK: "/admin/users/bulk",

  // Products
  PRODUCTS: "/admin/products",
  PRODUCT_BY_ID: (id: string) => `/admin/products/${id}`,
  PRODUCTS_BULK: "/admin/products/bulk",

  // Auctions
  AUCTIONS: "/admin/auctions",
  AUCTION_BY_ID: (id: string) => `/admin/auctions/${id}`,
  AUCTIONS_BULK: "/admin/auctions/bulk",

  // Orders
  ORDERS: "/admin/orders",
  ORDER_BY_ID: (id: string) => `/admin/orders/${id}`,
  ORDERS_BULK: "/admin/orders/bulk",

  // Shops
  SHOPS: "/admin/shops",
  SHOP_BY_ID: (id: string) => `/admin/shops/${id}`,
  SHOPS_BULK: "/admin/shops/bulk",

  // Analytics
  ANALYTICS_DASHBOARD: "/admin/analytics/dashboard",
  ANALYTICS_SALES: "/admin/analytics/sales",
  ANALYTICS_USERS: "/admin/analytics/users",

  // Homepage Settings
  HOMEPAGE: "/admin/homepage",
  HOMEPAGE_RESET: "/admin/homepage/reset",

  // Special Banners
  BANNERS: "/admin/banners",
} as const;

// Seller Routes
export const SELLER_ROUTES = {
  // Dashboard
  DASHBOARD: "/seller/dashboard",

  // Products
  PRODUCTS: "/seller/products",
  PRODUCT_BY_ID: (id: string) => `/seller/products/${id}`,
  PRODUCTS_BULK: "/seller/products/bulk",

  // Auctions
  AUCTIONS: "/seller/auctions",
  AUCTION_BY_ID: (id: string) => `/seller/auctions/${id}`,
  AUCTIONS_BULK: "/seller/auctions/bulk",

  // Orders
  ORDERS: "/seller/orders",
  ORDER_BY_ID: (id: string) => `/seller/orders/${id}`,
  ORDERS_BULK: "/seller/orders/bulk",

  // Shop
  SHOP: "/seller/shop",
  SHOP_UPDATE: "/seller/shop",

  // Analytics
  ANALYTICS: "/analytics",
  ANALYTICS_DASHBOARD: "/seller/analytics/dashboard",
  ANALYTICS_SALES: "/seller/analytics/sales",
} as const;

// Homepage Public Routes (for frontend display)
export const HOMEPAGE_ROUTES = {
  BANNER: "/homepage/banner",
  HERO_SLIDES: "/homepage/hero-slides",
} as const;

// Checkout Routes
export const CHECKOUT_ROUTES = {
  CREATE_ORDER: "/checkout/create-order",
  VERIFY_PAYMENT: "/checkout/verify-payment",
} as const;

// Support Routes
export const SUPPORT_ROUTES = {
  CREATE_TICKET: "/support",
  ATTACHMENTS: "/support/attachments",
} as const;

// Returns Routes
export const RETURNS_ROUTES = {
  CREATE: "/returns",
  BY_ID: (id: string) => `/returns/${id}`,
  MEDIA: (id: string) => `/returns/${id}/media`,
} as const;

// Analytics Routes
export const ANALYTICS_ROUTES = {
  BASE: "/analytics",
} as const;

// Health & System Routes
export const SYSTEM_ROUTES = {
  HEALTH: "/health",
  VERSION: "/version",
} as const;

// Helper function to build query string
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

// Helper function to build full URL with query params
export function buildUrl(path: string, params?: Record<string, any>): string {
  if (!params) return path;
  return `${path}${buildQueryString(params)}`;
}

// Export all routes as a single object for convenience
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  USER: USER_ROUTES,
  PRODUCT: PRODUCT_ROUTES,
  AUCTION: AUCTION_ROUTES,
  CATEGORY: CATEGORY_ROUTES,
  SHOP: SHOP_ROUTES,
  CART: CART_ROUTES,
  ORDER: ORDER_ROUTES,
  COUPON: COUPON_ROUTES,
  MEDIA: MEDIA_ROUTES,
  SEARCH: SEARCH_ROUTES,
  REVIEW: REVIEW_ROUTES,
  HOMEPAGE: HOMEPAGE_ROUTES,
  CHECKOUT: CHECKOUT_ROUTES,
  SUPPORT: SUPPORT_ROUTES,
  RETURNS: RETURNS_ROUTES,
  ANALYTICS: ANALYTICS_ROUTES,
  ADMIN: ADMIN_ROUTES,
  SELLER: SELLER_ROUTES,
  SYSTEM: SYSTEM_ROUTES,
} as const;

// Type exports for better TypeScript support
export type ApiRoutes = typeof API_ROUTES;
