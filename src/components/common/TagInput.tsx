"use client";

import React, { useState, useRef, useCallback, KeyboardEvent } from "react";

/**
 * Tag Input Component
 * For entering keywords, product tags, meta keywords, etc.
 * Supports autocomplete suggestions and duplicate prevention
 */

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  maxTags?: number;
  maxTagLength?: number;
  minTagLength?: number;
  allowDuplicates?: boolean;
  suggestions?: string[];
  caseSensitive?: boolean;
  delimiter?: string | RegExp;
  className?: string;
}

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Type and press Enter...",
  disabled = false,
  error,
  maxTags,
  maxTagLength = 50,
  minTagLength = 2,
  allowDuplicates = false,
  suggestions = [],
  caseSensitive = false,
  delimiter = ",",
  className = "",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((suggestion) => {
    const input = caseSensitive ? inputValue : inputValue.toLowerCase();
    const sug = caseSensitive ? suggestion : suggestion.toLowerCase();
    return input && sug.includes(input) && !value.includes(suggestion);
  });

  // Add a tag
  const addTag = useCallback(
    (tag: string) => {
      if (disabled) return;

      // Trim and validate
      const trimmedTag = tag.trim();
      if (!trimmedTag) return;
      if (trimmedTag.length < minTagLength) return;
      if (trimmedTag.length > maxTagLength) return;
      if (maxTags && value.length >= maxTags) return;

      // Check duplicates
      const normalizedTag = caseSensitive
        ? trimmedTag
        : trimmedTag.toLowerCase();
      const normalizedTags = caseSensitive
        ? value
        : value.map((t) => t.toLowerCase());
      if (!allowDuplicates && normalizedTags.includes(normalizedTag)) {
        setInputValue("");
        return;
      }

      onChange([...value, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
      setSelectedSuggestionIndex(0);
    },
    [
      disabled,
      minTagLength,
      maxTagLength,
      maxTags,
      value,
      caseSensitive,
      allowDuplicates,
      onChange,
    ]
  );

  // Remove a tag
  const removeTag = useCallback(
    (index: number) => {
      if (disabled) return;
      onChange(value.filter((_, i) => i !== index));
    },
    [disabled, value, onChange]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Check for delimiter
      if (typeof delimiter === "string" && newValue.includes(delimiter)) {
        const tags = newValue
          .split(delimiter)
          .map((t) => t.trim())
          .filter(Boolean);
        tags.forEach((tag) => addTag(tag));
        return;
      } else if (delimiter instanceof RegExp && delimiter.test(newValue)) {
        const tags = newValue
          .split(delimiter)
          .map((t) => t.trim())
          .filter(Boolean);
        tags.forEach((tag) => addTag(tag));
        return;
      }

      setInputValue(newValue);
      setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
      setSelectedSuggestionIndex(0);
    },
    [delimiter, addTag, filteredSuggestions.length]
  );

  // Handle key down
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (showSuggestions && filteredSuggestions.length > 0) {
          addTag(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          addTag(inputValue);
        }
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value.length - 1);
      } else if (e.key === "ArrowDown" && showSuggestions) {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp" && showSuggestions) {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [
      disabled,
      inputValue,
      value,
      showSuggestions,
      filteredSuggestions,
      selectedSuggestionIndex,
      addTag,
      removeTag,
    ]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      addTag(suggestion);
      inputRef.current?.focus();
    },
    [addTag]
  );

  // Check if at max tags
  const isAtMaxTags = maxTags ? value.length >= maxTags : false;

  return (
    <div className={`tag-input ${className}`}>
      {/* Tags container */}
      <div
        onClick={() => inputRef.current?.focus()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.focus()}
        role="textbox"
        tabIndex={-1}
        className={`
          flex flex-wrap gap-2 p-3 border rounded-lg min-h-[42px] cursor-text
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
              : "bg-white dark:bg-gray-800"
          }
          ${
            error
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          }
          focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400
        `}
      >
        {/* Existing tags */}
        {value.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100/30 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        {!isAtMaxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() =>
              setShowSuggestions(
                inputValue.length > 0 && filteredSuggestions.length > 0
              )
            }
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            maxLength={maxTagLength}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-not-allowed"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="relative">
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSuggestionClick(suggestion)
                }
                role="option"
                tabIndex={0}
                aria-selected={index === selectedSuggestionIndex}
                className={`
                  px-3 py-2 cursor-pointer
                  ${
                    index === selectedSuggestionIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }
                `}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text / Error */}
      <div className="flex justify-between items-center mt-1 text-sm">
        {error ? (
          <span className="text-red-600 dark:text-red-400">{error}</span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {minTagLength > 1 && `Min ${minTagLength} characters. `}
            Press Enter or{" "}
            {typeof delimiter === "string"
              ? `type "${delimiter}"`
              : "use delimiter"}{" "}
            to add tag.
          </span>
        )}

        {maxTags && (
          <span
            className={`
            ${
              isAtMaxTags
                ? "text-orange-600 dark:text-orange-400 font-semibold"
                : "text-gray-500 dark:text-gray-400"
            }
          `}
          >
            {value.length} / {maxTags}
          </span>
        )}
      </div>
    </div>
  );
}
