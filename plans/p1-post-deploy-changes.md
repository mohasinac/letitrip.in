# Redeploy + Appkit Publish — 2026-07-31

## Context

Three changes landed this session but the deploy process was messy (manual package.json swaps, no committed lockfile transition). This plan does a single clean publish + deploy cycle to put everything in a known state.

**What shipped this session (all need to be in the clean deploy):**
| Change | Status |
|---|---|
| Nav auto-close on route change (`AppLayoutShell` + `DashboardLayoutClient`) | appkit 3.2.4 published ✓, deployed ✓ |
| Seed panel UI — clear-all preserves Auth users, "Nuclear" label, auth error hint | consumer commit `20f31edfa` deployed ✓ |

**Current lockfile problem:** `package.json` says `"file:./appkit"` but `package-lock.json` already resolves from npm registry (3.2.4). `npm ci` on Vercel would fail if run from this state. Previous deploys worked only because Vercel reused a cached lockfile.

---

## Change A — Update "Clear All Data" preserve list

**Goal:** When admin clicks "Clear All Data", wipe every collection (products, stores, orders, reviews, users Firestore docs, etc.) BUT preserve:
- `siteSettings` — platform config + SEO defaults
- `homepageSections` — generic layout config
- `faqs` — basic SEO help content (user: "keep faq seeds", "basic site and seo pages")

**Why:** Real users will add their own products/stores/listings. The fake seed data is removed. Site settings, homepage sections, and FAQs form the foundation of a real site (SEO pages, help center, feature flags).

**File 1 — `src/app/api/demo/seed/route.ts`** (change A1):

In the `else if (action === "clear")` block, add a skip set at the top:

```ts
const CLEAR_PRESERVE = new Set<CollectionName>(["siteSettings", "homepageSections", "faqs"]);
```

In the loop, skip preserved collections:
```ts
if (CLEAR_PRESERVE.has(collectionName)) {
  emit({ type: "progress", collection: collectionName, status: "done", done: ++progressDone, total });
  continue;
}
```

Update done message:
```ts
`Cleared all Firestore data. Preserved: site settings, homepage sections, FAQs + all Auth logins.`
```

**File 2 — `src/components/dev/SeedPanel.tsx`** (change A2):

Update confirmation text:
```
"Wipe all data? Keeps: site settings, homepage, FAQs + all logins"
```

Add a `TEMPLATE_COLLECTIONS` constant:
```ts
const TEMPLATE_COLLECTIONS: SeedCollectionName[] = ["siteSettings", "homepageSections", "faqs"];
```

Add a `seedTemplates` function (calls `run("load", TEMPLATE_COLLECTIONS, false)`) and a **"⚡ Seed Templates"** button in the quick-actions row:
```tsx
<Button size="sm" variant="outline" onClick={seedTemplates} disabled={isRunning} className="shrink-0">⚡ Seed Templates</Button>
```

Place it in the **P-1 section** of the quick-actions row alongside Reset Seed / Remove Seed.

---

## Change C — Trim SeedPanel: hide zero-seed collections by default

**Goal:** Remove the visual noise of collections that have no seed data (seed count = 0). These show up in the list but can't actually be loaded. Examples: `roleOverrides`, `customRoles`, `adminNotifications`, `payoutMethods`, `shippingConfigs`, `analyticsCards`, `analyticsAlerts`, `storeCategories`, `listingTemplates`, `moderationQueue`, `reports`, `itemRequests`, `storeWhatsAppConfig`, `storeGoogleConfig`.

**Implementation in `src/components/dev/SeedPanel.tsx`:**

1. Use the `status` data (from the `GET /api/demo/seed` response) to know `seedCount` per collection.
2. Filter the displayed collection list: hide any collection where `seedCount === 0` AND the collection has no existing DB docs (`existingCount === 0`). If it has existing DB docs, still show it (so admin can delete if needed).
3. Add a "Show all" toggle in the toolbar (small link) to reveal zero-seed collections if needed.

**What stays visible always:**
- Any collection with `seedCount > 0`
- Any collection with `existingCount > 0` (has real data in DB)
- Any collection the user has manually selected

