# LetItRip — Patch Session Prompts
> Paste the relevant section below as the **first message** in a new Claude Code session for that patch.
> The prompt is self-contained — no prior context needed.
> Update `## Current State` in each prompt after significant milestones.

---

## How to Use

1. Open a new Claude Code session in `d:\proj\letitrip.in`
2. Copy the **entire prompt block** for the active patch
3. Paste it as your first message
4. Claude has full context — no explaining needed, start immediately

**Tip:** After completing any Group (A, B, C…), update the `## Current State` section so the next session starts accurately.

---

---

# P-1 PROMPT — MVP (Copy-paste this to start a P-1 session)

```
You are continuing development of LetItRip — India's largest collectibles marketplace.

## Project
- Monorepo: d:\proj\letitrip.in (Next.js 15 App Router) + d:\proj\letitrip.in\appkit\ (component library)
- Stack: Next.js 15, Firebase (Firestore + Auth + Storage + RTDB), Tailwind, TypeScript
- appkit pinned as file:./appkit (local dev, never npm publish unless I ask)
- Deploy: Vercel Hobby, manual only via `node scripts/deploy.mjs` or GitHub Actions

## Active Patch: P-1 MVP
Branch: main (P-1 goes directly on main — it IS the baseline)

## Cardinal Rules (from CLAUDE.md)
1. STOP AND ASK before choosing between two approaches, deviating from the plan, or doing anything destructive
2. ✅ in the tracker does NOT mean working — re-read source files before coding from memory
3. Schema changes must update ALL callers in the same session
4. Never fix something without reading the current source file first
5. `npm run check` must exit 0 before marking anything done (tsc + 57 audits + lint)
6. All CTAs use ACTIONS registry (action-registry.ts + action-defs.ts)
7. Never defer work — finish in this session
8. Forms use appkit primitives: <Form>, <FieldInput>, <FieldSelect>, <FieldTextarea>

## What P-1 Delivers (all manual — no 3rd party integrations)
- Standard product catalogue (browse, search, filter) — flag-gated disabled features
- Cart (add, qty, remove, bulk ops)
- User auth (email + Google OAuth)
- Checkout: Cash / UPI only (no Razorpay, no COD — both FEATURE_*=false)
- Post-order proof upload: buyer uploads UPI screenshot + transaction ID
- Admin manually verifies payment (checks UTR in bank app, clicks "Verify Payment" in admin UI)
- Seller manually marks as shipped: enters carrier name + AWB# + optional tracking URL
- Mobile nav via BottomSheet (<1024px) for admin, seller, user dashboards
- Desktop sidebar for all 3 dashboard types
- Wishlist (add, bulk remove, bulk add-to-cart)
- Feature flags: all FEATURE_* env vars (AUCTIONS, BLOG, EVENTS, CHAT, etc.) default false
- GitHub Actions: CI + feature-toggle + deploy-prod workflows
- Playwright E2E: iPhone 13 / laptop 14" / monitor 30"

## Current State (update as groups complete)
- [ ] Group A: Feature flags infrastructure
- [ ] Group B: Navigation cleanup
- [ ] Group C: Admin dashboard mobile + desktop
- [ ] Group D: Seller dashboard basics
- [ ] Group E: Cash/UPI payment feature (schema + actions + routes + UI)
- [ ] Group F: Disabled feature API guards
- [ ] Group G: Firebase Functions disable non-essential
- [ ] Group H: Seed data cleanup
- [ ] Group I: RTDB safety check
- [ ] Group J: Dashboard styling fixes
- [ ] Group K: Architecture violations fix + audit
- [ ] Group L: Wishlist bulk add-to-cart
- [ ] Group M: Tour system prep (button slot only)
- [ ] Group N: GitHub Actions workflows
- [ ] Group N2: Playwright E2E tests
- [ ] Group T: Unit tests (payment proof + verify routes)
- [ ] Group O: Quality gate + deploy

## Files to Read Before Starting
1. `C:\Users\mohsi\.claude\plans\plan-a-full-end-distributed-pumpkin.md` — master todo list
2. `C:\Users\mohsi\.claude\plans\patches-roadmap.md` — P-1 details
3. `appkit/src/features/orders/schemas/firestore.ts` — OrderDocument (add proof fields)
4. `appkit/src/_internal/shared/features/checkout/config.ts` — payment methods
5. `appkit/src/utils/id-generators.ts` line 574 — MediaFilenameContext (add payment-proof)
6. `appkit/src/features/layout/TitleBarLayout.tsx` lines 14-61, 344-345 — tour button slot
7. `src/components/routing/CartRouteClient.tsx` — raw fetch violations to fix
8. `src/components/routing/CheckoutRouteClient.tsx` — raw fetch violations to fix
9. `src/constants/navigation.tsx` — nav groups to clean up
10. `scripts/run-audits.mjs` — add new audits here

## Key Architecture Facts
- Payment proof upload: Client → /api/media/sign → PUT to GCS (direct) → /api/media/finalize → /api/orders/[id]/payment-proof
- Server actions live in appkit/src/_internal/server/features/*/actions.ts
- API routes in src/app/api/ use createRouteHandler({ auth, roles, permission })
- Feature flags: src/lib/features.ts (to create), reads FEATURE_* env vars
- All CTAs use ACTIONS.{RESOURCE}["action-id"] from action-registry.ts
- No raw <form>, <input>, <select> — use <Form>, <FieldInput>, <FieldSelect>
- `npm run check` = tsc + 57 audits + lint (must exit 0 before any task is "done")

## Unit Tests Required (Group T)
Write with Vitest (existing test runner):

### T1 — src/lib/features.test.ts
- getFlag("AUCTIONS") returns false when FEATURE_AUCTIONS unset
- getFlag("AUCTIONS") returns true when FEATURE_AUCTIONS="true"
- getFlag is memoized per request (React.cache)

### T2 — src/app/api/orders/[id]/payment-proof/__tests__/route.test.ts
Tests for POST /api/orders/[id]/payment-proof:
- Returns 401 when unauthenticated
- Returns 403 when buyer doesn't own the order
- Returns 400 when paymentMethod is not cash/upi_manual
- Returns 409 PROOF_ALREADY_ATTACHED when proofUrl already set
- Returns 200 and updates order with proofUrl + transactionId + mimeType + uploadedAt

### T3 — src/app/api/admin/orders/[id]/payment-verify/__tests__/route.test.ts
Tests for PATCH /api/admin/orders/[id]/payment-verify:
- Returns 401 when unauthenticated
- Returns 403 when caller is not admin or moderator
- Returns 404 when order not found
- Returns 409 when paymentStatus is already PAID (idempotent guard)
- Returns 200 and sets paymentStatus=PAID, paymentId=order.paymentTransactionId
- Sends buyer notification after verification

### T4 — appkit/src/_internal/server/features/orders/__tests__/payment-actions.test.ts
Tests for server actions:
- attachPaymentProofAction: validates buyer owns order
- attachPaymentProofAction: rejects wrong payment method
- attachPaymentProofAction: rejects duplicate proof
- attachPaymentProofAction: writes all 4 proof fields to Firestore
- adminVerifyPaymentAction: validates admin/moderator role
- adminVerifyPaymentAction: transitions paymentStatus to PAID
- adminVerifyPaymentAction: is idempotent on re-call

## Playwright E2E Tests Required (Group N2)
3 viewport projects: iphone-13 (390×844), laptop-14 (1440×900), monitor-30 (2560×1440)
Auth: loginAsAdmin(page) / loginAsSeller(page) / loginAsBuyer(page) from _setup.ts

### pw-customer-browse.spec.ts (covers UC-B1, B2, B3)
- Guest can visit homepage, sees product grid
- Guest can search by keyword → results update
- Guest can filter by category → results narrow
- Guest can open product detail → sees images, price, description

### pw-cart-checkout.spec.ts (covers UC-B4, UC-B7)
- Authenticated buyer adds product to cart
- Buyer changes quantity → total updates
- Buyer removes item → cart updates
- Buyer proceeds to checkout → method=cash → order created → redirected to /orders/[id]/payment

### pw-payment-proof.spec.ts (covers UC-B8, P-1 sequence diagram flow)
- Buyer at /orders/[id]/payment sees UPI QR / VPA
- Buyer uploads screenshot file (fixture: test-upi-screenshot.jpg)
- Buyer enters transaction ID "TEST-UTR-12345"
- Buyer submits → status shows "Proof submitted, we'll verify"
- Order status in /user/orders shows proof_pending

### pw-admin-verify.spec.ts (covers UC-A2, sequence diagram admin leg)
- Admin sees order with proof thumbnail in admin order detail
- Admin sees transaction ID displayed
- Admin clicks "Verify Payment" → confirm dialog appears
- Admin confirms → paymentStatus becomes PAID
- Buyer receives notification (check notification badge count increases)

### pw-seller-ship.spec.ts (covers UC-S3, UC-S4)
- Seller sees incoming order (after payment verified) in /store/orders
- Seller opens order detail
- Seller enters: carrier="DTDC", trackingNumber="1234567890", trackingUrl="https://dtdc.com/track/..."
- Seller clicks "Mark as Shipped" → order status = SHIPPED
- Buyer notification sent (check notification count)

### pw-admin-nav.spec.ts (covers mobile + desktop nav)
- iphone-13: admin → hamburger opens BottomSheet → all enabled nav groups visible
- iphone-13: tap "Orders" → navigates correctly
- laptop-14: sidebar visible, collapse toggle works, state persists on reload
- monitor-30: sidebar always expanded, all groups visible

### pw-wishlist.spec.ts (covers UC-B10, UC-L1)
- Buyer adds product to wishlist from product detail
- Buyer visits /wishlist, sees item
- Buyer selects 2 items → "Remove selected" → items gone
- Buyer adds product → selects it → "Add to cart" → cart count increases

## Quality Gate
Before marking P-1 done:
1. npm run check → exits 0 (all 59 audits including new direct-fetch-ui + feature-flags)
2. npm run test → all Vitest unit tests pass
3. npm --prefix appkit run test → passes
4. npm run test:e2e → all Playwright tests pass (3 viewports)
5. Bump appkit to 3.2.0, build, publish
6. Firebase indexes + rules + functions deployed
7. Vercel: all FEATURE_*=false set, vercel --prod
8. Post-deploy smoke on https://letitrip.in
```

