/**
 * Navigation Constants
 * Centralized navigation links for sidebars, navbars, footers, and bottom navigation
 * This file consolidates all navigation-related routes used across the application
 */

import {
  PUBLIC_ROUTES,
  SHOP_ROUTES,
  AUTH_ROUTES,
  ACCOUNT_ROUTES,
  SELLER_ROUTES,
  ADMIN_ROUTES,
  GAME_ROUTES,
  CHECKOUT_ROUTES,
} from "./routes";

// ============================================================================
// MAIN NAVIGATION (Navbar)
// ============================================================================

export const MAIN_NAV_ITEMS = [
  { name: "Home", href: PUBLIC_ROUTES.HOME },
  { name: "Products", href: PUBLIC_ROUTES.PRODUCTS },
  { name: "Categories", href: PUBLIC_ROUTES.CATEGORIES },
  { name: "Game", href: GAME_ROUTES.LANDING },
  { name: "Contact", href: PUBLIC_ROUTES.CONTACT },
] as const;

// ============================================================================
// FOOTER NAVIGATION
// ============================================================================

export const FOOTER_SHOP_LINKS = [
  { name: "All Products", href: PUBLIC_ROUTES.PRODUCTS },
  { name: "Categories", href: PUBLIC_ROUTES.CATEGORIES },
  { name: "New Arrivals", href: `${PUBLIC_ROUTES.PRODUCTS}?sort=newest` },
  { name: "Best Sellers", href: `${PUBLIC_ROUTES.PRODUCTS}?sort=popular` },
  { name: "On Sale", href: `${PUBLIC_ROUTES.PRODUCTS}?sale=true` },
] as const;

export const FOOTER_HELP_LINKS = [
  { name: "Contact Us", href: PUBLIC_ROUTES.CONTACT },
  { name: "FAQ", href: PUBLIC_ROUTES.FAQ },
  { name: "Help Center", href: PUBLIC_ROUTES.HELP },
  { name: "Track Order", href: ACCOUNT_ROUTES.TRACK_ORDER },
  { name: "Shipping Info", href: "/help/shipping" },
  { name: "Returns", href: "/help/returns" },
] as const;

export const FOOTER_ABOUT_LINKS = [
  { name: "About Us", href: PUBLIC_ROUTES.ABOUT },
  { name: "Beyblade Game", href: GAME_ROUTES.LANDING },
  { name: "Terms of Service", href: PUBLIC_ROUTES.TERMS },
  { name: "Privacy Policy", href: PUBLIC_ROUTES.PRIVACY },
  { name: "Cookie Policy", href: PUBLIC_ROUTES.COOKIES },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
  { name: "Press Kit", href: "/press" },
  { name: "Affiliate Program", href: "/affiliate" },
] as const;

export const FOOTER_BOTTOM_LINKS = [
  { name: "Sitemap", href: PUBLIC_ROUTES.SITEMAP },
  { name: "Accessibility", href: PUBLIC_ROUTES.ACCESSIBILITY },
] as const;

export const FOOTER_SOCIAL_LINKS = [
  { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
] as const;

// ============================================================================
// ADMIN SIDEBAR NAVIGATION
// ============================================================================

export const ADMIN_SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    href: ADMIN_ROUTES.DASHBOARD,
    badge: false,
    section: "analytics",
  },
  {
    label: "Analytics",
    href: ADMIN_ROUTES.ANALYTICS,
    badge: false,
    section: "analytics",
  },
  {
    label: "Products",
    href: ADMIN_ROUTES.PRODUCTS,
    badge: false,
    section: "content",
  },
  {
    label: "Categories",
    href: ADMIN_ROUTES.CATEGORIES,
    badge: false,
    section: "content",
  },
  {
    label: "Orders",
    href: ADMIN_ROUTES.ORDERS,
    badge: false,
    section: "content",
  },
  {
    label: "Users",
    href: ADMIN_ROUTES.USERS,
    badge: false,
    section: "content",
  },
  {
    label: "Coupons",
    href: ADMIN_ROUTES.COUPONS,
    badge: false,
    section: "marketing",
  },
  {
    label: "Sales",
    href: ADMIN_ROUTES.SALES,
    badge: false,
    section: "marketing",
  },
  {
    label: "Reviews",
    href: ADMIN_ROUTES.REVIEWS,
    badge: false,
    section: "marketing",
  },
  {
    label: "Support",
    href: ADMIN_ROUTES.SUPPORT,
    badge: false,
    section: "marketing",
  },
  {
    label: "Notifications",
    href: ADMIN_ROUTES.NOTIFICATIONS,
    badge: false,
    section: "marketing",
  },
  {
    label: "Game",
    href: ADMIN_ROUTES.GAME,
    badge: false,
    section: "system",
  },
  {
    label: "Settings",
    href: ADMIN_ROUTES.SETTINGS,
    badge: false,
    section: "system",
  },
] as const;

