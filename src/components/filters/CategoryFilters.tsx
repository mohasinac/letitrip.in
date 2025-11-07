"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface CategoryFilterValues {
  featured?: boolean;
  homepage?: boolean;
  parentId?: string;
  isLeaf?: boolean;
}

interface CategoryFiltersProps {
  filters: CategoryFilterValues;
  onChange: (filters: CategoryFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof CategoryFilterValues>(
    key: K,
    value: CategoryFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
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

      {/* Category Features */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Category Features</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured || false}
              onChange={(e) =>
                updateFilter("featured", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Featured Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.homepage || false}
              onChange={(e) =>
                updateFilter("homepage", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Homepage Only</span>
          </label>
        </div>
      </div>

      {/* Category Level */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Category Level</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isLeaf || false}
              onChange={(e) =>
                updateFilter("isLeaf", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Leaf Categories Only</span>
          </label>
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
