/**
 * Application Routes Constants
 *
 * Centralized route paths for consistency across the application
 */

export const ROUTES = {
  // Public Routes
  HOME: "/",

  // Error Pages
  ERRORS: {
    UNAUTHORIZED: "/unauthorized",
    NOT_FOUND: "/404",
  },

  // Auth Routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // User Routes
  USER: {
    PROFILE: "/user/profile",
    SETTINGS: "/user/settings",
    ORDERS: "/user/orders",
    WISHLIST: "/user/wishlist",
    ADDRESSES: "/user/addresses",
  },

  // Admin Routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    SITE: "/admin/site",
    CAROUSEL: "/admin/carousel",
    SECTIONS: "/admin/sections",
    CATEGORIES: "/admin/categories",
    FAQS: "/admin/faqs",
    REVIEWS: "/admin/reviews",
    CONTENT: "/admin/content",
  },

  // API Routes
  API: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      LOGOUT: "/api/auth/logout",
      VERIFY_EMAIL: "/api/auth/verify-email",
      RESET_PASSWORD: "/api/auth/reset-password",
    },
    USER: {
      PROFILE: "/api/user/profile",
      CHANGE_PASSWORD: "/api/user/change-password",
    },
  },
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ERRORS.UNAUTHORIZED,
  ROUTES.ERRORS.NOT_FOUND,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.VERIFY_EMAIL,
] as const;

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.USER.PROFILE,
  ROUTES.USER.SETTINGS,
] as const;

/**
 * Auth routes that should redirect to home if already authenticated
 */
export const AUTH_ROUTES = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.REGISTER] as const;
