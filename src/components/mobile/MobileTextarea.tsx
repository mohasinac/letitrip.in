"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface MobileTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const MobileTextarea = forwardRef<
  HTMLTextAreaElement,
  MobileTextareaProps
>(
  (
    {
      label,
      error,
      helperText,
      className,
      fullWidth = true,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn(fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            // Base styles - touch optimized
            "w-full min-h-[96px] px-4 py-3",
            "text-base text-gray-900 placeholder:text-gray-400",
            "bg-white border rounded-lg",
            "transition-colors duration-200",
            // Touch friendly
            "touch-manipulation",
            // Focus styles
            "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500",
            // Error styles
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300",
            // Disabled styles
            props.disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
            // Resize
            "resize-y",
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

        {/* Error Message */}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
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
            {error}
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p
            id={`${textareaId}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MobileTextarea.displayName = "MobileTextarea";
