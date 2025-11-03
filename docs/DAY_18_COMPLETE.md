# ✅ Day 18: Seller Product & Order Management - COMPLETE

**Date:** November 3, 2025  
**Status:** ✅ **COMPLETE**  
**Lines Written:** ~1,960 lines  
**Routes Refactored:** 10 routes (4 product + 6 order)  
**TypeScript Errors:** 0 ✅  
**Legacy Preserved:** 100% (~3,000 lines backed up)

---

## 📋 Overview

Day 18 focused on refactoring **seller product and order management routes**. These routes enable sellers to manage their products (create, update, delete, upload media) and handle order workflows (approve, reject, cancel, generate invoices).

### Key Features Implemented:

- ✅ Product CRUD operations with Firebase Storage integration
- ✅ File upload handling (images/videos) with validation
- ✅ Order status management (approve, reject, cancel)
- ✅ Invoice generation with HTML templating
- ✅ Seller ownership verification (RBAC)
- ✅ 3-day cancellation policy enforcement
- ✅ Alert system integration

---

## 🎯 Completed Routes (10 Routes)

### **Product Routes (4 routes, ~1,070 lines)**

#### 1. **seller/products/categories/leaf** (~150 lines)

```typescript
GET / api / seller / products / categories / leaf;
```

**Purpose:** List all leaf categories (categories without children) for product assignment

**Features:**

- Fetches all active categories from Firestore
- Filters to leaf categories only (`childIds.length === 0`)
- Builds hierarchical paths from leaf to root
- Returns `pathString` for UI display (e.g., "Electronics > Phones > Smartphones")
- Sorted by pathString for better organization

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Smartphones",
      "slug": "smartphones",
      "level": 2,
      "path": ["electronics", "phones", "smartphones"],
      "pathString": "Electronics > Phones > Smartphones",
      "icon": "phone-icon.svg",
      "sortOrder": 1
    }
  ]
}
```

---

#### 2. **seller/products/media** (~180 lines)

```typescript
POST / api / seller / products / media;
```

**Purpose:** Upload product images and videos to Firebase Storage

**Features:**

- Handles `multipart/form-data` file uploads
- Validates file size: 10MB (images), 50MB (videos)
- Validates file type (image/_ or video/_)
- Uploads to Firebase Storage: `sellers/{sellerId}/products/{slug}/`
- Makes files publicly accessible
- Returns public URLs for uploaded files

**Request:**

```typescript
FormData {
  files: File[], // Multiple files
  slug: string,  // Product slug (must start with 'buy-')
  type: 'image' | 'video'
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "url": "https://storage.googleapis.com/.../img1-1234567890.jpg",
      "path": "sellers/uid123/products/buy-smartphone/img1-1234567890.jpg",
      "name": "img1-1234567890.jpg",
      "size": 2048000,
      "type": "image/jpeg"
    }
  ],
  "message": "Successfully uploaded 1 file(s)"
}
```

**Storage Structure:**

```
sellers/
  {sellerId}/
    products/
      {slug}/
        img1-1234567890.jpg
        img2-1234567890.jpg
        v1-1234567890.mp4
```

---

#### 3. **seller/products** (~350 lines)

```typescript
GET / api / seller / products;
POST / api / seller / products;
```

**GET: List seller's products**

- Query params: `status`, `search`, `category`
- Returns products with filters applied
- Client-side search on name/SKU/slug

**POST: Create new product**

**Validation Chain:**

1. ✅ Required fields: name, categoryId, pricing, inventory, seo
2. ✅ SKU uniqueness (within seller's products)
3. ✅ Slug uniqueness (globally)
4. ✅ Category must be a leaf category (no children)
5. ✅ Category must be active

**Product Structure:**

```typescript
{
  sellerId: string,
  name: string,
  shortDescription: string,
  description: string,
  categoryId: string,
  categoryName: string,
  tags: string[],
  sku: string,

  pricing: {
    price: number,
    compareAtPrice: number | null,
    cost: number | null
  },

  inventory: {
    quantity: number,
    lowStockThreshold: number,
    trackInventory: boolean,
    isUnique: boolean,
    sku: string
  },

  media: {
    images: Array<{ url, path, name, size, type }>,
    videos: Array<{ url, path, name, size, type }>
  },

  seo: {
    title: string,
    description: string,
    keywords: string[],
    slug: string  // Must start with 'buy-'
  },

  status: 'draft' | 'active' | 'archived',

  stats: {
    views: 0,
    sales: 0,
    revenue: 0
  }
}
```

---

#### 4. **seller/products/[id]** (~390 lines)

```typescript
GET / api / seller / products / [id];
PUT / api / seller / products / [id];
DELETE / api / seller / products / [id];
```

**GET: Fetch product by ID**

- Ownership verification (seller can only see their products)
- Returns product with converted timestamps

**PUT: Update product**

**Advanced Features:**

1. **SKU Validation:** Check uniqueness if changed
2. **Slug Validation:** Check uniqueness if changed
3. **Storage Folder Renaming:** If slug changes:
   - Rename folder in Firebase Storage
   - Update media URLs in product data
4. **Category Revalidation:** Ensure still leaf and active

**Helper Functions:**

```typescript
// Delete all files in a storage folder
async function deleteStorageFolder(sellerId, slug);

