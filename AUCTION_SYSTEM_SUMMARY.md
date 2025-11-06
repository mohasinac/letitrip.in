# Auction System Implementation Summary

## Overview

The justforview.in marketplace now includes a **Live Auction House** feature inspired by eBay's auction system. This document summarizes the auction system architecture, features, and implementation requirements.

---

## Core Features

### 1. **Auction Creation & Limits**

- **Sellers**: Can create up to **5 active auctions per shop**
- **Admins**: **Unlimited** auction creation
- Each auction is tied to a **shop_id** (not user_id)
- Auctions include: starting bid, reserve price, duration, end time
- Media upload with retry logic (same as products)

### 2. **Live Bidding System**

- **WebSocket-based** real-time bidding
- Users can place bids on active auctions
- Live updates for:
  - Current highest bid
  - Bid count
  - Time remaining
  - New bids from other users
- Bid validation (minimum increment, reserve price)
- Concurrent bid handling (race condition prevention)

### 3. **Featured Auctions**

- **Admin-curated** featured auctions
- Priority order for homepage display
- Separate API endpoint for featured auctions
- Increased visibility for high-value items

### 4. **Auction Discovery**

- Browse all auctions (live, upcoming, ended)
- Search auctions (separate from products)
- Filter by:
  - Category
  - Price range
  - Time left
  - Shop
  - Status (active/ended)
- Sort by:
  - Time Left (Less to More, More to Less)
  - Price (Low to High, High to Low)
  - Ending Soon
  - Latest

### 5. **User Auction Features**

- **Watchlist**: Save auctions to watch
- **My Bids**: View all active bids with status
- **Won Auctions**: Auctions won, awaiting payment
- Notifications:
  - Outbid alerts
  - Auction ending soon
  - Auction won
  - Payment reminder

### 6. **Auction End Automation**

- **Job Scheduler** (Node-cron / BullMQ)
- Automatically closes auctions at end time
- Determines winner (highest bidder)
- Sends notifications to winner and seller
- Creates payment request for winner
- Updates auction status to "ended"

---

## Architecture Decisions

### Products vs Auctions

| Feature               | Products                   | Auctions                       |
| --------------------- | -------------------------- | ------------------------------ |
| **Storage**           | `shop_id` (not user_id)    | `shop_id` (not user_id)        |
| **Variants**          | ✅ From same leaf category | ❌ No variants                 |
| **Limit per Shop**    | Unlimited                  | 5 active (unlimited for admin) |
| **Similar Items**     | ✅ Max 10, diverse shops   | ✅ Max 10, diverse shops       |
| **Seller Items**      | ✅ By shop_id              | ✅ By shop_id                  |
| **Add to Cart**       | ✅ Yes                     | ❌ No (bid only)               |
| **Real-time Updates** | ❌ No                      | ✅ WebSocket                   |

### Shop-Based Architecture

**Why `shop_id` instead of `user_id`?**

1. **Ownership Transfer**: Shops can be transferred to new owners
2. **Multi-Vendor**: Products/auctions belong to the shop, not the user
3. **Analytics**: Track shop performance (products + auctions)
4. **Seller Items**: Display "Other items from this seller" by shop_id

### Search Architecture

- **Toggle between Products and Auctions** (not both simultaneously)
- Separate search indices for products and auctions
- Unified search UI with type toggle
- Filters adapt based on search type (products vs auctions)

---

## Database Schema

### Auctions Table

```typescript
interface Auction {
  id: string;
  shop_id: string; // NOT user_id
  title: string;
  description: string;
  slug: string;
  category_id: string;
  starting_bid: number;
  reserve_price: number; // minimum price to sell
  current_bid: number;
  bid_count: number;
  images: string[];
  videos: string[];
  start_time: Timestamp;
  end_time: Timestamp;
  duration_hours: number;
  status: "pending" | "active" | "ended" | "cancelled";
  featured: boolean;
  featured_priority: number;
  winner_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Bids Table

```typescript
interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  bid_amount: number;
  bid_time: Timestamp;
  is_winning: boolean; // Current highest bid
  is_auto_bid: boolean; // Future: auto-bidding
  max_bid: number; // Future: auto-bidding limit
}
```

### Watchlist Table

```typescript
interface Watchlist {
  id: string;
  user_id: string;
  auction_id: string;
  created_at: Timestamp;
}
```

### Won Auctions Table

```typescript
interface WonAuction {
  id: string;
  auction_id: string;
  winner_id: string;
  final_bid: number;
  payment_status: "pending" | "paid" | "failed";
  payment_deadline: Timestamp;
  created_at: Timestamp;
}
```

---

## API Endpoints

### Auction Management

```
GET    /api/auctions                    - List all auctions (filtered by role)
POST   /api/auctions                    - Create auction (seller/admin, with limit check)
GET    /api/auctions/[id]               - Auction details
PATCH  /api/auctions/[id]               - Update auction (owner/admin)
DELETE /api/auctions/[id]               - Delete auction (owner/admin)

