# Auction Card Components - Quick Reference

## Overview

Added 3 new auction display components to match product cards, completing Phase 2.3.

## Components Created

### 1. AuctionCard.tsx (329 lines)

**Purpose:** Display auction information in card format for listings

**Props:**

- `auction`: Auction data (id, name, slug, images, currentBid, startingBid, bidCount, endTime, condition, shop, viewCount)
- `onWatch`: Callback for watchlist toggle
- `isWatched`: Whether auction is in user's watchlist
- `showShopInfo`: Show/hide shop information
- `priority`: Next.js Image priority prop

**Features:**

- Image display with fallback (Gavel icon)
- Badges: Featured, Condition, Ended, Ending Soon (animated)
- Heart icon for watchlist
- View count badge
- Shop info with verified badge
- Current bid with bid count
- Countdown timer with color coding (red for ending soon)
- "Place Bid" button (disabled when ended)
- Hover effects and transitions
- Responsive design

**Styling:**

- Ending soon: Red text with pulse animation (< 24 hours)
- Ended: Gray text and disabled state
- Active: Blue hover effects
- eBay-style card layout

### 2. AuctionCardSkeleton.tsx (28 lines)

**Purpose:** Loading skeleton for AuctionCard

**Features:**

- Matches AuctionCard structure
- Pulse animation
- Gray placeholder blocks for all elements
- Aspect-ratio maintained

### 3. AuctionQuickView.tsx (447 lines)

**Purpose:** Quick view modal for auctions with bid placement

**Props:**

- `auction`: Complete auction data with specifications
- `isOpen`: Modal open state
- `onClose`: Close callback
- `onPlaceBid`: Bid placement callback (auctionId, bidAmount, isAutoBid, maxAutoBid?)
- `onWatch`: Watchlist callback
- `isWatched`: Watchlist state

**Features:**

- Image gallery with navigation arrows
- Thumbnail strip for multiple images
- Shop information with verified badge
- Condition badge
- Current bid display with bid count
- Countdown timer
- Bid placement form:
  - Bid amount input with validation
  - "Min Bid" quick-fill button
  - Auto-bid checkbox and max amount
  - Error messages
  - Loading state
- Watchlist button
- Description preview (4 lines)
- Specifications display (first 5)
- "View Full Details" link
- Responsive 2-column layout (mobile stacks)

**Validation:**

- Minimum bid enforcement
- Auto-bid max > bid amount
- Real-time error feedback
- Disabled when auction ended

**Design:**

- Full-screen modal overlay
- Max-width 4xl (896px)
- Max-height 90vh with scroll
- Blue accent colors
- Professional form styling

## Integration Points

### Phase 6.9 - Auction Pages

```tsx
// /src/app/auctions/page.tsx
import AuctionCard from "@/components/cards/AuctionCard";
import AuctionCardSkeleton from "@/components/cards/AuctionCardSkeleton";
import AuctionQuickView from "@/components/cards/AuctionQuickView";

// Use in listings
{
  auctions.map((auction) => <AuctionCard key={auction.id} auction={auction} />);
}

// Use skeletons during loading
{
  loading &&
    Array.from({ length: 8 }).map((_, i) => <AuctionCardSkeleton key={i} />);
}

// Quick view modal
<AuctionQuickView
  auction={selectedAuction}
  isOpen={isQuickViewOpen}
  onClose={() => setIsQuickViewOpen(false)}
  onPlaceBid={handlePlaceBid}
/>;
```

### Phase 6.10 - User Bidding & Watchlist

```tsx
// Watchlist management
const handleWatch = async (auctionId: string) => {
  await toggleWatchlist(auctionId);
  // Refresh watchlist state
};

<AuctionCard
  auction={auction}
  onWatch={handleWatch}
  isWatched={watchlist.includes(auction.id)}
/>;
```

### Homepage / Featured Auctions

```tsx
// Featured auctions section
<section>
  <h2>Featured Auctions</h2>
  <CardGrid>
    {featuredAuctions.map((auction) => (
      <AuctionCard key={auction.id} auction={auction} priority />
    ))}
  </CardGrid>
</section>
```

## Dependencies

- `formatCurrency` from `@/lib/formatters`
- `formatTimeRemaining` from `@/lib/formatters`
- `getTimeRemaining` from `@/lib/validation/auction`
- `getNextMinimumBid` from `@/lib/validation/auction`
- Next.js Image component
- Lucide React icons

## Statistics

- **Total Lines:** ~800 lines
- **Components:** 3 (card, skeleton, quick view)
- **TypeScript:** Fully typed with interfaces
- **Errors:** 0 compilation errors

## Key Features

### Countdown Timer

- Real-time time remaining display
- Color coding: Red for ending soon, gray for ended
- Animated "ENDING SOON" badge when < 24 hours

### Bid Placement

- Minimum bid enforcement
- Auto-bid support with max amount
- Real-time validation
- Quick "Min Bid" button
- Error feedback

### Watchlist Integration

- Heart icon toggle
- Visual feedback (filled red when watched)
- Persistent across sessions (via API)

### Shop Verification

- Verified badge display
- Shop logo and name
- Clickable shop link (in full view)

### Image Gallery

- Multiple images with navigation
- Thumbnail strip
- Image counter
- Responsive aspect ratio

## Comparison with ProductCard

| Feature           | ProductCard                | AuctionCard                             |
| ----------------- | -------------------------- | --------------------------------------- |
| Price Display     | Fixed price + discount     | Current bid + bid count                 |
| Time Element      | -                          | Countdown timer                         |
| Action Button     | "Add to Cart"              | "Place Bid"                             |
| Quick View        | Product details            | Bid placement form                      |
| Favorites         | Heart icon                 | Watch icon (heart)                      |
| Status Badges     | Stock, Condition, Discount | Condition, Featured, Ending Soon, Ended |
| Shop Info         | Optional                   | Always shown                            |
| Urgency Indicator | Low stock                  | Time remaining < 24h                    |

## Next Steps for Phase 3+

### Phase 3.7 - Seller Auction Management

- Use AuctionCard in seller's auction list
- Show additional stats (impressions, watchers)
- Add edit/delete actions to card

### Phase 5.7 - Admin Auction Management

- Use in admin auction list
- Show moderation status
- Add approve/reject/feature actions

### Phase 6.9 - Public Auction Pages

- Use in all auction listings
- Implement real-time bid updates (WebSocket)
- Add filters and sorting

### Phase 6.10 - User Bidding

- Show user's current bid on cards
- Highlight auctions user is winning
- Show watchlist status

## Testing Checklist

- [ ] Displays correctly with all data
- [ ] Handles missing images gracefully
- [ ] Countdown timer updates in real-time
- [ ] Ending soon badge shows at correct time
- [ ] Ended state disables bidding
- [ ] Watchlist toggle works
- [ ] Quick view modal opens/closes
- [ ] Bid validation works correctly
- [ ] Auto-bid form shows/hides
- [ ] Minimum bid button works
- [ ] Error messages display properly
- [ ] Responsive on mobile
- [ ] Image gallery navigation works
- [ ] Skeleton matches card structure
- [ ] Links to correct auction page

## Phase 2.3 Status

✅ **COMPLETE** - All public display cards done

- Product cards (3 components)
- Shop cards (2 components)
- Category cards (2 components)
- Auction cards (3 components) ← **NEW**
- Card grid wrapper
- **Total:** 11 components, ~2,500 lines

---

**Ready for Phase 2.6:** Upload Context & State Management
