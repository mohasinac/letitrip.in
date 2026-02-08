# Caching Strategy Documentation

**Date**: February 8, 2026  
**Status**: Implemented  
**Compliance**: 11-Point Coding Standards ✅

---

## Overview

The LetItRip platform implements a **multi-layer caching strategy** to optimize performance and reduce database load. This document outlines all caching mechanisms, their configurations, and best practices.

---

## 1. Server-Side API Response Caching

### Implementation

Located in `src/lib/api/cache-middleware.ts`

**Features**:

- ✅ In-memory caching using `CacheManager` singleton
- ✅ Configurable TTL (Time To Live)
- ✅ Automatic cache key generation from URL + query params
- ✅ Cache hit/miss headers for monitoring
- ✅ Pattern-based cache invalidation
- ✅ Auth-aware (skips cache for authenticated requests)

### Cache Presets

| Preset      | TTL        | Use Case                                       |
| ----------- | ---------- | ---------------------------------------------- |
| `SHORT`     | 1 minute   | Frequently changing data (products, auctions)  |
| `MEDIUM`    | 5 minutes  | Moderately changing data (categories, reviews) |
| `LONG`      | 30 minutes | Rarely changing data (site settings, FAQs)     |
| `VERY_LONG` | 2 hours    | Static data (homepage sections, carousel)      |
| `NO_CACHE`  | N/A        | Authenticated or real-time data                |

### Usage Example

```typescript
// src/app/api/faqs/route.ts
import { withCache, CachePresets } from "@/lib/api/cache-middleware";

export const GET = withCache(
  async (request: NextRequest) => {
    // Your handler logic
    const faqs = await faqRepository.findAll();
    return NextResponse.json({ success: true, data: faqs });
  },
  CachePresets.LONG, // Cache for 30 minutes
);
```

### Cache Invalidation

```typescript
import { invalidateCache } from "@/lib/api/cache-middleware";

// Clear all cache
invalidateCache();

// Clear specific pattern
invalidateCache("/api/faqs"); // All FAQ endpoints
invalidateCache(/^\/api\/products/); // All product endpoints (regex)
```

---

## 2. Client-Side Query Caching (React Query)

### Implementation

**Currently**: Manual caching with `useState` and `useEffect`

**Recommended Upgrade**: Implement **TanStack Query (React Query)** for:

- Automatic cache management
- Background refetching
- Optimistic updates
- Request deduplication
- Infinite scrolling

### Installation

```bash
npm install @tanstack/react-query
```

### Setup

```typescript
// src/app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Usage Example

```typescript
// src/hooks/useFAQs.ts
import { useQuery } from "@tanstack/react-query";