GET    /api/auctions/live               - Live auctions feed (WebSocket)
GET    /api/auctions/featured           - Featured auctions (admin curated)
PATCH  /api/auctions/[id]/feature       - Set featured (admin only)
```

### Bidding

```
GET    /api/auctions/[id]/bid           - List all bids for auction
POST   /api/auctions/[id]/bid           - Place bid (authenticated users)
```

### Similar & Seller Items

```
GET    /api/auctions/[id]/similar       - Similar auctions (max 10, diverse shops)
GET    /api/auctions/[id]/seller-items  - Other auctions from same seller (shop_id)
```

### User Auction Features

```
GET    /api/users/me/bids               - User's active bids
GET    /api/users/me/watchlist          - User's watchlist
POST   /api/users/me/watchlist          - Add to watchlist
DELETE /api/users/me/watchlist/[id]     - Remove from watchlist
GET    /api/users/me/won-auctions       - Won auctions awaiting payment
```

---

## UI/UX Requirements

### Auction Detail Page (eBay-style)

**Left Column (60%):**

- Image/video gallery
- Auction description with tabs
- Seller info card
- Similar auctions carousel
- Seller's other auctions

**Right Column (40%):**

- Current bid (large, prominent)
- Time remaining (countdown timer)
- Bid count
- Place bid form
  - Bid amount input
  - Minimum bid indicator
  - Submit button
- Watch button
- Bid history (live updates)
- Shipping info
- Terms & conditions

### Auction Listing Pages

**Filters (Sidebar):**

- Category
- Price range (current bid)
- Time left (< 1hr, < 6hr, < 1day, etc.)
- Shop
- Status (active/ended)

**Sort Options (Dropdown):**

- Time Left: Less to More
- Time Left: More to Less
- Price: Low to High
- Price: High to Low
- Ending Soon (realtime)
- Latest

**Quick Filters (Top Bar):**

- In Stock checkbox → N/A for auctions
- Sort dropdown (realtime)

### Live Bidding Experience

- **WebSocket Connection**: Established when viewing auction detail page
- **Real-time Updates**:
  - New bid placed (update current bid, bid count)
  - Outbid notification (if user was winning)
  - Auction ending soon warning
  - Auction ended notification
- **Visual Feedback**:
  - Pulse animation on new bid
  - Countdown timer updates every second
  - "You're winning!" indicator
  - "Outbid!" warning

### Watchlist

- Heart icon to watch/unwatch
- Watchlist page shows all watched auctions
- Notifications for watched auctions:
  - Ending soon (1 hour before)
  - Price drop below reserve
  - New bids

---

## Similar Products/Auctions Algorithm

### Goal

Display max **10 similar items** from **as many different shops as possible**.

### Algorithm

```typescript
async function getSimilarAuctions(auctionId: string) {
  const auction = await getAuction(auctionId);
  const results = [];
  const seenShops = new Set([auction.shop_id]); // Exclude current shop

  // Step 1: Same leaf category (different shops)
  const sameCategory = await getAuctionsByCategory(auction.category_id, {
    limit: 10,
    excludeShops: [auction.shop_id],
  });

  for (const item of sameCategory) {
    if (!seenShops.has(item.shop_id)) {
      results.push(item);
      seenShops.add(item.shop_id);
      if (results.length >= 10) return results;
    }
  }

  // Step 2: Parent category (if < 10)
  if (results.length < 10) {
    const parentCategory = await getParentCategory(auction.category_id);
    if (parentCategory) {
      const parentItems = await getAuctionsByCategory(parentCategory.id, {
        limit: 10 - results.length,
        excludeShops: Array.from(seenShops),
      });

      for (const item of parentItems) {
        if (!seenShops.has(item.shop_id)) {
          results.push(item);
          seenShops.add(item.shop_id);
          if (results.length >= 10) return results;
        }
      }
    }
  }

  // Step 3: Grandparent category (if still < 10)
  if (results.length < 10) {
    const grandparentCategory = await getParentCategory(parentCategory.id);
    if (grandparentCategory) {
      const grandparentItems = await getAuctionsByCategory(
        grandparentCategory.id,
        { limit: 10 - results.length, excludeShops: Array.from(seenShops) }
      );

      for (const item of grandparentItems) {
        if (!seenShops.has(item.shop_id)) {
          results.push(item);
          seenShops.add(item.shop_id);
          if (results.length >= 10) return results;
        }
      }
    }
  }

  return results;
}
```

**Key Points:**

- Max 10 results
- Prioritize diverse shops (different shop_id)
- Traverse category hierarchy (leaf → parent → grandparent)
- Exclude current item's shop

---

## WebSocket Implementation

### Connection Flow

```typescript
// Client-side
const socket = io("wss://yoursite.com", {
  path: "/api/auctions/live",
  auth: {
    token: session.token,
  },
});

