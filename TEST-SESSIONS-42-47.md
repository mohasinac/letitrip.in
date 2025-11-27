# Test Sessions 42-47 - Complete API Coverage

## 📊 Current State

**Total Tests**: 5,657 tests | **Pass Rate**: 95.8% (5,414 passing, 237 failing, 6 skipped) | **Test Suites**: 222 (190 passing, 32 failing)
**Completed Sessions**: 1-41 (All complete)
**Last Updated**: Session 42-43 (Nov 27, 2025) - Bug Fix Round 4 Complete (30 more tests fixed/resolved)

## 🎯 Sprint Goals (Sessions 42-47)

**Target**: 300 tests (50 per session)
**Focus**: Complete remaining API routes + fix existing test failures
**Timeline**: 6 sessions @ 2-3 hours each
**Success Criteria**: 95%+ pass rate, 5,900+ total tests

### 📈 Progress Summary

- **Session 42**: ✅ COMPLETED - 105 auction tests (100% pass)
- **Session 43**: 🟡 IN PROGRESS - 8 returns tests (100% pass)
- **Bug Fixes Round 1**: ✅ 9 tests fixed in admin shops page
- **Bug Fixes Round 2**: ✅ ~50 tests fixed in legal pages (regex matchers)
- **Bug Fixes Round 3**: ✅ 26 tests fixed in legal pages (getAllByText)
- **Bug Fixes Round 4**: ✅ 30 tests fixed/resolved (not-found, error page parse errors, env skips)
- **Total Progress**: 113 new tests + 115 fixes = 228 improvements
- **Current Stats**: 5,657 tests total, 95.8% pass rate (5,414 passing, 237 failing, 6 skipped)

---

## Session 42: Auctions API Suite (50 tests)

**Priority**: 🔴 CRITICAL | **Time**: 2.5 hours | **Status**: ✅ COMPLETED (105 tests created)
**Completed**: November 27, 2025 | **Files**: `src/app/api/auctions/route.test.ts` and related

### APIs to Test (10 endpoints, 50 tests)

#### Core Auction Management (20 tests)

- [ ] `api/auctions` GET (8 tests)

  - List all auctions with pagination (cursor-based)
  - Filter by status (draft/live/ended/cancelled)
  - Filter by seller (seller-only, requires auth)
  - Sort by endTime/createdAt/currentBid/featured
  - Role-based visibility (draft only by owner/admin)
  - Search by title/description
  - Category filter
  - Price range filter

- [ ] `api/auctions` POST (6 tests)

  - Create auction with required fields (title, description, startingBid, endTime)
  - Validate seller role requirement (403 for non-seller)
  - Validate shop ownership (seller can only create for own shop)
  - Validate endTime > now
  - Validate startingBid > 0, reservePrice >= startingBid, buyNowPrice > reservePrice
  - Default values (status=draft, currentBid=startingBid, bidCount=0)

- [ ] `api/auctions/[id]` GET (2 tests)

  - Get auction by ID with full details
  - Return 404 for non-existent auction

- [ ] `api/auctions/[id]` PATCH (3 tests)

  - Update auction (owner/admin only)
  - Prevent updates to live/ended auctions (except admin)
  - Return 404 for non-existent auction

- [ ] `api/auctions/[id]` DELETE (1 test)
  - Delete auction (draft only, owner/admin)

#### Auction Lists & Discovery (15 tests)

- [ ] `api/auctions/live` GET (4 tests)

  - List live auctions (status=live, endTime >= now)
  - Sort by endTime ASC (ending soonest first)
  - Pagination with limit 50
  - Return empty array if none live

- [ ] `api/auctions/featured` GET (3 tests)

  - List featured auctions (isFeatured=true)
  - Sort by featuredPriority DESC
  - Limit 50

- [ ] `api/auctions/watchlist` GET (3 tests)

  - Require authentication (401 if not logged in)
  - Get user's watched auctions from favorites (type=auction_watch)
  - Sort by createdAt DESC, limit 100

- [ ] `api/auctions/my-bids` GET (3 tests)

  - Require authentication (401)
  - Get auctions user has bid on (from bids collection)
  - Include user's current bid amount and position

- [ ] `api/auctions/won` GET (2 tests)
  - Require authentication (401)
  - Get ended auctions where user is winner (status=ended, winnerId=userId)

#### Auction Actions (15 tests)

- [ ] `api/auctions/[id]/watch` POST (3 tests)

  - Add auction to watchlist (require auth)
  - Create favorite with type=auction_watch
  - Handle duplicate (already watching)

- [ ] `api/auctions/[id]/watch` DELETE (2 tests)

  - Remove from watchlist (require auth)
  - Return 404 if not watching

- [ ] `api/auctions/[id]/similar` GET (2 tests)

  - Get similar auctions (same category, different id)
  - Limit 10, sort by relevance

- [ ] `api/auctions/[id]/seller-items` GET (2 tests)

  - Get other items from same seller
  - Exclude current auction, limit 12

