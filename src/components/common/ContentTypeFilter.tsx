/**
 * @fileoverview React Component
 * @module src/components/common/ContentTypeFilter
 * @description This file contains the ContentTypeFilter component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import {
  Package,
  Gavel,
  Store,
  FolderTree,
  FileText,
  Search,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

/**
 * ContentType type
 * 
 * @typedef {Object} ContentType
 * @description Type definition for ContentType
 */
export type ContentType =
  | "all"
  | "products"
  | "auctions"
  | "shops"
  | "categories"
  | "blog";

/**
 * ContentTypeOption interface
 * 
 * @interface
 * @description Defines the structure and contract for ContentTypeOption
 */
export interface ContentTypeOption {
  /** Value */
  value: ContentType;
  /** Label */
  label: string;
  /** Icon */
  icon: React.ReactNode;
  /** Placeholder */
  placeholder: string;
}

/**
 * ContentTypeFacets interface
 * 
 * @interface
 * @description Defines the structure and contract for ContentTypeFacets
 */
export interface ContentTypeFacets {
  /** Products */
  products: number;
  /** Auctions */
  auctions: number;
  /** Shops */
  shops: number;
  /** Categories */
  categories: number;
  /** Blog */
  blog: number;
}

/**
 * ContentTypeFilterProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ContentTypeFilterProps
 */
export interface ContentTypeFilterProps {
  /** Currently selected content type */
  value: ContentType;
  /** Callback when selection changes */
  onChange: (type: ContentType) => void;
  /** Display variant */
  variant?: "chips" | "dropdown" | "tabs";
  /** Result counts per type (for tabs variant) */
  facets?: ContentTypeFacets;
  /** Whether to show result counts */
  showCounts?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the filter is disabled */
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Content Type Options
 * @constant
 */
export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  {
    /** Value */
    value: "all",
    /** Label */
    label: "All",
    /** Icon */
    icon: <Search className="w-4 h-4" />,
    /** Placeholder */
    placeholder: "Search everything...",
  },
  {
    /** Value */
    value: "products",
    /** Label */
    label: "Products",
    /** Icon */
    icon: <Package className="w-4 h-4" />,
    /** Placeholder */
    placeholder: "Search products...",
  },
  {
    /** Value */
    value: "auctions",
    /** Label */
    label: "Auctions",
    /** Icon */
    icon: <Gavel className="w-4 h-4" />,
    /** Placeholder */
    placeholder: "Search auctions...",
  },
  {
    /** Value */
    value: "shops",
    /** Label */
    label: "Shops",
    /** Icon */
    icon: <Store className="w-4 h-4" />,
    /** Placeholder */
    placeholder: "Search shops...",
  },
  {
    /** Value */
    value: "categories",
    /** Label */
    label: "Categories",
    /** Icon */
    icon: <FolderTree className="w-4 h-4" />,
    /** Placeholder */
    placeholder: "Search categories...",
  },
  {
    /** Value */
    value: "blog",
    /** Label */
    label: "Blog",
    /** Icon */
    icon: <FileText className="w-4 h-4" />,
    /** Placeholder */
    placeholder: "Search blog posts...",
  },
];

/**
 * Get placeholder text for a content type
 */
/**
 * Retrieves content type placeholder
 *
 * @param {ContentType} type - The type
 *
 * @returns {string} The contenttypeplaceholder result
 *
 * @example
 * getContentTypePlaceholder(type);
 */

/**
 * Retrieves content type placeholder
 *
 * @param {ContentType} type - The type
 *
 * @returns {string} The contenttypeplaceholder result
 *
 * @example
 * getContentTypePlaceholder(type);
 */

export function getContentTypePlaceholder(type: ContentType): string {
  /**
 * Performs option operation
 *
 * @param {any} (o - The (o
 *
 * @returns {any} The option result
 *
 */
const option = CONTENT_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.placeholder || "Search...";
}

/**
 * Get the total count from facets
 */
/**
 * Retrieves total count
 *
 * @param {ContentTypeFacets} [facets] - The facets
 *
 * @returns {number} The totalcount result
 */

/**
 * Retrieves total count
 *
 * @param {ContentTypeFacets} [facets] - The facets
 *
 * @returns {number} The totalcount result
 */

function getTotalCount(facets?: ContentTypeFacets): number {
  if (!facets) return 0;
  return (
    facets.products +
    facets.auctions +
    facets.shops +
    facets.categories +
    facets.blog
  );
}

// ============================================================================
// Chips Variant
// ============================================================================

/**
 * Function: Chips Variant
 */
/**
 * Performs chips variant operation
 *
 * @returns {any} The chipsvariant result
 */

/**
 * Performs chips variant operation
 *
 * @returns {any} The chipsvariant result
 */

