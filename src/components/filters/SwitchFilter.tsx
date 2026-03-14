"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  /** Controlled open state */
  isOpen?: boolean;
  /** Called when the header is toggled */
  onToggle?: () => void;
  /** Called when the clear (×) button is clicked */
  onClear?: () => void;
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
  isOpen: controlledOpen,
  onToggle,
  onClear,
}: SwitchFilterProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = isControlled ? !controlledOpen : internalCollapsed;
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed((c) => !c);
  };
  const { themed, spacing, flex } = THEME_CONSTANTS;
  const t = useTranslations("filters");

  return (
    <div
      className={`p-4 border-b ${themed.border} last:border-b-0 ${className}`}
    >
      {/* Section header — matches FilterFacetSection */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleToggle}
        className={`flex w-full items-center justify-between text-sm font-semibold ${themed.textPrimary} py-1 hover:opacity-80 transition-opacity`}
        aria-expanded={!isCollapsed}
      >
        <Span className="flex items-center gap-2">
          {title}
          {checked && (
            <Span
              className={`inline-${flex.center} w-5 h-5 text-xs rounded-full bg-primary/10 text-primary`}
            >
              1
            </Span>
          )}
          {onClear && checked && (
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
