"use client";

import dynamic from "next/dynamic";
import { Card, Heading, Text } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { useTheme } from "@/contexts";

const { spacing } = THEME_CONSTANTS;

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

export interface MonthEntry {
  month: string;
  orders: number;
  revenue: number;
}

interface SellerRevenueChartProps {
  data: MonthEntry[];
}

export function SellerRevenueChart({ data }: SellerRevenueChartProps) {
  const t = useTranslations("sellerAnalytics");
  const { theme } = useTheme();
  const tickFill = theme === "dark" ? "#9ca3af" : "#6b7280";
  return (
    <Card className="p-6">
      <div className={spacing.stack}>
        <Heading level={2}>{t("revenueChartTitle")}</Heading>
        {data.some((m) => m.revenue > 0) ? (
          <div className={THEME_CONSTANTS.chart.height}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: tickFill }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: tickFill }}
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
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Text size="sm" variant="secondary" className="text-center py-8">
            {t("noData")}
          </Text>
        )}
      </div>
    </Card>
  );
}
