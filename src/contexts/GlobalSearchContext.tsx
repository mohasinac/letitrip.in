"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * @interface SearchResult
 * Represents a single search result item
 */
interface SearchResult {
  id: string;
  title: string;
  description?: string;
  image?: string;
  type: "product" | "auction" | "shop" | "blog" | "category";
  path: string;
  price?: number;
  rating?: number;
}

/**
 * @interface GlobalSearchContextType
 * Global search context providing site-wide search functionality
 */
interface GlobalSearchContextType {
  // Search state
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  isLoading: boolean;
  error: string | null;

  // Search methods
  handleSearch: (query: string, contentType?: string) => Promise<void>;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
}

/**
 * @type GlobalSearchContext
 * Context for managing global site-wide search
 */
const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(
  undefined
);

/**
 * @interface GlobalSearchProviderProps
 * Props for GlobalSearchProvider component
 */
interface GlobalSearchProviderProps {
  children: React.ReactNode;
}

/**
 * GlobalSearchProvider Component
 * Provides global search state and methods to all child components
 *
 * @param children - React components to be wrapped
 * @returns JSX.Element
 */
export function GlobalSearchProvider({
  children,
}: GlobalSearchProviderProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Perform global search across all content types
   * Makes API call to /api/search with query and optional content type filter
   *
   * @param query - Search query string
   * @param contentType - Optional content type filter (product, auction, shop, blog, category)
   */
  const handleSearch = useCallback(
    async (query: string, contentType?: string) => {
      // Validate query
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setError("Search query cannot be empty");
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setIsSearching(true);

        // Build search URL with params
        const params = new URLSearchParams();
        params.set("q", trimmedQuery);
        if (contentType) {
          params.set("type", contentType);
        }

        // Call search API
        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Search failed";
        setError(errorMessage);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear search state and results
   * Resets search query, results, and error state
   */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setIsSearching(false);
  }, []);

  const value: GlobalSearchContextType = {
    searchQuery,
    searchResults,
    isSearching,
    isLoading,
    error,
    handleSearch,
    clearSearch,
    setSearchQuery,
  };

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

/**
 * useGlobalSearch Hook
 * Access global search functionality from any component
 *
 * @throws Error if used outside GlobalSearchProvider
 * @returns GlobalSearchContextType with search state and methods
 *
 * @example
 * ```tsx
 * const { searchQuery, searchResults, handleSearch } = useGlobalSearch();
 *
 * // Perform search
 * await handleSearch("laptop", "product");
 *
 * // Clear search
 * handleSearch("");
 * ```
 */
export function useGlobalSearch(): GlobalSearchContextType {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  }
  return context;
}

export type { GlobalSearchContextType, SearchResult };
