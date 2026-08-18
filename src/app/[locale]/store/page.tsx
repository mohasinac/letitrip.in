"use client";
import { useQuery } from "@tanstack/react-query";
import { CollapsibleSection, Div, DynamicBgDiv, ROUTES, SellerTopProducts, StoreDashboardView, apiClient, useCollapsedSections, useStoreDashboard } from "@mohasinac/appkit/client";
const __O = {
  hidden: "overflow-hidden",
} as const;
import { TrendingUp, ShoppingBag, Clock, Package, Plus, BarChart2, Wallet, Store, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";

import { Row } from "@mohasinac/appkit";
// Brand gradient mirrors the SiteLogo wordmark — using CSS var tokens
const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";
const BLUE_GRAD  = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 100%)";
const GREEN_GRAD = "linear-gradient(135deg,var(--appkit-color-cobalt) 0%,var(--appkit-color-secondary-400) 100%)";
const AMBER_GRAD = "linear-gradient(135deg,var(--appkit-color-amber-500) 0%,var(--appkit-color-amber-600) 100%)";
const GOLD_GRAD  = "linear-gradient(135deg,var(--appkit-color-amber-600) 0%,var(--appkit-color-secondary-400) 100%)";

const QUICK_ACTIONS = [
  { label: "Add Product",    href: ROUTES.STORE.PRODUCTS_NEW,  Icon: Plus },
  { label: "My Products",   href: ROUTES.STORE.PRODUCTS,       Icon: Package },
  { label: "Orders",         href: ROUTES.STORE.ORDERS,         Icon: ShoppingBag },
  { label: "Analytics",      href: ROUTES.STORE.ANALYTICS,      Icon: BarChart2 },
  { label: "Payouts",        href: ROUTES.STORE.PAYOUTS,        Icon: Wallet },
  { label: "My Storefront",  href: ROUTES.STORE.STOREFRONT,     Icon: Store },
];

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

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

const DASHBOARD_SECTION_IDS = [
  "store-dashboard:stats",
  "store-dashboard:quick-actions",
  "store-dashboard:top-products",
];

export default function Page() {
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
          <Div layout="grid" gap="4" className="grid-cols-2 sm:grid-cols-3">
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
          </Div>
        </CollapsibleSection>
      )}
      renderQuickActions={() => (
        <CollapsibleSection
          title="Quick Actions"
          isCollapsed={isCollapsed("store-dashboard:quick-actions")}
          onToggle={() => toggle("store-dashboard:quick-actions")}
        >
          <Div layout="grid" gap="3" className="grid-cols-2 sm:grid-cols-3">
            {QUICK_ACTIONS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={String(href)}
                className="group flex items-center gap-[var(--appkit-space-3)] rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3-5)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
              >
                <DynamicBgDiv
                  background={BRAND_GRAD}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md"
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </DynamicBgDiv>
                {label}
              </Link>
            ))}
          </Div>
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
              formatRevenue={rupees}
              labels={{ title: "Top Products (30d)" }}
            />
          </CollapsibleSection>
        ) : null
      }
    />
  );
}
