"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { useTheme } from "@/contexts";

const { themed, spacing, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.SELLER_ANALYTICS;

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
  const { theme } = useTheme();
  const tickFill = theme === "dark" ? "#9ca3af" : "#6b7280";
  return (
    <Card className="p-6">
      <div className={spacing.stack}>
        <h2 className={`${typography.h4} ${themed.textPrimary}`}>
          {LABELS.REVENUE_CHART_TITLE}
        </h2>
        {data.some((m) => m.revenue > 0) ? (
          <div style={{ height: 240 }}>
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
                    LABELS.REVENUE_LABEL,
                  ]}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className={`text-sm ${themed.textSecondary} text-center py-8`}>
            {LABELS.NO_DATA}
          </p>
        )}
      </div>
    </Card>
  );
}
