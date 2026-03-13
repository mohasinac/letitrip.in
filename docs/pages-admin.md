# Admin Portal Pages

All admin portal pages live under `src/app/[locale]/admin/`. They require `admin` role and are wrapped by the admin layout with `AdminSidebar` + `AdminTopBar`.

Most admin pages use a `[[...action]]` catch-all route pattern to handle list, create, edit, and detail views within a single page file.

---

## Dashboard

**Route:** `/admin/dashboard`  
**Component:** `AdminDashboardView`

Platform-wide overview:

- `AdminStatsCards` — total users, products, orders, revenue
- `QuickActionsGrid` — shortcuts to common admin tasks
- `RecentActivityCard` — recent orders, registrations, reviews
- `AdminPriorityAlerts` — flagged items needing attention (pending reviews, failed payouts)

**Data:** `useAdminStats()` → `GET /api/admin/dashboard`

---

## Analytics

**Route:** `/admin/analytics`  
**Component:** `AdminAnalyticsView`

Platform analytics:

- Revenue trend (daily/weekly/monthly)
- Orders by status breakdown
- Top-selling products and categories
- New user registrations
- Seller performance comparison

**Data:** `useAdminAnalytics()` → `GET /api/admin/analytics`

---

## Products

**Route:** `/admin/products/[[...action]]`  
**Component:** `AdminProductsView`

Manage all seller products:

- Full DataTable with `useAdminProducts(sieveParams)`
- Filter by status, category, seller, price range via `ProductFilters`
- Inline status toggle (active/inactive/pending)
- Edit product drawer with `ProductForm`
- Delete with `ConfirmDeleteModal`

**Actions:**

- `adminCreateProductAction`
- `adminUpdateProductAction`
- `adminDeleteProductAction`

**Columns:** `useProductTableColumns`

---

## Orders

**Route:** `/admin/orders/[[...action]]`  
**Component:** `AdminOrdersView`

All platform orders across all sellers:

- Filter by status, seller, date range, payment method via `OrderFilters`
- Columns: order ID, customer, seller, total, status, date
- Status update via `OrderStatusForm` + `adminUpdateOrderAction`
- View order details and generate invoice

**Columns:** `useOrderTableColumns`

---

## Users

**Route:** `/admin/users/[[...action]]`  
**Component:** `AdminUsersView`

User account management:

- DataTable with `useAdminUsers(sieveParams)` + `UserFilters`
- `UserDetailDrawer` — view full user profile, role, order history, sessions
- Role change, account suspend/unsuspend
- `RipCoinAdjustModal` — manually credit or debit RipCoins
- Session revocation via `revokeSessionAction` / `revokeUserSessionsAction`

**Actions:** `adminUpdateUserAction`, `adminDeleteUserAction`, `adminAdjustRipCoinsAction`  
**Columns:** `useUserTableColumns`

---

## Stores

**Route:** `/admin/stores`  
**Component:** `AdminStoresView`

Approve, suspend, or review seller stores:

- Filter by approval status via `StoreFilters`
- `adminUpdateStoreStatusAction` — approve/reject/suspend a store

---

## Reviews

**Route:** `/admin/reviews/[[...action]]`  
**Component:** `AdminReviewsView`

Moderate product reviews:

- Filter by status (pending/approved/rejected), rating via `ReviewFilters`
- `ReviewDetailView` — full review content with product and user info
- Approve/reject via `adminUpdateReviewAction`
- Delete via `adminDeleteReviewAction`

**Columns:** `getReviewTableColumns`, `ReviewRowActions`

---

## Blog

**Route:** `/admin/blog/[[...action]]`  
**Component:** `AdminBlogView`

Blog post CRUD:

- DataTable with `useAdminBlog(sieveParams)` + `BlogFilters`
- Drawer with `BlogForm` (title, slug, rich text via `RichTextEditor`, featured image, categories, publish state)

**Actions:** `createBlogPostAction`, `updateBlogPostAction`, `deleteBlogPostAction`  
**Columns:** `useBlogTableColumns`

---

## Events

**Route:** `/admin/events`  
**Component:** `AdminEventsView`

Manage platform events (polls, surveys, feedback, sales, offers):

- DataTable with `useEvents(params)` + `EventFilters`
- `EventFormDrawer` — create/edit event with type-specific config forms
- Status management: draft → published → ended

**Route:** `/admin/events/[id]/entries`  
**Component:** `AdminEventEntriesView`

