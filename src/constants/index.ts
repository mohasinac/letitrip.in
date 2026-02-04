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

// Theme constants
export { THEME_CONSTANTS } from './theme';
export type { ThemeMode } from './theme';

// Site configuration
export { SITE_CONFIG } from './site';

// Navigation constants
export { MAIN_NAV_ITEMS, SIDEBAR_NAV_GROUPS } from './navigation';
export type { NavGroup } from './navigation';
// Note: NavItem type not exported to avoid conflict with NavItem component in @/components/layout
export type { NavItem as NavigationItem } from './navigation';
