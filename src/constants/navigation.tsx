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
import { UI_LABELS } from "./ui";

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
    label: UI_LABELS.NAV.HOME,
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
    href: SITE_CONFIG.nav.products,
    label: UI_LABELS.NAV.PRODUCTS,
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
    href: SITE_CONFIG.nav.auctions,
    label: UI_LABELS.NAV.AUCTIONS,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
  {
    href: SITE_CONFIG.nav.shops,
    label: UI_LABELS.NAV.SHOPS,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
  {
    href: SITE_CONFIG.nav.stickers,
    label: UI_LABELS.NAV.STICKERS,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
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
    title: UI_LABELS.NAV.ACCOUNT,
    items: [
      {
        href: SITE_CONFIG.account.profile,
        label: UI_LABELS.NAV.PROFILE,
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
        label: UI_LABELS.NAV.ORDERS,
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
        label: UI_LABELS.NAV.WISHLIST,
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
        href: SITE_CONFIG.account.addresses,
        label: UI_LABELS.NAV.ADDRESSES,
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        ),
      },
      {
        href: SITE_CONFIG.account.settings,
        label: UI_LABELS.NAV.SETTINGS,
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
    title: UI_LABELS.NAV.SUPPORT,
    items: [
      {
        href: SITE_CONFIG.nav.contact,
        label: UI_LABELS.NAV.CONTACT_US,
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
        label: UI_LABELS.NAV.HELP_CENTER,
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
