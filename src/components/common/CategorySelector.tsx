"use client";

import React, { useState, useMemo, useCallback } from "react";

/**
 * Category Selector Component
 * Tree-based category selector with leaf-only selection for sellers
 * Supports multi-level categories with search and breadcrumb navigation
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  has_children: boolean;
  is_active: boolean;
  product_count?: number;
}

interface CategorySelectorProps {
  categories: Category[];
  value: string | null;
  onChange: (categoryId: string | null, category: Category | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showProductCount?: boolean;
  allowParentSelection?: boolean; // For admin - can select parent categories
  className?: string;
}

export default function CategorySelector({
  categories,
  value,
  onChange,
  placeholder = "Select a category",
  disabled = false,
  error,
  showProductCount = false,
  allowParentSelection = false, // Default: leaf-only (seller mode)
  className = "",
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Get selected category
  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === value) || null,
    [categories, value]
  );

  // Build category breadcrumb
  const breadcrumb = useMemo(() => {
    if (!selectedCategory) return [];

    const path: Category[] = [];
    let current: Category | undefined = selectedCategory;

    while (current) {
      path.unshift(current);
      current = categories.find((cat) => cat.id === current!.parent_id);
    }

    return path;
  }, [selectedCategory, categories]);

  // Build category tree
  const categoryTree = useMemo(() => {
    const tree: Map<string | null, Category[]> = new Map();

    categories.forEach((cat) => {
      if (!tree.has(cat.parent_id)) {
        tree.set(cat.parent_id, []);
      }
      tree.get(cat.parent_id)!.push(cat);
    });

    return tree;
  }, [categories]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Get category path for search results
  const getCategoryPath = useCallback(
    (category: Category): string => {
      const path: string[] = [];
      let current: Category | undefined = category;

      while (current) {
        path.unshift(current.name);
        current = categories.find((cat) => cat.id === current!.parent_id);
      }

      return path.join(" > ");
    },
    [categories]
  );

  // Toggle category expansion
  const toggleExpand = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // Handle category selection
  const handleSelect = useCallback(
    (category: Category) => {
      // Check if selection is allowed
      if (!allowParentSelection && category.has_children) {
        // Expand instead of select for parent categories
        toggleExpand(category.id);
        return;
      }

      onChange(category.id, category);
      setIsOpen(false);
      setSearchQuery("");
    },
    [allowParentSelection, onChange, toggleExpand]
  );

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null, null);
    },
    [onChange]
  );

  // Render category tree recursively
  const renderCategoryTree = useCallback(
    (parentId: string | null, level: number = 0) => {
      const children = categoryTree.get(parentId) || [];
      if (children.length === 0) return null;

      return children.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const isSelected = category.id === value;
        const hasChildren = category.has_children;
        const canSelect = allowParentSelection || !hasChildren;

        return (
          <div key={category.id}>
            <div
              onClick={() => handleSelect(category)}
              className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer
              ${
                !canSelect
                  ? "cursor-default"
                  : "hover:bg-gray-100:bg-gray-800"
              }
              ${
                isSelected
                  ? "bg-blue-50/20 text-blue-600"
                  : ""
              }
              ${!category.is_active ? "opacity-50" : ""}
            `}
              style={{ paddingLeft: `${12 + level * 20}px` }}
            >
              {/* Expand/Collapse icon */}
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.id);
                  }}
                  className="p-0.5 hover:bg-gray-200:bg-gray-700 rounded"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              {/* Category name */}
              <span className={`flex-1 ${!canSelect ? "font-semibold" : ""}`}>
                {category.name}
              </span>

              {/* Product count */}
              {showProductCount && category.product_count !== undefined && (
                <span className="text-xs text-gray-500">
                  ({category.product_count})
                </span>
              )}

              {/* Leaf indicator for sellers */}
              {!allowParentSelection && !hasChildren && (
                <span className="text-xs text-green-600">
                  ✓
                </span>
              )}
            </div>

            {/* Render children if expanded */}
            {isExpanded && renderCategoryTree(category.id, level + 1)}
          </div>
        );
      });
    },
    [
      categoryTree,
      expandedCategories,
      value,
      allowParentSelection,
      showProductCount,
      handleSelect,
      toggleExpand,
    ]
  );

  return (
    <div className={`category-selector relative ${className}`}>
      {/* Selected value / Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white"
          }
          ${
            error
              ? "border-red-500"
              : "border-gray-300"
          }
          ${isOpen ? "ring-2 ring-blue-500" : ""}
        `}
      >
        <div className="flex-1">
          {selectedCategory ? (
            <div className="text-sm">
              <div className="font-medium">{selectedCategory.name}</div>
              {breadcrumb.length > 1 && (
                <div className="text-xs text-gray-500">
                  {breadcrumb.map((cat) => cat.name).join(" > ")}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">
              {placeholder}
            </span>
          )}
        </div>

        {/* Clear button */}
        {selectedCategory && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-200:bg-gray-700 rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Dropdown icon */}
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500:ring-blue-400 outline-none"
              />
            </div>

            {/* Category list */}
            <div className="overflow-y-auto">
              {searchQuery.trim() ? (
                // Search results (flat list with paths)
                filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => {
                    const canSelect =
                      allowParentSelection || !category.has_children;
                    const isSelected = category.id === value;

                    return (
                      <div
                        key={category.id}
                        onClick={() => canSelect && handleSelect(category)}
                        className={`
                          px-3 py-2
                          ${
                            canSelect
                              ? "cursor-pointer hover:bg-gray-100:bg-gray-800"
                              : "cursor-default opacity-50"
                          }
                          ${
                            isSelected
                              ? "bg-blue-50/20 text-blue-600"
                              : ""
                          }
                        `}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">
                          {getCategoryPath(category)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-8 text-center text-gray-500">
                    No categories found
                  </div>
                )
              ) : (
                // Tree view
                renderCategoryTree(null)
              )}
            </div>

            {/* Helper text */}
            {!allowParentSelection && (
              <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                💡 Only leaf categories (without subcategories) can be selected
              </div>
            )}
          </div>
        </>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
