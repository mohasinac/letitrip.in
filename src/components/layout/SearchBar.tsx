"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Search } from "lucide-react";
import {
  ContentTypeFilter,
  type ContentType,
  getContentTypePlaceholder,
} from "@/components/common/ContentTypeFilter";

export interface SearchBarRef {
  focusSearch: () => void;
  show: () => void;
  hide: () => void;
}

interface SearchBarProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  ({ isVisible = true, onClose }, ref) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [contentType, setContentType] = useState<ContentType>("all");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

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
      // Build search URL with query params
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }
      if (contentType !== "all") {
        params.set("type", contentType);
      }

      // Navigate to search results
      const searchUrl = `/search?${params.toString()}`;
      window.location.href = searchUrl;
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(e as any);
      }
    };

    const handleContentTypeChange = (type: ContentType) => {
      setContentType(type);
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
            <div className="flex-1 flex h-[50px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-500">
              {/* Content Type Selector (replaces Category Selector) */}
              <div className="flex-shrink-0 min-w-[70px] lg:min-w-[160px] border-r border-gray-300 dark:border-gray-600">
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
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full h-full px-4 pr-24 lg:pr-32 border-0 focus:outline-none text-gray-900 dark:text-white font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:text-sm bg-transparent"
                />

                {/* Search Button Inside Input */}
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 lg:px-6 flex items-center gap-2 font-bold"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden lg:inline">Search</span>
                </button>
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
  }
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
