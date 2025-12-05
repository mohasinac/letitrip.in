/**
 * @fileoverview React Component
 * @module src/components/admin/ToggleSwitch
 * @description This file contains the ToggleSwitch component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

/**
 * ToggleSwitchProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ToggleSwitchProps
 */
interface ToggleSwitchProps {
  /** Enabled */
  enabled: boolean;
  /** On Toggle */
  onToggle: () => void;
  /** Disabled */
  disabled?: boolean;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Label */
  label?: string;
  /** Description */
  description?: string;
  /** Id */
  id?: string;
}

/**
 * Function: Toggle Switch
 */
/**
 * Performs toggle switch operation
 *
 * @returns {any} The toggleswitch result
 *
 * @example
 * ToggleSwitch();
 */

/**
 * Performs toggle switch operation
 *
 * @returns {any} The toggleswitch result
 *
 * @example
 * ToggleSwitch();
 */

export function ToggleSwitch({
  enabled,
  onToggle,
  disabled = false,
  size = "md",
  label,
  description,
  id,
}: ToggleSwitchProps) {
  const sizes = {
    /** Sm */
    sm: {
      /** Container */
      container: "h-5 w-9",
      /** Circle */
      circle: "h-3 w-3",
      /** Translate */
      translate: enabled ? "translate-x-5" : "translate-x-1",
    },
    /** Md */
    md: {
      /** Container */
      container: "h-6 w-11",
      /** Circle */
      circle: "h-4 w-4",
      /** Translate */
      translate: enabled ? "translate-x-6" : "translate-x-1",
    },
    /** Lg */
    lg: {
      /** Container */
      container: "h-7 w-14",
      /** Circle */
      circle: "h-5 w-5",
      /** Translate */
      translate: enabled ? "translate-x-8" : "translate-x-1",
    },
  };

  const sizeConfig = sizes[size];

  const switchId =
    id ||
    (label ? `toggle-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  if (label || description) {
    return (
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {label && (
            <label
              htmlFor={switchId}
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex ${
            sizeConfig.container
          } items-center rounded-full transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
          aria-pressed={enabled}
          id={switchId}
          aria-labelledby={label ? `${switchId}-label` : undefined}
        >
          <span
            className={`inline-block ${sizeConfig.circle} transform rounded-full bg-white transition-transform ${sizeConfig.translate}`}
          />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex ${
        sizeConfig.container
      } items-center rounded-full transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block ${sizeConfig.circle} transform rounded-full bg-white transition-transform ${sizeConfig.translate}`}
      />
    </button>
  );
}
