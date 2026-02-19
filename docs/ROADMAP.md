# LetItRip — Feature Roadmap & Build Plan

> Last updated: February 19, 2026  
> Every item links to the relevant file location once created. Dead-link routes are marked 🔗💀.

---

## Current Status Snapshot

| Area                                                                                         | Status                                                |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Auth (login, register, reset, verify)                                                        | ✅ Complete                                           |
| User profile, addresses, orders, settings                                                    | ✅ Complete                                           |
| Admin: dashboard, users, categories, FAQs, carousel, reviews, sections, site settings, media | ✅ Complete                                           |
| Admin: products management                                                                   | ✅ Complete                                           |
| Homepage sections                                                                            | ✅ Complete                                           |
| Product API + repository                                                                     | ✅ Complete                                           |
| Order API + repository                                                                       | ✅ Complete                                           |
| Bid / Auction repository                                                                     | ✅ Schema + repo, ❌ no API routes                    |
| Coupon repository                                                                            | ✅ Schema + repo, ❌ no API routes                    |
| Cart                                                                                         | ✅ Schema + repo + API + page complete                |
| Checkout + Payment                                                                           | ✅ Complete incl. Razorpay + order confirmation email |
| Products browsing pages                                                                      | ✅ Listing + detail pages complete                    |
| Categories browsing pages                                                                    | ❌ Pages missing                                      |
| Seller portal                                                                                | ❌ Nothing exists                                     |
| Search                                                                                       | ❌ Nothing exists                                     |

---

## Phase 1 — Core Buying Flow (MVP Blocker)

**Goal:** A customer can browse, add to cart, and buy a product.

### 1.1 Admin Products Page ✅

- **Route:** `/admin/products/[[...action]]`
- **File:** `src/app/admin/products/[[...action]]/page.tsx`
- **API:** `GET/POST /api/admin/products`, `GET/PATCH/DELETE /api/admin/products/[id]`
- **Components:** `ProductForm`, `getProductTableColumns` in `src/components/admin/products/`
- **Status:** Complete

### 1.2 Product Listing Page ✅

- **Route:** `/products`
- **File:** `src/app/products/page.tsx`
- **API:** `GET /api/products` with `status==published` filter, pagination, sort
- **Components:** `ProductCard`, `ProductGrid`, `ProductFilters`, `ProductSortBar` in `src/components/products/`
- **Features:** URL-driven filters (category, price range), sortable, paginated, responsive sidebar filters, mobile filter strip, loading skeletons
- **Status:** Complete

### 1.3 Product Detail Page ✅

- **Route:** `/products/[id]`
- **File:** `src/app/products/[id]/page.tsx`
- **API:** `GET /api/products/[id]` (exists ✅), `GET /api/reviews?productId=` (exists ✅)
- **Components:** `ProductImageGallery`, `ProductInfo`, `ProductReviews`, `AddToCartButton` (stub — wires to cart in 1.4), `RelatedProducts` in `src/components/products/`
- **Features:** Image gallery with thumbnails, product info with specs/features/shipping, paginated reviews with rating distribution, related products by category, skeleton loading, 404 state
- **Status:** Complete (AddToCartButton is stub until Task 1.4)

### 1.4 Cart Schema + Repository + API ✅

- **Schema:** `src/db/schema/cart.ts` — `CartDocument`, `CartItemDocument`, `CART_FIELDS`, `CART_COLLECTION`
- **Repository:** `src/repositories/cart.repository.ts` — `getOrCreate`, `addItem`, `updateItem`, `removeItem`, `clearCart`, `getItemCount`, `getSubtotal`
- **API:** `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart`, `PATCH /api/cart/[itemId]`, `DELETE /api/cart/[itemId]`
- **Design:** One cart document per user (doc ID = userId), items stored as array, price captured at add time
- **Status:** Complete

### 1.5 Cart Page ✅

- **Route:** `/cart`
- **File:** `src/app/cart/page.tsx`
- **Components:** `CartItemList`, `CartItemRow`, `CartSummary`, `PromoCodeInput` in `src/components/cart/`
- **Features:** Item quantity controls, remove items, sticky order summary, promo code input (stub), checkout CTA routing to `/checkout`
- **AddToCartButton:** Wired to `POST /api/cart` with real mutation
- **Status:** Complete

### 1.6 Checkout Page ✅

- **Route:** `/checkout`
- **File:** `src/app/checkout/page.tsx`
- **API:** `POST /api/checkout` — validates cart, creates one OrderDocument per cart item, deducts stock, clears cart
- **Components:** `CheckoutStepper`, `CheckoutAddressStep`, `CheckoutOrderReview`, `OrderSummaryPanel` in `src/components/checkout/`
- **Steps:** (1) Select shipping address → (2) Review order + payment method → Place Order
- **Payment methods:** Cash on Delivery (live), Online Payment (stub — Task 1.7)
- **Status:** Complete

