"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  /** Compact mode for desktop, larger for mobile by default */
  size?: "sm" | "md" | "lg";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = true,
      size = "md",
      className = "",
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const sizeClasses = {
      sm: "px-3 py-1.5 pr-8 text-sm",
      md: "px-4 py-2 md:py-2 pr-10 min-h-[44px] md:min-h-0 text-base",
      lg: "px-4 py-3 pr-10 min-h-[48px] text-base",
    };

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Base styles
              "w-full border rounded-lg appearance-none cursor-pointer",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              "transition-colors duration-200 touch-manipulation",
              // Focus styles
              "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
              // Disabled styles
              "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400",
              // Error styles
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-600",
              // Size styles
              sizeClasses[size],
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 md:mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${selectId}-helper`}
            className="mt-1 md:mt-1.5 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
