"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { useAuth } from "@/hooks";
import {
  AvatarDisplay,
  BlockHeader,
  Button,
  NotificationBell,
  Span,
  TextLink,
} from "@/components";

/**
 * TitleBar Component
 *
 * The top sticky navigation bar containing the logo, search icon (desktop only),
 * user account, cart with notification badge, and sidebar toggle.
 * Always visible at the top of the viewport.
 *
 * @component
 * @example
 * ```tsx
 * <TitleBar
 *   onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
 *   sidebarOpen={sidebarOpen}
 *   onSearchToggle={() => setSearchOpen(!searchOpen)}
 *   searchOpen={searchOpen}
 * />
 * ```
 */

interface TitleBarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSearchToggle: () => void;
  searchOpen: boolean;
}

export default function TitleBar({
  onToggleSidebar,
  sidebarOpen,
  onSearchToggle,
  searchOpen,
}: TitleBarProps) {
  const { colors, layout, zIndex, flex } = THEME_CONSTANTS;
  const { user } = useAuth();
  const tA = useTranslations("accessibility");

  return (
    <BlockHeader
      id="title-bar"
      className={`sticky top-0 ${zIndex.titleBar} ${layout.titleBarBg}`}
    >
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-2 md:py-2.5 ${flex.between}`}
      >
        {/* Logo - Modern design with gradient */}
        <TextLink
          href={SITE_CONFIG.nav.home}
          className={`${flex.rowCenter} gap-3 group`}
        >
          <div
            className={`w-8 h-8 md:w-10 md:h-10 ${colors.brand.logo} rounded-xl ${flex.center} ${colors.brand.logoText} font-bold text-lg md:text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
          >
            {SITE_CONFIG.brand.shortName}
          </div>
          <Span
            className={`text-lg md:text-xl font-bold hidden sm:block ${colors.onPrimary.brandHover} transition-colors duration-300`}
          >
            {SITE_CONFIG.brand.name}
          </Span>
        </TextLink>

        {/* Right Side Icons */}
        <div className={`${flex.rowCenter} gap-2 ml-auto`}>
          {/* Cart - Hidden on mobile (available in bottom nav) */}
          <TextLink
            href={SITE_CONFIG.account.cart}
            className={`hidden md:flex p-2 md:p-2.5 rounded-xl transition-colors relative items-center ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
            aria-label={tA("cartIcon")}
          >
            <svg
              className={`w-5 h-5 md:w-6 md:h-6 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
            <Span
              className={`absolute -top-1 -right-1 ${THEME_CONSTANTS.colors.notification.badge} text-xs min-w-[20px] h-5 px-1.5 ${flex.center} rounded-full font-semibold shadow-md`}
            >
              0
            </Span>
          </TextLink>

          {/* Search - Hidden on mobile (available in bottom nav) */}
          <Button
            onClick={onSearchToggle}
            className={`hidden md:flex p-2 md:p-2.5 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
            aria-label={tA("searchIcon")}
          >
            <svg
              className={`w-5 h-5 md:w-6 md:h-6 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
          </Button>

          {/* Notification Bell - Authenticated users only, hidden on mobile */}
          {user && <NotificationBell />}

          {/* User Profile - Hidden on mobile (available in bottom nav) */}
          <TextLink
            href={SITE_CONFIG.account.profile}
            className={`hidden md:flex items-center justify-center rounded-xl transition-colors ${user ? "" : `p-2 md:p-2.5 ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}`}
            aria-label={tA("userIcon")}
          >
            {user ? (
              <div className={`${flex.colCenter} gap-0.5`}>
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
                <Span
                  className={`text-[8px] font-semibold uppercase ${
                    THEME_CONSTANTS.badge.roleText[user.role] ||
                    THEME_CONSTANTS.badge.roleText.user
                  }`}
                >
                  {user.role || "user"}
                </Span>
              </div>
            ) : (
              <svg
                className={`w-5 h-5 md:w-6 md:h-6 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
          </TextLink>

          {/* Hamburger Menu */}
          <Button
            onClick={onToggleSidebar}
            className={`p-2 md:p-2.5 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
            aria-label={sidebarOpen ? tA("closeMenu") : tA("openMenu")}
          >
            <svg
              className={`w-5 h-5 md:w-6 md:h-6 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
          </Button>
        </div>
      </div>
    </BlockHeader>
  );
}
