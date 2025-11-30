# Firebase Functions & Background Jobs

> **Status**: 🟡 Planned
> **Priority**: Medium
> **Last Updated**: November 30, 2025

## Current Firebase Functions

| Function                   | Trigger        | Schedule       | Purpose                                      |
| -------------------------- | -------------- | -------------- | -------------------------------------------- |
| `processAuctions`          | Pub/Sub Cron   | Every 1 minute | Close ended auctions, notify winners/sellers |
| `triggerAuctionProcessing` | HTTPS Callable | Manual (admin) | Manual trigger for auction processing        |

## Jobs Currently Done via API Routes (Should Move to Firebase Functions)

### High Priority - Status Change Triggers

| Current Implementation                    | Proposed Firebase Function | Trigger Type         | Benefits                                      |
| ----------------------------------------- | -------------------------- | -------------------- | --------------------------------------------- |
| Order status updates → notifications      | `onOrderStatusChange`      | Firestore `onUpdate` | Real-time notifications, decouple from API    |
| Payment status updates → order status     | `onPaymentStatusChange`    | Firestore `onUpdate` | Auto-confirm orders when payment succeeds     |
| Return status updates → refund processing | `onReturnStatusChange`     | Firestore `onUpdate` | Auto-process refunds, update inventory        |
| Ticket status updates → notifications     | `onTicketStatusChange`     | Firestore `onUpdate` | Notify users of ticket updates                |
| Shop verification → seller notifications  | `onShopVerificationChange` | Firestore `onUpdate` | Notify sellers when shop is verified/rejected |
| Product publish → category counts update  | `onProductStatusChange`    | Firestore `onUpdate` | Keep category product counts accurate         |
| Auction status → category auction counts  | `onAuctionStatusChange`    | Firestore `onUpdate` | Keep category auction counts accurate         |

### Medium Priority - Scheduled Jobs

| Current Implementation                         | Proposed Firebase Function   | Schedule          | Benefits                                    |
| ---------------------------------------------- | ---------------------------- | ----------------- | ------------------------------------------- |
| Rebuild category counts (manual admin trigger) | `rebuildCategoryCounts`      | Every 6 hours     | Ensure data consistency automatically       |
| Session cleanup (none currently)               | `cleanupExpiredSessions`     | Every hour        | Remove expired sessions, save storage costs |
| Cart cleanup (none currently)                  | `cleanupAbandonedCarts`      | Every 6 hours     | Clean up old abandoned carts                |
| Coupon expiry check (client-side only)         | `expireCoupons`              | Every hour        | Mark expired coupons as inactive            |
| Analytics aggregation (none currently)         | `aggregateAnalytics`         | Daily at midnight | Pre-compute analytics for dashboard         |
| Review moderation queue (manual)               | `processReviewQueue`         | Every 30 minutes  | Auto-moderate reviews, notify admins        |
| Low stock alerts (none currently)              | `checkLowStockAlerts`        | Every 2 hours     | Notify sellers of low stock products        |
| Auction reminders (none currently)             | `sendAuctionReminders`       | Every 15 minutes  | Notify watchers when auction ending soon    |
| Winner payment reminder (none currently)       | `sendWinnerPaymentReminders` | Every 2 hours     | Remind auction winners to pay               |

### Low Priority - Event-Driven Jobs

| Current Implementation                 | Proposed Firebase Function | Trigger Type         | Benefits                       |
| -------------------------------------- | -------------------------- | -------------------- | ------------------------------ |
| New bid → outbid notifications         | `onNewBid`                 | Firestore `onCreate` | Real-time outbid notifications |
| New review → shop rating recalculation | `onNewReview`              | Firestore `onCreate` | Keep shop ratings updated      |
| New order → inventory update           | `onNewOrder`               | Firestore `onCreate` | Decrement stock counts         |
| User registration → welcome email      | `onUserCreate`             | Firestore `onCreate` | Automated welcome flow         |
| Shop creation → admin notification     | `onShopCreate`             | Firestore `onCreate` | Alert admins for verification  |
| Media upload → thumbnail generation    | `onMediaUpload`            | Storage `onFinalize` | Auto-generate thumbnails       |
| Order delivery → review request        | `onOrderDelivered`         | Firestore `onUpdate` | Request reviews after delivery |

## Implementation Examples

### Status Change Trigger

```typescript
// functions/src/triggers/orderStatus.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const onOrderStatusChange = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Skip if status hasn't changed
    if (before.status === after.status) return;

    const db = admin.firestore();
    const { orderId } = context.params;

    // Status-specific logic
    switch (after.status) {
      case "confirmed":
        await sendOrderConfirmationEmail(after);
        break;
      case "shipped":
        await sendShippingNotification(after);
        break;
      case "delivered":
        await sendDeliveryConfirmation(after);
        await scheduleReviewRequest(orderId);
        break;
      case "cancelled":
        await handleOrderCancellation(after);
        break;
    }

    // Create notification
    await db.collection("notifications").add({
      userId: after.userId,
      type: "order_status",
      title: `Order ${after.orderNumber} ${after.status}`,
      message: getStatusMessage(after.status),
      orderId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
  });
```

### Scheduled Job

```typescript
// functions/src/scheduled/cleanupAbandonedCarts.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const cleanupAbandonedCarts = functions.pubsub
  .schedule("every 6 hours")
  .onRun(async () => {
    const db = admin.firestore();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days old

    const snapshot = await db
      .collection("carts")
      .where("updatedAt", "<", cutoffDate)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${snapshot.size} abandoned carts`);
  });
```

## Implementation Checklist

### Phase 1: Critical Triggers

- [ ] Implement `onOrderStatusChange`
- [ ] Implement `onPaymentStatusChange`
- [ ] Implement `onReturnStatusChange`

### Phase 2: Scheduled Jobs

- [ ] Implement `rebuildCategoryCounts` (every 6 hours)
- [ ] Implement `cleanupExpiredSessions` (every hour)
- [ ] Implement `cleanupAbandonedCarts` (every 6 hours)
- [ ] Implement `expireCoupons` (every hour)

### Phase 3: Event Triggers

- [ ] Implement `onNewBid`
- [ ] Implement `onNewReview`
- [ ] Implement `onNewOrder`

### Phase 4: Notification Jobs

- [ ] Implement `sendAuctionReminders`
- [ ] Implement `sendWinnerPaymentReminders`
- [ ] Implement `checkLowStockAlerts`

## Deployment Notes

```bash
# Deploy all functions
cd functions
npm run deploy

# Deploy specific function
firebase deploy --only functions:onOrderStatusChange

# View logs
firebase functions:log --only onOrderStatusChange
```

## Testing Functions Locally

```bash
# Start emulator
firebase emulators:start --only functions,firestore

# Trigger function manually via shell
firebase functions:shell
> onOrderStatusChange({before: {...}, after: {...}})
```
