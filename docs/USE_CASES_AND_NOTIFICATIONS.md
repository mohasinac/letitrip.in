# Use Cases & Notification Audit — LetItRip.in

> **Generated**: March 7, 2026  
> **Scope**: Full codebase analysis covering all role-based use cases, every user-facing action, and a complete audit of `useMessage` / `useToast` toast feedback coverage with actionable gap fixes.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Role Matrix](#2-role-matrix)
3. [Public Pages Inventory](#3-public-pages-inventory)
4. [Use Cases by Actor](#4-use-cases-by-actor)
   - 4.1 [Guest (Unauthenticated)](#41-guest-unauthenticated)
   - 4.2 [Registered Buyer](#42-registered-buyer)
   - 4.3 [Seller](#43-seller)
   - 4.4 [Moderator](#44-moderator)
   - 4.5 [Admin](#45-admin)
5. [Feature Module Use Cases](#5-feature-module-use-cases)
6. [Notification Architecture](#6-notification-architecture)
7. [Toast Feedback Audit](#7-toast-feedback-audit)
8. [Gap Fix Plan](#8-gap-fix-plan)

---

## 1. Platform Overview

**LetItRip.in** is a multi-vendor e-commerce marketplace with the following major capabilities:

| Capability       | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| Product Listings | Standard buy-now products from multiple sellers                |
| Auctions         | Real-time competitive bidding with closing timers              |
| Pre-orders       | Deposit-based reservation for upcoming products                |
| Seller Stores    | Each seller has a public storefront with its own catalog       |
| Promotions       | Time-limited coupons + promotional banners                     |
| RipCoins         | Platform loyalty currency — purchasable, spendable at checkout |
| Reviews          | Buyer reviews with admin moderation                            |
| Events           | Community contests / photo events with leaderboards            |
| Chat             | Real-time buyer–seller messaging (Firebase RTDB)               |
| Blog             | Admin-authored SEO articles                                    |
| FAQs             | Categorised help content (static, no DB)                       |
| i18n             | English + Hindi, fully translated UI                           |

---

## 2. Role Matrix

| Role           | Hierarchy Level | Key Permissions                                                                                                                     |
| -------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `user` (buyer) | 0               | Browse, purchase, wishlist, review, bid, chat, manage own profile/addresses/orders                                                  |
| `seller`       | 1               | All buyer permissions + manage own products/store/auctions/payouts/shipping                                                         |
| `moderator`    | 2               | All seller permissions + review moderation, FAQ management                                                                          |
| `admin`        | 3               | All moderator permissions + user management, site config, carousel, homepage sections, categories, coupons, blog, events, analytics |

**Auth guards**: Every protected route uses `RBAC_CONFIG` + server-side session cookie validation.  
**Frontend gate**: `useCanAccess`, `useRequireAuth`, `useRequireRole`.

---

## 3. Public Pages Inventory

All routes below are fully accessible without authentication. They are the primary surface area for SEO, discovery, and conversion.

### 3.1 Commerce & Discovery Pages

| Route                 | Page                  | Interactive Elements                                                                                                      | Auth Required                 |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `/`                   | Homepage              | Carousel, section links, category shortcuts, search bar                                                                   | No                            |
| `/products`           | Product listing       | Filters (category, price, condition, brand), sort, infinite scroll / pagination                                           | No                            |
| `/products/[slug]`    | Product detail        | Image gallery, reviews, bid form (redirect if guest), "Add to Cart" (redirect if guest), "Ask Seller" (redirect if guest) | No (read) / Yes (actions)     |
| `/auctions`           | Auction listing       | Filter by status/category, sort by end date / bid count                                                                   | No                            |
| `/auctions/[slug]`    | Auction detail        | Live bid feed, countdown timer, bid form (redirect if guest)                                                              | No (read) / Yes (bidding)     |
| `/pre-orders`         | Pre-order listing     | Filter, sort, bulk wishlist (redirect if guest)                                                                           | No                            |
| `/pre-orders/[slug]`  | Pre-order detail      | Reserve now (redirect if guest), wishlist toggle (redirect if guest)                                                      | No (read) / Yes (reserve)     |
| `/cart`               | Shopping cart         | Quantity ±, remove, coupon, checkout (redirect if guest)                                                                  | Redirects to login if guest   |
| `/checkout`           | Checkout flow         | Address select/create, payment method, order confirm                                                                      | Yes                           |
| `/search`             | Search results        | Full-text, filters (category, price, condition), sort, pagination                                                         | No                            |
| `/categories`         | Category index        | Hierarchical category tree                                                                                                | No                            |
| `/categories/[slug]`  | Category products     | Products filtered to category + sub-categories                                                                            | No                            |
| `/promotions`         | Promotions            | Active coupons (reveal code requires login), sale banners                                                                 | No (view) / Yes (reveal code) |
| `/stores`             | All sellers           | Seller directory with ratings                                                                                             | No                            |
| `/sellers`            | Sellers listing       | Filterable seller directory                                                                                               | No                            |
| `/sellers/[id]`       | Seller public profile | Store info, ratings, active products                                                                                      | No                            |
| `/stores/[storeSlug]` | Seller storefront     | Full storefront: about, products, reviews, contact                                                                        | No                            |
| `/reviews`            | Public reviews        | Platform-wide featured reviews                                                                                            | No                            |
| `/track`              | Order tracking guide  | How-to steps with links to `/user/orders`                                                                                 | No                            |
| `/events`             | Events listing        | Event cards with entry CTA (redirect if guest)                                                                            | No                            |
| `/events/[id]`        | Event detail          | Leaderboard, entry form (redirect if guest)                                                                               | No (read) / Yes (enter)       |

---

### 3.2 Help & Information Pages

| Route              | Page                    | Interactive Elements                                                                      | Notes                                                                           |
| ------------------ | ----------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/faqs`            | FAQ centre              | Search, category tabs, accordion, **helpfulness voting**, copy-link, sort by Most Helpful | Voting: no auth required (single vote enforced client-side via component state) |
| `/faqs/[category]` | Category FAQ            | Same as `/faqs` but pre-filtered to one category                                          |                                                                                 |
| `/help`            | Help centre             | Topic shortcuts linking to FAQ categories, contact CTA                                    | Static + links only                                                             |
| `/contact`         | Contact form            | Name, email, subject, message → `POST /api/contact`                                       | No auth required                                                                |
| `/seller-guide`    | Seller onboarding guide | Static step-by-step guide, CTA to register/apply                                          | No                                                                              |
| `/blog`            | Blog index              | Post cards with category filter                                                           | No                                                                              |
| `/blog/[slug]`     | Blog post               | Full article, related posts, social share buttons                                         | No                                                                              |

---

### 3.3 Auth Pages

| Route                   | Page               | Notes                                                      |
| ----------------------- | ------------------ | ---------------------------------------------------------- |
| `/auth/login`           | Login              | Email/pass + Google + Apple; redirects authenticated users |
| `/auth/register`        | Register           | Email/pass + Google + Apple; redirects authenticated users |
| `/auth/forgot-password` | Forgot password    | Sends reset email                                          |
| `/auth/reset-password`  | Reset password     | Consumed via `?token=` query param                         |
| `/auth/verify-email`    | Email verification | Consumed via `?token=` query param                         |
| `/unauthorized`         | Access denied      | Shown when RBAC blocks a route                             |

---

### 3.4 Legal / Static Pages

| Route            | Page                    | Interactive Elements    |
| ---------------- | ----------------------- | ----------------------- |
| `/about`         | About us                | Static, no interactions |
| `/privacy`       | Privacy policy          | Static                  |
| `/terms`         | Terms of service        | Static                  |
| `/refund-policy` | Refund & returns policy | Static                  |
| `/cookies`       | Cookie policy           | Static                  |

---

### 3.5 FAQ Helpfulness Voting (Detail)

FAQs are **static data** (`src/constants/faq-data.ts`, 102 entries across 7 categories). Voting increments stats in Firestore via the `/api/faqs/[id]/vote` endpoint.

**Component**: `FAQHelpfulButtons.tsx` (`src/features/faq/components/`)  
**Hook**: `useFaqVote()` → `faqService.vote()` → `POST /api/faqs/[id]/vote`

**Voting rules**:

- **No auth required** — any visitor can vote
- **One vote per session** — enforced client-side via component `useState`; once voted, both buttons are disabled for that render
- Optimistic local count update (no refetch needed)
- Failure is silent (logged via `logger.error`; no toast shown to user)

**Toast gap** (low priority):  
On successful vote there is no confirmation — the button simply changes to a filled/active state. No `showSuccess` toast is shown. This is arguably acceptable UX (button state itself is confirmation), but if a toast is desired:

```ts
// In FAQHelpfulButtons.tsx handleVote, after successful mutation:
if (isHelpful) {
  showSuccess(t("thanksForFeedback")); // already rendered inline — optional toast
}
```

**Sort by helpfulness**: The `/faqs` page supports sorting by `helpful` count via `useUrlTable` + `FAQSortDropdown`. The sort is purely client-side over the static data array.

---

## 4. Use Cases by Actor

### 4.1 Guest (Unauthenticated)

| ID   | Use Case                           | Entry Point                                                  | Outcome                                                                                  |
| ---- | ---------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| G-01 | Browse product listings            | `/products`                                                  | View grid with filters (category, price, condition, sort)                                |
| G-02 | View product detail                | `/products/[slug]`                                           | See images, specs, price, seller info, reviews, related products                         |
| G-03 | View auction listing               | `/auctions`                                                  | See live bids, countdown timer, current highest bid                                      |
| G-04 | View pre-order products            | `/pre-orders`                                                | See upcoming products available for deposit reservation                                  |
| G-05 | Browse seller storefront           | `/stores/[storeSlug]`                                        | See seller profile, ratings, active listings                                             |
| G-06 | Search across site                 | `/search?q=...`                                              | Full-text + filter search results                                                        |
| G-07 | View categories                    | `/categories/[slug]`                                         | Products filtered by category hierarchy                                                  |
| G-08 | View promotions                    | `/promotions`                                                | Active coupon reveals, promotional banners                                               |
| G-09 | Read blog posts                    | `/blog`, `/blog/[slug]`                                      | SEO articles with related posts                                                          |
| G-10 | Browse FAQ centre                  | `/faqs`, `/faqs/[category]`                                  | Searchable accordion, 7 categories, sort by Most Helpful                                 |
| G-11 | **Vote FAQ helpful / not helpful** | `/faqs` → `FAQHelpfulButtons`                                | Increments `helpful`/`notHelpful` counter via API; one vote per session (no auth needed) |
| G-12 | Copy FAQ link to clipboard         | `/faqs` FAQ accordion                                        | Share URL toast shown                                                                    |
| G-13 | View events                        | `/events`, `/events/[id]`                                    | Event listings + leaderboard                                                             |
| G-14 | Contact support                    | `/contact`                                                   | Submit contact form (name/email/message)                                                 |
| G-15 | Browse help centre topics          | `/help`                                                      | Topic shortcuts → FAQ categories + contact CTA                                           |
| G-16 | Read about/legal pages             | `/about`, `/privacy`, `/terms`, `/refund-policy`, `/cookies` | Static content                                                                           |
| G-17 | Browse sellers directory           | `/sellers`, `/sellers/[id]`                                  | Seller listings and public profiles                                                      |
| G-18 | View public reviews page           | `/reviews`                                                   | Platform-wide featured reviews                                                           |
| G-19 | View order tracking guide          | `/track`                                                     | How-to steps for tracking an order                                                       |
| G-20 | Register account                   | `/auth/register`                                             | Email/password or Google/Apple OAuth, display name                                       |
| G-21 | Login                              | `/auth/login`                                                | Email/password or Google/Apple OAuth                                                     |
| G-22 | Forgot password                    | `/auth/forgot-password`                                      | Request reset email                                                                      |
| G-23 | Reset password                     | `/auth/reset-password?token=…`                               | Set new password via token                                                               |
| G-24 | Verify email                       | `/auth/verify-email?token=…`                                 | Confirm email address                                                                    |
| G-25 | View seller guide                  | `/seller-guide`                                              | Step-by-step guide to become a seller                                                    |
| G-26 | Add item to cart (redirect)        | Product detail → "Add to Cart"                               | Redirected to login with return URL                                                      |

---

### 4.2 Registered Buyer

All Guest use cases plus:

| ID   | Use Case                                 | Entry Point                                | Outcome                                                         |
| ---- | ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| B-01 | Add to cart                              | Product detail / Product card              | Item added; quantity / variant selection                        |
| B-02 | Remove from cart                         | `/cart`                                    | Item removed from cart                                          |
| B-03 | Update cart quantity                     | `/cart`                                    | Quantity adjusted (+/−)                                         |
| B-04 | Apply coupon                             | `/cart` or Checkout                        | Discount applied if valid                                       |
| B-05 | Go to checkout                           | `/cart` → `/checkout`                      | Multi-step: Address → Payment → Review                          |
| B-06 | Select / add address at checkout         | Checkout Step 1                            | Choose saved address or create new                              |
| B-07 | Pay with Razorpay (UPI/Card/Net Banking) | Checkout Step 2                            | Razorpay modal; on success → order created                      |
| B-08 | Pay Cash on Delivery                     | Checkout Step 2                            | COD order created directly                                      |
| B-09 | Pay with RipCoins                        | Checkout Step 2                            | Platform coins deducted                                         |
| B-10 | View order history                       | `/user/orders`                             | List of all orders with status                                  |
| B-11 | View order detail / track                | `/user/orders/[id]`                        | Status timeline, tracking info, invoice                         |
| B-12 | Cancel order                             | Order detail                               | Cancel if still in cancellable state                            |
| B-13 | Add to wishlist                          | Any product card or detail                 | Heart icon toggles wishlist                                     |
| B-14 | Remove from wishlist                     | `/user/wishlist` or product card           | Remove individual or bulk remove                                |
| B-15 | Bulk add wishlist to cart                | `/user/wishlist`                           | All wish-listed items added to cart                             |
| B-16 | Write product review                     | Product detail (post-purchase)             | Star rating + text; queued for moderation                       |
| B-17 | Vote on existing review                  | Product detail                             | Mark review as helpful / not helpful                            |
| B-18 | Place auction bid                        | `/auctions/[id]`                           | Enter bid amount; real-time update                              |
| B-19 | Reserve pre-order product                | `/pre-orders/[id]`                         | Pay deposit to secure stock                                     |
| B-20 | Manage saved addresses                   | `/user/addresses`                          | Create / edit / delete / set default                            |
| B-21 | Edit profile                             | `/profile`                                 | Display name, avatar (crop/zoom upload)                         |
| B-22 | Change password                          | `/user/settings`                           | Current + new password validation                               |
| B-23 | Resend verification email                | `/user/settings`                           | Trigger re-send via email                                       |
| B-24 | View active sessions                     | `/user/settings` (Security tab)            | See all login sessions                                          |
| B-25 | Revoke own session                       | `/user/settings`                           | Sign out a specific device                                      |
| B-26 | View notifications                       | `/user/notifications`                      | In-app notification feed                                        |
| B-27 | Mark notification as read                | Notification bell or `/user/notifications` | Badge clears                                                    |
| B-28 | Mark all notifications read              | `/user/notifications`                      | Bulk clear unread badge                                         |
| B-29 | Delete notification                      | `/user/notifications`                      | Remove single notification                                      |
| B-30 | Purchase RipCoins                        | `/user/ripcoin`                            | Buy coin packs via Razorpay                                     |
| B-31 | View coin balance / history              | `/user/ripcoin`                            | Wallet balance + transaction log                                |
| B-32 | Chat with seller                         | Product detail → "Ask Seller"              | Real-time buyer–seller messaging                                |
| B-33 | View all chats                           | `/user/messages`                           | List of open chat threads                                       |
| B-34 | Apply as seller                          | `/user/become-seller`                      | Fill in store name + category; application sent                 |
| B-35 | Vote FAQ helpful/not helpful             | `/faqs`                                    | Same as G-11 — no auth required, included here for completeness |
| B-36 | Copy FAQ link to clipboard               | `/faqs`                                    | Share link copied, toast shown                                  |
| B-37 | Subscribe to newsletter                  | Footer / homepage                          | Email opt-in                                                    |

---

### 4.3 Seller

All Buyer use cases plus:

| ID   | Use Case                   | Entry Point                           | Outcome                                                               |
| ---- | -------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| S-01 | Set up store profile       | `/seller/store/setup`                 | Store name, logo, description, category                               |
| S-02 | View seller dashboard      | `/seller`                             | KPI cards: revenue, orders, products, ratings                         |
| S-03 | Create product listing     | `/seller/products/create`             | Full product form: title, description, images, price, stock, variants |
| S-04 | Edit product listing       | `/seller/products/[id]/edit`          | Update any product field                                              |
| S-05 | Delete product listing     | Seller products table                 | Soft-delete with confirmation modal                                   |
| S-06 | Create auction listing     | Product create with `isAuction: true` | Set starting bid, reserve price, end date                             |
| S-07 | Edit auction               | Seller products table → edit          | Update auction parameters before start                                |
| S-08 | View seller orders         | `/seller/orders`                      | All orders for seller's products                                      |
| S-09 | Mark order as shipped      | Seller orders → "Ship"                | Enter tracking number + courier                                       |
| S-10 | View order detail          | Seller orders list → expand           | Full order info, buyer address                                        |
| S-11 | Request payout             | `/seller/payouts`                     | Trigger payout for eligible earnings                                  |
| S-12 | View payout history        | `/seller/payouts`                     | Past payout requests + status                                         |
| S-13 | Set payout method          | `/seller/settings/payouts`            | UPI ID or bank account details                                        |
| S-14 | Configure shipping         | `/seller/settings/shipping`           | Custom rates or Shiprocket integration                                |
| S-15 | Manage seller addresses    | `/seller/settings/addresses`          | Pickup/business addresses                                             |
| S-16 | View seller analytics      | `/seller/analytics`                   | Revenue chart, top products, conversion                               |
| S-17 | View seller store (public) | `/stores/[storeSlug]`                 | Preview public storefront                                             |

---

### 4.4 Moderator

All Seller use cases plus:

| ID   | Use Case                     | Entry Point                             | Outcome                                   |
| ---- | ---------------------------- | --------------------------------------- | ----------------------------------------- |
| M-01 | Approve product review       | Admin → Reviews                         | Review becomes visible publicly           |
| M-02 | Reject product review        | Admin → Reviews                         | Review hidden with rejection reason       |
| M-03 | Delete review                | Admin → Reviews                         | Permanent removal                         |
| M-04 | Bulk approve pending reviews | Admin → Reviews → "Approve All Pending" | All pending reviews approved in one click |
| M-05 | Create FAQ                   | Admin → FAQs → Add                      | New FAQ added to a category               |
| M-06 | Edit FAQ                     | Admin → FAQs list → Edit                | Update question, answer, category, tags   |
| M-07 | Delete FAQ                   | Admin → FAQs list → Delete              | Remove with confirm modal                 |

---

### 4.5 Admin

All Moderator use cases plus:

| ID   | Use Case                 | Entry Point                     | Outcome                                                                         |
| ---- | ------------------------ | ------------------------------- | ------------------------------------------------------------------------------- |
| A-01 | View admin dashboard     | `/admin`                        | System-wide KPIs, revenue, new users, orders                                    |
| A-02 | Search / filter users    | `/admin/users`                  | By role, email, status, join date                                               |
| A-03 | View user detail         | Admin Users → expand row        | Orders, sessions, role, status                                                  |
| A-04 | Change user role         | Admin Users → role select       | Promote/demote seller, moderator                                                |
| A-05 | Ban user                 | Admin Users → "Ban"             | Disables login; sets `disabled: true`                                           |
| A-06 | Unban user               | Admin Users → "Unban"           | Re-enables login                                                                |
| A-07 | Revoke user's sessions   | Admin Users → "Revoke Sessions" | All active sessions invalidated                                                 |
| A-08 | Revoke single session    | Admin Sessions → "Revoke"       | Specific session killed                                                         |
| A-09 | Manage carousel slides   | `/admin/carousel`               | Create / edit / delete / reorder hero slides                                    |
| A-10 | Manage homepage sections | `/admin/sections`               | Create / edit / delete / reorder content sections                               |
| A-11 | Manage categories        | `/admin/categories`             | Full category tree: create / edit / delete (guards if has children or products) |
| A-12 | Manage coupons           | `/admin/coupons`                | Create / edit / delete discount codes                                           |
| A-13 | Manage blog posts        | `/admin/blog`                   | Create / edit / delete / publish articles                                       |
| A-14 | Approve seller stores    | `/admin/stores`                 | Review and approve pending seller applications                                  |
| A-15 | View all orders          | `/admin/orders`                 | Platform-wide order management                                                  |
| A-16 | Update order status      | Admin Orders → Status form      | Manually set status + tracking                                                  |
| A-17 | Manage payouts           | `/admin/payouts`                | Approve / reject / process payout requests                                      |
| A-18 | Update payout status     | Admin Payouts → status form     | Mark paid/rejected with admin note                                              |
| A-19 | View all products        | `/admin/products`               | Platform-wide product table with create/edit/delete                             |
| A-20 | Manage site settings     | `/admin/site`                   | Basic info, commissions, contact, social links                                  |
| A-21 | View analytics           | `/admin/analytics`              | Platform revenue, user growth, product metrics                                  |
| A-22 | Manage events            | `/admin/events`                 | Create/manage community events                                                  |
| A-23 | Review event entries     | `/admin/events/[id]/entries`    | Approve / flag / reject submissions                                             |
| A-24 | Manage media             | `/admin/media`                  | Video trim, image crop tools                                                    |
| A-25 | View admin bids          | `/admin/bids`                   | All auction bids platform-wide                                                  |
| A-26 | Seed demo data           | `/admin/demo`                   | Seed Firestore with test data (dev only)                                        |

---

## 5. Feature Module Use Cases

### Auth Feature (`src/features/auth/`, `src/hooks/useAuth.ts`)

| Action                 | Mechanism                                                 | Feedback Type                           |
| ---------------------- | --------------------------------------------------------- | --------------------------------------- |
| Email + password login | `useLogin` → `authService.login()` → `/api/auth/login`    | Inline `<Alert>` (intentional for auth) |
| Google OAuth login     | `useGoogleLogin` → Firebase client popup                  | Inline `<Alert>`                        |
| Apple OAuth login      | `useAppleLogin` → Firebase client popup                   | Inline `<Alert>`                        |
| Register               | `useRegister` → `authService.register()`                  | Inline `<Alert>`                        |
| Forgot password        | `useForgotPassword` → `/api/auth/forgot-password`         | Inline success/error messages           |
| Reset password         | `useResetPassword` → `/api/auth/reset-password`           | Inline success/error messages           |
| Verify email           | `useVerifyEmail` → `/api/auth/verify-email`               | Inline success/error messages           |
| Resend verification    | `useResendVerification` → `/api/auth/resend-verification` | Inline success/error messages           |
| Logout                 | `useLogout` → `/api/auth/logout`                          | Toast via `useMessage` (`showSuccess`)  |

> **Decision**: Auth forms intentionally use **inline Alert state** rather than toasts so the user can read the error without it auto-dismissing. This is correct UX.

---

### Cart Feature (`src/features/cart/`)

| Action              | File                                        | Has Toast                                        |
| ------------------- | ------------------------------------------- | ------------------------------------------------ |
| Add to cart         | `AddToCartButton.tsx`, `ProductActions.tsx` | ✅ `showSuccess` + `showError`                   |
| Remove from cart    | `CartView.tsx`                              | ✅ `showSuccess` + `showError`                   |
| Update quantity     | `CartView.tsx`                              | ⚠️ Only `showError` — no `showSuccess` on update |
| Apply coupon        | `CartView.tsx`                              | ✅                                               |
| Proceed to checkout | `CartView.tsx` → `/checkout`                | Route navigation (no toast needed)               |
| Place COD order     | `CheckoutView.tsx`                          | ✅ Redirects to success page                     |
| Pay with Razorpay   | `CheckoutView.tsx`                          | ✅ Error toast + success page redirect           |
| Pay with RipCoins   | `CheckoutView.tsx`                          | ✅                                               |

---

### Products Feature (`src/features/products/`)

| Action                              | File                     | Has Toast                                           |
| ----------------------------------- | ------------------------ | --------------------------------------------------- |
| Toggle wishlist                     | `ProductActions.tsx`     | ✅ `showSuccess` + `showError`                      |
| Add to cart (detail)                | `ProductActions.tsx`     | ✅                                                  |
| Buy Now                             | `ProductActions.tsx`     | ✅                                                  |
| Place auction bid                   | `PlaceBidForm.tsx`       | ✅                                                  |
| Submit product review               | `ProductReviews.tsx`     | ✅                                                  |
| Vote helpful on review              | `ProductReviews.tsx`     | ✅                                                  |
| Bulk wishlist from pre-orders       | `PreOrdersView.tsx`      | ✅ with partial-success count                       |
| Reserve pre-order                   | `PreOrderDetailView.tsx` | ⚠️ Placeholder `showSuccess` — **no real API call** |
| Wishlist toggle on pre-order detail | `PreOrderDetailView.tsx` | ⚠️ **No toast at all**                              |
| Bulk wishlist from auctions         | `AuctionsView.tsx`       | ✅                                                  |

---

### Wishlist Feature (`src/features/wishlist/`, `src/components/user/WishlistButton.tsx`)

| Action                        | File                 | Has Toast                                                |
| ----------------------------- | -------------------- | -------------------------------------------------------- |
| Bulk remove from wishlist     | `WishlistView.tsx`   | ✅ `showSuccess` with count                              |
| Bulk add to cart              | `WishlistView.tsx`   | ✅ `showSuccess` with count                              |
| Toggle wishlist (card button) | `WishlistButton.tsx` | ⚠️ **No toast** for add/remove; error silently swallowed |

---

### User Feature (`src/features/user/`)

| Action                      | File                        | Has Toast                                                                            |
| --------------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| Delete address              | `UserAddressesView.tsx`     | ✅                                                                                   |
| Set default address         | `UserAddressesView.tsx`     | ✅                                                                                   |
| Edit address                | `UserEditAddressView.tsx`   | ✅ via `useUpdateAddress` hook                                                       |
| Update profile              | `UserSettingsView.tsx`      | ✅ via `showToast` (inconsistent: success uses `showToast`, errors use inline Alert) |
| Upload avatar               | `UserSettingsView.tsx`      | ✅                                                                                   |
| Change password             | `UserSettingsView.tsx`      | ✅                                                                                   |
| Resend verification email   | `UserSettingsView.tsx`      | ✅                                                                                   |
| Mark notification read      | `UserNotificationsView.tsx` | ⚠️ Error toast, but **no success toast** for mark-read                               |
| Delete notification         | `UserNotificationsView.tsx` | ✅                                                                                   |
| Mark all notifications read | `UserNotificationsView.tsx` | ⚠️ **No explicit success toast**                                                     |
| Apply as seller             | `BecomeSellerView.tsx`      | ✅ via `useBecomeSeller` hook                                                        |
| Purchase RipCoins           | `RipCoinsPurchaseView.tsx`  | ✅ via `useVerifyRipCoinPurchase` hook                                               |
| Send chat message           | `ChatWindow.tsx`            | No toast needed (real-time UX)                                                       |

---

### Seller Feature (`src/features/seller/`)

| Action                     | File                           | Has Toast                               |
| -------------------------- | ------------------------------ | --------------------------------------- |
| Create product             | `SellerCreateProductView.tsx`  | ✅                                      |
| Edit product               | `SellerEditProductView.tsx`    | ✅                                      |
| Delete product             | `SellerProductsView.tsx`       | ✅                                      |
| Bulk delete products       | `SellerProductsView.tsx`       | ✅ with partial count                   |
| Bulk status change         | `SellerProductsView.tsx`       | ✅                                      |
| Mark order as shipped      | `SellerOrdersView.tsx`         | ⚠️ Error toast ✅, **no success toast** |
| Bulk request payout        | `SellerOrdersView.tsx`         | ✅                                      |
| Save UPI settings          | `SellerPayoutSettingsView.tsx` | ✅ via hook                             |
| Save bank settings         | `SellerPayoutSettingsView.tsx` | ✅ via hook                             |
| Configure shipping         | `SellerShippingView.tsx`       | ✅ via hook                             |
| Delete seller address      | `SellerAddressesView.tsx`      | ✅                                      |
| Set default seller address | `SellerAddressesView.tsx`      | ✅                                      |
| Set up store               | `SellerStoreSetupView.tsx`     | ✅                                      |
| Edit store                 | `SellerStoreView.tsx`          | ✅                                      |

---

### Admin Feature (`src/features/admin/`)

| Action                 | File                                 | Has Toast                                      |
| ---------------------- | ------------------------------------ | ---------------------------------------------- |
| Change user role       | `AdminUsersView.tsx`                 | ✅ via `useToast`                              |
| Ban / unban user       | `AdminUsersView.tsx`                 | ✅ via `useToast`                              |
| Revoke user sessions   | `AdminUsersView.tsx`                 | ✅ via `useToast`                              |
| Update order status    | `AdminOrdersView.tsx`                | ✅                                             |
| Create product (admin) | `AdminProductsView.tsx`              | ⚠️ **No success toast**                        |
| Edit product (admin)   | `AdminProductsView.tsx`              | ⚠️ **No success toast**                        |
| Delete product (admin) | `AdminProductsView.tsx`              | ⚠️ **No success toast**                        |
| Approve review         | `AdminReviewsView.tsx`               | ⚠️ **No success toast**                        |
| Reject review          | `AdminReviewsView.tsx`               | ⚠️ **No success toast**                        |
| Delete review          | `AdminReviewsView.tsx`               | ⚠️ **No success toast**                        |
| Bulk approve reviews   | `AdminReviewsView.tsx`               | ⚠️ **No success toast**                        |
| Create carousel slide  | `AdminCarouselView.tsx`              | ⚠️ **No success toast**                        |
| Edit carousel slide    | `AdminCarouselView.tsx`              | ⚠️ **No success toast**                        |
| Delete carousel slide  | `AdminCarouselView.tsx`              | ⚠️ **No success toast**                        |
| Create category        | `AdminCategoriesView.tsx`            | ⚠️ **No success toast**                        |
| Edit category          | `AdminCategoriesView.tsx`            | ⚠️ **No success toast**                        |
| Delete category        | `AdminCategoriesView.tsx`            | ⚠️ **No success toast**                        |
| Create coupon          | `AdminCouponsView.tsx`               | ✅                                             |
| Edit coupon            | `AdminCouponsView.tsx`               | ✅                                             |
| Delete coupon          | `AdminCouponsView.tsx`               | ✅                                             |
| Create blog post       | `AdminBlogView.tsx`                  | ✅                                             |
| Edit blog post         | `AdminBlogView.tsx`                  | ✅                                             |
| Delete blog post       | `AdminBlogView.tsx`                  | ✅                                             |
| Create FAQ             | `AdminFaqsView.tsx`                  | ✅                                             |
| Edit FAQ               | `AdminFaqsView.tsx`                  | ✅                                             |
| Delete FAQ             | `AdminFaqsView.tsx`                  | ✅                                             |
| Update payout status   | `AdminPayoutsView.tsx`               | ✅                                             |
| Save site settings     | `AdminSiteView.tsx`                  | ✅ via `useToast`                              |
| Review event entry     | `admin/events/[id]/entries/page.tsx` | ⚠️ `showSuccess` imported but **never called** |

---

### Contact / FAQ Features

| Action                         | File                                     | Has Toast                                                                                                        |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Submit contact form            | `ContactForm.tsx`                        | ✅ `showSuccess` + `showError`                                                                                   |
| Copy FAQ link to clipboard     | `FAQAccordion.tsx`                       | ✅ `showSuccess(tActions("linkCopied"))`                                                                         |
| Vote FAQ helpful / not helpful | `FAQHelpfulButtons.tsx` → `useFaqVote()` | ⚠️ **No toast** — button state changes visually but failure is silent (`logger.error` only); see §3.5 for detail |
| Sort FAQs by helpfulness       | `FAQSortDropdown.tsx`                    | No toast needed (URL state change)                                                                               |
| Filter FAQs by category        | `FAQCategorySidebar.tsx`                 | No toast needed (URL state change)                                                                               |
| Search FAQs                    | `FAQPageContent.tsx` inline search       | No toast needed (client-side filter)                                                                             |

---

## 6. Notification Architecture

LetItRip uses **three distinct notification layers**:

### Layer 1 — Toast Messages (Ephemeral, Client-Side)

**Mechanism**: `useMessage()` hook → `useToast()` → `ToastProvider` (global overlay)  
**Trigger**: Explicit `showSuccess(text)` or `showError(text)` call inside a component/hook  
**Lifetime**: 5 seconds auto-dismiss  
**Usage**: Immediate feedback for user-initiated actions (add to cart, save settings, delete item)

```
User action → mutation → success/error → showSuccess/showError → toast overlay (5s)
```

### Layer 2 — In-App Notifications (Persistent, Per-User)

**Mechanism**: Firestore `notifications` collection + Firebase Realtime Database `notifications/{uid}` for push  
**Trigger**: Firebase Cloud Functions (Firestore triggers + Cloud Tasks)  
**Display**: `NotificationBell` component in `TitleBar`, full list at `/user/notifications`  
**Storage**: Pruned after 90 days (`NOTIFICATION_TTL_DAYS = 90`)

**Currently wired notification types** (from `functions/src/triggers/onOrderStatusChange.ts`):

| Event                | Trigger                                 | Recipient               |
| -------------------- | --------------------------------------- | ----------------------- |
| Order status changed | `onOrderStatusChange` Firestore trigger | Buyer                   |
| Auction end / winner | Cloud Task scheduled at bid time        | Winning bidder          |
| Outbid notification  | New bid placed above existing           | Previous highest bidder |

**Notification types** (from `functions/src/constants/messages.ts`):

- `order_placed`, `order_shipped`, `order_delivered`, `order_cancelled`
- `bid_placed`, `bid_won`, `outbid`
- Extensible via `NotificationType` union in triggers

### Layer 3 — Email Notifications (Transactional)

**Mechanism**: Resend API via server-side email templates  
**Trigger**: API routes calling `emailService`  
**Sent for**:

- Email address verification
- Password reset
- Welcome email on register
- Order confirmation
- Seller application status

---

## 7. Toast Feedback Audit

> **Convention note**: Two different toast mechanisms exist in the codebase. New code should standardise on `useMessage()`.
> | Mechanism | Hook | Preferred? |
> |---|---|---|
> | `useMessage()` → `showSuccess/showError` | `src/hooks/useMessage.ts` | ✅ **Preferred** |
> | `useToast()` → `showToast(msg, type)` | `@/components` (ToastProvider) | ⚠️ Legacy — still valid but inconsistent |

---

### 7.1 Gaps Summary Table

| #    | Priority    | File                                                      | Action(s) Missing Toast                      | Type of Gap                                                                             |
| ---- | ----------- | --------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| T-01 | 🔴 High     | `src/features/admin/components/AdminProductsView.tsx`     | Create product, Edit product, Delete product | **No `showSuccess` for any of 3 ops**                                                   |
| T-02 | 🔴 High     | `src/features/admin/components/AdminReviewsView.tsx`      | Approve, Reject, Delete, Bulk Approve        | **No `showSuccess` for any of 4 ops**                                                   |
| T-03 | 🔴 High     | `src/features/admin/components/AdminCarouselView.tsx`     | Create slide, Edit slide, Delete slide       | **No `showSuccess` for any of 3 ops**                                                   |
| T-04 | 🔴 High     | `src/features/admin/components/AdminCategoriesView.tsx`   | Create, Edit, Delete category                | **No `showSuccess` for any of 3 ops**                                                   |
| T-05 | 🟠 Medium   | `src/components/user/WishlistButton.tsx`                  | Toggle add/remove, error on failure          | No toast on toggle; catch block silently swallows errors                                |
| T-06 | 🟠 Medium   | `src/features/seller/components/SellerOrdersView.tsx`     | Mark order as shipped (success)              | `onShipped` only calls `refetch()` — no success feedback                                |
| T-07 | 🟠 Medium   | `src/features/products/components/PreOrderDetailView.tsx` | Wishlist toggle                              | No try/catch, no toast                                                                  |
| T-08 | 🟡 Low      | `src/features/cart/components/CartView.tsx`               | Update quantity                              | Only `showError` — no `showSuccess`                                                     |
| T-09 | 🟡 Low      | `src/features/user/components/UserNotificationsView.tsx`  | Mark as read, Mark all read                  | Missing success toast for mark-read operations                                          |
| T-10 | 🟡 Low      | `src/app/[locale]/seller/payouts/page.tsx`                | Request payout                               | Logic bug: truthy-check on mutation result; `if (result)` → `if (!error)`               |
| T-11 | 🟡 Low      | `src/app/[locale]/admin/events/[id]/entries/page.tsx`     | Approve/Flag/Reject entry                    | `showSuccess` imported but never called                                                 |
| T-12 | 🟡 Low      | `src/components/layout/Sidebar.tsx`                       | Sign-out error                               | Logout error caught, logged, but `showError` never called                               |
| T-13 | 🟡 Low      | `src/features/user/components/UserSettingsView.tsx`       | All error paths                              | Errors use inline Alert state; success uses `showToast` — inconsistent within same file |
| T-14 | ⚪ Optional | `src/features/faq/components/FAQHelpfulButtons.tsx`       | Vote failure                                 | Error silently logged; no user-visible error toast on API failure                       |

---

### 7.2 Detailed Fix Specifications

---

#### T-01 — `AdminProductsView.tsx` — Missing success toasts for all 3 ops

**Current code** (line ~`const { showError } = useMessage()`):

```ts
const { showError } = useMessage();
```

**Fix**: Add `showSuccess` and call it in happy paths.

```ts
// Change destructure
const { showSuccess, showError } = useMessage();

// In handleSave (after successful create):
showSuccess(SUCCESS_MESSAGES.PRODUCT.CREATED);

// In handleSave (after successful edit):
showSuccess(SUCCESS_MESSAGES.PRODUCT.UPDATED);

// In handleConfirmDelete (after successful delete):
showSuccess(SUCCESS_MESSAGES.PRODUCT.DELETED);
```

---

#### T-02 — `AdminReviewsView.tsx` — No success toasts for approve/reject/delete/bulk

**Fix**: After each successful mutation, add:

```ts
// handleApprove success
showToast(SUCCESS_MESSAGES.REVIEW.APPROVED, "success");

// confirmReject success
showToast(SUCCESS_MESSAGES.REVIEW.REJECTED, "success");

// confirmDelete success
showToast(SUCCESS_MESSAGES.REVIEW.DELETED, "success");

// confirmBulkApprove success
showToast(t("bulkApproveSuccess", { count }), "success");
```

---

#### T-03 — `AdminCarouselView.tsx` — No success toasts

**Fix**: Add after each successful carousel mutation:

```ts
// After create
showToast(SUCCESS_MESSAGES.CAROUSEL.CREATED, "success");

// After edit
showToast(SUCCESS_MESSAGES.CAROUSEL.UPDATED, "success");

// After delete
showToast(SUCCESS_MESSAGES.CAROUSEL.DELETED, "success");
```

---

#### T-04 — `AdminCategoriesView.tsx` — No success toasts

**Fix**:

```ts
// After create
showToast(SUCCESS_MESSAGES.CATEGORY.CREATED, "success");

// After edit
showToast(SUCCESS_MESSAGES.CATEGORY.UPDATED, "success");

// After delete
showToast(SUCCESS_MESSAGES.CATEGORY.DELETED, "success");
```

---

#### T-05 — `WishlistButton.tsx` — Silent toggle, silent failure

**Fix**: Read the toggle result and show appropriate toast:

```ts
const { showSuccess, showError } = useMessage();

// In the click handler:
try {
  if (isWishlisted) {
    await removeFromWishlist(productId);
    showSuccess(t("wishlist.removed")); // or UI_LABELS.WISHLIST.REMOVE_FROM_WISHLIST
  } else {
    await addToWishlist(productId);
    showSuccess(t("wishlist.added")); // or UI_LABELS.WISHLIST.ADD_TO_WISHLIST
  }
} catch (err) {
  showError(
    ERROR_MESSAGES.WISHLIST?.TOGGLE_FAILED ?? "Failed to update wishlist",
  );
}
```

---

#### T-06 — `SellerOrdersView.tsx` — No success toast on ship order

**Fix**: In the `ShipOrderModal` `onSuccess` callback (currently just `onShipped={refetch}`):

```ts
// In SellerOrdersView — wrap the refetch callback:
onShipped={() => {
  refetch();
  showSuccess(t("shipSuccess")); // add "shipSuccess" key to messages
}}
```

---

#### T-07 — `PreOrderDetailView.tsx` — Wishlist toggle has no feedback

**Fix**: Wrap the `toggleWishlist()` call:

```ts
const handleWishlistToggle = async () => {
  try {
    await toggleWishlist();
    // toggleWishlist already shows toast in ProductActions — confirm if redundant
  } catch (err) {
    showError(
      ERROR_MESSAGES.WISHLIST?.TOGGLE_FAILED ?? "Failed to update wishlist",
    );
  }
};
```

---

#### T-08 — `CartView.tsx` — No success toast on quantity update

**Fix**: After `updateQuantity` succeeds, add:

```ts
showSuccess(SUCCESS_MESSAGES.CART?.QUANTITY_UPDATED ?? "Quantity updated");
```

> Also add `QUANTITY_UPDATED` to `SUCCESS_MESSAGES.CART` in `src/constants/success-messages.ts`.

---

#### T-09 — `UserNotificationsView.tsx` — Missing success for mark-read

**Fix**:

```ts
// After markRead succeeds:
showSuccess(SUCCESS_MESSAGES.NOTIFICATION.READ);

// After mark-all-read succeeds:
showSuccess(SUCCESS_MESSAGES.NOTIFICATION.ALL_READ);
```

---

#### T-10 — `seller/payouts/page.tsx` — Logic bug on result check

**Current buggy code**:

```ts
const result = await requestPayout(data);
if (result) {
  showSuccess(t("statusPending"));
} else {
  showError(t("noEarnings"));
}
```

**Fix**: Use `onSuccess`/`onError` callbacks instead of truthy-checking the response:

```ts
const { mutate: requestPayout } = useApiMutation(
  API_ENDPOINTS.SELLER.REQUEST_PAYOUT,
  {
    onSuccess: () => showSuccess(t("statusPending")),
    onError: (err) => showError(err.message ?? t("payoutFailed")),
  },
);
```

---

#### T-11 — `admin/events/[id]/entries/page.tsx` — `showSuccess` imported but unused

**Fix**: In the `onSuccess` callback of `EntryReviewDrawer`:

```ts
onSuccess={() => {
  refetch();
  closeDrawer();
  showSuccess(t("reviewSubmitted") ?? "Entry reviewed successfully");
}}
```

---

#### T-12 — `Sidebar.tsx` — Silent logout error

**Fix**:

```ts
} catch (err) {
  logger.error("Logout failed", err);
  showError(UI_LABELS.AUTH.SESSION_CREATE_FAILED); // or a logout-specific message
}
```

---

#### T-13 — `UserSettingsView.tsx` — Inconsistent error feedback

**Fix**: Migrate error paths from inline Alert state to `showToast` to match success-path style:

```ts
// Replace setMessage({ type: "error", text }) with:
showToast(text, "error");
```

---

#### T-14 — `FAQHelpfulButtons.tsx` — Silent vote failure

**Context**: FAQ voting requires no auth. The `handleVote` function catches errors, logs them, but shows no user feedback. The button stays in its pre-vote enabled state, making it look like the vote was never recorded.

**Fix** (optional — acceptable to leave as-is if silent degradation is preferred):

```ts
import { useMessage } from "@/hooks";

// Inside FAQHelpfulButtons:
const { showError } = useMessage();

// In the catch block:
catch (error) {
  logger.error(ERROR_MESSAGES.FAQ.VOTE_FAILED, error);
  showError(ERROR_MESSAGES.FAQ.VOTE_FAILED); // add this line
}
```

---

## 8. Gap Fix Plan

### Priority Order

| Priority           | Gaps                                                                                   | Reason                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 🔴 **Immediate**   | T-01, T-02, T-03, T-04                                                                 | Admin ops completing silently — admins have no confirmation their action worked, increasing error rate / repeat clicks |
| 🟠 **Next sprint** | T-05 (WishlistButton), T-06 (ship order), T-07 (pre-order wishlist), T-10 (payout bug) | High user-facing impact; T-10 is a logic bug that could show an error on a successful payout request                   |
| 🟡 **Clean-up**    | T-08, T-09, T-11, T-12, T-13                                                           | UX polish; minor inconsistencies worth tidying                                                                         |
| ⚪ **Optional**    | T-14 (FAQ vote error)                                                                  | Silent degradation on a public no-auth feature; low risk                                                               |

### New Translation Keys Required

The following keys need to be added to `messages/en.json` (and `messages/hi.json`) before implementing the fixes:

```json
{
  "seller": {
    "orders": {
      "shipSuccess": "Order marked as shipped"
    }
  },
  "cart": {
    "quantityUpdated": "Quantity updated"
  },
  "admin": {
    "events": {
      "reviewSubmitted": "Entry reviewed successfully"
    }
  }
}
```

### New Constant Keys Required

Add to `src/constants/success-messages.ts`:

```ts
CART: {
  ...existing,
  QUANTITY_UPDATED: "Quantity updated",
},
WISHLIST: {
  ADDED: "Added to wishlist",
  REMOVED: "Removed from wishlist",
  TOGGLE_FAILED: "Failed to update wishlist",
},
```

### Fixing Tool Inconsistency (useToast vs useMessage)

The following admin views use `useToast` directly instead of `useMessage`:

- `AdminUsersView.tsx`
- `AdminReviewsView.tsx`
- `AdminCarouselView.tsx`
- `AdminCategoriesView.tsx`
- `AdminSiteView.tsx`
- `UserSettingsView.tsx` (for success paths)

These are **not breaking** but during any edit to those files, migrate to `useMessage` for consistency:

```ts
// Before
const { showToast } = useToast();
showToast("Done", "success");

// After
const { showSuccess } = useMessage();
showSuccess("Done");
```

---

## Notification Trigger Opportunities (Firebase Functions)

Beyond toast fixes, the following business events currently generate **no in-app or push notification** but arguably should:

| Event                           | Suggested Trigger                               | Recipient                       |
| ------------------------------- | ----------------------------------------------- | ------------------------------- |
| New review submitted (pending)  | `onReviewCreate` Firestore trigger              | Moderators                      |
| Review approved/rejected        | `onReviewStatusChange`                          | Buyer who wrote the review      |
| Seller application approved     | `onUserRoleChange` (role → seller)              | Seller applicant                |
| New bid placed on your auction  | Already wired for outbid; extend for seller too | Seller                          |
| Payout processed / approved     | `onPayoutStatusChange`                          | Seller                          |
| Payout rejected                 | `onPayoutStatusChange`                          | Seller                          |
| New message in chat             | `onChatMessage` RTDB trigger                    | Recipient (buyer or seller)     |
| Pre-order reservation confirmed | After `PreOrder.create`                         | Buyer                           |
| Coupon expiring soon            | Cloud Schedule (daily)                          | Users who have unused coupons   |
| Order delivered (confirm)       | Order status → `delivered`                      | Buyer (already partially wired) |

All should write to `notifications/{uid}` (Firestore) + push to `notifications/{uid}` (Realtime DB) using the existing `notificationRepository.create()` pattern in `functions/src/repositories/`.

---

_Document maintained in `docs/USE_CASES_AND_NOTIFICATIONS.md`. Update whenever a new feature is added or a toast gap is resolved._
