# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Development phases (Phases 1–67) completed between 2026-01-01 and 2026-02-28.

---

## [2026-03-03] — Modern Design Refresh (Zinc Palette + Flat Design)

### Fixed (Rule Violations)

- **`src/features/user/components/ChatWindow.tsx`**
  - Replaced raw `<textarea>` element with `Textarea` from `@/components` (Rule 7, Rule 8). The raw element used ad-hoc Tailwind border/colour/focus strings; the shared primitive applies `THEME_CONSTANTS` tokens consistently.
  - Wrapped `<Textarea>` in `<div className="flex-1">` to maintain flex expansion behaviour within the input row.
  - Removed `const time = new Date(msg.timestamp)` — direct `new Date()` call in component code (Rule 5). `formatDate` is now called directly with the `number` timestamp.

- **`src/utils/formatters/date.formatter.ts`**
  - Extended `formatDate` signature from `Date | string` to `Date | string | number` so numeric Unix ms timestamps (as produced by Realtime DB) are accepted without requiring an inline `new Date()` at call sites (Rule 31 — extend in-place).
  - Internal coercion updated to `date instanceof Date ? date : new Date(date)` which handles all three input types uniformly.

---

## [2026-03-03] — Modern Design Refresh (Zinc Palette + Flat Design)

### Changed

- **`src/constants/theme.ts`** — Full design token refresh across all `THEME_CONSTANTS` sections:
  - **Neutral palette**: all `gray-*` tokens replaced with `zinc-*` (warmer, more modern — Vercel/Linear/Radix aesthetic). No component files required changes.
  - **Backgrounds**: light mode is now pure `white` base with `zinc-50` secondary surfaces. Dark mode uses `zinc-950` (`#09090b`) base with `zinc-900`/`zinc-800` elevation layers — cleaner surface hierarchy.
  - **Buttons** (`colors.button.*`): removed all gradients (`bg-gradient-to-r from-* to-*`); replaced with flat colours (`bg-indigo-600 hover:bg-indigo-500`). Secondary button is now `zinc-900`/`zinc-100` (context-adaptive).
  - **Cards** (`enhancedCard.*`, `card.*`): upgraded from `rounded-xl` to `rounded-2xl`; elevated uses border + shadow instead of shadow-only; interactive hover adjusts border opacity instead of border colour.
  - **Nav/footer backgrounds** (`layout.navbarBg`, `titleBarBg`, `bottomNavBg`): added `backdrop-blur-sm` + `bg-white/95` for frosted-glass effect.
  - **Footer background**: replaced busy gradient with clean `zinc-50 dark:zinc-900` + top border.
  - **Inputs** (`input.base`, `patterns.adminInput/adminSelect`): `zinc` borders, explicit `text-zinc-*` colours, `focus:outline-none` guard to prevent double-ring.
  - **Alerts** (`colors.alert.*`): dark mode containers switched from solid (`dark:bg-*-950`) to translucent (`dark:bg-*-950/30`) for less visual weight.
  - **Badges** (`colors.badge.*`): `blue-*/green-*/purple-*` swapped to semantic `indigo-*/emerald-*/violet-*`; dark backgrounds use `/50` opacity for softer fill.
  - **Skeletons**: updated to `zinc-200 dark:bg-zinc-700/60`; card skeleton upgraded to `rounded-2xl`.
  - **Tab inactive**: `gray-*` → `zinc-*`; active tab is now `font-semibold` (was `font-medium`).
  - **Bottom nav active** colour: `blue-*` → `indigo-*` for brand consistency.
  - **Page headers** (`pageHeader.adminGradient`): updated gradient from `purple/indigo` to `violet/transparent` for cleaner look.
  - **Icon** standalone tokens: `yellow-*` warning → `amber-*` for visual harmony.
  - **Scrollbars**: replaced gradient thumb with flat `zinc-300/zinc-600`.

- **`src/app/globals.css`** — Updated to match new token values:
  - CSS custom properties (`:root` and `.dark`) updated to zinc RGB values.
  - `body` font-family now includes `Inter` as preferred option (graceful fallback to system fonts).
  - `body` background: `bg-white dark:bg-zinc-950`.
  - Focus ring: `ring-indigo-500` (was `ring-blue-500`); dark offset against `zinc-950`.
  - `.btn-primary`: flat `bg-indigo-600` (no gradient). `.btn-secondary`: `zinc-900/zinc-100`. `.btn-outline`: single `border` with zinc colours.
  - `.input-base`: `zinc` borders, `indigo` focus ring.
  - `.card`: `rounded-2xl`, `border border-zinc-200 dark:border-zinc-800`, `shadow-sm` (no `shadow-md`).
  - `.card-hover`: shadow-based hover (removed `scale-[1.02]`).
  - `.glass` / `.glass-strong`: updated to zinc-based backgrounds.
  - Scrollbar track/thumb: zinc neutrals.
  - Typography CSS classes updated to `zinc-950/zinc-50` for higher contrast.

- **`tailwind.config.js`** — Safelist updated: `zinc-*` classes are now the primary safelisted set; `gray-*` kept as fallback for any components not yet consuming `THEME_CONSTANTS`.

- **`docs/STYLING_GUIDE.md`** — `themed` token reference table updated to reflect zinc values; added palette rationale note.

---

## [2026-03-13] — Firebase Rules Audit & Newsletter Subscriber Feature

### Fixed

- **Rule 17 violation — `CHAT_ROOM_COLLECTION`**: `ChatRoomDocument` interface, `ChatRoomCreateInput` type, and `CHAT_ROOM_COLLECTION` constant were inlined in `src/repositories/chat.repository.ts`. Moved to a proper schema file (`src/db/schema/chat.ts`) and imported from `@/db/schema`. Backward-compatible re-exports preserved.

### Added

- **`src/db/schema/chat.ts`** — Full 6-section schema for the `chatRooms` Firestore collection. Exports `ChatRoomDocument`, `CHAT_ROOM_COLLECTION`, `CHAT_ROOM_INDEXED_FIELDS`, `CHAT_ROOM_FIELDS`, `ChatRoomCreateInput`, `ChatRoomUpdateInput`, `chatRoomQueryHelpers`.
- **`src/db/schema/newsletter-subscribers.ts`** — Full 6-section schema for the `newsletterSubscribers` Firestore collection. Exports `NewsletterSubscriberDocument`, `NEWSLETTER_SUBSCRIBERS_COLLECTION`, `NEWSLETTER_SUBSCRIBER_INDEXED_FIELDS`, `NEWSLETTER_SUBSCRIBER_FIELDS` (with `STATUS_VALUES`, `SOURCE_VALUES`), `NewsletterSubscriberCreateInput`, `NewsletterSubscriberUpdateInput`, `NewsletterSubscriberSource`, `newsletterSubscriberQueryHelpers`.
- **`src/repositories/newsletter.repository.ts`** — `NewsletterRepository` extending `BaseRepository`. Methods: `list(model)` (sieve-paginated), `findByEmail(email)`, `subscribe(input)`, `unsubscribe(id)`, `resubscribe(id)`, `updateSubscriber(id, input)`, `deleteById(id)`. Singleton `newsletterRepository` exported.
- **`src/app/api/newsletter/subscribe/route.ts`** — `POST /api/newsletter/subscribe`. Rate-limited (`RateLimitPresets.STRICT`), validates email + optional source via zod, handles duplicate/re-subscribe gracefully.
- **`src/app/api/admin/newsletter/route.ts`** — `GET /api/admin/newsletter`. Admin-only (role `admin`); sieve-paginated list with parallel stat counts (total / active / unsubscribed).
- **`src/app/api/admin/newsletter/[id]/route.ts`** — `PATCH` and `DELETE` for a single subscriber. Admin-only.
- **`src/services/newsletter.service.ts`** — `newsletterService.subscribe(data)` calling `API_ENDPOINTS.NEWSLETTER.SUBSCRIBE`.
- **`src/hooks/useNewsletter.ts`** — `useNewsletter()` hook wrapping `newsletterService.subscribe` via `useApiMutation`.
- **`SUCCESS_MESSAGES.NEWSLETTER.UPDATED`** — New success message constant for admin subscriber update responses.

---

## [2026-03-12] — Review Abuse Prevention & Write-Review Entry Points

### Added

- **Write-review form in `ProductReviews`** — `WriteReviewForm` and `StarPicker` sub-components added to `src/components/products/ProductReviews.tsx`. Renders between the section heading and the rating summary. Shows a sign-in prompt when unauthenticated; shows the star picker + title + comment fields when the user is logged in.
- **Anchor target** — `<section id="write-review">` on the `ProductReviews` section so `#write-review` URL hash scrolls directly to the form.
- **"Write a Review" buttons in order views** — `UserOrdersView` and `OrderDetailView` now show a `variant="outline"` `Button` labelled `orders.writeReview` for any order whose `status === "delivered"`. Clicking navigates to `ROUTES.PUBLIC.PRODUCT_DETAIL(order.productId) + "#write-review"`.
- **Error states in UI** — the form surfaces API 403 (purchase required), API 400 (already reviewed), and generic errors via inline `<Alert variant="error">` messages; uses `useMessage().showError` for generic fallback.
- **i18n keys** — 13 new keys added to the `products` namespace (`reviewFormTitle`, `reviewFormRating`, `reviewFormTitleLabel`, `reviewFormTitlePlaceholder`, `reviewFormComment`, `reviewFormCommentPlaceholder`, `reviewFormSubmit`, `reviewFormSubmitting`, `reviewFormSuccess`, `reviewFormPurchaseRequired`, `reviewFormAlreadyReviewed`, `reviewFormLoginRequired`, `reviewFormSignIn`) and `orders.writeReview` in `messages/en.json` and `messages/hi.json`.

### Confirmed (Audit)

- **Purchase gate** (`POST /api/reviews`) — already fully enforced via `orderRepository.hasUserPurchased(userId, productId)`. Returns HTTP 403 with `ERROR_MESSAGES.REVIEW.PURCHASE_REQUIRED` when the user has no confirmed/shipped/delivered order for the product. The submitted review automatically receives `verified: true` when the gate passes.

### Tests

- `src/components/products/__tests__/ProductReviews.test.tsx` — rewritten with full mock coverage for `useAuth`, `useApiMutation`, `useMessage`, `reviewService`, `ROUTES`, `next/navigation`. Covers: sign-in prompt, form rendering, star validation, successful submit (refetch + reset), 403 purchase-required error, 400 already-reviewed error. All 12 tests pass.

---

## [2026-03-11] — Become a Seller Feature

### Added

- **Route & API constant** — `ROUTES.USER.BECOME_SELLER = "/user/become-seller"` and `API_ENDPOINTS.USER.BECOME_SELLER = "/api/user/become-seller"` added to `src/constants/routes.ts` and `src/constants/api-endpoints.ts`.
- **Messages** — `ERROR_MESSAGES.USER.ALREADY_A_SELLER`, `ERROR_MESSAGES.USER.SELLER_APPLICATION_FAILED`, and `SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED` added.
- **API route** `POST /api/user/become-seller` (`src/app/api/user/become-seller/route.ts`) — authenticates user, promotes `role` to `"seller"` and sets `storeStatus: "pending"` in Firestore; returns `{ alreadySeller: true }` if user is already a seller.
- **`sellerService.becomeSeller()`** — new method in `src/services/seller.service.ts` calling the above endpoint.
- **`useBecomeSeller` hook** (`src/hooks/useBecomeSeller.ts`) — `useApiMutation` wrapper; shows success / error toast automatically. Exported from `src/hooks/index.ts`.
- **`BecomeSellerView`** (`src/features/user/components/BecomeSellerView.tsx`) — five-section seller guide with per-section acknowledgement checkboxes. Apply button unlocks once all five sections are read. On success shows a confirmation card. Existing sellers are redirected to `ROUTES.SELLER.DASHBOARD`. Exported from `src/features/user/components/index.ts`.
- **Page** `src/app/[locale]/user/become-seller/page.tsx` — thin page shell rendering `BecomeSellerView`.
- **`UserTabs`** — "Become a Seller" tab added for users with `role === "user"` only (between Messages and Settings).
- **i18n** — `nav.becomeSeller` key and full `becomeSeller` namespace (guide sections, states, CTA copy) added to `messages/en.json` and `messages/hi.json`.

### Fixed (Audit)

- **API route type cast** (`src/app/api/user/become-seller/route.ts`) — replaced `as Parameters<typeof userRepository.update>[1]` with `as Partial<UserDocument>`; added missing `import type { UserDocument } from "@/db/schema"`.
- **Seed data storeStatus coverage** (`scripts/seed-data/users-seed-data.ts`) — added two new seller seed users covering the missing `"pending"` (`uid: "user-pending-seller-pendingsl"`) and `"rejected"` (`uid: "user-rejected-seller-rejectsl"`) states, enabling full testing of the admin review queue and rejection flow.

---

## [2026-03-10] — RipCoins Wallet & In-App Chat

### Added

