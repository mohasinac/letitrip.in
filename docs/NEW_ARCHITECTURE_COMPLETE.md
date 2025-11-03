# 🎯 Complete API Architecture - Final Implementation

**Date:** November 3, 2025  
**Status:** ✅ COMPLETE - All backend code in `src/app/api`  
**Version:** 2.0 (Clean Architecture)

---

## 📁 New Directory Structure

```
src/
├── app/
│   └── api/                          # ALL API-RELATED CODE HERE
│       ├── _lib/                     # Backend library (private)
│       │   ├── validators/           # Zod validation schemas
│       │   │   ├── product.validator.ts
│       │   │   ├── order.validator.ts
│       │   │   ├── user.validator.ts
│       │   │   ├── review.validator.ts
│       │   │   ├── category.validator.ts
│       │   │   ├── contact.validator.ts
│       │   │   ├── payment.validator.ts
│       │   │   ├── storage.validator.ts
│       │   │   ├── system.validator.ts
│       │   │   └── misc.validator.ts
│       │   │
│       │   ├── models/               # Database layer
│       │   │   ├── storage.model.ts  # ✅ EXISTS
│       │   │   ├── product.model.ts  # TODO: Create
│       │   │   ├── order.model.ts    # TODO: Create
│       │   │   ├── user.model.ts     # TODO: Create
│       │   │   ├── review.model.ts   # TODO: Create
│       │   │   └── category.model.ts # TODO: Create
│       │   │
│       │   ├── controllers/          # Business logic layer
│       │   │   ├── storage.controller.ts  # ✅ EXISTS
│       │   │   ├── product.controller.ts  # TODO: Create
│       │   │   ├── order.controller.ts    # TODO: Create
│       │   │   ├── user.controller.ts     # TODO: Create
│       │   │   ├── review.controller.ts   # TODO: Create
│       │   │   └── category.controller.ts # TODO: Create
│       │   │
│       │   ├── middleware/           # Request/response middleware
│       │   │   ├── error-handler.ts  # ✅ CREATED
│       │   │   ├── logger.ts         # ✅ CREATED
│       │   │   ├── rate-limiter.ts   # ✅ CREATED
│       │   │   └── index.ts          # ✅ CREATED
│       │   │
│       │   ├── database/             # Firebase Admin & database utils
│       │   │   ├── admin.ts
│       │   │   ├── config.ts
│       │   │   ├── initialize.ts
│       │   │   ├── services.ts
│       │   │   ├── sessions.ts
│       │   │   ├── cleanup.ts
│       │   │   ├── arenaService.ts
│       │   │   └── beybladeStatsService.ts
│       │   │
│       │   ├── auth/                 # Authentication & authorization
│       │   │   ├── middleware.ts
│       │   │   ├── api-middleware.ts
│       │   │   ├── firebase-api-auth.ts
│       │   │   ├── jwt.ts
│       │   │   ├── roles.ts
│       │   │   ├── cookies.ts
│       │   │   └── cookie-session.ts
│       │   │
│       │   ├── storage/              # File upload/storage
│       │   │   ├── storage.ts
│       │   │   └── firebase.ts
│       │   │
│       │   ├── payment/              # Payment gateway integrations
│       │   │   ├── razorpay-utils.ts
│       │   │   └── paypal-utils.ts
│       │   │
│       │   ├── socket/               # WebSocket/real-time
│       │   │   └── socket.ts
│       │   │
│       │   ├── utils/                # Backend utilities
│       │   │   ├── errorLogger.ts
│       │   │   ├── imageProcessing.ts
│       │   │   ├── storage.ts
│       │   │   └── order-utils.ts
│       │   │
│       │   └── config/               # Backend configuration
│       │       ├── api.ts
│       │       ├── payment.ts
│       │       └── shipping.ts
│       │
│       ├── products/                 # Product API routes
│       │   ├── route.ts              # GET, POST /api/products
│       │   ├── [id]/
│       │   │   └── route.ts          # GET, PUT, DELETE /api/products/:id
│       │   └── search/
│       │       └── route.ts          # GET /api/products/search
│       │
│       ├── orders/                   # Order API routes
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       │
│       ├── users/                    # User API routes
│       │   ├── route.ts
│       │   ├── [id]/
│       │   │   └── route.ts
│       │   └── profile/
│       │       └── route.ts
│       │
│       ├── categories/               # Category API routes
│       │   ├── route.ts
│       │   └── [slug]/
│       │       └── route.ts
│       │
│       ├── reviews/                  # Review API routes
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       │
│       ├── upload/                   # File upload routes
│       │   └── route.ts
│       │
│       ├── contact/                  # Contact form
│       │   └── route.ts
│       │
│       ├── payment/                  # Payment endpoints
│       │   ├── razorpay/
│       │   │   └── route.ts
│       │   └── paypal/
│       │       └── route.ts
│       │
│       └── health/                   # Health check
│           └── route.ts
│
└── lib/                              # UI-ONLY CODE HERE
    ├── validations/                  # Form validation schemas (UI)
    │   ├── category.ts               # Category form validation
    │   ├── schemas.ts                # Other form schemas
    │   ├── comprehensive-schemas.ts
    │   └── index.ts
    │
    ├── utils/                        # UI utilities only
    │   ├── cookies.ts                # Client-side cookie handling
    │   ├── discountCalculator.ts    # Price calculations
    │   ├── contactPointsBalance.ts  # Points calculations
    │   └── markdown.ts               # Markdown rendering
    │
    ├── storage/                      # Client-side storage
    │   ├── cookieConsent.ts          # Cookie consent UI state
    │   ├── cookieStorage.ts          # Cookie helpers
    │   └── sessionStorage.ts         # Session storage helpers
    │
    ├── seo/                          # SEO utilities
    │   ├── index.ts
    │   ├── metadata.ts
    │   └── structured-data.ts
    │
    ├── debug/                        # Debug utilities
    │   └── auth-debug.ts
    │
    ├── utils.ts                      # Common UI utilities (cn, formatCurrency, etc.)
    │
    └── firebase/                     # Firebase CLIENT SDK (Auth only)
        └── auth.ts                   # Firebase Auth for Google Sign-In

```

