# Development Guide - JustForView.in

**Last Updated**: November 18, 2025

This guide covers coding standards, development patterns, and best practices for the JustForView.in platform.

---

## 📋 Table of Contents

- [Coding Standards](#coding-standards)
- [TypeScript Guidelines](#typescript-guidelines)
- [Component Development](#component-development)
- [API Development](#api-development)
- [State Management](#state-management)
- [File Upload Patterns](#file-upload-patterns)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Performance](#performance)

---

## 🎯 Coding Standards

### File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Page routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific
│   ├── seller/           # Seller-specific
│   ├── common/           # Shared components
│   └── layout/           # Layout components
├── services/              # Service layer
├── lib/                   # Utility libraries
├── hooks/                 # Custom hooks
├── contexts/              # React contexts
├── types/                 # TypeScript types
└── constants/             # App constants
```

### Naming Conventions

**Files:**

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Services: `kebab-case.service.ts` (e.g., `products.service.ts`)
- Utilities: `kebab-case.ts` (e.g., `date-utils.ts`)
- Constants: `UPPER_CASE.ts` (e.g., `API_ROUTES.ts`)

**Variables & Functions:**

- Variables: `camelCase` (e.g., `productList`)
- Functions: `camelCase` (e.g., `fetchProducts()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_UPLOAD_SIZE`)
- Types/Interfaces: `PascalCase` (e.g., `ProductType`)

**Components:**

- React Components: `PascalCase`
- Props interfaces: `ComponentNameProps`

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  // Component implementation
}
```

---

## 📘 TypeScript Guidelines

### Strict Mode

Always use TypeScript strict mode. No `any` types except for:

- External library integrations (where types are unavailable)
- Dynamic third-party data (with runtime validation)

```typescript
// ❌ WRONG: Using any
const data: any = await fetch("/api/products");

// ✅ CORRECT: Proper typing
interface ProductResponse {
  products: Product[];
  total: number;
}
const data: ProductResponse = await productsService.getProducts();
```

### Type Definitions

**Location**: `src/types/`

**Organization:**

```
src/types/
├── index.ts           # Export all types
├── product.ts         # Product types
├── auction.ts         # Auction types
├── order.ts           # Order types
└── ...
```

**Type vs Interface:**

- Use `interface` for object shapes (extendable)
- Use `type` for unions, intersections, utility types

```typescript
// Interface for objects
interface Product {
  id: string;
  name: string;
  price: number;
}

// Type for unions
type ProductStatus = "draft" | "published" | "archived";

// Type for intersections
type PublishedProduct = Product & { status: "published" };
```

### Utility Types

Use TypeScript utility types:

- `Partial<T>` - Make all properties optional
- `Required<T>` - Make all properties required
- `Pick<T, K>` - Select specific properties
- `Omit<T, K>` - Exclude specific properties
- `Record<K, T>` - Object with specific key/value types

```typescript
// Creating a product (not all fields required)
type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

// Updating a product (all fields optional)
type ProductUpdate = Partial<ProductInput>;

// Product filters
type ProductFilters = Pick<Product, "status" | "categoryId" | "shopId">;
```

---

## 🧩 Component Development

### Server vs Client Components

**Default to Server Components** (no `"use client"` directive)

**Use Server Components for:**

- Data fetching
- Static content
- Reading cookies/headers
- Direct database access

```typescript
// Server Component (default)
export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Direct service call (runs on server)
  const product = await productsService.getById(params.id);

  return <ProductDisplay product={product} />;
}
```

**Use Client Components when you need:**

- Event handlers (onClick, onChange, etc.)
- State hooks (useState, useReducer)
- Effect hooks (useEffect, useLayoutEffect)
- Browser APIs (localStorage, window, document)
- Context (useContext)

```typescript
"use client";

import { useState } from "react";

export default function AddToCartButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await cartService.add(product.id);
    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

### Component Patterns

**1. Composition Pattern**

Break down complex components into smaller, reusable pieces:

```typescript
// ProductCard.tsx
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      <ProductImage images={product.images} />
      <ProductInfo product={product} />
      <ProductActions product={product} />
    </div>
  );
}

// ProductImage.tsx
function ProductImage({ images }: { images: string[] }) {
  return <img src={images[0]} alt="" />;
}

// ProductInfo.tsx
function ProductInfo({ product }: { product: Product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
    </div>
  );
}
```

**2. Render Props Pattern**

For flexible, reusable components:

```typescript
interface DataLoaderProps<T> {
  fetch: () => Promise<T>;
  render: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataLoader<T>({ fetch, render }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return <>{render(data!, loading, error)}</>;
}

// Usage
<DataLoader
  fetch={() => productsService.getProducts()}
  render={(products, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error.message} />;
    return <ProductList products={products} />;
  }}
/>;
```

**3. Custom Hooks Pattern**

Extract reusable logic:

```typescript
// hooks/useProducts.ts
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsService.getProducts(filters);
        setProducts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
}

// Usage in component
function ProductList() {
  const { products, loading, error } = useProducts({ status: "published" });

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 🔌 API Development

### Service Layer (MANDATORY)

**NEVER call APIs directly from components. ALWAYS use the service layer.**

```typescript
// ❌ WRONG: Direct API call
const response = await fetch("/api/products");
const products = await response.json();

// ❌ WRONG: Direct apiService
const products = await apiService.get("/api/products");

// ✅ CORRECT: Service layer
const products = await productsService.getProducts();
```

### Creating a Service

**Pattern:**

```typescript
// src/services/feature.service.ts
import { apiService } from "./api.service";
import { Feature, FeatureFilters } from "@/types/feature";

class FeatureService {
  private readonly BASE_PATH = "/api/features";

  async getAll(filters?: FeatureFilters): Promise<Feature[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);

    const url = params.toString()
      ? `${this.BASE_PATH}?${params}`
      : this.BASE_PATH;

    const response = await apiService.get<{ features: Feature[] }>(url);
    return response.features;
  }

  async getById(id: string): Promise<Feature> {
    const response = await apiService.get<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.feature;
  }

  async create(data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.post<{ feature: Feature }>(
      this.BASE_PATH,
      data
    );
    return response.feature;
  }

  async update(id: string, data: Partial<Feature>): Promise<Feature> {
    const response = await apiService.patch<{ feature: Feature }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.feature;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const featureService = new FeatureService();
```

### API Route Pattern

**Location**: `src/app/api/[endpoint]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

// GET /api/features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const db = getFirestoreAdmin();
    let query = db.collection("features");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const features = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// POST /api/features
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const docRef = await db.collection("features").add({
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    const feature = { id: doc.id, ...doc.data() };

    return NextResponse.json({ feature }, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 State Management

### 1. Local State (useState)

For component-specific state:

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 2. Context API

For global/shared state:

```typescript
// contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Usage
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
}
```

### 3. Custom Hooks

For feature-specific state:

```typescript
// hooks/useCart.ts
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addItem = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      await cartService.add(productId, quantity);
      // Refresh cart
      const cart = await cartService.get();
      setItems(cart.items);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(true);
    try {
      await cartService.remove(itemId);
      setItems(items.filter((item) => item.id !== itemId));
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { items, loading, addItem, removeItem, total };
}
```

---

## 📁 File Upload Patterns

### Using mediaService

**CRITICAL**: All file uploads must go through `mediaService.upload()`.

```typescript
"use client";

import { useState } from "react";
import { mediaService } from "@/services/media.service";

export default function ProductForm() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const key = `image-${index}`;
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

        // Upload to Firebase Storage
        const result = await mediaService.upload({
          file,
          context: "product",
        });

        setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
        return result.url; // URL to store in database
      });

      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative">
            <img src={url} alt={`Product ${index + 1}`} />
            <button
              onClick={() => setImages(images.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🛡️ Error Handling

### Try-Catch in Services

All service methods should handle errors:

```typescript
async getProducts(): Promise<Product[]> {
  try {
    const response = await apiService.get<{ products: Product[] }>('/api/products');
    return response.products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('Unable to load products. Please try again.');
  }
}
```

### Error Boundaries

For React component errors:

```typescript
// components/ErrorBoundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div>
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## ✅ Testing

### Manual Testing

Use test workflows in `src/lib/test-workflows/`:

```bash
# Run all workflows
npm run test:workflows:all

# Run specific workflow
npm run test:workflow:1
```

### Type Checking

```bash
# Check TypeScript
npm run type-check

# Build (includes type checking)
npm run build
```

---

## ⚡ Performance

### Optimization Tips

**1. Use Server Components** for non-interactive content

**2. Code Splitting** with dynamic imports:

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Spinner />,
});
```

**3. Image Optimization** with Next.js Image:

```typescript
import Image from "next/image";

<Image
  src="/product.jpg"
  width={400}
  height={300}
  alt="Product"
  priority // For above-the-fold images
/>;
```

**4. Memoization** for expensive computations:

```typescript
import { useMemo } from "react";

const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);
```

---

## 📚 Additional Resources

- [Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)
- [Service Layer Guide](../architecture/SERVICE-LAYER-GUIDE.md)
- [Component Patterns](../architecture/COMPONENT-PATTERNS.md)
- [Common Issues](../guides/COMMON-ISSUES.md)

---

**Last Updated**: November 18, 2025
