/**
 * @fileoverview React Component
 * @module src/components/common/PeriodSelector
 * @description This file contains the PeriodSelector component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * PeriodSelector Component
 *
 * A reusable time period selector for analytics and reports.
 * Used across admin analytics pages for consistent period filtering.
 *
 * @example
 * ```tsx
 * <PeriodSelector value={period} onChange={setPeriod} />
 * ```
 */

"use client";

/**
 * Period interface
 * 
 * @interface
 * @description Defines the structure and contract for Period
 */
interface Period {
  /** Label */
  label: string;
  /** Value */
  value: string;
}

const DEFAULT_PERIODS: Period[] = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

/**
 * PeriodSelectorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PeriodSelectorProps
 */
interface PeriodSelectorProps {
  /** Currently selected period value */
  value: string;
  /** Callback when period changes */
  onChange: (value: string) => void;
  /** Custom periods (defaults to day/week/month/year) */
  periods?: Period[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Function: Period Selector
 */
/**
 * Performs period selector operation
 *
 * @returns {any} The periodselector result
 *
 * @example
 * PeriodSelector();
 */

/**
 * Performs period selector operation
 *
 * @returns {any} The periodselector result
 *
 * @example
 * PeriodSelector();
 */

export function PeriodSelector({
  value,
  onChange,
  periods = DEFAULT_PERIODS,
  className = "",
}: PeriodSelectorProps) {
  return (
    <div
      className={`inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 ${className}`}
    >
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            value === period.value
              ? "bg-indigo-600 text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

export default PeriodSelector;
