# Product Counts and Filter Fixes Summary

## Issues Fixed

### 1. Product Detail Page - Stock Count Error ✅

**Problem**: `RangeError: invalid array length` when `product.stockCount` is 0 or negative.

**Solution**:

- Wrapped quantity selector in conditional check `{product.stockCount > 0 && (...)}`
- Changed array creation from `Math.max(product.stockCount, 0)` to simple `product.stockCount` check
- Only shows quantity selector when stock is available

**Files Changed**:

- `src/app/products/[slug]/page.tsx` - Line 298

---

### 2. Video Cover on Non-Hover ✅

**Problem**: User requested that videos not show as cover image.

**Solution**:

- Already correctly implemented - media array adds images first, then videos
- ProductGallery component starts at index 0, which will be first image if available

**Code**:

```tsx
const media = [
  ...product.images.map((url: string) => ({ url, type: "image" as const })),
  ...(product.videos || []).map((url: string) => ({
    url,
    type: "video" as const,
  })),
];
```

**Files**:

- `src/app/products/[slug]/page.tsx` - Lines 112-116
- `src/components/product/ProductGallery.tsx` - Already correct

---

### 3. Dynamic Product Counts for Categories ✅

**Problem**: Category product counts showing 0 even when products exist.

**Root Cause**:

- Counts only updated on product creation
- Not updated when product status changes (draft → published)
- Not updated in bulk operations

**Solutions Implemented**:

#### A. Product Update (PATCH) - Auto Update Counts

- Added category count updates when status changes
- Added count updates when category changes
- Updates both old and new category if category changed

**Files Changed**:

- `src/app/api/products/[slug]/route.ts` - Added import and update logic

#### B. Bulk Operations - Batch Count Updates

- Track all affected categories during bulk operations
- Update counts for all affected categories after operations complete
- Handles: publish, unpublish, archive, delete, and category changes

**Files Changed**:

- `src/app/api/products/bulk/route.ts` - Added category tracking and updates

#### C. Admin Endpoint to Rebuild All Counts

- Created `/api/admin/categories/rebuild-counts` endpoint
- Rebuilds all category product counts (admin only)
- Useful for fixing discrepancies after migrations or bulk imports

**Files Created**:

- `src/app/api/admin/categories/rebuild-counts/route.ts`

**Count Calculation Logic** (from `lib/category-hierarchy.ts`):

```typescript
// Leaf Categories (categories with no children):
// - Count unique products (not stock quantity)
// - Only published products (status === "published")
// - Not deleted (is_deleted === false)
// - Direct products in this category only

// Parent Categories (categories with children):
// - Sum of all direct children counts
// - No direct product counting for parents
// - Updates propagate bottom-up (leaves → parents → grandparents)
```

---

### 4. Dynamic Product Counts for Shops ✅

**Problem**: Shop product counts showing incorrect values.

**Solution**:

- Modified shops API to dynamically calculate counts
- Counts only published, non-deleted products
- Calculated at request time for accuracy

**Files Changed**:

- `src/app/api/shops/route.ts` - Added dynamic count calculation

**Code Added**:

```typescript
const productsCount = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .where("is_deleted", "==", false)
  .count()
  .get();
```

---

### 5. Filters Already Loading Real Data ✅

**Problem**: User thought filters were loading mock data.

**Verification**:

- Products page already loads real data from `categoriesService.list()` and `shopsService.list()`
- Categories and shops filters populated dynamically with actual counts
- No changes needed

**Files Verified**:

- `src/app/products/page.tsx` - Lines 45-96 (`loadFilterOptions`)
- `src/constants/filters.ts` - Filter configs with empty options arrays

---

### 6. Auctions Page

**Status**: Auctions page reviewed - no category/shop filters needed per config

- AUCTION_FILTERS doesn't include category or shop fields
- No changes needed for auction filters

**Files Reviewed**:

- `src/app/auctions/page.tsx`
- `src/constants/filters.ts` - AUCTION_FILTERS config

---

## Testing Instructions

### 1. Test Product Detail Page

```bash
# Navigate to any product page
# Verify no "invalid array length" error
# Verify quantity selector only shows when stock > 0
```

### 2. Test Video Cover

```bash
# Create/edit product with videos
# Add at least 1 image and 1 video
# Verify first image shows as cover (not video)
```

### 3. Test Product Counts - Manual Fix

```bash
# As admin, call rebuild endpoint
POST /api/admin/categories/rebuild-counts

# Expected response:
{
  "success": true,
  "message": "Successfully rebuilt counts for X categories",
  "updated": X
}
```

