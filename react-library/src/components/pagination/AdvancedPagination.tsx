/**
 * AdvancedPagination Component
 *
 * Feature-rich pagination with page size selector, direct page input, and comprehensive navigation.
 * Framework-agnostic with injectable icon components.
 *
 * Features:
 * - Page navigation (prev/next, first/last)
 * - Smart page number rendering with ellipsis
 * - Page size selector
 * - Direct page number input
 * - Item count display with range
 * - Dark mode support
 * - Mobile responsive
 * - Accessible with ARIA labels
 * - Customizable page size options
 * - Optional first/last buttons
 * - Injectable icon components
 *
 * @example
 * ```tsx
 * <AdvancedPagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   pageSize={limit}
 *   totalItems={totalCount}
 *   onPageChange={setPage}
 *   onPageSizeChange={setLimit}
 *   showPageSizeSelector
 *   showPageInput
 *   showFirstLast
 * />
 *
 * // With custom icons
 * <AdvancedPagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   ChevronLeftIcon={CustomChevronLeft}
 *   ChevronRightIcon={CustomChevronRight}
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

export interface AdvancedPaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  /** Show direct page input */
  showPageInput?: boolean;
  /** Show first/last buttons */
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

export function AdvancedPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  showPageInput = true,
  showFirstLast = true,
  className = "",
  ChevronLeftIcon = DefaultChevronLeftIcon,
  ChevronRightIcon = DefaultChevronRightIcon,
  ChevronsLeftIcon = DefaultChevronsLeftIcon,
  ChevronsRightIcon = DefaultChevronsRightIcon,
}: AdvancedPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pageNum = parseInt(formData.get("page") as string, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      if (currentPage <= 3) {
        // Near start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Items info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="pageSize"
              className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
            >
              Per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* First page */}
          {showFirstLast && (
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="First page"
            >
              <ChevronsLeftIcon className="w-5 h-5" />
            </button>
          )}

          {/* Previous page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {renderPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-1.5 text-gray-600 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-purple-600 dark:bg-purple-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          {/* Last page */}
          {showFirstLast && (
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Last page"
            >
              <ChevronsRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Page input */}
        {showPageInput && totalPages > 1 && (
          <form onSubmit={handlePageInput} className="flex items-center gap-2">
            <label
              htmlFor="pageInput"
              className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
            >
              Go to:
            </label>
            <input
              type="number"
              id="pageInput"
              name="page"
              min="1"
              max={totalPages}
              defaultValue={currentPage}
              className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
            />
          </form>
        )}
      </div>
    </div>
  );
}

export default AdvancedPagination;
