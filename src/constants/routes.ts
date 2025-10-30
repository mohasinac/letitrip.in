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
  // Product & Shopping Routes
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  AUCTIONS: "/auctions",
  STORES: "/stores",
  BLOG: "/blog",
  // Additional Routes
  RETURNS: "/returns",
  COMMUNITY: "/community",
} as const;

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_EMAIL: "/auth/verify-email",
} as const;

// Shop Routes - REMOVED
// All shop routes have been removed as requested

// Account Routes (Protected) - REMOVED
// All account routes have been removed as requested

// Seller Routes (Protected)
export const SELLER_ROUTES = {
  DASHBOARD: "/seller/dashboard",
  SHOP_SETUP: "/seller/shop",
  PRODUCTS: "/seller/products",
  PRODUCTS_NEW: "/seller/products/new",
  PRODUCTS_EDIT: (id: string) => `/seller/products/${id}/edit`,
  ORDERS: "/seller/orders",
  ORDERS_DETAIL: (id: string) => `/seller/orders/${id}`,
  COUPONS: "/seller/coupons",
  COUPONS_NEW: "/seller/coupons/new",
  COUPONS_EDIT: (id: string) => `/seller/coupons/${id}/edit`,
  SALES: "/seller/sales",
  SALES_NEW: "/seller/sales/new",
  SALES_EDIT: (id: string) => `/seller/sales/${id}/edit`,
  SHIPMENTS: "/seller/shipments",
  SHIPMENTS_DETAIL: (id: string) => `/seller/shipments/${id}`,
  ALERTS: "/seller/alerts",
  ANALYTICS: "/seller/analytics",
  SETTINGS: "/seller/settings",
} as const;

// Admin Routes (Protected)
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  PRODUCTS: "/admin/products",
  CATEGORIES: "/admin/categories",
  ORDERS: "/admin/orders",
  USERS: "/admin/users",
  ANALYTICS: "/admin/analytics",
  SETTINGS: "/admin/settings",
} as const;

// Development Routes (Development only) - REMOVED
// All dev routes have been removed as requested

// Legacy Routes (for backward compatibility) - REMOVED
// All legacy routes have been removed as requested

// Route Groups
export const ROUTE_GROUPS = {
  PUBLIC: "public",
  AUTH: "auth",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

// Helper functions
export const getRouteGroup = (pathname: string): string => {
  if (pathname.startsWith("/auth")) return ROUTE_GROUPS.AUTH;
  if (pathname.startsWith("/seller")) return ROUTE_GROUPS.SELLER;
  if (pathname.startsWith("/admin")) return ROUTE_GROUPS.ADMIN;
  return ROUTE_GROUPS.PUBLIC;
};

export const isProtectedRoute = (pathname: string): boolean => {
  return pathname.startsWith("/seller") || pathname.startsWith("/admin");
};

export const getRedirectRoute = (legacyRoute: string): string | null => {
  // No redirects remaining
  return null;
};

export const isLegacyRoute = (pathname: string): boolean => {
  // No legacy routes remaining
  return false;
};

export default {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  SELLER_ROUTES,
  ADMIN_ROUTES,
  ROUTE_GROUPS,
  getRouteGroup,
  isProtectedRoute,
  getRedirectRoute,
  isLegacyRoute,
};
