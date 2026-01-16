/**
 * StatCard Component
 *
 * Dashboard statistics card with color variants and trend indicators.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Sales"
 *   value={45231}
 *   formatValue={(val) => `₹${val.toLocaleString()}`}
 *   trend={12.5}
 *   variant="green"
 *   icon={<DollarIcon />}
 * />
 * ```
 */

import React from "react";

export interface StatCardProps {
  /** Stat title */
  title: string;
  /** Stat value */
  value: string | number;
  /** Optional format function for value */
  formatValue?: (value: string | number) => string;
  /** Optional prefix (e.g., "$", "₹") */
  prefix?: string;
  /** Optional suffix (e.g., "%", "km") */
  suffix?: string;
  /** Trend percentage (positive or negative) */
  trend?: number;
  /** Color variant */
  variant?:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "red"
    | "yellow"
    | "indigo";
  /** Icon element */
  icon?: React.ReactNode;
  /** Optional link href */
  href?: string;
  /** Link click handler (if not using href) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom TrendingUp icon */
  TrendingUpIcon?: React.ComponentType<{ className?: string }>;
  /** Custom TrendingDown icon */
  TrendingDownIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultTrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function DefaultTrendingDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  formatValue,
  prefix,
  suffix,
  trend,
  variant = "blue",
  icon,
  href,
  onClick,
  className = "",
  TrendingUpIcon = DefaultTrendingUpIcon,
  TrendingDownIcon = DefaultTrendingDownIcon,
}: StatCardProps) {
  const variantStyles = {
    blue: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconText: "text-blue-600 dark:text-blue-400",
      cardBg: "bg-blue-50 dark:bg-blue-900/10",
      cardBorder: "border-blue-200 dark:border-blue-800",
    },
    green: {
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconText: "text-green-600 dark:text-green-400",
      cardBg: "bg-green-50 dark:bg-green-900/10",
      cardBorder: "border-green-200 dark:border-green-800",
    },
    purple: {
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconText: "text-purple-600 dark:text-purple-400",
      cardBg: "bg-purple-50 dark:bg-purple-900/10",
      cardBorder: "border-purple-200 dark:border-purple-800",
    },
    orange: {
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconText: "text-orange-600 dark:text-orange-400",
      cardBg: "bg-orange-50 dark:bg-orange-900/10",
      cardBorder: "border-orange-200 dark:border-orange-800",
    },
    red: {
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconText: "text-red-600 dark:text-red-400",
      cardBg: "bg-red-50 dark:bg-red-900/10",
      cardBorder: "border-red-200 dark:border-red-800",
    },
    yellow: {
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
      iconText: "text-yellow-600 dark:text-yellow-400",
      cardBg: "bg-yellow-50 dark:bg-yellow-900/10",
      cardBorder: "border-yellow-200 dark:border-yellow-800",
    },
    indigo: {
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconText: "text-indigo-600 dark:text-indigo-400",
      cardBg: "bg-indigo-50 dark:bg-indigo-900/10",
      cardBorder: "border-indigo-200 dark:border-indigo-800",
    },
  };

  const style = variantStyles[variant];
  const formattedValue = formatValue
    ? formatValue(value)
    : `${prefix || ""}${value}${suffix || ""}`;

  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  const content = (
    <>
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        {icon && (
          <div className={cn("p-2 rounded-lg", style.iconBg, style.iconText)}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formattedValue}
        </p>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {isPositiveTrend && (
            <>
              <TrendingUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{trend}%
              </span>
            </>
          )}
          {isNegativeTrend && (
            <>
              <TrendingDownIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {trend}%
              </span>
            </>
          )}
          {!isPositiveTrend && !isNegativeTrend && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {trend}%
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-500">
            vs last period
          </span>
        </div>
      )}
    </>
  );

  const cardClasses = cn(
    "p-6 rounded-lg border transition-all",
    style.cardBg,
    style.cardBorder,
    (href || onClick) && "cursor-pointer hover:shadow-lg hover:scale-105",
    className
  );

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(cardClasses, "text-left w-full")}>
        {content}
      </button>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

export default StatCard;
