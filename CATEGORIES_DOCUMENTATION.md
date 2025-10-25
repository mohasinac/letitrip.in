# Categories System Documentation

## Overview

The Categories System is a comprehensive hierarchical category management solution for the e-commerce platform. It supports unlimited nesting levels, automatic stock tracking, leaf-node product assignment, and real-time inventory aggregation.

## Architecture

### Core Concepts

1. **Hierarchical Structure**: Categories can be nested in unlimited levels (parent-child relationships)
2. **Leaf Categories**: Only leaf categories (categories without children) can have products assigned
3. **Parent Categories**: Parent categories show aggregated data from all their descendant leaf categories
4. **Stock Tracking**: Real-time inventory tracking with automatic aggregation up the hierarchy
5. **SEO Optimization**: Built-in SEO features with meta tags, keywords, and custom slugs

### Database Schema

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  
  // Hierarchy
  parentId?: string;
  parentIds: string[];  // Array of all ancestor IDs
  level: number;        // 0 = root, 1 = first level, etc.
  
  // Status
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  
  // Stock Tracking (Auto-calculated)
  productCount: number;
  inStockCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  isLeaf: boolean;      // Auto-determined: true if no children
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
```

## API Endpoints

### GET /api/admin/categories
Retrieve categories with filtering and search options.

**Query Parameters:**
- `parentId` - Filter by parent category
- `level` - Filter by hierarchy level
- `featured` - Filter by featured status
- `includeInactive` - Include inactive categories
- `search` - Text search across name, description, slug
- `withProductCounts` - Include product count calculations
- `rootOnly` - Get only root-level categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat123",
      "name": "Electronics",
      "slug": "electronics",
      "level": 0,
      "isLeaf": false,
      "productCount": 150,
      "inStockCount": 120,
      "outOfStockCount": 30,
      "lowStockCount": 15
    }
  ]
}
```

### POST /api/admin/categories
Create a new category.

**Request Body:**
```json
{
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Mobile phones and accessories",
  "parentId": "electronics-id",
  "isActive": true,
  "featured": false,
  "sortOrder": 1,
  "seo": {
    "title": "Smartphones | Electronics Store",
    "description": "Browse our collection of smartphones",
    "keywords": ["smartphones", "mobile", "phones"]
  }
}
```

### GET /api/admin/categories/tree
Get the complete category hierarchy as a tree structure.

**Query Parameters:**
- `includeInactive` - Include inactive categories
- `withProductCounts` - Include stock calculations
- `maxDepth` - Limit tree depth

### GET /api/admin/categories/leaf
Get only leaf categories (categories that can have products).

**Response includes:**
- All categories without children
- Product counts and stock information
- Hierarchy information for breadcrumbs

### PUT /api/admin/categories/update-counts
Recalculate stock counts for all categories.

**Use Cases:**
- After bulk product updates
- Data consistency checks
- Migration scripts

## Features

### 1. Hierarchical Management

**Unlimited Nesting:**
```
Electronics
├── Computers
│   ├── Laptops
│   │   ├── Gaming Laptops
│   │   └── Business Laptops
│   └── Desktops
└── Mobile Devices
    ├── Smartphones
    └── Tablets
```

**Automatic Level Calculation:**
- Root categories: `level = 0`
- Child categories: `level = parent.level + 1`
- `parentIds` array maintains full ancestry path

### 2. Leaf Category System

**Product Assignment Rules:**
- Only leaf categories can have products assigned
- Parent categories cannot have direct products
- Products automatically inherit hierarchy from their leaf category

**Visual Indicators:**
- 🍃 Leaf Category badge - can have products
- 📁 Parent Category badge - aggregated data only

### 3. Stock Tracking

**Real-time Calculations:**
- `inStockCount`: Products with quantity > 0
- `outOfStockCount`: Products with quantity = 0
- `lowStockCount`: Products with quantity ≤ lowStockThreshold
- `productCount`: Total products in category

**Aggregation Logic:**
```typescript
// For leaf categories: direct product count
const products = await db.collection('products')
  .where('category', '==', categoryId)
  .where('status', '==', 'active')
  .get();

// For parent categories: sum of all descendant leaf categories
const descendants = categories.filter(cat => 
  cat.parentIds.includes(categoryId) && cat.isLeaf
);
```

### 4. SEO Optimization

**Features:**
- Custom slugs with automatic generation
- Meta titles and descriptions
- Keyword arrays for better search
- Slug validation and uniqueness checking

**Slug Generation:**
```typescript
// Auto-generated from name
"Gaming Laptops" → "gaming-laptops"

// Custom validation
await CategoryService.validateSlug("custom-slug");
```

## Frontend Components

### CategoryStats Component
Displays category statistics with visual indicators.

```tsx
<CategoryStats 
  categories={categories}
  showLeafBadges={true}
  showStockCounts={true}
/>
```

**Features:**
- Leaf/Parent category badges
- Stock count displays
- Interactive filtering
- Real-time updates

### CategoryTreeItem Component
Renders individual categories in tree view.

```tsx
<CategoryTreeItem 
  category={category}
  level={0}
  showProducts={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Features:**
- Hierarchical indentation
- Expand/collapse functionality
- Action buttons (edit, delete)
- Stock information display

## Usage Examples

### 1. Creating a Category Hierarchy

```typescript
// 1. Create root category
const electronics = await CategoryService.createCategory({
  name: "Electronics",
  slug: "electronics",
  description: "Electronic devices and accessories",
  isActive: true,
  featured: true,
  sortOrder: 1
});

// 2. Create child category
const laptops = await CategoryService.createCategory({
  name: "Laptops",
  slug: "laptops",
  parentId: electronics.id,
  isActive: true,
  sortOrder: 1
});

