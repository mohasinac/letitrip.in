/**
 * AdminAnalyticsView
 *
 * Extracted from src/app/[locale]/admin/analytics/page.tsx
 * Displays platform-wide revenue + order charts and top product rankings.
 */

"use client";

import dynamic from "next/dynamic";
import { Heading, Span, Text } from "@mohasinac/appkit/ui";
import { AdminPageHeader, TextLink } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAdminAnalytics } from "@/features/admin/hooks";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

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
      className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-5 ${flex.between}`}
    >
      <div>
        <Text
          size="sm"
          weight="medium"
          variant="secondary"
          className="uppercase tracking-wide"
        >
          {label}
        </Text>
        <Text weight="bold" className={`text-2xl mt-1 ${colorClass}`}>
          {value}
        </Text>
      </div>
      <Span className="text-3xl" aria-hidden>
        {icon}
      </Span>
    </div>
  );
}

export function AdminAnalyticsView() {
  const { data, isLoading } = useAdminAnalytics();

  const summary = data?.data?.summary;
  const ordersByMonth = data?.data?.ordersByMonth ?? [];
  const topProducts = data?.data?.topProducts ?? [];

  const t = useTranslations("adminAnalytics");

  return (
    <div className={spacing.stack}>
      <AdminPageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />

      {isLoading && (
        <div className={`${themed.textSecondary} text-center py-12`}>
          {t("loading")}
        </div>
      )}

      {!isLoading && summary && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            <StatCard
              label={t("totalRevenue")}
              value={formatCurrency(summary.totalRevenue)}
              icon="💰"
              colorClass="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              label={t("totalOrders")}
              value={String(summary.totalOrders)}
              icon="📦"
              colorClass="text-primary"
            />
            <StatCard
              label={t("revenueThisMonth")}
              value={formatCurrency(summary.revenueThisMonth)}
              icon="📈"
              colorClass="text-violet-600 dark:text-violet-400"
            />
            <StatCard
              label={t("ordersThisMonth")}
              value={String(summary.newOrdersThisMonth)}
              icon="🛍️"
              colorClass="text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Revenue chart */}
          <div
            className={`rounded-xl border ${themed.border} ${themed.bgPrimary} p-6 ${spacing.stack}`}
          >
            <Heading level={2}>{t("revenueChartTitle")}</Heading>
            <div className={THEME_CONSTANTS.chart.heightMd}>
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
                      t("revenueLabel"),
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
            <Heading level={2}>{t("ordersChartTitle")}</Heading>
            <div className={THEME_CONSTANTS.chart.height}>
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
                  <Tooltip formatter={(value) => [value, t("ordersLabel")]} />
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
              <Heading level={2}>{t("topProductsTitle")}</Heading>
              <div className="divide-y divide-zinc-100 dark:divide-slate-800">
                {topProducts.map((p, i) => (
                  <div
                    key={p.productId}
                    className="flex items-center gap-4 py-3"
                  >
                    <Span
                      className={`w-6 text-sm font-bold ${themed.textSecondary}`}
                    >
                      {i + 1}.
                    </Span>
                    <div className={flex.growMin}>
                      <Text size="sm" weight="medium" className="truncate">
                        {p.title}
                      </Text>
                      <Text size="xs" variant="secondary">
                        {p.orders} {t("ordersLabel")}
                      </Text>
                    </div>
                    <Span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.revenue)}
                    </Span>
                    <TextLink
                      href={ROUTES.ADMIN.PRODUCTS}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      View
                    </TextLink>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !summary && (
        <div className={`text-center py-12 ${themed.textSecondary}`}>
          {t("noData")}
        </div>
      )}
    </div>
  );
}
