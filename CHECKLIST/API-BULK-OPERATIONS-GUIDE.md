# Bulk Operations API Guide

## Overview

The bulk operations API provides a standardized way to perform batch operations on multiple resources. All bulk endpoints follow consistent patterns for request/response formats, error handling, and permission validation.

## Base URL

All bulk operation endpoints follow this pattern:

```
POST /api/{scope}/{resource}/bulk
```

Where:

- `scope`: `admin` or `seller`
- `resource`: `hero-slides`, `categories`, `users`, `products`, `auctions`, etc.

## Request Format

### Standard Request Body

```json
{
  "action": "string",
  "ids": ["id1", "id2", "id3"],
  "data": {
    "field": "value"
  }
}
```

**Fields:**

- `action` (required): The operation to perform
- `ids` (required): Array of resource IDs to operate on
- `data` (optional): Additional data required for the operation

## Response Format

### Success Response

```json
{
  "success": true,
  "successCount": 10,
  "failedCount": 0,
  "message": "10 item(s) updated successfully"
}
```

### Partial Success Response

```json
{
  "success": true,
  "successCount": 8,
  "failedCount": 2,
  "message": "8 item(s) updated successfully, 2 failed",
  "errors": [
    { "id": "abc123", "error": "Item not found" },
    { "id": "def456", "error": "Validation failed" }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "successCount": 0,
  "failedCount": 10,
  "message": "Bulk operation failed",
  "error": "Permission denied"
}
```

## Available Actions by Resource

### Hero Slides (`/api/admin/hero-slides/bulk`)

**Actions:**

- `activate` - Enable slides
- `deactivate` - Disable slides
- `add-to-carousel` - Add to homepage carousel
- `remove-from-carousel` - Remove from carousel
- `delete` - Delete slides

**Example:**

```json
{
  "action": "activate",
  "ids": ["slide1", "slide2", "slide3"]
}
```

### Categories (`/api/admin/categories/bulk`)

**Actions:**

- `activate` - Enable categories
- `deactivate` - Disable categories
- `toggle-featured` - Toggle featured status
- `toggle-homepage` - Toggle homepage display
- `delete` - Delete categories

**Example:**

```json
{
  "action": "toggle-featured",
  "ids": ["cat1", "cat2"]
}
```

### Users (`/api/admin/users/bulk`)

**Actions:**

- `change-role` - Change user roles
- `ban` - Ban users
- `unban` - Unban users
- `make-seller` - Convert users to sellers
- `export` - Export user data

**Example:**

```json
{
  "action": "change-role",
  "ids": ["user1", "user2"],
  "data": {
    "role": "seller"
  }
}
```

### Products (`/api/seller/products/bulk`)

**Actions:**

- `publish` - Publish draft products
- `draft` - Move to draft
- `archive` - Archive products
- `update-stock` - Update stock quantity
- `delete` - Delete products

**Example:**

```json
{
  "action": "update-stock",
  "ids": ["prod1", "prod2"],
  "data": {
    "stock": 100
  }
}
```

### Auctions (`/api/seller/auctions/bulk`)

**Actions:**

- `schedule` - Schedule auctions
- `cancel` - Cancel auctions
- `end` - End auctions early
- `delete` - Delete auctions

**Example:**

```json
{
  "action": "schedule",
  "ids": ["auc1", "auc2"]
}
```

## Using the Bulk Operations Utility

### Import the Utility

```typescript
import {
  executeBulkOperation,
  parseBulkRequest,
  validateBulkPermission,
  createBulkErrorResponse,
} from "@/app/api/lib/bulk-operations";
```

### Basic Handler Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  executeBulkOperation,
  parseBulkRequest,
  validateBulkPermission,
  createBulkErrorResponse,
} from "../../lib/bulk-operations";

