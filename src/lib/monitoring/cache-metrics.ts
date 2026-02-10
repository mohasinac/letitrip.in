/**
 * Cache Performance Metrics
 *
 * Tracks cache hit/miss rates and provides analytics dashboard
 */

import { CacheManager } from "@/classes";
import { trackEvent } from "./analytics";
import { logger } from "@/classes";

/**
 * Cache metrics storage
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  lastReset: string;
}

const METRICS_STORAGE_KEY = "cache_metrics";
const METRICS_RESET_INTERVAL = 3600000; // 1 hour in milliseconds

/**
 * Get current cache metrics
 */
export const getCacheMetrics = (): CacheMetrics => {
  if (typeof window === "undefined") {
    return {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      lastReset: new Date().toISOString(),
    };
  }

  const stored = localStorage.getItem(METRICS_STORAGE_KEY);
  if (!stored) {
    return initializeCacheMetrics();
  }

  try {
    const metrics = JSON.parse(stored) as CacheMetrics;

    // Reset metrics after interval
    const lastReset = new Date(metrics.lastReset).getTime();
    const now = Date.now();
    if (now - lastReset > METRICS_RESET_INTERVAL) {
      return initializeCacheMetrics();
    }

    return metrics;
  } catch {
    return initializeCacheMetrics();
  }
};

/**
 * Initialize cache metrics
 */
const initializeCacheMetrics = (): CacheMetrics => {
  const metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    lastReset: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  }

  return metrics;
};

/**
 * Update cache metrics
 */
const updateCacheMetrics = (metrics: CacheMetrics): void => {
  if (typeof window === "undefined") return;

  metrics.totalRequests = metrics.hits + metrics.misses;
  metrics.hitRate =
    metrics.totalRequests > 0
      ? (metrics.hits / metrics.totalRequests) * 100
      : 0;

  localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
};

/**
 * Record a cache hit
 *
 * @example
 * recordCacheHit('/api/products');
 */
export const recordCacheHit = (cacheKey: string): void => {
  const metrics = getCacheMetrics();
  metrics.hits++;
  updateCacheMetrics(metrics);

  // Track in analytics
  trackEvent("cache_hit", {
    cache_key: cacheKey,
    hit_rate: metrics.hitRate,
  });
};

/**
 * Record a cache miss
 *
 * @example
 * recordCacheMiss('/api/products');
 */
export const recordCacheMiss = (cacheKey: string): void => {
  const metrics = getCacheMetrics();
  metrics.misses++;
  updateCacheMetrics(metrics);

  // Track in analytics
  trackEvent("cache_miss", {
    cache_key: cacheKey,
    hit_rate: metrics.hitRate,
  });
};

/**
 * Reset cache metrics
 */
export const resetCacheMetrics = (): void => {
  initializeCacheMetrics();
};

/**
 * Get cache hit rate percentage
 */
export const getCacheHitRate = (): number => {
  const metrics = getCacheMetrics();
  return metrics.hitRate;
};

/**
 * Check if cache hit rate is below threshold
 *
 * @example
 * if (isCacheHitRateLow(70)) {
 *   console.warn('Cache hit rate is below 70%');
 * }
 */
export const isCacheHitRateLow = (threshold: number = 70): boolean => {
  const hitRate = getCacheHitRate();
  return hitRate < threshold;
};

/**
 * Get detailed cache statistics
 */
export const getCacheStatistics = (): {
  metrics: CacheMetrics;
  cacheSize: number;
  cacheKeys: string[];
} => {
  const cache = CacheManager.getInstance();
  const metrics = getCacheMetrics();

  return {
    metrics,
    cacheSize: cache.size(),
    cacheKeys: cache.keys(),
  };
};

/**
 * Cache monitoring dashboard data
 */
export const getCacheDashboardData = () => {
  const stats = getCacheStatistics();

  return {
    hitRate: `${stats.metrics.hitRate.toFixed(2)}%`,
    hits: stats.metrics.hits,
    misses: stats.metrics.misses,
    totalRequests: stats.metrics.totalRequests,
    cacheSize: stats.cacheSize,
    lastReset: new Date(stats.metrics.lastReset).toLocaleString(),
    status: stats.metrics.hitRate >= 70 ? "healthy" : "warning",
    recommendation:
      stats.metrics.hitRate < 70
        ? "Consider increasing cache TTL or investigating frequent misses"
        : "Cache performance is optimal",
  };
};

/**
 * Monitor cache performance and alert if hit rate is low
 * Call this periodically (e.g., every 5 minutes)
 */
export const monitorCachePerformance = (): void => {
  const hitRate = getCacheHitRate();

  if (hitRate < 50 && hitRate > 0) {
    logger.warn(`Cache hit rate is critically low: ${hitRate.toFixed(2)}%`);

    trackEvent("cache_performance_alert", {
      hit_rate: hitRate,
      severity: "high",
    });
  } else if (hitRate < 70 && hitRate > 0) {
    logger.warn(`Cache hit rate is below optimal: ${hitRate.toFixed(2)}%`);

    trackEvent("cache_performance_alert", {
      hit_rate: hitRate,
      severity: "medium",
    });
  }
};

/**
 * Setup automatic cache monitoring
 * Call this once in app initialization
 */
export const setupCacheMonitoring = (): void => {
  if (typeof window === "undefined") return;

  // Monitor every 5 minutes
  const MONITOR_INTERVAL = 300000; // 5 minutes
  setInterval(monitorCachePerformance, MONITOR_INTERVAL);

  // Initial check
  monitorCachePerformance();
};
