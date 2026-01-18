
/**
 * usePaginationState Hook
 * Manages pagination state with cursor-based and offset-based approaches
 *
 * Purpose: Centralize pagination logic used across list pages
 * Replaces: Multiple useState calls for currentPage, cursors, hasNextPage, etc.
 *
 * @example
 * const pagination = usePaginationState({ pageSize: 10 });
 * pagination.goToPage(2);
 * pagination.hasNextPage(); // Check if there's a next page
 */

import { useCallback, useState } from "react";

export interface PaginationConfig {
  pageSize?: number;
  initialPage?: number;
  useCursor?: boolean;
  mode?: "page" | "loadMore"; // New: pagination mode
}

export interface UsePaginationStateReturn {
  currentPage: number;
  pageSize: number;
  cursors: (string | null)[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;
  mode: "page" | "loadMore";

  // Navigation
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
  loadMore: () => void; // New: load more items

  // Cursor management
  setCursors: (cursors: (string | null)[]) => void;
  addCursor: (cursor: string | null) => void;
  getCurrentCursor: () => string | null; // New: get current cursor
  getNextCursor: () => string | null; // New: get next cursor
  setHasNextPage: (has: boolean) => void;
  setTotalCount: (count: number) => void;

  // Offset calculation
  offset: number;
  limit: number; // New: alias for pageSize
}

export function usePaginationState(
  config?: PaginationConfig
): UsePaginationStateReturn {
  const pageSize = config?.pageSize ?? 10;
  const initialPage = config?.initialPage ?? 1;
  const mode = config?.mode ?? "page";

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  const goToPage = useCallback((page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setCursors([null]);
    setHasNextPage(false);
  }, [initialPage]);

  const loadMore = useCallback(() => {
    if (hasNextPage && mode === "loadMore") {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage, mode]);

  const addCursor = useCallback(
    (cursor: string | null) => {
      setCursors((prev) => {
        const newCursors = [...prev];
        while (newCursors.length <= currentPage) {
          newCursors.push(null);
        }
        newCursors[currentPage] = cursor;
        return newCursors;
      });
    },
    [currentPage]
  );

  const getCurrentCursor = useCallback(() => {
    return cursors[currentPage - 1] ?? null;
  }, [cursors, currentPage]);

  const getNextCursor = useCallback(() => {
    return cursors[currentPage] ?? null;
  }, [cursors, currentPage]);

  const offset = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    cursors,
    hasNextPage,
    hasPreviousPage: currentPage > 1,
    totalCount,
    mode,

    goToPage,
    nextPage,
    previousPage,
    reset,
    loadMore,

    setCursors,
    addCursor,
    getCurrentCursor,
    getNextCursor,
    setHasNextPage,
    setTotalCount,

    offset,
    limit: pageSize,
  };
}

export default usePaginationState;
