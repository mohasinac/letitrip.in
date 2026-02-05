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
    href: SITE_CONFIG.account.profile,
    label: 'Profile',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  },
];

export default function BottomNavbar({ onSearchToggle }: BottomNavbarProps) {
  const { layout, zIndex, themed, typography } = THEME_CONSTANTS;
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
        
        {/* Search Button */}
        <li className="flex-1">
          <button
            onClick={onSearchToggle}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${themed.textSecondary} hover:${themed.textPrimary}`}
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className={typography.xs}>Search</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
