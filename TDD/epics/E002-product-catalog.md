# Epic E002: Product Catalog

## Overview

Complete product management for sellers and admins including CRUD operations, inventory management, and product discovery.

## Scope

- Product creation and management
- Product listing and search
- Inventory tracking
- Product media management
- Product status lifecycle

## User Roles Involved

- **Admin**: Full product management
- **Seller**: Own shop products only
- **User**: View published products
- **Guest**: View published products

---

## Features

### F002.1: Product Creation

**Priority**: P0 (Critical)

#### User Stories

**US002.1.1**: Create Product (Seller)

```
As a seller
I want to create a new product
So that I can sell it on the platform

Acceptance Criteria:
- Given I am a seller with an active shop
- When I fill the product form with valid details
- Then the product is created in draft status
- And I can add images and details

Required Fields:
- Name (2-200 characters)
- Slug (auto-generated, editable)
- SKU (unique within shop)
- Price (min ₹1)
- Category
- Stock count
- Condition (new/refurbished/used)

Optional Fields:
- Description
- Compare at price (original price for discount display)
- Weight, dimensions
- Features, specifications
- Brand, manufacturer
- Return policy, warranty info
- SEO meta fields
```

**US002.1.2**: Quick Create Product

```
As a seller
I want to quickly create a product with minimal fields
So that I can list products faster

Acceptance Criteria:
- Given I am on the quick create form
- When I enter name, price, stock, category
- Then a draft product is created
- And I can edit full details later

Minimal Fields:
- Name
- Price
- Stock count
- Category
- At least 1 image
```

**US002.1.3**: Validate Product Slug

```
As a seller
I want to know if my product slug is unique
So that I don't have URL conflicts

Acceptance Criteria:
- Given I am editing the product slug
- When I enter a slug value
- Then I see if it's available or taken
- And suggestions are shown if taken
```

### F002.2: Product Media

**Priority**: P0 (Critical)

#### User Stories

**US002.2.1**: Upload Product Images

```
As a seller
I want to upload product images
So that customers can see what they're buying

Acceptance Criteria:
- Given I am editing a product
- When I upload images
- Then they are stored in Firebase Storage
- And URLs are saved to the product
- And I see upload progress

Constraints:
- Max 10 images per product
- Max 10MB per image
- Formats: JPEG, PNG, GIF, WebP
- First image is the primary/thumbnail
```

**US002.2.2**: Upload Product Videos

```
As a seller
I want to upload product videos
So that customers can see the product in action

Acceptance Criteria:
- Given I am editing a product
- When I upload a video
- Then it is stored and linked to product
- And thumbnail is auto-generated

Constraints:
- Max 2 videos per product
- Max 100MB per video
- Formats: MP4, WebM, MOV
```

**US002.2.3**: Reorder Product Media

```
As a seller
I want to reorder product images
So that the best image is shown first

Acceptance Criteria:
- Given I have multiple images
- When I drag and drop to reorder
- Then the order is saved
- And first image becomes thumbnail
```

### F002.3: Product Listing

**Priority**: P0 (Critical)

#### User Stories

**US002.3.1**: List Products (Public)

```
As a visitor
I want to browse products
So that I can find items to purchase

Acceptance Criteria:
- Given I am on the products page
- When I browse products
- Then I see published products only
- And I can filter and sort

Filters:
- Category
- Price range
- Condition
- Brand
- Rating
- In stock only

Sort Options:
- Newest first
- Price: low to high
- Price: high to low
- Most popular
- Best rated
```

**US002.3.2**: List Products (Seller)

```
As a seller
I want to view my shop's products
So that I can manage them

Acceptance Criteria:
- Given I am on my products page
- When the page loads
- Then I see all my products (any status)
- And I can filter by status

Filters (additional):
- Status: draft, published, archived, out-of-stock
- Low stock items
```

**US002.3.3**: List Products (Admin)

