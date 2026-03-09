/**
 * Performance Optimization Snippets
 *
 * Reusable patterns for performance optimization
 */

"use client";

import React from "react";

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Lazy load component
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = React.lazy(importFn);

  return (props: React.ComponentProps<T>) =>
    React.createElement(
      React.Suspense,
      { fallback: fallback || React.createElement("div", {}, "Loading...") },
      React.createElement(LazyComponent, props),
    );
}

/**
 * Batch updates to avoid multiple re-renders
 */
export function batchUpdate(updates: (() => void)[]): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    requestIdleCallback(() => {
      updates.forEach((update) => update());
    });
  } else {
    setTimeout(() => {
      updates.forEach((update) => update());
    }, 0);
  }
}

/**
 * Optimize image loading
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map((src) => preloadImage(src)));
}

/**
 * Virtual scroll helper
 */
export function calculateVisibleItems(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3,
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);

  return { start, end };
}

/**
 * Debounced scroll handler
 */
export function createDebouncedScroll(
  callback: (scrollTop: number) => void,
  delay: number = 100,
): EventListener {
  let timeoutId: NodeJS.Timeout;

  return (event: Event) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const target = event.target as HTMLElement;
      callback(target.scrollTop);
    }, delay);
  };
}

/**
 * Optimize re-renders with shallow comparison
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => obj1[key] === obj2[key]);
}

/**
 * Cache API responses
 */
const apiCache = new Map<string, { data: any; timestamp: number }>();

export async function cachedFetch<T>(
  url: string,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
): Promise<T> {
  const cached = apiCache.get(url);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const response = await fetch(url);
  const data = await response.json();

  apiCache.set(url, { data, timestamp: Date.now() });

  return data;
}

/**
 * Clear stale cache entries
 */
export function clearStaleCache(maxAge: number = 10 * 60 * 1000): void {
  const now = Date.now();

  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > maxAge) {
      apiCache.delete(key);
    }
  }
}

/**
 * Chunk array for batch processing
 */
export function* chunkGenerator<T>(
  array: T[],
  chunkSize: number,
): Generator<T[]> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

/**
 * Process array in chunks to avoid blocking
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 100,
): Promise<R[]> {
  const results: R[] = [];

  for (const chunk of chunkGenerator(items, chunkSize)) {
    const chunkResults = chunk.map(processor);
    results.push(...chunkResults);

    // Yield to browser
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}
