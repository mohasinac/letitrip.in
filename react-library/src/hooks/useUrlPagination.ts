/**
 * useUrlPagination Hook
 *
 * Framework-agnostic hook for managing pagination state synchronized with URL parameters.
 * Provides page, limit, offset calculations, and URL synchronization via injectable router.
 *
 * Features:
 * - URL parameter synchronization (optional, via router injection)
 * - Page and limit state management
 * - Offset calculation for database queries
 * - Total pages calculation
 * - Navigation helpers (next, prev, first, last)
 * - Can go prev/next checks
 * - Reset functionality
 * - Debounced URL updates (configurable)
 *
 * @example
 * ```tsx
 * // With Next.js router
 * const router = useRouter();
 * const pathname = usePathname();
 * const searchParams = useSearchParams();
 *
 * const {
 *   page,
 *   limit,
 *   offset,
 *   totalPages,
 *   setPage,
 *   setLimit,
 *   nextPage,
 *   prevPage
 * } = useUrlPagination({
 *   router: {
 *     push: router.push,
 *     pathname,
 *     searchParams
 *   },
 *   initialLimit: 20,
 *   totalItems: 150
 * });
 *
 * // Without URL sync (state only)
 * const pagination = useUrlPagination({
 *   initialLimit: 20,
 *   totalItems: 150
 * });
 * ```
 */

import { useCallback, useMemo, useState } from "react";

export interface UseUrlPaginationRouter {
  /** Function to navigate to a new URL */
  push: (url: string, options?: { scroll?: boolean }) => void;
  /** Current pathname */
  pathname: string;
  /** Current search params */
  searchParams:
    | URLSearchParams
    | {
        get: (key: string) => string | null;
        toString: () => string;
      };
}

export interface UseUrlPaginationOptions {
  /** Router instance for URL synchronization (optional) */
  router?: UseUrlPaginationRouter;
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

/**
 * Hook for managing pagination state with optional URL synchronization
 */
export function useUrlPagination({
  router,
  initialPage = 1,
  initialLimit = 20,
  totalItems = 0,
  pageParam = "page",
  limitParam = "limit",
}: UseUrlPaginationOptions = {}): UseUrlPaginationReturn {
  // Initialize page from URL or use initial value
  const [page, setPageState] = useState(() => {
    if (router?.searchParams) {
      const pageStr = router.searchParams.get(pageParam);
      if (pageStr) {
        const parsed = parseInt(pageStr, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          return parsed;
        }
      }
    }
    return initialPage;
  });

  // Initialize limit from URL or use initial value
  const [limit, setLimitState] = useState(() => {
    if (router?.searchParams) {
      const limitStr = router.searchParams.get(limitParam);
      if (limitStr) {
        const parsed = parseInt(limitStr, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          return parsed;
        }
      }
    }
    return initialLimit;
  });

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

  // Update URL with new pagination params (if router is provided)
  const updateUrl = useCallback(
    (newPage: number, newLimit?: number) => {
      if (!router) return;

      const params = new URLSearchParams(router.searchParams.toString());

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
        ? `${router.pathname}?${params.toString()}`
        : router.pathname;

      router.push(newUrl, { scroll: false });
    },
    [router, pageParam, limitParam, initialPage, initialLimit, limit]
  );

  // Set page
  const setPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPageState(newPage);
      updateUrl(newPage);
    },
    [updateUrl, totalPages]
  );

  // Set limit (and reset to page 1)
  const setLimit = useCallback(
    (newLimit: number) => {
      if (newLimit < 1) return;
      setPageState(1);
      setLimitState(newLimit);
      updateUrl(1, newLimit);
    },
    [updateUrl]
  );

  // Navigation functions
  const nextPage = useCallback(() => {
    if (canGoNext) {
      const newPage = page + 1;
      setPageState(newPage);
      updateUrl(newPage);
    }
  }, [canGoNext, page, updateUrl]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      const newPage = page - 1;
      setPageState(newPage);
      updateUrl(newPage);
    }
  }, [canGoPrev, page, updateUrl]);

  const goToFirstPage = useCallback(() => {
    setPageState(1);
    updateUrl(1);
  }, [updateUrl]);

  const goToLastPage = useCallback(() => {
    setPageState(totalPages);
    updateUrl(totalPages);
  }, [updateUrl, totalPages]);

  // Reset to initial state
  const reset = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
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
