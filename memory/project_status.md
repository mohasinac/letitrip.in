---
name: Project Status
description: Current session status, appkit version, and recent session summary for letitrip.in
type: project
---

## Current Status — Hotfix 88.1 ✅ (2026-05-11)

**Hotfix 88.1 complete** — Listing pages now load items. Next: Session 89 (Query/Sieve).

- appkit version: 2.4.11 (file:./appkit local, dist rebuilt + node_modules synced)
- Both repos: 0 TS errors
- Firestore indexes: 279 indexes deployed (sellerId stale → storeId corrected, 7 stale deleted)

## Hotfix 88.1 — 2026-05-11 ✅ (Listing Page Items Bug)

- Root cause: Firestore indexes not deployed + stale `sellerId` indexes (Session 81 renamed to `storeId`)
- Fix 1: `appkit/firebase/base/firestore.indexes.json` — replaced 7 `sellerId` product indexes with `storeId`
- Fix 2: `ProductsIndexPageView` — `sellerId==${sellerId}` filter corrected to `storeId==${storeId}`
- Fix 3: `/api/products/route.ts` — removed duplicate `storeId` push (was added twice)
- Fix 4: `useProducts.ts` — `null initialData` now treated as missing (`!= null` vs `!== undefined`) so client refetches instead of freezing with staleTime=Infinity
- Ran `firebase-merge.mjs` to regenerate root `firestore.indexes.json`, deployed with `--force`

## Session 88 — 2026-05-10 ✅ (RC4 + RC3)

**Session 88 complete** — RC4 + RC3 done.

- appkit version: 2.4.11 (file:./appkit local, dist rebuilt + node_modules synced)
- Both repos: 0 TS errors

**Why:** RC4 removes ambiguous `[[...action]]` catch-all folders that coexist with dedicated `/new` and `/[id]/edit` routes. RC3 fixes all `<Button onClick={() => router.push(...)}>` violations to use `<Link>` or `asChild` pattern.

---

## Session 87 — 2026-05-10 ✅ (Social Feed S1–S5)

- S1: GET /api/social-feed + 4-platform fetchers (Instagram/Facebook/TikTok/DeviantArt)
- S2: SocialFeedSection RSC + SocialPostCard with 3 layouts, error/empty states
- S3: renderSocialFeedBuilder() in AdminSectionsView, wired in renderTypedBuilder()
- S4: 7 social credential fields (Meta/TikTok/DeviantArt) in AdminSiteSettingsView ⑧ Integrations
- S5: Disabled seed entry pre-exists in homepage-sections-seed-data.ts
- Fixed pre-existing dynamic() chart TS errors + replaced hardcoded hex with CSS vars

## Hotfix 87.1 — 2026-05-10 ✅ (CSS display utilities + dev memory)

- Added responsive display utility safelist to tailwind.config.js (lg:block, lg:flex etc.)
- Capped dev server Node heap: 4096 → 2048 MB
- vercel --prod deployed, navbar visible on www.letitrip.in

## Session 86 — 2026-05-10 ✅ (Grouped Listings GP1+GP2)

- GP1: Group fields on ProductDocument + 7 batch-write repo methods + ShowGroupSection component
- GP2: GroupSettingsPanel + store/admin CRUD API routes (8 total)
- Seed: grouped-listings-seed-data.ts (8 bundles) + Firebase indexes
- appkit 2.4.10 published

## Session 85 — 2026-05-10 ✅ (Sub-listing Categories SC1–SC4)

- SC1–SC4: Full sub-listing category system (schema + admin CRUD + store CRUD + public page)
- appkit 2.4.6 published
