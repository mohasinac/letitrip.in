# Admin Portal Feature

**Feature path:** `src/features/admin/`  
**Repositories:** All repositories (admin has cross-cutting access)  
**Actions:** `admin.actions.ts`, `admin-coupon.actions.ts`, plus domain-specific actions

---

## Overview

The admin portal provides platform-wide management across all entities. It is accessible only to users with the `admin` role.

---

## Layout Components

### `AdminSidebar`

Collapsible left navigation with sections:

```
Platform
  Dashboard       → /admin/dashboard
  Analytics       → /admin/analytics
Catalogue
  Products        → /admin/products
  Categories      → /admin/categories
Commerce
  Orders          → /admin/orders
  Coupons         → /admin/coupons
  Bids            → /admin/bids
  Payouts         → /admin/payouts
Community
  Users           → /admin/users
  Stores          → /admin/stores
  Reviews         → /admin/reviews
  Events          → /admin/events
Content
  Blog            → /admin/blog
  Carousel        → /admin/carousel
  Sections        → /admin/sections
  FAQs            → /admin/faqs
  Media           → /admin/media
Configuration
  Site Settings   → /admin/site
  Feature Flags   → /admin/feature-flags
Tools
  Algolia Sync    → /demo/algolia
```

### `AdminTopBar`

Header bar with:

- Mobile hamburger toggle for `AdminSidebar`
- Site search (internal)
- User dropdown (profile, logout)
- Notification bell

---

## Dashboard Widgets

### `AdminStatsCards`

4-card grid: total users, total products, total orders (30d), revenue (30d). Each card has a trend indicator (% change vs. prior period).

### `AdminPriorityAlerts`

Flagged items needing admin attention:

- Pending reviews awaiting moderation
- Pending payout requests
- New seller applications
- Failed payment webhooks

### `QuickActionsGrid`

Action shortcut buttons: "Add Product", "Manage Coupons", "View Payouts", "Check Reviews", "Sync Algolia".

### `RecentActivityCard`

Last 10 events: new orders, new registrations, new reviews, coupon uses.

### `AdminDashboardSkeleton`

Loading skeleton for the dashboard while KPI data is fetching.

---

## Admin-Specific UI Components

### `AdminPageHeader`

Standard page header with:

- Page title
- Optional subtitle
- "Create New" action button (right side)

### `AdminFilterBar`

Top filter bar above data tables:

- Search text input (debounced)
- Passed to Sieve `search` param

### `DrawerFormFooter`

Sticky footer inside admin drawer forms:

- "Cancel" button (closes drawer)
- "Save" / "Submit" button (with loading state)

---

## Form Components

### `BlogForm`

See [docs/features/blog.md](blog.md#admin-management).

### `CarouselSlideForm`

Fields: image (`MediaUploadField`), link URL, overlay text, display order, active toggle.

### `CouponForm` + `couponToFormState`

Fields: code, discount type, discount value, minimum amount, max uses, dates, applicable products.  
`couponToFormState` maps a `Coupon` document into form default values.

### `FaqForm`

Fields: question, answer (textarea), category (select), status.

### `OrderStatusForm`

Fields: status (select), note (textarea). Submits via `adminUpdateOrderAction`.

### `PayoutStatusForm`

Fields: status (select: approve/reject), note. Submits via `adminUpdatePayoutAction`.

### `SectionForm`

Fields:

- Title, type (select)
- Data filters (category, tags, min rating)
- Display count
- `GridEditor` — drag visual card layout

### `MediaOperationForm`

Crop or trim an uploaded media file. Uses `useMediaCrop` / `useMediaTrim`.

### `RipCoinAdjustModal`

Manual admin RipCoin adjustment:

- User ID (read-only)
- Amount (positive = credit, negative = debit)
- Reason (required)

Submits via `adminAdjustRipCoinsAction`.

### Site Settings Forms

See [docs/pages-admin.md](../pages-admin.md#site-settings).

---

## Table Column Definitions

Each entity has a column definition file used with `DataTable`:

| Export                                       | Used in               |
| -------------------------------------------- | --------------------- |
| `useBidTableColumns`                         | Bids table            |
| `useBlogTableColumns`                        | Blog table            |
| `useCarouselTableColumns`                    | Carousel table        |
| `getCategoryTableColumns`                    | Categories tree table |
| `getCouponTableColumns`                      | Coupons table         |
| `getFaqTableColumns`                         | FAQs table            |
| `getMediaTableColumns`                       | Media library         |
| `useOrderTableColumns`                       | Orders table          |
| `getPayoutTableColumns`                      | Payouts table         |
| `getReviewTableColumns` + `ReviewRowActions` | Reviews table         |
| `useSectionTableColumns`                     | Sections table        |
| `SESSION_TABLE_COLUMNS`                      | User sessions table   |
| `useUserTableColumns`                        | Users table           |
| `useEventsTableColumns`                      | Events table          |
| `useEventEntriesTableColumns`                | Event entries table   |

---

## Filter Components (per entity)

Config-driven `FilterPanel` instances. Each exports a `*Filters` component + filter sort option constants:

`BidFilters` · `BlogFilters` · `CarouselFilters` · `CategoryFilters` · `CouponFilters` · `EventEntryFilters` · `FaqFilters` · `HomepageSectionFilters` · `NewsletterFilters` · `NotificationFilters` · `PayoutFilters` · `RipCoinFilters` · `SessionFilters` · `StoreFilters` · `UserFilters`

---

## Admin Hooks (`features/admin/hooks/`)

| Hook                            | Description                 |
| ------------------------------- | --------------------------- |
| `useAdminStats`                 | Dashboard KPI stats         |
| `useAdminAnalytics`             | Platform analytics data     |
| `useAdminBids(sieveParams)`     | Paginated bid list          |
| `useAdminBlog(sieveParams)`     | Paginated blog list         |
| `useAdminCarousel`              | Carousel slides             |
| `useAdminCategories`            | Full category tree          |
| `useAdminCoupons(sieveParams)`  | Paginated coupons           |
| `useAdminFaqs(paramsString)`    | Paginated FAQs              |
| `useAdminFeatureFlags`          | Read + toggle feature flags |
| `useAdminOrders(sieveParams)`   | Paginated orders            |
| `useAdminPayouts(sieveParams)`  | Paginated payouts           |
| `useAdminProducts(sieveParams)` | Paginated products          |
| `useAdminReviews(sieveParams)`  | Paginated reviews           |
| `useAdminSections`              | Homepage sections list      |
| `useAdminSessions(limit)`       | Recent sessions             |
| `useRevokeSession`              | Single session revoke       |
| `useRevokeUserSessions`         | Revoke all user sessions    |
| `useAdminSiteSettings`          | Site settings read + update |
| `useAdminStores(sieveParams)`   | Paginated stores            |
| `useAdminUsers(sieveParams)`    | Paginated users             |
| `useAlgoliaSync`                | Index sync mutations        |
| `useDemoSeed`                   | Demo data seed mutations    |

---

## Admin Types

| Type file           | Types                                                   |
| ------------------- | ------------------------------------------------------- |
| `Carousel.types.ts` | `GridCard`, `CarouselSlideOverlay`, `CarouselSlide`     |
| `Faq.types.ts`      | `FAQStats`, `FAQ`, `FaqDrawerMode`                      |
| `Review.types.ts`   | `Review`, `ReviewStatus`                                |
| `Section.types.ts`  | `HomepageSection`, `SectionDrawerMode`, `SECTION_TYPES` |
| `User.types.ts`     | `AdminUser`, `UserTab`                                  |
