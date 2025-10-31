# Cascade Delete Categories Feature

## Overview

The cascade delete feature allows administrators to delete a parent category along with all its subcategories and automatically updates all products that were assigned to those categories.

**Status**: ✅ Implemented  
**Date**: November 1, 2025  
**Author**: GitHub Copilot

---

## What It Does

When you delete a category that has subcategories:

1. **Recursively Deletes All Subcategories**: Finds and deletes all subcategories at any depth level
2. **Updates Products**: Sets `categoryId` to empty string and `categoryName` to empty for all products using any of the deleted categories
3. **Updates Parent References**: Removes the deleted category from its parent's `childIds` array

---

## Implementation Details

### Backend Logic (`/api/admin/categories` DELETE endpoint)

#### Helper Function: `findAllSubcategories`

```typescript
function findAllSubcategories(
  categoryId: string,
  allCategories: Category[]
): string[] {
  const subcategoryIds: string[] = [];
  const queue = [categoryId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // Find all direct children of the current category
    const children = allCategories.filter((cat) =>
      cat.parentIds?.includes(currentId)
    );

    for (const child of children) {
      if (!subcategoryIds.includes(child.id)) {
        subcategoryIds.push(child.id);
        queue.push(child.id);
      }
    }
  }

  return subcategoryIds;
}
```

**How it works:**

- Uses a breadth-first search (BFS) algorithm
- Starts with the parent category
- Finds all direct children, then their children, recursively
- Returns an array of all subcategory IDs

#### Delete Process

1. **Find All Categories to Delete**:

   ```typescript
   const subcategoryIds = findAllSubcategories(categoryId, allCats);
   const allCategoriesToDelete = [categoryId, ...subcategoryIds];
   ```

2. **Update Products** (Handles Firestore's 10-item limit for `in` queries):

   ```typescript
   for (let i = 0; i < allCategoriesToDelete.length; i += 10) {
     const batch = allCategoriesToDelete.slice(i, i + 10);
     const snapshot = await db
       .collection("seller_products")
       .where("categoryId", "in", batch)
       .get();

     for (const doc of snapshot.docs) {
       await doc.ref.update({
         categoryId: "",
         categoryName: "",
         updatedAt: new Date().toISOString(),
       });
     }
   }
   ```

3. **Delete All Categories**:

   ```typescript
   const deleteCategoryPromises = allCategoriesToDelete.map((catId) =>
     db.collection(CATEGORIES_COLLECTION).doc(catId).delete()
   );
   await Promise.all(deleteCategoryPromises);
   ```

4. **Update Parent References**:
   ```typescript
   if (category.parentIds && category.parentIds.length > 0) {
     for (const parentId of category.parentIds) {
       // Remove deleted category from parent's childIds
       // Update parent's isLeaf status
     }
   }
   ```

### Frontend Implementation (`/admin/categories/page.tsx`)

#### Enhanced Delete Handler

```typescript
const handleDelete = async (categoryId: string) => {
  // Check if category has children
  const hasChildren = categories.some((cat) =>
    cat.parentIds?.includes(categoryId)
  );

  // Show different warning based on whether it has children
  const confirmMessage = hasChildren
    ? "⚠️ WARNING: This category has subcategories!\n\n" +
      "Deleting this category will:\n" +
      "• Delete ALL subcategories recursively\n" +
      "• Remove category assignment from all affected products\n\n" +
      "This action CANNOT be undone!\n\n" +
      "Are you absolutely sure you want to proceed?"
    : "Are you sure you want to delete this category?\n\n" +
      "This will also remove the category assignment from all products using it.";

  // Delete and show detailed success message
  const response = await apiClient.delete(`/admin/categories?id=${categoryId}`);
  const message = `Successfully deleted ${response.data.deletedCategoriesCount} categories and updated ${response.data.updatedProductsCount} products`;
};
```

---

## API Response

### DELETE `/api/admin/categories?id={categoryId}`

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "category123",
    "deletedCategoriesCount": 5,
    "updatedProductsCount": 12
  },
  "message": "Successfully deleted 5 categories and updated 12 products"
}
```

**Error Responses**:

- `401`: Authentication required
- `400`: Category ID is required
- `404`: Category not found
- `500`: Failed to delete category

---

## User Experience

### Deleting a Leaf Category (No Children)

**Confirmation Dialog**:

```
Are you sure you want to delete this category?

This will also remove the category assignment from all products using it.

[Cancel] [OK]
```

**Success Message**:

```
✓ Successfully deleted 1 categories and updated 3 products
```

### Deleting a Parent Category (With Children)

**Confirmation Dialog**:

```
⚠️ WARNING: This category has subcategories!

Deleting this category will:
• Delete ALL subcategories recursively
• Remove category assignment from all affected products

This action CANNOT be undone!

Are you absolutely sure you want to proceed?

[Cancel] [OK]
```

**Success Message**:

```
✓ Successfully deleted 5 categories and updated 12 products
```

---

## Example Scenarios

### Scenario 1: Simple Hierarchy

**Before Delete**:

```
Electronics
├── Phones
│   ├── iPhone (3 products)
│   └── Android (5 products)
└── Laptops (2 products)
```

**After Deleting "Phones"**:

```
Electronics
└── Laptops (2 products)