// ============================================================================
// SELLER SIDEBAR NAVIGATION
// ============================================================================

export const SELLER_SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    href: SELLER_ROUTES.DASHBOARD,
    badge: false,
    section: "overview",
  },
  {
    label: "Shop Setup",
    href: SELLER_ROUTES.SHOP_SETUP,
    badge: false,
    section: "overview",
  },
  {
    label: "Products",
    href: SELLER_ROUTES.PRODUCTS,
    badge: false,
    section: "inventory",
  },
  {
    label: "Orders",
    href: SELLER_ROUTES.ORDERS,
    badge: false,
    section: "inventory",
  },
  {
    label: "Shipments",
    href: SELLER_ROUTES.SHIPMENTS,
    badge: false,
    section: "inventory",
  },
  {
    label: "Coupons",
    href: SELLER_ROUTES.COUPONS,
    badge: false,
    section: "marketing",
  },
  {
    label: "Sales",
    href: SELLER_ROUTES.SALES,
    badge: false,
    section: "marketing",
  },
  {
    label: "Analytics",
    href: SELLER_ROUTES.ANALYTICS,
    badge: false,
    section: "insights",
  },
  {
    label: "Revenue",
    href: "/seller/revenue",
    badge: false,
    section: "insights",
  },
  {
    label: "Alerts",
    href: SELLER_ROUTES.ALERTS,
    badge: true,
    section: "system",
  },
  {
    label: "Settings",
    href: SELLER_ROUTES.SETTINGS,
    badge: false,
    section: "system",
  },
] as const;

// ============================================================================
// USER/PROFILE SIDEBAR NAVIGATION
// ============================================================================

export const USER_SIDEBAR_ITEMS = [
  { label: "Profile", href: ACCOUNT_ROUTES.PROFILE },
  { label: "Orders", href: ACCOUNT_ROUTES.ORDERS },
  { label: "Wishlist", href: ACCOUNT_ROUTES.WISHLIST },
  { label: "Addresses", href: ACCOUNT_ROUTES.ADDRESSES },
  { label: "Track Order", href: ACCOUNT_ROUTES.TRACK_ORDER },
  { label: "Settings", href: ACCOUNT_ROUTES.SETTINGS },
] as const;

// ============================================================================
// MOBILE BOTTOM NAVIGATION
// ============================================================================

export const BOTTOM_NAV_GUEST = [
  { id: "home", label: "Home", href: PUBLIC_ROUTES.HOME },
  { id: "shop", label: "Shop", href: PUBLIC_ROUTES.PRODUCTS },
  { id: "wishlist", label: "Wishlist", href: PUBLIC_ROUTES.WISHLIST },
  { id: "login", label: "Login", href: AUTH_ROUTES.LOGIN },
] as const;

export const BOTTOM_NAV_USER = [
  { id: "home", label: "Home", href: PUBLIC_ROUTES.HOME },
  { id: "shop", label: "Shop", href: PUBLIC_ROUTES.PRODUCTS },
  { id: "wishlist", label: "Wishlist", href: ACCOUNT_ROUTES.WISHLIST },
  { id: "orders", label: "Orders", href: ACCOUNT_ROUTES.ORDERS },
  { id: "account", label: "Account", href: ACCOUNT_ROUTES.PROFILE },
] as const;