- **RipCoin schema** (`src/db/schema/ripcoins.ts`) — `RipCoinDocument` interface with fields for `userId`, `type` (purchase/engage/release/forfeit/return/refund/admin_credit/admin_debit), `coins`, `orderId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, and `status`. Includes `RIPCOIN_COLLECTION`, `RIPCOIN_FIELDS`, and Sieve-ready index definitions.
- **`ripcooinRepository`** (`src/repositories/ripcoin.repository.ts`) — `getBalance()`, `getHistory(userId, model)`, `creditCoins()`, `debitCoins()`, `engageCoins()`, `releaseCoins()`, `logTransaction()`.
- **`GET /api/ripcoins/balance`** — Returns `{ available, engaged }` for the authenticated user.
- **`GET /api/ripcoins/history`** — Returns paginated transaction log (Sieve-compatible).
- **`POST /api/ripcoins/purchase`** — Creates a Razorpay order for coin packs (10 RC = ₹1; min 10 packs, max 500 packs). Returns `{ razorpayOrderId, razorpayKeyId, amountRs, coins }`.
- **`POST /api/ripcoins/verify`** — Verifies Razorpay payment signature and credits coins to user wallet.
- **`ripcoinService`** (`src/services/ripcoin.service.ts`) — `getBalance()`, `getHistory(params?)`, `purchaseCoins(packs)`, `verifyPurchase(data)`. Exported via `src/services/index.ts`.
- **`useRipCoinBalance`**, **`usePurchaseRipCoins`**, **`useVerifyRipCoinPurchase`**, **`useRipCoinHistory`** hooks (`src/hooks/useRipCoins.ts`). Exported via `src/hooks/index.ts`.
- **`RipCoinsWallet`** component (`src/features/user/components/RipCoinsWallet.tsx`) — Balance card with available/engaged display, transaction history `DataTable` with pagination, and "Buy RipCoins" trigger.
- **`BuyRipCoinsModal`** (`src/features/user/components/BuyRipCoinsModal.tsx`) — Pack selector (`Slider`, 10–500 packs), running cost display, Razorpay checkout flow. Props: `open`, `onClose`, `onPurchaseSuccess?`.
- **`/user/ripcoins`** page (`src/app/[locale]/user/ripcoins/page.tsx`) — Auth-gated page rendering `RipCoinsWallet`.
- **`ROUTES.USER.RIPCOINS`** — New route constant.
- **`API_ENDPOINTS.RIPCOINS.*`** — New API endpoint constants (BALANCE, HISTORY, PURCHASE, VERIFY).
- **`ERROR_MESSAGES.RIPCOIN.*`** and **`SUCCESS_MESSAGES.RIPCOIN.*`** — New message constants.
- **Chat schema** (`src/db/schema/chat.ts`) — `ChatRoomDocument` (buyerId, sellerId, orderId, lastMessage, updatedAt) and `CHAT_COLLECTION`, `CHAT_ROOM_FIELDS`. RTDB message path `chat/{chatId}/messages`.
- **`chatRepository`** (`src/repositories/chat.repository.ts`) — `createOrGetRoom()`, `getRoomsForUser(uid)`, `getRoom(chatId)`.
- **`GET /api/chat/rooms`** — Returns all chat rooms the authenticated user participates in (buyer or seller), ordered by `updatedAt`.
- **`POST /api/chat/rooms`** — Creates or returns existing chat room for `{ buyerId, sellerId, orderId? }`.
- **`POST /api/chat/[chatId]/messages`** — Writes a message to RTDB `/chat/{chatId}/messages` via Admin SDK (enforces server-side write).
- **`GET /api/realtime/token`** — Issues a short-lived Firebase custom token encoding which chat rooms the user may read. Used by `useChat` to authenticate the RTDB listener.
- **`chatService`** (`src/services/chat.service.ts`) — `getRooms()`, `createOrGetRoom(data)`, `sendMessage(chatId, text)`. Exported via `src/services/index.ts`.
- **`realtimeTokenService`** (`src/services/realtime-token.service.ts`) — `getToken()` with 55-minute auto-refresh logic.
- **`useChat(chatId)`** hook (`src/hooks/useChat.ts`) — Authenticates RTDB via custom token, subscribes to `/chat/{chatId}/messages` with `onValue`, exposes `{ messages, sendMessage, isConnected, isLoading, error }`.
- **`useChatRooms`**, **`useCreateChatRoom`** hooks — Exported via `src/hooks/index.ts`.
- **`ChatWindow`** component (`src/features/user/components/ChatWindow.tsx`) — Real-time message list with auto-scroll, send textarea (Enter to send), connection status dot, loading/error states.
- **`ChatList`** component (`src/features/user/components/ChatList.tsx`) — Room list with last-message preview and timestamp; active room highlighted.
- **`MessagesView`** component (`src/features/user/components/MessagesView.tsx`) — Two-pane responsive layout (ChatList + ChatWindow); mobile back-navigation between panes.
- **`/user/messages`** page (`src/app/[locale]/user/messages/page.tsx`) — Auth-gated page wrapping `MessagesView` in `Suspense`; supports `?chatId=` query param to open a specific room.
- **`ROUTES.USER.MESSAGES`** — New route constant.
- **`API_ENDPOINTS.CHAT.*`** — New API endpoint constants.
- **`UserTabs`** — Added "My RipCoins" and "Messages" tabs.
- **i18n** (`messages/en.json`, `messages/hi.json`) — Added `ripcoinsWallet` and `chat` namespaces, plus nav keys `myRipCoins` and `myMessages`.
- **`firestore.indexes.json`** — 4 new composite indexes: `ripcoins` (userId+createdAt, userId+type+createdAt), `chatRooms` (buyerId+updatedAt, sellerId+updatedAt).

---

## [2026-03-05] — Admin Store Approval System

### Added

- **`storeStatus` field on `UserDocument`** — `storeStatus?: "pending" | "approved" | "rejected"` is the single gate that controls both admin review state and public visibility. Added to `USER_INDEXED_FIELDS` in `src/db/schema/users.ts`.
- **`USER_FIELDS.STORE_STATUS`** — New field-name constant in `src/db/schema/field-names.ts`.
- **`GET /api/admin/stores`** — Admin-only (admin/moderator) paginated list of sellers with `storeStatus` filter support (`?storeStatus=pending|approved|rejected|all`). Uses `userRepository.listSellersForAdmin()` + Sieve DSL.
- **`PATCH /api/admin/stores/[uid]`** — Admin-only action endpoint. Accepts `{ action: "approve" | "reject" }`. Updates `storeStatus` via `userRepository.updateStoreApproval()`.
- **`userRepository.updateStoreApproval(uid, storeStatus)`** — New method for store approval writes.
- **`userRepository.listSellersForAdmin(model)`** — New method; lists all sellers regardless of `storeStatus` so admin can see pending/rejected stores.
- **`userRepository.listSellers()`** (updated) — Now filters `storeStatus == "approved"` to ensure public-facing seller lists exclude unapproved stores.
- **Public store guards** — All 5 storeSlug public routes (`/api/stores/[storeSlug]`, `.../products`, `.../auctions`, `.../reviews`) check `seller.storeStatus !== "approved"` and return 404 for non-approved stores.
- **`adminService.listStores(query?)`** and **`adminService.updateStoreStatus(uid, action)`** — New service methods in `src/services/admin.service.ts`.
- **`useAdminStores(sieveParams)`** — New hook at `src/features/admin/hooks/useAdminStores.ts`; queries `["admin", "stores", sieveParams]` + exposes `updateStoreMutation`.
- **`AdminStoresView`** — New admin view at `src/features/admin/components/AdminStoresView.tsx`; tab-based status filter (All/Pending/Approved/Rejected), DataTable with approve/reject row actions, ConfirmDeleteModal for confirmations.
- **`src/app/[locale]/admin/stores/page.tsx`** — Thin page shell rendering `AdminStoresView`.
- **`ROUTES.ADMIN.STORES`** (`"/admin/stores"`) and **`API_ENDPOINTS.ADMIN.STORES`** + **`API_ENDPOINTS.ADMIN.STORE_BY_UID`** — New route/endpoint constants.
- **`SUCCESS_MESSAGES.ADMIN.STORE_APPROVED/STORE_REJECTED`** — New success message constants.
- **i18n**: Added `adminStores` namespace to `messages/en.json` and `messages/hi.json`.
- **Firestore indexes**: Added `role+storeStatus+createdAt` composite index to `firestore.indexes.json`; deployed to `letitrip-in-app`.
- **Seed data**: All 6 seller entries in `scripts/seed-data/users-seed-data.ts` now include `storeStatus: "approved"`.
- **`useSellerStore` hook** — Extended `SellerStoreData` with `storeStatus`; `GET /api/seller/store` now returns the field; `PATCH /api/seller/store` sets `storeStatus: "pending"` when store is not already approved (re-submission flow).

---

## [2026-03-04] — Seller Store Settings & Auctions Pages

### Added

- **`src/features/seller/hooks/useSellerStore.ts`** — New hook; fetches seller store profile via `sellerService.getStore()` (queryKey `["seller-store"]`); exposes `updateStore(data)` mutation that calls `sellerService.updateStore(data)` then refetches. Returns `{ publicProfile, storeSlug, isLoading, isSaving, error, updateStore, refetch }`.
- **`src/features/seller/components/SellerStoreView.tsx`** — Full store-settings form (4 sections: Store Details, Contact & Social, Store Policies, Vacation Mode). Uses `useSellerStore`, `FormField`, `Toggle`, `Alert`, `Card`, `Heading`, `Text`, `Caption`, `Label`, `Divider`, `Button`, `Spinner` from `@/components`. Auto-redirects unauthenticated users to login.
- **`src/features/seller/components/SellerAuctionsView.tsx`** — Paginated auction listings view for sellers; uses `useApiQuery → sellerService.listMyProducts` with `isAuction==true` Sieve filter + `useUrlTable` for URL-driven pagination/sort; renders with `DataTable` + `SellerProductCard` mobileCardRender.
- **`src/app/[locale]/seller/store/page.tsx`** — Thin page shell; renders `SellerStoreView` with `AdminPageHeader` titled "Store Settings".
- **`src/app/[locale]/seller/auctions/page.tsx`** — Thin page shell; renders `SellerAuctionsView` with `AdminPageHeader` titled "My Auctions".
- **`GET /api/seller/store`** — Returns store profile for authenticated sellers/admins (`userRepository.findById`).
- **`PATCH /api/seller/store`** — Updates store settings; validates payload with Zod; auto-generates `storeSlug` from `storeName` when no slug exists (using `slugify`); preserves existing slug otherwise; updates `publicProfile` + optional `storeSlug` via `userRepository.update`.
- **`sellerService.getStore()`** and **`sellerService.updateStore(data)`** — New service methods for the store endpoints.
- **i18n**: Added `sellerStore` (35 keys) and `sellerAuctions` (7 keys) namespaces to `messages/en.json` and `messages/hi.json`; added `nav.myStore` key.

### Tests Added

- `src/services/__tests__/seller.service.test.ts` — Extended with `getStore()` and `updateStore()` tests.
- `src/features/seller/hooks/__tests__/useSellerStore.test.ts` — 5 tests covering queryKey, service delegation, mutation behaviour, and loading state.
- `src/features/seller/components/__tests__/SellerStoreView.test.tsx` — 3 tests: renders all 4 sections, shows spinner when loading, hides vacation alert by default.
- `src/features/seller/components/__tests__/SellerAuctionsView.test.tsx` — 5 tests: filter bar renders, empty title shown, no pagination at total=0, service called with auction filter, pagination shows when total > 0.
- `src/app/[locale]/seller/store/__tests__/page.test.tsx` — Page shell test.
- `src/app/[locale]/seller/auctions/__tests__/page.test.tsx` — Page shell test.
- `src/app/api/seller/store/__tests__/route.test.ts` — 8 tests covering GET and PATCH RBAC, slug generation, slug preservation, validation, and error handling.

---

## [2026-03-03] — Stores Feature Audit Fixes

### Fixed

- **`StoreCard`** — removed unused `themed` and `borderRadius` from `THEME_CONSTANTS` destructure; only `spacing` is referenced.
- **`StoresListView`** — corrected `Input value={table.get("q") ?? ""}` (`string | undefined` → `string`); added `Heading level={1}` page title and `Text` subtitle using `t("title")` / `t("subtitle")` from the `storesPage` namespace.
- **`StoreProductsView`** + **`StoreAuctionsView`** — replaced raw `<div>` placeholder cards + bare `<p>` tags with `Card` / `Text` primitives from `@/components` (Rules 8, 31).
- **`StoreReviewsView`** — replaced bare `<span className="text-4xl font-bold ...">` with `<Heading level={2}>` (Rule 31).
- **`StoreAboutView`** — replaced hardcoded `text-gray-500 dark:text-gray-400` / `text-gray-900 dark:text-white` on `<dt>`/`<dd>` elements with `THEME_CONSTANTS.themed.textSecondary` / `themed.textPrimary` (Rule 4).

---

## [2026-03-03] — Stores Feature (Buyer Storefront Directory)

### Added

- **`src/features/stores/`** — New Tier 2 feature module: buyer-facing storefront directory.
  - `components/StoreCard.tsx` — Card displaying store banner, logo (`AvatarDisplay`), name, description, category badge, and stats (rating, product count). Links to the store detail page.
  - `components/StoresListView.tsx` — Paginated grid of all stores with inline `Input` search; uses `useStores` + `useUrlTable` for URL-driven pagination/search.
  - `components/StoreHeader.tsx` — Client component; shows store banner image, avatar, name, category, rating, review count, and description. Renders a `Skeleton` while loading.
  - `components/StoreNavTabs.tsx` — Sticky tab bar (Products / Auctions / Reviews / About) rooted at the store slug routes.
  - `components/StoreProductsView.tsx` — Paginated grid of the store's published products; uses `useStoreProducts` + `useUrlTable`.
  - `components/StoreAuctionsView.tsx` — Paginated grid of the store's auction listings; uses `useStoreAuctions` + `useUrlTable`.
  - `components/StoreReviewsView.tsx` — Aggregated review summary (average rating, star distribution) + individual review cards; uses `useStoreReviews`.
  - `components/StoreAboutView.tsx` — Store detail card (description, category, bio, location, website, member since); uses `useStoreBySlug`.
  - `hooks/useStores.ts` — Paginated store list via `storeService.listStores` with `useUrlTable` URL state.
  - `hooks/useStoreBySlug.ts` — `useStoreBySlug`, `useStoreReviews`, `useStoreProducts`, `useStoreAuctions` — all backed by `storeService`.
  - `types/index.ts` — `StoreListItem`, `StoreDetail`, `StoreReviewsData`, `StoreReview` interfaces.
  - `index.ts` — Public barrel re-exporting all components, hooks, and types.

- **`src/services/store.service.ts`** — `storeService` with `listStores`, `getBySlug`, `getProducts`, `getAuctions`, `getReviews`; exported via `src/services/index.ts`.

- **API routes** (all dynamic, server-rendered):
  - `src/app/api/stores/route.ts` — `GET /api/stores` — paginated seller list (Sieve query via `userRepository.listSellers`).
  - `src/app/api/stores/[storeSlug]/route.ts` — `GET /api/stores/[storeSlug]` — single store by slug.
  - `src/app/api/stores/[storeSlug]/products/route.ts` — `GET /api/stores/[storeSlug]/products` — store's published products.
  - `src/app/api/stores/[storeSlug]/auctions/route.ts` — `GET /api/stores/[storeSlug]/auctions` — store's auction listings.
  - `src/app/api/stores/[storeSlug]/reviews/route.ts` — `GET /api/stores/[storeSlug]/reviews` — aggregated reviews with `averageRating`, `totalReviews`, `ratingDistribution`.

- **Pages** (`src/app/[locale]/stores/`):
  - `page.tsx` — Stores listing page composing `StoresListView`.
  - `[storeSlug]/layout.tsx` — Store layout: `StoreHeader` + `StoreNavTabs` + `{children}`.
  - `[storeSlug]/page.tsx` — Redirects to `/stores/[storeSlug]/products`.
  - `[storeSlug]/products/page.tsx`, `auctions/page.tsx`, `reviews/page.tsx`, `about/page.tsx` — Individual store sub-pages.

- **`src/db/schema/users.ts`** — Added `storeSlug?: string` (top-level, indexed), and store profile fields (`storeName`, `storeDescription`, `storeCategory`, `storeLogoURL`, `storeBannerURL`) nested under `publicProfile`.

- **`src/db/schema/field-names.ts`** — Added `USER_FIELDS.STORE_SLUG`, `USER_FIELDS.PROFILE.STORE_NAME`, `USER_FIELDS.PROFILE.STORE_DESCRIPTION`, `USER_FIELDS.PROFILE.STORE_CATEGORY`, `USER_FIELDS.PROFILE.STORE_LOGO_URL`, `USER_FIELDS.PROFILE.STORE_BANNER_URL`.

- **`src/constants/routes.ts`** — Added `ROUTES.PUBLIC.STORES`, `STORE_DETAIL`, `STORE_PRODUCTS`, `STORE_AUCTIONS`, `STORE_REVIEWS`, `STORE_ABOUT`.

- **`src/constants/api-endpoints.ts`** — Added `API_ENDPOINTS.STORES.*`.

- **`src/repositories/user.repository.ts`** — Added `findByStoreSlug(storeSlug)` and `listSellers(model)` methods.

- **`messages/en.json`** and **`messages/hi.json`** — Added `stores` nav key and `storesPage` / `storePage` translation namespaces.

### Changed

- **`src/constants/navigation.tsx`** — Changed 4th nav item from `sellers` (recruitment) to `stores` (storefront directory).
- **`src/components/layout/MainNavbar.tsx`** — Updated `navTranslationKeys[3]` from `"sellers"` to `"stores"`.
- **`src/constants/site.ts`** — Updated `nav.stores` pointing to `ROUTES.PUBLIC.STORES`.
- **`src/components/seller/SellerStorefrontView.tsx`** — Updated back link from `ROUTES.PUBLIC.SELLERS` to `ROUTES.PUBLIC.STORES`.

---

## [2026-03-02] — Missing Footer Static Pages

### Added

- **`src/app/[locale]/cookies/page.tsx`** — Cookie Policy static page with 8 content sections (what are cookies, types, essential, analytics, marketing, control, third-party, changes). Follows the same hero + sections layout as Privacy and Terms pages.
- **`src/app/[locale]/refund-policy/page.tsx`** — Refund Policy static page with 7 sections (eligibility, process, timeline, auctions, exchanges, return shipping, non-refundable items). Emerald gradient header.
- **`src/app/[locale]/seller-guide/page.tsx`** — Seller Guide page with 8 icon-card sections (getting started, listings, pricing, auctions, orders, payments, policies, support). Violet/indigo gradient header with CTA to Seller Dashboard.
- **`src/app/[locale]/track/page.tsx`** — Track Order page with sign-in prompt, 4-step "how it works" grid, and support CTA. Directs authenticated users to `/user/orders`.
- `messages/en.json` — added `cookies`, `refundPolicy`, `sellerGuide`, and `trackOrder` translation namespaces.
- `messages/hi.json` — added matching Hindi translations for all four new namespaces.

---

## [2026-03-02] — Docs Reorganisation

### Changed

- **`docs/README.md`** — removed broken link to `IMPLEMENTATION_PLAN.md` (file was removed); added `CHANGELOG_ARCHIVE.md` entry.
- **`docs/CHANGELOG.md`** — archived pre-February 2026 versioned sections (`[1.0.0]`–`[1.2.0]`) to `CHANGELOG_ARCHIVE.md`; removed stale `refactor_audit.md` bullet references (file was removed).
- **`docs/GUIDE.md`**, **`docs/SECURITY.md`**, **`docs/STYLING_GUIDE.md`**, **`docs/QUICK_REFERENCE.md`** — updated stale "Last Updated" dates to March 2, 2026.

### Added

- **`docs/CHANGELOG_ARCHIVE.md`** — new archive file holding `[1.0.0]`–`[1.2.0]` history (initial setup through early-February 2026 infrastructure work).

---

## [2026-03-03] — Refactor Audit WAVE 5 Complete (tasks 94–105)

### Fixed

- **Typography violations — Rules 7, 31** (tasks 94–105) — eliminated all 12 remaining raw-tag violations found in audit re-run #4:
  - `AddressCard` — `h3` → `Heading level={3}`; 6 `p` → `Text` (size/variant props) (task 94)
  - `SellersListView` — `h1`/`h2`×4/`h3`×3 → `Heading`; 6 `p` → `Text` (task 95)
  - `OrderTrackingView` — `h1`, `h2` → `Heading`; `p` → `Text variant="secondary"` (task 96)
  - `NotificationItem` — 3 `p` → `Text` (weight/size/variant); fixed barrel import (`@/components/ui` → `@/components`) (task 97)
  - `ProductDetailView` — `h1` → `Heading level={1}`; `p` → `Text variant="secondary"` (task 98)
  - `AddressForm` — raw `label + input[checkbox]` block → `Checkbox` from `@/components` (task 99)
  - `ProfileStatsGrid` — `p` → `Text className="text-3xl font-bold"` (task 100)
  - `EmailVerificationCard` — `h3` → `Heading level={3}` (task 101)
  - `PhoneVerificationCard` — `h3` → `Heading level={3}` (task 102)
  - `AddressSelectorCreate` — `label` → `Label`; removed unused `typography` from `THEME_CONSTANTS` destructure (task 103)
  - `Search` — `p` → `Text variant="secondary" size="sm"` (task 104)
  - `FilterFacetSection` — `p` → `Text size="xs" variant="secondary"` (task 105)
- **Tests updated** — all 12 source files have corresponding test additions/updates.
- **TypeScript** — fixed `Text size="3xl"` (invalid enum value) → `className="text-3xl"`; fixed `import type React` → `import React` in test; added missing `OrderDocument`/`NotificationDocument` required fields in test fixtures.

---

## [2026-03-02] — Refactor Audit WAVE 5 task 96 completion

### Fixed

- **`OrderTrackingView`** — fixed 4 additional raw `<p>` tags missed in previous pass: tracking-number label → `Caption`, tracking-number value → `Text`, timeline step label → `Text` (variant driven by step state), timeline step description → `Text` (variant driven by step state); added `Caption` to component mock in test file (task 96).

---

## [2026-03-02] — Refactor Audit Re-run #4

### Fixed

- **TypeScript errors** — `SurveyConfigForm.test.tsx`: added missing `order` field to `SurveyFormField` mock object; `cache-metrics.test.ts`: corrected `mockFormatDateTime` signature (accept 1 arg) and simplified `formatNumber` mock to avoid spreading `unknown[]`.
- **Wave 4 page decompositions** (tasks 80–89) — confirmed all done: every page is under 15 lines and delegates to its view component (`DemoSeedView`, `UserSettingsView`, `BlogPostView`, `SellerEditProductView`, `UserAddressesView`, `ProductDetailView`, `SellersListView`, `AboutView`, `AdminMediaView`, `CartView`).

### Added

- Audit re-run #4: marked tasks 80–93 as done; identified Wave 5 (tasks 94–105) with 12 newly discovered Rules 7/8/31 violations in `AddressCard`, `SellersListView`, `OrderTrackingView`, `NotificationItem`, `ProductDetailView`, `AddressForm`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `AddressSelectorCreate`, `Search`, and `FilterFacetSection`.

---

### Refactor Audit Wave 4 — Page Decompositions (Tasks 90–93) (2026-03-02)

#### Refactored

- **`src/app/[locale]/admin/site/page.tsx`** — Extracted 162-line page into `AdminSiteView` feature component (Rule 10). Page is now a 5-line shell.
- **`src/app/[locale]/user/notifications/page.tsx`** — Extracted 156-line page into `UserNotificationsView` feature component (Rule 10). Page is now a 5-line shell.
- **`src/app/[locale]/admin/events/page.tsx`** — Extracted 153-line page into `AdminEventsView` feature component (Rule 10). Page is now a 5-line shell.
- **`src/app/[locale]/user/addresses/edit/[id]/page.tsx`** — Extracted 150-line page into `UserEditAddressView` feature component (Rule 10). Page is now a 5-line shell.

#### Added

- **`src/features/admin/components/AdminSiteView.tsx`** — New feature view component for admin site settings management.
- **`src/features/user/components/UserNotificationsView.tsx`** — New feature view component for user notifications page.
- **`src/features/admin/components/AdminEventsView.tsx`** — New feature view component for admin events list management.
- **`src/features/user/components/UserEditAddressView.tsx`** — New feature view component for editing a user's saved address.
- Test files created for all four new view components.

#### Exports

- `src/features/admin/index.ts` — Added `AdminSiteView`, `AdminEventsView` exports.
- `src/features/user/components/index.ts` — Added `UserNotificationsView`, `UserEditAddressView` exports.

---

### Refactor Audit Wave 3 — Single-Violation Files (2026-03-03)

#### Changed

**Typography (Tasks 40–53)**

- **`src/features/search/components/SearchView.tsx`** — Replaced `<h1>` + `<p>` with `<Heading level={1}>` + `<Text variant="secondary">` (Rule 31).
- **`src/features/products/components/AuctionsView.tsx`** — Replaced `<h1>` + `<p>` with `<Heading>` + `<Text>` (Rule 31).
- **`src/features/products/components/ProductsView.tsx`** — Replaced `<h1>` + `<p>` with `<Heading>` + `<Text>` (Rule 31).
- **`src/components/seller/SellerTopProducts.tsx`** — Replaced `<h2>` with `<Heading level={2}>` (Rule 31).
- **`src/components/seller/SellerPayoutRequestForm.tsx`** — Replaced `<h2>` with `<Heading level={2}>` (Rule 31).
- **`src/components/seller/SellerRevenueChart.tsx`** — Replaced `<h2>` with `<Heading level={2}>` (Rule 31).
- **`src/components/user/profile/ProfileHeader.tsx`** — Replaced `<h1>` with `<Heading level={1}>` (Rule 31).
- **`src/components/user/settings/ProfileInfoForm.tsx`** — Replaced `<h3>` with `<Heading level={3}>` (Rule 31).
- **`src/components/user/addresses/AddressForm.tsx`** — Replaced raw `<label>` with `<Label>` (Rule 31).
- **`src/components/user/notifications/NotificationsBulkActions.tsx`** — Replaced `<h1>` with `<Heading level={1}>` (Rule 31).
- **`src/features/seller/components/SellerStatCard.tsx`** — Replaced `<p>` with `<Text>` (Rule 31).
- **`src/features/seller/components/SellerProductCard.tsx`** — Replaced 2× `<p>` with `<Text>` (Rule 31).
- **`src/features/events/components/SurveyEventSection.tsx`** — Replaced `<p>` with `<Text>` (Rule 31).
- **`src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx`** — Replaced `<label>` with `<Label>` (Rule 31).

**Number/Date formatting (Tasks 54–68)**

- **`src/components/admin/products/ProductTableColumns.tsx`** — Replaced `price.toLocaleString("en-IN")` with `formatCurrency(price, 'INR', 'en-IN')` (Rule 5).
- **`src/components/admin/coupons/CouponTableColumns.tsx`** — Replaced `discount.value.toLocaleString("en-IN")` with `formatCurrency(...)`; `new Date(endDate) < new Date()` with `isPast(endDate)`; raw `<p>` with `<Text>` (Rules 5, 31).
- **`src/components/admin/AdminStatsCards.tsx`** — Replaced `value.toLocaleString()` with `formatNumber(value)`; raw `<p>` with `<Text>` (Rules 5, 31).
- **`src/components/homepage/TopCategoriesSection.tsx`** — Replaced `totalItemCount.toLocaleString()` with `formatNumber(...)`; `<h3>` with `<Heading level={3}>` (Rules 5, 31).
- **`src/components/homepage/WhatsAppCommunitySection.tsx`** — Replaced `memberCount.toLocaleString()` with `formatNumber(...)`; raw `<h2>` + `<p>` with `<Heading>` + `<Text>` (Rules 5, 31).
- **`src/components/faq/FAQAccordion.tsx`** — Replaced `faq.stats.views.toLocaleString()` with `formatNumber(...)` (Rule 5).
- **`src/components/admin/ImageUpload.tsx`** — Replaced manual `toFixed(2) MB` calculation with `formatFileSize(file.size)` (Rule 5).
- **`src/components/modals/ImageCropModal.tsx`** — Replaced `.toFixed(0)` on display values with `Math.round(...)` (Rule 5).
- **`src/features/admin/components/AdminPayoutsView.tsx`** — Replaced manual `new Date(...).getMonth() === new Date().getMonth()` comparisons with `isSameMonth(date, nowMs())` (Rule 5).
- **`src/components/homepage/FeaturedAuctionsSection.tsx`** — Replaced `new Date().getTime()` with `nowMs()` (Rule 5).
- **`src/components/auctions/AuctionCard.tsx`** — Replaced `Date.now()` with `nowMs()` (Rule 5).
- **`src/components/layout/Footer.tsx`** — Replaced `new Date().getFullYear()` with `currentYear()` (Rule 5).
- **`src/components/feedback/Toast.tsx`** — Replaced `Date.now().toString()` with `nowMs().toString()` (Rule 5).
- **`src/components/ErrorBoundary.tsx`** — Replaced `new Date().toISOString()` with `nowISO()` (Rule 5).
- **`src/lib/email.ts`** — Replaced 12× `new Date().getFullYear()` with `currentYear()` and 4× `toLocaleString()`/`toUTCString()` date calls with `formatDateTime(nowMs())` (Rule 5).
- **`src/utils/formatters/date.formatter.ts`** — Extended `formatDateTime` to accept `number` (ms epoch) as first argument in addition to `Date | string` (Rule 31).

**Overflow-x-auto → Primitives (Tasks 69–73)**

- **`src/components/ui/Tabs.tsx`** — Extended with `variant='line'` (border-bottom underline tabs) flowing via React context through `TabsList` and `TabsTrigger` (Rule 31).
- **`src/components/ui/HorizontalScroller.tsx`** — Extended children-passthrough mode with `scrollContainerRef?: RefObject<HTMLDivElement | null>`, `onScroll?`, and dynamic `gap` prop (Rule 31).
- **`src/features/user/components/UserOrdersView.tsx`** — Replaced custom `overflow-x-auto` button tab row with `<Tabs variant="line">` (Rule 32).
- **`src/components/homepage/FAQSection.tsx`** — Replaced custom `overflow-x-auto` button tab row with `<Tabs variant="line">` (Rule 32).
- **`src/components/products/ProductImageGallery.tsx`** — Replaced `<div className="flex gap-2 overflow-x-auto">` with `<HorizontalScroller snapToItems gap={8}>` (Rule 32).
- **`src/components/homepage/HeroCarousel.tsx`** — Replaced `<div ref={slidesRef} className="...overflow-x-auto...">` with `<HorizontalScroller snapToItems gap={0} scrollContainerRef={slidesRef} onScroll={...}>` (Rule 32).

**API Routes — Firestore/Error class violations (Tasks 74–79)**

- **`src/app/api/payment/webhook/route.ts`** — Replaced raw `NextResponse.json({error:...}, {status:401/400})` returns with `throw new AuthenticationError(...)` / `throw new ValidationError(...)`; outer catch updated to use `handleApiError` (Rules 13, 14).
- **`src/app/api/auth/login/route.ts`** — Removed direct `getFirestore`/`FieldValue` usage; replaced `db.collection(USER_COLLECTION).doc(uid).get()` with `userRepository.findById(uid)` and inline `db.update(...)` with `userRepository.updateLoginMetadata(uid)` (Rule 12).
- **`src/app/api/auth/register/route.ts`** — Removed direct `getFirestore`/`FieldValue` usage; replaced `db.collection(USER_COLLECTION).doc(uid).set({...})` with `userRepository.createWithId(uid, {...})` — `createWithId` auto-sets `createdAt`/`updatedAt` (Rule 12).
- **`src/app/api/auth/session/route.ts`** — Removed direct `getFirestore`/`FieldValue` from OAuth profile creation; replaced with `userRepository.createWithId(uid, {...})` (Rule 12).
- **`src/contexts/SessionContext.tsx`** — Replaced `import type { User } from "firebase/auth"` with `import type { AuthUser } from "@/types/auth"` (Rule 11).

#### Added

- **`src/repositories/user.repository.ts`** — New `updateLoginMetadata(uid)` method: uses `FieldValue.serverTimestamp()` + `FieldValue.increment(1)` to atomically update `metadata.lastSignInTime`, `metadata.loginCount`, and `updatedAt` on successful login (Rule 12).
- **`src/types/auth.ts`** — New `AuthUser` interface (`uid`, `email`, `emailVerified`, `displayName`, `photoURL`, `phoneNumber`) that mirrors the minimal Firebase Auth user shape without importing Firebase types into UI modules (Rule 11).
- **`src/utils/formatters/__tests__/date.formatter.test.ts`** — Added test for `formatDateTime` with numeric ms timestamp input.
- **`src/components/ui/__tests__/HorizontalScroller.test.tsx`** — Added tests for `scrollContainerRef` forwarding and `onScroll` prop in children-passthrough mode.

---

### Refactor Audit Wave 2 — Multi-Violation Files (2026-03-02)

#### Changed

- **`src/components/admin/AdminSessionsManager.tsx`** — Replaced raw `<p>` / `<h3>` tags with `<Text>` / `<Heading level={3}>` (Rules 7, 31). Raw table + date violations already fixed in Wave 1 work.
- **`src/features/events/components/EventParticipateView.tsx`** — Replaced 3× `<p>` with `<Text>` (Rule 31).
- **`src/features/admin/components/AdminReviewsView.tsx`** — Replaced error `<p>` with `<Text variant="error">` (Rule 31).
- **`src/components/user/profile/PublicProfileView.tsx`** — Replaced `<h1>` / `<h2>` with `<Heading>` and `toFixed(1)` with `formatNumber(..., { decimals: 1 })` (Rules 5, 7, 31).
- **`src/features/admin/components/AdminAnalyticsView.tsx`** — Replaced 3× `<h2>` with `<Heading level={2}>` and 4× `<p>` with `<Text>` (Rule 31).
- **`src/components/promotions/CouponCard.tsx`** — Fixed barrel import (`@/components/ui` → `@/components`), replaced `<h3>` + 4× `<p>` with `<Heading>` + `<Text>` (Rules 2, 7, 31).
- **`src/features/categories/components/CategoryProductsView.tsx`** — Added `Heading, Text` imports; replaced `<h1>` + 3× `<p>` with typography primitives (Rule 31).
- **`src/features/events/components/FeedbackEventSection.tsx`** — Replaced 2× `<p>` + 1× `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/features/events/components/PollVotingSection.tsx`** — Replaced 2× `<p>` + 1× `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/lib/monitoring/cache-metrics.ts`** — Replaced `new Date().toISOString()` → `nowISO()`, `Date.now()` → `nowMs()`, `.toFixed(2)` → `formatNumber(..., { decimals: 2 })`, `.toLocaleString()` → `formatDateTime()` (Rule 5).
- **`src/components/seller/SellerPayoutHistoryTable.tsx`** — Fixed barrel import; replaced `<h2>` + 3× `<p>` with typography primitives; replaced raw `<table>` with `<DataTable columns>` (Rules 2, 7, 31, 32).
- **`src/features/seller/components/SellerOrdersView.tsx`** — Replaced 2× `<p>` with `<Text>`; replaced `overflow-x-auto` custom tab row with `<Tabs>` + `<TabsList>` + `<TabsTrigger>` compound components (Rules 7, 31, 32).
- **`src/features/auth/components/LoginForm.tsx`** — Replaced `<p>` + `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/features/auth/components/RegisterForm.tsx`** — Replaced `<p>` + `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/app/global-error.tsx`** — Replaced `new Date().toISOString()` → `nowISO()`; replaced `<h1>` + `<p>` with `<Heading level={1}>` + `<Text variant="secondary">` (Rules 5, 7, 31).
- **`src/components/promotions/ProductSection.tsx`** — Replaced `<h2>` + `<p>` with `<Heading level={2}>` + `<Text variant="secondary">` (Rule 31).
- **`src/features/events/components/EventTypeConfig/SurveyConfigForm.tsx`** — Replaced 2× `<label>` with `<Label>` (Rule 31).

#### Added (tests)

- `src/components/promotions/__tests__/ProductSection.test.tsx` — render, empty-guard, and typography slot tests.
- `src/components/seller/__tests__/SellerPayoutHistoryTable.test.tsx` — heading render, loading/empty/data states, DataTable delegation.
- `src/features/events/components/EventTypeConfig/__tests__/SurveyConfigForm.test.tsx` — label renders, checkbox onChange handlers, SurveyFieldBuilder delegation.
- `src/app/__tests__/global-error.test.tsx` — Heading + Text rendering, retry button, nowISO usage in logger.error.
- `src/lib/monitoring/__tests__/cache-metrics.test.ts` — formatNumber/formatDateTime/nowISO call verification.
- `src/components/user/profile/__tests__/PublicProfileView.test.tsx` — heading render, member-since text, formatNumber for rating.

---

### Refactor Audit Wave 1 — Tier 1 Primitives (2026-03-01)

#### Changed

- **`src/components/ui/SideDrawer.tsx`** — Replaced raw `<h4>` + `<p>` tags in the "unsaved changes" confirmation panel with `<Heading level={4}>` and `<Text variant="secondary" size="sm">` (Rules 7, 31). Added `Text` import via `@/components` barrel.
- **`src/components/ui/FilterFacetSection.tsx`** — Replaced `opt.count.toLocaleString()` with `formatNumber(opt.count)` from `@/utils` (Rule 5).
- **`src/components/ui/TablePagination.tsx`** — Replaced `total.toLocaleString()` with `formatNumber(total)` from `@/utils` (Rule 5).
- **`src/components/ui/CategorySelectorCreate.tsx`** — Replaced raw `<label className="block ...">` with `<Label>` from `@/components`. Removed now-unused `typography` destructure from `THEME_CONSTANTS` (Rules 7, 31).
- **`src/components/ui/ImageGallery.tsx`** — Replaced the thumbnail strip `<div className="... overflow-x-auto ...">` with `<HorizontalScroller snapToItems>` (Rule 32).
- **`src/components/ui/HorizontalScroller.tsx`** — Extended with `snapToItems?: boolean` and `children?: ReactNode` props. When `children` is provided the component renders a simple flex scroll container (no carousel machinery, no arrows). `snapToItems` adds `snap-x snap-mandatory` to the scroll container and `snap-center` to each item wrapper.

---

### Refactor Audit Wave 0 — Prerequisites (2026-03-01)

#### Added

- **`src/utils/formatters/date.formatter.ts`** — Added `nowMs()`, `isSameMonth()`, `currentYear()`, `nowISO()` utilities (Rule 5).
- **`src/constants/api-endpoints.ts`** — Added `REALTIME.TOKEN` endpoint constant (Rules 19, 20).
- **`src/constants/error-messages.ts`** — Added `AUTH.INVALID_SIGNATURE` and `VALIDATION.INVALID_JSON` message constants (Rule 13).
- **`src/services/demo.service.ts`** — New service for demo/seed API calls (Rules 20, 21).
- **`src/services/realtime-token.service.ts`** — New service for Realtime DB custom token (Rules 11, 21).
- **`src/components/admin/SessionTableColumns.tsx`** — Static column definitions for the Admin Sessions DataTable (Rules 8, 32).
- **`src/components/seller/PayoutTableColumns.tsx`** — Static column definitions for the Seller Payout History DataTable (Rules 8, 32).

#### Changed

- **`src/utils/formatters/number.formatter.ts`** — `formatNumber` extended in-place with optional `decimals` option (Rule 5).
- **`src/services/index.ts`** — Exported `demoService` and `realtimeTokenService`.
- **`src/components/admin/index.ts`** — Exported `SESSION_TABLE_COLUMNS`.
- **`src/components/seller/index.ts`** — Exported `PAYOUT_TABLE_COLUMNS`, `PayoutStatus`, `PayoutMethod`.

---

- **`src/components/ui/useHorizontalScrollDrag.ts`** — New dedicated hook. Handles mouse/pen drag-to-scroll with velocity-sampled inertia momentum (rAF exponential decay at 0.94/frame, stops at 0.5 px/frame). Touch devices fall back to native scroll. Exposes `{ isDragging, cancelMomentum, cursorClass, style, handlers }`. Click suppression when drag > 5 px. Uses `optionsRef` to keep `onDragStart`/`onDragEnd` callbacks fresh without recreating handlers.
- **`src/components/ui/useHorizontalAutoScroll.ts`** — New dedicated hook. Encapsulates `setInterval` timer lifecycle. Stable `pause()`/`resume()`/`stop()` controls. `onTickRef` pattern avoids stale closures. Starts/restarts cleanly when `enabled`, `interval`, or `onTick` changes.
- **`HorizontalScrollerProps.showFadeEdges`** (`boolean`, default `true`) — Renders subtle gradient-fade overlays on the left and right edges that appear/disappear with CSS `opacity` transitions as scroll position changes, signalling that more content is available in each direction.
- **`PerViewConfig`** exported from `src/components/ui/index.ts` barrel — consumers can now import the responsive breakpoint type directly.

#### Changed

- **`src/components/ui/HorizontalScroller.tsx`** — Complete rewrite of component function body:
  - Old inline drag state (`isDraggingRef`, `dragStartXRef`, etc.) and four pointer handlers replaced by `useHorizontalScrollDrag` hook.
  - Old manual `setInterval`/`isPausedRef`/`startTimer`/`stopTimer` replaced by `useHorizontalAutoScroll` hook.
  - Auto-scroll pause now coordinated via two independent ref flags (`isHoverPausedRef`, `isDragPausedRef`) — `resumeAutoScroll` only fires when both are clear, preventing premature resume when hover and drag overlap.
  - `updateArrows` (no-op stub) replaced by `updateScrollEdges` — reads scroll position and updates `canScrollLeft`/`canScrollRight` state used by the fade overlays.
  - `isGrid` computation moved to the top of the function body (before hooks) so it can be used in hook options.
  - `checkCircularReset` calls `drag.cancelMomentum()` before instant `scrollLeft` correction to prevent the momentum animation fighting the new position.
  - Scroll viewport container gets `relative` positioning class to anchor the absolute-positioned fade overlay divs.
  - `scrollBy` helper extracted; `scrollRight`/`scrollLeft`/`autoAdvance` delegate to it — eliminates duplicate `scrollRef.current?.scrollBy(...)` calls.
  - `effectivePV` alias removed; `perViewProp` used directly throughout.

---

### HorizontalScroller: Drag-to-scroll, always-visible arrows, remove deprecated props (2026-03-01)

#### Changed

- **`src/components/ui/HorizontalScroller.tsx`** — Removed deprecated `snapCount`, `count`, and `showScrollbar` props entirely (Rule 24 — no backward compatibility). Removed `disabled` state from `ArrowButton`; arrows are now always fully visible at both scroll edges. Added unified pointer-event drag-to-scroll (`onPointerDown` / `onPointerMove` / `onPointerUp`) that works identically on mouse and touch — cursor changes to `cursor-grab` on hover and `cursor-grabbing` while dragging. Click events within the scroll area are suppressed after a drag of more than 5 px to prevent accidental item activation. Removed `scroll-smooth` from the inner container class (smooth scroll is still applied via `scrollBy({ behavior: "smooth" })` from arrow/keyboard actions). Auto-scroll pauses during a drag and resumes on pointer release.
- **`src/components/homepage/FeaturedProductsSection.tsx`** — Migrated `snapCount` → `perView`.
- **`src/components/homepage/FeaturedAuctionsSection.tsx`** — Migrated `snapCount` → `perView`.
- **`src/components/homepage/TopCategoriesSection.tsx`** — Migrated `snapCount` → `perView`; removed `showScrollbar`.
- **`src/components/faq/FAQPageContent.tsx`** — Removed `showScrollbar`.
- **`src/components/blog/BlogCategoryTabs.tsx`** — Removed `showScrollbar`.
- **`src/components/ui/SectionTabs.tsx`** — Removed `showScrollbar` from both `HorizontalScroller` instances.

---

### WelcomeSection: Fix raw JSON description rendering (2026-03-01)

#### Fixed

- **`src/components/homepage/WelcomeSection.tsx`** — Description field was displaying raw ProseMirror / TipTap JSON (e.g. `{"type":"doc",...}`) instead of rendered HTML. Now passes `config.description` through `proseMirrorToHtml()` before `dangerouslySetInnerHTML`.
- **`src/components/homepage/WhatsAppCommunitySection.tsx`** — `config.description` was rendered as raw text (including JSON). Now converted via `proseMirrorToHtml()` and rendered via `dangerouslySetInnerHTML`. Member count moved to its own `<p>` element.

#### Added

- **`src/utils/formatters/string.formatter.ts`** — New `proseMirrorToHtml(value: string): string` utility. Converts a ProseMirror / TipTap JSON document string to HTML. Plain HTML strings are passed through unchanged, so the function is safe for mixed content (legacy plain-HTML values and new JSON values). Supports: `paragraph`, `text`, `heading`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`, `hardBreak`, `horizontalRule`, and text marks (`bold`, `italic`, `underline`, `strike`, `code`, `link`).
- **`src/utils/formatters/__tests__/string.formatter.test.ts`** — 7 new test cases covering `proseMirrorToHtml`: paragraph conversion, plain HTML passthrough, invalid JSON passthrough, bold mark, heading, bullet list, and empty string.

