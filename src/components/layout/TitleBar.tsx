"use client";

import { useState } from "react";
import Link from "next/link";
import { THEME_CONSTANTS } from "@/constants/theme";
import { SITE_CONFIG } from "@/constants/site";
import { useAuth } from "@/hooks";
import { AvatarDisplay } from "@/components";

/**
 * TitleBar Component
 *
 * The top sticky navigation bar containing the logo, search icon (desktop only),
 * user account, cart with notification badge, theme toggle, and sidebar toggle.
 * Always visible at the top of the viewport.
 *
 * @component
 * @example
 * ```tsx
 * <TitleBar
 *   isDark={isDark}
 *   onToggleTheme={toggleTheme}
 *   onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
 *   sidebarOpen={sidebarOpen}
 *   onSearchToggle={() => setSearchOpen(!searchOpen)}
 *   searchOpen={searchOpen}
 * />
 * ```
 */

interface TitleBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSearchToggle: () => void;
  searchOpen: boolean;
}

export default function TitleBar({
  isDark,
  onToggleTheme,
  onToggleSidebar,
  sidebarOpen,
  onSearchToggle,
  searchOpen,
}: TitleBarProps) {
  const { colors, layout, zIndex } = THEME_CONSTANTS;
  const { user } = useAuth();

  return (
    <header
      id="title-bar"
      className={`sticky top-0 ${zIndex.titleBar} ${layout.titleBarBg} shadow-md`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Logo - Left position on all screen sizes */}
        <Link href={SITE_CONFIG.nav.home} className="flex items-center gap-3">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 ${colors.brand.logo} rounded-lg flex items-center justify-center ${colors.brand.logoText} font-bold text-xl md:text-2xl shadow-md`}
          >
            {SITE_CONFIG.brand.shortName}
          </div>
          <span
            className={`text-xl md:text-2xl font-bold hidden sm:block ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            {SITE_CONFIG.brand.name}
          </span>
        </Link>

        {/* Right Side Icons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Cart */}
          <Link
            href={SITE_CONFIG.account.cart}
            className={`p-2.5 md:p-3 rounded-xl transition-colors relative ${THEME_CONSTANTS.colors.iconButton.onLight}`}
            aria-label="Shopping cart"
          >
            <svg
              className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              className={`absolute -top-1 -right-1 ${THEME_CONSTANTS.colors.notification.badge} text-xs min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full font-semibold shadow-md`}
            >
              0
            </span>
          </Link>

          {/* Search - Hidden on mobile (available in bottom nav) */}
          <button
            onClick={onSearchToggle}
            className={`hidden md:flex p-2.5 md:p-3 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight}`}
            aria-label="Search"
          >
            <svg
              className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2.5 md:p-3 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight}`}
            aria-label="Toggle theme"
          >
            <svg
              className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isDark ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              )}
            </svg>
          </button>

          {/* User Profile - Hidden on mobile (available in bottom nav) */}
          <Link
            href={SITE_CONFIG.account.profile}
            className={`hidden md:flex items-center justify-center rounded-xl transition-colors ${user ? "" : `p-2.5 md:p-3 ${THEME_CONSTANTS.colors.iconButton.onLight}`}`}
            aria-label="User account"
          >
            {user ? (
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
                  size="md"
                  alt={user.displayName || "User"}
                  displayName={user.displayName}
                  email={user.email}
                />
                <span
                  className={`text-[8px] font-semibold uppercase ${
                    user.role === "admin"
                      ? "text-red-500"
                      : user.role === "moderator" || user.role === "seller"
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  {user.role || "user"}
                </span>
              </div>
            ) : (
              <svg
                className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </Link>

          {/* Hamburger Menu */}
          <button
            onClick={onToggleSidebar}
            className={`p-2.5 md:p-3 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight}`}
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
