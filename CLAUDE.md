# CLAUDE.md — LetItRip Project Guide

> Read this file at the start of every session. It is the single source of truth for project context, rules, and data references that are not already in the code.
>
> **Brand name**: **LetItRip** — always this exact casing in UI copy, messages, and documentation. Domain is letitrip.in but the brand display name is LetItRip. Never write "LetiTrip", "Letitrip", or "Let It Rip".
>
> **Tracker** → `crud-tracker.md` (SSR rearchitecture rows folded in 2026-05-12). **Working prompt** → `prompt.md`. The lane-split experiment with `ssr-arch-tracker.md` / `ssrprompt.md` was wound down 2026-05-12 — reunified into the single tracker + prompt. SSR architectural rules live below in § "SSR Architecture"; duplication keep-vs-consolidate criteria in § "Duplication Decision Framework".

## Index

- [🛑 Rule #1 — Stop and Ask Before Deciding](#-rule-1--stop-and-ask-before-deciding)
- [🛑 Rule #2 — ✅ Does Not Mean Working](#-rule-2---does-not-mean-working)
- [🛑 Rule #3 — Schema/Logic Changes Must Update Older Functionality](#-rule-3--schemalogic-changes-must-update-older-functionality)
- [🛑 Rule #4 — Never Fix Without Verifying It Is Actually Broken](#-rule-4--never-fix-without-verifying-it-is-actually-broken)
- [🛑 Rule #5 — Definition of Done: All Quality Gates Pass](#-rule-5--definition-of-done-all-quality-gates-pass)
- [🛑 Rule #6 — Code Within Vercel Hobby Tier Limits](#-rule-6--code-within-vercel-hobby-tier-limits)
- [🛑 Rule #7 — All CTAs Must Use the Action Registry](#-rule-7--all-ctas-must-use-the-action-registry)
- [🛑 Rule #8 — Never Defer Work](#-rule-8--never-defer-work)
- [Project Summary](#project-summary)
- [Key Files to Read Before Any Session](#key-files-to-read-before-any-session)
- [Seed Data Reference](#seed-data-reference)
- [Slug Prefix System](#slug-prefix-system-enforced-everywhere)
- [Media Filename Slug Patterns](#media-filename-slug-patterns)
- [Appkit Patterns](#appkit-patterns-re-read-before-writing-any-component)
- [Seed API Reference](#seed-api-reference)
- [Firebase Infra Scripts](#firebase-infra-scripts-appkitscripts)
- [CSS Variable Reference](#css-variable-reference-sticky-positioning)
- [appkit Export Rules](#appkit-export-rules)
- [Appkit Publish & Deploy Rules](#appkit-publish--deploy-rules)
- [SSR Architecture](#ssr-architecture)
- [Duplication Decision Framework](#duplication-decision-framework)
- [Recurrent Root Cause Patterns](#recurrent-root-cause-patterns)
- [Known TS Patterns to Avoid](#known-ts-patterns-to-avoid)
- [CTA Registry Rules](#cta-registry-rules)
- [Codebase Exports Catalog](#codebase-exports-catalog)
- [UI Primitive Rules](#ui-primitive-rules)
- [Animation Rules](#animation-rules)
- [Media Upload Rules](#media-upload-rules)

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

## 🛑 RULE #4 — NEVER FIX SOMETHING WITHOUT VERIFYING IT IS ACTUALLY BROKEN

Before touching any code in response to a bug report, plan note, or memory entry:

1. **Read the current source file** — do not rely on bug descriptions from memory files, plans, or old session notes.
2. **Confirm the bug is present** — if the code already handles the case correctly, mark the bug resolved and move on without writing any code.
3. **Check when the file was last modified** — `git log -1 -- <file>` tells you whether it was already fixed in a recent session.

**Why:** All 8 bugs documented in the appkit bug catalog (BUG-1 through BUG-8) were verified in Session 89 and found to be already fixed. Acting on stale bug reports caused unnecessary re-implementation risk. Plan files and memory entries describe what was true when written — not necessarily what is true now.

---

## 🛑 RULE #5 — DEFINITION OF DONE: ALL QUALITY GATES PASS

Before reporting any code change as complete, run the full quality gate set:

```
npm run check
```

This runs (in order, fail-fast):
1. `tsc --noEmit` in `appkit/` (`check:types:appkit`)
2. `tsc --noEmit` in `letitrip.in/` (`check:types:app`)
3. `appkit/scripts/audit-violations.mjs` — `_internal/` boundary check
4. `appkit/scripts/verify-entries.mjs` — client entry firebase-admin free
5. `appkit/scripts/verify-css-build.mjs` — compiled CSS class completeness
6. `scripts/audit-ssr-in-appkit.mjs` — route-shim thresholds + sidecar files + brand strings inside `_internal/`
7. `eslint src` — full lir/* rule set

For lint-fixable issues use `npm run check:fix` (runs `lint:fix` first, then full check).

**Subset commands** for fast iteration:
- `npm run check:types` — both repos' tsc only
- `npm run check:audits` — all audit scripts (~5–10s total)
- `npm run check:lint` — eslint on both `src` and `appkit/src`

**Stop hook automation**: `.claude/settings.json` runs the fast audits (`check:audits`) automatically at end of every Claude turn via `scripts/claude-hooks/check-on-stop.mjs`. Failures block the turn and surface to the assistant for fixing. **Every audit is now strict zero-tolerance** — there is no baseline-drift mode; any violation `> 0` fails the audit. Legitimate dynamic patterns are handled by explicit per-line suppression markers (`// audit-inline-style-ok`, `// toast-handled-by-hook`, `// toast-intentionally-silent`, `// reexport-from-internal-ok`, `// audit-sieve-views-ok`) at the site of the decision, each with a brief reason. tsc + lint are excluded from the Stop hook because they are too slow per-turn; run `npm run check` manually before commits.

**Pre-commit**: the `pre-commit` npm script is wired to `npm run check`. If you have a git hook runner installed, use it.

**A task is not complete until `npm run check` exits 0.** Do not mark a task ✅ in any tracker, do not write a session summary, do not propose a commit, until the full gate passes.

---

## 🛑 RULE #6 — CODE WITHIN VERCEL HOBBY (FLUID COMPUTE) TIER LIMITS

This project deploys to Vercel **Hobby** with **Fluid Compute enabled** (1 vCPU Standard, 2 GB function memory, 8 GB build machine, Node 22.x, region `iad1`). Every API route, server action, and Server Component you write must respect the ceilings below. Local dev (`npm run dev:hot`) enforces these via `VERCEL_HOBBY_TIER=1` in `scripts/dev-next.mjs`. The default `npm run dev` (build+start) runs a production server that matches Vercel's runtime behavior.

| Limit | Ceiling | Env var | Implication for new code |
|------|---------|---------|--------------------------|
| Function memory | **2048 MB** (Fluid Standard) | `VERCEL_FUNCTION_MEMORY_MB` | Don't buffer entire collections into memory. Stream Firestore results, paginate, never load > a few MB at once. **This is also the empirically-derived dev-server heap cap** (probe-dev-heap-cap.mjs 2026-05-12 showed 1024 MB OOMs the dev server under load; 1536 MB survives but exceeds the cap in RSS; 1536 + 512 MB headroom = 2048 MB). `package.json` `dev:only` sets `NODE_OPTIONS=--max-old-space-size=2048`. |
| Sync function timeout | **10 s** | `VERCEL_FUNCTION_TIMEOUT_S` | A request that fans out to many Firestore reads must batch + early-return. No N+1 loops over hundreds of docs in one handler. Offload long work to a Firebase Function. |
| Background function timeout | **60 s** | `VERCEL_BACKGROUND_TIMEOUT_S` | The hard ceiling for any handler we mark `runtime: "nodejs"` and let run async. Anything heavier belongs in `functions/`. |
| Request payload | **4.5 MB** | `VERCEL_MAX_PAYLOAD_BYTES` | Never accept raw image bytes in JSON. Use the `/api/media` signed-URL upload flow. |
| Image optimization input | **50 MB** | `VERCEL_MAX_IMAGE_BYTES` | Reject `next/image` sources larger than this; pre-resize on upload. |
| Build machine memory | 8 GB (reference, not enforced locally) | — | The Vercel build machine has plenty of room — `next build` won't OOM under normal conditions. Build output per function still caps at 250 MB compressed; don't pull large native modules into `src/app/api/**`. |
| Fluid Active CPU | 4 h / 30 d on Hobby | dashboard | Cache aggressively. Every cold start counts. |
| Function invocations | 1 M / 30 d on Hobby | dashboard | Same reasoning — caching > invoking. |

**Hard rules when writing new code:**

1. **API routes**: paginate every list endpoint (`pageSize <= 50`), never `findAll().map()` without a bound. Return early on auth/validation failures.
2. **Server actions / RSC data fetches**: budget yourself to ~3 sequential Firestore round-trips. Parallelise the rest with `Promise.all`. If you need more, hand off to a Firebase Function and return a job ID.
3. **Heavy work** (PDFs, sharp transforms, batch settlements, prize raffles, payout runs) belongs in `functions/` — never in a Next.js API route. The 10 s timeout will kill it in production even when local seems fine.
4. **Uploads**: bytes never go through Next.js. Client → signed URL → Firebase Storage → media slug returned. The 4.5 MB request cap makes any direct upload route a regression waiting to happen.
5. **Caching**: every public GET should set `Cache-Control: public, max-age=…, s-maxage=…, stale-while-revalidate=…` so the Hobby compute quota survives traffic. Cold-start prevention is **disabled** on this project, so every uncached miss is a real cold start.
6. **Logging**: don't `console.log` per-row inside loops — Hobby's log buffer drops at ~4 KB/s. Aggregate before logging.

**Verification**: run `npm run dev` and watch the `[dev-next] Vercel Hobby parity ON — memory=2048 MB …` banner — that confirms the caps are wired. To debug a specific route under the prod cap, hit it locally; the same 10 s / 2048 MB ceiling is in effect.

---

## 🛑 RULE #7 — ALL CTAs MUST USE THE ACTION REGISTRY

**Every CTA, bulk action, and row action MUST be defined in the action registry.** No exceptions, no "we'll wire it later."

### Source-of-truth files

| File | What it holds |
|------|--------------|
| `appkit/src/_internal/shared/actions/action-registry.ts` | `ACTIONS` tree — resource buckets mapping action-id → `ActionDef` (label, ariaLabel, kind, permissions, confirmation, listingTypeScope, iconKey) |
| `appkit/src/features/products/constants/action-defs.ts` | `ACTION_META`, `ROW_ACTION_META`, `FORM_ACTION_META`, `DASHBOARD_QUICK_ACTION_META` + preset arrays (`ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, etc.) |

### Hard rules

1. **No inline action objects.** Never write `{ id: "delete", label: "Delete", variant: "danger" }` or `{ label: "Approve", onClick: ... }` directly in a view component. Always reference `ACTIONS.{RESOURCE}["action-id"]`, `ROW_ACTION_META[ROW_ACTION_ID.X]`, or a preset array.
2. **BulkActionBar** — actions array MUST come from `ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, or `LISTING_BULK_ACTIONS` preset. Map preset IDs to `{ ...ROW_ACTION_META[id], onClick: handler }`.
3. **RowActionMenu** — actions array MUST come from `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, or `USER_ROW_ACTIONS` preset.
4. **Destructive actions** — every action with `kind: "danger"` or `destructive: true` MUST have a `confirmation` config in `action-registry.ts`. Missing confirmation = immediate irreversible execution.
5. **`<Button action={...}>`** — use the appkit Button's `action` prop to auto-resolve label, ariaLabel, variant, and confirmation dialog from an ActionDef.
6. **New actions** — add to BOTH registries: `ACTIONS.{RESOURCE}["new-action"]` in `action-registry.ts` AND the relevant preset array in `action-defs.ts`. Never create an action that only exists inline.
7. **No `window.confirm()`** — all confirmation dialog strings live in the `ActionDef.confirmation` field.

**Why:** Inline action definitions bypass centralized label management, permission gating, confirmation dialogs, and i18n overrides. Destructive actions without `confirmation` config execute immediately with no user warning. This has caused data loss in prior sessions.

---

## 🛑 RULE #8 — NEVER DEFER WORK

**Complete every task in the current session. Do not defer work to future sessions.**

When implementing a feature, fix, or refactoring:

1. **Finish what you start.** If a task has sub-parts, implement all of them now. Do not write "deferred to S7" or "will be done in a follow-up session."
2. **No partial implementations.** Do not ship a feature with placeholder stubs, TODO comments pointing to future sessions, or half-wired UI that "just needs the backend."
3. **No "deferred to next session" tracker entries.** If a task is in scope, complete it. If it cannot be completed because of a blocking dependency (e.g., a third-party API key that doesn't exist yet), say so explicitly and explain the blocker — don't just mark it deferred.
4. **Fix what you break.** If your changes break an adjacent feature, fix it in the same session. Do not log it as a known issue for later.
5. **Seed data, types, tests, audits** — if your change requires updates to seed data, TypeScript types, audit baselines, or related components, do them now. Not later.

**Why:** Deferred work accumulates across sessions and creates compounding regressions. Every "we'll do it next session" becomes a stale TODO that the next session may not even be aware of. The cost of finishing now is always lower than the cost of context-switching back to it later.

---

## Project Summary

**LetItRip** — India's largest collectibles marketplace. Monorepo:

| Folder | Purpose |
|--------|---------|
| `d:\proj\letitrip.in\` | Next.js 15 app (App Router) — pages, API routes, public UI |
| `d:\proj\letitrip.in\appkit\` | Internal component library — UI primitives, feature views, Firestore schemas, seed data, repositories |

**Stack**: Next.js 15 (App Router) · Firebase (Firestore + Auth + Storage) · Tailwind CSS · TypeScript · `@mohasinac/appkit` (local package)

---

## Dev Workflow

| Command | Memory | Feedback loop | Best for |
|---------|--------|---------------|----------|
| `npm run dev` | ~500 MB | Rebuild ~15-45s | **Default.** Server logic, Claude sessions, low-RAM machines |
| `npm run dev:hot` | ~3.5 GB | Hot-reload <1s | UI iteration, CSS tweaks, live preview |

### `npm run dev` — Build-and-Serve (default)

Runs `scripts/dev-light.mjs`: appkit build → Tailwind CSS → `next build` → `next start`. The production server uses ~300-500 MB vs ~3.5 GB for the hot-reload dev server.

- **First run**: ~60-120s (cold `next build`)
- **Subsequent runs**: ~15-45s (incremental via `.next/cache/`)
- **To rebuild after code changes**: Ctrl+C, then `npm run dev` again
- **Prewarm is unnecessary**: all routes pre-compiled by `next build`
- **Do NOT delete `.next/`** between runs — the cache enables fast incremental rebuilds

`next.config.js` sets `cacheMaxMemorySize: 0` so the production server uses disk cache only, keeping heap low.

### `npm run dev:hot` — Hot-Reload (when needed)

Traditional dev server with webpack HMR + file watchers. Uses ~3.5 GB. Best for rapid UI iteration. Same as the old `npm run dev`.

---

## Key Files to Read Before Any Session

| File | Purpose |
|------|---------|
| `crud-tracker.md` | Master task list — authoritative. Read before every session. |
| `newchange.md` | Session log + deferred items. Check DEFERRED table before starting. |
| `appkit/src/seed/` | All seed data files |
| `src/app/api/demo/seed/route.ts` | Seed API endpoint (streaming NDJSON) |
| `src/components/dev/SeedPanel.tsx` | Seed admin UI |
| `codebaseexports.md` | Comprehensive export catalog — every component, hook, action, route, constant, type, util, registry, schema, seed file. Read before creating anything new. |
| `docs.letitrip.in` (when live) | Authoritative deep docs — developer (UI/server/API), buyer help, seller guides, employee/admin guides. `appkit/index.md` + `src/index.md` remain the in-editor quick-reference. See Tier DX in `crud-tracker.md` for build status. |

---

## Seed Data Reference

> The seed data is loaded via `/demo/seed` (SeedPanel). Collections live in Firestore. The API route is `POST /api/demo/seed` (single streaming request, NDJSON response). GET returns counts per collection.

### Collection Inventory (26 collections, as of Session 77)

#### Core Foundation

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **users** (18 seeded, 25+ target) | id=slug (`user-`), displayName, email, role (`user`/`seller`/`moderator`/`employee`/`admin`), emailVerified, photoURL, bio, stats | email, phoneNumber, displayName | role, email, createdAt | 1 admin, 7 sellers, 10 buyers. Auth record + Firestore profile. PII encrypted via HMAC blind indices (`emailIndex`, `phoneIndex`). Role predicates: `isAdminUser` / `isSellerUser` / `isModeratorUser` / `isEmployeeUser` / `isBuyerUser` from `@mohasinac/appkit` (SB-UNI-E). |
| **addresses** (24 seeded, 35+ target) | id, ownerType (`user`/`store`), ownerId, label, fullName, phone, addressLine1, city, state, postalCode, country, isDefault | fullName, phone, addressLine1 | ownerType, ownerId, isDefault, createdAt | **Top-level** collection (SB-UNI-A 2026-05-13). Discriminated by `ownerType` — holds both buyer delivery addresses AND store pickup addresses. Replaced the two prior subcollections `users/{uid}/addresses` + `stores/{slug}/addresses`. PII encrypted via `addressesRepository.createWithId` override. Composite indices `(ownerType, ownerId, createdAt desc)` + `(ownerType, ownerId, isDefault)`. |
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
| **wishlists** (8 seeded, 10+ target) | id (=`wishlist-{userSlug}`), userId, items[]: {productId, productType, addedAt, priceAtAdd, productSnapshot}, updatedAt | — | userId, updatedAt | **One doc per user** at top-level. id === slug. items[] hard-capped at WISHLIST_MAX (20) — server returns 409 `WISHLIST_FULL` on overflow. All mutations wrapped in Firestore txn. Idempotent re-add is a no-op. |
| **history** (8 seeded, 10+ target) | id (=`history-{userSlug}`), userId, items[]: {productId, productType, viewedAt, productSnapshot}, updatedAt | — | userId, updatedAt | **One doc per user** at top-level. id === slug. items[] soft-capped at HISTORY_MAX (50) — silent FIFO evict oldest. Re-visit removes any existing entry for productId and unshifts new entry to position 0. Guest users mirror to `localStorage["letitrip:history"]`; on login `/api/user/history/merge` upserts + dedups by productId (newest viewedAt wins) + trims to 50. |
| **coupons** (10 seeded, 20+ target) | id (`coupon-`), code, name, type (percentage/fixed/free_shipping/buy_x_get_y), scope (admin/seller), sellerId?, discount.{value, maxDiscount, minPurchase}, usage.{totalLimit, perUserLimit, currentUsage}, validity.{startDate, endDate, isActive}, restrictions.{firstTimeUserOnly, combineWithSellerCoupons, applicableProducts, applicableCategories} | — | code, validity.isActive, validity.startDate, validity.endDate, type, createdBy | 5 admin coupons (WELCOME10/POKEMON25/FREESHIP999/BLADER20/VIP2026) + 5 seller coupons (PALACE15/DIECAST10/BEYARENA20/CARDGAME5/TOKYOTOYS10) |
| **reviews** (35 seeded, 60+ target) | id (`review-`), storeId, productId, buyerId, rating (1-5), title, body, images[], isVerifiedPurchase, sellerResponse?, helpfulCount, publishedAt | — | storeId, productId, buyerId, rating, isVerifiedPurchase, publishedAt | Distributed across all 8 stores |
| **payouts** (7 seeded, 25+ target) | id, storeId, sellerId, amount (paise), status (PENDING/PROCESSING/PAID/FAILED), periodStart, periodEnd, ordersIncluded[], paymentMethod, transactionId? | — | storeId, sellerId, status, createdAt | — |

#### Content & Marketing

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **blogPosts** (8 seeded, 20+ target) | id (`blog-`), title, slug, excerpt, content (rich HTML), coverImage, youtubeId, authorId, category, tags[], status (draft/published), isFeatured, readTimeMinutes, views, publishedAt | — | slug, category, status, isFeatured, authorId, publishedAt | 8 collectibles-themed posts |
| **events** (9 seeded, 15+ target) | id (`event-`), title, slug, type (sale/offer/poll/survey/feedback/**raffle/spin_wheel**), status, tags[], startsAt, endsAt, stats.{totalEntries, approvedEntries}, createdBy. **SB9 raffle fields** (optional, S8 2026-05-13): hasRaffle, raffleType (open_raffle/top_n_scorers/top_n_participants/spin_wheel), raffleTopN, rafflePrize, rafflePrizeCouponId, raffleGithubFunctionUrl, raffleWinnerUserId, raffleWinnerDisplayName, raffleWinnerEntryId, raffleTriggeredAt, raffleEntryCount. **Spin fields**: spinPrizes[] ({id,label,couponId?,weight,isActive}), spinMaxPerUser, spinWindowStart, spinWindowEnd. | — | type, status, startsAt, createdBy, hasRaffle | 2 upcoming + 4 active + 3 ended seeded, including 1 open-raffle (active), 1 spin-wheel (active), 1 top-N-scorers raffle (drawn, ended). |
| **eventEntries** (2 seeded, 25+ target) | id, eventId, userId, userDisplayName, userEmail, status (CONFIRMED/WAITLISTED/CANCELLED), createdAt. **SB9 spin fields** (S8 2026-05-13): raffleEligible?, spinUsed?, spinPrizeId?, spinPrizeCouponCode?, spinWonAt?. | userEmail | eventId, userId, status, createdAt | Composite indices `(eventId, status, points DESC)` + `(eventId, status, createdAt)` added in S8 for raffle pool queries. |
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
| Wishlist (per user) | `wishlist-` | `wishlist-user-mohsin-c` |
| History (per user) | `history-` | `history-user-mohsin-c` |
| Product feature | `feature-` | `feature-free-shipping` |
| Classified listing (SB-UNI-F) | `classified-` | `classified-vintage-funko-bangalore-meetup` |
| Digital-code listing (SB-UNI-F) | `digitalcode-` | `digitalcode-steam-cyberpunk-2077` |
| Live-item listing (SB-UNI-F) | `live-` | `live-axolotl-leucistic-juvenile` |
| Catalog product (SB-UNI-L) | `catalog-` | `catalog-pokemon-charizard-base-set-4-102` |

**Pure slugs** (`id === slug`, no timestamp/random): products, stores, categories, brands, blog, events, FAQs, sections, nav items, carousel slides, user profiles, coupons, sub-listings, scammer profiles, wishlists, history, product features.

**Semantic generator IDs** (slug-like prefix + date + random suffix, NOT Firestore auto-IDs):
- orders → `order-{itemCount}-{YYYYMMDD}-{rand6}`
- bids → `bid-{productName}-{userFirstName}-{YYYYMMDD}-{rand6}`
- reviews → `review-{productName}-{userFirstName}-{YYYYMMDD}`
- payouts → `payout-{sellerName}-{YYYYMMDD}-{rand6}`

**True Firestore auto-IDs** (no prefix, no slug): carts, eventEntries, notifications, sessions.

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

### Firebase Config File Locations (no duplicates)

| Location | Role | Tracked? |
|----------|------|----------|
| `appkit/firebase/base/*` | Source-of-truth templates — edit these | Yes (appkit repo) |
| `appkit/firebase/reset/*` | Minimal configs for `firebase-reset.mjs` | Yes (appkit repo) |
| Root `firebase.json` | Firebase CLI config (must be at project root) | Yes |
| Root `functions/` | Cloud Functions barrel — binds appkit handlers | Yes |
| Root `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `database.rules.json` | Generated by `npm run firebase:generate` | No (gitignored) |

**Never create Firebase config files at `appkit/` root.** The merge script reads from `appkit/firebase/base/` and writes to the consumer root. Any copy at `appkit/` root is redundant and will go stale. To edit rules or indexes, edit `appkit/firebase/base/` and run `npm run firebase:generate`.

**Index source of truth**: `appkit/firebase/base/firestore.indexes.json` → run `firebase-merge.mjs` → `firestore.indexes.json` (root). Never edit the root file directly.

**Seed data rule (J13 — updated 2026-05-12, SB1-G Phase 4)**: Every product document MUST have `listingType: "standard" | "auction" | "pre-order" | "prize-draw" | "bundle"` set. The legacy `isAuction` / `isPreOrder` booleans have been REMOVED from `ProductDocument`; all queries now use `where("listingType", "==", X)` against the `listingType+...` composite indexes. Canonical accessors: `isAuctionListing(p)` / `isPreOrderListing(p)` / `isStandardListing(p)` / `normalizeListingType(p)` — exported from `@mohasinac/appkit` and `@mohasinac/appkit/client`. CartItem snapshots also carry `listingType` (not booleans). The seed wrappers in `products-{auctions,preorders,standard}-seed-data.ts` are the canonical write sites — `.map(p => ({ ...p, listingType: "auction" as const }))`.

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

## appkit Export Rules

> **Always enforce these when touching `appkit/src/index.ts`, `appkit/src/client.ts`, or `appkit/src/server.ts`.**

### What belongs where

| Export type | `index.ts` (main) | `client.ts` | `server.ts` |
|-------------|:-----------------:|:-----------:|:-----------:|
| UI components, hooks, ROUTES, tokens | ✅ | ✅ | ❌ |
| Pure constants (SCAM_TYPES, slug patterns, etc.) | ✅ | ✅ | ❌ |
| Repositories (`scammerRepository`, etc.) | ✅ | ❌ | ✅ |
| Firebase Admin providers (`getAdminDb`, `getAdminAuth`, `getAdminStorage`, `firebaseStorageProvider`, `firebaseDbProvider`) | ❌ | ❌ | ✅ |
| Server actions (`"use server"` functions) | ✅ | ❌ | ✅ |

### Why this matters (the Turbopack client-bundle trap)

Local dev uses **webpack**, which respects the `externals` function in `next.config.js` — firebase-admin is silently externalized even if it leaks into the main index. **Vercel prod uses Turbopack**, which ignores webpack `externals`. Turbopack strictly follows the full import chain from every module included in `dist/index.js`. If any re-exported symbol's module chain reaches `firebase-admin` (which has a **static top-level** `import from "firebase-admin/app"`), Turbopack will include `child_process`/`fs` in the **client** bundle → build failure.

**`"sideEffects": false`** in `appkit/package.json` is the safety net: it tells both webpack and Turbopack to eliminate any re-exported module whose symbols are not actually consumed. Never remove this flag.

### Rules

```
✗ Never add a top-level (module-scope) call to firebase-admin APIs in any appkit file
✗ Never export from providers/db-firebase or providers/storage-firebase in index.ts
✗ Never export server-only code in client.ts
✓ Server providers live in server.ts + their own subpath (providers/db-firebase, providers/storage-firebase)
✓ When adding a new provider or repository to index.ts, check: does its import chain reach firebase-admin?
```

---

## Appkit Local Dev vs Publish Rules

### 🛑 LOCAL DEVELOPMENT — use `file:./appkit` (default)

During normal development, appkit is consumed as a local symlink. **Never publish to npm during a development session unless explicitly asked.**

```
letitrip/package.json:  "@mohasinac/appkit": "file:./appkit"
```

Run `npm run watch:appkit` in one terminal — changes to `appkit/src/` are compiled into `appkit/dist/` automatically and picked up by the Next.js dev server immediately. No version bump, no npm publish needed.

### ✅ PUBLISH TO NPM — only when explicitly asked by the user

When the user says "publish appkit" or "release appkit":

```
1. Commit all appkit source changes first (no uncommitted source)
2. Bump version in appkit/package.json  (patch = +0.0.1, minor = +0.1.0)
3. npm run build   (in appkit/)
4. npm publish     (in appkit/)
5. Update letitrip/package.json  "@mohasinac/appkit": "^X.Y.Z"
6. Delete package-lock.json + npm install  (lockfile must resolve from npm, not file:)
7. npx tsc --noEmit  (both repos, must be 0 errors)
8. Commit appkit/package.json + letitrip/package.json + package-lock.json
```

**Why `file:` works locally but not on Vercel**: `appkit/dist/` is gitignored. Vercel CLI respects gitignore when uploading, so `dist/` is excluded. `npm ci` with a `file:` dep links to a dist-less directory → build failure. The npm registry version ships `dist/` inside the tarball.

**Vercel deploy**: Auto-deploy on push is disabled (`vercel.json` → `"deploymentEnabled": false` for all branches). Run `vercel --prod` manually only when the user asks to deploy.

**Danger sign**: if `package-lock.json` shows `"resolved": "appkit"` with `"link": true` after switching to npm, the lockfile still points to the local directory. Delete it and re-run `npm install`.

---

## SSR Architecture

> Folded in from the wound-down `ssr-arch-tracker.md` / `ssrprompt.md` on 2026-05-12. These are non-negotiable rules for every new feature and every Tier RA retrofit.

### Guiding Principle — code defaults to appkit

Default home for SSR + feature code: **`appkit/src/_internal/server/features/<feature>/`** (server) or **`appkit/src/_internal/client/features/<feature>/`** (client). Consumer `letitrip.in/` files are thin shims (≤30 lines) when the Next.js framework forces a specific path (`page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `middleware.ts` / `proxy.ts`).

### Layered template per feature

```
appkit/src/_internal/server/features/<feature>/
├── data.ts        // getXForDetail(slug, opts?), listX(opts?) — wrap in React.cache when shared between page+generateMetadata
├── adapters.ts    // toClientX(doc) — Firestore doc → API/client shape
├── actions.ts     // "use server" mutations, validation, repo calls
├── metadata.ts    // buildXMetadata(doc, opts?) → Metadata
├── og.tsx         // renderXOgImage(doc, opts?) → ImageResponse  (when applicable)
└── index.ts       // barrel — re-export public surface

appkit/src/_internal/shared/features/<feature>/
├── config.ts      // page sizes, limits, defaults
├── types.ts       // TS types shared client+server
└── schema.ts      // Zod validators
```

### Encapsulation + Override Contract

Every public function takes an optional final `opts?: XOptions` parameter (even if empty today). Every view component accepts at least one `renderXxx` slot prop. Override hierarchy (least → most invasive):

1. **Config / tokens** — `siteSettings.theme`, `LabelsProvider` partial map, `appkit.config.js`.
2. **Options object** — `renderXOgImage(doc, { theme, headline, layout: "compact" })`.
3. **Render-prop slots** — `<XDetailView renderActions={(ctx) => <MyActions/>}>`.
4. **Adapter wrap** — `const myToClient = (doc) => decorate(toClientX(doc))`.
5. **Replace the call** — call repository directly; skip the helper.
6. **Fork via patch** — only when the seam doesn't exist yet. File a tracker entry; ship the seam in appkit.

### `React.cache` discipline

Every data-fetch function exposed to a page+`generateMetadata` pair MUST be wrapped in `React.cache`:

```ts
import { cache } from "react";
export const getXForDetail = cache(async (slug: string) => { ... });
```

### Audit baseline

`scripts/audit-ssr-in-appkit.mjs` runs as part of `npm run check`. Baseline is **8** (S2-deferred root files); only regressions block. Goal: drive to **0** (tracker row `X-audit-baseline`).

### Red flags

- A `_transform.ts` / `_adapter.ts` next to an API route → lift to `_internal/server/features/<feature>/adapters.ts`.
- An `opengraph-image.tsx` with >40 lines of layout JSX → extract renderer to appkit.
- A `page.tsx` with non-trivial Firestore querying → move to `data.ts`.
- Duplicate fetch logic in `page.tsx` + an API route → both should call the same appkit function.
- Hardcoded `"LetItRip"` / `"letitrip.in"` / currency / route strings inside `_internal/` → pipe through `appkit.config.js` / `ROUTES` / `LabelsProvider`.

---

## Duplication Decision Framework

> Run this against every cross-tier / cross-feature overlap before extracting OR before leaving duplication in place.

### Keep the duplication when ANY of these holds

1. **Different domain semantics.** E.g. admin sidebar nav vs store sidebar nav: shared structure, different meaning. Unifying would require >3 conditional props.
2. **Rule of Three.** Only 2 copies today. Extract on the 3rd, not the 2nd. Two copies is observation; three is a pattern.
3. **Lifetime is short.** One copy is being deprecated within 2 sessions.
4. **Lane / API boundary.** One copy lives in appkit's public surface (consumer-overridable); the other lives in `_internal/` (project-specific). Consolidating breaks the override seam.
5. **Customization point.** The duplicate *is* the override seam (consumer wraps appkit primitive with project-specific behavior).

### Consolidate when ANY of these holds

1. **≥3 copies** — Rule of Three trigger.
2. **Bug-fix multiplier** — a single bug fix would require >1 commits across copies.
3. **Same prop surface** — copies accept the same parameters and return the same shape.
4. **Migration artifact** — duplication only exists because of pre-layered structure.
5. **Test-burden multiplier** — same logic tested N times in N test files.

### Where the consolidated version goes

- Used by ≥2 features → `appkit/src/_internal/client/` or `appkit/src/ui/` (client); `appkit/src/_internal/server/` (server).
- Used by exactly 1 feature → `appkit/src/_internal/{client|server}/features/<feature>/`.
- Used only in `letitrip.in/` and not generic → keep in `src/components/` until a second consumer appears.

### Specific call-out — sidebar layouts

The 4 layout shells (`AdminLayoutShell`, `StoreLayoutShell`, `UserLayoutShell`, public `LayoutShellClient`):
- **Keep** the 4 wrappers — genuinely different domain semantics.
- **Consolidate** the structural shell into appkit's `<AppShell>` — each wrapper passes its `renderNav` / `renderHeader` slots to one shared `<AppShell>` underneath.
- Tracked as `3-shell-adopt` + `LL-dashboard-*` in `crud-tracker.md`.

---

## Recurrent Root Cause Patterns

> These patterns have caused multiple bugs across many sessions. Treat each as a red flag during code review and implementation. The bug IDs in parentheses are the first known instance — see the [Known Bugs plan](../../Users/mohsi/.claude/plans/in-our-git-hirsoty-elegant-lagoon.md) for full history.

| # | Pattern | Red flag to watch for |
|---|---------|----------------------|
| 1 | **Use `listingType`, not the dropped booleans** | The legacy `isAuction` / `isPreOrder` booleans were removed in SB1-G Phase 4 (2026-05-12). All product queries use `where("listingType", "==", X)`. All consumer code reads via `isAuctionListing(p)` / `isPreOrderListing(p)` / `normalizeListingType(p)` from `@mohasinac/appkit`. See J13 above. |
| 2 | **Missing Firestore composite indexes** | Queries with multiple `where` + `orderBy` throw `FAILED_PRECONDITION` silently in prod. Add to `appkit/firebase/base/firestore.indexes.json` and deploy. Never add indexes to the root `firestore.indexes.json` directly (J13). |
| 3 | **Tailwind class purging** | Any class generated only inside appkit (not in `./src/**`) is purged in prod unless safelisted in `tailwind.config.js` or pre-compiled into `dist/tailwind-utilities.css` (HF87-1). |
| 4 | **SSR shape mismatches** | Repository methods return `FirebaseSieveResult`; page views expect domain-specific shapes (e.g. `{ posts: [] }`). Always transform before passing as `initialData` (J14). |
| 5 | **Component prop API drift** | appkit component props evolve (`open` → `isOpen`, `showToast(obj)` → `showToast(msg, variant)`). Always read the component source before using it — never assume the API from memory (HF86-4, HF89-wa). |
| 6 | **Vercel Lambda dynamic require — outputFileTracingIncludes** | Any package loaded via dynamic `require()` at Lambda cold-start but not statically imported is missing from the bundle → `MODULE_NOT_FOUND` in prod. Fix: add `"./node_modules/<pkg>/**"` to `defaultOutputFileTracingIncludes["/api/**"]` in `appkit/src/configs/next.ts`, bump appkit patch version, redeploy. **Critical anti-patterns**: (a) never use `@scope/**` broad globs — `@firebase/**` includes the entire client SDK (~200MB+) and causes the Vercel "Deploying outputs..." step to time out/fail; (b) the `@firebase/database` package alone is 8.8MB, making it a build-timeout risk even as a specific glob. **How to find the real missing packages**: run `node scripts/trace-firebase-full.mjs` from project root — it dynamically traces all packages loaded by `firebase-admin/firestore` including a live Firestore call. The confirmed runtime list as of appkit v2.7.9 is in `appkit/src/configs/next.ts`. **Deployment failure symptom**: build completes in ~6m but "Deploying outputs..." fails (Error status, 10-45m duration) = output bundle too large. |
| 7 | **Dual `@types/react` instances** | appkit pinning a specific `@types/react` version creates dual instances. Use `peerDependencies` + `overrides` in root `package.json` (HF89-ts). |
| 8 | **Slot-shell render props not passed** | Calling any appkit view shell with zero render props renders a layout skeleton with no content. Always check that all `renderXxx` props are wired on every page that uses the shell. |
| 9 | **`createWithId` bypasses BaseRepository hooks** | Any PII encryption, validation, or other override in `BaseRepository` is skipped when `createWithId` is called directly. Always override `createWithId` in the subclass (HF86-3). |
| 10 | **CSS @import of node_modules in globals.css** | Turbopack inlines `@import` before PostCSS runs, breaking tailwindcss + autoprefixer. Always import pre-compiled CSS from node_modules via JS (`import "pkg/styles"` in `layout.tsx` — never `@import` in CSS) (CSS-import). |
| 11 | **Stale bug/plan descriptions** | Plan files and memory entries describe what was true when written. Always verify by reading the current source file before writing any fix. Never act on a bug description without confirming the bug still exists (Rule #4). |
| 12 | **Missing `"use client"` on client-hook files** | Any appkit file that imports `useTranslations` / `useState` / `useEffect` / `useRouter` / `useSearchParams` / `usePathname` (or any React hook / next-intl / next/navigation hook) MUST have `"use client"` as its **first line**. Without it, Next.js treats the file as a Server Component. When the server render fails, React attempts a client-side recovery render without `NextIntlClientProvider` context → `"context not found"` crash. The stop hook runs `appkit/scripts/audit-use-client.mjs` after every turn and blocks on any regression. |
| 13 | **Double router.replace race condition** | Never call `table.set(key, v)` followed immediately by `table.setPage(1)` in the same handler. `table.set()` for any key not in `NON_RESETTING_KEYS` (`page`, `pageSize`, `view`) already resets page automatically via a single `router.replace()`. A subsequent `setPage(1)` reads **stale** `useSearchParams()` output and issues a second `router.replace()` that overwrites the first URL update — the toolbar sort/filter appears to do nothing. Use only `table.set(key, v)`. The stop hook runs `appkit/scripts/audit-double-navigation.mjs` after every turn and blocks on any regression. The audit catches both same-line (`table.set(...); table.setPage(`)`) and **multi-line** (set on line N, setPage on line N+1) patterns — a full sweep of 17 instances across 12 files was completed 2026-05-15. |
| 14 | **Firebase dual-module instance** | `appkit/node_modules/firebase` and root `node_modules/firebase` are separate package copies. If webpack resolves `firebase/app` to two different instances, the Firebase app registry is split: `initializeApp()` registers the app in one instance, but `getAuth()` / `getFirestore()` look it up in the other and find nothing → `"No Firebase App '[DEFAULT]' has been created"`. Fix is in `defineNextConfig`'s webpack config: `config.resolve.alias["firebase"] = path.resolve(cwd, "node_modules/firebase")` forces all `firebase/*` imports to the root copy. Never remove this alias. |
| 15 | **Never use appkit `<Button>` as a toggle switch — use `<Toggle>`** | Using `<Button role="switch">` to build a toggle pill causes the Button's internal padding and display styles to override custom sizing classes (`w-10 h-6 rounded-full`), so the toggle renders as a plain grey circle instead of a pill with a sliding thumb. Use the appkit `<Toggle checked onChange size>` primitive instead — it renders a native `<button role="switch">` internally with correct pill styling. The `BUTTON_AS_TOGGLE` rule in `audit-code-quality.mjs` blocks on any regression. |
| 16 | **Inline action definitions bypass the CTA registry** | Every CTA, bulk action, and row action MUST use the ACTIONS registry (`action-registry.ts`) or ACTION_META / ROW_ACTION_META / ADMIN_BULK_ACTIONS / SELLER_BULK_ACTIONS constants (`action-defs.ts`). Inline `{ id: "delete", label: "Delete", variant: "danger" }` objects in BulkActionBar or RowActionMenu bypass centralized label management, permission gating, confirmation dialogs, and i18n overrides. Destructive actions (delete, cancel, ban, suspend) without `confirmation` config on their ActionDef are especially dangerous — they execute immediately with no user confirmation. See § "CTA Registry Rules" below. |
| 17 | **`useSearchParams()` requires `<Suspense>` in Next.js 16 production** | Every appkit listing view calls `useUrlTable()` → `useSearchParams()`. In `next start` (production mode), calling `useSearchParams()` without a `<Suspense>` boundary triggers the error boundary → "Something went wrong". Fix: the admin/store/user dashboard layouts AND the root `[locale]/layout.tsx` wrap `{children}` in `<Suspense>`. Never remove these boundaries. New dashboard sub-layouts should also include `<Suspense>` around `{children}`. |
| 18 | **No re-exports — import from the defining module** | Never create barrel re-exports (`export { X } from "./internal/thing"`) for convenience. Every import must point to the file that **defines** the symbol. Barrel re-exports in `index.ts` / `client.ts` / `server.ts` are only for appkit's **public API contract** — UI components, hooks, types, and constants that external consumers actually need. Internal utilities, shared hooks used only inside appkit views, and implementation details stay internal. This prevents import chain bloat, circular dependencies, and the Turbopack client-bundle trap (Root Cause #6). During Phase 11 (W5-1/W5-2), all existing convenience re-exports will be pruned and consumer imports rewritten to point directly at defining modules. |
| 19 | **Peer-dep duplicates in `appkit/node_modules/` cause Turbopack dual-instance crashes** | Running `cd appkit && npm install` populates `appkit/node_modules/` with every peer-dependency *and* their transitive runtime deps. Turbopack 16 resolves appkit-internal imports to those local copies while the consumer's imports resolve to the consumer-root copy. Singleton modules (React contexts, registries) end up as two separate instances in the same SSR bundle, and `useContext` reads the wrong one. This caused the 2026-06-10/11 "No QueryClient set" prod outage (duplicate `@tanstack/query-core` carrying its own `QueryClientContext`). The fix is enforced by `appkit/scripts/dedupe-peer-deps.mjs` (wired as both `postinstall` and the first step of `build`). **Rules**: (a) never remove that script or its `package.json` wiring; (b) if a new peer-dep is added that ships a React context via a transitive package, append the transitive's name to `TRANSITIVE_RUNTIME_DUPS` inside the script; (c) when diagnosing similar errors, decode the failing chunk's source map (`.next/server/chunks/ssr/<chunk>.map`) — if the original-position source path goes through `appkit/node_modules/<pkg>/...`, this pattern is in play. |

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
| Exporting firebase-admin providers from `appkit/src/index.ts` | Move to `server.ts` only — they leak into client bundles via Turbopack (see appkit Export Rules above) |
| Removing `"sideEffects": false` from `appkit/package.json` | This flag is required; without it Turbopack bundles the full firebase-admin chain into client bundles |
| `"@mohasinac/appkit": "^X.Y.Z"` (npm) in letitrip `package.json` during local dev | Use `file:./appkit` for local dev; only switch to npm version when deploying or when user asks to publish |
| Building and publishing appkit with uncommitted source changes | Always commit first — the build compiles from the working tree, so the published dist may not match git history |
| Inline `{ id: "delete", label: "Delete", variant: "danger" }` in BulkActionBar | Use `ADMIN_BULK_ACTIONS.products` / `SELLER_BULK_ACTIONS.products` preset arrays from `action-defs.ts`, referencing `ROW_ACTION_META[ROW_ACTION_ID.DELETE]` for label + destructive flag |
| Inline `{ label: "Approve", onClick: ... }` in RowActionMenu | Use `ROW_ACTION_META[ROW_ACTION_ID.APPROVE].label` or `ACTIONS.ADMIN["approve-product"].label` from the registries |
| Hardcoded confirmation `window.confirm("Delete?")` | Use `ACTIONS.ADMIN["..."].confirmation` or add a `confirmation` field to the ActionDef in `action-registry.ts` — `<Button action={...}>` opens the confirm dialog automatically |
| Destructive bulk/row action with no confirmation dialog | Every `kind: "danger"` action MUST have a `confirmation` config in `action-registry.ts` — missing confirmation on delete/cancel/ban = immediate execution with no user confirmation |
| Re-exporting a symbol just to create a barrel alias | Import directly from the defining module. No `export { X } from "./internals"` in index/client/server barrels unless X is part of the package's public API. Consumer code must import from the file that defines the symbol, not from a barrel re-export. |
| Adding a new re-export to `appkit/src/index.ts` or `client.ts` | Only export symbols that are part of appkit's **public API contract** (UI components, hooks, types, constants consumers actually need). Internal utilities, shared hooks used only inside appkit views, and implementation details stay internal — import them directly within appkit, never re-export for convenience. |

---

## CTA Registry Rules

> Every CTA, button, bulk action, and row action in the platform is registered in two complementary files. **Never hardcode labels, variants, or confirmation copy inline in view components.**

### Registry files (source of truth)

| File | What it holds | When to use |
|------|--------------|-------------|
| `appkit/src/_internal/shared/actions/action-registry.ts` | `ACTIONS` tree — 23 resource buckets, each mapping action-id → `ActionDef` (label, ariaLabel, kind, permissions, confirmation, listingTypeScope, iconKey) | Use `ACTIONS.{RESOURCE}["action-id"]` for label, confirmation, and permission checks. Wire to `<Button action={...}>` for auto-confirmation + auto-variant. |
| `appkit/src/features/products/constants/action-defs.ts` | `ACTION_META` (Tier 1 public CTAs), `ROW_ACTION_META` (Tier 2 row/table actions), `FORM_ACTION_META` (Tier 3 form footers), `DASHBOARD_QUICK_ACTION_META` (Tier 4 dashboard shortcuts). Presets: `ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, `USER_ROW_ACTIONS`, `FORM_FOOTER_PRESET`, `DETAIL_ACTIONS`, `MOBILE_PRIMARY_ACTIONS`, `LISTING_BULK_ACTIONS`. | Use preset arrays to populate BulkActionBar and RowActionMenu. Use `ROW_ACTION_META[ROW_ACTION_ID.DELETE]` for label + icon + destructive flag. |

### Rules for every view component

1. **BulkActionBar** — actions array MUST reference `ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, or `LISTING_BULK_ACTIONS` preset. Map preset IDs to `{ ...ROW_ACTION_META[id], onClick: handler }`. Never hardcode `{ id: "delete", label: "Delete", variant: "danger" }` inline.
2. **RowActionMenu** — actions array MUST reference `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, or `USER_ROW_ACTIONS` preset for the entity type. Use `ROW_ACTION_META[id].label` for labels and `ROW_ACTION_META[id].destructive` for visual hints. Never hardcode `{ label: "Approve", onClick: ... }` inline.
3. **Destructive actions** — every action with `kind: "danger"` or `destructive: true` MUST have a `confirmation` config in `action-registry.ts`. Missing confirmation = immediate irreversible execution with no user warning.
4. **`<Button action={...}>`** — the appkit Button component auto-resolves label, ariaLabel, variant, and confirmation dialog from an ActionDef. Use it instead of manual `<Button variant="danger" onClick={...}>Delete</Button>`.
5. **New actions** — add to BOTH registries: `ACTIONS.{RESOURCE}["new-action"]` in `action-registry.ts` AND the relevant preset array in `action-defs.ts`. Never create an action that only exists as an inline object in one view component.
6. **Confirmation copy** — all confirmation dialog strings (title, body, confirmLabel) live in the `ActionDef.confirmation` field. Never write `window.confirm()` or inline modal copy in view components.

---

## Codebase Exports Catalog

> **`codebaseexports.md`** at project root is the comprehensive catalog of every export from every source file in the monorepo. It covers UI components, feature views, repositories, hooks, server actions, API routes, constants, types, utils, registries, schemas, seed data, page shims, config, tokens, routes, and Firebase jobs.

### Maintenance Rule

**After every code change that adds, removes, renames, or moves an export**, update `codebaseexports.md` to reflect the change. This includes:

1. **New component/function/constant** — add a row to the appropriate section table.
2. **Renamed export** — update the export name in the table.
3. **Deleted export** — remove the row.
4. **Moved file** — update the file path.
5. **New feature domain** — add a new subsection.
6. **Changed props/signature** — update the Props/Signature column.

**Why:** This catalog prevents duplicate work (e.g., building a store products page when an admin products page already exists that differs only by storeId). It is the single reference for "what exists where" and must stay current.

**When to read it:** Before creating any new component, view, hook, or utility — check if one already exists. Before any refactoring session — understand the blast radius.

---

## UI Primitive Rules

> Enforced by `audit-typography.mjs`, `audit-html-wrappers.mjs`, `audit-inline-styles.mjs`, and `audit-code-quality.mjs`. Baselines prevent regressions; new code must use primitives.

### Raw HTML Tag Rules

| Instead of | Use |
|------------|-----|
| `<span className="text-sm text-zinc-500">` | `<Span size="sm" color="muted">` |
| `<strong>` / `<b>` | `<Span weight="bold">` or `<Span weight="semibold">` |
| `<p className="...">` | `<Text>` with props |
| `<h1>` through `<h6>` | `<Heading level={1}>` through `<Heading level={6}>` |
| `<small>` | `<Span size="xs">` or `<Text size="xs">` |
| `<em>` | `<Span className="italic">` |
| `<div>` with layout intent | `<Stack>`, `<Row>`, `<Section>`, `<Container>` |
| `<table>` | `<Table>` from `@mohasinac/appkit` Semantic primitives |

### Select / Dropdown Rules

**Any selection input — filter, form field, bulk-assign, taxonomy picker, role picker, etc. — with MORE THAN 5 options MUST use `<PaginatedSelect>` from `@mohasinac/appkit`.** No exceptions.

| Option count | Component | Mode |
|---|---|---|
| ≤ 5 | `<Select>` / `<FieldSelect>` (native) or inline `<Checkbox>` group | — |
| > 5 single-select | `<PaginatedSelect value onChange loadOptions>` | default (multiple omitted) |
| > 5 multi-select | `<PaginatedSelect multiple value onChange loadOptions>` | `multiple` |
| Any of the above + "+ Create new" | add `createLabel` + `renderCreateForm` OR `createFields`+`onCreateSubmit` | works in both modes |

`<PaginatedSelect>` lives at `appkit/src/ui/components/PaginatedSelect.tsx` and replaces the previous trio (`DynamicSelect` / `InlineCreateSelect` / `PaginatedMultiSelect` — all removed). The create flow opens a `SideDrawer` (custom form via `renderCreateForm`) or a `QuickFormDrawer` (auto-generated from `createFields`), and the newly created option is auto-selected.

Rules:
1. **>5 options = search is mandatory.** Never render a long native `<select>`, `<option>` list, or stacked checkbox list — users cannot scan it.
2. **One primitive, two modes.** Use `multiple` when the user picks N values (renders chips + checkboxes); omit it for single-select (renders a label + auto-closes on pick).
3. **Async pagination.** Pass `loadOptions(query, page) => Promise<AsyncPage<PaginatedSelectOption>>` for server-side search; the component handles debounce, "Load more", and merging across pages.
4. **Static options too.** If a constant list has >5 entries, pass it via the `options` prop; the component filters in-memory against `query`.
5. **Inline create.** Any place a user might legitimately need a new value (categories, brands, tags, addresses, payout accounts, etc.), pass `createLabel` + `renderCreateForm` (custom form) or `createFields`+`onCreateSubmit` (auto-generated `QuickFormDrawer`).
6. **No bespoke search-dropdowns.** Don't roll your own `<input>` + filtered `<ul>` — `PaginatedSelect` already handles keyboard nav, ARIA, selected-chip semantics, and the create-drawer wiring.
7. **Type imports.** Use `PaginatedSelectOption<V>` and `AsyncPage<T>` from `@mohasinac/appkit/ui` for `loadOptions` factory signatures.

### Color Token Rules

| Instead of | Use |
|------------|-----|
| `text-red-600` / `bg-red-50` (error/danger context) | `text-error` / `bg-error-surface` |
| `text-green-600` / `bg-green-50` (success context) | `text-success` / `bg-success-surface` |
| `text-amber-600` / `bg-amber-50` (warning context) | `text-warning` / `bg-warning-surface` |
| `text-blue-600` / `bg-blue-50` (info context) | `text-info` / `bg-info-surface` |
| `text-zinc-*` / `bg-zinc-*` (neutral) | Acceptable — zinc/slate are structural neutrals |
| `#3570fc` / `#8393b2` raw hex | `var(--appkit-color-primary)` or Tailwind token |

Centralized status colors live in `src/constants/theme.ts` (`THEME_CONSTANTS.badge.*`, `.accent.*`, `.colors.alert.*`). Reference those constants for status styling; don't duplicate raw classes.

### Surface & Padding Props

Layout primitives (`Stack`, `Row`, `Grid`, `Container`, `Section`, `Div`) accept:
- `surface`: `"none"` | `"default"` | `"muted"` | `"subtle"` | `"inset"` | `"card"` | `"elevated"` | `"interactive"` | `"glass"` | `"form"`
- `padding`: `"none"` | `"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"` | `"card"` | `"section"` | `"page"` | `"inline"`
- `rounded`, `border`, `shadow` — similar token maps

Prefer props over raw className for these concerns. `className` is the escape hatch.

### Inline Style Rules

`style={{}}` is blocked by `audit-inline-styles.mjs` (baseline 473). Acceptable exceptions:
- CSS custom properties (`style={{ "--var": value }}`)
- Dynamic values impossible with classes (`style={{ top: offset }}`)
- Third-party library requirements
- Allowlisted files: RichTextRenderer, ImageCropModal, ImageEditor, VideoTrimModal, CameraCapture, MediaSlider, HeroCarousel, SpinWheelView

---

## Animation Rules

> `motion` (v12.x) is installed in appkit. All animation primitives are in `appkit/src/ui/components/Motion.tsx`.

### Available Components

| Component | Use for |
|-----------|---------|
| `FadeIn` | Fade-in on mount (opacity 0→1) |
| `SlideUp` | Slide up + fade on mount |
| `ScaleIn` | Scale in from 95% + fade |
| `Collapse` | Accordion expand/collapse |
| `SlideIn` | Slide from edge (side prop) |
| `AnimatedList` | Staggered children animation |
| `AnimatedDiv` / `AnimatedStack` / `AnimatedRow` | motion-enabled layout primitives |
| `PressScale` / `HoverLift` | Micro-interaction wrappers |
| `Draggable` / `Swipeable` | Gesture-enabled containers |

### Rules

1. **All motion components are `"use client"`** — never import in server components.
2. **`useReducedMotion()`** is respected automatically — all components check `prefers-reduced-motion` and skip animation when enabled.
3. **Server components cannot use motion** — if a server component needs animation, the animated section must be a separate client component.
4. **Modal/Drawer/SideModal** already have AnimatePresence wired — don't add extra motion wrappers around them.
5. **Card `animate` prop** — use `animate="hoverLift"`, `"pressScale"`, `"hoverScale"`, or `"both"` instead of custom motion.
6. **DataTable card grid** uses `AnimatedList` by default — no extra wiring needed.
7. **Toast** has AnimatePresence — individual toasts slide in/out automatically.

### Spring Tokens

Defined in `appkit/src/tokens/motion.ts`:
- `SPRING_SNAPPY` — fast UI (200ms feel)
- `SPRING_GENTLE` — smooth overlays (300ms feel)
- `SPRING_BOUNCY` — playful interactions
- `DURATION_*` — `FAST` (150ms), `NORMAL` (250ms), `SLOW` (400ms), `ENTER` (300ms), `EXIT` (200ms)

---

## Media Upload Rules

> Upload flow: Client → signed URL → Firebase Storage → media slug returned. Bytes never go through Next.js (4.5 MB request cap).

### Components

| Component | Purpose |
|-----------|---------|
| `MediaUploadField` | Full upload field with preview, progress, remove. Supports `multiple` prop. |
| `ImageUpload` | Image-specific upload with optional `enableAdvancedCrop` for crop/rotate/zoom. |
| `ImageEditor` | Advanced crop/rotate/zoom modal (react-advanced-cropper). |

### Rules

1. **Never upload bytes through API routes** — use the signed-URL flow (`/api/media/sign` → PUT to Storage → `/api/media/finalize`).
2. **All Firestore URLs use `/media/<slug>`** — never store raw `firebasestorage.googleapis.com` URLs.
3. **`generateMediaFilename(ctx)`** generates SEO slugs — always pass the correct context type and slug.
4. **tmp/ prefix** — uploads start in `tmp/` path; `finalize` moves to permanent path. Aborted uploads are auto-cleaned by `mediaTmpCleanup` Firebase Function.
5. **Image editor** — enable via `enableAdvancedCrop` prop on `ImageUpload`. Supports aspect ratio presets (Free/1:1/4:3/16:9/3:2), rotate, flip.
6. **Multi-select** — pass `multiple` to `MediaUploadField` for batch upload. Files upload sequentially with individual progress.
7. **FormShell Zod validation** — pass `schema` prop to auto-validate on publish; `validateOnChange` for live validation.
