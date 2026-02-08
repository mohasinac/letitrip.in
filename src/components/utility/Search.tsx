"use client";

import { useState, useRef, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";
import Button from "../ui/Button";

/**
 * Search Component
 *
 * A sticky search bar that appears below the title bar when opened.
 * Features auto-focus, ESC key support, and Enter key submission.
 * Includes animated slide-down entrance and backdrop for mobile.
 *
 * @component
 * @example
 * ```tsx
 * <Search
 *   isOpen={searchOpen}
 *   onClose={() => setSearchOpen(false)}
 *   onSearch={(query) => handleSearch(query)}
 * />
 * ```
 */

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
}

export default function Search({ isOpen, onClose, onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Search Bar - sticky positioning after TitleBar */}
      {/* Appears after TitleBar on both mobile and desktop (navbar hides on scroll) */}
      <div
        className={`sticky top-20 ${THEME_CONSTANTS.zIndex.search} ${THEME_CONSTANTS.layout.titleBarBg} border-b ${THEME_CONSTANTS.themed.border} shadow-md animate-slide-down`}
      >
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="search"
                placeholder="Search products, categories, sellers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`${THEME_CONSTANTS.input.base} ${THEME_CONSTANTS.themed.bgInput} ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.placeholder} ${THEME_CONSTANTS.themed.focusRing} w-full`}
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              variant="primary"
              size="md"
              className="hidden sm:flex gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </Button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2.5 md:p-3 rounded-xl transition-colors ${THEME_CONSTANTS.colors.iconButton.onLight} flex-shrink-0`}
              aria-label="Close search"
            >
              <svg
                className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
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
          </div>

          {/* Search Results Preview */}
          {query && (
            <div
              className={`mt-4 ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.border} rounded-xl p-4 max-h-96 overflow-y-auto`}
            >
              <p className={`${THEME_CONSTANTS.themed.textSecondary} text-sm`}>
                Searching for "{query}"...
              </p>
              {/* Add your search results here */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
