"use client";

import type { ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard } from "@mohasinac/appkit/client";
import { ADMIN_NAV_GROUPS } from "@/constants/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="admin">
      <DashboardLayoutClient variant="admin" groups={ADMIN_NAV_GROUPS}>
        {children}
      </DashboardLayoutClient>
    </RoleGuard>
  );
}
