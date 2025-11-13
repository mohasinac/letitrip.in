# Quick Reference: Multi-Parent Categories

## TL;DR

Categories now support **multiple parents** and **multiple children**. Fully backward compatible.

## Quick Start

### 1. Run Migration

```bash
npx ts-node scripts/migrate-categories-multi-parent.ts
```

### 2. Test It

```bash
npx ts-node scripts/test-multi-parent-categories.ts
```

## Common Tasks

### Create Category with Multiple Parents

```typescript
await categoriesService.create({
  name: "Wireless Earbuds",
  slug: "wireless-earbuds",
  parentIds: ["electronics", "accessories"], // Multiple parents!
  // ... other fields
});
```

### Add Parent to Existing Category

```typescript
await categoriesService.addParent("wireless-earbuds", "bluetooth-devices");
```

### Remove Parent

```typescript
await categoriesService.removeParent("wireless-earbuds", "electronics");
```

### Get All Parents

```typescript
const parents = await categoriesService.getParents("wireless-earbuds");
```

### Get All Children

```typescript
const children = await categoriesService.getChildren("electronics");
```

## New API Endpoints

```
GET    /api/categories/:slug/parents        - Get all parents
GET    /api/categories/:slug/children       - Get all children
POST   /api/categories/:slug/add-parent     - Add parent
POST   /api/categories/:slug/remove-parent  - Remove parent
```

## Utility Functions

```typescript
import {
  getParentIds,
  getChildrenIds,
  getAncestorIds,
  getDescendantIds,
  getBreadcrumbPath,
  getAllBreadcrumbPaths,
  buildCategoryTree,
  wouldCreateCircularReference,
} from "@/lib/utils/category-utils";
```

## Database Fields

```typescript
{
  parent_ids: string[];      // NEW: Multiple parents
  children_ids: string[];    // NEW: Multiple children
  parent_id: string | null;  // Kept for backward compatibility
}
```

## Backward Compatibility

✅ Yes! Old code still works:

```typescript
// This still works - converted to parent_ids internally
await categoriesService.create({
  parentId: "electronics", // Single parent
});
```

## Files Changed

- ✅ Types, API routes, services, validation
- ✅ Components: CategorySelector, ProductFilters
- 🆕 Migration script, test script, utilities
- 📚 Complete documentation

## Need Help?

1. Read: `docs/MULTI-PARENT-CATEGORIES.md`
2. Migration: `MIGRATION-GUIDE-MULTI-PARENT-CATEGORIES.md`
3. Summary: `IMPLEMENTATION-SUMMARY-MULTI-PARENT-CATEGORIES.md`

---

**Status**: ✅ Ready for Production
**Breaking Changes**: None
**Migration**: Required (automated)
