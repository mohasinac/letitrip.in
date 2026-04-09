"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";
import { Span } from "@mohasinac/appkit/ui";

export interface ActiveFilter {
  /** Unique key for this filter (e.g. "status", "category") */
  key: string;
  /** Human-readable label (e.g. "Status") */
  label: string;
  /** Human-readable value (e.g. "Active") */
  value: string;
}

interface ActiveFilterChipsProps {
  /** List of currently active filters to display */
  filters: ActiveFilter[];
  /** Called with the filter key when the user dismisses a single chip */
  onRemove: (key: string) => void;
  /** Called when the user clicks "Clear all" */
  onClearAll: () => void;
  className?: string;
}

/**
 * ActiveFilterChips
 *
 * Renders a horizontal flex-wrap row of dismissible chips, one per active
 * filter, plus a "Clear all" button when any filters are active.
 * Returns null when no filters are active.
 *
 * @example
 * ```tsx
 * <ActiveFilterChips
 *   filters={[
 *     { key: "status", label: "Status", value: "Active" },
 *     { key: "role",   label: "Role",   value: "Seller" },
 *   ]}
 *   onRemove={(key) => clearFilter(key)}
 *   onClearAll={clearAllFilters}
 * />
 * ```
 */
export function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
  className = "",
}: ActiveFilterChipsProps) {
  if (filters.length === 0) return null;

  const { themed, flex } = THEME_CONSTANTS;
  const tActions = useTranslations("actions");

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="list"
      aria-label="Active filters"
    >
      {filters.map((filter) => (
        <Span
          key={filter.key}
          role="listitem"
          className={`inline-flex items-center gap-1 text-xs font-medium rounded-lg border ${themed.border} ${themed.bgSecondary} ${themed.textPrimary} py-1 pl-2 pr-1`}
        >
          <Span className={`${themed.textSecondary} mr-0.5`}>
            {filter.label}:
          </Span>
          {filter.value}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onRemove(filter.key)}
            aria-label={`Remove ${filter.label}: ${filter.value} filter`}
            className={`ml-1 ${flex.center} w-4 h-4 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors`}
          >
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </Span>
      ))}

      {/* Clear all */}
      <Button
        type="button"
        variant="ghost"
        onClick={onClearAll}
        className={`text-xs font-medium text-primary hover:underline p-2`}
      >
        {tActions("clearAll")}
      </Button>
    </div>
  );
}
