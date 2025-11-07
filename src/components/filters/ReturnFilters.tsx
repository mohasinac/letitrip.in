"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface ReturnFilterValues {
  status?: string[];
  reason?: string[];
  dateFrom?: string;
  dateTo?: string;
  requiresAdmin?: boolean;
}

interface ReturnFiltersProps {
  filters: ReturnFilterValues;
  onChange: (filters: ReturnFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const ReturnFilters: React.FC<ReturnFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof ReturnFilterValues>(
    key: K,
    value: ReturnFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: "status" | "reason", value: string) => {
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

      {/* Return Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Return Status</h4>
        <div className="space-y-2">
          {[
            { label: "Pending Review", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "Item Received", value: "received" },
            { label: "Refunded", value: "refunded" },
            { label: "Closed", value: "closed" },
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

      {/* Return Reason */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Return Reason</h4>
        <div className="space-y-2">
          {[
            { label: "Defective/Damaged", value: "defective" },
            { label: "Wrong Item", value: "wrong_item" },
            { label: "Not as Described", value: "not_as_described" },
            { label: "Changed Mind", value: "changed_mind" },
            { label: "Other", value: "other" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.reason || []).includes(option.value)}
                onChange={() => toggleArrayFilter("reason", option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Date Range</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">From</label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                updateFilter("dateFrom", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">To</label>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) =>
                updateFilter("dateTo", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Admin Intervention */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Admin Intervention</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.requiresAdmin || false}
              onChange={(e) =>
                updateFilter("requiresAdmin", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Requires Admin</span>
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
