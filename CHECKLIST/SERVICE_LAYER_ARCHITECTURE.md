# Service Layer Architecture

**Date:** November 7, 2025  
**Pattern:** Client-Side Service Layer (Auth Pattern)

---

## 🎯 Overview

All API interactions are abstracted through **client-side service classes** to keep UI components clean and maintainable. This follows the exact same pattern as `auth.service.ts`, where:

- **UI Components** → Call service methods (e.g., `shopsService.list()`)
- **Service Layer** → Makes API calls (e.g., `apiService.get('/api/shops')`)
- **API Routes** → Handle requests and interact with database

**Key Principle:** Services are **client-side wrappers** around API calls, NOT server-side database access.

---

## 📂 Service Layer Structure

```
src/
├── services/
│   ├── api.service.ts            # ✅ Base API client (already exists)
│   ├── auth.service.ts           # ✅ Authentication (already exists)
│   ├── shops.service.ts          # Shop CRUD operations
│   ├── products.service.ts       # Product CRUD operations
│   ├── orders.service.ts         # Order management
│   ├── coupons.service.ts        # Coupon operations
│   ├── categories.service.ts     # Category tree operations
│   ├── auctions.service.ts       # Auction & bidding
│   ├── returns.service.ts        # Returns & refunds
│   ├── reviews.service.ts        # Reviews & ratings
│   ├── users.service.ts          # User management
│   ├── analytics.service.ts      # Analytics & stats
│   ├── media.service.ts          # Media upload/storage
│   ├── cart.service.ts           # Cart operations
│   ├── favorites.service.ts      # Wishlist operations
│   ├── support.service.ts        # Support tickets
│   └── index.ts                  # Service exports
└── app/api/
    └── shops/
        └── route.ts               # Server-side API route (handles DB)
```

---

## 🔧 Service Pattern (Following auth.service.ts)

### Example: ShopsService (Client-Side)

```typescript
// src/services/shops.service.ts
import { apiService } from "./api.service";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  isBanned: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface ShopFilters {
  search?: string;
  verified?: boolean;
  featured?: boolean;
  banned?: boolean;
}

interface ShopCreateInput {
  name: string;
  slug: string;
  description: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

interface ShopUpdateInput {
  name?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  logo?: string | null;
  banner?: string | null;
}

interface ShopsListResponse {
  success: boolean;
  shops: Shop[];
  canCreateMore: boolean;
}

interface ShopResponse {
  success: boolean;
  shop: Shop;
  message?: string;
}

class ShopsService {
  /**
   * List shops with filters
   * GET /api/shops?search=tech&verified=true
   */
  async list(filters?: ShopFilters): Promise<ShopsListResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.verified !== undefined)
      params.append("verified", String(filters.verified));
    if (filters?.featured !== undefined)
      params.append("featured", String(filters.featured));
    if (filters?.banned !== undefined)
      params.append("banned", String(filters.banned));

    const queryString = params.toString();
    const url = queryString ? `/shops?${queryString}` : "/shops";

    return apiService.get<ShopsListResponse>(url);
  }

  /**
   * Get shop by ID
   * GET /api/shops/[id]
   */
  async getById(shopId: string): Promise<Shop> {
    const response = await apiService.get<ShopResponse>(`/shops/${shopId}`);
    return response.shop;
  }

  /**
   * Create new shop
   * POST /api/shops
   */
  async create(data: ShopCreateInput): Promise<Shop> {
    const response = await apiService.post<ShopResponse>("/shops", data);
    return response.shop;
  }

  /**
   * Update shop
   * PATCH /api/shops/[id]
   */
  async update(shopId: string, data: ShopUpdateInput): Promise<Shop> {
    const response = await apiService.patch<ShopResponse>(
      `/shops/${shopId}`,
      data
    );
    return response.shop;
  }

  /**
   * Delete shop
   * DELETE /api/shops/[id]
   */
  async delete(shopId: string): Promise<void> {
    await apiService.delete(`/shops/${shopId}`);
  }

  /**
   * Check if user can create more shops
   * Included in list() response
   */
  async canCreateMore(): Promise<boolean> {
    const response = await this.list();
    return response.canCreateMore;
  }
}

export const shopsService = new ShopsService();
export type {
  Shop,
  ShopFilters,
  ShopCreateInput,
  ShopUpdateInput,
  ShopsListResponse,
  ShopResponse,
};
```

---

## 🔌 API Route (Server-Side - Handles Database)

### Example: Shops API Route

