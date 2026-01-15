/**
 * UserFilters Component
 *
 * Filter panel for user-specific filters including role, account status, and registration date.
 * Framework-agnostic with injectable icons.
 *
 * @example
 * ```tsx
 * <UserFilters
 *   filters={{ role: ['admin', 'seller'], verified: true }}
 *   onChange={(newFilters) => setFilters(newFilters)}
 *   onApply={handleApply}
 *   onReset={handleReset}
 * />
 * ```
 */

import React from "react";

export interface UserFilterValues {
  role?: string[];
  status?: string[];
  verified?: boolean;
  registeredFrom?: string;
  registeredTo?: string;
}

export interface UserFiltersProps {
  /** Current filter values */
  filters: UserFilterValues;
  /** Callback when filters change */
  onChange: (filters: UserFilterValues) => void;
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

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  className = "",
  FilterIcon = DefaultFilterIcon,
  ClearIcon = DefaultClearIcon,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof UserFilterValues>(
    key: K,
    value: UserFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: "role" | "status", value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
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

      {/* User Role */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">User Role</h4>
        <div className="space-y-2">
          {[
            { label: "Admin", value: "admin" },
            { label: "Seller", value: "seller" },
            { label: "User", value: "user" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.role || []).includes(option.value)}
                onChange={() => toggleArrayFilter("role", option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Account Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Account Status
        </h4>
        <div className="space-y-2">
          {[
            { label: "Active", value: "active" },
            { label: "Banned", value: "banned" },
            { label: "Suspended", value: "suspended" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.status || []).includes(option.value)}
                onChange={() => toggleArrayFilter("status", option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Email Verification */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Email Verification
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
              Email Verified Only
            </span>
          </label>
        </div>
      </div>

      {/* Registration Date */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Registration Date
        </h4>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="user-filter-from-date"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              From
            </label>
            <input
              id="user-filter-from-date"
              type="date"
              value={filters.registeredFrom || ""}
              onChange={(e) =>
                updateFilter("registeredFrom", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="user-filter-to-date"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              To
            </label>
            <input
              id="user-filter-to-date"
              type="date"
              value={filters.registeredTo || ""}
              onChange={(e) =>
                updateFilter("registeredTo", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
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

export default UserFilters;
