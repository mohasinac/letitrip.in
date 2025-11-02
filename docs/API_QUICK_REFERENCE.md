# 🚀 API Architecture - Quick Reference

**Last Updated:** November 3, 2025

---

## 📦 Import Everything You Need

```typescript
// Services (Frontend)
import { api } from "@/lib/api/services";

// Hooks
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";

// Middleware (Backend)
import {
  withErrorHandler,
  withLogging,
  withRateLimit,
  RATE_LIMITS,
  logger,
  ResponseHelper,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from "@/lib/api/middleware";
```

---

## 🎯 Quick Usage

### In React Components:

```typescript
// Use hooks for data fetching
const { products, loading, error } = useProducts({ category: "electronics" });

// Use services for actions
await api.products.create(productData);
await api.orders.cancel(orderId, reason);
await api.storage.uploadImage({ file, folder: "products" });
```

### In API Routes:

```typescript
// Wrap with middleware
export const POST = withErrorHandler(
  withLogging(
    withRateLimit(RATE_LIMITS.WRITE)(async (request) => {
      // Your logic here
      return ResponseHelper.success(data);
    })
  )
);

// Throw specific errors
throw new ValidationError({ email: ["Required"] });
throw new AuthenticationError();
throw new NotFoundError("Product");
```

---

## 📚 Common Patterns

### 1. List View

```typescript
const { products, loading, error, refetch } = useProducts(filters);
```

### 2. Detail View

```typescript
const { product, loading, error } = useProduct(slug);
```

### 3. Create/Update

```typescript
try {
  await api.products.create(data);
  toast.success("Created!");
} catch (error: any) {
  toast.error(error.message);
}
```

### 4. File Upload

```typescript
const result = await api.storage.uploadImage(
  { file, folder: "products" },
  { onProgress: (p) => setProgress(p) }
);
```

### 5. Protected Route

```typescript
export const POST = withErrorHandler(async (request) => {
  const user = await getUser(request);
  if (!user) throw new AuthenticationError();
  if (user.role !== "admin") throw new AuthorizationError();

  // Your logic
  return ResponseHelper.success(data);
});
```

---

## 🔥 Rate Limits

```typescript
RATE_LIMITS.AUTH; // 5 per 15 min (login/signup)
RATE_LIMITS.STANDARD; // 60 per minute
RATE_LIMITS.EXPENSIVE; // 10 per minute (heavy ops)
RATE_LIMITS.READ; // 100 per minute (GET)
RATE_LIMITS.WRITE; // 20 per minute (POST/PUT/DELETE)
```

---

## ⚠️ Error Classes

```typescript
ValidationError(errors); // 422 - Form validation
AuthenticationError(message); // 401 - Auth required
AuthorizationError(message); // 403 - Access denied
NotFoundError(resource); // 404 - Not found
ConflictError(message); // 409 - Conflict
RateLimitError(message); // 429 - Too many requests
InternalServerError(message); // 500 - Server error
```

---

## 📝 Logging

```typescript
logger.info(message, metadata);
logger.warn(message, metadata);
logger.error(message, error, metadata);
logger.debug(message, metadata);

const perf = logPerformance("Operation Name");
// ... do work ...
perf.end(); // Logs duration
```

---

## 🛡️ File Validation

```typescript
// Allowed types
ALLOWED_IMAGE_TYPES: ['.jpg', '.png', '.webp', '.gif']
ALLOWED_VIDEO_TYPES: ['.mp4', '.webm', '.mov']

// Size limits
FILE_SIZE_LIMITS.IMAGE: 5MB
FILE_SIZE_LIMITS.VIDEO: 50MB
FILE_SIZE_LIMITS.DOCUMENT: 10MB
```

---

## 🔐 Role Permissions (Storage)

```typescript
Admin: products, categories, users, hero, banners, uploads, videos, tutorials;
Seller: products, uploads;
User: users, uploads;
Guest: uploads;
```

---

## 🎨 Response Helpers

```typescript
ResponseHelper.success(data, message?, status?)
ResponseHelper.error(message, status?, errors?, code?)
ResponseHelper.badRequest(message?, errors?)
ResponseHelper.unauthorized(message?)
ResponseHelper.forbidden(message?)
ResponseHelper.notFound(message?)
ResponseHelper.validationError(message?, errors?)
```

---

## 📍 All Services Available

```typescript
api.products; // Products CRUD
api.orders; // Orders management
api.users; // User profiles & addresses
api.categories; // Categories tree
api.reviews; // Product reviews
api.storage; // File uploads
```

---

## 🔗 Documentation Links

- **Full Architecture:** `docs/API_CLIENT_ARCHITECTURE.md`
- **Implementation Summary:** `docs/API_CLIENT_IMPLEMENTATION_SUMMARY.md`
- **Middleware Guide:** `docs/MIDDLEWARE_AND_STORAGE_API.md`
- **Complete Reference:** `docs/API_COMPLETE_IMPLEMENTATION.md`
- **Step-by-Step Guide:** `docs/API_CLIENT_IMPLEMENTATION_GUIDE.md`

---

## ✅ Checklist for New Features

- [ ] Create validator (Zod schema)
- [ ] Create model (database operations)
- [ ] Create controller (business logic)
- [ ] Update API route with controller
- [ ] Add middleware (`withErrorHandler`, etc.)
- [ ] Create frontend service
- [ ] Create custom hook (if needed)
- [ ] Add to `api` object
- [ ] Write tests
- [ ] Update documentation

---

## 🚨 Common Mistakes to Avoid

❌ Don't use `fetch()` directly  
✅ Use `api.*` services

❌ Don't use generic `Error`  
✅ Use specific error classes

❌ Don't access Firestore/Storage directly  
✅ Use services and controllers

❌ Don't skip validation  
✅ Use Zod schemas

❌ Don't forget middleware  
✅ Apply to all API routes

❌ Don't ignore TypeScript errors  
✅ Fix them properly

---

**Quick Start:**

1. Import what you need
2. Use hooks in components
3. Use services for actions
4. Wrap routes with middleware
5. Use specific error classes

**Questions?** Check the full docs or ask the team!
