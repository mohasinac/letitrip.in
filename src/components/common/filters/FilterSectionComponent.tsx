"use client";

import { useState } from "react";
import { FilterField } from "../FilterSidebar";

export interface FilterSectionProps {
  title: string;
  fields: FilterField[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  highlighted?: boolean;
  pendingValues: Record<string, any>;
  onFieldChange: (key: string, value: any) => void;
  renderField: (
    field: FilterField & { _highlighted?: boolean },
  ) => React.ReactNode;
  highlightText: (text: string) => React.ReactNode;
}

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
