# API Routes Constants - Usage Guide

## Overview

The `src/constants/api-routes.ts` file provides centralized API route management to prevent inconsistencies and typos across the application.

## Benefits

- **Type Safety**: Full TypeScript support with autocomplete
- **Single Source of Truth**: All routes defined in one place
- **Maintainability**: Easy to update routes across the entire application
- **Consistency**: Prevents `/api/api` and similar duplication issues
- **Helper Functions**: Built-in query string builders

## Basic Usage

### Import the Constants

```typescript
import { PRODUCT_ROUTES, buildUrl } from "@/constants/api-routes";
// Or import specific route groups
import { API_ROUTES } from "@/constants/api-routes";
```

### Static Routes

```typescript
// Simple GET request
const products = await apiService.get(PRODUCT_ROUTES.LIST);

// POST request
const newProduct = await apiService.post(PRODUCT_ROUTES.LIST, data);
```

### Dynamic Routes (with IDs)

```typescript
// Get by ID
const product = await apiService.get(PRODUCT_ROUTES.BY_ID(productId));

// Get by slug
const product = await apiService.get(PRODUCT_ROUTES.BY_SLUG(slug));

// Delete
await apiService.delete(PRODUCT_ROUTES.BY_ID(productId));
```

### Routes with Query Parameters

```typescript
// Manual query string
const url = `${PRODUCT_ROUTES.LIST}?category=electronics&inStock=true`;

// Using buildUrl helper (recommended)
const url = buildUrl(PRODUCT_ROUTES.LIST, {
  category: "electronics",
  inStock: true,
  page: 1,
  limit: 20,
});
// Result: /api/products?category=electronics&inStock=true&page=1&limit=20

const products = await apiService.get(url);
```

## Available Route Groups

### Public Routes

- `PRODUCT_ROUTES` - Product listing, details, reviews
- `AUCTION_ROUTES` - Auction listing, bidding, watching
- `CATEGORY_ROUTES` - Category tree, products by category
- `SHOP_ROUTES` - Shop listing, shop products
- `CART_ROUTES` - Shopping cart operations
- `ORDER_ROUTES` - Order management
- `SEARCH_ROUTES` - Search products, auctions, shops

### Authentication Routes

- `AUTH_ROUTES` - Login, register, logout, session
- `USER_ROUTES` - Profile, addresses, orders, wishlist

### Admin Routes

- `ADMIN_ROUTES.HERO_SLIDES` - Hero slide management
- `ADMIN_ROUTES.CATEGORIES` - Category management
- `ADMIN_ROUTES.USERS` - User management
- `ADMIN_ROUTES.PRODUCTS` - Product management
- `ADMIN_ROUTES.AUCTIONS` - Auction management
- `ADMIN_ROUTES.*_BULK` - Bulk operations

### Seller Routes

- `SELLER_ROUTES.PRODUCTS` - Seller product management
- `SELLER_ROUTES.AUCTIONS` - Seller auction management
- `SELLER_ROUTES.ORDERS` - Seller order management
- `SELLER_ROUTES.*_BULK` - Bulk operations

### Utility Routes

- `MEDIA_ROUTES` - Media upload/delete
- `REVIEW_ROUTES` - Review CRUD operations
- `COUPON_ROUTES` - Coupon validation/application
- `SYSTEM_ROUTES` - Health checks

## Service Layer Examples

### Products Service

```typescript
import { PRODUCT_ROUTES, buildUrl } from "@/constants/api-routes";

class ProductsService {
  async list(filters?: ProductFilters) {
    const endpoint = buildUrl(PRODUCT_ROUTES.LIST, filters);
    return apiService.get(endpoint);
  }

  async getById(id: string) {
    return apiService.get(PRODUCT_ROUTES.BY_ID(id));
  }

  async getReviews(slug: string, page?: number) {
    const endpoint = buildUrl(PRODUCT_ROUTES.REVIEWS(slug), { page });
    return apiService.get(endpoint);
  }
}
```

### Auctions Service

```typescript
import { AUCTION_ROUTES, buildUrl } from "@/constants/api-routes";

class AuctionsService {
  async list(filters?: AuctionFilters) {
    const endpoint = buildUrl(AUCTION_ROUTES.LIST, filters);
    return apiService.get(endpoint);
  }

  async placeBid(auctionId: string, bidData: PlaceBidData) {
    return apiService.post(AUCTION_ROUTES.PLACE_BID(auctionId), bidData);
  }

  async toggleWatch(auctionId: string) {
    return apiService.post(AUCTION_ROUTES.WATCH(auctionId), {});
  }
}
```

