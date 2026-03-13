# Business Logic Reference

> Complete documentation of LetItRip's business domain, actors, rules, and scenario flows.  
> Architecture & technical reference: [`docs/architecture.md`](architecture.md) · [`docs/GUIDE.md`](../README.md)

---

## Table of Contents

1. [Actors & Roles](#1-actors--roles)
2. [Authentication & Sessions](#2-authentication--sessions)
3. [Product Catalogue](#3-product-catalogue)
4. [Auctions](#4-auctions)
5. [Pre-Orders](#5-pre-orders)
6. [Cart](#6-cart)
7. [Checkout & Payment](#7-checkout--payment)
8. [Orders](#8-orders)
9. [Seller Portal](#9-seller-portal)
10. [Payouts](#10-payouts)
11. [Reviews & Ratings](#11-reviews--ratings)
12. [Coupons & Promotions](#12-coupons--promotions)
13. [RC (Virtual Currency)](#13-rc-virtual-currency)
14. [Events & Campaigns](#14-events--campaigns)
15. [Blog & Content](#15-blog--content)
16. [Notifications](#16-notifications)
17. [Search](#17-search)
18. [Categories & Stores](#18-categories--stores)
19. [Admin Platform Management](#19-admin-platform-management)
20. [Cross-Cutting Rules](#20-cross-cutting-rules)

---

## 1. Actors & Roles

### Role Hierarchy

```
guest          Unauthenticated browser visitor
  └─ user      Signed-in buyer (default role after registration)
       └─ seller  Buyer who applied and was approved as a store owner
            └─ admin   Platform operator with full cross-cutting access
```

### Actor Capabilities Summary

| Capability                        | Guest | User | Seller | Admin |
| --------------------------------- | :---: | :--: | :----: | :---: |
| Browse catalogue & search         |   ✓   |  ✓   |   ✓    |   ✓   |
| Add to guest cart (localStorage)  |   ✓   |  —   |   —    |   —   |
| Add to server cart                |   —   |  ✓   |   ✓    |   ✓   |
| Place orders / checkout           |   —   |  ✓   |   ✓    |   ✓   |
| Write reviews (verified purchase) |   —   |  ✓   |   ✓    |   ✓   |
| Participate in events             |   —   |  ✓   |   ✓    |   ✓   |
| Manage own wishlist               |   —   |  ✓   |   ✓    |   ✓   |
| Earn & spend RC                   |   —   |  ✓   |   ✓    |   ✓   |
| Manage own store & products       |   —   |  —   |   ✓    |   ✓   |
| Ship orders & request payouts     |   —   |  —   |   ✓    |   ✓   |
| Manage platform-wide content      |   —   |  —   |   —    |   ✓   |
| Approve/reject sellers, reviews   |   —   |  —   |   —    |   ✓   |
| Override order statuses           |   —   |  —   |   —    |   ✓   |
| Adjust RC balances manually       |   —   |  —   |   —    |   ✓   |
| Manage coupons (platform)         |   —   |  —   |   —    |   ✓   |
| Manage coupons (store)            |   —   |  —   |   ✓    |   —   |
| Revoke sessions                   |   —   |  —   |   —    |   ✓   |

---

## 2. Authentication & Sessions

### 2.1 Actors

- **Guest** — attempts to sign in or register
- **User / Seller / Admin** — manages active session
- **System** — Firebase Admin SDK validates tokens; middleware enforces route guards

### 2.2 Registration Scenario

```
1. Guest submits RegisterForm { name, email, password, confirmPassword }
2. Zod schema validates (passwords match, email format, min password strength)
3. POST /api/auth/register
   a. Firebase Admin createUser(email, password, displayName)
   b. userRepository.create({ uid, name, email, role: 'user', emailVerified: false })
   c. Send verification email via Resend with a 6-digit OTP
   d. Set HTTP-only __session cookie
4. AuthContext refreshes with new user
5. User is redirected to /auth/verify-email
```

**Rules:**

- Email must be unique across Firebase Auth
- Password minimum: 8 characters
- Email verification is required before placing an order

### 2.3 Email/Password Login Scenario

```
1. User submits LoginForm { email, password }
2. Client SDK signs in → receives Firebase idToken
3. POST /api/auth/login { idToken }
   a. Firebase Admin verifyIdToken(idToken)
   b. sessionRepository.create({ userId, device, ip })
   c. Set-Cookie: __session (httpOnly, secure, SameSite=Lax)
4. AuthContext.refresh() reads decoded user from cookie
5. Redirect to intended page (or /user)
```

### 2.4 Google OAuth Scenario

```
1. User clicks "Continue with Google"
2. GET /api/auth/google/start → build OAuth URL → redirect to Google
3. Google redirects to /api/auth/google/callback?code=...
4. Exchange code for idToken → Firebase Admin verifyIdToken
5. Upsert user in Firestore (create if new, update lastLogin if existing)
6. Create session → Set __session cookie → redirect to dashboard
```

### 2.5 Logout Scenario

```
1. User triggers logout
2. POST /api/auth/logout
   a. sessionRepository.delete(sessionId)
   b. Clear-Cookie: __session
3. AuthContext.clear() → user is guest again
```

### 2.6 Password Reset Scenario

```
1. Guest enters email in ForgotPasswordView
2. POST /api/auth/forgot-password
   a. passwordResetTokenRepository.create({ email, token (UUID), expiresAt: +1hr })
   b. Send email via Resend with reset link: /auth/reset-password?token=...
3. User clicks link → ResetPasswordView loads
4. POST /api/auth/reset-password { token, newPassword }
   a. passwordResetTokenRepository.findValid(token) — must exist, not expired, not used
   b. Firebase Admin updateUser(uid, { password })
   c. Token marked as used
5. User is redirected to /auth/login
```

### 2.7 Email Verification Scenario

```
1. User on /auth/verify-email receives 6-digit OTP via email
2. POST /api/auth/verify-email { code }
   a. Validate OTP document (not expired, correct code)
   b. userRepository.update(uid, { emailVerified: true })
   c. Firebase Admin updateUser(uid, { emailVerified: true })
3. Resend OTP: POST /api/auth/send-verification → new OTP + email
```

### 2.8 Route Guard Rules

- `middleware.ts` intercepts every request and validates `__session`
- Routes protected by `RBAC_CONFIG` — each protected route has a minimum required role
- Unauthenticated requests to protected routes → redirect `/auth/login`
- Authenticated requests with insufficient role → redirect `/unauthorized`

### 2.9 Session Management

- Each session stores: `sessionId`, `userId`, `device` (user-agent), `ip`, `createdAt`
- Admin can revoke individual session (`revokeSessionAction`) or all sessions for a user (`revokeUserSessionsAction`)
- Sessions are validated on every request through the `__session` cookie

---

## 3. Product Catalogue

### 3.1 Actors

- **Guest / User** — browse and view products
- **Seller** — create and manage own products
- **Admin** — create, edit, or delete any product

### 3.2 Product Types

| Type      | Field value   | Purchase mechanism            |
| --------- | ------------- | ----------------------------- |
| Standard  | `'product'`   | Add to cart → checkout        |
| Auction   | `'auction'`   | Bid → win → checkout          |
| Pre-Order | `'pre-order'` | Reserve → pay deposit or full |

All three share the same Firestore `products` collection, differentiated by the `type` field.

### 3.3 Product Creation (Seller) Scenario

```
1. Seller opens /seller/products/new
2. Fills ProductForm:
   - Basic info (name, description, brand)
   - Category (select or inline-create)
   - Media (up to 10 images + 1 video — staged locally, submitted as FormData)
   - Pricing (price, compare-at-price, bulk discount tiers)
   - Inventory (SKU, stock, weight, dimensions)
   - Type-specific settings (auction dates/min-bid, pre-order deposit)
   - SEO (title override, meta description)
3. Submit → POST /api/seller/products
   a. Files uploaded to Firebase Storage on the backend
   b. productRepository.create({ ...data, sellerId, storeId, status: 'active' })
4. Seller redirected to product list
```

**Rules:**

- Images are staged locally in the browser → submitted as FormData to backend → backend uploads to Firebase Storage (never client-side upload)
- Media upload validates magic bytes for MIME type (not just extension)
- Only the owning seller (or admin) can edit or delete a product

### 3.4 Product Listing Scenario

```
1. User/Guest visits /products (or a category page)
2. URL params drive filtering: page, pageSize, sort, category, minPrice, maxPrice, brand, rating
3. RSC page calls productRepository.findMany(params) → passes initialData to ProductsView
4. Client uses TanStack Query for stale-while-revalidate updates
5. Filter changes update URL via useUrlTable (no useState)
```

### 3.5 Bulk Discount Tiers

- Sellers can define tiered pricing (e.g. buy 3 save 10%, buy 5 save 15%)
- `BuyMoreSaveMore` component shows tiers on product detail page
- Quantity selector auto-triggers tier discount calculation at checkout

### 3.6 Admin Product Management

- Admin can create products not tied to a seller store
- Admin can update any product's fields (`adminUpdateProductAction`)
- Admin can delete any product (`adminDeleteProductAction`)
- Deletion is permanent (no soft-delete for products)

---

## 4. Auctions

### 4.1 Actors

- **User** — places bids on active auctions
- **Seller** — creates an auction-type product with start/end dates and a minimum bid
- **Admin** — oversees all bids; can update auction product fields
- **System** — Firebase RTDB holds live bid state; scheduled job ends auctions at `endTime`

### 4.2 Auction Lifecycle

```
upcoming  ← endTime has not been reached, auction not yet started
  │
  ▼
active    ← startTime reached; bidding is open
  │
  ▼
ended     ← endTime reached (scheduler transitions status)
  │
  ▼
winner notified → checkout flow for winning bidder
```

### 4.3 Placing a Bid Scenario

```
1. User opens AuctionDetailView
2. Live current bid shown via useRealtimeBids (Firebase RTDB)
3. User fills PlaceBidForm { amount }
4. Client-side validation:
   - amount ≥ currentBid + minimumIncrement
   - user is NOT already the highest bidder
   - auction status is 'active'
5. Submit → placeBidAction({ auctionId, amount })
   a. Server re-validates all conditions against Firestore + RTDB
   b. Atomically: update RTDB highest bid + write bid record to Firestore
6. Previous highest bidder receives 'bid_outbid' notification
7. RTDB update propagates to all open AuctionDetailView clients in real-time
```

**Rules:**

- Bid amount must exceed current highest bid by at least the minimum increment
- A user cannot be outbid on their own top bid (double-bid protection)
- RTDB and Firestore are updated atomically to keep state consistent

### 4.4 Auction End Scenario

```
1. Scheduled job fires when endTime is reached
2. Reads highest bid from RTDB
3. Creates winning bid record in Firestore
4. Sends 'bid_won' notification to winner
5. Sends 'bid_outbid' notification to all other bidders
6. Winner directed to checkout → order placed at winning bid price
```

---

## 5. Pre-Orders

### 5.1 Actors

- **User** — reserves a pre-order product
- **Seller** — creates a pre-order product with an availability date and optional deposit amount

### 5.2 Pre-Order Scenario

```
1. User views pre-order product → sees "Available on [date]" info
2. User clicks "Pre-Order" → adds to cart with pre-order flag
3. Checkout proceeds normally; payment is captured at full price or deposit only (seller config)
4. Order created with status: 'pre_order'
5. When product becomes available, seller marks it ready → order transitions to 'confirmed'
```

---

## 6. Cart

### 6.1 Actors

- **Guest** — uses a localStorage cart; can browse and build a cart without signing in
- **User** — uses a server-side Firestore cart

### 6.2 Guest Cart Scenario

```
1. Guest adds a product to cart
2. Item saved to localStorage via useGuestCart
3. Cart count badge reads from localStorage
4. Guest navigates to /cart → GuestCartItemRow components rendered from localStorage
```

### 6.3 Guest Cart Merge on Login Scenario

```
1. Guest has items in localStorage cart
2. Guest signs in → AuthContext detects login event
3. GuestCartMergerEffect calls mergeGuestCartAction(localItems)
4. Server merges: for each local item
   - If product exists in server cart → add quantities
   - If not → create new cart item
5. localStorage cart is cleared
6. User sees merged server cart
```

### 6.4 Server Cart Operations

| Action          | Rule                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| Add item        | If item+variant already in cart → increment quantity; else create new row  |
| Update quantity | Minimum quantity: 1; maximum: available stock                              |
| Remove item     | Deletes the cart item document                                             |
| Clear cart      | Deletes all cart item documents for the user; called after order placement |

### 6.5 Cart Coupon Application

```
1. User enters coupon code in PromoCodeInput
2. validateCouponForCartAction({ code, cartTotal, productIds })
   a. Coupon exists and is active
   b. Not expired (expiresAt > now)
   c. Usage limit not exceeded (globally and per user)
   d. Minimum order amount met by current cart total
   e. If scoped to products: at least one applicable product is in cart
3. Success → discount amount shown in CartSummary
4. Discount applied at order creation time (server-side re-validation)
```

---

## 7. Checkout & Payment

### 7.1 Actors

- **User** — completes the checkout flow
- **System (Razorpay)** — processes payment and fires webhooks
- **System (ShipRocket)** — handles shipping fulfillment

### 7.2 Multi-Step Checkout Scenario

```
Step 1 — Address
  → User selects saved address or creates a new one inline
  → If recipient name ≠ account holder name → third-party address detected
       → Consent OTP flow required (see §7.3) before advancing

Step 2 — Order Review
  → Cart items displayed with seller breakdown (order-splitter.ts)
  → Applied coupon savings shown
  → Estimated delivery date shown

Step 3 — Payment
  → User selects payment method: Razorpay | COD | RC
  → Click "Place Order"
```

### 7.3 Third-Party Address Consent OTP Scenario

```
1. Address recipient name differs from account holder
2. Consent OTP required before Step 1 can advance
3. ConsentOtpModal appears:
   a. sendConsentOtpAction(addressId)
      → Generates 6-digit code, stores in Firestore with 15-min expiry
      → Sends email to account's registered email (not the recipient's)
      → Rate limited: 15-min cooldown per user stored in users/{uid}/consentOtpRateLimit/meta
   b. User enters the OTP code
   c. verifyConsentOtpAction(addressId, code)
      → Rate limited: 10 attempts per 5 minutes (Upstash)
      → On success: marks OTP verified; checkout flow advances
      → On failure: shows attempt count; locks after limit
4. Bypass credits: a user may bypass the 15-min cooldown up to 3 times;
   one credit is granted each time a partial order was placed
```

### 7.4 Razorpay Payment Scenario

```
1. POST /api/payment/create-order { cartId, couponCode?, rcAmount? }
   a. Server re-validates cart and coupon
   b. Splits cart by seller (order-splitter.ts)
   c. Creates Razorpay order → returns { orderId, amount }
2. Razorpay checkout widget opens in browser
3. User completes payment (card / UPI / netbanking)
4. On success: Razorpay calls POST /api/payment/verify { razorpayOrderId, paymentId, signature }
   a. HMAC SHA256 signature verified (timingSafeEqual)
   b. orderRepository.create({ items, sellerId, buyerId, address, coupon, rcUsed, total, status: 'confirmed' })
   c. cartRepository.clear(userId)
   d. rcRepository.debit(userId, rcUsed) if coins were used
   e. couponRepository.incrementUsage(couponCode) if coupon used
   f. RC earned: rcRepository.credit(userId, earnedCoins) based on order total
   g. Notifications sent: 'order_confirmed' to buyer
```

### 7.5 Cash on Delivery Scenario

```
1. User selects COD payment
2. CheckoutOtpModal appears — OTP sent to registered phone/email
3. User enters OTP to confirm delivery consent
4. On verification: POST /api/checkout (COD flow)
   a. orderRepository.create({ ...data, paymentMethod: 'cod', status: 'confirmed' })
   b. cartRepository.clear(userId)
```

### 7.6 RC (Coins) at Checkout

```
1. User sees RC balance in CheckoutPaymentMethod
2. User toggles "Use RC" — slider to pick coin amount
3. Coin value converted to discount: coinAmount ÷ conversionRate (from site settings)
4. RC can cover partial or full order total
5. If full: no other payment required; order placed directly
6. If partial: remaining balance charged via Razorpay / COD
7. On order confirmation: coins are debited from user's RC balance
```

### 7.7 Partial Order Scenario (Out-of-Stock)

```
1. POST /api/checkout succeeds but some items had become unavailable
2. Response: { unavailableItems: [...] }
3. PartialOrderDialog appears:
   - "Proceed" → place order with only available items
     → user receives one consent-OTP bypass credit
   - "Cancel" → user returns to cart to adjust quantities
```

---

## 8. Orders

### 8.1 Actors

- **User** — views history, tracks shipment, cancels pending orders
- **Seller** — processes, ships, and manages orders for their store
- **Admin** — full override on any order status
- **System (ShipRocket)** — delivery status webhooks

### 8.2 Order Status Lifecycle

```
pending_payment   ← order created, payment not yet captured
      │
      ▼
  confirmed       ← payment verified (Razorpay webhook or COD OTP)
      │
      ▼
  processing      ← seller is preparing the shipment
      │
      ▼
   shipped        ← seller ships; ShipRocket AWB assigned
      │
      ▼
  delivered       ← ShipRocket delivery webhook fires
      │
      ▼
  completed       ← auto-transition after delivery + return window closes

 (from any state) → cancelled  ← user (only from pending_payment / confirmed)
                              ← admin (any state)
 (from any state) → refunded   ← admin only
```

### 8.3 User Cancels Order Scenario

```
1. User opens OrderDetailView
2. "Cancel Order" CTA visible only when status is 'pending_payment' or 'confirmed'
3. cancelOrderAction({ orderId })
   a. Validates status is cancellable
   b. orderRepository.update(orderId, { status: 'cancelled' })
   c. If payment was made → refund initiated via Razorpay Refunds API
   d. RC earned on this order → reversed (debit)
   e. Notification: 'order_cancelled' sent to buyer
```

### 8.4 Seller Ships Order Scenario

```
1. Seller opens SellerOrdersView; clicks "Ship" on a confirmed order
2. useShipOrder → POST /api/seller/orders/[id]/ship
   a. ShipRocket API: create shipment, assign AWB
   b. orderRepository.update(orderId, { status: 'shipped', awb, courier, trackingUrl })
3. Buyer receives 'order_shipped' notification
4. Seller order card now shows AWB number + shipment link
```

### 8.5 Admin Order Override Scenario

```
1. Admin opens AdminOrdersView → selects order
2. Fills OrderStatusForm { status, note }
3. adminUpdateOrderAction({ id, status, note })
   a. Status updated regardless of current state (admin override)
   b. Note stored as an internal audit trail entry
   c. If refunded: Razorpay refund API called
```

### 8.6 Invoice Generation

```
GET /api/orders/[id]/invoice
  → Validates requesting user is the buyer, seller, or admin
  → Generates PDF invoice with order items, tax breakdown, addresses
  → Returns streamed PDF response
```

---

## 9. Seller Portal

### 9.1 Actors

- **User (applying)** — submits a seller application via `becomeSellerAction`
- **Seller** — manages products, orders, payouts, and coupons
- **Admin** — approves or suspends seller stores

### 9.2 Become a Seller Scenario

```
1. User visits /sellers → clicks "Become a Seller"
2. Fills BecomeSellerForm (store name, description, category, logo)
3. becomeSellerAction(input)
   a. storeRepository.create({ ...data, ownerId: uid, status: 'pending' })
   b. Notification sent to admin: new seller application
4. User sees "Application under review" message
5. Admin reviews in AdminStoresView → approves or rejects
6. adminUpdateStoreStatusAction({ uid, status: 'approved' })
   a. storeRepository.update(storeId, { status: 'approved' })
   b. userRepository.update(uid, { role: 'seller' })
   c. Notification: 'store_approved' sent to applicant
```

### 9.3 Seller Product Management

**Create product:** see §3.3  
**Edit product:**

```
1. Seller opens product in SellerEditProductView
2. Updates form fields; new media can be added/removed
3. useUpdateSellerProduct → PUT /api/seller/products/[id]
   a. Only owning seller's products are returned/editable (enforced via sellerId filter)
   b. Media diff: removed images deleted from Storage; new images uploaded
4. Product updated in Firestore
```

**Delete product:**

```
1. Seller triggers delete (ConfirmDeleteModal prompt)
2. DELETE /api/seller/products/[id]
   a. Validates no active orders for this product
   b. Removes product from Firestore + deletes Storage media
   c. Removes from Algolia search index
```

### 9.4 Seller Dashboard KPIs

Data aggregated from `GET /api/seller/analytics`:

- Revenue (last 30 days)
- Order count (last 30 days)
- Active product count
- Conversion rate (views → orders)
- Top 5 products by revenue
- Last 5 recently added products

---

## 10. Payouts

### 10.1 Actors

- **Seller** — requests a payout for delivered orders with settled payments
- **Admin** — approves or rejects payout requests
- **System** — transfers funds to the seller's registered bank account

### 10.2 Payout Status Lifecycle

```
pending  ← seller submits request
   │
   ▼
approved ← admin approves
   │
   ▼
paid     ← funds transferred by admin

(alternative)
rejected ← admin rejects with note
```

### 10.3 Request Payout Scenario

```
1. Seller opens SellerPayoutsView
2. Selects delivered orders to include
3. Checks total ≥ ₹500 minimum
4. useBulkRequestPayout → POST /api/seller/orders/bulk
   a. Validates payout settings exist (bank account configured)
   b. Validates all selected orders are 'delivered' and not already included in a payout
   c. payoutRepository.create({ sellerId, orderIds, amount, status: 'pending' })
5. Seller sees new payout record with status 'pending'
```

**Rules:**

- Minimum payout amount: ₹500
- Seller must have bank account details saved in `SellerPayoutSettingsView` before requesting
- Each delivered order can only be included in one payout request

### 10.4 Admin Approves Payout Scenario

```
1. Admin sees pending payout in AdminPayoutsView (also flagged in AdminPriorityAlerts)
2. Fills PayoutStatusForm { status: 'approved' | 'rejected', note }
3. adminUpdatePayoutAction({ id, status, note })
   a. payoutRepository.update(payoutId, { status, note, processedAt })
   b. Notification sent to seller: 'payout_approved' or 'payout_rejected'
4. Admin manually transfers funds to bank account and marks as 'paid'
```

---

## 11. Reviews & Ratings

### 11.1 Actors

- **User** — writes a review after a verified purchase
- **Admin** — moderates all reviews (approve / reject)
- **Seller** — sees reviews for their products (read-only)

### 11.2 Review Status Lifecycle

```
pending  ← submitted but not yet moderated
   │
approved ← admin approves → publicly visible
   │
rejected ← admin rejects → hidden from public
```

### 11.3 Write a Review Scenario

```
1. User opens product detail page → clicks "Write a Review"
2. System validates: user has at least one delivered order containing this product
3. ReviewModal appears: { rating (1–5 stars), title, body }
4. createReviewAction({ productId, rating, title, body })
   a. Reviews are saved with status: 'pending'
   b. Review visible only to author and admin
5. Admin sees pending review in AdminReviewsView (flagged in AdminPriorityAlerts)
6. adminUpdateReviewAction({ id, status: 'approved' })
   a. Review becomes publicly visible
   b. 'review_approved' notification sent to reviewer
   c. RC credited to reviewer (reward for verified review)
   d. Product rating aggregate recalculated
```

**Rules:**

- Only users with a delivered order for the product can submit a review (verified purchase gate)
- One review per user per product
- Editing within 30 days resets status to `pending` (re-moderation required)
- Soft-delete only (`deleteReviewAction` hides; does not destroy)

### 11.4 Helpful Votes Scenario

```
1. User clicks "Helpful" or "Unhelpful" on a ReviewCard
2. voteReviewHelpfulAction({ reviewId, vote })
   a. One vote per user per review enforced
   b. Increments/decrements helpfulCount on the review document
3. Reviews can be sorted by helpfulCount (most helpful first)
```

---

## 12. Coupons & Promotions

### 12.1 Actors

- **Admin** — manages platform-wide coupons applicable to any order
- **Seller** — manages store-scoped coupons applicable to their products only
- **User** — applies coupon codes at cart / checkout

### 12.2 Coupon Scopes

| Scope           | Creator | Applies to                  |
| --------------- | ------- | --------------------------- |
| Platform coupon | Admin   | Any order, any seller       |
| Seller coupon   | Seller  | That seller's products only |

### 12.3 Coupon Validation Rules (server-side)

All checks run inside `validateCouponForCartAction`:

1. Coupon document exists in Firestore
2. Status is `active`
3. `expiresAt > now`
4. Global usage count < `maxUses` (if set)
5. Per-user usage count < `maxUsesPerUser` (if set)
6. `cartTotal ≥ minOrderAmount` (if set)
7. At least one cart item matches `applicableProducts` (if scoped — else applies to all)

### 12.4 Applying a Coupon Scenario

```
1. User enters code in PromoCodeInput → clicks "Apply"
2. validateCouponForCartAction (see §12.3)
3. On success:
   - CartSummary shows discount line
   - couponCode stored in checkout state
4. On order placement: server re-validates coupon + increments usageCount
5. Discount amount deducted from order total (not from seller payout — admin absorbs)
```

### 12.5 Promotions Page

- `/promotions` displays featured active coupons as `CouponCard` grids
- Each card shows coupon code (copy button), discount type, expiry, minimum amount
- Products linked to the promotion are shown in a horizontal `ProductSection` below

---

## 13. RC (Virtual Currency)

### 13.1 Actors

- **User** — earns RC passively; buys RC; spends RC at checkout
- **Admin** — manually credits or debits RC for any user

### 13.2 Earning RC

| Trigger                       | Amount                                              |
| ----------------------------- | --------------------------------------------------- |
| Place an order                | Calculated from order total (rate in site settings) |
| Write an approved review      | Fixed amount (configured in site settings)          |
| Refer a new user (if enabled) | Fixed amount                                        |
| Admin manual credit           | Any amount                                          |

### 13.3 Purchasing RC Scenario

```
1. User opens /user/rc/purchase → sees package options (e.g. 100 coins = ₹50)
2. User selects package → BuyRCModal opens
3. POST /api/rc/purchase { packageId }
   a. Razorpay order created → returns { razorpayOrderId, amount }
4. Razorpay checkout opens; user pays
5. On success: POST /api/rc/purchase/verify { razorpayOrderId, paymentId, signature }
   a. HMAC SHA256 signature verified (timingSafeEqual)
   b. rcRepository.credit(userId, coins)
   c. Transaction record created
   d. Notification: 'coins_credited' sent to user
6. RCBalanceChip refreshes
```

### 13.4 Spending RC at Checkout

```
1. User enables RC payment in CheckoutPaymentMethod
2. Slider: choose how many coins to use (≤ available balance)
3. Conversion: coinsUsed ÷ conversionRate = discount amount (₹)
4. Remaining balance (if any) charged via Razorpay/COD
5. On order confirmation: rcRepository.debit(userId, coinsUsed)
6. On order cancellation: rcRepository.credit(userId, coinsUsed) — reversal
```

### 13.5 Admin RC Adjustment Scenario

```
1. Admin opens RCAdjustModal from AdminUsersView
2. Enters amount (positive = credit, negative = debit) + reason (mandatory)
3. adminAdjustRCAction({ userId, amount, reason })
   a. rcRepository.adjust(userId, amount)
   b. Transaction record created with reason + adminId
   c. Notification: 'coins_credited' (or debit notice) sent to user
```

---

## 14. Events & Campaigns

### 14.1 Actors

- **Admin** — creates and manages all events; moderates entries
- **User** — discovers and participates in events

### 14.2 Event Types

| Type       | Participation mechanism              |
| ---------- | ------------------------------------ |
| `poll`     | Select one option; one vote per user |
| `survey`   | Fill multi-question dynamic form     |
| `feedback` | Star rating + free-text comment      |
| `sale`     | Informational time-limited sale page |
| `offer`    | Special offer tied to a purchase     |

### 14.3 Event Status Lifecycle

```
draft → published → active → ended → archived
```

All transitions are admin-controlled via `changeEventStatusAction`.

### 14.4 Event Participation Scenario

```
1. User opens EventDetailView → clicks participation CTA
2. Route: /events/[id]/participate
3. Participation UI dispatched by event type:
   - poll    → PollVotingSection (radio select → usePollVote)
   - survey  → SurveyEventSection (SurveyFieldBuilder dynamic form)
   - feedback → FeedbackEventSection (star + text → useFeedbackSubmit)
4. On submit: entry saved with status: 'pending'
5. Admin reviews in AdminEventEntriesView:
   - adminUpdateEventEntryAction({ entryId, status: 'approved' | 'rejected', note? })
6. EventLeaderboard updates in real-time for active events
```

**Rules:**

- One entry per user per event
- Some events can be coin-gated (spending RC to enter)

### 14.5 Admin Manages Events Scenario

```
1. Admin opens AdminEventsView → "Create Event"
2. EventFormDrawer: fill common fields + type-specific config
3. createEventAction(input) → event saved as 'draft'
4. Admin publishes: changeEventStatusAction({ id, status: 'published' })
5. Event appears on /events page
6. Admin activates: changeEventStatusAction({ id, status: 'active' })
7. After end date: changeEventStatusAction({ id, status: 'ended' })
```

---

## 15. Blog & Content

### 15.1 Actors

- **Admin** — creates, edits, and publishes blog posts
- **Guest / User** — reads published articles

### 15.2 Blog Post Lifecycle

```
draft → published (publicly visible)
  └→ deleted (permanent)
```

### 15.3 Publish a Blog Post Scenario

```
1. Admin opens AdminBlogView → "New Post"
2. BlogForm: title, slug (auto-generated), excerpt, content (ProseMirror rich text),
             cover image, categories, publishedAt, status
3. createBlogPostAction(input) → post saved with status: 'draft'
4. Admin sets status: 'published' → post appears at /blog/[slug]
5. SSR: BlogPostView calls blogRepository.getBySlug(slug) for initial render
```

**Content Safety Rules:**

- Rich text rendered via `proseMirrorToHtml` with `escapeHtml`
- Anchor tags validated against a link allowlist to prevent stored XSS

### 15.4 Static Content

- **Carousel slides** — hero banner slides managed by admin; `createCarouselSlideAction`, `updateCarouselSlideAction`, `deleteCarouselSlideAction`
- **FAQ** — users vote on helpfulness (`voteFaqAction`); admin manages CRUD; questions categorised
- **Homepage sections** — `SectionForm` in admin configures product-grid sections by filter rules (category, tags, min rating)

---

## 16. Notifications

### 16.1 Actors

- **System** — creates notifications server-side; no client-side notification writes
- **User** — reads, marks read, and deletes own notifications

### 16.2 Notification Types & Triggers

| Type              | Created by                                |
| ----------------- | ----------------------------------------- |
| `order_confirmed` | `POST /api/payment/verify` success        |
| `order_shipped`   | `POST /api/seller/orders/[id]/ship`       |
| `order_delivered` | ShipRocket webhook                        |
| `order_cancelled` | `cancelOrderAction`                       |
| `review_approved` | `adminUpdateReviewAction` approve         |
| `bid_outbid`      | `placeBidAction` (to previous top bidder) |
| `bid_won`         | Auction end scheduled job                 |
| `event_started`   | `changeEventStatusAction → active`        |
| `payout_approved` | `adminUpdatePayoutAction` approve         |
| `payout_rejected` | `adminUpdatePayoutAction` reject          |
| `coins_credited`  | RC purchase verify or admin adjustment    |
| `system`          | Admin broadcast                           |

### 16.3 Read / Delete Scenario

```
1. User opens NotificationBell (header) → dropdown shows last 5
2. Click notification → markNotificationReadAction({ id }) + navigate to related route
3. User goes to /user/notifications for full list
4. NotificationsBulkActions:
   - "Mark All as Read" → markAllNotificationsReadAction()
   - "Delete Read"      → deleteNotificationAction for each read notification
```

---

## 17. Search

### 17.1 Actors

- **Guest / User** — searches the product catalogue and pages
- **Admin** — manages the Algolia index

### 17.2 Search Scenario

```
1. User types in the Navbar Search bar
2. Input debounced 300ms → useNavSuggestions(query)
   → GET /api/search?nav=1 (server proxies to Algolia; API key not exposed)
   → Dropdown shows product/page suggestions
3. User presses Enter or clicks suggestion
   → Navigates to /search?q=... (URL-driven)
4. SearchView: useSearch(searchParams) → GET /api/search
   → Returns: hits[], nbHits, page, nbPages, facets
5. Filter chips (category, etc.) update URL params → re-query
```

### 17.3 Algolia Index Management Scenario

```
1. Admin opens /demo/algolia
2. "Sync Products" → POST /api/admin/algolia/sync
   → All active products indexed to Algolia (batch upsert)
3. "Sync Pages" → POST /api/admin/algolia/sync-pages
   → Static and blog pages indexed
4. "Clear" actions wipe the respective index (destructive; confirmation required)
```

**Rules:**

- Product deletions and deactivations must also update the Algolia index
- Index sync is manual (triggered by admin) — no real-time sync

---

## 18. Categories & Stores

### 18.1 Categories

**Hierarchy:** Top-level categories may have child sub-categories (max 2 levels).

**Admin Category CRUD Scenario:**

```
1. Admin opens AdminCategoriesView
2. Creates: createCategoryAction({ name, slug, image?, parentId? })
3. Slug is auto-generated from name (editable)
4. Delete rule: if category has child categories or products, cascade logic applies
```

**Public browsing:**

```
User visits /categories → grid of top-level categories
Clicks category → CategoryProductsView
  - Breadcrumb: parent → current
  - Sub-category chips if children exist
  - ProductGrid + URL-driven filters
```

### 18.2 Stores

**Store approval** is part of the seller onboarding (see §9.2).

**Public store browsing:**

```
User visits /stores → StoresListView (search by name, filter by category)
Clicks store → /stores/[storeSlug]
  → StoreHeader (banner, logo, name, rating)
  → StoreNavTabs: Products | Auctions | Reviews | About
  → "Message Seller" → opens chat
```

---

## 19. Admin Platform Management

### 19.1 User Management Scenario

```
Actors: Admin
1. Admin opens AdminUsersView → DataTable of all users
2. Filter by role, status, date
3. Actions per user:
   - adminUpdateUserAction({ uid, role?, status? })
     → Change role (user/seller/admin) or suspend/reinstate account
   - adminDeleteUserAction({ uid })
     → Permanently deletes user from Firebase Auth + Firestore
     → WARNING: irreversible; all orders/reviews retain userId reference
   - RCAdjustModal → adminAdjustRCAction (see §13.5)
   - revokeUserSessionsAction({ userId }) → all active sessions invalidated
```

### 19.2 Site Settings Scenario

```
1. Admin opens /admin/site (SiteSettingsView)
2. Configures:
   - Platform name, logo, contact email
   - RC earn rate (coins per ₹ spent) and conversion rate (coins → ₹ discount)
   - RC purchase packages (coins, price)
   - Razorpay / Resend credentials (AES-256-GCM encrypted in Firestore siteSettings doc)
   - Maintenance mode toggle
3. Changes take effect immediately (no deployment needed)
```

**Security:** Provider credentials (API keys) are stored AES-256-GCM encrypted in Firestore. The server decrypts at runtime — keys are never exposed to the client.

### 19.3 Feature Flags Scenario

```
1. Admin opens /admin/feature-flags
2. Toggles feature on/off (e.g. referral program, coin-gated events, COD)
3. Changes stored in Firestore and read by middleware / hooks at request time
```

### 19.4 Admin Priority Alerts

Admin dashboard surfaces items needing action:

- Pending reviews awaiting moderation
- Pending payout requests
- New seller applications
- Failed payment webhooks

---

## 20. Cross-Cutting Rules

### 20.1 Security Invariants

| Rule                         | Detail                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------- |
| No Firebase client SDK in UI | All Firestore / Storage / Auth calls are server-only via Admin SDK           |
| HMAC payment verification    | Razorpay signatures verified with `timingSafeEqual` (constant-time)          |
| Rate limiting                | Upstash Redis rate-limits sensitive endpoints (auth, OTP verification, bids) |
| Magic-byte MIME validation   | File uploads validated by file content, not extension                        |
| SSRF prevention              | `sourceUrl` in media crop/trim endpoints validated against an allowlist      |
| Stored XSS prevention        | ProseMirror HTML output sanitised via `escapeHtml` + anchor link allowlist   |
| AES-256-GCM at rest          | Provider API credentials encrypted before storing in Firestore               |
| CSP nonces                   | Content Security Policy uses per-request nonces (not `unsafe-inline`)        |

### 20.2 Data Flow Invariants

| Rule                                                                  | Detail                                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Reads: Hook → apiClient → API route → Repository → Firestore          | Never call Firestore directly from an API route                                                  |
| Mutations: component → Server Action → Repository → Firestore         | Never POST from a component; never call apiClient for mutations                                  |
| File uploads: stage locally → FormData to server → backend to Storage | Never upload from browser to Storage directly                                                    |
| Filter / sort / page state in URL                                     | `useUrlTable` always; never `useState` for table params                                          |
| Cart coupon re-validated at order creation                            | Client-side coupon state is not trusted; server re-validates on `POST /api/payment/create-order` |

### 20.3 State Consistency Rules

| Scenario                      | Consistency mechanism                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Auction bids                  | Firestore + RTDB updated atomically inside `placeBidAction`                               |
| Order + RC + cart on checkout | All mutations in single Server Action; `revalidatePath` busts React cache                 |
| Coupon usage count            | Incremented atomically via Firestore transaction on order creation                        |
| RC balance                    | All credits and debits go through `rcRepository` (single writer); no direct field updates |
| Order cancellation            | Refund + RC reversal + status update in a single Server Action                            |

### 20.4 Notification Invariants

- Notifications are always created by the **server** (API routes / Server Actions / scheduled jobs)
- Clients only **read, mark-read, and delete** their own notifications
- No notification is written directly from a client component

### 20.5 Role Escalation Prevention

- `role` field in user Firestore document is only writable by `adminUpdateUserAction` (admin-only action)
- Seller role is granted only through the store approval flow by an admin
- Middleware RBAC check happens server-side on every request using the decoded `__session` cookie

### 20.6 Deletion Rules

| Entity       | Deletion type | Notes                                                                 |
| ------------ | ------------- | --------------------------------------------------------------------- |
| User         | Hard delete   | Firebase Auth + Firestore; orders/reviews retain `userId` reference   |
| Product      | Hard delete   | Blocked if active orders exist; removes Storage media + Algolia entry |
| Review       | Soft delete   | Hidden from public; retained for audit                                |
| Order        | Not deletable | Permanent record for financial audit trail                            |
| Payout       | Not deletable | Permanent record                                                      |
| Blog post    | Hard delete   | Admin only                                                            |
| Notification | Hard delete   | User-initiated for own notifications                                  |
