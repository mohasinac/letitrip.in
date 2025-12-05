/**
 * @fileoverview React Component
 * @module src/components/common/filters/CategoryFilter
 * @description This file contains the CategoryFilter component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/**
 * CategoryOption interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryOption
 */
export interface CategoryOption {
  /** Value */
  value: string | number;
  /** Label */
  label: string;
  /** Count */
  count?: number;
  /** Children */
  children?: CategoryOption[];
  /** Parent Id */
  parentId?: string | number | null;
}

/**
 * CategoryFilterProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CategoryFilterProps
 */
export interface CategoryFilterProps {
  /** Options */
  options: CategoryOption[];
  /** Value */
  value: (string | number)[];
  /** On Change */
  onChange: (value: (string | number)[]) => void;
  /** Placeholder */
  placeholder?: string;
  /** Searchable */
  searchable?: boolean;
  /** Multi Select */
  multiSelect?: boolean;
  /** Show Counts */
  showCounts?: boolean;
  /** Highlight Text */
  highlightText?: (text: string) => React.ReactNode;
}

/**
 * Function: Category Filter
 */
/**
 * Performs category filter operation
 *
 * @returns {any} The categoryfilter result
 *
 * @example
 * CategoryFilter();
 */

/**
 * Performs category filter operation
 *
 * @returns {any} The categoryfilter result
 *
 * @example
 * CategoryFilter();
 */

export function CategoryFilter({
  options,
  value,
  onChange,
  placeholder = "Search categories...",
  searchable = true,
  multiSelect = true,
  showCounts = true,
  highlightText,
}: CategoryFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<
    Set<string | number>
  >(new Set());

  // Filter categories based on search
  /**
 * Performs filtered options operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The filteredoptions result
 *
 */
const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();
    const matchingCategories = new Set<string | number>();

    /**
     * Performs find matches operation
     *
     * @param {CategoryOption[]} categories - The categories
     *
     * @returns {any} The findmatches result
     */

    /**
     * Performs find matches operation
     *
     * @param {CategoryOption[]} categories - The categories
     *
     * @returns {any} The findmatches result
     */

    const findMatches = (categories: CategoryOption[]) => {
      categories.forEach((category) => {
        const matches = category.label.toLowerCase().includes(query);
        if (matches) {
          matchingCategories.add(category.value);
          // Add all parent categories
          let parent = category.parentId;
          while (parent) {
            matchingCategories.add(parent);
            const parentCategory = findCategoryById(parent, options);
            parent = parentCategory?.parentId;
          }
        }
        if (category.children) {
          findMatches(category.children);
        }
      });
    };

    /**
     * Performs find category by id operation
     *
     * @param {string | number} id - Unique identifier
     * @param {CategoryOption[]} categories - The categories
     *
     * @returns {string} The findcategorybyid result
     */

    /**
     * Performs find category by id operation
     *
     * @returns {string} The findcategorybyid result
     */

    const findCategoryById = (
      /** Id */
      id: string | number,
      /** Categories */
      categories: CategoryOption[],
    ): CategoryOption | null => {
      for (const category of categories) {
        if (category.value === id) return category;
        if (category.children) {
          const found = findCategoryById(id, category.children);
          if (found) return found;
        }
      }
      return null;
    };

    findMatches(options);

    /**
     * Filters categories
     *
     * @param {CategoryOption[]} categories - The categories
     *
     * @returns {any} The filtercategories result
     */

    /**
     * Filters categories
     *
     * @param {CategoryOption[]} /** Categories */
  /**
 * Performs filter categories operation
 *
 * @param {CategoryOption[]} categories - The categories
 *
 * @returns {CategoryOption[] =>} The filtercategories result
 *
 */
    categories - The /**  categories */
      categories
     *
     * @returns {any} The filtercategories result
     */

    const filterCategories = (
      /** Categories */
      categories: CategoryOption[],
    ): CategoryOption[] => {
      return categories
        .filter((category) => matchingCategories.has(category.value))
        .map((category) => ({
          ...category,
          /** Children */
          children: category.children
            ? filterCategories(category.children)
            : undefined,
        }));
    };

    return filterCategories(options);
  }, [options, searchQuery]);

  // Auto-expand categories with matches
  useEffect(() => {
    if (searchQuery) {
      const expanded = new Set<string | number>();
      /**
       * Performs add expanded operation
       *
       * @param {CategoryOption[]} categories - The categories
       *
       * @returns {any} The addexpanded result
       */

      /**
       * Performs add expanded operation
       *
       * @param {CategoryOption[]} categories - The categories
       *
       * @returns {any} The addexpanded result
       */

      const addExpanded = (categories: CategoryOption[]) => {
        categories.forEach((category) => {
          if (category.children && category.children.length > 0) {
            expanded.add(category.value);
            addExpanded(category.children);
          }
        });
      };
      addExpanded(filteredOptions);
      setExpandedCategories(expanded);
    }
  }, [searchQuery, filteredOptions]);

  /**
   * Performs toggle expand operation
   *
   * @param {string | number} categoryValue - The category value
   *
   * @returns {string} The toggleexpand result
   */

  /**
   * Performs toggle expand operation
   *
   * @param {string | number} categoryValue - The category value
   *
   * @returns {string} The toggleexpand result
   */

  const toggleExpand = (categoryValue: string | number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryValue)) {
        newSet.delete(categoryValue);
      } else {
        newSet.add(categoryValue);
      }
      return newSet;
    });
  };

  /**
   * Handles toggle event
   *
   * @param {string | number} categoryValue - The category value
   *
   */**
 * Performs new value operation
 *
 * @param {any} categoryValue - The categoryvalue
 *
 * @returns {any} The newvalue result
 *
 */
 @returns {string} The handletoggle result
   */

  /**
   * Handles toggle event
   *
   * @param {string | number} categoryValue - The category value
   *
   * @returns {string} The handletoggle result
   */

  const handleToggle = (categoryValue: string | number) => {
    if (multiSelect) {
      const newValue = value.includes(categoryValue)
        ? value.filter((v) => v !== categoryValue)
        : [...value, categoryValue];
      onChange(newValue);
    } else {
      onChange([categoryValue]);
    }
  };

  /**
   * Renders category
   *
   * @param {CategoryOption} category - The category
   * @param {number} [level] - The level
   *
   * @returns {number} The rendercategory result
   */

  /**
   * Renders category
   *
   * @param {CategoryOption} category - The category
   * @param {number} [level] - The level
   *
   * @returns {number} The rendercategory result
   */

  const renderCategory = (category: CategoryOption, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.value);
    const isSelected = value.includes(category.value);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.value} className="space-y-1">
        <div
          className={`flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded ${
            level > 0 ? `ml-${level * 4}` : ""
          }`}
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(category.value)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              type="button"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronRight
                className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type={multiSelect ? "checkbox" : "radio"}
              checked={isSelected}
              onChange={() => handleToggle(category.value)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
              {highlightText ? highlightText(category.label) : category.label}
            </span>
            {showCounts && category.count !== undefined && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {category.count}
              </span>
            )}
          </label>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children!.map((child) =>
              renderCategory(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              type="button"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>
      )}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredOptions.length === 0 && searchQuery ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No categories match "{searchQuery}"
          </p>
        ) : (
          filteredOptions.map((category) => renderCategory(category))
        )}
      </div>
    </div>
  );
}