This makes the default view much cleaner — only collections that can actually be seeded or have real data.

---

## Change B — Run purge directly from local machine (no UI required)

**Goal:** Clear the Firestore data right now via admin SDK (script), without needing the user to be logged in at the seed panel UI. This is equivalent to "Clear All Data" but run locally.

**Approach:** A one-off Node.js script (`scripts/purge-now.mjs`) that:
1. Loads `firebase-admin-key.json` (already present)
2. Lists all collections from `COLLECTION_MAP` in the seed route
3. Skips `siteSettings` and `homepageSections`
4. Calls `purgeCollection` (batch-delete in chunks of 500) on everything else
5. Logs progress per collection
6. Does NOT touch Firebase Auth

**Collections to preserve:** `siteSettings`, `homepageSections`, `faqs`

**Collections to skip because they're subcollections:** `couponUsage` (under users — auto-dropped when user docs go)

**Implementation:** The script reuses the same collection name list as the seed route's `COLLECTION_MAP`. It's a throwaway script — run once, then delete.

---

## Change D — Filter homepage sections by feature flags

**User request:** "remove non patch sections from homepage too based on features, fix other places ui too"

**Goal:** The homepage should only render sections whose corresponding feature is enabled. Currently, seeded `homepageSections` include sections for events, prize draws, auctions, bundles, etc. — these should be hidden if the feature is off.

**Approach — server-side filtering in the homepage section data fetch:**

In `appkit/src/_internal/server/features/homepage/data.ts` (or wherever `getHomepageSections()` is defined):
- After fetching sections from Firestore, filter out sections whose `type` maps to a disabled feature.
- The feature flags come from `siteSettings.featureFlags` (already fetched for the homepage).

**Section type → feature flag mapping** (add as a constant in the data file):
```ts
const SECTION_FEATURE_GATE: Partial<Record<HomepageSectionType, keyof FeatureFlags>> = {
  "events-upcoming": "events",
  "events-calendar": "events",
  "prize-draws": "prizeDraws",
  "spin-wheel": "prizeDraws",
  "bundles-featured": "bundles",
  "auction-countdown": "auctions",
  "auction-live": "auctions",
};
```

Filter logic:
```ts
sections.filter(s => {
  const flagKey = SECTION_FEATURE_GATE[s.type];
  if (!flagKey) return true; // no gate = always show
  return featureFlags[flagKey] !== false;
});
```

**"Fix other places ui too":** 
- The same `SECTION_FEATURE_GATE` pattern applies to the admin homepage section editor — in `AdminHomepageSectionsView`, grey-out or hide section types that correspond to disabled features so admin can't accidentally enable a section for a disabled feature.
- Check the admin sections view for a `sectionTypes` list and wrap each section type entry with a feature-flag guard.

---

## Execution Order

### Step 1 — Implement Change A (route + SeedPanel)

**`src/app/api/demo/seed/route.ts`** — in the "clear" action block:
- Add `CLEAR_PRESERVE` set with `"siteSettings"`, `"homepageSections"`, `"faqs"`
- Skip those in the loop (emit "done" without calling `purgeCollection`)
- Update done message

**`src/components/dev/SeedPanel.tsx`**:
- Add `TEMPLATE_COLLECTIONS = ["siteSettings", "homepageSections", "faqs"]` const
- Add `seedTemplates()` function
- Add "⚡ Seed Templates" button in P-1 quick-actions row
- Update confirmation text: "Keeps: site settings, homepage, FAQs + all logins"

### Step 2 — Implement Change C (hide zero-seed collections)

In `src/components/dev/SeedPanel.tsx`, filter out collections where `seedCount === 0 && existingCount === 0`. Add `showAll` state (default false) and a "Show all" toggle.

### Step 3 — Implement Change D (homepage feature-flag filtering)

- Read `appkit/src/_internal/server/features/homepage/data.ts` to find the sections fetch
- Add `SECTION_FEATURE_GATE` map
- Filter sections after fetch based on `siteSettings.featureFlags`
- Read `appkit/src/features/admin/components/AdminHomepageSectionsView.tsx` — add disabled/greyed state for section type options mapped to disabled features

