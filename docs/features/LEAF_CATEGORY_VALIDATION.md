# Leaf Category Validation for Products

## Overview

Products can **only be assigned to leaf categories** (categories without sub-categories). This ensures proper product organization and prevents products from being assigned to parent/container categories.

## What is a Leaf Category?

A **leaf category** is a category that:

- Has **no child categories** (childIds array is empty or null)
- Is at the **lowest level** of the category hierarchy
- Represents the **most specific classification** for products

### Example:

```
❌ Beyblades (Parent - NOT allowed for products)
   ❌ Metal Series (Parent - NOT allowed)
      ✅ Metal Fusion (Leaf - CAN assign products)
      ✅ Metal Masters (Leaf - CAN assign products)
   ❌ Burst Series (Parent - NOT allowed)
      ✅ Burst Evolution (Leaf - CAN assign products)
      ✅ Burst Turbo (Leaf - CAN assign products)
```

## Implementation

### 1. Frontend Validation

#### Product Creation/Edit Pages

- Only **leaf categories** are fetched from the API endpoint: `/api/seller/products/categories/leaf`
- Categories are displayed with their **full path** (e.g., "Beyblades > Metal Series > Metal Fusion")
- Helper text clarifies: _"Only leaf categories (without sub-categories) can be selected for products"_

#### Components Updated:

- **`BasicInfoPricingStep.tsx`**:

  - Label changed to "Category (Leaf Categories Only)"
  - Added helper text explaining the restriction
  - Shows full category path (pathString)

- **`ProductDetailsStep.tsx`**:
  - Label changed to "Category (Leaf Categories Only)"
  - Helper text updated
  - Searchable dropdown shows full paths

### 2. Backend Validation

#### API Endpoints with Leaf Category Validation:

**POST `/api/seller/products`** (Create Product)

```typescript
// Validates that categoryId is a leaf category
const categoryDoc = await adminDb
  .collection("categories")
  .doc(body.categoryId)
  .get();
const childIds = categoryData?.childIds || [];

if (childIds.length > 0) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Products can only be assigned to leaf categories (categories without sub-categories).",
    },
    { status: 400 }
  );
}
```

**PUT `/api/seller/products/[id]`** (Update Product)

- Same validation when categoryId is being changed
- Prevents reassigning products to parent categories

**GET `/api/seller/products/categories/leaf`**

- Returns only leaf categories (where `childIds.length === 0`)
- Includes full category path for each leaf
- Sorted alphabetically by path

### 3. Validation Schema

**`comprehensive-schemas.ts`**:

```typescript
// Categorization
// Note: category must be a leaf category ID (categories without sub-categories)
// This validation is enforced in the API endpoint
category: z.string().min(1, "Category is required"),
```

## Error Messages

### Frontend

- If trying to select (shouldn't happen as only leaf categories shown):
  - _"Only leaf categories can be selected for products"_

### Backend

- **400 Bad Request**: _"Invalid category. Products can only be assigned to leaf categories (categories without sub-categories)."_
- **400 Bad Request**: _"Invalid category. Category not found."_
- **400 Bad Request**: _"Invalid category. Selected category is not active."_

## API Response Format

### `/api/seller/products/categories/leaf` Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Metal Fusion",
      "slug": "metal-fusion",
      "description": "Metal Fusion beyblades",
      "level": 2,
      "path": [
        { "id": "cat1", "name": "Beyblades", "slug": "beyblades" },
        { "id": "cat2", "name": "Metal Series", "slug": "metal-series" },
        { "id": "cat123", "name": "Metal Fusion", "slug": "metal-fusion" }
      ],
      "pathString": "Beyblades > Metal Series > Metal Fusion",
      "icon": null,
      "image": null,
      "sortOrder": 1
    }
  ],
  "count": 15,
  "message": "Found 15 leaf categories"
}
```

## Database Schema

### Category Document Fields:

```typescript
{
  id: string;
  name: string;
  slug: string;
  parentIds?: string[];      // Multiple parents (many-to-many)
  childIds?: string[];       // Computed child IDs
  isLeaf?: boolean;          // True if no children
  paths?: string[][];        // All possible paths
  minLevel?: number;         // Minimum depth
  maxLevel?: number;         // Maximum depth
  isActive: boolean;
  // ... other fields
}
```

**Leaf Detection**: A category is a leaf if `childIds` array is empty or null.

## Testing

### Manual Testing Steps:

1. **Create New Product**:

   - Go to `/seller/products/new`
   - Try selecting category
   - Verify only leaf categories appear
   - Verify categories show full path

2. **Edit Existing Product**:

   - Edit a product
   - Try changing category
   - Verify validation works

3. **API Testing**:

   ```bash
   # Try to create product with parent category (should fail)
   POST /api/seller/products
   {
     "categoryId": "parent-category-id",
     // ... other fields
   }

   # Expected: 400 error
   ```

4. **Edge Cases**:
   - Category with no children initially, then children added later
   - Inactive categories should be rejected
   - Non-existent category IDs should be rejected

## Benefits

1. **Data Quality**: Ensures products are properly classified
2. **User Experience**: Clearer category selection with full paths
3. **SEO**: Better URL structure with specific categories
4. **Analytics**: More accurate category-based reporting
5. **Search/Filter**: More precise product filtering by category

## Related Files

- `/src/app/api/seller/products/route.ts` - Create product validation
- `/src/app/api/seller/products/[id]/route.ts` - Update product validation
- `/src/app/api/seller/products/categories/leaf/route.ts` - Leaf category API
- `/src/components/seller/products/BasicInfoPricingStep.tsx` - UI component
- `/src/components/seller/products/ProductDetailsStep.tsx` - UI component
- `/src/lib/validations/comprehensive-schemas.ts` - Schema documentation
- `/src/types/index.ts` - Category and Product type definitions

## Future Enhancements

- [ ] Add bulk category validation for product imports
- [ ] Create admin tool to identify products assigned to non-leaf categories
- [ ] Add migration script if category hierarchy changes
- [ ] Cache leaf categories list for better performance
- [ ] Add real-time category tree visualization in product form

---

**Last Updated**: November 1, 2025
**Feature Status**: ✅ Active
**Validation**: Frontend + Backend