---

### Global Styling & Responsive Grid Overhaul (2026-03-02)

#### Fixed

- **`src/app/globals.css`** — Removed destructive `* { @apply m-0 p-0; }` wildcard reset that broke form elements, lists, and prose spacing. Replaced with targeted reset (`h1–h6, p, figure, blockquote, dl, dd { margin: 0; }`).
- **Static pages** (`about`, `privacy`, `terms`, `help`, `contact`) — Applied negative-margin breakout (`-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10`) so hero sections extend full-width instead of being double-padded inside LayoutClient's container. Inner content areas retain proper `px-4 sm:px-6 lg:px-8` padding.
- **`src/components/layout/AutoBreadcrumbs.tsx`** — Locale codes (`en`, `hi`, et al.) no longer appear as breadcrumb segments. Locale prefix is preserved in all generated hrefs.
- **`src/components/layout/Sidebar.tsx`** — Added `bg-black/40 backdrop-blur-[2px]` overlay when sidebar is open on mobile; clicking it closes the sidebar.
- **`src/components/layout/BottomNavbar.tsx`** — Added `${utilities.safeAreaBottom}` (`pb-[env(safe-area-inset-bottom)]`) to the fixed nav element for proper iPhone notch support.

#### Changed (Rule 25 — Explicit xl:/2xl: Breakpoints)

