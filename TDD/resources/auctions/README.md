# Auctions Resource

> **Last Updated**: December 7, 2025  
> **Status**: ✅ Fully Implemented (Phase 1 & 2)  
> **Related Epic**: [E003: Auction System](../../epics/E003-auction-system.md)

---

## Overview

Real-time auction system with bidding, watchlist, auto-bidding, and RipLimit integration for deferred payments.

## Database Collections

### Firestore

- `auctions` - Auction documents (main data)
- `bids` - Bid history documents
- `auction_watchlist` - User watchlist entries
- `won_auctions` - Won auction records

### Firebase Realtime Database (Real-time Bidding)

```
auctions/
  {auctionId}/
    status: "active" | "ended" | "cancelled"
    currentBid: number
    bidCount: number
    highestBidder: userId
    bids/
      {bidId}/
        amount: number
        userId: string
        timestamp: number
```

## Service Layer

**Location**: `src/services/auctions.service.ts`

### Available Methods

```typescript
class AuctionsService {
  // List & Filtering
  async list(params?: AuctionListParams): Promise<AuctionFE[]>;
  async getBySlug(slug: string): Promise<AuctionFE>;
  async getLive(): Promise<AuctionFE[]>;
  async getFeatured(): Promise<AuctionFE[]>;

  // CRUD Operations
  async create(data: Partial<AuctionBE>): Promise<AuctionFE>;
  async update(slug: string, data: Partial<AuctionBE>): Promise<AuctionFE>;
  async delete(slug: string): Promise<void>;

  // Bidding
  async placeBid(auctionId: string, amount: number): Promise<BidFE>;
  async getMyBids(): Promise<BidFE[]>;
  async getBidsForAuction(auctionId: string): Promise<BidFE[]>;

  // Watchlist
  async addToWatchlist(auctionId: string): Promise<void>;
  async removeFromWatchlist(auctionId: string): Promise<void>;
  async getWatchlist(): Promise<AuctionFE[]>;

  // Won Auctions
  async getWonAuctions(): Promise<AuctionFE[]>;

  // Related Auctions
  async getSimilar(slug: string): Promise<AuctionFE[]>;
  async getSellerItems(slug: string): Promise<AuctionFE[]>;

  // Admin Actions
  async feature(auctionId: string): Promise<void>;
  async unfeature(auctionId: string): Promise<void>;
}
```

## API Routes

### Public Routes

```
GET  /api/auctions                   - List active auctions
GET  /api/auctions/live               - Live auctions (ending soon)
GET  /api/auctions/featured           - Featured auctions
GET  /api/auctions/:slug              - Get auction by slug
GET  /api/auctions/:id/similar        - Similar auctions
GET  /api/auctions/:id/seller-items   - More from seller
POST /api/auctions/batch              - Get multiple auctions
```

### User Routes

```
POST /api/auctions/:id/bid            - Place bid
GET  /api/auctions/my-bids            - User's bid history
GET  /api/auctions/watchlist          - User's watchlist
POST /api/auctions/:id/watch          - Add/remove from watchlist
GET  /api/auctions/won                - Won auctions
```

### Seller Routes

```
POST   /api/auctions                  - Create auction (own products)
PATCH  /api/auctions/:slug            - Update auction (own, before bids)
DELETE /api/auctions/:slug            - Cancel auction (own, without bids)
POST   /api/auctions/bulk             - Bulk operations (own auctions)
```

### Admin Routes

```
GET    /api/admin/auctions            - All auctions (any status)
PATCH  /api/admin/auctions/:slug      - Update any auction
DELETE /api/admin/auctions/:slug      - Cancel any auction
POST   /api/admin/auctions/:id/feature - Feature/unfeature auction
POST   /api/admin/auctions/bulk       - Bulk admin operations
GET    /api/admin/auctions/live       - Monitor live auctions
GET    /api/admin/auctions/moderation - Auction moderation queue
```

## Types

**Location**: `src/types/backend/auction.types.ts`, `src/types/frontend/auction.types.ts`

- `AuctionBE` - Backend auction type (Firestore document)
- `AuctionFE` - Frontend auction type (transformed for UI)
- `BidBE` - Bid type
- `BidFE` - Frontend bid type
- `AuctionStatus` - 'pending' | 'active' | 'ended' | 'cancelled'

## Components

- `src/components/auction/` - Auction components
- `src/app/auctions/` - Auction pages
- `src/app/seller/auctions/` - Seller auction management
- `src/app/admin/auctions/` - Admin auction management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
