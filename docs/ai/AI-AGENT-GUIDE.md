# AI Agent Development Guide - JustForView.in

This guide helps AI agents understand and work effectively with this Next.js auction platform codebase.

## Quick Reference

### 6. State Management

````typescript
// Use Context for global state
import { useAuth } from "@/contexts/AuthContext";

// Use custom hooks for feature state
import { useCart } from "@/hooks/useCart";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
``` Type**: Next.js 14+ (App Router) with TypeScript
**Primary Domain**: Auction & E-commerce Platform for India
**No Mocks**: All APIs are real and ready - never suggest mock data
**Code Over Docs**: Focus on implementation, not documentation

## Architecture Overview

### Application Structure

````

ROUTING: Next.js App Router (src/app/)
├── Pages: Each folder in app/ is a route
├── API Routes: app/api/ contains backend endpoints
└── Layouts: Shared UI in layout.tsx files

COMPONENTS: React components (src/components/)
├── Feature-based: admin/, auction/, cart/, checkout/, product/
├── Layout: Header, Footer, Navigation components
└── Common: Shared UI components

SERVICES: API abstraction layer (src/services/)
├── Real API calls - NO MOCKS
├── Centralized error handling
└── TypeScript types for all requests/responses

STATE: Context + Hooks pattern
├── AuthContext: User authentication
├── UploadContext: Media uploads
└── Custom hooks: useCart, useAuctionSocket, etc.

````

### Core Technologies

- **Next.js 14+**: App Router, Server/Client Components
- **TypeScript**: Strict mode, comprehensive types in src/types/
- **Tailwind CSS**: Utility-first styling
- **Firebase**: Firestore (DB), Storage (files), Auth, Realtime Database, Analytics
- **Vercel**: Deployment platform (FREE tier)

### FREE Tier Architecture (Zero Cost)

**Cost Optimization**: Migrated from paid services to 100% FREE tier solutions saving $432/year.

**Replaced Services**:
- ❌ **Sentry** ($26/mo) → ✅ Firebase Analytics + Discord webhooks
- ❌ **Redis** ($10/mo) → ✅ In-memory cache (`src/lib/memory-cache.ts`)
- ❌ **Socket.IO** (hosting cost) → ✅ Firebase Realtime Database
- ❌ **Slack** (unused) → ✅ Discord webhooks

**FREE Libraries Created**:
1. `src/lib/memory-cache.ts` - In-memory caching with TTL and auto-cleanup
2. `src/lib/rate-limiter.ts` - Sliding window rate limiting
3. `src/lib/discord-notifier.ts` - Team notifications via Discord webhooks
4. `src/lib/firebase-error-logger.ts` - Error tracking with Firebase Analytics
5. `src/lib/firebase-realtime.ts` - Real-time auction bidding with Firebase Realtime Database

**Migration Guide**: See `FIREBASE-MIGRATION-CHECKLIST.md` and `COST-OPTIMIZATION-GUIDE.md`

## Key Patterns to Follow

### 1. Service Layer Pattern (CRITICAL)

**NEVER call APIs directly from components, pages, or hooks. ALWAYS use the service layer.**

```typescript
// ❌ WRONG: Direct fetch in component
export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // DON'T DO THIS
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
}

// ❌ WRONG: Direct apiService in component
import { apiService } from '@/services/api.service';

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // DON'T DO THIS
    apiService.get('/api/products').then(setProducts);
  }, []);
}

// ✅ CORRECT: Use service layer
import { productService } from '@/services/products.service';

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productService.getProducts().then(setProducts);
  }, []);
}
```

**Service Layer Benefits**:
- Centralized business logic
- Consistent error handling
- Type safety for all requests/responses
- Easier testing and mocking
- Single source of truth for API calls
- Authentication headers automatically added

**Creating a New Service**:

```typescript
// src/services/feature.service.ts
import { apiService } from './api.service';
import { Feature, FeatureFilters } from '@/types/feature';

