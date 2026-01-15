/**
 * CursorPagination Component
 *
 * Cursor-based pagination component for infinite scroll and cursor-based APIs.
 * Framework-agnostic with injectable icon components.
 *
 * Features:
 * - Previous/Next navigation with cursors
 * - Loading states
 * - Disabled states when no more pages
 * - Optional items count display
 * - Dark mode support
 * - Injectable icon components
 * - Accessible with ARIA labels
 *
 * @example
 * ```tsx
 * // Basic cursor pagination
 * <CursorPagination
 *   hasNextPage={hasMore}
 *   hasPreviousPage={hasPrevious}
 *   onNextPage={() => fetchNextPage(nextCursor)}
 *   onPreviousPage={() => fetchPreviousPage(previousCursor)}
 * />
 *
 * // With loading state
 * <CursorPagination
 *   hasNextPage={hasMore}
 *   hasPreviousPage={hasPrevious}
 *   onNextPage={handleNext}
 *   onPreviousPage={handlePrevious}
 *   loading={isLoading}
 * />
 *
 * // With items count
 * <CursorPagination
 *   hasNextPage={hasMore}
 *   hasPreviousPage={hasPrevious}
 *   onNextPage={handleNext}
 *   onPreviousPage={handlePrevious}
 *   itemCount={currentPageItems.length}
 *   totalItems={totalCount}
 * />
 * ```
 */

import React from "react";

// Default SVG Icons
const DefaultChevronLeftIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const DefaultChevronRightIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export interface CursorPaginationProps {
  /** Whether there is a next page available */
  hasNextPage: boolean;
  /** Whether there is a previous page available */
  hasPreviousPage: boolean;
  /** Callback to load next page */
  onNextPage: () => void;
  /** Callback to load previous page */
  onPreviousPage: () => void;
  /** Loading state */
  loading?: boolean;
  /** Number of items on current page (optional) */
  itemCount?: number;
  /** Total number of items (optional) */
  totalItems?: number;
  /** Label for next button */
  nextLabel?: string;
  /** Label for previous button */
  previousLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom ChevronLeft icon component */
  ChevronLeftIcon?: React.FC<{ className?: string }>;
  /** Custom ChevronRight icon component */
  ChevronRightIcon?: React.FC<{ className?: string }>;
}

export function CursorPagination({
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  loading = false,
  itemCount,
  totalItems,
  nextLabel = "Next",
  previousLabel = "Previous",
  className = "",
  ChevronLeftIcon = DefaultChevronLeftIcon,
  ChevronRightIcon = DefaultChevronRightIcon,
}: CursorPaginationProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Items info */}
      {(itemCount !== undefined || totalItems !== undefined) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {itemCount !== undefined && totalItems !== undefined && (
            <span>
              Showing {itemCount} of {totalItems} items
            </span>
          )}
          {itemCount !== undefined && totalItems === undefined && (
            <span>{itemCount} items</span>
          )}
          {itemCount === undefined && totalItems !== undefined && (
            <span>{totalItems} total items</span>
          )}
        </div>
      )}

      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span className="hidden sm:inline">{previousLabel}</span>
        </button>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Loading...
            </span>
          </div>
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default CursorPagination;
