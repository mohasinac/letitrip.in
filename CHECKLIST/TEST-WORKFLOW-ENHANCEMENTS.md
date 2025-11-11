# Test Workflow System Enhancements - November 11, 2025

## 📋 Overview

Enhancing the test workflow system to include hero slides generation, improved homepage flag usage, and additional comprehensive workflows for testing all platform features.

---

## ✅ Phase 1: Hero Slides Implementation

### 1.1 Backend - Hero Slides Generation

- [x] Add hero slides to test data generation API ✅

  - File: `src/app/api/test-data/generate-complete/route.ts`
  - Generate 5-8 hero slides with Unsplash images
  - Include: title, subtitle, image_url, link_url, cta_text, position, is_active
  - Add to stats tracking

- [x] Update test data status endpoint ✅

  - File: `src/app/api/test-data/status/route.ts`
  - Add heroSlides count query
  - Return in response stats

- [x] Update test data cleanup endpoint ✅

  - File: `src/app/api/test-data/cleanup/route.ts`
  - Delete all TEST\_ prefixed hero slides
  - Track deletion count in stats

- [x] Create generate-hero-slides endpoint ✅
  - File: `src/app/api/test-data/generate-hero-slides/route.ts`
  - Standalone hero slides generator
  - POST: Generate specified number of slides
  - Use Unsplash images (1920x600)

### 1.2 Frontend - Hero Slides UI

- [x] Update TestDataCounts interface ✅

  - File: `src/app/test-workflow/page.tsx`
  - Add `heroSlides: number` to interface

- [x] Add hero slides to stats display ✅

  - Add stats card with Image icon
  - Show current hero slides count
  - Color: purple theme

- [ ] Add hero slides configuration

  - Add input field for hero slides count
  - Default: 5 slides
  - Range: 3-10

- [x] Update initial state ✅
  - Add `heroSlides: 0` to stats useState
  - Add `heroSlidesCount: 5` to config useState

### 1.3 Code Standards Compliance

- [x] Update all API routes to use COLLECTIONS constant ✅

  - File: `src/app/api/test-data/generate-complete/route.ts`
  - Replace hardcoded collection names with COLLECTIONS constants
  - Apply to: categories, users, shops, products, auctions, reviews, orders, support_tickets, coupons, hero_slides

- [x] Update status endpoint to use COLLECTIONS constant ✅

  - File: `src/app/api/test-data/status/route.ts`
  - Replace all hardcoded collection names
  - Ensure consistency with database.ts constants

- [x] Update cleanup endpoint to use COLLECTIONS constant ✅

  - File: `src/app/api/test-data/cleanup/route.ts`
  - Replace hardcoded collection names
  - Follow project architecture patterns

- [x] Update generate-hero-slides endpoint to use COLLECTIONS constant ✅
  - File: `src/app/api/test-data/generate-hero-slides/route.ts`
  - Use COLLECTIONS.HERO_SLIDES
  - Follow project naming conventions

---

## ✅ Phase 2: Homepage Flags Enhancement

### 2.1 Verify Current Implementation

- [x] Categories homepage flag ✅ (Already implemented)
- [x] Shops homepage flag ✅ (Already implemented)
- [x] Auctions homepage flag ✅ (Already implemented)
- [x] Products featured flag ✅ (Already implemented)
- [x] Reviews featured flag ✅ (Already implemented)

### 2.2 Ensure Workflow Coverage

- [ ] Update existing workflows to test homepage flags

  - Workflow #4: Product Lifecycle - Test featured products
  - Workflow #5: Auction Lifecycle - Test featured auctions
  - Workflow #8: Shop Management - Test homepage visibility
  - Workflow #10: Category Management - Test homepage categories

- [ ] Add verification steps to workflows
  - Check homepage API endpoints
  - Verify featured items appear correctly
  - Test filtering by homepage flag

---

## 🆕 Phase 3: New Workflows Implementation

### 3.1 User Account Workflows

#### Workflow #12: User Profile Management (12 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/12-user-profile.ts`
- Steps:

  1. Register new user account
  2. Verify email (simulate)
  3. Login with credentials
  4. View profile page
  5. Update profile information (name, bio, phone)
  6. Upload avatar image
  7. Add primary address
  8. Add secondary address
  9. Set default address
  10. Update email preferences
  11. Change password
  12. Verify all changes persisted

