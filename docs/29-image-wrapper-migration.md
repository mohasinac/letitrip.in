# HTML Tag Wrappers - Codebase-Wide Implementation

> **Status**: ✅ Phase 1 Complete
> **Priority**: 🔴 High (Highest Priority)
> **Last Updated**: January 2025

## Overview

Replace raw HTML tags (`<img>`, `<label>`, `<input>`, etc.) with standardized wrapper components throughout the entire codebase. This ensures consistent styling, dark mode support, accessibility, and easier maintenance.

**This is the highest priority item** - when a change is needed, updating one wrapper file fixes all usages instead of 100+ files.

## 🎉 Phase 1 Complete - All App Pages Migrated

All raw `<img>` tags in `/src/app/**/*.tsx` files have been migrated to `OptimizedImage`.
All raw `<img>` tags in critical components (`SearchBar`, `PaymentLogo`, `CategoryForm`) have been migrated.

---

## Key Wrappers

### Image Wrapper (NEW) 🔴

**Use `OptimizedImage` instead of `<img>` tags.**

| Raw HTML | Wrapper Component | File                                       |
| -------- | ----------------- | ------------------------------------------ |
| `<img>`  | `OptimizedImage`  | `src/components/common/OptimizedImage.tsx` |

**Features:**

- Uses Next.js `<Image>` for automatic optimization
- WebP/AVIF format conversion
- Lazy loading by default
- Blur placeholder
- Error handling with fallback
- Focus point support for smart cropping

**Before (Raw img):**

```tsx
<img
  src="/product.jpg"
  alt="Product"
  className="w-full h-48 object-cover rounded"
/>
```

**After (OptimizedImage):**

```tsx
<OptimizedImage
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  className="rounded"
  objectFit="cover"
/>
```

---

## Form Wrappers (From Doc 27)

| Raw HTML                  | Wrapper Component | File                                    | Status |
| ------------------------- | ----------------- | --------------------------------------- | ------ |
| `<label>`                 | `FormLabel`       | `src/components/forms/FormLabel.tsx`    | ✅     |
| `<input>`                 | `FormInput`       | `src/components/forms/FormInput.tsx`    | ✅     |
| `<textarea>`              | `FormTextarea`    | `src/components/forms/FormTextarea.tsx` | ✅     |
| `<select>`                | `FormSelect`      | `src/components/forms/FormSelect.tsx`   | ✅     |
| `<input type="checkbox">` | `FormCheckbox`    | `src/components/forms/FormCheckbox.tsx` | ✅     |
| `<input type="radio">`    | `FormRadio`       | `src/components/forms/FormRadio.tsx`    | ✅     |
| `<fieldset>`              | `FormFieldset`    | `src/components/forms/FormFieldset.tsx` | ✅     |
| Label + Input combo       | `FormField`       | `src/components/forms/FormField.tsx`    | ✅     |

## Typography Wrappers (From Doc 27)

| Raw HTML        | Wrapper Component | File                            | Status |
| --------------- | ----------------- | ------------------------------- | ------ |
| `<h1>` - `<h6>` | `Heading`         | `src/components/ui/Heading.tsx` | ✅     |
| `<p>`           | `Text`            | `src/components/ui/Text.tsx`    | ✅     |

---

## Files Using Raw `<img>` Tags (Need Migration)

### ✅ All App Pages - COMPLETE

All files in `src/app/**/*.tsx` have been migrated to `OptimizedImage`.

### ✅ Critical Components - COMPLETE

- `src/components/common/SearchBar.tsx` - ✅ Migrated
- `src/components/common/PaymentLogo.tsx` - ✅ Migrated
- `src/components/admin/CategoryForm.tsx` - ✅ Migrated

### Remaining Components (Lower Priority)