### 1.7 Payment Integration ✅

- **Provider:** Razorpay
- **SDK Wrapper:** `src/lib/payment/razorpay.ts` — `createRazorpayOrder`, `verifyPaymentSignature`, `verifyWebhookSignature`, `rupeesToPaise`
- **Hook:** `src/hooks/useRazorpay.ts` — loads `checkout.js`, opens payment modal, returns Promise
- **API:**
  - `POST /api/payment/create-order` — creates Razorpay order (returns orderId + keyId)
  - `POST /api/payment/verify` — verifies signature, creates app orders, deducts stock, clears cart
  - `POST /api/payment/webhook` — handles Razorpay webhook events (payment.captured, payment.failed, order.paid)
- **Checkout integration:** "Online Payment" option in checkout now opens real Razorpay modal
- **Env vars required:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- **Status:** Complete

### 1.8 Order Confirmation Page ✅

- **Route:** `/checkout/success`
- **File:** `src/app/checkout/success/page.tsx`
- **Email:** `sendOrderConfirmationEmail` added to `src/lib/email.ts` — full HTML template with order details, CTA link
- **API integration:** Both `/api/checkout` and `/api/payment/verify` fire confirmation emails (fire-and-forget) after clearing cart
- **Page features:** Displays order status, product details, payment method + status, shipping address, "View Order Details" / "My Orders" / "Continue Shopping" CTAs; loading state via `Spinner`; redirect to products if `orderId` missing
- **Status:** Complete

---

## Phase 2 — Discovery & Merchandising

**Goal:** Shoppers can find products through categories, search, and wishlisting.

### 2.1 Admin Orders Page

- **Route:** `/admin/orders/[[...action]]`
- **File:** `src/app/admin/orders/[[...action]]/page.tsx`
- **API:** `GET /api/admin/orders`, `PATCH /api/admin/orders/[id]`
- **Features:** Status filter, bulk status update, export CSV, view order details
- **Priority:** 🟠 P1

### 2.2 Admin Coupons Page

- **Route:** `/admin/coupons` 🔗💀 (in `ROUTES.ADMIN.COUPONS` but no page)
- **File:** `src/app/admin/coupons/[[...action]]/page.tsx`
- **API:** `GET/POST /api/coupons`, `GET/PATCH/DELETE /api/coupons/[id]`, `POST /api/coupons/validate`
- **Priority:** 🟠 P1

### 2.3 Categories Listing Page

- **Route:** `/categories` 🔗💀
- **File:** `src/app/categories/page.tsx`
- **API:** `GET /api/categories` (exists ✅)
- **Components:** `CategoryGrid`, `CategoryCard`
- **Priority:** 🟠 P1

### 2.4 Category Products Page

- **Route:** `/categories/[slug]`
- **File:** `src/app/categories/[slug]/page.tsx`
- **Reuses:** `ProductGrid`, `ProductFilters` from Phase 1
- **Priority:** 🟠 P1

### 2.5 Wishlist API + Functional Wishlist Page

- **Schema:** Add `wishlists` collection or subcollection under user
- **Repository:** `src/repositories/wishlist.repository.ts`
- **API:** `GET/POST /api/user/wishlist`, `DELETE /api/user/wishlist/[productId]`
- **Page:** `/user/wishlist` (page shell exists ✅, needs API wiring)
- **Priority:** 🟠 P1

### 2.6 Coupon Validate API + Checkout Integration

- **API:** `POST /api/coupons/validate` — validates code, returns discount amount
- **Integrates:** into Cart and Checkout pages
- **Priority:** 🟠 P1

### 2.7 Search Page + API

- **Route:** `/search`
- **File:** `src/app/search/page.tsx`
- **API:** `GET /api/search?q=...&category=...&minPrice=...&maxPrice=...`
- **Approach (Phase 2):** Firestore full-text workaround (tags + title matching)
- **Approach (Phase 3):** Integrate Algolia / Typesense for real full-text search
- **Priority:** 🟠 P1

### 2.8 Order Confirmation Emails

- **File:** `src/lib/email/templates/order-confirmation.tsx`
- **Trigger:** On successful checkout via Resend
- **Priority:** 🟠 P1

---

## Phase 3 — Auctions & Seller Portal

**Goal:** Sellers can list products (including auctions); buyers can bid.

### 3.1 Auction Listing Page

- **Route:** `/auctions` 🔗💀
- **File:** `src/app/auctions/page.tsx`
- **API:** `GET /api/products?isAuction=true` (filter on existing endpoint)
- **Components:** `AuctionCard` (shows countdown timer, current bid, bid count)
- **Priority:** 🟡 P2

### 3.2 Auction Detail + Bidding Page

