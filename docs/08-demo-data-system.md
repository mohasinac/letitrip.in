# Demo Data System

> **Status**: ✅ Implemented
> **Priority**: Complete
> **Last Updated**: December 2025

## Overview

The demo data generator creates Beyblade-themed test data for development and QA testing. This document also tracks demo data requirements for all features (docs 01-26).

---

## Feature Demo Data Requirements (Docs 01-26)

### No Demo Data Needed (UI/Config Features)

| Doc | Feature                 | Reason                               |
| --- | ----------------------- | ------------------------------------ |
| 01  | Dark Mode               | CSS/Theme - no data                  |
| 02  | Mobile Responsiveness   | CSS/Layout - no data                 |
| 03  | Form UX                 | UI patterns - no data                |
| 04  | Component Consolidation | Component refactor - no data         |
| 05  | Sieve Pagination        | Query system - uses existing data    |
| 07  | Infrastructure Config   | Deploy config - no data              |
| 09  | Code Standards          | Dev guidelines - no data             |
| 12  | Multi-language i18n     | Translation files - no demo data     |
| 13  | Unified Cards           | Component variants - no data         |
| 16  | Route Fixes             | URL structure - no data              |
| 17  | Constants Consolidation | Code organization - no data          |
| 18  | Tabbed Navigation       | UI component - no data               |
| 23  | ProductCard Variants    | Component variants - no data         |
| 24  | Mobile Page Audit       | Audit doc - no data                  |
| 25  | Wizard Forms Mobile     | UI patterns - no data                |
| 26  | Media Upload            | Upload features - test images needed |

### Demo Data Updates Needed

| Doc | Feature                | Demo Data Requirement               | Status       |
| --- | ---------------------- | ----------------------------------- | ------------ |
| 06  | Firebase Functions     | Cloud functions test data           | ⬜           |
| 10  | Product Comparison     | Products with comparable specs      | ✅ Existing  |
| 11  | Viewing History        | None - client-side localStorage     | ✅ N/A       |
| 14  | Homepage Sections      | Featured items in homepage settings | ✅ Generated |
| 15  | Hero Slides            | Multiple hero slides with CTAs      | ✅ Generated |
| 19  | Demo Auction Dates     | Auctions 3-7 days in future         | ✅ Fixed     |
| 20  | Empty Section Products | SellerProducts/SimilarProducts      | ✅ Existing  |
| 21  | Empty Section Auctions | Shop/Similar auctions               | ✅ Existing  |
| 22  | Similar Categories     | Categories with siblings            | ✅ Existing  |

---

## Demo Data Generator Enhancements

### For Doc 10 - Product Comparison

Products should have comparable specifications:

```typescript
// Ensure products have specs for comparison
const demoProductSpecs = {
  // Electronics category
  electronics: {
    "Screen Size": ["6.1 inch", "6.7 inch", "5.4 inch"],
    Storage: ["64GB", "128GB", "256GB", "512GB"],
    RAM: ["4GB", "6GB", "8GB", "12GB"],
    Battery: ["3000mAh", "4000mAh", "5000mAh"],
  },
  // Beyblade category
  beyblades: {
    Type: ["Attack", "Defense", "Stamina", "Balance"],
    Weight: ["40g", "45g", "50g", "55g"],
    Material: ["Metal", "Plastic", "Hybrid"],
    Series: ["Metal Fusion", "Metal Masters", "Metal Fury"],
  },
};
```

### For Doc 14 - Homepage Sections

Generate `homepage` document with featured items:

```typescript
// src/app/api/admin/demo/generate/extras/route.ts
const homepageSettings = {
  featuredItems: {
    products: demoProducts.slice(0, 8).map((p, i) => ({
      id: `feat-prod-${i}`,
      itemId: p.id,
      type: "product",
      title: p.name,
      image: p.images[0],
      order: i,
      isActive: true,
    })),
    auctions: demoAuctions.slice(0, 6).map((a, i) => ({
      id: `feat-auc-${i}`,
      itemId: a.id,
      type: "auction",
      title: a.name,
      image: a.images[0],
      order: i,
      isActive: true,
    })),
    shops: demoShops.slice(0, 4).map((s, i) => ({
      id: `feat-shop-${i}`,
      itemId: s.id,
      type: "shop",
      title: s.name,
      image: s.logo,
      order: i,
      isActive: true,
    })),
    categories: demoCategories.slice(0, 6).map((c, i) => ({
      id: `feat-cat-${i}`,
      itemId: c.id,
      type: "category",
      title: c.name,
      image: c.image,
      order: i,
      isActive: true,
    })),
  },
};
```

### For Doc 15 - Hero Slides

Generate multiple hero slides:

