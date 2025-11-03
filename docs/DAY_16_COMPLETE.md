# Day 16: Admin Advanced Features - COMPLETE ✅

**Date**: 2025-01-XX
**Sprint**: Sprint 4 - Admin Panel Part 2 + Seller Features (Days 16-20)
**Status**: COMPLETE
**Total Lines**: ~1,120 lines (refactored routes only)
**Total Routes**: 7 admin routes refactored
**TypeScript Errors**: 0

---

## Overview

Day 16 focused on refactoring admin advanced features for managing shipments, sales campaigns, reviews, and support tickets. Unlike Days 11-14, these routes do not use dedicated models but instead directly access Firestore collections with shared helper functions.

---

## Routes Refactored

### 1. Shipments Management (3 routes)

#### GET /api/admin/shipments

**File**: `src/app/api/admin/shipments/route.ts` (~180 lines)

**Purpose**: List all shipments from all sellers

**Query Parameters**:

- `status` (optional): Filter by status (pending, pickup_scheduled, in_transit, delivered, failed)
- `search` (optional): Search in trackingNumber, orderNumber, or carrier

**Features**:

- `enrichWithSellerInfo()` - Enriches each shipment with:
  - Seller email (from users collection)
  - Shop name (from shops collection)
- `calculateStats()` - Aggregates shipment counts:
  - total, pending, pickupScheduled, inTransit, delivered, failed
- Date handling: Converts Firestore timestamps to ISO strings

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "shipment123",
      "orderId": "order456",
      "trackingNumber": "TRK123456",
      "carrier": "BlueDart",
      "status": "in_transit",
      "sellerId": "seller789",
      "sellerEmail": "seller@example.com",
      "shopName": "Beyblade Masters",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T14:20:00.000Z",
      "shippedAt": "2025-01-15T12:00:00.000Z"
    }
  ],
  "stats": {
    "total": 150,
    "pending": 20,
    "pickupScheduled": 15,
    "inTransit": 80,
    "delivered": 30,
    "failed": 5
  }
}
```

#### POST /api/admin/shipments/[id]/cancel

**File**: `src/app/api/admin/shipments/[id]/cancel/route.ts` (~110 lines)

**Purpose**: Cancel a pending shipment

**Validation**:

- Only shipments with status "pending" can be cancelled
- Returns ValidationError for non-pending shipments

**Updates**:

- `status` → "failed"
- `cancelledAt` → current timestamp
- `cancelledBy` → admin user ID
- `updatedAt` → current timestamp

**TODO**: Integrate with shipping carrier API to actually cancel pickup

**Response**:

```json
{
  "success": true,
  "message": "Shipment cancelled successfully"
}
```

#### POST /api/admin/shipments/[id]/track

**File**: `src/app/api/admin/shipments/[id]/track/route.ts` (~100 lines)

**Purpose**: Update tracking information for a shipment

**Updates**:

- `updatedAt` → current timestamp
- `lastTracked` → current timestamp

**TODO**: Integrate with shipping carrier API (Shiprocket, etc.) to fetch real tracking updates

**Response**:

```json
{
  "success": true,
  "message": "Tracking updated successfully"
}
```

---

### 2. Sales Management (2 routes)

#### GET /api/admin/sales

**File**: `src/app/api/admin/sales/route.ts` (~190 lines, includes DELETE)

**Purpose**: List all sales campaigns from all sellers

**Query Parameters**:

- `status` (optional): Filter by status (active, inactive, scheduled, expired)
- `search` (optional): Search in sale name or description

**Features**:

- `enrichWithSellerInfo()` - Adds seller email and shop name
- Date handling: startDate, endDate converted to ISO strings
- Orders by createdAt desc

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "sale123",
      "name": "Summer Clearance Sale",
      "description": "Up to 50% off",
      "discountType": "percentage",
      "discountValue": 30,
      "status": "active",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.000Z",
      "sellerId": "seller789",
      "sellerEmail": "seller@example.com",
      "shopName": "Beyblade Masters",
      "createdAt": "2024-12-25T10:00:00.000Z"
    }
  ]
}
```

