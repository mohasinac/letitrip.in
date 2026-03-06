# LetItRip Payment Architecture

> Comprehensive guide to the Razorpay payment integration, RTDB real-time outcome bridge, webhook handling, and alternative flows (COD).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Variables](#2-environment-variables)
3. [Complete Payment Flow](#3-complete-payment-flow)
4. [API Endpoints](#4-api-endpoints)
   - [POST /api/payment/create-order](#post-apipaymentcreate-order)
   - [POST /api/payment/verify](#post-apipaymentverify)
   - [POST /api/payment/event/init](#post-apipaymenteventinit)
   - [POST /api/payment/webhook](#post-apipaymentwebhook)
5. [Client Library — `src/lib/payment/razorpay.ts`](#5-client-library)
6. [Hooks Reference](#6-hooks-reference)
   - [useRazorpay](#userazorpay)
   - [usePaymentEvent](#usepaymentevent)
   - [useCheckout](#usecheckout)
7. [Service Layer](#7-service-layer)
8. [RTDB Payment Bridge](#8-rtdb-payment-bridge)
9. [Webhook Setup](#9-webhook-setup)
10. [Alternative Payment Flows](#10-alternative-payment-flows)
11. [Firebase Function — Cleanup](#11-firebase-function--cleanup)
12. [Error Handling](#12-error-handling)
13. [Testing](#13-testing)
14. [File Map](#14-file-map)

---

## 1. Overview

LetItRip uses **Razorpay** as its primary payment gateway (India-specific, UPI + cards + netbanking). The integration is structured in three layers:

| Layer                       | Responsibility                                                       |
| --------------------------- | -------------------------------------------------------------------- |
| **API Routes**              | Server-side order creation, signature verification, order fulfilment |
| **Razorpay Checkout Modal** | Client-side payment UI provided by Razorpay's `checkout.js`          |
| **RTDB Payment Bridge**     | Real-time notification to the client after payment succeeds / fails  |

The client never touches Razorpay's API directly — all credential-bearing operations happen server-side. The UI learns the outcome within seconds through a Firebase Realtime Database node that the server signals after verification.

### Currency Model

All amounts sent to Razorpay are in **paise** (smallest INR unit — 1 rupee = 100 paise). The helper functions `rupeesToPaise` / `paiseToRupees` handle conversion. The `create-order` endpoint accepts rupees from the client and converts internally.

---

## 2. Environment Variables

### Server-Side (never exposed to the browser)

| Variable                  | Purpose                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| `RAZORPAY_KEY_ID`         | Razorpay API key ID — used for server-side order creation                    |
| `RAZORPAY_KEY_SECRET`     | Razorpay API key secret — used for signature verification                    |
| `RAZORPAY_WEBHOOK_SECRET` | Shared secret set in Razorpay Dashboard — used for webhook HMAC verification |

### Client-Side (safe to expose)

| Variable                      | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same value as `RAZORPAY_KEY_ID` — passed to the Razorpay checkout modal |

> **Note:** The `create-order` API returns `keyId` in its response body, so the checkout hook can avoid reading `NEXT_PUBLIC_RAZORPAY_KEY_ID` directly in components.

---

## 3. Complete Payment Flow

```
Client                      Next.js API            Razorpay           Firebase RTDB
  │                              │                     │                     │
  │── 1. POST /payment/event/init ──────────────────>  │                     │
  │    { razorpayOrderId? }       │                     │                     │
  │   (called before modal opens) │ create pending node │                     │
  │                              │─── write /payment_events/{id} ──────────>│
  │<── { eventId, customToken } ──│                     │                     │
  │                              │                     │                     │
  │── subscribe /payment_events/{id} (RTDB, read-only) ─────────────────────>│
  │                                                                          │
  │── 2. POST /payment/create-order ────────────────>  │                     │
  │    { amount (rupees), receipt }                     │                     │
  │                              │── createRazorpayOrder(paise) ──────────>  │
  │                              │<── { id, amount, currency } ─────────     │
  │<── { razorpayOrderId, amount (paise), currency, keyId } ─────────────────│
  │                              │                     │                     │
  │── 3. Open Razorpay modal (checkout.js) ──────────────────────────────>   │
  │    useRazorpay({ key, amount, order_id, ... })      │                     │
  │                              │                     │                     │
  │ User completes payment ───────────────────────────>│                     │
  │<── { razorpay_payment_id, razorpay_order_id, razorpay_signature } ──────  │
  │                              │                     │                     │
  │── 4. POST /payment/verify ──────────────────────>  │                     │
  │    { razorpay_order_id, razorpay_payment_id,        │                     │
  │      razorpay_signature, addressId }                │                     │
  │                              │── verifyPaymentSignature (HMAC) ──────>   │
  │                              │── create orders in Firestore              │
  │                              │── deduct stock (batch)                    │
  │                              │── clear cart                              │
  │                              │── send confirmation emails                │
  │                              │─── update /payment_events/{id} status: success ──>│
  │<── { orderIds, total, itemCount } ─────────────────│                     │
  │                              │                     │                     │
  │── 5. RTDB fires onChange ─────────────────────────────────────────────>│
  │    status: "success", orderIds                                           │
  │                              │                     │                     │
  │<── usePaymentEvent.status === "success" ──────────────────────────────── │
  │    navigate to /order-confirmation                  │                     │
  │                              │                     │                     │
  │    --- WEBHOOK (server → server, parallel path) --- │                     │
  │                              │<── POST /payment/webhook (Razorpay)─────  │
  │                              │── verifyWebhookSignature (HMAC)           │
  │                              │── update /payment_events/{id} ──────────>│
  │                              │   (fallback — verify may have already done│
  │                              │    this, update is idempotent)            │
```

### Step Summary

| Step | Who      | Action                                                                               |
| ---- | -------- | ------------------------------------------------------------------------------------ |
| 1    | Client   | `POST /api/payment/event/init` — creates RTDB node, gets custom token                |
| 2    | Client   | `POST /api/payment/create-order` — creates Razorpay order server-side                |
| 3    | Client   | Opens Razorpay modal (`useRazorpay`) — user pays                                     |
| 4    | Client   | `POST /api/payment/verify` — verifies signature, fulfils order                       |
| 5    | Server   | Signals RTDB `{ status: "success", orderIds }`                                       |
| 6    | Client   | `usePaymentEvent` fires → navigates to confirmation                                  |
| 7    | Razorpay | Sends webhook (`payment.captured`) → server updates RTDB again (idempotent fallback) |

---

## 4. API Endpoints

### POST /api/payment/create-order

Creates a Razorpay order server-side. The client passes this order ID to the checkout modal.

**Auth required:** Yes (session cookie)

**Request body:**

```ts
{
  amount: number;    // Cart total in rupees (e.g. 499.00)
  currency?: string; // Defaults to "INR"
  receipt?: string;  // Optional reference string
}
```

**Response:**

```ts
{
  success: true;
  data: {
    razorpayOrderId: string; // "order_xxxxxxxxxxxxxxx"
    amount: number; // In paise (e.g. 49900)
    currency: string; // "INR"
    keyId: string; // NEXT_PUBLIC_RAZORPAY_KEY_ID — pass to checkout modal
  }
}
```

**What it does:**

1. Validates auth + request body
2. Converts rupees → paise via `rupeesToPaise()`
3. Calls `createRazorpayOrder()` using the server-side Razorpay SDK
4. Returns the order ID + key ID needed to open the checkout modal

---

### POST /api/payment/verify

Verifies the Razorpay payment signature and completes the order. This is the **critical path** — a tampered or replayed payment cannot pass this check.

**Auth required:** Yes (session cookie)

**Request body:**

```ts
{
  razorpay_order_id: string;   // From create-order response
  razorpay_payment_id: string; // Returned by Razorpay modal
  razorpay_signature: string;  // HMAC-SHA256 from Razorpay modal
  addressId: string;           // User's selected shipping address Firestore ID
  notes?: string;              // Optional order notes (max 500 chars)
}
```

**Response:**

```ts
{
  success: true;
  data: {
    orderIds: string[];  // One order ID per cart item
    total: number;       // Total in rupees
    itemCount: number;   // Number of orders created
  }
}
```

**What it does (in order):**

1. Verifies HMAC-SHA256 signature: `sha256(orderId + "|" + paymentId, keySecret)` — rejects anything that doesn't match
2. Loads the user's cart
3. Resolves the shipping address
4. Pre-validates all products (published status + available stock)
5. Creates one `Order` document per cart item (status: `"confirmed"`, paymentStatus: `"paid"`)
6. Atomically deducts stock for every item + clears the cart in a single Firestore batch
7. Sends order confirmation emails (fire-and-forget)
8. Signals RTDB `/payment_events/{razorpay_order_id}` with `{ status: "success", orderIds }` (fire-and-forget)

**Error states:**
| Scenario | HTTP | Error |
|---|---|---|
| Invalid signature | 400 | `CHECKOUT.PAYMENT_FAILED` |
| Empty cart | 400 | `CHECKOUT.CART_EMPTY` |
| Address not found | 404 | `CHECKOUT.ADDRESS_REQUIRED` |
| Product unavailable | 400 | `CHECKOUT.PRODUCT_UNAVAILABLE` |
| Insufficient stock | 400 | `CHECKOUT.INSUFFICIENT_STOCK` |

---

### POST /api/payment/event/init

Creates an RTDB payment event node and issues a short-lived custom token scoped to that specific event. The client uses the token to subscribe to `/payment_events/{eventId}`.

**Auth required:** Yes (session cookie)

**Rate limit:** `RateLimitPresets.AUTH` (prevents abuse)

**Request body:**

```ts
{
  razorpayOrderId: string; // From create-order response
}
```

**Response:**

```ts
{
  success: true;
  data: {
    eventId: string; // Same as razorpayOrderId
    customToken: string; // Firebase custom token with paymentEventId claim
    expiresAt: number; // Unix ms — token expires in ~5 minutes
  }
}
```

**What it does:**

1. Creates `/payment_events/{razorpayOrderId}` in RTDB with `{ status: "pending", uid, createdAt }`
2. Issues a Firebase custom token embedding the claim `{ paymentEventId: razorpayOrderId }`
3. Returns the token to the client

**When to call it:** Before opening the Razorpay modal — so the subscription is already active when the payment completes. Typically called at the start of the checkout flow after `create-order`.

---

### POST /api/payment/webhook

Receives server-to-server events from Razorpay. Provides a **fallback signal** to RTDB in case the client-side verify route failed to fire (network error, tab close, etc.).

**Auth required:** No — verification is HMAC-based (`x-razorpay-signature` header)

**Headers:**

```
x-razorpay-signature: <HMAC-SHA256 of raw body with RAZORPAY_WEBHOOK_SECRET>
```

**Handled events:**

| Event              | Action                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `payment.captured` | Updates `/payment_events/{orderId}` to `{ status: "success" }`                            |
| `payment.failed`   | Updates `/payment_events/{orderId}` to `{ status: "failed", error: {code, description} }` |
| `order.paid`       | Logs only — no state change                                                               |

**Important behaviours:**

- Always returns HTTP 200. Razorpay retries any non-200 response.
- Signature verification failure returns 400 (Razorpay will NOT retry 4xx responses from some dashboard configs — so the window should not close on 4xx).
- RTDB updates are idempotent — the verify route may have already written `status: "success"` before the webhook arrives.
- The webhook uses `payment.entity.order_id` (Razorpay's order ID) as the RTDB key — matching the key created by `event/init`.

---

## 5. Client Library

**`src/lib/payment/razorpay.ts`** — Server-side only. Never import in components, hooks, or pages.

### `getRazorpay()`

Returns a singleton Razorpay SDK instance. Throws `AppError` if credentials are missing.

```ts
import { getRazorpay } from "@/lib/payment/razorpay"; // API routes only
const razorpay = getRazorpay();
```

### `createRazorpayOrder(opts: RazorpayOrderOptions): Promise<RazorpayOrder>`

Creates a Razorpay order via their API. Amount must be in paise.

```ts
interface RazorpayOrderOptions {
  amount: number; // paise — use rupeesToPaise() first
  currency?: string; // "INR" (default)
  receipt?: string;
  notes?: Record<string, string>;
}
```

### `verifyPaymentSignature(params: RazorpayPaymentResult): boolean`

Verifies a payment signature using HMAC-SHA256.

```ts
// Algorithm: sha256( orderId + "|" + paymentId, RAZORPAY_KEY_SECRET )
const isValid = verifyPaymentSignature({
  razorpay_order_id: "...",
  razorpay_payment_id: "...",
  razorpay_signature: "...",
});
```

### `verifyWebhookSignature(rawBody: string, receivedSignature: string): boolean`

Verifies a webhook payload signature using HMAC-SHA256 over the raw request body.

```ts
// Algorithm: sha256( rawBody, RAZORPAY_WEBHOOK_SECRET )
const isValid = verifyWebhookSignature(
  rawBody,
  req.headers["x-razorpay-signature"],
);
```

### `rupeesToPaise(rupees: number): number`

### `paiseToRupees(paise: number): number`

Currency conversion helpers.

```ts
rupeesToPaise(499); // → 49900
paiseToRupees(49900); // → 499
```

---

## 6. Hooks Reference

### useRazorpay

**`src/hooks/useRazorpay.ts`**

Loads Razorpay's `checkout.js` script on mount and provides `openRazorpay()` to launch the payment modal.

```ts
const { openRazorpay, isLoading } = useRazorpay();
```

**`isLoading`** — `true` while `checkout.js` is being fetched. Show a loading indicator or disable the Pay button until this is false.

**`openRazorpay(options: RazorpayOptions): Promise<RazorpayPaymentResponse>`**

Opens the Razorpay modal. Resolves with the payment response when the user completes payment. Rejects if the modal is dismissed.

```ts
const response = await openRazorpay({
  key: keyId, // NEXT_PUBLIC_RAZORPAY_KEY_ID (or returned by create-order)
  amount: 49900, // paise
  currency: "INR",
  order_id: razorpayOrderId, // from create-order response
  name: "LetItRip",
  description: "Order Payment",
  prefill: { name: user.displayName, email: user.email },
  theme: { color: "#6366f1" },
  modal: {
    ondismiss: () => {
      /* user closed without paying */
    },
  },
  handler: (response) => {
    // Called by Razorpay on success — use this to trigger verify
  },
});
// response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
```

**`RazorpayOptions` interface:**

```ts
interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  image?: string; // Merchant logo URL
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayPaymentResponse) => void;
}
```

---

### usePaymentEvent

**`src/hooks/usePaymentEvent.ts`**

Thin domain wrapper over `useRealtimeEvent` scoped to `payment_events`. Subscribes to the RTDB payment event node for real-time payment outcome notifications.

```ts
import { usePaymentEvent } from "@/hooks";
import { RealtimeEventStatus } from "@/hooks";

const { status, error, orderIds, subscribe, reset } = usePaymentEvent();
```

**Status machine** (values from `RealtimeEventStatus`):

```
idle → subscribing → pending → success
                             ↘ failed
                   → timeout (after 5 minutes)
```

| Status        | `RealtimeEventStatus` key | Meaning                                      |
| ------------- | ------------------------- | -------------------------------------------- |
| `idle`        | `IDLE`                    | Not yet subscribed                           |
| `subscribing` | `SUBSCRIBING`             | Signing in to RTDB with the custom token     |
| `pending`     | `PENDING`                 | Subscribed — waiting for the payment outcome |
| `success`     | `SUCCESS`                 | Payment confirmed — `orderIds` is populated  |
| `failed`      | `FAILED`                  | Payment failed — `error` contains details    |
| `timeout`     | `TIMEOUT`                 | No outcome received within 5 minutes         |

**`subscribe(eventId: string, customToken: string): void`**

Starts the RTDB subscription. Call this after receiving the `customToken` from `POST /api/payment/event/init`.

```ts
const { eventId, customToken } =
  await paymentEventService.initPaymentEvent(razorpayOrderId);
subscribe(eventId, customToken);
```

**`reset(): void`**

Clears state back to `idle`. Call this when restarting a failed payment attempt.

**Full usage pattern:**

```tsx
import { usePaymentEvent, RealtimeEventStatus } from "@/hooks";
import { paymentEventService } from "@/services";

function CheckoutButton() {
  const { status, orderIds, subscribe, reset } = usePaymentEvent();
  const { openRazorpay } = useRazorpay();

  async function handlePay() {
    // Step 1 — init RTDB node + get custom token
    const { razorpayOrderId, amount, currency, keyId } =
      await checkoutService.createPaymentOrder({ amount: cartTotal });

    const { eventId, customToken } =
      await paymentEventService.initPaymentEvent(razorpayOrderId);

    subscribe(eventId, customToken); // start listening BEFORE modal opens

    // Step 2 — open modal
    await openRazorpay({
      key: keyId,
      amount,
      currency,
      order_id: razorpayOrderId,
      handler: async (response) => {
        // Step 3 — verify server-side
        await checkoutService.verifyPayment(response);
        // usePaymentEvent will fire to "success" via RTDB
      },
    });
  }

  // React to the RTDB outcome
  useEffect(() => {
    if (status === RealtimeEventStatus.SUCCESS && orderIds) {
      router.push(`/order-confirmation?ids=${orderIds.join(",")}`);
    }
  }, [status, orderIds]);

  return <Button onClick={handlePay}>Pay ₹{cartTotal}</Button>;
}
```

---

### useCheckout

**`src/hooks/useCheckout.ts`**

Composite checkout hook providing mutation wrappers for `checkoutService`.

```ts
const {
  createPaymentOrder,
  verifyPayment,
  placeOrder, // COD
} = useCheckout();
```

Each of these is a `useApiMutation` wrapper — they expose `mutate`, `isLoading`, and `error` following the standard mutation pattern. See [GUIDE.md](./GUIDE.md) for `useApiMutation` API.

---

## 7. Service Layer

### checkoutService (`src/services/checkout.service.ts`)

```ts
import { checkoutService } from "@/services";

// Create a Razorpay order (Step 2 of flow)
const order = await checkoutService.createPaymentOrder({ amount: 499 });
// → POST /api/payment/create-order

// Verify payment (Step 4 of flow)
const result = await checkoutService.verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  addressId,
});
// → POST /api/payment/verify

// Place a COD order (alternative flow)
const codOrder = await checkoutService.placeOrder({ addressId, notes });
// → POST /api/checkout/place-order
```

### paymentEventService (`src/services/payment-event.service.ts`)

```ts
import { paymentEventService } from "@/services";

// Initialise the RTDB payment bridge (Step 1 of flow)
const { eventId, customToken, expiresAt } =
  await paymentEventService.initPaymentEvent(razorpayOrderId);
// → POST /api/payment/event/init
```

---

## 8. RTDB Payment Bridge

### Purpose

Razorpay's payment result is returned to the browser via the `handler` callback. The client then calls the verify endpoint. Rather than polling or relying solely on the API response, a Firebase RTDB node provides real-time propagation — the server signals the node as soon as verification completes, and any open tab with a subscription instantly reacts.

### Node Structure

```
/payment_events/
  {razorpayOrderId}/
    status:    "pending" | "success" | "failed"
    uid:       "user_uid"
    createdAt: 1700000000000      // ms
    updatedAt: 1700000000000      // ms (added on status change)
    orderIds:  ["ord_abc", ...]   // added on success
    error: {                      // added on failure
      code:        "PAYMENT_FAILED"
      description: "Insufficient funds"
    }
```

### Security Rules (`database.rules.json`)

```json
{
  "rules": {
    "payment_events": {
      "$eventId": {
        ".read": "auth != null && auth.token.paymentEventId == $eventId",
        ".write": false
      }
    }
  }
}
```

Key properties:

- **Read**: Only the holder of a custom token with `paymentEventId == $eventId` can read that node
- **Write**: `false` — all writes come from the Firebase Admin SDK on the server
- **Scoped**: Even a logged-in user cannot read another user's payment event (the `paymentEventId` claim must match the specific node key)

### Custom Token Claim

```ts
// Issued by POST /api/payment/event/init
admin.auth().createCustomToken(uid, {
  paymentEventId: razorpayOrderId, // must match the RTDB node key
});
// TTL: 5 minutes
```

The client signs in to the **secondary** `realtimeApp` Firebase app instance (not the main app auth) using this token before subscribing to the node. This isolates the payment listener from main-app authentication state.

### Dual Write (Verify + Webhook)

Both `POST /api/payment/verify` and `POST /api/payment/webhook` write to the same RTDB node:

- **`/api/payment/verify`** — primary signal; fired immediately after orders are created
- **`/api/payment/webhook`** — fallback signal; fired when Razorpay's server-to-server event arrives

Both writes are idempotent — the node `status` field goes from `pending` → `success` (or `failed`), and a second write of `success` is a no-op from the UI perspective. The webhook typically arrives 2-10 seconds after the verify call.

---

## 9. Webhook Setup

### Razorpay Dashboard Configuration

1. Go to **Razorpay Dashboard → Settings → Webhooks**
2. Click **Add New Webhook**
3. Set the **URL** to: `https://letitrip.in/api/payment/webhook`
4. Set the **Secret** — this becomes `RAZORPAY_WEBHOOK_SECRET` in your environment
5. Enable these events:
   - `payment.captured` (required — success signal)
   - `payment.failed` (required — failure signal)
   - `order.paid` (optional — informational)
6. Save and copy the webhook secret to `.env.local` (and Vercel env vars via `.\scripts\sync-env-to-vercel.ps1`)

### Signature Verification

Every webhook POST includes a `x-razorpay-signature` header. The endpoint:

1. Reads the **raw request body** (before JSON parsing — `request.text()`)
2. Computes `HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)`
3. Compares with the header value using a constant-time string comparison via `crypto.timingSafeEqual`

If verification fails, the endpoint returns HTTP 400. Razorpay's retry policy for webhooks is:

- 3 retries over 15 minutes for 5xx responses
- No retry for 4xx responses

### Always Return 200

The endpoint returns HTTP 200 for all successfully processed events. Returning non-200 for business logic errors (e.g. "event not found") would trigger unnecessary retries.

---

## 10. Alternative Payment Flows

### Cash on Delivery (COD)

COD bypasses the entire Razorpay / RTDB bridge:

```
Client → POST /api/checkout/place-order → { addressId, notes }
       ← { orderId }
       → navigate to /order-confirmation
```

The COD endpoint (`src/app/api/checkout/place-order/route.ts`) creates orders with `paymentStatus: "pending"` and `paymentMethod: "cod"`. No Razorpay SDK call is made.

**Service call:**

```ts
const { orderId } = await checkoutService.placeOrder({ addressId, notes });
```

**Hook:**

```ts
const { mutate: placeOrder, isLoading } = useCheckout();
// or access via useApiMutation:
const { mutate } = useApiMutation({
  mutationFn: (data) => checkoutService.placeOrder(data),
});
```

---

## 11. Firebase Function — Cleanup

**`functions/src/jobs/cleanupPaymentEvents.ts`**

A scheduled Cloud Function that purges stale RTDB payment event nodes.

| Property | Value                                                              |
| -------- | ------------------------------------------------------------------ |
| Schedule | `SCHEDULES.EVERY_5_MIN` (every 5 minutes)                          |
| TTL      | 15 minutes (`PAYMENT_EVENT_TTL_MS`)                                |
| Action   | Deletes `/payment_events/{id}` nodes where `createdAt < now - 15m` |

RTDB nodes are small and cheap, but uncleaned nodes would accumulate over time. Nodes older than 15 minutes represent completed or abandoned payments — no active client is subscribed to them.

**Deploy:**

```powershell
firebase deploy --only functions:cleanupPaymentEvents
```

---

## 12. Error Handling

### Client-Side Errors

| Source                    | Error                  | Recommended UI                                                    |
| ------------------------- | ---------------------- | ----------------------------------------------------------------- |
| `create-order` fails      | Network/server error   | Show `Alert variant="error"` with retry button                    |
| `event/init` fails        | Network/server error   | Proceed without RTDB bridge; verify directly                      |
| Modal dismissed           | User action            | Return to cart without error                                      |
| Signature mismatch        | 400 from `/verify`     | Show `Alert` — "Payment verification failed. Contact support."    |
| Insufficient stock        | 400 from `/verify`     | Show `Alert` — product gone; return to cart                       |
| `usePaymentEvent` timeout | `status === "timeout"` | Show "Payment is taking longer than expected" + check orders page |

### RTDB Bridge Degraded Operation

If `event/init` fails, the payment can still complete:

1. Open Razorpay modal normally (without subscribing to RTDB)
2. Call `/api/payment/verify` after the handler fires
3. Navigate based on the API response `orderIds` directly (not waiting for RTDB)

The RTDB bridge is a UX enhancement, not a hard dependency.

### Webhook-Only Scenario

If the client tab closes between the modal completing and verify being called:

1. Razorpay sends the `payment.captured` webhook within seconds
2. The webhook handler signals RTDB `{ status: "success" }`
3. If the user re-opens the checkout page and the 5-minute token hasn't expired, `usePaymentEvent` will return `success` from the already-set node
4. The verify endpoint was not called — orders were NOT created. The user should be prompted to check their order history; a recovery flow may be needed

> **Important:** The webhook signals RTDB but does NOT create orders. Only `POST /api/payment/verify` creates orders. Implement a recovery endpoint (e.g. `POST /api/payment/recover`) if the closed-tab scenario needs to be handled automatically.

---

## 13. Testing

### Unit Tests

Mock `src/lib/payment/razorpay.ts` for API route tests:

```ts
jest.mock("@/lib/payment/razorpay", () => ({
  getRazorpay: jest.fn(),
  createRazorpayOrder: jest
    .fn()
    .mockResolvedValue({ id: "order_test", amount: 49900 }),
  verifyPaymentSignature: jest.fn().mockReturnValue(true),
  verifyWebhookSignature: jest.fn().mockReturnValue(true),
  rupeesToPaise: (r: number) => Math.round(r * 100),
  paiseToRupees: (p: number) => p / 100,
}));
```

### Integration Testing with Razorpay Test Mode

1. Use Razorpay **Test Mode** keys (from the Dashboard) in `.env.local`
2. Use the [Razorpay test cards](https://razorpay.com/docs/payments/payments/test-card-details/) to simulate success and failure
3. Expose your local server via ngrok to test webhooks: `ngrok http 3000`
4. Set the ngrok URL as the webhook URL in the Razorpay Test Mode dashboard

### Test Card Examples

| Scenario  | Card number        | Behaviour                             |
| --------- | ------------------ | ------------------------------------- |
| Success   | `4111111111111111` | Payment succeeds immediately          |
| Failure   | `4000000000000002` | Payment fails with insufficient funds |
| 3D Secure | `4000000000003220` | Requires OTP (use `1234`)             |

---

## 14. File Map

```
src/
├── app/api/payment/
│   ├── create-order/route.ts    — Step 2: create Razorpay order
│   ├── verify/route.ts          — Step 4: verify + fulfil order
│   ├── event/
│   │   └── init/route.ts        — Step 1: create RTDB node + issue custom token
│   └── webhook/route.ts         — Razorpay server-to-server events (fallback)
│
├── lib/payment/
│   └── razorpay.ts              — Server-side SDK wrapper, signature helpers, currency utils
│
├── hooks/
│   ├── useRazorpay.ts           — Loads checkout.js, opens payment modal
│   ├── usePaymentEvent.ts       — Thin wrapper: RTDB payment outcome subscriber (uses useRealtimeEvent)
│   ├── useRealtimeEvent.ts      — Generic RTDB event bridge hook (RealtimeEventType, RealtimeEventStatus)
│   └── useCheckout.ts           — Mutation wrappers for checkout API methods
│
└── services/
    ├── checkout.service.ts      — createPaymentOrder, verifyPayment, placeOrder
    └── payment-event.service.ts — initPaymentEvent (calls /api/payment/event/init)

functions/src/
└── jobs/
    └── cleanupPaymentEvents.ts  — Scheduled cleanup of stale RTDB nodes (every 5 min)

database.rules.json              — RTDB security rules (payment_events node)
```

---

## Related Documentation

- [AUTH.md](./AUTH.md) — The RTDB custom token pattern used here mirrors the OAuth popup bridge
- [SECURITY.md](./SECURITY.md) — General security practices
- [GUIDE.md](./GUIDE.md) — `useApiMutation`, `useCheckout`, service layer patterns
- [RBAC.md](./RBAC.md) — Role protection on checkout/payment routes
