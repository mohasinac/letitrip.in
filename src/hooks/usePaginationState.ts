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

"use client";

import { useCallback, useState } from "react";

export interface PaginationConfig {
  pageSize?: number;
  initialPage?: number;
  useCursor?: boolean;
}

export interface UsePaginationStateReturn {
  currentPage: number;
  pageSize: number;
  cursors: (string | null)[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;

  // Navigation
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;

  // Cursor management
  setCursors: (cursors: (string | null)[]) => void;
  addCursor: (cursor: string | null) => void;
  setHasNextPage: (has: boolean) => void;
  setTotalCount: (count: number) => void;

  // Offset calculation
  offset: number;
}

export function usePaginationState(
  config?: PaginationConfig
): UsePaginationStateReturn {
  const pageSize = config?.pageSize ?? 10;
  const initialPage = config?.initialPage ?? 1;

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

  const offset = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    cursors,
    hasNextPage,
    hasPreviousPage: currentPage > 1,
    totalCount,

    goToPage,
    nextPage,
    previousPage,
    reset,

    setCursors,
    addCursor,
    setHasNextPage,
    setTotalCount,

    offset,
  };
}
