/**
 * Route Constants for JustForView Application
 * Centralized route definitions for the refactored UI structure
 */

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  HELP: "/help",
  FAQ: "/faq",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  COOKIES: "/cookies",
} as const;

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_EMAIL: "/auth/verify-email",
} as const;

// Shop Routes
export const SHOP_ROUTES = {
  PRODUCTS: "/shop/products",
  PRODUCT_DETAIL: (slug: string) => `/shop/products/${slug}`,
  CATEGORIES: "/shop/categories",
  CATEGORY_DETAIL: (slug: string) => `/shop/categories/${slug}`,
  SEARCH: "/shop/search",
  COMPARE: "/shop/compare",
  STORES: "/shop/stores",
  STORE_DETAIL: (sellerId: string) => `/shop/stores/${sellerId}`,
  STORE_PRODUCTS: (sellerId: string) => `/shop/stores/${sellerId}/products`,
  STORE_AUCTIONS: (sellerId: string) => `/shop/stores/${sellerId}/auctions`,
  AUCTIONS: "/shop/auctions",
  AUCTION_DETAIL: (id: string) => `/shop/auctions/${id}`,
} as const;

// Account Routes (Protected)
export const ACCOUNT_ROUTES = {
  OVERVIEW: "/account",
  DASHBOARD: "/account/dashboard",
  PROFILE: "/account/profile",
  PROFILE_EDIT: "/account/profile/edit",
  PROFILE_AVATAR: "/account/profile/avatar",
  ADDRESSES: "/account/addresses",
  ADDRESSES_NEW: "/account/addresses/new",
  ADDRESS_EDIT: (id: string) => `/account/addresses/edit/${id}`,
  ORDERS: "/account/orders",
  ORDERS_ACTIVE: "/account/orders/active",
  ORDERS_COMPLETED: "/account/orders/completed",
  ORDERS_CANCELLED: "/account/orders/cancelled",
  ORDER_DETAIL: (id: string) => `/account/orders/${id}`,
  TRACK_ORDER: "/account/orders/track",
  CART: "/account/cart",
  CHECKOUT: "/account/checkout",
  CHECKOUT_SHIPPING: "/account/checkout/shipping",
  CHECKOUT_PAYMENT: "/account/checkout/payment",
  CHECKOUT_REVIEW: "/account/checkout/review",
  WISHLIST: "/account/wishlist",
  WISHLIST_PUBLIC: "/account/wishlist/public",
  WISHLIST_PRIVATE: "/account/wishlist/private",
  RETURNS: "/account/returns",
  RETURNS_ACTIVE: "/account/returns/active",
  RETURNS_COMPLETED: "/account/returns/completed",
  NEW_RETURN: "/account/returns/new",
  RETURN_DETAIL: (id: string) => `/account/returns/${id}`,
  REVIEWS: "/account/reviews",
  REVIEWS_PENDING: "/account/reviews/pending",
  REVIEWS_PUBLISHED: "/account/reviews/published",
  NEW_REVIEW: (productId: string) => `/account/reviews/new/${productId}`,
  NOTIFICATIONS: "/account/notifications",
  NOTIFICATIONS_UNREAD: "/account/notifications/unread",
  NOTIFICATIONS_READ: "/account/notifications/read",
  SETTINGS: "/account/settings",
  SETTINGS_GENERAL: "/account/settings/general",
  SETTINGS_PRIVACY: "/account/settings/privacy",
  SETTINGS_SECURITY: "/account/settings/security",
  SETTINGS_NOTIFICATIONS: "/account/settings/notifications",
  SETTINGS_BILLING: "/account/settings/billing",
  SHIPPING: "/account/shipping",
  SHIPPING_METHODS: "/account/shipping/methods",
  SHIPPING_ZONES: "/account/shipping/zones",
} as const;

