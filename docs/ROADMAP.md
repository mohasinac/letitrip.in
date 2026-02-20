# LetItRip — Feature Roadmap & Build Plan

> Last updated: February 23, 2026  
> Every item links to the relevant file location once created. Dead-link routes are marked 🔗💀.

---

## Current Status Snapshot

| Area                                                                                         | Status                                                             |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Auth (login, register, reset, verify)                                                        | ✅ Complete                                                        |
| User profile, addresses, orders, settings                                                    | ✅ Complete                                                        |
| Admin: dashboard, users, categories, FAQs, carousel, reviews, sections, site settings, media | ✅ Complete                                                        |
| Admin: products management                                                                   | ✅ Complete                                                        |
| Admin: orders management                                                                     | ✅ Complete                                                        |
| Homepage sections                                                                            | ✅ Complete                                                        |
| Product API + repository                                                                     | ✅ Complete                                                        |
| Order API + repository                                                                       | ✅ Complete                                                        |
| Bid / Auction repository                                                                     | ✅ Schema + repo + API routes (GET/POST bids)                      |
| Admin: coupons management                                                                    | ✅ Complete                                                        |
| Coupon repository                                                                            | ✅ Schema + repo + API routes + admin management                   |
| Cart                                                                                         | ✅ Schema + repo + API + page complete                             |
| Checkout + Payment                                                                           | ✅ Complete incl. Razorpay + order confirmation email              |
| Products browsing pages                                                                      | ✅ Listing + detail pages complete                                 |
| Categories browsing pages                                                                    | ✅ Complete — listing + category products pages                    |
| Seller portal                                                                                | ✅ Dashboard + Products CRUD + Orders at /seller                   |
| Search                                                                                       | ✅ Complete — /search page + /api/search route                     |
| Admin: bids/auctions management                                                              | ✅ Complete — /admin/bids page with stats + drawer                 |
| Content & Trust pages                                                                        | ✅ About, Contact, Help, Terms, Privacy, Sellers, Blog, Promotions |
| Notifications                                                                                | ✅ Schema + repo + API + NotificationBell component + user page    |
| Order tracking UI                                                                            | ✅ Timeline visualization at `/user/orders/[id]/track`             |

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

### 2.1 Admin Orders Page ✅

- **Route:** `/admin/orders/[[...action]]`
- **File:** `src/app/admin/orders/[[...action]]/page.tsx`
- **API:** `GET /api/admin/orders` (pagination, Sieve filtering by status/user/payment), `GET /api/admin/orders/[id]`, `PATCH /api/admin/orders/[id]`
- **Components:** `OrderTableColumns`, `OrderStatusForm` in `src/components/admin/orders/`
- **Features:** Status filter tabs (All/Pending/Confirmed/Shipped/Delivered/Cancelled), DataTable with order ID/product/customer/amount/status/payment columns, side drawer to update status + tracking number + notes
- **Status:** Complete

### 2.2 Admin Coupons Page ✅

- **Route:** `/admin/coupons`
- **File:** `src/app/admin/coupons/[[...action]]/page.tsx`
- **API:** `GET/POST /api/admin/coupons`, `GET/PATCH/DELETE /api/admin/coupons/[id]`, `POST /api/coupons/validate`
- **Components:** `CouponTableColumns`, `CouponForm` in `src/components/admin/coupons/`
- **Features:** Full CRUD via DataTable + SideDrawer create/edit, ConfirmDeleteModal for deletes, coupon type/discount/validity/restrictions forms, public validate endpoint for checkout
- **Status:** Complete

### 2.3 Categories Listing Page ✅

- **Route:** `/categories`
- **File:** `src/app/categories/page.tsx`
- **API:** `GET /api/categories?flat=true` (exists ✅)
- **Components:** `CategoryGrid`, `CategoryCard` in `src/components/categories/`
- **Features:** Responsive grid, client-side search filter, product/subcategory counts, featured badge, cover image or icon fallback
- **Status:** Complete

### 2.4 Category Products Page ✅

- **Route:** `/categories/[slug]`
- **File:** `src/app/categories/[slug]/page.tsx`
- **Components:** Reuses `ProductGrid`, `ProductSortBar` from Phase 1
- **Features:** Resolves slug → category via flat categories API, filters products by `category==id`, breadcrumb nav, pagination, sort bar
- **Status:** Complete

