# Seed Data Business Relationships

This document describes the business logic, cascading relationships, and data integrity rules in the seed data.

## Data Flow & Dependencies

### Seeding Order (Important!)

The data must be seeded in this order to maintain referential integrity:

1. **Users** - Base entities (no dependencies)
2. **Categories** - Base entities (no dependencies)
3. **Products** - Depends on: Categories, Users (as sellers)
4. **Orders** - Depends on: Products, Users
5. **Reviews** - Depends on: Products, Users
6. **Bids** - Depends on: Products (auction items), Users
7. **Coupons** - Depends on: Categories, Products, Users (sellers)
8. **Site Settings, Carousel, Homepage, FAQs** - Independent

## Entity Relationships

### Users

**Total: 19 users** (1 admin, 1 moderator, 3 sellers, 10 buyers, 4 edge-case users)

| User ID                           | Email                       | Role      | Notes                                |
| --------------------------------- | --------------------------- | --------- | ------------------------------------ |
| user-admin-user-admin             | admin@letitrip.in           | admin     | Platform administrator               |
| user-moderator-mod-user           | moderator@letitrip.in       | moderator | Riya Sharma — content moderation     |
| user-techhub-electronics-electron | techhub@letitrip.in         | seller    | storeSlug: store-techhub-electronics |
| user-fashion-boutique-fashionb    | fashion@letitrip.in         | seller    | storeSlug: store-fashion-boutique    |
| user-home-essentials-homeesse     | home@letitrip.in            | seller    | storeSlug: store-home-essentials     |
| user-john-doe-johndoe             | john@letitrip.in            | user      | Active buyer, bidder                 |
| user-jane-smith-janes             | jane@letitrip.in            | user      | Active buyer, winning bidder         |
| user-mike-johnson-mikejohn        | mike@letitrip.in            | user      | Active buyer, bidder                 |
| user-priya-sharma-priya           | priya@letitrip.in           | user      | Active buyer                         |
| user-raj-patel-rajpatel           | raj@letitrip.in             | user      | Active buyer, bidder                 |
| user-vikram-nair-vikram           | vikram@letitrip.in          | user      | Active buyer, bidder                 |
| user-ananya-bose-ananya           | ananya@letitrip.in          | user      | New buyer — vintage collector        |
| user-pooja-mehta-pooja            | pooja@letitrip.in           | user      | New buyer — home décor               |
| user-ravi-kumar-ravi              | ravi@letitrip.in            | user      | New buyer — fitness/sports           |
| user-sneha-gupta-sneha            | sneha@letitrip.in           | user      | New buyer — electronics              |
| user-pending-seller-pendingsl     | pending.seller@letitrip.in  | seller    | Edge case: storeStatus=pending       |
| user-rejected-seller-rejectsl     | rejected.seller@letitrip.in | seller    | Edge case: storeStatus=rejected      |
| user-unverified-new-user          | newuser@letitrip.in         | user      | Edge case: emailVerified=false       |
| user-phone-only-phoneuser         | (none)                      | user      | Edge case: phone-only auth           |

### Products

**Total: 50 products** (20 auctions + 30 regular/draft/discontinued/sold)

#### Active Auctions (20)

| Product ID (shortened)              | Ends         | Seller          | CurrentBid | Bids |
| ----------------------------------- | ------------ | --------------- | ---------- | ---- |
| auction-ps5-slim-gaming-console-... | Mar 7, 2026  | TechHub         | ₹52,000    | 9    |
| auction-airpods-pro2-audio-...      | Mar 8, 2026  | TechHub         | ₹21,500    | 6    |
| auction-swiss-titanium-watch-...    | Mar 8, 2026  | Fashion         | ₹1,75,000  | 4    |
| auction-bose700-headphones-...      | Mar 8, 2026  | Home Essentials | ₹28,000    | 5    |
| auction-vintage-denim-jacket-...    | Mar 9, 2026  | Fashion         | ₹11,000    | 7    |
| auction-pioneer-hifi-system-...     | Mar 9, 2026  | Home Essentials | ₹41,000    | 5    |
| auction-vintage-leica-camera-...    | Mar 10, 2026 | TechHub         | ₹97,500    | 5    |
| auction-limited-air-jordan-...      | Mar 11, 2026 | Fashion         | ₹38,000    | 11   |
| auction-supreme-box-logo-tee-...    | Mar 11, 2026 | Fashion         | ₹27,000    | 5    |
| auction-trek-domane-road-bike-...   | Mar 12, 2026 | Home Essentials | ₹68,000    | 4    |
| auction-hermes-silk-scarf-...       | Mar 13, 2026 | Fashion         | ₹48,000    | 3    |
| auction-vintage-canon-ae-1-...      | Mar 14, 2026 | TechHub         | ₹22,000    | 8    |
| auction-sony-alpha-7iv-camera-...   | Mar 14, 2026 | TechHub         | ₹2,15,000  | 3    |
| auction-babolat-tennis-racket-...   | Mar 14, 2026 | Home Essentials | ₹60,000    | 4    |
| auction-nikon-z30-mirrorless-...    | Mar 15, 2026 | TechHub         | ₹57,000    | 2    |
| auction-dyson-v15-vacuum-...        | Mar 15, 2026 | Home Essentials | ₹38,000    | 3    |
| product-macbook-pro-m3-auction-...  | Mar 16, 2026 | TechHub         | ₹1,15,000  | 7    |
| auction-iphone15-sealed-bundle-...  | Mar 16, 2026 | TechHub         | ₹93,000    | 2    |
| auction-designer-kanjeevaram-...    | Mar 16, 2026 | Fashion         | ₹27,000    | 2    |
| auction-weber-charcoal-grill-...    | Mar 16, 2026 | Home Essentials | ₹18,000    | 0    |

