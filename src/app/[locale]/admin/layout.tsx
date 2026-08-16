import { Suspense, type ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { getServerPermissions } from "@mohasinac/appkit/server";
import { DashboardLayoutClient } from "@mohasinac/appkit/client";
import type { AdminNavGroup } from "@mohasinac/appkit/client";
import { isAdminUser, isEmployeeUser } from "@mohasinac/appkit";
import { ADMIN_NAV_GROUPS } from "@/constants";
import { ROUTES } from "@/constants";
import { getFlag } from "@/lib/features";
import { AdminCommandPaletteMount } from "./AdminCommandPaletteMount";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerSessionUser();
  console.error("[ADMIN-DIAG] user:", user ? JSON.stringify({ uid: user.uid, role: user.role, disabled: user.disabled }) : "null");
  if (!user) redirect(String(ROUTES.AUTH.LOGIN));
  const adminCheck = isAdminUser(user);
  const employeeCheck = isEmployeeUser(user);
  console.error("[ADMIN-DIAG] isAdminUser:", adminCheck, "isEmployeeUser:", employeeCheck);
  if (!adminCheck && !employeeCheck) redirect("/unauthorized");

  const resolved = await getServerPermissions(user.uid);
  console.error("[ADMIN-DIAG] resolved:", JSON.stringify(resolved));

  // employees must have at least dashboard:view; admin passes unconditionally
  if (!resolved.isAdmin && !resolved.permissions.includes("admin:dashboard:view")) {
    console.error("[ADMIN-DIAG] REDIRECTING to unauthorized from permission check");
    redirect("/unauthorized");
  }

  // null = admin sees all nav; explicit array = employee filtered nav
  const permissions = resolved.isAdmin ? null : resolved.permissions;

  // P-1: filter disabled-feature nav groups/items from the admin sidebar.
  const eventsOn  = getFlag("EVENTS");
  const blogOn    = getFlag("BLOG");
  const scamsOn   = getFlag("SCAM_REGISTRY");
  const auctionsOn = getFlag("AUCTIONS");
  const prizeDrawsOn = getFlag("PRIZE_DRAWS");
  const couponsOn = getFlag("COUPONS");
  const payoutsOn = getFlag("PAYOUTS");

  const groups = (ADMIN_NAV_GROUPS as AdminNavGroup[])
    .filter((group) => {
      // Hide the entire Events group when FEATURE_EVENTS=false
      if (group.title === "Events") return eventsOn;
      return true;
    })
    .map((group): AdminNavGroup => {
      switch (group.title) {
        case "Finance":
          return {
            ...group,
            items: group.items.filter((item) => item.label !== "Payouts" || payoutsOn),
          };
        case "Catalog":
          return {
            ...group,
            items: group.items.filter((item) => {
              if (item.label === "Prize Draws") return prizeDrawsOn;
              if (item.label === "Coupons") return couponsOn;
              return true;
            }),
          };
        case "Content":
          return {
            ...group,
            items: group.items.filter((item) => {
              if (item.label === "Blog") return blogOn;
              if (item.label === "Bids") return auctionsOn;
              return true;
            }),
          };
        case "Trust & Safety":
          return {
            ...group,
            items: group.items.filter((item) => item.label !== "Scam Registry" || scamsOn),
          };
        default:
          return group;
      }
    })
    .filter((group) => group.items.length > 0);

  return (
    <DashboardLayoutClient variant="admin" groups={groups} permissions={permissions}>
      <AdminCommandPaletteMount groups={groups.map((g) => ({ title: g.title, items: g.items.map((item) => ({ href: item.href, label: item.label })) }))} />
      <Suspense>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
