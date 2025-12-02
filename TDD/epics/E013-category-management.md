# Epic E013: Category Management

## Overview

Hierarchical category system with multi-parent support for organizing products and auctions.

## Scope

- Category CRUD operations
- Category hierarchy (tree structure)
- Multi-parent categories
- Category images and SEO
- Featured categories

## User Roles Involved

- **Admin**: Full category management
- **Seller**: View categories for product assignment
- **User**: Browse categories
- **Guest**: Browse categories

---

## Features

### F013.1: Category CRUD

**US013.1.1**: Create Category (Admin)

```
Fields:
- Name, Slug
- Description
- Image, Banner, Icon
- Parent categories (multi-parent)
- Order (for sorting)
- SEO fields
```

**US013.1.2**: Update Category
**US013.1.3**: Delete Category

### F013.2: Category Hierarchy

**US013.2.1**: View Category Tree
**US013.2.2**: Navigate Categories
**US013.2.3**: Get Category Breadcrumb

### F013.3: Multi-Parent Support

**US013.3.1**: Add Parent Category
**US013.3.2**: Remove Parent Category

```
A category can belong to multiple parent categories
```

### F013.4: Category Display

**US013.4.1**: Featured Categories
**US013.4.2**: Homepage Categories
**US013.4.3**: Leaf Categories (for product assignment)

---

## API Endpoints

| Endpoint                   | Method | Auth   | Description         |
| -------------------------- | ------ | ------ | ------------------- |
| `/api/categories`          | GET    | Public | List categories     |
| `/api/categories`          | POST   | Admin  | Create category     |
| `/api/categories/:slug`    | GET    | Public | Get category        |
| `/api/categories/:slug`    | PATCH  | Admin  | Update category     |
| `/api/categories/:slug`    | DELETE | Admin  | Delete category     |
| `/api/categories/tree`     | GET    | Public | Get category tree   |
| `/api/categories/leaves`   | GET    | Public | Get leaf categories |
| `/api/categories/featured` | GET    | Public | Get featured        |
| `/api/categories/homepage` | GET    | Public | Homepage categories |
| `/api/categories/bulk`     | POST   | Admin  | Bulk operations     |
| `/api/categories/reorder`  | POST   | Admin  | Reorder categories  |

---

## Data Models

```typescript
interface CategoryBE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  banner: string | null;
  icon: string | null;
  parentIds: string[]; // Multi-parent support
  level: number;
  order: number;
  status: "draft" | "published" | "archived" | "deleted";
  productCount: number;
  isLeaf: boolean;
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Implementation Status

### Session 17 - Similar Categories Component (December 2025)

**Doc Reference**: docs/22-similar-categories.md

#### Similar Categories Feature ✅

Created `SimilarCategories` component to show sibling categories on category detail pages:

**Component Created**:
- `src/components/category/SimilarCategories.tsx` - Displays categories at same tree level with same parent

**Features Implemented**:
- Fetches sibling categories via existing API `/api/categories/[slug]/similar`
- Horizontal scrollable carousel with category cards
- Scroll navigation buttons (left/right arrows)
- Loading skeleton during fetch
- Empty state with Folder icon, message, "View All Categories" button
- Shows category image or Folder icon fallback
- Product count displayed per category
- Dark mode support

**Files Changed**:
- `src/app/categories/[slug]/page.tsx` - Added `<SimilarCategories>` section after subcategories

**API Used**:
- Existing endpoint returns sibling categories (same parent)
- For root categories, returns other root categories
- Service method: `categoriesService.getSimilarCategories(slug, { limit })`

**Result**: Users can easily discover related categories, improving navigation and product discovery

---

## Related Epics

- E002: Product Catalog (product categories)
- E003: Auction System (auction categories)
- E014: Homepage CMS (category display)
- E036: Component Refactoring (SimilarCategories component)

---

## Test Documentation

- **API Specs**: `/TDD/resources/categories/API-SPECS.md`
- **Test Cases**: `/TDD/resources/categories/TEST-CASES.md`

### Test Coverage

- Unit tests for category validation
- Unit tests for multi-parent hierarchy
- Integration tests for CRUD operations
- E2E tests for category tree management
- RBAC tests for admin-only operations
