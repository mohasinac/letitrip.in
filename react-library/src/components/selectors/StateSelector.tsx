"use client";

/**
 * StateSelector Component
 *
 * A framework-agnostic state selector for Indian states.
 * Uses a searchable dropdown for easy state selection.
 *
 * @example
 * ```tsx
 * <StateSelector
 *   value="Maharashtra"
 *   onChange={(state) => setSelectedState(state)}
 *   states={ALL_INDIAN_STATES}
 * />
 * ```
 */

import React, { useEffect, useRef, useState } from "react";

export interface StateSelectorProps {
  /** Currently selected state */
  value: string;
  /** Callback when state changes */
  onChange: (value: string) => void;
  /** List of states */
  states: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** HTML id attribute */
  id?: string;
  /** HTML name attribute */
  name?: string;
  /** Custom chevron down icon */
  ChevronDownIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom search icon */
  SearchIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default Chevron Down Icon
const DefaultChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Default Search Icon
const DefaultSearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export function StateSelector({
  value,
  onChange,
  states,
  disabled = false,
  required = false,
  error,
  label = "State",
  placeholder = "Select state",
  className = "",
  id,
  name,
  ChevronDownIcon = DefaultChevronDownIcon,
  SearchIcon = DefaultSearchIcon,
}: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter states based on search
  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (state: string) => {
    onChange(state);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 border rounded-lg",
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-white",
          "transition-colors",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-gray-400 dark:hover:border-gray-500",
          isOpen && "ring-2 ring-blue-500"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            value
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {value || placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search states..."
                className={cn(
                  "w-full pl-9 pr-3 py-2 text-sm",
                  "bg-gray-50 dark:bg-gray-900",
                  "border border-gray-300 dark:border-gray-600",
                  "rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "text-gray-900 dark:text-white"
                )}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto">
            {filteredStates.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No states found
              </div>
            ) : (
              <div className="py-1">
                {filteredStates.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleSelect(state)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      "transition-colors",
                      value === state
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {state}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Button */}
          {value && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}

export default StateSelector;
