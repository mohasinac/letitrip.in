/**
 * @fileoverview React Component
 * @module src/components/common/SlugInput
 * @description This file contains the SlugInput component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Slug Input Component
 * Auto-generates URL-friendly slugs from titles
 * Allows manual editing and shows preview URL
 */

interface SlugInputProps {
  /** Id */
  id?: string;
  /** Value */
  value: string;
  /** On Change */
  onChange: (slug: string) => void;
  /** SourceText */
  sourceText?: string; // Text to auto-generate slug from (e.g., title)
  /** BaseUrl */
  baseUrl?: string; // Base URL for preview
  /** Placeholder */
  placeholder?: string;
  /** Disabled */
  disabled?: boolean;
  /** Error */
  error?: string;
  /** ValidateUnique */
  validateUnique?: (slug: string) => Promise<boolean>; // Check if slug is unique
  /** Max Length */
  maxLength?: number;
  /** Prefix */
  prefix?: string; // Optional prefix (e.g., "product-", "shop-")
  /** Suffix */
  suffix?: string; // Optional suffix (e.g., "-2024")
  /** Show Preview */
  showPreview?: boolean;
  /** Allow Manual Edit */
  allowManualEdit?: boolean;
  /** Class Name */
  className?: string;
}

// Generate slug from text
/**
 * Function: Generate Slug
 */
/**
 * Performs generate slug operation
 *
 * @param {string} text - The text
 * @param {string} [prefix] - The prefix
 * @param {string} [suffix] - The suffix
 *
 * @returns {string} The slug result
 */

/**
 * Performs generate slug operation
 *
 * @param {string} text - The text
 * @param {string} [prefix] - The prefix
 * @param {string} [suffix] - The suffix
 *
 * @returns {string} The slug result
 */

function generateSlug(text: string, prefix = "", suffix = ""): string {
  if (!text) return "";

  let slug = text
    .toLowerCase()
    .trim()
    // Replace spaces and special chars with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  if (prefix) slug = `${prefix}${slug}`;
  if (suffix) slug = `${slug}${suffix}`;

  return slug;
}

export default /**
 * Performs slug input operation
 *
 * @param {SlugInputProps} [{
  value,
  onChange,
  sourceText,
  baseUrl = "https] - The {
  value,
  onchange,
  sourcetext,
  baseurl = "https
 *
 * @returns {any} The sluginput result
 *
 */
function SlugInput({
  value,
  onChange,
  sourceText,
  baseUrl = "https://letitrip.in",
  placeholder = "auto-generated-slug",
  disabled = false,
  error,
  validateUnique,
  maxLength = 100,
  prefix = "",
  suffix = "",
  showPreview = true,
  allowManualEdit = true,
  className = "",
}: SlugInputProps) {
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value);

  // Auto-generate slug from source text
  useEffect(() => {
    if (!isManualEdit && sourceText) {
      const newSlug = generateSlug(sourceText, prefix, suffix);
      if (newSlug !== localValue) {
        setLocalValue(newSlug);
        onChange(newSlug);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText, prefix, suffix, isManualEdit]);

  // Validate uniqueness with debounce
  useEffect(() => {
    if (!validateUnique || !localValue) return;

    /**
 * Performs timeout id operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The timeoutid result
 *
 */
const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const isUnique = await validateUnique(localValue);
        if (!isUnique) {
          setValidationError("This slug is already taken");
        }
      } catch (err) {
        setValidationError("Failed to validate slug");
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue, validateUnique]);

  // Handle input change
  /**
   * Handles change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlechange result
   */

  /**
   * Handles change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlechange result
   */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const slugValue = generateSlug(newValue, prefix, suffix);
    setLocalValue(slugValue);
    onChange(slugValue);
    setIsManualEdit(true);
  };

  // Handle regenerate
  /**
   * Handles regenerate event
   *
   * @returns {any} The handleregenerate result
   */

  /**
   * Handles regenerate event
   *
   * @returns {any} The handleregenerate result
   */

  const handleRegenerate = () => {
    if (sourceText) {
      const newSlug = generateSlug(sourceText, pref/**
 * Performs preview url operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The previewurl result
 *
 */
ix, suffix);
      setLocalValue(newSlug);
      onChange(newSlug);
      setIsManualEdit(false);
    }
  };

  // Full preview U/**
 * Checks if valid format
 *
 * @param {any} ( - The (
 *
 * @returns {any} The isvalidformat result
 *
 */
RL
  const previewUrl = useMemo(() => {
    if (!localValue) return "";
    return `${baseUrl}/${localValue}`;
  }, [baseUrl, localValue]);

  // Get display error
  const displayError = error || validationError;

  // Check if slug is valid format
  const isValidFormat = useMemo(() => {
    if (!localValue) return false;
    // Only lowercase alphanumeric and hyphens
    return /^[a-z0-9-]+$/.test(localValue);
  }, [localValue]);

  return (
    <div className={`slug-input ${className}`}>
      {/* Input container */}
      <div className="relative">
        <div
          className={`
          flex items-center gap-2 border rounded-lg overflow-hidden
          ${disabled ? "bg-gray-100" : "bg-white"}
          ${displayError ? "border-red-500" : "border-gray-300"}
          ${!disabled && "focus-within:ring-2 focus-within:ring-blue-500"}
        `}
        >
          {/* Prefix indicator */}
          {prefix && (
            <span className="px-3 text-gray-500 text-sm bg-gray-50 border-r border-gray-300">
              {prefix}
            </span>
          )}

          {/* Input */}
          <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled || !allowManualEdit}
            maxLength={maxLength}
            className={`
              flex-1 px-4 py-2 outline-none bg-white text-gray-900
              ${
                disabled || !allowManualEdit
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }
              font-mono text-sm
            `}
          />

          {/* Suffix indicator */}
          {suffix && (
            <span className="px-3 text-gray-500 text-sm bg-gray-50 border-l border-gray-300">
              {suffix}
            </span>
          )}

          {/* Validation status */}
          <div className="px-3 flex items-center gap-2">
            {isValidating && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            )}

            {!isValidating &&
              isValidFormat &&
              !validationError &&
              localValue && (
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}

            {!isValidating && validationError && (
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Regenerate button */}
        {allowManualEdit && sourceText && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={disabled}
            className={`
              absolute right-16 top-1/2 -translate-y-1/2
              px-2 py-1 text-xs rounded
              bg-gray-100 hover:bg-gray-200
              text-gray-700
              /** Disabled */
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            title="Regenerate from title"
          >
            ↻ Auto
          </button>
        )}
      </div>

      {/* Preview URL */}
      {showPreview && localValue && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-gray-600400">Preview:</span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-mono flex-1 truncate"
          >
            {previewUrl}
          </a>

          {/* Copy button */}
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(previewUrl)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Copy URL"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Helper text / Error */}
      <div className="mt-1 text-sm">
        {displayError ? (
          <span className="text-red-600400">{displayError}</span>
        ) : isManualEdit ? (
          <span className="text-gray-500400">
            Manual edit mode. Click "Auto" to regenerate from title.
          </span>
        ) : (
          <span className="text-gray-500400">
            Auto-generated from title. You can edit manually.
          </span>
        )}
      </div>

      {/* Format requirements */}
      {!isValidFormat && localValue && (
        <div className="mt-1 text-xs text-orange-600">
          ⚠ Slug should only contain lowercase letters, numbers, and hyphens
        </div>
      )}
    </div>
  );
}