---

---

# P-2 PROMPT — Coupons

```
You are continuing development of LetItRip — India's largest collectibles marketplace.
P-1 (MVP) is fully deployed and stable on main. You are now starting Patch 2.

## Project
Monorepo: d:\proj\letitrip.in (Next.js 15) + appkit/
Branch: patch/p2-coupons (branch from main first: git checkout -b patch/p2-coupons)
CLAUDE.md rules apply — read it before starting.

## Active Patch: P-2 Coupons
Feature flag to flip: FEATURE_COUPONS=true (only set this in Vercel when all tests pass)

## What Already Works (P-1 code, do NOT re-implement)
- All P-1 flows: browse, cart, cash/UPI checkout, payment proof, admin verify, seller ship
- Coupon data model (coupons collection, couponsRepository, applyCoupon()) — already implemented
- Admin coupon UI (`/admin/coupons`) — already coded, just flag-gated
- Seller coupon UI (`/store/coupons`) — already coded, just flag-gated
- Usage tracking + per-user limit in couponsRepository.applyCoupon()

## What P-2 Needs (sequence: UC-B-C1 → UC-A-C1 → UC-A-C2 → UC-S-C1 → UC-S-C2)
1. Remove FEATURE_COUPONS guard from checkout coupon field (show coupon input)
2. Ensure FEATURE_COUPONS guard on all coupon API routes (404 if false)
3. Verify coupon apply flow: enter code → validate → discount reflected in order summary
4. Add audit-feature-flags check for coupon routes

## Files to Read First
- appkit/src/features/coupons/ — existing coupon model
- appkit/src/_internal/server/features/checkout/actions.ts — coupon application in checkout
- src/components/routing/CheckoutRouteClient.tsx — coupon field location
- src/app/api/admin/coupons/ and src/app/api/store/coupons/ — flag guards needed

## Unit Tests (Group T)
### T-P2-1 — coupon validation tests
- applyValidCoupon: discount applied, usage incremented
- applyExpiredCoupon: rejected with COUPON_EXPIRED
- applyPerUserLimitExceeded: rejected with LIMIT_EXCEEDED
- applySellerCouponToWrongStore: rejected with SCOPE_MISMATCH
- applyInactiveCoupon: rejected with COUPON_INACTIVE

## Playwright Tests
### pw-coupons.spec.ts (all 3 viewports)
- Admin creates coupon SAVE15 (15% off)
- Buyer adds item to cart → checkout → enters SAVE15 → sees 15% discount in summary
- Buyer confirms order → couponUsage count incremented to 1
- Admin deactivates coupon → buyer tries again → COUPON_INACTIVE error shown

## Quality Gate
npm run check + npm run test + npm run test:e2e → all green
PR from patch/p2-coupons → main → CI green → CEO approves → Deploy via GitHub Actions
```

