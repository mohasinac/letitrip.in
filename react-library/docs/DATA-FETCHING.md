# Data Fetching Patterns

Generic, framework-agnostic patterns for data fetching with React.

## Overview

This library provides generic data fetching utilities that work with **any** query library:

- TanStack Query (React Query)
- SWR
- Apollo Client
- Custom implementations

## Quick Start

### Option 1: Use with TanStack Query (Recommended)

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";

// Simple query
const { data, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: () => api.getProducts(),
});

// With filters
const { data } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => api.getProducts(filters),
});

// Mutation
const updateProduct = useMutation({
  mutationFn: (product) => api.updateProduct(product),
  onSuccess: () => {
    toast.success("Updated!");
  },
});
```

### Option 2: Use Generic Hooks from Library

```tsx
import { useQuery, useMutation } from "@letitrip/react-library";

// Works the same way as TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: () => api.getProducts(),
});
```

**Note**: The generic hooks are basic implementations. For production, we strongly recommend using TanStack Query which provides:

- Automatic retries with exponential backoff
- Request deduplication
- Pagination support
- Optimistic updates
- SSR support
- DevTools

## Query Key Factories

Create consistent, type-safe query keys for caching and invalidation.

```tsx
import { createQueryKeys } from "@letitrip/react-library";

// Create keys for a resource
const productKeys = createQueryKeys("products");

// Usage
productKeys.all; // ['products']
productKeys.lists(); // ['products', 'list']
productKeys.list({ status: "active" }); // ['products', 'list', { status: 'active' }]
productKeys.details(); // ['products', 'detail']
productKeys.detail("123"); // ['products', 'detail', '123']
productKeys.bySlug("my-product"); // ['products', 'bySlug', 'my-product']
productKeys.search("laptop"); // ['products', 'search', 'laptop']

// Use in queries
const { data } = useQuery({
  queryKey: productKeys.detail("123"),
  queryFn: () => api.getProduct("123"),
});

// Invalidate all product queries
await queryClient.invalidateQueries({ queryKey: productKeys.all });

// Invalidate specific product
await queryClient.invalidateQueries({ queryKey: productKeys.detail("123") });
```

### Custom Query Keys

```tsx
import { createCustomQueryKeys } from "@letitrip/react-library";

const orderKeys = createCustomQueryKeys("orders", {
  byStatus: (status: string) => ["orders", "status", status] as const,
  byUser: (userId: string) => ["orders", "user", userId] as const,
  recent: () => ["orders", "recent"] as const,
});

// Usage
orderKeys.all; // ['orders']
orderKeys.byStatus("pending"); // ['orders', 'status', 'pending']
orderKeys.byUser("user123"); // ['orders', 'user', 'user123']
orderKeys.recent(); // ['orders', 'recent']
```

## Optimistic Updates

Immediately update UI while waiting for server response, with automatic rollback on error.

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOptimisticUpdate } from "@letitrip/react-library";

const queryClient = useQueryClient();

const updateProduct = useMutation({
  mutationFn: (product) => api.updateProduct(product),
  ...createOptimisticUpdate(
    productKeys.detail(product.id),
    (newData, previousData) => ({
      ...previousData,
      ...newData,
      updatedAt: new Date().toISOString(),
    }),
    queryClient
  ),
});

// Or manually
const updateProduct = useMutation({
  mutationFn: (product) => api.updateProduct(product),
  onMutate: async (newProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: productKeys.detail(newProduct.id),
    });

    // Snapshot previous value
    const previousProduct = queryClient.getQueryData(
      productKeys.detail(newProduct.id)
    );

    // Optimistically update
    queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct);

    // Return context for rollback
    return { previousProduct };
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    if (context?.previousProduct) {
      queryClient.setQueryData(
        productKeys.detail(newProduct.id),
        context.previousProduct
      );
    }
  },
  onSettled: (newProduct) => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({
      queryKey: productKeys.detail(newProduct.id),
    });
  },
});
```

## Cache Invalidation

```tsx
import { invalidateQueries } from "@letitrip/react-library";

// Invalidate all products
await invalidateQueries(queryClient, productKeys.all);

// Invalidate all product lists
await invalidateQueries(queryClient, productKeys.lists());

// Invalidate specific product
await invalidateQueries(queryClient, productKeys.detail("123"));
```

## Prefetching

Prefetch data on hover or before navigation for instant UX.

```tsx
import { prefetchQuery } from "@letitrip/react-library";

<Link
  to="/products/123"
  onMouseEnter={() => {
    prefetchQuery(queryClient, productKeys.detail("123"), () =>
      api.getProduct("123")
    );
  }}
>
  View Product
</Link>;
```

## Dependent Queries

Execute queries in sequence where each depends on the previous.

```tsx
import { createDependentQuery } from "@letitrip/react-library";

// First query
const { data: user } = useQuery({
  queryKey: userKeys.me(),
  queryFn: () => api.getCurrentUser(),
});

// Second query (depends on first)
const shopQueryOptions = createDependentQuery(
  user,
  (u) => shopKeys.detail(u.shopId),
  (u) => api.getShop(u.shopId),
  (u) => !!u?.shopId // Custom enabled check
);

const { data: shop } = useQuery(shopQueryOptions);

// Or simpler
const { data: shop } = useQuery({
  queryKey: shopKeys.detail(user?.shopId),
  queryFn: () => api.getShop(user!.shopId),
  enabled: !!user?.shopId,
});
```

## Data Fetching Adapters

Use the same component code with different query libraries.

### With TanStack Query

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTanStackAdapter } from "@letitrip/react-library";

