# Common Issues and Solutions - Next.js Auction Platform

## Table of Contents

1. [Category Product Counts Showing Zero](#1-category-product-counts-showing-zero)
2. [Product Details Not Loading](#2-product-details-not-loading)
3. [API Response Data Not Displaying](#3-api-response-data-not-displaying)
4. [Product Card Image Rotation Not Working](#4-product-card-image-rotation-not-working)
5. [Boolean Field Filtering Issues](#5-boolean-field-filtering-issues)
6. [Snake Case vs Camel Case Mismatches](#6-snake-case-vs-camel-case-mismatches)
7. [Pagination Not Working](#7-pagination-not-working)
8. [Shop Product Counts Incorrect](#8-shop-product-counts-incorrect)
9. [useSearchParams Suspense Boundary Errors](#9-usesearchparams-suspense-boundary-errors)
10. [Invalid Date toISOString Errors](#10-invalid-date-toisostring-errors)

---

## 1. Category Product Counts Showing Zero

### Symptoms

- Category list shows all categories with 0 products
- Products exist in database but aren't counted
- Admin panel shows 300 products but categories show 0

### Root Cause

```typescript
// ❌ WRONG - Excludes products with undefined is_deleted field
const validProducts = products.docs.filter(
  (doc) => doc.data().is_deleted === false
);

// undefined === false returns false, so products without
// the field are excluded from count
```

### Solution

```typescript
// ✅ CORRECT - Includes undefined and false, excludes only true
const validProducts = products.docs.filter(
  (doc) => doc.data().is_deleted !== true
);
```

### Where to Fix

- `src/lib/category-hierarchy.ts` - `countLeafCategoryProducts()`
- Any API route that filters by boolean fields
- Any query that checks `is_deleted`, `is_active`, etc.

### Prevention

**Always use `!== true` pattern for boolean checks:**

```typescript
// ✅ Good patterns
if (field !== true) {
} // Includes undefined/false
if (!field) {
} // Includes undefined/null/false (for truthy checks)

// ❌ Bad patterns
if (field === false) {
} // Excludes undefined
if (field == false) {
} // Excludes undefined
```

---

## 2. Product Details Not Loading

### Symptoms

- Product detail page shows blank title
- Images show "No images available"
- Product data exists in API but not on page

### Root Cause

API returns both `snake_case` (from Firestore) and `camelCase` but transformer expects only `camelCase`:

```json
// API Response
{
  "compare_at_price": 39895, // From Firestore
  "compareAtPrice": null // Not added to response
}
```

### Solution

Add camelCase aliases to all API responses:

```typescript
// src/app/api/products/[slug]/route.ts
return NextResponse.json({
  success: true,
  data: {
    id: doc.id,
    ...data,
    // Add camelCase aliases for ALL snake_case fields
    shopId: data.shop_id,
    sellerId: data.seller_id,
    categoryId: data.category_id,
    stockCount: data.stock_count,
    compareAtPrice: data.compare_at_price,
    lowStockThreshold: data.low_stock_threshold,
    isFeatured: data.is_featured,
    isActive: data.is_active,
    isDeleted: data.is_deleted,
    isReturnable: data.is_returnable,
    // ... add all fields
  },
});
```

### Where to Apply

- All `/api/products/` routes
- All `/api/auctions/` routes
- All `/api/shops/` routes
- All `/api/categories/` routes
- Any route returning Firestore data

### Checklist

1. ✅ GET endpoints - Add camelCase aliases
2. ✅ POST endpoints - Add camelCase aliases to response
3. ✅ PATCH endpoints - Add camelCase aliases to response
4. ✅ List endpoints - Add aliases to each item

---

## 3. API Response Data Not Displaying

### Symptoms

- API returns data successfully (verified in curl/Postman)
- Frontend shows empty/blank content
- Console shows no errors
- TypeScript types look correct

### Root Cause

API service returns `{success: true, data: {...}}` but service methods pass entire response to transformers:

```typescript
// ❌ WRONG
async getBySlug(slug: string): Promise<ProductFE> {
  const response = await apiService.get<ProductBE>(route);
  return toFEProduct(response);
  // response = {success: true, data: ProductBE}
  // transformer receives {success, data} instead of ProductBE
}
```

### Solution

Extract `.data` from API response:

```typescript
// ✅ CORRECT
async getBySlug(slug: string): Promise<ProductFE> {
  const response: any = await apiService.get(route);
  return toFEProduct(response.data);  // Extract .data
}

// For arrays
async getVariants(slug: string): Promise<ProductCardFE[]> {
  const response: any = await apiService.get(route);
  return toFEProductCards(response.data || []); // Extract with fallback
}
```

### Where to Fix

All service methods that call `apiService.get/post/patch`:

**src/services/products.service.ts:**

- ✅ `getById()`
- ✅ `getBySlug()`
- ✅ `getVariants()`
- ✅ `getSimilar()`
- ✅ `getSellerProducts()`
- ⚠️ `create()` - needs fixing
- ⚠️ `update()` - needs fixing
- ⚠️ `list()` - needs fixing

**Other services:**

- Check all methods in `shops.service.ts`
- Check all methods in `categories.service.ts`
- Check all methods in `auctions.service.ts`
- Check all methods in `users.service.ts`

### Quick Audit

```bash
# Find all service methods that might need fixing
grep -r "apiService.get<" src/services/
grep -r "apiService.post<" src/services/
grep -r "apiService.patch<" src/services/
```

---

## 4. Product Card Image Rotation Not Working

### Symptoms

- Product cards with multiple images don't rotate on hover
- Cards with videos work fine
- No console errors

### Root Cause

Effect has `currentMediaIndex` in dependencies, causing interval to be recreated on every index change:

```typescript
// ❌ WRONG - Creates infinite loop
React.useEffect(() => {
  if (isHovered && allMedia.length > 1) {
    intervalRef.current = setInterval(() => {
      setCurrentMediaIndex((prev) => prev + 1);
    }, 2000);
  }
  return () => clearInterval(intervalRef.current);
}, [isHovered, currentMediaIndex, allMedia]);
// ⬆️ currentMediaIndex dependency causes effect to re-run
//    every time index changes, recreating interval
```

### Solution

Split into two separate effects:

```typescript
// ✅ CORRECT - Rotation effect (no currentMediaIndex dependency)
React.useEffect(() => {
  if (isHovered && allMedia.length > 1) {
    intervalRef.current = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
    }, 2000);
  } else {
    setCurrentMediaIndex(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [isHovered, allMedia.length]);

// ✅ Video playback effect (separate concern)
React.useEffect(() => {
  const currentMedia = allMedia[currentMediaIndex];
  if (isHovered && currentMedia?.type === "video") {
    setIsPlayingVideo(true);
    videoRef.current?.play().catch(() => {});
  } else {
    setIsPlayingVideo(false);
    videoRef.current?.pause();
  }
}, [currentMediaIndex, isHovered, allMedia]);
```

### Key Principles

1. **Separate concerns** - One effect per logical action
2. **Minimal dependencies** - Only include what's needed
3. **Use functional updates** - `setState(prev => ...)` avoids state dependencies

---

## 5. Boolean Field Filtering Issues

### Problem Pattern

Any boolean field in Firestore may be `undefined`, `true`, or `false`. JavaScript strict equality doesn't handle this well.

### Common Boolean Fields

- `is_deleted`
- `is_active`
- `is_featured`
- `is_returnable`
- `track_inventory`
- `is_published`

### Comparison Table

| Code              | undefined | false | true |
| ----------------- | --------- | ----- | ---- |
| `field === true`  | ❌        | ❌    | ✅   |
| `field === false` | ❌        | ✅    | ❌   |
| `field !== true`  | ✅        | ✅    | ❌   |
| `field !== false` | ✅        | ❌    | ✅   |
| `!field`          | ✅        | ✅    | ❌   |
| `!!field`         | ❌        | ❌    | ✅   |

### Best Practices

**Filtering "active" items (exclude deleted):**

```typescript
// ✅ Includes items that are not explicitly deleted
const active = items.filter((item) => item.is_deleted !== true);
```

**Filtering "inactive" items (only deleted):**

```typescript
// ✅ Only items explicitly marked as deleted
const deleted = items.filter((item) => item.is_deleted === true);
```

**Filtering "featured" items:**

```typescript
// ✅ Only items explicitly marked as featured
const featured = items.filter((item) => item.is_featured === true);
```

**Filtering "not featured" items:**

```typescript
// ✅ Items not marked as featured (includes undefined)
const notFeatured = items.filter((item) => item.is_featured !== true);
```

### Firestore Queries

❌ **Cannot query for undefined in Firestore:**

```typescript
// This doesn't work
.where("is_deleted", "==", undefined)
```

✅ **Filter in application code:**

```typescript
const snapshot = await db
  .collection("products")
  .where("status", "==", "published")
  .get();

const validProducts = snapshot.docs.filter(
  (doc) => doc.data().is_deleted !== true
);
```

---

## 6. Snake Case vs Camel Case Mismatches

### The Problem

- **Firestore** stores fields in `snake_case` (database convention)
- **TypeScript/Frontend** expects `camelCase` (JavaScript convention)
- **API responses** must bridge both worlds

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│  Firestore  │────────▶│  API Route   │────────▶│  Service   │
│ (snake_case)│         │ (both cases) │         │ (camelCase)│
└─────────────┘         └──────────────┘         └────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Transformer  │
                        │ (expects     │
                        │  camelCase)  │
                        └──────────────┘
```

### Complete Solution

#### Step 1: API Route Returns Both

```typescript
// src/app/api/products/[slug]/route.ts
export async function GET(request: NextRequest, { params }: any) {
  const doc = await db.collection("products").doc(id).get();
  const data: any = doc.data();

  return NextResponse.json({
    success: true,
    data: {
      id: doc.id,
      ...data, // Original snake_case from Firestore

      // Add camelCase aliases for transformer
      shopId: data.shop_id,
      sellerId: data.seller_id,
      categoryId: data.category_id,
      categoryIds: data.category_ids,
      stockCount: data.stock_count,
      lowStockThreshold: data.low_stock_threshold,
      trackInventory: data.track_inventory,
      compareAtPrice: data.compare_at_price,
      taxRate: data.tax_rate,
      isFeatured: data.is_featured,
      isActive: data.is_active,
      isDeleted: data.is_deleted,
      isReturnable: data.is_returnable,
      returnWindowDays: data.return_window_days,
      returnPolicy: data.return_policy,
      warrantyInfo: data.warranty_info,
      shippingClass: data.shipping_class,
      viewCount: data.view_count,
      salesCount: data.sales_count,
      favoriteCount: data.favorite_count,
      reviewCount: data.review_count,
      averageRating: data.average_rating,
      countryOfOrigin: data.country_of_origin,
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hasVariants: data.has_variants,
    },
  });
}
```

#### Step 2: Service Unwraps Response

```typescript
// src/services/products.service.ts
async getBySlug(slug: string): Promise<ProductFE> {
  const response: any = await apiService.get(
    PRODUCT_ROUTES.BY_SLUG(slug)
  );
  return toFEProduct(response.data);  // Extract .data
}
```

#### Step 3: Transformer Uses CamelCase

```typescript
// src/types/transforms/product.transforms.ts
export function toFEProduct(productBE: ProductBE): ProductFE {
  return {
    id: productBE.id,
    name: productBE.name,
    slug: productBE.slug,
    price: productBE.price,
    compareAtPrice: productBE.compareAtPrice, // Uses camelCase
    stockCount: productBE.stockCount, // Uses camelCase
    // ... rest of transformation
  };
}
```

### Field Mapping Reference

| Firestore (snake_case) | API Response (both)                  | Frontend (camelCase) |
| ---------------------- | ------------------------------------ | -------------------- |
| `shop_id`              | `shop_id`, `shopId`                  | `shopId`             |
| `seller_id`            | `seller_id`, `sellerId`              | `sellerId`           |
| `category_id`          | `category_id`, `categoryId`          | `categoryId`         |
| `stock_count`          | `stock_count`, `stockCount`          | `stockCount`         |
| `compare_at_price`     | `compare_at_price`, `compareAtPrice` | `compareAtPrice`     |
| `is_featured`          | `is_featured`, `isFeatured`          | `isFeatured`         |
| `is_active`            | `is_active`, `isActive`              | `isActive`           |
| `is_deleted`           | `is_deleted`, `isDeleted`            | `isDeleted`          |
| `created_at`           | `created_at`, `createdAt`            | `createdAt`          |
| `updated_at`           | `updated_at`, `updatedAt`            | `updatedAt`          |

### Quick Template

Use this template for all API routes:

```typescript
// Generic field aliasing function
function addCamelCaseAliases(data: any): any {
  return {
    ...data,
    // IDs
    shopId: data.shop_id,
    sellerId: data.seller_id,
    categoryId: data.category_id,
    categoryIds: data.category_ids,

    // Inventory
    stockCount: data.stock_count,
    lowStockThreshold: data.low_stock_threshold,
    trackInventory: data.track_inventory,

    // Pricing
    compareAtPrice: data.compare_at_price,
    taxRate: data.tax_rate,

    // Booleans
    isFeatured: data.is_featured,
    isActive: data.is_active,
    isDeleted: data.is_deleted,
    isReturnable: data.is_returnable,

    // Policies
    returnWindowDays: data.return_window_days,
    returnPolicy: data.return_policy,
    warrantyInfo: data.warranty_info,

    // Shipping
    shippingClass: data.shipping_class,

    // Stats
    viewCount: data.view_count,
    salesCount: data.sales_count,
    favoriteCount: data.favorite_count,
    reviewCount: data.review_count,
    averageRating: data.average_rating,

    // Meta
    countryOfOrigin: data.country_of_origin,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,

    // Timestamps
    createdAt: data.created_at,
    updatedAt: data.updated_at,

    // Variants
    hasVariants: data.has_variants,
  };
}

// Use in route
const data = addCamelCaseAliases(doc.data());
return NextResponse.json({ success: true, data });
```

---

## 7. Pagination Not Working

### Symptoms

- Products list shows "Showing 1 - 0 of 0 products"
- All pages show the same products
- Page navigation doesn't change results
- Total count always shows 0

### Root Cause

**Issue 1: Service Layer** - Hardcoded pagination values:

```typescript
// ❌ WRONG - Ignores page/limit from filters
async list(filters?: ProductFiltersFE) {
  const beFilters = {
    ...filters,
    page: 1,           // Always page 1
    limit: 20,         // Always 20 items
  };
}
```

**Issue 2: API Route** - No pagination implementation:

```typescript
// ❌ WRONG - Returns all results without slicing
const snapshot = await query.limit(limit).get();
return NextResponse.json({
  success: true,
  data: products,
  count: products.length, // No pagination metadata
});
```

### Solution

**Fix 1: Service Layer** - Pass through pagination params:

```typescript
// ✅ CORRECT - Uses filters.page and filters.limit
async list(filters?: ProductFiltersFE): Promise<{ products: ProductCardFE[]; pagination: any }> {
  const beFilters: any = {
    shopId: filters?.shopId,
    categoryId: filters?.categoryId,
    search: filters?.search,
    priceMin: filters?.priceRange?.min,
    priceMax: filters?.priceRange?.max,
    status: filters?.status?.[0],
    inStock: filters?.inStock,
    isFeatured: filters?.isFeatured,
    page: filters?.page || 1,        // ✅ Use from filters
    limit: filters?.limit || 20,      // ✅ Use from filters
    sortBy: filters?.sortBy,
  };

  const endpoint = buildUrl(PRODUCT_ROUTES.LIST, beFilters);
  const response: any = await apiService.get(endpoint);

  return {
    products: toFEProductCards(response.data || []),
    pagination: response.pagination,  // ✅ Return pagination metadata
  };
}
```

**Fix 2: API Route** - Implement proper pagination:

```typescript
// ✅ CORRECT - Implements pagination with metadata
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "50");
const search = searchParams.get("search");

// Get all matching products
const countSnapshot = await query.get();
let allProducts = countSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
  // camelCase aliases...
}));

// Apply client-side filters (price, search)
if (minPrice) {
  allProducts = allProducts.filter(
    (p: any) => (p.price ?? 0) >= parseFloat(minPrice)
  );
}
if (maxPrice) {
  allProducts = allProducts.filter(
    (p: any) => (p.price ?? 0) <= parseFloat(maxPrice)
  );
}
if (search) {
  const searchLower = search.toLowerCase();
  allProducts = allProducts.filter(
    (p: any) =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.slug?.toLowerCase().includes(searchLower)
  );
}

// Calculate pagination
const total = allProducts.length;
const totalPages = Math.ceil(total / limit);
const offset = (page - 1) * limit;
const paginatedProducts = allProducts.slice(offset, offset + limit);

return NextResponse.json({
  success: true,
  data: paginatedProducts,
  count: paginatedProducts.length,
  pagination: {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  },
});
```

### Where to Fix

**Service Layer:**

- `src/services/products.service.ts` - `list()` method

**API Routes:**

- `src/app/api/products/route.ts` - GET endpoint
- Any other list endpoints (shops, categories, orders, etc.)

### Key Points

1. **Service must pass through `page` and `limit`** from filters
2. **API must slice results** based on page/limit
3. **API must return pagination metadata**: total, totalPages, hasNextPage, hasPrevPage
4. **Frontend expects pagination object**: `response.pagination.total`, `response.pagination.totalPages`

### Testing

```bash
# Test pagination
curl "http://localhost:3000/api/products?page=1&limit=10" | jq '.pagination'
# Should return:
# {
#   "page": 1,
#   "limit": 10,
#   "total": 100,
#   "totalPages": 10,
#   "hasNextPage": true,
#   "hasPrevPage": false
# }

# Test page 2
curl "http://localhost:3000/api/products?page=2&limit=10" | jq '.data | length'
# Should return: 10
```

### Common Mistakes

❌ **Using Firestore `.limit()` for pagination**:

```typescript
// This doesn't work with client-side filters
const snapshot = await query.limit(limit).get();
```

✅ **Get all, filter, then slice**:

```typescript
// Get all matching products
const snapshot = await query.get();
// Apply filters
let products = applyFilters(snapshot.docs);
// Then paginate
const paginatedProducts = products.slice(offset, offset + limit);
```

❌ **Forgetting pagination metadata**:

```typescript
// Frontend can't show page numbers
return { success: true, data: products };
```

✅ **Include full pagination object**:

```typescript
return {
  success: true,
  data: products,
  pagination: { page, limit, total, totalPages, hasNextPage, hasPrevPage },
};
```

---

## 8. Shop Product Counts Incorrect

### Symptoms

- Shops showing 0 products when they have products
- Shop product counts don't match actual number of products
- Shop stats showing incorrect product counts
- Frontend displays wrong product count for shops

### Root Cause

**Issue 1: Boolean Field Filter** - Using `is_deleted == false` excludes undefined:

```typescript
// ❌ WRONG - Excludes products with undefined is_deleted
const productsCount = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .where("is_deleted", "==", false) // Excludes undefined!
  .count()
  .get();
```

**Issue 2: Field Name Mismatch** - API returns `product_count` but type expects `totalProducts`:

```typescript
// API returns: product_count (snake_case)
// Type expects: totalProducts (camelCase)
// Result: Frontend can't access the count
```

### Solution

**Fix 1: Get All Products, Filter in Code**

```typescript
// ✅ CORRECT - Get all published products, filter in application
const productsSnapshot = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .get();

// Filter in application code to handle undefined is_deleted
const validProducts = productsSnapshot.docs.filter(
  (doc) => doc.data().is_deleted !== true
);

return {
  ...shop,
  product_count: validProducts.length,
  totalProducts: validProducts.length, // Add camelCase alias
};
```

**Fix 2: Add CamelCase Aliases in API Response**

```typescript
// ✅ CORRECT - Add camelCase aliases for all fields
let shops = snapshot.docs.map((doc) => {
  const data: any = doc.data();
  return {
    id: doc.id,
    ...data,
    // Add camelCase aliases
    ownerId: data.owner_id,
    isVerified: data.is_verified,
    isFeatured: data.is_featured,
    isBanned: data.is_banned,
    showOnHomepage: data.show_on_homepage,
    totalProducts: data.total_products || data.product_count || 0,
    reviewCount: data.review_count || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
});
```

### Where to Fix

**API Routes:**

- `src/app/api/shops/route.ts` - List shops with product counts
- `src/app/api/shops/[slug]/route.ts` - Individual shop endpoint
- `src/app/api/shops/[slug]/stats/route.ts` - Shop statistics

### Key Points

1. **Cannot use Firestore `.where("is_deleted", "==", false)`** - Excludes undefined
2. **Must filter in application code** - Use `is_deleted !== true`
3. **Must add camelCase aliases** - API returns snake_case, frontend expects camelCase
4. **Both product_count and totalProducts** - Provide both for compatibility

### Testing

```bash
# Test shop list with product counts
curl "http://localhost:3000/api/shops" | jq '.data[0] | {name, product_count, totalProducts}'

# Should show both fields:
# {
#   "name": "Demo Shop",
#   "product_count": 10,
#   "totalProducts": 10
# }

# Test individual shop
curl "http://localhost:3000/api/shops/demo-shop" | jq '.shop | {name, totalProducts}'
```

### Common Mistakes

❌ **Using Firestore boolean filter**:

```typescript
// This excludes undefined values
.where("is_deleted", "==", false)
```

✅ **Filter in application code**:

```typescript
// Get all, then filter
const snapshot = await query.get();
const validProducts = snapshot.docs.filter(
  (doc) => doc.data().is_deleted !== true
);
```

❌ **Only returning snake_case**:

```typescript
return { id: doc.id, ...doc.data() };
// Frontend can't access product_count as totalProducts
```

✅ **Add camelCase aliases**:

```typescript
return {
  id: doc.id,
  ...doc.data(),
  totalProducts: doc.data().product_count || 0,
};
```

### Related Issues

This is similar to:

- [Category Product Counts Showing Zero](#1-category-product-counts-showing-zero)
- [Boolean Field Filtering Issues](#5-boolean-field-filtering-issues)
- [Snake Case vs Camel Case Mismatches](#6-snake-case-vs-camel-case-mismatches)

All use the same root causes:

1. Boolean field filtering with `=== false`
2. Missing camelCase aliases in API responses

---

## 9. useSearchParams Suspense Boundary Errors

### Symptoms

- Build fails with error: "useSearchParams() should be wrapped in a suspense boundary"
- Error occurs during Next.js production build
- Affects pages using URL query parameters

### Root Cause

Next.js 16+ requires `useSearchParams()` to be wrapped in a `<Suspense>` boundary for proper server-side rendering.

### Solution

**Split component and wrap in Suspense:**

```typescript
// ❌ WRONG - No Suspense boundary
"use client";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  // ... component logic
}

// ✅ CORRECT - Wrapped in Suspense
("use client");
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  // ... component logic
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
```

### Where to Fix

All pages using `useSearchParams()`:

- ✅ `src/app/not-found.tsx`
- ✅ `src/app/forbidden/page.tsx`
- ✅ `src/app/unauthorized/page.tsx`
- ✅ `src/app/login/page.tsx`
- ✅ `src/app/shops/page.tsx`
- ✅ `src/app/products/page.tsx`
- ✅ `src/app/search/page.tsx`
- ✅ `src/app/auctions/page.tsx`
- ✅ `src/app/categories/[slug]/page.tsx`
- ✅ `src/app/seller/auctions/page.tsx`

### Key Points

1. **Extract component** - Move logic using `useSearchParams()` to separate component
2. **Add Suspense import** - `import { Suspense } from "react"`
3. **Wrap with Suspense** - Default export wraps content component
4. **Provide fallback** - Loading spinner or skeleton UI

---

## 10. Invalid Date toISOString Errors

### Symptoms

- Build fails with "RangeError: Invalid time value"
- Error in sitemap generation or date transformations
- Production build crashes on `.toISOString()` calls
- Error: "Invalid time value at Date.toISOString"

### Root Cause

**Issue 1:** Calling `.toISOString()` on invalid/undefined dates:

```typescript
// ❌ WRONG - Crashes if date is invalid
const isoString = someDate.toISOString();
// If someDate is undefined, null, or invalid Date object: RangeError

// ❌ WRONG - No validation
lastModified: new Date(product.updated_at); // Crashes if updated_at is invalid
```

**Issue 2:** Firestore Timestamps not handled properly:

```typescript
// Firestore returns: { seconds: 1234567890, nanoseconds: 0 }
// Direct conversion fails
const date = new Date(firestoreTimestamp); // Invalid Date
```

**Issue 3:** Missing null checks before conversion:

```typescript
// ❌ WRONG - No validation
const dateTime = publishDate.toISOString(); // Crashes if publishDate is null/undefined
```

### Solution

**Step 1: Create Date Utility Functions**

```typescript
// src/lib/date-utils.ts

/**
 * Safely converts a date to ISO string, handling invalid dates
 * @param date - Date to convert (Date object, string, number, or Firestore timestamp)
 * @returns ISO string or null if date is invalid
 */
export function safeToISOString(date: any): string | null {
  if (!date) return null;

  try {
    // Handle Firestore Timestamp
    if (date?.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    }

    // Handle Date object, string, or number
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (error) {
    console.error("Error converting date to ISO string:", error);
    return null;
  }
}

/**
 * Safely converts a date to ISO string with fallback
 * @param date - Date to convert
 * @param fallback - Fallback value if date is invalid (defaults to current date)
 * @returns ISO string
 */
export function toISOStringOrDefault(
  date: any,
  fallback: Date = new Date()
): string {
  return safeToISOString(date) ?? fallback.toISOString();
}

/**
 * Validates if a date is valid
 * @param date - Date to validate
 * @returns true if date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;

  try {
    // Handle Firestore Timestamp
    if (date?.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      return !isNaN(d.getTime());
    }

    const d = new Date(date);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}

/**
 * Formats date for HTML input[type="date"] (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format or empty string if invalid
 */
export function toDateInputValue(date: any): string {
  const isoString = safeToISOString(date);
  return isoString ? isoString.split("T")[0] : "";
}

/**
 * Gets current date in YYYY-MM-DD format for date inputs
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayDateInputValue(): string {
  return new Date().toISOString().split("T")[0];
}
```

**Step 2: Use in Sitemap Generation**

```typescript
// src/app/sitemap.ts
import { safeToISOString } from "@/lib/date-utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, shops] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchShops(),
  ]);

  // ✅ CORRECT - Safe date handling
  const productPages: MetadataRoute.Sitemap = products
    .filter((product: any) => product.slug)
    .map((product: any) => {
      const lastMod = safeToISOString(product.updated_at || product.updatedAt);
      return {
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: lastMod ? new Date(lastMod) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

  return [...staticPages, ...productPages, ...categoryPages];
}
```

**Step 3: Use in Type Transformers**

```typescript
// src/types/transforms/shop.transforms.ts
import { safeToISOString } from "@/lib/date-utils";

export function toFEShop(shopBE: ShopBE): ShopFE {
  return {
    id: shopBE.id,
    name: shopBE.name,
    // ... other fields
    createdAt: safeToISOString(shopBE.createdAt) || undefined,
  };
}
```

**Step 4: Use in Form Submissions**

```typescript
// src/types/transforms/auction.transforms.ts
import { safeToISOString } from "@/lib/date-utils";

export function toBECreateAuctionRequest(
  formData: AuctionFormFE
): CreateAuctionRequestBE {
  return {
    productId: formData.productId,
    startingPrice: formData.startingPrice,
    startTime: safeToISOString(formData.startTime) || new Date().toISOString(),
    endTime: safeToISOString(formData.endTime) || new Date().toISOString(),
    // ... other fields
  };
}
```

**Step 5: Use in Components**

```typescript
// src/app/blog/[slug]/BlogPostClient.tsx
import { safeToISOString } from "@/lib/date-utils";

export default function BlogPostClient({ post }: Props) {
  return (
    <time dateTime={safeToISOString(publishDate) || new Date().toISOString()}>
      {formatDate(publishDate)}
    </time>
  );
}
```

### Where to Fix

**Files Updated:**

- ✅ `src/lib/date-utils.ts` - New utility file
- ✅ `src/app/sitemap.ts` - Sitemap generation
- ✅ `src/types/transforms/shop.transforms.ts` - Shop transformers
- ✅ `src/types/transforms/auction.transforms.ts` - Auction transformers
- ✅ `src/types/transforms/coupon.transforms.ts` - Coupon transformers
- ✅ `src/types/transforms/order.transforms.ts` - Order transformers
- ✅ `src/app/blog/[slug]/BlogPostClient.tsx` - Blog post display

**Pattern to Apply Everywhere:**

Replace all instances of:

```typescript
// ❌ WRONG
date.toISOString();

// ✅ CORRECT
safeToISOString(date) || new Date().toISOString();
// or
safeToISOString(date) || undefined; // if null is acceptable
```

### Key Points

1. **Always validate dates** before calling `.toISOString()`
2. **Handle Firestore Timestamps** - Check for `.seconds` property
3. **Provide fallbacks** - Use current date or undefined as appropriate
4. **Filter invalid entries** - In sitemaps and lists, filter out items with invalid dates
5. **Centralize date logic** - Use utility functions for consistency

### Testing

```bash
# Test build to verify all date errors are fixed
npm run build

# Should complete successfully without "Invalid time value" errors
```

### Common Locations

Search for these patterns in your codebase:

```bash
# Find all .toISOString() calls
grep -r "\.toISOString()" src/ --include="*.ts" --include="*.tsx"

# Check for potential issues
grep -r "new Date(.*).toISOString()" src/ --include="*.ts" --include="*.tsx"
```

### Prevention Strategies

1. **Import date-utils in all files that handle dates:**

```typescript
import { safeToISOString, toDateInputValue } from "@/lib/date-utils";
```

2. **Add ESLint rule** (optional):

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='toISOString']",
        "message": "Use safeToISOString() instead of .toISOString() for safety"
      }
    ]
  }
}
```

3. **Code review checklist:**
   - ✅ All `.toISOString()` calls wrapped in try-catch or use `safeToISOString()`
   - ✅ Firestore timestamps handled properly
   - ✅ Null/undefined checks before date operations
   - ✅ Fallback values provided where appropriate

### Related Issues

This fix resolves:

- Sitemap generation errors
- Form submission crashes
- Data transformation errors
- Build-time failures

---

## Debugging Checklist