---

---

# P-3 PROMPT — Blog

```
You are continuing development of LetItRip. P-1 and P-2 are deployed and stable.

## Active Patch: P-3 Blog
Branch: patch/p3-blog (branch from main)
Flag to flip: FEATURE_BLOG=true

## What Already Works
- Blog data model (blogPosts collection, blogPostsRepository) — implemented
- Admin blog UI (/admin/blog) — already coded, flag-gated
- Public blog pages (/blog, /blog/[slug]) — already coded, flag-gated

## What P-3 Needs
1. Remove FEATURE_BLOG guard from main nav Blog link + /blog page
2. Verify FEATURE_BLOG guard on /api/admin/blog/* routes
3. Ensure OG metadata generates from blogPost.coverImage + excerpt
4. Verify rich HTML content renders (sanitized, no XSS)

## Unit Tests
- getBlogPost: returns null for unpublished posts to public callers
- listBlogPosts: only returns published posts
- createBlogPost: requires admin role
- publishBlogPost: transitions status from draft to published

## Playwright Tests
### pw-blog.spec.ts (all 3 viewports)
- Admin creates post with title "Test Collectibles Guide" + rich content
- Admin publishes post
- Public user visits /blog → sees post in listing
- Public user clicks → reads detail, rich HTML renders, images load
- OG meta: verify title + description in page source
- Admin drafts post → public user cannot access /blog/[slug] (404)

## Quality Gate
npm run check + all tests → green → PR → main → deploy
```

---

---

# P-4 PROMPT — Events (Sale/Offer Types)

```
You are continuing development of LetItRip. P-1, P-2, P-3 deployed and stable.

## Active Patch: P-4 Events (sale + offer types only)
Branch: patch/p4-events
Flag to flip: FEATURE_EVENTS=true
Raffle/spin wheel remain FEATURE_PRIZE_DRAWS=false until P-10.

## What Already Works
- Event data model (events collection, eventsRepository) — implemented
- Admin events UI — coded, flag-gated
- Public events pages (/events, /events/[id]) — coded, flag-gated
- Homepage events-feed section — coded, flag-gated

## What P-4 Needs
1. Expose only type=sale and type=offer in admin event form (hide raffle/poll/spin when FEATURE_PRIZE_DRAWS=false)
2. Remove FEATURE_EVENTS guard from nav + /events pages
3. Ensure FEATURE_EVENTS guard on /api/events/* and /api/admin/events/*
4. Homepage: events-feed section renders active events
5. Countdown timer works on event detail page

## Unit Tests
- createEvent: requires admin role
- activateEvent: sets status=active, validates startsAt < endsAt
- listActiveEvents: only returns type=sale|offer when FEATURE_PRIZE_DRAWS=false
- getEventDetail: includes countdown calculation

## Playwright Tests
### pw-events.spec.ts (all 3 viewports)
- Admin creates sale event "Weekend Sale" (type=sale, active, +7 days)
- Admin activates → homepage shows event banner with countdown
- Public user clicks event → detail page shows
- Countdown timer decrements (wait 3s, verify display changed)
- Admin ends event → event no longer on homepage

## Quality Gate
npm run check + all tests → green → PR → main → deploy
```

