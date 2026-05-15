"use client";
import {
  StoreDashboardView,
  useStoreDashboard,
  ROUTES,
} from "@mohasinac/appkit/client";
import { TrendingUp, ShoppingBag, Clock, Package, Plus, BarChart2, Wallet, Store } from "lucide-react";
import Link from "next/link";

// Brand gradient mirrors the SiteLogo wordmark — using CSS var tokens
const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";
const BLUE_GRAD  = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 100%)";
const GREEN_GRAD = "linear-gradient(135deg,var(--appkit-color-cobalt) 0%,var(--appkit-color-secondary-400) 100%)";
const AMBER_GRAD = "linear-gradient(135deg,var(--appkit-color-amber-500) 0%,var(--appkit-color-amber-600) 100%)";

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
    <div className="relative rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: gradient }} aria-hidden="true" />
      <div className="px-5 pb-5 pt-6 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--appkit-color-text-muted)]">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded bg-[var(--appkit-color-border)]" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-[var(--appkit-color-text)] tabular-nums leading-none">{value}</p>
          )}
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: gradient }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { stats, isLoading } = useStoreDashboard();

  return (
    <StoreDashboardView
      labels={{ title: "Store Dashboard" }}
      isLoading={isLoading}
      renderStats={(busy) => (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
        </div>
      )}
      renderQuickActions={() => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={String(href)}
              className="group flex items-center gap-3 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center" style={{ background: BRAND_GRAD }}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      )}
    />
  );
}
