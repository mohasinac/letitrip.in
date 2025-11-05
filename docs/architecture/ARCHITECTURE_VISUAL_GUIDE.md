# Service Layer Architecture - Visual Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                         USER INTERFACE                            │
│                  (Components, Pages, Layouts)                     │
│                                                                   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                        REACT HOOKS                                │
│         useApiProducts, useApiCart, useApiCategories             │
│              (Optional convenience layer)                         │
│                                                                   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                      API SERVICE LAYER                            │
│    ProductService, CartService, StorageService, etc. (20)        │
│          /src/lib/api/services/*.service.ts                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           API CLIENT (apiClient)                         │   │
│  │  • Auto authentication (Firebase token)                  │   │
│  │  • Retry logic with exponential backoff                  │   │
│  │  • Request/response caching (5min TTL)                   │   │
│  │  • Error handling & logging                              │   │
│  │  • TypeScript type safety                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ (GET, POST, PUT, DELETE, PATCH)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                     BACKEND API ROUTES                            │
│              /src/app/api/**/route.ts                            │
│         (Authenticated, Protected, Server-side)                  │
│                                                                   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                   FIREBASE ADMIN SDK                              │
│       Firestore, Auth Admin, Storage, Analytics                  │
│               (Backend database access)                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Example

### Fetching Products

```
User Component
    │
    │ const { products } = useApiProducts({ featured: true })
    ▼
useApiProducts Hook
    │
    │ ProductService.getProducts({ featured: true })
    ▼
ProductService
    │
    │ apiClient.get('/api/products?featured=true')
    ▼
API Client
    │
    │ Adds auth token, handles caching
    │ GET /api/products?featured=true
    ▼
Backend API Route
    │
    │ Validates token, authorizes request
    │ Uses Firebase Admin SDK
    ▼
Firestore
    │
    │ Returns product documents
    ▼
Response flows back up
    │
    ▼
User Component renders products
```

### Uploading Image

```
User Component
    │
    │ onClick: handleUpload(file)
    ▼
Component Handler
    │
    │ const url = await StorageService.uploadImage(file, 'products')
    ▼
StorageService
    │
    │ apiClient.upload('/api/storage/upload', formData)
    ▼
API Client
    │
    │ Adds auth token
    │ POST /api/storage/upload (multipart/form-data)
    ▼
Backend API Route
    │
    │ Validates token & file
    │ Uses Firebase Admin Storage
    ▼
Firebase Storage
    │
    │ Stores file, returns URL
    ▼
Response flows back up
    │
    ▼
Component updates with URL
```

## 📦 Service Organization

```
src/lib/api/
├── client.ts              # API client with auth, caching, retries
├── index.ts              # Central exports, api object
└── services/
    ├── product.service.ts      # Products
    ├── cart.service.ts         # Shopping cart
    ├── order.service.ts        # Orders
    ├── wishlist.service.ts     # Wishlist
    ├── review.service.ts       # Reviews
    ├── user.service.ts         # User profile
    ├── auth.service.ts         # Authentication
    ├── address.service.ts      # Addresses
    ├── category.service.ts     # Categories
    ├── search.service.ts       # Search
    ├── payment.service.ts      # Payments
    ├── storage.service.ts      # File storage
    ├── upload.service.ts       # File uploads
    ├── seller.service.ts       # Seller operations
    ├── admin.service.ts        # Admin operations
    ├── game.service.ts         # Game features
    ├── contact.service.ts      # Contact forms
    ├── consent.service.ts      # Cookie consent
    ├── hero-banner.service.ts  # Hero banners
    └── content.service.ts      # CMS content
```

## 🎯 Usage Patterns

### Pattern 1: Direct Service Call

```typescript
import { ProductService } from "@/lib/api";

async function loadProducts() {
  const response = await ProductService.getProducts({
    category: "beyblades",
  });
  return response.products;
}
```

### Pattern 2: Using API Object

```typescript
import { api } from "@/lib/api";

async function loadProducts() {
  const response = await api.products.getProducts({
    category: "beyblades",
  });
  return response.products;
}
```

### Pattern 3: Using React Hook (Recommended)

```typescript
import { useApiProducts } from "@/hooks/data";

function ProductList() {
  const { products, loading, error } = useApiProducts({
    category: "beyblades",
  });

  // Automatic loading states, error handling
  if (loading) return <Loader />;
  if (error) return <Error message={error} />;
  return <div>{products.map(renderProduct)}</div>;
}
```

## 🔐 Authentication Flow

