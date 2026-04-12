# Prune Candidates - letitrip.in

This document is the single migration backlog for moving reusable code from letitrip.in into appkit while enforcing the architecture rules.

Last updated: session 22 — TG7 phase-2 batches 1-2 committed (appkit 5e371b1, letitrip 2b2a0292)
Source references used: letitrip.in/index.md, appkit/index.md, current workspace scan.

Verification snapshot (April 12, 2026):

- Verdict A (Listing Logic): partial
- Verdict B (Media Contract 5 images + 1 video): **done** → product/review/store media schema+action enforcement and seller form/gallery caps now aligned to 5+1 ownership with appkit media primitives (session 16)
- Verdict C (Order imageUrls propagation): **done** → `imageUrls` field added to `OrderDocument`; populated at create time in checkout route and payment/verify route (session 9)
- Verdict D (Dual cleanup strategy): **done** → scheduler job implemented; upload route stages under tmp/\*; seller create/update + store update + review create/update + profile avatar update all finalize tmp media to canonical media paths (session 9); shared finalize helpers extracted to `src/lib/media/finalize.ts`
- Verdict E (Semantic wrapper variants + accessibility): pending
- Verdict F (i18n and INR currency propagation): **done** → INR/en-IN config propagation verified; shared price rendering paths now use appkit currency formatting (session 11)
- Verdict G (Appkit ownership over duplicate/shared features): **done** → `LocaleSwitcher` reduced to a thin letitrip routing/i18n adapter over appkit’s shared implementation (session 14); `Accordion` and `SearchResultsSection` duplicate letitrip implementations removed and replaced with appkit-owned components/configurable slots (session 15)
- Verdict H (Multi-image support for events and blog — cover, event, winner, additional): **done** → appkit schemas/types/forms and letitrip schemas/actions/APIs/forms now support typed multi-image event/blog media with abort cleanup and staged-media finalization (session 13)
- Rich text inline media: **done** → `RichTextEditor` now supports inline image upload through shared media logic plus URL insertion; blog/event editors use typed content-image contexts and other rich-text fields use shared `rich-text-image` filenames (session 21)
- Rich text preview policy: **done** → full-body renders stay on `RichText`; plain-text preview/meta surfaces now strip markup consistently across event/store listing and SEO contexts (session 21)
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

Status: **done**

- Verified in appkit: typed media contract (`MediaField`) and shared upload components exist.
- **DONE (session 16)**: seller product form now enforces max 5 gallery images + max 1 video via appkit media components.
- **DONE (session 16)**: review/store action-layer schemas now enforce approved media URL constraints and 5+1 review caps; staged media finalization preserved.
- **DONE (session 16)**: product gallery adapter now hard-caps rendered images to 5 and preserves one optional video panel.

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

Status: **done**

- Index overlap shows many high-confidence shared feature candidates already exist in both repos (`Accordion`, homepage sections, search/cart/admin views, `LocaleSwitcher`, `api-response`, repository/utility names).
- **DONE (session 14 batch 1)**: `LocaleSwitcher` no longer owns a parallel local implementation; letitrip now delegates rendering to appkit and keeps only routing/i18n adapter logic.
- **DONE (session 15 batch 1)**: deleted letitrip-local `Accordion` and `SearchResultsSection` implementations; letitrip now imports `Accordion` from `@mohasinac/appkit/ui` and `SearchResultsSection` from `@mohasinac/appkit/features/search` with app-specific render slots.

### Verdict H - Multi-Image Support for Events and Blog

Events and blog posts currently hold a single image string (`coverImageUrl` / `coverImage`). Both entities need typed `MediaField` arrays with role-specific slots:

**Events:**

- `coverImage: MediaField | null` — hero/banner (1 max, replaces `coverImageUrl: string`)
- `eventImages: MediaField[]` — during/after event photos (max 10)
- `winnerImages: MediaField[]` — winner/prize announcement photos (max 5)
- `additionalImages: MediaField[]` — gallery/miscellaneous (max 10)

**Blog:**

- `coverImage: MediaField | null` — post hero image (1 max, upgrades `coverImage: string`)
- `contentImages: MediaField[]` — inline illustrations/screenshots (max 10)
- `additionalImages: MediaField[]` — supplementary gallery (max 5)

Migration must be backward-compatible: existing string-typed `coverImageUrl`/`coverImage` values are coerced to `{ url: value, type: "image" }` during read. Both appkit schemas and letitrip admin forms must enforce these limits.

Status: **DONE** (session 13)

- **DONE (session 13 batch 1)**: appkit event/blog schemas now accept typed `MediaField` cover images with backward-compatible string coercion on read.
- **DONE (session 13 batch 1)**: appkit event/blog types now expose role-specific media arrays (`eventImages`, `winnerImages`, `additionalImages`, `contentImages`) for TG10.
- **DONE (session 13 batch 2)**: letitrip event/blog schemas, server actions, and admin API routes now validate typed media objects/arrays and finalize staged `tmp/*` media to canonical paths on save.
- **DONE (session 13 batch 2)**: upload API context guardrails now enforce role-specific event/blog image caps and image-only restrictions for all TG10 context keys.
- **DONE (session 13 batch 3)**: letitrip admin event/blog forms now expose all new typed media slots, wire `onAbort` cleanup for staged uploads, and preserve backward-compatible cover-image read paths.
- **DONE (session 13 batch 3)**: reusable ownership moved further into appkit via shared `BlogPostForm`, `EventFormDrawer` media render slots, server-safe media helper exports, and typed public-render fallbacks for event/blog cover media.

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
9. Multi-image support for events (cover + event + winner + additional) and blog (cover + content + additional)

---

## Execution Board (Prune-Only, No Code Changes)

Use this section as the operational tracker for migration decisions and sequencing.

