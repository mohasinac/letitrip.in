"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  validateLink,
  resolveUrl,
  getLinkType,
  type LinkValidationOptions,
  type LinkType,
} from "@/lib/link-utils";

/**
 * Icon for external links
 */
const ExternalIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Icon for internal links
 */
const InternalIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.207 2.232a.75.75 0 00.025 1.06l4.146 3.958H6.375a5.375 5.375 0 000 10.75H9.25a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.06.025z"
      clipRule="evenodd"
    />
  </svg>
);

export interface LinkInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  /** Current link value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Allow external URLs */
  allowExternal?: boolean;
  /** Allow relative paths */
  allowRelative?: boolean;
  /** Only allow internal paths (disables external) */
  onlyInternal?: boolean;
  /** Show the resolved URL preview */
  showPreview?: boolean;
  /** Custom validation function */
  customValidate?: (value: string) => string | undefined;
  /** Validation options */
  validationOptions?: LinkValidationOptions;
  /** Container className */
  containerClassName?: string;
  /** ID for the input */
  id?: string;
  /** Name for the input */
  name?: string;
}

/**
 * LinkInput Component
 *
 * A specialized input for URL/link fields that:
 * - Accepts both relative paths (/products) and full URLs
 * - Shows resolved URL preview
 * - Validates link format
 * - Shows link type indicator (internal/external)
 *
 * @example
 * <LinkInput
 *   label="Button Link"
 *   value={link}
 *   onChange={setLink}
 *   placeholder="e.g., /products or https://..."
 *   showPreview
 * />
 */
export function LinkInput({
  value,
  onChange,
  label,
  helperText,
  error: externalError,
  required,
  allowExternal = true,
  allowRelative = true,
  onlyInternal = false,
  showPreview = true,
  customValidate,
  validationOptions,
  containerClassName = "",
  id,
  name,
  placeholder = "e.g., /products or https://example.com",
  className = "",
  disabled,
  ...props
}: LinkInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Build validation options
  const finalValidationOptions: LinkValidationOptions = useMemo(
    () => ({
      allowRelative,
      allowExternal: onlyInternal ? false : allowExternal,
      allowEmail: !onlyInternal,
      allowPhone: !onlyInternal,
      allowAnchor: true,
      ...validationOptions,
    }),
    [allowRelative, allowExternal, onlyInternal, validationOptions]
  );

  // Validate the current value
  const validation = useMemo(() => {
    if (!value || value.trim() === "") {
      return {
        isValid: true,
        error: undefined,
        type: "internal" as LinkType,
        resolvedUrl: undefined,
        isInternal: true,
      };
    }

    const result = validateLink(value, finalValidationOptions);

    // Check custom validation
    if (result.isValid && customValidate) {
      const customError = customValidate(value);
      if (customError) {
        return {
          ...result,
          isValid: false,
          error: customError,
        };
      }
    }

    return result;
  }, [value, finalValidationOptions, customValidate]);

  // Determine the error to show
  const displayError =
    externalError ||
    (isTouched && !validation.isValid ? validation.error : undefined);

  // Get link type info
  const linkType = value ? getLinkType(value) : null;
  const isInternal = linkType === "internal" || linkType === "anchor";
  const isExternal = linkType === "external";
  const resolvedUrl = value ? resolveUrl(value) : undefined;

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsTouched(true);
  }, []);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Generate unique ID
  const inputId =
    id || name || `link-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Link type indicator */}
        {value && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {isInternal && <InternalIcon className="w-4 h-4 text-blue-500" />}
            {isExternal && <ExternalIcon className="w-4 h-4 text-orange-500" />}
            {linkType === "email" && (
              <span className="text-xs text-gray-400">@</span>
            )}
            {linkType === "phone" && (
              <span className="text-xs text-gray-400">📞</span>
            )}
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!displayError}
          aria-describedby={
            displayError
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          className={`
            w-full px-3 py-2 
            ${value ? "pl-9" : ""}
            border rounded-lg
            text-sm
            transition-colors duration-200
            ${
              displayError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : isFocused
                ? "border-yellow-500 ring-1 ring-yellow-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
            }
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                : "bg-white dark:bg-gray-800"
            }
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Resolved URL preview */}
      {showPreview && value && resolvedUrl && validation.isValid && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Preview:</span>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-md"
            title={resolvedUrl}
          >
            {resolvedUrl}
          </a>
          {isExternal && (
            <span className="text-orange-500 text-xs flex items-center gap-1">
              <ExternalIcon className="w-3 h-3" />
              <span>Opens in new tab</span>
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {displayError}
        </p>
      )}

      {/* Helper text */}
      {helperText && !displayError && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}

      {/* Format hints */}
      {onlyInternal && !helperText && !displayError && (
        <p className="mt-1 text-xs text-gray-400">
          Enter a path starting with / (e.g., /products, /about)
        </p>
      )}
    </div>
  );
}

export default LinkInput;
