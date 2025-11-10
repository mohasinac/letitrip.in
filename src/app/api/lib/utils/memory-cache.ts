/**
 * In-Memory Cache
 * Simple caching solution for small-scale deployments
 * NO external dependencies - 100% FREE
 */

interface CacheItem {
  data: any;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  /**
   * Set a value in cache with TTL
   */
  set(key: string, value: any, ttlSeconds: number = 300): void {
    // Auto-cleanup if cache is too large
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Get a value from cache
   */
  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.data;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const memoryCache = new MemoryCache(500);

// Periodic cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cleaned = memoryCache.cleanup();
    if (cleaned > 0) {
      console.log(`[MemoryCache] Cleaned ${cleaned} expired entries`);
    }
  }, 5 * 60 * 1000);
}

// Export class for testing
export { MemoryCache };
