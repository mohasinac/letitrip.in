"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import {
  ROUTES,
  useDashboardNav,
  ProtectedRoute,
  useSession,
  UserSidebar,
  type UserNavItem,
  type UserNavGroup,
  type AuthGuardUser,
} from "@mohasinac/appkit/client";

const USER_NAV_GROUPS: UserNavGroup[] = [
  {
    title: "Shopping",
    items: [
      { href: String(ROUTES.USER.ORDERS), label: "My Orders" },
      { href: String(ROUTES.USER.OFFERS), label: "My Offers" },
      { href: String(ROUTES.USER.ADDRESSES), label: "Addresses" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: String(ROUTES.USER.PROFILE), label: "My Profile" },
      { href: String(ROUTES.USER.SETTINGS), label: "Settings" },
      { href: String(ROUTES.USER.NOTIFICATIONS), label: "Notifications" },
      { href: String(ROUTES.USER.MESSAGES), label: "Messages" },
    ],
  },
  {
    title: "Selling",
    items: [
      { href: String(ROUTES.USER.BECOME_SELLER), label: "Open a Store" },
    ],
  },
];

const ALL_NAV_ITEMS: UserNavItem[] = USER_NAV_GROUPS.flatMap((g) => g.items);

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const { registerNav, unregisterNav } = useDashboardNav();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openNav = useCallback(() => setOpen(true), []);
  const closeNav = useCallback(() => setOpen(false), []);
  const toggleNav = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    setMounted(true);
    registerNav({ open: openNav, close: closeNav, toggle: toggleNav });
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openNav, closeNav, toggleNav]);

  return (
    <ProtectedRoute
      user={user as AuthGuardUser | null}
      loading={loading}
      requireAuth
      onNavigate={(path) => router.push(path as Parameters<typeof router.push>[0])}
      routes={{
        loginPath: String(ROUTES.AUTH.LOGIN),
        unauthorizedPath: String(ROUTES.ERRORS.UNAUTHORIZED),
      }}
    >
      {/* Two-column layout on desktop: persistent sidebar + content */}
      <div className="md:flex md:items-start">
        <UserSidebar
          variant="sidebar"
          items={ALL_NAV_ITEMS}
          groups={USER_NAV_GROUPS}
          mobileOpen={open}
          onCloseMobile={closeNav}
        />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile FAB — always visible above bottom nav on mobile */}
      {mounted && createPortal(
        <button
          type="button"
          onClick={toggleNav}
          aria-label="Toggle account navigation"
          className="fixed bottom-[calc(var(--appkit-bottom-nav-height,3.5rem)+0.375rem)] left-3 z-30 md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-900 shadow-lg border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v18" />
          </svg>
        </button>,
        document.body
      )}
    </ProtectedRoute>
  );
}
