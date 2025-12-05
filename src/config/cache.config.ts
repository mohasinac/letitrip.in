/**
 * @fileoverview Configuration
 * @module src/config/cache.config
 * @description This file contains functionality related to cache.config
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Cache Configuration
 *
 * Centralized cache TTL configuration for the API service.
 * This file can be modified to adjust caching behavior without code changes.
 *
 * TTL (Time To Live): How long data is considered fresh
 * Stale-While-Revalidate: Additional time to serve stale data while fetching fresh data
 */

/**
 * Cache Config Entry interface
 * @interface CacheConfigEntry
 */
export interface CacheConfigEntry {
  ttl: number; // Milliseconds
  staleWhileRevalidate?: number; // Milliseconds
  /** Description */
  description?: string;
}

/**
 * Default cache configurations for different endpoint patterns
 */
export const DEFAULT_CACHE_CONFIG: Record<string, CacheConfigEntry> = {
  // Products - Balance between freshness and performance
  "/products": {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: 15 * 60 * 1000, // 15 minutes
    /** Description */
    description: "Product listings and details",
  },

  // Auctions - Shorter TTL for real-time bidding
  "/auctions": {
    ttl: 2 * 60 * 1000, // 2 minutes
    staleWhileRevalidate: 5 * 60 * 1000, // 5 minutes
    /** Description */
    description: "Auction listings with real-time pricing",
  },

  // Categories - Rarely change, longer cache
  "/categories": {
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: 60 * 60 * 1000, // 1 hour
    /** Description */
    description: "Category tree and navigation",
  },

  // Shops - Moderate cache duration
  "/shops": {
    ttl: 10 * 60 * 1000, // 10 minutes
    staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
    /** Description */
    description: "Shop listings and profiles",
  },

  // Homepage - Frequent updates but not real-time
  "/homepage": {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: 15 * 60 * 1000, // 15 minutes
    /** Description */
    description: "Homepage content and featured items",
  },

  // Static assets - Very long cache (rarely change)
  "/static-assets": {
    ttl: 60 * 60 * 1000, // 1 hour
    staleWhileRevalidate: 24 * 60 * 60 * 1000, // 24 hours
    /** Description */
    description: "Hero slides, banners, static content",
  },

  // Orders - User-specific, short cache
  "/orders": {
    ttl: 1 * 60 * 1000, // 1 minute
    staleWhileRevalidate: 5 * 60 * 1000, // 5 minutes
    /** Description */
    description: "User orders and order history",
  },

  // Cart - Very short cache, near real-time
  "/cart": {
    ttl: 30 * 1000, // 30 seconds
    staleWhileRevalidate: 2 * 60 * 1000, // 2 minutes
    /** Description */
    description: "Shopping cart contents",
  },

  // Reviews - Moderate cache
  "/reviews": {
    ttl: 10 * 60 * 1000, // 10 minutes
    staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
    /** Description */
    description: "Product and shop reviews",
  },

  // User profile - Short cache for personalized content
  "/user": {
    ttl: 2 * 60 * 1000, // 2 minutes
    staleWhileRevalidate: 10 * 60 * 1000, // 10 minutes
    /** Description */
    description: "User profile and settings",
  },

  // Search results - Short cache due to dynamic queries
  "/search": {
    ttl: 3 * 60 * 1000, // 3 minutes
    staleWhileRevalidate: 10 * 60 * 1000, // 10 minutes
    /** Description */
    description: "Search results",
  },

  // Analytics - Longer cache, updated periodically
  "/analytics": {
    ttl: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: 60 * 60 * 1000, // 1 hour
    /** Description */
    description: "Dashboard analytics and statistics",
  },
};

/**
 * Environment-specific overrides
 * Use environment variables to override default cache settings
 */
/**
 * Retrieves environment cache config
 *
 * @returns {any} The environmentcacheconfig result
 *
 * @example
 * getEnvironmentCacheConfig();
 */

/**
 * Retrieves environment cache config
 *
 * @returns {any} The environmentcacheconfig result
 *
 * @example
 * getEnvironmentCacheConfig();
 */

export function getEnvironmentCacheConfig(): Record<string, CacheConfigEntry> {
  const config = { ...DEFAULT_CACHE_CONFIG };

  // Example: Override from environment variables
  // CACHE_PRODUCTS_TTL=600000 would set products cache to 10 minutes
  if (typeof window === "undefined" && process.env) {
    const envKeys = Object.keys(process.env).filter((key) =>
      key.startsWith("CACHE_"),
    );

    for (const key of envKeys) {
      const match = key.match(/CACHE_(.+)_(TTL|STALE)/);
      if (match) {
        const [, endpoint, type] = match;
        const pattern = `/${endpoint.toLowerCase().replace(/_/g, "-")}`;
        const value = parseInt(process.env[key] || "0", 10);

        if (value > 0) {
          config[pattern] = config[pattern] || { ttl: 0 };
          if (type === "TTL") {
            config[pattern].ttl = value;
          } else if (type === "STALE") {
            config[pattern].staleWhileRevalidate = value;
          }
        }
      }
    }
  }

  return config;
}

