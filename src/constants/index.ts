/**
 * Constants Index
 *
 * Centralized exports for all application constants.
 * Import from this file instead of individual constant files.
 *
 * @example
 * ```tsx
 * import { MAIN_NAV_ITEMS } from "@/constants/navigation";
 * ```
 */

// Routes constants
export * from "./routes";

// API route constants
export { API_ROUTES } from "./api";

// Configuration constants
export * from "./config";

// Site configuration\n// (import directly: import { SITE_CONFIG, FEATURE_FLAGS } from "@mohasinac/appkit")

// SEO configuration
export {
  SEO_CONFIG,
} from "./seo";
// seo.server.ts (generateMetadata + friends) is deliberately NOT re-exported
// here — it's a server-only module (imports @mohasinac/appkit/server, which
// transitively reaches contact/email.tsx's "server-only" guard). Re-exporting
// it from this general barrel made it reachable from every "use client" file
// that imports anything else from "@/constants", breaking the webpack
// production build (2026-08-20). Import directly from "@/constants/seo.server"
// instead — see CLAUDE.md Root Cause #18.

// Navigation constants
export {
  MAIN_NAV_ITEMS,
  SIDEBAR_SUPPORT_LINKS,
  FOOTER_LINK_GROUPS,
  ADMIN_NAV_GROUPS,
  STORE_NAV_GROUPS,
  USER_NAV_GROUPS,
  USER_NAV_ALL_ITEMS,
  getUserNavGroups,
} from "./navigation";
// Note: NavItem type not exported to avoid conflict with NavItem component in @/components/layout
export type { NavItem as NavigationItem } from "./navigation";

// Homepage data constants (trust indicators, features)
export {
  TRUST_INDICATORS,
  TRUST_FEATURES,
  SITE_FEATURES,
} from "./homepage-data";
export type {
  TrustIndicator,
  TrustFeatureItem,
  SiteFeature,
} from "./homepage-data";

// Brand identity constants
export { BRAND, getBrandCopyright } from "./brand";

// Footer static data (trust bar, social links, bottom links)
export {
  FOOTER_TRUST_BAR_ITEMS,
  FOOTER_SOCIAL_LINKS,
  FOOTER_BOTTOM_LINKS,
} from "./footer";

// Search overlay labels
export { SEARCH_LABELS } from "./search";

// FAQ category constants
export { FAQ_CATEGORIES } from "./faq";
export type { FAQCategoryKey } from "./faq";

// Languages + Ticket constants (added 2026-05-17 user-pages cohort)
export { SUPPORTED_LANGUAGES, LANGUAGES_PAGE_SIZE } from "./languages";
export type { LanguageOption } from "./languages";
export { TICKET_CATEGORIES, TICKET_STATUSES } from "./tickets";
export type { TicketCategory } from "./tickets";

// Dashboard tab configuration (SB10-B / Tier TC2)
export {
  STORE_ORDERS_TABS,
  STORE_REVIEWS_TABS,
  STORE_REVIEWS_ROLE_TABS,
  ADMIN_ORDERS_TABS,
  ADMIN_USERS_TABS,
  ADMIN_USER_DETAIL_TABS,
  ADMIN_STORES_TABS,
  ADMIN_STORE_DETAIL_TABS,
  ADMIN_EVENTS_TABS,
  ADMIN_BLOG_TABS,
  ADMIN_PAYOUTS_TABS,
  USER_ORDERS_TABS,
  USER_PROFILE_TABS,
} from "./dashboard-tabs";
export type {
  DashboardTab,
  StoreOrdersTabId,
  StoreReviewsTabId,
  StoreReviewsRoleTabId,
  AdminOrdersTabId,
  AdminUsersTabId,
  AdminUserDetailTabId,
  AdminStoresTabId,
  AdminStoreDetailTabId,
  AdminEventsTabId,
  AdminBlogTabId,
  AdminPayoutsTabId,
  UserOrdersTabId,
  UserProfileTabId,
} from "./dashboard-tabs";

// API role tuples for createRouteHandler({ roles })
export {
  USER_ROLE,
  ROLES_ADMIN_ONLY,
  ROLES_ADMIN_MOD,
  ROLES_TRUST_SAFETY,
  ROLES_STORE_WRITE,
  ROLES_STORE_READ,
  ROLES_ANY_STAFF,
  ROLES_AUTHENTICATED,
} from "./api-roles";

// UI labels
export { UI_LABELS } from "./ui";

// Brand icon file paths (payment/tech/social/shipping-carrier)
export { PAYMENT_ICONS, TECH_ICONS, SOCIAL_ICONS, getCarrierIcon } from "./icons";

// Inline SVG brand-mark components (simple, single-path logos)
export {
  VisaIcon,
  MastercardIcon,
  RazorpayIcon,
  VercelIcon,
  NextJsIcon,
  FirebaseIcon,
  CashIcon,
} from "./brand-icons";

// Style className tokens (extracted from the legacy THEME_CONSTANTS surface)
export * from "./styles/page";
export * from "./styles/themed";
export * from "./styles/nav-icons";

// Schema field name & status constants
export {
  PRODUCT_FIELDS,
  PRODUCT_STATUS_TRANSITIONS,
  ORDER_FIELDS,
  REVIEW_FIELDS,
  BID_FIELDS,
  AD_FIELDS,
  EVENT_FIELDS,
  PAYOUT_FIELDS,
  STORE_FIELDS,
  OAUTH_STATE_VALUES,
  CAROUSEL_FIELDS,
  COUPON_FIELDS,
  FAQ_FIELDS,
  HOMEPAGE_SECTION_FIELDS,
  SITE_SETTINGS_FIELDS,
  COMMON_FIELDS,
  SCHEMA_DEFAULTS,
  CATEGORY_FIELDS,
  BLOG_FIELDS,
  USER_FIELDS,
} from "./field-names";

