# Auction Automation System

**Status:** ✅ Implemented  
**Files:**

- `/src/lib/auction-scheduler.ts` - Core scheduler logic
- `/src/lib/server-init.ts` - Server initialization
- `/instrumentation.ts` - Next.js instrumentation hook
- `/src/app/api/auctions/cron/route.ts` - Manual trigger endpoint

---

## Overview

Automated system for managing auction lifecycle:

1. **Scheduled Processing** - Runs every minute via node-cron
2. **Auction Closing** - Automatically closes ended auctions
3. **Winner Determination** - Finds highest bidder and checks reserve price
4. **Order Creation** - Creates order for auction winner
5. **Notifications** - Notifies winner, seller, and bidders
6. **Inventory Updates** - Reduces product stock if linked

---

## How It Works

### 1. Scheduled Task (Every Minute)

```typescript
cron.schedule("* * * * *", () => {
  processEndedAuctions();
});
```

The scheduler runs every minute and:

- Finds all `live` auctions where `end_time <= now`
- Processes each auction in parallel
- Logs all actions for monitoring

### 2. Auction Closing Logic

For each ended auction:

**Case A: No Bids**

```
Status: live → ended
Winner: null
Actions:
  ✓ Update auction status
  ✓ Notify seller (no bids received)
```

**Case B: Reserve Price Not Met**

```
Status: live → ended
Winner: null
Actions:
  ✓ Update auction status
  ✓ Notify seller (reserve not met, highest bid: ₹X)
  ✓ Notify highest bidder (reserve not met, but seller may contact)
```

**Case C: Winner!**

```
Status: live → ended
Winner: user_id
Final Bid: ₹X
Actions:
  ✓ Update auction (status, winner_id, final_bid)
  ✓ Create order for winner
  ✓ Add to won_auctions collection
  ✓ Notify winner (congratulations, payment instructions)
  ✓ Notify seller (order details, fulfill instructions)
  ✓ Update product inventory (if linked)
```

### 3. Order Creation

When a winner is determined:

```typescript
{
  order_id: "ORD-1699123456789-ABC123",
  user_id: "winner_user_id",
  shop_id: "auction_shop_id",
  items: [{
    type: "auction",
    auction_id: "auction_id",
    name: "Product Name",
    price: 50000,
    quantity: 1
  }],
  subtotal: 50000,
  discount: 0,
  shipping_fee: 0, // Free shipping for auctions
  tax: 9000, // 18% GST
  total: 59000,
  payment_method: "pending", // Winner needs to complete payment
  payment_status: "pending",
  order_status: "pending",
  source: "auction",
  created_at: "2024-11-08T10:30:00Z"
}
```

### 4. Won Auctions Collection

Tracks all won auctions for easy querying:

```typescript
{
  auction_id: "auction_id",
  user_id: "winner_user_id",
  shop_id: "shop_id",
  final_bid: 50000,
  name: "Product Name",
  slug: "product-slug",
  images: ["image1.jpg", "image2.jpg"],
  won_at: "2024-11-08T10:30:00Z",
  order_created: true
}
```

### 5. Inventory Update

If auction has linked `product_id`:

```typescript
product.stock = Math.max(0, product.stock - 1);
product.status = stock === 0 ? "out_of_stock" : product.status;
```

---

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install node-cron @types/node-cron
```

### 2. Enable Instrumentation

Already configured in `next.config.js`:

```javascript
experimental: {
  instrumentationHook: true;
}
```

### 3. Environment Variable (Optional)

To enable cron in development:

```env
ENABLE_CRON=true
```

By default:

- **Production:** Auto-enabled
- **Development:** Disabled (use manual trigger for testing)

### 4. Start Server

```bash
npm run dev   # Development
npm run build && npm start  # Production
```

Scheduler starts automatically and logs:

```
[Auction Scheduler] Started - checking auctions every minute
```

---

## Manual Trigger (Testing)

### Admin API Endpoint

**Trigger Processing:**

```bash
POST /api/auctions/cron
Authorization: Bearer <admin_token>
```

Response:

```json
{
  "success": true,
  "message": "Auction processing triggered",
  "timestamp": "2024-11-08T10:30:00Z"
}
```

**Check Status:**

```bash
GET /api/auctions/cron
Authorization: Bearer <admin_token>
```

Response:

```json
{
  "success": true,
  "status": "running",
  "schedule": "Every minute (* * * * *)",
  "message": "Auction scheduler is active"
}
```

### Direct Function Call (Testing)

```typescript
import { manualProcessAuctions } from "@/lib/auction-scheduler";

