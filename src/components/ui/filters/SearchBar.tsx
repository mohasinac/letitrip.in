/**
 * SearchBar - Enhanced search component with autocomplete and keyboard shortcuts
 *
 * @example
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search products..."
 *   onSearch={handleSearch}
 * />
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchSuggestion {
  /** Suggestion text */
  text: string;
  /** Category/type of suggestion */
  category?: string;
  /** Icon for suggestion */
  icon?: React.ReactNode;
  /** On click handler */
  onClick?: () => void;
}

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Search handler (triggered on Enter or button click) */
  onSearch?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounce?: number;
  /** Show loading indicator */
  loading?: boolean;
  /** Search suggestions */
  suggestions?: SearchSuggestion[];
  /** Recent searches */
  recentSearches?: string[];
  /** Clear recent searches */
  onClearRecent?: () => void;
  /** Keyboard shortcuts */
  shortcuts?: Array<{ key: string; description: string }>;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show search button */
  showSearchButton?: boolean;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onSearch,
      placeholder = "Search...",
      debounce = 0,
      loading = false,
      suggestions = [],
      recentSearches = [],
      onClearRecent,
      shortcuts = [
        { key: "/", description: "Focus search" },
        { key: "Esc", description: "Clear search" },
      ],
      autoFocus = false,
      className,
      size = "md",
      showSearchButton = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [debouncedValue, setDebouncedValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref && inputRef.current) {
        if (typeof ref === "function") {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    // Debounce effect
    useEffect(() => {
      if (debounce > 0) {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
          if (value && onSearch) {
            onSearch(value);
          }
        }, debounce);

        return () => clearTimeout(handler);
      } else {
        setDebouncedValue(value);
      }
    }, [value, debounce, onSearch]);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Focus on "/" key
        if (e.key === "/" && !isFocused) {
          e.preventDefault();
          inputRef.current?.focus();
        }
        // Clear on "Escape" key
        if (e.key === "Escape" && isFocused) {
          handleClear();
          inputRef.current?.blur();
        }
        // Search on "Enter" key
        if (e.key === "Enter" && isFocused && onSearch) {
          onSearch(value);
          setShowSuggestions(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFocused, value, onSearch]);

    // Click outside to close suggestions
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(e.target as Node) &&
          !inputRef.current?.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClear = () => {
      onChange("");
      setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
      onChange(suggestion.text);
      if (suggestion.onClick) {
        suggestion.onClick();
      } else if (onSearch) {
        onSearch(suggestion.text);
      }
      setShowSuggestions(false);
    };

    const handleRecentClick = (recent: string) => {
      onChange(recent);
      if (onSearch) {
        onSearch(recent);
      }
      setShowSuggestions(false);
    };

    const sizeClasses = {
      sm: "h-9 text-sm",
      md: "h-10 text-base",
      lg: "h-12 text-lg",
    };

    const showDropdown =
      showSuggestions && (suggestions.length > 0 || recentSearches.length > 0);

    return (
      <div className={cn("relative w-full", className)}>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full pl-10 pr-20 border border-border rounded-lg bg-background text-text",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              sizeClasses[size]
            )}
            {...props}
          />

          {/* Loading / Clear / Search Button */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <Loader2 className="w-4 h-4 text-textSecondary animate-spin" />
            )}
            {value && !loading && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-surface rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4 text-textSecondary hover:text-text" />
              </button>
            )}
            {showSearchButton && (
              <button
                onClick={() => onSearch?.(value)}
                className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm"
              >
                Search
              </button>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        {!isFocused && shortcuts.length > 0 && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 text-xs text-textSecondary">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-surface border border-border rounded text-xs">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !value && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <span className="text-xs font-medium text-textSecondary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recent Searches
                  </span>
                  {onClearRecent && (
                    <button
                      onClick={onClearRecent}
                      className="text-xs text-textSecondary hover:text-error"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentClick(recent)}
                    className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface rounded transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3 text-textSecondary" />
                    {recent}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                {!value && recentSearches.length > 0 && (
                  <div className="px-2 py-1 mb-1">
                    <span className="text-xs font-medium text-textSecondary flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Suggestions
                    </span>
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface rounded transition-colors flex items-center gap-2"
                  >
                    {suggestion.icon || (
                      <Search className="w-3 h-3 text-textSecondary" />
                    )}
                    <span className="flex-1">{suggestion.text}</span>
                    {suggestion.category && (
                      <span className="text-xs text-textSecondary">
                        {suggestion.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {value &&
              suggestions.length === 0 &&
              recentSearches.length === 0 && (
                <div className="p-4 text-center text-sm text-textSecondary">
                  No suggestions found
                </div>
              )}
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