### 2.5 Wishlist API + Functional Wishlist Page ✅

- **Schema:** Subcollection `users/{uid}/wishlist/{productId}` — no separate collection needed
- **Repository:** `src/repositories/wishlist.repository.ts` — `getWishlistItems`, `addItem`, `removeItem`, `isInWishlist`, `clearWishlist`
- **API:** `GET/POST /api/user/wishlist`, `GET/DELETE /api/user/wishlist/[productId]`
- **Page:** `/user/wishlist` — ProductGrid of saved items with per-card WishlistButton
- **Components:** `WishlistButton` in `src/components/user/WishlistButton.tsx`
- **Status:** Complete

### 2.6 Coupon Validate API + Checkout Integration ✅

- **API:** `POST /api/coupons/validate` — validates code, returns discount amount (implemented in 2.2)
- **PromoCodeInput:** Wired to call validate API, shows applied discount, remove button
- **CartSummary:** Updated to display discount line item and adjusted total
- **Status:** Complete

### 2.7 Search Page + API ✅

- **Route:** `/search`
- **File:** `src/app/search/page.tsx`
- **API:** `GET /api/search?q=...&category=...&minPrice=...&maxPrice=...`
- **Approach (Phase 2):** In-memory full-text search on title, description, tags, brand — followed by Sieve for category/price filtering + sort/pagination
- **Approach (Phase 3):** Integrate Algolia / Typesense for real full-text search
- **Constants Added:** `ROUTES.PUBLIC.SEARCH`, `API_ENDPOINTS.SEARCH.QUERY`, `UI_LABELS.SEARCH_PAGE.*`
- **Status:** Complete

### 2.8 Order Confirmation Emails ✅

- **Implemented in Task 1.8** — `sendOrderConfirmationEmail` in `src/lib/email.ts`
- **Trigger:** Called fire-and-forget from `/api/checkout` and `/api/payment/verify` routes

---

## Phase 3 — Auctions & Seller Portal

**Goal:** Sellers can list products (including auctions); buyers can bid.

### 3.1 Auction Listing Page ✅

- **Route:** `/auctions`
- **File:** `src/app/auctions/page.tsx`
- **API:** `GET /api/products?filters=isAuction==true,status==published` (existing endpoint)
- **Components:** `AuctionCard` (countdown timer, current/starting bid, bid count), `AuctionGrid`
- **Constants Added:** `ROUTES.PUBLIC.AUCTION_DETAIL`, `UI_LABELS.AUCTIONS_PAGE.*`
- **Status:** Complete

### 3.2 Auction Detail + Bidding Page ✅

- **Route:** `/auctions/[id]`
- **File:** `src/app/auctions/[id]/page.tsx`
- **API:** `POST /api/bids`, `GET /api/bids?productId=...`
- **Real-time:** 15-second polling via `refetchInterval` (Phase 3: upgrade to Firebase Realtime DB listener)
- **Components:** `BidHistory`, `PlaceBidForm` (inline countdown via hook)
- **Status:** Complete

### 3.3 Bids API Routes ✅

- **Files:**
  - `src/app/api/bids/route.ts` (GET bids by productId, POST new bid with validation)
  - `src/app/api/bids/[id]/route.ts` (GET single bid)
- **Repository:** `bidRepository` ✅
- **Validation:** Must exceed current bid, auction must be active, no self-bidding
- **Side-effects:** Updates `product.currentBid` and `product.bidCount` after successful bid
- **Status:** Complete

### 3.4 Seller Dashboard ✅

- **Route:** `/seller`
- **Files:** `src/app/seller/layout.tsx`, `src/app/seller/page.tsx`
- **Components:** `SellerTabs` (new), `StatCard` (inline), `QuickActionButton` (inline)
- **Constants added:** `ROUTES.SELLER.*` (PRODUCTS, ORDERS, AUCTIONS, PRODUCTS_NEW, PRODUCTS_EDIT), `UI_LABELS.SELLER_PAGE.*`, `UI_LABELS.NAV.MY_PRODUCTS/MY_SALES/MY_AUCTIONS`, `SELLER_TAB_ITEMS`
- **Stats:** Total products, active listings, active auctions, draft products — fetched via `GET /api/products?filters=sellerId==uid`
- **Priority:** 🟡 P2

