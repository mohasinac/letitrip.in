"use client";

import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeString,
  sanitizeUrl,
} from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: string;
  rightAddon?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  compact?: boolean;
  /**
   * Enable auto-sanitization on blur
   * @default false
   */
  sanitize?: boolean;
  /**
   * Type of sanitization to apply
   * @default 'string'
   */
  sanitizeType?: "string" | "email" | "phone" | "url";
  /**
   * Callback when value is sanitized
   */
  onSanitize?: (sanitizedValue: string) => void;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      className,
      fullWidth = true,
      showCharCount = false,
      compact = false,
      id,
      type = "text",
      maxLength,
      value,
      sanitize = false,
      sanitizeType = "string",
      onSanitize,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const currentLength = typeof value === "string" ? value.length : 0;

    // Handle sanitization on blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (sanitize && typeof e.target.value === "string") {
        let sanitizedValue = e.target.value;

        // Apply sanitization based on type
        switch (sanitizeType) {
          case "email":
            sanitizedValue = sanitizeEmail(e.target.value);
            break;
          case "phone":
            sanitizedValue = sanitizePhone(e.target.value);
            break;
          case "url":
            sanitizedValue = sanitizeUrl(e.target.value);
            break;
          case "string":
          default:
            sanitizedValue = sanitizeString(e.target.value, {
              maxLength,
            });
            break;
        }

        // Call onSanitize callback if value changed
        if (sanitizedValue !== e.target.value && onSanitize) {
          onSanitize(sanitizedValue);
        }
      }

      // Call original onBlur if provided
      if (onBlur) {
        onBlur(e);
      }
    };

    const baseInputClasses = cn(
      "w-full rounded-lg border text-sm transition-colors duration-200",
      "focus:outline-none focus:ring-1",
      compact ? "px-3 py-1.5" : "px-3 py-2",
      error
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
      "placeholder:text-gray-400 dark:placeholder:text-gray-500",
      props.disabled &&
        "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      leftAddon && "rounded-l-none",
      rightAddon && "rounded-r-none",
      className
    );

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex">
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              {leftAddon}
            </span>
          )}

          <div className="relative flex-1">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                {leftIcon}
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              type={type}
              value={value}
              maxLength={maxLength}
              className={baseInputClasses}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${inputId}-error`
                  : helperText
                  ? `${inputId}-helper`
                  : undefined
              }
              onBlur={handleBlur}
              {...props}
            />

            {rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                {rightIcon}
              </div>
            )}
          </div>

          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              {rightAddon}
            </span>
          )}
        </div>

        {/* Error or Helper Text */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${inputId}-error`}
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
            {!error && helperText && (
              <p
                id={`${inputId}-helper`}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
