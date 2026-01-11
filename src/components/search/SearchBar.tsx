"use client";

/**
 * SearchBar Component
 *
 * Advanced search bar with autocomplete, history, and trending searches
 * Integrates with the advanced search service
 */

import type { SearchSuggestion } from "@/services/search.service";
import { searchService } from "@/services/search.service";
import { Clock, Search, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showTrending?: boolean;
  showHistory?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  initialQuery = "",
  placeholder = "Search products, shops, categories...",
  onSearch,
  className = "",
  showTrending = true,
  showHistory = true,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load search history and trending on mount
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  useEffect(() => {
    if (showHistory) {
      const history = searchService.getSearchHistory();
      setSearchHistory(history.slice(0, 5).map((h) => h.query));
    }
    if (showTrending) {
      loadTrending();
    }
  }, [showHistory, showTrending]);

  const loadTrending = async () => {
    try {
      const trending = await searchService.getTrendingSearches(5);
      setTrendingSearches(trending.map((t) => t.query));
    } catch (error) {
      console.error("Failed to load trending searches:", error);
    }
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchService.getAutocompleteSuggestions(
        searchQuery
      );
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      fetchSuggestions(value);
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
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    },
    [onSearch, router]
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
          <Search className="absolute left-4 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {loading && (
            <div className="absolute right-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            </div>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? "bg-gray-50" : ""
                  }`}
                >
                  <span className="text-xl">
                    {getSuggestionIcon(suggestion.type)}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {suggestion.text}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                  {suggestion.count !== undefined && (
                    <div className="text-xs text-gray-400">
                      {suggestion.count} results
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {!query.trim() && showHistory && searchHistory.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recent Searches
              </div>
              {searchHistory.map((historyQuery, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleHistoryClick(historyQuery)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{historyQuery}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!query.trim() && showTrending && trendingSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>
              {trendingSearches.map((trendingQuery, index) => (
                <button
                  key={`trending-${index}`}
                  onClick={() => handleHistoryClick(trendingQuery)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">{trendingQuery}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-gray-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
