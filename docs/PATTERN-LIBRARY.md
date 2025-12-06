/\*\*

- @fileoverview Pattern Library Documentation
- @module docs/PATTERN-LIBRARY
- @description Documentation of reusable patterns and components created for codebase optimization.
-
- @created 2025-12-06
- @author mohasinac
- @see {@link https://mohasin.chinnapattan.com}
  \*/

# Pattern Library

This document catalogs reusable patterns and components that have been created to improve code reusability and reduce duplication across the codebase.

## Table of Contents

1. [SelectorWithCreate Pattern](#selectorwithcreate-pattern)
2. [FeaturedSection Pattern](#featuredsection-pattern)
3. [BaseService Pattern](#baseservice-pattern)
4. [Status Badge Pattern](#status-badge-pattern)
5. [Migration Guide](#migration-guide)

---

## SelectorWithCreate Pattern

**File:** `src/components/common/SelectorWithCreate.tsx`

### Purpose

Generic component that combines dropdown selection with inline item creation capability. Eliminates duplication across 7+ similar selector components.

### Replaces

- AddressSelectorWithCreate
- ContactSelectorWithCreate
- DocumentSelectorWithUpload
- TagSelectorWithCreate
- CategorySelectorWithCreate
- BankAccountSelectorWithCreate
- TaxDetailsSelectorWithCreate

### Features

- Searchable dropdown
- Inline creation with modal
- Single and multi-select variants
- Type-safe with generics
- Customizable form rendering
- Loading states
- Error handling

### Usage Examples

#### Basic Usage

```typescript
import { SelectorWithCreate } from "@/components/common/SelectorWithCreate";

<SelectorWithCreate
  label="Category"
  value={selectedCategory}
  options={categories}
  onChange={setSelectedCategory}
  allowCreate
  createLabel="New Category"
  createForm={<CategoryForm onSubmit={handleCreate} />}
/>;
```

#### With Render Props

```typescript
<SelectorWithCreate
  label="Address"
  value={selectedAddress}
  options={addresses}
  onChange={setSelectedAddress}
  allowCreate
  createForm={({ onSubmit, onCancel }) => (
    <AddressForm onSubmit={onSubmit} onCancel={onCancel} />
  )}
  onCreateSubmit={async (data) => {
    const newAddress = await createAddress(data);
    return { value: newAddress.id, label: newAddress.fullAddress };
  }}
/>
```

#### Multi-Select Variant

```typescript
import { MultiSelectorWithCreate } from "@/components/common/SelectorWithCreate";

<MultiSelectorWithCreate
  label="Tags"
  value={selectedTags}
  options={tags}
  onChange={setSelectedTags}
  maxSelections={5}
  allowCreate
/>;
```

### Migration Steps

1. Import `SelectorWithCreate` component
2. Replace old selector component
3. Pass appropriate `createForm` prop
4. Implement `onCreateSubmit` handler
5. Update types if needed
6. Test functionality

---

## FeaturedSection Pattern

**File:** `src/components/common/FeaturedSection.tsx`

### Purpose

Generic component for displaying featured content sections with consistent layout, loading states, and error handling.

### Replaces

- FeaturedProductsSection
- FeaturedAuctionsSection
- FeaturedShopsSection
- FeaturedCategoriesSection
- FeaturedBlogsSection
- RecentReviewsSection

### Features

- Flexible grid layouts (2-6 columns)
- Loading skeletons
- Empty states
- Auto-refresh capability
- Custom header actions
- Responsive design
- Error handling
- View all link

### Usage Examples

#### Featured Products

```typescript
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { ProductCard } from "@/components/cards/ProductCard";
import { productsService } from "@/services/products.service";

<FeaturedSection
  title="Featured Products"
  subtitle="Handpicked items just for you"
  fetchFn={productsService.getFeatured}
  renderCard={(product) => <ProductCard {...product} />}
  viewAllLink="/products"
  columns={4}
/>;
```

#### Recent Reviews with Auto-Refresh

```typescript
<FeaturedSection
  title="Recent Reviews"
  fetchFn={reviewsService.getRecent}
  renderCard={(review) => <ReviewCard {...review} />}
  autoRefresh
  refreshInterval={30000}
  emptyMessage="No reviews yet"
/>
```

#### Custom Layout

```typescript
<FeaturedSection
  title="Shop Highlights"
  fetchFn={shopsService.getFeatured}
  renderCard={(shop) => <ShopCard {...shop} />}
  columns={3}
  maxWidth="xl"
  background="gray"
  bordered
  headerActions={<button onClick={handleCustomAction}>Custom Action</button>}
/>
```

### Migration Steps

1. Import `FeaturedSection` component
2. Replace old section component
3. Pass `fetchFn` for data loading
4. Implement `renderCard` function
5. Configure layout options
6. Test loading and error states

---

## BaseService Pattern

**File:** `src/services/base.service.ts`

### Purpose

Abstract base class for all entity services providing common CRUD operations. Eliminates duplication across 23 service files.

### Features

- Standard CRUD operations (list, getById, create, update, delete)
- Bulk operations (bulkUpdate, bulkDelete)
- Type transformations (BE ↔ FE)
- Error handling
- Query string building
- Pagination support
- Filtering support

### Implementation Example

```typescript
import { BaseService } from "@/services/base.service";
import type { ProductBE } from "@/types/backend/product.types";
import type {
  ProductFE,
  ProductFormFE,
  ProductFiltersFE,
} from "@/types/frontend/product.types";
import {
  toBEProductCreate,
  toFEProduct,
} from "@/types/transforms/product.transforms";

class ProductsService extends BaseService<
  ProductBE,
  ProductFE,
  ProductFormFE,
  ProductFiltersFE
> {
  protected endpoint = "/api/products";
  protected entityName = "Product";

  protected toBE(form: ProductFormFE): Partial<ProductBE> {
    return toBEProductCreate(form);
  }

  protected toFE(be: ProductBE): ProductFE {
    return toFEProduct(be);
  }

  // Add custom methods
  async getFeatured(): Promise<ProductFE[]> {
    try {
      const response = await apiService.get<ProductBE[]>(
        `${this.endpoint}/featured`
      );
      return this.toFEArray(response);
    } catch (error) {
      return this.handleError(error, "getFeatured");
    }
  }
}

export const productsService = new ProductsService();
```

### Available Methods

- `list(filters?)` - Get paginated list
- `getById(id)` - Get single entity
- `getBySlug(slug)` - Get by slug
- `create(data)` - Create new entity
- `update(id, data)` - Full update
- `patch(id, data)` - Partial update
- `delete(id)` - Delete entity
- `bulkDelete(ids)` - Delete multiple
- `bulkUpdate(ids, data)` - Update multiple
- `exists(id)` - Check existence
- `count(filters?)` - Get count

### Migration Steps

1. Import `BaseService` class
2. Extend it with your service class
3. Implement required abstract methods:
   - `endpoint`
   - `entityName`
   - `toBE()`
   - `toFE()`
4. Remove duplicated CRUD methods
5. Keep custom methods
6. Update imports in components
7. Test all operations

---

## Status Badge Pattern

**Files:**

- `src/constants/status-configs.ts` - Centralized configurations
- `src/components/common/StatusBadge.tsx` - Badge component

### Purpose

Centralized status badge styling and text configurations for all entity types. Eliminates ~200 lines of duplicated badge configurations.

### Features

- Centralized status configurations
- Multiple status categories (orders, payments, products, auctions, users, shops, tickets, verification)
- Consistent styling
- Icons for each status
- Multiple variants (filled, outlined, subtle)
- Multiple sizes (sm, md, lg)
- Tooltip support

### Usage Examples

#### Basic Status Badge

```typescript
import { StatusBadge } from "@/components/common/StatusBadge";

<StatusBadge category="orders" status="shipped" showIcon />;
```

#### Custom Styling

```typescript
<StatusBadge
  category="payments"
  status="completed"
  size="lg"
  variant="outlined"
  showTooltip
/>
```

#### Get Configuration Directly

```typescript
import { getStatusConfig } from "@/constants/status-configs";

const config = getStatusConfig("orders", "shipped");
// Returns: { label: 'Shipped', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', icon: Truck }
```

### Available Status Categories

- `orders` - pending, processing, shipped, delivered, cancelled, refunded
- `payments` - pending, completed, failed, refunded
- `products` - active, draft, archived, out_of_stock
- `auctions` - upcoming, active, ending_soon, ended, cancelled
- `users` - active, inactive, suspended, pending
- `shops` - active, pending, suspended, closed
- `tickets` - open, in_progress, resolved, closed
- `verification` - verified, pending, rejected, not_verified
- `common` - success, warning, error, info

### Migration Steps

1. Import `StatusBadge` component
2. Replace inline badge JSX
3. Pass appropriate category and status
4. Remove old status mapping objects
5. Test all status displays

---

## Migration Guide

### 4-Week Implementation Plan

#### Week 1: SelectorWithCreate Migration

**Goal:** Consolidate 7 selector components into 1 generic component

**Tasks:**

1. **Day 1-2:** Audit existing selector components

   - List all instances of selector-with-create pattern
   - Document unique features in each
   - Identify migration priorities

2. **Day 3-4:** Implement and test generic component

   - Create comprehensive tests
   - Test with different data types
   - Verify modal functionality

3. **Day 5:** Migrate high-traffic pages
   - Products page selectors
   - Checkout flow selectors
   - Admin dashboard selectors

**Expected Savings:** ~500 lines of code

#### Week 2: FeaturedSection Migration

**Goal:** Consolidate 6 featured section components

**Tasks:**

1. **Day 1-2:** Implement FeaturedSection component

   - Add all layout variants
   - Test loading states
   - Verify auto-refresh

2. **Day 3-4:** Migrate homepage sections

   - Featured Products
   - Featured Auctions
   - Featured Shops

3. **Day 5:** Migrate category and detail pages
   - Related products sections
   - Recent reviews sections
   - Blog sections

**Expected Savings:** ~400 lines of code

#### Week 3: BaseService Implementation

**Goal:** Refactor 23 service files to use base class

**Tasks:**

1. **Day 1-2:** Implement and test BaseService

   - Test all CRUD operations
   - Verify type transformations
   - Test error handling

2. **Day 3:** Migrate core services

   - ProductsService
   - AuctionsService
   - OrdersService

3. **Day 4:** Migrate secondary services

   - ShopsService
   - ReviewsService
   - CategoriesService

4. **Day 5:** Migrate remaining services and test
   - Complete all migrations
   - Run integration tests
   - Update service documentation

**Expected Savings:** ~1,000 lines of code

#### Week 4: Status Badge Consolidation & Documentation

**Goal:** Centralize status configs and document patterns

**Tasks:**

1. **Day 1-2:** Migrate to StatusBadge

   - Update all order status displays
   - Update all payment status displays
   - Update product/auction statuses

2. **Day 3:** Complete migration

   - User/shop status displays
   - Ticket/verification statuses
   - Test all pages

3. **Day 4-5:** Documentation and cleanup
   - Document pattern library
   - Create usage examples
   - Update developer guide
   - Remove old components
   - Final testing

**Expected Savings:** ~200 lines of code

### Total Expected Impact

- **Code Reduction:** ~2,100 lines
- **Files Reduced:** 17 files consolidated
- **Maintenance:** 85% easier pattern updates
- **Reusability Score:** 75/100 → 90/100

---

## Best Practices

### When to Use Patterns

#### Use SelectorWithCreate When:

- You need a dropdown with create capability
- Items can be created inline
- Form is relatively simple
- Creation doesn't require multiple steps

#### Use FeaturedSection When:

- Displaying curated/featured content
- Need consistent section styling
- Loading states are important
- Content refreshes periodically

#### Use BaseService When:

- Creating a new entity service
- Entity has standard CRUD operations
- Need BE ↔ FE type transformations
- Want consistent error handling

#### Use StatusBadge When:

- Displaying entity status
- Status has predefined states
- Need consistent badge styling
- Status appears in multiple places

### Testing Patterns

Each pattern should have:

1. Unit tests for core functionality
2. Integration tests with real data
3. Visual regression tests for UI components
4. Performance tests for data-heavy operations

### Extending Patterns

All patterns are designed to be extended:

```typescript
// Extending SelectorWithCreate
export function ProductSelector(props: Omit<SelectorWithCreateProps, 'createForm'>) {
  return (
    <SelectorWithCreate
      {...props}
      createForm={<ProductForm />}
      onCreateSubmit={productsService.create}
    />
  );
}

// Extending FeaturedSection
export function FeaturedProducts(props: Partial<FeaturedSectionProps>) {
  return (
    <FeaturedSection
      title="Featured Products"
      fetchFn={productsService.getFeatured}
      renderCard={(p) => <ProductCard {...p} />}
      columns={4}
      {...props}
    />
  );
}

// Extending BaseService
class ProductsService extends BaseService<...> {
  // Add custom methods
  async getFeatured() { ... }
  async getByCategory(categoryId: string) { ... }
}
```

---

## Next Steps

1. **Review Implementation:** Examine each pattern implementation
2. **Start Migration:** Follow 4-week plan
3. **Monitor Impact:** Track code reduction and performance
4. **Iterate:** Refine patterns based on usage
5. **Document:** Update as patterns evolve

---

## Resources

- [React Patterns Documentation](https://reactpatterns.com/)
- [TypeScript Generics Guide](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Component Composition](https://reactjs.org/docs/composition-vs-inheritance.html)

---

_Last Updated: 2025-12-06_
_Maintained by: mohasinac_
