# API Services

This directory contains all API service modules for the application. Each service encapsulates API calls for a specific feature domain, providing a clean and type-safe interface for interacting with backend endpoints.

## 📂 Directory Structure

```
services/
├── auth.service.ts          # Authentication
├── address.service.ts       # Address management
├── admin.service.ts         # Admin operations
├── cart.service.ts          # Shopping cart
├── category.service.ts      # Categories
├── game.service.ts          # Beyblades & Arenas
├── order.service.ts         # Orders
├── payment.service.ts       # Payments (Razorpay, PayPal)
├── product.service.ts       # Products
├── review.service.ts        # Reviews
├── search.service.ts        # Search
├── seller.service.ts        # Seller operations
├── upload.service.ts        # File uploads
├── user.service.ts          # User profile
└── wishlist.service.ts      # Wishlist
```

## 🎯 Usage

All services are exported through the main API index file:

```typescript
import { api } from "@/lib/api";

// Use any service
await api.products.getProducts();
await api.orders.createOrder(data);
await api.cart.addToCart(productId, quantity);
```

## 📖 Service Conventions

Each service follows these conventions:

### 1. Class-based Structure

```typescript
export class ProductService {
  static async getProducts(
    filters?: ProductFilters
  ): Promise<ProductListResponse> {
    // Implementation
  }
}
```

### 2. Static Methods

All methods are static for easy access without instantiation.

### 3. TypeScript Types

Each service exports its own types:

```typescript
export interface Product {
  /* ... */
}
export interface ProductFilters {
  /* ... */
}
export interface ProductListResponse {
  /* ... */
}
```

### 4. Error Handling

Services use consistent error handling:

```typescript
try {
  const response = await apiClient.get<T>(url);
  return response;
} catch (error) {
  console.error("ServiceName.methodName error:", error);
  throw error;
}
```

### 5. API Client

All services use the centralized API client:

```typescript
import { apiClient } from "../client";
```

## 🔧 Creating a New Service

If you need to add a new service:

1. **Create the service file:**

   ```bash
   touch src/lib/api/services/new-feature.service.ts
   ```

2. **Define types:**

   ```typescript
   export interface NewFeature {
     id: string;
     name: string;
     // ... other properties
   }

   export interface NewFeatureFilters {
     // ... filter properties
   }
   ```

3. **Create service class:**

   ```typescript
   export class NewFeatureService {
     static async getItems(filters?: NewFeatureFilters): Promise<NewFeature[]> {
       try {
         const response = await apiClient.get<NewFeature[]>(
           "/api/new-feature",
           { params: filters }
         );
         return response;
       } catch (error) {
         console.error("NewFeatureService.getItems error:", error);
         throw error;
       }
     }
   }
   ```

4. **Export from index:**

   ```typescript
   // In src/lib/api/index.ts
   export { NewFeatureService } from "./services/new-feature.service";
   export type {
     NewFeature,
     NewFeatureFilters,
   } from "./services/new-feature.service";

   // Add to api object
   export const api = {
     // ... existing services
     newFeature: NewFeatureService,
   } as const;
   ```

## 📚 Documentation

- **Quick Reference:** `docs/API_SERVICES_QUICK_REFERENCE.md`
- **Full Documentation:** `docs/API_SERVICES_DOCUMENTATION.md`
- **Migration Guide:** `docs/API_SERVICE_MIGRATION_GUIDE.md`
- **Summary:** `docs/API_SERVICE_LAYER_SUMMARY.md`

## ✅ Best Practices

1. **Always use TypeScript types** for parameters and return values
2. **Use the apiClient** instead of direct fetch calls
3. **Handle errors consistently** with try-catch and logging
4. **Document complex methods** with JSDoc comments
5. **Keep services focused** - one service per feature domain
6. **Export types** along with service classes
7. **Use meaningful method names** that describe the action

## 🧪 Testing

Services can be easily mocked for testing:

```typescript
jest.mock("@/lib/api", () => ({
  api: {
    products: {
      getProducts: jest.fn(() => Promise.resolve(mockData)),
    },
  },
}));
```

## 🔗 Related Files

- API Client: `../client.ts`
- API Routes Constants: `@/constants/api-routes.ts`
- Type Definitions: `@/types/`

## 💡 Tips

- Use IDE autocomplete to discover available methods
- Check TypeScript types for parameter requirements
- Refer to documentation for usage examples
- Follow existing service patterns for consistency

---

**Last Updated:** November 4, 2025
