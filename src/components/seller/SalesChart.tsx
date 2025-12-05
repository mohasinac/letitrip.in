/**
 * @fileoverview React Component
 * @module src/components/seller/SalesChart
 * @description This file contains the SalesChart component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

/**
 * SalesData interface
 * 
 * @interface
 * @description Defines the structure and contract for SalesData
 */
interface SalesData {
  /** Date */
  date: string;
  /** Revenue */
  revenue: number;
}

/**
 * Props interface
 * 
 * @interface
 * @description Defines the structure and contract for Props
 */
interface Props {
  /** Data */
  data: SalesData[];
}

export default function SalesChart({ data }: Props) {
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

  /**
   * Formats date
   *
   * @param {string} dateString - The date string
   *
   * @returns {string} The formatdate result
   */

  /**
   * Formats date
   *
   * @param {string} dateString - The date string
   *
   * @returns {string} The formatdate result
   */

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sales Over Time
      </h3>

      {data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No sales data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9ca3af" />
            <YAxis tickFormatter={formatCurrency} stroke="#9ca3af" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDate}
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
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
