# Public Pages

All public pages live under `src/app/[locale]/`. They are server-rendered (RSC) by default, call repositories for initial data, and pass it to feature view components.

---

## Homepage

**Route:** `/`  
**File:** `src/app/[locale]/page.tsx`  
**Feature:** `src/features/homepage/`

The homepage assembles multiple dynamic sections driven by `homepageSectionsRepository`. Configured sections can be reordered/toggled from the admin panel.

Sections rendered:

- `HeroCarousel` — hero banner slides from Firestore
- `FeaturedProductsSection`, `FeaturedAuctionsSection`, `FeaturedPreOrdersSection`
- `FeaturedEventsSection`, `FeaturedStoresSection`
- `TopCategoriesSection`, `TopBrandsSection`
- `BlogArticlesSection`, `CustomerReviewsSection`
- `AdvertisementBanner`, `TrustFeaturesSection`, `StatsCounterSection`
- `WelcomeSection`, `WhatsAppCommunitySection`, `FAQSection`

SSR initial data is fetched for hero carousel and primary featured sections.

---

## Products

**Route:** `/products`  
**File:** `src/app/[locale]/products/page.tsx`  
**Feature:** `src/features/products/`

Paginated product catalogue with URL-driven filters (category, price range, brand, rating, sort). Uses `ProductsView` which internally uses `useProducts(params)`.

**Route:** `/products/[slug]`  
Product detail page. SSR fetches product from `productRepository`. Renders `ProductDetailView` with:

- `ProductImageGallery` — lightbox-enabled image gallery
- `ProductInfo` — name, price, description, specifications
- `ProductActions` — add to cart, wishlist, share
- `ProductTabs` — reviews, specifications, Q&A
- `RelatedProducts` — products from same category
- `PromoBannerStrip`, `BuyMoreSaveMore` — promotional widgets

---

## Auctions

**Route:** `/auctions`  
**File:** `src/app/[locale]/auctions/page.tsx`  
**Feature:** `src/features/products/` (AuctionsView)

Lists active and upcoming auctions. Supports filter by status (active/upcoming/ended) and sort by end time.

**Route:** `/auctions/[id]`  
Auction detail. Shows `AuctionDetailView` with:

- Real-time countdown timer via `useCountdown`
- Live bid feed via `useRealtimeBids` (Firebase RTDB)
- `PlaceBidForm` — place a bid (requires authentication)
- `BidHistory` — paginated bid history

---

## Pre-Orders

**Route:** `/pre-orders`  
**File:** `src/app/[locale]/pre-orders/page.tsx`  
Lists available pre-order products via `PreOrdersView`.

**Route:** `/pre-orders/[id]`  
Pre-order detail via `PreOrderDetailView`. Allows placing a pre-order deposit.

---

## Categories

**Route:** `/categories`  
**File:** `src/app/[locale]/categories/page.tsx`  
`CategoriesListView` — grid of all top-level and sub-categories.

**Route:** `/categories/[slug]`  
`CategoryProductsView` — products filtered by the selected category slug. Supports nested sub-category navigation.

---

## Sellers & Stores

**Route:** `/sellers`  
`SellersListView` — "Become a Seller" marketing landing page with hero, benefits grid, how-it-works steps, stats, FAQs, and register CTA.

**Route:** `/sellers/[id]`  
`SellerStorefrontPage` — seller's public storefront with products and reviews.

**Route:** `/stores`  
`StoresListView` — alternate store directory.

**Route:** `/stores/[storeSlug]`  
`StoreHeader` + tabbed layout:

- `/products` → `StoreProductsView`
- `/auctions` → `StoreAuctionsView`
- `/reviews` → `StoreReviewsView`
- `/about` → `StoreAboutView`

---

## Search

**Route:** `/search`  
**File:** `src/app/[locale]/search/page.tsx`  
**Feature:** `src/features/search/`

Algolia-powered full-text search across products, auctions, and pages. `SearchView` renders:

- `SearchFiltersRow` — active filter chips
- `SearchResultsSection` — paginated result cards

URL params: `q`, `category`, `page`, `sort`.

---

## Events

**Route:** `/events`  
`EventsListView` — public events with filter by type and status.

**Route:** `/events/[id]`  
`EventDetailView` — event information, prize, participation CTA.

**Route:** `/events/[id]/participate`  
`EventParticipateView` — renders the correct participation form based on event type:

- `PollVotingSection` — cast a vote
- `FeedbackEventSection` — submit feedback
- `SurveyEventSection` — fill a dynamic survey

---

## Blog

**Route:** `/blog`  
`BlogListView` — paginated blog articles with `BlogCategoryTabs` filter.

**Route:** `/blog/[slug]`  
`BlogPostView` — full article with rich text content, author, publish date, and related posts. SSR with `generateMetadata`.

---

## Promotions

**Route:** `/promotions`  
`PromotionsView` — lists active coupon promotions. Each `CouponCard` shows the discount code, validity, and applicable products.

---

## FAQs

**Route:** `/faqs`  
`FAQPageContent` — FAQ listing with `FAQCategorySidebar`, search, sort, and `FAQAccordion`.

**Route:** `/faqs/[category]`  
FAQs filtered to a specific category.

---

## Profile (Public)

**Route:** `/profile/[userId]`  
`PublicProfileView` — public view of a user or seller's profile. Shows stats, listed products, and received reviews.

---

## Static / Policy Pages

| Route                  | Description                          |
| ---------------------- | ------------------------------------ |
| `/about`               | About LetItRip                       |
| `/contact`             | Contact form                         |
| `/help`                | Help centre                          |
| `/privacy`             | Privacy policy                       |
| `/terms`               | Terms of service                     |
| `/cookies`             | Cookie policy                        |
| `/refund-policy`       | Refund and returns policy            |
| `/shipping-policy`     | Shipping information                 |
| `/how-auctions-work`   | Auction explainer                    |
| `/how-pre-orders-work` | Pre-order explainer                  |
| `/seller-guide`        | Guide for new sellers                |
| `/ripcoins`            | RipCoins virtual currency info       |
| `/track`               | Guest order tracking by order number |
| `/unauthorized`        | 403 page                             |

---

## Auth Pages

| Route                   | Component            | Description                           |
| ----------------------- | -------------------- | ------------------------------------- |
| `/auth/login`           | `LoginForm`          | Email/password login + Google sign-in |
| `/auth/register`        | `RegisterForm`       | New account registration              |
| `/auth/forgot-password` | `ForgotPasswordView` | Request password reset email          |
| `/auth/reset-password`  | `ResetPasswordView`  | Set new password via token            |
| `/auth/verify-email`    | `VerifyEmailView`    | OTP email verification                |
| `/auth/close`           | —                    | OAuth popup close handler             |
| `/auth/oauth-loading`   | —                    | OAuth redirect loading screen         |