#### DELETE /api/admin/sales

**File**: Same as GET - `src/app/api/admin/sales/route.ts`

**Purpose**: Delete a sales campaign

**Request Body**:

```json
{
  "id": "sale123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Sale deleted successfully"
}
```

#### POST /api/admin/sales/[id]/toggle

**File**: `src/app/api/admin/sales/[id]/toggle/route.ts` (~100 lines)

**Purpose**: Toggle sale status between active and inactive

**Logic**:

- If current status is "active" → set to "inactive"
- If current status is anything else → set to "active"

**Updates**:

- `status` → toggled value
- `updatedAt` → current timestamp

**Response**:

```json
{
  "success": true,
  "message": "Sale status updated successfully",
  "data": {
    "status": "active"
  }
}
```

---

### 3. Reviews Moderation (1 route with 3 methods)

#### GET /api/admin/reviews

**File**: `src/app/api/admin/reviews/route.ts` (~240 lines, includes PATCH and DELETE)

**Purpose**: List all product reviews with moderation filters

**Query Parameters**:

- `status` (optional): Filter by status (pending, approved, rejected)
- `productId` (optional): Filter by specific product
- `rating` (optional): Filter by rating (1-5)
- `search` (optional): Search in userName, title, or comment

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "review123",
      "productId": "prod456",
      "userId": "user789",
      "userName": "John Doe",
      "rating": 5,
      "title": "Excellent product!",
      "comment": "Fast delivery and great quality",
      "status": "approved",
      "adminNote": null,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### PATCH /api/admin/reviews?id=reviewId

**File**: Same as GET - `src/app/api/admin/reviews/route.ts`

**Purpose**: Update review status (moderate reviews)

**Request Body**:

```json
{
  "status": "approved",
  "adminNote": "Verified purchase"
}
```

**Side Effects**:

- If status changes to "approved": triggers `updateProductRating(productId)`
- Recalculates product's average rating and review count

**Response**:

```json
{
  "success": true,
  "message": "Review updated successfully"
}
```

#### DELETE /api/admin/reviews?id=reviewId

**File**: Same as GET - `src/app/api/admin/reviews/route.ts`

**Purpose**: Delete a review

**Side Effects**:

- If review was approved: updates product rating
- Recalculates average from remaining approved reviews

**Response**:

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### Helper Function: updateProductRating(productId)

**Purpose**: Recalculate product rating after review changes

**Logic**:

1. Fetch all approved reviews for product
2. Calculate average rating (rounded to 1 decimal)
3. Update product document with:
   - `rating` → average of approved reviews
   - `reviewCount` → count of approved reviews
4. Handle case of zero reviews (sets rating to 0)

---

### 4. Support Tickets (2 routes)

#### GET /api/admin/support

**File**: `src/app/api/admin/support/route.ts` (~200 lines, includes POST)

**Purpose**: List all support tickets

**Query Parameters**:

- `status` (optional): Filter by status (open, in_progress, resolved, closed)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "ticket123",
      "ticketNumber": "TKT-1705323456789-abc123",
      "userId": "user456",
      "userEmail": "user@example.com",
      "userName": "Jane Smith",
      "subject": "Order not received",
      "status": "in_progress",
      "priority": "high",
      "category": "order_issue",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "totalPages": 5
  }
}
```

#### POST /api/admin/support

**File**: Same as GET - `src/app/api/admin/support/route.ts`

**Purpose**: Create support ticket on behalf of a user

**Request Body**:

```json
{
  "subject": "Refund request",
  "description": "Customer wants refund for order #123",
  "category": "refund",
  "priority": "medium",
  "userId": "user456",
  "userEmail": "user@example.com",
  "userName": "Jane Smith"
}
```

**Features**:

- Generates unique ticket number: `TKT-{timestamp}-{random}`
- Creates initial message from description
- Records `createdBy` with admin user ID

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "ticket789",
    "ticketNumber": "TKT-1705323456789-xyz789"
  },
  "message": "Ticket created successfully"
}
```

