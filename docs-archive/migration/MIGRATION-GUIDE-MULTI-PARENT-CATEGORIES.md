# Migration Guide: Multi-Parent Categories

## Overview

The category system has been updated to support **multi-parent and multi-children** hierarchies. Categories can now belong to multiple parent categories and have multiple child categories.

## Key Changes

### 1. Database Schema Changes

**New Fields:**

- `parent_ids: string[]` - Array of parent category IDs (replaces single `parent_id`)
- `children_ids: string[]` - Array of child category IDs
- `paths: string[]` - Multiple breadcrumb paths (one for each parent)

**Backward Compatibility:**

- `parent_id: string | null` - Kept for backward compatibility (points to first parent)
- `path: string` - Kept for backward compatibility (first path)

### 2. TypeScript Interface Changes

```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Multi-level Hierarchy
  parentIds: string[]; // NEW: Multiple parent categories
  childrenIds: string[]; // NEW: Multiple child categories
  paths: string[]; // NEW: Multiple paths
  level: number;
  hasChildren: boolean;
  childCount: number;

  // Backward compatibility (deprecated)
  parentId?: string | null; // DEPRECATED: use parentIds[0]
  path?: string; // DEPRECATED: use paths[0]

  // ...rest of fields
}
```

### 3. API Changes

#### Creating a Category

**Before:**

```typescript
await categoriesService.create({
  name: "Smartphones",
  slug: "smartphones",
  parentId: "electronics-id", // Single parent
  // ...
});
```

**After:**

```typescript
await categoriesService.create({
  name: "Smartphones",
  slug: "smartphones",
  parentIds: ["electronics-id", "mobile-accessories-id"], // Multiple parents
  // ...
});

// Backward compatible - single parent still works
await categoriesService.create({
  name: "Smartphones",
  slug: "smartphones",
  parentId: "electronics-id", // Will be converted to parentIds: ["electronics-id"]
  // ...
});
```

#### New API Endpoints

1. **Add Parent**: `POST /api/categories/{slug}/add-parent`

   ```typescript
   await categoriesService.addParent("smartphones", "new-parent-id");
   ```

2. **Remove Parent**: `POST /api/categories/{slug}/remove-parent`

   ```typescript
   await categoriesService.removeParent("smartphones", "parent-id-to-remove");
   ```

3. **Get Parents**: `GET /api/categories/{slug}/parents`

   ```typescript
   const parents = await categoriesService.getParents("smartphones");
   ```

4. **Get Children**: `GET /api/categories/{slug}/children`
   ```typescript
   const children = await categoriesService.getChildren("electronics");
   ```

### 4. Database Migration Steps

#### Option A: Firestore Migration Script (Recommended)

Run this script to migrate existing categories:

```typescript
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

async function migrateCategories() {
  const db = getFirestoreAdmin();
  const categoriesRef = db.collection("categories");
  const snapshot = await categoriesRef.get();

  const batch = db.batch();
  const updates: any[] = [];

  // First pass: convert parent_id to parent_ids
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const parentIds = data.parent_id ? [data.parent_id] : [];

    updates.push({
      ref: doc.ref,
      data: {
        parent_ids: parentIds,
        children_ids: [],
      },
    });
  });

  // Apply first batch
  updates.forEach(({ ref, data }) => {
    batch.update(ref, data);
  });
  await batch.commit();

  // Second pass: populate children_ids
  const updatedSnapshot = await categoriesRef.get();
  const categoriesMap = new Map();

  updatedSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    categoriesMap.set(doc.id, {
      ref: doc.ref,
      parentIds: data.parent_ids || [],
      childrenIds: [],
    });
  });

  // Build children relationships
  categoriesMap.forEach((category, categoryId) => {
    category.parentIds.forEach((parentId: string) => {
      const parent = categoriesMap.get(parentId);
      if (parent) {
        parent.childrenIds.push(categoryId);
      }
    });
  });

  // Apply children updates
  const childrenBatch = db.batch();
  categoriesMap.forEach((category) => {
    childrenBatch.update(category.ref, {
      children_ids: category.childrenIds,
      child_count: category.childrenIds.length,
      has_children: category.childrenIds.length > 0,
    });
  });
  await childrenBatch.commit();

  console.log(`✅ Migrated ${snapshot.size} categories`);
}

// Run: npx ts-node scripts/migrate-categories.ts
migrateCategories();
```

#### Option B: Manual Migration

For small datasets, manually update categories in Firebase Console:

1. Add `parent_ids` field (array) with values from `parent_id`
2. Add `children_ids` field (empty array initially)
3. Run a script to populate `children_ids` based on parent-child relationships

### 5. Component Updates

**CategorySelector Component:**

- Now handles multiple parents when building breadcrumbs (uses first parent)
- Tree view supports categories appearing under multiple parents

**ProductFilters Component:**

- Updated to check `parentIds` array instead of single `parentId`
- Root categories identified by empty `parentIds` array

### 6. Testing

Test the multi-parent functionality:

```typescript
// Create a category with multiple parents
const category = await categoriesService.create({
  name: "Wireless Earbuds",
  slug: "wireless-earbuds",
  parentIds: ["audio-devices", "mobile-accessories"],
  // ...
});

// Add another parent
await categoriesService.addParent("wireless-earbuds", "bluetooth-devices");

// Get all parents
const parents = await categoriesService.getParents("wireless-earbuds");
console.log(parents); // Should show 3 parents

// Remove a parent
await categoriesService.removeParent("wireless-earbuds", "audio-devices");
```

### 7. Firestore Rules Update

Update your Firestore security rules to handle the new fields:

```javascript
match /categories/{categoryId} {
  allow read: if true; // Public read

  allow create, update, delete: if request.auth != null
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

  // Validate parent_ids is an array
  allow create, update: if request.resource.data.parent_ids is list;

  // Validate children_ids is an array
  allow create, update: if request.resource.data.children_ids is list;
}
```

### 8. Indexes

Create composite indexes in Firestore for efficient queries:

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

## Breaking Changes

None! The system is backward compatible. Existing code using `parentId` will continue to work.

## Benefits

1. **Flexible Taxonomy**: Products can be categorized in multiple ways
2. **Better SEO**: Multiple breadcrumb paths for the same product
3. **Improved Navigation**: Users can find products through different category paths
4. **Cross-category Products**: Products like "Wireless Earbuds" can appear under both "Audio" and "Mobile Accessories"

## Rollback Plan

If needed, rollback is simple:

1. Keep using `parent_id` field (it's maintained for backward compatibility)
2. Ignore `parent_ids`, `children_ids` arrays
3. Existing functionality continues to work