| Workstream                                                      | Priority | Owner                   | Current Status                     | Next Required Action                                                                                                                                                                                                                            | Exit Condition                                                                                                                                                                                                |
| --------------------------------------------------------------- | -------- | ----------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task Group 2 - Orphaned media cleanup (tmp + cron)              | P0       | letitrip.in + functions | **done**                           | none — all entity save flows that persist media URLs now finalize tmp→canonical on save                                                                                                                                                         | all finalize-on-save paths implemented; scheduler + immediate-abort primitives confirmed                                                                                                                      |
| Task Group 1 - Media limits (5 images + 1 video)                | P0       | appkit + letitrip.in    | **DONE**                           | none — seller product form, gallery adapter, review/store schemas, and upload guardrails now enforce the 5+1 contract with appkit media ownership                                                                                               | each target file mapped with explicit limit policy and migration target                                                                                                                                       |
| Task Group 4 - Order `imageUrls` aggregation                    | P0       | letitrip.in             | **done**                           | none — `imageUrls` added to `OrderDocument` and populated at checkout + payment/verify create paths                                                                                                                                             | order image propagation logic fully implemented                                                                                                                                                               |
| Task Group 3 - Listing consolidation                            | P1       | appkit + letitrip.in    | **DONE**                           | none — order-splitter deleted; usePlaceBid + useRealtimeBids moved to appkit; view components already wrap appkit shells; useAuctionDetail tracked below                                                                                        | no untracked listing-rule owner remains in letitrip backlog                                                                                                                                                   |
| Task Group 6 - Remaining shim cleanup                           | P1       | letitrip.in             | done                               | none                                                                                                                                                                                                                                            | remaining shim list is empty                                                                                                                                                                                  |
| Task Group 5 - ID generator standardization                     | P1       | appkit + letitrip.in    | **DONE**                           | none — `src/utils/id-generators.ts` deleted; all generators delegated to `@mohasinac/appkit/utils`; media filename generators, offerId, QR/barcode, idExists, generateUniqueId added to appkit                                                  | all ID generation ownership points to appkit generators                                                                                                                                                       |
| Task Group 7 - Semantic wrapper variant expansion               | P1       | appkit + letitrip.in    | **phase-2 partial (batch 1 done)** | Start Grid-focused phase-2 follow-up and decide whether appkit `FormGrid` remains the documented flex-wrap exception or should be reimplemented on top of `Row`/`Grid`; keep `DescriptionField` doc example in sync with approved wrapper usage | all 4 phases completed; matching repeated patterns in both repos migrated to approved variants; large className bundles replaced except documented one-off exceptions; zero new raw-class patterns introduced |
| Task Group 8 - i18n and currency propagation (INR)              | P0       | letitrip.in + appkit    | **DONE**                           | none — all price display paths route through `formatCurrency`; INR/en-IN defaults confirmed                                                                                                                                                     | zero unintended dollar-sign displays confirmed; locale/currency config ownership documented                                                                                                                   |
| Task Group 9 - Appkit ownership over duplicated/shared features | P1       | letitrip.in + appkit    | **DONE**                           | none — local `Accordion` and local `SearchResultsSection` deleted; consumers switched to appkit ownership (`@mohasinac/appkit/ui`, `@mohasinac/appkit/features/search`)                                                                         | no duplicate feature ownership remains in letitrip                                                                                                                                                            |
| Task Group 10 - Multi-image support for events and blog         | P1       | appkit + letitrip.in    | **DONE**                           | none — appkit schemas/types/forms and letitrip schemas/actions/APIs/forms now enforce typed event/blog media slots end-to-end                                                                                                                   | all new image-role slots schema-enforced (appkit) and form-enforced (letitrip); abort cleanup wired for every upload slot                                                                                     |

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

- appkit/src/features/media/\*
- appkit/src/features/products/\*
- appkit/src/features/auctions/\*
- appkit/src/features/pre-orders/\*
- appkit/src/features/reviews/\*
- appkit/src/features/stores/\*

### Enforcement matrix (entity -> form -> schema -> API)

| Entity           | Layer                         | File                                                       | 5-image target                                      | 1-video target                                | Media-type validation target                                   | Abort cleanup target                                  | Appkit ownership target                                        | Status                                                                                                                                   |
| ---------------- | ----------------------------- | ---------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| products         | Form                          | src/components/products/ProductForm.tsx                    | `MediaUploadList` maxItems=5                        | `MediaUploadField` single video               | accept image/_ + video/_ mapped to shared media type guard     | collect staged URLs, invoke onAbort on cancel/unmount | appkit/src/features/products/_ + appkit/src/features/media/_   | **DONE (session 16 batch 2)**                                                                                                            |
| auctions         | Form/View                     | src/features/products/components/AuctionDetailView.tsx     | gallery/selectors capped at 5                       | 1 promo/demo video slot                       | reject non-image/video media at submit boundary                | cleanup staged uploads on abort path                  | appkit/src/features/auctions/_ + appkit/src/features/media/_   | **DONE (session 16 closeout)** — auction listings use shared seller `ProductForm` (5+1 enforced) and shared gallery adapter caps         |
| pre-orders       | Form/View                     | src/features/products/components/PreOrderDetailView.tsx    | gallery/selectors capped at 5                       | 1 promo/demo video slot                       | reject non-image/video media at submit boundary                | cleanup staged uploads on abort path                  | appkit/src/features/pre-orders/_ + appkit/src/features/media/_ | **DONE (session 16 closeout)** — pre-order listings use shared seller `ProductForm` (5+1 enforced) and shared gallery adapter caps       |
| products         | Gallery display/input adapter | src/features/products/components/ProductImageGallery.tsx   | enforce max visible/selectable images=5             | expose at most 1 video panel                  | guard unsupported media descriptors before render              | n/a (display layer)                                   | appkit/src/features/products/\*                                | **DONE (session 16 batch 3)**                                                                                                            |
| reviews          | Form/View                     | src/features/products/components/ProductReviews.tsx        | review media images capped at 5                     | 1 optional review video                       | review payload media type validation in submit handler         | staged review uploads cleaned via onAbort             | appkit/src/features/reviews/_ + appkit/src/features/media/_    | **DONE (session 16 batch 1)**                                                                                                            |
| products         | Seller form                   | src/features/seller/components/SellerCreateProductView.tsx | `MediaUploadList` maxItems=5                        | `MediaUploadField` single video               | validate media descriptor type before create action            | call onAbort for all staged media on dismiss          | appkit/src/features/seller/_ + appkit/src/features/media/_     | **DONE (session 16 batch 2)**                                                                                                            |
| products         | Seller form                   | src/features/seller/components/SellerEditProductView.tsx   | edited media list capped at 5                       | edited video slot capped at 1                 | validate merged legacy + new media descriptors                 | abort cleanup for newly staged unsaved files          | appkit/src/features/seller/_ + appkit/src/features/media/_     | **DONE (session 16 batch 2)**                                                                                                            |
| stores           | Seller form                   | src/features/seller/components/SellerStoreSetupView.tsx    | store images capped at 5                            | 1 optional store video                        | validate store media descriptor type at submit                 | staged upload cleanup on cancel/unmount               | appkit/src/features/stores/_ + appkit/src/features/media/_     | **DONE (session 16 batch 1)**                                                                                                            |
| reviews          | Hook/input adapter            | src/hooks/useProductReviews.ts                             | review image array hard-cap at 5                    | review video hard-cap at 1                    | hook-level guard before API call                               | propagate staged URLs to caller abort hook            | appkit/src/features/reviews/hooks/\*                           | **DONE (session 16 batch 1)**                                                                                                            |
| stores/users     | Form component                | src/components/AvatarUpload.tsx                            | out of scope for 5-image list (single avatar)       | must disallow video                           | image-only mime validation retained                            | abort deletes staged avatar URL                       | appkit/src/features/media/\*                                   | **DONE (session 16 closeout)** — avatar input is image-only and `user-avatar` context is image-guarded server-side                       |
| admin media      | Form component                | src/components/admin/media-upload.client.ts                | admin image uploads capped at 5 per entity field    | 1 video per entity field                      | enforce type at client and payload builder                     | abort deletes staged admin uploads                    | appkit/src/features/media/_ + appkit/src/features/admin/_      | **DONE (session 16 closeout)** — local file removed; admin media upload ownership is appkit (`src/components/admin/index.ts` re-export)  |
| products         | Schema                        | src/db/schema/products.ts                                  | schema max=5 images                                 | schema max=1 video                            | zod/schema accepts only image/video typed descriptors          | n/a                                                   | appkit/src/features/products/schema/\*                         | **DONE (session 16 closeout)** — product zod schema enforces `images.max(5)` and single optional `video` object                          |
| reviews          | Schema                        | src/db/schema/reviews.ts                                   | schema max=5 images                                 | schema max=1 video                            | schema accepts only image/video typed descriptors              | n/a                                                   | appkit/src/features/reviews/schema/\*                          | **DONE (session 16 batch 1)**                                                                                                            |
| stores           | Schema                        | src/db/schema/stores.ts                                    | schema max=5 images                                 | schema max=1 video                            | schema accepts only image/video typed descriptors              | n/a                                                   | appkit/src/features/stores/schema/\*                           | **DONE (session 16 batch 1)**                                                                                                            |
| orders           | Schema compatibility          | src/db/schema/orders.ts                                    | preserve item/order image arrays compatibility      | no new order video field in this slice        | ensure order media typing stays image-array only               | n/a                                                   | appkit/src/features/orders/schema/\*                           | **DONE (session 16 closeout)** — `OrderDocument.imageUrls` remains image-array only; no order video field introduced                     |
| shared media API | API                           | src/app/api/media/upload/route.ts                          | enforce max image count at request context boundary | enforce single video per target field context | server-side mime sniff already present; add entity-limit guard | returns staged URLs compatible with onAbort contract  | appkit/src/features/media/\* + consumer route wiring           | **DONE (session 16 closeout)** — upload route enforces product/review index caps, image-only context guards, and staged `tmp/*` contract |

