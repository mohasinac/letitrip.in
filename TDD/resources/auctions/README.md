# Auctions Resource

## Overview

Real-time auction system with bidding and watchlist.

## Related Epic

- [E003: Auction System](../../epics/E003-auction-system.md)

## Database Collections

- `auctions` - Auction documents
- `bids` - Bid documents
- `auction_watchlist` - Watchlist
- `won_auctions` - Won auctions

## Firebase Realtime Database

```
auctions/
  {auctionId}/
    status/
    bids/
```

## API Routes

```
/api/auctions              - GET/POST  - List/Create
/api/auctions/:slug        - GET/PATCH - Get/Update
/api/auctions/:id/bids     - GET/POST  - Bid operations
/api/auctions/bulk         - POST      - Bulk operations
/api/auctions/my-bids      - GET       - User's bids
/api/auctions/watchlist    - GET/POST  - Watchlist
/api/auctions/won          - GET       - Won auctions
/api/auctions/featured     - GET       - Featured
/api/auctions/live         - GET       - Live auctions
```

## Types

- `AuctionBE` - Backend auction type
- `AuctionFE` - Frontend auction type
- `BidBE` - Bid type

## Service

- `auctionService` - Auction operations

## Components

- `src/components/auction/` - Auction components
- `src/app/auctions/` - Auction pages
- `src/app/seller/auctions/` - Seller auction management
- `src/app/admin/auctions/` - Admin auction management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
