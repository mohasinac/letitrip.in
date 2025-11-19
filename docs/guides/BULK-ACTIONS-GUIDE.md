# Bulk Action Patterns Guide

## Overview

This guide documents the standardized patterns for implementing bulk operations across the application. Bulk actions allow users to perform operations on multiple items simultaneously, improving efficiency and user experience.

## Architecture

### Type System

All bulk operations use the `BulkActionResponse` type from `src/types/shared/common.types.ts`:

```typescript
export interface BulkActionResponse {
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
  message?: string;
}
```

### Service Layer Pattern

All bulk operations follow this consistent pattern:

```typescript
async bulkOperation(
  ids: string[],
  operation: string,
  data?: any
): Promise<BulkActionResponse> {
  const response: BulkActionResponse = {
    success: true,
    totalItems: ids.length,
    successfulItems: 0,
    failedItems: 0,
    errors: [],
  };

  for (const id of ids) {
    try {
      // Perform operation
      await this.singleOperation(id, data);
      response.successfulItems++;
    } catch (error) {
      response.failedItems++;
      response.errors.push({
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  response.success = response.failedItems === 0;
  return response;
}
```

## Implementation Examples

### 1. Products Service

**File**: `src/services/products.service.ts`

**Bulk Operations** (9 methods):

- `bulkUpdateStatus` - Update status of multiple products
- `bulkDelete` - Delete multiple products
- `bulkUpdateCategory` - Change category for multiple products
- `bulkUpdatePrice` - Update prices
- `bulkUpdateStock` - Update stock levels
- `bulkPublish` - Publish multiple products
- `bulkUnpublish` - Unpublish multiple products
- `bulkFeature` - Mark as featured
- `bulkUnfeature` - Remove featured flag

**Example**:

```typescript
async bulkUpdateStatus(
  ids: string[],
  status: ProductStatus
): Promise<BulkActionResponse> {
  const response: BulkActionResponse = {
    success: true,
    totalItems: ids.length,
    successfulItems: 0,
    failedItems: 0,
    errors: [],
  };

  for (const id of ids) {
    try {
      await this.updateStatus(id, status);
      response.successfulItems++;
    } catch (error) {
      response.failedItems++;
      response.errors.push({
        id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  response.success = response.failedItems === 0;
  return response;
}
```

### 2. Auctions Service

**File**: `src/services/auctions.service.ts`

**Bulk Operations** (8 methods):

- `bulkUpdateStatus` - Update auction status
- `bulkDelete` - Delete multiple auctions
- `bulkExtend` - Extend end time
- `bulkCancel` - Cancel auctions
- `bulkFeature` - Mark as featured
- `bulkUnfeature` - Remove featured flag
- `bulkPublish` - Publish auctions
- `bulkUnpublish` - Unpublish auctions

### 3. Orders Service

**File**: `src/services/orders.service.ts`

**Bulk Operations** (9 methods):

- `bulkUpdateStatus` - Update order status
- `bulkUpdatePaymentStatus` - Update payment status
- `bulkCancel` - Cancel orders
- `bulkMarkPaid` - Mark as paid
- `bulkMarkShipped` - Mark as shipped
- `bulkMarkDelivered` - Mark as delivered
- `bulkRefund` - Process refunds
- `bulkExport` - Export order data
- `bulkPrint` - Generate printable documents

### 4. Coupons Service

**File**: `src/services/coupons.service.ts`

**Bulk Operations** (5 methods):

- `bulkActivate` - Activate coupons
- `bulkDeactivate` - Deactivate coupons
- `bulkDelete` - Delete coupons
- `bulkExtend` - Extend expiry date
- `bulkUpdateUsageLimit` - Update usage limits

## UI Components

### InlineEditTable Component

**File**: `src/components/common/InlineEditTable.tsx`

**Features**:

- Checkbox selection for bulk operations
- Bulk action bar
- Inline editing
- Progress indicators

**Usage**:

```typescript
<InlineEditTable
  data={products}
  columns={columns}
  onBulkAction={handleBulkAction}
  bulkActions={[
    { id: "delete", label: "Delete", icon: Trash2, variant: "destructive" },
    { id: "publish", label: "Publish", icon: CheckCircle },
    { id: "unpublish", label: "Unpublish", icon: XCircle },
  ]}
/>
```

### BulkActionBar Component

**File**: `src/components/common/BulkActionBar.tsx`

Shows bulk action options when items are selected.

**Usage**:

```typescript
<BulkActionBar
  selectedCount={selectedIds.size}
  onAction={handleBulkAction}
  actions={[
    { id: "delete", label: "Delete Selected", icon: Trash2 },
    { id: "export", label: "Export Selected", icon: Download },
  ]}
  onClear={() => setSelectedIds(new Set())}
/>
```

## API Routes

### Bulk Action Endpoint Pattern

**Structure**: `POST /api/{resource}/bulk/{action}`

**Request Body**:

```typescript
{
  ids: string[];
  data?: any; // Action-specific data
}
```

**Response**:

```typescript
{
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{ id: string; error: string }>;
  message?: string;
}
```

**Example**: `POST /api/products/bulk/update-status`

```typescript
// Request
{
  ids: ["prod_1", "prod_2", "prod_3"],
  data: { status: "published" }
}

// Response
{
  success: true,
  totalItems: 3,
  successfulItems: 3,
  failedItems: 0,
  errors: [],
  message: "Successfully updated 3 products"
}
```

