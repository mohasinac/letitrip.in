"use client";

import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@mohasinac/appkit/ui";
import { Label, Span } from "../typography/Typography";

/**
 * Toggle/Switch Component
 *
 * A switch control for boolean input with smooth animation.
 * Supports controlled and uncontrolled modes with themed coloring.
 *
 * @component
 * @example
 * ```tsx
 * <Toggle checked={enabled} onChange={setEnabled} />
 * <Toggle defaultChecked label="Enable notifications" />
 * ```
 */

interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

export default function Toggle({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  size = "md",
  className = "",
  id,
}: ToggleProps) {
  const { themed } = THEME_CONSTANTS;
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const checked =
    controlledChecked !== undefined ? controlledChecked : internalChecked;

  const handleChange = () => {
    if (disabled) return;

    const newChecked = !checked;

    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  const sizeConfig = {
    sm: {
      track: "w-8 h-[18px]",
      thumb: "w-3.5 h-3.5",
      translate: checked ? "translate-x-[14px]" : "translate-x-0.5",
    },
    md: {
      track: "w-11 h-6",
      thumb: "w-5 h-5",
      translate: checked ? "translate-x-5" : "translate-x-0.5",
    },
    lg: {
      track: "w-14 h-7",
      thumb: "w-6 h-6",
      translate: checked ? "translate-x-7" : "translate-x-0.5",
    },
  };

  const toggleId = id || `toggle-${React.useId()}`;
  const cfg = sizeConfig[size];

  return (
    <div className={classNames("inline-flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${toggleId}-label` : undefined}
        disabled={disabled}
        onClick={handleChange}
        className={classNames(
          cfg.track,
          "relative inline-flex items-center rounded-full p-0",
          "transition-colors duration-200 ease-in-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2",
          "dark:focus-visible:ring-secondary-400/40 dark:focus-visible:ring-offset-slate-900",
          checked
            ? "bg-primary-600 dark:bg-secondary-500"
            : "bg-zinc-300 dark:bg-slate-600",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <Span
          className={classNames(
            cfg.thumb,
            cfg.translate,
            "inline-block rounded-full bg-white shadow-sm",
            "transform transition-transform duration-200 ease-in-out",
          )}
        />
      </button>

      {label && (
        <Label
          id={`${toggleId}-label`}
          htmlFor={toggleId}
          className={classNames(
            "text-sm font-medium cursor-pointer select-none",
            themed.textPrimary,
            disabled ? "opacity-50 cursor-not-allowed" : "",
          )}
          onClick={!disabled ? handleChange : undefined}
        >
          {label}
        </Label>
      )}
    </div>
  );
}