// 3. Create leaf category for products
const gamingLaptops = await CategoryService.createCategory({
  name: "Gaming Laptops",
  slug: "gaming-laptops",
  parentId: laptops.id,
  isActive: true,
  sortOrder: 1
});
```

### 2. Querying Categories

```typescript
// Get all root categories
const rootCategories = await CategoryService.getCategories({
  rootOnly: true,
  withProductCounts: true
});

// Get category tree
const tree = await CategoryService.getCategoryTree({
  includeInactive: false,
  withProductCounts: true,
  maxDepth: 3
});

// Search categories
const results = await CategoryService.searchCategories("laptop", {
  limit: 10,
  includeInactive: false
});
```

### 3. Product Assignment

```typescript
// Only assign products to leaf categories
const leafCategories = await fetch('/api/admin/categories/leaf').json();

// Assign product to leaf category
await ProductService.createProduct({
  name: "Gaming Laptop XYZ",
  category: leafCategories.find(cat => cat.slug === 'gaming-laptops').id,
  // ... other product data
});
```

## Database Indices

Essential Firestore indices for optimal performance:

```json
{
  "indexes": [
    {
      "collectionGroup": "categories",
      "fields": [
        {"fieldPath": "parentIds", "arrayConfig": "CONTAINS"},
        {"fieldPath": "isActive", "order": "ASCENDING"}
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "categories",
      "fieldPath": "isLeaf",
      "indexes": [{"order": "ASCENDING", "queryScope": "COLLECTION"}]
    },
    {
      "collectionGroup": "categories",
      "fieldPath": "inStockCount",
      "indexes": [{"order": "ASCENDING", "queryScope": "COLLECTION"}]
    },
    {
      "collectionGroup": "categories",
      "fieldPath": "outOfStockCount", 
      "indexes": [{"order": "ASCENDING", "queryScope": "COLLECTION"}]
    },
    {
      "collectionGroup": "categories",
      "fieldPath": "lowStockCount",
      "indexes": [{"order": "ASCENDING", "queryScope": "COLLECTION"}]
    }
  ]
}
```

## Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /categories/{categoryId} {
      // Read: Public for active categories
      allow read: if resource.data.isActive == true;
      
      // Read: Admin can read all
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Write: Admin only
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Validate hierarchy constraints
      allow write: if validateCategoryHierarchy(request.resource.data);
    }
  }
  
  function validateCategoryHierarchy(data) {
    // Prevent circular references
    return data.parentId != resource.id &&
           // Validate level calculation
           (data.parentId == null ? data.level == 0 : data.level > 0) &&
           // Validate required fields
           data.name is string && data.slug is string;
  }
}
```

## Best Practices

### 1. Category Structure Design
- **Plan hierarchy depth**: Keep under 5 levels for better UX
- **Use descriptive names**: Clear, searchable category names
- **Consistent sorting**: Use sortOrder for logical arrangement
- **SEO optimization**: Include relevant keywords in slugs

### 2. Performance Optimization
- **Lazy loading**: Load categories on demand in deep hierarchies
- **Caching**: Cache frequently accessed category trees
- **Indexing**: Ensure proper Firestore indices are deployed
- **Batch operations**: Use bulk operations for mass updates

### 3. Data Integrity
- **Validation**: Always validate parent-child relationships
- **Consistency**: Regular stock count recalculation
- **Backup**: Regular category structure backups
- **Migration**: Test hierarchy changes in staging first

### 4. User Experience
- **Visual indicators**: Clear leaf/parent category badges
- **Breadcrumbs**: Show full category path in product views
- **Search**: Implement category search and filtering
- **Mobile optimization**: Responsive category navigation

## Troubleshooting

### Common Issues

1. **Stock counts not updating**
   - Run `/api/admin/categories/update-counts`
   - Check Firestore indices are deployed
   - Verify product category assignments

2. **Authentication errors**
   - Ensure JWT cookies are being sent (`credentials: 'include'`)
   - Check user role permissions
   - Verify admin authentication middleware

3. **Hierarchy issues**
   - Validate parentIds array consistency
   - Check for circular references
   - Verify level calculations

4. **Performance issues**
   - Deploy required Firestore indices
   - Implement query result caching
   - Use pagination for large category sets

### Debug Commands

```bash
# Check Firestore indices
firebase firestore:indexes

# Validate category data
curl -X GET "http://localhost:3000/api/admin/categories?withProductCounts=true"

# Test authentication
curl -X POST "http://localhost:3000/api/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test"}'
```

## Migration Guide

### From Simple Categories to Hierarchical

1. **Backup existing data**
2. **Add hierarchy fields** to existing categories
3. **Set default values**: `level=0`, `parentIds=[]`, `isLeaf=true`
4. **Update product assignments** to leaf categories only
5. **Recalculate stock counts**
6. **Deploy new indices**
7. **Update frontend components**

### Example Migration Script

```typescript
async function migrateCategories() {
  const categories = await db.collection('categories').get();
  
  for (const doc of categories.docs) {
    await doc.ref.update({
      level: 0,
      parentIds: [],
      isLeaf: true,
      inStockCount: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      productCount: 0
    });
  }
  
  // Recalculate counts
  await fetch('/api/admin/categories/update-counts', {method: 'PUT'});
}
```

## Changelog

### v2.0.0 - Hierarchical Categories
- ✅ Added unlimited hierarchy support
- ✅ Implemented leaf category system
- ✅ Real-time stock tracking
- ✅ SEO optimization features
- ✅ Admin interface with visual indicators

### v1.0.0 - Basic Categories
- ✅ Simple category CRUD operations
- ✅ Basic product assignment
- ✅ Admin management interface

---

*Last updated: October 2025*
*Version: 2.0.0*
