/**
 * ContentTypeFilter Component
 *
 * Multi-variant filter for content types with icons, counts, and multiple display modes.
 * Framework-agnostic with injectable icons.
 *
 * @example
 * ```tsx
 * <ContentTypeFilter
 *   value="products"
 *   onChange={(type) => setContentType(type)}
 *   variant="chips"
 *   facets={{ products: 120, auctions: 45, shops: 23, categories: 12, blog: 8 }}
 *   showCounts
 * />
 * ```
 */

import React, { useEffect, useRef } from "react";

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

export interface ContentTypeIcons {
  all?: React.ComponentType<{ className?: string }>;
  products?: React.ComponentType<{ className?: string }>;
  auctions?: React.ComponentType<{ className?: string }>;
  shops?: React.ComponentType<{ className?: string }>;
  categories?: React.ComponentType<{ className?: string }>;
  blog?: React.ComponentType<{ className?: string }>;
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
  /** Custom icons for each content type (injectable) */
  customIcons?: ContentTypeIcons;
}

// ============================================================================
// Default Icons
// ============================================================================

const DefaultAllIcon = ({ className }: { className?: string }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const DefaultProductsIcon = ({ className }: { className?: string }) => (
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
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const DefaultAuctionsIcon = ({ className }: { className?: string }) => (
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
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
  </svg>
);

const DefaultShopsIcon = ({ className }: { className?: string }) => (
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
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const DefaultCategoriesIcon = ({ className }: { className?: string }) => (
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
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const DefaultBlogIcon = ({ className }: { className?: string }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get content type options with icons
 */
function getContentTypeOptions(
  customIcons?: ContentTypeIcons
): ContentTypeOption[] {
  const iconMap = {
    all: customIcons?.all || DefaultAllIcon,
    products: customIcons?.products || DefaultProductsIcon,
    auctions: customIcons?.auctions || DefaultAuctionsIcon,
    shops: customIcons?.shops || DefaultShopsIcon,
    categories: customIcons?.categories || DefaultCategoriesIcon,
    blog: customIcons?.blog || DefaultBlogIcon,
  };

  return [
    {
      value: "all",
      label: "All",
      icon: <iconMap.all className="w-4 h-4" />,
      placeholder: "Search everything...",
    },
    {
      value: "products",
      label: "Products",
      icon: <iconMap.products className="w-4 h-4" />,
      placeholder: "Search products...",
    },
    {
      value: "auctions",
      label: "Auctions",
      icon: <iconMap.auctions className="w-4 h-4" />,
      placeholder: "Search auctions...",
    },
    {
      value: "shops",
      label: "Shops",
      icon: <iconMap.shops className="w-4 h-4" />,
      placeholder: "Search shops...",
    },
    {
      value: "categories",
      label: "Categories",
      icon: <iconMap.categories className="w-4 h-4" />,
      placeholder: "Search categories...",
    },
    {
      value: "blog",
      label: "Blog",
      icon: <iconMap.blog className="w-4 h-4" />,
      placeholder: "Search blog posts...",
    },
  ];
}

/**
 * Get placeholder text for a content type
 */
export function getContentTypePlaceholder(
  type: ContentType,
  customIcons?: ContentTypeIcons
): string {
  const options = getContentTypeOptions(customIcons);
  const option = options.find((o) => o.value === type);
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
  customIcons,
}: ContentTypeFilterProps) {
  const options = getContentTypeOptions(customIcons);

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
      {options.map((option) => {
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
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
  customIcons,
}: ContentTypeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = getContentTypeOptions(customIcons);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  // Close on click outside
  useEffect(() => {
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
          {options.map((option) => {
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
                      ? "bg-blue-600/10 text-blue-600"
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
  customIcons,
}: ContentTypeFilterProps) {
  const options = getContentTypeOptions(customIcons);

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {options.map((option) => {
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
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
              ${isEmpty ? "opacity-40 cursor-not-allowed" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50
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
                      ? "bg-blue-600/10"
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
  customIcons,
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
    customIcons,
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
