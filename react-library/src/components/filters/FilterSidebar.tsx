"use client";

/**
 * FilterSidebar Component
 *
 * Flexible, configurable filter sidebar with support for multiple field types.
 * Supports collapsible sections, mobile overlay, result count, and various input types.
 * Framework-agnostic with no external dependencies.
 *
 * @example
 * ```tsx
 * const sections = [
 *   {
 *     title: "Price",
 *     fields: [
 *       { key: "priceRange", label: "Price Range", type: "range", min: 0, max: 10000 }
 *     ]
 *   }
 * ];
 *
 * <FilterSidebar
 *   sections={sections}
 *   values={filterValues}
 *   onChange={handleFilterChange}
 *   onApply={handleApply}
 *   onReset={handleReset}
 *   isOpen={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   resultCount={products.length}
 * />
 * ```
 */

import { ReactNode, useEffect, useState } from "react";

export interface FilterField {
  /** Unique key for the filter field */
  key: string;
  /** Display label */
  label: string;
  /** Field input type */
  type:
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "checkbox"
    | "radio"
    | "date"
    | "daterange"
    | "range";
  /** Options for select/multiselect/checkbox/radio fields */
  options?: { label: string; value: string | number; count?: number }[];
  /** Placeholder text */
  placeholder?: string;
  /** Minimum value (for number/range fields) */
  min?: number;
  /** Maximum value (for number/range fields) */
  max?: number;
  /** Step value (for number/range fields) */
  step?: number;
  /** Optional icon */
  icon?: ReactNode;
}

export interface FilterSidebarSection {
  /** Section title */
  title: string;
  /** Filter fields in this section */
  fields: FilterField[];
  /** Whether section can be collapsed */
  collapsible?: boolean;
  /** Whether section starts collapsed */
  defaultCollapsed?: boolean;
}

export interface FilterSidebarProps {
  /** Filter sections to display */
  sections: FilterSidebarSection[];
  /** Current filter values */
  values: Record<string, any>;
  /** Callback when a filter value changes */
  onChange: (key: string, value: any) => void;
  /** Callback when Apply button is clicked */
  onApply: () => void;
  /** Callback when Reset button is clicked */
  onReset: () => void;
  /** Whether sidebar is open (for mobile) */
  isOpen: boolean;
  /** Callback when sidebar should close */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Result count to display */
  resultCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Custom close icon (injectable) */
  CloseIcon?: React.ComponentType<{ className?: string }>;
  /** Custom chevron down icon (injectable) */
  ChevronDownIcon?: React.ComponentType<{ className?: string }>;
}

/** Default Close Icon */
const DefaultCloseIcon = ({ className }: { className?: string }) => (
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

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  sections,
  values,
  onChange,
  onApply,
  onReset,
  isOpen,
  onClose,
  className = "",
  resultCount,
  isLoading = false,
  CloseIcon = DefaultCloseIcon,
  ChevronDownIcon = DefaultChevronDownIcon,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Initialize collapsed sections
    const initialCollapsed = new Set<string>();
    sections.forEach((section) => {
      if (section.defaultCollapsed) {
        initialCollapsed.add(section.title);
      }
    });
    setCollapsedSections(initialCollapsed);
  }, [sections]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const hasActiveFilters = Object.values(values).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null)
      return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== "";
  });

  const handleCheckboxChange = (
    key: string,
    optionValue: string | number,
    checked: boolean
  ) => {
    const currentValues = values[key] || [];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v: any) => v !== optionValue);
    onChange(key, newValues);
  };

  const renderField = (field: FilterField) => {
    const value = values[field.key];

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
        );

      case "multiselect":
      case "checkbox":
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      field.key,
                      option.value,
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded"
              >
                <input
                  type="radio"
                  name={field.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        );

      case "daterange":
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={value?.from || ""}
              onChange={(e) =>
                onChange(field.key, { ...value, from: e.target.value })
              }
              placeholder="From"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={value?.to || ""}
              onChange={(e) =>
                onChange(field.key, { ...value, to: e.target.value })
              }
              placeholder="To"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        );

      case "range":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value?.min || ""}
                onChange={(e) =>
                  onChange(field.key, { ...value, min: e.target.value })
                }
                placeholder="Min"
                min={field.min}
                max={field.max}
                step={field.step}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input
                type="number"
                value={value?.max || ""}
                onChange={(e) =>
                  onChange(field.key, { ...value, max: e.target.value })
                }
                placeholder="Max"
                min={field.min}
                max={field.max}
                step={field.step}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose?.()}
          role="button"
          tabIndex={-1}
          aria-label="Close filters"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${className}`}
        style={{ top: "80px", height: "calc(100vh - 80px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            {resultCount !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {resultCount} result{resultCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              type="button"
            >
              <CloseIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((section) => {
            const isCollapsed = collapsedSections.has(section.title);

            return (
              <div key={section.title} className="space-y-3">
                {/* Section Header */}
                <button
                  onClick={() =>
                    section.collapsible && toggleSection(section.title)
                  }
                  className={`flex items-center justify-between w-full text-left ${
                    section.collapsible ? "cursor-pointer" : "cursor-default"
                  }`}
                  type="button"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  {section.collapsible && (
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                        isCollapsed ? "" : "rotate-180"
                      }`}
                    />
                  )}
                </button>

                {/* Section Fields */}
                {!isCollapsed && (
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.icon && (
                            <span className="text-gray-400 dark:text-gray-500">
                              {field.icon}
                            </span>
                          )}
                          {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={onApply}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium dark:bg-blue-500 dark:hover:bg-blue-600"
            type="button"
          >
            {isLoading ? "Applying..." : "Apply Filters"}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Reset All
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
