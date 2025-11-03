/**
 * Cache Service
 * 
 * In-memory caching service using node-cache.
 * Used for caching static data (categories, settings) and
 * frequently accessed data (product listings) to reduce
 * Firestore reads and improve response times.
 * 
 * Cache Strategy:
 * - Static data (categories, settings): 1 hour TTL
 * - Dynamic data (products, search): 5 minutes TTL
 * - User-specific data (cart, orders): No caching
 */

import NodeCache from 'node-cache';

// Create cache instance
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone cached objects (better performance)
  maxKeys: 1000, // Maximum 1000 keys in cache
});

/**
 * Predefined cache keys for consistency
 */
export const CacheKeys = {
  // Static data (1 hour TTL)
  CATEGORIES: 'categories',
  CATEGORIES_TREE: 'categories:tree',
  CATEGORIES_LEAF: 'categories:leaf',
  SETTINGS: 'settings',
  HERO_SETTINGS: 'hero-settings',
  HERO_SLIDES: 'hero-slides',
  THEME_SETTINGS: 'theme-settings',
  
  // Dynamic data (5 minutes TTL)
  PRODUCT_LIST: (filters: string) => `products:${filters}`,
  PRODUCT_DETAIL: (slug: string) => `product:${slug}`,
  SEARCH_RESULTS: (query: string) => `search:${query}`,
  
  // Seller data (5 minutes TTL)
  SELLER_PRODUCTS: (sellerId: string) => `seller:${sellerId}:products`,
  SELLER_ORDERS: (sellerId: string) => `seller:${sellerId}:orders`,
  SELLER_ANALYTICS: (sellerId: string) => `seller:${sellerId}:analytics`,
};

/**
 * Cache TTL configurations (in seconds)
 */
export const CacheTTL = {
  STATIC: 3600, // 1 hour for static data
  SHORT: 300, // 5 minutes for dynamic data
  MEDIUM: 900, // 15 minutes for semi-static data
  LONG: 7200, // 2 hours for very static data
};

/**
 * Cache Service
 */
export const cacheService = {
  /**
   * Get value from cache
   */
  get: <T>(key: string): T | undefined => {
    return cache.get<T>(key);
  },

  /**
   * Set value in cache
   */
  set: <T>(key: string, value: T, ttl?: number): boolean => {
    return cache.set(key, value, ttl || 300);
  },

  /**
   * Delete one or more keys from cache
   */
  del: (key: string | string[]): number => {
    return cache.del(key);
  },

  /**
   * Check if key exists in cache
   */
  has: (key: string): boolean => {
    return cache.has(key);
  },

  /**
   * Flush all cache entries
   */
  flush: (): void => {
    cache.flushAll();
  },

  /**
   * Get all cache keys
   */
  keys: (): string[] => {
    return cache.keys();
  },

  /**
   * Get cache statistics
   */
  stats: () => {
    return cache.getStats();
  },

  /**
   * Get cache value or execute function and cache result
   */
  getOrSet: async <T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cached = cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fn();
    cache.set(key, value, ttl || 300);
    return value;
  },

  /**
   * Invalidate cache by pattern
   * Example: invalidatePattern('products:*') will delete all product cache entries
   */
  invalidatePattern: (pattern: string): number => {
    const keys = cache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    const matchingKeys = keys.filter((key) => regex.test(key));
    return cache.del(matchingKeys);
  },

  /**
   * Get cache memory usage
   */
  getMemoryUsage: (): { keys: number; ksize: number; vsize: number } => {
    const stats = cache.getStats();
    return {
      keys: stats.keys,
      ksize: stats.ksize,
      vsize: stats.vsize,
    };
  },
};

// Export default
export default cacheService;

// Log cache statistics every 5 minutes (in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const stats = cache.getStats();
    console.log('[Cache Stats]', {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits / (stats.hits + stats.misses),
      ksize: `${(stats.ksize / 1024).toFixed(2)} KB`,
      vsize: `${(stats.vsize / 1024 / 1024).toFixed(2)} MB`,
    });
  }, 5 * 60 * 1000);
}