### Step 4 — Run Change B (local purge script)

Write `scripts/purge-now.mjs` that preserves `siteSettings`, `homepageSections`, `faqs`. Run it, verify output, then delete the script.

### Step 5 — Quality gate

```powershell
npm run check
```

Fix any issues. Commit all code changes (Changes A + C + D).

### Step 6 — Publish appkit 3.2.5 (needed for Change D)

Change D modifies appkit source (`_internal/server/features/homepage/data.ts`). Must publish before deploy.

```powershell
# In appkit/
# 1. Bump version in appkit/package.json: 3.2.4 → 3.2.5
# 2. npm run build
# 3. npm publish
# Consumer: update "@mohasinac/appkit": "^3.2.5"
```

### Step 7 — Clean lockfile + deploy

```powershell
# Switch to npm pin (^3.2.5)
(Get-Content package.json) -replace 'file:./appkit', '^3.2.5' | Set-Content package.json
Remove-Item package-lock.json
npm install --legacy-peer-deps
# Commit
git add package.json package-lock.json
git commit -m "chore: pin appkit ^3.2.5 (npm registry) for Vercel deploy"
git push origin main
vercel --prod
```

### Step 8 — Restore local dev pin

```powershell
(content swap back to file:./appkit)
npm install --legacy-peer-deps
git add package.json package-lock.json
git commit -m "chore: restore file:./appkit local dev pin (post-deploy)"
git push origin main
```

---

## Verification

- `vercel --prod` exits 0 with `readyState: READY`
- letitrip.in: "Clear All Data" preserves site settings, homepage sections, FAQs — wipes the rest
- "⚡ Seed Templates" button re-seeds just `siteSettings`, `homepageSections`, `faqs`
- Homepage with events/prize-draws disabled: those section types are absent
- SeedPanel default view: hides zero-seed collections; "Show all" toggle reveals them
- Nav closes on route change (already deployed in 3.2.4)

---

# P-1 Post-Deploy: Groups P / Q / R / S / U / O2 (deferred)

## Context

P-1 (MVP) is deployed and live at letitrip.in. The original groups A–O are done.
This plan covers the post-deploy groups added to `plan-a-full-end-distributed-pumpkin.md`:
P (logo fix), Q (seed data), R (layout), S (analytics), U (bundles prep), O2 (redeploy).

**Research already done — do NOT re-investigate these:**

| Item | Status | Evidence |
|---|---|---|
| P1 (logo `|| "/logo.svg"` fallback) | **ALREADY DONE** | layout.tsx:66 is `siteSettings?.logo?.url \|\| undefined` |
| Q1 (product DRAFT/isSold/zero-stock) | **ALREADY DONE** | All 58 products are PUBLISHED, isSold:false, full stock |
| Q2 (order paymentMethod) | **ALREADY DONE** | All 50 orders use `"cash"` only |
| Q3 (bundle gate in seed) | **ALREADY DONE** | `categoriesP1SeedData` excludes `bundleRows`; route.ts uses it at line 583 |
| R1 (AppLayoutShell max-width) | **ALREADY DONE** | Line 745: `mx-auto w-full max-w-screen-xl px-5 md:px-6 lg:px-8` |
| S1–S3 (usePresence hook) | **ALREADY DONE** | `src/lib/analytics/usePresence.ts` exists; called at LayoutShellClient.tsx:219 |
| U1 (P-17 Bundles in roadmap) | **ALREADY DONE** | patches-roadmap.md already has P-17 section |
| U3 (FEATURE_BUNDLES in features.ts) | **ALREADY DONE** | `"BUNDLES"` at line 25 of FEATURE_FLAGS array |

Skip all of the above. Do not "re-verify" them by touching the files.

---

## What Actually Needs Work

### Step 1 — Verify `src/lib/analytics/usePresence.ts` handles page views (S4/S5)

**Read** `src/lib/analytics/usePresence.ts`. Check:
- Does it write to `analytics/pageviews/{YYYY-MM-DD}/{encodedPath}` on each route change?
- Does it use RTDB `.transaction(count => (count || 0) + 1)` for page views?

