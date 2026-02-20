"use client";

import { usePathname } from "next/navigation";
import { THEME_CONSTANTS, ROUTES, SITE_CONFIG, UI_LABELS } from "@/constants";
import { ReactNode } from "react";
import { useAuth } from "@/hooks";
import { AvatarDisplay } from "@/components";
import NavItem from "./NavItem";

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
];

export default function BottomNavbar({ onSearchToggle }: BottomNavbarProps) {
  const { layout, zIndex, themed, typography } = THEME_CONSTANTS;
  const pathname = usePathname();
  const { user } = useAuth();
  const isSeller = user?.role === "seller" || user?.role === "admin";

  return (
    <nav
      id="bottom-navbar"
      className={`fixed bottom-0 left-0 right-0 md:hidden ${zIndex.bottomNav} ${layout.bottomNavBg} border-t ${themed.border} backdrop-blur-lg bg-white/95 dark:bg-gray-900/95 shadow-2xl`}
    >
      <ul
        className={`flex justify-around items-center ${layout.bottomNavHeight} px-2`}
      >
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
        {/* Seller Dashboard - visible for seller/admin users only */}
        {isSeller && (
          <li className="flex-1">
            <NavItem
              href={ROUTES.SELLER.DASHBOARD}
              label={UI_LABELS.NAV.SELLER}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              }
              isActive={pathname === ROUTES.SELLER.DASHBOARD}
              variant="vertical"
            />
          </li>
        )}
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
            <span className={typography.xs}>{UI_LABELS.NAV.SEARCH}</span>
          </button>
        </li>

        {/* Profile Link - last position */}
        <li className="flex-1">
          {user ? (
            <a
              href={ROUTES.USER.PROFILE}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                pathname === ROUTES.USER.PROFILE
                  ? themed.textPrimary
                  : themed.textSecondary
              } hover:${themed.textPrimary}`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <AvatarDisplay
                  cropData={
                    user.avatarMetadata ||
                    (user.photoURL
                      ? {
                          url: user.photoURL,
                          position: { x: 50, y: 50 },
                          zoom: 1,
                        }
                      : null)
                  }
                  size="sm"
                  alt={user.displayName || "User"}
                  displayName={user.displayName}
                  email={user.email}
                />
                <span
                  className={`text-[7px] font-semibold uppercase leading-none ${
                    THEME_CONSTANTS.badge.roleText[user.role] ||
                    THEME_CONSTANTS.badge.roleText.user
                  }`}
                >
                  {user.role || "user"}
                </span>
              </div>
            </a>
          ) : (
            <NavItem
              href={SITE_CONFIG.account.profile}
              label={UI_LABELS.NAV.PROFILE}
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              }
              isActive={pathname === SITE_CONFIG.account.profile}
              variant="vertical"
            />
          )}
        </li>
      </ul>
    </nav>
  );
}
