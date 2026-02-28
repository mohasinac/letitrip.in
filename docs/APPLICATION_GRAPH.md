# Application Graph

> **Living reference** — maps every page to its feature modules, components, hooks, services, API routes, and constants.
> Architecture tiers: **Tier 1** = Shared Primitives (`@/components`, `@/hooks`, `@/utils`, `@/helpers`, `@/constants`, `@/classes`), **Tier 2** = Feature Modules (`@/features/<name>`), **Page Layer** = `src/app/`.

---

## Table of Contents

1. [Legend](#legend)
2. [Application Structure Overview](#application-structure-overview)
3. [Page Layer](#page-layer)
   - [Public Pages](#public-pages)
   - [Auth Pages](#auth-pages)
   - [User Pages](#user-pages)
   - [Seller Pages](#seller-pages)
   - [Admin Pages](#admin-pages)
4. [Feature Modules (Tier 2)](#feature-modules-tier-2)
5. [Shared Components (Tier 1)](#shared-components-tier-1)
6. [Hooks Reference (Tier 1)](#hooks-reference-tier-1)
7. [Services Reference (Tier 1)](#services-reference-tier-1)
8. [API Routes Reference](#api-routes-reference)
9. [Constants Reference](#constants-reference)
10. [Data Layer](#data-layer)
    - [Repositories](#repositories-srcrepositories)
    - [DB Schema](#db-schema-srcdbschema)
    - [Firebase Infrastructure](#firebase-infrastructure)
11. [Mandatory Improvements](#mandatory-improvements)

---

## Legend

| Symbol | Meaning                                                                                  |
| ------ | ---------------------------------------------------------------------------------------- |
| 🟢     | Page delegates entirely to a Tier-2 feature view (thin page — correct)                   |
| 🟡     | Page has some inline logic but also uses components/features correctly                   |
| 🔴     | Page has inline logic that should be extracted or is missing existing primitives         |
| ⚠️     | Violation of codebase rules (raw fetch, raw HTML form elements, hardcoded strings, etc.) |
| 🔒     | Requires authentication                                                                  |
| 👑     | Requires admin role                                                                      |
| 🏪     | Requires seller role                                                                     |

---

## Application Structure Overview

```
src/
├── app/
│   ├── [locale]/          ← All user-facing pages (i18n-routed)
│   └── api/               ← Next.js API routes (Firebase Admin SDK)
├── features/              ← Tier 2: vertical feature slices
│   ├── admin/             ← Admin panel views & hooks
│   ├── auth/              ← Login, register, reset forms
│   ├── categories/        ← Category product listing
│   ├── events/            ← Events system (polls, surveys, feedback)
│   ├── products/          ← Product/auction listing views
│   ├── search/            ← Search view
│   ├── seller/            ← Seller product/order management views
│   └── user/              ← User order views
├── components/            ← Tier 1: shared UI primitives and feature-agnostic components
├── hooks/                 ← Tier 1: shared React hooks
├── services/              ← Tier 1: apiClient-based service functions
├── constants/             ← Tier 1: ROUTES, API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS…
├── utils/                 ← Tier 1: formatters, validators, converters
├── helpers/               ← Tier 1: auth, data, UI helpers
├── classes/               ← Tier 1: CacheManager, Logger, EventBus, Queue, StorageManager
├── repositories/          ← Firestore repository pattern (server-side)
├── db/schema/             ← Collection interfaces, field constants, schema defaults
└── lib/                   ← Firebase configs, API client, error classes, server utilities
```

---

## Page Layer

### Public Pages

---

#### `/` — Homepage 🟡

**Route constant:** `ROUTES.HOME`
**Summary:** The main landing page. Renders a Hero Carousel, welcome copy, trust signals, product/auction teasers, category navigation, customer reviews, FAQs, blog snippets, and a newsletter signup. Most sections are dynamically imported (lazy + SSR disabled) for performance. No authentication required.

| Layer             | Items                                                                                                                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `HeroCarousel`, `WelcomeSection`, `TrustFeaturesSection`, `TopCategoriesSection` _(lazy)_, `FeaturedProductsSection` _(lazy)_, `FeaturedAuctionsSection` _(lazy)_, `AdvertisementBanner` _(lazy)_, `CustomerReviewsSection` _(lazy)_, `WhatsAppCommunitySection` _(lazy)_, `FAQSection` _(lazy)_, `BlogArticlesSection` _(lazy)_, `NewsletterSection` _(lazy)_ |
| **Hooks**         | _(all inside homepage section components)_ `useHeroCarousel`, `useFeaturedProducts`, `useFeaturedAuctions`, `useTopCategories`, `useHomepageReviews`, `usePublicFaqs`, `useBlogPosts`, `useNewsletterSubscribe`, `useHomepageSections`                                                                                                                         |
| **Services**      | `productService`, `blogService`, `faqService`, `carousel.service`                                                                                                                                                                                                                                                                                              |
| **API Endpoints** | `API_ENDPOINTS.PRODUCTS.LIST`, `API_ENDPOINTS.CAROUSEL.LIST`, `API_ENDPOINTS.FAQS.LIST`, `API_ENDPOINTS.BLOG.LIST`                                                                                                                                                                                                                                             |
| **Constants**     | `SEO_CONFIG`, `generateMetadata`                                                                                                                                                                                                                                                                                                                               |

---

#### `/products` — Product Listing 🟢

**Route constant:** `ROUTES.PUBLIC.PRODUCTS`
**Summary:** Full product catalogue with filter facets, sort, pagination, and view-toggle. Delegates entirely to `ProductsView` feature component which manages all state via `useUrlTable`.

| Layer              | Items                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/products` → `ProductsView`                                                                                                             |
| **Inside feature** | `useProducts`, `useUrlTable`, `AdminFilterBar`, `DataTable`, `FilterDrawer`, `ActiveFilterChips`, `SortDropdown`, `TablePagination`, `ProductCard` |
| **Services**       | `productService.list()`                                                                                                                            |
| **API Endpoints**  | `API_ENDPOINTS.PRODUCTS.LIST`                                                                                                                      |
| **Constants**      | `ROUTES.PUBLIC.PRODUCTS`, `THEME_CONSTANTS`                                                                                                        |

---

#### `/products/[slug]` — Product Detail 🟡

**Route constant:** `ROUTES.PUBLIC.PRODUCT_DETAIL(slug)`
**Summary:** Displays full product details — image gallery, info panel, add-to-cart, reviews section, and related products. Uses `useApiQuery` with `productService.getById()`.

| Layer             | Items                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------- |
| **Components**    | `ProductImageGallery`, `ProductInfo`, `ProductReviews`, `AddToCartButton`, `RelatedProducts` |
| **Hooks**         | `useApiQuery`                                                                                |
| **Services**      | `productService.getById()`                                                                   |
| **API Endpoints** | `API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)`                                                       |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                                                                  |
| **Schema Types**  | `ProductDocument`                                                                            |

---

#### `/auctions` — Auction Listing 🟢

**Route constant:** `ROUTES.PUBLIC.AUCTIONS`
**Summary:** Live auction catalogue. Delegates entirely to `AuctionsView`.

| Layer              | Items                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| **Feature**        | `@/features/products` → `AuctionsView`                                      |
| **Inside feature** | `useAuctions`, `useUrlTable`, `AuctionCard`, `DataTable`, `TablePagination` |
| **Services**       | `productService.listAuctions()`                                             |
| **API Endpoints**  | `API_ENDPOINTS.PRODUCTS.LIST`                                               |

---

#### `/auctions/[id]` — Auction Detail 🟡

**Route constant:** `ROUTES.PUBLIC.AUCTION_DETAIL(id)`
**Summary:** Shows detailed auction info, current bids, countdown timer, and bid placement form. Uses real-time Firestore listener via `useRealtimeBids`.

| Layer                | Items                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| **Components**       | `AuctionDetailView`                                                                                |
| **Inside component** | `useAuctionDetail`, `useRealtimeBids`, `usePlaceBid`, `useCountdown`, `BidHistory`, `PlaceBidForm` |
| **Services**         | `bidService`, `productService`                                                                     |
| **API Endpoints**    | `API_ENDPOINTS.BIDS.LIST`, `API_ENDPOINTS.BIDS.CREATE`                                             |

---

#### `/categories` — Category Browser �

**Route constant:** `ROUTES.PUBLIC.CATEGORIES`
**Summary:** Grid of all product categories with client-side search filter. Uses `categoryService.list()` via `useApiQuery`. Uses `Input` component for search.

> ✅ Rule 19 fixed (TASK-01): now uses `categoryService.list()` instead of raw `fetch()`.

| Layer             | Items                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| **Components**    | `CategoryGrid`, `Spinner`, `Input` _(should replace raw `<input>`)_     |
| **Hooks**         | `useApiQuery`                                                           |
| **Services**      | ⚠️ _Should use_ `categoryService.list()` — currently uses raw `fetch()` |
| **API Endpoints** | `API_ENDPOINTS.CATEGORIES.LIST`                                         |
| **Constants**     | `THEME_CONSTANTS`                                                       |
| **Schema Types**  | `CategoryDocument`                                                      |

---

#### `/categories/[slug]` — Category Products 🟢

**Route constant:** `ROUTES.PUBLIC.CATEGORIES` + slug param
**Summary:** Filtered product listing for a specific category. Delegates entirely to `CategoryProductsView`.

| Layer              | Items                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/categories` → `CategoryProductsView`                                       |
| **Inside feature** | `useCategoryProducts`, `useUrlTable`, `ProductCard`, `FilterDrawer`, `TablePagination` |
| **Services**       | `categoryService.getBySlug()`, `productService.list()`                                 |
| **API Endpoints**  | `API_ENDPOINTS.CATEGORIES.GET_BY_SLUG(slug)`, `API_ENDPOINTS.PRODUCTS.LIST`            |

---

#### `/search` — Search Results 🟢

**Route constant:** `ROUTES.PUBLIC.SEARCH`
**Summary:** Full-text product search with filters and facets. Delegates entirely to `SearchView`.

| Layer              | Items                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/search` → `SearchView`                                                                |
| **Inside feature** | `useSearch`, `useUrlTable`, `ProductCard`, `ActiveFilterChips`, `FilterDrawer`, `TablePagination` |
| **Services**       | `searchService.search()`                                                                          |
| **API Endpoints**  | `API_ENDPOINTS.SEARCH`                                                                            |

---

#### `/blog` — Blog Listing 🟡

**Route constant:** `ROUTES.BLOG.LIST`
**Summary:** Paginated blog post listing with category tab filter. State managed via `useUrlTable`.

| Layer             | Items                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Components**    | `BlogCard`, `BlogFeaturedCard`, `BlogCategoryTabs`, `EmptyState`, `Spinner`, `Pagination` |
| **Hooks**         | `useBlogPosts`, `useUrlTable`                                                             |
| **Services**      | `blogService.list()`                                                                      |
| **API Endpoints** | `API_ENDPOINTS.BLOG.LIST`                                                                 |
| **Constants**     | `THEME_CONSTANTS`                                                                         |
| **Schema Types**  | `BlogPostCategory`                                                                        |

---

#### `/blog/[slug]` — Blog Article 🟡

**Route constant:** `ROUTES.BLOG.ARTICLE(slug)`
**Summary:** Single blog post full view with rich text content and related posts. Uses `formatDate` from `@/utils`.

| Layer             | Items                                  |
| ----------------- | -------------------------------------- |
| **Components**    | `Card`, `Button`, `Spinner`            |
| **Hooks**         | `useApiQuery`                          |
| **Services**      | `blogService.getBySlug()`              |
| **API Endpoints** | `API_ENDPOINTS.BLOG.GET_BY_SLUG(slug)` |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`            |
| **Utils**         | `formatDate`                           |
| **Schema Types**  | `BlogPostDocument`, `BlogPostCategory` |

---

#### `/faqs` — FAQ Home 🟡

**Route constant:** `ROUTES.PUBLIC.FAQS`
**Summary:** FAQ listing with category sidebar, search, sort, and helpful votes. Delegates rendering to `FAQPageContent`.

| Layer                | Items                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**       | `FAQPageContent`                                                                                                                                         |
| **Inside component** | `usePublicFaqs`, `useFaqVote`, `FAQAccordion`, `FAQCategorySidebar`, `FAQSearchBar`, `FAQSortDropdown`, `FAQHelpfulButtons`, `RelatedFAQs`, `ContactCTA` |
| **Services**         | `faqService.list()`, `faqService.vote()`                                                                                                                 |
| **API Endpoints**    | `API_ENDPOINTS.FAQS.LIST`, `API_ENDPOINTS.FAQS.VOTE(id)`                                                                                                 |
| **Constants**        | `SEO_CONFIG`, `THEME_CONSTANTS`, `FAQ_CATEGORIES`                                                                                                        |

---

#### `/faqs/[category]` — FAQ by Category 🟡

**Route constant:** `ROUTES.PUBLIC.FAQ_CATEGORY(category)`
**Summary:** Same as `/faqs` but pre-filters to a specific category. Validates category against `FAQ_CATEGORIES`, redirects to `/faqs` if invalid. Delegates rendering to `FAQPageContent`.

| Layer            | Items                                         |
| ---------------- | --------------------------------------------- |
| **Components**   | `FAQPageContent`                              |
| **Constants**    | `FAQ_CATEGORIES`, `ROUTES`, `THEME_CONSTANTS` |
| **Schema Types** | `FAQCategoryKey`                              |

---

#### `/events` — Events Listing 🟡

**Route constant:** `ROUTES.PUBLIC.EVENTS`
**Summary:** Public events listing showing active and past events. Uses `EventCard` from `@/features/events`.

| Layer             | Items                                             |
| ----------------- | ------------------------------------------------- |
| **Components**    | `EmptyState`, `Spinner`                           |
| **Feature**       | `@/features/events` → `EventCard`, `eventService` |
| **Hooks**         | `useApiQuery`                                     |
| **Services**      | `eventService.list()`                             |
| **API Endpoints** | `API_ENDPOINTS.EVENTS.LIST`                       |
| **Constants**     | `THEME_CONSTANTS`                                 |
| **Schema Types**  | `EventDocument`                                   |

---

#### `/events/[id]` — Event Detail 🟡

**Route constant:** `ROUTES.PUBLIC.EVENT_DETAIL(id)`
**Summary:** Full event detail page showing event type-specific UI — polls, surveys, or feedback forms. Renders appropriate section component based on event type.

| Layer             | Items                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `Card`, `Spinner`, `EmptyState`                                                                                                                 |
| **Feature**       | `@/features/events` → `EventStatusBadge`, `PollVotingSection`, `SurveyEventSection`, `FeedbackEventSection`, `EventLeaderboard`, `eventService` |
| **Hooks**         | `useApiQuery`                                                                                                                                   |
| **Services**      | `eventService.getById()`                                                                                                                        |
| **API Endpoints** | `API_ENDPOINTS.EVENTS.GET_BY_ID(id)`                                                                                                            |
| **Constants**     | `UI_LABELS`, `THEME_CONSTANTS`                                                                                                                  |
| **Utils**         | `formatDate`                                                                                                                                    |
| **Schema Types**  | `EventDocument`                                                                                                                                 |

---

#### `/events/[id]/participate` — Event Participation �🔒

**Route constant:** `ROUTES.PUBLIC.EVENT_PARTICIPATE(id)`
**Summary:** Authenticated users submit survey/event responses. Dynamically renders form fields based on event configuration.

| Layer             | Items                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Components**    | `EventParticipateView` (from `@/features/events`), `Card`, `Spinner`, `Alert`, `FormField`, `Button`, `Input` |
| **Hooks**         | `useApiQuery`, `useAuth`, `useApiMutation`, `useMessage`                                                      |
| **Services**      | `eventService.enter()`                                                                                        |
| **API Endpoints** | `API_ENDPOINTS.EVENTS.ENTER(id)`                                                                              |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`, `SUCCESS_MESSAGES`, `ERROR_MESSAGES`                                             |
| **Utils**         | `formatDate`                                                                                                  |
| **Schema Types**  | `EventDocument`, `SurveyFormField`                                                                            |

---

#### `/contact` — Contact Page 🟡

**Route constant:** `ROUTES.PUBLIC.CONTACT`
**Summary:** Contact form and contact info sidebar. Form submits to `/api/contact`.

| Layer                  | Items                                              |
| ---------------------- | -------------------------------------------------- |
| **Components**         | `ContactForm`, `ContactInfoSidebar`                |
| **Inside ContactForm** | `useContactSubmit`, `FormField`, `Button`, `Alert` |
| **Services**           | `contactService.submit()`                          |
| **API Endpoints**      | `API_ENDPOINTS.CONTACT`                            |

---

#### `/about` — About Page 🟡

**Route constant:** `ROUTES.PUBLIC.ABOUT`
**Summary:** Static about-us page with site info, team section, and value proposition copy.

| Layer         | Items                                      |
| ------------- | ------------------------------------------ |
| **Constants** | `ROUTES`, `THEME_CONSTANTS`, `SITE_CONFIG` |

---

#### `/promotions` — Promotions 🟡

**Route constant:** `ROUTES.PUBLIC.PROMOTIONS`
**Summary:** Displays active promocodes and featured product sections.

| Layer             | Items                                     |
| ----------------- | ----------------------------------------- |
| **Components**    | `Spinner`, `CouponCard`, `ProductSection` |
| **Hooks**         | `usePromotions`                           |
| **Services**      | `promotionsService.list()`                |
| **API Endpoints** | `API_ENDPOINTS.PROMOTIONS`                |
| **Constants**     | `THEME_CONSTANTS`                         |

---

#### `/sellers` — Sellers Directory 🔴

**Route constant:** `ROUTES.PUBLIC.SELLERS`
**Summary:** Server-rendered static sellers directory page.

> ⚠️ Heavy raw HTML — could benefit from shared layout components (`Card`, `Text`, `Button`).

| Layer         | Items                                      |
| ------------- | ------------------------------------------ |
| **Constants** | `ROUTES`, `THEME_CONSTANTS`, `SITE_CONFIG` |

---

#### `/sellers/[id]` — Seller Storefront 🟡

**Route constant:** `ROUTES.PUBLIC.SELLER_DETAIL(id)`
**Summary:** Public seller storefront with their product listings and reviews.

| Layer             | Items                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Components**    | `Card`, `Alert`, `Text`, `SellerStorefrontView`                                                                                            |
| **Hooks**         | `useSellerStorefront`                                                                                                                      |
| **Services**      | `profileService.getById()`, `productService.list()`, `reviewService.list()`                                                                |
| **API Endpoints** | `API_ENDPOINTS.PROFILE.GET_BY_ID(id)`, `API_ENDPOINTS.PROFILE.GET_STOREFRONT_PRODUCTS(id)`, `API_ENDPOINTS.PROFILE.GET_SELLER_REVIEWS(id)` |
| **Constants**     | `ROUTES`                                                                                                                                   |

---

#### `/profile/[userId]` — Public User Profile 🟡

**Route constant:** `ROUTES.PUBLIC.PROFILE(userId)`
**Summary:** Public profile page showing user/seller info.

| Layer             | Items                                        |
| ----------------- | -------------------------------------------- |
| **Components**    | `Card`, `Alert`, `Text`, `PublicProfileView` |
| **Hooks**         | `usePublicProfile`                           |
| **Services**      | `profileService.getById()`                   |
| **API Endpoints** | `API_ENDPOINTS.PROFILE.GET_BY_ID(userId)`    |
| **Constants**     | `ERROR_MESSAGES`, `ROUTES`                   |
| **Utils**         | `formatMonthYear`                            |

---

#### `/help` — Help Center 🔴

**Route constant:** `ROUTES.PUBLIC.HELP`
**Summary:** Server-rendered help center static page.

> ⚠️ Heavy raw HTML — could use `Card`, `Text`, `Button` primitives.

| Layer         | Items                                      |
| ------------- | ------------------------------------------ |
| **Constants** | `ROUTES`, `THEME_CONSTANTS`, `SITE_CONFIG` |

---

#### `/privacy` — Privacy Policy 🟡

**Route constant:** `ROUTES.PUBLIC.PRIVACY`
**Summary:** Server-rendered privacy policy. Server component with `getTranslations`.

| Layer         | Items                                      |
| ------------- | ------------------------------------------ |
| **Constants** | `ROUTES`, `THEME_CONSTANTS`, `SITE_CONFIG` |

---

#### `/terms` — Terms of Service 🟡

**Route constant:** `ROUTES.PUBLIC.TERMS` _(implied)_
**Summary:** Server-rendered terms of service. Server component with `getTranslations`.

| Layer         | Items                                      |
| ------------- | ------------------------------------------ |
| **Constants** | `ROUTES`, `THEME_CONSTANTS`, `SITE_CONFIG` |

---

#### `/unauthorized` — Unauthorized 🟡

**Route constant:** `ROUTES.ERRORS.UNAUTHORIZED`
**Summary:** Shown when a user tries to access a page without the required role. Has a countdown redirect.

| Layer          | Items                       |
| -------------- | --------------------------- |
| **Components** | `Button`                    |
| **Constants**  | `ROUTES`, `THEME_CONSTANTS` |

---

### Auth Pages

---

#### `/auth/login` — Login 🟢

**Route constant:** `ROUTES.AUTH.LOGIN`
**Summary:** Email/password login form. Delegates to `LoginForm` feature component.

| Layer              | Items                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| **Feature**        | `@/features/auth` → `LoginForm`                                            |
| **Inside feature** | `useLogin`, `useForm`, `FormField`, `Button`, `Alert`, `AuthSocialButtons` |
| **Services**       | `authService.login()`                                                      |
| **API Endpoints**  | `API_ENDPOINTS.AUTH.LOGIN`, `API_ENDPOINTS.AUTH.CREATE_SESSION`            |
| **Constants**      | `ROUTES`, `THEME_CONSTANTS`, `ERROR_MESSAGES`                              |

---

#### `/auth/register` — Register 🟢

**Route constant:** `ROUTES.AUTH.REGISTER`
**Summary:** User registration form. Delegates to `RegisterForm` feature component.

| Layer              | Items                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/auth` → `RegisterForm`                                                                         |
| **Inside feature** | `useRegister`, `useForm`, `FormField`, `Button`, `Alert`, `PasswordStrengthIndicator`, `AuthSocialButtons` |
| **Services**       | `authService.register()`                                                                                   |
| **API Endpoints**  | `API_ENDPOINTS.AUTH.REGISTER`                                                                              |
| **Constants**      | `ROUTES`, `THEME_CONSTANTS`, `ERROR_MESSAGES`                                                              |

---

#### `/auth/forgot-password` — Forgot Password 🔴

**Route constant:** `ROUTES.AUTH.FORGOT_PASSWORD`
**Summary:** Sends a password reset email. Inline logic in page.

> ⚠️ Inline page logic — should delegate to a `ForgotPasswordView` in `@/features/auth`.

| Layer             | Items                                                     |
| ----------------- | --------------------------------------------------------- |
| **Components**    | `Card`, `Button`, `Alert`, `FormField`, `Heading`, `Text` |
| **Hooks**         | `useForgotPassword`                                       |
| **Services**      | `authService.forgotPassword()`                            |
| **API Endpoints** | `API_ENDPOINTS.AUTH.FORGOT_PASSWORD`                      |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                               |

---

#### `/auth/reset-password` — Reset Password 🟢

**Route constant:** `ROUTES.AUTH.RESET_PASSWORD`
**Summary:** Accepts a reset token from query params and allows setting a new password. Delegates to `ResetPasswordView`.

| Layer              | Items                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| **Feature**        | `@/features/auth` → `ResetPasswordView`                                         |
| **Inside feature** | `useResetPassword`, `FormField`, `Button`, `Alert`, `PasswordStrengthIndicator` |
| **Services**       | `authService.resetPassword()`                                                   |
| **API Endpoints**  | `API_ENDPOINTS.AUTH.RESET_PASSWORD`                                             |
| **Constants**      | `ROUTES`, `THEME_CONSTANTS`, `ERROR_MESSAGES`                                   |

---

#### `/auth/verify-email` — Verify Email 🔴

**Route constant:** `ROUTES.AUTH.VERIFY_EMAIL`
**Summary:** Token-based email verification. Inline page logic.

> ⚠️ Inline page logic — could be extracted to a `VerifyEmailView` in `@/features/auth`.

| Layer             | Items                                                   |
| ----------------- | ------------------------------------------------------- |
| **Components**    | `Card`, `Button`, `Alert`, `Spinner`, `Heading`, `Text` |
| **Hooks**         | `useVerifyEmail`                                        |
| **Services**      | `authService.verifyEmail()`                             |
| **API Endpoints** | `API_ENDPOINTS.AUTH.VERIFY_EMAIL`                       |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                             |

---

### User Pages

All user pages require authentication (`🔒`). Protected by middleware RBAC.

---

#### `/user/profile` — User Profile 🔴🔒

**Route constant:** `ROUTES.USER.PROFILE`
**Summary:** Displays the authenticated user's profile with stats (orders, addresses). Stat queries extracted to `useProfileStats` hook (TASK-14 ✅).

| Layer             | Items                                                               |
| ----------------- | ------------------------------------------------------------------- |
| **Components**    | `Heading`, `Button`, `Spinner`, `ProfileHeader`, `ProfileStatsGrid` |
| **Hooks**         | `useAuth`, `useProfileStats`                                        |
| **Services**      | `orderService.list()`, `addressService.list()`                      |
| **API Endpoints** | `API_ENDPOINTS.ORDERS.LIST`, `API_ENDPOINTS.ADDRESSES.LIST`         |
| **Constants**     | `THEME_CONSTANTS`, `ROUTES`                                         |

---

#### `/user/orders` — Order History 🟢🔒

**Route constant:** `ROUTES.USER.ORDERS`
**Summary:** Paginated order history list. Delegates entirely to `UserOrdersView`.

| Layer              | Items                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| **Feature**        | `@/features/user` → `UserOrdersView`                                         |
| **Inside feature** | `useUserOrders`, `useUrlTable`, `DataTable`, `TablePagination`, `EmptyState` |
| **Services**       | `orderService.list()`                                                        |
| **API Endpoints**  | `API_ENDPOINTS.ORDERS.LIST`                                                  |

---

#### `/user/orders/view/[id]` — Order Detail 🟢🔒

**Route constant:** `ROUTES.USER.ORDER_DETAIL(id)`
**Summary:** Full order detail view. Delegates entirely to `OrderDetailView`.

| Layer              | Items                                            |
| ------------------ | ------------------------------------------------ |
| **Feature**        | `@/features/user` → `OrderDetailView`            |
| **Inside feature** | `useOrderDetail`, `Button`, `Card`, `EmptyState` |
| **Services**       | `orderService.getById()`                         |
| **API Endpoints**  | `API_ENDPOINTS.ORDERS.GET_BY_ID(id)`             |

---

#### `/user/orders/[id]/track` — Order Tracking 🟡🔒

**Route constant:** `ROUTES.USER.ORDER_TRACK(id)`
**Summary:** Real-time order tracking view. Uses `OrderTrackingView` component.

| Layer             | Items                                                  |
| ----------------- | ------------------------------------------------------ |
| **Components**    | `Spinner`, `Button`, `EmptyState`, `OrderTrackingView` |
| **Hooks**         | `useAuth`, `useApiQuery`                               |
| **Services**      | `orderService.track()`                                 |
| **API Endpoints** | `API_ENDPOINTS.ORDERS.TRACK(id)`                       |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                            |
| **Schema Types**  | `OrderDocument`                                        |

---

#### `/user/addresses` — Address Book 🟡🔒

**Route constant:** `ROUTES.USER.ADDRESSES`
**Summary:** Lists all saved addresses with edit, delete, and set-default actions.

| Layer             | Items                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Components**    | `Heading`, `Button`, `Spinner`, `EmptyState`, `AddressCard`, `ConfirmDeleteModal`                               |
| **Hooks**         | `useAuth`, `useAddresses`, `useDeleteAddress`, `useSetDefaultAddress`, `useMessage`                             |
| **Services**      | `addressService.list()`, `addressService.delete()`, `addressService.setDefault()`                               |
| **API Endpoints** | `API_ENDPOINTS.ADDRESSES.LIST`, `API_ENDPOINTS.ADDRESSES.DELETE(id)`, `API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id)` |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`, `SUCCESS_MESSAGES`, `ERROR_MESSAGES`                                               |

---

#### `/user/addresses/add` — Add Address 🟡🔒

**Route constant:** `ROUTES.USER.ADDRESSES_ADD`
**Summary:** Form to create a new saved address.

| Layer             | Items                                                             |
| ----------------- | ----------------------------------------------------------------- |
| **Components**    | `Card`, `Heading`, `Spinner`, `AddressForm`                       |
| **Hooks**         | `useAuth`                                                         |
| **Services**      | `addressService.create()`                                         |
| **API Endpoints** | `API_ENDPOINTS.ADDRESSES.CREATE`                                  |
| **Constants**     | `THEME_CONSTANTS`, `ROUTES`, `SUCCESS_MESSAGES`, `ERROR_MESSAGES` |
| **Classes**       | `logger`                                                          |

---

#### `/user/addresses/edit/[id]` — Edit Address 🟡🔒

**Route constant:** `ROUTES.USER.ADDRESSES_EDIT(id)`
**Summary:** Pre-fills an existing address for editing, with delete option.

| Layer             | Items                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `Card`, `Heading`, `Button`, `Spinner`, `AddressForm`, `ConfirmDeleteModal`                                         |
| **Hooks**         | `useAuth`, `useApiQuery`                                                                                            |
| **Services**      | `addressService.getById()`, `addressService.update()`, `addressService.delete()`                                    |
| **API Endpoints** | `API_ENDPOINTS.ADDRESSES.GET_BY_ID(id)`, `API_ENDPOINTS.ADDRESSES.UPDATE(id)`, `API_ENDPOINTS.ADDRESSES.DELETE(id)` |
| **Constants**     | `THEME_CONSTANTS`, `ROUTES`, `SUCCESS_MESSAGES`, `ERROR_MESSAGES`                                                   |

---

#### `/user/wishlist` — Wishlist 🟡🔒

**Route constant:** `ROUTES.USER.WISHLIST`
**Summary:** Grid of wishlisted products with remove functionality per item.

| Layer             | Items                                                    |
| ----------------- | -------------------------------------------------------- |
| **Components**    | `Spinner`, `EmptyState`, `ProductGrid`, `WishlistButton` |
| **Hooks**         | `useAuth`, `useApiQuery`                                 |
| **Services**      | `wishlistService.list()`                                 |
| **API Endpoints** | `API_ENDPOINTS.USER.WISHLIST.LIST`                       |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                              |
| **Schema Types**  | `ProductDocument`                                        |

---

#### `/user/settings` — Account Settings 🟡🔒

**Route constant:** `ROUTES.USER.SETTINGS`
**Summary:** Comprehensive settings page: profile info, email verification, phone verification, password change, and account info/deletion.

| Layer             | Items                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `Heading`, `Alert`, `Spinner`, `EmailVerificationCard`, `PhoneVerificationCard`, `ProfileInfoForm`, `PasswordChangeForm`, `AccountInfoCard`          |
| **Hooks**         | `useAuth`, `useChangePassword`, `useResendVerification`                                                                                              |
| **Services**      | `profileService.update()`, `profileService.deleteAccount()`                                                                                          |
| **API Endpoints** | `API_ENDPOINTS.USER.PROFILE`, `API_ENDPOINTS.USER.CHANGE_PASSWORD`, `API_ENDPOINTS.AUTH.RESEND_VERIFICATION`, `API_ENDPOINTS.PROFILE.DELETE_ACCOUNT` |
| **Constants**     | `THEME_CONSTANTS`, `SUCCESS_MESSAGES`, `ERROR_MESSAGES`, `ROUTES`                                                                                    |
| **Classes**       | `logger`                                                                                                                                             |

---

#### `/user/notifications` — Notifications 🟡🔒

**Route constant:** `ROUTES.USER.NOTIFICATIONS`
**Summary:** Lists all notifications with mark-read, bulk mark-all-read actions.

| Layer             | Items                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Components**    | `Spinner`, `EmptyState`, `NotificationItem`, `NotificationsBulkActions`                             |
| **Hooks**         | `useAuth`, `useApiQuery`, `useApiMutation`, `useMessage`                                            |
| **Services**      | `notificationService.list()`, `notificationService.markRead()`, `notificationService.markAllRead()` |
| **API Endpoints** | `API_ENDPOINTS.NOTIFICATIONS.LIST`, `API_ENDPOINTS.NOTIFICATIONS.READ_ALL`                          |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                                                                         |
| **Schema Types**  | `NotificationDocument`                                                                              |

---

#### `/cart` — Shopping Cart 🟡🔒

**Route constant:** `ROUTES.USER.CART`
**Summary:** Cart with item list, quantity controls, promo code field, and order summary.

| Layer             | Items                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **Components**    | `CartItemList`, `CartSummary`, `PromoCodeInput`                                                      |
| **Hooks**         | `useApiQuery`, `useApiMutation`, `useMessage`                                                        |
| **Services**      | `cartService.get()`, `cartService.update()`, `cartService.remove()`                                  |
| **API Endpoints** | `API_ENDPOINTS.CART.GET`, `API_ENDPOINTS.CART.UPDATE_ITEM(id)`, `API_ENDPOINTS.CART.REMOVE_ITEM(id)` |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`                                    |
| **Schema Types**  | `CartDocument`                                                                                       |

---

#### `/checkout` — Checkout 🟢🔒

**Route constant:** `ROUTES.USER.CHECKOUT`
**Summary:** Multi-step checkout (address → order review → payment). Delegates entirely to `CheckoutView`.

| Layer                | Items                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**       | `CheckoutView`                                                                                                                          |
| **Inside component** | `useCheckout`, `useCouponValidate`, `useRazorpay`, `CheckoutAddressStep`, `CheckoutOrderReview`, `CheckoutStepper`, `OrderSummaryPanel` |
| **Services**         | `checkoutService`, `couponService`, `paymentService`                                                                                    |
| **API Endpoints**    | `API_ENDPOINTS.CHECKOUT`, `API_ENDPOINTS.COUPONS.VALIDATE`, `API_ENDPOINTS.PAYMENT.CREATE_ORDER`, `API_ENDPOINTS.PAYMENT.VERIFY`        |

---

#### `/checkout/success` — Order Success 🟡🔒

**Route constant:** `ROUTES.USER.CHECKOUT_SUCCESS`
**Summary:** Post-payment success screen showing order confirmation details.

| Layer             | Items                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| **Components**    | `Spinner`, `OrderSuccessHero`, `OrderSuccessCard`, `OrderSuccessActions` |
| **Hooks**         | `useApiQuery`                                                            |
| **Services**      | `orderService.getById()`                                                 |
| **API Endpoints** | `API_ENDPOINTS.ORDERS.GET_BY_ID(id)`                                     |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                                              |
| **Schema Types**  | `OrderDocument`                                                          |

---

### Seller Pages

All seller pages require authentication + seller/admin role (`🏪🔒`). Protected by middleware RBAC.

---

#### `/seller` — Seller Dashboard 🔴🏪🔒

**Route constant:** `ROUTES.SELLER.DASHBOARD`
**Summary:** Seller overview with stat cards (products, orders, revenue, bids) and recent listings.

> ✅ TASK-15 complete — extracted to `SellerDashboardView` in `@/features/seller`. Page is now a 10-line thin shell.
> `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings` moved to `src/features/seller/components/`.

| Layer             | Items                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature View**  | `SellerDashboardView` (`@/features/seller`)                                                                                             |
| **Components**    | `Spinner`, `EmptyState`, `Heading`, `Text`, `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings` (all in `@/features/seller`) |
| **Hooks**         | `useAuth`, `useApiQuery`                                                                                                                |
| **Services**      | `sellerService.listProducts(uid)`                                                                                                       |
| **API Endpoints** | `API_ENDPOINTS.SELLER.ANALYTICS`                                                                                                        |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                                                                                                             |

---

#### `/seller/products` — Seller Products 🟢🏪🔒

**Route constant:** `ROUTES.SELLER.PRODUCTS`
**Summary:** Seller's own product management list. Delegates entirely to `SellerProductsView`.

| Layer              | Items                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/seller` → `SellerProductsView`                                                                 |
| **Inside feature** | `useSellerProducts`, `useUrlTable`, `DataTable`, `AdminPageHeader`, `TablePagination`, `SellerProductCard` |
| **Services**       | `productService.listMySelling()`                                                                           |
| **API Endpoints**  | `API_ENDPOINTS.PRODUCTS.LIST` (filtered by seller)                                                         |

---

#### `/seller/products/[id]/edit` — Edit Seller Product 🟡🏪🔒

**Route constant:** `ROUTES.SELLER.PRODUCTS_EDIT(id)`
**Summary:** Full product editing form reusing admin `ProductForm`. Auth-checks seller owns the product.

| Layer             | Items                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| **Components**    | `Card`, `Button`, `Spinner`, `Alert`, `AdminPageHeader`, `ProductForm`      |
| **Hooks**         | `useAuth`, `useApiQuery`, `useMessage`                                      |
| **Services**      | `productService.getById()`, `productService.update()`                       |
| **API Endpoints** | `API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)`, `API_ENDPOINTS.PRODUCTS.UPDATE(id)` |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`, `SUCCESS_MESSAGES`, `ERROR_MESSAGES`           |

---

#### `/seller/orders` — Seller Orders 🟢🏪🔒

**Route constant:** `ROUTES.SELLER.ORDERS`
**Summary:** Seller's incoming orders list. Delegates entirely to `SellerOrdersView`.

| Layer              | Items                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| **Feature**        | `@/features/seller` → `SellerOrdersView`                                            |
| **Inside feature** | `useSellerOrders`, `useUrlTable`, `DataTable`, `TablePagination`, `AdminPageHeader` |
| **Services**       | `sellerService.listOrders()`                                                        |
| **API Endpoints**  | `API_ENDPOINTS.SELLER.ORDERS`                                                       |

---

#### `/seller/analytics` — Seller Analytics 🟡🏪🔒

**Route constant:** `ROUTES.SELLER.ANALYTICS`
**Summary:** Revenue chart, top products list, and summary stats for the seller's store.

| Layer             | Items                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| **Components**    | `Spinner`, `SellerAnalyticsStats`, `SellerRevenueChart`, `SellerTopProducts` |
| **Hooks**         | `useAuth`, `useApiQuery`                                                     |
| **Services**      | `sellerService.getAnalytics()`                                               |
| **API Endpoints** | `API_ENDPOINTS.SELLER.ANALYTICS`                                             |
| **Constants**     | `THEME_CONSTANTS`, `ROUTES`                                                  |
| **Helpers**       | `hasAnyRole`                                                                 |

---

#### `/seller/payouts` — Seller Payouts 🟡🏪🔒

**Route constant:** `ROUTES.SELLER.PAYOUTS`
**Summary:** Payout stats, request form, and payout history table.

| Layer             | Items                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| **Components**    | `SellerPayoutStats`, `SellerPayoutRequestForm`, `SellerPayoutHistoryTable` |
| **Hooks**         | `useAuth`, `useApiQuery`, `useApiMutation`, `useMessage`                   |
| **Services**      | `sellerService.getPayouts()`, `sellerService.requestPayout()`              |
| **API Endpoints** | `API_ENDPOINTS.SELLER.PAYOUTS`                                             |
| **Constants**     | `THEME_CONSTANTS`, `ROUTES`                                                |

---

### Admin Pages

All admin pages require authentication + admin role (`👑🔒`). Protected by middleware RBAC.

---

#### `/admin/dashboard` — Admin Dashboard 🟡👑🔒

**Route constant:** `ROUTES.ADMIN.DASHBOARD`
**Summary:** High-level stats, quick action grid, and recent activity feed.

| Layer             | Items                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `Card`, `Button`, `Heading`, `AdminStatsCards`, `AdminPageHeader`, `QuickActionsGrid`, `RecentActivityCard`, `AdminDashboardSkeleton` |
| **Hooks**         | `useAuth`, `useAdminStats`                                                                                                            |
| **Services**      | `adminService.getDashboard()`                                                                                                         |
| **API Endpoints** | `API_ENDPOINTS.ADMIN.DASHBOARD`                                                                                                       |
| **Constants**     | `ROUTES`, `THEME_CONSTANTS`                                                                                                           |

---

#### `/admin/products` — Admin Products 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.PRODUCTS`
**Summary:** Full product CRUD — list, create, edit, delete. Delegates entirely to `AdminProductsView`.

| Layer              | Items                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminProductsView`                                                                                                                                                             |
| **Inside feature** | `useAdminProducts`, `useUrlTable`, `DataTable`, `AdminPageHeader`, `AdminFilterBar`, `SideDrawer`, `ProductForm`, `DrawerFormFooter`, `ProductTableColumns`, `TablePagination`, `ConfirmDeleteModal` |
| **Services**       | `adminService` product methods                                                                                                                                                                       |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.PRODUCTS`, `API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id)`                                                                                                                              |

---

#### `/admin/orders` — Admin Orders 🟡👑🔒

**Route constant:** `ROUTES.ADMIN.ORDERS`
**Summary:** All-orders management with status update actions. Thin shell delegating to `AdminOrdersView` in `@/features/admin` (TASK-13 ✅).

| Layer             | Items                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `Card`, `Button`, `SideDrawer`, `DataTable`, `AdminPageHeader`, `DrawerFormFooter`, `OrderTableColumns`, `OrderStatusForm`, `TablePagination` |
| **Hooks**         | `useApiQuery`, `useApiMutation`, `useMessage`, `useUrlTable`                                                                                  |
| **Services**      | `adminService.listOrders()`, `adminService.updateOrder()`                                                                                     |
| **API Endpoints** | `API_ENDPOINTS.ADMIN.ORDERS`, `API_ENDPOINTS.ADMIN.ORDER_BY_ID(id)`                                                                           |
| **Constants**     | `ROUTES`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`                                                                                                |
| **Schema Types**  | `OrderDocument`                                                                                                                               |

---

#### `/admin/users` — Admin Users 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.USERS`
**Summary:** User management with role, status, and session controls. Delegates entirely to `AdminUsersView`.

| Layer              | Items                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminUsersView`                                                                                                                      |
| **Inside feature** | `useAdminUsers`, `useUrlTable`, `DataTable`, `AdminPageHeader`, `AdminFilterBar`, `UserTableColumns`, `UserDetailDrawer`, `UserFilters`, `TablePagination` |
| **Services**       | `adminService` user methods                                                                                                                                |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.USERS`, `API_ENDPOINTS.ADMIN.USER_BY_ID(uid)`                                                                                         |

---

#### `/admin/analytics` — Admin Analytics 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.ANALYTICS`
**Summary:** Revenue and order count charts. Delegates entirely to `AdminAnalyticsView`.

| Layer              | Items                                                     |
| ------------------ | --------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminAnalyticsView`                 |
| **Inside feature** | `useAdminAnalytics`, `AdminPageHeader`, `AdminStatsCards` |
| **Services**       | `adminService.getAnalytics()`                             |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.ANALYTICS`                           |

---

#### `/admin/categories` — Admin Categories 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.CATEGORIES`
**Summary:** Category CRUD with tree view. Delegates entirely to `AdminCategoriesView`.

| Layer              | Items                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Feature**        | `@/features/admin` → `AdminCategoriesView`                                                                                                                                                 |
| **Inside feature** | `useAdminCategories`, `DataTable`, `AdminPageHeader`, `CategoryForm`, `CategoryTableColumns`, `CategoryTreeView`, `SideDrawer`, `DrawerFormFooter`, `ConfirmDeleteModal`                   |
| **Services**       | `adminService` category methods                                                                                                                                                            |
| **API Endpoints**  | `API_ENDPOINTS.CATEGORIES.LIST`, `API_ENDPOINTS.CATEGORIES.CREATE`, `API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)`, `API_ENDPOINTS.CATEGORIES.UPDATE(id)`, `API_ENDPOINTS.CATEGORIES.DELETE(id)` |

---

#### `/admin/reviews` — Admin Reviews 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.REVIEWS`
**Summary:** Review moderation — approve/reject. Delegates entirely to `AdminReviewsView`.

| Layer              | Items                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Feature**        | `@/features/admin` → `AdminReviewsView`                                                                                  |
| **Inside feature** | `useAdminReviews`, `useUrlTable`, `DataTable`, `AdminPageHeader`, `ReviewTableColumns`, `ReviewDetailView`, `SideDrawer` |
| **Services**       | `adminService.listReviews()`, `reviewService.update()`                                                                   |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.REVIEWS`, `API_ENDPOINTS.ADMIN.REVIEW_BY_ID(id)`                                                    |

---

#### `/admin/carousel` — Admin Carousel 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.CAROUSEL`
**Summary:** Hero carousel slide management with drag-reorder. Delegates entirely to `AdminCarouselView`.

| Layer              | Items                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminCarouselView`                                                                                                                |
| **Inside feature** | `useAdminCarousel`, `DataTable`, `AdminPageHeader`, `CarouselSlideForm`, `CarouselTableColumns`, `SideDrawer`, `DrawerFormFooter`, `ConfirmDeleteModal` |
| **Services**       | `carouselService`                                                                                                                                       |
| **API Endpoints**  | `API_ENDPOINTS.CAROUSEL.LIST`, `API_ENDPOINTS.CAROUSEL.REORDER`, `API_ENDPOINTS.CAROUSEL.GET_BY_ID(id)`                                                 |

---

#### `/admin/sections` — Admin Homepage Sections 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.SECTIONS`
**Summary:** Homepage section visibility and ordering. Delegates entirely to `AdminSectionsView`.

| Layer              | Items                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminSectionsView`                                                                                   |
| **Inside feature** | `useAdminSections`, `DataTable`, `AdminPageHeader`, `SectionForm`, `SectionTableColumns`, `SideDrawer`, `DrawerFormFooter` |
| **Services**       | `homepageSectionsService`                                                                                                  |
| **API Endpoints**  | `API_ENDPOINTS.HOMEPAGE_SECTIONS.LIST`, `API_ENDPOINTS.HOMEPAGE_SECTIONS.REORDER`                                          |

---

#### `/admin/faqs` — Admin FAQs 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.FAQS`
**Summary:** FAQ CRUD. Delegates entirely to `AdminFaqsView`.

| Layer              | Items                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Feature**        | `@/features/admin` → `AdminFaqsView`                                                                                                 |
| **Inside feature** | `useAdminFaqs`, `DataTable`, `AdminPageHeader`, `FaqForm`, `FaqTableColumns`, `SideDrawer`, `DrawerFormFooter`, `ConfirmDeleteModal` |
| **Services**       | `faqService`                                                                                                                         |
| **API Endpoints**  | `API_ENDPOINTS.FAQS.LIST`, `API_ENDPOINTS.FAQS.GET_BY_ID(id)`                                                                        |

---

#### `/admin/blog` — Admin Blog 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.BLOG`
**Summary:** Blog post CRUD with rich text editor. Delegates entirely to `AdminBlogView`.

| Layer              | Items                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminBlogView`                                                                                                                        |
| **Inside feature** | `useAdminBlog`, `DataTable`, `AdminPageHeader`, `BlogForm`, `useBlogTableColumns`, `SideDrawer`, `DrawerFormFooter`, `RichTextEditor`, `ConfirmDeleteModal` |
| **Services**       | `blogService`                                                                                                                                               |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.BLOG`, `API_ENDPOINTS.ADMIN.BLOG_BY_ID(id)`                                                                                            |

---

#### `/admin/coupons` — Admin Coupons 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.COUPONS`
**Summary:** Coupon CRUD. Delegates entirely to `AdminCouponsView`.

| Layer              | Items                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminCouponsView`                                                                                                       |
| **Inside feature** | `useAdminCoupons`, `DataTable`, `AdminPageHeader`, `CouponForm`, `CouponTableColumns`, `SideDrawer`, `DrawerFormFooter`, `ConfirmDeleteModal` |
| **Services**       | `couponService`                                                                                                                               |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.COUPONS`, `API_ENDPOINTS.ADMIN.COUPON_BY_ID(id)`                                                                         |

---

#### `/admin/bids` — Admin Bids 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.BIDS`
**Summary:** All auction bids overview. Delegates entirely to `AdminBidsView`.

| Layer              | Items                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Feature**        | `@/features/admin` → `AdminBidsView`                                                 |
| **Inside feature** | `useAdminBids`, `DataTable`, `AdminPageHeader`, `BidTableColumns`, `TablePagination` |
| **Services**       | `bidService.adminList()`                                                             |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.BIDS`                                                           |

---

#### `/admin/events` — Admin Events 🟡👑🔒

**Route constant:** `ROUTES.ADMIN.EVENTS`
**Summary:** Event CRUD with status management. Mixes inline page logic with `@/features/events`.

| Layer             | Items                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Components**    | `AdminPageHeader`, `AdminFilterBar`, `DataTable`, `TablePagination`, `ConfirmDeleteModal`                               |
| **Feature**       | `@/features/events` → `useEvents`, `useEventsTableColumns`, `EventFormDrawer`, `useDeleteEvent`, `useChangeEventStatus` |
| **Hooks**         | `useUrlTable`, `useMessage`                                                                                             |
| **API Endpoints** | `API_ENDPOINTS.ADMIN.EVENTS`                                                                                            |
| **Constants**     | `ROUTES`                                                                                                                |
| **Schema Types**  | `EventDocument`                                                                                                         |

---

#### `/admin/site` — Site Settings 🟡👑🔒

**Route constant:** `ROUTES.ADMIN.SITE`
**Summary:** Site-wide configuration: basic info, contact details, social links, background settings.

| Layer             | Items                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Components**    | `Button`, `BackgroundSettings`, `AdminPageHeader`, `Card`, `SiteBasicInfoForm`, `SiteContactForm`, `SiteSocialLinksForm` |
| **Hooks**         | `useApiQuery`, `useApiMutation`                                                                                          |
| **Services**      | `siteSettingsService.get()`, `siteSettingsService.update()`                                                              |
| **API Endpoints** | `API_ENDPOINTS.SITE_SETTINGS`                                                                                            |
| **Constants**     | `THEME_CONSTANTS`                                                                                                        |
| **Schema Types**  | `SiteSettingsDocument`                                                                                                   |

---

#### `/admin/media` — Admin Media 🟡👑🔒

**Route constant:** `ROUTES.ADMIN.MEDIA`
**Summary:** Media upload, crop, and trim operations.

| Layer             | Items                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| **Components**    | `Card`, `AdminPageHeader`, `MediaOperationForm`, `DataTable`, `Badge`                |
| **Hooks**         | `useApiMutation`                                                                     |
| **Services**      | `mediaService.upload()`, `mediaService.crop()`, `mediaService.trim()`                |
| **API Endpoints** | `API_ENDPOINTS.MEDIA.UPLOAD`, `API_ENDPOINTS.MEDIA.CROP`, `API_ENDPOINTS.MEDIA.TRIM` |
| **Constants**     | `ROUTES`                                                                             |

---

#### `/admin/newsletter` — Admin Newsletter 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.NEWSLETTER`
**Summary:** Newsletter subscriber management. Delegates entirely to `AdminNewsletterView`.

| Layer              | Items                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminNewsletterView`                                                        |
| **Inside feature** | `useAdminNewsletter`, `DataTable`, `AdminPageHeader`, `NewsletterTableColumns`, `TablePagination` |
| **Services**       | `newsletterService.adminList()`                                                                   |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.NEWSLETTER`, `API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id)`                      |

---

#### `/admin/payouts` — Admin Payouts 🟢👑🔒

**Route constant:** `ROUTES.ADMIN.PAYOUTS`
**Summary:** Seller payout request management. Delegates entirely to `AdminPayoutsView`.

| Layer              | Items                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Feature**        | `@/features/admin` → `AdminPayoutsView`                                                                                       |
| **Inside feature** | `useAdminPayouts`, `DataTable`, `AdminPageHeader`, `PayoutTableColumns`, `PayoutStatusForm`, `SideDrawer`, `DrawerFormFooter` |
| **Services**       | `adminService.listPayouts()`, `adminService.updatePayout()`                                                                   |
| **API Endpoints**  | `API_ENDPOINTS.ADMIN.PAYOUTS`, `API_ENDPOINTS.ADMIN.PAYOUT_BY_ID(id)`                                                         |

---

## Feature Modules (Tier 2)

```
src/features/
├── admin/
│   ├── components/        AdminAnalyticsView, AdminBidsView, AdminBlogView,
│   │                      AdminCarouselView, AdminCategoriesView, AdminCouponsView,
│   │                      AdminFaqsView, AdminNewsletterView, AdminOrdersView,
│   │                      AdminPayoutsView, AdminProductsView, AdminReviewsView,
│   │                      AdminSectionsView, AdminUsersView
│   ├── hooks/             useAdminAnalytics, useAdminBids, useAdminBlog,
│   │                      useAdminCarousel, useAdminCategories, useAdminCoupons,
│   │                      useAdminFaqs, useAdminNewsletter, useAdminOrders,
│   │                      useAdminPayouts, useAdminProducts, useAdminReviews,
│   │                      useAdminSections, useAdminUsers
│   └── index.ts
├── auth/
│   ├── components/        LoginForm, RegisterForm, ResetPasswordView, AuthSocialButtons
│   │                      ⚠️ MISSING: ForgotPasswordView (see TASK-11)
│   │                      ⚠️ MISSING: VerifyEmailView (see TASK-12)
│   └── index.ts
├── categories/
│   ├── components/        CategoryProductsView
│   ├── hooks/             useCategoryProducts
│   └── index.ts
├── events/
│   ├── components/        EventCard, EventFormDrawer, EventLeaderboard, EventStatusBadge,
│   │                      EventsTable, EventStatsBanner, PollVotingSection,
│   │                      SurveyEventSection, FeedbackEventSection, SurveyFieldBuilder,
│   │                      EntryReviewDrawer, EventEntriesTable,
│   │                      EventTypeConfig/{PollConfigForm,SurveyConfigForm,
│   │                                      FeedbackConfigForm,OfferConfigForm,SaleConfigForm}
│   │                      EventParticipateView ✅ (TASK-26)
│   ├── hooks/             useEvent, useEvents, useEventEntries, useEventLeaderboard,
│   │                      useEventMutations, useEventStats, useFeedbackSubmit,
│   │                      usePollVote, usePublicEvents
│   ├── services/          event.service.ts  (Tier-2 service)
│   │                      ⚠️ CONFLICT: src/services/event.service.ts also exists (Tier 1 duplicate — see TASK-27)
│   ├── constants/         EVENT_SORT_OPTIONS, EVENT_STATUS_VALUES, EVENT_TYPE_VALUES,
│   │                      FORM_FIELD_TYPE_VALUES
│   │                      ✅ TASK-25 resolved — values-only arrays; labels via useTranslations("eventTypes"), useTranslations("formFieldTypes")
│   ├── types/             index.ts
│   └── index.ts
├── products/
│   ├── components/        ProductsView, AuctionsView
│   ├── hooks/             useProducts, useAuctions
│   └── index.ts
├── search/
│   ├── components/        SearchView
│   ├── hooks/             useSearch
│   └── index.ts
├── seller/
│   ├── components/        SellerProductsView, SellerOrdersView, SellerProductCard
│   │                      ⚠️ MISSING: SellerCreateProductView — sellers have no way to create new products
│   │                      (see TASK-28)
│   ├── hooks/             useSellerProducts, useSellerOrders
│   └── index.ts
└── user/
    ├── components/        UserOrdersView, OrderDetailView
    ├── hooks/             useUserOrders, useOrderDetail
    └── index.ts
```

---

## Shared Components (Tier 1)

### UI Primitives (`src/components/`)

| Component                             | Purpose                                          |
| ------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| `Button`                              | Primary action button with variants              | `src/components/ui/Button.tsx`                           |
| `Card`                                | Container with elevated surface                  | `src/components/ui/Card.tsx`                             |
| `Badge` / `StatusBadge` / `RoleBadge` | Inline colored labels                            | `ui/Badge.tsx`, `ui/StatusBadge.tsx`, `ui/RoleBadge.tsx` |
| `Avatar`                              | Generic circular avatar primitive                | `src/components/ui/Avatar.tsx`                           |
| `Input`                               | Text input                                       | `src/components/forms/Input.tsx`                         |
| `Textarea`                            | Multiline input                                  | `src/components/forms/Textarea.tsx`                      |
| `Select`                              | Dropdown selector                                | `src/components/forms/Select.tsx`                        |
| `Checkbox` / `Radio` / `Toggle`       | Boolean/choice inputs                            | `src/components/forms/`                                  |
| `Slider`                              | Range input                                      | `src/components/forms/Slider.tsx`                        |
| `Form`                                | Form context wrapper                             | `src/components/forms/Form.tsx`                          |
| `FormField`                           | Labeled, validated input wrapper                 | `src/components/FormField.tsx`                           |
| `Dropdown`                            | Generic dropdown menu trigger                    | `src/components/ui/Dropdown.tsx`                         |
| `Menu`                                | Contextual action menu                           | `src/components/ui/Menu.tsx`                             |
| `Divider`                             | Horizontal/vertical rule separator               | `src/components/ui/Divider.tsx`                          |
| `Modal`                               | Dialog overlay                                   | `src/components/feedback/Modal.tsx`                      |
| `ConfirmDeleteModal`                  | Delete confirmation dialog                       | `src/components/modals/ConfirmDeleteModal.tsx`           |
| `ImageCropModal`                      | Image cropping dialog                            | `src/components/modals/ImageCropModal.tsx`               |
| `UnsavedChangesModal`                 | Dirty-form guard dialog                          | `src/components/modals/UnsavedChangesModal.tsx`          |
| `Alert`                               | Inline status message                            | `src/components/feedback/Alert.tsx`                      |
| `Toast`                               | Transient notification                           | `src/components/feedback/Toast.tsx`                      |
| `Spinner` / `LoadingSpinner`          | Loading indicators                               | `src/components/ui/Spinner.tsx`                          |
| `Skeleton`                            | Content placeholder skeleton                     | `src/components/ui/Skeleton.tsx`                         |
| `Progress`                            | Progress bar                                     | `src/components/ui/Progress.tsx`                         |
| `Tabs`                                | Tabbed content area                              | `src/components/ui/Tabs.tsx`                             |
| `Accordion`                           | Collapsible content                              | `src/components/ui/Accordion.tsx`                        |
| `Tooltip`                             | Hover info overlay                               | `src/components/ui/Tooltip.tsx`                          |
| `Search`                              | Search input with icon                           | `src/components/utility/Search.tsx`                      |
| `BackToTop`                           | Floating scroll-to-top button                    | `src/components/utility/BackToTop.tsx`                   |
| `BackgroundRenderer`                  | Dynamic background image/gradient renderer       | `src/components/utility/BackgroundRenderer.tsx`          |
| `Pagination`                          | Page navigation                                  | `src/components/ui/Pagination.tsx`                       |
| `DataTable`                           | Sortable, filterable data table with view-toggle | `src/components/admin/DataTable.tsx`                     |
| `SideDrawer`                          | Slide-in side panel                              | `src/components/ui/SideDrawer.tsx`                       |
| `Sidebar`                             | Navigation sidebar                               | `src/components/layout/Sidebar.tsx`                      |
| `SectionTabs`                         | Horizontal tab navigation                        | `src/components/ui/SectionTabs.tsx`                      |
| `EmptyState`                          | Zero-data placeholder                            | `src/components/ui/EmptyState.tsx`                       |
| `ResponsiveView`                      | Mobile/desktop conditional render                | `src/components/utility/ResponsiveView.tsx`              |
| `ImageGallery`                        | Generic image gallery/lightbox                   | `src/components/ui/ImageGallery.tsx`                     |
| `RichTextEditor`                      | WYSIWYG editor                                   | `src/components/admin/RichTextEditor.tsx`                |
| `Typography`                          | Responsive typography scale primitive            | `src/components/typography/Typography.tsx`               |
| `Text` / `Heading`                    | Convenience wrappers over `Typography`           | `src/components/Text.tsx`                                |
| `AvatarDisplay`                       | User/seller avatar display (no upload)           | `src/components/AvatarDisplay.tsx`                       |
| `AvatarUpload`                        | Avatar with upload + crop trigger                | `src/components/AvatarUpload.tsx`                        |
| `PasswordStrengthIndicator`           | Visual password strength meter                   | `src/components/PasswordStrengthIndicator.tsx`           |
| `ErrorBoundary`                       | React error boundary wrapper                     | `src/components/ErrorBoundary.tsx`                       |
| `MonitoringProvider`                  | Client-side monitoring / error tracking provider | `src/components/providers/MonitoringProvider.tsx`        |

### Filter / Pagination Primitives

| Component            | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `FilterFacetSection` | Collapsible filter group (checkbox + search + load-more) |
| `FilterDrawer`       | Slide-in filter panel                                    |
| `ActiveFilterChips`  | Dismissible filter chip row + "Clear all"                |
| `SortDropdown`       | Sort label + select                                      |
| `TablePagination`    | Result count + per-page selector + `Pagination`          |

### Admin Components

| Component              | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `AdminPageHeader`      | Page title + action buttons header                        |
| `AdminFilterBar`       | Filter bar (also used without `withCard` on public pages) |
| `AdminStatsCards`      | Stat summary card grid                                    |
| `AdminTabs`            | Admin navigation tabs                                     |
| `AdminSessionsManager` | Session list + revoke actions                             |
| `DataTable`            | Shared sortable table                                     |
| `DrawerFormFooter`     | Save/cancel footer for `SideDrawer` forms                 |
| `CategoryTreeView`     | Hierarchical category tree                                |
| `GridEditor`           | Drag-reorder grid                                         |
| `ImageUpload`          | Image upload with preview                                 |
| `BackgroundSettings`   | Site background configuration                             |
| `RichTextEditor`       | Blog/section rich text editor                             |

### Seller Components

| Component                  | Purpose                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `SellerStorefrontView`     | Public seller storefront — products + reviews grid (`src/components/seller/SellerStorefrontView.tsx`) |
| `SellerAnalyticsStats`     | Seller analytics KPI summary cards                                                                    |
| `SellerPayoutRequestForm`  | Seller payout request form                                                                            |
| `SellerPayoutStats`        | Payout balance + summary                                                                              |
| `SellerPayoutHistoryTable` | Payout history table                                                                                  |
| `SellerQuickActions`       | Seller dashboard quick action buttons                                                                 |
| `SellerRecentListings`     | Seller recent product listings                                                                        |
| `SellerRevenueChart`       | Seller revenue trend chart                                                                            |
| `SellerTopProducts`        | Seller top-performing products table                                                                  |
| `SellerStatCard`           | Single KPI stat card for seller dashboard                                                             |
| `SellerTabs`               | Seller panel navigation tabs                                                                          |

### User Components

| Component                  | Purpose                           |
| -------------------------- | --------------------------------- |
| `AddressForm`              | Create/edit address               |
| `AddressCard`              | Display a saved address           |
| `ProfileHeader`            | User profile summary header       |
| `ProfileStatsGrid`         | Stats summary grid for profile    |
| `EmailVerificationCard`    | Email verify/resend card          |
| `PhoneVerificationCard`    | Phone add/verify card             |
| `ProfileInfoForm`          | Edit display name / avatar        |
| `PasswordChangeForm`       | Change password form              |
| `AccountInfoCard`          | Account metadata + delete account |
| `NotificationItem`         | Single notification row           |
| `NotificationsBulkActions` | Mark-all-read toolbar             |

### Layout

| Component                         | Purpose                    |
| --------------------------------- | -------------------------- |
| `MainNavbar`                      | Top navigation bar         |
| `BottomNavbar`                    | Mobile bottom navigation   |
| `Footer`                          | Site footer                |
| `Sidebar`                         | Side navigation panel      |
| `Breadcrumbs` / `AutoBreadcrumbs` | Page breadcrumb trail      |
| `TitleBar`                        | Mobile title bar           |
| `LocaleSwitcher`                  | Language toggle            |
| `LayoutClient`                    | Client-side layout wrapper |

### Homepage Sections

| Component                  | Purpose                  |
| -------------------------- | ------------------------ |
| `HeroCarousel`             | Hero slider              |
| `WelcomeSection`           | Welcome banner           |
| `TrustFeaturesSection`     | Trust icons row          |
| `TopCategoriesSection`     | Top category cards       |
| `FeaturedProductsSection`  | Featured product grid    |
| `FeaturedAuctionsSection`  | Live auction teasers     |
| `AdvertisementBanner`      | Promo banner             |
| `CustomerReviewsSection`   | Review carousel          |
| `WhatsAppCommunitySection` | WhatsApp CTA             |
| `FAQSection`               | FAQ preview              |
| `BlogArticlesSection`      | Blog preview             |
| `NewsletterSection`        | Newsletter signup        |
| `SiteFeaturesSection`      | Site feature highlights  |
| `TrustIndicatorsSection`   | Trust badges             |
| `HomepageSkeleton`         | Initial loading skeleton |

### Product / Auction / Review Components

| Component             | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| `ProductCard`         | Product summary card (Tier 1 — `src/components/products/ProductCard.tsx`) |
| `ProductImageGallery` | Product image zoom/gallery                                                |
| `ProductInfo`         | Product details panel                                                     |
| `ProductFilters`      | Product filter panel (facets sidebar)                                     | `src/components/products/ProductFilters.tsx` |
| `ProductSortBar`      | Product sort + results count bar                                          | `src/components/products/ProductSortBar.tsx` |
| `ProductReviews`      | Product reviews list + add review                                         |
| `AddToCartButton`     | Add/update cart CTA                                                       |
| `RelatedProducts`     | Related product grid                                                      |
| `ProductGrid`         | Generic responsive product grid                                           |
| `WishlistButton`      | Toggle wishlist item                                                      |
| `AuctionCard`         | Auction summary card                                                      |
| `AuctionDetailView`   | Full auction detail panel                                                 |
| `AuctionGrid`         | Auction card grid                                                         |
| `BidHistory`          | Bid history list                                                          |
| `PlaceBidForm`        | Bid submission form                                                       |

### Auth / Protected

| Component        | Purpose                                 |
| ---------------- | --------------------------------------- |
| `ProtectedRoute` | Role-gated route wrapper                |
| `RoleGate`       | Render children only for specific roles |

---

## Hooks Reference (Tier 1)

### Data Fetching

| Hook                       | Purpose                                                  | Service                            |
| -------------------------- | -------------------------------------------------------- | ---------------------------------- |
| `useApiQuery(opts)`        | Generic GET with caching                                 | `apiClient.get()`                  |
| `useApiMutation(opts)`     | Generic POST/PATCH/DELETE                                | `apiClient.post/patch/delete()`    |
| `useFeaturedProducts()`    | Homepage featured products                               | `productService.getFeatured()`     |
| `useFeaturedAuctions()`    | Homepage featured auctions                               | `productService.listAuctions()`    |
| `useRelatedProducts(id)`   | Products related to item                                 | `productService.getRelated()`      |
| `useHeroCarousel()`        | Carousel slides                                          | `carousel.service.list()`          |
| `useHomepageSections()`    | Homepage section config                                  | `homepageSectionsService.list()`   |
| `useHomepageReviews()`     | Reviews for homepage                                     | `reviewService.list()`             |
| `useTopCategories()`       | Top categories                                           | `categoryService.list()`           |
| `useBlogPosts(opts)`       | Blog post listing                                        | `blogService.list()`               |
| `usePublicFaqs(opts)`      | Public FAQ listing                                       | `faqService.list()`                |
| `usePublicEvents()`        | Public events listing                                    | `eventService.list()`              |
| `usePublicProfile(userId)` | Public user/seller profile                               | `profileService.getById()`         |
| `useSellerStorefront(id)`  | Seller storefront data                                   | `profileService`, `productService` |
| `usePromotions()`          | Active promotions                                        | `promotionsService.list()`         |
| `useAuctionDetail(id)`     | Auction detail + bids                                    | `bidService`, `productService`     |
| `useRealtimeBids(id)`      | Real-time bid feed (Realtime DB, custom-token subscribe) | Custom-token Realtime DB           |
| `useSiteSettings()`        | Site configuration                                       | `siteSettingsService.get()`        |
| `useProductReviews(id)`    | Reviews for one product                                  | `reviewService.listForProduct()`   |
| `useNotifications()`       | User notifications                                       | `notificationService.list()`       |
| `useAdminStats()`          | Admin dashboard KPIs                                     | `adminService.getDashboard()`      |
| `useAllFaqs(opts)`         | Full FAQ listing (published + all categories)            | `faqService.list()`                |

### Auth

| Hook                                                                                                                                                                | Purpose                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `useAuth()`                                                                                                                                                         | Session user + role                           |
| `useSession()`                                                                                                                                                      | Raw session context                           |
| `useLogin()`                                                                                                                                                        | Email/password login mutation + redirect      |
| `useGoogleLogin()`                                                                                                                                                  | Google OAuth login mutation                   |
| `useAppleLogin()`                                                                                                                                                   | Apple OAuth login mutation                    |
| `useRegister()`                                                                                                                                                     | Register mutation + redirect                  |
| `useLogout()`                                                                                                                                                       | Logout + session teardown                     |
| `useProfile()`                                                                                                                                                      | Profile read + update                         |
| `useVerifyEmail()`                                                                                                                                                  | Email verification flow                       |
| `useForgotPassword()`                                                                                                                                               | Forgot-password flow                          |
| `useResetPassword()`                                                                                                                                                | Reset-password flow                           |
| `useResendVerification()`                                                                                                                                           | Resend verification email                     |
| `useChangePassword()`                                                                                                                                               | Change password flow                          |
| `useMySessions()`                                                                                                                                                   | Current user's own active sessions            |
| `useAdminSessions()`                                                                                                                                                | All sessions — admin use                      |
| `useUserSessions(uid)`                                                                                                                                              | Sessions for a specific user — admin use      |
| `useRevokeSession(id)`                                                                                                                                              | Revoke a single session                       |
| `useRevokeMySession(id)`                                                                                                                                            | Revoke one of the current user's own sessions |
| `useRevokeUserSessions(uid)`                                                                                                                                        | Revoke all sessions for a user — admin use    |
| `useRBAC()` exports: `useIsAdmin`, `useIsModerator`, `useIsSeller`, `useIsOwner`, `useHasRole`, `useRoleChecks`, `useCanAccess`, `useRequireAuth`, `useRequireRole` | Role checks                                   |

> **Note:** `useLogin`, `useGoogleLogin`, `useAppleLogin`, `useRegister`, `useVerifyEmail` etc. are all named exports from `useAuth.ts`.

### Forms & UX

| Hook                         | Purpose                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `useForm(config)`            | Controlled form state + validation                                            |
| `useMessage()`               | Toast/message queue                                                           |
| `useUnsavedChanges(isDirty)` | Block navigation on dirty forms                                               |
| `useMediaUpload()`           | Media API upload — `POST /api/media/upload` — **only valid file upload hook** |
| `useCouponValidate()`        | Coupon code validation                                                        |
| `useRazorpay()`              | Razorpay payment flow                                                         |
| `useCheckout()`              | Full checkout state machine                                                   |
| `useAddresses()`             | Address list + all address CRUD                                               |
| `useAddress(id)`             | Single address by ID                                                          |
| `useCreateAddress()`         | Create address mutation                                                       |
| `useUpdateAddress()`         | Update address mutation                                                       |
| `useDeleteAddress()`         | Delete address mutation                                                       |
| `useSetDefaultAddress()`     | Set default address mutation                                                  |
| `useAddressForm(id?)`        | Address form state (local)                                                    |
| `useAddressSelector()`       | Address selector (checkout)                                                   |
| `useAddToCart()`             | Add product to cart                                                           |
| `usePlaceBid(id)`            | Auction bid submission                                                        |
| `useFaqVote(id)`             | FAQ helpful vote                                                              |
| `useWishlistToggle(id)`      | Wishlist add/remove                                                           |
| `useNewsletterSubscribe()`   | Newsletter signup                                                             |
| `useContactSubmit()`         | Contact form submission                                                       |

### Navigation / State

| Hook                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `useUrlTable(opts)`        | URL-driven filter/sort/page state                    |
| `useBreakpoint()`          | Current responsive breakpoint                        |
| `useMediaQuery(query)`     | CSS media query in JS                                |
| `useClickOutside(ref, fn)` | Detect outside clicks                                |
| `useKeyPress(key, fn)`     | Keyboard event handler                               |
| `useSwipe(opts)`           | Touch swipe detection                                |
| `useGesture(opts)`         | Combined gesture detector (swipe + long-press + tap) |
| `useLongPress(cb)`         | Long-press gesture                                   |
| `usePullToRefresh(fn)`     | Pull-to-refresh overscroll                           |
| `useCountdown(target)`     | Countdown timer                                      |
| `useCategorySelector()`    | Category picker + list state                         |
| `useCategories()`          | Category list hook (read-only)                       |
| `useCreateCategory()`      | Create category mutation                             |

---

## Services Reference (Tier 1)

All services in `src/services/` use `apiClient` — never raw `fetch()`.

> **TASK-27 ✅ RESOLVED:** `event.service.ts` Tier-2 duplicate deleted. Single source of truth: `src/services/event.service.ts` (Tier 1, `@/services`).

| Service                   | Key Methods                                                                                                                                            | API Route Group                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `authService`             | `login`, `register`, `logout`, `verifyEmail`, `forgotPassword`, `resetPassword`, `createSession`, `deleteSession`                                      | `/api/auth/*`                                  |
| `productService`          | `list`, `getById`, `getBySlug`, `getFeatured`, `create`, `update`, `delete`, `getRelated`, `listAuctions`                                              | `/api/products/*`                              |
| `orderService`            | `list`, `getById`, `track`, `cancel`                                                                                                                   | `/api/user/orders/*`                           |
| `cartService`             | `get`, `add`, `updateItem`, `removeItem`, `clear`                                                                                                      | `/api/cart/*`                                  |
| `checkoutService`         | `create`                                                                                                                                               | `/api/checkout`                                |
| `addressService`          | `list`, `getById`, `create`, `update`, `delete`, `setDefault`                                                                                          | `/api/user/addresses/*`                        |
| `wishlistService`         | `list`, `add`, `remove`, `check`                                                                                                                       | `/api/user/wishlist/*`                         |
| `profileService`          | `get`, `update`, `getById`, `addPhone`, `verifyPhone`, `deleteAccount`                                                                                 | `/api/user/profile`, `/api/profile/*`          |
| `reviewService`           | `listForProduct`, `create`, `update`, `delete`, `vote`                                                                                                 | `/api/reviews/*`                               |
| `categoryService`         | `list`, `getById`, `getBySlug`, `create`, `update`, `delete`                                                                                           | `/api/categories/*`                            |
| `blogService`             | `list`, `getBySlug`, `adminList`, `create`, `update`, `delete`                                                                                         | `/api/blog/*`, `/api/admin/blog/*`             |
| `faqService`              | `list`, `getById`, `vote`, `create`, `update`, `delete`                                                                                                | `/api/faqs/*`                                  |
| `carouselService`         | `list`, `create`, `update`, `delete`, `reorder`                                                                                                        | `/api/carousel/*`                              |
| `homepageSectionsService` | `list`, `getById`, `update`, `reorder`                                                                                                                 | `/api/homepage-sections/*`                     |
| `bidService`              | `list`, `place`, `adminList`                                                                                                                           | `/api/bids/*`, `/api/admin/bids`               |
| `notificationService`     | `list`, `getUnreadCount`, `markRead`, `markAllRead`, `delete`                                                                                          | `/api/notifications/*`                         |
| `searchService`           | `search`                                                                                                                                               | `/api/search`                                  |
| `couponService`           | `validate`, `list`, `create`, `update`, `delete`                                                                                                       | `/api/coupons/*`, `/api/admin/coupons/*`       |
| `sellerService`           | `getDashboard`, `getAnalytics`, `listOrders`, `getPayouts`, `requestPayout`                                                                            | `/api/seller/*`                                |
| `adminService`            | `getDashboard`, `listUsers`, `updateUser`, `listOrders`, `updateOrder`, `listPayouts`, `updatePayout`, `getAnalytics`, `listSessions`, `revokeSession` | `/api/admin/*`                                 |
| `mediaService`            | `upload`, `crop`, `trim`                                                                                                                               | `/api/media/*`                                 |
| `siteSettingsService`     | `get`, `update`                                                                                                                                        | `/api/site-settings`                           |
| `contactService`          | `submit`                                                                                                                                               | `/api/contact`                                 |
| `newsletterService`       | `subscribe`, `adminList`, `updateSubscriber`, `deleteSubscriber`                                                                                       | `/api/newsletter/*`, `/api/admin/newsletter/*` |
| `promotionsService`       | `list`                                                                                                                                                 | `/api/promotions`                              |
| `sessionService`          | `list`, `revoke`                                                                                                                                       | `/api/user/sessions/*`                         |

---

## API Routes Reference

### Auth (`/api/auth/`)

| Method      | Path                          | Description                        |
| ----------- | ----------------------------- | ---------------------------------- |
| POST        | `/api/auth/register`          | Create account + send verification |
| POST        | `/api/auth/login`             | Verify credentials, return token   |
| POST        | `/api/auth/logout`            | Clear session cookie               |
| POST        | `/api/auth/verify-email`      | Verify email token                 |
| POST        | `/api/auth/forgot-password`   | Send password-reset email          |
| POST        | `/api/auth/reset-password`    | Apply reset token + new password   |
| POST        | `/api/auth/send-verification` | Resend verification email          |
| POST/DELETE | `/api/auth/session`           | Create/destroy session cookie      |
| POST        | `/api/auth/session/activity`  | Update last-activity timestamp     |
| GET         | `/api/auth/session/validate`  | Validate current session           |

### User (`/api/user/`)

| Method           | Path                                   | Description                |
| ---------------- | -------------------------------------- | -------------------------- |
| GET/PATCH        | `/api/user/profile`                    | Get or update profile      |
| POST             | `/api/user/change-password`            | Change password            |
| GET              | `/api/user/sessions`                   | List active sessions       |
| DELETE           | `/api/user/sessions/[id]`              | Revoke a session           |
| GET              | `/api/user/wishlist`                   | List wishlist items        |
| POST             | `/api/user/wishlist`                   | Add to wishlist            |
| DELETE           | `/api/user/wishlist/[productId]`       | Remove from wishlist       |
| GET              | `/api/user/addresses`                  | List addresses             |
| POST             | `/api/user/addresses`                  | Create address             |
| GET/PATCH/DELETE | `/api/user/addresses/[id]`             | Read/update/delete address |
| POST             | `/api/user/addresses/[id]/set-default` | Set default address        |
| GET              | `/api/user/orders`                     | List user orders           |
| GET              | `/api/user/orders/[id]`                | Get order detail           |
| POST             | `/api/user/orders/[id]/cancel`         | Cancel order               |

### Core Domains

| Method     | Path                              | Description                      |
| ---------- | --------------------------------- | -------------------------------- |
| GET        | `/api/products`                   | List products (Sieve)            |
| GET        | `/api/products/[id]`              | Product detail                   |
| GET        | `/api/categories`                 | List categories                  |
| GET/DELETE | `/api/categories/[id]`            | Category detail/delete           |
| GET        | `/api/search`                     | Full-text product search         |
| GET/POST   | `/api/cart`                       | Get/modify cart                  |
| DELETE     | `/api/cart/[itemId]`              | Remove cart item                 |
| POST       | `/api/checkout`                   | Complete checkout + create order |
| POST       | `/api/coupons/validate`           | Validate coupon code             |
| GET        | `/api/bids`                       | List bids                        |
| POST       | `/api/bids`                       | Place bid                        |
| GET        | `/api/bids/[id]`                  | Bid detail                       |
| GET        | `/api/blog`                       | List blog posts                  |
| GET        | `/api/blog/[slug]`                | Blog post detail                 |
| GET        | `/api/faqs`                       | List FAQs                        |
| GET        | `/api/faqs/[id]`                  | FAQ detail                       |
| POST       | `/api/faqs/[id]/vote`             | Vote FAQ helpful/not             |
| GET        | `/api/events`                     | List events                      |
| GET        | `/api/events/[id]`                | Event detail                     |
| POST       | `/api/events/[id]/enter`          | Submit event entry               |
| GET        | `/api/events/[id]/leaderboard`    | Event leaderboard                |
| GET        | `/api/carousel`                   | List carousel slides             |
| PUT        | `/api/carousel/reorder`           | Reorder carousel slides          |
| GET/POST   | `/api/homepage-sections`          | List/update homepage sections    |
| PUT        | `/api/homepage-sections/reorder`  | Reorder sections                 |
| GET/PATCH  | `/api/homepage-sections/[id]`     | Get or update individual section |
| GET        | `/api/promotions`                 | Active promotions                |
| GET/PATCH  | `/api/site-settings`              | Site configuration               |
| POST       | `/api/contact`                    | Submit contact form              |
| POST       | `/api/newsletter/subscribe`       | Newsletter signup                |
| GET        | `/api/notifications`              | User notifications               |
| GET        | `/api/notifications/unread-count` | Unread count                     |
| PATCH      | `/api/notifications/[id]`         | Mark notification read           |
| POST       | `/api/notifications/read-all`     | Mark all read                    |
| GET        | `/api/profile/[userId]`           | Public profile                   |
| GET        | `/api/profile/[userId]/reviews`   | Seller reviews                   |
| POST       | `/api/profile/add-phone`          | Add phone number                 |
| POST       | `/api/profile/verify-phone`       | Verify phone OTP                 |
| POST       | `/api/profile/delete-account`     | Delete account                   |

### Payment (`/api/payment/`)

| Method | Path                        | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/payment/create-order` | Create Razorpay order    |
| POST   | `/api/payment/verify`       | Verify payment signature |
| POST   | `/api/payment/webhook`      | Razorpay webhook handler |

### Seller (`/api/seller/`)

| Method   | Path                    | Description                   |
| -------- | ----------------------- | ----------------------------- |
| GET      | `/api/seller/analytics` | Seller revenue + stats        |
| GET      | `/api/seller/orders`    | Seller's own orders           |
| GET/POST | `/api/seller/payouts`   | Seller payouts list / request |

### Admin (`/api/admin/`)

| Method           | Path                                       | Description                      |
| ---------------- | ------------------------------------------ | -------------------------------- |
| GET              | `/api/admin/dashboard`                     | KPI summary                      |
| GET              | `/api/admin/analytics`                     | Revenue + order charts           |
| GET              | `/api/admin/users`                         | User list (Sieve)                |
| GET/PATCH/DELETE | `/api/admin/users/[uid]`                   | User detail / update / delete    |
| GET              | `/api/admin/sessions`                      | All sessions                     |
| DELETE           | `/api/admin/sessions/[id]`                 | Revoke session                   |
| POST             | `/api/admin/sessions/revoke-user`          | Revoke all sessions for user     |
| GET/POST         | `/api/admin/products`                      | Products list / create           |
| GET/PATCH/DELETE | `/api/admin/products/[id]`                 | Product detail CRUD              |
| GET              | `/api/admin/orders`                        | All orders (Sieve)               |
| PATCH            | `/api/admin/orders/[id]`                   | Update order status              |
| GET              | `/api/admin/reviews`                       | All reviews (Sieve)              |
| GET/POST         | `/api/admin/coupons`                       | Coupons list / create            |
| GET/PATCH/DELETE | `/api/admin/coupons/[id]`                  | Coupon CRUD                      |
| GET              | `/api/admin/bids`                          | All bids                         |
| GET/POST         | `/api/admin/blog`                          | Blog posts list / create         |
| GET/PATCH/DELETE | `/api/admin/blog/[id]`                     | Blog post CRUD                   |
| GET/POST         | `/api/admin/events`                        | Events list / create             |
| GET/PATCH/DELETE | `/api/admin/events/[id]`                   | Event CRUD                       |
| PATCH            | `/api/admin/events/[id]/status`            | Change event status              |
| GET              | `/api/admin/events/[id]/stats`             | Event stats                      |
| GET              | `/api/admin/events/[id]/entries`           | Event entries list               |
| PATCH            | `/api/admin/events/[id]/entries/[entryId]` | Review entry                     |
| GET/POST         | `/api/admin/newsletter`                    | Newsletter subscribers           |
| PATCH/DELETE     | `/api/admin/newsletter/[id]`               | Subscriber update/delete         |
| GET              | `/api/admin/payouts`                       | All payout requests              |
| PATCH            | `/api/admin/payouts/[id]`                  | Update payout status             |
| POST             | `/api/admin/algolia/sync`                  | Sync products to Algolia         |
| POST             | `/api/media/upload`                        | Upload media to Firebase Storage |
| POST             | `/api/media/crop`                          | Crop image                       |
| POST             | `/api/media/trim`                          | Trim video                       |
| POST             | `/api/logs/write`                          | Server-side log write            |
| POST             | `/api/demo/seed`                           | Seed demo data (dev only)        |

---

## Constants Reference

| Constant           | File                          | Used For                                          |
| ------------------ | ----------------------------- | ------------------------------------------------- |
| `ROUTES`           | `constants/routes.ts`         | All navigation paths                              |
| `API_ENDPOINTS`    | `constants/api-endpoints.ts`  | All API call paths                                |
| `THEME_CONSTANTS`  | `constants/theme.ts`          | Shared Tailwind class groups                      |
| `UI_LABELS`        | `constants/ui.ts`             | Button labels, form labels (API routes + non-JSX) |
| `UI_PLACEHOLDERS`  | `constants/ui.ts`             | Input placeholder strings                         |
| `ERROR_MESSAGES`   | `constants/error-messages.ts` | Typed error strings (API + hooks)                 |
| `SUCCESS_MESSAGES` | `constants/messages.ts`       | Typed success strings                             |
| `FAQ_CATEGORIES`   | `constants/faq.ts`            | FAQ category keys and labels                      |
| `RBAC_CONFIG`      | `constants/rbac.ts`           | Route-level role requirements                     |
| `SEO_CONFIG`       | `constants/seo.ts`            | Page metadata defaults                            |
| `SITE_CONFIG`      | `constants/site.ts`           | Site name, contact, social links                  |
| `HOMEPAGE_DATA`    | `constants/homepage-data.ts`  | Static homepage copy                              |

---

## Data Layer

### Repositories (`src/repositories/`)

All Firestore access in API routes must go through these — never direct `db.collection()` calls.

| Repository                   | Collection         | Key Methods                                                              |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `userRepository`             | `users`            | `findByEmail`, `findById`, `create`, `update`, `list` (Sieve)            |
| `productRepository`          | `products`         | `findById`, `findBySlug`, `list` (Sieve), `create`, `update`, `delete`   |
| `orderRepository`            | `orders`           | `findById`, `list` (Sieve), `listForUser`, `create`, `update`            |
| `reviewRepository`           | `reviews`          | `listForProduct`, `list` (Sieve), `create`, `update`, `delete`           |
| `bidRepository`              | `bids`             | `listForProduct`, `list` (Sieve), `create`                               |
| `sessionRepository`          | `sessions`         | `findByUserId`, `create`, `update`, `listActive`, `revokeAll`            |
| `tokenRepository`            | `tokens`           | `findByToken`, `create`, `markUsed`, `delete`                            |
| `categoriesRepository`       | `categories`       | `list` (Sieve), `findBySlug`, `create`, `update`, `delete`               |
| `carouselRepository`         | `carouselSlides`   | `list`, `create`, `update`, `delete`, `reorder`                          |
| `homepageSectionsRepository` | `homepageSections` | `list`, `getById`, `update`, `reorder`                                   |
| `siteSettingsRepository`     | `siteSettings`     | `get`, `update`                                                          |
| `faqRepository`              | `faqs`             | `list` (Sieve), `findById`, `create`, `update`, `delete`                 |
| `couponsRepository`          | `coupons`          | `list`, `findByCode`, `create`, `update`, `delete`                       |
| `addressRepository`          | `addresses`        | `findById`, `listForUser`, `create`, `update`, `delete`, `setDefault`    |
| `blogRepository`             | `blogPosts`        | `findBySlug`, `list` (Sieve), `create`, `update`, `delete`               |
| `cartRepository`             | `carts`            | `findByUserId`, `create`, `update`, `clear`                              |
| `eventRepository`            | `events`           | `findById`, `list` (Sieve), `create`, `update`, `delete`, `updateStatus` |
| `eventEntryRepository`       | `eventEntries`     | `findById`, `listForEvent`, `create`, `update`                           |
| `newsletterRepository`       | `newsletter`       | `findByEmail`, `list` (Sieve), `create`, `update`, `delete`              |
| `notificationRepository`     | `notifications`    | `listForUser`, `getUnreadCount`, `markRead`, `markAllRead`, `delete`     |
| `payoutRepository`           | `payouts`          | `findById`, `list` (Sieve), `listForSeller`, `create`, `update`          |
| `wishlistRepository`         | `wishlists`        | `findByUserId`, `add`, `remove`, `check`, `list`                         |
| `unitOfWork`                 | (multi)            | `runTransaction`, `runBatch`                                             |

### DB Schema (`src/db/schema/`)

| Schema Constant                                                                | Collection          | File                   |
| ------------------------------------------------------------------------------ | ------------------- | ---------------------- |
| `USER_FIELDS` / `USER_COLLECTION`                                              | `users`             | `users.ts`             |
| `PRODUCT_FIELDS` / `PRODUCT_COLLECTION`                                        | `products`          | `products.ts`          |
| `ORDER_FIELDS` / `ORDER_COLLECTION`                                            | `orders`            | `orders.ts`            |
| `REVIEW_FIELDS` / `REVIEW_COLLECTION`                                          | `reviews`           | `reviews.ts`           |
| `BID_FIELDS` / `BID_COLLECTION`                                                | `bids`              | `bids.ts`              |
| `SESSION_FIELDS` / `SESSION_COLLECTION`                                        | `sessions`          | `sessions.ts`          |
| `CATEGORY_FIELDS` / `CATEGORIES_COLLECTION`                                    | `categories`        | `categories.ts`        |
| `CAROUSEL_FIELDS` / `CAROUSEL_SLIDES_COLLECTION`                               | `carouselSlides`    | `carousel-slides.ts`   |
| `HOMEPAGE_SECTION_FIELDS` / `HOMEPAGE_SECTIONS_COLLECTION`                     | `homepageSections`  | `homepage-sections.ts` |
| `SITE_SETTINGS_FIELDS` / `SITE_SETTINGS_COLLECTION`                            | `siteSettings`      | `site-settings.ts`     |
| `FAQ_FIELDS` / `FAQS_COLLECTION`                                               | `faqs`              | `faqs.ts`              |
| `COUPON_FIELDS` / `COUPONS_COLLECTION`                                         | `coupons`           | `coupons.ts`           |
| `TOKEN_FIELDS` / `EMAIL_VERIFICATION_COLLECTION` / `PASSWORD_RESET_COLLECTION` | `tokens`            | `tokens.ts`            |
| `ADDRESS_FIELDS` / `ADDRESSES_COLLECTION`                                      | `addresses`         | `addresses.ts`         |
| `BLOG_POST_FIELDS` / `BLOG_POSTS_COLLECTION`                                   | `blogPosts`         | `blog-posts.ts`        |
| `CART_FIELDS` / `CART_COLLECTION`                                              | `carts`             | `cart.ts`              |
| `EVENT_FIELDS` / `EVENTS_COLLECTION`                                           | `events`            | `events.ts`            |
| `NEWSLETTER_FIELDS` / `NEWSLETTER_COLLECTION`                                  | `newsletter`        | `newsletter.ts`        |
| `NOTIFICATION_FIELDS` / `NOTIFICATIONS_COLLECTION`                             | `notifications`     | `notifications.ts`     |
| `PAYOUT_FIELDS` / `PAYOUTS_COLLECTION`                                         | `payouts`           | `payouts.ts`           |
| `COMMON_FIELDS`                                                                | (shared across all) | `field-names.ts`       |
| `SCHEMA_DEFAULTS`                                                              | Default values      | `field-names.ts`       |

---

### Firebase Infrastructure

This section maps every Firebase service's security rules, composite indexes, and Realtime DB path coverage against what the repositories and API routes actually query. It is the **authoritative gap register** for Firebase configuration.

---

#### A. Firestore Security Rules (`firestore.rules`)

**Status: ✅ Correct — no changes needed.**

The project uses a backend-only Firestore architecture. All rules are a single blanket deny:

```
match /{document=**} { allow read, write: if false; }
```

The Firebase Admin SDK (used in all API routes) bypasses these rules entirely. The deny-all rule acts as a safety net preventing any accidental client SDK usage from touching Firestore data.

**Verified: No gaps identified.** Rule changes are only needed if the architecture deliberately opens client-side Firestore access (which is prohibited by Rule 11).

---

#### B. Firebase Storage Rules (`storage.rules`)

**Status: ✅ Correct for current architecture — advisory note only.**

```
match /{allPaths=**} { allow read: if true; allow write: if false; }
```

All uploads go through the Admin SDK backend; `write: false` correctly blocks all client-side writes. Public read is intentional — all media URLs served to clients are Firebase Storage public URLs generated by the backend for CDN delivery.

**Advisory:** If sensitive private files (e.g. ID scans, internal documents) are ever stored under a `media/private/` path, a path-specific read restriction will be required. Current collections (products, blog, categories, carousel, avatars) are all public-read CDN assets.

---

#### C. Firebase Realtime Database Rules (`database.rules.json`)

**Status: ⚠️ Missing paths — gaps identified.**

Current rules cover five paths:

| Path                            | Read access                                     | Write access                                       |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| `/chat/$chatId`                 | Custom token must have `chatIds[$chatId]==true` | Denied — Admin SDK only                            |
| `/chat/$chatId/messages/$msgId` | Inherited from parent                           | Denied; validates `userId`, `message`, `timestamp` |
| `/notifications/$uid`           | `auth.uid == $uid`                              | Denied — Admin SDK only                            |
| `/live_updates/$updateType`     | Public (everyone)                               | Denied — Admin SDK only                            |
| `/presence/$uid`                | `auth.uid == $uid`                              | Denied — Admin SDK writes only                     |

**Missing / unprotected paths used by the application:**

| Path                            | Consumer                                     | Gap                                                                      | Severity        |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ | --------------- |
| `/auctions/$productId/bids`     | `useRealtimeBids` (auction detail)           | No rule — defaults to root `.read: false`, blocking client subscriptions | 🔴 High         |
| `/auctions/$productId/metadata` | `useAuctionDetail` (current bid / countdown) | No rule                                                                  | 🔴 High         |
| `/order_tracking/$orderId`      | `OrderTrackingView`                          | No rule — order status push events unreachable by clients                | 🟡 Medium       |
| `/typing/$chatId/$uid`          | Chat UI (typing indicators)                  | No rule                                                                  | 🟢 Low (future) |

**Recommended rule additions** (see TASK-30 and TASK-31 in IMPLEMENTATION_PLAN):

```json
"auctions": {
  "$productId": {
    ".read": "auth != null",
    ".write": false,
    "bids": {
      "$bidId": {
        ".validate": "newData.hasChildren(['userId','amount','timestamp'])",
        "userId":    { ".validate": "newData.isString()" },
        "amount":    { ".validate": "newData.isNumber() && newData.val() > 0" },
        "timestamp": { ".validate": "newData.isNumber() || newData.val() == '.sv'" }
      }
    },
    "metadata": {
      ".validate": "newData.hasChildren(['currentBid','endTime'])",
      "currentBid": { ".validate": "newData.isNumber()" },
      "endTime":    { ".validate": "newData.isNumber()" }
    }
  }
},
"order_tracking": {
  "$orderId": {
    ".read": "auth != null && auth.token.orderId == $orderId",
    ".write": false,
    "$event": {
      ".validate": "newData.hasChildren(['status','timestamp'])",
      "status":    { ".validate": "newData.isString()" },
      "timestamp": { ".validate": "newData.isNumber() || newData.val() == '.sv'" }
    }
  }
}
```

> **Note on order tracking tokens:** The `/api/realtime/token` endpoint must be extended to embed `orderId` claims in the custom token so the `auth.token.orderId == $orderId` read rule can be enforced.

---

#### D. Firestore Composite Indexes (`firestore.indexes.json`)

**Status: ✅ All identified gaps resolved — TASK-30, TASK-31, TASK-32, TASK-33 done.**

Full cross-reference completed in fifth audit pass (2026-02-28). All 27 missing or incorrect index entries have been corrected:

- **Critical fix (TASK-30):** Renamed 2 `posts` entries to `blogPosts` (matches `BLOG_POSTS_COLLECTION`), added 3 missing `blogPosts` composite indexes and 3 `notifications` indexes.
- **High-traffic (TASK-31):** Added `products` (status+category+createdAt, status+availableQuantity+createdAt), `orders` (userId+productId), `bids` (productId+status+bidAmount), `sessions` (4-field for active session expiry sort).
- **Medium-traffic (TASK-32):** Added `carouselSlides` (2), `homepageSections` (1), `categories` (5 incl. ARRAY_CONTAINS), `faqs` (4 incl. ARRAY_CONTAINS), `events` (1), `eventEntries` (2).
- **Tokens + newsletter (TASK-33):** Added `emailVerificationTokens` (userId+used), `passwordResetTokens` (email+used), `newsletterSubscribers` (status+createdAt).

**All collections now have full index coverage.** Run `firebase deploy --only firestore:indexes` to deploy and monitor READY state in Firebase Console.

> The stale D.1–D.4 gap analysis has been replaced by the resolved summary above. See TASK-30 to TASK-33 in `docs/IMPLEMENTATION_PLAN.md` for historical detail.

---

##### D.1 — ✅ RESOLVED: `posts` → `blogPosts` collection name mismatch

The index file defines two entries under `collectionGroup: "posts"`:

```json
{ "collectionGroup": "posts", "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" }
]},
{ "collectionGroup": "posts", "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
]}
```

**The actual blog collection is `blogPosts`** (`BLOG_POSTS_COLLECTION = "blogPosts"` in `src/db/schema/blog-posts.ts`).

These two indexes are deployed to a `posts` collection that **does not exist**. The live `blogPosts` collection has **zero composite indexes**. All blog listing queries (`/api/blog`, `/api/admin/blog`, homepage blog section) are running full collection scans. This is a correctness and performance defect.

**Fix (TASK-32):** Rename both `posts` entries to `blogPosts` in `firestore.indexes.json` and add the additional missing blog indexes, then redeploy.

---

##### D.2 — Index coverage by collection

| Collection                | Defined indexes (correct)                                                                                                                                                                            | Missing indexes                                                                                                                                                               | Status |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `users`                   | role+createdAt, emailVerified+createdAt, disabled+createdAt, role+disabled+createdAt                                                                                                                 | —                                                                                                                                                                             | ✅     |
| `products`                | sellerId+createdAt, status+createdAt, sellerId+status+createdAt, category+createdAt, isAuction+auctionEndDate, isPromoted+promotionEndDate, isPromoted+status+createdAt, isAuction+status+isPromoted | `status+category+createdAt`, `status+availableQuantity+createdAt`                                                                                                             | ⚠️     |
| `orders`                  | userId+createdAt, userId+status+createdAt, productId+createdAt                                                                                                                                       | `userId+productId`                                                                                                                                                            | ⚠️     |
| `reviews`                 | productId+status+createdAt, featured+status+createdAt                                                                                                                                                | —                                                                                                                                                                             | ✅     |
| `bids`                    | productId+bidDate, userId+bidDate, productId+isWinning, status+createdAt, productId+status+bidDate                                                                                                   | `productId+status+bidAmount` (ranked active bids)                                                                                                                             | ⚠️     |
| `sessions`                | userId+isActive+lastActivity, userId+createdAt, isActive+expiresAt(ASC), isActive+lastActivity, userId+isActive+expiresAt, isActive+expiresAt+lastActivity                                           | `userId+isActive+expiresAt+lastActivity` (4-field for session expiry + activity sort)                                                                                         | ⚠️     |
| `carouselSlides`          | active+order                                                                                                                                                                                         | `active+createdAt`, `createdBy+createdAt`                                                                                                                                     | ⚠️     |
| `homepageSections`        | enabled+order                                                                                                                                                                                        | `type+enabled+order` (section type filter)                                                                                                                                    | ⚠️     |
| `categories`              | isFeatured+order, rootId+tier, isActive+tier, isFeatured+featuredPriority, isActive+isSearchable, isLeaf+isActive                                                                                    | `tier+isActive+order` (3-field), `rootId+tier+order` (3-field with order), `parentIds(ARRAY_CONTAINS)+order`, `isFeatured+isActive+featuredPriority`, `isLeaf+isActive+order` | ⚠️     |
| `faqs`                    | featured+priority+order, category+order, isActive+category+order, showOnHomepage+priority, isPinned+priority+order, isActive+stats.helpful, isActive+createdAt                                       | `showInFooter+isActive+order`, `isPinned+isActive+order`, `showOnHomepage+isActive+priority`, `tags(ARRAY_CONTAINS)+isActive`                                                 | ⚠️     |
| `coupons`                 | validity.isActive+validity.startDate, validity.isActive+validity.endDate, type+validity.isActive, createdBy+validity.startDate                                                                       | `type+createdAt`                                                                                                                                                              | ⚠️     |
| `emailVerificationTokens` | userId+createdAt                                                                                                                                                                                     | `userId+used` (find unused tokens per user)                                                                                                                                   | ⚠️     |
| `passwordResetTokens`     | email+createdAt                                                                                                                                                                                      | `email+used` (find unused reset tokens)                                                                                                                                       | ⚠️     |
| `payouts`                 | sellerId+createdAt, status+createdAt, sellerId+status+createdAt                                                                                                                                      | —                                                                                                                                                                             | ✅     |
| `events`                  | status+endsAt, type+status                                                                                                                                                                           | `status+type+endsAt` (3-field combined filter)                                                                                                                                | ⚠️     |
| `eventEntries`            | eventId+reviewStatus+submittedAt, eventId+points                                                                                                                                                     | `eventId+userId` (duplicate entry check), `eventId+reviewStatus+points` (filtered leaderboard)                                                                                | ⚠️     |
| **`blogPosts`**           | **NONE** (2 existing are on wrong `posts` collection)                                                                                                                                                | `status+publishedAt`, `status+createdAt`, `status+category+publishedAt`, `status+featured+publishedAt`, `authorId+createdAt`                                                  | ❌     |
| `notifications`           | **NONE**                                                                                                                                                                                             | `userId+createdAt`, `userId+isRead+createdAt`, `userId+type+createdAt`                                                                                                        | ❌     |
| `newsletterSubscribers`   | **NONE**                                                                                                                                                                                             | `status+createdAt` (admin subscriber listing)                                                                                                                                 | ⚠️     |
| `carts`                   | **NONE**                                                                                                                                                                                             | Single-field `userId` sufficient if no orderBy; verify from `cart.repository.ts`                                                                                              | 🔍     |

---

##### D.3 — Complete list of 27 missing / incorrect index entries

> Each numbered item corresponds to an entry that must be added (or corrected) in `firestore.indexes.json`.  
> Items [1]–[2] are renames. Items [3]–[27] are new additions.

```
[1]  blogPosts: status (ASC) + publishedAt (DESC)          ← rename from "posts"
[2]  blogPosts: status (ASC) + createdAt (DESC)            ← rename from "posts"
[3]  blogPosts: status (ASC) + category (ASC) + publishedAt (DESC)
[4]  blogPosts: status (ASC) + featured (ASC) + publishedAt (DESC)
[5]  blogPosts: authorId (ASC) + createdAt (DESC)
[6]  notifications: userId (ASC) + createdAt (DESC)
[7]  notifications: userId (ASC) + isRead (ASC) + createdAt (DESC)
[8]  notifications: userId (ASC) + type (ASC) + createdAt (DESC)
[9]  products: status (ASC) + category (ASC) + createdAt (DESC)
[10] products: status (ASC) + availableQuantity (ASC) + createdAt (DESC)
[11] orders: userId (ASC) + productId (ASC)
[12] bids: productId (ASC) + status (ASC) + bidAmount (DESC)
[13] sessions: userId (ASC) + isActive (ASC) + expiresAt (DESC) + lastActivity (DESC)
[14] carouselSlides: active (ASC) + createdAt (DESC)
[15] carouselSlides: createdBy (ASC) + createdAt (DESC)
[16] homepageSections: type (ASC) + enabled (ASC) + order (ASC)
[17] categories: tier (ASC) + isActive (ASC) + order (ASC)
[18] categories: rootId (ASC) + tier (ASC) + order (ASC)
[19] categories: parentIds (ARRAY_CONTAINS) + order (ASC)
[20] categories: isFeatured (ASC) + isActive (ASC) + featuredPriority (ASC)
[21] categories: isLeaf (ASC) + isActive (ASC) + order (ASC)
[22] faqs: showInFooter (ASC) + isActive (ASC) + order (ASC)
[23] faqs: isPinned (ASC) + isActive (ASC) + order (ASC)
[24] faqs: showOnHomepage (ASC) + isActive (ASC) + priority (ASC)
[25] faqs: tags (ARRAY_CONTAINS) + isActive (ASC)
[26] emailVerificationTokens: userId (ASC) + used (ASC)
[27] passwordResetTokens: email (ASC) + used (ASC)
```

---

##### D.4 — Index deployment notes

- Running `firebase deploy --only firestore:indexes` deploys all index changes.
- Each new index enters `BUILDING` state (2–10 minutes per index depending on collection size); queries against a building index fail with `FAILED_PRECONDITION`.
- Use `.\scripts\check-firestore-status.ps1` or the Firebase Console (Firestore → Indexes) to monitor READY state.
- Items [1]–[2] (rename from `posts` to `blogPosts`) are effectively a **delete old + create new** operation — the `posts` indexes will be removed and the two `blogPosts` replacements created.

---

## Mandatory Improvements

Pages that can be made smaller or must be fixed by using existing components/utils/hooks.

### 🔴 Rule Violations (fix immediately)

#### ~~1. `categories/page.tsx` — raw `fetch()` in `queryFn`~~ ✅ RESOLVED (TASK-01)

**Resolved:** Now uses `categoryService.list()` from `@/services`. No action needed.

#### ~~2. `events/[id]/participate/page.tsx` — raw HTML form elements~~ ✅ RESOLVED (TASK-02)

**Resolved 2026-02-28.** All raw `<input>`, `<textarea>`, `<select>`, `<button>` replaced with `FormField`, `Input`, `Button` from `@/components` inside `EventParticipateView`.

#### ~~3. `events/[id]/participate/page.tsx` — `UI_LABELS` in JSX~~ ✅ RESOLVED (TASK-03)

**Resolved 2026-02-28.** `useTranslations('events')` used throughout `EventParticipateView`. Missing keys added to `messages/en.json` + `messages/hi.json`.

#### ~~4. `BlogForm` — missing `RichTextEditor` for post content~~ ✅ RESOLVED (TASK-06 + TASK-07)

**Resolved 2026-02-28.** `BlogForm` `content` field replaced with `RichTextEditor`. `coverImage` field replaced with `ImageUpload` (hidden in readonly mode). `BlogForm.test.tsx` updated to 9 tests, all passing.

#### ~~5. `BlogForm` and `ProductForm` — raw `<input type="checkbox">` instead of `Checkbox`~~ ✅ RESOLVED (TASK-04 + TASK-05)

**Resolved previously.** `BlogForm.isFeatured` and `ProductForm` (`featured`, `isPromoted`, `isAuction`) all use `<Checkbox>` from `@/components`.

#### 6. Fragmented image upload — three different approaches, no unified component

**Issue:** Image uploading is handled three different ways across the codebase with no single consistent path:

| Approach                                       | Hook                                   | Where                               | Upload target                         |
| ---------------------------------------------- | -------------------------------------- | ----------------------------------- | ------------------------------------- | --------------------- |
| `AvatarUpload` component                       | `useMediaUpload` → `/api/media/upload` | Profile avatar only                 | Server media API                      | ✅ Fixed (TASK-20)    |
| `ImageUpload` component                        | `useMediaUpload` → `/api/media/upload` | `CategoryForm`, `CarouselSlideForm` | Server media API                      |
| ~~Plain `FormField type="text"` (URL string)~~ | ~~None~~                               | ~~`ProductForm`, `BlogForm`~~       | ~~No upload — user must paste a URL~~ | ✅ Fixed (TASK-07/08) |

**Fix:** ✅ All resolved. TASK-07/08 (ProductForm/BlogForm), TASK-09 (canonical docs), TASK-20 (AvatarUpload → useMediaUpload) all done.

#### 7. Video/media upload — only accessible from `/admin/media`, not embedded in forms

**Issue:** `MediaOperationForm` (upload + crop + trim) is used exclusively on the `/admin/media` standalone page. There is no way to attach/upload a video directly inside `ProductForm`, `BlogForm`, or any event form. Sellers and admins must navigate away to upload, then copy the URL back.
**Fix:** Either embed a lighter `MediaUploadField` component (wrapping `useMediaUpload`) that can be dropped into any form as a field, or add an `accept` prop to `ImageUpload` so it can handle video files and return a URL.

#### 8. Systemic `UI_LABELS` in JSX — ~35 client components violate Rule 2 across all feature domains

**Issue:** Rule 2 mandates `useTranslations()` (next-intl) for ALL JSX text in client components. `UI_LABELS` is only allowed in API routes and non-JSX server utilities. The following components all render JSX and use `UI_LABELS` directly — this breaks i18n and violates the mandatory rule:

**Shared UI primitives (Tier 1):**

- `src/components/ui/SideDrawer.tsx`
- `src/components/ui/FilterDrawer.tsx`
- `src/components/ui/FilterFacetSection.tsx`
- `src/components/ui/TablePagination.tsx`
- `src/components/ui/SortDropdown.tsx`
- `src/components/ui/ActiveFilterChips.tsx`
- `src/components/ui/NotificationBell.tsx`
- `src/components/ui/EventBanner.tsx`
- `src/components/ui/CategorySelectorCreate.tsx`
- `src/components/ui/AddressSelectorCreate.tsx`

**Homepage sections:**

- `src/components/homepage/FeaturedAuctionsSection.tsx`
- `src/components/homepage/CustomerReviewsSection.tsx`
- `src/components/homepage/FAQSection.tsx`

**User domain components:**

- `src/components/user/settings/ProfileInfoForm.tsx`
- `src/components/user/settings/PasswordChangeForm.tsx`
- `src/components/user/addresses/AddressCard.tsx`
- `src/components/user/addresses/AddressForm.tsx`
- `src/components/user/notifications/NotificationsBulkActions.tsx`
- `src/components/user/notifications/NotificationItem.tsx`
- `src/components/user/profile/PublicProfileView.tsx`

**Seller domain components:**

- `src/components/seller/SellerAnalyticsStats.tsx`
- `src/components/seller/SellerPayoutRequestForm.tsx`
- `src/components/seller/SellerPayoutStats.tsx`
- `src/components/seller/SellerQuickActions.tsx`
- `src/components/seller/SellerRecentListings.tsx`
- `src/components/seller/SellerRevenueChart.tsx`
- `src/components/seller/SellerPayoutHistoryTable.tsx`
- `src/components/seller/SellerTopProducts.tsx`

**Admin components:**

- `src/components/admin/AdminSessionsManager.tsx`
- `src/components/admin/RichTextEditor.tsx`

**Other:**

- `src/components/categories/CategoryGrid.tsx`
- `src/components/checkout/OrderSuccessHero.tsx`, `OrderSummaryPanel.tsx`, `OrderSuccessCard.tsx`
- `src/components/products/AddToCartButton.tsx`
- `src/components/promotions/CouponCard.tsx`
- `src/components/search/SearchResultsSection.tsx`, `SearchFiltersRow.tsx`
- `src/components/ErrorBoundary.tsx`

**Fix:** For each component, call `useTranslations()` inside the component function body, add the translation keys to `messages/en.json` and `messages/hi.json`, and replace all `UI_LABELS.*` JSX references with `t('key')` calls.

#### ~~9. `FAQPageContent` — sort state in `useState` instead of `useUrlTable`~~ ✅ RESOLVED (TASK-19)

**Resolved 2026-03-01.** `FAQPageContent.tsx` now uses `useUrlTable({ defaults: { sort: "helpful" } })`. Sort is URL-driven and bookmarkable. `onSortChange` calls `table.setSort(sort)`.

---

#### ~~10. `useStorageUpload.ts` and `AvatarUpload.tsx` — Firebase Storage client SDK in frontend (Rule 11 Critical)~~ ✅ RESOLVED (TASK-20)

**Completed 2026-02-28:** `useStorageUpload.ts` deleted, `AvatarUpload.tsx` migrated to `useMediaUpload` + `POST /api/media/upload`, exports removed from `hooks/index.ts`, docs removed from `hooks/README.md`. 17 tests updated and passing.

---

#### 11. `useAuth.ts` — imports Firebase Auth client SDK directly (Rule 11 Critical)

**Issue:** `src/hooks/useAuth.ts` imports `signInWithEmailAndPassword` from `firebase/auth` and `auth` from `@/lib/firebase/config`. Rule 11 explicitly prohibits importing `@/lib/firebase/config` in `src/hooks/`. The actual SDK interaction belongs exclusively in `src/lib/firebase/auth-helpers.ts`.

**Current (wrong):**

```ts
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
```

**Fix:** Add `signInWithEmail(email, password)` to `src/lib/firebase/auth-helpers.ts` if not present, then remove the direct `firebase/auth` and `@/lib/firebase/config` imports from `useAuth.ts`. The hook should only import from `@/lib/firebase/auth-helpers`.

---

#### 12. `SessionContext.tsx` — imports Firebase Auth client SDK directly (Rule 11 Critical)

**Issue:** `src/contexts/SessionContext.tsx` imports `User`, `onAuthStateChanged` from `firebase/auth` and `auth` from `@/lib/firebase/config`. Rule 11 prohibits `@/lib/firebase/config` in `src/contexts/`. The auth state subscription must go through a wrapper function in `src/lib/firebase/auth-helpers.ts`.

**Fix:** Add `subscribeToAuthState(callback: (user: User | null) => void): () => void` to `auth-helpers.ts`, then replace the direct Firebase imports in `SessionContext.tsx` with a call to that wrapper.

---

#### 13. Admin client components still using `UI_LABELS` in JSX — additional Rule 2 violations beyond TASK-18

**Issue:** Several admin components not in the TASK-18 Groups A–E also use `UI_LABELS` in rendered JSX:

| File                                                  | UI_LABELS keys used in JSX                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/components/admin/blog/BlogForm.tsx`              | `UI_LABELS.ADMIN.BLOG.*` (all form labels)                                             |
| `src/components/admin/products/ProductForm.tsx`       | `UI_LABELS.ADMIN.PRODUCTS.*` (all form labels)                                         |
| ~~`src/components/admin/blog/BlogTableColumns.tsx`~~  | ✅ RESOLVED (TASK-24) — converted to `useBlogTableColumns` hook with `useTranslations` |
| ~~`src/components/admin/users/UserDetailDrawer.tsx`~~ | ✅ RESOLVED (TASK-24) — `useTranslations("adminUsers")` applied                        |
| ~~`src/components/admin/users/UserFilters.tsx`~~      | ✅ RESOLVED (TASK-24) — `useTranslations` applied for all namespaces                   |

**Fix:** `BlogForm.tsx` and `ProductForm.tsx` still need `useTranslations` applied.

---

#### ~~14. `features/events/constants/` option arrays embed `UI_LABELS` display strings (Rule 2)~~ ✅ RESOLVED (TASK-25)

**Resolved 2026-03-01.** `EVENT_TYPE_OPTIONS`, `EVENT_STATUS_OPTIONS`, and `FORM_FIELD_TYPE_OPTIONS` replaced with values-only arrays (`EVENT_TYPE_VALUES`, `EVENT_STATUS_VALUES`, `FORM_FIELD_TYPE_VALUES`). Consuming components (`EventFormDrawer`, `SurveyFieldBuilder`) now use `useTranslations("eventTypes")` and `useTranslations("formFieldTypes")` respectively. `formFieldTypes` namespace added to `en.json` and `hi.json`.

---

#### ~~15. `events/[id]/participate/page.tsx` — 185 lines, exceeds Rule 10 limit~~ ✅ RESOLVED (TASK-26)

**Resolved 2026-02-28.** All logic extracted to `EventParticipateView` in `src/features/events/components/`. Page reduced to 11-line thin shell.

---

#### ~~16. `event.service.ts` — Rule 21 dual presence (Tier 1 and Tier 2 simultaneously)~~ ✅ RESOLVED (TASK-27)

**Completed 2026-02-28:** Tier-2 `src/features/events/services/event.service.ts` deleted. Tier-1 `src/services/event.service.ts` is canonical. All events hooks import from `@/services`. Three tests updated.

---

#### 17. Seller panel has no product creation page — sellers cannot list new products

**Issue:** `/seller/products` lists a seller's existing products and `/seller/products/[id]/edit` allows editing, but there is no page or route to **create** a new product from the seller panel. Sellers who wish to list a new product must contact an admin. This is a functional gap.

**Fix:** Add `/seller/products/add` page + `SellerCreateProductView` in `@/features/seller/components/`. Reuse `ProductForm` (same form used in admin product creation). Add the `API_ENDPOINTS.SELLER.PRODUCTS_CREATE` endpoint and a `POST /api/seller/products` API route that scopes the product to the authenticated seller. See **TASK-28**.

---

#### 18. Multiple hooks undocumented in `GUIDE.md` and `QUICK_REFERENCE.md`

**Issue:** The following hooks exist in `src/hooks/` and are exported from `src/hooks/index.ts` but are not documented in `docs/GUIDE.md` or `docs/QUICK_REFERENCE.md`:

| Hook                         | File                     | Gap                                                     |
| ---------------------------- | ------------------------ | ------------------------------------------------------- |
| `useGesture(opts)`           | `useGesture.ts`          | Missing from GUIDE.md and APPLICATION_GRAPH hooks table |
| `useGoogleLogin()`           | `useAuth.ts`             | Missing from all docs                                   |
| `useAppleLogin()`            | `useAuth.ts`             | Missing from all docs                                   |
| `useAdminSessions()`         | `useSessions.ts`         | Missing from docs                                       |
| `useUserSessions(uid)`       | `useSessions.ts`         | Missing from docs                                       |
| `useRevokeSession(id)`       | `useSessions.ts`         | Missing from docs                                       |
| `useRevokeMySession(id)`     | `useSessions.ts`         | Missing from docs                                       |
| `useRevokeUserSessions(uid)` | `useSessions.ts`         | Missing from docs                                       |
| `useIsOwner()`               | `useRBAC.ts`             | Not in RBAC hook docs                                   |
| `useIsModerator()`           | `useRBAC.ts`             | Not in RBAC hook docs                                   |
| `useRoleChecks()`            | `useRBAC.ts`             | Not in RBAC hook docs                                   |
| `useAddress(id)`             | `useAddresses.ts`        | Missing from docs                                       |
| `useCreateAddress()`         | `useAddresses.ts`        | Missing from docs                                       |
| `useUpdateAddress()`         | `useAddresses.ts`        | Missing from docs                                       |
| `useAllFaqs(opts)`           | `usePublicFaqs.ts`       | Missing from docs                                       |
| `useCategories()`            | `useCategorySelector.ts` | Missing from docs                                       |
| `useCreateCategory()`        | `useCategorySelector.ts` | Missing from docs                                       |

**Fix:** Update `docs/GUIDE.md` hooks section + `docs/QUICK_REFERENCE.md` with descriptions and usage examples for each. No code changes needed. See **TASK-29**.

---

### 🟡 Refactoring Opportunities (improve page thickness)

| Page                                    | Issue                                                                                             | Recommended Action                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `auth/forgot-password/page.tsx`         | ~80 lines of inline logic                                                                         | Extract to `ForgotPasswordView` in `@/features/auth`                                                    |
| `auth/verify-email/page.tsx`            | ~100 lines of inline logic                                                                        | Extract to `VerifyEmailView` in `@/features/auth`                                                       |
| `user/profile/page.tsx`                 | ✅ TASK-14 complete — stat queries extracted to `useProfileStats` hook in `@/hooks`               | —                                                                                                       |
| `admin/orders/page.tsx`                 | ✅ TASK-13 complete — extracted to `AdminOrdersView` + `useAdminOrders`                           | —                                                                                                       |
| ~~`seller/page.tsx`~~                   | ~~Raw `lucide-react` icon imports + inline stat rendering~~                                       | ✅ RESOLVED (TASK-15) — extracted to `SellerDashboardView` in `@/features/seller`, page is now 10 lines |
| `sellers/page.tsx`                      | Heavy raw HTML server component                                                                   | Add `Card`, `Text`, `Button` primitives to avoid duplicating structure styles                           |
| `help/page.tsx`                         | Heavy raw HTML server component                                                                   | Same as above                                                                                           |
| ~~`user/addresses/add/page.tsx`~~       | ~~Calls `addressService.create()` directly without `useApiMutation`~~                             | ✅ RESOLVED (TASK-16) — migrated to `useCreateAddress({ onSuccess, onError })`                          |
| ~~`user/addresses/edit/[id]/page.tsx`~~ | ~~Same as above for update/delete~~                                                               | ✅ RESOLVED (TASK-16) — migrated to `useUpdateAddress` + `useDeleteAddress` + `useAddress`              |
| `checkout/success/page.tsx`             | Inline `useApiQuery` + redirect logic                                                             | Extract to `CheckoutSuccessView` in `@/features/user` or `@/components/checkout`                        |
| ~~`events/[id]/participate/page.tsx`~~  | ~~**185 lines — violates Rule 10 (150 max)**; inline state, auth, data fetching, form rendering~~ | ✅ RESOLVED (TASK-26) — extracted to `EventParticipateView`, page is now 11 lines                       |

---

### 📋 Unused Existing Primitives (mandatory where applicable)

The following Tier-1 primitives exist and **must** be used in any page or component that performs the listed action instead of re-implementing:

| If you need...                                               | Use this — do NOT re-implement                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Filter state in URL                                          | `useUrlTable`                                                                                         |
| Confirm before delete                                        | `ConfirmDeleteModal`                                                                                  |
| Side form panel                                              | `SideDrawer` + `DrawerFormFooter`                                                                     |
| Page title + action button bar                               | `AdminPageHeader` (not just for admin)                                                                |
| Public/seller filter bar                                     | `AdminFilterBar` with `withCard={false}`                                                              |
| Paginated result footer                                      | `TablePagination`                                                                                     |
| Dismissible filter chips                                     | `ActiveFilterChips`                                                                                   |
| Column sort                                                  | `SortDropdown`                                                                                        |
| Role-conditional rendering                                   | `RoleGate` or `useIsAdmin`, `useIsSeller` from `useRBAC()`                                            |
| Loading state                                                | `Spinner` (never a custom spinner or raw `div` animate-spin)                                          |
| Empty state                                                  | `EmptyState` (never custom empty-state markup)                                                        |
| Image field in a form (product, blog, category, carousel...) | `ImageUpload` (src/components/admin/ImageUpload.tsx) — canonical content image upload                 |
| Profile avatar upload                                        | `AvatarUpload` (src/components/AvatarUpload.tsx) — avatar-only, crop-enabled                          |
| Video or file field in a form                                | `MediaUploadField` (src/components/admin/MediaUploadField.tsx) — any MIME type, returns URL           |
| File/image upload (all contexts)                             | `useMediaUpload` → `/api/media/upload` (Rule 11: Firebase Storage client SDK is banned from frontend) |
| Debounce / throttle                                          | `debounce` / `throttle` from `@/utils`                                                                |
| Group array by key                                           | `groupBy` from `@/helpers`                                                                            |
| Format date                                                  | `formatDate` from `@/utils`                                                                           |
| Format currency                                              | `formatCurrency` from `@/utils`                                                                       |
| Check user role                                              | `hasRole` / `hasAnyRole` from `@/helpers`                                                             |
| Conditional class names                                      | `cn` / `classNames` from `@/helpers`                                                                  |
