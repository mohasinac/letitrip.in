# Architecture Violations - Direct API Calls

**Last Updated**: November 11, 2025  
**Pattern**: All API calls MUST go through service layer (`src/services/`)  
**Violations Found**: 38 total

---

## 🚨 Critical Violations

### Direct `fetch()` Calls

#### Pages (`src/app/`) - 11 violations

1. ✅ `sitemap.ts` (Lines 6, 23, 40, 57) - **EXCEPTION**: Server-side SEO generation
2. ✅ `seller/page.tsx` (Line 74) - Dashboard stats **DONE**
3. ✅ `seller/analytics/page.tsx` (Line 79) - Analytics data **DONE**
4. ✅ `admin/page.tsx` (Line 36) - Dashboard stats **DONE**
5. ✅ `admin/dashboard/page.tsx` (Line 65) - Dashboard stats **DONE**
6. ❌ `admin/categories/[slug]/edit/page.tsx` (Line 41) - Load category
7. ✅ `admin/users/page.tsx` (Lines 88, 179) - List & create users **DONE**

#### Components (`src/components/`) - 6 violations

8. ❌ `seller/CouponForm.tsx` (Line 100) - Create/update coupon
9. ❌ `seller/AuctionForm.tsx` (Line 69) - Create/update auction
10. ✅ `media/VideoRecorder.tsx` (Line 189) - **EXCEPTION**: Local blob conversion
11. ✅ `media/CameraCapture.tsx` (Line 99) - **EXCEPTION**: Local blob conversion
12. ❌ `admin/CategoryForm.tsx` (Lines 79, 131) - Load & save categories

#### Hooks (`src/hooks/`) - 1 violation

13. ❌ `useSlugValidation.ts` (Line 108) - Slug uniqueness check

### Direct `apiService` Imports

#### Pages (`src/app/`) - 16 violations

14. ❌ `user/favorites/page.tsx`
15. ❌ `user/tickets/[id]/page.tsx`
16. ❌ `user/tickets/page.tsx`
17. ❌ `user/addresses/page.tsx`
18. ❌ `support/ticket/page.tsx`
19. ❌ `seller/products/page.tsx`
20. ❌ `seller/auctions/page.tsx`
21. ❌ `search/page.tsx`
22. ❌ `contact/page.tsx`
23. ❌ `admin/payouts/page.tsx`
24. ❌ `admin/users/page.tsx`
25. ❌ `admin/tickets/page.tsx`
26. ❌ `admin/tickets/[id]/page.tsx`
27. ❌ `admin/hero-slides/create/page.tsx`
28. ❌ `admin/hero-slides/page.tsx`
29. ❌ `admin/hero-slides/[id]/edit/page.tsx`

#### Components (`src/components/`) - 5 violations

30. ❌ `product/ReviewList.tsx`
31. ❌ `product/ReviewForm.tsx`
32. ✅ `examples/HeroSlideFormWithCleanup.tsx` - **EXCEPTION**: Example code
33. ❌ `common/SearchBar.tsx`
34. ✅ `examples/FormWithNavigationGuard.tsx` - **EXCEPTION**: Example code

---

## 📋 Refactoring Plan

### Priority 1: Create Missing Services (HIGH)

These services don't exist yet:

- [x] ✅ `src/services/analytics.service.ts` - Dashboard/analytics stats (ALREADY EXISTS)
- [x] ✅ `src/services/hero-slides.service.ts` - Homepage hero slides (CREATED)
- [x] ✅ `src/services/payouts.service.ts` - Seller payouts (CREATED)
- [x] ✅ `src/services/favorites.service.ts` - User favorites/wishlist (ALREADY EXISTS)

### Priority 2: Extend Existing Services (MEDIUM)

These need additional methods:

- [ ] `categoryService` - Add `getBySlug()`, `validateSlug()`
- [ ] `userService` - Add bulk operations, filters
- [ ] `supportService` - Already complete? ✅
- [ ] `auctionService` - Verify all CRUD methods
- [ ] `couponService` - Verify all CRUD methods
- [ ] `reviewService` - Add `getByProduct()`, pagination

### Priority 3: Refactor Pages (HIGH - User Facing)

#### Admin Pages (10 files)

