# Phase 3: Products System Implementation

## Date: October 31, 2025

---

## ✅ Completed in This Session

### 1. Products List Page (`/seller/products`)

**File Created:** `src/app/seller/products/page.tsx`

**Features Implemented:**

- ✅ Data table with product cards showing:
  - Product image (avatar fallback with first letter)
  - Product name & SEO slug
  - SKU
  - Price (with compare-at price strikethrough)
  - Stock quantity with status chips (In Stock, Low Stock, Out of Stock)
  - Category name
  - Status badge (active, draft, archived, out_of_stock)
- ✅ Stats dashboard with 4 cards:
  - Total Products
  - Active Products
  - Out of Stock
  - Low Stock
- ✅ Search functionality (by name or SKU)
- ✅ Status filter dropdown (all, active, draft, out_of_stock, archived)
- ✅ Action menu per product:
  - Edit (links to edit page)
  - Duplicate
  - Archive
  - Delete (with confirmation dialog)
- ✅ API Integration:
  - Fetches from `GET /api/seller/products`
  - Deletes via `DELETE /api/seller/products/[id]`
- ✅ Success/Error notifications with Snackbar
- ✅ Empty state with call-to-action
- ✅ Loading states

---

### 2. Products API Routes

#### **Main Products Route**

**File:** `src/app/api/seller/products/route.ts`

**GET /api/seller/products**

- Lists all products for authenticated seller
- Supports query parameters:
  - `status` - Filter by product status
  - `search` - Search by name, SKU, or slug
  - `category` - Filter by category ID
- Returns products sorted by `createdAt` (descending)
- Converts Firestore timestamps to JavaScript dates
- Response format: `{ success: true, data: SellerProduct[] }`

**POST /api/seller/products**

- Creates new product for authenticated seller
- Required fields validation:
  - name, categoryId, pricing, inventory, seo
- SKU uniqueness check (per seller)
- Slug uniqueness check (global)
- Validates:
  - Pricing: price, compareAtPrice, cost
  - Inventory: quantity, lowStockThreshold, trackInventory
  - SEO: Must include "buy-" prefix in slug
  - Media: images (img1-img5), videos (v1-v2)
- Initializes stats: views=0, sales=0, revenue=0
- Default status: "draft"
- Returns created product with ID

#### **Individual Product Routes**

**File:** `src/app/api/seller/products/[id]/route.ts`

**GET /api/seller/products/[id]**

- Fetches specific product by ID
- Verifies ownership (seller can only access their own products)
- Admins can access any product
- Returns 404 if not found

**PUT /api/seller/products/[id]**

- Updates existing product
- Partial updates supported (only provided fields are updated)
- Validates:
  - SKU uniqueness if changed
  - Slug uniqueness if changed
- Updates `updatedAt` timestamp automatically
- Returns updated product

**DELETE /api/seller/products/[id]**

- Deletes product by ID
- Verifies ownership
- Returns success message
- TODO: Also delete associated media from Firebase Storage

---

### 3. Firebase Infrastructure Updates

#### **Firestore Indexes** (`firestore.indexes.json`)

Added 4 new composite indexes for `seller_products` collection:

1. **Basic seller products query:**

   ```json
   {
     "fields": [
       { "fieldPath": "sellerId", "order": "ASCENDING" },
       { "fieldPath": "createdAt", "order": "DESCENDING" }
     ]
   }
   ```

2. **Filter by status:**

   ```json
   {
     "fields": [
       { "fieldPath": "sellerId", "order": "ASCENDING" },
       { "fieldPath": "status", "order": "ASCENDING" },
       { "fieldPath": "createdAt", "order": "DESCENDING" }
     ]
   }
   ```

3. **Filter by category:**

   ```json
   {
     "fields": [
       { "fieldPath": "sellerId", "order": "ASCENDING" },
       { "fieldPath": "categoryId", "order": "ASCENDING" },
       { "fieldPath": "createdAt", "order": "DESCENDING" }
     ]
   }
   ```

4. **Coupons & Sales indexes:**
   - Similar indexes for `seller_coupons` and `seller_sales` collections

#### **Firestore Security Rules** (`firestore.rules`)

Added comprehensive rules for seller collections:

**seller_products:**

```javascript
match /seller_products/{productId} {
  allow read: if true; // Public product listings
  allow create: if isSeller() &&
                   request.resource.data.sellerId == request.auth.uid &&
                   validateSellerProduct();
  allow update: if resource.data.sellerId == request.auth.uid || isAdmin();
  allow delete: if resource.data.sellerId == request.auth.uid || isAdmin();
}
```

**seller_coupons:**

