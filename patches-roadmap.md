# LetItRip — Patch Rollout Roadmap
> Maintained by: Claude (PM role) | CEO: Mohasin | Last updated: 2026-08-08
> Update this file after each patch ships. Tick the [x] when live in production.
>
> **Principle:** Features first, 3rd-party integrations last.
> **Shipping:** Manual only, permanently — Shiprocket was deleted from the codebase
> 2026-08-08 (see P-14, below), not deferred. Seller always enters carrier name +
> tracking ID + optional tracking URL, for every patch, indefinitely.

---

## Patch Status Overview

```
P-1  [x] MVP — Cash/UPI pay, catalogue, seller basics, admin basics, logo fix, layout, analytics  ← LIVE 2026-07-31
P-2  [x] Coupons (admin + seller, no 3rd party)  ← LIVE 2026-08-04
P-3  [x] Blog (read-only, admin-published)  ← LIVE 2026-08-04
P-4  [x] Events (sale/offer announcement types only)  ← LIVE 2026-08-04
P-5  [x] Auctions (bid, settle, winner pays via cash/UPI)  ← LIVE 2026-08-04
P-6  [ ] Pre-orders
P-7  [ ] Seller Payouts (manual UPI — admin records transfer)
P-8  [ ] GST — tax calculation, invoice GST breakup, product HSN code + rate field
P-9  [~] COD — Cash on Delivery. Handling fee (max(₹200, 10%)) LIVE 2026-08-08 as part of
              P-9b; deposit-percent pattern + GST-compliant invoice still open.
P-9b [x] EMI — Installment financing, manual-first provider architecture, art/stickers
              listing types  ← LIVE 2026-08-08 (appkit 3.3.1, not on the original roadmap
              — see new section below)
P-10 [ ] Prize Draws + Spin Wheel
P-11 [ ] Chat / Messaging
P-12 [ ] Scammer Registry + Trust Score
P-13 [ ] Razorpay Online Payment — kept in code (RazorpayProvider), disabled by default
              via siteSettings.payment.razorpayEnabled since 2026-08-08; still needs live
              keys + sandbox test to flip on
P-14 [x] Shiprocket Auto-ship — REMOVED 2026-08-08, not integrated. Decision reversed:
              manual shipping (ManualShippingProvider) is now permanent, see note above.
P-15 [ ] Analytics HTTPS Function (Firebase aggregation)
P-16 [ ] Tour System (full steps — admin, seller, customer)
P-17 [ ] Bundles — bundle listing type CRUD, stock sync, buyer catalogue view
```

---

## Branching Strategy

```
PATCH  BRANCH             MERGE TARGET   AUTO-DEPLOY?   NOTES
────────────────────────────────────────────────────────────────────────────────────
P-1    main               —              NO             MVP work directly on main
P-2+   patch/p{n}-{name}  main (via PR)  NO             All future patches on feature branches

Examples:
  patch/p2-cod
  patch/p3-coupons
  patch/p4-blog
  patch/p6-auctions
  patch/p12-razorpay
```

**Rules:**
1. P-1 goes directly to `main` — it's the baseline
2. Every patch from P-2 onwards is developed on `patch/p{n}-{name}`
3. CI runs automatically on every push to any branch (quality gate + tests) — but NO deploy
4. When patch is ready: open PR from `patch/p{n}` → `main` → CI must be green → CEO/tech review → merge
5. After merge to main: manually trigger "Deploy to Production" GitHub Actions workflow
6. `npm publish` (appkit) is also manual — only done when explicitly asked, never on push
7. Vercel auto-deploy is disabled (`vercel.json` → `"deploymentEnabled": false`) — protects against accidental prod deploys

**Benefit:** Feature branches can accumulate commits, fail CI, be rebased and force-pushed freely — zero risk of accidental deployment or npm publish.

> **2026-08-08 update — practice diverged from this policy, intentionally.** P-9b
> (EMI) was developed and deployed directly on `main`, skipping the `patch/p{n}` /
> PR / CI-gate flow above, per explicit instruction. Going forward: **work stays on
> `main`** — no new `patch/p{n}` branches — verify with `npm run check` before every
> commit, and deploy (Firebase + Vercel) only after that gate is green. This
> supersedes rules 2 and 4 above for all future patches; rules 1, 3, 5, 6, 7 (CI
> still runs, deploys and publishes are still explicit/manual) remain in effect.

---

## GitHub Actions — Feature Toggle (One-Click Deployment)

> **How it works:** Go to GitHub → Actions → "Toggle Feature Flag" → pick feature + enable/disable → Run workflow → Vercel auto-redeploys with new flag.

### `.github/workflows/feature-toggle.yml`
```yaml
name: Toggle Feature Flag
on:
  workflow_dispatch:
    inputs:
      feature:
        description: "Feature to toggle"
        required: true
        type: choice
        options:
          - COD
          - COUPONS
          - BLOG
          - EVENTS
          - AUCTIONS
          - PREORDERS
          - PAYOUTS
          - PRIZE_DRAWS
          - RAFFLE
          - CHAT
          - SCAM_REGISTRY
          - RAZORPAY
          - ANALYTICS_FUNCTION
          # SHIPROCKET removed 2026-08-08 — Shiprocket deleted from the codebase,
          # not just disabled; there is nothing left for this option to toggle.
      enabled:
        description: "Enable or disable?"
        required: true
        type: choice
        options:
          - "true"
          - "false"
jobs:
  toggle:
    runs-on: ubuntu-latest
    steps:
      - name: Update Vercel env var
        run: |
          curl -X PATCH \
            -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"key":"FEATURE_${{ inputs.feature }}","value":"${{ inputs.enabled }}","target":["production"]}' \
            "https://api.vercel.com/v10/projects/${{ secrets.VERCEL_PROJECT_ID }}/env/${{ secrets.VERCEL_FEATURE_ENV_ID }}"
      - name: Trigger Vercel redeploy
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.VERCEL_TOKEN }}" \
            "https://api.vercel.com/v13/deployments" \
            -H "Content-Type: application/json" \
            -d '{"name":"letitrip-in","gitSource":{"type":"github","ref":"main"},"target":"production"}'
```

### `.github/workflows/ci.yml`
Runs on every push to any branch + every PR to main. **Never deploys.** Never publishes.
```yaml
name: CI
on:
  push:
    branches: ["**"]        # all branches — catch errors early on feature branches too
  pull_request:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { submodules: recursive }
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: "npm" }
      - run: npm ci --legacy-peer-deps
      - run: npm run check          # tsc + audits + lint (DOES NOT deploy)
      - run: npm run test           # Vitest unit tests (DOES NOT deploy)
      - run: npm --prefix appkit run test  # appkit Vitest (DOES NOT deploy)
```

### `.github/workflows/deploy-prod.yml`
Only runs when manually triggered from GitHub Actions UI. Requires branch = main to be selected.
```yaml
name: Deploy to Production
on:
  workflow_dispatch:         # MANUAL ONLY — never auto-triggered by push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: main, submodules: recursive }   # always deploy from main
      - uses: actions/setup-node@v4
        with: { node-version: "22", cache: "npm" }
      - run: npm ci --legacy-peer-deps
      - run: npm run check                           # gate before deploy
      - run: npm run test
      - run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      # NOTE: npm publish (appkit) is NOT here — done separately when explicitly asked
```

**GitHub Secrets to set:**
- `VERCEL_TOKEN` — from Vercel account settings
- `VERCEL_PROJECT_ID` — from Vercel project settings
- `VERCEL_FEATURE_ENV_ID` — the ID of the first `FEATURE_*` env var (Vercel assigns IDs; use the env API to list them)

---

## Patch Details

### P-1 — MVP (Bare Minimum)
**Target window:** W1–W4 (extended testing)  
**Risk:** HIGH  
**Status:** [x] **LIVE — deployed 2026-07-31** at https://letitrip.in  
**Feature flags flipped:** None (base features, all `FEATURE_*=false`)

**What ships:**
- Homepage + standard product catalogue (browse, search, filter by category/brand/price)
- Product detail page + image gallery
- Cart (add, qty change, remove, bulk ops)
- User registration + login (email + Google OAuth)
- Checkout with Cash / UPI Manual only
- Post-order payment proof upload (screenshot + transaction ID)
- Admin: order list, payment verification, product moderation, basic user management, analytics dashboard
- Seller: standard products CRUD, order list, mark-as-shipped (manual: carrier name + tracking ID + optional URL)
- Mobile navigation (BottomSheet < 1024px) + desktop sidebar for all 3 dashboard types
- Wishlist (add, bulk remove, bulk add-to-cart)
- Feature flag infrastructure (all disabled features return 404)
- GitHub Actions: CI + feature-toggle + deploy-prod workflows
- Playwright E2E tests (iphone-13 / 390×844, laptop-14 / 1440×900, monitor-30 / 2560×1440)

**Seller shipping in P-1 (and all patches until P-13):**
Seller enters manually:
- Carrier / Courier service name (free text: "DTDC", "India Post", "Delhivery", "Blue Dart", etc.)
- Tracking ID / AWB number
- Tracking URL (optional — seller pastes the courier tracking link)

No Shiprocket, no auto-create. Buyer gets an email notification with the tracking info.

