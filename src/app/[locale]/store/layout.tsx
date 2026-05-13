"use client";

import type { ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard } from "@mohasinac/appkit/client";
import { STORE_NAV_GROUPS } from "@/constants/navigation";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role={["seller", "admin"]}>
      <DashboardLayoutClient variant="store" groups={STORE_NAV_GROUPS}>
        {children}
      </DashboardLayoutClient>
    </RoleGuard>
  );
}
