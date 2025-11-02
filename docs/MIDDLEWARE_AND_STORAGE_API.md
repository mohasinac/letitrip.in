# 🛡️ Middleware & Storage API - Implementation Complete

**Project:** HobbiesSpot.com - E-Commerce Platform  
**Date:** November 3, 2025  
**Status:** Phase 1.5 Complete ✅

---

## 📦 New Features Added

### 1. Error Handling Middleware ✅

**File:** `src/lib/api/middleware/error-handler.ts`

#### Custom Error Classes:

```typescript
// All error classes with proper status codes and error codes
-ValidationError(422, VALIDATION_ERROR) -
  AuthenticationError(401, AUTHENTICATION_ERROR) -
  AuthorizationError(403, AUTHORIZATION_ERROR) -
  NotFoundError(404, NOT_FOUND) -
  ConflictError(409, CONFLICT) -
  RateLimitError(429, RATE_LIMIT_EXCEEDED) -
  InternalServerError(500, INTERNAL_SERVER_ERROR);
```

#### ResponseHelper Utility:

```typescript
ResponseHelper.success(data, message?, status?)
ResponseHelper.error(message, status?, errors?, code?)
ResponseHelper.badRequest(message?, errors?)
ResponseHelper.unauthorized(message?)
ResponseHelper.forbidden(message?)
ResponseHelper.notFound(message?)
ResponseHelper.conflict(message?)
ResponseHelper.validationError(message?, errors?)
ResponseHelper.tooManyRequests(message?)
ResponseHelper.serverError(message?)
```

#### Usage Example:

```typescript
// In API route
import { withErrorHandler, ValidationError } from "@/lib/api/middleware";

export const POST = withErrorHandler(async (request) => {
  // Validation
  if (!data.email) {
    throw new ValidationError({ email: ["Email is required"] });
  }

  // Authentication
  if (!user) {
    throw new AuthenticationError();
  }

  // Authorization
  if (user.role !== "admin") {
    throw new AuthorizationError("Only admins can perform this action");
  }

  // Not found
  if (!product) {
    throw new NotFoundError("Product");
  }

  // Success
  return ResponseHelper.success(product, "Product created successfully");
});
```

### 2. Logging Middleware ✅

**File:** `src/lib/api/middleware/logger.ts`

#### Features:

- **Request/Response Logging:** Automatic logging of all API calls
- **Error Logging:** Detailed error tracking with stack traces
- **Performance Logging:** Track operation duration
- **Database Query Logging:** Log database operations
- **Environment-Aware:** Development vs Production modes
- **External Service Ready:** Can integrate with Sentry, LogRocket, etc.

#### Usage Example:

```typescript
import { logger, logPerformance } from "@/lib/api/middleware";

// Log info
logger.info("Starting product creation", { productId: "123" });

// Log error
logger.error("Failed to create product", error, { productId: "123" });

// Performance tracking
const perf = logPerformance("Create Product");
// ... do work ...
perf.end(); // Logs: [Performance] Create Product: 150ms

// In API routes (automatic)
import { withLogging } from "@/lib/api/middleware";

export const GET = withLogging(async (request) => {
  // Request automatically logged
  const data = await fetchData();
  return Response.json(data);
  // Response automatically logged with duration
});
```

### 3. Rate Limiting Middleware ✅

**File:** `src/lib/api/middleware/rate-limiter.ts`

#### Predefined Rate Limits:

```typescript
RATE_LIMITS.AUTH: 5 requests per 15 minutes (login/signup)
RATE_LIMITS.STANDARD: 60 requests per minute
RATE_LIMITS.EXPENSIVE: 10 requests per minute (heavy operations)
RATE_LIMITS.READ: 100 requests per minute (GET requests)
RATE_LIMITS.WRITE: 20 requests per minute (POST/PUT/DELETE)
```

#### Features:

- **User-Based Limiting:** Track by user ID when authenticated
- **IP-Based Limiting:** Track by IP for anonymous users
- **Automatic Headers:** Adds X-RateLimit-\* headers to responses
- **Memory Store:** In-memory store (recommend Redis for production)
- **Auto Cleanup:** Removes expired entries automatically

