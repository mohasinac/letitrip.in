"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";

export interface CategorySelectionStepProps {
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  showBreadcrumb?: boolean;
  leafOnly?: boolean;
  entityType?: "product" | "shop" | "auction";
}

/**
 * CategorySelectionStep Component
 *
 * Reusable category selection with tree view and inline create.
 * Used across Shop/Product/Auction wizards for consistent category selection.
 *
 * Features:
 * - Tree view navigation
 * - Search functionality
 * - Inline category creation
 * - Breadcrumb display
 * - Leaf-only selection for products
 * - Real-time validation
 *
 * @example
 * ```tsx
 * <CategorySelectionStep
 *   value={formData.categoryId}
 *   onChange={(categoryId) => setFormData({ ...formData, categoryId })}
 *   label="Product Category"
 *   required
 *   leafOnly
 *   showBreadcrumb
 * />
 * ```
 */
export function CategorySelectionStep({
  value,
  onChange,
  required = true,
  error,
  label = "Category",
  helperText = "Select the most specific category that fits",
  showBreadcrumb = true,
  leafOnly = true,
  entityType = "product",
}: CategorySelectionStepProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const handleCategoryChange = (categoryId: string | null) => {
    if (categoryId) {
      onChange(categoryId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {helperText && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>

      {/* Breadcrumb */}
      {showBreadcrumb && selectedPath.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">
          <span className="text-gray-400">Path:</span>
          {selectedPath.map((pathItem, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="whitespace-nowrap">{pathItem}</span>
              {index < selectedPath.length - 1 && (
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Selector */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <CategorySelectorWithCreate
          value={value}
          onChange={handleCategoryChange}
          required={required}
          error={error}
        />
        {leafOnly && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Please select a leaf category (most specific)
          </p>
        )}
      </div>

      {/* Info Box */}
      {entityType === "product" && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> Choose the most specific category to help
            customers find your {entityType}. For example, select
            &quot;Men&apos;s Running Shoes&quot; instead of just
            &quot;Shoes&quot;.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default CategorySelectionStep;
