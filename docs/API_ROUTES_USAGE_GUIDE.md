# API Routes Constants - Usage Guide

## Overview

The `constants/api-routes.ts` file provides **type-safe, centralized API route definitions** for the entire application. This ensures consistency between frontend and backend, eliminates hardcoded URLs, and provides excellent TypeScript autocomplete support.

---

## Quick Start

### Basic Usage

```typescript
import { API_ROUTES } from "@/constants/api-routes";

// Simple API calls
const categories = await fetch(API_ROUTES.CATEGORIES.LIST);
const products = await fetch(API_ROUTES.PRODUCTS.LIST);
const user = await fetch(API_ROUTES.AUTH.ME);
```

### Using the Type-Safe Builder

```typescript
import { api } from "@/constants/api-routes";

// Products with filters
const productsUrl = api.products.list({
  category: "beyblades",
  minPrice: 10,
  maxPrice: 50,
  limit: 20,
  page: 1,
});

// Admin users with filters
const usersUrl = api.admin.users.list({
  role: "seller",
  limit: 50,
  page: 1,
});
```

### Dynamic Routes

```typescript
import { API_ROUTES } from "@/constants/api-routes";

// Product detail by slug
const productUrl = API_ROUTES.PRODUCTS.DETAIL("beyblade-burst");

// Order detail by ID
const orderUrl = API_ROUTES.ORDERS.DETAIL("order-123");

// Admin user detail
const userUrl = API_ROUTES.ADMIN.USERS.DETAIL("user-456");
```

---

## Complete Examples

### 1. Fetching Categories

```typescript
import { API_ROUTES } from "@/constants/api-routes";

// Get all categories (list format)
const response = await fetch(API_ROUTES.CATEGORIES.LIST);
const data = await response.json();

// Get category tree
const treeResponse = await fetch(API_ROUTES.CATEGORIES.TREE);
const treeData = await treeResponse.json();

// Get category by slug
const categoryUrl = API_ROUTES.CATEGORIES.DETAIL("beyblades");
const category = await fetch(categoryUrl);
```

### 2. Product Listing with Filters

```typescript
import { api } from "@/constants/api-routes";

// Build URL with filters
const url = api.products.list({
  category: "beyblades",
  search: "burst",
  minPrice: 10,
  maxPrice: 100,
  inStock: true,
  limit: 20,
  page: 1,
});

const response = await fetch(url);
const { products, total, hasMore } = await response.json();
```

### 3. Creating an Order

```typescript
import { API_ROUTES } from "@/constants/api-routes";

const orderData = {
  items: [
    { productId: "prod-123", quantity: 2 },
    { productId: "prod-456", quantity: 1 },
  ],
  shippingAddress: addressId,
  paymentMethod: "razorpay",
};

const response = await fetch(API_ROUTES.ORDERS.CREATE, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
});

const { order } = await response.json();
```

### 4. Admin Operations

```typescript
import { API_ROUTES, api } from "@/constants/api-routes";

// Get all users with filters
const usersUrl = api.admin.users.list({
  role: "seller",
  limit: 50,
  page: 1,
});

// Update user role
const updateRoleUrl = API_ROUTES.ADMIN.USERS.ROLE("user-123");
await fetch(updateRoleUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({ role: "admin" }),
});

// Ban user
const banUrl = API_ROUTES.ADMIN.USERS.BAN("user-456");
await fetch(banUrl, {
  method: "PUT",
  body: JSON.stringify({ banned: true, reason: "Violation" }),
});
```

### 5. Seller Operations

```typescript
import { api, API_ROUTES } from "@/constants/api-routes";

// Get seller products
const productsUrl = api.seller.products.list({
  status: "active",
  category: "beyblades",
  limit: 20,
});

// Create product
await fetch(API_ROUTES.SELLER.PRODUCTS.MAIN, {
  method: "POST",
  body: JSON.stringify(productData),
});

// Get seller orders
const ordersUrl = api.seller.orders.list({
  status: "pending",
  limit: 50,
});

// Approve order
const approveUrl = API_ROUTES.SELLER.ORDERS.APPROVE("order-789");
await fetch(approveUrl, { method: "POST" });
```

### 6. Payment Integration

```typescript
import { API_ROUTES } from "@/constants/api-routes";

// Razorpay
const razorpayOrder = await fetch(API_ROUTES.PAYMENT.RAZORPAY.CREATE_ORDER, {
  method: "POST",
  body: JSON.stringify({ amount: 1000, currency: "INR" }),
});

const verifyPayment = await fetch(API_ROUTES.PAYMENT.RAZORPAY.VERIFY, {
  method: "POST",
  body: JSON.stringify({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  }),
});

// PayPal
const paypalOrder = await fetch(API_ROUTES.PAYMENT.PAYPAL.CREATE_ORDER, {
  method: "POST",
  body: JSON.stringify({ amount: 100 }),
});

const capturePayment = await fetch(API_ROUTES.PAYMENT.PAYPAL.CAPTURE, {
  method: "POST",
  body: JSON.stringify({ orderId: paypalOrderId }),
});
```

---

## React/Next.js Integration

### Custom Hook Example

