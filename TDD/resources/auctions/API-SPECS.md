# Auctions Resource - API Specifications

## Overview

Auction management APIs for live bidding, auction CRUD, and real-time updates via Firebase Realtime Database.

---

## Architecture Note

Auctions use a hybrid approach:

- **Firestore**: Auction metadata, product details, configuration
- **Firebase Realtime Database**: Live bidding, current price, bid history (for real-time sync)

---

## Endpoints

### Public Endpoints

#### GET /api/auctions

List auctions with filtering and pagination.

**Query Parameters**:

| Param    | Type   | Default | Description                      |
| -------- | ------ | ------- | -------------------------------- |
| page     | number | 1       | Page number                      |
| limit    | number | 20      | Items per page                   |
| status   | string | active  | scheduled/active/ended/cancelled |
| category | string | -       | Category slug or ID              |
| shop     | string | -       | Shop slug or ID                  |
| minPrice | number | -       | Minimum current price            |
| maxPrice | number | -       | Maximum current price            |
| sortBy   | string | endTime | endTime, bidCount, currentPrice  |
| order    | string | asc     | asc/desc                         |
| ending   | string | -       | today, this-week (ending soon)   |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "auction_001",
      "title": "Vintage Watch Auction",
      "slug": "vintage-watch-auction",
      "product": {
        "id": "prod_001",
        "name": "Vintage Rolex Watch",
        "images": [{ "url": "https://...", "alt": "Watch" }]
      },
      "shop": {
        "id": "shop_001",
        "name": "Antique Store",
        "slug": "antique-store"
      },
      "startingPrice": 5000,
      "currentPrice": 12500,
      "reservePrice": 15000,
      "reserveMet": false,
      "minBidIncrement": 500,
      "bidCount": 15,
      "watcherCount": 42,
      "status": "active",
      "startTime": "2024-11-01T10:00:00Z",
      "endTime": "2024-12-15T22:00:00Z",
      "timeRemaining": "15d 12h 30m"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

---

#### GET /api/auctions/:id

Get auction by ID or slug.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "auction_001",
    "title": "Vintage Watch Auction",
    "slug": "vintage-watch-auction",
    "description": "Rare vintage Rolex from 1960s...",
    "product": {
      "id": "prod_001",
      "name": "Vintage Rolex Watch",
      "description": "Authentic vintage...",
      "images": [
        {
          "id": "img_001",
          "url": "https://...",
          "thumbnailUrl": "https://...",
          "alt": "Watch front"
        }
      ],
      "specifications": [
        { "key": "Year", "value": "1965" },
        { "key": "Material", "value": "Gold" }
      ]
    },
    "shop": {
      "id": "shop_001",
      "name": "Antique Store",
      "slug": "antique-store",
      "rating": 4.8,
      "isVerified": true
    },
    "seller": {
      "id": "seller_001",
      "name": "John's Antiques",
      "rating": 4.9
    },
    "pricing": {
      "startingPrice": 5000,
      "currentPrice": 12500,
      "reservePrice": 15000,
      "reserveMet": false,
      "minBidIncrement": 500,
      "buyNowPrice": 50000
    },
    "bidding": {
      "totalBids": 15,
      "uniqueBidders": 8,
      "highestBidder": {
        "id": "user_partial_id",
        "name": "J***n"
      },
      "myBid": null,
      "myMaxBid": null
    },
    "timing": {
      "startTime": "2024-11-01T10:00:00Z",
      "endTime": "2024-12-15T22:00:00Z",
      "timeRemaining": "15d 12h 30m",
      "isExtended": false,
      "extensionCount": 0
    },
    "status": "active",
    "watcherCount": 42,
    "isWatching": false,
    "terms": "All sales final. Shipping calculated separately.",
    "createdAt": "2024-10-25T00:00:00Z"
  }
}
```

---

#### GET /api/auctions/:id/bids

Get bid history for an auction.

**Query Parameters**:

| Param | Type   | Default | Description    |
| ----- | ------ | ------- | -------------- |
| limit | number | 50      | Number of bids |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "bid_001",
      "amount": 12500,
      "bidder": {
        "id": "user_partial",
        "name": "J***n"
      },
      "isAutoBid": false,
      "createdAt": "2024-11-28T15:30:00Z"
    },
    {
      "id": "bid_002",
      "amount": 12000,
      "bidder": {
        "id": "user_partial2",
        "name": "S***a"
      },
      "isAutoBid": true,
      "createdAt": "2024-11-28T15:25:00Z"
    }
  ],
  "meta": {
    "total": 15
  }
}
```

---

### Authenticated User Endpoints

#### POST /api/auctions/:id/bids

