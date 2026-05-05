"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openNav = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setDesktopOpen(true);
      return;
    }
    setMobileOpen(true);
  }, []);

  const closeNav = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setDesktopOpen(false);
      return;
    }
    setMobileOpen(false);
  }, []);

  const toggleNav = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      setDesktopOpen((prev) => !prev);
      return;
    }
    setMobileOpen((prev) => !prev);
  }, []);

  useEffect(() => {
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
          desktopOpen={desktopOpen}
          items={ALL_NAV_ITEMS}
          groups={USER_NAV_GROUPS}
          mobileOpen={mobileOpen}
          onCloseMobile={closeNav}
        />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