```
As an admin
I want to view all products
So that I can moderate the catalog

Acceptance Criteria:
- Given I am on admin products page
- When the page loads
- Then I see all products from all shops
- And I can filter by shop, status, etc.
```

### F002.4: Product Details

**Priority**: P0 (Critical)

#### User Stories

**US002.4.1**: View Product Details (Public)

```
As a visitor
I want to view product details
So that I can decide to purchase

Acceptance Criteria:
- Given I click on a product
- When the detail page loads
- Then I see full product information
- And image gallery
- And price with any discounts
- And add to cart button (if logged in)
- And reviews summary
```

**US002.4.2**: View Related Products

```
As a visitor
I want to see related products
So that I can discover similar items

Acceptance Criteria:
- Given I am viewing a product
- When I scroll down
- Then I see related products from same category
- And products from same shop
```

### F002.5: Product Updates

**Priority**: P1 (High)

#### User Stories

**US002.5.1**: Update Product (Seller)

```
As a seller
I want to update my product
So that information stays current

Acceptance Criteria:
- Given I am editing my product
- When I update fields and save
- Then the product is updated
- And changes are visible immediately

Editable by Seller:
- All fields created during creation
- Cannot change shop assignment
```

**US002.5.2**: Inline Edit Product

```
As a seller
I want to quickly edit key fields
So that I can update without opening full form

Acceptance Criteria:
- Given I am viewing product list
- When I click on an editable field
- Then I can edit inline
- And changes save automatically

Inline Editable:
- Name
- Price
- Stock count
- Status
```

**US002.5.3**: Change Product Status

```
As a seller
I want to change product status
So that I can control visibility

Acceptance Criteria:
- Given I have a product
- When I change its status
- Then visibility updates accordingly

Status Flow:
- Draft → Published (requires images, price, stock)
- Published → Archived (hidden from catalog)
- Archived → Published (restore)
- Any → Out of Stock (when stock = 0)
```

### F002.6: Product Deletion

**Priority**: P2 (Medium)

#### User Stories

**US002.6.1**: Delete Product (Seller)

```
As a seller
I want to delete a product
So that I can remove it permanently

Acceptance Criteria:
- Given I have a draft/archived product
- When I delete it
- Then it is removed from my shop
- And media is cleaned up

Restrictions:
- Cannot delete published products (must archive first)
- Cannot delete if has pending orders
```

**US002.6.2**: Bulk Delete Products

```
As a seller
I want to delete multiple products
So that I can clean up efficiently

Acceptance Criteria:
- Given I select multiple products
- When I choose bulk delete
- Then all eligible products are deleted
- And I see results (success/failed)
```

### F002.7: Bulk Product Operations

**Priority**: P1 (High)

#### User Stories

**US002.7.1**: Bulk Status Change

```
As a seller
I want to change status of multiple products
So that I can manage catalog efficiently

Acceptance Criteria:
- Given I select multiple products
- When I choose bulk status change
- Then all products are updated
- And I see success/failure count

Actions:
- Publish all
- Archive all
- Set as out of stock
```

**US002.7.2**: Bulk Price Update

```
As a seller
I want to update prices in bulk
So that I can run sales easily

Acceptance Criteria:
- Given I select multiple products
- When I apply price adjustment
- Then all prices are updated

Options:
- Fixed amount adjustment (+/- ₹X)
- Percentage adjustment (+/- X%)
```

---

## API Endpoints

| Endpoint                      | Method | Auth         | Description             |
| ----------------------------- | ------ | ------------ | ----------------------- |
| `/api/products`               | GET    | Public       | List products           |
| `/api/products`               | POST   | Seller       | Create product          |
| `/api/products/:slug`         | GET    | Public       | Get product by slug     |
| `/api/products/:slug`         | PATCH  | Seller/Admin | Update product          |
| `/api/products/:slug`         | DELETE | Seller/Admin | Delete product          |
| `/api/products/bulk`          | POST   | Seller/Admin | Bulk operations         |
| `/api/products/validate-slug` | POST   | Seller       | Check slug availability |

---

