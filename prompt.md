# letitrip.in — Master Working Prompt

> **Paste at the start of every session.** Single-lane working model (Lane A/B split wound down 2026-05-12).
> Task status → `crud-tracker.md` (authoritative) · Session log → `newchange.md` · Rules + slugs + Hobby caps → `CLAUDE.md` · Re-sequence plan → `~/.claude/plans/update-and-plan-the-delegated-bumblebee.md`

---

## 📌 UPDATE-CADENCE RULE (READ FIRST, EVERY SESSION)

**This file MUST be updated:**

1. **Before every commit** — the LAST / CURRENT / NEXT block below must reflect what the commit just did. If you commit without updating this file, the next session loses the thread.
2. **At session end** — collapse the prior CURRENT into LAST (keep only ONE last block), set CURRENT to the next ⏳ task, and prune the NEXT list.

Skipping this rule is the same as breaking CLAUDE.md Rule #1.

---

## 🚀 PROD-DEPLOY SAFETY RULE (NEW — 2026-05-12)

**Every commit on `main` must be prod-deployable.** Every session ends with `npm run check` exit 0 AND a green smoke-test of the touched routes. If a change isn't ready for `vercel --prod`, hold it on a branch — never push half-shipped state to `main`.

This replaces the prior "feature branches accumulate, ship in batches" model. Each session = one prod-deployable commit (or a small cohort), with seed data + Firestore indices + Firebase Functions updated in the same session as the code that needs them.

---

## ✅ PER-SESSION REFACTOR CHECKLIST (apply to every file the session touches)

Every file we open gets the standard treatment in the same commit. Don't defer architectural cleanup to a future tier — it never lands.

```
□ ROUTES        Page paths via ROUTES.*; API paths via API_ROUTES.*; nav groups from
                @/constants/navigation. No hardcoded "/products" strings.
□ TOKENS        Colors via var(--appkit-color-*) or Tailwind tokens (no raw hex).
                z-index via var(--appkit-z-*). Spacing/font/shadows via named tokens.
□ WRAPPERS      <Div>/<Row>/<Stack>/<Text>/<Heading>/<Section>/<Container> — no raw
                <div>/<span> in feature components.
□ SSR LAYERING  Server work goes to appkit/src/_internal/server/features/<x>/ in the
                data/adapters/actions/metadata/og layered template. Pages are thin shims.
□ REPO HOOKS    Mutations go through repository methods that extend BaseRepository — no
                direct Firestore calls from API routes. createWithId overridden when PII
                or validation is required.
□ ROLE GATE     requireRoleUser() / requireRoleSeller() / requireRoleAdmin() on every
                protected route. Tag with `// TODO(RBAC)` so S9 sweep finds it.
□ SEED          appkit/src/seed/<collection>-seed-data.ts updated for every schema add
                or field change. SeedPanel FieldDef[] + PII labels updated too.
□ INDICES       appkit/firebase/base/firestore.indexes.json updated for any new
                multi-where + orderBy query. Run firebase-merge.mjs after.
