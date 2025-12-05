/**
 * @fileoverview React Component
 * @module src/components/common/Pagination
 * @description This file contains the Pagination component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Pagination Component
 *
 * A reusable pagination component for list pages.
 * Provides consistent pagination controls across the app.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 * />
 *
 * // With items per page control
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 *   totalItems={totalItems}
 *   pageSize={pageSize}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */

"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * PaginationProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PaginationProps
 */
interface PaginationProps {
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
}

/**
 * Function: Pagination
 */
/**
 * Performs pagination operation
 *
 * @returns {any} The pagination result
 *
 * @example
 * Pagination();
 */

/**
 * Performs pagination operation
 *
 * @returns {any} The pagination result
 *
 * @example
 * Pagination();
 */

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizes = [10, 25, 50, 100],
  showFirstLast = false,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  /**
   * Handles previous event
   *
   * @returns {any} The handleprevious result
   */

  /**
   * Handles previous event
   *
   * @returns {any} The handleprevious result
   */

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  /**
   * Handles next event
   *
   * @returns {any} The handlenext result
   */

  /**
   * Handles next event
   *
   * @returns {any} The handlenext result
   */

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  /**
   * Handles first event
   *
   * @returns {any} The handlefirst result
   */

  /**
   * Handles first event
   *
   * @returns {any} The handlefirst result
   */

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  /**
   * Handles last event
   *
   * @returns {any} The handlelast result
   */

  /**
   * Handles last event
   *
   * @returns {any} The handlelast result
   */

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
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
              onClick={handleFirst}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}

          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page info */}
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Last page button */}
          {showFirstLast && (
            <button
              onClick={handleLast}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * SimplePagination Component
 *
 * A minimal pagination component for simple use cases.
 */
interface SimplePaginationProps {
  /** Current Page */
  currentPage: number;
  /** Total Pages */
  totalPages: number;
  /** On Page Change */
  onPageChange: (page: number) => void;
  /** Class Name */
  className?: string;
}

/**
 * Function: Simple Pagination
 */
/**
 * Performs simple pagination operation
 *
 * @returns {any} The simplepagination result
 *
 * @example
 * SimplePagination();
 */

/**
 * Performs simple pagination operation
 *
 * @returns {any} The simplepagination result
 *
 * @example
 * SimplePagination();
 */

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: SimplePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default Pagination;
