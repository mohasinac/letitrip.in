# CLAUDE.md — LetiTrip Project Guide

> Read this file at the start of every session. It is the single source of truth for project context, rules, and data references that are not already in the code.

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

**LetiTrip** — India's largest collectibles marketplace. Monorepo:

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

### Collection Inventory (23 collections, as of Session 66)

#### Core Foundation

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **users** (15 target) | id=slug (`user-`), displayName, email, role (admin/seller/buyer), emailVerified, photoURL, bio, stats | email, phoneNumber, displayName | role, email, createdAt | 1 admin, 4 sellers, 4+ buyers. Auth record + Firestore profile. PII encrypted via HMAC blind indices (`emailIndex`, `phoneIndex`) |
| **addresses** (20 target) | id, userId, label, fullName, phone, addressLine1, city, state, pincode, country, isDefault | fullName, phone, addressLine1 | userId, isDefault | Subcollection under users |
| **stores** (8 target) | id=slug (`store-`), ownerId, storeName, storeDescription, storeLogoURL, storeBannerURL, status, isVerified, shippingConfig, payoutDetails, stats | payoutDetails.upiVpa, payoutDetails.accountNumber | ownerId, status, isVerified | 5 stores seeded; payoutDetails masked |
| **storeAddresses** (8 target) | id, storeId, label, fullName, phone, addressLine1, city, state, pincode, isPickupLocation | fullName, phone | storeId | Pickup locations per store |
| **brands** (13 seeded, 25+ target) | id=slug (`brand-`), name, slug, description, logoURL, bannerURL, website, country, founded, isActive, displayOrder | — | isActive, displayOrder | Real collectibles brands: Bandai, Hasbro, Takara-Tomy, Mattel, Pokémon Company, Konami, Funko, NECA, McFarlane, Good Smile, Hot Wheels, Tomica, Beyblade |
| **categories** (22 seeded, 55+ target) | id=slug (`category-`), name, slug, parentId, rootId, tier (1/2/3), path, isLeaf, isFeatured, showOnHomepage, display.{icon, coverImage, color, showInMenu} | — | parentId, rootId, isLeaf, isFeatured, showOnHomepage | 6 root categories: action-figures, trading-cards, diecast-vehicles, spinning-tops, model-kits, vintage-rare |

#### Listings & Bids

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **products** (20 seeded, 100+ target) | id=slug (`product-`/`auction-`/`preorder-`), storeId, brandSlug, categorySlug, price (INR paise), currency:"INR", status, condition, images[], youtubeId, customFields[], customSections[], isFeatured, isPromoted, isNew, isOnSale | — | storeId, brandSlug, categorySlug, status, isFeatured, isPromoted, price, createdAt | Standard products use `product-` prefix. 4 isFeatured=true, 4 isPromoted=true in seed |
| **bids** (20+ seeded, 120+ target) | id, productId (= auction slug), bidderId, amount (paise), status (active/outbid/won/cancelled), bidTime | — | productId, bidderId, status, bidTime | `productId` must match auction slug exactly (SL6 constraint) |

#### Transactional

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **orders** (10 seeded, 35+ target) | id (`order-`), buyerId, storeId, items[], totalAmount (paise), paymentMethod, paymentId, shippingAddress, trackingNumber, carrier, status (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED/REFUNDED/RETURN_REQUESTED) | shippingAddress.fullName, shippingAddress.phone | buyerId, storeId, status, createdAt | All 7 statuses seeded |
| **carts** (5 seeded, 20+ target) | id, userId (null=guest), sessionId, items[], updatedAt | — | userId, sessionId | 12 auth + 8 guest carts targeted |
| **wishlists** (19 seeded, 40+ target) | id, userId, productId, addedAt, priceAtAdd | — | userId, productId | One doc per user+product pair |
| **coupons** (5 seeded, 20+ target) | id (`coupon-`), code, name, type (percentage/fixed/free_shipping/buy_x_get_y), scope (admin/seller), sellerId?, discount.{value, maxDiscount, minPurchase}, usage.{totalLimit, perUserLimit, currentUsage}, validity.{startDate, endDate, isActive}, restrictions.{firstTimeUserOnly, combineWithSellerCoupons, applicableProducts, applicableCategories} | — | code, validity.isActive, validity.startDate, validity.endDate, type, createdBy | 5 coupons: WELCOME10 / POKEMON25 / FREESHIP999 / BLADER20 / VIP2026 (exhausted) |
| **reviews** (15 seeded, 60+ target) | id (`review-`), storeId, productId, buyerId, rating (1-5), title, body, images[], isVerifiedPurchase, sellerResponse?, helpfulCount, publishedAt | — | storeId, productId, buyerId, rating, isVerifiedPurchase, publishedAt | Distributed across 5 stores |
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
| Review | `review-` | `review-[productSlug]-[userId-short]` |
| User profile | `user-` | `user-mohsin-c` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-summer20` |
| Section | `section-` | `section-hot-wheels-franchise` |
| Nav item | `nav-` | `nav-new-arrivals` |
| Sub-listing | `sublisting-` | `sublisting-base-set-charizard-108-120` |

**id === slug** is the app-wide convention. Every Firestore document's `id` field must equal its `slug` field.

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
| Raw hex in CSS or `style={}` | `var(--appkit-color-*)` or Tailwind semantic token |
| `z-[50]` arbitrary Tailwind | `var(--appkit-z-modal)` CSS variable |
| `as unknown as SomeThing` | Fix the underlying type mismatch — ask if unsure |
| Skipping `npx tsc --noEmit` | Always run in BOTH `letitrip.in/` and `appkit/` before committing |