If YES → S4/S5 are done. If NO → implement page view RTDB increment inside the existing hook (one hook, two RTDB writes: presence update + pageview count).

### Step 2 — Verify / fix Group U2

Read `appkit/src/seed/site-settings-seed-data.ts`. Check that `featureFlags.listingTypes.bundle` is `false`. If missing or `true`, set it to `false`.

### Step 3 — Group R3/R4: Text Wrapping in ProductGrid

Read `appkit/src/features/products/components/ProductGrid.tsx` (or wherever product cards are rendered — also check `BaseListingCard.tsx` or `InteractiveProductCard.tsx`). Find:
- Category/brand `<Span>` chips with `max-w-[100px] truncate` or similar hard-width clamp
- Seller name with `truncate`

Remove the `max-w-[Npx]` constraints from chips. Leave `truncate={2}` (2-line clamp) on product titles — that's intentional. Only remove hard single-line truncation on short context labels where wrapping is better.

### Step 4 — Group R5: PaginatedSelect Mobile Overflow

Read `appkit/src/ui/components/PaginatedSelect.tsx` and `appkit/src/ui/components/PaginatedSelect.style.css`.

**If** the dropdown already has `max-width: calc(100vw - 2rem)` and flip logic → skip.  
**Otherwise** implement:

1. **CSS** — in `PaginatedSelect.style.css`, add to `.appkit-ps__dropdown`:
   ```css
   max-width: calc(100vw - 2rem);
   ```
   Add new class `.appkit-ps__dropdown--up`:
   ```css
   .appkit-ps__dropdown--up {
     bottom: 100%;
     top: auto;
     margin-bottom: 0.25rem;
     margin-top: 0;
   }
   ```

2. **Component** — in `PaginatedSelect.tsx`, add a `useState<boolean>(false)` for `opensUp`. In a `useEffect` watching the open state, when the dropdown becomes open: check `triggerRef.current.getBoundingClientRect().bottom + 220 > window.innerHeight` — if true, set `opensUp(true)`. Append `appkit-ps__dropdown--up` class conditionally.

### Step 5 — Group S6–S9: Product & Category View Count

**S6** — Read `appkit/src/_internal/server/features/products/data.ts`. Find `getProductForDetail`. After the fetch, add a fire-and-forget viewCount increment:
```ts
productRepository.update(slug, { viewCount: FieldValue.increment(1) }).catch(() => {});
```
Do NOT await it.

**S7** — Read `appkit/src/features/categories/schemas/firestore.ts`. Add `viewCount?: number` to `CategoryDocument` if not already present.

**S8** — Check if `appkit/src/_internal/server/features/categories/data.ts` exists. If not, create it with a `getCategoryForDetail(slug)` function that fetches the category and fire-and-forget increments `viewCount`. If it exists, add the increment.

**S9** — In `appkit/src/seed/categories-seed-data.ts`, add `viewCount: 0` to the base row template (or to each `rawCategories` entry). This is backwards-compatible — the field is optional.

### Step 6 — Group S10–S13: AdminAnalyticsView Live Overview

**S11 — Create `AdminLiveOverviewCard.tsx`**  
File: `appkit/src/features/admin/components/analytics/AdminLiveOverviewCard.tsx`

This is a `"use client"` component. It:
- Subscribes to `rtdb.ref("presence/")` via `.on("value")` and counts total, authenticated, and guest users
- Subscribes to `rtdb.ref("analytics/pageviews/{today}/")` and sums all path counts + extracts top-5 paths
- Renders: "Active right now: N" + authenticated/guest split, "Today's views: X", top-5 pages mini-list
- Cleans up RTDB listeners in the `useEffect` return

Use the RTDB client instance from `appkit/src/providers/rtdb-firebase.ts` (or wherever the client RTDB is exported). Check the existing `usePresence.ts` to see how it accesses RTDB — follow the same pattern.

**S12 — Update `AdminTopProductsTable.tsx`** (if it exists in `appkit/src/features/admin/components/analytics/`)  
Add a `viewCount` column (header "Views", sortable, sort default DESC). If the component doesn't exist, check where top products are rendered in `AdminAnalyticsView` and add the column there.

