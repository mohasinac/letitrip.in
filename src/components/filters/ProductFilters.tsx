/**
 * @fileoverview React Component
 * @module src/components/filters/ProductFilters
 * @description This file contains the ProductFilters component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { logError } from "@/lib/error-logger";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";

/**
 * ProductFilterValues interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductFilterValues
 */
export interface ProductFilterValues {
  /** Price Min */
  priceMin?: number;
  /** Price Max */
  priceMax?: number;
  /** Categories */
  categories?: string[];
  /** Stock */
  stock?: "in_stock" | "out_of_stock" | "low_stock";
  /** Condition */
  condition?: ("new" | "like_new" | "good" | "fair")[];
  /** Brands */
  brands?: string[];
  /** Featured */
  featured?: boolean;
  /** Returnable */
  returnable?: boolean;
  /** Rating */
  rating?: number;
}

/**
 * ProductFiltersProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ProductFiltersProps
 */
interface ProductFiltersProps {
  /** Filters */
  filters: ProductFilterValues;
  /** On Change */
  onChange: (filters: ProductFilterValues) => void;
  /** On Apply */
  onApply: () => void;
  /** On Reset */
  onReset: () => void;
  /** Available Brands */
  availableBrands?: string[];
}

/**
 * Performs product filters operation
 *
 * @returns {any} The productfilters result
 *
 * @example
 * ProductFilters();
 */

/**
 * P
 * @constant
 */
/**
 * Performs product filters operation
 *
 * @returns {any} The productfilters result
 *
 * @example
 * ProductFilters();
 */

/**
 * P
 * @constant
 */
export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  availableBrands = [],
}) => {
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [categorySearch, setCategorySearch] = useState("");

  const hasActiveFilters = Object.keys(filters).length > 0;

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadCategories = async () => {
    try {
      const response = await categoriesService.list({ isActive: true });
      setCategories(response.data);
    } catch (error) {
      logError(error as Error, { component: "ProductFilters.loadCategories" });
    } finally {
      setLoadingCategories(false);
    }
  };

  const updateFilter = <K extends keyof ProductFilterValues>(
    /** Key */
    key: K,
    /** Value */
    value: ProductFilterValues[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof ProductFilterValues>(
    /** Key */
    key: K,
    /** Value */
    value: string,
  ) => {
    /**
     * Performs current operation
     *
     * @param {any} [filters[key] as string[]) || [];
    const updated] - The filters[key] as string[]) || [];
    const updated
     *
     * @returns {any} The current result
     */

    /**
     * Performs current operation
     *
     * @param {any} [filters[key] as string[]) || [];
    const updated] - The filters[key] as string[]) || [];
    const updated
     *
     * @returns {any} The current result
     */

    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
  };

  /**
   * Performs toggle category expand operation
   *
   * @param {string} categoryId - category identifier
   *
   * @returns {string} The togglecategoryexpand result
   */

  /**
   * Performs toggle category expand operation
   *
   * @param {string} categoryId - category identifier
   *
   * @returns {string} The togglecategoryexpand result
   */

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

  const rootCategories = filteredCategories.filter((cat) => {
    const parentIds = cat.parentIds || (cat.parentId ? [cat.parentId] : []);
    return cat.level === 0 || parentIds.length === 0;
  });

  /**
   * Retrieves child categories
   *
   * @param {string} parentId - parent identifier
   *
   * @returns {string} The childcategories result
   */

  /**
   * Retrieves child categories
   *
   * @param {string} parentId - parent identifier
   *
   * @returns {string} The childcategories result
   */

  const getChildCategories = (parentId: string) => {
    return filteredCategories.filter((cat) => {
      const parentIds = cat.parentIds || (cat.parentId ? [cat.parentId] : []);
      return parentIds.includes(parentId);
    });
  };

  /**
   * Renders category tree
   *
   * @param {CategoryFE} category - The category
   * @param {number} [depth] - The depth
   *
   * @returns {any} The rendercategorytree result
   */

  /**
   * Renders category tree
   *
   * @param {CategoryFE} category - The category
   * @param {number} [depth] - The depth
   *
   * @returns {any} The rendercategorytree result
   */

  const renderCategoryTree = (category: CategoryFE, depth = 0) => {
    const hasChildren = category.parentIds && category.parentIds.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    /**
     * Checks if selected
     *
     * @param {any} [filters.categories || []).includes(category.id);
    const children] - The filters.categories || []).includes(category.id);
    const children
     *
     * @returns {any} The isselected result
     */

    /**
     * Checks if selected
     *
     * @param {any} [filters.categories || []).includes(category.id);
    const children] - The filters.categories || []).includes(category.id);
    const children
     *
     * @returns {any} The isselected result
     */

    const isSelected = (filters.categories || []).includes(category.id);
    const children = hasChildren ? getChildCategories(category.id) : [];

    return (
      <div key={category.id} style={{ marginLeft: `${depth * 12}px` }}>
        <label className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-1">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleCategoryExpand(category.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
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
            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            {category.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({category.productCount || 0})
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
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Categories
        </h4>
        <input
          type="text"
          placeholder="Search categories..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <div className="max-h-64 overflow-y-auto space-y-1">
          {loadingCategories ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              Loading categories...
            </p>
          ) : rootCategories.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              No categories found
            </p>
          ) : (
            rootCategories.map((CategoryFE) => renderCategoryTree(CategoryFE))
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Price Range
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="product-filter-min-price"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              Min
            </label>
            <input
              id="product-filter-min-price"
              type="number"
              placeholder="₹0"
              value={filters.priceMin || ""}
              onChange={(e) =>
                updateFilter(
                  "priceMin",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="product-filter-max-price"
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              Max
            </label>
            <input
              id="product-filter-max-price"
              type="number"
              placeholder="₹100,000"
              value={filters.priceMax || ""}
              onChange={(e) =>
                updateFilter(
                  "priceMax",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            onChange={(e) => updateFilter("priceMax", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>₹0</span>
            <span>₹1,00,000</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Brand</h4>
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
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Stock Status
        </h4>
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">Condition</h4>
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
                  option.value as any,
                )}
                onChange={() => toggleArrayFilter("condition", option.value)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Minimum Rating
        </h4>
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-yellow-500">★</span>
                <span>{rating}+ Stars</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Additional Options
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.featured || false}
              onChange={(e) =>
                updateFilter("featured", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Featured Only
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.returnable || false}
              onChange={(e) =>
                updateFilter("returnable", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Returnable
            </span>
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
