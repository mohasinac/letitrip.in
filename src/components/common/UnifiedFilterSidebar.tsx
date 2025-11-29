"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search } from "lucide-react";
import { FilterSection, FilterField } from "./FilterSidebar";

export interface UnifiedFilterSidebarProps {
  sections: FilterSection[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onApply: () => void;
  onReset: () => void;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  resultCount?: number;
  isLoading?: boolean;
  searchable?: boolean; // Enable option search
  mobile?: boolean; // Force mobile mode
}

export function UnifiedFilterSidebar({
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
  searchable = true,
  mobile = false,
}: UnifiedFilterSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const initialCollapsed = new Set<string>();
    sections.forEach((section) => {
      if (section.defaultCollapsed) {
        initialCollapsed.add(section.title);
      }
    });
    setCollapsedSections(initialCollapsed);
  }, [sections]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen && mobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, mobile]);

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

  // Filter sections and options based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim() || !searchable) return sections;

    const query = searchQuery.toLowerCase();

    return sections
      .map((section) => {
        // Check if section title matches
        const sectionMatches = section.title.toLowerCase().includes(query);

        // Filter fields and options
        const filteredFields = section.fields
          .map((field) => {
            const fieldMatches = field.label.toLowerCase().includes(query);

            // For fields with options, filter options
            if (field.options) {
              const filteredOptions = field.options.filter((option) =>
                option.label.toLowerCase().includes(query)
              );

              if (filteredOptions.length > 0) {
                return {
                  ...field,
                  options: filteredOptions,
                  _highlighted: true,
                };
              }
            }

            // Include field if it matches or section matches
            if (fieldMatches || sectionMatches) {
              return { ...field, _highlighted: fieldMatches };
            }

            return null;
          })
          .filter(Boolean) as FilterField[];

        if (filteredFields.length > 0) {
          return {
            ...section,
            fields: filteredFields,
            _highlighted: sectionMatches,
          };
        }

        return null;
      })
      .filter(Boolean) as FilterSection[];
  }, [sections, searchQuery, searchable]);

  // Auto-expand sections with matches
  useEffect(() => {
    if (searchQuery && searchable) {
      const newCollapsed = new Set<string>();
      sections.forEach((section) => {
        const hasMatch = filteredSections.some(
          (fs) => fs.title === section.title
        );
        if (!hasMatch) {
          newCollapsed.add(section.title);
        }
      });
      setCollapsedSections(newCollapsed);
    }
  }, [searchQuery, filteredSections, sections, searchable]);

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

  const highlightText = (text: string) => {
    if (!searchQuery || !searchable) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white font-medium px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderField = (field: FilterField & { _highlighted?: boolean }) => {
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
                  {highlightText(option.label)}
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
                  {highlightText(option.label)}
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
      {isOpen && mobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        data-testid="filter-sidebar"
        className={`${
          mobile
            ? "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300"
            : "sticky top-20 h-[calc(100vh-5rem)]"
        } ${
          mobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}
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
          {mobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Close filters"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Box */}
        {searchable && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search filters..."
                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredSections.length === 0 && searchQuery ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No filters match "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredSections.map((section: any) => {
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
                  >
                    <h3
                      className={`text-sm font-semibold text-gray-900 dark:text-white ${
                        section._highlighted
                          ? "text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {highlightText(section.title)}
                    </h3>
                    {section.collapsible && (
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
                      {section.fields.map((field: any) => (
                        <div key={field.key} className="space-y-1">
                          <label
                            className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${
                              field._highlighted
                                ? "text-blue-600 dark:text-blue-400"
                                : ""
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
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => {
              onApply();
              if (mobile) onClose?.();
            }}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? "Applying..." : "Apply Filters"}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      </div>
    </>
  );
}