```typescript
// src/app/api/shops/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { COLLECTIONS } from "@/constants/database";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const role = session?.user?.role || "guest";

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");
    const featured = searchParams.get("featured");

    // Build query based on role
    let query = db.collection(COLLECTIONS.SHOPS);

    // Guest/User: Only verified, non-banned
    if (!userId || role === "user") {
      query = query
        .where("isVerified", "==", true)
        .where("isBanned", "==", false);
    }
    // Seller: Own shops only
    else if (role === "seller") {
      query = query.where("ownerId", "==", userId);
    }
    // Admin: All shops (no additional filter)

    // Apply search filter
    if (search) {
      query = query.where("name", ">=", search);
    }

    // Apply verified filter
    if (verified !== null) {
      query = query.where("isVerified", "==", verified === "true");
    }

    const snapshot = await query.get();
    const shops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Check if user can create more shops
    let canCreateMore = false;
    if (userId) {
      if (role === "admin") {
        canCreateMore = true;
      } else {
        const userShops = await db
          .collection(COLLECTIONS.SHOPS)
          .where("ownerId", "==", userId)
          .get();
        canCreateMore = userShops.size < 1;
      }
    }

    return NextResponse.json({
      success: true,
      shops,
      canCreateMore,
    });
  } catch (error) {
    console.error("[GET /api/shops] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role;

    if (!["seller", "admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check creation limit for sellers
    if (role === "seller") {
      const existingShops = await db
        .collection(COLLECTIONS.SHOPS)
        .where("ownerId", "==", userId)
        .get();

      if (existingShops.size >= 1) {
        return NextResponse.json(
          { success: false, error: "Shop creation limit reached" },
          { status: 400 }
        );
      }
    }

    // Check slug uniqueness
    const existingSlug = await db
      .collection(COLLECTIONS.SHOPS)
      .where("slug", "==", body.slug)
      .get();

    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: "Slug already in use" },
        { status: 400 }
      );
    }

    // Create shop
    const shopData = {
      ...body,
      ownerId: userId,
      isVerified: false,
      isFeatured: false,
      isBanned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTIONS.SHOPS).add(shopData);
    const shop = { id: docRef.id, ...shopData };

    return NextResponse.json({
      success: true,
      shop,
      message: "Shop created successfully",
    });
  } catch (error) {
    console.error("[POST /api/shops] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI Component Integration (Same as auth.service.ts pattern)

### Example: Shop Listing Page

```typescript
// src/app/seller/my-shops/page.tsx
"use client";

import { useEffect, useState } from "react";
import { shopsService } from "@/services/shops.service";
import type { Shop } from "@/services/shops.service";
import ShopCard from "@/components/seller/ShopCard";