---

---

# P-5 PROMPT — Auctions

```
You are continuing development of LetItRip. P-1 through P-4 are deployed and stable.

## Active Patch: P-5 Auctions (HIGH RISK — test thoroughly on staging first)
Branch: patch/p5-auctions
Flag to flip: FEATURE_AUCTIONS=true
Functions to enable: auctionSettlement (Firebase scheduled), onBidPlaced (Firestore trigger)

## What Already Works
- Auction listing type in product schema (listingType="auction") — implemented
- Seller product form auction fields — coded, flag-gated
- Public auctions pages — coded, flag-gated
- Bid placement API — coded, flag-gated
- auctionSettlement Firebase Function — implemented, early-return guard in place
- onBidPlaced trigger — implemented, early-return guard in place

## What P-5 Needs
1. Remove FEATURE_AUCTIONS guards from seller product form + nav + /auctions pages
2. Remove early-return from auctionSettlement function (remove siteSettings.featureFlags check)
3. Remove early-return from onBidPlaced trigger
4. Update Firebase Functions deploy (firebase deploy --only functions)
5. Verify Firestore listener on auction detail page for real-time bid updates

## Sequence to Test
Seller creates auction → Buyer-A bids → Buyer-B overbids → Buyer-A gets outbid notif →
timer expires → auctionSettlement runs → winner = Buyer-B notified →
Buyer-B pays via Cash/UPI (P-1 flow)

## Unit Tests
- placeBid: validates amount > currentHighestBid
- placeBid: rejects bid after closingAt
- placeBid: notifies previous highest bidder
- auctionSettlement: picks highest bid as winner
- auctionSettlement: marks auction closed, notifies winner + seller
- auctionSettlement: no winner if no bids placed

## Playwright Tests
### pw-auctions.spec.ts (all 3 viewports)
- Seller creates auction listing (startingPrice=500, closingAt=+5min for test)
- Buyer-A places bid of ₹600
- Buyer-B places bid of ₹800 → Buyer-A receives outbid notification
- (manually trigger auctionSettlement via Firebase console OR wait timer)
- Buyer-B (winner) receives "You won" notification
- Buyer-B navigates to /orders → completes Cash/UPI proof upload

## WARNING
NEVER enable FEATURE_AUCTIONS on prod without 24h soak on staging.
auctionSettlement is a Firebase Function — deploy to staging first, verify no errors in logs.

## Quality Gate
npm run check + all tests + 24h staging soak → green → PR → main → deploy
```

---

---

# P-6 PROMPT — Pre-orders

```
You are continuing development of LetItRip. P-1 through P-5 are deployed and stable.

## Active Patch: P-6 Pre-orders
Branch: patch/p6-preorders
Flag to flip: FEATURE_PREORDERS=true

## What Already Works
- Pre-order listing type in product schema (listingType="pre-order") — implemented
- Seller product form pre-order fields — coded, flag-gated
- Public pre-orders pages — coded, flag-gated
- Deposit % logic in checkout — may need verification

## What P-6 Needs
1. Confirm ProductDocument has depositPercent field (read schema first)
2. Remove FEATURE_PREORDERS guards from seller form + nav + /pre-orders pages
3. Verify checkout handles depositPercent: charge only X% at checkout
4. Seller can update pre-order status (PROCESSING → READY_TO_SHIP → SHIPPED)
5. Delivery ETA displays on product detail + order detail

## Unit Tests
- createPreOrder: validates depositPercent 1-100
- checkoutPreOrder: totalCharged = totalAmount * depositPercent / 100
- updatePreOrderStatus: validates seller owns the product
- getPreOrderDetail: shows ETA + current status

## Playwright Tests
### pw-preorders.spec.ts (all 3 viewports)
- Seller creates pre-order (depositPercent=25, eta=2026-09-01)
- Public user sees pre-order on /pre-orders
- Buyer places pre-order → checkout shows "Pay now: 25% = ₹X" + "Remaining: ₹Y on arrival"
- Buyer uploads deposit proof → admin verifies (P-1 flow)
- Seller marks "Ready to Ship" → status updates
- Seller enters tracking → marks shipped → buyer notified

## Quality Gate
npm run check + all tests → green → PR → main → deploy
```

---

---

# P-7 PROMPT — Seller Payouts (Manual UPI)

