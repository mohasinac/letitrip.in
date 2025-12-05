# API Implementation Roadmap

> **Last Updated**: December 6, 2025  
> **Status**: Phase 1 Complete, Phase 2 In Progress  
> **Total APIs**: 150+ endpoints

---

## 📋 Overview

Comprehensive API implementation tracking for JustForView.in platform, organized by Phase and resource type.

---

## 🎯 Implementation Phases

### Phase 1: Backend Infrastructure ✅ COMPLETE

**Goal**: Build core backend services with Firebase Functions

| API Category           | Status | Endpoints | Lines of Code |
| ---------------------- | ------ | --------- | ------------- |
| Payment Webhooks       | ✅     | 6         | 1,066         |
| Shipping Automation    | ✅     | 3         | 745           |
| WhatsApp Notifications | ✅     | 3         | 685           |
| Email System           | ✅     | 4         | 745           |
| **TOTAL**              | **✅** | **16**    | **3,241**     |

---

### Phase 2: Integration ⏳ IN PROGRESS

**Goal**: Connect backend services with frontend pages

---

## 📦 API Endpoints by Resource

### Payment APIs

#### Frontend-Triggered (src/app/api/payments/)

| Endpoint                           | Method | Status | Purpose                    |
| ---------------------------------- | ------ | ------ | -------------------------- |
| `/api/payments/razorpay/order`     | POST   | ✅     | Create Razorpay order      |
| `/api/payments/razorpay/verify`    | POST   | ✅     | Verify Razorpay signature  |
| `/api/payments/razorpay/capture`   | POST   | ✅     | Capture authorized payment |
| `/api/payments/razorpay/refund`    | POST   | ✅     | Initiate refund            |
| `/api/payments/paypal/order`       | POST   | ✅     | Create PayPal order        |
| `/api/payments/paypal/capture`     | POST   | ✅     | Capture PayPal payment     |
| `/api/payments/paypal/refund`      | POST   | ✅     | Initiate PayPal refund     |
| `/api/payments/available-gateways` | GET    | ✅     | Get enabled gateways       |

#### Firebase Functions (Webhooks)

| Function          | Trigger | Status | Purpose                 |
| ----------------- | ------- | ------ | ----------------------- |
| `razorpayWebhook` | HTTP    | ✅     | Razorpay payment events |
| `paypalWebhook`   | HTTP    | ✅     | PayPal payment events   |
| `stripeWebhook`   | HTTP    | ✅     | Stripe payment events   |
| `payuWebhook`     | HTTP    | ✅     | PayU payment events     |
| `phonepeWebhook`  | HTTP    | ✅     | PhonePe payment events  |
| `cashfreeWebhook` | HTTP    | ✅     | Cashfree payment events |

---

### Shipping APIs

#### Firebase Functions (Automation)

| Function                      | Trigger   | Status | Purpose                             |
| ----------------------------- | --------- | ------ | ----------------------------------- |
| `generateLabelOnConfirmation` | Firestore | ✅     | Auto-generate shipping labels       |
| `shiprocketWebhook`           | HTTP      | ✅     | Tracking updates from Shiprocket    |
| `autoSchedulePickups`         | Scheduled | ✅     | Daily pickup scheduling (10 AM IST) |

---

### WhatsApp APIs

#### Firebase Functions (Notifications)

| Function                | Trigger       | Status | Purpose                         |
| ----------------------- | ------------- | ------ | ------------------------------- |
| `sendOrderNotification` | Firestore     | ✅     | Order status notifications      |
| `sendBidNotification`   | Firestore     | ✅     | Bid notifications (new, outbid) |
| `sendBulkWhatsApp`      | HTTP Callable | ✅     | Campaign messaging              |

---

### Email APIs

#### Frontend-Triggered (src/app/api/email/)

| Endpoint               | Method | Status | Purpose                         |
| ---------------------- | ------ | ------ | ------------------------------- |
| `/api/email/send`      | POST   | ✅     | Send transactional email        |
| `/api/email/templates` | GET    | ✅     | List email templates            |
| `/api/email/templates` | POST   | ✅     | Create template                 |
| `/api/email/templates` | PUT    | ✅     | Update template                 |
| `/api/email/templates` | DELETE | ✅     | Delete template                 |
| `/api/email/inbox`     | GET    | ✅     | List inbox emails               |
| `/api/email/inbox`     | POST   | ✅     | Create inbox email (testing)    |
| `/api/email/inbox`     | PATCH  | ✅     | Mark read/unread                |
| `/api/email/inbox`     | DELETE | ✅     | Delete inbox email              |
| `/api/email/webhook`   | POST   | ✅     | Handle Resend/SendGrid webhooks |

#### Firebase Functions (Notifications)

