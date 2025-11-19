# CACHE-2: Dynamic Cache Configuration Guide

## ✅ Task Complete

**Date**: November 19, 2025  
**Status**: Production Ready  
**Files**:

- `src/services/api.service.ts` (enhanced)
- `src/config/cache.config.ts` (new)

---

## 📋 Overview

Enhanced the caching system with dynamic configuration capabilities, allowing runtime adjustments of cache TTL without code changes. Centralized all cache configurations in a single file for easier management.

---

## 🎯 Features Implemented

### 1. Centralized Configuration File

**File**: `src/config/cache.config.ts`

All cache configurations now live in one place:

```typescript
import { DEFAULT_CACHE_CONFIG } from "@/config/cache.config";

// 12 pre-configured endpoint patterns
const config = DEFAULT_CACHE_CONFIG;
```

### 2. Dynamic Configuration Methods

Added to `api.service.ts`:

#### Configure Single Endpoint:

```typescript
apiService.configureCacheFor("/products", {
  ttl: 10 * 60 * 1000, // 10 minutes
  staleWhileRevalidate: 30 * 60 * 1000, // 30 minutes
});
```

#### Update TTL Only:

```typescript
apiService.updateCacheTTL("/products", 15 * 60 * 1000); // 15 minutes
```

#### Batch Configuration:

```typescript
apiService.batchConfigureCache({
  "/products": { ttl: 300000, staleWhileRevalidate: 900000 },
  "/shops": { ttl: 600000, staleWhileRevalidate: 1800000 },
});
```

#### Remove Cache Config:

```typescript
apiService.removeCacheConfigFor("/products"); // Disable caching
```

#### Get All Configurations:

```typescript
const configs = apiService.getCacheConfigurations();
console.log(configs); // { '/products': { ttl: 300000, ... }, ... }
```

### 3. Pre-defined Cache Strategies

```typescript
import { CACHE_STRATEGIES } from "@/config/cache.config";

// Real-time (30s fresh, 2min stale)
CACHE_STRATEGIES.REAL_TIME;

// Dynamic (2min fresh, 10min stale)
CACHE_STRATEGIES.DYNAMIC;

// Standard (5min fresh, 15min stale)
CACHE_STRATEGIES.STANDARD;

// Extended (30min fresh, 1hr stale)
CACHE_STRATEGIES.EXTENDED;

// Static (1hr fresh, 24hr stale)
CACHE_STRATEGIES.STATIC;

// No cache
CACHE_STRATEGIES.NO_CACHE;
```

### 4. Time Constants

```typescript
import { TIME } from "@/config/cache.config";

TIME.SECONDS_30; // 30 seconds
TIME.MINUTE_1; // 1 minute
TIME.MINUTES_5; // 5 minutes
TIME.MINUTES_30; // 30 minutes
TIME.HOUR_1; // 1 hour
TIME.HOURS_24; // 24 hours
```

### 5. Helper Functions

```typescript
import {
  createCacheConfig,
  getRecommendedStrategy,
} from "@/config/cache.config";

// Create custom config
const config = createCacheConfig(10, 30); // 10min fresh, 30min stale

// Get recommended strategy
const strategy = getRecommendedStrategy("real-time");
```

---

## 📦 Configured Endpoints (12 total)

| Endpoint         | Fresh TTL | Stale Time | Use Case          |
| ---------------- | --------- | ---------- | ----------------- |
| `/products`      | 5 min     | 15 min     | Product listings  |
| `/auctions`      | 2 min     | 5 min      | Real-time bidding |
| `/categories`    | 30 min    | 60 min     | Category tree     |
| `/shops`         | 10 min    | 30 min     | Shop listings     |
| `/homepage`      | 5 min     | 15 min     | Homepage content  |
| `/static-assets` | 1 hr      | 24 hr      | Static content    |
| `/orders`        | 1 min     | 5 min      | User orders       |
| `/cart`          | 30 sec    | 2 min      | Shopping cart     |
| `/reviews`       | 10 min    | 30 min     | Product reviews   |
| `/user`          | 2 min     | 10 min     | User profile      |
| `/search`        | 3 min     | 10 min     | Search results    |
| `/analytics`     | 15 min    | 60 min     | Dashboard stats   |