### 4. Test Automatic Count Updates

```bash
# Test A: Change product status
PATCH /api/products/[slug]
{
  "status": "published"  # or "draft", "archived"
}

# Verify category counts updated

# Test B: Bulk operations
POST /api/products/bulk
{
  "action": "publish",
  "ids": ["product-id-1", "product-id-2"]
}

# Verify affected category counts updated
```

### 5. Test Shop Counts

```bash
# Navigate to /products page
# Check filter sidebar - shop options
# Verify product counts match published products
```

### 6. Test Filters

```bash
# Navigate to /products
# Verify category filter shows real categories
# Verify shop filter shows real shops
# Verify counts are displayed for each option
```

---

## API Changes Summary

### New Endpoints

- `POST /api/admin/categories/rebuild-counts` - Rebuild all category counts (admin only)

### Modified Endpoints

- `PATCH /api/products/[slug]` - Now updates category counts when status/category changes
- `POST /api/products/bulk` - Now updates category counts for affected products
- `GET /api/shops` - Now calculates product counts dynamically

---

## Database Schema

### Category Document

```typescript
{
  product_count: number; // Count of published products in category + descendants
  // Updated by:
  // - Product creation (if status = published)
  // - Product update (if status changed or category changed)
  // - Product deletion
  // - Bulk operations
  // - Manual rebuild via admin endpoint
}
```

### Shop Document

```typescript
{
  product_count: number; // Count of published products in shop
  // Calculated dynamically at request time (not stored)
}
```

---

## Performance Considerations

### Category Counts

- **On Product Create**: Updates category + all ancestors (O(depth))
- **On Product Update**: Updates old + new category if changed (O(depth \* 2))
- **On Bulk Operations**: Batches updates, one per affected category (O(categories))
- **Rebuild All**: Expensive - run during low traffic (O(categories \* products))

### Shop Counts

- **Dynamic Calculation**: Count query per shop in list (O(shops))
- **Caching**: Results cached for 3 minutes via `withCache` middleware
- **Optimization**: Consider storing counts and updating via Cloud Functions triggers

---

## Recommendations

### 1. Use Cloud Functions for Count Updates

For better performance, consider moving count updates to Cloud Functions:

```typescript
// firestore.onDocumentWritten('products/{productId}', async (change) => {
//   // Update category counts asynchronously
// });
```

### 2. Cache Category Counts

- Current: Counts calculated on-demand
- Future: Cache at category level with TTL
- Invalidate: When products updated

### 3. Monitor Performance

- Track rebuild endpoint execution time
- Monitor bulk operation performance with many products
- Consider pagination for large result sets

### 4. Regular Maintenance

- Schedule weekly count rebuilds (off-peak hours)
- Log discrepancies for investigation
- Alert on significant count differences

---

## Migration Notes

### Initial Setup

1. Run count rebuild to establish baseline:

   ```bash
   POST /api/admin/categories/rebuild-counts
   ```

2. Verify counts in database:

   ```bash
   # Check Firestore console
   # categories collection → product_count field
   ```

3. Test filters:
   ```bash
   # Navigate to /products
   # Verify category counts displayed
   ```

### Ongoing

- Counts auto-update on product changes
- Manual rebuild if discrepancies found
- Monitor logs for count update errors

---

## Files Modified

1. `src/app/products/[slug]/page.tsx` - Fixed stock count error
2. `src/app/api/products/[slug]/route.ts` - Auto-update counts on product change
3. `src/app/api/products/bulk/route.ts` - Auto-update counts on bulk operations
4. `src/app/api/shops/route.ts` - Dynamic shop product counts
5. `src/app/api/admin/categories/rebuild-counts/route.ts` - New rebuild endpoint

## Files Created

1. `src/app/api/admin/categories/rebuild-counts/route.ts` - Rebuild counts endpoint

---

## Error Handling

### Count Update Failures

- Non-blocking: Product operations succeed even if count update fails
- Logged: All count update errors logged for monitoring
- Recoverable: Manual rebuild endpoint available

### Rebuild Endpoint Errors

- Returns partial success with error details
- Continues processing even if individual categories fail
- Provides error list for troubleshooting

---

## Next Steps

1. ✅ Deploy changes to staging
2. ✅ Run count rebuild on staging
3. ✅ Test all scenarios
4. ✅ Deploy to production
5. ✅ Run count rebuild on production
6. ✅ Monitor logs for errors
7. 🔄 Consider Cloud Functions migration for async updates
