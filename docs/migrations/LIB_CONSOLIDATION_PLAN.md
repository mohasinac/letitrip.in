# \_lib Directory Consolidation Plan

## Current State

Your project has TWO separate `_lib` directories:

### 1. Root Level: `src/_lib/` (5 files)

```
src/_lib/
├── middleware/
│   ├── cache.middleware.ts        - HOC wrapper for caching responses
│   └── rate-limit.middleware.ts   - HOC wrapper for rate limiting
└── utils/
    ├── cache.ts                   - NodeCache service for in-memory caching
    ├── rate-limiter.ts            - Rate limiting service with sliding window
    └── image-optimizer.ts         - Sharp-based image optimization
```

**Pattern**: Higher-Order Component (HOC) style middleware
**Usage**: Wraps route handlers with functionality
**Example**:

```typescript
export const GET = withCache(
  withRateLimit(handler, { config: RATE_LIMITS.READ }),
  { keyGenerator: (req) => `products:${req.url}`, ttl: 300 }
);
```

### 2. Backend API: `src/app/(backend)/api/_lib/` (65+ files)

```
src/app/(backend)/api/_lib/
├── auth/                    - Authentication & authorization (7 files)
├── config/                  - Configuration files (3 files)
├── controllers/             - Business logic controllers (12 files)
├── database/                - Database config & services (9 files)
├── middleware/              - Simple middleware (4 files)
│   ├── error-handler.ts     - Error handling utilities
│   ├── index.ts             - Middleware exports
│   ├── logger.ts            - Request logging
│   └── rate-limiter.ts      - DUPLICATE (simpler version)
├── models/                  - Database models (11 files)
├── payment/                 - Payment processing (2 files)
├── socket/                  - WebSocket functionality (1 file)
├── storage/                 - File storage utilities (2 files)
├── utils/                   - Backend utilities (4 files)
└── validators/              - Input validators (10 files)
```

**Pattern**: Direct function calls and error classes
**Usage**: Import and call directly within handlers
**Example**:

```typescript
const handler = async (req) => {
  const result = checkRateLimit(key, RATE_LIMITS.READ);
  if (!result.allowed) throw new RateLimitError("Too many requests");
  // ... handler logic
};
```

## The Problem

### Duplication

- **Rate limiting**: Two different implementations
  - `src/_lib/utils/rate-limiter.ts` - Full-featured with role-based configs
  - `src/app/(backend)/api/_lib/middleware/rate-limiter.ts` - Simpler version
- **Middleware patterns**: Two different approaches (HOC vs direct)
- **Confusion**: Unclear which should be used where

### Current Usage

Based on imports found in the codebase:

**Using `src/_lib/` (Root)**:

- `src/app/(backend)/api/search/route.ts`
- `src/app/(backend)/api/products/route.ts`
- `src/app/(backend)/api/products/[slug]/route.ts`
- `src/app/(backend)/api/categories/route.ts`

**Using `src/app/(backend)/api/_lib/` (Backend)**:

- Most other API routes use the direct imports from backend \_lib

## Recommended Consolidation Strategy

### Option 1: Merge Everything into Backend `_lib` ✅ RECOMMENDED

**Rationale**:

- Backend `_lib` is more comprehensive (65+ files vs 5 files)
- Follows Next.js conventions better (inside `(backend)` route group)
- Enforces backend-only code isolation
- Single source of truth for backend utilities

**Actions**:

1. **Move HOC middleware** from `src/_lib/middleware/` to `src/app/(backend)/api/_lib/middleware/`

   - Move `cache.middleware.ts` → `_lib/middleware/cache.ts`
   - Move `rate-limit.middleware.ts` → `_lib/middleware/rate-limit.ts`
   - Delete duplicate `rate-limiter.ts` (keep the simpler one, import from utils)

2. **Move utilities** from `src/_lib/utils/` to `src/app/(backend)/api/_lib/utils/`

   - Move `cache.ts` (keep as is)
   - Move `rate-limiter.ts` (keep as is)
   - Move `image-optimizer.ts` (keep as is)

3. **Update imports** in API routes:

   ```typescript
   // FROM:
   import { withCache } from "@/_lib/middleware/cache.middleware";
   import { withRateLimit } from "@/_lib/middleware/rate-limit.middleware";
   import { rateLimitConfigs } from "@/_lib/utils/rate-limiter";
   import cacheService from "@/_lib/utils/cache";

   // TO:
   import { withCache } from "../_lib/middleware/cache";
   import { withRateLimit } from "../_lib/middleware/rate-limit";
   import { rateLimitConfigs } from "../_lib/utils/rate-limiter";
   import cacheService from "../_lib/utils/cache";
   ```