export default function MyShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canCreateMore, setCanCreateMore] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use service instead of direct fetch()
      const response = await shopsService.list();

      setShops(response.shops);
      setCanCreateMore(response.canCreateMore);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError(err instanceof Error ? err.message : "Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async (data: ShopCreateInput) => {
    try {
      // Use service method
      const shop = await shopsService.create(data);

      // Navigate to edit page
      router.push(`/seller/my-shops/${shop.id}/edit`);
    } catch (err) {
      console.error("Error creating shop:", err);
      setError(err instanceof Error ? err.message : "Failed to create shop");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Shops</h1>
      {canCreateMore && (
        <button onClick={() => router.push("/seller/my-shops/create")}>
          Create Shop
        </button>
      )}
      <div className="grid">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}
```

### Compare with Auth Pattern

```typescript
// Auth pattern (existing)
import { authService } from "@/services/auth.service";

const handleLogin = async (credentials) => {
  await authService.login(credentials);
};

// Shops pattern (new - same structure!)
import { shopsService } from "@/services/shops.service";

const handleCreateShop = async (data) => {
  await shopsService.create(data);
};
```

---

## ✅ Service Layer Checklist

### Phase 2.8: Core Services (Priority 1)

**Pattern: Client-side API wrappers (like auth.service.ts)**

- [ ] **ShopsService** (Client-side wrapper for /api/shops)

  - `list()` → calls apiService.get('/api/shops')
  - `getById(id)` → calls apiService.get(`/api/shops/${id}`)
  - `create(data)` → calls apiService.post('/api/shops', data)
  - `update(id, data)` → calls apiService.patch(`/api/shops/${id}`, data)
  - `delete(id)` → calls apiService.delete(`/api/shops/${id}`)

- [ ] **ProductsService** (Client-side wrapper for /api/products)

  - `list(filters)` → calls apiService.get('/api/products', params)
  - `getById(id)` → calls apiService.get(`/api/products/${id}`)
  - `create(data)` → calls apiService.post('/api/products', data)
  - `update(id, data)` → calls apiService.patch(`/api/products/${id}`, data)
  - `delete(id)` → calls apiService.delete(`/api/products/${id}`)
  - `uploadMedia(files)` → calls apiService.post('/api/media', formData)

- [ ] **AuctionsService** (Client-side wrapper for /api/auctions)

  - `list(filters)` → calls apiService.get('/api/auctions', params)
  - `getById(id)` → calls apiService.get(`/api/auctions/${id}`)
  - `create(data)` → calls apiService.post('/api/auctions', data)
  - `placeBid(auctionId, amount)` → calls apiService.post(`/api/auctions/${auctionId}/bids`, { amount })
  - `getMyBids()` → calls apiService.get('/api/bids/my')

- [ ] **ReviewsService** (Client-side wrapper for /api/reviews)
  - `list(filters)` → calls apiService.get('/api/reviews', params)
  - `create(data)` → calls apiService.post('/api/reviews', data)
  - `update(id, data)` → calls apiService.patch(`/api/reviews/${id}`, data)
  - `delete(id)` → calls apiService.delete(`/api/reviews/${id}`)
  - `getStats(targetId)` → calls apiService.get(`/api/reviews/stats/${targetId}`)

---

## 💡 Benefits of This Architecture

1. **Consistency with Auth Pattern**

   - All services follow auth.service.ts structure
   - Predictable API across the application
   - Easy onboarding for developers familiar with auth

2. **Clean Separation of Concerns**

   - UI components: presentation and user interaction
   - Client services: API abstraction and caching
   - API routes: authentication, authorization, database operations

3. **Type Safety**

   - TypeScript interfaces for all service methods
   - apiService provides typed responses
   - Compile-time error detection

4. **Code Reusability**

   - Services can be used across multiple components
   - Consistent data fetching patterns
   - Shared error handling

5. **Testability**

   - Easy to mock apiService calls
   - Can test UI logic without API
   - API routes can be tested independently

6. **Maintainability**

   - API changes only affect route handlers
   - UI components remain unchanged
   - Database schema changes isolated in API layer

7. **Performance**

   - Built-in caching support (like auth.service.ts localStorage)
   - Can add request deduplication
   - Optimized API calls

8. **Security**
   - Authentication in API routes only
   - Centralized authorization checks
   - No database credentials in client code

---

## 🔄 Implementation Order

### Step 1: Create Service Class (5 minutes)

```typescript
// Copy auth.service.ts structure
class ShopsService {
  async list() {
    return apiService.get("/shops");
  }
  // ... more methods
}
export const shopsService = new ShopsService();
```

### Step 2: Define TypeScript Types (5 minutes)

```typescript
export interface Shop {
  id: string;
  name: string;
  // ... fields
}
```

### Step 3: Update UI Components (10 minutes)

```typescript
// Before:
const res = await fetch("/api/shops");

// After:
const shops = await shopsService.list();
```

### Step 4: Ensure API Routes Handle Database (Already done in most cases)

```typescript
// API routes already do database operations
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const shops = await db.collection('shops').where(...).get();
  return NextResponse.json({ shops });
}
```

---

## 📚 Service Method Conventions

### Naming

- `list()` - Get multiple records with filters
- `getById()` - Get single record by ID
- `create()` - Create new record
- `update()` - Update existing record
- `delete()` - Delete record
- `count()` - Count records matching filters

### Parameters

1. **Resource IDs** (string)
2. **User Context** (userId: string | null, role: string)
3. **Data/Filters** (optional objects)

### Return Values

- Single records: `Promise<Shop>`
- Multiple records: `Promise<Shop[]>`
- Counts: `Promise<number>`
- Boolean checks: `Promise<boolean>`

### Error Handling

- Throw `Error` with descriptive message
- API route catches and formats response
- UI displays user-friendly error message

---

## 🚀 Implementation Order

1. **Phase 2.8**: Create base service classes and database client
2. **Phase 3.2**: Integrate ShopsService into shops API
3. **Phase 3.3**: Add ProductsService for product management
4. **Phase 3.4**: Add CouponsService for coupons
5. **Continue**: Add remaining services as features are built

---

**Next Step**: Create Phase 2.8 in the checklist and implement base services!
