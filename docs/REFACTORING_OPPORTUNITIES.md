# Refactoring Opportunities - February 8, 2026

**Codebase Analysis Results**

This document identifies opportunities for code reuse, consolidation, and refactoring across the codebase to improve maintainability and reduce duplication.

---

## 1. ✅ HIGH PRIORITY: Raw Error Throwing (COMPLETED - Feb 8, 2026)

### Status: **COMPLETED**

**Files Migrated**:

- ✅ `src/lib/firebase/storage.ts` - All 7 raw Error() calls replaced with DatabaseError
- ✅ `src/lib/firebase/auth-helpers.ts` - All 13 raw Error() calls replaced with AuthenticationError/ApiError
- ✅ Fixed client/server import separation in error handling module

### Implementation Summary

Multiple files use raw `throw new Error()` instead of typed error classes, despite having a complete error handling system.

### Locations Found

- `src/lib/firebase/storage.ts` (7 instances)
- `src/lib/firebase/auth-helpers.ts` (12 instances)
- `src/lib/firebase/auth-server.ts` (2 instances)
- `src/hooks/useSessions.ts` (3 instances)
- `src/hooks/useAuth.ts` (3 instances)
- `src/lib/helpers/category-metrics.ts` (3 instances)
- `src/contexts/ThemeContext.tsx` (1 instance)
- `src/contexts/SessionContext.tsx` (1 instance)
- Multiple component files

### Current Pattern (❌ Bad)

```typescript
// src/lib/firebase/storage.ts
throw new Error(error.message || "Failed to upload file");

// src/lib/firebase/auth-helpers.ts
throw new Error("Failed to sign in with email");

// src/hooks/useSessions.ts
throw new Error(data.error || "Failed to revoke session");
```

### Recommended Pattern (✅ Good)

```typescript
import { ApiError, DatabaseError, AuthenticationError } from "@/lib/errors";

// Storage operations
throw new DatabaseError("Failed to upload file", { path, size: file.size });

// Authentication operations
throw new AuthenticationError("Invalid credentials", { provider: "email" });

// API operations
throw new ApiError(response.status, data.error || "Failed to revoke session");
```

### Benefits

- ✅ Consistent error handling across codebase
- ✅ Type-safe error catching
- ✅ Better error tracking and monitoring
- ✅ Structured error data for debugging
- ✅ Proper HTTP status codes

### Estimated Impact

