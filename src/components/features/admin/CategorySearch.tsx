"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  onResults: (results: Category[]) => void;
}

export default function CategorySearch({
  value,
  onChange,
  onResults,
}: CategorySearchProps) {
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchCategories = async () => {
      if (value.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const searchParams = new URLSearchParams();
        searchParams.append("q", value);
        searchParams.append("limit", "10");
        searchParams.append("includeInactive", "true");

        const response = await fetch(
          `/api/admin/categories/search?${searchParams}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          setSearchResults(result.data.categories);
          setShowResults(true);
          onResults(result.data.categories);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchCategories, 300);
    return () => clearTimeout(debounceTimeout);
  }, [value, onResults]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="input pl-10 pr-10"
          placeholder="Search categories by name, description, or slug..."
        />

        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
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

        {/* Loading/Clear Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : value ? (
            <button
              onClick={() => {
                onChange("");
                setSearchResults([]);
                setShowResults(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-4 w-4"
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
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {searchResults.map((category) => (
            <div
              key={category.id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
              onClick={() => {
                onChange(category.name);
                setShowResults(false);
              }}
            >
              <div className="flex items-center">
                {/* Category Icon/Image */}
                <div className="flex-shrink-0 mr-3">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : category.icon ? (
                    <div
                      className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-sm"
                      dangerouslySetInnerHTML={{ __html: category.icon }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span
                      className="block truncate font-medium text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(category.name, value),
                      }}
                    />

                    {/* Badges */}
                    <div className="flex items-center ml-2 space-x-1">
                      {category.featured && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {!category.isActive && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightText(`/${category.slug}`, value),
                      }}
                    />
                    <span>•</span>
                    <span>Level {category.level}</span>
                    {category.productCount !== undefined && (
                      <>
                        <span>•</span>
                        <span>{category.productCount} products</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults &&
        searchResults.length === 0 &&
        value.length >= 2 &&
        !loading && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-base ring-1 ring-black ring-opacity-5 sm:text-sm">
            <div className="text-center text-gray-500">
              <svg
                className="mx-auto h-8 w-8 text-gray-400 mb-2"
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
              <p>No categories found</p>
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            </div>
          </div>
        )}

      {/* Search Tips */}
      {value.length > 0 && value.length < 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-base ring-1 ring-black ring-opacity-5 sm:text-sm">
          <div className="text-center text-gray-500">
            <p className="text-sm">Type at least 2 characters to search</p>
          </div>
        </div>
      )}
    </div>
  );
}