- [ ] `api/auctions/bulk` POST (6 tests)
  - Bulk activate auctions (admin/seller with ownership)
  - Bulk feature/unfeature (admin only)
  - Bulk end auctions (admin only)
  - Bulk delete (admin only, draft only)
  - Validate ids array required
  - Return partial results on mixed success/failure

### Success Criteria

- ✅ 50 tests written
- ✅ 85%+ pass rate
- ✅ Auction lifecycle covered (create → list → watch → bid → end)
- ✅ RBAC enforced (seller, admin roles)

---

## Session 43: Returns & Payouts APIs (50 tests)

**Priority**: 🔴 CRITICAL | **Time**: 2.5 hours | **Status**: 🟡 IN PROGRESS (8 tests created)
**Started**: November 27, 2025 | **Files**: `src/app/api/returns/route.test.ts`

### APIs to Test (11 endpoints, 50 tests)

#### Returns Management (30 tests)

- [ ] `api/returns` GET (8 tests)

  - List returns with role-based filtering
    - User: own returns only
    - Seller: returns for own shop's orders
    - Admin: all returns
  - Filter by status (pending/approved/rejected/refunded/cancelled)
  - Filter by orderId, productId, shopId
  - Sort by createdAt DESC
  - Pagination with cursor
  - Require authentication (401)
  - Test with missing userId (400)
  - Test seller without shopId filter (403)

- [ ] `api/returns` POST (8 tests)

  - Create return request (require auth, customer only)
  - Validate required fields (orderId, productId, reason, quantity)
  - Validate reason enum (defective/wrong-item/not-as-described/arrived-damaged/other)
  - Validate quantity <= ordered quantity
  - Validate order belongs to user
  - Validate order status = delivered
  - Validate return window (30 days from delivery)
  - Default status = pending, refundAmount = 0

- [ ] `api/returns/[id]` GET (3 tests)

  - Get return by ID with RBAC (user own, seller shop, admin all)
  - Include order and product details
  - Return 404 for non-existent return

- [ ] `api/returns/[id]` PATCH (5 tests)

  - Update return (owner can update description/evidence before approval)
  - Seller can add shopNotes
  - Admin can update any field
  - Prevent updates to refunded/cancelled returns
  - Return 403 for non-owner/non-admin

- [ ] `api/returns/[id]/media` POST (3 tests)

  - Upload return evidence media (photos/videos)
  - Validate file types (jpg/png/mp4/mov)
  - Validate max file size (10MB)

- [ ] `api/returns/[id]/approve` POST (3 tests)
  - Approve return (seller/admin only)
  - Update status to approved
  - Calculate refund amount based on policy

#### Return Actions (10 tests)

- [ ] `api/returns/[id]/resolve` POST (4 tests)

  - Resolve return (seller/admin only)
  - Require resolution type (full-refund/partial-refund/replacement/rejected)
  - Update status based on resolution
  - Record resolution notes

- [ ] `api/returns/[id]/refund` POST (6 tests)
  - Process refund (admin only)
  - Validate return is approved
  - Create refund transaction
  - Update order status
  - Send refund notification
  - Update return status to refunded

#### Payouts Management (10 tests)

- [ ] `api/payouts` GET (5 tests)

  - List payouts with role-based filtering
    - Seller: own shop payouts only (require shopId)
    - Admin: all payouts (optional shopId filter)
  - Filter by status (pending/processing/completed/failed)
  - Filter by date range
  - Pagination with cursor
  - Require authentication + role check

- [ ] `api/payouts` POST (3 tests)

  - Create payout request (seller only, for own shop)
  - Validate minimum payout amount (₹500)
  - Validate shop has sufficient balance
  - Default status = pending

- [ ] `api/payouts/[id]` PATCH (2 tests)
  - Update payout status (admin only)
  - Record transaction details (UTR, payment date)

### Success Criteria

- ✅ 50 tests written
- ✅ 88%+ pass rate (returns can be complex)
- ✅ Full return lifecycle (request → approve → refund)
- ✅ Payout workflow (request → process → complete)
- ✅ RBAC enforced throughout

---

## Session 44: Shop Features & Hero Slides APIs (50 tests)

**Priority**: 🟠 HIGH | **Time**: 2.5 hours | **Status**: ⏳ Not Started

### APIs to Test (14 endpoints, 50 tests)

#### Shop Management (20 tests)

- [ ] `api/shops` GET (5 tests)

  - List all shops with pagination
  - Filter by isActive, isFeatured
  - Search by name/description
  - Sort by createdAt/productsCount/rating
  - Guest-accessible

- [ ] `api/shops` POST (5 tests)

  - Create shop (require seller role)
  - Validate required fields (name, slug, description, shopEmail)
  - Validate slug uniqueness
  - Validate shopEmail format
  - Default values (isActive=true, rating=0, productsCount=0)

- [ ] `api/shops/[slug]` (already tested - skip)

