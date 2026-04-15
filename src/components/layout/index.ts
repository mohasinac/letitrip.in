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
export { NavItem } from "@mohasinac/appkit/features/layout";

// ==================== GENERIC LAYOUT SHELLS ====================

// Fixed bottom mobile navigation shell
export { BottomNavLayout } from "@mohasinac/appkit/features/layout";
export type { BottomNavLayoutProps } from "@mohasinac/appkit/features/layout";

// Right slide-out sidebar shell
export { SidebarLayout } from "@mohasinac/appkit/features/layout";
export type { SidebarLayoutProps } from "@mohasinac/appkit/features/layout";

// Top sticky title-bar shell
export { TitleBarLayout } from "@mohasinac/appkit/features/layout";
export type { TitleBarLayoutProps } from "@mohasinac/appkit/features/layout";

// Site footer shell — moved to @mohasinac/appkit/features/layout
export { FooterLayout } from "@mohasinac/appkit/features/layout";
export type {
  FooterLayoutProps,
  FooterLinkGroup,
  FooterSocialLink,
} from "@mohasinac/appkit/features/layout";

// Main horizontal navbar shell — moved to @mohasinac/appkit/features/layout
export { NavbarLayout } from "@mohasinac/appkit/features/layout";
export type { NavbarLayoutProps, NavbarLayoutItem } from "@mohasinac/appkit/features/layout";

// ==================== FOOTER ====================

// Site Footer
export { default as Footer } from "./Footer";

// Breadcrumb Navigation
export { Breadcrumbs, BreadcrumbItem } from "@mohasinac/appkit/features/layout";

// Auto-generated breadcrumb trail (reads from Next.js pathname)
export { AutoBreadcrumbs } from "@mohasinac/appkit/features/layout";

// Bottom Actions Bar — moved to @mohasinac/appkit/features/layout