// Seller Routes (Protected)
export const SELLER_ROUTES = {
  DASHBOARD: "/seller/dashboard",
  ANALYTICS: "/seller/analytics",
  PRODUCTS: "/seller/products",
  PRODUCTS_ALL: "/seller/products/all",
  NEW_PRODUCT: "/seller/products/new",
  EDIT_PRODUCT: (id: string) => `/seller/products/edit/${id}`,
  INVENTORY: "/seller/products/inventory",
  INVENTORY_MANAGE: "/seller/products/inventory/manage",
  INVENTORY_ALERTS: "/seller/products/inventory/alerts",
  ORDERS: "/seller/orders",
  ORDERS_PENDING: "/seller/orders/pending",
  ORDERS_PROCESSING: "/seller/orders/processing",
  ORDERS_SHIPPED: "/seller/orders/shipped",
  ORDERS_COMPLETED: "/seller/orders/completed",
  ORDER_DETAIL: (id: string) => `/seller/orders/${id}`,
  AUCTIONS: "/seller/auctions",
  AUCTIONS_ACTIVE: "/seller/auctions/active",
  AUCTIONS_SCHEDULED: "/seller/auctions/scheduled",
  AUCTIONS_COMPLETED: "/seller/auctions/completed",
  NEW_AUCTION: "/seller/auctions/new",
  AUCTION_DETAIL: (id: string) => `/seller/auctions/${id}`,
  NOTIFICATIONS: "/seller/notifications",
  SETTINGS: "/seller/settings",
  SETTINGS_GENERAL: "/seller/settings/general",
  SETTINGS_THEME: "/seller/settings/theme",
  SETTINGS_PROFILE: "/seller/settings/profile",
  SETTINGS_NOTIFICATIONS: "/seller/settings/notifications",
  SETTINGS_STORE: "/seller/settings/store",
  SETTINGS_ANALYTICS: "/seller/settings/analytics",
  COUPONS: "/seller/coupons",
  COUPONS_ACTIVE: "/seller/coupons/active",
  COUPONS_EXPIRED: "/seller/coupons/expired",
  NEW_COUPON: "/seller/coupons/new",
} as const;

// Admin Routes (Protected)
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  ANALYTICS: "/admin/analytics",
  ANALYTICS_SALES: "/admin/analytics/sales",
  ANALYTICS_USERS: "/admin/analytics/users",
  ANALYTICS_PRODUCTS: "/admin/analytics/products",
  INITIALIZE: "/admin/initialize",
  PRODUCTS: "/admin/products",
  PRODUCTS_ALL: "/admin/products/all",
  PRODUCTS_PENDING: "/admin/products/pending",
  PRODUCTS_APPROVED: "/admin/products/approved",
  PRODUCTS_REJECTED: "/admin/products/rejected",
  PRODUCT_DETAIL: (id: string) => `/admin/products/${id}`,
  CATEGORIES: "/admin/categories",
  CATEGORIES_MANAGE: "/admin/categories/manage",
  CATEGORIES_NEW: "/admin/categories/new",
  CATEGORY_DETAIL: (id: string) => `/admin/categories/${id}`,
  AUCTIONS: "/admin/auctions",
  AUCTIONS_ACTIVE: "/admin/auctions/active",
  AUCTIONS_PENDING: "/admin/auctions/pending",
  AUCTIONS_COMPLETED: "/admin/auctions/completed",
  HOMEPAGE: "/admin/homepage",
  HOMEPAGE_HERO: "/admin/homepage/hero",
  HOMEPAGE_FEATURES: "/admin/homepage/features",
  HOMEPAGE_SECTIONS: "/admin/homepage/sections",
  CUSTOMERS: "/admin/customers",
  CUSTOMERS_ACTIVE: "/admin/customers/active",
  CUSTOMERS_INACTIVE: "/admin/customers/inactive",
  CUSTOMER_DETAIL: (id: string) => `/admin/customers/${id}`,
  ORDERS: "/admin/orders",
  ORDERS_PENDING: "/admin/orders/pending",
  ORDERS_PROCESSING: "/admin/orders/processing",
  ORDERS_SHIPPED: "/admin/orders/shipped",
  ORDERS_COMPLETED: "/admin/orders/completed",
  ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  REVIEWS: "/admin/reviews",
  REVIEWS_PENDING: "/admin/reviews/pending",
  REVIEWS_APPROVED: "/admin/reviews/approved",
  REVIEWS_REJECTED: "/admin/reviews/rejected",
  NOTIFICATIONS: "/admin/notifications",
  COUPONS: "/admin/coupons",
  COUPONS_ACTIVE: "/admin/coupons/active",
  COUPONS_EXPIRED: "/admin/coupons/expired",
  NEW_COUPON: "/admin/coupons/new",
  POLICIES: "/admin/policies",
  POLICIES_PRIVACY: "/admin/policies/privacy",
  POLICIES_TERMS: "/admin/policies/terms",
  POLICIES_RETURNS: "/admin/policies/returns",
  DATA_MANAGEMENT: "/admin/data-management",
  DATA_EXPORT: "/admin/data-management/export",
  DATA_IMPORT: "/admin/data-management/import",
  DATA_BACKUP: "/admin/data-management/backup",
  CLEANUP: "/admin/cleanup",
  SETTINGS: "/admin/settings",
  SETTINGS_GENERAL: "/admin/settings/general",
  SETTINGS_THEME: "/admin/settings/theme",
  SETTINGS_SYSTEM: "/admin/settings/system",
  SETTINGS_SECURITY: "/admin/settings/security",
  SETTINGS_MAINTENANCE: "/admin/settings/maintenance",
} as const;

