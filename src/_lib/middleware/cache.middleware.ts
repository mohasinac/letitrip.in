/**
 * Cache Middleware
 * 
 * Middleware for caching API responses.
 * Supports cache key generation, TTL configuration, and conditional caching.
 * 
 * Usage:
 * ```typescript
 * export const GET = withCache(handler, {
 *   keyGenerator: (req) => `products:${req.url}`,
 *   ttl: 300, // 5 minutes
 *   skip: (req) => req.headers.get('cache-control') === 'no-cache',
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import cacheService from '@/_lib/utils/cache';

export interface CacheOptions {
  /**
   * Function to generate cache key from request
   */
  keyGenerator: (req: NextRequest) => string;

  /**
   * Time-to-live in seconds (default: 300)
   */
  ttl?: number;

  /**
   * Function to determine if caching should be skipped
   */
  skip?: (req: NextRequest) => boolean;

  /**
   * Function to determine if response should be cached
   * Default: only cache 200 responses
   */
  shouldCache?: (response: Response) => boolean;

  /**
   * Add cache headers to response (default: true)
   */
  addHeaders?: boolean;
}

/**
 * Cache middleware wrapper
 */
export function withCache(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: CacheOptions
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Skip cache if specified
    if (options.skip && options.skip(req)) {
      const response = await handler(req, context);
      if (options.addHeaders !== false) {
        response.headers.set('X-Cache', 'SKIP');
      }
      return response;
    }

    // Skip cache if no-cache header present
    if (req.headers.get('cache-control') === 'no-cache') {
      const response = await handler(req, context);
      if (options.addHeaders !== false) {
        response.headers.set('X-Cache', 'BYPASS');
      }
      return response;
    }

    // Generate cache key
    const cacheKey = options.keyGenerator(req);

    // Try to get from cache
    const cached = cacheService.get<any>(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      
      if (options.addHeaders !== false) {
        response.headers.set('X-Cache', 'HIT');
        response.headers.set('Cache-Control', `public, max-age=${options.ttl || 300}`);
      }
      
      return response;
    }

    // Execute handler
    const response = await handler(req, context);

    // Check if response should be cached
    const shouldCache = options.shouldCache
      ? options.shouldCache(response)
      : response.status === 200;

    if (shouldCache) {
      try {
        // Clone response to read body
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        // Cache the data
        cacheService.set(cacheKey, data, options.ttl);

        // Return response with cache headers
        const cachedResponse = NextResponse.json(data, {
          status: response.status,
          headers: response.headers,
        });

        if (options.addHeaders !== false) {
          cachedResponse.headers.set('X-Cache', 'MISS');
          cachedResponse.headers.set(
            'Cache-Control',
            `public, max-age=${options.ttl || 300}`
          );
        }

        return cachedResponse;
      } catch (error) {
        // If caching fails, return original response
        console.error('[Cache Middleware] Failed to cache response:', error);
        if (options.addHeaders !== false) {
          response.headers.set('X-Cache', 'ERROR');
        }
        return response;
      }
    }

    // Don't cache, return original response
    if (options.addHeaders !== false) {
      response.headers.set('X-Cache', 'SKIP');
    }
    return response;
  };
}

/**
 * Helper: Generate cache key from URL and query params
 */
export function generateUrlCacheKey(req: NextRequest, prefix?: string): string {
  const url = new URL(req.url);
  const params = Array.from(url.searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const base = prefix || url.pathname.replace(/^\/api\//, '').replace(/\//g, ':');
  return params ? `${base}?${params}` : base;
}

/**
 * Helper: Skip cache for authenticated requests
 */
export function skipIfAuthenticated(req: NextRequest): boolean {
  return !!req.headers.get('authorization');
}

/**
 * Helper: Cache only successful GET requests
 */
export function cacheOnlyGet(req: NextRequest): boolean {
  return req.method !== 'GET';
}

// Export default
export default withCache;