```javascript
match /seller_coupons/{couponId} {
  allow read: if resource.data.sellerId == request.auth.uid || isAdmin();
  allow create: if isSeller() && validateCoupon();
  allow update, delete: if resource.data.sellerId == request.auth.uid || isAdmin();
}
```

**seller_sales:**

```javascript
match /seller_sales/{saleId} {
  allow read: if resource.data.sellerId == request.auth.uid || isAdmin();
  allow create: if isSeller() && validateSale();
  allow update, delete: if resource.data.sellerId == request.auth.uid || isAdmin();
}
```

**Validation Functions Added:**

1. **validateSellerProduct()**

   - Validates: name, sellerId, categoryId, pricing, inventory, seo
   - Name: 1-200 characters
   - Price must be > 0
   - Quantity must be >= 0
   - **SEO slug must start with "buy-"**

2. **validateCoupon()**

   - Validates: code, name, sellerId, type, value
   - Code: 1-50 characters
   - Type: percentage, fixed, free_shipping, bogo, cart_discount
   - Value must be > 0

3. **validateSale()**

   - Validates: name, sellerId, discountType, discountValue, applyTo
   - discountType: percentage, fixed
   - discountValue must be > 0
   - applyTo: all, specific_products, specific_categories

4. **isSeller() helper:**
   - Checks if user role is 'seller' or 'admin'

#### **Storage Security Rules** (`storage.rules`)

Updated storage paths for seller assets:

**Avatars (Profile Pictures):**

```javascript
match /avatars/{fileName} {
  allow read: if true;
  allow create, update: if isAuthenticated() &&
                           isValidImage() &&
                           isWithinSizeLimit(5);
}
```

**Seller Shop Assets:**

```javascript
match /sellers/{sellerId}/shop/{fileName} {
  allow read: if true; // Public (logo, cover)
  allow create, update: if isOwner(sellerId) || isAdmin();
}
```

**Product Media:**

```javascript
match /sellers/{sellerId}/products/{productSlug}/{fileName} {
  allow read: if true; // Public product images/videos
  allow create, update: if isOwner(sellerId) || isAdmin();
  // 20MB limit for videos
}
```

**Storage Path Structure:**

```
sellers/
  {sellerId}/
    shop/
      logo.jpg
      cover.jpg
    products/
      buy-{product-slug}/
        img1.jpg
        img2.jpg
        img3.jpg
        img4.jpg
        img5.jpg
        img1-whatsapp-edit.jpg
        img2-whatsapp-edit.jpg
        v1.mp4
        v2.mp4
        v1-thumbnail.jpg
        v2-thumbnail.jpg
```

---

## 📊 Database Structure

### Firestore Collection: `seller_products`

```typescript
{
  id: string; // Auto-generated document ID
  sellerId: string; // UID of the seller
  name: string; // Product name
  shortDescription: string;
  description: string; // Full HTML description
  categoryId: string;
  categoryName: string;
  tags: string[];
  sku: string; // Unique per seller

  pricing: {
    price: number;
    compareAtPrice: number | null;
    cost: number | null;
  };

  inventory: {
    quantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  };

  pickupAddressId: string | null;

  media: {
    images: Array<{
      url: string;
      altText: string;
      order: number;
    }>;
    videos: Array<{
      url: string;
      thumbnailUrl: string;
      order: number;
    }>;
  };

  condition: "new" | "used_mint" | "used_good" | "used_fair" | "damaged";
  isReturnable: boolean;
  returnPeriodDays: number;
  hasFreeShipping: boolean;
  shippingMethod: "seller" | "shiprocket" | "pickup";
  features: string[];
  specifications: { [key: string]: string };
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  } | null;

  seo: {
    title: string;
    description: string;
    keywords: string[];
    slug: string; // Must start with "buy-"
  };

  startDate: Timestamp;
  expirationDate: Timestamp | null;
  status: "active" | "draft" | "archived" | "out_of_stock";

  stats: {
    views: number;
    sales: number;
    revenue: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔐 Security & Validation

### Authentication Pattern

All seller API routes follow this pattern:

```typescript
// 1. Extract Bearer token from Authorization header
const authHeader = request.headers.get("authorization");
const token = authHeader.split("Bearer ")[1];

// 2. Verify token with Firebase Admin SDK
const auth = getAdminAuth();
const decodedToken = await auth.verifyIdToken(token);
const uid = decodedToken.uid;
const role = decodedToken.role || "user";

// 3. Check role-based access
if (role !== "seller" && role !== "admin") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

