/**
 * @fileoverview React Component
 * @module src/components/common/InlineEditor
 * @description This file contains the InlineEditor component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState, useRef, useEffect } from "react";

/**
 * InlineEditorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for InlineEditorProps
 */
export interface InlineEditorProps {
  /** Value */
  value: string;
  /** On Save */
  onSave: (value: string) => Promise<void> | void;
  /** On Cancel */
  onCancel?: () => void;
  /** Type */
  type?: "text" | "number" | "textarea" | "select";
  /** Options */
  options?: { label: string; value: string | number }[];
  /** Placeholder */
  placeholder?: string;
  /** Display Renderer */
  displayRenderer?: (value: string) => React.ReactNode;
  /** Class Name */
  className?: string;
  /** Disabled */
  disabled?: boolean;
  /** Required */
  required?: boolean;
  /** Max Length */
  maxLength?: number;
  /** Rows */
  rows?: number;
}

/**
 * Function: Inline Editor
 */
/**
 * Performs inline editor operation
 *
 * @returns {any} The inlineeditor result
 *
 * @example
 * InlineEditor();
 */

/**
 * Performs inline editor operation
 *
 * @returns {any} The inlineeditor result
 *
 * @example
 * InlineEditor();
 */

export function InlineEditor({
  value,
  onSave,
  onCancel,
  type = "text",
  options = [],
  placeholder = "Click to edit",
  displayRenderer,
  className = "",
  disabled = false,
  required = false,
  maxLength,
  rows = 3,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "text" || type === "textarea") {
        (inputRef.current as HTMLInputElement | HTMLTextAreaElement).select();
      }
    }
  }, [isEditing, type]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async () => {
    if (required && !editValue.trim()) {
      setError("This field is required");
      return;
    }

    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles cancel event
   *
   * @returns {any} The handlecancel result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Handles cancel event
   *
   * @returns {any} The handlecancel result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
    onCancel?.();
  };

  /**
   * Handles key down event
   *
   * @param {React.KeyboardEvent} e - The e
   *
   * @returns {any} The handlekeydown result
   */

  /**
   * Handles key down event
   *
   * @param {React.KeyboardEvent} e - The e
   *
   * @returns {any} The handlekeydown result
   */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    } else if (e.key === "Enter" && e.ctrlKey && type === "textarea") {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => !disabled && setIsEditing(true)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && setIsEditing(true)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={`inline-flex items-center gap-2 ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        } px-2 py-1 rounded transition-colors ${className}`}
      >
        <span className="text-gray-900 dark:text-gray-100">
          {displayRenderer ? displayRenderer(value) : value || placeholder}
        </span>
        {!disabled && (
          <svg
            className="w-4 h-4 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-start gap-2">
        {type === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            required={required}
            maxLength={maxLength}
            rows={rows}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        ) : type === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            required={required}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            required={required}
            maxLength={maxLength}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Save (Enter)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Cancel (Esc)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Helper Text */}
      {type === "textarea" && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Press Ctrl+Enter to save, Esc to cancel
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Character Count */}
      {maxLength && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {editValue.length} / {maxLength}
        </p>
      )}
    </div>
  );
}