Added missing `xl:` and `2xl:` grid column declarations to:

- **Homepage**: `HomepageSkeleton`, `FeaturedProductsSection`, `FeaturedAuctionsSection`, `BlogArticlesSection`, `TrustIndicatorsSection`, `TrustFeaturesSection`, `SiteFeaturesSection`, `CustomerReviewsSection`
- **Admin features**: `AdminBlogView`, `AdminBidsView`, `AdminPayoutsView`, `AdminReviewsView`, `AdminAnalyticsView`, `AdminSessionsManager`
- **Seller components**: `SellerOrdersView`, `SellerStorefrontView`, `SellerPayoutStats`, `SellerAnalyticsStats`
- **User/profile**: `OrderDetailView`, `ProfileStatsGrid`, `PublicProfileView`
- **Products/categories**: `RelatedProducts`, `ProductSection`, `CategoryGrid`
- **Events/misc**: `EventStatsBanner`, `ContactCTA`, `ReviewDetailView`

---

### HorizontalScroller — Generic Horizontal Scroll Container (2026-03-01)

#### Added

- `src/components/ui/HorizontalScroller.tsx` — generic `HorizontalScroller<T>` component with two layout modes:
  - **`rows=1` (default)** — single-row flex carousel with optional thin scrollbar below
  - **`rows>1`** — CSS `grid-auto-flow:column` multi-row grid scroller (items fill top→bottom per column), scrollbar below:
    ```
    <| col1r1  col2r1  col3r1  … |>
       col1r2  col2r2  col3r2
       col1r3  col2r3  col3r3
       ════scrollbar════
    ```
  - Height driven by item content — no hardcoded height
  - Auto-computed visible column count (`⌊containerWidth ÷ (itemWidth + gap)⌋`) when `count` omitted
  - Left / right arrow buttons paging by `count` columns; only shown when overflow exists
  - `ArrowLeft` / `ArrowRight` keyboard navigation (`enableKeyboard` prop, default `true`)
  - Circular seamless auto-scroll (single-row only) via tripled items array; position-reset debounced 350 ms after scroll settles
  - `showScrollbar` prop — shows `scrollbarThinX` horizontal scrollbar at bottom (default `false`)
  - `rows`, `pauseOnHover`, `showArrows`, `showScrollbar`, `enableKeyboard`, `itemWidth`, `gap`, `autoScrollInterval`, `keyExtractor`, `className`, `scrollerClassName` props
  - Exported as `HorizontalScroller` + `HorizontalScrollerProps` from `@/components/ui` and `@/components`

#### Changed

- `FeaturedProductsSection` — **mobile** (`md:hidden`): single-row circular `autoScroll` carousel; **desktop** (`hidden md:block`): `rows={3}` grid with `showScrollbar`, up to 30 products
- `FeaturedAuctionsSection` — same responsive split; `rows={3}` + `showScrollbar` on desktop
- `BlogCategoryTabs` — replaced `overflow-x-auto` flex div with `HorizontalScroller` (`autoScroll={false}`, `showScrollbar`, `gap={8}`)
- `SectionTabs` — desktop nav replaced with `HorizontalScroller` (`gap={0}`, `autoScroll={false}`, `showScrollbar`); arrows appear when tab list overflows

---

### Static FAQs + Newsletter Removal (2026-03-15)

#### Added

- `src/constants/faq-data.ts` — 102 static FAQ entries (`StaticFAQItem[]`) across 7 categories; exported helper functions `getStaticFaqsByCategory`, `getAllStaticFaqs`, `getStaticFaqCategoryCounts`
- `StaticFAQItem` type exported from `@/constants`

#### Changed

- `FAQSection` (homepage) — now reads from static constants (`getStaticFaqsByCategory`); shows **10 FAQs per category** (up from 6) with a "View All →" button that includes a `+N` count badge when more FAQs exist; no loading skeleton or API calls
- `FAQPageContent` — replaced `useAllFaqs()` API hook with direct `STATIC_FAQS` constant; removed `isLoading` skeleton; removed "newest" sort option (no `createdAt` on static data)
- `FAQAccordion` — type changed from `FAQDocument[]` to `StaticFAQItem[]`; `answer` field simplified to `string`
- `src/constants/index.ts` — exports `STATIC_FAQS`, `getStaticFaqsByCategory`, `getAllStaticFaqs`, `getStaticFaqCategoryCounts`, `StaticFAQItem`

#### Removed

- **Newsletter feature** entirely from the UI and all supporting layers:
  - Pages: `/admin/newsletter`, `/api/newsletter/subscribe`, `/api/admin/newsletter`, `/api/admin/newsletter/[id]`
  - Components: `NewsletterSection`, `AdminNewsletterView`, `NewsletterTableColumns`
  - Hooks: `useNewsletterSubscribe`, `useAdminNewsletter`, `usePublicFaqs`, `useAllFaqs`
  - Services: `newsletter.service.ts`
  - Repository: `newsletter.repository.ts`
  - Schema: `newsletter.ts`
  - Seed data: `scripts/seed-data/newsletter-seed-data.ts`
  - Admin nav tab for Newsletter removed from `AdminTabs`
  - `<NewsletterSection />` removed from homepage

---

### Firebase Cloud Functions — Scheduled Jobs + Firestore Triggers (2026-03-01)

#### Added

- **`functions/`** — new standalone Firebase Functions package (Node 20, TypeScript, 2nd-gen / Cloud Run).
- **`functions/src/config/firebase-admin.ts`** — shared Admin SDK init (no explicit credential; uses ADC in production).
- **`functions/src/config/constants.ts`** — centralised `SCHEDULES`, `REGION` (`asia-south1`), `BATCH_LIMIT`, business timeouts, and all Firestore collection names.
- **`functions/src/utils/logger.ts`** — `logInfo` / `logError` / `logWarn` wrappers over `firebase-functions/v2` logger.
- **`functions/src/utils/batchHelper.ts`** — `batchDelete` and `batchUpdate` utilities that auto-split operations at the 400-doc limit.

**Scheduled jobs** (all 2nd-gen `onSchedule`, `asia-south1` region):

| Export                  | Schedule         | What it does                                                                                   |
| ----------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `auctionSettlement`     | every 5 min      | Settles expired auctions — marks bids `won`/`lost`, creates winner Order, pushes notifications |
| `pendingOrderTimeout`   | every 60 min     | Cancels orders unpaid for > 24 h, sends `order_cancelled` notification                         |
| `couponExpiry`          | 00:05 UTC daily  | Deactivates coupons whose `validity.endDate` has passed                                        |
| `expiredTokenCleanup`   | 03:00 UTC daily  | Deletes expired email-verification and password-reset tokens                                   |
| `expiredSessionCleanup` | 02:00 UTC daily  | Deletes expired session documents                                                              |
| `payoutBatch`           | 06:00 UTC daily  | Sweeps pending payouts → Razorpay Payouts API; retries up to 3× then marks `failed`            |
| `productStatsSync`      | 01:00 UTC daily  | Recomputes `avgRating` + `reviewCount` on all published products from approved reviews         |
| `cartPrune`             | Sunday 04:00 UTC | Deletes carts idle for > 30 days                                                               |
| `notificationPrune`     | Monday 01:00 UTC | Deletes read notifications older than 90 days                                                  |

**Firestore triggers**:

| Export                | Trigger                     | What it does                                                                                                                  |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `onBidPlaced`         | `bids/{bidId}` onCreate     | Demotes previous winner to `outbid`, updates product `currentBid`/`bidCount`, sends Firestore notification + Realtime DB push |
| `onOrderStatusChange` | `orders/{orderId}` onUpdate | On status change: writes typed notification, Realtime DB push, and transactional Resend email (confirmed/shipped/delivered)   |

- **`functions/src/index.ts`** — entry point exporting all 11 functions.
- **`functions/package.json`** — dependencies: `firebase-admin ^13`, `firebase-functions ^6`.
- **`functions/tsconfig.json`** — targets `es2020`, `commonjs`, strict mode.
- **`functions/.env.example`** — documents required secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_ACCOUNT_NUMBER`, `RESEND_API_KEY`.
- **`functions/.gitignore`** — excludes `lib/`, `node_modules/`, `.env`.
- **`firebase.json`** — added `functions` codebase config and `emulators.functions` (port 5001).
- **`scripts/deploy-functions.ps1`** — PowerShell script to `npm ci` + `tsc` + `firebase deploy --only functions`; supports `-FunctionName` for single-function deploys and `-OnlyBuild` for dry runs.

#### Notes

- All jobs use the `batchDelete` / `batchUpdate` helpers to stay under the 500-op Firestore batch ceiling.
- `payoutBatch` calls Razorpay via native `fetch`; credentials must be set as Firebase Secrets before deploying.
- `onOrderStatusChange` sends Resend emails only for `confirmed`, `shipped`, and `delivered` transitions; credentials are environment-injected.
- `onBidPlaced` writes to `auction_bids/{productId}` in Realtime DB for live auction UI updates.

---

### Bug Fixes — AdvertisementBanner null guard + Missing Firestore indexes (2026-03-01)

#### Fixed

- **`src/components/homepage/AdvertisementBanner.tsx`** — added `!banner.content` to the early-return guard. The component crashed with `TypeError: can't access property "title", banner.content is undefined` when a homepage section document existed but its `config.content` field was absent.
- **`firestore.indexes.json`** — added three composite indexes that were missing and causing `FAILED_PRECONDITION` (HTTP 500) on the homepage:
  - `products`: `isAuction ASC` + `createdAt DESC` — required by `/api/products?isAuction=true&...&sorts=-createdAt`
  - `categories`: `isActive ASC` + `tier ASC` + `order ASC` — required by `CategoriesRepository.buildTree`
  - `blogPosts`: `isFeatured ASC` + `status ASC` + `publishedAt DESC` — required by `BlogRepository.listPublished` with `?featured=true&sorts=-publishedAt`
- Indexes deployed to Firebase (`firebase deploy --only firestore:indexes`).

---

### Firebase Functions — Coding Rules Compliance Refactor (2026-03-01)

#### Changed

- **`functions/src/lib/errors.ts`** _(new)_ — Typed error classes mirroring the main app's `src/lib/errors/`: `FnError` (base), `ConfigurationError`, `NotFoundError`, `IntegrationError` (with `service` + `statusCode` fields), `DatabaseError`, `ValidationError`. No raw `throw new Error()` anywhere in the functions package.
- **`functions/src/constants/messages.ts`** _(new)_ — All notification titles, message templates, email subjects, and system error strings as typed constants (`AUCTION_MESSAGES`, `BID_MESSAGES`, `ORDER_MESSAGES`, `EMAIL_SUBJECTS`, `FN_ERROR_MESSAGES`). Eliminates all hardcoded strings from jobs and triggers (RULE 3).
- **`functions/src/repositories/`** _(new — 10 files + barrel)_ — Repository pattern for all Firestore access (RULE 12). Jobs and triggers never call `db.collection()` directly.

| Repository               | Key methods                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `productRepository`      | `getExpiredAuctions`, `getPublishedIds`, `updateStats`, `incrementBidCount`, `updateStatus` |
| `bidRepository`          | `getActiveByProduct`, `getWinningBid`, `markWon/Lost/Outbid/Winning`                        |
| `orderRepository`        | `getTimedOutPending`, `cancelInBatch`, `createFromAuction`                                  |
| `sessionRepository`      | `getExpiredRefs`                                                                            |
| `tokenRepository`        | `getExpiredEmailVerificationRefs`, `getExpiredPasswordResetRefs`                            |
| `couponRepository`       | `getExpiredActiveRefs`, `deactivateInBatch`                                                 |
| `cartRepository`         | `getStaleRefs`                                                                              |
| `payoutRepository`       | `getPending`, `markProcessing`, `recordSuccess`, `recordFailure`                            |
| `notificationRepository` | `getOldReadRefs`, `createInBatch`, `create`                                                 |
| `reviewRepository`       | `getApprovedRatingAggregate`                                                                |

- **All 9 job files** — Replaced `db.collection(COLLECTIONS.*)` queries with repository calls; replaced `throw new Error(...)` with typed error classes; replaced hardcoded notification strings with `ORDER_MESSAGES.*` / `AUCTION_MESSAGES.*` constants.
- **`functions/src/triggers/onBidPlaced.ts`** — Replaced direct Firestore reads/writes with `bidRepository`, `productRepository`, `notificationRepository`; replaced hardcoded notification title/message with `BID_MESSAGES.*`.
- **`functions/src/triggers/onOrderStatusChange.ts`** — Replaced `STATUS_CONFIG` hardcoded strings with `ORDER_MESSAGES.*`; replaced `subjectMap` with `EMAIL_SUBJECTS.*`; replaced Resend error throw with `IntegrationError`; replaced direct Firestore notification write with `notificationRepository.create()`.

#### Build verification

- `npx tsc --noEmit` → **0 errors**
- `npm run build` → **exit 0**

---

### Seed Data Expansion — blogPosts, events, eventEntries, notifications, payouts (2026-02-28)

#### Added

- **`scripts/seed-data/blog-posts-seed-data.ts`** — 8 blog posts (6 published, 1 draft, 1 archived) spanning all `BlogPostCategory` values (`guides`, `tips`, `news`, `updates`, `community`). Two posts marked `isFeatured: true`.
- **`scripts/seed-data/events-seed-data.ts`** — 5 events covering every `EventType` (`sale`, `offer`, `poll`, `survey`, `feedback`) with appropriate `saleConfig` / `offerConfig` / `pollConfig` / `surveyConfig` / `feedbackConfig` blocks. 8 event entries (`EventEntryDocument`) exercising all `EntryReviewStatus` values including one flagged entry.
- **`scripts/seed-data/notifications-seed-data.ts`** — 16 in-app notifications distributed across 5 users, covering all 15 `NotificationType` values (`welcome`, `order_placed`, `order_shipped`, `order_delivered`, `order_confirmed`, `bid_placed`, `bid_outbid`, `bid_won`, `bid_lost`, `review_approved`, `product_available`, `promotion`, `system`). Mix of read and unread.
- **`scripts/seed-data/payouts-seed-data.ts`** — 7 payout records across 4 sellers, covering all 4 `PayoutStatus` values (`pending`, `processing`, `completed`, `failed`). Includes both `bank_transfer` and `upi` payment methods with masked bank details.
- **`coupon-HOLI15`** added to `scripts/seed-data/coupons-seed-data.ts` — required FK for `event-holi-offer-2026-offer.offerConfig.couponId`.

#### Changed

- **`scripts/seed-data/index.ts`** — Added exports for `blogPostsSeedData`, `eventsSeedData`, `eventEntriesSeedData`, `notificationsSeedData`, `payoutsSeedData`.
- **`scripts/seed-all-data.ts`** — Added imports for all 5 new data arrays and 5 new collection constants (`BLOG_POSTS_COLLECTION`, `EVENTS_COLLECTION`, `EVENT_ENTRIES_COLLECTION`, `NOTIFICATIONS_COLLECTION`, `PAYOUT_COLLECTION`). Added seeding blocks for each collection. Updated `allCollections` array.
- **`scripts/seed-data/RELATIONSHIPS.md`** — Updated statistics summary; added FK consistency tables and seeding order for all new collections.

---

### TASK-46 — Wire BlogArticlesSection to live API; hide when no featured posts (2026-02-28)

#### Changed

- **`src/components/homepage/BlogArticlesSection.tsx`** — Replaced hardcoded `MOCK_BLOG_ARTICLES` with `useApiQuery` + `blogService.getFeatured(4)`. Section now renders only when the API returns ≥ 1 featured post (`isFeatured: true`) and stays hidden while loading or when the result is empty. Field references updated: `thumbnail` → `coverImage`, `readTime` → `readTimeMinutes` to match `BlogPostDocument`.
- **`src/services/blog.service.ts`** — Added `getFeatured(count?: number)` — calls `GET /api/blog?featured=true&pageSize={count}&sorts=-publishedAt`.
- **`src/components/homepage/__tests__/BlogArticlesSection.test.tsx`** — Rewritten to mock `useApiQuery`; covers loading (returns null), empty (returns null), data-present, image fallback, and accessibility cases.
- **`src/services/__tests__/blog.service.test.ts`** — Added two test cases for `getFeatured()` (default count and custom count).

#### Removed

- **`src/constants/homepage-data.ts`** — Deleted `BlogArticle` interface and `MOCK_BLOG_ARTICLES` constant — no callers remain now that the component uses the live API.
- **`src/constants/index.ts`** — Removed `MOCK_BLOG_ARTICLES` and `BlogArticle` type re-exports.

---

### TASK-45 — Comprehensive Sieve compliance & schema field constant audit (2026-03-01)

#### Fixed

