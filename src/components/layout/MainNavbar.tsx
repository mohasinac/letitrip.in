'use client';

import { usePathname } from 'next/navigation';
import { THEME_CONSTANTS } from '@/constants/theme';
import { MAIN_NAV_ITEMS } from '@/constants/navigation';
import NavItem from './NavItem';

/**
 * MainNavbar Component
 * 
 * The primary horizontal navigation bar displaying main site links.
 * Visible on desktop/tablet (hidden on mobile, replaced by BottomNavbar).
 * Highlights the currently active page based on pathname.
 * 
 * @component
 * @example
 * ```tsx
 * <MainNavbar />
 * ```
 */

export default function MainNavbar() {
  const { layout, zIndex } = THEME_CONSTANTS;
  const pathname = usePathname();
  
  return (
    <nav 
      id="main-navbar" 
      className={`hidden md:block ${layout.navbarBg} shadow-md`}
    >
      <div className="container mx-auto px-4">
        <ul className={`flex items-center gap-1 md:gap-2 ${layout.navbarHeight}`}>
          {MAIN_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
                variant="horizontal"
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
