"use client";

import React, { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/utils";
import { Button, Checkbox, Input, Span, Text, Tooltip } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

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
  /** Whether the section starts collapsed. Defaults to false. */
  defaultCollapsed?: boolean;
  /**
   * Whether the section starts open. Convenience inverse of `defaultCollapsed`.
   * When both are provided, `defaultCollapsed` takes precedence.
   * Defaults to true.
   */
  defaultOpen?: boolean;
  /**
   * Cap how many values can be selected at once.
   * Unselected options become disabled when the limit is reached.
   * Ignored when selectionMode is 'single'. Default: unlimited.
   */
  maxSelections?: number;
  /**
   * Show a "Select all" / "Deselect all" toggle above the options list.
   * Ignored when selectionMode is 'single'. Default: false.
   */
  showSelectAll?: boolean;
  /**
   * 'multi' (default): checkbox style — multiple values can be selected.
   * 'single': radio style — only one value can be selected at a time.
   */
  selectionMode?: "multi" | "single";
  className?: string;
  /** Controlled open state — overrides defaultCollapsed/defaultOpen when provided */
  isOpen?: boolean;
  /** Called when the header toggle is clicked (for controlled accordion mode) */
  onToggle?: () => void;
  /** Called when the section clear (×) button is clicked */
  onClear?: () => void;
}