## Best Practices

### 1. Atomicity

Each item operation should be independent:

```typescript
// ✅ Good - Each operation is independent
for (const id of ids) {
  try {
    await this.updateProduct(id, data);
    response.successfulItems++;
  } catch (error) {
    response.failedItems++;
    response.errors.push({ id, error: error.message });
  }
}

// ❌ Bad - All-or-nothing approach
try {
  await Promise.all(ids.map((id) => this.updateProduct(id, data)));
  response.successfulItems = ids.length;
} catch (error) {
  response.success = false;
  response.failedItems = ids.length;
}
```

### 2. Error Handling

Always capture individual errors:

```typescript
response.errors.push({
  id,
  error: error instanceof Error ? error.message : String(error),
});
```

### 3. Progress Feedback

Show progress for long-running operations:

```typescript
const updateProgress = (current: number, total: number) => {
  console.log(`Processing ${current}/${total}...`);
};

for (let i = 0; i < ids.length; i++) {
  const id = ids[i];
  try {
    await this.updateProduct(id, data);
    response.successfulItems++;
    updateProgress(i + 1, ids.length);
  } catch (error) {
    // Handle error
  }
}
```

### 4. Validation

Validate before processing:

```typescript
// Validate IDs
if (!ids || ids.length === 0) {
  return {
    success: false,
    totalItems: 0,
    successfulItems: 0,
    failedItems: 0,
    errors: [],
    message: "No IDs provided",
  };
}

// Check limits
if (ids.length > MAX_BULK_SIZE) {
  return {
    success: false,
    totalItems: ids.length,
    successfulItems: 0,
    failedItems: ids.length,
    errors: [],
    message: `Maximum bulk size is ${MAX_BULK_SIZE} items`,
  };
}
```

### 5. Logging

Log bulk operations for auditing:

```typescript
ErrorLogger.info(`Bulk operation: ${operation}`, {
  metadata: {
    operation,
    itemCount: ids.length,
    userId: user.id,
  },
});
```

## Performance Considerations

### 1. Batch Size Limits

```typescript
const MAX_BULK_SIZE = 100; // Limit to prevent timeout

async bulkUpdate(ids: string[], data: any): Promise<BulkActionResponse> {
  if (ids.length > MAX_BULK_SIZE) {
    throw new Error(`Maximum ${MAX_BULK_SIZE} items per bulk operation`);
  }

  // Process
}
```

### 2. Parallel Processing

For independent operations:

```typescript
// Process in chunks for better performance
const CHUNK_SIZE = 10;

for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
  const chunk = ids.slice(i, i + CHUNK_SIZE);

  await Promise.allSettled(
    chunk.map(async (id) => {
      try {
        await this.updateProduct(id, data);
        response.successfulItems++;
      } catch (error) {
        response.failedItems++;
        response.errors.push({ id, error: error.message });
      }
    })
  );
}
```

### 3. Database Optimization

Use batch operations when available:

```typescript
// ✅ Good - Batch update
await db
  .collection("products")
  .where("id", "in", ids.slice(0, 10)) // Firestore limit
  .update({ status: "published" });

// ❌ Bad - Individual updates
for (const id of ids) {
  await db.collection("products").doc(id).update({ status: "published" });
}
```

## Testing

### Unit Tests

```typescript
describe("ProductService.bulkUpdateStatus", () => {
  it("should update all products successfully", async () => {
    const ids = ["prod_1", "prod_2", "prod_3"];
    const result = await productService.bulkUpdateStatus(ids, "published");

    expect(result.success).toBe(true);
    expect(result.successfulItems).toBe(3);
    expect(result.failedItems).toBe(0);
  });

  it("should handle partial failures", async () => {
    const ids = ["prod_1", "invalid_id", "prod_3"];
    const result = await productService.bulkUpdateStatus(ids, "published");

    expect(result.success).toBe(false);
    expect(result.successfulItems).toBe(2);
    expect(result.failedItems).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].id).toBe("invalid_id");
  });
});
```

## Common Issues & Solutions

### Issue 1: Timeout on Large Operations

**Solution**: Implement chunking and progress tracking

```typescript
const CHUNK_SIZE = 20;
const chunks = [];

for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
  chunks.push(ids.slice(i, i + CHUNK_SIZE));
}

for (const chunk of chunks) {
  await this.processChunk(chunk);
}
```

### Issue 2: Memory Issues

**Solution**: Stream results instead of loading everything

```typescript
// Process items one at a time instead of loading all
for await (const id of ids) {
  await this.processItem(id);
}
```

### Issue 3: Race Conditions

**Solution**: Use transactions or optimistic locking

```typescript
await db.runTransaction(async (transaction) => {
  for (const id of ids) {
    const ref = db.collection("products").doc(id);
    const doc = await transaction.get(ref);

    if (doc.exists) {
      transaction.update(ref, { status: "published" });
    }
  }
});
```

## Summary

Bulk actions follow a consistent pattern across the application:

- **Type Safety**: Use `BulkActionResponse` for all operations
- **Error Handling**: Capture individual errors, don't fail fast
- **Progress**: Provide feedback for long operations
- **Performance**: Use batching and parallel processing
- **Testing**: Test both success and failure scenarios

## Related Documentation

- [Type System](../types/README.md)
- [Service Layer](../architecture/SERVICE-LAYER.md)
- [API Routes](../api/README.md)
- [Component Library](../UI-COMPONENTS-QUICK-REF.md)