```typescript
// hooks/useProducts.ts
import { api } from "@/constants/api-routes";
import useSWR from "swr";

export function useProducts(filters: {
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}) {
  const url = api.products.list(filters);

  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    products: data?.products,
    total: data?.total,
    isLoading,
    isError: error,
  };
}
```

### Component Example

```typescript
// components/ProductList.tsx
import { useProducts } from "@/hooks/useProducts";

export function ProductList({ category }: { category: string }) {
  const { products, total, isLoading } = useProducts({
    category,
    limit: 20,
    page: 1,
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <h2>Products ({total})</h2>
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Helper Functions

### Build URL with Query Parameters

```typescript
import { buildUrl } from "@/constants/api-routes";

const url = buildUrl("/api/products", {
  category: "beyblades",
  minPrice: 10,
  maxPrice: 100,
  limit: 20,
});
// Result: /api/products?category=beyblades&minPrice=10&maxPrice=100&limit=20
```

### Build Query String Only

```typescript
import { buildQueryString } from "@/constants/api-routes";

const queryString = buildQueryString({
  search: "beyblade",
  limit: 20,
  page: 1,
});
// Result: ?search=beyblade&limit=20&page=1
```

---

## Available Route Categories

### Public Routes

- ✅ Products (list, detail, search)
- ✅ Categories (list, tree, detail)
- ✅ Orders (list, create, detail, cancel, track)
- ✅ Reviews (list, create, detail)
- ✅ Cart (operations)
- ✅ Addresses (CRUD)

### Auth Routes

- ✅ Register, Login, Me
- ✅ Change Password
- ✅ OTP (send, verify)
- ✅ Account Management

### User Routes

- ✅ Profile (get, update)
- ✅ Account Settings
- ✅ Preferences

### Payment Routes

- ✅ Razorpay (create order, verify)
- ✅ PayPal (create order, capture)

### Admin Routes (19 categories)

- ✅ Products, Orders, Users
- ✅ Categories, Coupons, Settings
- ✅ Shipments, Sales, Reviews
- ✅ Support, Bulk Operations
- ✅ Export, Migration, Upload

### Seller Routes (7 categories)

- ✅ Products, Orders, Shipments
- ✅ Coupons, Sales
- ✅ Alerts, Analytics, Shop

### Game Routes

- ✅ Arenas (CRUD, init, default)
- ✅ Beyblades (CRUD, init, upload, SVG)

### System Routes

- ✅ Search, Contact
- ✅ Health Check
- ✅ Cookie Consent

---

## TypeScript Support

The constants file is fully typed, providing:

```typescript
// Type for all routes
type ApiRoutes = typeof API_ROUTES;

// Type for the builder
type ApiBuilder = typeof api;

// All routes are strongly typed
API_ROUTES.PRODUCTS.LIST; // ✅ string
API_ROUTES.PRODUCTS.DETAIL("slug"); // ✅ (slug: string) => string
api.products.list({ limit: 20 }); // ✅ Typed filters
```

---

## Benefits

### 1. **Type Safety**

- ✅ Autocomplete for all routes
- ✅ Compile-time checks for typos
- ✅ Refactoring-friendly

### 2. **Consistency**

- ✅ Single source of truth
- ✅ Frontend and backend aligned
- ✅ No hardcoded strings

### 3. **Maintainability**

- ✅ Easy to update routes
- ✅ Changes propagate everywhere
- ✅ Self-documenting

### 4. **Developer Experience**

- ✅ Fast development with autocomplete
- ✅ Less bugs from wrong URLs
- ✅ Easy to discover available routes

---

## Migration Guide

### Before (Hardcoded)

```typescript
// ❌ Error-prone, no autocomplete
const response = await fetch("/api/products?category=beyblades&limit=20");
const order = await fetch(`/api/orders/${orderId}`);
```

### After (Type-Safe)

```typescript
// ✅ Type-safe, autocomplete, refactor-friendly
import { api, API_ROUTES } from "@/constants/api-routes";

const response = await fetch(
  api.products.list({ category: "beyblades", limit: 20 })
);
const order = await fetch(API_ROUTES.ORDERS.DETAIL(orderId));
```

---

## Performance Notes

- Routes are computed at **build time** (no runtime overhead)
- Query string building is **lightweight** (native URLSearchParams)
- Constants file is **tree-shakeable** (only import what you use)

---

## Testing

```typescript
import { API_ROUTES, api } from "@/constants/api-routes";

describe("API Routes", () => {
  it("should build product list URL", () => {
    const url = api.products.list({ limit: 20 });
    expect(url).toBe("/api/products?limit=20");
  });

  it("should build product detail URL", () => {
    const url = API_ROUTES.PRODUCTS.DETAIL("test-slug");
    expect(url).toBe("/api/products/test-slug");
  });
});
```

---

## Support

- **Documentation**: See `docs/PERFORMANCE_TESTING_GUIDE.md` for API testing
- **Examples**: Check `docs/examples/` for usage patterns
- **Type Definitions**: Built-in TypeScript support

---

**Pro Tip:** Use this constants file for **all API calls** in your application to ensure consistency and maintainability! 🚀
