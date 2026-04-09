"use client";

import { THEME_CONSTANTS } from "@/constants";
import { TextLink } from "../typography/TextLink";
import { ReactNode } from "react";
import { Span } from "@mohasinac/appkit/ui";

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
  /** When true, renders the item with a pill/border accent (e.g. "Today's Deals"). */
  highlighted?: boolean;
}

export default function NavItem({
  href,
  label,
  icon,
  isActive = false,
  variant = "horizontal",
  highlighted = false,
}: NavItemProps) {
  const { colors } = THEME_CONSTANTS;

  if (variant === "vertical") {
    // Bottom navbar style (vertical layout with icon on top)
    return (
      <TextLink
        href={href}
        className={`relative flex flex-col items-center gap-1 py-2 transition-colors ${
          isActive ? colors.bottomNav.active : colors.bottomNav.inactive
        }`}
      >
        {/* Active gradient glow (Phase 6 / C15-adjacent) */}
        {isActive && (
          <Span
            className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
            aria-hidden
          />
        )}
        <Span className={`${colors.bottomNav.icon} flex items-center relative`}>
          {icon}
        </Span>
        <Span className={`${colors.bottomNav.text} relative`}>{label}</Span>
      </TextLink>
    );
  }

  // Horizontal navbar style (icon and label side by side, more compact and user-friendly)
  if (highlighted) {
    return (
      <TextLink
        href={href}
        className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary-700/30 dark:border-primary/30 bg-primary-700/5 dark:bg-primary/5 text-primary-700 dark:text-primary text-sm font-medium transition-all hover:bg-primary-700/10 dark:hover:bg-primary/10"
      >
        <Span className="flex-shrink-0 flex items-center">{icon}</Span>
        <Span className="whitespace-nowrap">{label}</Span>
      </TextLink>
    );
  }

  return (
    <TextLink
      href={href}
      className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
        isActive ? `${colors.navbar.active}` : `${colors.navbar.inactive}`
      }`}
    >
      <Span className={`${colors.navbar.icon} flex-shrink-0 flex items-center`}>
        {icon}
      </Span>
      <Span className="whitespace-nowrap">{label}</Span>
    </TextLink>
  );
}
