# Firebase Functions & Background Jobs

> **Status**: ✅ Complete
> **Priority**: Medium
> **Last Updated**: January 2025

## Current Firebase Functions

All functions are implemented in `functions/src/index.ts`:

### Scheduled Functions

| Function                 | Schedule         | Purpose                                      |
| ------------------------ | ---------------- | -------------------------------------------- |
| `processAuctions`        | Every 1 minute   | Close ended auctions, notify winners/sellers |
| `rebuildCategoryTree`    | Every 60 minutes | Rebuild category tree cache                  |
| `cleanupExpiredSessions` | Every 60 minutes | Remove expired sessions                      |
| `cleanupAbandonedCarts`  | Every 6 hours    | Clean up carts older than 30 days            |
| `expireCoupons`          | Every 60 minutes | Mark expired coupons as inactive             |

### Firestore Trigger Functions

| Function                | Trigger              | Purpose                                    |
| ----------------------- | -------------------- | ------------------------------------------ |
| `onOrderStatusChange`   | orders/{orderId}     | Send notifications on status change        |
| `onPaymentStatusChange` | payments/{paymentId} | Auto-confirm orders when payment succeeds  |
| `onReturnStatusChange`  | returns/{returnId}   | Handle return notifications and inventory  |
| `onTicketStatusChange`  | support_tickets/{id} | Notify users of ticket updates             |
| `onCategoryWrite`       | categories/{id}      | Rebuild tree when categories change        |
| `onNewBid`              | bids/{bidId}         | Outbid notifications, update auction stats |
| `onNewReview`           | reviews/{reviewId}   | Update shop/product ratings                |

### HTTP Callable Functions

| Function                     | Purpose                                       |
| ---------------------------- | --------------------------------------------- |
| `triggerAuctionProcessing`   | Manual trigger for auction processing (admin) |
| `triggerCategoryTreeRebuild` | Manual trigger for category tree rebuild      |

## Jobs Completed (Previously Planned)

### High Priority - Status Change Triggers ✅

| Proposed Function       | Status | Implementation                             |
| ----------------------- | ------ | ------------------------------------------ |
| `onOrderStatusChange`   | ✅     | Sends notifications, notifies sellers      |
| `onPaymentStatusChange` | ✅     | Auto-confirms orders on successful payment |
| `onReturnStatusChange`  | ✅     | Notifications + inventory restoration      |
| `onTicketStatusChange`  | ✅     | User notifications for ticket updates      |

### Medium Priority - Scheduled Jobs ✅

| Proposed Function        | Status | Schedule         |
| ------------------------ | ------ | ---------------- |
| `rebuildCategoryTree`    | ✅     | Every 60 minutes |
| `cleanupExpiredSessions` | ✅     | Every 60 minutes |
| `cleanupAbandonedCarts`  | ✅     | Every 6 hours    |
| `expireCoupons`          | ✅     | Every 60 minutes |

### Low Priority - Event-Driven Jobs ✅

| Proposed Function | Status | Trigger                                   |
| ----------------- | ------ | ----------------------------------------- |
| `onNewBid`        | ✅     | Firestore onCreate - outbid notifications |
| `onNewReview`     | ✅     | Firestore onCreate - rating recalculation |

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
