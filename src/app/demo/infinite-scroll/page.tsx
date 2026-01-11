"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

/**
 * Demo page for useInfiniteScroll hook
 * Shows integration with React Query infinite queries
 */

// Simulated data
const generateItems = (page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `item-${startIndex + i + 1}`,
    name: `Product ${startIndex + i + 1}`,
    price: Math.floor(Math.random() * 10000) + 1000,
    description: `Description for product ${startIndex + i + 1}`,
    image: `https://via.placeholder.com/150?text=Product+${startIndex + i + 1}`,
  }));
};

const TOTAL_PAGES = 5;
const PAGE_SIZE = 10;

// Simulate API fetch
async function fetchPage(page: number, delay: number = 1000) {
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (page > TOTAL_PAGES) {
    return {
      items: [],
      nextPage: null,
      hasMore: false,
    };
  }

  return {
    items: generateItems(page, PAGE_SIZE),
    nextPage: page < TOTAL_PAGES ? page + 1 : null,
    hasMore: page < TOTAL_PAGES,
  };
}

export default function InfiniteScrollDemo() {
  // React Query infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["infinite-items"],
    queryFn: ({ pageParam = 1 }) => fetchPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Infinite scroll hook
  const { observerRef, isIntersecting } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    threshold: 0.5,
    rootMargin: "100px",
  });

  // Flatten all pages into single array
  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 text-gray-500">
            Loading initial items...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 text-red-600">
            Error: {error?.message || "Failed to load items"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Infinite Scroll Demo
          </h1>
          <p className="text-gray-600">
            Scroll down to automatically load more items using Intersection
            Observer
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Items Loaded:</span>{" "}
              <span className="font-medium">{allItems.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Pages:</span>{" "}
              <span className="font-medium">
                {data?.pages.length} / {TOTAL_PAGES}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Has More:</span>{" "}
              <span className="font-medium">
                {hasNextPage ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Sentinel Visible:</span>{" "}
              <span className="font-medium">
                {isIntersecting ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {allItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-6 flex gap-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="text-lg font-semibold text-gray-900">
                  ₹{item.price.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Sentinel */}
        {hasNextPage && (
          <div
            ref={observerRef}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading more items...</span>
              </div>
            ) : (
              <div className="text-gray-500">
                {isIntersecting
                  ? "Loading..."
                  : "Scroll down to load more"}
              </div>
            )}
          </div>
        )}

        {/* End Message */}
        {!hasNextPage && allItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">
              🎉 You've reached the end! All {allItems.length} items loaded.
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            How Infinite Scroll Works:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              <strong>Intersection Observer:</strong> Watches when sentinel
              element becomes visible
            </li>
            <li>
              <strong>Automatic Loading:</strong> Triggers fetchNextPage when
              scrolling near bottom
            </li>
            <li>
              <strong>Threshold:</strong> 0.5 means trigger when 50% of sentinel
              is visible
            </li>
            <li>
              <strong>Root Margin:</strong> 100px means start loading 100px
              before sentinel visible
            </li>
            <li>
              <strong>Debouncing:</strong> 200ms delay prevents multiple
              simultaneous loads
            </li>
            <li>
              <strong>React Query Integration:</strong> useInfiniteQuery manages
              page state and caching
            </li>
            <li>
              Scroll down slowly to see the sentinel trigger loading
            </li>
          </ol>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Technical Details:
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • <strong>Total Items:</strong> {TOTAL_PAGES * PAGE_SIZE} ({TOTAL_PAGES} pages × {PAGE_SIZE} items/page)
            </li>
            <li>
              • <strong>Simulated Delay:</strong> 1000ms per page load
            </li>
            <li>
              • <strong>Threshold:</strong> 0.5 (50% visibility)
            </li>
            <li>
              • <strong>Root Margin:</strong> 100px (preload buffer)
            </li>
            <li>
              • <strong>Debounce:</strong> 200ms (prevent duplicate loads)
            </li>
            <li>
              • <strong>React Query:</strong> Automatic caching and deduplication
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
