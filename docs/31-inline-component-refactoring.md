# Doc 31: Inline Component Refactoring

> **Status**: ✅ COMPLETE  
> **Priority**: High  
> **Estimated Code Reduction**: ~1,620 lines
> **Last Updated**: December 2025

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

### 3. Seller Form Components Migrated ✅

- **Files**: `CategorySelectorWithCreate.tsx`, `ShopSelector.tsx`, `ShopInlineForm.tsx`
- **Before**: Raw `<label>` + `<input>` patterns
- **After**: Uses `FormInput`, `FormTextarea`, `FormSelect` components
- **Benefit**: Consistent dark mode, styling, and accessibility

### 4. Seller Products Edit Page ✅

- **File**: `src/app/seller/products/[slug]/edit/page.tsx`
- **Before**: 10+ raw `<label>` + `<input>` patterns
- **After**: Uses `FormInput`, `FormTextarea`, `FormSelect` components

### 5. Seller Orders Detail Page ✅

- **File**: `src/app/seller/orders/[id]/page.tsx`
- **Before**: 3 raw labels in shipping form
- **After**: Uses `FormInput`, `FormSelect` components

### 6. Admin Shops Edit Page ✅

- **File**: `src/app/admin/shops/[id]/edit/page.tsx`
- **Before**: 20+ raw `<label>` + `<input>` patterns across all form sections
- **After**: Uses `FormInput`, `FormTextarea` components with dark mode

### 7. Admin Support Tickets Page ✅

- **File**: `src/app/admin/support-tickets/[id]/page.tsx`
- **Before**: 4 raw labels (assign, notes, escalate reason, escalate notes)
- **After**: Uses `FormInput`, `FormTextarea` components with dark mode

### 8. Media Metadata Form ✅

- **File**: `src/components/media/MediaMetadataForm.tsx`
- **Before**: 5 raw `<label>` + `<input>/<textarea>` patterns
- **After**: Uses `FormInput`, `FormTextarea` components with helpText

### 9. Inline Category Selector ✅

- **File**: `src/components/seller/InlineCategorySelectorWithCreate.tsx`
- **Before**: 3 raw labels in create dialog
- **After**: Uses `FormInput`, `FormTextarea` with showCharCount

### 10. Admin Products Edit Page ✅

- **File**: `src/app/admin/products/[id]/edit/page.tsx`
- **Before**: 2 remaining raw labels (Tags, Return Window)
- **After**: Uses `FormInput` component, added dark mode to tags input

### 11. Auctions Detail Page - Bid Form ✅

- **File**: `src/app/auctions/[slug]/page.tsx`
- **Before**: Raw label + input for bid amount
- **After**: Uses `FormInput` with error handling

### 12. Seller Shop Create Wizard ✅

- **File**: `src/app/seller/my-shops/create/page.tsx`
- **Before**: 15+ raw `<label>` + `<input>/<textarea>` patterns across all steps
- **After**: Uses `FormInput`, `FormTextarea` components with dark mode and helpText

### 13. User RipLimit Page ✅

- **File**: `src/app/user/riplimit/page.tsx`
- **Before**: 4 raw labels (custom amount, refund amount, refund reason, quick select)
- **After**: Uses `FormInput`, `FormTextarea` components with dark mode

### 14. Seller Analytics Page ✅

- **File**: `src/app/seller/analytics/page.tsx`
- **Before**: 2 raw labels (start date, end date)
- **After**: Added dark mode to DateTimePicker labels

### 15. AuctionForm ✅

- **File**: `src/components/seller/AuctionForm.tsx`
- **Before**: 4 raw labels (slug, description, start time, end time)
- **After**: Added dark mode styling

### 16. ShopForm ✅

- **File**: `src/components/seller/ShopForm.tsx`
- **Before**: 2 raw labels (slug, description)
- **After**: Added dark mode styling

### 17. ReviewForm ✅

- **File**: `src/components/product/ReviewForm.tsx`
- **Before**: 4 raw labels (rating, title, comment, media)
- **After**: Added dark mode styling

### 18. CartSummary, ProductInfo, AutoBidSetup ✅

- **Files**: `CartSummary.tsx`, `ProductInfo.tsx`, `AutoBidSetup.tsx`
- **Before**: 1 raw label each (coupon, quantity, max bid)
- **After**: Added dark mode styling

### 19. CategoryForm ✅

- **File**: `src/components/admin/CategoryForm.tsx`
- **Before**: 3 raw labels (slug, description, parent)
- **After**: Added dark mode styling

### 20. Admin Coupons Pages ✅

- **Files**: `admin/coupons/create/page.tsx`, `admin/coupons/[id]/edit/page.tsx`
- **Before**: 17 raw labels across both files
- **After**: Added dark mode styling

### 21. Admin Blog Pages ✅

- **Files**: `admin/blog/create/page.tsx`, `admin/blog/[id]/edit/page.tsx`
- **Before**: 12 raw labels across both files
- **After**: Added dark mode styling

### 22. Admin Homepage Page ✅

- **File**: `src/app/admin/homepage/page.tsx`
- **Before**: 5 raw labels (banner content, colors, slider)
- **After**: Added dark mode styling

### 23. Admin Categories Create Page ✅

- **File**: `src/app/admin/categories/create/page.tsx`
- **Before**: 1 raw label (slug)
- **After**: Added dark mode styling

### 24. Admin Hero Slides Edit Page ✅

- **File**: `src/app/admin/hero-slides/[id]/edit/page.tsx`
- **Before**: 3 raw labels (subtitle, description, image)
- **After**: Added dark mode styling

