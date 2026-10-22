"use client";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { CollapsibleSection, Div, Grid, DynamicBgDiv, ROUTES, SellerTopProducts, StoreDashboardView, apiClient, useCollapsedSections, useStoreDashboard, formatCurrency } from "@mohasinac/appkit/client";
const __O = {
  hidden: "overflow-hidden",
} as const;
import {
  /*
   * Six icons, one per stat tile. Seventeen more were imported here purely to
   * populate the deleted `SELLER_QUICK_ACTION_ICONS` map; the section cards
   * carry no icons at all, because a nav item has no `iconKey` and a
   * hand-written map of one would be the second list this change exists to
   * remove (see `DashboardHubView`'s header).
   */
  TrendingUp, ShoppingBag, Clock, Package, Wallet, Star,
} from "lucide-react";
import { API_ROUTES } from "@/constants/api";
import { STORE_NAV_GROUPS } from "@/constants/navigation";

import { Row } from "@mohasinac/appkit/client";
import { DashboardSectionsClient } from "@mohasinac/appkit/features/dashboard/components/DashboardSectionsClient";


// Brand gradient mirrors the SiteLogo wordmark — using CSS var tokens
const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";
const BLUE_GRAD  = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 100%)";
const GREEN_GRAD = "linear-gradient(135deg,var(--appkit-color-cobalt) 0%,var(--appkit-color-secondary-400) 100%)";
const AMBER_GRAD = "linear-gradient(135deg,var(--appkit-color-amber-500) 0%,var(--appkit-color-amber-600) 100%)";
const GOLD_GRAD  = "linear-gradient(135deg,var(--appkit-color-amber-600) 0%,var(--appkit-color-secondary-400) 100%)";
/*
 * The out-of-stock tile. Deliberately the only RED gradient on this page — it
 * is the one figure that means a listing cannot be bought right now, and a
 * second red tile would stop that reading as urgent.
 */
const RED_GRAD   = "linear-gradient(135deg,var(--appkit-color-error) 0%,var(--appkit-color-rose-600) 100%)";

function StatCard({
  label,
  value,
  isLoading,
  gradient,
  Icon,
}: {
  label: string;
  value: string | number;
  isLoading: boolean;
  gradient: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Div className={`relative border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__O.hidden}`} rounded="xl" shadow="sm-hover-md">
      <DynamicBgDiv
        background={gradient}
        className="absolute top-0 left-0 right-0 h-[3px]"
        aria-hidden="true"
      />
      <Row paddingX="x-5" paddingY="b-md-lg" padding="t-lg" align="start" justify="between" gap="3">
        <Div className="min-w-0 flex-1">
          <Div textWeight="semibold" className="text-[11px] uppercase tracking-widest text-[var(--appkit-color-text-muted)]">{label}</Div>
          {isLoading ? (
            <Div className="mt-2 h-7 w-20 animate-pulse bg-[var(--appkit-color-border)]" rounded="default" />
          ) : (
            <Div textSize="2xl" textWeight="bold" className="mt-2 text-[var(--appkit-color-text)] tabular-nums leading-none">{value}</Div>
          )}
        </Div>
        <DynamicBgDiv
          background={gradient}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg"
        >
          <Icon className="w-5 h-5 text-white" />
        </DynamicBgDiv>
      </Row>
    </Div>
  );
}

interface TopProduct {
  productId: string;
  title: string;
  revenue: number;
  orders: number;
  mainImage?: string;
}

const DASHBOARD_SECTION_IDS = [
  "store-dashboard:stats",
  "store-dashboard:quick-actions",
  "store-dashboard:top-products",
];

function PageInner() {
  const { stats, isLoading } = useStoreDashboard();
  const { isCollapsed, toggle } = useCollapsedSections({ sectionIds: DASHBOARD_SECTION_IDS });
  const { data: analyticsData } = useQuery<{ topProducts?: TopProduct[] }>({
    queryKey: ["store-analytics-top-products"],
    queryFn: () => apiClient.get<{ topProducts?: TopProduct[] }>(API_ROUTES.STORE.ANALYTICS),
    staleTime: 60_000,
  });
  const topProducts = analyticsData?.topProducts ?? [];

  return (
    <StoreDashboardView
      labels={{ title: "Store Dashboard" }}
      isLoading={isLoading}
      renderStats={(busy) => (
        <CollapsibleSection
          title="Stats"
          isCollapsed={isCollapsed("store-dashboard:stats")}
          onToggle={() => toggle("store-dashboard:stats")}
        >
          <Grid cols="statTiles" gap="md">
            <StatCard
              label="Total Revenue"
              value={stats ? `${stats.currency} ${stats.totalRevenue.toLocaleString()}` : "—"}
              isLoading={busy}
              gradient={GREEN_GRAD}
              Icon={TrendingUp}
            />
            <StatCard
              label="Total Orders"
              value={stats?.totalOrders ?? "—"}
              isLoading={busy}
              gradient={BRAND_GRAD}
              Icon={ShoppingBag}
            />
            <StatCard
              label="Pending Orders"
              value={stats?.pendingOrders ?? "—"}
              isLoading={busy}
              gradient={AMBER_GRAD}
              Icon={Clock}
            />
            <StatCard
              label="Active Listings"
              value={stats?.activeListings ?? "—"}
              isLoading={busy}
              gradient={BLUE_GRAD}
              Icon={Package}
            />
            <StatCard
              label="Pending Payouts"
              value={stats ? `${stats.currency} ${stats.pendingPayouts.toLocaleString()}` : "—"}
              isLoading={busy}
              gradient={GOLD_GRAD}
              Icon={Wallet}
            />
            <StatCard
              label="Avg. Rating"
              value={stats?.averageRating != null ? `${stats.averageRating} ★` : "—"}
              isLoading={busy}
              gradient={GREEN_GRAD}
              Icon={Star}
            />
          </Grid>
        </CollapsibleSection>
      )}
      renderQuickActions={() => (
        /*
         * ── Was a 19-tile "Quick Actions" wall ────────────────────────────
         *
         * Nineteen equally-weighted tiles, each a label and a gradient square,
         * hand-maintained in `SELLER_QUICK_ACTION_HREFS` beside the sidebar's
         * own six groups — a second list of the same destinations, which is
         * exactly how `DASHBOARD_QUICK_ACTIONS.seller` came to omit several
         * screens the sidebar has. It answered "here are nineteen things" and
         * never "what are my options".
         *
         * Now the six sidebar sections, each a card linking to its own hub
         * where every screen carries the sentence `navigation.tsx` already
         * holds. Derived from `STORE_NAV_GROUPS`, so a screen added to the nav
         * appears here with no edit.
         */
        <CollapsibleSection
          title="Browse by section"
          isCollapsed={isCollapsed("store-dashboard:quick-actions")}
          onToggle={() => toggle("store-dashboard:quick-actions")}
        >
          <DashboardSectionsClient portal="store" groups={STORE_NAV_GROUPS} />
        </CollapsibleSection>
      )}
      renderTopProducts={() =>
        topProducts.length > 0 ? (
          <CollapsibleSection
            title="Top Products (30d)"
            isCollapsed={isCollapsed("store-dashboard:top-products")}
            onToggle={() => toggle("store-dashboard:top-products")}
          >
            <SellerTopProducts
              products={topProducts}
              formatRevenue={formatCurrency}
              labels={{ title: "Top Products (30d)" }}
            />
          </CollapsibleSection>
        ) : null
      }
    />
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
