"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Header from "./Header";
import Footer from "./Footer";
import AdminSidebar from "@/components/features/admin/AdminSidebar";
import SellerSidebar from "@/components/seller/SellerSidebar";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useEnhancedAuth } from "@/hooks/auth/useEnhancedAuth";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user } = useEnhancedAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Routes that should NOT have the layout (auth pages, etc.)
  const noLayoutRoutes = [
    "/(auth)/login",
    "/(auth)/register",
    "/(auth)/forgot-password",
    "/(auth)/reset-password",
    "/(auth)/verify-email",
    // Legacy auth routes for backward compatibility
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  // Check if current route should skip layout
  const shouldSkipLayout = noLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldSkipLayout) {
    return <>{children}</>;
  }

  // Determine layout type based on pathname (including new route groups)
  const isAdminRoute =
    pathname.startsWith("/(admin)") || pathname.startsWith("/admin");
  const isSellerRoute =
    pathname.startsWith("/(seller)") || pathname.startsWith("/seller");
  const needsSidebar = isAdminRoute || isSellerRoute;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Header - Always visible */}
      <Header />

      <div className="flex flex-1">
        {/* Conditional Sidebar */}
        {needsSidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 flex w-full max-w-xs">
                  {isAdminRoute && (
                    <RoleGuard requiredRole="admin">
                      <AdminSidebar onClose={() => setSidebarOpen(false)} />
                    </RoleGuard>
                  )}
                  {isSellerRoute && (
                    <RoleGuard requiredRole="seller">
                      <SellerSidebar onClose={() => setSidebarOpen(false)} />
                    </RoleGuard>
                  )}
                </div>
              </div>
            )}

            {/* Desktop sidebar */}
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
          </>
        )}

        {/* Main content wrapper */}
        <div
          className={`flex-1 flex flex-col transition-colors duration-200 ${
            needsSidebar ? "lg:pl-72" : ""
          }`}
        >
          {/* Mobile header for admin/seller routes */}
          {needsSidebar && (
            <div
              className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden transition-colors duration-200"
              style={{ borderColor: "hsl(var(--header-border))" }}
            >
              <button
                type="button"
                className="-m-2.5 p-2.5 text-foreground hover:bg-accent rounded-md transition-colors lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex-1 text-sm font-semibold leading-6 text-foreground">
                {isAdminRoute ? "Admin Panel" : "Seller Panel"}
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1">
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

      {/* Footer - Always visible */}
      <Footer />
    </div>
  );
}