- **Route:** `/auctions/[id]`
- **File:** `src/app/auctions/[id]/page.tsx`
- **API:** `POST /api/bids`, `GET /api/bids?productId=...`
- **Real-time:** Firebase Realtime DB listener for live bid updates
- **Components:** `BidHistory`, `PlaceBidForm`, `AuctionCountdown`
- **Priority:** 🟡 P2

### 3.3 Bids API Routes

- **Files:**
  - `src/app/api/bids/route.ts` (GET list, POST new bid)
  - `src/app/api/bids/[id]/route.ts` (GET single)
- **Repository:** `bidRepository` exists ✅
- **Priority:** 🟡 P2

### 3.4 Seller Dashboard

- **Route:** `/seller` 🔗💀
- **File:** `src/app/seller/layout.tsx`, `src/app/seller/dashboard/page.tsx`
- **Stats:** Total sales, active listings, pending orders, active auctions
- **Priority:** 🟡 P2

### 3.5 Seller Products Management

- **Routes:**
  - `/seller/products` — list with CRUD actions
  - `/seller/products/new` — create listing
  - `/seller/products/[id]/edit` — edit listing
- **API:** POST/PATCH/DELETE `/api/products` with seller-scoped authorization
- **Priority:** 🟡 P2

### 3.6 Seller Orders / Sales

- **Route:** `/seller/orders`
- **API:** `GET /api/seller/orders` (filtered by `sellerId`)
- **Priority:** 🟡 P2

### 3.7 Admin Bids/Auctions Page

- **Route:** `/admin/bids`
- **File:** `src/app/admin/bids/[[...action]]/page.tsx`
- **Priority:** 🟡 P2

---

## Phase 4 — Content & Trust Pages

**Goal:** Static and semi-static pages that build credibility.

### 4.1 About Us

- **Route:** `/about` 🔗💀
- **File:** `src/app/about/page.tsx`
- Content: mission, team, milestones, media coverage
- **Priority:** 🟢 P3

### 4.2 Contact Us

- **Route:** `/contact` 🔗💀
- **File:** `src/app/contact/page.tsx`
- **API:** `POST /api/contact` — email to support via Resend
- **Priority:** 🟢 P3

### 4.3 Help Center

- **Route:** `/help` 🔗💀
- **File:** `src/app/help/page.tsx`
- Reuses FAQ content + links to categories of FAQs
- **Priority:** 🟢 P3

### 4.4 Terms & Conditions

- **Route:** `/terms` 🔗💀
- **File:** `src/app/terms/page.tsx`
- **Priority:** 🟢 P3

### 4.5 Privacy Policy

- **Route:** `/privacy` 🔗💀
- **File:** `src/app/privacy/page.tsx`
- **Priority:** 🟢 P3

### 4.6 Sellers Landing Page

- **Route:** `/sellers` 🔗💀
- **File:** `src/app/sellers/page.tsx`
- Marketing page: sell on LetItRip, how it works, seller benefits
- **Priority:** 🟢 P3

### 4.7 Blog

- **Route:** `/blog` 🔗💀 , `/blog/[slug]`
- **Schema:** `src/db/schema/blog-posts.ts`
- **Repository:** `src/repositories/blog.repository.ts`
- **Priority:** 🟢 P3

### 4.8 Promotions / Deals Page

- **Route:** `/promotions` 🔗💀
- **File:** `src/app/promotions/page.tsx`
- Aggregates promoted products + active coupons
- **Priority:** 🟢 P3

---

## Phase 5 — Platform Maturity

| Feature               | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| Notifications         | In-app + email schema, `GET/POST /api/notifications`, bell icon in header |
| Order tracking UI     | `/user/orders/[id]/track` — timeline visualization                        |
| User public profile   | `/profile/[userId]` (exists ✅) — wire up seller products, reviews        |
| Product seller page   | `/sellers/[id]` — seller's public storefront                              |
| Rate limiting         | `src/lib/middleware/rate-limit.ts` on all public API routes               |
| Real-time bid updates | Firebase Realtime DB for auction bid streaming                            |
| Algolia search        | Replace basic search with full-text index                                 |
| Analytics             | Seller analytics, admin sales charts                                      |
| Payout system         | `/seller/payouts`, payout calculation, bank account management            |
| PWA                   | `next-pwa`, manifest, service worker for mobile install                   |

---

## Dead Links Summary (Routes with no page)

