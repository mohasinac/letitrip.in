"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
  showCharCount?: boolean;
  compact?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      className,
      fullWidth = true,
      showCharCount = false,
      compact = false,
      id,
      rows = 4,
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            value={value}
            maxLength={maxLength}
            className={cn(
              "w-full rounded-lg border text-sm transition-colors duration-200",
              compact ? "px-3 py-1.5" : "px-3 py-2",
              "focus:outline-none focus:ring-1",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              props.disabled &&
                "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
              "resize-y",
              leftIcon && "pl-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : helperText
                  ? `${textareaId}-helper`
                  : undefined
            }
            {...props}
          />
        </div>

        {/* Error, Helper Text, or Char Count */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
            {!error && helperText && (
              <p
                id={`${textareaId}-helper`}
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
  },
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
