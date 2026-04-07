"use client";

/**
 * BottomNavLayout Component
 *
 * Generic fixed-bottom navigation shell used by BottomNavbar.
 * Provides the `Nav + Ul` container with correct z-index, background, height,
 * and safe-area inset. Pass `Li`-wrapped items as children.
 *
 * @component
 * @example
 * ```tsx
 * <BottomNavLayout ariaLabel="Mobile navigation">
 *   <Li><NavItem href="/" label="Home" /></Li>
 * </BottomNavLayout>
 * ```
 */

import React from "react";
import { Nav, Ul } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface BottomNavLayoutProps {
  ariaLabel: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function BottomNavLayout({
  ariaLabel,
  children,
  id = "bottom-navbar",
  className,
}: BottomNavLayoutProps) {
  const { layout, zIndex, utilities } = THEME_CONSTANTS;

  return (
    <Nav
      id={id}
      aria-label={ariaLabel}
      className={`fixed bottom-0 left-0 right-0 xl:hidden ${zIndex.bottomNav} ${layout.bottomNavBg} shadow-2xl ${utilities.safeAreaBottom}${className ? ` ${className}` : ""}`}
    >
      <Ul className={`flex items-stretch ${layout.bottomNavHeight}`}>
        {children}
      </Ul>
    </Nav>
  );
}
