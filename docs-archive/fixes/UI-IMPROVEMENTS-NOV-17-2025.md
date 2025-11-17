# UI Improvements & Demo Data Updates - November 17, 2025

## Overview

Comprehensive UI improvements including demo data updates, navigation enhancements, filter improvements, card updates, and featured flag consolidation.

## Requirements Summary

### 1. Homepage & Featured Resources (HIGH PRIORITY)

- **Issue**: No homepage categories or shops in demo data
- **Fix**: Update demo data generation to create homepage/featured items
- **Status**: In Progress

### 2. Demo User Credentials & Avatars (MEDIUM PRIORITY)

- **Issue**: Need demo user credentials shared with admin
- **Fix**: Create credentials display page + avatar upload functionality
- **Status**: Planned

### 3. Navigation Updates (HIGH PRIORITY)

- **Issue**: Navbars and sidebars need proper info updates
- **Fix**: Update all navigation components with current data
- **Status**: Planned

### 4. Filter Sidebar Improvements (HIGH PRIORITY)

- **Issue**: Filters not auto-hideable in desktop, need better positioning
- **Fix**: Auto-hide filters, show over admin/seller sidebars, maximize product space
- **Status**: Planned

### 5. Homepage Section Cards (MEDIUM PRIORITY)

- **Issue**: Section cards don't show images
- **Fix**: Add image display to all homepage section cards
- **Status**: Planned

### 6. Image/Video Slideshow (HIGH PRIORITY)

- **Issue**: Cards only slideshow videos, not images
- **Fix**: Slideshow images, loop them if no video
- **Status**: Planned

### 7. Auction Card Similarity (MEDIUM PRIORITY)

- **Issue**: Auction cards different from product cards
- **Fix**: Make auction cards similar to product cards in design
- **Status**: Planned

### 8. Demo Auction End Dates (HIGH PRIORITY)

- **Issue**: Auction end dates in past, can't test scenarios
- **Fix**: Create 10 auctions (5 per shop) with future end dates
- **Status**: In Progress

### 9. Bid Cleanup (MEDIUM PRIORITY)

- **Issue**: Bids not deleted during cleanup
- **Fix**: Ensure bid cleanup in demo data deletion
- **Status**: Needs Verification

### 10. Category Level Ordering (MEDIUM PRIORITY)

- **Issue**: Categories need level-based row display
- **Fix**: Display categories in rows by level (root→level1→...→leaves)
- **Status**: Planned

### 11. Variant Display (LOW PRIORITY)

- **Issue**: Variants overflow during sliding, need "show all" option
- **Fix**: No overflow in sliding window, add "show all variants" button
- **Status**: Planned

### 12. Shop Product/Auction Counts & Featured Flag Consolidation (HIGH PRIORITY)

- **Issue**: Shops don't show counts, need featured shop = homepage shop
- **Fix**: Add counts to shop cards, merge homepage & featured flags
- **Status**: In Progress

## Implementation Plan

### Phase 1: Demo Data Updates (Priority 1)

1. ✅ Update demo data generator to create 2 shops (not 1)
2. ✅ Create 10 auctions total (5 per shop) with future end dates
3. ✅ Add homepage/featured flags to categories and shops
4. ✅ Ensure bid cleanup works properly
5. ✅ Add product/auction counts to shop metadata

### Phase 2: Flag Consolidation (Priority 1)

1. Merge `homepage` and `featured` flags into single `featured` flag
2. Update all database queries to use `featured` flag
3. Update all services to use `featured` flag
4. Update all types to use `featured` flag
5. Update all components to use `featured` flag
6. Create migration script (optional, for existing data)

### Phase 3: Card Improvements (Priority 2)

1. Implement image slideshow on product/auction cards
2. Add video support to slideshow
3. Make auction cards match product card design
4. Add images to homepage section cards
5. Add product/auction counts to shop cards

### Phase 4: Filter & Navigation (Priority 2)

1. Implement auto-hide filters on desktop
2. Position filters over admin/seller sidebars
3. Update all navigation components
4. Maximize product/auction display space

### Phase 5: Advanced Features (Priority 3)

1. Category level-based row display
2. Variant sliding window improvements
3. "Show all variants" functionality

## Detailed Implementation

### 1. Demo Data Generator Updates

**File**: `src/app/api/admin/demo/generate/route.ts`

#### Changes Needed:

- Create 2 demo shops instead of 1
- Generate 10 auctions (5 per shop) with future end dates
- Set `featured` flag (consolidate with `homepage`)
- Add counts to shop metadata