- **`src/repositories/faqs.repository.ts`** — `SIEVE_FIELDS` key `helpful` corrected to `"stats.helpful"` with `path: FAQ_FIELDS.STAT.HELPFUL` so the nested field resolves correctly in Firestore queries.
- **`src/services/faq.service.ts`** — `listPublic` Sieve filter changed from `published==true` (non-existent field) to `isActive==true`.
- **`src/hooks/usePublicFaqs.ts`** — `useAllFaqs` query fixed from `faqService.list("isActive=true")` (invalid raw param) to `faqService.list("filters=isActive==true&sorts=-priority,order")` (correct Sieve DSL).
- **`src/app/api/categories/route.ts`** — `parentId` branch: replaced `findAll().filter(...)` with `getChildren(parentId)` (Firestore-native). Default path no longer double-loads the collection; tree branch uses `tree.length` for result meta.
- **`src/repositories/categories.repository.ts`** — `getCategoryBySlug()` hardcoded `"slug"` → `CATEGORY_FIELDS.SLUG`. `buildTree()` default path replaced `findAll()` with a targeted Firestore query (`IS_ACTIVE==true`, ordered by `TIER` + `ORDER`). Added `SIEVE_FIELDS` + `list(SieveModel)` for admin flat listing.
- **`src/repositories/carousel.repository.ts`** — Added `SIEVE_FIELDS` + `list(SieveModel)` for admin paginated listing.
- **`src/app/api/carousel/route.ts`** — Admin path `findAll()` replaced with `(await carouselRepository.list({sorts:"order", page:"1", pageSize:"100"})).items`.
- **`src/app/api/homepage-sections/route.ts`** — `findAll().filter(s => s.enabled)` replaced with `getEnabledSections()` (Firestore-native).
- **`src/app/api/faqs/route.ts`** — POST handler's `findAll()` used to compute `maxOrder` replaced with a single-document Sieve query `{sorts:"-order", page:"1", pageSize:"1"}`.
- **`src/app/api/admin/coupons/route.ts`** — `page` / `pageSize` (numbers from `getNumberParam`) wrapped with `String()` before passing to `couponsRepository.list()` to satisfy `SieveModel` string types.
- **`src/repositories/session.repository.ts`** — Four hardcoded Firestore field strings (`"userId"`, `"lastActivity"`, `"expiresAt"`) replaced with `SESSION_FIELDS.*` constants. Added `SIEVE_FIELDS` + `list(SieveModel)` + `listForUser(userId, SieveModel)`.
- **`src/repositories/coupons.repository.ts`** — `getActiveCoupons()` and `getCouponsExpiringSoon()` replaced in-memory date filtering with Firestore-native range queries on `COUPON_FIELDS.VALIDITY_FIELDS.IS_ACTIVE` + `VALIDITY_FIELDS.END_DATE`. Relies on existing composite index in `firestore.indexes.json`.
- **`src/repositories/newsletter.repository.ts`** — `getStats()` replaced full-collection scan with `count()` aggregations (parallel) + `.select(NEWSLETTER_FIELDS.SOURCE)` scoped to active subscribers for source breakdown.
- **`src/repositories/homepage-sections.repository.ts`** — Added `HOMEPAGE_SECTION_FIELDS` import, `SIEVE_FIELDS`, and `list(SieveModel)` method.
- **`src/repositories/notification.repository.ts`** — Added `SIEVE_FIELDS`, `list(SieveModel)`, and `listForUser(userId, SieveModel)` methods.

#### Removed

- **`src/repositories/blog.repository.ts`** — Deleted legacy `findPublished()` (in-memory pagination), `findAllPublished()`, and `findAll()` methods — all superseded by the existing Sieve-based `listPublished()` and `listAll()`. No external callers existed.
- **`src/repositories/product.repository.ts`** — Deleted unused `findPublished()` shorthand — no callers; superseded by `list(SieveModel)`.

---

### TASK-44 — Migrate cart and checkout components from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/cart/CartItemList.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")`; empty state text and "Start Shopping" link now use `t()`.
- **`src/components/cart/CartItemRow.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")`; remove button label now uses `t("remove")`.
- **`src/components/cart/CartSummary.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")` + `useTranslations("loading")`; all 12 label refs (order summary, subtotal, item count, discount, shipping, tax, total, loading, checkout, continue shopping) use `t()`.
- **`src/components/checkout/CheckoutAddressStep.tsx`** — Replaced `UI_LABELS` with `useTranslations("checkout")`; select-address heading, no-addresses, and add-address labels use `t()`.
- **`src/components/checkout/CheckoutOrderReview.tsx`** — Replaced `UI_LABELS` with `useTranslations("checkout")` + `useTranslations("cart")`; shipping address, order items, payment method, and total labels use `t()`.
- **`src/components/checkout/OrderSuccessActions.tsx`** — Added `"use client"` directive (was server component); removed module-level `const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE`; replaced with `useTranslations("orderSuccess")` + `useTranslations("orders")`.
- **`messages/en.json`** — Added 5 keys to `cart` namespace: `startShopping`, `itemsSubtotal`, `discount`, `shippingCalculated`, `taxCalculated`.
- **`messages/en.json`** — Added 5 keys to `checkout` namespace: `noAddresses`, `shippingTo`, `changeAddress`, `orderItems`, `paymentOnDelivery`.
- **`messages/hi.json`** — Same 10 keys added with Hindi translations.

#### Tests

- **`src/components/cart/__tests__/CartItemList.test.tsx`** — New; 3 tests covering empty state, items list, and conditional empty-state rendering.
- **`src/components/cart/__tests__/CartItemRow.test.tsx`** — New; 3 tests covering product title, remove label, and updating opacity.
- **`src/components/cart/__tests__/CartSummary.test.tsx`** — New; 8 tests covering order summary heading, total, checkout/continue-shopping buttons, loading state, discount row, click handler, disabled state.
- **`src/components/checkout/__tests__/CheckoutAddressStep.test.tsx`** — New; 5 tests covering heading, no-addresses state, add-address button (empty and non-empty), and address rendering.
- **`src/components/checkout/__tests__/CheckoutOrderReview.test.tsx`** — New; 7 tests covering shipping label, change-address, order items heading, quantity label, payment method, cod text, and total.
- **`src/components/checkout/__tests__/OrderSuccessActions.test.tsx`** — New; 4 tests covering view-order, continue-shopping, orders title, and link rendering.

---

### TASK-43 — Migrate 7 product display components from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/products/ProductCard.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; `featured`, `auction`, `promoted`, `sold`, `outOfStock` badges now use `t()`.
- **`src/components/products/ProductFilters.tsx`** — Replaced `UI_LABELS` + `UI_PLACEHOLDERS` with `useTranslations("products")`; all filter labels and placeholders now use `t()`.
- **`src/components/products/ProductGrid.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; empty-state messages now use `t()`.
- **`src/components/products/ProductSortBar.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; moved module-level `SORT_OPTIONS` array inside component function body; sort options and count text use `t()`.
- **`src/components/products/ProductInfo.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")` + `useTranslations("loading")`; all 20 label references replaced.
- **`src/components/products/ProductReviews.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")` + `useTranslations("actions")`; reviews heading, empty state, verified badge, helpful count, and pagination buttons use `t()`.
- **`src/components/products/RelatedProducts.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; section title uses `t("relatedTitle")`.
- **`messages/en.json`** — Added 31 new keys to `products` namespace: `featured`, `auction`, `promoted`, `filters`, `clearFilters`, `filterCategory`, `filterAllCategories`, `filterPriceRange`, `filterMinPrice`, `filterMaxPrice`, `showing`, `sortBy`, `sortNewest`, `sortOldest`, `sortPriceLow`, `sortPriceHigh`, `sortNameAZ`, `sortNameZA`, `currentBid`, `startingBid`, `totalBids`, `auctionEnds`, `availableStock`, `placeBid`, `reviewsTitle`, `reviewsNone`, `reviewsBeFirst`, `verifiedPurchase`, `helpful`, `relatedTitle`, `features`, `shipping`, `returnPolicy`.
- **`messages/hi.json`** — Same 31 keys added with Hindi translations.

#### Tests

- **`src/components/products/__tests__/ProductCard.test.tsx`** — New; 6 tests covering badge rendering for featured, auction, promoted, sold, outOfStock.
- **`src/components/products/__tests__/ProductFilters.test.tsx`** — New; 5 tests covering filter labels and conditional clearFilters button.
- **`src/components/products/__tests__/ProductGrid.test.tsx`** — New; 3 tests covering product rendering, empty state, loading skeletons.
- **`src/components/products/__tests__/ProductSortBar.test.tsx`** — New; 4 tests covering sort label, count display, and sort dropdown.
- **`src/components/products/__tests__/ProductInfo.test.tsx`** — New; 8 tests covering product title, badges, description, action button, sold/outOfStock states.
- **`src/components/products/__tests__/ProductReviews.test.tsx`** — New; 7 tests covering empty state, review rendering, verified badge, helpful count, loading skeletons, pagination.
- **`src/components/products/__tests__/RelatedProducts.test.tsx`** — New; 3 tests covering heading rendering, loading skeletons, empty state.

---

### TASK-42 — Migrate `DrawerFormFooter.tsx` default prop values from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/admin/DrawerFormFooter.tsx`** — Removed `UI_LABELS` import; added `useTranslations("actions")` and `useTranslations("loading")`; changed default prop values (`submitLabel`, `deleteLabel`, `cancelLabel`) from `UI_LABELS.ACTIONS.*` constants to `undefined`; resolved defaults inside function body via `submitLabel ?? t("save")` etc.; replaced `UI_LABELS.LOADING.SAVING` in JSX with `tLoading("saving")`.

#### Tests

- **`src/components/admin/__tests__/DrawerFormFooter.test.tsx`** — Rewritten; removed `UI_LABELS` import; added `next-intl` mock; 5 tests covering default translation keys, custom label props, loading state, callback handlers, and conditional delete button.

---

### TASK-41 — Convert 5 admin table column files from `UI_LABELS` to `useTranslations` hooks (2026-02-28)

#### Changed

- **`src/components/admin/products/ProductTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminProducts")` + `useTranslations("actions")`; renamed `getProductTableColumns` → `useProductTableColumns`; replaced all `LABELS.*` + `UI_LABELS.ACTIONS.*` with translation keys.
- **`src/components/admin/orders/OrderTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminOrders")` + `useTranslations("actions")`; renamed `getOrderTableColumns` → `useOrderTableColumns`; replaced hardcoded column headers (`"Order ID"`, `"Product"`, `"Customer"`, `"Amount"`, `"Status"`, `"Payment"`) with `t()` calls.
- **`src/components/admin/bids/BidTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminBids")` + `useTranslations("actions")`; renamed `getBidTableColumns` → `useBidTableColumns`; replaced all `LABELS.*` references.
- **`src/components/admin/users/UserTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminUsers")` + `useTranslations("actions")`; renamed `getUserTableColumns` → `useUserTableColumns`; replaced `UI_LABELS.TABLE.*`, `UI_LABELS.FORM.*`, `UI_LABELS.STATUS.*`, `UI_LABELS.ADMIN.USERS.*` with translation keys; added `colName`, `colEmail`, `colRole`, `colStatus`, `colJoined`, `colLastLogin`, `emailNotVerified`, `never` keys.
- **`src/components/admin/sections/SectionTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminSections")` + `useTranslations("actions")`; renamed `getSectionTableColumns` → `useSectionTableColumns`; replaced hardcoded `"Order"`, `"Title"`, `UI_LABELS.TABLE.STATUS`, `UI_LABELS.STATUS.ACTIVE/INACTIVE` with translation keys; renamed loop var `t` → `st` to avoid shadowing.
- **`src/components/admin/products/index.ts`**, **`src/components/admin/orders/index.ts`**, **`src/components/admin/bids/index.ts`**, **`src/components/admin/users/index.ts`**, **`src/components/admin/sections/index.ts`**, **`src/components/admin/index.ts`** — Updated barrel exports for all renamed hook functions.
- **`src/features/admin/components/AdminProductsView.tsx`**, **`AdminOrdersView.tsx`**, **`AdminBidsView.tsx`**, **`AdminUsersView.tsx`**, **`AdminSectionsView.tsx`** — Updated imports and call sites from `getX` → `useX`.
- **`src/features/seller/components/SellerProductsView.tsx`**, **`SellerOrdersView.tsx`** — Updated to `useProductTableColumns` / `useOrderTableColumns`; removed `useMemo` wrappers (hooks cannot be called inside `useMemo`).
- **`messages/en.json`** — Added `colOrderId`, `colProduct`, `colCustomer`, `colAmount`, `colStatus`, `colPayment`, `colDetails` to `adminOrders`; `status` to `adminBids`; `colName`, `colEmail`, `colRole`, `colStatus`, `colJoined`, `colLastLogin`, `emailNotVerified`, `never` to `adminUsers`; `colStatus`, `statusActive`, `statusInactive`, `colOrder`, `colTitle` to `adminSections`.
- **`messages/hi.json`** — Added matching Hindi translations for all new keys.
- **`docs/APPLICATION_GRAPH.md`** — Updated component references from `ProductTableColumns` → `useProductTableColumns`, `OrderTableColumns` → `useOrderTableColumns`, `SectionTableColumns` → `useSectionTableColumns`.

#### Tests

- **`src/components/admin/products/__tests__/ProductTableColumns.test.tsx`** — Created; 3 tests for hook structure and action callbacks.
- **`src/components/admin/orders/__tests__/OrderTableColumns.test.tsx`** — Created; 2 tests for hook structure and view callback.
- **`src/components/admin/bids/__tests__/BidTableColumns.test.tsx`** — Created; 2 tests for hook structure and view callback.
- **`src/components/admin/users/__tests__/UserTableColumns.test.tsx`** — Created; 4 tests for hook structure, ban and unban callbacks.
- **`src/components/admin/sections/__tests__/SectionTableColumns.test.tsx`** — Rewritten for hook pattern; 3 tests for structure and action callbacks.
- 14 view/page test mock files updated to reference `useX` hook names instead of `getX` function names.

---

### TASK-40 — Migrate `SectionForm.tsx` to `useTranslations` + `Checkbox` component (2026-02-28)

#### Changed

- **`src/components/admin/sections/SectionForm.tsx`** — Added `"use client"` + `useTranslations("adminSections")`; replaced `const LABELS = UI_LABELS.ADMIN.SECTIONS` and all `LABELS.*` references with `t()` calls; replaced `UI_LABELS.ADMIN.CATEGORIES.ENABLED` with `t("enabled")`; replaced hardcoded `"Title"`, `"Description"`, `"Order"`, `"Enter section description..."` with translation keys; replaced raw `<input type="checkbox">` block with `<Checkbox>` component from `@/components`; removed `UI_LABELS` import.
- **`messages/en.json`** — Added `sectionType`, `title`, `description`, `order`, `enabled`, `descriptionPlaceholder`, `configuration` keys to `adminSections` namespace.
- **`messages/hi.json`** — Added matching Hindi translations for new `adminSections` keys.

#### Tests

- **`src/components/admin/sections/__tests__/SectionForm.test.tsx`** — Updated to use `next-intl` mock (`useTranslations: () => (key) => key`); updated assertions to use translation key strings instead of `UI_LABELS` values; all 4 tests pass.

---

### TASK-39 — Migrate admin dashboard components to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/admin/dashboard/QuickActionsGrid.tsx`** — Removed `UI_LABELS` import; added `useTranslations('adminDashboard')`; moved `QUICK_ACTIONS` array inside component function so `t()` is accessible; replaced 4 hardcoded strings (`quickActions`, `manageUsers`, `reviewDisabled`, `manageContent`).
- **`src/components/admin/dashboard/RecentActivityCard.tsx`** — Added `"use client"` directive; added `useTranslations('adminDashboard')`; replaced 5 hardcoded strings (`recentActivity`, `newUsers`, `newUsersRegistered` with ICU plural, `systemStatus`, `allSystemsOperational`).
- **`src/components/admin/AdminStatsCards.tsx`** — Added `"use client"` directive; removed `UI_LABELS` import; added `useTranslations('adminStats')`; moved `STAT_CARDS` array builder inside component; replaced 6 stat-card labels (`totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`, `totalProducts`, `totalOrders`).
- **`messages/en.json`** — Added `adminDashboard` namespace (9 keys: `quickActions`, `manageUsers`, `reviewDisabled`, `manageContent`, `recentActivity`, `newUsers`, `newUsersRegistered`, `systemStatus`, `allSystemsOperational`) and `adminStats` namespace (6 keys: `totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`, `totalProducts`, `totalOrders`).
- **`messages/hi.json`** — Added matching Hindi translations for `adminDashboard` and `adminStats` namespaces.

#### Tests

- **`src/components/admin/dashboard/__tests__/QuickActionsGrid.test.tsx`** — Created; 5 tests covering renders, quick-action links, and heading.
- **`src/components/admin/dashboard/__tests__/RecentActivityCard.test.tsx`** — Created; 6 tests covering stats display, activity section, and system status.
- **`src/components/admin/__tests__/AdminStatsCards.test.tsx`** — Updated to use next-intl mock and translation key assertions (removed `UI_LABELS` references).

---

### TASK-38 — Add missing `coupons: type+createdAt` Firestore composite index (2026-02-28)

#### Added

- **`firestore.indexes.json`** — Added composite index `{ collectionGroup: "coupons", fields: [type ASC, createdAt DESC] }`. This was the only index identified in the D.2 audit table not covered by TASK-30–33.

#### Changed

- **`docs/APPLICATION_GRAPH.md`** — D.2 section header updated to include TASK-38; coupons row `type+createdAt` moved from "Missing" → "Defined" column; status updated to ✅.

---

### TASK-37 — Migrate `EmailVerificationCard` + `PhoneVerificationCard` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/user/settings/EmailVerificationCard.tsx`** — Removed unused `UI_LABELS` import; added `useTranslations('userSettings')`; replaced all 7 hardcoded English strings with `t('key')` calls (`emailVerificationTitle`, `verified`, `notVerified`, `verifiedMessage`, `notVerifiedMessage`, `sending`, `resendVerification`).
- **`src/components/user/settings/PhoneVerificationCard.tsx`** — Removed unused `UI_LABELS` import; added `useTranslations('userSettings')`; replaced all 7 hardcoded English strings (`phoneVerificationTitle`, `verified`, `notVerified`, `phoneNotAdded`, `phoneVerifiedMessage`, `phoneNotVerifiedMessage`, `verifying`, `verify`).
- **`messages/en.json`** — Added new `userSettings` namespace with 13 keys: `emailVerificationTitle`, `phoneVerificationTitle`, `verified`, `notVerified`, `verifiedMessage`, `notVerifiedMessage`, `sending`, `resendVerification`, `phoneNotAdded`, `phoneVerifiedMessage`, `phoneNotVerifiedMessage`, `verifying`, `verify`.
- **`messages/hi.json`** — Same 13 keys added with Hindi translations.

#### Updated

- **`src/components/user/settings/__tests__/EmailVerificationCard.test.tsx`** — Added `next-intl` mock + 7 new tests covering translation key rendering, badge variants, loading states.
- **`src/components/user/settings/__tests__/PhoneVerificationCard.test.tsx`** — Added `next-intl` mock + 8 new tests covering phone absent/present states, verification badges, loading labels.

---

### TASK-36 — Migrate `SellerQuickActions` + `SellerRecentListings` to `useTranslations` (2026-02-28)

#### Changed

- **`src/features/seller/components/SellerQuickActions.tsx`** — Removed `UI_LABELS` import; added `useTranslations('sellerDashboard')`; replaced all `UI_LABELS.SELLER_PAGE.*` references with `t('key')`; fixed "Add Product" navigation to correctly route to `ROUTES.SELLER.PRODUCTS_NEW` (was incorrectly pointing to `ROUTES.SELLER.PRODUCTS`).
- **`src/features/seller/components/SellerRecentListings.tsx`** — Removed `UI_LABELS` import; added `useTranslations('sellerDashboard')`; replaced `UI_LABELS.SELLER_PAGE.RECENT_LISTINGS` → `t('recentListings')` and `UI_LABELS.ACTIONS.VIEW_ALL` → `t('viewAll')`.
- **`messages/en.json`** — Extended `sellerDashboard` namespace with 6 new keys: `quickActions`, `viewProducts`, `viewAuctions`, `viewSales`, `recentListings`, `viewAll`.
- **`messages/hi.json`** — Added same 6 keys with Hindi translations.

#### Added