export const BOTTOM_NAV_ADMIN = [
  { id: "dashboard", label: "Dashboard", href: ADMIN_ROUTES.DASHBOARD },
  { id: "products", label: "Products", href: ADMIN_ROUTES.PRODUCTS },
  { id: "categories", label: "Categories", href: ADMIN_ROUTES.CATEGORIES },
  { id: "analytics", label: "Analytics", href: ADMIN_ROUTES.ANALYTICS },
] as const;

export const BOTTOM_NAV_SELLER = [
  { id: "dashboard", label: "Dashboard", href: SELLER_ROUTES.DASHBOARD },
  { id: "products", label: "Products", href: SELLER_ROUTES.PRODUCTS },
  { id: "orders", label: "Orders", href: SELLER_ROUTES.ORDERS },
  { id: "settings", label: "Settings", href: SELLER_ROUTES.SETTINGS },
] as const;

// ============================================================================
// MOBILE DRAWER ALL NAVIGATION (Desktop overflow items)
// ============================================================================

export const ALL_NAV_ITEMS_CUSTOMER = [
  { id: "products", label: "Shop", href: PUBLIC_ROUTES.PRODUCTS },
  { id: "orders", label: "Orders", href: ACCOUNT_ROUTES.ORDERS },
  { id: "account", label: "Account", href: ACCOUNT_ROUTES.PROFILE },
  { id: "wishlist", label: "Wishlist", href: ACCOUNT_ROUTES.WISHLIST },
  { id: "categories", label: "Categories", href: PUBLIC_ROUTES.CATEGORIES },
  { id: "contact", label: "Contact", href: PUBLIC_ROUTES.CONTACT },
  { id: "help", label: "Help", href: PUBLIC_ROUTES.HELP },
] as const;

export const ALL_NAV_ITEMS_ADMIN = [
  { id: "dashboard", label: "Dashboard", href: ADMIN_ROUTES.DASHBOARD },
  { id: "products", label: "Products", href: ADMIN_ROUTES.PRODUCTS },
  { id: "categories", label: "Categories", href: ADMIN_ROUTES.CATEGORIES },
  { id: "analytics", label: "Analytics", href: ADMIN_ROUTES.ANALYTICS },
  { id: "orders", label: "Orders", href: ADMIN_ROUTES.ORDERS },
  { id: "users", label: "Users", href: ADMIN_ROUTES.USERS },
  { id: "settings", label: "Settings", href: ADMIN_ROUTES.SETTINGS },
] as const;

export const ALL_NAV_ITEMS_SELLER = [
  { id: "dashboard", label: "Dashboard", href: SELLER_ROUTES.DASHBOARD },
  { id: "products", label: "Products", href: SELLER_ROUTES.PRODUCTS },
  { id: "orders", label: "Orders", href: SELLER_ROUTES.ORDERS },
  { id: "analytics", label: "Analytics", href: SELLER_ROUTES.ANALYTICS },
  { id: "shipments", label: "Shipments", href: SELLER_ROUTES.SHIPMENTS },
  { id: "shop", label: "Shop Setup", href: SELLER_ROUTES.SHOP_SETUP },
  { id: "settings", label: "Settings", href: SELLER_ROUTES.SETTINGS },
] as const;

// ============================================================================
// QUICK LINKS & SHORTCUTS
// ============================================================================

export const QUICK_LINKS_AUTH = [
  { name: "Sign In", href: AUTH_ROUTES.LOGIN },
  { name: "Register", href: AUTH_ROUTES.REGISTER },
  { name: "Forgot Password", href: AUTH_ROUTES.FORGOT_PASSWORD },
] as const;

export const QUICK_LINKS_USER = [
  { name: "My Account", href: ACCOUNT_ROUTES.PROFILE },
  { name: "Orders", href: ACCOUNT_ROUTES.ORDERS },
  { name: "Wishlist", href: ACCOUNT_ROUTES.WISHLIST },
  { name: "Cart", href: CHECKOUT_ROUTES.CART },
  { name: "Checkout", href: CHECKOUT_ROUTES.CHECKOUT },
] as const;

