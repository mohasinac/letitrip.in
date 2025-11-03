# Day 4: Category Routes - Complete ✅

## Overview

Successfully refactored category-related API routes to use the MVC controller pattern with full RBAC implementation.

## Routes Refactored

### 1. `/api/categories` (GET, POST)

**File:** `src/app/api/categories/route.ts` (116 lines)

#### GET - List Categories

- **Access:** Public
- **Query Parameters:**
  - `format`: 'tree' or 'list' (default: 'list')
  - `search`: Search categories by name
  - `limit`: Results per page
- **Response:**
  - Tree format: Nested category structure with children
  - List format: Flat array of categories
- **RBAC:** Public access, only active categories shown

#### POST - Create Category

- **Access:** Admin only
- **Body:**
  ```json
  {
    "name": "string (required)",
    "slug": "string (auto-generated if not provided)",
    "description": "string (optional)",
    "icon": "string (optional)",
    "parentIds": "string[] (optional, many-to-many hierarchy)",
    "isActive": "boolean (default: true)",
    "displayOrder": "number (optional)"
  }
  ```
- **Validation:**
  - Name required
  - Slug auto-generated from name if not provided
  - Slug must be unique
- **Response:** Created category object

---

### 2. `/api/categories/[slug]` (GET, PUT, DELETE)

**File:** `src/app/api/categories/[slug]/route.ts` (201 lines)

#### GET - View Category

- **Access:** Public
- **Response:** Category details with subcategories
- **RBAC:** Public access, only active categories

#### PUT - Update Category

- **Access:** Admin only
- **Body:** Same as POST, all fields optional
- **Validation:**
  - Cannot create circular parent relationships
  - Slug must remain unique
- **Response:** Updated category object

#### DELETE - Delete Category

- **Access:** Admin only
- **Action:** Soft delete (sets isActive: false)
- **Response:** Success message
- **Note:** Category remains in database but hidden from public

---

## RBAC Matrix

| Endpoint                  | Public         | User           | Seller         | Admin  |
| ------------------------- | -------------- | -------------- | -------------- | ------ |
| GET /categories           | ✅ Active only | ✅ Active only | ✅ Active only | ✅ All |
| POST /categories          | ❌             | ❌             | ❌             | ✅     |
| GET /categories/[slug]    | ✅ Active only | ✅ Active only | ✅ Active only | ✅ All |
| PUT /categories/[slug]    | ❌             | ❌             | ❌             | ✅     |
| DELETE /categories/[slug] | ❌             | ❌             | ❌             | ✅     |

---

## Business Rules

### Category Hierarchy

- **Many-to-many support**: Categories can have multiple parents
- **Parent IDs**: Stored as `parentIds` array
- **Tree structure**: Built dynamically using `getCategoryTree()`
- **Circular prevention**: System prevents circular parent relationships

### Category Status

- **Active categories**: Visible to public
- **Inactive categories**: Hidden from public, visible to admin
- **Soft delete**: DELETE sets `isActive: false`
- **Permanent delete**: Available via controller (not exposed in routes)

### Slug Management

- **Auto-generation**: Slugs auto-generated from name if not provided
- **Uniqueness**: Slugs must be unique across all categories
- **URL-safe**: Slugs are lowercase with hyphens

### Display Order

- **Optional field**: Categories can have display order
- **Sorting**: Used for controlling category display order
- **Default**: Categories sorted by name if no display order

---

## Controller Functions Used

### Category Retrieval

- `getAllCategories()`: Get all categories with filters
- `getCategoryBySlug()`: Get single category by slug
- `getCategoryById()`: Get single category by ID
- `getCategoryTree()`: Get categories in tree structure
- `getLeafCategories()`: Get categories with no children

### Category CRUD

- `createCategory()`: Create new category
- `updateCategory()`: Update existing category
- `deleteCategory()`: Soft delete category
- `permanentlyDeleteCategory()`: Hard delete (not exposed)

### Category Management

- `batchUpdateCategories()`: Update multiple categories (not exposed)
- `reorderCategories()`: Change display order (not exposed)
- `moveCategory()`: Change parent (not exposed)

### Category Helpers

- `getCategoryAncestors()`: Get parent hierarchy (not exposed)
- `getCategoryDescendants()`: Get child hierarchy (not exposed)
- `countCategories()`: Get category counts (not exposed)
- `updateCategoryProductCounts()`: Update product counts (not exposed)

---

## Error Handling

All routes implement comprehensive error handling:

### Validation Errors (400)

- Missing required fields (name)
- Invalid slug format
- Duplicate slug
- Circular parent relationships