**Go-live checklist:**
- [x] `npm run check` exits 0
- [x] All Vitest tests pass
- [x] All Playwright E2E pass (3 viewports) on staging (66/69 — 3 known skips)
- [x] Firebase indexes deployed + READY (2026-07-31)
- [x] Firebase rules deployed (2026-07-31)
- [x] Firebase Functions deployed (2026-07-31 — all 40+ functions updated)
- [x] Vercel env vars: all `FEATURE_*=false`
- [ ] GitHub Actions CI green on main branch (CI workflow disabled — manual deploy only)
- [ ] GitHub Secrets set (VERCEL_TOKEN, VERCEL_PROJECT_ID) — manual step, CEO
- [x] `vercel --prod` → Vercel prod deploy (2026-07-31, appkit 3.2.3)
- [x] Post-deploy happy-path smoke on `https://letitrip.in`

**Rollback:** Vercel dashboard → Deployments → Promote previous deployment

---

### P-2 — Coupons
**Branch:** `patch/p2-coupons`  
**Target window:** W5–W6  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_COUPONS=true`  
**Dependency:** P-1 stable for 2+ weeks

#### Sequence Diagram

```
BUYER            APP               FIRESTORE        ADMIN / SELLER
  │                │                    │                  │
  │  /checkout     │                    │                  │
  │  enters code   │                    │                  │
  │ "SAVE10" ─────>│ validateCoupon()──>│ coupons/SAVE10   │
  │                │<─ coupon doc ──────│                  │
  │                │ check: active,     │                  │
  │                │ expiry, perUser-   │                  │
  │                │ Limit, scope ──────│                  │
  │<─ discount ────│                    │                  │
  │  applied in    │                    │                  │
  │  order summary │                    │                  │
  │                │                    │                  │
  │  confirm order │                    │                  │
  │ ──────────────>│ createOrder() ────>│ orders/{id}      │
  │                │ applyCoupon() ─────│ usage++          │
  │<─ order created│                    │                  │
  │                │                    │                  │
  │                │  Admin creates coupon                 │
  │                │<──────────── POST /api/admin/coupons ─│
  │                │ createCoupon()────>│ coupons/{id}     │
  │                │                    │                  │
  │                │  Seller creates (seller-scoped)       │
  │                │<──── POST /api/store/coupons ─────────│
  │                │ createSellerCoupon>│ coupons/{id}     │
  │                │                   (sellerId scoped)   │