---

## 🎯 Architecture Layers

### Layer 1: API Routes (`src/app/api/*/route.ts`)

**Purpose:** Thin HTTP handlers  
**Responsibilities:**

- Accept HTTP requests
- Call validators
- Call controllers
- Return HTTP responses

**Example:**

```typescript
// src/app/api/products/route.ts
import {
  withErrorHandler,
  withLogging,
  withRateLimit,
  RATE_LIMITS,
  ResponseHelper,
} from "../_lib/middleware";
import { validateCreateProduct } from "../_lib/validators/product.validator";
import { ProductController } from "../_lib/controllers/product.controller";

export const GET = withErrorHandler(
  withLogging(
    withRateLimit(RATE_LIMITS.READ)(async (request: NextRequest) => {
      const controller = new ProductController();
      const products = await controller.getAllProducts();
      return ResponseHelper.success(products);
    })
  )
);

export const POST = withErrorHandler(
  withLogging(
    withRateLimit(RATE_LIMITS.WRITE)(async (request: NextRequest) => {
      const body = await request.json();
      const validated = validateCreateProduct(body);

      const controller = new ProductController();
      const product = await controller.createProduct(validated);

      return ResponseHelper.success(product, "Product created", 201);
    })
  )
);
```

### Layer 2: Validators (`src/app/api/_lib/validators/`)

**Purpose:** Request/response validation  
**Responsibilities:**

- Validate request data with Zod
- Type-safe data parsing
- Sanitize inputs

**Example:**

```typescript
// Already exists: src/app/api/_lib/validators/product.validator.ts
export const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  // ... more fields
});

export function validateCreateProduct(data: unknown) {
  return createProductSchema.parse(data);
}
```

