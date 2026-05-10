# CLAUDE.md — LetItRip Project Guide

> Read this file at the start of every session. It is the single source of truth for project context, rules, and data references that are not already in the code.
>
> **Brand name**: **LetItRip** — always this exact casing in UI copy, messages, and documentation. Domain is letitrip.in but the brand display name is LetItRip. Never write "LetiTrip", "Letitrip", or "Let It Rip".

## Index

- [🛑 Rule #1 — Stop and Ask Before Deciding](#-rule-1--stop-and-ask-before-deciding)
- [🛑 Rule #2 — ✅ Does Not Mean Working](#-rule-2---does-not-mean-working)
- [🛑 Rule #3 — Schema/Logic Changes Must Update Older Functionality](#-rule-3--schemalogic-changes-must-update-older-functionality)
- [Project Summary](#project-summary)
- [Key Files to Read Before Any Session](#key-files-to-read-before-any-session)
- [Seed Data Reference](#seed-data-reference)
- [Slug Prefix System](#slug-prefix-system-enforced-everywhere)
- [Media Filename Slug Patterns](#media-filename-slug-patterns)
- [Appkit Patterns](#appkit-patterns-re-read-before-writing-any-component)
- [Seed API Reference](#seed-api-reference)
- [Firebase Infra Scripts](#firebase-infra-scripts-appkitscripts)
- [CSS Variable Reference](#css-variable-reference-sticky-positioning)
- [Known TS Patterns to Avoid](#known-ts-patterns-to-avoid)

---

## 🛑 RULE #1 — STOP AND ASK BEFORE DECIDING

**Never make autonomous decisions.** Before you:
- Choose between two implementation approaches
- Skip any part of a spec because it "seems like over-engineering"
- Mark a task ✅ based on your own judgement
- Deviate in any way from the description in `crud-tracker.md`
- Add, remove, or rename any field, route, component, or file beyond the scope of what was asked

**STOP. Write out what you're about to do and WHY. Wait for the user to confirm before writing any code.**

One question costs nothing. A wrong autonomous decision has compounded across many sessions in this project and caused regressions that required parallel sessions to fix. Do not be the cause of the next one.

---

## 🛑 RULE #2 — ✅ DOES NOT MEAN WORKING

Many tasks marked ✅ in `crud-tracker.md` have regressions in the browser. The user is aware and may be fixing them in a parallel session. When you touch any ✅ area:
1. Re-read the source files — never code from memory or tracker descriptions alone.
2. If you find it is broken, change the tracker status to ⚠️ (done-but-verify) and add a note.
3. Never assume a ✅ task is correct just because it was previously marked done.

---

## 🛑 RULE #3 — SCHEMA/LOGIC CHANGES MUST UPDATE OLDER FUNCTIONALITY

When implementing a new feature that changes a schema, data model, API contract, or shared logic:

1. **Identify all existing callers** — search for every component, hook, repository method, API route, or seed file that touches the changed field/type.
2. **Update them in the same session** — do not leave older code inconsistent with the new schema. Partial updates create silent runtime bugs that are hard to trace.
3. **Verify the seed data** — if a Firestore collection schema changes, update the corresponding seed file in `appkit/src/seed/` so new seed documents match the new shape.
4. **Update types** — if a TypeScript type in `appkit/src/features/*/types.ts` changes, search for all downstream casts, spreads, and destructures and update them too.

**Why:** In this project, schema drift across sessions (hooks not updated when API contracts change, seed data not reflecting new required fields) has caused silent failures that surface only at runtime.

---

## Project Summary

**LetItRip** — India's largest collectibles marketplace. Monorepo:

| Folder | Purpose |
|--------|---------|
| `d:\proj\letitrip.in\` | Next.js 15 app (App Router) — pages, API routes, public UI |
| `d:\proj\letitrip.in\appkit\` | Internal component library — UI primitives, feature views, Firestore schemas, seed data, repositories |

**Stack**: Next.js 15 (App Router) · Firebase (Firestore + Auth + Storage) · Tailwind CSS · TypeScript · `@mohasinac/appkit` (local package)

---

## Key Files to Read Before Any Session

| File | Purpose |
|------|---------|
| `crud-tracker.md` | Master task list — authoritative. Read before every session. |
| `newchange.md` | Session log + deferred items. Check DEFERRED table before starting. |
| `appkit/src/seed/` | All seed data files |
| `src/app/api/demo/seed/route.ts` | Seed API endpoint (streaming NDJSON) |
| `src/components/dev/SeedPanel.tsx` | Seed admin UI |

---

## Seed Data Reference

> The seed data is loaded via `/demo/seed` (SeedPanel). Collections live in Firestore. The API route is `POST /api/demo/seed` (single streaming request, NDJSON response). GET returns counts per collection.

### Collection Inventory (26 collections, as of Session 77)

#### Core Foundation

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **users** (18 seeded, 25+ target) | id=slug (`user-`), displayName, email, role (admin/seller/buyer), emailVerified, photoURL, bio, stats | email, phoneNumber, displayName | role, email, createdAt | 1 admin, 7 sellers, 10 buyers. Auth record + Firestore profile. PII encrypted via HMAC blind indices (`emailIndex`, `phoneIndex`) |
| **addresses** (20 target) | id, userId, label, fullName, phone, addressLine1, city, state, pincode, country, isDefault | fullName, phone, addressLine1 | userId, isDefault | Subcollection under users |
| **couponUsage** (per-user) | id=couponId, userId, couponCode, usageCount, lastUsedAt, orders[] | — | — | Subcollection `users/{uid}/couponUsage/{couponId}`. Tracks per-user coupon redemption count + all order IDs. Written by `couponsRepository.applyCoupon()` at checkout (fire-and-forget). Read by `getUserCouponUsageCount()` during coupon validation to enforce `perUserLimit`. 6 records seeded via `couponUsageSeedData`. |
| **stores** (8 seeded, 10+ target) | id=slug (`store-`), ownerId, storeName, storeDescription, storeLogoURL, storeBannerURL, status, isVerified, shippingConfig, payoutDetails, stats | payoutDetails.upiVpa, payoutDetails.accountNumber | ownerId, status, isVerified | 8 stores seeded — letitrip-official, pokemon-palace, cardgame-hub, diecast-depot, beyblade-arena, tokyo-toys-india, gundam-galaxy, vintage-vault |
| **storeAddresses** (13 seeded, 20+ target) | id, storeId, label, fullName, phone, addressLine1, city, state, pincode, isPickupLocation | fullName, phone | storeId | Pickup locations per store; storeSlug MUST match store-* prefix exactly |
| **brands** (13 seeded, 25+ target) | id=slug (`brand-`), name, slug, description, logoURL, bannerURL, website, country, founded, isActive, displayOrder | — | isActive, displayOrder | Real collectibles brands: Bandai, Hasbro, Takara-Tomy, Mattel, Pokémon Company, Konami, Funko, NECA, McFarlane, Good Smile, Hot Wheels, Tomica, Beyblade |
| **categories** (22 seeded, 55+ target) | id=slug (`category-`), name, slug, parentId, rootId, tier (1/2/3), path, isLeaf, isFeatured, showOnHomepage, display.{icon, coverImage, color, showInMenu} | — | parentId, rootId, isLeaf, isFeatured, showOnHomepage | 6 root categories: action-figures, trading-cards, diecast-vehicles, spinning-tops, model-kits, vintage-rare |

#### Listings & Bids

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **products** (70 seeded, 100+ target) | id=slug (`product-`/`auction-`/`preorder-`), storeId, brandSlug, categorySlug, price (INR paise), currency:"INR", status, condition, images[], youtubeId, customFields[], customSections[], isFeatured, isPromoted, isNew, isOnSale | — | storeId, brandSlug, categorySlug, status, isFeatured, isPromoted, price, createdAt | 50 standard + 12 auctions + 8 pre-orders. Standard products use `product-` prefix. Covers all 8 stores. |
| **bids** (20+ seeded, 120+ target) | id, productId (= auction slug), bidderId, amount (paise), status (active/outbid/won/cancelled), bidTime | — | productId, bidderId, status, bidTime | `productId` must match auction slug exactly (SL6 constraint) |

#### Transactional

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **orders** (10 seeded, 35+ target) | id (`order-`), buyerId, storeId, items[], totalAmount (paise), paymentMethod, paymentId, shippingAddress, trackingNumber, carrier, status (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED/REFUNDED/RETURN_REQUESTED) | shippingAddress.fullName, shippingAddress.phone | buyerId, storeId, status, createdAt | All 7 statuses seeded |
| **carts** (5 seeded, 20+ target) | id, userId (null=guest), sessionId, items[], updatedAt | — | userId, sessionId | 12 auth + 8 guest carts targeted |
| **wishlists** (19 seeded, 40+ target) | id, userId, productId, addedAt, priceAtAdd | — | userId, productId | One doc per user+product pair |
| **coupons** (10 seeded, 20+ target) | id (`coupon-`), code, name, type (percentage/fixed/free_shipping/buy_x_get_y), scope (admin/seller), sellerId?, discount.{value, maxDiscount, minPurchase}, usage.{totalLimit, perUserLimit, currentUsage}, validity.{startDate, endDate, isActive}, restrictions.{firstTimeUserOnly, combineWithSellerCoupons, applicableProducts, applicableCategories} | — | code, validity.isActive, validity.startDate, validity.endDate, type, createdBy | 5 admin coupons (WELCOME10/POKEMON25/FREESHIP999/BLADER20/VIP2026) + 5 seller coupons (PALACE15/DIECAST10/BEYARENA20/CARDGAME5/TOKYOTOYS10) |
| **reviews** (35 seeded, 60+ target) | id (`review-`), storeId, productId, buyerId, rating (1-5), title, body, images[], isVerifiedPurchase, sellerResponse?, helpfulCount, publishedAt | — | storeId, productId, buyerId, rating, isVerifiedPurchase, publishedAt | Distributed across all 8 stores |
| **payouts** (7 seeded, 25+ target) | id, storeId, sellerId, amount (paise), status (PENDING/PROCESSING/PAID/FAILED), periodStart, periodEnd, ordersIncluded[], paymentMethod, transactionId? | — | storeId, sellerId, status, createdAt | — |

#### Content & Marketing

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **blogPosts** (8 seeded, 20+ target) | id (`blog-`), title, slug, excerpt, content (rich HTML), coverImage, youtubeId, authorId, category, tags[], status (draft/published), isFeatured, readTimeMinutes, views, publishedAt | — | slug, category, status, isFeatured, authorId, publishedAt | 8 collectibles-themed posts |
| **events** (8 seeded, 15+ target) | id (`event-`), title, slug, type (TOURNAMENT/CONVENTION/MEETUP/SALE), status, tags[], startsAt, endsAt, stats.{totalEntries, approvedEntries}, createdBy | — | type, status, startsAt, createdBy | 2 upcoming, 2 active, 2 ended seeded |
| **eventEntries** (2 seeded, 25+ target) | id, eventId, userId, userDisplayName, userEmail, status (CONFIRMED/WAITLISTED/CANCELLED), createdAt | userEmail | eventId, userId, status, createdAt | — |
| **carouselSlides** (6 seeded, 10 target) | id (`slide-`), title, order, active, background.{type, url, mobileUrl, dimOverlay}, cards[], settings.{autoplayDelayMs, height}, createdBy | — | active, order, createdBy, createdAt | CF1 schema. 5 active (MAX_ACTIVE_SLIDES=5), 1 inactive. background.type: image/video/color/gradient |
| **homepageSections** (19 seeded, 25+ target) | id (`section-`), type (21 section types), order, enabled, config (type-specific shape) | — | type, order, enabled | All 19 active section types seeded. social-feed disabled. Config shape varies per type — see `appkit/src/features/homepage/schemas/firestore.ts` |
| **faqs** (21 seeded, 55+ target) | id (`faq-`), question, answer.{text, format:"html"}, category, seo.slug, tags[], searchTokens[], showOnHomepage, showInFooter, isPinned, priority, order, isActive, stats.{views, helpful} | — | category, seo.slug, tags, searchTokens, showOnHomepage, isPinned, priority, isActive, stats.helpful, createdAt | 5 with showOnHomepage:true. Categories: Shipping/Returns/Payments/Auctions/Pre-orders |

#### System & Config

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **notifications** (10 seeded, 40+ target) | id (`notif-`), userId, type (10 types), title, body, isRead, entityId, entityType, createdAt | — | userId, type, isRead, entityId, createdAt | Covers all 10 notification types, mixed read/unread |
| **sessions** (19 seeded, 20 target) | id, userId, isActive, expiresAt, lastActivity, deviceInfo.{browser, os, device, ip (masked)}, location.country | deviceInfo.ip | userId, isActive, expiresAt, lastActivity, createdAt | IP masked — never returned to client |
| **siteSettings** (1 doc) | Singleton doc at `site_settings/global`. 12 groups: branding, appearance, announcementBanner, seoDefaults, contactSocial, watermark, fees, integrations (API keys), shipping, auctionConfig, platformLimits, legalPages. Feature flags. Carousel + section defaults. | integrations.* (all API keys) | — | Single doc. VA8 admin form overwrites these. API keys are empty strings in seed — set via admin UI. |

---

## Slug Prefix System (enforced everywhere)

| Resource | Prefix | Example |
|----------|--------|---------|
| Product (standard) | `product-` | `product-hot-wheels-redline-vintage` |
| Auction | `auction-` | `auction-pokemon-charizard-1st-edition` |
| Pre-order | `preorder-` | `preorder-dbz-goku-ultra-ego` |
| Store | `store-` | `store-mistys-water-cards` |
| Category | `category-` | `category-action-figures` |
| Brand | `brand-` | `brand-hot-wheels` |
| Event | `event-` | `event-summer-holo-sale-2026` |
| Blog post | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `review-` | `review-charizard-psa9-ravi-20260508` |
| User profile | `user-` | `user-mohsin-c` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-summer20` |
| Section | `section-` | `section-hot-wheels-franchise` |
| Nav item | `nav-` | `nav-new-arrivals` |
| Sub-listing | `sublisting-` | `sublisting-base-set-charizard-108-120` |
| Carousel slide | `slide-` | `slide-hero-homepage` |
| Order | `order-` | `order-3-20260508-a1b2c3` |
| Bid | `bid-` | `bid-charizard-psa9-ravi-20260508-x7y8z9` |
| Payout | `payout-` | `payout-mistys-cards-20260508-q1w2e3` |
| Notification | `notif-` | `notif-order-shipped-001` |
| Grouped listing | `group-` | `group-pokemon-starter-bundle` |
| Support ticket | `ticket-` | `ticket-order-issue-ravi-20260508` |
| Scammer profile | `scammer-` | `scammer-9876543210-at-paytm` |

**Pure slugs** (`id === slug`, no timestamp/random): products, stores, categories, brands, blog, events, FAQs, sections, nav items, carousel slides, user profiles, coupons, sub-listings, scammer profiles.

**Semantic generator IDs** (slug-like prefix + date + random suffix, NOT Firestore auto-IDs):
- orders → `order-{itemCount}-{YYYYMMDD}-{rand6}`
- bids → `bid-{productName}-{userFirstName}-{YYYYMMDD}-{rand6}`
- reviews → `review-{productName}-{userFirstName}-{YYYYMMDD}`
- payouts → `payout-{sellerName}-{YYYYMMDD}-{rand6}`

**True Firestore auto-IDs** (no prefix, no slug): carts, wishlists, eventEntries, notifications, sessions.

---

## Media Filename Slug Patterns

All media files use SEO slugs via `generateMediaFilename(ctx)` in `appkit/src/utils/id-generators.ts`. Files are stored in Firebase Storage (private), served via `/api/media/[...slug]` Vercel proxy. Never write raw `firebasestorage.googleapis.com` URLs into Firestore.

| Context Type | Pattern | Example |
|---|---|---|
| `user-avatar` | `user-avatar-{name}-{YYYYMMDD}.{ext}` | `user-avatar-ravi-kumar-20260508.jpg` |
| `store-logo` | `store-logo-{store}-{YYYYMMDD}.{ext}` | `store-logo-mistys-water-cards-20260508.png` |
| `store-banner` | `store-banner-{store}-{YYYYMMDD}.{ext}` | `store-banner-mistys-water-cards-20260508.jpg` |
| `category-image` | `category-image-{category}-{YYYYMMDD}.{ext}` | `category-image-action-figures-20260508.jpg` |
| `product-image` | `product-image-{product}-{n}-{YYYYMMDD}.{ext}` | `product-image-charizard-psa9-1-20260508.jpg` |
| `product-video` | `product-video-{product}-{YYYYMMDD}.{ext}` | `product-video-charizard-psa9-20260508.mp4` |
| `auction-image` | `auction-image-{product}-{n}-{YYYYMMDD}.{ext}` | `auction-image-charizard-1st-edition-1-20260508.jpg` |
| `preorder-image` | `preorder-image-{product}-{n}-{YYYYMMDD}.{ext}` | `preorder-image-goku-ultra-ego-1-20260508.jpg` |
| `rich-text-image` | `rich-text-image-{context}-{YYYYMMDD}-{rand4}.{ext}` | `rich-text-image-blog-post-20260508-a1b2.jpg` |
| `review-image` | `review-image-{product}-{n}-{YYYYMMDD}.{ext}` | `review-image-hot-wheels-redline-1-20260508.jpg` |
| `review-video` | `review-video-{product}-{YYYYMMDD}.{ext}` | `review-video-hot-wheels-redline-20260508.mp4` |
| `blog-cover` | `blog-cover-{title}-{YYYYMMDD}.{ext}` | `blog-cover-how-to-grade-pokemon-cards-20260508.jpg` |
| `blog-content-image` | `blog-content-image-{title}-{n}-{YYYYMMDD}.{ext}` | `blog-content-image-how-to-grade-pokemon-cards-1-20260508.jpg` |
| `event-cover` | `event-cover-{event}-{YYYYMMDD}.{ext}` | `event-cover-pokemon-tournament-june-20260508.jpg` |
| `event-image` | `event-image-{event}-{n}-{YYYYMMDD}.{ext}` | `event-image-pokemon-tournament-june-1-20260508.jpg` |
| `event-winner-image` | `event-winner-image-{event}-{winner}-{YYYYMMDD}.{ext}` | `event-winner-image-tournament-june-ravi-kumar-20260508.jpg` |
| `carousel-image` | `carousel-image-{slide}-{YYYYMMDD}.{ext}` | `carousel-image-hero-homepage-20260508.jpg` |
| `invoice` | `invoice-{orderId}-{YYYYMMDD}.pdf` | `invoice-order-3-20260508-a1b2c3-20260508.pdf` |
| `payout-doc` | `payout-doc-{seller}-{YYYYMMDD}.pdf` | `payout-doc-mistys-water-cards-20260508.pdf` |

---

## Appkit Patterns (re-read before writing any component)

| Pattern | Where to look |
|---------|-------------|
| UI primitives | `appkit/src/ui/components/` — Button, Input, Select, Toggle, Badge, Checkbox, Modal, SideDrawer, SideModal, Stack, Row, Container, Section, Div, Text, Heading |
| Feature views | `appkit/src/features/[domain]/components/` — always search here before creating a new component |
| Repositories | `appkit/src/repositories/` — one repository per collection, never query Firestore directly from API routes |
| Seed data | `appkit/src/seed/` — one file per collection; `manifest.ts` for lightweight preview data |
| API routes | `src/app/api/[resource]/route.ts` — GET list + POST create; `[id]/route.ts` — GET/PUT/DELETE |
| API constants | `src/constants/api.ts` — all API endpoint strings in `API_ROUTES` object |
| Route constants | `appkit/src/next/routing/route-map.ts` — all page paths in `ROUTES` object; never hardcode strings |
| Nav group configs | `src/constants/navigation.tsx` — `ADMIN_NAV_GROUPS`, `STORE_NAV_GROUPS`, `USER_NAV_GROUPS`, `SIDEBAR_SUPPORT_LINKS`, `FOOTER_LINK_GROUPS`, `MAIN_NAV_ITEMS`; never define inline in layout files |
| Schema types | `appkit/src/features/[domain]/schemas/firestore.ts` — source of truth for all Firestore document shapes |

---

## Seed API Reference

**Endpoint**: `POST /api/demo/seed`

**Request body**:
```json
{ "action": "load" | "delete", "collections": ["users", "brands", ...], "dryRun": true }
```

**Response** (`application/x-ndjson` streaming):
```
{"type":"progress","collection":"users","status":"running","done":0,"total":5}
{"type":"progress","collection":"users","status":"done","done":1,"total":5}
{"type":"progress","collection":"brands","status":"running","done":1,"total":5}
...
{"type":"done","success":true,"message":"...","totals":{"created":X,"updated":Y,"errors":Z}}
```

**Status endpoint**: `GET /api/demo/seed` → `{ data: { collections: [{ name, seedCount, existingCount }] } }`

---

## Firebase Infra Scripts (appkit/scripts/)

> Use these when the environment needs a hard reset or index deploy is stuck.

| Script | When to use |
|--------|------------|
| `firebase-reset.mjs [--dry-run]` | Full wipe: deletes all Firestore docs + Auth users, redeploys indexes + functions. Always re-seed via `/demo/seed` afterward. |
| `firebase-delete-indexes.mjs` | Clears all composite indexes via REST API. Run **before** `npm run firebase:deploy` when getting 409 "already exists" errors. |

**Index source of truth**: `appkit/firebase/base/firestore.indexes.json` → run `firebase-merge.mjs` → `firestore.indexes.json` (root). Never edit the root file directly.

**Seed data rule (J13)**: Every standard product document MUST have `isAuction: false` and `isPreOrder: false` explicitly set. Firestore `where("isAuction", "==", false)` does NOT match documents where the field is absent.

---

## CSS Variable Reference (sticky positioning)

`AppLayoutShell` writes `--header-height` to `:root` at runtime — the measured height of its sticky header (title bar + navbar combined). Use it for all sticky offsets:

```tsx
// Correct:
<div className="sticky z-30" style={{ top: "var(--header-height, 0px)" }}>

// Also correct (Tailwind):
<div className="sticky top-[var(--header-height,0px)] z-30">
```

Other CSS variables:
- `--appkit-color-primary` / `--appkit-color-secondary` — theme colors (never use raw hex)
- `--appkit-z-modal`, `--appkit-z-dropdown`, `--appkit-z-overlay` — z-index tokens (never use integers)
- `--glow-color`, `--glow-ring`, `--glow-strong` — themed glow effects

---

## Known TS Patterns to Avoid

| Anti-pattern | Correct alternative |
|-------------|---------------------|
| `<Button onClick={() => router.push(...)}>` | `<Link href={ROUTES.*}>` with styled-button via `asChild` |
| Hardcoded `href="/products"` | `href={ROUTES.PUBLIC.PRODUCTS}` |
| `router.push("/admin/products")` hardcoded string | `router.push(String(ROUTES.ADMIN.PRODUCTS))` |
| Inline nav groups in layout files | Import from `@/constants/navigation` — `ADMIN_NAV_GROUPS` / `STORE_NAV_GROUPS` / `USER_NAV_GROUPS` |
| Raw hex in CSS or `style={}` | `var(--appkit-color-*)` or Tailwind semantic token |
| `z-[50]` arbitrary Tailwind | `var(--appkit-z-modal)` CSS variable |
| `as unknown as SomeThing` | Fix the underlying type mismatch — ask if unsure |
| Skipping `npx tsc --noEmit` | Always run in BOTH `letitrip.in/` and `appkit/` before committing |
| `@import "@mohasinac/appkit/styles"` in `globals.css` | `import "@mohasinac/appkit/styles"` in `layout.tsx` — Turbopack inlines CSS @imports before PostCSS runs, breaking tailwindcss + autoprefixer with "Unknown AST node type 0". Always import pre-compiled node_modules CSS via JS imports, not CSS @import. |
