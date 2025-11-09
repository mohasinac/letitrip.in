"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
  type: "checkbox" | "radio" | "range";
  searchable?: boolean;
}

interface CollapsibleFilterProps {
  sections: FilterSection[];
  activeFilters: Record<string, any>;
  onChange: (filterId: string, value: any) => void;
  onClear: (filterId?: string) => void;
}

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

  const toggleSection = (sectionId: string) => {
    setExpanded((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getActiveCount = (sectionId: string) => {
    const value = activeFilters[sectionId];
    if (Array.isArray(value)) return value.length;
    if (value) return 1;
    return 0;
  };

  const getTotalActiveCount = () => {
    return Object.values(activeFilters).reduce((acc, value) => {
      if (Array.isArray(value)) return acc + value.length;
      if (value) return acc + 1;
      return acc;
    }, 0);
  };

  const filterOptions = (section: FilterSection) => {
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
        <h3 className="text-lg font-semibold text-gray-900">
          Filters
          {getTotalActiveCount() > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {getTotalActiveCount()}
            </span>
          )}
        </h3>
        {getTotalActiveCount() > 0 && (
          <button
            onClick={() => onClear()}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
            className="rounded-lg border border-gray-200 bg-white"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {section.title}
                </span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
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
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 px-4 py-3">
                {/* Search Input */}
                {needsSearch && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Options */}
                <div
                  className="space-y-2"
                  style={{ maxHeight: 300, overflowY: "auto" }}
                >
                  {filteredOptions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
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
                              const current = activeFilters[section.id] || [];
                              const updated = e.target.checked
                                ? [...current, option.value]
                                : current.filter(
                                    (v: string) => v !== option.value,
                                  );
                              onChange(section.id, updated);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1 text-sm text-gray-700">
                          {option.label}
                        </span>
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-500">
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
