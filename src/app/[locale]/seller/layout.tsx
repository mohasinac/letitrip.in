"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  ROUTES,
  useDashboardNav,
  SellerSidebar,
  ProtectedRoute,
  useSession,
  type SellerNavItem,
} from "@mohasinac/appkit/client";

const SELLER_NAV_ITEMS: SellerNavItem[] = [
  { href: String(ROUTES.SELLER.DASHBOARD), label: "Dashboard" },
  { href: String(ROUTES.SELLER.PRODUCTS), label: "Products" },
  { href: String(ROUTES.SELLER.ORDERS), label: "Orders" },
  { href: String(ROUTES.SELLER.ANALYTICS), label: "Analytics" },
  { href: String(ROUTES.SELLER.PAYOUTS), label: "Payouts" },
  { href: String(ROUTES.SELLER.STORE), label: "Store" },
  { href: String(ROUTES.SELLER.SHIPPING), label: "Shipping" },
  { href: String(ROUTES.SELLER.COUPONS), label: "Coupons" },
  { href: String(ROUTES.SELLER.OFFERS), label: "Offers" },
  { href: String(ROUTES.SELLER.AUCTIONS), label: "Auctions" },
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
      requireRole={["seller", "admin"]}
      onNavigate={(path) => router.push(path as Parameters<typeof router.push>[0])}
      routes={{
        loginPath: String(ROUTES.AUTH.LOGIN),
        unauthorizedPath: String(ROUTES.ERRORS.UNAUTHORIZED),
      }}
    >
      <SellerSidebar items={SELLER_NAV_ITEMS} activeHref={pathname} />
      {children}
    </ProtectedRoute>
  );
}