// Rename storage folder when slug changes
async function renameStorageFolder(sellerId, oldSlug, newSlug);

// Update media URLs in product data
function updateMediaURLs(media, oldSlug, newSlug);
```

**DELETE: Remove product**

- Deletes product document from Firestore
- Deletes all media files from Firebase Storage
- Uses `deleteStorageFolder()` helper

---

### **Order Routes (6 routes, ~890 lines)**

#### 5. **seller/orders** (~200 lines)

```typescript
GET / api / seller / orders;
```

**Purpose:** List all orders for authenticated seller

**Features:**

- Query params: `status`, `search`, `limit` (default: 50)
- Sellers see only their orders
- Admins see all orders
- Client-side search on orderNumber/customerName/email
- Returns order statistics

**Response:**

```json
{
  "success": true,
  "data": [
    /* orders */
  ],
  "stats": {
    "total": 150,
    "pendingApproval": 12,
    "processing": 25,
    "shipped": 40,
    "delivered": 60,
    "cancelled": 13,
    "totalRevenue": 125000
  }
}
```

---

#### 6. **seller/orders/[id]** (~120 lines)

```typescript
GET / api / seller / orders / [id];
```

**Purpose:** Get detailed order information by ID

**Features:**

- Ownership verification (seller can only see their orders)
- Converts all Firestore timestamps to ISO strings
- Returns complete order data with line items, customer info, shipping details

**Timestamps Converted:**

- `createdAt`, `updatedAt`
- `approvedAt`, `shippedAt`, `deliveredAt`
- `cancelledAt`, `paidAt`, `refundedAt`

---

#### 7. **seller/orders/[id]/approve** (~100 lines)

```typescript
POST / api / seller / orders / [id] / approve;
```

**Purpose:** Approve a pending order

**Workflow:**

1. Verify order is in `pending_approval` status
2. Update status: `pending_approval` → `processing`
3. Record `approvedAt` timestamp
4. Create alert for seller

**Validation:**

- Order must be in `pending_approval` status
- Ownership verification

---

#### 8. **seller/orders/[id]/cancel** (~120 lines)

```typescript
POST / api / seller / orders / [id] / cancel;
```

**Purpose:** Cancel an order (with 3-day policy)

**Business Rules:**

- **Sellers:** Can only cancel within 3 days of payment
- **Admins:** Can cancel anytime
- Cannot cancel: delivered, refunded, or already cancelled orders

**Workflow:**

1. Check if order can be cancelled
2. Enforce 3-day rule for sellers (not admins)
3. Update status to `cancelled`
4. Record `cancelledAt`, `cancelledBy`, `cancellationReason`
5. Create alerts for seller (if admin cancelled) and customer

**Request:**

```json
{
  "reason": "Out of stock"
}
```

**3-Day Policy Check:**

```typescript
const daysSincePayment = (now - paidAt) / (1000 * 60 * 60 * 24);
if (role === "seller" && daysSincePayment > 3) {
  throw new ValidationError("Cancellation window expired");
}
```

---

#### 9. **seller/orders/[id]/reject** (~100 lines)

```typescript
POST / api / seller / orders / [id] / reject;
```

**Purpose:** Reject a pending order

**Workflow:**

1. Verify order is in `pending_approval` status
2. Require rejection reason
3. Update status: `pending_approval` → `rejected`
4. Record `rejectedAt` and `rejectionReason`
5. Create alert for seller

**Request:**

```json
{
  "reason": "Product discontinued"
}
```

---

#### 10. **seller/orders/[id]/invoice** (~250 lines)

```typescript
GET / api / seller / orders / [id] / invoice;
POST / api / seller / orders / [id] / invoice;
```

**GET: Fetch existing invoice**

- Checks if invoice already generated
- Returns invoice number, date, and URL (if available)

**POST: Generate new invoice**

**Features:**

- Generates unique invoice number: `INV-YYYYMMDD-XXXXX`
- Calculates due date (30 days from invoice date)
- Fetches seller information from Firestore
- Formats addresses (shipping, billing)
- Generates professional HTML invoice template

**Invoice Data Structure:**

```typescript
{
  orderNumber: string,
  invoiceNumber: string,  // e.g., "INV-20251103-A7B2C"
  invoiceDate: string,     // ISO string
  dueDate: string,         // +30 days

  seller: {
    name: string,
    email: string,
    phone: string,
    address: string,
    gstin?: string  // Optional GSTIN for Indian sellers
  },

  customer: {
    name: string,
    email: string,
    phone: string,
    shippingAddress: string,
    billingAddress: string
  },

  items: [{
    name: string,
    sku: string,
    quantity: number,
    price: number,
    tax: number,
    total: number
  }],

  subtotal: number,
  couponDiscount: number,
  saleDiscount: number,
  shippingCharges: number,
  tax: number,
  total: number,

  paymentMethod: string,
  paymentStatus: string,
  notes?: string
}
```

**HTML Invoice Template:**

- Professional design with modern CSS
- Company branding (HOBBIESSPOT.COM logo)
- Seller and customer details
- Itemized order table
- Totals breakdown with discounts
- Payment information
- Print-friendly styles

**Future Enhancement:**

- Use Puppeteer to convert HTML → PDF
- Upload PDF to Firebase Storage
- Return downloadable PDF URL

---

## 🏗️ Technical Architecture

### **Pattern: verifySellerAuth Helper**

All routes use a consistent authentication pattern:

```typescript
async function verifySellerAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Authentication required");
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || "user";

    if (role !== "seller" && role !== "admin") {
      throw new AuthorizationError("Seller access required");
    }

    return {
      uid: decodedToken.uid,
      role: role as "seller" | "admin",
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError("Invalid or expired token");
  }
}
```

**Benefits:**

- ✅ Consistent auth across all routes
- ✅ Supports both seller and admin roles
- ✅ Clear error handling with custom exceptions
- ✅ Returns typed seller object

---

### **Ownership Verification Pattern**

Sellers can only access their own resources:

```typescript
// Verify ownership (unless admin)
if (seller.role !== "admin" && resource?.sellerId !== seller.uid) {
  throw new AuthorizationError("Not your resource");
}
```

**Applied to:**

- Product GET/PUT/DELETE operations
- Order viewing and management
- Invoice generation

---

### **Custom Error Classes**

```typescript
import {
  AuthorizationError, // 403 Forbidden
  ValidationError, // 400 Bad Request
  NotFoundError, // 404 Not Found
} from "../../_lib/middleware/error-handler";
```

**Usage:**

```typescript
try {
  // Route logic
} catch (error: any) {
  if (
    error instanceof AuthorizationError ||
    error instanceof ValidationError ||
    error instanceof NotFoundError
  ) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { success: false, error: "Generic error message" },
    { status: 500 }
  );
}
```

---

### **Next.js 15 Async Params**

All dynamic routes use the new async params pattern:

```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // ...
}
```

**Not the old way:**

```typescript
// ❌ Old pattern (Next.js 14 and earlier)
{ params }: { params: { id: string } }
```

---

### **Firebase Storage Integration**

**File Upload Pattern:**

```typescript
// 1. Parse multipart form data
const formData = await request.formData();
const files = formData.getAll("files") as File[];

