
/**
 * useInfiniteScroll Hook
 *
 * Framework-agnostic hook for detecting when user scrolls to bottom and triggering data loading.
 * Uses Intersection Observer API for efficient scroll detection.
 *
 * Features:
 * - Intersection Observer based
 * - Configurable threshold and root margin
 * - Debounced loading
 * - Loading and hasMore states
 * - Manual load trigger
 * - Disabled state support
 * - Automatic cleanup
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { observerRef, isIntersecting, loadMore } = useInfiniteScroll({
 *   onLoadMore: fetchNextPage,
 *   hasMore: hasNextPage,
 *   isLoading: isFetching
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <ItemCard key={item.id} item={item} />)}
 *     <div ref={observerRef}>
 *       {isFetching && <LoadingSpinner />}
 *       {!hasMore && <div>No more items</div>}
 *     </div>
 *   </div>
 * );
 *
 * // With custom threshold and margin
 * const { observerRef } = useInfiniteScroll({
 *   onLoadMore: loadMore,
 *   hasMore: true,
 *   threshold: 0.8,
 *   rootMargin: '200px', // Trigger 200px before visible
 *   debounceDelay: 300
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInfiniteScrollOptions {
  /** Callback to load more data */
  onLoadMore: () => void | Promise<void>;
  /** Whether there's more data to load */
  hasMore?: boolean;
  /** Whether currently loading */
  isLoading?: boolean;
  /** Intersection threshold (0-1, default: 0.5 = 50% visible) */
  threshold?: number;
  /** Root margin for intersection observer (default: "100px") */
  rootMargin?: string;
  /** Debounce delay in ms (default: 200) */
  debounceDelay?: number;
  /** Disabled state */
  disabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  /** Ref to attach to sentinel element */
  observerRef: (node: HTMLElement | null) => void;
  /** Whether sentinel is intersecting */
  isIntersecting: boolean;
  /** Manual trigger to load more */
  loadMore: () => void;
}

/**
 * Hook for implementing infinite scroll with Intersection Observer
 */
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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

      if (
        entry.isIntersecting &&
        hasMore &&
        !isLoadingRef.current &&
        !disabled
      ) {
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

export default useInfiniteScroll;