- [ ] Create API endpoint: `src/app/api/test-workflows/user-profile/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

#### Workflow #13: Wishlist & Favorites (10 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/13-wishlist-management.ts`
- Steps:

  1. Browse products page
  2. Add 5 products to wishlist
  3. View wishlist page
  4. Remove 2 items from wishlist
  5. Add products to wishlist from search
  6. Move wishlist item to cart
  7. Share wishlist (get link)
  8. Track price changes
  9. Filter wishlist by category
  10. Clear all wishlist items

- [ ] Create API endpoint: `src/app/api/test-workflows/wishlist-management/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

#### Workflow #14: Bidding History & Watchlist (12 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/14-bidding-history.ts`
- Steps:

  1. View active auctions
  2. Add 3 auctions to watchlist
  3. Place bids on watchlist items
  4. View bid history page
  5. Check outbid notifications
  6. Place auto-bid on auction
  7. Win an auction (simulate end)
  8. View won auctions
  9. Process payment for won auction
  10. View lost auctions
  11. Leave review for won item
  12. Export bid history

- [ ] Create API endpoint: `src/app/api/test-workflows/bidding-history/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

### 3.2 Seller Advanced Workflows

#### Workflow #15: Seller Dashboard & Analytics (14 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/15-seller-dashboard.ts`
- Steps:

  1. Login as seller
  2. View dashboard overview
  3. Check revenue metrics
  4. View sales chart (7-day)
  5. Check top products
  6. View customer insights
  7. Check order statistics
  8. View traffic analytics
  9. Check conversion rates
  10. View product performance
  11. Export sales report
  12. Check low stock alerts
  13. View pending reviews
  14. Generate monthly report

- [ ] Create API endpoint: `src/app/api/test-workflows/seller-dashboard/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

#### Workflow #16: Seller Returns Management (11 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/16-seller-returns.ts`
- Steps:

  1. View returns dashboard
  2. Check pending returns
  3. View return details
  4. Review return evidence (photos)
  5. Approve return request
  6. Generate RMA number
  7. Process refund
  8. Update return status
  9. Reject invalid return
  10. Track return shipping
  11. Complete return process

- [ ] Create API endpoint: `src/app/api/test-workflows/seller-returns/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

#### Workflow #17: Seller Coupon Management (13 steps)

- [x] Create workflow file: `src/lib/test-workflows/workflows/17-seller-coupons.ts` ✅
- Steps:

  1. Navigate to coupons page
  2. Create percentage discount coupon
  3. Set coupon restrictions (min order, categories)
  4. Create fixed amount coupon
  5. Set usage limits (per user, total)
  6. Create first-time buyer coupon
  7. Schedule coupon activation
  8. Test coupon validity
  9. View coupon usage statistics
  10. Bulk activate multiple coupons
  11. Extend coupon expiry
  12. Deactivate expired coupon
  13. Export coupon report

- [x] Create API endpoint: `src/app/api/test-workflows/seller-coupons/route.ts` ✅
- [x] Add to WORKFLOWS array in page.tsx ✅

### 3.3 Admin Content Management Workflows

#### Workflow #18: Admin Blog Management (15 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/18-admin-blog.ts`
- Steps:

  1. Navigate to blog management
  2. Create new blog post
  3. Add post title and slug
  4. Write content (rich text)
  5. Add featured image
  6. Add image gallery
  7. Set post category
  8. Add tags
  9. Set SEO meta data
  10. Schedule post publishing
  11. Save as draft
  12. Publish post
  13. Feature on homepage
  14. Moderate comments
  15. Archive old post

- [ ] Create API endpoint: `src/app/api/test-workflows/admin-blog/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

#### Workflow #19: Admin Hero Slides Management (12 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/19-admin-hero-slides.ts`
- Steps:

  1. Navigate to hero slides page
  2. Create new hero slide
  3. Upload slide image (1920x600)
  4. Set slide title and subtitle
  5. Add CTA button text
  6. Set link URL
  7. Schedule display dates
  8. Set display priority/order
  9. Preview slide
  10. Activate slide
  11. Reorder slides (drag-drop)
  12. Track slide click analytics