/**
 * FilterFacetSection
 *
 * A collapsible filter group with checkboxes (multi) or radios (single),
 * an optional inline search input, optional "Select all / Deselect all",
 * and a "Load more" control. Designed to be composed inside FilterDrawer
 * or an inline filter panel.
 *
 * @example
 * ```tsx
 * <FilterFacetSection
 *   title="Category"
 *   options={categoryOptions}
 *   selected={selectedCategories}
 *   onChange={setSelectedCategories}
 *   showSelectAll
 *   maxSelections={5}
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
  defaultCollapsed,
  defaultOpen = true,
  maxSelections,
  showSelectAll = false,
  selectionMode = "multi",
  className = "",
  isOpen: controlledOpen,
  onToggle,
  onClear,
}: FilterFacetSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const isControlled = controlledOpen !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(
    defaultCollapsed ?? !defaultOpen,
  );
  const isCollapsed = isControlled ? !controlledOpen : internalCollapsed;
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed((c) => !c);
  };

  const groupId = useId();
  const { themed, spacing, flex } = THEME_CONSTANTS;
  const t = useTranslations("filters");
  const tTable = useTranslations("table");

  const filteredOptions = searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const visibleOptions = filteredOptions.slice(0, visibleCount);
  const hasMore = filteredOptions.length > visibleCount;

  // Multi-select: toggle a value in/out of selected[]
  const handleMultiToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (maxSelections !== undefined && selected.length >= maxSelections)
        return;
      onChange([...selected, value]);
    }
  };

  // Single-select: replace entire selection with [value]
  const handleSingleSelect = (value: string) => {
    onChange([value]);
  };

  // Select all / Deselect all acts on visible (filtered) options
  const allVisibleSelected = visibleOptions.every((o) =>
    selected.includes(o.value),
  );
  const handleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleValues = new Set(visibleOptions.map((o) => o.value));
      onChange(selected.filter((v) => !visibleValues.has(v)));
    } else {
      const visibleValues = visibleOptions.map((o) => o.value);
      const merged = Array.from(new Set([...selected, ...visibleValues]));
      onChange(merged);
    }
  };

  /** ↑/↓ keyboard navigation between inputs */
  const handleOptionsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const inputType =
      selectionMode === "single"
        ? 'input[type="radio"]'
        : 'input[type="checkbox"]';
    const inputs = Array.from(
      e.currentTarget.querySelectorAll<HTMLInputElement>(inputType),
    );
    const idx = inputs.indexOf(document.activeElement as HTMLInputElement);
    if (idx === -1) return;
    e.preventDefault();
    if (e.key === "ArrowDown") {
      inputs[(idx + 1) % inputs.length].focus();
    } else {
      inputs[(idx - 1 + inputs.length) % inputs.length].focus();
    }
  };

  const limitReached =
    selectionMode === "multi" &&
    maxSelections !== undefined &&
    selected.length >= maxSelections;

  return (
    <div
      role="group"
      aria-labelledby={`facet-${groupId}`}
      className={`p-4 border-b ${themed.border} last:border-b-0 ${className}`}
    >
      {/* Section header */}
      <Button
        type="button"
        variant="ghost"
        id={`facet-${groupId}`}
        onClick={handleToggle}
        className={`flex w-full items-center justify-between text-sm font-semibold ${themed.textPrimary} py-1 hover:opacity-80 transition-opacity`}
        aria-expanded={!isCollapsed}
      >
        <Span className="flex items-center gap-2">
          {title}
          {selected.length > 0 && (
            <Span
              className={`inline-${flex.center} w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
            >
              {selected.length}
            </Span>
          )}
          {onClear && selected.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="inline-flex items-center justify-center w-5 h-5 p-0 min-w-0 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors rounded-full"
              aria-label={t("clearSection")}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          )}
        </Span>
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
      </Button>

      {!isCollapsed && (
        <div className="mt-2 space-y-1" onKeyDown={handleOptionsKeyDown}>
          {/* Inline search */}
          {searchable && options.length > pageSize && (
            <div className="mb-2">
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(pageSize);
                }}
                placeholder={t("searchIn", { section: title })}
                className="w-full text-xs"
                aria-label={t("searchIn", { section: title })}
              />
            </div>
          )}

          {/* Select all / Deselect all — multi mode only */}
          {showSelectAll &&
            selectionMode === "multi" &&
            visibleOptions.length > 0 && (
              <div className={`mb-1 ${flex.between}`}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSelectAll}
                  className="text-xs text-primary hover:underline p-0 h-auto"
                >
                  {allVisibleSelected ? t("deselectAll") : t("selectAll")}
                </Button>
                {selected.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onChange([])}
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline p-0 h-auto"
                  >
                    {t("clearSection")}
                  </Button>
                )}
              </div>
            )}

          {/* Options */}
          {visibleOptions.length === 0 ? (
            <Text size="xs" variant="secondary" className="py-1">
              {tTable("noResults")}
            </Text>
          ) : selectionMode === "single" ? (
            // Single-select: native radio inputs
            <div className="space-y-1">
              {visibleOptions.map((opt) => {
                const isChecked = selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer py-0.5 ${themed.textPrimary}`}
                  >
                    <input
                      type="radio"
                      name={`facet-radio-${groupId}`}
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => handleSingleSelect(opt.value)}
                      className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                    />
                    <Span className="text-sm flex-1">{opt.label}</Span>
                    {opt.count !== undefined && (
                      <Span
                        className={`text-xs ${themed.textSecondary} tabular-nums`}
                      >
                        {formatNumber(opt.count)}
                      </Span>
                    )}
                  </label>
                );
              })}
            </div>
          ) : (
            // Multi-select: checkboxes
            visibleOptions.map((opt) => {
              const isChecked = selected.includes(opt.value);
              const isDisabled = limitReached && !isChecked;
              const checkbox = (
                <Checkbox
                  key={opt.value}
                  checked={isChecked}
                  onChange={() => handleMultiToggle(opt.value)}
                  disabled={isDisabled}
                  aria-checked={isChecked}
                  aria-disabled={isDisabled}
                  className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                  label={opt.label}
                  suffix={
                    opt.count !== undefined ? (
                      <Span
                        className={`text-xs ${themed.textSecondary} tabular-nums`}
                      >
                        {formatNumber(opt.count)}
                      </Span>
                    ) : undefined
                  }
                />
              );
              if (isDisabled && maxSelections !== undefined) {
                return (
                  <Tooltip
                    key={opt.value}
                    content={t("maxSelectionsReached", { max: maxSelections })}
                  >
                    <div aria-disabled="true">{checkbox}</div>
                  </Tooltip>
                );
              }
              return checkbox;
            })
          )}

          {/* Load more */}
          {hasMore && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setVisibleCount((c) => c + pageSize)}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              {t("showMore", { count: filteredOptions.length - visibleCount })}
            </Button>
          )}
          {/* Show less — only when more than one page is loaded */}
          {visibleCount > pageSize && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setVisibleCount(pageSize)}
              className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:underline"
            >
              {t("showLess")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
