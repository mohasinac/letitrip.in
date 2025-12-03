/**
 * StatCard Component
 *
 * A reusable statistics card for dashboards and analytics.
 * Supports dark mode, optional link, and trend indicators.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StatCard
 *   title="Total Revenue"
 *   value={150000}
 *   icon={DollarSign}
 *   color="green"
 * />
 *
 * // With change indicator
 * <StatCard
 *   title="Orders"
 *   value={1234}
 *   change={12.5}
 *   icon={ShoppingCart}
 *   color="blue"
 * />
 *
 * // With prefix and link
 * <StatCard
 *   title="Revenue"
 *   value={50000}
 *   prefix="₹"
 *   icon={DollarSign}
 *   color="green"
 *   href="/admin/analytics/sales"
 * />
 * ```
 */

"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

export type StatCardColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "yellow"
  | "indigo";

interface StatCardProps {
  /** Title/label for the stat */
  title: string;
  /** The value to display */
  value: string | number;
  /** Optional percentage change from previous period */
  change?: number;
  /** Icon component to display */
  icon: React.ElementType;
  /** Color theme for the card */
  color: StatCardColor;
  /** Optional prefix (e.g., "₹" for currency) */
  prefix?: string;
  /** Optional suffix (e.g., "%" for percentage) */
  suffix?: string;
  /** Optional link - if provided, the card becomes clickable */
  href?: string;
  /** Additional CSS classes */
  className?: string;
}

const colorClasses: Record<
  StatCardColor,
  { icon: string; bg: string; text: string }
> = {
  blue: {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    icon: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
  purple: {
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  red: {
    icon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  yellow: {
    icon: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  indigo: {
    icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
  },
};

function formatValue(value: string | number): string {
  if (typeof value === "number") {
    return value.toLocaleString("en-IN");
  }
  return value;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  prefix = "",
  suffix = "",
  href,
  className = "",
}: StatCardProps) {
  const colors = colorClasses[color];
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  const content = (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {prefix}
          {formatValue(value)}
          {suffix}
        </p>
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              vs last period
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${colors.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  const cardClasses = `bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
    href
      ? "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all"
      : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

export default StatCard;