1. [x] ✅ `admin/page.tsx` → Use `analyticsService.getOverview()` (DONE)
2. [x] ✅ `admin/dashboard/page.tsx` → Use `analyticsService.getOverview()` (DONE)
3. [x] ✅ `admin/users/page.tsx` → Use `usersService.list()`, `.update()` (DONE)
4. `admin/tickets/page.tsx` → Use `supportService` (may already exist)
5. `admin/tickets/[id]/page.tsx` → Use `supportService`
6. [x] ✅ `admin/hero-slides/page.tsx` → Use `heroSlidesService` (DONE)
7. [x] ✅ `admin/hero-slides/create/page.tsx` → Use `heroSlidesService` (DONE)
8. [x] ✅ `admin/hero-slides/[id]/edit/page.tsx` → Already compliant (no direct API calls)
9. `admin/categories/[slug]/edit/page.tsx` → Use `categoryService.getBySlug()`
10. [x] ✅ `admin/payouts/page.tsx` → Use `payoutsService` (DONE)

#### Seller Pages (4 files)

11. [x] ✅ `seller/page.tsx` → Use `analyticsService.getOverview()` (DONE)
12. [x] ✅ `seller/analytics/page.tsx` → Use `analyticsService.getOverview()` (DONE)
13. `seller/products/page.tsx` → Use `productService` (check if already fixed)
14. `seller/auctions/page.tsx` → Use `auctionService` (check if already fixed)

#### User Pages (4 files)

15. [x] ✅ `user/favorites/page.tsx` → Use `favoritesService` (DONE)
16. `user/tickets/page.tsx` → Use `supportService`
17. `user/tickets/[id]/page.tsx` → Use `supportService`
18. `user/addresses/page.tsx` → Use `addressService` (may already exist)

#### Public Pages (2 files)

19. [x] ✅ `search/page.tsx` → Use `productsService.list()` (DONE)
20. [x] ✅ `contact/page.tsx` → Use `supportService.createTicket()` (DONE)

### Priority 4: Refactor Components (MEDIUM)

#### Forms (3 files)

21. `seller/CouponForm.tsx` → Use `couponService`
22. `seller/AuctionForm.tsx` → Use `auctionService`
23. `admin/CategoryForm.tsx` → Use `categoryService`

#### Product Features (2 files)

24. [x] ✅ `product/ReviewList.tsx` → Use `reviewService.list()` (DONE)
25. [x] ✅ `product/ReviewForm.tsx` → Use `reviewService.create()` (DONE)

#### Navigation (1 file)

26. `common/SearchBar.tsx` → Use `productService.search()`

### Priority 5: Refactor Hooks (MEDIUM)

27. `useSlugValidation.ts` → Use appropriate service with `.validateSlug()` method

---

## ✅ Exceptions (Valid Use Cases)

These are acceptable direct API calls:

1. **`sitemap.ts`** - Server-side SEO generation (runs at build time)
2. **`media/VideoRecorder.tsx`** - Local blob to File conversion (not API call)
3. **`media/CameraCapture.tsx`** - Local blob to File conversion (not API call)
4. **`examples/*`** - Example/demo code (not production)

---

## 🎯 Success Criteria

- [ ] All pages use service layer (0% currently)
- [ ] All components use service layer (0% currently)
- [ ] All hooks use service layer (0% currently)
- [ ] No `fetch(` in src/app/ (except sitemap.ts)
- [ ] No `fetch(` in src/components/ (except media converters)
- [ ] No `fetch(` in src/hooks/
- [ ] No `apiService` imports in pages/components/hooks
- [ ] ESLint rule prevents future violations
- [ ] All services have TypeScript types
- [ ] All services have JSDoc comments

---

## 📊 Progress Tracking

**Total Violations**: 38  
**Critical**: 32  
**Exceptions**: 6  
**Services Created**: 2/2 ✅ (hero-slides, payouts)
**Fixed**: 14 ✅ (44% complete)

- Admin dashboard pages (3 pages) ⭐ HIGH PRIORITY
- Admin hero-slides (3 pages)
- Admin payouts (1 page)
- Seller dashboard pages (2 pages) ⭐ HIGH PRIORITY
- Product reviews (2 components)
- User favorites (1 page)
- Public search & contact (2 pages)
  **Remaining**: 18

**Estimated Time**: 2-4 hours remaining (44% complete)

---

## 🔧 Next Actions

1. ✅ ~~Create `analyticsService`~~ (ALREADY EXISTS)
2. ✅ ~~Create `heroSlidesService`~~ (CREATED)
3. ✅ ~~Create `payoutsService`~~ (CREATED)
4. ⏳ Start refactoring pages (Priority 3 - Quick Wins First)
   - Admin hero slides pages (3 files) - Use new `heroSlidesService`
   - Admin payouts page (1 file) - Use new `payoutsService`
   - Admin dashboard pages (2 files) - Use existing `analyticsService`
5. ⏳ Set up ESLint rule to prevent future violations
6. ⏳ Document all service methods with JSDoc