Note:

- Auctions ending Mar 7–9 = "closing soon"
- Auctions ending Mar 12–16 = "live"
- 4 products have `video` field (PS5, Sony A7 IV, TAG Heuer Watch, Bose 700)

### Bids

**Total: ~70+ bids** across 20 auction products

**Original auctions (5 products from earlier seed):**

- Canon AE-1: 8 bids (John, Jane, Mike rotating — Jane winning at ₹22,000)
- MacBook M3: 7 bids (multiple bidders — currently ₹1,15,000)
- Leica M6: 5 bids (current bid ₹97,500)
- Air Jordan Chicago: 11 bids (Vikram winning at ₹38,000, autoMax ₹45,000)

**New auction bids (16 new auctions):**

- Each "closing soon" auction (Mar 7–9) has 3–9 bids
- Each "live" auction (Mar 12–16) has 0–4 bids
- New bidders: ananya, vikram, pooja, ravi, sneha alongside john, jane, mike, raj

### Categories

**Total: 13 categories** (4 root, 9 children)

**Category Tree with Product Counts:**

```
Electronics [~25 total]
├── Mobiles & Accessories [smartphones + bundles]
├── Laptops & Computers [laptops + tablets]
├── Audio [earphones + headphones + hi-fi]
├── Gaming [consoles]
└── Cameras & Photography [film + mirrorless]

Fashion [~13 total]
├── Men's Fashion [shirts + sneakers + watches + jackets + tees]
└── Women's Fashion [kurtis + sarees + scarves]

Home & Kitchen [~7 total] — includes sports/fitness products

Sports & Outdoors [~5 total] — bikes, tennis, yoga, gym, cricket
```

**By User:**

- John: 4 orders (1 delivered, 1 shipped, 1 confirmed, 1 cancelled)
- Jane: 4 orders (1 delivered, 1 shipped, 1 pending, 1 returned-multiple items)
- Mike: 5 orders (1 delivered, 1 confirmed, 2 pending, 1 cancelled)

### Reviews

**Total: 15 reviews**

**Status Distribution:**

- Approved: 12 reviews
- Pending: 2 reviews
- Rejected: 1 review

**By Product:**

- Each product has 1-2 reviews
- All approved reviews are from verified purchases

**By User:**

- John: 5 reviews (4 approved, 1 pending)
- Jane: 6 reviews (5 approved, 1 rejected)
- Mike: 6 reviews (4 approved, 1 pending)

### Bids

**Total: 8 bids** (all for vintage camera auction)

**Bidding History:**

1. John: ₹15,000 (2026-01-20) - outbid
2. Jane: ₹16,500 (2026-01-21) - outbid
3. Mike: ₹17,500 (2026-01-22) - outbid
4. John: ₹18,500 (2026-01-23) - outbid
5. Jane: ₹19,500 (2026-01-25) - outbid
6. Mike: ₹20,500 (2026-01-28) - outbid
7. John: ₹21,500 (2026-02-03) - outbid
8. Jane: ₹22,000 (2026-02-08) - **WINNING** (active, autoMaxBid: ₹25,000)

**Current Status:**

- Winning Bidder: Jane Smith
- Current Bid: ₹22,000
- Total Bids: 8
- Active Bidders: 3 (John, Jane, Mike)

