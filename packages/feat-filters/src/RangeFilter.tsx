"use client";

import { useId, useState } from "react";
import { cn } from "./filterUtils";

// ─── DualSlider sub-component ─────────────────────────────────────────────────

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
  const id = useId().replace(/:/g, "s");
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
  const lowerZ = minNum >= maxBound - step ? 5 : 3;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(parseFloat(e.target.value), maxNum - step);
    onMinChange(String(v));
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(parseFloat(e.target.value), minNum + step);
    onMaxChange(String(v));
  };

  const thumbClass = `drs-${id}`;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-primary-600 dark:text-secondary-400">
          {prefix}
          {minNum}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">–</span>
        <span className="text-sm font-semibold tabular-nums text-primary-600 dark:text-secondary-400">
          {prefix}
          {maxNum}
        </span>
      </div>

      <div
        className="relative h-7 flex items-center select-none"
        aria-hidden="true"
      >
        <div className="absolute h-2 w-full rounded-full bg-zinc-200 dark:bg-slate-700" />
        <div
          className="absolute h-2 rounded-full bg-primary-600 dark:bg-secondary-500 pointer-events-none"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          className={thumbClass}
          min={minBound}
          max={maxBound}
          step={step}
          value={minNum}
          onChange={handleMinChange}
          style={{ zIndex: lowerZ }}
          aria-label="Minimum value"
        />
        <input
          type="range"
          className={thumbClass}
          min={minBound}
          max={maxBound}
          step={step}
          value={maxNum}
          onChange={handleMaxChange}
          style={{ zIndex: 4 }}
          aria-label="Maximum value"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {prefix}
          {minBound}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {prefix}
          {maxBound}
        </span>
      </div>

      {/* Scoped CSS for dual-thumb sliders */}
      <style>{`
        .${thumbClass} {
          position: absolute;
          width: 100%;
          height: 0;
          -webkit-appearance: none;
          appearance: none;
          pointer-events: none;
          background: none;
          outline: none;
        }
        .${thumbClass}::-webkit-slider-thumb {
          pointer-events: all;
          -webkit-appearance: none;
          width: 1.125rem;
          height: 1.125rem;
          background: white;
          border: 3px solid #1a55f2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .${thumbClass}::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(26,85,242,0.15);
        }
        .${thumbClass}::-moz-range-thumb {
          pointer-events: all;
          width: 1.125rem;
          height: 1.125rem;
          background: white;
          border: 3px solid #1a55f2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .dark .${thumbClass}::-webkit-slider-thumb {
          border-color: #65c408;
          background: #1e293b;
        }
        .dark .${thumbClass}::-moz-range-thumb {
          border-color: #65c408;
          background: #1e293b;
        }
      `}</style>
    </div>
  );
}

// ─── RangeFilter ─────────────────────────────────────────────────────────────

export interface RangeFilterProps {
  title: string;
  minLabel?: string;
  maxLabel?: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  type?: "number" | "date";
  prefix?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  defaultCollapsed?: boolean;
  showSlider?: boolean;
  minBound?: number;
  maxBound?: number;
  step?: number;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
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

  const canShowSlider =
    showSlider &&
    type === "number" &&
    minBound !== undefined &&
    maxBound !== undefined;
  const hasValue = !!(minValue || maxValue);

  const inputClass =
    "w-full rounded-md border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-secondary-400/20";

  return (
    <div
      role="group"
      aria-labelledby={`rf-${title}`}
      className={cn(
        "p-4 border-b border-zinc-200 dark:border-slate-700 last:border-b-0",
        className,
      )}
    >
      <button
        type="button"
        id={`rf-${title}`}
        onClick={handleToggle}
        className="flex w-full items-center justify-between text-sm font-semibold text-zinc-900 dark:text-zinc-50 py-1 hover:opacity-80 transition-opacity"
        aria-expanded={!isCollapsed}
      >
        <span className="flex items-center gap-2">
          {title}
          {hasValue && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20">
              1
            </span>
          )}
          {onClear && hasValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="inline-flex items-center justify-center w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
              aria-label="Clear"
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
        <div className="mt-3 space-y-3">
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

          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              {minLabel && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  {minLabel}
                </p>
              )}
              <div className="relative">
                {prefix && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">
                    {prefix}
                  </span>
                )}
                <input
                  type={type}
                  value={minValue}
                  onChange={(e) => onMinChange(e.target.value)}
                  placeholder={
                    minPlaceholder ?? (type === "date" ? "From" : "Min")
                  }
                  className={cn(inputClass, prefix ? "pl-5" : "")}
                />
              </div>
            </div>

            <span className="flex-shrink-0 pb-1.5 text-zinc-400 dark:text-zinc-500 text-xs">
              –
            </span>

            <div className="flex-1 min-w-0">
              {maxLabel && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  {maxLabel}
                </p>
              )}
              <div className="relative">
                {prefix && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">
                    {prefix}
                  </span>
                )}
                <input
                  type={type}
                  value={maxValue}
                  onChange={(e) => onMaxChange(e.target.value)}
                  placeholder={
                    maxPlaceholder ?? (type === "date" ? "To" : "Max")
                  }
                  className={cn(inputClass, prefix ? "pl-5" : "")}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
