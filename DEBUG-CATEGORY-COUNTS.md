# Debug Category Counts Issue

## The Problem

Category counts showing 0 even after rebuild.

## Debugging Steps

### 1. Check if products exist and their statuses

Visit: `http://localhost:3000/api/admin/debug/products-by-category`

This will show you:

- Total products in database
- Published vs non-published products
- Products grouped by category
- Current category product_count values

### 2. Check specific category

Visit: `http://localhost:3000/api/admin/debug/products-by-category?categoryId=<CATEGORY_ID>`

Replace `<CATEGORY_ID>` with an actual category ID from your database.

### 3. Rebuild with detailed logging

POST: `http://localhost:3000/api/admin/categories/rebuild-counts`

Now returns detailed information about each category:

- How many products were counted
- Whether it's a leaf or parent category
- Category name and ID

### 4. Check the logs

Look at your terminal/console output for:

```
Found X categories to rebuild
Updated <CategoryName> (<id>): X products
Rebuild complete: X categories updated, X errors
```

## Common Issues

### Issue 1: No published products

**Check**: Are your products marked as `status: "published"`?
**Fix**: Update products to published status or create test products

### Issue 2: Products marked as deleted

**Check**: Are products marked as `is_deleted: false`?
**Fix**: Update is_deleted field to false

### Issue 3: Category ID mismatch

**Check**: Do products have the correct `category_id` field?
**Fix**: Ensure category_id matches actual category IDs

### Issue 4: Parent categories not summing children

**Check**: Do parent categories have children with counts > 0?
**Fix**: Ensure leaf categories are counted first, then parents

## Quick Test

### Create a test product:

```typescript
POST /api/products
{
  "name": "Test Product",
  "slug": "test-product-123",
  "description": "Test",
  "price": 100,
  "category_id": "<YOUR_CATEGORY_ID>",
  "shop_id": "<YOUR_SHOP_ID>",
  "status": "published",
  "stock_count": 10,
  "images": ["https://via.placeholder.com/400"]
}
```

### Then rebuild counts:

```
POST /api/admin/categories/rebuild-counts
```

### Check the category:

```
GET /api/categories/<category-slug>
```

Should show `product_count: 1`

## Understanding the Count Logic

### For Leaf Categories (no children):

```sql
SELECT COUNT(*) FROM products
WHERE category_id = 'leaf-category-id'
  AND status = 'published'
  AND is_deleted = false
```

### For Parent Categories (has children):

```sql
SELECT SUM(product_count) FROM categories
WHERE parent_ids CONTAINS 'parent-category-id'
```

## Next Steps

1. Run the debug endpoint to see current state
2. Check if products exist and are published
3. Verify category hierarchy is correct
4. Run rebuild with new logging
5. Share the output here for further analysis
