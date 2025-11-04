/**
 * Application Route Constants
 * Centralized route definitions for consistent navigation across the app
 */

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  CART: "/cart",
  WISHLIST: "/wishlist",
  SEARCH: "/search",
  ABOUT: "/about",
  CONTACT: "/contact",
  HELP: "/help",
  FAQ: "/faq",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  COOKIES: "/cookies",
  ACCESSIBILITY: "/accessibility",
  SITEMAP: "/sitemap-page",
} as const;

// Shop Routes
export const SHOP_ROUTES = {
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  SEARCH: "/search",
  COMPARE: "/products/compare",
  STORES: "/stores",
  AUCTIONS: "/auctions",
} as const;

// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

// Account/Profile Routes
export const ACCOUNT_ROUTES = {
  DASHBOARD: "/profile",
  PROFILE: "/profile",
  ORDERS: "/profile/orders",
  CART: "/cart",
  WISHLIST: "/wishlist",
  ADDRESSES: "/profile/addresses",
  TRACK_ORDER: "/profile/track-order",
  RETURNS: "/profile/returns",
  REVIEWS: "/profile/reviews",
  NOTIFICATIONS: "/profile/notifications",
  SETTINGS: "/profile/settings",
} as const;

// Seller Routes
export const SELLER_ROUTES = {
  DASHBOARD: "/seller/dashboard",
  SHOP_SETUP: "/seller/shop",
  PRODUCTS: "/seller/products",
  NEW_PRODUCT: "/seller/products/new",
  ORDERS: "/seller/orders",
  SHIPMENTS: "/seller/shipments",
  BULK_TRACK: "/seller/shipments/bulk-track",
  BULK_LABELS: "/seller/shipments/bulk-labels",
  BULK_INVOICE: "/seller/orders/bulk-invoice",
  COUPONS: "/seller/coupons",
  SALES: "/seller/sales",
  NEW_SALE: "/seller/sales/new",
  ANALYTICS: "/seller/analytics",
  ALERTS: "/seller/alerts",
  SETTINGS: "/seller/settings",
} as const;

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  ANALYTICS: "/admin/analytics",
  PRODUCTS: "/admin/products",
  CATEGORIES: "/admin/categories",
  ORDERS: "/admin/orders",
  SHIPMENTS: "/admin/shipments",
  BULK: "/admin/bulk",
  USERS: "/admin/users",
  COUPONS: "/admin/coupons",
  SALES: "/admin/sales",
  REVIEWS: "/admin/reviews",
  SUPPORT: "/admin/support",
  NOTIFICATIONS: "/admin/notifications",
  SETTINGS: "/admin/settings",
  
  // Game Routes
  GAME: "/admin/game/beyblades",
  GAME_BEYBLADES: "/admin/game/beyblades",
  GAME_BEYBLADES_CREATE: "/admin/game/beyblades/create",
  GAME_STADIUMS: "/admin/game/stadiums",
  GAME_STATS: "/admin/game/stats",
  GAME_SETTINGS: "/admin/game/settings",
  
  // Debug Routes (dev only)
  DEBUG: "/admin/debug",
  COMPONENT_SHOWCASE: "/admin/component-showcase",
} as const;

// Game Routes (Public)
export const GAME_ROUTES = {
  LANDING: "/game",
  BATTLE: "/game/beyblade-battle",
} as const;

// Checkout Routes
export const CHECKOUT_ROUTES = {
  CART: "/cart",
  CHECKOUT: "/checkout",
  SUCCESS: "/checkout/success",
  CANCELED: "/checkout/canceled",
} as const;

// Error Routes
export const ERROR_ROUTES = {
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",
  SERVER_ERROR: "/500",
} as const;

// Type exports for type safety
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type ShopRoute = typeof SHOP_ROUTES[keyof typeof SHOP_ROUTES];
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type AccountRoute = typeof ACCOUNT_ROUTES[keyof typeof ACCOUNT_ROUTES];
export type SellerRoute = typeof SELLER_ROUTES[keyof typeof SELLER_ROUTES];
export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES];
export type GameRoute = typeof GAME_ROUTES[keyof typeof GAME_ROUTES];

// Helper function to check if a route requires authentication
export function requiresAuth(path: string): boolean {
  return (
    path.startsWith("/profile") ||
    path.startsWith("/seller") ||
    path.startsWith("/admin") ||
    path.startsWith("/checkout")
  );
}

// Helper function to check if a route is seller-only
export function isSellerRoute(path: string): boolean {
  return path.startsWith("/seller");
}

// Helper function to check if a route is admin-only
export function isAdminRoute(path: string): boolean {
  return path.startsWith("/admin");
}
