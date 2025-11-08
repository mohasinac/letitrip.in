# Auction System Quick Reference

**Last Updated:** November 8, 2025

## 🎯 Overview

Phase 4 Auction System is 60% complete with all core UI and basic bidding functionality implemented. Real-time features and automation are pending.

---

## 📁 File Structure

```
src/
├── app/
│   ├── seller/auctions/
│   │   ├── page.tsx                    # List auctions (grid view)
│   │   ├── create/page.tsx             # Create auction
│   │   └── [id]/edit/page.tsx          # Edit auction
│   └── auctions/
│       ├── page.tsx                    # Browse auctions (public)
│       └── [slug]/page.tsx             # Auction detail (public)
├── components/seller/
│   └── AuctionForm.tsx                 # Reusable auction form
└── services/
    └── auctions.service.ts             # API integration (already exists)
```

---

## 🔌 API Endpoints

### Seller/Admin

- `GET /api/auctions?shop_id={id}` - List shop auctions
- `POST /api/auctions` - Create auction (5 limit per shop)
- `GET /api/auctions/[id]` - Get auction
- `PATCH /api/auctions/[id]` - Update auction
- `DELETE /api/auctions/[id]` - Delete auction
- `POST /api/auctions/[id]/feature` - Feature/unfeature (admin)

### Public/User

- `GET /api/auctions?status=live` - List live auctions
- `GET /api/auctions/[id]` - View auction
- `POST /api/auctions/[id]/bid` - Place bid
- `GET /api/auctions/[id]/bid` - Get bid history
- `POST /api/auctions/[id]/watch` - Toggle watch
- `GET /api/auctions/watchlist` - User's watchlist
- `GET /api/auctions/my-bids` - User's bids
- `GET /api/auctions/won` - User's won auctions

---

## 🧩 Components Usage

### AuctionForm

```tsx
import AuctionForm from "@/components/seller/AuctionForm";

// Create Mode
<AuctionForm
  mode="create"
  shopId="shop123"
  onSubmit={(data) => handleCreate(data)}
  isSubmitting={loading}
/>

// Edit Mode
<AuctionForm
  mode="edit"
  initialData={auction}
  onSubmit={(data) => handleUpdate(data)}
  isSubmitting={loading}
/>
```

**Props:**

- `mode`: "create" | "edit"
- `initialData?`: Partial<Auction>
- `shopId?`: string (for create mode)
- `onSubmit`: (data: Partial<Auction>) => void
- `isSubmitting?`: boolean

**Fields:**

- Basic Info: name, slug, description
- Bidding: startingBid, reservePrice
- Timing: startTime, endTime
- Media: images (array of URLs), videos (array of URLs)
- Status: draft, scheduled, live, ended, cancelled

---

## 📄 Page Routes

### Seller Routes

- `/seller/auctions` - List auctions
- `/seller/auctions?status=live` - Filter by status
- `/seller/auctions/create` - Create new auction
- `/seller/auctions/{id}/edit` - Edit auction

### Public Routes

- `/auctions` - Browse live auctions
- `/auctions?status=scheduled` - Upcoming auctions
- `/auctions?featured=true` - Featured auctions
- `/auctions/{slug}` - Auction detail page

### User Routes (Pending)

- `/user/watchlist` - User's watched auctions
- `/user/bids` - User's bids
- `/user/won-auctions` - User's won auctions

---

## 🎨 UI Components

### Auction Card (Browse Page)

```tsx
<Link href={`/auctions/${auction.slug}`}>
  <div className="auction-card">
    <img src={auction.images[0]} />
    <h3>{auction.name}</h3>
    <p>Current Bid: ₹{auction.currentBid}</p>
    <p>Bids: {auction.bidCount}</p>
    <p>Time Left: {timeRemaining}</p>
    <button>Place Bid</button>
  </div>
</Link>
```

### Bidding Panel (Detail Page)

