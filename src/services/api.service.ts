import { trackSlowAPI, trackAPIError, trackCacheHit } from "@/lib/analytics";

// API Service - Base HTTP client with request deduplication
class ApiService {
  private baseUrl: string;
  private pendingRequests: Map<string, Promise<any>>;
  private cacheHits: Map<string, number>;
  private cacheMisses: Map<string, number>;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
    this.pendingRequests = new Map();
    this.cacheHits = new Map();
    this.cacheMisses = new Map();
  }

  /**
   * Generate a unique cache key for a request
   * Combines URL, method, and body to create a unique identifier
   */
  private getCacheKey(url: string, method: string, body?: string): string {
    return `${method}:${url}${body ? `:${body}` : ""}`;
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
    });

    // Store in pending requests
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Handle server-side requests (when baseUrl is relative)
    let url = `${this.baseUrl}${endpoint}`;

    // In server-side context, convert to absolute URL
    if (typeof window === "undefined" && !url.startsWith("http")) {
      const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      url = `${host}${url}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
        throw new Error(
          `Too many requests. Please try again in ${retryAfter} seconds.`
        );
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
        throw new Error("Access forbidden. You do not have permission.");
      }

      // Handle not found
      if (response.status === 404) {
        throw new Error("Resource not found.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      return data;
    } catch (error) {
      // Track API errors
      trackAPIError(endpoint, error);

      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    hits: Record<string, number>;
    misses: Record<string, number>;
    hitRate: number;
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

    return { hits, misses, hitRate };
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Create cache key for deduplication
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url, "GET");

    // Deduplicate GET requests (safe since GET is idempotent)
    return this.deduplicateRequest(cacheKey, () =>
      this.request<T>(endpoint, {
        ...options,
        method: "GET",
      })
    );
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
}

export const apiService = new ApiService();
