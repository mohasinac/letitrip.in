"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  ROUTES,
  useDashboardNav,
  StoreSidebar,
  ProtectedRoute,
  useSession,
  type StoreNavGroup,
} from "@mohasinac/appkit/client";

const STORE_NAV_GROUPS: StoreNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: String(ROUTES.STORE.DASHBOARD), label: "Dashboard" },
    ],
  },
  {
    title: "Listings",
    items: [
      { href: String(ROUTES.STORE.PRODUCTS), label: "Products" },
      { href: String(ROUTES.STORE.AUCTIONS), label: "Auctions" },
      { href: String(ROUTES.STORE.PRE_ORDERS), label: "Pre-Orders" },
      { href: String(ROUTES.STORE.OFFERS), label: "Offers" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: String(ROUTES.STORE.ANALYTICS), label: "Analytics" },
      { href: String(ROUTES.STORE.PAYOUTS), label: "Payouts" },
      { href: String(ROUTES.STORE.PAYOUT_SETTINGS), label: "Payout Settings" },
    ],
  },
  {
    title: "Store",
    items: [
      { href: String(ROUTES.STORE.STOREFRONT), label: "Storefront" },
      { href: String(ROUTES.STORE.SHIPPING), label: "Shipping" },
      { href: String(ROUTES.STORE.ADDRESSES), label: "Addresses" },
      { href: String(ROUTES.STORE.COUPONS), label: "Coupons" },
    ],
  },
];

export default function StoreLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
        items={[]}
        groups={STORE_NAV_GROUPS}
        activeHref={pathname}
        mobileOpen={open}
        onCloseMobile={closeNav}
      />
      {children}

      {/* Mobile FAB — always visible above bottom nav on mobile */}
      {mounted && createPortal(
        <button
          type="button"
          onClick={toggleNav}
          aria-label="Toggle store navigation"
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