| Function                     | Trigger   | Status | Purpose                          |
| ---------------------------- | --------- | ------ | -------------------------------- |
| `sendOrderConfirmationEmail` | Firestore | ✅     | Order confirmation emails        |
| `sendOrderShipped`           | Firestore | ✅     | Shipping notification emails     |
| `sendOrderDelivered`         | Firestore | ✅     | Delivery confirmation emails     |
| `sendPaymentReceived`        | Firestore | ✅     | Payment confirmation emails      |
| `sendAuctionWon`             | Firestore | ✅     | Auction won emails               |
| `sendAuctionOutbid`          | Firestore | ✅     | Outbid notification emails       |
| `sendAuctionEndingSoon`      | Firestore | ✅     | Auction ending reminder emails   |
| `sendWelcome`                | Firestore | ✅     | Welcome emails                   |
| `sendVerification`           | Firestore | ✅     | Email verification emails        |
| `sendPasswordReset`          | Firestore | ✅     | Password reset emails            |
| `sendWeeklyNewsletter`       | Scheduled | ✅     | Weekly newsletter (Monday 10 AM) |
| `sendMonthlyNewsletter`      | Scheduled | ✅     | Monthly newsletter (1st, 10 AM)  |
| `processEmailQueue`          | Scheduled | ✅     | Email queue processor            |

---

### Address APIs

#### Frontend-Triggered (src/app/api/address/)

| Endpoint                            | Method | Status | Purpose                |
| ----------------------------------- | ------ | ------ | ---------------------- |
| `/api/address/lookup`               | GET    | ✅     | Postal code lookup     |
| `/api/address/countries`            | GET    | ✅     | List countries         |
| `/api/address/states/[countryCode]` | GET    | ✅     | List states by country |
| `/api/address/validate`             | POST   | ✅     | Validate address       |
| `/api/address/autocomplete`         | GET    | ✅     | Address autocomplete   |

---

### Admin Settings APIs

#### Payment Gateway Management

| Endpoint                                      | Method | Status | Purpose                 |
| --------------------------------------------- | ------ | ------ | ----------------------- |
| `/api/admin/settings/payment-gateways`        | GET    | ✅     | List gateway configs    |
| `/api/admin/settings/payment-gateways`        | PUT    | ✅     | Update gateway config   |
| `/api/admin/settings/payment-gateways/toggle` | POST   | ✅     | Enable/disable gateway  |
| `/api/admin/settings/payment-gateways/config` | PUT    | ✅     | Update gateway settings |
| `/api/admin/settings/payment-gateways/test`   | POST   | ✅     | Test gateway connection |

#### Email Settings

| Endpoint                         | Method | Status | Purpose               |
| -------------------------------- | ------ | ------ | --------------------- |
| `/api/admin/settings/email`      | GET    | ✅     | Get email settings    |
| `/api/admin/settings/email`      | PUT    | ✅     | Update email settings |
| `/api/admin/settings/email/test` | POST   | ✅     | Test email provider   |

#### Email Management

| Endpoint                             | Method | Status | Purpose                 |
| ------------------------------------ | ------ | ------ | ----------------------- |
| `/api/admin/emails/logs`             | GET    | ✅     | Email logs with filters |
| `/api/admin/emails/logs?export=true` | GET    | ✅     | Export logs as CSV      |
| `/api/admin/emails/stats`            | GET    | ✅     | Email statistics        |

#### Address API Settings

| Endpoint                          | Method | Status | Purpose                   |
| --------------------------------- | ------ | ------ | ------------------------- |
| `/api/admin/settings/address-api` | GET    | ✅     | Get address API config    |
| `/api/admin/settings/address-api` | PUT    | ✅     | Update address API config |

---

### Product APIs

| Endpoint                     | Method | Status | Purpose                    |
| ---------------------------- | ------ | ------ | -------------------------- |
| `/api/products`              | GET    | ✅     | List products with filters |
| `/api/products/[slug]`       | GET    | ✅     | Get product by slug        |
| `/api/products`              | POST   | ✅     | Create product (seller)    |
| `/api/products/[slug]`       | PUT    | ✅     | Update product (seller)    |
| `/api/products/[slug]`       | DELETE | ✅     | Delete product (seller)    |
| `/api/products/[slug]/views` | POST   | ✅     | Track product view         |

---

### Auction APIs

| Endpoint                    | Method | Status | Purpose                    |
| --------------------------- | ------ | ------ | -------------------------- |
| `/api/auctions`             | GET    | ✅     | List auctions with filters |
| `/api/auctions/[slug]`      | GET    | ✅     | Get auction by slug        |
| `/api/auctions`             | POST   | ✅     | Create auction (seller)    |
| `/api/auctions/[slug]`      | PUT    | ✅     | Update auction (seller)    |
| `/api/auctions/[slug]`      | DELETE | ✅     | Delete auction (seller)    |
| `/api/auctions/[slug]/bids` | GET    | ✅     | List bids for auction      |
| `/api/auctions/[slug]/bids` | POST   | ✅     | Place bid (user)           |

---

### Shop APIs

| Endpoint                     | Method | Status | Purpose                 |
| ---------------------------- | ------ | ------ | ----------------------- |
| `/api/shops`                 | GET    | ✅     | List shops with filters |
| `/api/shops/[slug]`          | GET    | ✅     | Get shop by slug        |
| `/api/shops`                 | POST   | ✅     | Create shop (seller)    |
| `/api/shops/[slug]`          | PUT    | ✅     | Update shop (seller)    |
| `/api/shops/[slug]/settings` | GET    | ✅     | Get shop settings       |
| `/api/shops/[slug]/settings` | PUT    | ✅     | Update shop settings    |

