"use client";

import { useState } from "react";
import { THEME_CONSTANTS } from "@/constants/theme";
import { UI_PLACEHOLDERS } from "@/constants/ui";

interface FAQSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function FAQSearchBar({
  onSearch,
  placeholder = UI_PLACEHOLDERS.SEARCH,
}: FAQSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-5 h-5 ${THEME_CONSTANTS.themed.textSecondary}`}
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
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${THEME_CONSTANTS.spacing.padding.lg} pl-12 pr-12 ${THEME_CONSTANTS.borderRadius.xl} ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.border} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
      />

      {/* Clear Button */}
      {query && (
        <button
          onClick={handleClear}
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${THEME_CONSTANTS.themed.textSecondary} hover:${THEME_CONSTANTS.themed.textPrimary} transition-colors`}
          aria-label="Clear search"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