**S13 — Seed `viewCount: 0` on products**  
Read `appkit/src/seed/products-standard-seed-data.ts`. Add `viewCount: 0` to the base product object template (or to each product entry). The field already exists on `ProductDocument` schema — this just ensures seed consistency.

**S10 — Update `AdminAnalyticsView.tsx`**  
At the top of the view body (above the existing revenue/orders stats cards), add:
```tsx
<AdminLiveOverviewCard />
```
Import it from `./analytics/AdminLiveOverviewCard`. Wrap it in `<Suspense fallback={null}>` since it's a client component with RTDB.

### Step 7 — Group U4: Admin Bundles FeatureGuard

Create `src/app/[locale]/admin/bundles/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getFlag } from "@/lib/features";

export default function AdminBundlesLayout({ children }: { children: React.ReactNode }) {
  if (!getFlag("BUNDLES")) notFound();
  return <>{children}</>;
}
```

This is a server component — `getFlag` reads the env var at request time.

### Step 8 — Group O2: Quality Gate + Redeploy

Only after all above steps are complete and verified:

1. `npm run check` — must exit 0. Fix any violations before continuing.
2. Bump `appkit/package.json` version `3.2.0 → 3.2.1` (or next patch if already bumped).
3. In `appkit/`: `npm run build` then `npm publish`.
4. In consumer: update pin `"@mohasinac/appkit": "^3.2.1"`, run `npm install`.
5. If `cleanupRtdbEvents` was extended for S4 analytics cleanup: `npm run firebase deploy --only functions`.
6. Vercel: `vercel env add FEATURE_BUNDLES false production` (if not already set).
7. `node scripts/deploy.mjs` → prod deploy.
8. Post-deploy smoke: logo wordmark visible ✓, admin analytics live panel renders ✓, `/admin/bundles` returns 404 ✓.

---

## Files to Touch (summary)

| File | Action |
|---|---|
| `src/lib/analytics/usePresence.ts` | Read only (verify S4/S5) — or add pageview increment if missing |
| `appkit/src/seed/site-settings-seed-data.ts` | Verify `featureFlags.listingTypes.bundle: false` |
| `appkit/src/features/products/components/ProductGrid.tsx` (+ card components) | Remove hard `max-w-[Npx]` on chip/seller labels |
| `appkit/src/ui/components/PaginatedSelect.tsx` + `.style.css` | Mobile overflow + flip logic (if not present) |
| `appkit/src/_internal/server/features/products/data.ts` | Add fire-and-forget viewCount increment |
| `appkit/src/features/categories/schemas/firestore.ts` | Add `viewCount?: number` |
| `appkit/src/_internal/server/features/categories/data.ts` | Create or extend with viewCount increment |
| `appkit/src/seed/categories-seed-data.ts` | Add `viewCount: 0` to base entries |
| `appkit/src/seed/products-standard-seed-data.ts` | Add `viewCount: 0` to products |
| `appkit/src/features/admin/components/analytics/AdminLiveOverviewCard.tsx` | Create (new file) |
| `appkit/src/features/admin/components/analytics/AdminTopProductsTable.tsx` | Add viewCount column |
| `appkit/src/features/admin/components/AdminAnalyticsView.tsx` | Add `<AdminLiveOverviewCard />` at top |
| `src/app/[locale]/admin/bundles/layout.tsx` | Create with FeatureGuard("BUNDLES") |
| `appkit/package.json` | Bump version 3.2.0 → 3.2.1 |
| Consumer `package.json` | Update appkit pin |

---

## Verification

- `npm run check` exits 0 (all audits including feature-flags, direct-fetch-ui, etc.)
- Admin analytics page: "Active right now" card renders with RTDB data
- Product detail page: viewCount increments in Firestore on each visit
- `/admin/bundles` with `FEATURE_BUNDLES=false` → 404
- PaginatedSelect on iphone-13 (390px): dropdown doesn't overflow viewport
- appkit published to npm, consumer pin updated, Vercel deploy successful