### 25. Admin Products Edit Page - Media Gallery ✅

- **File**: `src/app/admin/products/[id]/edit/page.tsx`
- **Before**: 1 remaining raw label (product images)
- **After**: Added dark mode styling

### 26. Seller Wizard Forms ✅

- **Files**: `product-wizard/RequiredInfoStep.tsx`, `product-wizard/OptionalDetailsStep.tsx`, `auction-wizard/RequiredInfoStep.tsx`, `auction-wizard/OptionalDetailsStep.tsx`
- **Before**: 30+ raw `<label>` + `<input>/<select>/<textarea>` patterns
- **After**: Uses `FormInput`, `FormTextarea`, `FormSelect` components with dark mode

### 27. ProductInlineForm ✅

- **File**: `src/components/seller/ProductInlineForm.tsx`
- **Before**: 6 raw labels (name, price, stock, category, description)
- **After**: Uses `FormInput`, `FormTextarea` components

### 28. CouponInlineForm ✅

- **File**: `src/components/seller/CouponInlineForm.tsx`
- **Before**: 6 raw labels (code, name, type, discount, dates)
- **After**: Uses `FormInput`, `FormSelect` components

### 29. CouponForm ✅

- **File**: `src/components/seller/CouponForm.tsx`
- **Before**: 15 raw labels across all sections
- **After**: Uses `FormLabel` component with dark mode

### 30. Reset Password Page ✅

- **File**: `src/app/reset-password/page.tsx`
- **Before**: 2 raw labels (password, confirm password)
- **After**: Uses `FormLabel` component

### 31. Admin Shipping Settings ✅

- **File**: `src/app/admin/settings/shipping/page.tsx`
- **Before**: 5 raw labels (threshold, charges, delivery estimates)
- **After**: Uses `FormLabel` component

### 32. Admin Notifications Settings ✅

- **File**: `src/app/admin/settings/notifications/page.tsx`
- **Before**: 4 raw labels (digest frequency, time, quiet hours)
- **After**: Uses `FormInput`, `FormSelect` components

---

## Pending Refactorings

### HIGH PRIORITY

#### 1. Seller Auctions Page - Inline Cards

- **File**: `src/app/seller/auctions/page.tsx`
- **Lines**: 599-633 (~35 lines)
- **Issue**: Grid view renders auction cards inline
- **Should Use**: `AuctionCard` with `variant="seller"`

#### 2. Won Auctions Page - Inline Cards

- **File**: `src/app/user/won-auctions/page.tsx`
- **Lines**: 159-289 (~130 lines)
- **Issue**: Renders auction details inline with images, shop info, stats
- **Should Use**: `AuctionCard` component

### MEDIUM PRIORITY

#### 3. Shops Listing Page - Inline Shop Cards

- **File**: `src/app/shops/page.tsx`
- **Lines**: 148-355 (~197 lines grid + table views)
- **Issue**: Manually renders shop cards with logo, banner, rating, stats
- **Should Use**: `ShopCard` component (needs to verify/create if missing)

#### 4. Admin Blog Page - Inline Post Cards

- **File**: `src/app/admin/blog/page.tsx`
- **Lines**: 340-530 (~122 lines)
- **Issue**: Renders blog post cards inline with image, status, stats
- **Should Use**: `BlogCard` component

#### 5. Admin Reviews Page - Inline Review Rows

- **File**: `src/app/admin/reviews/page.tsx`
- **Lines**: 257-355 (~98 lines)
- **Issue**: Inline table rows with stars, comment, status
- **Should Use**: `ReviewCard` or dedicated `ReviewRow` component

### COMPLETED ✅

#### User Reviews Page - Dark Mode Added

- **File**: `src/app/user/reviews/page.tsx`
- **Lines**: 66-234 (~168 lines)
- **Changes**: Added dark mode classes throughout
- **Reason kept inline**: This ReviewCard serves a different purpose than the shared one:
  - Shows edit/delete action buttons
  - Displays status badges (approved/pending/rejected)
  - Shows seller response section
  - The shared `ReviewCard` is for customer-facing display only

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
- [x] Migrate seller form components (CategorySelectorWithCreate, ShopSelector, ShopInlineForm)
- [x] Migrate seller/products/[slug]/edit page to FormInput/FormSelect
- [x] Migrate seller/orders/[id] shipping form to FormInput/FormSelect
- [x] Add dark mode to user/reviews page (inline ReviewCard kept - different purpose)
- [x] Migrate seller wizard forms (RequiredInfoStep, OptionalDetailsStep)
- [x] Migrate ProductInlineForm to FormInput/FormTextarea
- [x] Migrate CouponInlineForm to FormInput/FormSelect
- [x] Migrate CouponForm to FormLabel
- [x] Migrate reset-password page to FormLabel
- [x] Migrate admin/settings/shipping to FormLabel
- [x] Migrate admin/settings/notifications to FormInput/FormSelect
- [x] Continue form field migrations (Doc 27) - ALL COMPLETE
- [ ] Refactor /seller/auctions to use AuctionCard
- [ ] Refactor /user/won-auctions to use AuctionCard
- [ ] Refactor /shops page to use ShopCard
- [ ] Refactor /admin/blog to use BlogCard

---

## Related Docs

- **Doc 27**: HTML Tag Wrappers (FormField, FormInput, OptimizedImage)
- **Doc 30**: Component Library Consolidation
- **Doc 04**: Component Consolidation