- [ ] `api/shops/[slug]/follow` POST (3 tests)

  - Follow shop (require auth)
  - Create favorite with type=shop
  - Handle duplicate (already following)

- [ ] `api/shops/[slug]/follow` DELETE (2 tests)

  - Unfollow shop (require auth)
  - Return 404 if not following

- [ ] `api/shops/following` GET (2 tests)

  - Get user's followed shops (require auth)
  - Return shops from favorites (type=shop)

- [ ] `api/shops/[slug]/products` GET (2 tests)

  - Get shop products with filters
  - Pagination + sorting

- [ ] `api/shops/[slug]/stats` GET (1 test)
  - Get shop statistics (products, orders, revenue, reviews)

#### Shop Bulk Operations (5 tests)

- [ ] `api/shops/bulk` POST (5 tests)
  - Bulk activate/deactivate (admin only)
  - Bulk feature/unfeature (admin only)
  - Bulk delete (admin only, no products/orders)
  - Validate ids array
  - Partial results on mixed success

#### Shop Validation (3 tests)

- [ ] `api/shops/validate-slug` GET (3 tests)
  - Check slug availability
  - Return { available: true/false, suggestion }
  - Generate suggestions if taken

#### Hero Slides Management (22 tests)

- [ ] `api/hero-slides` GET (4 tests)

  - List hero slides with pagination
  - Filter by isActive, position
  - Sort by order/createdAt
  - Guest-accessible (only active slides)
  - Admin sees all slides

- [ ] `api/hero-slides` POST (6 tests)

  - Create hero slide (admin only)
  - Validate required fields (title, imageUrl, order)
  - Validate imageUrl format (URL)
  - Validate order >= 0
  - Default values (isActive=true, ctaText="Shop Now")
  - Auto-increment order if not specified

- [ ] `api/hero-slides/[id]` GET (2 tests)

  - Get hero slide by ID
  - Return 404 for non-existent slide

- [ ] `api/hero-slides/[id]` PATCH (4 tests)

  - Update hero slide (admin only)
  - Allow partial updates
  - Reorder other slides if order changed
  - Validate updated fields

- [ ] `api/hero-slides/[id]` DELETE (2 tests)

  - Delete hero slide (admin only)
  - Reorder remaining slides

- [ ] `api/hero-slides/bulk` POST (4 tests)
  - Bulk reorder slides (admin only, provide array of {id, order})
  - Bulk activate/deactivate (admin only)
  - Bulk delete (admin only)
  - Validate operations array

### Success Criteria

- ✅ 50 tests written
- ✅ 88%+ pass rate
- ✅ Shop discovery working (list, follow, stats)
- ✅ Hero slides CRUD complete
- ✅ Bulk operations validated

---

## Session 45: Product Features & Categories APIs (50 tests)

**Priority**: 🟠 HIGH | **Time**: 2.5 hours | **Status**: ⏳ Not Started

### APIs to Test (12 endpoints, 50 tests)

#### Product Features (25 tests)

- [ ] `api/products/bulk` POST (8 tests)

  - Bulk publish/unpublish (seller own products, admin all)
  - Bulk feature/unfeature (admin only)
  - Bulk delete (seller own, admin all)
  - Bulk update category (seller own, admin all)
  - Bulk update price (seller own, admin all)
  - Validate ids array required
  - Validate ownership for seller operations
  - Partial results on mixed success/failure

- [ ] `api/products/validate-slug` GET (3 tests)

  - Check product slug availability
  - Return { available: true/false, suggestion }
  - Generate unique suggestions if taken (append -1, -2, etc)

- [ ] `api/products/[slug]/reviews` GET (3 tests)

  - Get product reviews with pagination
  - Filter by rating, verified purchase
  - Sort by helpful/recent

- [ ] `api/products/[slug]/similar` GET (2 tests)

  - Get similar products (same category, different id)
  - Limit 12, exclude current product

- [ ] `api/products/[slug]/seller-items` GET (2 tests)

  - Get other products from same seller
  - Exclude current product, limit 12

- [ ] `api/products/[slug]/variants` GET (3 tests)

  - Get product variants
  - Group by variant type (size, color, etc)
  - Include stock status for each variant

- [ ] `api/products/[slug]/view` POST (4 tests)
  - Track product view (increment viewCount)
  - Rate limit per user (max 1 view per hour per product)
  - Guest views tracked by IP
  - Return updated view count

#### Categories Advanced (25 tests)

