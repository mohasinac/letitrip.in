"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  ROUTES,
  useDashboardNav,
  AdminSidebar,
  ProtectedRoute,
  useSession,
  type AuthGuardUser,
  type AdminNavGroup,
} from "@mohasinac/appkit/client";

const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Management",
    items: [
      { href: String(ROUTES.ADMIN.DASHBOARD), label: "Dashboard" },
      { href: String(ROUTES.ADMIN.USERS), label: "Users" },
      { href: String(ROUTES.ADMIN.PRODUCTS), label: "Products" },
      { href: String(ROUTES.ADMIN.ORDERS), label: "Orders" },
      { href: String(ROUTES.ADMIN.STORES), label: "Stores" },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: String(ROUTES.ADMIN.ANALYTICS), label: "Analytics" },
      { href: String(ROUTES.ADMIN.PAYOUTS), label: "Payouts" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: String(ROUTES.ADMIN.CATEGORIES), label: "Categories" },
      { href: String(ROUTES.ADMIN.COUPONS), label: "Coupons" },
      { href: String(ROUTES.ADMIN.DEALS), label: "Deals" },
      { href: String(ROUTES.ADMIN.FEATURED), label: "Featured" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: String(ROUTES.ADMIN.REVIEWS), label: "Reviews" },
      { href: String(ROUTES.ADMIN.BLOG), label: "Blog" },
      { href: String(ROUTES.ADMIN.BIDS), label: "Bids" },
      { href: String(ROUTES.ADMIN.EVENTS), label: "Events" },
      { href: String(ROUTES.ADMIN.MEDIA), label: "Media" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: String(ROUTES.ADMIN.SITE), label: "Site Settings" },
      { href: String(ROUTES.ADMIN.NAVIGATION), label: "Navigation" },
      { href: String(ROUTES.ADMIN.SECTIONS), label: "Sections" },
      { href: String(ROUTES.ADMIN.CAROUSEL), label: "Carousel" },
      { href: String(ROUTES.ADMIN.ADS), label: "Ads" },
      { href: String(ROUTES.ADMIN.FAQS), label: "FAQs" },
      { href: String(ROUTES.ADMIN.NEWSLETTER), label: "Newsletter" },
      { href: String(ROUTES.ADMIN.CONTACT), label: "Contact" },
    ],
  },
  {
    title: "System",
    items: [
      { href: String(ROUTES.ADMIN.FEATURE_FLAGS), label: "Feature Flags" },
      { href: String(ROUTES.ADMIN.COPILOT), label: "Copilot" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
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
      user={user as AuthGuardUser | null}
      loading={loading}
      requireAuth
      requireRole="admin"
      onNavigate={(path) => router.push(path as Parameters<typeof router.push>[0])}
      routes={{
        loginPath: String(ROUTES.AUTH.LOGIN),
        unauthorizedPath: String(ROUTES.ERRORS.UNAUTHORIZED),
      }}
    >
      <AdminSidebar
        activePath={pathname}
        groups={ADMIN_NAV_GROUPS}
        mobileOpen={open}
        onCloseMobile={closeNav}
      />
      {children}

      {/* Mobile FAB — always visible above bottom nav on mobile */}
      {mounted && createPortal(
        <button
          type="button"
          onClick={toggleNav}
          aria-label="Toggle admin navigation"
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
