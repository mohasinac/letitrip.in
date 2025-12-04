import { DEFAULT_CACHE_CONFIG } from "@/config/cache.config";
import { trackAPIError, trackCacheHit, trackSlowAPI } from "@/lib/analytics";
import { logError } from "@/lib/firebase-error-logger";

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache configuration per endpoint
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: number; // Additional time to serve stale content
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  retryableStatuses: number[];
}

// API Service - Base HTTP client with request deduplication and stale-while-revalidate caching
class ApiService {
  private baseUrl: string;
  private pendingRequests: Map<string, Promise<any>>;
  private cacheHits: Map<string, number>;
  private cacheMisses: Map<string, number>;
  private cache: Map<string, CacheEntry<any>>;
  private cacheConfig: Map<string, CacheConfig>;
  private abortControllers: Map<string, AbortController>;
  private retryConfig: RetryConfig;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
    this.pendingRequests = new Map();
    this.cacheHits = new Map();
    this.cacheMisses = new Map();
    this.cache = new Map();
    this.cacheConfig = new Map();
    this.abortControllers = new Map();

    // Default retry configuration
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000, // Start with 1 second
      retryableStatuses: [408, 429, 500, 502, 503, 504],
    };

    // Set default cache configurations
    this.initializeCacheConfig();
  }

  /**
   * Initialize cache configuration for different endpoints
   * Loads from centralized cache config file
   */
  private initializeCacheConfig() {
    // Load default cache configurations
    for (const [pattern, config] of Object.entries(DEFAULT_CACHE_CONFIG)) {
      this.cacheConfig.set(pattern, {
        ttl: config.ttl,
        staleWhileRevalidate: config.staleWhileRevalidate,
      });
    }

    console.log(
      `[API Cache] Initialized ${this.cacheConfig.size} cache configurations`
    );
  }

  /**
   * Get cache configuration for an endpoint
   */
  private getCacheConfigForEndpoint(endpoint: string): CacheConfig | null {
    // Check if endpoint matches any configured cache pattern
    for (const [pattern, config] of this.cacheConfig.entries()) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }
    return null;
  }

  /**
   * Check if cached data is still fresh
   */
  private isFresh(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Check if cached data is stale but can be served while revalidating
   */
  private isStaleButUsable(
    entry: CacheEntry<any>,
    config: CacheConfig
  ): boolean {
    const staleUntil = entry.expiresAt + (config.staleWhileRevalidate || 0);
    return Date.now() < staleUntil;
  }

  /**
   * Get data from cache
   */
  private getCachedData<T>(
    cacheKey: string,
    config: CacheConfig | null
  ): {
    data: T | null;
    status: "fresh" | "stale" | "miss";
  } {
    if (!config) {
      return { data: null, status: "miss" };
    }

    const entry = this.cache.get(cacheKey);
    if (!entry) {
      return { data: null, status: "miss" };
    }

    if (this.isFresh(entry)) {
      return { data: entry.data, status: "fresh" };
    }

    if (this.isStaleButUsable(entry, config)) {
      return { data: entry.data, status: "stale" };
    }

    // Entry is too old, remove it
    this.cache.delete(cacheKey);
    return { data: null, status: "miss" };
  }

  /**
   * Set data in cache
   */
  private setCachedData<T>(cacheKey: string, data: T, config: CacheConfig) {
    const now = Date.now();
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + config.ttl,
    });
  }

  /**
   * Generate a unique cache key for a request
   * Combines URL, method, and body to create a unique identifier
   */
  private getCacheKey(url: string, method: string, body?: string): string {
    return `${method}:${url}${body ? `:${body}` : ""}`;
  }

  /**
   * Sleep for exponential backoff retry
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Exponential backoff calculation
   */
  private getRetryDelay(attempt: number): number {
    return this.retryConfig.retryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return true;
    }

    // Retryable status codes
    if (
      error.status &&
      this.retryConfig.retryableStatuses.includes(error.status)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Abort pending request
   */
  abortRequest(cacheKey: string): void {
    const controller = this.abortControllers.get(cacheKey);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(cacheKey);
      this.pendingRequests.delete(cacheKey);
      console.log(`[API] Aborted request: ${cacheKey}`);
    }
  }

  /**
   * Abort all pending requests matching pattern
   */
  abortRequestsMatching(pattern: string): void {
    let count = 0;
    for (const key of this.abortControllers.keys()) {
      if (key.includes(pattern)) {
        this.abortRequest(key);
        count++;
      }
    }
    console.log(`[API] Aborted ${count} requests matching: ${pattern}`);
  }

  /**
   * Check if there's a pending request for the same endpoint
   * If yes, return the existing promise to avoid duplicate requests
   */
  private async deduplicateRequest<T>(
    cacheKey: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if there's already a pending request
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`[API] Deduplicating request: ${cacheKey}`);
      // Track cache hit
      const hits = this.cacheHits.get(cacheKey) || 0;
      this.cacheHits.set(cacheKey, hits + 1);
      trackCacheHit(cacheKey, true);
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Track cache miss
    const misses = this.cacheMisses.get(cacheKey) || 0;
    this.cacheMisses.set(cacheKey, misses + 1);
    trackCacheHit(cacheKey, false);

    // Create new request
    const requestPromise = requestFn().finally(() => {
      // Remove from pending requests when complete
      this.pendingRequests.delete(cacheKey);
      this.abortControllers.delete(cacheKey);
    });

    // Store in pending requests
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    // Handle server-side requests (when baseUrl is relative)
    let url = `${this.baseUrl}${endpoint}`;

    // In server-side context, convert to absolute URL
    if (typeof window === "undefined" && !url.startsWith("http")) {
      const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      url = `${host}${url}`;
    }

    // Create AbortController for this request
    const cacheKey = this.getCacheKey(
      url,
      options.method || "GET",
      typeof options.body === "string" ? options.body : undefined
    );
    const controller = new AbortController();
    this.abortControllers.set(cacheKey, controller);

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    };

    // Track request start time
    const startTime = Date.now();

    try {
      const response = await fetch(url, config);

      // Track response time
      const duration = Date.now() - startTime;
      trackSlowAPI(endpoint, duration);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const error = new Error(
          `Too many requests. Please try again in ${retryAfter} seconds.`
        ) as any;
        error.status = 429;
        throw error;
      }

      // Handle unauthorized
      if (response.status === 401) {
        // Clear local storage but DON'T redirect automatically
        // Let the calling code handle the redirect to avoid loops
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }

        // Create error with status code for better handling
        const error = new Error("Unauthorized. Please log in again.") as any;
        error.status = 401;
        error.response = { status: 401 };
        throw error;
      }

      // Handle forbidden
      if (response.status === 403) {
        const error = new Error(
          "Access forbidden. You do not have permission."
        ) as any;
        error.status = 403;
        throw error;
      }

      // Handle not found
      if (response.status === 404) {
        const error = new Error("Resource not found.") as any;
        error.status = 404;
        throw error;
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(
          data.error || data.message || "Request failed"
        ) as any;
        error.status = response.status;
        throw error;
      }

      // Clean up abort controller on success
      this.abortControllers.delete(cacheKey);

      return data;
    } catch (error: any) {
      // Clean up abort controller
      this.abortControllers.delete(cacheKey);

      // Don't retry if request was aborted
      if (error.name === "AbortError") {
        console.log(`[API] Request aborted: ${endpoint}`);
        throw new Error("Request cancelled");
      }

      // Track API errors
      trackAPIError(endpoint, error);

      // Retry logic with exponential backoff
      if (
        attempt < this.retryConfig.maxRetries &&
        this.isRetryableError(error)
      ) {
        const delay = this.getRetryDelay(attempt);
        console.log(
          `[API] Retry ${attempt}/${this.retryConfig.maxRetries} after ${delay}ms: ${endpoint}`
        );

        await this.sleep(delay);
        return this.request<T>(endpoint, options, attempt + 1);
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  /**
   * Clear cache for specific endpoint pattern
   */
  invalidateCache(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(
      `[API Cache] Invalidated ${count} entries matching: ${pattern}`
    );
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[API Cache] Cleared ${size} entries`);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    hits: Record<string, number>;
    misses: Record<string, number>;
    hitRate: number;
    cacheSize: number;
    oldestEntry: number | null;
  } {
    const hits = Object.fromEntries(this.cacheHits);
    const misses = Object.fromEntries(this.cacheMisses);

    const totalHits = Array.from(this.cacheHits.values()).reduce(
      (a, b) => a + b,
      0
    );
    const totalMisses = Array.from(this.cacheMisses.values()).reduce(
      (a, b) => a + b,
      0
    );
    const hitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;

    // Get oldest cache entry
    let oldestTimestamp: number | null = null;
    for (const entry of this.cache.values()) {
      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      hits,
      misses,
      hitRate,
      cacheSize: this.cache.size,
      oldestEntry: oldestTimestamp,
    };
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Create cache key for deduplication and caching
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, "GET");

    // Get cache configuration for this endpoint
    const cacheConfig = this.getCacheConfigForEndpoint(endpoint);

    // Check cache first
    const cached = this.getCachedData<T>(cacheKey, cacheConfig);

    if (cached.status === "fresh") {
      // Return fresh cached data immediately
      console.log(`[API Cache] Fresh hit: ${endpoint}`);
      const hits = this.cacheHits.get(cacheKey) || 0;
      this.cacheHits.set(cacheKey, hits + 1);
      trackCacheHit(cacheKey, true);
      return cached.data!;
    }

    if (cached.status === "stale") {
      // Return stale data immediately, revalidate in background
      console.log(`[API Cache] Stale-while-revalidate: ${endpoint}`);
      const hits = this.cacheHits.get(cacheKey) || 0;
      this.cacheHits.set(cacheKey, hits + 1);
      trackCacheHit(cacheKey, true);

      // Trigger background revalidation (don't await)
      this.deduplicateRequest(cacheKey, () =>
        this.request<T>(endpoint, {
          ...options,
          method: "GET",
        })
      )
        .then((freshData) => {
          // Update cache with fresh data
          if (cacheConfig) {
            this.setCachedData(cacheKey, freshData, cacheConfig);
          }
        })
        .catch((error) => {
          logError(error as Error, {
            component: "ApiService.getCached",
            metadata: { endpoint },
          });
        });

      return cached.data!;
    }

    // Cache miss - fetch fresh data
    console.log(`[API Cache] Miss: ${endpoint}`);
    const misses = this.cacheMisses.get(cacheKey) || 0;
    this.cacheMisses.set(cacheKey, misses + 1);
    trackCacheHit(cacheKey, false);

    // Deduplicate and fetch
    const data = await this.deduplicateRequest(cacheKey, () =>
      this.request<T>(endpoint, {
        ...options,
        method: "GET",
      })
    );

    // Store in cache if config exists
    if (cacheConfig) {
      this.setCachedData(cacheKey, data, cacheConfig);
    }

    return data;
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    // For POST requests, include body in cache key for idempotent operations
    // This allows deduplication of identical POST requests (e.g., search queries)
    const url = `${this.baseUrl}${endpoint}`;
    const body = data ? JSON.stringify(data) : undefined;
    const cacheKey = this.getCacheKey(url, "POST", body);

    // Only deduplicate if the POST is likely idempotent (same data)
    // This prevents duplicate submissions of forms/searches
    return this.deduplicateRequest(cacheKey, () =>
      this.request<T>(endpoint, {
        ...options,
        method: "POST",
        body,
      })
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Configure cache settings for an endpoint pattern
   * Allows runtime configuration of cache behavior
   *
   * @example
   * ```typescript
   * apiService.configureCacheFor('/products', {
   *   ttl: 10 * 60 * 1000,  // 10 minutes
   *   staleWhileRevalidate: 30 * 60 * 1000  // 30 minutes
   * });
   * ```
   */
  configureCacheFor(pattern: string, config: CacheConfig): void {
    this.cacheConfig.set(pattern, config);
    console.log(`[API Cache] Configured cache for ${pattern}:`, config);
  }

  /**
   * Remove cache configuration for an endpoint pattern
   * Disables caching for matching endpoints
   */
  removeCacheConfigFor(pattern: string): void {
    this.cacheConfig.delete(pattern);
    console.log(`[API Cache] Removed cache config for ${pattern}`);
  }

  /**
   * Get all cache configurations
   * Useful for debugging and admin panels
   */
  getCacheConfigurations(): Record<string, CacheConfig> {
    return Object.fromEntries(this.cacheConfig);
  }

  /**
   * Update cache TTL for an existing endpoint without changing stale time
   */
  updateCacheTTL(pattern: string, ttlMs: number): void {
    const existing = this.cacheConfig.get(pattern);
    if (existing) {
      existing.ttl = ttlMs;
      console.log(`[API Cache] Updated TTL for ${pattern}: ${ttlMs}ms`);
    } else {
      console.warn(`[API Cache] No cache config found for ${pattern}`);
    }
  }

  /**
   * Batch configure multiple endpoints at once
   *
   * @example
   * ```typescript
   * apiService.batchConfigureCache({
   *   '/products': { ttl: 300000, staleWhileRevalidate: 900000 },
   *   '/shops': { ttl: 600000, staleWhileRevalidate: 1800000 }
   * });
   * ```
   */
  batchConfigureCache(configs: Record<string, CacheConfig>): void {
    for (const [pattern, config] of Object.entries(configs)) {
      this.cacheConfig.set(pattern, config);
    }
    console.log(
      `[API Cache] Batch configured ${Object.keys(configs).length} endpoints`
    );
  }

  /**
   * Configure retry settings
   *
   * @example
   * ```typescript
   * apiService.configureRetry({
   *   maxRetries: 3,
   *   retryDelay: 1000,
   *   retryableStatuses: [408, 429, 500, 502, 503, 504]
   * });
   * ```
   */
  configureRetry(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
    console.log(`[API] Configured retry settings:`, this.retryConfig);
  }

  /**
   * Get current retry configuration
   */
  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }

  /**
   * Get all active abort controllers (for debugging)
   */
  getActiveRequests(): string[] {
    return Array.from(this.abortControllers.keys());
  }

  /**
   * Abort all pending requests
   */
  abortAllRequests(): void {
    const count = this.abortControllers.size;
    for (const key of Array.from(this.abortControllers.keys())) {
      this.abortRequest(key);
    }
    console.log(`[API] Aborted all ${count} pending requests`);
  }
}

export const apiService = new ApiService();