// Development Routes (Development only)
export const DEV_ROUTES = {
  AUTH_DEBUG: "/dev/auth-debug",
  AUTH_STATUS: "/dev/auth-status",
  AUTO_LOGIN_TEST: "/dev/auto-login-test",
  TEST_AUTH: "/dev/test-auth",
  TEST_NAVIGATION: "/dev/test-navigation",
  TEST_ROLES: "/dev/test-roles",
  USER_FEATURES: "/dev/user-features",
  UNAUTHORIZED: "/dev/unauthorized",
} as const;

// Legacy Routes (for backward compatibility)
export const LEGACY_ROUTES = {
  STORES: "/stores",
  SEARCH: "/search",
  COMPARE: "/compare",
  PROFILE: "/profile",
  ACCOUNT: "/account",
  ADDRESSES: "/addresses",
  ORDERS: "/orders",
  TRACK_ORDER: "/track-order",
  CART: "/cart",
  CHECKOUT: "/checkout",
  WISHLIST: "/wishlist",
  RETURNS: "/returns",
  REVIEWS: "/reviews",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  SHIPPING: "/shipping",
  DASHBOARD: "/dashboard",
} as const;

// Route Groups
export const ROUTE_GROUPS = {
  PUBLIC: "public",
  AUTH: "auth",
  SHOP: "shop",
  ACCOUNT: "account",
  SELLER: "seller",
  ADMIN: "admin",
  DEV: "dev",
} as const;

// Route Mappings for redirects
export const ROUTE_MAPPINGS = {
  [LEGACY_ROUTES.STORES]: SHOP_ROUTES.STORES,
  [LEGACY_ROUTES.SEARCH]: SHOP_ROUTES.SEARCH,
  [LEGACY_ROUTES.COMPARE]: SHOP_ROUTES.COMPARE,
  [LEGACY_ROUTES.PROFILE]: ACCOUNT_ROUTES.PROFILE,
  [LEGACY_ROUTES.ACCOUNT]: ACCOUNT_ROUTES.OVERVIEW,
  [LEGACY_ROUTES.ADDRESSES]: ACCOUNT_ROUTES.ADDRESSES,
  [LEGACY_ROUTES.ORDERS]: ACCOUNT_ROUTES.ORDERS,
  [LEGACY_ROUTES.TRACK_ORDER]: ACCOUNT_ROUTES.TRACK_ORDER,
  [LEGACY_ROUTES.CART]: ACCOUNT_ROUTES.CART,
  [LEGACY_ROUTES.CHECKOUT]: ACCOUNT_ROUTES.CHECKOUT,
  [LEGACY_ROUTES.WISHLIST]: ACCOUNT_ROUTES.WISHLIST,
  [LEGACY_ROUTES.RETURNS]: ACCOUNT_ROUTES.RETURNS,
  [LEGACY_ROUTES.REVIEWS]: ACCOUNT_ROUTES.REVIEWS,
  [LEGACY_ROUTES.NOTIFICATIONS]: ACCOUNT_ROUTES.NOTIFICATIONS,
  [LEGACY_ROUTES.SETTINGS]: ACCOUNT_ROUTES.SETTINGS,
  [LEGACY_ROUTES.SHIPPING]: ACCOUNT_ROUTES.SHIPPING,
  [LEGACY_ROUTES.DASHBOARD]: ACCOUNT_ROUTES.DASHBOARD,
} as const;

// Helper functions
export const getRouteGroup = (pathname: string): string => {
  if (pathname.startsWith("/auth")) return ROUTE_GROUPS.AUTH;
  if (pathname.startsWith("/shop")) return ROUTE_GROUPS.SHOP;
  if (pathname.startsWith("/account")) return ROUTE_GROUPS.ACCOUNT;
  if (pathname.startsWith("/seller")) return ROUTE_GROUPS.SELLER;
  if (pathname.startsWith("/admin")) return ROUTE_GROUPS.ADMIN;
  if (pathname.startsWith("/dev")) return ROUTE_GROUPS.DEV;
  return ROUTE_GROUPS.PUBLIC;
};

export const isProtectedRoute = (pathname: string): boolean => {
  const group = getRouteGroup(pathname);
  return [
    ROUTE_GROUPS.ACCOUNT,
    ROUTE_GROUPS.SELLER,
    ROUTE_GROUPS.ADMIN,
  ].includes(group as any);
};

export const getRedirectRoute = (legacyRoute: string): string | null => {
  return ROUTE_MAPPINGS[legacyRoute as keyof typeof ROUTE_MAPPINGS] || null;
};

export const isLegacyRoute = (pathname: string): boolean => {
  return Object.values(LEGACY_ROUTES).includes(pathname as any);
};

export default {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  SHOP_ROUTES,
  ACCOUNT_ROUTES,
  SELLER_ROUTES,
  ADMIN_ROUTES,
  DEV_ROUTES,
  LEGACY_ROUTES,
  ROUTE_GROUPS,
  ROUTE_MAPPINGS,
  getRouteGroup,
  isProtectedRoute,
  getRedirectRoute,
  isLegacyRoute,
};
