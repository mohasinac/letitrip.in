# Phase 6 API Design Reference

**Complete API specifications for all Phase 6 features**

---

## 🔌 API Design Principles

### Consistent Patterns (From Phases 2-5)

- ✅ RESTful endpoints
- ✅ Consistent response format
- ✅ Error handling with try-catch
- ✅ Firebase Admin SDK for database
- ✅ Authentication via Firebase Auth
- ✅ Role-based access (admin only)

### Response Format

```typescript
// Success
{
  success: true,
  data: { ... },
  message?: "Optional success message"
}

// Error
{
  success: false,
  error: "Error message"
}

// List with pagination
{
  success: true,
  data: [...],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

---

## 📦 Feature #14: Inventory Management API

### Base Path: `/api/admin/inventory`

#### GET /api/admin/inventory

**Purpose**: List all inventory items with pagination

**Query Parameters**:

```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 50
  locationId?: string;    // Filter by location
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  search?: string;        // Search by SKU or product name
  sortBy?: 'quantity' | 'name' | 'lastRestocked';
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      productId: string,
      productName: string,
      sku: string,
      locations: {
        [locationId: string]: {
          quantity: number,
          reserved: number,
          available: number
        }
      },
      totalQuantity: number,
      totalReserved: number,
      totalAvailable: number,
      lowStockThreshold: number,
      reorderPoint: number,
      status: 'in_stock' | 'low_stock' | 'out_of_stock',
      lastRestocked: string,
      createdAt: string,
      updatedAt: string
    }
  ],
  pagination: { ... }
}
```

#### GET /api/admin/inventory/:id

**Purpose**: Get single inventory item details

**Response**:

```typescript
{
  success: true,
  data: {
    // Same as list item above
    movements: [
      {
        id: string,
        type: 'adjustment' | 'transfer' | 'sale' | 'return' | 'audit',
        quantity: number,
        fromLocation?: string,
        toLocation?: string,
        reason: string,
        userId: string,
        userName: string,
        createdAt: string
      }
    ]
  }
}
```

#### POST /api/admin/inventory/adjust

**Purpose**: Adjust stock quantity

**Body**:

```typescript
{
  productId: string,
  locationId: string,
  quantity: number,        // Can be negative for decrease
  reason: string,
  type: 'adjustment' | 'restock' | 'damage' | 'audit'
}
```

#### POST /api/admin/inventory/transfer

**Purpose**: Transfer stock between locations

**Body**:

```typescript
{
  productId: string,
  fromLocationId: string,
  toLocationId: string,
  quantity: number,
  reason: string
}
```

#### GET /api/admin/inventory/movements

**Purpose**: Get stock movement history

**Query Parameters**:

```typescript
{
  productId?: string,
  locationId?: string,
  type?: string,
  startDate?: string,
  endDate?: string,
  page?: number,
  limit?: number
}
```

#### GET /api/admin/inventory/alerts

**Purpose**: Get low stock alerts

**Response**:

```typescript
{
  success: true,
  data: {
    lowStock: [
      { productId, productName, currentStock, threshold }
    ],
    outOfStock: [
      { productId, productName, locations }
    ],
    reorderNeeded: [
      { productId, productName, reorderPoint, currentStock }
    ]
  }
}
```

#### POST /api/admin/inventory/locations

**Purpose**: Create/update location

**Body**:

```typescript
{
  name: string,
  type: 'warehouse' | 'store' | 'supplier',
  address: string,
  capacity?: number,
  priority?: number,
  isActive: boolean
}
```

---

## 🔄 Feature #15: Returns & Refunds API

### Base Path: `/api/admin/returns`

#### GET /api/admin/returns

**Purpose**: List all return requests

**Query Parameters**:

```typescript
{
  status?: 'pending' | 'approved' | 'rejected' | 'received' | 'completed',
  userId?: string,
  startDate?: string,
  endDate?: string,
  page?: number,
  limit?: number
}
```

**Response**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      rmaNumber: string,
      orderId: string,
      orderNumber: string,
      userId: string,
      userName: string,
      userEmail: string,
      items: [
        {
          productId: string,
          productName: string,
          quantity: number,
          price: number,
          reason: string,
          condition: 'unopened' | 'used' | 'damaged'
        }
      ],
      status: string,
      totalAmount: number,
      refundAmount: number,
      restockingFee: number,
      requestDate: string,
      approvalDate?: string,
      adminNotes?: string,
      images: string[],
      createdAt: string,
      updatedAt: string
    }
  ],
  pagination: { ... },
  stats: {
    total: number,
    pending: number,
    approved: number,
    rejected: number,
    completed: number
  }
}
```

#### GET /api/admin/returns/:id

**Purpose**: Get single return details

#### PATCH /api/admin/returns/:id

**Purpose**: Update return status or add notes

**Body**:

