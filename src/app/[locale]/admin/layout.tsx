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
} from "@mohasinac/appkit/client";
import Link from "next/link";

const ADMIN_NAV_ITEMS = [
  { href: String(ROUTES.ADMIN.DASHBOARD), label: "Dashboard" },
  { href: String(ROUTES.ADMIN.USERS), label: "Users" },
  { href: String(ROUTES.ADMIN.PRODUCTS), label: "Products" },
  { href: String(ROUTES.ADMIN.ORDERS), label: "Orders" },
  { href: String(ROUTES.ADMIN.STORES), label: "Stores" },
  { href: String(ROUTES.ADMIN.ANALYTICS), label: "Analytics" },
  { href: String(ROUTES.ADMIN.PAYOUTS), label: "Payouts" },
  { href: String(ROUTES.ADMIN.CATEGORIES), label: "Categories" },
  { href: String(ROUTES.ADMIN.COUPONS), label: "Coupons" },
  { href: String(ROUTES.ADMIN.REVIEWS), label: "Reviews" },
  { href: String(ROUTES.ADMIN.BLOG), label: "Blog" },
  { href: String(ROUTES.ADMIN.MEDIA), label: "Media" },
  { href: String(ROUTES.ADMIN.SITE), label: "Site Settings" },
  { href: String(ROUTES.ADMIN.NAVIGATION), label: "Navigation" },
  { href: String(ROUTES.ADMIN.SECTIONS), label: "Sections" },
  { href: String(ROUTES.ADMIN.CAROUSEL), label: "Carousel" },
  { href: String(ROUTES.ADMIN.FEATURE_FLAGS), label: "Feature Flags" },
  { href: String(ROUTES.ADMIN.FAQS), label: "FAQs" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
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
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        renderNavItems={(activePath) =>
          ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                activePath === item.href
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))
        }
      />
      {children}
    </ProtectedRoute>
  );
}
