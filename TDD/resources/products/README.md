# Products Resource

> **Last Updated**: December 7, 2025  
> **Status**: ✅ Fully Implemented (Phase 1 & 2)  
> **Related Epic**: [E002: Product Catalog](../../epics/E002-product-catalog.md)

---

## Overview

Product catalog management for sellers with inventory tracking, variants, media management, and multi-role access control.

## Database Collections

- `products` - Product documents with full details
- `product_views` - Product view tracking
- `viewing_history` - User viewing history

## Service Layer

**Location**: `src/services/products.service.ts`

### Available Methods

```typescript
class ProductsService {
  // List & Filtering
  async list(params?: ProductListParams): Promise<ProductFE[]>;
  async getBySlug(slug: string): Promise<ProductFE>;
  async getBatch(slugs: string[]): Promise<ProductFE[]>;

  // CRUD Operations
  async create(data: Partial<ProductBE>): Promise<ProductFE>;
  async update(slug: string, data: Partial<ProductBE>): Promise<ProductFE>;
  async delete(slug: string): Promise<void>;

  // Bulk Operations
  async bulkUpdate(operations: BulkOperation[]): Promise<void>;
  async bulkDelete(slugs: string[]): Promise<void>;

  // Related Products
  async getSimilar(slug: string): Promise<ProductFE[]>;
  async getSellerItems(slug: string): Promise<ProductFE[]>;

  // Variants
  async getVariants(slug: string): Promise<ProductVariant[]>;

  // Reviews
  async getReviews(slug: string): Promise<ReviewFE[]>;

  // Validation
  async validateSlug(slug: string): Promise<boolean>;

  // View Tracking
  async trackView(slug: string): Promise<void>;
}
```

## API Routes

### Public Routes

```
GET  /api/products                   - List products (published)
GET  /api/products/:slug              - Get product by slug
GET  /api/products/:slug/similar      - Similar products
GET  /api/products/:slug/seller-items - More from seller
GET  /api/products/:slug/variants     - Product variants
GET  /api/products/:slug/reviews      - Product reviews
POST /api/products/:slug/view         - Track product view
POST /api/products/batch              - Get multiple products
```

### Seller Routes

```
POST   /api/products                 - Create product (own shop)
PATCH  /api/products/:slug            - Update product (own)
DELETE /api/products/:slug            - Delete product (own, draft only)
POST   /api/products/bulk             - Bulk operations (own products)
POST   /api/products/validate-slug    - Validate slug uniqueness
```

### Admin Routes

```
GET    /api/admin/products           - All products (any status)
PATCH  /api/admin/products/:slug      - Update any product
DELETE /api/admin/products/:slug      - Delete any product
POST   /api/admin/products/:slug/feature - Feature/unfeature product
POST   /api/admin/products/bulk       - Bulk admin operations
```

## Types

**Location**: `src/types/backend/product.types.ts`, `src/types/frontend/product.types.ts`

- `ProductBE` - Backend product type (Firestore document)
- `ProductFE` - Frontend product type (transformed for UI)
- `ProductListItemBE` - List item type for tables
- `ProductVariant` - Product variant type
- `ProductStatus` - 'draft' | 'published' | 'archived' | 'out_of_stock'

## Components

### Card Components

- `src/components/cards/ProductCard.tsx` - Unified card with 4 variants (public/admin/seller/compact)

### Product Display

- `src/components/product/SimilarProducts.tsx` - Similar products section (with empty state)
- `src/components/product/SellerProducts.tsx` - More from seller section (with empty state)
- `src/components/product/ProductGallery.tsx` - Image gallery with auto-slideshow

### Pages

- `src/app/products/page.tsx` - Public product listing
- `src/app/products/[slug]/page.tsx` - Product detail page
- `src/app/seller/products/` - Seller product management
- `src/app/admin/products/` - Admin product management

## Features Implemented

### Phase 1

- ✅ Full CRUD operations with RBAC
- ✅ Product variants support
- ✅ Media management (images/videos)
- ✅ Slug validation and generation
- ✅ Status management (draft/published/archived)
- ✅ View tracking and analytics
- ✅ Category association
- ✅ Shop association

### Phase 2 (Session 17)

- ✅ Unified ProductCard with 4 variants
- ✅ Empty state fallbacks for related products
- ✅ Dark mode support across all components
- ✅ Selection support for bulk operations
- ✅ Horizontal scroll containers for product lists
- ✅ Auto-slideshow in product gallery (3s intervals)

## RBAC Permissions

| Action         | Admin | Seller | User | Guest |
| -------------- | ----- | ------ | ---- | ----- |
| View Published | ✅    | ✅     | ✅   | ✅    |
| View All       | ✅    | ❌     | ❌   | ❌    |
| Create         | ✅    | ✅     | ❌   | ❌    |
| Update Own     | ✅    | ✅     | ❌   | ❌    |
| Update Any     | ✅    | ❌     | ❌   | ❌    |
| Delete Own     | ✅    | ✅     | ❌   | ❌    |
| Delete Any     | ✅    | ❌     | ❌   | ❌    |
| Feature        | ✅    | ❌     | ❌   | ❌    |
| Bulk Ops Own   | ✅    | ✅     | ❌   | ❌    |
| Bulk Ops Any   | ✅    | ❌     | ❌   | ❌    |

## Test Coverage

- ✅ API route tests (`src/app/api/products/route.test.ts`)
- ✅ Component tests (`src/components/product/*.test.tsx`)
- ✅ Service tests (pending)
- ✅ Integration tests

## Related Documentation

- [API Specs](./API-SPECS.md) - Detailed API specifications
- [Test Cases](./TEST-CASES.md) - Comprehensive test scenarios
- [E002 Epic](../../epics/E002-product-catalog.md) - User stories and acceptance criteria
- [RBAC](../../rbac/RBAC-CONSOLIDATED.md) - Role permissions
