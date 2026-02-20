/**
 * Admin Analytics Page
 *
 * Route: /admin/analytics
 * Displays platform-wide revenue + order charts and top product rankings.
 * Requires admin or moderator role.
 */

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AdminPageHeader } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useApiQuery } from "@/hooks";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;

// Lazy-load recharts to avoid SSR issues
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((m) => m.Area), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

interface MonthEntry {
  month: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  productId: string;
  title: string;
  revenue: number;
  orders: number;
  mainImage: string;
}

interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  newOrdersThisMonth: number;
  revenueThisMonth: number;
  totalProducts: number;
  publishedProducts: number;
}

interface AnalyticsResponse {
  data: {
    summary: AnalyticsSummary;
    ordersByMonth: MonthEntry[];
    topProducts: TopProduct[];
  };
}

function StatCard({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
}) {
  return (
    <div
      className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-5 flex items-center justify-between`}
    >
      <div>
        <p
          className={`text-sm font-medium ${themed.textSecondary} uppercase tracking-wide`}
        >
          {label}
        </p>
        <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useApiQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: () => fetch(API_ENDPOINTS.ADMIN.ANALYTICS).then((r) => r.json()),
    cacheTTL: 5 * 60 * 1000, // 5-minute cache
  });

  const summary = data?.data?.summary;
  const ordersByMonth = data?.data?.ordersByMonth ?? [];
  const topProducts = data?.data?.topProducts ?? [];

  const LABELS = UI_LABELS.ADMIN_ANALYTICS;

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={LABELS.PAGE_TITLE}
        subtitle={LABELS.PAGE_SUBTITLE}
      />

      {isLoading && (
        <div className={`${themed.textSecondary} text-center py-12`}>
          {LABELS.LOADING}
        </div>
      )}

      {!isLoading && summary && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={LABELS.TOTAL_REVENUE}
              value={formatCurrency(summary.totalRevenue)}
              icon="💰"
              colorClass="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label={LABELS.TOTAL_ORDERS}
              value={String(summary.totalOrders)}
              icon="📦"
              colorClass="text-indigo-600 dark:text-indigo-400"
            />
            <StatCard
              label={LABELS.REVENUE_THIS_MONTH}
              value={formatCurrency(summary.revenueThisMonth)}
              icon="📈"
              colorClass="text-violet-600 dark:text-violet-400"
            />
            <StatCard
              label={LABELS.ORDERS_THIS_MONTH}
              value={String(summary.newOrdersThisMonth)}
              icon="🛍️"
              colorClass="text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Revenue chart */}
          <div
            className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-6 ${spacing.stack}`}
          >
            <h2 className={`${typography.h4} ${themed.textPrimary}`}>
              {LABELS.REVENUE_CHART_TITLE}
            </h2>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersByMonth}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      LABELS.REVENUE_LABEL,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders chart */}
          <div
            className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-6 ${spacing.stack}`}
          >
            <h2 className={`${typography.h4} ${themed.textPrimary}`}>
              {LABELS.ORDERS_CHART_TITLE}
            </h2>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [value, LABELS.ORDERS_LABEL]}
                  />
                  <Bar dataKey="orders" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top products */}
          {topProducts.length > 0 && (
            <div
              className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-6 ${spacing.stack}`}
            >
              <h2 className={`${typography.h4} ${themed.textPrimary}`}>
                {LABELS.TOP_PRODUCTS_TITLE}
              </h2>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {topProducts.map((p, i) => (
                  <div
                    key={p.productId}
                    className="flex items-center gap-4 py-3"
                  >
                    <span
                      className={`w-6 text-sm font-bold ${themed.textSecondary}`}
                    >
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${themed.textPrimary} truncate`}
                      >
                        {p.title}
                      </p>
                      <p className={`text-xs ${themed.textSecondary}`}>
                        {p.orders} {LABELS.ORDERS_LABEL}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.revenue)}
                    </span>
                    <Link
                      href={ROUTES.ADMIN.PRODUCTS}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !summary && (
        <div className={`text-center py-12 ${themed.textSecondary}`}>
          {LABELS.NO_DATA}
        </div>
      )}
    </div>
  );
}
