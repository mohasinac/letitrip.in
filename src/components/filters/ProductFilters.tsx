"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types";

export interface ProductFilterValues {
  priceMin?: number;
  priceMax?: number;
  categories?: string[];
  stock?: "in_stock" | "out_of_stock" | "low_stock";
  condition?: ("new" | "like_new" | "good" | "fair")[];
  brands?: string[];
  featured?: boolean;
  returnable?: boolean;
  rating?: number;
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onChange: (filters: ProductFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  availableBrands?: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  availableBrands = [],
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categorySearch, setCategorySearch] = useState("");

  const hasActiveFilters = Object.keys(filters).length > 0;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.list({ isActive: true });
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const toggleCategoryExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter((cat) => {
    if (!categorySearch) return true;
    return cat.name.toLowerCase().includes(categorySearch.toLowerCase());
  });

  const rootCategories = filteredCategories.filter((cat) => cat.level === 0);

  const getChildCategories = (parentId: string) => {
    return filteredCategories.filter((cat) => cat.parentId === parentId);
  };

  const renderCategoryTree = (category: Category, depth = 0) => {
    const hasChildren = category.hasChildren;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = (filters.categories || []).includes(category.id);
    const children = hasChildren ? getChildCategories(category.id) : [];

    return (
      <div key={category.id} style={{ marginLeft: `${depth * 12}px` }}>
        <label className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-50 rounded px-1">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleCategoryExpand(category.id);
              }}
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleArrayFilter("categories", category.id)}
            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 flex-1">{category.name}</span>
          <span className="text-xs text-gray-500">
            ({category.productCount})
          </span>
        </label>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {children.map((child) => renderCategoryTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
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

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Categories</h4>
        <input
          type="text"
          placeholder="Search categories..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {loadingCategories ? (
            <p className="text-sm text-gray-500 py-2">Loading categories...</p>
          ) : rootCategories.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No categories found</p>
          ) : (
            rootCategories.map((category) => renderCategoryTree(category))
          )}
        </div>
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
        {/* Price Range Slider */}
        <div className="pt-2">
          <input
            type="range"
            min="0"
            max="100000"
            step="500"
            value={filters.priceMax || 100000}
            onChange={(e) =>
              updateFilter("priceMax", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>₹0</span>
            <span>₹1,00,000</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Brand</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(filters.brands || []).includes(brand)}
                  onChange={() => toggleArrayFilter("brands", brand)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

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
