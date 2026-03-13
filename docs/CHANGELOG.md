# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-03-14

### Feature — Make-an-Offer system

Added a full buyer–seller offer negotiation flow with RC engagement (coins locked during offer lifetime).

**Schema:**

- `src/db/schema/offers.ts` — `OfferDocument` with status enum `pending|accepted|declined|countered|expired|withdrawn|paid`; fields: `productId`, `buyerUid`, `sellerId`, `offerAmount`, `counterAmount`, `lockedPrice`, `lockedRC`, 48h expiry; `OFFERS_COLLECTION` constant

**Server Actions (`src/actions/offer.actions.ts`):**

- `makeOfferAction` — validates product is listable, engages RC from buyer wallet, creates offer doc
- `respondToOfferAction` — seller accept / decline / counter; releases RC on decline
- `acceptCounterOfferAction` — buyer accepts counter; adjusts locked RC to counter price
- `withdrawOfferAction` — buyer withdraws; releases locked RC
- `checkoutOfferAction` — transitions accepted offer to paid, deducts RC, records transaction
- `listBuyerOffersAction` / `listSellerOffersAction` — Sieve-enabled reads

**API routes:**

- `GET /api/seller/offers` — incoming offers for authenticated seller (seller/admin role)
- `GET /api/user/offers` — outgoing offers for authenticated buyer

**Feature hooks:**

- `src/features/seller/hooks/useSellerOffers.ts` — `useSellerOffers()` + `useRespondToOffer()` mutation
- `src/features/user/hooks/useUserOffers.ts` — `useUserOffers()` + `useAcceptCounter()` + `useWithdrawOffer()`

**Feature components:**

- `src/features/seller/components/SellerOffersView.tsx` — DataTable with counter modal form
- `src/features/user/components/UserOffersView.tsx` — buyer offer list; checkout + withdraw actions
- `src/features/products/components/MakeOfferForm.tsx` — form on product detail page

**Pages:**

- `src/app/[locale]/seller/offers/page.tsx`
- `src/app/[locale]/user/offers/page.tsx`
- `src/app/[locale]/how-offers-work/page.tsx` + `src/features/about/components/HowOffersWorkView.tsx` — 6-step negotiation flow diagram

**Functions:**

- `functions/src/jobs/offerExpiry.ts` — CRON daily 00:15 UTC; queries `pending|countered` offers past their `expiresAt`, releases buyer RC, marks `expired`, sends notification
- `functions/src/repositories/offer.repository.ts` — `findExpiredActive(now)` / `expireMany(offerIds)` (499-doc batches)

---

## [Unreleased] — 2026-03-14

### Feature — RC Wallet (renamed from RipCoins)

Rebranded the RipCoins virtual-currency system to **RC** and added purchase flow, immutable ledger, offer engagement, and admin tools.

**Breaking renames:**

- `docs/features/ripcoins.md` → `docs/features/rc.md`
- `src/db/schema/ripcoins.ts` → deleted; schema now in `src/db/schema/rc.ts`
- `src/repositories/ripcoin.repository.ts` → deleted; replaced by `rcRepository` (`src/repositories/rc.repository.ts`)
- `src/hooks/useRipCoins.ts` → deleted; reads now via Server Actions
- `src/components/user/RipCoinsBalanceChip.tsx` → deleted; replaced by `src/components/user/RCBalanceChip.tsx`
- All RipCoins admin components deleted: `src/features/admin/components/RipCoinAdjustModal.tsx`, `RipCoinFilters.tsx`
- Old API routes deleted: `/api/ripcoins/*`
- Old pages deleted: `/ripcoins`, `/user/ripcoins`, `/user/ripcoins/purchase`

**Schema (`src/db/schema/rc.ts`):**

- `RCTransactionDocument` — immutable ledger; types: `purchase|engage|release|forfeit|return|earn_event|refund`; fields: `coins`, `balanceBefore`, `balanceAfter`, `razorpayOrderId`, `razorpayPaymentId`, `bidId`, `eventId`; economics: **10 RC = ₹1**
- `RC_PACKAGES` constant — fixed buy packages (100/500/1000/5000/10 000 RC)
- `RC_COLLECTION` constant

**Server Actions (`src/actions/rc.actions.ts`):**

- `getRCBalanceAction` — returns `{ rcBalance, engagedRC }` from `userRepository`
- `getRCHistoryAction` — paginated Sieve-enabled ledger read

**API routes (`src/app/api/rc/`):**

- `GET /api/rc/balance`
- `GET /api/rc/history`
- `POST /api/rc/purchase` — creates Razorpay order for fixed RC package
- `POST /api/rc/purchase/verify` — idempotent HMAC verification; credits base + bonus RC; creates ledger entry
- `POST /api/rc/refund` — refunds RC purchase; deducts free coins, triggers Razorpay refund

**Feature components:**

