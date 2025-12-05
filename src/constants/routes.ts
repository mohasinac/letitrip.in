/**
 * @fileoverview TypeScript Module
 * @module src/constants/routes
 * @description This file contains functionality related to routes
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Page Route Constants
 * Centralized page routes for consistent navigation across the application
 *
 * NOTE: These are Next.js page routes, NOT API routes.
 * For API routes, use api-routes.ts
 */

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
/**
 * Public Routes
 * @constant
 */
export const PUBLIC_ROUTES = {
  // Home
  /** H O M E */
  HOME: "/",

  // Authentication
  /** L O G I N */
  LOGIN: "/login",
  /** R E G I S T E R */
  REGISTER: "/register",
  /** L O G O U T */
  LOGOUT: "/logout",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Browse
  /** P R O D U C T S */
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  /** A U C T I O N S */
  AUCTIONS: "/auctions",
  AUCTION_DETAIL: (slug: string) => `/auctions/${slug}`,
  /** S H O P S */
  SHOPS: "/shops",
  SHOP_DETAIL: (slug: string) => `/shops/${slug}`,
  /** C A T E G O R I E S */
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}`,
  /** S E A R C H */
  SEARCH: "/search",
  /** B L O G */
  BLOG: "/blog",
  BLOG_POST: (slug: string) => `/blog/${slug}`,

  // Reviews
  /** R E V I E W S */
  REVIEWS: "/reviews",

  // Cart & Checkout
  /** C A R T */
  CART: "/cart",
  /** C H E C K O U T */
  CHECKOUT: "/checkout",

  // Legal & Info Pages
  /** A B O U T */
  ABOUT: "/about",
  /** F A Q */
  FAQ: "/faq",
  /** C O N T A C T */
  CONTACT: "/contact",
  TERMS_OF_SERVICE: "/terms-of-service",
  PRIVACY_POLICY: "/privacy-policy",
  REFUND_POLICY: "/refund-policy",
  SHIPPING_POLICY: "/shipping-policy",
  COOKIE_POLICY: "/cookie-policy",
  /** L E G A L */
  LEGAL: "/legal",

  // Events
  /** E V E N T S */
  EVENTS: "/events",
  EVENT_DETAIL: (slug: string) => `/events/${slug}`,

  // Compare
  /** C O M P A R E */
  COMPARE: "/compare",

  // Guide Pages
  GUIDE_NEW_USER: "/guide/new-user",
  GUIDE_RETURNS: "/guide/returns",
  GUIDE_PROHIBITED: "/guide/prohibited",

  // Fee Pages
  FEES_PAYMENT: "/fees/payment",
  FEES_STRUCTURE: "/fees/structure",
  FEES_OPTIONAL: "/fees/optional",
  FEES_SHIPPING: "/fees/shipping",

  // Company Pages
  COMPANY_OVERVIEW: "/company/overview",

  // Support
  SUPPORT_TICKET: "/support/ticket",
  SUPPORT_CREATE: "/support/create",

  // Error Pages
  /** U N A U T H O R I Z E D */
  UNAUTHORIZED: "/unauthorized",
  /** F O R B I D D E N */
  FORBIDDEN: "/forbidden",
} as const;

// ============================================
// USER ROUTES (Requires authentication)
// ============================================
/**
 * User Routes
 * @constant
 */
export const USER_ROUTES = {
  // Dashboard
  /** D A S H B O A R D */
  DASHBOARD: "/user",

  // Orders
  /** O R D E R S */
  ORDERS: "/user/orders",
  ORDER_DETAIL: (id: string) => `/user/orders/${id}`,

  // Favorites & Wishlist
  /** F A V O R I T E S */
  FAVORITES: "/user/favorites",
  /** W A T C H L I S T */
  WATCHLIST: "/user/watchlist",
  /** F O L L O W I N G */
  FOLLOWING: "/user/following",

  // Auctions
  /** B I D S */
  BIDS: "/user/bids",
  WON_AUCTIONS: "/user/won-auctions",

  // Account
  /** A D D R E S S E S */
  ADDRESSES: "/user/addresses",
  /** S E T T I N G S */
  SETTINGS: "/user/settings",
  /** H I S T O R Y */
  HISTORY: "/user/history",

  // Messages
  /** M E S S A G E S */
  MESSAGES: "/user/messages",
  MESSAGE_DETAIL: (id: string) => `/user/messages/${id}`,

  // Tickets
  /** T I C K E T S */
  TICKETS: "/user/tickets",
  TICKET_DETAIL: (id: string) => `/user/tickets/${id}`,

  // Notifications & Reviews
  /** N O T I F I C A T I O N S */
  NOTIFICATIONS: "/user/notifications",
  /** R E V I E W S */
  REVIEWS: "/user/reviews",
  /** R E T U R N S */
  RETURNS: "/user/returns",

  // RipLimit
  /** R I P L I M I T */
  RIPLIMIT: "/user/riplimit",
} as const;

// ============================================
// SELLER ROUTES (Requires seller role)
// ============================================
/**
 * Seller Routes
 * @constant
 */
export const SELLER_ROUTES = {
  // Dashboard (main page.tsx at /seller)
  /** D A S H B O A R D */
  DASHBOARD: "/seller",
  // NOTE: /seller/dashboard does not exist - use /seller instead

  // Shops
  MY_SHOPS: "/seller/my-shops",
  SHOP_CREATE: "/seller/my-shops/create",
  SHOP_DETAIL: (slug: string) => `/seller/my-shops/${slug}`,
  SHOP_EDIT: (slug: string) => `/seller/my-shops/${slug}/edit`,
  // NOTE: /seller/settings does not exist - shop settings are in shop edit page

  // Products
  /** P R O D U C T S */
  PRODUCTS: "/seller/products",
  PRODUCT_CREATE: "/seller/products/create",
  PRODUCT_EDIT: (slug: string) => `/seller/products/${slug}/edit`,

  // Auctions
  /** A U C T I O N S */
  AUCTIONS: "/seller/auctions",
  AUCTION_CREATE: "/seller/auctions/create",
  AUCTION_EDIT: (id: string) => `/seller/auctions/${id}/edit`,

  // Orders
  /** O R D E R S */
  ORDERS: "/seller/orders",
  ORDER_DETAIL: (id: string) => `/seller/orders/${id}`,

  // Returns
  /** R E T U R N S */
  RETURNS: "/seller/returns",
  RETURN_DETAIL: (id: string) => `/seller/returns/${id}`,

  // Coupons
  /** C O U P O N S */
  COUPONS: "/seller/coupons",
  COUPON_CREATE: "/seller/coupons/create",
  COUPON_EDIT: (code: string) => `/seller/coupons/${code}/edit`,

  // Revenue
  /** R E V E N U E */
  REVENUE: "/seller/revenue",

  // Analytics
  /** A N A L Y T I C S */
  ANALYTICS: "/seller/analytics",

  // Messages
  /** M E S S A G E S */
  MESSAGES: "/seller/messages",
  MESSAGE_DETAIL: (id: string) => `/seller/messages/${id}`,

  // Support Tickets
  SUPPORT_TICKETS: "/seller/support-tickets",
  SUPPORT_TICKET_DETAIL: (id: string) => `/seller/support-tickets/${id}`,

  // Settings & Reviews
  /** S E T T I N G S */
  SETTINGS: "/seller/settings",
  /** R E V I E W S */
  REVIEWS: "/seller/reviews",
  /** H E L P */
  HELP: "/seller/help",
} as const;

// ============================================
// ADMIN ROUTES (Requires admin role)
// ============================================
/**
 * Admin Routes
 * @constant
 */
export const ADMIN_ROUTES = {
  // Dashboard
  /** O V E R V I E W */
  OVERVIEW: "/admin",
  /** D A S H B O A R D */
  DASHBOARD: "/admin/dashboard",

  // Content Management
  HERO_SLIDES: "/admin/hero-slides",
  HERO_SLIDE_EDIT: (id: string) => `/admin/hero-slides/${id}/edit`,
  /** H O M E P A G E */
  HOMEPAGE: "/admin/homepage",
  FEATURED_SECTIONS: "/admin/featured-sections",
  /** C A T E G O R I E S */
  CATEGORIES: "/admin/categories",
  CATEGORY_EDIT: (id: string) => `/admin/categories/${id}/edit`,
  STATIC_ASSETS: "/admin/static-assets",

  // Events
  /** E V E N T S */
  EVENTS: "/admin/events",
  EVENT_CREATE: "/admin/events/create",
  EVENT_EDIT: (id: string) => `/admin/events/${id}/edit`,

  // Marketplace
  /** S H O P S */
  SHOPS: "/admin/shops",
  SHOP_DETAIL: (id: string) => `/admin/shops/${id}`,
  /** P R O D U C T S */
  PRODUCTS: "/admin/products",
  PRODUCT_DETAIL: (id: string) => `/admin/products/${id}`,
  /** A U C T I O N S */
  AUCTIONS: "/admin/auctions",
  AUCTION_DETAIL: (id: string) => `/admin/auctions/${id}`,
  AUCTIONS_LIVE: "/admin/auctions/live",
  AUCTIONS_MODERATION: "/admin/auctions/moderation",

  // Users
  /** U S E R S */
  USERS: "/admin/users",
  USER_DETAIL: (id: string) => `/admin/users/${id}`,
  /** R E V I E W S */
  REVIEWS: "/admin/reviews",

  // Transactions
  /** O R D E R S */
  ORDERS: "/admin/orders",
  ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  /** P A Y M E N T S */
  PAYMENTS: "/admin/payments",
  PAYMENT_DETAIL: (id: string) => `/admin/payments/${id}`,
  /** P A Y O U T S */
  PAYOUTS: "/admin/payouts",
  PAYOUT_DETAIL: (id: string) => `/admin/payouts/${id}`,
  /** C O U P O N S */
  COUPONS: "/admin/coupons",
  COUPON_DETAIL: (id: string) => `/admin/coupons/${id}`,
  /** R E T U R N S */
  RETURNS: "/admin/returns",
  RETURN_DETAIL: (id: string) => `/admin/returns/${id}`,

  // Support & Tickets
  SUPPORT_TICKETS: "/admin/support-tickets",
  SUPPORT_TICKET_DETAIL: (id: string) => `/admin/support-tickets/${id}`,
  /** T I C K E T S */
  TICKETS: "/admin/tickets",
  TICKET_DETAIL: (id: string) => `/admin/tickets/${id}`,

  // RipLimit Management
  /** R I P L I M I T */
  RIPLIMIT: "/admin/riplimit",

  // Blog
  /** B L O G */
  BLOG: "/admin/blog",
  BLOG_CREATE: "/admin/blog/create",
  BLOG_EDIT: (id: string) => `/admin/blog/${id}/edit`,
  // NOTE: /admin/blog/categories and /admin/blog/tags do not exist yet

  // Settings
  /** S E T T I N G S */
  SETTINGS: "/admin/settings",
  SETTINGS_GENERAL: "/admin/settings/general",
  SETTINGS_PAYMENT: "/admin/settings/payment",
  SETTINGS_SHIPPING: "/admin/settings/shipping",
  SETTINGS_EMAIL: "/admin/settings/email",
  SETTINGS_NOTIFICATIONS: "/admin/settings/notifications",

  // Analytics
  /** A N A L Y T I C S */
  ANALYTICS: "/admin/analytics",
  ANALYTICS_SALES: "/admin/analytics/sales",
  ANALYTICS_AUCTIONS: "/admin/analytics/auctions",
  ANALYTICS_USERS: "/admin/analytics/users",

  // Demo
  /** D E M O */
  DEMO: "/admin/demo",
  DEMO_CREDENTIALS: "/admin/demo-credentials",
  COMPONENT_DEMO: "/admin/component-demo",
} as const;

// ============================================
// COMBINED ROUTES EXPORT
// ============================================
/**
 * Routes
 * @constant
 */
export const ROUTES = {
  /** P U B L I C */
  PUBLIC: PUBLIC_ROUTES,
  /** U S E R */
  USER: USER_ROUTES,
  /** S E L L E R */
  SELLER: SELLER_ROUTES,
  /** A D M I N */
  ADMIN: ADMIN_ROUTES,
} as const;

// Type exports
/**
 * PublicRoutes type
 * 
 * @typedef {Object} PublicRoutes
 * @description Type definition for PublicRoutes
 */
/**
 * PublicRoutes type definition
 *
 * @typedef {typeof PUBLIC_ROUTES} PublicRoutes
 * @description Type definition for PublicRoutes
 */
export type PublicRoutes = typeof PUBLIC_ROUTES;
/**
 * UserRoutes type
 * 
 * @typedef {Object} UserRoutes
 * @description Type definition for UserRoutes
 */
/**
 * UserRoutes type definition
 *
 * @typedef {typeof USER_ROUTES} UserRoutes
 * @description Type definition for UserRoutes
 */
export type UserRoutes = typeof USER_ROUTES;
/**
 * SellerRoutes type
 * 
 * @typedef {Object} SellerRoutes
 * @description Type definition for SellerRoutes
 */
/**
 * SellerRoutes type definition
 *
 * @typedef {typeof SELLER_ROUTES} SellerRoutes
 * @description Type definition for SellerRoutes
 */
export type SellerRoutes = typeof SELLER_ROUTES;
/**
 * AdminRoutes type
 * 
 * @typedef {Object} AdminRoutes
 * @description Type definition for AdminRoutes
 */
/**
 * AdminRoutes type definition
 *
 * @typedef {typeof ADMIN_ROUTES} AdminRoutes
 * @description Type definition for AdminRoutes
 */
export type AdminRoutes = typeof ADMIN_ROUTES;
