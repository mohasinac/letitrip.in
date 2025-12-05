/**
 * @fileoverview TypeScript Module
 * @module src/constants/api-routes
 * @description This file contains functionality related to api-routes
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * API Route Constants
 * Centralized API endpoints for consistent route management across the application
 *
 * IMPORTANT: These routes do NOT include the /api prefix!
 * The apiService automatically prepends /api to all routes.
 * For direct fetch() calls, prepend /api manually: fetch(`/api${API_ROUTES.AUTH.LOGIN}`)
 */

// Base API URL
/**
 * Api Base Url
 * @constant
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Authentication Routes
/**
 * Auth Routes
 * @constant
 */
export const AUTH_ROUTES = {
  /** L O G I N */
  LOGIN: "/auth/login",
  /** R E G I S T E R */
  REGISTER: "/auth/register",
  /** L O G O U T */
  LOGOUT: "/auth/logout",
  /** S E S S I O N */
  SESSION: "/auth/session",
  /** S E S S I O N S */
  SESSIONS: "/auth/sessions",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET_PASSWORD: "/auth/reset-password",
  CHANGE_PASSWORD: "/auth/change-password",
} as const;

// User Routes
/**
 * User Routes
 * @constant
 */
export const USER_ROUTES = {
  // Profile management (user can access their own)
  /** P R O F I L E */
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
  /** A V A T A R */
  AVATAR: "/users/me/avatar",
  CHANGE_PASSWORD: "/user/change-password",
  /** A D D R E S S E S */
  ADDRESSES: "/user/addresses",
  ADDRESS_BY_ID: (id: string) => `/user/addresses/${id}`,
  /** O R D E R S */
  ORDERS: "/user/orders",
  ORDER_BY_ID: (id: string) => `/user/orders/${id}`,
  /** W I S H L I S T */
  WISHLIST: "/user/wishlist",
  VIEWING_HISTORY: "/user/viewing-history",

  // Admin user management (unified routes with RBAC)
  /** L I S T */
  LIST: "/users",
  BY_ID: (id: string) => `/users/${id}`,
  /** B U L K */
  BULK: "/users/bulk",
  /** S T A T S */
  STATS: "/users/stats",
  /** B A N */
  BAN: (id: string) => `/users/${id}/ban`,
  /** R O L E */
  ROLE: (id: string) => `/users/${id}/role`,
} as const;

// Product Routes
/**
 * Product Routes
 * @constant
 */
export const PRODUCT_ROUTES = {
  /** L I S T */
  LIST: "/products",
  BY_ID: (id: string) => `/products/${id}`,
  BY_SLUG: (slug: string) => `/products/${slug}`,
  /** B U L K */
  BULK: "/products/bulk",
  /** R E V I E W S */
  REVIEWS: (productId: string) => `/products/${productId}/reviews`,
  /** R E L A T E D */
  RELATED: (productId: string) => `/products/${productId}/related`,
} as const;

// Auction Routes
/**
 * Auction Routes
 * @constant
 */
export const AUCTION_ROUTES = {
  /** L I S T */
  LIST: "/auctions",
  BY_ID: (id: string) => `/auctions/${id}`,
  BY_SLUG: (slug: string) => `/auctions/${slug}`,
  /** B U L K */
  BULK: "/auctions/bulk",
  /** B I D S */
  BIDS: (auctionId: string) => `/auctions/${auctionId}/bids`,
  PLACE_BID: (auctionId: string) => `/auctions/${auctionId}/bids`,
  AUTO_BID: (auctionId: string) => `/auctions/${auctionId}/auto-bid`,
  /** W A T C H */
  WATCH: (auctionId: string) => `/auctions/${auctionId}/watch`,
  MY_BIDS: "/auctions/my-bids",
  /** W A T C H L I S T */
  WATCHLIST: "/auctions/watchlist",
  /** W O N */
  WON: "/auctions/won",
} as const;

// Category Routes (Unified - Public + Admin with RBAC)
/**
 * Category Routes
 * @constant
 */