```typescript
const heroSlides = [
  {
    id: "DEMO_hero-1",
    title: "Season Sale - Up to 50% Off",
    subtitle: "Shop the best Beyblades at unbeatable prices",
    image: "/demo/hero-sale.jpg",
    ctaText: "Shop Now",
    ctaLink: "/products?sale=true",
    order: 0,
    isActive: true,
    startDate: null,
    endDate: null,
  },
  {
    id: "DEMO_hero-2",
    title: "New Arrivals",
    subtitle: "Check out the latest Metal Fight collection",
    image: "/demo/hero-new.jpg",
    ctaText: "Explore",
    ctaLink: "/categories/metal-fight",
    order: 1,
    isActive: true,
  },
  {
    id: "DEMO_hero-3",
    title: "Live Auctions",
    subtitle: "Bid on rare and collectible Beyblades",
    image: "/demo/hero-auction.jpg",
    ctaText: "View Auctions",
    ctaLink: "/auctions",
    order: 2,
    isActive: true,
  },
];
```

### For Doc 19 - Demo Auction Dates

All auctions should have future dates:

```typescript
// Generate endTime 3-7 days in future
const getAuctionEndTime = () => {
  const now = new Date();
  const daysToAdd = 3 + Math.floor(Math.random() * 5); // 3-7 days
  const hoursToAdd = Math.floor(Math.random() * 24);
  now.setDate(now.getDate() + daysToAdd);
  now.setHours(now.getHours() + hoursToAdd);
  return now;
};
```

### For Doc 22 - Similar Categories

Ensure categories have siblings:

```typescript
// Category structure with siblings
const categories = [
  { id: "attack", name: "Attack Types", parentId: "beyblade" },
  { id: "defense", name: "Defense Types", parentId: "beyblade" },
  { id: "stamina", name: "Stamina Types", parentId: "beyblade" },
  { id: "balance", name: "Balance Types", parentId: "beyblade" },
  // Attack sub-categories (siblings)
  { id: "storm-pegasus", name: "Storm Pegasus", parentId: "attack" },
  { id: "galaxy-pegasus", name: "Galaxy Pegasus", parentId: "attack" },
  { id: "cyber-pegasus", name: "Cyber Pegasus", parentId: "attack" },
];
```

### For Doc 26 - Media Upload Testing

Include test images with various sizes:

```typescript
const testMediaAssets = {
  // Square images for products
  productImages: [
    "/demo/products/square-1.jpg", // 1000x1000
    "/demo/products/square-2.jpg",
  ],
  // Wide images for banners
  bannerImages: [
    "/demo/banners/wide-1.jpg", // 1920x600
    "/demo/banners/wide-2.jpg",
  ],
  // Various aspect ratios for testing focus point
  focusPointTestImages: [
    "/demo/test/portrait.jpg", // 800x1200
    "/demo/test/landscape.jpg", // 1200x800
    "/demo/test/square.jpg", // 1000x1000
  ],
  // Test videos
  testVideos: ["/demo/videos/product-demo.mp4", "/demo/videos/unboxing.mp4"],
};
```

---

## Category Counts System

The demo data generator tracks comprehensive category statistics:

| Field                 | Type     | Description                          | Updated By                   |
| --------------------- | -------- | ------------------------------------ | ---------------------------- |
| `product_count`       | `number` | Total products in category           | Products API, Demo Generator |
| `in_stock_count`      | `number` | Products with stock > 0              | Products API, Demo Generator |
| `out_of_stock_count`  | `number` | Products with stock = 0              | Products API, Demo Generator |
| `live_auction_count`  | `number` | Active auctions in category          | Auctions API, Demo Generator |
| `ended_auction_count` | `number` | Completed/ended auctions in category | Auctions API, Demo Generator |

## Demo Data Generator Flow

```
1. Categories (Beyblade hierarchy: Attack, Defense, Stamina, Balance, etc.)
2. Users (100 users with Beyblade-themed display names for sellers)
3. Shops (50 shops with Beyblade-themed names)
4. Products (1,000 products, updates category product counts)
5. Auctions (250 auctions, updates category auction counts)
6. Bids (2,500+ bids across auctions)
7. Reviews (1,500+ reviews)
8. Orders (with payments and shipments)
9. Extras (hero slides, carts, favorites, coupons, tickets, returns)
```

## Files Involved in Count Tracking

| File                                                   | Responsibility                              |
| ------------------------------------------------------ | ------------------------------------------- |
| `src/lib/category-hierarchy.ts`                        | Count update functions                      |
| `src/app/api/products/route.ts`                        | Calls updateCategoryProductCounts on create |
| `src/app/api/products/[slug]/route.ts`                 | Calls counts on update/delete               |
| `src/app/api/auctions/route.ts`                        | Calls updateCategoryAuctionCounts on create |
| `src/app/api/auctions/[id]/route.ts`                   | Calls counts on update/delete               |
| `src/app/api/admin/demo/generate/products/route.ts`    | Updates counts during demo generation       |
| `src/app/api/admin/demo/generate/auctions/route.ts`    | Updates counts during demo generation       |
| `src/app/api/admin/categories/rebuild-counts/route.ts` | Manual rebuild trigger                      |