## Data Models

### ProductBE (Backend)

```typescript
interface ProductBE {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  categoryId: string;
  categoryIds?: string[];
  brand?: string;
  tags?: string[];
  price: number;
  compareAtPrice?: number;
  cost?: number;
  taxRate?: number;
  stockCount: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  images: string[];
  videos?: string[];
  status: "draft" | "published" | "archived" | "out-of-stock";
  condition: "new" | "refurbished" | "used";
  featured: boolean;
  isReturnable: boolean;
  shopId: string;
  sellerId: string;
  shippingClass: "standard" | "express" | "overnight";
  returnWindowDays?: number;
  returnPolicy?: string;
  warrantyInfo?: string;
  features?: string[];
  specifications?: Record<string, string>;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  salesCount: number;
  favoriteCount: number;
  reviewCount: number;
  averageRating: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Test Scenarios

### Unit Tests

- [ ] Validate product name length
- [ ] Validate price is positive number
- [ ] Validate slug format (lowercase, hyphens)
- [ ] Validate stock count is non-negative
- [ ] Calculate discount percentage

### Integration Tests

- [ ] Create product with all fields
- [ ] Upload images to product
- [ ] Update product and verify changes
- [ ] Status transition validation
- [ ] Bulk operations with mixed results

### E2E Tests

- [ ] Seller creates product → publishes → appears in catalog
- [ ] User searches → filters → views product
- [ ] Seller runs sale with bulk price update
- [ ] Out of stock → user cannot add to cart

---

## Business Rules

1. **Slug Uniqueness**: Product slug must be unique across all shops
2. **Publish Requirements**: Product must have at least 1 image and price > 0
3. **Stock Tracking**: When stock = 0, status auto-changes to out-of-stock
4. **Low Stock Alert**: Notify seller when stock < lowStockThreshold
5. **Delete Restrictions**: Cannot delete products with pending orders

## Implementation Status

### Session 17 - Card Variants & Empty States (December 2025)

**Doc References**: docs/13-unified-component-cards.md, docs/20-empty-section-products.md, docs/23-productcard-variants.md

#### Unified ProductCard Component ✅

Implemented variant-based ProductCard supporting:
- `variant="public"` (default) - Customer-facing card with favorites, compare, add-to-cart
- `variant="admin"` - Admin dashboard with status badges, SKU, stock count
- `variant="seller"` - Seller dashboard with sales metrics
- `variant="compact"` - Minimal card for featured sections

**Files Changed**:
- `src/components/cards/ProductCard.tsx` - Added variant prop and conditional rendering
- `/admin/products/page.tsx` - Uses unified card with `variant="admin"`

**Key Features**:
- Status badges (active/draft/out-of-stock)
- Admin/seller action buttons (edit/delete)
- Public quick actions (favorite/compare/cart)
- Consistent dark mode across all variants
- Selection support for bulk operations

#### Empty State Fallbacks ✅

Fixed `SimilarProducts` and `SellerProducts` components:
- Changed from returning `null` to showing styled empty state cards
- Added icons (Package/Store), helpful messages, "View All Products" CTA
- Dashed border styling with dark mode support

**Files Changed**:
- `src/components/product/SimilarProducts.tsx` - Empty state with Package icon
- `src/components/product/SellerProducts.tsx` - Empty state with Store icon

**Result**: Users always see helpful sections with clear navigation, even when no items exist

---

## Related Epics

- E003: Auction System (product-based auctions)
- E004: Shopping Cart (add products)
- E007: Review System (product reviews)
- E013: Category Management (product categories)
- E036: Component Refactoring (ProductCard variants)

---

## Test Documentation

- **API Specs**: `/TDD/resources/products/API-SPECS.md`
- **Test Cases**: `/TDD/resources/products/TEST-CASES.md`

### Test Coverage

- Unit tests for product validation
- Unit tests for slug generation
- Integration tests for CRUD operations
- E2E tests for seller product lifecycle
- RBAC tests for seller/admin access