```
You are continuing development of LetItRip. P-1 through P-6 deployed and stable.

## Active Patch: P-7 Seller Payouts (manual — admin records UPI transfer)
Branch: patch/p7-payouts
Flag to flip: FEATURE_PAYOUTS=true
Function to enable: payoutBatch (calculation only, no auto-send)

## What Already Works
- Payout data model (payouts collection, payoutsRepository) — implemented
- payoutBatch Firebase Function — implemented, early-return guard in place
- Admin payout UI — may be partially coded, check first

## What P-7 Needs
1. Remove early-return from payoutBatch function
2. Remove FEATURE_PAYOUTS guards from admin + seller payout pages
3. Admin: "Calculate Payouts" button → runs payoutBatch → shows pending amounts per seller
4. Admin: per-payout "Mark as Paid" button + transaction ref input (UPI reference number)
5. Seller: /store/payouts page shows payout history (amount, status, date, reference)
6. Notification to seller when payout is marked PAID

## Unit Tests
- calculatePayoutsForSeller: sums DELIVERED order amounts minus platform fee
- calculatePayoutsForSeller: excludes CANCELLED and REFUNDED orders
- markPayoutPaid: requires admin role
- markPayoutPaid: validates payout exists and status=PENDING
- markPayoutPaid: records transactionRef, sets status=PAID, sends notification

## Playwright Tests
### pw-payouts.spec.ts (all 3 viewports)
- Admin triggers "Calculate Payouts" → pending payout appears for test seller
- Admin enters UPI reference "HDFC1234567890" → clicks "Mark as Paid"
- Seller receives notification "Payout ₹X received"
- Seller visits /store/payouts → sees PAID payout with reference number

## Quality Gate
npm run check + all tests → green → PR → main → deploy
```

---

---

# P-8 PROMPT — GST (Indian Tax Compliance)

```
You are continuing development of LetItRip. P-1 through P-7 deployed and stable.

## Active Patch: P-8 GST (REQUIRED before P-9 COD)
Branch: patch/p8-gst
Flag to flip: FEATURE_GST=true
Legal prerequisite: GSTIN must be registered before enabling

## Schema Changes (read current schemas FIRST before touching anything)
1. appkit/src/features/orders/schemas/firestore.ts:
   Add: gstAmount, cgst, sgst, igst, taxableAmount (all number, in paise, optional)
2. appkit/src/features/products/schemas/firestore.ts (or wherever ProductDocument is):
   Add: gstRate?: 0 | 5 | 12 | 18 | 28, hsnCode?: string
3. appkit/src/features/admin/schemas/firestore.ts (SiteSettings):
   Add: gst?: { enabled: boolean, gstin: string, legalName: string, address: string }

## Business Logic to Implement
- calculateGst(rate: number, intraState: boolean, amountPaise: number): GstBreakdown
  - intraState: cgst = rate/2, sgst = rate/2, igst = 0
  - interState: cgst = 0, sgst = 0, igst = rate
  - GstBreakdown: { cgst, sgst, igst, gstAmount, taxableAmount }
- Wire into createCheckoutOrderAction (compare buyer pincode state vs seller state)
- Update invoice PDF generator to include GSTIN, HSN, CGST/SGST/IGST

## What P-8 Needs
1. Schema changes (ProductDocument + OrderDocument + SiteSettings)
2. calculateGst() helper in appkit/src/_internal/shared/features/checkout/
3. Wire tax calc into createCheckoutOrderAction
4. Admin: GST settings section in site settings (GSTIN, legal name, address)
5. Product form: HSN code + GST rate dropdown
6. Invoice PDF: GSTIN, HSN, CGST/SGST/IGST, grand total (Rule 46 compliant)
7. Seller GST collected report (per month)

## Unit Tests
- calculateGst(18, true, 100000): { cgst: 9000, sgst: 9000, igst: 0, gstAmount: 18000 }
- calculateGst(18, false, 100000): { cgst: 0, sgst: 0, igst: 18000, gstAmount: 18000 }
- calculateGst(0, true, 100000): { cgst: 0, sgst: 0, igst: 0, gstAmount: 0 }
- createCheckoutOrderAction: intraState order has cgst + sgst, igst=0
- createCheckoutOrderAction: interState order has igst, cgst=sgst=0
- invoice PDF: contains GSTIN, HSN code, both CGST+SGST or IGST

## Playwright Tests
### pw-gst.spec.ts (all 3 viewports)
- Admin sets GSTIN "29AAAAA0000A1Z5" + legal name in site settings
- Admin sets product gstRate=18 + hsnCode="9503" on a test product
- Buyer from same state → checkout shows CGST 9% + SGST 9%
- Buyer from different state → checkout shows IGST 18%
- Download invoice → verify PDF contains GSTIN, HSN, tax breakup

## Quality Gate
npm run check + all tests + legal review of invoice format → green → PR → main → deploy
```

---

---

# P-9 PROMPT — COD (Cash on Delivery)

