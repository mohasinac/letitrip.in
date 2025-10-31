"use client";

import React from "react";

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
  variant?: "inline" | "full-width";
}

/**
 * FormActions Component
 * Standardized action buttons for forms
 * Handles submit/cancel with consistent styling
 */
export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,
  className = "",
  variant = "inline",
}: FormActionsProps) {
  return (
    <div
      className={`flex gap-4 ${
        variant === "full-width" ? "justify-between" : "justify-end"
      } ${className}`}
    >
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={`px-4 py-2 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            variant === "full-width" ? "flex-1" : ""
          }`}
        >
          {cancelLabel}
        </button>
      )}
      {onSubmit && (
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            variant === "full-width" ? "flex-1" : ""
          }`}
        >
          {isLoading ? "Loading..." : submitLabel}
        </button>
      )}
    </div>
  );
}

export default FormActions;