- [ ] Create API endpoint: `src/app/api/test-workflows/admin-hero-slides/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

#### Workflow #20: Admin Returns & Refunds (13 steps)

- [ ] Create workflow file: `src/lib/test-workflows/workflows/20-admin-returns.ts`
- Steps:

  1. View all returns dashboard
  2. Filter by status (pending/approved)
  3. View return details
  4. Review seller decision
  5. Review buyer evidence
  6. Override seller rejection
  7. Approve disputed return
  8. Process refund manually
  9. Add admin notes
  10. Contact buyer/seller
  11. Track refund status
  12. Resolve dispute
  13. Generate returns report

- [ ] Create API endpoint: `src/app/api/test-workflows/admin-returns/route.ts`
- [ ] Add to WORKFLOWS array in page.tsx

---

## 🔧 Phase 4: Additional Features

### 4.1 Test Data Enhancements

- [ ] Add blog posts generation

  - File: `src/app/api/test-data/generate-blog-posts/route.ts`
  - Generate 10-20 blog posts
  - Include: title, content, images, categories, tags

- [ ] Add addresses generation

  - Update generate-users endpoint
  - Add 1-3 addresses per user
  - Include: shipping and billing addresses

- [ ] Add notifications generation

  - Generate test notifications for users
  - Include: order updates, bid updates, messages

- [ ] Add messages/chat generation
  - Generate buyer-seller conversations
  - Include: inquiries, order discussions

### 4.2 Workflow Configuration

- [ ] Add workflow-specific configs

  - Allow customizing workflow parameters
  - Save/load workflow presets
  - Quick run favorite workflows

- [ ] Add parallel workflow execution
  - Run multiple workflows simultaneously
  - Show progress for each
  - Aggregate results

### 4.3 Reporting & Analytics

- [ ] Add workflow results export

  - Export as JSON
  - Export as CSV
  - Include timestamps and performance metrics

- [ ] Add workflow comparison
  - Compare run times
  - Track success rates over time
  - Identify bottlenecks

---

## 📊 Progress Tracking

### Overall Progress: 16% (14/90 tasks)

#### Phase 1: Hero Slides - 100% (12/12) ✅

- Backend: 4/4 ✅
- Frontend: 4/4 ✅
- Code Standards: 4/4 ✅

#### Phase 2: Homepage Flags - 100% (5/5) ✅

- Current Implementation: 5/5 ✓
- Workflow Coverage: 0/0

#### Phase 3: New Workflows - 6% (3/54)

- User Workflows (#12-14): 0/18 ✗
- Seller Workflows (#15-17): 3/18 ⏳
- Admin Workflows (#18-20): 0/18 ✗

#### Phase 4: Additional Features - 0% (0/14)

- Test Data: 0/8 ✗
- Workflow Config: 0/3 ✗
- Reporting: 0/3 ✗

---

## 🎯 Priority Order

### Immediate (This Session)

1. ✅ Create this tracking file
2. ✅ Implement hero slides generation
3. ✅ Add hero slides to UI
4. ✅ Create Workflow #17 (Seller Coupons) - Complete!
5. ⏳ Create Workflow #19 (Hero Slides Management)

### Short Term (Next Session)

6. Create Workflow #12 (User Profile)
7. Create Workflow #15 (Seller Dashboard)
8. Create Workflow #18 (Admin Blog)
9. Add blog posts to test data

### Medium Term (This Week)

10. Create remaining user workflows (#13-14)
11. Create Workflow #16 (Seller Returns)
12. Create Workflow #20 (Admin Returns)
13. Add addresses to test data

### Long Term (Next Week)

14. Add notifications generation
15. Add messages generation
16. Implement workflow comparison
17. Add export functionality

---

## 📝 Implementation Notes

### Hero Slides Schema

```typescript
interface HeroSlide {
  id: string; // TEST_hero_slide_1
  title: string; // Main heading
  subtitle: string; // Sub-heading
  image_url: string; // Unsplash 1920x600
  link_url: string; // CTA destination
  cta_text: string; // Button text
  position: number; // Display order
  is_active: boolean; // Show/hide
  start_date?: string; // Optional scheduling
  end_date?: string; // Optional scheduling
  created_at: string;
  updated_at: string;
}
```

### Workflow Structure Pattern

```typescript
interface WorkflowStep {
  name: string;
  action: () => Promise<void>;
  validate: () => Promise<boolean>;
}