```
You are continuing development of LetItRip. P-1 through P-8 deployed and stable.
CRITICAL: P-8 GST MUST be live before enabling COD. Invoices must be GST-compliant.

## Active Patch: P-9 COD with Deposit + COD Fee
Branch: patch/p9-cod
Flag to flip: FEATURE_COD=true
codEnabled guard already exists in checkout/actions.ts — just flip the flag

## Schema Changes (read current schemas FIRST)
1. OrderDocument: add codFeeAmount?: number (paise — the COD handling charge)
2. SiteSettings: add codFee: number (paise, e.g., 4900 = ₹49) — codDepositPercent already exists

## Business Logic
- COD checkout: charge deposit% + codFee + 18% GST on codFee upfront
- Show buyer: "Pay now: ₹X (deposit + COD fee)" + "Pay on delivery: ₹Y"
- codFee is configurable in admin site settings
- COD fee GST is 18% on the service charge (codFee)
- Invoice: COD fee + its GST as separate line item

## What P-9 Needs
1. Schema changes (OrderDocument + SiteSettings)
2. Checkout UI: when COD selected, show deposit + COD fee + GST breakdown
3. Admin site settings: COD fee amount field (in ₹, stored as paise)
4. Invoice PDF: COD fee + GST line item
5. Admin marks COD amount collected after delivery confirmation

## Unit Tests
- codCheckout: totalPayNow = depositAmount + codFee + codFeeGst
- codCheckout: payOnDelivery = total - depositAmount
- codCheckout: codFeeGst = codFee * 0.18
- codInvoice: contains COD fee + GST as separate line

## Playwright Tests
### pw-cod.spec.ts (all 3 viewports)
- Admin sets codFee=4900 (₹49) + codDepositPercent=20 in site settings
- Buyer checkout → selects COD → sees breakdown:
  "COD Handling Fee: ₹49 + GST ₹8.82 = ₹57.82"
  "Pay now: deposit (20%) + COD fee"
  "Pay on delivery: remaining 80%"
- Buyer confirms → uploads deposit proof → admin verifies
- Seller ships manually → buyer receives at door
- Admin marks "COD collected" → order DELIVERED

## Quality Gate
npm run check + all tests + legal review of COD terms → green → PR → main → deploy
```

---

---

# P-10 PROMPT — Prize Draws + Spin Wheel

```
You are continuing development of LetItRip. P-1 through P-9 deployed and stable.
CRITICAL: Legal clearance on prize draw regulations in India REQUIRED before enabling.
Also: P-2 Coupons must be live (prize draws issue coupon codes as prizes).

## Active Patch: P-10 Prize Draws + Spin Wheel
Branch: patch/p10-prize-draws
Flags to flip: FEATURE_PRIZE_DRAWS=true, FEATURE_RAFFLE=true
Functions to enable: prizeReveal*, triggerEventRaffle, assignSpinPrize (all have early-return guards)

## What Already Works
- Prize draw event type in schema — implemented
- Spin wheel event type in schema — implemented
- Admin trigger endpoint: POST /api/admin/events/[id]/trigger-raffle — implemented
- Spin wheel endpoint: POST /api/events/[id]/spin — implemented
- Public prize draw + winner pages — implemented, flag-gated
- All Firebase Functions implemented, early-return guards in place

## What P-10 Needs
1. Legal clearance FIRST (do not start coding until CEO confirms)
2. Remove early-returns from prizeReveal*, triggerEventRaffle, assignSpinPrize functions
3. Remove FEATURE_PRIZE_DRAWS guards from event form type options + nav
4. Verify admin event form shows prize_draw and spin_wheel options
5. Test full raffle flow end-to-end on staging

## Unit Tests
- triggerEventRaffle: uses crypto.randomInt (not Math.random — must be cryptographically fair)
- triggerEventRaffle: sets raffleWinnerUserId on event document
- triggerEventRaffle: issues coupon to winner if rafflePrizeCouponId set
- assignSpinPrize: respects spinMaxPerUser (rejects second spin)
- assignSpinPrize: probability matches spinPrizes[].weight distribution
- assignSpinPrize: marks entry.spinUsed=true after first spin

## Playwright Tests
### pw-prize-draws.spec.ts (all 3 viewports)
- Admin creates prize draw event with coupon prize
- 3 buyers enter the draw
- Admin triggers raffle → winner selected
- Winner receives notification + coupon code
- Spin wheel: create spin event → buyer spins → prize revealed → coupon assigned
- Second spin attempt: rejected with "Already spun" error

## Quality Gate
Legal clearance → npm run check + all tests + 24h staging soak → PR → main → deploy
```

---

---

# P-11 PROMPT — Chat / Messaging

```
You are continuing development of LetItRip. P-1 through P-10 deployed and stable.

## Active Patch: P-11 Chat
Branch: patch/p11-chat
Flag to flip: FEATURE_CHAT=true
RTDB paths: chats/{convId}/lastUpdate — will become active

## What Already Works
- conversations collection + conversationsRepository — implemented
- Message API routes — implemented, flag-gated
- Chat UI pages (/user/messages, /store/messages) — implemented, flag-gated
- RTDB ping channel architecture — implemented, flag-gated

## What P-11 Needs
1. RTDB rules update: allow chats/* read/write for authenticated users
2. Remove FEATURE_CHAT guards from chat pages + nav badge + API routes
3. Verify real-time: buyer sends → RTDB ping fires → seller app detects → fetches new messages
4. Rate limit: 100 messages/hour per user (verify or implement in route handler)
5. Unread badge in TitleBar increments on new message, clears on read

## Unit Tests
- appendMessage: writes to conversations/{id} messages array
- appendMessage: writes RTDB ping to chats/{convId}/lastUpdate
- markConversationRead: resets unread count for caller's role
- getConversationList: returns conversations sorted by lastMessageAt desc
- rate limit: 101st message in 1 hour returns 429

## Playwright Tests
### pw-chat.spec.ts (all 3 viewports)
- Buyer opens order detail → clicks "Chat with Seller"
- Buyer types "Hello, when does this ship?" → sends
- Seller's /store/messages shows unread badge
- Seller opens conversation → sees buyer message
- Seller replies "Ships Monday!" → buyer sees reply within 3s
- Unread badge clears after seller opens conversation

## Quality Gate
npm run check + all tests + RTDB rules deployed → green → PR → main → deploy
```

