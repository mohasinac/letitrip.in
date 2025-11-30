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

export type ContentType =
  | "all"
  | "products"
  | "auctions"
  | "shops"
  | "categories"
  | "blog";

export interface ContentTypeOption {
  value: ContentType;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
}

export interface ContentTypeFacets {
  products: number;
  auctions: number;
  shops: number;
  categories: number;
  blog: number;
}

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

export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  {
    value: "all",
    label: "All",
    icon: <Search className="w-4 h-4" />,
    placeholder: "Search everything...",
  },
  {
    value: "products",
    label: "Products",
    icon: <Package className="w-4 h-4" />,
    placeholder: "Search products...",
  },
  {
    value: "auctions",
    label: "Auctions",
    icon: <Gavel className="w-4 h-4" />,
    placeholder: "Search auctions...",
  },
  {
    value: "shops",
    label: "Shops",
    icon: <Store className="w-4 h-4" />,
    placeholder: "Search shops...",
  },
  {
    value: "categories",
    label: "Categories",
    icon: <FolderTree className="w-4 h-4" />,
    placeholder: "Search categories...",
  },
  {
    value: "blog",
    label: "Blog",
    icon: <FileText className="w-4 h-4" />,
    placeholder: "Search blog posts...",
  },
];

/**
 * Get placeholder text for a content type
 */
export function getContentTypePlaceholder(type: ContentType): string {
  const option = CONTENT_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.placeholder || "Search...";
}

/**
 * Get the total count from facets
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

function ChipsVariant({
  value,
  onChange,
  facets,
  showCounts,
  size,
  disabled,
}: ContentTypeFilterProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
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
              focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
            aria-pressed={isSelected}
          >
            {React.cloneElement(option.icon as React.ReactElement, {
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

function DropdownVariant({
  value,
  onChange,
  size,
  disabled,
  className,
}: ContentTypeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption =
    CONTENT_TYPE_OPTIONS.find((o) => o.value === value) ||
    CONTENT_TYPE_OPTIONS[0];

  // Close on click outside
  React.useEffect(() => {
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
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
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
          dark:hover:bg-gray-600
          ${sizeClasses[size || "md"]}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
