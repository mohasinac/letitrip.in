import { Suspense, type ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard } from "@mohasinac/appkit/client";
import type { StoreNavGroup } from "@mohasinac/appkit/client";
import { isAdminUser, navItemId } from "@mohasinac/appkit";
import { STORE_NAV_GROUPS, ROUTES } from "@/constants";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/*
 * Every route under this layout is auth-gated and reads the session, so none
 * can be meaningfully prerendered — and a route-segment config on a LAYOUT
 * governs the whole subtree.
 *
 * This is the fix for Root Cause #17 at the right level. `export const
 * dynamic` has NO effect in a "use client" file, which is what most dashboard
 * pages are, so it cannot be set on them; and a page-level <Suspense> around
 * the client tree does NOT satisfy Next 16 static export either — verified,
 * admin/moderation still failed with the boundary in place. The layout is the
 * one place that both applies and works.
 */
export const dynamic = "force-dynamic";


export default async function StoreLayout({ children }: { children: ReactNode }) {
  const user = await getServerSessionUser();
  /*
   * Six env feature flags used to filter this sidebar by matching hardcoded nav
   * LABELS. Both flag systems were deleted 2026-08-29 (every flag was `true`
   * everywhere), so the only surviving rule is the one that was never a flag:
   * Bundles is hidden unconditionally, as it always was.
   *
   * Label-matching is the part worth losing. `if (item.label === "Prize Draws")`
   * breaks silently on a rename, and three other layouts carried their own
   * divergent copy of this filter — W6 replaces all four with one
   * permission/id-driven mechanism.
   */
  const groups = (STORE_NAV_GROUPS as StoreNavGroup[])
    .map((group) =>
      group.title === "Listings"
        ? {
            ...group,
            /*
             * P-1: bundles not in MVP scope. Not a feature flag — a scope
             * decision, and the only filter here that ever did anything.
             *
             * Keyed on the ID rather than the LABEL since W6. A label match
             * breaks silently the day someone renames the entry to "Bundle
             * deals": the filter stops matching, the item reappears, and
             * nothing says so.
             */
            items: group.items.filter(
              (item) => item.id !== navItemId("store", String(ROUTES.STORE.BUNDLES)),
            ),
          }
        : group,
    )
    .filter((group) => group.items.length > 0);

  return (
    <RoleGuard role={["seller", "admin"]}>
      <DashboardLayoutClient
        variant="store"
        groups={groups}
        crossNav={{
          profileHref: String(ROUTES.USER.PROFILE),
          adminHref: user && isAdminUser(user) ? String(ROUTES.ADMIN.DASHBOARD) : undefined,
        }}
      >
        <Suspense>{children}</Suspense>
      </DashboardLayoutClient>
    </RoleGuard>
  );
}