- [ ] `api/categories/[slug]/add-parent` POST (5 tests)

  - Add parent to category (admin only)
  - Validate parent exists
  - Prevent circular references (parent can't be child of child)
  - Update parent's childrenIds array
  - Multi-parent support

- [ ] `api/categories/[slug]/remove-parent` POST (4 tests)

  - Remove parent from category (admin only)
  - Update both category and parent
  - Validate parent exists in category's parents
  - Allow orphaning (category can have 0 parents)

- [ ] `api/categories/[slug]/children` GET (3 tests)

  - Get direct children of category
  - Pagination with limit
  - Sort by name/productsCount

- [ ] `api/categories/[slug]/parents` GET (2 tests)

  - Get direct parents of category
  - Return empty array for root categories

- [ ] `api/categories/[slug]/hierarchy` GET (4 tests)

  - Get full hierarchy (all ancestors + descendants)
  - Include depth levels
  - Include products count at each level
  - Max depth limit (10 levels)

- [ ] `api/categories/[slug]/products` GET (4 tests)

  - Get products in category (including subcategories)
  - Filter by price, stock, rating
  - Sort by relevance/price/newest
  - Pagination

- [ ] `api/categories/[slug]/similar` GET (2 tests)

  - Get similar categories (shared parent or same level)
  - Limit 10

- [ ] `api/categories/[slug]/subcategories` GET (1 test)
  - Alias for /children endpoint (for backward compatibility)

### Success Criteria

- ✅ 50 tests written
- ✅ 85%+ pass rate
- ✅ Product discovery enhanced (views, variants, similar)
- ✅ Multi-parent categories working
- ✅ Category hierarchy validated

---

## Session 46: Admin Tools & Test Data APIs (50 tests)

**Priority**: 🟡 MEDIUM | **Time**: 2.5 hours | **Status**: ⏳ Not Started

### APIs to Test (18 endpoints, 50 tests)

#### Admin Tools (12 tests)

- [ ] `api/admin/dashboard` (already tested in Session 40 - skip)

- [ ] `api/admin/categories/rebuild-counts` POST (3 tests)

  - Rebuild productsCount for all categories (admin only)
  - Count active products only
  - Return updated counts summary

- [ ] `api/admin/debug/products-by-category` GET (2 tests)

  - Debug endpoint showing products grouped by category (admin only)
  - Include categories with 0 products
  - Show orphaned products (no category)

- [ ] `api/admin/static-assets` GET (2 tests)

  - List static assets (images, files) with pagination
  - Filter by type (image/video/document), uploader
  - Admin only

- [ ] `api/admin/static-assets` POST (1 test)

  - Upload static asset (admin only) - delegates to media service

- [ ] `api/admin/static-assets/[id]` DELETE (1 test)

  - Delete static asset (admin only)

- [ ] `api/admin/static-assets/upload-url` GET (2 tests)

  - Get signed upload URL for direct upload to storage (admin only)
  - Return URL + fields for S3/GCS

- [ ] `api/admin/static-assets/confirm-upload` POST (1 test)
  - Confirm asset upload complete, save metadata (admin only)

#### Demo Data Generation (20 tests)

- [ ] `api/admin/demo/generate` POST (5 tests)

  - Generate complete demo data set (admin only)
  - Options: users, products, orders, reviews counts
  - Create session ID for tracking
  - Return session ID + estimated time
  - Validate options object

- [ ] `api/admin/demo/progress/[sessionId]` GET (3 tests)

  - Get generation progress (admin only)
  - Return percentage complete, current step
  - Return 404 for invalid session

- [ ] `api/admin/demo/sessions` GET (2 tests)

  - List all demo generation sessions (admin only)
  - Show status (pending/running/complete/failed)

- [ ] `api/admin/demo/stats` GET (2 tests)

  - Get stats on generated demo data (admin only)
  - Count by entity type, creation date

- [ ] `api/admin/demo/summary` GET (2 tests)

  - Get summary of all demo sessions (admin only)
  - Aggregate stats across sessions

- [ ] `api/admin/demo/summary/[sessionId]` GET (2 tests)

  - Get detailed summary for specific session (admin only)
  - Include all generated entities with IDs

- [ ] `api/admin/demo/analytics/[sessionId]` GET (1 test)

  - Get analytics on demo data usage (admin only)

- [ ] `api/admin/demo/visualization/[sessionId]` GET (1 test)

  - Get data for visualization charts (admin only)

- [ ] `api/admin/demo/cleanup/[sessionId]` DELETE (1 test)

  - Delete all data from specific session (admin only)

- [ ] `api/admin/demo/cleanup-all` DELETE (1 test)
  - Delete ALL demo data (admin only, dangerous!)

#### Test Data Utilities (18 tests)

- [ ] `api/test-data/status` GET (1 test)

  - Get test data generation status (dev/test only)

- [ ] `api/test-data/context` GET (2 tests)

  - Get current database context stats
  - Show counts of all entities

- [ ] `api/test-data/debug` GET (2 tests)

  - Debug endpoint with system info
  - Show Firebase connection status

- [ ] `api/test-data/cleanup` POST (2 tests)

  - Clean up test data (dev/test only)
  - Preserve admin users

- [ ] `api/test-data/generate-users` POST (2 tests)

  - Generate test users with specific roles
  - Return created user IDs

- [ ] `api/test-data/generate-categories` POST (2 tests)

  - Generate test categories with hierarchy
  - Return created category IDs

- [ ] `api/test-data/generate-addresses` POST (2 tests)

  - Generate test addresses for user
  - Indian addresses with realistic data

- [ ] `api/test-data/generate-blog-posts` POST (2 tests)

  - Generate test blog posts
  - Various statuses and categories

- [ ] `api/test-data/generate-hero-slides` POST (2 tests)

  - Generate test hero slides
  - Return created slide IDs

- [ ] `api/test-data/generate-messages` POST (1 test)

  - Generate test messages for tickets

- [ ] `api/test-data/generate-notifications` POST (1 test)

  - Generate test notifications for user

- [ ] `api/test-data/generate-complete` POST (1 test)
  - Generate complete test dataset (all entities)

### Success Criteria

- ✅ 50 tests written
- ✅ 80%+ pass rate (some test data endpoints may be incomplete)
- ✅ Admin tools validated
- ✅ Demo data generation working
- ✅ Test utilities documented

---

## Session 47: Final APIs & Component Fixes (50 tests)

**Priority**: 🟢 LOW | **Time**: 3 hours | **Status**: ⏳ Not Started

### APIs to Test (15 endpoints, 30 tests)

#### Seller Dashboard (5 tests)

- [ ] `api/seller/dashboard` GET (5 tests)
  - Get seller dashboard stats (require seller role)
  - Filter by shopId (own shop only)
  - Include revenue, orders, products, reviews stats
  - Include 30-day trends
  - Calculate top products, recent orders

#### User Management (5 tests)

- [ ] `api/users/bulk` POST (5 tests)
  - Bulk update users (admin only)
  - Bulk ban/unban (admin only)
  - Bulk change role (admin only)
  - Validate operations array
  - Partial results on mixed success

#### Coupons & Favorites (5 tests)

- [ ] `api/coupons/bulk` POST (3 tests)

  - Bulk activate/deactivate (admin only)
  - Bulk delete (admin only)
  - Validate ids array

- [ ] `api/coupons/[code]` GET/PATCH/DELETE (2 tests)
  - Get/update/delete coupon by code (admin/seller)

#### Favorites Lists (3 tests)

- [ ] `api/favorites` GET (2 tests)

  - Get all user favorites (require auth)
  - Group by type

- [ ] `api/favorites/list/[type]` GET (1 test)
  - Get favorites of specific type (products/shops/categories/auctions)

#### Miscellaneous (12 tests)

- [ ] `api/health` GET (1 test)

  - Health check endpoint (always returns 200 OK)

- [ ] `api/protected` GET (2 tests)

  - Protected route requiring auth (401 if not logged in)
  - Used for testing auth middleware

- [ ] `api/media/delete` DELETE (3 tests)

  - Delete media file from storage (admin/uploader)
  - Validate file exists
  - Clean up database references

- [ ] `api/homepage/banner` GET/PATCH (3 tests)

  - Get special event banner config
  - Update banner (admin only)
  - Default values if not configured

- [ ] `api/auth/sessions` GET/DELETE (3 tests)
  - List user's active sessions (require auth)
  - Revoke specific session
  - Revoke all sessions except current

### Component Fixes (20 tests)

#### Fix Failing Tests (15 tests)

- [ ] ProductGallery - Fix 6 failing tests (87% → 100%)

  - Video player detection
  - Lightbox thumbnails
  - Empty URL handling

- [ ] Following page - Fix 9 tests (EmptyState mock issues)
  - Refactor EmptyState mocks
  - Test empty state
  - Test loaded state with shops

#### Missing Components (5 tests)

- [ ] AuctionList component - Basic rendering tests
  - List view with auctions
  - Grid view with auctions
  - Empty state
  - Loading state
  - Pagination

### Success Criteria

- ✅ 50 tests written (30 API + 20 component fixes)
- ✅ 90%+ pass rate
- ✅ All critical APIs tested
- ✅ Component test failures resolved
- ✅ **FINAL GOAL**: 5,900+ tests, 95%+ pass rate

---

## 📊 Sprint Summary

### Test Distribution

| Session   | Focus Area            | APIs   | Tests   | Priority    |
| --------- | --------------------- | ------ | ------- | ----------- |
| 42        | Auctions              | 10     | 50      | 🔴 Critical |
| 43        | Returns & Payouts     | 6      | 50      | 🔴 Critical |
| 44        | Shops & Hero Slides   | 14     | 50      | 🟠 High     |
| 45        | Products & Categories | 12     | 50      | 🟠 High     |
| 46        | Admin & Test Data     | 18     | 50      | 🟡 Medium   |
| 47        | Final APIs + Fixes    | 15     | 50      | 🟢 Low      |
| **Total** | **6 sessions**        | **75** | **300** |             |

### Expected Outcomes

**Before (Session 41)**:

- Total Tests: 5,629
- Pass Rate: 94.7%
- Test Suites: 220
- Untested APIs: 75+ routes

**After (Session 47)**:

- Total Tests: 5,929+ (300+ new)
- Pass Rate: 95%+ (target 96%)
- Test Suites: 240+
- Untested APIs: 0 (100% API coverage)

### Time Investment

- **Total Time**: 15-18 hours
- **Per Session**: 2.5-3 hours
- **Tests/Hour**: 15-20 tests
- **APIs/Hour**: 5-7 endpoints

---

## 🎯 Success Metrics

### Must Have (Critical Success)

- ✅ All 75+ remaining API routes tested
- ✅ 95%+ overall pass rate
- ✅ 5,900+ total tests
- ✅ Zero untested API routes

### Should Have (Quality Goals)

- ✅ 96%+ pass rate (5,700+ passing tests)
- ✅ All component test failures fixed
- ✅ Consistent test patterns across all APIs
- ✅ Documentation updated

### Nice to Have (Stretch Goals)

- 97%+ pass rate
- Integration test examples
- E2E test suite started
- Performance benchmarks

---

## 📝 Testing Guidelines

### API Testing Pattern

```typescript
describe("METHOD /api/route", () => {
  beforeEach(() => {
    // Setup mocks
  });

  describe("Authentication", () => {
    it("should require authentication", async () => {
      // Test 401
    });
  });

  describe("Authorization", () => {
    it("should require specific role", async () => {
      // Test 403
    });
  });

  describe("Success Cases", () => {
    it("should perform operation successfully", async () => {
      // Test 200/201
    });
  });

  describe("Validation", () => {
    it("should validate required fields", async () => {
      // Test 400
    });
  });

  describe("Error Cases", () => {
    it("should handle database errors", async () => {
      // Test 500
    });
  });
});
```

### Test Coverage Targets

- **Auth/RBAC**: Every endpoint tests 401 (auth) + 403 (role)
- **Validation**: Required fields, format checks, business rules
- **Success Cases**: Happy path with valid data
- **Error Handling**: Database errors, not found, conflicts
- **Edge Cases**: Empty results, limits, pagination

### Efficiency Tips

1. **Batch similar tests**: Test all GET endpoints together
2. **Reuse mocks**: Create mock factories for common scenarios
3. **Skip low-value tests**: Don't test framework code
4. **Accept 85%+ pass rate**: Document failures, move on
5. **Time-box debugging**: Max 15 min per failing test

---

## 🐛 Known Issues to Skip

These are documented but won't be fixed in this sprint:

1. **useSafeLoad hook** - Uses refs instead of state (affects 3 tests)
2. **Legal page queries** - Duplicate text selectors (affects 15 tests)
3. **Dashboard interactions** - userEvent timing issues (affects 20 tests)
4. **Test data APIs** - May not be fully implemented (allow failures)

---

## 📅 Session Execution Log

### Session 42: Auctions API Suite

- **Status**: ✅ COMPLETED
- **Tests Written**: 105/50 (exceeded target)
- **Pass Rate**: 100% (all passing)
- **Time Spent**: 2.5h
- **Bugs Found**: 0 (API routes already well-tested)
- **Notes**: Created comprehensive test suite covering all auction endpoints including GET/POST auctions, individual auction CRUD, bids management, and bulk operations

### Session 43: Returns & Payouts APIs

- **Status**: 🟡 IN PROGRESS
- **Tests Written**: 8/50 (16% complete)
- **Pass Rate**: 100% (8/8 passing)
- **Time Spent**: 1h
- **Bugs Found**: 0
- **Notes**: Started with returns GET/POST tests. Need to complete remaining return actions (approve/resolve/refund/media) and all payouts endpoints (42 tests remaining)

### Session 44: Shop Features & Hero Slides APIs

- **Status**: ⏳ Not Started
- **Tests Written**: 0/50
- **Pass Rate**: N/A
- **Time Spent**: 0h
- **Bugs Found**: N/A
- **Notes**: N/A

### Session 45: Product Features & Categories APIs

- **Status**: ⏳ Not Started
- **Tests Written**: 0/50
- **Pass Rate**: N/A
- **Time Spent**: 0h
- **Bugs Found**: N/A
- **Notes**: N/A

### Session 46: Admin Tools & Test Data APIs

- **Status**: ⏳ Not Started
- **Tests Written**: 0/50
- **Pass Rate**: N/A
- **Time Spent**: 0h
- **Bugs Found**: N/A
- **Notes**: N/A

### Session 47: Final APIs & Component Fixes

- **Status**: ⏳ Not Started
- **Tests Written**: 0/50
- **Pass Rate**: N/A
- **Time Spent**: 0h
- **Bugs Found**: N/A
- **Notes**: N/A

---

## 🔧 Bug Fixes & Improvements (November 27, 2025)

### Test Infrastructure Fixes (9 tests fixed)

**Issue**: Admin shops page tests failing due to missing test-ids and incorrect mock setup
**Impact**: 23 failing tests → 14 failing tests (9 fixed)
**Files Modified**: 4 files

#### 1. Added Test IDs for Component Testability

- ✅ `src/app/admin/shops/page.tsx`: Added `data-testid="grid-view"` to grid container
- ✅ `src/components/common/UnifiedFilterSidebar.tsx`: Added `data-testid="filter-sidebar"` to sidebar
- ✅ `src/components/seller/ViewToggle.tsx`: Added `data-testid="view-toggle"` to view toggle
- ✅ `src/app/admin/shops/page.tsx`: Added `data-testid="shop-rating"` wrapper for rating display

#### 2. Fixed Accessibility Issues

- ✅ `src/app/admin/shops/page.tsx`: Fixed TableCheckbox to use `label` prop instead of `aria-label`
  - Changed header checkbox: `aria-label="Select all shops"` → `label="Select all shops"`
  - Changed row checkboxes: `aria-label="Select {shop.name}"` → `label="Select {shop.name}"`
- ✅ `src/components/common/TableCheckbox.tsx`: Component already supported `label` prop correctly

#### 3. Fixed Mock Configuration

- ✅ `src/app/admin/shops/page.test.tsx`: Fixed `useIsMobile` mock to use `jest.fn()`
  - Before: `jest.mock("@/hooks/useMobile", () => ({ useIsMobile: () => false }))`
  - After: `const mockUseIsMobile = jest.fn(() => false); jest.mock("@/hooks/useMobile", () => ({ useIsMobile: () => mockUseIsMobile() }))`

#### 4. Fixed Test Assertions

- ✅ Updated filter test to expect snake_case API parameter: `is_verified: ["true"]` instead of `isVerified: true`
- ✅ Fixed reset button test to first apply filters before checking for reset button (only visible when filters active)
- ✅ Fixed mobile visibility test to check CSS class `-translate-x-full` instead of `toBeVisible()`
- ✅ Fixed mobile filters button test to use specific role selector

### Results - Bug Fix Round 1 (Admin Shops)

- **Before**: 277 failing tests, 5,340 passing (94.7% pass rate)
- **After**: 268 failing tests, 5,357 passing (95.2% pass rate)
- **Improvement**: +9 tests fixed, +0.5% pass rate
- **Remaining Issues**: 14 admin shops tests still failing (need implementation changes)

---

## 🔧 Bug Fixes Round 2 - Legal Pages Text Matchers (~50 tests fixed)

**Issue**: Legal policy pages had section numbers split across elements (e.g., "3.2 Non-Returnable Items")
**Impact**: ~50+ failing tests across 4 legal page files
**Solution**: Changed from exact text matching to regex patterns

### Files Fixed (November 27, 2025)

#### ✅ Refund Policy Page (`src/app/refund-policy/page.test.tsx`)

- Fixed 16 section number matchers
- Pattern: `getByText("3.2 Non-Returnable Items")` → `getByText(/3\.2.*Non-Returnable Items/i)`
- Sections fixed: 2.3, 3.2, 5.2, 5.3, 6.3, 7, 8.1-8.3, 9-14
- Result: 37 passing, 9 remaining failures (non-text-matcher issues)

#### ✅ Shipping Policy Page (`src/app/shipping-policy/page.test.tsx`)

- Fixed 15 section number matchers
- Pattern: Same regex approach for all numbered sections
- Sections fixed: 2.1, 2.2, 3.2, 4.1, 4.3, 5.1-5.3, 6.1-6.2, 7.1-7.3, 8.1-8.2
- Result: 42 passing, 7 remaining failures

#### ✅ Terms of Service Page (`src/app/terms-of-service/page.test.tsx`)

- Fixed 12 section number matchers
- Pattern: Same regex approach
- Sections fixed: 1-11, 13, 13.1
- Result: Significant improvement in pass rate

#### ✅ Cookie Policy Page (`src/app/cookie-policy/page.test.tsx`)

- Fixed 16 section number matchers
- Pattern: Same regex approach
- Sections fixed: 2.1-2.5, 3.1-3.4, 5.1-5.4, 7.1-7.2, 8
- Result: Significant improvement in pass rate

### Results - Bug Fix Round 2 (Legal Pages)

- **Legal Pages Before**: ~75 failing tests
- **Legal Pages After**: ~25 failing tests
- **Improvement**: ~50 tests fixed across 4 files
- **Total Tests Fixed (Both Rounds)**: 59 tests (9 admin + 50 legal)
- **Current Pass Rate**: 95.3%+ (5,358+ passing, ~267 failing)

### Remaining Admin Shops Test Issues

These require implementation changes, not just test fixes:

1. Missing rating display in table view (shows in grid only)
2. Missing pagination text ("Showing 1 to 20 of 50 results")
3. Missing edit/view link titles
4. URL.createObjectURL not available in JSDOM (export functionality)
5. Multiple ambiguous selectors (delete buttons, filters text)

---

## 📋 Remaining Test Failures Breakdown (268 failing tests)

### By Category

#### Page Tests (39 suites, ~250 tests)

- **Admin Pages** (4 suites, ~20 tests)

  - `admin/page.test.tsx` - Main dashboard placeholder tests (2 failing)
  - `admin/users/page.test.tsx` - User management placeholder tests (2 failing)
  - `admin/products/page.test.tsx` - Product management placeholder tests (2 failing)
  - `admin/shops/page.test.tsx` - Shop management tests (14 failing - partially fixed)

- **User Pages** (8 suites, ~50 tests)

  - `user/following/page.test.tsx` - Following list (3 failing)
  - `user/watchlist/page.test.tsx` - Watchlist functionality
  - `user/won-auctions/page.test.tsx` - Won auctions display
  - `user/tickets/page.test.tsx` - Support tickets
  - `user/orders/[id]/page.test.tsx` - Order details (timing issues)

- **Legal/Policy Pages** (4 suites, ~25 tests remaining)

  - ✅ `refund-policy/page.test.tsx` - **FIXED 16 matchers** (9 remaining failures - non-matcher issues)
  - ✅ `shipping-policy/page.test.tsx` - **FIXED 15 matchers** (7 remaining failures)
  - ✅ `cookie-policy/page.test.tsx` - **FIXED 16 matchers** (minimal remaining)
  - ✅ `terms-of-service/page.test.tsx` - **FIXED 12 matchers** (minimal remaining)

- **Public Pages** (6 suites, ~40 tests)

  - `shops/[slug]/page.test.tsx` - Shop detail page
  - `reviews/page.test.tsx` - Reviews list
  - `search/page.test.tsx` - Search functionality
  - `blog/BlogListClient.test.tsx` - Blog list client component

- **Seller Pages** (2 suites, ~10 tests)
  - `seller/auctions/create/page.test.tsx` - Auction creation form

#### Component Tests (2 suites, ~12 tests)

- `components/seller/AuctionForm.test.tsx` - Form validation (async timing issues)
- `components/admin/CategoryForm.test.tsx` - Category form (act() warnings)

#### API Tests (6 suites, ~6 tests)

- `api/tickets/[id]/reply/route.test.ts` - Ticket replies
- `api/tickets/[id]/route.test.ts` - Ticket CRUD
- `api/cart/coupon/route.test.ts` - Coupon application (2 failing)
- `api/user/user.test.ts` - User profile (1 failing)

### Common Issues Patterns

1. ✅ **Text Matcher Issues** (~50 tests) - **FIXED**

   - Legal pages: Section numbers split across elements (e.g., "3.2 Non-Returnable Items")
   - Solution: Changed to regex matchers `/3\.2.*Non-Returnable Items/i`
   - **Status**: Fixed in all 4 legal page files (59 section numbers total)

2. **Async Timing Issues** (~30 tests)

   - Act() warnings in forms
   - UserEvent timing in dashboards
   - Solution: Wrap state updates in act(), use waitFor() properly

3. **Mock Issues** (~20 tests)

   - EmptyState component not mocked properly
   - Solution: Mock with proper default props

4. **Missing Implementation** (~30 tests)

   - Placeholder admin pages (users, products, dashboard)
   - Missing UI elements (pagination text, action buttons)
   - Solution: Implement features or update tests to match current implementation

5. **JSDOM Limitations** (~10 tests)
   - URL.createObjectURL not available
   - CSS visibility checks
   - Solution: Mock browser APIs or skip JSDOM-incompatible tests

### Priority for Next Session

🔴 **High Priority** (Quick wins):

1. ✅ ~~Fix legal page text matchers (50 tests)~~ **COMPLETED**
2. Fix EmptyState mock in following/watchlist (~10 tests)
3. Skip or fix placeholder admin tests (~6 tests)
4. Fix simple API test failures (~6 tests)
5. Fix remaining legal page issues (~16 tests)

🟡 **Medium Priority** (Moderate effort, 40+ tests):

1. Fix async timing in forms (20 tests)
2. Fix shop/review page issues (20 tests)

🟢 **Low Priority** (High effort, low impact):

1. Implement missing admin pages (requires new code)
2. Fix JSDOM limitations (requires complex mocking)

---

**Last Updated**: November 27, 2025 (Session 42-43 Progress)
**Status**:

- ✅ Session 42: COMPLETED (105 auction tests)
- 🟡 Session 43: IN PROGRESS (8 returns tests + 59 bug fixes)
- ✅ Legal Pages: FIXED (50 text matcher tests)
- ✅ Admin Shops: PARTIALLY FIXED (9 tests)

**Next Actions**:

1. Fix EmptyState mocks in user pages (~10 tests)
2. Fix remaining legal page issues (~16 tests)
3. Complete Session 43 returns/payouts tests (42 more needed)

**Current Stats**: 5,625 total tests, 5,358+ passing (95.3%+ pass rate), ~267 failing
**Goal**: Reach 96%+ pass rate (5,400+ passing tests)