- **Files to update**: ~15 files
- **Lines affected**: ~50 throw statements
- **Time estimate**: 2-3 hours
- **Priority**: HIGH (improves Standard #6 compliance)

---

## 2. 🔁 MEDIUM PRIORITY: Duplicate Fetch Error Handling (16+ instances)

### Issue

Repetitive fetch response error handling pattern across multiple files.

### Locations Found

- `src/hooks/useSessions.ts` (3 mutations)
- `src/contexts/SessionContext.tsx` (2 instances)
- `src/components/admin/ImageUpload.tsx` (1 instance)
- `src/app/user/settings/page.tsx` (1 instance)
- `src/app/profile/[userId]/page.tsx` (1 instance)
- `src/app/faqs/page.tsx` (1 instance)

### Current Pattern (❌ Bad)

```typescript
// Repeated in useSessions.ts 3 times
const response = await fetch(`/api/admin/sessions/${sessionId}`, {
  method: "DELETE",
  credentials: "include",
});

if (!response.ok) {
  const data = await response.json();
  throw new Error(data.error || "Failed to revoke session");
}

return response.json();
```

### Recommended Pattern (✅ Good)

```typescript
// Create utility: src/lib/api/fetch-wrapper.ts
export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
  errorMessage?: string,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      data.error || errorMessage || `Request failed: ${url}`,
    );
  }

  return response.json();
}

// Usage in useSessions.ts
mutationFn: async ({ sessionId }) => {
  return apiRequest(
    `/api/admin/sessions/${sessionId}`,
    {
      method: "DELETE",
    },
    "Failed to revoke session",
  );
};
```

### Benefits

- ✅ Eliminates 30+ lines of duplicate code
- ✅ Consistent error handling
- ✅ Easier to maintain fetch logic
- ✅ Type-safe responses
- ✅ Centralized credential handling

### Estimated Impact

- **Files to update**: ~7 files
- **Lines reduced**: ~30-40 lines
- **Time estimate**: 1-2 hours
- **Priority**: MEDIUM

---

## 3. 📝 LOW PRIORITY: Console Logging (40+ instances)

### Issue

Direct `console.log/error/warn` usage instead of centralized Logger class.

### Locations Found

- `src/repositories/` (9 instances)
- `src/lib/monitoring/` (18 instances)
- `src/lib/helpers/` (7 instances)
- `src/contexts/SessionContext.tsx` (2 instances)
- Various component files

### Current Pattern (❌ Bad)

```typescript
console.error("Failed to batch update ancestor metrics:", error);
console.warn(`⚠️ Cache hit rate is critically low: ${hitRate.toFixed(2)}%`);
console.log(`✅ Document created successfully: ${id}`);
```

### Recommended Pattern (✅ Good)

```typescript
import { Logger } from "@/classes";

const logger = Logger.getInstance();

logger.error("Failed to batch update ancestor metrics", { error, categoryId });
logger.warn("Cache hit rate critically low", { hitRate });
logger.info("Document created successfully", { id });
```

### Benefits

- ✅ Centralized log management
- ✅ Structured logging with metadata
- ✅ Log level filtering
- ✅ File system logging enabled
- ✅ Better production debugging

### Estimated Impact

- **Files to update**: ~15 files
- **Lines affected**: ~40 console statements
- **Time estimate**: 2-3 hours
- **Priority**: LOW (nice-to-have)

---

## 4. 🎯 MEDIUM PRIORITY: Context Hook Error Messages (7 instances)

### Issue

Duplicate pattern for context hook validation across multiple contexts.

### Locations Found

- `src/contexts/ThemeContext.tsx`
- `src/contexts/SessionContext.tsx`
- `src/components/ui/Menu.tsx`
- `src/components/ui/Tabs.tsx`
- `src/components/ui/Dropdown.tsx`
- `src/components/ui/Accordion.tsx`
- `src/components/feedback/Toast.tsx`

### Current Pattern (❌ Bad)

```typescript
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
```

### Recommended Pattern (✅ Good)

```typescript
// Create utility: src/utils/react/create-context-hook.ts
export function createContextHook<T>(
  context: React.Context<T | undefined>,
  hookName: string,
  providerName: string,
): () => T {
  return () => {
    const contextValue = useContext(context);
    if (contextValue === undefined) {
      throw new Error(`${hookName} must be used within ${providerName}`);
    }
    return contextValue;
  };
}

// Usage in contexts
export const useTheme = createContextHook(
  ThemeContext,
  "useTheme",
  "ThemeProvider",
);

export const useSession = createContextHook(
  SessionContext,
  "useSession",
  "SessionProvider",
);
```

### Benefits

- ✅ Eliminates duplicate validation logic
- ✅ Consistent error messages
- ✅ Type-safe context hooks
- ✅ Easier to create new contexts

### Estimated Impact

- **Files to update**: ~7 files
- **Lines reduced**: ~20 lines
- **Time estimate**: 1 hour
- **Priority**: MEDIUM

---

## 5. 🔄 LOW PRIORITY: Fetch with apiClient Migration (10+ instances)

### Issue

Some components still use raw `fetch()` instead of the centralized `apiClient`.

### Locations Found

- `src/contexts/SessionContext.tsx` (3 instances)
- `src/components/homepage/` (6 components)
- `src/app/faqs/page.tsx` (1 instance)

### Current Pattern (❌ Bad)

```typescript
// SessionContext.tsx
await fetch("/api/auth/session/activity", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId: currentSessionId }),
});

// HeroCarousel.tsx
queryFn: () => fetch(API_ENDPOINTS.CAROUSEL.LIST + '?active=true').then(r => r.json()),
```

### Recommended Pattern (✅ Good)

```typescript
// SessionContext.tsx
import { apiClient } from '@/lib/api-client';

await apiClient.post("/api/auth/session/activity", {
  sessionId: currentSessionId
});

// HeroCarousel.tsx
queryFn: () => apiClient.get(API_ENDPOINTS.CAROUSEL.LIST, {
  params: { active: 'true' }
}),
```

### Benefits

- ✅ Consistent API calls
- ✅ Automatic error handling
- ✅ Built-in timeout protection
- ✅ Centralized request/response interceptors
- ✅ Better TypeScript support

### Estimated Impact

- **Files to update**: ~9 files
- **Lines affected**: ~12 fetch calls
- **Time estimate**: 1-2 hours
- **Priority**: LOW

---

## 6. 🎨 LOW PRIORITY: Hardcoded Tailwind Classes (Potential)

### Issue

While we have THEME_CONSTANTS, there may be hardcoded Tailwind classes that could be replaced.

### Examples to Search For

```typescript
// Instead of:
className="space-y-4 p-6 rounded-xl"

// Use:
className={cn(
  THEME_CONSTANTS.spacing.stack,
  THEME_CONSTANTS.spacing.padding.lg,
  THEME_CONSTANTS.borderRadius.xl
)}
```

### Benefits

- ✅ Consistent spacing/sizing
- ✅ Theme-aware styling
- ✅ Easier to update globally
- ✅ Better i18n support (RTL)

### Estimated Impact

- **Files to audit**: All component files
- **Time estimate**: 4-6 hours (full audit)
- **Priority**: LOW (cosmetic improvement)

---

## 7. 🔧 MEDIUM PRIORITY: Firestore Query Building Patterns

### Issue

Similar query building patterns across repositories could be abstracted.

### Locations Found

- `src/repositories/base.repository.ts`
- `src/repositories/user.repository.ts`
- `src/repositories/session.repository.ts`
- `src/lib/helpers/category-metrics.ts`

### Current Pattern (❌ Repetitive)

```typescript
// Repeated in multiple repositories
let query = this.getCollection() as Query;

if (filters.status) {
  query = query.where("status", "==", filters.status);
}
if (filters.category) {
  query = query.where("category", "==", filters.category);
}
if (filters.featured !== undefined) {
  query = query.where("featured", "==", filters.featured);
}
```

### Recommended Pattern (✅ Good)

```typescript
// Create utility: src/lib/firebase/query-builder.ts
export class FirestoreQueryBuilder<T> {
  private query: Query;

  constructor(collection: CollectionReference | Query) {
    this.query = collection as Query;
  }

  where(field: string, operator: WhereFilterOp, value: any) {
    if (value !== undefined && value !== null) {
      this.query = this.query.where(field, operator, value);
    }
    return this;
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    this.query = this.query.orderBy(field, direction);
    return this;
  }

  limit(count: number) {
    this.query = this.query.limit(count);
    return this;
  }

  build(): Query {
    return this.query;
  }
}

// Usage in repositories
const query = new FirestoreQueryBuilder(this.getCollection())
  .where("status", "==", filters.status)
  .where("category", "==", filters.category)
  .where("featured", "==", filters.featured)
  .orderBy("createdAt", "desc")
  .limit(20)
  .build();
```

### Benefits

- ✅ Chainable query building
- ✅ Automatic null/undefined filtering
- ✅ Type-safe query construction
- ✅ Reusable across repositories

### Estimated Impact

- **Files to update**: ~5 repositories
- **Lines reduced**: ~30-40 lines
- **Time estimate**: 2-3 hours
- **Priority**: MEDIUM

---

## Summary & Recommendations

### Priority Matrix

| Priority  | Issue                     | Impact | Effort | ROI        |
| --------- | ------------------------- | ------ | ------ | ---------- |
| 🔴 HIGH   | Raw Error Throwing (#1)   | High   | 2-3h   | ⭐⭐⭐⭐⭐ |
| 🟡 MEDIUM | Fetch Error Handling (#2) | Medium | 1-2h   | ⭐⭐⭐⭐   |
| 🟡 MEDIUM | Context Hook Pattern (#4) | Medium | 1h     | ⭐⭐⭐⭐   |
| 🟡 MEDIUM | Query Builder (#7)        | Medium | 2-3h   | ⭐⭐⭐     |
| 🟢 LOW    | Console Logging (#3)      | Low    | 2-3h   | ⭐⭐       |
| 🟢 LOW    | apiClient Migration (#5)  | Low    | 1-2h   | ⭐⭐       |
| 🟢 LOW    | Tailwind Classes (#6)     | Low    | 4-6h   | ⭐         |

### Recommended Refactoring Order

#### Phase 1: High Priority (1 week)

1. **Replace raw Error() with typed error classes** (#1)
   - Improves error handling compliance
   - Better error tracking and monitoring
   - Estimated: 2-3 hours

#### Phase 2: Quick Wins (3-4 days)

2. **Create fetch wrapper utility** (#2)
   - Reduces duplicate code immediately
   - Estimated: 1-2 hours

3. **Create context hook factory** (#4)
   - Clean pattern for future contexts
   - Estimated: 1 hour

#### Phase 3: Medium Priority (1 week)

4. **Implement Query Builder** (#7)
   - Cleaner repository code
   - Estimated: 2-3 hours

5. **Migrate remaining fetch to apiClient** (#5)
   - Consistency improvement
   - Estimated: 1-2 hours

#### Phase 4: Nice-to-Have (2 weeks)

6. **Replace console.\* with Logger** (#3)
   - Production logging improvement
   - Estimated: 2-3 hours

7. **Audit hardcoded Tailwind classes** (#6)
   - Cosmetic consistency
   - Estimated: 4-6 hours

### Total Estimated Effort

- **High Priority**: 2-3 hours
- **Medium Priority**: 4-6 hours
- **Low Priority**: 7-11 hours
- **TOTAL**: 13-20 hours (~2-3 days)

---

## Implementation Checklist

### Before Starting

- [ ] Create feature branch: `refactor/code-consolidation`
- [ ] Backup current codebase
- [ ] Run full test suite (verify 95.6% passing)
- [ ] Document current behavior

### During Refactoring

- [ ] Implement one pattern at a time
- [ ] Write/update tests for refactored code
- [ ] Run TypeScript check after each change
- [ ] Update documentation as needed
- [ ] Commit frequently with descriptive messages

### After Completion

- [ ] Run full test suite (ensure 95.6%+ passing)
- [ ] Run TypeScript check (ensure 0 errors)
- [ ] Build project successfully
- [ ] Update CHANGELOG.md
- [ ] Create pull request with detailed description
- [ ] Code review by team
- [ ] Merge to main branch

---

## Code Examples

### Example 1: Error Class Migration

**Before:**

```typescript
// src/lib/firebase/storage.ts
export async function uploadFile(path: string, file: File) {
  try {
    const storageRef = ref(storage, path);
    const uploadResult = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(uploadResult.ref);
    return { url, ref: uploadResult.ref, uploadResult };
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}
```

**After:**

```typescript
// src/lib/firebase/storage.ts
import { DatabaseError } from "@/lib/errors";
import { Logger } from "@/classes";

const logger = Logger.getInstance();

export async function uploadFile(path: string, file: File) {
  try {
    const storageRef = ref(storage, path);
    const uploadResult = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(uploadResult.ref);
    return { url, ref: uploadResult.ref, uploadResult };
  } catch (error: any) {
    logger.error("Upload error", { path, error: error.message });
    throw new DatabaseError("Failed to upload file", {
      path,
      size: file.size,
      type: file.type,
      originalError: error.message,
    });
  }
}
```

### Example 2: Fetch Wrapper Implementation

**New File: src/lib/api/fetch-wrapper.ts**

```typescript
import { ApiError } from "@/lib/errors";
import { Logger } from "@/classes";

const logger = Logger.getInstance();

export interface FetchOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean>;
  body?: any;
  timeout?: number;
}

export async function apiRequest<T = any>(
  url: string,
  options: FetchOptions = {},
  errorMessage?: string,
): Promise<T> {
  const { params, body, timeout = 30000, ...fetchOptions } = options;

  // Build URL with params
  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    );
    finalUrl = `${url}?${searchParams}`;
  }

  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(finalUrl, {
      ...fetchOptions,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new ApiError(
        response.status,
        data.error || errorMessage || `Request failed: ${url}`,
        data,
      );
      logger.error("API request failed", {
        url,
        status: response.status,
        error: data,
      });
      throw error;
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw error;
  }
}

// Convenience methods
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "POST", body }),

  put: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "PUT", body }),

  patch: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "PATCH", body }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
```

---

## Metrics & Goals

### Current State

- ✅ Compliance: 110/110 (100%)
- ✅ TypeScript Errors: 0
- ✅ Test Pass Rate: 95.6%
- ⚠️ Code Duplication: ~100+ lines identified
- ⚠️ Raw Errors: 50+ instances

### Target State After Refactoring

- ✅ Compliance: 110/110 (maintained)
- ✅ TypeScript Errors: 0 (maintained)
- ✅ Test Pass Rate: 95.6%+ (maintained or improved)
- ✅ Code Duplication: <20 lines
- ✅ Raw Errors: 0 instances
- ✅ Centralized Logging: 100% adoption
- ✅ Type-Safe APIs: 100% coverage

---

**Document Created**: February 8, 2026  
**Analysis Performed**: GitHub Copilot  
**Codebase Version**: Post-Audit (110/110 Compliance)  
**Status**: Ready for Implementation
