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

// Seller Routes (Protected) - REMOVED
// All seller routes have been removed as requested

// Admin Routes (Protected) - REMOVED
// All admin routes have been removed as requested

// Development Routes (Development only) - REMOVED  
// All dev routes have been removed as requested

// Legacy Routes (for backward compatibility) - REMOVED
// All legacy routes have been removed as requested

// Route Groups
export const ROUTE_GROUPS = {
  PUBLIC: "public",
  AUTH: "auth",
} as const;

// Route Mappings for redirects - REMOVED
// All route mappings have been removed as requested

// Helper functions
export const getRouteGroup = (pathname: string): string => {
  if (pathname.startsWith("/auth")) return ROUTE_GROUPS.AUTH;
  return ROUTE_GROUPS.PUBLIC;
};

export const isProtectedRoute = (pathname: string): boolean => {
  // No protected routes remaining
  return false;
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
  ROUTE_GROUPS,
  getRouteGroup,
  isProtectedRoute,
  getRedirectRoute,
  isLegacyRoute,
};
