# Multi-Parent & Multi-Children Categories Implementation

## Overview

The category system now supports **multi-parent and multi-children** hierarchies, allowing categories to belong to multiple parent categories and have multiple child categories simultaneously.

## Changes Summary

### ✅ Updated Files

1. **Type Definitions**

   - `src/types/index.ts` - Updated Category interface

2. **API Routes**

   - `src/app/api/categories/route.ts` - Updated list & create
   - `src/app/api/categories/[slug]/route.ts` - Updated get, update, delete
   - `src/app/api/categories/[slug]/parents/route.ts` - NEW: Get all parents
   - `src/app/api/categories/[slug]/children/route.ts` - NEW: Get all children
   - `src/app/api/categories/[slug]/add-parent/route.ts` - NEW: Add parent
   - `src/app/api/categories/[slug]/remove-parent/route.ts` - NEW: Remove parent

3. **Services**

   - `src/services/categories.service.ts` - Added multi-parent methods

4. **Validation**

   - `src/lib/validation/category.ts` - Updated schemas

5. **Components**

   - `src/components/common/CategorySelector.tsx` - Updated for multi-parent
   - `src/components/filters/ProductFilters.tsx` - Updated for multi-parent

6. **Scripts**

   - `scripts/migrate-categories-multi-parent.ts` - Migration script
   - `scripts/test-multi-parent-categories.ts` - Test script

7. **Documentation**
   - `MIGRATION-GUIDE-MULTI-PARENT-CATEGORIES.md` - Migration guide

## Database Schema

### New Fields

```typescript
{
  // Multi-parent support
  parent_ids: string[];        // Array of parent category IDs
  children_ids: string[];      // Array of child category IDs
  paths: string[];            // Multiple breadcrumb paths (future use)

  // Backward compatibility (deprecated but maintained)
  parent_id: string | null;   // First parent ID or null
  path: string;               // First path (for compatibility)

  // Existing fields
  name: string;
  slug: string;
  description: string;
  level: number;
  has_children: boolean;
  child_count: number;
  // ... other fields
}
```

## Usage Examples

### Creating a Category with Multiple Parents

```typescript
const category = await categoriesService.create({
  name: "Wireless Earbuds",
  slug: "wireless-earbuds",
  description: "Wireless audio devices",
  parentIds: ["electronics", "mobile-accessories"], // Multiple parents
  sortOrder: 1,
  featured: true,
  showOnHomepage: true,
  isActive: true,
  commissionRate: 12,
});
```

### Adding a Parent to Existing Category

```typescript
await categoriesService.addParent("wireless-earbuds", "bluetooth-devices");
```

### Removing a Parent

```typescript
await categoriesService.removeParent("wireless-earbuds", "electronics");
```

### Getting All Parents

```typescript
const parents = await categoriesService.getParents("wireless-earbuds");
console.log(parents); // Array of parent categories
```

### Getting All Children

```typescript
const children = await categoriesService.getChildren("electronics");
console.log(children); // Array of child categories
```

## API Endpoints

