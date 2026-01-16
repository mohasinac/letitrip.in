/**
 * PeriodSelector Component
 *
 * A framework-agnostic time period selector for analytics and reports.
 * Provides segmented button group for easy period filtering.
 *
 * @example
 * ```tsx
 * <PeriodSelector
 *   value="month"
 *   onChange={(period) => handlePeriodChange(period)}
 *   periods={[
 *     { label: "Today", value: "day" },
 *     { label: "This Week", value: "week" },
 *     { label: "This Month", value: "month" }
 *   ]}
 * />
 * ```
 */

export interface Period {
  /** Display label */
  label: string;
  /** Period value */
  value: string;
}

export interface PeriodSelectorProps {
  /** Currently selected period value */
  value: string;
  /** Callback when period changes */
  onChange: (value: string) => void;
  /** Available periods */
  periods?: Period[];
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Default periods
const DEFAULT_PERIODS: Period[] = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function PeriodSelector({
  value,
  onChange,
  periods = DEFAULT_PERIODS,
  disabled = false,
  className = "",
}: PeriodSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800 p-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {periods.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => !disabled && onChange(period.value)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            value === period.value
              ? "bg-indigo-600 text-white"
              : cn(
                  "text-gray-700 dark:text-gray-300",
                  !disabled && "hover:bg-gray-100 dark:hover:bg-gray-700"
                )
          )}
          aria-pressed={value === period.value}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

export default PeriodSelector;
