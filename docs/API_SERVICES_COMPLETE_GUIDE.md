# API Services - Complete Migration Guide

## Overview

This project now uses a **Service Layer Architecture** where all UI components interact with the backend through API service files. Direct Firebase imports have been removed from the UI layer.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│         (app/, components/, hooks/, contexts/)           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Uses
                   ▼
┌─────────────────────────────────────────────────────────┐
│               API Service Layer                          │
│          (src/lib/api/services/*.service.ts)            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP Requests
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API Routes                          │
│              (src/app/api/**/route.ts)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Uses
                   ▼
┌─────────────────────────────────────────────────────────┐
│           Firebase Admin SDK                             │
│         (Firestore, Auth, Storage)                       │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Import Services

```typescript
// Option 1: Import specific service
import { ProductService } from "@/lib/api";

// Option 2: Import the api object
import { api } from "@/lib/api";

// Option 3: Import service directly
import { ProductService } from "@/lib/api/services/product.service";
```

### Use Services

```typescript
// Fetch products
const products = await ProductService.getProducts({
  category: "beyblades",
  limit: 10,
});

// Or using the api object
const products = await api.products.getProducts({
  category: "beyblades",
  limit: 10,
});
```

## Available Services

### Core Services

| Service             | Purpose            | Key Methods                                   |
| ------------------- | ------------------ | --------------------------------------------- |
| **ProductService**  | Product management | `getProducts`, `getProduct`, `searchProducts` |
| **CartService**     | Shopping cart      | `getCart`, `addItem`, `saveCart`, `clearCart` |
| **OrderService**    | Order management   | `createOrder`, `getOrders`, `getOrder`        |
| **WishlistService** | Wishlist           | `getWishlist`, `addItem`, `removeItem`        |
| **ReviewService**   | Product reviews    | `getReviews`, `createReview`, `updateReview`  |

### User Services

| Service            | Purpose        | Key Methods                                          |
| ------------------ | -------------- | ---------------------------------------------------- |
| **AuthService**    | Authentication | `register`, `sendOtp`, `verifyOtp`, `getCurrentUser` |
| **UserService**    | User profile   | `getProfile`, `updateProfile`, `changePassword`      |
| **AddressService** | User addresses | `getAddresses`, `createAddress`, `updateAddress`     |

### Content Services

| Service               | Purpose      | Key Methods                                        |
| --------------------- | ------------ | -------------------------------------------------- |
| **CategoryService**   | Categories   | `getCategories`, `getCategory`, `createCategory`   |
| **SearchService**     | Search       | `search`, `getPopularSearches`                     |
| **ContentService**    | CMS content  | `getPage`, `getAllPages`, `createPage`             |
| **HeroBannerService** | Hero banners | `getActiveBanners`, `createBanner`, `updateBanner` |

### Media & Storage

| Service            | Purpose         | Key Methods                               |
| ------------------ | --------------- | ----------------------------------------- |
| **StorageService** | File uploads    | `uploadImage`, `uploadFile`, `deleteFile` |
| **UploadService**  | General uploads | `upload`, `uploadMultiple`                |

### E-commerce Services

| Service            | Purpose           | Key Methods                              |
| ------------------ | ----------------- | ---------------------------------------- |
| **PaymentService** | Payments          | `createRazorpayOrder`, `verifyPayment`   |
| **SellerService**  | Seller operations | `getShop`, `getProducts`, `getOrders`    |
| **AdminService**   | Admin operations  | `getUsers`, `getStats`, `updateSettings` |

### Other Services

| Service            | Purpose            | Key Methods                                   |
| ------------------ | ------------------ | --------------------------------------------- |
| **GameService**    | Beyblades & Arenas | `getBeyblades`, `getArenas`, `createBeyblade` |
| **ContactService** | Contact forms      | `submitContactForm`                           |
| **ConsentService** | Cookie consent     | `saveConsent`, `getConsent`                   |

## Using Hooks

We provide convenient React hooks that wrap the services:

### Products

```typescript
import { useApiProducts, useApiProduct } from "@/hooks/data";

// In component
const { products, loading, error } = useApiProducts({
  category: "beyblades",
  featured: true,
});

const { product, loading, error } = useApiProduct(productId);
```

### Cart