Progress update (session 7 batch 1):

- `src/lib/validation/schemas.ts`: product `images` max reduced `10 -> 5` for create/update schema validation.
- `src/app/api/media/upload/route.ts`: product-context guardrails added (`product-image` index <= 5, `product-video` index <= 1).
- `src/app/api/media/upload/route.ts`: uploads now always stage under `tmp/*` prefix (aligns with Task Group 2 cron cleanup strategy).
- `src/components/products/ProductForm.tsx`: product image upload context now sends deterministic `index: 1`.

### Acceptance criteria

- all target forms use MediaUploadField/MediaUploadList from appkit
- each form enforces 5 image / 1 video limit
- schemas/apis enforce same limits server-side
- abort flow always reports staged URLs for deletion

Verification: **done**

- Shared appkit primitives exist.
- **DONE (session 6)**: row-by-row enforcement matrix documented for each listed Task Group 1 form/schema target plus upload API target.
- **DONE (session 7 batch 1)**: product schema image cap enforced at 5 in validation layer.
- **DONE (session 7 batch 1)**: upload API enforces product context guardrails (max 5 image indices, max 1 video index).
- **DONE (session 16 batch 1)**: review create/update/admin actions now enforce approved media URLs with image list cap = 5 and single optional video URL; staged media finalization preserved for user + admin update flows.
- **DONE (session 16 batch 1)**: store update action now enforces approved media URL validation for `storeLogoURL` and `storeBannerURL` before persistence.
- **DONE (session 16 batch 2)**: `ProductForm` now enforces product video cap = 1 using `MediaUploadField` (`product-video` context) while preserving gallery image cap = 5 and `onAbort` cleanup wiring.
- **DONE (session 16 batch 3)**: `ProductImageGallery` now hard-caps rendered image media to 5 and preserves a single optional video panel.
- Task Group 1 exit condition reached.

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
  - cron equivalent: 30 4 \* \* \* (UTC)
- cleanup policy:
  - delete only tmp-marked objects
  - delete older than configured TTL (recommended 24h)
  - write audit logs for deleted object count

Verification: partial

- **DONE (session 2)**: `functions/src/jobs/mediaTmpCleanup.ts` created and registered in `functions/src/index.ts`.
- **DONE (session 2)**: `MEDIA_TMP_FOLDER_PREFIX = "tmp/"` and `MEDIA_TMP_TTL_HOURS = 24` added to `functions/src/config/constants.ts`.
- **DONE (session 2)**: Schedule set to `SCHEDULES.DAILY_0430_UTC` (10:00 AM IST / 04:30 UTC), timezone `Asia/Kolkata`, `maxInstances: 1`.
- **DONE (session 7 batch 1)**: media upload route now prefixes staged uploads under `tmp/*`.
- **DONE (session 8 batch 1)**: seller product save actions (`createSellerProductAction`, `sellerUpdateProductAction`) now finalize staged `tmp/*` media by copying to `media/*` and deleting source objects.
- **DONE (session 9)**: shared finalize helpers extracted to `src/lib/media/finalize.ts` (`finalizeStagedMediaUrl`, `finalizeStagedMediaField`, `finalizeStagedMediaArray`).
- **DONE (session 9)**: `updateStoreAction` (store logo + banner), `createReviewAction` (review images), `updateReviewAction` (review images), `updateProfileAction` (avatar photoURL) all finalize tmp media on save.
- All entity save flows that persist media URLs now finalize tmp→canonical. Task Group 2 exit condition reached.

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

Verification: **DONE** (session 12)