### Authentication Errors (401)

- Missing JWT token
- Invalid/expired token

### Authorization Errors (403)

- Non-admin trying to create/update/delete
- Attempting to access inactive category (non-admin)

### Not Found Errors (404)

- Category not found
- Invalid slug

### Server Errors (500)

- Database errors
- Unexpected errors (logged to console)

---

## Data Validation

### Create Category

```typescript
{
  name: string (required, max 100 chars)
  slug: string (optional, auto-generated, max 100 chars)
  description: string (optional, max 500 chars)
  icon: string (optional, URL or icon name)
  parentIds: string[] (optional, array of parent category IDs)
  isActive: boolean (default: true)
  displayOrder: number (optional)
}
```

### Update Category

```typescript
{
  name: string (optional, max 100 chars)
  slug: string (optional, max 100 chars)
  description: string (optional, max 500 chars)
  icon: string (optional)
  parentIds: string[] (optional)
  isActive: boolean (optional)
  displayOrder: number (optional)
}
```

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* category object */
  },
  "message": "Operation completed successfully"
}
```

### List Response (Flat)

```json
{
  "success": true,
  "data": [
    /* array of categories */
  ],
  "total": 15
}
```

### Tree Response

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-123",
      "name": "Electronics",
      "slug": "electronics",
      "children": [
        {
          "id": "cat-456",
          "name": "Smartphones",
          "slug": "smartphones",
          "children": []
        }
      ]
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Testing Checklist

### Category Listing

- [ ] Public can view active categories
- [ ] Admin can view all categories (including inactive)
- [ ] Tree format returns nested structure
- [ ] List format returns flat array
- [ ] Search filters categories by name
- [ ] Limit parameter works
- [ ] Only active categories shown to public

### Category Creation

- [ ] Admin can create categories
- [ ] Non-admin cannot create categories
- [ ] Name is required
- [ ] Slug auto-generated if not provided
- [ ] Slug uniqueness enforced
- [ ] ParentIds create many-to-many relationships
- [ ] Circular relationships prevented

### Category Viewing

- [ ] Public can view active categories by slug
- [ ] Admin can view inactive categories
- [ ] Category includes subcategories
- [ ] 404 for non-existent category
- [ ] 404 for inactive category (non-admin)

### Category Updating

- [ ] Admin can update categories
- [ ] Non-admin cannot update
- [ ] Name can be changed
- [ ] Slug can be changed (if unique)
- [ ] Parent relationships can be updated
- [ ] Circular relationships prevented
- [ ] Display order can be updated

### Category Deletion

- [ ] Admin can delete categories
- [ ] Non-admin cannot delete
- [ ] Soft delete (isActive set to false)
- [ ] Deleted categories hidden from public
- [ ] Admin can still view deleted categories

### Authorization

- [ ] JWT validation works
- [ ] Role-based access enforced
- [ ] Admin-only endpoints protected

### Error Handling

- [ ] 400 for validation errors
- [ ] 401 for missing auth
- [ ] 403 for authorization failures
- [ ] 404 for not found
- [ ] 500 for server errors

---

## Notes

### Many-to-Many Hierarchy

Unlike traditional single-parent category systems, this implementation supports many-to-many relationships. A category can have multiple parents, enabling more flexible categorization (e.g., "Wireless Headphones" can be under both "Audio" and "Wireless Accessories").

### Controller Pattern

The category controller uses exported functions (not a class-based singleton like Product/Order/User controllers). Both patterns work equally well with the route layer.

### Tree Building

The `getCategoryTree()` function builds a nested tree structure from flat category data. This is computationally expensive for large datasets, so consider caching in production.

### Product Counts

The controller includes `updateCategoryProductCounts()` for maintaining accurate product counts per category. This can be called periodically or triggered by product updates.

---

## Code Statistics

- **Total Routes:** 2 routes (refactored from existing)
- **Total Lines:** 317 lines
- **TypeScript Errors:** 0 ✅
- **Files Modified:**
  1. `src/app/api/categories/route.ts` (116 lines, was 63 lines)
  2. `src/app/api/categories/[slug]/route.ts` (201 lines, was 70 lines)

---

## Sprint 1 Progress

✅ **Day 1:** Products (2 routes, 348 lines)
✅ **Day 2:** Orders (5 routes, 561 lines)
✅ **Day 3:** Users (3 routes, 514 lines)
✅ **Day 4:** Categories (2 routes, 317 lines)
⏳ **Day 5:** Reviews (in progress)

**Total so far:** 12 routes, 1,740 lines, 0 errors