4. **Delete empty directory**:

   ```powershell
   Remove-Item -Path "d:\proj\justforview.in\src\_lib" -Recurse -Force
   ```

5. **Update tsconfig paths** (if using path aliases):
   ```json
   {
     "paths": {
       "@/app/*": ["./src/app/*"],
       "@/_lib/*": ["./src/app/(backend)/api/_lib/*"] // Update this
     }
   }
   ```

### Option 2: Keep Root `_lib` for Shared Utilities

**Rationale**:

- Keep middleware wrappers at root level as they could be used by non-API routes
- Keep backend-specific code in backend `_lib`

**Actions**:

1. Delete duplicate `src/app/(backend)/api/_lib/middleware/rate-limiter.ts`
2. Keep `src/_lib/` for middleware wrappers and shared utilities
3. No import changes needed

**Downside**: Maintains two separate directories with potential confusion

## Implementation Steps (Option 1 - Recommended)

### Step 1: Move Files

```powershell
# Create target directories if needed
New-Item -ItemType Directory -Force -Path "d:\proj\justforview.in\src\app\(backend)\api\_lib\middleware"
New-Item -ItemType Directory -Force -Path "d:\proj\justforview.in\src\app\(backend)\api\_lib\utils"

# Move middleware
Move-Item "d:\proj\justforview.in\src\_lib\middleware\cache.middleware.ts" "d:\proj\justforview.in\src\app\(backend)\api\_lib\middleware\cache.ts"
Move-Item "d:\proj\justforview.in\src\_lib\middleware\rate-limit.middleware.ts" "d:\proj\justforview.in\src\app\(backend)\api\_lib\middleware\rate-limit.ts"

# Move utilities
Move-Item "d:\proj\justforview.in\src\_lib\utils\cache.ts" "d:\proj\justforview.in\src\app\(backend)\api\_lib\utils\cache.ts"
Move-Item "d:\proj\justforview.in\src\_lib\utils\rate-limiter.ts" "d:\proj\justforview.in\src\app\(backend)\api\_lib\utils\rate-limiter.ts"
Move-Item "d:\proj\justforview.in\src\_lib\utils\image-optimizer.ts" "d:\proj\justforview.in\src\app\(backend)\api\_lib\utils\image-optimizer.ts"

# Delete duplicate
Remove-Item "d:\proj\justforview.in\src\app\(backend)\api\_lib\middleware\rate-limiter.ts"
```

### Step 2: Update Imports in API Routes

Files to update:

- `src/app/(backend)/api/search/route.ts`
- `src/app/(backend)/api/products/route.ts`
- `src/app/(backend)/api/products/[slug]/route.ts`
- `src/app/(backend)/api/categories/route.ts`

### Step 3: Update Middleware Index

Update `src/app/(backend)/api/_lib/middleware/index.ts`:

```typescript
// Export all middleware
export * from "./error-handler";
export * from "./logger";
export * from "./cache";
export * from "./rate-limit";
```

### Step 4: Clean Up

```powershell
# Remove empty root _lib directory
Remove-Item -Path "d:\proj\justforview.in\src\_lib" -Recurse -Force
```

### Step 5: Test

Run tests to ensure everything still works:

```powershell
npm run build
npm run test
```

## Benefits After Consolidation

1. ✅ **Single source of truth** - All backend utilities in one place
2. ✅ **Clear separation** - Backend code clearly isolated in `(backend)` route group
3. ✅ **No duplication** - Single rate limiter, single cache service
4. ✅ **Better organization** - Follows Next.js App Router conventions
5. ✅ **Easier maintenance** - Changes only need to be made in one place
6. ✅ **Type safety** - All backend code uses consistent imports

## File Count Comparison

**Before**:

- Root `_lib`: 5 files
- Backend `_lib`: 65 files
- **Total: 70 files in 2 locations** ❌

**After**:

- Root `_lib`: ~~DELETED~~
- Backend `_lib`: 69 files (consolidated)
- **Total: 69 files in 1 location** ✅

---

**Recommendation**: Proceed with **Option 1** for a cleaner, more maintainable architecture.
