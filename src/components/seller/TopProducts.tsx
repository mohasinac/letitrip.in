/**
 * @fileoverview React Component
 * @module src/components/seller/TopProducts
 * @description This file contains the TopProducts component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * ProductData interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductData
 */
interface ProductData {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Revenue */
  revenue: number;
  /** Quantity */
  quantity: number;
}

/**
 * Props interface
 * 
 * @interface
 * @description Defines the structure and contract for Props
 */
interface Props {
  /** Data */
  data: ProductData[];
}

export default function TopProducts({ data }: Props) {
  /**
   * Formats currency
   *
   * @param {number} value - The value
   *
   * @returns {number} The formatcurrency result
   */

  /**
   * Formats currency
   *
   * @param {number} value - The value
   *
   * @returns {number} The formatcurrency result
   */

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      /** Style */
      style: "currency",
      /** Currency */
      currency: "INR",
      /** Maximum Fraction Digits */
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top Products by Revenue
      </h3>

      {data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No product sales data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.slice(0, 5)} layout="vertical">
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
                  /** Background Color */
                  backgroundColor: "#1f2937",
                  /** Border */
                  border: "1px solid #374151",
                  /** Border Radius */
                  borderRadius: "6px",
                  /** Color */
                  color: "#f9fafb",
                }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Table view for all products */}
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
        </>
      )}
    </div>
  );
}