export async function POST(req: NextRequest) {
  try {
    // Parse request
    const { action, ids, data, userId } = await parseBulkRequest(req);

    // Validate permission
    const permission = await validateBulkPermission(userId!, "seller");
    if (!permission.valid) {
      return NextResponse.json(
        createBulkErrorResponse(new Error(permission.error)),
        { status: 403 }
      );
    }

    // Execute operation
    const result = await executeBulkOperation({
      collection: "products",
      action,
      ids,
      data,
      customHandler: async (db, id, updateData) => {
        const docRef = db.collection("products").doc(id);

        switch (action) {
          case "publish":
            await docRef.update({
              status: "published",
              published_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            break;

          case "update-stock":
            await docRef.update({
              stock: updateData?.stock || 0,
              updated_at: new Date().toISOString(),
            });
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(createBulkErrorResponse(error), { status: 500 });
  }
}
```

### Advanced: With Validation

```typescript
const result = await executeBulkOperation({
  collection: "auctions",
  action,
  ids,
  data,
  validateItem: async (item, action) => {
    // Validate auction status before operation
    if (action === "end" && item.status !== "active") {
      return {
        valid: false,
        error: "Can only end active auctions",
      };
    }

    if (action === "delete" && item.status === "active") {
      return {
        valid: false,
        error: "Cannot delete active auctions",
      };
    }

    return { valid: true };
  },
  customHandler: async (db, id) => {
    // Custom logic here
  },
});
```

### With Transaction Support

For operations that need atomicity (all succeed or all fail):

```typescript
import { executeBulkOperationWithTransaction } from "../../lib/bulk-operations";

const result = await executeBulkOperationWithTransaction({
  collection: "products",
  action: "update-price",
  ids,
  data: { price: 99.99 },
});
```

## Error Handling

### Common Error Codes

- `400` - Bad Request (missing action/ids, invalid data)
- `401` - Unauthorized (no authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Structure

```json
{
  "success": false,
  "successCount": 0,
  "failedCount": 5,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [{ "id": "item1", "error": "Specific error for this item" }]
}
```

## Rate Limiting

Bulk operations are subject to rate limiting:

- Maximum 200 requests per minute per user
- Maximum 100 items per bulk operation
- Maximum 10 concurrent bulk operations per user

## Best Practices

### 1. Batch Size

```typescript
// ✅ Good: Reasonable batch size
const ids = items.slice(0, 50).map((i) => i.id);

// ❌ Bad: Too many items
const ids = allItems.map((i) => i.id); // Could be thousands
```

### 2. Error Handling

```typescript
// ✅ Good: Check for partial failures
if (result.failedCount > 0) {
  console.log("Some items failed:", result.errors);
  // Show user which items failed
}

// ❌ Bad: Assume all succeeded
if (result.success) {
  // Might have partial failures
}
```

### 3. User Feedback

```typescript
// ✅ Good: Detailed feedback
toast.success(
  `${result.successCount} items updated. ${result.failedCount} failed.`
);

// ❌ Bad: Generic message
toast.success("Done");
```

### 4. Confirmation

```typescript
// ✅ Good: Confirm dangerous operations
if (action === "delete") {
  const confirmed = await confirm(
    `Delete ${ids.length} items? This cannot be undone.`
  );
  if (!confirmed) return;
}

// ❌ Bad: No confirmation for destructive actions
await bulkDelete(ids);
```

## Testing Bulk Operations

### Using cURL

```bash
# Activate hero slides
curl -X POST http://localhost:3000/api/admin/hero-slides/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "activate",
    "ids": ["slide1", "slide2"],
    "userId": "admin-user-id"
  }'

# Update product stock
curl -X POST http://localhost:3000/api/seller/products/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "update-stock",
    "ids": ["prod1", "prod2"],
    "data": { "stock": 100 },
    "userId": "seller-user-id"
  }'
```

### Using PowerShell

```powershell
# Test bulk operation
$body = @{
    action = "activate"
    ids = @("id1", "id2", "id3")
    userId = "user-id"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/admin/hero-slides/bulk" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $body
```

## Security Considerations

### 1. Permission Validation

All bulk endpoints MUST validate:

- User is authenticated
- User has required role
- User owns the resources (for seller scope)

### 2. Input Validation

- Validate action is allowed
- Validate IDs are valid format
- Validate data fields if present
- Limit batch size

### 3. Audit Logging

Log all bulk operations:

```typescript
console.log({
  timestamp: new Date().toISOString(),
  userId,
  action,
  resource: "products",
  count: ids.length,
  success: result.success,
});
```

## Performance Considerations

### Batch Processing

For large batches, process in chunks:

```typescript
const CHUNK_SIZE = 50;
const chunks = [];

for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
  chunks.push(ids.slice(i, i + CHUNK_SIZE));
}

for (const chunk of chunks) {
  await executeBulkOperation({
    // ... config with chunk
  });
}
```

### Async Processing

For very large operations (1000+ items), consider:

- Background job queue
- Webhooks for completion notification
- Progress tracking endpoint

## Troubleshooting

### Issue: "No items selected"

**Cause**: Empty `ids` array
**Solution**: Ensure IDs are selected before calling API

### Issue: "Permission denied"

**Cause**: Insufficient user role
**Solution**: Check user has required role (admin/seller)

### Issue: "Partial failures"

**Cause**: Some items failed validation
**Solution**: Check `errors` array in response for details

### Issue: "Transaction failed"

**Cause**: One item failed in transaction
**Solution**: Review validation logic, consider non-transactional approach

## Migration Guide

### From Custom to Utility

**Before:**

```typescript
// Custom implementation
for (const id of ids) {
  try {
    await db.collection("products").doc(id).update({ status: "active" });
  } catch (error) {
    // Handle error
  }
}
```

**After:**

```typescript
// Using utility
const result = await executeBulkOperation({
  collection: "products",
  action: "activate",
  ids,
  data: { status: "active" },
});
```

## Examples

See complete examples in:

- `src/app/api/admin/hero-slides/bulk/route.ts`
- `src/app/api/admin/categories/bulk/route.ts`
- `src/app/api/seller/products/bulk/route.ts`

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
