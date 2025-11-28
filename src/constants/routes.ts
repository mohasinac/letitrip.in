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
export const PUBLIC_ROUTES = {
  // Home
  HOME: "/",

  // Authentication
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/logout",
  // NOTE: /forgot-password route does not exist - password reset is handled via /login
  // FORGOT_PASSWORD: "/forgot-password", // REMOVED - Route does not exist

  // Browse
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  AUCTIONS: "/auctions",
  AUCTION_DETAIL: (slug: string) => `/auctions/${slug}`,
  SHOPS: "/shops",
  SHOP_DETAIL: (slug: string) => `/shops/${slug}`,
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}`,
  SEARCH: "/search",
  BLOG: "/blog",
  BLOG_POST: (slug: string) => `/blog/${slug}`,

  // Reviews
  REVIEWS: "/reviews",

  // Cart & Checkout
  CART: "/cart",
  CHECKOUT: "/checkout",

  // Legal & Info Pages
  ABOUT: "/about",
  FAQ: "/faq",
  CONTACT: "/contact",
  TERMS_OF_SERVICE: "/terms-of-service",
  PRIVACY_POLICY: "/privacy-policy",
  REFUND_POLICY: "/refund-policy",
  SHIPPING_POLICY: "/shipping-policy",
  COOKIE_POLICY: "/cookie-policy",

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
  UNAUTHORIZED: "/unauthorized",
  FORBIDDEN: "/forbidden",
} as const;

// ============================================
// USER ROUTES (Requires authentication)
// ============================================
export const USER_ROUTES = {
  // Dashboard
  DASHBOARD: "/user",

  // Orders
  ORDERS: "/user/orders",
  ORDER_DETAIL: (id: string) => `/user/orders/${id}`,

  // Favorites & Wishlist
  FAVORITES: "/user/favorites",
  WATCHLIST: "/user/watchlist",
  FOLLOWING: "/user/following",

  // Auctions
  BIDS: "/user/bids",
  WON_AUCTIONS: "/user/won-auctions",

  // Account
  ADDRESSES: "/user/addresses",
  SETTINGS: "/user/settings",
  HISTORY: "/user/history",

  // Messages
  MESSAGES: "/user/messages",
  MESSAGE_DETAIL: (id: string) => `/user/messages/${id}`,

  // Tickets
  TICKETS: "/user/tickets",
  TICKET_DETAIL: (id: string) => `/user/tickets/${id}`,

  // NOTE: These routes do not exist yet - pending implementation
  // NOTIFICATIONS: "/user/notifications", // E016 - Not implemented
  // RETURNS: "/user/returns", // Uses /user/orders for now
  // REVIEWS: "/user/reviews", // Uses /reviews for now
} as const;

// ============================================
// SELLER ROUTES (Requires seller role)
// ============================================
export const SELLER_ROUTES = {
  // Dashboard (main page.tsx at /seller)
  DASHBOARD: "/seller",
  // NOTE: /seller/dashboard does not exist - use /seller instead

  // Shops
  MY_SHOPS: "/seller/my-shops",
  SHOP_CREATE: "/seller/my-shops/create",
  SHOP_DETAIL: (slug: string) => `/seller/my-shops/${slug}`,
  SHOP_EDIT: (slug: string) => `/seller/my-shops/${slug}/edit`,
  // NOTE: /seller/settings does not exist - shop settings are in shop edit page

  // Products
  PRODUCTS: "/seller/products",
  PRODUCT_CREATE: "/seller/products/create",
  PRODUCT_EDIT: (slug: string) => `/seller/products/${slug}/edit`,

  // Auctions
  AUCTIONS: "/seller/auctions",
  AUCTION_CREATE: "/seller/auctions/create",
  AUCTION_EDIT: (id: string) => `/seller/auctions/${id}/edit`,

  // Orders
  ORDERS: "/seller/orders",
  ORDER_DETAIL: (id: string) => `/seller/orders/${id}`,

  // Returns
  RETURNS: "/seller/returns",
  RETURN_DETAIL: (id: string) => `/seller/returns/${id}`,

  // Coupons
  COUPONS: "/seller/coupons",
  COUPON_CREATE: "/seller/coupons/create",
  COUPON_EDIT: (code: string) => `/seller/coupons/${code}/edit`,

  // Revenue
  REVENUE: "/seller/revenue",

  // Analytics
  ANALYTICS: "/seller/analytics",

  // Messages
  MESSAGES: "/seller/messages",
  MESSAGE_DETAIL: (id: string) => `/seller/messages/${id}`,

  // Support Tickets
  SUPPORT_TICKETS: "/seller/support-tickets",
  SUPPORT_TICKET_DETAIL: (id: string) => `/seller/support-tickets/${id}`,
  // NOTE: /seller/support-tickets/create does not exist - use support/create or inline creation

  // NOTE: These routes do not exist
  // SETTINGS: "/seller/settings", // REMOVED - Use shop edit page instead
  // REVIEWS: "/seller/reviews", // REMOVED - Not implemented
  // HELP: "/seller/help", // REMOVED - Not implemented
} as const;

// ============================================
// ADMIN ROUTES (Requires admin role)
// ============================================
export const ADMIN_ROUTES = {
  // Dashboard
  OVERVIEW: "/admin",
  DASHBOARD: "/admin/dashboard",

  // Content Management
  HERO_SLIDES: "/admin/hero-slides",
  HERO_SLIDE_EDIT: (id: string) => `/admin/hero-slides/${id}/edit`,
  HOMEPAGE: "/admin/homepage",
  CATEGORIES: "/admin/categories",
  CATEGORY_EDIT: (id: string) => `/admin/categories/${id}/edit`,
  STATIC_ASSETS: "/admin/static-assets",
  // NOTE: /admin/featured-sections does not exist - use homepage instead

  // Marketplace
  SHOPS: "/admin/shops",
  SHOP_DETAIL: (id: string) => `/admin/shops/${id}`,
  PRODUCTS: "/admin/products",
  PRODUCT_DETAIL: (id: string) => `/admin/products/${id}`,
  AUCTIONS: "/admin/auctions",
  AUCTION_DETAIL: (id: string) => `/admin/auctions/${id}`,
  AUCTIONS_LIVE: "/admin/auctions/live",
  AUCTIONS_MODERATION: "/admin/auctions/moderation",

  // Users
  USERS: "/admin/users",
  USER_DETAIL: (id: string) => `/admin/users/${id}`,
  REVIEWS: "/admin/reviews",

  // Transactions
  ORDERS: "/admin/orders",
  ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  PAYMENTS: "/admin/payments",
  PAYMENT_DETAIL: (id: string) => `/admin/payments/${id}`,
  PAYOUTS: "/admin/payouts",
  PAYOUT_DETAIL: (id: string) => `/admin/payouts/${id}`,
  COUPONS: "/admin/coupons",
  COUPON_DETAIL: (id: string) => `/admin/coupons/${id}`,
  RETURNS: "/admin/returns",
  RETURN_DETAIL: (id: string) => `/admin/returns/${id}`,

  // Support
  SUPPORT_TICKETS: "/admin/support-tickets",
  SUPPORT_TICKET_DETAIL: (id: string) => `/admin/support-tickets/${id}`,

  // Blog
  BLOG: "/admin/blog",
  BLOG_CREATE: "/admin/blog/create",
  BLOG_EDIT: (id: string) => `/admin/blog/${id}/edit`,
  // NOTE: /admin/blog/categories and /admin/blog/tags do not exist yet

  // Settings (placeholder page exists)
  SETTINGS: "/admin/settings",
  // NOTE: Individual settings pages do not exist yet:
  // SETTINGS_GENERAL: "/admin/settings/general",
  // SETTINGS_PAYMENT: "/admin/settings/payment",
  // SETTINGS_SHIPPING: "/admin/settings/shipping",
  // SETTINGS_EMAIL: "/admin/settings/email",
  // SETTINGS_NOTIFICATIONS: "/admin/settings/notifications",

  // NOTE: Analytics routes do not exist yet
  // ANALYTICS: "/admin/analytics",
  // ANALYTICS_SALES: "/admin/analytics/sales",
  // ANALYTICS_AUCTIONS: "/admin/analytics/auctions",
  // ANALYTICS_USERS: "/admin/analytics/users",

  // Demo
  DEMO: "/admin/demo",
  DEMO_CREDENTIALS: "/admin/demo-credentials",
  COMPONENT_DEMO: "/admin/component-demo",
} as const;

// ============================================
// COMBINED ROUTES EXPORT
// ============================================
export const ROUTES = {
  PUBLIC: PUBLIC_ROUTES,
  USER: USER_ROUTES,
  SELLER: SELLER_ROUTES,
  ADMIN: ADMIN_ROUTES,
} as const;

// Type exports
export type PublicRoutes = typeof PUBLIC_ROUTES;
export type UserRoutes = typeof USER_ROUTES;
export type SellerRoutes = typeof SELLER_ROUTES;
export type AdminRoutes = typeof ADMIN_ROUTES;