---

---

# P-12 PROMPT — Scammer Registry

```
You are continuing development of LetItRip. P-1 through P-11 deployed and stable.
CRITICAL: Legal review of publication policy required before enabling.

## Active Patch: P-12 Scammer Registry + Trust Score
Branch: patch/p12-scam
Flag to flip: FEATURE_SCAM_REGISTRY=true

## What Already Works
- scammerProfiles collection + scammerRepository — implemented
- Admin scam management UI — implemented, flag-gated
- Public lookup page — implemented, flag-gated
- onScamReportCreate + onScamReportUpdate triggers — implemented, early-return guards

## What P-12 Needs
1. Legal sign-off on auto-notification to admin, no auto-publish policy
2. Remove early-returns from onScamReportCreate + onScamReportUpdate triggers
3. Remove FEATURE_SCAM_REGISTRY guards from public lookup + admin UI + nav
4. Trust badge on public seller profile pages (green/amber/red)
5. Verify no scammer profile is published without admin approval

## Unit Tests
- createScamReport: anonymous submission allowed, status=PENDING
- publishScamProfile: requires admin role
- publishScamProfile: rejects if status is not REVIEWED
- trustScore: green=0 reports, amber=PENDING reports, red=CONFIRMED reports
- lookupByPhone: returns only PUBLISHED profiles
- lookupByUpiVpa: returns only PUBLISHED profiles

## Playwright Tests
### pw-scam-registry.spec.ts (all 3 viewports)
- Public user submits report (phone +919999999999, description "took money, blocked")
- Admin receives notification of new report
- Admin reviews → clicks "Publish" → scammer profile created
- Public user lookups +919999999999 → sees warning "1 confirmed scam report"
- Seller profile for linked seller shows red trust badge

## Quality Gate
Legal clearance → npm run check + all tests → PR → main → deploy
```

---

---

# P-13 PROMPT — Razorpay (Integration)

```
You are continuing development of LetItRip. P-1 through P-12 deployed and stable.
This is an integration patch — Razorpay live credentials required before testing on prod.

## Active Patch: P-13 Razorpay Online Payment
Branch: patch/p13-razorpay
Flag to flip: FEATURE_RAZORPAY=true
Vercel secrets to set: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

## What Already Works
- POST /api/payment/create-order — implemented, flag-gated
- POST /api/payment/verify — implemented, flag-gated
- POST /api/payment/webhook — implemented, flag-gated
- Razorpay client-side modal integration — implemented, flag-gated

## What P-13 Needs
1. Set Razorpay live keys in Vercel (NOT in git — secrets only in Vercel dashboard)
2. Remove FEATURE_RAZORPAY guards from checkout "Pay Online" option + API routes
3. Verify HMAC signature in /api/payment/verify
4. Verify webhook idempotency (re-delivery must not double-credit)
5. Razorpay Payout API for automated seller payouts (replaces manual P-7 process)

## Unit Tests
- createRazorpayOrder: calls Razorpay API with correct amount in paise
- verifyPayment: validates HMAC signature (razorpay_order_id + | + razorpay_payment_id)
- verifyPayment: rejects tampered signature → returns 400
- processWebhook: idempotent — second webhook for same payment_id is no-op
- processWebhook: updates order paymentStatus=PAID

## Playwright Tests
### pw-razorpay.spec.ts (all 3 viewports)
- Buyer selects "Pay Online" at checkout
- Razorpay modal opens (use Razorpay test card 4111 1111 1111 1111)
- Payment processed → modal closes → order confirmed
- Order status in /user/orders shows PAID
- Webhook fires (async) → verify order paymentStatus remains PAID (idempotent)

## Quality Gate
Sandbox test → staging soak 24h → prod smoke (₹1 test order) → PR → main → deploy
```

---

---

# P-14 PROMPT — Shiprocket (Integration)

```
You are continuing development of LetItRip. P-1 through P-13 deployed and stable.
This is an integration patch — Shiprocket credentials required before testing.

## Active Patch: P-14 Shiprocket Auto-ship
Branch: patch/p14-shiprocket
Flag to flip: FEATURE_SHIPROCKET=true
Vercel secrets: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_WEBHOOK_TOKEN

## What Already Works
- shipOrderAction in checkout/actions.ts — implemented, flag-gated
- Shiprocket provider (IShippingProvider) — implemented, flag-gated
- Shipping webhook handler — implemented
- Manual tracking: seller enters carrier + AWB — this STAYS even when flag is on (backward compat)

## What P-14 Needs
1. Set Shiprocket credentials in Vercel
2. Remove FEATURE_SHIPROCKET guards from seller order detail "Ship via Shiprocket" button
3. Verify backward compat: "Manual tracking" option still available when flag=true
4. Test with real pincode pairs on Shiprocket sandbox
5. Register webhook URL in Shiprocket dashboard: POST /api/shipping/webhook

## Unit Tests
- createShiprocketShipment: calls Shiprocket API with correct payload
- createShiprocketShipment: stores awbCode + shipmentId on order
- processShiprocketWebhook: status "Delivered" → order status DELIVERED
- processShiprocketWebhook: status "Out for Delivery" → order status OUT_FOR_DELIVERY
- manualTracking: still works when FEATURE_SHIPROCKET=true (backward compat)

## Playwright Tests
### pw-shiprocket.spec.ts (all 3 viewports)
- Seller sees "Ship via Shiprocket" button on paid order
- Seller clicks → shipment created → AWB number populated
- Tracking URL appears in order detail
- Buyer sees "Out for Delivery" status update (simulate webhook POST)
- Manual tracking: seller enters manual AWB on a different order → still works

## Quality Gate
Shiprocket sandbox test → staging 24h soak → prod smoke → PR → main → deploy
```

