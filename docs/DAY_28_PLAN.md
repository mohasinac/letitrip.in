# 🚀 Day 28: Performance & Optimization

**Date**: November 3, 2025  
**Sprint**: Sprint 6 - Testing & Launch  
**Status**: 🚧 IN PROGRESS

---

## 🎯 Objectives

### Goal
Optimize application performance through load testing, query optimization, caching implementation, and rate limiting.

### Time Allocation
- **Morning (3-4 hours)**: Performance testing and query optimization
- **Afternoon (3-4 hours)**: Caching implementation and rate limiting
- **Evening (1-2 hours)**: Image optimization and final benchmarks

### Success Criteria
- ✅ All routes respond < 200ms (90th percentile)
- ✅ Caching implemented for static data
- ✅ Rate limiting active on all routes
- ✅ Firestore indexes optimized
- ✅ Performance benchmarks documented

---

## 📋 Morning Session: Performance Testing & Query Optimization

### Phase 1: Performance Testing (1.5 hours)

#### Load Testing with Apache Bench
```bash
# Install Apache Bench (if not already installed)
# Windows: Download from Apache HTTP Server
# Linux: sudo apt-get install apache2-utils
# Mac: brew install httpd

# Test product listing (public endpoint)
ab -n 1000 -c 10 http://localhost:3000/api/products

# Test authenticated endpoint (with auth token)
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/orders

# Test admin endpoint
ab -n 500 -c 5 -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:3000/api/admin/users
```

#### Alternative: k6 Load Testing
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests < 200ms
  },
};

