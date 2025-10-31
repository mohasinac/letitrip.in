/**
 * Unified Input Component
 * Single source of truth for all input variants
 * Supports text, email, password, number, textarea, and more
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from "lucide-react";

export interface UnifiedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  // Input type
  inputType?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time"
    | "datetime-local";

  // Label
  label?: string;
  labelClassName?: string;

  // Helper text
  helperText?: string;

  // Error state
  error?: boolean;
  errorMessage?: string;

  // Success state
  success?: boolean;
  successMessage?: string;

  // Info
  info?: string;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Size
  size?: "sm" | "md" | "lg";

  // Style
  variant?: "outlined" | "filled" | "standard";
  rounded?: "none" | "sm" | "md" | "lg" | "full";

  // Layout
  fullWidth?: boolean;

  // Password toggle
  showPasswordToggle?: boolean;

  // Loading
  loading?: boolean;

  // Required indicator
  required?: boolean;
  showRequiredIndicator?: boolean;
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm min-h-[32px]",
  md: "px-4 py-2 text-base min-h-[40px]",
  lg: "px-5 py-3 text-lg min-h-[48px]",
};

const variantClasses = {
  outlined:
    "border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
  filled:
    "border-0 bg-surfaceVariant focus:bg-surface focus:ring-2 focus:ring-primary/20",
  standard:
    "border-0 border-b-2 border-border bg-transparent rounded-none focus:border-primary",
};

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const UnifiedInput = React.forwardRef<
  HTMLInputElement,
  UnifiedInputProps
>(
  (
    {
      // Input props
      inputType = "text",
      label,
      labelClassName,
      helperText,
      error = false,
      errorMessage,
      success = false,
      successMessage,
      info,
      leftIcon,
      rightIcon,
      size = "md",
      variant = "outlined",
      rounded = "md",
      fullWidth = false,
      showPasswordToggle = false,
      loading = false,
      required = false,
      showRequiredIndicator = true,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determine actual input type
    const actualType =
      inputType === "password" && showPassword ? "text" : inputType;

    // Determine status icon
    const StatusIcon = error
      ? AlertCircle
      : success
      ? CheckCircle
      : info
      ? Info
      : null;

    // Status message
    const statusMessage = errorMessage || successMessage || info || helperText;

    return (
      <div className={cn("form-group", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-text mb-1.5",
              error && "text-error",
              success && "text-success",
              disabled && "opacity-50 cursor-not-allowed",
              labelClassName
            )}
          >
            {label}
            {required && showRequiredIndicator && (
              <span className="text-error ml-1">*</span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled || loading}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              // Base styles
              "w-full font-normal text-text placeholder:text-textSecondary/50",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",

              // Variant
              variantClasses[variant],

              // Size
              sizeClasses[size],

              // Rounded
              roundedClasses[rounded],

              // Icon padding
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || StatusIcon || loading) &&
                "pr-10",

              // Error state
              error && "border-error focus:border-error focus:ring-error/20",

              // Success state
              success &&
                "border-success focus:border-success focus:ring-success/20",

              // Full width
              fullWidth && "w-full",

              // Custom className
              className
            )}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Loading Spinner */}
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}

            {/* Password Toggle */}
            {!loading && showPasswordToggle && inputType === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-textSecondary hover:text-text transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Status Icon */}
            {!loading && StatusIcon && (
              <StatusIcon
                className={cn(
                  "w-4 h-4",
                  error && "text-error",
                  success && "text-success",
                  info && "text-primary"
                )}
              />
            )}

            {/* Custom Right Icon */}
            {!loading && rightIcon && !StatusIcon && (
              <div className="text-textSecondary">{rightIcon}</div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <p
            className={cn(
              "mt-1.5 text-sm",
              error && "text-error",
              success && "text-success",
              !error && !success && "text-textSecondary"
            )}
          >
            {statusMessage}
          </p>
        )}
      </div>
    );
  }
);

UnifiedInput.displayName = "UnifiedInput";

// ============================================================================
// TEXTAREA VARIANT
// ============================================================================

export interface UnifiedTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  labelClassName?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  size?: "sm" | "md" | "lg";
  variant?: "outlined" | "filled" | "standard";
  rounded?: "none" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  required?: boolean;
  showRequiredIndicator?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const UnifiedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  UnifiedTextareaProps
>(
  (
    {
      label,
      labelClassName,
      helperText,
      error = false,
      errorMessage,
      success = false,
      successMessage,
      size = "md",
      variant = "outlined",
      rounded = "md",
      fullWidth = false,
      required = false,
      showRequiredIndicator = true,
      maxLength,
      showCharCount = false,
      className,
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const statusMessage = errorMessage || successMessage || helperText;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("form-group", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-text mb-1.5",
              error && "text-error",
              success && "text-success",
              disabled && "opacity-50 cursor-not-allowed",
              labelClassName
            )}
          >
            {label}
            {required && showRequiredIndicator && (
              <span className="text-error ml-1">*</span>
            )}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          className={cn(
            // Base styles
            "w-full font-normal text-text placeholder:text-textSecondary/50",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-y min-h-[100px]",

            // Variant
            variantClasses[variant],

            // Size
            sizeClasses[size],

            // Rounded
            roundedClasses[rounded],

            // Error state
            error && "border-error focus:border-error focus:ring-error/20",

            // Success state
            success &&
              "border-success focus:border-success focus:ring-success/20",

            // Full width
            fullWidth && "w-full",

            // Custom className
            className
          )}
          {...props}
        />

        {/* Bottom Row: Status Message + Char Count */}
        <div className="flex items-center justify-between mt-1.5">
          {/* Status Message */}
          {statusMessage && (
            <p
              className={cn(
                "text-sm",
                error && "text-error",
                success && "text-success",
                !error && !success && "text-textSecondary"
              )}
            >
              {statusMessage}
            </p>
          )}

          {/* Character Count */}
          {showCharCount && maxLength && (
            <p className="text-sm text-textSecondary ml-auto">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

UnifiedTextarea.displayName = "UnifiedTextarea";

export default UnifiedInput;
