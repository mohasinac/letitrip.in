"use client";

import {
  sanitizeHtml,
  SanitizeHtmlOptions,
  sanitizeString,
} from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

export interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
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
  sanitizeType?: "string" | "html";
  /**
   * Options for HTML sanitization (only when sanitizeType='html')
   */
  sanitizeHtmlOptions?: SanitizeHtmlOptions;
  /**
   * Callback when value is sanitized
   */
  onSanitize?: (sanitizedValue: string) => void;
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
      sanitize = false,
      sanitizeType = "string",
      sanitizeHtmlOptions,
      onSanitize,
      onBlur,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const currentLength = typeof value === "string" ? value.length : 0;
    const prevErrorRef = useRef<string | undefined>();

    // Announce errors to screen readers
    useEffect(() => {
      if (error && error !== prevErrorRef.current) {
        announceToScreenReader(`Error: ${error}`, "assertive");
      }
      prevErrorRef.current = error;
    }, [error]);

    // Handle sanitization on blur
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (sanitize && typeof e.target.value === "string") {
        let sanitizedValue = e.target.value;

        // Apply sanitization based on type
        if (sanitizeType === "html") {
          sanitizedValue = sanitizeHtml(e.target.value, sanitizeHtmlOptions);
        } else {
          sanitizedValue = sanitizeString(e.target.value, {
            maxLength,
          });
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
              className
            )}
            aria-invalid={!!error}
            aria-required={props.required}
            aria-label={!label ? props.placeholder || "Text area" : undefined}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : helperText
                ? `${textareaId}-helper`
                : undefined
            }
            onBlur={handleBlur}
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
                aria-live="polite"
                aria-atomic="true"
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
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
