# Demo Data System

> **Status**: ✅ Implemented
> **Priority**: Complete
> **Last Updated**: November 30, 2025

## Overview

The demo data generator creates Beyblade-themed test data for development and QA testing.

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
