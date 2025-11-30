"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormListInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  maxItems?: number;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  addButtonText?: string;
}

export function FormListInput({
  label,
  error,
  helperText,
  placeholder = "Add item and press Enter",
  value,
  onChange,
  maxItems,
  required,
  disabled,
  fullWidth = true,
  addButtonText = "Add",
}: FormListInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputId = label?.toLowerCase().replace(/\s+/g, "-") || "list-input";

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    if (maxItems && value.length >= maxItems) return;
    if (value.includes(trimmedValue)) return; // Prevent duplicates

    onChange([...value, trimmedValue]);
    setInputValue("");
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const canAdd = !disabled && (!maxItems || value.length < maxItems);

  return (
    <div className={cn(fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || !canAdd}
            placeholder={placeholder}
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
                "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60"
            )}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd || !inputValue.trim()}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-blue-600 text-white hover:bg-blue-700",
              "disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            )}
          >
            {addButtonText}
          </button>
        </div>

        {/* List Items */}
        {value.length > 0 && (
          <ul className="space-y-1">
            {value.map((item, index) => (
              <li
                key={index}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg",
                  "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                )}
              >
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className={cn(
                    "p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50",
                    "dark:hover:text-red-400 dark:hover:bg-red-900/20",
                    "transition-colors",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
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
          {value.length}/{maxItems} items
        </p>
      )}
    </div>
  );
}

export default FormListInput;
