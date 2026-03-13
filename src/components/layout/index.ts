/**
 * Layout Components Index
 *
 * Centralized exports for all layout-related components.
 * These components make up the application shell and navigation system.
 *
 * @example
 * ```tsx
 * import { TitleBar, MainNavbar, Sidebar } from '@/components/layout';
 * ```
 */

// ==================== NAVIGATION COMPONENTS ====================

// Top Title Bar (sticky)
export { default as TitleBar } from "./TitleBar";

// Main Horizontal Navbar (desktop)
export { default as MainNavbar } from "./MainNavbar";

// Right Slide-out Sidebar
export { default as Sidebar } from "./Sidebar";

// Bottom Mobile Navigation
export { default as BottomNavbar } from "./BottomNavbar";

// ==================== NAVIGATION UTILITIES ====================

// Reusable Navigation Item
export { default as NavItem } from "./NavItem";

// ==================== GENERIC LAYOUT SHELLS ====================

// Fixed bottom mobile navigation shell
export { BottomNavLayout } from "./BottomNavLayout";
export type { BottomNavLayoutProps } from "./BottomNavLayout";

// Right slide-out sidebar shell
export { SidebarLayout } from "./SidebarLayout";
export type { SidebarLayoutProps } from "./SidebarLayout";

// Top sticky title-bar shell
export { TitleBarLayout } from "./TitleBarLayout";
export type { TitleBarLayoutProps } from "./TitleBarLayout";

// Site footer shell
export { FooterLayout } from "./FooterLayout";
export type {
  FooterLayoutProps,
  FooterLinkGroup,
  FooterSocialLink,
} from "./FooterLayout";

// Main horizontal navbar shell
export { NavbarLayout } from "./NavbarLayout";
export type { NavbarLayoutProps, NavbarLayoutItem } from "./NavbarLayout";

// ==================== FOOTER ====================

// Site Footer
export { default as Footer } from "./Footer";

// Breadcrumb Navigation
export { default as Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";

// Auto-generated breadcrumb trail (reads from Next.js pathname)
export { default as AutoBreadcrumbs } from "./AutoBreadcrumbs";

// Locale Switcher
export { default as LocaleSwitcher } from "./LocaleSwitcher";