---

### Order APIs

| Endpoint                       | Method | Status | Purpose                      |
| ------------------------------ | ------ | ------ | ---------------------------- |
| `/api/orders`                  | GET    | ✅     | List user orders             |
| `/api/orders/[orderId]`        | GET    | ✅     | Get order details            |
| `/api/orders`                  | POST   | ✅     | Create order (checkout)      |
| `/api/orders/[orderId]/status` | PUT    | ✅     | Update order status (seller) |
| `/api/orders/[orderId]/cancel` | POST   | ✅     | Cancel order (user)          |
| `/api/orders/[orderId]/track`  | GET    | ✅     | Track order shipment         |

---

### User APIs

| Endpoint                   | Method | Status | Purpose             |
| -------------------------- | ------ | ------ | ------------------- |
| `/api/user/profile`        | GET    | ✅     | Get user profile    |
| `/api/user/profile`        | PUT    | ✅     | Update profile      |
| `/api/user/addresses`      | GET    | ✅     | List user addresses |
| `/api/user/addresses`      | POST   | ✅     | Add address         |
| `/api/user/addresses/[id]` | PUT    | ✅     | Update address      |
| `/api/user/addresses/[id]` | DELETE | ✅     | Delete address      |

---

### Admin User Management APIs

| Endpoint                             | Method | Status | Purpose          |
| ------------------------------------ | ------ | ------ | ---------------- |
| `/api/admin/users`                   | GET    | ✅     | List all users   |
| `/api/admin/users/[userId]`          | GET    | ✅     | Get user details |
| `/api/admin/users/[userId]`          | PUT    | ✅     | Update user      |
| `/api/admin/users/[userId]/role`     | PUT    | ✅     | Update user role |
| `/api/admin/users/[userId]/suspend`  | POST   | ✅     | Suspend user     |
| `/api/admin/users/[userId]/activate` | POST   | ✅     | Activate user    |

---

## 🔧 Technical Patterns

### API Route Structure

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";

export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Authorization (if needed)
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Get query params
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");

    // 4. Database query
    const db = admin.firestore();
    const snapshot = await db
      .collection(COLLECTIONS.RESOURCE)
      .where("field", "==", filter)
      .get();

    // 5. Transform response
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 6. Return response
    return NextResponse.json({ data });
  } catch (error) {
    // 7. Error handling
    logError(error as Error, {
      component: "ResourceAPI.GET",
    });
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}
```

### Firebase Function Structure

```typescript
// functions/src/[category]/[function].ts
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

export const functionName = functions.firestore
  .document("collection/{docId}")
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Check condition
      if (before.status !== after.status) {
        // Perform action
        const db = admin.firestore();
        await db.collection("notifications").add({
          type: "status_change",
          resourceId: context.params.docId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      functions.logger.info("Function completed", {
        docId: context.params.docId,
      });
    } catch (error) {
      functions.logger.error("Function failed", error);
    }
  });
```

---

## 📊 Implementation Statistics

### By Phase

| Phase   | APIs Created | Lines of Code | Status         |
| ------- | ------------ | ------------- | -------------- |
| Phase 1 | 16           | 3,241         | ✅ Complete    |
| Phase 2 | TBD          | TBD           | ⏳ In Progress |
| Phase 3 | TBD          | TBD           | 📝 Planned     |

### By Type

| API Type            | Count | Average Size | Status |
| ------------------- | ----- | ------------ | ------ |
| REST APIs           | 50+   | 150 lines    | ✅     |
| Firebase Functions  | 17    | 190 lines    | ✅     |
| Webhook Handlers    | 6     | 178 lines    | ✅     |
| Scheduled Functions | 4     | 200 lines    | ✅     |

---

## 🚀 Next Steps

### Phase 2 Tasks (Integration)

1. **Checkout Integration**

   - Connect payment gateway selector
   - Integrate address lookup
   - Add order creation flow

2. **Order Management Integration**

   - Connect shipping automation
   - Integrate tracking updates
   - Add notification preferences

3. **Admin Dashboard Integration**

   - Connect email management
   - Integrate payment analytics
   - Add user management

4. **Notification Preferences**
   - WhatsApp opt-in UI
   - Email preferences UI
   - Push notification settings

---

## 📚 Related Documentation

- **Implementation Guide**: `/docs/IMPLEMENTATION-TASK-LIST.md`
- **Integration Guide**: `/docs/INTEGRATION-AND-ENHANCEMENTS-GUIDE.md`
- **Epic 039**: Backend Infrastructure
- **Epic 040**: Database Infrastructure
- **Resource Specs**: `/TDD/resources/*/API-SPECS.md`

---

## 📝 Notes

- All APIs follow REST conventions
- Firebase Functions use v1 API for consistency
- All secrets stored in environment variables
- Comprehensive error handling with logError
- Admin APIs require role-based access control
- All endpoints support mobile and dark mode (where applicable)
- Zero TypeScript errors in all implementations