/**
 * Time constants for easy configuration
 */
export const TIME = {
  SECONDS_30: 30 * 1000,
  MINUTE_1: 60 * 1000,
  MINUTES_2: 2 * 60 * 1000,
  MINUTES_3: 3 * 60 * 1000,
  MINUTES_5: 5 * 60 * 1000,
  MINUTES_10: 10 * 60 * 1000,
  MINUTES_15: 15 * 60 * 1000,
  MINUTES_30: 30 * 60 * 1000,
  HOUR_1: 60 * 60 * 1000,
  HOURS_2: 2 * 60 * 60 * 1000,
  HOURS_6: 6 * 60 * 60 * 1000,
  HOURS_12: 12 * 60 * 60 * 1000,
  HOURS_24: 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache strategies for different use cases
 */
export const CACHE_STRATEGIES = {
  /**
   * Real-time: Very short cache for frequently changing data
   * Use for: Cart, live auctions, user notifications
   */
  REAL_TIME: {
    /** Ttl */
    ttl: TIME.SECONDS_30,
    /** Stale While Revalidate */
    staleWhileRevalidate: TIME.MINUTES_2,
  },

  /**
   * Dynamic: Short cache for personalized or frequently updated content
   * Use for: User profile, orders, search results
   */
  DYNAMIC: {
    /** Ttl */
    ttl: TIME.MINUTES_2,
    /** Stale While Revalidate */
    staleWhileRevalidate: TIME.MINUTES_10,
  },

  /**
   * Standard: Moderate cache for general content
   * Use for: Products, shops, reviews
   */
  STANDARD: {
    /** Ttl */
    ttl: TIME.MINUTES_5,
    /** Stale While Revalidate */
    staleWhileRevalidate: TIME.MINUTES_15,
  },

  /**
   * Extended: Longer cache for stable content
   * Use for: Categories, static pages
   */
  EXTENDED: {
    /** Ttl */
    ttl: TIME.MINUTES_30,
    /** Stale While Revalidate */
    staleWhileRevalidate: TIME.HOUR_1,
  },

  /**
   * Static: Very long cache for rarely changing content
   * Use for: Static assets, hero slides, banners
   */
  STATIC: {
    /** Ttl */
    ttl: TIME.HOUR_1,
    /** Stale While Revalidate */
    staleWhileRevalidate: TIME.HOURS_24,
  },

  /**
   * No cache: Disable caching completely
   * Use for: Payment processing, sensitive operations
   */
  NO_CACHE: {
    /** Ttl */
    ttl: 0,
    /** Stale While Revalidate */
    staleWhileRevalidate: 0,
  },
} as const;

/**
 * Helper function to create custom cache config
 */
/**
 * Creates a new cache config
 *
 * @param {number} ttlMinutes - The ttl minutes
 * @param {number} [staleMinutes] - The stale minutes
 *
 * @returns {number} The cacheconfig result
 *
 * @example
 * createCacheConfig(123, 123);
 */

/**
 * Creates a new cache config
 *
 * @returns {number} The cacheconfig result
 *
 * @example
 * createCacheConfig();
 */

export function createCacheConfig(
  /** Ttl Minutes */
  ttlMinutes: number,
  /** Stale Minutes */
  staleMinutes: number = ttlMinutes * 3,
): CacheConfigEntry {
  return {
    /** Ttl */
    ttl: ttlMinutes * 60 * 1000,
    /** Stale While Revalidate */
    staleWhileRevalidate: staleMinutes * 60 * 1000,
  };
}

/**
 * Get recommended cache strategy based on content type
 */
/**
 * Retrieves recommended strategy
 *
 * @returns {any} The recommendedstrategy result
 *
 * @example
 * getRecommendedStrategy();
 */

/**
 * Retrieves recommended strategy
 *
 * @returns {any} The recommendedstrategy result
 *
 * @example
 * getRecommendedStrategy();
 */

export function getRecommendedStrategy(
  /** Content Type */
  contentType:
    | "real-time"
    | "dynamic"
    | "standard"
    | "extended"
    | "static"
    | "no-cache",
): CacheConfigEntry {
  switch (contentType) {
    case "real-time":
      return CACHE_STRATEGIES.REAL_TIME;
    case "dynamic":
      return CACHE_STRATEGIES.DYNAMIC;
    case "standard":
      return CACHE_STRATEGIES.STANDARD;
    case "extended":
      return CACHE_STRATEGIES.EXTENDED;
    case "static":
      return CACHE_STRATEGIES.STATIC;
    case "no-cache":
      return CACHE_STRATEGIES.NO_CACHE;
  }
}
