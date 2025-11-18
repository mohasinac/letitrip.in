# Refactoring Quick Reference Guide

## 🎯 New Infrastructure Usage

### Error Logger

**Import**:

```typescript
import {
  ErrorLogger,
  logServiceError,
  logAPIError,
  logComponentError,
  logAuthError,
  ErrorSeverity,
} from "@/lib/error-logger";
```

**Usage in Services**:

```typescript
class MyService {
  async fetchData() {
    try {
      const response = await apiService.get("/endpoint");
      return response;
    } catch (error) {
      logServiceError("MyService", "fetchData", error as Error);
      throw error;
    }
  }
}
```

**Usage in Components**:

```typescript
function MyComponent() {
  const handleAction = async () => {
    try {
      await myService.doSomething();
    } catch (error) {
      logComponentError("MyComponent", "handleAction", error as Error);
      setError(error.message);
    }
  };
}
```

**Usage in API Routes**:

```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logAPIError("/api/my-route", error as Error, 500);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

**Severity Levels**:

- `ErrorSeverity.LOW` - Minor issues, validation errors
- `ErrorSeverity.MEDIUM` - Standard errors, API failures (default)
- `ErrorSeverity.HIGH` - Authentication issues, important failures
- `ErrorSeverity.CRITICAL` - System failures, data corruption

---

### Bulk Action Types

**Import**:

```typescript
import type {
  BulkActionResponse,
  BulkActionResult,
  BulkActionRequest,
} from "@/types/shared/common.types";
```

**Service Method Pattern**:

```typescript
class ProductsService {
  async bulkAction(
    action: string,
    productIds: string[],
    data?: any
  ): Promise<BulkActionResponse> {
    try {
      const response = await apiService.post<BulkActionResponse>(
        PRODUCT_ROUTES.BULK,
        {
          action,
          ids: productIds,
          updates: data,
        }
      );
      return response;
    } catch (error) {
      logServiceError("Products", "bulkAction", error as Error);
      throw error;
    }
  }

