'use client';

import Link from 'next/link';
import { THEME_CONSTANTS } from '@/constants/theme';
import { ReactNode } from 'react';

/**
 * NavItem Component
 * 
 * A reusable navigation link component with icon and label.
 * Supports both horizontal (MainNavbar) and vertical (BottomNavbar) layouts.
 * Shows active state styling based on current route.
 * 
 * @component
 * @example
 * ```tsx
 * <NavItem
 *   href="/home"
 *   label="Home"
 *   icon={<HomeIcon />}
 *   isActive={pathname === '/home'}
 *   variant="horizontal"
 * />
 * ```
 */

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  isActive?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export default function NavItem({ 
  href, 
  label, 
  icon, 
  isActive = false,
  variant = 'horizontal' 
}: NavItemProps) {
  const { colors } = THEME_CONSTANTS;
  
  if (variant === 'vertical') {
    // Bottom navbar style (vertical layout with icon on top)
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1 py-2 transition-colors ${
          isActive 
            ? colors.bottomNav.active
            : colors.bottomNav.inactive
        }`}
      >
        <svg
          className={colors.bottomNav.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
        <span className={colors.bottomNav.text}>{label}</span>
      </Link>
    );
  }
  
  // Horizontal navbar style (icon and label side by side)
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg ${
        isActive 
          ? colors.navbar.active
          : colors.navbar.inactive
      }`}
    >
      <svg
        className={colors.navbar.icon}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icon}
      </svg>
      {label}
    </Link>
  );
}
