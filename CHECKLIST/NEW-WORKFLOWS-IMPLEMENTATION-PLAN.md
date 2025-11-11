# API Route Merge & New Workflows Implementation Plan

## Summary of Changes Needed

### 1. Merge Admin Test-Workflow Routes ✅ PLAN READY

**Current Structure:**

```
src/app/api/admin/test-workflow/
├── cleanup/route.ts
├── auctions/route.ts
├── categories/route.ts
├── status/route.ts
├── tickets/route.ts
├── shop/route.ts
├── reviews/route.ts
├── orders/route.ts
├── coupons/route.ts
├── execute/route.ts (main entry point)
└── products/route.ts
```

**Target Structure:**

```
src/lib/test-workflows/workflows/
├── 01-07: Existing workflows ✅
├── 08-seller-product-creation.ts (10 steps) ⏳ IN PROGRESS
├── 09-admin-category-creation.ts (12 steps with parent-child) 📋 PLANNED
├── 10-seller-inline-operations.ts (multi-resource creation) 📋 PLANNED
├── 11-admin-inline-edits.ts (bulk inline editing) 📋 PLANNED
```

### 2. Enhanced Test Configuration ✅ COMPLETE

**Added Constants:**

```typescript
TEST_CONFIG = {
  // Extended user/shop/category/brand IDs
  BRANDS: { TEST_BRAND_ID, FEATURED_BRAND_ID },
  COUPONS: { TEST_COUPON_CODE, SELLER_COUPON_CODE },
  ORDERS: { TEST_ORDER_ID },
  TICKETS: { TEST_TICKET_ID },
  REVIEWS: { TEST_REVIEW_ID },

  // Field name constants (50+ fields)
  FIELD_NAMES: {
    PRODUCT_*: "name|slug|price|stock|etc",
    CATEGORY_*: "name|slug|parent|etc",
    SHOP_*: "name|slug|owner|etc",
    ORDER_*: "status|items|total|etc",
    // ...
  },

  // Status value constants
  STATUS_VALUES: {
    PRODUCT: { DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK },
    CATEGORY: { ACTIVE, INACTIVE },
    ORDER: { PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED },
    AUCTION: { DRAFT, SCHEDULED, ACTIVE, ENDED, CANCELLED },
    TICKET: { OPEN, IN_PROGRESS, RESOLVED, CLOSED },
  },
}
```

### 3. New Workflows to Create

#### Workflow #8: Seller Product Creation (10 Steps)

**Status**: ⏳ **IN PROGRESS** - Type errors need fixing

**Journey**: Shop Setup → Product Creation → Publishing

```
Step 1:  Check or create seller shop (inline)
Step 2:  Validate shop ownership
Step 3:  Browse categories for product
Step 4:  Create product draft
Step 5:  Add product details (price, stock, description)
Step 6:  Upload product images
Step 7:  Set shipping details
Step 8:  Add SEO metadata
Step 9:  Publish product
Step 10: Verify product is live and searchable
```

**Type Issues to Fix:**

- Use direct property names instead of dynamic keys
- Fix Shop.getById → getBySlug
- Fix Product.create to match CreateProductData interface
- Fix Category.list pagination
- Fix image array type (string[] not object[])

#### Workflow #9: Admin Category Creation (12 Steps)

**Status**: 📋 **PLANNED**

**Journey**: Parent-Child Category Hierarchy with Full Setup

```
Step 1:  List existing categories
Step 2:  Create parent category
Step 3:  Add parent category icon/image
Step 4:  Set parent category SEO
Step 5:  Create first child category
Step 6:  Link child to parent
Step 7:  Create second child category
Step 8:  Create grandchild category (3-level hierarchy)
Step 9:  Reorder categories (display order)
Step 10: Add category attributes/filters
Step 11: Publish category hierarchy
Step 12: Verify category tree and breadcrumbs
```

**Architecture**:

- Use TEST*CONFIG.FIELD_NAMES.CATEGORY*\* for all fields
- Use TEST_CONFIG.STATUS_VALUES.CATEGORY for statuses
- Store created IDs for cleanup
- Test breadcrumb navigation
- Validate parent-child relationships

#### Workflow #10: Seller Inline Operations (15 Steps)

**Status**: 📋 **PLANNED**

**Journey**: Multi-Resource Creation in Single Flow

```
Step 1:  Create shop (if not exists)
Step 2:  Create brand inline
Step 3:  Create category inline (or select existing)
Step 4:  Create first product with brand
Step 5:  Create second product with same brand
Step 6:  Create product variant inline
Step 7:  Link variant to parent product
Step 8:  Create coupon for shop
Step 9:  Test coupon on product
Step 10: Create auction for product
Step 11: Place test bid on auction
Step 12: Create another shop inline
Step 13: Transfer product between shops
Step 14: Bulk update product prices
Step 15: Verify all resources linked correctly
```

