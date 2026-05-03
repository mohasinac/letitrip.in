"use client";
import {
  StoreDashboardView,
  useStoreDashboard,
  ROUTES,
} from "@mohasinac/appkit/client";
import Link from "next/link";

const QUICK_ACTIONS = [
  { label: "Add Product", href: ROUTES.STORE.PRODUCTS_NEW },
  { label: "My Products", href: ROUTES.STORE.PRODUCTS },
  { label: "Orders", href: ROUTES.STORE.ORDERS },
  { label: "Analytics", href: ROUTES.STORE.ANALYTICS },
  { label: "Payouts", href: ROUTES.STORE.PAYOUTS },
  { label: "My Storefront", href: ROUTES.STORE.STOREFRONT },
];

function StatBox({ label, value, isLoading }: { label: string; value: string | number; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
      <div className="text-sm text-neutral-500 dark:text-zinc-400">{label}</div>
      {isLoading ? (
        <div className="mt-1 h-7 w-20 animate-pulse rounded bg-neutral-100 dark:bg-slate-800" />
      ) : (
        <div className="mt-1 text-2xl font-bold text-neutral-900 dark:text-zinc-100">{value}</div>
      )}
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
          <StatBox label="Total Revenue" value={stats ? `${stats.currency} ${stats.totalRevenue.toLocaleString()}` : "—"} isLoading={busy} />
          <StatBox label="Total Orders" value={stats?.totalOrders ?? "—"} isLoading={busy} />
          <StatBox label="Pending Orders" value={stats?.pendingOrders ?? "—"} isLoading={busy} />
          <StatBox label="Active Listings" value={stats?.activeListings ?? "—"} isLoading={busy} />
        </div>
      )}
      renderQuickActions={() => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(({ label, href }) => (
            <Link
              key={label}
              href={String(href)}
              className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-medium text-neutral-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    />
  );
}