□ HOBBY CAPS    Paginate ≤50, ≤3 sequential Firestore round-trips per handler, no
                full-collection .get(). Heavy work → functions/. (CLAUDE.md Rule #6)
□ CHECK         npm run check exits 0 before the session is marked ✅. (Rule #5)
```

---

## 🚢 PER-SESSION PROD-DEPLOY CHECKLIST (run before the closing commit)

```
□ INDICES       If indexes changed: appkit/scripts/firebase-merge.mjs →
                firebase deploy --only firestore:indexes
□ FUNCTIONS     If functions/ changed: firebase deploy --only functions
□ SEED          If seed shape changed: hit /demo/seed against staging Firestore,
                verify counts via GET /api/demo/seed
□ SMOKE         npm run dev — touched routes render, dark mode repaints, mobile 375px
                fine. Hobby parity banner [dev-next] visible.
□ DEPLOY        After user confirms: vercel --prod. Auto-deploy is disabled per
                vercel.json — never push to main expecting Vercel to pick it up.
```

---

## 📋 SESSION STATE (single source of truth for "where are we")

> Keep exactly **1 LAST**, **1 CURRENT**, and a short **NEXT** list. Update on every commit.

### ✅ LAST COMPLETED — S-SBUNI-5 Bundle checkout finalize (closes Phase 1) (2026-05-13)

Bundle commerce loop end-to-end functional. 8 commits across appkit (5) + main (3). Quality gate ends 0 errors. **No new infra deploys this session** — schema fields already shipped in S-SBUNI-4, no new indices, no new Functions.

- **Slice CTA** — `BundleAddToCartCta` client island (qty input clamped 1..10 + Add button w/ isLoading + inline error + `useToast` feedback; out-of-stock bundles render disabled CTA). `BundleDetailView` gains optional `onAddToCart` prop. New `addBundleToCartAction({ bundleSlug, quantity })` in `src/actions/cart.actions.ts` (requireAuthUser + per-uid rate-limit + zod). `/bundles/[slug]/page.tsx` passes the action.
- **Slice CHECKOUT** — new `_internal/server/features/checkout/bundle-expansion.ts` (`getCartItemMemberIds` / `getExpandedDecrements` / `validateCartItemStock`). Both COD pre-tx/in-tx loops + Razorpay-paid path rewired around the helper. Per-product decrement collapses to ONE update per unique member (cumulative-decrement aware so two cart lines sharing a member don't double-count or pass when summed demand exceeds stock). `unitPriceFor(item, product)` helper picks `item.price` (locked bundlePriceInPaise) for bundle lines, `product.price` for regular lines — used in cartSubtotal / groupTotal / coupon-eligible-total / cartSubtotalRs.
- **Slice ORDER-UI** — new `appkit/src/features/orders/utils/bundle-grouping.ts` exports `groupOrderItemsByBundle(items)` returning ordered `BundleOrderGroup` discriminated union. `/user/orders/view/[id]` renderItems rewritten — bundle groups render under "Bundle: <name>" header + member-count chip inside a bordered card; member rows nest via the same renderItemRow helper that handles regular rows + prize-draw badges.
- **Slice ADMIN-DYN** — new `BundleDynamicRuleEditor` (filter inputs categorySlug/brandSlug/tags/listingType + orderBy Select + numeric limit clamped 1..BUNDLE_MAX_ITEMS). `AdminBundleEditorView` ruleType Select toggles between `BundleItemsPicker` (static) and the dynamic editor. handleSave branches on ruleType. `BUNDLE_COPY.adminEditor.ruleType*` + `dynamic.*` strings centralised.

**Phase 1 of Tier SB-UNI now closed.** All SB-UNI Phase 1 rows complete: A · B · C · D · E · V · Bundle-UI · Bundle-Checkout. Phase 2+ (ListingType union: classified / digital-code / live · catalog/offer split · per-type checkout / FormShell / CTA registry) remains independent pull-when-prioritised cohorts.

---

### ✅ Previous (parallel) — S8 Event Raffles + dashboard tab constants (2026-05-13)

S8 cohort closed (SB9 fully + SB10-B/D fully + SB10-C partial). Quality gate ends 0 errors in both appkit and root; `npm run check:audits` clean. **Deploy held** — new Firestore indices + admin/spin API routes sit with the S7 prize-draws ops cohort.

- **SB9 schema (A/B/C)** — `EventType` extended with `"raffle" | "spin_wheel"`. `EventDocument` gains 12 raffle/spin fields (config + result + spin-prizes block); new `RaffleType` and `SpinPrize` interfaces exported from types. `EventEntryDocument` gains `raffleEligible` + `spinUsed` + `spinPrizeId` + `spinPrizeCouponCode` + `spinWonAt`. `EventItem` mirrors with string dates. `EVENT_FIELDS.TYPE_VALUES.RAFFLE` / `SPIN_WHEEL` + `EventCard` icons (🎟️/🎡) added.
- **SB9-D/E surface** — prep3 handlers already wrapped in jobs/handlers; this session added `triggerEventRaffleAction` + `assignSpinPrizeAction` in `_internal/server/features/raffle/actions.ts` (build a JobContext around `getAdminDb` and call `runTriggerEventRaffle` / `runAssignSpinPrize`). Re-exported from `@mohasinac/appkit/server`. Next.js routes: `POST /api/admin/events/[id]/trigger-raffle` (admin only) + `POST /api/events/[id]/spin` (auth).
- **SB9-F winner page** — `EventRaffleWinnerView` in appkit (winner card + prize + pool size + fairness-proof URL link with shape-agnostic `RaffleWinnerEvent` interface accepting both `EventItem`/`EventDocument`). Page shim at `src/app/[locale]/events/[id]/winner/page.tsx` + new `ROUTES.PUBLIC.EVENT_WINNER`.
- **SB9-G spin wheel** — `SpinWheelView` client component with 3.2s CSS keyframe decelerating spin, `onSpin` callback contract, in-window enforcement, already-spun guard, coupon-code reveal in won-prize card.
- **SB9-H admin editor** — Raffle config section in `AdminEventEditorView`: hasRaffle toggle (auto-enabled for raffle/spin_wheel types), raffleType select, top-N input, prize description, coupon ID, full spin-prizes editor (label/coupon/weight/isActive/remove + add row), spin window pickers, "Trigger Raffle Now" button calling the new admin route, read-only winner display after trigger. `/api/admin/events` schema widened to accept raffle/spin_wheel types + raffle/spin fields.
- **SB9-I indices** — 3 new composites: `eventEntries (eventId, status, points DESC)`, `eventEntries (eventId, status, createdAt)`, `events (hasRaffle, status, raffleWinnerUserId)`. `firebase-merge.mjs` run.
- **SB10-B/D** — `src/constants/dashboard-tabs.ts` exports all 12 spec'd tab sets (STORE_LISTINGS reuses appkit's SELLER_LISTING_TABS; STORE/USER/ADMIN orders share the same shape). `src/constants/index.ts` re-exports them. Main appkit barrel now also exposes `CATEGORY_PAGE_TABS` / `STORE_PAGE_TABS` / `SELLER_LISTING_TABS` / `SEARCH_RESULT_TABS`.
- **SB10-C (partial ⚠️)** — `StoreDetailLayoutView` listing-type rows refactored to derive from `STORE_PAGE_TABS` + a `STORE_LISTING_HREF` map. Long tail (admin/seller/blog/event listing views + user profile tabs) still has inline arrays — pull as files are touched.

**Required user follow-ups** (no code action this session):
- `firebase deploy --only firestore:indexes` — 3 new SB9 composites (folds into S7 prize-draws ops cohort).
- `firebase deploy --only functions` — `triggerEventRaffle` / `assignSpinPrize` callable handlers already in prep3 code; Next.js routes use the in-Vercel JobContext path so the deploy is only needed if you also want the Firebase callable endpoint exposed.
- No `vercel --prod` per standing instruction.

**Deferred / spun out**:
- SB10-C full sweep — remaining inline tab arrays in admin/seller/user views.
- Pre-existing uncommitted `BundleItemsPicker.tsx` had a `size="xs"` Button prop type error from prior session; resolved during this session's appkit rebuild via fresh tsbuildinfo.

---

### ✅ Previous — S-SBUNI-3 Phase 1 A + E + bundle UI public read paths (2026-05-13)

Two SB-UNI cleanup rows closed plus restored the public bundle read surface deleted in SB-UNI-V. 6 commits across appkit (3) + main (3). Quality gate ends 0 errors. Operational follow-ups outstanding: `POST /demo/seed` + `firebase deploy --only firestore:indexes`. No `vercel --prod` per standing instruction.

- **SB-UNI-E discriminator cleanup** — 3 drifted `UserRole` definitions (4/5/4 roles) consolidated onto the canonical 5-role union in `features/auth/types`; `moderator` kept (33+ usages). New `features/auth/role-predicates.ts` exports `isAdminUser` / `isSellerUser` / `isModeratorUser` / `isEmployeeUser` / `isBuyerUser`. `productQueryHelpers` gains `prizeDraws` + `standardListings`. `isPrizeDrawListing` surfaced through public barrels. `NonRefundableListingType` narrowed to `"prize-draw"`. Sitemap data-layer's `"bundle"` literal dropped. 6 orphan `bundles` composite indices dropped from base indexes file.
- **SB-UNI-A addresses unification** — new top-level `addresses` collection with `ownerType: "user"|"store"` + `ownerId`. New `AddressesRepository extends BaseRepository` (createWithId + update PII-encryption overrides). 2 old repos + 2 old action files deleted (thin shim actions kept). 5 API routes + `/api/user/export` + `/api/payment/preorder` + `_internal/server/features/{account,checkout}` + checkout-actions rewired. Seed route + manifest + SeedPanel merge both legacy arrays into one ownerType-tagged write/purge branch. 2 new composites: `(ownerType, ownerId, createdAt desc)` + `(ownerType, ownerId, isDefault)`. CLAUDE.md addresses-row rewritten.
- **Bundle UI rebuild (public read paths)** — `/bundles/[slug]/page.tsx` rebuilt (was 404 since V); new `BundleDetailView` in appkit (cover + price + stock badge + description + members grid, add-to-cart explicitly disabled w/ aria-live hint). New `_internal/server/features/bundles/{data,metadata,index}.ts` (`getBundleForDetail` / `listBundleMembers` / `listFeaturedBundles` wrapped in `React.cache`; `buildBundleMetadata(doc, opts)` brand-agnostic). `FeaturedBundlesSection` un-stubbed — was returning `null` since V. `SectionData` gains `bundles?: CategoryDocument[]`; homepage view fetches via `listFeaturedBundles(8)` gated by section presence.

**Required user follow-ups** (no code action this session): `POST /demo/seed` to wipe legacy subcollections + reseed top-level addresses; `firebase deploy --only firestore:indexes` for the two new addresses composites.

**Spun out to S-SBUNI-4** (carry-overs):
- Bundle admin editor (list / new / edit pages) — needs the multi-select product picker UI design call.
- Bundle cart-line `{bundleCategorySlug, qty}` + N-product order-line checkout expansion.
- Bundle OG renderer — covered by the existing 5-baseline OG follow-up.

---

### ✅ Previous — S-BUGFIX Functions deploy + appkit 2.6.3 release + smoke refactor (2026-05-13)

Three production-deployable bugs caught by `scripts/qa/smoke-prod.mjs` closed in a single cohort, plus a substantial smoke-test refactor centralising constants. `appkit@2.6.2 → 2.6.3` published (one publish only, per "don't publish multiple appkit"). Indices + Functions + Vercel re-deployed.

- **J18 listingType alias** — `FILTER_ALIASES.listingType` rejected canonical tokens `standard` and `pre-order` (only accepted legacy aliases) → Sieve clause silently dropped → `/api/products?listingType=standard` returned the unfiltered list. Fixed via `LISTING_KIND_ALIAS_MAP` accepting both canonical and legacy forms. Regression guard in `01-public-sieves.mjs` + `15-firebase-functions.mjs`.
- **J19 RBAC leaks** — `/api/store/{orders,analytics,payouts}` were `auth: true` with no `roles:` guard, returning 200 (empty data) to buyers. New `src/constants/api-roles.ts` defines `ROLES_STORE_WRITE` + `ROLES_ADMIN_ONLY` + `ROLES_ADMIN_MOD` + `ROLES_STORE_READ` + `ROLES_ANY_STAFF`; all three routes adopt `ROLES_STORE_WRITE`. Future API routes should consume the same constants.
- **J20 Functions ADC** — `admin.ts` + `admin-app-lite.ts` threw "Firebase Admin credentials not found" inside Firebase Functions because neither `firebase-admin-key.json` nor `FIREBASE_ADMIN_*` env vars are present there (ADC via metadata server is the canonical path). Added third detection branch: `FUNCTION_TARGET || K_SERVICE || FIREBASE_CONFIG || GOOGLE_APPLICATION_CREDENTIALS` → `initializeApp()` with no credential. Every Function was 500 before this; now Function init succeeds.
- **J21 secret auto-bind** — `bindHttps` adapter was reading `process.env[secretEnvVar]` but the deployed function had no env-var binding (Firebase Functions v2 needs `secrets: [...]` in `onRequest` options). Adapter now auto-pushes `secretEnvVar` (plain string, not `defineSecret` Param) into `httpsOptions.secrets[]` — skips firebase-tools' `.env.<project>` preflight. Manifest now declares `secretEnvironmentVariables:[{key:LETITRIP_INTERNAL_SECRET, version:2}]` per HTTPS endpoint. **Done-but-verify**: runtime still returns 401 because the Cloud Run compute SA (`949266230223-compute@developer.gserviceaccount.com`) lacks `roles/secretmanager.secretAccessor` on the secret. Q1-iam in tracker covers the follow-up — single `gcloud` command fixes it.
- **J22 `/api/products` fallback** — `callListingProcessor` upstream errors were bubbling to a generic 500. Wrapped in its own try/catch with `productRepository.list` fallback. Necessary because J21's IAM gap leaves the function 401 — without the fallback `/api/products` was 500 on prod after the new Vercel build.
- **Q4 smoke constants** — `scripts/qa/_constants.mjs` mirrors the TS source-of-truth for `LISTING_TYPES`, `LEGACY_LISTING_ALIASES`, `SLUG_PREFIXES`, `SEEDED_TIER0_CATEGORIES`, `SEEDED_STORES_WITH_PRODUCTS`, `HTTP_STATUS`, `STATUS_GROUPS`, `USER_ROLES`, `FIREBASE_FUNCTIONS`, `LISTING_REQUEST_KEYS`, `LISTING_COLLECTIONS`. `01-public-sieves.mjs` + `13-roles-access.mjs` + new `15-firebase-functions.mjs` all consume it. Tier=1 assertion fixed to check `parentIds[]` (canonical schema) not the legacy singular `parentId`. RBAC denial check accepts `405` alongside `401/403`.
- **Q4 functions smoke** — new `scripts/qa/prod-suites/15-firebase-functions.mjs` covers the 4 HTTPS Functions (`listingProcessor` / `adminAnalytics` / `storeAnalytics` / `promotionsApi`) — auth (no/bad/good secret), method allow (GET→405), body validation, happy-path shape, listingType filter regression guard, cursor pagination. Env-gated (skips when `FIREBASE_FUNCTION_*_URL` not set).
- **Appkit `jobs/handlers` refactor** — `2c3d770` splits every scheduled / callable / Firestore-trigger handler into a pure `runXxx(ctx)` in `_internal/server/jobs/core/` plus a thin envelope wrapper in `handlers/`. Public surface unchanged.

**Required user follow-up (NOT a code task)**: `gcloud secrets add-iam-policy-binding LETITRIP_INTERNAL_SECRET --member="serviceAccount:949266230223-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=letitrip-in-app` (tracker row Q1-iam). Until granted, every HTTPS Function returns 401 and `/api/products` serves from the J22 local-repo fallback. Smoke `15-firebase-functions.mjs` flips 5/18 → ~13/18 once granted. Plus: prod Firestore data is empty — `POST /demo/seed` re-run pending.

---

<!-- Older session entries trimmed per "keep only 1 LAST" rule. Historical detail
preserved in newchange.md.

Older entries trimmed: S-BUGFIX, S-SBUNI-2 (Phase 1 D + V), S-SBUNI-1
(Phase 0 X1+X2 + Phase 1 B + C), SB-UNI-Z1/Z2/Z3 (media upload reliability).

### ✅ Previous — S-SBUNI-2 Phase 1 D + V (bundles re-architect) (2026-05-13)

Bundles moved from `listingType:"bundle"` to `categoryType:"bundle"`. `features/bundles/` (17 files, ~1900 LOC) + 2 `_internal` folders deleted outright. `GroupedListingDocument` re-scoped to theme-group semantics. New `onProductStockChange` Firebase Function deployed. 4 commits + indices deploy + functions deploy.

- **D ListingType prune** — `ListingType` union shrinks to `standard|auction|pre-order|prize-draw`. 17 inline duplicates pruned via one-off sweep across appkit + main. CategoryDocument gains `bundlePriceInPaise`/`bundleQueryRule` (static or dynamic)/`bundleStockStatus`/`bundleQueryResolvedAt`/`bundleProductIds[]`. `LISTING_TYPE_CAPABILITIES`/`_registry`/`isBundleListing`/order-splitter/checkout actions all drop the bundle branch.
- **V folder deletion** — `appkit/src/features/bundles/` entirely DELETED. `_internal/server/features/bundles/` + `_internal/shared/features/bundles/` DELETED. Bundle UI tree under `src/app/[locale]/bundles/`, `/admin/bundles/`, `/store/bundles/` + `src/app/api/bundles/` DELETED. `BUNDLE_*` constants rehomed in `_internal/shared/features/categories/bundle-config.ts`.
- **V GroupedListingDocument re-scope** — pricing fields (`bundlePrice`/`originalPrice`/`discountPercent`/`currency`) dropped; `groupTheme`/`minActiveMembers`/`activeMemberCount`/`visibilityStatus` added.
- **V Firebase Function** — new `onProductStockChange` Firestore-onWrite trigger on products. Recomputes bundle `bundleStockStatus` + grouped `activeMemberCount`/`visibilityStatus` when a product's available/unavailable state flips. `bundleStockSync` scheduled handler updated to operate on bundle categories. Both deployed to `asia-south1`.
- **V Consumer sweep** — BrandDetailPageView, CategoryDetailPageView, BrandDetailTabs, CategoryDetailTabs, StoreDetailLayoutView, StoreBundlesPageView all repointed at `categoriesRepository.listByType("bundle")` + new `CategoryBundlesListing` component (replaces deleted `BundlesByCategoryListing`). FeaturedBundlesSection homepage case returns null pending rebuild.
- **V Seed migration** — 3 bundle rows (Pokémon TCG starter, Gunpla PG arrivals, Beyblade X launch pack) merged into `categoriesSeedData` as `Partial<CategoryDocument>` with `categoryType:"bundle"` + `bundleQueryRule.type:"static"`.
- **V Indices** — added composite `(categoryType, createdByStoreId, isActive, createdAt)` for store-scoped bundle queries. Bundle-collection composites (6 entries) + sublistingCategories composites (2 entries) left as orphans; `firebase deploy --only firestore:indexes --force` cleanup deferred.

**Required user follow-up**: hit `POST /demo/seed` to wipe orphan `bundles` collection + reseed `categories` with 3 bundle rows. **No `vercel --prod` per standing instruction.**

**Spun out to S-SBUNI-3** (deferred from this session):
- Bundle UI rebuild — admin editor with multi-select product picker + public bundle detail/listing pages against `CategoryDocument` shape. Was deleted outright in V to keep this session sized.
- Bundle cart-line `{bundleCategorySlug, qty}` + checkout expansion to N product order lines (forward-looking; no add-to-cart-bundle UI exists today).

---

### ✅ Previous — S-SBUNI-1 Phase 0 X1+X2 + Phase 1 B + C (2026-05-13)

First slice of Tier SB-UNI. 8 commits. `firebase deploy --only firestore:indexes` fired; `npm run check` exits 0.

- **X1 capability registry** — `_internal/shared/listing-types/capabilities.ts` exports `LISTING_TYPE_CAPABILITIES` + 6 accessors + `assertNever`. Future-expansion Pattern 1 + 2.
- **X2 plugin folder scaffold** — `_internal/shared/listing-types/{standard,auction,pre-order,prize-draw}/` each with `config.ts` (concrete: listingType + capability + slugPrefix + cartLine) + 4 stub files (schema/ctas/og/seed-factory) marked TODO for later phases. `_registry.ts` aggregates.
- **X3 schemaVersion infra — 🚫 dropped per user push-back.** Pre-launch / no live data, so version handles + migrations.ts shells were dead weight. Captured in memory `feedback_no_speculative_infra.md` — skip future-proofing infra whose only stated payoff is "prevents future migration pain" until a real consumer exists.
- **B sublistings → categories.categoryType:"sublisting"** — 12 sublisting rows merged into `categoriesSeedData`. **Deleted** `features/sublisting/`, `features/products/repository/sublisting-categories.repository.ts`, `features/products/schemas/sublisting-categories.ts`, `seed/sublisting-categories-seed-data.ts`. 5 API routes repointed at `categoriesRepository`. New methods: `listByType`, `findBySlugAndType`, `getSublistingListings`, `deleteWithSublistingUnlink`, `generateSublistingId`. Indices `(categoryType, isActive, order)` + `(categoryType, createdAt)` shipped.
- **C brands → categories.categoryType:"brand"** — **Entire `features/brands/` folder DELETED**. 25 brand rows transformed into `Partial<CategoryDocument>` entries with `categoryType:"brand"` + `brandWebsite`/`brandCountry`/`brandFounded`/`brandBannerImage` + `display.coverImage` (was logoURL). New `categoriesRepository.findActiveBrands()`. `createBrandAction`/`updateBrandAction`/`deleteBrandAction` rewritten to translate BrandInput → CategoryDocument fields. Homepage data + listingProcessor + 3 API routes + SeedPanel repointed.

**Required user follow-up**: hit `POST /demo/seed` to wipe the deleted `sublistingCategories` + `brands` collections and reseed `categories` with the merged rows. The orphan `sublistingCategories` indexes left in Firestore can be `firebase deploy --only firestore:indexes --force`-cleaned at any future deploy. **No `vercel --prod` per standing instruction.**

**Phase 1 carried to next session** — D (bundles re-architect, L), V (grouped re-scope + 3-folder delete + `onProductStockChange` Function, L), E (discriminator cleanup, S), A (addresses unification, M). Sequence per plan: D → V → E → A.

---

### ✅ Previous — SB-UNI-Z1/Z2/Z3 Media upload reliability (2026-05-13)

Rule #6 violation closed. The legacy `POST /api/media/upload` buffered every byte through the Vercel Lambda (4.5 MB request cap) which made the route's claimed 50 MB video ceiling unreachable in prod. Replaced with a signed-URL flow that bypasses the Lambda entirely. 6 commits.

- **Z3 (centralised limits)** — new `appkit/src/_internal/shared/media/limits.ts` is the single source of truth for `MAX_*_BYTES` / `MAX_LABEL` / `ALLOWED_*_MIMES` / `MIME_TO_EXT` / `PDF_MAGIC` + `classifyMime` / `isAllowedMime` / `maxBytesFor` helpers. Exported from `client.ts` / `server.ts` / `index.ts`. Legacy upload route consumed them before deletion.
- **Z2 (MIME widening + conversion hints)** — `ALLOWED_VIDEO_MIMES` widened with `video/3gpp` · `video/3gpp2` · `video/x-matroska`. New `VIDEO_CONVERSION_HINTS` + `getConversionHint(mime)` returns actionable strings ("AVI is not supported — please convert to MP4 or WebM") for `video/x-msvideo` · `video/MP2T` · `video/x-flv` · `video/x-ms-wmv`. Errors carry the hint as both the user-facing message and a `hint` body field.
- **Z1 (signed-URL flow)** — new `POST /api/media/sign` (auth + caps + v4 signed PUT URL, 15-min TTL) + `POST /api/media/finalize` (pulls metadata, streams first 4 KB for `fileTypeFromBuffer` verification, rejects + deletes on declared-vs-detected MIME mismatch, stamps `customMetadata`, returns 7-day signed read URL or public URL). Per-context guardrails (product/review/auction/preorder/event/blog/rich-text caps + image-only + pdf-only affinity + SEO filename) extracted to `appkit/src/_internal/server/features/media/contextGuards.ts` for reuse. `useMediaUpload` rewritten to `sign → fetch PUT → finalize` — hook surface preserved so field components need no changes. Client-side `File.size`/MIME precheck added. `AvatarUpload.tsx` migrated to the new hook signature. Legacy `src/app/api/media/upload/route.ts` deleted.

**Operational follow-up (NOT a code task; no `vercel --prod` per user instruction):** Firebase Storage bucket CORS for browser `PUT` from `https://letitrip.in` + `http://localhost:3000` via `gsutil cors set`. End-to-end browser smoke test of `MediaUploadField` for each kind not yet run against live Firebase.

**Deferred (Z3 follow-up, carried separately):** `kind: "image"|"video"|"pdf"|"auto"` prop on `MediaUploadField` auto-deriving `accept` + `maxSizeMB` — pulled out to keep blast radius small.

**Held items (carried forward):** appkit npm publish (still on `file:./appkit`) · `/demo/seed` re-seed (no Firestore schema changes this session).
-->

### ✅ LAST COMPLETED — S-SBUNI-RULES phases 1–6: full rule registry end-to-end (2026-05-13)

Per-type checkout rule registry + schema + consumer rewire + shipping + cart-UI + refunds. `npm run check` exits 0.

- **RULES** — 14 new files under `appkit/src/_internal/shared/checkout/rules/`. `CHECKOUT_RULES` registry + `getListingRule`/`runSyncPreflight`/`getSplitKey` exported from `@mohasinac/appkit`.
- **SCHEMA** — `OrderDocument` gains `paymentBatchId?`, `refunds?: OrderRefundEvent[]`, `contestable?: boolean`, `shippingProofUrl?`. `CartItemDocument` gains `chosenShippingProviderId?`, `chosenShippingFeeInPaise?`. `StoreDocument` gains `shippingConfig?: StoreShippingConfig`. Media contexts: `shipping-proof` + `refund-proof`.
- **CONSUMERS** — `order-splitter.ts` + checkout `actions.ts` fully rewired to rule registry. `/api/cart` → `rule.cartEligible`. `BundleDetailView` now uses `BundleBuyNowCta` (direct-checkout, no cart).
- **SHIPPING** — `ShippingPicker` client component (resolves flat/percent/freeAbove fee). `cartRepository.updateItemShipping()` + `updateCartItemShipping()` domain fn. `CartView` gains `renderGroups` + `CartOrderGroup` slot. Two stores seeded with `shippingConfig`.
- **REFUNDS** — `ordersRepository.postRefundEvent()` + `findByPaymentBatchId()`. `processRefundAction` server action (razorpay|manual discriminated union, `confirmIrrevocable:true` guard, `isNonRefundable` guard). `RefundHistoryTable` + `RefundRequestView` components. `POST /api/orders/[id]/refund` + `POST /api/store/orders/[id]/shipping-proof` routes. `OrderSiblingPayments` component (`paymentBatchId` siblings link). Seed: orders-08/27 get refund events; orders-03/05 share `paymentBatchId`. Firestore index: `orders(paymentBatchId, createdAt)`.

**Required user follow-ups**: `POST /demo/seed` + `firebase deploy --only firestore:indexes`.

### 🔄 CURRENT — S9: RBAC complete (RBAC1–10) + inline TODO(RBAC) retrofit

### ⏳ NEXT UP — bundle checkout finalize + Phase 2+ (S-SBUNI-4 closed 2026-05-13)

| # | Session | Scope | Why this slot |
|---|---------|-------|---------------|
| 1 | **S-SBUNI-RULES** *(one large prod-deployable session — single row under "Phase RULES" in `crud-tracker.md`; lands AFTER S-SBUNI-5 closes)* | **Per-type cart/checkout/order rule registry (XL — one session, single commit cohort).** Extracts every inline `listingType` / `categoryType` branch in cart-add / validate / preflight / splitter / checkout-actions / stock-decrement into one registry at `appkit/src/_internal/shared/checkout/rules/`. Internal sequence inside the session: RULES → SCHEMA → CONSUMERS → SHIPPING → CART-UI → REFUNDS → SMOKE. Brings: one Razorpay payment / N orders linked by `paymentBatchId` (internal ref — orders are the contract); per-store separation strict; **bundle moves to direct-checkout-only** (no cart entry, removes `addBundleToCart`); prize-draw splits orders when entries > `PRIZE_DRAW_MAX_REVEALS_PER_ORDER` (3) with own reveal flow per batch; pre-order reservation-quota preflight; auction/offer single-line / qty=1 / no merge; **full + partial refunds** with Razorpay + manual-with-proof override paths (terminal for contestability — once refunded, no dispute possible); **shipping provider choice moves into cart** per-store with per-item override (`<ShippingPicker>` per tab, subtotal includes chosen fee at cart-time, locked at checkout); `shipping-proof` + `refund-proof` media contexts via signed-URL flow (SB-UNI-Z1). Tabbed cart UI per orderType with `CHECKOUT_MAX_ORDERS_PER_TX = 20` cap. Buy ≠ refund transactions — separate ID spaces. **Full plan**: `~/.claude/plans/also-add-rules-for-golden-clarke.md`. | S-SBUNI-5's inline bundle work becomes the reference impl this refactor abstracts from. Phase 2+ listing types (`classified` / `digital-code` / `live`) then ship as one-rule-per-type additions with zero consumer-code edits — that's the payoff. |
| 2 | **S9** | RBAC complete (RBAC1–10) + inline retrofit of every `TODO(RBAC)` tag left by S1–S8 | Permission system end-to-end — next natural slot now that Phase 1 SB-UNI + S8 are closed |
| – | **Tier SB-UNI Phase 2+ follow-ups** *(pull individually when prioritised)* | Phase 2 (F: ListingType union extends to `classified`/`digital-code`/`live`) · Phase 3 (G–K: TCGPlayer grading, eBay hybrid auction+BIN, classified fields, digital-code subcollection, live-item jurisdiction) · Phase 4 (L: Amazon-style catalog/offer split — 2-cohort) · Phase 5 (M–O: per-type checkout flows) · Phase 6 (P–T: SeedPanel sweep + per-type views + cart awareness + search facets) · Phase 7 (W-1…W-5: CTA registry + 5-wave sweep + lint rule) · Phase 8 (Y-1…Y-7: FormShell + 7-cluster migration) · Phase 9 polish (Z4: HEVC hint; Z5: MediaUploadField error UX) · X4 feature flags + X5 telemetry. | Each is its own cohort — slot when ready. **Phase 1 is fully closed (S-SBUNI-5 2026-05-13).** **SB10-C fully closed S8 follow-up 2026-05-13.** |
| 4 | **S10** | BAN (BAN1–9) + SCAM (SCAM2/4/6–9) | Governance / moderation |
| 5 | **S11** | Quality baseline — drive `audit-ssr-in-appkit` baseline 8→0 + TS9 hex sweep (154 hits) + RA-Tier audits applied inline | Tech-debt closeout |
| – | **S6-followup** | Q6-views: switch the 4 listing views (`ProductsIndexListing`, `AuctionsListView`, `PreOrdersListView`, `StoreProductsPageView`) from `useQuery` to `useInfiniteQuery` to wire the existing `useInfiniteScroll` primitive. Substantial refactor with regression surface. | Pull when prioritised |
| – | **OG-coverage-followup** | Drive `verify-og-coverage.mjs` baseline to 0 — per-feature OG renderers for `bundles/[slug]` (now category route post-SB-UNI-D), `faqs/[category]`, `reviews/[id]`, `scams/[id]`, `sellers/[id]`. | Pull when prioritised |
| – | **S1-polish** | Optional slot-shell polish slots deferred from S1 (admin alerts/charts/recent-activity, user notifications filters, seller analytics charts/top-products). Feature work — new endpoints + hooks. | Pull when prioritised |
| – | **S2-browser-smoke** | User-driven browser smoke for S2 — sign in → cart → consent OTP → COD + Razorpay test card → coupon → auction-add-to-cart-block. Then `vercel --prod`. | One-off post-S2 validation |

**Post-beta backlog** (not in S1–S11; pull only when explicitly scheduled):
AK1–3 (DI refactor) · AP1–16 (GoF patterns) · LP1–3 (custom ESLint rules) · Tier DX 38 tasks (`docs.letitrip.in` portal) · EMG1 → Tier PAY (EMI/installments) · EMG4 → Tier CHAT (live chat) · EMG2/EMG3 (loyalty + gift cards holding bay)

---

## HOW TO WORK

### Before writing any code

```
1. Read crud-tracker.md → find the next ⏳ task for this session, mark it 🔄
2. Read newchange.md → resolve any open DEFERRED gaps before new work
3. Read every source file you will touch — never code from memory or tracker descriptions alone
4. Run: npm run check → must exit 0 before you begin (tsc both repos + 4 audits + eslint)
5. If context feels fuzzy (too many files in mind) → STOP and start a fresh session
```

**CLAUDE.md rules are non-negotiable**:
- **Rule #1** — stop and ask before any autonomous decision / scope deviation
- **Rule #2** — ✅ does not mean working; re-read source, never trust the tracker
- **Rule #3** — schema/logic change updates every caller + seed + types in the same session
- **Rule #4** — never fix without first verifying the bug is still present in the current source
- **Rule #5** — task is not done until `npm run check` exits 0
- **Rule #6** — code within Vercel Hobby caps (1024 MB / 10 s / 4.5 MB payload)

### Per-task loop (repeat for every task)

```
1. PLAN      Write 3–5 bullets: what files change and why.
2. CODE      Implement the smallest correct change.
3. REFACTOR  Apply PER-SESSION REFACTOR CHECKLIST to every file you opened.
4. CHECK     npm run check → 0 errors (full quality gate per CLAUDE.md Rule #5)
5. VERIFY    Visual confirm in browser — do not mark ✅ on check pass alone
6. SEED+IDX  Update seed file / SeedPanel / firestore.indexes.json in this same commit
7. COMMIT    fix/feat/wire/seed(scope): one-line description  (one task per commit)
8. TRACKER   Mark task ✅ in crud-tracker.md, fill Part#, add one-line done note + timestamp
9. NEWCHANGE Prepend task entry to newchange.md (scope, files changed, deferred items)
10. PROMPT   Update 🔄 CURRENT task status in this file
```

### End-of-session checklist (before the deploy commit)

```
□ TSC        npx tsc --noEmit passes in BOTH repos.
□ AUDITS     npm run check:audits exits 0 (4 audit scripts).
□ LINT       npm run check:lint exits 0.
□ RECHECK    Scroll back through the session — every change discussed is actually in code.
             If something was discussed but not implemented, add a ⏳ entry in crud-tracker.md.
□ QUALITY    Refactor checklist applied to every touched file — tokens, ROUTES, wrappers,
             SSR layering, repo hooks, role gates, seed sync.
□ SEED       seed-data.ts + SeedPanel updated for every schema change made this session.
□ FIREBASE   firestore.indexes.json updated + firebase-merge.mjs run if any new multi-field
             query landed. Never edit root firestore.indexes.json directly.
□ FUNCTIONS  If functions/ touched: firebase deploy --only functions
□ INDICES    If indexes touched: firebase deploy --only firestore:indexes
□ TRACKER    Every task marked ✅ with one-line note + timestamp; session row marked ✅.
             Summary task count updated. Pending rows still carry `→ S<n>` annotation.
□ NEWCHANGE  newchange.md prepended with session entry: scope + files-changed table + deferred.
□ PROMPT     This file: move session to LAST COMPLETED (keep only 1 block); set CURRENT to
             next session's S<n>; drop oldest block if more than 1 exists.
□ MEMORY     memory/project_status.md prepended with one-bullet summary of what changed.
□ APPKIT     npm run build in appkit/ — dist/ up to date. Do NOT npm publish unless asked.
□ COMMIT     One logical unit per commit. Docs commit may follow code commit. Never batch
             unrelated tasks. Never commit with TS errors. Never use --no-verify.
□ DEPLOY     After user confirms: vercel --prod (auto-deploy is disabled).
```

---

## CODE STANDARDS

### No hardcoded values — ever

| What | Wrong | Right |
|------|-------|-------|
| Colors | `#6366f1`, `rgb(99,102,241)` | `var(--appkit-color-primary)` |
| Z-index | `z-[50]`, `z-index: 50` | `var(--appkit-z-modal)` |
| Breakpoints | `@media (min-width: 768px)` | `@screen md { }` |
| Spacing | `p-[44px]` | named token class or `var(--appkit-size-*)` |
| Font size | `text-[10px]` | `var(--appkit-font-size-2xs)` |
| Shadows | `shadow-[0_4px_12px_...]` | `var(--appkit-shadow-md)` |
| Route strings | `href="/products"` | `href={ROUTES.PUBLIC.PRODUCTS}` |
| API paths | `fetch("/api/products")` | `fetch(API_ROUTES.PRODUCTS.LIST)` |

### Component usage

```tsx
// HTML wrappers — always use these, never raw divs/spans in feature components
<Div>  <Row>  <Stack>  <Text>  <Heading>  <Section>  <Container>

// Navigation — never onClick+router.push
<Link href={ROUTES.*}>                      // plain link
<Button asChild><Link href={ROUTES.*}>      // styled-button link

// Modals/drawers — choose by field count
0 fields  → ConfirmDeleteModal
1–2 fields → Modal
3+ fields  → SideDrawer

// Data display
Missing data → empty state component, never crash or white screen
Optional props → always have a default value
```

### Route & CRUD conventions

```
Standard page set:
  /resource/page.tsx              → list
  /resource/new/page.tsx          → create
  /resource/[id]/edit/page.tsx    → edit

NEVER create page.tsx at a path that also has [[...action]] — Next.js rejects it
NEVER use [[...action]] catch-alls for new routes
All route strings → ROUTES.* constants (appkit/src/next/routing/route-map.ts)
All API paths → API_ROUTES.* constants (src/constants/api.ts)
```

### Store identity

```
Public routes + UI    → storeId / storeName / storeSlug  (never sellerId / ownerId)
Admin routes only     → may also show ownerId (Firebase UID)
Internal server only  → sellerId (= Firebase UID, never returned in API responses)
```

### User roles (current — replaced by RBAC permission system in S9)

```
user       → buyer, no store
seller     → has ≥1 store; role set on store creation
moderator  → content moderation sub-role
employee   → staff; access via permissions[] array
admin      → bypasses all permission checks

Every protected route uses requireRoleUser/Seller/Admin today, tagged with
`// TODO(RBAC)`. S9 sweeps every tag to replace with hasPermission(user, PERM.*).
```

### Content

```
Brand name: "LetItRip" — always this casing (never "LetiTrip" / "Letitrip")
Grep after every content update: grep -r "LetiTrip\|Letitrip" src/
Copy must reference real collectibles: Pokémon TCG, Hot Wheels, Beyblades, anime figures
```

### Form quality (every editor form)

```
□ MOBILE   375px — no overflow, no clipped inputs
□ TABLET   768px — responsive grid kicks in
□ DARK     All labels/textareas/helper text have dark: variants
□ TOKENS   No hex/rgb — var(--appkit-color-*) or Tailwind semantic
□ FOCUS    Focus rings visible on all interactive elements
□ ERRORS   Error states: red border + error message
□ LOADING  Submit shows isLoading + disabled; no double-submit
```

### Seed + Firebase sync (any schema change)

```
1. Update seed file          appkit/src/seed/<collection>-seed-data.ts
2. Update SeedPanel          src/components/dev/SeedPanel.tsx
   · FieldDef[] array for the collection
   · slugPattern chip if ID format changed
   · mediaFields chips if new image/video fields added
   · PII label if new personally-identifiable fields added
3. Update Firestore indexes  appkit/firebase/base/firestore.indexes.json (never edit root directly)
   · Run firebase-merge.mjs after editing
   · Run firebase-delete-indexes.mjs before deploy if getting 409 errors
4. Update sievejs config     if new filter/sort param added
5. Deploy in same session    firebase deploy --only firestore:indexes
```

### appkit build cycle

```bash
# Local dev — no npm publish needed
npm run watch:appkit   # terminal 1: compiles appkit/src/ → appkit/dist/ on save
npm run dev            # terminal 2: Next.js picks up dist/ changes live
npm run check          # must pass before every commit (tsc + audits + eslint)

# Publish only when user explicitly asks
# See CLAUDE.md "Appkit Local Dev vs Publish Rules" for full checklist
```

### Vercel Hobby caps (Rule #6 — non-negotiable)

```
API routes        paginate ≤50, ≤3 sequential Firestore round-trips, no .findAll().map()
Server actions    same — parallelize via Promise.all, hand off heavy work to functions/
Uploads           never via Next.js — signed URL → Firebase Storage → media slug return
Caching           every public GET → Cache-Control: public, s-maxage=, stale-while-revalidate=
Heavy work        PDFs, sharp, batch settlements, payouts → functions/ (60 s ceiling)
```

---

## QUICK REFERENCE

### Key files

| What | Where |
|------|-------|
| Task tracker | `crud-tracker.md` |
| Session log + deferred | `newchange.md` |
| Slug prefixes + media + Hobby caps + SSR architecture | `CLAUDE.md` |
| Seed files | `appkit/src/seed/` |
| Seed API route | `src/app/api/demo/seed/route.ts` |
| SeedPanel UI | `src/components/dev/SeedPanel.tsx` |
| API constants | `src/constants/api.ts` (`API_ROUTES`) |
| Route constants | `@mohasinac/appkit/client` → `ROUTES` |
| Nav group configs | `src/constants/navigation.tsx` |
| SEO metadata helpers | `src/constants/seo.server.ts` |
| Action constants | `appkit/src/features/products/constants/action-defs.ts` |
| RBAC permissions | `appkit/src/features/auth/permissions/constants.ts` |
| Firestore indexes (source) | `appkit/firebase/base/firestore.indexes.json` |
| Functions | `functions/src/` |
| Public layout shell | `src/app/[locale]/LayoutShellClient.tsx` |

### Reference implementations (slot-shell render-prop wiring + full CRUD pair)

```
src/app/[locale]/events/[id]/page.tsx             ← detail page (all render props wired)
src/app/[locale]/admin/events/page.tsx            ← admin list (full CRUD)
src/app/[locale]/admin/events/new/page.tsx       ← admin create
src/app/[locale]/admin/ads/[id]/edit/page.tsx     ← admin edit
src/app/[locale]/store/products/new/page.tsx     ← seller create
src/app/[locale]/search/page.tsx                  ← SearchView with renderXxx wiring
```

### Commit format

```
fix(scope): description
feat(scope): description
wire(scope): description
seed(scope): description

- file A — what changed
- file B — what changed
- Root cause / reason: one sentence
```

One task per commit. Never batch tasks. Never commit with TS errors. Never push half-shipped to `main`.

---

## WHAT NOT TO DO

```
✗ Make autonomous decisions — stop, write intent, wait for confirmation (CLAUDE.md Rule #1)
✗ Trust a ✅ tracker entry without re-reading the source file (CLAUDE.md Rule #2/4)
✗ Mark ✅ while any spec bullet is unbuilt — create a new ⏳ task or defer explicitly
✗ Leave stale "remaining: old-task-ID" notes on ✅ entries
✗ Refactor or add abstractions beyond the current task — BUT apply the per-session refactor
  checklist to files you've already opened in the same commit
✗ Add comments explaining what code does (names explain what; comments explain non-obvious why)
✗ Use dangerouslySetInnerHTML — use RichText or RichTextRenderer instead
✗ Cast as unknown as Foo — fix the type; if uncertain, ask
✗ Use onClick={() => router.push(...)} — use Link or Button asChild+Link
✗ Hardcode any route string — use ROUTES.* / API_ROUTES.* constants
✗ Import firebase-admin in index.ts or client.ts — server.ts only (Turbopack client-bundle trap)
✗ Add @import of node_modules CSS in globals.css — import via JS in layout.tsx instead
✗ Edit root firestore.indexes.json directly — edit appkit/firebase/base/ then run firebase-merge.mjs
✗ Push half-shipped state to main — every commit on main must be prod-deployable
✗ Run git push unless the user asks
✗ npm publish appkit unless the user explicitly asks
✗ Run vercel --prod unless the user explicitly asks
✗ Skip pre-commit hooks (--no-verify) or signing (--no-gpg-sign)
✗ Keep more than 1 LAST COMPLETED block in this file — drop oldest on every session end
```
