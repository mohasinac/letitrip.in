/**
 * Caching Strategy - Phase 9.1
 * 
 * Comprehensive caching utilities for API responses, images, and data.
 * Works with React Query for server state management.
 * 
 * Features:
 * - Stale-while-revalidate pattern
 * - Cache invalidation strategies
 * - LocalStorage caching
 * - SessionStorage caching
 * - Memory cache
 * - Service Worker cache (future)
 */

/**
 * Cache durations in milliseconds
 */
export const CACHE_TIMES = {
  /** 1 minute - Frequently changing data */
  REALTIME: 1 * 60 * 1000,
  /** 5 minutes - Default for most data */
  SHORT: 5 * 60 * 1000,
  /** 15 minutes - Semi-static data */
  MEDIUM: 15 * 60 * 1000,
  /** 1 hour - Static data */
  LONG: 60 * 60 * 1000,
  /** 24 hours - Very static data */
  VERY_LONG: 24 * 60 * 60 * 1000,
  /** 7 days - Rarely changing data */
  PERMANENT: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * React Query default options
 * 
 * @example
 * import { QueryClient } from '@tanstack/react-query';
 * import { queryClientConfig } from '@/lib/caching';
 * 
 * const queryClient = new QueryClient({ defaultOptions: queryClientConfig });
 */
export const queryClientConfig = {
  queries: {
    // Time until data is considered stale
    staleTime: CACHE_TIMES.SHORT,
    // Time until inactive queries are garbage collected
    gcTime: CACHE_TIMES.LONG,
    // Retry failed requests
    retry: 1,
    // Refetch on window focus
    refetchOnWindowFocus: false,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Refetch on mount
    refetchOnMount: false,
  },
  mutations: {
    // Retry failed mutations
    retry: 1,
  },
};

/**
 * Cache keys for React Query
 * Centralized to prevent typos and enable easy invalidation
 */
export const CACHE_KEYS = {
  // Products
  products: {
    all: ["products"] as const,
    lists: () => ["products", "list"] as const,
    list: (filters: Record<string, any>) => ["products", "list", filters] as const,
    details: () => ["products", "detail"] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    search: (query: string) => ["products", "search", query] as const,
  },
  
  // Auctions
  auctions: {
    all: ["auctions"] as const,
    lists: () => ["auctions", "list"] as const,
    list: (filters: Record<string, any>) => ["auctions", "list", filters] as const,
    details: () => ["auctions", "detail"] as const,
    detail: (slug: string) => ["auctions", "detail", slug] as const,
    bids: (auctionId: string) => ["auctions", "bids", auctionId] as const,
  },
  
  // Categories
  categories: {
    all: ["categories"] as const,
    tree: () => ["categories", "tree"] as const,
    detail: (slug: string) => ["categories", "detail", slug] as const,
  },
  
  // Shops
  shops: {
    all: ["shops"] as const,
    lists: () => ["shops", "list"] as const,
    list: (filters: Record<string, any>) => ["shops", "list", filters] as const,
    detail: (slug: string) => ["shops", "detail", slug] as const,
  },
  
  // Users
  users: {
    current: () => ["users", "current"] as const,
    profile: (userId: string) => ["users", "profile", userId] as const,
    orders: (userId: string) => ["users", "orders", userId] as const,
  },
  
  // Cart
  cart: {
    current: () => ["cart"] as const,
  },
  
  // Orders
  orders: {
    all: (userId: string) => ["orders", userId] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },
  
  // Search
  search: {
    global: (query: string) => ["search", "global", query] as const,
    suggestions: (query: string) => ["search", "suggestions", query] as const,
  },
} as const;

/**
 * LocalStorage cache with expiration
 */
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = "app_cache_") {
    this.prefix = prefix;
  }

  /**
   * Set item in cache with expiration
   */
  set<T>(key: string, value: T, expiresIn: number = CACHE_TIMES.MEDIUM): void {
    try {
      const item = {
        value,
        expiresAt: Date.now() + expiresIn,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error("LocalStorage cache set error:", error);
    }
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      console.error("LocalStorage cache get error:", error);
      return null;
    }
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error("LocalStorage cache remove error:", error);
    }
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("LocalStorage cache clear error:", error);
    }
  }

  /**
   * Clear expired items
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error("LocalStorage cache clearExpired error:", error);
    }
  }
}

/**
 * Memory cache for fast access
 */
export class MemoryCache {
  private cache: Map<string, { value: any; expiresAt: number }>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, value: T, expiresIn: number = CACHE_TIMES.SHORT): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + expiresIn,
    });
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Check if key exists and not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired items
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Global memory cache instance
 */
export const memoryCache = new MemoryCache();

/**
 * Global localStorage cache instance
 */
export const localStorageCache = new LocalStorageCache();

/**
 * Preload data into cache
 */
export async function preloadData(
  key: string,
  fetcher: () => Promise<any>,
  expiresIn: number = CACHE_TIMES.SHORT,
): Promise<void> {
  try {
    const data = await fetcher();
    memoryCache.set(key, data, expiresIn);
  } catch (error) {
    console.error(`Failed to preload data for key ${key}:`, error);
  }
}

/**
 * Clear all caches (memory + localStorage)
 */
export function clearAllCaches(): void {
  memoryCache.clear();
  localStorageCache.clear();
}
