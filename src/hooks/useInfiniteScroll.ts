/**
 * useInfiniteScroll Hook
 * Detects when user scrolls to bottom and triggers loading more data
 *
 * Purpose: Simplify infinite scroll implementation with Intersection Observer
 * Use with: React Query infinite queries for seamless data loading
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(...);
 * const { observerRef, isIntersecting } = useInfiniteScroll({
 *   onLoadMore: fetchNextPage,
 *   hasMore: hasNextPage,
 *   threshold: 0.5,
 * });
 *
 * // Attach to sentinel element
 * <div ref={observerRef}>Loading...</div>
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface UseInfiniteScrollOptions {
  /**
   * Callback to load more data
   */
  onLoadMore: () => void | Promise<void>;

  /**
   * Whether there's more data to load
   */
  hasMore?: boolean;

  /**
   * Whether currently loading
   */
  isLoading?: boolean;

  /**
   * Intersection threshold (0-1)
   * Default: 0.5 (50% visible)
   */
  threshold?: number;

  /**
   * Root margin for intersection observer
   * Default: "100px" (trigger 100px before element visible)
   */
  rootMargin?: string;

  /**
   * Debounce delay in ms
   * Default: 200
   */
  debounceDelay?: number;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  /**
   * Ref to attach to sentinel element
   */
  observerRef: (node: HTMLElement | null) => void;

  /**
   * Whether sentinel is intersecting
   */
  isIntersecting: boolean;

  /**
   * Manual trigger to load more
   */
  loadMore: () => void;
}

export function useInfiniteScroll(
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn {
  const {
    onLoadMore,
    hasMore = true,
    isLoading = false,
    threshold = 0.5,
    rootMargin = "100px",
    debounceDelay = 200,
    disabled = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(isLoading);

  // Keep loading state in ref to avoid stale closures
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current || disabled) return;

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the load more call
    debounceTimerRef.current = setTimeout(() => {
      onLoadMore();
    }, debounceDelay);
  }, [hasMore, disabled, debounceDelay, onLoadMore]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);

      if (entry.isIntersecting && hasMore && !isLoadingRef.current && !disabled) {
        loadMore();
      }
    },
    [hasMore, disabled, loadMore]
  );

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Update sentinel ref
      sentinelRef.current = node;

      if (!node || disabled) return;

      // Create new observer
      observerRef.current = new IntersectionObserver(handleObserver, {
        threshold,
        rootMargin,
      });

      observerRef.current.observe(node);
    },
    [handleObserver, threshold, rootMargin, disabled]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    observerRef: setRef,
    isIntersecting,
    loadMore,
  };
}
