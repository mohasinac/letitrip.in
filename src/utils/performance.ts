/**
 * Performance Utilities
 * Tools for optimizing performance and measuring metrics
 */

/**
 * Debounce function
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
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load utility
 */
export function lazyLoad<T>(
  importFunc: () => Promise<T>,
  fallback?: T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    importFunc()
      .then(resolve)
      .catch((error) => {
        console.error("Lazy load error:", error);
        if (fallback) {
          resolve(fallback);
        } else {
          reject(error);
        }
      });
  });
}

/**
 * Memoize function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
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
 * Performance monitor
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (!start) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(label);

    return duration;
  }

  endAndLog(label: string): void {
    const duration = this.end(label);
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Request Animation Frame with fallback
 */
export const requestAnimFrame =
  (typeof window !== "undefined" && window.requestAnimationFrame) ||
  function (callback: FrameRequestCallback) {
    return setTimeout(callback, 1000 / 60);
  };

/**
 * Cancel Animation Frame with fallback
 */
export const cancelAnimFrame =
  (typeof window !== "undefined" && window.cancelAnimationFrame) ||
  function (id: number) {
    clearTimeout(id);
  };

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Optimize animation frame
 */
export function optimizeAnimation(
  callback: () => void,
  fps: number = 60,
): () => void {
  let lastTime = 0;
  const interval = 1000 / fps;
  let animationId: number;

  const animate = (currentTime: number) => {
    animationId = requestAnimFrame(animate);

    const deltaTime = currentTime - lastTime;

    if (deltaTime >= interval) {
      lastTime = currentTime - (deltaTime % interval);
      callback();
    }
  };

  animationId = requestAnimFrame(animate);

  // Return cleanup function
  return () => cancelAnimFrame(animationId);
}

/**
 * Batch updates to reduce re-renders
 */
export function batchUpdates<T>(
  updates: Array<() => T>,
  batchSize: number = 10,
): Promise<T[]> {
  return new Promise((resolve) => {
    const results: T[] = [];
    let index = 0;

    function processBatch() {
      const batch = updates.slice(index, index + batchSize);

      batch.forEach((update) => {
        results.push(update());
      });

      index += batchSize;

      if (index < updates.length) {
        requestAnimFrame(processBatch);
      } else {
        resolve(results);
      }
    }

    processBatch();
  });
}

/**
 * Intersection Observer helper
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
}

/**
 * Image preloader
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload images
 */
export async function preloadImages(
  urls: string[],
): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map((url) => preloadImage(url)));
}
