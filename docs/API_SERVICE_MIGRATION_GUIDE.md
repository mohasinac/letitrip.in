# API Service Migration Guide

This guide helps you replace direct API calls with service layer calls throughout the application.

## 🎯 Migration Strategy

### Phase 1: Replace Common API Calls

Start with the most frequently used APIs:

1. Products
2. Orders
3. Cart
4. Auth
5. Categories

### Phase 2: Replace Feature-Specific Calls

6. Reviews
7. Wishlist
8. User Profile
9. Addresses

### Phase 3: Replace Admin/Seller Calls

10. Seller APIs
11. Admin APIs
12. Game APIs
13. Upload APIs

---

## 📝 Common Replacements

### 1. Products API

#### Fetch Products List

```typescript
// ❌ Before
const response = await fetch("/api/products?category=electronics");
const data = await response.json();
setProducts(data.products);

// ✅ After
import { api } from "@/lib/api";

const data = await api.products.getProducts({ category: "electronics" });
setProducts(data.products);
```

#### Fetch Single Product

```typescript
// ❌ Before
const response = await fetch(`/api/products/${slug}`);
const data = await response.json();
setProduct(data.product);

// ✅ After
import { api } from "@/lib/api";

const product = await api.products.getProduct(slug);
setProduct(product);
```

---

### 2. Orders API

#### Create Order

```typescript
// ❌ Before
const response = await fetch("/api/orders/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(orderData),
});
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const order = await api.orders.createOrder(orderData);
```

#### Track Order

```typescript
// ❌ Before
const response = await fetch(
  `/api/orders/track?orderNumber=${orderNumber}&email=${email}`
);
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const trackingInfo = await api.orders.trackOrder(orderNumber, email);
```

---

### 3. Auth API

#### Register User

```typescript
// ❌ Before
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, name }),
});
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const user = await api.auth.register({ email, password, name });
```

#### Get Current User

```typescript
// ❌ Before
const response = await fetch("/api/auth/me", {
  credentials: "include",
});
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const user = await api.auth.getCurrentUser();
```

---

### 4. Cart API

#### Add to Cart

```typescript
// ❌ Before
const response = await fetch("/api/cart", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId, quantity }),
});

// ✅ After
import { api } from "@/lib/api";

await api.cart.addToCart(productId, quantity);
```

---

### 5. Search API

#### Universal Search

```typescript
// ❌ Before
const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const results = await api.search.search(query);
```

---

### 6. Payment API

#### Create Razorpay Order

```typescript
// ❌ Before
const response = await fetch("/api/payment/razorpay/create-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount, currency }),
});

// ✅ After
import { api } from "@/lib/api";

const order = await api.payment.createRazorpayOrder({ amount, currency });
```

#### Verify Payment

```typescript
// ❌ Before
const response = await fetch("/api/payment/razorpay/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(paymentData),
});

// ✅ After
import { api } from "@/lib/api";

await api.payment.verifyRazorpayPayment(paymentData);
```

---

### 7. Seller API

#### Get Seller Products

```typescript
// ❌ Before
const response = await fetch("/api/seller/products");
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const { products, total } = await api.seller.getProducts();
```

#### Validate Coupon

```typescript
// ❌ Before
const response = await fetch("/api/seller/coupons/validate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code, orderTotal }),
});

// ✅ After
import { api } from "@/lib/api";

const result = await api.seller.validateCoupon(code, orderTotal);
```

---

### 8. Admin API

#### Get Hero Slides

```typescript
// ❌ Before
const response = await fetch("/api/admin/hero-slides");
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const slides = await api.admin.getHeroSlides();
```

#### Update Theme Settings

```typescript
// ❌ Before
await fetch("/api/admin/theme-settings", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(settings),
});

// ✅ After
import { api } from "@/lib/api";

await api.admin.updateThemeSettings(settings);
```

---

### 9. Game API

#### Get Beyblades

```typescript
// ❌ Before
const response = await fetch("/api/beyblades");
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const beyblades = await api.game.getBeyblades();
```

#### Get Arenas

```typescript
// ❌ Before
const response = await fetch("/api/arenas");
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const arenas = await api.game.getArenas();
```

---

### 10. Upload API

#### Upload Image