### Categories

**Total: 13 categories** (4 root, 9 children)

**Category Tree with Product Counts:**

```
Electronics [10 total]
├── Mobiles & Accessories [3]
│   ├── Smartphones [3 products]
│   └── Mobile Accessories [0]
├── Laptops & Computers [2 products]
├── Audio [1 product]
└── Cameras & Photography [1 auction]

Fashion [2 total]
├── Men's Fashion [1 product]
└── Women's Fashion [1 product]

Home & Kitchen [1 product]

Sports & Outdoors [1 product]
```

**Category Metrics:**

- `productIds` arrays contain actual product IDs
- `auctionIds` arrays contain actual auction IDs
- `totalProductCount` = sum of direct + descendant products
- `totalAuctionCount` = sum of direct + descendant auctions

## Cascading Delete Behavior

### When User is Deleted:

#### If Customer:

- **Orders**: Keep for historical records, anonymize user data
- **Reviews**: Keep for product ratings, anonymize to "Anonymous"
- **Bids**: Keep for auction history, anonymize to "Anonymous Bidder"

#### If Seller:

- **Products**: Mark as discontinued (don't delete)
- **Orders** (of their products): Keep, update seller info
- **Reviews** (of their products): Keep for product ratings

### When Product is Deleted:

- **Orders**:
  - Cancel all pending orders
  - Keep delivered/shipped orders for history
- **Reviews**: Keep for seller reputation
- **Bids** (if auction): Mark all as 'cancelled'
- **Category metrics**: Decrement product counts

### When Category is Deleted:

- **Products**: Update to parent category or "uncategorized"
- **Subcategories**: Reassign parent
- **Homepage Sections**: Update category references

### When Order is Delivered:

- **User stats**: Increment totalOrders
- **Seller stats**: Increment itemsSold
- **Product**: Decrement availableQuantity

### When Review is Approved:

- **User stats**: Increment reviewsCount
- **Product**: Update average rating
- **Seller stats**: Update rating

### When Auction Ends:

- **Highest Bid**: Mark as 'won'
- **All Other Bids**: Mark as 'lost'
- **Winner User stats**: Increment auctionsWon
- **Product**: Change status to 'sold'

## Business Rules Enforced

### Users

- ✅ Email must be unique
- ✅ Phone must be unique (if provided)
- ✅ Admin must have emailVerified = true
- ✅ Sellers must have public profile with showEmail/showPhone

### Products

- ✅ Auction products must have auctionEndDate > current date
- ✅ Regular products must have stockQuantity >= availableQuantity
- ✅ Product IDs follow SEO pattern: product-{name}-{category}-{condition}-{seller}-{count}
- ✅ Out of stock products have availableQuantity = 0

### Orders

- ✅ Order IDs follow pattern: order-{count}-{YYYYMMDD}-{random}
- ✅ Delivered orders must have deliveryDate
- ✅ Shipped orders must have trackingNumber
- ✅ Cancelled/Returned orders must have cancellationReason
- ✅ totalPrice = unitPrice \* quantity

### Reviews

- ✅ Review IDs follow pattern: review-{product}-{user}-{YYYYMMDD}
- ✅ Rating must be 1-5
- ✅ Verified reviews are from confirmed purchases
- ✅ Only approved reviews are public

### Bids

- ✅ Bid IDs follow pattern: bid-{product}-{user}-{YYYYMMDD}-{random}
- ✅ Each new bid must be higher than previous
- ✅ Only one bid can be isWinning = true per auction
- ✅ Bids are immutable (cannot edit after placing)
- ✅ autoMaxBid is optional (proxy bidding)

### Categories

- ✅ Root categories have tier = 0, no parentIds
- ✅ Child categories have parentIds array
- ✅ Category IDs follow pattern: category-{name}-{parent}
- ✅ Metrics are calculated, not user-editable

## Data Consistency Checks

Run these queries to verify data integrity:

```typescript
// Check user order counts match
users.forEach((user) => {
  const actualOrders = orders.filter((o) => o.userId === user.uid).length;
  assert(user.stats.totalOrders === actualOrders);
});

// Check category product counts match
categories.forEach((cat) => {
  const actualProducts = products.filter((p) => p.category === cat.id).length;
  assert(cat.metrics.productCount === actualProducts);
});

// Check seller product counts match
sellers.forEach((seller) => {
  const actualProducts = products.filter(
    (p) => p.sellerId === seller.uid,
  ).length;
  assert(seller.stats.itemsSold === actualProducts);
});

// Check auction bid consistency
const auction = products.find((p) => p.isAuction);
const auctionBids = bids.filter((b) => b.productId === auction.id);
assert(auction.bidCount === auctionBids.length);
assert(auction.currentBid === Math.max(...auctionBids.map((b) => b.bidAmount)));
```

## Seeding Instructions

```bash
# Seed all data (recommended order is enforced)
npx ts-node scripts/seed-all-data.ts

# Seed specific collections
npx ts-node scripts/seed-all-data.ts --collections=users,products,bids

# Dry run (test without writing)
npx ts-node scripts/seed-all-data.ts --dry-run

# Verbose output
npx ts-node scripts/seed-all-data.ts -v
```

## Testing Scenarios

### Scenario 1: Complete Customer Journey

1. John browses smartphones
2. Views product-iphone-15-pro-max
3. Places order-1-20260115
4. Receives delivery
5. Writes review-iphone-15-pro-max-john-20260120
6. Review is approved

### Scenario 2: Auction Flow

1. Jane discovers vintage camera auction
2. Places initial bid of ₹16,500
3. Gets outbid by Mike (₹17,500)
4. Raises bid to ₹19,500
5. Sets autoMaxBid to ₹25,000
6. Wins with final bid of ₹22,000
7. Auction ends on Feb 20, 2026
8. Jane's stats.auctionsWon increments to 1

### Scenario 3: Seller Operations

1. TechHub creates new product
2. Product appears in category metrics
3. Customer places order
4. TechHub marks as shipped
5. Customer receives and reviews
6. TechHub's rating updates

### Scenario 4: Cascading Delete

1. Admin soft-deletes Mike's account
2. Mike's orders are anonymized
3. Mike's reviews show "Anonymous"
4. Mike's bids show "Anonymous Bidder"
5. No data is permanently lost

## Statistics Summary

- **Total Users**: 17 (1 admin, 1 moderator, 7 customers, 5 sellers, 1 disabled, 1 unverified, 1 phone-only)
- **Total Products**: 33 (published, out_of_stock, draft, discontinued, sold + auction items)
- **Total Orders**: 20+ with all statuses (pending/confirmed/shipped/delivered/cancelled/returned) and all payment statuses (pending/paid/failed/refunded)
- **Total Reviews**: 26+ (approved, pending, rejected)
- **Total Bids**: 32+ covering all bid statuses (active, outbid, won, lost, **cancelled**)
- **Total Categories**: 13 (4 root, 9 children)
- **Total Coupons**: 12 (including HOLI15 linked to Holi offer, SPORT10 linked to Sports Season offer)
- **Total Blog Posts**: 8 (6 published, 1 draft, 1 archived)
- **Total Events**: 11 (2 sale ended/active + 1 draft, 2 offer active, 2 poll ended/active, 2 survey ended/active, 2 feedback active)
- **Total Event Entries**: 19 (poll votes, survey responses, feedback submissions)
- **Total Notifications**: 19+ covering all 15 `NotificationType` values
- **Total Payouts**: 8 (completed, processing, pending, failed across 4 sellers)
- **Active Auctions**: 3 (Canon AE-1, MacBook Pro M3, Leica M6, Air Jordan Chicago)
- **Total Sessions**: 12 (active, expired, user-revoked, admin-revoked)
- **Total Carts**: 5 (multi-item, single-item, auction-item, qty>1, empty)

## New Collections (Added Mar 2026)

### Sessions (`sessions`)

12 session documents covering every session lifecycle state.

| ID                                         | User      | Device                      | State                                         |
| ------------------------------------------ | --------- | --------------------------- | --------------------------------------------- |
| session-admin-chrome-desktop-001           | admin     | Chrome/Windows Desktop      | active ✅                                     |
| session-john-chrome-desktop-001            | john      | Chrome/Windows Desktop      | active ✅                                     |
| session-john-chrome-android-002            | john      | Chrome/Android Mobile       | active ✅ (multi-device)                      |
| session-jane-safari-ios-001                | jane      | Safari/iOS Mobile           | active ✅                                     |
| session-techhub-chrome-mac-001             | techhub   | Chrome/macOS Desktop        | active ✅                                     |
| session-moderator-firefox-linux-001        | moderator | Firefox/Ubuntu Desktop      | active ✅                                     |
| session-priya-chrome-ipad-001              | priya     | Chrome/iOS Tablet           | active ✅                                     |
| session-artisan-edge-win-001               | artisan   | Edge/Windows Desktop        | active ✅                                     |
| session-mike-safari-mac-expired-001        | mike      | Safari/macOS                | **expired** (isActive: false, past expiresAt) |
| session-raj-chrome-android-expired-001     | raj       | Chrome/Android              | **expired** (isActive: false)                 |
| session-raj-chrome-desktop-revoked-001     | raj       | Chrome/Windows              | **revoked by user** (revokedBy: userId)       |
| session-meera-suspicious-revoked-admin-001 | meera     | Chrome/Android (suspicious) | **revoked by admin** (unexpected location)    |

**FK consistency:**

- All `userId` values reference existing users ✅
- Multi-device test: `user-john-doe-johndoe` has 2 active sessions ✅
- Admin-revoked: `revokedBy: "admin"` ✅
- User-revoked: `revokedBy: userId` ✅

### Carts (`carts`)

5 cart documents. Document ID = `userId` (O(1) lookup by design).

| Cart ID (= userId)         | Items                              | Notes                           |
| -------------------------- | ---------------------------------- | ------------------------------- |
| user-john-doe-johndoe      | 3 (iPhone + Yoga Mat + 2× Charger) | Cross-seller cart, qty > 1 item |
| user-jane-smith-janes      | 1 (Anarkali Kurta)                 | Single-item cart                |
| user-mike-johnson-mikejohn | 2 (Air Jordan AUCTION + Cookware)  | Mixed auction + regular         |
| user-priya-sharma-priya    | 2 (3× Shirt + 1× Charger)          | Quantity > 1                    |
| user-raj-patel-rajpatel    | 0                                  | Empty cart state                |

**FK consistency:**

- All `userId` values reference existing users ✅
- All `items[].productId` values reference existing products ✅
- All `items[].sellerId` values reference existing seller users ✅
- Auction item (`product-limited-air-jordan-sneakers-auction-artisan-1`) correctly has `isAuction: true` ✅
- Price captured at add-time (snapshot) ✅

## Updated Seeding Order

1. **Users** — no dependencies
2. **Categories** — no dependencies
3. **Coupons** — depends on: Users (createdBy), Categories (optional)
4. **Products** — depends on: Categories, Users (sellers)
5. **Orders** — depends on: Products, Users
6. **Reviews** — depends on: Products, Users, Orders
7. **Bids** — depends on: Products (auction), Users
8. **Events** — depends on: Coupons (offerConfig.couponId), Users (createdBy)
9. **Event Entries** — depends on: Events, Users
10. **Notifications** — depends on: Users, Orders, Products, Bids, Reviews
11. **Payouts** — depends on: Users (sellers), Orders
12. **Blog Posts** — depends on: Users (authorId)
13. **Sessions** — depends on: Users
14. **Carts** — depends on: Users, Products (sellers)
15. **Site Settings, Carousel, Homepage, FAQs, Newsletter** — independent

## New Collections (Added Feb 2026)

### Blog Posts (`blogPosts`)

8 posts seeded across all categories (`guides`, `tips`, `news`, `updates`, `community`).

| ID                                                  | Category  | Status       | Featured | Author |
| --------------------------------------------------- | --------- | ------------ | -------- | ------ |
| blog-top-trekking-destinations-india-2026-guides    | guides    | published    | ✅       | admin  |
| blog-how-to-choose-trekking-gear-beginners-tips     | tips      | published    | ✅       | admin  |
| blog-letitrip-launches-auction-feature-news         | news      | published    | ❌       | admin  |
| blog-buyer-seller-protection-policy-updates-updates | updates   | published    | ❌       | admin  |
| blog-seller-tips-better-product-photos-tips         | tips      | published    | ❌       | admin  |
| blog-community-spotlight-jan-2026-community         | community | published    | ❌       | admin  |
| blog-camping-checklist-essentials-2026-guides-draft | guides    | **draft**    | ❌       | admin  |
| blog-festive-sale-dec-2025-recap-community-archived | community | **archived** | ❌       | admin  |

- All authorId → `user-admin-user-admin` ✅

### Events (`events`) & Event Entries (`eventEntries`)

11 events covering every `EventType` value and all 4 statuses:

| ID                                           | Type     | Status | Entries                          |
| -------------------------------------------- | -------- | ------ | -------------------------------- |
| event-republic-day-sale-2026-sale            | sale     | ended  | 0                                |
| event-womens-day-sale-2026-sale              | sale     | active | 0                                |
| event-diwali-sale-2026-sale                  | sale     | draft  | 0                                |
| event-holi-offer-2026-offer                  | offer    | active | 0                                |
| event-sports-season-offer-2026-offer         | offer    | active | 0                                |
| event-community-poll-gear-2026-poll          | poll     | ended  | 3                                |
| event-favourite-brand-poll-2026-poll         | poll     | active | 4                                |
| event-platform-experience-survey-2026-survey | survey   | ended  | 2418 (2 seeded)                  |
| event-shopping-experience-survey-2026-survey | survey   | active | 2 (1 approved+points, 1 pending) |
| event-seller-feedback-form-2026-feedback     | feedback | active | 3 (incl. 1 flagged)              |
| event-app-experience-feedback-2026-feedback  | feedback | active | 3                                |

**Event Entry FK consistency:**

- `entry-poll-gear-john-camping` → `user-john-doe-johndoe` ✅
- `entry-poll-gear-jane-climbing` → `user-jane-smith-janes` ✅
- `entry-poll-gear-mike-cycling` → `user-mike-johnson-mikejohn` ✅
- `event-holi-offer-2026-offer.offerConfig.couponId` → `coupon-HOLI15` ✅
- `entry-feedback-seller-anon-flagged.reviewedBy` → `user-admin-user-admin` ✅
- `entry-poll-brand-john-samsung` → `user-john-doe-johndoe` ✅
- `entry-poll-brand-jane-apple` → `user-jane-smith-janes` ✅
- `entry-poll-brand-mike-sony` → `user-mike-johnson-mikejohn` ✅
- `entry-poll-brand-fashionb-oneplus` → `user-fashion-boutique-fashionb` ✅
- `entry-survey-shopping-john.reviewedBy` → `user-admin-user-admin` ✅ (points: 95)
- `entry-survey-shopping-jane` → reviewStatus: pending ✅
- `entry-feedback-app-john` → `user-john-doe-johndoe` ✅
- `entry-feedback-app-mike` → `user-mike-johnson-mikejohn` ✅
- `entry-feedback-app-priya` → `user-priya-sharma-priya` ✅
- `event-sports-season-offer-2026-offer.offerConfig.couponId` → `coupon-SPORT10` ✅
- `event-womens-day-sale-2026-sale.saleConfig.affectedCategories` → `category-fashion`, `category-beauty-health` ✅

### Notifications (`notifications`)

16 notifications distributed across 5 users covering every `NotificationType`:

| User                              | Count | Types covered                                                                                 |
| --------------------------------- | ----- | --------------------------------------------------------------------------------------------- |
| user-john-doe-johndoe             | 6     | welcome, order_placed, order_shipped, order_delivered, review_approved, bid_outbid, promotion |
| user-jane-smith-janes             | 3     | welcome, order_delivered, bid_won                                                             |
| user-mike-johnson-mikejohn        | 3     | welcome, bid_lost, system                                                                     |
| user-techhub-electronics-electron | 1     | order_confirmed                                                                               |
| user-priya-sharma-priya           | 1     | product_available                                                                             |

**FK consistency:**

- All `relatedId` values reference existing orders, products, bids, or events ✅
- All `userId` values reference existing users ✅

### Payouts (`payouts`)

6 payouts across 4 sellers, covering all `PayoutStatus` values:

| ID                                        | Seller              | Status     | Amount    | Method        |
| ----------------------------------------- | ------------------- | ---------- | --------- | ------------- |
| payout-techhub-jan-2026-completed         | TechHub Electronics | completed  | ₹2,47,521 | bank_transfer |
| payout-techhub-feb-2026-processing        | TechHub Electronics | processing | ₹75,619   | bank_transfer |
| payout-fashionboutique-jan-2026-completed | Fashion Boutique    | completed  | ₹13,491   | upi           |
| payout-fashionboutique-feb-2026-pending   | Fashion Boutique    | pending    | ₹85,465   | upi           |
| payout-homeessentials-jan-2026-failed     | Home Essentials     | failed     | ₹47,975   | bank_transfer |
| payout-homeessentials-feb-2026-pending    | Home Essentials     | pending    | ₹47,975   | bank_transfer |
| payout-sportszone-jan-2026-completed      | Sports Zone         | completed  | ₹22,610   | upi           |

**FK consistency:**

- All `sellerId` values reference existing seller users ✅
- All `orderIds[]` values reference existing orders ✅
- `platformFee = grossAmount × 0.05` (DEFAULT_PLATFORM_FEE_RATE) ✅
- `amount = grossAmount − platformFee` ✅