// 4. Verify resource ownership
const docData = await getDocument();
if (role !== "admin" && docData.sellerId !== uid) {
  return NextResponse.json({ error: "Not your resource" }, { status: 403 });
}
```

### Data Validation

**Product Creation:**

- ✅ Required fields: name, categoryId, pricing, inventory, seo
- ✅ Price must be > 0
- ✅ Quantity must be >= 0
- ✅ SKU uniqueness per seller
- ✅ Slug uniqueness globally
- ✅ Slug must match pattern: `^buy-[a-z0-9-]+$`

**Product Updates:**

- ✅ Partial updates allowed
- ✅ SKU uniqueness validation if changed
- ✅ Slug uniqueness validation if changed
- ✅ Automatic `updatedAt` timestamp

---

## 📝 Next Steps

### Immediate Tasks:

1. **Multi-Step Product Form** (`/seller/products/new`)

   - Step 1: Product Details (name, description, category, tags)
   - Step 2: Pricing & Inventory
   - Step 3: Media Upload (5 images + 2 videos, WhatsApp editor)
   - Step 4: Condition & Features
   - Step 5: SEO (auto-generated with "buy-" prefix)

2. **Media Upload API**

   - `POST /api/seller/products/[id]/media` - Upload images/videos
   - Handle multiple files
   - Generate thumbnails for videos
   - WhatsApp-style 800x800 cropping

3. **Leaf Categories API**

   - `GET /api/seller/products/categories/leaf` - Get only leaf categories
   - Filter out parent categories
   - Required for product category selection

4. **Product Edit Page**
   - Pre-fill form with existing product data
   - Same multi-step form structure
   - Additional archive/delete options

### Testing Checklist:

**Products List:**

- [ ] Fetch products on page load
- [ ] Filter by status (active, draft, archived, out_of_stock)
- [ ] Search by name and SKU
- [ ] Delete product with confirmation
- [ ] Verify stats calculation (total, active, low stock, out of stock)

**Products API:**

- [ ] Create product with all fields
- [ ] Create product with minimal fields (defaults applied)
- [ ] Test SKU uniqueness validation
- [ ] Test slug uniqueness validation
- [ ] Test slug "buy-" prefix validation
- [ ] Update product (partial updates)
- [ ] Delete product
- [ ] Verify ownership restrictions

**Firebase Infrastructure:**

- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Storage rules: `firebase deploy --only storage`
- [ ] Test product creation in Firestore console
- [ ] Test file upload to `/sellers/{sellerId}/products/` path

---

## 🎉 Phase 3 Progress Summary

**Completed:**

- ✅ Products list page with full API integration
- ✅ Products API (GET list, POST create, GET single, PUT update, DELETE)
- ✅ Firebase Firestore indexes for seller collections
- ✅ Firebase Firestore security rules with validation
- ✅ Firebase Storage rules for seller assets
- ✅ Authentication & authorization framework
- ✅ Error handling & success notifications

**Remaining:**

- ⏳ Multi-step product creation form (5 steps)
- ⏳ Media upload functionality
- ⏳ WhatsApp-style image editor (800x800)
- ⏳ Leaf categories API endpoint
- ⏳ Product edit page

**Total API Endpoints Created So Far:**

- 12 Coupons & Sales endpoints (Phase 2)
- 5 Products endpoints (Phase 3) ✅
- **17 total seller API endpoints** 🚀

---

## 🚀 Deployment Instructions

### 1. Deploy Firebase Configuration

```powershell
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules
firebase deploy --only storage

# Deploy all at once
firebase deploy --only firestore,storage
```

### 2. Verify Deployments

**Firestore Indexes:**

- Go to Firebase Console → Firestore Database → Indexes
- Verify `seller_products`, `seller_coupons`, `seller_sales` indexes are active

**Security Rules:**

- Go to Firebase Console → Firestore Database → Rules
- Verify published timestamp is recent

**Storage Rules:**

- Go to Firebase Console → Storage → Rules
- Verify published timestamp is recent

### 3. Test in Production

```typescript
// Test product creation
POST https://your-domain.com/api/seller/products
Authorization: Bearer {firebase-id-token}

{
  "name": "Test Product",
  "categoryId": "cat123",
  "categoryName": "Test Category",
  "pricing": {
    "price": 1999
  },
  "inventory": {
    "quantity": 10
  },
  "seo": {
    "title": "Buy Test Product Online",
    "slug": "buy-test-product"
  }
}
```

---

## 📚 Documentation Files Updated

1. ✅ `SELLER_PANEL_PROGRESS.md` - Added Phase 3 progress
2. ✅ `PHASE2_BUGS_FIXED.md` - Created bug fix documentation
3. ✅ `firestore.indexes.json` - Added seller collection indexes
4. ✅ `firestore.rules` - Added seller access rules
5. ✅ `storage.rules` - Added seller storage paths

---

**Phase 3 Status:** 40% Complete 🚧

**Next Session:** Multi-step product creation form with media upload