export const QUICK_LINKS_SELLER = [
  { name: "Seller Dashboard", href: SELLER_ROUTES.DASHBOARD },
  { name: "Add Product", href: SELLER_ROUTES.NEW_PRODUCT },
  { name: "Manage Orders", href: SELLER_ROUTES.ORDERS },
  { name: "Shop Setup", href: SELLER_ROUTES.SHOP_SETUP },
] as const;

export const QUICK_LINKS_ADMIN = [
  { name: "Admin Dashboard", href: ADMIN_ROUTES.DASHBOARD },
  { name: "Manage Products", href: ADMIN_ROUTES.PRODUCTS },
  { name: "Manage Users", href: ADMIN_ROUTES.USERS },
  { name: "View Analytics", href: ADMIN_ROUTES.ANALYTICS },
] as const;

// ============================================================================
// HELP & SUPPORT LINKS
// ============================================================================

export const HELP_CENTER_LINKS = [
  { name: "Getting Started", href: "/help/getting-started" },
  { name: "FAQs", href: PUBLIC_ROUTES.FAQ },
  { name: "Contact Support", href: PUBLIC_ROUTES.CONTACT },
  { name: "Shipping & Delivery", href: "/help/shipping" },
  { name: "Returns & Refunds", href: "/help/returns" },
  { name: "Payment Methods", href: "/help/payments" },
  { name: "Order Tracking", href: ACCOUNT_ROUTES.TRACK_ORDER },
  { name: "Product Care", href: "/help/care" },
] as const;

// ============================================================================
// USER PROFILE DROPDOWN MENU
// ============================================================================

export const USER_DROPDOWN_MENU = [
  { name: "My Profile", href: ACCOUNT_ROUTES.PROFILE },
  { name: "My Orders", href: ACCOUNT_ROUTES.ORDERS },
  { name: "Wishlist", href: ACCOUNT_ROUTES.WISHLIST },
  { name: "Addresses", href: ACCOUNT_ROUTES.ADDRESSES },
  { name: "Settings", href: ACCOUNT_ROUTES.SETTINGS },
] as const;

// ============================================================================
// BREADCRUMB HELPERS
// ============================================================================

export const BREADCRUMB_LABELS: Record<string, string> = {
  "/": "Home",
  "/products": "Products",
  "/categories": "Categories",
  "/cart": "Shopping Cart",
  "/checkout": "Checkout",
  "/wishlist": "Wishlist",
  "/about": "About Us",
  "/contact": "Contact",
  "/help": "Help Center",
  "/faq": "FAQs",
  "/profile": "My Account",
  "/profile/orders": "My Orders",
  "/profile/addresses": "My Addresses",
  "/profile/wishlist": "My Wishlist",
  "/profile/settings": "Account Settings",
  "/seller/dashboard": "Seller Dashboard",
  "/seller/products": "My Products",
  "/seller/orders": "Seller Orders",
  "/admin": "Admin Dashboard",
  "/admin/products": "Product Management",
  "/admin/users": "User Management",
  "/game": "Beyblade Game",
} as const;

// ============================================================================
// ROUTE CATEGORIES (for filtering/grouping)
// ============================================================================

export const ROUTE_CATEGORIES = {
  PUBLIC: "public",
  AUTH: "auth",
  USER: "user",
  SELLER: "seller",
  ADMIN: "admin",
  GAME: "game",
  HELP: "help",
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MainNavItem = (typeof MAIN_NAV_ITEMS)[number];
export type FooterLink =
  | (typeof FOOTER_SHOP_LINKS)[number]
  | (typeof FOOTER_HELP_LINKS)[number]
  | (typeof FOOTER_ABOUT_LINKS)[number]
  | (typeof FOOTER_COMPANY_LINKS)[number];
export type AdminSidebarItem = (typeof ADMIN_SIDEBAR_ITEMS)[number];
export type SellerSidebarItem = (typeof SELLER_SIDEBAR_ITEMS)[number];
export type UserSidebarItem = (typeof USER_SIDEBAR_ITEMS)[number];
export type BottomNavItem =
  | (typeof BOTTOM_NAV_GUEST)[number]
  | (typeof BOTTOM_NAV_USER)[number]
  | (typeof BOTTOM_NAV_ADMIN)[number]
  | (typeof BOTTOM_NAV_SELLER)[number];
