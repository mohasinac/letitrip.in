# Day 28: Performance Testing Guide

## Overview

This guide provides step-by-step instructions for load testing your API routes and measuring performance improvements from caching and rate limiting.

---

## Prerequisites

### Install Testing Tools

**Option 1: Apache Bench (ab)** - Simple, built-in with Apache

```bash
# Windows (via WSL)
wsl -- ab -V

# macOS
brew install apache2
```

**Option 2: k6** - More advanced, better for staged load testing

```bash
# Windows (via Chocolatey)
choco install k6

# macOS
brew install k6

# Verify installation
k6 version
```

---

## Phase 1: Baseline Performance (Before Optimization)

### Test 1: Categories Endpoint

```bash
# Simple load test (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:3000/api/categories

# With JSON output
ab -n 1000 -c 10 -g baseline-categories.tsv http://localhost:3000/api/categories
```

**Expected Metrics (Before Optimization):**

- Requests per second: 10-20 RPS
- Mean response time: 100-200ms
- 95th percentile: 300-400ms
- Error rate: 0%

### Test 2: Products Endpoint

```bash
# Load test products listing
ab -n 1000 -c 20 http://localhost:3000/api/products?limit=20

# With parameters
ab -n 1000 -c 20 "http://localhost:3000/api/products?category=beyblades&limit=20"
```

**Expected Metrics (Before Optimization):**

- Requests per second: 5-10 RPS
- Mean response time: 200-400ms
- 95th percentile: 500-800ms
- Error rate: 0%

### Test 3: Product Detail Endpoint

```bash
# Test single product detail
ab -n 1000 -c 15 http://localhost:3000/api/products/beyblade-burst

# Test with cache-control
ab -n 1000 -c 15 -H "Cache-Control: no-cache" http://localhost:3000/api/products/beyblade-burst
```

**Expected Metrics (Before Optimization):**

- Requests per second: 15-25 RPS
- Mean response time: 50-150ms
- 95th percentile: 200-300ms
- Error rate: 0%

### Test 4: Search Endpoint

```bash
# Test search functionality
ab -n 1000 -c 25 "http://localhost:3000/api/search?q=beyblade"

# Test different queries
ab -n 500 -c 20 "http://localhost:3000/api/search?q=burst"
ab -n 500 -c 20 "http://localhost:3000/api/search?q=metal"
```

**Expected Metrics (Before Optimization):**

- Requests per second: 3-8 RPS
- Mean response time: 300-600ms
- 95th percentile: 800-1200ms
- Error rate: 0%

---

## Phase 2: Apply Optimizations

### Step 1: Apply Cache Middleware

Copy the optimized route example:

```bash
# Backup original
cp src/app/api/categories/route.ts src/app/api/categories/route.original.ts

# Apply optimized version
cp docs/examples/optimized-categories-route.example.ts src/app/api/categories/route.ts
```

### Step 2: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Start fresh server
npm run dev
```

### Step 3: Warm Up Cache

```bash
# Make initial requests to populate cache
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/categories?format=tree
curl http://localhost:3000/api/products?limit=20
```

---

## Phase 3: Performance Testing (After Optimization)

### Test 1: Categories with Cache

```bash
# Test cached performance
ab -n 1000 -c 10 http://localhost:3000/api/categories

# Test cache headers
curl -I http://localhost:3000/api/categories

# Expected headers:
# X-Cache: HIT
# Cache-Control: public, max-age=3600
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
```

**Expected Metrics (After Optimization):**

- Requests per second: 100-200 RPS (10x improvement)
- Mean response time: 5-15ms (10x improvement)
- 95th percentile: 20-40ms (10x improvement)
- Cache hit rate: 95%+

### Test 2: Products with Cache

```bash
# Test cached products
ab -n 1000 -c 20 http://localhost:3000/api/products?limit=20

# Verify cache headers
curl -I http://localhost:3000/api/products?limit=20
```

**Expected Metrics (After Optimization):**

- Requests per second: 50-100 RPS (10x improvement)
- Mean response time: 10-30ms (10x improvement)
- 95th percentile: 40-80ms (10x improvement)
- Cache hit rate: 80%+

### Test 3: Rate Limiting

```bash
# Test rate limiting (should hit limit at 100 requests)
for i in {1..150}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/categories)
  echo "Request $i: $response"
done

# Expected output:
# Requests 1-100: 200
# Requests 101-150: 429 (Too Many Requests)
```

### Test 4: Cache Invalidation

```bash
# Create new category (invalidates cache)
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"name": "Test Category", "slug": "test-category"}'

# First request after invalidation (cache miss)
curl -I http://localhost:3000/api/categories
# Expected: X-Cache: MISS

# Second request (cache hit)
curl -I http://localhost:3000/api/categories
# Expected: X-Cache: HIT
```

---

## Phase 4: Staged Load Testing with k6

### Create k6 Test Script

**File: `tests/performance/load-test.js`**

```javascript
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");

// Test configuration
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 20 }, // Stay at 20 users
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Stay at 50 users
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% of requests under 200ms
    http_req_failed: ["rate<0.01"], // Less than 1% errors
    errors: ["rate<0.05"], // Less than 5% errors
  },
};

