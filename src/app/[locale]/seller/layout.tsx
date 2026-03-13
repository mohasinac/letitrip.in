"use client";

import { ReactNode, useState } from "react";
import { ProtectedRoute, Button, AutoBreadcrumbs, Main } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { SellerSidebar } from "@/features/seller";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";

interface SellerLayoutProps {
  children: ReactNode;
}

/**
 * Seller Layout
 *
 * Sidebar-based layout for all seller section pages.
 * Desktop: fixed w-56 sidebar.
 * Mobile: Drawer triggered by hamburger in the top bar.
 */
export default function SellerLayout({ children }: SellerLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <ProtectedRoute requireAuth requireRole="seller">
      <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
        <SellerSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-14 flex-shrink-0 flex items-center px-4 md:px-6 justify-between border-b border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={`md:hidden ${THEME_CONSTANTS.flex.center} w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors`}
                aria-label={t("mobileNav")}
              >
                <Menu className="h-5 w-5" />
              </button>
              <AutoBreadcrumbs />
            </div>
          </header>
          <Main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</Main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
