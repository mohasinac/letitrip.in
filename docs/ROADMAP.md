# LetItRip — Feature Roadmap & Build Plan

> Last updated: February 20, 2026  
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
| Admin: payouts management                                                                    | ✅ Complete — `/admin/payouts` page + API done                     |
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

| Feature                   | Description                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~User public profile~~   | ✅ `/profile/[userId]` — seller products grid + aggregated reviews wired up                                                                                                                                                    |
| ~~Product seller page~~   | ✅ `/sellers/[id]` — seller public storefront with products grid + reviews                                                                                                                                                     |
| ~~Rate limiting~~         | ✅ `applyRateLimit` applied to auth (AUTH/PASSWORD_RESET), contact (STRICT), products/reviews/profile-reviews GET (API/GENEROUS)                                                                                               |
| ~~Real-time bid updates~~ | ✅ `useRealtimeBids` hook + RTDB write on bid POST; auction page uses live data, falls back to 60s poll                                                                                                                        |
| ~~Algolia search~~        | ✅ `src/lib/search/algolia.ts` — client + indexProducts + algoliaSearch; /api/search uses Algolia when configured, falls back to in-memory                                                                                     |
| ~~Analytics~~             | ✅ Seller analytics (`/seller/analytics`) + Admin charts (`/admin/analytics`) using recharts AreaChart/BarChart; API routes `/api/admin/analytics` + `/api/seller/analytics`                                                   |
| ~~Payout system~~         | ✅ `PayoutDocument` schema + `payoutRepository`; `GET/POST /api/seller/payouts` (earnings calc + request); `GET /api/admin/payouts` + `PATCH /api/admin/payouts/[id]`; `/seller/payouts` page with stat cards + form + history |
| ~~PWA~~                   | ✅ `@serwist/next` service worker; `src/app/manifest.ts` (name, short_name, start_url, standalone, theme_color #3b82f6, SVG icon); `viewport` export in root layout (themeColor light/dark); SW disabled in dev                |
| UI Polish (Phase 6)       | ✅ Complete — all sub-phases done (6.1–6.8, 6.5 blocked on design assets)                                                                                                                                                      |

---

## Phase 6 — UI Polish & Consistent Styling

**Goal:** Every page is visually consistent, properly decomposed, uses project-wide constants, and has polished UX patterns (skeletons, empty states, dark mode, mobile).

---

### 6.1 Admin Payouts Management UI

- **Route:** `/admin/payouts`
- **File:** `src/app/admin/payouts/page.tsx`
- **API:** `GET /api/admin/payouts`, `PATCH /api/admin/payouts/[id]` (already built ✅)
- **Components to create:** `src/components/admin/payouts/PayoutTableColumns.tsx`, `PayoutStatusForm.tsx`
- **Features:**
  - `AdminPageHeader` + `AdminFilterBar` (filter by status: pending / processing / paid / failed)
  - `DataTable` with payout rows: seller name, amount, method, status badge, requested date
  - `SideDrawer` with `PayoutStatusForm` — update status + admin note
  - Stats row: total pending amount, total paid this month, failure count
  - `StatusBadge` for payout status
- **Constants needed:** `UI_LABELS.ADMIN.PAYOUTS.*`, `SUCCESS_MESSAGES.ADMIN.PAYOUT_*`, `API_ENDPOINTS.ADMIN.PAYOUTS`
- **Priority:** 🔴 P0

---

### 6.2 Fat Page Decomposition

> **Rule:** Pages > 150 lines with inline JSX/logic must be split into sub-components.

#### 6.2.1 `seller/payouts/page.tsx` (418 lines) ✅

- Extracted `SellerPayoutStats` — 3 stat cards (available earnings, total paid, pending payout)
- Extracted `SellerPayoutRequestForm` — form card managing own state (paymentMethod, bankForm, upiId, notes, showForm toggle)
- Extracted `SellerPayoutHistoryTable` — overflow table with badge status column
- Exported `PayoutSummary` and `PayoutRecord` types through seller barrel
- Resulting page: 100 lines

#### 6.2.2 `search/page.tsx` (346 lines) ✅

- Extracted `SearchFiltersRow` — category select, price range inputs (with local state) + clear button
- Extracted `SearchResultsSection` — sort bar, product grid, pagination, no-results state
- Replaced DOM id-based price reading with controlled `useState` + callback props
- Resulting page: 188 lines

#### 6.2.3 `user/notifications/page.tsx` (309 lines) ✅

- Extracted `NotificationItem` — individual row with type icon, title, message, timestamp, mark-read + delete actions
- Extracted `NotificationsBulkActions` — header with unread count + "Mark all as read" button
- `NOTIFICATION_TYPE_ICONS` map lives inside `NotificationItem`
- Resulting page: 137 lines

#### 6.2.4 `seller/analytics/page.tsx` (306 lines) ✅

- Extracted `SellerAnalyticsStats` — 4-card summary grid with stat cards
- Extracted `SellerRevenueChart` — BarChart (Recharts) showing revenue last 6 months
- Extracted `SellerTopProducts` — ranked product list with revenue per product
- Exported types `SellerAnalyticsSummary`, `MonthEntry`, `TopProduct` from components barrel
- Resulting page: 84 lines

#### 6.2.5 `seller/page.tsx` (273 lines)

- Extract `SellerQuickStats` — stat cards (products, orders, revenue, ratings)
- Extract `SellerRecentOrdersTable`
- Extract `SellerRecentProductsList`
- Resulting page: ~70 lines

#### 6.2.6 `blog/page.tsx` (260 lines)

- Move inline `BlogCard` component → `src/components/blog/BlogCard.tsx`
- Move `CATEGORY_BADGE` map → `src/constants/ui.ts` as `UI_BADGE_VARIANTS.BLOG_CATEGORY`
- Extract `BlogCategoryTabs` → `src/components/blog/BlogCategoryTabs.tsx`
- Resulting page: ~60 lines

#### 6.2.7 `checkout/success/page.tsx` (262 lines) ✅

- Extracted `OrderSuccessHero` — green checkmark hero with title, subtitle, email confirmation
- Extracted `OrderSuccessCard` — full order detail card (ID, status badge, product row, payment, shipping)
- Extracted `OrderSuccessActions` — bottom action links (view order, my orders, continue shopping)
- Resulting page: ~95 lines

#### 6.2.8 `promotions/page.tsx` (236 lines)

- Move inline `CouponCard` → `src/components/promotions/CouponCard.tsx`
- Move inline `getDiscountLabel` util → `src/utils/formatters/currency.formatter.ts` or `promotions.util.ts`
- Extract `FeaturedProductsSection` → reuse or delegate to `FeaturedProductsSection` from homepage
- Resulting page: ~60 lines

#### 6.2.9 `contact/page.tsx` (215 lines)

- Extract `ContactForm` → `src/components/forms/ContactForm.tsx`
- Extract `ContactInfoCards` (address / phone / email info cards)
- Resulting page: ~40 lines

#### 6.2.10 `sellers/page.tsx` (170 lines) and `about/page.tsx` (176 lines) ✅

- `sellers/page.tsx`: Added `SELLERS_PAGE.STAT_*` constants (8 labels) replacing hardcoded stats bar strings ("500+", "Active Sellers", etc.)
- `about/page.tsx`: Audited — already fully uses `LABELS.*` constants; years in timeline are data values, not UI strings

---

### 6.3 Styling Consistency Audit

> **Goal:** Zero raw Tailwind strings that duplicate what `THEME_CONSTANTS` already defines.

| Location                          | Issue                                                        | Fix                                                    |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| `sellers/page.tsx` L46, L52, L156 | Raw `bg-white text-emerald-700 ... rounded-full` CTA buttons | Add `THEME_CONSTANTS.button.ctaPrimary/ctaOutline`     |
| Star ratings across 4+ pages      | `text-yellow-400` / `text-gray-300` hardcoded per file       | Add `THEME_CONSTANTS.rating.filled` / `.empty`         |
| `promotions/page.tsx` L55         | `"Active"` string hardcoded                                  | Use `UI_LABELS.STATUS.ACTIVE`                          |
| `seller/page.tsx` L242            | Raw `bg-gray-100 text-gray-700` status variant               | Use `THEME_CONSTANTS.badge.*` or `StatusBadge`         |
| `seller/orders/page.tsx` L151     | Raw `hover:text-gray-700 dark:hover:text-gray-300` tab hover | Extract tab active/inactive to `THEME_CONSTANTS.tab`   |
| `search/page.tsx` L211            | Raw `text-gray-400` search icon                              | Use `themed.textMuted` or `THEME_CONSTANTS.icon.muted` |
| Analytics pages                   | `style={{ height: 240 }}` inline style                       | Use `THEME_CONSTANTS.chart.height` Tailwind token      |

**New THEME_CONSTANTS to add** in `src/constants/theme.ts`:

```ts
rating: { filled: "text-yellow-400", empty: "text-gray-300 dark:text-gray-600" },
button: { ctaPrimary: "bg-white text-emerald-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-emerald-50 transition-colors shadow-lg",
          ctaOutline: "border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-colors" },
tab: { active: "border-b-2 border-indigo-600 text-indigo-600 font-medium",
       inactive: "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" },
chart: { height: "h-60" },
icon: { muted: "text-gray-400 dark:text-gray-500" },
```

---

### 6.4 Empty States & Loading Skeletons ✅

> **Goal:** Every list/table has a consistent `EmptyState` and a skeleton loading screen instead of raw spinners.

| Page / Component                             | Status                     |
| -------------------------------------------- | -------------------------- |
| `user/orders/page.tsx`                       | ✅ Already used EmptyState |
| `user/orders/view/[id]/page.tsx`             | ✅ Already used EmptyState |
| `user/notifications/page.tsx`                | ✅ Already used EmptyState |
| `search/page.tsx` (via SearchResultsSection) | ✅ Now uses EmptyState     |
| `blog/page.tsx`                              | ✅ Now uses EmptyState     |
| `seller/page.tsx`                            | ✅ Now uses EmptyState     |

Added `BLOG_PAGE` constants (`TITLE`, `SUBTITLE`, `NO_POSTS`, `NO_POSTS_DESCRIPTION`, `PAGE_OF`) to `ui.ts`.  
Replaced all hardcoded blog string literals with constants.

---

### 6.5 PWA Icon Assets

- **Add** `/public/icons/icon-192.png` (192×192 px, opaque background, LetItRip logo)
- **Add** `/public/icons/icon-512.png` (512×512 px, maskable, safe zone center logo)
- **Update** `src/app/manifest.ts` — replace SVG-only icon array with:
  ```ts
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
    { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
  ];
  ```
- **Prerequisite:** Design/generate icons (can use [Maskable.app](https://maskable.app) or Figma export)
- **Priority:** 🟡 P2 (needed for full PWA installability score)

---

### 6.6 Mobile & Responsive Polish ✅

| Area                        | Status                                                         |
| --------------------------- | -------------------------------------------------------------- |
| `blog/page.tsx`             | ✅ Category tabs now use horizontal scroll (`overflow-x-auto`) |
| `BottomNavbar`              | ✅ Seller dashboard quick-link added for seller/admin users    |
| `search/page.tsx`           | ✅ `SearchFiltersRow` uses `flex-wrap` (adapts naturally)      |
| `seller/analytics/page.tsx` | ✅ `ResponsiveContainer width="100%"` already in place         |
| `checkout/page.tsx`         | ✅ Stepper labels already `hidden sm:block`                    |
| Admin tables                | ✅ `DataTable` already has `overflow-x-auto`                   |

---

### 6.7 Dark Mode Consistency Sweep ✅

**Fixed:**

- `ErrorBoundary.tsx` — all 4 background classes now have `dark:` counterparts; hardcoded strings replaced with `UI_LABELS.*`
- `SellerRevenueChart.tsx` — Recharts axis tick `fill` prop now uses `useTheme()` to pick `#9ca3af` (dark) or `#6b7280` (light)

**Audited, no changes needed:**

- Hero CTA buttons (`bg-white` on gradient backgrounds) — intentional design
- Carousel arrows (`bg-white/80`) — intentional on image overlay
- Recharts Tooltip — default white background contrasts fine in both modes

---

### 6.8 Accessibility Improvements ✅

| Fix                             | Status                                                                |
| ------------------------------- | --------------------------------------------------------------------- |
| Images missing `alt`            | ✅ ProductCard + BlogCard already use descriptive alt text            |
| Icon buttons without aria-label | ✅ NotificationItem mark-read/delete + Modal close + HeroCarousel nav |
| FormField `htmlFor`/`id`        | ✅ Already wired in FormField component                               |
| SideDrawer + Modal ARIA         | ✅ Already have `aria-modal`, `role`, `aria-labelledby`               |
| Hardcoded ARIA strings          | ✅ HeroCarousel + Modal now use `UI_LABELS.*` constants               |

---

### Phase 6 Progress Tracker

| Task                               | Status                     |
| ---------------------------------- | -------------------------- |
| 6.1 Admin Payouts UI               | ✅ Done                    |
| 6.2.1 seller/payouts decomposition | ✅ Done                    |
| 6.2.2 search page decomposition    | ✅ Done                    |
| 6.2.3 user/notifications decompose | ✅ Done                    |
| 6.2.4 seller/analytics decompose   | ✅ Done                    |
| 6.2.5 seller/page decompose        | ✅ Done                    |
| 6.2.6 blog page decompose          | ✅ Done                    |
| 6.2.7 checkout/success decompose   | ✅ Done                    |
| 6.2.8 promotions page decompose    | ✅ Done                    |
| 6.2.9 contact page decompose       | ✅ Done                    |
| 6.2.10 sellers + about cleanup     | ✅ Done                    |
| 6.3 THEME_CONSTANTS audit          | ✅ Done                    |
| 6.4 Empty states & skeletons       | ✅ Done                    |
| 6.5 PWA icon assets                | 🟡 Blocked (design needed) |
| 6.6 Mobile & responsive polish     | ✅ Done                    |
| 6.7 Dark mode sweep                | ✅ Done                    |
| 6.8 Accessibility improvements     | ✅ Done                    |

---

## Dead Links Summary

**All routes are now implemented.** This table tracked routes without pages; all have since been built.

| Route             | Status  |
| ----------------- | ------- |
| `/products`       | ✅ Done |
| `/cart`           | ✅ Done |
| `/checkout`       | ✅ Done |
| `/admin/products` | ✅ Done |
| `/admin/orders`   | ✅ Done |
| `/admin/coupons`  | ✅ Done |
| `/categories`     | ✅ Done |
| `/search`         | ✅ Done |
| `/auctions`       | ✅ Done |
| `/seller`         | ✅ Done |
| `/about`          | ✅ Done |
| `/contact`        | ✅ Done |
| `/help`           | ✅ Done |
| `/terms`          | ✅ Done |
| `/privacy`        | ✅ Done |
| `/sellers`        | ✅ Done |
| `/blog`           | ✅ Done |
| `/promotions`     | ✅ Done |

---

## API Endpoints to Build

**All planned API endpoints are now implemented.**

| Endpoint                         | Method             | Status |
| -------------------------------- | ------------------ | ------ |
| `/api/cart`                      | GET, POST          | ✅     |
| `/api/cart/[itemId]`             | PATCH, DELETE      | ✅     |
| `/api/checkout`                  | POST               | ✅     |
| `/api/payment/create-order`      | POST               | ✅     |
| `/api/payment/verify`            | POST               | ✅     |
| `/api/payment/webhook`           | POST               | ✅     |
| `/api/admin/orders`              | GET                | ✅     |
| `/api/admin/orders/[id]`         | GET, PATCH         | ✅     |
| `/api/admin/products`            | GET                | ✅     |
| `/api/admin/products/[id]`       | GET, PATCH, DELETE | ✅     |
| `/api/admin/coupons`             | GET, POST          | ✅     |
| `/api/admin/coupons/[id]`        | GET, PATCH, DELETE | ✅     |
| `/api/coupons/validate`          | POST               | ✅     |
| `/api/user/wishlist`             | GET, POST          | ✅     |
| `/api/user/wishlist/[productId]` | DELETE             | ✅     |
| `/api/search`                    | GET                | ✅     |
| `/api/bids`                      | GET, POST          | ✅     |
| `/api/bids/[id]`                 | GET                | ✅     |
| `/api/seller/orders`             | GET                | ✅     |
| `/api/seller/analytics`          | GET                | ✅     |
| `/api/seller/payouts`            | GET, POST          | ✅     |
| `/api/admin/analytics`           | GET                | ✅     |
| `/api/admin/payouts`             | GET                | ✅     |
| `/api/admin/payouts/[id]`        | PATCH              | ✅     |
| `/api/contact`                   | POST               | ✅     |
| `/api/notifications`             | GET, POST          | ✅     |

---

## Component Library Gaps

**All planned components are now implemented.**

---

## Schema / Repository Gaps

**All planned schemas and repositories are now implemented.**

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

---

## Phase 7 — Production Hardening & Quality

**Goal**: Close remaining gaps before public launch — test coverage, performance, and the high-priority `TODO (Future)` items catalogued in `docs/TECH_DEBT.md`.

**Tracker:**

| Sub-phase | Task                                                                    | Status                                                           |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 7.1       | Test coverage sweep — fix failing test suites                           | ✅ Done — 166/166 suites, 2285 tests passing                     |
| 7.2       | Performance audit — bundle analysis, image optimisation, code splitting | ✅ Done — bundle analyzer, dynamic imports, image sizes          |
| 7.3       | Purchase verification gate for reviews                                  | ✅ Done — 403 gate + verified flag on confirmed orders           |
| 7.4       | Seller email verification required before listing products              | ✅ Done — requireEmailVerified gate in POST /api/products        |
| 7.5       | Status transition validation (draft→published; block invalid moves)     | ✅ Done — PRODUCT_STATUS_TRANSITIONS map + 422 gate in PATCH     |
| 7.6       | Audit log for admin site-settings changes                               | ✅ Done — serverLogger.info audit entry on PATCH                 |
| 7.7       | Admin notification on new product submitted for approval                | ✅ Done — sendNewProductSubmittedEmail + fire-and-forget in POST |
| 7.8       | SEO slug generation for products and FAQs                               | ✅ Done — slug on ProductDocument + create; seo.slug in FAQ POST |
| 7.9       | 6.5 PWA icons — unblock when design assets provided                     | 🟡 Blocked (design)                                              |

---

### Phase 7.1 — Test Coverage Sweep ✅

**Outcome**: Fixed 7 failing test suites (6 mock gaps + 1 Resend init crash + 1 rate-limiter state leak). All 166 test suites now pass.

**What was fixed**:

- `auth.test.ts` — mocked `@/lib/email` (Resend module-level init) + `@/lib/security/rate-limit` (shared in-memory state exhausted across login/register tests)
- `site-settings.test.ts` — added `@/lib/errors/error-handler` mock with name-based 401/403 mapping
- 5 page tests (`orders`, `wishlist`, `order-view`, `user-profile`, `profile/[userId]`) — added `useApiQuery` to `@/hooks` mocks

---

### Phase 7.2 — Performance Audit ✅

**Goal**: Reduce initial page-load time and bundle size before public launch.

**Completed**:

- Installed `@next/bundle-analyzer`; added `npm run analyze` script and `withBundleAnalyzer` wrapper in `next.config.js`
- `src/app/page.tsx`: 10 below-fold homepage sections converted to `dynamic()` with `ssr: true` (`TopCategories`, `FeaturedProducts`, `FeaturedAuctions`, `AdvertisementBanner`, `SiteFeatures`, `CustomerReviews`, `WhatsApp`, `FAQ`, `BlogArticles`, `Newsletter`)
- Above-fold sections (`HeroCarousel`, `WelcomeSection`, `TrustIndicatorsSection`) remain static
- `CustomerReviewsSection`: added missing `sizes="40px"` to review avatar `<Image>`
- All other `<Image>` usages already have correct `sizes` and `priority` attributes
- Font audit: only system fonts in `globals.css` — no external font loading, already optimal
- Recharts already lazy-imported with `ssr: false` in `SellerRevenueChart.tsx`
- Test fix: `page.test.tsx` updated to mock `next/dynamic` via `React.lazy` + `findByTestId` for async sections

---

### Phase 7.3–7.8 — Tech Debt Execution

See `docs/TECH_DEBT.md` **High Impact** and **Medium Impact** tables for full descriptions.

---

## Phase 8 — Internationalisation (i18n)

**Goal**: Multi-language support (en + hi at minimum).

**Prerequisite**: All UI text already uses `UI_LABELS.*` — constants become the translation key source.

**Scope** (planned):

- Integrate `next-intl` (App Router native)
- Map all `UI_LABELS.*` keys to translation JSON files
- Locale-aware routing (`/en/`, `/hi/`)
- Update Zod schemas to use locale-aware error messages (`schemas.ts:797,812`)

**Status**: 🔲 Not Started — after Phase 7
