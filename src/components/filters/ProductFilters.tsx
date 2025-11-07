"use client";

import React from "react";
import { Filter, X } from "lucide-react";

export interface ProductFilterValues {
  priceMin?: number;
  priceMax?: number;
  categories?: string[];
  stock?: "in_stock" | "out_of_stock" | "low_stock";
  condition?: ("new" | "like_new" | "good" | "fair")[];
  featured?: boolean;
  returnable?: boolean;
  rating?: number;
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onChange: (filters: ProductFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const updateFilter = <K extends keyof ProductFilterValues>(
    key: K,
    value: ProductFilterValues[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof ProductFilterValues>(
    key: K,
    value: string
  ) => {
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

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Min</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.priceMin || ""}
              onChange={(e) =>
                updateFilter(
                  "priceMin",
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
              value={filters.priceMax || ""}
              onChange={(e) =>
                updateFilter(
                  "priceMax",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Stock Status</h4>
        <div className="space-y-2">
          {[
            { label: "In Stock", value: "in_stock" },
            { label: "Out of Stock", value: "out_of_stock" },
            { label: "Low Stock", value: "low_stock" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="stock"
                checked={filters.stock === option.value}
                onChange={() => updateFilter("stock", option.value as any)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Condition</h4>
        <div className="space-y-2">
          {[
            { label: "New", value: "new" },
            { label: "Like New", value: "like_new" },
            { label: "Good", value: "good" },
            { label: "Fair", value: "fair" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={(filters.condition || []).includes(
                  option.value as any
                )}
                onChange={() => toggleArrayFilter("condition", option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => updateFilter("rating", rating)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1 text-sm text-gray-700">
                <span className="text-yellow-500">★</span>
                <span>{rating}+ Stars</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.returnable || false}
              onChange={(e) =>
                updateFilter("returnable", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Returnable</span>
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