const adapter = createTanStackAdapter({
  useQuery,
  useMutation,
  useQueryClient,
});

function MyComponent() {
  const { data, isLoading } = adapter.useQuery({
    key: ["products"],
    fetcher: () => api.getProducts(),
  });

  const updateProduct = adapter.useMutation({
    mutationFn: (product) => api.updateProduct(product),
    onSuccess: () => {
      adapter.invalidateQueries?.(["products"]);
    },
  });

  return <ProductList data={data} onUpdate={updateProduct.mutate} />;
}
```

### With SWR

```tsx
import useSWR, { useSWRConfig } from "swr";
import { createSWRAdapter } from "@letitrip/react-library";

const adapter = createSWRAdapter({ useSWR, useSWRConfig });

// Same component code works!
function MyComponent() {
  const { data, isLoading } = adapter.useQuery({
    key: ["products"],
    fetcher: () => api.getProducts(),
  });

  return <ProductList data={data} />;
}
```

### In Library Components

Make your components library-agnostic by accepting an adapter:

```tsx
interface ProductListProps {
  adapter: DataFetchingAdapter;
}

export function ProductList({ adapter }: ProductListProps) {
  const { data, isLoading } = adapter.useQuery({
    key: ["products"],
    fetcher: () => api.getProducts(),
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{/* render products */}</div>;
}

// Usage in Next.js with TanStack Query
import { createTanStackAdapter } from "@letitrip/react-library";
const adapter = createTanStackAdapter({
  useQuery,
  useMutation,
  useQueryClient,
});
<ProductList adapter={adapter} />;

// Usage in React Native with SWR
import { createSWRAdapter } from "@letitrip/react-library";
const adapter = createSWRAdapter({ useSWR, useSWRConfig });
<ProductList adapter={adapter} />;
```

## Framework Integration

### Next.js (App Router)

```tsx
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### React Native

```tsx
// App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
}
```

## Best Practices

### 1. Use Query Key Factories

✅ **Do**: Use factories for consistency

```tsx
const productKeys = createQueryKeys('products');
useQuery({ queryKey: productKeys.detail('123'), ... });
```

❌ **Don't**: Hardcode keys

```tsx
useQuery({ queryKey: ['products', '123'], ... });
```

### 2. Structure Query Keys Hierarchically

```tsx
const keys = {
  all: ["products"] as const,
  lists: () => [...keys.all, "list"] as const,
  list: (filters) => [...keys.lists(), filters] as const,
  details: () => [...keys.all, "detail"] as const,
  detail: (id) => [...keys.details(), id] as const,
};

// Invalidate all: invalidateQueries(keys.all)
// Invalidate lists: invalidateQueries(keys.lists())
// Invalidate one: invalidateQueries(keys.detail('123'))
```

### 3. Colocate Query Hooks

Keep query hooks close to where they're used:

```tsx
// hooks/queries/useProducts.ts
export function useProducts(filters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => api.getProducts(filters),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  });
}
```

### 4. Use Optimistic Updates for Better UX

```tsx
const addToCart = useMutation({
  mutationFn: cartService.addItem,
  onMutate: async (newItem) => {
    // Cancel queries
    await queryClient.cancelQueries({ queryKey: cartKeys.current() });

    // Get previous cart
    const previous = queryClient.getQueryData(cartKeys.current());

    // Optimistically update
    queryClient.setQueryData(cartKeys.current(), (old) => ({
      ...old,
      items: [...old.items, newItem],
    }));

    return { previous };
  },
  onError: (err, newItem, context) => {
    // Rollback
    queryClient.setQueryData(cartKeys.current(), context.previous);
  },
  onSettled: () => {
    // Refetch
    queryClient.invalidateQueries({ queryKey: cartKeys.current() });
  },
});
```

### 5. Handle Dependent Queries

```tsx
const { data: user } = useQuery({
  queryKey: userKeys.me(),
  queryFn: fetchUser,
});

const { data: orders } = useQuery({
  queryKey: orderKeys.byUser(user?.id),
  queryFn: () => fetchOrders(user!.id),
  enabled: !!user?.id, // Only fetch if user exists
});
```

## Migration from App-Specific Hooks

If you have app-specific query hooks (like `useCart`, `useProduct`), they should **stay in your app** and use these generic patterns:

```tsx
// src/hooks/queries/useProduct.ts (stays in main app)
import { useQuery } from "@tanstack/react-query";
import { productKeys } from "@/lib/query-keys"; // Your app's keys
import { productsService } from "@/services"; // Your app's service

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}
```

The library provides the **patterns** (key factories, optimistic updates, adapters), but domain-specific hooks remain in your app.

## TypeScript Support

All utilities are fully typed:

```tsx
import { useQuery, UseMutationOptions } from "@letitrip/react-library";

interface Product {
  id: string;
  name: string;
}

// Typed query
const { data } = useQuery<Product>({
  queryKey: ["products", "123"],
  queryFn: () => api.getProduct("123"),
});

// data is typed as Product | undefined

// Typed mutation
const options: UseMutationOptions<Product, Error, Partial<Product>> = {
  mutationFn: (updates) => api.updateProduct(updates),
  onSuccess: (product) => {
    // product is typed as Product
  },
};
```

## Summary

- ✅ Use **TanStack Query** for production (recommended)
- ✅ Use **query key factories** for consistency
- ✅ Use **optimistic updates** for better UX
- ✅ Use **adapters** to make components library-agnostic
- ✅ Keep **domain-specific hooks** in your app
- ✅ Use **generic patterns** from this library

This approach gives you maximum flexibility: components can work with any query library, while your app uses the best tool for the job.
