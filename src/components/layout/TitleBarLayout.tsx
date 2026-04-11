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

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Tag, X, PanelLeft } from "lucide-react";
import { THEME_CONSTANTS } from "@/constants";
import type { UserRole } from "@/types/auth";
import type { AvatarMetadata } from "@/db/schema";
import { BlockHeader, Span } from "@mohasinac/appkit/ui";
import { AvatarDisplay, Button, TextLink } from "@/components";

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
  /** When set, renders a dismissable promo micro-strip above the header. */
  promoStripText?: string;
  /** Current dark-mode state — used to render the correct icon and toggle. */
  isDark?: boolean;
  /** Called when the user clicks the theme toggle in the title bar. */
  onToggleTheme?: () => void;
  /**
   * Optional nav slot rendered between logo and right action icons (desktop only).
   * Pass `<MainNavbar inline />` for the slim double-nav pattern.
   */
  navSlot?: React.ReactNode;
  /** Whether a dashboard section has registered a navigation drawer. */
  hasDashboardNav?: boolean;
  /** Opens the registered dashboard navigation drawer. */
  onOpenDashboardNav?: () => void;
  /**
   * When true, the public-sidebar hamburger toggle is hidden. Use this on
   * dashboard routes (admin/seller/user) where the sidebar is owned by the
   * nested layout, not the global title bar.
   */
  hideSidebarToggle?: boolean;
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
  promoStripText,
  navSlot,
  isDark = false,
  onToggleTheme,
  hasDashboardNav = false,
  onOpenDashboardNav,
  hideSidebarToggle = false,
  id = "title-bar",
}: TitleBarLayoutProps) {
  const { colors, layout, zIndex, flex } = THEME_CONSTANTS;
  const tA = useTranslations("accessibility");
  const tNav = useTranslations("nav");
  const [promoVisible, setPromoVisible] = useState(true);

  const showPromo = !!promoStripText && promoVisible;

  return (
    <BlockHeader id={id} className={layout.titleBarBg}>
      {/* Promo micro-strip (LX-7) — dismissed locally via useState */}
      {showPromo && (
        <div
          className={`${THEME_CONSTANTS.accentBanner.gradient} text-white text-xs py-1 text-center relative ${THEME_CONSTANTS.flex.center} px-8`}
        >
          <Span>{promoStripText}</Span>
          <Button
            variant="ghost"
            onClick={() => setPromoVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss promo"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
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
            className={`font-display text-xl tracking-tight text-cobalt-700 dark:text-cobalt-300 hidden sm:block`}
          >
            {brandName}
          </Span>
        </TextLink>

        {/* Inline nav slot — desktop only, between logo and right icons (S5-8) */}
        {navSlot && (
          <div className="hidden md:flex flex-1 items-center justify-start mx-4 lg:mx-8 overflow-x-auto">
            {navSlot}
          </div>
        )}

        {/* Right Side Icons */}
        <div className={`${flex.rowCenter} gap-2 ml-auto`}>
          {/* Today's Deals quick-access link */}
          <TextLink
            href={promotionsHref}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20`}
            aria-label={tNav("todayDeals")}
          >
            <Tag className="w-4 h-4" aria-hidden="true" />
            <Span variant="inherit" className="hidden lg:inline">
              {tNav("todayDeals")}
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
            <kbd className="hidden xl:inline-flex border border-zinc-300/50 text-zinc-400 rounded px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
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

          {/* Desktop-only: Theme toggle + Locale switcher */}
          {onToggleTheme && (
            <Button
              variant="ghost"
              onClick={onToggleTheme}
              className={`hidden md:flex p-2 md:p-2.5 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
              aria-label={tA("toggleTheme")}
            >
              <svg
                className={`w-5 h-5 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
            </Button>
          )}
          {/* Dashboard Nav — visible only when a dashboard section is active */}
          {hasDashboardNav && onOpenDashboardNav && (
            <Button
              variant="ghost"
              onClick={onOpenDashboardNav}
              className={`p-2 md:p-2.5 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
              aria-label={tNav("dashboard")}
            >
              <PanelLeft
                className={`w-5 h-5 md:w-6 md:h-6 ${THEME_CONSTANTS.colors.icon.titleBar}`}
                strokeWidth={1.5}
              />
            </Button>
          )}

          {/* Hamburger Menu — hidden on dashboard routes where the nested layout owns the sidebar */}
          {!hideSidebarToggle && (
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
          )}
        </div>
      </div>
    </BlockHeader>
  );
}
