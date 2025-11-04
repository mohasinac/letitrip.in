/**
 * Constants Index
 * Central export point for all application constants
 */

// Route constants - Base route definitions
export {
  PUBLIC_ROUTES,
  SHOP_ROUTES,
  AUTH_ROUTES,
  ACCOUNT_ROUTES,
  SELLER_ROUTES,
  ADMIN_ROUTES,
  GAME_ROUTES,
  CHECKOUT_ROUTES,
  ERROR_ROUTES,
  requiresAuth,
  isSellerRoute,
  isAdminRoute,
} from "./routes";

export type {
  PublicRoute,
  ShopRoute,
  AuthRoute,
  AccountRoute,
  SellerRoute,
  AdminRoute,
  GameRoute,
} from "./routes";

// Navigation constants - Navigation menu items and links
export {
  MAIN_NAV_ITEMS,
  FOOTER_SHOP_LINKS,
  FOOTER_HELP_LINKS,
  FOOTER_ABOUT_LINKS,
  FOOTER_COMPANY_LINKS,
  FOOTER_BOTTOM_LINKS,
  FOOTER_SOCIAL_LINKS,
  ADMIN_SIDEBAR_ITEMS,
  SELLER_SIDEBAR_ITEMS,
  USER_SIDEBAR_ITEMS,
  BOTTOM_NAV_GUEST,
  BOTTOM_NAV_USER,
  BOTTOM_NAV_ADMIN,
  BOTTOM_NAV_SELLER,
  ALL_NAV_ITEMS_CUSTOMER,
  ALL_NAV_ITEMS_ADMIN,
  ALL_NAV_ITEMS_SELLER,
  QUICK_LINKS_AUTH,
  QUICK_LINKS_USER,
  QUICK_LINKS_SELLER,
  QUICK_LINKS_ADMIN,
  HELP_CENTER_LINKS,
  USER_DROPDOWN_MENU,
  BREADCRUMB_LABELS,
  ROUTE_CATEGORIES,
} from "./navigation";

export type {
  MainNavItem,
  FooterLink,
  AdminSidebarItem,
  SellerSidebarItem,
  UserSidebarItem,
  BottomNavItem,
} from "./navigation";

// App constants
export * from "./app";
