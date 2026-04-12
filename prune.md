# Prune Candidates - letitrip.in

This document is the single migration backlog for moving reusable code from letitrip.in into appkit while enforcing the architecture rules.

Last updated: April 12, 2026 (session 6 — commit 369a404c)
Source references used: letitrip.in/index.md, appkit/index.md, current workspace scan.

Verification snapshot (April 12, 2026):
- Verdict A (Listing Logic): partial
- Verdict B (Media Contract 5 images + 1 video): partial
- Verdict C (Order imageUrls propagation): pending
- Verdict D (Dual cleanup strategy): partial → **scheduler job implemented; upload-route tmp/ convention pending (Task Group 1)**
- Verdict E (Semantic wrapper variants + accessibility): pending
- Verdict F (i18n and INR currency propagation): pending
- Verdict G (Appkit ownership over duplicate/shared features): pending
- Path reference audit: 47 referenced paths, 47 exist (1 previously-planned path `functions/src/jobs/mediaTmpCleanup.ts` now created)

---

## Non-Negotiable Rules

1. Appkit-first: if reusable across 2+ apps, it belongs in appkit.
2. No re-export shims: delete shim files and import appkit directly at usage sites.
3. Merge duplicate concepts with config props instead of parallel files.
4. SSR-first: avoid 'use client' unless required for interactive primitives/browser APIs.
5. Use appkit HTML wrappers and wrapper variants; avoid repeated raw className patterns.
6. Hooks, contexts, repositories, schemas, and infra adapters belong in appkit.
7. ID generation must use shared typed generators with optional customId support.
8. Media fields must use typed media descriptors and standardized upload/cleanup lifecycle.

---

## Architectural Verdicts (Robust Decisions)

### Verdict A - Listing Logic
Auction, pre-order, and standard listing logic is generic marketplace behavior and must live in appkit. letitrip should pass listingType config only.

Status: partial
- Verified in appkit: listing normalization utility and listing-type schema support exist.
- Still needed in letitrip: complete import-side consolidation and removal of residual listing logic duplication.

### Verdict B - Media Contract
All media-capable entities should support typed media arrays. For this migration, each relevant form should support:
- up to 5 images
- up to 1 video

This must be enforced in UI validation, schema validation, and API validation.

Status: partial
- Verified in appkit: typed media contract (`MediaField`) and shared upload components exist.
- Still needed in letitrip integration: enforce 5+1 limits consistently across all target forms/entities.

### Verdict C - Order Image Propagation
Orders should automatically copy main images from ordered items into an order-level imageUrls array so order UIs can render without extra product fetches.

Status: pending
- Current implementation does not yet guarantee `order.imageUrls` population at create/update boundaries.

### Verdict D - Orphaned Media Cleanup
Do both, not one:
1. Immediate cleanup on form abort/unmount via onAbort.
2. Scheduled cleanup in Firebase Functions at 10:00 AM IST (Asia/Kolkata) for leftover temporary media.

Use temporary upload naming (tmp prefix/suffix) until save succeeds. On successful save, finalize by removing tmp marker in persisted reference. Daily cron deletes unresolved tmp objects older than TTL.

This dual strategy protects against browser crash, tab close, network failures, and backend save failures.

Status: partial
- Verified: immediate abort cleanup primitives exist in appkit media upload components.
- Pending: scheduled cleanup job file and scheduler wiring in Firebase Functions.

### Verdict E - Semantic Wrapper Variant System
After semantic wrappers are consistently adopted, repeated class and behavior patterns must be promoted into named wrapper variants/config props in appkit, with accessibility requirements built in by default.

Status: pending
- Index comparison indicates appkit already owns core wrapper primitives (`Semantic`, `Div`, `Layout`, `Typography`) and related UI primitives.
- Still needed: usage-pattern mining across letitrip and appkit, variant proposal list, and rollout plan with a11y acceptance gates.

### Verdict F - i18n and Currency Consistency (INR)
All user-facing copy and currency rendering must be locale-aware and config-driven. Dollar-sign rendering in letitrip must be treated as a migration bug unless intentionally configured.

