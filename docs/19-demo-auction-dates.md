# Doc 19: Demo Auction Date Fixes

> **Status**: ✅ Complete
> **Priority**: ✅ Complete
> **Last Updated**: December 2025

## Problem

Demo auctions were being generated with random dates - 30% ended (past dates) and 70% live (random future dates up to 14 days). This caused:

- Ended auctions showing "Place Bid" buttons
- Inconsistent demo data that didn't showcase live auction functionality
- Auction end dates too far in the future (up to 14 days)

## Solution

Updated `/src/app/api/admin/demo/generate/auctions/route.ts` to:

1. All demo auctions are now **LIVE** (no ended auctions)
2. Start dates are 0-2 days in the past
3. End dates are **3-7 days in the future** from current date
4. All auctions have "active" status

## Changes Made

### File: `src/app/api/admin/demo/generate/auctions/route.ts`

**Before:**

```typescript
// Create varied end times: 30% ended, 70% live
const isEnded = Math.random() < 0.3;
const startDate = new Date();
const endDate = new Date();

if (isEnded) {
  // Ended 1-7 days ago
  startDate.setDate(startDate.getDate() - 14 - Math.floor(Math.random() * 7));
  endDate.setDate(endDate.getDate() - 1 - Math.floor(Math.random() * 7));
} else {
  // Ends in 1-14 days
  startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 3));
  endDate.setDate(endDate.getDate() + 1 + Math.floor(Math.random() * 14));
}
```

**After:**

```typescript
// All auctions are LIVE with end dates 3-7 days in the future
// Auctions can run max 7 days and demo should show active auctions
const now = Date.now();
const startDate = new Date(
  now - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000
); // Started 0-2 days ago
const daysUntilEnd = 3 + Math.floor(Math.random() * 5); // 3-7 days from now
const endDate = new Date(now + daysUntilEnd * 24 * 60 * 60 * 1000);
```

### Bid Calculation (simplified)

```typescript
// Before
const currentBid = isEnded
  ? startingBid * (1.2 + Math.random() * 0.8)
  : startingBid * (1 + Math.random() * 0.5);

// After
const currentBid = startingBid * (1 + Math.random() * 0.5); // Live auctions with some bids
```

### Status and Bid Count

```typescript
// Before
const status = isEnded ? "ended" : "active";
const totalBids = isEnded
  ? 5 + Math.floor(Math.random() * 20)
  : Math.floor(Math.random() * 10);

// After
const status = "active"; // All demo auctions are live
const totalBids = 1 + Math.floor(Math.random() * 15); // 1-15 bids on live auctions
```

## Result

- All demo auctions are now live with realistic end dates
- Auction cards properly show bid buttons for active auctions
- Demo data better showcases the auction functionality
