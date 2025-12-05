/**
 * @fileoverview React Component
 * @module src/components/common/StatCard
 * @description This file contains the StatCard component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * StatCardColor type
 * 
 * @typedef {Object} StatCardColor
 * @description Type definition for StatCardColor
 */
export type StatCardColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "yellow"
  | "indigo";

/**
 * StatCardProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StatCardProps
 */
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
  /** Blue */
  blue: {
    /** Icon */
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    /** Bg */
    bg: "bg-blue-50 dark:bg-blue-900/20",
    /** Text */
    text: "text-blue-600 dark:text-blue-400",
  },
  /** Green */
  green: {
    /** Icon */
    icon: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    /** Bg */
    bg: "bg-green-50 dark:bg-green-900/20",
    /** Text */
    text: "text-green-600 dark:text-green-400",
  },
  /** Purple */
  purple: {
    /** Icon */
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    /** Bg */
    bg: "bg-purple-50 dark:bg-purple-900/20",
    /** Text */
    text: "text-purple-600 dark:text-purple-400",
  },
  /** Orange */
  orange: {
    /** Icon */
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    /** Bg */
    bg: "bg-orange-50 dark:bg-orange-900/20",
    /** Text */
    text: "text-orange-600 dark:text-orange-400",
  },
  /** Red */
  red: {
    /** Icon */
    icon: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    /** Bg */
    bg: "bg-red-50 dark:bg-red-900/20",
    /** Text */
    text: "text-red-600 dark:text-red-400",
  },
  /** Yellow */
  yellow: {
    /** Icon */
    icon: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    /** Bg */
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    /** Text */
    text: "text-yellow-600 dark:text-yellow-400",
  },
  /** Indigo */
  indigo: {
    /** Icon */
    icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    /** Bg */
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    /** Text */
    text: "text-indigo-600 dark:text-indigo-400",
  },
};

/**
 * Function: Format Value
 */
/**
 * Formats value
 *
 * @param {string | number} value - The value
 *
 * @returns {string} The formatvalue result
 */

/**
 * Formats value
 *
 * @param {string | number} value - The value
 *
 * @returns {string} The formatvalue result
 */

function formatValue(value: string | number): string {
  if (typeof value === "number") {
    return value.toLocaleString("en-IN");
  }
  return value;
}

/**
 * Function: Stat Card
 */
/**
 * Performs stat card operation
 *
 * @returns {any} The statcard result
 *
 * @example
 * StatCard();
 */

/**
 * Performs stat card operation
 *
 * @returns {any} The statcard result
 *
 * @example
 * StatCard();
 */

export function StatCard({
  title,
  value,
  change,
  /** Icon */
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

  /**
   * Performs content operation
   *
   * @returns {any} The content result
   */

  /**
   * Performs content operation
   *
   * @returns {any} The content result
   */

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
