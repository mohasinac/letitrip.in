/**
 * Unified Form Components
 * Select, Checkbox, Radio, and Switch components
 * Consistent styling and behavior across all forms
 */

"use client";

import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// UNIFIED SELECT
// ============================================================================

export interface UnifiedSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const selectSizeClasses = {
  sm: "py-1.5 px-3 text-sm",
  md: "py-2 px-4 text-base",
  lg: "py-3 px-4 text-lg",
};

export const UnifiedSelect = React.forwardRef<
  HTMLSelectElement,
  UnifiedSelectProps
>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium text-text">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "appearance-none rounded-lg border-2 transition-all",
              "bg-surface text-text",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              hasError
                ? "border-error focus:border-error"
                : "border-border focus:border-primary",
              selectSizeClasses[size],
              fullWidth && "w-full",
              props.disabled && "opacity-50 cursor-not-allowed",
              "pr-10",
              className
            )}
            {...props}
          >
            {children}
          </select>

          {/* Dropdown Icon */}
          <ChevronDown
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
              "w-5 h-5 text-textSecondary"
            )}
          />
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              "text-xs",
              hasError ? "text-error" : "text-textSecondary"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

UnifiedSelect.displayName = "UnifiedSelect";

// ============================================================================
// UNIFIED CHECKBOX
// ============================================================================

export interface UnifiedCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
}

export const UnifiedCheckbox = React.forwardRef<
  HTMLInputElement,
  UnifiedCheckboxProps
>(({ label, error, helperText, indeterminate, className, ...props }, ref) => {
  const hasError = !!error;
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              // @ts-ignore
              checkboxRef.current = node;
            }}
            type="checkbox"
            className={cn(
              "peer appearance-none w-5 h-5 rounded border-2 transition-all",
              "bg-surface cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              hasError
                ? "border-error"
                : "border-border checked:border-primary checked:bg-primary",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {/* Checkmark */}
          <Check
            className={cn(
              "absolute w-3.5 h-3.5 text-white pointer-events-none",
              "opacity-0 peer-checked:opacity-100 transition-opacity"
            )}
          />

          {/* Indeterminate indicator */}
          {indeterminate && (
            <div className="absolute w-2.5 h-0.5 bg-white pointer-events-none" />
          )}
        </div>

        {label && (
          <span className="text-sm text-text group-hover:text-textSecondary transition-colors">
            {label}
          </span>
        )}
      </label>

      {(error || helperText) && (
        <p
          className={cn(
            "text-xs ml-8",
            hasError ? "text-error" : "text-textSecondary"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

UnifiedCheckbox.displayName = "UnifiedCheckbox";

// ============================================================================
// UNIFIED RADIO
// ============================================================================

export interface UnifiedRadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const UnifiedRadio = React.forwardRef<
  HTMLInputElement,
  UnifiedRadioProps
>(({ label, error, helperText, className, ...props }, ref) => {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="radio"
            className={cn(
              "peer appearance-none w-5 h-5 rounded-full border-2 transition-all",
              "bg-surface cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
              hasError ? "border-error" : "border-border",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {/* Radio dot */}
          <div
            className={cn(
              "absolute w-2.5 h-2.5 rounded-full bg-primary",
              "opacity-0 peer-checked:opacity-100 transition-opacity"
            )}
          />
        </div>

        {label && (
          <span className="text-sm text-text group-hover:text-textSecondary transition-colors">
            {label}
          </span>
        )}
      </label>

      {(error || helperText) && (
        <p
          className={cn(
            "text-xs ml-8",
            hasError ? "text-error" : "text-textSecondary"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

UnifiedRadio.displayName = "UnifiedRadio";

// ============================================================================
// UNIFIED SWITCH
// ============================================================================

export interface UnifiedSwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
}

const switchSizeClasses = {
  sm: {
    track: "w-9 h-5",
    thumb: "w-3.5 h-3.5",
    translate: "translate-x-4",
  },
  md: {
    track: "w-11 h-6",
    thumb: "w-4 h-4",
    translate: "translate-x-5",
  },
  lg: {
    track: "w-14 h-7",
    thumb: "w-5 h-5",
    translate: "translate-x-7",
  },
};

export const UnifiedSwitch = React.forwardRef<
  HTMLInputElement,
  UnifiedSwitchProps
>(({ label, helperText, size = "md", className, ...props }, ref) => {
  const sizeClass = switchSizeClasses[size];

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />

          {/* Track */}
          <div
            className={cn(
              "rounded-full transition-colors",
              "bg-border peer-checked:bg-primary",
              "peer-focus:ring-2 peer-focus:ring-primary/50 peer-focus:ring-offset-2",
              props.disabled && "opacity-50 cursor-not-allowed",
              sizeClass.track,
              className
            )}
          />

          {/* Thumb */}
          <div
            className={cn(
              "absolute top-1 left-1 bg-white rounded-full transition-transform",
              "peer-checked:" + sizeClass.translate,
              sizeClass.thumb
            )}
          />
        </div>

        {label && (
          <span className="text-sm text-text group-hover:text-textSecondary transition-colors">
            {label}
          </span>
        )}
      </label>

      {helperText && (
        <p className="text-xs text-textSecondary ml-14">{helperText}</p>
      )}
    </div>
  );
});

UnifiedSwitch.displayName = "UnifiedSwitch";

// ============================================================================
// RADIO GROUP HELPER
// ============================================================================

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  label?: string;
  error?: string;
  orientation?: "horizontal" | "vertical";
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  label,
  error,
  orientation = "vertical",
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}

      <div
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
      >
        {options.map((option) => (
          <UnifiedRadio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default {
  Select: UnifiedSelect,
  Checkbox: UnifiedCheckbox,
  Radio: UnifiedRadio,
  Switch: UnifiedSwitch,
  RadioGroup,
};