```typescript
{
  status?: 'approved' | 'rejected' | 'received' | 'completed',
  adminNotes?: string,
  refundAmount?: number,
  restockingFee?: number
}
```

#### POST /api/admin/returns/:id/approve

**Purpose**: Approve return and generate RMA

**Response**:

```typescript
{
  success: true,
  data: {
    rmaNumber: string,
    approvalDate: string,
    shippingLabel?: string
  }
}
```

#### POST /api/admin/returns/:id/reject

**Purpose**: Reject return request

**Body**:

```typescript
{
  reason: string;
}
```

#### POST /api/admin/refunds

**Purpose**: Issue refund for approved return

**Body**:

```typescript
{
  returnId: string,
  amount: number,
  method: 'original' | 'store_credit' | 'bank_transfer',
  notes?: string
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    refundId: string,
    transactionId?: string,
    status: 'processing' | 'completed',
    processedAt: string
  }
}
```

#### GET /api/admin/refunds

**Purpose**: List all refunds

#### GET /api/admin/returns/policies

**Purpose**: Get return policies configuration

#### PUT /api/admin/returns/policies

**Purpose**: Update return policies

**Body**:

```typescript
{
  returnWindow: number,              // days
  eligibleCategories: string[],
  refundMethods: string[],
  restockingFee: number,            // percentage
  conditions: string[],
  exceptions: string[]
}
```

---

## 🎯 Feature #16: Marketing Campaigns API

### Base Path: `/api/admin/campaigns`

#### GET /api/admin/campaigns

**Purpose**: List all campaigns

**Query Parameters**:

```typescript
{
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed',
  type?: string,
  page?: number,
  limit?: number
}
```

**Response**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      description: string,
      type: 'flash_sale' | 'category_promo' | 'bundle' | 'tiered',
      status: string,
      startDate: string,
      endDate: string,
      discount: {
        type: 'percentage' | 'fixed' | 'bogo',
        value: number
      },
      products: {
        type: 'all' | 'selected' | 'category',
        count: number
      },
      stats: {
        views: number,
        clicks: number,
        orders: number,
        revenue: number
      },
      createdAt: string,
      updatedAt: string
    }
  ],
  pagination: { ... },
  stats: {
    total: number,
    active: number,
    scheduled: number,
    completed: number
  }
}
```

#### GET /api/admin/campaigns/:id

**Purpose**: Get single campaign details

**Response**: Full campaign object with all fields

#### POST /api/admin/campaigns

**Purpose**: Create new campaign

**Body**:

```typescript
{
  name: string,
  description: string,
  type: 'flash_sale' | 'category_promo' | 'bundle' | 'tiered',
  startDate: string,
  endDate: string,
  discount: {
    type: 'percentage' | 'fixed' | 'bogo' | 'tiered',
    value: number,
    tiers?: [
      { minAmount: number, discount: number }
    ]
  },
  targeting: {
    customerSegments?: string[],
    newCustomersOnly?: boolean,
    minOrderValue?: number,
    maxUses?: number,
    maxUsesPerUser?: number
  },
  products: {
    type: 'all' | 'selected' | 'category',
    ids?: string[],
    categoryIds?: string[],
    excludeIds?: string[]
  },
  bannerImage?: string,
  terms?: string
}
```

#### PUT /api/admin/campaigns/:id

**Purpose**: Update campaign (only if not active)

#### PATCH /api/admin/campaigns/:id/status

**Purpose**: Change campaign status

**Body**:

```typescript
{
  status: "active" | "paused" | "completed";
}
```

#### DELETE /api/admin/campaigns/:id

**Purpose**: Delete campaign (only if draft or completed)

#### GET /api/admin/campaigns/:id/stats

**Purpose**: Get detailed campaign analytics

**Response**:

```typescript
{
  success: true,
  data: {
    overview: {
      views: number,
      clicks: number,
      orders: number,
      revenue: number,
      conversionRate: number,
      averageOrderValue: number
    },
    timeline: [
      { date: string, orders: number, revenue: number }
    ],
    topProducts: [
      { productId, productName, sales, revenue }
    ],
    customerSegments: {
      new: number,
      returning: number
    }
  }
}
```

#### POST /api/admin/campaigns/:id/duplicate

**Purpose**: Create copy of campaign

---

## 📊 Feature #17: Advanced Analytics API

### Base Path: `/api/admin/reports` & `/api/admin/analytics`

#### GET /api/admin/reports

**Purpose**: List saved reports

**Response**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      description: string,
      type: 'sales' | 'customers' | 'products' | 'inventory',
      isTemplate: boolean,
      schedule?: {
        enabled: boolean,
        frequency: string
      },
      lastRun?: string,
      createdAt: string
    }
  ]
}
```

#### GET /api/admin/reports/:id

**Purpose**: Get report configuration and data

