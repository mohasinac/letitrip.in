# Quick Start Guide for AI Agents - JustForView.in

**Last Updated**: November 11, 2025  
**Version**: 1.0  
**Audience**: AI Agents starting work on this codebase

---

## 5-Minute Onboarding

### What is This Project?

JustForView.in is an **auction and e-commerce platform** for India built with:

- **Next.js 14+** (App Router) + **TypeScript** + **Tailwind CSS**
- **Firebase** (Firestore, Storage, Realtime DB, Auth) - 100% FREE tier
- **Vercel** hosting - FREE tier
- **Zero monthly costs** - All custom implementations

### Core Concepts

1. **Multi-vendor marketplace** - Sellers create shops and list products
2. **Dual selling modes** - Traditional e-commerce + auction bidding
3. **Real-time auctions** - Firebase Realtime Database (not Socket.IO)
4. **Service layer pattern** - NEVER call APIs directly, always use services
5. **Server/Client split** - Server Components for data, Client for interactivity

---

## The Golden Rules

### Rule #1: Always Use the Service Layer

```typescript
// ❌ WRONG
fetch("/api/products");

// ❌ WRONG
apiService.get("/api/products");

// ✅ CORRECT
import { productService } from "@/services/products.service";
productService.getProducts();
```

### Rule #2: Server vs Client Components

```typescript
// Server Component (default) - Data fetching
export default async function Page() {
  const data = await service.getData();
  return <Display data={data} />;
}

// Client Component - Interactivity
("use client");
export default function Button() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Rule #3: Firebase Admin SDK on Server Only

```typescript
// ❌ WRONG (Client)
import { getStorage } from "firebase/storage";

// ✅ CORRECT (API Route → Server Service)
// Client: Call API
fetch("/api/media/upload", { method: "POST", body: formData });

// API Route: Use server service
import { uploadMedia } from "@/app/api/lib/media-server";
await uploadMedia(file);

// Server Service: Use Firebase Admin SDK
import { getStorage } from "firebase-admin/storage";
```

### Rule #4: No Mocks, Real APIs Only

```typescript
// ❌ WRONG
const mockData = [{ id: 1, name: "Test" }];

// ✅ CORRECT
const realData = await productService.getProducts();
```

### Rule #5: TypeScript Everywhere

```typescript
// ❌ WRONG
function getProduct(id: any): any {}

// ✅ CORRECT
function getProduct(id: string): Promise<Product> {}
```

---

## Project Structure Quick Reference

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Backend API routes
│   │   └── lib/            # Server-side utilities
│   ├── (pages)/            # Public pages
│   ├── admin/              # Admin dashboard
│   ├── seller/             # Seller dashboard
│   └── user/               # User profile
│
├── services/               # API service layer (25+ services)
│   ├── products.service.ts
│   ├── auctions.service.ts
│   └── (23 more services)
│
├── components/             # React components
│   ├── admin/              # Admin UI
│   ├── seller/             # Seller UI
│   ├── product/            # Product display
│   ├── auction/            # Auction features
│   └── common/             # Shared components
│
├── lib/                    # Utility libraries
│   ├── memory-cache.ts     # In-memory cache (Redis replacement)
│   ├── rate-limiter.ts     # API rate limiting
│   ├── firebase-realtime.ts # Real-time auction system
│   └── firebase-error-logger.ts # Error tracking
│
├── types/                  # TypeScript interfaces
├── constants/              # App-wide constants
│   ├── api-routes.ts       # Centralized API routes
│   ├── database.ts         # Firestore collections
│   ├── inline-fields.ts    # Form configurations
│   └── bulk-actions.ts     # Bulk action definitions
│
└── hooks/                  # Custom React hooks
```

---

## Common Tasks

### Task 1: Add a New Resource (e.g., "Banners")

**Step 1**: Define TypeScript types

```typescript
// types/banner.ts
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
}

export interface BannerFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}
```

**Step 2**: Add API routes to constants

```typescript
// constants/api-routes.ts
export const BANNER_ROUTES = {
  LIST: "/banners",
  BY_ID: (id: string) => `/banners/${id}`,
} as const;
```

**Step 3**: Create service

```typescript
// services/banners.service.ts
import { apiService } from "./api.service";
import { Banner, BannerFilters } from "@/types/banner";
import { BANNER_ROUTES } from "@/constants/api-routes";

class BannerService {
  async getBanners(filters?: BannerFilters): Promise<Banner[]> {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.set("is_active", String(filters.isActive));
    }

    const url = params.toString()
      ? `${BANNER_ROUTES.LIST}?${params}`
      : BANNER_ROUTES.LIST;

    const response = await apiService.get<{ banners: Banner[] }>(url);
    return response.banners;
  }

  async createBanner(data: Omit<Banner, "id" | "createdAt">): Promise<Banner> {
    const response = await apiService.post<{ banner: Banner }>(
      BANNER_ROUTES.LIST,
      data
    );
    return response.banner;
  }
}

export const bannerService = new BannerService();
```

**Step 4**: Create API route

```typescript
// app/api/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection("banners").get();
    const banners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Step 5**: Use in component

```typescript
// components/banner/BannerList.tsx
"use client";
import { useState, useEffect } from "react";
import { bannerService } from "@/services/banners.service";

export function BannerList() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    bannerService.getBanners({ isActive: true }).then(setBanners);
  }, []);

  return (
    <div>
      {banners.map((banner) => (
        <img key={banner.id} src={banner.imageUrl} alt={banner.title} />
      ))}
    </div>
  );
}
```

### Task 2: Add Real-Time Feature (like Auctions)

```typescript
// 1. Subscribe to updates in component
"use client";
import { useEffect, useState } from "react";
import { subscribeToAuction } from "@/lib/firebase-realtime";

