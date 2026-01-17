"use client";

/**
 * SearchBar Component
 *
 * Advanced search bar with autocomplete, search history, and trending searches.
 * Provides a rich search experience with keyboard navigation and debounced API calls.
 *
 * Features:
 * - Autocomplete suggestions with type indicators (product, shop, category, query)
 * - Search history (stored locally, up to 5 recent searches)
 * - Trending searches display
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Debounced search (300ms delay)
 * - Loading states and error handling
 * - Configurable placeholder and behavior
 * - Injectable onSearch callback or default navigation
 * - Clear button with focus restoration
 * - Click-outside to close
 * - Dark mode support
 *
 * @example
 * ```tsx
 * // Basic usage with default navigation
 * <SearchBar />
 *
 * // With custom placeholder and search handler
 * <SearchBar
 *   placeholder="Search for anything..."
 *   onSearch={(query) => console.log('Searching:', query)}
 *   showTrending={false}
 * />
 *
 * // With custom icons
 * <SearchBar
 *   SearchIcon={CustomSearchIcon}
 *   XIcon={CustomXIcon}
 *   ClockIcon={CustomClockIcon}
 *   TrendingIcon={CustomTrendingIcon}
 * />
 * ```
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

// Default SVG Icons
const DefaultSearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const DefaultXIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const DefaultClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DefaultTrendingIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export interface SearchSuggestion {
  text: string;
  type: "product" | "shop" | "category" | "query";
  count?: number;
}

export interface SearchBarProps {
  /** Initial search query value */
  initialQuery?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Callback when search is performed. If not provided, uses default navigation */
  onSearch?: (query: string) => void;
  /** Function to fetch autocomplete suggestions. Returns array of suggestions */
  fetchSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
  /** Function to get search history. Returns array of query strings */
  getSearchHistory?: () => string[];
  /** Function to get trending searches. Returns array of query strings */
  getTrendingSearches?: () => Promise<string[]>;
  /** Additional CSS classes */
  className?: string;
  /** Show trending searches section */
  showTrending?: boolean;
  /** Show search history section */
  showHistory?: boolean;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  /** Custom Search icon component */
  SearchIcon?: React.FC<{ className?: string }>;
  /** Custom X (close) icon component */
  XIcon?: React.FC<{ className?: string }>;
  /** Custom Clock icon component */
  ClockIcon?: React.FC<{ className?: string }>;
  /** Custom Trending icon component */
  TrendingIcon?: React.FC<{ className?: string }>;
}

export function SearchBar({
  initialQuery = "",
  placeholder = "Search products, shops, categories...",
  onSearch,
  fetchSuggestions,
  getSearchHistory,
  getTrendingSearches,
  className = "",
  showTrending = true,
  showHistory = true,
  autoFocus = false,
  SearchIcon = DefaultSearchIcon,
  XIcon = DefaultXIcon,
  ClockIcon = DefaultClockIcon,
  TrendingIcon = DefaultTrendingIcon,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load search history and trending on mount
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  useEffect(() => {
    if (showHistory && getSearchHistory) {
      const history = getSearchHistory();
      setSearchHistory(history.slice(0, 5));
    }
    if (showTrending && getTrendingSearches) {
      loadTrending();
    }
  }, [showHistory, showTrending, getSearchHistory, getTrendingSearches]);

  const loadTrending = async () => {
    if (!getTrendingSearches) return;
    try {
      const trending = await getTrendingSearches();
      setTrendingSearches(trending.slice(0, 5));
    } catch (error) {
      console.error("Failed to load trending searches:", error);
    }
  };

  // Fetch autocomplete suggestions
  const fetchSuggestionsInternal = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2 || !fetchSuggestions) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const results = await fetchSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchSuggestions]
  );

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for autocomplete
    debounceRef.current = setTimeout(() => {
      fetchSuggestionsInternal(value);
    }, 300);
  };

  // Handle search submission
  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      setShowSuggestions(false);
      setSuggestions([]);

      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Default behavior - could be customized by parent
        console.log("Search:", searchQuery);
      }
    },
    [onSearch]
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle history/trending click
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSuggestions([]);
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show history/trending when focused with empty query
  const handleFocus = () => {
    if (
      !query.trim() &&
      (searchHistory.length > 0 || trendingSearches.length > 0)
    ) {
      setShowSuggestions(true);
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "product":
        return "📦";
      case "shop":
        return "🏪";
      case "category":
        return "📁";
      default:
        return "🔍";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-12 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
          />
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 rounded-full p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
          {loading && (
            <div className="absolute right-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400" />
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-700">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? "bg-gray-50 dark:bg-gray-700" : ""
                  }`}
                >
                  <span className="text-xl">
                    {getSuggestionIcon(suggestion.type)}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                  {suggestion.count !== undefined && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {suggestion.count} results
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {!query.trim() && showHistory && searchHistory.length > 0 && (
            <div className="border-b border-gray-100 dark:border-gray-700">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <ClockIcon className="h-3 w-3" />
                Recent Searches
              </div>
              {searchHistory.map((historyQuery, index) => (
                <button
                  key={`history-${index}`}
                  type="button"
                  onClick={() => handleHistoryClick(historyQuery)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ClockIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {historyQuery}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!query.trim() && showTrending && trendingSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <TrendingIcon className="h-3 w-3" />
                Trending
              </div>
              {trendingSearches.map((trendingQuery, index) => (
                <button
                  key={`trending-${index}`}
                  type="button"
                  onClick={() => handleHistoryClick(trendingQuery)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <TrendingIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {trendingQuery}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
