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

interface UnifiedLayoutProps {
  children: ReactNode;
  showCategorySidebar?: boolean;
  showBothSidebars?: boolean;
}

export default function UnifiedLayout({
  children,
  showCategorySidebar = false,
  showBothSidebars = false,
}: UnifiedLayoutProps) {
  const pathname = usePathname();
  const { user } = useEnhancedAuth();
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(false);

  // Determine which layout to use based on pathname
  const isAdminRoute = pathname.startsWith("/admin");
  const isSellerRoute = pathname.startsWith("/seller");
  const isDashboardRoute = isAdminRoute || isSellerRoute;

  // Check if user has dashboard access
  const hasAdminAccess = user?.role === "admin";
  const hasSellerAccess = user?.role === "admin" || user?.role === "seller";

  // Only show sidebars on dashboard routes (admin/seller routes)
  // Regular user routes should NOT have sidebars unless explicitly requested
  const shouldShowCategorySidebar = isDashboardRoute
    ? false
    : showCategorySidebar;

  // For dashboard routes, we need role protection and sidebar
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
          <div
            className={`flex-1 bg-gray-50 ${
              isDashboardRoute ? "lg:pl-72" : ""
            }`}
          >
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

  // This section is no longer needed since we're simplifying the logic

  // For regular user pages - NO sidebars by default (clean header/footer layout)
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
