# API Caching Implementation Guide

**Date**: February 8, 2026  
**Status**: Implementation Guide  
**Phase**: Phase 8 - Testing & Optimization

---

## Overview

This document provides step-by-step instructions for applying caching middleware to all public API endpoints.

---

## Implementation Steps

### Step 1: Import Caching Middleware

Add this import to all public API route files:

```typescript
import {
  withCache,
  CachePresets,
  invalidateCache,
} from "@/lib/api/cache-middleware";
```

### Step 2: Wrap GET Handlers with Cache Middleware

**Before**:

```typescript
export async function GET(request: NextRequest) {
  // Handler logic
}
```

**After**:

```typescript
export const GET = withCache(async (request: NextRequest) => {
  // Handler logic
}, CachePresets.LONG); // Choose appropriate preset
```

### Step 3: Add Cache Invalidation to Mutations

Add after create/update/delete operations:

```typescript
// After successful mutation
invalidateCache("/api/your-endpoint");
```

---

## Endpoints to Cache

### Priority 1: Static Data (VERY_LONG - 2 hours)

#### `/api/site-settings`

- **GET**: Public site settings
- **Cache**: VERY_LONG (2 hours)
- **Invalidate on**: PATCH

```typescript
// src/app/api/site-settings/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const settings = await siteSettingsRepository.getSingleton();
  return NextResponse.json({ success: true, data: settings });
}, CachePresets.VERY_LONG);

export async function PATCH(request: NextRequest) {
  // Update settings
  invalidateCache("/api/site-settings");
  return NextResponse.json({ success: true });
}
```

#### `/api/homepage-sections`

- **GET**: All homepage sections
- **Cache**: VERY_LONG (2 hours)
- **Invalidate on**: POST, PATCH, DELETE, reorder

```typescript
// src/app/api/homepage-sections/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const sections = await homepageSectionsRepository.findAll();
  return NextResponse.json({ success: true, data: sections });
}, CachePresets.VERY_LONG);
```

#### `/api/carousel`

- **GET**: All carousel items
- **Cache**: VERY_LONG (2 hours)
- **Invalidate on**: POST, PATCH, DELETE, reorder

```typescript
// src/app/api/carousel/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const items = await carouselRepository.findAll();
  return NextResponse.json({ success: true, data: items });
}, CachePresets.VERY_LONG);
```

### Priority 2: Semi-Static Data (LONG - 30 minutes)

#### `/api/faqs`

- **GET**: All FAQs with filters
- **Cache**: LONG (30 minutes)
- **Invalidate on**: POST, PATCH, DELETE

```typescript
// src/app/api/faqs/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const faqs = await faqsRepository.findAll();
  return NextResponse.json({ success: true, data: faqs });
}, CachePresets.LONG);

export async function POST(request: NextRequest) {
  const faq = await faqsRepository.create(data);
  invalidateCache("/api/faqs");
  return NextResponse.json({ success: true, data: faq });
}
```

#### `/api/categories`

- **GET**: All categories (tree structure)
- **Cache**: LONG (30 minutes)
- **Invalidate on**: POST, PATCH, DELETE

```typescript
// src/app/api/categories/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const categories = await categoriesRepository.findAll();
  return NextResponse.json({ success: true, data: categories });
}, CachePresets.LONG);
```

### Priority 3: Dynamic Data (MEDIUM - 5 minutes)

#### `/api/products`

- **GET**: Product listings with filters
- **Cache**: MEDIUM (5 minutes)
- **Invalidate on**: POST, PATCH, DELETE

```typescript
// src/app/api/products/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const products = await productsRepository.findAll(filters);
  return NextResponse.json({ success: true, data: products });
}, CachePresets.MEDIUM);
```

#### `/api/reviews`

- **GET**: Product reviews
- **Cache**: MEDIUM (5 minutes)
- **Invalidate on**: POST, PATCH, DELETE

```typescript
// src/app/api/reviews/route.ts
export const GET = withCache(async (request: NextRequest) => {
  const reviews = await reviewsRepository.findAll(filters);
  return NextResponse.json({ success: true, data: reviews });
}, CachePresets.MEDIUM);
```

### Priority 4: Real-Time Data (SHORT - 1 minute)

#### `/api/products/[id]`

- **GET**: Individual product details
- **Cache**: SHORT (1 minute) - for high-traffic products
- **Invalidate on**: PATCH, DELETE

```typescript
// src/app/api/products/[id]/route.ts
export const GET = withCache(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const product = await productsRepository.findById(params.id);
    return NextResponse.json({ success: true, data: product });
  },
  CachePresets.SHORT,
);
```

---

## Cache Invalidation Patterns

### Pattern 1: Single Resource

