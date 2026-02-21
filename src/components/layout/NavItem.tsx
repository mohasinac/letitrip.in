"use client";

import Link from "next/link";
import { THEME_CONSTANTS } from "@/constants";
import { ReactNode } from "react";

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
  variant?: "horizontal" | "vertical";
}

export default function NavItem({
  href,
  label,
  icon,
  isActive = false,
  variant = "horizontal",
}: NavItemProps) {
  const { colors } = THEME_CONSTANTS;

  if (variant === "vertical") {
    // Bottom navbar style (vertical layout with icon on top)
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1 py-2 transition-colors ${
          isActive ? colors.bottomNav.active : colors.bottomNav.inactive
        }`}
      >
        <span className={`${colors.bottomNav.icon} flex items-center`}>
          {icon}
        </span>
        <span className={colors.bottomNav.text}>{label}</span>
      </Link>
    );
  }

  // Horizontal navbar style (icon and label side by side, more compact and user-friendly)
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
        isActive ? `${colors.navbar.active}` : `${colors.navbar.inactive}`
      }`}
    >
      <span className={`${colors.navbar.icon} flex-shrink-0 flex items-center`}>
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