```
┌─────────────────┐
│  User Browser   │
│                 │
│  Firebase Auth  │  ◄── User signs in
│  Client SDK     │
└────────┬────────┘
         │
         │ onAuthStateChanged
         │ Stores user.getIdToken()
         ▼
┌─────────────────┐
│   API Client    │
│                 │
│  Interceptor    │  ◄── Adds token to all requests
│  adds token     │      Authorization: Bearer <token>
└────────┬────────┘
         │
         │ Every API request
         ▼
┌─────────────────┐
│  Backend API    │
│                 │
│  Verifies token │  ◄── Validates Firebase token
│  with Firebase  │      Checks permissions
└─────────────────┘
```

## 📊 Service Call Lifecycle

```
1. Component calls service
   ↓
2. Service prepares request
   ↓
3. API Client adds authentication
   ↓
4. Check cache (for GET requests)
   ├─ HIT  → Return cached data
   └─ MISS → Continue to network
   ↓
5. Send HTTP request to backend
   ↓
6. Backend validates & processes
   ↓
7. Response received
   ├─ Success → Cache & return data
   ├─ 4xx Error → Return error
   └─ 5xx Error → Retry (up to 3 times)
   ↓
8. Update component state
```

## 🚫 Firebase Import Rules

### ✅ ALLOWED

```
src/app/api/               ← Firebase Admin SDK
src/contexts/AuthContext   ← Firebase Auth client (auth state only)
src/hooks/auth/           ← Firebase Auth client (auth only)
src/app/login/            ← Firebase Auth client (auth only)
src/app/register/         ← Firebase Auth client (auth only)
```

### ❌ NOT ALLOWED

```
src/app/              ← NO Firebase Firestore
src/components/       ← NO Firebase Storage
src/hooks/data/       ← NO Firebase anything (use services!)
```

## 🎨 Type Safety Flow

```typescript
// 1. Service defines types
export interface Product {
  id: string;
  name: string;
  price: number;
}

// 2. Service method uses types
static async getProduct(id: string): Promise<Product>

// 3. Component gets typed data
const product: Product = await ProductService.getProduct(id);

// 4. TypeScript enforces correctness
product.name    // ✅ OK
product.unknown // ❌ TypeScript error
```

## 🔄 Cache Strategy

```
Request Flow with Cache:

GET /api/products?category=beyblades
         │
         ▼
┌────────────────────┐
│   Check Cache      │
│   Key: URL+params  │
└─────┬──────────────┘
      │
      ├─ Cache HIT (< 5min old)
      │     │
      │     └──► Return cached data ✅
      │
      └─ Cache MISS
            │
            ▼
      ┌──────────────┐
      │  API Request │
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │  Store in    │
      │  Cache       │
      └──────┬───────┘
             │
             ▼
      Return fresh data ✅
```

## 📱 Real-world Usage Example

```typescript
// Page Component
import { useApiProducts, useApiCart } from "@/hooks/data";
import { StorageService } from "@/lib/api";

function ProductPage() {
  // Fetch data with hooks
  const { products, loading } = useApiProducts({
    featured: true,
    limit: 12,
  });
  const { cart, addToCart } = useApiCart();

  // Handle actions with services
  const handleImageUpload = async (file: File) => {
    const url = await StorageService.uploadImage(file, "products");
    return url;
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  // Render with data
  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={() => handleAddToCart(p.id)}
          />
        ))
      )}
    </div>
  );
}
```

## 🎯 Benefits Visualized

```
Before (Direct Firebase):
UI Component → Firebase SDK → Firestore
     ❌ Tight coupling
     ❌ Hard to test
     ❌ Firebase everywhere
     ❌ Duplicate logic

After (Service Layer):
UI Component → Service → API → Firebase Admin
     ✅ Clean separation
     ✅ Easy to test
     ✅ Centralized logic
     ✅ Backend abstraction
     ✅ Type safety
     ✅ Caching
     ✅ Auth handling
```

## 📚 Documentation Map

```
docs/
├── API_SERVICES_COMPLETE_GUIDE.md      ← Full guide, start here
├── migrations/
│   ├── README.md                       ← Index of all docs
│   ├── QUICK_REFERENCE.md             ← Fast lookup
│   ├── SERVICE_LAYER_MIGRATION_SUMMARY.md  ← What's done
│   ├── FIREBASE_REMOVAL_CHECKLIST.md  ← Step-by-step
│   ├── UI_FIREBASE_REMOVAL_GUIDE.md   ← Detailed guide
│   └── ARCHITECTURE_VISUAL_GUIDE.md   ← This file
└── SERVICE_LAYER_COMPLETE.md          ← Executive summary
```

---

**Need quick help?** → `/docs/migrations/QUICK_REFERENCE.md`  
**Want full details?** → `/docs/API_SERVICES_COMPLETE_GUIDE.md`  
**Migrating code?** → `/docs/migrations/FIREBASE_REMOVAL_CHECKLIST.md`