- **`src/features/seller/components/__tests__/SellerQuickActions.test.tsx`** — 6 new tests: heading renders, all 4 action buttons render with correct `useTranslations` keys, navigation verified for each button.
- **`src/features/seller/components/__tests__/SellerRecentListings.test.tsx`** — 6 new tests: null render when loading, null render when empty, heading and view-all button render, product titles shown, view-all navigates to `/seller/products`, max-5-item limit enforced.

---

### DOCS — APPLICATION_GRAPH.md stale reference cleanup (2026-02-28)

#### Changed

- **APPLICATION_GRAPH.md** — Feature module tree: removed stale `⚠️ MISSING: ForgotPasswordView` and `⚠️ MISSING: VerifyEmailView` warnings from `auth/components/`; both views were created in TASK-11 and TASK-12 and are now listed as present.
- **APPLICATION_GRAPH.md** — Feature module tree: removed `⚠️ CONFLICT` warning for `events/services/event.service.ts`; Tier-2 duplicate was deleted in TASK-27. Updated to show resolution.
- **APPLICATION_GRAPH.md** — Feature module tree: removed `⚠️ MISSING: SellerCreateProductView` warning from `seller/components/`; component was created in TASK-28. Added `SellerCreateProductView ✅ (TASK-28)` and `SellerDashboardView ✅ (TASK-15)` to the listing.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 7 (MediaUploadField): marked ✅ RESOLVED via TASK-10; `MediaUploadField.tsx` exists at `src/components/admin/MediaUploadField.tsx`.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 11 (`useAuth.ts` Firebase SDK): marked ✅ RESOLVED via TASK-21; `signInWithEmail` wrapper added to `auth-helpers.ts`, direct Firebase imports removed.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 12 (`SessionContext.tsx` Firebase SDK): marked ✅ RESOLVED via TASK-22; `subscribeToAuthState` wrapper added, only `import type { User }` remains (type-only, no runtime dependency).
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 13 (`BlogForm`/`ProductForm` `UI_LABELS`): marked ✅ RESOLVED via TASK-23 and TASK-24; all admin components now use `useTranslations`.
- **APPLICATION_GRAPH.md** — Refactoring Opportunities table: `auth/forgot-password/page.tsx` and `auth/verify-email/page.tsx` rows updated to show ✅ RESOLVED (TASK-11/12).
- **APPLICATION_GRAPH.md** — D.2 index coverage table: added resolved banner above the table noting all ⚠️/❌ entries were fixed by TASK-30–33.

#### Summary

All 9 stale warning references in `APPLICATION_GRAPH.md` (from TASK-11, 12, 21, 22, 23, 27, 28 and index tasks) are now updated to reflect their resolved state. The living document accurately reflects the current codebase state.

---

### TASK-29 — Document 17 Undocumented Hooks in GUIDE.md and QUICK_REFERENCE.md (2026-02-28)

#### Added

- **TASK-29 (P2):** `docs/GUIDE.md` — added `useGoogleLogin` and `useAppleLogin` to Authentication Hooks section with full signature, return type, and examples.
- **TASK-29 (P2):** `docs/GUIDE.md` — expanded Profile Hooks section with individual entries for `useAddress(id)`, `useCreateAddress`, `useUpdateAddress`, `useDeleteAddress`, `useSetDefaultAddress`; each includes file reference, purpose, parameters, and return types.
- **TASK-29 (P2):** `docs/GUIDE.md` — added new **FAQ Data Hooks** section with `usePublicFaqs` and `useAllFaqs` entries.
- **TASK-29 (P2):** `docs/GUIDE.md` — added new **Category Hooks** section with `useCategories` and `useCreateCategory` entries, each with usage example.
- **TASK-29 (P2):** `docs/QUICK_REFERENCE.md` — added new **Hooks Quick Lookup** section with seven category tables (Authentication, Session Management, RBAC, User Data, Content Data, Gestures & UX, Uploads & Media) covering all 17 previously undocumented hooks plus existing hooks for completeness.

#### Changed

- **TASK-29 (P2):** `docs/GUIDE.md` — replaced stale `useStorageUpload` section (hook deleted in TASK-20) with `useMediaUpload` documenting the canonical backend-upload hook.
- **TASK-29 (P2):** `docs/QUICK_REFERENCE.md` — expanded hooks line in Key File Locations to enumerate newly documented hooks by name.
- **TASK-29 (P2):** `docs/APPLICATION_GRAPH.md` — marked Mandatory Improvement #18 (undocumented hooks) as ✅ RESOLVED.
- **TASK-29 (P2):** `docs/IMPLEMENTATION_PLAN.md` — marked TASK-29 as ✅ DONE.

#### Summary

All 17 hooks listed in the TASK-29 audit are now fully documented in both GUIDE.md and QUICK_REFERENCE.md. No code changes were needed — this was a documentation-only task.

---

### TASK-18 — Systemic UI_LABELS Migration to useTranslations (2026-02-28)

#### Changed

- **TASK-18-E (P0):** `src/components/promotions/CouponCard.tsx` — removed `UI_LABELS` import; added `useTranslations("promotions")`; moved `getDiscountLabel` helper inside the component to access the hook.
- **TASK-18-E (P0):** `src/components/admin/AdminSessionsManager.tsx` — removed `UI_LABELS` import; added `useTranslations("adminSessions")` and `useTranslations("loading")`; replaced all `UI_LABELS.ADMIN.SESSIONS.*` and `UI_LABELS.LOADING.DEFAULT` usages.
- **TASK-18-E (P0):** `src/components/ErrorBoundary.tsx` — extracted `ErrorFallbackView` functional component to use `useTranslations("errorPages")` and `useTranslations("actions")`; `ErrorBoundary.render()` now delegates to `<ErrorFallbackView />`; removed `UI_LABELS` import.
- **TASK-18-E (P0):** `src/components/admin/RichTextEditor.tsx`, `src/components/checkout/OrderSuccessHero.tsx`, `src/components/checkout/OrderSuccessCard.tsx`, `src/components/checkout/OrderSummaryPanel.tsx`, `src/components/products/AddToCartButton.tsx`, `src/components/search/SearchResultsSection.tsx`, `src/components/search/SearchFiltersRow.tsx` — all migrated from `UI_LABELS` to `useTranslations` (completed this session).
- **messages/en.json, messages/hi.json** — added new keys to `checkout` (`orderTotal`, `taxIncluded`, `shippingFree`), `orderSuccess` (full namespace), `cart` (`itemCount`, `shippingFree`), `search` (`noResultsTitle`, `noResultsSubtitle`, `clearFilters`, `priceRange`, `minPrice`, `maxPrice`, `categoryFilter`, `allCategories`), `promotions` (`copyCode`, `copied`, `validUntil`, `off`, `flatOff`, `freeShipping`, `buyXGetY`, `specialOffer`, `statusActive`), and new namespace `adminSessions` (`confirmRevoke`, `confirmRevokeMessage`, `confirmRevokeAll`, `confirmRevokeAllMessage`).
- **messages/en.json, messages/hi.json** — removed duplicate `sellerAnalytics` and `sellerPayouts` keys (second shorter occurrences were overriding the first full versions).

#### Added

- **TASK-18-E (P0):** `src/components/promotions/__tests__/CouponCard.test.tsx` — NEW — 8 tests covering discount labels, active badge, copy button, and valid-until date.
- **TASK-18-E (P0):** `src/components/products/__tests__/AddToCartButton.test.tsx` — NEW — 4 tests covering default label, auction label, loading label, disabled state.
- **TASK-18-E (P0):** `src/components/search/__tests__/SearchFiltersRow.test.tsx` — NEW — 6 tests covering category filter, price range, clear filters visibility.

#### Summary

TASK-18 is now fully complete. All 35 client components that used `UI_LABELS` in JSX have been migrated to `useTranslations()` (next-intl). Groups A–E all done. Total new/updated tests for this task: 115+.

#### Added

- **TASK-15 (P2):** `src/features/seller/components/SellerDashboardView.tsx` — NEW — feature view component containing all seller dashboard logic (auth guard, product fetch, stats derivation, JSX); moved from fat page to feature module.
- **TASK-15 (P2):** `src/features/seller/components/__tests__/SellerDashboardView.test.tsx` — NEW — 6 tests. All pass.
- **TASK-15 (P2):** `src/features/seller/components/SellerStatCard.tsx` — MOVED from `src/components/seller/SellerStatCard.tsx`; this component was only used on the seller dashboard page.
- **TASK-15 (P2):** `src/features/seller/components/SellerQuickActions.tsx` — MOVED from `src/components/seller/SellerQuickActions.tsx`.
- **TASK-15 (P2):** `src/features/seller/components/SellerRecentListings.tsx` — MOVED from `src/components/seller/SellerRecentListings.tsx`.

#### Changed

- **TASK-15 (P2):** `src/app/[locale]/seller/page.tsx` — reduced from 144-line fat page to a 10-line thin shell that renders `<SellerDashboardView />`.
- **TASK-15 (P2):** `src/features/seller/components/index.ts` — added exports for `SellerDashboardView`, `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings`.
- **TASK-15 (P2):** `src/components/seller/index.ts` — removed exports for `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings` (now in features/seller).
- **TASK-15 (P2):** `src/app/[locale]/seller/__tests__/page.test.tsx` — rewritten for thin-shell assertion (1 test).

---

### Fifteenth Implementation Pass — Seller Product Creation Flow (2026-02-28)

#### Added

