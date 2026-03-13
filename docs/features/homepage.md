# Homepage Feature

**Feature path:** `src/features/homepage/`  
**Repository:** `homepageSectionsRepository`, `carouselRepository`  
**Service:** `homepageSectionsService`, `carouselService`

---

## Overview

The homepage is fully configurable from the admin panel. An ordered list of section documents in Firestore controls what appears and in what order. Each section type maps to a React component.

---

## Section Architecture

```
Admin configures sections in /admin/sections
           ↓
  homepageSections (Firestore)
           ↓
  GET /api/homepage-sections
           ↓
  useHomepageSections(params)
           ↓
  HomepagePage dynamically renders each section based on `type`
```

### Section Types

| Type constant         | Component                  | Description                          |
| --------------------- | -------------------------- | ------------------------------------ |
| `hero_carousel`       | `HeroCarousel`             | Full-width animated banner slider    |
| `featured_products`   | `FeaturedProductsSection`  | Horizontal scroll of products        |
| `featured_auctions`   | `FeaturedAuctionsSection`  | Horizontal scroll of active auctions |
| `featured_pre_orders` | `FeaturedPreOrdersSection` | Pre-order product strip              |
| `featured_events`     | `FeaturedEventsSection`    | Active event banners                 |
| `featured_stores`     | `FeaturedStoresSection`    | Store cards strip                    |
| `top_categories`      | `TopCategoriesSection`     | Category tiles grid                  |
| `top_brands`          | `TopBrandsSection`         | Brand logo strip                     |
| `blog_articles`       | `BlogArticlesSection`      | Recent blog posts                    |
| `customer_reviews`    | `CustomerReviewsSection`   | Testimonials carousel                |
| `advertisement`       | `AdvertisementBanner`      | Ad placement banner                  |
| `how_it_works`        | `HowItWorksSection`        | Process explainer                    |
| `trust_features`      | `TrustFeaturesSection`     | Trust badge grid                     |
| `trust_indicators`    | `TrustIndicatorsSection`   | Icons + stat indicators              |
| `site_features`       | `SiteFeaturesSection`      | Feature highlight cards              |
| `stats_counter`       | `StatsCounterSection`      | Animated counters                    |
| `welcome`             | `WelcomeSection`           | Welcome banner                       |
| `whatsapp_community`  | `WhatsAppCommunitySection` | Community CTA                        |
| `faq`                 | `FAQSection`               | FAQ accordion                        |

---

## Key Components

### `HeroCarousel`

Full-width animated banner slider driven by Firestore carousel slides.

- Autoplay with interval
- Swipe gesture support (via `useSwipe` from `@lir/react`)
- Slides: background image, overlay text, CTA button link
- Data: `useHeroCarousel()` → `carouselService.getSlides()`

### `SectionCarousel<T>`

Generic horizontal scroll component used by all featured-item sections:

- `HorizontalScroller` under the hood (with `PerViewConfig` responsive config)
- Accepts a `renderItem` prop
- Shows arrows on desktop, swipe on mobile

### `FeaturedResultsSection`

Generic wrapper for "featured-X" sections. Accepts a title, subtitle, and children.

### `TopBrandsSection`

Logo strip of top brands by product count.
Data: `useTopBrands(limit)` → `/api/products?brands=1`

### `StatsCounterSection`

Uses `IntersectionObserver` to trigger count-up animation when section enters viewport.

### `CustomerReviewsSection`

`SectionCarousel` of `ReviewCard` components. Data: `useHomepageReviews()`.

### `HomepageSkeleton`

Loading skeleton for the entire homepage while sections are fetching.

### `BeforeAfterCard`

Product result transformation card (before/after comparison slider).

---

## Admin Homepage Builder

Managed via `AdminSectionsView` (`/admin/sections`):

- Add/remove/reorder sections
- `SectionForm` — configure each section
- `GridEditor` — visual drag-and-drop grid layout editor for section content arrangement

See [docs/features/admin.md](admin.md#homepage-sections).

---

## Hooks

| Hook                          | Description               |
| ----------------------------- | ------------------------- |
| `useHomepageSections(params)` | Active sections list      |
| `useHeroCarousel`             | Carousel slides           |
| `useFeaturedProducts`         | Featured product strip    |
| `useFeaturedAuctions`         | Featured auctions strip   |
| `useFeaturedPreOrders`        | Featured pre-orders strip |
| `useFeaturedEvents`           | Featured events strip     |
| `useFeaturedStores`           | Featured stores strip     |
| `useTopCategories`            | Top categories            |
| `useTopBrands(limit)`         | Top brands                |
| `useBlogArticles`             | Recent blog posts         |
| `useHomepageReviews`          | Homepage testimonials     |

---

## API Routes

| Method | Route                    | Description              |
| ------ | ------------------------ | ------------------------ |
| `GET`  | `/api/homepage-sections` | Active homepage sections |
| `GET`  | `/api/carousel`          | Hero carousel slides     |
