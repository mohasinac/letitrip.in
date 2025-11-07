"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface CouponFilterValues {
  discountType?: string[];
  status?: "active" | "inactive" | "expired";
  expiryFrom?: string;
  expiryTo?: string;
  shopId?: string;
}

interface CouponFiltersProps {
  filters: CouponFilterValues;
  onChange: (filters: CouponFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const CouponFilters: React.FC<CouponFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof CouponFilterValues>(
    key: K,
    value: CouponFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (value: string) => {
    const current = filters.discountType || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({
      ...filters,
      discountType: updated.length > 0 ? updated : undefined,
    });
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

      {/* Coupon Type */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Discount Type</h4>
        <div className="space-y-2">
          {[
            { label: "Percentage", value: "percentage" },
            { label: "Fixed Amount", value: "fixed" },
            { label: "BOGO", value: "bogo" },
            { label: "Tiered", value: "tiered" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.discountType || []).includes(option.value)}
                onChange={() => toggleArrayFilter(option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Status</h4>
        <div className="space-y-2">
          {[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Expired", value: "expired" },
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

      {/* Expiry Date */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Expiry Date</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">From</label>
            <input
              type="date"
              value={filters.expiryFrom || ""}
              onChange={(e) =>
                updateFilter("expiryFrom", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">To</label>
            <input
              type="date"
              value={filters.expiryTo || ""}
              onChange={(e) =>
                updateFilter("expiryTo", e.target.value || undefined)
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