Review individual event entries. `EntryReviewDrawer` to approve/reject entries.

**Actions:** `createEventAction`, `updateEventAction`, `deleteEventAction`, `changeEventStatusAction`, `adminUpdateEventEntryAction`

---

## Categories

**Route:** `/admin/categories/[[...action]]`  
**Component:** `AdminCategoriesView`

Hierarchical category management:

- `CategoryTreeView` — visual tree of parent/child categories
- `CategoryForm` — create/edit with name, slug, image, parent category

**Actions:** `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`  
**Columns:** `getCategoryTableColumns`

---

## Coupons

**Route:** `/admin/coupons/[[...action]]`  
**Component:** `AdminCouponsView`

Platform-wide coupon codes:

- DataTable with `useAdminCoupons(sieveParams)` + `CouponFilters`
- `CouponForm` — create/edit (code, discount, conditions, dates)

**Actions:** `adminCreateCouponAction`, `adminUpdateCouponAction`, `adminDeleteCouponAction`  
**Columns:** `getCouponTableColumns`

---

## Bids

**Route:** `/admin/bids/[[...action]]`  
**Component:** `AdminBidsView`

Review all auction bids across the platform:

- DataTable with `useAdminBids(sieveParams)` + `BidFilters`
- Can void fraudulent bids

**Columns:** `useBidTableColumns`

---

## FAQs

**Route:** `/admin/faqs/[[...action]]`  
**Component:** `AdminFaqsView`

Manage FAQ entries:

- DataTable with `useAdminFaqs` + `FaqFilters`
- `FaqForm` — create/edit FAQ with category, question, answer

**Actions:** `adminCreateFaqAction`, `adminUpdateFaqAction`, `adminDeleteFaqAction`  
**Columns:** `getFaqTableColumns`

---

## Carousel

**Route:** `/admin/carousel/[[...action]]`  
**Component:** `AdminCarouselView`

Manage hero banner slides:

- `CarouselSlideForm` — image, link URL, overlay text, display order, active toggle

**Actions:** `createCarouselSlideAction`, `updateCarouselSlideAction`, `deleteCarouselSlideAction`  
**Columns:** `useCarouselTableColumns`

---

## Homepage Sections

**Route:** `/admin/sections/[[...action]]`  
**Component:** `AdminSectionsView`

Control which content sections appear on the homepage and in what order:

- `SectionForm` — section type, title, filters, display count, grid editor
- `GridEditor` — drag-and-drop visual grid layout
- `HomepageSectionFilters` — filter sections by type

**Actions:** `createHomepageSectionAction`, `updateHomepageSectionAction`, `deleteHomepageSectionAction`  
**Columns:** `useSectionTableColumns`

---

## Payouts

**Route:** `/admin/payouts`  
**Component:** `AdminPayoutsView`

Platform payout management:

- `PayoutStatusForm` + `adminUpdatePayoutAction` — approve or reject payout requests
- Weekly payout batch trigger

**Columns:** `getPayoutTableColumns`

---

## Media Library

**Route:** `/admin/media`  
**Component:** `AdminMediaView`

Upload and manage media files in Firebase Storage:

- Grid of uploaded assets with preview
- `MediaOperationForm` — crop or trim media
- Bulk delete

**Columns:** `getMediaTableColumns`

---

## Site Settings

**Route:** `/admin/site`  
**Component:** `AdminSiteView`

Platform-wide configuration with tabbed sub-forms:

- `SiteBasicInfoForm` — site name, logo, favicon, description
- `SiteContactForm` — support email, phone, address
- `SiteSocialLinksForm` — social media profile URLs
- `SiteCommissionsForm` — seller commission rates
- `SiteCredentialsForm` — AES-256-GCM encrypted provider credentials (Razorpay, Resend, etc.)
- `BackgroundSettings` — page background visual settings

---

## Feature Flags

**Route:** `/admin/feature-flags`  
**Component:** `AdminFeatureFlagsView`

Toggle platform feature flags (e.g. enable auctions, enable pre-orders, maintenance mode). Uses `useAdminFeatureFlags`.

---

## Algolia Sync

**Route:** `/demo/algolia`  
**Component:** `AlgoliaDashboardView`

Trigger Algolia index sync:

- Sync all products
- Sync static pages
- Clear product index
- Clear pages index

Uses `useAlgoliaSync` → `POST /api/admin/algolia/sync` etc.
