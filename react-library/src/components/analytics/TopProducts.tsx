import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Product data for the top products chart
 */
export interface TopProductData {
  /** Product ID */
  id: string;
  /** Product name */
  name: string;
  /** Total revenue from product */
  revenue: number;
  /** Quantity sold */
  quantity: number;
}

export interface TopProductsProps {
  /**
   * Product data to display
   */
  data: TopProductData[];
  /**
   * Function to format currency values
   * @default (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
   */
  formatCurrency?: (value: number) => string;
  /**
   * Chart title
   * @default "Top Products by Revenue"
   */
  title?: string;
  /**
   * Message to display when no data is available
   * @default "No product sales data available"
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
   * Maximum number of products to show in bar chart
   * @default 5
   */
  chartLimit?: number;
  /**
   * Bar color
   * @default "#3b82f6" (blue-500)
   */
  barColor?: string;
  /**
   * Whether to show the table view below the chart
   * @default true
   */
  showTable?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TopProducts - Display top products by revenue in bar chart and table
 *
 * A pure React component that renders a horizontal bar chart showing top products
 * and an optional table with all product data. Uses recharts library.
 *
 * @example
 * ```tsx
 * const data = [
 *   { id: "1", name: "Product A", revenue: 50000, quantity: 100 },
 *   { id: "2", name: "Product B", revenue: 30000, quantity: 75 },
 * ];
 *
 * <TopProducts data={data} />
 * ```
 */
export function TopProducts({
  data,
  formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  },
  title = "Top Products by Revenue",
  emptyMessage = "No product sales data available",
  emptyState,
  height = 320,
  chartLimit = 5,
  barColor = "#3b82f6",
  showTable = true,
  className = "",
}: TopProductsProps) {
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
        <>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data.slice(0, chartLimit)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                tickFormatter={formatCurrency}
                stroke="#9ca3af"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                stroke="#9ca3af"
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f9fafb",
                }}
              />
              <Bar dataKey="revenue" fill={barColor} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Table view for all products */}
          {showTable && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
