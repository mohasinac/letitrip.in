"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: FormSelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  /** Use compact sizing (smaller padding). Default: false */
  compact?: boolean;
  /** Show error icon alongside error message. Default: true */
  showErrorIcon?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className,
      fullWidth = true,
      compact = false,
      showErrorIcon = true,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full rounded-lg border appearance-none cursor-pointer",
              "transition-colors duration-200",
              // Responsive sizing: touch-optimized on mobile, compact on desktop
              compact
                ? "px-3 py-1.5 pr-8 text-sm"
                : "min-h-[48px] md:min-h-0 px-4 md:px-3 py-3 md:py-2 pr-10 text-base md:text-sm",
              "focus:outline-none focus:ring-1",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              props.disabled &&
                "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
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

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <ChevronDown className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
          </div>
        </div>

        {/* Error or Helper Text */}
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            {showErrorIcon && (
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${selectId}-helper`}
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