---

## Technical Patterns Established

### 1. Authentication Pattern

All routes use the same `verifyAdminAuth` helper:

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

### 2. Seller Enrichment Pattern

Reused across shipments, sales routes:

```typescript
async function enrichWithSellerInfo(items: any[]) {
  const db = getAdminDb();

  const enriched = await Promise.all(
    items.map(async (item) => {
      if (item.sellerId) {
        try {
          const userDoc = await db.collection("users").doc(item.sellerId).get();
          const userData = userDoc.data();

          const shopQuery = await db
            .collection("shops")
            .where("sellerId", "==", item.sellerId)
            .limit(1)
            .get();

          const shopData = shopQuery.docs[0]?.data();

          return {
            ...item,
            sellerEmail: userData?.email || null,
            shopName: shopData?.name || null,
          };
        } catch (error) {
          return {
            ...item,
            sellerEmail: null,
            shopName: null,
          };
        }
      }
      return item;
    })
  );

  return enriched;
}
```

### 3. Stats Calculation Pattern

Used in shipments route:

```typescript
function calculateStats(shipments: any[]) {
  return {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "pending").length,
    pickupScheduled: shipments.filter((s) => s.status === "pickup_scheduled")
      .length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    delivered: shipments.filter((s) => s.status === "delivered").length,
    failed: shipments.filter((s) => s.status === "failed").length,
  };
}
```

### 4. Next.js 15 Async Params Pattern

All dynamic routes use:

```typescript
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const itemId = params.id;
  // ... rest of logic
}
```

### 5. Custom Error Classes

Consistent error handling:

```typescript
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from "../../../../_lib/middleware/error-handler";

// Usage:
throw new AuthorizationError("Admin access required");
throw new ValidationError("Shipment ID is required");
throw new NotFoundError("Shipment not found");
```

---

## Legacy Preservation

All original routes backed up to `_legacy/admin/`:

1. `_legacy/admin/shipments/route.ts` (~130 lines)
2. `_legacy/admin/shipments/[id]/track/route.ts` (~80 lines)
3. `_legacy/admin/shipments/[id]/cancel/route.ts` (~90 lines)
4. `_legacy/admin/sales/route.ts` (~165 lines)
5. `_legacy/admin/sales/[id]/toggle/route.ts` (~80 lines)
6. `_legacy/admin/reviews/route.ts` (~175 lines)
7. `_legacy/admin/support/route.ts` (~180 lines)
8. `_legacy/admin/support/route-new.ts` (~180 lines, duplicate)
9. `_legacy/admin/support/stats/route.ts` (~100 lines, not refactored)

**Total Legacy Preserved**: ~1,200 lines

---

## Key Differences from Days 11-14

### No Dedicated Models

Days 11-14 created dedicated models for:

- ProductModel, OrderModel, UserModel, etc.
- Clear separation between routes and database logic

Day 16 routes directly access Firestore:

- No model layer needed for simple admin operations
- Helper functions provide code reuse
- Faster development for CRUD operations

### Why No Models?

1. **Simple Operations**: List, filter, update status - don't need complex business logic
2. **Admin Context**: These routes are admin-only, not used by multiple user roles
3. **Enrichment Pattern**: Seller info enrichment is route-specific
4. **Stats Calculation**: Simple aggregations don't warrant separate model layer

### When to Use Models vs Direct Access?

**Use Models When**:

- Complex business logic (order processing, payment validation)
- Multiple user roles access same data (products, orders)
- Reusable across many routes
- Need transaction support
- Complex validation rules

**Use Direct Access When**:

- Simple CRUD operations
- Admin-only routes
- Route-specific logic (enrichment, stats)
- Quick filters and searches
- One-off operations

---