## Beyblade Theme Data

### Category Tree

- **Attack Types**: Galaxy Pegasus, Storm Pegasus, Cyber Pegasus
- **Defense Types**: Rock Leone, Earth Eagle, Grand Cetus
- **Stamina Types**: Flame Sagittario, Burn Fireblaze, Phantom Orion
- **Balance Types**: Lightning L-Drago, Meteo L-Drago, L-Drago Destructor

### Display Name Prefixes (for users)

```typescript
const BLADER_PREFIXES = [
  "Blader",
  "Storm",
  "Galaxy",
  "Flame",
  "Rock",
  "Lightning",
  "Thunder",
  "Cyber",
  "Phantom",
  "Dragon",
  "Leone",
  "Pegasus",
  "Eagle",
  "Sagittario",
  "LDrago",
  "Orion",
  "Striker",
  "Nemesis",
];
```

### Shop Name Themes

- "DEMO_Beyblade Arena [City]"
- "DEMO_Blader's Paradise [City]"
- "DEMO_Metal Fight Stadium [City]"

## Live Data Stats Display

The demo page shows real-time counts for:

1. Categories
2. Users
3. Shops
4. Products
5. Auctions
6. Bids
7. Orders
8. Payments
9. Shipments
10. Reviews

**Plus additional collections not shown in stats:**

- Order Items
- Coupons
- Returns
- Tickets
- Payouts
- Hero Slides
- Favorites
- Carts
- Notifications
- Addresses

## Deletion Breakdown

When deleting demo data, the cleanup shows breakdown by collection including all the additional collections not shown in live stats.

## QA User Credentials

Demo credentials are displayed on the demo page after generation:

| Role       | Count | Password |
| ---------- | ----- | -------- |
| Admins     | 2     | Demo@123 |
| Moderators | 3     | Demo@123 |
| Support    | 5     | Demo@123 |
| Sellers    | 50    | Demo@123 |
| Buyers     | 40    | Demo@123 |

Access credentials page: `/admin/demo-credentials`

## Troubleshooting

### Stats Mismatch

If "Total Records" differs significantly from deletion count:

- Live Stats only counts 10 main collections
- Deletion counts ALL demo-prefixed documents including order_items, carts, favorites, etc.

### Missing Counts

If category counts are wrong:

- Go to Admin → Categories → Rebuild Counts
- Or call `/api/admin/categories/rebuild-counts` POST

### Generation Failures

If a step fails:

- Note which step failed
- Fix the issue
- Click "Run" on the failed step to retry
- Continue with remaining steps

---

## Demo Data Enhancement Checklist

### Phase 1: Core Data (Already Implemented)

- [x] Categories with hierarchy (Attack/Defense/Stamina/Balance)
- [x] Users with roles (Admin/Mod/Support/Seller/Buyer)
- [x] Shops with Beyblade theme names
- [x] Products with images and specs
- [x] Auctions with bids
- [x] Orders, payments, shipments
- [x] Reviews and ratings

### Phase 2: Homepage & Featured (Doc 14, 15)

- [x] Hero slides with CTAs (3 slides)
- [x] Featured products in homepage settings
- [x] Featured auctions in homepage settings
- [x] Featured shops in homepage settings
- [x] Featured categories in homepage settings

### Phase 3: Auction Dates (Doc 19)

- [x] All auctions 3-7 days in future
- [x] No ended auctions in demo data
- [x] Varied end times throughout the day

### Phase 4: Category Structure (Doc 22)

- [x] Parent categories with multiple children (siblings)
- [x] 3+ sub-categories per parent for Similar Categories
- [x] Proper parentIds set on all categories

### Phase 5: Product Specifications (Doc 10)

- [ ] Add comparable specs to products
- [ ] Ensure products in same category have same spec keys
- [ ] Add variation in spec values for comparison

### Phase 6: Test Media Assets (Doc 26)

- [ ] Add square test images (1:1) for products
- [ ] Add wide test images (16:9) for banners
- [ ] Add portrait test images for focus point testing
- [ ] Add test video files for video upload testing
- [ ] Document test asset locations in `/public/demo/`

### Phase 7: Edge Cases

- [ ] Products with no reviews (for empty state testing)
- [ ] Shops with no products (for empty state testing)
- [ ] Categories with no products (for empty state testing)
- [ ] Users with no orders (for empty state testing)
