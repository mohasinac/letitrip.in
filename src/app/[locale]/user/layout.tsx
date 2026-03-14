"use client";

import { useCallback, useEffect, useState } from "react";
import { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserSidebar } from "@/features/user";
import { Button, Main, ProtectedRoute, Span } from "@/components";
import { useDashboardNav } from "@/contexts";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const t = useTranslations("userHub");
  const tA11y = useTranslations("accessibility");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { registerNav, unregisterNav } = useDashboardNav();

  const openMobile = useCallback(() => setMobileOpen(true), []);

  useEffect(() => {
    registerNav(openMobile);
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openMobile]);

  return (
    <ProtectedRoute requireAuth>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-slate-900">
        <UserSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile sticky header */}
          <header className="sticky top-0 z-30 md:hidden flex items-center gap-3 h-14 px-4 bg-white dark:bg-slate-950 border-b border-zinc-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              aria-label={tA11y("openMenu")}
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <Span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("title")}
            </Span>
          </header>

          <Main className="flex-1 p-4 md:p-6">{children}</Main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
