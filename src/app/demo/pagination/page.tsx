"use client";

import { useState, useEffect } from "react";
import { usePaginationState } from "@/hooks/usePaginationState";

/**
 * Demo page for usePaginationState hook
 * Shows both page-based and load-more pagination modes
 */

// Simulated data
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 10000) + 1000,
    description: `Description for product ${i + 1}`,
  }));
};

const TOTAL_ITEMS = 50;
const allItems = generateItems(TOTAL_ITEMS);

// Simulate API fetch with cursor
async function fetchWithCursor(
  cursor: string | null,
  pageSize: number,
  delay: number = 800
) {
  await new Promise((resolve) => setTimeout(resolve, delay));

  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = Math.min(startIndex + pageSize, allItems.length);
  const items = allItems.slice(startIndex, endIndex);

  return {
    items,
    nextCursor: endIndex < allItems.length ? String(endIndex) : null,
    hasMore: endIndex < allItems.length,
  };
}

// Simulate API fetch with offset
async function fetchWithOffset(
  offset: number,
  limit: number,
  delay: number = 800
) {
  await new Promise((resolve) => setTimeout(resolve, delay));

  const items = allItems.slice(offset, offset + limit);

  return {
    items,
    total: allItems.length,
    hasMore: offset + limit < allItems.length,
  };
}

export default function PaginationDemo() {
  const [mode, setMode] = useState<"page" | "loadMore">("page");
  const [paginationType, setPaginationType] = useState<"cursor" | "offset">(
    "cursor"
  );
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // Page-based pagination
  const pagePagination = usePaginationState({
    pageSize: 10,
    mode: "page",
  });

  // Load more pagination
  const loadMorePagination = usePaginationState({
    pageSize: 10,
    mode: "loadMore",
  });

  const pagination = mode === "page" ? pagePagination : loadMorePagination;

  // Fetch data based on pagination type
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (paginationType === "cursor") {
          const cursor = pagination.getCurrentCursor();
          const result = await fetchWithCursor(cursor, pagination.pageSize);

          if (mode === "loadMore") {
            // Append for load more
            setItems((prev) =>
              pagination.currentPage === 1 ? result.items : [...prev, ...result.items]
            );
          } else {
            // Replace for page mode
            setItems(result.items);
          }

          pagination.addCursor(result.nextCursor);
          pagination.setHasNextPage(result.hasMore);
        } else {
          // Offset-based
          const result = await fetchWithOffset(
            pagination.offset,
            pagination.limit
          );

          if (mode === "loadMore") {
            // Append for load more
            setItems((prev) =>
              pagination.currentPage === 1 ? result.items : [...prev, ...result.items]
            );
          } else {
            // Replace for page mode
            setItems(result.items);
          }

          pagination.setHasNextPage(result.hasMore);
          pagination.setTotalCount(result.total);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, paginationType, mode]);

  const handleModeChange = (newMode: "page" | "loadMore") => {
    setMode(newMode);
    setItems([]);
    pagePagination.reset();
    loadMorePagination.reset();
  };

  const handlePaginationTypeChange = (newType: "cursor" | "offset") => {
    setPaginationType(newType);
    setItems([]);
    pagination.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pagination Demo
          </h1>
          <p className="text-gray-600">
            Demonstrates cursor and offset pagination with page and load-more
            modes
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Controls</h2>

          {/* Mode Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pagination Mode
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleModeChange("page")}
                className={`px-4 py-2 rounded-lg ${
                  mode === "page"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Page-based
              </button>
              <button
                onClick={() => handleModeChange("loadMore")}
                className={`px-4 py-2 rounded-lg ${
                  mode === "loadMore"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Load More
              </button>
            </div>
          </div>

          {/* Pagination Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pagination Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handlePaginationTypeChange("cursor")}
                className={`px-4 py-2 rounded-lg ${
                  paginationType === "cursor"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Cursor-based
              </button>
              <button
                onClick={() => handlePaginationTypeChange("offset")}
                className={`px-4 py-2 rounded-lg ${
                  paginationType === "offset"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Offset-based
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mode:</span>{" "}
              <span className="font-medium">{mode}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>{" "}
              <span className="font-medium">{paginationType}</span>
            </div>
            <div>
              <span className="text-gray-600">Current Page:</span>{" "}
              <span className="font-medium">{pagination.currentPage}</span>
            </div>
            <div>
              <span className="text-gray-600">Items Loaded:</span>{" "}
              <span className="font-medium">{items.length}</span>
            </div>
            {paginationType === "cursor" && (
              <>
                <div>
                  <span className="text-gray-600">Current Cursor:</span>{" "}
                  <span className="font-medium font-mono text-xs">
                    {pagination.getCurrentCursor() || "null"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Next Cursor:</span>{" "}
                  <span className="font-medium font-mono text-xs">
                    {pagination.getNextCursor() || "null"}
                  </span>
                </div>
              </>
            )}
            {paginationType === "offset" && (
              <>
                <div>
                  <span className="text-gray-600">Offset:</span>{" "}
                  <span className="font-medium">{pagination.offset}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Items:</span>{" "}
                  <span className="font-medium">
                    {pagination.totalCount || "N/A"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Items</h2>

          {loading && items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Loading items...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No items found</div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && items.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              Loading more items...
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {mode === "page" ? (
            <div className="flex items-center justify-between">
              <button
                onClick={pagination.previousPage}
                disabled={!pagination.hasPreviousPage || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="text-sm text-gray-600">
                Page {pagination.currentPage}
                {paginationType === "offset" &&
                  pagination.totalCount &&
                  ` of ${Math.ceil(
                    pagination.totalCount / pagination.pageSize
                  )}`}
              </div>

              <button
                onClick={pagination.nextPage}
                disabled={!pagination.hasNextPage || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={pagination.loadMore}
                disabled={!pagination.hasNextPage || loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Loading..."
                  : pagination.hasNextPage
                  ? "Load More"
                  : "No More Items"}
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            How to Test Pagination:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              <strong>Page-based mode:</strong> Navigate using Previous/Next
              buttons
            </li>
            <li>
              <strong>Load More mode:</strong> Click "Load More" to append items
            </li>
            <li>
              <strong>Cursor-based:</strong> Uses cursor tokens for pagination
              (better for real-time data)
            </li>
            <li>
              <strong>Offset-based:</strong> Uses offset/limit pattern (simpler,
              shows total count)
            </li>
            <li>Switch between modes to see different pagination strategies</li>
            <li>Reset button clears loaded items and starts from page 1</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
