# Category Hierarchy & Product Count System

## Overview

Implemented comprehensive category hierarchy management with automatic product count updates, cyclic assignment prevention, and hierarchical product display.

## Features Implemented

### 1. **Automatic Product Count Updates**

#### Parent Inheritance

When a product is created, updated, or deleted, the product count automatically updates for:

- The assigned category
- All parent categories
- All grandparent categories (up to root)

```typescript
// Example: Creating a product in "Charizard Cards"
Product created in: "Charizard Cards" (leaf)
Updates counts for:
- "Charizard Cards" (+1)
- "Pokémon TCG" (parent) (+1)
- "Trading Cards" (grandparent) (+1)
- "Collectibles" (root) (+1)
```

#### Real-time Count Sync

```typescript
// After product creation
await updateCategoryProductCounts(categoryId);
// Updates: category + all ancestors
```

---

### 2. **Cyclic Assignment Prevention**

#### Pre-validation

Before adding a parent, the system checks:

- ✅ Category cannot be its own parent
- ✅ Cannot create circular references
- ✅ All parent categories must exist

```typescript
// Example: BLOCKED cycles
Category A -> parent: Category B
Category B -> parent: Category C
Category C -> parent: Category A  // ❌ BLOCKED (creates cycle)

// Validation
const { valid, errors } = await validateParentAssignments(
  categoryId,
  [parentId1, parentId2]
);
// Returns: { valid: false, errors: ["Would create circular reference"] }
```

#### Cycle Detection Algorithm

```typescript
// Uses BFS to check if new parent is already a descendant
if (await wouldCreateCycle(categoryId, newParentId)) {
  throw new Error("Circular reference detected");
}
```

---

### 3. **Hierarchical Product Display**

#### Show ALL Descendant Products

When viewing a category, you see products from:

- The category itself
- All children categories
- All grandchildren categories
- ... recursively to leaves

```
Example: Viewing "Trading Cards"
Shows products from:
├── Trading Cards (direct)
├── Pokémon TCG
│   ├── Charizard Cards
│   ├── Pikachu Cards
│   └── Rare Holos
├── Yu-Gi-Oh!
│   ├── Blue-Eyes Cards
│   └── Dark Magician Cards
└── Magic: The Gathering
    ├── Black Lotus
    └── Power Nine
```

#### API Implementation

```typescript
// /api/categories/[slug]/products
const categoryIds = await getCategoryIdsForQuery(categoryId);
// Returns: [selfId, child1, child2, grandchild1, grandchild2, ...]

// Fetch products from ALL these categories
for (const batchIds of batches) {
  const products = await getProducts({
    category_id: { in: batchIds },
  });
}
```

---

## Utility Functions

### `src/lib/category-hierarchy.ts`

#### **getAllDescendantIds(categoryId)**

```typescript
// Returns all children, grandchildren, etc.
const descendants = await getAllDescendantIds("trading-cards");
// ["pokemon-tcg", "yugioh", "charizard-cards", "pikachu-cards", ...]
```

#### **getAllAncestorIds(categoryId)**

```typescript
// Returns all parents, grandparents, etc.
const ancestors = await getAllAncestorIds("charizard-cards");
// ["pokemon-tcg", "trading-cards", "collectibles"]
```

#### **wouldCreateCycle(categoryId, newParentId)**

```typescript
// Check before assigning parent
if (await wouldCreateCycle("category-a", "category-b")) {
  console.error("Would create cycle!");
}
```

#### **countCategoryProducts(categoryId)**

```typescript
// Count products in category + all descendants
const count = await countCategoryProducts("trading-cards");
// Counts products in trading-cards AND all subcategories
```

#### **updateCategoryProductCounts(categoryId)**

```typescript
// Update category + all ancestors
await updateCategoryProductCounts("charizard-cards");
// Updates: charizard-cards, pokemon-tcg, trading-cards, collectibles
```

#### **getCategoryIdsForQuery(categoryId)**

```typescript
// Get self + all descendants for product queries
const ids = await getCategoryIdsForQuery("trading-cards");
// Use in: WHERE category_id IN (ids)
```

#### **validateParentAssignments(categoryId, parentIds)**

```typescript
// Validate before saving
const { valid, errors } = await validateParentAssignments("new-category", [
  "parent1",
  "parent2",
]);

if (!valid) {
  console.error(errors);
  // ["Parent category parent1 does not exist"]
}
```

---

## API Routes Updated

### **POST /api/products**

```typescript
// After creating product
if (category_id && status === "published") {
  await updateCategoryProductCounts(category_id);
}
```

### **GET /api/categories/[slug]/products**

```typescript
// ALWAYS fetches from all descendants
const categoryIds = await getCategoryIdsForQuery(categoryId);

// Batch queries (Firestore 'in' limit = 10)
for (batch of categoryIds) {
  products = await fetchBatch(batch);
}

// Response includes hierarchy info
{
  products: [...],
  meta: {
    categoryId,
    descendantCategoryCount: 15,
    totalCategoriesSearched: 16
  }
}
```