// 2. Validate file size and type
const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
if (file.size > maxSize) {
  throw new ValidationError("File too large");
}

// 3. Convert File to Buffer
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

// 4. Upload to Firebase Storage
const bucket = getStorage().bucket();
const fileRef = bucket.file(filePath);
await fileRef.save(buffer, {
  metadata: {
    contentType: file.type,
    metadata: {
      uploadedBy: sellerId,
      uploadedAt: new Date().toISOString(),
    },
  },
});

// 5. Make publicly accessible
await fileRef.makePublic();

// 6. Get public URL
const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
```

**Storage Cleanup Patterns:**

1. **Delete Folder (on product delete):**

```typescript
const [files] = await bucket.getFiles({ prefix: folderPath });
await Promise.all(files.map((file) => file.delete()));
```

2. **Rename Folder (on slug change):**

```typescript
const [files] = await bucket.getFiles({ prefix: oldFolderPath });
await Promise.all(
  files.map(async (file) => {
    const newPath = file.name.replace(oldFolderPath, newFolderPath);
    await file.copy(newPath);
    await file.delete();
  })
);
```

3. **Update Media URLs (on slug change):**

```typescript
function updateMediaURLs(media, oldSlug, newSlug) {
  return {
    ...media,
    images: media.images.map((img) => ({
      ...img,
      url: img.url.replace(`/products/${oldSlug}/`, `/products/${newSlug}/`),
    })),
    videos: media.videos.map((video) => ({
      ...video,
      url: video.url.replace(`/products/${oldSlug}/`, `/products/${newSlug}/`),
    })),
  };
}
```

---

## 📊 Code Statistics

### **Lines of Code by Route:**

| Route                    | Lines      | Methods          | Complexity              |
| ------------------------ | ---------- | ---------------- | ----------------------- |
| products/categories/leaf | ~150       | GET              | Low                     |
| products/media           | ~180       | POST             | Medium (file upload)    |
| products (main)          | ~350       | GET, POST        | High (validation chain) |
| products/[id]            | ~390       | GET, PUT, DELETE | Very High (storage ops) |
| orders (main)            | ~200       | GET              | Medium                  |
| orders/[id]              | ~120       | GET              | Low                     |
| orders/[id]/approve      | ~100       | POST             | Low                     |
| orders/[id]/cancel       | ~120       | POST             | Medium (3-day policy)   |
| orders/[id]/reject       | ~100       | POST             | Low                     |
| orders/[id]/invoice      | ~250       | GET, POST        | High (HTML generation)  |
| **Total**                | **~1,960** | **15 methods**   | -                       |

### **Legacy Code Preserved:**

- 10 routes backed up to `_legacy/seller/` folders
- ~3,000 lines preserved (100%)
- All original functionality maintained for reference

---

## 🎯 Key Technical Achievements

### 1. **Complex Validation Chains**

- ✅ SKU uniqueness checks (within seller)
- ✅ Slug uniqueness checks (global)
- ✅ Category validation (leaf + active)
- ✅ File validation (size + type)
- ✅ Order status transitions

### 2. **Firebase Storage Management**

- ✅ Multipart file upload handling
- ✅ Public URL generation
- ✅ Folder deletion (on product delete)
- ✅ Folder renaming (on slug change)
- ✅ Media URL updates (on slug change)

### 3. **Business Logic Implementation**

- ✅ 3-day cancellation policy (sellers only)
- ✅ Order status workflows (approve, reject, cancel)
- ✅ Alert system integration
- ✅ Invoice generation with HTML template

### 4. **RBAC & Ownership**

- ✅ Seller vs. admin access differentiation
- ✅ Ownership verification on all operations
- ✅ Resource isolation (sellers see only their data)

### 5. **Error Handling**

- ✅ Custom error classes
- ✅ Consistent error responses
- ✅ Proper HTTP status codes
- ✅ Detailed error messages

---

## 🧪 Testing & Validation

### **TypeScript Compilation:**

```bash
✅ All 10 routes: 0 TypeScript errors
```

### **Routes Verified:**

- [x] seller/products/categories/leaf
- [x] seller/products/media
- [x] seller/products (GET/POST)
- [x] seller/products/[id] (GET/PUT/DELETE)
- [x] seller/orders (GET)
- [x] seller/orders/[id] (GET)
- [x] seller/orders/[id]/approve (POST)
- [x] seller/orders/[id]/cancel (POST)
- [x] seller/orders/[id]/reject (POST)
- [x] seller/orders/[id]/invoice (GET/POST)

### **Import Paths Tested:**

```typescript
// From deeply nested routes (5 levels)
import { ... } from '../../../_lib/database/admin';
import { ... } from '../../../_lib/middleware/error-handler';

