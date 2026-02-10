"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  THEME_CONSTANTS,
  ROUTES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  UI_LABELS,
} from "@/constants";
import { useSwipe, useAuth } from "@/hooks";
import { logger } from "@/classes";
import { AvatarDisplay } from "@/components";
import { preventBodyScroll } from "@/utils";
import { apiClient } from "@/lib/api-client";

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
  const sidebarRef = useRef<HTMLElement>(null);

  const handleSignOut = async () => {
    try {
      // Backend logout - clears session cookie and revokes tokens
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});

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
    <aside
      ref={sidebarRef}
      id="secondary-sidebar"
      aria-label="Site navigation"
      className={`
        fixed inset-y-0 right-0
        ${THEME_CONSTANTS.layout.sidebarWidth}
        ${THEME_CONSTANTS.layout.sidebarBg}
        shadow-2xl
        transform ${THEME_CONSTANTS.animation.normal} ease-in-out
        ${THEME_CONSTANTS.zIndex.sidebar}
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col
        border-l ${THEME_CONSTANTS.themed.border}
      `}
    >
      {/* Fixed Header with User Info - Modern Card Style */}
      <div
        className={`flex-shrink-0 px-6 py-5 border-b ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-3">
            {/* User Details */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar with modern badge */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
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
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-md ${
                      THEME_CONSTANTS.badge.roleText[
                        (user.role as keyof typeof THEME_CONSTANTS.badge.roleText) ||
                          "user"
                      ]
                    } bg-white/90 dark:bg-gray-900/90`}
                  >
                    {user.role || UI_LABELS.AUTH.DEFAULT_ROLE}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`${THEME_CONSTANTS.typography.small} font-medium ${THEME_CONSTANTS.themed.textPrimary} truncate`}
                >
                  {user.displayName || "User"}
                </p>
                <p
                  className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary} truncate`}
                >
                  {user.email || ""}
                </p>
              </div>
            </div>

            {/* Close Button - Modern circular */}
            <button
              onClick={onClose}
              className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 hover:rotate-90 ${THEME_CONSTANTS.colors.iconButton.onLight}`}
              aria-label="Close sidebar"
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
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Close Button Row - Modern circular */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`p-2.5 rounded-full transition-all duration-200 hover:rotate-90 ${THEME_CONSTANTS.colors.iconButton.onLight}`}
                aria-label="Close sidebar"
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
              </button>
            </div>

            {/* Auth Buttons - Modern with gradients */}
            <div className="space-y-2.5">
              <Link
                href={ROUTES.AUTH.LOGIN}
                className={`
                  w-full block px-4 py-3 rounded-xl
                  bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                  text-white text-center
                  transition-all duration-200
                  font-semibold ${THEME_CONSTANTS.typography.small}
                  shadow-lg hover:shadow-xl hover:scale-[1.02]
                `}
                onClick={onClose}
              >
                {UI_LABELS.NAV.LOGIN}
              </Link>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className={`
                  w-full block px-4 py-3 rounded-xl
                  ${THEME_CONSTANTS.themed.bgPrimary}
                  ${THEME_CONSTANTS.themed.textPrimary}
                  border-2 ${THEME_CONSTANTS.themed.border}
                  hover:${THEME_CONSTANTS.themed.bgSecondary}
                  hover:border-blue-500
                  text-center
                  transition-all duration-200
                  font-semibold ${THEME_CONSTANTS.typography.small}
                  hover:scale-[1.02]
                `}
                onClick={onClose}
              >
                {UI_LABELS.NAV.REGISTER}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        <nav className="space-y-6">
          {/* User Profile Actions - Only shown when logged in */}
          {isAuthenticated && (
            <div className="space-y-2">
              <div
                className={`flex items-center gap-2 px-2 py-1.5 ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                <div
                  className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                ></div>
                <h3
                  className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
                >
                  {UI_LABELS.NAV.PROFILE}
                </h3>
                <div
                  className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                ></div>
              </div>

              <ul className="space-y-1">
                {[
                  {
                    href: ROUTES.USER.PROFILE,
                    label: UI_LABELS.NAV.MY_PROFILE,
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
                    label: UI_LABELS.NAV.MY_ORDERS,
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
                    label: UI_LABELS.NAV.WISHLIST,
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
                    label: UI_LABELS.NAV.SETTINGS,
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
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg 
                          transition-all duration-200 group
                          ${
                            isActive
                              ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-sm"
                              : `${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.hoverCard}`
                          }
                        `}
                        onClick={onClose}
                      >
                        <div
                          className={`
                          flex-shrink-0 p-1.5 rounded-md transition-colors
                          ${
                            isActive
                              ? "bg-primary-100 dark:bg-primary-900/50"
                              : `bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}`
                          }
                        `}
                        >
                          <svg
                            className={`w-4 h-4 ${isActive ? "text-primary-600 dark:text-primary-400" : THEME_CONSTANTS.themed.textMuted}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {item.icon}
                          </svg>
                        </div>
                        <span
                          className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <svg
                            className="w-4 h-4 text-primary-600 dark:text-primary-400"
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
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Logout Button */}
              <button
                className={`
                  w-full mt-2 px-4 py-2.5 rounded-lg
                  ${THEME_CONSTANTS.themed.bgPrimary}
                  ${THEME_CONSTANTS.themed.textPrimary}
                  hover:bg-red-50 dark:hover:bg-red-950/30
                  hover:text-red-600 dark:hover:text-red-400
                  border ${THEME_CONSTANTS.themed.border}
                  transition-all duration-200
                  flex items-center justify-center gap-2
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
                {UI_LABELS.NAV.LOGOUT}
              </button>
            </div>
          )}

          {/* Role-based Actions - Only shown when logged in with special roles */}
          {isAuthenticated &&
            user?.role &&
            (user.role === "admin" ||
              user.role === "moderator" ||
              user.role === "seller") && (
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  <div
                    className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                  ></div>
                  <h3
                    className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
                  >
                    {UI_LABELS.NAV.DASHBOARD}
                  </h3>
                  <div
                    className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                  ></div>
                </div>

                <ul className="space-y-1">
                  {/* Admin Dashboard */}
                  {(user.role === "admin" || user.role === "moderator") && (
                    <li>
                      <Link
                        href={ROUTES.ADMIN.DASHBOARD}
                        className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          pathname === ROUTES.ADMIN.DASHBOARD ||
                          pathname?.startsWith("/admin/")
                            ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-sm"
                            : `${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.hoverCard}`
                        }
                      `}
                        onClick={onClose}
                      >
                        <div
                          className={`
                        flex-shrink-0 p-1.5 rounded-md transition-colors
                        ${
                          pathname === ROUTES.ADMIN.DASHBOARD ||
                          pathname?.startsWith("/admin/")
                            ? "bg-primary-100 dark:bg-primary-900/50"
                            : `bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}`
                        }
                      `}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              pathname === ROUTES.ADMIN.DASHBOARD ||
                              pathname?.startsWith("/admin/")
                                ? "text-primary-600 dark:text-primary-400"
                                : THEME_CONSTANTS.themed.textMuted
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
                        <span
                          className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                        >
                          {UI_LABELS.NAV.ADMIN_DASHBOARD}
                        </span>
                        {(pathname === ROUTES.ADMIN.DASHBOARD ||
                          pathname?.startsWith("/admin/")) && (
                          <svg
                            className="w-4 h-4 text-primary-600 dark:text-primary-400"
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
                      </Link>
                    </li>
                  )}

                  {/* Seller Dashboard */}
                  {(user.role === "seller" || user.role === "admin") && (
                    <li>
                      <Link
                        href={ROUTES.SELLER.DASHBOARD}
                        className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          pathname === ROUTES.SELLER.DASHBOARD ||
                          pathname?.startsWith("/seller/")
                            ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-sm"
                            : `${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.hoverCard}`
                        }
                      `}
                        onClick={onClose}
                      >
                        <div
                          className={`
                        flex-shrink-0 p-1.5 rounded-md transition-colors
                        ${
                          pathname === ROUTES.SELLER.DASHBOARD ||
                          pathname?.startsWith("/seller/")
                            ? "bg-primary-100 dark:bg-primary-900/50"
                            : `bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}`
                        }
                      `}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              pathname === ROUTES.SELLER.DASHBOARD ||
                              pathname?.startsWith("/seller/")
                                ? "text-primary-600 dark:text-primary-400"
                                : THEME_CONSTANTS.themed.textMuted
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
                        <span
                          className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                        >
                          {UI_LABELS.NAV.SELLER_DASHBOARD}
                        </span>
                        {(pathname === ROUTES.SELLER.DASHBOARD ||
                          pathname?.startsWith("/seller/")) && (
                          <svg
                            className="w-4 h-4 text-primary-600 dark:text-primary-400"
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
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

          {/* Support Section - Always visible */}
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 px-2 py-1.5 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              <div
                className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
              ></div>
              <h3
                className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
              >
                {UI_LABELS.NAV.SUPPORT}
              </h3>
              <div
                className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
              ></div>
            </div>

            <ul className="space-y-1">
              {[
                {
                  href: ROUTES.PUBLIC.CONTACT,
                  label: UI_LABELS.NAV.CONTACT_US,
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
                  label: UI_LABELS.NAV.HELP_CENTER,
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
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 shadow-sm"
                            : `${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.hoverCard}`
                        }
                      `}
                      onClick={onClose}
                    >
                      <div
                        className={`
                        flex-shrink-0 p-1.5 rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-primary-100 dark:bg-primary-900/50"
                            : `bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}`
                        }
                      `}
                      >
                        <svg
                          className={`w-4 h-4 ${isActive ? "text-primary-600 dark:text-primary-400" : THEME_CONSTANTS.themed.textMuted}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {item.icon}
                        </svg>
                      </div>
                      <span
                        className={`${THEME_CONSTANTS.typography.small} font-medium flex-1`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <svg
                          className="w-4 h-4 text-primary-600 dark:text-primary-400"
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
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Theme Toggle - Always visible */}
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 px-2 py-1.5 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              <div
                className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
              ></div>
              <h3
                className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
              >
                {UI_LABELS.NAV.SETTINGS}
              </h3>
              <div
                className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
              ></div>
            </div>

            <button
              onClick={onToggleTheme}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
                transition-all duration-200 group
                ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.hoverCard}
              `}
              aria-label="Toggle theme"
            >
              <div
                className={`
                  flex-shrink-0 p-1.5 rounded-md transition-colors
                  bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}
                `}
              >
                <svg
                  className={`w-4 h-4 ${THEME_CONSTANTS.themed.textMuted}`}
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
              <span
                className={`${THEME_CONSTANTS.typography.small} font-medium flex-1 text-left`}
              >
                {UI_LABELS.NAV.DARK_MODE}
              </span>
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
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
