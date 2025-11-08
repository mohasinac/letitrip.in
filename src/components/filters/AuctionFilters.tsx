"use client";

import React from "react";
import { Filter, X } from "lucide-react";

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

interface AuctionFiltersProps {
  filters: AuctionFilterValues;
  onChange: (filters: AuctionFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const AuctionFilters: React.FC<AuctionFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
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

      {/* Auction Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Auction Status</h4>
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
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time Left */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Time Left</h4>
        <div className="space-y-2">
          <select
            value={filters.timeLeft || ""}
            onChange={(e) =>
              updateFilter("timeLeft", e.target.value || undefined)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <h4 className="font-medium text-gray-900">Current Bid Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Min</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.bidMin || ""}
              onChange={(e) =>
                updateFilter(
                  "bidMin",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Max</label>
            <input
              type="number"
              placeholder="₹100,000"
              value={filters.bidMax || ""}
              onChange={(e) =>
                updateFilter(
                  "bidMax",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Additional Options</h4>
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