#### Usage Example:

```typescript
import { withRateLimit, RATE_LIMITS } from "@/lib/api/middleware";

// Apply standard rate limit
export const GET = withRateLimit(RATE_LIMITS.STANDARD)(async (request) => {
  const data = await getData();
  return Response.json(data);
});

// Apply auth rate limit
export const POST = withRateLimit(RATE_LIMITS.AUTH)(async (request) => {
  await loginUser(credentials);
  return Response.json({ success: true });
});

// Custom rate limit
export const POST = withRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: "Too many upload requests",
})(async (request) => {
  // ... upload logic
});
```

### 4. Storage Validator ✅

**File:** `src/lib/backend/validators/storage.validator.ts`

#### Features:

- **File Type Validation:** Images, Videos, Documents
- **Size Validation:** Configurable limits per file type
- **Zod Schemas:** Type-safe validation
- **Helper Functions:** Easy validation utilities

#### Constants:

```typescript
ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime']

FILE_SIZE_LIMITS:
  IMAGE: 5MB
  VIDEO: 50MB
  DOCUMENT: 10MB
```

#### Usage Example:

```typescript
import {
  validateImageFile,
  validateVideoFile,
} from "@/lib/backend/validators/storage.validator";

// Validate image
const validation = validateImageFile(file);
if (!validation.valid) {
  return Response.json({ error: validation.error }, { status: 400 });
}

// Validate video
const videoValidation = validateVideoFile(videoFile);
if (!videoValidation.valid) {
  throw new ValidationError({ file: [videoValidation.error!] });
}
```

### 5. Storage Model ✅

**File:** `src/lib/backend/models/storage.model.ts`

#### Features:

- **Admin SDK Support:** Server-side uploads with Firebase Admin
- **Client SDK Support:** Client-side uploads
- **Automatic File Naming:** Unique timestamped filenames
- **Metadata Support:** Custom metadata for files
- **Bulk Operations:** Upload/delete multiple files
- **URL Extraction:** Extract storage paths from URLs
- **Performance Logging:** Track upload/delete performance

#### Methods:

```typescript
StorageModel.uploadImageAdmin(buffer, originalName, options);
StorageModel.uploadImage(file, options);
StorageModel.uploadMultipleImages(files, options);
StorageModel.uploadVideo(file, options);
StorageModel.deleteFile(path);
StorageModel.deleteMultipleFiles(paths);
StorageModel.deleteFileByUrl(url);
StorageModel.listFiles(folder);
```

### 6. Storage Controller ✅

**File:** `src/lib/backend/controllers/storage.controller.ts`

#### Features:

- **Role-Based Access Control:** Different permissions per role
- **Folder Permissions:** Control who can upload to which folders
- **Automatic Authentication:** Validates user tokens
- **Ownership Validation:** Users can only delete their own files
- **Admin Override:** Admins have full access

#### Folder Permissions:

```typescript
Admin: products, categories, users, hero, banners, uploads, videos, tutorials;
Seller: products, uploads;
User: users, uploads;
Guest: uploads;
```

#### Usage Example:

```typescript
import { StorageController } from "@/lib/backend/controllers/storage.controller";

// In API route
export const POST = withErrorHandler(async (request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const result = await StorageController.uploadImage(request, {
    file,
    folder: "products",
  });

  return ResponseHelper.success(result, "Image uploaded successfully");
});
```

### 7. Storage Service (Frontend) ✅

**File:** `src/lib/api/services/storage.service.ts`

#### Features:

- **Progress Tracking:** Upload progress callbacks
- **Singleton Pattern:** Single instance across app
- **Error Handling:** Consistent error messages
- **Type Safety:** Full TypeScript support

#### Usage Example:

```typescript
import { api } from "@/lib/api/services";

// Upload single image with progress
const result = await api.storage.uploadImage(
  { file, folder: "products" },
  {
    onProgress: (progress) => {
      setUploadProgress(progress);
    },
  }
);

// Get image URL
const url = api.storage.getImageUrl(result.path);

// Delete file
await api.storage.deleteFile(result.path);
```

---

## 🔧 Implementation Patterns

### Pattern 1: Protected API Route with All Middleware

