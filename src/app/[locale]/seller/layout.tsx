"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { Main, Button } from "@mohasinac/appkit/ui";
import { ProtectedRoute, AutoBreadcrumbs } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { SellerSidebar } from "@/features/seller";
import { useDashboardNav } from "@/contexts";
import { useTranslations } from "next-intl";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SellerLayoutProps {
  children: ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { registerNav, unregisterNav } = useDashboardNav();
  const t = useTranslations("nav");

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const toggleDesktop = useCallback(() => setDesktopOpen((prev) => !prev), []);

  useEffect(() => {
    registerNav(openMobile);
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openMobile]);

  return (
    <ProtectedRoute requireAuth requireRole={["seller", "admin"]}>
      <div className="flex h-full w-full overflow-hidden bg-white dark:bg-slate-950">
        <SellerSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          desktopOpen={desktopOpen}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-14 flex-shrink-0 flex items-center px-4 md:px-6 justify-between border-b border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile: open drawer */}
              <Button
                variant="ghost"
                onClick={() => setMobileOpen(true)}
                className={`md:hidden ${THEME_CONSTANTS.flex.center} w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors`}
                aria-label={t("mobileNav")}
              >
                <Menu className="h-5 w-5" />
              </Button>
              {/* Desktop: collapse/expand sidebar */}
              <Button
                variant="ghost"
                onClick={toggleDesktop}
                className={`hidden md:flex ${THEME_CONSTANTS.flex.center} w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors`}
                aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {desktopOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5" />
                )}
              </Button>
              <AutoBreadcrumbs />
            </div>
          </header>
          <Main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</Main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
