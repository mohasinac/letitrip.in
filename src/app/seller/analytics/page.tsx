/**
 * Seller Analytics Page
 *
 * Route: /seller/analytics
 * Displays the authenticated seller's revenue + orders analytics.
 */

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Spinner, Text } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useAuth, useApiQuery } from "@/hooks";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;

// Lazy-load recharts to avoid SSR issues
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

interface SellerAnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  publishedProducts: number;
}

interface AnalyticsResponse {
  data: {
    summary: SellerAnalyticsSummary;
    revenueByMonth: MonthEntry[];
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
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <Text
            size="sm"
            className={`${themed.textSecondary} font-medium uppercase tracking-wide`}
          >
            {label}
          </Text>
          <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <span className="text-3xl" aria-hidden>
          {icon}
        </span>
      </div>
    </Card>
  );
}

export default function SellerAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const LABELS = UI_LABELS.SELLER_ANALYTICS;

  // Auth guard: only sellers (and admins) can view this page
  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "seller" && user.role !== "admin"))
    ) {
      router.push(ROUTES.SELLER.DASHBOARD);
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useApiQuery<AnalyticsResponse>({
    queryKey: ["seller-analytics", user?.uid ?? ""],
    queryFn: () => fetch(API_ENDPOINTS.SELLER.ANALYTICS).then((r) => r.json()),
    enabled: !!user && (user.role === "seller" || user.role === "admin"),
    cacheTTL: 5 * 60 * 1000,
  });

  const summary = data?.data?.summary;
  const revenueByMonth = data?.data?.revenueByMonth ?? [];
  const topProducts = data?.data?.topProducts ?? [];

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={spacing.stack}>
      {/* Page header */}
      <div>
        <h1 className={`${typography.h3} ${themed.textPrimary}`}>
          {LABELS.PAGE_TITLE}
        </h1>
        <p className={`mt-1 text-sm ${themed.textSecondary}`}>
          {LABELS.PAGE_SUBTITLE}
        </p>
      </div>

      {isLoading && (
        <div className={`text-center py-12 ${themed.textSecondary}`}>
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
              label={LABELS.TOTAL_PRODUCTS}
              value={String(summary.totalProducts)}
              icon="🛍️"
              colorClass="text-violet-600 dark:text-violet-400"
            />
            <StatCard
              label={LABELS.PUBLISHED_PRODUCTS}
              value={String(summary.publishedProducts)}
              icon="✅"
              colorClass="text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Revenue chart */}
          <Card className="p-6">
            <div className={spacing.stack}>
              <h2 className={`${typography.h4} ${themed.textPrimary}`}>
                {LABELS.REVENUE_CHART_TITLE}
              </h2>
              {revenueByMonth.some((m) => m.revenue > 0) ? (
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByMonth}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        strokeOpacity={0.3}
                      />
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
                      <Bar
                        dataKey="revenue"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p
                  className={`text-sm ${themed.textSecondary} text-center py-8`}
                >
                  {LABELS.NO_DATA}
                </p>
              )}
            </div>
          </Card>

          {/* Top products */}
          <Card className="p-6">
            <div className={spacing.stack}>
              <h2 className={`${typography.h4} ${themed.textPrimary}`}>
                {LABELS.TOP_PRODUCTS_TITLE}
              </h2>
              {topProducts.length > 0 ? (
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${spacing.stack}`}>
                  <p className={`text-sm font-medium ${themed.textPrimary}`}>
                    {LABELS.NO_DATA}
                  </p>
                  <p className={`text-xs ${themed.textSecondary}`}>
                    {LABELS.NO_DATA_DESC}
                  </p>
                  <Link
                    href={ROUTES.SELLER.PRODUCTS}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {LABELS.VIEW_PRODUCTS}
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {!isLoading && !summary && (
        <div className={`text-center py-12 ${spacing.stack}`}>
          <p className={`text-sm font-medium ${themed.textPrimary}`}>
            {LABELS.NO_DATA}
          </p>
          <p className={`text-xs ${themed.textSecondary}`}>
            {LABELS.NO_DATA_DESC}
          </p>
        </div>
      )}
    </div>
  );
}
