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
export type { ProductSeoInput, CategorySeoInput, BlogSeoInput, AuctionSeoInput } from "./seo.server";

// Navigation constants
export { MAIN_NAV_ITEMS } from "./navigation";
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

// FAQ category constants
export { FAQ_CATEGORIES } from "./faq";
export type { FAQCategoryKey } from "./faq";

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
} from "./field-names";

