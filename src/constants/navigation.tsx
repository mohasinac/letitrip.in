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
import { SITE_CONFIG } from "./site";

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
// Main Navigation Items (for navbar)
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    href: SITE_CONFIG.nav.home,
    label: "Home",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    href: SITE_CONFIG.nav.destinations,
    label: "Destinations",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    ),
  },
  {
    href: SITE_CONFIG.nav.categories,
    label: "Categories",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    ),
  },
  {
    href: SITE_CONFIG.nav.services,
    label: "Services",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
      />
    ),
  },
  {
    href: SITE_CONFIG.nav.contact,
    label: "Contact",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
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
    title: "Account",
    items: [
      {
        href: SITE_CONFIG.account.profile,
        label: "Profile",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        ),
      },
      {
        href: SITE_CONFIG.account.orders,
        label: "Orders",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        ),
      },
      {
        href: SITE_CONFIG.account.wishlist,
        label: "Wishlist",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        ),
      },
      {
        href: SITE_CONFIG.account.settings,
        label: "Settings",
        icon: (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </>
        ),
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        href: SITE_CONFIG.nav.contact,
        label: "Contact Us",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        ),
      },
      {
        href: "/help",
        label: "Help Center",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ),
      },
    ],
  },
];