// Join auction room
socket.emit("join-auction", { auctionId });

// Listen for bid updates
socket.on("bid-placed", (data) => {
  updateCurrentBid(data.bidAmount);
  updateBidCount(data.bidCount);
  if (data.userId !== currentUser.id) {
    showOutbidNotification();
  }
});

// Listen for auction end
socket.on("auction-ended", (data) => {
  showAuctionEndedModal(data.winnerId);
  disableBidding();
});

// Leave auction room on unmount
socket.emit("leave-auction", { auctionId });
socket.disconnect();
```

### Server-side (Next.js API Route)

```typescript
// /src/app/api/auctions/live/route.ts
import { Server } from "socket.io";

export async function GET(req: Request) {
  const io = new Server(/* ... */);

  io.on("connection", (socket) => {
    socket.on("join-auction", async ({ auctionId }) => {
      socket.join(`auction-${auctionId}`);

      // Send current auction state
      const auction = await getAuction(auctionId);
      socket.emit("auction-state", auction);
    });

    socket.on("place-bid", async ({ auctionId, bidAmount }) => {
      // Validate bid
      const isValid = await validateBid(auctionId, bidAmount, socket.userId);

      if (isValid) {
        // Save bid to database
        const bid = await createBid({
          auctionId,
          userId: socket.userId,
          bidAmount,
        });

        // Update auction current bid
        await updateAuctionCurrentBid(auctionId, bidAmount);

        // Broadcast to all users in auction room
        io.to(`auction-${auctionId}`).emit("bid-placed", {
          bidAmount,
          userId: socket.userId,
          bidCount: await getBidCount(auctionId),
          timestamp: new Date(),
        });
      } else {
        socket.emit("bid-error", { message: "Invalid bid" });
      }
    });

    socket.on("leave-auction", ({ auctionId }) => {
      socket.leave(`auction-${auctionId}`);
    });
  });
}
```

---

## Auction End Job Scheduler

### Implementation (Node-cron)

```typescript
// /src/jobs/auction-closer.ts
import cron from "node-cron";

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("Checking for ended auctions...");

  const endedAuctions = await getEndedAuctions();

  for (const auction of endedAuctions) {
    await closeAuction(auction.id);
  }
});

