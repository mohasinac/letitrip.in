"use client";

import { useState } from "react";
import { Toggle, Button, Span } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

interface SwitchFilterProps {
  /** Section heading shown in the collapsible header */
  title: string;
  /** Descriptive label rendered next to the toggle (e.g. "Active only") */
  label: string;
  /** Whether the toggle is currently ON (filter applied) */
  checked: boolean;
  /** Called when the toggle is flipped */
  onChange: (checked: boolean) => void;
  /** Start collapsed. Defaults to false so the toggle is immediately visible. */
  defaultCollapsed?: boolean;
  className?: string;
}

/**
 * SwitchFilter
 *
 * A collapsible filter section containing a single Toggle switch.
 * Use for binary/boolean filter fields (e.g. isWinning, isFeatured, isActive).
 *
 * Behaviour:
 *  - Toggle ON  → caller stores "true" → Sieve sends `field==true`
 *  - Toggle OFF → caller stores ""    → no filter applied (show all)
 *
 * Matches the visual style of FilterFacetSection (same padding, border, chevron).
 */
export function SwitchFilter({
  title,
  label,
  checked,
  onChange,
  defaultCollapsed = false,
  className = "",
}: SwitchFilterProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const { themed, spacing, flex } = THEME_CONSTANTS;

  return (
    <div
      className={`p-4 border-b ${themed.border} last:border-b-0 ${className}`}
    >
      {/* Section header — matches FilterFacetSection */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsCollapsed((c) => !c)}
        className={`flex w-full items-center justify-between text-sm font-semibold ${themed.textPrimary} py-1 hover:opacity-80 transition-opacity`}
        aria-expanded={!isCollapsed}
      >
        <Span className="flex items-center gap-2">
          {title}
          {checked && (
            <Span
              className={`inline-${flex.center} w-5 h-5 text-xs rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300`}
            >
              1
            </Span>
          )}
        </Span>
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
        <div className={`mt-2 ${flex.between} gap-4`}>
          <Span className={`text-sm ${themed.textSecondary} leading-snug`}>
            {label}
          </Span>
          <Toggle checked={checked} onChange={onChange} size="sm" />
        </div>
      )}
    </div>
  );
}
