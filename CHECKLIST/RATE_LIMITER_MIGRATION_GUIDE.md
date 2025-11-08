# Rate Limiter Migration Guide

**Purpose:** Migrate API routes from in-memory rate limiter to Redis-backed rate limiter

---

## 🎯 Why Migrate?

**Current:** In-memory rate limiter (`/middleware/ratelimiter.ts`)
- ❌ Memory resets on server restart
- ❌ Not distributed (doesn't work with multiple servers)
- ❌ No persistence
- ❌ Limited scalability

**New:** Redis-backed rate limiter (`/src/app/api/lib/rate-limiter-redis.ts`)
- ✅ Persistent across server restarts
- ✅ Works with horizontal scaling (multiple servers)
- ✅ Distributed rate limiting
- ✅ Automatic fallback to in-memory if Redis unavailable
- ✅ Health check endpoint

---

## 📋 Migration Steps

### Step 1: Find Routes Using Old Rate Limiter

```bash
# Search for routes using old rate limiter
grep -r "withRateLimit" src/app/api/
```

**Result:** 20+ routes found

### Step 2: Update Import Statement

**Before:**
```typescript
import { withRateLimit } from '@/app/api/middleware/ratelimiter';
```

**After:**
```typescript
import { withRedisRateLimit, RATE_LIMITS } from '@/app/api/lib/rate-limiter-redis';
```

### Step 3: Update Route Handler

**Before:**
```typescript
export async function POST(req: NextRequest) {
  return withRateLimit(
    req,
    async (request) => {
      // Handler code
      const body = await request.json();
      // ...
      return NextResponse.json({ success: true });
    },
    {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
      message: 'Too many attempts',
    }
  );
}
```

**After:**
```typescript
export async function POST(req: NextRequest) {
  return withRedisRateLimit(
    req,
    async (request) => {
      // Handler code (unchanged)
      const body = await request.json();
      // ...
      return NextResponse.json({ success: true });
    },
    RATE_LIMITS.AUTH // Use predefined config
  );
}
```

---

## 🔧 Predefined Rate Limit Configs

Use these instead of custom configs for consistency:

```typescript
// For login, register, password reset
RATE_LIMITS.AUTH // 5 requests per 15 minutes

// For general API endpoints
RATE_LIMITS.API // 100 requests per minute

// For search endpoints
RATE_LIMITS.SEARCH // 30 requests per minute

// For file upload endpoints
RATE_LIMITS.UPLOAD // 10 requests per minute

// For payment processing
RATE_LIMITS.PAYMENT // 3 requests per minute

// For public endpoints (no auth required)
RATE_LIMITS.PUBLIC // 200 requests per minute
```

---

## 📝 Examples

### Example 1: Authentication Route

**File:** `/src/app/api/auth/login/route.ts`

**Before:**
```typescript
import { withRateLimit } from '@/app/api/middleware/ratelimiter';

export async function POST(req: NextRequest) {
  return withRateLimit(
    req,
    async (request) => {
      const { email, password } = await request.json();
      // Login logic...
      return NextResponse.json({ token });
    },
    { maxRequests: 5, windowMs: 900000 }
  );
}
```

**After:**
```typescript
import { withRedisRateLimit, RATE_LIMITS } from '@/app/api/lib/rate-limiter-redis';

export async function POST(req: NextRequest) {
  return withRedisRateLimit(
    req,
    async (request) => {
      const { email, password } = await request.json();
      // Login logic... (unchanged)
      return NextResponse.json({ token });
    },
    RATE_LIMITS.AUTH
  );
}
```

### Example 2: Search Endpoint

**File:** `/src/app/api/search/route.ts`

**Before:**
```typescript
import { withRateLimit } from '@/app/api/middleware/ratelimiter';

export async function GET(req: NextRequest) {
  return withRateLimit(
    req,
    async (request) => {
      const query = request.nextUrl.searchParams.get('q');
      // Search logic...
      return NextResponse.json({ results });
    },
    { maxRequests: 30, windowMs: 60000 }
  );
}
```

**After:**
```typescript
import { withRedisRateLimit, RATE_LIMITS } from '@/app/api/lib/rate-limiter-redis';

export async function GET(req: NextRequest) {
  return withRedisRateLimit(
    req,
    async (request) => {
      const query = request.nextUrl.searchParams.get('q');
      // Search logic... (unchanged)
      return NextResponse.json({ results });
    },
    RATE_LIMITS.SEARCH
  );
}
```

### Example 3: Payment Endpoint

**File:** `/src/app/api/payments/create/route.ts`

**Before:**
```typescript
import { withRateLimit } from '@/app/api/middleware/ratelimiter';

export async function POST(req: NextRequest) {
  return withRateLimit(
    req,
    async (request) => {
      const body = await request.json();
      // Payment logic...
      return NextResponse.json({ orderId });
    },
    { maxRequests: 3, windowMs: 60000 }
  );
}
```

**After:**
```typescript
import { withRedisRateLimit, RATE_LIMITS } from '@/app/api/lib/rate-limiter-redis';

export async function POST(req: NextRequest) {
  return withRedisRateLimit(
    req,
    async (request) => {
      const body = await request.json();
      // Payment logic... (unchanged)
      return NextResponse.json({ orderId });
    },
    RATE_LIMITS.PAYMENT
  );
}
```

---

## 🏥 Health Check Endpoint

Create a health check endpoint to monitor Redis:

**File:** `/src/app/api/health/redis/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/app/api/lib/rate-limiter-redis';

export async function GET() {
  const health = await checkRedisHealth();
  
  if (health.connected) {
    return NextResponse.json({
      status: 'healthy',
      redis: 'connected',
      latency: health.latency,
    });
  } else {
    return NextResponse.json(
      {
        status: 'degraded',
        redis: 'disconnected',
        error: health.error,
        message: 'Using in-memory fallback',
      },
      { status: 503 }
    );
  }
}
```

---

## ✅ Testing

### Test Rate Limiting

```bash
# Run multiple requests quickly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done

# Expected: First 5 succeed, rest return 429
```

### Check Rate Limit Headers

```bash
curl -i http://localhost:3000/api/products
```

**Response headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1699456789
```

### Check Redis Health

```bash
curl http://localhost:3000/api/health/redis
```

**Response (healthy):**
```json
{
  "status": "healthy",
  "redis": "connected",
  "latency": 5
}
```

**Response (unhealthy):**
```json
{
  "status": "degraded",
  "redis": "disconnected",
  "error": "Connection refused",
  "message": "Using in-memory fallback"
}
```

---

## 🚀 Deployment

### Prerequisites

1. **Provision Redis Instance:**
   - Redis Cloud (recommended): https://redis.com/try-free/
   - AWS ElastiCache
   - Google Cloud Memorystore

2. **Add Environment Variable:**
   ```bash
   REDIS_URL=redis://username:password@redis-host:6379
   ```

3. **Test Connection:**
   ```bash
   redis-cli -u $REDIS_URL ping
   # Expected: PONG
   ```

### Migration Order (Priority)

**HIGH PRIORITY** (migrate first):
1. `/api/auth/login` - Prevent brute force
2. `/api/auth/register` - Prevent spam accounts
3. `/api/payments/*` - Critical security
4. `/api/auth/reset-password` - Prevent abuse

**MEDIUM PRIORITY:**
5. `/api/products` - High traffic
6. `/api/search` - Performance
7. `/api/categories` - High traffic
8. `/api/coupons` - Prevent scraping

**LOW PRIORITY:**
9. Other API routes

### Rollback Plan

If issues arise, revert imports:

```typescript
// Rollback to old rate limiter
import { withRateLimit } from '@/app/api/middleware/ratelimiter';
```

---

## 📊 Monitoring

Track these metrics:

1. **Rate limit hits:** Number of 429 responses
2. **Redis latency:** Response time for rate limit checks
3. **Fallback usage:** How often in-memory fallback is used
4. **Error rate:** Connection errors to Redis

### Monitoring Dashboard

Create alerts for:
- Redis disconnections
- High rate limit hit rate (>10% of requests)
- Slow Redis responses (>50ms)

---

## 🔍 Troubleshooting

### Issue: Redis connection errors

**Symptoms:**
- 503 responses from health check
- Logs show "Using in-memory fallback"

**Solutions:**
1. Check `REDIS_URL` environment variable
2. Verify Redis instance is running
3. Check firewall/security group rules
4. Verify credentials

### Issue: Rate limits not working

**Symptoms:**
- Unlimited requests allowed
- No 429 responses

**Solutions:**
1. Check Redis health endpoint
2. Verify `withRedisRateLimit` is being called
3. Check Redis keys: `redis-cli KEYS "ratelimit:*"`
4. Verify IP address extraction

### Issue: Too strict rate limits

**Symptoms:**
- Legitimate users getting 429 errors

**Solutions:**
1. Increase rate limits in configs
2. Whitelist specific IPs
3. Use different rate limit per endpoint
4. Consider user-based rate limiting (instead of IP)

---

## 📚 Additional Resources

- **Redis Rate Limiter Code:** `/src/app/api/lib/rate-limiter-redis.ts`
- **Production Readiness Guide:** `/CHECKLIST/PRODUCTION_READINESS_COMPLETION.md`
- **Deployment Guide:** `/CHECKLIST/DEPLOYMENT_GUIDE.md`

---

**Status:** Ready for migration  
**Estimated Time:** 2-3 hours for all routes  
**Risk:** Low (automatic fallback to in-memory)

🎉 **Happy migrating!**
