"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SellerSidebar from "@/components/seller/SellerSidebar";
import CategorySidebar from "./CategorySidebar";
import RoleGuard from "@/components/auth/RoleGuard";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user } = useEnhancedAuth();

  // Routes that should NOT have the layout (auth pages, etc.)
  const noLayoutRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  // Routes that should have category sidebar
  const categorySidebarRoutes = [
    "/products",
    "/categories",
    "/search",
    "/brands",
    "/deals",
  ];

  // Check if current route should skip layout
  const shouldSkipLayout = noLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldSkipLayout) {
    return <>{children}</>;
  }

  // Determine layout type based on pathname
  const isAdminRoute = pathname.startsWith("/admin");
  const isSellerRoute = pathname.startsWith("/seller");
  const isDashboardRoute = isAdminRoute || isSellerRoute;
  const shouldShowCategorySidebar = categorySidebarRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Dashboard routes (admin/seller) with sidebar
  if (isDashboardRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex flex-1">
          {isAdminRoute && (
            <RoleGuard requiredRole="admin">
              <AdminSidebar />
            </RoleGuard>
          )}

          {isSellerRoute && (
            <RoleGuard requiredRole="seller">
              <SellerSidebar />
            </RoleGuard>
          )}

          {/* Main content with sidebar offset */}
          <div className={`flex-1 ${isDashboardRoute ? "lg:pl-72" : ""}`}>
            <main className="min-h-screen">
              {isAdminRoute ? (
                <RoleGuard requiredRole="admin">{children}</RoleGuard>
              ) : isSellerRoute ? (
                <RoleGuard requiredRole="seller">{children}</RoleGuard>
              ) : (
                children
              )}
            </main>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Regular pages with optional category sidebar
  if (shouldShowCategorySidebar) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex flex-1">
          <CategorySidebar />

          {/* Main content with sidebar offset */}
          <div className="flex-1 lg:pl-72">
            <main className="min-h-screen">{children}</main>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Default layout for all other pages (stores, dashboard, profile, etc.)
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