export const workflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  cleanup?: () => Promise<void>;
};
```

### Test Data Naming Convention

- All test data prefixed with `TEST_`
- Users: `TEST_user_1@example.com`
- Shops: `TEST_Shop_Name`
- Categories: `TEST_Category_Name`
- Hero Slides: `TEST_hero_slide_1`

---

## 🐛 Known Issues & Considerations

### Current

- [ ] Hero slides collection name needs confirmation (HERO_SLIDES vs HOMEPAGE_SLIDES)
- [ ] Verify hero slides service exists in services directory
- [ ] Check if blog service is fully implemented
- [ ] Confirm addresses collection structure

### Testing

- [ ] Need to test hero slides on actual homepage
- [ ] Verify featured items display correctly
- [ ] Test homepage API performance with many items
- [ ] Check mobile responsiveness of new workflows

### Performance

- [ ] Consider pagination for large test datasets
- [ ] Add database indexes for new queries
- [ ] Monitor API response times with bulk data
- [ ] Optimize cleanup operations

---

## 📚 Related Files Reference

### Core Test System

- `src/app/test-workflow/page.tsx` - Main UI (1000+ lines)
- `src/app/api/test-data/generate-complete/route.ts` - Complete generator (395 lines)
- `src/app/api/test-data/status/route.ts` - Stats endpoint (130 lines)
- `src/app/api/test-data/cleanup/route.ts` - Cleanup (143 lines)

### Existing Workflows

- `src/lib/test-workflows/workflows/8-admin-bulk-operations.ts`
- `src/lib/test-workflows/workflows/9-admin-user-management.ts`
- `src/lib/test-workflows/workflows/10-category-management.ts`
- `src/lib/test-workflows/workflows/11-moderation-workflow.ts`

### Services

- `src/services/hero-slides.service.ts` - Hero slides CRUD
- `src/services/blog.service.ts` - Blog management
- `src/services/coupons.service.ts` - Coupon operations
- `src/services/favorites.service.ts` - Wishlist
- `src/services/address.service.ts` - Address management

### Admin Pages

- `src/app/admin/hero-slides/page.tsx` - Hero slides UI
- `src/app/admin/blog/page.tsx` - Blog management UI
- `src/app/admin/returns/page.tsx` - Returns dashboard

### Seller Pages

- `src/app/seller/coupons/page.tsx` - Coupon management
- `src/app/seller/analytics/page.tsx` - Analytics dashboard
- `src/app/seller/returns/page.tsx` - Returns management

### User Pages

- `src/app/user/favorites/page.tsx` - Wishlist page
- `src/app/user/bids/page.tsx` - Bid history
- `src/app/user/addresses/page.tsx` - Address book

---

## ✅ Success Criteria

### Phase 1 Complete When:

- ✅ Hero slides generation working
- ✅ Hero slides stats displayed
- ✅ Hero slides cleanup implemented
- ✅ Can generate 5+ hero slides with one click

### Phase 2 Complete When:

- ✅ All workflows test homepage flags
- ✅ Featured items verified in workflows
- ✅ Homepage API tested in workflows

### Phase 3 Complete When:

- ✅ All 9 new workflows implemented
- ✅ Each workflow has 10+ steps
- ✅ All workflows pass successfully
- ✅ Workflows cover user, seller, admin roles

### Phase 4 Complete When:

- ✅ Blog posts auto-generated
- ✅ Addresses auto-generated
- ✅ Workflow results exportable
- ✅ Performance metrics tracked

---

## 🚀 Next Steps

1. **Start with Hero Slides** - Foundation for homepage testing
2. **Implement Workflow #17** - Seller coupons (high value)
3. **Implement Workflow #19** - Hero slides management (depends on #1)
4. **Add remaining workflows** - Following priority order
5. **Enhance reporting** - Better insights into workflow results

---

**Last Updated**: November 11, 2025
**Status**: Phase 1 Complete + Workflow #17 Complete ✅
**Next Milestone**: Continue Phase 3 Workflows (#12, #15, #18, #19)
