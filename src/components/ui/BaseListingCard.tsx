/**
 * BaseListingCard — compound component
 *
 * Provides the shared outer chrome for every listing card:
 * rounded-2xl, border, hover shadow, hover lift, and selection ring.
 *
 * Usage:
 * ```tsx
 * <BaseListingCard isSelected={isSelected} isDisabled={isOutOfStock} variant={variant}>
 *   <BaseListingCard.Hero aspect="4/5" variant={variant} onMouseEnter={...} onMouseLeave={...}>
 *     {children}
 *   </BaseListingCard.Hero>
 *   <BaseListingCard.Info variant={variant}>
 *     {children}
 *   </BaseListingCard.Info>
 * </BaseListingCard>
 * ```
 *
 * For selectable cards:
 * ```tsx
 * <BaseListingCard.Checkbox selected={isSelected} onSelect={handleSelect} label="Select item" />
 * ```
 */

"use client";

import type { ReactNode, MouseEventHandler } from "react";
import { THEME_CONSTANTS } from "@/constants";
import Button from "./Button";
import { Span } from "@mohasinac/ui";

const { themed } = THEME_CONSTANTS;

const ASPECT_CLASS = {
  square: "aspect-square",
  "4/5": "aspect-[4/5]",
  "4/3": "aspect-[4/3]",
  "2/1": "aspect-[2/1]",
  "3/4": "aspect-[3/4]",
} as const;

// ── Root ─────────────────────────────────────────────────────────────────────

interface RootProps {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  /** "grid" (default): vertical card. "list": horizontal card. */
  variant?: "grid" | "list";
}

function Root({
  children,
  className = "",
  isSelected,
  isDisabled,
  variant = "grid",
}: RootProps) {
  return (
    <div
      className={[
        "h-full rounded-2xl overflow-hidden border transition-all duration-300 flex shadow-sm hover:shadow-2xl hover:-translate-y-1.5 group",
        themed.bgPrimary,
        variant === "list" ? "flex-row" : "flex-col",
        isDisabled ? "opacity-75" : "",
        isSelected
          ? "ring-2 ring-primary-500 dark:ring-primary-400 border-primary-300 dark:border-primary-700"
          : "border-zinc-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

interface HeroProps {
  children: ReactNode;
  /**
   * Aspect ratio applied when variant="grid". Defaults to "4/5".
   * Ignored in list mode (always aspect-square at listWidth).
   */
  aspect?: keyof typeof ASPECT_CLASS;
  /** Width class(es) applied in list mode. Default: "w-32 sm:w-44". */
  listWidth?: string;
  variant?: "grid" | "list";
  /**
   * Extra Tailwind classes to add. The default background "bg-zinc-100 dark:bg-slate-800"
   * is prepended — override by passing your own bg-* classes here which will take
   * precedence via Tailwind Merge semantics (last wins at same specificity).
   * Leave empty to keep the default.
   */
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

function Hero({
  children,
  aspect = "4/5",
  listWidth = "w-32 sm:w-44",
  variant = "grid",
  className = "",
  onMouseEnter,
  onMouseLeave,
}: HeroProps) {
  const dimensions =
    variant === "list"
      ? `${listWidth} aspect-square`
      : `${ASPECT_CLASS[aspect] ?? "aspect-[4/5]"} w-full`;

  return (
    <div
      className={[
        "relative overflow-hidden bg-zinc-100 dark:bg-slate-800 flex-shrink-0",
        dimensions,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

// ── Info ─────────────────────────────────────────────────────────────────────

interface InfoProps {
  children: ReactNode;
  className?: string;
  variant?: "grid" | "list";
}

function Info({ children, className = "", variant = "grid" }: InfoProps) {
  return (
    <div
      className={[
        "flex-1 flex flex-col gap-2 p-3",
        variant === "list" ? "min-w-0" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

// ── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps {
  selected: boolean;
  onSelect: MouseEventHandler<HTMLButtonElement>;
  label: string;
  /** Tailwind absolute-position classes. Defaults to "top-2 right-2". */
  position?: string;
}

function Checkbox({
  selected,
  onSelect,
  label,
  position = "top-2 right-2",
}: CheckboxProps) {
  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      aria-label={label}
      className={`absolute ${position} w-10 h-10 sm:w-8 sm:h-8 !min-h-0 rounded-lg bg-white/90 dark:bg-slate-800/90 flex items-center justify-center shadow border border-zinc-200 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors z-10 p-0`}
    >
      {selected ? (
        <Span
          variant="inherit"
          className="w-4 h-4 rounded bg-primary-600 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 10 8"
            className="w-2.5 h-2 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M1 4l2.5 2.5L9 1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Span>
      ) : (
        <Span
          variant="inherit"
          className="w-4 h-4 rounded border-2 border-zinc-400 dark:border-slate-500 block"
        />
      )}
    </Button>
  );
}

// ── Export ───────────────────────────────────────────────────────────────────

export const BaseListingCard = Object.assign(Root, { Hero, Info, Checkbox });
