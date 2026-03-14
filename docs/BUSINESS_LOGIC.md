# Business Logic Reference

> Complete documentation of LetItRip's business domain, actors, rules, and scenario flows.  
> Architecture & technical reference: [`docs/architecture.md`](architecture.md) Â· [`docs/GUIDE.md`](../README.md)  
> Last updated: 2026-03-14

---

## Table of Contents

1. [Actors & Roles](#1-actors--roles)
2. [Authentication & Sessions](#2-authentication--sessions)
3. [Product Catalogue](#3-product-catalogue)
4. [Auctions](#4-auctions)
5. [Pre-Orders](#5-pre-orders)
6. [Make-an-Offer (Negotiation)](#6-make-an-offer-negotiation)
7. [Cart](#7-cart)
8. [Checkout & Payment](#8-checkout--payment)
9. [Orders](#9-orders)
10. [Refunds](#10-refunds)
11. [Seller Portal](#11-seller-portal)
12. [Payouts](#12-payouts)
13. [Reviews & Ratings](#13-reviews--ratings)
14. [Coupons & Promotions](#14-coupons--promotions)
15. [Events & Campaigns](#15-events--campaigns)
16. [Blog & Content](#16-blog--content)
17. [Chat & Messaging](#17-chat--messaging)
18. [Notifications](#18-notifications)
19. [Search](#19-search)
20. [Categories & Stores](#20-categories--stores)
21. [Wishlist](#21-wishlist)
22. [Newsletter & Contact](#22-newsletter--contact)
23. [Admin Platform Management](#23-admin-platform-management)
24. [Informational & Static Pages](#24-informational--static-pages)
25. [Cross-Cutting Rules](#25-cross-cutting-rules)

---

## 1. Actors & Roles

### Role Hierarchy

```
guest          Unauthenticated browser visitor
  â””â”€ user      Signed-in buyer (default role after registration)
       â””â”€ seller  Buyer who applied and was approved as a store owner
            â””â”€ admin   Platform operator with full cross-cutting access
```

### Actor Capabilities Summary

| Capability                          | Guest | User | Seller | Admin |
| ----------------------------------- | :---: | :--: | :----: | :---: |
| Browse catalogue & search           |  âœ“  | âœ“  |  âœ“   |  âœ“  |
| Add to guest cart (localStorage)    |  âœ“  | â€”  |  â€”   |  â€”  |
| Subscribe to newsletter             |  âœ“  | âœ“  |  âœ“   |  âœ“  |
| Send a contact message              |  âœ“  | âœ“  |  âœ“   |  âœ“  |
| Add to server cart                  |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Place orders / checkout             |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Write reviews (verified purchase)   |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Participate in events               |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Make an offer on a product          |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Manage own wishlist                 |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Send/receive chat messages          |  â€”  | âœ“  |  âœ“   |  âœ“  |
| Manage own store & products         |  â€”  | â€”  |  âœ“   |  âœ“  |
| Respond to / counter offers         |  â€”  | â€”  |  âœ“   |  âœ“  |
| Ship orders & request payouts       |  â€”  | â€”  |  âœ“   |  âœ“  |
| Manage store-scoped coupons         |  â€”  | â€”  |  âœ“   |  â€”  |
| Manage platform-wide content        |  â€”  | â€”  |  â€”   |  âœ“  |
| Approve/reject sellers, reviews     |  â€”  | â€”  |  â€”   |  âœ“  |
| Override order statuses             |  â€”  | â€”  |  â€”   |  âœ“  |
| Issue partial refunds               |  â€”  | â€”  |  â€”   |  âœ“  |
| Manage platform-wide coupons        |  â€”  | â€”  |  â€”   |  âœ“  |
| Manage homepage carousel & sections |  â€”  | â€”  |  â€”   |  âœ“  |
| Revoke sessions                     |  â€”  | â€”  |  â€”   |  âœ“  |

---

## 2. Authentication & Sessions

### 2.1 Actors

- **Guest** â€” attempts to sign in or register
- **User / Seller / Admin** â€” manages active session
- **System** â€” Firebase Admin SDK validates tokens; middleware enforces route guards

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
2. Client SDK signs in â†’ receives Firebase idToken
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
2. GET /api/auth/google/start â†’ build OAuth URL â†’ redirect to Google
3. Google redirects to /api/auth/google/callback?code=...
4. Exchange code for idToken â†’ Firebase Admin verifyIdToken
5. Upsert user in Firestore (create if new, update lastLogin if existing)
6. Create session â†’ Set __session cookie â†’ redirect to dashboard
```

### 2.5 Logout Scenario

```
1. User triggers logout
2. POST /api/auth/logout
   a. sessionRepository.delete(sessionId)
   b. Clear-Cookie: __session
3. AuthContext.clear() â†’ user is guest again
```

### 2.6 Password Reset Scenario

```
1. Guest enters email in ForgotPasswordView
2. POST /api/auth/forgot-password
   a. passwordResetTokenRepository.create({ email, token (UUID), expiresAt: +1hr })
   b. Send email via Resend with reset link: /auth/reset-password?token=...
3. User clicks link â†’ ResetPasswordView loads
4. POST /api/auth/reset-password { token, newPassword }
   a. passwordResetTokenRepository.findValid(token) â€” must exist, not expired, not used
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
3. Resend OTP: POST /api/auth/send-verification â†’ new OTP + email
```

### 2.8 Route Guard Rules

- `middleware.ts` intercepts every request and validates `__session`
- Routes protected by `RBAC_CONFIG` â€” each protected route has a minimum required role
- Unauthenticated requests to protected routes â†’ redirect `/auth/login`
- Authenticated requests with insufficient role â†’ redirect `/unauthorized`

### 2.9 Session Management

- Each session stores: `sessionId`, `userId`, `device` (user-agent), `ip`, `createdAt`
- Admin can revoke individual session (`revokeSessionAction`) or all sessions for a user (`revokeUserSessionsAction`)
- Sessions are validated on every request through the `__session` cookie

---

## 3. Product Catalogue

### 3.1 Actors

- **Guest / User** â€” browse and view products
- **Seller** â€” create and manage own products
- **Admin** â€” create, edit, or delete any product

### 3.2 Product Types

| Type      | Field value   | Purchase mechanism              |
| --------- | ------------- | ------------------------------- |
| Standard  | `'product'`   | Add to cart â†’ checkout        |
| Auction   | `'auction'`   | Bid â†’ win â†’ checkout        |
| Pre-Order | `'pre-order'` | Reserve â†’ pay deposit or full |

All three share the same Firestore `products` collection, differentiated by the `type` field.

### 3.3 Product Creation (Seller) Scenario

```
1. Seller opens /seller/products/new
2. Fills ProductForm:
   - Basic info (name, description, brand)
   - Category (select or inline-create)
   - Media (up to 10 images + 1 video â€” staged locally, submitted as FormData)
   - Pricing (price, compare-at-price, bulk discount tiers)
   - Inventory (SKU, stock, weight, dimensions)
   - Type-specific settings (auction dates/min-bid, pre-order deposit)
   - SEO (title override, meta description)
3. Submit â†’ POST /api/seller/products
   a. Files uploaded to Firebase Storage on the backend
   b. productRepository.create({ ...data, sellerId, storeId, status: 'active' })
4. Seller redirected to product list
```

**Rules:**

- Images are staged locally in the browser â†’ submitted as FormData to backend â†’ backend uploads to Firebase Storage (never client-side upload)
- Media upload validates magic bytes for MIME type (not just extension)
- Only the owning seller (or admin) can edit or delete a product

### 3.4 Product Listing Scenario

```
1. User/Guest visits /products (or /auctions, /pre-orders, a category page, or a store page)
2. URL params drive filtering: page, pageSize, sort, category, minPrice, maxPrice, brand, rating
3. RSC page calls productRepository.findMany(params) â†’ passes initialData to ProductsView
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

- **User** â€” places bids on active auctions
- **Seller** â€” creates an auction-type product with start/end dates and a minimum bid
- **Admin** â€” oversees all bids; can update auction product fields
- **System** â€” Firebase RTDB holds live bid state; scheduled job ends auctions at `endTime`

### 4.2 Auction Lifecycle

```
upcoming  â† endTime has not been reached, auction not yet started
  â”‚
  â–¼
active    â† startTime reached; bidding is open
  â”‚
  â–¼
ended     â† endTime reached (scheduler transitions status)
  â”‚
  â–¼
winner notified â†’ checkout flow for winning bidder
```

### 4.3 Placing a Bid Scenario

```
1. User opens AuctionDetailView (/auctions/[id])
2. Live current bid shown via useRealtimeBids (Firebase RTDB)
3. User fills PlaceBidForm { amount }
4. Client-side validation:
   - amount â‰¥ currentBid + minimumIncrement
   - user is NOT already the highest bidder
   - auction status is 'active'
5. Submit â†’ placeBidAction({ auctionId, amount })
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
6. Winner directed to checkout â†’ order placed at winning bid price
```

---

## 5. Pre-Orders

### 5.1 Actors

- **User** â€” reserves a pre-order product
- **Seller** â€” creates a pre-order product with an availability date and optional deposit amount

### 5.2 Pre-Order Scenario

```
1. User views pre-order product â†’ sees "Available on [date]" info
2. User clicks "Pre-Order" â†’ adds to cart with pre-order flag
3. Checkout proceeds normally; payment is captured at full price or deposit only (seller config)
4. Order created with status: 'pre_order'
5. When product becomes available, seller marks it ready â†’ order transitions to 'confirmed'
```

---

## 6. Make-an-Offer (Negotiation)

### 6.1 Actors

- **User (Buyer)** â€” initiates an offer
- **Seller** â€” reviews, accepts, declines, or counters the offer
- **System** â€” enforces rate limits; expires offers after 48 hours

### 6.2 Offer Status Lifecycle

```
pending    â† buyer has submitted an offer
   â”‚
   â”œâ”€â†’ accepted   â† seller accepts buyer's price â†’ buyer can checkout
   â”‚
   â”œâ”€â†’ declined   â† seller declines
   â”‚
   â”œâ”€â†’ countered  â† seller counters with new price
   â”‚       â”‚
   â”‚       â”œâ”€â†’ accepted (buyer accepts counter) â†’ checkout
   â”‚       â””â”€â†’ withdrawn  â† buyer withdraws counter
   â”‚
   â””â”€â†’ withdrawn  â† buyer withdraws original offer
   â””â”€â†’ expired    â† 48 hours pass without response
```

### 6.3 Offer Data Model

```
offers collection:
  buyerUid       â€” authenticated buyer
  sellerId       â€” owning seller
  productId      â€” target product
  offerAmount    â€” buyer's proposed price (â‚¹)
  counterAmount  â€” seller's counter price (set when status = 'countered')
  status         â€” pending | accepted | declined | countered | withdrawn | expired
  expiresAt      â€” 48 h from creation
  buyerNote      â€” optional free-text (max 300 chars)
  sellerNote     â€” optional response note (max 300 chars)
```

### 6.4 Make an Offer Scenario

```
1. Buyer visits a product detail page â†’ clicks "Make an Offer"
2. Fills OfferForm { offerAmount, buyerNote? }
3. makeOfferAction({ productId, offerAmount, buyerNote })
   a. Rate-limited (STRICT â€” Upstash Redis)
   b. Validates offer constraints (one active offer per product, 3 offer limit)
   c. Creates offer document (status: 'pending', expiresAt: +48h)
4. Seller receives 'new_offer' notification
5. Buyer sees offer in /user/offers with status 'pending'
```

### 6.5 Seller Responds to Offer Scenario

```
Accessed via /seller/offers â€” SellerOffersView

Accept:
  respondToOfferAction({ offerId, action: 'accept' })
  â†’ offer status â†’ 'accepted'
  â†’ buyer notified; buyer can now call checkoutOfferAction

Decline:
  respondToOfferAction({ offerId, action: 'decline', sellerNote? })
  â†’ offer status â†’ 'declined'
  â†’ buyer notified

Counter:
  respondToOfferAction({ offerId, action: 'counter', counterAmount, sellerNote? })
  â†’ offer status â†’ 'countered'
  â†’ buyer notified with counter price
```

### 6.6 Buyer Accepts Counter Scenario

```
1. Buyer sees counter in /user/offers
2. acceptCounterAction({ offerId })
   a. Validates offer status is 'countered'
   b. status â†’ 'accepted'
3. Buyer can now checkout
```

### 6.7 Checkout via Offer Scenario

```
1. Buyer calls checkoutOfferAction({ offerId })
   a. Validates offer status is 'accepted'
   b. Reads lockedPrice from offer document
   c. Adds product to cart with offerId + lockedPrice override
2. Buyer proceeds through normal checkout flow (Â§8)
3. On POST /api/payment/verify:
   â†’ Actual payment charged at lockedPrice via Razorpay / COD
```

### 6.8 Withdraw Offer Scenario

```
1. Buyer calls withdrawOfferAction({ offerId })
   a. Validates offer is in 'pending' or 'countered' state
   b. status â†’ 'withdrawn'
```

**Rules:**

- Rate-limited per user (STRICT preset)
- Offer expiry: 48 hours; cron job or lazy-check clears expired offers
- One active offer per buyer per product (existing active offer must be withdrawn first)

---

## 7. Cart

### 7.1 Actors

- **Guest** â€” uses a localStorage cart; can browse and build a cart without signing in
- **User** â€” uses a server-side Firestore cart

### 7.2 Guest Cart Scenario

```
1. Guest adds a product to cart
2. Item saved to localStorage via useGuestCart
3. Cart count badge reads from localStorage
4. Guest navigates to /cart â†’ GuestCartItemRow components rendered from localStorage
```

### 7.3 Guest Cart Merge on Login Scenario

```
1. Guest has items in localStorage cart
2. Guest signs in â†’ AuthContext detects login event
3. GuestCartMergerEffect calls mergeGuestCartAction(localItems)
4. Server merges: for each local item
   - If product exists in server cart â†’ add quantities
   - If not â†’ create new cart item
5. localStorage cart is cleared
6. User sees merged server cart
```

### 7.4 Server Cart Operations

| Action          | Rule                                                                        |
| --------------- | --------------------------------------------------------------------------- |
| Add item        | If item+variant already in cart â†’ increment quantity; else create new row |
| Update quantity | Minimum quantity: 1; maximum: available stock                               |
| Remove item     | Deletes the cart item document                                              |
| Clear cart      | Deletes all cart item documents for the user; called after order placement  |

### 7.5 Cart Coupon Application

```
1. User enters coupon code in PromoCodeInput
2. validateCouponForCartAction({ code, cartTotal, productIds })
   a. Coupon exists and is active
   b. Not expired (expiresAt > now)
   c. Usage limit not exceeded (globally and per user)
   d. Minimum order amount met by current cart total
   e. If scoped to products: at least one applicable product is in cart
3. Success â†’ discount amount shown in CartSummary
4. Discount applied at order creation time (server-side re-validation)
```

---

## 8. Checkout & Payment

### 8.1 Actors

- **User** â€” completes the checkout flow
- **System (Razorpay)** â€” processes payment and fires webhooks
- **System (ShipRocket)** â€” handles shipping fulfillment

### 8.2 Multi-Step Checkout Scenario

```
Step 1 â€” Address
  â†’ User selects saved address or creates a new one inline
  â†’ If recipient name â‰  account holder name â†’ third-party address detected
       â†’ Consent OTP flow required (see Â§8.3) before advancing

Step 2 â€” Order Review
  â†’ Cart items displayed with seller breakdown (order-splitter.ts)
  â†’ Applied coupon savings shown
  â†’ Estimated delivery date shown

Step 3 â€” Payment
  â†’ User selects payment method: Razorpay | COD
  â†’ Click "Place Order"
```

### 8.3 Third-Party Address Consent OTP Scenario

```
1. Address recipient name differs from account holder
2. Consent OTP required before Step 1 can advance
3. ConsentOtpModal appears:
   a. sendConsentOtpAction(addressId)
      â†’ Generates 6-digit code, stores in Firestore with 15-min expiry
      â†’ Sends email to account's registered email (not the recipient's)
      â†’ Rate limited: 15-min cooldown per user stored in users/{uid}/consentOtpRateLimit/meta
   b. User enters the OTP code
   c. verifyConsentOtpAction(addressId, code)
      â†’ Rate limited: 10 attempts per 5 minutes (Upstash)
      â†’ On success: marks OTP verified; checkout flow advances
      â†’ On failure: shows attempt count; locks after limit
4. Bypass credits: a user may bypass the 15-min cooldown up to 3 times;
   one credit is granted each time a partial order was placed
```

### 8.4 Razorpay Payment Scenario

```
1. POST /api/payment/create-order { cartId, couponCode? }
   a. Server re-validates cart and coupon
   b. Splits cart by seller (order-splitter.ts)
   c. Creates Razorpay order â†’ returns { orderId, amount }
2. Razorpay checkout widget opens in browser
3. User completes payment (card / UPI / netbanking)
4. On success: Razorpay calls POST /api/payment/verify { razorpayOrderId, paymentId, signature }
   a. HMAC SHA256 signature verified (timingSafeEqual)
   b. orderRepository.create({ items, sellerId, buyerId, address, coupon, total, status: 'confirmed' })
   c. cartRepository.clear(userId)
   d. couponRepository.incrementUsage(couponCode) if coupon used
   e. Notifications sent: 'order_confirmed' to buyer
```

### 8.5 Cash on Delivery Scenario

```
1. User selects COD payment
2. CheckoutOtpModal appears â€” OTP sent to registered phone/email
3. User enters OTP to confirm delivery consent
4. On verification: POST /api/checkout (COD flow)
   a. orderRepository.create({ ...data, paymentMethod: 'cod', status: 'confirmed' })
   b. cartRepository.clear(userId)
```

### 8.6 Partial Order Scenario (Out-of-Stock)

```
1. POST /api/checkout succeeds but some items had become unavailable
2. Response: { unavailableItems: [...] }
3. PartialOrderDialog appears:
   - "Proceed" â†’ place order with only available items
     â†’ user receives one consent-OTP bypass credit
   - "Cancel" â†’ user returns to cart to adjust quantities
```

---

## 9. Orders

### 9.1 Actors

- **User** â€” views history, tracks shipment, cancels pending orders
- **Seller** â€” processes, ships, and manages orders for their store
- **Admin** â€” full override on any order status
- **System (ShipRocket)** â€” delivery status webhooks

### 9.2 Order Status Lifecycle

```
pending_payment   â† order created, payment not yet captured
      â”‚
      â–¼
  confirmed       â† payment verified (Razorpay webhook or COD OTP)
      â”‚
      â–¼
  processing      â† seller is preparing the shipment
      â”‚
      â–¼
   shipped        â† seller ships; ShipRocket AWB assigned
      â”‚
      â–¼
  delivered       â† ShipRocket delivery webhook fires
      â”‚
      â–¼
  completed       â† auto-transition after delivery + return window closes

 (from any state) â†’ cancelled  â† user (only from pending_payment / confirmed)
                              â† admin (any state)
 (from any state) â†’ refunded   â† admin only
```

### 9.3 User Cancels Order Scenario

```
1. User opens OrderDetailView
2. "Cancel Order" CTA visible only when status is 'pending_payment' or 'confirmed'
3. cancelOrderAction({ orderId })
   a. Validates status is cancellable
   b. orderRepository.update(orderId, { status: 'cancelled' })
   c. If payment was made â†’ refund initiated via Razorpay Refunds API
   d. Notification: 'order_cancelled' sent to buyer
```

### 9.4 Seller Ships Order Scenario

```
1. Seller opens SellerOrdersView; clicks "Ship" on a confirmed order
2. useShipOrder â†’ POST /api/seller/orders/[id]/ship
   a. ShipRocket API: create shipment, assign AWB
   b. orderRepository.update(orderId, { status: 'shipped', awb, courier, trackingUrl })
3. Buyer receives 'order_shipped' notification
4. Seller order card now shows AWB number + shipment link
```

### 9.5 Admin Order Override Scenario

```
1. Admin opens AdminOrdersView â†’ selects order
2. Fills OrderStatusForm { status, note }
3. adminUpdateOrderAction({ id, status, note })
   a. Status updated regardless of current state (admin override)
   b. Note stored as an internal audit trail entry
   c. If refunded: Razorpay refund API called
```

### 9.6 Invoice Generation

```
GET /api/orders/[id]/invoice
  â†’ Validates requesting user is the buyer, seller, or admin
  â†’ Generates PDF invoice with order items, tax breakdown, addresses
  â†’ Returns streamed PDF response
```

---

## 10. Refunds

### 10.1 Actors

- **Admin** â€” initiates partial or full refunds via `adminPartialRefundAction`
- **System** â€” automatic refund triggered when a user cancels a paid order
- **Razorpay** â€” processes the actual fund transfer back to buyer

### 10.2 Refund Status on Order

```
order.refundStatus:
  none        â† default; no refund issued
  processing  â† refund initiated; awaiting Razorpay confirmation
  completed   â† funds successfully returned to buyer
```

### 10.3 Admin Partial Refund Scenario

```
1. Admin opens AdminOrdersView â†’ selects a paid order
2. adminPartialRefundAction({ orderId, deductFees, refundNote? })
   a. Rate-limited (STRICT â€” Upstash Redis per admin uid)
   b. Validates order.paymentStatus === 'paid' and refundStatus !== 'completed'
   c. Fetches processing fee from siteSettings.commissions.processingFeePercent
      â†’ fallback: 2.36% (Razorpay standard)
   d. Calculates:
        grossRefund  = order.total
        feeDeducted  = deductFees ? grossRefund Ã— feePercent / 100 : 0
        netRefund    = grossRefund âˆ’ feeDeducted
   e. orderRepository.update(orderId, { refundStatus: 'processing', refundNote })
   f. Notification: 'refund_initiated' sent to buyer
3. Admin manually processes refund via Razorpay dashboard (or automated via API)
4. Returns { orderId, grossRefund, feeDeducted, netRefund, currency }
```

### 10.4 Automatic Refund on Order Cancellation

```
1. User calls cancelOrderAction (see Â§9.3)
2. If order.paymentStatus === 'paid':
   â†’ Razorpay Refunds API called automatically
   â†’ order.refundStatus â†’ 'processing'
3. Buyer notified via 'order_cancelled' notification
```

**Rules:**

- Only paid orders can be refunded
- An already-completed refund cannot be reissued
- `deductFees: false` grants a full refund (admin discretion)
- Per-admin rate-limited (STRICT preset) to prevent misuse

---

## 11. Seller Portal

### 11.1 Actors

- **User (applying)** â€” submits a seller application via `becomeSellerAction`
- **Seller** â€” manages products, orders, payouts, and coupons
- **Admin** â€” approves or suspends seller stores

### 11.2 Become a Seller Scenario

```
1. User visits /sellers â†’ clicks "Become a Seller"
2. Fills BecomeSellerForm (store name, description, category, logo)
3. becomeSellerAction(input)
   a. storeRepository.create({ ...data, ownerId: uid, status: 'pending' })
   b. Notification sent to admin: new seller application
4. User sees "Application under review" message
5. Admin reviews in AdminStoresView â†’ approves or rejects
6. adminUpdateStoreStatusAction({ uid, status: 'approved' })
   a. storeRepository.update(storeId, { status: 'approved' })
   b. userRepository.update(uid, { role: 'seller' })
   c. Notification: 'store_approved' sent to applicant
```

### 11.3 Seller Product Management

**Create product:** see Â§3.3  
**Edit product:**

```
1. Seller opens product in SellerEditProductView
2. Updates form fields; new media can be added/removed
3. useUpdateSellerProduct â†’ PUT /api/seller/products/[id]
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

### 11.4 Seller Dashboard KPIs

Data aggregated from `GET /api/seller/analytics` via `useSellerAnalytics`:

- Revenue (last 30 days, 7 days, all-time)
- Order count (last 30 days)
- Active product count
- Conversion rate (views â†’ orders)
- Top 5 products by revenue
- Pending offers count
- Last 5 recently added products

### 11.5 Seller Offers Management

Sellers receive and respond to buyer offers from `/seller/offers` (SellerOffersView).

```
1. useSellerOffers() loads incoming offers via useQuery â†’ apiClient â†’ GET /api/seller/offers
2. Seller sees: product image, buyer, offer amount, status, buyer note, expiry countdown
3. Actions:
   - respondToOfferAction({ offerId, action: 'accept' })
   - respondToOfferAction({ offerId, action: 'decline', sellerNote? })
   - respondToOfferAction({ offerId, action: 'counter', counterAmount, sellerNote? })
4. Full offer lifecycle documented in Â§6
```

### 11.6 Seller Shipping Configuration

```
1. Seller opens /seller/shipping â†’ SellerShippingView
2. useSellerShipping() loads ShipRocket config
3. updateSellerShippingConfigAction({ warehouseAddress, defaultCourier, handlingDays })
4. Config stored in Firestore; used when creating ShipRocket shipments
```

### 11.7 Seller Analytics

```
Route: /seller/analytics â€” SellerAnalyticsView
Data: useSellerAnalytics() â†’ GET /api/seller/analytics
Metrics: revenue trend, order volume, product views, top-performing products
```

---

## 12. Payouts

### 12.0 Platform Day Definition

A **platform day** starts at **10:00 AM IST** every day. Any delivery confirmed before 10 AM IST counts from that same day's 10 AM start. Day 1 = the next upcoming 10 AM IST after the event.

- `getBusinessDayCutoff(n)` in `functions/src/utils/businessDay.ts` â€” used by Firestore queries
- `getBusinessDaysRemaining(since, n)` in `src/utils/business-day.ts` â€” used by UI countdowns

### 12.1 Actors

- **Seller** â€” requests a payout for delivered orders with settled payments
- **Admin** â€” approves or rejects payout requests
- **System** â€” auto-payout job at 10:00 AM IST daily; transfers funds to the seller's registered bank account

### 12.2 Payout Status Lifecycle

```
pending  â† seller submits request
   â”‚
   â–¼
approved â† admin approves
   â”‚
   â–¼
paid     â† funds transferred by admin

(alternative)
rejected â† admin rejects with note
```

### 12.3 Request Payout Scenario

```
1. Seller opens SellerPayoutsView
2. Selects delivered orders to include
3. Checks total â‰¥ â‚¹500 minimum
4. useBulkRequestPayout â†’ POST /api/seller/orders/bulk
   a. Validates payout settings exist (bank account configured)
   b. Validates all selected orders are 'delivered' and not already included in a payout
   c. payoutRepository.create({ sellerId, orderIds, amount, status: 'pending' })
5. Seller sees new payout record with status 'pending'
```

**Rules:**

- Minimum payout amount: â‚¹500
- Seller must have bank account details saved in `SellerPayoutSettingsView` before requesting
- Each delivered order can only be included in one payout request
- An order's `payoutStatus` becomes `eligible` after **7 platform days** (10:00 AM IST boundaries) have elapsed since delivery
- Auto-payout runs on `DAILY_0430_UTC` (10:00 AM IST) via `autoPayoutEligibility` Cloud Function

### 12.4 Admin Approves Payout Scenario

```
1. Admin sees pending payout in AdminPayoutsView (also flagged in AdminPriorityAlerts)
2. Fills PayoutStatusForm { status: 'approved' | 'rejected', note }
3. adminUpdatePayoutAction({ id, status, note })
   a. payoutRepository.update(payoutId, { status, note, processedAt })
   b. Notification sent to seller: 'payout_approved' or 'payout_rejected'
4. Admin manually transfers funds to bank account and marks as 'paid'
```

---

## 13. Reviews & Ratings

### 13.1 Actors

- **User** â€” writes a review after a verified purchase
- **Admin** â€” moderates all reviews (approve / reject)
- **Seller** â€” sees reviews for their products (read-only)

### 13.2 Review Status Lifecycle

```
pending  â† submitted but not yet moderated
   â”‚
approved â† admin approves â†’ publicly visible
   â”‚
rejected â† admin rejects â†’ hidden from public
```

### 13.3 Write a Review Scenario

```
1. User opens product detail page â†’ clicks "Write a Review"
2. System validates: user has at least one delivered order containing this product
3. ReviewModal appears: { rating (1â€“5 stars), title, body }
4. createReviewAction({ productId, rating, title, body })
   a. Reviews are saved with status: 'pending'
   b. Review visible only to author and admin
5. Admin sees pending review in AdminReviewsView (flagged in AdminPriorityAlerts)
6. adminUpdateReviewAction({ id, status: 'approved' })
   a. Review becomes publicly visible
   b. 'review_approved' notification sent to reviewer
   c. Product rating aggregate recalculated
```

**Rules:**

- Only users with a delivered order for the product can submit a review (verified purchase gate)
- One review per user per product
- Editing within 30 days resets status to `pending` (re-moderation required)
- Soft-delete only (`deleteReviewAction` hides; does not destroy)

### 13.4 Helpful Votes Scenario

```
1. User clicks "Helpful" or "Unhelpful" on a ReviewCard
2. voteReviewHelpfulAction({ reviewId, vote })
   a. One vote per user per review enforced
   b. Increments/decrements helpfulCount on the review document
3. Reviews can be sorted by helpfulCount (most helpful first)
```

---

## 14. Coupons & Promotions

### 14.1 Actors

- **Admin** â€” manages platform-wide coupons applicable to any order
- **Seller** â€” manages store-scoped coupons applicable to their products only
- **User** â€” applies coupon codes at cart / checkout

### 14.2 Coupon Scopes

| Scope           | Creator | Code format                          | Applies to                                               |
| --------------- | ------- | ------------------------------------ | -------------------------------------------------------- |
| Platform coupon | Admin   | e.g. `SAVE10`                        | Any order, any seller; optional product/category scoping |
| Seller coupon   | Seller  | Auto-prefixed: `<STORE_SLUG>-<CODE>` | That seller's products only; optional auction-only flag  |

### 14.3 Coupon Validation Rules (server-side)

All checks run inside `validateCouponForCartAction`:

1. Coupon document exists in Firestore
2. Status is `active`
3. `expiresAt > now`
4. Global usage count < `maxUses` (if set)
5. Per-user usage count < `maxUsesPerUser` (if set)
6. `cartTotal â‰¥ minOrderAmount` (if set)
7. At least one cart item matches `applicableProducts` (if scoped â€” else applies to all)

### 14.4 Applying a Coupon Scenario

```
1. User enters code in PromoCodeInput â†’ clicks "Apply"
2. validateCouponForCartAction (see Â§14.3)
3. On success:
   - CartSummary shows discount line
   - couponCode stored in checkout state
4. On order placement: server re-validates coupon + increments usageCount
5. Discount amount deducted from order total (not from seller payout â€” admin absorbs)
```

### 14.5 Promotions Page

- `/promotions` displays featured active coupons as `CouponCard` grids
- Each card shows coupon code (copy button), discount type, expiry, minimum amount
- Products linked to the promotion are shown in a horizontal `ProductSection` below

---

---

## 15. Events & Campaigns

### 15.1 Actors

- **Admin** â€” creates and manages all events; moderates entries
- **User** â€” discovers and participates in events

### 15.2 Event Types

| Type       | Participation mechanism              |
| ---------- | ------------------------------------ |
| `poll`     | Select one option; one vote per user |
| `survey`   | Fill multi-question dynamic form     |
| `feedback` | Star rating + free-text comment      |
| `sale`     | Informational time-limited sale page |
| `offer`    | Special offer tied to a purchase     |

### 15.3 Event Status Lifecycle

```
draft â†’ published â†’ active â†’ ended â†’ archived
```

All transitions are admin-controlled via `changeEventStatusAction`.

### 15.4 Event Participation Scenario

```
1. User opens EventDetailView â†’ clicks participation CTA
2. Route: /events/[id]/participate
3. Participation UI dispatched by event type:
   - poll    â†’ PollVotingSection (radio select â†’ usePollVote)
   - survey  â†’ SurveyEventSection (SurveyFieldBuilder dynamic form)
   - feedback â†’ FeedbackEventSection (star + text â†’ useFeedbackSubmit)
4. On submit: entry saved with status: 'pending'
5. Admin reviews in AdminEventEntriesView:
   - adminUpdateEventEntryAction({ entryId, status: 'approved' | 'rejected', note? })
6. EventLeaderboard updates in real-time for active events
```

**Rules:**

- One entry per user per event
- Some events can be coin-gated (spending RC to enter)

### 15.5 Admin Manages Events Scenario

```
1. Admin opens AdminEventsView â†’ "Create Event"
2. EventFormDrawer: fill common fields + type-specific config
3. createEventAction(input) â†’ event saved as 'draft'
4. Admin publishes: changeEventStatusAction({ id, status: 'published' })
5. Event appears on /events page
6. Admin activates: changeEventStatusAction({ id, status: 'active' })
7. After end date: changeEventStatusAction({ id, status: 'ended' })
```

---

## 16. Blog & Content

### 16.1 Actors

- **Admin** â€” creates, edits, and publishes blog posts
- **Guest / User** â€” reads published articles

### 16.2 Blog Post Lifecycle

```
draft â†’ published (publicly visible)
  â””â†’ deleted (permanent)
```

### 16.3 Publish a Blog Post Scenario

```
1. Admin opens AdminBlogView â†’ "New Post"
2. BlogForm: title, slug (auto-generated), excerpt, content (ProseMirror rich text),
             cover image, categories, publishedAt, status
3. createBlogPostAction(input) â†’ post saved with status: 'draft'
4. Admin sets status: 'published' â†’ post appears at /blog/[slug]
5. SSR: BlogPostView calls blogRepository.getBySlug(slug) for initial render
```

**Content Safety Rules:**

- Rich text rendered via `proseMirrorToHtml` with `escapeHtml`
- Anchor tags validated against a link allowlist to prevent stored XSS

### 16.4 Static Content

- **Carousel slides** â€” hero banner slides managed by admin via `createCarouselSlideAction`, `updateCarouselSlideAction`, `deleteCarouselSlideAction`; each slide has desktop + mobile media, link URL, and active/inactive toggle
- **Homepage sections** â€” admin-configurable product-grid sections via `createHomepageSectionAction`; each section has a title, filter rules (category, tags, min rating), and display order
- **FAQ** â€” users vote on helpfulness (`voteFaqAction`); admin manages CRUD (`adminCreateFaqAction`, `adminUpdateFaqAction`, `adminDeleteFaqAction`); questions are categorised and filterable

---

## 17. Chat & Messaging

### 17.1 Actors

- **User (Buyer)** â€” initiates chat with seller after placing an order
- **Seller** â€” responds to buyer messages from `/seller/messages` or the order view
- **System** â€” chat is feature-flag gated (`FEATURE_FLAGS.CHAT_ENABLED`)

### 17.2 Architecture

```
Room metadata  â†’ Firestore: chatRooms/{roomId}
                   { buyerId, sellerId, orderId, lastMessage, updatedAt, deletedBy: [] }

Messages       â†’ Firebase RTDB: /chat_rooms/{roomId}/messages/{messageId}
                   { senderId, content, timestamp }

Custom tokens  â†’ getRealtimeTokenAction() â†’ Firebase Admin mints a custom token
                 â†’ client uses token to authenticate with RTDB for live streaming
```

### 17.3 Start a Chat Scenario

```
1. Buyer on OrderDetailView clicks "Message Seller"
2. createOrGetChatRoomAction({ orderId, sellerId })
   a. Rate-limited (STRICT)
   b. Feature-flag checked: CHAT_ENABLED must be true
   c. Validates order exists and buyer is authenticated
   d. idempotent: if room already exists for (orderId, sellerId, buyerId) â†’ return it
   e. If new: chatRepository.create({ buyerId, sellerId, orderId }) â†’ new room document
3. User navigated to /user/messages with roomId selected
```

### 17.4 Send a Message Scenario

```
1. User types in MessageInput â†’ sendChatMessageAction({ roomId, content })
   a. Rate-limited per user
   b. Validates user is a participant of the room
   c. Writes message to RTDB: /chat_rooms/{roomId}/messages/{newId}
   d. Updates chatRoom.lastMessage + chatRoom.updatedAt in Firestore
2. Recipient sees real-time message via RTDB listener (useRealtimeChat)
```

### 17.5 Room Deletion (Soft)

```
1. User deletes a chat room â†’ adds their uid to chatRoom.deletedBy
2. Room hidden from their view immediately
3. Permanent deletion only when BOTH participants delete (chatRoom.deletedBy.length === 2)
4. Seller sees rooms in /seller/messages; buyer in /user/messages
```

### 17.6 RTDB Token Flow

```
1. Client calls getRealtimeTokenAction()
2. Server calls firebase.auth().createCustomToken(uid)
3. Client receives customToken â†’ authenticates with RTDB using signInWithCustomToken
4. Client can now subscribe to /chat_rooms/{roomId}/messages in real-time
```

**Rules:**

- Chat is feature-flag controlled (`FEATURE_FLAGS.CHAT_ENABLED`)
- Users can only access rooms where they are `buyerId` or `sellerId`
- Message content is not sanitised server-side (trusted caller model); UI renders as plain text only
- Rate-limited: STRICT preset per sender uid

---

## 18. Notifications

### 18.1 Actors

- **System** â€” creates notifications server-side; no client-side notification writes
- **User** â€” reads, marks read, and deletes own notifications

### 18.2 Notification Types & Triggers

| Type               | Created by                                |
| ------------------ | ----------------------------------------- |
| `order_confirmed`  | `POST /api/payment/verify` success        |
| `order_shipped`    | `POST /api/seller/orders/[id]/ship`       |
| `order_delivered`  | ShipRocket webhook                        |
| `order_cancelled`  | `cancelOrderAction`                       |
| `review_approved`  | `adminUpdateReviewAction` approve         |
| `bid_outbid`       | `placeBidAction` (to previous top bidder) |
| `bid_won`          | Auction end scheduled job                 |
| `offer_received`   | `makeOfferAction` (to seller)             |
| `offer_accepted`   | `respondToOfferAction` accept (to buyer)  |
| `offer_declined`   | `respondToOfferAction` decline (to buyer) |
| `offer_countered`  | `respondToOfferAction` counter (to buyer) |
| `store_approved`   | `adminUpdateStoreStatusAction` approve    |
| `event_started`    | `changeEventStatusAction â†’ active`      |
| `payout_approved`  | `adminUpdatePayoutAction` approve         |
| `payout_rejected`  | `adminUpdatePayoutAction` reject          |
| `refund_initiated` | `adminPartialRefundAction`                |
| `coins_credited`   | RC purchase verify or admin adjustment    |
| `system`           | Admin broadcast                           |

### 18.3 Read / Delete Scenario

```
1. User opens NotificationBell (header) â†’ dropdown shows last 5
2. Click notification â†’ markNotificationReadAction({ id }) + navigate to related route
3. User goes to /user/notifications for full list
4. NotificationsBulkActions:
   - "Mark All as Read" â†’ markAllNotificationsReadAction()
   - "Delete Read"      â†’ deleteNotificationAction for each read notification
```

---

## 19. Search

### 19.1 Actors

- **Guest / User** â€” searches the product catalogue and pages
- **Admin** â€” manages the Algolia index

### 19.2 Search Scenario

```
1. User types in the Navbar Search bar
2. Input debounced 300ms â†’ useNavSuggestions(query)
   â†’ GET /api/search?nav=1 (server proxies to Algolia; API key not exposed)
   â†’ Dropdown shows product/page suggestions
3. User presses Enter or clicks suggestion
   â†’ Navigates to /search?q=... (URL-driven)
4. SearchView: useSearch(searchParams) â†’ GET /api/search
   â†’ Returns: hits[], nbHits, page, nbPages, facets
5. Filter chips (category, etc.) update URL params â†’ re-query
```

### 19.3 Algolia Index Management Scenario

```
1. Admin opens /demo/algolia
2. "Sync Products" â†’ POST /api/admin/algolia/sync
   â†’ All active products indexed to Algolia (batch upsert)
3. "Sync Pages" â†’ POST /api/admin/algolia/sync-pages
   â†’ Static and blog pages indexed
4. "Clear" actions wipe the respective index (destructive; confirmation required)
```

**Rules:**

- Product deletions and deactivations must also update the Algolia index
- Index sync is manual (triggered by admin) â€” no real-time sync

---

## 20. Categories & Stores

### 20.1 Categories

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
User visits /categories â†’ grid of top-level categories
Clicks category â†’ CategoryProductsView
  - Breadcrumb: parent â†’ current
  - Sub-category chips if children exist
  - ProductGrid + URL-driven filters
```

### 20.2 Stores

**Store approval** is part of the seller onboarding (see Â§11.2).

**Public store browsing:**

```
User visits /stores â†’ StoresListView (search by name, filter by category)
Clicks store â†’ /stores/[storeSlug]
  â†’ StoreHeader (banner, logo, name, rating, description)
  â†’ StoreNavTabs:
      Products    â†’ /stores/[storeSlug]/products    (product grid with filters)
      Auctions    â†’ /stores/[storeSlug]/auctions    (active auction grid)
      Reviews     â†’ /stores/[storeSlug]/reviews     (seller reviews)
      About       â†’ /stores/[storeSlug]/about       (store description + contact)
  â†’ "Message Seller" â†’ createOrGetChatRoomAction + opens chat (if feature enabled)
```

**Public Seller Profile:**

```
Route: /profile/[userId]
â†’ Shows seller's public profile: display name, avatar, joined date
â†’ Lists seller's active products and reviews
â†’ getPublicProfileAction({ userId }) â†’ userRepository.findPublic(uid)
```

---

## 21. Wishlist

### 21.1 Actors

- **User** â€” adds and removes products from their personal wishlist

### 21.2 Wishlist Operations

```
Route: /user/wishlist â€” WishlistView

addToWishlistAction({ productId })
  â†’ Creates wishlist item in Firestore: wishlists/{uid}/items/{productId}
  â†’ Idempotent: no error if already present

removeFromWishlistAction({ productId })
  â†’ Deletes wishlist item document

getWishlistAction()
  â†’ Returns all wishlist items for the authenticated user with product snapshots
```

- Wishlist is user-scoped; sellers and admins also have a personal wishlist
- Heart/bookmark icon toggles on product cards throughout the catalogue

---

## 22. Newsletter & Contact

### 22.1 Newsletter Subscription

```
Route: Newsletter subscription form appears in:
  - Footer (source: 'footer')
  - Homepage (source: 'homepage')
  - Checkout confirmation page (source: 'checkout')
  - Popup (source: 'popup')

subscribeNewsletterAction({ email, source? })
  a. Rate-limited by IP (STRICT: 5 req / 60 s) â€” does NOT require authentication
  b. Validates email format
  c. newsletterRepository.upsert({ email, source, subscribedAt })
  d. Returns { subscribed: true }
```

**Rules:**

- Anonymous subscription â€” no login required
- Source tracking lets admin segment subscribers by acquisition channel
- Duplicate emails are handled via upsert (no error on re-subscription)

### 22.2 Contact Form

```
Route: /contact â€” ContactFormView

sendContactAction({ name, email, subject, message })
  a. Rate-limited by IP
  b. Validates all fields (Zod schema)
  c. Sends email via Resend to the platform contact address (from siteSettings)
  d. Stores submission in Firestore contact_submissions collection
  e. Returns { sent: true }
```

**Rules:**

- Available to guests and authenticated users
- Platform contact email is configured in Site Settings (admin)
- IP-rate-limited to prevent spam

---

## 23. Admin Platform Management

### 23.1 User Management Scenario

```
Actors: Admin
1. Admin opens AdminUsersView â†’ DataTable of all users
2. Filter by role, status, date
3. Actions per user:
   - adminUpdateUserAction({ uid, role?, status? })
     â†’ Change role (user/seller/admin) or suspend/reinstate account
   - adminDeleteUserAction({ uid })
     â†’ Permanently deletes user from Firebase Auth + Firestore
     â†’ WARNING: irreversible; all orders/reviews retain userId reference
   - RCAdjustModal â†’ adminAdjustRCAction (see Â§15.6)
   - revokeUserSessionsAction({ userId }) â†’ all active sessions invalidated
```

### 23.2 Site Settings Scenario

```
1. Admin opens /admin/site (SiteSettingsView)
2. Configures:
   - Platform name, logo, contact email
   - RC earn rate (coins per â‚¹ spent) and conversion rate (coins â†’ â‚¹ discount)
   - RC purchase packages (coins, price)
   - Razorpay / Resend credentials (AES-256-GCM encrypted in Firestore siteSettings doc)
   - Maintenance mode toggle
3. Changes take effect immediately (no deployment needed)
```

**Security:** Provider credentials (API keys) are stored AES-256-GCM encrypted in Firestore. The server decrypts at runtime â€” keys are never exposed to the client.

### 23.3 Feature Flags Scenario

```
1. Admin opens /admin/feature-flags
2. Toggles feature on/off (e.g. referral program, coin-gated events, COD)
3. Changes stored in Firestore and read by middleware / hooks at request time
```

### 23.4 Admin Navigation Management

```
Route: /admin/navigation
â†’ Admin manages site navigation links (header/footer menus)
â†’ CRUD for nav items: label, url, icon, visible, order
```

### 23.5 Admin Media Library

```
Route: /admin/media
â†’ Central media management: view, search, delete uploaded assets
â†’ Assets stored in Firebase Storage; metadata in Firestore
```

### 23.6 Admin Analytics Dashboard

```
Route: /admin/analytics
â†’ Platform-level metrics: total orders, revenue, active users, top products
â†’ useAdminAnalytics() â†’ GET /api/admin/analytics
```

### 23.7 Admin Bids Management

```
Route: /admin/bids
â†’ DataTable of all bids across all auctions
â†’ Filter by auction, status, amount, date
â†’ Read-only view for audit purposes
```

### 23.8 Admin Priority Alerts

Admin dashboard surfaces items needing action:

- Pending reviews awaiting moderation
- Pending payout requests
- New seller applications
- Failed payment webhooks

---

## 24. Informational & Static Pages

These pages contain no dynamic mutations. They are server-rendered (RSC) or statically generated (ISR).

| Route                  | Content                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `/about`               | Company story, team, mission                                 |
| `/help`                | Help centre with searchable FAQ categories                   |
| `/faqs`                | Full FAQ listing, filterable by category; users vote helpful |
| `/faqs/[category]`     | Category-scoped FAQ listing                                  |
| `/seller-guide`        | Guide for new sellers; links to become-seller flow           |
| `/how-auctions-work`   | Explainer for auction bidding rules                          |
| `/how-offers-work`     | Explainer for Make-an-Offer feature                          |
| `/how-pre-orders-work` | Explainer for pre-order deposits and fulfilment              |
| `/how-orders-work`     | Order lifecycle explainer for buyers                         |
| `/how-checkout-works`  | OTP consent, COD, Razorpay explainer                         |
| `/how-reviews-work`    | Verified-purchase review rules                               |
| `/how-payouts-work`    | Seller payout eligibility and timeline                       |
| `/track`               | Anonymous order tracking by order ID / AWB (TrackOrderView)  |
| `/terms`               | Terms of service                                             |
| `/privacy`             | Privacy policy                                               |
| `/refund-policy`       | Refund and return policy                                     |
| `/shipping-policy`     | Shipping timelines and restrictions                          |
| `/fees`                | Seller fee structure and commission rates                    |
| `/cookies`             | Cookie policy                                                |
| `/demo/seed`           | Dev-only seed tool (not publicly linked)                     |
| `/demo/algolia`        | Dev-only Algolia index sync tool (not publicly linked)       |

**Order Tracking (/track):**

```
1. User enters order ID or AWB number in TrackOrderView
2. GET /api/orders/track?id=...
   â†’ Fetches order from orderRepository (public subset of fields only)
   â†’ Returns: status, estimated delivery, shipment events
3. No authentication required for public tracking by order ID
```

---

## 25. Cross-Cutting Rules

### 25.1 Security Invariants

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

### 25.2 Data Flow Invariants

| Rule                                                                      | Detail                                                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Reads: Hook â†’ apiClient â†’ API route â†’ Repository â†’ Firestore      | Never call Firestore directly from an API route                                                  |
| Mutations: component â†’ Server Action â†’ Repository â†’ Firestore       | Never POST from a component; never call apiClient for mutations                                  |
| File uploads: stage locally â†’ FormData to server â†’ backend to Storage | Never upload from browser to Storage directly                                                    |
| Filter / sort / page state in URL                                         | `useUrlTable` always; never `useState` for table params                                          |
| Cart coupon re-validated at order creation                                | Client-side coupon state is not trusted; server re-validates on `POST /api/payment/create-order` |

### 25.3 State Consistency Rules

| Scenario                      | Consistency mechanism                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Auction bids                  | Firestore + RTDB updated atomically inside `placeBidAction`                                                                     |
| Offer RC engagement           | `engagedRC` adjusted atomically (increment on offer, decrement on decline/withdrawal/expiry)                                    |
| Order + RC + cart on checkout | All mutations in single Server Action; `revalidatePath` busts React cache                                                       |
| Coupon usage count            | Incremented atomically via Firestore transaction on order creation                                                              |
| RC balance                    | All credits and debits go through `rcRepository` (single writer); no direct field updates                                       |
| Order cancellation            | Refund + RC reversal + status update in a single Server Action                                                                  |
| Chat room creation            | Idempotent: `createOrGetChatRoomAction` checks for existing room before creating; deduplication by (orderId, buyerId, sellerId) |

### 25.4 Notification Invariants

- Notifications are always created by the **server** (API routes / Server Actions / scheduled jobs)
- Clients only **read, mark-read, and delete** their own notifications
- No notification is written directly from a client component

### 25.5 Role Escalation Prevention

- `role` field in user Firestore document is only writable by `adminUpdateUserAction` (admin-only action)
- Seller role is granted only through the store approval flow by an admin
- Middleware RBAC check happens server-side on every request using the decoded `__session` cookie

### 25.6 Deletion Rules

| Entity         | Deletion type | Notes                                                                 |
| -------------- | ------------- | --------------------------------------------------------------------- |
| User           | Hard delete   | Firebase Auth + Firestore; orders/reviews retain `userId` reference   |
| Product        | Hard delete   | Blocked if active orders exist; removes Storage media + Algolia entry |
| Review         | Soft delete   | Hidden from public; retained for audit                                |
| Order          | Not deletable | Permanent record for financial audit trail                            |
| Payout         | Not deletable | Permanent record                                                      |
| Blog post      | Hard delete   | Admin only                                                            |
| Notification   | Hard delete   | User-initiated for own notifications                                  |
| Offer          | Soft archive  | Status set to 'withdrawn'/'expired'; RC released; record retained     |
| Chat room      | Soft delete   | Added to `deletedBy`; purged only when both participants delete       |
| Chat messages  | Permanent     | RTDB TTL or manual purge; not exposed as user-facing delete           |
| Newsletter sub | Not deletable | Retention per privacy policy; unsubscribe flag added                  |
