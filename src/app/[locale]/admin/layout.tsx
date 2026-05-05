"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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
      { href: String(ROUTES.ADMIN.BRANDS), label: "Brands" },
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
        variant="sidebar"
        desktopOpen={desktopOpen}
        activePath={pathname}
        groups={ADMIN_NAV_GROUPS}
        mobileOpen={mobileOpen}
        onCloseMobile={closeNav}
        onToggle={toggleNav}
      />
      {children}
    </ProtectedRoute>
  );
}
