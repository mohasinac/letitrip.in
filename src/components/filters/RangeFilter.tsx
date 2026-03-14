"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Span, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

// ─── Dual range slider sub-component ────────────────────────────────────────

interface DualSliderProps {
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  minBound: number;
  maxBound: number;
  step?: number;
  prefix?: string;
}

/**
 * DualSlider — two overlapping `<input type="range">` elements that together
 * form a true interactive dual-thumb range slider.
 *
 * - The coloured fill tracks the selected window.
 * - When the lower thumb is dragged all the way right, it is promoted to the
 *   top layer so it can't get trapped behind the upper thumb.
 */
function DualSlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minBound,
  maxBound,
  step = 1,
  prefix = "",
}: DualSliderProps) {
  const { themed, flex } = THEME_CONSTANTS;
  const id = useId().replace(/:/g, "");

  const range = maxBound - minBound || 1;
  const minNum = Math.max(
    minBound,
    Math.min(parseFloat(minValue) || minBound, maxBound),
  );
  const maxNum = Math.min(
    maxBound,
    Math.max(parseFloat(maxValue) || maxBound, minBound),
  );
  const minPct = ((minNum - minBound) / range) * 100;
  const maxPct = ((maxNum - minBound) / range) * 100;

  // Promote lower thumb to top z-layer when it reaches the right edge.
  const lowerZ = minNum >= maxBound - step ? 5 : 3;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(parseFloat(e.target.value), maxNum - step);
    onMinChange(String(v));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(parseFloat(e.target.value), minNum + step);
    onMaxChange(String(v));
  };

  return (
    <div className="w-full space-y-2">
      {/* Current range value labels */}
      <div className={`${flex.between}`}>
        <Span
          className={`text-sm font-semibold tabular-nums ${themed.textPrimary}`}
        >
          {prefix}
          {minNum}
        </Span>
        <Span className={`text-xs ${themed.textSecondary}`}>–</Span>
        <Span
          className={`text-sm font-semibold tabular-nums ${themed.textPrimary}`}
        >
          {prefix}
          {maxNum}
        </Span>
      </div>

      {/* Track + dual-thumb inputs */}
      <div
        className="relative h-7 flex items-center select-none"
        aria-hidden="true"
      >
        {/* Background track */}
        <div className="absolute h-2 w-full rounded-full bg-zinc-200 dark:bg-slate-700" />
        {/* Selected fill */}
        <div
          className="absolute h-2 rounded-full bg-primary-600 dark:bg-secondary-500 pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        {/* Min (lower) thumb */}
        <input
          type="range"
          className={`drs-input-${id}`}
          min={minBound}
          max={maxBound}
          step={step}
          value={minNum}
          onChange={handleMinChange}
          style={{ zIndex: lowerZ }}
          aria-label="Minimum value"
        />
        {/* Max (upper) thumb */}
        <input
          type="range"
          className={`drs-input-${id}`}
          min={minBound}
          max={maxBound}
          step={step}
          value={maxNum}
          onChange={handleMaxChange}
          style={{ zIndex: 4 }}
          aria-label="Maximum value"
        />
      </div>

      {/* Bound labels */}
      <div className={`${flex.between}`}>
        <Span className={`text-xs ${themed.textSecondary}`}>
          {prefix}
          {minBound}
        </Span>
        <Span className={`text-xs ${themed.textSecondary}`}>
          {prefix}
          {maxBound}
        </Span>
      </div>

      {/* Scoped CSS — mirrors Slider.tsx convention */}
      <style jsx>{`
        .drs-input-${id} {
          position: absolute;
          width: 100%;
          height: 0;
          appearance: none;
          pointer-events: none;
          background: none;
          outline: none;
        }
        .drs-input-${id}::-webkit-slider-thumb {
          pointer-events: all;
          -webkit-appearance: none;
          appearance: none;
          width: 1.125rem;
          height: 1.125rem;
          background: white;
          border: 3px solid #1a55f2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          transition:
            transform 0.15s,
            box-shadow 0.15s;
        }
        .drs-input-${id}::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(26, 85, 242, 0.15);
        }
        .drs-input-${id}::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .drs-input-${id}::-webkit-slider-runnable-track {
          background: none;
        }
        .drs-input-${id}::-moz-range-thumb {
          pointer-events: all;
          width: 1.125rem;
          height: 1.125rem;
          background: white;
          border: 3px solid #1a55f2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          transition:
            transform 0.15s,
            box-shadow 0.15s;
        }
        .drs-input-${id}::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(101, 196, 8, 0.15);
        }
        .drs-input-${id}::-moz-range-track {
          background: none;
          border: none;
        }
        :global(.dark) .drs-input-${id}::-webkit-slider-thumb {
          border-color: #65c408;
          background: #1e293b;
        }
        :global(.dark) .drs-input-${id}::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 4px rgba(101, 196, 8, 0.15);
        }
        :global(.dark) .drs-input-${id}::-moz-range-thumb {
          border-color: #65c408;
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}

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
  /**
   * When true, renders an interactive dual-thumb slider above the text inputs.
   * Requires `type="number"` and both `minBound` + `maxBound` to be set.
   */
  showSlider?: boolean;
  /** Absolute lower bound for the slider track (e.g. 0). */
  minBound?: number;
  /** Absolute upper bound for the slider track (e.g. 100000). */
  maxBound?: number;
  /** Slider drag step. Defaults to 1. */
  step?: number;
  className?: string;
  /** Controlled open state */
  isOpen?: boolean;
  /** Called when the header is toggled */
  onToggle?: () => void;
  /** Called when the clear (×) button is clicked */
  onClear?: () => void;
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
  showSlider = false,
  minBound,
  maxBound,
  step = 1,
  className = "",
  isOpen: controlledOpen,
  onToggle,
  onClear,
}: RangeFilterProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = isControlled ? !controlledOpen : internalCollapsed;
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalCollapsed((c) => !c);
  };
  const { themed, spacing, flex } = THEME_CONSTANTS;
  const t = useTranslations("filters");

  const canShowSlider =
    showSlider &&
    type === "number" &&
    minBound !== undefined &&
    maxBound !== undefined;

  const hasValue = !!(minValue || maxValue);

  return (
    <div
      role="group"
      aria-labelledby={`range-${title}`}
      className={`p-4 border-b ${themed.border} last:border-b-0 ${className}`}
    >
      <Button
        type="button"
        variant="ghost"
        id={`range-${title}`}
        onClick={handleToggle}
        className={`flex w-full items-center justify-between text-sm font-semibold ${themed.textPrimary} py-1 hover:opacity-80 transition-opacity`}
        aria-expanded={!isCollapsed}
      >
        <Span className="flex items-center gap-2">
          {title}
          {hasValue && (
            <Span
              className={`inline-${flex.center} w-5 h-5 text-xs rounded-full ${THEME_CONSTANTS.badge.active}`}
              aria-label={t("activeCount", { count: 1 })}
            >
              1
            </Span>
          )}
          {onClear && hasValue && (
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
        <div className="mt-3 space-y-3">
          {/* ── Dual-thumb slider (numeric with bounds) ── */}
          {canShowSlider && (
            <DualSlider
              minValue={minValue}
              maxValue={maxValue}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
              minBound={minBound!}
              maxBound={maxBound!}
              step={step}
              prefix={prefix}
            />
          )}

          {/* ── Text / date inputs (always shown for precise entry) ── */}
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
