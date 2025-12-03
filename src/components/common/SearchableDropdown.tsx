"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useId,
} from "react";

// ============================================
// Types
// ============================================

export interface DropdownOption<T = string> {
  /** Unique value for the option */
  value: T;
  /** Display label */
  label: string;
  /** Optional description/subtitle */
  description?: string;
  /** Optional icon or image */
  icon?: React.ReactNode;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Group name for grouped options */
  group?: string;
}

export interface SearchableDropdownProps<T = string> {
  /** Available options */
  options: DropdownOption<T>[];
  /** Current value (single) or values (multi) */
  value: T | T[] | null;
  /** Callback when selection changes */
  onChange: (value: T | T[] | null) => void;
  /** Selection mode */
  mode?: "single" | "multi";
  /** Placeholder text */
  placeholder?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Text shown when no results match */
  noResultsText?: string;
  /** Enable search functionality */
  searchable?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Label for the dropdown */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Helper text */
  helperText?: string;
  /** Async search function */
  onSearch?: (query: string) => Promise<DropdownOption<T>[]>;
  /** Search debounce delay in ms */
  debounceMs?: number;
  /** Additional CSS classes for container */
  className?: string;
  /** Max height of dropdown menu */
  maxHeight?: number;
  /** Chip display variant (multi mode) */
  chipVariant?: "default" | "outline" | "filled";
  /** Allow creating new options */
  creatable?: boolean;
  /** Callback when new option is created */
  onCreate?: (value: string) => void;
  /** Minimum characters before showing options */
  minSearchLength?: number;
  /** Custom render for option */
  renderOption?: (
    option: DropdownOption<T>,
    isSelected: boolean,
  ) => React.ReactNode;
  /** Name for form submission */
  name?: string;
  /** ID for the dropdown */
  id?: string;
}

// ============================================
// Utility Components
// ============================================

/** Chevron Down Icon */
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

/** Check Icon */
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
      clipRule="evenodd"
    />
  </svg>
);

