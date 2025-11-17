# Service Layer Guide - JustForView.in

**Last Updated**: November 17, 2025  
**Version**: 1.1  
**Audience**: AI Agents, New Developers  
**Repository**: https://github.com/mohasinac/justforview.in

---

## Table of Contents

1. [Service Layer Overview](#service-layer-overview)
2. [Available Services](#available-services)
3. [Using Services](#using-services)
4. [Creating New Services](#creating-new-services)
5. [Service Patterns](#service-patterns)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Service Layer Overview

### What is the Service Layer?

The service layer is a **centralized API abstraction** that sits between your React components and the backend API routes. It provides:

- **Type-safe** API calls with TypeScript
- **Consistent error handling** across all requests
- **Automatic authentication** (adds token to headers)
- **Request/response transformations**
- **Single source of truth** for all API operations

### The Golden Rule

**NEVER call APIs directly from components, pages, or hooks.**

```typescript
// ❌ WRONG - Direct fetch call
fetch("/api/products")
  .then((res) => res.json())
  .then((data) => setProducts(data));

// ❌ WRONG - Direct apiService call
import { apiService } from "@/services/api.service";
apiService.get("/api/products").then(setProducts);

// ✅ CORRECT - Use service layer
import { productService } from "@/services/products.service";
productService.getProducts().then(setProducts);
```

---

## Available Services

### Core Business Services

| Service           | File                    | Purpose                      |
| ----------------- | ----------------------- | ---------------------------- |
| `authService`     | `auth.service.ts`       | Authentication & sessions    |
| `productService`  | `products.service.ts`   | Product CRUD & search        |
| `auctionService`  | `auctions.service.ts`   | Auction management & bidding |
| `categoryService` | `categories.service.ts` | Category hierarchy           |
| `shopService`     | `shops.service.ts`      | Shop/vendor management       |
| `cartService`     | `cart.service.ts`       | Shopping cart operations     |
| `orderService`    | `orders.service.ts`     | Order processing             |
| `reviewService`   | `reviews.service.ts`    | Product reviews & ratings    |
| `userService`     | `users.service.ts`      | User profile management      |
| `addressService`  | `address.service.ts`    | User addresses               |

### Marketing & Promotions

| Service            | File                     | Purpose                |
| ------------------ | ------------------------ | ---------------------- |
| `couponService`    | `coupons.service.ts`     | Discount codes         |
| `heroSlideService` | `hero-slides.service.ts` | Homepage hero carousel |
| `homepageService`  | `homepage.service.ts`    | Homepage configuration |
| `blogService`      | `blog.service.ts`        | Blog post management   |

### Support & Operations

| Service          | File                 | Purpose         |
| ---------------- | -------------------- | --------------- |
| `supportService` | `support.service.ts` | Support tickets |
| `returnService`  | `returns.service.ts` | Return requests |
| `payoutService`  | `payouts.service.ts` | Seller payouts  |

### Utilities

| Service            | File                   | Purpose                       |
| ------------------ | ---------------------- | ----------------------------- |
| `mediaService`     | `media.service.ts`     | File uploads (images, videos) |
| `searchService`    | `search.service.ts`    | Global search                 |
| `analyticsService` | `analytics.service.ts` | Analytics & insights          |
| `testDataService`  | `test-data.service.ts` | Test data generation (admin)  |
| `favoritesService` | `favorites.service.ts` | User wishlist                 |
| `checkoutService`  | `checkout.service.ts`  | Checkout process              |

### Base Service

| Service      | File             | Purpose                                |
| ------------ | ---------------- | -------------------------------------- |
| `apiService` | `api.service.ts` | Base HTTP client (DO NOT USE DIRECTLY) |

---

## Using Services

### 1. In Server Components (Async)

Server Components can use `async/await` directly:

```typescript
// app/products/page.tsx
import { productService } from "@/services/products.service";

export default async function ProductsPage() {
  // Direct async call (server-side)
  const products = await productService.getProducts({
    status: "published",
    limit: 20,
  });

  return (
    <div>
      <h1>Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

### 2. In Client Components (useState + useEffect)

Client Components need state management:

```typescript
"use client";
import { useState, useEffect } from "react";
import { productService } from "@/services/products.service";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <ProductGrid products={products} />;
}
```

### 3. In Custom Hooks (Best Practice)

Extract data fetching logic into custom hooks:

```typescript
// hooks/useProducts.ts
import { useState, useEffect } from "react";
import { productService } from "@/services/products.service";

export function useProducts(filters?: any) {
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

// Usage in component
("use client");
export default function ProductList() {
  const { products, loading, error } = useProducts({ status: "published" });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <ProductGrid products={products} />;
}
```

### 4. In Event Handlers (User Actions)

For interactive actions like button clicks:

```typescript
"use client";
import { cartService } from "@/services/cart.service";
import { toast } from "sonner";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await cartService.addItem(productId, 1);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

---

## Creating New Services

### Step 1: Define TypeScript Types

```typescript
// types/feature.ts
export interface Feature {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFilters {
  status?: "active" | "inactive";
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateFeatureRequest {
  name: string;
  description: string;
  isActive?: boolean;
}
```

### Step 2: Add API Routes to Constants

```typescript
// constants/api-routes.ts
export const FEATURE_ROUTES = {
  LIST: "/features",
  BY_ID: (id: string) => `/features/${id}`,
  CREATE: "/features",
  UPDATE: (id: string) => `/features/${id}`,
  DELETE: (id: string) => `/features/${id}`,
} as const;
```

### Step 3: Create Service Class

```typescript
// services/feature.service.ts
import { apiService } from "./api.service";
import { Feature, FeatureFilters, CreateFeatureRequest } from "@/types/feature";
import { FEATURE_ROUTES } from "@/constants/api-routes";

class FeatureService {
  /**
   * Get all features with optional filters
   */
  async getFeatures(filters?: FeatureFilters): Promise<Feature[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", filters.page.toString());
    if (filters?.limit) params.set("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${FEATURE_ROUTES.LIST}?${queryString}`
      : FEATURE_ROUTES.LIST;

    const response = await apiService.get<{ features: Feature[] }>(url);
    return response.features;
  }

  /**
   * Get single feature by ID
   */
  async getFeature(id: string): Promise<Feature> {
    const response = await apiService.get<{ feature: Feature }>(
      FEATURE_ROUTES.BY_ID(id)
    );
    return response.feature;
  }

  /**
   * Create new feature
   */
  async createFeature(data: CreateFeatureRequest): Promise<Feature> {
    const response = await apiService.post<{ feature: Feature }>(
      FEATURE_ROUTES.CREATE,
      data
    );
    return response.feature;
  }

  /**
   * Update existing feature
   */
  async updateFeature(id: string, data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.patch<{ feature: Feature }>(
      FEATURE_ROUTES.UPDATE(id),
      data
    );
    return response.feature;
  }

  /**
   * Delete feature
   */
  async deleteFeature(id: string): Promise<void> {
    await apiService.delete(FEATURE_ROUTES.DELETE(id));
  }

  /**
   * Bulk operations (if needed)
   */
  async bulkUpdate(ids: string[], updates: Partial<Feature>): Promise<void> {
    await apiService.post("/features/bulk", { ids, updates });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.delete("/features/bulk", { data: { ids } });
  }
}

// Export singleton instance
export const featureService = new FeatureService();
```

### Step 4: Create API Route

```typescript
// app/api/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = getFirestoreAdmin();
    let query = db.collection("features");

    if (status) {
      query = query.where("isActive", "==", status === "active");
    }

    const snapshot = await query.get();
    const features = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ features });
  } catch (error: any) {
    console.error("Error fetching features:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const db = getFirestoreAdmin();
    const docRef = await db.collection("features").add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const feature = { id: doc.id, ...doc.data() };

    return NextResponse.json({ feature });
  } catch (error: any) {
    console.error("Error creating feature:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 5: Export from Index

```typescript
// services/index.ts
export { featureService } from "./feature.service";
// ... other exports
```

---

## Service Patterns

### Pattern 1: Simple CRUD Service

```typescript
class SimpleCrudService {
  private readonly BASE_PATH = "/api/resources";

  async getAll(): Promise<Resource[]> {
    const response = await apiService.get<{ resources: Resource[] }>(
      this.BASE_PATH
    );
    return response.resources;
  }

  async getById(id: string): Promise<Resource> {
    const response = await apiService.get<{ resource: Resource }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.resource;
  }

  async create(data: CreateResourceRequest): Promise<Resource> {
    const response = await apiService.post<{ resource: Resource }>(
      this.BASE_PATH,
      data
    );
    return response.resource;
  }

  async update(id: string, data: Partial<Resource>): Promise<Resource> {
    const response = await apiService.patch<{ resource: Resource }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.resource;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}
```

### Pattern 2: Service with Filters

```typescript
class FilterableService {
  async getResources(filters?: ResourceFilters): Promise<Resource[]> {
    const params = new URLSearchParams();

    // Add all filter parameters
    if (filters?.status) params.set("status", filters.status);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.minPrice) params.set("min_price", filters.minPrice.toString());
    if (filters?.maxPrice) params.set("max_price", filters.maxPrice.toString());
    if (filters?.search) params.set("search", filters.search);
    if (filters?.sort) params.set("sort", filters.sort);
    if (filters?.page) params.set("page", filters.page.toString());
    if (filters?.limit) params.set("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/resources?${queryString}` : "/resources";

    const response = await apiService.get<{ resources: Resource[] }>(url);
    return response.resources;
  }
}
```

### Pattern 3: Service with Nested Resources

```typescript
class NestedResourceService {
  async getComments(postId: string): Promise<Comment[]> {
    const response = await apiService.get<{ comments: Comment[] }>(
      `/posts/${postId}/comments`
    );
    return response.comments;
  }

  async createComment(
    postId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const response = await apiService.post<{ comment: Comment }>(
      `/posts/${postId}/comments`,
      data
    );
    return response.comment;
  }
}
```

### Pattern 4: Service with Bulk Operations

```typescript
class BulkOperationsService {
  async bulkUpdate(ids: string[], updates: Partial<Resource>): Promise<void> {
    await apiService.post("/resources/bulk", {
      ids,
      updates,
      action: "update",
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post("/resources/bulk", {
      ids,
      action: "delete",
    });
  }

  async bulkPublish(ids: string[]): Promise<void> {
    await apiService.post("/resources/bulk", {
      ids,
      updates: { status: "published" },
      action: "update",
    });
  }
}
```

### Pattern 5: Service with File Upload

```typescript
class MediaService {
  async uploadImage(file: File, folder: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await apiService.post<{ url: string }>(
      "/media/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response;
  }

  async uploadMultiple(
    files: File[],
    folder: string
  ): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("folder", folder);

    const response = await apiService.post<{ urls: string[] }>(
      "/media/upload-multiple",
      formData
    );

    return response;
  }
}
```

---

## Error Handling

### Service-Level Error Handling

The `apiService` base class handles all HTTP errors automatically:

```typescript
// apiService.get() internally does:
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return await response.json();
} catch (error) {
  console.error("API Error:", error);
  throw error;
}
```

### Component-Level Error Handling

Handle errors in your components:

```typescript
"use client";
export default function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      await myService.doSomething();
      toast.success("Success!");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      )}
      <button onClick={handleAction}>Do Something</button>
    </div>
  );
}
```

### Custom Error Types

Define custom error types for better error handling:

```typescript
// types/errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

