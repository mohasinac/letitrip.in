/**
 * Application Routes Constants
 *
 * Centralized route paths for consistency across the application
 */

export const ROUTES = {
  // Public Routes
  HOME: "/",

  PUBLIC: {
    FAQS: "/faqs",
    PROFILE: (userId: string) => `/profile/${userId}`,
    PRODUCTS: "/products",
    AUCTIONS: "/auctions",
    SELLERS: "/sellers",
    CATEGORIES: "/categories",
    PROMOTIONS: "/promotions",
    ABOUT: "/about",
    CONTACT: "/contact",
    BLOG: "/blog",
    HELP: "/help",
    TERMS: "/terms",
    PRIVACY: "/privacy",
  },

  // Error Pages
  ERRORS: {
    UNAUTHORIZED: "/unauthorized",
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
    ADDRESSES_ADD: "/user/addresses/add",
    ADDRESSES_EDIT: (id: string) => `/user/addresses/edit/${id}`,
    ORDER_DETAIL: (id: string) => `/user/orders/view/${id}`,
    CART: "/cart",
  },

  // Seller Routes
  SELLER: {
    DASHBOARD: "/seller",
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
    COUPONS: "/admin/coupons",
    MEDIA: "/admin/media",
  },

  // Demo Routes (dev-only)
  DEMO: {
    SEED: "/demo/seed",
  },
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.PUBLIC.FAQS,
  ROUTES.PUBLIC.PRODUCTS,
  ROUTES.PUBLIC.AUCTIONS,
  ROUTES.PUBLIC.SELLERS,
  ROUTES.PUBLIC.CATEGORIES,
  ROUTES.PUBLIC.PROMOTIONS,
  ROUTES.PUBLIC.ABOUT,
  ROUTES.PUBLIC.CONTACT,
  ROUTES.PUBLIC.BLOG,
  ROUTES.PUBLIC.HELP,
  ROUTES.PUBLIC.TERMS,
  ROUTES.PUBLIC.PRIVACY,
  ROUTES.ERRORS.UNAUTHORIZED,
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
  ROUTES.USER.ORDERS,
  ROUTES.USER.WISHLIST,
  ROUTES.USER.ADDRESSES,
  ROUTES.USER.ADDRESSES_ADD,
  ROUTES.USER.CART,
] as const;

/**
 * Auth routes that should redirect to home if already authenticated
 */
export const AUTH_ROUTES = [ROUTES.AUTH.LOGIN, ROUTES.AUTH.REGISTER] as const;