---

## Database Schema

### Categories Collection

```typescript
{
  id: string,
  name: string,
  slug: string,
  parentIds: string[],        // Multi-parent support
  level: number,              // 0 = root, 1 = child, etc.
  productCount: number,       // Includes descendants
  isLeaf: boolean,           // Has no children
  // ... other fields
}
```

### Products Collection

```typescript
{
  id: string,
  category_id: string,        // Single category (leaf recommended)
  status: "published" | "draft",
  is_deleted: boolean,
  // ... other fields
}
```

---

## Usage Examples

### **Frontend: Category Selector**

```tsx
// Always show leaf categories for product assignment
const leafCategories = await categoriesService.getLeaves();

<select name="category">
  {leafCategories.map((cat) => (
    <option value={cat.id}>{cat.name}</option>
  ))}
</select>;
```

### **Frontend: Category Page**

```tsx
// Products automatically include all subcategories
const { products, meta } = await fetch(`/api/categories/${slug}/products`);

console.log(
  `Showing ${products.length} products from ${meta.totalCategoriesSearched} categories`
);
```

### **Backend: Product Creation**

```typescript
// Create product
const product = await createProduct({
  name: "Charizard VMAX",
  category_id: "charizard-cards", // Leaf category
  status: "published",
});

// Counts automatically updated:
// ✓ charizard-cards: +1
// ✓ pokemon-tcg: +1
// ✓ trading-cards: +1
// ✓ collectibles: +1
```

---

## Benefits

### **For Sellers**

✅ Assign products to specific leaf categories  
✅ Products automatically appear in parent categories  
✅ No need to manually update counts

### **For Buyers**

✅ Browse parent categories and see ALL products  
✅ Filter down from broad to specific  
✅ Consistent product counts

### **For Admins**

✅ Prevent circular category references  
✅ Auto-rebuild counts with maintenance script  
✅ Validate category structure before saving

---

## Maintenance

### **Rebuild All Counts**

```typescript
// One-time rebuild (if counts get out of sync)
const { updated, errors } = await rebuildAllCategoryCounts();
console.log(`Updated ${updated} categories`);
```

### **Check for Cycles**

```typescript
// Before adding parent relationship
const wouldCycle = await wouldCreateCycle(childId, parentId);
if (wouldCycle) {
  throw new Error("Circular reference detected");
}
```

---

## Testing Checklist

### Product Creation

- [ ] Create product in leaf category
- [ ] Verify parent category count increases
- [ ] Verify grandparent category count increases
- [ ] Create draft product (count should NOT increase)
- [ ] Publish draft product (count should increase)

### Category Hierarchy

- [ ] View parent category products
- [ ] Verify child category products appear
- [ ] Verify grandchild category products appear
- [ ] Test with 3+ level hierarchy

### Cycle Prevention

- [ ] Try to set category as its own parent (should fail)
- [ ] Try to create A -> B -> C -> A cycle (should fail)
- [ ] Add valid parent (should succeed)
- [ ] Add second valid parent (should succeed)

### Product Display

- [ ] Browse root category (shows ALL products)
- [ ] Browse mid-level category (shows descendants)
- [ ] Browse leaf category (shows only that category)
- [ ] Verify counts match displayed products

---

## Performance Considerations

### Batching

- Firestore `in` queries limited to 10 items
- Category queries automatically batch
- Client-side sorting/pagination for cross-batch results

### Caching

- Consider caching category hierarchies
- Cache product counts (rebuild periodically)
- Use CDN for category product lists

### Optimization

```typescript
// For large hierarchies, consider indexing
await db
  .collection("categories")
  .where("parent_ids", "array-contains", categoryId)
  .get();

// May need composite index:
// parent_ids (ASCENDING) + status (ASCENDING)
```

---

## Future Enhancements

1. **Category Aliases** - Multiple slugs per category
2. **Dynamic Breadcrumbs** - Multiple paths to same category
3. **Category Attributes** - Custom fields per category type
4. **Smart Recommendations** - Related categories based on products
5. **Bulk Operations** - Move multiple products between categories
6. **Version History** - Track category structure changes
7. **SEO Optimization** - Auto-generated category descriptions
8. **Analytics** - Track category popularity and conversion

---

## Error Handling

### Common Errors

```typescript
// Circular reference
throw new Error("Adding this parent would create a circular reference");

// Missing category
throw new Error("Category not found");

// Invalid hierarchy
throw new Error("Cannot assign parent to root category");
```

### Graceful Degradation

```typescript
// Count update failure (non-critical)
try {
  await updateCategoryProductCounts(categoryId);
} catch (error) {
  console.error("Failed to update counts:", error);
  // Continue - can rebuild counts later
}
```

---

## Documentation

- **Implementation**: `src/lib/category-hierarchy.ts`
- **API Routes**: `src/app/api/categories/[slug]/products/route.ts`
- **Product Creation**: `src/app/api/products/route.ts`
- **Type Definitions**: `src/types/backend/category.types.ts`
