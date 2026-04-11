"use client";

import { useCallback, useEffect, useState } from "react";
import { ReactNode } from "react";
import { UserSidebar } from "@/features/user";
import { Main } from "@mohasinac/appkit/ui";
import { ProtectedRoute } from "@/components";
import { useDashboardNav } from "@/contexts";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { registerNav, unregisterNav } = useDashboardNav();

  const openMobile = useCallback(() => setMobileOpen(true), []);

  useEffect(() => {
    registerNav(openMobile);
    return () => unregisterNav();
  }, [registerNav, unregisterNav, openMobile]);

  return (
    <ProtectedRoute requireAuth>
      <div className="flex min-h-full w-full bg-zinc-50 dark:bg-slate-900">
        <UserSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Main className="flex-1 p-4 md:p-6">{children}</Main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