  // Specific bulk methods
  async bulkPublish(productIds: string[]): Promise<BulkActionResponse> {
    return this.bulkAction("publish", productIds);
  }
}
```

**API Route Pattern**:

```typescript
export async function POST(request: NextRequest) {
  const { action, ids, data } = await request.json();

  const results: BulkActionResult[] = [];

  for (const id of ids) {
    try {
      // Perform action
      await performAction(id, action, data);
      results.push({ id, success: true });
    } catch (error) {
      results.push({
        id,
        success: false,
        error: error.message,
      });
    }
  }

  const response: BulkActionResponse = {
    success: true,
    results,
    summary: {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    },
  };

  return NextResponse.json(response);
}
```

**Component Usage**:

```typescript
function BulkActionsPanel({ selectedIds }: Props) {
  const handleBulkPublish = async () => {
    try {
      const response = await productsService.bulkPublish(selectedIds);

      const { successful, failed } = response.summary;

      if (failed === 0) {
        toast.success(`Published ${successful} products`);
      } else {
        toast.warning(`Published ${successful} products, ${failed} failed`);
      }

      // Show failed items
      const errors = response.results
        .filter((r) => !r.success)
        .map((r) => `${r.id}: ${r.error}`);

      if (errors.length > 0) {
        console.error("Failed items:", errors);
      }
    } catch (error) {
      logComponentError(
        "BulkActionsPanel",
        "handleBulkPublish",
        error as Error
      );
      toast.error("Bulk action failed");
    }
  };
}
```

---

## 🔧 Migration Patterns

### Pattern 1: Update Service Bulk Methods

**Before**:

```typescript
async bulkPublish(ids: string[]): Promise<{ success: boolean; results: any[] }> {
  return apiService.post('/products/bulk', { action: 'publish', ids });
}
```

**After**:

```typescript
async bulkPublish(ids: string[]): Promise<BulkActionResponse> {
  try {
    const response = await apiService.post<BulkActionResponse>(
      PRODUCT_ROUTES.BULK,
      { action: 'publish', ids }
    );
    return response;
  } catch (error) {
    logServiceError("Products", "bulkPublish", error as Error);
    throw error;
  }
}
```

### Pattern 2: Update Service Error Handling

**Before**:

```typescript
async getById(id: string): Promise<ProductFE> {
  const product = await apiService.get(`/products/${id}`);
  return toFEProduct(product);
}
```

**After**:

```typescript
async getById(id: string): Promise<ProductFE> {
  try {
    const product = await apiService.get<ProductBE>(`/products/${id}`);
    return toFEProduct(product);
  } catch (error) {
    logServiceError("Products", "getById", error as Error);
    throw error;
  }
}
```

### Pattern 3: Update Component Error Handling

**Before**:

```typescript
const fetchProducts = async () => {
  try {
    const data = await productsService.list();
    setProducts(data);
  } catch (err) {
    console.error("Failed to load products:", err);
    setError(err.message);
  }
};
```

**After**:

```typescript
const fetchProducts = async () => {
  try {
    const data = await productsService.list();
    setProducts(data);
  } catch (err) {
    logComponentError("ProductList", "fetchProducts", err as Error);
    setError((err as Error).message);
  }
};
```

---

## 📋 Checklist for Each File

### Service Files (`src/services/*.service.ts`)

- [ ] Import `BulkActionResponse` from common types
- [ ] Import `logServiceError` from error-logger
- [ ] Update bulk method return types to `BulkActionResponse`
- [ ] Add try-catch with `logServiceError` to bulk methods
- [ ] Add try-catch with `logServiceError` to other methods (optional)
- [ ] Test the service methods

### Component Files (`src/components/**/*.tsx`, `src/app/**/page.tsx`)

- [ ] Import `logComponentError` from error-logger
- [ ] Update error handlers to use `logComponentError`
- [ ] Update bulk action response handling to use new types
- [ ] Test the component behavior

### API Route Files (`src/app/api/**/route.ts`)

- [ ] Import `logAPIError` from error-logger
- [ ] Import `BulkActionResponse` types
- [ ] Update bulk endpoints to return new response format
- [ ] Add error logging to catch blocks
- [ ] Test the API route

---

## 🎯 Priority Order

1. **Services with Bulk Operations** (High Priority)

   - `products.service.ts`
   - `auctions.service.ts`
   - `orders.service.ts`
   - `coupons.service.ts`

2. **Services without Bulk Operations** (Medium Priority)

   - `cart.service.ts`
   - `auth.service.ts`
   - `reviews.service.ts`
   - `shops.service.ts`

3. **Components with Bulk Actions** (High Priority)

   - Admin pages with bulk operations
   - Seller pages with bulk operations

4. **Other Components** (Low Priority)
   - List pages
   - Detail pages
   - Forms

---

## 🧪 Testing Checklist

### After Updating a Service

- [ ] Check TypeScript errors (should be 0)
- [ ] Test individual methods
- [ ] Test bulk operations
- [ ] Verify error logging in console (dev mode)
- [ ] Check network requests in DevTools

### After Updating a Component

- [ ] Check TypeScript errors (should be 0)
- [ ] Test user interactions
- [ ] Verify error messages show correctly
- [ ] Check console for proper error logging
- [ ] Test bulk actions if applicable

### After Updating an API Route

- [ ] Check TypeScript errors (should be 0)
- [ ] Test with Postman/curl
- [ ] Verify response format matches `BulkActionResponse`
- [ ] Check error responses
- [ ] Verify error logging in server logs

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find name 'BulkActionResponse'"

**Solution**: Import from common types

```typescript
import type { BulkActionResponse } from "@/types/shared/common.types";
```

### Issue: "Cannot find name 'logServiceError'"

**Solution**: Import from error-logger

```typescript
import { logServiceError } from "@/lib/error-logger";
```

### Issue: Type error on error parameter

**Solution**: Cast to Error type

```typescript
catch (error) {
  logServiceError("Service", "method", error as Error);
}
```

### Issue: Response type mismatch

**Solution**: Ensure API returns proper format

```typescript
return NextResponse.json({
  success: true,
  results: [...],
  summary: { total, successful, failed }
});
```

---

## 📝 Examples

### Complete Service Example

```typescript
import { apiService } from "./api.service";
import { PRODUCT_ROUTES } from "@/constants/api-routes";
import type { BulkActionResponse } from "@/types/shared/common.types";
import { logServiceError } from "@/lib/error-logger";

class ProductsService {
  async bulkPublish(ids: string[]): Promise<BulkActionResponse> {
    try {
      return await apiService.post<BulkActionResponse>(PRODUCT_ROUTES.BULK, {
        action: "publish",
        ids,
      });
    } catch (error) {
      logServiceError("Products", "bulkPublish", error as Error);
      throw error;
    }
  }
}
```

### Complete Component Example

```typescript
import { useState } from "react";
import { productsService } from "@/services/products.service";
import { logComponentError } from "@/lib/error-logger";
import { toast } from "sonner";

export function BulkActions({ selectedIds }: Props) {
  const handlePublish = async () => {
    try {
      const response = await productsService.bulkPublish(selectedIds);

      if (response.summary) {
        const { successful, failed } = response.summary;
        toast.success(`Published ${successful} items`);

        if (failed > 0) {
          toast.warning(`${failed} items failed`);
        }
      }
    } catch (error) {
      logComponentError("BulkActions", "handlePublish", error as Error);
      toast.error("Failed to publish items");
    }
  };

  return <button onClick={handlePublish}>Publish</button>;
}
```

---

**Last Updated**: November 19, 2025
**Version**: 1.0
