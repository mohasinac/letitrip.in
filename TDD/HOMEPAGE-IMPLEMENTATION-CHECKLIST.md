# Homepage Implementation Checklist

## Overview

Comprehensive homepage redesign with dynamic sections, admin-configurable content, and modern UI/UX.

## Features to Implement

### ✅ 1. Welcome Text

- [ ] Welcome hero component with tagline
- [ ] Responsive typography
- [ ] Dark mode support

### ✅ 2. Hero Carousel

- [ ] Reuse existing HeroCarousel component
- [ ] Support for images, gradients, and colors
- [ ] Admin-configurable slides
- [ ] Auto-play with configurable interval
- [ ] Swipe gestures for mobile

### ✅ 3. Features Section (Authentic, etc.)

- [ ] ValueProposition component with icons
- [ ] Trust badges (Authentic, Secure, Fast Shipping, etc.)
- [ ] Responsive grid layout

### ✅ 3.1. View All Products Section

- [ ] Display up to 10 products
- [ ] Filter: published, in stock
- [ ] Sort: latest first
- [ ] "View All Products" button → /products
- [ ] Horizontal scroll on mobile
- [ ] ProductCard reuse

### ✅ 3.2. View All Auctions Section

- [ ] Display up to 10 auctions
- [ ] Filter: hot (most bids) or recently listed
- [ ] "View All Auctions" button → /auctions
- [ ] Horizontal scroll on mobile
- [ ] AuctionCard reuse

### ✅ 4. Featured Categories

- [ ] Each category as a row with image and name
- [ ] Display up to 10 items (products + auctions) per category
- [ ] Include child categories' items
- [ ] "View More" button → /categories/[slug]
- [ ] Horizontal scroll for items
- [ ] CategoryCard component

### ✅ 4.1. View All Categories Button

- [ ] "View All Categories" button → /categories
- [ ] Prominent placement after featured categories

### ✅ 5. Featured Shops

- [ ] Each shop as a row with shop info (name, image, ratings, products count)
- [ ] Display up to 10 items (products + auctions) per shop
- [ ] "Visit Shop" button → /shops/[slug]
- [ ] Horizontal scroll for items
- [ ] ShopCard component

### ✅ 5.1. View All Shops Button

- [ ] "View All Shops" button → /shops
- [ ] Prominent placement after featured shops

### ✅ 6. Featured Products (Admin Selected)

- [ ] Admin-curated featured products
- [ ] Configurable from homepage settings
- [ ] Horizontal scroll
- [ ] "View All Featured" link

### ✅ 7. Featured Auctions (Admin Selected)

- [ ] Admin-curated featured auctions
- [ ] Configurable from homepage settings
- [ ] Horizontal scroll
- [ ] "View All Featured" link

### ✅ 8. Recent Reviews (4+ Stars)

- [ ] Display up to 10 reviews
- [ ] Filter: 4 stars and above
- [ ] Show reviewer name, rating, product, comment
- [ ] ReviewCard component

### ✅ 8.1. View All Reviews Button

- [ ] "View All Reviews" button → /reviews
- [ ] Prominent placement

### ✅ 9. Featured Blog Posts (Admin Selected)

- [ ] Admin-curated blog posts
- [ ] Display up to 10 posts
- [ ] BlogCard component with image, title, excerpt
- [ ] Horizontal scroll

### ✅ 9.1. View Blog Button

- [ ] "View All Blog Posts" button → /blog
- [ ] Prominent placement

### ✅ 10. FAQ Section

- [ ] Display all FAQs (no hiding)
- [ ] Expandable accordion
- [ ] Search/filter functionality
- [ ] Categories if needed

## Technical Requirements

### ✅ Services

- [ ] Merge hero-slides functionality into homepage.service.ts
- [ ] Create comprehensive getHomepageData() method
- [ ] Support for:
  - Latest products (published, in stock, sorted by createdAt desc)
  - Hot/recent auctions (sorted by bidCount desc or createdAt desc)
  - Featured categories with items
  - Featured shops with items
  - Admin-curated featured items (products, auctions, blogs)
  - Recent 4+ star reviews
  - All FAQs

### ✅ Components

- [ ] Reuse ProductCard from src/components/cards/ProductCard.tsx
- [ ] Reuse AuctionCard (create if missing)
- [ ] Reuse ShopCard from src/components/cards/ShopCard.tsx
- [ ] Reuse CategoryCard from src/components/cards/CategoryCard.tsx
- [ ] Reuse BlogCard from src/components/cards/BlogCard.tsx
- [ ] Reuse ReviewCard from src/components/cards/ReviewCard.tsx
- [ ] Reuse HorizontalScrollContainer from src/components/common/HorizontalScrollContainer.tsx
- [ ] Create FeaturedSection wrapper component
- [ ] Create HomepageCategorySection component
- [ ] Create HomepageShopSection component

### ✅ Top Promo/Event Banner

- [ ] Support for images, colors, gradients
- [ ] Admin-configurable
- [ ] Conditional display based on settings
- [ ] Dismissible by user (optional)
- [ ] Gradient picker in admin

### ✅ Data Handling

- [ ] No fallback/backward compatibility
- [ ] If no data, don't render section (just log to analytics)
- [ ] Use analytics service for logging
- [ ] Proper error boundaries

### ✅ Admin Configuration

- [ ] Rearrange sections via drag-and-drop
- [ ] Set background images/colors/gradients per section
- [ ] Enable/disable sections
- [ ] Set item limits per section
- [ ] Featured item selection UI

## Architecture Standards

### ✅ Follow AI Agent Guide

- [ ] Use service layer pattern (UI → Service → API)
- [ ] Use wrapper components (OptimizedImage, FormField, etc.)
- [ ] Use value display components (Price, DateDisplay, Rating, etc.)
- [ ] Proper TypeScript typing (no `any`)
- [ ] Dark mode support for all components
- [ ] Mobile-first responsive design

### ✅ API Routes

- [ ] GET /api/homepage - comprehensive homepage data
- [ ] GET /api/homepage/products - latest products
- [ ] GET /api/homepage/auctions - hot/recent auctions
- [ ] GET /api/homepage/categories/featured - featured categories with items
- [ ] GET /api/homepage/shops/featured - featured shops with items
- [ ] GET /api/homepage/reviews - recent 4+ star reviews
- [ ] GET /api/homepage/faqs - all FAQs
- [ ] Ensure proper caching headers

## Testing Requirements

- [ ] Unit tests for all new components
- [ ] Integration tests for homepage.service.ts
- [ ] API route tests
- [ ] Accessibility tests (WCAG AA)
- [ ] Mobile responsiveness tests
- [ ] Performance tests (Core Web Vitals)

## Performance Considerations

- [ ] Lazy load below-the-fold sections
- [ ] Optimize images (WebP, srcset)
- [ ] Cache API responses appropriately
- [ ] Use React.memo for expensive components
- [ ] Implement skeleton loaders
- [ ] Minimize layout shifts (CLS)

## Completion Criteria

- [ ] All 10 sections implemented and functional
- [ ] Admin can configure all aspects
- [ ] Mobile-responsive with horizontal scrollers
- [ ] Dark mode fully supported
- [ ] No console errors or warnings
- [ ] Analytics logging in place
- [ ] All tests passing
- [ ] Performance metrics meet targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Accessibility audit passed

---

**Status**: 🟡 In Progress
**Started**: December 3, 2025
**Target Completion**: December 4, 2025