Status: pending
- Index comparison confirms appkit owns reusable currency and locale-capable primitives (`number.formatter`, `PriceDisplay`, `LocaleSwitcher`, Razorpay rupee/paise helpers).
- Still needed: end-to-end propagation check from letitrip config/providers into appkit formatters/components and a complete page/component audit.

### Verdict G - Appkit Ownership Over Duplicate/Shared Features
When a feature/component basename exists in both `letitrip.in/index.md` and `appkit/index.md`, appkit should own the implementation. letitrip should not retain a parallel local version merely because it is currently different.

Status: pending
- Index overlap shows many high-confidence shared feature candidates already exist in both repos (`Accordion`, homepage sections, search/cart/admin views, `LocaleSwitcher`, `api-response`, repository/utility names).
- Still needed: merge divergent local implementations into appkit-configurable ownership and remove duplicate letitrip implementations.

---

## Rule Checks (Quick Commands)

### Appkit-first violations
```pwsh
Get-ChildItem src -Recurse -Include *.ts,*.tsx |
  Where-Object FullName -notmatch 'app\\|actions\\|config\\|constants\\|providers.config.ts|features.config.ts'
```

### Re-export shim violations
```pwsh
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "^export (\{[^}]+\}|\*) from" -Recurse
```

### Raw HTML tag violations
```pwsh
Select-String -Path "src\**\*.tsx" -Pattern "<(div|section|article|main|aside|nav|header|footer|ul|ol|li|span|p|h[1-6])\b" -Recurse
```

### Media upload anti-patterns
```pwsh
Select-String -Path "src\**\*.tsx" -Pattern 'type="file"|type=.file.' -Recurse |
  Where-Object { $_.Path -notmatch 'MediaUpload(Field|List)' }
```

### Ad-hoc ID generation violations
```pwsh
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "Date\.now\(|Math\.random\(|uuidv4\(|crypto\.randomUUID\(" -Recurse
```

