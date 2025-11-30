"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface OrderFilterValues {
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  shopId?: string;
}

interface OrderFiltersProps {
  filters: OrderFilterValues;
  onChange: (filters: OrderFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof OrderFilterValues>(
    key: K,
    value: OrderFilterValues[K]
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

      {/* Order Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Order Status</h4>
        <div className="space-y-2">
          {[
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
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

      {/* Date Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Date Range</h4>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="order-filter-from-date"
              className="text-xs text-gray-600"
            >
              From
            </label>
            <input
              id="order-filter-from-date"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                updateFilter("dateFrom", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="order-filter-to-date"
              className="text-xs text-gray-600"
            >
              To
            </label>
            <input
              id="order-filter-to-date"
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

      {/* Order Amount */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Order Amount</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="order-filter-min-amount"
              className="text-xs text-gray-600"
            >
              Min
            </label>
            <input
              id="order-filter-min-amount"
              type="number"
              placeholder="₹0"
              value={filters.amountMin || ""}
              onChange={(e) =>
                updateFilter(
                  "amountMin",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="order-filter-max-amount"
              className="text-xs text-gray-600"
            >
              Max
            </label>
            <input
              id="order-filter-max-amount"
              type="number"
              placeholder="₹100,000"
              value={filters.amountMax || ""}
              onChange={(e) =>
                updateFilter(
                  "amountMax",
                  e.target.value ? Number(e.target.value) : undefined
                )
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
