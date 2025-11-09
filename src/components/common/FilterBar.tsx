"use client";

import { ReactNode } from "react";

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface QuickFilter {
  key: string;
  label: string;
  type: "select" | "checkbox" | "radio";
  options: FilterOption[];
  defaultValue?: string | number | boolean;
}

export interface FilterBarProps {
  filters: QuickFilter[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset?: () => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
  resultCount?: number;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  showAdvanced = false,
  onToggleAdvanced,
  className = "",
  resultCount,
}: FilterBarProps) {
  const handleCheckboxChange = (
    key: string,
    optionValue: string | number,
    checked: boolean,
  ) => {
    const currentValues = values[key] || [];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v: any) => v !== optionValue);
    onChange(key, newValues);
  };

  const hasActiveFilters = Object.values(values).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  });

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium text-gray-900">Quick Filters</h3>
            {resultCount !== undefined && (
              <span className="text-sm text-gray-500">
                {resultCount} result{resultCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && onReset && (
              <button
                onClick={onReset}
                className="text-sm text-blue-600 hover:text-blue-700:text-blue-300"
              >
                Reset All
              </button>
            )}

            {onToggleAdvanced && (
              <button
                onClick={onToggleAdvanced}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {filter.label}:
              </label>

              {filter.type === "select" && (
                <select
                  value={values[filter.key] || ""}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">All</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                      {option.count !== undefined && ` (${option.count})`}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === "radio" && (
                <div className="flex items-center gap-2">
                  {filter.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={filter.key}
                        value={option.value}
                        checked={values[filter.key] === option.value}
                        onChange={(e) => onChange(filter.key, e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                        {option.count !== undefined && ` (${option.count})`}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {filter.type === "checkbox" && (
                <div className="flex items-center gap-2">
                  {filter.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(values[filter.key] || []).includes(
                          option.value,
                        )}
                        onChange={(e) =>
                          handleCheckboxChange(
                            filter.key,
                            option.value,
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                        {option.count !== undefined && ` (${option.count})`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Active:</span>
            {Object.entries(values).map(([key, value]) => {
              const filter = filters.find((f) => f.key === key);
              if (
                !filter ||
                !value ||
                (Array.isArray(value) && value.length === 0)
              ) {
                return null;
              }

              const getLabel = (val: any) => {
                const option = filter.options.find((o) => o.value === val);
                return option?.label || val;
              };

              if (Array.isArray(value)) {
                return value.map((val) => (
                  <span
                    key={`${key}-${val}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100/20 text-blue-800 rounded-full"
                  >
                    {filter.label}: {getLabel(val)}
                    <button
                      onClick={() => {
                        const newValues = value.filter((v: any) => v !== val);
                        onChange(key, newValues);
                      }}
                      className="hover:text-blue-900:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ));
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100/20 text-blue-800 rounded-full"
                >
                  {filter.label}: {getLabel(value)}
                  <button
                    onClick={() => onChange(key, "")}
                    className="hover:text-blue-900:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