### Wrapper pattern mining candidates
```pwsh
Select-String -Path "src\**\*.tsx" -Pattern "className=\"|className=\{`" -Recurse
```

### Potential currency symbol drift
```pwsh
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "\$|USD|dollar" -Recurse
```

### Shared basename overlap candidates
```pwsh
Select-String -Path "index.md" -Pattern "Accordion.tsx|LocaleSwitcher.tsx|CustomerReviewsSection.tsx|FAQSection.tsx|HowItWorksSection.tsx|SearchFiltersRow.tsx|SearchResultsSection.tsx|ProductGrid.tsx|CategoryGrid.tsx|AdminReviewsView.tsx|AdminSectionsView.tsx|api-response.ts|id-generators.ts" 
```

---

## Priority Migration Plan

1. Media lifecycle hardening (forms + schema + cleanup job)
2. Listing logic consolidation into appkit configurable utilities
3. Order image propagation to order imageUrls
4. Remove remaining re-export shims
5. Replace duplicate hooks/utils/repos with appkit imports
6. Mine semantic-wrapper usage patterns and define variant/config API proposals
7. Complete i18n + INR propagation audit and close dollar-sign drift
8. Collapse shared letitrip/appkit overlaps into appkit-owned implementations and remove duplicate local ownership

---

## Execution Board (Prune-Only, No Code Changes)

Use this section as the operational tracker for migration decisions and sequencing.

| Workstream | Priority | Owner | Current Status | Next Required Action | Exit Condition |
|---|---|---|---|---|---|
| Task Group 2 - Orphaned media cleanup (tmp + cron) | P0 | letitrip.in + functions | **partial** | adopt tmp/ folder convention in upload route and form save finalization (Task Group 1) | scheduler spec approved and task remains implementation-ready |
| Task Group 1 - Media limits (5 images + 1 video) | P0 | appkit + letitrip.in | partial | implement matrix rows in code (forms + schemas + upload API) starting with product/seller flows | each target file mapped with explicit limit policy and migration target |
| Task Group 4 - Order `imageUrls` aggregation | P0 | letitrip.in | pending | define source-of-truth flow for populate/update of `order.imageUrls` | order image propagation logic fully specified in backlog |
| Task Group 3 - Listing consolidation | P1 | appkit + letitrip.in | partial | enumerate residual listing logic in letitrip and mark migration target in appkit | no untracked listing-rule owner remains in letitrip backlog |
| Task Group 6 - Remaining shim cleanup | P1 | letitrip.in | done | none | remaining shim list is empty |
| Task Group 5 - ID generator standardization | P1 | appkit + letitrip.in | partial | document deprecation path for `src/utils/id-generators.ts` and call-site replacement sequence | all ID generation ownership points to appkit generators |
| Task Group 7 - Semantic wrapper variant expansion | P1 | appkit + letitrip.in | pending | build wrapper usage pattern inventory and propose named variants/config props replacing repeated classes | approved variant matrix with accessibility criteria and rollout order |
| Task Group 8 - i18n and currency propagation (INR) | P0 | letitrip.in + appkit | pending | run full translation + currency rendering audit and trace provider/config handoff into appkit formatting | zero unintended dollar-sign displays and documented locale/currency ownership |
| Task Group 9 - Appkit ownership over duplicated/shared features | P1 | letitrip.in + appkit | pending | merge shared-basenamed files into appkit-owned implementations and reduce letitrip to direct imports or minimal config adapters | no duplicate feature ownership remains in letitrip |

Legend:
- P0: blocks architecture safety or data integrity; do first.
- P1: high-value consolidation work that should immediately follow P0.

---

## Multi-Session Execution Protocol

Use this protocol when the migration is executed across multiple Copilot sessions, machines, or time blocks.

### Session start rules
1. Read `prune.md`, `letitrip.in/.github/copilot-instructions.md`, and `appkit/.github/copilot-instructions.md` before doing any work.
2. Pick one task group, or a tightly related batch of sub-slices across multiple task groups when they belong to the same logical delivery unit.
3. Do not widen scope beyond the selected logical delivery unit unless `prune.md` explicitly requires the dependency.
4. Reconfirm current repo branch and working tree state before editing.
5. Start or reconnect the appkit watcher before implementation work if code changes are being made.

### Allowed batching rule
You may execute multiple tasks in one session when all of the following are true:
1. They share the same architectural goal.
2. They touch the same subsystem or migration slice.
3. They can be validated together with the same watcher/test signal.
4. They can still end in one coherent commit or a very small sequence of commits.

Examples of valid batching:
- media form updates + related schema updates + prune status updates
- wrapper variant extraction + consumer replacement for the same wrapper pattern
- currency propagation fix + formatter ownership cleanup + prune notes

Examples of invalid batching:
- media cleanup job + unrelated admin UI migration + i18n audit
- wrapper variants + order repository changes + payout logic cleanup

### During-session rules
1. Follow `prune.md` as the execution source of truth, not ad-hoc ideas.
2. Do not keep code in letitrip because it is temporarily different; merge configurability into appkit.
3. Multiple related tasks may be completed in one session, but they must collapse into one logical delivery unit.
4. Keep the watcher running to catch live regressions while editing.
5. After each meaningful change batch, update the relevant task status in `prune.md` before moving on.
6. If blocked, update `prune.md` with the blocker and stop instead of branching into unrelated work.

### Session end rules
1. Update `prune.md` statuses, notes, and next action before ending the session.
2. Commit completed work with a focused commit message covering the logical delivery unit.
3. Immediately after each commit, update `prune.md` status markers again so the document reflects the committed state exactly.
4. Leave the watcher output state noted in the session summary if there are active warnings/errors.
5. Record the exact next recommended starting point so the next session can resume immediately.

### Handoff note format
- Completed:
- Batched tasks in this session:
- Status updates made:
- In progress:
- Blockers:
- Next file/task to open first:
- Watcher state:
- Commit created:

---

## Immediate Backlog (Next 17 Non-Code Actions)

1. Freeze this file as the single migration source of truth for this phase.
2. Add one line owner tag to every open item in Task Groups 1-6 if missing.
3. ~~For media limits, create a row-by-row matrix of entity -> form -> schema -> API enforcement target.~~ **DONE (session 6) — Task Group 1 matrix added with per-file enforcement targets and ownership.**
4. ~~For tmp cleanup, lock TTL decision (recommended: 24h) and note retry/idempotency requirements.~~ **DONE — `MEDIA_TMP_TTL_HOURS = 24`; job is idempotent (404s logged and skipped; single-instance lock).**
5. ~~For scheduler, lock runtime and timezone behavior (`Asia/Kolkata`, `30 4 * * *` UTC).~~ **DONE — `SCHEDULES.DAILY_0430_UTC`, timeZone `Asia/Kolkata`, `maxInstances: 1`.**
6. For order image propagation, define exact source fields and dedupe policy in writing.
7. For listing consolidation, identify which current letitrip files are transitional vs final-delete targets.
8. For shims, annotate each still-present shim with direct canonical appkit import path.
9. For ID standardization, capture replacement order to avoid mixed ID generation during rollout.
10. Mark each task group with one of: `pending`, `partial`, `ready-for-implementation`, `done`.
11. Produce wrapper usage heatmap by repeated class clusters before defining new variants.
12. Define accessibility contract per proposed wrapper variant (semantic role, keyboard/focus behavior, aria expectations).
13. Audit all locale-routed pages/components for translation key coverage and fallback behavior.
14. Trace and document currency config flow to confirm INR is passed through appkit formatters/components everywhere.
15. Build shared-basename comparison sheet from both `index.md` files and assign appkit migration order.
16. Mark every duplicated feature/component as one of: `move fully to appkit`, `reduce letitrip to config-only adapter`, `delete letitrip copy after import rewiring`.
17. Remove “keep local because it differs” as an acceptable outcome unless the code is strictly route-only or deployment-only consumer wiring.

---

## Task Group 1 - Media Model and Limits (5 images + 1 video)

### Goal
Standardize products, auctions, pre-orders, reviews, and stores on a shared media model with strict limits.

### Target entities
- products
- auctions
- pre-orders
- reviews
- stores

### Required constraints
- images: max 5
- video: max 1
- accepted media types validated in both form and API schema
- migration keeps backward compatibility for legacy mainImage/images fields during rollout

### Candidate letitrip files to migrate/replace
- src/components/products/ProductForm.tsx
- src/features/products/components/AuctionDetailView.tsx
- src/features/products/components/PreOrderDetailView.tsx
- src/features/products/components/ProductImageGallery.tsx
- src/features/products/components/ProductReviews.tsx
- src/features/seller/components/SellerCreateProductView.tsx
- src/features/seller/components/SellerEditProductView.tsx
- src/features/seller/components/SellerStoreSetupView.tsx
- src/hooks/useProductReviews.ts
- src/components/AvatarUpload.tsx
- src/components/admin/media-upload.client.ts

### Candidate schema files
- src/db/schema/products.ts
- src/db/schema/reviews.ts
- src/db/schema/stores.ts
- src/db/schema/orders.ts (for order imageUrls propagation)

### Appkit destination
- appkit/src/features/media/*
- appkit/src/features/products/*
- appkit/src/features/auctions/*
- appkit/src/features/pre-orders/*
- appkit/src/features/reviews/*
- appkit/src/features/stores/*

### Enforcement matrix (entity -> form -> schema -> API)

| Entity | Layer | File | 5-image target | 1-video target | Media-type validation target | Abort cleanup target | Appkit ownership target | Status |
|---|---|---|---|---|---|---|---|---|
| products | Form | src/components/products/ProductForm.tsx | `MediaUploadList` maxItems=5 | `MediaUploadField` single video | accept image/* + video/* mapped to shared media type guard | collect staged URLs, invoke onAbort on cancel/unmount | appkit/src/features/products/* + appkit/src/features/media/* | pending implementation |
| auctions | Form/View | src/features/products/components/AuctionDetailView.tsx | gallery/selectors capped at 5 | 1 promo/demo video slot | reject non-image/video media at submit boundary | cleanup staged uploads on abort path | appkit/src/features/auctions/* + appkit/src/features/media/* | pending implementation |
| pre-orders | Form/View | src/features/products/components/PreOrderDetailView.tsx | gallery/selectors capped at 5 | 1 promo/demo video slot | reject non-image/video media at submit boundary | cleanup staged uploads on abort path | appkit/src/features/pre-orders/* + appkit/src/features/media/* | pending implementation |
| products | Gallery display/input adapter | src/features/products/components/ProductImageGallery.tsx | enforce max visible/selectable images=5 | expose at most 1 video panel | guard unsupported media descriptors before render | n/a (display layer) | appkit/src/features/products/* | pending implementation |
| reviews | Form/View | src/features/products/components/ProductReviews.tsx | review media images capped at 5 | 1 optional review video | review payload media type validation in submit handler | staged review uploads cleaned via onAbort | appkit/src/features/reviews/* + appkit/src/features/media/* | pending implementation |
| products | Seller form | src/features/seller/components/SellerCreateProductView.tsx | `MediaUploadList` maxItems=5 | `MediaUploadField` single video | validate media descriptor type before create action | call onAbort for all staged media on dismiss | appkit/src/features/seller/* + appkit/src/features/media/* | pending implementation |
| products | Seller form | src/features/seller/components/SellerEditProductView.tsx | edited media list capped at 5 | edited video slot capped at 1 | validate merged legacy + new media descriptors | abort cleanup for newly staged unsaved files | appkit/src/features/seller/* + appkit/src/features/media/* | pending implementation |
| stores | Seller form | src/features/seller/components/SellerStoreSetupView.tsx | store images capped at 5 | 1 optional store video | validate store media descriptor type at submit | staged upload cleanup on cancel/unmount | appkit/src/features/stores/* + appkit/src/features/media/* | pending implementation |
| reviews | Hook/input adapter | src/hooks/useProductReviews.ts | review image array hard-cap at 5 | review video hard-cap at 1 | hook-level guard before API call | propagate staged URLs to caller abort hook | appkit/src/features/reviews/hooks/* | pending implementation |
| stores/users | Form component | src/components/AvatarUpload.tsx | out of scope for 5-image list (single avatar) | must disallow video | image-only mime validation retained | abort deletes staged avatar URL | appkit/src/features/media/* | pending implementation |
| admin media | Form component | src/components/admin/media-upload.client.ts | admin image uploads capped at 5 per entity field | 1 video per entity field | enforce type at client and payload builder | abort deletes staged admin uploads | appkit/src/features/media/* + appkit/src/features/admin/* | pending implementation |
| products | Schema | src/db/schema/products.ts | schema max=5 images | schema max=1 video | zod/schema accepts only image/video typed descriptors | n/a | appkit/src/features/products/schema/* | pending implementation |
| reviews | Schema | src/db/schema/reviews.ts | schema max=5 images | schema max=1 video | schema accepts only image/video typed descriptors | n/a | appkit/src/features/reviews/schema/* | pending implementation |
| stores | Schema | src/db/schema/stores.ts | schema max=5 images | schema max=1 video | schema accepts only image/video typed descriptors | n/a | appkit/src/features/stores/schema/* | pending implementation |
| orders | Schema compatibility | src/db/schema/orders.ts | preserve item/order image arrays compatibility | no new order video field in this slice | ensure order media typing stays image-array only | n/a | appkit/src/features/orders/schema/* | pending implementation |
| shared media API | API | src/app/api/media/upload/route.ts | enforce max image count at request context boundary | enforce single video per target field context | server-side mime sniff already present; add entity-limit guard | returns staged URLs compatible with onAbort contract | appkit/src/features/media/* + consumer route wiring | pending implementation |

### Acceptance criteria
- all target forms use MediaUploadField/MediaUploadList from appkit
- each form enforces 5 image / 1 video limit
- schemas/apis enforce same limits server-side
- abort flow always reports staged URLs for deletion

Verification: partial
- Shared appkit primitives exist.
- **DONE (session 6)**: row-by-row enforcement matrix documented for each listed Task Group 1 form/schema target plus upload API target.
- Full 5+1 enforcement across every listed letitrip form/entity remains open.

---

## Task Group 2 - Orphaned Media Prevention and Recovery

### Goal
Prevent storage leaks from unsaved uploads and recover from crashes.

### Required implementation plan (documented task only)
1. Uploads are created as temporary objects:
   - filename contains tmp marker (e.g., tmp- prefix)
2. On successful entity save:
   - media references are finalized (tmp marker removed in canonical URL/path reference)
3. On user cancel/unmount:
   - immediate delete for staged temporary objects (onAbort)
4. On crashes/failed flows:
   - scheduled Firebase cleanup job deletes stale tmp media daily

### Firebase Functions task backlog
- add new job file: functions/src/jobs/mediaTmpCleanup.ts
- register scheduler in functions/src/index.ts
- schedule: 10:00 AM IST daily
  - timezone: Asia/Kolkata
  - cron equivalent: 30 4 * * * (UTC)
- cleanup policy:
  - delete only tmp-marked objects
  - delete older than configured TTL (recommended 24h)
  - write audit logs for deleted object count

Verification: partial
- **DONE (session 2)**: `functions/src/jobs/mediaTmpCleanup.ts` created and registered in `functions/src/index.ts`.
- **DONE (session 2)**: `MEDIA_TMP_FOLDER_PREFIX = "tmp/"` and `MEDIA_TMP_TTL_HOURS = 24` added to `functions/src/config/constants.ts`.
- **DONE (session 2)**: Schedule set to `SCHEDULES.DAILY_0430_UTC` (10:00 AM IST / 04:30 UTC), timezone `Asia/Kolkata`, `maxInstances: 1`.
- **Pending**: media upload route (`src/app/api/media/upload/route.ts`) must prefix staged uploads with `tmp/` folder convention.
- **Pending**: form save actions must call a "finalize" endpoint that moves the confirmed URL from `tmp/{uid}/file` → `media/{uid}/file` on successful entity save.

### Safety constraints
- never delete non-tmp media in cron job
- support idempotent retries
- emit metrics/alerts on cleanup failure

### Acceptance criteria
- immediate abort cleanup works in forms
- cron cleanup removes leftover tmp media from failed sessions
- no data loss for successfully saved media

---

## Task Group 3 - Listing Logic Consolidation

### Goal
Move all auction/pre-order/listing behavior into appkit and keep letitrip as config consumer.

### Current known candidate files
- src/features/products/components/PlaceBidForm.tsx
- src/features/products/components/AuctionDetailView.tsx
- src/features/products/components/PreOrderDetailView.tsx
- src/features/products/components/PreOrdersView.tsx
- src/utils/order-splitter.ts

### Appkit target areas
- appkit/src/features/products/
- appkit/src/features/auctions/
- appkit/src/features/pre-orders/
- appkit/src/features/orders/

### Required outcome
- letitrip passes listingType and marketplace config only
- appkit owns bidding windows, pre-order eligibility, countdown behavior, and reusable listing rules

Verification: partial
- Appkit side foundations are present.
- Letitrip side cleanup/config-only wiring is still an active migration step.

---

## Task Group 4 - Order Image URL Aggregation

### Goal
Orders should automatically contain imageUrls derived from purchased item main images.

### Required behavior
- during order create/update, collect mainImage/productImage from items
- deduplicate and store as order.imageUrls: string[]
- keep existing item-level image fields for compatibility

### Candidate files
- src/actions/order.actions.ts
- src/repositories/order.repository.ts
- src/db/schema/orders.ts
- src/features/cart/components/CheckoutOrderReview.tsx

### Acceptance criteria
- order detail views can render from order.imageUrls without additional product reads
- schema includes imageUrls with stable typing

Verification: pending
- No definitive `order.imageUrls` propagation in current create/update flow.

---

## Task Group 5 - ID Generator Standardization

### Goal
Use shared appkit generators only; eliminate local duplicates/ad-hoc generation.

### Required tasks
- delete/stop using src/utils/id-generators.ts in letitrip
- import from @mohasinac/appkit/utils
- keep customId override behavior for caller-supplied IDs
- remove Date.now/Math.random/randomUUID IDs for Firestore documents

### Candidate files
- src/utils/id-generators.ts
- src/db/schema/orders.ts (createOrderId usage)
- scripts/seed-*.ts

### Acceptance criteria
- all document IDs generated via appkit typed generators
- generators support customId for externally provided IDs

Verification: partial
- Appkit generators with `customId` support are present.
- Local `src/utils/id-generators.ts` still exists in letitrip and must be fully retired.

---

## Task Group 6 - Re-export and Duplicate Cleanup

### Goal
Eliminate shim files and local duplicates after migration.

### High-confidence shim set (verified status)

Still present (candidate for import-replace + delete):
- ~~src/lib/monitoring/runtime.ts~~ **DELETED (session 2) — MonitoringProvider now imports from `@mohasinac/appkit/monitoring` directly**
- ~~src/lib/monitoring/performance.ts~~ **DELETED (session 5) — local monitoring barrel now re-exports appkit tracing APIs directly; no remaining call sites required letitrip-only helpers**
- ~~src/lib/api-response.ts~~ **DELETED (session 3) — all API routes and `src/lib/api/api-handler.ts` now import from `@mohasinac/appkit/next` directly**
- ~~src/lib/firebase/firestore-helpers.ts~~ **DELETED (session 4) — repositories, `src/lib/query/firebase-sieve.ts`, and `src/lib/tokens.ts` now import from `@mohasinac/appkit/providers/db-firebase` directly**

Already removed/not present (keep as historical completion markers, no further delete needed):
- src/lib/monitoring/error-tracking.ts
- src/lib/api/cache-middleware.ts
- src/utils/converters/cookie.converter.ts
- src/utils/formatters/date.formatter.ts
- src/utils/formatters/number.formatter.ts
- src/utils/formatters/string.formatter.ts
- src/utils/validators/email.validator.ts
- src/utils/validators/phone.validator.ts
- src/utils/validators/password.validator.ts
- src/utils/validators/input.validator.ts
- src/utils/validators/url.validator.ts
- src/utils/events/event-manager.ts

### Required process
1. Replace import sites with canonical appkit paths
2. Delete shim file
3. Verify no references remain

Verification: partial
- Process remains correct.
- **DONE (session 3)**: `src/lib/api-response.ts` removed after rewiring all imports to `@mohasinac/appkit/next`.
- **DONE (session 4)**: `src/lib/firebase/firestore-helpers.ts` removed after rewiring all imports to `@mohasinac/appkit/providers/db-firebase`.
- **DONE (session 5)**: `src/lib/monitoring/performance.ts` removed; `src/lib/monitoring/index.ts` now re-exports appkit performance APIs directly.
- Task Group 6 exit condition reached: remaining shim list is empty.

---

## Task Group 7 - Semantic Wrapper Variant Mining and A11y-First Expansion

### Goal
After wrappers are adopted, remove repeated utility-class patterns by introducing named appkit variants/config props for semantic wrappers and layout primitives.

### Why this is now required
- Index comparison shows appkit already has the foundational primitives (`src/ui/components/Semantic.tsx`, `src/ui/components/Div.tsx`, `src/ui/components/Layout.tsx`, `src/ui/components/Typography.tsx`).
- letitrip still contains many component-level files where repeated class clusters likely persist and should move to variants.

### Candidate analysis targets (index-derived)
- src/features/homepage/components/*.tsx
- src/features/search/components/*.tsx
- src/features/cart/components/*.tsx
- src/features/admin/components/*.tsx
- src/components/**/*.tsx
- src/app/[locale]/**/layout.tsx

### Required non-code output
1. Pattern inventory: repeated class bundles used in 3+ places.
2. Variant proposal sheet:
  - wrapper/component target (`Div`, `Section`, `Article`, `Container`, `Stack`, `Row`, `Grid`, `Heading`, `Text`)
  - proposed variant name
  - semantic intent
  - replacement mapping examples
3. Migration rollout order by blast radius (low -> high).

### Accessibility acceptance gate (mandatory for each proposed variant)
- semantic element correctness preserved (no div fallback where sectioning/heading is required)
- focus ring remains visible and keyboard navigability unchanged
- aria labeling/relationships preserved for interactive wrappers
- color contrast does not regress below WCAG AA

### Verification
Status: pending
- Appkit primitives exist.
- Variant mining/proposal and a11y contract are not yet documented to completion.

---

## Task Group 8 - i18n Completeness and INR Currency Consistency

### Goal
Ensure every user-facing page/component is locale-aware and every money display uses INR formatting unless intentionally overridden by market config.

### Why this is now required
- Index comparison confirms large locale-routed surface in letitrip (`src/app/[locale]/**`) and dedicated i18n modules (`src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/i18n/resolve-locale.ts`).
- Appkit already exposes reusable locale/currency building blocks (`src/utils/number.formatter.ts`, `src/ui/components/PriceDisplay.tsx`, `src/features/layout/LocaleSwitcher.tsx`, `src/providers/payment-razorpay/index.ts`).
- Remaining `$` outputs indicate either hardcoded formatting, fallback defaults, or incomplete config/provider propagation.

### Candidate audit targets
- src/app/[locale]/**/page.tsx
- src/app/[locale]/**/layout.tsx
- src/features/**/components/*.tsx
- src/components/**/*.tsx
- src/i18n/routing.ts
- src/i18n/request.ts
- src/providers.config.ts
- src/config/**

### Required non-code output
1. Translation coverage matrix: route/component -> translation namespace -> status.
2. Currency rendering matrix: component/function -> formatter source -> output symbol/locale.
3. Config-flow trace: letitrip config -> provider wiring -> appkit formatter/component usage.
4. Mismatch log for every `$` occurrence with owner and fix path.

### Acceptance criteria
- no unintended `$` display in INR market routes
- all price formatting routed through shared formatter or shared price component
- all locale routes load expected messages and fallback behavior is explicitly documented
- provider/config handoff for locale and currency is documented and verified

### Verification
Status: pending
- Appkit capability exists.
- End-to-end letitrip audit and mismatch closure are still open.

---

## Task Group 9 - Appkit Ownership Over Duplicated/Shared Features

### Goal
Use the overlap between `letitrip.in/index.md` and `appkit/index.md` to eliminate duplicate ownership by moving reusable implementations into appkit.

### Why this is now required
- Index comparison shows a broad shared-basename surface across both repos, including UI primitives, homepage sections, search/cart/admin views, locale components, and utility modules.
- Without an explicit migration matrix, duplicate files tend to survive indefinitely even when appkit should own the reusable version.
- Because both repos are still non-final, temporary divergence is not a reason to preserve parallel implementations in letitrip.

### High-confidence overlap samples (index-derived)
- Accordion.tsx
- LocaleSwitcher.tsx
- CustomerReviewsSection.tsx
- FAQSection.tsx
- HowItWorksSection.tsx
- SearchFiltersRow.tsx
- SearchResultsSection.tsx
- ProductGrid.tsx
- CategoryGrid.tsx
- AdminReviewsView.tsx
- AdminSectionsView.tsx
- api-response.ts
- id-generators.ts

### Required non-code output
1. Shared basename inventory with both paths.
2. Migration classification:
  - move fully to appkit
  - reduce letitrip to config-only adapter
  - delete letitrip duplicate after import rewiring
3. Exception log only for files that are strictly consumer-only route wiring, server actions, project config, or deployment/runtime setup.

### Acceptance criteria
- every shared-basename candidate has one explicit appkit migration decision
- no reusable duplicate remains intentionally owned by letitrip
- any remaining letitrip file is justified as consumer-only wiring, not reusable implementation drift

### Verification
Status: pending
- Overlap is confirmed from the two index inventories.
- Appkit migration sheet is not yet documented.

---

## Risk Register and Mitigations

1. Risk: media leaks from crash before save
Mitigation: immediate onAbort + daily tmp cron cleanup

2. Risk: accidental cleanup of valid media
Mitigation: cron only touches tmp-marked objects older than TTL

3. Risk: schema mismatch between UI and API
Mitigation: enforce same max constraints (5 images, 1 video) in both layers

4. Risk: breaking existing product/review/store UIs
Mitigation: transitional compatibility for mainImage/images/video until full migration complete

---

## Definition of Done for this prune plan

1. No duplicated sections in this file; one authoritative backlog only.
2. All new requirements captured as explicit tasks and acceptance criteria.
3. Media lifecycle includes both immediate cleanup and scheduled fallback cleanup.
4. Listing/media/id/order-image requirements are represented as migration tasks, not assumptions.
5. Multi-session continuation is possible without relying on chat history alone.
