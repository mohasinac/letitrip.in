# Architecture Overview - JustForView.in

**Last Updated**: November 11, 2025  
**Version**: 1.0  
**Audience**: AI Agents, New Developers

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Principles](#architecture-principles)
4. [System Architecture](#system-architecture)
5. [Cost Optimization Strategy](#cost-optimization-strategy)
6. [Key Architectural Decisions](#key-architectural-decisions)

---

## Platform Overview

**JustForView.in** (formerly Letitrip.in) is a modern auction and e-commerce platform built for the Indian market. It enables:

- **Multi-vendor marketplace** with individual seller shops
- **Auction-style selling** with real-time bidding
- **Traditional e-commerce** with shopping cart and checkout
- **Admin dashboard** for platform management
- **Seller dashboard** for shop/product management

### Core Features

- ✅ Real-time auction bidding via Firebase Realtime Database
- ✅ Multi-tenant shop system
- ✅ Hierarchical product categories
- ✅ Shopping cart with session management
- ✅ Complete order lifecycle management
- ✅ Integrated payment processing (Razorpay, PayPal, COD)
- ✅ Support ticket system
- ✅ Product reviews and ratings
- ✅ Media upload (images/videos to Firebase Storage)
- ✅ 100% FREE tier infrastructure (zero monthly costs)

---

## Technology Stack

### Frontend

| Technology       | Version | Purpose                     |
| ---------------- | ------- | --------------------------- |
| **Next.js**      | 14+     | React framework, App Router |
| **TypeScript**   | 5.x     | Type safety                 |
| **Tailwind CSS** | 3.x     | Utility-first styling       |
| **React**        | 18.x    | UI library                  |

### Backend

| Technology             | Purpose                |
| ---------------------- | ---------------------- |
| **Next.js API Routes** | RESTful API endpoints  |
| **Firebase Admin SDK** | Server-side operations |
| **Node.js**            | Runtime environment    |

### Database & Storage

| Service                        | Purpose                     |
| ------------------------------ | --------------------------- |
| **Firestore**                  | NoSQL document database     |
| **Firebase Realtime Database** | Real-time bidding data      |
| **Firebase Storage**           | Media files (images/videos) |
| **Firebase Authentication**    | User authentication         |

### Infrastructure

| Service              | Tier | Purpose              |
| -------------------- | ---- | -------------------- |
| **Vercel**           | FREE | Deployment & hosting |
| **Firebase**         | FREE | Backend services     |
| **Discord Webhooks** | FREE | Team notifications   |

### Custom Libraries (Zero Cost)

All built in-house, no external paid services:

- `memory-cache.ts` - In-memory caching with TTL
- `rate-limiter.ts` - API rate limiting
- `firebase-error-logger.ts` - Error tracking via Firebase Analytics
- `firebase-realtime.ts` - Real-time auction system
- `discord-notifier.ts` - Team notifications

---

## Architecture Principles

### 1. **Service Layer Pattern** (CRITICAL)

**Rule**: NEVER call APIs directly from components or hooks. ALWAYS use the service layer.

```typescript
// ❌ WRONG
fetch("/api/products").then((res) => res.json());

// ❌ WRONG
apiService.get("/api/products");

// ✅ CORRECT
import { productService } from "@/services/products.service";
productService.getProducts();
```

**Why**:

- Centralized business logic
- Consistent error handling
- Easy testing and mocking
- Type safety
- Single source of truth

### 2. **Server/Client Component Split**

- **Server Components** (default): Data fetching, static content, SEO
- **Client Components** (`"use client"`): Interactivity, state, user input

```typescript
// Server Component (default)
export default async function ProductPage({ params }) {
  const product = await productService.getProduct(params.id);
  return <ProductDisplay product={product} />;
}

// Client Component
("use client");
export default function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  // Interactive logic
}
```

### 3. **Firebase Admin SDK on Server Only**

**Rule**: NEVER use Firebase Client SDK directly in client code for Storage operations.

```typescript
// ❌ WRONG (Client)
import { getStorage } from "firebase/storage";
const storage = getStorage();

// ✅ CORRECT (Client → API Route → Server Service)
// Client: Call API route
const response = await fetch("/api/media/upload", {
  method: "POST",
  body: formData,
});

// API Route: Use server service
import { uploadMedia } from "@/app/api/lib/media-server";
await uploadMedia(file);

// Server Service: Use Firebase Admin SDK
import { getStorage } from "firebase-admin/storage";
const bucket = getStorage().bucket();
```

### 4. **Type Safety Everywhere**

- All data structures have TypeScript interfaces in `src/types/`
- All service methods have typed parameters and return values
- Use `zod` schemas for validation
- No `any` types except for external library integrations

### 5. **Zero Mocks in Production**

- All services call real API endpoints
- Test data generation via `testDataService` (admin only)
- Test workflows use real API calls (see `src/lib/test-workflows/`)

### 6. **Cost-Optimized FREE Tier**

- Designed for 0-1000 concurrent users with $0/month costs
- All services on Firebase FREE tier + Vercel FREE tier
- Custom implementations replace paid services (Redis, Sentry, Socket.IO)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
│  Next.js Pages (React) + Tailwind CSS + TypeScript          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               VERCEL (FREE TIER - Edge Network)              │
│  Next.js Server + API Routes + Static Assets                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬─────────────────┐
        │            │            │                 │
        ▼            ▼            ▼                 ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐ ┌──────────────┐
│  Firestore  │ │Firebase │ │  Firebase   │ │  Firebase    │
│  (NoSQL DB) │ │ Storage │ │  Realtime   │ │   Auth       │
│             │ │(Media)  │ │  Database   │ │              │
│ FREE Tier   │ │FREE Tier│ │(Auctions)   │ │  FREE Tier   │
│ 50K reads/day││5GB total││ FREE Tier   │ │10K auths/mo  │
└─────────────┘ └─────────┘ └─────────────┘ └──────────────┘
```

### Request Flow

#### 1. **Standard Page Load** (Server Component)

```
User → Next.js Page (Server) → Service Layer → API Route → Firebase → Response
```

Example: Product listing page

```typescript
// app/products/page.tsx (Server Component)
export default async function ProductsPage() {
  const products = await productService.getProducts({ status: "published" });
  return <ProductGrid products={products} />;
}
```

#### 2. **Interactive Action** (Client Component)

```
User Click → Client Component → Service Layer → API Route → Firebase → Update UI
```

Example: Add to cart

```typescript
// components/product/AddToCartButton.tsx (Client Component)
"use client";
export default function AddToCartButton({ productId }) {
  const handleAddToCart = async () => {
    await cartService.addItem(productId, 1);
    toast.success("Added to cart");
  };
}
```

#### 3. **Real-Time Updates** (Auction Bidding)

```
User Bid → API Route → Firebase Realtime DB → WebSocket Push → All Connected Clients
```

Example: Live auction bidding

```typescript
// Subscribe to auction updates
useEffect(() => {
  const unsubscribe = subscribeToAuction(auctionId, (status) => {
    setCurrentBid(status.currentBid);
    setBidCount(status.bidCount);
  });
  return unsubscribe;
}, [auctionId]);
```

### Database Schema (Firestore)

**Primary Collections**:

- `users` - User profiles and authentication
- `shops` - Seller shops (multi-tenant)
- `products` - Product catalog
- `categories` - Hierarchical category tree
- `auctions` - Auction listings
- `bids` - Auction bid history
- `orders` - Order records
- `order_items` - Order line items
- `carts` - Shopping carts
- `reviews` - Product/shop reviews
- `coupons` - Discount codes
- `support_tickets` - Customer support
- `hero_slides` - Homepage hero carousel

**See**: `src/constants/database.ts` for complete list

### File Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── lib/              # Server-side utilities
│   │   │   ├── firebase/     # Firebase Admin SDK
│   │   │   └── middleware/   # Rate limiting, caching, logging
│   │   ├── auth/             # Authentication endpoints
│   │   ├── products/         # Product CRUD
│   │   ├── auctions/         # Auction management
│   │   ├── cart/             # Cart operations
│   │   └── orders/           # Order processing
│   ├── (pages)/              # Public pages
│   ├── admin/                # Admin dashboard
│   ├── seller/               # Seller dashboard
│   └── user/                 # User profile
├── components/               # React components
│   ├── admin/                # Admin-specific components
│   ├── auction/              # Auction UI components
│   ├── cart/                 # Shopping cart components
│   ├── product/              # Product display components
│   ├── seller/               # Seller dashboard components
│   └── common/               # Shared UI components
├── services/                 # API service layer (NO MOCKS)
│   ├── api.service.ts        # Base HTTP client
│   ├── auth.service.ts       # Authentication
│   ├── products.service.ts   # Products API
│   ├── auctions.service.ts   # Auctions API
│   └── (25+ other services)
├── hooks/                    # Custom React hooks
├── contexts/                 # React Context providers
├── lib/                      # Utility libraries
│   ├── memory-cache.ts       # In-memory cache (Redis replacement)
│   ├── rate-limiter.ts       # API rate limiting
│   ├── firebase-realtime.ts  # Real-time auction system
│   ├── firebase-error-logger.ts # Error tracking
│   └── discord-notifier.ts   # Team notifications
├── types/                    # TypeScript type definitions
└── constants/                # App-wide constants
    ├── api-routes.ts         # Centralized API routes
    ├── database.ts           # Firestore collection names
    ├── inline-fields.ts      # Form field configurations
    └── bulk-actions.ts       # Bulk action definitions
```

---

## Cost Optimization Strategy

### Problem: $432+/year in third-party services

Original stack:

- Sentry: $26/month ($312/year)
- Redis: $10/month ($120/year)
- Socket.IO (hosting): Variable
- Total: **$432+/year**

### Solution: 100% FREE tier with custom implementations

New stack:

- ✅ Firebase Analytics (FREE) → Error tracking
- ✅ In-memory cache (FREE) → Caching
- ✅ Firebase Realtime Database (FREE) → Real-time features
- ✅ Discord webhooks (FREE) → Team notifications
- Total: **$0/month**

### Custom Libraries

#### 1. Memory Cache (`src/lib/memory-cache.ts`)

Replaces: Redis ($10/month)

```typescript
import { memoryCache } from "@/lib/memory-cache";

// Set with TTL (seconds)
memoryCache.set("products-list", products, 300); // 5 min

// Get from cache
const cached = memoryCache.get("products-list");

// Statistics
const stats = memoryCache.getStats();
```

**Features**:

- TTL-based expiration
- Auto-cleanup every 5 minutes
- Statistics tracking
- Zero dependencies

**Limitations**:

- Cache clears on server restart (acceptable on Vercel)
- Single-server only (not distributed)

#### 2. Rate Limiter (`src/lib/rate-limiter.ts`)

Replaces: Upstash Redis Rate Limiter

```typescript
import { apiRateLimiter } from "@/lib/rate-limiter";

// Check if request allowed
const allowed = apiRateLimiter.check(userId);
if (!allowed) {
  return { error: "Rate limit exceeded" };
}
```

**Pre-configured limiters**:

- `apiRateLimiter`: 200 req/min (general API)
- `authRateLimiter`: 5 req/min (login/register)
- `strictRateLimiter`: 10 req/min (sensitive operations)

**Algorithm**: Sliding window with auto-cleanup

#### 3. Firebase Error Logger (`src/lib/firebase-error-logger.ts`)

Replaces: Sentry ($26/month)

```typescript
import { logError } from "@/lib/firebase-error-logger";

try {
  await riskyOperation();
} catch (error) {
  logError(
    error,
    {
      userId: user?.uid,
      url: window.location.href,
      component: "ProductPage",
    },
    "high"
  ); // Severity: low/medium/high/critical
}
```

**Features**:

- Firebase Analytics integration
- Discord notifications for critical errors
- Performance tracking
- User action logging
- Global error handlers

#### 4. Firebase Realtime Database (`src/lib/firebase-realtime.ts`)

Replaces: Socket.IO (hosting costs)

```typescript
import { subscribeToAuction, placeBid } from "@/lib/firebase-realtime";

// Subscribe to real-time updates
useEffect(() => {
  const unsubscribe = subscribeToAuction(auctionId, (status) => {
    setCurrentBid(status.currentBid);
    setBidCount(status.bidCount);
  });
  return unsubscribe;
}, [auctionId]);

// Place bid (in API route)
await placeBid(auctionId, userId, userName, amount);
```

**Benefits**:

- No server required
- Automatic scaling (100 concurrent connections FREE)
- Offline support
- Security rules

#### 5. Discord Notifier (`src/lib/discord-notifier.ts`)

Replaces: Slack (unused)

```typescript
import { notifyError, notifyOrder } from "@/lib/discord-notifier";

// Error notification
await notifyError(new Error("Payment failed"), { userId, orderId });

// Order notification
await notifyOrder("new", { orderId, amount, customer });
```

**Notification types**:

- Errors (with stack trace)
- Orders (new, completed, cancelled)
- User events (registration, escalation)
- System alerts (deployment, low inventory)

### FREE Tier Limits

| Service            | FREE Tier Limit    | Notes                     |
| ------------------ | ------------------ | ------------------------- |
| Vercel             | 100GB bandwidth/mo | Sufficient for 10K+ users |
| Firestore          | 50K reads/day      | ~1.5M reads/month         |
| Firebase Storage   | 5GB total, 1GB/day | Optimize images           |
| Realtime Database  | 100 concurrent     | Perfect for auctions      |
| Firebase Auth      | 10K auths/month    | More than enough          |
| Discord Webhooks   | Unlimited          | Free forever              |
| Firebase Analytics | Unlimited events   | Free forever              |

**When to upgrade**:

- > 1000 daily active users → Consider Redis Cloud
- > $10K monthly revenue → Add Sentry for advanced monitoring
- > 100 concurrent auction bidders → Upgrade Firebase plan
- > 10GB storage → Optimize or upgrade

---

## Key Architectural Decisions

### 1. Why Next.js App Router?

✅ **Server Components** for better performance
✅ **Built-in API routes** (no separate backend)
✅ **File-based routing** (intuitive structure)
✅ **Automatic code splitting** (faster page loads)
✅ **SEO-friendly** (server-side rendering)

### 2. Why Firebase?

✅ **FREE tier** sufficient for small-medium scale
✅ **Generous limits** (50K reads/day, 5GB storage)
✅ **Real-time database** for auctions
✅ **Built-in authentication**
✅ **Managed infrastructure** (no server maintenance)
✅ **Automatic scaling**

### 3. Why Vercel?

✅ **FREE tier** with 100GB bandwidth/month
✅ **Edge network** (fast global delivery)
✅ **Automatic deployments** from Git
✅ **Environment variables** management
✅ **Built-in analytics**
✅ **Zero configuration** for Next.js

### 4. Why Custom Libraries Instead of Third-Party?

✅ **Zero cost** vs $432+/year
✅ **Full control** over implementation
✅ **No vendor lock-in**
✅ **Perfect fit** for our scale (0-1000 users)
✅ **Learning opportunity** for team
✅ **No external dependencies** to maintain

### 5. Why Service Layer Pattern?

✅ **Consistent API** across entire app
✅ **Easy to test** (mock service layer)
✅ **Type safety** (TypeScript interfaces)
✅ **Centralized error handling**
✅ **Single source of truth** for API calls
✅ **Easy to refactor** (change once, works everywhere)

### 6. Why No Redux/Zustand?

We use React Context + Hooks instead:

✅ **Simpler** (less boilerplate)
✅ **Built-in** (no external dependencies)
✅ **Sufficient** for our state management needs
✅ **Server Components** handle most data fetching

Only two contexts:

- `AuthContext` - Global user authentication state
- `UploadContext` - Media upload queue management

---

## Next Steps

Continue reading:

1. **[Service Layer Guide](./02-SERVICE-LAYER-GUIDE.md)** - How to use and create services
2. **[Component Patterns](./03-COMPONENT-PATTERNS.md)** - React component best practices
3. **[API Route Patterns](./04-API-ROUTE-PATTERNS.md)** - Backend endpoint creation
4. **[Database Patterns](./05-DATABASE-PATTERNS.md)** - Firestore queries and schemas
5. **[Testing Guide](./06-TESTING-GUIDE.md)** - Test workflows and patterns

---

**Built with ❤️ for zero-cost scalability**
