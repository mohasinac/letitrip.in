# API Service Usage Guide

## Overview

The `apiService` is a centralized HTTP client that handles all API requests in the application. It's configured with a base URL of `/api`, so **you should NOT include `/api` prefix in your endpoint paths**.

## ✅ Correct Usage

```typescript
import { apiService } from "@/services/api.service";

// GET request
const data = await apiService.get("/products");
// Will call: /api/products

// POST request
await apiService.post("/products", { name: "Product" });
// Will call: /api/products

// PATCH request
await apiService.patch("/products/123", { name: "Updated" });
// Will call: /api/products/123

// DELETE request
await apiService.delete("/products/123");
// Will call: /api/products/123
```

## ❌ Incorrect Usage (DO NOT DO THIS)

```typescript
// DON'T include /api in the endpoint path
const data = await apiService.get("/api/products"); // ❌ Results in /api/api/products
await apiService.post("/api/products", data); // ❌ Results in /api/api/products
```

## Common Patterns

### Admin Routes

```typescript
// Hero slides
await apiService.get("/admin/hero-slides");
await apiService.post("/admin/hero-slides", slideData);
await apiService.patch("/admin/hero-slides/123", updates);
await apiService.delete("/admin/hero-slides/123");
```

### User Routes

```typescript
// Favorites
await apiService.get("/favorites");
await apiService.post("/favorites", { product_id: "123" });
await apiService.delete("/favorites/123");
```

### Reviews

```typescript
// Create review
await apiService.post("/reviews", reviewData);

// Mark helpful
await apiService.post("/reviews/123/helpful", {});
```

### Products, Categories, etc.

```typescript
await apiService.get("/products");
await apiService.get("/categories");
await apiService.get("/auctions");
await apiService.get("/shops");
```

## File Upload

For file uploads, use the `mediaService` instead:

```typescript
import { mediaService } from "@/services/media.service";

await mediaService.upload({
  file: fileObject,
  context: "product",
  contextId: productId,
});
```

## Error Handling

The apiService automatically handles:

- 401 (Unauthorized) - Redirects to login
- 403 (Forbidden) - Access denied error
- 404 (Not Found) - Resource not found error
- 429 (Rate Limited) - Too many requests error

```typescript
try {
  const data = await apiService.get("/endpoint");
} catch (error) {
  console.error("API Error:", error.message);
  // Handle error appropriately
}
```

## Direct fetch() Calls

If you need to use `fetch()` directly (not recommended), include the full path:

```typescript
// If you MUST use fetch directly
const response = await fetch("/api/products");
```

But prefer using `apiService` for consistency and built-in error handling.

## Summary

**Rule of Thumb:** When using `apiService`, start your endpoint path with `/` but DO NOT include `/api`.

The `apiService` will automatically prepend `/api` to all endpoints.
