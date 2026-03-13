# Cart & Checkout Feature

**Feature path:** `src/features/cart/`  
**Repository:** `cartRepository`, `orderRepository`  
**Service:** `cartService`, `checkoutService`  
**Actions:** `addToCartAction`, `updateCartItemAction`, `removeFromCartAction`, `clearCartAction`, `mergeGuestCartAction`

---

## Overview

The cart and checkout feature handles the full purchase journey from adding items to placing a paid order. Guest users have a localStorage cart that merges into the server cart on sign-in.

---

## Cart

### `CartView`

Full cart page:

- `CartItemList` — scrollable list of `CartItemRow` components
- `CartSummary` — subtotal, applied coupon discount, shipping estimate, total
- `PromoCodeInput` — enter coupon code, validate via `validateCouponForCartAction`
- Checkout CTA button → navigates to `/checkout`

### `CartItemRow`

Individual cart item:

- Product image, name, variant info
- Quantity stepper (uses `useUpdateCartItem`)
- Remove button (uses `useRemoveCartItem`)
- Line price display

### `GuestCartItemRow`

Like `CartItemRow` but reads from localStorage via `useGuestCart`. Shown to unauthenticated users.

### `GuestCartMergerEffect`

Client effect component mounted in the cart layout. Detects sign-in events and calls `mergeGuestCartAction` to push guest items to the server cart. Then clears localStorage.

---

## Cart Hooks

| Hook                | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `useCart(enabled)`  | Fetches authenticated cart from `GET /api/cart`. Disabled for guests |
| `useUpdateCartItem` | Mutation wrapping `updateCartItemAction`                             |
| `useRemoveCartItem` | Mutation wrapping `removeFromCartAction`                             |
| `useCartCount`      | Returns total item count from cart (used in navbar badge)            |
| `useGuestCart`      | Read/write localStorage cart for unauthenticated users               |
| `useGuestCartMerge` | Merges guest cart on login                                           |
| `useAddToCart`      | Combined hook: adds to server cart (auth) or guest cart (guest)      |

---

## Checkout

### `CheckoutView`

Multi-step checkout orchestrator:

```
Step 1: Address           → CheckoutAddressStep
Step 2: Order Review      → CheckoutOrderReview
Step 3: Payment           → CheckoutPaymentMethod
```

Progress shown via `StepperNav`.

### `CheckoutAddressStep`

- Renders `AddressSelectorCreate` — select saved address or add new inline
- Validates a delivery address is selected before proceeding
- Detects third-party addresses (recipient name differs from the account holder) and triggers the consent OTP flow before allowing the step to advance
- Shows `ConsentOtpModal` when consent is required; shows `PartialOrderDialog` when a prior partial order occurred

### `CheckoutOrderReview`

- `OrderSummaryPanel` — all cart items, quantities, prices
- Applied coupon savings
- Estimated delivery date
- Seller breakdown (cart split per seller via `order-splitter.ts`)

### `CheckoutPaymentMethod`

Payment options:

- **Razorpay** — credit/debit card, UPI, netbanking (via `useRazorpay`)
- **Cash on Delivery (COD)** — triggers OTP verification via `CheckoutOtpModal`
- **RC** — partial or full payment with earned coins

On "Place Order":

1. `POST /api/payment/create-order` — creates Razorpay order ID
2. Razorpay checkout opens
3. On payment success: `POST /api/payment/verify` — verifies signature, creates order in Firestore, clears cart

### `ConsentOtpModal`

Email OTP verification required when shipping to a third-party address:

1. Calls `sendConsentOtpAction(addressId)` to email a 6-digit code to the account's email
2. User enters the code; calls `verifyConsentOtpAction(addressId, code)`
3. On success the checkout step proceeds; on failure shows attempt count / error
4. Respects the 15-min cooldown — shows a countdown timer when resend is blocked
5. Can be re-triggered up to 3 times via bypass credits after a partial order

**Types:** `ConsentOtpModalProps`

### `PartialOrderDialog`

Shown after `POST /api/checkout` returns `unavailableItems` (some products were out of stock mid-transaction). Lets the buyer decide to:

- **Proceed** — place the order with only the available items (granting one bypass credit)
- **Cancel** — return to cart to adjust quantities

**Types:** `PartialOrderDialogProps`, `UnavailableItem`

### `CheckoutOtpModal`

OTP verification for COD orders:

