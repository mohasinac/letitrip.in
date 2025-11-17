# Component Patterns - JustForView.in

**Last Updated**: November 17, 2025  
**Version**: 1.1  
**Audience**: AI Agents, New Developers  
**Repository**: https://github.com/mohasinac/justforview.in

---

## Table of Contents

1. [Server vs Client Components](#server-vs-client-components)
2. [Component Organization](#component-organization)
3. [Common Component Patterns](#common-component-patterns)
4. [State Management](#state-management)
5. [Forms & Validation](#forms--validation)
6. [Data Tables](#data-tables)
7. [Best Practices](#best-practices)

---

## Server vs Client Components

### Server Components (Default)

**Use for**:

- Data fetching
- Static content
- SEO-critical pages
- Database queries
- Backend operations

```typescript
// app/products/[id]/page.tsx (Server Component - NO "use client")
import { productService } from "@/services/products.service";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Direct async/await - runs on server
  const product = await productService.getProduct(params.id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <ProductImages images={product.images} />
      <AddToCartButton productId={product.id} /> {/* Client Component */}
    </div>
  );
}
```

### Client Components

**Use for**:

- User interactions (clicks, form inputs)
- State management (useState, useContext)
- Browser APIs (window, localStorage)
- Event handlers
- Real-time updates

```typescript
// components/product/AddToCartButton.tsx (Client Component)
"use client"; // REQUIRED for client components

import { useState } from "react";
import { cartService } from "@/services/cart.service";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await cartService.addItem(productId, 1);
    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

### When to Use Which?

| Feature                     | Server Component | Client Component |
| --------------------------- | ---------------- | ---------------- |
| Data fetching (async/await) | ✅               | ❌               |
| useState, useEffect         | ❌               | ✅               |
| Event handlers              | ❌               | ✅               |
| Browser APIs                | ❌               | ✅               |
| Direct database access      | ✅               | ❌               |
| SEO optimization            | ✅               | ⚠️               |
| Smaller bundle size         | ✅               | ❌               |

---

## Component Organization

### File Structure

```
components/
├── admin/              # Admin dashboard components
│   ├── ProductCard.tsx
│   ├── UserTable.tsx
│   └── StatsWidget.tsx
├── seller/             # Seller dashboard components
│   ├── OrderList.tsx
│   └── RevenueChart.tsx
├── product/            # Product-related components
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductDetails.tsx
│   └── AddToCartButton.tsx
├── cart/               # Shopping cart components
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   └── CheckoutButton.tsx
├── auction/            # Auction components
│   ├── AuctionCard.tsx
│   ├── BidForm.tsx
│   └── BidHistory.tsx
├── common/             # Shared/reusable components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   ├── Pagination.tsx
│   └── DataTable.tsx
└── layout/             # Layout components
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

### Naming Conventions

- **PascalCase** for component files: `ProductCard.tsx`
- **Descriptive names**: `AddToCartButton.tsx` not `Button1.tsx`
- **Feature-grouped**: Group by feature, not by type
- **Index files**: Use for barrel exports

---

## Common Component Patterns

### Pattern 1: Card Component

Used for displaying resource items in lists (products, auctions, shops, etc.)

```typescript
// components/product/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { Button } from "@/components/common/Button";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  showActions?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  showActions = true,
}: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square mb-3">
          <Image
            src={product.images[0]?.url || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover rounded"
          />
        </div>
      </Link>

      {/* Content */}
      <Link href={`/products/${product.slug}`}>
        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
      </Link>

      <div className="flex items-center justify-between mt-2">
        <span className="text-2xl font-bold">
          ₹{product.price.toLocaleString()}
        </span>
        {product.compareAtPrice && (
          <span className="text-sm text-gray-500 line-through">
            ₹{product.compareAtPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mt-2">
        <span className="text-yellow-500">⭐</span>
        <span className="text-sm">{product.rating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({product.reviewCount})</span>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => onAddToCart?.(product.id)}
            className="w-full"
            variant="primary"
          >
            Add to Cart
          </Button>
        </div>
      )}

      {/* Status badges */}
      <div className="flex gap-2 mt-2">
        {product.featured && (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
            Featured
          </span>
        )}
        {product.stockCount === 0 && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}
```

### Pattern 2: Form Component with Validation

```typescript
// components/product/ProductForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productService } from "@/services/products.service";
import { toast } from "sonner";

// Validation schema
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  stockCount: z.number().int().nonnegative("Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      if (initialData?.id) {
        await productService.updateProduct(initialData.id, data);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(data);
        toast.success("Product created successfully");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Product Name</label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter product name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter product description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">Price (₹)</label>
        <input
          {...register("price", { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="w-full px-3 py-2 border rounded"
          placeholder="0.00"
        />
        {errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
        )}
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium mb-1">Stock Quantity</label>
        <input
          {...register("stockCount", { valueAsNumber: true })}
          type="number"
          className="w-full px-3 py-2 border rounded"
          placeholder="0"
        />
        {errors.stockCount && (
          <p className="text-red-500 text-sm mt-1">
            {errors.stockCount.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : initialData
          ? "Update Product"
          : "Create Product"}
      </button>
    </form>
  );
}
```

### Pattern 3: Modal Component

```typescript
// components/common/Modal.tsx
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Usage
export function ProductModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Product</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
```

### Pattern 4: Data Table Component

```typescript
// components/common/DataTable.tsx
"use client"

import { useState } from 'react'

interface Column<T> {
  key: string
  title: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  loading?: boolean
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  loading,
  onRowClick
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return

    if (sortBy === column.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column.key)
      setSortOrder('asc')
    }
  }

  const sortedData = sortBy
    ? [...data].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    : data

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-medium ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.title}
                  {column.sortable && sortBy === column.key && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr
              key={row[keyField]}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      )}
    </div>
  )
}

// Usage
const columns = [
  {
    key: 'name',
    title: 'Product Name',
    sortable: true
  },
  {
    key: 'price',
    title: 'Price',
    sortable: true,
    render: (value) => `₹${value.toLocaleString()}`
  },
  {
    key: 'stockCount',
    title: 'Stock',
    sortable: true,
    render: (value) => (
      <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
        {value}
      </span>
    )
  },
  {
    key: 'actions',
    title: 'Actions',
    render: (_, row) => (
      <button onClick={() => handleEdit(row)}>Edit</button>
    )
  }
]

<DataTable
  data={products}
  columns={columns}
  keyField="id"
  onRowClick={(product) => router.push(`/products/${product.id}`)}
/>
```

---

## State Management

### useState for Local State

```typescript
"use client";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### useContext for Global State

```typescript
// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authService
      .getSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Usage in components
("use client");
export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Forms & Validation

### Using react-hook-form + zod

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await authService.login(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register("password")} type="password" placeholder="Password" />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

---

## Best Practices

### 1. Component Composition

```typescript
// ✅ GOOD - Compose small components
<ProductCard>
  <ProductImage src={image} />
  <ProductInfo name={name} price={price} />
  <ProductActions onAddToCart={handleAdd} />
</ProductCard>

// ❌ BAD - One massive component
<ProductCard {...allProps} /> // 500 lines of code inside
```

### 2. Props Destructuring

```typescript
// ✅ GOOD - Destructure props
export function Button({ label, onClick, disabled }: ButtonProps) {
  // ...
}

// ❌ BAD - Use props object
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### 3. Conditional Rendering

```typescript
// ✅ GOOD - Early returns
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
if (!data) return null;

return <Content data={data} />;

// ❌ BAD - Nested ternaries
return loading ? <Spinner /> : error ? <Error /> : data ? <Content /> : null;
```

### 4. Event Handlers

```typescript
// ✅ GOOD - Inline arrow function for parameters
<button onClick={() => handleClick(id)}>Click</button>

// ✅ GOOD - Direct reference for no parameters
<button onClick={handleClick}>Click</button>

// ❌ BAD - Calling function immediately
<button onClick={handleClick()}>Click</button>
```

---

**Next**: [API Route Patterns](./04-API-ROUTE-PATTERNS.md)