- **DONE**: `src/utils/order-splitter.ts` deleted (87 lines removed). `@/utils` barrel now re-exports `splitCartIntoOrderGroups`, `OrderGroup`, `OrderType` from `@mohasinac/appkit/features/orders`.
- **DONE**: `src/hooks/usePlaceBid.ts` deleted (45 lines). appkit `src/features/auctions/hooks/usePlaceBid.ts` created; uses `apiClient.post('/api/bids', ...)` directly. letitrip `hooks/index.ts` now imports from `@mohasinac/appkit/features/auctions`.
- **DONE**: `src/hooks/useRealtimeBids.ts` deleted (110 lines). appkit `src/features/auctions/hooks/useRealtimeBids.ts` created; SSE endpoint parameterised, defaults to `/api/realtime/bids/{productId}`. letitrip imports from `@mohasinac/appkit/features/auctions`.
- **DONE**: Letitrip view components (`AuctionDetailView`, `PreOrderDetailView`, `PreOrdersView`, `PlaceBidForm`) already wrap appkit render-slot shells — verified in session 12. These are legitimate thin adapters passing letitrip data via render props.
- **Tracked remaining**: `useAuctionDetail` (uses `/api/products` endpoint vs appkit's `/api/auctions` — divergence documented). `useAuctions` in `features/products/hooks` uses `/api/products` not `/api/auctions` (same reason). These stay in letitrip until API endpoint unification or appkit parameterization is done (separate task).
- appkit commit: `39e0c14` · letitrip commit: `fca85774`

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

Verification: **done**

- **DONE (session 9)**: `imageUrls?: string[]` added to `OrderDocument` interface in `src/db/schema/orders.ts`.
- **DONE (session 9)**: `imageUrls` collected from `product.mainImage` (deduplicated) in `src/app/api/checkout/route.ts` at order creation.
- **DONE (session 9)**: `imageUrls` also populated in `src/app/api/payment/verify/route.ts` (online payment order creation path).

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
- scripts/seed-\*.ts

### Acceptance criteria

- all document IDs generated via appkit typed generators
- generators support customId for externally provided IDs

Verification: **DONE** (session 12)

- **DONE**: All 14 entity ID generators with `customId` support are in appkit (pre-existing).
- **DONE**: Added to appkit: 17 media filename generators, `MediaFilenameContext` type, `generateMediaFilename` dispatcher, `generateBarcodeFromId`, `generateQRCodeData` (no hardcoded URL default), `generateOfferId`, `idExists`, `generateUniqueId`.
- **DONE**: `src/utils/id-generators.ts` deleted from letitrip (972 lines removed).
- **DONE**: `src/utils/index.ts` updated to explicitly export all generators from `@mohasinac/appkit/utils`.
- **DONE**: All callers (`product.repository.ts`, `offer.repository.ts`, `db/schema/*.ts`, `api/media/upload/route.ts`) import via `@/utils` barrel — verified no errors.
- appkit commit: `215a4c2` · letitrip commit: `9ca0db53`

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

### Mandatory adoption rule

Once a wrapper/layout variant is created in appkit, it must be adopted throughout both appkit and letitrip for all matching repeated patterns. Do not keep large repeated className strings when an approved variant exists; replace them with the variant unless a documented one-off exception is required.

### Why this is now required

- Index comparison shows appkit already has the foundational primitives (`src/ui/components/Semantic.tsx`, `src/ui/components/Div.tsx`, `src/ui/components/Layout.tsx`, `src/ui/components/Typography.tsx`).
- letitrip still contains many component-level files where repeated class clusters likely persist and should move to variants.

### Candidate analysis targets (index-derived)

- src/features/homepage/components/\*.tsx
- src/features/search/components/\*.tsx
- src/features/cart/components/\*.tsx
- src/features/admin/components/\*.tsx
- src/components/\*_/_.tsx
- src/app/[locale]/\*\*/layout.tsx

### Required non-code output

1. Pattern inventory: repeated class bundles used in 3+ places.
2. Variant proposal sheet:

- wrapper/component target (`Div`, `Section`, `Article`, `Container`, `Stack`, `Row`, `Grid`, `Heading`, `Text`)
- proposed variant name
- semantic intent
- replacement mapping examples

3. Migration rollout order by blast radius (low -> high).
4. Adoption enforcement plan: for each approved variant, migrate matching usages in both appkit and letitrip and track remaining class-bundle exceptions explicitly.

### Accessibility acceptance gate (mandatory for each proposed variant)

- semantic element correctness preserved (no div fallback where sectioning/heading is required)
- focus ring remains visible and keyboard navigability unchanged
- aria labeling/relationships preserved for interactive wrappers
- color contrast does not regress below WCAG AA

### Pattern Inventory (Session 17 Discovery)

**High-frequency patterns identified across letitrip** (grepped from src/\*_/_.tsx):

| Pattern                                                 | Frequency    | Semantic Intent                      | Current Bundle                                                                           |
| ------------------------------------------------------- | ------------ | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `flex flex-col items-center justify-center gap-*`       | 65+ matches  | Centered stack layout                | `flex flex-col items-center justify-center gap-3` (variations in gap size)               |
| `flex items-center gap-*`                               | 100+ matches | Horizontal row (centered vertically) | `flex items-center gap-2`, `gap-3`, `gap-1.5`                                            |
| `flex flex-wrap gap-*`                                  | 30+ matches  | Wrapped row layout                   | `flex flex-wrap gap-1`, `gap-2`, `gap-3`                                                 |
| `inline-flex items-center gap-* px-* py-* rounded-full` | 15+ matches  | Pill/badge component                 | `inline-flex items-center gap-1 px-3 py-1 rounded-full`                                  |
| `grid grid-cols-* gap-*`                                | 25+ matches  | Grid layout with responsive cols     | `grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4`                             |
| `rounded-xl border bg-* dark:bg-* p-*`                  | 10+ matches  | Card/panel container                 | `rounded-xl border border-zinc-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800` |
| `flex flex-col sm:flex-row gap-* items-center`          | 20+ matches  | Responsive column/row switcher       | `flex flex-col sm:flex-row items-center gap-3`                                           |
| `py-* px-* space-y-*`                                   | 15+ matches  | Vertical spacing with padding        | `py-3 px-2 space-y-0.5`                                                                  |

### Wrapper Variant Proposals (Session 17)

**Priority 1 - Highest impact (implements 65+ instances):**

1. **CenteredStack** (`Stack` variant: `centered`)
   - Replaces: `flex flex-col items-center justify-center gap-*`
   - Appkit target: `src/ui/components/Stack.tsx`
   - Semantic goal: Vertical center-aligned layout
   - Accessibility: Preserves flex semantics; keyboard nav unchanged; no aria dependencies
   - Example mapping: `<Stack gap="md" centered>` instead of `<div className="flex flex-col items-center justify-center gap-3">`
   - Blast radius: low-medium (homepage, error, empty state views)

**Priority 2 - Very high impact (implements 100+ instances):**

2. **Row** (`Stack` horizontal variant or dedicated `Row`)
   - Replaces: `flex items-center gap-*`
   - Appkit target: `src/ui/components/Row.tsx` (already exists; may need `centered` variant)
   - Semantic goal: Horizontal center-aligned row
   - Accessibility: Preserves flex semantics; keyboard/focus unchanged
   - Example mapping: `<Row gap="sm" centered>` instead of `<div className="flex items-center gap-2">`
   - Blast radius: very high (nav, cards, info rows throughout)

**Priority 3 - High impact (implements 30+ instances):**

3. **WrappedRow** (`Stack` variant: `wrap`)
   - Replaces: `flex flex-wrap gap-*`
   - Appkit target: `src/ui/components/Stack.tsx` (add `wrap` variant)
   - Semantic goal: Flexible wrap layout for tags/buttons/labels
   - Accessibility: No focus/aria impact; visual only
   - Example mapping: `<Stack gap="1" wrap>` instead of `<div className="flex flex-wrap gap-1">`
   - Blast radius: medium (action buttons, tag lists, footer links)

**Priority 4 - Medium impact (implements 15+ instances):**

4. **Pill / Badge** (new appkit component or `Button` variant)
   - Replaces: `inline-flex items-center gap-1 px-3 py-1 rounded-full`
   - Appkit target: `src/ui/components/Pill.tsx` (new) or `Button` variant="pill"`
   - Semantic goal: Inline pill-shaped indicator or tag
   - Accessibility: If interactive, must preserve `<button>` or `<a>` semantics; focus ring required
   - Example mapping: `<Pill>Online</Pill>` or `<Button variant="pill">Active</Button>`
   - Blast radius: low-medium (status badges, user states, feature indicators)

**Priority 5 - Medium impact (implements 25+ instances):**

5. **Grid** (enhance existing `src/ui/components/Grid.tsx`)
   - Replaces: `grid grid-cols-* gap-*` (auto-fill responsive patterns)
   - Appkit target: `src/ui/components/Grid.tsx`
   - Semantic goal: Responsive grid with named column patterns
   - Accessibility: Preserves grid semantics; no keyboard/aria impact
   - Example mapping: `<Grid cols="auto-fill" minCol="180px" gap="md">` instead of inline grid-cols
   - Blast radius: low (product grids, category grids, admin dashboards)
   - Note: May require Tailwind `grid-auto-fit` or `grid-auto-fill` config in appkit

**Priority 6 - Medium-low impact (implements 10+ instances):**

6. **Card / Panel** (new appkit component or `Container` variant)
   - Replaces: `rounded-xl border border-zinc-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800`
   - Appkit target: `src/ui/components/Card.tsx` (new) or `Container` variant="card"`
   - Semantic goal: White-background bordered container (light/dark aware)
   - Accessibility: Can be used with `<Section>`, `<Article>`, or `<Div>`; no aria impact
   - Example mapping: `<Card padding="md">` instead of raw div with class bundle
   - Blast radius: low-medium (info cards, form containers, summary panels)
   - Accessibility note: Card itself is a layout; does not force heading/semantic hierarchy

**Priority 7 - Lower impact (implements 20+ instances):**

7. **ResponsiveStack** (`Stack` variant: `responsiveDirection`)
   - Replaces: `flex flex-col sm:flex-row gap-* items-center`
   - Appkit target: `src/ui/components/Stack.tsx` (add `responsiveDirection` config)
   - Semantic goal: Vertical on mobile, horizontal on small+
   - Accessibility: No change; flex semantics preserved
   - Example mapping: `<Stack gap="md" responsiveDirection>` instead of raw flex-col + sm:flex-row
   - Blast radius: low (profile headers, info pairs)

### Accessibility Acceptance Gate — All Proposed Variants

**Semantic Correctness:**

- ✅ All proposals preserve or improve semantic HTML roles (flex/grid/section/article/button remain unchanged)
- ✅ No `<div>` fallback introduced where `<section>`/`<article>`/`<button>` is required
- ✅ Heading hierarchy and sectioning remain caller's responsibility (variants abstract layout only)

**Focus & Keyboard Navigation:**

- ✅ Flex/grid layout changes have zero keyboard impact
- ✅ Pill/Badge variant must preserve `<button>` or native focus ring if interactive
- ✅ Card variant does not alter focus order (it's a container, not an interactive boundary)

**ARIA Relationships:**

- ✅ All variants are layout-only; no aria-label/aria-describedby auto-injection
- ✅ Interactive sub-components (Pill as button, Pill as link) retain their native aria behavior
- ✅ aria-live, aria-invalid, aria-expanded remain caller's responsibility

**Color Contrast (WCAG AA):**

- ✅ Card variant includes `dark:` variants to match current theme support
- ✅ Pill/Badge variant must preserve background + text color ratios (no degradation)
- ✅ All border/background combinations in current repeated patterns already pass WCAG AA (will retain in variant defaults)

### Rollout Order by Blast Radius

**Phase 1 (Low-risk, high-consolidation):**

1. `Row` (Priority 2) — 100+ instances; enables the most consolidation; low complexity.
2. `CenteredStack` (Priority 1) — 65+ instances; complements Row; additive variant.
3. Adoption requirement: replace matching repeated class bundles in both appkit and letitrip for `Row`/`CenteredStack`; do not leave large parallel className implementations except documented one-off exceptions.

**Phase 2 (Medium-risk):**

1. `Grid` (Priority 5) — 25+ instances; responsive patterns already stable in current code.
2. `WrappedRow` (Priority 3) — 30+ instances; simple flex-wrap variant.
3. Adoption requirement: migrate matching `grid`/`flex-wrap` class clusters in both appkit and letitrip to these variants and record any explicit exceptions.

**Phase 3 (Component-new):**

1. `Card` (Priority 6) — 10+ instances; new component; lowest consumer count.
2. `Pill` (Priority 4) — 15+ instances; interactive semantics require careful review.
3. Adoption requirement: replace repeated card/pill class bundles in both appkit and letitrip with approved components/variants while preserving interaction semantics and focus behavior.

**Phase 4 (Refinement):**

1. `ResponsiveStack` (Priority 7) — 20+ instances; depends on phase-1 Stack adoption.
2. Adoption requirement: finish remaining cross-repo replacements so no matching repeated large className bundles remain in appkit or letitrip where an approved variant exists.

### Implementation Readiness

**Next session action (after variant approval):**

1. Define appkit export targets (which entrypoints, which .tsx files)
2. Create variant implementations with a11y test coverage
3. Mine letitrip for all 3+ instances of each pattern
4. Migrate in rollout order, batch by phase
5. Validate with watcher between phases

### Verification

Status: **Phase 2 in progress (batch 1 complete)**

- **DONE (session 17)**: Pattern inventory complete (65–100 frequency clusters identified).
- **DONE (session 17)**: 7 concrete variant proposals with semantic intent + a11y gate + rollout order documented.
- **DONE (session 18 batch 1)**: appkit `Stack` and `Row` now support `centered` variant prop in `src/ui/components/Layout.tsx` (appkit commit `e33b2a1`).
- **DONE (session 18 batch 1)**: letitrip cart slice migrated to TG7 phase-1 variants in `CheckoutSuccessView.tsx` and `CartView.tsx` (`Stack centered`, `Row`, and `Row wrap` adoption for repeated flex bundles) (letitrip commit `bdc3d80a`).
- **DONE (session 18 batch 2)**: cart item and promo surfaces now adopt `Row` variants in `CartItemRow.tsx`, `GuestCartItemRow.tsx`, and `PromoCodeInput.tsx` for repeated `flex items-center gap-*` bundles (letitrip commit `4bbbc57e`).
- **DONE (session 18 batch 3)**: checkout flow surfaces now adopt `Row` variants in `CheckoutOrderReview.tsx` and `CheckoutAddressStep.tsx`; repeated `flex items-center gap-*` bundles in `CheckoutOrderReview` are removed (letitrip commit `49f39333`).
- **DONE (session 18 batch 4)**: centered empty-state stack bundles now use `Stack centered` in `CategoryGrid.tsx` and `AuctionGrid.tsx` (`flex flex-col items-center justify-center` replaced) (letitrip commit `c476a2d3`).
- **DONE (session 19 batch 5)**: type-check parser blocker fixed in `src/hooks/useMediaUpload.ts` (broken JSDoc around `useMediaCrop`) to restore `npx tsc --noEmit` as usable validation signal (letitrip commit `09647e91`).
- **DONE (session 19 batch 6)**: products phase-1 wrapper migration applied in `ProductReviews.tsx`, `PreOrderDetailView.tsx`, `PromoBannerStrip.tsx`, `BidHistory.tsx`, and `PlaceBidForm.tsx`; repeated `flex items-center gap-*` / centered-stack bundles replaced with `Row`/`Stack` wrappers (letitrip commit `09647e91`).
- **NOTE (session 19)**: letitrip currently type-checks against published `@mohasinac/appkit` dist types where `Stack.centered` is not available; compatibility updates in consumer files use `Stack align="center" + className="justify-center"` until appkit package/version sync is completed.
- **DONE (session 18 batch 1)**: diagnostics clean on all touched files; appkit watcher (`watch:primitives`) reports build success after changes.
- **DONE (session 20)**: TG7 phase-1 complete — all remaining `flex items-center gap-*` and `flex flex-col items-center justify-center` patterns across admin, stores, seller, user, events, components, layout, and app-routes subsystems migrated to `Row`/`Stack` appkit primitives (letitrip commit `741efd0f`). Pre-commit prettier caught two regressions (PasswordStrengthIndicator.tsx, StoreProductsView.tsx) — both fixed in same commit.
- **DONE (session 21 batch 1)**: phase-2 `Row wrap` rollout removed every remaining letitrip runtime `flex flex-wrap*` bundle across admin, seller, products, search, cart, auctions, layout, and shared form/component surfaces (letitrip commit `c92fd55d`).
- **DONE (session 21 batch 1)**: matching appkit runtime surfaces now use `Row wrap` for homepage CTA/trust/toolbars, search, reviews, orders, FAQ, blog, wishlist, consultation, categories, promotions, media upload, footer, and stores (appkit commit `1ed9834`).
- **VALIDATION (session 21 batch 1)**: `grep` now reports zero letitrip runtime `flex flex-wrap` matches and only two appkit residual matches: intentional `src/ui/components/FormGrid.tsx` implementation (dynamic pixel gap/min width) and a single doc-comment example in `src/ui/components/DescriptionField.tsx`. Targeted diagnostics are clean on touched files. `npx tsc --noEmit` still reports pre-existing letitrip route/appkit-path typing noise and an unrelated appkit `src/ui/components/Accordion.tsx` type error.
- **DONE (session 22 batch 1)**: phase-2 `Grid` pattern rollout — consolidated 11 auto-fill grid usages across appkit (DashboardStats, SearchResultsSection, CategoryGrid, ConcernGrid) and letitrip (ProfileStatsGrid, PublicProfileView) to semantic `Grid cols="statTiles"|"categoryCards"` variants; updated DescriptionField doc example to use `Row wrap` instead of raw flex. Updated FormGrid decision: remains as intentional exception (dynamic pixel-level gap and minFieldWidth not suited to semantic variant API) (appkit commit `5e371b1`, letitrip commit `d6325250`).
- **DONE (session 22 batch 2)**: phase-2 `Grid` follow-up removed remaining letitrip `grid-cols-[repeat(auto-fill,minmax(180px,1fr))]` stat-card bundles in `EventStatsBanner`, `SellerPayoutStats`, `AdminBlogView`, and `AdminPayoutsView` by adopting `Grid cols="statTiles"` (letitrip commit `2b2a0292`).
- **VALIDATION (session 22 batch 2)**: targeted diagnostics are clean on all four touched files. Repo-wide `npx tsc --noEmit` is blocked by pre-existing parse errors in `src/app/api/media/upload/route.ts` (around line 262), unrelated to TG7 grid migrations.

---

## Task Group 8 - i18n Completeness and INR Currency Consistency

### Goal

Ensure every user-facing page/component is locale-aware and every money display uses INR formatting unless intentionally overridden by market config.

### Why this is now required

- Index comparison confirms large locale-routed surface in letitrip (`src/app/[locale]/**`) and dedicated i18n modules (`src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/i18n/resolve-locale.ts`).
- Appkit already exposes reusable locale/currency building blocks (`src/utils/number.formatter.ts`, `src/ui/components/PriceDisplay.tsx`, `src/features/layout/LocaleSwitcher.tsx`, `src/providers/payment-razorpay/index.ts`).
- Remaining `$` outputs indicate either hardcoded formatting, fallback defaults, or incomplete config/provider propagation.

### Candidate audit targets

- src/app/[locale]/\*\*/page.tsx
- src/app/[locale]/\*\*/layout.tsx
- src/features/\*_/components/_.tsx
- src/components/\*_/_.tsx
- src/i18n/routing.ts
- src/i18n/request.ts
- src/providers.config.ts
- src/config/\*\*

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

Status: **DONE** (session 11)

- **DONE (session 11)**: Full audit confirmed no unintended `$` display in INR market routes.
- **DONE (session 11)**: Config flow verified — `LOCALE_CONFIG.DEFAULT_CURRENCY = "INR"`, `LOCALE_CONFIG.DEFAULT_LOCALE = "en-IN"`. All `formatCurrency` calls in letitrip delegate to appkit which defaults to INR/en-IN Intl.NumberFormat.
- **DONE (session 11)**: Root cause bug fixed — appkit `ProductCard` (`ProductGrid.tsx`) was rendering `{product.currency ?? "₹"}` literally, causing products stored with ISO code `"INR"` to display `"INR1,234"` instead of `"₹1,234"`. Fixed to use `formatCurrency(product.price, product.currency ?? "INR")`.
- **DONE (session 11)**: 7 appkit files updated in `fix(currency)` commit: `ProductGrid.tsx`, `WishlistPage.tsx`, `PreorderCard.tsx`, `DashboardStats.tsx`, `CartDrawer.tsx`, `AuctionCard.tsx`, `OrdersList.tsx` — all now route price display through `formatCurrency`.
- **DONE (session 11)**: 2 letitrip admin files updated: `OrderStatusForm.tsx` and `OrderTableColumns.tsx` replace inline `new Intl.NumberFormat("en-IN", {...})` with shared `formatCurrency`.
- **DONE (session 11)**: i18n routing confirmed — `routing.ts` has `locales: ["en"]`, `localePrefix: "never"`, `localeCookie: false`. `request.ts` falls back to `"en"` for undefined locale (explicitly handles ISR/static pre-render edge case). Single-locale setup is intentional; translation coverage is complete for `en` namespace.
- **DONE (session 11)**: Currency config propagation documented — INR config stays in `src/constants/config.ts` (letitrip-specific). Appkit formatters/components default to INR; consumer injects market config via `LOCALE_CONFIG`.

---

## Task Group 10 - Multi-Image Support for Events and Blog

### Goal

Upgrade event and blog entities from a single string image field to role-specific typed `MediaField` arrays with enforced per-role caps.

### Target entities

- events
- blog posts

### New media field model

**EventDocument / `eventItemSchema`:**
| Role field | Type | Max | Replaces / addition |
|---|---|---|---|
| `coverImage` | `MediaField \| null` | 1 | replaces `coverImageUrl: string \| undefined` |
| `eventImages` | `MediaField[]` | 10 | new — during/after event photos |
| `winnerImages` | `MediaField[]` | 5 | new — winner/prize/podium photos |
| `additionalImages` | `MediaField[]` | 10 | new — gallery/miscellaneous |

**BlogPostDocument / `blogPostSchema`:**
| Role field | Type | Max | Replaces / addition |
|---|---|---|---|
| `coverImage` | `MediaField \| null` | 1 | upgrades existing `coverImage: string \| undefined` |
| `contentImages` | `MediaField[]` | 10 | new — inline illustrations/screenshots |
| `additionalImages` | `MediaField[]` | 5 | new — supplementary gallery |

### Backward-compatibility rule

- During reads, bare string values for `coverImageUrl` / `coverImage` are coerced to `{ url, type: "image" }` in a migration helper.
- Writes always use the typed descriptor.
- Old fields remain readable/writable until all admin forms are migrated.

### Candidate appkit files

- `appkit/src/features/events/schemas/index.ts` — add typed fields + coercion helper
- `appkit/src/features/events/types/index.ts` — update `EventItem` TypeScript type
- `appkit/src/features/blog/schemas/index.ts` — add typed fields + coercion helper
- `appkit/src/features/blog/types/index.ts` — update `BlogPost` TypeScript type
- `appkit/src/features/events/components/EventFormDrawer.tsx` — add upload slots for eventImages, winnerImages, additionalImages
- `appkit/src/features/blog/components/BlogPostForm.tsx` — new form component with all upload slots
- `appkit/src/features/media/*` — shared abort cleanup + upload helpers already present

### Candidate letitrip files

- `src/features/events/components/EventTypeConfig/*.tsx` — event-type config forms may need media slot wiring
- `src/actions/events.actions.ts` — finalize tmp→canonical on event create/update
- `src/actions/blog.actions.ts` — finalize tmp→canonical on blog create/update
- `src/app/api/media/upload/route.ts` — add `event-image`, `event-winner-image`, `event-additional-image`, `blog-content-image`, `blog-additional-image` context guardrails

### Upload API context guardrails to add

| Context key              | Max count | Target entity |
| ------------------------ | --------- | ------------- |
| `event-cover`            | 1         | events        |
| `event-image`            | 10        | events        |
| `event-winner-image`     | 5         | events        |
| `event-additional-image` | 10        | events        |
| `blog-cover`             | 1         | blog posts    |
| `blog-content-image`     | 10        | blog posts    |
| `blog-additional-image`  | 5         | blog posts    |

### Enforcement matrix (entity -> form -> schema -> API)

| Entity | Layer   | File                                                        | Role                                               | Max             | Abort cleanup                      | Appkit ownership target              | Status  |
| ------ | ------- | ----------------------------------------------------------- | -------------------------------------------------- | --------------- | ---------------------------------- | ------------------------------------ | ------- |
| events | Schema  | `appkit/src/features/events/schemas/index.ts`               | all roles                                          | per table above | n/a                                | appkit/src/features/events/schema/\* | pending |
| events | Types   | `appkit/src/features/events/types/index.ts`                 | all roles                                          | per table above | n/a                                | appkit/src/features/events/types/\*  | pending |
| events | Form    | `appkit/src/features/events/components/EventFormDrawer.tsx` | cover, eventImages, winnerImages, additionalImages | per table above | onAbort wired for all upload slots | appkit/src/features/events/\*        | pending |
| events | API     | `src/app/api/media/upload/route.ts`                         | event context keys                                 | per table above | staged URLs under tmp/\*           | consumer route wiring                | pending |
| events | Actions | `src/actions/events.actions.ts`                             | all media arrays                                   | n/a             | finalize tmp→canonical on save     | letitrip consumer action             | pending |
| blog   | Schema  | `appkit/src/features/blog/schemas/index.ts`                 | all roles                                          | per table above | n/a                                | appkit/src/features/blog/schema/\*   | pending |
| blog   | Types   | `appkit/src/features/blog/types/index.ts`                   | all roles                                          | per table above | n/a                                | appkit/src/features/blog/types/\*    | pending |
| blog   | Form    | `appkit/src/features/blog/components/BlogPostForm.tsx`      | cover, contentImages, additionalImages             | per table above | onAbort wired for all upload slots | appkit/src/features/blog/\*          | pending |
| blog   | API     | `src/app/api/media/upload/route.ts`                         | blog context keys                                  | per table above | staged URLs under tmp/\*           | consumer route wiring                | pending |
| blog   | Actions | `src/actions/blog.actions.ts`                               | all media arrays                                   | n/a             | finalize tmp→canonical on save     | letitrip consumer action             | pending |

### Acceptance criteria

- All new media role fields are `MediaField`-typed in appkit schemas and TypeScript types.
- `EventFormDrawer` exposes upload slots for cover, event photos, winner photos, and additional photos.
- New `BlogPostForm` exposes upload slots for cover, content images, and additional images.
- Upload API enforces per-context caps for all new context keys.
- All new upload slots wire `onAbort` to clean staged tmp URLs on dismiss.
- Event and blog save actions finalize `tmp/*` uploads to canonical paths.
- Backward-compatibility coercion helper converts legacy string fields to `MediaField` on read.

### Verification

Status: **DONE** (session 13)

- **DONE (session 13 batch 1)**: appkit `eventItemSchema` and `blogPostSchema` now accept typed `MediaField` cover media plus role-specific arrays, while still coercing legacy string cover values on read.
- **DONE (session 13 batch 1)**: appkit event/blog types and public rendering components now support typed cover-image access via shared media helpers.
- **DONE (session 13 batch 2)**: letitrip event/blog document schemas, create/update actions, admin API routes, and staged-media finalization helpers now persist typed media descriptors end-to-end.
- **DONE (session 13 batch 2)**: upload API enforces TG10 context caps for `event-cover`, `event-image`, `event-winner-image`, `event-additional-image`, `blog-cover`, `blog-content-image`, and `blog-additional-image`.
- **DONE (session 13 batch 3)**: letitrip admin blog/event forms expose all new media slots and wire `onAbort` cleanup; reusable ownership is pushed into appkit via `BlogPostForm` and `EventFormDrawer` slot APIs.
- **DONE (session 13 batch 3)**: validation signal is green via targeted diagnostics on all touched adapter files and successful appkit batch-A/batch-B watcher builds; aggregate `watch:all` remains a separate Windows `spawn EINVAL` issue.

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

### Migration decision sheet

| Candidate                  | Appkit path                                                          | Letitrip path                                                             | Classification                                  | Current state                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion.tsx              | `appkit/src/ui/components/Accordion.tsx`                             | `letitrip.in/src/components/ui/Accordion.tsx`                             | move fully to appkit                            | **DONE (session 15 batch 1)** — local duplicate deleted; letitrip cart checkout now imports `Accordion` and `AccordionItem` from `@mohasinac/appkit/ui`   |
| LocaleSwitcher.tsx         | `appkit/src/features/layout/LocaleSwitcher.tsx`                      | `letitrip.in/src/components/layout/LocaleSwitcher.tsx`                    | reduce letitrip to config-only adapter          | **DONE (session 14 batch 1)** — letitrip now delegates rendering to appkit and keeps only routing/i18n wiring                                             |
| CustomerReviewsSection.tsx | `appkit/src/features/homepage/components/CustomerReviewsSection.tsx` | `letitrip.in/src/features/homepage/components/CustomerReviewsSection.tsx` | already appkit-owned thin adapter               | resolved — letitrip file is adapter-only per index and current usage                                                                                      |
| FAQSection.tsx             | `appkit/src/features/homepage/components/FAQSection.tsx`             | `letitrip.in/src/features/homepage/components/FAQSection.tsx`             | already appkit-owned thin adapter               | resolved — layout ownership is already in appkit                                                                                                          |
| HowItWorksSection.tsx      | `appkit/src/features/homepage/components/HowItWorksSection.tsx`      | `letitrip.in/src/features/homepage/components/HowItWorksSection.tsx`      | already appkit-owned thin adapter               | resolved — letitrip only supplies project-specific content/config                                                                                         |
| SearchFiltersRow.tsx       | `appkit/src/features/search/components/SearchFiltersRow.tsx`         | `letitrip.in/src/features/search/components/SearchFiltersRow.tsx`         | reduce letitrip to config-only adapter          | **DONE (session 14 batch 3)** — letitrip now delegates rendering to appkit and only adapts category data plus translated labels                           |
| SearchResultsSection.tsx   | `appkit/src/features/search/components/SearchResultsSection.tsx`     | `letitrip.in/src/features/search/components/SearchResultsSection.tsx`     | reduce letitrip to config-only adapter          | **DONE (session 15 batch 1)** — local duplicate deleted; letitrip search view now uses appkit `SearchResultsSection` with app-specific render slots       |
| ProductGrid.tsx            | `appkit/src/features/products/components/ProductGrid.tsx`            | `letitrip.in/src/components/products/ProductGrid.tsx`                     | move fully to appkit                            | **DONE (session 14 batch 4)** — letitrip grid now delegates reusable rendering to appkit `ProductGrid` and keeps only thin card selection/cart adaptation |
| CategoryGrid.tsx           | `appkit/src/features/categories/components/CategoryGrid.tsx`         | `letitrip.in/src/features/categories/components/CategoryGrid.tsx`         | already appkit-owned thin adapter               | resolved — letitrip adapts appkit category grid with project copy/config                                                                                  |
| AdminReviewsView.tsx       | `appkit/src/features/admin/components/AdminReviewsView.tsx`          | `letitrip.in/src/features/admin/components/AdminReviewsView.tsx`          | exception consumer-only wiring                  | resolved exception — letitrip owns admin review state/mutations while appkit owns the reusable shell                                                      |
| AdminSectionsView.tsx      | `appkit/src/features/admin/components/AdminSectionsView.tsx`         | `letitrip.in/src/features/admin/components/AdminSectionsView.tsx`         | exception consumer-only wiring                  | resolved exception — letitrip owns section drawer/form state while appkit owns the reusable shell                                                         |
| api-response.ts            | `appkit/src/next/api/api-response.ts`                                | deleted                                                                   | delete letitrip duplicate after import rewiring | **DONE (session 3)** — appkit-owned; local duplicate already removed                                                                                      |
| id-generators.ts           | `appkit/src/utils/id-generators.ts`                                  | deleted                                                                   | delete letitrip duplicate after import rewiring | **DONE (session 12)** — appkit-owned; local duplicate already removed                                                                                     |

### Exception log

- `AdminReviewsView.tsx`: consumer-only admin state, route action handling, and mutation wiring over an appkit-owned layout shell.
- `AdminSectionsView.tsx`: consumer-only homepage section form state and route-driven drawer wiring over an appkit-owned shell.

### Acceptance criteria

- every shared-basename candidate has one explicit appkit migration decision
- no reusable duplicate remains intentionally owned by letitrip
- any remaining letitrip file is justified as consumer-only wiring, not reusable implementation drift

### Verification

Status: **done**

- **DONE (session 14 batch 1)**: overlap re-check confirmed `LocaleSwitcher` existed in both repos; letitrip now uses appkit’s shared `LocaleSwitcher` and retains only consumer-specific locale routing wiring.
- **DONE (session 14 batch 2)**: TG9 migration decision sheet documented for the current high-confidence overlap list, including resolved adapters, exception files, and remaining near-term code slices.
- **DONE (session 14 batch 3)**: `SearchFiltersRow` no longer owns a parallel local implementation; letitrip now delegates to appkit and keeps only category-shape and translation-label adaptation.
- **DONE (session 14 batch 4)**: `ProductGrid` no longer owns a parallel reusable grid implementation; letitrip now delegates rendering to appkit and keeps only project-specific product-card selection/cart behavior.
- **DONE (session 15 batch 1)**: `Accordion` no longer owns a parallel local implementation in letitrip; appkit UI ownership is now direct.
- **DONE (session 15 batch 1)**: `SearchResultsSection` no longer owns a parallel local implementation in letitrip; appkit feature ownership is now direct with configurable render slots.

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
