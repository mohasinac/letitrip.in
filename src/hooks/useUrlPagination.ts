/**
 * useUrlPagination Hook
 *
 * Manages pagination state synchronized with URL parameters.
 * Provides page, limit, offset calculations, and URL synchronization.
 *
 * @example
 * ```tsx
 * const {
 *   page,
 *   limit,
 *   offset,
 *   totalPages,
 *   setPage,
 *   setLimit,
 *   nextPage,
 *   prevPage,
 *   goToFirstPage,
 *   goToLastPage,
 *   canGoPrev,
 *   canGoNext
 * } = useUrlPagination({ initialLimit: 20, totalItems: 150 });
 * ```
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface UseUrlPaginationOptions {
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Initial items per page (default: 20) */
  initialLimit?: number;
  /** Total number of items for calculating total pages */
  totalItems?: number;
  /** Parameter name for page in URL (default: 'page') */
  pageParam?: string;
  /** Parameter name for limit in URL (default: 'limit') */
  limitParam?: string;
  /** Debounce delay for URL updates in ms (default: 300) */
  debounceMs?: number;
}

export interface UseUrlPaginationReturn {
  /** Current page number (1-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Offset for database queries (0-based) */
  offset: number;
  /** Total number of pages */
  totalPages: number;
  /** Set current page */
  setPage: (page: number) => void;
  /** Set items per page */
  setLimit: (limit: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to first page */
  goToFirstPage: () => void;
  /** Go to last page */
  goToLastPage: () => void;
  /** Whether can go to previous page */
  canGoPrev: boolean;
  /** Whether can go to next page */
  canGoNext: boolean;
  /** Reset pagination to initial state */
  reset: () => void;
}

export function useUrlPagination({
  initialPage = 1,
  initialLimit = 20,
  totalItems = 0,
  pageParam = "page",
  limitParam = "limit",
  debounceMs = 300,
}: UseUrlPaginationOptions = {}): UseUrlPaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current page from URL or use initial
  const page = useMemo(() => {
    const pageStr = searchParams.get(pageParam);
    if (!pageStr) return initialPage;
    const parsed = parseInt(pageStr, 10);
    return isNaN(parsed) || parsed < 1 ? initialPage : parsed;
  }, [searchParams, pageParam, initialPage]);

  // Get current limit from URL or use initial
  const limit = useMemo(() => {
    const limitStr = searchParams.get(limitParam);
    if (!limitStr) return initialLimit;
    const parsed = parseInt(limitStr, 10);
    return isNaN(parsed) || parsed < 1 ? initialLimit : parsed;
  }, [searchParams, limitParam, initialLimit]);

  // Calculate offset for database queries (0-based)
  const offset = useMemo(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (totalItems === 0) return 1;
    return Math.ceil(totalItems / limit);
  }, [totalItems, limit]);

  // Check if can navigate
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  // Update URL with new pagination params
  const updateUrl = useCallback(
    (newPage: number, newLimit?: number) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update page
      if (newPage !== initialPage) {
        params.set(pageParam, newPage.toString());
      } else {
        params.delete(pageParam);
      }

      // Update limit if provided
      const limitValue = newLimit ?? limit;
      if (limitValue !== initialLimit) {
        params.set(limitParam, limitValue.toString());
      } else {
        params.delete(limitParam);
      }

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.push(newUrl);
    },
    [
      router,
      pathname,
      searchParams,
      pageParam,
      limitParam,
      initialPage,
      initialLimit,
      limit,
    ],
  );

  // Set page
  const setPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      updateUrl(newPage);
    },
    [updateUrl, totalPages],
  );

  // Set limit (and reset to page 1)
  const setLimit = useCallback(
    (newLimit: number) => {
      if (newLimit < 1) return;
      updateUrl(1, newLimit);
    },
    [updateUrl],
  );

  // Navigation functions
  const nextPage = useCallback(() => {
    if (canGoNext) {
      updateUrl(page + 1);
    }
  }, [canGoNext, page, updateUrl]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      updateUrl(page - 1);
    }
  }, [canGoPrev, page, updateUrl]);

  const goToFirstPage = useCallback(() => {
    updateUrl(1);
  }, [updateUrl]);

  const goToLastPage = useCallback(() => {
    updateUrl(totalPages);
  }, [updateUrl, totalPages]);

  // Reset to initial state
  const reset = useCallback(() => {
    updateUrl(initialPage, initialLimit);
  }, [updateUrl, initialPage, initialLimit]);

  return {
    page,
    limit,
    offset,
    totalPages,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoPrev,
    canGoNext,
    reset,
  };
}

export default useUrlPagination;
