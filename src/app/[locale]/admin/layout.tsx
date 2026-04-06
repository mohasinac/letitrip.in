"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { ProtectedRoute, Main } from "@/components";
import { AdminSidebar, AdminTopBar } from "@/features/admin";
import { useDashboardNav } from "@/contexts";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const { registerNav, unregisterNav } = useDashboardNav();

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const toggleDesktop = useCallback(() => setDesktopOpen((prev) => !prev), []);

  useEffect(() => {
    registerNav(openMobile);
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openMobile]);

  return (
    <ProtectedRoute requireAuth requireRole="admin">
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-slate-950">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          desktopOpen={desktopOpen}
        />
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
          <AdminTopBar
            onMenuOpen={openMobile}
            onDesktopToggle={toggleDesktop}
            desktopSidebarOpen={desktopOpen}
          />
          <Main className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-100/50 dark:bg-slate-950/30">
            {children}
          </Main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