## Testing Checklist

### Unit Tests Needed

- [ ] verifyAdminAuth helper
- [ ] enrichWithSellerInfo helper
- [ ] calculateStats helper
- [ ] updateProductRating helper

### Integration Tests Needed

- [ ] GET /api/admin/shipments (with filters)
- [ ] POST /api/admin/shipments/[id]/cancel (validation)
- [ ] POST /api/admin/shipments/[id]/track
- [ ] GET /api/admin/sales (with seller info)
- [ ] DELETE /api/admin/sales
- [ ] POST /api/admin/sales/[id]/toggle
- [ ] GET /api/admin/reviews (with filters)
- [ ] PATCH /api/admin/reviews (product rating update)
- [ ] DELETE /api/admin/reviews (product rating recalculation)
- [ ] GET /api/admin/support (with pagination)
- [ ] POST /api/admin/support (ticket creation)

### Manual Testing Scenarios

1. **Shipments**:

   - Filter by status (pending, in_transit, etc.)
   - Search by tracking number
   - Cancel pending shipment
   - Try to cancel delivered shipment (should fail)
   - Update tracking info

2. **Sales**:

   - List all sales with seller info
   - Toggle active/inactive status
   - Delete sale campaign
   - Search by sale name

3. **Reviews**:

   - List pending reviews
   - Approve review → verify product rating updates
   - Reject review with admin note
   - Delete approved review → verify product rating recalculates
   - Search by user name

4. **Support**:
   - List tickets with status filter
   - Filter by priority
   - Paginate through tickets (50 per page)
   - Create ticket for user
   - Verify ticket number generation

---

## TODO Items

### Shipping Integration

- [ ] Integrate with Shiprocket API for shipment tracking
- [ ] Implement real-time tracking updates
- [ ] Add webhook handler for carrier status updates
- [ ] Cancel pickup via carrier API (in cancel endpoint)

### Support Stats Route

- [ ] Decide if admin/support/stats needs refactoring
- [ ] Consider merging stats into main GET endpoint
- [ ] Or remove if not actively used

### Enhanced Features

- [ ] Bulk shipment operations (cancel multiple, update multiple)
- [ ] Export shipments to CSV
- [ ] Analytics dashboard for shipment performance
- [ ] Email notifications for review moderation
- [ ] Support ticket assignment to agents

---

## Performance Considerations

### Optimizations Implemented

1. **Parallel Enrichment**: Uses `Promise.all` for seller info lookups
2. **Client-side Filtering**: Search performed in-memory (consider moving to Firestore queries for large datasets)
3. **Pagination**: Support tickets paginated (50 per page default)

### Potential Optimizations

1. **Caching**: Cache seller info (email, shop name) to reduce lookups
2. **Firestore Queries**: Move search filters to Firestore queries for better performance
3. **Indexes**: Ensure Firestore indexes exist for:
   - shipments: status, createdAt
   - sales: status, sellerId, createdAt
   - reviews: status, productId, rating
   - support_tickets: status, priority, createdAt

---

## Summary

**Day 16 Achievements**:

- ✅ 7 admin routes refactored (~1,120 lines)
- ✅ 0 TypeScript errors
- ✅ Legacy code preserved (~1,200 lines)
- ✅ Consistent MVC pattern
- ✅ RBAC enforcement (admin-only)
- ✅ Next.js 15 compatibility

**Key Features**:

- Shipment management with tracking and cancellation
- Sales campaign management with status toggle
- Review moderation with automatic product rating updates
- Support ticket management with pagination

**Technical Patterns**:

- verifyAdminAuth helper (reusable auth check)
- enrichWithSellerInfo pattern (seller data enrichment)
- calculateStats pattern (aggregation helper)
- updateProductRating pattern (side effect management)
- Next.js 15 async params for dynamic routes
- Custom error classes for consistent error handling

**Next Steps**: Day 17 - Admin Bulk Operations (4 routes, ~400-500 lines)