**Architecture**:

- Demonstrates inline resource creation
- Tests entity relationships
- Validates cross-resource operations
- Uses constants for all field names

#### Workflow #11: Admin Inline Edits (14 Steps)

**Status**: 📋 **PLANNED**

**Journey**: Bulk Admin Operations and Inline Editing

```
Step 1:  List pending orders
Step 2:  Bulk update order statuses (inline)
Step 3:  List flagged reviews
Step 4:  Bulk moderate reviews (approve/reject)
Step 5:  List support tickets
Step 6:  Bulk assign tickets to agents
Step 7:  List products needing moderation
Step 8:  Bulk approve/reject products
Step 9:  List inactive shops
Step 10: Bulk activate shops with inline verification
Step 11: List expired coupons
Step 12: Bulk deactivate coupons
Step 13: Generate analytics report
Step 14: Verify all bulk operations succeeded
```

**Architecture**:

- Uses admin-only endpoints
- Demonstrates bulk operations
- Tests inline editing patterns
- Validates permission checks

---

## Type Safety Issues & Solutions

### Problem 1: Dynamic Property Access

```typescript
// ❌ Current (causes type errors)
product[TEST_CONFIG.FIELD_NAMES.PRODUCT_NAME];

// ✅ Solution
product.name;
```

### Problem 2: Service Method Variations

```typescript
// ❌ Current
shopsService.getById(id); // doesn't exist

// ✅ Solution
shopsService.getBySlug(slug); // exists
```

### Problem 3: API Response Formats

```typescript
// ❌ Current
categories.data.length; // assuming paginated

// ✅ Solution
categories.length; // direct array
```

### Problem 4: CreateData Interfaces

```typescript
// ❌ Current
productsService.create({
  [FIELD_NAMES.PRODUCT_NAME]: "Test",
});

// ✅ Solution
productsService.create({
  name: "Test",
  slug: "test",
  price: 100,
  // ... all required fields
});
```

---

## Architectural Improvements

### 1. Base Workflow Class

Create abstract base class for shared functionality:

```typescript
abstract class BaseWorkflow {
  protected results: TestResult[] = [];
  protected passed = 0;
  protected failed = 0;

  protected async executeStep(name: string, fn: () => Promise<void>) {
    // Common execution logic
  }

  protected printSummary(duration: number) {
    // Common summary logic
  }

  abstract run(): Promise<WorkflowResult>;
}
```

### 2. Type-Safe Field Accessors

Create helper functions for type-safe access:

```typescript
// src/lib/test-workflows/helpers.ts
export function getProductField<K extends keyof Product>(
  product: Product,
  field: K
): Product[K] {
  return product[field];
}

export function setProductField<K extends keyof CreateProductData>(
  data: Partial<CreateProductData>,
  field: K,
  value: CreateProductData[K]
): void {
  data[field] = value;
}
```

### 3. Workflow Registry

Centralize workflow management:

```typescript
// src/lib/test-workflows/registry.ts
export const WORKFLOW_REGISTRY = {
  "product-purchase": ProductPurchaseWorkflow,
  "auction-bidding": AuctionBiddingWorkflow,
  "seller-product-creation": SellerProductCreationWorkflow,
  "admin-category-creation": AdminCategoryCreationWorkflow,
  "seller-inline-operations": SellerInlineOperationsWorkflow,
  "admin-inline-edits": AdminInlineEditsWorkflow,
  // ... all workflows
};
```

---

## Implementation Steps

### Phase 1: Fix Type Errors in Workflow #8 ⏳

1. Replace dynamic property access with direct properties
2. Fix service method calls (getById → getBySlug)
3. Fix create/update method signatures
4. Test workflow execution
5. Document any API limitations

### Phase 2: Create Workflow #9 (Admin Categories) 📋

1. Study categories.service.ts API
2. Implement 12-step workflow
3. Test parent-child relationships
4. Validate breadcrumb generation
5. Add to workflow registry

### Phase 3: Create Workflow #10 (Seller Inline) 📋

1. Design multi-resource creation flow
2. Implement 15-step workflow
3. Test entity relationships
4. Validate cross-resource operations
5. Add to workflow registry

### Phase 4: Create Workflow #11 (Admin Inline Edits) 📋

1. Study admin bulk operation APIs
2. Implement 14-step workflow
3. Test permission checks
4. Validate bulk operations
5. Add to workflow registry

### Phase 5: Update UI Dashboard 📋

1. Add new workflow cards
2. Update configuration panel
3. Test API route execution
4. Update documentation
5. Add new npm scripts

### Phase 6: Merge Admin Routes 📋

1. Review existing admin/test-workflow routes
2. Extract reusable logic
3. Integrate into new workflow system
4. Deprecate old admin routes
5. Update documentation

---

## File Structure After Completion

