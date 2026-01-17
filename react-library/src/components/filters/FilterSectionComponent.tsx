"use client";

/**
 * FilterSectionComponent
 *
 * Renders a collapsible filter section with title and fields.
 * Used internally by UnifiedFilterSidebar for rendering each section.
 *
 * @example
 * ```tsx
 * <FilterSectionComponent
 *   title="Price"
 *   fields={priceFields}
 *   collapsible={true}
 *   pendingValues={values}
 *   onFieldChange={handleChange}
 *   renderField={renderFieldComponent}
 *   highlightText={highlightFunction}
 * />
 * ```
 */

import { useState } from "react";
import { FilterField } from "./FilterSidebar";

export interface FilterSectionProps {
  /** Section title */
  title: string;
  /** Filter fields in this section */
  fields: FilterField[];
  /** Whether section can be collapsed */
  collapsible?: boolean;
  /** Whether section starts collapsed */
  defaultCollapsed?: boolean;
  /** Whether section is highlighted (search result) */
  highlighted?: boolean;
  /** Current pending values */
  pendingValues: Record<string, any>;
  /** Callback when field value changes */
  onFieldChange: (key: string, value: any) => void;
  /** Function to render a field */
  renderField: (
    field: FilterField & { _highlighted?: boolean }
  ) => React.ReactNode;
  /** Function to highlight text (for search) */
  highlightText: (text: string) => React.ReactNode;
  /** External collapsed state (for centralized control) */
  externalCollapsedState?: Record<string, boolean>;
  /** Callback when collapse state changes */
  onCollapseChange?: (title: string, collapsed: boolean) => void;
  /** Custom chevron icon (injectable) */
  ChevronDownIcon?: React.ComponentType<{ className?: string }>;
}

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

export const FilterSectionComponent: React.FC<FilterSectionProps> = ({
  title,
  fields,
  collapsible = true,
  defaultCollapsed = false,
  highlighted = false,
  pendingValues,
  onFieldChange,
  renderField,
  highlightText,
  externalCollapsedState,
  onCollapseChange,
  ChevronDownIcon = DefaultChevronDownIcon,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  // Use external state if provided, otherwise use internal state
  const isCollapsed =
    externalCollapsedState !== undefined
      ? externalCollapsedState[title] ?? defaultCollapsed
      : internalCollapsed;

  const toggleCollapse = () => {
    if (collapsible) {
      const newState = !isCollapsed;
      if (onCollapseChange) {
        onCollapseChange(title, newState);
      } else {
        setInternalCollapsed(newState);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <button
        onClick={toggleCollapse}
        className={`flex items-center justify-between w-full text-left ${
          collapsible ? "cursor-pointer" : "cursor-default"
        }`}
        type="button"
      >
        <h3
          className={`text-sm font-semibold text-gray-900 dark:text-white ${
            highlighted ? "text-blue-600 dark:text-blue-400" : ""
          }`}
        >
          {highlightText(title)}
        </h3>
        {collapsible && (
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
          {fields.map((field: any) => (
            <div key={field.key} className="space-y-1">
              <label
                className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${
                  field._highlighted ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {field.icon && (
                  <span className="text-gray-400 dark:text-gray-500">
                    {field.icon}
                  </span>
                )}
                {highlightText(field.label)}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSectionComponent;
