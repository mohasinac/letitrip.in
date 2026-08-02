"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { DashboardLayoutClient, useSession } from "@mohasinac/appkit/client";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit";
import { getUserNavGroups } from "@/constants";
import type { UserNavGroup } from "@mohasinac/appkit/client";

interface UserLayoutClientProps {
  children: ReactNode;
  /** Feature flags forwarded from the server layout. */
  flags: { auctionsOn: boolean };
}

export function UserLayoutClient({ children, flags }: UserLayoutClientProps) {
  const { user } = useSession();
  const isSeller = isSellerUser(user) || isAdminUser(user);
  const groups = useMemo(
    () => {
      const all = getUserNavGroups(isSeller);
      return all.map((group): UserNavGroup => {
        if (group.title !== "Shopping") return group;
        return {
          ...group,
          items: group.items.filter((item) => item.label !== "My Bids" || flags.auctionsOn),
        };
      }).filter((group) => group.items.length > 0);
    },
    [isSeller, flags.auctionsOn],
  );

  return (
    <DashboardLayoutClient variant="user" groups={groups}>
      <Suspense>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
