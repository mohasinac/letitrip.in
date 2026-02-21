/**
 * Constants Index
 *
 * Centralized exports for all application constants.
 * Import from this file instead of individual constant files.
 *
 * @example
 * ```tsx
 * import { THEME_CONSTANTS, SITE_CONFIG, MAIN_NAV_ITEMS } from '@/constants';
 * ```
 */

// Messages constants
export * from "./messages";

// UI constants (labels, placeholders, help text)
export * from "./ui";

// Routes constants
export * from "./routes";

// RBAC (Role-Based Access Control)
export * from "./rbac";

// Configuration constants
export * from "./config";

// API Endpoints constants
export * from "./api-endpoints";

// Address constants
export * from "./address";

// Theme constants
export { THEME_CONSTANTS } from "./theme";
export type { ThemeMode } from "./theme";

// Site configuration
export { SITE_CONFIG } from "./site";

// SEO configuration
export { SEO_CONFIG, generateMetadata, generateProfileMetadata } from "./seo";

// Navigation constants
export {
  MAIN_NAV_ITEMS,
  SIDEBAR_NAV_GROUPS,
  ADMIN_TAB_ITEMS,
  USER_TAB_ITEMS,
  SELLER_TAB_ITEMS,
} from "./navigation";
export type { NavGroup } from "./navigation";
// Note: NavItem type not exported to avoid conflict with NavItem component in @/components/layout
export type { NavItem as NavigationItem } from "./navigation";

// Homepage data constants (trust indicators, features, blog articles)
export {
  TRUST_INDICATORS,
  SITE_FEATURES,
  MOCK_BLOG_ARTICLES,
} from "./homepage-data";
export type { TrustIndicator, SiteFeature, BlogArticle } from "./homepage-data";

// FAQ category constants
export { FAQ_CATEGORIES } from "./faq";
export type { FAQCategoryKey } from "./faq";
