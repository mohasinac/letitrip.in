/**
 * ProductFilters Component
 *
 * Comprehensive filter panel for products with price range, categories, brands,
 * stock status, condition, rating, and additional options.
 * Framework-agnostic - accepts categories as props instead of fetching directly.
 *
 * @example
 * ```tsx
 * <ProductFilters
 *   filters={{ priceMin: 100, categories: ['cat1'] }}
 *   onChange={(newFilters) => setFilters(newFilters)}
 *   onApply={handleApply}
 *   onReset={handleReset}
 *   categories={categoryList}
 *   availableBrands={['Nike', 'Adidas']}
 * />
 * ```
 */

import React, { useState } from "react";

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

export interface ProductCategory {
  id: string;
  name: string;
  level?: number;
  parentId?: string;
  parentIds?: string[];
  productCount?: number;
}

export interface ProductFiltersProps {
  /** Current filter values */
  filters: ProductFilterValues;
  /** Callback when filters change */
  onChange: (filters: ProductFilterValues) => void;
  /** Callback when Apply button is clicked */
  onApply: () => void;
  /** Callback when Reset/Clear All is clicked */
  onReset: () => void;
  /** Available categories (injectable - fetch from your data source) */
  categories?: ProductCategory[];
  /** Loading state for categories */
  loadingCategories?: boolean;
  /** Available brands list */
  availableBrands?: string[];
  /** Additional CSS classes */
  className?: string;
  /** Custom filter icon (injectable) */
  FilterIcon?: React.ComponentType<{ className?: string }>;
  /** Custom clear icon (injectable) */
  ClearIcon?: React.ComponentType<{ className?: string }>;
  /** Custom chevron down icon (injectable) */
  ChevronDownIcon?: React.ComponentType<{ className?: string }>;
  /** Custom chevron right icon (injectable) */
  ChevronRightIcon?: React.ComponentType<{ className?: string }>;
}

/** Default Filter Icon */
const DefaultFilterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

/** Default Clear Icon */
const DefaultClearIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/** Default ChevronDown Icon */
const DefaultChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

/** Default ChevronRight Icon */
const DefaultChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onReset,
  categories = [],
  loadingCategories = false,
  availableBrands = [],
  className = "",
  FilterIcon = DefaultFilterIcon,
  ClearIcon = DefaultClearIcon,
  ChevronDownIcon = DefaultChevronDownIcon,
  ChevronRightIcon = DefaultChevronRightIcon,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categorySearch, setCategorySearch] = useState("");

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

  const getChildCategories = (parentId: string) => {
    return filteredCategories.filter((cat) => {
      const parentIds = cat.parentIds || (cat.parentId ? [cat.parentId] : []);
      return parentIds.includes(parentId);
    });
  };

  const renderCategoryTree = (category: ProductCategory, depth = 0) => {
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = (filters.categories || []).includes(category.id);

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
                <ChevronDownIcon className="h-3 w-3" />
              ) : (
                <ChevronRightIcon className="h-3 w-3" />
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            type="button"
          >
            <ClearIcon className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
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
              rootCategories.map((category) => renderCategoryTree(category))
            )}
          </div>
        </div>
      )}

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
                  e.target.value ? Number(e.target.value) : undefined
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
                  e.target.value ? Number(e.target.value) : undefined
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
                  option.value as any
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
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        type="button"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default ProductFilters;
