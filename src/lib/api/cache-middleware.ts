/**
 * API Response Caching Middleware
 *
 * Implements server-side caching for API routes to improve performance.
 * Uses CacheManager singleton for in-memory caching with TTL support.
 *
 * @example
 * ```typescript
 * import { withCache } from '@/lib/api/cache-middleware';
 *
 * export const GET = withCache(
 *   async (request: NextRequest) => {
 *     // Your handler logic
 *   },
 *   { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
 * );
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { CacheManager } from "@/classes";

export interface CacheConfig {
  /**
   * Time to live in milliseconds
   * @default 5 * 60 * 1000 (5 minutes)
   */
  ttl?: number;

  /**
   * Whether to include query parameters in cache key
   * @default true
   */
  includeQuery?: boolean;

  /**
   * Custom cache key generator
   */
  keyGenerator?: (request: NextRequest) => string;

  /**
   * Whether to bypass cache (for admin/auth routes)
   * @default false
   */
  bypassCache?: boolean;

  /**
   * Cache only for specific HTTP methods
   * @default ['GET']
   */
  methods?: string[];
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const cache = CacheManager.getInstance(500); // Max 500 cached responses

/**
 * Generate cache key from request
 */
function generateCacheKey(request: NextRequest, config: CacheConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(request);
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (config.includeQuery !== false && url.search) {
    return `${path}${url.search}`;
  }

  return path;
}

/**
 * Check if response should be cached
 */
function shouldCache(request: NextRequest, config: CacheConfig): boolean {
  // Bypass cache if configured
  if (config.bypassCache) {
    return false;
  }

  // Only cache specified methods (default: GET)
  const methods = config.methods || ["GET"];
  if (!methods.includes(request.method)) {
    return false;
  }

  // Don't cache authenticated requests (has session cookie)
  const sessionCookie = request.cookies.get("__session");
  if (sessionCookie) {
    return false;
  }

  return true;
}

/**
 * Cache middleware wrapper for API routes
 */
export function withCache(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  config: CacheConfig = {},
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const cacheEnabled = shouldCache(request, config);

    if (!cacheEnabled) {
      return handler(request, context);
    }

    const cacheKey = generateCacheKey(request, config);

    // Check cache first
    const cachedResponse = cache.get<{
      body: any;
      status: number;
      headers: Record<string, string>;
    }>(cacheKey);

    if (cachedResponse) {
      // Return cached response
      const response = NextResponse.json(cachedResponse.body, {
        status: cachedResponse.status,
        headers: {
          ...cachedResponse.headers,
          "X-Cache-Hit": "true",
          "X-Cache-Key": cacheKey,
        },
      });

      return response;
    }

    // Execute handler
    const response = await handler(request, context);

    // Cache successful responses (200-299)
    if (response.status >= 200 && response.status < 300) {
      try {
        const body = await response.clone().json();
        const headers: Record<string, string> = {};

        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        cache.set(
          cacheKey,
          { body, status: response.status, headers },
          { ttl: config.ttl || DEFAULT_TTL },
        );

        // Add cache headers to original response
        const newResponse = NextResponse.json(body, {
          status: response.status,
          headers: {
            ...headers,
            "X-Cache-Hit": "false",
            "X-Cache-Key": cacheKey,
            "X-Cache-TTL": String(config.ttl || DEFAULT_TTL),
          },
        });

        return newResponse;
      } catch (error) {
        // If response is not JSON, return original
        return response;
      }
    }

    return response;
  };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern?: string | RegExp): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  const keys = cache.keys();

  if (typeof pattern === "string") {
    // Simple string prefix match
    for (const key of keys) {
      if (key.startsWith(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Regex pattern match
    for (const key of keys) {
      if (pattern.test(key)) {
        cache.delete(key);
      }
    }
  }
}

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
