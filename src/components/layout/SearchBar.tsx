"use client";

import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from "react";
import { Search, ArrowRight, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ContentTypeFilter,
  type ContentType,
  getContentTypePlaceholder,
} from "@/components/common/ContentTypeFilter";
import {
  searchNavigationRoutes,
  type SearchableRoute,
} from "@/constants/searchable-routes";
import { DynamicIcon, type IconName } from "@/components/common/DynamicIcon";
import { useDebounce } from "@/hooks/useDebounce";

export interface SearchBarRef {
  focusSearch: () => void;
  show: () => void;
  hide: () => void;
}

interface SearchBarProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const MAX_SUGGESTIONS = 10;

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  ({ isVisible = true, onClose }, ref) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [contentType, setContentType] = useState<ContentType>("all");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchableRoute[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounce search query to reduce suggestions updates
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Update suggestions when debounced query changes (only for "all" content type)
    useEffect(() => {
      if (contentType === "all" && debouncedSearchQuery.length > 0) {
        const routes = searchNavigationRoutes(
          debouncedSearchQuery,
          MAX_SUGGESTIONS,
        );
        setSuggestions(routes);
        setShowSuggestions(routes.length > 0);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, [debouncedSearchQuery, contentType]);

    // Close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          searchBarRef.current &&
          !searchBarRef.current.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navigateToRoute = useCallback(
      (route: SearchableRoute) => {
        setShowSuggestions(false);
        setSearchQuery("");
        router.push(route.path);
      },
      [router],
    );

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      },
      show: () => {
        searchInputRef.current?.focus();
      },
      hide: () => {
        setSearchQuery("");
      },
    }));

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);

      // Don't search if query is empty
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        // Focus the input and show error state
        searchInputRef.current?.focus();
        return;
      }

      // Build search URL with query params
      const params = new URLSearchParams();
      params.set("q", trimmedQuery);
      if (contentType !== "all") {
        params.set("type", contentType);
      }

      // Navigate to search results
      const searchUrl = `/search?${params.toString()}`;
      router.push(searchUrl);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch(e as React.FormEvent<HTMLInputElement>);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            navigateToRoute(suggestions[selectedIndex]);
          } else {
            handleSearch(e as React.FormEvent<HTMLInputElement>);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    const handleContentTypeChange = (type: ContentType) => {
      setContentType(type);
      setShowSuggestions(false);
    };

    const handleInputFocus = () => {
      if (
        contentType === "all" &&
        searchQuery.length > 0 &&
        suggestions.length > 0
      ) {
        setShowSuggestions(true);
      }
    };

    // Don't render if not visible
    if (!isVisible) {
      return null;
    }

    // Get dynamic placeholder based on content type
    const placeholder = getContentTypePlaceholder(contentType);

    return (
      <div
        id="search-bar"
        ref={searchBarRef}
        className="bg-yellow-50 dark:bg-gray-800 py-4 sm:py-6 px-4 border-b border-yellow-200 dark:border-gray-700"
      >
        <div className="container mx-auto max-w-full lg:max-w-6xl">
          <form onSubmit={handleSearch} className="flex gap-0">
            {/* Merged Content Type Selector and Search Input */}
            <div className="flex-1 flex h-[50px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-yellow-500">
              {/* Content Type Selector (replaces Category Selector) */}
              <div className="flex-shrink-0 min-w-[70px] lg:min-w-[160px] border-r border-gray-300 dark:border-gray-600 relative">
                <ContentTypeFilter
                  value={contentType}
                  onChange={handleContentTypeChange}
                  variant="dropdown"
                  size="md"
                  className="h-full"
                />
              </div>

              {/* Search Input with Button */}
              <div className="flex-1 relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  placeholder={placeholder}
                  autoComplete="off"
                  className="w-full h-full px-4 pr-24 lg:pr-32 border-0 focus:outline-none text-gray-900 dark:text-white font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:text-sm bg-transparent"
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-controls="search-suggestions"
                  aria-activedescendant={
                    selectedIndex >= 0
                      ? `suggestion-${selectedIndex}`
                      : undefined
                  }
                />

                {/* Search Button Inside Input */}
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 lg:px-6 flex items-center gap-2 font-bold"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden lg:inline">Search</span>
                </button>

                {/* Navigation Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    id="search-suggestions"
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto"
                  >
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5">
                      <Navigation className="w-3 h-3" />
                      Quick Navigation
                    </div>
                    {suggestions.map((route, index) => (
                      <button
                        key={route.id}
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={selectedIndex === index}
                        onClick={() => navigateToRoute(route)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                          selectedIndex === index
                            ? "bg-yellow-50 dark:bg-gray-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedIndex === index
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <DynamicIcon
                            name={route.icon as IconName}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {route.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {route.description}
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 flex-shrink-0 transition-opacity ${
                            selectedIndex === index
                              ? "opacity-100 text-yellow-600 dark:text-yellow-400"
                              : "opacity-0"
                          }`}
                        />
                      </button>
                    ))}
                    <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700">
                      <span className="hidden sm:inline">
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                          ↑
                        </kbd>{" "}
                        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                          ↓
                        </kbd>{" "}
                        to navigate,{" "}
                        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">
                          Enter
                        </kbd>{" "}
                        to select
                      </span>
                      <span className="sm:hidden">Tap to navigate</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-[50px] ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 flex items-center justify-center transition-colors"
                aria-label="Close search"
              >
                <svg
                  className="w-6 h-6"
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
          </form>

          {/* Mobile Content Type Filter (Chips) */}
          <div className="md:hidden mt-3 overflow-x-auto -mx-4 px-4">
            <ContentTypeFilter
              value={contentType}
              onChange={handleContentTypeChange}
              variant="chips"
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