Place a bid on an auction.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "amount": 13000
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "bidId": "bid_003",
    "auctionId": "auction_001",
    "amount": 13000,
    "isHighestBid": true,
    "currentPrice": 13000,
    "nextMinBid": 13500,
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Bid placed successfully"
}
```

**Error Responses**:

| Status | Code                   | Message                        |
| ------ | ---------------------- | ------------------------------ |
| 400    | `AUCTION_NOT_ACTIVE`   | Auction is not active          |
| 400    | `BID_TOO_LOW`          | Bid must be at least ₹X        |
| 400    | `OUTBID`               | You were outbid during request |
| 400    | `CANNOT_BID_OWN`       | Cannot bid on your own auction |
| 402    | `INSUFFICIENT_BALANCE` | Insufficient wallet balance    |
| 403    | `BIDDING_RESTRICTED`   | Your account cannot place bids |

---

#### POST /api/auctions/:id/auto-bid

Set up auto-bidding with maximum limit.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "maxBid": 20000
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "autoBidId": "autobid_001",
    "auctionId": "auction_001",
    "maxBid": 20000,
    "currentBid": 13500,
    "isActive": true,
    "createdAt": "2024-11-29T10:05:00Z"
  },
  "message": "Auto-bid configured successfully"
}
```

---

#### DELETE /api/auctions/:id/auto-bid

Cancel auto-bidding.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Auto-bid cancelled"
}
```

---

#### POST /api/auctions/:id/watch

Add auction to watchlist.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Auction added to watchlist"
}
```

---

#### DELETE /api/auctions/:id/watch

Remove from watchlist.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Auction removed from watchlist"
}
```

---

#### GET /api/auctions/my-bids

Get user's bid history.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Param  | Type   | Default | Description           |
| ------ | ------ | ------- | --------------------- |
| page   | number | 1       | Page number           |
| limit  | number | 20      | Items per page        |
| status | string | -       | winning/outbid/active |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "auction": {
        "id": "auction_001",
        "title": "Vintage Watch",
        "slug": "vintage-watch",
        "image": "https://...",
        "endTime": "2024-12-15T22:00:00Z",
        "status": "active"
      },
      "myBid": {
        "amount": 13000,
        "isHighest": true,
        "bidCount": 3,
        "lastBidAt": "2024-11-29T10:00:00Z"
      },
      "currentPrice": 13000
    }
  ],
  "meta": {
    "page": 1,
    "total": 5
  }
}
```

---

#### GET /api/auctions/watchlist

Get user's auction watchlist.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "auction_001",
      "title": "Vintage Watch",
      "currentPrice": 13000,
      "endTime": "2024-12-15T22:00:00Z",
      "status": "active",
      "addedAt": "2024-11-20T10:00:00Z"
    }
  ]
}
```

---

#### GET /api/auctions/won

Get user's won auctions.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "auction": {
        "id": "auction_002",
        "title": "Antique Clock",
        "slug": "antique-clock",
        "endedAt": "2024-10-01T22:00:00Z"
      },
      "winningBid": 45000,
      "paymentStatus": "paid",
      "orderStatus": "shipped",
      "orderId": "order_001"
    }
  ]
}
```

---

### Seller Endpoints

#### GET /api/seller/auctions

List seller's auctions.

**Headers**: `Authorization: Bearer <seller_token>`

**Query Parameters**:

| Param  | Type   | Default | Description                  |
| ------ | ------ | ------- | ---------------------------- |
| page   | number | 1       | Page number                  |
| status | string | -       | draft/scheduled/active/ended |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "auction_001",
      "title": "Vintage Watch",
      "status": "active",
      "currentPrice": 13000,
      "bidCount": 15,
      "endTime": "2024-12-15T22:00:00Z",
      "revenue": 0,
      "createdAt": "2024-10-25T00:00:00Z"
    }
  ]
}
```

---

#### POST /api/seller/auctions

Create a new auction.

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "title": "Rare Vintage Watch",
  "slug": "rare-vintage-watch",
  "description": "Authentic vintage watch from 1960s...",
  "productId": "prod_001",
  "startingPrice": 5000,
  "reservePrice": 15000,
  "minBidIncrement": 500,
  "buyNowPrice": 50000,
  "startTime": "2024-12-01T10:00:00Z",
  "endTime": "2024-12-15T22:00:00Z",
  "extensionMinutes": 5,
  "extensionThreshold": 2,
  "terms": "All sales final."
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "auction_new_001",
    "title": "Rare Vintage Watch",
    "slug": "rare-vintage-watch",
    "status": "scheduled",
    "startTime": "2024-12-01T10:00:00Z",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Auction created successfully"
}
```

---

#### PUT /api/seller/auctions/:id

Update auction (only before it starts or for limited fields).

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "description": "Updated description...",
  "reservePrice": 20000
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "auction_001",
    "reservePrice": 20000,
    "updatedAt": "2024-11-29T11:00:00Z"
  }
}
```

---

#### DELETE /api/seller/auctions/:id

Cancel/delete auction (only if no bids).

**Headers**: `Authorization: Bearer <seller_token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Auction cancelled"
}
```

**Error Responses**:

| Status | Code            | Message                         |
| ------ | --------------- | ------------------------------- |
| 400    | `HAS_BIDS`      | Cannot cancel auction with bids |
| 400    | `ALREADY_ENDED` | Auction has already ended       |

---

### Admin Endpoints

#### PATCH /api/admin/auctions/:id

Admin update auction (force end, extend, etc.).

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "action": "extend",
  "extendMinutes": 60,
  "reason": "Technical issues"
}
```