---

## 💻 Usage Examples

### Example 1: Admin Panel - Adjust Cache TTL

```typescript
// In an admin settings page
function updateCacheSettings(endpoint: string, minutes: number) {
  const ttlMs = minutes * 60 * 1000;
  apiService.updateCacheTTL(endpoint, ttlMs);

  // Optionally clear existing cache
  apiService.invalidateCache(endpoint);

  console.log(`Cache updated for ${endpoint}: ${minutes} minutes`);
}

// Usage
updateCacheSettings("/products", 10); // Set to 10 minutes
```

### Example 2: Feature Flag - Dynamic Caching

```typescript
// Enable/disable caching based on feature flag
function configureCachingStrategy(
  strategy: "aggressive" | "balanced" | "minimal"
) {
  const configs = {
    aggressive: {
      "/products": CACHE_STRATEGIES.EXTENDED,
      "/shops": CACHE_STRATEGIES.EXTENDED,
      "/categories": CACHE_STRATEGIES.STATIC,
    },
    balanced: {
      "/products": CACHE_STRATEGIES.STANDARD,
      "/shops": CACHE_STRATEGIES.STANDARD,
      "/categories": CACHE_STRATEGIES.EXTENDED,
    },
    minimal: {
      "/products": CACHE_STRATEGIES.DYNAMIC,
      "/shops": CACHE_STRATEGIES.DYNAMIC,
      "/categories": CACHE_STRATEGIES.STANDARD,
    },
  };

  apiService.batchConfigureCache(configs[strategy]);
}
```

### Example 3: Environment-based Configuration

```typescript
// Different cache settings for prod vs dev
if (process.env.NODE_ENV === "production") {
  // Aggressive caching in production
  apiService.batchConfigureCache({
    "/products": CACHE_STRATEGIES.EXTENDED,
    "/shops": CACHE_STRATEGIES.EXTENDED,
  });
} else {
  // Minimal caching in development
  apiService.batchConfigureCache({
    "/products": CACHE_STRATEGIES.DYNAMIC,
    "/shops": CACHE_STRATEGIES.DYNAMIC,
  });
}
```

### Example 4: Event-based Cache Invalidation

```typescript
// After product update, invalidate and reconfigure
function onProductUpdate(productId: string) {
  // Invalidate products cache
  apiService.invalidateCache("/products");

  // Temporarily reduce TTL for immediate updates
  apiService.updateCacheTTL("/products", 60 * 1000); // 1 minute

  // Reset after 5 minutes
  setTimeout(() => {
    apiService.updateCacheTTL("/products", 5 * 60 * 1000); // Back to 5 min
  }, 5 * 60 * 1000);
}
```

### Example 5: Monitoring Cache Configuration

