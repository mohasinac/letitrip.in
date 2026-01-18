import { ReactNode } from "react";
import { cn } from "../../utils/cn";

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
  selectedPath?: string[];
  
  // Injection props
  selectorComponent: ReactNode;
  icons?: {
    chevron?: ReactNode;
  };
  className?: string;
}

/**
 * CategorySelectionStep Component (Library Version)
 *
 * Framework-agnostic category selection step for wizard flows.
 * Accepts category selector as a component via injection pattern.
 *
 * Features:
 * - Flexible selector injection
 * - Optional breadcrumb display
 * - Leaf-only validation message
 * - Entity-specific tips
 * - Error display
 *
 * @example
 * ```tsx
 * <CategorySelectionStep
 *   value={formData.categoryId}
 *   onChange={(categoryId) => setFormData({ ...formData, categoryId })}
 *   selectorComponent={<CategorySelector value={...} onChange={...} />}
 *   icons={{ chevron: <ChevronRight /> }}
 *   label="Product Category"
 *   required
 *   leafOnly
 *   showBreadcrumb
 *   selectedPath={["Electronics", "Computers", "Laptops"]}
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
  selectedPath = [],
  selectorComponent,
  icons,
  className,
}: CategorySelectionStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
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
              {index < selectedPath.length - 1 && icons?.chevron && (
                <div className="flex-shrink-0">{icons.chevron}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Selector */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        {selectorComponent}
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
