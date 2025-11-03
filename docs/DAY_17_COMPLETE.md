# Day 17: Admin Bulk Operations - COMPLETE ✅

**Date**: 2025-01-XX
**Sprint**: Sprint 4 - Admin Panel Part 2 + Seller Features (Days 16-20)
**Status**: COMPLETE
**Total Lines**: ~640 lines (refactored routes only)
**Total Routes**: 4 admin routes refactored
**TypeScript Errors**: 0

---

## Overview

Day 17 focused on refactoring admin bulk operation routes for managing large-scale data operations across multiple collections. These routes enable admins to perform batch updates, deletes, imports, and exports efficiently using Firestore batch operations.

---

## Routes Refactored

### 1. Bulk Operations Management (2 routes)

#### GET /api/admin/bulk

**File**: `src/app/api/admin/bulk/route.ts` (~500 lines total, includes POST)

**Purpose**: List all bulk jobs with filtering and pagination

**Query Parameters**:

- `status` (optional): Filter by status (pending, processing, completed, failed)
- `type` (optional): Filter by type (import, export, update, delete)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Features**:

- Pagination support (50 items per page default)
- Filter by job status and type
- Orders by creation date (newest first)
- Converts Firestore timestamps to ISO strings

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "job123",
      "type": "update",
      "entity": "products",
      "status": "completed",
      "totalItems": 500,
      "processedItems": 500,
      "successCount": 498,
      "errorCount": 2,
      "errors": [{ "itemId": "prod123", "error": "Product not found" }],
      "userId": "admin123",
      "startedAt": "2025-01-15T10:00:00.000Z",
      "completedAt": "2025-01-15T10:05:30.000Z",
      "duration": 330,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:05:30.000Z"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

#### POST /api/admin/bulk

**File**: Same as GET - `src/app/api/admin/bulk/route.ts`

**Purpose**: Create and execute bulk operation (update, delete, or import)

**Request Body**:

```json
{
  "operation": "update",
  "entity": "products",
  "data": [
    {
      "id": "prod123",
      "updates": {
        "status": "active",
        "featured": true
      }
    }
  ],
  "options": {
    "updateExisting": true
  }
}
```

**Supported Operations**:

1. **update**: Batch update existing documents
   - Requires: `id` and `updates` in each data item
   - Uses Firestore batch.update()
2. **delete**: Batch delete documents
   - Requires: Array of document IDs or objects with `id`
   - Uses Firestore batch.delete()
3. **import**: Batch create/insert documents
   - Creates new documents or updates existing (with options.updateExisting)
   - Validates entity-specific required fields
   - Uses Firestore batch.set()

**Supported Entities**:

- `products` (→ products collection)
- `inventory` (→ inventory_items collection)
- `categories` (→ categories collection)
- `orders` (→ orders collection)

**Features**:

- **Job Tracking**: Creates bulk_jobs document for progress monitoring
- **Progress Updates**: Updates every 10 items processed
- **Error Tracking**: Stores up to 100 errors per job
- **Batch Commits**: Commits every 500 operations (Firestore limit)
- **Performance Metrics**: Tracks duration and success/error counts
- **Validation**: Entity-specific field validation for imports

**Response**:

```json
{
  "success": true,
  "data": {
    "jobId": "job456",
    "status": "completed",
    "totalItems": 500,
    "successCount": 498,
    "errorCount": 2,
    "duration": 330
  },
  "message": "Bulk update operation completed"
}
```

**Entity Validation Rules** (for import):

- **products**: Requires `name` and `price`
- **inventory**: Requires `productId` and `quantity`
- **categories**: Requires `name`

---

### 2. Bulk Job Status

#### GET /api/admin/bulk/[id]

**File**: `src/app/api/admin/bulk/[id]/route.ts` (~95 lines)

