/**
 * Constants Index
 *
 * Centralized exports for all application constants.
 * Import from this file instead of individual constant files.
 *
 * @example
 * ```tsx
 * import { THEME_CONSTANTS } from "@/constants/theme";
import { SITE_CONFIG } from "@/constants/site";
import { MAIN_NAV_ITEMS } from "@/constants/navigation";
 * ```
 */

// Routes constants
export * from "./routes";

// API route constants
export { API_ROUTES } from "./api";

// Configuration constants
export * from "./config";

// Theme constants
export { THEME_CONSTANTS } from "./theme";
export type { ThemeMode } from "./theme";

// Site configuration\n// (import directly: import { SITE_CONFIG, FEATURE_FLAGS } from "@mohasinac/appkit")

// SEO configuration
export {
  SEO_CONFIG,
} from "./seo";
export {
  generateMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateBlogMetadata,
  generateAuctionMetadata,
  generateProfileMetadata,
  generateSearchMetadata,
} from "./seo.server";
export type { ProductSeoInput, CategorySeoInput, BlogSeoInput, AuctionSeoInput } from "./seo.server";

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

// Dashboard tab configuration (SB10-B / Tier TC2)
export {
  STORE_LISTINGS_TABS,
  STORE_ORDERS_TABS,
  STORE_REVIEWS_TABS,
  ADMIN_PRODUCTS_TABS,
  ADMIN_ORDERS_TABS,
  ADMIN_USERS_TABS,
  ADMIN_STORES_TABS,
  ADMIN_EVENTS_TABS,
  ADMIN_BLOG_TABS,
  ADMIN_PAYOUTS_TABS,
  USER_ORDERS_TABS,
  USER_PROFILE_TABS,
} from "./dashboard-tabs";
export type {
  DashboardTab,
  StoreListingsTabId,
  StoreOrdersTabId,
  StoreReviewsTabId,
  AdminProductsTabId,
  AdminOrdersTabId,
  AdminUsersTabId,
  AdminStoresTabId,
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
} from "./api-roles";

// UI labels
export { UI_LABELS } from "./ui";

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

