# Business & Components Refactoring Plan

> **Purpose**: Full analysis of every component in `src/components/`, classifying each as GENERIC (no business logic) or BUSINESS (domain-coupled), with a concrete migration plan to extract all business logic into `src/features/` views — leaving `src/components/` as a pure, reusable, domain-agnostic primitive library.
>
> **Living document** — updated as each phase completes.

---

## Table of Contents

1. [Goal](#1-goal)
2. [Architecture After Refactor](#2-architecture-after-refactor)
3. [Classification Criteria](#3-classification-criteria)
4. [Current State Inventory](#4-current-state-inventory)
5. [Classification Summary](#5-classification-summary)
6. [Already Generic — No Action Needed](#6-already-generic--no-action-needed)
7. [Business Components — Must Be Moved](#7-business-components--must-be-moved)
8. [Mixed Components — Need Cleanup](#8-mixed-components--need-cleanup)
9. [New Generic Primitives to Extract](#9-new-generic-primitives-to-extract)
10. [Migration Strategy Per Domain](#10-migration-strategy-per-domain)
11. [Execution Phases](#11-execution-phases)
12. [Tracking Checklist](#12-tracking-checklist)
13. [Key Principles](#13-key-principles)
14. [Sieve Configuration Recommendations](#14-sieve-configuration-recommendations)
15. [Resource Filter Components](#15-resource-filter-components)
16. [Global Search Architecture](#16-global-search-architecture)
17. [URL Navigation & Back-Button Behaviour](#17-url-navigation--back-button-behaviour)
18. [Bulk Actions Matrix](#18-bulk-actions-matrix)

---

## 1. Goal

The `ListingLayout` refactor demonstrated the correct pattern:

1. **Generic primitives** in `src/components/` — zero business logic, zero domain types (`ProductDocument`, `OrderDocument`, etc.), zero domain hooks (`useAddToCart`, `useWishlistToggle`, etc.). Fully reusable across any page or even extractable to an external package.
2. **Business components** in `src/features/<domain>/components/` — compose generic primitives with domain hooks, services, and schema types to build the actual UI for each page.
3. **Feature views** in `src/features/<domain>/components/*View.tsx` — orchestrate business sub-components into page-level compositions.
4. **Pages** in `src/app/` — thin shells (< 150 lines) that render a single feature view.

Currently, `src/components/` contains **~105 BUSINESS files** that import domain schemas, domain hooks, or domain services. These must be either:
- **Moved** into `src/features/<domain>/components/` as-is (if the component is entirely business-specific), or
- **Split** into a generic primitive (stays in `src/components/`) + a business wrapper (moves to `src/features/<domain>/components/`).

### Reference: ListingLayout Pattern

`ListingLayout` is the gold standard of what every component in `src/components/` should look like:

```
ListingLayout (src/components/ui/ListingLayout.tsx)
  ├── Zero domain types (no ProductDocument, OrderDocument, etc.)
  ├── Zero domain hooks (no useProducts, useOrders, etc.)
  ├── Zero domain services (no productService, orderService, etc.)
  ├── Accepts everything via props/slots (headerSlot, filterContent, children, etc.)
  └── Used by MANY feature views:
      ├── ProductsView          (features/products/)
      ├── AuctionsView          (features/products/)
      ├── AdminProductsView     (features/admin/)
      ├── AdminOrdersView       (features/admin/)
      ├── SellerProductsView    (features/seller/)
      ├── SearchView            (features/search/)
      └── ... every listing page
```

**Every component in `src/components/` must achieve this same level of genericity.**

---

## 2. Architecture After Refactor

```
src/components/                          ← Tier 1: ONLY generic primitives
  ui/           Button, Card, Badge, DataTable, ListingLayout, SideDrawer,
                StepperNav, StatsGrid, CountdownDisplay, RatingDisplay,
                PriceDisplay, ItemRow, SummaryCard, PromoCodeField, ...
  forms/        Input, Select, Textarea, Checkbox, Toggle, Slider, Radio, Form
  typography/   Heading, Text, Caption, Label, Span, TextLink
  semantic/     Section, Article, Main, Nav, Ul, Ol, Li, ...
  feedback/     Alert, Modal, Toast
  modals/       ConfirmDeleteModal, ImageCropModal, UnsavedChangesModal
  media/        MediaImage, MediaVideo
  utility/      Search, BackToTop, ResponsiveView, BackgroundRenderer
  layout/       Breadcrumbs, NavItem, LocaleSwitcher, AutoBreadcrumbs,
                FooterLayout, NavbarLayout, SidebarLayout, TitleBarLayout,
                BottomNavLayout (all genericized — data via props)
  admin/        AdminPageHeader, AdminFilterBar, DataTable, DrawerFormFooter,
                AdminStatsCards, RichTextEditor, GridEditor, CategoryTreeView,
                BackgroundSettings, ImageUpload (genericized), ReviewStars/RatingDisplay
  auth/         ProtectedRoute, RoleGate (infrastructure — stays Tier 1)
  providers/    MonitoringProvider (infrastructure — stays Tier 1)

src/features/<domain>/components/        ← Tier 2: business views + business sub-components
  products/     ProductCard, ProductGrid, ProductFilters, ProductActions,
                ProductInfo, ProductReviews, ProductFeatureBadges, ProductSortBar,
                RelatedProducts, AddToCartButton,
                AuctionCard, AuctionGrid, AuctionDetailView, BidHistory, PlaceBidForm,
                ProductsView, AuctionsView, ProductDetailView (existing views)
  cart/         CartItemList, CartItemRow, CartSummary, PromoCodeInput,
                CheckoutView, CheckoutAddressStep, CheckoutOrderReview,
                CheckoutSuccessView, OrderSuccessActions, OrderSuccessCard,
                OrderSummaryPanel,
                CartView (existing view)
  blog/         BlogCard, BlogFeaturedCard, BlogCategoryTabs,
                BlogListView, BlogPostView (existing views)
  categories/   CategoryCard, CategoryGrid, CategorySelectorCreate,
                CategoriesListView, CategoryProductsView (existing views)
  reviews/      ReviewCard, ReviewsListView (existing view)
  search/       SearchFiltersRow, SearchResultsSection,
                SearchView (existing view)
  seller/       SellerStorefrontView, SellerAnalyticsStats, SellerPayoutHistoryTable,
                SellerPayoutRequestForm, SellerPayoutStats, SellerRevenueChart,
                SellerTabs, SellerTopProducts, PayoutTableColumns,
                + 15 existing view files
  user/         WishlistButton, UserTabs, AddressCard, AddressForm,
                OrderTrackingView, ProfileHeader, PublicProfileView,
                AccountInfoCard, EmailVerificationCard, PasswordChangeForm,
                PhoneVerificationCard, ProfileInfoForm,
                NotificationItem, NotificationsBulkActions,
                AddressSelectorCreate, NotificationBell,
                + 12 existing view files
  admin/        ProductForm, ProductTableColumns, OrderTableColumns, OrderStatusForm,
                UserTableColumns, UserFilters, UserDetailDrawer,
                CarouselSlideForm, CarouselTableColumns,
                CategoryForm, CategoryTableColumns,
                BlogForm, BlogTableColumns,
                SectionForm, SectionTableColumns,
                ReviewDetailView, ReviewTableColumns,
                FaqForm, FaqTableColumns,
                CouponForm, CouponTableColumns,
                BidTableColumns,
                SiteBasicInfoForm, SiteContactForm, SiteSocialLinksForm,
                PayoutStatusForm, PayoutTableColumns,
                QuickActionsGrid, AdminTabs, AdminSessionsManager, SessionTableColumns,
                + 18 existing view files
  homepage/     HeroCarousel, FeaturedProductsSection, FeaturedAuctionsSection,
     (NEW)      TopCategoriesSection, CustomerReviewsSection, BlogArticlesSection,
                FAQSection, WelcomeSection, WhatsAppCommunitySection,
                AdvertisementBanner, SectionCarousel, SiteFeaturesSection,
                TrustFeaturesSection, TrustIndicatorsSection, HomepageSkeleton
  faq/          FAQPageContent, FAQAccordion, FAQCategorySidebar, FAQHelpfulButtons,
     (NEW)      FAQSortDropdown, RelatedFAQs, ContactCTA
  contact/      ContactForm, ContactInfoSidebar
     (NEW)
  promotions/   CouponCard, ProductSection
     (NEW)
  about/        AboutView
     (NEW)
  events/       (already complete — no change)
  stores/       (already complete — no change)
  wishlist/     (already complete — no change)
  auth/         (already complete — no change)
```

---

## 3. Classification Criteria

| Classification | Definition | Example |
|----------------|-----------|---------|
| **GENERIC** | No domain types (`*Document`, `*Status`), no domain hooks (`useAuth`, `useAddToCart`, `useProducts`, etc.), no domain services, no domain routes/endpoints. Only React, THEME_CONSTANTS, Tier 1 hooks (`useClickOutside`, `useSwipe`, etc.), and Tier 1 utilities (`formatCurrency`, `cn`, etc.). | `Button`, `Card`, `ListingLayout`, `DataTable` |
| **BUSINESS** | Imports domain schema types, domain hooks, domain services, or domain-specific constants. Tied to LetItRip business logic. | `ProductCard`, `CartSummary`, `AdminOrdersView` |
| **MIXED** | Structurally generic but references site-specific constants (`ROUTES`, `SITE_CONFIG`, `MAIN_NAV_ITEMS`, `TRUST_FEATURES`). No schema types. | `Footer`, `MainNavbar`, `TrustFeaturesSection` |

---

## 4. Current State Inventory

### 4.1 `src/components/` — Full File Count

| Directory | Files | Generic | Business | Mixed |
|-----------|-------|---------|----------|-------|
| `ui/` | 34 | 28 | 4 | 2 |
| `forms/` | 9 | 9 | 0 | 0 |
| `typography/` | 2 | 2 | 0 | 0 |
| `semantic/` | 1 | 1 | 0 | 0 |
| `media/` | 2 | 2 | 0 | 0 |
| `feedback/` | 3 | 3 | 0 | 0 |
| `modals/` | 3 | 3 | 0 | 0 |
| `utility/` | 4 | 4 | 0 | 0 |
| `layout/` | 9 | 4 | 3 | 2 |
| `auth/` | 2 | 2 | 0 | 0 |
| `providers/` | 1 | 1 | 0 | 0 |
| `admin/` (top-level) | 16 | 10 | 4 | 2 |
| `admin/` (sub-dirs) | 32 | 4 | 28 | 0 |
| `products/` | 11 | 1 | 9 | 1 |
| `auctions/` | 5 | 0 | 5 | 0 |
| `blog/` | 3 | 0 | 3 | 0 |
| `cart/` | 4 | 0 | 4 | 0 |
| `checkout/` | 9 | 3 | 4 | 2 |
| `categories/` | 2 | 0 | 2 | 0 |
| `homepage/` | 15 | 1 | 11 | 3 |
| `reviews/` | 1 | 0 | 1 | 0 |
| `seller/` | 9 | 0 | 8 | 1 |
| `search/` | 2 | 0 | 2 | 0 |
| `contact/` | 2 | 0 | 1 | 1 |
| `faq/` | 8 | 1 | 5 | 2 |
| `promotions/` | 2 | 0 | 2 | 0 |
| `about/` | 1 | 0 | 0 | 1 |
| `user/` (all subdirs) | 14 | 2 | 12 | 0 |
| Root files | 6 | 6 | 0 | 0 |
| **TOTAL** | **~200** | **~86** | **~105** | **~14** |

### 4.2 `src/features/` — Existing Components (Already in Place)

These files already live in the correct feature directories. The migration will ADD files alongside these existing views.

| Feature | Existing Components | Count |
|---------|--------------------|-------|
| `admin/` | AdminAnalyticsView, AdminBidsView, AdminBlogView, AdminCarouselView, AdminCategoriesView, AdminCouponsView, AdminEventsView, AdminFaqsView, AdminMediaView, AdminOrdersView, AdminPayoutsView, AdminProductsView, AdminReviewsView, AdminSectionsView, AdminSiteView, AdminStoresView, AdminUsersView, DemoSeedView | 18 |
| `products/` | AuctionsView, ProductDetailView, ProductsView | 3 |
| `seller/` | SellerAddressesView, SellerAuctionsView, SellerCreateProductView, SellerDashboardView, SellerEditProductView, SellerOrdersView, SellerPayoutSettingsView, SellerProductCard, SellerProductsView, SellerQuickActions, SellerRecentListings, SellerShippingView, SellersListView, SellerStatCard, SellerStoreView | 15 |
| `user/` | BecomeSellerView, BuyRipCoinsModal, ChatList, ChatWindow, MessagesView, OrderDetailView, RipCoinsWallet, UserAddressesView, UserEditAddressView, UserNotificationsView, UserOrdersView, UserSettingsView | 12 |
| `auth/` | AuthSocialButtons, ForgotPasswordView, LoginForm, RegisterForm, ResetPasswordView, VerifyEmailView | 6 |
| `cart/` | CartView | 1 |
| `search/` | SearchView | 1 |
| `blog/` | BlogListView, BlogPostView | 2 |
| `categories/` | CategoriesListView, CategoryProductsView | 2 |
| `events/` | EntryReviewDrawer, EventCard, EventEntriesTable, EventFormDrawer, EventLeaderboard, EventParticipateView, EventsListView, EventsTable, EventStatsBanner, EventStatusBadge, FeedbackEventSection, PollVotingSection, SurveyEventSection, SurveyFieldBuilder, EventTypeConfig/ | 15+ |
| `stores/` | StoreAboutView, StoreAuctionsView, StoreCard, StoreHeader, StoreNavTabs, StoreProductsView, StoreReviewsView, StoresListView | 8 |
| `reviews/` | ReviewsListView | 1 |
| `wishlist/` | WishlistView | 1 |

### 4.3 Orphan / Empty Files to Delete Immediately

These empty files in `src/components/admin/` are leftover shells:

| File | Size | Action |
|------|------|--------|
| `src/components/admin/UserFilters.tsx` | 0 bytes | DELETE |
| `src/components/admin/FaqForm.tsx` | 0 bytes | DELETE |
| `src/components/admin/PayoutStatusForm.tsx` | 0 bytes | DELETE |

---

## 5. Classification Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **GENERIC** | ~86 | No change — already correct in `src/components/` |
| **BUSINESS** | ~105 | Move to `src/features/<domain>/components/` |
| **MIXED** | ~14 | Genericize (accept data via props) or move to features |

---

## 6. Already Generic — No Action Needed

These files stay exactly where they are. They import ONLY React, THEME_CONSTANTS, Tier 1 hooks, and Tier 1 utilities.

### `src/components/forms/` (9 files) ✅
Checkbox, Form, Input, Radio, Select, Slider, Textarea, Toggle + index.ts

### `src/components/typography/` (2 files) ✅
Typography (Heading, Text, Caption, Label, Span), TextLink

### `src/components/semantic/` (1 file) ✅
Semantic (Section, Article, Main, Aside, Nav, BlockHeader, BlockFooter, Ul, Ol, Li)

### `src/components/media/` (2 files) ✅
MediaImage, MediaVideo

### `src/components/feedback/` (3 files) ✅
Alert, Modal, Toast

### `src/components/modals/` (3 files) ✅
ConfirmDeleteModal, ImageCropModal, UnsavedChangesModal

### `src/components/utility/` (4 files) ✅
BackToTop, BackgroundRenderer, ResponsiveView, Search

### `src/components/ui/` (28 of 34 files) ✅
- Accordion, ActiveFilterChips, Avatar, Badge, BulkActionBar, Button, Card, Divider, Dropdown, EmptyState, FilterDrawer, FilterFacetSection, HorizontalScroller, ImageGallery, ListingLayout, Menu, Pagination, Progress, SectionTabs, SideDrawer, Skeleton, SkipToMain, SortDropdown, Spinner, StatusBadge, TablePagination, Tabs, Tooltip
- Also generic: useHorizontalAutoScroll.ts, useHorizontalScrollDrag.ts

### `src/components/admin/` top-level generics ✅
- AdminFilterBar, AdminPageHeader, AdminStatsCards, DataTable, DrawerFormFooter, RichTextEditor, GridEditor, CategoryTreeView, BackgroundSettings
- admin/dashboard/AdminDashboardSkeleton, RecentActivityCard
- admin/reviews/ReviewStars
- admin/media/MediaTableColumns, MediaOperationForm

### `src/components/auth/` (infrastructure — stays Tier 1) ✅
- ProtectedRoute, RoleGate — these are auth infrastructure used across ALL features, not domain business logic

### `src/components/providers/` (infrastructure — stays Tier 1) ✅
- MonitoringProvider

### Root-level generics ✅
- ErrorBoundary, FormField, PasswordStrengthIndicator, AvatarUpload, AvatarDisplay, LayoutClient, ZodSetup

### Misc generics inside business directories ✅ (will be extracted)
- checkout/CheckoutStepper → extract to `ui/StepperNav`
- checkout/OrderSuccessHero → extract to `ui/` or keep co-located
- homepage/HomepageSkeleton → extract to `ui/` or move with feature
- faq/FAQSearchBar → uses `Search` component, can be deleted (use `Search` directly)
- products/ProductImageGallery → duplicate of `ui/ImageGallery`, delete
- user/notifications/NotificationsBulkActions → extract to `ui/BulkActionBar` variant or keep

---

## 7. Business Components — Must Be Moved

### 7.1 `src/components/products/` → `src/features/products/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **ProductCard.tsx** | Imports `ProductDocument`, `useWishlistToggle`, `useAddToCart` | MOVE |
| **ProductGrid.tsx** | Imports `ProductDocument`, renders `ProductCard` | MOVE |
| **ProductFilters.tsx** | Imports `CategoryDocument` | MOVE |
| **ProductActions.tsx** | Imports `ProductDocument`, `useAddToCart`, `useWishlistToggle`, `useAuth` | MOVE |
| **ProductInfo.tsx** | Imports `ProductDocument` | MOVE |
| **ProductReviews.tsx** | Imports `ReviewDocument`, `reviewService` | MOVE |
| **ProductSortBar.tsx** | Imports `ProductSortValue` domain type | MOVE |
| **ProductFeatureBadges.tsx** | Imports `ProductDocument` | MOVE |
| **RelatedProducts.tsx** | Imports `useRelatedProducts` domain hook | MOVE |
| **AddToCartButton.tsx** | Imports `useAddToCart` domain hook | MOVE |
| **ProductImageGallery.tsx** | GENERIC but duplicate of `ui/ImageGallery` | DELETE (use `ImageGallery`) |

**Result**: Delete `src/components/products/` entirely.

### 7.2 `src/components/auctions/` → `src/features/products/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **AuctionCard.tsx** | Imports `ProductDocument`, `BidDocument`, `useCountdown`, `useWishlistToggle` | MOVE |
| **AuctionGrid.tsx** | Imports `ProductDocument`, `BidDocument` | MOVE |
| **AuctionDetailView.tsx** | Imports `ProductDocument`, `BidDocument` — full view | MOVE |
| **BidHistory.tsx** | Imports `BidDocument` | MOVE |
| **PlaceBidForm.tsx** | Imports `usePlaceBid` domain hook | MOVE |

**Result**: Delete `src/components/auctions/` entirely.

### 7.3 `src/components/blog/` → `src/features/blog/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **BlogCard.tsx** | Imports `BlogPostDocument` | MOVE |
| **BlogCategoryTabs.tsx** | Imports `BlogPostCategory` | MOVE |
| **BlogFeaturedCard.tsx** | Imports `BlogPostDocument` | MOVE |

**Result**: Delete `src/components/blog/` entirely.

### 7.4 `src/components/cart/` → `src/features/cart/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **CartItemList.tsx** | Imports `CartItemDocument` | MOVE |
| **CartItemRow.tsx** | Imports `CartItemDocument` | MOVE |
| **CartSummary.tsx** | Imports `CartItemDocument` | MOVE |
| **PromoCodeInput.tsx** | Imports `useCouponValidate` | MOVE |

**Result**: Delete `src/components/cart/` entirely.

### 7.5 `src/components/checkout/` → `src/features/cart/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **CheckoutView.tsx** | Imports `useCheckout`, `useRazorpay`, `useSiteSettings`, `SiteSettingsDocument` | MOVE |
| **CheckoutAddressStep.tsx** | Imports `AddressDocument`, `CartItemDocument` | MOVE |
| **CheckoutOrderReview.tsx** | Imports `CartItemDocument` | MOVE |
| **CheckoutSuccessView.tsx** | Imports `OrderDocument` | MOVE |
| **OrderSuccessActions.tsx** | Uses `ROUTES.USER.ORDER_DETAIL` (domain routes) | MOVE |
| **OrderSuccessCard.tsx** | Imports `OrderDocument` | MOVE |
| **OrderSummaryPanel.tsx** | Cart-specific layout, uses `formatCurrency` on cart items | MOVE |
| **CheckoutStepper.tsx** | Already GENERIC | EXTRACT to `src/components/ui/StepperNav.tsx` (rename) |
| **OrderSuccessHero.tsx** | Already GENERIC (only THEME_CONSTANTS + Typography) | EXTRACT if reusable, else move with group |

**Result**: Delete `src/components/checkout/` entirely. Generic bits extracted first.

### 7.6 `src/components/categories/` → `src/features/categories/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **CategoryCard.tsx** | Imports `CategoryDocument` | MOVE |
| **CategoryGrid.tsx** | Imports `CategoryDocument` | MOVE |

**Result**: Delete `src/components/categories/` entirely.

### 7.7 `src/components/homepage/` → `src/features/homepage/components/` (NEW feature)

| File | Reason | Strategy |
|------|--------|----------|
| **HeroCarousel.tsx** | Imports `CarouselSlideDocument`, `useHeroCarousel` | MOVE |
| **FeaturedProductsSection.tsx** | Imports `useFeaturedProducts`, renders `ProductCard` | MOVE |
| **FeaturedAuctionsSection.tsx** | Imports `useFeaturedAuctions` | MOVE |
| **TopCategoriesSection.tsx** | Imports `useTopCategories` | MOVE |
| **CustomerReviewsSection.tsx** | Imports `useHomepageReviews` | MOVE |
| **BlogArticlesSection.tsx** | Imports `blogService`, `BlogPostDocument` | MOVE |
| **FAQSection.tsx** | Imports `useHomepageSections` | MOVE |
| **WelcomeSection.tsx** | Imports `useHomepageSections` | MOVE |
| **WhatsAppCommunitySection.tsx** | Imports `useHomepageSections` | MOVE |
| **AdvertisementBanner.tsx** | Imports `BannerSectionConfig` | MOVE |
| **SectionCarousel.tsx** | Imports `ProductDocument` | MOVE |
| **SiteFeaturesSection.tsx** | MIXED — imports `SITE_FEATURES` constant | MOVE (page composition) |
| **TrustFeaturesSection.tsx** | MIXED — imports `TRUST_FEATURES` constant | MOVE (page composition) |
| **TrustIndicatorsSection.tsx** | MIXED — imports `TRUST_INDICATORS` constant | MOVE (page composition) |
| **HomepageSkeleton.tsx** | GENERIC — only `THEME_CONSTANTS` + `Section` | MOVE with group |

**Result**: Delete `src/components/homepage/` entirely. Create `src/features/homepage/`.

### 7.8 `src/components/reviews/` → `src/features/reviews/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **ReviewCard.tsx** | Imports `ReviewDocument` | MOVE |

**Result**: Delete `src/components/reviews/` entirely.

### 7.9 `src/components/seller/` → `src/features/seller/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **SellerStorefrontView.tsx** | Imports `UserDocument`, `ProductDocument` | MOVE |
| **SellerAnalyticsStats.tsx** | Seller-specific analytics rendering | MOVE |
| **SellerPayoutHistoryTable.tsx** | Payout domain data | MOVE |
| **SellerPayoutRequestForm.tsx** | Payout domain form | MOVE |
| **SellerPayoutStats.tsx** | Imports `PayoutSummary` type | MOVE |
| **SellerRevenueChart.tsx** | Revenue domain data | MOVE |
| **SellerTabs.tsx** | Imports `ROUTES` (seller-specific routes) | MOVE |
| **SellerTopProducts.tsx** | Product domain data | MOVE |
| **PayoutTableColumns.tsx** | Payout domain column defs | MOVE |

**Result**: Delete `src/components/seller/` entirely.

### 7.10 `src/components/search/` → `src/features/search/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **SearchFiltersRow.tsx** | Imports `CategoryDocument` | MOVE |
| **SearchResultsSection.tsx** | Imports `ProductDocument`, renders `ProductGrid` | MOVE |

**Result**: Delete `src/components/search/` entirely.

### 7.11 `src/components/contact/` → `src/features/contact/components/` (NEW feature)

| File | Reason | Strategy |
|------|--------|----------|
| **ContactForm.tsx** | Imports `useContactSubmit` domain hook | MOVE |
| **ContactInfoSidebar.tsx** | MIXED — imports `SITE_CONFIG` | MOVE (page composition) |

**Result**: Delete `src/components/contact/`. Create `src/features/contact/`.

### 7.12 `src/components/faq/` → `src/features/faq/components/` (NEW feature)

| File | Reason | Strategy |
|------|--------|----------|
| **FAQPageContent.tsx** | Imports `FAQDocument`, `useFaqVote` | MOVE |
| **FAQAccordion.tsx** | Imports `StaticFAQItem` domain type | MOVE |
| **FAQCategorySidebar.tsx** | Imports `FAQCategoryKey` | MOVE |
| **FAQHelpfulButtons.tsx** | Imports `useFaqVote` domain hook | MOVE |
| **FAQSortDropdown.tsx** | MIXED — `FAQSortOption` domain type | MOVE |
| **RelatedFAQs.tsx** | Imports `FAQDocument` | MOVE |
| **ContactCTA.tsx** | MIXED — imports `ROUTES.CONTACT` | MOVE |
| **FAQSearchBar.tsx** | GENERIC — just wraps `Search` component | DELETE (use `Search` directly) |

**Result**: Delete `src/components/faq/`. Create `src/features/faq/`.

### 7.13 `src/components/promotions/` → `src/features/promotions/components/` (NEW feature)

| File | Reason | Strategy |
|------|--------|----------|
| **CouponCard.tsx** | Imports `CouponDocument` | MOVE |
| **ProductSection.tsx** | Imports `ProductDocument` | MOVE |

**Result**: Delete `src/components/promotions/`. Create `src/features/promotions/`.

### 7.14 `src/components/about/` → `src/features/about/components/` (NEW feature)

| File | Reason | Strategy |
|------|--------|----------|
| **AboutView.tsx** | MIXED — page-specific composition. Uses `ROUTES`, site-specific content. Already a view. | MOVE |

**Result**: Delete `src/components/about/`. Create `src/features/about/`.

### 7.15 `src/components/user/` → `src/features/user/components/`

| File | Reason | Strategy |
|------|--------|----------|
| **WishlistButton.tsx** | Imports `useWishlistToggle`, `useAuth` | MOVE |
| **UserTabs.tsx** | Imports `useAuth`, `ROUTES` | MOVE |
| **addresses/AddressCard.tsx** | Imports `AddressDocument` | MOVE |
| **addresses/AddressForm.tsx** | Address domain form fields | MOVE |
| **orders/OrderTrackingView.tsx** | Imports `OrderDocument`, `OrderStatus` | MOVE |
| **profile/ProfileHeader.tsx** | Imports `UserRole` from `@/types/auth` | MOVE |
| **profile/ProfileStatsGrid.tsx** | Interface hardcodes `{ orders, wishlist, addresses }` — domain shape | MOVE (see §9 for generic extraction) |
| **profile/PublicProfileView.tsx** | Imports `UserDocument`, `ProductDocument` | MOVE |
| **settings/AccountInfoCard.tsx** | Imports `useAuth` | MOVE |
| **settings/EmailVerificationCard.tsx** | Imports `useApiMutation`, `API_ENDPOINTS` | MOVE |
| **settings/PasswordChangeForm.tsx** | Imports `useApiMutation`, `API_ENDPOINTS`, `calculatePasswordStrength` | MOVE |
| **settings/PhoneVerificationCard.tsx** | Imports `useApiMutation`, `API_ENDPOINTS` | MOVE |
| **settings/ProfileInfoForm.tsx** | Imports `useAuth`, `useProfile` | MOVE |
| **notifications/NotificationItem.tsx** | Imports `NotificationDocument` | MOVE |
| **notifications/NotificationsBulkActions.tsx** | GENERIC in imports but user-notification-specific in intent | MOVE with group |

**Result**: Delete business files from `src/components/user/`. Move to `src/features/user/components/`.

### 7.16 `src/components/admin/` sub-directories → `src/features/admin/components/`

All admin sub-directory files are BUSINESS — they import domain schema types. They should live alongside their existing admin views in `src/features/admin/components/`.

| Sub-directory | Files to Move |
|---------------|--------------|
| **products/** | ProductForm, ProductTableColumns, types.ts |
| **orders/** | OrderTableColumns, OrderStatusForm |
| **users/** | UserTableColumns, UserFilters, UserDetailDrawer, types.ts |
| **carousel/** | CarouselSlideForm, CarouselTableColumns, types.ts |
| **categories/** | CategoryForm, CategoryTableColumns, types.ts |
| **blog/** | BlogForm, BlogTableColumns |
| **sections/** | SectionForm, SectionTableColumns, types.ts |
| **reviews/** | ReviewDetailView, ReviewTableColumns, types.ts (keep ReviewStars as generic) |
| **faqs/** | FaqForm, FaqTableColumns, types.ts |
| **coupons/** | CouponForm, CouponTableColumns |
| **bids/** | BidTableColumns |
| **site/** | SiteBasicInfoForm, SiteContactForm, SiteSocialLinksForm |
| **payouts/** | PayoutStatusForm, PayoutTableColumns |
| **dashboard/** | QuickActionsGrid (MIXED — uses `ROUTES`) |
| **top-level** | AdminTabs, AdminSessionsManager, SessionTableColumns |

**Also move from `ui/`:**
| File | Destination | Reason |
|------|------------|--------|
| `ui/AddressSelectorCreate.tsx` | `features/user/components/` | Imports `useAddressSelector`, `AddressFormData` |
| `ui/CategorySelectorCreate.tsx` | `features/categories/components/` | Imports `useCategories`, `useCreateCategory` |
| `ui/EventBanner.tsx` | `features/events/components/` | Imports `usePublicEvents` |
| `ui/NotificationBell.tsx` | `features/user/components/` | Imports `useNotifications`, `NotificationDocument` |

**RoleBadge decision:** Currently imports `UserRole` from `@/types/auth`. **Genericize** to accept `string` variant + color map via props. Stays in `ui/` as a generic badge variant.

**ImageUpload / MediaUploadField decision:** Currently import `useMediaUpload` hook. **Genericize** to accept an `onUpload: (file: File) => Promise<string>` callback prop instead of coupling to the media hook. Business callers pass `useMediaUpload().upload` as the prop value.

**Result**: Admin sub-directories deleted from `src/components/admin/`. Only generic admin layout primitives remain.

### 7.17 `src/components/layout/` — Must Be Split

| File | Current | Strategy |
|------|---------|----------|
| **BottomNavbar.tsx** | BUSINESS — imports `useAuth`, `ROUTES`, `SITE_CONFIG` | SPLIT: extract generic `BottomNavLayout` (items + active state via props). Business config moves to `LayoutClient`. |
| **Sidebar.tsx** | BUSINESS — imports `useAuth`, `useLogout`, `hasAnyRole`, `MAIN_NAV_ITEMS` | SPLIT: extract generic `SidebarLayout` (items, user slot, logo via props). Auth injected via props. |
| **TitleBar.tsx** | BUSINESS — imports `useAuth`, `SITE_CONFIG` | SPLIT: extract generic `TitleBarLayout` (brandName, user slot via props). |
| **Footer.tsx** | MIXED — imports `SITE_CONFIG`, `ROUTES` | SPLIT: extract generic `FooterLayout` (link groups, brand info via props). Config from `LayoutClient`. |
| **MainNavbar.tsx** | MIXED — imports `MAIN_NAV_ITEMS` | SPLIT: extract generic `NavbarLayout` (items via props). Config from `LayoutClient`. |
| **Breadcrumbs.tsx** | GENERIC ✅ | Stay |
| **AutoBreadcrumbs.tsx** | GENERIC ✅ | Stay |
| **NavItem.tsx** | GENERIC ✅ | Stay |
| **LocaleSwitcher.tsx** | GENERIC ✅ | Stay |

---

## 8. Mixed Components — Need Cleanup

These files reference site-specific constants (`ROUTES`, `SITE_CONFIG`, `TRUST_FEATURES`) without importing schema types.

### Decision Framework

| Component Category | Decision | Rationale |
|-------------------|----------|-----------|
| **Layout chrome** (Footer, Navbar, Sidebar, TitleBar, BottomNav) | **GENERICIZE** — accept data via props | These render on every page. Making them accept items, brand, user via props makes them truly reusable. `LayoutClient` injects the site-specific config. |
| **Page sections** (SiteFeaturesSection, TrustFeaturesSection, TrustIndicatorsSection, AboutView) | **MOVE to features** | These are page-specific compositions. They don't render on every page — they render on exactly one page. They belong in the feature they serve. |
| **Route-aware components** (OrderSuccessActions, ContactCTA, FAQSortDropdown, SellerTabs, QuickActionsGrid, AdminTabs) | **MOVE to features** | Using `ROUTES.*` makes them navigation-aware which is fine for Tier 1, but these components serve a single domain. They are domain compositions, not shared primitives. |

---

## 9. New Generic Primitives to Extract

Before moving business components, check if they contain reusable UI patterns that should become new Tier 1 generics.

| New Generic | Source | Location | Props Pattern |
|-------------|--------|----------|---------------|
| **`StepperNav`** | `checkout/CheckoutStepper` | `ui/StepperNav.tsx` | `steps: { number, label }[], currentStep: number` |
| **`StatsGrid`** | `user/profile/ProfileStatsGrid` | `ui/StatsGrid.tsx` | `stats: { label: string, value: number, icon: ReactNode, colorClass?: string }[]` — fully dynamic, no hardcoded field names |
| **`RatingDisplay`** | `admin/reviews/ReviewStars` | `ui/RatingDisplay.tsx` | `rating: number, size?: 'sm' \| 'md' \| 'lg'` — renamed for clarity (already generic internally) |
| **`CountdownDisplay`** | `AuctionCard` countdown logic | `ui/CountdownDisplay.tsx` | `targetDate: Date, format?: 'dhms' \| 'hms' \| 'auto'` — renders `useCountdown` output visually |
| **`PriceDisplay`** | `ProductCard` price rendering | `ui/PriceDisplay.tsx` | `amount: number, currency?: string, originalAmount?: number, variant?: 'compact' \| 'detail'` — handles formatting, strikethrough, discount badge |
| **`ItemRow`** | `cart/CartItemRow` layout | `ui/ItemRow.tsx` | `image: string, title: string, subtitle?: string, rightSlot: ReactNode, actions?: ReactNode` — horizontal image + text + actions row |
| **`SummaryCard`** | `cart/CartSummary` layout | `ui/SummaryCard.tsx` | `lines: { label, value }[], total: { label, value }, action?: ReactNode` — order/invoice summary pattern |

### Genericize Existing Components

| Component | Current Issue | Fix |
|-----------|---------------|-----|
| **`ui/RoleBadge`** | Imports `UserRole` from `@/types/auth` | Change prop to `role: string`, define color map internally for common values or accept `colorMap?: Record<string, string>`. |
| **`admin/ImageUpload`** | Imports `useMediaUpload` hook | Change to accept `onUpload: (file: File) => Promise<string>` callback. Callers pass `useMediaUpload().upload`. |
| **`admin/MediaUploadField`** | Same — imports `useMediaUpload` | Same fix. |

---

## 10. Migration Strategy Per Domain

For each domain, follow this exact sequence:

### Step 1: Identify Generic Extractables
Scan the business component for any reusable UI pattern (see §9). If found, extract the generic first.

### Step 2: Extract Generic Primitive
Create the new generic component in `src/components/ui/`. Export from `src/components/ui/index.ts` and `src/components/index.ts`.

### Step 3: Move Business Files to Feature
Move each file to `src/features/<domain>/components/`. Update internal imports to use the new generic primitive where applicable.

### Step 4: Update Feature Barrel
Add exports to `src/features/<domain>/components/index.ts` (create if needed) and `src/features/<domain>/index.ts`.

### Step 5: Update All Importers
Find all files that import the moved component from `@/components` and update to import from `@/features/<domain>`.

```bash
# Find all importers of a moved component
grep -rn "from '@/components'" src/ --include="*.tsx" --include="*.ts" | grep "ProductCard"
```

### Step 6: Remove Export from Components Barrel
Remove the moved export from `src/components/<domain>/index.ts`. Once the directory is empty, delete the directory and remove `export * from "./<domain>"` from `src/components/index.ts`.

### Step 7: Update Index Files
- Remove barrel export from `src/components/index.ts`
- Ensure `src/features/<domain>/index.ts` re-exports everything needed
- Feature views already import their sub-components from relative paths, so most existing import chains are internal

### Step 8: Verify
```bash
npx tsc --noEmit src/features/<domain>/    # type-check the moved files
npx tsc --noEmit                            # full check
npm run build                               # production build
npm test -- --testPathPattern=<domain>       # run relevant tests
```

---

## 11. Execution Phases

### Phase 0: Cleanup (Immediate)
- Delete 3 orphan empty files in `src/components/admin/`
- Delete duplicate `ProductImageGallery` (use `ui/ImageGallery`)
- Delete unnecessary `FAQSearchBar` wrapper (use `Search` directly)

### Phase 1: Create New Generic Primitives
Extract ~7 new generic components before moving anything (see §9):
1. `StepperNav` from `CheckoutStepper`
2. `StatsGrid` from `ProfileStatsGrid`
3. `RatingDisplay` from `ReviewStars` (rename)
4. `CountdownDisplay` (new, from `AuctionCard` pattern)
5. `PriceDisplay` (new, from `ProductCard` pattern)
6. `ItemRow` from `CartItemRow` layout pattern
7. `SummaryCard` from `CartSummary` layout pattern

Genericize 3 existing:
1. `RoleBadge` → drop `UserRole` import
2. `ImageUpload` → accept upload handler via props
3. `MediaUploadField` → accept upload handler via props

### Phase 2: Move Domain Component Directories (largest impact)
Move entire business directories. Priority order:

| # | Source | Destination | File Count |
|---|--------|-------------|-----------|
| 1 | `components/admin/**` sub-dirs | `features/admin/components/` | ~32 |
| 2 | `components/products/` | `features/products/components/` | 10 |
| 3 | `components/auctions/` | `features/products/components/` | 5 |
| 4 | `components/user/**` | `features/user/components/` | ~14 |
| 5 | `components/seller/` | `features/seller/components/` | 9 |
| 6 | `components/cart/` + `components/checkout/` | `features/cart/components/` | ~11 |
| 7 | `components/blog/` | `features/blog/components/` | 3 |
| 8 | `components/categories/` | `features/categories/components/` | 2 |
| 9 | `components/reviews/` | `features/reviews/components/` | 1 |
| 10 | `components/search/` | `features/search/components/` | 2 |
| 11 | `components/homepage/` | `features/homepage/components/` (NEW) | 15 |
| 12 | `components/faq/` | `features/faq/components/` (NEW) | 7 |
| 13 | `components/contact/` | `features/contact/components/` (NEW) | 2 |
| 14 | `components/promotions/` | `features/promotions/components/` (NEW) | 2 |
| 15 | `components/about/` | `features/about/components/` (NEW) | 1 |

### Phase 3: Move Misplaced UI Components
| Source | Destination |
|--------|-------------|
| `ui/AddressSelectorCreate` | `features/user/components/` |
| `ui/CategorySelectorCreate` | `features/categories/components/` |
| `ui/EventBanner` | `features/events/components/` |
| `ui/NotificationBell` | `features/user/components/` |

### Phase 4: Genericize Layout Components
Split 5 layout files into generic + config:
1. `BottomNavbar` → `BottomNavLayout` (generic) + config in `LayoutClient`
2. `Sidebar` → `SidebarLayout` (generic) + config in `LayoutClient`
3. `TitleBar` → `TitleBarLayout` (generic) + config in `LayoutClient`
4. `Footer` → `FooterLayout` (generic) + config in `LayoutClient`
5. `MainNavbar` → `NavbarLayout` (generic) + config in `LayoutClient`

### Phase 5: Clean Up Barrel Exports
- Remove all domain re-exports from `src/components/index.ts`:
  ```diff
  - export * from "./products";
  - export * from "./cart";
  - export * from "./checkout";
  - export * from "./categories";
  - export * from "./auctions";
  - export * from "./seller";
  - export * from "./blog";
  - export * from "./reviews";
  - export * from "./promotions";
  - export * from "./contact";
  - export * from "./search";
  - export * from "./faq";
  - export * from "./homepage";
  - export * from "./about";
  ```
- Remove domain sub-dir re-exports from `src/components/admin/index.ts`
- Remove domain re-exports from `src/components/user/index.ts`
- Ensure each feature's `index.ts` exports its components

### Phase 6: Full Verification
```bash
npx tsc --noEmit          # 0 errors
npm run build             # 0 errors
npm test                  # all pass
```

---

## 12. Tracking Checklist

Track each domain migration as it proceeds. Mark ✅ when complete.

### Phase 0: Cleanup
| Task | Status |
|------|--------|
| Delete `admin/UserFilters.tsx` (empty) | ☐ |
| Delete `admin/FaqForm.tsx` (empty) | ☐ |
| Delete `admin/PayoutStatusForm.tsx` (empty) | ☐ |
| Delete `products/ProductImageGallery.tsx` (dup of `ui/ImageGallery`) | ☐ |
| Delete `faq/FAQSearchBar.tsx` (unnecessary wrapper) | ☐ |

### Phase 1: New Generics
| Generic | Extracted From | Status |
|---------|---------------|--------|
| `ui/StepperNav` | `checkout/CheckoutStepper` | ☐ |
| `ui/StatsGrid` | `user/profile/ProfileStatsGrid` | ☐ |
| `ui/RatingDisplay` | `admin/reviews/ReviewStars` | ☐ |
| `ui/CountdownDisplay` | `AuctionCard` pattern | ☐ |
| `ui/PriceDisplay` | `ProductCard` pattern | ☐ |
| `ui/ItemRow` | `cart/CartItemRow` pattern | ☐ |
| `ui/SummaryCard` | `cart/CartSummary` pattern | ☐ |
| Genericize `RoleBadge` | Drop `UserRole` import | ☐ |
| Genericize `ImageUpload` | Accept handler prop | ☐ |
| Genericize `MediaUploadField` | Accept handler prop | ☐ |

### Phase 2: Move Business Directories
| Domain | Generic Extract | Move Files | Update Imports | Delete Source | Verified |
|--------|----------------|------------|----------------|---------------|----------|
| admin sub-dirs | — | ☐ | ☐ | ☐ | ☐ |
| products | ☐ PriceDisplay | ☐ | ☐ | ☐ | ☐ |
| auctions | ☐ CountdownDisplay | ☐ | ☐ | ☐ | ☐ |
| user | ☐ StatsGrid | ☐ | ☐ | ☐ | ☐ |
| seller | — | ☐ | ☐ | ☐ | ☐ |
| cart + checkout | ☐ StepperNav, ItemRow, SummaryCard | ☐ | ☐ | ☐ | ☐ |
| blog | — | ☐ | ☐ | ☐ | ☐ |
| categories | — | ☐ | ☐ | ☐ | ☐ |
| reviews | ☐ RatingDisplay | ☐ | ☐ | ☐ | ☐ |
| search | — | ☐ | ☐ | ☐ | ☐ |
| homepage (NEW) | — | ☐ | ☐ | ☐ | ☐ |
| faq (NEW) | — | ☐ | ☐ | ☐ | ☐ |
| contact (NEW) | — | ☐ | ☐ | ☐ | ☐ |
| promotions (NEW) | — | ☐ | ☐ | ☐ | ☐ |
| about (NEW) | — | ☐ | ☐ | ☐ | ☐ |

### Phase 3: Misplaced UI
| File | Destination | Status |
|------|-------------|--------|
| `ui/AddressSelectorCreate` | `features/user/` | ☐ |
| `ui/CategorySelectorCreate` | `features/categories/` | ☐ |
| `ui/EventBanner` | `features/events/` | ☐ |
| `ui/NotificationBell` | `features/user/` | ☐ |

### Phase 4: Layout Genericization
| File | Generic Name | Status |
|------|-------------|--------|
| BottomNavbar | BottomNavLayout | ☐ |
| Sidebar | SidebarLayout | ☐ |
| TitleBar | TitleBarLayout | ☐ |
| Footer | FooterLayout | ☐ |
| MainNavbar | NavbarLayout | ☐ |

### Phase 5: Barrel Cleanup
| Task | Status |
|------|--------|
| Remove domain exports from `components/index.ts` | ☐ |
| Remove admin sub-dir exports from `components/admin/index.ts` | ☐ |
| Remove user sub-dir exports from `components/user/index.ts` | ☐ |
| Verify all feature `index.ts` barrels complete | ☐ |

### Phase 6: Verification
| Task | Status |
|------|--------|
| `npx tsc --noEmit` → 0 errors | ☐ |
| `npm run build` → 0 errors | ☐ |
| `npm test` → all pass | ☐ |

---

## New Feature Directories to Create

| New Feature Dir | Source | Structure Needed |
|----------------|--------|-----------------|
| `src/features/homepage/` | `src/components/homepage/` | `components/`, `hooks/`, `index.ts` |
| `src/features/faq/` | `src/components/faq/` | `components/`, `hooks/`, `index.ts` |
| `src/features/contact/` | `src/components/contact/` | `components/`, `hooks/`, `index.ts` |
| `src/features/promotions/` | `src/components/promotions/` | `components/`, `index.ts` |
| `src/features/about/` | `src/components/about/` | `components/`, `index.ts` |

---

## File Count Impact

| Location | Before | After |
|----------|--------|-------|
| `src/components/` total | ~200 files | ~86 files (only generics) |
| `src/features/` total | ~90 files | ~209 files |
| Net new files | — | ~7 new generics; everything else is a pure move |
| Net deleted files | — | ~5 (empty orphans + duplicates) |

---

## 13. Key Principles

1. **Generic = no domain types, no domain hooks, no domain services, no domain routes.** Only React, THEME_CONSTANTS, Tier 1 hooks (`useClickOutside`, `useKeyPress`, `useSwipe`, etc.), and Tier 1 utilities (`formatCurrency`, `formatDate`, `cn`, etc.).

2. **Business = knows about the business domain.** Imports `*Document` types, domain hooks (`useAddToCart`, `usePlaceBid`, etc.), or domain services. These live in `src/features/`.

3. **Split when both exist.** If a business component contains a genuinely reusable UI pattern, extract the pattern as a new generic, then have the business component use it.

4. **Features compose generics.** Views in `src/features/` import from `@/components` (generics only) and compose them with domain data. They never import from other features.

5. **Pages compose features.** `src/app/` pages are thin shells that render a single feature view.

6. **One direction of dependency.** `Page → Feature → Generic`. Never backward. Never cross-feature.

7. **Every `@/components` import must resolve to a generic.** After this refactor, if you see `import { X } from '@/components'` in any file, `X` must be domain-agnostic. Domain-specific imports go through `@/features/<domain>`.

---

## Import Path Changes Cheat Sheet

After migration, update import paths in consuming files:

```tsx
// BEFORE — domain component from @/components
import { ProductCard, ProductGrid } from '@/components';
import { CartSummary, CartItemRow } from '@/components';
import { BlogCard } from '@/components';
import { CategoryCard } from '@/components';
import { AuctionCard } from '@/components';

// AFTER — domain component from @/features/<domain>
import { ProductCard, ProductGrid } from '@/features/products';
import { CartSummary, CartItemRow } from '@/features/cart';
import { BlogCard } from '@/features/blog';
import { CategoryCard } from '@/features/categories';
import { AuctionCard } from '@/features/products'; // auctions are part of products feature

// UNCHANGED — generic primitives still from @/components
import { Button, Card, Badge, DataTable, ListingLayout } from '@/components';
import { Heading, Text, Caption } from '@/components';
import { Section, Nav, Ul, Li } from '@/components';
import { Alert, Modal, Toast } from '@/components';
import { AdminPageHeader, AdminFilterBar, DrawerFormFooter } from '@/components';
import { Search, SortDropdown, FilterFacetSection } from '@/components';
```

---

## Detailed File-Level Classification

### Full classification of every file in `src/components/`

<details>
<summary><b>src/components/ui/ (34 files)</b></summary>

| File | Class | Reason |
|------|-------|--------|
| Accordion.tsx | GENERIC | Only THEME_CONSTANTS + React state |
| ActiveFilterChips.tsx | GENERIC | Only THEME_CONSTANTS + generic UI |
| AddressSelectorCreate.tsx | **BUSINESS** | Imports `useAddressSelector`, `AddressFormData` → move to `features/user/` |
| Avatar.tsx | GENERIC | Only Image + THEME_CONSTANTS |
| Badge.tsx | GENERIC | Only THEME_CONSTANTS |
| BulkActionBar.tsx | GENERIC | Only THEME_CONSTANTS + generic UI |
| Button.tsx | GENERIC | Only React + `classNames` |
| Card.tsx | GENERIC | Only THEME_CONSTANTS |
| CategorySelectorCreate.tsx | **BUSINESS** | Imports `useCategories`, `useCreateCategory` → move to `features/categories/` |
| Divider.tsx | GENERIC | Only THEME_CONSTANTS |
| Dropdown.tsx | GENERIC | Only React + `useClickOutside` |
| EmptyState.tsx | GENERIC | Only THEME_CONSTANTS + generic UI |
| EventBanner.tsx | **BUSINESS** | Imports `usePublicEvents` → move to `features/events/` |
| FilterDrawer.tsx | GENERIC | Only THEME_CONSTANTS + generic UI |
| FilterFacetSection.tsx | GENERIC | Only THEME_CONSTANTS + `formatNumber` |
| HorizontalScroller.tsx | GENERIC | Only React + THEME_CONSTANTS |
| ImageGallery.tsx | GENERIC | Only `useSwipe`, `useGesture` |
| ListingLayout.tsx | GENERIC | Only THEME_CONSTANTS + generic slots |
| Menu.tsx | GENERIC | Only React + `useClickOutside`, `useKeyPress` |
| NotificationBell.tsx | **BUSINESS** | Imports `useNotifications`, `NotificationDocument` → move to `features/user/` |
| Pagination.tsx | GENERIC | Only THEME_CONSTANTS + generic UI |
| Progress.tsx | GENERIC | Only THEME_CONSTANTS |
| RoleBadge.tsx | **MIXED** | Imports `UserRole` — genericize to accept `string` |
| SectionTabs.tsx | GENERIC | Only THEME_CONSTANTS + Link |
| SideDrawer.tsx | GENERIC | Only React + `preventBodyScroll` |
| Skeleton.tsx | GENERIC | Only THEME_CONSTANTS |
| SkipToMain.tsx | GENERIC | Only React |
| SortDropdown.tsx | GENERIC | Only THEME_CONSTANTS + generic UI |
| Spinner.tsx | GENERIC | Only THEME_CONSTANTS |
| StatusBadge.tsx | GENERIC | Only imports `Badge` |
| TablePagination.tsx | GENERIC | Only THEME_CONSTANTS + `formatNumber` |
| Tabs.tsx | GENERIC | Only THEME_CONSTANTS |
| Tooltip.tsx | GENERIC | Only React + THEME_CONSTANTS |
| useHorizontalAutoScroll.ts | GENERIC | Pure scroll utility |
| useHorizontalScrollDrag.ts | GENERIC | Pure scroll utility |

</details>

<details>
<summary><b>src/components/admin/ top-level (16 files)</b></summary>

| File | Class | Reason |
|------|-------|--------|
| AdminFilterBar.tsx | GENERIC | Only THEME_CONSTANTS + generic wrapper |
| AdminPageHeader.tsx | GENERIC | Only THEME_CONSTANTS + breadcrumbs |
| AdminStatsCards.tsx | GENERIC | Only THEME_CONSTANTS + `formatNumber` |
| AdminTabs.tsx | **BUSINESS** | Imports `ROUTES` (admin-specific routes) → move |
| AdminSessionsManager.tsx | **BUSINESS** | Session management domain → move |
| BackgroundSettings.tsx | GENERIC | Only React + Image + THEME_CONSTANTS |
| CategoryTreeView.tsx | GENERIC | Only THEME_CONSTANTS + `classNames` |
| DataTable.tsx | GENERIC | Only THEME_CONSTANTS + generic table |
| DrawerFormFooter.tsx | GENERIC | Only generic UI components |
| FaqForm.tsx | **EMPTY** | 0 bytes → DELETE |
| GridEditor.tsx | GENERIC | Only generic UI + THEME_CONSTANTS |
| ImageUpload.tsx | **MIXED** | Imports `useMediaUpload` → genericize |
| MediaUploadField.tsx | **MIXED** | Imports `useMediaUpload` → genericize |
| PayoutStatusForm.tsx | **EMPTY** | 0 bytes → DELETE |
| RichTextEditor.tsx | GENERIC | Only TipTap + THEME_CONSTANTS |
| SessionTableColumns.tsx | **BUSINESS** | Imports `SessionDocument` → move |
| UserFilters.tsx | **EMPTY** | 0 bytes → DELETE |

</details>

<details>
<summary><b>src/components/admin/ sub-directories (32 files)</b></summary>

| Dir / File | Class | Action |
|------------|-------|--------|
| products/ProductForm.tsx | BUSINESS | MOVE |
| products/ProductTableColumns.tsx | BUSINESS | MOVE |
| products/types.ts | BUSINESS | MOVE |
| orders/OrderTableColumns.tsx | BUSINESS | MOVE |
| orders/OrderStatusForm.tsx | BUSINESS | MOVE |
| users/UserTableColumns.tsx | BUSINESS | MOVE |
| users/UserFilters.tsx | BUSINESS | MOVE |
| users/UserDetailDrawer.tsx | BUSINESS | MOVE |
| users/types.ts | BUSINESS | MOVE |
| carousel/CarouselSlideForm.tsx | BUSINESS | MOVE |
| carousel/CarouselTableColumns.tsx | BUSINESS | MOVE |
| carousel/types.ts | BUSINESS | MOVE |
| categories/CategoryForm.tsx | BUSINESS | MOVE |
| categories/CategoryTableColumns.tsx | BUSINESS | MOVE |
| categories/types.ts | BUSINESS | MOVE |
| blog/BlogForm.tsx | BUSINESS | MOVE |
| blog/BlogTableColumns.tsx | BUSINESS | MOVE |
| sections/SectionForm.tsx | BUSINESS | MOVE |
| sections/SectionTableColumns.tsx | BUSINESS | MOVE |
| sections/types.ts | BUSINESS | MOVE |
| reviews/ReviewDetailView.tsx | BUSINESS | MOVE |
| reviews/ReviewStars.tsx | **GENERIC** | RENAME to `RatingDisplay`, stay in `ui/` |
| reviews/ReviewTableColumns.tsx | BUSINESS | MOVE |
| reviews/types.ts | BUSINESS | MOVE |
| faqs/FaqForm.tsx | BUSINESS | MOVE |
| faqs/FaqTableColumns.tsx | BUSINESS | MOVE |
| faqs/types.ts | BUSINESS | MOVE |
| coupons/CouponForm.tsx | BUSINESS | MOVE |
| coupons/CouponTableColumns.tsx | BUSINESS | MOVE |
| bids/BidTableColumns.tsx | BUSINESS | MOVE |
| site/SiteBasicInfoForm.tsx | BUSINESS | MOVE |
| site/SiteContactForm.tsx | BUSINESS | MOVE |
| site/SiteSocialLinksForm.tsx | BUSINESS | MOVE |
| payouts/PayoutStatusForm.tsx | BUSINESS | MOVE |
| payouts/PayoutTableColumns.tsx | BUSINESS | MOVE |
| dashboard/AdminDashboardSkeleton.tsx | GENERIC | Stay |
| dashboard/QuickActionsGrid.tsx | MIXED | MOVE (uses `ROUTES`) |
| dashboard/RecentActivityCard.tsx | GENERIC | Stay |
| media/MediaTableColumns.tsx | GENERIC | Stay |
| media/MediaOperationForm.tsx | GENERIC | Stay |

</details>

<details>
<summary><b>src/components/products/ (11 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| ProductCard.tsx | BUSINESS | MOVE to `features/products/` |
| ProductGrid.tsx | BUSINESS | MOVE |
| ProductFilters.tsx | BUSINESS | MOVE |
| ProductActions.tsx | BUSINESS | MOVE |
| ProductInfo.tsx | BUSINESS | MOVE |
| ProductImageGallery.tsx | GENERIC (duplicate) | DELETE (use `ui/ImageGallery`) |
| ProductReviews.tsx | BUSINESS | MOVE |
| ProductSortBar.tsx | MIXED | MOVE |
| ProductFeatureBadges.tsx | BUSINESS | MOVE |
| RelatedProducts.tsx | BUSINESS | MOVE |
| AddToCartButton.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/auctions/ (5 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| AuctionCard.tsx | BUSINESS | MOVE to `features/products/` |
| AuctionGrid.tsx | BUSINESS | MOVE |
| AuctionDetailView.tsx | BUSINESS | MOVE |
| BidHistory.tsx | BUSINESS | MOVE |
| PlaceBidForm.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/blog/ (3 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| BlogCard.tsx | BUSINESS | MOVE to `features/blog/` |
| BlogCategoryTabs.tsx | BUSINESS | MOVE |
| BlogFeaturedCard.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/cart/ (4 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| CartItemList.tsx | BUSINESS | MOVE to `features/cart/` |
| CartItemRow.tsx | BUSINESS | MOVE |
| CartSummary.tsx | BUSINESS | MOVE |
| PromoCodeInput.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/checkout/ (9 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| CheckoutView.tsx | BUSINESS | MOVE to `features/cart/` |
| CheckoutAddressStep.tsx | BUSINESS | MOVE |
| CheckoutOrderReview.tsx | BUSINESS | MOVE |
| CheckoutStepper.tsx | GENERIC | EXTRACT → `ui/StepperNav` |
| CheckoutSuccessView.tsx | BUSINESS | MOVE |
| OrderSuccessActions.tsx | MIXED | MOVE |
| OrderSuccessCard.tsx | BUSINESS | MOVE |
| OrderSuccessHero.tsx | GENERIC | EXTRACT or move with group |
| OrderSummaryPanel.tsx | MIXED | MOVE |

</details>

<details>
<summary><b>src/components/categories/ (2 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| CategoryCard.tsx | BUSINESS | MOVE to `features/categories/` |
| CategoryGrid.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/homepage/ (15 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| HeroCarousel.tsx | BUSINESS | MOVE to `features/homepage/` (NEW) |
| FeaturedProductsSection.tsx | BUSINESS | MOVE |
| FeaturedAuctionsSection.tsx | BUSINESS | MOVE |
| TopCategoriesSection.tsx | BUSINESS | MOVE |
| CustomerReviewsSection.tsx | BUSINESS | MOVE |
| BlogArticlesSection.tsx | BUSINESS | MOVE |
| FAQSection.tsx | BUSINESS | MOVE |
| WelcomeSection.tsx | BUSINESS | MOVE |
| WhatsAppCommunitySection.tsx | BUSINESS | MOVE |
| AdvertisementBanner.tsx | BUSINESS | MOVE |
| SectionCarousel.tsx | BUSINESS | MOVE |
| SiteFeaturesSection.tsx | MIXED | MOVE |
| TrustFeaturesSection.tsx | MIXED | MOVE |
| TrustIndicatorsSection.tsx | MIXED | MOVE |
| HomepageSkeleton.tsx | GENERIC | MOVE with group |

</details>

<details>
<summary><b>src/components/reviews/ (1 file)</b></summary>

| File | Class | Action |
|------|-------|--------|
| ReviewCard.tsx | BUSINESS | MOVE to `features/reviews/` |

</details>

<details>
<summary><b>src/components/seller/ (9 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| SellerStorefrontView.tsx | BUSINESS | MOVE to `features/seller/` |
| SellerAnalyticsStats.tsx | BUSINESS | MOVE |
| SellerPayoutHistoryTable.tsx | BUSINESS | MOVE |
| SellerPayoutRequestForm.tsx | BUSINESS | MOVE |
| SellerPayoutStats.tsx | BUSINESS | MOVE |
| SellerRevenueChart.tsx | BUSINESS | MOVE |
| SellerTabs.tsx | MIXED | MOVE |
| SellerTopProducts.tsx | BUSINESS | MOVE |
| PayoutTableColumns.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/search/ (2 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| SearchFiltersRow.tsx | BUSINESS | MOVE to `features/search/` |
| SearchResultsSection.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/contact/ (2 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| ContactForm.tsx | BUSINESS | MOVE to `features/contact/` (NEW) |
| ContactInfoSidebar.tsx | MIXED | MOVE |

</details>

<details>
<summary><b>src/components/faq/ (8 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| FAQPageContent.tsx | BUSINESS | MOVE to `features/faq/` (NEW) |
| FAQAccordion.tsx | BUSINESS | MOVE |
| FAQCategorySidebar.tsx | BUSINESS | MOVE |
| FAQHelpfulButtons.tsx | BUSINESS | MOVE |
| FAQSortDropdown.tsx | MIXED | MOVE |
| RelatedFAQs.tsx | BUSINESS | MOVE |
| ContactCTA.tsx | MIXED | MOVE |
| FAQSearchBar.tsx | GENERIC | DELETE (use `Search` directly) |

</details>

<details>
<summary><b>src/components/promotions/ (2 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| CouponCard.tsx | BUSINESS | MOVE to `features/promotions/` (NEW) |
| ProductSection.tsx | BUSINESS | MOVE |

</details>

<details>
<summary><b>src/components/about/ (1 file)</b></summary>

| File | Class | Action |
|------|-------|--------|
| AboutView.tsx | MIXED | MOVE to `features/about/` (NEW) |

</details>

<details>
<summary><b>src/components/user/ (14 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| WishlistButton.tsx | BUSINESS | MOVE to `features/user/` |
| UserTabs.tsx | BUSINESS | MOVE |
| addresses/AddressCard.tsx | BUSINESS | MOVE |
| addresses/AddressForm.tsx | BUSINESS | MOVE |
| orders/OrderTrackingView.tsx | BUSINESS | MOVE |
| profile/ProfileHeader.tsx | BUSINESS | MOVE |
| profile/ProfileStatsGrid.tsx | BUSINESS | MOVE (extract `StatsGrid` generic first) |
| profile/PublicProfileView.tsx | BUSINESS | MOVE |
| settings/AccountInfoCard.tsx | BUSINESS | MOVE |
| settings/EmailVerificationCard.tsx | BUSINESS | MOVE |
| settings/PasswordChangeForm.tsx | BUSINESS | MOVE |
| settings/PhoneVerificationCard.tsx | BUSINESS | MOVE |
| settings/ProfileInfoForm.tsx | BUSINESS | MOVE |
| notifications/NotificationItem.tsx | BUSINESS | MOVE |
| notifications/NotificationsBulkActions.tsx | BUSINESS | MOVE with group |

</details>

<details>
<summary><b>src/components/layout/ (9 files)</b></summary>

| File | Class | Action |
|------|-------|--------|
| AutoBreadcrumbs.tsx | GENERIC | Stay |
| BottomNavbar.tsx | BUSINESS | SPLIT → generic `BottomNavLayout` + config |
| Breadcrumbs.tsx | GENERIC | Stay |
| Footer.tsx | MIXED | SPLIT → generic `FooterLayout` + config |
| LocaleSwitcher.tsx | GENERIC | Stay |
| MainNavbar.tsx | MIXED | SPLIT → generic `NavbarLayout` + config |
| NavItem.tsx | GENERIC | Stay |
| Sidebar.tsx | BUSINESS | SPLIT → generic `SidebarLayout` + config |
| TitleBar.tsx | BUSINESS | SPLIT → generic `TitleBarLayout` + config |

</details>

---

## 14. Sieve Configuration Recommendations

> **Scope**: Which fields to add, change, or remove in each repository's `SIEVE_FIELDS` so that the corresponding filter components and API endpoints expose exactly the right facets. All additions assume the field is (or will be) stored in the Firestore document — if denormalization is needed a note is included.

---

### 14.1 ReviewRepository

**Current fields**: `id`, `productId`, `productTitle`, `userId`, `userName`, `sellerId`, `status`, `rating`, `verified`, `helpfulCount`, `featured`, `reportCount`, `updatedAt`, `createdAt`

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `orderId` | ✓ | ✗ | Store on the review doc at write time. Allows "find all reviews for an order". |
| `categoryId` | ✓ | ✗ | Denormalize from the product at review-write time. |
| `categoryName` | ✓ | ✓ | Displayable category label — used in admin facet dropdowns. |
| `productSlug` | ✓ | ✗ | SEO-friendly product filter when `productId` is not user-facing. |
| `isEdited` | ✓ | ✗ | Flag set when buyer edits their review after initial submission. |
| `hasMedia` | ✓ | ✗ | `true` when the review contains image/video attachments — common facet. |

**Remove nothing** — existing fields are all useful.

**URL param names**: `orderId`, `categoryId`, `rating`, `verified`, `sellerId`, `status`, `hasMedia`, `dateFrom`, `dateTo`

---

### 14.2 ProductRepository

**Current fields** (non-auction): `id`, `title`, `slug`, `category`, `subcategory`, `brand`, `condition`, `status`, `sellerId`, `sellerName`, `featured`, `isAuction`, `isPromoted`, `price`, `stockQuantity`, `viewCount`, `currentBid`, `bidCount`, `createdAt`, `updatedAt`, `auctionEndDate`, `startingBid`, `buyNowPrice`, `minBidIncrement`, `autoExtendable`, `reservePrice`, `tags`, `features`, `insurance`, `currency`

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `averageRating` | ✓ | ✓ | Denormalized from review aggregates (updated by Function trigger). |
| `reviewCount` | ✓ | ✓ | Denormalized from review aggregates. |
| `hasVideo` | ✓ | ✗ | `true` when the product has at least one video media item. |
| `location` | ✓ | ✗ | City/state string for geo-filtered browsing (optional, if sellers provide it). |
| `shippingAvailable` | ✓ | ✗ | `true` when the seller offers delivery; `false` = pickup only. |
| `isVerifiedSeller` | ✓ | ✗ | Denormalized from seller's `storeStatus === 'verified'`. |
| `sellerRating` | ✓ | ✓ | Denormalized from seller's `stats.averageRating`. |

**Remove nothing** — all current fields have valid use cases.

**URL param names** (products page): `category`, `subcategory`, `brand`, `condition`, `sellerId`, `minPrice`, `maxPrice`, `minRating`, `featured`, `hasVideo`, `tags`, `features`, `inStock`, `status`

---

### 14.3 ProductRepository — Auction-specific

Auctions reuse the same repository with an implicit `isAuction==true` pre-filter applied in the API route. The following fields are already present but need a planned `auctionStatus` denormalized field:

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `auctionStatus` | ✓ | ✓ | Denormalized enum: `upcoming` / `live` / `ended`. Updated by a scheduled Function so queries can filter efficiently without date arithmetic. |
| `hasReserve` | ✓ | ✗ | `true` when `reservePrice > 0`. Set at write time; avoids `reservePrice > 0` range query. |
| `isExtended` | ✓ | ✗ | `true` when the auction has been auto-extended at least once. |
| `winnerUserId` | ✓ | ✗ | Set once the auction settles. Enables "won auctions" filter. |

**Note**: "Time left" filters are best expressed as `auctionStatus==live` combined with `auctionEndDate` range queries rather than computed durations:
- Ending < 1 h → `auctionEndDate<={now+1h}`
- Ending today → `auctionEndDate<={endOfToday}`
- Ending this week → `auctionEndDate<={endOfWeek}`

**URL param names** (auctions page): `category`, `brand`, `sellerId`, `minBid`, `maxBid`, `auctionStatus`, `hasReserve`, `bidCount`, `endBefore`, `endAfter`

---

### 14.4 CategoriesRepository

**Current fields**: `name`, `slug`, `tier`, `isActive`, `isFeatured`, `isSearchable`, `parentId`, `order`, `metrics.productCount`, `metrics.totalItemCount`, `metrics.auctionCount`, `id`, `isLeaf`, `createdAt`

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `parentName` | ✓ | ✓ | Denormalized parent display name — avoids join for filter labels. |
| `depth` | ✓ | ✓ | Nesting level (0 = root). Easier than inferring from `tier`. |
| `hasImage` | ✓ | ✗ | `true` when a cover image is uploaded — admin completeness filter. |
| `metrics.activeProductCount` | ✓ | ✓ | Published products only, separate from `totalItemCount`. |

**URL param names**: `tier`, `parentId`, `isFeatured`, `isActive`, `hasImage`, `minProducts`, `maxProducts`

---

### 14.5 UserRepository (Stores context)

When the stores listing queries users with `role==seller`, these additional fields become relevant:

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `storeName` | ✓ | ✓ | Distinct from `displayName`; the brand/shop name shown in listings. |
| `stats.totalProducts` | ✓ | ✓ | Published product count — denormalized by Function trigger. |
| `stats.totalSales` | ✓ | ✓ | Completed order count — denormalized. |
| `stats.averageRating` | ✓ | ✓ | Average store rating — denormalized from reviews. |
| `stats.reviewCount` | ✓ | ✓ | Total store review count. |
| `isVerified` | ✓ | ✗ | `true` when admin has marked the store as verified. |
| `location` | ✓ | ✓ | City/region for geo-filtered store browsing. |
| `primaryCategory` | ✓ | ✓ | Main category the store sells in — useful for facet filtering. |

**URL param names** (stores page): `storeStatus`, `minRating`, `minProducts`, `isVerified`, `primaryCategory`, `location`

---

### 14.6 BlogRepository

**Current fields**: `id`, `title`, `slug`, `status`, `category`, `authorName`, `authorId`, `isFeatured`, `readTimeMinutes`, `views`, `publishedAt`, `updatedAt`, `tags`, `createdAt`

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `commentCount` | ✓ | ✓ | Denormalized total comment count for "most discussed" sorts. |
| `series` | ✓ | ✓ | Named blog series (e.g. "Trekking Basics") — groups multi-part posts. |
| `difficulty` | ✓ | ✓ | Content difficulty rating (beginner/intermediate/advanced) — travel/guide blogs. |
| `destination` | ✓ | ✓ | Geographic destination tag — key for a travel-focused site. |
| `hasVideo` | ✓ | ✗ | `true` when the post contains embedded video. |

**URL param names**: `category`, `tags`, `authorId`, `minReadTime`, `maxReadTime`, `isFeatured`, `dateFrom`, `dateTo`, `destination`, `series`

---

### 14.7 EventRepository

**Current fields**: `type`, `status`, `title`, `createdBy`, `startsAt`, `endsAt`, `stats.totalEntries`, `stats.approvedEntries`, `stats.flaggedEntries`, `id`, `createdAt`

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `slug` | ✓ | ✗ | SEO-friendly identifier used in deep-link filters. |
| `tags` | ✓ | ✗ | Free-form topic tags (array-contains `@=` operator). |
| `isFeatured` | ✓ | ✗ | Pinned to featured carousel. |
| `isPublic` | ✓ | ✗ | `false` for invite-only or admin-only events. |
| `prizePool` | ✓ | ✓ | Total prize/reward value — for "events with prizes" filter. |
| `maxEntries` | ✓ | ✓ | Cap on participants — allows "has open spots" filter via `stats.totalEntries < maxEntries`. |
| `location` | ✓ | ✓ | City/region for in-person event geo filtering. |
| `updatedAt` | ✓ | ✓ | Missing from current config — add for recency sorts. |

**URL param names**: `type`, `status`, `isFeatured`, `isPublic`, `tags`, `dateFrom`, `dateTo`, `hasOpenSpots`

---

### 14.8 OrderRepository — Both Field Sets

#### SELLER_SIEVE_FIELDS — additions

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `couponCode` | ✓ | ✗ | Allows seller to filter orders that used a discount. |
| `trackingNumber` | ✓ | ✗ | Filter orders by shipping tracking number. |
| `isDisputed` | ✓ | ✗ | Flag for return/dispute raised by buyer. |
| `shippingMethod` | ✓ | ✓ | Standard / Express / Pickup. |
| `deliveryDate` | ✓ | ✓ | Expected or actual delivery date for range filters. |
| `sellerName` | ✓ | ✓ | Needed if a seller manages multiple store front-names. |

#### ADMIN_SIEVE_FIELDS — additions

Same as seller additions, plus:

| Add field | canFilter | canSort | Notes |
|-----------|:---------:|:-------:|-------|
| `sellerName` | ✓ | ✓ | Seller display name for admin search. |
| `couponCode` | ✓ | ✗ | Admin coupon redemption analytics. |
| `deliveryDate` | ✓ | ✓ | SLA / fulfilment reporting. |
| `isDisputed` | ✓ | ✗ | Dispute-management queue. |
| `shippingMethod` | ✓ | ✓ | Operations analysis. |
| `riskScore` | ✓ | ✓ | Fraud-detection score if integrated. |

**URL param names** (orders): `status`, `paymentStatus`, `paymentMethod`, `sellerId`, `dateFrom`, `dateTo`, `minPrice`, `maxPrice`, `isDisputed`, `shippingMethod`, `couponCode`

---

### 14.9 Generic Sieve Pattern — "Search by ID / Slug / Name"

Every resource whose listing page must support searching by ID, slug, or name should expose the following fields (all with `canFilter: true`, using the `_=` starts-with or `==` exact operator):

| Resource | ID field | Slug field | Name/Title field |
|----------|----------|-----------|-----------------|
| Products | `id` ✓ | `slug` ✓ | `title` ✓ |
| Auctions | `id` ✓ | `slug` ✓ | `title` ✓ |
| Reviews | `id` ✓ | `productSlug` (add) | `productTitle` ✓ / `userName` ✓ |
| Categories | `id` ✓ | `slug` ✓ | `name` ✓ |
| Stores | `uid` ✓ | — | `storeName` (add) / `displayName` ✓ |
| Blogs | `id` ✓ | `slug` ✓ | `title` ✓ |
| Events | `id` ✓ | `slug` (add) | `title` ✓ |
| Orders | `id` ✓ | — | `productTitle` ✓ / `userName` ✓ |

The search `q` param is handled by the Sieve `_=` (starts-with) operator applied against the name/title field. Direct ID lookup uses `==` on the `id` field. The API routes should check `q` first as a name starts-with, then fall back to an exact-ID match when `q` matches the pattern of an ID/slug.

---

## 15. Resource Filter Components

> **Architecture rule**: filter components are **business components** (they know URL param names and domain option shapes) and live in their feature's `components/` folder. They each accept a `table: UrlTable` prop and async option arrays loaded by the parent view. All sections default to `defaultCollapsed={true}`. The filter panel itself (the drawer/sidebar wrapper) is controlled by the parent `ListingLayout` — these components only render the inner filter groups.

### 15.1 Tier 1 Generic Filter Primitives (stay in `src/components/filters/`)

| File | Purpose | Notes |
|------|---------|-------|
| `RangeFilter.tsx` ✅ | Numeric or date min/max range | Already exists; supports `type="number"` and `type="date"` |
| `DateRangeFilter.tsx` 🆕 | Purpose-built date range (two `<Input type="date">`) | Extract from `RangeFilter type="date"` into a dedicated component with locale-aware date formatting and "presets" (Today, This week, This month, Custom). Identical API to `RangeFilter` but adds preset buttons. |
| `ToggleFilter.tsx` 🆕 | Single boolean on/off facet | Renders as a `Toggle` + label row; writes `table.set(key, checked ? 'true' : '')`. Used for "in stock only", "has video", "featured only", "verified seller". |
| `StarRatingFilter.tsx` 🆕 | Minimum star rating selector | Renders 5 clickable stars; writes `minRating` param. Reusable across products, stores, events. |

`ProductFilters.tsx` at `src/components/filters/ProductFilters.tsx` is **moved** to `src/features/products/components/ProductFilters.tsx` (it already appears in the §7.1 migration plan).

---

### 15.2 ReviewFilters

**Location**: `src/features/reviews/components/ReviewFilters.tsx`

```
Props:
  table: UrlTable
  sellerOptions?: FacetOption[]          // loaded by parent
  categoryOptions?: FacetOption[]        // loaded by parent
  productOptions?: FacetOption[]         // loaded by parent (searchable)
  showStatus?: boolean                   // true for admin/seller only
  showVerifiedFilter?: boolean           // true for all public pages

Filter groups (all defaultCollapsed):
  1. Rating          — StarRatingFilter (minRating)
  2. Category        — FilterFacetSection, dynamic, searchable
  3. Seller          — FilterFacetSection, dynamic, searchable (hidden on seller's own page)
  4. Product         — FilterFacetSection, dynamic, searchable
  5. Verified        — ToggleFilter (verified==true)
  6. Has Media       — ToggleFilter (hasMedia==true)
  7. Date Range      — DateRangeFilter (dateFrom / dateTo → maps to createdAt)
  8. Status          — FilterFacetSection [pending/approved/rejected/flagged] (admin/seller only)

URL params written: minRating, categoryId, sellerId, productId, verified, hasMedia, dateFrom, dateTo, status
Search bar (ID/slug/name):  q param — maps to productTitle _= or orderId == or userName _=
```

---

### 15.3 ProductFilters (relocated)

**Current location**: `src/components/filters/ProductFilters.tsx`  
**New location**: `src/features/products/components/ProductFilters.tsx`

```
Props (extending current):
  table: UrlTable
  categoryOptions?: FacetOption[]
  subcategoryOptions?: FacetOption[]     // 🆕 dynamic subcategory facet
  brandOptions?: FacetOption[]
  sellerOptions?: FacetOption[]
  tagOptions?: FacetOption[]
  featureOptions?: FacetOption[]         // 🆕 product feature flags as checkboxes
  showStatus?: boolean                   // admin/seller only
  statusOptions?: FacetOption[]
  showRating?: boolean                   // 🆕 show rating filter (default true on public pages)

Filter groups (all defaultCollapsed):
  1. Category        — FilterFacetSection, dynamic, searchable
  2. Subcategory     — FilterFacetSection, dynamic (visible only when category selected)
  3. Brand           — FilterFacetSection, dynamic, searchable
  4. Condition       — FilterFacetSection [new/used/refurbished/broken], static
  5. Price Range     — RangeFilter (minPrice / maxPrice, prefix ₹)
  6. Rating          — StarRatingFilter (minRating) — hidden when showRating=false
  7. Seller          — FilterFacetSection, dynamic, searchable
  8. Features        — FilterFacetSection, dynamic (product-level feature flags)
  9. Tags            — FilterFacetSection, dynamic, searchable
  10. In Stock Only  — ToggleFilter (stockQuantity>0)
  11. Has Video      — ToggleFilter (hasVideo==true)
  12. Featured Only  — ToggleFilter (featured==true) — admin/seller only
  13. Status         — FilterFacetSection (admin/seller only)

URL params written: category, subcategory, brand, condition, minPrice, maxPrice, minRating,
                    sellerId, features, tags, inStock, hasVideo, featured, status
Search bar: q → title _=  or  id ==  or  slug ==
```

---

### 15.4 AuctionFilters

**Location**: `src/features/products/components/AuctionFilters.tsx`

```
Props:
  table: UrlTable
  categoryOptions?: FacetOption[]
  brandOptions?: FacetOption[]
  sellerOptions?: FacetOption[]

Filter groups (all defaultCollapsed):
  1. Auction Status  — FilterFacetSection [upcoming/live/ended], static
  2. Time Left       — FilterFacetSection with preset ranges:
                         • Ending < 1 hour  → endBefore={now+1h}
                         • Ending today     → endBefore={endOfToday}
                         • Ending this week → endBefore={endOfWeek}
                       (writes auctionStatus + endBefore params)
  3. Category        — FilterFacetSection, dynamic, searchable
  4. Brand           — FilterFacetSection, dynamic, searchable
  5. Current Bid     — RangeFilter (minBid / maxBid, prefix ₹)
  6. Starting Bid    — RangeFilter (minStartBid / maxStartBid, prefix ₹)
  7. Bid Count       — RangeFilter (minBidCount / maxBidCount)
  8. Has Reserve     — ToggleFilter (hasReserve==true)
  9. Buy Now Only    — ToggleFilter (buyNowPrice>0)
  10. Seller         — FilterFacetSection, dynamic, searchable
  11. Auto-Extend    — ToggleFilter (autoExtendable==true)

URL params written: auctionStatus, endBefore, category, brand, minBid, maxBid,
                    minStartBid, maxStartBid, minBidCount, hasReserve, hasBuyNow,
                    sellerId, autoExtendable
Search bar: q → title _=  or  id ==
```

---

### 15.5 CategoryFilters

**Location**: `src/features/categories/components/CategoryFilters.tsx`

```
Props:
  table: UrlTable
  parentOptions?: FacetOption[]          // tier-1 + tier-2 category names
  showAdminFields?: boolean              // shows isActive, hasImage filters

Filter groups (all defaultCollapsed):
  1. Tier / Level    — FilterFacetSection [Root (1) / Sub (2) / Leaf (3)], static
  2. Parent Category — FilterFacetSection, dynamic, searchable
  3. Product Count   — RangeFilter (minProducts / maxProducts)
  4. Featured Only   — ToggleFilter (isFeatured==true)
  5. Has Items Only  — ToggleFilter (metrics.productCount>0)
  6. Active Only     — ToggleFilter (isActive==true) — admin only
  7. Has Image       — ToggleFilter (hasImage==true) — admin only

URL params written: tier, parentId, minProducts, maxProducts, isFeatured, hasItems, isActive, hasImage
Search bar: q → name _=  or  id ==  or  slug ==
```

---

### 15.6 StoreFilters

**Location**: `src/features/stores/components/StoreFilters.tsx`

```
Props:
  table: UrlTable
  categoryOptions?: FacetOption[]        // primary category options
  locationOptions?: FacetOption[]        // city/region options

Filter groups (all defaultCollapsed):
  1. Store Status    — FilterFacetSection [active/pending/suspended], static (admin only)
  2. Rating          — StarRatingFilter (minRating)
  3. Products Listed — RangeFilter (minProducts / maxProducts)
  4. Primary Category— FilterFacetSection, dynamic, searchable
  5. Location        — FilterFacetSection, dynamic, searchable
  6. Verified Only   — ToggleFilter (isVerified==true)

URL params written: storeStatus, minRating, minProducts, maxProducts, primaryCategory, location, isVerified
Search bar: q → storeName _=  or  displayName _=  or  uid ==
```

---

### 15.7 BlogFilters

**Location**: `src/features/blog/components/BlogFilters.tsx`

```
Props:
  table: UrlTable
  categoryOptions?: FacetOption[]
  tagOptions?: FacetOption[]
  authorOptions?: FacetOption[]
  destinationOptions?: FacetOption[]     // travel destination facet
  showStatus?: boolean                   // author/admin only

Filter groups (all defaultCollapsed):
  1. Category/Topic  — FilterFacetSection, dynamic, searchable
  2. Tags            — FilterFacetSection, dynamic, searchable (multi-select)
  3. Author          — FilterFacetSection, dynamic, searchable
  4. Destination     — FilterFacetSection, dynamic, searchable (travel context)
  5. Read Time       — RangeFilter (minReadTime / maxReadTime, suffix "min")
  6. Published Date  — DateRangeFilter (dateFrom / dateTo → publishedAt)
  7. Featured Only   — ToggleFilter (isFeatured==true)
  8. Has Video       — ToggleFilter (hasVideo==true)
  9. Status          — FilterFacetSection [published/draft/archived] — author/admin only

URL params written: category, tags, authorId, destination, minReadTime, maxReadTime,
                    dateFrom, dateTo, isFeatured, hasVideo, status
Search bar: q → title _=  or  id ==  or  slug ==
```

---

### 15.8 EventFilters

**Location**: `src/features/events/components/EventFilters.tsx`

```
Props:
  table: UrlTable
  tagOptions?: FacetOption[]
  showAdminFields?: boolean

Filter groups (all defaultCollapsed):
  1. Event Type      — FilterFacetSection [contest/poll/survey/quiz/challenge], static
  2. Status          — FilterFacetSection [upcoming/live/ended] for public;
                       + draft/cancelled for admin
  3. Date Range      — DateRangeFilter (dateFrom / dateTo → startsAt)
  4. Tags/Topics     — FilterFacetSection, dynamic, searchable
  5. Featured Only   — ToggleFilter (isFeatured==true)
  6. Public Only     — ToggleFilter (isPublic==true) — admin only
  7. Has Prize        — ToggleFilter (prizePool>0)
  8. Open Spots      — ToggleFilter (hasOpenSpots==true) — entries < maxEntries

URL params written: type, status, dateFrom, dateTo, tags, isFeatured, isPublic, hasPrize, hasOpenSpots
Search bar: q → title _=  or  id ==  or  slug ==
```

---

### 15.9 OrderFilters

**Location**: `src/features/user/components/OrderFilters.tsx`  
*(Consumed by `UserOrdersView`, `SellerOrdersView`, `AdminOrdersView` — role variant controlled via props)*

```
Props:
  table: UrlTable
  sellerOptions?: FacetOption[]          // admin only
  productOptions?: FacetOption[]         // dynamic
  showAdminFields?: boolean              // unlocks admin-only groups
  showSellerFields?: boolean             // unlocks seller-only groups

Filter groups (all defaultCollapsed):
  1. Order Status    — FilterFacetSection
                       [pending/confirmed/processing/shipped/delivered/cancelled/disputed]
  2. Payment Status  — FilterFacetSection [pending/paid/failed/refunded]
  3. Payment Method  — FilterFacetSection [online/cod/wallet]
  4. Date Range      — DateRangeFilter (dateFrom / dateTo → orderDate)
  5. Price Range     — RangeFilter (minPrice / maxPrice, prefix ₹)
  6. Product         — FilterFacetSection, dynamic, searchable
  7. Seller          — FilterFacetSection, dynamic, searchable (user + admin; hidden on seller's own page)
  8. Shipping Method — FilterFacetSection [standard/express/pickup] — seller + admin
  9. Disputed Only   — ToggleFilter (isDisputed==true) — admin only
  10. Coupon Used    — ToggleFilter (couponCode!=null) — admin only

URL params written: status, paymentStatus, paymentMethod, dateFrom, dateTo,
                    minPrice, maxPrice, productId, sellerId, shippingMethod, isDisputed
Search bar: q → productTitle _=  or  id ==  or  userName _=
```

---

### 15.10 Filter Component Placement Summary

| Component | Location | Used by |
|-----------|----------|---------|
| `RangeFilter` | `src/components/filters/` ✅ | All filter forms |
| `DateRangeFilter` 🆕 | `src/components/filters/` | ReviewFilters, BlogFilters, EventFilters, OrderFilters |
| `ToggleFilter` 🆕 | `src/components/filters/` | ProductFilters, AuctionFilters, StoreFilters, etc. |
| `StarRatingFilter` 🆕 | `src/components/filters/` | ReviewFilters, ProductFilters, StoreFilters |
| `ProductFilters` (moved) | `src/features/products/components/` | ProductsView, SearchView (products tab) |
| `AuctionFilters` 🆕 | `src/features/products/components/` | AuctionsView, SearchView (auctions tab) |
| `ReviewFilters` 🆕 | `src/features/reviews/components/` | ReviewsListView, AdminReviewsView, SellerReviewsView |
| `CategoryFilters` 🆕 | `src/features/categories/components/` | CategoriesListView, AdminCategoriesView |
| `StoreFilters` 🆕 | `src/features/stores/components/` | StoresListView, SearchView (stores tab) |
| `BlogFilters` 🆕 | `src/features/blog/components/` | BlogListView, AdminBlogView, SearchView (blogs tab) |
| `EventFilters` 🆕 | `src/features/events/components/` | EventsListView, AdminEventsView, SearchView (events tab) |
| `OrderFilters` 🆕 | `src/features/user/components/` | UserOrdersView, SellerOrdersView, AdminOrdersView |

All Tier 1 filter primitives are exported from `src/components/filters/index.ts` and re-exported from `src/components/index.ts`.

---

## 16. Global Search Architecture

### 16.1 Overview

The global search is a site-wide feature that indexes all public content types and presents results in a **tabbed listing layout**. It is distinct from the per-page filters described in §15 — global search crosses resource boundaries.

```
 Header Search Input (present on every page)
   ├── Live suggestions dropdown (fires after 300 ms debounce)
   │     ├── Products group      (top 3 matches)
   │     ├── Auctions group      (top 3 matches)
   │     ├── Categories group    (top 3 matches)
   │     ├── Stores group        (top 3 matches)
   │     ├── Blogs group         (top 3 matches)
   │     ├── Events group        (top 3 matches)
   │     └── Site Pages group    (matched from static SITE_PAGES map — "All" tab only)
   │
   ├── "View all results for X"  →  /search?q=X&type=all
   └── Per-group "See all Products/Auctions/..."  →  /search?q=X&type=products
```

### 16.2 Search Results Page (`/[locale]/search`)

**URL params**: `q` (query), `type` (active tab), plus per-type filter params.

**Tab bar**:

| Tab key | Label | Content |
|---------|-------|---------|
| `all` | All | Mixed top results from every type (no filters, no pagination) + site page shortcuts |
| `products` | Products | Full `ProductsView` with `ProductFilters` |
| `auctions` | Auctions | Full `AuctionsView` with `AuctionFilters` |
| `categories` | Categories | Full `CategoriesListView` with `CategoryFilters` |
| `stores` | Stores | Full `StoresListView` with `StoreFilters` |
| `reviews` | Reviews | Full `ReviewsListView` with `ReviewFilters` |
| `blogs` | Blogs | Full `BlogListView` with `BlogFilters` |
| `events` | Events | Full `EventsListView` with `EventFilters` |

Tab state lives in URL: `?type=products`. Switching tab resets page to 1 but preserves `q`. Filters are tab-scoped — each type has its own filter param namespace so switching tabs does not bleed params.

### 16.3 "All" Tab — Mixed Results

The "All" tab shows fast, non-paginated previews of the top N results per type. It is NOT filtered or paginated — it is a discovery view.

```
Layout:
  ┌─ Site Page Shortcuts  (if any pages match the query)
  │    e.g. "my orders" → card with link to /user/orders (requires auth)
  │    e.g. "seller dashboard" → /seller/dashboard (requires seller role)
  │
  ├─ Products  (top 6, 3-col grid)  →  "See all X products" link
  ├─ Auctions  (top 4, 4-col grid)  →  "See all X auctions" link
  ├─ Categories (top 6, icon list)  →  "See all X categories" link
  ├─ Stores    (top 4, card strip)  →  "See all X stores" link
  ├─ Blogs     (top 4, 2-col grid)  →  "See all X posts" link
  └─ Events    (top 6, card list)   →  "See all X events" link
```

No `FilterDrawer` is shown on the "All" tab. The `Search` component in `AdminFilterBar` is replaced by the global search bar.

### 16.4 Site Page Suggestions (Static Map)

A static constant `SITE_PAGES` lives at `src/constants/site-pages.ts`:

```ts
// Pattern — each entry has a label, route, requiredRole,
// and a list of keyword aliases that trigger suggestion display
export const SITE_PAGES: SitePageEntry[] = [
  { label: 'My Orders',          route: ROUTES.USER.ORDERS,       requiredRole: 'user',   keywords: ['my orders', 'order history', 'purchases'] },
  { label: 'My Wishlist',         route: ROUTES.USER.WISHLIST,     requiredRole: 'user',   keywords: ['wishlist', 'saved items', 'favorites'] },
  { label: 'My Addresses',        route: ROUTES.USER.ADDRESSES,    requiredRole: 'user',   keywords: ['address', 'delivery address', 'shipping'] },
  { label: 'Seller Dashboard',    route: ROUTES.SELLER.DASHBOARD,  requiredRole: 'seller', keywords: ['seller dashboard', 'my store', 'sales'] },
  { label: 'Seller Orders',       route: ROUTES.SELLER.ORDERS,     requiredRole: 'seller', keywords: ['seller orders', 'my orders', 'fulfil'] },
  { label: 'Admin Dashboard',     route: ROUTES.ADMIN.DASHBOARD,   requiredRole: 'admin',  keywords: ['admin', 'dashboard'] },
  { label: 'Admin Products',      route: ROUTES.ADMIN.PRODUCTS,    requiredRole: 'admin',  keywords: ['admin products', 'manage products'] },
  // … full list covers all major routes
];
```

Matching logic: fuzzy substring match — `query.toLowerCase()` contained in any `keyword`. Shown only as suggestions in the dropdown, not as actual search results. Role check against `useAuth().user.role` before including in the list.

### 16.5 Search API Endpoints

All search requests go through `src/app/api/search/route.ts`:

```
GET /api/search?q=shoes&type=products&category=footwear&page=1&pageSize=24
GET /api/search?q=shoes&type=all&pageSize=6      ← top N per type (no pagination)
GET /api/search?q=shoes&type=auctions&auctionStatus=live
```

The `type` param routes to the appropriate repository `.list()` call with the `q` param mapped to `title_=shoes` (starts-with). For "all", the route fires N parallel repository calls and merges the top results.

### 16.6 Feature Module: `src/features/search/`

```
src/features/search/
  components/
    SearchView.tsx              ← results page (tabbed, uses ListingLayout)
    SearchAllTab.tsx            ← mixed results grid for type=all
    SearchTabBar.tsx            ← tab strip (Products / Auctions / etc.)
    SearchSuggestions.tsx       ← dropdown shown from header input
    SitePageSuggestion.tsx      ← single site-page shortcut card in suggestions
  hooks/
    useSearchResults.ts         ← useApiQuery wrapping searchService
    useSearchSuggestions.ts     ← debounced suggestion query
    useSitePageMatches.ts       ← static keyword matching against SITE_PAGES
  services/
    search.service.ts           ← apiClient calls to /api/search
  types/
    SearchTab.ts                ← 'all' | 'products' | 'auctions' | ...
    SearchResult.ts             ← union of result types
  index.ts
```

`SearchView` composes the correct filter component (from §15) for each tab. On the "all" tab, no filter drawer is shown.

### 16.7 Search State in URL

```
/search?q=shoes                           ← "all" tab, default
/search?q=shoes&type=products             ← products tab, no extra filters
/search?q=shoes&type=products&category=footwear&minPrice=500&sorts=-createdAt&page=2
```

`useUrlTable` is used for all tab state. Tab changes call `table.set('type', tab)` which resets `page` to 1 but preserves `q`. Filter changes within a tab reset `page` to 1 automatically (built-in `useUrlTable` behaviour). The `type` param is excluded from the page-reset guard (same treatment as `view`).

### 16.8 Accessibility & SEO

- Each tab panel has `role="tabpanel"` with `aria-labelledby` pointing to its tab button.  
- `<title>` and `<meta name="description">` are generated by `generateMetadata` using the `q` and `type` params.  
- Results pages render with `noindex` when `q` is empty; indexed when `q` is non-empty and `type` is a specific tab.

---

## 17. URL Navigation & Back-Button Behaviour

### 17.1 Core Principle — Everything in the URL

All list state (search query, filters, sort, pagination, view mode, active tab) lives in URL query params via `useUrlTable`. This is what makes the back-button work correctly for free — the browser restores the previous URL, which restores the full state, with no extra code.

```
/products?q=trek&category=hiking&brand=osprey&minPrice=500&sorts=-createdAt&page=2&view=grid
/search?q=shoes&type=products&category=footwear&page=1
/[locale]/stores?minRating=4&isVerified=true&sorts=-stats.totalSales
```

### 17.2 Public Listing Page — Click Behaviour

Items on public listing pages (products, auctions, categories, stores, blog, events, search results) are **standard HTML links**. This gives correct behaviour for free:

| Action | Behaviour |
|--------|-----------|
| Left click | Same tab — browser navigates, pushes to history |
| Ctrl+Click (Windows/Linux) | New tab |
| Cmd+Click (Mac) | New tab |
| Middle-click | New tab |
| Back button | Previous URL restored → all filters preserved |
| Forward button | Forward URL restored |
| Bookmark | Bookmarks the current filters + page |
| Share URL | Full filter state shareable |

**Implementation pattern** — item cards must use a real `<a>` element, not an `onClick` with `router.push()`:

```tsx
// WRONG — onClick navigation: Ctrl+click and back button break
<div onClick={() => router.push(ROUTES.PRODUCTS.DETAIL(slug))} className="cursor-pointer">
  <ProductCard product={product} />
</div>

// WRONG — wrapping anchor that has no href (React key trick)
<div role="button" onClick={...}>

// RIGHT — card is wrapped in a TextLink (renders <a href="...">)
<TextLink href={ROUTES.PRODUCTS.DETAIL(slug)} className="block group" aria-label={product.title}>
  <ProductCard product={product} />
</TextLink>

// RIGHT — article with an overlay link (preferred for complex cards with multiple clickable zones)
<Article className="relative group">
  <TextLink
    href={ROUTES.PRODUCTS.DETAIL(slug)}
    className="absolute inset-0 z-0"
    aria-label={product.title}
  />
  {/* interactive child elements (wishlist, add-to-cart) get z-10 to sit above the overlay */}
  <WishlistButton productId={product.id} className="relative z-10" />
  <AddToCartButton product={product} className="relative z-10" />
</Article>
```

The overlay-link pattern is the standard for cards that have multiple interactive elements. Accessibility note: the overlay `TextLink` must have a descriptive `aria-label` (the item title). Inner interactive elements must have explicit `aria-label` and be raised above the overlay via `relative z-10`.

### 17.3 Admin / Seller / User Pages — Click Behaviour

These pages intentionally diverge from the public pattern because actions open drawers instead of navigating:

| Interaction | Behaviour |
|-------------|-----------|
| Row click on a `DataTable` row | Opens `SideDrawer` (edit/detail — no navigation) |
| "View" action in row actions menu | Navigates to external detail page in same tab |
| "Open in new tab" action | `window.open(ROUTES.PRODUCTS.DETAIL(slug), '_blank', 'noopener')` |
| Filter / sort / pagination changes | `router.replace()` — no new history entry |

The distinction: admin/seller/user pages use `router.replace()` for all filter state changes (via `useUrlTable`) and `router.push()` only for deliberate navigation (Create → Edit page). This prevents the history stack from filling up with filter changes.

### 17.4 Back-Button State Guarantee

Because `useUrlTable` always writes state to the URL (via `router.replace()`), the back button restores the exact URL the user was on before navigating to a detail page — filters, sort, page number, and view mode are all preserved without any localStorage or session storage.

What this means in practice:
1. User is on `/products?category=hiking&minPrice=500&page=3` 
2. User clicks a product → navigates to `/products/my-product`
3. User clicks back → browser restores `/products?category=hiking&minPrice=500&page=3`
4. `useUrlTable` reads those params → the same filtered, paginated list appears

No special "save-and-restore" code is needed. This is a direct consequence of the URL-first state design.

### 17.5 Scroll Restoration

Next.js App Router restores scroll position by default when navigating back. For infinite-scroll or virtual-scroll lists, scroll position must be manually saved. The recommendation:

- **Paginated lists** (the default): scroll restoration is automatic.
- **Infinite scroll lists** (if introduced): save scroll position to `sessionStorage` keyed by the full URL string before navigating away; restore on mount if `sessionStorage` entry exists.

### 17.6 Filter Drawer — Open State

The `FilterDrawer` open/close state is **local `useState`** — not in the URL. This is intentional: the drawer being open or closed is a transient UI state that should not be bookmarked or shared. The filter *values* inside the drawer are always in the URL.

---

## 18. Bulk Actions Matrix

### 18.1 Design Principles

1. **Never show bulk actions on public-facing pages** (product listing, stores, search, categories, blog, events). Bulk selection is a management tool — public users do not select multiple items.
2. **The `BulkActionBar` Tier-1 component is generic** — it accepts an `actions` array. Feature views build that array dynamically based on `useAuth().user.role` and the current page context.
3. **Action availability depends on the selected items' state**, not just the user's role. For example, "Cancel Order" is only enabled when all selected orders have status `pending` or `confirmed`.
4. **Destructive actions require confirmation** via `ConfirmDeleteModal` — never silently delete.
5. **Bulk export is always safe** and requires no confirmation.

### 18.2 BulkActionBar — Generic Contract

```tsx
// src/components/ui/BulkActionBar.tsx  (already exists — Tier 1)
interface BulkAction {
  id: string;
  label: string;                        // translated by the feature view
  icon?: ReactNode;
  variant?: 'primary' | 'danger' | 'secondary';
  onClick: (selectedIds: string[]) => void;
  disabled?: boolean;                   // derived from selected items' state
  requiresConfirm?: boolean;            // true → ConfirmDeleteModal shown first
  confirmMessage?: string;
}
```

The feature view builds the `actions` array, calling `useApiMutation` hooks for each action. No role logic ever lives inside `BulkActionBar` itself.

### 18.3 Products Bulk Actions

| Action | Admin | Seller (own items) | Public |
|--------|:-----:|:-----------------:|:------:|
| Publish selected | ✓ | ✓ | — |
| Archive selected | ✓ | ✓ | — |
| Feature / Unfeature | ✓ | — | — |
| Delete selected | ✓ | ✓ (draft only) | — |
| Export CSV | ✓ | ✓ | — |
| Assign category | ✓ | — | — |

**State constraint**: "Publish" disabled if any selected item is already published. "Delete" disabled if any selected item has associated orders.

### 18.4 Auctions Bulk Actions

| Action | Admin | Seller (own items) | Public |
|--------|:-----:|:-----------------:|:------:|
| Extend deadline | ✓ | ✓ (live only) | — |
| Cancel selected | ✓ | ✓ (upcoming only) | — |
| Archive ended | ✓ | ✓ (ended only) | — |
| Feature / Unfeature | ✓ | — | — |
| Export CSV | ✓ | ✓ | — |

**State constraint**: "Extend" disabled if any selected auction has already ended. "Cancel" disabled if bids exist on any selected auction (admin can override with extra confirmation).

### 18.5 Reviews Bulk Actions

| Action | Admin | Seller (for own products) | User (own reviews) | Public |
|--------|:-----:|:------------------------:|:-----------------:|:------:|
| Approve selected | ✓ | — | — | — |
| Reject selected | ✓ | — | — | — |
| Feature / Unfeature | ✓ | — | — | — |
| Delete selected | ✓ | — | ✓ (own only) | — |
| Mark as spam | ✓ | ✓ (flag to admin) | — | — |
| Export CSV | ✓ | — | — | — |

### 18.6 Orders Bulk Actions

| Action | Admin | Seller (own orders) | User (own orders) | Public |
|--------|:-----:|:------------------:|:-----------------:|:------:|
| Mark as Processing | — | ✓ (confirmed only) | — | — |
| Mark as Shipped | ✓ | ✓ (processing only) | — | — |
| Mark as Delivered | ✓ | — | — | — |
| Cancel selected | ✓ | — | ✓ (pending only) | — |
| Request Return | — | — | ✓ (delivered only) | — |
| Export CSV | ✓ | ✓ | — | — |
| Assign tracking number | ✓ | ✓ | — | — |

**State constraint**: "Cancel" enabled only when ALL selected orders are in `pending` or `confirmed` status. Mixed-status selections disable the action with a tooltip.

### 18.7 Users Bulk Actions (Admin Only)

| Action | Admin |
|--------|:-----:|
| Enable selected | ✓ |
| Disable / Suspend | ✓ |
| Assign role | ✓ |
| Send email | ✓ |
| Export CSV | ✓ |
| Delete selected | ✓ (with strong confirm — "type DELETE to confirm") |

### 18.8 Blogs Bulk Actions

| Action | Admin | Author (own posts) | Public |
|--------|:-----:|:-----------------:|:------:|
| Publish selected | ✓ | ✓ (own drafts) | — |
| Archive selected | ✓ | ✓ (own only) | — |
| Feature / Unfeature | ✓ | — | — |
| Delete selected | ✓ | ✓ (draft only) | — |
| Export CSV | ✓ | — | — |

### 18.9 Categories Bulk Actions (Admin Only)

| Action | Admin |
|--------|:-----:|
| Activate selected | ✓ |
| Deactivate selected | ✓ |
| Feature / Unfeature | ✓ |
| Delete selected | ✓ (leaf/empty only) |
| Merge into another | ✓ |

**State constraint**: "Delete" disabled if any selected category has products. Merged categories transfer their products to the target category.

### 18.10 Events Bulk Actions (Admin Only)

| Action | Admin |
|--------|:-----:|
| Publish selected | ✓ |
| Close / End selected | ✓ |
| Feature / Unfeature | ✓ |
| Delete selected | ✓ (draft/ended only) |
| Export entries CSV | ✓ |

### 18.11 Notifications Bulk Actions (User)

| Action | User |
|--------|:----:|
| Mark as read | ✓ |
| Delete selected | ✓ |
| Mark all as read | ✓ (button, not selection-based) |

### 18.12 Entity-State Guard Pattern

Feature views evaluate the state of selected items before enabling actions. Use a helper in the feature hook:

```tsx
// Pattern in a feature view
const { selectedIds } = bulkState;
const selectedItems = data.items.filter((i) => selectedIds.includes(i.id));

const canCancel = selectedItems.length > 0
  && selectedItems.every((o) => ['pending', 'confirmed'].includes(o.status));

const canShip = selectedItems.length > 0
  && selectedItems.every((o) => o.status === 'processing');

const actions: BulkAction[] = [
  {
    id: 'cancel',
    label: t('bulkActions.cancel'),
    variant: 'danger',
    disabled: !canCancel,
    requiresConfirm: true,
    confirmMessage: t('bulkActions.cancelConfirm', { count: selectedIds.length }),
    onClick: (ids) => cancelMutation.mutate(ids),
  },
  {
    id: 'ship',
    label: t('bulkActions.markShipped'),
    variant: 'primary',
    disabled: !canShip,
    onClick: (ids) => shipMutation.mutate(ids),
  },
];
```

### 18.13 Bulk Action API Endpoints

Each bulk action maps to a dedicated `PATCH /api/<resource>/bulk` or `DELETE /api/<resource>/bulk` endpoint that accepts `{ ids: string[], action: string, payload?: object }`. The endpoint:
1. Verifies the session and role.
2. Verifies each ID belongs to the caller (sellers can only bulk-action their own items).
3. Validates the state constraint (e.g. all orders must be in `pending` before cancelling).
4. Executes as a Firestore batch write (≤500 items; chunked if more).
5. Returns `{ succeeded: string[], failed: { id, reason }[] }`.

Partial failures are surfaced via `useMessage()` toast: "X items updated, Y items failed."

---