**Purpose**: Get detailed status of a specific bulk job

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "job123",
    "type": "update",
    "entity": "products",
    "status": "processing",
    "totalItems": 1000,
    "processedItems": 450,
    "successCount": 448,
    "errorCount": 2,
    "errors": [
      { "itemId": "prod123", "error": "Document not found" },
      { "itemId": "prod456", "error": "Invalid price value" }
    ],
    "userId": "admin123",
    "startedAt": "2025-01-15T10:00:00.000Z",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:02:30.000Z"
  }
}
```

**Use Cases**:

- Poll for job completion status
- Display progress bars in UI
- Show error details to admin
- Monitor long-running operations

---

### 3. Bulk Export

#### POST /api/admin/bulk/export

**File**: `src/app/api/admin/bulk/export/route.ts` (~190 lines)

**Purpose**: Export collection data to CSV or Excel format

**Request Body**:

```json
{
  "entity": "products",
  "filters": {
    "status": "active",
    "sellerId": "seller123"
  },
  "fields": ["id", "name", "price", "quantity", "status"],
  "format": "excel"
}
```

**Parameters**:

- `entity` (required): Collection to export (products, orders, users, etc.)
- `filters` (optional): Object with field-value pairs for filtering
- `fields` (optional): Array of field names to include (if omitted, exports all fields)
- `format` (optional): `csv` (default) or `excel`

**Supported Entities**:

- products
- inventory
- categories
- orders
- users
- reviews
- shipments
- sales
- coupons

**Features**:

- **Filtering**: Apply Firestore where clauses
- **Field Selection**: Export only specified fields
- **Date Conversion**: Converts Firestore timestamps to ISO strings
- **Dual Format**: CSV or Excel (.xlsx) export
- **Automatic Download**: Returns file with proper Content-Disposition header

**Response**: Binary file download

- **CSV**: `text/csv` with filename `{entity}_export_{timestamp}.csv`
- **Excel**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` with filename `{entity}_export_{timestamp}.xlsx`

**Example Export Files**:

- `products_export_1705323456789.csv`
- `orders_export_1705323456789.xlsx`

---

### 4. Product Migration

#### POST /api/admin/migrate-products

**File**: `src/app/api/admin/migrate-products/route.ts` (~175 lines)

**Purpose**: Migrate products from legacy `seller_products` collection to `products` collection

**Features**:

- **Data Transformation**: Restructures legacy product data to new schema
- **Duplicate Prevention**: Skips products that already exist in target collection
- **Batch Processing**: Uses Firestore batches (450 items per batch)
- **Error Tracking**: Captures individual product migration errors
- **Progress Logging**: Console logs for monitoring progress

**Data Transformation**:

```typescript
// Legacy structure (seller_products)
{
  name: "Product Name",
  pricing: { price: 100, compareAtPrice: 150 },
  inventory: { quantity: 50, sku: "SKU123" },
  seo: { slug: "product-slug" },
  categoryId: "cat123"
}

// New structure (products)
{
  name: "Product Name",
  price: 100,
  compareAtPrice: 150,
  quantity: 50,
  sku: "SKU123",
  slug: "product-slug",
  category: "cat123",
  categoryId: "cat123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Migration completed successfully",
  "stats": {
    "migrated": 450,
    "skipped": 50,
    "errors": 2,
    "total": 502
  },
  "errors": [
    { "product": "Invalid Product", "error": "Missing required field: name" }
  ]
}
```

**Use Cases**:

- One-time migration from legacy schema
- Data structure updates
- Collection consolidation
- Testing with production data copy

---

## Technical Patterns Established

### 1. Authentication Pattern

All routes use the same `verifyAdminAuth` helper (consistent with Day 16):

```typescript
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Authentication required");
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || "user";

    if (role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    return {
      uid: decodedToken.uid,
      role: role as "admin",
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError("Invalid or expired token");
  }
}
```

### 2. Batch Processing Pattern

Firestore batch operations with 500-item limit:

```typescript
const batch = db.batch();
let batchCount = 0;

for (const item of data) {
  // Perform operation
  batch.update(docRef, updates);
  batchCount++;

  // Commit when reaching limit
  if (batchCount >= 500) {
    await batch.commit();
    batchCount = 0;
  }
}

// Commit remaining items
if (batchCount > 0) {
  await batch.commit();
}
```

### 3. Progress Tracking Pattern

Update job status periodically:

```typescript
// Update every 10 items
if ((i + 1) % 10 === 0) {
  await db
    .collection("bulk_jobs")
    .doc(jobId)
    .update({
      processedItems: i + 1,
      successCount,
      errorCount,
      errors: errors.slice(0, 100), // Max 100 errors
      updatedAt: new Date(),
    });
}
```

### 4. Error Collection Pattern

Capture errors without stopping operation:

