# Categories Resource

## Overview

Hierarchical category management.

## Related Epic

- [E013: Category Management](../../epics/E013-category-management.md)

## Database Collection

- `categories` - Category documents

## API Routes

```
/api/categories              - GET/POST  - List/Create
/api/categories/:slug        - GET/PATCH - Get/Update
/api/categories/:slug        - DELETE    - Delete
/api/categories/tree         - GET       - Category tree
/api/categories/leaves       - GET       - Leaf categories
/api/categories/featured     - GET       - Featured
/api/categories/homepage     - GET       - Homepage categories
/api/categories/bulk         - POST      - Bulk operations
/api/categories/reorder      - POST      - Reorder
```

## Types

- `CategoryBE` - Backend category type
- `CategoryTreeNodeBE` - Tree node type

## Service

- `categoryService` - Category operations

## Components

- `src/app/categories/` - Category pages
- `src/app/admin/categories/` - Admin category management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