export const CATEGORY_ROUTES = {
  /** L I S T */
  LIST: "/categories",
  BY_ID: (id: string) => `/categories/${id}`,
  BY_SLUG: (slug: string) => `/categories/${slug}`,
  /** B U L K */
  BULK: "/categories/bulk",
  /** T R E E */
  TREE: "/categories/tree",
  /** P R O D U C T S */
  PRODUCTS: (categoryId: string) => `/categories/${categoryId}/products`,

  // Category management & utility routes (admin only)
  /** L E A V E S */
  LEAVES: "/categories/leaves",
  /** F E A T U R E D */
  FEATURED: "/categories/featured",
  /** H O M E P A G E */
  HOMEPAGE: "/categories/homepage",
  /** S E A R C H */
  SEARCH: "/categories/search",
  /** R E O R D E R */
  REORDER: "/categories/reorder",
  VALIDATE_SLUG: "/categories/validate-slug",

  // Category relationships
  /** S U B C A T E G O R I E S */
  SUBCATEGORIES: (slug: string) => `/categories/${slug}/subcategories`,
  /** S I M I L A R */
  SIMILAR: (slug: string) => `/categories/${slug}/similar`,
  /** H I E R A R C H Y */
  HIERARCHY: (slug: string) => `/categories/${slug}/hierarchy`,
  BREADCRUMB: (id: string) => `/categories/${id}/hierarchy`, // Alias for HIERARCHY

  // Multi-parent category operations (admin only)
  ADD_PARENT: (slug: string) => `/categories/${slug}/add-parent`,
  REMOVE_PARENT: (slug: string) => `/categories/${slug}/remove-parent`,
  /** P A R E N T S */
  PARENTS: (slug: string) => `/categories/${slug}/parents`,
} as const;

// Email Routes
/**
 * Email Routes
 * @constant
 */
export const EMAIL_ROUTES = {
  /** S E N D */
  SEND: "/email/send",
  /** T E S T */
  TEST: "/admin/email/test",
} as const;

// Shop Routes
/**
 * Shop Routes
 * @constant
 */
export const SHOP_ROUTES = {
  /** L I S T */
  LIST: "/shops",
  BY_ID: (id: string) => `/shops/${id}`,
  BY_SLUG: (slug: string) => `/shops/${slug}`,
  /** B U L K */
  BULK: "/shops/bulk",
  /** P R O D U C T S */
  PRODUCTS: (shopId: string) => `/shops/${shopId}/products`,
  /** A U C T I O N S */
  AUCTIONS: (shopId: string) => `/shops/${shopId}/auctions`,
  /** R E V I E W S */
  REVIEWS: (shopId: string) => `/shops/${shopId}/reviews`,
} as const;

// Cart Routes
/**
 * Cart Routes
 * @constant
 */
export const CART_ROUTES = {
  /** G E T */
  GET: "/cart",
  /** A D D */
  ADD: "/cart",
  /** U P D A T E */
  UPDATE: (itemId: string) => `/cart/${itemId}`,
  /** R E M O V E */
  REMOVE: (itemId: string) => `/cart/${itemId}`,
  /** C L E A R */
  CLEAR: "/cart/clear",
  /** M E R G E */
  MERGE: "/cart/merge",
  /** V A L I D A T E */
  VALIDATE: "/cart/validate",
} as const;

// Order Routes
/**
 * Order Routes
 * @constant
 */
export const ORDER_ROUTES = {
  /** L I S T */
  LIST: "/orders",
  /** C R E A T E */
  CREATE: "/orders",
  BY_ID: (id: string) => `/orders/${id}`,
  /** B U L K */
  BULK: "/orders/bulk",
  /** C A N C E L */
  CANCEL: (id: string) => `/orders/${id}/cancel`,
  /** T R A C K I N G */
  TRACKING: (id: string) => `/orders/${id}/tracking`,
  /** I N V O I C E */
  INVOICE: (id: string) => `/orders/${id}/invoice`,
} as const;

// Coupon Routes
/**
 * Coupon Routes
 * @constant
 */
export const COUPON_ROUTES = {
  /** L I S T */
  LIST: "/coupons",
  BY_CODE: (code: string) => `/coupons/${code}`,
  /** B U L K */
  BULK: "/coupons/bulk",
  /** V A L I D A T E */
  VALIDATE: "/coupons/validate",
  /** A P P L Y */
  APPLY: "/coupons/apply",
} as const;

// Media Routes
/**
 * Media Routes
 * @constant
 */
export const MEDIA_ROUTES = {
  /** U P L O A D */
  UPLOAD: "/media/upload",
  UPLOAD_MULTIPLE: "/media/upload-multiple",
  /** D E L E T E */
  DELETE: "/media/delete",
  /** L I S T */
  LIST: "/media",
} as const;

// Search Routes
/**
 * Search Routes
 * @constant
 */
export const SEARCH_ROUTES = {
  /** P R O D U C T S */
  PRODUCTS: "/search/products",
  /** A U C T I O N S */
  AUCTIONS: "/search/auctions",
  /** S H O P S */
  SHOPS: "/search/shops",
  /** G L O B A L */
  GLOBAL: "/search",
} as const;

// Review Routes
/**
 * Review Routes
 * @constant
 */
