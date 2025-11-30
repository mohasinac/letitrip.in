"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  /** Use compact sizing (smaller padding). Default: false */
  compact?: boolean;
  /** Show error icon alongside error message. Default: true */
  showErrorIcon?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      fullWidth = true,
      showCharCount = false,
      compact = false,
      showErrorIcon = true,
      id,
      rows = 4,
      maxLength,
      value,
      ...props
    },
    ref
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

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          className={cn(
            "w-full rounded-lg border transition-colors duration-200",
            "focus:outline-none focus:ring-1",
            // Responsive sizing: touch-optimized on mobile, compact on desktop
            compact
              ? "px-3 py-1.5 text-sm"
              : "min-h-[96px] md:min-h-0 px-4 md:px-3 py-3 md:py-2 text-base md:text-sm",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            props.disabled &&
              "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
            "resize-y touch-manipulation",
            className
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

        {/* Error, Helper Text, or Char Count */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
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
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
