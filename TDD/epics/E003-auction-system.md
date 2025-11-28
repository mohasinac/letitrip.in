# Epic E003: Auction System

## Overview

Real-time auction functionality allowing sellers to create auctions and users to place bids with Firebase Realtime Database for live updates.

## Scope

- Auction creation and management
- Real-time bidding system
- Auto-bidding functionality
- Auction watchlist
- Won auctions management
- Auction end processing

## User Roles Involved

- **Admin**: Full auction management, feature auctions
- **Seller**: Create and manage own auctions
- **User**: Bid on auctions, watchlist, view won auctions
- **Guest**: View active auctions only

---

## Features

### F003.1: Auction Creation

**Priority**: P0 (Critical)

#### User Stories

**US003.1.1**: Create Auction (Seller)

```
As a seller
I want to create an auction for my product
So that I can sell to the highest bidder

Acceptance Criteria:
- Given I have an active shop and a product
- When I create an auction with valid details
- Then the auction is created in draft status
- And I can schedule when it starts

Required Fields:
- Product (from my shop)
- Auction type (regular/reverse/silent)
- Starting price
- Bid increment
- Start time
- End time (min 1 hour, max 30 days)

Optional Fields:
- Reserve price (hidden minimum)
- Buy now price (instant purchase)
- Allow extension (anti-sniping)
- Extension time (default 5 minutes)
```

**US003.1.2**: Create Auction from Product

```
As a seller
I want to create an auction directly from a product
So that the process is faster

Acceptance Criteria:
- Given I am viewing my product
- When I click "Create Auction"
- Then auction form opens pre-filled with product details
- And product images/details are linked
```

**US003.1.3**: Validate Auction Slug

```
As a seller
I want unique auction URLs
So that auctions are easily shareable

Acceptance Criteria:
- Given I am creating an auction
- When slug is auto-generated from product name
- Then I can customize if needed
- And uniqueness is validated
```

### F003.2: Auction Types

**Priority**: P1 (High)

#### User Stories

**US003.2.1**: Regular Auction

```
As a user
I want to bid on regular auctions
So that I can win items by bidding highest

Acceptance Criteria:
- Highest bid wins when auction ends
- Each bid must be >= current + increment
- Reserve price must be met for valid sale
```

**US003.2.2**: Reverse Auction

```
As a user
I want to participate in reverse auctions
So that I can get items at lower prices

Acceptance Criteria:
- Lowest bid wins
- Each bid must be < current bid
- Seller sets minimum acceptable price
```

**US003.2.3**: Silent Auction

```
As a user
I want to bid on silent auctions
So that other bidders don't know my bid

Acceptance Criteria:
- Bids are hidden during auction
- Only bidder count is shown
- All bids revealed at end
- Highest bid wins
```

### F003.3: Real-time Bidding

**Priority**: P0 (Critical)

#### User Stories

**US003.3.1**: Place Bid

```
As a logged-in user
I want to place a bid on an auction
So that I can try to win the item

Acceptance Criteria:
- Given I am on an active auction
- When I enter a valid bid amount and submit
- Then my bid is recorded
- And all viewers see the update in real-time
- And I receive confirmation

Validation:
- Bid >= currentPrice + bidIncrement
- User has not been outbid already
- Auction is active and not ended
- Bidder is not the auction owner
```

**US003.3.2**: Real-time Bid Updates

```
As a viewer
I want to see bids in real-time
So that I know the current auction status

Acceptance Criteria:
- Given I am viewing an auction
- When another user places a bid
- Then I see the new current price immediately
- And bid count updates
- And bid history updates

Technical:
- Uses Firebase Realtime Database
- < 1 second latency
- Works across all connected clients
```

**US003.3.3**: Auto-bidding

```
As a user
I want to set a maximum bid
So that the system bids for me up to that amount

Acceptance Criteria:
- Given I set max bid of ₹1000
- When someone outbids me at ₹500
- Then system auto-bids ₹500 + increment
- And continues until my max is reached
- And I'm notified when outbid beyond max
```

**US003.3.4**: Bid History

```
As a user
I want to see bid history
So that I understand bidding activity

Acceptance Criteria:
- Given I am viewing an auction
- When I view bid history
- Then I see last 10 bids
- And each shows bidder name, amount, time
```

### F003.4: Auction Timing

**Priority**: P0 (Critical)

#### User Stories

**US003.4.1**: Auction Countdown

```
As a viewer
I want to see time remaining
So that I know when auction ends

Acceptance Criteria:
- Given auction is active
- When I view the auction
- Then I see countdown timer
- And it updates every second
- And shows "Ended" when time expires
```

**US003.4.2**: Anti-sniping Extension