// From invoice route (4 levels)
import { ... } from '../../../../_lib/database/admin';
import { ... } from '../../../../_lib/middleware/error-handler';
```

---

## 📝 API Reference

### **Product Management**

```typescript
// List leaf categories for product assignment
GET /api/seller/products/categories/leaf
Headers: { Authorization: 'Bearer <token>' }

// Upload product media (images/videos)
POST /api/seller/products/media
Headers: { Authorization: 'Bearer <token>', Content-Type: 'multipart/form-data' }
Body: FormData { files: File[], slug: string, type: 'image'|'video' }

// List seller's products
GET /api/seller/products?status=active&search=phone&category=cat123
Headers: { Authorization: 'Bearer <token>' }

// Create new product
POST /api/seller/products
Headers: { Authorization: 'Bearer <token>', Content-Type: 'application/json' }
Body: { name, categoryId, pricing, inventory, seo, ... }

// Get product by ID
GET /api/seller/products/{productId}
Headers: { Authorization: 'Bearer <token>' }

// Update product
PUT /api/seller/products/{productId}
Headers: { Authorization: 'Bearer <token>', Content-Type: 'application/json' }
Body: { ...updates }

// Delete product
DELETE /api/seller/products/{productId}
Headers: { Authorization: 'Bearer <token>' }
```

### **Order Management**

```typescript
// List seller's orders
GET /api/seller/orders?status=pending_approval&limit=50
Headers: { Authorization: 'Bearer <token>' }