function ChipsVariant({
  value,
  onChange,
  facets,
  showCounts,
  size,
  disabled,
}: ContentTypeFilterProps) {
  const sizeClasses = {
    /** Sm */
    sm: "px-2 py-1 text-xs gap-1",
    /** Md */
    md: "px-3 py-1.5 text-sm gap-1.5",
    /** Lg */
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    /** Sm */
    sm: "w-3 h-3",
    /** Md */
    md: "w-4 h-4",
    /** Lg */
    lg: "w-5 h-5",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const count =
          option.value === "all"
            ? getTotalCount(facets)
            : facets?.[option.value as keyof ContentTypeFacets];

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              inline-flex items-center rounded-full
              font-medium transition-all duration-200
              ${sizeClasses[size || "md"]}
              ${
                isSelected
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              /** Focus */
              focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
            aria-pressed={isSelected}
          >
            {React.cloneElement(option.icon as React.ReactElement, {
              /** Class Name */
              className: iconSizes[size || "md"],
            })}
            <span>{option.label}</span>
            {showCounts && count !== undefined && (
              <span
                className={`
                  ml-1 px-1.5 py-0.5 rounded-full text-xs
                  ${isSelected ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Dropdown Variant
// ============================================================================

/**
 * Function: Dropdown Variant
 */
/**
 * Performs dropdown variant operation
 *
 * @returns {any} The dropdownvariant result
 */

/**
 * Performs dropdown variant operation
 *
 * @returns {any} The dropdownvariant result
 */

function DropdownVariant({
  value,
  onChange,
  size,
  disabled,
  className,
}: ContentTypeFilterProps) {
  co/**
 * Performs selected option operation
 *
 * @param {any} (o - The (o
 *
 * @returns {any} The selectedoption result
 *
 */
nst [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption =
    CONTENT_TYPE_OPTIONS.find((o) => o.value === value) ||
    CONTENT_TYPE_OPTIONS[0];

  // Close on click outside
  React.useEffect(() => {
    /**
     * Handles click outside event
     *
     * @param {MouseEvent} event - The event
     *
     * @returns {any} The handleclickoutside result
     */

    /**
     * Handles click outside event
     *
     * @param {MouseEvent} event - The event
     *
     * @returns {any} The handleclickoutside result
     */

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sizeClasses = {
    /** Sm */
    sm: "px-2 py-1 text-xs",
    /** Md */
    md: "px-3 py-2 text-sm",
    /** Lg */
    lg: "px-4 py-2.5 text-base",
  };

  return (
    <div ref={dropdownRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          h-full w-full inline-flex items-center justify-between gap-2
          bg-transparent hover:bg-gray-100
          /** Dark */
          dark:hover:bg-gray-600
          ${sizeClasses[size || "md"]}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          /** Focus */
          focus:outline-none
          text-gray-700 dark:text-gray-300
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {selectedOption.icon}
          <span className="hidden sm:inline">{selectedOption.label}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${
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
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50
                     bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     rounded-lg shadow-lg min-w-[180px]
                     py-1"
          role="listbox"
        >
          {CONTENT_TYPE_OPTIONS.map((option) => {
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-left
                  /** Hover */
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 dark:text-gray-300"
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                {option.icon}
                <span>{option.label}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tabs Variant
// ============================================================================

/**
 * Function: Tabs Variant
 */
/**
 * Performs tabs variant operation
 *
 * @returns {any} The tabsvariant result
 */

/**
 * Performs tabs variant operation
 *
 * @returns {any} The tabsvariant result
 */

function TabsVariant({
  value,
  onChange,
  facets,
  showCounts,
  disabled,
}: ContentTypeFilterProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {CONTENT_TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const count =
          option.value === "all"
            ? getTotalCount(facets)
            : facets?.[option.value as keyof ContentTypeFacets];
        const isEmpty = count === 0 && option.value !== "all";

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && !isEmpty && onChange(option.value)}
            disabled={disabled || isEmpty}
            className={`
              flex items-center gap-2 px-4 py-3 whitespace-nowrap
              font-medium text-sm
              border-b-2 -mb-px transition-colors
              ${
                isSelected
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
              ${isEmpty ? "opacity-40 cursor-not-allowed" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              /** Focus */
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50
            `}
          >
            {option.icon}
            <span>{option.label}</span>
            {showCounts && count !== undefined && (
              <span
                className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${
                    isSelected
                      ? "bg-primary/10"
                      : "bg-gray-100 dark:bg-gray-700"
                  }
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Function: Content Type Filter
 */
/**
 * Performs content type filter operation
 *
 * @returns {any} The contenttypefilter result
 *
 * @example
 * ContentTypeFilter();
 */

/**
 * Performs content type filter operation
 *
 * @returns {any} The contenttypefilter result
 *
 * @example
 * ContentTypeFilter();
 */

export function ContentTypeFilter({
  value,
  onChange,
  variant = "chips",
  facets,
  showCounts = false,
  className = "",
  size = "md",
  disabled = false,
}: ContentTypeFilterProps) {
  const props: ContentTypeFilterProps = {
    value,
    onChange,
    variant,
    facets,
    showCounts,
    className,
    size,
    disabled,
  };

  return (
    <div className={className}>
      {variant === "chips" && <ChipsVariant {...props} />}
      {variant === "dropdown" && <DropdownVariant {...props} />}
      {variant === "tabs" && <TabsVariant {...props} />}
    </div>
  );
}

export default ContentTypeFilter;
