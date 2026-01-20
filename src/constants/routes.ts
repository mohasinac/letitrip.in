/**
 * Application Routes
 *
 * Centralized route paths for the entire application.
 * Use these constants instead of hardcoded strings for type safety and consistency.
 *
 * @example
 * ```tsx
 * import { ROUTES } from '@/constants/routes';
 *
 * <Link href={ROUTES.PRODUCTS.LIST}>Products</Link>
 * <Link href={ROUTES.PRODUCTS.DETAIL('laptop-hp-15')}>Product Detail</Link>
 * ```
 */

export const ROUTES = {
  // Public routes
  HOME: "/",

  // Products
  PRODUCTS: {
    LIST: "/buy-product-all",
    DETAIL: (slug: string) => `/buy-product-${slug}`,
    FILTERS: (...filters: string[]) => `/buy-product-${filters.join("/")}`,
  },

  // Auctions
  AUCTIONS: {
    LIST: "/buy-auction-all",
    DETAIL: (slug: string) => `/buy-auction-${slug}`,
    FILTERS: (...filters: string[]) => `/buy-auction-${filters.join("/")}`,
  },

  // Shops
  SHOPS: {
    LIST: "/shops",
    DETAIL: (slug: string) => `/shops/${slug}`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/categories",
    DETAIL: (slug: string) => `/categories/${slug}`,
  },

  // Search
  SEARCH: "/search",
  COMPARE: "/compare",
  DEALS: "/deals",

  // Auth routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },

  // Protected user routes
  CART: "/cart",
  CHECKOUT: "/checkout",

  USER: {
    PROFILE: "/user/profile",
    ORDERS: "/user/orders",
    ORDER_DETAIL: (id: string) => `/user/orders/${id}`,
    ADDRESSES: "/user/addresses",
    WISHLIST: "/user/wishlist",
    MESSAGES: "/user/messages",
    SETTINGS: "/user/settings",
  },

  // Seller routes
  SELLER: {
    DASHBOARD: "/seller/dashboard",
    PRODUCTS: "/seller/products",
    PRODUCT_CREATE: "/seller/products/create",
    PRODUCT_EDIT: (id: string) => `/seller/products/${id}/edit`,
    AUCTIONS: "/seller/auctions",
    AUCTION_CREATE: "/seller/auctions/create",
    AUCTION_EDIT: (id: string) => `/seller/auctions/${id}/edit`,
    ORDERS: "/seller/orders",
    SHOP: "/seller/shop",
    ANALYTICS: "/seller/analytics",
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    PRODUCTS: "/admin/products",
    PRODUCT_DETAIL: (id: string) => `/admin/products/${id}`,
    AUCTIONS: "/admin/auctions",
    AUCTION_DETAIL: (id: string) => `/admin/auctions/${id}`,
    ORDERS: "/admin/orders",
    ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
    SHOPS: "/admin/shops",
    SHOP_DETAIL: (id: string) => `/admin/shops/${id}`,
    CATEGORIES: "/admin/categories",
    REVIEWS: "/admin/reviews",
    ANALYTICS: "/admin/analytics",
    SETTINGS: "/admin/settings",
  },

  // Legal & Info
  ABOUT: "/about",
  CONTACT: "/contact",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  FAQ: "/faq",
} as const;

/**
 * Route helper to check if current path matches a route
 */
export function isActiveRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * Route groups for access control
 */
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.PRODUCTS.LIST,
    ROUTES.AUCTIONS.LIST,
    ROUTES.SHOPS.LIST,
    ROUTES.CATEGORIES.LIST,
    ROUTES.SEARCH,
    ROUTES.DEALS,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.TERMS,
    ROUTES.PRIVACY,
    ROUTES.FAQ,
  ],
  AUTH: [
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
  ],
  PROTECTED: [ROUTES.CART, ROUTES.CHECKOUT, ...Object.values(ROUTES.USER)],
  SELLER: Object.values(ROUTES.SELLER),
  ADMIN: Object.values(ROUTES.ADMIN),
} as const;