export const REVIEW_ROUTES = {
  /** L I S T */
  LIST: "/reviews",
  /** C R E A T E */
  CREATE: "/reviews",
  BY_ID: (id: string) => `/reviews/${id}`,
  /** U P D A T E */
  UPDATE: (id: string) => `/reviews/${id}`,
  /** D E L E T E */
  DELETE: (id: string) => `/reviews/${id}`,
  /** B U L K */
  BULK: "/reviews/bulk",
  /** H E L P F U L */
  HELPFUL: (id: string) => `/reviews/${id}/helpful`,
  /** M E D I A */
  MEDIA: "/reviews/media",
  /** S U M M A R Y */
  SUMMARY: "/reviews/summary",
} as const;

// Hero Slide Routes (Unified - Public + Admin)
/**
 * Hero Slide Routes
 * @constant
 */
export const HERO_SLIDE_ROUTES = {
  /** L I S T */
  LIST: "/hero-slides",
  BY_ID: (id: string) => `/hero-slides/${id}`,
  /** B U L K */
  BULK: "/hero-slides/bulk",
} as const;

// Ticket Routes (Unified - User + Seller + Admin)
/**
 * Ticket Routes
 * @constant
 */
export const TICKET_ROUTES = {
  /** L I S T */
  LIST: "/tickets",
  BY_ID: (id: string) => `/tickets/${id}`,
  /** R E P L Y */
  REPLY: (id: string) => `/tickets/${id}/reply`,
  /** B U L K */
  BULK: "/tickets/bulk",
} as const;

// Admin Routes
/**
 * Admin Routes
 * @constant
 */
export const ADMIN_ROUTES = {
  // Dashboard
  /** D A S H B O A R D */
  DASHBOARD: "/admin/dashboard",

  // Categories
  /** C A T E G O R I E S */
  CATEGORIES: "/admin/categories",
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
  CATEGORIES_BULK: "/admin/categories/bulk",

  // Users - Note: These are UI routes for admin pages, not API endpoints
  // For API calls, use USER_ROUTES instead (unified with RBAC)
  /** U S E R S */
  USERS: "/admin/users",
  USER_BY_ID: (id: string) => `/admin/users/${id}`,
  USERS_BULK: "/admin/users/bulk",

  // Products
  /** P R O D U C T S */
  PRODUCTS: "/admin/products",
  PRODUCT_BY_ID: (id: string) => `/admin/products/${id}`,
  PRODUCTS_BULK: "/admin/products/bulk",

  // Auctions
  /** A U C T I O N S */
  AUCTIONS: "/admin/auctions",
  AUCTION_BY_ID: (id: string) => `/admin/auctions/${id}`,
  AUCTIONS_BULK: "/admin/auctions/bulk",

  // Orders
  /** O R D E R S */
  ORDERS: "/admin/orders",
  ORDER_BY_ID: (id: string) => `/admin/orders/${id}`,
  ORDERS_BULK: "/admin/orders/bulk",

  // Shops
  /** S H O P S */
  SHOPS: "/admin/shops",
  SHOP_BY_ID: (id: string) => `/admin/shops/${id}`,
  SHOPS_BULK: "/admin/shops/bulk",

  // Analytics
  ANALYTICS_DASHBOARD: "/admin/analytics/dashboard",
  ANALYTICS_SALES: "/admin/analytics/sales",
  ANALYTICS_USERS: "/admin/analytics/users",

  // Reviews
  /** R E V I E W S */
  REVIEWS: "/admin/reviews",
  REVIEW_BY_ID: (id: string) => `/admin/reviews/${id}`,
  REVIEWS_BULK: "/admin/reviews/bulk",

  // Payments
  /** P A Y M E N T S */
  PAYMENTS: "/admin/payments",
  PAYMENT_BY_ID: (id: string) => `/admin/payments/${id}`,
  PAYMENTS_BULK: "/admin/payments/bulk",
  PAYMENT_REFUND: (id: string) => `/admin/payments/${id}/refund`,

  // Payouts
  /** P A Y O U T S */
  PAYOUTS: "/admin/payouts",
  PAYOUT_BY_ID: (id: string) => `/admin/payouts/${id}`,
  PAYOUTS_PROCESS: "/admin/payouts/process",
  PAYOUTS_PENDING: "/admin/payouts/pending",
  PAYOUTS_BULK: "/admin/payouts/bulk",

  // Coupons
  /** C O U P O N S */
  COUPONS: "/admin/coupons",
  COUPON_BY_ID: (id: string) => `/admin/coupons/${id}`,
  COUPONS_BULK: "/admin/coupons/bulk",

  // Blog
  BLOG_POSTS: "/admin/blog",
  BLOG_POST_BY_ID: (id: string) => `/admin/blog/${id}`,
  BLOG_BULK: "/admin/blog/bulk",

  // Returns
  /** R E T U R N S */
  RETURNS: "/admin/returns",
  RETURN_BY_ID: (id: string) => `/admin/returns/${id}`,
  RETURNS_BULK: "/admin/returns/bulk",
  RETURN_APPROVE: (id: string) => `/admin/returns/${id}/approve`,
  RETURN_REJECT: (id: string) => `/admin/returns/${id}/reject`,

  // Homepage Settings
  /** H O M E P A G E */
  HOMEPAGE: "/admin/homepage",
  HOMEPAGE_RESET: "/admin/homepage/reset",

  // Special Banners
  /** B A N N E R S */
  BANNERS: "/admin/banners",

  // Demo Data (uses DEMO_ prefix for all generated data)
  /** D E M O */
  DEMO: {
    /** S T A T S */
    STATS: "/admin/demo/stats",
    GENERATE_STEP: (step: string) => `/admin/demo/generate/${step}`,
    CLEANUP_ALL: "/admin/demo/cleanup-all",
  },
} as const;

