/**
 * StatsCard Component
 *
 * A simple statistics card for dashboards. Supports dark mode.
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Orders"
 *   value={1234}
 *   icon={<ShoppingCart className="w-5 h-5" />}
 *   trend={{ value: 12.5, isPositive: true }}
 * />
 * ```
 */

"use client";

import { ReactNode } from "react";

export interface StatsCardProps {
  title: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
  className = "",
  onClick,
}: StatsCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 md:p-6 ${
        onClick
          ? "cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/30 transition-shadow"
          : ""
      } ${className}`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {title}
        </h3>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 md:gap-2 mb-1 md:mb-2">
        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>

        {trend && (
          <span
            className={`text-xs md:text-sm font-medium ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * StatsCardGrid Component
 *
 * A responsive grid container for StatsCard components.
 * Automatically adjusts columns based on screen size.
 *
 * @example
 * ```tsx
 * <StatsCardGrid>
 *   <StatsCard title="Orders" value={100} />
 *   <StatsCard title="Revenue" value="₹50,000" />
 *   <StatsCard title="Customers" value={250} />
 * </StatsCardGrid>
 *
 * // Custom columns
 * <StatsCardGrid columns={3}>
 *   ...
 * </StatsCardGrid>
 * ```
 */
interface StatsCardGridProps {
  children: ReactNode;
  /** Number of columns on large screens (default: 4) */
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const columnClasses: Record<number, string> = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

export function StatsCardGrid({
  children,
  columns = 4,
  className = "",
}: StatsCardGridProps) {
  return (
    <div
      className={`grid gap-4 md:gap-6 ${columnClasses[columns]} ${className}`}
    >
      {children}
    </div>
  );
}
