"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Span, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface RangeFilterProps {
  /** Section heading */
  title: string;
  /** Label above min input */
  minLabel?: string;
  /** Label above max input */
  maxLabel?: string;
  /** Controlled min value */
  minValue: string;
  /** Controlled max value */
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  /** Input type. Defaults to "number". Use "date" for date pickers. */
  type?: "number" | "date";
  /** Symbol to display as prefix in inputs (e.g. "₹") */
  prefix?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  /** Whether the section starts collapsed. Defaults to true. */
  defaultCollapsed?: boolean;
  className?: string;
}

export function RangeFilter({
  title,
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  type = "number",
  prefix,
  minPlaceholder,
  maxPlaceholder,
  defaultCollapsed = true,
  className = "",
}: RangeFilterProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const { themed, spacing } = THEME_CONSTANTS;
  const t = useTranslations("filters");

  const hasValue = !!(minValue || maxValue);

  return (
    <div
      role="group"
      aria-labelledby={`range-${title}`}
      className={`${spacing.padding.md} border-b ${themed.border} last:border-b-0 ${className}`}
    >
      <Button
        type="button"
        variant="ghost"
        id={`range-${title}`}
        onClick={() => setIsCollapsed((c) => !c)}
        className={`flex w-full items-center justify-between text-sm font-semibold ${themed.textPrimary} py-1 hover:opacity-80 transition-opacity`}
        aria-expanded={!isCollapsed}
      >
        <Span className="flex items-center gap-2">
          {title}
          {hasValue && (
            <Span
              className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
              aria-label={t("activeCount", { count: 1 })}
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {!isCollapsed && (
        <div className="mt-3 space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              {minLabel && (
                <Text size="xs" variant="secondary" className="mb-1 block">
                  {minLabel}
                </Text>
              )}
              <div className="relative">
                {prefix && (
                  <Span
                    className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${themed.textSecondary} pointer-events-none`}
                    aria-hidden="true"
                  >
                    {prefix}
                  </Span>
                )}
                <Input
                  type={type}
                  value={minValue}
                  onChange={(e) => onMinChange(e.target.value)}
                  placeholder={minPlaceholder ?? t("from")}
                  className={`w-full text-sm ${prefix ? "pl-6" : ""}`}
                  aria-label={minLabel ?? t("from")}
                />
              </div>
            </div>

            <Text size="sm" variant="muted" className="pb-2.5 flex-shrink-0">
              –
            </Text>

            <div className="flex-1 min-w-0">
              {maxLabel && (
                <Text size="xs" variant="secondary" className="mb-1 block">
                  {maxLabel}
                </Text>
              )}
              <div className="relative">
                {prefix && (
                  <Span
                    className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs ${themed.textSecondary} pointer-events-none`}
                    aria-hidden="true"
                  >
                    {prefix}
                  </Span>
                )}
                <Input
                  type={type}
                  value={maxValue}
                  onChange={(e) => onMaxChange(e.target.value)}
                  placeholder={maxPlaceholder ?? t("to")}
                  className={`w-full text-sm ${prefix ? "pl-6" : ""}`}
                  aria-label={maxLabel ?? t("to")}
                />
              </div>
            </div>
          </div>

          {hasValue && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onMinChange("");
                onMaxChange("");
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t("clearRange")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
