"use client";

import { useState } from "react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

interface FacetOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterFacetSectionProps {
  /** Section heading shown above the options */
  title: string;
  /** All available options in this facet */
  options: FacetOption[];
  /** Currently selected option values */
  selected: string[];
  /** Called with the full new selection array when a toggle happens */
  onChange: (selected: string[]) => void;
  /** Show a search box inside the section. Defaults to true. */
  searchable?: boolean;
  /** How many options to show initially before "Load more". Defaults to 10. */
  pageSize?: number;
  className?: string;
}

/**
 * FilterFacetSection
 *
 * A collapsible filter group with checkboxes, an optional inline search input,
 * and a "Load more" control. Designed to be composed inside FilterDrawer or
 * an inline filter panel.
 *
 * @example
 * ```tsx
 * <FilterFacetSection
 *   title="Category"
 *   options={categoryOptions}
 *   selected={selectedCategories}
 *   onChange={setSelectedCategories}
 * />
 * ```
 */
export function FilterFacetSection({
  title,
  options,
  selected,
  onChange,
  searchable = true,
  pageSize = 10,
  className = "",
}: FilterFacetSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { themed, borderRadius, spacing } = THEME_CONSTANTS;

  const filteredOptions = searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const visibleOptions = filteredOptions.slice(0, visibleCount);
  const hasMore = filteredOptions.length > visibleCount;

  const handleToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div
      role="group"
      aria-labelledby={`facet-${title}`}
      className={`${spacing.padding.md} border-b ${themed.border} last:border-b-0 ${className}`}
    >
      {/* Section header */}
      <button
        type="button"
        id={`facet-${title}`}
        onClick={() => setIsCollapsed((c) => !c)}
        className={`flex w-full items-center justify-between text-sm font-semibold ${themed.textPrimary} py-1 hover:opacity-80 transition-opacity`}
        aria-expanded={!isCollapsed}
      >
        <span className="flex items-center gap-2">
          {title}
          {selected.length > 0 && (
            <span
              className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
            >
              {selected.length}
            </span>
          )}
        </span>
        {/* Chevron icon */}
        <svg
          className={`w-4 h-4 ${themed.textSecondary} transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="mt-2 space-y-1">
          {/* Inline search */}
          {searchable && options.length > pageSize && (
            <div className="mb-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(pageSize);
                }}
                placeholder={UI_LABELS.FILTERS.SEARCH_IN(title)}
                className={`w-full text-xs ${THEME_CONSTANTS.input.base}`}
                aria-label={UI_LABELS.FILTERS.SEARCH_IN(title)}
              />
            </div>
          )}

          {/* Options */}
          {visibleOptions.length === 0 ? (
            <p className={`text-xs ${themed.textSecondary} py-1`}>
              {UI_LABELS.TABLE.NO_RESULTS}
            </p>
          ) : (
            visibleOptions.map((opt) => {
              const isChecked = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 cursor-pointer py-1 px-1 ${borderRadius.md} hover:${themed.bgSecondary} transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(opt.value)}
                    aria-checked={isChecked}
                    className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                  />
                  <span className={`flex-1 text-sm ${themed.textPrimary}`}>
                    {opt.label}
                  </span>
                  {opt.count !== undefined && (
                    <span
                      className={`text-xs ${themed.textSecondary} tabular-nums`}
                    >
                      {opt.count.toLocaleString()}
                    </span>
                  )}
                </label>
              );
            })
          )}

          {/* Load more */}
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + pageSize)}
              className={`mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline`}
            >
              {UI_LABELS.TABLE.LOAD_MORE}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
