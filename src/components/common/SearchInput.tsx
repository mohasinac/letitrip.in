/**
 * @fileoverview React Component
 * @module src/components/common/SearchInput
 * @description This file contains the SearchInput component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * SearchInput Component
 *
 * A reusable search input with icon and clear button.
 * Used across admin pages, sidebars, and filter sections.
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search products..."
 * />
 *
 * // With debounce
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   debounceMs={300}
 * />
 * ```
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchInputProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SearchInputProps
 */
interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Additional CSS classes for wrapper */
  className?: string;
  /** Input size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show clear button */
  showClear?: boolean;
  /** Autofocus the input */
  autoFocus?: boolean;
  /** Disable the input */
  disabled?: boolean;
}

const sizeClasses = {
  /** Sm */
  sm: {
    /** Wrapper */
    wrapper: "h-8",
    /** Input */
    input: "pl-8 pr-8 py-1 text-sm",
    /** Icon */
    icon: "left-2 w-4 h-4",
    /** Clear */
    clear: "right-2 w-4 h-4",
  },
  /** Md */
  md: {
    /** Wrapper */
    wrapper: "h-10",
    /** Input */
    input: "pl-10 pr-10 py-2 text-sm",
    /** Icon */
    icon: "left-3 w-5 h-5",
    /** Clear */
    clear: "right-3 w-4 h-4",
  },
  /** Lg */
  lg: {
    /** Wrapper */
    wrapper: "h-12",
    /** Input */
    input: "pl-12 pr-12 py-3 text-base",
    /** Icon */
    icon: "left-4 w-5 h-5",
    /** Clear */
    clear: "right-4 w-5 h-5",
  },
};

/**
 * Function: Search Input
 */
/**
 * Performs search input operation
 *
 * @returns {any} The searchinput result
 *
 * @example
 * SearchInput();
 */

/**
 * Performs search input operation
 *
 * @returns {any} The searchinput result
 *
 * @example
 * SearchInput();
 */

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 0,
  className = "",
  size = "md",
  showClear = true,
  autoFocus = false,
  disabled = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  /**
 * Performs classes operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The classes result
 *
 */
const classes = sizeClasses[size];

  // Sync local value with external value
  useEffect(() => {
    setLocalVa/**
 * Performs timer operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The timer result
 *
 */
lue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout/**
 * Handles change
 *
 * @param {React.ChangeEvent<HTMLInputElement>} (e - The (e
 *
 * @returns {any} The handlechange result
 *
 */
(() => {
        if (localValue !== value) {
          onChange(localValue);
        }
      }, debounceMs);
      return () => clea/**
 * Handles clear
 *
 * @param {any} ( - The (
 *
 * @returns {any} The handleclear result
 *
 */
rTimeout(timer);
    }
  }, [localValue, debounceMs, onChange, value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      if (debounceMs === 0) {
        onChange(newValue);
      }
    },
    [debounceMs, onChange],
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className={`relative ${classes.wrapper} ${className}`}>
      <Search
        className={`absolute ${classes.icon} top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none`}
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={`w-full ${classes.input} rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {showClear && localValue && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute ${classes.clear} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
          title="Clear search"
        >
          <X className="w-full h-full" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
