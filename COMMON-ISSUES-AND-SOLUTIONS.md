# Common Issues and Solutions - Next.js Auction Platform

## Table of Contents

1. [Category Product Counts Showing Zero](#1-category-product-counts-showing-zero)
2. [Product Details Not Loading](#2-product-details-not-loading)
3. [API Response Data Not Displaying](#3-api-response-data-not-displaying)
4. [Product Card Image Rotation Not Working](#4-product-card-image-rotation-not-working)
5. [Boolean Field Filtering Issues](#5-boolean-field-filtering-issues)
6. [Snake Case vs Camel Case Mismatches](#6-snake-case-vs-camel-case-mismatches)
7. [Pagination Not Working](#7-pagination-not-working)

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

## Debugging Checklist

### When Product Data Isn't Showing

1. **Check API Response**

   ```bash
   curl http://localhost:3000/api/products/[slug] | jq
   ```

   - ✅ Does it have `success: true`?
   - ✅ Does `data` object exist?
   - ✅ Are camelCase aliases present?

2. **Check Service Method**

   ```typescript
   // Add console.log temporarily
   async getBySlug(slug: string): Promise<ProductFE> {
     const response: any = await apiService.get(route);
     console.log("API Response:", response);
     console.log("Extracted Data:", response.data);
     return toFEProduct(response.data);
   }
   ```

3. **Check Transformer**

   ```typescript
   export function toFEProduct(productBE: ProductBE): ProductFE {
     console.log("Input to transformer:", productBE);
     const result = {
       /* transformation */
     };
     console.log("Transformer output:", result);
     return result;
   }
   ```

4. **Check Frontend Component**
   ```typescript
   const product = await productsService.getBySlug(slug);
   console.log("Product in component:", product);
   ```

### When Categories Show Zero

1. **Check Product Documents**

   ```bash
   # In Firebase Console or Firestore tool
   - Do products have `is_deleted` field?
   - What are the values? (undefined, true, false)
   ```

2. **Check Counting Logic**

   ```typescript
   // Add logging
   const validProducts = snapshot.docs.filter((doc) => {
     const data = doc.data();
     const isValid = data.is_deleted !== true;
     console.log(
       `Product ${doc.id}: is_deleted=${data.is_deleted}, valid=${isValid}`
     );
     return isValid;
   });
   ```

3. **Rebuild Counts**
   ```bash
   POST http://localhost:3000/api/admin/categories/rebuild-counts
   ```

---

## Prevention Strategies

### 1. Use Type Guards

```typescript
function isNotDeleted(doc: any): boolean {
  return doc.is_deleted !== true;
}

const activeProducts = products.filter(isNotDeleted);
```

### 2. Create Utility Functions

```typescript
// src/lib/firestore-utils.ts
export function firestoreToFrontend(data: any): any {
  return addCamelCaseAliases(data);
}

export function isActive(doc: any): boolean {
  return doc.is_deleted !== true && doc.is_active !== false;
}
```

### 3. Document API Contracts

```typescript
/**
 * GET /api/products/[slug]
 *
 * @returns {
 *   success: boolean,
 *   data: ProductBE  // Contains both snake_case and camelCase
 * }
 */
```

### 4. Add Tests

```typescript
describe("Product API", () => {
  it("should return camelCase aliases", async () => {
    const response = await fetch("/api/products/test-slug");
    const json = await response.json();

    expect(json.data.shopId).toBeDefined();
    expect(json.data.compareAtPrice).toBeDefined();
    expect(json.data.stockCount).toBeDefined();
  });
});
```

---

## Quick Reference Commands

### Rebuild Category Counts

```bash
curl -X POST http://localhost:3000/api/admin/categories/rebuild-counts
```

### Check Product API

```bash
curl http://localhost:3000/api/products/[slug] | jq '.data | keys'
```

### Debug Products by Category

```bash
curl http://localhost:3000/api/admin/debug/products-by-category | jq
```

### Search for Missing .data Unwrapping

```bash
grep -r "apiService.get<" src/services/ | grep -v "response.data"
```

### Find Boolean Field Checks

```bash
grep -r "=== false" src/ --include="*.ts" --include="*.tsx"
```

---

## Related Documentation

- [PRODUCT-API-FIXES-NOV-17-2025.md](./PRODUCT-API-FIXES-NOV-17-2025.md) - Product API fixes
- [COMPLETE-FIX-SUMMARY-NOV-17-2025.md](./COMPLETE-FIX-SUMMARY-NOV-17-2025.md) - Category count fixes
- [IS_DELETED-FIELD-FIX-SUMMARY.md](./IS_DELETED-FIELD-FIX-SUMMARY.md) - Boolean field handling

---

## Summary

**Most Common Issues:**

1. ❌ Using `=== false` instead of `!== true` for boolean checks
2. ❌ Not unwrapping `.data` from API responses
3. ❌ Missing camelCase aliases in API responses
4. ❌ Effect dependency issues causing interval recreation
5. ❌ Hardcoding pagination values in service layer
6. ❌ Not implementing pagination logic in API routes

**Always Remember:**

- ✅ Boolean checks: Use `!== true` pattern
- ✅ API responses: Return both snake_case and camelCase
- ✅ Service methods: Extract `response.data`
- ✅ Effects: Minimize dependencies, split concerns
- ✅ Pagination: Pass through page/limit, slice results, return metadata

---

_Last Updated: November 17, 2025_