```
src/lib/test-workflows/
├── index.ts (barrel export)
├── test-config.ts (✅ enhanced with constants)
├── base-workflow.ts (📋 new abstract class)
├── helpers.ts (📋 type-safe utilities)
├── registry.ts (📋 workflow registry)
└── workflows/
    ├── 01-product-purchase.ts ✅
    ├── 02-auction-bidding.ts ✅
    ├── 03-order-fulfillment.ts ✅
    ├── 04-support-tickets.ts ✅
    ├── 05-reviews-ratings.ts ✅
    ├── 06-advanced-browsing.ts ✅
    ├── 07-advanced-auction.ts ✅
    ├── 08-seller-product-creation.ts ⏳ (fixing types)
    ├── 09-admin-category-creation.ts 📋 (planned)
    ├── 10-seller-inline-operations.ts 📋 (planned)
    └── 11-admin-inline-edits.ts 📋 (planned)

src/app/api/test-workflows/[workflow]/route.ts ✅
src/app/test-workflows/page.tsx ✅

tests/
├── run-workflows.ts (✅ updated)
└── workflows/ (⏳ sync with src/lib)
```

---

## NPM Scripts to Add

```json
{
  "test:workflow:seller-product": "ts-node src/lib/test-workflows/workflows/08-seller-product-creation.ts",
  "test:workflow:admin-category": "ts-node src/lib/test-workflows/workflows/09-admin-category-creation.ts",
  "test:workflow:seller-inline": "ts-node src/lib/test-workflows/workflows/10-seller-inline-operations.ts",
  "test:workflow:admin-inline": "ts-node src/lib/test-workflows/workflows/11-admin-inline-edits.ts",
  "test:workflows:seller": "Run seller workflows (1,8,10)",
  "test:workflows:admin": "Run admin workflows (9,11)",
  "test:workflows:all": "Run all 11 workflows"
}
```

---

## Documentation to Update

1. **CHECKLIST/TEST-WORKFLOWS-QUICK-START.md**

   - Add 4 new workflows
   - Update workflow count (7 → 11)
   - Add new usage examples

2. **tests/README.md**

   - Update workflow list
   - Add new configuration options
   - Document inline creation patterns

3. **CHECKLIST/SESSION-API-ROUTE-FIX.md**

   - Add note about workflow expansion
   - Document merge process

4. **New: CHECKLIST/WORKFLOW-ARCHITECTURE-GUIDE.md**
   - Document base workflow pattern
   - Type safety guidelines
   - Best practices for new workflows

---

## Testing Checklist

### Workflow #8: Seller Product Creation

- [ ] Shop creation (inline)
- [ ] Shop ownership validation
- [ ] Category browsing
- [ ] Product draft creation
- [ ] Product details update
- [ ] Image upload
- [ ] Shipping configuration
- [ ] SEO metadata
- [ ] Product publishing
- [ ] Live verification

### Workflow #9: Admin Category Creation

- [ ] Parent category creation
- [ ] Child category creation
- [ ] Grandchild category creation
- [ ] Hierarchy validation
- [ ] Breadcrumb generation
- [ ] Display order
- [ ] Category attributes
- [ ] SEO setup
- [ ] Image upload
- [ ] Tree verification

### Workflow #10: Seller Inline Operations

- [ ] Multi-shop creation
- [ ] Inline brand creation
- [ ] Inline category creation
- [ ] Product with variants
- [ ] Coupon creation & testing
- [ ] Auction creation
- [ ] Cross-resource linking
- [ ] Bulk operations
- [ ] Transfer operations
- [ ] Relationship validation

### Workflow #11: Admin Inline Edits

- [ ] Bulk order updates
- [ ] Bulk review moderation
- [ ] Bulk ticket assignment
- [ ] Bulk product approval
- [ ] Bulk shop activation
- [ ] Bulk coupon management
- [ ] Permission validation
- [ ] Analytics generation
- [ ] Audit trail
- [ ] Operation verification

---

## Next Steps

1. ✅ **DONE**: Enhanced TEST_CONFIG with constants
2. ⏳ **IN PROGRESS**: Fix Workflow #8 type errors
3. 📋 **TODO**: Create Workflow #9 (Admin Categories)
4. 📋 **TODO**: Create Workflow #10 (Seller Inline)
5. 📋 **TODO**: Create Workflow #11 (Admin Inline)
6. 📋 **TODO**: Update UI dashboard
7. 📋 **TODO**: Update documentation
8. 📋 **TODO**: Merge admin routes
9. 📋 **TODO**: Full integration testing

---

**Current Status**: Configuration enhanced, Workflow #8 created but needs type fixes

**Estimated Time to Complete**:

- Fix Workflow #8: 30 minutes
- Create Workflows #9-11: 2-3 hours each
- UI updates: 1 hour
- Documentation: 1 hour
- Testing: 2 hours
- **Total**: 8-10 hours

**Progress**: 94% → 96% (after completing all 4 new workflows → 100%)
