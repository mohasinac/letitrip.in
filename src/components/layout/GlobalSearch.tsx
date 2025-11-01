"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Loader2,
  Package,
  FolderTree,
  Store,
  Clock,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SearchResult {
  type: "product" | "category" | "store";
  id: string;
  name: string;
  slug: string;
  image?: string;
  price?: number;
  description?: string;
}

interface SearchResults {
  products: SearchResult[];
  categories: SearchResult[];
  stores: SearchResult[];
}

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 5;

export default function GlobalSearch() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
    stores: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ products: [], categories: [], stores: [] });
      return;
    }

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults({ products: [], categories: [], stores: [] });
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updated = [
      trimmed,
      ...recentSearches.filter((s) => s !== trimmed),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    saveRecentSearch(searchQuery);
    setIsOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = getTotalResults();

    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev + 1) % (totalResults + recentSearches.length)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + totalResults + recentSearches.length) %
          (totalResults + recentSearches.length)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex === -1) {
        handleSearch(query);
      } else {
        handleSelectItem();
      }
    }
  };

  const getTotalResults = () => {
    return (
      results.products.length +
      results.categories.length +
      results.stores.length
    );
  };

  const handleSelectItem = () => {
    let currentIndex = 0;

    // Check if selecting recent search
    if (selectedIndex < recentSearches.length) {
      const search = recentSearches[selectedIndex];
      setQuery(search);
      handleSearch(search);
      return;
    }

    currentIndex = recentSearches.length;

    // Check products
    if (selectedIndex < currentIndex + results.products.length) {
      const product = results.products[selectedIndex - currentIndex];
      router.push(`/products/${product.slug}`);
      setIsOpen(false);
      setQuery("");
      return;
    }

    currentIndex += results.products.length;

    // Check categories
    if (selectedIndex < currentIndex + results.categories.length) {
      const category = results.categories[selectedIndex - currentIndex];
      router.push(`/categories/${category.slug}`);
      setIsOpen(false);
      setQuery("");
      return;
    }

    currentIndex += results.categories.length;

    // Check stores
    if (selectedIndex < currentIndex + results.stores.length) {
      const store = results.stores[selectedIndex - currentIndex];
      router.push(`/stores/${store.slug}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const hasResults = getTotalResults() > 0;
  const showRecent = !query.trim() && recentSearches.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, categories, or stores..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults({ products: [], categories: [], stores: [] });
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {!loading && showRecent && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedIndex === index
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {search}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim().length >= 2 && !hasResults && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No results found for "{query}"
              </p>
            </div>
          )}

          {!loading && hasResults && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Products */}
              {results.products.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Package className="w-4 h-4" />
                    Products
                  </div>
                  <div className="space-y-2">
                    {results.products.map((product, index) => {
                      const itemIndex = recentSearches.length + index;
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            saveRecentSearch(query);
                            setIsOpen(false);
                            setQuery("");
                          }}
                          className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedIndex === itemIndex
                              ? "bg-gray-100 dark:bg-gray-700"
                              : ""
                          }`}
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded">
                            <Image
                              src={product.image || "/assets/placeholder.png"}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {product.name}
                            </div>
                            {product.price && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                {formatPrice(product.price)}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FolderTree className="w-4 h-4" />
                    Categories
                  </div>
                  <div className="space-y-1">
                    {results.categories.map((category, index) => {
                      const itemIndex =
                        recentSearches.length + results.products.length + index;
                      return (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          onClick={() => {
                            saveRecentSearch(query);
                            setIsOpen(false);
                            setQuery("");
                          }}
                          className={`block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedIndex === itemIndex
                              ? "bg-gray-100 dark:bg-gray-700"
                              : ""
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {category.description}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stores */}
              {results.stores.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Store className="w-4 h-4" />
                    Stores
                  </div>
                  <div className="space-y-1">
                    {results.stores.map((store, index) => {
                      const itemIndex =
                        recentSearches.length +
                        results.products.length +
                        results.categories.length +
                        index;
                      return (
                        <Link
                          key={store.id}
                          href={`/stores/${store.slug}`}
                          onClick={() => {
                            saveRecentSearch(query);
                            setIsOpen(false);
                            setQuery("");
                          }}
                          className={`block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedIndex === itemIndex
                              ? "bg-gray-100 dark:bg-gray-700"
                              : ""
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {store.name}
                          </div>
                          {store.description && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {store.description}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View All Results Link */}
              <div className="p-4">
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  View all results for "{query}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