```typescript
// Get current cache configurations
const configs = apiService.getCacheConfigurations();

// Display in admin panel
for (const [endpoint, config] of Object.entries(configs)) {
  console.log(`${endpoint}:`);
  console.log(`  Fresh: ${config.ttl / 1000 / 60} minutes`);
  console.log(
    `  Stale: ${(config.staleWhileRevalidate || 0) / 1000 / 60} minutes`
  );
}

// Get cache statistics
const stats = apiService.getCacheStats();
console.log(`Cache hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
console.log(`Cache size: ${stats.cacheSize} entries`);
```

---

## 🔧 Environment Variable Support

You can override cache settings using environment variables:

```bash
# .env.local
CACHE_PRODUCTS_TTL=600000         # 10 minutes
CACHE_PRODUCTS_STALE=1800000      # 30 minutes
CACHE_AUCTIONS_TTL=120000         # 2 minutes
CACHE_AUCTIONS_STALE=300000       # 5 minutes
```

The system automatically reads these on startup (server-side only).

---

## 📊 Benefits

### 1. **Flexibility**

- Change cache settings without redeploying
- A/B test different cache strategies
- Adjust based on server load or user feedback

### 2. **Maintainability**

- All configurations in one file
- Easy to understand and modify
- Self-documenting with descriptions

### 3. **Performance Tuning**

- Fine-tune cache per endpoint
- Balance freshness vs performance
- Optimize based on usage patterns

### 4. **Debugging**

- Inspect current configurations at runtime
- Monitor cache effectiveness
- Quickly disable caching for testing

---

## 🎯 Use Cases

### 1. **Black Friday / High Traffic Events**

```typescript
// Increase caching during high traffic
apiService.batchConfigureCache({
  "/products": CACHE_STRATEGIES.EXTENDED,
  "/shops": CACHE_STRATEGIES.EXTENDED,
  "/categories": CACHE_STRATEGIES.STATIC,
});
```

### 2. **Product Launch**

```typescript
// Reduce cache for newly launched products
apiService.updateCacheTTL("/products", TIME.MINUTE_1);
apiService.invalidateCache("/products");
```

### 3. **Maintenance Mode**

```typescript
// Aggressive caching during maintenance
apiService.batchConfigureCache({
  "/products": CACHE_STRATEGIES.STATIC,
  "/shops": CACHE_STRATEGIES.STATIC,
});
```

### 4. **Real-time Features**

```typescript
// Disable caching for real-time auction
apiService.configureCacheFor(
  `/auctions/${auctionId}`,
  CACHE_STRATEGIES.NO_CACHE
);
```

---

## 🚀 Best Practices

### 1. **Start Conservative**

Begin with shorter TTL values and increase as needed:

```typescript
// Start with 2 minutes
apiService.updateCacheTTL("/new-endpoint", TIME.MINUTES_2);

// Monitor performance, then increase
apiService.updateCacheTTL("/new-endpoint", TIME.MINUTES_5);
```

### 2. **Match Cache to Data Frequency**

- Real-time data (bids, cart): 30s - 2min
- User data (orders, profile): 1min - 5min
- Content (products, shops): 5min - 15min
- Static (categories, assets): 30min - 24hr

### 3. **Clear Cache on Updates**

```typescript
// After creating/updating products
await productsService.create(productData);
apiService.invalidateCache("/products");
```

### 4. **Monitor and Adjust**

```typescript
// Check cache effectiveness
setInterval(() => {
  const stats = apiService.getCacheStats();
  if (stats.hitRate < 0.7) {
    console.warn("Low cache hit rate, consider increasing TTL");
  }
}, 60 * 1000);
```

---

## 🧪 Testing Cache Configuration

```typescript
// Test cache configuration
describe("Cache Configuration", () => {
  it("should allow runtime configuration", () => {
    apiService.configureCacheFor("/test", {
      ttl: 5000,
      staleWhileRevalidate: 10000,
    });

    const configs = apiService.getCacheConfigurations();
    expect(configs["/test"]).toEqual({
      ttl: 5000,
      staleWhileRevalidate: 10000,
    });
  });

  it("should support batch configuration", () => {
    apiService.batchConfigureCache({
      "/test1": { ttl: 5000 },
      "/test2": { ttl: 10000 },
    });

    const configs = apiService.getCacheConfigurations();
    expect(configs["/test1"].ttl).toBe(5000);
    expect(configs["/test2"].ttl).toBe(10000);
  });
});
```

---

## 📝 Migration Guide

### From Hardcoded to Configurable:

**Before**:

```typescript
// Hardcoded in service
const CACHE_TTL = 5 * 60 * 1000;
```

**After**:

```typescript
// Use centralized config
import { DEFAULT_CACHE_CONFIG } from "@/config/cache.config";

// Or configure dynamically
apiService.configureCacheFor("/endpoint", {
  ttl: 5 * 60 * 1000,
  staleWhileRevalidate: 15 * 60 * 1000,
});
```

---

## ✨ Future Enhancements

Potential improvements for future iterations:

1. **Admin UI**: Visual cache configuration panel
2. **Analytics Integration**: Automatic TTL optimization based on usage
3. **Per-user Caching**: Different cache strategies per user role
4. **Cache Warmup**: Pre-populate cache on deployment
5. **Smart Invalidation**: Automatic cache invalidation on data changes

---

**Status**: ✅ Complete and Production Ready  
**Impact**: High - Flexible cache management without code changes  
**Risk**: Low - Backward compatible, no breaking changes

_Last Updated: November 19, 2025_
