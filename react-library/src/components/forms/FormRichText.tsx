/**
 * FormRichText Component
 * Framework-agnostic wrapper for rich text editors
 *
 * Purpose: Form field wrapper for any rich text editor (Quill, TinyMCE, etc.)
 * Note: Renders children (editor component) with label/error/helper text
 *
 * @example With Custom Editor
 * ```tsx
 * import ReactQuill from 'react-quill';
 *
 * <FormRichText
 *   label="Description"
 *   helperText="Supports bold, italic, lists"
 *   error={errors.description}
 *   required
 * >
 *   <ReactQuill
 *     value={formData.description}
 *     onChange={(value) => setFormData({ ...formData, description: value })}
 *   />
 * </FormRichText>
 * ```
 *
 * @example With Basic Textarea Fallback
 * ```tsx
 * <FormRichText
 *   label="Content"
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Enter content..."
 * />
 * ```
 */

import { ReactNode, useEffect, useState } from "react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface FormRichTextProps {
  /** Field label */
  label?: string;
  /** Helper text below field */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required field indicator */
  required?: boolean;
  /** Editor component (for custom editors) */
  children?: ReactNode;
  /** Value for basic textarea mode */
  value?: string;
  /** onChange for basic textarea mode */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Minimum height */
  minHeight?: string;
  /** Custom className for container */
  className?: string;
}

export function FormRichText({
  label,
  helperText,
  error,
  required = false,
  children,
  value,
  onChange,
  placeholder,
  disabled = false,
  minHeight = "200px",
  className,
}: FormRichTextProps) {
  // Client-side only rendering to avoid SSR issues with rich text editors
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If children provided, render custom editor

  // Otherwise, render basic textarea as fallback
  const renderEditor = () => {
    if (children) {
      return (
        <div
          className={cn(
            "rounded-lg border",
            !!error
              ? "border-red-300 dark:border-red-700"
              : "border-gray-300 dark:border-gray-600",
            disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          {children}
        </div>
      );
    }

    // Fallback textarea
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600",
          "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
          "placeholder-gray-400 dark:placeholder-gray-500",
          !!error
            ? "border-red-300 dark:border-red-700"
            : "border-gray-300 dark:border-gray-600",
          disabled &&
            "bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60",
        )}
        style={{ minHeight }}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={
          error ? "error-text" : helperText ? "helper-text" : undefined
        }
      />
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {!isMounted ? (
        // Show loading skeleton during SSR/hydration
        <div
          className="rounded-lg border border-gray-300 dark:border-gray-600 animate-pulse bg-gray-100 dark:bg-gray-800"
          style={{ minHeight }}
        />
      ) : (
        renderEditor()
      )}

      {helperText && !error && (
        <p
          id="helper-text"
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p id="error-text" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
