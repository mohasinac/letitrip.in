"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/constants";
import { useDashboardNav } from "@mohasinac/appkit/features/layout";
import { ProtectedRoute } from "@mohasinac/appkit/features/auth";
import { useSession } from "@mohasinac/appkit";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const { registerNav, unregisterNav } = useDashboardNav();
  const [, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);

  useEffect(() => {
    registerNav(openMobile);
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openMobile]);

  return (
    <ProtectedRoute
      user={user}
      loading={loading}
      requireAuth
      onNavigate={(path) => router.push(path as Parameters<typeof router.push>[0])}
      routes={{
        loginPath: String(ROUTES.AUTH.LOGIN),
        unauthorizedPath: String(ROUTES.ERRORS.UNAUTHORIZED),
      }}
    >
      {children}
    </ProtectedRoute>
  );
}
