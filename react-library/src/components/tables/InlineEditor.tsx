"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Props for InlineEditor component
 */
export interface InlineEditorProps {
  /** Current value to display/edit */
  value: string;
  /** Callback when value is saved */
  onSave: (value: string) => Promise<void> | void;
  /** Callback when edit is cancelled */
  onCancel?: () => void;
  /** Input type */
  type?: "text" | "number" | "textarea" | "select";
  /** Select options (required if type is "select") */
  options?: { label: string; value: string | number }[];
  /** Placeholder text */
  placeholder?: string;
  /** Custom renderer for display mode */
  displayRenderer?: (value: string) => React.ReactNode;
  /** Custom className for the component */
  className?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Maximum length for text inputs */
  maxLength?: number;
  /** Number of rows for textarea */
  rows?: number;
  /** Edit/pencil icon component (default: SVG pencil) */
  EditIcon?: React.ComponentType<any>;
  /** Save/check icon component (default: SVG checkmark) */
  SaveIcon?: React.ComponentType<any>;
  /** Cancel/X icon component (default: SVG X) */
  CancelIcon?: React.ComponentType<any>;
  /** Error handler callback */
  onError?: (error: Error, context?: string) => void;
  /** Custom display className */
  displayClassName?: string;
  /** Custom input className */
  inputClassName?: string;
}

// Default icons
const DefaultEditIcon = () => (
  <svg
    className="w-4 h-4"
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
);

const DefaultSaveIcon = () => (
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
);

const DefaultCancelIcon = () => (
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
);

/**
 * InlineEditor - Click-to-edit component for inline editing
 *
 * A component that displays a value and allows editing it inline with a click.
 * Supports text, number, textarea, and select inputs.
 *
 * @example
 * ```tsx
 * <InlineEditor
 *   value="Click to edit"
 *   onSave={async (value) => { await updateName(value); }}
 *   placeholder="Enter name..."
 * />
 * ```
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
  EditIcon = DefaultEditIcon,
  SaveIcon = DefaultSaveIcon,
  CancelIcon = DefaultCancelIcon,
  onError,
  displayClassName = "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
  inputClassName = "flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save";
      setError(errorMessage);
      if (onError) {
        onError(
          err instanceof Error ? err : new Error(errorMessage),
          "InlineEditor.handleSave"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
    onCancel?.();
  };

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
        aria-label="Click to edit"
        className={`inline-flex items-center gap-2 ${
          disabled ? "cursor-not-allowed opacity-50" : displayClassName
        } px-2 py-1 rounded transition-colors ${className}`}
      >
        <span className="text-gray-900 dark:text-gray-100">
          {displayRenderer ? displayRenderer(value) : value || placeholder}
        </span>
        {!disabled && (
          <span className="text-gray-400 dark:text-gray-500">
            <EditIcon />
          </span>
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
            className={inputClassName}
            aria-label={placeholder || "Edit text"}
          />
        ) : type === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            required={required}
            className={inputClassName}
            aria-label={placeholder || "Select option"}
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
            className={inputClassName}
            aria-label={placeholder || "Edit value"}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Save (Enter)"
            type="button"
            aria-label="Save"
          >
            <SaveIcon />
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Cancel (Esc)"
            type="button"
            aria-label="Cancel"
          >
            <CancelIcon />
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
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
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