// Seller Routes
/**
 * Seller Routes
 * @constant
 */
export const SELLER_ROUTES = {
  // Dashboard
  /** D A S H B O A R D */
  DASHBOARD: "/seller/dashboard",

  // Products
  /** P R O D U C T S */
  PRODUCTS: "/seller/products",
  PRODUCT_BY_ID: (id: string) => `/seller/products/${id}`,
  PRODUCTS_BULK: "/seller/products/bulk",

  // Auctions
  /** A U C T I O N S */
  AUCTIONS: "/seller/auctions",
  AUCTION_BY_ID: (id: string) => `/seller/auctions/${id}`,
  AUCTIONS_BULK: "/seller/auctions/bulk",

  // Orders
  /** O R D E R S */
  ORDERS: "/seller/orders",
  ORDER_BY_ID: (id: string) => `/seller/orders/${id}`,
  ORDERS_BULK: "/seller/orders/bulk",

  // Shop
  /** S H O P */
  SHOP: "/seller/shop",
  SHOP_UPDATE: "/seller/shop",

  // Returns
  /** R E T U R N S */
  RETURNS: "/seller/returns",
  RETURN_BY_ID: (id: string) => `/seller/returns/${id}`,
  RETURNS_BULK: "/seller/returns/bulk",

  // Revenue & Payouts
  /** R E V E N U E */
  REVENUE: "/seller/revenue",
  /** P A Y O U T S */
  PAYOUTS: "/seller/payouts",
  PAYOUT_REQUEST: "/seller/payouts/request",

  // Coupons
  /** C O U P O N S */
  COUPONS: "/seller/coupons",
  COUPON_BY_ID: (id: string) => `/seller/coupons/${id}`,
  COUPONS_BULK: "/seller/coupons/bulk",

  // Analytics
  /** A N A L Y T I C S */
  ANALYTICS: "/analytics",
  ANALYTICS_DASHBOARD: "/seller/analytics/dashboard",
  ANALYTICS_SALES: "/seller/analytics/sales",
} as const;

// Checkout Routes
/**
 * Checkout Routes
 * @constant
 */
export const CHECKOUT_ROUTES = {
  CREATE_ORDER: "/checkout/create-order",
  VERIFY_PAYMENT: "/checkout/verify-payment",
} as const;

// Returns Routes
/**
 * Returns Routes
 * @constant
 */
export const RETURNS_ROUTES = {
  /** C R E A T E */
  CREATE: "/returns",
  BY_ID: (id: string) => `/returns/${id}`,
  /** M E D I A */
  MEDIA: (id: string) => `/returns/${id}/media`,
} as const;

// Payment Routes (Unified with RBAC)
/**
 * Payment Routes
 * @constant
 */
export const PAYMENT_ROUTES = {
  /** L I S T */
  LIST: "/payments",
  BY_ID: (id: string) => `/payments/${id}`,
  /** C R E A T E */
  CREATE: "/payments",
  /** B U L K */
  BULK: "/payments/bulk",
  /** V E R I F Y */
  VERIFY: "/payments/verify",
  /** R E F U N D */
  REFUND: (id: string) => `/payments/${id}/refund`,
  /** M E T H O D S */
  METHODS: "/payments/methods",
  /** S T A T S */
  STATS: "/payments/stats",
} as const;

// Homepage Routes (Unified with RBAC)
/**
 * Homepage Routes
 * @constant
 */
