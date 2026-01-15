/**
 * ShopFilters Component
 *
 * Filter panel for shop-specific filters including verification, rating, and features.
 * Framework-agnostic with injectable icons.
 *
 * @example
 * ```tsx
 * <ShopFilters
 *   filters={{ verified: true, rating: 4 }}
 *   onChange={(newFilters) => setFilters(newFilters)}
 *   onApply={handleApply}
 *   onReset={handleReset}
 * />
 * ```
 */

import React from "react";

export interface ShopFilterValues {
  verified?: boolean;
  rating?: number;
  featured?: boolean;
  homepage?: boolean;
  banned?: boolean;
}

export interface ShopFiltersProps {
  /** Current filter values */
  filters: ShopFilterValues;
  /** Callback when filters change */
  onChange: (filters: ShopFilterValues) => void;
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

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  className = "",
  FilterIcon = DefaultFilterIcon,
  ClearIcon = DefaultClearIcon,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof ShopFilterValues>(
    key: K,
    value: ShopFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
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

      {/* Verification Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Verification Status
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verified || false}
              onChange={(e) =>
                updateFilter("verified", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Verified Shops Only
            </span>
          </label>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2, 1, 0].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => updateFilter("rating", rating || undefined)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                {rating > 0 ? (
                  <>
                    <span className="text-yellow-500">★</span>
                    <span>{rating}+ Stars</span>
                  </>
                ) : (
                  <span>Any Rating</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Shop Features */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Shop Features
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.homepage || false}
              onChange={(e) =>
                updateFilter("homepage", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Homepage Only
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.banned || false}
              onChange={(e) =>
                updateFilter("banned", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show Banned
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

export default ShopFilters;
