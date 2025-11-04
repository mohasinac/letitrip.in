# API Service Migration Progress Tracker

Track the progress of migrating direct API calls to the service layer.

## 📊 Overall Progress

- **Total Files to Migrate:** ~40+
- **Files Migrated:** 0
- **Completion:** 0%

---

## 🎯 Phase 1: High Priority (Core Features)

### Products & Categories

- [ ] `src/app/products/page.tsx`
  - Replace products list API call
  - Status: ⏳ Pending
- [ ] `src/app/products/[slug]/page.tsx`

  - Replace product detail API call
  - Replace related products API call
  - Status: ⏳ Pending

- [ ] `src/app/categories/[slug]/page.tsx`
  - Replace category detail API call
  - Replace products by category API call
  - Status: ⏳ Pending

### Search

- [ ] `src/app/search/page.tsx`
  - Replace search API call
  - Status: ⏳ Pending

### Checkout & Orders

- [ ] `src/app/checkout/page.tsx`

  - Replace coupon validation API call
  - Replace Razorpay order creation
  - Replace payment verification
  - Replace order creation API call
  - Status: ⏳ Pending

- [ ] `src/app/orders/[id]/page.tsx`

  - Replace order detail API call
  - Replace invoice download
  - Status: ⏳ Pending

- [ ] `src/app/profile/track-order/page.tsx`
  - Replace order tracking API call
  - Status: ⏳ Pending

**Phase 1 Progress:** 0/7 files (0%)

---

## 🎯 Phase 2: User Features

### Authentication & Profile

- [ ] `src/hooks/auth/useEnhancedAuth.ts`
  - Replace send OTP API call
  - Replace verify OTP API call
  - Replace current user API call
  - Replace register API call
  - Status: ⏳ Pending

### Addresses

- [ ] `src/hooks/useAddresses.ts`
  - Replace get addresses API call
  - Replace create address API call
  - Replace update address API call
  - Replace delete address API call
  - Status: ⏳ Pending

### Settings & Preferences

- [ ] `src/contexts/CurrencyContext.tsx`

  - Replace preferences update API call
  - Status: ⏳ Pending

- [ ] `src/contexts/ModernThemeContext.tsx`

  - Replace theme settings API calls
  - Status: ⏳ Pending

- [ ] `src/lib/utils/cookies.ts`

  - Replace consent API calls
  - Status: ⏳ Pending

- [ ] `src/lib/storage/sessionStorage.ts`
  - Replace session API calls
  - Status: ⏳ Pending

**Phase 2 Progress:** 0/6 files (0%)

---

## 🎯 Phase 3: Seller Features

### Seller Products

- [ ] `src/components/features/products/ProductsList.tsx`

  - Replace products list API call
  - Replace product stats API call
  - Replace delete product API call
  - Status: ⏳ Pending

- [ ] `src/app/seller/products/[id]/edit/page.tsx`
  - Replace product detail API call
  - Replace categories API call
  - Status: ⏳ Pending

### Seller Orders

- [ ] `src/app/seller/orders/` (all pages)
  - Replace orders list API call
  - Replace order detail API call
  - Replace order actions (approve, reject, cancel)
  - Status: ⏳ Pending

### Seller Coupons

- [ ] `src/app/seller/coupons/` (all pages)
  - Replace coupons list API call
  - Replace create coupon API call
  - Replace toggle coupon API call
  - Status: ⏳ Pending

### Seller Analytics

- [ ] `src/app/seller/analytics/` (all pages)
  - Replace analytics API call
  - Status: ⏳ Pending

**Phase 3 Progress:** 0/10+ files (0%)

---

## 🎯 Phase 4: Admin Features

### Admin Products

- [ ] `src/app/admin/products/` (all pages)
  - Replace products list API call
  - Replace product stats API call
  - Status: ⏳ Pending

### Admin Orders

- [ ] `src/app/admin/orders/` (all pages)
  - Replace orders list API call
  - Replace order stats API call
  - Status: ⏳ Pending

### Admin Users

- [ ] `src/app/admin/users/` (all pages)
  - Replace users list API call
  - Replace search users API call
  - Replace update role API call
  - Replace ban/unban API call
  - Status: ⏳ Pending

### Admin Settings

- [ ] `src/components/home/InteractiveHeroBanner.tsx`

  - Replace hero slides API call
  - Status: ⏳ Pending

