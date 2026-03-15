"use client";

import { useState } from "react";
import { cn } from "./filterUtils";
import type { FilterOption } from "./filterUtils";

export interface FacetOption extends FilterOption {
  count?: number;
}

export interface FilterFacetSectionProps {
  title: string;
  options: FacetOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  selectionMode?: "single" | "multi";
  defaultCollapsed?: boolean;
  searchable?: boolean;
  /** Controlled open state */
  isOpen?: boolean;
  onToggle?: () => void;
  onClear?: () => void;
  className?: string;
}

/**
 * FilterFacetSection — collapsible checkbox/radio filter section.
 * Supports single-select and multi-select modes.
 */
export function FilterFacetSection({
  title,
  options,
  selected,
  onChange,
  selectionMode = "multi",
  defaultCollapsed = true,
  searchable = false,
  isOpen: controlledOpen,
  onToggle,
  onClear,
  className = "",
}: FilterFacetSectionProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [search, setSearch] = useState("");

  const isCollapsed = isControlled ? !controlledOpen : internalCollapsed;
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed((c) => !c);
  };

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const toggle = (value: string) => {
    if (selectionMode === "single") {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      );
    }
  };

  const hasValue = selected.length > 0;

  return (
    <div
      className={cn(
        "p-4 border-b border-zinc-200 dark:border-slate-700 last:border-b-0",
        className,
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-50 py-1 hover:opacity-80 transition-opacity"
        aria-expanded={!isCollapsed}
      >
        <span className="flex items-center gap-2">
          {title}
          {hasValue && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20 dark:ring-emerald-400/20">
              {selected.length}
            </span>
          )}
          {onClear && hasValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="inline-flex items-center justify-center w-5 h-5 p-0 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-slate-700 transition-colors rounded-full"
              aria-label="Clear filter"
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
            </button>
          )}
        </span>
        <svg
          className={cn(
            "w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200",
            isCollapsed ? "" : "rotate-180",
          )}
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
        <div className="mt-3 space-y-1">
          {searchable && options.length > 8 && (
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-secondary-400/20 mb-2"
            />
          )}
          {filtered.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center gap-2.5 py-1 cursor-pointer group"
              >
                <input
                  type={selectionMode === "single" ? "radio" : "checkbox"}
                  checked={isSelected}
                  onChange={() => toggle(option.value)}
                  className={cn(
                    "flex-shrink-0 border-zinc-300 dark:border-slate-600 cursor-pointer",
                    selectionMode === "single"
                      ? "w-4 h-4 rounded-full text-primary-600 dark:text-secondary-500"
                      : "w-4 h-4 rounded text-primary-600 dark:text-secondary-500 checked:bg-primary-600 dark:checked:bg-secondary-500",
                    "focus:ring-primary-500/30 dark:focus:ring-secondary-400/30",
                  )}
                />
                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors truncate">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums flex-shrink-0">
                    {option.count}
                  </span>
                )}
              </label>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 py-1">
              No results
            </p>
          )}
        </div>
      )}
    </div>
  );
}