| File                                            | Raw `<img>` Count | Priority  | Notes |
| ----------------------------------------------- | ----------------- | --------- | ----- |
| `src/components/shop/ShopHeader.tsx`            | 2                 | 🟡 Medium | |
| `src/components/seller/ShopCard.tsx`            | 2                 | 🟡 Medium | |
| `src/components/seller/ProductTable.tsx`        | 1                 | 🟡 Medium | |
| `src/components/seller/ProductImageManager.tsx` | 1                 | 🟡 Medium | |
| `src/components/product/ReviewList.tsx`         | 1                 | 🟡 Medium | |
| `src/components/layout/ShopsNav.tsx`            | 1                 | 🟡 Medium | |
| `src/components/layout/MobileSidebar.tsx`       | 1                 | 🟡 Medium | |
| `src/components/common/InlineImageUpload.tsx`   | 1                 | 🟡 Medium | |
| `src/components/checkout/ShopOrderSummary.tsx`  | 1                 | 🟡 Medium | |
| `src/components/category/SimilarCategories.tsx` | 1                 | 🟡 Medium | |
| `src/components/media/CameraCapture.tsx`        | 1                 | 🟢 Low    | |
| `src/components/common/OptimizedImage.tsx`      | 1                 | N/A       | This IS the wrapper |

### Test Files (Acceptable - Mocks)

| File                                             | Notes                     |
| ------------------------------------------------ | ------------------------- |
| `src/components/ui/BaseCard.test.tsx`            | Mock uses raw img ✅ OK   |
| `src/components/product/ProductGallery.test.tsx` | Mock uses raw img ✅ OK   |
| `src/components/media/MediaGallery.test.tsx`     | Mock uses raw img ✅ OK   |
| `src/components/layout/HeroCarousel.test.tsx`    | Mock uses raw img ✅ OK   |
| `src/components/layout/Footer.test.tsx`          | Mock uses raw img ✅ OK   |
| `src/components/cards/ProductCard.test.tsx`      | Mock uses raw img ✅ OK   |
| `src/components/cards/ReviewCard.test.tsx`       | Mock uses raw img ✅ OK   |
| `src/app/user/*.test.tsx`                        | Mock uses raw img ✅ OK   |

---

## ESLint Rule (To Add)

Add a custom ESLint rule to warn when using raw HTML tags:

### `.eslintrc.js` or `eslint.config.mjs`

```javascript
// Add to rules
'no-restricted-syntax': [
  'warn',
  {
    selector: 'JSXOpeningElement[name.name="img"]',
    message: 'Use OptimizedImage from @/components/common/OptimizedImage instead of raw <img> tag.'
  },
  {
    selector: 'JSXOpeningElement[name.name="label"]:not([name.name=/^Form/])',
    message: 'Use FormLabel from @/components/forms/FormLabel instead of raw <label> tag.'
  },
  // Add more as needed
]
```

### Ignore Pattern (for legacy or edge cases)

```tsx
// eslint-disable-next-line no-restricted-syntax -- Canvas preview, not displayed to users
<img src={canvasDataUrl} alt="Preview" />
```

---

## Migration Strategy

### Phase 1: Image Wrapper Migration 🔴 HIGH PRIORITY

1. **Search for all `<img>` usages:**

   ```bash
   grep -r "<img" --include="*.tsx" src/
   ```

2. **Replace with OptimizedImage:**

   - Add `width` and `height` props (required for optimization)
   - Convert `className` object-fit to `objectFit` prop
   - Add `fill` for responsive containers

3. **Update test mocks to return OptimizedImage-compatible output**

### Phase 2: Form Wrapper Migration

Files identified in Doc 27 Phase 2 Migration list:

- `/seller/products/create/page.tsx` - 15+ labels/inputs ✅ (uses wizard components)
- `/seller/auctions/create/page.tsx` - 12+ labels/inputs ✅ (uses wizard components)
- `/admin/categories/create/page.tsx` - 8+ labels/inputs
- `/admin/blog/create/page.tsx` - 10+ labels/inputs
- `/login/page.tsx` - 3 fields
- `/register/page.tsx` - 5 fields
- `/contact/page.tsx` - 4 fields

