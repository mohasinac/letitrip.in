# Quick Reference: Cascade Delete Categories

## TL;DR

When you delete a category, it now:

- ✅ Deletes all subcategories recursively
- ✅ Removes category from affected products
- ✅ Updates parent category references

## For Developers

### API Endpoint

```typescript
DELETE /api/admin/categories?id={categoryId}
Authorization: Bearer {firebase-token}
Role: Admin only
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "category-id",
    "deletedCategoriesCount": 5,
    "updatedProductsCount": 12
  },
  "message": "Successfully deleted 5 categories and updated 12 products"
}
```

### Code Example

```typescript
import { apiClient } from "@/lib/api/client";

async function deleteCategory(categoryId: string) {
  try {
    const response = await apiClient.delete(
      `/admin/categories?id=${categoryId}`
    );

    console.log(`Deleted ${response.data.deletedCategoriesCount} categories`);
    console.log(`Updated ${response.data.updatedProductsCount} products`);

    return response;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}
```

## For Admins

### UI Flow

1. Go to: **Admin Panel** → **Categories**
2. Click **trash icon** next to any category
3. Read the warning (especially for parent categories!)
4. Confirm deletion
5. See success message with statistics

### Warning Messages

**Leaf Category:**

> Are you sure you want to delete this category?
>
> This will also remove the category assignment from all products using it.

**Parent Category:**

> ⚠️ WARNING: This category has subcategories!
>
> Deleting this category will:
> • Delete ALL subcategories recursively
> • Remove category assignment from all affected products
>
> This action CANNOT be undone!
>
> Are you absolutely sure you want to proceed?

## Common Scenarios

### Scenario 1: Delete Leaf Category

```
Before: Beyblades → Metal Series → Metal Fusion (10 products)
Delete: Metal Fusion
After:  Beyblades → Metal Series (10 products with no category)
```

### Scenario 2: Delete Parent Category

```
Before: Beyblades
        ├── Metal Series
        │   ├── Metal Fusion (10 products)
        │   └── Metal Masters (5 products)
        └── Burst Series (8 products)

Delete: Metal Series

After:  Beyblades
        └── Burst Series (8 products)

        15 products now have no category assigned
```

### Scenario 3: Delete Root Category

```
Before: Beyblades (parent of everything)
        ├── Metal Series
        │   ├── Metal Fusion (10 products)
        │   └── Metal Masters (5 products)
        └── Burst Series
            └── Burst Turbo (8 products)

Delete: Beyblades

After:  (All categories deleted)
        23 products now have no category assigned
```

## Testing Checklist

- [ ] Delete leaf category (no children)
- [ ] Delete parent with 1 level of children
- [ ] Delete parent with 2+ levels of children
- [ ] Verify products updated correctly
- [ ] Verify parent references updated
- [ ] Test with 0 products
- [ ] Test with 100+ products
- [ ] Test with 10+ categories (Firestore limit)

## Key Files

```
src/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── categories/
│   │           └── route.ts          ← Backend logic
│   └── admin/
│       └── categories/
│           └── page.tsx              ← Frontend UI
├── lib/
│   └── api/
│       └── services/
│           └── category.service.ts   ← Service layer
└── components/
    └── admin/
        └── categories/
            ├── CategoryTreeView.tsx  ← Tree view
            └── CategoryListView.tsx  ← List view
```

## Important Functions

### Backend: `findAllSubcategories()`

```typescript
// Recursively finds all subcategories using BFS
function findAllSubcategories(
  categoryId: string,
  allCategories: Category[]
): string[];
```

### Backend: `DELETE` endpoint

```typescript
// Main deletion handler
export async function DELETE(request: NextRequest);
```

### Frontend: `handleDelete()`

```typescript
// UI handler with warnings
const handleDelete = async (categoryId: string)
```

## Database Collections Affected

1. **categories** - Deletes category documents
2. **seller_products** - Updates product category assignments
3. **categories** (parent) - Updates parent's childIds array

## Firestore Considerations

- Max 10 items in `in` query → Solution: Batch queries
- No atomic multi-collection transactions → Solution: Individual promises
- Parallel execution for performance → Solution: `Promise.all()`

## Error Handling

| Error Code | Meaning            | Solution               |
| ---------- | ------------------ | ---------------------- |
| 401        | Not authenticated  | Login as admin         |
| 400        | Invalid request    | Check category ID      |
| 404        | Category not found | Verify category exists |
| 500        | Server error       | Check logs, retry      |

## Logging

All operations are logged:

```typescript
console.log(
  `Deleting category ${categoryId} and ${subcategoryIds.length} subcategories`
);
console.log(`Updated ${productUpdatePromises.length} products`);
```

## Performance

- **Time**: O(n) where n = total categories
- **Space**: O(n + c) where c = categories to delete
- **Network**: 2 reads + (p + c + r) writes
  - p = products to update
  - c = categories to delete
  - r = parent refs to update

## Security

✅ Admin-only endpoint  
✅ Firebase Auth required  
✅ Proper validation  
✅ Audit logging

## Related Docs

- Full Documentation: `docs/features/CASCADE_DELETE_CATEGORIES.md`
- Visual Flow: `CASCADE_DELETE_VISUAL_FLOW.md`
- Implementation Summary: `CASCADE_DELETE_IMPLEMENTATION_SUMMARY.md`

## Need Help?

1. Check the dev server logs
2. Verify Firebase permissions
3. Test with a simple category first
4. Review the warning messages carefully

---

**Last Updated:** November 1, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