// In service
async createResource(data: any): Promise<Resource> {
  if (!data.name) {
    throw new ValidationError('Name is required')
  }

  try {
    const response = await apiService.post('/resources', data)
    return response.resource
  } catch (error: any) {
    if (error.status === 401) {
      throw new UnauthorizedError()
    }
    throw error
  }
}

// In component
try {
  await resourceService.createResource(data)
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof UnauthorizedError) {
    // Redirect to login
  }
}
```

---

## Best Practices

### 1. Always Use Types

```typescript
// ✅ GOOD - Typed parameters and return value
async getProducts(filters?: ProductFilters): Promise<Product[]> {
  // ...
}

// ❌ BAD - No types
async getProducts(filters?: any): Promise<any> {
  // ...
}
```

### 2. Use Query Builders for Complex Filters

```typescript
// ✅ GOOD - Reusable query builder
private buildQueryParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  })

  return params
}

async getProducts(filters?: ProductFilters): Promise<Product[]> {
  const params = this.buildQueryParams(filters || {})
  const url = `/products?${params.toString()}`
  // ...
}
```

### 3. Add JSDoc Comments

````typescript
/**
 * Get all products with optional filtering and pagination
 *
 * @param filters - Optional filters (status, category, price range, etc.)
 * @returns Promise resolving to array of products
 * @throws {Error} If the request fails
 *
 * @example
 * ```typescript
 * const products = await productService.getProducts({
 *   status: 'published',
 *   category: 'electronics',
 *   minPrice: 1000,
 *   maxPrice: 10000,
 *   page: 1,
 *   limit: 20
 * })
 * ```
 */
async getProducts(filters?: ProductFilters): Promise<Product[]> {
  // ...
}
````

### 4. Handle Optional Parameters

```typescript
// ✅ GOOD - Default values and optional parameters
async getProducts(
  filters?: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ products: Product[]; total: number }> {
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('limit', limit.toString())

  // Add filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value))
    })
  }

  // ...
}
```

### 5. Return Consistent Data Structures

```typescript
// ✅ GOOD - Consistent return structure
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