export function AuctionLive({ auctionId }: { auctionId: string }) {
  const [currentBid, setCurrentBid] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAuction(auctionId, (status) => {
      setCurrentBid(status.currentBid);
    });

    return unsubscribe; // Cleanup
  }, [auctionId]);

  return <div>Current Bid: ₹{currentBid}</div>;
}

// 2. Update in API route
import { placeBid } from "@/lib/firebase-realtime";

export async function POST(req: NextRequest) {
  const { auctionId, userId, userName, amount } = await req.json();

  const result = await placeBid(auctionId, userId, userName, amount);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

### Task 3: Add Form with Validation

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\+?[0-9]{10,}$/, "Invalid phone number"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await myService.create(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

## Resource Documentation

All resources are documented in `docs/resources/`:

| Resource   | File            | Description                |
| ---------- | --------------- | -------------------------- |
| Products   | `products.md`   | Product catalog management |
| Auctions   | `auctions.md`   | Auction system             |
| Categories | `categories.md` | Hierarchical categories    |
| Orders     | `orders.md`     | Order lifecycle            |
| Shops      | `shops.md`      | Multi-vendor shops         |
| Reviews    | `reviews.md`    | Product reviews            |
| Coupons    | `coupons.md`    | Discount codes             |
| Addresses  | `addresses.md`  | User addresses             |
| Payments   | `payments.md`   | Payment processing         |

Each document includes:

- Complete schema with all fields
- Relationships to other resources
- Filter configurations
- API routes
- Service methods
- Component patterns
- Bulk actions

---

## Testing

### Test Workflows

We have **11 comprehensive test workflows** (140+ steps) in `src/lib/test-workflows/`:

```bash
# Run individual workflow
npm run test:workflow:1    # Product Purchase (11 steps)
npm run test:workflow:2    # Auction Bidding (12 steps)
npm run test:workflow:8    # Seller Product Creation (10 steps)

# Run all workflows
npm run test:workflows:all

# Interactive dashboard
npm run dev
# Visit: http://localhost:3000/test-workflows
```

**Test Workflow Features**:

- ✅ Real API calls (no mocks)
- ✅ Type-safe helpers (60+ methods)
- ✅ Step-by-step logging
- ✅ Automatic cleanup
- ✅ 100% pass rate

---

## Key Architectural Decisions

### Why Firebase FREE Tier?

- ✅ 50K reads/day (1.5M/month)
- ✅ 5GB storage
- ✅ 100 concurrent connections
- ✅ Zero cost for 0-1000 users
- ✅ Automatic scaling

### Why Custom Libraries?

Saved $432+/year by replacing:

- **Sentry** ($26/mo) → `firebase-error-logger.ts`
- **Redis** ($10/mo) → `memory-cache.ts`
- **Socket.IO** (hosting) → Firebase Realtime DB

### Why Service Layer?

- ✅ Type safety
- ✅ Centralized error handling
- ✅ Easy testing
- ✅ Single source of truth
- ✅ Consistent API

---

## Common Patterns Cheat Sheet

### Fetch Data in Server Component

```typescript
// app/page.tsx
export default async function Page() {
  const data = await service.getData();
  return <Display data={data} />;
}
```

### Fetch Data in Client Component

```typescript
"use client";
export default function Page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    service.getData().then(setData);
  }, []);

  return <Display data={data} />;
}
```

### Handle Button Click

```typescript
"use client";
const handleClick = async () => {
  try {
    await service.doAction();
    toast.success("Success!");
  } catch (error: any) {
    toast.error(error.message);
  }
};

<button onClick={handleClick}>Click Me</button>;
```

### Real-Time Updates

```typescript
"use client";
useEffect(() => {
  const unsubscribe = subscribeToResource(id, (data) => {
    setData(data);
  });
  return unsubscribe;
}, [id]);
```

### Form with Validation

```typescript
"use client"
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('field')} />
  {errors.field && <p>{errors.field.message}</p>}
</form>
```

---

## Debugging Tips

### Check Service Layer

```typescript
// In browser console
const { productService } = await import("/src/services/products.service");
const products = await productService.getProducts();
console.log(products);
```

### Check API Route Directly

```bash
# In terminal
curl http://localhost:3000/api/products
```

### Check Firebase Data

```typescript
// In API route
const db = getFirestoreAdmin();
const snapshot = await db.collection("products").get();
console.log("Total products:", snapshot.size);
```

### Check Cache

```typescript
// In browser console
import { memoryCache } from "/src/lib/memory-cache";
memoryCache.getStats();
```

---

## Next Steps

1. **Read Architecture Overview**: `docs/project/01-ARCHITECTURE-OVERVIEW.md`
2. **Understand Service Layer**: `docs/project/02-SERVICE-LAYER-GUIDE.md`
3. **Learn Component Patterns**: `docs/project/03-COMPONENT-PATTERNS.md`
4. **Explore Resource Docs**: `docs/resources/*.md`
5. **Check AI Agent Guide**: `docs/ai/AI-AGENT-GUIDE.md`

---

## Quick Links

- **README**: `README.md` - Full project documentation
- **API Routes**: `src/constants/api-routes.ts` - All API endpoints
- **Database Schema**: `src/constants/database.ts` - Firestore collections
- **Services Index**: `src/services/index.ts` - All available services
- **Test Workflows**: `src/lib/test-workflows/` - E2E test suites

---

**Built with ❤️ for zero-cost scalability**

Need help? Check the docs or ask in Discord.