- **TASK-28 (P1):** `src/app/api/seller/products/route.ts` — NEW — `GET` (list seller's own products, Sieve-filtered by `sellerId`) + `POST` (create product with `status: 'draft'`, sellerInfo from session).
- **TASK-28 (P1):** `src/features/seller/components/SellerCreateProductView.tsx` — NEW — full-page product creation form using `ProductForm`, `AdminPageHeader`, `useApiMutation(sellerService.createProduct)`, `useTranslations('sellerProducts')`, redirects on success.
- **TASK-28 (P1):** `src/app/[locale]/seller/products/new/page.tsx` — NEW — 5-line thin shell at `ROUTES.SELLER.PRODUCTS_NEW`.
- **TASK-28 (P1):** `src/features/seller/components/__tests__/SellerCreateProductView.test.tsx` — NEW — 6 tests.
- **TASK-28 (P1):** `src/app/api/seller/products/__tests__/route.test.ts` — NEW — 3 tests (GET filters, POST creates, POST 400 validation).
- **TASK-28 (P1):** `src/app/[locale]/seller/products/new/__tests__/page.test.tsx` — NEW — 1 test.

#### Changed

- **TASK-28 (P1):** `src/constants/api-endpoints.ts` — added `SELLER.PRODUCTS: "/api/seller/products"`.
- **TASK-28 (P1):** `src/services/seller.service.ts` — added `sellerService.createProduct(data)` and `sellerService.listMyProducts(params?)`.
- **TASK-28 (P1):** `src/features/seller/components/index.ts` — added `SellerCreateProductView` export.
- **TASK-28 (P1):** `src/constants/rbac.ts` — added `ROUTES.SELLER.DASHBOARD` RBAC entry (prefix match covers all `/seller/*` sub-routes).
- **TASK-28 (P1):** `messages/en.json` + `messages/hi.json` — added `createProductSubtitle`, `createSuccess`, `cancel` keys to `sellerProducts` namespace.

---

### Fourteenth Implementation Pass — CheckoutSuccessView Extraction (2026-02-28)

#### Added

- **TASK-17 (P2):** `src/components/checkout/CheckoutSuccessView.tsx` — NEW — extracted from `checkout/success/page.tsx`; contains `useSearchParams`, `useEffect` redirect guard, `useApiQuery` order fetch, loading/error/fallback/success JSX.
- **TASK-17 (P2):** `src/components/checkout/__tests__/CheckoutSuccessView.test.tsx` — NEW — 6 tests covering: null/redirect when no orderId, spinner, fallback UI on error, orderId shown in fallback, success render, no redirect when orderId present.

#### Changed

- **TASK-17 (P2):** `src/app/[locale]/checkout/success/page.tsx` — reduced from ~100 lines to 9-line thin shell: `<Suspense><CheckoutSuccessView /></Suspense>`.
- **TASK-17 (P2):** `src/components/checkout/index.ts` — added `CheckoutSuccessView` export.
- **TASK-17 (P2):** `src/app/[locale]/checkout/success/__tests__/page.test.tsx` — rewritten as thin-shell test (1 test).

---

### Thirteenth Implementation Pass — Address Pages useApiMutation Migration (2026-02-28)

#### Changed

- **TASK-16 (P2):** `src/app/[locale]/user/addresses/add/page.tsx` — replaced `useState(saving)` + manual `addressService.create()` try/catch + `logger` with `useCreateAddress({ onSuccess, onError })` from `@/hooks`; removed `addressService` and `logger` imports from the page.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/edit/[id]/page.tsx` — replaced `useState(saving/deleting)` + manual `addressService.update/delete()` try/catch with `useUpdateAddress(id, {...})` + `useDeleteAddress({...})`; migrated `useApiQuery({ queryKey: ['address', id] })` to `useAddress(id)` hook.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/add/__tests__/page.test.tsx` — updated mocks to reflect `useCreateAddress` usage; removed `UI_LABELS` dependency.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/edit/[id]/__tests__/page.test.tsx` — updated mocks to reflect `useAddress`, `useUpdateAddress`, `useDeleteAddress` usage; removed `UI_LABELS` dependency.

---

#### Added

- **TASK-14 (P2):** `src/hooks/useProfileStats.ts` — NEW — encapsulates the two `useApiQuery` calls (orders count + addresses count) from the user profile page; returns `{ orderCount, addressCount, isLoading }`.
- **TASK-14 (P2):** `src/hooks/__tests__/useProfileStats.test.ts` — NEW — 5 tests. All pass.

#### Changed

- **TASK-14 (P2):** `src/app/[locale]/user/profile/page.tsx` — replaced inline `useApiQuery` calls and manual stat derivation with `useProfileStats(!!user)`; removed `orderService` + `addressService` direct imports from the page.
- **TASK-14 (P2):** `src/hooks/index.ts` — added `export { useProfileStats } from "./useProfileStats"`.

---

### Tenth Implementation Pass — URL-Driven Sort State + Orders View Extraction (2026-03-01)

#### Added

- **TASK-13 (P2):** `src/features/admin/hooks/useAdminOrders.ts` — NEW — data layer hook wrapping `useApiQuery` + `useApiMutation` for the admin orders list and update operations; follows `useAdminBlog` / `useAdminUsers` pattern.
- **TASK-13 (P2):** `src/features/admin/components/AdminOrdersView.tsx` — NEW — extracted orders CRUD view including `useUrlTable` filter/sort state, `SideDrawer` for order-status editing, `DataTable`, `TablePagination`, and `AdminPageHeader`; last admin page to be extracted.
- **TASK-13 (P2):** `src/features/admin/hooks/__tests__/useAdminOrders.test.ts` — NEW — 5 tests. All pass.
- **TASK-13 (P2):** `src/features/admin/components/__tests__/AdminOrdersView.test.tsx` — NEW — 6 tests. All pass.
- **TASK-19 (P1):** `src/components/faq/__tests__/FAQPageContent.test.tsx` — NEW — 8 tests covering render, FAQ display, sort change via `table.setSort`, `useUrlTable` usage verification. All pass.

#### Changed

- **TASK-13 (P2):** `src/app/[locale]/admin/orders/[[...action]]/page.tsx` — reduced to 12-line thin shell delegating to `<AdminOrdersView action={action} />`; all state, hooks, and JSX moved to `AdminOrdersView`.
- **TASK-13 (P2):** `src/features/admin/hooks/index.ts` — added `export * from "./useAdminOrders"`.
- **TASK-13 (P2):** `src/features/admin/index.ts` — added `export { AdminOrdersView } from "./components/AdminOrdersView"`.
- **TASK-13 (P2):** `messages/en.json` + `messages/hi.json` — added `adminOrders.noOrders` translation key (was hardcoded `"No orders found"`).
- **TASK-19 (P1):** `src/components/faq/FAQPageContent.tsx` — replaced `const [sortOption, setSortOption] = useState<FAQSortOption>("helpful")` with `useUrlTable({ defaults: { sort: "helpful" } })`; sort selection is now URL-driven and bookmarkable. `onSortChange` calls `table.setSort(sort)` instead of `setSortOption`.

---

### Ninth Implementation Pass — UI_LABELS → useTranslations Migration (2026-03-01)

#### Added

- **TASK-24 (P0):** Added `next-intl` `useTranslations` to three admin components that were using `UI_LABELS` in JSX, violating Rule 2.
  - `src/components/admin/users/__tests__/UserDetailDrawer.test.tsx` — NEW — 6 tests covering render, role display, action buttons. All pass.
  - `src/components/admin/blog/__tests__/BlogTableColumns.test.tsx` — NEW — 2 tests covering hook behaviour. All pass.
- **TASK-25 (P0):** Added `formFieldTypes` i18n namespace to `messages/en.json` and `messages/hi.json` (12 form field type labels).
  - `src/features/events/components/__tests__/EventFormDrawer.test.tsx` — NEW — 4 tests covering render, drawer visibility, event type options. All pass.

#### Changed

- **TASK-24 (P0):** `src/components/admin/users/UserDetailDrawer.tsx` — removed `UI_LABELS` import; added `useTranslations("adminUsers")` inside component; all JSX labels now translation-aware.
- **TASK-24 (P0):** `src/components/admin/users/UserFilters.tsx` — removed `UI_LABELS` import; moved `TABS` and `ROLE_OPTIONS` arrays inside component function; added `useTranslations` calls for `adminUsers`, `roles`, `actions`, `form` namespaces.
- **TASK-24 (P0):** `src/components/admin/blog/BlogTableColumns.tsx` — converted `getBlogTableColumns` factory function to `useBlogTableColumns` hook; added `useTranslations("adminBlog")` and `useTranslations("actions")`; removed `UI_LABELS` import.
- **TASK-24 (P0):** `src/features/admin/components/AdminBlogView.tsx` — updated to call `useBlogTableColumns` hook instead of `getBlogTableColumns` factory.
- **TASK-24 (P0):** `src/components/admin/blog/index.ts`, `src/components/admin/index.ts` — renamed export from `getBlogTableColumns` to `useBlogTableColumns`.
- **TASK-24 (P0):** `src/components/admin/users/__tests__/UserFilters.test.tsx` — fully rewritten with `useTranslations` mocks; 8 tests.
- **TASK-25 (P0):** `src/features/events/constants/EVENT_TYPE_OPTIONS.ts` — replaced `UI_LABELS`-dependent `EVENT_TYPE_OPTIONS` with values-only `EVENT_TYPE_VALUES` array + `EventTypeValue` type.
- **TASK-25 (P0):** `src/features/events/constants/EVENT_STATUS_OPTIONS.ts` — replaced `UI_LABELS`-dependent `EVENT_STATUS_OPTIONS` with values-only `EVENT_STATUS_VALUES` array + `EventStatusFilterValue` type.
- **TASK-25 (P0):** `src/features/events/constants/FORM_FIELD_TYPE_OPTIONS.ts` — replaced `UI_LABELS`-dependent `FORM_FIELD_TYPE_OPTIONS` with values-only `FORM_FIELD_TYPE_VALUES` array + `FormFieldTypeValue` type.
- **TASK-25 (P0):** `src/features/events/components/EventFormDrawer.tsx` — import changed to `EVENT_TYPE_VALUES`; added `useTranslations("eventTypes")`; options now rendered as `tEventTypes(value)`.
- **TASK-25 (P0):** `src/features/events/components/SurveyFieldBuilder.tsx` — import changed to `FORM_FIELD_TYPE_VALUES`; added `useTranslations("formFieldTypes")`; options now rendered as `tFieldTypes(value)`.
- **TASK-25 (P0):** `src/features/events/index.ts` — updated barrel exports: `EVENT_TYPE_OPTIONS` → `EVENT_TYPE_VALUES`, `EVENT_STATUS_OPTIONS` → `EVENT_STATUS_VALUES`, `FORM_FIELD_TYPE_OPTIONS` → `FORM_FIELD_TYPE_VALUES`.
- **TASK-25 (P0):** `src/features/events/components/__tests__/SurveyFieldBuilder.test.tsx` — updated mock to `FORM_FIELD_TYPE_VALUES`; added `next-intl` mock.
- **TASK-25 (P0):** `src/app/[locale]/admin/events/__tests__/page.test.tsx` — updated mock to use `EVENT_TYPE_VALUES` and `EVENT_STATUS_VALUES`.
- `messages/en.json`, `messages/hi.json` — added `views`, `author`, `publishedOn` keys to `adminBlog` namespace (TASK-24); added `formFieldTypes` namespace (TASK-25).

---

### Eighth Implementation Pass — Page Thickness Cleanup: Auth Views (2026-02-28)

#### Added

- **TASK-11 (P2):** Created `src/features/auth/components/ForgotPasswordView.tsx` — all form logic, state, and API calls extracted from `forgot-password/page.tsx`. Page reduced to 5-line thin shell. Added to feature barrel.
  - `src/features/auth/components/__tests__/ForgotPasswordView.test.tsx` — 17 tests covering render, input, loading, error, success, navigation. All pass.
- **TASK-12 (P2):** Created `src/features/auth/components/VerifyEmailView.tsx` — `VerifyEmailContent` (token handling, `useEffect`, `useVerifyEmail` callback, loading/success/error states) + Suspense wrapper. Page reduced to 5-line thin shell. Added to feature barrel.
  - `src/features/auth/components/__tests__/VerifyEmailView.test.tsx` — 8 tests covering loading state, token-on-mount call, no-token error, success navigation, API error display, home-navigation. All pass.

#### Changed

- **TASK-11 (P2):** `src/app/[locale]/auth/forgot-password/page.tsx` — reduced from 170-line fat page to 5-line thin shell delegating to `ForgotPasswordView`.
- **TASK-12 (P2):** `src/app/[locale]/auth/verify-email/page.tsx` — reduced from 168-line fat page to 5-line thin shell delegating to `VerifyEmailView`.
- `src/features/auth/components/index.ts` — added `ForgotPasswordView` and `VerifyEmailView` exports.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-11 and TASK-12 as ✅ DONE.

---

### Seventh Implementation Pass — Rule 11 Upload Violations + Rule 2 String Cleanup (2026-02-28)

#### Removed

- **TASK-20 (P0):** Deleted `src/hooks/useStorageUpload.ts` and `src/hooks/__tests__/useStorageUpload.test.ts` — hook imported Firebase Storage client SDK (`ref`, `uploadBytes`, `getDownloadURL`, `deleteObject` from `firebase/storage`) in violation of Rule 11.
  - Removed `useStorageUpload` and `UploadOptions`/`UploadState` exports from `src/hooks/index.ts`.
  - Removed `useStorageUpload` section from `src/hooks/README.md`.
- **TASK-27 (P0):** Deleted Tier-2 `src/features/events/services/event.service.ts` — Rule 21 mandates one service per domain; Tier-1 `src/services/event.service.ts` is the single source of truth.

#### Changed

- **TASK-20 (P0):** Migrated `src/components/AvatarUpload.tsx` from `useStorageUpload` to `useMediaUpload`.
  - Now stages file locally → on save builds `FormData { file, metadata }` → POST `/api/media/upload` (Firebase Admin SDK).
  - Progress bar simplified (boolean `isLoading` replaces progress %-state).
  - Error display sourced from `uploadApiError` returned by `useMediaUpload`.
  - Alert `onClose` now calls `resetUpload()` to clear API error state.
  - `AvatarUpload.test.tsx` fully rewritten: 17 tests, mocking `useMediaUpload`. All pass.
- **TASK-27 (P0):** Fixed 3 test files broken by Tier-2 service deletion:
  - `FeedbackEventSection.test.tsx` + `PollVotingSection.test.tsx`: updated `jest.mock` path from `../../services/event.service` → `@/services`.
  - `events/[id]/participate/__tests__/page.test.tsx`: added `EventParticipateView` to `@/features/events` mock; updated tests to match thin-shell page.

#### Fixed

- **TASK-23 (P1):** Removed unused `UI_LABELS` import and dead `const LABELS = UI_LABELS.ADMIN.PRODUCTS` from `src/components/admin/products/ProductForm.tsx`. Component correctly uses `useTranslations` for all JSX text (Rule 2).
  - ProductForm tests: 8/8 pass.
- **TASK-04 (P1):** `BlogForm` Checkbox integration — already implemented; marked done in plan.
- **TASK-05 (P1):** `ProductForm` Checkbox integration — already implemented; marked done in plan.

---

### Milestone: Sixth Implementation Pass — Firebase Infrastructure + P0 Rule Fixes (2026-02-28)

#### Fixed

- **TASK-30 (P0):** Fixed critical `blogPosts` Firestore index collection name mismatch.
  - Removed 2 stale `collectionGroup: "posts"` index entries (pointed at non-existent collection).
  - Added 5 correct `blogPosts` composite indexes: `status+publishedAt`, `status+createdAt`, `status+category+publishedAt`, `status+featured+publishedAt`, `authorId+createdAt`.
  - Added 3 `notifications` composite indexes: `userId+createdAt`, `userId+isRead+createdAt`, `userId+type+createdAt`.
  - **Impact:** Eliminates full-collection scans on all blog listing queries (`/api/blog`, `/api/admin/blog`, homepage blog section).

- **TASK-31 (P0):** Added all missing high-traffic Firestore composite indexes.
  - `products`: `status+category+createdAt`, `status+availableQuantity+createdAt`.
  - `orders`: `userId+productId` (used by `orderRepository.hasUserPurchased()` for review eligibility).
  - `bids`: `productId+status+bidAmount DESC` (used by `bidRepository.getActiveBidsRanked()` for auction leaderboard).
  - `sessions`: 4-field `userId+isActive+expiresAt DESC+lastActivity DESC` (required when inequality filter + multiple orderBy fields are combined).

- **TASK-32 (P1):** Added 15 missing medium-traffic Firestore composite indexes.
  - `carouselSlides` (2): `active+createdAt`, `createdBy+createdAt`.
  - `homepageSections` (1): `type+enabled+order`.
  - `categories` (5): `tier+isActive+order`, `rootId+tier+order`, `parentIds(ARRAY_CONTAINS)+order`, `isFeatured+isActive+featuredPriority`, `isLeaf+isActive+order`.
  - `faqs` (4): `showInFooter+isActive+order`, `isPinned+isActive+order`, `showOnHomepage+isActive+priority`, `tags(ARRAY_CONTAINS)+isActive`.
  - `events` (1): `status+type+endsAt` (3-field combined filter).
  - `eventEntries` (2): `eventId+userId` (duplicate entry check), `eventId+reviewStatus+points DESC` (filtered leaderboard).

- **TASK-33 (P0):** Added missing token + newsletter Firestore indexes.
  - `emailVerificationTokens`: `userId+used` (find unused tokens per user — on the critical path for email verification).
  - `passwordResetTokens`: `email+used` (find unused reset tokens — on the critical path for password reset).
  - `newsletterSubscribers`: `status+createdAt` (admin subscriber listing).

- **TASK-34 (P0):** Added `/auction-bids` path to `database.rules.json`.
  - Any authenticated user may subscribe to live bid data at `/auction-bids/$productId` (matches actual `useRealtimeBids` subscription path — confirmed it is `/auction-bids/${productId}`, NOT `/auctions`).
  - Validates `currentBid`, `bidCount`, `updatedAt`, and `lastBid` structure. All writes remain Admin SDK only.
  - **Impact:** Unblocks `useRealtimeBids` live bid subscriptions on auction detail pages (previously blocked by root `.read: false`).

- **TASK-35 (P0):** Added `/order_tracking` path to `database.rules.json`.
  - Only the order owner may subscribe — enforces `auth.token.orderId == $orderId`.
  - Validates `status` + `timestamp` on each event node. All writes Admin SDK only.
  - Proactively in place for the `OrderTrackingView` feature. The `/api/realtime/token` endpoint (which must embed `orderId` claims) is deferred until the endpoint is built.

- **TASK-01 (P0) — already implemented:** `src/app/[locale]/categories/page.tsx` confirmed already uses `categoryService.list()` — no raw `fetch()` present. Marked as resolved.
- **TASK-21 (P0) — already implemented:** `src/hooks/useAuth.ts` confirmed already uses `signInWithEmail` from `@/lib/firebase/auth-helpers` — no direct `firebase/auth` or `@/lib/firebase/config` import present. Marked as resolved.
- **TASK-22 (P0) — already implemented:** `src/contexts/SessionContext.tsx` confirmed already uses `onAuthStateChanged` from `@/lib/firebase/auth-helpers` and only `import type` from `firebase/auth` (type-only, no runtime dependency). Marked as resolved.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-01, TASK-21, TASK-22, TASK-30, TASK-31, TASK-32, TASK-33, TASK-34, TASK-35 as ✅ DONE; added contextual note to TASK-34 clarifying actual RTDB path is `/auction-bids` not `/auctions`.
- `docs/APPLICATION_GRAPH.md`:
  - `/categories` page entry updated from 🔴⚠️ to 🟡 with violation note removed.
  - Realtime DB rules section C updated from ⚠️ to ✅, table updated with 2 new paths.
  - Firestore indexes section D updated from ❌ to ✅ with resolved summary.
  - Mandatory Improvements item #1 (categories raw fetch) struck through as resolved.

---

### Milestone: Seventh Implementation Pass — EventParticipate Form Refactor (2026-02-28)

#### Added

- `src/features/events/components/EventParticipateView.tsx` — New feature-view component extracted from the old 185-line page. Uses `FormField` + `Input` + `Button` from `@/components`; uses `useTranslations('events')` and `useTranslations('loading')` for all rendered text. Handles all survey field types: textarea, select/radio, rating (number), date, text.
- `src/features/events/components/__tests__/EventParticipateView.test.tsx` — 8 test cases covering: spinner, auth redirect, no-survey-event warning, entries-closed alert, field rendering, submit, validation error.
- `messages/en.json` + `messages/hi.json` — Added 4 missing translation keys under `events`: `entriesClosed`, `selectOption`, `fillInRequired`, `notSurveyEvent`.

#### Changed

- `src/app/[locale]/events/[id]/participate/page.tsx` — Reduced from 185 lines to 11-line thin shell delegating to `EventParticipateView`. Removes all raw HTML form elements, `UI_LABELS` usage, inline hooks/state, and business logic from the page layer.
- `src/features/events/index.ts` — Added `EventParticipateView` export.

#### Fixed (Rule violations)

- **TASK-02** (Rule 8): Replaced raw `<textarea>`, `<select>`, `<input>`, `<button>` in participate page with `FormField`, `Input`, `Button` from `@/components`.
- **TASK-03** (Rule 3): Replaced `UI_LABELS.EVENTS.*` and hardcoded strings in JSX with `useTranslations()` calls.
- **TASK-26** (Rule 10): Page reduced from 185 lines to 11 lines; logic extracted to `EventParticipateView` feature component.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-02, TASK-03, TASK-26 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - `/events/[id]/participate` entry changed from 🔴⚠️ to 🟢; violation notes removed; table updated with `EventParticipateView`.
  - Feature module tree: removed `⚠️ MISSING: EventParticipateView`; added it as present.
  - Mandatory Improvements #2, #3, #15 struck through as ✅ RESOLVED.
  - Page-thickness table row for `events/[id]/participate/page.tsx` updated to resolved.

---

### Milestone: Eighth Implementation Pass — Admin Form Media Components (2026-02-28)

#### Changed

- `src/components/admin/blog/BlogForm.tsx` — TASK-06: `content` field replaced with `RichTextEditor` (edit mode) + `dangerouslySetInnerHTML` div (readonly). TASK-07: `coverImage` field replaced with `ImageUpload` (hidden in readonly; readonly mode shows URL text label). Added `typography`, `themed` to THEME_CONSTANTS destructure.
- `src/components/admin/products/ProductForm.tsx` — TASK-08: `mainImage` field replaced with `ImageUpload` (hidden in readonly) + readonly `FormField` fallback. Added missing `import { useTranslations } from "next-intl"` (was called but not imported — pre-existing bug surfaced by cache invalidation).

#### Fixed (Rule violations)

- **TASK-06** (Rule 8): BlogForm `content` uses `RichTextEditor` instead of plain `FormField type="textarea"`.
- **TASK-07** (Rule 8): BlogForm `coverImage` uses `ImageUpload` instead of plain URL text input.
- **TASK-08** (Rule 8): ProductForm `mainImage` uses `ImageUpload` instead of plain URL text input.

#### Tests

- `src/components/admin/blog/__tests__/BlogForm.test.tsx` — Updated to 9 tests, all passing. Added `RichTextEditor` and `ImageUpload` mocks; new cases for RichTextEditor render/onChange, ImageUpload render, ImageUpload hidden in readonly, readonly shows no editor.
- `src/components/admin/products/__tests__/ProductForm.test.tsx` — Updated to 8 tests, all passing. Added `ImageUpload` mock; new cases for ImageUpload in edit mode, ImageUpload hidden in readonly.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-06, TASK-07, TASK-08 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - Mandatory Improvements #4 (`BlogForm` RichTextEditor + ImageUpload) struck through as ✅ RESOLVED (TASK-06/07).
  - Mandatory Improvements #5 (`BlogForm`/`ProductForm` raw checkbox) struck through as ✅ RESOLVED (TASK-04/05).
  - Mandatory Improvements #6 (fragmented image upload): rows for `ProductForm` and `BlogForm` updated to reflect migration to `ImageUpload`; remaining work (TASK-09 docs, TASK-20 `useStorageUpload` removal) called out.

---

### Milestone: Tenth Implementation Pass — MediaUploadField Component (2026-02-28)

#### Added

- `src/components/admin/MediaUploadField.tsx` — New embeddable file upload field for forms. Supports any MIME type (`accept` prop). Renders type-appropriate previews: video player for video URLs, image thumbnail for image URLs, filename link for other files. Uses `useMediaUpload` → `/api/media/upload` (Firebase Admin SDK). Props: `label` (required), `value`, `onChange`, `accept?`, `maxSizeMB?`, `folder?`, `disabled?`, `helperText?`.
- `src/components/admin/__tests__/MediaUploadField.test.tsx` — 9 tests, all passing. Covers: empty state, file-present state, file picker trigger, successful upload, loading spinner, error alert, disabled state, remove button, helper text.

#### Changed

- `src/components/admin/index.ts` — Added `MediaUploadField` export.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-10 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`: Added `MediaUploadField` row to Unused Existing Primitives table.
- `docs/GUIDE.md`: Added `MediaUploadField` entry to Upload Components section.

---

### Milestone: Ninth Implementation Pass — Canonical Upload Path Documentation (2026-02-28)

#### Changed

- `src/components/admin/ImageUpload.tsx` — Added JSDoc comment block declaring it as the **canonical content image upload component** for all form image fields (products, blog, categories, carousel). Documents upload path (`useMediaUpload` → `/api/media/upload`) and defers profile avatars to `AvatarUpload`.
- `src/components/AvatarUpload.tsx` — Added JSDoc comment block declaring it as **profile-avatar-only** specialist. Documents current `useStorageUpload` path with ⚠️ TASK-20 note for mandatory migration to `/api/media/upload`.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-09 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - Mandatory Improvements #6 (fragmented upload) updated to reflect TASK-09 resolved.
  - Unused Existing Primitives table: added `ImageUpload` and `AvatarUpload` rows with scope descriptions.
- `docs/GUIDE.md`: Upload Components section expanded — added `ImageUpload` entry with full props + upload path documentation; updated `AvatarUpload` entry with ⚠️ TASK-20 migration note.

---

### Milestone: Fifth Audit Pass — Firebase Infrastructure Deep Scan (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — New **Firebase Infrastructure** section (under Data Layer) covering all four Firebase services:
  - **Section A — Firestore Security Rules** (`firestore.rules`): Confirmed correct and complete. Backend-only deny-all rule verified; no gaps.
  - **Section B — Firebase Storage Rules** (`storage.rules`): Confirmed correct. Public read / no client writes matches backend-only upload architecture. Advisory note added for future private file paths.
  - **Section C — Firebase Realtime Database Rules** (`database.rules.json`): Two missing paths identified — `/auctions/$productId` (blocks `useRealtimeBids` live bid subscriptions; **critical**) and `/order_tracking/$orderId` (blocks `OrderTrackingView` real-time status events; medium severity). Recommended rule additions documented with full JSON and token claim instructions.
  - **Section D — Firestore Composite Indexes** (`firestore.indexes.json`): Full index cross-reference against every repository query. Documents 1 critical collection name mismatch (`posts` collection group should be `blogPosts`) and 27 missing or incorrect index entries across 12 collections. Includes coverage table (per collection: defined / missing / status), complete numbered list of 27 index entries, and deployment notes.

- `docs/IMPLEMENTATION_PLAN.md` — New **P0-Firebase** section added between P0 and P1. Six new tasks TASK-30 → TASK-35:
  - **TASK-30 (P0 · S)**: Fix critical `blogPosts` collection name mismatch — remove 2 dead `posts` indexes, add 5 correct `blogPosts` indexes, add 3 `notifications` indexes. Closes full-collection-scan defect on all blog listing queries.
  - **TASK-31 (P0 · S)**: Add 5 missing high-traffic indexes — `products` (status+category+createdAt, status+availableQuantity+createdAt), `orders` (userId+productId for review eligibility), `bids` (productId+status+bidAmount for auction leaderboard), `sessions` 4-field (userId+isActive+expiresAt+lastActivity).
  - **TASK-32 (P1 · S)**: Add 15 missing medium-traffic indexes — `carouselSlides` (2), `homepageSections` (1), `categories` (5 including 2 array-contains), `faqs` (4 including 1 array-contains), `events` (1 combined), `eventEntries` (2).
  - **TASK-33 (P0 · XS)**: Add 3 missing token/newsletter indexes — `emailVerificationTokens` (userId+used), `passwordResetTokens` (email+used), `newsletterSubscribers` (status+createdAt).
  - **TASK-34 (P0 · M)**: Add `/auctions/$productId` Realtime DB rule (any authenticated user may subscribe; Admin SDK writes only) + extend `/api/realtime/token` to embed `orderId` claim.
  - **TASK-35 (P0 · S)**: Add `/order_tracking/$orderId` Realtime DB rule (user must have matching `orderId` claim in custom token) + update realtime token endpoint to accept orderId parameter.
  - Header audit note, TOC, Dependency Map, and summary table updated for TASK-30 → TASK-35.

---

### Milestone: Fourth Audit Pass — Data Layer, Component & Hook Coverage (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — Fourth comprehensive audit pass:
  - **Data Layer**: Added 9 missing repositories (`addressRepository`, `blogRepository`, `cartRepository`, `eventRepository`, `eventEntryRepository`, `newsletterRepository`, `notificationRepository`, `payoutRepository`, `wishlistRepository`) and 7 missing DB schema entries (`ADDRESS_FIELDS`, `BLOG_POST_FIELDS`, `CART_FIELDS`, `EVENT_FIELDS`, `NEWSLETTER_FIELDS`, `NOTIFICATION_FIELDS`, `PAYOUT_FIELDS`) to the reference tables.
  - **Tier 1 Components**: Added 11 undocumented UI primitives (`Avatar`, `Divider`, `Dropdown`, `ImageGallery`, `Menu`, `Skeleton`, `Form`, `BackgroundRenderer`, `Typography`, `MonitoringProvider`) with file paths. Added new **Seller Components** subsection documenting `SellerStorefrontView`, `SellerStatCard`, `SellerTabs`, and 8 dashboard sub-components that were entirely undocumented. Added 2 undocumented product components (`ProductFilters`, `ProductSortBar`).
  - **Feature Modules**: Added `⚠️ MISSING` markers for `AdminOrdersView` + `useAdminOrders` (admin), `ForgotPasswordView` + `VerifyEmailView` (auth), `EventParticipateView` (events), and `SellerCreateProductView` + `/seller/products/add` page (seller — functional gap, no product creation flow exists).
  - **Hooks Reference**: Documented 17 previously undocumented hooks — Auth (`useGoogleLogin`, `useAppleLogin`, `useAdminSessions`, `useUserSessions`, `useRevokeSession`, `useRevokeMySession`, `useRevokeUserSessions`), RBAC (`useIsOwner`, `useIsModerator`, `useRoleChecks`), Data Fetch (`useAddress`, `useCreateAddress`, `useUpdateAddress`, `useAllFaqs`, `useCategories`, `useCreateCategory`), Gestures (`useGesture`). Marked `useStorageUpload` as **BANNED (Rule 11)** in the hooks table.
  - **API Routes**: Added `POST /api/reviews/[id]/vote` (review voting) and `GET/PATCH /api/homepage-sections/[id]` (individual section management).
  - **Services**: Added tier-conflict warning paragraph documenting `event.service.ts` dual presence (Tier 1 `src/services/` AND Tier 2 `src/features/events/services/` — Rule 21 violation).
  - **Mandatory Improvements**: Added items 16–18 — `event.service.ts` Rule 21 conflict (→ TASK-27), seller product creation functional gap (→ TASK-28), 17 undocumented hooks (→ TASK-29).

- `docs/IMPLEMENTATION_PLAN.md` — 3 new tasks added (TASK-27 → TASK-29); header audit note and Dependency Map / summary table updated:
  - **TASK-27 (P0 · S)**: Consolidate `event.service.ts` — remove Tier-2 duplicate (`src/features/events/services/event.service.ts`), keep Tier-1 copy (`src/services/event.service.ts`), update all consuming imports. Closes Rule 21 dual-presence violation.
  - **TASK-28 (P1 · M)**: Add `/seller/products/add` page + `SellerCreateProductView` + `POST /api/seller/products`. Closes the functional gap where sellers cannot create product listings. Includes RBAC guard, new constant, new `sellerService.createProduct()` method, and full test coverage.
  - **TASK-29 (P2 · XS — docs only)**: Document all 17 undocumented hooks in `GUIDE.md` and `QUICK_REFERENCE.md`. No code changes required.

---

### Added

- `docs/APPLICATION_GRAPH.md` — comprehensive dependency map covering all 68 pages, feature modules, shared components, hooks, services, API routes, constants, and data layer. Includes a **Mandatory Improvements** section flagging rule violations and refactoring candidates.
- `docs/IMPLEMENTATION_PLAN.md` — 19 ordered implementation tasks (P0/P1/P2) derived from APPLICATION_GRAPH gaps. Added TASK-18 (systemic `UI_LABELS`-in-JSX Rule 2 violation across ~35 client components, batched into 5 groups) and TASK-19 (`FAQPageContent` sort state must use `useUrlTable`).
- `.github/copilot-instructions.md` — added RULE 25 (Exhaustive Component Reuse — mandatory lookup table before writing any markup or HTML element) and RULE 26 (Page Thickness Limit — 150-line max for `page.tsx`, decomposition pattern, enforced size targets). Updated Pre-Code Checklist with 5 new items for Rules 25 and 26.

---

### Milestone: Third Audit Pass — Rule 11 & Rule 2 Deep Scan (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — Mandatory Improvements section extended with 7 new violation entries (items 10–15):
  - **Item 10**: `useStorageUpload.ts` + `AvatarUpload.tsx` — Firebase Storage client SDK in frontend hook (Rule 11 Critical). `useStorageUpload` must be deleted; `AvatarUpload` migrated to `useMediaUpload` + `/api/media/upload`.
  - **Item 11**: `useAuth.ts` — imports `signInWithEmailAndPassword` + `auth` from Firebase client SDK (Rule 11 Critical). Must delegate to wrapper in `auth-helpers.ts`.
  - **Item 12**: `SessionContext.tsx` — imports `onAuthStateChanged` + `auth` from Firebase client SDK (Rule 11 Critical). Must use `subscribeToAuthState()` wrapper from `auth-helpers.ts`.
  - **Item 13**: Admin client components (`BlogForm`, `ProductForm`, `BlogTableColumns`, `UserDetailDrawer`, `UserFilters`) — `UI_LABELS` in JSX (Rule 2 violations not covered by existing TASK-18 groups).
  - **Item 14**: `features/events/constants/` option arrays — `UI_LABELS` labels that land in JSX `<select>` options (Rule 2).
  - **Item 15**: `events/[id]/participate/page.tsx` — 185 lines, breaches 150-line Rule 10 limit.
- "Unused Existing Primitives" table — corrected the "File upload" entry: removed `useStorageUpload` reference; replaced with explicit note that only `useMediaUpload` is valid and `useStorageUpload` is banned.
- Refactoring Opportunities table — added `events/[id]/participate/page.tsx` row (185 lines → extract to `EventParticipateView`).

- `docs/IMPLEMENTATION_PLAN.md` — 7 new tasks added (TASK-20 → TASK-26):
  - **TASK-20 (P0 · M)**: Delete `useStorageUpload.ts` + migrate `AvatarUpload.tsx` to `useMediaUpload` + `/api/media/upload` backend flow. Removes last Firebase Storage client SDK usage from frontend.
  - **TASK-21 (P0 · S)**: Add `signInWithEmail()` wrapper to `auth-helpers.ts`; remove `firebase/auth` + `@/lib/firebase/config` direct imports from `useAuth.ts`.
  - **TASK-22 (P0 · S)**: Add `subscribeToAuthState()` wrapper to `auth-helpers.ts`; remove `firebase/auth` + `@/lib/firebase/config` direct imports from `SessionContext.tsx`.
  - **TASK-23 (P0 · S)**: Migrate `BlogForm.tsx` and `ProductForm.tsx` from `UI_LABELS` to `useTranslations` (Rule 2). Recommends combining with TASK-04/05/06/07/08 in same PRs.
  - **TASK-24 (P0 · S)**: Migrate `UserDetailDrawer.tsx`, `UserFilters.tsx`, `BlogTableColumns.tsx` from `UI_LABELS` to `useTranslations` (Rule 2).
  - **TASK-25 (P0 · S)**: Replace `UI_LABELS` labels in `features/events/constants/` option arrays with value-only arrays; consuming components build translated options via `useTranslations`.
  - **TASK-26 (P2 · S)**: Extract `EventParticipateView` from the 185-line participation page to `src/features/events/components/`; depends on TASK-02 + TASK-03 completing first.
- Dependency Map updated: TASK-20 added as prerequisite for TASK-09; TASK-21 + TASK-22 grouped (share `auth-helpers.ts` edit); TASK-23 grouped with TASK-04/05/06/07/08; TASK-26 declared dependent on TASK-02 + TASK-03.

---

### Milestone: i18n Rule 2 Final Audit (2026-02-28)

_Phases 64–67_

#### Changed

- `src/constants/navigation.tsx` — removed `label` from `NavItem` interface; deleted `SIDEBAR_NAV_GROUPS`, `ADMIN_TAB_ITEMS`, `USER_TAB_ITEMS`, `SELLER_TAB_ITEMS` (replaced by inline `useTranslations` in each component).
- `src/constants/index.ts` — removed now-deleted constant exports.
- `src/components/layout/MainNavbar.tsx` — nav labels now resolved via `useTranslations("nav")`.
- `src/components/layout/Sidebar.tsx` — fixed 4 hardcoded `aria-label` attributes to use `useTranslations("accessibility")`.
- `src/components/admin/AdminTabs.tsx` — replaced `ADMIN_TAB_ITEMS` import with inline 15-tab array using `useTranslations("nav")`.
- `src/components/user/UserTabs.tsx` — replaced `USER_TAB_ITEMS` with inline 5-tab array.
- `src/components/seller/SellerTabs.tsx` — replaced `SELLER_TAB_ITEMS` with inline 4-tab array.
- `src/components/contact/ContactInfoSidebar.tsx` — moved `INFO_ITEMS` construction into component body; replaced `UI_LABELS` strings with `useTranslations("contact")`.
- `src/components/user/WishlistButton.tsx` — replaced `UI_LABELS` with `useTranslations("wishlist")` for `aria-label`/`title`.
- `messages/en.json` + `messages/hi.json` — 12 new keys across `nav`, `contact`, `wishlist`, `accessibility` namespaces.

#### Fixed

- `src/hooks/__tests__/useAddressSelector.test.ts` — updated stale field names (`line1`, `pincode` → `addressLine1`, `postalCode`); added required `label` field.

---

### Milestone: Test Coverage — Admin + Feature Hooks (2026-02-27)

_Phases 60–63_

#### Added

- **47 new tests** across 13 admin hook test files (`useAdminAnalytics`, `useAdminBids`, `useAdminBlog`, `useAdminCarousel`, `useAdminCategories`, `useAdminCoupons`, `useAdminFaqs`, `useAdminNewsletter`, `useAdminPayouts`, `useAdminProducts`, `useAdminReviews`, `useAdminSections`, `useAdminUsers`).
- **33 new tests** for shared Tier-1 hooks (`useBlogPosts`, `usePromotions`, `useContactSubmit`, `useCheckout`, `useCouponValidate`, `useMediaUpload`).
- Feature hook tests: `useProducts`, `useAuctions`, `useCategoryProducts`, `useUserOrders`, `useOrderDetail`, `useSellerOrders`, `useSearch`, `usePollVote`, `useFeedbackSubmit`.
- Shared hook tests: `useLogout`, `useFaqVote`, `useAuctionDetail`, `usePlaceBid`, `useAddressSelector`, `useCategorySelector`, `usePublicFaqs`.

#### Fixed

- `src/helpers/auth/__tests__/token.helper.test.ts` — eliminated race condition in `isTokenExpired` boundary test.

---

### Milestone: Rule 20 Compliance — Service → Hook Layer (2026-02-27)

_Phases 46, 58–59_

#### Added

- `src/features/admin/hooks/` — 13 admin view hooks consuming service functions via `useApiQuery`/`useApiMutation`.
- Shared Tier-1 hooks: `useLogout`, `useFaqVote`, `useAuctionDetail`, `usePlaceBid`, `useAddressSelector`, `useContactSubmit`, `useCheckout`, `useCouponValidate`, `useMediaUpload`.
- `useCategories`, `useCreateCategory`, `useAllFaqs`, `usePublicFaqs` added to `src/hooks/`.

#### Changed

- All 13 admin feature view components (`AdminAnalyticsView`, `AdminBidsView`, `AdminUsersView`, etc.) — removed direct `apiClient`/`useApiQuery` calls; use named admin hooks.
- `src/components/contact/ContactForm.tsx`, `cart/PromoCodeInput.tsx`, `admin/ImageUpload.tsx`, `checkout/CheckoutView.tsx`, `faq/FAQPageContent.tsx`, `faq/FAQHelpfulButtons.tsx`, `auctions/AuctionDetailView.tsx`, `auctions/PlaceBidForm.tsx`, `layout/Sidebar.tsx`, `ui/CategorySelectorCreate.tsx`, `ui/AddressSelectorCreate.tsx` — all migrated to named hooks.

#### Result

`src/components/**` — **zero Rule 20 violations** (no `@/services` imports in any `"use client"` file).

---

### Milestone: Service Layer Architecture (2026-02-26)

_Phase 37, Sub-phases 37.2–37.14_

#### Added

- `src/services/` — full service layer: `productService`, `cartService`, `authService`, `userService`, `orderService`, `reviewService`, `bidService`, `couponService`, `faqService`, `categoryService`, `carouselService`, `homepageSectionService`, `mediaService`, `contactService`, `checkoutService`, `newsletterService`, `analyticsService`, `adminService`, `addressService`, `payoutService`, `searchService`, `blogService`, `eventService`.
- All services export named service objects; barrel-exported from `src/services/index.ts`.

#### Changed

- All API calls in hooks, pages, and feature components migrated to use service function layer.
- Oversized pages decomposed into thin page + feature components (7 batches, ~40 page files).

---

### Milestone: i18n Wiring — next-intl (2026-02-24 → 2026-02-28)

_Phases 25a–36_

#### Added

- `src/i18n/` — i18n infrastructure with `next-intl`; `[locale]` route wrapper.
- `messages/en.json` + `messages/hi.json` — complete translation files for all namespaces.
- Zod error map localization; `LocaleSwitcher` UI component.

#### Changed

- All app pages and components migrated from `UI_LABELS` to `useTranslations()` across:
  - Auth pages (login, register, forgot-password, reset-password, verify-email)
  - Public pages (homepage, products, categories, auctions, search, blog, contact, FAQ)
  - User portal (dashboard, profile, orders, addresses, wishlist, sessions)
  - Seller portal (dashboard, products, orders, payouts)
  - Admin section (15 admin pages)
  - Layout & navigation (header, footer, sidebar, bottom nav, breadcrumbs)

---

### Milestone: Events System (2026-02-24)

_Phase 22_

#### Added

- `src/features/events/` — event management module: `EventCard`, `EventGrid`, `EventDetailView`, `PollVoteForm`, `FeedbackForm`, `EventLeaderboard`.
- `src/app/api/events/` — CRUD API routes for events, polls, feedback, leaderboard.
- `src/repositories/` — `EventRepository` with Sieve list support.
- `src/services/eventService` — Tier-2 feature service.
- `src/hooks/useAuctionDetail`, `usePlaceBid` — auction real-time bid hooks with 60s refetch interval.

---

### Milestone: API & Backend Hardening (2026-01 → 2026-02)

_Phases 7.1–7.10_

#### Added

- Sieve query DSL on all list endpoints (`filters`, `sorts`, `page`, `pageSize`) — Firestore-native; replaces in-memory `findAll()` filtering.
- SEO: slug generation for products and FAQs (`slugify` util, Firestore slug index).
- Purchase-verification gate for reviews — order ownership check before review creation.
- Seller email-verification gate — sellers must have verified email before product listing.
- Status-transition validation for products (draft → pending → published flow).
- Audit log for admin site-settings changes (writes to `auditLogs` Firestore collection).
- Admin email notification on new product submitted (Resend integration).
- Bundle analyzer, dynamic imports, and image optimization pass.
- `unitOfWork` — transactional multi-collection write helper using Firestore transactions and batch writes.

#### Changed

- All admin list API routes migrated to `sieveQuery()` in repositories (billing-efficient).
- Performance: lazy-loaded feature pages, `next/image` everywhere, Lighthouse score improvements.

---

### Milestone: Build Chain, ESLint & Next.js 16 (2026-02-21 → 2026-02-25)

_Phases 17–18.19, 23–24_

#### Added

- `THEME_CONSTANTS` (`src/constants/theme.ts`) — centralizes all repeated Tailwind class strings. Full replacement across 100+ components.
- Test suite bootstrap (Phase 18.1–18.19): 245 suites → 392 suites, all green.

#### Changed

- Next.js 16 async `params` / `searchParams` compatibility across all dynamic routes.
- Next.js upgraded to 16.1.6; Turbopack compatibility for Node.js modules (`crypto`, `bcryptjs`, `firebase-admin`).
- ESLint baseline established; zero lint errors.
- Styling constants cleanup — removed raw Tailwind strings from 100+ files.

#### Fixed

- Technical-debt cleanup: removed `TECH_DEBT` comments, dead imports, duplicate validation logic.
- 4 previously-failing test suites fixed across helpers and hooks.

---

### Milestone: Core Feature Build — Components, Pages & Infrastructure (2026-02-21 → 2026-02-24)

_Phases 1–16_

#### Added

- Three-tier pluggable architecture (Tier 1 shared primitives, Tier 2 feature modules, Tier 3 page layer).
- 40+ shared UI primitives: `Button`, `Card`, `Badge`, `Input`, `FormField`, `DataTable`, `SideDrawer`, `Modal`, `ConfirmDeleteModal`, `Tabs`, `Accordion`, `Tooltip`, `Pagination`, `StatusBadge`, `RoleBadge`, `EmptyState`, `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips`, `SortDropdown`, `TablePagination`, `ResponsiveView`, etc.
- Admin components: `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`, `AdminTabs`.
- User components: `AddressForm`, `AddressCard`, `ProfileHeader`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `PasswordChangeForm`.
- All admin, seller, user, public pages scaffolded with props-driven feature components.
- `useUrlTable` hook — URL-driven filter/sort/pagination state (all params in URL query string).
- `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips` — reusable faceted filter system.
- SEO: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, per-page metadata.
- PWA service worker (`public/sw.js`, `src/sw.ts`).
- Footer, `MainNavbar`, `Sidebar`, `BottomNavbar` — fully wired with RBAC-aware links.
- FAQ page with paginated accordion + helpfulness voting.
- Homepage dynamic sections + `HomepageSectionsRenderer`.
- Newsletter admin management (subscribe, toggle, export, delete).
- Non-tech-friendly UX: `useLongPress`, `useSwipe`, `usePullToRefresh`, `useBreakpoint` hooks.
- Gesture & accessibility improvements: keyboard navigation, screen-reader labels, WCAG 2.1 AA focus rings.
- Code deduplication: shared `DataTable`, `SideDrawer`, `AdminFilterBar` adopted across all 15 admin pages.
- RBAC: `RBAC_CONFIG`, `ProtectedRoute`, `useHasRole`, `useIsAdmin`, `useIsSeller`, `useRBAC`.

> **Version history (v1.0.0 – v1.2.0, January–February 2026)** has been moved to [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md).

---

## How to Use This Changelog

### When Making Changes:

1. **Add your changes to the `[Unreleased]` section** at the top
2. **Use the appropriate category**:
   - `Added` - New features
   - `Changed` - Changes to existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Security improvements

3. **Example Entry**:

```markdown
## [Unreleased]

### Added

- New useDebounce hook for search optimization

### Fixed

- Fixed theme switching bug in mobile view
```

### Before Release:

1. Move unreleased changes to a new version section
2. Add release date
3. Follow semantic versioning (MAJOR.MINOR.PATCH)

---

## Version Guidelines

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (1.1.0) - New features (backward compatible)
- **PATCH** (1.1.1) - Bug fixes (backward compatible)

---

**Note**: All changes should be documented in this file. Do NOT create separate session-specific documentation files.