```
As a bidder
I want auctions to extend on last-minute bids
So that I have fair chance to respond

Acceptance Criteria:
- Given auction allows extension
- When bid placed in last X minutes (default 5)
- Then auction extends by X minutes
- And all viewers see extended time
- And maximum extensions can be set
```

**US003.4.3**: Scheduled Auctions

```
As a seller
I want to schedule auctions for future
So that I can plan ahead

Acceptance Criteria:
- Given I create an auction with future start time
- Then auction shows as "Scheduled"
- When start time arrives
- Then auction automatically becomes "Active"
```

### F003.5: Auction Discovery

**Priority**: P1 (High)

#### User Stories

**US003.5.1**: Browse Auctions

```
As a visitor
I want to browse auctions
So that I can find items to bid on

Acceptance Criteria:
- Given I am on auctions page
- When I browse
- Then I see active auctions
- And can filter by category, price, ending soon

Filters:
- Auction type
- Category
- Price range
- Ending soon (< 24 hours)
- Has bids / No bids
- Has buy now
```

**US003.5.2**: Featured Auctions

```
As a visitor
I want to see featured auctions
So that I discover popular items

Acceptance Criteria:
- Given I am on homepage
- When I view featured auctions
- Then I see admin-selected auctions
- And can click to view details
```

**US003.5.3**: Ending Soon

```
As a user
I want to see auctions ending soon
So that I don't miss opportunities

Acceptance Criteria:
- Given I view "Ending Soon"
- When the page loads
- Then I see auctions ending in < 24 hours
- Sorted by ending time ascending
```

### F003.6: Watchlist

**Priority**: P1 (High)

#### User Stories

**US003.6.1**: Add to Watchlist

```
As a logged-in user
I want to add auctions to watchlist
So that I can track them

Acceptance Criteria:
- Given I am viewing an auction
- When I click "Watch"
- Then auction is added to my watchlist
- And I receive notifications for activity
```

**US003.6.2**: View Watchlist

```
As a logged-in user
I want to view my watchlist
So that I can track auctions I'm interested in

Acceptance Criteria:
- Given I have watchlist items
- When I view my watchlist
- Then I see all watched auctions
- And their current status/price
```

**US003.6.3**: Watchlist Notifications

```
As a user with watchlist items
I want notifications about watched auctions
So that I don't miss important events

Notifications for:
- Auction starting
- New bids
- Ending soon (1 hour)
- Ended
```

### F003.7: My Bids

**Priority**: P1 (High)

#### User Stories

**US003.7.1**: View My Bids

```
As a logged-in user
I want to see auctions I've bid on
So that I can track my activity

Acceptance Criteria:
- Given I have placed bids
- When I view "My Bids"
- Then I see all auctions with my bids
- And my current standing (winning/outbid)
```

**US003.7.2**: Outbid Notifications

```
As a bidder
I want to be notified when outbid
So that I can bid again

Acceptance Criteria:
- Given I was the highest bidder
- When someone outbids me
- Then I receive immediate notification
- And email (if enabled)
```

### F003.8: Won Auctions

**Priority**: P0 (Critical)

#### User Stories

**US003.8.1**: View Won Auctions

```
As a winner
I want to see my won auctions
So that I can complete purchase

Acceptance Criteria:
- Given I won an auction
- When I view "Won Auctions"
- Then I see the item with winning bid
- And payment deadline
- And link to checkout
```

**US003.8.2**: Complete Auction Purchase

```
As a winner
I want to pay for won auction
So that I receive the item

Acceptance Criteria:
- Given I won an auction
- When I complete payment within deadline
- Then order is created
- And seller is notified

Payment Deadline: 48 hours default
```

**US003.8.3**: Failed Auction (No Payment)

```
As a seller
I want failed auctions to be relisted
So that I can sell the item

Acceptance Criteria:
- Given winner doesn't pay in time
- When deadline passes
- Then auction can be offered to second highest
- Or relisted as new auction
```

### F003.9: Auction Management (Seller)

**Priority**: P1 (High)

#### User Stories

**US003.9.1**: View My Auctions

```
As a seller
I want to see my auctions
So that I can manage them

Acceptance Criteria:
- Given I have auctions
- When I view "My Auctions"
- Then I see all auctions by status
- And can filter/sort
```

**US003.9.2**: Cancel Auction

```
As a seller
I want to cancel an auction
So that I can stop selling if needed

Acceptance Criteria:
- Given auction has no bids
- When I cancel the auction
- Then it is marked cancelled
- And removed from public view

Restrictions:
- Cannot cancel if has bids (need admin help)
```

**US003.9.3**: End Auction Early

```
As a seller
I want to end auction early (with bids)
So that I can sell now

Acceptance Criteria:
- Given auction has bids above reserve
- When I end early
- Then current highest bidder wins
- And normal checkout flow begins
```

### F003.10: Buy Now

**Priority**: P2 (Medium)