```typescript
const errors: Array<{ itemId: string; error: string }> = [];

for (const item of data) {
  try {
    // Process item
  } catch (error: any) {
    errorCount++;
    errors.push({ itemId: item.id, error: error.message });
  }
}

// Store limited errors (max 100)
await db
  .collection("bulk_jobs")
  .doc(jobId)
  .update({
    errors: errors.slice(0, 100),
  });
```

### 5. Entity Validation Pattern

Validate data before import:

```typescript
function validateEntityData(entity: string, data: any): void {
  switch (entity) {
    case "products":
      if (!data.name) throw new Error("Product name is required");
      if (!data.price) throw new Error("Product price is required");
      break;
    case "inventory":
      if (!data.productId) throw new Error("Product ID is required");
      if (data.quantity === undefined) throw new Error("Quantity is required");
      break;
    case "categories":
      if (!data.name) throw new Error("Category name is required");
      break;
  }
}
```

### 6. Collection Mapping Pattern

Map entity names to collection names:

```typescript
function getCollectionName(entity: string): string {
  const collectionMap: { [key: string]: string } = {
    products: "products",
    inventory: "inventory_items",
    categories: "categories",
    orders: "orders",
    users: "users",
  };
  return collectionMap[entity] || entity;
}
```

---

## Legacy Preservation

All original routes backed up to `_legacy/admin/`:

1. `_legacy/admin/bulk/route.ts` (~550 lines)
2. `_legacy/admin/bulk/[id]/route.ts` (~45 lines)
3. `_legacy/admin/bulk/export/route.ts` (~120 lines)
4. `_legacy/admin/migrate-products/route.ts` (~150 lines)

**Total Legacy Preserved**: ~865 lines

---

## Performance Considerations

### Batch Optimization

- **Firestore Limit**: 500 operations per batch
- **Safety Margin**: Commit at 450-500 items to avoid errors
- **Parallelism**: Could be improved with parallel batch processing

### Progress Updates

- **Update Frequency**: Every 10 items
- **Trade-off**: Balance between real-time updates and Firestore write costs
- **Optimization**: Could use exponential backoff (update less frequently for larger jobs)

### Error Storage

- **Limit**: Store max 100 errors per job
- **Rationale**: Prevent document size explosion
- **Alternative**: Store full error log in separate collection or Cloud Storage

### Export Performance

- **Filtering**: Done at Firestore query level (efficient)
- **Date Conversion**: Done in-memory (fast)
- **File Generation**: XLSX library efficient for up to ~10,000 rows
- **Large Exports**: Consider streaming or pagination for >50,000 rows

---

## Bulk Job Schema

The `bulk_jobs` collection stores job metadata:

```typescript
interface BulkJob {
  id: string;
  type: "import" | "export" | "update" | "delete";
  entity: "products" | "inventory" | "categories" | "orders";
  status: "pending" | "processing" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ itemId: string; error: string }>;
  userId: string; // Admin who created the job
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // Seconds
  fileUrl?: string; // For imports (source file)
  downloadUrl?: string; // For exports (result file)
  createdAt: Date;
  updatedAt: Date;
}
```

**Firestore Indexes Needed**:

- `status` (ascending), `createdAt` (descending)
- `type` (ascending), `createdAt` (descending)
- `userId` (ascending), `createdAt` (descending)

---

## Testing Checklist

### Unit Tests Needed

- [ ] verifyAdminAuth helper
- [ ] processBulkUpdate function
- [ ] processBulkDelete function
- [ ] processBulkImport function
- [ ] getCollectionName helper
- [ ] validateEntityData helper

### Integration Tests Needed

- [ ] GET /api/admin/bulk (list jobs)
- [ ] POST /api/admin/bulk (update operation)
- [ ] POST /api/admin/bulk (delete operation)
- [ ] POST /api/admin/bulk (import operation)
- [ ] GET /api/admin/bulk/[id] (job status)
- [ ] POST /api/admin/bulk/export (CSV format)
- [ ] POST /api/admin/bulk/export (Excel format)
- [ ] POST /api/admin/migrate-products

### Manual Testing Scenarios

1. **Bulk Update**:

   - Update 100 products status to "active"
   - Update 50 inventory quantities
   - Verify progress updates every 10 items
   - Check error handling for invalid product IDs

2. **Bulk Delete**:

   - Delete 20 test products
   - Verify batch commits at 500 items
   - Check error tracking for non-existent items

