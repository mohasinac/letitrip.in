import { Suspense, type ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { getServerPermissions } from "@mohasinac/appkit/server";
import { DashboardLayoutClient } from "@mohasinac/appkit/client";
import type { AdminNavGroup } from "@mohasinac/appkit/client";
import { isAdminUser, isEmployeeUser } from "@mohasinac/appkit";
import { ADMIN_NAV_GROUPS } from "@/constants";
import { ROUTES } from "@/constants";
import { AdminCommandPaletteMount } from "./AdminCommandPaletteMount";

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


export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerSessionUser();
  if (!user) redirect(String(ROUTES.AUTH.LOGIN));
  if (!isAdminUser(user) && !isEmployeeUser(user)) redirect("/unauthorized");

  const resolved = await getServerPermissions(user.uid);

  // employees must have at least dashboard:view; admin passes unconditionally
  if (!resolved.isAdmin && !resolved.permissions.includes("admin:dashboard:view")) {
    redirect("/unauthorized");
  }

  // null = admin sees all nav; explicit array = employee filtered nav
  const permissions = resolved.isAdmin ? null : resolved.permissions;

  /*
   * This used to filter the sidebar by seven env feature flags, matching on
   * hardcoded nav LABELS ("Payouts", "Prize Draws", "Blog", "Scam Registry"…).
   * Both flag systems were deleted 2026-08-29 — every flag was `true` in every
   * environment — so the filter is gone with them.
   *
   * Matching nav items by their display label was the deeper problem: renaming
   * "Prize Draws" in navigation.tsx would silently un-hide it here, and the
   * same label-matching filter existed in three other layouts, each with a
   * different subset. W6 replaces all four with one permission/id-driven
   * mechanism; until then the sidebar is unfiltered, which is what all seven
   * flags being `true` already meant.
   */
  const groups = (ADMIN_NAV_GROUPS as AdminNavGroup[]).filter(
    (group) => group.items.length > 0,
  );

  return (
    <DashboardLayoutClient
      variant="admin"
      groups={groups}
      permissions={permissions}
      crossNav={{
        profileHref: String(ROUTES.USER.PROFILE),
        storeHref: user.storeId ? String(ROUTES.STORE.DASHBOARD) : undefined,
      }}
    >
      <AdminCommandPaletteMount groups={groups.map((g) => ({ title: g.title, items: g.items.map((item) => ({ href: item.href, label: item.label })) }))} />
      <Suspense>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
