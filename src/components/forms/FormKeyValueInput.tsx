/**
 * @fileoverview React Component
 * @module src/components/forms/FormKeyValueInput
 * @description This file contains the FormKeyValueInput component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FormKeyValueInputProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormKeyValueInputProps
 */
export interface FormKeyValueInputProps {
  /** Label */
  label?: string;
  /** Error */
  error?: string;
  /** Helper Text */
  helperText?: string;
  /** Key Placeholder */
  keyPlaceholder?: string;
  /** Value Placeholder */
  valuePlaceholder?: string;
  /** Value */
  value: Record<string, string>;
  /** On Change */
  onChange: (value: Record<string, string>) => void;
  /** Max Items */
  maxItems?: number;
  /** Required */
  required?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Full Width */
  fullWidth?: boolean;
  /** Add Button Text */
  addButtonText?: string;
}

/**
 * Function: Form Key Value Input
 */
/**
 * Performs form key value input operation
 *
 * @returns {any} The formkeyvalueinput result
 *
 * @example
 * FormKeyValueInput();
 */

/**
 * Performs form key value input operation
 *
 * @returns {any} The formkeyvalueinput result
 *
 * @example
 * FormKeyValueInput();
 */

export function FormKeyValueInput({
  label,
  error,
  helperText,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  value,
  onChange,
  maxItems,
  required,
  disabled,
  fullWidth = true,
  addButtonText = "Add",
}: FormKeyValueInputProps) {
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const keyInputId =
    label?.toLowerCase().replace(/\s+/g, "-") + "-key" || "key-input";
  const valueInputId =
    label?.toLowerCase().replace(/\s+/g, "-") + "-value" || "value-input";

  const entries = Object.entries(value);
  const canAdd = !disabled && (!maxItems || entries.length < maxItems);

  /**
   * Handles add event
   *
   * @returns {any} The handleadd result
   */

  /**
   * Handles add event
   *
   * @returns {any} The handleadd result
   */

  const handleAdd = () => {
    const trimmedKey = keyInput.trim();
    const trimmedValue = valueInput.trim();
    if (!trimmedKey || !trimmedValue) return;
    if (!canAdd) return;

    onChange({
      ...value,
      [trimmedKey]: trimmedValue,
    });
    setKeyInput("");
    setValueInput("");
  };

  /**
   * Handles remove event
   *
   * @param {string} key - The key
   *
   * @returns {string} The handleremove result
   */

  /**
   * Handles remove event
   *
   * @param {string} key - The key
   *
   * @returns {string} The handleremove result
   */

  const handleRemove = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  /**
   * Handles key down event
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlekeydown result
   */

  /**
   * Handles key down event
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlekeydown result
   */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={cn(fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={keyInputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            id={keyInputId}
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || !canAdd}
            placeholder={keyPlaceholder}
            aria-invalid={!!error}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors duration-200",
              "focus:outline-none focus:ring-1",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
              "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              disabled &&
                "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex gap-2">
            <input
              id={valueInputId}
              type="text"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || !canAdd}
              placeholder={valuePlaceholder}
              aria-invalid={!!error}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors duration-200",
                "focus:outline-none focus:ring-1",
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                disabled &&
                  "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60",
              )}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd || !keyInput.trim() || !valueInput.trim()}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-blue-600 text-white hover:bg-blue-700",
                "disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed",
              )}
            >
              {addButtonText}
            </button>
          </div>
        </div>

        {/* Table of Key-Value Pairs */}
        {entries.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map(([key, val]) => (
                  <tr
                    key={key}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      {key}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {val}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(key)}
                        disabled={disabled}
                        className={cn(
                          "p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50",
                          "dark:hover:text-red-400 dark:hover:bg-red-900/20",
                          "transition-colors",
                          disabled && "cursor-not-allowed opacity-50",
                        )}
                        aria-label={`Remove ${key}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error or Helper Text */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
      {maxItems && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {entries.length}/{maxItems} items
        </p>
      )}
    </div>
  );
}

export default FormKeyValueInput;
