import { Suspense, type ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard } from "@mohasinac/appkit/client";
import type { StoreNavGroup } from "@mohasinac/appkit/client";
import { isAdminUser } from "@mohasinac/appkit";
import { STORE_NAV_GROUPS, ROUTES } from "@/constants";
import { getFlag } from "@/lib/features";
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
  const auctionsOn = getFlag("AUCTIONS");
  const preOrdersOn = getFlag("PREORDERS");
  const prizeDrawsOn = getFlag("PRIZE_DRAWS");
  const couponsOn = getFlag("COUPONS");
  const payoutsOn = getFlag("PAYOUTS");
  const chatOn = getFlag("CHAT");

  // P-1: filter disabled-feature nav items from the store sidebar.
  const groups = (STORE_NAV_GROUPS as StoreNavGroup[]).map((group) => {
    switch (group.title) {
      case "Listings":
        return {
          ...group,
          items: group.items.filter((item) => {
            if (item.label === "Auctions") return auctionsOn;
            if (item.label === "Pre-Orders") return preOrdersOn;
            if (item.label === "Prize Draws") return prizeDrawsOn;
            if (item.label === "Bundles") return false; // P-1: bundles not in MVP scope
            return true;
          }),
        };
      case "Orders & Reviews":
        return {
          ...group,
          items: group.items.filter((item) => {
            if (item.label === "Bids") return auctionsOn;
            if (item.label === "Messages") return chatOn;
            return true;
          }),
        };
      case "Finance":
        return {
          ...group,
          items: group.items.filter((item) => {
            if (item.label === "Payouts" || item.label === "Payout Settings" || item.label === "Payout Methods") return payoutsOn;
            return true;
          }),
        };
      case "Store":
        return {
          ...group,
          items: group.items.filter((item) => item.label !== "Coupons" || couponsOn),
        };
      default:
        return group;
    }
  }).filter((group) => group.items.length > 0);

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