async function closeAuction(auctionId: string) {
  const auction = await getAuction(auctionId);
  const highestBid = await getHighestBid(auctionId);

  if (!highestBid || highestBid.bid_amount < auction.reserve_price) {
    // No winner (reserve not met)
    await updateAuction(auctionId, {
      status: "ended",
      winner_id: null,
    });

    await sendNotification(auction.shop_id, {
      type: "auction-ended-no-winner",
      message: `Your auction "${auction.title}" ended without meeting reserve price.`,
    });
  } else {
    // Winner found
    await updateAuction(auctionId, {
      status: "ended",
      winner_id: highestBid.user_id,
    });

    await createWonAuction({
      auction_id: auctionId,
      winner_id: highestBid.user_id,
      final_bid: highestBid.bid_amount,
      payment_status: "pending",
      payment_deadline: addDays(new Date(), 3),
    });

    // Notify winner
    await sendNotification(highestBid.user_id, {
      type: "auction-won",
      message: `You won the auction for "${auction.title}"! Please complete payment within 3 days.`,
    });

    // Notify seller
    await sendNotification(auction.shop_id, {
      type: "auction-ended-winner",
      message: `Your auction "${auction.title}" ended. Winner: ${highestBid.user_id}. Final bid: ₹${highestBid.bid_amount}.`,
    });

    // Broadcast to WebSocket room
    io.to(`auction-${auctionId}`).emit("auction-ended", {
      winnerId: highestBid.user_id,
      finalBid: highestBid.bid_amount,
    });
  }
}
```

---

## Filter Behavior

### Products & Auctions

| Filter Type     | Products    | Auctions          | Apply Method         |
| --------------- | ----------- | ----------------- | -------------------- |
| **Category**    | ✅          | ✅                | Apply Filters button |
| **Price Range** | ✅          | ✅ (Current Bid)  | Apply Filters button |
| **In Stock**    | ✅ Checkbox | ❌ N/A            | Realtime             |
| **Shop**        | ✅          | ✅                | Apply Filters button |
| **Time Left**   | ❌ N/A      | ✅                | Apply Filters button |
| **Rating**      | ✅          | ❌ N/A            | Apply Filters button |
| **Status**      | ❌ N/A      | ✅ (Active/Ended) | Apply Filters button |

### Sort Behavior

- **All sort options are realtime** (no apply button)
- Products: Relevance, Latest, Price Low-High, Price High-Low
- Auctions: Time Left Less-More, Time Left More-Less, Price, Ending Soon

---

## Testing Strategy

### Unit Tests

- Bid validation logic
- Auction limit check (5 per shop)
- Similar auction algorithm (diverse shops)
- Auction end scheduler

### Integration Tests

- Create auction API
- Place bid API
- WebSocket connection
- Auction end job

### E2E Tests

- Create auction flow
- Place bid flow
- Watch auction flow
- Win auction flow
- Payment flow for won auction

### Load Tests

- Concurrent bidding (race conditions)
- WebSocket connection pooling
- Auction end scheduler performance

---

## Implementation Checklist

### Phase 1: Database & API (High Priority)

- [ ] Create auction schema (auctions, bids, watchlist, won_auctions)
- [ ] Add shop_id indexes
- [ ] Implement auction CRUD APIs
- [ ] Implement bidding API
- [ ] Add auction limit validation (5 per shop)

### Phase 2: WebSocket (High Priority)

- [ ] Set up Socket.io server
- [ ] Implement auction rooms
- [ ] Implement real-time bid broadcasting
- [ ] Add connection pooling
- [ ] Add error handling

### Phase 3: Job Scheduler (High Priority)

- [ ] Set up Node-cron / BullMQ
- [ ] Implement auction end checker
- [ ] Implement winner determination
- [ ] Add notification system
- [ ] Add error recovery

### Phase 4: UI Components (Medium Priority)

- [ ] Auction listing page
- [ ] Auction detail page (eBay-style)
- [ ] Live bidding component
- [ ] Countdown timer component
- [ ] Bid history component
- [ ] Watchlist page

### Phase 5: Seller Dashboard (Medium Priority)

- [ ] My Auctions page
- [ ] Create auction page
- [ ] Edit auction page
- [ ] Auction analytics

### Phase 6: Admin Dashboard (Medium Priority)

- [ ] All auctions page
- [ ] Featured auction manager
- [ ] Auction moderation

### Phase 7: User Features (Medium Priority)

- [ ] My Bids page
- [ ] Watchlist page
- [ ] Won Auctions page
- [ ] Bid notifications

### Phase 8: Search & Discovery (Low Priority)

- [ ] Auction search toggle
- [ ] Auction filters
- [ ] Auction sort options
- [ ] Featured auctions on homepage

---

## Success Metrics

### Engagement

- Active auctions per day
- Bids per auction (average)
- Watchlist additions
- Auction views

### Conversion

- Auctions ending with winner (%)
- Payment completion rate (%)
- Repeat bidders (%)

### Performance

- WebSocket latency (ms)
- Auction end job execution time (ms)
- Concurrent connections (count)

### Business

- GMV (Gross Merchandise Value) from auctions
- Revenue from auction fees (if applicable)
- Seller adoption rate (% of shops with auctions)

---

Last Updated: November 7, 2025
