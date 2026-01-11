"use client";

/**
 * SearchFilters Component
 *
 * Advanced filter panel for search results
 * Supports price, rating, category, shop, availability, and sorting
 */

import type { AdvancedSearchFilters } from "@/services/search.service";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  categories?: Array<{ id: string; name: string }>;
  shops?: Array<{ id: string; name: string }>;
  className?: string;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  categories = [],
  shops = [],
  className = "",
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["price", "rating", "availability", "sort"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      q: filters.q,
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRating ||
      filters.inStock !== undefined ||
      filters.categoryId ||
      filters.shopId ||
      filters.sortBy ||
      filters.fuzzy ||
      filters.exact
    );
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
  ] as const;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4">
        {/* Sort */}
        <div>
          <button
            onClick={() => toggleSection("sort")}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-900">Sort By</span>
            {expandedSections.has("sort") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSections.has("sort") && (
            <div className="mt-2 space-y-2">
              {sortOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={(e) =>
                      updateFilter("sortBy", e.target.value as any)
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-900">Price Range</span>
            {expandedSections.has("price") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSections.has("price") && (
            <div className="mt-2 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="₹0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="₹10,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-900">Minimum Rating</span>
            {expandedSections.has("rating") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSections.has("rating") && (
            <div className="mt-2 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={filters.minRating === rating}
                    onChange={(e) =>
                      updateFilter("minRating", Number(e.target.value))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-700">{rating}</span>
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-500">& up</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => toggleSection("availability")}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-900">Availability</span>
            {expandedSections.has("availability") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSections.has("availability") && (
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={filters.inStock === true}
                  onChange={(e) =>
                    updateFilter("inStock", e.target.checked ? true : undefined)
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          )}
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => toggleSection("category")}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <span className="font-medium text-gray-900">Category</span>
              {expandedSections.has("category") ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expandedSections.has("category") && (
              <div className="mt-2">
                <select
                  value={filters.categoryId || ""}
                  onChange={(e) =>
                    updateFilter("categoryId", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Shop */}
        {shops.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => toggleSection("shop")}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <span className="font-medium text-gray-900">Shop</span>
              {expandedSections.has("shop") ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {expandedSections.has("shop") && (
              <div className="mt-2">
                <select
                  value={filters.shopId || ""}
                  onChange={(e) =>
                    updateFilter("shopId", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">All Shops</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Search Options */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => toggleSection("options")}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-900">Search Options</span>
            {expandedSections.has("options") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {expandedSections.has("options") && (
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={filters.fuzzy === true}
                  onChange={(e) =>
                    updateFilter("fuzzy", e.target.checked ? true : undefined)
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm text-gray-700">Fuzzy Matching</div>
                  <div className="text-xs text-gray-500">Tolerates typos</div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={filters.exact === true}
                  onChange={(e) =>
                    updateFilter("exact", e.target.checked ? true : undefined)
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm text-gray-700">Exact Match Only</div>
                  <div className="text-xs text-gray-500">Precise results</div>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