#### User Stories

**US003.10.1**: Buy Now Option

```
As a user
I want to buy auction item immediately
So that I don't have to wait or risk losing

Acceptance Criteria:
- Given auction has buy now price
- When I click "Buy Now"
- Then I pay the buy now price
- And auction ends immediately
- And I am the winner
```

---

## API Endpoints

| Endpoint                           | Method | Auth         | Description            |
| ---------------------------------- | ------ | ------------ | ---------------------- |
| `/api/auctions`                    | GET    | Public       | List auctions          |
| `/api/auctions`                    | POST   | Seller       | Create auction         |
| `/api/auctions/:slug`              | GET    | Public       | Get auction details    |
| `/api/auctions/:slug`              | PATCH  | Seller/Admin | Update auction         |
| `/api/auctions/:slug`              | DELETE | Seller/Admin | Delete/cancel auction  |
| `/api/auctions/:id/bids`           | GET    | Public       | Get bid history        |
| `/api/auctions/:id/bids`           | POST   | User         | Place bid              |
| `/api/auctions/bulk`               | POST   | Seller/Admin | Bulk operations        |
| `/api/auctions/my-bids`            | GET    | User         | My bids                |
| `/api/auctions/watchlist`          | GET    | User         | My watchlist           |
| `/api/auctions/watchlist`          | POST   | User         | Add to watchlist       |
| `/api/auctions/won`                | GET    | User         | Won auctions           |
| `/api/auctions/featured`           | GET    | Public       | Featured auctions      |
| `/api/auctions/live`               | GET    | Public       | Active live auctions   |
| `/api/auctions/cron/process-ended` | POST   | System       | Process ended auctions |

---

## Data Models

### AuctionBE (Backend)

```typescript
interface AuctionBE {
  id: string;
  slug: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  images?: string[];
  videos?: string[];
  productDescription: string;
  sellerId: string;
  sellerName: string;
  shopId: string | null;
  shopName: string | null;
  type: "regular" | "reverse" | "silent";
  status:
    | "draft"
    | "scheduled"
    | "active"
    | "extended"
    | "ended"
    | "cancelled"
    | "completed";
  startingPrice: number;
  reservePrice: number | null;
  currentPrice: number;
  buyNowPrice: number | null;
  bidIncrement: number;
  minimumBid: number;
  totalBids: number;
  uniqueBidders: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  hasAutoBid: boolean;
  autoBidMaxAmount: number | null;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  allowExtension: boolean;
  extensionTime: number;
  timesExtended: number;
  isActive: boolean;
  isEnded: boolean;
  hasBids: boolean;
  hasWinner: boolean;
  winnerId: string | null;
  winnerName: string | null;
  winningBid: number | null;
  reserveMet: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### BidBE (Backend)

```typescript
interface BidBE {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  isAutoBid: boolean;
  maxAutoBidAmount: number | null;
  createdAt: Timestamp;
}
```

---

## Firebase Realtime Database Structure

```
auctions/
  {auctionId}/
    status/
      auctionId: string
      currentBid: number
      bidCount: number
      isActive: boolean
      endTime: number (timestamp)
      winnerId: string
      lastUpdate: number (timestamp)
    bids/
      {bidId}/
        auctionId: string
        userId: string
        userName: string
        amount: number
        timestamp: number
```

---

## Test Scenarios

### Unit Tests

- [ ] Validate bid amount >= current + increment
- [ ] Validate auction time range
- [ ] Calculate extension time
- [ ] Determine winner correctly

### Integration Tests

- [ ] Create auction and place bids
- [ ] Real-time bid propagation
- [ ] Auto-bid functionality
- [ ] Extension on last-minute bid
- [ ] Auction end processing

### E2E Tests

- [ ] Complete auction lifecycle (create → bid → win → pay)
- [ ] Multiple bidders competing
- [ ] Watchlist notifications
- [ ] Buy now interrupting auction

---

## Business Rules

1. **Bid Validation**: Each bid must exceed current + increment
2. **Reserve Price**: Sale only valid if reserve met
3. **Extension**: Max 10 extensions per auction
4. **Payment Deadline**: 48 hours to pay after winning
5. **No Self-Bidding**: Sellers cannot bid on own auctions
6. **Concurrent Bids**: Server timestamp determines order

## Related Epics

- E002: Product Catalog (auction items)
- E005: Order Management (won auction orders)
- E011: Payment System (auction payments)

---

## Test Documentation

- **API Specs**: `/TDD/resources/auctions/API-SPECS.md`
- **Test Cases**: `/TDD/resources/auctions/TEST-CASES.md`

### Test Coverage

- Unit tests for bid validation
- Unit tests for auction timing logic
- Integration tests for real-time bidding
- E2E tests for complete auction lifecycle
- Performance tests for concurrent bidding
