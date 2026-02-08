"use client";

import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Toggle/Switch Component
 *
 * A switch control for boolean input with smooth animation.
 * Supports controlled and uncontrolled modes.
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

  const sizeClasses = {
    sm: {
      container: "w-8 h-5",
      toggle: "w-3 h-3",
      translate: checked ? "translate-x-3" : "translate-x-1",
    },
    md: {
      container: "w-11 h-6",
      toggle: "w-4 h-4",
      translate: checked ? "translate-x-5" : "translate-x-1",
    },
    lg: {
      container: "w-14 h-7",
      toggle: "w-5 h-5",
      translate: checked ? "translate-x-7" : "translate-x-1",
    },
  };

  const toggleId = id || `toggle-${React.useId()}`;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${toggleId}-label` : undefined}
        disabled={disabled}
        onClick={handleChange}
        className={`
          ${sizeClasses[size].container}
          relative inline-flex items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? "bg-blue-600 dark:bg-blue-500" : themed.bgTertiary}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            ${sizeClasses[size].toggle}
            ${sizeClasses[size].translate}
            inline-block rounded-full ${themed.bgSecondary}
            transform transition-transform duration-200 ease-in-out
            shadow-lg
          `}
        />
      </button>

      {label && (
        <label
          id={`${toggleId}-label`}
          htmlFor={toggleId}
          className={`
            text-sm font-medium cursor-pointer select-none
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={!disabled ? handleChange : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
}
