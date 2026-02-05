"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { THEME_CONSTANTS } from "@/constants/theme";
import { SIDEBAR_NAV_GROUPS } from "@/constants/navigation";
import { SITE_CONFIG } from "@/constants/site";
import { useSwipe, useAuth } from "@/hooks";
import { preventBodyScroll } from "@/utils/eventHandlers";
import { signOut } from "@/lib/firebase/auth-helpers";

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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push(SITE_CONFIG.account.login);
      onClose();
    } catch (error) {
      console.error("Sign out error:", error);
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
      {/* Fixed Header */}
      <div
        className={`flex-shrink-0 px-6 py-4 border-b ${THEME_CONSTANTS.themed.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${THEME_CONSTANTS.themed.bgTertiary}`}
            >
              <svg
                className="w-5 h-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <h2
              className={`${THEME_CONSTANTS.typography.h5} font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Menu
            </h2>
          </div>
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
      </div>

      {/* User Profile Section */}
      <div
        className={`flex-shrink-0 px-6 py-4 border-b ${THEME_CONSTANTS.themed.border}`}
      >
        {isAuthenticated ? (
          <>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${THEME_CONSTANTS.themed.bgTertiary}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.displayName?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase() ||
                  "U"}
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
            <button
              className={`
                w-full mt-3 px-4 py-2.5 rounded-lg
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
          </>
        ) : (
          <>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${THEME_CONSTANTS.themed.bgTertiary}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                <svg
                  className="w-6 h-6"
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
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`${THEME_CONSTANTS.typography.small} font-medium ${THEME_CONSTANTS.themed.textPrimary}`}
                >
                  Guest User
                </p>
                <p
                  className={`${THEME_CONSTANTS.typography.xs} ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  Not logged in
                </p>
              </div>
            </div>
            <Link
              href={SITE_CONFIG.account.login}
              className={`
                w-full mt-3 px-4 py-2.5 rounded-lg
                bg-primary-600 hover:bg-primary-700
                text-white
                transition-all duration-200
                flex items-center justify-center gap-2
                font-medium ${THEME_CONSTANTS.typography.small}
                shadow-md hover:shadow-lg
              `}
              onClick={onClose}
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        <nav className="space-y-6">
          {SIDEBAR_NAV_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {/* Group Header */}
              <div
                className={`flex items-center gap-2 px-2 py-1.5 ${THEME_CONSTANTS.themed.textSecondary}`}
              >
                <div
                  className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                ></div>
                <h3
                  className={`${THEME_CONSTANTS.typography.xs} font-semibold uppercase tracking-wider`}
                >
                  {group.title}
                </h3>
                <div
                  className={`h-px flex-1 ${THEME_CONSTANTS.themed.border}`}
                ></div>
              </div>

              {/* Group Items */}
              <ul className="space-y-1">
                {group.items.map((item) => {
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
          ))}
        </nav>
      </div>
    </aside>
  );
}
