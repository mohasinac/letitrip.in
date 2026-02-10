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

**Total: 8 users** (1 admin, 3 customers, 3 sellers, 1 disabled)

| User ID                           | Type     | Orders | Reviews | Products Sold | Bids        | Status |
| --------------------------------- | -------- | ------ | ------- | ------------- | ----------- | ------ |
| user-john-doe-johndoe             | Customer | 4      | 5       | 0             | 3           | Active |
| user-jane-smith-janes             | Customer | 4      | 6       | 0             | 3 (winning) | Active |
| user-mike-johnson-mikejohn        | Customer | 5      | 6       | 0             | 3           | Active |
| user-techhub-electronics-electron | Seller   | 7      | 10      | 7             | 0           | Active |
| user-fashion-boutique-fashionb    | Seller   | 5      | 3       | 2             | 0           | Active |
| user-home-essentials-homeesse     | Seller   | 3      | 2       | 2             | 0           | Active |

**Stats Consistency:**

- Order counts match actual orders in orders collection
- Review counts match actual reviews in reviews collection
- itemsSold matches products created by that seller
- auctionsWon = 0 for all (auction ongoing, not ended yet)

### Products

**Total: 10 products** (9 regular + 1 auction)

| Product ID                           | Category        | Seller   | Status       | Orders        | Reviews |
| ------------------------------------ | --------------- | -------- | ------------ | ------------- | ------- |
| product-iphone-15-pro-max-...        | Smartphones     | TechHub  | published    | 1             | 1       |
| product-samsung-galaxy-s24-ultra-... | Smartphones     | TechHub  | published    | 1             | 1       |
| product-google-pixel-8-pro-...       | Smartphones     | TechHub  | published    | 1             | 1       |
| product-macbook-pro-16-m3-max-...    | Laptops         | TechHub  | published    | 1             | 1       |
| product-dell-xps-15-...              | Laptops         | TechHub  | published    | 2             | 1       |
| product-mens-cotton-casual-shirt-... | Men's Fashion   | Fashion  | published    | 2             | 1       |
| product-womens-ethnic-kurti-...      | Women's Fashion | Fashion  | published    | 1             | 1       |
| product-non-stick-cookware-set-...   | Home & Kitchen  | Home Ess | published    | 1             | 1       |
| product-yoga-mat-...                 | Sports          | Home Ess | published    | 2             | 1       |
| auction-vintage-canon-ae-1-...       | Cameras         | TechHub  | published    | 0             | 1       |
| product-sony-wh-1000xm5-...          | Audio           | TechHub  | out_of_stock | 1 (cancelled) | 0       |

**Auction Details:**

- ID: auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1
- Starting Bid: ₹15,000
- Current Bid: ₹22,000 (by Jane Smith)
- Bid Count: 8 bids
- End Date: Feb 20, 2026 (still active)
- Status: published, isAuction: true

### Orders

**Total: 12 orders**

**Status Distribution:**

- Delivered: 3 orders
- Shipped: 2 orders
- Confirmed: 2 orders
- Pending: 2 orders
- Cancelled: 2 orders
- Returned: 1 order

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

- **Total Users**: 8 (1 admin, 3 customers, 3 sellers, 1 disabled)
- **Total Products**: 10 (9 regular, 1 auction)
- **Total Orders**: 12 (3 delivered, 2 shipped, 2 confirmed, 2 pending, 2 cancelled, 1 returned)
- **Total Reviews**: 15 (12 approved, 2 pending, 1 rejected)
- **Total Bids**: 8 (all for one auction, 1 winning)
- **Total Categories**: 13 (4 root, 9 children)
- **Total Coupons**: 10
- **Active Auctions**: 1 (ends Feb 20, 2026)
