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
export { default as TitleBar } from './TitleBar';

// Main Horizontal Navbar (desktop)
export { default as MainNavbar } from './MainNavbar';

// Right Slide-out Sidebar
export { default as Sidebar } from './Sidebar';

// Bottom Mobile Navigation
export { default as BottomNavbar } from './BottomNavbar';

// ==================== NAVIGATION UTILITIES ====================

// Reusable Navigation Item
export { default as NavItem } from './NavItem';

// ==================== FOOTER ====================

// Site Footer
export { default as Footer } from './Footer';

// Breadcrumb Navigation
export { default as Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
