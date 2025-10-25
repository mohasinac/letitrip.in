# Categories API Reference

## Base URL

```
/api/admin/categories
```

## Authentication

All endpoints require admin authentication via JWT cookies. Ensure requests include `credentials: 'include'`.

## Endpoints

### 1. GET /api/admin/categories

Retrieve categories with filtering options.

#### Query Parameters

| Parameter           | Type    | Default | Description                           |
| ------------------- | ------- | ------- | ------------------------------------- |
| `parentId`          | string  | -       | Filter by parent category ID          |
| `level`             | number  | -       | Filter by hierarchy level (0=root)    |
| `featured`          | boolean | -       | Filter by featured status             |
| `includeInactive`   | boolean | false   | Include inactive categories           |
| `search`            | string  | -       | Text search (name, description, slug) |
| `withProductCounts` | boolean | false   | Include stock calculations            |
| `rootOnly`          | boolean | false   | Get only root-level categories        |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "image": "https://example.com/electronics.jpg",
      "icon": "📱",
      "seo": {
        "title": "Electronics | Store",
        "description": "Browse electronics",
        "keywords": ["electronics", "devices"]
      },
      "parentId": null,
      "parentIds": [],
      "level": 0,
      "isActive": true,
      "featured": true,
      "sortOrder": 1,
      "productCount": 150,
      "inStockCount": 120,
      "outOfStockCount": 30,
      "lowStockCount": 15,
      "isLeaf": false,
      "createdAt": "2025-10-25T10:00:00Z",
      "updatedAt": "2025-10-25T10:00:00Z",
      "createdBy": "admin_user_id",
      "updatedBy": "admin_user_id"
    }
  ]
}
```

#### Examples

```javascript
// Get all root categories with counts
const response = await fetch(
  "/api/admin/categories?rootOnly=true&withProductCounts=true",
  {
    credentials: "include",
  }
);

// Get children of specific category
const response = await fetch("/api/admin/categories?parentId=cat_123", {
  credentials: "include",
});

// Search categories
const response = await fetch(
  "/api/admin/categories?search=laptop&includeInactive=true",
  {
    credentials: "include",
  }
);
```

### 2. POST /api/admin/categories

Create a new category.

#### Request Body

```json
{
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Mobile phones and accessories",
  "image": "https://example.com/smartphones.jpg",
  "icon": "📱",
  "seo": {
    "title": "Smartphones | Electronics Store",
    "description": "Browse our smartphone collection",
    "keywords": ["smartphones", "mobile", "phones", "cellular"]
  },
  "parentId": "electronics_id",
  "isActive": true,
  "featured": false,
  "sortOrder": 10
}
```

#### Required Fields

- `name` (string): Category name
- `slug` (string): URL-friendly identifier

#### Optional Fields

- `description` (string): Category description
- `image` (string): Category image URL
- `icon` (string): Category icon/emoji
- `seo` (object): SEO metadata
- `parentId` (string): Parent category ID
- `isActive` (boolean): Active status (default: true)
- `featured` (boolean): Featured status (default: false)
- `sortOrder` (number): Display order (default: 0)

#### Response

```json
{
  "success": true,
  "data": {
    "id": "cat_456",
    "name": "Smartphones",
    "slug": "smartphones",
    "parentId": "electronics_id",
    "parentIds": ["electronics_id"],
    "level": 1,
    "isLeaf": true,
    "productCount": 0,
    "inStockCount": 0,
    "outOfStockCount": 0,
    "lowStockCount": 0,
    "createdAt": "2025-10-25T10:30:00Z",
    "updatedAt": "2025-10-25T10:30:00Z"
  }
}
```

#### Error Responses

```json
// Validation Error
{
  "success": false,
  "error": "Name and slug are required",
  "status": 400
}

// Duplicate Slug
{
  "success": false,
  "error": "Slug already exists",
  "status": 400
}

// Parent Not Found
{
  "success": false,
  "error": "Parent category not found",
  "status": 400
}

// Unauthorized
{
  "success": false,
  "error": "Admin access required",
  "status": 403
}
```

### 3. GET /api/admin/categories/tree

Get complete category hierarchy as tree structure.

#### Query Parameters

| Parameter           | Type    | Default | Description                 |
| ------------------- | ------- | ------- | --------------------------- |
| `includeInactive`   | boolean | false   | Include inactive categories |
| `withProductCounts` | boolean | false   | Include stock calculations  |
| `maxDepth`          | number  | -       | Limit tree depth            |

#### Response

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "electronics",
        "name": "Electronics",
        "level": 0,
        "children": [
          {
            "id": "computers",
            "name": "Computers",
            "level": 1,
            "children": [
              {
                "id": "laptops",
                "name": "Laptops",
                "level": 2,
                "isLeaf": true,
                "productCount": 25
              }
            ]
          }
        ]
      }
    ],
    "totalCategories": 15,
    "maxDepth": 3
  }
}
```

### 4. GET /api/admin/categories/leaf

Get only leaf categories (categories that can have products assigned).

**Query Parameters:**

