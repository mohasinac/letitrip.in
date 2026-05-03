"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  ROUTES,
  useDashboardNav,
  StoreSidebar,
  ProtectedRoute,
  useSession,
  type StoreNavItem,
} from "@mohasinac/appkit/client";

const STORE_NAV_ITEMS: StoreNavItem[] = [
  { href: String(ROUTES.STORE.DASHBOARD), label: "Dashboard" },
  { href: String(ROUTES.STORE.PRODUCTS), label: "Products" },
  { href: String(ROUTES.STORE.ORDERS), label: "Orders" },
  { href: String(ROUTES.STORE.AUCTIONS), label: "Auctions" },
  { href: String(ROUTES.STORE.PRE_ORDERS), label: "Pre-Orders" },
  { href: String(ROUTES.STORE.OFFERS), label: "Offers" },
  { href: String(ROUTES.STORE.ANALYTICS), label: "Analytics" },
  { href: String(ROUTES.STORE.PAYOUTS), label: "Payouts" },
  { href: String(ROUTES.STORE.PAYOUT_SETTINGS), label: "Payout Settings" },
  { href: String(ROUTES.STORE.STOREFRONT), label: "Storefront" },
  { href: String(ROUTES.STORE.SHIPPING), label: "Shipping" },
  { href: String(ROUTES.STORE.ADDRESSES), label: "Addresses" },
  { href: String(ROUTES.STORE.COUPONS), label: "Coupons" },
];

export default function StoreLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
        items={STORE_NAV_ITEMS}
        activeHref={pathname}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />
      {children}
    </ProtectedRoute>
  );
}
