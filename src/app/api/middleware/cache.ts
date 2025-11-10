import { NextRequest, NextResponse } from "next/server";
import { memoryCache } from "@/app/api/lib/utils/memory-cache";

interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
  revalidate?: number; // Next.js revalidation time
}

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

export function cache(config: CacheConfig = {}) {
  const {
    ttl = 300, // 5 minutes default (in seconds)
    key: customKey,
  } = config;

  return {
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

    set: (req: NextRequest, data: any): void => {
      const url = new URL(req.url);
      const cacheKey = customKey || `cache:${url.pathname}${url.search}`;

      const etag = generateETag(data);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        etag,
      };
      
      memoryCache.set(cacheKey, entry, ttl);
    },

    invalidate: (pattern?: string): void => {
      if (!pattern) {
        memoryCache.clear();
        return;
      }

      // Pattern-based invalidation not supported in FREE cache
      // Clear all cache instead
      console.warn('[Cache] Pattern-based invalidation not supported, clearing all cache');
      memoryCache.clear();
    },
  };
}

// Middleware wrapper for API routes
export async function withCache(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
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
        status: 304,
        headers: {
          ETag: cached.etag,
          "Cache-Control": `public, max-age=${Math.floor((config?.ttl || 300000) / 1000)}`,
        },
      });
    }

    // Return cached response
    return NextResponse.json(cached.data, {
      headers: {
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
        status: response.status,
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