**Query Parameters**:

```typescript
{
  startDate?: string,
  endDate?: string,
  refresh?: boolean      // Force refresh data
}
```

#### POST /api/admin/reports

**Purpose**: Create custom report

**Body**:

```typescript
{
  name: string,
  description: string,
  type: string,
  config: {
    dateRange: {
      type: 'custom' | 'today' | 'week' | 'month',
      start?: string,
      end?: string
    },
    metrics: string[],        // ['revenue', 'orders', 'customers']
    dimensions: string[],     // ['date', 'product', 'category']
    filters: [
      { field: string, operator: string, value: any }
    ],
    chartType: 'line' | 'bar' | 'pie' | 'table',
    groupBy?: string,
    sortBy?: string,
    limit?: number
  },
  schedule?: {
    enabled: boolean,
    frequency: 'daily' | 'weekly' | 'monthly',
    time: string,
    recipients: string[],
    format: 'pdf' | 'excel' | 'csv'
  }
}
```

#### PUT /api/admin/reports/:id

**Purpose**: Update report configuration

#### DELETE /api/admin/reports/:id

**Purpose**: Delete saved report

#### POST /api/admin/reports/:id/export

**Purpose**: Export report data

**Body**:

```typescript
{
  format: 'pdf' | 'excel' | 'csv',
  dateRange?: { start: string, end: string }
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    downloadUrl: string,
    expiresAt: string
  }
}
```

#### GET /api/admin/analytics/sales

**Purpose**: Sales analytics

**Query Parameters**:

```typescript
{
  startDate: string,
  endDate: string,
  groupBy?: 'day' | 'week' | 'month',
  compareWith?: 'previous_period' | 'previous_year'
}
```

#### GET /api/admin/analytics/customers

**Purpose**: Customer analytics

#### GET /api/admin/analytics/products

**Purpose**: Product performance analytics

#### GET /api/admin/analytics/forecast

**Purpose**: Sales forecast using trends

**Response**:

```typescript
{
  success: true,
  data: {
    historical: [
      { date: string, actual: number }
    ],
    forecast: [
      { date: string, predicted: number, confidence: number }
    ],
    trend: 'up' | 'down' | 'stable',
    growth: number            // percentage
  }
}
```

---

## 🔧 Feature #18: Bulk Operations API

### Base Path: `/api/admin/bulk`

#### POST /api/admin/bulk/import

**Purpose**: Import data from CSV/Excel

**Body** (multipart/form-data):

```typescript
{
  file: File,
  type: 'products' | 'inventory' | 'prices',
  options: {
    updateExisting?: boolean,
    skipErrors?: boolean,
    dryRun?: boolean
  }
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    jobId: string,
    status: 'processing',
    preview?: {
      total: number,
      valid: number,
      errors: [
        { row: number, error: string }
      ]
    }
  }
}
```

#### POST /api/admin/bulk/export

**Purpose**: Export data to CSV/Excel

**Body**:

```typescript
{
  type: 'products' | 'inventory' | 'orders',
  filters?: { ... },
  fields: string[],
  format: 'csv' | 'excel'
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    downloadUrl: string,
    fileName: string,
    expiresAt: string
  }
}
```

#### POST /api/admin/bulk/update

**Purpose**: Bulk update multiple items

**Body**:

```typescript
{
  type: 'products' | 'inventory',
  ids: string[],
  updates: {
    [field: string]: any
  }
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    jobId: string,
    totalItems: number,
    status: 'processing'
  }
}
```

#### POST /api/admin/bulk/delete

**Purpose**: Bulk delete items

**Body**:

```typescript
{
  type: 'products' | 'categories',
  ids: string[]
}
```

#### GET /api/admin/bulk/jobs

**Purpose**: List all bulk jobs

**Query Parameters**:

```typescript
{
  status?: 'processing' | 'completed' | 'failed',
  type?: string,
  page?: number,
  limit?: number
}
```

#### GET /api/admin/bulk/jobs/:id

**Purpose**: Get job status and progress

**Response**:

```typescript
{
  success: true,
  data: {
    id: string,
    type: string,
    status: 'processing' | 'completed' | 'failed',
    totalItems: number,
    processedItems: number,
    successCount: number,
    errorCount: number,
    errors: [
      { itemId: string, error: string }
    ],
    startedAt: string,
    completedAt?: string,
    duration?: number         // seconds
  }
}
```

#### GET /api/admin/bulk/templates

**Purpose**: Get import templates

**Query Parameters**:

```typescript
{
  type: "products" | "inventory" | "prices";
}
```

**Response**: CSV/Excel file download

---

## 🤖 Feature #19: Automation & Alerts API

### Base Path: `/api/admin/automation`

#### GET /api/admin/automation/rules

**Purpose**: List all automation rules