```typescript
// ❌ Before
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
const data = await response.json();

// ✅ After
import { api } from "@/lib/api";

const result = await api.upload.uploadImage(file);
console.log(result.url);
```

---

## 🔧 Migration Checklist

### Files to Update (Priority Order)

#### High Priority (Core Features)

- [ ] `src/app/products/page.tsx` - Products list
- [ ] `src/app/products/[slug]/page.tsx` - Product detail
- [ ] `src/app/categories/[slug]/page.tsx` - Category page
- [ ] `src/app/checkout/page.tsx` - Checkout flow
- [ ] `src/app/orders/[id]/page.tsx` - Order details
- [ ] `src/app/search/page.tsx` - Search results

#### Medium Priority (User Features)

- [ ] `src/hooks/useAddresses.ts` - Address management
- [ ] `src/hooks/auth/useEnhancedAuth.ts` - Authentication
- [ ] `src/components/home/InteractiveHeroBanner.tsx` - Hero banner
- [ ] `src/contexts/CurrencyContext.tsx` - Currency preferences
- [ ] `src/contexts/ModernThemeContext.tsx` - Theme settings

#### Low Priority (Admin/Game Features)

- [ ] `src/hooks/useArenas.ts` - Arena management
- [ ] `src/hooks/useBeyblades.ts` - Beyblade management
- [ ] `src/components/features/bulk/BulkOperationsManagement.tsx` - Bulk operations
- [ ] `src/components/admin/BeybladeManagement.tsx` - Admin beyblade management
- [ ] `src/app/game/hooks/useGameState.ts` - Game state
- [ ] `src/app/seller/products/[id]/edit/page.tsx` - Seller product edit

#### Seller Dashboard

- [ ] `src/components/features/products/ProductsList.tsx` - Product listing
- [ ] All seller pages under `src/app/seller/`

#### Admin Dashboard

- [ ] All admin pages under `src/app/admin/`

---

## 🎨 Pattern Examples

### With React Hooks

#### useEffect Pattern

```typescript
// ✅ After
import { api } from "@/lib/api";

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const products = await api.products.getProducts();
      setProducts(products);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

#### Form Submission Pattern

```typescript
// ✅ After
import { api } from "@/lib/api";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setSubmitting(true);
    await api.orders.createOrder(orderData);
    toast.success("Order created successfully!");
    router.push("/orders");
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to create order");
  } finally {
    setSubmitting(false);
  }
};
```

---

## 🚀 Advanced Patterns

### Custom Hook with Service

```typescript
// src/hooks/useProducts.ts
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Product, ProductFilters } from "@/lib/api";

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.products.getProducts(filters);
        setProducts(data.products);
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
const { products, loading, error } = useProducts({ category: "electronics" });
```

### Server Component Pattern (Next.js 13+)

```typescript
// ✅ After
import { api } from "@/lib/api";

export default async function ProductsPage() {
  const { products } = await api.products.getProducts();

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

## ✅ Benefits After Migration

1. **Type Safety** - Full TypeScript support with autocomplete
2. **Error Handling** - Consistent error handling across the app
3. **Maintainability** - API changes in one place
4. **Testing** - Easy to mock services for tests
5. **Performance** - Built-in caching and request deduplication
6. **DX** - Better developer experience with IDE support

---

## 🧪 Testing Pattern

```typescript
// Mock service for testing
jest.mock("@/lib/api", () => ({
  api: {
    products: {
      getProducts: jest.fn(() =>
        Promise.resolve({
          products: mockProducts,
          total: 10,
        })
      ),
    },
  },
}));

// Test component
it("displays products", async () => {
  render(<ProductsPage />);
  await waitFor(() => {
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });
});
```

---

## 📊 Progress Tracking

Track your migration progress:

- [ ] Phase 1: Common APIs (Products, Orders, Cart, Auth) - 0/4
- [ ] Phase 2: Feature APIs (Reviews, Wishlist, User, Addresses) - 0/4
- [ ] Phase 3: Admin/Seller APIs (Seller, Admin, Game, Upload) - 0/4
- [ ] Phase 4: Test all replaced calls - 0/1
- [ ] Phase 5: Remove unused direct fetch calls - 0/1

---

**Remember:** Always test after replacing each API call to ensure functionality remains the same!
