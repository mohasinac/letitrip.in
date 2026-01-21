"use client";

import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * GlobalSearch Component
 *
 * Admin-wide search component that searches across all resources:
 * - Users
 * - Products
 * - Auctions
 * - Orders
 * - Shops
 * - Categories
 * - Coupons
 *
 * Features:
 * - Real-time search with debouncing
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Category filtering
 * - Recent searches
 * - Search suggestions
 * - Quick actions (view, edit)
 * - Responsive design
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <GlobalSearch />
 * ```
 */

// Types
interface SearchResult {
  id: string;
  type:
    | "user"
    | "product"
    | "auction"
    | "order"
    | "shop"
    | "category"
    | "coupon";
  title: string;
  subtitle: string;
  status?: string;
  url: string;
  imageUrl?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
}

// Mock search function (replace with actual API call)
const searchAPI = async (
  query: string,
  filter: string,
): Promise<SearchResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "user",
      title: "Rajesh Kumar",
      subtitle: "rajesh.kumar@example.com • Buyer",
      status: "active",
      url: "/admin/users?id=1",
    },
    {
      id: "2",
      type: "product",
      title: "Vintage Wooden Clock",
      subtitle: "Antique Paradise • ₹4,999",
      status: "active",
      url: ROUTES.PRODUCTS.DETAIL("vintage-wooden-clock"),
    },
    {
      id: "3",
      type: "auction",
      title: "Rare Coin Collection",
      subtitle: "Ends in 2 days • Current bid: ₹15,000",
      status: "live",
      url: "/auctions/rare-coin-collection",
    },
    {
      id: "4",
      type: "order",
      title: "ORD-2026-001234",
      subtitle: "Rajesh Kumar • ₹8,997 • Delivered",
      status: "delivered",
      url: "/admin/orders?id=1",
    },
    {
      id: "5",
      type: "shop",
      title: "Antique Paradise",
      subtitle: "Priya Sharma • 128 products",
      status: "active",
      url: "/admin/shops?id=1",
    },
    {
      id: "6",
      type: "category",
      title: "Electronics",
      subtitle: "512 products • Active",
      status: "active",
      url: "/admin/categories?id=1",
    },
    {
      id: "7",
      type: "coupon",
      title: "WELCOME50",
      subtitle: "50% off • 342/1000 used",
      status: "active",
      url: "/admin/coupons?id=1",
    },
  ];

  const filtered =
    filter === "all"
      ? mockResults
      : mockResults.filter((r) => r.type === filter);

  const searched = query
    ? filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase()),
      )
    : filtered.slice(0, 5);

  return {
    results: searched,
    total: searched.length,
  };
};

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("admin-recent-searches", JSON.stringify(updated));
  };

  // Search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await searchAPI(query, filter);
        setResults(response.results);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      // Escape to close
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setSelectedIndex(0);
      }

      // Arrow navigation when search is open
      if (isOpen && results.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + results.length) % results.length,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectResult = (result: SearchResult) => {
    saveRecentSearch(query);
    setIsOpen(false);
    setQuery("");
    router.push(result.url);
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("admin-recent-searches");
  };

  // Get icon for result type
  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "user":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      case "product":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "auction":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "order":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "shop":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "category":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        );
      case "coupon":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
        );
    }
  };

  // Get color for result type
  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "user":
        return "text-blue-600 dark:text-blue-400";
      case "product":
        return "text-purple-600 dark:text-purple-400";
      case "auction":
        return "text-orange-600 dark:text-orange-400";
      case "order":
        return "text-green-600 dark:text-green-400";
      case "shop":
        return "text-indigo-600 dark:text-indigo-400";
      case "category":
        return "text-pink-600 dark:text-pink-400";
      case "coupon":
        return "text-yellow-600 dark:text-yellow-400";
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 w-full md:w-auto"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-sm">Search everything...</span>
        <kbd className="hidden md:inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-[10vh]">
          <div
            ref={searchRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, products, orders, and more..."
                  className="flex-1 bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                />
                {isLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { value: "all", label: "All" },
                  { value: "user", label: "Users" },
                  { value: "product", label: "Products" },
                  { value: "auction", label: "Auctions" },
                  { value: "order", label: "Orders" },
                  { value: "shop", label: "Shops" },
                  { value: "category", label: "Categories" },
                  { value: "coupon", label: "Coupons" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                      filter === tab.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[60vh]">
              {query.trim() === "" && recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-colors ${
                        index === selectedIndex
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className={`${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.subtitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {result.type}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.trim() !== "" && !isLoading && results.length === 0 && (
                <div className="p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No results found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                      ↑
                    </kbd>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                      ↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                      ESC
                    </kbd>
                    <span>Close</span>
                  </span>
                </div>
                <span>{results.length} results</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
