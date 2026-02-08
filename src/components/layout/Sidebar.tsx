"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  THEME_CONSTANTS,
  ROUTES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
} from "@/constants";
import { SIDEBAR_NAV_GROUPS } from "@/constants/navigation";
import { SITE_CONFIG } from "@/constants/site";
import { useSwipe, useAuth } from "@/hooks";
import { AvatarDisplay } from "@/components";
import { preventBodyScroll } from "@/utils/events";
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
 * />
 * ```
 */

interface SidebarProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, isDark, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthenticated = !!user && !loading;
  const sidebarRef = useRef<HTMLElement>(null);

  // Debug: Log user data
  useEffect(() => {
    if (user) {
      console.log("Sidebar - User data:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        roleType: typeof user.role,
        isAdmin: user.role === "admin",
        isModerator: user.role === "moderator",
        isSeller: user.role === "seller",
        hasRole: !!user.role,
        fullUser: user,
      });
    }
  }, [user]);

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
      console.error(ERROR_MESSAGES.SESSION.SIGN_OUT_ERROR, error);
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
        shadow-xl
        transform ${THEME_CONSTANTS.animation.normal} ease-in-out
        ${THEME_CONSTANTS.zIndex.sidebar}
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col
      `}
    >
      {/* Fixed Header with User Info */}
      <div
        className={`flex-shrink-0 px-6 py-4 border-b ${THEME_CONSTANTS.themed.border}`}
      >
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-3">
            {/* User Details */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar without border */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
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
                  className={`text-[9px] font-semibold uppercase ${
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

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${THEME_CONSTANTS.colors.iconButton.onLight}`}
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
            {/* Close Button Row */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight}`}
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

            {/* Auth Buttons - Stacked */}
            <div className="space-y-2">
              <Link
                href={SITE_CONFIG.account.login}
                className={`
                  w-full block px-4 py-2.5 rounded-lg
                  bg-primary-600 hover:bg-primary-700
                  text-white text-center
                  transition-all duration-200
                  font-medium ${THEME_CONSTANTS.typography.small}
                  shadow-sm hover:shadow
                `}
                onClick={onClose}
              >
                Login
              </Link>
              <Link
                href={SITE_CONFIG.account.register}
                className={`
                  w-full block px-4 py-2.5 rounded-lg
                  ${THEME_CONSTANTS.themed.bgTertiary}
                  ${THEME_CONSTANTS.themed.textPrimary}
                  border ${THEME_CONSTANTS.themed.border}
                  hover:${THEME_CONSTANTS.themed.bgSecondary}
                  text-center
                  transition-all duration-200
                  font-medium ${THEME_CONSTANTS.typography.small}
                `}
                onClick={onClose}
              >
                Register
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
                  Profile
                </h3>
                <div
                  className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                ></div>
              </div>

              <ul className="space-y-1">
                {[
                  {
                    href: SITE_CONFIG.account.profile,
                    label: "My Profile",
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
                    href: SITE_CONFIG.account.orders,
                    label: "My Orders",
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
                    href: SITE_CONFIG.account.wishlist,
                    label: "Wishlist",
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
                    href: SITE_CONFIG.account.settings,
                    label: "Settings",
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
                Logout
              </button>
            </div>
          )}

          {/* Role-based Actions - Only shown when logged in */}
          {isAuthenticated && user?.role && (
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
                  Dashboard
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
                      href="/admin/dashboard"
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          pathname === "/admin/dashboard" ||
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
                          pathname === "/admin/dashboard" ||
                          pathname?.startsWith("/admin/")
                            ? "bg-primary-100 dark:bg-primary-900/50"
                            : `bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}`
                        }
                      `}
                      >
                        <svg
                          className={`w-4 h-4 ${pathname === "/admin/dashboard" || pathname?.startsWith("/admin/") ? "text-primary-600 dark:text-primary-400" : THEME_CONSTANTS.themed.textMuted}`}
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
                        Admin Dashboard
                      </span>
                    </Link>
                  </li>
                )}

                {/* Seller Dashboard */}
                {(user.role === "seller" || user.role === "admin") && (
                  <li>
                    <Link
                      href="/seller"
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg 
                        transition-all duration-200 group
                        ${
                          pathname === "/seller" ||
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
                          pathname === "/seller" ||
                          pathname?.startsWith("/seller/")
                            ? "bg-primary-100 dark:bg-primary-900/50"
                            : `bg-transparent ${THEME_CONSTANTS.themed.hover.replace("hover:", "group-hover:")}`
                        }
                      `}
                      >
                        <svg
                          className={`w-4 h-4 ${pathname === "/seller" || pathname?.startsWith("/seller/") ? "text-primary-600 dark:text-primary-400" : THEME_CONSTANTS.themed.textMuted}`}
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
                        Seller Dashboard
                      </span>
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
                Support
              </h3>
              <div
                className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
              ></div>
            </div>

            <ul className="space-y-1">
              {[
                {
                  href: SITE_CONFIG.nav.contact,
                  label: "Contact Us",
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
                  href: "/help",
                  label: "Help Center",
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
        </nav>
      </div>
    </aside>
  );
}
