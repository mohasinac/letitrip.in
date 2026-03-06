"use client";

import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  THEME_CONSTANTS,
  ROUTES,
  ERROR_MESSAGES,
  MAIN_NAV_ITEMS,
} from "@/constants";
import { useSwipe, useAuth, useLogout } from "@/hooks";
import { logger } from "@/classes";
import {
  AvatarDisplay,
  Button,
  Heading,
  Li,
  LocaleSwitcher,
  Nav,
  Span,
  Text,
  TextLink,
  Ul,
} from "@/components";
import { preventBodyScroll } from "@/utils";
import { hasAnyRole } from "@/helpers";
import { SidebarLayout } from "./SidebarLayout";

/**
 * Sidebar Component
 *
 * A slide-out navigation panel from the right side with user profile, logout button,
 * and grouped navigation items (Main, Account, Support).
 * Features scrollable content, active page detection, and smooth animations.
 *
 * @component
 * @example
 * ```tsx
 * <Sidebar
 *   isOpen={sidebarOpen}
 *   isDark={isDark}
 *   onClose={() => setSidebarOpen(false)}
 *   onToggleTheme={toggleTheme}
 * />
 * ```
 */

interface SidebarProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
}

export default function Sidebar({
  isOpen,
  isDark,
  onClose,
  onToggleTheme,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthenticated = !!user && !loading;
  const { flex, colors } = THEME_CONSTANTS;
  const sidebarRef = useRef<HTMLElement>(null);
  const tNav = useTranslations("nav");
  const tA = useTranslations("accessibility");
  const [supportOpen, setSupportOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const logoutMutation = useLogout();

  const handleSignOut = async () => {
    try {
      // Backend logout - clears session cookie and revokes tokens
      await logoutMutation.mutate();

      // Close sidebar first for better UX
      onClose();

      // Use router.push instead of window.location for better performance
      // This avoids full page reload and preserves Next.js app state
      router.push(ROUTES.AUTH.LOGIN);
    } catch (error) {
      logger.error(ERROR_MESSAGES.SESSION.SIGN_OUT_ERROR, error);
      // Even on error, redirect to login (session might be cleared)
      onClose();
      router.push(ROUTES.AUTH.LOGIN);
    }
  };

  // Swipe right to close sidebar
  useSwipe(sidebarRef, {
    onSwipeRight: () => {
      if (isOpen) onClose();
    },
    minSwipeDistance: 50,
  });

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    preventBodyScroll(isOpen);
  }, [isOpen]);

  return (
    <SidebarLayout
      ref={sidebarRef}
      isOpen={isOpen}
      ariaLabel={tA("sideNavigation")}
      onClose={onClose}
      header={
        isAuthenticated ? (
          <div className={`${flex.between} gap-3`}>
            {/* User Details */}
            <div className={`${flex.rowCenter} gap-3 flex-1 min-w-0`}>
              {/* Avatar with modern badge */}
              <div className={`${flex.colCenter} gap-1.5 ${flex.noShrink}`}>
                <div className="relative">
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
                  {/* Role badge with modern design */}
                  <Span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-md ${
                      THEME_CONSTANTS.badge.roleText[
                        (user.role as keyof typeof THEME_CONSTANTS.badge.roleText) ||
                          "user"
                      ]
                    } bg-white/90 dark:bg-gray-900/90`}
                  >
                    {user.role || "user"}
                  </Span>
                </div>
              </div>
              <div className={flex.growMin}>
                <Text
                  className={`${THEME_CONSTANTS.typography.small} font-medium ${colors.onPrimary.text} truncate`}
                >
                  {user.displayName || "User"}
                </Text>
                <Text
                  className={`${THEME_CONSTANTS.typography.xs} ${colors.onPrimary.textMuted} truncate`}
                >
                  {user.email || ""}
                </Text>
              </div>
            </div>

            {/* Close Button - Modern circular */}
            <Button
              variant="ghost"
              onClick={onClose}
              className={`p-2.5 rounded-full transition-all duration-200 ${flex.noShrink} hover:rotate-90 ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
              aria-label={tA("closeSidebar")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Close Button Row - Modern circular */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={onClose}
                className={`p-2.5 rounded-full transition-all duration-200 hover:rotate-90 ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
                aria-label={tA("closeSidebar")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Auth Buttons - Modern with gradients */}
            <div className="space-y-2.5">
              <TextLink
                href={ROUTES.AUTH.LOGIN}
                variant="inherit"
                className={`
                  w-full block px-4 py-3 rounded-xl
                  bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200
                  text-white dark:text-zinc-900 text-center
                  transition-all duration-200
                  font-semibold ${THEME_CONSTANTS.typography.small}
                  shadow-lg hover:shadow-xl hover:scale-[1.02]
                `}
                onClick={onClose}
              >
                {tNav("login")}
              </TextLink>
              <TextLink
                href={ROUTES.AUTH.REGISTER}
                variant="inherit"
                className={`
                  w-full block px-4 py-3 rounded-xl
                  ${colors.onPrimary.ghostOutlineBtn}
                  text-center
                  transition-all duration-200
                  font-semibold ${THEME_CONSTANTS.typography.small}
                  hover:scale-[1.02]
                `}
                onClick={onClose}
              >
                {tNav("register")}
              </TextLink>
            </div>
          </div>
        )
      }
    >
      <Nav aria-label={tA("sidebarLinks")} className="space-y-6">
        {/* User Profile Actions - Only shown when logged in */}
        {isAuthenticated && (
          <div className="space-y-2">
            <div
              className={`${flex.rowCenter} gap-2 px-2 py-1.5 ${colors.onPrimary.sectionLabel}`}
            >
              <div className={colors.onPrimary.divider}></div>
              <Heading
                level={3}
                className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
              >
                {tNav("profile")}
              </Heading>
              <div className={colors.onPrimary.divider}></div>
            </div>

            <Ul className="space-y-1">
              {[
                {
                  href: ROUTES.USER.PROFILE,
                  label: tNav("myProfile"),
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  ),
                },
                {
                  href: ROUTES.USER.ORDERS,
                  label: tNav("myOrders"),
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
                  href: ROUTES.USER.WISHLIST,
                  label: tNav("wishlist"),
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  ),
                },
                {
                  href: ROUTES.USER.SETTINGS,
                  label: tNav("settings"),
                  icon: (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </>
                  ),
                },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Li key={item.href}>
                    <TextLink
                      href={item.href}
                      variant="inherit"
                      className={`
                          ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg 
                          transition-all duration-200 group
                          ${
                            isActive
                              ? colors.onPrimary.navItemActive
                              : colors.onPrimary.navItemInactive
                          }
                        `}
                      onClick={onClose}
                    >
                      <div
                        className={`
                          ${flex.noShrink} p-1.5 rounded-md transition-colors
                          ${
                            isActive
                              ? colors.onPrimary.iconBgActive
                              : colors.onPrimary.iconBgInactive
                          }
                        `}
                      >
                        <svg
                          className={`w-5 h-5 ${isActive ? colors.onPrimary.text : colors.onPrimary.textIcon}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {item.icon}
                        </svg>
                      </div>
                      <Span
                        className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                      >
                        {item.label}
                      </Span>
                      {isActive && (
                        <svg
                          className={`w-4 h-4 ${colors.onPrimary.text}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </TextLink>
                  </Li>
                );
              })}
            </Ul>

            {/* Logout Button */}
            <Button
              variant="ghost"
              className={`
                  w-full mt-2 px-4 py-2.5 rounded-lg
                  ${colors.onPrimary.logoutBtn}
                  transition-all duration-200
                  ${flex.center} gap-2
                  font-medium ${THEME_CONSTANTS.typography.small}
                `}
              onClick={handleSignOut}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {tNav("logout")}
            </Button>
          </div>
        )}

        {/* Role-based Actions - Only shown when logged in with special roles */}
        {isAuthenticated &&
          user?.role &&
          hasAnyRole(user.role, ["admin", "moderator", "seller"]) && (
            <div className="space-y-2">
              <div
                className={`${flex.rowCenter} gap-2 px-2 py-1.5 ${colors.onPrimary.sectionLabel}`}
              >
                <div className={colors.onPrimary.divider}></div>
                <Heading
                  level={3}
                  className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
                >
                  {tNav("dashboard")}
                </Heading>
                <div className={colors.onPrimary.divider}></div>
              </div>

              <Ul className="space-y-1">
                {/* Admin Dashboard */}
                {hasAnyRole(user.role, ["admin", "moderator"]) && (
                  <Li>
                    <TextLink
                      href={ROUTES.ADMIN.DASHBOARD}
                      variant="inherit"
                      className={`
                        ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          pathname === ROUTES.ADMIN.DASHBOARD ||
                          pathname?.startsWith("/admin/")
                            ? colors.onPrimary.navItemActive
                            : colors.onPrimary.navItemInactive
                        }
                      `}
                      onClick={onClose}
                    >
                      <div
                        className={`
                        ${flex.noShrink} p-1.5 rounded-md transition-colors
                        ${
                          pathname === ROUTES.ADMIN.DASHBOARD ||
                          pathname?.startsWith("/admin/")
                            ? colors.onPrimary.iconBgActive
                            : colors.onPrimary.iconBgInactive
                        }
                      `}
                      >
                        <svg
                          className={`w-4 h-4 ${
                            pathname === ROUTES.ADMIN.DASHBOARD ||
                            pathname?.startsWith("/admin/")
                              ? colors.onPrimary.text
                              : colors.onPrimary.textIcon
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <Span
                        className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                      >
                        {tNav("adminDashboard")}
                      </Span>
                      {(pathname === ROUTES.ADMIN.DASHBOARD ||
                        pathname?.startsWith("/admin/")) && (
                        <svg
                          className={`w-4 h-4 ${colors.onPrimary.text}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </TextLink>
                  </Li>
                )}

                {/* Seller Dashboard */}
                {hasAnyRole(user.role, ["seller", "admin"]) && (
                  <Li>
                    <TextLink
                      href={ROUTES.SELLER.DASHBOARD}
                      variant="inherit"
                      className={`
                        ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          pathname === ROUTES.SELLER.DASHBOARD ||
                          pathname?.startsWith("/seller/")
                            ? colors.onPrimary.navItemActive
                            : colors.onPrimary.navItemInactive
                        }
                      `}
                      onClick={onClose}
                    >
                      <div
                        className={`
                        ${flex.noShrink} p-1.5 rounded-md transition-colors
                        ${
                          pathname === ROUTES.SELLER.DASHBOARD ||
                          pathname?.startsWith("/seller/")
                            ? colors.onPrimary.iconBgActive
                            : colors.onPrimary.iconBgInactive
                        }
                      `}
                      >
                        <svg
                          className={`w-4 h-4 ${
                            pathname === ROUTES.SELLER.DASHBOARD ||
                            pathname?.startsWith("/seller/")
                              ? colors.onPrimary.text
                              : colors.onPrimary.textIcon
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <Span
                        className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                      >
                        {tNav("sellerDashboard")}
                      </Span>
                      {(pathname === ROUTES.SELLER.DASHBOARD ||
                        pathname?.startsWith("/seller/")) && (
                        <svg
                          className={`w-4 h-4 ${colors.onPrimary.text}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </TextLink>
                  </Li>
                )}
              </Ul>
            </div>
          )}

        {/* Browse Section - Main navigation links for sidebar access */}
        <div className="space-y-2">
          <div
            className={`${flex.rowCenter} gap-2 px-2 py-1.5 ${colors.onPrimary.sectionLabel}`}
          >
            <div className={colors.onPrimary.divider}></div>
            <Heading
              level={3}
              className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
            >
              {tNav("browse")}
            </Heading>
            <div className={colors.onPrimary.divider}></div>
          </div>

          <Ul className="space-y-1">
            {MAIN_NAV_ITEMS.map((item, i) => {
              const translationKeys = [
                "home",
                "products",
                "auctions",
                "categories",
                "stores",
                "events",
                "blog",
                "promotions",
                "reviews",
              ] as const;
              const isActive = pathname === item.href;
              return (
                <Li key={item.href}>
                  <TextLink
                    href={item.href}
                    variant="inherit"
                    className={`
                        ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          isActive
                            ? colors.onPrimary.navItemActive
                            : colors.onPrimary.navItemInactive
                        }
                      `}
                    onClick={onClose}
                  >
                    <div
                      className={`
                        ${flex.noShrink} p-1.5 rounded-md transition-colors
                        ${
                          isActive
                            ? colors.onPrimary.iconBgActive
                            : colors.onPrimary.iconBgInactive
                        }
                      `}
                    >
                      <Span
                        className={`${flex.rowCenter} ${isActive ? colors.onPrimary.text : colors.onPrimary.textIcon}`}
                      >
                        {item.icon}
                      </Span>
                    </div>
                    <Span
                      className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                    >
                      {tNav(translationKeys[i])}
                    </Span>
                    {isActive && (
                      <svg
                        className={`w-4 h-4 ${colors.onPrimary.text}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </TextLink>
                </Li>
              );
            })}
          </Ul>
        </div>

        {/* Support Section - Collapsible */}
        <div className="space-y-2">
          <div
            className={`${flex.rowCenter} gap-2 px-2 py-1.5 ${colors.onPrimary.sectionLabel}`}
          >
            <div className={colors.onPrimary.divider}></div>
            <Heading
              level={3}
              className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
            >
              {tNav("support")}
            </Heading>
            <div className={colors.onPrimary.divider}></div>
            <Button
              variant="ghost"
              onClick={() => setSupportOpen((v) => !v)}
              aria-expanded={supportOpen}
              aria-label={tNav("support")}
              className="p-1 rounded-md -mr-1"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${supportOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${supportOpen ? "max-h-48" : "max-h-0"}`}
          >
            <Ul className="space-y-1">
              {[
                {
                  href: ROUTES.PUBLIC.CONTACT,
                  label: tNav("contactUs"),
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  ),
                },
                {
                  href: ROUTES.PUBLIC.HELP,
                  label: tNav("helpCenter"),
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Li key={item.href}>
                    <TextLink
                      href={item.href}
                      variant="inherit"
                      className={`
                        ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          isActive
                            ? colors.onPrimary.navItemActive
                            : colors.onPrimary.navItemInactive
                        }
                      `}
                      onClick={onClose}
                    >
                      <div
                        className={`
                        ${flex.noShrink} p-1.5 rounded-md transition-colors
                        ${
                          isActive
                            ? colors.onPrimary.iconBgActive
                            : colors.onPrimary.iconBgInactive
                        }
                      `}
                      >
                        <Span
                          className={`${flex.rowCenter} ${isActive ? colors.onPrimary.text : colors.onPrimary.textIcon}`}
                        >
                          {item.icon}
                        </Span>
                      </div>
                      <Span
                        className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                      >
                        {item.label}
                      </Span>
                      {isActive && (
                        <svg
                          className={`w-4 h-4 ${colors.onPrimary.text}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </TextLink>
                  </Li>
                );
              })}
            </Ul>
          </div>
        </div>

        {/* Settings Section - Collapsible */}
        <div className="space-y-2">
          <div
            className={`${flex.rowCenter} gap-2 px-2 py-1.5 ${colors.onPrimary.sectionLabel}`}
          >
            <div className={colors.onPrimary.divider}></div>
            <Heading
              level={3}
              className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
            >
              {tNav("settings")}
            </Heading>
            <div className={colors.onPrimary.divider}></div>
            <Button
              variant="ghost"
              onClick={() => setSettingsOpen((v) => !v)}
              aria-expanded={settingsOpen}
              aria-label={tNav("settings")}
              className="p-1 rounded-md -mr-1"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${settingsOpen ? "max-h-40" : "max-h-0"}`}
          >
            <Button
              variant="ghost"
              onClick={onToggleTheme}
              className={`
                ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg w-full
                transition-all duration-200 group
                ${colors.onPrimary.settingsRow}
              `}
              aria-label={tA("toggleTheme")}
            >
              <div
                className={`
                  ${flex.noShrink} p-1.5 rounded-md transition-colors
                  ${colors.onPrimary.iconBgInactive}
                `}
              >
                <svg
                  className={`w-4 h-4 ${colors.onPrimary.textIcon}`}
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
              </div>
              <Span
                className={`${THEME_CONSTANTS.typography.small} font-medium flex-1 text-left`}
              >
                {tNav("darkMode")}
              </Span>
              {/* Toggle indicator */}
              <div
                className={`
                  relative w-10 h-5 rounded-full transition-colors duration-200
                  ${isDark ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
                    transition-transform duration-200
                    ${isDark ? "translate-x-5" : "translate-x-0.5"}
                  `}
                />
              </div>
            </Button>

            {/* Language Switcher */}
            <div
              className={`
                ${flex.rowCenter} gap-3 px-3 py-2.5 rounded-lg w-full
                ${colors.onPrimary.text}
              `}
            >
              <div
                className={`
                  ${flex.noShrink} p-1.5 rounded-md transition-colors
                `}
              >
                <svg
                  className={`w-4 h-4 ${colors.onPrimary.textIcon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <Span
                className={`${THEME_CONSTANTS.typography.small} font-medium flex-1 text-left`}
              >
                {tNav("language")}
              </Span>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </Nav>
    </SidebarLayout>
  );
}