[Deleted]: Phones, iPhone, Android (8 products affected)
```

### Scenario 2: Complex Multi-Level Hierarchy

**Before Delete**:

```
Beyblades (parent)
├── Metal Series
│   ├── Metal Fusion (10 products)
│   ├── Metal Masters (8 products)
│   └── Metal Fury (6 products)
└── Burst Series
    ├── Burst Evolution (12 products)
    └── Burst Turbo (9 products)
```

**After Deleting "Metal Series"**:

```
Beyblades (parent)
└── Burst Series
    ├── Burst Evolution (12 products)
    └── Burst Turbo (9 products)

[Deleted]: Metal Series, Metal Fusion, Metal Masters, Metal Fury
[Updated]: 24 products now have no category assigned
```

---

## Database Impact

### Categories Collection

**Before**:

```json
{
  "id": "metal-series",
  "name": "Metal Series",
  "parentIds": ["beyblades"],
  "childIds": ["metal-fusion", "metal-masters", "metal-fury"]
}
```

**After**: Document deleted

### Products Collection

**Before**:

```json
{
  "id": "product123",
  "name": "Storm Pegasus",
  "categoryId": "metal-fusion",
  "categoryName": "Metal Fusion"
}
```

**After**:

```json
{
  "id": "product123",
  "name": "Storm Pegasus",
  "categoryId": "",
  "categoryName": "",
  "updatedAt": "2025-11-01T..."
}
```

### Parent Category

**Before**:

```json
{
  "id": "beyblades",
  "name": "Beyblades",
  "childIds": ["metal-series", "burst-series"]
}
```

**After**:

```json
{
  "id": "beyblades",
  "name": "Beyblades",
  "childIds": ["burst-series"],
  "isLeaf": false
}
```

---

## Technical Considerations

### Firestore Limitations

1. **`in` Query Limit**: Firestore allows max 10 items in an `in` query

   - **Solution**: Batch queries in groups of 10

2. **Transaction Limits**: Max 500 operations per transaction

   - **Solution**: Use individual promises with `Promise.all()`

3. **No Atomic Multi-Collection Transactions**:
   - **Risk**: If deletion fails mid-process, data may be inconsistent
   - **Mitigation**: Proper error handling and logging

### Performance

- **Time Complexity**: O(n) where n is the total number of categories
- **Product Updates**: Batched in groups of 10 to respect Firestore limits
- **Parallel Execution**: Category deletions happen in parallel for speed

---

## Testing

### Manual Testing Checklist

- [ ] Delete a leaf category (no children)
- [ ] Delete a parent with 1 level of children
- [ ] Delete a parent with multiple levels of children (3+ deep)
- [ ] Verify products are updated correctly
- [ ] Verify parent's childIds are updated
- [ ] Verify warning messages appear correctly
- [ ] Test with category having 0 products
- [ ] Test with category having 100+ products
- [ ] Test with more than 10 categories to delete (Firestore limit)

### Expected Behavior

✅ All subcategories deleted recursively  
✅ All products updated with empty category  
✅ Parent categories updated correctly  
✅ Success message shows accurate counts  
✅ UI refreshes to show updated category tree

---

## Security

### Authorization

- **Required Role**: Admin only
- **Verification**: `verifyAdmin(request)` checks user permissions
- **Authentication**: Firebase Auth token required

### Audit Trail

All deletions are logged:

```typescript
console.log(
  `Deleting category ${categoryId} and ${subcategoryIds.length} subcategories`
);
console.log(`Updated ${productUpdatePromises.length} products`);
```

---

## Future Enhancements

### Potential Improvements

1. **Soft Delete**: Mark categories as deleted instead of permanent removal
2. **Restore Feature**: Allow undoing cascade deletes
3. **Batch Operations UI**: Show progress bar for large deletions
4. **Export Before Delete**: Download affected data before deletion
5. **Reassign Instead of Clear**: Option to reassign products to another category
6. **Scheduled Deletion**: Delete at a specific time
7. **Email Notifications**: Notify sellers whose products are affected
8. **Activity Log**: Detailed audit log in admin dashboard

### Database Optimization

- Index on `categoryId` in products collection for faster queries
- Archive deleted categories in a separate collection
- Implement soft delete with `deletedAt` timestamp

---

## Related Files

### Backend

- `src/app/api/admin/categories/route.ts` - Main API endpoint with cascade delete logic

### Frontend

- `src/app/admin/categories/page.tsx` - Admin UI with enhanced delete confirmation
- `src/components/admin/categories/CategoryTreeView.tsx` - Tree view component
- `src/components/admin/categories/CategoryListView.tsx` - List view component

### Services

- `src/lib/api/services/category.service.ts` - Category service layer

### Types

- `src/types/index.ts` - Category and Product type definitions

---

## Troubleshooting

### Common Issues

**Issue**: "Failed to delete category" error  
**Solution**: Check user permissions and ensure category exists

**Issue**: Products not updating  
**Solution**: Verify Firestore rules allow updates to products collection

**Issue**: Some subcategories not deleted  
**Solution**: Check `parentIds` array is correctly populated for all categories

**Issue**: Parent category shows stale data  
**Solution**: Refresh the categories list or clear cache

---

## Changelog

### v1.0 - November 1, 2025

- ✅ Initial implementation of cascade delete
- ✅ Recursive subcategory detection
- ✅ Product category assignment removal
- ✅ Enhanced UI warnings for parent categories
- ✅ Detailed success messages with counts
- ✅ Parent reference updates