**Supported Actions**: `extend`, `end`, `cancel`, `suspend`, `resume`

---

## Firebase Realtime Database Structure

```
/auctions
  /[auctionId]
    /currentPrice: 13000
    /bidCount: 15
    /highestBidderId: "user_123"
    /lastBidAt: 1701259200000
    /endTime: 1702677600000
    /isExtended: false
    /bids
      /[bidId]
        /userId: "user_123"
        /amount: 13000
        /isAutoBid: false
        /timestamp: 1701259200000
    /watchers
      /[userId]: true
    /autoBids
      /[userId]
        /maxBid: 20000
        /isActive: true
```

---

## RBAC Permissions

| Endpoint                    | Guest | User | Seller | Admin |
| --------------------------- | ----- | ---- | ------ | ----- |
| GET /auctions               | ✅    | ✅   | ✅     | ✅    |
| GET /auctions/:id           | ✅    | ✅   | ✅     | ✅    |
| GET /auctions/:id/bids      | ✅    | ✅   | ✅     | ✅    |
| POST /auctions/:id/bids     | ❌    | ✅   | ✅     | ✅    |
| POST /auctions/:id/auto-bid | ❌    | ✅   | ✅     | ✅    |
| POST /auctions/:id/watch    | ❌    | ✅   | ✅     | ✅    |
| GET /auctions/my-bids       | ❌    | ✅   | ✅     | ✅    |
| GET /auctions/watchlist     | ❌    | ✅   | ✅     | ✅    |
| GET /auctions/won           | ❌    | ✅   | ✅     | ✅    |
| GET /seller/auctions        | ❌    | ❌   | ✅     | ✅    |
| POST /seller/auctions       | ❌    | ❌   | ✅     | ✅    |
| PUT /seller/auctions/:id    | ❌    | ❌   | ✅\*   | ✅    |
| DELETE /seller/auctions/:id | ❌    | ❌   | ✅\*   | ✅    |
| PATCH /admin/auctions/:id   | ❌    | ❌   | ❌     | ✅    |

\*Owner only

---

## Service Usage

```typescript
import { auctionsService } from "@/services";

// Public
const auctions = await auctionsService.list({
  status: "active",
  ending: "today",
});
const auction = await auctionsService.getById("auction_001");
const bids = await auctionsService.getBids("auction_001");

// Bidding
await auctionsService.placeBid("auction_001", { amount: 15000 });
await auctionsService.setAutoBid("auction_001", { maxBid: 25000 });
await auctionsService.cancelAutoBid("auction_001");

// Watchlist
await auctionsService.watch("auction_001");
await auctionsService.unwatch("auction_001");
const watchlist = await auctionsService.getWatchlist();

// User bids
const myBids = await auctionsService.getMyBids({ status: "winning" });
const wonAuctions = await auctionsService.getWonAuctions();

// Seller
const myAuctions = await auctionsService.listSeller({ status: "active" });
await auctionsService.create(auctionData);
await auctionsService.update("auction_001", { reservePrice: 20000 });
await auctionsService.cancel("auction_001");

// Admin
await auctionsService.adminAction("auction_001", {
  action: "extend",
  minutes: 60,
});
```

---

## Real-time Subscription

```typescript
import {
  subscribeToAuction,
  unsubscribeFromAuction,
} from "@/lib/firebase/realtime";

// Subscribe to auction updates
const unsubscribe = subscribeToAuction("auction_001", (data) => {
  console.log("Current price:", data.currentPrice);
  console.log("Bid count:", data.bidCount);
  console.log("Time remaining:", data.endTime - Date.now());
});

// Cleanup
unsubscribe();
```

---

## Validation Rules

### Auction Creation

- **title**: 5-200 chars, required
- **slug**: 5-200 chars, unique, required
- **productId**: Valid product owned by seller, required
- **startingPrice**: Positive integer (paise), required
- **reservePrice**: >= startingPrice if provided
- **minBidIncrement**: Positive integer, default 100
- **startTime**: Future date, required
- **endTime**: > startTime, max 30 days duration

### Bidding

- **amount**: Must be >= currentPrice + minBidIncrement
- Cannot bid on own auction
- Cannot bid after auction ends
- Auto-bid maxBid must be > currentPrice

---

## Related Files

- `/src/services/auctions.service.ts`
- `/src/app/api/auctions/`
- `/src/app/api/seller/auctions/`
- `/src/lib/firebase/realtime.ts`
- `/src/types/backend/auction.types.ts`