```typescript
import {
  withErrorHandler,
  withLogging,
  withRateLimit,
  RATE_LIMITS,
  ValidationError,
  logger,
} from "@/lib/api/middleware";

export const POST = withErrorHandler(
  withLogging(
    withRateLimit(RATE_LIMITS.WRITE)(async (request) => {
      logger.info("Creating product");

      // Validation
      const body = await request.json();
      if (!body.name) {
        throw new ValidationError({ name: ["Name is required"] });
      }

      // Business logic
      const product = await createProduct(body);

      logger.info("Product created", { productId: product.id });

      return ResponseHelper.success(product, "Product created");
    })
  )
);
```

### Pattern 2: File Upload Endpoint

```typescript
import { withErrorHandler, logger } from "@/lib/api/middleware";
import { StorageController } from "@/lib/backend/controllers/storage.controller";

export const POST = withErrorHandler(async (request) => {
  logger.info("File upload started");

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string;

  const result = await StorageController.uploadImage(request, {
    file,
    folder,
  });

  logger.info("File uploaded successfully", { path: result.path });

  return ResponseHelper.success(result, "File uploaded successfully");
});
```

### Pattern 3: Error Handling in Components

```typescript
import { api } from "@/lib/api/services";
import { toast } from "react-hot-toast";

async function handleUpload(file: File) {
  try {
    setUploading(true);

    const result = await api.storage.uploadImage(
      { file, folder: "products" },
      {
        onProgress: (progress) => setProgress(progress),
      }
    );

    toast.success("Image uploaded successfully!");
    setImageUrl(result.url);
  } catch (error: any) {
    // Error is already formatted by API client
    if (error.response?.data?.errors) {
      // Validation errors
      Object.values(error.response.data.errors).forEach((msgs: any) => {
        msgs.forEach((msg: string) => toast.error(msg));
      });
    } else {
      // Generic error
      toast.error(error.message || "Upload failed");
    }
  } finally {
    setUploading(false);
  }
}
```

---

## ✅ Benefits

### 1. **Consistent Error Handling**

- ✅ All errors follow same format
- ✅ Automatic HTTP status codes
- ✅ Validation errors clearly structured
- ✅ Better debugging with error codes

### 2. **Comprehensive Logging**

- ✅ Track all API requests/responses
- ✅ Performance monitoring
- ✅ Error tracking with context
- ✅ Database query logging
- ✅ Ready for external logging services

### 3. **Rate Limiting Protection**

- ✅ Prevent API abuse
- ✅ Protect expensive operations
- ✅ Different limits per endpoint type
- ✅ Automatic rate limit headers

### 4. **Secure File Uploads**

- ✅ Role-based access control
- ✅ File type validation
- ✅ Size limits enforced
- ✅ Automatic file naming
- ✅ Ownership verification

### 5. **Type Safety**

- ✅ Full TypeScript support
- ✅ Compile-time type checking
- ✅ IntelliSense autocomplete
- ✅ Zod schema validation

---

## 🚀 Quick Start

### 1. Import Middleware

```typescript
import {
  withErrorHandler,
  withLogging,
  withRateLimit,
  RATE_LIMITS,
  logger,
  ValidationError,
  AuthenticationError,
  ResponseHelper,
} from "@/lib/api/middleware";
```

### 2. Use in API Routes

```typescript
export const GET = withErrorHandler(
  withLogging(async (request) => {
    const data = await fetchData();
    return ResponseHelper.success(data);
  })
);
```

### 3. Use Storage Service

```typescript
import { api } from "@/lib/api/services";

const result = await api.storage.uploadImage({ file, folder: "products" });
```

---

## 📝 Migration Checklist

### Phase 1: Add Middleware to Existing Routes ✅

- [ ] Add `withErrorHandler` to all API routes
- [ ] Add `withLogging` to routes that need tracking
- [ ] Add `withRateLimit` to sensitive endpoints
- [ ] Replace generic errors with specific error classes

### Phase 2: Migrate Storage to API ✅

- [ ] Replace direct Firebase Storage calls with `api.storage`
- [ ] Update upload forms to use `StorageService`
- [ ] Add role checks to storage operations
- [ ] Update delete operations to use API