// Get order details
GET /api/seller/orders/{orderId}
Headers: { Authorization: 'Bearer <token>' }

// Approve pending order
POST /api/seller/orders/{orderId}/approve
Headers: { Authorization: 'Bearer <token>' }

// Reject pending order
POST /api/seller/orders/{orderId}/reject
Headers: { Authorization: 'Bearer <token>', Content-Type: 'application/json' }
Body: { reason: string }

// Cancel order (within 3 days for sellers)
POST /api/seller/orders/{orderId}/cancel
Headers: { Authorization: 'Bearer <token>', Content-Type: 'application/json' }
Body: { reason?: string }

// Generate invoice
POST /api/seller/orders/{orderId}/invoice
Headers: { Authorization: 'Bearer <token>' }

// Get existing invoice
GET /api/seller/orders/{orderId}/invoice
Headers: { Authorization: 'Bearer <token>' }
```

---

## 🚀 Sprint 4 Progress Update

### **Cumulative Sprint 4 Statistics:**

| Day    | Focus                      | Routes | Lines      | Status          |
| ------ | -------------------------- | ------ | ---------- | --------------- |
| 16     | Admin Advanced Features    | 7      | ~1,120     | ✅ Complete     |
| 17     | Admin Bulk Operations      | 4      | ~640       | ✅ Complete     |
| **18** | **Seller Product & Order** | **10** | **~1,960** | **✅ Complete** |
| 19     | Seller Advanced Features   | TBD    | TBD        | ⏳ Pending      |
| 20     | Sprint Review              | -      | -          | ⏳ Pending      |

**Sprint 4 Progress: 21 of ~35 routes (60%)**

### **Overall Project Progress:**

- **Sprints 1-3:** 48 routes, 10,709 lines ✅
- **Sprint 4 (Days 16-18):** 21 routes, ~3,720 lines ✅
- **Total so far:** 69 routes, ~14,429 lines ✅
- **Days completed:** 18 of 30 (60%)
- **Zero TypeScript errors maintained** ✅

---

## 🔄 Next Steps

### **Day 19: Seller Advanced Features**

**Estimated:** 13 routes, ~1,100 lines

**Routes to refactor:**

1. Seller shipments (6 routes) - Tracking, labels, carrier integration
2. Seller coupons (4 routes) - Create, update, toggle status, delete
3. Seller sales (3 routes) - List, create, toggle

**Technical Focus:**

- Shipment tracking integration
- Coupon validation and usage tracking
- Sale price calculations
- Multi-product operations

---

## 📚 Documentation Files

- [x] `DAY_18_COMPLETE.md` (this file)
- [x] `30_DAY_ACTION_PLAN.md` (updated with Day 18 completion)
- [x] Legacy code preserved in `_legacy/seller/` folders

---

## ✨ Summary

Day 18 successfully delivered:

- ✅ **10 routes refactored** (4 product + 6 order)
- ✅ **~1,960 lines of production code**
- ✅ **0 TypeScript errors**
- ✅ **100% legacy code preserved**
- ✅ **Complex features**: File uploads, storage management, invoice generation
- ✅ **Business logic**: 3-day cancellation policy, order workflows
- ✅ **RBAC**: Seller ownership verification, admin overrides

The seller product and order management system is now fully refactored with modern MVC patterns, consistent authentication, proper error handling, and advanced Firebase Storage integration.

**Ready for Day 19: Seller Advanced Features!** 🚀