class FeatureService {
  private readonly BASE_PATH = '/api/features';

  async getFeatures(filters?: FeatureFilters): Promise<Feature[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.category) params.set('category', filters.category);

    const url = params.toString()
      ? `${this.BASE_PATH}?${params}`
      : this.BASE_PATH;

    const response = await apiService.get<{ features: Feature[] }>(url);
    return response.features;
  }

  async getFeatureById(id: string): Promise<Feature> {
    const response = await apiService.get<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.feature;
  }

  async createFeature(data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.post<{ feature: Feature }>(
      this.BASE_PATH,
      data
    );
    return response.feature;
  }

  async updateFeature(id: string, data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.patch<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.feature;
  }

  async deleteFeature(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const featureService = new FeatureService();
```

**Using Services in Custom Hooks**:

```typescript
// ✅ CORRECT: Service layer in hooks
import { useState, useEffect } from 'react';
import { productService } from '@/services/products.service';

export function useProducts(filters?) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts(filters);
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
}
```

**Error Handling in Services**:

All services inherit error handling from `apiService`, which:
- Automatically retries on network errors
- Parses error responses
- Throws typed errors
- Logs errors to console (dev) or tracking service (prod)

**Available Services** (always check before creating new ones):
- `authService` - Authentication (login, register, logout)
- `productService` - Product CRUD and search
- `auctionService` - Auction operations and bidding
- `cartService` - Shopping cart management
- `orderService` - Order processing
- `shopService` - Shop/vendor operations
- `categoryService` - Category management
- `couponService` - Discount codes
- `reviewService` - Product reviews
- `userService` - User profile management
- `mediaService` - File uploads (images, videos)
- `addressService` - User addresses
- `supportService` - Support tickets
- `testDataService` - Test data generation (admin only)

### 2. Component Patterns

```typescript
// Client Components (interactive)
"use client";
import { useState } from "react";

// Server Components (default, no directive needed)
// Use for data fetching, static content

// Component organization
components / feature - name / ComponentName.tsx; // Main component
SubComponent.tsx; // Related components
````

### 3. API Route Pattern

```typescript
// API routes in src/app/api/[endpoint]/route.ts
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

### 4. Firebase Storage Architecture Pattern

**CRITICAL**: Never use Firebase Client SDK directly in client code. Always use API routes.

```
Client (UI)
  ↓ API call
Client Service (src/services/)
  ↓ HTTP request
API Route (src/app/api/)
  ↓ Firebase Admin SDK
Server Service (src/app/api/lib/)
  ↓ Firebase Storage/Firestore
Firebase Backend
```

**Upload Flow (2-Step Process)**:

1. **Request Signed URL**: Client calls API to get temporary upload URL
2. **Direct Upload**: Client uploads directly to Firebase Storage using signed URL
3. **Confirm Upload**: Client calls API to save metadata to Firestore

**Example Pattern**:

```typescript
// ✅ CORRECT: Client Service
export async function uploadAsset(file: File, type: string, category?: string) {
  // Step 1: Get signed URL from API
  const { uploadUrl, assetId, storagePath } = await apiService.post(
    "/admin/static-assets/upload-url",
    { fileName: file.name, contentType: file.type, type, category }
  );

  // Step 2: Upload directly to Firebase Storage
  await fetch(uploadUrl, { method: "PUT", body: file });

  // Step 3: Confirm and save metadata
  const { asset } = await apiService.post(
    "/admin/static-assets/confirm-upload",
    { assetId, name: file.name, type, storagePath, size: file.size }
  );

  return asset;
}

// ❌ WRONG: Direct Firebase SDK in client
import { getStorage } from "firebase/storage"; // NO!
const storage = getStorage();
await uploadBytes(ref(storage, path), file); // NO!
```

**Server Service Pattern** (`src/app/api/lib/`):

```typescript
// Firebase Admin SDK operations only
import { getStorage } from "firebase-admin/storage";
import { getFirestoreAdmin } from "./firebase/admin";

