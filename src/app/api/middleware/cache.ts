import { NextRequest, NextResponse } from "next/server";

interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

// In-memory cache store (consider using Redis in production)
const cacheStore = new Map<string, CacheEntry>();

// Cleanup old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    cacheStore.forEach((entry, key) => {
      if (now - entry.timestamp > 3600000) {
        // 1 hour default TTL
        cacheStore.delete(key);
      }
    });
  },
  10 * 60 * 1000,
);

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
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
    ttl = 300000, // 5 minutes default
    key: customKey,
  } = config;

  return {
    get: (req: NextRequest): CacheEntry | null => {
      const url = new URL(req.url);
      const cacheKey = customKey || `cache:${url.pathname}${url.search}`;

      const cached = cacheStore.get(cacheKey);
      if (!cached) return null;

      const now = Date.now();
      if (now - cached.timestamp > ttl) {
        cacheStore.delete(cacheKey);
        return null;
      }

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
      cacheStore.set(cacheKey, {
        data,
        timestamp: Date.now(),
        etag,
      });
    },

    invalidate: (pattern?: string): void => {
      if (!pattern) {
        cacheStore.clear();
        return;
      }

      const regex = new RegExp(pattern);
      cacheStore.forEach((_, key) => {
        if (regex.test(key)) {
          cacheStore.delete(key);
        }
      });
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