```typescript
import { useApiCart } from "@/hooks/data";

const { cart, loading, addToCart, updateCart, clearCart } = useApiCart();

// Add item
await addToCart(productId, quantity);
```

### Categories

```typescript
import { useApiCategories, useApiCategory } from "@/hooks/data";

const { categories, loading, error } = useApiCategories();
const { category, loading, error } = useApiCategory(categoryId);
```

## Migration Examples

### Before: Direct Firebase

```typescript
// ❌ OLD - Direct Firebase imports
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/api/_lib/database/config";

const productsRef = collection(db, "products");
const snapshot = await getDocs(productsRef);
const products = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));
```

### After: Service Layer

```typescript
// ✅ NEW - Using service layer
import { ProductService } from "@/lib/api";

const response = await ProductService.getProducts();
const products = response.products;
```

### Before: Direct Firebase Storage

```typescript
// ❌ OLD - Direct Firebase storage
import { uploadToFirebase } from "@/lib/firebase/storage";

const url = await uploadToFirebase(file, `path/${file.name}`);
```

### After: Storage Service

```typescript
// ✅ NEW - Using storage service
import { StorageService } from "@/lib/api";

const url = await StorageService.uploadImage(file, "products");
```

## Error Handling

All services include built-in error handling:

```typescript
try {
  const products = await ProductService.getProducts();
  // Handle success
} catch (error) {
  // Error is already logged by service
  // Handle UI error state
  console.error("Failed to load products:", error);
}
```

## API Client Features

The underlying `apiClient` provides:

- ✅ **Automatic authentication** - Adds Firebase token to requests
- ✅ **Retry logic** - Retries failed requests with exponential backoff
- ✅ **Caching** - In-memory cache for GET requests (5 min TTL)
- ✅ **Error handling** - Unified error responses
- ✅ **Type safety** - Full TypeScript support

## Firebase Usage Rules

### ✅ Allowed in UI

```typescript
// Firebase Auth client SDK (for auth state)
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/api/_lib/database/config";
```

### ❌ Not Allowed in UI

```typescript
// Firestore direct access
import { collection, getDocs } from "firebase/firestore";

// Firebase Storage direct access
import { uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase Admin SDK
import admin from "firebase-admin";
```

### ✅ Allowed in Backend (/api folder)

```typescript
// Firebase Admin SDK (backend only)
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
```

## Service File Structure

Each service follows this pattern:

```typescript
/**
 * Example Service
 * Description of service purpose
 */

import { apiClient } from "../client";

// TypeScript interfaces
export interface ExampleData {
  id: string;
  name: string;
}

// Service class
export class ExampleService {
  /**
   * Method description
   */
  static async getExample(id: string): Promise<ExampleData> {
    try {
      const response = await apiClient.get<ExampleData>(`/api/example/${id}`);
      return response;
    } catch (error) {
      console.error("ExampleService.getExample error:", error);
      throw error;
    }
  }
}

export default ExampleService;
```

## Adding New Services

1. Create service file: `src/lib/api/services/my-feature.service.ts`
2. Define types and interfaces
3. Implement service class with static methods
4. Export from `src/lib/api/index.ts`
5. Add to the `api` convenience object
6. Create hook if needed in `src/hooks/data/`

## Testing Services

```typescript
import { ProductService } from "@/lib/api";

// Mock the apiClient if needed
jest.mock("@/lib/api/client");

test("should fetch products", async () => {
  const products = await ProductService.getProducts();
  expect(products).toBeDefined();
});
```

## Benefits

✅ **Clean separation** - UI doesn't know about Firebase  
✅ **Testable** - Easy to mock services  
✅ **Type-safe** - Full TypeScript support  
✅ **Reusable** - Services used across components  
✅ **Maintainable** - Changes in one place  
✅ **Pluggable** - Easy to swap backends

## Related Documentation

- [API Service Layer Summary](/docs/API_SERVICE_LAYER_SUMMARY.md)
- [API Services Documentation](/docs/API_SERVICES_DOCUMENTATION.md)
- [Migration Tracker](/docs/API_SERVICE_MIGRATION_TRACKER.md)
- [UI Firebase Removal Guide](/docs/migrations/UI_FIREBASE_REMOVAL_GUIDE.md)

## Support

If you need to add a new service or migrate existing code, follow the patterns in existing services. All services use the same structure for consistency.