// In API route or script
await manualProcessAuctions();
```

---

## Notification System

### Current Implementation

Notifications are logged to console:

```typescript
console.log('[Notification] Winner: You won auction "iPhone 14" for ₹50,000');
console.log('[Notification] Seller: Auction "iPhone 14" sold for ₹50,000');
```

### Production Integration

Replace placeholder functions with real email/SMS:

```typescript
// Example: SendGrid integration
async function notifyWinner(auction, winnerId, finalBid) {
  const winner = await getUserById(winnerId);

  await sendEmail({
    to: winner.email,
    subject: `🎉 You Won: ${auction.name}`,
    template: "auction-winner",
    data: {
      userName: winner.name,
      auctionName: auction.name,
      finalBid: formatCurrency(finalBid),
      orderLink: `${process.env.BASE_URL}/user/orders`,
      paymentInstructions: "Complete payment within 48 hours...",
    },
  });

  // Optional: SMS via Twilio
  await sendSMS({
    to: winner.phone,
    message: `Congratulations! You won ${auction.name} for ₹${finalBid}. Complete payment at ${process.env.BASE_URL}/user/orders`,
  });
}
```

### Notification Functions to Implement

1. **notifyWinner()** - Winner email/SMS with payment instructions
2. **notifySeller()** - Seller email with order fulfillment details
3. **notifySellerNoWinner()** - No bids received, option to relist
4. **notifyReserveNotMet()** - Reserve not met, option to accept highest bid

---

## Monitoring & Logs

### Console Logs

All actions are logged with `[Auction Scheduler]` prefix:

```
[Auction Scheduler] Running scheduled task...
[Auction Scheduler] Found 3 auctions to process
[Auction Scheduler] Closing auction abc123
[Auction Scheduler] Auction abc123 won by user xyz789 for ₹50,000
[Auction Scheduler] Created order ORD-1699123456789-ABC123 for winner xyz789
[Auction Scheduler] Updated inventory for product def456: 4 remaining
```

### Error Handling

Errors are caught and logged without crashing:

```typescript
try {
  await closeAuction(auctionId);
} catch (error) {
  console.error("[Auction Scheduler] Error closing auction:", error);
  // Continue processing other auctions
}
```

### Production Monitoring

Consider integrating:

- **Sentry** - Error tracking
- **Datadog/New Relic** - Performance monitoring
- **CloudWatch Logs** - AWS log aggregation
- **Slack Webhooks** - Real-time alerts

---

## Database Schema

### Auctions Collection

```typescript
{
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  starting_bid: number;
  reserve_price?: number;
  current_bid: number;
  bid_count: number;
  start_time: Timestamp;
  end_time: Timestamp;
  winner_id?: string;      // Set by scheduler
  final_bid?: number;      // Set by scheduler
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled';
  is_featured: boolean;
  product_id?: string;     // Optional: link to product for inventory
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Bids Collection

```typescript
{
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  is_winning: boolean;
  created_at: Timestamp;
}
```

### Won Auctions Collection

```typescript
{
  id: string;
  auction_id: string;
  user_id: string;
  shop_id: string;
  final_bid: number;
  name: string;
  slug: string;
  images: string[];
  won_at: string;
  order_created: boolean;
}
```

---

## Firestore Indexes Required

```json
{
  "indexes": [
    {
      "collectionGroup": "auctions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "end_time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bids",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "auction_id", "order": "ASCENDING" },
        { "fieldPath": "amount", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Testing Checklist

### Unit Tests

- [ ] `processEndedAuctions()` - Finds correct auctions
- [ ] `closeAuction()` - Handles all cases (no bids, reserve not met, winner)
- [ ] `createWinnerOrder()` - Creates valid order
- [ ] `updateInventory()` - Reduces stock correctly

### Integration Tests

- [ ] Create test auction with end_time in past
- [ ] Trigger manual processing
- [ ] Verify auction status changed to `ended`
- [ ] Verify winner determined
- [ ] Verify order created
- [ ] Verify won_auctions entry created

### End-to-End Tests

- [ ] Create auction → Place bids → Wait for end time → Verify auto-close
- [ ] Reserve price scenarios
- [ ] No bids scenario
- [ ] Inventory updates

---

## Performance Considerations

### Current Implementation

- **Frequency:** Every minute
- **Batch Processing:** Processes all ended auctions in parallel
- **Error Isolation:** One failed auction doesn't affect others

### Optimization Opportunities

1. **Dynamic Scheduling**

   ```typescript
   // Only schedule when there are upcoming auctions
   const nextEndTime = await getNextAuctionEndTime();
   scheduleAt(nextEndTime);
   ```

2. **Batching**

   ```typescript
   // Process in batches to avoid memory issues
   const BATCH_SIZE = 50;
   for (let i = 0; i < docs.length; i += BATCH_SIZE) {
     const batch = docs.slice(i, i + BATCH_SIZE);
     await Promise.allSettled(batch.map(closeAuction));
   }
   ```

3. **Caching**
   ```typescript
   // Cache user/shop data to reduce Firestore reads
   const userCache = new Map();
   const shopCache = new Map();
   ```

---

## Future Enhancements

### Phase 1 (Current) ✅

- [x] Scheduled task (every minute)
- [x] Auction closing logic
- [x] Winner determination
- [x] Order creation
- [x] Inventory updates
- [x] Basic notifications (console logs)

### Phase 2 (Upcoming)

- [ ] Email notifications (SendGrid/AWS SES)
- [ ] SMS notifications (Twilio)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Bid history preservation
- [ ] Auction analytics

### Phase 3 (Advanced)

- [ ] Auto-relist unsold auctions
- [ ] Seller accept/reject highest bid (reserve not met)
- [ ] Auction extensions (last-minute bidding)
- [ ] Fraud detection
- [ ] Automated refunds (if winner doesn't pay)

---

## Troubleshooting

### Scheduler Not Running

**Problem:** No logs appearing  
**Solution:**

1. Check `next.config.js` has `instrumentationHook: true`
2. Restart dev server
3. Set `ENABLE_CRON=true` in `.env.local`

### Auctions Not Closing

**Problem:** Auctions past end_time still `live`  
**Solution:**

1. Check Firestore index exists (status + end_time)
2. Manually trigger: `POST /api/auctions/cron`
3. Check server logs for errors

### Orders Not Created

**Problem:** Auction closed but no order  
**Solution:**

1. Check winner has default address
2. Check Collections.orders() permission
3. Review error logs

---

## API Reference

### Scheduler Functions

```typescript
// Start scheduler (auto-called on server start)
startAuctionScheduler(): void

// Manual trigger (testing)
manualProcessAuctions(): Promise<void>

// Process ended auctions (internal)
processEndedAuctions(): Promise<void>
```

### Notification Functions (To Implement)

```typescript
notifyWinner(auction, winnerId, finalBid): Promise<void>
notifySeller(auction, winnerId, finalBid): Promise<void>
notifySellerNoWinner(auction): Promise<void>
notifyReserveNotMet(auction, highestBidderId, highestBid): Promise<void>
```

---

**Last Updated:** November 8, 2025  
**Status:** Production Ready (Notifications pending integration)
