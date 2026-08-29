"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { DashboardLayoutClient, useSession } from "@mohasinac/appkit/client";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit/client";
import { getUserNavGroups, ROUTES } from "@/constants";
import type { UserNavGroup } from "@mohasinac/appkit/client";

interface UserLayoutClientProps {
  children: ReactNode;
}

export function UserLayoutClient({ children }: UserLayoutClientProps) {
  const { user } = useSession();
  const isAdmin = isAdminUser(user);
  const isSeller = isSellerUser(user) || isAdmin;
  const groups = useMemo(
    () => {
      const all = getUserNavGroups(
        isSeller,
        user?.uid,
        Boolean(user?.isTester) || isAdmin,
        Boolean(user?.canTestAdmin) || isAdmin,
      );
      // The CHAT / EVENTS / AUCTIONS env flags that filtered "Messages",
      // "My Events" and "My Bids" out of this sidebar were deleted 2026-08-29;
      // all three were `true` in every environment. Label-matched filters like
      // those are replaced wholesale in W6.
      return all.filter((group) => group.items.length > 0);
    },
    [isSeller, user?.uid, user?.isTester, user?.canTestAdmin, isAdmin],
  );

  return (
    <DashboardLayoutClient
      variant="user"
      groups={groups}
      crossNav={{
        profileHref: String(ROUTES.USER.PROFILE),
        storeHref: user?.storeId ? String(ROUTES.STORE.DASHBOARD) : undefined,
        adminHref: isAdmin ? String(ROUTES.ADMIN.DASHBOARD) : undefined,
      }}
    >
      <Suspense>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
