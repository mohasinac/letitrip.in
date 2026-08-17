"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { DashboardLayoutClient, useSession } from "@mohasinac/appkit/client";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit";
import { getUserNavGroups, ROUTES } from "@/constants";
import type { UserNavGroup } from "@mohasinac/appkit/client";

interface UserLayoutClientProps {
  children: ReactNode;
  /** Feature flags forwarded from the server layout. */
  flags: { eventsOn: boolean; auctionsOn: boolean; chatOn: boolean };
}

export function UserLayoutClient({ children, flags }: UserLayoutClientProps) {
  const { user } = useSession();
  const isSeller = isSellerUser(user) || isAdminUser(user);
  const groups = useMemo(
    () => {
      const all = getUserNavGroups(isSeller, user?.uid, Boolean(user?.isTester));
      return all.map((group): UserNavGroup => {
        if (group.title === "Account") {
          return {
            ...group,
            items: group.items.filter((item) => item.label !== "Messages" || flags.chatOn),
          };
        }
        if (group.title !== "Shopping") return group;
        return {
          ...group,
          items: group.items.filter((item) => {
            if (item.label === "My Events") return flags.eventsOn;
            if (item.label === "My Bids") return flags.auctionsOn;
            return true;
          }),
        };
      }).filter((group) => group.items.length > 0);
    },
    [isSeller, user?.uid, user?.isTester, flags.eventsOn, flags.auctionsOn, flags.chatOn],
  );

  return (
    <DashboardLayoutClient variant="user" groups={groups} crossNav={{ profileHref: String(ROUTES.USER.PROFILE) }}>
      <Suspense>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
