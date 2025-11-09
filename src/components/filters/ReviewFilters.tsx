"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface ReviewFilterValues {
  rating?: string[];
  verifiedPurchase?: boolean;
  hasMedia?: boolean;
  status?: "approved" | "pending" | "rejected";
}

interface ReviewFiltersProps {
  filters: ReviewFilterValues;
  onChange: (filters: ReviewFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof ReviewFilterValues>(
    key: K,
    value: ReviewFilterValues[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (value: string) => {
    const current = filters.rating || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, rating: updated.length > 0 ? updated : undefined });
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

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Rating</h4>
        <div className="space-y-2">
          {[
            { label: "5 Stars", value: "5" },
            { label: "4 Stars", value: "4" },
            { label: "3 Stars", value: "3" },
            { label: "2 Stars", value: "2" },
            { label: "1 Star", value: "1" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.rating || []).includes(option.value)}
                onChange={() => toggleArrayFilter(option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="text-yellow-500">
                  {"★".repeat(parseInt(option.value))}
                </span>
                <span className="text-gray-400">
                  {"★".repeat(5 - parseInt(option.value))}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Review Type */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Review Type</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifiedPurchase || false}
              onChange={(e) =>
                updateFilter("verifiedPurchase", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Verified Purchases Only
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasMedia || false}
              onChange={(e) =>
                updateFilter("hasMedia", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">With Images/Videos</span>
          </label>
        </div>
      </div>

      {/* Review Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Review Status</h4>
        <div className="space-y-2">
          {[
            { label: "Approved", value: "approved" },
            { label: "Pending", value: "pending" },
            { label: "Rejected", value: "rejected" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="status"
                checked={filters.status === option.value}
                onChange={() => updateFilter("status", option.value as any)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
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