```tsx
<div className="bidding-panel">
  <h1>{auction.name}</h1>
  <div className="status-badge">Live</div>
  <p>Current Bid: ₹{auction.currentBid}</p>
  <p>Time Remaining: {timeRemaining}</p>
  <input type="number" value={bidAmount} />
  <button onClick={handlePlaceBid}>Place Bid</button>
  <button onClick={handleWatch}>Watch</button>
  <button onClick={handleShare}>Share</button>
</div>
```

---

## 🔒 Auth & Permissions

### Seller/Admin

- ✅ Create auction (5 per shop limit)
- ✅ Edit auction (own auctions only)
- ✅ Delete auction (own auctions only)
- ✅ View own auctions
- ✅ Admin: unlimited auctions, feature auctions

### User

- ✅ View live auctions
- ✅ Place bids (must be authenticated)
- ✅ Watch auctions
- ✅ View bid history
- ❌ Cannot bid on own auctions (API validation)

### Guest

- ✅ Browse auctions
- ✅ View details
- ❌ Cannot bid (redirect to login)
- ❌ Cannot watch

---

## 📊 Status Flow

```
draft → scheduled → live → ended
              ↓
          cancelled
```

**Status Transitions:**

- `draft`: Not visible to public, can edit freely
- `scheduled`: Visible, starts automatically at startTime
- `live`: Accepting bids
- `ended`: No more bids, winner determined
- `cancelled`: Auction cancelled, no winner

---

## ⚡ Features Implemented

### ✅ Core Features

- Create/edit/delete auctions
- Place bids with validation
- Watch/unwatch auctions
- Share functionality (Web Share API + clipboard)
- Bid history display
- Countdown timer (client-side)
- Reserve price indicator
- Image gallery
- Status badges and filters
- Auth guards
- Slug generation and validation

### ⏳ Pending Features

- Real-time bid updates (WebSocket)
- Synchronized countdown timer
- Auto-bid system
- Auction end automation
- Winner notifications
- Buy now functionality
- Advanced filters

---

## 🛠️ Development Tips

### Testing Auction Flow

1. Create auction as seller
2. Set status to "live"
3. Browse as guest/user
4. Place bid (must login)
5. Check bid history
6. Watch auction

### Debugging

```typescript
// Check auction status
console.log("Auction:", auction);
console.log("Status:", auction.status);
console.log("Current bid:", auction.currentBid);
console.log("Bids:", bids);

// Check API response
const response = await auctionsService.list({ status: "live" });
console.log("Auctions:", response.data);
```

### Common Issues

- **Slug already exists**: Check uniqueness validation
- **Bid too low**: Must be > currentBid
- **Not authenticated**: Redirect to /login
- **5 auction limit**: Only for sellers, admins unlimited
- **Time validation**: endTime must be > startTime

---

## 📦 Dependencies

```json
{
  "date-fns": "^3.0.0" // For time formatting
}
```

---

## 🔜 Next Steps

### Phase 4.2: Real-Time Bidding (HIGH PRIORITY)

1. Install Socket.io

```bash
npm install socket.io socket.io-client
```

2. Create WebSocket server

```typescript
// /src/lib/websocket/server.ts
```

3. Create client hook

```typescript
// /src/hooks/useAuctionSocket.ts
```

4. Update auction detail page with real-time

### Phase 4.3: Automation (HIGH PRIORITY)

1. Install node-cron

```bash
npm install node-cron @types/node-cron
```

2. Create cron service

```typescript
// /src/lib/cron/auction-closer.ts
```

3. Create API endpoint

```typescript
// /src/app/api/cron/close-auctions/route.ts
```

---

## 📚 Related Documentation

- [API Documentation](../docs/API.md)
- [Type Definitions](../src/types/index.ts)
- [Service Layer](../src/services/auctions.service.ts)
- [Transaction Helpers](../src/app/api/lib/firebase/transactions.ts)
- [Phase 4 Completion Summary](./PHASE_4_AUCTION_PARTIAL_COMPLETION.md)

---

**Status:** ✅ 60% Complete (Core features implemented, real-time pending)
