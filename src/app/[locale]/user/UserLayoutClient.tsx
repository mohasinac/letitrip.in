"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { DashboardLayoutClient, useSession, useSiteSettings } from "@mohasinac/appkit/client";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit/client";
import { getUserNavGroups, ROUTES } from "@/constants";
import type { UserNavGroup } from "@mohasinac/appkit/client";

interface UserLayoutClientProps {
  children: ReactNode;
}

export function UserLayoutClient({ children }: UserLayoutClientProps) {
  const { user } = useSession();
  // `data`, not `settings` — useSiteSettings returns a useQuery result
  // directly rather than wrapping it.
  const { data: settings } = useSiteSettings<{ support?: { enabled?: boolean } }>();
  const isAdmin = isAdminUser(user);
  const isSeller = isSellerUser(user) || isAdmin;
  const groups = useMemo(
    () => {
      // The `isTester` / `canTestAdmin` arguments went with the "Testing"
      // group in B2 — the group's only items were the human Tester Hub and a
      // redundant /admin shortcut. A tester with admin access reaches /admin
      // from the admin nav like any other admin.
      /*
       * `supportEnabled` — `siteSettings.support.enabled`, so the admin's
       * support switch actually removes the buyer's ticket entry.
       *
       * 🛑 `!== false`, not `=== true`. The settings fetch is async, so on the
       * first render `settings` is undefined — and treating that as "support
       * is off" would blink the nav item out and back in on every load, which
       * reads as a glitch. Absent means reachable, which is also the field's
       * own default.
       */
      const all = getUserNavGroups(
        isSeller,
        user?.uid,
        settings?.support?.enabled !== false,
      );
      // The CHAT / EVENTS / AUCTIONS env flags that filtered "Messages",
      // "My Events" and "My Bids" out of this sidebar were deleted 2026-08-29;
      // all three were `true` in every environment. Label-matched filters like
      // those are replaced wholesale in W6.
      return all.filter((group) => group.items.length > 0);
    },
    // `support.enabled` is a dependency: without it the memo keeps the nav
    // computed from the pre-fetch default and the switch never takes effect
    // until something else changes.
    [isSeller, user?.uid, settings?.support?.enabled],
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
