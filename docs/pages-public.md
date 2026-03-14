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

## RC Info

**Route:** `/rc`  
**Component:** `RCInfoView`  
**Revalidate:** 3600 s

Static RSC page explaining RC economics: earning, spending, purchasing, and offer engagement.

- `FlowDiagram` of the RC lifecycle: earn → spend → engage in offers/bids
- Fixed package options from `RC_PACKAGES` constant
- Balance model: `rcBalance = freeCoins + engagedRC`
- Links to `/user/rc/purchase` for authenticated users

**Data flow:** Read-only static page, no server data fetched at render time.

---

## How Offers Work

**Route:** `/how-offers-work`  
**Component:** `HowOffersWorkView`

Static RSC guide for the make-an-offer flow. 6-step `FlowDiagram`: search product → budget RC → make offer → negotiate (counter/accept) → checkout → cancel/refund.

---

## Fees

**Route:** `/fees`  
**Component:** `FeesView`

Static RSC fee schedule: platform 5%, payment gateway 2.36%, GST 18%. Referenced from the payout breakdown modal.

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

## Reviews (Public)

**Route:** `/reviews`  
**File:** `src/app/[locale]/reviews/page.tsx`  
**Feature:** `src/features/reviews/`  
**Revalidate:** 60 s

Showcases featured customer reviews from across the platform. SSR fetches the latest approved reviews (sorted by rating, up to 200) via `reviewRepository.listAll` and passes `initialData` to `ReviewsListView`.

- Filter by product, rating, recent date
- Each `ReviewCard` shows: reviewer avatar, product image, star rating, title, body, helpful vote count

---

## Contact

**Route:** `/contact`  
**File:** `src/app/[locale]/contact/page.tsx`  
**Feature:** `src/features/contact/`  
**Revalidate:** 3600 s (ISR)

Contact page with a hero banner and a two-column layout:

- **Left:** `ContactInfoSidebar` — platform address, email, phone, and social links (from `SITE_CONFIG`)
- **Right:** `ContactForm` — react-hook-form + Zod; submits via `sendContactAction`

**Action:** `sendContactAction({ name, email, subject, message })`  
→ IP rate-limited (Upstash)  
→ Sends email via Resend to platform contact address  
→ Stores submission in `contact_submissions` Firestore collection

---

## How Orders Work

**Route:** `/how-orders-work`  
**File:** `src/app/[locale]/how-orders-work/page.tsx`  
**Component:** `HowOrdersWorkView`  
**Revalidate:** 3600 s

Static explainer page for the full order lifecycle: `confirmed → processing → shipped → delivered → completed`. Includes order cancellation rules and invoice download info.

---

## How Checkout Works

**Route:** `/how-checkout-works`  
**File:** `src/app/[locale]/how-checkout-works/page.tsx`  
**Component:** `HowCheckoutWorksView`  
**Revalidate:** 3600 s

Static explainer for the three-step checkout: address selection + Consent OTP, order review, payment (Razorpay / COD / RC coins).

---

## How Reviews Work

**Route:** `/how-reviews-work`  
**File:** `src/app/[locale]/how-reviews-work/page.tsx`  
**Component:** `HowReviewsWorkView`  
**Revalidate:** 3600 s

Static explainer: verified-purchase gate, moderation flow, helpful voting, and RC reward for approved reviews.

---

## How Payouts Work

**Route:** `/how-payouts-work`  
**File:** `src/app/[locale]/how-payouts-work/page.tsx`  
**Component:** `HowPayoutsWorkView`  
**Revalidate:** 3600 s

Static explainer for sellers: delivered-order eligibility, ₹500 minimum, bank account setup, admin approval timeline.

---

## Static / Policy Pages

| Route                  | Component              | Description                          |
| ---------------------- | ---------------------- | ------------------------------------ |
| `/about`               | `AboutView`            | About LetItRip                       |
| `/contact`             | `ContactForm`          | Contact form (see detailed section)  |
| `/help`                | `HelpCentreView`       | Help centre                          |
| `/privacy`             | `PrivacyView`          | Privacy policy                       |
| `/terms`               | `TermsView`            | Terms of service                     |
| `/cookies`             | `CookiesView`          | Cookie policy                        |
| `/refund-policy`       | `RefundPolicyView`     | Refund and returns policy            |
| `/shipping-policy`     | `ShippingPolicyView`   | Shipping information                 |
| `/fees`                | `FeesView`             | Platform fee schedule (see below)    |
| `/how-auctions-work`   | `HowAuctionsWorkView`  | Auction bidding explainer            |
| `/how-offers-work`     | `HowOffersWorkView`    | Make-an-Offer explainer (see below)  |
| `/how-orders-work`     | `HowOrdersWorkView`    | Order lifecycle explainer            |
| `/how-pre-orders-work` | `HowPreOrdersWorkView` | Pre-order deposit/fulfilment guide   |
| `/how-checkout-works`  | `HowCheckoutWorksView` | OTP consent, COD, Razorpay explainer |
| `/how-reviews-work`    | `HowReviewsWorkView`   | Verified-purchase review rules       |
| `/how-payouts-work`    | `HowPayoutsWorkView`   | Seller payout eligibility & timeline |
| `/seller-guide`        | `SellerGuideView`      | Guide for new sellers                |
| `/rc`                  | `RCInfoView`           | RC virtual currency info             |
| `/track`               | `TrackOrderView`       | Guest order tracking by order number |
| `/unauthorized`        | —                      | 403 page                             |

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
