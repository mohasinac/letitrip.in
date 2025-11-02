# 🏗️ API Client Architecture - Complete Refactoring Plan

**Project:** HobbiesSpot.com - E-Commerce Platform  
**Created:** November 3, 2025  
**Status:** Planning → Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current Problems](#current-problems)
3. [Architecture Design](#architecture-design)
4. [Implementation Plan](#implementation-plan)
5. [API Endpoints Documentation](#api-endpoints-documentation)
6. [Testing Strategy](#testing-strategy)
7. [Migration Guide](#migration-guide)

---

## 🎯 Overview

### Goals

1. **Single Source of Truth**: Centralized API client for all backend calls
2. **No Direct Database Calls**: UI must never call Firestore directly
3. **Type Safety**: Full TypeScript support with proper models
4. **Validation**: Backend validates all requests, UI displays errors
5. **Maintainability**: Change once, update everywhere
6. **Testability**: Unit tests for all API endpoints
7. **Documentation**: Before and after documentation for all APIs

### Collections in Use

1. **users** - User management
2. **products** - Product catalog
3. **orders** - Order processing
4. **categories** - Category hierarchy
5. **reviews** - Product reviews

---

## 🚫 Current Problems

### 1. Scattered API Calls

```tsx
// ❌ WRONG: Direct fetch() calls everywhere
const response = await fetch("/api/products");
const data = await response.json();
```

### 2. Inconsistent Error Handling

```tsx
// ❌ WRONG: Different error handling in every file
try {
  const data = await fetch(...);
} catch (error) {
  // Sometimes toast, sometimes console, sometimes nothing
}
```

### 3. No Centralized Authentication

```tsx
// ❌ WRONG: Manual token handling
const token = await auth.currentUser?.getIdToken();
fetch(..., { headers: { Authorization: `Bearer ${token}` } })
```

### 4. Type Inconsistency

```tsx
// ❌ WRONG: Different response shapes
// Sometimes { data: ... }, sometimes { success, data }, sometimes just data
```

### 5. Direct Firestore Calls in UI

```tsx
// ❌ WRONG: UI accessing database directly
const db = getFirestore();
const products = await db.collection("products").get();
```

---

## 🏗️ Architecture Design

### Layer Structure

```
┌─────────────────────────────────────────┐
│           UI Components/Pages           │
│  (React, Next.js pages, components)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Custom Hooks (Optional)         │
│    (useProducts, useOrders, etc.)       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          API Service Layer              │
│  (ProductsAPI, OrdersAPI, etc.)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          API Client (Axios)             │
│  (Auth, Retry, Cache, Interceptors)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Backend API Routes              │
│     (Next.js API routes /api/*)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Controllers Layer               │
│  (Business logic, validation)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Models Layer                   │
│  (Data transformation, queries)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Firebase Firestore Database        │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts                    # ✅ Existing - Enhanced
│   │   ├── services/
│   │   │   ├── index.ts                 # 🆕 Service exports
│   │   │   ├── products.service.ts      # 🆕 Products API
│   │   │   ├── orders.service.ts        # 🆕 Orders API
│   │   │   ├── users.service.ts         # 🆕 Users API
│   │   │   ├── categories.service.ts    # ✅ Existing - Enhanced
│   │   │   └── reviews.service.ts       # 🆕 Reviews API
│   │   ├── models/
│   │   │   ├── product.model.ts         # 🆕 Product types & transforms
│   │   │   ├── order.model.ts           # 🆕 Order types & transforms
│   │   │   ├── user.model.ts            # 🆕 User types & transforms
│   │   │   ├── category.model.ts        # 🆕 Category types & transforms
│   │   │   └── review.model.ts          # 🆕 Review types & transforms
│   │   ├── responses/
│   │   │   ├── index.ts                 # 🆕 Response types
│   │   │   ├── product.response.ts      # 🆕 Product responses
│   │   │   ├── order.response.ts        # 🆕 Order responses
│   │   │   ├── user.response.ts         # 🆕 User responses
│   │   │   ├── category.response.ts     # 🆕 Category responses
│   │   │   └── review.response.ts       # 🆕 Review responses
│   │   └── constants/
│   │       └── endpoints.ts             # 🆕 All API endpoints
│   └── backend/
│       ├── controllers/
│       │   ├── products.controller.ts   # 🆕 Product business logic
│       │   ├── orders.controller.ts     # 🆕 Order business logic
│       │   ├── users.controller.ts      # 🆕 User business logic
│       │   ├── categories.controller.ts # 🆕 Category business logic
│       │   └── reviews.controller.ts    # 🆕 Review business logic
│       ├── models/
│       │   ├── products.model.ts        # 🆕 Product DB operations
│       │   ├── orders.model.ts          # 🆕 Order DB operations
│       │   ├── users.model.ts           # 🆕 User DB operations
│       │   ├── categories.model.ts      # 🆕 Category DB operations
│       │   └── reviews.model.ts         # 🆕 Review DB operations
│       └── validators/
│           ├── product.validator.ts     # 🆕 Product validation schemas
│           ├── order.validator.ts       # 🆕 Order validation schemas
│           ├── user.validator.ts        # 🆕 User validation schemas
│           ├── category.validator.ts    # ✅ Existing - Enhanced
│           └── review.validator.ts      # 🆕 Review validation schemas
├── hooks/
│   ├── useProducts.ts                   # 🆕 Product data hook
│   ├── useOrders.ts                     # 🆕 Order data hook
│   ├── useCategories.ts                 # 🆕 Category data hook
│   └── useReviews.ts                    # 🆕 Review data hook
└── app/
    └── api/
        ├── products/
        │   ├── route.ts                 # ✅ Refactored
        │   ├── [slug]/route.ts          # ✅ Refactored
        │   └── stats/route.ts           # 🆕
        ├── orders/
        │   ├── route.ts                 # ✅ Refactored
        │   ├── [id]/route.ts            # ✅ Refactored
        │   └── create/route.ts          # ✅ Refactored
        ├── users/
        │   ├── route.ts                 # 🆕
        │   ├── [id]/route.ts            # 🆕
        │   └── profile/route.ts         # ✅ Refactored
        ├── categories/
        │   ├── route.ts                 # ✅ Existing
        │   └── [slug]/route.ts          # ✅ Existing
        └── reviews/
            ├── route.ts                 # 🆕
            ├── [id]/route.ts            # 🆕
            └── product/[productId]/route.ts # 🆕
```

---

## 🔧 Implementation Plan

### Phase 1: Foundation (Day 1)

#### 1.1 Enhanced API Client

- ✅ Already exists: `src/lib/api/client.ts`
- Enhancements needed:
  - Add request/response logging
  - Improve error handling
  - Add retry policies

#### 1.2 Create Base Models

```typescript
// src/lib/api/models/base.model.ts
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
```

#### 1.3 Create Response Types

```typescript
// src/lib/api/responses/index.ts
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>; // Validation errors
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
```

#### 1.4 Create Endpoint Constants

```typescript
// src/lib/api/constants/endpoints.ts
export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: "/api/products",
    GET: (slug: string) => `/api/products/${slug}`,
    CREATE: "/api/admin/products",
    UPDATE: (id: string) => `/api/admin/products/${id}`,
    DELETE: (id: string) => `/api/admin/products/${id}`,
    STATS: "/api/admin/products/stats",
  },
  ORDERS: {
    LIST: "/api/orders",
    GET: (id: string) => `/api/orders/${id}`,
    CREATE: "/api/orders/create",
    UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
  },
  USERS: {
    PROFILE: "/api/user/profile",
    UPDATE: "/api/user/profile",
    ADDRESSES: "/api/user/addresses",
    ADD_ADDRESS: "/api/user/addresses",
    UPDATE_ADDRESS: (id: string) => `/api/user/addresses/${id}`,
    DELETE_ADDRESS: (id: string) => `/api/user/addresses/${id}`,
  },
  CATEGORIES: {
    LIST: "/api/categories",
    GET: (slug: string) => `/api/categories/${slug}`,
    CREATE: "/api/admin/categories",
    UPDATE: (id: string) => `/api/admin/categories/${id}`,
    DELETE: (id: string) => `/api/admin/categories/${id}`,
  },
  REVIEWS: {
    LIST: "/api/reviews",
    GET: (id: string) => `/api/reviews/${id}`,
    CREATE: "/api/reviews",
    BY_PRODUCT: (productId: string) => `/api/reviews/product/${productId}`,
    UPDATE: (id: string) => `/api/reviews/${id}`,
    DELETE: (id: string) => `/api/reviews/${id}`,
  },
} as const;
```

---

### Phase 2: Backend Layer (Day 1-2)

#### 2.1 Create Validators

```typescript
// src/lib/backend/validators/product.validator.ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  categoryId: z.string(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string(),
      })
    )
    .min(1),
  // ... more fields
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
```

#### 2.2 Create Models (Database Layer)

```typescript
// src/lib/backend/models/products.model.ts
import { getAdminDb } from "@/lib/database/admin";
import type { Product } from "@/types";

export class ProductsModel {
  private db = getAdminDb();
  private collection = "products";

  async findAll(filters: ProductFilters): Promise<Product[]> {
    let query = this.db.collection(this.collection);

    // Apply filters
    if (filters.category) {
      query = query.where("categoryId", "==", filters.category);
    }
    if (filters.inStock) {
      query = query.where("quantity", ">", 0);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const snapshot = await this.db
      .collection(this.collection)
      .where("slug", "==", slug)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const docRef = await this.db.collection(this.collection).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.db
      .collection(this.collection)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      });

    const doc = await this.db.collection(this.collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as Product;
  }

  async delete(id: string): Promise<void> {
    await this.db.collection(this.collection).doc(id).delete();
  }
}
```

#### 2.3 Create Controllers (Business Logic)

```typescript
// src/lib/backend/controllers/products.controller.ts
import { ProductsModel } from "../models/products.model";
import {
  productFiltersSchema,
  createProductSchema,
} from "../validators/product.validator";
import type { Product } from "@/types";

export class ProductsController {
  private model = new ProductsModel();

  async list(params: unknown) {
    // Validate input
    const filters = productFiltersSchema.parse(params);

    // Get data
    const products = await this.model.findAll(filters);

    // Apply additional filters (in-memory)
    let filtered = products;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
      hasMore: end < filtered.length,
    };
  }

  async getBySlug(slug: string) {
    const product = await this.model.findBySlug(slug);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async create(data: unknown, userId: string) {
    // Validate
    const validated = createProductSchema.parse(data);

    // Check for duplicate slug
    const existing = await this.model.findBySlug(validated.slug);
    if (existing) {
      throw new Error("Product with this slug already exists");
    }

    // Create
    return await this.model.create({
      ...validated,
      sellerId: userId,
      status: "draft",
    });
  }

  async update(id: string, data: unknown, userId: string) {
    // Validate
    const validated = updateProductSchema.parse(data);

    // Check ownership
    const product = await this.model.findById(id);
    if (product.sellerId !== userId) {
      throw new Error("Unauthorized");
    }

    // Update
    return await this.model.update(id, validated);
  }

  async delete(id: string, userId: string, userRole: string) {
    const product = await this.model.findById(id);

    // Check permission
    if (userRole !== "admin" && product.sellerId !== userId) {
      throw new Error("Unauthorized");
    }

    await this.model.delete(id);
  }
}
```

---

### Phase 3: API Routes Refactoring (Day 2-3)

#### 3.1 Refactor Product Routes

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ProductsController } from "@/lib/backend/controllers/products.controller";
import { createApiHandler, successResponse, errorResponse } from "@/lib/api";

const controller = new ProductsController();

/**
 * GET /api/products
 * List products with filtering and pagination
 */
export const GET = createApiHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const params = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    inStock: searchParams.get("inStock") === "true",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
  };

  const result = await controller.list(params);
  return successResponse(result);
});
```

---

### Phase 4: Frontend Services (Day 3-4)

#### 4.1 Create Product Service

```typescript
// src/lib/api/services/products.service.ts
import { apiClient } from "../client";
import { API_ENDPOINTS } from "../constants/endpoints";
import type { Product, ProductFilters, PaginatedResult } from "@/types";

export class ProductsService {
  /**
   * Get list of products with filters
   */
  async list(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.minPrice)
      params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.inStock) params.append("inStock", "true");
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.pageSize) params.append("limit", filters.pageSize.toString());

    return apiClient.get<PaginatedResult<Product>>(
      `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
    );
  }

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<Product> {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.GET(slug));
  }

  /**
   * Create new product (admin/seller only)
   */
  async create(data: Partial<Product>): Promise<Product> {
    return apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, data);
  }

  /**
   * Update product (admin/seller only)
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    return apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
  }

  /**
   * Delete product (admin/seller only)
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  /**
   * Get product statistics (admin only)
   */
  async getStats(): Promise<ProductStats> {
    return apiClient.get<ProductStats>(API_ENDPOINTS.PRODUCTS.STATS);
  }
}

// Export singleton instance
export const productsService = new ProductsService();
```

#### 4.2 Create Custom Hooks

```typescript
// src/hooks/useProducts.ts
import { useState, useEffect } from "react";
import { productsService } from "@/lib/api/services";
import type { Product, ProductFilters, PaginatedResult } from "@/types";

export function useProducts(filters?: ProductFilters) {
  const [data, setData] = useState<PaginatedResult<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productsService.list(filters);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  return {
    products: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    hasMore: data?.hasMore || false,
    loading,
    error,
    refetch: fetchProducts,
  };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsService.getBySlug(slug);
        setProduct(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  return { product, loading, error };
}
```

---

### Phase 5: Testing (Day 4-5)

#### 5.1 API Route Tests

```typescript
// src/app/api/products/__tests__/route.test.ts
import { GET } from "../route";
import { NextRequest } from "next/server";

describe("GET /api/products", () => {
  it("should return paginated products", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?page=1&limit=20"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("items");
    expect(data.data).toHaveProperty("total");
    expect(data.data).toHaveProperty("page");
  });

  it("should filter by category", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?category=electronics"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(
      data.data.items.every((p: any) => p.categoryId === "electronics")
    ).toBe(true);
  });

  it("should filter by price range", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/products?minPrice=100&maxPrice=1000"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(
      data.data.items.every((p: any) => p.price >= 100 && p.price <= 1000)
    ).toBe(true);
  });
});
```

#### 5.2 Service Tests

```typescript
// src/lib/api/services/__tests__/products.service.test.ts
import { productsService } from "../products.service";

describe("ProductsService", () => {
  it("should fetch products", async () => {
    const result = await productsService.list();
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("should fetch product by slug", async () => {
    const product = await productsService.getBySlug("test-product");
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
  });
});
```

---

## 📚 API Endpoints Documentation

### Products API

| Endpoint                    | Method | Auth         | Description                |
| --------------------------- | ------ | ------------ | -------------------------- |
| `/api/products`             | GET    | No           | List products with filters |
| `/api/products/[slug]`      | GET    | No           | Get product by slug        |
| `/api/admin/products`       | POST   | Admin/Seller | Create product             |
| `/api/admin/products/[id]`  | PATCH  | Admin/Seller | Update product             |
| `/api/admin/products/[id]`  | DELETE | Admin/Seller | Delete product             |
| `/api/admin/products/stats` | GET    | Admin        | Get product statistics     |

### Orders API

| Endpoint                        | Method | Auth  | Description         |
| ------------------------------- | ------ | ----- | ------------------- |
| `/api/orders`                   | GET    | User  | List user's orders  |
| `/api/orders/[id]`              | GET    | User  | Get order details   |
| `/api/orders/create`            | POST   | User  | Create new order    |
| `/api/orders/[id]/cancel`       | POST   | User  | Cancel order        |
| `/api/admin/orders`             | GET    | Admin | List all orders     |
| `/api/admin/orders/[id]/status` | PATCH  | Admin | Update order status |

### Users API

| Endpoint                   | Method | Auth | Description      |
| -------------------------- | ------ | ---- | ---------------- |
| `/api/user/profile`        | GET    | User | Get user profile |
| `/api/user/profile`        | PATCH  | User | Update profile   |
| `/api/user/addresses`      | GET    | User | List addresses   |
| `/api/user/addresses`      | POST   | User | Add address      |
| `/api/user/addresses/[id]` | PATCH  | User | Update address   |
| `/api/user/addresses/[id]` | DELETE | User | Delete address   |

### Categories API

| Endpoint                     | Method | Auth  | Description          |
| ---------------------------- | ------ | ----- | -------------------- |
| `/api/categories`            | GET    | No    | List categories      |
| `/api/categories/[slug]`     | GET    | No    | Get category by slug |
| `/api/admin/categories`      | POST   | Admin | Create category      |
| `/api/admin/categories/[id]` | PATCH  | Admin | Update category      |
| `/api/admin/categories/[id]` | DELETE | Admin | Delete category      |

### Reviews API

| Endpoint                           | Method | Auth       | Description         |
| ---------------------------------- | ------ | ---------- | ------------------- |
| `/api/reviews`                     | GET    | No         | List reviews        |
| `/api/reviews/product/[productId]` | GET    | No         | Get product reviews |
| `/api/reviews`                     | POST   | User       | Create review       |
| `/api/reviews/[id]`                | PATCH  | User       | Update review       |
| `/api/reviews/[id]`                | DELETE | User/Admin | Delete review       |
| `/api/admin/reviews`               | GET    | Admin      | List all reviews    |
| `/api/admin/reviews/[id]/approve`  | POST   | Admin      | Approve review      |
| `/api/admin/reviews/[id]/reject`   | POST   | Admin      | Reject review       |

---

## 🧪 Testing Strategy

### Unit Tests

- All validators (Zod schemas)
- All models (database operations)
- All controllers (business logic)
- All services (API client methods)

### Integration Tests

- API routes end-to-end
- Authentication flows
- Error handling
- Validation errors

### Test Coverage Goals

- Controllers: 90%+
- Models: 85%+
- Services: 85%+
- API Routes: 80%+

---

## 🔄 Migration Guide

### For Developers

#### Before (❌ Old Way)

```tsx
// Direct fetch in component
const response = await fetch("/api/products");
const data = await response.json();
setProducts(data.products);
```

#### After (✅ New Way)

```tsx
// Using service
import { useProducts } from "@/hooks/useProducts";

const { products, loading, error } = useProducts({ category: "electronics" });
```

### Migration Checklist

- [ ] Replace all `fetch()` calls with service methods
- [ ] Remove direct Firestore imports from UI
- [ ] Use custom hooks for data fetching
- [ ] Update error handling to use service errors
- [ ] Add proper TypeScript types
- [ ] Test all changed components
- [ ] Update documentation

---

## 📋 Implementation Checklist

### Day 1

- [ ] Create base models and types
- [ ] Create response types
- [ ] Create endpoint constants
- [ ] Create validators for all collections
- [ ] Create database models for all collections

### Day 2

- [ ] Create controllers for all collections
- [ ] Refactor API routes to use controllers
- [ ] Add comprehensive error handling
- [ ] Add request validation

### Day 3

- [ ] Create frontend services
- [ ] Create custom hooks
- [ ] Test services and hooks
- [ ] Document all changes

### Day 4

- [ ] Write unit tests for backend
- [ ] Write integration tests for APIs
- [ ] Write tests for services
- [ ] Test coverage report

### Day 5

- [ ] Migrate existing components
- [ ] Remove direct Firestore calls
- [ ] Update all pages to use services
- [ ] Final testing and documentation

---

## ✅ Success Criteria

1. **Zero direct Firestore calls in UI components**
2. **All API calls go through service layer**
3. **90%+ test coverage on backend**
4. **All validators in place with proper error messages**
5. **Full TypeScript type safety**
6. **Comprehensive API documentation**
7. **All existing functionality preserved**
8. **Performance maintained or improved**

---

_Document Created: November 3, 2025_  
_Status: Ready for Implementation_