### Phase 3: Add Logging ✅

- [ ] Add `logger.info` for important operations
- [ ] Add `logger.error` for error cases
- [ ] Add `logPerformance` for slow operations
- [ ] Configure external logging service (optional)

### Phase 4: Testing ✅

- [ ] Test all error cases return proper formats
- [ ] Test rate limiting works correctly
- [ ] Test file uploads with different roles
- [ ] Test logging captures all events
- [ ] Test validation errors are user-friendly

---

## 🔍 Examples

### Complete API Route Example

```typescript
// src/app/api/products/route.ts
import {
  withErrorHandler,
  withLogging,
  withRateLimit,
  RATE_LIMITS,
  logger,
  ValidationError,
  NotFoundError,
  ResponseHelper,
} from "@/lib/api/middleware";
import { ProductsController } from "@/lib/backend/controllers/products.controller";

export const GET = withErrorHandler(
  withLogging(
    withRateLimit(RATE_LIMITS.READ)(async (request) => {
      logger.info("Fetching products list");

      const { searchParams } = new URL(request.url);
      const filters = {
        category: searchParams.get("category") || undefined,
        page: parseInt(searchParams.get("page") || "1"),
      };

      const result = await ProductsController.list(request, filters);

      logger.info("Products fetched", { count: result.data.length });

      return ResponseHelper.success(result);
    })
  )
);

export const POST = withErrorHandler(
  withLogging(
    withRateLimit(RATE_LIMITS.WRITE)(async (request) => {
      logger.info("Creating new product");

      const body = await request.json();

      const product = await ProductsController.create(request, body);

      logger.info("Product created", { productId: product.id });

      return ResponseHelper.success(
        product,
        "Product created successfully",
        201
      );
    })
  )
);
```

### Complete Upload Component Example

```typescript
"use client";

import { useState } from "react";
import { api } from "@/lib/api/services";
import { toast } from "react-hot-toast";

export function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>();

  async function handleUpload(file: File) {
    try {
      setUploading(true);
      setProgress(0);

      const result = await api.storage.uploadImage(
        { file, folder: "products" },
        {
          onProgress: (p) => setProgress(p),
        }
      );

      setImageUrl(result.url);
      toast.success("Image uploaded!");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(firstError[0]);
      } else {
        toast.error(error.message || "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      {uploading && <div>Progress: {progress}%</div>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

---

## 📖 Documentation Links

- **Error Handling:** `src/lib/api/middleware/error-handler.ts`
- **Logging:** `src/lib/api/middleware/logger.ts`
- **Rate Limiting:** `src/lib/api/middleware/rate-limiter.ts`
- **Storage Validator:** `src/lib/backend/validators/storage.validator.ts`
- **Storage Model:** `src/lib/backend/models/storage.model.ts`
- **Storage Controller:** `src/lib/backend/controllers/storage.controller.ts`
- **Storage Service:** `src/lib/api/services/storage.service.ts`

---

## ⚠️ Important Notes

### DO ✅

- Always use `withErrorHandler` on API routes
- Use specific error classes instead of generic Error
- Add logging for important operations
- Apply rate limiting to all write operations
- Use `api.storage` for all file operations
- Check user roles before file operations

### DON'T ❌

- Don't use raw `throw new Error()` - use specific error classes
- Don't access Firebase Storage directly from UI
- Don't forget to add rate limiting to expensive operations
- Don't skip file validation
- Don't allow users to upload to any folder

---

## 🎯 Next Steps

1. **Migrate Existing API Routes:**

   - Add middleware to all existing routes
   - Replace generic errors with specific error classes
   - Add logging for tracking

2. **Migrate Storage Operations:**

   - Replace direct Firebase Storage calls
   - Update upload forms to use `api.storage`
   - Add role checks

3. **Add Monitoring:**

   - Configure external logging service (Sentry/LogRocket)
   - Set up alerts for errors
   - Monitor rate limit hits

4. **Testing:**
   - Write tests for error handling
   - Test rate limiting scenarios
   - Test file uploads with different roles

---

**Last Updated:** November 3, 2025  
**Status:** Phase 1.5 Complete, Ready for Migration
