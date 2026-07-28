import { Suspense, type ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard } from "@mohasinac/appkit/client";
import type { StoreNavGroup } from "@mohasinac/appkit/client";
import { STORE_NAV_GROUPS } from "@/constants";
import { getFlag } from "@/lib/features";

export default function StoreLayout({ children }: { children: ReactNode }) {
  const auctionsOn = getFlag("AUCTIONS");
  const preOrdersOn = getFlag("PREORDERS");
  const prizeDrawsOn = getFlag("PRIZE_DRAWS");
  const couponsOn = getFlag("COUPONS");
  const payoutsOn = getFlag("PAYOUTS");

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
          items: group.items.filter((item) => item.label !== "Bids" || auctionsOn),
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
      <DashboardLayoutClient variant="store" groups={groups}>
        <Suspense>{children}</Suspense>
      </DashboardLayoutClient>
    </RoleGuard>
  );
}