- [ ] `src/components/home/InteractiveHeroBanner.tsx.mui-backup`

  - Replace hero slides API call
  - Status: ⏳ Pending

- [ ] `src/components/home/InteractiveHeroBanner.tsx.old`

  - Replace hero slides API call
  - Status: ⏳ Pending

- [ ] `src/components/home/InteractiveHeroBanner.new.tsx`
  - Replace hero slides API call
  - Status: ⏳ Pending

### Admin Bulk Operations

- [ ] `src/components/features/bulk/BulkOperationsManagement.tsx`
  - Replace bulk operations API calls
  - Replace export API call
  - Status: ⏳ Pending

**Phase 4 Progress:** 0/10+ files (0%)

---

## 🎯 Phase 5: Game Features

### Beyblades

- [ ] `src/hooks/useBeyblades.ts`

  - Replace beyblades list API call
  - Status: ⏳ Pending

- [ ] `src/components/admin/BeybladeManagement.tsx`

  - Replace beyblades list API call
  - Status: ⏳ Pending

- [ ] `src/components/admin/MultiStepBeybladeEditor.tsx`

  - Replace upload API call
  - Status: ⏳ Pending

- [ ] `src/components/admin/BeybladeImageUploader.tsx`

  - Replace upload image API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/beyblades/page.tsx`

  - Replace delete beyblade API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/beyblades/create/page.tsx`

  - Replace create beyblade API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/beyblades/edit/[id]/page.tsx`

  - Replace get/update beyblade API calls
  - Status: ⏳ Pending

- [ ] `src/app/admin/beyblades/create/page.tsx`

  - Replace create beyblade API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/beyblades/edit/[id]/page.tsx`
  - Replace get/update beyblade API calls
  - Status: ⏳ Pending

### Arenas

- [ ] `src/hooks/useArenas.ts`

  - Replace arenas list API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/stadiums/page.tsx`

  - Replace arenas list API call
  - Replace delete arena API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/stadiums/create/page.tsx`

  - Replace create arena API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/stadiums/edit/[id]/page.tsx`

  - Replace get/update arena API calls
  - Status: ⏳ Pending

- [ ] `src/app/admin/arenas/create/page.tsx`

  - Replace create arena API call
  - Status: ⏳ Pending

- [ ] `src/app/admin/game/stats/page.tsx`
  - Replace beyblades/arenas API calls
  - Status: ⏳ Pending

### Game State

- [ ] `src/app/game/hooks/useGameState.ts`
  - Replace beyblades API calls
  - Replace arenas API call
  - Status: ⏳ Pending

**Phase 5 Progress:** 0/16 files (0%)

---

## 📊 Summary by Status

- ⏳ **Pending:** All files
- 🚧 **In Progress:** 0 files
- ✅ **Completed:** 0 files
- ❌ **Blocked:** 0 files

---

## 📝 Notes

### Migration Guidelines

1. **Test after each change** - Ensure functionality remains the same
2. **Update imports** - Add `import { api } from '@/lib/api';`
3. **Replace fetch calls** - Use appropriate service method
4. **Handle errors** - Maintain or improve error handling
5. **Update types** - Use types from services
6. **Remove unused code** - Clean up old implementations

### Common Issues to Watch For

- [ ] Authentication tokens/cookies being passed correctly
- [ ] Query parameters being properly encoded
- [ ] Response data structure differences
- [ ] Error handling consistency
- [ ] Loading states maintained

### Testing Checklist (Per File)

- [ ] Feature works as before
- [ ] Error handling works
- [ ] Loading states work
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Network requests successful

---

## 🎯 Next Actions

1. **Start with Phase 1** - Core features are highest priority
2. **Pick one file at a time** - Complete migration and testing before moving on
3. **Update this checklist** - Mark completed items with ✅
4. **Document issues** - Note any problems encountered
5. **Review and refactor** - Improve error handling and code quality

---

## 🔗 Related Documentation

- Quick Reference: `docs/API_SERVICES_QUICK_REFERENCE.md`
- Migration Guide: `docs/API_SERVICE_MIGRATION_GUIDE.md`
- Full Documentation: `docs/API_SERVICES_DOCUMENTATION.md`

---

**Started:** November 4, 2025  
**Last Updated:** November 4, 2025  
**Status:** 🚀 Ready to Begin
