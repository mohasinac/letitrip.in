/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/cache
 * @description This file contains functionality related to cache
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { memoryCache } from "@/app/api/lib/utils/memory-cache";

/**
 * CacheEntry interface
 * 
 * @interface
 * @description Defines the structure and contract for CacheEntry
 */
interface CacheEntry {
  /** Data */
  data: any;
  /** Timestamp */
  timestamp: number;
  /** Etag */
  etag: string;
}

/**
 * CacheConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for CacheConfig
 */
interface CacheConfig {
  /** Ttl */
  ttl?: number; // Time to live in seconds
  /** Key */
  key?: string; // Custom cache key
  /** Revalidate */
  revalidate?: number; // Next.js revalidation time
}

/**
 * Function: Generate E Tag
 */
/**
 * Performs generate e tag operation
 *
 * @param {any} data - Data object containing information
 *
 * @returns {string} The etag result
 */

/**
 * Performs generate e tag operation
 *
 * @param {any} data - Data object containing information
 *
 * @returns {string} The etag result
 */

function generateETag(data: any): string {
  const str = typeof data === "string" ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `"${Math.abs(hash).toString(36)}"`;
}

/**
 * Function: Cache
 */
/**
 * Performs cache operation
 *
 * @param {CacheConfig} [config] - The config
 *
 * @returns {any} The cache result
 *
 * @example
 * cache(config);
 */

/**
 * Performs cache operation
 *
 * @param {CacheConfig} [config] - The config
 *
 * @returns {any} The cache result
 *
 * @example
 * cache(config);
 */

export function cache(config: CacheConfig = {}) {
  const {
    ttl = 300, // 5 minutes default (in seconds)
    /** Key */
    key: customKey,
  } = config;

  return {
    /** Get */
    get: (req: NextRequest): CacheEntry | null => {
      const url = new URL(req.url);
      const cacheKey = customKey || `cache:${url.pathname}${url.search}`;

      const cached = memoryCache.get(cacheKey) as CacheEntry | null;
      if (!cached) return null;

      // Check ETag
      const ifNoneMatch = req.headers.get("if-none-match");
      if (ifNoneMatch === cached.etag) {
        return { ...cached, data: null }; // 304 Not Modified
      }

      return cached;
    },

    /** Set */
    set: (req: NextRequest, data: any): void => {
      const url = new URL(req.url);
      const cacheKey = customKey || `cache:${url.pathname}${url.search}`;

      const etag = generateETag(data);
      /**
 * Performs entry operation
 *
 * @returns {void =>} The entry result
 *
 */
const entry: CacheEntry = {
        data,
        /** Timestamp */
        timestamp: Date.now(),
        etag,
      };

      memoryCache.set(cacheKey, entry, ttl);
    },

    /** Invalidate */
    invalidate: (pattern?: string): void => {
      if (!pattern) {
        memoryCache.clear();
        return;
      }

      // Pattern-based invalidation not supported in FREE cache
      // Clear all cache instead
      console.warn(
        "[Cache] Pattern-based invalidation not supported, clearing all cache",
      );
      memoryCache.clear();
    },
  };
}

// Middleware wrapper for API routes
/**
 * Function: With Cache
 */
/**
 * Performs with cache operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to withcache result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withCache(req, handler);
 */

/**
 * Performs with cache operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to withcache result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withCache(/** Req */
  req, /** Handler */
  handler);
 */

export async function withCache(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: NextRequest) => Promise<NextResponse>,
  /** Config */
  config?: CacheConfig,
) {
  // Only cache GET requests
  if (req.method !== "GET") {
    return handler(req);
  }

  const cacheManager = cache(config);
  const cached = cacheManager.get(req);

  if (cached) {
    if (cached.data === null) {
      // ETag matched - return 304
      return new NextResponse(null, {
        /** Status */
        status: 304,
        /** Headers */
        headers: {
          /** E Tag */
          ETag: cached.etag,
          "Cache-Control": `public, max-age=${Math.floor((config?.ttl || 300000) / 1000)}`,
        },
      });
    }

    // Return cached response
    return NextResponse.json(cached.data, {
      /** Headers */
      headers: {
        /** E Tag */
        ETag: cached.etag,
        "Cache-Control": `public, max-age=${Math.floor((config?.ttl || 300000) / 1000)}`,
        "X-Cache": "HIT",
      },
    });
  }

  // Execute handler
  const response = await handler(req);

  // Cache successful responses
  if (response.ok) {
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      cacheManager.set(req, data);

      // Add cache headers
      const newResponse = NextResponse.json(data, {
        /** Status */
        status: response.status,
        /** Headers */
        headers: response.headers,
      });
      newResponse.headers.set("X-Cache", "MISS");
      newResponse.headers.set(
        "Cache-Control",
        `public, max-age=${Math.floor((config?.ttl || 300000) / 1000)}`,
      );

      return newResponse;
    } catch (error) {
      // If response is not JSON, return as is
      return response;
    }
  }

  return response;
}

// Export cache manager for manual invalidation
export const cacheManager = cache();
