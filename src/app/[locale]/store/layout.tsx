"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  useDashboardNav,
  StoreSidebar,
  ProtectedRoute,
  useSession,
} from "@mohasinac/appkit/client";
import { ROUTES } from "@/constants";
import { STORE_NAV_GROUPS } from "@/constants/navigation";

export default function StoreLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { registerNav, unregisterNav } = useDashboardNav();
  const [desktopOpen, setDesktopOpen] = useState(false);
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
      user={user}
      loading={loading}
      requireAuth
      requireRole={["seller", "admin"]}
      onNavigate={(path) => router.push(path as Parameters<typeof router.push>[0])}
      routes={{
        loginPath: String(ROUTES.AUTH.LOGIN),
        unauthorizedPath: String(ROUTES.ERRORS.UNAUTHORIZED),
      }}
    >
      <StoreSidebar
        variant="sidebar"
        desktopOpen={desktopOpen}
        items={[]}
        groups={STORE_NAV_GROUPS}
        activeHref={pathname}
        mobileOpen={mobileOpen}
        onCloseMobile={closeNav}
        onToggle={toggleNav}
      />
      {children}
    </ProtectedRoute>
  );
}
