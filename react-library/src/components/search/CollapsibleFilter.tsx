/**
 * CollapsibleFilter Component
 *
 * Collapsible filter sidebar with sections, search, and state persistence.
 * Framework-agnostic with injectable storage adapter.
 *
 * @example
 * ```tsx
 * const sections: FilterSection[] = [
 *   {
 *     id: 'category',
 *     title: 'Category',
 *     type: 'checkbox',
 *     options: [
 *       { label: 'Electronics', value: 'electronics', count: 150 },
 *       { label: 'Fashion', value: 'fashion', count: 200 }
 *     ],
 *     searchable: true
 *   }
 * ];
 *
 * <CollapsibleFilter
 *   sections={sections}
 *   activeFilters={{ category: ['electronics'] }}
 *   onFilterChange={(filters) => setFilters(filters)}
 * />
 * ```
 */

import { useEffect, useState } from "react";

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
  icon?: React.ReactNode;
}

export interface FilterSection {
  id: string;
  title: string;
  options: FilterOption[];
  type: "checkbox" | "radio" | "range";
  searchable?: boolean;
  defaultExpanded?: boolean;
}

export interface FilterStorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface CollapsibleFilterProps {
  /** Filter sections to display */
  sections: FilterSection[];
  /** Currently active filters */
  activeFilters: Record<string, any>;
  /** Callback when filters change */
  onFilterChange: (filters: Record<string, any>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show section counts */
  showCounts?: boolean;
  /** Search threshold (minimum options to show search) */
  searchThreshold?: number;
  /** Storage adapter for state persistence (optional) */
  storage?: FilterStorageAdapter;
  /** Storage key for expanded state */
  storageKey?: string;
  /** Custom Chevron Down icon */
  ChevronDownIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Chevron Right icon */
  ChevronRightIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Search icon */
  SearchIcon?: React.ComponentType<{ className?: string }>;
}

/** Default Chevron Down Icon */
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

/** Default Chevron Right Icon */
const DefaultChevronRightIcon = ({ className }: { className?: string }) => (
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
      d="M9 5l7 7-7 7"
    />
  </svg>
);

/** Default Search Icon */
const DefaultSearchIcon = ({ className }: { className?: string }) => (
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

export function CollapsibleFilter({
  sections,
  activeFilters,
  onFilterChange,
  className = "",
  showCounts = true,
  searchThreshold = 5,
  storage,
  storageKey = "filter-expanded-state",
  ChevronDownIcon = DefaultChevronDownIcon,
  ChevronRightIcon = DefaultChevronRightIcon,
  SearchIcon = DefaultSearchIcon,
}: CollapsibleFilterProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Try to load from storage if available
    if (storage) {
      try {
        const stored = storage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error("Failed to load expanded state:", error);
      }
    }

    // Default: expand all sections or use defaultExpanded
    const initialState: Record<string, boolean> = {};
    sections.forEach((section) => {
      initialState[section.id] =
        section.defaultExpanded !== undefined ? section.defaultExpanded : true;
    });
    return initialState;
  });

  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Save expanded state to storage when it changes
  useEffect(() => {
    if (storage) {
      try {
        storage.setItem(storageKey, JSON.stringify(expanded));
      } catch (error) {
        console.error("Failed to save expanded state:", error);
      }
    }
  }, [expanded, storage, storageKey]);

  const toggleSection = (sectionId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    sections.forEach((section) => {
      allExpanded[section.id] = true;
    });
    setExpanded(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    sections.forEach((section) => {
      allCollapsed[section.id] = false;
    });
    setExpanded(allCollapsed);
  };

  const getActiveCount = (sectionId: string): number => {
    const value = activeFilters[sectionId];
    if (!value) return 0;
    if (Array.isArray(value)) return value.length;
    return 1;
  };

  const getTotalActiveCount = (): number => {
    return sections.reduce((total, section) => {
      return total + getActiveCount(section.id);
    }, 0);
  };

  const handleCheckboxChange = (
    sectionId: string,
    optionValue: string | number,
    checked: boolean,
  ) => {
    const currentValues = activeFilters[sectionId] || [];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v: any) => v !== optionValue);

    onFilterChange({
      ...activeFilters,
      [sectionId]: newValues,
    });
  };

  const handleRadioChange = (
    sectionId: string,
    optionValue: string | number,
  ) => {
    onFilterChange({
      ...activeFilters,
      [sectionId]: optionValue,
    });
  };

  const clearSection = (sectionId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[sectionId];
    onFilterChange(newFilters);
  };

  const clearAll = () => {
    onFilterChange({});
  };

  const filterOptions = (
    options: FilterOption[],
    sectionId: string,
  ): FilterOption[] => {
    const searchTerm = searchTerms[sectionId];
    if (!searchTerm) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const totalActive = getTotalActiveCount();

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filters
            {showCounts && totalActive > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                {totalActive}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Expand All
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Collapse All
            </button>
          </div>
        </div>

        {totalActive > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map((section) => {
          const isExpanded = expanded[section.id];
          const activeCount = getActiveCount(section.id);
          const filteredOptions = filterOptions(section.options, section.id);

          return (
            <div key={section.id} className="px-4 py-3">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {section.title}
                  </span>
                  {showCounts && activeCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                      {activeCount}
                    </span>
                  )}
                </div>

                {activeCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSection(section.id);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Clear
                  </button>
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {/* Search Input */}
                  {section.searchable &&
                    section.options.length >= searchThreshold && (
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerms[section.id] || ""}
                          onChange={(e) =>
                            setSearchTerms({
                              ...searchTerms,
                              [section.id]: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                    )}

                  {/* Options */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          {section.type === "checkbox" && (
                            <input
                              type="checkbox"
                              checked={(
                                activeFilters[section.id] || []
                              ).includes(option.value)}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  section.id,
                                  option.value,
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          )}

                          {section.type === "radio" && (
                            <input
                              type="radio"
                              name={section.id}
                              checked={
                                activeFilters[section.id] === option.value
                              }
                              onChange={() =>
                                handleRadioChange(section.id, option.value)
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                          )}

                          {option.icon && (
                            <span className="w-5 h-5">{option.icon}</span>
                          )}

                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {option.label}
                          </span>

                          {showCounts && option.count !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {option.count}
                            </span>
                          )}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No options found
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CollapsibleFilter;