```typescript
// Create 2 shops (one per seller)
const shops = [];
for (let i = 0; i < 2; i++) {
  const seller = sellers[i];
  const shopRef = db.collection("shops").doc();
  const shopSlug = `demo_shop-${i + 1}`;

  await shopRef.set({
    name: `${DEMO_PREFIX}Shop ${i + 1}`,
    slug: shopSlug,
    ownerId: seller.id,
    // ... other fields
    metadata: {
      featured: i === 0, // First shop is featured/homepage
      productCount: 0, // Will update after products created
      auctionCount: 0, // Will update after auctions created
    },
  });

  shops.push({ id: shopRef.id, slug: shopSlug, ownerId: seller.id });
}

// Create 10 auctions (5 per shop) with FUTURE end dates
for (let shopIndex = 0; shopIndex < shops.length; shopIndex++) {
  const shop = shops[shopIndex];

  for (let i = 0; i < 5; i++) {
    const auctionIndex = shopIndex * 5 + i;
    const product = products[auctionIndex]; // Use different products

    const startDate = new Date(); // Now
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7 + i); // 7-11 days in future
    endDate.setHours(23, 59, 59, 999);

    const auctionRef = db.collection("auctions").doc();
    await auctionRef.set({
      // ... auction fields
      start_time: startDate,
      end_time: endDate, // FUTURE DATE
      status: "active",
      metadata: {
        featured: i < 2, // First 2 auctions per shop are featured
      },
    });
  }
}

// Update shop counts
for (const shop of shops) {
  const productCount = await db
    .collection("products")
    .where("shop_id", "==", shop.id)
    .count()
    .get();

  const auctionCount = await db
    .collection("auctions")
    .where("shop_id", "==", shop.id)
    .count()
    .get();

  await db.collection("shops").doc(shop.id).update({
    "metadata.productCount": productCount.data().count,
    "metadata.auctionCount": auctionCount.data().count,
  });
}

// Set featured categories (use featured flag, not homepage)
for (const catId of featuredCategoryIds) {
  await db
    .collection("categories")
    .doc(catId)
    .update({
      metadata: { featured: true },
    });
}
```

### 2. Type System Updates (Flag Consolidation)

**Remove `homepage` flag, use `featured` everywhere**

#### Category Types

```typescript
// types/backend/category.types.ts
export interface CategoryMetadata {
  featured?: boolean; // CHANGED: was homepage + featured
  displayOrder?: number;
  customData?: Record<string, any>;
}

// types/frontend/category.types.ts
export interface CategoryFE {
  // ...
  featured: boolean; // CHANGED: consolidated flag
}
```

#### Shop Types

```typescript
// types/frontend/shop.types.ts
export interface ShopFE {
  // ...
  featured?: boolean; // CHANGED: consolidated flag
  productCount?: number; // NEW
  auctionCount?: number; // NEW
}
```

#### Product Types

```typescript
// types/frontend/product.types.ts
export interface ProductFE {
  // ...
  featured: boolean; // CHANGED: consolidated flag (was featured)
}
```

#### Auction Types

```typescript
// types/frontend/auction.types.ts
export interface AuctionFE {
  // ...
  featured: boolean; // CHANGED: consolidated flag (was featured)
}
```

### 3. Service Layer Updates

**Update all services to use `featured` flag**

```typescript
// services/products.service.ts
async getFeatured(): Promise<ProductCardFE[]> {
  const response = await this.list({
    featured: true, // CHANGED: was featured
    limit: 20,
  });
  return response.data;
}

// services/categories.service.ts
async getFeatured(): Promise<CategoryFE[]> {
  const categoriesBE = await apiService.get<CategoryBE[]>("/categories/featured");
  return categoriesBE.map(toFECategory);
}

// services/shops.service.ts
async getFeatured(): Promise<ShopCardFE[]> {
  const shopsBE = await apiService.get<ShopBE[]>("/shops/featured");
  return shopsBE.map(toFEShopCard);
}

// services/auctions.service.ts
async getFeatured(): Promise<AuctionCardFE[]> {
  const auctionsBE = await apiService.get<AuctionBE[]>("/auctions/featured");
  return auctionsBE.map(toFEAuctionCard);
}
```

### 4. API Route Updates

**Update all API routes to query by `featured` flag**