const BASE_URL = "http://localhost:3000";

export default function () {
  // Test categories endpoint
  let categoriesRes = http.get(`${BASE_URL}/api/categories`);
  check(categoriesRes, {
    "categories status is 200": (r) => r.status === 200,
    "categories has cache header": (r) => r.headers["X-Cache"] !== undefined,
    "categories response time < 200ms": (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test products endpoint
  let productsRes = http.get(`${BASE_URL}/api/products?limit=20`);
  check(productsRes, {
    "products status is 200": (r) => r.status === 200,
    "products has cache header": (r) => r.headers["X-Cache"] !== undefined,
    "products response time < 300ms": (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test search endpoint
  let searchRes = http.get(`${BASE_URL}/api/search?q=beyblade`);
  check(searchRes, {
    "search status is 200": (r) => r.status === 200,
    "search response time < 400ms": (r) => r.timings.duration < 400,
  }) || errorRate.add(1);

  sleep(2);
}
```

### Run k6 Test

```bash
# Run the staged load test
k6 run tests/performance/load-test.js

# Run with more detailed output
k6 run --out json=results.json tests/performance/load-test.js

# Run with specific virtual users
k6 run --vus 50 --duration 2m tests/performance/load-test.js
```

**Expected Results:**

```
✓ categories status is 200
✓ categories has cache header
✓ categories response time < 200ms
✓ products status is 200
✓ products has cache header
✓ products response time < 300ms
✓ search status is 200
✓ search response time < 400ms

http_req_duration..........: avg=45ms  min=8ms   med=35ms  max=180ms  p(95)=120ms
http_req_failed............: 0.00%
http_reqs..................: 3000 (50/s)
iteration_duration.........: avg=4.2s  min=4.1s  med=4.2s  max=4.5s
vus........................: 50
vus_max....................: 50
```

---

## Phase 5: Monitor Cache Performance

### Check Cache Statistics

Add a monitoring endpoint to check cache stats:

**File: `src/app/api/admin/cache/stats/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import cacheService from "@/_lib/utils/cache";

export async function GET(request: NextRequest) {
  const stats = cacheService.stats();
  const memory = cacheService.getMemoryUsage();

  return NextResponse.json({
    success: true,
    data: {
      ...stats,
      memory,
      hitRate: (stats.hits / (stats.hits + stats.misses)) * 100,
    },
  });
}
```

### Monitor Cache Performance

```bash
# Check cache statistics
curl http://localhost:3000/api/admin/cache/stats

# Expected output:
{
  "success": true,
  "data": {
    "hits": 8500,
    "misses": 1500,
    "keys": 25,
    "memory": {
      "keys": 25,
      "ksize": 1234,
      "vsize": 56789
    },
    "hitRate": 85.0
  }
}
```

---

## Phase 6: Results Documentation

### Create Performance Report

**File: `docs/PERFORMANCE_REPORT.md`**

```markdown
# Performance Optimization Report

## Summary

- Date: [DATE]
- Optimizations: Caching, Rate Limiting
- Testing Tools: Apache Bench, k6

## Baseline vs Optimized

### Categories Endpoint

| Metric         | Before | After | Improvement |
| -------------- | ------ | ----- | ----------- |
| RPS            | 15     | 150   | 10x         |
| Mean Time      | 150ms  | 10ms  | 15x         |
| P95            | 350ms  | 25ms  | 14x         |
| Cache Hit Rate | N/A    | 95%   | New         |

### Products Endpoint

| Metric         | Before | After | Improvement |
| -------------- | ------ | ----- | ----------- |
| RPS            | 8      | 80    | 10x         |
| Mean Time      | 300ms  | 25ms  | 12x         |
| P95            | 700ms  | 60ms  | 11.7x       |
| Cache Hit Rate | N/A    | 85%   | New         |

## Recommendations

1. ✅ Apply caching to all read-heavy endpoints
2. ✅ Implement rate limiting on all routes
3. 🔄 Monitor cache hit rates
4. 🔄 Adjust TTL based on data volatility
5. 🔄 Consider Redis for distributed caching
```

---

## Troubleshooting

### Issue: Low Cache Hit Rate

**Solution:**

```bash
# Check cache keys
curl http://localhost:3000/api/admin/cache/stats

# Warm up cache with common requests
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/products?limit=20
```

### Issue: Rate Limiting Too Aggressive

**Solution:**

```typescript
// Increase rate limits in _lib/utils/rate-limiter.ts
export const rateLimitConfigs = {
  public: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 200, // Increase from 100
  },
};
```

### Issue: Cache Not Invalidating

**Solution:**

```bash
# Manually flush cache
curl -X POST http://localhost:3000/api/admin/cache/flush

# Check cache pattern invalidation
cacheService.invalidatePattern('products:*');
```

---

## Next Steps

1. ✅ Run baseline tests
2. ✅ Apply optimizations
3. ✅ Run optimized tests
4. ✅ Document results
5. 🔄 Monitor production performance
6. 🔄 Fine-tune cache TTLs
7. 🔄 Implement Redis for production
8. 🔄 Add APM monitoring (New Relic, Datadog)

---

**Day 28 Complete!** 🎉