1. `usePaymentOtp` sends OTP to user's verified phone
2. User enters 6-digit code
3. `POST /api/payment/otp/request` → verify → proceed

**Type:** `OtpState`, `UsePaymentOtpReturn`

### `OrderSummaryPanel`

Sticky sidebar showing order totals, coupon applied, delivery fee, final amount. Used in both review and payment steps.

### `PromoCodeInput`

Input field with apply/remove button. Calls `validateCouponForCartAction`. Shows discount feedback inline.

---

## Checkout Data Hook

### `useCheckout`

Central data hook for the checkout flow:

- Fetches cart + addresses in a single combined call via `checkoutService.getCheckoutData()`
- Manages step navigation state
- Tracks selected address ID

**Types:** `AddressListResponse`, `CartApiResponse`, `PlaceOrderResponse`

---

## Order Success

### `CheckoutSuccessView`

Shown after successful payment (`/checkout/success`):

- `OrderSuccessHero` — confirmation animation + order ID
- `OrderSuccessCard` — order summary (items, total, delivery address)
- `OrderSuccessActions` — "Track Order" and "Continue Shopping" CTAs

---

## Guest Cart

Guest users (not signed in) interact with a localStorage cart:

```ts
// src/utils/guest-cart.ts
getGuestCartItems();
addToGuestCart(item);
removeFromGuestCart(productId);
updateGuestCartQuantity(productId, qty);
clearGuestCart();
getGuestCartCount();
```

`setGuestReturnTo` / `getGuestReturnTo` stores the intended checkout URL so guests are redirected back after signing in.

---

## Order Splitting

`src/utils/order-splitter.ts`  
Function: `splitCartIntoOrderGroups(cartItems[])`  
**Type:** `OrderGroup`

When a cart contains items from multiple sellers, the cart is split into separate orders — one per seller. Each group is shown to the user in the order review step and creates a separate order document in Firestore.

---

## Payment Integrations

### Razorpay

| Endpoint                         | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `POST /api/payment/create-order` | Create Razorpay order ID                            |
| `POST /api/payment/verify`       | HMAC signature verification + order creation        |
| `POST /api/payment/webhook`      | Razorpay webhook (payment.captured, payment.failed) |

Hook: `useRazorpay` loads the Razorpay script and opens the checkout widget.

---

## Consent OTP Lib — `src/lib/consent-otp.ts`

Shared module used by the send route, verify route, checkout route, and checkout actions. Single source of truth — never duplicate these in consumer files.

### Constants

| Export                           | Value      | Description                                 |
| -------------------------------- | ---------- | ------------------------------------------- |
| `CONSENT_OTP_EXPIRY_MS`          | 10 min     | OTP validity window (milliseconds)          |
| `CONSENT_OTP_EXPIRY_MINUTES`     | 10         | Expiry in minutes (used in email body text) |
| `CONSENT_OTP_COOLDOWN_MS`        | 15 min     | Per-user send cooldown (milliseconds)       |
| `CONSENT_OTP_MAX_BYPASS_CREDITS` | 3          | Max partial-order cooldown bypasses         |
| `CONSENT_OTP_MAX_ATTEMPTS`       | 5          | Max failed verification attempts per OTP    |
| `CONSENT_OTP_VERIFY_RATE_LIMIT`  | 10 / 5 min | Upstash rate limit for verify endpoint      |

### Path Helpers

| Export                              | Returns             | Description                            |
| ----------------------------------- | ------------------- | -------------------------------------- |
| `consentOtpRef(db, uid, addressId)` | `DocumentReference` | `users/{uid}/consentOtps/{addressId}`  |
| `consentOtpRateLimitRef(db, uid)`   | `DocumentReference` | `users/{uid}/consentOtpRateLimit/meta` |

### Utilities

| Export                                                | Description                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `hashOtp(code)`                                       | HMAC-SHA256 hash of a code (key from `CONSENT_OTP_HMAC_KEY`) |
| `generateOtpCode()`                                   | Random 6-digit string                                        |
| `maskEmail(email)`                                    | Obfuscates email for display (`j***e@example.com`)           |
| `buildConsentOtpEmail(recipientName, code, siteName)` | Returns `{ subject, html }` for the consent email            |

---

### Pre-Order Deposit

`POST /api/payment/preorder` — creates a partial deposit payment for pre-order products.

### Event Registration Payment

`POST /api/payment/event/init` — payment for paid event participation.