/** X Icon for chips */
const XIcon = ({ className }: { className?: string }) => (
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

/** Search Icon */
const SearchIcon = ({ className }: { className?: string }) => (
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

/** Spinner Icon */
const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================
// Chip Component
// ============================================

interface ChipProps {
  label: string;
  onRemove: () => void;
  variant?: "default" | "outline" | "filled";
  disabled?: boolean;
}

const Chip = ({
  label,
  onRemove,
  variant = "default",
  disabled,
}: ChipProps) => {
  const variantClasses = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200",
    outline:
      "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200",
    filled:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm
        ${variantClasses[variant]}
        ${disabled ? "opacity-50" : ""}
      `}
    >
      <span className="truncate max-w-[150px]">{label}</span>
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="
            ml-0.5 p-0.5 rounded-full
            hover:bg-gray-200 dark:hover:bg-gray-600
            focus:outline-none focus:ring-1 focus:ring-gray-400
            transition-colors
          "
          aria-label={`Remove ${label}`}
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

// ============================================
// Main Component
// ============================================

function SearchableDropdownInner<T = string>(
  {
    options,
    value,
    onChange,
    mode = "single",
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    noResultsText = "No results found",
    searchable = true,
    clearable = true,
    loading = false,
    disabled = false,
    error,
    label,
    required,
    helperText,
    onSearch,
    debounceMs = 300,
    className = "",
    maxHeight = 300,
    chipVariant = "default",
    creatable = false,
    onCreate,
    minSearchLength = 0,
    renderOption,
    name,
    id,
  }: SearchableDropdownProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [asyncOptions, setAsyncOptions] = useState<DropdownOption<T>[]>([]);
  const [asyncLoading, setAsyncLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if value is an array (multi mode)
  const isMulti = mode === "multi";
  const selectedValues = useMemo(() => {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // Get the options to display (async or static)
  const displayOptions = useMemo(() => {
    return onSearch ? asyncOptions : options;
  }, [onSearch, asyncOptions, options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery || searchQuery.length < minSearchLength) {
      return displayOptions;
    }

    const query = searchQuery.toLowerCase();
    return displayOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query),
    );
  }, [displayOptions, searchQuery, minSearchLength]);

  // Group options if they have group property
  const groupedOptions = useMemo(() => {
    const groups = new Map<string, DropdownOption<T>[]>();
    const ungrouped: DropdownOption<T>[] = [];

    filteredOptions.forEach((option) => {
      if (option.group) {
        const group = groups.get(option.group) || [];
        group.push(option);
        groups.set(option.group, group);
      } else {
        ungrouped.push(option);
      }
    });

    return { groups, ungrouped };
  }, [filteredOptions]);

  // Check if an option is selected
  const isSelected = useCallback(
    (optionValue: T) => {
      return selectedValues.some((v) => v === optionValue);
    },
    [selectedValues],
  );

  // Get label for a value
  const getLabelForValue = useCallback(
    (val: T): string => {
      const option = options.find((o) => o.value === val);
      return option?.label || String(val);
    },
    [options],
  );

  // Handle option selection
  const handleSelect = useCallback(
    (optionValue: T) => {
      if (isMulti) {
        const newValues = isSelected(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
        onChange(newValues.length > 0 ? newValues : null);
      } else {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [isMulti, isSelected, selectedValues, onChange],
  );

  // Handle chip removal
  const handleRemove = useCallback(
    (val: T) => {
      if (isMulti) {
        const newValues = selectedValues.filter((v) => v !== val);
        onChange(newValues.length > 0 ? newValues : null);
      } else {
        onChange(null);
      }
    },
    [isMulti, selectedValues, onChange],
  );

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onChange(null);
    setSearchQuery("");
  }, [onChange]);

  // Handle async search
  useEffect(() => {
    if (!onSearch || !isOpen) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < minSearchLength) {
      setAsyncOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setAsyncLoading(true);
      try {
        const results = await onSearch(searchQuery);
        setAsyncOptions(results);
      } catch (error) {
        console.error("Search error:", error);
        setAsyncOptions([]);
      } finally {
        setAsyncLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, onSearch, debounceMs, isOpen, minSearchLength]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0,
            );
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1,
            );
          }
          break;

        case "Enter":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            const option = filteredOptions[highlightedIndex];
            if (!option.disabled) {
              handleSelect(option.value);
            }
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          break;

        case "Backspace":
          if (isMulti && searchQuery === "" && selectedValues.length > 0) {
            const lastValue = selectedValues.at(-1);
            if (lastValue !== undefined) {
              handleRemove(lastValue);
            }
          }
          break;

        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [
      disabled,
      isOpen,
      filteredOptions,
      highlightedIndex,
      handleSelect,
      isMulti,
      searchQuery,
      selectedValues,
      handleRemove,
    ],
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions.length]);

  const isLoading = loading || asyncLoading;
  const hasValue = selectedValues.length > 0;
  const showClear = clearable && hasValue && !disabled;

  // Render trigger content
  const renderTriggerContent = () => {
    if (isMulti && hasValue) {
      return (
        <div className="flex flex-wrap gap-1 py-0.5">
          {selectedValues.map((val) => (
            <Chip
              key={String(val)}
              label={getLabelForValue(val)}
              onRemove={() => handleRemove(val)}
              variant={chipVariant}
              disabled={disabled}
            />
          ))}
        </div>
      );
    }

    if (!isMulti && hasValue) {
      return (
        <span className="truncate text-gray-900 dark:text-gray-100">
          {getLabelForValue(selectedValues[0])}
        </span>
      );
    }

    return (
      <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
    );
  };

  // Render option
  const renderOptionItem = (option: DropdownOption<T>, index: number) => {
    const selected = isSelected(option.value);
    const highlighted = index === highlightedIndex;

    if (renderOption) {
      return renderOption(option, selected);
    }

    return (
      <li
        key={String(option.value)}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled}
        onClick={() => !option.disabled && handleSelect(option.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && !option.disabled && handleSelect(option.value)
        }
        onMouseEnter={() => setHighlightedIndex(index)}
        onFocus={() => setHighlightedIndex(index)}
        tabIndex={option.disabled ? -1 : 0}
        className={`
          flex items-center gap-3 px-3 py-2 cursor-pointer
          ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${highlighted ? "bg-gray-100 dark:bg-gray-700" : ""}
          ${
            selected && !highlighted ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
          }
          transition-colors
        `}
      >
        {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
            {option.label}
          </div>
          {option.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {option.description}
            </div>
          )}
        </div>
        {selected && (
          <CheckIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        )}
      </li>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        ref={ref}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${inputId}-listbox`}
        aria-labelledby={label ? `${inputId}-label` : undefined}
        aria-disabled={disabled}
        aria-invalid={!!error}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          relative w-full min-h-[42px] px-3 py-2
          flex items-center gap-2
          border rounded-lg
          cursor-pointer
          transition-colors duration-200
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              : "bg-white dark:bg-gray-800"
          }
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : isOpen
                ? "border-yellow-500 ring-1 ring-yellow-500"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          focus:outline-none focus:ring-1 focus:ring-yellow-500
        `}
      >
        <div className="flex-1 min-w-0">{renderTriggerContent()}</div>

        {/* Clear button */}
        {showClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Clear selection"
          >
            <XIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Loading or chevron */}
        {isLoading ? (
          <SpinnerIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-1
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            overflow-hidden
          "
        >
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="
                    w-full pl-9 pr-3 py-2
                    text-sm
                    border border-gray-200 dark:border-gray-600
                    rounded-md
                    bg-white dark:bg-gray-700
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500
                  "
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <ul
            ref={listRef}
            id={`${inputId}-listbox`}
            role="listbox"
            aria-multiselectable={isMulti}
            className="overflow-auto"
            style={{ maxHeight }}
          >
            {isLoading && (
              <li className="px-3 py-4 text-center text-gray-500">
                <SpinnerIcon className="w-5 h-5 mx-auto" />
              </li>
            )}

            {!isLoading && filteredOptions.length === 0 && (
              <li className="px-3 py-4 text-center text-gray-500 text-sm">
                {noResultsText}
                {creatable && searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreate?.(searchQuery);
                      setSearchQuery("");
                    }}
                    className="block mx-auto mt-2 text-yellow-600 hover:text-yellow-700"
                  >
                    Create &ldquo;{searchQuery}&rdquo;
                  </button>
                )}
              </li>
            )}

            {!isLoading &&
              groupedOptions.ungrouped.length > 0 &&
              groupedOptions.ungrouped.map((option, index) =>
                renderOptionItem(option, index),
              )}

            {!isLoading &&
              Array.from(groupedOptions.groups.entries()).map(
                ([groupName, groupOptions]) => (
                  <li key={groupName}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 sticky top-0">
                      {groupName}
                    </div>
                    <ul>
                      {groupOptions.map((option, index) =>
                        renderOptionItem(
                          option,
                          groupedOptions.ungrouped.length + index,
                        ),
                      )}
                    </ul>
                  </li>
                ),
              )}
          </ul>

          {/* Multi-select actions */}
          {isMulti && hasValue && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {selectedValues.length} selected
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={isMulti ? JSON.stringify(selectedValues) : String(value ?? "")}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Export with forwardRef
export const SearchableDropdown = forwardRef(SearchableDropdownInner) as <
  T = string,
>(
  props: SearchableDropdownProps<T> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  },
) => React.ReactElement;

export default SearchableDropdown;
