# Categories Feature

**Feature path:** `src/features/categories/`  
**Repository:** `categoriesRepository`  
**Service:** `categoryService`  
**Actions:** `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`

---

## Overview

Categories provide hierarchical product organisation. They support parent/child nesting (up to 2 levels), each with a name, slug, and optional image.

---

## Public Pages

### `CategoriesListView` (`/categories`)

Grid of all top-level categories:

- `CategoryGrid` — responsive masonry/grid layout
- Each tile: image, name, product count
- Click → `/categories/[slug]`

**Data:** `useCategoriesList()` → `categoryService.list()` → `GET /api/categories`

### `CategoryProductsView` (`/categories/[slug]`)

Products filtered to a specific category:

- Breadcrumb trail (parent → current)
- Sub-category chips (if children exist)
- `ProductGrid` + `ProductFilters` + `ProductSortBar`
- URL-driven pagination

**Data:**

- `useCategoryDetail(slug)` → `GET /api/categories/[id]`
- `useCategoryProducts(categoryId, params)` → `ProductItem[]`

**Type:** `CategoryProductItem`

---

## Category Components

### `CategoryCard`

Tile showing category image, name, and product count. Used in `CategoriesListView` and `TopCategoriesSection` on the homepage.

### `CategorySelectorCreate` — `src/components/categories/CategorySelectorCreate.tsx`

Reusable category picker used in admin and seller product forms:

- `DynamicSelect` showing existing categories
- "Create new" option — inline `CategoryForm` appears
- Supports parent selection (for sub-categories)

**Type:** `CategorySelectorCreateProps`

### `CategoryForm` — `src/components/categories/CategoryForm.tsx`

Create/edit form:

- Name (auto-generates slug)
- Slug (editable)
- Parent category (optional — makes it a sub-category)
- Image (`ImageUpload`)

### `getCategoryTableColumns`

DataTable column definitions for admin categories table: name, slug, parent, product count, actions.

---

## Admin Category Management

### `AdminCategoriesView` (`/admin/categories`)

- `CategoryTreeView` — visual tree showing parent/child relationships
- Toggle expand/collapse per parent
- Inline status toggle
- Create/edit via drawer with `CategoryForm`
- Delete with `ConfirmDeleteModal`

**Data:** `useAdminCategories()` → `GET /api/admin/categories`

---

## Homepage — `TopCategoriesSection`

Shows the 8 most popular categories (by product count) as a grid of `CategoryCard`.  
**Data:** `useTopCategories()` → `GET /api/categories?top=8`

---

## Hooks

| Hook                                 | Description                 |
| ------------------------------------ | --------------------------- |
| `useCategoriesList`                  | All categories              |
| `useCategoryDetail(slug)`            | Single category             |
| `useCategoryProducts(catId, params)` | Products in a category      |
| `useTopCategories`                   | Top categories for homepage |
| `useCategories` (shared)             | Category list for selectors |
| `useCreateCategory` (shared)         | Inline create mutation      |
| `useCategorySelector` (shared)       | Selection state             |
| `useAdminCategories`                 | Admin full category tree    |

---

## API Routes

| Method   | Route                        | Description     |
| -------- | ---------------------------- | --------------- |
| `GET`    | `/api/categories`            | Category list   |
| `GET`    | `/api/categories/[id]`       | Single category |
| `POST`   | `/api/admin/categories`      | Create category |
| `PATCH`  | `/api/admin/categories/[id]` | Update category |
| `DELETE` | `/api/admin/categories/[id]` | Delete category |