| Route             | Defined In                 | Priority |
| ----------------- | -------------------------- | -------- |
| `/products`       | `ROUTES.PUBLIC.PRODUCTS`   | 🔴 P0    |
| `/cart`           | `ROUTES.USER.CART`         | 🔴 P0    |
| `/checkout`       | —                          | 🔴 P0    |
| `/admin/products` | —                          | 🔴 P0    |
| `/admin/orders`   | —                          | 🟠 P1    |
| `/admin/coupons`  | `ROUTES.ADMIN.COUPONS`     | 🟠 P1    |
| `/categories`     | `ROUTES.PUBLIC.CATEGORIES` | 🟠 P1    |
| `/search`         | —                          | 🟠 P1    |
| `/auctions`       | `ROUTES.PUBLIC.AUCTIONS`   | 🟡 P2    |
| `/seller`         | `ROUTES.SELLER.DASHBOARD`  | 🟡 P2    |
| `/about`          | `ROUTES.PUBLIC.ABOUT`      | 🟢 P3    |
| `/contact`        | `ROUTES.PUBLIC.CONTACT`    | 🟢 P3    |
| `/help`           | `ROUTES.PUBLIC.HELP`       | 🟢 P3    |
| `/terms`          | `ROUTES.PUBLIC.TERMS`      | 🟢 P3    |
| `/privacy`        | `ROUTES.PUBLIC.PRIVACY`    | 🟢 P3    |
| `/sellers`        | `ROUTES.PUBLIC.SELLERS`    | 🟢 P3    |
| `/blog`           | `ROUTES.PUBLIC.BLOG`       | 🟢 P3    |
| `/promotions`     | `ROUTES.PUBLIC.PROMOTIONS` | 🟢 P3    |

---

## API Endpoints to Build

| Endpoint                         | Method                      | Phase |
| -------------------------------- | --------------------------- | ----- |
| `/api/cart`                      | GET, POST                   | P0    |
| `/api/cart/[itemId]`             | PATCH, DELETE               | P0    |
| `/api/checkout`                  | POST                        | P0    |
| `/api/payment/create-order`      | POST                        | P0    |
| `/api/payment/verify`            | POST                        | P0    |
| `/api/payment/webhook`           | POST                        | P0    |
| `/api/admin/orders`              | GET                         | P1    |
| `/api/admin/orders/[id]`         | GET, PATCH                  | P1    |
| `/api/admin/products`            | GET ✅                      | P1    |
| `/api/admin/products/[id]`       | GET ✅, PATCH ✅, DELETE ✅ | P1    |
| `/api/admin/coupons`             | GET, POST                   | P1    |
| `/api/admin/coupons/[id]`        | GET, PATCH, DELETE          | P1    |
| `/api/coupons/validate`          | POST                        | P1    |
| `/api/user/wishlist`             | GET, POST                   | P1    |
| `/api/user/wishlist/[productId]` | DELETE                      | P1    |
| `/api/search`                    | GET                         | P1    |
| `/api/bids`                      | GET, POST                   | P2    |
| `/api/bids/[id]`                 | GET                         | P2    |
| `/api/seller/products`           | GET, POST                   | P2    |
| `/api/seller/orders`             | GET                         | P2    |
| `/api/contact`                   | POST                        | P3    |
| `/api/notifications`             | GET, POST                   | P3+   |

---

## Component Library Gaps

| Component             | Used By                                      | Phase |
| --------------------- | -------------------------------------------- | ----- |
| `ProductCard`         | `/products`, `/categories/[slug]`, homepage  | P0    |
| `ProductGrid`         | `/products`, `/categories/[slug]`            | P0    |
| `ProductFilters`      | `/products`, `/categories/[slug]`, `/search` | P0    |
| `ProductImageGallery` | `/products/[id]`                             | P0    |
| `AddToCartButton`     | `/products/[id]`, `ProductCard`              | P0    |
| `CartItemRow`         | `/cart`                                      | P0    |
| `CartSummary`         | `/cart`, `/checkout`                         | P0    |
| `CheckoutStepper`     | `/checkout`                                  | P0    |
| `AuctionCard`         | `/auctions`                                  | P2    |
| `AuctionCountdown`    | `/auctions/[id]`                             | P2    |
| `BidHistory`          | `/auctions/[id]`                             | P2    |
| `SellerSidebar`       | `/seller/*`                                  | P2    |
| `NotificationBell`    | Header                                       | P3+   |

---

## Schema / Repository Gaps

| Need            | Action                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| Cart            | Create `src/db/schema/cart.ts` + `src/repositories/cart.repository.ts`          |
| Wishlist        | Create `src/db/schema/wishlists.ts` + `src/repositories/wishlist.repository.ts` |
| Blog posts      | Create `src/db/schema/blog-posts.ts` + `src/repositories/blog.repository.ts`    |
| Notifications   | Create `src/db/schema/notifications.ts` + repository                            |
| Payment records | Create `src/db/schema/payments.ts` for payment audit trail                      |

---

## Environment Variables to Add

```env
# Razorpay (Phase 1)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Algolia (Phase 2 search)
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_API_KEY=
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=

# WhatsApp notifications (optional)
WHATSAPP_API_KEY=
WHATSAPP_PHONE_ID=
```