async getProducts(page: number, limit: number): Promise<PaginatedResponse<Product>> {
  const response = await apiService.get(`/products?page=${page}&limit=${limit}`)
  return {
    items: response.products,
    total: response.total,
    page: response.page,
    limit: response.limit,
    hasMore: response.page * response.limit < response.total
  }
}
```

### 6. Cache Frequently Accessed Data

```typescript
class ProductService {
  private cache = new Map<string, { data: Product; timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getProduct(id: string): Promise<Product> {
    // Check cache
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Fetch from API
    const product = await apiService.get(`/products/${id}`);

    // Update cache
    this.cache.set(id, { data: product, timestamp: Date.now() });

    return product;
  }

  // Clear cache on update
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const product = await apiService.patch(`/products/${id}`, data);
    this.cache.delete(id); // Clear cached data
    return product;
  }
}
```

### 7. Add Loading States Support

```typescript
// Create a wrapper hook for loading states
export function useServiceCall<T>(serviceCall: () => Promise<T>): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await serviceCall();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, []);

  return { data, loading, error, refetch: execute };
}

// Usage
const {
  data: products,
  loading,
  error,
} = useServiceCall(() => productService.getProducts({ status: "published" }));
```

---

## Quick Reference

### Common Service Operations

```typescript
// Fetch list
const products = await productService.getProducts();

// Fetch with filters
const filteredProducts = await productService.getProducts({
  status: "published",
  category: "electronics",
  minPrice: 1000,
});

// Fetch single item
const product = await productService.getProduct(id);

// Create
const newProduct = await productService.createProduct(data);

// Update
const updatedProduct = await productService.updateProduct(id, updates);

// Delete
await productService.deleteProduct(id);

// Bulk operations
await productService.bulkUpdate([id1, id2], { status: "published" });
await productService.bulkDelete([id1, id2]);
```

### Service Method Naming Conventions

- `get{Resource}s()` - Get list of resources
- `get{Resource}(id)` - Get single resource by ID
- `get{Resource}BySlug(slug)` - Get resource by slug
- `create{Resource}(data)` - Create new resource
- `update{Resource}(id, data)` - Update existing resource
- `delete{Resource}(id)` - Delete resource
- `bulk{Action}(ids, data?)` - Bulk operations

---

**Next**: [Component Patterns Guide](./03-COMPONENT-PATTERNS.md)