### New Endpoints

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/api/categories/:slug/parents`       | Get all parent categories |
| GET    | `/api/categories/:slug/children`      | Get all direct children   |
| POST   | `/api/categories/:slug/add-parent`    | Add a parent category     |
| POST   | `/api/categories/:slug/remove-parent` | Remove a parent category  |

### Updated Endpoints

| Method | Endpoint                | Changes                                                         |
| ------ | ----------------------- | --------------------------------------------------------------- |
| POST   | `/api/categories`       | Accepts `parent_ids` array or `parent_id` (backward compatible) |
| PATCH  | `/api/categories/:slug` | Handles `parent_ids` updates and syncs `children_ids`           |
| DELETE | `/api/categories/:slug` | Removes category from all parents' `children_ids`               |

## Migration

### Step 1: Run Migration Script

```bash
npx ts-node scripts/migrate-categories-multi-parent.ts
```

This script will:

1. Convert `parent_id` to `parent_ids` array
2. Initialize `children_ids` as empty array
3. Build parent-child relationships
4. Validate migration

### Step 2: Verify Migration

```bash
npx ts-node scripts/test-multi-parent-categories.ts
```

This will run comprehensive tests on the multi-parent functionality.

### Step 3: Update Firestore Rules

Add to `firestore.rules`:

```javascript
match /categories/{categoryId} {
  allow read: if true;

  allow create, update, delete: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

  // Validate arrays
  allow create, update: if request.resource.data.parent_ids is list
    && request.resource.data.children_ids is list;
}
```

### Step 4: Create Indexes

Add to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "categories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "parent_ids", "arrayConfig": "CONTAINS" },
        { "fieldPath": "is_active", "order": "ASCENDING" },
        { "fieldPath": "sort_order", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Backward Compatibility

✅ **Fully backward compatible!**

- Existing code using `parent_id` continues to work
- Single parent creation still supported
- `parent_id` is automatically set to first parent in `parent_ids`
- Components gracefully handle both old and new structure

### Example: Backward Compatible Creation

```typescript
// Old way (still works)
await categoriesService.create({
  name: "Smartphones",
  slug: "smartphones",
  parentId: "electronics", // Single parent
  // ...
});

// Internally converted to:
// parent_ids: ["electronics"]
// parent_id: "electronics"
```

## Benefits

1. **Flexible Taxonomy**

   - Products can be found through multiple category paths
   - Example: "Wireless Earbuds" under both "Audio" and "Mobile Accessories"

2. **Better SEO**

   - Multiple breadcrumb paths for same product
   - More entry points for search engines

3. **Improved Navigation**

   - Users can find products via different browsing paths
   - Reduces duplication of categories

4. **Cross-Category Products**
   - Natural support for products that belong to multiple categories
   - Better matches real-world product classification

## Testing

Run the test suite:

```bash
npm test -- categories
```

Or run manual test script:

```bash
npx ts-node scripts/test-multi-parent-categories.ts
```

## Example Use Case

### Before (Single Parent)

```
Electronics
  ├── Audio Devices
  │   └── Wireless Earbuds
  └── Mobile Accessories
      └── [Need to duplicate Wireless Earbuds here]
```

### After (Multi-Parent)

```
Electronics
  ├── Audio Devices
  │   └── Wireless Earbuds ←┐
  └── Mobile Accessories    │
      └── Wireless Earbuds ─┘  (Same category, multiple parents)
```

## Rollback

If needed, simply ignore the new fields:

1. Continue using `parent_id` (maintained for compatibility)
2. Ignore `parent_ids` and `children_ids` arrays
3. All existing functionality continues to work

## Performance Considerations

- **Batch Operations**: Migration script uses Firestore batching (500 ops limit)
- **Query Optimization**: Use `parent_ids` array-contains queries for efficient lookups
- **Caching**: Consider caching category trees for frequently accessed categories
- **Indexes**: Required indexes created for multi-parent queries

## Troubleshooting

### Issue: Migration fails

**Solution**: Check Firestore permissions and run in smaller batches

### Issue: Children not updating

**Solution**: Ensure `children_ids` is initialized as empty array, not undefined

### Issue: Circular references

**Solution**: Add validation to prevent category from being its own parent/child

## Future Enhancements

1. **Path Generation**: Auto-generate `paths` array based on all parent paths
2. **Cycle Detection**: Prevent circular parent-child relationships
3. **Smart Ordering**: Order categories based on multiple parent contexts
4. **Category Merging**: Tools to merge duplicate categories
5. **Bulk Operations**: Bulk add/remove parents for multiple categories

## Support

For issues or questions:

1. Check `MIGRATION-GUIDE-MULTI-PARENT-CATEGORIES.md`
2. Run test script to verify setup
3. Review console logs for detailed error messages

---

**Status**: ✅ Implemented and tested
**Backward Compatible**: Yes
**Migration Required**: Yes (run migration script)
**Breaking Changes**: None
