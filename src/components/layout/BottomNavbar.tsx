'use client';

import { usePathname } from 'next/navigation';
import { THEME_CONSTANTS } from '@/constants/theme';
import { SITE_CONFIG } from '@/constants/site';
import { ReactNode } from 'react';
import NavItem from './NavItem';

/**
 * BottomNavbar Component
 * 
 * The mobile navigation bar fixed at the bottom of the screen.
 * Contains main navigation links and search button, all with icons and labels.
 * Visible only on mobile devices (hidden on desktop where MainNavbar is shown).
 * 
 * @component
 * @example
 * ```tsx
 * <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
 * ```
 */

interface BottomNavbarProps {
  onSearchToggle?: () => void;
}

interface BottomNavLink {
  href: string;
  label: string;
  icon: ReactNode;
}

const bottomNavLinks: BottomNavLink[] = [
  {
    href: SITE_CONFIG.nav.home,
    label: 'Home',
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
    label: 'Destinations',
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
    href: SITE_CONFIG.nav.services,
    label: 'Services',
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
    label: 'Contact',
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

export default function BottomNavbar({ onSearchToggle }: BottomNavbarProps) {
  const { layout, zIndex, colors } = THEME_CONSTANTS;
  const pathname = usePathname();
  
  return (
    <nav 
      id="bottom-navbar" 
      className={`fixed bottom-0 left-0 right-0 md:hidden ${zIndex.bottomNav} ${layout.bottomNavBg} shadow-lg`}
    >
      <ul className={`flex justify-around items-center ${layout.bottomNavHeight}`}>
        {bottomNavLinks.map((link) => (
          <li key={link.href} className="flex-1">
            <NavItem
              href={link.href}
              label={link.label}
              icon={link.icon}
              isActive={pathname === link.href}
              variant="vertical"
            />
          </li>
        ))}
        {/* Search Button - Mobile Only */}
        <li className="flex-1">
          <button
            onClick={onSearchToggle}
            className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
            aria-label="Search"
          >
            <svg
              className={`${colors.bottomNav.icon} ${colors.bottomNav.inactive}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className={`${colors.bottomNav.text} ${colors.bottomNav.inactive}`}>
              Search
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
