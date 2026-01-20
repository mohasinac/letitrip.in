/**
 * Performance Utilities - Phase 9.1
 *
 * Utilities for performance optimization, monitoring, and lazy loading.
 *
 * Features:
 * - Dynamic imports for code splitting
 * - Lazy component loading
 * - Intersection Observer for lazy loading
 * - Performance monitoring
 * - Web Vitals tracking
 */

import { ComponentType, LazyExoticComponent, lazy } from "react";

/**
 * Lazy load a component with optional loading fallback
 *
 * @example
 * const ProductList = lazyLoad(() => import('./ProductList'));
 * <Suspense fallback={<Skeleton />}><ProductList /></Suspense>
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(importFunc);
}

/**
 * Lazy load a named export from a module
 *
 * @example
 * const Button = lazyLoadNamed(() => import('./components'), 'Button');
 */
export function lazyLoadNamed<T extends ComponentType<any>>(
  importFunc: () => Promise<{ [key: string]: T }>,
  exportName: string,
): LazyExoticComponent<T> {
  return lazy(() =>
    importFunc().then((module) => ({
      default: module[exportName] as T,
    })),
  );
}

/**
 * Preload a component for faster initial render
 * Call this on hover or route prefetch
 *
 * @example
 * <Link onMouseEnter={() => preloadComponent(() => import('./ProductDetails'))}>
 *   View Product
 * </Link>
 */
export function preloadComponent<T>(
  importFunc: () => Promise<{ default: T }>,
): Promise<{ default: T }> {
  return importFunc();
}

/**
 * Check if component is within viewport using Intersection Observer
 *
 * @example
 * const ref = useRef(null);
 * const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });
 * if (isVisible) {
 *   // Load heavy component
 * }
 */
export function createIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {},
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px", // Start loading 50px before entering viewport
    threshold: 0.1, // Trigger when 10% visible
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      callback(entry.isIntersecting);
    });
  }, defaultOptions);
}

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Mark a performance point
   */
  mark(name: string): void {
    if (typeof window !== "undefined" && window.performance?.mark) {
      window.performance.mark(name);
    }
  },

  /**
   * Measure performance between two marks
   */
  measure(
    name: string,
    startMark: string,
    endMark: string,
  ): PerformanceMeasure | null {
    if (typeof window !== "undefined" && window.performance?.measure) {
      try {
        return window.performance.measure(name, startMark, endMark);
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
        return null;
      }
    }
    return null;
  },

  /**
   * Get all performance entries of a type
   */
  getEntries(type: string): PerformanceEntry[] {
    if (typeof window !== "undefined" && window.performance?.getEntriesByType) {
      return window.performance.getEntriesByType(type);
    }
    return [];
  },

  /**
   * Clear all performance marks and measures
   */
  clear(): void {
    if (typeof window !== "undefined") {
      window.performance?.clearMarks?.();
      window.performance?.clearMeasures?.();
    }
  },

  /**
   * Get current memory usage (Chrome only)
   */
  getMemoryUsage(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null {
    if (
      typeof window !== "undefined" &&
      "performance" in window &&
      "memory" in (window.performance as any)
    ) {
      const memory = (window.performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
};

/**
 * Web Vitals metrics
 */
export interface WebVitalsMetric {
  id: string;
  name: "FCP" | "LCP" | "CLS" | "FID" | "TTFB" | "INP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

/**
 * Report Web Vitals to analytics
 *
 * @example
 * // In app/layout.tsx
 * export function reportWebVitals(metric: WebVitalsMetric) {
 *   logWebVital(metric);
 * }
 */
export function logWebVital(metric: WebVitalsMetric): void {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // Example: Send to Google Analytics
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", metric.name, {
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value,
        ),
        event_category: "Web Vitals",
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Example: Send to custom analytics endpoint
    fetch("/api/analytics/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metric),
    }).catch((error) => {
      console.error("Failed to log Web Vital:", error);
    });
  }
}

/**
 * Prefetch data for a route
 *
 * @example
 * <Link href="/products" onMouseEnter={() => prefetchData('/api/products')}>
 *   Products
 * </Link>
 */
export async function prefetchData(url: string): Promise<void> {
  try {
    await fetch(url, {
      method: "HEAD", // Use HEAD to check availability without downloading
    });
  } catch (error) {
    console.warn(`Failed to prefetch ${url}:`, error);
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mediaQuery.matches;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request Idle Callback polyfill
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number },
): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback to setTimeout
  return setTimeout(callback, 1) as any;
}

/**
 * Cancel Idle Callback polyfill
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Check if connection is slow (Save-Data or slow-2g)
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;

  // Check for Save-Data header
  if ("connection" in navigator) {
    const conn = (navigator as any).connection;
    if (conn?.saveData) return true;
    if (conn?.effectiveType && ["slow-2g", "2g"].includes(conn.effectiveType)) {
      return true;
    }
  }

  return false;
}

/**
 * Get device pixel ratio for responsive images
 */
export function getDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Calculate optimal image size based on container and DPR
 */
export function getOptimalImageSize(
  containerWidth: number,
  maxWidth: number = 2000,
): number {
  const dpr = getDevicePixelRatio();
  const size = Math.min(Math.ceil(containerWidth * dpr), maxWidth);

  // Round to nearest common breakpoint for better caching
  const breakpoints = [320, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  return breakpoints.find((bp) => bp >= size) || size;
}
