
/**
 * CategorySelector Component
 *
 * Framework-agnostic tree-based category selector with search functionality.
 * Supports leaf-only selection (seller mode) or full hierarchy selection (admin mode).
 *
 * @example
 * ```tsx
 * <CategorySelector
 *   categories={categories}
 *   value={selectedCategoryId}
 *   onChange={(id, category) => handleCategoryChange(id, category)}
 *   allowParentSelection={false}
 * />
 * ```
 */

import React, { useCallback, useMemo, useState } from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parentIds?: string[];
  childrenIds?: string[];
  level: number;
  has_children: boolean;
  is_active: boolean;
  product_count?: number;
}

export interface CategorySelectorProps {
  /** Available categories */
  categories: Category[];
  /** Currently selected category ID */
  value: string | null;
  /** Callback when category changes */
  onChange: (categoryId: string | null, category: Category | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Show product counts */
  showProductCount?: boolean;
  /** Allow parent category selection (default: false = leaf-only) */
  allowParentSelection?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom debounce function */
  debounce?: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ) => (...args: Parameters<T>) => void;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Simple inline debounce (if not provided)
function defaultDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

export function CategorySelector({
  categories,
  value,
  onChange,
  placeholder = "Select a category",
  disabled = false,
  error,
  showProductCount = false,
  allowParentSelection = false,
  className = "",
  debounce = defaultDebounce,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Debounce search query
  const handleSearchChange = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedQuery(query);
      }, 300),
    [debounce]
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearchChange(query);
  };

  // Get selected category
  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === value) || null,
    [categories, value]
  );

  // Build category breadcrumb (unused but kept for future feature)
  // const breadcrumb = useMemo(() => {
  //   if (!selectedCategory) return [];
  //   const path: Category[] = [];
  //   let current: Category | undefined = selectedCategory;
  //   while (current) {
  //     path.unshift(current);
  //     const currentParentIds: string[] =
  //       current.parentIds || (current.parent_id ? [current.parent_id] : []);
  //     current =
  //       currentParentIds.length > 0
  //         ? categories.find((cat) => cat.id === currentParentIds[0])
  //         : undefined;
  //   }
  //   return path;
  // }, [selectedCategory, categories]);

  // Build category tree
  const categoryTree = useMemo(() => {
    const tree: Map<string | null, Category[]> = new Map();
    categories.forEach((cat) => {
      const parentIds = cat.parentIds || (cat.parent_id ? [cat.parent_id] : []);

      if (parentIds.length === 0) {
        if (!tree.has(null)) tree.set(null, []);
        tree.get(null)!.push(cat);
      } else {
        parentIds.forEach((parentId) => {
          if (!tree.has(parentId)) tree.set(parentId, []);
          tree.get(parentId)!.push(cat);
        });
      }
    });
    return tree;
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!debouncedQuery.trim()) return categories;
    const query = debouncedQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query)
    );
  }, [categories, debouncedQuery]);

  // Get category path for search results
  const getCategoryPath = useCallback(
    (category: Category): string => {
      const path: string[] = [];
      let current: Category | undefined = category;
      while (current) {
        path.unshift(current.name);
        const currentParentIds: string[] =
          current.parentIds || (current.parent_id ? [current.parent_id] : []);
        current =
          currentParentIds.length > 0
            ? categories.find((cat) => cat.id === currentParentIds[0])
            : undefined;
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
      if (!allowParentSelection && category.has_children) {
        toggleExpand(category.id);
        return;
      }
      onChange(category.id, category);
      setIsOpen(false);
      setSearchQuery("");
      setDebouncedQuery("");
    },
    [allowParentSelection, onChange, toggleExpand]
  );

  // Render category tree recursively
  const renderCategoryTree = useCallback(
    (parentId: string | null, level: number = 0): React.ReactNode => {
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
              className={cn(
                "flex items-center gap-2 py-2.5 transition-colors",
                canSelect
                  ? "cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                  : "cursor-default",
                isSelected &&
                  "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 font-medium",
                !isSelected && "text-gray-900 dark:text-gray-100",
                !category.is_active && "opacity-50"
              )}
              style={{
                paddingLeft: `${16 + level * 20}px`,
                paddingRight: "16px",
              }}
            >
              {/* Expand/Collapse icon */}
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.id);
                  }}
                  className="p-0.5 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded transition-colors"
                >
                  <svg
                    className={cn(
                      "w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform",
                      isExpanded && "rotate-90"
                    )}
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
              <span
                className={cn(
                  "flex-1 text-sm",
                  !canSelect && "font-semibold text-gray-700 dark:text-gray-300"
                )}
              >
                {category.name}
              </span>

              {/* Product count */}
              {showProductCount && category.product_count !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                  ({category.product_count})
                </span>
              )}

              {/* Leaf indicator */}
              {!allowParentSelection && !hasChildren && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
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
    <div className={cn("category-selector relative", className)}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 lg:px-4 h-full cursor-pointer",
          "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex-1 truncate">
          {selectedCategory ? (
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
              {selectedCategory.name}
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate block">
              {placeholder}
            </span>
          )}
        </div>

        {/* Dropdown icon */}
        <svg
          className={cn(
            "w-4 h-4 flex-shrink-0 text-gray-600 dark:text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
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
          <div className="absolute z-20 left-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <input
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search categories..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 outline-none transition-all"
              />
            </div>

            {/* Category list */}
            <div className="overflow-y-auto">
              {debouncedQuery.trim() ? (
                // Search results
                filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => {
                    const canSelect =
                      allowParentSelection || !category.has_children;
                    const isSelected = category.id === value;

                    return (
                      <div
                        key={category.id}
                        onClick={() => canSelect && handleSelect(category)}
                        className={cn(
                          "px-4 py-2.5 transition-colors",
                          canSelect
                            ? "cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                            : "cursor-default opacity-50",
                          isSelected
                            ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200 font-medium"
                            : "text-gray-900 dark:text-gray-100"
                        )}
                      >
                        <div className="font-medium text-sm">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {getCategoryPath(category)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
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
              <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                💡 Only leaf categories can be selected
              </div>
            )}
          </div>
        </>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default CategorySelector;
