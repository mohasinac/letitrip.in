/**
 * Navigation Constants
 *
 * Centralized navigation configuration for the application.
 * Contains all navigation items with their routes, labels, and SVG icons.
 *
 * Exports:
 * - MAIN_NAV_ITEMS: Used in MainNavbar (desktop horizontal navigation)
 * - SIDEBAR_NAV_GROUPS: Used in Sidebar (grouped navigation items)
 *
 * All icons are SVG path elements to be used within svg elements.
 *
 * @constant
 * @example
 * ```tsx
 * import { MAIN_NAV_ITEMS } from '@/constants/navigation';
 *
 * {MAIN_NAV_ITEMS.map(item => (
 *   <NavItem key={item.href} {...item} />
 * ))}
 * ```
 */

import { ReactNode } from "react";
import {
  Home,
  ShoppingBag,
  Gavel,
  Store,
  Tag,
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Mail,
  HelpCircle,
} from "lucide-react";
import { SITE_CONFIG } from "./site";
import { UI_LABELS } from "./ui";
import { ROUTES } from "./routes";

/**
 * Navigation Item Interface
 * Represents a single navigation link with icon
 */
export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/**
 * Navigation Group Interface
 * Represents a group of navigation items with a title (used in Sidebar)
 */
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Main Navigation Items
 *
 * Array of navigation items displayed in the main navbar (desktop/tablet).
 * Each item includes href, label, and SVG icon path.
 *
 * Used by: MainNavbar component
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    href: SITE_CONFIG.nav.home,
    label: UI_LABELS.NAV.HOME,
    icon: <Home className="w-5 h-5" />,
  },
  {
    href: SITE_CONFIG.nav.products,
    label: UI_LABELS.NAV.PRODUCTS,
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    href: SITE_CONFIG.nav.auctions,
    label: UI_LABELS.NAV.AUCTIONS,
    icon: <Gavel className="w-5 h-5" />,
  },
  {
    href: SITE_CONFIG.nav.sellers,
    label: UI_LABELS.NAV.SELLERS,
    icon: <Store className="w-5 h-5" />,
  },
  {
    href: SITE_CONFIG.nav.promotions,
    label: UI_LABELS.NAV.PROMOTIONS,
    icon: <Tag className="w-5 h-5" />,
  },
];

/**
 * Sidebar Navigation Groups
 *
 * Grouped navigation items displayed in the sidebar menu.
 * Organized into three sections: Main, Account, and Support.
 * Each group has a title and array of navigation items with icons.
 *
 * Used by: Sidebar component
 */
// Sidebar Navigation Groups
export const SIDEBAR_NAV_GROUPS: NavGroup[] = [
  {
    title: UI_LABELS.NAV.ACCOUNT,
    items: [
      {
        href: ROUTES.USER.PROFILE,
        label: UI_LABELS.NAV.PROFILE,
        icon: <User className="w-4 h-4" />,
      },
      {
        href: ROUTES.USER.ORDERS,
        label: UI_LABELS.NAV.ORDERS,
        icon: <Package className="w-4 h-4" />,
      },
      {
        href: ROUTES.USER.WISHLIST,
        label: UI_LABELS.NAV.WISHLIST,
        icon: <Heart className="w-4 h-4" />,
      },
      {
        href: ROUTES.USER.ADDRESSES,
        label: UI_LABELS.NAV.ADDRESSES,
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        href: ROUTES.USER.SETTINGS,
        label: UI_LABELS.NAV.SETTINGS,
        icon: <Settings className="w-4 h-4" />,
      },
    ],
  },
  {
    title: UI_LABELS.NAV.SUPPORT,
    items: [
      {
        href: SITE_CONFIG.nav.contact,
        label: UI_LABELS.NAV.CONTACT_US,
        icon: <Mail className="w-4 h-4" />,
      },
      {
        href: ROUTES.PUBLIC.HELP,
        label: UI_LABELS.NAV.HELP_CENTER,
        icon: <HelpCircle className="w-4 h-4" />,
      },
    ],
  },
];

/**
 * Admin Section Tabs
 *
 * Navigation tabs for admin section pages.
 * Used by: AdminTabs component via SectionTabs
 */
export const ADMIN_TAB_ITEMS = [
  { label: UI_LABELS.NAV.DASHBOARD, href: ROUTES.ADMIN.DASHBOARD },
  { label: UI_LABELS.NAV.USERS, href: ROUTES.ADMIN.USERS },
  { label: UI_LABELS.NAV.PRODUCTS_ADMIN, href: ROUTES.ADMIN.PRODUCTS },
  { label: UI_LABELS.NAV.SITE_SETTINGS, href: ROUTES.ADMIN.SITE },
  { label: UI_LABELS.NAV.CAROUSEL, href: ROUTES.ADMIN.CAROUSEL },
  { label: UI_LABELS.NAV.SECTIONS, href: ROUTES.ADMIN.SECTIONS },
  { label: UI_LABELS.NAV.CATEGORIES, href: ROUTES.ADMIN.CATEGORIES },
  { label: UI_LABELS.NAV.FAQS, href: ROUTES.ADMIN.FAQS },
  { label: UI_LABELS.NAV.REVIEWS, href: ROUTES.ADMIN.REVIEWS },
  { label: UI_LABELS.NAV.MEDIA, href: ROUTES.ADMIN.MEDIA },
  { label: UI_LABELS.NAV.BIDS_ADMIN, href: ROUTES.ADMIN.BIDS },
  { label: UI_LABELS.NAV.BLOG_ADMIN, href: ROUTES.ADMIN.BLOG },
  { label: UI_LABELS.NAV.PAYOUTS_ADMIN, href: ROUTES.ADMIN.PAYOUTS },
  { label: UI_LABELS.NAV.NEWSLETTER_ADMIN, href: ROUTES.ADMIN.NEWSLETTER },
] as const;

/**
 * User Section Tabs
 *
 * Navigation tabs for user section pages.
 * Used by: UserTabs component via SectionTabs
 */
export const USER_TAB_ITEMS = [
  { label: UI_LABELS.USER.PROFILE.TITLE, href: ROUTES.USER.PROFILE },
  { label: UI_LABELS.USER.ORDERS.TITLE, href: ROUTES.USER.ORDERS },
  { label: UI_LABELS.USER.WISHLIST.TITLE, href: ROUTES.USER.WISHLIST },
  { label: UI_LABELS.USER.ADDRESSES.TITLE, href: ROUTES.USER.ADDRESSES },
  { label: UI_LABELS.USER.SETTINGS.TITLE, href: ROUTES.USER.SETTINGS },
] as const;

/**
 * Seller Section Tabs
 *
 * Navigation tabs for seller section pages.
 * Used by: SellerTabs component via SectionTabs
 */
export const SELLER_TAB_ITEMS = [
  { label: UI_LABELS.NAV.DASHBOARD, href: ROUTES.SELLER.DASHBOARD },
  { label: UI_LABELS.NAV.MY_PRODUCTS, href: ROUTES.SELLER.PRODUCTS },
  { label: UI_LABELS.NAV.MY_AUCTIONS, href: ROUTES.SELLER.AUCTIONS },
  { label: UI_LABELS.NAV.MY_SALES, href: ROUTES.SELLER.ORDERS },
] as const;
