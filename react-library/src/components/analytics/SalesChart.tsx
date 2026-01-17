import type { ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Sales data point for the chart
 */
export interface SalesDataPoint {
  /**
   * Date label for the data point
   */
  date: string;
  /**
   * Revenue amount for the date
   */
  revenue: number;
}

export interface SalesChartProps {
  /**
   * Sales data to display in the chart
   */
  data: SalesDataPoint[];
  /**
   * Function to format currency values
   * @default (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
   */
  formatCurrency?: (value: number) => string;
  /**
   * Function to format date labels
   * @default (date) => date
   */
  formatDate?: (dateString: string) => string;
  /**
   * Chart title
   * @default "Sales Over Time"
   */
  title?: string;
  /**
   * Message to display when no data is available
   * @default "No sales data available for the selected period"
   */
  emptyMessage?: string;
  /**
   * Custom empty state component
   */
  emptyState?: ReactNode;
  /**
   * Chart height in pixels
   * @default 320
   */
  height?: number;
  /**
   * Line color
   * @default "#3b82f6" (blue-500)
   */
  lineColor?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SalesChart - Displays sales revenue over time as a line chart
 *
 * A pure React component that renders a responsive line chart using recharts library.
 * Accepts sales data as props and provides customization options for formatting and styling.
 *
 * @example
 * ```tsx
 * const data = [
 *   { date: "2024-01-01", revenue: 5000 },
 *   { date: "2024-01-02", revenue: 7500 },
 * ];
 *
 * <SalesChart
 *   data={data}
 *   formatDate={(date) => format(new Date(date), "MMM dd")}
 * />
 * ```
 */
export function SalesChart({
  data,
  formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  },
  formatDate = (date: string) => date,
  title = "Sales Over Time",
  emptyMessage = "No sales data available for the selected period",
  emptyState,
  height = 320,
  lineColor = "#3b82f6",
  className = "",
}: SalesChartProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      {data.length === 0 ? (
        emptyState || (
          <div
            className="flex items-center justify-center text-gray-500 dark:text-gray-400"
            style={{ height: `${height}px` }}
          >
            {emptyMessage}
          </div>
        )
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9ca3af" />
            <YAxis tickFormatter={formatCurrency} stroke="#9ca3af" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#f9fafb",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
