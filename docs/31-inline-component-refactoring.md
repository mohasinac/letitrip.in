# Doc 31: Inline Component Refactoring

> **Status**: IN PROGRESS  
> **Priority**: High  
> **Estimated Code Reduction**: ~1,620 lines

## Problem

Many pages have inline implementations of cards/components that duplicate existing reusable components. This leads to:

- Inconsistent UI/UX across pages
- Bug fixes needed in multiple places (e.g., auction Live/Ended badge issue)
- Harder maintenance
- Missing dark mode support in inline implementations
- Larger bundle sizes

## Completed Refactorings ✅

### 1. Auction Cards on /auctions page

- **File**: `src/app/auctions/page.tsx`
- **Before**: ~200 lines of inline auction card rendering (grid + list views)
- **After**: Uses `AuctionCard` component
- **Lines Saved**: ~180 lines
- **Commit**: `refactor: consolidate auction rendering to use AuctionCard component`

### 2. Auction Cards on /shops/[slug] page

- **File**: `src/app/shops/[slug]/page.tsx`
- **Before**: ~150 lines of inline auction card rendering
- **After**: Uses `AuctionCard` component
- **Lines Saved**: ~120 lines

---

## Pending Refactorings

### HIGH PRIORITY

#### 1. User Reviews Page - Inline ReviewCard

- **File**: `src/app/user/reviews/page.tsx`
- **Lines**: 66-234 (~168 lines)
- **Issue**: Defines its own inline `ReviewCard` function instead of using component
- **Should Use**: `src/components/cards/ReviewCard.tsx`
- **Impact**: Missing dark mode, inconsistent styling

#### 2. Seller Auctions Page - Inline Cards

- **File**: `src/app/seller/auctions/page.tsx`
- **Lines**: 599-633 (~35 lines)
- **Issue**: Grid view renders auction cards inline
- **Should Use**: `AuctionCard` with `variant="seller"`

#### 3. Won Auctions Page - Inline Cards

- **File**: `src/app/user/won-auctions/page.tsx`
- **Lines**: 159-289 (~130 lines)
- **Issue**: Renders auction details inline with images, shop info, stats
- **Should Use**: `AuctionCard` component

### MEDIUM PRIORITY

#### 4. Shops Listing Page - Inline Shop Cards

- **File**: `src/app/shops/page.tsx`
- **Lines**: 148-355 (~197 lines grid + table views)
- **Issue**: Manually renders shop cards with logo, banner, rating, stats
- **Should Use**: `ShopCard` component (needs to verify/create if missing)

#### 5. Admin Blog Page - Inline Post Cards

- **File**: `src/app/admin/blog/page.tsx`
- **Lines**: 340-530 (~122 lines)
- **Issue**: Renders blog post cards inline with image, status, stats
- **Should Use**: `BlogCard` component

#### 6. Admin Reviews Page - Inline Review Rows

- **File**: `src/app/admin/reviews/page.tsx`
- **Lines**: 257-355 (~98 lines)
- **Issue**: Inline table rows with stars, comment, status
- **Should Use**: `ReviewCard` or dedicated `ReviewRow` component

### LOWER PRIORITY (Form Fields)

These pages use raw `<label>` + `<input>` instead of `FormField`/`FormInput`:

| File                                          | Est. Lines |
| --------------------------------------------- | ---------- |
| `src/app/admin/blog/[id]/edit/page.tsx`       | ~80 lines  |
| `src/app/admin/categories/create/page.tsx`    | ~60 lines  |
| `src/app/admin/hero-slides/[id]/page.tsx`     | ~50 lines  |
| `src/app/admin/hero-slides/create/page.tsx`   | ~45 lines  |
| `src/app/admin/homepage/page.tsx`             | ~40 lines  |
| `src/app/admin/products/[slug]/edit/page.tsx` | ~40 lines  |
| `src/app/admin/settings/page.tsx`             | ~35 lines  |
| `src/app/admin/shops/[id]/page.tsx`           | ~50 lines  |
| `src/app/seller/shop/create/page.tsx`         | ~40 lines  |
| `src/app/seller/shop/edit/page.tsx`           | ~35 lines  |
| `src/app/contact/page.tsx`                    | ~20 lines  |
| `src/app/login/page.tsx`                      | ~5 lines   |
| `src/app/register/page.tsx`                   | ~10 lines  |
| `src/app/forgot-password/page.tsx`            | ~5 lines   |
| `src/app/auctions/[slug]/page.tsx`            | ~10 lines  |
| `src/app/seller/auctions/create/page.tsx`     | ~30 lines  |
| `src/app/seller/products/create/page.tsx`     | ~40 lines  |
| `src/app/user/settings/page.tsx`              | ~80 lines  |
| Filter components (various)                   | ~50 lines  |

**Total Form Fields**: ~870 lines potential reduction

---

## Component Availability Check

| Component        | Location                                   | Status            |
| ---------------- | ------------------------------------------ | ----------------- |
| `AuctionCard`    | `src/components/cards/AuctionCard.tsx`     | ✅ Available      |
| `ProductCard`    | `src/components/cards/ProductCard.tsx`     | ✅ Available      |
| `ReviewCard`     | `src/components/cards/ReviewCard.tsx`      | ✅ Available      |
| `BlogCard`       | `src/components/cards/BlogCard.tsx`        | ⚠️ Need to verify |
| `ShopCard`       | `src/components/cards/ShopCard.tsx`        | ⚠️ Need to verify |
| `FormField`      | `src/components/forms/FormField.tsx`       | ✅ Available      |
| `FormInput`      | `src/components/forms/FormInput.tsx`       | ✅ Available      |
| `OptimizedImage` | `src/components/common/OptimizedImage.tsx` | ✅ Available      |

---

## Refactoring Guidelines

### When refactoring inline cards:

1. **Check component props** - Ensure the component supports all features needed
2. **Add variant prop if needed** - e.g., `variant="seller"` or `variant="admin"`
3. **Map data correctly** - Field names may differ between API response and component props
4. **Keep showShopInfo logic** - Some views need shop info, others don't
5. **Test dark mode** - Verify the component has proper dark mode classes

### Example Refactoring Pattern:

```tsx
// Before: Inline rendering
<Link href={`/auctions/${auction.slug}`}>
  <div className="...">
    <img src={auction.image} />
    <h3>{auction.name}</h3>
    <span>₹{auction.price}</span>
    {/* 50+ lines of markup */}
  </div>
</Link>

// After: Using component
<AuctionCard
  auction={{
    id: auction.id,
    name: auction.name,
    slug: auction.slug,
    images: auction.images,
    currentBid: auction.currentBid,
    // ... mapped props
  }}
  showShopInfo={true}
/>
```

---

## Progress Tracking

- [x] Audit codebase for inline implementations
- [x] Create this tracking document
- [x] Refactor /auctions page to use AuctionCard
- [x] Refactor /shops/[slug] page auction section
- [ ] Refactor /user/reviews to use ReviewCard
- [ ] Refactor /seller/auctions to use AuctionCard
- [ ] Refactor /user/won-auctions to use AuctionCard
- [ ] Refactor /shops page to use ShopCard
- [ ] Refactor /admin/blog to use BlogCard
- [ ] Continue form field migrations (Doc 27)

---

## Related Docs

- **Doc 27**: HTML Tag Wrappers (FormField, FormInput, OptimizedImage)
- **Doc 30**: Component Library Consolidation
- **Doc 04**: Component Consolidation