Invalidate specific endpoint after mutation:

```typescript
export async function PATCH(request: NextRequest) {
  await repository.update(id, data);
  invalidateCache(`/api/resource/${id}`);
  return NextResponse.json({ success: true });
}
```

### Pattern 2: All Resources

Invalidate list endpoint when any item changes:

```typescript
export async function POST(request: NextRequest) {
  await repository.create(data);
  invalidateCache("/api/resources"); // Invalidates list
  return NextResponse.json({ success: true });
}
```

### Pattern 3: Related Resources

Invalidate multiple endpoints when data affects multiple pages:

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await productRepository.delete(params.id);
  invalidateCache("/api/products");
  invalidateCache(`/api/products/${params.id}`);
  invalidateCache(`/api/categories/${categoryId}/products`);
  return NextResponse.json({ success: true });
}
```

### Pattern 4: Wildcard Invalidation

Invalidate all endpoints matching a pattern:

```typescript
export async function PATCH(request: NextRequest) {
  await siteSettingsRepository.update(data);
  invalidateCache(/^\/api\//); // Clears ALL API cache
  return NextResponse.json({ success: true });
}
```

---

## Testing Checklist

After implementing caching, verify:

- [ ] Cache headers present in response (`X-Cache-Hit`, `X-Cache-Key`)
- [ ] First request: `X-Cache-Hit: false`
- [ ] Second request: `X-Cache-Hit: true`
- [ ] Response time improves (800ms → 10ms)
- [ ] Cache invalidates after mutations
- [ ] Authenticated requests bypass cache
- [ ] TTL expires correctly

### Testing Commands

```bash
# Test cache hit
curl -i http://localhost:3000/api/faqs
# Look for X-Cache-Hit: false

# Test cache hit (repeat)
curl -i http://localhost:3000/api/faqs
# Look for X-Cache-Hit: true

# Test authenticated bypass
curl -i -H "Cookie: __session=xxx" http://localhost:3000/api/faqs
# Should have X-Cache-Hit: false (bypassed)
```

---

## Files to Update

### High Priority (Static Data)

- [ ] `src/app/api/site-settings/route.ts`
- [ ] `src/app/api/homepage-sections/route.ts`
- [ ] `src/app/api/carousel/route.ts`

### Medium Priority (Semi-Static)

- [ ] `src/app/api/faqs/route.ts`
- [ ] `src/app/api/categories/route.ts`

### Lower Priority (Dynamic)

- [ ] `src/app/api/products/route.ts`
- [ ] `src/app/api/reviews/route.ts`
- [ ] `src/app/api/products/[id]/route.ts`
- [ ] `src/app/api/categories/[id]/route.ts`

### Individual Resource Endpoints

- [ ] `src/app/api/faqs/[id]/route.ts`
- [ ] `src/app/api/carousel/[id]/route.ts`
- [ ] `src/app/api/homepage-sections/[id]/route.ts`
- [ ] `src/app/api/categories/[id]/route.ts`

---

## Performance Expectations

### Before Caching

| Endpoint             | Response Time | Database Queries |
| -------------------- | ------------- | ---------------- |
| `/api/faqs`          | 800-1200ms    | 1-2 queries      |
| `/api/categories`    | 500-800ms     | 1 query          |
| `/api/products`      | 1000-1500ms   | 2-3 queries      |
| `/api/site-settings` | 300-500ms     | 1 query          |

### After Caching (Cache Hit)

| Endpoint             | Response Time | Database Queries |
| -------------------- | ------------- | ---------------- |
| `/api/faqs`          | 10-50ms       | 0 (cached)       |
| `/api/categories`    | 10-50ms       | 0 (cached)       |
| `/api/products`      | 10-50ms       | 0 (cached)       |
| `/api/site-settings` | 10-50ms       | 0 (cached)       |

**Expected Improvement**: 20-100x faster for cached requests

---

## Monitoring

Add to admin dashboard:

```typescript
// Get cache stats
const cacheSize = cache.size();
const cacheKeys = cache.keys();

// Track cache hit rate
let hits = 0;
let misses = 0;

// In middleware
if (cachedResponse) {
  hits++;
} else {
  misses++;
}

const hitRate = (hits / (hits + misses)) * 100;
```

---

## Next Steps

1. ✅ Create cache middleware (`cache-middleware.ts`)
2. ✅ Create implementation guide (this document)
3. ✅ Create caching strategy documentation
4. ⏳ Apply caching to high-priority endpoints
5. ⏳ Test cache behavior
6. ⏳ Monitor performance improvements
7. ⏳ Update PLAN.md with completion status

---

**End of Implementation Guide** 🚀

**Estimated Time**: 2-3 hours to implement across all endpoints