### Phase 3: Typography Wrapper Migration

- Replace raw `<h1>` - `<h6>` with `Heading` component
- Replace raw `<p>` with `Text` component where appropriate

---

## Implementation Checklist

### Phase 1: Image Wrapper ✅ COMPLETE

- [x] `OptimizedImage` component created (`src/components/common/OptimizedImage.tsx`)
- [x] Uses Next.js Image with optimization
- [x] Has focus point support
- [x] Has error handling with fallback
- [x] All `/src/app/**/*.tsx` pages migrated to OptimizedImage
- [x] Critical components migrated (SearchBar, PaymentLogo, CategoryForm)

### Phase 1 Migration Summary (Completed)

**App Pages Migrated (40+ files):**
- User pages: reviews, orders, settings, won-auctions, bids, favorites
- Seller pages: products, reviews, auctions, my-shops, orders
- Admin pages: users, products, shops, categories, auctions, blog, hero-slides, featured-sections, static-assets, orders
- Public pages: products, categories, auctions, shops
- Auth pages: login, register, contact, checkout

**Components Migrated:**
- `SearchBar.tsx` - 3 img tags
- `PaymentLogo.tsx` - 1 img tag  
- `CategoryForm.tsx` - 1 img tag

### Phase 2: Remaining Components (Lower Priority)

- [ ] `src/components/shop/ShopHeader.tsx` - Replace 2 img tags
- [ ] `src/components/seller/ShopCard.tsx` - Replace 2 img tags
- [ ] `src/components/seller/ProductTable.tsx` - Replace 1 img tag
- [ ] `src/components/seller/ProductImageManager.tsx` - Replace 1 img tag
- [ ] `src/components/product/ReviewList.tsx` - Replace 1 img tag
- [ ] `src/components/layout/ShopsNav.tsx` - Replace 1 img tag
- [ ] `src/components/layout/MobileSidebar.tsx` - Replace 1 img tag
- [ ] `src/components/common/InlineImageUpload.tsx` - Replace 1 img tag
- [ ] `src/components/checkout/ShopOrderSummary.tsx` - Replace 1 img tag
- [ ] `src/components/category/SimilarCategories.tsx` - Replace 1 img tag
- [ ] `src/components/media/CameraCapture.tsx` - Replace 1 img tag (if applicable)

### Phase 3: Add ESLint Rule

- [ ] Add `no-restricted-syntax` rule for raw `<img>` tags
- [ ] Add `no-restricted-syntax` rule for raw `<label>` tags
- [ ] Add `no-restricted-syntax` rule for raw `<input>` tags
- [ ] Document ignore pattern for edge cases

### Phase 4: Test Mocks (Optional)

- Test mocks using raw `<img>` are acceptable and don't need migration

---

## Delete/Remove (No Legacy Support)

Per user guidance: **"I do not want legacy support so you can just remove that code or delete the older files"**

When migrating:

1. Replace the raw tag with the wrapper component
2. Do not maintain backward compatibility
3. Delete any helper functions that were working around raw tag limitations

---

## Benefits

| Benefit            | Before                   | After               |
| ------------------ | ------------------------ | ------------------- |
| Image optimization | Manual, inconsistent     | Automatic WebP/AVIF |
| Lazy loading       | Must add manually        | Built-in            |
| Error handling     | Must implement per usage | Built-in fallback   |
| Dark mode          | Must add `dark:` classes | Handled in wrapper  |
| Focus point        | Not supported            | Built-in            |
| Accessibility      | Manual, often missing    | Automatic           |
| Bundle size        | Full-size images         | Optimized sizes     |

---

## Related Documents

- **Doc 27**: HTML Tag Wrappers (Form components created)
- **Doc 28**: Component Splitting
- **AI Agent Guide**: Common problems and wrapper usage patterns