### 3.5 Seller Products Management ✅

- **Routes:**
  - `/seller/products` — list with CRUD actions (DataTable + delete confirm)
  - `/seller/products/new` — full-page create listing form
  - `/seller/products/[id]/edit` — full-page edit listing form
- **Files:** `src/app/seller/products/page.tsx`, `src/app/seller/products/new/page.tsx`, `src/app/seller/products/[id]/edit/page.tsx`
- **API:** Reuses POST/PATCH/DELETE `/api/products` — already seller-scoped (ownership check via `sellerId`)
- **Components reused:** `ProductForm`, `getProductTableColumns`, `DataTable`, `ConfirmDeleteModal`, `AdminPageHeader`
- **Priority:** 🟡 P2

### 3.6 Seller Orders / Sales ✅

- **Route:** `/seller/orders`
- **Files:** `src/app/seller/orders/page.tsx`, `src/app/api/seller/orders/route.ts`
- **Strategy:** Fetch seller's product IDs → filter all orders by productId
- **Features:** Status filter tabs, summary stat cards (Total/Pending/Confirmed/Delivered), DataTable with `getOrderTableColumns`, revenue summary footer
- **Constants added:** `API_ENDPOINTS.SELLER.ORDERS`, `UI_LABELS.SELLER_PAGE.ORDERS_*`
- **Priority:** 🟡 P2

### 3.7 Admin Bids/Auctions Page ✅

- **Route:** `/admin/bids`
- **Files:** `src/app/admin/bids/[[...action]]/page.tsx`, `src/app/api/admin/bids/route.ts`
- **Features:** Status filter tabs, summary stat cards (Total/Active/Won/Total Value), DataTable with `getBidTableColumns`, read-only bid detail drawer
- **Components added:** `getBidTableColumns` in `src/components/admin/bids/`
- **Constants added:** `ROUTES.ADMIN.BIDS`, `API_ENDPOINTS.ADMIN.BIDS`, `UI_LABELS.ADMIN.BIDS.*`, `UI_LABELS.NAV.BIDS_ADMIN`, RBAC entry
- **Priority:** 🟡 P2

---

## Phase 4 — Content & Trust Pages

**Goal:** Static and semi-static pages that build credibility.

### 4.1 About Us ✅

- **Route:** `/about`
- **File:** `src/app/about/page.tsx`
- Content: mission, how it works, values, milestones, CTA
- **Priority:** 🟢 P3

### 4.2 Contact Us ✅

- **Route:** `/contact`
- **File:** `src/app/contact/page.tsx`
- **API:** `POST /api/contact` — email to support via Resend (`src/app/api/contact/route.ts`)
- **Priority:** 🟢 P3

### 4.3 Help Center ✅

- **Route:** `/help`
- **File:** `src/app/help/page.tsx`
- Topic cards linking to FAQ categories
- **Priority:** 🟢 P3

### 4.4 Terms & Conditions ✅

- **Route:** `/terms`
- **File:** `src/app/terms/page.tsx`
- **Priority:** 🟢 P3

### 4.5 Privacy Policy ✅

- **Route:** `/privacy`
- **File:** `src/app/privacy/page.tsx`
- **Priority:** 🟢 P3

### 4.6 Sellers Landing Page ✅

- **Route:** `/sellers`
- **File:** `src/app/sellers/page.tsx`
- Marketing page: sell on LetItRip, how it works, seller benefits, FAQs
- **Priority:** 🟢 P3

### 4.7 Blog ✅

