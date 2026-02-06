/**
 * Cache Manager Class
 *
 * Singleton class for managing application cache
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;

  private constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(maxSize?: number): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(maxSize);
    }
    return CacheManager.instance;
  }

  /**
   * Set cache entry
   */
  public set<T>(key: string, value: T, options?: CacheOptions): void {
    // Enforce max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: options?.ttl,
    });
  }

  /**
   * Get cache entry
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean expired entries
   */
  public cleanExpired(): number {
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    size: number;
    maxSize: number;
    utilizationPercent: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100,
    };
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
