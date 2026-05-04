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
    defaultOpen: true,
    items: [
      { href: String(ROUTES.USER.ORDERS), label: "My Orders" },
      { href: String(ROUTES.USER.OFFERS), label: "My Offers" },
      { href: String(ROUTES.USER.ADDRESSES), label: "Addresses" },
    ],
  },
  {
    title: "Account",
    defaultOpen: true,
    items: [
      { href: String(ROUTES.USER.PROFILE), label: "My Profile" },
      { href: String(ROUTES.USER.SETTINGS), label: "Settings" },
      { href: String(ROUTES.USER.NOTIFICATIONS), label: "Notifications" },
      { href: String(ROUTES.USER.MESSAGES), label: "Messages" },
    ],
  },
  {
    title: "Selling",
    defaultOpen: true,
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
      {children}
      <UserSidebar
        items={ALL_NAV_ITEMS}
        groups={USER_NAV_GROUPS}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />
    </ProtectedRoute>
  );
}
