import {
  type CacheConfig,
  withCache,
  invalidateCache,
} from "@mohasinac/appkit/next";

export { withCache, invalidateCache };

/**
 * Cache configuration presets
 */
export const CachePresets = {
  /**
   * Short-lived cache (1 minute)
   * For frequently changing data (products, auctions)
   */
  SHORT: { ttl: 1 * 60 * 1000 } as CacheConfig,

  /**
   * Medium cache (5 minutes) - DEFAULT
   * For moderately changing data (categories, reviews)
   */
  MEDIUM: { ttl: 5 * 60 * 1000 } as CacheConfig,

  /**
   * Long cache (30 minutes)
   * For rarely changing data (site settings, FAQs)
   */
  LONG: { ttl: 30 * 60 * 1000 } as CacheConfig,

  /**
   * Very long cache (2 hours)
   * For static data (homepage sections, carousel)
   */
  VERY_LONG: { ttl: 2 * 60 * 60 * 1000 } as CacheConfig,

  /**
   * No cache
   * For authenticated or real-time data
   */
  NO_CACHE: { bypassCache: true } as CacheConfig,
};
