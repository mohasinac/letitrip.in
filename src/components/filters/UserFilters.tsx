/**
 * @fileoverview React Component
 * @module src/components/filters/UserFilters
 * @description This file contains the UserFilters component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { Filter, X } from "lucide-react";

/**
 * UserFilterValues interface
 * 
 * @interface
 * @description Defines the structure and contract for UserFilterValues
 */
export interface UserFilterValues {
  /** Role */
  role?: string[];
  /** Status */
  status?: string[];
  /** Verified */
  verified?: boolean;
  /** Registered From */
  registeredFrom?: string;
  /** Registered To */
  registeredTo?: string;
}

/**
 * UserFiltersProps interface
 * 
 * @interface
 * @description Defines the structure and contract for UserFiltersProps
 */
interface UserFiltersProps {
  /** Filters */
  filters: UserFilterValues;
  /** On Change */
  onChange: (filters: UserFilterValues) => void;
  /** On Apply */
  onApply: () => void;
  /** On Reset */
  onReset: () => void;
}

/**
 * Performs user filters operation
 *
 * @returns {any} The userfilters result
 *
 * @example
 * UserFilters();
 */

/**
 * U
 * @constant
 */
/**
 * Performs user filters operation
 *
 * @returns {any} The userfilters result
 *
 * @example
 * UserFilters();
 */

/**
 * U
 * @constant
 */
export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  /**
 * Updates filter
 *
 * @param {K} key - The key
 * @param {UserFilterValues[K]} value - The value
 *
 * @returns {any} The updatefilter result
 *
 */
const updateFilter = <K extends keyof UserFilterValues>(
    /** Key */
    key: K,
    /** Value */
    value: UserFilterValues[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  /**
   * Performs toggle array filter operation
   *
   * @param {"role" | "status"} key - The key
   * @param {string} value - The value
   *
   * @returns {string} The togglearrayfilter result
   */

  /**
   * Performs toggle array filter operation
   *
   * @param {"role" | "status"} key - The key
   * @param {string} value - The value
   *
   * @returns {string} The togglearrayfilter result
   */

  const toggleArrayFilter = (key: "role" | "status", value: string) => {
    /**
     * Performs current operation
     *
     * @param {any} [filters[key] as string[]) || [];
    const updated] - The filters[key] as string[]) || [];
    const updated
     *
     * @returns {any} The current result
     */

    /**
     * Performs current operation
     *
     * @param {any} [filters[key] as string[]) || [];
    const updated] - The filters[key] /**
 * Updates d
 *
 * @param {any} value - The value
 *
 * @returns {any} The updated result
 *
 */
as string[]) || [];
    const updated
     *
     * @returns {any} The current result
     */

    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* User Role */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">User Role</h4>
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
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Account Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Account Status</h4>
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
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Verification */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Verification</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verified || false}
              onChange={(e) =>
                updateFilter("verified", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Email Verified Only</span>
          </label>
        </div>
      </div>

      {/* Registration Date */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Registration Date</h4>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="user-filter-from-date"
              className="text-xs text-gray-600"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="user-filter-to-date"
              className="text-xs text-gray-600"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={onApply}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Apply Filters
      </button>
    </div>
  );
};