- `includeInactive` - Include inactive categories (default: false)
- `search` - Search query to filter leaf categories
- `withProductCounts` - Include product count calculations (default: false)
- `limit` - Maximum number of results to return

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat456",
      "name": "Gaming Laptops",
      "slug": "gaming-laptops",
      "level": 2,
      "isLeaf": true,
      "fullPath": "Electronics > Computers > Gaming Laptops",
      "productCount": 15,
      "inStockCount": 12,
      "outOfStockCount": 3,
      "lowStockCount": 2
    }
  ],
  "meta": {
    "total": 25,
    "totalLeafCategories": 45,
    "search": "laptop",
    "limit": 20,
    "withProductCounts": true
  }
}
```

### 5. GET /api/admin/categories/search

Advanced search across all categories with relevance scoring.

**Query Parameters:**

- `q` or `query` - Search query (minimum 2 characters)
- `limit` - Maximum results (default: 50)
- `includeInactive` - Include inactive categories
- `leafOnly` - Search only leaf categories
- `withProductCounts` - Include product counts

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat789",
        "name": "Laptops",
        "fullPath": "Electronics > Computers > Laptops",
        "isLeaf": true,
        "matchType": "exact",
        "relevanceScore": 20,
        "productCount": 25
      }
    ],
    "query": "laptops",
    "total": 3,
    "totalFound": 8,
    "filters": {
      "leafOnly": true,
      "includeInactive": false,
      "withProductCounts": true,
      "limit": 50
    }
  }
}
```

### 6. GET /api/admin/categories/:id

Get single category by ID.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "cat_123",
    "name": "Electronics"
    // ... full category object
  }
}
```

### 7. PUT /api/admin/categories/:id

Update existing category.

#### Request Body

Same as POST request, all fields optional except constraints:

- Cannot change `parentId` to create circular references
- Cannot change `slug` to duplicate existing slug

#### Response

```json
{
  "success": true,
  "data": {
    // Updated category object
  }
}
```

### 8. DELETE /api/admin/categories/:id

Delete category (only if no children and no products).

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Cannot delete category with children or products",
  "status": 400
}
```

### 9. PUT /api/admin/categories/update-counts

Recalculate stock counts for all categories.

#### Request Body

```json
{
  "force": true // Optional: force recalculation even if recent
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "updated": 45,
    "processed": 45,
    "skipped": 0,
    "errors": 0,
    "duration": "2.3s"
  }
}
```

### 10. POST /api/admin/categories/validate-slug

Validate or generate category slug.

#### Request Body

```json
{
  "slug": "custom-slug",
  "excludeId": "cat_123" // Optional: exclude from uniqueness check
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "slug": "custom-slug",
    "available": true,
    "suggestions": [] // If not available
  }
}
```

### 11. POST /api/admin/categories/bulk

Perform bulk operations on multiple categories.

#### Request Body

```json
{
  "operation": "activate|deactivate|delete|setFeatured|updateSortOrder|moveToParent",
  "categoryIds": ["cat_1", "cat_2", "cat_3"],
  "data": {
    // Operation-specific data
    "featured": true, // For setFeatured
    "parentId": "new_parent", // For moveToParent
    "sortOrder": 10 // For updateSortOrder
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "operation": "activate",
    "processedCount": 3,
    "results": [
      { "id": "cat_1", "success": true },
      { "id": "cat_2", "success": true },
      { "id": "cat_3", "success": false, "error": "Not found" }
    ]
  }
}
```

## Client SDK

### CategoryService Methods

```typescript
// Get categories
const categories = await CategoryService.getCategories({
  parentId: "electronics",
  withProductCounts: true,
});

// Create category
const newCategory = await CategoryService.createCategory({
  name: "New Category",
  slug: "new-category",
  parentId: "parent-id",
});

// Update category
const updated = await CategoryService.updateCategory("cat-id", {
  name: "Updated Name",
});

// Delete category
await CategoryService.deleteCategory("cat-id");

// Get tree structure
const tree = await CategoryService.getCategoryTree({
  withProductCounts: true,
  maxDepth: 3,
});

// Search categories
const results = await CategoryService.searchCategories("laptop");

// Validate slug
const validation = await CategoryService.validateSlug("my-slug");

// Generate slug from name
const slug = CategoryService.generateSlugFromName("My Category Name");
// Returns: "my-category-name"

// Bulk operations
await CategoryService.bulkOperation("activate", ["cat1", "cat2"]);
```

## Error Handling

### Common Error Codes

- `400` - Bad Request (validation, duplicate slug, etc.)
- `401` - Unauthorized (no authentication)
- `403` - Forbidden (not admin)
- `404` - Not Found (category doesn't exist)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## Rate Limiting

- Development: No rate limiting
- Production: 100 requests per minute per IP
- Admin endpoints: 200 requests per minute per user

## Performance Notes

### Caching

- Category tree is cached for 5 minutes
- Individual categories cached for 10 minutes
- Product counts recalculated on demand

### Optimization Tips

- Use `withProductCounts=false` when counts not needed
- Implement client-side caching for category trees
- Use pagination for large category lists
- Batch multiple operations when possible

### Database Queries

- Hierarchy queries use `parentIds` array index
- Stock count aggregation can be expensive for deep hierarchies
- Consider denormalizing data for frequently accessed patterns

---

_API Version: 2.0.0_
_Last Updated: October 2025_
