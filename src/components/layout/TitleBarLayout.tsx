"use client";

/**
 * TitleBarLayout Component
 *
 * Generic top sticky title-bar shell used by TitleBar.
 * Receives all domain data as props — zero domain imports.
 * Domain shell (TitleBar.tsx) reads useAuth() and SITE_CONFIG and
 * passes the resulting values in.
 *
 * @component
 * @example
 * ```tsx
 * <TitleBarLayout
 *   brandName="LetItRip"
 *   brandShortName="L"
 *   logoHref="/"
 *   cartHref="/user/cart"
 *   profileHref="/user/profile"
 *   user={user}
 *   notificationSlot={user ? <NotificationBell /> : undefined}
 *   onToggleSidebar={handleToggle}
 *   sidebarOpen={sidebarOpen}
 *   onSearchToggle={handleSearch}
 *   searchOpen={searchOpen}
 * />
 * ```
 */

import React from "react";
import { useTranslations } from "next-intl";
import { Tag } from "lucide-react";
import { THEME_CONSTANTS } from "@/constants";
import type { UserRole } from "@/types/auth";
import type { AvatarMetadata } from "@/db/schema";
import {
  AvatarDisplay,
  BlockHeader,
  Button,
  Span,
  TextLink,
} from "@/components";

/** Minimal user shape required by the title bar. */
export interface TitleBarUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  avatarMetadata?: AvatarMetadata | null;
}

export interface TitleBarLayoutProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSearchToggle: () => void;
  searchOpen: boolean;
  brandName: string;
  brandShortName: string;
  logoHref: string;
  cartHref: string;
  profileHref: string;
  promotionsHref: string;
  user: TitleBarUser | null;
  /** Live cart item count — shown in badge when > 0. */
  cartCount?: number;
  /** Slot rendered between the search button and profile link (e.g. NotificationBell). */
  notificationSlot?: React.ReactNode;
  /** Dev-only slot rendered just before the hamburger button. */
  devSlot?: React.ReactNode;
  id?: string;
}

export function TitleBarLayout({
  onToggleSidebar,
  sidebarOpen,
  onSearchToggle,
  brandName,
  brandShortName,
  logoHref,
  cartHref,
  profileHref,
  promotionsHref,
  user,
  cartCount = 0,
  notificationSlot,
  devSlot,
  id = "title-bar",
}: TitleBarLayoutProps) {
  const { colors, layout, zIndex, flex } = THEME_CONSTANTS;
  const tA = useTranslations("accessibility");
  const tNav = useTranslations("nav");

  return (
    <BlockHeader
      id={id}
      className={`sticky top-0 ${zIndex.titleBar} ${layout.titleBarBg}`}
    >
      <div
        className={`container mx-auto ${layout.navPadding} ${layout.containerWidth} py-2 md:py-2.5 ${flex.between}`}
      >
        {/* Logo */}
        <TextLink href={logoHref} className={`${flex.rowCenter} gap-3 group`}>
          <div
            className={`w-8 h-8 md:w-10 md:h-10 ${colors.brand.logo} rounded-xl ${flex.center} ${colors.brand.logoText} font-bold text-lg md:text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
          >
            {brandShortName}
          </div>
          <Span
            className={`text-lg md:text-xl font-bold hidden sm:block ${colors.onPrimary.brandHover} transition-colors duration-300`}
          >
            {brandName}
          </Span>
        </TextLink>

        {/* Right Side Icons */}
        <div className={`${flex.rowCenter} gap-2 ml-auto`}>
          {/* Promotions quick-access link */}
          <TextLink
            href={promotionsHref}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20`}
            aria-label={tNav("promotions")}
          >
            <Tag className="w-4 h-4" aria-hidden="true" />
            <Span variant="inherit" className="hidden lg:inline">
              {tNav("promotions")}
            </Span>
          </TextLink>
          {/* Cart — hidden on mobile (available in bottom nav) */}
          <TextLink
            href={cartHref}
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
            {cartCount > 0 && (
              <Span
                className={`absolute -top-1 -right-1 ${THEME_CONSTANTS.colors.notification.badge} text-xs min-w-[20px] h-5 px-1.5 ${flex.center} rounded-full font-semibold shadow-md`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Span>
            )}
          </TextLink>

          {/* Search — hidden on mobile (available in bottom nav) */}
          <Button
            variant="ghost"
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

          {/* Notification slot — rendered for authenticated users only */}
          {notificationSlot}

          {/* User Profile — hidden on mobile (available in bottom nav) */}
          <TextLink
            href={profileHref}
            className={`hidden md:${flex.center} rounded-xl transition-colors ${user ? "" : `p-2 md:p-2.5 ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}`}
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

          {/* Dev-only slot (e.g. seed link) */}
          {devSlot}

          {/* Hamburger Menu */}
          <Button
            variant="ghost"
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