export async function generateUploadUrl(fileName: string, contentType: string) {
  const storage = getStorage();
  const bucket = storage.bucket();
  const file = bucket.file(`static-assets/${fileName}`);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return { uploadUrl, storagePath: file.name };
}
```

**Storage Paths & Rules**:

- `/shop-logos/**` - Sellers, images only
- `/shop-banners/**` - Sellers, images only
- `/product-images/**` - Sellers, images only
- `/product-videos/**` - Sellers, videos only, 100MB limit
- `/static-assets/{type}/{category}/**` - Admins, all types, 50MB limit
- `/blog-media/{postId}/**` - Admins, images/videos, 50MB limit
- `/user-documents/{userId}/**` - Users (own files), documents only, 10MB limit

**Supported File Types**:

- **Images**: All formats (`image/*`)
- **Videos**: All formats (`video/*`)
- **Documents**: PDF, Word, Excel, Text

### 5. Firebase Realtime Database Pattern (Socket.IO Replacement)

**CRITICAL**: Firebase Realtime Database is used for real-time auction bidding instead of Socket.IO.

**Architecture**:

```
Client Component
  ↓ Subscribe
Firebase Realtime Database
  ↓ Real-time updates
Client receives live data
```

**Usage Pattern**:

```typescript
// Import Realtime Database service
import {
  subscribeToAuction,
  subscribeToAuctionBids,
  placeBid,
} from "@/lib/firebase-realtime";

// In component
useEffect(() => {
  // Subscribe to auction status
  const unsubscribe = subscribeToAuction(auctionId, (status) => {
    setCurrentBid(status.currentBid);
    setBidCount(status.bidCount);
    setIsActive(status.isActive);
  });

  // Cleanup on unmount
  return unsubscribe;
}, [auctionId]);

// Subscribe to recent bids (last 10)
useEffect(() => {
  const unsubscribe = subscribeToAuctionBids(auctionId, (bids) => {
    setBidHistory(bids);
  });

  return unsubscribe;
}, [auctionId]);

// Place bid (call via API route)
const handlePlaceBid = async (amount: number) => {
  const response = await fetch(`/api/auctions/${auctionId}/bid`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  // API route uses placeBid() internally
  // Real-time updates will propagate to all subscribers
};
```

**Server-Side API Pattern** (API routes):

```typescript
// In API route: /api/auctions/[id]/bid/route.ts
import { placeBid } from "@/lib/firebase-realtime";

export async function POST(req: Request) {
  const { amount } = await req.json();
  const userId = req.userId; // From auth middleware

  // Place bid - updates Realtime Database
  const result = await placeBid(auctionId, userId, userName, amount);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // All subscribed clients receive update automatically
  return NextResponse.json({ success: true, bidId: result.bidId });
}
```

**Database Structure**:

```
auctions/
  {auctionId}/
    status/
      auctionId: string
      currentBid: number
      bidCount: number
      isActive: boolean
      endTime: number
      winnerId: string
      lastUpdate: number
    bids/
      {bidId}/
        auctionId: string
        userId: string
        userName: string
        amount: number
        timestamp: number
```

**Benefits vs Socket.IO**:

- ✅ No server required (Firebase handles connections)
- ✅ Automatic scaling (Firebase FREE tier: 100 concurrent connections)
- ✅ Offline support built-in
- ✅ Real-time sync across all clients
- ✅ Security rules for access control
- ✅ Zero cost on FREE tier

**Security Rules** (set in Firebase Console):

```json
{
  "rules": {
    "auctions": {
      "$auctionId": {
        ".read": true,
        ".write": "auth != null",
        "bids": {
          ".indexOn": ["timestamp"]
        }
      }
    }
  }
}
```

### 6. State Management

```typescript
// Use Context for global state
import { useAuth } from "@/contexts/AuthContext";

// Use custom hooks for feature state
import { useCart } from "@/hooks/useCart";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";
```

### 7. FREE Tier Caching Pattern (Redis Replacement)

**Location**: `src/lib/memory-cache.ts`

**Usage in Services**:

```typescript
import { memoryCache } from "@/lib/memory-cache";

// Set cache with TTL (in seconds)
memoryCache.set("products-list", products, 300); // Cache for 5 minutes

// Get from cache
const cached = memoryCache.get("products-list");
if (cached) {
  return cached;
}

// Delete specific key
memoryCache.delete("products-list");

// Clear all cache
memoryCache.clear();

// Get statistics
const stats = memoryCache.getStats();
console.log(`Cache hits: ${stats.hits}, misses: ${stats.misses}`);
```

**Usage in Middleware**:

```typescript
// Updated cache middleware uses memoryCache automatically
import { withCache } from "@/app/api/middleware/cache";

export async function GET(req: NextRequest) {
  return withCache(req, handler, {
    ttl: 300, // 5 minutes (in seconds)
    key: "custom-cache-key", // Optional
  });
}
```

**Features**:

- ✅ TTL support with automatic expiration
- ✅ Auto-cleanup every 5 minutes
- ✅ Statistics tracking (hits, misses, size)
- ✅ Zero external dependencies
- ✅ Works on single server (perfect for Vercel)

**Limitations**:

- Cache clears on server restart (acceptable with Vercel's instant cold starts)
- Not suitable for multi-server setups (use Redis if scaling beyond 1000 users)

### 8. FREE Tier Rate Limiting Pattern

**Location**: `src/lib/rate-limiter.ts`

**Usage in Middleware**:

```typescript
import { withRateLimit } from "@/app/api/middleware/ratelimiter";

export async function POST(req: NextRequest) {
  return withRateLimit(req, handler, {
    limiterType: "auth", // 'api' | 'auth' | 'search'
    message: "Too many login attempts",
  });
}
```

**Direct Usage**:

```typescript
import {
  apiRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from "@/lib/rate-limiter";

// Check if request is allowed
const allowed = apiRateLimiter.check(userId);
if (!allowed) {
  return { error: "Rate limit exceeded" };
}

// Reset specific identifier
apiRateLimiter.reset(userId);

// Get statistics
const cleaned = apiRateLimiter.cleanup();
console.log(`Cleaned ${cleaned} expired entries`);
```

**Pre-configured Limiters**:

- `apiRateLimiter`: 200 requests per minute (general API)
- `authRateLimiter`: 5 requests per minute (login/register)
- `strictRateLimiter`: 10 requests per minute (sensitive operations)

**Features**:

- ✅ Sliding window algorithm
- ✅ Multiple limiter instances
- ✅ Auto-cleanup of expired entries
- ✅ Zero external dependencies
- ✅ Configurable limits per window

### 9. FREE Tier Error Tracking Pattern (Sentry Replacement)

**Location**: `src/lib/firebase-error-logger.ts`

**Usage in Components**:

```typescript
import {
  logError,
  logPerformance,
  logUserAction,
} from "@/lib/firebase-error-logger";

// Log errors (automatically sends to Firebase Analytics + Discord for critical)
try {
  await riskyOperation();
} catch (error) {
  logError(
    error,
    {
      userId: currentUser?.uid,
      url: window.location.href,
      component: "ProductPage",
      action: "addToCart",
    },
    "high"
  ); // 'low' | 'medium' | 'high' | 'critical'
}

// Log performance metrics
const start = performance.now();
await fetchProducts();
const duration = performance.now() - start;
logPerformance("fetch-products", duration, { category: "electronics" });

// Log user actions
logUserAction("product-view", { productId, category });
```

**Automatic Error Handling**:

Error handlers are initialized automatically in root layout via `ErrorInitializer` component.

**Features**:

- ✅ Firebase Analytics integration (FREE tier)
- ✅ Discord notifications for critical errors
- ✅ Global error and unhandled rejection handlers
- ✅ Performance tracking
- ✅ User action logging
- ✅ Severity levels (low, medium, high, critical)

**Discord Setup**:

1. Create Discord server
2. Create notification channel
3. Channel Settings → Integrations → Webhooks
4. Copy webhook URL to `.env` as `DISCORD_WEBHOOK_URL`

### 10. FREE Tier Team Notifications (Slack Replacement)

**Location**: `src/lib/discord-notifier.ts`

**Usage**:

```typescript
import {
  notifyError,
  notifyOrder,
  notifyUser,
  notifySystem,
} from "@/lib/discord-notifier";

// Error notifications
await notifyError(new Error("Payment failed"), { userId, orderId, amount });

// Order notifications
await notifyOrder("new", {
  orderId: "ORD123",
  amount: 1999,
  customer: "John Doe",
});

// User events
await notifyUser("registration", {
  userId: "user123",
  email: "user@example.com",
  name: "John Doe",
});

// System alerts
await notifySystem("deployment", {
  version: "1.2.0",
  environment: "production",
});
```

**Notification Types**:

- **Errors**: Formatted with stack trace and context
- **Orders**: New, completed, cancelled with order details
- **Users**: Registrations, escalations
- **System**: Health checks, deployments, low inventory

**Features**:

- ✅ Rich Discord embeds with colors
- ✅ Severity indicators
- ✅ Automatic retry on failure
- ✅ Zero cost (webhook-based)
- ✅ Team collaboration in Discord

## Cost Optimization & FREE Tier Architecture

### Overview

The platform has been optimized for small-scale businesses with **ZERO monthly costs** by eliminating all paid third-party services and using Firebase FREE tier + custom in-memory solutions.

### Cost Savings

| Service        | Before              | After                        | Savings        |
| -------------- | ------------------- | ---------------------------- | -------------- |
| Error Tracking | Sentry ($26/mo)     | Firebase Analytics + Discord | **$26/mo**     |
| Caching        | Redis ($10/mo)      | In-memory cache              | **$10/mo**     |
| Real-time      | Socket.IO (hosting) | Firebase Realtime Database   | **Variable**   |
| Notifications  | Slack ($0)          | Discord webhooks             | **$0**         |
| **TOTAL**      | **$36+/mo**         | **$0/mo**                    | **$432+/year** |

### Migration Strategy

**Phase 1**: Remove paid dependencies

- Uninstalled Sentry, Redis, Socket.IO packages
- Removed config files and middleware references

**Phase 2**: Implement FREE alternatives

- Created `memory-cache.ts` for caching
- Created `rate-limiter.ts` for API protection
- Created `discord-notifier.ts` for team alerts
- Created `firebase-error-logger.ts` for error tracking
- Created `firebase-realtime.ts` for real-time features

**Phase 3**: Update architecture

- Updated middleware to use FREE libraries
- Migrated auction system to Firebase Realtime Database
- Added error tracking to root layout
- Configured Vercel deployment

**Phase 4**: Testing & validation

- See `FIREBASE-MIGRATION-CHECKLIST.md` for complete steps

### When to Scale Up

Stay on FREE tier until reaching these thresholds:

1. **>1000 daily active users** → Consider Redis Cloud
2. **>$10K monthly revenue** → Add Sentry for advanced monitoring
3. **>100 concurrent auction bidders** → Upgrade Firebase plan
4. **>10GB Firebase Storage** → Optimize or upgrade

### Documentation

- **Migration Guide**: `FIREBASE-MIGRATION-CHECKLIST.md` (comprehensive checklist)
- **Cost Analysis**: `COST-OPTIMIZATION-GUIDE.md` (detailed comparison)
- **Setup Instructions**: See Firebase Console setup in migration checklist

## Common Tasks Guide
