/**
 * @fileoverview React Component
 * @module src/components/common/CollapsibleFilter
 * @description This file contains the CollapsibleFilter component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FilterOption interface
 * 
 * @interface
 * @description Defines the structure and contract for FilterOption
 */
interface FilterOption {
  /** Label */
  label: string;
  /** Value */
  value: string;
  /** Count */
  count?: number;
}

/**
 * FilterSection interface
 * 
 * @interface
 * @description Defines the structure and contract for FilterSection
 */
interface FilterSection {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Options */
  options: FilterOption[];
  /** Type */
  type: "checkbox" | "radio" | "range";
  /** Searchable */
  searchable?: boolean;
}

/**
 * CollapsibleFilterProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CollapsibleFilterProps
 */
interface CollapsibleFilterProps {
  /** Sections */
  sections: FilterSection[];
  /** Active Filters */
  activeFilters: Record<string, any>;
  /** On Change */
  onChange: (filterId: string, value: any) => void;
  /** On Clear */
  onClear: (filterId?: string) => void;
}

/**
 * Function: Collapsible Filter
 */
/**
 * Performs collapsible filter operation
 *
 * @returns {any} The collapsiblefilter result
 *
 * @example
 * CollapsibleFilter();
 */

/**
 * Performs collapsible filter operation
 *
 * @returns {any} The collapsiblefilter result
 *
 * @example
 * CollapsibleFilter();
 */

export function CollapsibleFilter({
  sections,
  activeFilters,
  onChange,
  onClear,
}: CollapsibleFilterProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    // First 3 sections expanded by default
    [sections[0]?.id]: true,
    [sections[1]?.id]: true,
    [sections[2]?.id]: true,
  });
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {},
  );

  /**
   * Performs toggle section operation
   *
   * @param {string} sectionId - section identifier
   *
   * @returns {string} The togglesection result
   */

  /**
   * Performs toggle section operation
   *
   * @param {string} sectionId - section identifier
   *
   * @returns {string} The togglesection result
   */

  const toggleSection = (sectionId: string) => {
    setExpanded((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  /**
   * Retrieves active count
   *
   * @param {string} sectionId - section identifier
   *
   * @returns {string} The activecount result
   */

  /**
   * Retrieves active count
   *
   * @param {string} sectionId - section identifier
   *
   * @returns {string} The activecount result
   */

  const getActiveCount = (sectionId: string) => {
    const value = activeFilters[sectionId];
    if (Array.isArray(value)) return value.length;
    if (value) return 1;
    return 0;
  };

  /**
   * Retrieves total active count
   *
   * @returns {any} The totalactivecount result
   */

  /**
   * Retrieves total active count
   *
   * @returns {any} The totalactivecount result
   */

  const getTotalActiveCount = () => {
    return Object.values(activeFilters).reduce((acc, value) => {
      if (Array.isArray(value)) return acc + value.length;
      if (value) return acc + 1;
      return acc;
    }, 0);
  };

  /**
   * Filters options
   *
   * @param {FilterSection} section - The section
   *
   * @returns {any} The filteroptions result
   */

  /**
   * Filters options
   *
   * @param {FilterSection} section - The section
   *
   * @returns {any} The filteroptions result
   */

  const filterOptions = (section: FilterSection) => {
    /**
 * Performs query operation
 *
 * @returns {any} The query result
 *
 */
const query = searchQueries[section.id]?.toLowerCase() || "";
    if (!query) return section.options;
    return section.options.filter((opt) =>
      opt.label.toLowerCase().includes(query),
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
          {getTotalActiveCount() > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              {getTotalActiveCount()}
            </span>
          )}
        </h3>
        {getTotalActiveCount() > 0 && (
          <button
            onClick={() => onClear()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Sections */}
      {sections.map((section) => {
        const isExpanded = expanded[section.id];
        const activeCount = getActiveCount(section.id);
        const filteredOptions = filterOptions(section);
        const needsSearch = section.searchable && section.options.length > 200;

        return (
          <div
            key={section.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {section.title}
                </span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear(section.id);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Clear
                  </button>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                {/* Search Input */}
                {needsSearch && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="search"
                      placeholder={`Search ${section.title.toLowerCase()}...`}
                      value={searchQueries[section.id] || ""}
                      onChange={(e) =>
                        setSearchQueries((prev) => ({
                          ...prev,
                          [section.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Options */}
                <div
                  className="space-y-2"
                  style={{ maxHeight: 300, overflowY: "auto" }}
                >
                  {filteredOptions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results found
                    </p>
                  ) : (
                    filteredOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type={section.type === "radio" ? "radio" : "checkbox"}
                          checked={
                            section.type === "radio"
                              ? activeFilters[section.id] === option.value
                              : activeFilters[section.id]?.includes(
                                  option.value,
                                )
                          }
                          onChange={(e) => {
                            if (section.type === "radio") {
                              onChange(section.id, option.value);
                            } else {
                              con/**
 * Updates d
 *
 * @param {string} (v - The (v
 *
 * @returns {any} The updated result
 *
 */
st current = activeFilters[section.id] || [];
                              const updated = e.target.checked
                                ? [...current, option.value]
                                : current.filter(
                                    (v: string) => v !== option.value,
                                  );
                              onChange(section.id, updated);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
