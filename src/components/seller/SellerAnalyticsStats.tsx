"use client";

import { Card } from "@/components/ui";
import { Text } from "@/components/typography";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed } = THEME_CONSTANTS;

export interface SellerAnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  publishedProducts: number;
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

interface SellerAnalyticsStatsProps {
  summary: SellerAnalyticsSummary;
}

export function SellerAnalyticsStats({ summary }: SellerAnalyticsStatsProps) {
  const t = useTranslations("sellerAnalytics");
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
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
        colorClass="text-indigo-600 dark:text-indigo-400"
      />
      <StatCard
        label={t("totalProducts")}
        value={String(summary.totalProducts)}
        icon="🛍️"
        colorClass="text-violet-600 dark:text-violet-400"
      />
      <StatCard
        label={t("publishedProducts")}
        value={String(summary.publishedProducts)}
        icon="✅"
        colorClass="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