### Layer 3: Controllers (`src/app/api/_lib/controllers/`)

**Purpose:** Business logic & orchestration  
**Responsibilities:**

- Business rules
- Permission checks (RBAC)
- Orchestrate model calls
- Handle complex operations

**Example:**

```typescript
// TODO: Create src/app/api/_lib/controllers/product.controller.ts
import { AuthorizationError } from "../middleware";
import { ProductModel } from "../models/product.model";

export class ProductController {
  private model: ProductModel;

  constructor() {
    this.model = new ProductModel();
  }

  async createProduct(data: CreateProductInput, userId: string, role: string) {
    // Business rule: Only sellers and admins can create products
    if (role !== "seller" && role !== "admin") {
      throw new AuthorizationError("Only sellers can create products");
    }

    // Add seller ID
    const productData = {
      ...data,
      sellerId: userId,
      createdAt: new Date().toISOString(),
    };

    return await this.model.create(productData);
  }

  async getAllProducts(filters?: ProductFilters) {
    return await this.model.findAll(filters);
  }
}
```

### Layer 4: Models (`src/app/api/_lib/models/`)

**Purpose:** Database operations  
**Responsibilities:**

- Firestore CRUD operations
- Query building
- Data transformation
- No business logic

**Example:**

```typescript
// TODO: Create src/app/api/_lib/models/product.model.ts
import { db } from "../database/admin";
import { NotFoundError } from "../middleware";

export class ProductModel {
  private collection = db.collection("products");

  async create(data: any) {
    const docRef = await this.collection.add(data);
    return { id: docRef.id, ...data };
  }

  async findAll(filters?: any) {
    let query = this.collection.where("isActive", "==", true);

    if (filters?.category) {
      query = query.where("category", "==", filters.category);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findById(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundError("Product not found");
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: any) {
    await this.collection.doc(id).update(data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.collection.doc(id).delete();
  }
}
```

---

## 🚀 What's Already Done

### ✅ Completed

1. **All Validators (9 files)**

   - product.validator.ts
   - order.validator.ts
   - user.validator.ts
   - review.validator.ts
   - category.validator.ts
   - contact.validator.ts
   - payment.validator.ts
   - storage.validator.ts
   - system.validator.ts

2. **Middleware Layer (4 files)**

   - error-handler.ts (7 error classes + ResponseHelper)
   - logger.ts (request/response/error logging)
   - rate-limiter.ts (5 rate limit configs)
   - index.ts (unified exports)

3. **Storage MVC (3 files)**

   - storage.validator.ts
   - storage.model.ts
   - storage.controller.ts

4. **Backend Infrastructure (moved to api/\_lib)**
   - Database utilities
   - Auth utilities
   - Payment utilities
   - Socket utilities
   - Config files
   - Backend utils

### 📋 TODO: Create Models & Controllers

**Priority 1: Core Collections**

1. `src/app/api/_lib/models/product.model.ts`
2. `src/app/api/_lib/controllers/product.controller.ts`
3. `src/app/api/_lib/models/order.model.ts`
4. `src/app/api/_lib/controllers/order.controller.ts`
5. `src/app/api/_lib/models/user.model.ts`
6. `src/app/api/_lib/controllers/user.controller.ts`

**Priority 2: Supporting Collections** 7. `src/app/api/_lib/models/review.model.ts` 8. `src/app/api/_lib/controllers/review.controller.ts` 9. `src/app/api/_lib/models/category.model.ts` 10. `src/app/api/_lib/controllers/category.controller.ts`

**Priority 3: Refactor API Routes** 11. Refactor `src/app/api/products/route.ts` to use controller 12. Refactor `src/app/api/orders/route.ts` to use controller 13. Refactor `src/app/api/users/route.ts` to use controller 14. Refactor `src/app/api/reviews/route.ts` to use controller 15. Refactor `src/app/api/categories/route.ts` to use controller