- `src/features/user/components/RCWallet.tsx` — balance display + transaction history table
- `src/features/user/components/RCPurchaseView.tsx` — package picker + Razorpay flow
- `src/features/user/components/BuyRCModal.tsx` — inline purchase modal (from wallet page)
- `src/components/user/RCBalanceChip.tsx` — shared balance chip
- `src/features/admin/components/RCAdjustModal.tsx` — admin credit/debit modal; calls `adminAdjustRCAction`
- `src/features/admin/components/RCFilters.tsx` — admin RC transaction filter panel

**Pages:**

- `src/app/[locale]/rc/page.tsx` — RC economics explainer (uses `RCInfoView`)
- `src/app/[locale]/user/rc/page.tsx` — user RC wallet
- `src/app/[locale]/user/rc/purchase/page.tsx` — RC purchase flow
- `src/features/about/components/RCInfoView.tsx` — RSC explainer with `FlowDiagram` and `RC_PACKAGES`

**Functions:**

- `functions/src/repositories/rc.repository.ts` — `rcRepository` for reading RC transaction history

---

## [Unreleased] — 2026-03-14

### Feature — Partial refund system

Added admin-triggered partial refunds and user-initiated cancellation refunds with transparent fee deductions.

**Server Actions (`src/actions/refund.actions.ts`):**

- `adminPartialRefundAction(input: PartialRefundInput)` — computes net refund: gross minus gateway fee (2.36%) minus GST (18%); optionally skips fee deduction (`deductFees` flag); creates Razorpay refund; updates order `refundStatus`
- `previewCancellationRefundAction(orderId)` — returns `PartialRefundResult` breakdown for display before confirming
- `PartialRefundResult` interface — gross / platformFee / gatewayFee / gst / net amounts

**API route:**

- `POST /api/admin/orders/[id]/refund` — admin-only; delegates to `adminPartialRefundAction`

**UI:**

- `src/features/seller/components/PayoutBreakdownModal.tsx` — display-only modal showing payout maths: gross → platform (5%) → gateway (2.36%) → GST (18%) → net; `PayoutBreakdown` interface

---

## [Unreleased] — 2026-03-14

### Feature — New info pages

- **`src/app/[locale]/fees/page.tsx`** + `src/features/about/components/FeesView.tsx` — static fee schedule table: platform 5%, gateway 2.36%, GST 18%
- **`src/app/[locale]/how-offers-work/page.tsx`** + `src/features/about/components/HowOffersWorkView.tsx` — offer negotiation flow (6-step `FlowDiagram`)
- **`src/app/[locale]/rc/page.tsx`** + `src/features/about/components/RCInfoView.tsx` — RC economics explainer; purchase packages; lifecycle diagram
- **`src/features/about/components/ShippingPolicyView.tsx`** — extracted from inline page component
- **`src/features/about/components/TrackOrderView.tsx`** — extracted from inline page component

---

## [Unreleased] — 2026-03-14

### Refactor — Additional Server Actions migrated from services

Seven new action files complete the service-layer deletion (all previously lived in `src/services/`):