```typescript
// app/api/products/featured/route.ts
export async function GET() {
  const snapshot = await db
    .collection("products")
    .where("featured", "==", true) // CHANGED
    .where("status", "==", "published")
    .orderBy("created_at", "desc")
    .limit(20)
    .get();
  // ...
}

// app/api/categories/featured/route.ts
export async function GET() {
  const snapshot = await db
    .collection("categories")
    .where("metadata.featured", "==", true) // CHANGED
    .orderBy("metadata.displayOrder", "asc")
    .get();
  // ...
}
```

### 5. Component Updates

**Update all components to use `featured` property**

```typescript
// components/product/ProductCard.tsx
{
  product.featured && <span className="badge badge-featured">Featured</span>;
}

// components/shop/ShopCard.tsx
<div className="shop-stats">
  <div>{shop.productCount || 0} Products</div>
  <div>{shop.auctionCount || 0} Auctions</div>
</div>;

{
  shop.featured && <span className="badge badge-featured">Featured</span>;
}
```

### 6. Homepage Updates

**Update homepage to fetch featured items**

```typescript
// app/page.tsx
const featuredCategories = await categoriesService.getFeatured();
const featuredShops = await shopsService.getFeatured();
const featuredProducts = await productsService.getFeatured();
const featuredAuctions = await auctionsService.getFeatured();
```

## Files to Modify

### Demo Data

- ✅ `src/app/api/admin/demo/generate/route.ts`
- ✅ `src/app/api/admin/demo/cleanup-all/route.ts`

### Types (Flag Consolidation)

- [ ] `src/types/backend/category.types.ts`
- [ ] `src/types/backend/product.types.ts`
- [ ] `src/types/backend/shop.types.ts`
- [ ] `src/types/backend/auction.types.ts`
- [ ] `src/types/frontend/category.types.ts`
- [ ] `src/types/frontend/product.types.ts`
- [ ] `src/types/frontend/shop.types.ts`
- [ ] `src/types/frontend/auction.types.ts`
- [ ] `src/types/transforms/*.transforms.ts`

### Services

- [ ] `src/services/categories.service.ts`
- [ ] `src/services/products.service.ts`
- [ ] `src/services/shops.service.ts`
- [ ] `src/services/auctions.service.ts`

### API Routes

- [ ] `src/app/api/categories/featured/route.ts`
- [ ] `src/app/api/products/featured/route.ts`
- [ ] `src/app/api/shops/featured/route.ts`
- [ ] `src/app/api/auctions/featured/route.ts`
- [ ] All routes that query by homepage/featured

### Components

- [ ] All product card components
- [ ] All auction card components
- [ ] All shop card components
- [ ] All category components
- [ ] Homepage sections

### Pages

- [ ] `src/app/page.tsx` (Homepage)
- [ ] Product listing pages
- [ ] Auction listing pages
- [ ] Shop listing pages

## Testing Checklist

- [ ] Generate demo data with 2 shops
- [ ] Verify 10 auctions created (5 per shop)
- [ ] Verify auction end dates are in future
- [ ] Verify featured categories display on homepage
- [ ] Verify featured shops display on homepage
- [ ] Verify shop cards show product/auction counts
- [ ] Verify bid cleanup works
- [ ] Test flag consolidation (featured instead of homepage)
- [ ] Test navigation updates
- [ ] Test filter improvements
- [ ] Test image/video slideshow
- [ ] Test category level ordering
- [ ] Test variant display improvements

## Migration Notes

### For Existing Data

If you have existing data in production with `homepage` or `featured` flags:

1. **Create migration script** (optional):

```typescript
// scripts/migrate-featured-flags.ts
const db = getFirestoreAdmin();

// Migrate categories
const categories = await db
  .collection("categories")
  .where("metadata.showOnHomepage", "==", true)
  .get();

for (const doc of categories.docs) {
  await doc.ref.update({
    "metadata.featured": true,
    "metadata.showOnHomepage": admin.firestore.FieldValue.delete(),
  });
}

// Migrate products
const products = await db
  .collection("products")
  .where("featured", "==", true)
  .get();

for (const doc of products.docs) {
  await doc.ref.update({
    featured: true,
    featured: admin.firestore.FieldValue.delete(),
  });
}
```

2. **Or keep both flags** temporarily for backwards compatibility

## Status

**Current Phase**: Phase 1 - Demo Data Updates  
**Progress**: 40% Complete  
**Last Updated**: November 17, 2025  
**Next Steps**:

1. Update demo data generator (in progress)
2. Test demo data generation
3. Begin flag consolidation

---

**Note**: This is a comprehensive refactoring that touches many files. Test thoroughly after each phase before proceeding to the next.