export const HOMEPAGE_ROUTES = {
  /** S E T T I N G S */
  SETTINGS: "/homepage",
  /** R E S E T */
  RESET: "/homepage/reset",
  /** B A N N E R */
  BANNER: "/homepage/banner",
  HERO_SLIDES: "/hero-slides", // Already unified
} as const;

// Payout Routes
/**
 * Payout Routes
 * @constant
 */
export const PAYOUT_ROUTES = {
  /** L I S T */
  LIST: "/payouts",
  BY_ID: (id: string) => `/payouts/${id}`,
  /** B U L K */
  BULK: "/payouts/bulk",
  /** R E Q U E S T */
  REQUEST: "/payouts/request",
  /** P E N D I N G */
  PENDING: "/payouts/pending",
  /** H I S T O R Y */
  HISTORY: "/payouts/history",
} as const;

// Analytics Routes
/**
 * Analytics Routes
 * @constant
 */
export const ANALYTICS_ROUTES = {
  /** B A S E */
  BASE: "/analytics",
} as const;

// Health & System Routes
/**
 * System Routes
 * @constant
 */
export const SYSTEM_ROUTES = {
  /** H E A L T H */
  HEALTH: "/health",
  /** V E R S I O N */
  VERSION: "/version",
} as const;

// Helper function to build query string
/**
 * Function: Build Query String
 */
/**
 * Performs build query string operation
 *
 * @param {Record<string, any>} params - The params
 *
 * @returns {string} The buildquerystring result
 *
 * @example
 * buildQueryString(params);
 */

/**
 * Performs build query string operation
 *
 * @param {Record<string, any>} params - The params
 *
 * @returns {string} The buildquerystring result
 *
 * @example
 * buildQueryString(params);
 */

export function buildQueryString(params: Record<string, any>): string {
  /**
 * Performs search params operation
 *
 * @returns {any} The searchparams result
 *
 */
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
/**
 * Function: Build Url
 */
/**
 * Performs build url operation
 *
 * @param {string} path - The path
 * @param {Record<string, any>} [params] - The params
 *
 * @returns {string} The buildurl result
 *
 * @example
 * buildUrl("example", params);
 */

/**
 * Performs build url operation
 *
 * @param {string} path - The path
 * @param {Record<string, any>} [params] - The params
 *
 * @returns {string} The buildurl result
 *
 * @example
 * buildUrl("example", params);
 */

export function buildUrl(path: string, params?: Record<string, any>): string {
  if (!params) return path;
  return `${path}${buildQueryString(params)}`;
}

// Export all routes as a single object for convenience
/**
 * Api Routes
 * @constant
 */
export const API_ROUTES = {
  /** A U T H */
  AUTH: AUTH_ROUTES,
  /** U S E R */
  USER: USER_ROUTES,
  /** P R O D U C T */
  PRODUCT: PRODUCT_ROUTES,
  /** A U C T I O N */
  AUCTION: AUCTION_ROUTES,
  /** C A T E G O R Y */
  CATEGORY: CATEGORY_ROUTES,
  /** S H O P */
  SHOP: SHOP_ROUTES,
  /** C A R T */
  CART: CART_ROUTES,
  /** O R D E R */
  ORDER: ORDER_ROUTES,
  /** C O U P O N */
  COUPON: COUPON_ROUTES,
  /** M E D I A */
  MEDIA: MEDIA_ROUTES,
  /** S E A R C H */
  SEARCH: SEARCH_ROUTES,
  /** R E V I E W */
  REVIEW: REVIEW_ROUTES,
  /** P A Y M E N T */
  PAYMENT: PAYMENT_ROUTES,
  /** P A Y O U T */
  PAYOUT: PAYOUT_ROUTES,
  /** H O M E P A G E */
  HOMEPAGE: HOMEPAGE_ROUTES,
  /** C H E C K O U T */
  CHECKOUT: CHECKOUT_ROUTES,
  /** T I C K E T */
  TICKET: TICKET_ROUTES,
  /** R E T U R N S */
  RETURNS: RETURNS_ROUTES,
  /** A N A L Y T I C S */
  ANALYTICS: ANALYTICS_ROUTES,
  /** A D M I N */
  ADMIN: ADMIN_ROUTES,
  /** S E L L E R */
  SELLER: SELLER_ROUTES,
  /** S Y S T E M */
  SYSTEM: SYSTEM_ROUTES,
} as const;

// Type exports for better TypeScript support
/**
 * ApiRoutes type
 * 
 * @typedef {Object} ApiRoutes
 * @description Type definition for ApiRoutes
 */
export type ApiRoutes = typeof API_ROUTES;
