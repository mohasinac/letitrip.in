/**
 * AuctionFilters Component
 *
 * Filter panel for auction-specific filters including status, time left, bid range, and features.
 * Framework-agnostic with injectable icons.
 *
 * @example
 * ```tsx
 * <AuctionFilters
 *   filters={{ status: ['live'], timeLeft: '24h' }}
 *   onChange={(newFilters) => setFilters(newFilters)}
 *   onApply={handleApply}
 *   onReset={handleReset}
 * />
 * ```
 */

import React from "react";

export interface AuctionFilterValues {
  status?: string[];
  timeLeft?: string;
  bidMin?: number;
  bidMax?: number;
  featured?: boolean;
  endingSoon?: boolean;
  sortBy?: "endTime" | "currentBid" | "bidCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface AuctionFiltersProps {
  /** Current filter values */
  filters: AuctionFilterValues;
  /** Callback when filters change */
  onChange: (filters: AuctionFilterValues) => void;
  /** Callback when Apply button is clicked */
  onApply: () => void;
  /** Callback when Reset/Clear All is clicked */
  onReset: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom icon for filter (injectable) */
  FilterIcon?: React.ComponentType<{ className?: string }>;
  /** Custom icon for clear (injectable) */
  ClearIcon?: React.ComponentType<{ className?: string }>;
}

/** Default Filter Icon */
const DefaultFilterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

/** Default Clear Icon */
const DefaultClearIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const AuctionFilters: React.FC<AuctionFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  className = "",
  FilterIcon = DefaultFilterIcon,
  ClearIcon = DefaultClearIcon,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof AuctionFilterValues>(
    key: K,
    value: AuctionFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (value: string) => {
    const current = filters.status || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, status: updated.length > 0 ? updated : undefined });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            type="button"
          >
            <ClearIcon className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Auction Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Auction Status
        </h4>
        <div className="space-y-2">
          {[
            { label: "Live", value: "live" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Ended", value: "ended" },
            { label: "Cancelled", value: "cancelled" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.status || []).includes(option.value)}
                onChange={() => toggleArrayFilter(option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time Left */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Time Left</h4>
        <div className="space-y-2">
          <select
            value={filters.timeLeft || ""}
            onChange={(e) =>
              updateFilter("timeLeft", e.target.value || undefined)
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Auctions</option>
            <option value="1h">Ending in 1 hour</option>
            <option value="6h">Ending in 6 hours</option>
            <option value="24h">Ending in 24 hours</option>
            <option value="7d">Ending in 7 days</option>
          </select>
        </div>
      </div>

      {/* Bid Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Current Bid Range
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="auction-filter-min-bid"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              Min
            </label>
            <input
              id="auction-filter-min-bid"
              type="number"
              placeholder="₹0"
              value={filters.bidMin || ""}
              onChange={(e) =>
                updateFilter(
                  "bidMin",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="auction-filter-max-bid"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              Max
            </label>
            <input
              id="auction-filter-max-bid"
              type="number"
              placeholder="₹100,000"
              value={filters.bidMax || ""}
              onChange={(e) =>
                updateFilter(
                  "bidMax",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Additional Options
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured || false}
              onChange={(e) =>
                updateFilter("featured", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Featured Only
            </span>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={onApply}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        type="button"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default AuctionFilters;