---

---

# P-15 PROMPT — Analytics HTTPS Function

```
You are continuing development of LetItRip. P-1 through P-14 deployed and stable.
Enable ONLY after load testing confirms function completes in < 60s.

## Active Patch: P-15 Analytics Function
Branch: patch/p15-analytics
Flag to flip: FEATURE_ANALYTICS_FUNCTION=true

## What Already Works
- analyticsAggregate Firebase Function — implemented, early-return guard
- Admin analytics dashboard charts — may already be coded, check first

## What P-15 Needs
1. Load test analyticsAggregate on staging (run with FEATURE_ANALYTICS_FUNCTION=true, monitor duration)
2. Remove early-return from analyticsAggregate function if load test passes
3. Verify admin dashboard shows GMV, AOV, top sellers, conversion rate charts
4. Confirm function writes to analytics/daily/{date} collection

## Unit Tests
- aggregateGMV: sums only DELIVERED order amounts (not CANCELLED)
- aggregateTopSellers: ranks by GMV descending, top 10
- aggregateConversionRate: orders / page sessions (if sessions data available)
- runAnalytics: writes to analytics/daily/{date} document

## Playwright Tests
### pw-analytics.spec.ts (all 3 viewports)
- (Prerequisite: seed at least 5 DELIVERED orders)
- Admin visits analytics dashboard
- GMV chart shows non-zero value
- Top sellers list shows at least 1 seller
- Date range filter changes chart data

## Quality Gate
Load test (< 60s execution) → npm run check + all tests → PR → main → deploy
```

---

---

# P-16 PROMPT — Tour System (Full Steps)

```
You are continuing development of LetItRip. All previous patches deployed and stable.
Tour button slot (P-1) + TourProvider skeleton (P-1) + driver.js package already in place.

## Active Patch: P-16 Tour System
Branch: patch/p16-tour
No feature flag — always-on UX enhancement

## What Already Works (P-1 setup)
- driver.js installed in appkit/package.json
- TourProvider.tsx skeleton at appkit/src/_internal/client/features/tour/TourProvider.tsx
- onTourStart prop on TitleBarLayout + AppLayoutShell (currently null)
- Tour button slot in TitleBar right cluster (visible only when onTourStart provided)

## What P-16 Needs
1. Wire driver.js into TourProvider (dynamic import, lazy on first click)
2. Define role-specific step sets:
   - CUSTOMER_TOUR_STEPS: 6 steps (nav, search, product, cart, checkout, orders)
   - SELLER_TOUR_STEPS: 7 steps (products, form, orders, ship, settings, analytics, payouts)
   - ADMIN_TOUR_STEPS: 8 steps (orders, verify, moderation, users, stores, analytics, settings, flags)
3. Add data-tour="*" attributes to all target elements
4. startTour(role) loads correct step set and calls drive.drive()
5. Wire non-null onTourStart to AppLayoutShell in consumer layout
6. Verify prefers-reduced-motion: driver.js animate=false when reduced motion

## Unit Tests
- startTour("buyer"): drives CUSTOMER_TOUR_STEPS (6 steps)
- startTour("seller"): drives SELLER_TOUR_STEPS (7 steps)
- startTour("admin"): drives ADMIN_TOUR_STEPS (8 steps)
- driver.js: lazy imported (not in initial bundle — verify with bundle analyzer)
- reducedMotion: animate=false when prefers-reduced-motion=reduce

## Playwright Tests
### pw-tour.spec.ts (all 3 viewports)
- Buyer sees [?] tour button in TitleBar
- Buyer clicks → driver.js loads → step 1 highlights nav
- Buyer clicks "Next" → step 2 highlights search
- Buyer clicks through all 6 steps → tour ends cleanly
- Buyer presses Esc → tour dismissed at any step
- Seller tour: 7 steps traverse correctly
- Admin tour: 8 steps traverse correctly

## Quality Gate
npm run check + all tests → green → PR → main → deploy
```

---

## Patch Prompt Usage Notes

1. **Start fresh session** — paste the entire prompt block, nothing else. Claude Code reads CLAUDE.md automatically but the prompt provides patch-specific context.

2. **Update Current State** — after each Group completes, update the `## Current State` checklist in the P-1 prompt so the next session doesn't re-investigate completed work.

3. **First message after pasting** — just the prompt. No "here's what I need" preamble. The prompt IS the brief.

4. **If a session gets interrupted** — paste the same prompt again in a new session. The Current State section tells the new session what's left. Check `git status` and `git log --oneline -5` to re-orient quickly.

5. **Branching reminder** — P-1 is on `main`. Every other patch starts with `git checkout -b patch/pN-name` from main.

6. **Quality gate is non-negotiable** — `npm run check` must exit 0 before any PR, any deploy, any "done" marker. This is CLAUDE.md Rule #5.