export default function () {
  // Test product listing
  let res = http.get('http://localhost:3000/api/products');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

#### Metrics to Collect
- [ ] Response times (p50, p90, p95, p99)
- [ ] Requests per second (RPS)
- [ ] Error rate
- [ ] Memory usage
- [ ] Firestore read/write operations
- [ ] Concurrent user capacity

#### Target Routes for Load Testing
1. **Public Routes** (high traffic)
   - `GET /api/products` (product listing)
   - `GET /api/products/[slug]` (product details)
   - `GET /api/categories` (category listing)
   - `GET /api/search` (universal search)

2. **Authenticated Routes** (medium traffic)
   - `GET /api/cart` (cart operations)
   - `GET /api/orders` (order listing)
   - `GET /api/user/profile` (user profile)

3. **Admin Routes** (low traffic, but critical)
   - `GET /api/admin/products` (admin product listing)
   - `GET /api/admin/orders` (admin order listing)
   - `GET /api/admin/users` (user management)

---

### Phase 2: Query Optimization (1.5-2 hours)

#### Identify Slow Queries
- [ ] Profile all Firestore queries
- [ ] Find queries with > 100ms response time
- [ ] Check for missing indexes
- [ ] Identify N+1 query problems

#### Optimization Strategies

**1. Add Composite Indexes**
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**2. Optimize Pagination**
```typescript
// Before: Offset-based pagination (slow)
const products = await adminDb
  .collection('products')
  .orderBy('createdAt', 'desc')
  .offset(page * limit)
  .limit(limit)
  .get();

// After: Cursor-based pagination (fast)
const products = await adminDb
  .collection('products')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDocSnapshot)
  .limit(limit)
  .get();
```

**3. Reduce Field Reads**
```typescript
// Before: Read all fields
const products = await adminDb
  .collection('products')
  .get();

// After: Select only needed fields
const products = await adminDb
  .collection('products')
  .select('id', 'name', 'price', 'image', 'status')
  .get();
```

**4. Batch Requests**
```typescript
// Before: Multiple individual requests
for (const productId of productIds) {
  const product = await adminDb.collection('products').doc(productId).get();
}

// After: Batch read
const productRefs = productIds.map(id => 
  adminDb.collection('products').doc(id)
);
const products = await adminDb.getAll(...productRefs);
```

#### Tasks
- [ ] Create `firestore.indexes.json` with composite indexes
- [ ] Deploy indexes to Firebase: `firebase deploy --only firestore:indexes`
- [ ] Update pagination to cursor-based
- [ ] Add field selection to queries
- [ ] Implement batch reads where applicable
- [ ] Test query performance improvements

---

## 📋 Afternoon Session: Caching & Rate Limiting

### Phase 3: Caching Implementation (2 hours)

#### Setup In-Memory Cache
```typescript
// _lib/utils/cache.ts
import NodeCache from 'node-cache';

// Create cache instance
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone cached objects (performance)
});

export const CacheKeys = {
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  HERO_SETTINGS: 'hero-settings',
  THEME_SETTINGS: 'theme-settings',
  PRODUCT_LIST: (filters: string) => `products:${filters}`,
  PRODUCT_DETAIL: (slug: string) => `product:${slug}`,
};

export const cacheService = {
  get: <T>(key: string): T | undefined => {
    return cache.get<T>(key);
  },

  set: <T>(key: string, value: T, ttl?: number): boolean => {
    return cache.set(key, value, ttl || 300);
  },

  del: (key: string | string[]): number => {
    return cache.del(key);
  },

  flush: (): void => {
    cache.flushAll();
  },

  keys: (): string[] => {
    return cache.keys();
  },

  stats: () => {
    return cache.getStats();
  },
};

export default cacheService;
```

#### Cache Strategy by Route Type

**1. Static Data (long TTL: 1 hour)**
- Categories
- Site settings
- Theme settings
- Hero settings

**2. Dynamic Data (short TTL: 5 minutes)**
- Product listings
- Search results

**3. User-Specific Data (no cache)**
- Cart
- Orders
- User profile
- Addresses

#### Implement Caching Middleware
```typescript
// _lib/middleware/cache.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import cacheService from '@/lib/utils/cache';

export function withCache(
  handler: Function,
  options: {
    keyGenerator: (req: NextRequest) => string;
    ttl?: number;
    skip?: (req: NextRequest) => boolean;
  }
) {
  return async (req: NextRequest, context?: any) => {
    // Skip cache if specified
    if (options.skip && options.skip(req)) {
      return handler(req, context);
    }

    // Generate cache key
    const cacheKey = options.keyGenerator(req);

    // Try to get from cache
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // Execute handler
    const response = await handler(req, context);
    
    // Cache successful responses
    if (response.status === 200) {
      const data = await response.json();
      cacheService.set(cacheKey, data, options.ttl);
      
      return NextResponse.json(data, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return response;
  };
}
```

#### Tasks
- [ ] Install node-cache: `npm install node-cache`
- [ ] Create cache utility (`_lib/utils/cache.ts`)
- [ ] Create cache middleware (`_lib/middleware/cache.middleware.ts`)
- [ ] Add caching to categories route
- [ ] Add caching to settings routes
- [ ] Add caching to product listings
- [ ] Test cache hit/miss rates
- [ ] Add cache statistics endpoint

---

### Phase 4: Rate Limiting (1.5 hours)

#### Setup Rate Limiter
```typescript
// _lib/utils/rate-limiter.ts
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// In-memory store for rate limiting
const requestStore = new Map<string, { count: number; resetAt: number }>();

export const rateLimitConfigs = {
  public: { windowMs: 60 * 60 * 1000, maxRequests: 100 }, // 100/hour
  authenticated: { windowMs: 60 * 60 * 1000, maxRequests: 1000 }, // 1000/hour
  admin: { windowMs: 60 * 60 * 1000, maxRequests: 5000 }, // 5000/hour
};

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const record = requestStore.get(identifier);

  // No record or window expired
  if (!record || now > record.resetAt) {
    const resetAt = now + config.windowMs;
    requestStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // Increment count
  record.count++;
  requestStore.set(identifier, record);

  // Check if limit exceeded
  if (record.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

export function getClientIdentifier(req: NextRequest): string {
  // Use IP address or user ID as identifier
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}
```

#### Rate Limiting Middleware
```typescript
// _lib/middleware/rate-limit.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/utils/rate-limiter';

export function withRateLimit(
  handler: Function,
  config: 'public' | 'authenticated' | 'admin' = 'public'
) {
  return async (req: NextRequest, context?: any) => {
    const identifier = getClientIdentifier(req);
    const limitConfig = rateLimitConfigs[config];

    const { allowed, remaining, resetAt } = await checkRateLimit(
      identifier,
      limitConfig
    );

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
          error: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toString(),
            'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req, context);
    response.headers.set('X-RateLimit-Limit', limitConfig.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetAt.toString());

    return response;
  };
}
```

#### Tasks
- [ ] Create rate limiter utility (`_lib/utils/rate-limiter.ts`)
- [ ] Create rate limit middleware (`_lib/middleware/rate-limit.middleware.ts`)
- [ ] Apply rate limiting to public routes (100/hour)
- [ ] Apply rate limiting to authenticated routes (1000/hour)
- [ ] Apply rate limiting to admin routes (5000/hour)
- [ ] Test rate limit enforcement
- [ ] Add rate limit monitoring

---

## 📋 Evening Session: Image Optimization & Benchmarks

### Phase 5: Image Optimization (1 hour)

#### Image Compression on Upload
```typescript
// _lib/utils/image-optimizer.ts
import sharp from 'sharp';

export async function optimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp',
  } = options;

  return sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
}

export async function generateThumbnail(
  buffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat('webp', { quality: 70 })
    .toBuffer();
}
```

#### Tasks
- [ ] Install sharp: `npm install sharp`
- [ ] Create image optimizer utility
- [ ] Update product image upload to optimize images
- [ ] Generate thumbnails for product images
- [ ] Add WebP format support
- [ ] Update hero image upload to optimize
- [ ] Test image optimization

---

### Phase 6: Final Benchmarks & Documentation (1 hour)

#### Performance Benchmarks
- [ ] Run load tests on all optimized routes
- [ ] Measure cache hit rates
- [ ] Measure rate limit effectiveness
- [ ] Compare before/after metrics
- [ ] Document performance improvements

#### Create Performance Report
```markdown
# Performance Optimization Report

## Before Optimization
- Average response time: XXXms
- P95 response time: XXXms
- Requests per second: XXX
- Firestore reads per request: XXX

## After Optimization
- Average response time: XXms (XX% improvement)
- P95 response time: XXms (XX% improvement)
- Requests per second: XXX (XX% improvement)
- Firestore reads per request: XXX (XX% reduction)

## Optimizations Applied
1. Composite indexes added
2. Cursor-based pagination implemented
3. Caching for static data (5min TTL)
4. Rate limiting (100/1000/5000 req/hour)
5. Image optimization (WebP, compression)

## Cache Statistics
- Hit rate: XX%
- Miss rate: XX%
- Average cache size: XXX items

## Rate Limit Statistics
- Blocked requests: XXX
- Average remaining quota: XXX
```

---

## 📊 Success Criteria

### Performance Targets
- [x] All routes < 200ms (p95)
- [ ] Product listing < 100ms
- [ ] Product details < 50ms
- [ ] Cart operations < 100ms
- [ ] Order creation < 200ms
- [ ] Admin queries < 150ms

### Caching Targets
- [ ] Cache hit rate > 60%
- [ ] Categories cached (1 hour)
- [ ] Settings cached (1 hour)
- [ ] Product listings cached (5 min)
- [ ] Cache size < 100MB

### Rate Limiting Targets
- [ ] Public routes: 100 req/hour
- [ ] Authenticated: 1000 req/hour
- [ ] Admin routes: 5000 req/hour
- [ ] Rate limit headers present
- [ ] 429 status on limit exceeded

### Image Optimization Targets
- [ ] Images compressed (< 500KB)
- [ ] WebP format used
- [ ] Thumbnails generated
- [ ] Upload time < 3s

---

## 🎯 Day 28 Deliverables

### Code Deliverables
1. ✅ Cache utility (`_lib/utils/cache.ts`)
2. ✅ Cache middleware (`_lib/middleware/cache.middleware.ts`)
3. ✅ Rate limiter utility (`_lib/utils/rate-limiter.ts`)
4. ✅ Rate limit middleware (`_lib/middleware/rate-limit.middleware.ts`)
5. ✅ Image optimizer utility (`_lib/utils/image-optimizer.ts`)
6. ✅ Firestore indexes (`firestore.indexes.json`)

### Documentation Deliverables
1. ✅ Performance benchmarks (before/after)
2. ✅ Cache statistics report
3. ✅ Rate limit configuration guide
4. ✅ Image optimization guide
5. ✅ Day 28 completion summary

### Metrics Deliverables
- ✅ Load test results
- ✅ Response time improvements
- ✅ Cache hit rates
- ✅ Rate limit effectiveness
- ✅ Image size reductions

---

## 📝 Notes

### Tools Required
- Apache Bench or k6 (load testing)
- node-cache (caching)
- sharp (image optimization)
- Firebase CLI (index deployment)

### Best Practices
1. **Caching**: Cache static data aggressively, user data never
2. **Rate Limiting**: Different limits for different user roles
3. **Images**: Always optimize on upload, not on request
4. **Indexes**: Create indexes for all complex queries
5. **Monitoring**: Track cache hit rates and rate limit hits

### Common Pitfalls
- ❌ Caching user-specific data
- ❌ Too aggressive rate limits
- ❌ Missing cache invalidation
- ❌ Over-optimizing premature bottlenecks

---

**Status**: Ready to begin Day 28 - Performance & Optimization! 🚀

**Next Steps**:
1. Install required packages (`node-cache`, `sharp`)
2. Run baseline load tests
3. Implement caching layer
4. Add rate limiting
5. Optimize images
6. Document improvements
