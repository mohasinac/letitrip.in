/**
 * SimplePagination Component
 *
 * Minimal pagination component for simple use cases with optional page size control.
 * Framework-agnostic with injectable icon components.
 *
 * Features:
 * - Basic prev/next navigation
 * - Optional first/last buttons
 * - Current page display
 * - Optional items count display
 * - Optional page size selector
 * - Dark mode support
 * - Mobile responsive
 * - Accessible with ARIA labels
 * - Injectable icon components
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SimplePagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 * />
 *
 * // With items count and page size
 * <SimplePagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   totalItems={totalCount}
 *   pageSize={limit}
 *   onPageSizeChange={setLimit}
 * />
 *
 * // With first/last buttons
 * <SimplePagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   showFirstLast
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

const DefaultChevronsLeftIcon: React.FC<{ className?: string }> = ({
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
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

const DefaultChevronsRightIcon: React.FC<{ className?: string }> = ({
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
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
);

export interface SimplePaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Total number of items (optional, for showing count) */
  totalItems?: number;
  /** Current page size (optional) */
  pageSize?: number;
  /** Callback when page size changes (optional) */
  onPageSizeChange?: (size: number) => void;
  /** Available page sizes (optional) */
  pageSizes?: number[];
  /** Whether to show first/last buttons */
  showFirstLast?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom ChevronLeft icon component */
  ChevronLeftIcon?: React.FC<{ className?: string }>;
  /** Custom ChevronRight icon component */
  ChevronRightIcon?: React.FC<{ className?: string }>;
  /** Custom ChevronsLeft icon component */
  ChevronsLeftIcon?: React.FC<{ className?: string }>;
  /** Custom ChevronsRight icon component */
  ChevronsRightIcon?: React.FC<{ className?: string }>;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizes = [10, 25, 50, 100],
  showFirstLast = false,
  className = "",
  ChevronLeftIcon = DefaultChevronLeftIcon,
  ChevronRightIcon = DefaultChevronRightIcon,
  ChevronsLeftIcon = DefaultChevronsLeftIcon,
  ChevronsRightIcon = DefaultChevronsRightIcon,
}: SimplePaginationProps) {
  if (totalPages <= 1 && totalItems === undefined) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Items info and page size selector */}
      {(totalItems !== undefined || onPageSizeChange) && (
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {totalItems !== undefined && (
            <span>
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </span>
          )}
          {onPageSizeChange && pageSize && (
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>
          )}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* First page button */}
          {showFirstLast && (
            <button
              type="button"
              onClick={handleFirst}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              title="First page"
              aria-label="First page"
            >
              <ChevronsLeftIcon className="w-4 h-4" />
            </button>
          )}

          {/* Previous button */}
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          {/* Page info */}
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          {/* Next button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          {/* Last page button */}
          {showFirstLast && (
            <button
              type="button"
              onClick={handleLast}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              title="Last page"
              aria-label="Last page"
            >
              <ChevronsRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SimplePagination;
