"use client";

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
 *
 * // With custom icons
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   SearchIcon={CustomSearchIcon}
 *   ClearIcon={CustomClearIcon}
 * />
 * ```
 */

import { useCallback, useEffect, useState } from "react";

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
  /** Search icon component (injectable) */
  SearchIcon?: React.ComponentType<{ className?: string }>;
  /** Clear icon component (injectable) */
  ClearIcon?: React.ComponentType<{ className?: string }>;
}

const sizeClasses = {
  sm: {
    wrapper: "h-8",
    input: "pl-8 pr-8 py-1 text-sm",
    icon: "left-2 w-4 h-4",
    clear: "right-2 w-4 h-4",
  },
  md: {
    wrapper: "h-10",
    input: "pl-10 pr-10 py-2 text-sm",
    icon: "left-3 w-5 h-5",
    clear: "right-3 w-4 h-4",
  },
  lg: {
    wrapper: "h-12",
    input: "pl-12 pr-12 py-3 text-base",
    icon: "left-4 w-5 h-5",
    clear: "right-4 w-5 h-5",
  },
};

/** Default Search Icon */
const DefaultSearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
      clipRule="evenodd"
    />
  </svg>
);

/** Default Clear Icon (X) */
const DefaultClearIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

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
  SearchIcon = DefaultSearchIcon,
  ClearIcon = DefaultClearIcon,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const classes = sizeClasses[size];

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (debounceMs > 0) {
      const timer = setTimeout(() => {
        if (localValue !== value) {
          onChange(localValue);
        }
      }, debounceMs);
      return () => clearTimeout(timer);
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
    [debounceMs, onChange]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className={`relative ${classes.wrapper} ${className}`}>
      <SearchIcon
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
          <ClearIcon className="w-full h-full" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
