"use client";

import { useMemo, type ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard, useSession } from "@mohasinac/appkit/client";
import { getUserNavGroups } from "@/constants/navigation";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const isSeller = user?.role === "seller" || user?.role === "admin";
  const groups = useMemo(() => getUserNavGroups(isSeller), [isSeller]);

  return (
    <RoleGuard>
      <DashboardLayoutClient variant="user" groups={groups}>
        {children}
      </DashboardLayoutClient>
    </RoleGuard>
  );
}
