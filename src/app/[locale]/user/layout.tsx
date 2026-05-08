"use client";

import { useCallback, useEffect, useState, startTransition, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  useDashboardNav,
  ProtectedRoute,
  useSession,
  UserSidebar,
  type AuthGuardUser,
} from "@mohasinac/appkit/client";
import { ROUTES } from "@/constants";
import { USER_NAV_GROUPS, USER_NAV_ALL_ITEMS } from "@/constants/navigation";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const { registerNav, unregisterNav } = useDashboardNav();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openNav = useCallback(() => {
    startTransition(() => {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
        setDesktopOpen(true);
        return;
      }
      setMobileOpen(true);
    });
  }, []);

  const closeNav = useCallback(() => {
    startTransition(() => {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
        setDesktopOpen(false);
        return;
      }
      setMobileOpen(false);
    });
  }, []);

  const toggleNav = useCallback(() => {
    startTransition(() => {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
        setDesktopOpen((prev) => !prev);
        return;
      }
      setMobileOpen((prev) => !prev);
    });
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
      <UserSidebar
        variant="sidebar"
        desktopOpen={desktopOpen}
        items={USER_NAV_ALL_ITEMS}
        groups={USER_NAV_GROUPS}
        mobileOpen={mobileOpen}
        onCloseMobile={closeNav}
        onToggle={toggleNav}
      />
      {children}
    </ProtectedRoute>
  );
}
