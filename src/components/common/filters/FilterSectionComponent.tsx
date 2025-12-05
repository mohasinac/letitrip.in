/**
 * @fileoverview React Component
 * @module src/components/common/filters/FilterSectionComponent
 * @description This file contains the FilterSectionComponent component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { FilterField } from "../FilterSidebar";

/**
 * FilterSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FilterSectionProps
 */
export interface FilterSectionProps {
  /** Title */
  title: string;
  /** Fields */
  fields: FilterField[];
  /** Collapsible */
  collapsible?: boolean;
  /** Default Collapsed */
  defaultCollapsed?: boolean;
  /** Highlighted */
  highlighted?: boolean;
  /** Pending Values */
  pendingValues: Record<string, any>;
  /** On Field Change */
  onFieldChange: (key: string, value: any) => void;
  /** Render Field */
  renderField: (
    /** Field */
    field: FilterField & { _highlighted?: boolean },
  ) => React.ReactNode;
  /** Highlight Text */
  highlightText: (text: string) => React.ReactNode;
}

/**
 * Function: Filter Section Component
 */
/**
 * Performs filter section component operation
 *
 * @returns {any} The filtersectioncomponent result
 *
 * @example
 * FilterSectionComponent();
 */

/**
 * Performs filter section component operation
 *
 * @returns {any} The filtersectioncomponent result
 *
 * @example
 * FilterSectionComponent();
 */

export function FilterSectionComponent({
  title,
  fields,
  collapsible = true,
  defaultCollapsed = false,
  highlighted = false,
  pendingValues,
  onFieldChange,
  renderField,
  highlightText,
}: FilterSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  /**
   * Performs toggle collapse operation
   *
   * @returns {any} The togglecollapse result
   */

  /**
   * Performs toggle collapse operation
   *
   * @returns {any} The togglecollapse result
   */

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
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
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
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
}