**Response**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      name: string,
      description: string,
      trigger: {
        type: 'low_stock' | 'high_value_order' | 'abandoned_cart',
        conditions: { ... }
      },
      actions: [
        {
          type: 'email' | 'notification' | 'webhook',
          config: { ... }
        }
      ],
      isActive: boolean,
      lastTriggered?: string,
      triggerCount: number,
      createdAt: string
    }
  ]
}
```

#### POST /api/admin/automation/rules

**Purpose**: Create automation rule

**Body**:

```typescript
{
  name: string,
  description: string,
  trigger: {
    type: 'low_stock' | 'high_value_order' | 'abandoned_cart' |
          'failed_payment' | 'unusual_activity' | 'performance_drop',
    conditions: {
      // For low_stock
      threshold?: number,
      productIds?: string[],

      // For high_value_order
      minAmount?: number,

      // For abandoned_cart
      minutes?: number,

      // For performance_drop
      metric?: 'sales' | 'conversion',
      dropPercent?: number
    }
  },
  actions: [
    {
      type: 'email' | 'notification' | 'webhook' | 'auto_reorder',
      config: {
        // For email
        recipients?: string[],
        subject?: string,
        template?: string,

        // For notification
        severity?: 'info' | 'warning' | 'error',
        message?: string,

        // For webhook
        url?: string,
        method?: 'GET' | 'POST',

        // For auto_reorder
        quantity?: number,
        supplierId?: string
      }
    }
  ],
  schedule?: {
    type: 'continuous' | 'scheduled',
    frequency?: 'hourly' | 'daily' | 'weekly',
    time?: string
  },
  isActive: boolean
}
```

#### PUT /api/admin/automation/rules/:id

**Purpose**: Update automation rule

#### DELETE /api/admin/automation/rules/:id

**Purpose**: Delete automation rule

#### PATCH /api/admin/automation/rules/:id/toggle

**Purpose**: Enable/disable rule

**Body**:

```typescript
{
  isActive: boolean;
}
```

#### GET /api/admin/automation/history

**Purpose**: Get automation execution history

**Query Parameters**:

```typescript
{
  ruleId?: string,
  status?: 'success' | 'failed',
  startDate?: string,
  endDate?: string,
  page?: number,
  limit?: number
}
```

**Response**:

```typescript
{
  success: true,
  data: [
    {
      id: string,
      ruleId: string,
      ruleName: string,
      triggeredAt: string,
      status: 'success' | 'failed',
      actions: [
        {
          type: string,
          status: 'success' | 'failed',
          error?: string
        }
      ],
      context: { ... }         // Data that triggered the rule
    }
  ],
  pagination: { ... }
}
```

---

## 🔐 Authentication & Authorization

### All Endpoints Require:

```typescript
// Firebase Auth token in cookie or header
headers: {
  'Authorization': 'Bearer <firebase-token>'
}
// OR
cookies: {
  'session': '<session-cookie>'
}
```

### Role Check:

```typescript
// All Phase 6 endpoints require admin role
const user = await verifyAuth(request);
if (user.role !== "admin") {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 403 }
  );
}
```

---

## 🚀 Implementation Checklist

### For Each Feature:

#### 1. Create Route File

- [ ] Create `src/app/api/admin/[feature]/route.ts`
- [ ] Import required types and services
- [ ] Set up Firebase Admin

#### 2. Define Interfaces

- [ ] Create interfaces for all data models
- [ ] Export interfaces for component use

#### 3. Implement Endpoints

- [ ] GET (list) - with pagination
- [ ] GET (single) - by ID
- [ ] POST (create) - with validation
- [ ] PUT/PATCH (update) - partial updates
- [ ] DELETE (if needed)

#### 4. Error Handling

- [ ] Try-catch blocks
- [ ] Meaningful error messages
- [ ] Proper HTTP status codes
- [ ] Log errors for debugging

#### 5. Testing

- [ ] Test with curl/Postman
- [ ] Verify authentication works
- [ ] Test all query parameters
- [ ] Test edge cases

---

## 📚 Common Code Patterns

### Firebase Admin Setup

```typescript
import { adminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION_NAME = "collection_name";
```

### Pagination Helper

```typescript
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "50");
const offset = (page - 1) * limit;

const snapshot = await adminDb
  .collection(COLLECTION_NAME)
  .limit(limit)
  .offset(offset)
  .get();

const total = (await adminDb.collection(COLLECTION_NAME).count().get()).data()
  .count;
const totalPages = Math.ceil(total / limit);
```

### Error Response

```typescript
return NextResponse.json(
  {
    success: false,
    error: error.message || "Internal server error",
  },
  { status: 500 }
);
```

### Success Response

```typescript
return NextResponse.json({
  success: true,
  data: result,
  message: "Operation successful",
});
```

---

**Ready to implement!** Choose a feature and let's build the API first. 🚀