### Admin/Seller Services

```typescript
import { ADMIN_ROUTES, SELLER_ROUTES } from "@/constants/api-routes";

// Admin bulk operations
await apiService.post(ADMIN_ROUTES.HERO_SLIDES_BULK, {
  action: "activate",
  ids: ["id1", "id2"],
});

// Seller bulk operations
await apiService.post(SELLER_ROUTES.PRODUCTS_BULK, {
  action: "publish",
  ids: ["id1", "id2"],
});
```

## Helper Functions

### buildQueryString(params)

Converts an object to a URL query string:

```typescript
import { buildQueryString } from "@/constants/api-routes";

const qs = buildQueryString({
  category: "electronics",
  inStock: true,
  tags: ["sale", "featured"], // Arrays supported
  page: undefined, // Undefined values ignored
});
// Result: "?category=electronics&inStock=true&tags=sale&tags=featured"
```

### buildUrl(path, params)

Combines a path with query parameters:

```typescript
import { buildUrl } from "@/constants/api-routes";

const url = buildUrl("/api/products", {
  category: "electronics",
  page: 1,
});
// Result: "/api/products?category=electronics&page=1"
```

## Migration Guide

### Before (Hardcoded Strings)

```typescript
// ❌ Error-prone, inconsistent
await apiService.get("/api/products");
await apiService.get("/products"); // Missing /api
await apiService.get("/api/api/products"); // Duplicate /api
await apiService.get(`/api/products/${id}`);
```

### After (Using Constants)

```typescript
// ✅ Type-safe, consistent
import { PRODUCT_ROUTES } from "@/constants/api-routes";

await apiService.get(PRODUCT_ROUTES.LIST);
await apiService.get(PRODUCT_ROUTES.BY_ID(id));
```

## Best Practices

1. **Always use constants** - Never hardcode API paths
2. **Use buildUrl for queries** - Handles encoding and array params
3. **Import specific route groups** - Better tree-shaking
4. **Dynamic routes with functions** - Use `BY_ID()`, `BY_SLUG()` functions
5. **Update constants first** - When adding new endpoints, update the constants file

## Adding New Routes

When creating new API endpoints:

1. Add the route to `api-routes.ts`:

```typescript
export const MY_FEATURE_ROUTES = {
  LIST: "/api/my-feature",
  BY_ID: (id: string) => `/api/my-feature/${id}`,
  CUSTOM_ACTION: (id: string) => `/api/my-feature/${id}/action`,
} as const;
```

2. Add to the main export:

```typescript
export const API_ROUTES = {
  // ...existing routes
  MY_FEATURE: MY_FEATURE_ROUTES,
} as const;
```

3. Use in services:

```typescript
import { MY_FEATURE_ROUTES } from "@/constants/api-routes";

const data = await apiService.get(MY_FEATURE_ROUTES.LIST);
```

## Common Patterns

### Pagination

```typescript
const url = buildUrl(PRODUCT_ROUTES.LIST, {
  page: currentPage,
  limit: itemsPerPage,
});
```

### Filtering

```typescript
const url = buildUrl(PRODUCT_ROUTES.LIST, {
  category: categoryId,
  minPrice: 0,
  maxPrice: 1000,
  inStock: true,
});
```

### Nested Resources

```typescript
// Get reviews for a product
const reviews = await apiService.get(PRODUCT_ROUTES.REVIEWS(productSlug));

// Get products in a category
const products = await apiService.get(CATEGORY_ROUTES.PRODUCTS(categoryId));
```

## Troubleshooting

### `/api/api` Duplication

- **Cause**: Service already has `/api` prefix
- **Solution**: Use constants without adding extra `/api`

### Missing Query Parameters

- **Cause**: Not using `buildUrl` helper
- **Solution**: Always use `buildUrl` for query params

### Type Errors

- **Cause**: Using wrong ID type or missing parameter
- **Solution**: Check function signature in constants file

---

**Last Updated**: 2025-11-09  
**Related Files**:

- `src/constants/api-routes.ts` - Route definitions
- `src/services/*.service.ts` - Service implementations
