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
  type AuthGuardUser,
} from "@mohasinac/appkit/client";

const USER_NAV_ITEMS: UserNavItem[] = [
  { href: String(ROUTES.USER.PROFILE), label: "My Profile" },
  { href: String(ROUTES.USER.ORDERS), label: "My Orders" },
  { href: String(ROUTES.USER.WISHLIST), label: "Wishlist" },
  { href: String(ROUTES.USER.ADDRESSES), label: "Addresses" },
  { href: String(ROUTES.USER.NOTIFICATIONS), label: "Notifications" },
  { href: String(ROUTES.USER.OFFERS), label: "My Offers" },
  { href: String(ROUTES.USER.SETTINGS), label: "Settings" },
];

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const { registerNav, unregisterNav } = useDashboardNav();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(
    () => setMobileOpen((prev) => !prev),
    [],
  );

  useEffect(() => {
    registerNav({ open: openMobile, close: closeMobile, toggle: toggleMobile });
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openMobile, closeMobile, toggleMobile]);

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
        items={USER_NAV_ITEMS}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />
      {children}
    </ProtectedRoute>
  );
}
