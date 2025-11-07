"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface ShopFilterValues {
  verified?: boolean;
  rating?: number;
  featured?: boolean;
  homepage?: boolean;
  banned?: boolean;
}

interface ShopFiltersProps {
  filters: ShopFilterValues;
  onChange: (filters: ShopFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof ShopFilterValues>(
    key: K,
    value: ShopFilterValues[K]
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

      {/* Verification Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Verification Status</h4>
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
            <span className="text-sm text-gray-700">Verified Shops Only</span>
          </label>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Minimum Rating</h4>
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1 text-sm text-gray-700">
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
        <h4 className="font-medium text-gray-900">Shop Features</h4>
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.banned || false}
              onChange={(e) =>
                updateFilter("banned", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Banned</span>
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