```

#### Use Cases Added

- **UC-B-C1:** Buyer enters coupon code at checkout → sees discount applied
- **UC-A-C1:** Admin creates admin-scoped coupon (WELCOME10, FREESHIP, etc.)
- **UC-A-C2:** Admin deactivates or edits coupon
- **UC-S-C1:** Seller creates seller-scoped coupon for their store
- **UC-S-C2:** Seller views coupon usage stats

#### What ships
- Coupon code entry field in `CheckoutRouteClient.tsx` (currently hidden by flag)
- Admin coupon create/edit/deactivate UI (already coded in admin panel)
- Seller coupon create UI (already coded in store panel)
- Usage tracking + per-user limit enforcement via `couponsRepository.applyCoupon()` (already implemented)
- Audit: verify `FEATURE_COUPONS` guard on `/api/admin/coupons/*` and `/api/store/coupons/*`

#### Implementation TODO
- [ ] Add `FEATURE_COUPONS` guard to checkout UI (hide coupon field when false)
- [ ] Add `FEATURE_COUPONS` guard to all coupon API routes
- [ ] E2E: `pw-coupons.spec.ts` — create coupon → apply → verify discount → verify usage count
- [ ] Playwright spec on all 3 viewports

**Pre-flip checklist:**
- [ ] Create 1 real welcome coupon (e.g., WELCOME10) via admin UI in prod
- [ ] Smoke: apply coupon → discount reflected → order total correct → usage count incremented
- [ ] PR to main → CI green → "Deploy to Production" triggered

---

### P-3 — Blog (Read-Only)
**Branch:** `patch/p3-blog`  
**Target window:** W7–W8  
**Risk:** LOW  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_BLOG=true`  
**Dependency:** P-1 stable (no payment dependency)

#### Sequence Diagram

```
ADMIN           APP              FIRESTORE
  │               │                  │
  │ Create post   │                  │
  │ ─────────────>│ createBlogPost() >│ blogPosts/{id} status=draft
  │               │                  │
  │ Publish       │                  │
  │ ─────────────>│ publishPost() ──>│ status=published, publishedAt=now
  │               │                  │
PUBLIC            │                  │
  │ /blog ───────>│ listBlogPosts()─>│ where(status=published)
  │<─ post list ──│<─ posts[] ───────│
  │               │                  │
  │ /blog/[slug]─>│ getBlogPost()──>│ where(slug=X)
  │<─ detail ─────│<─ post doc ──────│ (rich HTML content)
  │               │                  │
  │ (SEO: generateMetadata from doc, │
  │  OG image from coverImage)       │
```

#### Use Cases Added

- **UC-A-BL1:** Admin creates/edits/drafts/publishes a blog post
- **UC-A-BL2:** Admin unpublishes (reverts to draft)
- **UC-PUB-BL1:** Public user reads blog listing (paginated)
- **UC-PUB-BL2:** Public user reads blog post detail (rich content + OG meta)
- **UC-PUB-BL3:** Public user shares blog post URL (SEO-friendly slug)

#### What ships
- Public blog listing `/blog` + detail `/blog/[slug]` (already coded, flag-gated)
- Admin create/edit/publish/draft (`/admin/blog`)
- SEO metadata generation + OG image per post

#### Implementation TODO
- [ ] Confirm `FEATURE_BLOG` guard is on navigation links + API routes
- [ ] E2E: `pw-blog.spec.ts` — admin creates + publishes → public reads
- [ ] At least 3 posts written before enabling

**Pre-flip checklist:**
- [ ] At least 3 real blog posts published via admin
- [ ] OG meta visible in page source for each post
- [ ] Smoke: blog listing loads, detail renders rich HTML, images served via `/api/media/`

---

### P-4 — Events (Sale/Offer Types Only)
**Branch:** `patch/p4-events`  
**Target window:** W9–W10  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_EVENTS=true`  
**Dependency:** P-3 stable

#### Sequence Diagram

```
ADMIN           APP              FIRESTORE          BUYER
  │               │                  │                 │
  │ Create event  │                  │                 │
  │ type=sale/offer│                 │                 │
  │ ─────────────>│ createEvent() ──>│ events/{id}     │
  │               │                  │  status=upcoming│
  │               │                  │                 │
  │ Set active    │                  │                 │
  │ ─────────────>│ activateEvent()─>│ status=active   │
  │               │                  │  startsAt, endsAt│
  │               │                  │                 │
  │               │ Homepage picks up event banner     │
  │               │ homepageSections  │                 │
  │               │ type=events-feed─>│                 │
  │               │<─ active events ─│                 │
  │               │                  │                 │
  │               │ ─────────────────────────────────>│
  │               │ Buyer sees event card + countdown  │
  │               │                  │                 │
  │               │ ─────────────────────────────────>│
  │               │ /events/[id] ─── event detail      │
  │               │                  │                 │
  │ Timer expires  │                  │                 │
  │               │ onSchedule: set status=ended       │
  │               │ (or admin ends manually)           │
```

#### Use Cases Added

- **UC-A-EV1:** Admin creates a `sale` or `offer` event with start/end time
- **UC-A-EV2:** Admin activates event → appears in homepage + /events
- **UC-A-EV3:** Admin ends event manually (or timer auto-ends)
- **UC-PUB-EV1:** Buyer sees event countdown banner on homepage
- **UC-PUB-EV2:** Buyer views event detail (sale products, offer terms)
- **UC-PUB-EV3:** Buyer shares event URL

#### What ships
- Events of type `sale` and `offer` only (announcement + countdown timer)
- Event listing `/events` + detail `/events/[id]`
- Admin create/edit/activate events (type dropdown limited to sale/offer when `FEATURE_RAFFLE=false`)
- Homepage events feed section (already coded, just hidden)
- Raffle/poll/survey/spin wheel event types remain disabled

#### Implementation TODO
- [ ] Guard admin event form: hide raffle/poll/spin types when `FEATURE_PRIZE_DRAWS=false`
- [ ] `FEATURE_EVENTS` guard on navigation + `/api/events/*`
- [ ] E2E: `pw-events.spec.ts` — create → activate → buyer sees banner + countdown

**Pre-flip checklist:**
- [ ] Create 1 real sale event via admin in prod
- [ ] Smoke: event visible on homepage, countdown timer ticks correctly
- [ ] Smoke: event detail shows correct products/offer text

---

### P-5 — Auctions
**Branch:** `patch/p5-auctions`  
**Target window:** W11–W15  
**Risk:** HIGH  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_AUCTIONS=true`  
**Dependency:** P-4 stable

#### Sequence Diagram

```
SELLER       APP             FIRESTORE         BUYER-A      BUYER-B      FIREBASE FN
  │            │                 │                │             │              │
  │ Create     │                 │                │             │              │
  │ auction    │                 │                │             │              │
  │ listing    │                 │                │             │              │
  │ ──────────>│ createProduct()>│ products/      │             │              │
  │            │                 │ auction-{slug} │             │              │
  │            │                 │ listingType=   │             │              │
  │            │                 │ "auction"      │             │              │
  │            │                 │ closingAt=...  │             │              │
  │            │                 │                │             │              │
  │            │ /auctions listing visible       │             │              │
  │            │ ─────────────────────────────────>│            │              │
  │            │                 │                │             │              │
  │            │ Buyer-A places bid              │             │              │
  │            │<──────────────── POST /api/bid ─│             │              │
  │            │ createBid() ───>│ bids/{id}      │             │              │
  │            │                 │ amount=1500    │             │              │
  │            │<─ bid accepted ─│                │             │              │
  │            │ ──────────────────────────────────────────────>│ notify outbid│
  │            │                 │                │             │              │
  │            │ Buyer-B places higher bid        │             │              │
  │            │<──────────────────────────────── POST /api/bid│              │
  │            │ createBid() ───>│ bids/{id}      │             │              │
  │            │                 │ amount=2000    │             │              │
  │            │ notify Buyer-A outbid ──────────>│             │              │
  │            │                 │                │             │              │
  │            │ closingAt passes│                │             │              │
  │            │                 │──── auctionSettlement runs (every 15min)──>│
  │            │                 │<─ winner=Buyer-B, status=closed ───────────│
  │            │                 │                │             │              │
  │            │ notify winner ─────────────────────────────────>│             │
  │            │ notify seller ─>│                │             │              │
  │            │                 │                │             │              │
  │            │ Buyer-B pays via Cash/UPI (same P-1 flow)       │             │
  │            │<──────────────────────────────── /orders/[id]/payment ───────│
```

#### Use Cases Added

- **UC-S-AU1:** Seller creates auction listing with starting price + closing time
- **UC-B-AU1:** Buyer places a bid on an active auction
- **UC-B-AU2:** Buyer gets notified when outbid
- **UC-B-AU3:** Winning buyer pays via Cash/UPI (same flow as P-1)
- **UC-A-AU1:** Admin moderates auction listings
- **UC-SYS-AU1:** `auctionSettlement` function auto-closes expired auctions + notifies winner/seller

#### What ships
- Auction listing type in seller product form (currently hidden by flag)
- Public auctions catalogue `/auctions` + detail with live bid UI
- Real-time bid updates via Firestore listener
- `auctionSettlement` Firebase Function enabled (flag removed from early-return)
- `onBidPlaced` Firestore trigger enabled (bid notification to seller, outbid to previous bidder)
- Auction countdown timer

#### Implementation TODO
- [ ] Remove early-return from `auctionSettlement` function (siteSettings flag)
- [ ] Remove early-return from `onBidPlaced` trigger
- [ ] `FEATURE_AUCTIONS` guard on seller product form + `/api/auction/*` + nav links
- [ ] E2E: `pw-auctions.spec.ts` — create → bid → outbid notification → close → winner flow

**Pre-flip checklist:**
- [ ] `auctionSettlement` function flag enabled in siteSettings
- [ ] `onBidPlaced` trigger flag enabled in siteSettings
- [ ] At least 1 test auction created and run end-to-end on staging
- [ ] Smoke: create → bid → timer expires → winner notified → pays via cash

---

### P-6 — Pre-orders
**Branch:** `patch/p6-preorders`  
**Target window:** W16–W18  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_PREORDERS=true`  
**Dependency:** P-5 stable

#### Sequence Diagram

```
SELLER       APP             FIRESTORE         BUYER
  │            │                 │                │
  │ Create     │                 │                │
  │ pre-order  │                 │                │
  │ listing    │                 │                │
  │ depositPct │                 │                │
  │ =20%, ETA  │                 │                │
  │ 2026-09-01 │                 │                │
  │ ──────────>│ createProduct()>│ products/      │
  │            │                 │ preorder-{slug}│
  │            │                 │ listingType=   │
  │            │                 │ "pre-order"    │
  │            │                 │                │
  │            │ /pre-orders visible ────────────>│
  │            │                 │                │
  │            │ Buyer places pre-order           │
  │            │<────────────────── POST /checkout│
  │            │ createOrder()──>│ orders/{id}    │
  │            │                 │ type=preorder  │
  │            │                 │ depositAmount= │
  │            │                 │ total*0.20     │
  │            │<─ redirect to payment page       │
  │            │                 │                │
  │            │ Buyer pays deposit (Cash/UPI flow)│
  │            │<────────────────────────────────>│
  │            │                 │ paymentStatus  │
  │            │                 │ =DEPOSIT_PAID  │
  │            │<─ notify seller │                │
  │            │                 │                │
  │ Stock arrives (external, manual)              │
  │ Seller updates status → READY_TO_SHIP        │
  │ ──────────>│ patchOrder()──>│ status=PROCESSING│
  │            │                 │                │
  │ Seller ships (manual carrier + AWB)           │
  │ ──────────>│ patchOrder()──>│ status=SHIPPED │
  │            │ notify buyer──────────────────>  │
```

#### Use Cases Added

- **UC-S-PO1:** Seller creates pre-order listing with deposit % + ETA date
- **UC-B-PO1:** Buyer places pre-order and pays deposit (Cash/UPI)
- **UC-B-PO2:** Buyer sees ETA and production status updates
- **UC-S-PO2:** Seller marks pre-order ready to ship when stock arrives
- **UC-A-PO1:** Admin views all active pre-orders

#### What ships
- Pre-order listing type in seller product form
- Pre-order catalogue `/pre-orders` + detail page
- Deposit payment flow at checkout (percentage configurable per product)
- Delivery ETA display
- Seller status updates (PROCESSING → SHIPPED)

#### Implementation TODO
- [ ] `FEATURE_PREORDERS` guard on seller product form + `/api/preorder/*` + nav
- [ ] Schema: confirm `depositPercent` field exists on `ProductDocument`
- [ ] E2E: `pw-preorders.spec.ts` — create → buyer deposits → seller ships

**Pre-flip checklist:**
- [ ] At least 1 test pre-order created on staging with 20% deposit
- [ ] Smoke: buyer places pre-order → pays 20% deposit → delivery date displayed → seller marks shipped

---

### P-7 — Seller Payouts (Manual UPI)
**Branch:** `patch/p7-payouts`  
**Target window:** W19–W22  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_PAYOUTS=true`  
**Dependency:** P-6 stable

#### Sequence Diagram

```
SELLER          APP               FIRESTORE           ADMIN
  │               │                    │                 │
  │               │                    │                 │
  │               │  Admin triggers payout batch        │
  │               │<────────────── POST /api/admin/payouts/calculate
  │               │ payoutBatch()──────│                 │
  │               │ calculate eligible │                 │
  │               │ amounts per seller │                 │
  │               │ (DELIVERED orders) │                 │
  │               │────────────────────>│ payouts/{id}   │
  │               │                    │ status=PENDING  │
  │               │                    │ amount=X        │
  │               │                    │                 │
  │               │ Admin sees payout queue              │
  │               │<────────── GET /api/admin/payouts    │
  │               │<──── payouts[] ────│                 │
  │               │ ─────────────────────────────────────>│
  │               │                    │                 │
  │               │ MANUAL: Admin opens their UPI app,   │
  │               │ transfers ₹X to seller UPI VPA       │
  │               │                    │                 │
  │               │ Admin records reference              │
  │               │<────────── PATCH /api/admin/payouts/[id]
  │               │ markPayoutPaid()───>│ status=PAID    │
  │               │                    │ transactionRef  │
  │               │ notify seller────────────────────────>│ ──> notify
  │               │                    │                 │
  │<─ notification: "Payout ₹X received" ─────────────────│
  │               │                    │                 │
  │ /user/payouts │                    │                 │
  │ ─────────────>│ listPayouts()──────>│                │
  │<─ payout list │<─ payouts[] ───────│                 │
```

#### Use Cases Added

- **UC-A-PAY1:** Admin triggers payout batch calculation
- **UC-A-PAY2:** Admin views pending payouts per seller
- **UC-A-PAY3:** Admin manually transfers via UPI and records transaction reference
- **UC-A-PAY4:** Admin marks payout as PAID
- **UC-S-PAY1:** Seller views payout history (amount, status, transaction ref)
- **UC-S-PAY2:** Seller receives notification when payout is processed

#### What ships
- Admin payout management: view pending amounts per seller, manually record UPI transfer
- Admin marks payout PAID with UPI transaction reference
- `payoutBatch` function: calculates eligible amounts (DELIVERED orders only) — admin triggers manually
- Seller payout history page (`/store/payouts`)

**No Razorpay Payout API** — admin transfers via personal UPI app and records the reference. Automated payouts come in P-13.

#### Implementation TODO
- [ ] Remove early-return from `payoutBatch` function
- [ ] `FEATURE_PAYOUTS` guard on admin + seller payout pages + API routes
- [ ] Admin UI: payout list with "Mark as Paid" + transaction ref input
- [ ] E2E: `pw-payouts.spec.ts` — trigger batch → admin marks paid → seller sees payout

**Pre-flip checklist:**
- [ ] `payoutBatch` flag enabled in siteSettings
- [ ] At least 1 payout manually recorded in admin on staging
- [ ] Smoke: admin sees seller earned amount → records manual UPI transfer → seller sees payout history

---

### P-8 — GST (Indian Tax Compliance)
**Branch:** `patch/p8-gst`  
**Target window:** W23–W26  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_GST=true`  
**Dependency:** P-7 stable (GST must be live before COD to ensure compliant invoices)

#### Sequence Diagram

```
ADMIN       APP            FIRESTORE       CHECKOUT ENGINE         INVOICE PDF
  │           │                 │                 │                     │
  │ Configure │                 │                 │                     │
  │ GST setup │                 │                 │                     │
  │ GSTIN,    │                 │                 │                     │
  │ legalName │                 │                 │                     │
  │ ─────────>│ saveSettings()─>│ siteSettings    │                     │
  │           │                 │ gst.gstin=...   │                     │
  │           │                 │                 │                     │
  │ Set HSN + │                 │                 │                     │
  │ GST rate  │                 │                 │                     │
  │ on product│                 │                 │                     │
  │ ─────────>│ updateProduct()>│ products/{id}   │                     │
  │           │                 │ hsnCode="9503"  │                     │
  │           │                 │ gstRate=18      │                     │
  │           │                 │                 │                     │
BUYER         │                 │                 │                     │
  │ Checkout  │                 │                 │                     │
  │ ─────────>│─────────────────────────────────>│                     │
  │           │                 │                 │                     │
  │           │                 │ compare buyer pincode vs seller state│
  │           │                 │ intra-state → CGST(9%) + SGST(9%)   │
  │           │                 │ inter-state → IGST(18%)              │
  │           │                 │                 │                     │
  │           │                 │<─ order with ───│                     │
  │           │                 │  gstAmount,cgst │                     │
  │           │                 │  sgst,igst      │                     │
  │<─ order summary showing tax breakup           │                     │
  │           │                 │                 │                     │
  │           │ /api/orders/[id]/invoice           │                     │
  │ ─────────>│─────────────────────────────────────────────────────>  │
  │           │                 │                 │ generateInvoice()   │
  │           │                 │                 │ GSTIN, HSN, CGST/  │
  │           │                 │                 │ SGST/IGST breakup  │
  │<─ PDF invoice (Rule 46 compliant) ─────────────────────────────────│
```

#### Use Cases Added

- **UC-A-GST1:** Admin configures GSTIN, legal name, registered address in site settings
- **UC-A-GST2:** Admin/seller sets HSN code + GST rate on each product
- **UC-SYS-GST1:** Checkout engine calculates CGST/SGST (intra-state) or IGST (inter-state)
- **UC-B-GST1:** Buyer sees tax breakdown in order summary and invoice
- **UC-S-GST1:** Seller views monthly GST collected report
- **UC-A-GST3:** Admin downloads GST-compliant invoice per order

#### What ships

**Schema (appkit):**
- `ProductDocument`: `gstRate: 0 | 5 | 12 | 18 | 28` + `hsnCode?: string`
- `OrderDocument`: `gstAmount`, `cgst`, `sgst`, `igst`, `taxableAmount` (all in paise)
- `SiteSettingsDocument`: `gst: { enabled, gstin, legalName, address }`

**Business logic:**
- Intra-state: CGST(rate/2) + SGST(rate/2). Inter-state: IGST(rate)
- Platform fee: 18% GST on commission
- Computed at checkout in `createCheckoutOrderAction` based on product HSN rate + pincode comparison

**Admin:** GSTIN + legal name in site settings; GST rate + HSN on product form  
**Invoice:** GSTIN, HSN, taxable amount, CGST/SGST/IGST breakup, grand total (Rule 46 compliant)  
**Seller:** GST collected report per month

#### Implementation TODO
- [ ] Schema changes in appkit (ProductDocument + OrderDocument + SiteSettings)
- [ ] Tax calculation helper: `calculateGst(rate, intraState, amount)` in appkit shared
- [ ] Wire tax calc into `createCheckoutOrderAction`
- [ ] Update invoice PDF generator to include GST fields
- [ ] Admin form: GST settings section in site settings
- [ ] Product form: HSN code + GST rate dropdown
- [ ] E2E: `pw-gst.spec.ts` — create product with HSN → checkout → invoice shows breakup

**Pre-flip checklist:**
- [ ] GSTIN registered and entered in site settings
- [ ] All standard products have GST rates set (admin bulk-update)
- [ ] Test invoice: verify GSTIN, HSN, CGST/SGST/IGST correct on PDF
- [ ] Legal sign-off on invoice format (Rule 46 of GST Rules 2017)

---

### P-9 — COD (Cash on Delivery with Deposit + Fee)
**Branch:** `patch/p9-cod`  
**Target window:** W27–W30  
**Risk:** MEDIUM  
**Status:** [~] Partially live — see note  
**Feature flag:** `FEATURE_COD=true`  
**Dependency:** P-8 must be live (COD invoices must be GST-compliant)

> **2026-08-08 update:** the COD handling fee shipped ahead of this patch's original
> schedule, as part of P-9b (EMI), and landed with a **different formula** than planned
> below — actual: `max(₹200, subtotal × 10%)` (`OrderDocument.codHandlingFee`,
> `appkit/src/_internal/shared/fees/calculator.ts`), not the flat ₹49 + 18% GST sketched
> in the sequence diagram and business logic below. The deposit-percent pattern and the
> GST-compliant invoice line-item work described below are still not built — P-8 (GST)
> is still `[ ]`. Treat the diagram below as the original plan, now partially superseded.

#### Sequence Diagram

```
BUYER       APP             FIRESTORE       SELLER          DELIVERY AGENT
  │           │                 │               │                  │
  │ /checkout │                 │               │                  │
  │ select COD│                 │               │                  │
  │ ─────────>│                 │               │                  │
  │           │ Load COD config:│               │                  │
  │           │ depositPct=20%  │               │                  │
  │           │ codFee=₹49      │               │                  │
  │           │                 │               │                  │
  │<─ order summary:            │               │                  │
  │   Item total: ₹1000         │               │                  │
  │   COD Fee: ₹49 + GST ₹8.82 │               │                  │
  │   Pay now (deposit 20%): ₹211.56            │                  │
  │   Pay on delivery: ₹846.26  │               │                  │
  │           │                 │               │                  │
  │ Confirm   │                 │               │                  │
  │ ─────────>│ createOrder()──>│ orders/{id}   │                  │
  │           │                 │ paymentMethod │                  │
  │           │                 │ =cod          │                  │
  │           │                 │ depositAmount │                  │
  │           │                 │ codFeeAmount  │                  │
  │           │                 │ paymentStatus │                  │
  │           │                 │ =DEPOSIT_PAID │                  │
  │           │                 │               │                  │
  │ Buyer pays deposit (Cash/UPI screenshot flow from P-1)         │
  │ ─────────────────────────────────────────────────────────────> │
  │           │                 │               │                  │
  │           │ notify seller ─────────────────>│                  │
  │           │                 │               │                  │
  │ Seller ships (manual)       │               │                  │
  │ ──────────────────────────────────────────>│                   │
  │           │                 │ order{SHIPPED}│                  │
  │           │                 │               │                  │
  │ Package delivered            │               │                  │
  │ ─────────────────────────────────────────────────────────────>│
  │           │                 │               │                  │
  │           │ MANUAL: Admin marks COD collected (after seller confirms)
  │           │<──────────────── PATCH /api/admin/orders/[id]     │
  │           │                 │ status=DELIVERED                 │
  │           │                 │ remainingAmountCollected=true    │
  │<─ notification: "Order delivered"                              │
```

#### Use Cases Added

- **UC-B-COD1:** Buyer selects COD at checkout → sees deposit + COD fee breakdown
- **UC-B-COD2:** Buyer pays deposit via Cash/UPI screenshot (reuses P-1 flow)
- **UC-S-COD1:** Seller ships COD order (same manual tracking as P-1)
- **UC-A-COD1:** Admin marks COD amount collected after delivery confirmation from seller
- **UC-A-COD2:** Admin configures COD fee (₹) and deposit % in site settings
- **UC-SYS-COD1:** Invoice shows COD fee + 18% GST on COD fee as separate line item

#### What ships

**Schema (appkit):**
- `OrderDocument`: `codFeeAmount?: number` (paise — the extra COD handling charge)
- `SiteSettingsDocument`: `codFee: number` (e.g., 4900 = ₹49) + existing `codDepositPercent`

**Business logic:**
- Collect deposit + COD fee upfront at checkout (screenshot proof same as P-1)
- COD fee: flat ₹49 (configurable) + 18% GST on the fee
- Remaining amount shown to buyer as "Pay on delivery: ₹X"

**Admin:** COD fee + deposit % editable in site settings  
**Invoice:** COD fee + GST as separate line item (GST-compliant)

#### Implementation TODO
- [ ] Schema: add `codFeeAmount` to `OrderDocument`
- [ ] Schema: add `codFee` to site settings
- [ ] Checkout: show COD fee + deposit breakdown when COD selected
- [ ] `codEnabled` guard already exists in checkout action — just flip the flag
- [ ] Invoice PDF: add COD fee line item with GST
- [ ] E2E: `pw-cod.spec.ts` — COD checkout → deposit paid → shipped → delivered + collected

**Pre-flip checklist:**
- [ ] COD fee amount set in site settings (e.g., ₹49)
- [ ] COD deposit % confirmed (e.g., 20%)
- [ ] GST on COD fee at 18% verified in invoice PDF
- [ ] Smoke: COD checkout → deposit amount correct → invoice shows all breakdowns
- [ ] Legal: confirm deposit collection + COD fee + GST on fee are compliant

---

### P-9b — EMI (Installment Financing) + Manual-First Provider Architecture + Art/Stickers

**Branch:** none — shipped directly on `main`, deployed 2026-08-08 per explicit
instruction (this patch predates the branch-per-patch convention above; going forward,
work continues directly on `main`, deploying after each verified change rather than
opening `patch/p{n}` branches)  
**Target window:** N/A — not on the original roadmap, added 2026-08-08  
**Risk:** MEDIUM (financial math + payout timing)  
**Status:** [x] LIVE — 2026-08-08 (appkit 3.3.0 → 3.3.1, Vercel prod, Firestore
indexes/rules, Firebase Functions all deployed)  
**Feature flag:** `siteSettings.emi.enabled` (site-wide) + `StoreDocument.emiEnabled`
(per-seller opt-in) — both must be true, in addition to the ₹10,000 per-seller-checkout
subtotal threshold  
**Dependency:** none — built on the new manual-first `IPaymentProvider`/
`IShippingProvider` abstract-class architecture shipped in the same commit (Shiprocket
removed entirely; Razorpay kept, disabled by default)

#### What shipped in this patch

- **Provider architecture:** `IPaymentProvider`/`IShippingProvider` converted from plain
  interfaces to abstract classes. `ManualPaymentProvider` + `ManualShippingProvider` are
  now the defaults. `RazorpayProvider` stays fully implemented, gated behind
  `siteSettings.payment.razorpayEnabled` (default `false`). Shiprocket — code, schema
  fields, webhook route, and seed data — deleted outright, not disabled.
- **EMI engine:** eligibility + schedule math (`appkit/src/_internal/shared/features/emi/schedule.ts`),
  `OrderDocument` installment fields, checkout tenure picker, per-installment manual
  proof-of-payment collection (`PATCH /api/store/orders/[id]/emi-installment`), a
  shipment gate (`assertEmiShippable` — blocks `customShipOrder` on an unpaid EMI order
  unless every item has `product.allowShipBeforeEmiComplete`), per-installment payout
  holds (`autoPayoutEligibility.ts` skips `emiEnabled && !emiComplete` orders), and a
  scheduled Firebase Function (`emiInstallmentReminder`, `asia-south1`) that nudges
  buyers ahead of each due date and flips overdue installments.
- **Shared fee calculator:** `appkit/src/_internal/shared/fees/calculator.ts` — COD
  handling fee (`max(₹200, subtotal × 10%)`) plus the platform-commission math that was
  previously duplicated across checkout, refunds, and the payout jobs.
- **New listing types:** `art` and `stickers` — registered through the listing-type
  plugin registry (`pluginFor()`), shared optional print-meta block (size, material,
  finish, edition size), admin + seller list/edit pages, public routes.
- **Auth/RBAC verification pass** (Rule #4/#2 — re-verified this session, not assumed):
  fixed a double-session-creation bug in `useRegister()`, a Google-OAuth popup that hung
  forever if the user closed it manually, a secret (password-reset link) that was being
  logged server-side, an `audit-inline-role-check.mjs` regex blind spot that let ~24
  inline `user!.role === "x"` compares slip past the audit undetected, and 6 store
  product API routes that were byte-identical copies of an unrelated barcode-scan stub.
- **EMI seller opt-in toggle** (closed same-day, appkit 3.3.1): `StoreDocument.emiEnabled`
  originally had no writer anywhere in the codebase — EMI's backend was fully live but
  unreachable by any seller. Fixed via `PATCH /api/store/payout-settings` + a Toggle in
  `SellerPayoutSettingsView` (Preferences step).

#### Sequence Diagram

See **[asciiDiagrams.md § O5b — EMI (installment financing) sequence](asciiDiagrams.md#o5b--emi-installment-financing-sequence-2026-08-08)**
for the full buyer→checkout→order→reminder→seller→shipment-gate→payout flow, and
**[§ O5 — Shipping provider architecture](asciiDiagrams.md#o5--shipping-provider-architecture-manual-first-2026-08-08)**
for the manual-shipping replacement of the old Shiprocket auto-create flow.

#### Use Cases Added

- **UC-B-EMI1:** Buyer checking out with a per-seller subtotal over ₹10,000, from a
  seller who has EMI enabled, sees a tenure picker (2–6 months) with computed token
  amount and monthly installment.
- **UC-B-EMI2:** Buyer pays each installment manually (UPI/bank transfer + proof upload)
  ahead of its due date; gets a reminder 3 days out, and an overdue notice if missed.
- **UC-S-EMI1:** Seller opts their store into EMI from Payout Settings.
- **UC-S-EMI2:** Seller marks an installment paid after verifying the buyer's transfer.
- **UC-S-EMI3:** Seller cannot ship an EMI order until every installment is paid, unless
  they've flagged the specific product `allowShipBeforeEmiComplete`.
- **UC-SYS-EMI1:** Scheduled Function reminds buyers of upcoming/overdue installments
  and flips overdue installments' status automatically.
- **UC-SYS-EMI2:** Payout jobs hold an EMI order's payout until `emiComplete`, then
  release per the shared fee calculator's platform/seller surcharge split.

#### Implementation TODO (remaining, not yet done)

- [ ] Admin-facing `⑮ EMI` settings tab in `AdminSiteSettingsView` — `siteSettings.emi`
      is seeded with defaults and fully read by checkout + the reminder job, but has
      **no editor UI yet**; today the only way to tune tenure options, token %, billing
      day, or surcharge split is a direct Firestore edit. See
      [asciiDiagrams.md's flagged gap](asciiDiagrams.md#admin--site-settings--va8--13-groups)
      under "Site Settings" TAB list.
- [ ] `pw-emi.spec.ts` E2E: checkout with EMI → mark installment paid → early-ship block
      → flip `allowShipBeforeEmiComplete` → ship succeeds.
- [ ] Manual browser walkthrough of the full EMI lifecycle (seed → checkout → mark paid
      → ship gate → payout) — not yet performed this session.

---

### P-10 — Prize Draws + Spin Wheel
**Branch:** `patch/p10-prize-draws`  
**Target window:** W31–W36  
**Risk:** HIGH  
**Status:** [ ] Not started  
**Feature flags:** `FEATURE_PRIZE_DRAWS=true`, `FEATURE_RAFFLE=true`  
**Dependency:** P-2 (coupons live — prize draws issue coupon codes as prizes)

#### Sequence Diagram

```
ADMIN       APP              FIRESTORE       BUYER        FIREBASE FN
  │           │                  │              │               │
  │ Create    │                  │              │               │
  │ prize draw│                  │              │               │
  │ event     │                  │              │               │
  │ ─────────>│ createEvent()──>│ events/{id}  │               │
  │           │                 │ type=prize_draw               │
  │           │                 │ status=active │               │
  │           │                 │               │               │
  │           │ Public prize draw listing ─────>│               │
  │           │                 │               │               │
  │           │ Buyer enters draw               │               │
  │           │<───────────────── POST /api/events/[id]/enter  │
  │           │ createEventEntry()─>│           │               │
  │           │                 │ eventEntries/{id}             │
  │           │                 │ status=CONFIRMED              │
  │<─ notification: "Entry confirmed"           │               │
  │           │                 │               │               │
  │ Admin triggers raffle (after event ends)   │               │
  │<────────── POST /api/admin/events/[id]/trigger-raffle      │
  │           │──────────────────────────────────────────────>│
  │           │                 │ triggerEventRaffle()          │
  │           │                 │ crypto.randomInt(pool)        │
  │           │                 │ winner = entry[idx]           │
  │           │                 │<─ events/{id} updated         │
  │           │                 │   raffleWinnerUserId=...      │
  │           │                 │                               │
  │           │ Winner gets coupon code                         │
  │           │<────────────────────────────────────────────── │
  │           │                 │ couponUsage/{winnerId}        │
  │           │ notify winner ──────────────────>│             │
  │           │   "You won! Coupon: WIN123"      │             │
```

**Spin Wheel flow:**
```
BUYER       APP             FIRESTORE
  │           │                 │
  │ Event page│                 │
  │ type=spin_│                 │
  │ wheel     │                 │
  │ ─────────>│ getEvent()────>│ events/{id}
  │           │                │ spinPrizes[]: prizes
  │           │                │ spinMaxPerUser=1
  │           │                │
  │<─ Spin Wheel UI (driver.js animation)
  │           │                │
  │ Spin! ───>│ POST /api/events/[id]/spin
  │           │ assignSpinPrize()──>│
  │           │                │ entry.spinUsed=true
  │           │                │ entry.spinPrizeId=X
  │           │                │ entry.spinPrizeCouponCode=Y
  │<─ "You won: [prize name]!" │
```

#### Use Cases Added

- **UC-A-PD1:** Admin creates prize draw event with coupon prizes
- **UC-A-PD2:** Admin triggers raffle draw (crypto.randomInt — fair selection)
- **UC-A-PD3:** Admin creates spin wheel event with prize distribution weights
- **UC-B-PD1:** Buyer enters prize draw (single entry per event)
- **UC-B-PD2:** Buyer spins the wheel (once per user per spin window)
- **UC-B-PD3:** Buyer receives coupon code if they win
- **UC-A-PD4:** Admin views raffle winner and entry count

**Legal note:** Consult legal on prize draw regulations in India before enabling.

#### What ships
- Prize draw listing type in events admin
- Public prize draw detail page + entry flow
- Spin wheel event UI (animation, prize reveal)
- Admin raffle trigger (`triggerEventRaffle` Firebase Function enabled)
- `prizeReveal*` Firebase Functions enabled
- Coupon prizes auto-issued to winners
- Winner display page (public)

#### Implementation TODO
- [ ] Remove early-returns from `prizeReveal*` + `triggerEventRaffle` + `assignSpinPrize` functions
- [ ] `FEATURE_PRIZE_DRAWS` guard on event forms, API routes, nav
- [ ] Legal review first — do not enable without clearance
- [ ] E2E: `pw-prize-draws.spec.ts` — create draw → buy entries → trigger raffle → winner gets coupon

**Pre-flip checklist:**
- [ ] Legal clearance obtained
- [ ] `prizeReveal*`, `triggerEventRaffle` function flags enabled
- [ ] Smoke: create prize draw → entries → admin triggers → winner gets coupon
- [ ] Spin wheel: create event → buyer spins → prize assigned correctly

---

### P-11 — Chat / Messaging
**Branch:** `patch/p11-chat`  
**Target window:** W37–W42  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_CHAT=true`  
**Dependency:** P-8 stable

#### Sequence Diagram

```
BUYER           APP              FIRESTORE / RTDB       SELLER
  │               │                     │                  │
  │ Order detail  │                     │                  │
  │ "Chat with    │                     │                  │
  │  Seller"      │                     │                  │
  │ ─────────────>│ getOrCreateConv()──>│ conversations/{id}
  │               │                     │  buyerId, storeId│
  │               │                     │                  │
  │ Type message  │                     │                  │
  │ ─────────────>│ POST /api/messages  │                  │
  │               │ appendMessage()────>│ conversations/{id}│
  │               │                     │ messages: [{     │
  │               │                     │   text, senderId,│
  │               │                     │   sentAt         │
  │               │                     │ }]               │
  │               │ RTDB ping ──────────>│ chats/{convId}/ │
  │               │                     │ lastUpdate=now   │
  │               │                     │                  │
  │               │ Seller's app polls RTDB (useRtdbPing)  │
  │               │                     │<─── listener ────│
  │               │                     │ lastUpdate change│
  │               │ Seller fetches fresh conversation      │
  │               │<────────────────────── GET /api/messages/[convId]
  │               │<──── messages[] ────│                  │
  │               │ ─────────────────────────────────────>│
  │               │                     │                  │
  │               │ Seller replies      │                  │
  │               │<──────────────── POST /api/messages ──│
  │               │ appendMessage()────>│                  │
  │               │ RTDB ping ──────────>│                 │
  │               │                     │ chats/{convId}/  │
  │               │ Buyer polls RTDB ───>│ lastUpdate=now   │
  │<──── refresh conversation ──────────│                  │
  │               │                     │                  │
  │               │ Unread badge ↑ in TitleBar (per conversation)
```

#### Use Cases Added

- **UC-B-CH1:** Buyer opens chat on order detail page
- **UC-B-CH2:** Buyer sends text message to seller
- **UC-B-CH3:** Buyer sees unread message badge in navbar
- **UC-S-CH1:** Seller receives real-time notification of new message via RTDB ping
- **UC-S-CH2:** Seller replies to buyer message
- **UC-S-CH3:** Seller views all open conversations (chat list page)
- **UC-A-CH1:** Admin moderates conversations (read-only access)

#### What ships
- Buyer ↔ Seller per-order chat (Firestore canonical + RTDB ping channel)
- `chats/{convId}/lastUpdate` RTDB ping path active
- `conversations` collection + `conversationsRepository` (already implemented in P-0 code)
- Chat list page for buyers (`/user/messages`) and sellers (`/store/messages`)
- Unread badge in navbar
- Message rate limit: 100/hour per user

#### Implementation TODO
- [ ] RTDB rules: allow `chats/*` and `conversations/*` paths
- [ ] `FEATURE_CHAT` guard on chat UI, API routes, nav badge
- [ ] Rate limiting on `POST /api/messages`
- [ ] E2E: `pw-chat.spec.ts` — buyer sends → seller receives → seller replies → buyer sees reply

**Pre-flip checklist:**
- [ ] RTDB rules updated and deployed
- [ ] Rate limit confirmed (100/hour per user)
- [ ] Smoke: buyer sends message → seller receives in real-time (< 2s) → reply sends back
- [ ] Unread badge increments on new message, clears on read

---

### P-12 — Scammer Registry + Trust Score
**Branch:** `patch/p12-scam`  
**Target window:** W43–W48  
**Risk:** MEDIUM  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_SCAM_REGISTRY=true`  
**Dependency:** P-11 stable

#### Sequence Diagram

```
REPORTER        APP             FIRESTORE          ADMIN           PUBLIC
  │               │                  │                │               │
  │ Report via    │                  │                │               │
  │ form (phone,  │                  │                │               │
  │ UPI VPA, desc)│                  │                │               │
  │ ─────────────>│ createReport()──>│ scammerReports/│               │
  │               │                  │ {id}           │               │
  │               │                  │ status=PENDING │               │
  │<─ "Report received, under review"│                │               │
  │               │                  │                │               │
  │               │ notify admin ────────────────────>│               │
  │               │                  │                │               │
  │               │ Admin reviews report              │               │
  │               │<──────── GET /api/admin/scam-reports ────────────│
  │               │                  │                │               │
  │               │ Admin publishes  │                │               │
  │               │<──────── POST /api/admin/scam-profiles ──────────│
  │               │ createProfile()─>│ scammerProfiles│               │
  │               │                  │ {id}           │               │
  │               │                  │ status=PUBLISHED               │
  │               │                  │ phone="+91XXX" │               │
  │               │                  │ upiVpa="..."   │               │
  │               │                  │                │               │
  │               │ Public lookup ───────────────────────────────────>│
  │               │<────────── GET /api/scam-check?phone=+91XXX ──── │
  │               │<──── profile[] ──│                │               │
  │               │ ─────────────────────────────────────────────────>│
  │               │ "⚠️ This number has 1 scam report"│               │
  │               │                  │                │               │
  │               │ Trust badge on seller profile     │               │
  │               │ (no scam reports = green badge)   │               │
```

#### Use Cases Added

- **UC-PUB-SC1:** Public user looks up phone/UPI for scam history
- **UC-A-SC1:** Admin reviews submitted scam reports
- **UC-A-SC2:** Admin publishes verified scammer profile
- **UC-A-SC3:** Admin rejects false reports
- **UC-PUB-SC2:** Buyer sees trust badge on seller profile (safe/flagged)
- **UC-MOD-SC1:** Moderator reviews reports (same flow as admin)

**Legal note:** All entries must be admin-reviewed before publication. No user-submitted content goes live automatically.

#### What ships
- Admin-curated scammer profile registry (review before publish)
- Public lookup by phone or UPI VPA (no login required)
- Trust score badge on seller profiles (green = no reports, amber = under review, red = confirmed)
- `onScamReportCreate` Firestore trigger: notifies admin on new report
- `onScamReportUpdate` Firestore trigger: recalculates trust score on status change

#### Implementation TODO
- [ ] `FEATURE_SCAM_REGISTRY` guard on all scam API routes + nav
- [ ] Enable `onScamReportCreate` and `onScamReportUpdate` triggers (remove early-return)
- [ ] Trust score badge component on public store profile page
- [ ] Legal: no auto-publish, admin must approve each profile
- [ ] E2E: `pw-scam-registry.spec.ts` — submit report → admin reviews → publishes → badge appears

**Pre-flip checklist:**
- [ ] Legal review of publication policy
- [ ] Admin-only access to scam management confirmed
- [ ] Smoke: submit report → admin approves → seller profile shows amber badge → publish → red badge

---

### P-13 — Razorpay Online Payment (Integration)
**Branch:** `patch/p13-razorpay`  
**Target window:** W49–W52  
**Risk:** MEDIUM  
**Status:** [ ] Not started (code scaffolding done early, as part of P-9b)  
**Feature flag:** `siteSettings.payment.razorpayEnabled` (was `FEATURE_RAZORPAY` — the flag
moved into `siteSettings.payment` when the provider architecture was rebuilt 2026-08-08)  
**Dependency:** P-12 stable (platform mature enough for live payment integration)

> **2026-08-08 update:** `RazorpayProvider` now `extends` the abstract `IPaymentProvider`
> base class (`appkit/src/providers/payment-razorpay/`) and is fully registrable — the
> plumbing below is real code, not aspirational. It's just off by default behind the
> flag above; flipping it on and running the pre-flip checklist is still the open work.

#### Sequence Diagram

```
BUYER        APP (Next.js)       RAZORPAY         FIRESTORE       SELLER
  │               │                  │                │               │
  │ /checkout     │                  │                │               │
  │ method=online │                  │                │               │
  │ ─────────────>│ POST /api/       │                │               │
  │               │ payment/         │                │               │
  │               │ create-order ───>│ Razorpay API   │               │
  │               │                  │ createOrder()  │               │
  │               │<─ {orderId,      │                │               │
  │               │    amount,       │                │               │
  │               │    currency}─────│                │               │
  │               │                  │                │               │
  │<─ Razorpay modal opens (client-side SDK)          │               │
  │               │                  │                │               │
  │ Enter card/   │                  │                │               │
  │ UPI details   │                  │                │               │
  │ ─────────────────────────────────>                │               │
  │<─ payment processed ─────────────│                │               │
  │               │                  │                │               │
  │ POST /api/    │                  │                │               │
  │ payment/      │                  │                │               │
  │ verify ──────>│ verifySignature()│                │               │
  │               │ Razorpay HMAC ──>│                │               │
  │               │<─ signature OK ──│                │               │
  │               │ updateOrder() ───────────────────>│ paymentStatus │
  │               │                  │                │ =PAID         │
  │               │                  │                │               │
  │<─ order confirmed ───────────────────────────────>│               │
  │               │                  │                │               │
  │               │ Razorpay webhook (async) ──────── │               │
  │               │ POST /api/payment/webhook          │               │
  │               │ verifyWebhook()──>│               │               │
  │               │ updateOrder()─────────────────────>│ idempotent   │
  │               │                  │                │               │
  │               │ notify seller ────────────────────────────────────>│
```

#### Use Cases Added

- **UC-B-RZ1:** Buyer selects "Pay Online" at checkout (card, UPI, netbanking, wallets)
- **UC-B-RZ2:** Buyer completes Razorpay payment modal
- **UC-SYS-RZ1:** Razorpay webhook confirms payment (async, idempotent)
- **UC-A-RZ1:** Admin configures Razorpay live keys in site settings
- **UC-A-RZ2:** Admin views Razorpay transaction IDs on orders
- **UC-A-RZ3:** Admin initiates Razorpay Payout to seller (replaces manual UPI from P-7)

**Pre-requisites:** Razorpay live API key + secret + webhook secret from Razorpay dashboard.

#### What ships
- "Pay Online" option at checkout (Razorpay modal)
- `/api/payment/create-order` + `/api/payment/verify` already coded — just flip flag
- Razorpay webhook handler at `/api/payment/webhook`
- Razorpay Payout API for automated seller payouts (replaces manual P-7 process)
- Mock payment flag disabled in production (`FEATURE_MOCK_PAYMENT=false`)

#### Implementation TODO
- [ ] Set Razorpay live keys in Vercel env (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
- [ ] Verify `/api/payment/create-order` and `/api/payment/verify` work with live keys
- [ ] Sandbox test: complete payment flow end-to-end on staging with Razorpay test credentials
- [ ] E2E: `pw-razorpay.spec.ts` — checkout → Razorpay test card → verify → order confirmed

**Pre-flip checklist:**
- [ ] Razorpay live keys set in Vercel (never committed to git)
- [ ] Razorpay webhook secret set
- [ ] Sandbox test passed on staging
- [ ] Smoke (prod): place ₹1 test order with Razorpay test card → verify payment confirmed

---

### P-14 — Shiprocket Auto-ship — REMOVED 2026-08-08

**Branch:** N/A — decision reversed, not implemented on a branch  
**Target window:** N/A  
**Risk:** N/A  
**Status:** [x] REMOVED — decision reversed 2026-08-08, will not ship  
**Feature flag:** N/A — `FEATURE_SHIPROCKET` never existed as a real flag; deleted from
the GitHub Actions feature-toggle option list too  
**Dependency:** N/A

> **Decision reversed 2026-08-08.** The platform commits to manual-only shipping
> permanently (see the header note at the top of this document). Every line of
> Shiprocket code, every `shiprocket*` field on `OrderDocument`/`UserDocument`, the
> `/api/webhooks/shiprocket` route, and the Shiprocket branch of `/api/store/shipping`
> were deleted outright — not feature-flagged off. `ManualShippingProvider`
> (`appkit/src/providers/shipping-manual/`) is the sole `IShippingProvider`
> implementation, built on an abstract base class so a *different* carrier integration
> remains a future drop-in if ever revisited — but Shiprocket specifically will not
> return. See [asciiDiagrams.md § O5](asciiDiagrams.md#o5--shipping-provider-architecture-manual-first-2026-08-08)
> for the current manual-ship sequence. The diagram below is preserved for historical
> record only — none of the code paths it describes exist anymore.

#### Sequence Diagram (historical — code no longer exists)

```
SELLER        APP              SHIPROCKET API     FIRESTORE       BUYER
  │              │                   │                 │              │
  │ Order detail │                   │                 │              │
  │ "Ship via    │                   │                 │              │
  │  Shiprocket" │                   │                 │              │
  │ ────────────>│ POST /api/store/  │                 │              │
  │              │ orders/[id]/ship  │                 │              │
  │              │ Shiprocket action │                 │              │
  │              │ ─────────────────>│ createOrder()   │              │
  │              │                   │ (Shiprocket API)│              │
  │              │<─ { awbCode,      │                 │              │
  │              │    shipmentId,    │                 │              │
  │              │    trackingUrl }──│                 │              │
  │              │ updateOrder() ────────────────────>│              │
  │              │                   │ trackingNumber  │              │
  │              │                   │ =awbCode        │              │
  │              │                   │ carrier         │              │
  │              │                   │ =Shiprocket     │              │
  │              │                   │ status=SHIPPED  │              │
  │              │ notify buyer ──────────────────────────────────>  │
  │              │                   │                 │              │
  │              │ Shiprocket webhook (tracking updates)              │
  │              │ POST /api/shipping/webhook                         │
  │              │<──────────────────│ OUT_FOR_DELIVERY│              │
  │              │ updateOrderStatus─────────────────>│              │
  │              │ notify buyer ──────────────────────────────────>  │
  │              │                   │                 │              │
  │              │ (Seller still has "Manual tracking" option)        │
  │              │ backward compatible with P-1 flow   │              │
```

#### Use Cases Added

- **UC-S-SR1:** Seller clicks "Ship via Shiprocket" → shipment auto-created
- **UC-B-SR1:** Buyer gets real-time tracking updates via Shiprocket webhook
- **UC-S-SR2:** Seller still has option to enter manual tracking (backward compat)
- **UC-A-SR1:** Admin configures Shiprocket credentials in site settings
- **UC-SYS-SR1:** Shiprocket webhook auto-updates order status (DISPATCHED → OUT_FOR_DELIVERY → DELIVERED)

**Pre-requisites:** Shiprocket account + API credentials + webhook endpoint registered in Shiprocket dashboard.

#### What ships
- "Ship via Shiprocket" button in seller order detail (when `FEATURE_SHIPROCKET=true`)
- Manual tracking option still available (backward compatible)
- Shiprocket webhook at `/api/shipping/webhook` for real-time updates
- Admin: Shiprocket credentials in site settings

#### Implementation TODO
- [ ] Set Shiprocket credentials in Vercel env (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_WEBHOOK_TOKEN)
- [ ] Test on Shiprocket sandbox with real pincode pairs (Mumbai → Bangalore, etc.)
- [ ] Verify backward compat: manual tracking still works when `FEATURE_SHIPROCKET=true`
- [ ] E2E: `pw-shiprocket.spec.ts` — mark as shipped via Shiprocket → AWB assigned → tracking URL populated

**Pre-flip checklist:**
- [ ] Shiprocket live credentials set in Vercel
- [ ] Webhook registered in Shiprocket dashboard
- [ ] Sandbox test: create order → auto-shipment created → AWB number assigned
- [ ] Smoke: seller ships via Shiprocket → buyer sees tracking link → status updates on delivery

---

### P-15 — Analytics HTTPS Function
**Branch:** `patch/p15-analytics`  
**Target window:** After P-13, after load testing  
**Risk:** MEDIUM-HIGH  
**Status:** [ ] Not started  
**Feature flag:** `FEATURE_ANALYTICS_FUNCTION=true`

#### Sequence Diagram

```
SCHEDULER / ADMIN     FIREBASE FN          FIRESTORE          ADMIN DASHBOARD
  │                       │                    │                     │
  │ Cron: daily 2am       │                    │                     │
  │ ─────────────────────>│ analyticsAggregate()│                    │
  │                       │ read: orders,       │                    │
  │                       │ products, users ───>│                    │
  │                       │                    │                     │
  │                       │<─── aggregate ─────│                     │
  │                       │ GMV, AOV,           │                    │
  │                       │ top sellers,        │                    │
  │                       │ conversion rate     │                    │
  │                       │                    │                     │
  │                       │ write analytics────>│ analytics/daily/   │
  │                       │                    │ {date}             │
  │                       │                    │                     │
  │                       │ Admin dashboard reads daily aggregates   │
  │                       │<────────────────────── GET /api/admin/analytics
  │                       │                    │<─── analytics[] ───│
  │                       │─────────────────────────────────────────>│
```

#### Use Cases Added

- **UC-A-AN1:** Admin sees daily GMV, AOV, top-selling products
- **UC-A-AN2:** Admin sees top-performing sellers + stores
- **UC-A-AN3:** Admin sees conversion rate (sessions vs. orders)
- **UC-SYS-AN1:** Firebase Function aggregates analytics daily at 2am IST

Enable only after load testing confirms the function completes within 60s background timeout. Monitor function execution time on first few runs before considering stable.

#### Implementation TODO
- [ ] Load test the analytics function on staging (must complete < 60s with full dataset)
- [ ] Remove early-return from analytics function
- [ ] Admin analytics dashboard charts (may already be coded)
- [ ] E2E: admin sees populated analytics charts

**Pre-flip checklist:**
- [ ] Load test passed (< 60s function execution time with real data volume)
- [ ] Analytics data visible in admin dashboard on staging
- [ ] Smoke: function runs → data aggregated → admin dashboard shows charts

---

### P-16 — Tour System (Full Steps)
**Branch:** `patch/p16-tour`  
**Target window:** After P-3 (stable platform — good time for onboarding UX)  
**Risk:** LOW  
**Status:** [ ] Not started  
**Feature flag:** None (always-on UX enhancement — button slot added in P-1)

#### Sequence Diagram

```
USER (any role)      APP              DRIVER.JS (lazy-loaded)
  │                    │                     │
  │ Clicks [?] Tour    │                     │
  │ button in TitleBar │                     │
  │ ──────────────────>│ onTourStart() ─────>│
  │                    │ import("driver.js") │
  │                    │<─────── loaded ─────│
  │                    │                     │
  │                    │ drive.setSteps([    │
  │                    │   {element:         │
  │                    │    "[data-tour=     │
  │                    │    'nav-products']" │
  │                    │    popover: {       │
  │                    │     title: "Shop"   │
  │                    │     description:... │
  │                    │   }}...             │
  │                    │ ])                  │
  │                    │ drive.drive()──────>│
  │                    │                     │
  │<─── Step 1: Highlight nav element ──────│
  │     Popover: "Browse all collectibles"  │
  │                    │                     │
  │ Click "Next" ─────────────────────────>│
  │<─── Step 2: Highlight search bar        │
  │     Popover: "Search by name, brand..." │
  │                    │                     │
  │... (role-specific steps) ...            │
  │                    │                     │
  │ "Done" ───────────────────────────────>│
  │<─── Tour complete (driver.js cleanup)   │
```

**Role-specific step sets:**
```
CUSTOMER TOUR (6 steps):
  1. Main nav → "Browse categories"
  2. Search bar → "Search by name, brand, price"
  3. Product card → "Add to cart or wishlist"
  4. Cart icon → "Review your items"
  5. Checkout → "Pay via UPI or online"
  6. Order history → "Track your orders"

SELLER TOUR (7 steps):
  1. Products nav → "Create your first listing"
  2. Product form → "Fill product details + images"
  3. Orders nav → "See incoming orders"
  4. Order detail → "Mark as shipped + enter AWB"
  5. Store Settings → "Set up your store profile"
  6. Analytics → "See your sales"
  7. Payouts → "View your earnings"

ADMIN TOUR (8 steps):
  1. Orders nav → "All marketplace orders"
  2. Order detail → "Verify payments + update status"
  3. Products moderation → "Approve / reject listings"
  4. Users → "Manage buyers and sellers"
  5. Stores → "Approve new store applications"
  6. Analytics → "Platform GMV and metrics"
  7. Site Settings → "Configure platform behaviour"
  8. Feature flags → "Enable / disable features"
```

#### Use Cases Added

- **UC-B-TOUR1:** Buyer starts customer tour from TitleBar → guided through 6 steps
- **UC-S-TOUR1:** Seller starts seller tour → guided through 7 steps
- **UC-A-TOUR1:** Admin starts admin tour → guided through 8 steps
- **UC-UX-TOUR1:** Tour can be skipped at any step, dismissed with Esc

#### What ships
- `driver.js` steps wired to `data-tour="*"` attributes placed in P-1
- Role-aware tour: `startTour(role)` loads the correct step set
- `TourProvider` (skeleton from P-1) now imports `driver.js` lazily
- Tour button in TitleBar shows for all logged-in users

#### Implementation TODO
- [ ] Add `data-tour="*"` attributes to all target elements across customer/seller/admin pages
- [ ] Wire `driver.js` steps in `TourProvider.tsx` (replace the P-1 skeleton)
- [ ] Role detection: `startTour("buyer" | "seller" | "admin")` loads correct steps
- [ ] `driver.js` lazy import (dynamic `import("driver.js")` only on first click)
- [ ] Test reduced motion: verify driver.js respects `prefers-reduced-motion`
- [ ] E2E: `pw-tour.spec.ts` — click tour → all steps traverse → no layout shifts

---

### P-17 — Bundles
**Branch:** `patch/p17-bundles`
**Target window:** After P-1 stable (can run in parallel with P-2/P-3)
**Risk:** MEDIUM
**Status:** [ ] Not started
**Feature flag:** `FEATURE_BUNDLES`
**Dependency:** P-1 stable products CRUD

**What ships:**
- Bundle listing type visible in catalogue + product detail page
- Admin: create/edit/delete bundles via `AdminBundlesView.tsx` (already coded, just guarded)
- Seller: create bundles from existing products (drag-and-drop product picker)
- Bundle stock syncs with component product stock via `bundleStockSync` Firebase Function (disable its early-return guard)
- Seed: 5 bundle category entries with real `bundleProductIds` populated

**Implementation TODO:**
- [ ] `FEATURE_BUNDLES` guard on admin bundles routes + seller bundles routes
- [ ] Enable `bundleStockSync` Firebase Function when `FEATURE_BUNDLES=true`
- [ ] Populate `bundleProductIds` in the 5 seed bundle entries with real product slugs
- [ ] `feature-toggle.yml`: add `FEATURE_BUNDLES` to the options list
- [ ] Vercel: add `FEATURE_BUNDLES=false` default env var
- [ ] E2E: `pw-bundles.spec.ts` — admin creates bundle → buyer sees it in catalogue → add to cart

---

## Rollout Timeline Summary

```
PATCH  WEEK   SCOPE                              RISK     FLAG                    BRANCH
──────────────────────────────────────────────────────────────────────────────────────────────
P-1    W1–4   MVP (cash/UPI, catalogue, nav)     HIGH     —                       main
P-2    W5–6   Coupons (admin + seller)           MED      FEATURE_COUPONS         patch/p2-coupons
P-3    W7–8   Blog (read-only)                   LOW      FEATURE_BLOG            patch/p3-blog
P-4    W9–10  Events (sale/offer types)          MED      FEATURE_EVENTS          patch/p4-events
P-5    W11–15 Auctions                           HIGH     FEATURE_AUCTIONS        patch/p5-auctions
P-6    W16–18 Pre-orders                         MED      FEATURE_PREORDERS       patch/p6-preorders
P-7    W19–22 Seller Payouts (manual UPI)        MED      FEATURE_PAYOUTS         patch/p7-payouts
P-8    W23–26 GST (tax calc, invoice, HSN)       MED      FEATURE_GST             patch/p8-gst
P-9    W27–30 COD (deposit + GST invoice)        MED      FEATURE_COD             patch/p9-cod
P-9b   —      EMI + manual providers + art/       MED      siteSettings.emi.enabled main (2026-08-08)
              stickers — LIVE 2026-08-08,          + StoreDocument.emiEnabled
              not on original schedule
P-10   W31–36 Prize Draws + Spin Wheel           HIGH     FEATURE_PRIZE_DRAWS     patch/p10-prize-draws
P-11   W37–42 Chat / Messaging                   MED      FEATURE_CHAT            patch/p11-chat
P-12   W43–48 Scammer Registry                   MED      FEATURE_SCAM_REGISTRY   patch/p12-scam
P-13   W49–52 Razorpay (integration)             MED      siteSettings.payment.   patch/p13-razorpay
                                                            razorpayEnabled
P-14   —      Shiprocket — REMOVED 2026-08-08    N/A      N/A                     N/A
P-15   TBD    Analytics HTTPS Function           MED-HIGH FEATURE_ANALYTICS_FN    patch/p15-analytics
P-16   Post P3 Tour System (full steps)          LOW      —                       patch/p16-tour
P-17   Post P1  Bundles listing type             MED      FEATURE_BUNDLES         patch/p17-bundles
──────────────────────────────────────────────────────────────────────────────────────────────
GST NOTE:  P-8 must ship before P-9 (COD, deposit + GST invoice). The COD *handling fee*
           (max(₹200, 10%)) shipped early with P-9b and does not need GST — see P-9 note.
EMI NOTE (P-9b): shipped ahead of schedule, directly on main. Backend/checkout/reminder/
           shipment-gate all live; admin ⑮ EMI settings tab still not built (Firestore-
           edit only for now) — see asciiDiagrams.md's flagged gap.
RAZORPAY:  Provider code + abstract-class architecture landed early with P-9b, disabled
           by default. Flipping it on for real traffic is still the open P-13 work.
SHIPROCKET: Cancelled outright 2026-08-08 — manual shipping (ManualShippingProvider) is
           now the permanent, only shipping path for every patch, indefinitely.
BUNDLES:   Can develop in parallel with P-2/P-3; no payment integration dependency.
```

---

## Go/No-Go Criteria (every patch)

Before flipping any feature flag in production:
1. `npm run check` exits 0 on the feature's branch
2. All Vitest tests pass (including any new tests for the feature)
3. Playwright E2E for the feature pass on iphone-13, laptop-14, monitor-30
4. 24h soak on Vercel preview URL (`vercel --target preview`) before prod
5. Rollback plan confirmed: flip flag back to `false` via GitHub Actions "Toggle Feature Flag" — zero data migration needed for flag-gated features
6. Admin has been trained on the new feature UI

---

## Open Questions (update as resolved)

| # | Question | Owner | Status |
|---|---|---|---|
| Q1 | Razorpay X account for P-12 payouts — approved? | CEO | Open |
| Q2 | Legal clearance for prize draws (P-10) in India | CEO + Legal | Open |
| Q3 | ~~Shiprocket account + sandbox credentials~~ — moot, Shiprocket removed 2026-08-08 | CEO | Closed (N/A) |
| Q4 | COD delivery zones / which pincodes to enable? | CEO | Open |
| Q5 | Chat rate limiting budget (RTDB read/write cost) | Eng | Open |
| Q6 | Load testing timing for P-15 analytics function | Eng | Open |
| Q7 | Vercel Token + Project ID for GitHub Actions | CEO / Eng | Open |
| Q8 | EMI: is a ₹10,000 per-seller-checkout threshold + 2–6 month tenure the right buyer-facing terms, or should this be reviewed against NBFC/BNPL regulatory guidance before wider promotion? | CEO + Legal | Open |