3. **Bulk Import**:

   - Import 500 new products from CSV
   - Import with updateExisting option
   - Test validation (missing required fields)
   - Verify duplicate prevention

4. **Export**:

   - Export all products to CSV
   - Export filtered products (status=active) to Excel
   - Export with field selection (5 fields only)
   - Verify date formatting in exports

5. **Product Migration**:

   - Run migration with test seller_products data
   - Verify data transformation correctness
   - Check duplicate skipping logic
   - Monitor batch commit logs

6. **Job Tracking**:
   - Create bulk job and poll status endpoint
   - Verify progress updates
   - Check completion status changes
   - Verify error details captured

---

## Common Use Cases

### 1. Price Update Campaign

**Scenario**: Update prices for 500 products in a specific category

**Request**:

```json
POST /api/admin/bulk
{
  "operation": "update",
  "entity": "products",
  "data": [
    { "id": "prod1", "updates": { "price": 99.99 } },
    { "id": "prod2", "updates": { "price": 149.99 } }
    // ... 498 more items
  ]
}
```

### 2. Inventory Sync

**Scenario**: Bulk import inventory from warehouse management system

**Request**:

```json
POST /api/admin/bulk
{
  "operation": "import",
  "entity": "inventory",
  "data": [
    { "productId": "prod1", "quantity": 100, "location": "WH-A" },
    { "productId": "prod2", "quantity": 50, "location": "WH-B" }
    // ... more items
  ],
  "options": { "updateExisting": true }
}
```

### 3. Cleanup Inactive Products

**Scenario**: Delete products with zero quantity and inactive status

**Steps**:

1. Export products with filters: `{ "quantity": 0, "status": "inactive" }`
2. Review exported CSV
3. Delete using bulk operation with product IDs

### 4. Monthly Reports

**Scenario**: Export all completed orders from last month

**Request**:

```json
POST /api/admin/bulk/export
{
  "entity": "orders",
  "filters": { "status": "delivered" },
  "fields": ["id", "orderNumber", "total", "createdAt", "customerId"],
  "format": "excel"
}
```

### 5. Data Migration

**Scenario**: Migrate from legacy product structure

**Steps**:

1. Run `POST /api/admin/migrate-products`
2. Monitor console logs
3. Review migration stats
4. Handle errors manually if needed

---

## Error Handling

### Validation Errors (400)

- Missing operation or entity
- Invalid operation type
- Invalid entity type
- Empty data array
- Invalid format (for export)

### Authorization Errors (401/403)

- Missing authorization header
- Invalid or expired token
- Non-admin user attempting access

### Not Found Errors (404)

- Bulk job not found (GET /api/admin/bulk/[id])

### Server Errors (500)

- Firestore operation failures
- Batch commit errors
- File generation errors (export)
- Migration errors

---

## TODO Items

### Short-term

- [ ] Add authentication to all routes (currently implemented)
- [ ] Add rate limiting for bulk operations
- [ ] Implement job cancellation endpoint (DELETE /api/admin/bulk/[id])
- [ ] Add email notifications on job completion

### Medium-term

- [ ] Implement file upload for import operations
- [ ] Add support for more entity types (users, reviews, etc.)
- [ ] Create admin dashboard for bulk operations
- [ ] Add scheduled bulk operations (cron jobs)

### Long-term

- [ ] Optimize large exports with streaming
- [ ] Add parallel batch processing
- [ ] Implement retry logic for failed items
- [ ] Create audit log for all bulk operations
- [ ] Add webhooks for job completion

---

## Summary

**Day 17 Achievements**:

- ✅ 4 admin bulk operation routes refactored (~640 lines)
- ✅ 0 TypeScript errors
- ✅ Legacy code preserved (~865 lines)
- ✅ Consistent MVC pattern
- ✅ RBAC enforcement (admin-only)
- ✅ Next.js 15 compatibility

**Key Features**:

- Bulk update, delete, and import operations
- Job tracking and progress monitoring
- CSV and Excel export functionality
- Product migration from legacy schema
- Batch processing with error handling

**Technical Patterns**:

- verifyAdminAuth helper (reusable)
- Firestore batch operations (500-item limit)
- Progress tracking (every 10 items)
- Error collection (max 100 errors)
- Entity validation (import safety)
- Collection name mapping (flexibility)

**Next Steps**: Day 18 - Seller Product & Order Management (10 routes, ~1,000 lines estimated)