- **Route:** `/blog`, `/blog/[slug]`
- **Schema:** `src/db/schema/blog-posts.ts` — `BlogPostDocument`, `BLOG_POSTS_COLLECTION`, `BLOG_POST_FIELDS`
- **Repository:** `src/repositories/blog.repository.ts` — findBySlug, findPublished, findRelated, incrementViews, create, update, delete
- **API Public:** `GET /api/blog`, `GET /api/blog/[slug]`
- **API Admin:** `GET/POST /api/admin/blog`, `GET/PATCH/DELETE /api/admin/blog/[id]`
- **Components:** `BlogTableColumns`, `BlogForm` in `src/components/admin/blog/`
- **Admin page:** `src/app/admin/blog/[[...action]]/page.tsx` — status filter tabs, stat cards, full CRUD drawer
- **Public pages:** `src/app/blog/page.tsx` (listing with category tabs, featured hero), `src/app/blog/[slug]/page.tsx` (detail with related posts)
- **Priority:** 🟢 P3

### 4.8 Promotions / Deals Page ✅

- **Route:** `/promotions`
- **File:** `src/app/promotions/page.tsx`
- **API:** `GET /api/promotions` — returns promoted products, featured products, active coupons
- Featured products grid, promoted products grid, coupon cards with copy-to-clipboard
- **Priority:** 🟢 P3

---

## Phase 5 — Platform Maturity

### 5.1 Notifications ✅

- **Schema:** `src/db/schema/notifications.ts` — `NotificationDocument`, `NOTIFICATIONS_COLLECTION`, `NOTIFICATION_FIELDS`
- **Repository:** `src/repositories/notification.repository.ts` — `findByUser`, `getUnreadCount`, `markAsRead`, `markAllAsRead`, `create`, `delete`, `deleteAllForUser`
- **API:**
  - `GET/POST /api/notifications` — list user notifications (paginated) / create (admin)
  - `PATCH/DELETE /api/notifications/[id]` — mark as read / delete one
  - `PATCH /api/notifications/read-all` — mark all as read
  - `GET /api/notifications/unread-count` — fast unread badge count
- **Component:** `NotificationBell` in `src/components/ui/NotificationBell.tsx` — bell icon with unread badge, dropdown with recent notifications, mark-as-read actions
- **TitleBar:** `NotificationBell` added for authenticated users between search and profile icons
- **Page:** `src/app/user/notifications` — full notifications list with mark-read, delete, mark-all-read
- **Constants:** `ROUTES.USER.NOTIFICATIONS`, `API_ENDPOINTS.NOTIFICATIONS.*`, `UI_LABELS.NOTIFICATIONS.*`, `ERROR_MESSAGES.NOTIFICATION.*`, `SUCCESS_MESSAGES.NOTIFICATION.*`
- **RBAC:** `ROUTES.USER.NOTIFICATIONS` added to access control config
- **Priority:** 🔵 P5

### 5.2 Order Tracking UI ✅

- **Route:** `/user/orders/[id]/track`
- **File:** `src/app/user/orders/[id]/track/page.tsx`
- **API:** Reuses `GET /api/user/orders/[id]` — all tracking data in `OrderDocument`
- **Features:** Visual 4-step timeline (Placed → Confirmed → Shipped → Delivered), handles cancelled/returned terminal states, tracking number copy-to-clipboard, animated active step, date + relative time display
- **Integration:** "Track Order" button in the order detail page now links to tracking for confirmed/shipped/delivered orders
- **Constants added:** `ROUTES.USER.ORDER_TRACK`, `UI_LABELS.USER.ORDERS.STEP_*` (6 step labels + tracking UI labels)
- **Priority:** 🔵 P5

| Feature                   | Description                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| ~~User public profile~~   | ✅ `/profile/[userId]` — seller products grid + aggregated reviews wired up                                                      |
| ~~Product seller page~~   | ✅ `/sellers/[id]` — seller public storefront with products grid + reviews                                                       |
| ~~Rate limiting~~         | ✅ `applyRateLimit` applied to auth (AUTH/PASSWORD_RESET), contact (STRICT), products/reviews/profile-reviews GET (API/GENEROUS) |
| ~~Real-time bid updates~~ | ✅ `useRealtimeBids` hook + RTDB write on bid POST; auction page uses live data, falls back to 60s poll                          |
| Algolia search            | Replace basic search with full-text index                                                                                        |
| Analytics                 | Seller analytics, admin sales charts                                                                                             |
| Payout system             | `/seller/payouts`, payout calculation, bank account management                                                                   |
| PWA                       | `next-pwa`, manifest, service worker for mobile install                                                                          |

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
