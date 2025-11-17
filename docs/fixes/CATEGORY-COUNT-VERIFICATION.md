# Category Count Verification Guide

## The Data Flow

```
Firestore Database
    ↓
    product_count field (snake_case)
    ↓
API Route (/api/categories)
    ↓
    Transforms to productCount (camelCase)
    ↓
Frontend Components (CategoryCard)
    ↓
    Displays productCount prop
```

## Current Mapping (CORRECT)

**Firestore Field**: `product_count`
**API Response**: `productCount`
**CategoryCard Prop**: `productCount`

✅ **The mapping is correct!**

## Why You're Seeing 0

The issue is NOT with the CategoryCard reading data.
The issue is that `product_count` in Firestore is actually 0.

This happens when:

1. ❌ No published products exist
2. ❌ Products have `status != "published"`
3. ❌ Products have `is_deleted = true`
4. ❌ Products have wrong `category_id`
5. ❌ Parent categories have no children with products

## Verification Steps

### Step 1: Check Firestore Directly

Open Firebase Console → Firestore → `categories` collection

Look for `product_count` field values. Are they all 0?

### Step 2: Check Products Collection

Open Firebase Console → Firestore → `products` collection

Check if products have:

- ✅ `status: "published"`
- ✅ `is_deleted: false`
- ✅ `category_id: "<valid-category-id>"`

### Step 3: Use Debug Endpoint

```
GET http://localhost:3000/api/admin/debug/products-by-category
```

This will show:

- Total products in database
- Published vs draft/archived products
- Products grouped by category_id
- Current product_count values in categories

### Step 4: Check Rebuild Logs

Look at your terminal after running rebuild:

```
Found X categories to rebuild
Updated Category1 (id1): 0 products  ← This shows the count
Updated Category2 (id2): 5 products
Updated Category3 (id3): 0 products
```

## Quick Fix: Create Test Product

If no products exist, create one:

```typescript
POST /api/products
Content-Type: application/json

{
  "name": "Test Product",
  "slug": "test-product-unique-123",
  "description": "Test description",
  "price": 100,
  "category_id": "<YOUR_LEAF_CATEGORY_ID>",  // ← Important: Use a LEAF category
  "shop_id": "<YOUR_SHOP_ID>",
  "status": "published",  // ← Must be "published"
  "is_deleted": false,    // ← Must be false
  "stock_count": 10,
  "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"]
}
```

Then rebuild:

```
POST /api/admin/categories/rebuild-counts
```

Check category:

```
GET /api/categories
```

Look for the category with your test product - it should show `productCount: 1`

## Example Debug Output

If everything is working, you'll see:

```json
{
  "success": true,
  "details": {
    "totalCategories": 10,
    "categoryCounts": {
      "cat123": {
        "name": "Electronics",
        "count": 0,
        "isLeaf": false
      },
      "cat456": {
        "name": "Phones",
        "count": 5, // ← Shows 5 products
        "isLeaf": true
      }
    }
  }
}
```

## Common Scenarios

### Scenario 1: All counts are 0

**Cause**: No published products exist
**Fix**: Create published products OR change existing products to "published" status

### Scenario 2: Leaf categories show 0, but products exist

**Cause**: Products have wrong `category_id` or are not published
**Fix**: Check product `category_id` matches category `id`

### Scenario 3: Parent categories show 0, but children have counts

**Cause**: Children `parent_ids` array doesn't include parent's id
**Fix**: Update category `parent_ids` field in Firestore

### Scenario 4: Some categories show counts, others don't

**Cause**: Mix of the above
**Fix**: Use debug endpoint to identify which categories have issues

## Next Action

Run this and share the output:

```
GET http://localhost:3000/api/admin/debug/products-by-category
```

This will tell us exactly why counts are 0.