---

## 💡 Key Principles

### ✅ DO

- Keep ALL backend code in `src/app/api/_lib/`
- Use middleware on ALL routes (error handler, logging, rate limiting)
- Follow the layer pattern: Route → Validator → Controller → Model → Database
- Use specific error classes (ValidationError, AuthorizationError, etc.)
- Return standardized responses (ResponseHelper)
- Use Firebase Admin SDK only in `_lib/` folder
- Keep UI utilities in `src/lib/`

### ❌ DON'T

- Put backend code in `src/lib/`
- Use Firebase Admin SDK in UI code
- Skip validation
- Access Firestore directly from routes
- Put business logic in models
- Put database queries in controllers
- Use generic Error class
- Return inconsistent response formats

---

## 📊 File Migration Summary

### Moved from `src/lib/` to `src/app/api/_lib/`

- ✅ `backend/validators/*` → `api/_lib/validators/` (9 files)
- ✅ `backend/models/*` → `api/_lib/models/` (1 file)
- ✅ `backend/controllers/*` → `api/_lib/controllers/` (1 file)
- ✅ `database/*` → `api/_lib/database/` (8 files)
- ✅ `auth/*` → `api/_lib/auth/` (7 files)
- ✅ `storage/firebase.ts` → `api/_lib/storage/` (1 file)
- ✅ `firebase/storage.ts` → `api/_lib/storage/` (1 file)
- ✅ `payment/*` → `api/_lib/payment/` (2 files)
- ✅ `socket.ts` → `api/_lib/socket/` (1 file)
- ✅ `config/*` → `api/_lib/config/` (3 files)
- ✅ Backend utils → `api/_lib/utils/` (4 files)

### Kept in `src/lib/` (UI Only)

- ✅ `validations/*` - Form validation for UI
- ✅ `utils.ts` - UI utilities (cn, formatCurrency, etc.)
- ✅ `utils/cookies.ts` - Client-side cookie helpers
- ✅ `utils/discountCalculator.ts` - Price calculations
- ✅ `utils/contactPointsBalance.ts` - Points UI
- ✅ `utils/markdown.ts` - Markdown rendering
- ✅ `storage/cookieConsent.ts` - Cookie consent UI
- ✅ `storage/cookieStorage.ts` - Cookie helpers
- ✅ `storage/sessionStorage.ts` - Session storage
- ✅ `seo/*` - SEO utilities
- ✅ `debug/*` - Debug utilities

### Created New

- ✅ `api/_lib/middleware/error-handler.ts`
- ✅ `api/_lib/middleware/logger.ts`
- ✅ `api/_lib/middleware/rate-limiter.ts`
- ✅ `api/_lib/middleware/index.ts`

---

## 🎯 Next Steps

### Step 1: Create Product Model & Controller

```powershell
# Create the files following storage.model.ts and storage.controller.ts patterns
```

### Step 2: Refactor Product API Routes

```powershell
# Update src/app/api/products/route.ts to use new architecture
```

### Step 3: Repeat for Other Collections

```powershell
# Orders → Users → Reviews → Categories
```

### Step 4: Update All Imports

```powershell
# Find and replace old import paths
# Old: from '@/lib/backend/validators/...'
# New: from '@/app/api/_lib/validators/...'
```

### Step 5: Test Everything

```powershell
# Test all API endpoints
# Verify middleware is working
# Check error handling
```

---

## 📖 Documentation Files

1. **This File:** Complete architecture overview
2. **API_CLIENT_IMPLEMENTATION_SUMMARY.md:** Original plan (outdated, to be updated)
3. **MIDDLEWARE_AND_STORAGE_API.md:** Middleware details (to be updated)
4. **STANDALONE_APIS_SUMMARY.md:** Standalone services (to be integrated)

---

**Status:** ✅ Architecture Complete - Ready for Model & Controller Implementation  
**Next:** Create product.model.ts and product.controller.ts