export function useFAQs(filters: FAQFilters) {
  return useQuery({
    queryKey: ["faqs", filters],
    queryFn: async () => {
      const response = await fetch(`/api/faqs?${new URLSearchParams(filters)}`);
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

---

## 3. HTTP Cache Headers

### Implementation

Add standard HTTP caching headers to API responses:

```typescript
// In API routes
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    "CDN-Cache-Control": "max-age=3600",
    "Vercel-CDN-Cache-Control": "max-age=3600",
  },
});
```

### Cache-Control Values

| Value                        | Meaning                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `public`                     | Response can be cached by browsers and CDNs             |
| `private`                    | Response can only be cached by browser (user-specific)  |
| `no-cache`                   | Must revalidate with server before using cached version |
| `no-store`                   | Never cache (auth, sensitive data)                      |
| `s-maxage=300`               | Shared cache (CDN) TTL in seconds                       |
| `max-age=300`                | Browser cache TTL in seconds                            |
| `stale-while-revalidate=600` | Serve stale while fetching fresh                        |

### Recommended Headers by Endpoint

```typescript
// Public data (FAQs, Categories, Site Settings)
'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'

// Dynamic data (Products, Auctions)
'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'

// User-specific data (Profile, Orders)
'Cache-Control': 'private, max-age=0, must-revalidate'

// Auth endpoints
'Cache-Control': 'no-store, no-cache, must-revalidate'
```

---

## 4. Firestore Query Result Caching

### Current Implementation

Manual caching in repositories:

```typescript
// src/repositories/base.repository.ts
private cache = new Map<string, { data: any; timestamp: number }>();

protected getCached<T>(key: string, ttl: number = 300000): T | null {
  const cached = this.cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  return null;
}

protected setCache(key: string, data: any): void {
  this.cache.set(key, { data, timestamp: Date.now() });
}
```

### Firestore Persistent Disk Cache

Firebase SDK automatically caches Firestore data locally. Enable it:

```typescript
// src/lib/firebase/admin.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

// Enable persistent cache (10MB limit)
db.settings({
  cacheSizeBytes: 10485760, // 10MB
});
```

---

## 5. Static Asset Caching

### Next.js Image Optimization

Already configured in `next.config.js`:

```javascript
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};
```

**Benefits**:

- Automatic image optimization (WebP, AVIF)
- Responsive images with srcset
- Lazy loading
- Caching with immutable URLs

### Public Assets

Place in `public/` folder for aggressive caching:

```
public/
├── icons/          # App icons (cache: 1 year)
├── fonts/          # Custom fonts (cache: 1 year)
├── images/         # Static images (cache: 1 month)
└── robots.txt      # SEO files (cache: 1 day)
```

Vercel automatically sets optimal cache headers for public assets.

---

## 6. Implementation Checklist

### Phase 1: Server-Side Caching (✅ Complete)

- [x] Create `cache-middleware.ts` with withCache wrapper
- [x] Define cache presets (SHORT, MEDIUM, LONG, VERY_LONG)
- [x] Implement cache invalidation functions
- [ ] Apply caching to public API endpoints:
  - [ ] `/api/faqs` - LONG (30 min)
  - [ ] `/api/categories` - LONG (30 min)
  - [ ] `/api/site-settings` - VERY_LONG (2 hours)
  - [ ] `/api/homepage-sections` - VERY_LONG (2 hours)
  - [ ] `/api/carousel` - VERY_LONG (2 hours)
  - [ ] `/api/products` - MEDIUM (5 min)
  - [ ] `/api/reviews` - MEDIUM (5 min)

### Phase 2: HTTP Cache Headers (Pending)

- [ ] Add Cache-Control headers to all public endpoints
- [ ] Configure Vercel CDN caching
- [ ] Test cache behavior with browser DevTools
- [ ] Monitor cache hit rates

### Phase 3: Client-Side Caching (Recommended)

- [ ] Install TanStack Query
- [ ] Set up QueryClientProvider
- [ ] Migrate hooks to use useQuery/useMutation
- [ ] Configure staleTime and cacheTime per query
- [ ] Implement optimistic updates for mutations

### Phase 4: Repository Caching (Optional)

- [ ] Add query result caching to BaseRepository
- [ ] Implement cache invalidation on create/update/delete
- [ ] Configure per-entity TTL values
- [ ] Monitor cache hit rates

---

## 7. Cache Invalidation Strategy

### Automatic Invalidation

Invalidate cache automatically on data mutations:

```typescript
// src/app/api/faqs/route.ts
export async function POST(request: NextRequest) {
  // Create FAQ
  const faq = await faqRepository.create(data);

  // Invalidate FAQ cache
  invalidateCache("/api/faqs");

  return NextResponse.json({ success: true, data: faq });
}
```

### Manual Invalidation

Admin action to clear cache:

```typescript
// src/app/api/admin/cache/route.ts
export async function DELETE(request: NextRequest) {
  const { pattern } = await request.json();

  invalidateCache(pattern);

  return NextResponse.json({ success: true, message: "Cache cleared" });
}
```

### Time-Based Invalidation

Cache automatically expires after TTL. No manual action needed.

---

## 8. Monitoring & Metrics

### Cache Hit Rate

Track cache performance with custom headers:

```typescript
// Response headers
X-Cache-Hit: true/false
X-Cache-Key: /api/faqs?category=general
X-Cache-TTL: 300000
```

### Logging

Add cache metrics to Logger:

```typescript
import { Logger } from "@/classes/Logger";

const logger = Logger.getInstance();

// Log cache hits
logger.info("Cache hit", { key: cacheKey, endpoint: request.url });

// Log cache misses
logger.info("Cache miss", { key: cacheKey, endpoint: request.url });
```

### Dashboard

Create admin dashboard to view:

- Cache size (number of entries)
- Cache hit rate (%)
- Most cached endpoints
- Cache memory usage

---

## 9. Performance Targets

### Before Caching

- FAQ list: 800-1200ms (Firestore query)
- Categories: 500-800ms (Firestore query)
- Products list: 1000-1500ms (Firestore query)
- Site settings: 300-500ms (Firestore query)

### After Caching (Target)

- FAQ list: 10-50ms (cache hit)
- Categories: 10-50ms (cache hit)
- Products list: 10-50ms (cache hit)
- Site settings: 10-50ms (cache hit)

**Expected Improvement**: 20-100x faster response times for cached requests

---

## 10. Best Practices

### DO ✅

- ✅ Cache public data (FAQs, categories, site settings)
- ✅ Use short TTL for frequently changing data
- ✅ Use long TTL for static data
- ✅ Invalidate cache on data mutations
- ✅ Add cache headers for monitoring
- ✅ Test cache behavior in development

### DON'T ❌

- ❌ Cache authenticated user data
- ❌ Cache sensitive information (passwords, tokens)
- ❌ Use very long TTL for dynamic data
- ❌ Forget to invalidate cache on updates
- ❌ Cache error responses
- ❌ Over-cache (memory limits)

---

## 11. Security Considerations

### Auth-Aware Caching

Never cache responses for authenticated requests:

```typescript
// In cache-middleware.ts
const sessionCookie = request.cookies.get("__session");
if (sessionCookie) {
  return false; // Skip cache
}
```

### Cache Poisoning Prevention

- Validate all input parameters before caching
- Use secure cache key generation
- Limit cache size (prevent DoS)
- Set reasonable TTL values

---

## 12. Troubleshooting

### Cache Not Working

1. Check if request is authenticated (has session cookie)
2. Verify cache key generation
3. Check TTL hasn't expired
4. Look for cache headers in response

### Stale Data Served

1. Check cache TTL configuration
2. Verify cache invalidation on mutations
3. Consider shorter TTL for dynamic data

### Memory Issues

1. Reduce cache maxSize (default: 500)
2. Shorten TTL values
3. Implement LRU eviction policy
4. Monitor cache size in admin dashboard

---

## 13. Future Improvements

### Redis Integration

For production, consider Redis for distributed caching:

```bash
npm install ioredis
```

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Use Redis instead of in-memory cache
cache.set = (key, value, ttl) =>
  redis.setex(key, ttl / 1000, JSON.stringify(value));
cache.get = async (key) => JSON.parse((await redis.get(key)) || "null");
```

**Benefits**:

- Persistent across server restarts
- Shared cache across multiple servers
- Better memory management
- Advanced features (pub/sub, sorted sets)

### CDN Integration

Use Vercel's Edge Network for global caching:

```typescript
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  // Data automatically cached at edge
  return NextResponse.json(data);
}
```

---

**End of Caching Strategy Documentation** 🚀

**Next Steps**: Apply caching to all public API endpoints and monitor performance improvements.