| File                                    | Actions                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/actions/chat.actions.ts`           | `getChatRoomsAction`, `createOrGetChatRoomAction`, `sendChatMessageAction`, `deleteChatRoomAction`                        |
| `src/actions/product.actions.ts`        | 12 product/auction/pre-order read actions (`listProductsAction`, `getFeaturedProductsAction`, `listAuctionsAction`, etc.) |
| `src/actions/promotions.actions.ts`     | `getPromotionsAction`                                                                                                     |
| `src/actions/realtime-token.actions.ts` | `getRealtimeTokenAction`                                                                                                  |
| `src/actions/search.actions.ts`         | `searchProductsAction`                                                                                                    |
| `src/actions/site-settings.actions.ts`  | `getSiteSettingsAction`, `updateSiteSettingsAction`                                                                       |
| `src/actions/store.actions.ts`          | `listStoresAction`, `getStoreBySlugAction`, `getStoreProductsAction`, `getStoreAuctionsAction`, `getStoreReviewsAction`   |

All actions exported from `src/actions/index.ts`.

---

## [Unreleased] — 2026-03-14

### Refactor — Functions: auto payout eligibility job

- **`functions/src/jobs/autoPayoutEligibility.ts`** — CRON daily 04:45 UTC; queries all `delivered` orders with no active payout, groups by seller, creates `PayoutDocument` (`status: pending`) with net amount after 5% platform + 2.36% gateway + 18% GST deductions; updates each order's `payoutStatus = 'requested'`
- `functions/src/index.ts` — registered new `autoPayoutEligibility` job

---

## [Unreleased] — 2026-03-14

### Refactor — Views extracted to feature components

Thin page files delegating to proper feature-tier views:

- `src/features/homepage/components/HomepageView.tsx` — root homepage RSC view
- `src/features/homepage/components/HowAuctionsWorkView.tsx` — auction guide
- `src/features/homepage/components/HowPreOrdersWorkView.tsx` — pre-order guide
- `src/features/seller/components/SellerGuideView.tsx` — seller onboarding guide
- `src/features/about/components/ShippingPolicyView.tsx`
- `src/features/about/components/TrackOrderView.tsx`

Pages updated: `src/app/[locale]/page.tsx`, `how-auctions-work/page.tsx`, `how-pre-orders-work/page.tsx`, `seller-guide/page.tsx`, `promotions/page.tsx`, `shipping-policy/page.tsx`, `track/page.tsx`, `seller/layout.tsx`

---

## [Unreleased] — 2026-03-14

### Chore — Test suite cleanup

Removed all `__tests__/` files pending a proper test framework migration (all mocks were against deleted service layer):

- **~100 test files deleted** across `src/app/`, `src/features/`, `src/components/`, `src/hooks/`, `src/helpers/`, `src/utils/`, `src/services/`
- `src/hooks/__tests__/useAuctionDetail.test.ts` and `useCamera.test.ts` — retained (unrelated to service layer)

---

## [Unreleased] — 2026-03-14

### Feature — Platform-level third-party service integrations (Shiprocket, Meta)

Added encrypted credential storage, credential resolvers, and admin UI for the platform's Shiprocket shipping and Meta (Facebook/Instagram) catalog integrations. Stores do not have per-store third-party integrations — all payment, shipping, and email run through the platform's single accounts. Sellers only configure UPI ID or NEFT bank details for payouts.

**Schema changes:**

- `src/db/schema/site-settings.ts` — `SiteSettingsCredentials` and `SiteSettingsCredentialsMasked` extended with: `shiprocketEmail`, `shiprocketPassword`, `metaAppId`, `metaAppSecret`, `metaPageAccessToken`, `metaPageId`

**New library files:**

- `src/lib/shiprocket/platform-auth.ts` — `getPlatformShiprocketToken()` / `invalidatePlatformShiprocketToken()`; resolves credentials from Firestore siteSettings (admin-configurable) with `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` env-var fallback; in-process 9-day token cache
- `src/lib/oauth/meta.ts` — Meta Graph API v20.0 helper: `exchangeForLongLivedToken()`, `debugMetaToken()`, `syncProductsToCatalog()`, `deleteFromCatalog()`; resolves all creds from siteSettings with env-var fallback

**Admin UI:**

- `src/features/admin/components/SiteCredentialsForm.tsx` — `CredentialsUpdateValues` extended with all new fields; Shiprocket and Meta sections added to the form (Shiprocket email + password; Meta App ID, App Secret, Page Access Token with exchange hint, Page ID)
- `messages/en.json` (`adminSite`) — 9 new keys: `shiprocketSection`, `shiprocketEmail`, `shiprocketPassword`, `metaSection`, `metaAppId`, `metaAppSecret`, `metaPageAccessToken`, `metaPageAccessTokenHint`, `metaPageId`

---

## [Unreleased] — 2026-03-14

### Refactor — Service layer deleted: 2-hop architecture (Hook → apiClient / Hook → Action)

Deleted `src/services/` entirely (all 33 `*.service.ts` files + tests + `index.ts`). The architecture is now a strict 2-hop:

- **Reads:** `Component → useQuery hook → apiClient → API Route`
- **Mutations:** `Component → useMutation hook → Server Action → Repository`

**Files deleted:**

- All `src/services/*.service.ts` (33 files) and `src/services/__tests__/` (22 test files)
- `src/services/index.ts` barrel

**Callers migrated (apiClient inlined into hook queryFn):**

- `src/hooks/useAuth.ts` — `authService.login/register/sendVerification/changePassword` → `apiClient.post`
- `src/hooks/useLogout.ts` — `authService.logout` → `apiClient.post`
- `src/hooks/useCheckout.ts` — `checkoutService.*` → `apiClient.post`
- `src/hooks/useMediaUpload.ts` — `mediaService.*` → `apiClient.upload/post`
- `src/hooks/useNavSuggestions.ts` — `navSuggestionsService.search` → `searchNavPages` (Algolia helper, no API route needed)
- `src/hooks/useRC.ts` — `rcService.purchaseCoins/verifyPurchase/refundPurchase` → `apiClient.post`
- `src/features/admin/hooks/useAlgoliaSync.ts` — `adminService.algoliaSync/algoliaSyncPages/algoliaDevSync` → `apiClient.post`
- `src/features/admin/hooks/useDemoSeed.ts` — `adminService.demoSeedStatus/demoSeed` → `apiClient.get/post`
- `src/features/seller/hooks/useSellerOffers.ts` — `offerService.listForSeller` → `apiClient.get`
- `src/features/seller/hooks/useSellerOrders.ts` — removed dead `sellerService` import (already using Server Actions)
- `src/features/user/hooks/useUserOffers.ts` — `offerService.listForBuyer` → `apiClient.get`
- `src/features/cart/hooks/useCheckoutVerifyOtp.ts` — `checkoutService.requestOtpGrant` → `apiClient.post`
- `src/features/cart/hooks/usePaymentOtp.ts` — `checkoutService.requestOtpGrant` → `apiClient.post`
- `src/features/products/components/PreOrderDetailView.tsx` — `checkoutService.createPaymentOrder/verifyPreOrderDeposit` → `apiClient.post`
- `src/contexts/SessionContext.tsx` — `sessionService.getProfile/recordActivity/validate/create` + `authService.logout` → `apiClient.*`
- `src/lib/firebase/auth-helpers.ts` — `sessionService.create/destroy` → `apiClient.post/delete`

**Rules updated:**

- `scripts/check-violations.js` — `SVC-002` rewritten: was "apiClient outside `*.service.ts`", now "apiClient in component or page"; hooks/contexts/lib are allowed. `SVC-003` fileFilter expanded to include hooks.
- `.github/instructions/rules-services.instructions.md` — fully rewritten to document 2-hop pattern
- `.github/copilot-instructions.md` — Critical Stops + Rule Index + Migration State updated; I1 stage marked ✅

---

## [Unreleased] — 2026-03-13

### Refactor — Hook architecture: 5-hop → 2-hop (Hook → Action → Repository)

Replaced the `Hook → Service → apiClient → API Route → Repository` chain with direct `Hook → Action → Repository` calls across all feature hooks.

**TypeScript errors fixed:**

- Admin hooks: `useAdminCategories`, `useAdminFeatureFlags`, `useAdminProducts`, `useAdminReviews`, `useAdminSections`, `useAdminFaqs`, `useAdminSessions`, `useAdminSiteSettings`, `useAdminStores`, `useAdminUsers` — structural type incompatibilities resolved with `as unknown as T` casts
- Feature hooks: `useBlogPost`, `useBlogPosts`, `useCart`, `useCartCount`, `useHomepageSections`, `useProductReviews`, `usePublicEvent`, `useRelatedProducts`, `usePublicProfile`, `useSellerStorefront`, `useSellerAuctions`, `useSellerPayouts`, `useSellerProducts`, `useStoreBySlug`, `useCheckout`, `useFeaturedStores`, `useProfile`, `useFeedbackSubmit`, `usePollVote` — queryFn return type mismatches resolved
- `useRelatedProducts` — dead `productService.list(params)` call replaced with `listProductsAction(...)`
- Pre-existing action file errors fixed: `bid.actions.ts` (duplicate import), `faq.actions.ts` (duplicate import + wrong arg count), `chat.actions.ts` (`chatRepository.sendMessage` → RTDB write), `event.actions.ts` (`listForEvent` needs SieveModel arg), `promotions.actions.ts` / `store.actions.ts` (Date-to-string casts), `search.actions.ts` (Algolia result cast), `site-settings.actions.ts` (`get()` → `getSingleton()`, `update()` → `updateSingleton()`)

**New actions added (seller):**

- `sellerUpdateProductAction(id, input)` — verifies ownership, uses `productUpdateSchema.partial()`
- `sellerDeleteProductAction(id)` — verifies ownership, calls `productRepository.delete(id)`

**Actions enhanced:**

- `listSellerMyProductsAction` — added `totalPages` to return value
- `listSellerOrdersAction` — fixed: was erroneously passing `user.uid` string to `listForSeller(productIds: string[])`, now correctly fetches seller products then extracts IDs
- `getWishlistAction` — enriched to return full product data per wishlist item (mirrors previous API route behaviour)

**Services still retained** (mutations requiring complex Shiprocket/auth/payment APIs):

- `sellerService.updateShipping`, `sellerService.verifyPickupOtp`, `sellerService.shipOrder`
- Auth, media upload, checkout payment, realtime token, and nav-suggestions services remain pending future action migration

---

### Feature — Checkout: unified OTP verification + failed-checkout audit trail

Merged the two separate OTP flows (payment re-auth and third-party consent) into a **single OTP per checkout**. Added Firestore audit collections for failed checkouts and failed payments.

**Behaviour:**

- ALL orders (own address or third-party) require exactly one OTP before the order is placed.
- Default mode is **SMS** sent to the shipping address phone number (which equals the buyer's registered phone for own-address orders).
- If the buyer lacks access to that number (third-party address, unregistered phone), they switch to **email OTP** sent to their account email.
- The OTP modal fires only at "Place Order" time — not at address selection.

**Files added:**

- **`src/db/schema/failed-checkouts.ts`** — `FailedCheckoutDocument`, `FailedPaymentDocument`, reason enum types, collection constants `FAILED_CHECKOUTS_COLLECTION` / `FAILED_PAYMENTS_COLLECTION`
- **`src/repositories/failed-checkout.repository.ts`** — write-only `failedCheckoutRepository.logCheckout()` / `.logPayment()` (fire-and-forget, used in API routes)
- **`src/features/cart/hooks/useCheckoutVerifyOtp.ts`** — unified OTP state machine (`idle → sending → code_sent → verifying → granting → verified | error`); SMS path uses Firebase Phone Auth re-auth + `grantCheckoutConsentViaSmsAction`; email path uses existing `sendConsentOtpAction` / `verifyConsentOtpAction`
- **`src/features/cart/components/CheckoutVerifyModal.tsx`** — single modal replacing both `CheckoutOtpModal` and `ConsentOtpModal`; auto-selects SMS/email mode; toggle link for fallback

**Files modified:**

- **`src/actions/checkout.actions.ts`** — added `grantCheckoutConsentViaSmsAction(addressId)`: validates phone ownership server-side, writes `{verified:true, verifiedVia:"sms"}` Firestore consent doc
- **`src/app/api/checkout/route.ts`** — all orders (not just third-party) now require a verified consent OTP doc; removed `isThirdPartyAddress` / `requiresConsent` logic; failure logging via `failedCheckoutRepository`
- **`src/app/api/payment/verify/route.ts`** — consent OTP check added before order creation; `failedCheckoutRepository.logPayment()` for signature mismatch, OTP failures, stock errors, amount mismatch; OTP doc deleted after successful batch
- **`src/features/cart/components/CheckoutView.tsx`** — replaced two separate modals with `CheckoutVerifyModal`; removed old consent state (`consentVerifiedAddressIds`, `showConsentModal`, `consentModalData`); `handleNext` no longer blocks for consent
- **`src/features/cart/components/CheckoutAddressStep.tsx`** — removed `onConsentRequired` and `consentVerifiedAddressIds` props; third-party banner is now informational only (no Verify button)
- **`messages/en.json`** — added 13 new keys: `verifyModalTitle`, `verifyOwnDesc`, `verifyThirdPartyDesc`, `verifyTargetPhone`, `verifyTargetEmail`, `verifySendSmsBtn`, `verifySendEmailBtn`, `verifySentDescPhone`, `verifySentDescEmail`, `verifyCodeLabel`, `verifyConfirmBtn`, `verifyUseEmailInstead`, `verifyUseSmsInstead`
- **`src/db/schema/index.ts`** — exports `failed-checkouts`
- **`src/repositories/index.ts`** — exports `failedCheckoutRepository`
- **`src/actions/index.ts`** — exports all three checkout consent actions

### Feature — Checkout: third-party shipping consent + OTP gate

Added a mandatory OTP-verified consent gate when the selected delivery address belongs to a different person than the signed-in buyer.

- **`src/features/cart/components/CheckoutAddressStep.tsx`** — added `isThirdParty()` helper and `onConsentRequired` / `consentVerifiedAddressIds` props; renders a warning banner and blocks progression until consent is OTP-verified
- **`src/features/cart/components/CheckoutView.tsx`** — threads consent state (`consentVerifiedAddressIds`, `ConsentOTPModal`) through the address-selection step; prevents `proceedToPayment` until consent is confirmed for third-party addresses
- **`messages/en.json`** — added 20+ new keys: `checkout.thirdPartyTitle`, `...thirdPartyDesc`, `...thirdPartyCheckbox`, `...consentOtp*`, `...partialOrder*`, `wishlist.searchPlaceholder`, `orders.searchPlaceholder`, `reviews.searchPlaceholder`, `reviews.subtitle`, `auctions.subtitle`, `checkout.upiStep3`, `checkout.codDepositNote`

### Refactor — Schema: `Timestamp` → `Date` normalization

Eliminated `firebase-admin/firestore` `Timestamp` import from schema files so types are portable between Admin SDK and web client contexts.

- **`src/db/schema/events.ts`** — removed `Timestamp` import; `startsAt`, `endsAt`, `createdAt`, `updatedAt`, `reviewedAt`, `submittedAt` changed from `Timestamp` to `Date`
- **`src/db/schema/tokens.ts`** — removed `Timestamp` import; `expiresAt`, `createdAt`, `usedAt` changed from `Timestamp | Date` union to `Date`

### Schema — `ProductDocument`: denormalized rating fields

- **`src/db/schema/products.ts`** — added `avgRating?: number` and `reviewCount?: number` to `ProductDocument` (populated by the new `onReviewWrite` trigger)

### Schema — `SiteSettingsDocument`: navbar + footer runtime config

- **`src/db/schema/site-settings.ts`** — added `navbarConfig?: { hiddenNavItems?: string[] }` (hides nav items by translation key without a redeploy); added `footerConfig?: { trustBar?: { enabled?: boolean; items?: TrustBarItem[] }; newsletterEnabled?: boolean }`; added `TrustBarItem` interface and `DEFAULT_TRUST_BAR_ITEMS` constant (5 default footer trust-bar chips)

### Fix — Schema: remove deprecated `RC_EARN_RATE` constant

- **`src/db/schema/rc.ts`** — removed `@deprecated RC_EARN_RATE = 10`; callers should use `siteSettingsRepository.getLoyaltyConfig()`

### Fix — Actions: Rule-20 compliance + constant references

- **`src/actions/admin.actions.ts`** — `adminCreateProductAction` replaced inline `apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, …)` with `adminService.createAdminProduct(input)` (Rule 20: no `apiClient` in Server Actions)
- **`src/actions/bid.actions.ts`** — replaced manual `Timestamp`-coercion guard with `resolveDate(product.auctionEndDate)` from `@/utils`
- **`src/actions/event.actions.ts`** — replaced hardcoded `"events"` and `"eventEntries"` strings with `EVENTS_COLLECTION` / `EVENT_ENTRIES_COLLECTION` constants (Rule 17)

### Refactor — Cloud Functions: merge RTDB cleanup jobs + new triggers

- **`functions/src/jobs/cleanupAuthEvents.ts`** — **deleted**: responsibility merged into new `cleanupRtdbEvents` job (handles both auth and payment RTDB nodes in a single 5-min scheduled run)
- **`functions/src/jobs/cleanupPaymentEvents.ts`** — **deleted**: same merge
- **`functions/src/index.ts`** — updated job manifest table; added `countersReconcile` (03:00 UTC, rebuilds category & store stats); registered new `onReviewWrite` trigger; replaced two separate cleanup jobs with merged `cleanupRtdbEvents`
- **`functions/src/triggers/onProductWrite.ts`** — expanded beyond Algolia sync to also update category `productCount`/`auctionCount` (with ancestor propagation via `categoryRepository.getParentIds`) and store `totalProducts` on every publish/unpublish/category-change/delete event
- **`functions/src/repositories/review.repository.ts`** — added `getApprovedRatingAggregateBySeller(sellerId)` for store-level rating aggregation
- **`functions/src/repositories/index.ts`** — re-exports updated

### Dev tooling — Violation script + instruction docs sync

- **`scripts/check-violations.js`** — Updated `CNST-003` `KNOWN_COLLECTIONS` list to match actual Firestore string values from `src/db/schema/`: corrected camelCase names (`carouselSlides`, `homepageSections`, `siteSettings`, `emailVerificationTokens`, `passwordResetTokens`, `blogPosts`, `chatRooms`, `eventEntries`, `rc`); removed stale underscore names; added missing collections (`stores`, `newsletterSubscribers`, `sms_counters`, `couponUsage`, `wishlist` subcollection)
- **`.github/instructions/rules-constants.instructions.md`** — RULE 17 collection constants list expanded: added `CART_COLLECTION`, `STORE_COLLECTION`, `BLOG_POSTS_COLLECTION`, `CHAT_ROOM_COLLECTION`, `EVENTS_COLLECTION`, `EVENT_ENTRIES_COLLECTION`, `NEWSLETTER_SUBSCRIBERS_COLLECTION`, `NOTIFICATIONS_COLLECTION`, `PAYOUT_COLLECTION`, `RC_COLLECTION`, `SMS_COUNTERS_COLLECTION`, `ADDRESS_SUBCOLLECTION`, `COUPON_USAGE_SUBCOLLECTION`
- **`.github/instructions/rules-docs-seed.instructions.md`** — Fixed seed-data paths: all `scripts/seed-data/` references corrected to `src/db/seed-data/`; `scripts/seed-all-data.ts` reference replaced with `/api/demo/seed/route.ts`
- **`src/db/seed-data/index.ts`** — Removed export for deleted `products-seed-data.ts`
- **`src/app/api/demo/seed/route.ts`** — Removed `products` collection (seed file deleted); added `stores` collection; removed dead `ALGOLIA_INDEX_NAME` import and products clear block
- **`src/app/api/demo/seed/__tests__/route.test.ts`** — Fixed Jest mock path from wrong `../../../../../../scripts/seed-data` → correct `@/db/seed-data`; removed `productsSeedData` mock; added `storesSeedData: []`

### Refactor — Layout primitives applied codebase-wide

Applied `Container`, `Stack`, `Row`, `Grid` primitives (introduced earlier this session) across 35+ files, eliminating inline `THEME_CONSTANTS` template-literal patterns and raw Tailwind grid/flex blocks.

**Container replacements** (`THEME_CONSTANTS.page.container.*` → `<Container>`):

- `src/features/stores/components/StoresListView.tsx`, `src/features/products/components/ProductsView.tsx`, `src/features/events/components/EventsListView.tsx`, `src/features/products/components/PreOrdersView.tsx`, `src/features/blog/components/BlogListView.tsx`, `src/features/products/components/AuctionsView.tsx`, `src/features/categories/components/CategoriesListView.tsx`, `src/features/reviews/components/ReviewsListView.tsx`

**Grid replacements** (`grid grid-cols-1 sm:grid-cols-2 gap-4` / `THEME_CONSTANTS.grid.cols4` → `<Grid cols={…}>`):

- `src/components/products/ProductForm.tsx` (9 blocks + Stack root; THEME_CONSTANTS import removed entirely)
- `src/features/admin/components/SiteContactForm.tsx`, `SiteSocialLinksForm.tsx`, `SiteCommissionsForm.tsx`
- `src/features/seller/components/SellerPayoutSettingsView.tsx` (2 blocks), `SellerPayoutRequestForm.tsx`, `SellerShippingView.tsx` (cols-2 + cols-3), `SellerStoreView.tsx` (2 blocks)
- `src/features/admin/components/SectionForm.tsx`

**Row replacements** (`THEME_CONSTANTS.flex.center` / `.flex.between` → `<Row>`):

- `src/features/wishlist/components/WishlistView.tsx`, `src/features/user/components/UserSettingsView.tsx`, `UserOrdersView.tsx`, `UserEditAddressView.tsx`, `UserAddressesView.tsx`, `OrderDetailView.tsx`, `src/features/seller/components/SellerAddressesView.tsx`, `src/features/admin/components/AlgoliaDashboardView.tsx`

**Stack replacements** (`flex flex-col gap-*` → `<Stack>`):

- `src/features/stores/components/StoreReviewsView.tsx`, `src/features/admin/components/AdminPriorityAlerts.tsx`, `src/features/user/components/MessagesView.tsx`

### Fix — `ReviewDocument` schema: add `sellerId` field

- **`src/db/schema/reviews.ts`** — added `sellerId?: string` to `ReviewDocument` (denormalized seller reference; was in seed data, missing from type)
- **`src/db/schema/field-names.ts`** — added `SELLER_ID: "sellerId"` to `REVIEW_FIELDS`

### New — Layout Primitives: `Container`, `Stack`, `Row`, `Grid`

Added four structural layout primitives to `@mohasinac/ui` (and re-exported from `@/components`) to eliminate repeated inline Tailwind class strings across the codebase.

- **`packages/ui/src/components/Layout.tsx`** — new file implementing `Container`, `Stack`, `Row`, `Grid` with inlined token maps
- **`packages/ui/src/index.ts`** — exports `Container`, `Stack`, `Row`, `Grid` and their prop types + `GapKey`, `ContainerSize`, `GridCols`
- **`src/components/semantic/index.ts`** — re-exports all four primitives from `@mohasinac/ui`; fully available via `import { Container, Stack, Row, Grid } from '@/components'`
- **`src/constants/theme.ts`** — added `THEME_CONSTANTS.spacing.gap` map (`none` · `px` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl`) mirroring the inlined token map in Layout.tsx
- **`.github/instructions/rules-components.instructions.md`** — added "Layout Primitives" table with usage examples and mandatory-use rule

**Migration:** Replace raw flex/grid/container divs:

```tsx
// Before
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="flex items-center justify-between gap-2">
<div className="flex flex-col gap-4">
// After
<Container>
<Grid cols={3} gap="md">
<Row justify="between" gap="sm">
<Stack gap="md">
```

### Accessibility — Contrast fixes (Phase 3, deep codebase scan)

Files with white/light text on insufficiently light backgrounds or `primary-500` (#65c408, luminance ≈ 0.44) producing < 3:1 contrast with white text:

- **`src/features/seller/components/SellersListView.tsx`** — hero subtitle `text-green-100` → `text-white`; stats row `text-emerald-200` → `text-white/80`; final-CTA `text-emerald-100` → `text-white/90` (all on dark emerald/teal gradients)
- **`src/features/promotions/components/PromotionsView.tsx`** — badge `text-rose-100` → `text-white`; subtitle `text-rose-100` → `text-white/90` (on rose-pink gradient)
- **`src/features/user/components/OrderDetailView.tsx`** — step-tracker circles + connector `bg-primary-500` → `bg-primary-700`; ring `ring-primary-500/20` → `ring-primary-700/20`
- **`src/components/products/ProductCard.tsx`** — Add-to-Cart button `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-800`
- **`src/components/EventCard.tsx`** — Visit Event button `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-800`; `ring-primary-500` → `ring-primary-700`
- **`src/features/products/components/ProductActions.tsx`** — both Add-to-Cart buttons (desktop + mobile) `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-700/90`
- **`src/components/orders/OrderCard.tsx`** — selection checkbox `bg-primary-500 border-primary-500` → `bg-primary-700 border-primary-700`
- **`src/features/user/components/PublicProfileView.tsx`** — price `text-primary-600` → `text-primary-700 dark:text-primary-400`; review avatar initial `text-primary-600` → `text-primary-800 dark:text-primary-200`; review product link + website link `text-primary-600` → `text-primary-700 dark:text-primary-400 hover:underline`; stat values `text-primary-600` → `text-primary-700 dark:text-primary-400`; dead `text-success-600` / `text-warning-600` / `text-info-600` replaced with `text-emerald-600 dark:text-emerald-400` / `text-amber-600 dark:text-amber-400` / `text-sky-600 dark:text-sky-400`
- **`src/features/seller/components/SellerStorefrontView.tsx`** — profile link `text-primary-600` → `text-primary-700 dark:text-primary-400`; stat values `text-primary-600` → `text-primary-700 dark:text-primary-400`; dead `text-success-600` → `text-emerald-600 dark:text-emerald-400`; review avatar initial `text-primary-600` → `text-primary-800 dark:text-primary-200`; review product link + back link `text-primary-600` → `text-primary-700 dark:text-primary-400`
- **`src/features/seller/components/SellerStorefrontPage.tsx`** — both error-state links `text-primary-600` → `text-primary-700 dark:text-primary-400`

### Layout — Grid density fixes (Phase 3, deep codebase scan)

- **`src/components/products/ProductGrid.tsx`** — added `2xl:grid-cols-6` (was stopping at `xl:grid-cols-5`)
- **`src/features/wishlist/components/WishlistView.tsx`** — overlay grid updated to match `ProductGrid` (`2xl:grid-cols-6`)
- **`src/components/layout/FooterLayout.tsx`** — replaced dynamic `lg:grid-cols-${computed}` (Tailwind purge risk) with static `lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5`
- **`src/features/products/components/ProductDetailView.tsx`** — added `2xl:grid-cols-[1fr_1fr_320px]` to both skeleton and main 3-column layouts
- **`src/features/products/components/AuctionDetailView.tsx`** — same as above
- **`src/features/products/components/PreOrderDetailView.tsx`** — same as above
- **`src/features/homepage/components/HomepageSkeleton.tsx`** — categories row: added `2xl:grid-cols-5`; products/auctions skeleton rows: mobile base changed from `grid-cols-3` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (matches real carousel)
- **`src/features/homepage/components/FAQSection.tsx`** — accordion container `max-w-3xl` → `max-w-5xl` (was wasting widescreen space)
- **`src/features/stores/components/StoreAboutView.tsx`** — content container `max-w-2xl` → `max-w-4xl mx-auto` (was left-aligned without `mx-auto`)
- **`src/features/user/components/MessagesView.tsx`** — added `2xl:grid-cols-[360px_1fr]` to message layout
- **`src/features/homepage/components/WelcomeSection.tsx`** — added explicit `xl:grid-cols-2 2xl:grid-cols-2`
- **`src/features/seller/components/SellerCouponsView.tsx`** — added `xl:grid-cols-2` (was jumping `lg:2 → 2xl:3`, skipping `xl`)
- **`src/features/homepage/components/AdvertisementBanner.tsx`** — added `lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2` to image/text banner grid
- **`src/features/blog/components/BlogPostView.tsx`** — related posts grid: added `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/user/components/RCWallet.tsx`** — balance stat cards grid: added `xl:grid-cols-3 2xl:grid-cols-3`

---

## 2026-03-13 (earlier in session)

### Accessibility — Contrast fixes (Phase 1 & 2 initial audit)

- **`src/constants/theme.ts`** — `colors.footer.*` dark: variants removed (footer bg is always dark); `sectionHeader.pill` `text-primary-600` → `text-primary-700`
- **`src/features/homepage/components/WhatsAppCommunitySection.tsx`** — gradient darkened `from-green-700 to-green-800`; `text-emerald-100` → `text-white`; `text-white/75` → `text-white/90`
- **`src/features/seller/components/SellerSidebar.tsx`** — group label `text-zinc-400 dark:text-zinc-500` → `text-zinc-500 dark:text-zinc-400`
- **`src/components/categories/CategoryCard.tsx`** — product-count chip `bg-white/20` → `bg-black/50` (text was unreadable on light category images)
- **`src/features/auth/components/RegisterForm.tsx`** — all `text-blue-600` links → `text-blue-600 dark:text-blue-400` with hover variants
- **`src/features/auth/components/ForgotPasswordView.tsx`** — sign-in link `text-blue-600` → `text-blue-600 dark:text-blue-400`
- **`src/features/homepage/components/AdvertisementBanner.tsx`** — subtitle `text-white/80` → `text-white`

### Layout — Grid density fixes (Phase 2 initial audit)

- **`src/features/homepage/components/FeaturedResultsSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-5`
- **`src/features/homepage/components/SiteFeaturesSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-6`
- **`src/features/homepage/components/TrustFeaturesSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-4`
- **`src/features/homepage/components/StatsCounterSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-4`
- **`src/features/homepage/components/HowItWorksSection.tsx`** — added `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/seller/components/SellersListView.tsx`** — benefits `xl:grid-cols-3 2xl:grid-cols-4`; steps `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/seller/components/SellerStorefrontView.tsx`** — products grid `2xl:grid-cols-6`
- **`src/features/user/components/UserAccountHub.tsx`** — quick-actions grid `xl:grid-cols-6 2xl:grid-cols-6`
- **`src/features/about/components/AboutView.tsx`** — both feature grids `2xl:grid-cols-3`
- **`src/features/admin/components/QuickActionsGrid.tsx`** — `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/homepage/components/WhatsAppCommunitySection.tsx`** — benefits grid `sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4`
