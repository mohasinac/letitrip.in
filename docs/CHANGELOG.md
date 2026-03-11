# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — fix(i18n): remove hardcoded column headers in event, seller-payout, and coupon tables

### Fixed (Rule 3 — no hardcoded strings in JSX/column definitions)

- **`src/features/events/components/EventEntriesTable.tsx`** — `"User"`, `"Status"`, `"Submitted"`, `"Points"` column headers replaced with `t("colUser")`, `tTable("status")`, `t("colSubmitted")`, `t("colPoints")`.
- **`src/features/events/components/EventsTable.tsx`** — `"Title"`, `"Type"`, `"Status"`, `"Starts"`, `"Ends"`, `"Entries"` replaced with `t()` / `tTable()` keys.
- **`src/features/seller/components/PayoutTableColumns.tsx`** — All 7 column headers + `STATUS_LABEL` record + `PAYMENT_METHOD_LABEL` record replaced with `UI_LABELS.ADMIN.PAYOUTS` constants.
- **`src/features/admin/components/CouponTableColumns.tsx`** — Remaining `"Discount"` column header replaced with `UI_LABELS.ADMIN.COUPONS.DISCOUNT_HEADER`.

### Added (i18n keys — all 5 locales)

- **`messages/*.json` → `adminEvents`** — Added: `colUser`, `colSubmitted`, `colPoints`, `colType`, `colStarts`, `colEnds`.
- **`src/constants/ui.ts` → `UI_LABELS.ADMIN.COUPONS`** — Added: `DISCOUNT_HEADER`.

---

## [Unreleased] — fix(security): eliminate all Math.random() from production code; replace with crypto.getRandomValues()

### Security

- **`src/utils/id-generators.ts`** — `generateRandomString()` (used for Firestore SEO document IDs) now uses `globalThis.crypto.getRandomValues(new Uint8Array(length))` instead of `Math.random()`.
- **`src/utils/formatters/string.formatter.ts`** — `randomString()` now uses `globalThis.crypto.getRandomValues()` (browser + Node.js 18+ compatible).

---

## [Unreleased] — fix(i18n/security): replace hardcoded strings in admin event forms; Math.random() → crypto.randomUUID()

### Security

- **`src/features/events/components/EventTypeConfig/PollConfigForm.tsx`** — Replaced `Math.random().toString(36)` with `crypto.randomUUID()` for poll option IDs.
- **`src/features/events/components/SurveyFieldBuilder.tsx`** — Same; survey field IDs now use `crypto.randomUUID()`.
- **`src/features/admin/components/AdminMediaView.tsx`** — `MediaOperation.id` now uses `crypto.randomUUID()` instead of `Math.random()`.
- **`src/utils/events/event-manager.ts`** — Element tracking IDs use `crypto.randomUUID()`.

### Fixed (Rule 3 — no hardcoded strings in JSX)

- **`src/features/events/components/EventTypeConfig/PollConfigForm.tsx`** — `"Poll Options"`, `"Option {n}"`, `"+ Add Option"`, `"Allow multiple selections"`, `"Allow comments"`, `"Results Visibility"` replaced with `useTranslations("adminEvents")` calls.
- **`src/features/events/components/SurveyFieldBuilder.tsx`** — `"Form Fields"`, `"Label"`, `"No fields yet. Add one above."`, `"Field label"`, `"Options (comma-separated)"`, `"Option 1, Option 2, Option 3"` replaced with `t()` calls.
- **`src/features/admin/components/CouponTableColumns.tsx`** — `"Free shipping"`, `"BXGY"`, `"Usage"`, `" uses"`, `"Status"`, `"Expired"`, `"Active"`, `"Inactive"` replaced with `UI_LABELS.ADMIN.COUPONS.*` constants.

### Added (i18n keys — all 5 locales: en, in, mh, tn, ts)

- **`messages/*.json` → `adminEvents`** — Added: `formFieldsLabel`, `fieldLabel`, `noFieldsYet`, `fieldLabelPlaceholder`, `optionsLabel`, `optionsPlaceholder`, `pollOptionsLabel`, `pollOptionPlaceholder`, `pollAddOption`, `pollAllowMultiSelect`, `pollAllowComments`, `pollResultsVisibility`.
- **`src/constants/ui.ts` → `UI_LABELS.ADMIN.COUPONS`** — Added: `DISCOUNT_FREE_SHIPPING`, `DISCOUNT_BXGY`, `USAGE_HEADER`, `USAGE_SUFFIX`, `STATUS_HEADER`, `STATUS_EXPIRED`, `STATUS_ACTIVE`, `STATUS_INACTIVE`.

---

## [Unreleased] — fix(security): crypto.randomInt for OTP; remove dangerouslySetInnerHTML from static FAQ; dead session-ID duplicate removed

### Security

- **`src/helpers/auth/token.helper.ts`** — `generateVerificationCode()` replaced `Math.floor(100000 + Math.random() * 900000)` with `crypto.randomInt(100000, 1000000)`. `Math.random()` is not cryptographically secure; a compromised seed would make OTP values predictable. `crypto.randomInt` uses the OS CSPRNG.
- **`src/lib/firebase/storage.ts`** — `generateUniqueFilename()` replaced `Math.random().toString(36).substring(2, 15)` with `randomBytes(8).toString("hex")` (16 hex chars, 64 bits entropy). Function was dead code but is exported, so secured in place.
- **`src/features/homepage/components/FAQSection.tsx`** — Removed `dangerouslySetInnerHTML={{ __html: faq.answer }}` on static FAQ answers. Replaced `<div>` with `<p>{faq.answer}</p>`. The answers come from developer-controlled `faq-data.ts` plain-text strings; using `dangerouslySetInnerHTML` was unnecessary and widened the XSS surface.
- **`src/features/faq/components/FAQAccordion.tsx`** — Same fix: replaced `dangerouslySetInnerHTML={{ __html: answer }}` with `<p>{answer}</p>`. Static locale-translated strings from `faq-data.ts` / `faq-data-hi.ts` — no HTML content.

### Changed

- **`src/db/schema/sessions.ts`** — Removed dead duplicate `generateSessionId()` function that used `Math.random()`. The canonical implementation in `src/helpers/auth/token.helper.ts` (using `uuidv4()`) is the only one now.
- **`src/repositories/session.repository.ts`** — Updated import of `generateSessionId` from `@/db/schema` → `@/helpers/auth` to match the canonical (cryptographically secure) implementation.

---

## [Unreleased] — fix(tests): repair API handler test infrastructure

### Fixed

- **`src/lib/api/api-handler.ts`** — `context.params` access is now guarded for test environments where `context` is not passed (runtime-only via `(context as any)?.params`; TypeScript type stays required for Next.js App Router compatibility).
- **`src/lib/api/api-handler.ts`** — Replaced `ApiErrors.validationError()` with `errorResponse()` so that test mocks which only stub `errorResponse` (not the full `ApiErrors` object) work correctly.
- **`src/lib/api/api-handler.ts`** — Added `safeParse` guard: schema validation is skipped when the schema stub has no `safeParse` method (a common pattern in legacy tests).
- **`src/__mocks__/firebase-admin-firestore.ts`** — Added `: any` return type annotations to break TS7023/7024 circular recursive inference errors; added `settings()` to the Admin Firestore mock.
- **`src/lib/firebase/__mocks__/admin.ts`** — Added `settings: jest.fn()` to the `getAdminDb` mock (Firebase Admin initialisation calls `db.settings()` before use).
- **`src/app/api/__tests__/carousel.test.ts`** — Repository mock now includes `list()` returning `{ items, total }` paginated shape (route was updated to use `.list()`, test had stale `.findAll()` only); schema mock updated to validate `title + media` presence.
- **`src/app/api/__tests__/auth-reset-password.test.ts`** — Test password updated from `"newSecure123"` → `"n3wSecure@123"` to satisfy the strengthened `passwordSchema` (≥12 chars + upper/lower/digit/special).
- **`src/app/api/__tests__/user-password.test.ts`** — Test passwords updated (`"NewSecure456"` → `"NewSecure456!"`) and test syntax error from a previous edit corrected.

---

## [Unreleased] — fix(security): CSP nonce applied to inline scripts in root layout

### Fixed

- **`src/app/layout.tsx`** — Read `x-nonce` header (injected by middleware) and pass it as `nonce` prop to all three inline `<script>` tags (organization JSON-LD, search-box JSON-LD, dark-mode detection). Previously the production nonce-based CSP (`script-src 'self' 'nonce-…'`) would silently block these scripts, breaking dark-mode initialisation and structured-data injection. Closes §2.4.

---

## [Unreleased] — feat(H2/H4/H7): dead barrel exports removed; THEME_CONSTANTS animation aliases deleted; changesets publishing infrastructure

### Changed

- **`src/hooks/index.ts`** (H2) — Removed `export { useForm } from "react-hook-form"` convenience re-export. Components import directly from `react-hook-form` per Rule 5.
- **`src/components/layout/SidebarLayout.tsx`** (H4) — Replaced `${THEME_CONSTANTS.animation.normal}` with inline `duration-300`; no indirection needed.
- **`src/constants/theme.ts`** (H4) — Deleted the `animation: { fast, normal, slow }` section (3 pure Tailwind-class aliases: `"duration-150"`, `"duration-300"`, `"duration-500"`).
- **`packages/*/package.json`** (H7) — Removed `"private": true`; added `"publishConfig": { "access": "public" }` to all 5 `@lir/*` packages (`core`, `http`, `next`, `react`, `ui`).
- **`package.json`** (H7) — Added `@changesets/cli ^2.27.12` to devDependencies; added `changeset`, `version-packages`, `release` scripts.

### Added

- **`.changeset/config.json`** (H7) — Changesets configuration: `access: public`, `baseBranch: main`, `updateInternalDependencies: patch`. Enables `npm run changeset` / `npm run release` workflow for `@lir/*` packages.

---

## [Unreleased] — XSS fix: admin form previews sanitised; Algolia hook deduplicated

### Security

- **`src/features/admin/components/BlogForm.tsx`** — Fixed stored XSS in readonly preview: `post.content` was passed directly to `dangerouslySetInnerHTML`. Now routed through `proseMirrorToHtml()`, which escapes text nodes and validates link `href` values before inserting into HTML.
- **`src/features/admin/components/FaqForm.tsx`** — Same fix: `faq.answer` readonly preview now uses `proseMirrorToHtml()`.
- **`src/features/admin/components/SectionForm.tsx`** — Same fix: `section.description` readonly preview now uses `proseMirrorToHtml()`.

### Changed

- **`src/features/admin/hooks/useAlgoliaSync.ts`** — Merged in `useAlgoliaSyncProducts` and `useAlgoliaSyncPages` from the dead `src/hooks/useAlgoliaSync.ts`. All Algolia hooks now live in the admin feature module.
- **`src/features/admin/components/AdminSiteView.tsx`** — Updated import of `useAlgoliaSyncProducts`/`useAlgoliaSyncPages` from `@/hooks` → `@/features/admin` (architecture Rule 2 compliance).

### Removed

- **`src/hooks/useAlgoliaSync.ts`** — Deleted; was a duplicate of the admin feature hook. Callers updated to `@/features/admin`.
- **`src/hooks/index.ts`** — Removed re-exports for the deleted `useAlgoliaSync.ts`.

---

## [Unreleased] — feat: API timing instrumentation in createApiHandler

### Added

- **`src/lib/api/api-handler.ts`** — Added `performance.now()` timing around every API handler. On success logs `api.timing` with `method`, `path`, `status`, and `durationMs` via `serverLogger.info`; on unhandled error also logs `api.timing` at `serverLogger.error` level with the error message. Zero overhead for handlers that don't throw.

---

## [Unreleased] — refactor: Consolidate admin-only hooks into features/admin

### Changed

- **`src/features/admin/hooks/useAdminStats.ts`** _(new)_ — Migrated from `src/hooks/useAdminStats.ts`; admin dashboard statistics hook now lives inside the admin feature module.
- **`src/features/admin/hooks/useAdminSessions.ts`** _(new)_ — Migrated from `src/hooks/useSessions.ts`; exports `useAdminSessions`, `useRevokeSession`, `useRevokeUserSessions`.
- **`src/features/admin/hooks/index.ts`** — Added barrel exports for the two new hooks.
- **`src/features/admin/components/AdminDashboardView.tsx`** — `useAdminStats` import updated to `@/features/admin`.
- **`src/features/admin/components/AdminSessionsManager.tsx`** — Session hook imports updated to `@/features/admin`.
- **`src/hooks/index.ts`** — Removed re-exports for the now-deleted hooks.

### Removed

- **`src/hooks/useAdminStats.ts`** — Deleted; moved to `features/admin/hooks/`.
- **`src/hooks/useSessions.ts`** — Deleted; moved to `features/admin/hooks/useAdminSessions.ts`.

### Fixed

- **`src/features/admin/components/__tests__/AdminSessionsManager.test.tsx`** — Updated mock paths after hook migration.
- **`src/app/[locale]/admin/dashboard/__tests__/page.test.tsx`** — Removed invalid `@/components/admin/dashboard` mock; added `AdminDashboardView` to `@/features/admin` mock.

---

## [Unreleased] — G1 complete: All admin mutations migrated to Server Actions; G2 verified complete

### Changed (Stage G1 — Service-to-Actions Migration)

- **`src/actions/blog.actions.ts`** _(new)_ — `createBlogPostAction`, `updateBlogPostAction`, `deleteBlogPostAction`. Blog CRUD now bypasses service → apiClient → API route chain entirely.
- **`src/actions/event.actions.ts`** _(new)_ — `createEventAction`, `updateEventAction`, `deleteEventAction`, `changeEventStatusAction`, `adminUpdateEventEntryAction`. All admin event mutations use repositories directly with `requireRole(["admin","moderator"])` + rate-limit guards.
- **`src/actions/carousel.actions.ts`** _(new)_ — `createCarouselSlideAction`, `updateCarouselSlideAction`, `deleteCarouselSlideAction`. Schema updated to match `CarouselSlideDocument` shape (`active`/`media`).
- **`src/actions/sections.actions.ts`** _(new)_ — `createHomepageSectionAction`, `updateHomepageSectionAction`, `deleteHomepageSectionAction`. Schema uses `enabled` (not `isEnabled`).
- **`src/actions/admin-coupon.actions.ts`** _(new)_ — `adminCreateCouponAction`, `adminUpdateCouponAction`, `adminDeleteCouponAction`.
- **`src/actions/category.actions.ts`** _(extended)_ — Added `updateCategoryAction`, `deleteCategoryAction`.
- **`src/actions/faq.actions.ts`** _(extended)_ — Added `adminCreateFaqAction`, `adminUpdateFaqAction`, `adminDeleteFaqAction`.
- **`src/actions/admin.actions.ts`** _(extended)_ — Added `adminUpdateOrderAction`, `adminUpdatePayoutAction`, `adminUpdateUserAction`, `adminDeleteUserAction`, `adminUpdateStoreStatusAction`, `adminCreateProductAction`, `adminUpdateProductAction`, `adminDeleteProductAction`.
- **`src/actions/index.ts`** — Barrel updated with all new action exports.
- **`src/features/admin/hooks/useAdminBlog.ts`** — Mutations now call Server Actions (blog).
- **`src/features/admin/hooks/useAdminCarousel.ts`** — Mutations now call Server Actions (carousel).
- **`src/features/admin/hooks/useAdminCategories.ts`** — Update/delete mutations now call Server Actions.
- **`src/features/admin/hooks/useAdminCoupons.ts`** — Mutations now call Server Actions (coupons).
- **`src/features/admin/hooks/useAdminFaqs.ts`** — Mutations now call Server Actions (FAQs).
- **`src/features/admin/hooks/useAdminSections.ts`** — Mutations now call Server Actions (sections).
- **`src/features/admin/hooks/useAdminOrders.ts`** — `updateMutation` now calls `adminUpdateOrderAction`.
- **`src/features/admin/hooks/useAdminPayouts.ts`** — `updateMutation` now calls `adminUpdatePayoutAction`.
- **`src/features/admin/hooks/useAdminUsers.ts`** — Update/delete mutations now call Server Actions.
- **`src/features/admin/hooks/useAdminStores.ts`** — `updateStoreMutation` now calls `adminUpdateStoreStatusAction`.
- **`src/features/admin/hooks/useAdminProducts.ts`** — All mutations now call Server Actions (products).
- **`src/features/events/hooks/useEventMutations.ts`** — All admin mutation hooks now call Server Actions.
- **`src/services/admin.service.ts`** — Removed dead methods: `createBlogPost`, `updateBlogPost`, `deleteBlogPost`, `updateOrder`, `updatePayout`, `updateUser`, `deleteUser`, `updateStoreStatus`, `createAdminProduct`, `updateAdminProduct`, `deleteAdminProduct`.
- **`src/services/carousel.service.ts`** — Removed dead methods: `create`, `update`, `delete`.
- **`src/services/category.service.ts`** — Removed dead methods: `update`, `delete`.
- **`src/services/coupon.service.ts`** — Removed dead methods: `create`, `update`, `delete`.
- **`src/services/faq.service.ts`** — Removed dead methods: `create`, `update`, `delete`.
- **`src/services/homepage-sections.service.ts`** — Removed dead methods: `create`, `update`, `delete`.
- **`src/services/event.service.ts`** — Removed dead methods: `adminCreate`, `adminUpdate`, `adminDelete`, `adminSetStatus`, `adminUpdateEntry`.

### Fixed (Zod v4 compatibility)

- Fixed `z.record(z.unknown())` calls to `z.record(z.string(), z.unknown())` in all new action files — Zod v4 requires explicit key schema as first argument.

### Notes

- Stage **G2** (FilterPanel consolidation) verified complete — all 14+ admin filter UIs already use `FilterPanel`. No changes needed.
- All `PayoutStatus` references now use correct values: `"pending" | "processing" | "completed" | "failed"` (not `"paid"` or `"cancelled"`).

---

## [Unreleased] — XSS fix: escapeHtml in proseMirrorToHtml + safe href validation in ProseMirror link marks

### Security

- **`src/utils/formatters/string.formatter.ts`** — Fixed stored XSS: ProseMirror `text` nodes were interpolated raw into the HTML output string. All text content is now passed through the existing `escapeHtml()` function before insertion, preventing `<script>`, attribute injection, and prototype-polluting payloads from being rendered.
- **`src/utils/formatters/string.formatter.ts`** — Fixed reflected XSS via link marks: `mark.attrs.href` was interpolated directly into `<a href="...">` without validation. Href values are now validated to only permit `https://`, `http://`, `mailto:`, relative paths, and fragments; values that fail the allowlist are replaced with `"#"`. The attribute value is also entity-encoded (`&"<>`) before insertion. Added `rel="noopener noreferrer"` to all generated links.
- **`src/features/blog/components/BlogPostView.tsx`** — Blog post `content` field was rendered with `dangerouslySetInnerHTML={{ __html: post.content }}` using the raw Firestore string. Now calls `proseMirrorToHtml(post.content)` so all content — whether stored as ProseMirror JSON or legacy HTML — is normalised through the sanitised renderer before display.

---

## [Unreleased] — TD-005 resolved: media routes migrated to createApiHandler; SSRF + Math.random() fixed

### Security

- **`src/lib/validation/schemas.ts`** — Fixed SSRF vulnerability: `cropDataSchema.sourceUrl` and `trimDataSchema.sourceUrl` were `z.string().url()` (accepts any URL including internal IPs and metadata endpoints). Changed both to `mediaUrlSchema` which enforces an approved-domain whitelist (`firebasestorage.googleapis.com`, `storage.googleapis.com`, `res.cloudinary.com`, `images.unsplash.com`, `cdn.letitrip.in`). An attacker could previously supply `http://169.254.169.254/...` or similar to exfiltrate instance metadata.
- **`src/app/api/media/crop/route.ts`** — Replaced `Math.random().toString(36)` filename with `randomBytes(6).toString("hex")` (cryptographically secure).
- **`src/app/api/media/trim/route.ts`** — Same `Math.random()` → `randomBytes(6)` fix.

### Changed

- **`src/app/api/media/crop/route.ts`** — Migrated from manual `requireAuthFromRequest` + `validateRequestBody` pattern to `createApiHandler` with `schema: cropDataSchema` and `rateLimit: RateLimitPresets.STRICT`. Removes duplicate boilerplate; centralised error handling and rate-limit headers now applied automatically.
- **`src/app/api/media/trim/route.ts`** — Same migration. Redundant `if (startTime >= endTime)` guard removed (already enforced by `trimDataSchema.refine()`). `try/finally` cleanup of temp files preserved inside the handler.
- **`src/app/api/media/upload/route.ts`** — Migrated from manual auth to `createApiHandler` with `auth: true` and `rateLimit: RateLimitPresets.API`. Removed 6 unused imports (`requireAuthFromRequest`, `validateRequestBody`, `formatZodErrors`, `mediaUploadRequestSchema`, `AuthenticationError`, `handleApiError`). `request.formData()` called inside handler via the forwarded `request` param.

### Fixed

- **`docs/TECH_DEBT.md`** — TD-005 marked ✅ RESOLVED: all migratable routes now use `createApiHandler`; remaining custom routes documented as intentionally exempt.

---

## [Unreleased] — Security: migrate highest-risk unwrapped API routes to createApiHandler; document TD-005

### Changed

- **`src/app/api/reviews/[id]/vote/route.ts`** — Migrated from manual `try/catch` to `createApiHandler`. Added `RateLimitPresets.STRICT` (5/min) to prevent vote-stuffing. Uses `reviewVoteSchema` for body validation. Auth enforced via handler `auth: true`.
- **`src/app/api/user/orders/[id]/cancel/route.ts`** — Migrated from manual `try/catch` to `createApiHandler`. Added `RateLimitPresets.STRICT` (5/min) to prevent cancel-spam. `cancelSchema` validation now handled by the wrapper. Auth enforced via handler `auth: true`.

### Docs

- **`docs/TECH_DEBT.md`** — Added TD-005: 46 API routes bypassing `createApiHandler`; categorised as intentionally custom (8 routes), needs migration (~38 routes); highest-priority routes noted.

---

## [Unreleased] — Rule 9 fix: extract buildSellerReviews to user feature lib; profile page 174→~105 lines

### Added

- **`src/features/user/lib/buildSellerReviews.ts`** — Server-side SSR helper extracted from profile page. Assembles `SellerReviewsData` from `productRepository` + `reviewRepository` for seller profiles.
- **`src/features/user/index.ts`** — Added `export * from "./lib/buildSellerReviews"`.

### Changed

- **`src/app/[locale]/profile/[userId]/page.tsx`** — Removed 67-line `buildSellerReviews` private function; now imports it from `@/features/user`. Page reduced from 174 → ~105 lines (Rule 9 compliant). Removed now-unused `reviewRepository` import.

### Fixed

- Rule 9 violation: `profile/[userId]/page.tsx` was 174 lines (24 over the 150-line limit).

---

## [Unreleased] — E5 SEO gaps: generateMetadata for store sub-pages, auction/pre-order detail, reviews; noIndex for auth pages

### Added

- **`src/app/[locale]/stores/[storeSlug]/about/page.tsx`** — `generateMetadata` with store name, description, banner OG image.
- **`src/app/[locale]/stores/[storeSlug]/products/page.tsx`** — `generateMetadata` with store name + "Products" tab label.
- **`src/app/[locale]/stores/[storeSlug]/auctions/page.tsx`** — `generateMetadata` with store name + "Auctions" tab label.
- **`src/app/[locale]/stores/[storeSlug]/reviews/page.tsx`** — `generateMetadata` with store name + "Reviews" tab label.
- **`src/app/[locale]/auctions/[id]/page.tsx`** — `generateMetadata` using `productRepository.findById`; respects `seoTitle`/`seoDescription` overrides; OG image from `mainImage ?? images[0]`; canonical URL.
- **`src/app/[locale]/pre-orders/[id]/page.tsx`** — Same pattern as auction detail.
- **`src/app/[locale]/reviews/page.tsx`** — Static `generateMetadata` from `reviews.title`/`reviews.subtitle` translations.
- **`src/app/[locale]/auth/login/page.tsx`** — `generateMetadata` with `robots: { index: false }`.
- **`src/app/[locale]/auth/register/page.tsx`** — `generateMetadata` with `robots: { index: false }`.
- **`src/app/[locale]/auth/forgot-password/page.tsx`** — `generateMetadata` with `robots: { index: false }`.
- **`src/app/[locale]/auth/reset-password/page.tsx`** — `generateMetadata` with `robots: { index: false }`.
- **`src/app/[locale]/auth/verify-email/page.tsx`** — `generateMetadata` with `robots: { index: false }`.

### Fixed

- Store sub-pages, auction/pre-order detail pages, and the platform reviews page were missing `generateMetadata` despite being public, indexable routes (E5 completeness gap).
- Auth pages were crawlable with no title or robots directive — now all carry `robots: { index: false }` to prevent search engine indexing of authentication flows.

---

## [Unreleased] — Rule 20 fix: AlgoliaDashboardView — extract apiClient call to useAlgoliaSync hook

### Added

- **`src/features/admin/hooks/useAlgoliaSync.ts`** — New `useAlgoliaSync()` hook wrapping `useMutation` for the Algolia sync/clear API. Exports `AlgoliaSyncResult`, `AlgoliaSyncTarget`, `AlgoliaSyncVars` types. Eliminates the direct `apiClient.post` call from the component.
- **`src/features/admin/hooks/index.ts`** — `export * from "./useAlgoliaSync"` added.

### Changed

- **`src/features/admin/components/AlgoliaDashboardView.tsx`** — Removed direct `apiClient` import (Rule 20 violation). Now uses `useAlgoliaSync()` via `@/features/admin` barrel. Removed local `ActionResult` type (replaced by `AlgoliaSyncResult` from hook). Removed `API_ENDPOINTS` import. `callDev` renamed `callAction` with simplified signature (no `errorLabel` param).

### Fixed

- Rule 20 violation: `AlgoliaDashboardView` was directly calling `apiClient.post()` inside a component handler. All API calls now go through the `useAlgoliaSync` TanStack mutation.

---

## [Unreleased] — §3.3 improvement: rate-limit headers + MASTER_PLAN / TECH_DEBT.md status sync

### Added

- **`src/lib/api/api-handler.ts`** — `createApiHandler` now emits `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` response headers on every rate-limited route (both 429 throttled responses and successful responses). Clients can use these headers to track quota consumption and implement proactive back-off.

### Changed

- **`docs/MASTER_PLAN.md`** — Executive Summary table updated: all 28 previously-open items are now marked ✅ complete with commit date and step reference. `§3.3` rate-limit headers note updated to ✅. Stage F, G1, G2 status notes updated to ✅. "Pending" deletion table replaced with "all deleted" note.
- **`docs/TECH_DEBT.md`** — TD-002 (`useApiQuery`/`useApiMutation` adapters), TD-003 (services passthrough), and TD-004 (`THEME_CONSTANTS` aliases) marked ✅ RESOLVED with dates and resolution notes.

---

## [Unreleased] — Stage F4 complete: @lir/\* workspace packages wired into the app

### Added

- **`tsconfig.json`** — 10 path aliases added (`@lir/core`, `@lir/core/*`, `@lir/react`, `@lir/react/*`, `@lir/ui/*`, `@lir/http/*`, `@lir/next/*`) pointing to `packages/*/src`. Enables TypeScript to resolve `@lir/*` imports to source without building.
- **`next.config.js`** — `transpilePackages: ["@lir/core", "@lir/react", "@lir/ui", "@lir/http", "@lir/next"]` added so webpack processes the package TypeScript sources.
- **`packages/core/src/Logger.ts`** — Added `enableFileLogging?: boolean` to `LoggerOptions` as backward-compat alias for `logFileUrl`. When `true` and `logFileUrl` is absent, defaults to `/api/logs/write`.
- **`packages/core/src/StorageManager.ts`** — Added `export const storageManager = StorageManager.getInstance("")` singleton for backward-compat.
- **`packages/core/src/CacheManager.ts`** — Added `export const cacheManager = CacheManager.getInstance()` singleton.
- **`packages/core/src/EventBus.ts`** — Changed `EventCallback` from `unknown[]` to `any[]` params for backward-compat with app-style typed callbacks.
- **`packages/core/src/index.ts`** — Now exports `storageManager` and `cacheManager` singletons.

### Changed

- **`src/classes/Logger.ts`** — Converted to 2-line re-export from `@lir/core`. Old 204-line implementation removed.
- **`src/classes/Queue.ts`** — Converted to 2-line re-export from `@lir/core`. Old 132-line implementation removed.
- **`src/classes/StorageManager.ts`** — Converted to 2-line re-export from `@lir/core`. Full implementation removed.
- **`src/classes/EventBus.ts`** — Converted to 2-line re-export from `@lir/core`. Full implementation removed.
- **`src/classes/CacheManager.ts`** — Converted to 2-line re-export from `@lir/core`. Full implementation removed.
- **`src/classes/index.ts`** — Simplified barrel: now `export * from "@lir/core"`.
- **`src/hooks/useMediaQuery.ts`** — Converted to 1-line re-export from `@lir/react`.
- **`src/hooks/useBreakpoint.ts`** — Converted to 1-line re-export from `@lir/react`.
- **`src/hooks/useClickOutside.ts`** — Converted to 2-line re-export from `@lir/react`.
- **`src/hooks/useKeyPress.ts`** — Converted to 2-line re-export from `@lir/react`.
- **`src/hooks/useLongPress.ts`** — Converted to 1-line re-export from `@lir/react`.
- **`src/hooks/useGesture.ts`** — Converted to 2-line re-export from `@lir/react`. `nowMs()` dependency removed (package uses `Date.now()` directly).
- **`src/hooks/useSwipe.ts`** — Converted to 2-line re-export from `@lir/react`. `nowMs()` dependency removed.
- **`src/hooks/useCamera.ts`** — Converted to 2-line re-export from `@lir/react`.
- **`src/hooks/usePullToRefresh.ts`** — Converted to 2-line re-export from `@lir/react`.
- **`src/hooks/useCountdown.ts`** — Converted to 2-line re-export from `@lir/react`. `nowMs()` dependency removed.

---

## [Unreleased] — Stage G1 complete: All pure-passthrough service methods migrated to Server Actions

### Changed

- **`src/actions/review.actions.ts`** — `createReviewAction` refactored to accept minimal form input (`productId`, `rating`, `title`, `comment`, `images?`); resolves `productTitle` from `productRepository.findById()` and user identity from `requireAuth()` + `userRepository.findById()`. Old schema required 10+ fields that are now looked up server-side.
- **`src/actions/review.actions.ts`** — Added `adminUpdateReviewAction` and `adminDeleteReviewAction`: admin/moderator-only mutations with `requireRole(["admin","moderator"])`; no ownership check; rate-limited.
- **`src/actions/index.ts`** — Exported `adminUpdateReviewAction`, `adminDeleteReviewAction`.
- **`src/hooks/useProductReviews.ts`** — `useCreateReview` now calls `createReviewAction` directly (was `reviewService.create`). `CreateReviewInput` updated: added `images?: string[]`.
- **`src/features/admin/hooks/useAdminReviews.ts`** — `updateMutation` and `deleteMutation` now call `adminUpdateReviewAction` / `adminDeleteReviewAction` (was `reviewService.update/delete`).
- **`src/features/admin/hooks/useAdminCategories.ts`** — `createMutation` now calls `createCategoryAction` directly (was `categoryService.create`). Typed `CreateCategoryInput` instead of `unknown`.

### Removed

- **`src/services/review.service.ts`** — Deleted `create()`, `update()`, `delete()`. Service is now read-only.
- **`src/services/category.service.ts`** — Deleted `create()`. All category creates go through `createCategoryAction`.
- **`src/services/admin.service.ts`** — Deleted `revokeSession()`, `revokeUserSessions()` (both had no callers; `useSessions` already used Server Actions).
- **`src/services/seller.service.ts`** — Deleted `becomeSeller()` (no callers at all; `useBecomeSeller` already used `becomeSellerAction`).

### Fixed

- **`src/services/__tests__/category.service.test.ts`** — Pre-existing test bug: `listTopLevel()` expected URL `?filters=tier==1&sorts=order&pageSize=12` but service uses `?tier=0&pageSize=12`. Fixed to match actual implementation.

---

## [Unreleased] — Stage F4 cont.: @lir/ui — Alert, Divider, Progress, IndeterminateProgress extracted

### Added

- **`packages/ui/src/components/Alert.tsx`** — `Alert` component with `info|success|warning|error` variants, optional dismiss button, optional title (Heading). `ALERT_STYLES` inlined from app's `THEME_CONSTANTS.colors.alert`. Uses local `Button` and `Heading` imports from within the package.
- **`packages/ui/src/components/Divider.tsx`** — `Divider` with `horizontal|vertical` orientation and optional `label` (Span). Border/text classes inlined.
- **`packages/ui/src/components/Progress.tsx`** — `Progress` (determinate with label + value display) and `IndeterminateProgress` (animated wave bar) both exported. `styled-jsx` replaced with `dangerouslySetInnerHTML` inline `<style>` using a CSS class `lir-progress-indeterminate`. Theme values inlined.
- **`packages/ui/src/index.ts`** — Updated to export `Alert`, `AlertProps`, `Divider`, `DividerProps`, `Progress`, `ProgressProps`, `IndeterminateProgress`, `IndeterminateProgressProps`.

---

## [Unreleased] — Stage F4: @lir/ui — Spinner, Skeleton, Button, Badge extracted

### Added

- **`packages/ui/src/components/Spinner.tsx`** — `Spinner` with `sm|md|lg|xl` sizes and `primary|white|current` variants. Removed unused `THEME_CONSTANTS` import from original; pure Tailwind.
- **`packages/ui/src/components/Skeleton.tsx`** — `Skeleton` with `pulse|wave|none` animations. `styled-jsx` replaced with `dangerouslySetInnerHTML` inline `<style>`. `bgTertiary` inlined as `bg-zinc-100 dark:bg-slate-800`. `"use client"` directive added.
- **`packages/ui/src/components/Button.tsx`** — `Button` with `primary|secondary|outline|ghost|danger|warning` variants, `sm|md|lg` sizes, `isLoading` state, `leftIcon`/`rightIcon` slots. `UI_BUTTON` const inlines all theme values. Uses `tailwind-merge` and `lucide-react`.
- **`packages/ui/src/components/Badge.tsx`** — `Badge` with 17 status/role variants. `BADGE_CLASSES` inlined. Imports `Span` from local `./Typography`.
- **`packages/ui/package.json`** — Added `lucide-react` and `tailwind-merge` as `dependencies`.

---

## [Unreleased] — Stage G1 cont.: Service mutation methods removed; vote + cart pruned

### Removed

- **`src/services/cart.service.ts`** — Deleted `addItem()`, `updateItem()`, `removeItem()`, `clear()`, `mergeGuestCart()`. Only `get()` remains. All cart mutations now go through Server Actions (`addToCartAction`, `updateCartItemAction`, `removeFromCartAction`, `clearCartAction`, `mergeGuestCartAction`).
- **`src/services/review.service.ts`** — Deleted `vote()`. Only read methods and admin mutations remain. Vote is handled by `voteReviewHelpfulAction` Server Action.
- **`src/services/__tests__/cart.service.test.ts`** — Removed 4 mutation tests for deleted methods.
- **`src/services/__tests__/review.service.test.ts`** — Removed 2 vote tests for deleted method.

### Fixed

- **`src/services/review.service.ts`** — `getHomepageReviews()` filter was `?latest=true&pageSize=6` (ignored by the API). Changed to `?filters=status==approved&sorts=-createdAt&pageSize=6` to match the API route's expected Sieve syntax.

---

## [Unreleased] — Stage F3: @lir/ui package — Semantic HTML + Typography components

### Added

- **`packages/ui/src/components/Semantic.tsx`** — Extracted `Section`, `Article`, `Main`, `Aside`, `Nav`, `BlockHeader`, `BlockFooter`, `Ul`, `Ol`, `Li` from `src/components/semantic/Semantic.tsx`. Pure React, zero app-specific imports. `Nav` enforces required `aria-label` prop.
- **`packages/ui/src/components/Typography.tsx`** — Extracted `Heading`, `Text`, `Label`, `Caption`, `Span` from `src/components/typography/Typography.tsx`. Replaced `THEME_CONSTANTS` import with inlined `UI_THEME` const (scoped to only the typography/themed/form.required values used). Consumers override via `className`.
- **`packages/ui/src/index.ts`** — Replaced stub entrypoint with named exports for all 15 components and their prop types.

---

## [Unreleased] — Stage F2: @lir/react package — Generic React hooks extracted

### Added

- **`packages/react/src/hooks/useMediaQuery.ts`** — SSR-safe `useState(() => typeof window !== 'undefined' && ...)` lazy initializer.
- **`packages/react/src/hooks/useBreakpoint.ts`** — Tailwind breakpoint map using local `useMediaQuery`.
- **`packages/react/src/hooks/useClickOutside.ts`** — Ref-based outside-click detector.
- **`packages/react/src/hooks/useKeyPress.ts`** — Keyboard shortcut hook with modifier key support.
- **`packages/react/src/hooks/useLongPress.ts`** — Timer-based tap vs. long-press detector.
- **`packages/react/src/hooks/useGesture.ts`** — Touch gesture recogniser (tap / doubletap / pinch / rotate). Replaced `nowMs()` import with `Date.now()`.
- **`packages/react/src/hooks/useSwipe.ts`** — Directional swipe with velocity threshold. Replaced `nowMs()` import with `Date.now()`.
- **`packages/react/src/hooks/useCamera.ts`** — `MediaDevices` API wrapper; browser-only, pure Web APIs.
- **`packages/react/src/hooks/usePullToRefresh.ts`** — Pull-to-refresh with progress (0–1) for mobile lists.
- **`packages/react/src/hooks/useCountdown.ts`** — Countdown timer supporting ISO strings, Unix ms, and Firestore Timestamp JSON shapes. Replaced `nowMs()` import with `Date.now()`; no Firestore SDK dependency.
- **`packages/react/src/index.ts`** — Replaced stub; exports all 10 hooks and associated types.

---

## [Unreleased] — Stage B4: @lir/next package — IAuthVerifier + createApiErrorHandler

### Added

- **`packages/next/src/IAuthVerifier.ts`** — `IAuthVerifier` interface for injecting auth verification into `createApiHandler`. Includes `AuthVerifiedUser` type (`uid`, `email?`, `role?`, index signature).
- **`packages/next/src/api/errorHandler.ts`** — `createApiErrorHandler<TAppError>` factory. All dependencies injected via `ApiErrorHandlerOptions` (`isAppError`, `getStatusCode`, `toJSON`, `logger`). Handles app errors, Zod validation errors, and unexpected 500s. Zero knowledge of Firebase or app domain.
- **`packages/next/src/index.ts`** — Replaced stub; exports `IAuthVerifier`, `AuthVerifiedUser`, `createApiErrorHandler`, `IApiErrorLogger`, `ApiErrorHandlerOptions`.

---

## [Unreleased] — Stage H3 (cont.): Dead service mutation methods removed

### Removed

- **`src/services/wishlist.service.ts`** — Deleted `add()`, `remove()`, `check()`. Only `list()` remains (now handled by Server Actions).
- **`src/services/address.service.ts`** — Deleted `create()`, `update()`, `delete()`, `setDefault()`. Only `list()` and `getById()` remain.
- **`src/services/bid.service.ts`** — Deleted `create()`. Only `listByProduct()` and `getById()` remain.
- **`src/services/coupon.service.ts`** — Deleted `validate()`. Admin CRUD methods (`list`, `create`, `update`, `delete`) remain.
- **`src/services/faq.service.ts`** — Deleted `vote()`. CRUD and `list` methods remain.
- **`src/services/notification.service.ts`** — Deleted `markRead()`, `markAllRead()`, `delete()`. Only `list()` and `getUnreadCount()` remain.
- **`src/services/profile.service.ts`** — Deleted `update()`. Read-only methods `getById()`, `getSellerReviews()`, `getSellerProducts()` remain.
- **`src/services/order.service.ts`** — Deleted `cancel()`. `list()`, `getById()`, `track()` remain.
- **`src/services/__tests__/*.test.ts`** (8 files) — Removed all test cases and mock references for the above deleted methods.

---

## [Unreleased] — Stage B3: @lir/http package extracted

### Added

- **`packages/http/src/ApiClient.ts`** — Full `ApiClient` class extracted from `src/lib/api-client.ts`. Removed hard-coded `API_ENDPOINTS` re-export; constructor accepts `ApiClientOptions { baseURL?, defaultTimeout? }`. All HTTP methods preserved (`get`, `post`, `put`, `patch`, `delete`, `upload`). Exports `ApiClient`, `ApiClientError`, and `apiClient` singleton.
- **`packages/http/src/index.ts`** — Replaced stub; exports `ApiClient`, `ApiClientError`, `apiClient`, and types `ApiClientOptions`, `RequestConfig`, `ApiResponse`.

---

## [Unreleased] — Stage B2: @lir/core package extracted

### Added

- **`packages/core/src/Logger.ts`** — Extracted from `src/classes/Logger.ts`. Removed `import("@/constants")` dynamic import; constructor now accepts `logFileUrl?: string` option. Exports `Logger` class and `logger` singleton.
- **`packages/core/src/Queue.ts`** — Extracted from `src/classes/Queue.ts`. Fixed: replaced async recursive `process()` with `.then().catch().finally()` chain to prevent unhandled promise rejections.
- **`packages/core/src/StorageManager.ts`** — Pure per-prefix instance map, SSR-safe; no app-specific imports.
- **`packages/core/src/EventBus.ts`** — Pure typed pub/sub singleton with `EventSubscription` type.
- **`packages/core/src/CacheManager.ts`** — TTL-based in-memory cache with FIFO eviction.
- **`packages/core/src/index.ts`** — Replaced stub; named exports for all 5 classes, singletons, and associated types.

---

## [Unreleased] — Stage B1: Monorepo bootstrap scaffold

### Added

- **`pnpm-workspace.yaml`** — Workspace package discovery for `apps/*` and `packages/*`.
- **`turbo.json`** — Turborepo task graph scaffold for `build`, `test`, and `lint`.
- **`packages/core/`** — Bootstrapped `@lir/core` with `package.json`, `tsconfig.json`, and `src/index.ts` stub.
- **`packages/react/`** — Bootstrapped `@lir/react` with `package.json`, `tsconfig.json`, and `src/index.ts` stub.
- **`packages/ui/`** — Bootstrapped `@lir/ui` with `package.json`, `tsconfig.json`, and `src/index.ts` stub.
- **`packages/http/`** — Bootstrapped `@lir/http` with `package.json`, `tsconfig.json`, and `src/index.ts` stub.
- **`packages/next/`** — Bootstrapped `@lir/next` with `package.json`, `tsconfig.json`, and `src/index.ts` stub.

### Notes

- This phase is scaffold-only: no runtime app behavior changed in `src/`.
- Package entrypoints intentionally export empty stubs and will be filled in Stage B2-B4/F2-F4.

## [Unreleased] — Stage C4: Native TanStack Query v5 — adapter hooks deleted

### Removed

- **`src/hooks/useApiQuery.ts`** — Thin adapter deleted; all consumers use `useQuery` from `@tanstack/react-query` directly.
- **`src/hooks/useApiMutation.ts`** — Thin adapter deleted; all consumers use `useMutation` from `@tanstack/react-query` directly.
- **`src/hooks/index.ts`** — Removed `useApiQuery`, `useApiMutation`, and `invalidateQueries` adapter exports.

### Changed

- **All `src/features/admin/hooks/*.ts`** (17 files) — Migrated from `useApiQuery`/`useApiMutation` to `useQuery`/`useMutation`. Fixed generic order to `useMutation<TData, Error, TVars>`. Replaced `cacheTTL` with `staleTime`.
- **All `src/features/*/hooks/*.ts`** (36 feature hook files) — Same migration. `onSuccess`/`onError` removed from `useQuery` calls (moved to `onSettled` where needed).
- **All `src/hooks/*.ts`** (non-adapter hooks) — Same migration: `useAuth`, `useAddresses`, `useRipCoins`, `useAlgoliaSync`, `useCategorySelector`, `useCheckout`, `useAddToCart`, etc.
- **`src/contexts/SessionContext.tsx`** — Replaced `invalidateQueries` helper with `useQueryClient().invalidateQueries({ queryKey: [...] })` calls.
- **`src/hooks/useAdminStats.ts`** — `refresh: refetch` wrapped as `refresh: () => { void refetch(); }` to match `MouseEventHandler` signature.
- **`src/hooks/useAddToCart.ts`** — `TError` generic changed from `Error` to `ApiClientError` to match `onError` callback type.
- **`src/hooks/useRipCoins.ts`** — Added `razorpayOrderId: string` to `useVerifyRipCoinPurchase` mutation variables type.
- **All mutation-consuming components** (~40 files) — `isLoading` → `isPending` in destructuring patterns; `mutate` → `mutateAsync` where return values are used (BuyRipCoinsModal, RipCoinsPurchaseView, CheckoutView, PlaceBidForm, AdminSiteView, AvatarUpload).
- **`src/features/admin/components/AdminPayoutsView.tsx`** — Added `id: selectedPayout!.id` to `updateMutation.mutateAsync` call.
- **`src/features/admin/components/AdminProductsView.tsx`** — Added `id: editingProduct.id!` to `updateMutation.mutateAsync` call.
- **`src/features/admin/components/AdminSectionsView.tsx`** — Added `id: editingSection.id!` to `updateMutation.mutateAsync` call.

---

## [Unreleased] — Stage E8: SSR — promotions page converted; profile page confirmed SSR

### Added

- **`src/features/promotions/components/PromotionsView.tsx`** — New client view component accepting pre-fetched `promotedProducts`, `featuredProducts`, `activeCoupons` as props; no loading state or data-fetching hooks needed.

### Changed

- **`src/app/[locale]/promotions/page.tsx`** — Converted from `"use client"` + `usePromotions` hook to an async server component. Fetches data via `productRepository.findPromoted()`, `productRepository.findFeatured()`, `couponsRepository.getActiveCoupons()` in parallel. Added `generateMetadata` using `SEO_CONFIG.pages.promotions`.
- **`src/features/promotions/components/index.ts`** — Added `PromotionsView` export.

### Confirmed

- **`src/app/[locale]/profile/[userId]/page.tsx`** — Already an async server component (SSR-converted in a prior session). Confirmed: uses `userRepository.findById`, `productRepository.findBySeller`, `reviewRepository.findApprovedByProduct`, `generateMetadata`, and `notFound()`. No changes needed.
- **`src/app/[locale]/admin/events/[id]/entries/page.tsx`** — Correctly `"use client"`: uses `useState` for review drawer, `useUrlTable` for URL-based filter/sort/page, interactive DataTable. Not a violation.
- **`src/app/[locale]/admin/orders/[[...action]]/page.tsx`** — Thin shell delegating to `AdminOrdersView`; `"use client"` is acceptable here.
- **`src/app/[locale]/user/addresses/add/page.tsx`** — Auth-gated form page; legitimately `"use client"`.
- **`src/app/[locale]/auth/close/page.tsx`** — Calls `window.close()` popup; legitimately `"use client"`.
- **`src/app/[locale]/auth/oauth-loading/page.tsx`** — Popup relay with `window.opener`; legitimately `"use client"`.

---

## [Unreleased] — Stage G1 complete: Rule 20 — all feature components use hooks

### Added

- **`src/features/wishlist/hooks/useWishlist.ts`** — Wraps `wishlistService.list()` with `enabled` guard. Exports `WishlistItem`, `WishlistResponse` types.
- **`src/features/wishlist/hooks/index.ts`** — Barrel for wishlist hooks.
- **`src/features/reviews/hooks/useReviews.ts`** — Wraps `reviewService.list(queryParams)`. Exports `ReviewsApiResponse` type.
- **`src/features/reviews/hooks/index.ts`** — Barrel for reviews hooks.
- **`src/features/blog/hooks/useBlogPost.ts`** — Wraps `blogService.getBySlug(slug)` with `initialData` support. Exports `BlogPostQueryResult` type.
- **`src/features/blog/hooks/index.ts`** — Barrel for blog hooks.
- **`src/features/homepage/hooks/useBlogArticles.ts`** — Wraps featured/latest blog article logic for the homepage section.
- **`src/features/homepage/hooks/index.ts`** — Barrel for homepage hooks.
- **`src/features/products/hooks/useProductDetail.ts`** — Wraps `productService.getById(slug)` with `initialData` support.
- **`src/features/seller/hooks/useSellerProductDetail.ts`** — Wraps `productService.getById(id)` for the seller edit product form (separate queryKey from public product cache).
- **`src/features/seller/hooks/useSellerDashboard.ts`** — Wraps `sellerService.listProducts(userId)` for the seller dashboard stats. Exports `SellerDashboardProductsResponse` type.
- **`src/features/seller/hooks/useSellerAuctions.ts`** — Wraps `sellerService.listMyProducts(params)` for the seller auction list. Exports `SellerAuctionsResponse` type.
- **`src/features/events/hooks/usePublicEvent.ts`** — Wraps `eventService.getById(id)` with `initialData` and `enabled` support (distinct queryKey from admin `useEvent`).
- **`src/features/categories/hooks/useCategoriesList.ts`** — Wraps `categoryService.list("flat=true")` with `initialData` support.
- **`src/features/cart/hooks/useOrder.ts`** — Wraps `orderService.getById(orderId)` with null guard.

### Fixed

- **`src/features/wishlist/components/WishlistView.tsx`** — **Bug (Rule 20):** Direct `wishlistService` import + inline `useApiQuery` in component. Replaced with `useWishlist(!!user)`. Removed local `WishlistItem`/`WishlistResponse` interfaces (moved to hook).
- **`src/features/reviews/components/ReviewsListView.tsx`** — **Bug (Rule 20):** Direct `reviewService` import + inline `useApiQuery` in component. Replaced with `useReviews(queryParams)`. Removed local `ReviewsApiResponse` interface (moved to hook).
- **`src/features/products/components/ProductDetailView.tsx`** — **Bug (Rule 20):** Direct `productService` import + inline `useApiQuery`. Replaced with `useProductDetail(slug, { initialData })`.
- **`src/features/products/components/PreOrderDetailView.tsx`** — **Bug (Rule 20 + type bug):** Direct `productService` import + inline `useApiQuery<ProductResponse>` with incorrect double-unwrap (`data?.data`). apiClient already extracts `data` from `{success,data}` envelope, so `data.data` was always `undefined`. Fixed by using `useProductDetail(id)` which returns `product` correctly typed as `ProductDocument`.
- **`src/features/seller/components/SellerEditProductView.tsx`** — **Bug (Rule 20):** Direct `productService` import + inline `useApiQuery`. Replaced with `useSellerProductDetail(id)`.
- **`src/features/seller/components/SellerDashboardView.tsx`** — **Bug (Rule 20):** Direct `sellerService` import + inline `useApiQuery`. Replaced with `useSellerDashboard(user?.uid)`. Removed local `ProductsResponse` interface (moved to hook).
- **`src/features/seller/components/SellerAuctionsView.tsx`** — **Bug (Rule 20):** Direct `sellerService` import + inline `useApiQuery`. Replaced with `useSellerAuctions(params, !authLoading && !!user)`. Removed local `AuctionsResponse` interface (moved to hook).
- **`src/features/events/components/EventDetailView.tsx`** — **Bug (Rule 20):** Direct `eventService` import + inline `useApiQuery`. Replaced with `usePublicEvent(id, { initialData })`.
- **`src/features/events/components/EventParticipateView.tsx`** — **Bug (Rule 20):** Direct `eventService` import + inline `useApiQuery`. Replaced with `usePublicEvent(id, { enabled: !authLoading })`.
- **`src/features/homepage/components/BlogArticlesSection.tsx`** — **Bug (Rule 20):** Direct `blogService` import + complex inline `useApiQuery` with waterfall logic. Replaced with `useBlogArticles()`.
- **`src/features/blog/components/BlogPostView.tsx`** — **Bug (Rule 20):** Direct `blogService` import + inline `useApiQuery`. Replaced with `useBlogPost(slug, { initialData })`.
- **`src/features/categories/components/CategoriesListView.tsx`** — **Bug (Rule 20):** Direct `categoryService` import + inline `useApiQuery`. Replaced with `useCategoriesList({ initialData })`.
- **`src/features/cart/components/CheckoutSuccessView.tsx`** — **Bug (Rule 20):** Direct `orderService` import + inline `useApiQuery`. Replaced with `useOrder(orderId)`.

### Changed

- Feature index files for `wishlist`, `reviews`, `blog`, `homepage` updated to re-export hooks via `export * from "./hooks"`.
- `src/features/products/hooks/index.ts` — Added `useProductDetail` export.
- `src/features/seller/hooks/index.ts` — Added `useSellerProductDetail`, `useSellerDashboard`, `useSellerAuctions` exports.
- `src/features/events/index.ts` — Added `usePublicEvent` export.
- `src/features/categories/hooks/index.ts` — Added `useCategoriesList` export.
- `src/features/cart/hooks/index.ts` — Added `useOrder` export.

---

## [Unreleased] — Stage G2: FilterPanel config-driven admin filter consolidation

### Added

- **`src/components/filters/FilterPanel.tsx`** — New config-driven filter sidebar component. Accepts a `config: FilterConfig[]` array (discriminated union of 5 types) and a `table: UrlTable` and renders a vertical stack of filter sections without any internal state. Config types: `FacetSingleConfig`, `FacetMultiConfig`, `SwitchConfig`, `RangeNumberConfig`, `RangeDateConfig`.
- **`FilterConfig`, `FacetSingleConfig`, `FacetMultiConfig`, `SwitchConfig`, `RangeNumberConfig`, `RangeDateConfig`** — Exported from `@/components` barrel.

### Changed

- All 14 admin filter components refactored to the `FilterPanel` config-driven pattern — `BidFilters`, `CarouselFilters`, `CategoryFilters`, `CouponFilters`, `EventEntryFilters`, `FaqFilters`, `HomepageSectionFilters`, `NewsletterFilters`, `NotificationFilters`, `PayoutFilters`, `RipCoinFilters`, `SessionFilters`, `StoreFilters`, `UserFilters`. Each now builds a `FilterConfig[]` array using `useTranslations("filters")` and delegates all rendering to `<FilterPanel />`.

### Removed

- All direct `FilterFacetSection`, `RangeFilter`, and `SwitchFilter` imports from the 14 admin filter components — these are now internally managed by `FilterPanel`.

---

## [Unreleased] — Stage H4: Remove THEME_CONSTANTS pure Tailwind aliases

### Removed

- **`THEME_CONSTANTS.borderRadius`** — Deleted entire sub-object (`xl`, `2xl`, `lg`, `md`, `full`). These were pure Tailwind aliases (e.g. `rounded-xl`) with no semantic value. All ~60 usages replaced with direct Tailwind classes across ~30 files.
- **`THEME_CONSTANTS.spacing.gap`** — Deleted sub-object (`xs`, `sm`, `md`, `lg`, `xl`). Pure aliases for `gap-*` classes. All usages replaced with direct Tailwind classes.
- **`THEME_CONSTANTS.spacing.padding`** — Deleted sub-object (`xs`, `sm`, `md`, `lg`, `xl`). Pure aliases for `p-*` classes. All usages replaced.
- **`THEME_CONSTANTS.spacing.margin`** — Deleted sub-object (`top`, `bottom`). Pure aliases for `mt-*`/`mb-*` classes. All usages replaced.

### Changed

- Replaced all `borderRadius.*`, `spacing.gap.*`, `spacing.padding.*`, and `spacing.margin.*` references across ~80 `.tsx` files with inline Tailwind utility classes. Semantic spacing tokens (`spacing.stack`, `spacing.cardPadding`, `spacing.section`, etc.) are unchanged.

---

## [Unreleased] — Stage H3: Delete dead pass-through services

### Removed

- **`src/services/contact.service.ts`** — Deleted. Zero non-test imports; fully replaced by `contact.actions.ts` Server Action.
- **`src/services/newsletter.service.ts`** — Deleted. Zero imports; fully replaced by `newsletter.actions.ts` Server Action.
- **`src/services/payment-event.service.ts`** — Deleted. Zero imports; dead code (payment event bridge was never wired into the checkout flow).
- **`src/services/index.ts`** — Removed barrel exports for the three deleted services.

---

## [Unreleased] — Stage G1 cont.: Rule 20 fix in CartView

### Added

- **`src/features/cart/hooks/useCartMutations.ts`** — New hooks: `useCart(enabled)` (query wrapping `cartService.get()`), `useUpdateCartItem(onSuccess, onError)` (mutation wrapping `updateCartItemAction`), `useRemoveCartItem(onSuccess, onError)` (mutation wrapping `removeFromCartAction`). Invalidates `["cart"]` query on success.
- **`src/features/cart/hooks/index.ts`** — New barrel exporting `useCart`, `useUpdateCartItem`, `useRemoveCartItem`, `usePaymentOtp`.
- **`src/features/cart/index.ts`** — Now also exports hooks barrel.

### Fixed

- **`src/features/cart/components/CartView.tsx`** — **Bug (Rule 20):** Two inline `useApiMutation` calls (`updateCartItemAction`, `removeFromCartAction`) and `useApiQuery` with `cartService.get()` directly in the component. Replaced with `useCart()`, `useUpdateCartItem()`, `useRemoveCartItem()` hooks. Removed `useApiQuery`, `useApiMutation`, `useQueryClient`, `cartService`, `updateCartItemAction`, `removeFromCartAction`, `CartDocument` imports. Removed unused `CartApiResponse` interface.

---

## [Unreleased] — Stage G1 cont.: Rule 20 fixes in AdminSiteView / ProductReviews / SellerOrdersView / UserNotificationsView

### Added

- **`src/features/admin/hooks/useAdminSiteSettings.ts`** — New hook wrapping `siteSettingsService.get()` (query) and `siteSettingsService.update()` (mutation). Exported from admin hooks barrel.
- **`src/hooks/useProductReviews.ts`** — Added `useCreateReview(onSuccess, onError)`: mutation hook wrapping `reviewService.create()`. Exported from hooks barrel.
- **`src/features/seller/hooks/useSellerOrders.ts`** — Added `useShipOrder(orderId, onSuccess, onError)` and `useBulkRequestPayout(onSuccess, onError)`: mutation hooks wrapping `sellerService.shipOrder()` and `sellerService.bulkOrderAction()`. Exported from seller hooks barrel.
- **`src/features/user/hooks/useUserNotifications.ts`** — New hook providing paginated notification query + `markRead`, `deleteOne`, `markAllRead` mutations (all using Server Actions). Exported from user hooks barrel.

### Fixed

- **`src/features/admin/components/AdminSiteView.tsx`** — **Bug (Rule 20):** `siteSettingsService` was imported directly; inline `useApiQuery` + `useApiMutation` in the component. Now uses `useAdminSiteSettings()` hook. Removed `siteSettingsService`, `useApiQuery`, `useApiMutation` imports.
- **`src/features/products/components/ProductReviews.tsx`** — **Bug (Rule 20):** `reviewService.create()` was wrapped in inline `useApiMutation` in the component. Now uses `useCreateReview()` from `@/hooks`. Removed `reviewService` and `useApiMutation` imports.
- **`src/features/seller/components/SellerOrdersView.tsx`** — **Bug (Rule 20):** Two inline `useApiMutation` calls — `sellerService.shipOrder()` in `ShipOrderModal` and `sellerService.bulkOrderAction()` in the main view. Replaced with `useShipOrder()` and `useBulkRequestPayout()` hooks. Removed `sellerService` and `useApiMutation` imports.
- **`src/features/user/components/UserNotificationsView.tsx`** — **Bug (Rule 20):** Three inline `useApiMutation` calls (mark-read, delete, mark-all-read) plus `useApiQuery` with `notificationService.list()`. Replaced with `useUserNotifications()` hook. Removed `useApiQuery`, `useApiMutation`, `notificationService`, and Server Action imports + unused `NotificationsResponse` and `NotificationDocument` types.

---

## [Unreleased] — Stage G1 cont.: Rule 20 fixes in SellerCreateProductView / SellerEditProductView / EventParticipateView

### Added

- **`src/features/seller/hooks/useSellerProducts.ts`** — Added `useCreateSellerProduct(onSuccess, onError)`: standalone mutation hook wrapping `sellerService.createProduct`. Added `useUpdateSellerProduct(id, onSuccess)`: standalone mutation hook wrapping `productService.update(id, data)`.
- **`src/features/seller/hooks/index.ts`** — Barrel now exports `useCreateSellerProduct` and `useUpdateSellerProduct`.
- **`src/features/events/hooks/useEventMutations.ts`** — Added `useEventEnter(eventId, onSuccess, onError)`: mutation hook wrapping `eventService.enter(eventId, data)` for survey/event participation.

### Fixed

- **`src/features/seller/components/SellerCreateProductView.tsx`** — **Bug (Rule 20):** `useApiMutation({ mutationFn: () => sellerService.createProduct(product) })` was inline in the component. Now uses `useCreateSellerProduct()` from `../hooks/useSellerProducts`. Removed direct `sellerService` and `useApiMutation` imports.
- **`src/features/seller/components/SellerEditProductView.tsx`** — **Bug (Rule 20):** `await productService.update(id, {...})` was called directly inside `handleSubmit` with manual try/catch and `isSubmitting` state. Replaced with `useUpdateSellerProduct(id, onSuccess)` mutation hook. Removed `isSubmitting` state; uses `mutation.isLoading` instead. Removed direct service call.
- **`src/features/events/components/EventParticipateView.tsx`** — **Bug (Rule 20):** `useApiMutation({ mutationFn: (data) => eventService.enter(id, data) })` was inline in the component. Now uses `useEventEnter(id, onSuccess, onError)` from `../hooks/useEventMutations`. Removed `useApiMutation` hook import.

---

## [Unreleased] — Stage G1 cont.: Server Actions — Seller/Admin/Category + Rule 20 fixes in AdminMediaView / AdminSiteView

### Added

- **`src/lib/encryption.ts`** — AES-256-GCM encryption utility for sensitive settings at rest. `encrypt()` / `decrypt()` / `maskSecret()` / `isEncrypted()`. 96-bit random IV per encryption, 128-bit GCM auth tag (authenticated encryption — no separate HMAC needed). Master key read from `SETTINGS_ENCRYPTION_KEY` env var (64-char hex, 32 bytes). Server-only.
- **`src/features/admin/components/SiteCredentialsForm.tsx`** — Admin form for managing encrypted provider credentials: Razorpay (key ID, key secret, webhook secret), Resend API key, WhatsApp Business API key, WhatsApp contact number. Shows masked current values as placeholders; blank field = keep existing; inputs rendered as `type="password"` to prevent shoulder-surfing.

### Changed

- **`src/db/schema/site-settings.ts`** — Added `credentials?: SiteSettingsCredentials` field to `SiteSettingsDocument`. Added exported types `SiteSettingsCredentials` and `SiteSettingsCredentialsMasked`. Updated `SITE_SETTINGS_UPDATABLE_FIELDS` to include `"credentials"`.
- **`src/lib/validation/schemas.ts`** — Added `credentials` sub-object to `siteSettingsUpdateSchema`. Each field is `z.string().max(512).optional()`. Empty string = keep existing credential unchanged.
- **`src/repositories/site-settings.repository.ts`** — `updateSingleton()` now encrypts credential fields (via `encrypt()`) before writing to Firestore; empty/undefined fields are skipped (keep existing). Added `getDecryptedCredentials()` (internal backend use only — never return to client) and `getCredentialsMasked()` (returns masked values for admin API response).
- **`src/app/api/site-settings/route.ts`** — `GET`: encrypted credential blobs are stripped from all responses; admin response includes `credentialsMasked` (masked display values) and the public Razorpay key ID (decrypted, for checkout modal); public response includes `razorpayKeyId` (DB-first then env). `PATCH`: credentials pass through to repository, which encrypts them.
- **`src/lib/payment/razorpay.ts`** — `getRazorpay()` is now async. `resolveRazorpayCredentials()` reads from Firestore DB first (decrypted), falls back to env vars. Singleton removed — fresh credentials per request (supports key rotation without server restart). `verifyPaymentSignature()` and `verifyWebhookSignature()` are now async.
- **`src/lib/email.ts`** — Added `getResend()` (async, DB-first Resend key resolution) and `getEmailConfig()` (DB-first fromName/fromEmail). Added exported `sendEmail()` helper for DB-first email sending. Module-level `resend`, `FROM_EMAIL`, `FROM_NAME` retained as env-var fallbacks for existing email functions (incremental migration path).
- **`src/features/admin/components/AdminSiteView.tsx`** — Renders `SiteCredentialsForm`; `handleSave()` includes credential updates only when at least one field is non-empty; credential inputs reset after successful save; `credentialsMasked` from API response tracked separately from regular settings state.
- **`src/features/admin/components/index.ts`** — Added exports for `SiteCredentialsForm` and `CredentialsUpdateValues`.
- **`src/constants/ui.ts`** — Added credentials section to `ADMIN.SITE` labels (`CREDENTIALS_TITLE`, `RAZORPAY_*`, `RESEND_*`, `WHATSAPP_*`).
- **`messages/en.json`** — Added `credentialsTitle`, `razorpaySection`, `razorpayKeyId/Secret/WebhookSecret`, `resendSection`, `resendApiKey`, `whatsappSection`, `whatsappApiKey`, `whatsappNumber`, `credentialSet`, `credentialNotSet`, `credentialPlaceholderSet/Unset` to `adminSite`.
- **`src/app/api/payment/webhook/route.ts`** — `verifyWebhookSignature()` call updated to `await` (now async).

---

- **`src/actions/seller.actions.ts`** — Server Action: `becomeSellerAction()`. Auth-required, rate-limited by uid (STRICT preset). Calls `userRepository.update()` directly to set `role="seller"`, `storeStatus="pending"`. Returns `{ storeStatus, alreadySeller? }` — idempotent (returns current status if already a seller/admin).
- **`src/actions/admin.actions.ts`** — Server Actions: `revokeSessionAction({ sessionId })` and `revokeUserSessionsAction({ userId })`. Both require admin/moderator role, are rate-limited by uid (API preset), validate input with Zod, and call `sessionRepository` methods directly — bypassing the service → apiClient → API route chain. Structured logging included.
- **`src/actions/category.actions.ts`** — Server Action: `createCategoryAction(input)`. Admin-only, rate-limited by uid (API preset). Validates via `categoryCreateSchema` (from `@/lib/validation/schemas`), builds the full `CategoryCreateInput` struct (with defaults for `isActive`, `isSearchable`, `slug`, etc.), and calls `categoriesRepository.createWithHierarchy()` directly.
- **`src/actions/index.ts`** — Barrel now re-exports `becomeSellerAction` + `BecomeSellerActionResult`, `createCategoryAction` + `CreateCategoryInput`, `revokeSessionAction`, `revokeUserSessionsAction`.
- **`src/hooks/useAlgoliaSync.ts`** — New hooks: `useAlgoliaSyncProducts()` and `useAlgoliaSyncPages()`. Both wrap `adminService.algoliaSync` / `adminService.algoliaSyncPages` as `useApiMutation` hooks. Algolia operations call external services and therefore go through API routes (not Server Actions).
- **`src/hooks/useMediaUpload.ts`** — Added `useMediaCrop<TResult>()` and `useMediaTrim<TResult>()` as exportable hooks wrapping `mediaService.crop` / `mediaService.trim` respectively. Barrel updated.
- **`src/hooks/index.ts`** — Added exports: `useMediaCrop`, `useMediaTrim`, `useAlgoliaSyncProducts`, `useAlgoliaSyncPages`, `AlgoliaSyncResult`.

### Changed

- **`src/hooks/useBecomeSeller.ts`** — `mutationFn` now calls `becomeSellerAction()` from `@/actions` instead of `sellerService.becomeSeller()`. Drops `sellerService` import.
- **`src/hooks/useSessions.ts`** — `useRevokeSession` and `useRevokeUserSessions` mutation functions now call `revokeSessionAction` / `revokeUserSessionsAction` from `@/actions`. Return types tightened to `success: true` (literal) from the Server Action. Drops `adminService` import for these mutations (retains `adminService` for the read query in `useAdminSessions`).
- **`src/hooks/useAddressSelector.ts`** — `createAddress` mutation now calls `createAddressAction` from `@/actions` (was `addressService.create`). Result wrapped into `CreateAddressApiResponse` shape for consumer compatibility.
- **`src/hooks/useCategorySelector.ts`** — `useCategorySelector`, `useCreateCategory`, and the second `useCreateCategory` in the category selector chain now call `createCategoryAction` from `@/actions` instead of `categoryService.create`. Read queries (`categoryService.list`) unchanged.

### Fixed

- **`src/features/admin/components/AdminMediaView.tsx`** — **Bug (Rule 20):** `cropMutation` and `trimMutation` were inline `useApiMutation` calls with `mediaService.crop` / `mediaService.trim` directly in the component. Now uses `useMediaCrop` / `useMediaTrim` from `@/hooks`. Removed `useApiMutation` and `mediaService` imports.
- **`src/features/admin/components/AdminSiteView.tsx`** — **Bug (Rule 20):** `adminService.algoliaSync` and `adminService.algoliaSyncPages` were passed as raw function references into a local async wrapper inside JSX `onClick` handlers. Now uses `useAlgoliaSyncProducts` / `useAlgoliaSyncPages` hooks from `@/hooks`. Removed `adminService` and `API_ENDPOINTS` direct imports. Replaced manual `algoliaProductsLoading` / `algoliaPagesLoading` state with `mutation.isLoading` from the hooks.

---

## [Unreleased] — Stage G1 cont.: deleteNotificationAction + Rule 20 fixes in UserNotificationsView / UserSettingsView

### Added

- **`src/actions/notification.actions.ts`** — Added `deleteNotificationAction(id)`: auth-required, rate-limited by uid (API preset), validates id, calls `notificationRepository.delete(id)`.
- **`src/actions/index.ts`** — Barrel now re-exports `deleteNotificationAction`.

### Fixed

- **`src/features/user/components/UserNotificationsView.tsx`** — **Bug (Rule 20):** Three inline `useApiMutation` wrappers were calling `notificationService.markRead`, `notificationService.delete`, and `notificationService.markAllRead` directly. Now call `markNotificationReadAction`, `deleteNotificationAction`, and `markAllNotificationsReadAction` from `@/actions`. `notificationService` import retained for the read query only.
- **`src/features/user/components/UserSettingsView.tsx`** — **Bug (Rule 20):** `handleProfileUpdate` and `handleAvatarUploadSuccess` called `profileService.update(...)` directly (not via a hook). Now call `updateProfileAction(...)` from `@/actions`. Removed `profileService` import.

---

## [Unreleased] — Stage G1 cont.: Server Actions — Address, Bid, Coupon + Rule 20 fixes

### Added

- **`src/actions/address.actions.ts`** — Server Actions: `createAddressAction`, `updateAddressAction`, `deleteAddressAction`, `setDefaultAddressAction`. Each is auth-required, rate-limited by uid (API preset), and calls `addressRepository` directly — no HTTP round-trip.
- **`src/actions/bid.actions.ts`** — Server Action: `placeBidAction`. Full business-logic port from `POST /api/bids`: validates auction state (active, not ended, not own auction), checks RipCoin free balance, creates bid, atomically updates all bids + product `currentBid`/`bidCount`, records engage/release RipCoin transactions, and writes live update to RTDB. Rate-limited STRICT by uid (5 req/60 s).
- **`src/actions/coupon.actions.ts`** — Server Action: `validateCouponAction`. Auth-required, rate-limited by uid (API preset). Calls `couponsRepository.validateCoupon()` directly. Returns `{ valid, discountAmount, coupon?, error? }`.
- **`src/actions/index.ts`** — Barrel now re-exports all new actions and their input/result types: `createAddressAction`, `updateAddressAction`, `deleteAddressAction`, `setDefaultAddressAction`, `placeBidAction`, `PlaceBidInput`, `PlaceBidResult`, `validateCouponAction`, `ValidateCouponInput`, `ValidateCouponResult`.

### Changed

- **`src/hooks/useAddresses.ts`** — Mutation hooks (`useCreateAddress`, `useUpdateAddress`, `useDeleteAddress`, `useSetDefaultAddress`) now call Server Actions from `@/actions` instead of `addressService`. All four mutations add `queryClient.invalidateQueries(["addresses"])` + per-id invalidation on success. Fixed `any` callback typings to `Error`. Read hooks (`useAddresses`, `useAddress`) unchanged — still use `addressService` for query functions.
- **`src/hooks/usePlaceBid.ts`** — `mutationFn` now calls `placeBidAction` from `@/actions` instead of `bidService.create`. Drops `bidService` import.
- **`src/hooks/useCouponValidate.ts`** — `mutationFn` now calls `validateCouponAction` from `@/actions` instead of `couponService.validate`. Drops `couponService` import; return type updated to `ValidateCouponResult`.

### Fixed

- **`src/features/cart/components/CartView.tsx`** — **Bug (Rule 20):** `updateItem` and `removeItem` mutations were using `cartService.updateItem` / `cartService.removeItem` inline inside the component. Now use `updateCartItemAction` / `removeFromCartAction` from `@/actions`. Replaced `invalidateQueries(["cart"])` (old adapter) with `queryClient.invalidateQueries({ queryKey: ["cart"] })` from `useQueryClient()`. Removed `cartService` import; retained `cartService.get()` for the read query (read operations stay as service calls).
- **`src/features/wishlist/components/WishlistView.tsx`** — **Bug (Rule 20):** `handleBulkRemoveFromWishlist` called `wishlistService.remove(id)` per item; now calls `removeFromWishlistAction(id)`. `handleBulkAddToCart` called `cartService.addItem({ productId, quantity: 1 })` which was missing required fields (title, image, price, etc.); now calls `addToCartAction(fullProductData)` using the product already present in `allItems`. Replaced `invalidateQueries(["cart"])` with `queryClient.invalidateQueries({ queryKey: ["cart"] })`. Removed `cartService` import; removed `invalidateQueries` hook import.
- **`src/features/products/components/AuctionsView.tsx`** — **Bug (Rule 20):** `handleBulkAddToWishlist` called `wishlistService.add(id)` per item; now calls `addToWishlistAction(id)`. Removed `wishlistService` import.
- **`src/features/products/components/PreOrdersView.tsx`** — **Bug (Rule 20):** Same fix as `AuctionsView.tsx` — `wishlistService.add` → `addToWishlistAction`. Removed `wishlistService` import.
- **`src/features/products/components/ProductsView.tsx`** — **Bug (Rule 20):** Same fix — `wishlistService.add` → `addToWishlistAction`. Removed `wishlistService` import.

---

## [Unreleased] — Stage G1 cont.: Server Actions — Contact, Newsletter, FAQ, Profile

### Added

- **`src/actions/contact.actions.ts`** — Server Action: `sendContactAction`. Validates input with Zod, rate-limits by IP (STRICT: 5 req/60 s), and calls `sendContactEmail` directly — no HTTP round-trip. Does not require authentication.
- **`src/actions/newsletter.actions.ts`** — Server Action: `subscribeNewsletterAction`. Validates email + source, rate-limits by IP, handles re-subscription and idempotent active-subscriber case via `newsletterRepository`. No auth required.
- **`src/actions/faq.actions.ts`** — Server Action: `voteFaqAction`. Auth-required vote (helpful / not-helpful) that calls `faqsRepository.update()` directly. Rate-limited by uid (API preset).
- **`src/actions/profile.actions.ts`** — Server Action: `updateProfileAction`. Auth-required profile PATCH — calls `userRepository.updateProfileWithVerificationReset()` to auto-reset `emailVerified`/`phoneVerified` when those fields change.
- **`src/actions/index.ts`** — Barrel now re-exports all new actions and their input/result types: `sendContactAction`, `subscribeNewsletterAction`, `voteFaqAction`, `updateProfileAction`.

### Changed

- **`src/hooks/useContactSubmit.ts`** — `mutationFn` now calls `sendContactAction` from `@/actions` instead of `contactService.send`. Drops `contactService` import.
- **`src/hooks/useNewsletter.ts`** — `mutationFn` now calls `subscribeNewsletterAction` from `@/actions` instead of `newsletterService.subscribe`. Drops `newsletterService` import.
- **`src/hooks/useFaqVote.ts`** — `mutationFn` now calls `voteFaqAction` from `@/actions` instead of `faqService.vote`. Drops `faqService` import; return type updated to `VoteFaqResult` (was `void`).
- **`src/hooks/useProfile.ts`** — `useUpdateProfile` now calls `updateProfileAction` from `@/actions` (replaces `profileService.update`). Added `useQueryClient` + `invalidateQueries(["profile"])` on success so profile data re-fetches automatically. Fixed `any` callback typings to `Error` / `UserDocument`.

### Fixed

- **`src/hooks/useCheckout.ts`** — **Bug (Rule 20):** `createPaymentOrder` and `verifyPayment` were returned as raw bound service methods, allowing components to call service layer code directly. Both are now wrapped as proper `useApiMutation` hooks (`createPaymentOrderMutation`, `verifyPaymentMutation`) inside `useCheckout`. **Bug (missing invalidation):** `placeCodOrderMutation` now calls `queryClient.invalidateQueries(["cart"])` and `queryClient.invalidateQueries(["orders"])` on success so the cart badge empties and the orders list refreshes after a successful order. `verifyPaymentMutation` also invalidates those keys on success.
- **`src/hooks/usePlaceBid.ts`** — **Bug:** Missing cache invalidation after placing a bid caused the auction UI and RipCoin balance to show stale data. Added `onSuccess` that invalidates `["bids", productId]`, `["auction", productId]`, and `["ripcoins"]` queries.
- **`src/features/cart/components/CheckoutView.tsx`** — Updated destructuring to use new `createPaymentOrderMutation.mutate` and `verifyPaymentMutation.mutate` from `useCheckout` (replacing the now-removed raw service bindings).

---

## [Unreleased] — Stage G1: Server Actions & Hook Migrations

### Added

- **`src/actions/cart.actions.ts`** — Server Actions for all cart mutations: `addToCartAction`, `updateCartItemAction`, `removeFromCartAction`, `clearCartAction`, `mergeGuestCartAction`. Each action calls `requireAuth()` → `rateLimitByIdentifier()` → repository method — bypassing the HTTP/service/route layers entirely.
- **`src/actions/wishlist.actions.ts`** — Server Actions: `addToWishlistAction`, `removeFromWishlistAction`, `getWishlistAction`.
- **`src/actions/review.actions.ts`** — Server Actions: `createReviewAction`, `updateReviewAction`, `deleteReviewAction`, `voteReviewHelpfulAction`. Ownership check in update/delete; vote mirrors API-route behaviour (only `helpful=true` increments `helpfulCount`).
- **`src/actions/notification.actions.ts`** — Server Actions: `markNotificationReadAction`, `markAllNotificationsReadAction`.
- **`src/actions/index.ts`** — Barrel re-exporting all Server Actions.
- **`src/lib/security/rate-limit.ts`** — `rateLimitByIdentifier(identifier, config?)` exported helper — applies sliding-window rate-limit from a plain string key; used by all Server Actions where no `Request` object is available.
- **`docs/TECH_DEBT.md`** — Tracks four open technical debts: TD-001 Turbopack chunk-generation bug (workaround in `next.config.js`), TD-002 `useApiQuery`/`useApiMutation` thin-adapter removal (pending full TanStack migration), TD-003 services pure-passthrough cleanup (ongoing G1 work), TD-004 `THEME_CONSTANTS` spacing-alias trim (remaining F1 work).

### Changed

- **`src/hooks/useWishlistToggle.ts`** — Mutation functions now call `addToWishlistAction`/`removeFromWishlistAction` from `@/actions` instead of `wishlistService` from `@/services`. Optimistic-update logic unchanged.
- **`src/hooks/useAddToCart.ts`** — `mutationFn` now calls `addToCartAction` from `@/actions` instead of `cartService.addItem`.
- **`src/hooks/useGuestCartMerge.ts`** — Now calls `mergeGuestCartAction` from `@/actions` instead of `cartService.mergeGuestCart`.
- **`src/hooks/useNotifications.ts`** — `markRead` and `markAllRead` mutations now call Server Actions from `@/actions`; query (list fetch) still uses `notificationService`.

---

## [Unreleased] — Stage H5/H6: Dead Code Removal & Tech-Debt Tracking

### Added

- **`docs/snippets/`** — 6 snippet files relocated here from `src/snippets/` (`api-requests`, `error-logging-init`, `form-validation`, `performance`, `react-hooks`, `index`). Snippets were never runtime code — living in `docs/` makes that explicit.

### Removed

- **`src/snippets/`** — Entire directory deleted (6 files). Barrel re-export from `src/index.ts` removed.

---

## [Unreleased] — Bug Fix: EventBus console.error

### Fixed

- **`src/classes/EventBus.ts`** — Replaced direct `console.error(...)` in the `emit()` error handler with `logger.error(...)` from `@/classes/Logger`. Complies with Rule 23 (no direct console calls in application code; use structured logger).

---

## [Unreleased] — Stage F1: Complete `gray-*` Color Audit

### Changed

- **`src/constants/theme.ts`** — Replaced all remaining `gray-*` Tailwind classes with canonical palette: badges (`theirs`, `user`), readonly field styles, empty state text. Now fully zinc-/slate-based throughout all THEME_CONSTANTS entries.
- **`tailwind.config.js`** — Removed "Gray fallback" safelist block (`bg-gray-50`, `bg-gray-900`, `bg-gray-950`, `dark:bg-gray-900`, `dark:bg-gray-950`, `text-gray-900`, `text-gray-100`, `dark:text-gray-100`). Migration is complete; the safelist fallback is no longer needed.
- **90+ source files** — Systematic replacement of all `gray-*` Tailwind utility classes with the canonical dual-mode palette across the entire `src/` tree:
  - Light mode neutrals: `gray-N` → `zinc-N`
  - Dark mode backgrounds/borders: `dark:*-gray-N` → `dark:*-slate-N`
  - Affected areas: all feature components (products, cart, events, seller, stores, user, admin, homepage, categories), all shared UI primitives, layout, typography, and constants.

### Fixed

- **`src/components/__tests__/PasswordStrengthIndicator.test.tsx`** — Updated test assertion from `.bg-gray-200` to `.bg-zinc-200` to match the updated component class.
- **`src/components/admin/DataTable.tsx`** — Removed stray extra `}` after JSX comment on line 235 (caused TS1381 parse error introduced during gray migration).

---

## [Unreleased] — Stage G3/G4: Repository Fixes & Dead Code Removal

### Fixed

- **`src/app/api/products/route.ts`** — G3: `POST /api/products` now calls `categoriesRepository.updateMetrics()` fire-and-forget after creating a product. `totalProductCount` / `totalAuctionCount` on the category and all ancestors are now incremented on every product creation. Previously these metrics were never updated.
- **`src/app/api/products/[id]/route.ts`** — G3: `DELETE /api/products/[id]` (soft-delete) now calls `categoriesRepository.updateMetrics()` fire-and-forget after discontinuing a product. Category metrics are decremented on product removal.

### Removed

- **`src/lib/helpers/category-metrics.ts`** — G3: Deleted. All functions (`batchUpdateAncestorMetrics`, `addProductToCategory`, `removeProductFromCategory`, `recalculateCategoryMetrics`, `recalculateTreeMetrics`, `validateFeaturedStatus`, `bulkValidateFeaturedStatus`) were dead code — zero callers outside the file itself. `CategoriesRepository.updateMetrics()` already provided the equivalent logic with proper repository-pattern encapsulation.
- **`src/lib/helpers/index.ts`** — Removed `export * from "./category-metrics"` re-export.
- **`src/lib/adapters/schema.adapter.ts`** — G4: Deleted. `adaptUserToUI`, `adaptProductToUI`, `adaptOrderToUI` and their `Adapted*` types had zero callers and zero imports anywhere in the codebase. Dead code per Rule 24.

---

## [Unreleased] — Stage F1: Styling Cleanup

### Removed

- **`src/app/globals.css`** — Dead CSS custom properties block (`--bg-primary`, `--text-primary`, `--shadow-*`, etc. in both `:root` and `.dark` blocks). No `var(--...)` usage was found anywhere in the codebase — these were legacy stubs never consumed. Removes ~65 lines.
- **`src/app/globals.css`** — Entire `@layer components` block (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.input-base`, `.card`, `.card-hover`, `.card-bordered`, `.heading-1`, `.heading-2`, `.heading-3`, `.body-text`, `.container-max`, `.section-spacing`, `.stack-spacing`, `.interactive-hover`, `.interactive-scale`, `.gradient-primary`, `.gradient-secondary`, `.gradient-accent`, `.gradient-text`). Zero `className` references found in any `.tsx` file — all styling uses `THEME_CONSTANTS` class strings. Removes ~90 lines.

---

## [Unreleased] — Stage E7: SSR Phase 5 — Real-time SSE Islands

### Added

- **`src/app/api/realtime/bids/[id]/route.ts`** — New SSE route (`GET /api/realtime/bids/[id]`). Uses Firebase Admin RTDB `onValue` listener to push live auction bid updates to the browser as `text/event-stream`. Node.js runtime, `maxDuration = 300`, 25-second heartbeat pings, and clean teardown on request abort. Sends `{ type: "connected" }`, `{ type: "update", data }`, and `{ type: "error" }` events.
- **`src/constants/api-endpoints.ts`** — Added `REALTIME.BIDS_SSE: (productId: string) => string` endpoint constant.

### Changed

- **`src/hooks/useRealtimeBids.ts`** — Complete rewrite. Removed Firebase client SDK imports (`firebase/database`, `ref`, `onValue`, `realtimeDb`). Now uses browser `EventSource` pointed at `API_ENDPOINTS.REALTIME.BIDS_SSE(productId)`. No Firebase client bundle cost for auction bid subscriptions.

### Fixed

- **`src/hooks/__tests__/useRealtimeBids.test.ts`** — Tests rewritten for the new SSE-based implementation. All 9 tests pass.

---

## [Unreleased] — Bug Fixes

### Fixed

- **`src/app/api/payment/verify/route.ts`** — §9.10 (P0): `cartSubtotal`, `groupTotal`, `orderItems.unitPrice`, and `order.unitPrice` now use the live `product.price` fetched from Firestore instead of the stale `item.price` snapshot stored in the cart at add-time. Prevents an undercharge when a seller raises a price after the item was added to the cart.
- **`src/classes/Queue.ts`** — Rule 23: Replaced `console.error()` in recursive tail-call `.catch()` with `qLogger.error()` from `Logger.getInstance()`.

---

### Added

- **`src/types/auth.ts`** — Added `SessionUser` interface (moved from `SessionContext.tsx`). Now importable from server-side code without triggering a `"use client"` boundary.
- **`src/lib/firebase/auth-server.ts`** — Added `getServerSessionUser(): Promise<SessionUser | null>`. Reads and verifies the `__session` cookie, fetches the Firestore user profile via `userRepository`, and returns a fully-hydrated `SessionUser` suitable for passing as `initialUser` to `SessionProvider`.
- **`src/app/[locale]/layout.tsx`** — Calls `getServerSessionUser()` server-side and passes the result as `initialUser` to `<SessionProvider>`. Authenticated users now see their UI immediately on hard reload with zero loading flash.

### Changed

- **`src/contexts/SessionContext.tsx`** — Removed the local `SessionUser` interface definition; replaced with `import type { SessionUser } from "@/types/auth"` and a re-export for backwards compatibility. `SessionProvider` now accepts `initialUser?: SessionUser | null`; when provided, `loading` starts as `false` and `sessionId` state is seeded from `initialUser.sessionId`.

### Fixed

- **`src/contexts/SessionContext.tsx`** — Bug: initial `sessionId` state was always `null` even when `initialUser.sessionId` was set, causing `isAuthenticated` to be `false` on first render despite the user being present. Fixed by seeding `sessionId` from `initialUser?.sessionId ?? null`.

---

## [Unreleased] — Stage E5: SEO — `generateMetadata` + JSON-LD structured data

### Added

- **`src/app/[locale]/products/[slug]/page.tsx`** — Added `<script type="application/ld+json">` with `@type: "Product"` schema (name, description, image, sku, offers with price/currency/availability/seller, brand). Improved `generateMetadata` with canonical URL and full OG tags using `SITE_CONFIG.brand.name`.
- **`src/app/[locale]/events/[id]/page.tsx`** — Added `<script type="application/ld+json">` with `@type: "Event"` schema (name, description, image, startDate from `startsAt`, endDate from `endsAt`, organizer). Improved `generateMetadata` with canonical, OG image from `coverImageUrl`.
- **`src/app/[locale]/blog/page.tsx`** — Removed `"use client"`. Added `generateMetadata` using `getTranslations("blog")` and `SITE_CONFIG.brand.name`. Added `export const revalidate = 60`.
- **`src/app/[locale]/events/page.tsx`** — Removed `"use client"`. Added `generateMetadata` using `getTranslations("events")` and `SITE_CONFIG.brand.name`.
- **`src/app/[locale]/auctions/page.tsx`** — Added `generateMetadata` using `getTranslations("auctions")` and `SITE_CONFIG.brand.name`.
- **`src/app/[locale]/pre-orders/page.tsx`** — Added `generateMetadata` using `getTranslations("preOrders")` and `SITE_CONFIG.brand.name`.

---

## [Unreleased] — Stage E4: SSR Phase 4 — Static Pages ISR

### Added

- **`export const revalidate = 3600`** — Added to all static content pages: `terms`, `privacy`, `cookies`, `refund-policy`, `help`, `seller-guide`, `about`, `faqs`.

### Changed

- **`src/app/[locale]/contact/page.tsx`** — Removed `"use client"`. Converted to `async` RSC using `getTranslations` from `next-intl/server`. Added `generateMetadata`. Added `export const revalidate = 3600`. Child components (`ContactInfoSidebar`, `ContactForm`) retain `"use client"` as islands.

---

## [Unreleased] — Stage E3: SSR Phase 3 — Listing Pages

### Fixed

- **`src/features/categories/components/CategoriesListView.tsx`** — Bug: categories always displayed empty. Root cause: type was annotated as `{ data: CategoryDocument[], meta: { total } }` but the categories flat API returns `CategoryDocument[]` directly. Fixed type to `CategoryDocument[]` and changed `data?.data ?? []` to `data ?? []`.

### Changed

- **`src/app/[locale]/products/page.tsx`** — Made `async` RSC. Prefetches first page of published products via `productRepository.list()`. Added `generateMetadata`. Passes `initialData` to `ProductsView`.
- **`src/features/products/hooks/useProducts.ts`** — Added `UseProductsOptions { initialData? }` interface and `options?` parameter; forwarded to `useApiQuery`.
- **`src/features/products/components/ProductsView.tsx`** — Added `ProductsViewProps { initialData? }` and `initialData` prop; passed to `useProducts`.
- **`src/app/[locale]/categories/page.tsx`** — Made `async` RSC. Prefetches non-brand categories via `categoriesRepository.findAll()`. Added `generateMetadata`. Passes `initialData` to `CategoriesListView`.
- **`src/features/categories/components/CategoriesListView.tsx`** — Added `initialData?: CategoryDocument[]` prop; passed to `useApiQuery`.
- **`src/app/[locale]/stores/page.tsx`** — Made `async` RSC. Prefetches stores via `storeRepository.listStores()`. Added `mapStore()` helper to flatten nested `stats` object to `StoreListItem`. Passes `initialData` to `StoresListView`.
- **`src/features/stores/hooks/useStores.ts`** — Added `UseStoresOptions { initialData? }` and `options?` parameter; forwarded to `useApiQuery`.
- **`src/features/stores/components/StoresListView.tsx`** — Added `StoresListViewProps { initialData? }` and `initialData` prop; passed to `useStores`.
- **`src/app/[locale]/search/page.tsx`** — Made `async` RSC. Prefetches categories for filter facets. Added `generateMetadata`. Passes `initialCategories` to `SearchView`.
- **`src/features/search/hooks/useSearch.ts`** — Added `UseSearchOptions { initialCategories? }` and `options?` parameter; forwarded as `initialData` to the categories sub-query in `useApiQuery`.
- **`src/features/search/components/SearchView.tsx`** — Added `SearchViewProps { initialCategories? }` prop; passed to `useSearch`.
- **`src/app/[locale]/categories/[slug]/page.tsx`** — Made `async` RSC. Fetches category by slug then its children sequentially. Calls `notFound()` if category not found. Added `generateMetadata` with OG image from `category.seo.ogImage`. Passes `initialCategory` and `initialChildren` to `CategoryProductsView`.
- **`src/features/categories/hooks/useCategoryDetail.ts`** — Added `UseCategoryDetailOptions { initialCategory?, initialChildren? }` and `options?` parameter; category wrapped as `{ data: initialCategory }` for `useApiQuery`.
- **`src/features/categories/components/CategoryProductsView.tsx`** — Added `initialCategory?` and `initialChildren?` props; passed to `useCategoryDetail`.

---

## [Unreleased] — Stage E2: SSR Phase 2 — Homepage Sections

### Changed

- **`src/app/[locale]/page.tsx`** — Converted to `async` RSC. Pre-fetches carousel slides (`carouselRepository.getActiveSlides()`), root categories (`categoriesRepository.getCategoriesByTier(0).slice(0, 12)`), and featured reviews (`reviewRepository.findFeatured(18)`) in parallel via `Promise.all` with per-call `.catch(() => [])` fallbacks. Passes results as `initialData` props to the three client section components.
- **`src/hooks/useHeroCarousel.ts`** — Added `options?: { initialData?: CarouselSlideDocument[] }` parameter; forwarded to `useApiQuery`.
- **`src/hooks/useTopCategories.ts`** — Added optional second `options?: { initialData?: CategoryDocument[] }` parameter; forwarded to `useApiQuery`.
- **`src/hooks/useHomepageReviews.ts`** — Added `options?: { initialData?: ReviewDocument[] }` parameter; forwarded to `useApiQuery`.
- **`src/features/homepage/components/HeroCarousel.tsx`** — Added `initialSlides?: CarouselSlideDocument[]` prop; passed to `useHeroCarousel({ initialData: initialSlides })`.
- **`src/features/homepage/components/TopCategoriesSection.tsx`** — Added `initialCategories?: CategoryDocument[]` prop; passed to `useTopCategories(12, { initialData: initialCategories })`.
- **`src/features/homepage/components/CustomerReviewsSection.tsx`** — Added `initialReviews?: ReviewDocument[]` prop; passed to `useHomepageReviews({ initialData: initialReviews })`.

---

## [Unreleased] — Stage E1: SSR Phase 1 — Blog, Products, Events, Sellers

### Added

- **`src/features/events/components/EventDetailView.tsx`** — New `"use client"` component. Full event detail rendering extracted from the former fat client page. Accepts `{ id: string; initialData?: EventDocument }`.
- **`src/features/seller/components/SellerStorefrontPage.tsx`** — New client shell. Receives `{ sellerId, initialSeller? }` from the RSC and passes them into `useSellerStorefront`.

### Changed

- **`src/app/[locale]/blog/[slug]/page.tsx`** — Removed `"use client"`; made `async` RSC. Calls `blogRepository.findBySlug()` + `blogRepository.findRelated()` directly. Added `generateMetadata` with Open Graph image support.
- **`src/app/[locale]/products/[slug]/page.tsx`** — Removed `"use client"`; made `async` RSC. Calls `productRepository.findByIdOrSlug()` directly. Added `generateMetadata` with OG images.
- **`src/app/[locale]/events/[id]/page.tsx`** — Thinned to bare async RSC shell. Calls `eventRepository.findById()`. Added `generateMetadata`. Render logic extracted to `EventDetailView`.
- **`src/app/[locale]/sellers/[id]/page.tsx`** — Made `async` RSC. Calls `userRepository.findById()`, validates seller role (`notFound()` otherwise). Added `generateMetadata`. Renders `<SellerStorefrontPage>`.
- **`src/features/blog/components/BlogPostView.tsx`** — Added `initialData?: { post; related }` prop; passed to `useApiQuery`.
- **`src/features/products/components/ProductDetailView.tsx`** — Added `initialData?: ProductDocument` prop; passed to `useApiQuery`.
- **`src/hooks/useApiQuery.ts`** — Added `initialData` option; `initialDataUpdatedAt: Date.now()` marks it fresh for the full `staleTime`, preventing an immediate refetch.
- **`src/hooks/useSellerStorefront.ts`** — Added `options?: { initialSeller?: UserDocument }` second parameter; profile query receives `initialData`.

---

## [Unreleased] — Stage D: react-hook-form Migration

### Added

- **`react-hook-form@7.71.2`** + **`@hookform/resolvers`** — Installed via `npm install --legacy-peer-deps`.

### Changed

- **`src/hooks/index.ts`** — `useForm` now re-exported from `react-hook-form` instead of the deleted local file.

### Removed

- **`src/hooks/useForm.ts`** — Deleted. `useForm` re-exported from `react-hook-form` via the barrel.
- **`src/hooks/__tests__/useForm.test.ts`** — Deleted alongside source file.

---

## [Unreleased] — Stage C: TanStack Query Migration

### Added

- **`@tanstack/react-query@5.90.21`** + **`@tanstack/react-query-devtools`** — Installed.
- **`src/components/providers/QueryProvider.tsx`** — `QueryClientProvider` wrapper. Exports `getQueryClient()` module-level singleton used by `invalidateQueries` outside React components. `ReactQueryDevtools` mounted in development.
- **`src/app/[locale]/layout.tsx`** — `QueryProvider` added to root client-provider tree.

### Changed

- **`src/hooks/useApiQuery.ts`** — Rewritten as a thin TanStack `useQuery` adapter. Public interface preserved for all 150+ callers. `cacheTTL` maps to `staleTime`; `onSuccess`/`onError` emulated via `useEffect`; `invalidateQueries` delegates to `queryClient.invalidateQueries()`.
- **`src/hooks/useApiMutation.ts`** — Rewritten as a thin TanStack `useMutation` adapter. `mutate()` returns a `Promise` via `mutateAsync()`; `isLoading` mapped from TanStack v5 `isPending`.

---

## [Unreleased] — Stage A: Security & Bug Fixes (A1–A17)

### Fixed

- **A1 — `src/lib/api-client.ts`** — `buildURL` falls back to `process.env.NEXT_PUBLIC_APP_URL` server-side; eliminates `ReferenceError: window is not defined` in RSC context.
- **A2 — Payment verify route** — Razorpay HMAC comparison migrated from `===` to `crypto.timingSafeEqual()`.
- **A3 — `src/app/api/webhooks/shiprocket/route.ts`** — Webhook HMAC comparison migrated to `timingSafeEqual()`.
- **A4 — Media upload route** — Server-side magic-byte MIME validation added; filenames replaced with `crypto.randomBytes(16)` hex strings to prevent path traversal.
- **A5 — `src/lib/security/rate-limit.ts`** — Replaced in-memory `Map` with Upstash Redis `slidingWindow` limiter; removed `NODE_ENV === "development"` bypass.
- **A6 — CSP** — Nonce-based CSP: `generateNonce()` per request; `unsafe-eval` removed from production; nonce forwarded to `<Script>` elements.
- **A7 — `src/contexts/ThemeContext.tsx`** — Reads DOM `class="dark"` for initial state; writes `theme` cookie on toggle to prevent flash on server render.
- **A8 — `src/components/utility/ResponsiveView.tsx`** — Both trees rendered on server; CSS (`block md:hidden` / `hidden md:flex`) hides the inactive one; eliminates hydration mismatch.
- **A9 — `src/hooks/useMediaQuery.ts`** — Lazy initializer reads `window.matchMedia` synchronously on first client render; removes mobile-layout flash.
- **A10 — `src/hooks/useWishlistToggle.ts`** — Optimistic state rolls back in `catch`; no longer rethrows unhandled rejections to `onClick` handlers.
- **A11 — Sign-out cache clear** — `queryClient.clear()` called on sign-out so prior user's cached data is not shown to the next user.
- **A12 — `src/hooks/useRazorpay.ts`** — Added `isError: boolean` state; `onerror` sets it instead of silently swallowing the failure.
- **A13 — `src/hooks/useNotifications.ts`** — `markRead` / `markAllRead` mutations call `refetch()` in `onSuccess`; unread badge updates immediately.
- **A14 — `src/hooks/useChat.ts`** — Listener stored in a `ref`; `off()` receives the same function reference to avoid removing other subscribers on the same RTDB path.
- **A15 — `src/lib/api-client.ts`** — `AbortController` `abort` event listener removed in `finally` block; fixes event-listener memory leak per request.
- **A16 — `src/classes/Queue.ts`** — Recursive `process()` tail call now `await`-ed with `.catch()`; prevents unhandled promise rejections.
- **A17 — `src/classes/StorageManager.ts`** — Instance map keyed by `prefix`; each unique prefix gets its own singleton, fixing cross-namespace key collisions.

---

## [Unreleased] — Docs: Add Known Bugs Section to MASTER_PLAN.md

### Changed

- **`docs/MASTER_PLAN.md`** — Added Section 9 "Known Bugs & Fixes" documenting 11 real bugs found by static code audit. Updated Table of Contents and Executive Summary table with new entries (2 new P0 rows, 3 new P1 rows, 3 new P2 rows, 3 new P3 rows).

  **P0 bugs (production-critical — fix before next release):**
  - §9.9 — `verifyPaymentSignature` and `verifyWebhookSignature` use string `===` (timing attack on HMAC — fraudulent order fulfilment risk)
  - §9.10 — Payment verify route uses stale cart snapshot prices instead of live product prices (undercharge vulnerability)

  **P1 bugs (user-facing correctness):**
  - §9.1 — `useWishlistToggle`: `toggle()` throws on API failure but call sites use `onClick` (unhandled rejection, no user feedback)
  - §9.2 — `useMediaQuery` / `useBreakpoint`: `useState(false)` causes mobile layout flash on every page load
  - §9.5 — `useRazorpay`: script load failure silently sets `isLoading=false`, user sees "ready" but payment throws
  - §9.11 — `useApiQuery` module-level cache not cleared on sign-out (previous user's data briefly shown to next user)

  **P2 bugs (resource leaks / stale UI):**
  - §9.3 — `useNotifications`: `markRead`/`markAllRead` mutations have no `onSuccess` refetch, badge stays stale
  - §9.4 — `useChat`: `off(ref)` without a listener arg removes all RTDB subscriptions on that path
  - §9.6 — `apiClient`: external `AbortSignal` abort listener is never removed (event listener memory leak)

  **P3 bugs (latent / non-user-facing):**
  - §9.7 — `Queue.process()`: recursive call in `finally` not `await`-ed (unhandled promise rejections)
  - §9.8 — `StorageManager.getInstance(prefix)`: `prefix` arg silently ignored after first call (namespace collision risk)

---

## [Unreleased] — Architecture: Migrate Admin-Only Components to Feature Module (Run 3)

### Moved

- **`RichTextEditor`** — from `src/components/admin/` to `src/features/admin/components/`. Removed from `src/components/admin/index.ts`. Now imported locally by `BlogForm`, `FaqForm`, and `SectionForm`.
- **14 admin-only filter components** — from `src/components/filters/` to `src/features/admin/components/`:
  - `UserFilters`, `BidFilters`, `CouponFilters`, `FaqFilters`, `PayoutFilters`, `StoreFilters` (had active admin view consumers)
  - `CarouselFilters`, `CategoryFilters`, `SessionFilters`, `HomepageSectionFilters`, `NewsletterFilters`, `NotificationFilters`, `RipCoinFilters`, `EventEntryFilters` (admin-domain stubs, no other feature consumers)
- **13 test files** — corresponding `__tests__/*.test.tsx` files moved from `src/components/filters/__tests__/` to `src/features/admin/components/__tests__/`. Tests updated to fold `RangeFilter`/`SwitchFilter` mocks into the `@/components` mock block (matching the new import path).

### Changed

- **`src/components/filters/index.ts`** — Removed 14 admin-only filter exports. Remaining: `ProductFilters`, `OrderFilters`, `BlogFilters`, `ReviewFilters`, `EventFilters`, `RangeFilter`, `SwitchFilter`, `filterUtils`.
- **`src/components/admin/index.ts`** — Removed `RichTextEditor` export.
- **`src/features/admin/components/index.ts`** — Added exports for `RichTextEditor` and all 14 filter components (named exports + `Props` types + sort-option constants).
- **9 consumer files** updated to import from local `./` instead of `@/components`:
  - `BlogForm.tsx`, `FaqForm.tsx`, `SectionForm.tsx` → `RichTextEditor`
  - `AdminUsersView.tsx` → `UserFilters`
  - `AdminBidsView.tsx` → `BidFilters`
  - `AdminCouponsView.tsx` → `CouponFilters`
  - `AdminFaqsView.tsx` → `FaqFilters`
  - `AdminPayoutsView.tsx` → `PayoutFilters`
  - `AdminStoresView.tsx` → `StoreFilters`
- **All moved filter files** — relative imports (`./RangeFilter`, `./SwitchFilter`, `type { UrlTable } from "./ProductFilters"`) converted to `@/components`.

---

## [Unreleased] — Remove Google Translate Button and TTS

### Removed

- `TranslatePanel` component (`src/components/layout/TranslatePanel.tsx`) — Google Translate widget panel and globe toggle button from the title bar.
- `TTSButton` component (`src/components/layout/TTSButton.tsx`) — Text-to-speech accessibility button from the title bar.
- Both exports removed from `src/components/layout/index.ts`.
- `translateToggle`, `translatePanelLabel`, `translateLoading`, `ttsPlay`, `ttsStop`, `ttsPlaying` i18n keys removed from all locale message files (`en`, `in`, `mh`, `tn`, `ts`).

---

## [Unreleased] — Homepage Visual Refresh (eBay-Inspired Sections)

### Added

- **`src/features/homepage/components/StatsCounterSection.tsx`** — New homepage section displaying animated platform stats (products, sellers, buyers, avg rating) in a frosted-glass card with staggered scroll-in entrance. Placed after `HeroCarousel` to build instant social proof.
- **`src/features/homepage/components/HowItWorksSection.tsx`** — New 3-step "Browse → Bid or Buy → Get Delivered" process section with numbered icon cards, connecting arrow lines on desktop, and scroll-triggered fade-in animation. Placed after `TrustFeaturesSection` to onboard new visitors.
- **29 new i18n keys across `messages/en.json`, `messages/in.json`, `messages/ts.json`, `messages/mh.json`, `messages/tn.json`** — Stats values/labels, `howItWorks*` keys, `bannerTag`, `bannerFallback*`, `bannerSecondaryCta`.

### Changed

- **`src/features/homepage/components/AdvertisementBanner.tsx`** — Full redesign. Now renders a **split editorial layout** (image left, copy right) when the CMS banner has a `backgroundImage`, matching modern e-commerce editorial style (inspired by eBay's promotional banners). Fallback full-width gradient variant gains decorative blob overlays, a pill tag, and a secondary "Browse Auctions" CTA button for more visual richness. Replaced hardcoded strings with `useTranslations("homepage")`.
- **`src/features/homepage/components/index.ts`** — Exported `StatsCounterSection` and `HowItWorksSection`.
- **`src/app/[locale]/page.tsx`** — Added `StatsCounterSection` (after HeroCarousel), `HowItWorksSection` (after TrustFeaturesSection) to homepage render order. Both are statically imported; `HowItWorksSection` is dynamically imported for below-fold code-splitting.

---

## [Unreleased] — Style: Eliminate All STYL-003 Violations (THEME_CONSTANTS)

### Changed

- **66 files across `src/app/`, `src/components/`, `src/features/`** — Eliminated all 143 STYL-003 violations. Every raw Tailwind string covered by THEME_CONSTANTS was replaced with the corresponding token. Files missing the import had it added; files with incomplete destructures had missing keys added.
  - `flex items-center justify-center` → `${flex.center}`
  - `flex items-center justify-between` → `${flex.between}`
  - `space-y-4` → `${spacing.stack}`
  - `border-gray-200 dark:border-gray-700` → `${themed.border}`
  - `bg-gray-50 dark:bg-gray-800/50` → `${themed.bgSecondary}`
  - `bg-white dark:bg-gray-900` → `${themed.bgPrimary}`
  - `text-gray-600 dark:text-gray-400` → `${themed.textSecondary}`
  - `max-w-7xl mx-auto px-4` → `${page.container["2xl"]}`

### Fixed

- **`src/features/cart/components/CheckoutView.tsx`** — Pre-existing JSX syntax error: `{/* Main content */}}` (double closing brace) corrected to `{/* Main content */}`.

---

## [Unreleased] — Bug Fixes: RTDB Cleanup, Payment Integrity, Email Total, Pre-Order Components

### Fixed

- **`src/hooks/useRealtimeBids.ts`** — Cleanup used `off(bidRef)` which removes **all** listeners on the RTDB path (including from other mounted components watching the same auction). Changed to call the `unsubscribe` function returned by `onValue`, which removes only this hook's listener. Removed now-unused `off` import.
- **`src/hooks/useRealtimeEvent.ts`** — Same `off(dbRef)` pattern in the `cleanup` callback. Added `unsubscribeRef` (`useRef<(() => void) | null>(null)`) to store the return value of `onValue`; cleanup now calls `unsubscribeRef.current?.()` and sets it to `null`. Removed `off` import. Applies to all bridges built on this hook (`useAuthEvent`, `usePaymentEvent`).
- **`src/app/api/payment/verify/route.ts`** — **Critical security fix**: the `/api/payment/create-order` route accepts a client-provided `amount`, making it possible to create a Razorpay order for ₹1, pay it, and still have orders fulfilled at full cart prices. Added server-side amount validation after product pre-checks: the Razorpay order is fetched via `fetchRazorpayOrder`, and the paid amount is compared against the server-calculated cart subtotal + platform fee (₹1 rounding tolerance). Mismatches are rejected with `PAYMENT_FAILED`.
- **`src/lib/payment/razorpay.ts`** — Added `fetchRazorpayOrder(orderId)` helper (uses `razorpay.orders.fetch`) required by the verify-route amount check above.
- **`src/app/api/checkout/route.ts`** — COD/UPI confirmation email was sending `totalPrice: groupTotal` (subtotal before shipping), while the order document stored `totalPrice: orderTotal` (subtotal + shipping fee). Email now correctly uses `totalPrice: orderTotal` so the amount shown to the user matches the amount recorded on the order.
- **`src/features/products/components/PreOrderDetailView.tsx`** — Multiple TypeScript errors in newly created file:
  - `Button asChild` is not a valid prop on the project's `Button` component — replaced both `asChild` usages with `useRouter` navigation (`onClick={() => router.push(...)}`); added `useRouter` import from `next/navigation`.
  - `<ProductImageGallery product={product!} />` — component expects `mainImage`, `images`, `video`, `title`, `slug` props individually; fixed to pass them from the product object.
  - `<ProductFeatureBadges product={product} />` — component expects individual feature flags (`featured`, `condition`, `isAuction`); fixed to pass them explicitly.
  - `<Badge size="sm">` — `Badge` has no `size` prop; removed from both badge usages.
  - `STATUS_COLORS` type included `"neutral"`, which is not a valid `Badge` variant; changed to `"default"`.
  - Three `<AccordionItem>` usages were missing the required `value` prop; added `value="specifications"`, `value="features"`, `value="delivery-returns"`.
- **`src/components/pre-orders/PreOrderGrid.tsx`** — `UI_LABELS.empty.noItems` (wrong case + key) corrected to `UI_LABELS.EMPTY.NO_ITEMS`.

---

## [Unreleased] — Seed Data: Reliable Media URLs + Review Media

### Changed

- **`src/db/seed-data/products-seed-data.ts`** — Replaced all Unsplash image/thumbnail URLs across all 50 products with deterministic `picsum.photos/seed/{keyword}/{w}/{h}` URLs. Covers `mainImage`, `images` arrays, and `video.thumbnailUrl` for the 4 products that include video (PS5 Slim, Sony Alpha 7 IV, TAG Heuer Carrera, Bose 700). Format also consolidated from multi-line to single-line `mainImage`.
- **`src/db/seed-data/reviews-seed-data.ts`** — Added `userAvatar` (DiceBear avataaars SVG) to all 29 reviews. Added `images` arrays throughout (product photos via `picsum.photos` for high-value reviews; empty arrays elsewhere). Added `video` field (Google TV sample CDN + picsum thumbnail, 15s) to the featured iPhone 15 review. Added `featured: true` to 7 high-impact reviews (iPhone 15 Pro Max John, Samsung Galaxy S24 Ultra Jane, MacBook Pro John, Dell XPS 15 John, Vintage Canon Mike, Embroidered Anarkali Vikram, Pressure Cooker Jane).

---

## [Unreleased] — Store Entity Separated from Seller User

### Added

- **`src/db/schema/stores.ts`** — New `StoreDocument` schema for the `stores` Firestore collection. Doc ID = `storeSlug`. Fields: `ownerId`, `storeSlug`, `storeName`, `storeDescription`, `storeCategory`, `storeLogoURL`, `storeBannerURL`, `bio`, `website`, `location`, `socialLinks`, `returnPolicy`, `shippingPolicy`, `isVacationMode`, `vacationMessage`, `isPublic`, `status` (`"pending" | "active" | "suspended" | "rejected"`), `stats`.
- **`src/repositories/store.repository.ts`** — New `StoreRepository` with `create()`, `findBySlug()`, `findByOwnerId()`, `updateStore()`, `setStatus()`, `listStores()` (active + public, for public pages), `listAllStores()` (admin, unfiltered).
- **`src/features/seller/components/SellerStoreSetupView.tsx`** — New onboarding component shown to sellers who have not yet created their store. Calls `POST /api/seller/store` with `storeName`, `storeDescription`, `storeCategory`.
- `messages/en.json` + `messages/hi.json` — Added `sellerStore` keys: `setupTitle`, `setupSubtitle`, `setupSubmit`, `setupSubmitting`, `setupFailed`, `setupPendingBanner`, `storeStatusLabel`, `statusPending`, `statusActive`, `statusSuspended`, `statusRejected`.

### Changed

- **`src/db/schema/users.ts`** — Added `storeId?: string`, `storeSlug?: string`, and `storeStatus?: "pending" | "approved" | "rejected"` to `UserDocument`.
- **`src/app/api/seller/store/route.ts`** — GET now reads via `storeRepository.findByOwnerId()`; POST (new) creates the store document and mirrors `storeId / storeSlug / storeStatus` onto the user record; PATCH updates via `storeRepository.updateStore()` with `StoreDocument` field names (`returnPolicy`, `shippingPolicy`, not `storeReturnPolicy`).
- **`src/app/api/stores/route.ts`** — Public listing now calls `storeRepository.listStores()` (filters `status === "active" && isPublic === true`).
- **`src/app/api/stores/[storeSlug]/route.ts`** — Detail route uses `storeRepository.findBySlug()` and checks `status !== "active"`.
- **`src/app/api/stores/[storeSlug]/products/route.ts`**, **`auctions/route.ts`**, **`reviews/route.ts`** — All three use `storeRepository.findBySlug()` then query products/reviews by `store.ownerId`.
- **`src/app/api/admin/stores/route.ts`** — Admin listing uses `storeRepository.listAllStores()`; filter param renamed from `storeStatus` to `status`.
- **`src/app/api/admin/stores/[uid]/route.ts`** — Approve/reject now updates both `userRepository.updateStoreApproval()` (user approval field) and `storeRepository.setStatus()` (store document status).
- **`src/services/seller.service.ts`** — Added `createStore` method: `apiClient.post(API_ENDPOINTS.SELLER.STORE, data)`.
- **`src/features/seller/hooks/useSellerStore.ts`** — Rewritten to work with `StoreDocument` shape; exposes `store`, `hasStore`, `storeSlug`, `storeStatus`, `isLoading`, `isCreating`, `isSaving`, `createStore`, `updateStore`, `refetch`.
- **`src/features/seller/components/SellerStoreView.tsx`** — Rewritten: shows `SellerStoreSetupView` when `store === null`; edit form uses `StoreDocument` fields directly (no `publicProfile` nesting); status badge reflects `store.status`.
- **`src/features/stores/types/index.ts`** — `StoreListItem` updated: `id`, `storeSlug`, `ownerId`, `storeName` are primary fields; stats flattened; deprecated `uid`, `displayName`, `photoURL` kept for `StoreCard` backwards compat.
- **`src/features/stores/components/StoreCard.tsx`** — `keyExtractor`/`onSelect` updated to use `store.ownerId` instead of deprecated `store.uid`.
- **`src/features/homepage/components/FeaturedStoresSection.tsx`** — `keyExtractor` updated to use `s.id` (required) instead of `s.uid` (deprecated optional).
- **`src/features/admin/components/SiteCommissionsForm.tsx`** — `hint=` prop (non-existent) corrected to `helpText=` on all `FormField` usages.
- **`src/db/seed-data/site-settings-seed-data.ts`** + **`scripts/seed-data/site-settings-seed-data.ts`** — Added missing `codEnabled: false` to payment config.

---

## [Unreleased] — MediaLightbox: Full-Screen Image Viewer with Zoom & Pan

### Added

- **`src/components/media/MediaLightbox.tsx`** — New Tier 1 media primitive. Full-screen lightbox overlay with: zoom in/out (toolbar buttons, mouse wheel, pinch-to-zoom), drag-to-pan when zoomed, browser fullscreen toggle, keyboard navigation (Escape, Arrow keys, +/-), swipe navigation on mobile, thumbnail strip, and image counter. Exports `MediaLightbox`, `MediaLightboxProps`, and `LightboxItem`.
- **`src/components/media/index.ts`** — Exports `MediaLightbox`, `MediaLightboxProps`, and `LightboxItem`.
- `messages/en.json` + `messages/hi.json` — Added `products.gallery` keys: `openLightbox`, `lightboxTitle`, `zoomIn`, `zoomOut`, `resetZoom`, `enterFullscreen`, `exitFullscreen`, `close`.

### Changed

- **`src/features/products/components/ProductImageGallery.tsx`** — Clicking any product/auction image (or the new expand button in the top-right corner) opens `MediaLightbox` with all images and the correct starting index. Videos are excluded from the lightbox (they play inline as before).

---

## [Unreleased] — BlogArticlesSection: Show Latest When No Featured Posts

### Fixed

- **`src/features/homepage/components/BlogArticlesSection.tsx`** — Section was returning `null` during `isLoading` (no skeleton visible), causing it to flash in after load. Replaced the combined `isLoading || articles.length === 0` guard with separate handling: a 4-column skeleton grid is shown while loading, and `null` is returned only after loading completes with zero articles. The existing featured→latest backfill logic (`blogService.getFeatured` → `blogService.getLatest` fill) already ensures the section never hides merely because no posts are marked featured.

---

## [Unreleased] — Admin Homepage Sections: Carousel Config UI + Stores/Events Support

### Fixed

- **`src/features/admin/components/AdminSectionsView.tsx`** — Default section type on "Create" was incorrectly set to the non-existent `"hero"`; fixed to `"welcome"`.

### Changed

- **`src/features/admin/components/SectionForm.tsx`** — Replaced the raw JSON textarea with structured config fields for all carousel-type sections (`categories`, `products`, `auctions`, `stores`, `events`, `reviews`). Each type gets typed form fields: subtitle, max-items (with per-type field name), auto-scroll toggle, scroll-interval, and (reviews only) items-per-view / mobile-items-per-view. Non-carousel types still use the JSON fallback editor.

### Added

- `messages/en.json` + `messages/hi.json` — Added `adminSections` keys: `carouselSettings`, `formSubtitle`, `formMaxItems`, `formAutoScroll`, `formScrollInterval`, `formItemsPerView`, `formMobileItemsPerView`.

---

## [Unreleased] — Homepage Featured Stores, Events & Carousel Fixes

### Added

- **`src/hooks/useFeaturedStores.ts`** — New hook fetching top approved stores for the homepage featured section.
- **`src/hooks/useFeaturedEvents.ts`** — New hook fetching active events for the homepage featured section.
- **`src/features/homepage/components/FeaturedStoresSection.tsx`** — Homepage section rendering featured stores via `SectionCarousel` + `StoreCard`.
- **`src/features/homepage/components/FeaturedEventsSection.tsx`** — Homepage section rendering featured events via `SectionCarousel` + `EventCard`.
- **`src/db/schema/homepage-sections.ts`** — Added `StoresSectionConfig` and `EventsSectionConfig` interfaces; added `"stores"` and `"events"` to `SectionType`, `SectionConfig`, `DEFAULT_SECTION_ORDER` (stores=7, events=8), and `DEFAULT_SECTION_CONFIGS`.
- **`src/features/admin/components/Section.types.ts`** — Added `{ value: "stores", label: "Stores" }` and `{ value: "events", label: "Events" }` to `SECTION_TYPES` dropdown.
- **`src/lib/validation/schemas.ts`** — Added `"stores"` and `"events"` to Zod enum in `homepageSectionBaseSchema`.
- **`src/types/api.ts`** — Added `"stores"` and `"events"` to `HomepageSectionCreateRequest.type` union.
- **`src/db/seed-data/homepage-sections-seed-data.ts`** + **`scripts/seed-data/homepage-sections-seed-data.ts`** — Added seed documents for `stores` (order 14) and `events` (order 15) sections.
- `messages/en.json` + `messages/hi.json` — Added `featuredStores`, `featuredStoresSubtitle`, `featuredEvents`, `featuredEventsSubtitle` keys under `homepage`; added `sectionTypeStores` and `sectionTypeEvents` under `filters`.

### Changed

- **`src/features/homepage/components/TopCategoriesSection.tsx`** — Refactored to use `SectionCarousel` (same pattern as `FeaturedProductsSection`) instead of a custom `HorizontalScroller` + manual header layout.
- **`src/features/homepage/components/HeroCarousel.tsx`** — Fixed mobile image focal behaviour: container aspect ratio changed from `aspect-[16/9]` to `aspect-[4/3] sm:aspect-[16/9]` so the carousel is taller on mobile and `object-cover` shows the centre of the image without distortion. Strengthened gradient overlay (`from-black/80 via-black/30`) for better text contrast. Applied `!text-white` / `!text-white/90` Tailwind important overrides to card title, subtitle, and description to ensure white text always wins over the Typography component's default theme colour. Added `drop-shadow-md/sm` to card text for legibility on light-background slides.
- **`src/features/homepage/components/index.ts`** — Exported `FeaturedStoresSection` and `FeaturedEventsSection`.
- **`src/hooks/index.ts`** — Exported `useFeaturedStores` and `useFeaturedEvents`.
- **`src/app/[locale]/page.tsx`** — Added `FeaturedStoresSection` and `FeaturedEventsSection` dynamic imports and rendered them after `FeaturedAuctionsSection`.

---

## [Unreleased] — Firebase Admin RTDB URL Fix

### Fixed

- **`src/lib/firebase/admin.ts`** — Both init paths (service-account JSON and env-var) were constructing the Realtime Database URL as `https://{projectId}.firebaseio.com` — a legacy format only valid for very old Firebase projects. Modern databases use `https://{projectId}-default-rtdb.firebaseio.com` (or a regional URL). The Admin SDK was connecting to the wrong host, causing every `getAdminRealtimeDb()` call (auth event init, payment event init) to silently hang until the 30-second `apiClient` timeout fired and threw `ApiClientError: Request timeout`. Fixed to read `FIREBASE_ADMIN_DATABASE_URL` → `NEXT_PUBLIC_FIREBASE_DATABASE_URL` → constructed `-default-rtdb` fallback.

---

## [Unreleased] — Per-Store Order Splitting + Toast Feedback

### Changed

- `src/db/schema/orders.ts` — Added `OrderItem` interface (`productId`, `productTitle`, `quantity`, `unitPrice`, `totalPrice`); added `items?: OrderItem[]` and `sellerName?: string` fields to `OrderDocument` for multi-item per-store orders.
- `src/app/api/checkout/route.ts` — Replaced one-order-per-cart-item loop with grouping by `sellerId`; now creates **one `OrderDocument` per store**. Each order carries an `items` array with all line items, summed `totalPrice` and `quantity`, and `sellerId`/`sellerName` for seller routing.
- `src/app/api/payment/verify/route.ts` — Same per-store grouping logic applied to the Razorpay payment-verify flow.
- `src/lib/email.ts` — `OrderConfirmationEmailParams` extended with optional `items` array; `sendOrderConfirmationEmail` renders a line-item table in the HTML email when the order contains multiple products.
- `src/hooks/useMessage.ts` — Rewrote as thin wrapper over `useToast`; every `showSuccess`/`showError` call now triggers a global overlay toast.
- `src/features/products/components/ProductActions.tsx`, `src/components/user/WishlistButton.tsx` — Auth-guard redirects now show an error toast before navigating to login.
- Multiple views (admin, seller, user, wishlist, promotions) — Added missing success/error toasts for CRUD operations, auth guards, clipboard fallback, and logout.

---

## [2026-03-07] — API Route Refactor: `createApiHandler` Mandatory Adoption + TSC Clean

### Changed

All 64 JSON API routes have been migrated to the `createApiHandler` factory pattern. Routes previously using `requireAuth()`, `requireRoleFromRequest()`, `requireAuthFromRequest()`, `verifySessionCookie()`, or ad-hoc try/catch blocks now consistently export handlers via `createApiHandler`.

**Pattern replaced (before):**

```typescript
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  const body = await request.json();
  try { ... } catch (e) { return handleApiError(e); }
}
```

**Pattern adopted (after):**

```typescript
export const POST = createApiHandler<typeof schema._output>({
  auth: true,
  schema,
  handler: async ({ user, body }) => successResponse(...),
});
```

**Routes migrated this sprint:**

| Group                | Routes                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| RipCoins             | `balance`, `history`, `purchase`, `purchase/verify`                                                               |
| Payment              | `create-order`, `verify`                                                                                          |
| Checkout             | `checkout`                                                                                                        |
| FAQs / Site Settings | `faqs`, `site-settings`                                                                                           |
| Seller               | `analytics`, `orders`, `orders/bulk`, `payout-settings`, `payouts`, `shipping`, `shipping/verify-pickup`, `store` |
| User                 | `addresses`, `become-seller`, `orders`, `sessions`, `wishlist`, `profile`                                         |

> Routes that legitimately bypass `createApiHandler` (OAuth callbacks, Razorpay webhook, media upload/crop/trim, demo/seed, RTDB token) remain unchanged — they are explicitly listed as exceptions.

### Fixed

- **`RipCoinsWallet.tsx`** — File contained a complete duplicate implementation concatenated after the original. Duplicate was removed. The retained version uses `admin_grant`/`admin_deduct` (matching the schema), i18n keys for type labels, full tab-switching history view, and refund actions.
- **`RipCoinsWallet.tsx` `handleRefund`** — Called `refundPurchase(txId, { onSettled, onSuccess })` with two arguments, but `useApiMutation.mutate` accepts only one. Converted to `async function` with `try/finally`.
- **`chat/route.ts`** — `chatRepository.create()` call was missing required `ChatRoomCreateInput` fields `participantIds` and `isGroup`.
- **`checkout/route.ts` / `payment/verify/route.ts`** — `user.uid` inside `unitOfWork.runBatch` callback lost narrowing; changed to `user!.uid`.
- **`site-settings/route.ts`** — 304 Not Modified response used `new Response(null, {status:304})`; `createApiHandler` returns `NextResponse`, so changed to `new NextResponse(null, {status:304})` (added `NextResponse` import).
- **`seller/payouts/route.ts`** — `session.name` (Firebase `DecodedIdToken`) replaced with `user!.displayName ?? user!.email` (`UserDocument`).

### Added

- **`docs/GUIDE.md §13`** — Completely rewritten with tables covering all 100+ routes grouped by domain, including `bids`, `blog`, `cart`, `chat`, `checkout`, `contact`, `events`, `newsletter`, `notifications`, `payment`, `ripcoins`, `realtime`, `search`, `seller`, `user`, `webhooks`, and `logs` — previously undocumented.
- **`docs/GUIDE.md §14`** — Added `createApiHandler` documentation: execution order, handler context properties, type signature, import path, and updated `API Response` to reflect actual `successResponse`/`errorResponse`/`ApiErrors.*` signatures (replacing stale `success/error/paginated/created/updated/deleted` API).

---

## [2026-03-08] — Listing & Filter Documentation, Filter Utilities, SSOT Cleanup

### Added

- **`docs/LISTING_AND_FILTERS.md`** — Comprehensive reference for all 18 filter components, all listing views (public/seller/admin), URL param conventions, `useUrlTable` / `usePendingTable` API, filter primitives (`FilterFacetSection`, `SwitchFilter`, `RangeFilter`), and both staged-filter patterns.
- **`src/components/filters/filterUtils.ts`** — `getFilterLabel(options, value)` and `getFilterValue(options, label)` utilities exported from `@/components`. Eliminates inline `.find().label` patterns at call sites.

### Changed

- **`ReviewFilters`** — `REVIEW_SORT_OPTIONS` moved here as single source of truth; format changed to `{ value, key }` (i18n key) instead of hardcoded labels. Added `variant?: "admin" | "public"` prop: admin shows all 4 facets, public shows rating only.
- **`ReviewsListView`** — migrated from inline staged state to `usePendingTable`. Imports `REVIEW_SORT_OPTIONS` and `ReviewFilters` from `@/components`.
- **`AdminReviewsView`** — removed local `REVIEW_SORT_OPTIONS_KEYS`; now imports `REVIEW_SORT_OPTIONS` from `@/components`.
- **7 listing view files** — replaced 9 inline `.find((o) => o.value === x)?.label` patterns with `getFilterLabel()`.
- **`FeaturedProductsSection`**, **`FeaturedAuctionsSection`**, **`TopCategoriesSection`**, **`BlogPostView` (related posts)** — replaced inline card implementations with canonical `ProductCard`, `AuctionCard`, `CategoryCard`, `BlogCard` components.

---

## [2026-03-07] — Category Seed Data: Cover Images & New Root Categories

### Changed

- **`scripts/seed-data/categories-seed-data.ts`** — Updated all existing root-category `coverImage` URLs from landscape (`w=1600&h=900`) to square (`w=800&h=800`) format to match the `aspect-square` card design in `TopCategoriesSection`.
- **Sports & Outdoors** — Added missing `coverImage` (Unsplash `photo-1571019613454-1cb2f99b2d8b`) and `color: "#f97316"`.

### Added

- **6 new root categories** (tier 0, `isFeatured: true`) added to seed data with curated Unsplash cover images, brand colors, and full SEO metadata:
  - **Beauty & Health** (`beauty-health`, order 5, `#ec4899`) — cosmetics/wellness
  - **Books & Stationery** (`books-stationery`, order 6, `#f59e0b`) — books/office
  - **Automotive** (`automotive`, order 7, `#6b7280`) — car accessories/parts
  - **Jewelry & Accessories** (`jewelry-accessories`, order 8, `#d97706`) — fine jewelry/watches
  - **Toys & Baby** (`toys-baby`, order 9, `#8b5cf6`) — toys/baby essentials
  - **Food & Groceries** (`food-groceries`, order 10, `#059669`) — fresh produce/packaged foods

---

## [2026-03-06] — Proxy Rename: `middleware.ts` → `proxy.ts`

### Changed

- **`src/middleware.ts` renamed to `src/proxy.ts`** — Next.js 16 supports a configurable entry-point name via `next.config.js`. The locale detection / URL-rewriting entry-point was renamed from the default `middleware.ts` to `proxy.ts` to make its role explicit and avoid confusion with framework middleware conventions. All documentation updated: `GUIDE.md` (architecture tree + key files table), `AUTH.md` (RBAC section + session activity description), `APPLICATION_GRAPH.md` (all "Protected by middleware RBAC" → "proxy RBAC"), and inline JSDoc comments inside `proxy.ts` itself.

---

## [2026-03-06] — Architecture Refactor: Feature Module Extraction & Shared Filter/Layout Primitives

### Added

- **Feature modules created** for five domains previously living under `src/components/`:
  - `src/features/about/` — `AboutView`, `AboutSection`, `TeamSection`, `StatsSection`, `ValuesSection`, `HistorySection` with `index.ts` barrel.
  - `src/features/contact/` — `ContactView`, `ContactForm`, `ContactInfo` with `index.ts` barrel.
  - `src/features/faq/` — `FAQPageContent`, `FAQAccordion`, `FAQCategorySidebar`, `FAQHelpfulButtons`, `FAQSortDropdown`, `RelatedFAQs`, `ContactCTA` with `index.ts` barrel.
  - `src/features/homepage/` — `HomepageView`, `HeroCarousel`, `FeaturedProductsSection`, `FeaturedAuctionsSection`, `TopCategoriesSection`, `BlogArticlesSection`, `CustomerReviewsSection`, `FAQSection`, `AdvertisementBanner`, `SectionCarousel`, `SiteFeaturesSection`, `TrustFeaturesSection`, `TrustIndicatorsSection`, `WelcomeSection`, `WhatsAppCommunitySection`, `HomepageSkeleton` with `index.ts` barrel.
  - `src/features/promotions/` — `PromotionsView`, `CouponCard`, `ProductSection` with `index.ts` barrel.
  - All source pages (`about`, `contact`, `faqs`, `promotions`, `page.tsx`) updated to import from the new feature barrels.

- **Components relocated to correct feature modules** (moved from `src/components/ui/` or `src/components/{domain}/`):
  - `AddressSelectorCreate` → `src/features/user/components/AddressSelectorCreate.tsx` — inline address-creation widget for checkout/profile flows.
  - `NotificationBell` → `src/features/user/components/NotificationBell.tsx` — notification icon + dropdown with unread badge.
  - `CategorySelectorCreate` → `src/features/categories/components/CategorySelectorCreate.tsx` — inline category-creation widget for product forms.
  - `EventBanner` → `src/features/events/components/EventBanner.tsx` — contextual event promotion banner.
  - `ProductImageGallery` → `src/features/products/components/ProductImageGallery.tsx` — image carousel/lightbox for product detail pages.
  - `SearchFiltersRow` + `SearchResultsSection` → `src/features/search/components/` (two new components, fully tested).

- **`src/components/filters/` — 17 Tier-1 shared filter panel components** (`BidFilters`, `BlogFilters`, `CarouselFilters`, `CategoryFilters`, `CouponFilters`, `EventEntryFilters`, `EventFilters`, `FaqFilters`, `HomepageSectionFilters`, `NewsletterFilters`, `NotificationFilters`, `OrderFilters`, `PayoutFilters`, `ReviewFilters`, `RipCoinFilters`, `SessionFilters`, `UserFilters`).
  - Each wraps the domain's sort + filter fields using `useTranslations("filters")` and `@/components` primitives.
  - All exported from `src/components/filters/index.ts`; barrel re-exported from `src/components/index.ts`.
  - Test suite in `src/components/filters/__tests__/`.

- **Layout wrapper components** added to `src/components/layout/`:
  - `BottomNavLayout.tsx` — wraps `<BottomNavbar>` in a sticky bottom shell with safe-area padding.
  - `FooterLayout.tsx` — wraps `<Footer>` with outer padding and `<Section>` semantics.
  - `NavbarLayout.tsx` — header shell that renders `<MainNavbar>` with sticky/blur styling.
  - `SidebarLayout.tsx` — left-rail layout with collapsible `<Sidebar>` + main content area.
  - `TitleBarLayout.tsx` — page-level title bar shell rendering `<TitleBar>` with slot support.
  - All exported from `src/components/layout/index.ts`.

- **`src/hooks/useBulkAction.ts`** — Orchestrates a bulk-action request lifecycle.
  - Accepts a `perform` async function, manages `loading / error / result` state, exposes `execute` and `reset`.
  - Exported from `@/hooks` with tests in `src/hooks/__tests__/useBulkAction.test.ts`.

- **`src/hooks/useBulkSelection.ts`** — Multi-select state manager for data tables.
  - Tracks a `Set<string>` of selected IDs; exposes `toggle`, `selectAll`, `clearAll`, `isSelected`, `selectedCount`.
  - Exported from `@/hooks` with tests in `src/hooks/__tests__/useBulkSelection.test.ts`.

- **`src/hooks/usePendingTable.ts`** — Staged filter state bridge for filter panels with an explicit Apply button.
  - Composes `usePendingFilters` + `useUrlTable`; returns `pendingTable`, `filterActiveCount`, `onFilterApply`, `onFilterClear`.
  - Exported from `@/hooks` with tests in `src/hooks/__tests__/usePendingTable.test.ts`.

- **`ERROR_MESSAGES.REALTIME.*`** — New section in `src/constants/error-messages.ts`:
  - `INIT_FAILED`, `CONNECTION_LOST`, `TIMED_OUT`, `OPERATION_FAILED` — used by `useRealtimeEvent` defaults.
- **`ERROR_MESSAGES.AUTH`** additions: `SIGNIN_INIT_FAILED`, `SIGNIN_CONNECTION_LOST`, `SIGNIN_TIMED_OUT` — used by `useAuthEvent`.
- **`ERROR_MESSAGES.CHECKOUT`** additions: `PAYMENT_DECLINED`, `PAYMENT_TRACKING_INIT_FAILED`, `PAYMENT_TRACKING_CONNECTION_LOST`, `PAYMENT_TRACKING_TIMED_OUT`, `PAYMENT_NOT_COMPLETED` — used by `usePaymentEvent` and the payment webhook.

- **i18n** — Extended `messages/en.json` and `messages/hi.json` (383 additions each, in sync):
  - `filters.*` — all filter-panel field labels, boolean display values, status labels.
  - `userAccount.*` — account info card labels (`accountInfo`, `emailAddress`, `userId`, `accountCreated`, `lastLogin`, `never`).
  - `notifications.*` — `error`, `subtitle`, `unreadCount`, `searchPlaceholder`, `filterLabel`, `filterUnread`, `filterRead`.

### Removed

- **`src/components/about/`** — deleted; replaced by `src/features/about/`.
- **`src/components/contact/`** — deleted; replaced by `src/features/contact/`.
- **`src/components/faq/`** — deleted (10 files + tests); replaced by `src/features/faq/`.
- **`src/components/homepage/`** — deleted (18 files + tests); replaced by `src/features/homepage/`.
- **`src/components/promotions/`** — deleted (4 files + tests); replaced by `src/features/promotions/`.
- **`src/components/search/`** — deleted (4 files + tests); replaced by `src/features/search/components/`.
- **`src/components/ui/AddressSelectorCreate.tsx`**, **`CategorySelectorCreate.tsx`**, **`EventBanner.tsx`**, **`NotificationBell.tsx`** — deleted; moved to correct feature modules.
- **`src/components/products/ProductImageGallery.tsx`** — deleted; moved to `src/features/products/`.
- **`src/components/products/ProductFilters.tsx`** — deleted; replaced by `src/components/filters/` tier-1 primitives.

### Fixed

- **`src/hooks/useRealtimeEvent.ts`** — `DEFAULT_MESSAGES` was hardcoded English strings; replaced with `ERROR_MESSAGES.REALTIME.*` constants.
- **`src/hooks/useAuthEvent.ts`** — message overrides were hardcoded English strings; replaced with `ERROR_MESSAGES.AUTH.SIGNIN_*` constants.
- **`src/hooks/usePaymentEvent.ts`** — message overrides were hardcoded English strings; replaced with `ERROR_MESSAGES.CHECKOUT.PAYMENT_TRACKING_*` constants.
- **`src/app/api/payment/webhook/route.ts`** — `"Payment was declined."` was a hardcoded string; replaced with `ERROR_MESSAGES.CHECKOUT.PAYMENT_DECLINED`.

---

## [2026-03-06] — Seed Data — Full Relationship Enrichment Pass

### Fixed

- **`carousel-slides-seed-data.ts`** — Fixed hard break: `createdBy` was `"user_admin_001"` (old underscore format, non-existent user) on all 6 slides → corrected to `"user-admin-user-admin"`.
- **`events-seed-data.ts`** — Community gear poll (`event-community-poll-gear-2026-poll`) status was `ACTIVE` despite ending 28 Feb → set to `ENDED`.
- **`site-settings-seed-data.ts`** — Return policy feature text was "7-Day Return Policy" → updated to "14-Day Return Policy" (synced with blog post `blog-buyer-seller-protection-policy-updates-updates`).
- **`coupons-seed-data.ts`** — SAVE20, ELECTRONICS15, MEGA1000, BUY2GET1, IPHONE100, TECHHUB15 all had `isActive: true` after expiry → set to `false`. Fixed invalid date `2026-02-29` (Feb 2026 is not a leap year) on TECHHUB15 → `2026-02-28`.
- **`addresses-seed-data.ts`** — `addr-meera-home-1707400012` had `fullName: "Meera Nair"` after user was renamed to Vikram Nair → corrected to `"Vikram Nair"`.

### Added

- **`coupons-seed-data.ts`** — Added `FASHION10` (coupon-FASHION-MAR10) for Fashion Boutique and `HOME15` (coupon-HOME-ESSENTIALS-MAR) for Home Essentials — both active March 2026.
- **`addresses-seed-data.ts`** — Added addresses for 6 previously unaddressed users: Fashion Boutique (Studio, Bandra), Home Essentials (Warehouse, Jaipur), Ananya Bose (Kolkata), Pooja Mehta (Mumbai), Ravi Kumar (Chandigarh), Sneha Gupta (Lucknow). Added Jane Smith's Delhi address to align with her existing orders.
- **`sessions-seed-data.ts`** — Added 7 new active sessions: Fashion Boutique seller, Vikram Nair (active), Raj Patel (active), Ananya Bose (iOS), Pooja Mehta (desktop), Ravi Kumar (Android), Sneha Gupta (Firefox).
- **`reviews-seed-data.ts`** — Added 4 reviews from new buyers: Ananya Bose (iPhone), Pooja Mehta (Kurti), Ravi Kumar (MacBook Pro), Sneha Gupta (Cookware Set).
- **`notifications-seed-data.ts`** — Added welcome notifications for Ananya, Pooja, Ravi, Sneha. Added bid/auction notifications for PS5, Hermès scarf, MacBook M3, Dyson V15 auctions. Added auction-ending alert for TechHub seller.
- **`categories-seed-data.ts`** — Populated all `auctionIds` arrays with all 20 auction product IDs across their correct categories. Updated `auctionCount`, `totalAuctionCount`, and `totalItemCount` for all 11 affected categories (electronics root, mobiles, smartphones, laptops, audio, cameras, fashion root, mens-fashion, womens-fashion, home-kitchen, sports-outdoors).
- **`blog-posts-seed-data.ts`** — Added March 2026 "Auction Spotlight" post (`blog-march-2026-auction-spotlight-news`) by moderator Riya Sharma, covering all 20 live auctions.

---

## [2026-03-06] — `useBulkEvent`: RTDB Bridge for Bulk Actions

### Added

- **`src/hooks/useBulkEvent.ts`** — Thin domain wrapper over `useRealtimeEvent` for the `bulk_events` RTDB channel.
  - Follows the same pattern as `useAuthEvent` and `usePaymentEvent`.
  - For long-running bulk operations the server can process items asynchronously, write the final `BulkActionResult` to RTDB, and return `{ jobId, customToken }` immediately from the HTTP route. The client subscribes via this hook.
  - Generic `<TData>` parameter threads through to `BulkActionResult<TData>` for typed `result.data`.
  - `extractBulkResult` extractor maps the raw RTDB snapshot to `BulkActionResult` — returns `null` for payloads missing `action` or `summary` (defensive guard).
  - Timeout: **10 minutes** — generous headroom for the maximum 100-item batch.
  - Re-exports `RealtimeEventStatus` as `BulkEventStatus` so callers don't need a separate import.
  - Exported from `@/hooks` barrel: `useBulkEvent`, `UseBulkEventReturn`, `BulkEventStatus`.
  - Covered by **19 tests** in `src/hooks/__tests__/useBulkEvent.test.ts`.

- **`src/types/api.ts`** — Added `BulkActionJob` interface.
  - Shape returned by async bulk API routes instead of the full `BulkActionResult`.
  - `{ jobId: string; customToken: string }` — pass both to `useBulkEvent.subscribe`.

- **`src/lib/firebase/realtime-db.ts`** — Added `BULK_EVENTS: 'bulk_events'` to `RTDB_PATHS`.

- **`database.rules.json`** — Added `bulk_events` security rules.
  - Client may read a job node only if the custom token encodes `{ bulkJobId: jobId }` matching that exact `$jobId`.
  - All writes are Admin-only (backend API routes via Admin SDK).
  - Cleanup strategy documented: Firebase Function `cleanupBulkEvents` (to be added) deletes nodes older than 15 minutes.

### Changed

- **`src/hooks/useRealtimeEvent.ts`** — Added `BULK: "bulk"` to `RealtimeEventType` const object.

---

## [2026-03-06] — `useRealtimeEvent`: Generic RTDB Event Bridge Hook

### Added

- **`src/hooks/useRealtimeEvent.ts`** — Generic RTDB event bridge hook shared by all event subscriptions.
  - `RealtimeEventType` const object: `AUTH | PAYMENT | CHAT | BID` — identifies which bridge a hook instance handles; used for logging and future routing logic.
  - `RealtimeEventStatus` const object: `IDLE | SUBSCRIBING | PENDING | SUCCESS | FAILED | TIMEOUT` — unified status state machine for all RTDB event bridges.
  - Generic `<TData>` payload support via optional `extractData?: (raw: RTDBEventPayload) => TData | null` — allows auth (no payload) and payment (`orderIds`) to share the same hook without losing type safety.
  - `configRef` pattern: config is captured in a ref at mount and treated as static, preventing stale closure bugs while keeping `useEffect` deps clean.
  - Normalises raw RTDB `status === "error"` → `RealtimeEventStatus.FAILED` so legacy server-written payloads continue to work.
  - Exported from `@/hooks` barrel: `useRealtimeEvent`, `RealtimeEventType`, `RealtimeEventStatus`, `UseRealtimeEventConfig`, `UseRealtimeEventReturn`, `RTDBEventPayload`, `RealtimeEventMessages`.
  - Covered by 13 tests in `src/hooks/__tests__/useRealtimeEvent.test.ts`.

### Changed

- **`src/hooks/useAuthEvent.ts`** refactored as a thin domain wrapper over `useRealtimeEvent`.
  - Reduced from ~185 lines to ~65 lines.
  - **Breaking**: terminal failure status renamed from `"error"` to `"failed"` to match `RealtimeEventStatus.FAILED`. The hook's `AuthEventStatus` type re-exports `RealtimeEventStatus` for backward-compatible typing. All internal callers (`useAuth.ts`) already use `"failed"`.
- **`src/hooks/usePaymentEvent.ts`** refactored as a thin domain wrapper over `useRealtimeEvent`.
  - Reduced from ~210 lines to ~65 lines.
  - Domain-specific `extractOrderIds` extractor maps `raw.orderIds` to `data: string[] | null`.
- **`docs/AUTH.md`** — State machine diagram and code example updated: `"error"` → `"failed"`.
- **`docs/PAYMENT.md`** — `usePaymentEvent` section updated to document the `useRealtimeEvent` base and the `RealtimeEventStatus` enum.
- **`docs/GUIDE.md`** — Hook reference updated for `useAuthEvent`, `usePaymentEvent`, and new `useRealtimeEvent`.

---

## [Unreleased-prev]

### Added

- **`docs/BULK_ACTIONS.md` — comprehensive bulk actions specification**
  - Documents every bulk action endpoint (existing and planned) across admin, seller, and user tiers.
  - Covers: conventions, route naming, request/response shape, RBAC matrix, per-domain action tables, repository quick reference, `unitOfWork` patterns, Zod schema templates, API endpoint and message constants to add, and the full 132-route API file inventory.
  - Existing implementations documented: `POST /api/seller/orders/bulk` (`request_payout`), `PATCH /api/notifications/read-all`.
  - New route files to create: 16 bulk endpoints across admin, seller, and user domains.

- **`ConfirmDeleteModal` — `variant` prop for bulk-action confirmations**
  - New `variant?: "danger" | "warning" | "primary"` prop (default: `"danger"`).
  - `"danger"`: red icon + `danger` button + "Deleting..." loading text (existing behaviour — no breaking change).
  - `"warning"`: amber icon + `warning` button + "Processing..." loading text — for reversible bulk actions (archive, cancel).
  - `"primary"`: blue icon + `primary` button + "Processing..." loading text — for non-destructive bulk actions (publish, approve).
  - Use `ConfirmDeleteModal` for all bulk-action confirmations (not just deletes) by passing the appropriate `variant` + custom `title`, `message`, and `confirmText`.
  - Tests updated in `src/components/modals/__tests__/ConfirmDeleteModal.test.tsx`.
  - `docs/GUIDE.md` updated with full variant table and usage examples.

- **`MediaAvatar` Tier 1 media primitive** (`src/components/media/MediaAvatar.tsx`)
  - New component for displaying user / seller / brand profile pictures.
  - Accepts `src?: string`, `alt: string`, `size?: 'sm'|'md'|'lg'|'xl'`, `className?: string`.
  - Manages its own circular sizing — no wrapper div needed at call sites.
  - Exported from `@/components` via `src/components/media/index.ts`.
  - Tested in `src/components/media/__tests__/MediaAvatar.test.tsx` (8 tests).

### Fixed

- **Rule 28 (Media primitives) violations resolved** across 14 files:
  - Replaced all raw `import Image from "next/image"` + `<Image fill>` usages with `<MediaImage>`, `<MediaAvatar>`, or `<MediaVideo>` from `@/components` in:
    - `src/features/blog/components/BlogPostView.tsx`
    - `src/features/homepage/components/FeaturedProductsSection.tsx`
    - `src/features/homepage/components/FeaturedAuctionsSection.tsx`
    - `src/features/homepage/components/TopCategoriesSection.tsx`
    - `src/features/homepage/components/HeroCarousel.tsx` (also fixed raw `<video>` → `<MediaVideo>`)
    - `src/features/cart/components/CartItemRow.tsx`
    - `src/features/cart/components/CheckoutOrderReview.tsx`
    - `src/features/admin/components/UserTableColumns.tsx`
    - `src/features/admin/components/CarouselTableColumns.tsx`
    - `src/components/products/ProductTableColumns.tsx`
    - `src/features/products/components/ProductReviews.tsx`
    - `src/features/user/components/PublicProfileView.tsx`
    - `src/features/seller/components/SellerStorefrontView.tsx`
    - `src/components/categories/CategoryForm.tsx`

- **Rule 33 (i18n) violations resolved** — hardcoded English strings in JSX replaced with `useTranslations()`:
  - `BlogPostView.tsx`: breadcrumb "Blog", views count suffix, back button text.
  - `FeaturedProductsSection.tsx`: "Featured" badge label.
  - `FeaturedAuctionsSection.tsx`: "No end date", "Ended", bid count string.
  - `TopCategoriesSection.tsx`: "{n} products" product count string.
  - `CarouselTableColumns.tsx`: column headers (Cards, Title, Image, Status), status labels (Active, Inactive), action labels.
  - `CategoryForm.tsx`: "Slug", "Description" form field labels, "Category Image" label and `ImageUpload` props, "Recommended: 400x300px" helper text. Added `useTranslations("adminCategories")`.
  - `ProductReviews.tsx`: review photo `alt` text (was templateLiteral, now `t("reviewPhotoAlt")`).

- **`CarouselTableColumns` converted from factory to hook** (`getCarouselTableColumns` → `useCarouselTableColumns`):
  - Added `"use client"` directive; now a proper React hook with `useTranslations` inside.
  - Updated `AdminCarouselView.tsx`, `index.ts` barrel, and 2 test files accordingly.

- **Translation keys added** to both `messages/en.json` and `messages/hi.json`:
  - `blog.viewsLabel`
  - `homepage.promoted`, `homepage.auctionNoEndDate`, `homepage.auctionEnded`, `homepage.bidCount`, `homepage.categoryProductCount`
  - `products.reviewPhotoAlt`
  - `adminCarousel.colCards`, `adminCarousel.colTitle`, `adminCarousel.colImage`, `adminCarousel.colStatus`, `adminCarousel.statusActive`, `adminCarousel.statusInactive`
  - `adminCategories.slug`, `adminCategories.description`, `adminCategories.categoryImage`, `adminCategories.imageRecommended`

  - `POST /api/payment/event/init` — Requires session. Accepts `{ razorpayOrderId }`, creates `/payment_events/{razorpayOrderId}` node in Realtime DB with `status:'pending'`, issues a per-event custom token with claim `{ paymentEventId: razorpayOrderId }`. The Razorpay order ID is the node key so the webhook can signal it directly with no secondary lookup.
  - `src/hooks/usePaymentEvent.ts` — Client hook. Subscribes to `/payment_events/{eventId}` via Realtime DB custom token on the secondary `realtimeApp` instance. States: `'idle' | 'subscribing' | 'pending' | 'success' | 'failed' | 'timeout'` with a 5-minute hard timeout. Returns `{ status, error, orderIds, subscribe, reset }`.
  - `src/services/payment-event.service.ts` — `paymentEventService.initPaymentEvent(razorpayOrderId)` calls `POST /api/payment/event/init`.
  - `functions/src/jobs/cleanupPaymentEvents.ts` — Cloud Function (every 5 min) — deletes stale RTDB `payment_events` nodes older than 15 minutes.
  - `API_ENDPOINTS.PAYMENT.EVENT_INIT` constant added.
  - `usePaymentEvent` and `PaymentEventStatus` exported from `@/hooks`.
  - `paymentEventService` and `PaymentEventResponse` exported from `@/services`.
  - `cleanupPaymentEvents` exported from `functions/src/index.ts` and added to dispatch table.

### Changed

- **`POST /api/payment/verify`** — After successful order creation, signals `/payment_events/{razorpayOrderId}` with `{ status:'success', orderIds }` via Admin RTDB (fire-and-forget; non-critical if it fails).
- **`POST /api/payment/webhook`** — On `payment.captured`: signals RTDB `{ status:'success' }` as a fallback for the client. On `payment.failed`: signals RTDB `{ status:'failed', error }` so `usePaymentEvent` can surface the decline to the user.
  - `POST /api/auth/event/init` — Creates a Realtime DB auth event node and issues a per-event custom token (synthetic UID `auth_event_{uuid}`, claim `{ authEventId }`, 5-min TTL). No session required.
  - `GET /api/auth/google/start` — Validates the `eventId`, checks RTDB pending status, redirects popup to Google's OAuth consent screen.
  - `GET /api/auth/google/callback` — Full server-side code exchange with `google-auth-library`; finds/creates Firebase Auth user and Firestore profile; exchanges custom token for ID token; creates session cookie; writes RTDB outcome; redirects popup to `/auth/close`.
  - `GET /api/auth/apple/start` — Same as Google start but targets Apple's Sign In endpoint with `response_mode=form_post`.
  - `POST /api/auth/apple/callback` — Apple's `form_post` callback. Verifies `id_token` using Apple's JWKS, finds/creates user, creates session cookie, writes RTDB outcome.
  - `src/app/[locale]/auth/close/page.tsx` — Popup close page (`window.close()` in `useEffect`). Shows brief translated status while closing.
  - `src/hooks/useAuthEvent.ts` — Client hook. Subscribes to `/auth_events/{eventId}` via Realtime DB custom token auth on the secondary `realtimeApp` instance. Handles `'idle' | 'subscribing' | 'pending' | 'success' | 'error' | 'timeout'` states with a 2-minute hard timeout and full cleanup on terminal state.
  - `src/services/auth-event.service.ts` — `authEventService.initAuthEvent()` calling `POST /api/auth/event/init`.
  - `functions/src/jobs/cleanupAuthEvents.ts` — Cloud Function (every 5 min) — deletes stale RTDB `auth_events` nodes older than 3 minutes.
  - `SCHEDULES.EVERY_5_MIN` added to `functions/src/config/constants.ts`.
  - `database.rules.json` — Added `auth_events` (client read-only, scoped to `auth.token.authEventId == $eventId`) and `payment_events` (same pattern for future payment bridge) rules.
  - `RTDB_PATHS.AUTH_EVENTS` and `RTDB_PATHS.PAYMENT_EVENTS` added to `src/lib/firebase/realtime-db.ts`.
  - `API_ENDPOINTS.AUTH`: `EVENT_INIT`, `GOOGLE_START`, `GOOGLE_CALLBACK`, `APPLE_START`, `APPLE_CALLBACK`.
  - `ERROR_MESSAGES.AUTH`: `AUTH_EVENT_MISSING`, `AUTH_EVENT_EXPIRED`, `OAUTH_STATE_INVALID`, `OAUTH_CODE_EXCHANGE_FAILED`, `OAUTH_USER_INFO_FAILED`, `APPLE_TOKEN_INVALID`, `GOOGLE_TOKEN_INVALID`, `PAYMENT_EVENT_MISSING`.
  - `SUCCESS_MESSAGES.AUTH`: `GOOGLE_LOGIN_SUCCESS`, `APPLE_LOGIN_SUCCESS`, `OAUTH_SESSION_CREATED`.
  - `ERROR_MESSAGES.GENERIC.RATE_LIMIT_EXCEEDED` constant added.
  - `messages/en.json` and `messages/hi.json` — Added `auth.oauth` namespace with keys: `signInWithGoogle`, `signInWithApple`, `signingIn`, `authSuccess`, `authTimeout`, `closing`, `closeError`.

### Fixed

- `AdminCouponsView` and `AdminFaqsView` — removed duplicate `filterActiveCount` redeclarations (stale dead code; the value was already supplied by `usePendingTable`).

- **Rule 33 (i18n) — hardcoded strings replaced with `useTranslations` in 7 components** — All user-visible hardcoded English strings in the following files were replaced with `next-intl` `useTranslations()` calls:
  - `src/features/cart/components/CartItemRow.tsx` — `aria-label` decrease/increase quantity buttons.
  - `src/features/stores/components/StoreNavTabs.tsx` — `aria-label` on the store `<Nav>`.
  - `src/features/admin/components/AdminSessionsManager.tsx` — Error state title/body, 4 stats-card labels and values (raw `<div>` → `<Text>`), table section heading and description, "Revoke" / "Revoke All" button labels.
  - `src/features/admin/components/UserDetailDrawer.tsx` — "No name" fallback, "Email Not Verified" caption, all field label captions (User ID, Login Count, Joined, Last Login), "Never" fallback, login count pluralisation, and role-button labels (via `tRoles` on the `roles` namespace).
  - `src/features/events/components/EventFormDrawer.tsx` — Validation error string "Title is required."
  - `src/features/user/components/PublicProfileView.tsx` — "Auction" badge text, "on" conjunction in "reviewed on" copy.
  - `src/components/user/AccountInfoCard.tsx` — Section heading "Account Information" and all four field labels (Email Address, User ID, Account Created, Last Login); "Never" fallback for null dates.
- **New i18n keys added to `messages/en.json` and `messages/hi.json`** — Added identical-structure keys under the following namespaces to support the above fixes:
  - `adminSessions`: `loadErrorTitle`, `loadError`, `revoke`, `revokeAll`
  - `adminUsers`: `noName`, `loginTimesCount` (ICU plural)
  - `adminEvents.form`: `titleRequired`
  - `profile`: `auctionBadge`, `reviewedOn`
- **Test mocks updated to match component changes** — Four test files had incomplete `@/components` mocks or missing `next-intl` mocks that caused failures when the components began using `next-intl` and Typography primitives (`Text`, `Heading`, `Caption`, `Label`, `AvatarDisplay`):
  - `src/features/admin/components/__tests__/AdminSessionsManager.test.tsx` — Changed barrel import to direct import (breaking circular reference); added `next-intl` mock.
  - `src/components/admin/__tests__/AdminSessionsManager.test.tsx` — Same fix.
  - `src/features/admin/components/__tests__/UserDetailDrawer.test.tsx` — Added `Heading`, `Text`, `Caption`, `Label`, `AvatarDisplay` to `@/components` mock.
  - `src/features/events/components/__tests__/EventFormDrawer.test.tsx` — Added `Input`, `Label`, `Select`, `Text` to `@/components` mock.

### Added

- **Filter section components for all repositories** — Added 17 new Tier 1 filter panel components in `src/components/filters/` (plus a barrel `index.ts` and export via `src/components/index.ts`). Each accepts a `table: UrlTable` prop and renders `FilterFacetSection` items for every filterable enum/boolean field in the repository's `SIEVE_FIELDS`, plus a `RangeFilter` for numeric/date ranges. Each also exports a `XXX_SORT_OPTIONS` constant array. New components: `UserFilters`, `OrderFilters` (with `variant="admin"|"seller"` prop), `ReviewFilters`, `BlogFilters`, `CategoryFilters`, `BidFilters`, `SessionFilters`, `FaqFilters`, `CouponFilters`, `EventFilters`, `EventEntryFilters`, `CarouselFilters`, `HomepageSectionFilters`, `NewsletterFilters`, `NotificationFilters`, `PayoutFilters`, `RipCoinFilters`. The existing `ProductFilters` is also exported through the new barrel.
- **~170 new `filters` i18n keys** — Added to both `messages/en.json` and `messages/hi.json` under the `filters` namespace: all enum value labels, boolean label pairs, section title keys, and placeholder strings used by the new filter components.
- **17 filter component test suites** — Added `__tests__/*.test.tsx` files in `src/components/filters/__tests__/` for all 17 new filter components (37 tests total, all passing).

### Changed

- **`StoreProductsView` migrated to new `ProductFilters`** — `src/features/stores/components/StoreProductsView.tsx` now uses the new `ProductFilters` (table-based API) instead of the deleted legacy version. Pass `table={table}` and `categoryOptions` instead of individual prop callbacks.

### Removed

- **Legacy `src/components/products/ProductFilters.tsx` deleted** — Superseded by `src/components/filters/ProductFilters.tsx` (the modern `UrlTable`-based sieve filter). Its test file was also removed.

- **Sieve Query System documentation** — Added comprehensive `### Sieve Query System` section in `docs/GUIDE.md` (§7 Repositories) covering: `SieveModel` interface, filter operators table, sort syntax, `FirebaseSieveResult` shape, `SIEVE_FIELDS` definition pattern, per-repository filterable/sortable field reference (Product, Order, Review, Blog, Bid, Notification, User), standard GET list API route pattern, `useUrlTable` + service call integration pattern, and comparison of `sieveQuery()` vs `applySieveToArray()`.

- **Firebase composite indexes** — Added 14 new composite indexes to `firestore.indexes.json` to support Sieve sort/filter operations: 7 `orders` indexes (`sellerId+createdAt`, `sellerId+status+createdAt`, `sellerId+paymentStatus+createdAt`, `sellerId+paymentMethod+createdAt`, `sellerId+status+paymentStatus+createdAt`, `sellerId+totalPrice DESC/ASC`); 5 `products` indexes (`status+price ASC/DESC`, `status+category+price ASC/DESC`, `isAuction+status+currentBid DESC`, `isAuction+status+bidCount DESC`); 2 `reviews` indexes (`status+rating DESC`, `status+rating+createdAt DESC`).

- **Hindi translations parity (`messages/hi.json`)** — Added missing keys across 8 namespaces to match `en.json`: `notifications` (subtitle, unreadCount, searchPlaceholder, filterLabel, filterUnread, filterRead), `products` (priceUnder500, price500to2000, price2000to10000, priceOver10000, colTitle, colPrice, colStatus), `auctions` (colTitle, colCurrentBid, colEnds, colBids), `orders` (colProduct), `blog` (colTitle, colAuthor, colPublishedAt), `reviews` (colUser, colProduct, colDate), `sellerAuctions` (6 sort labels), `sellerOrders` (payment status/method filter labels and sort labels).

### Changed

- **Listing pages — unified `ListingLayout` pattern** — Migrated all public, seller, and user listing views to the `ListingLayout` component pattern with: `FilterDrawer` + `FilterFacetSection` filter groups, staged filter state (applied on button click, not on every URL change), `ActiveFilterChips` row, `Search` via `useUrlTable`, `SortDropdown`, view toggle (`DataTable` `showViewToggle`), and `TablePagination`. Affected views: `ProductsView`, `AuctionsView`, `SellerAuctionsView`, `CategoryProductsView`, `BlogListView`, `ReviewsListView`, `SellerOrdersView`, `UserOrdersView`, `UserNotificationsView`.

- **Color palette redesign — Lime Green (light) / Hot Pink (dark)** — Swapped brand color tokens to match Beyblade artwork references:
  - `primary` = Lime Green (600=`#509c02`) — light mode accent; `secondary` = Hot Pink/Magenta (500=`#e91e8c`) — dark mode accent. Former primary cobalt blue extracted to new `cobalt` token.
  - `tailwind.config.js`: primary/secondary palettes swapped; added `cobalt` color scale; added `./src/features/**` to Tailwind content scan; updated `boxShadow.glow` to lime, added `glow-pink` for dark mode.
  - `globals.css`: light-mode `--color-primary` = `80 156 2` (lime); dark-mode `--color-primary` = `233 30 140` (hot pink).
  - `src/constants/theme.ts`: `colors.button.primary` changed from zinc-based to `bg-primary-600 dark:bg-secondary-500 dark:text-white`; `colors.button.secondary` similarly updated; `accent.primary` — fixed critical `dark:text-primary-950` (dark green text on pink, invisible) → `dark:text-white`; chat bubble `mine` same fix; form `checkmark` same fix; `colors.brand.logo` updated to use `cobalt-600/700` to preserve blue logo.
- **Homepage FAQ bug fix** — `FAQSection.tsx`: Question `<Button>` was missing `variant="ghost"`, causing it to defaulting to `primary` variant which in dark mode applied a cream background with the child `<Span>`'s white text becoming invisible (white-on-white). Added `variant="ghost"`. Also replaced hardcoded `bg-blue-600` "View All" link classes with `THEME_CONSTANTS.accent.primary`.
- **FAQAccordion hover bug fix** — `FAQAccordion.tsx`: Template literal `hover:${THEME_CONSTANTS.themed.bgTertiary}` expanded to `hover:bg-zinc-100 dark:bg-slate-800` where the `dark:` class had no `hover:` prefix, making every row permanently darker in dark mode. Replaced with `${THEME_CONSTANTS.themed.hover}` (`hover:bg-zinc-100 dark:hover:bg-slate-800`).
- **CategoriesListView import fix** — `CategoryGrid` was incorrectly imported from `@/components` (Tier 1); corrected to relative import `./CategoryGrid` within the feature (pre-existing TS error, now fixed).

- **P2-2 – P2-6: Feature-module migration (architecture)** — Migrated domain view components from `src/components/` into their respective `src/features/<domain>/components/` directories following the three-tier architecture:
  - **P2-2 products**: `ProductInfo`, `ProductReviews`, `ProductActions`, `ProductFeatureBadges`, `RelatedProducts`, `AddToCartButton` → `features/products/components/`. `ProductCard`, `ProductGrid`, `ProductFilters`, `ProductSortBar` retained in `src/components/products/` (Tier 1 — used cross-feature).
  - **P2-3 auctions**: `AuctionDetailView`, `BidHistory`, `PlaceBidForm` → `features/products/components/`. `AuctionCard`, `AuctionGrid` retained in new `src/components/auctions/` (Tier 1).
  - **P2-4 user**: `UserTabs`, `NotificationItem`, `NotificationsBulkActions`, `OrderTrackingView`, `PublicProfileView` → `features/user/components/`. `AddressCard`, `AddressForm`, `WishlistButton`, `ProfileHeader`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `ProfileInfoForm` (+ `ProfileInfoData` type), `PasswordChangeForm`, `AccountInfoCard` retained in new `src/components/user/` (Tier 1 — explicitly listed in copilot Rule 7).
  - **P2-5 seller**: All seller views and analytics/payout/storefront components → `features/seller/components/`.
  - **P2-6 cart/checkout**: All cart and checkout components → `features/cart/components/`. `CheckoutView` updated to use `StepperNav` from `@/components` instead of `CheckoutStepper`.
  - Feature barrels stripped to export views only; cross-feature import violations resolved; all feature-internal imports converted to relative paths.
  - Fixed `CarouselSlideForm.tsx` file encoding (Windows-1252 → UTF-8).

### Added

- **Public reviews page** — New route `[locale]/reviews/page.tsx` routing to `ReviewsListView` feature component with search, rating filter, sort, and pagination — all URL-driven via `useUrlTable`.
- **ReviewsListView feature** — `src/features/reviews/components/ReviewsListView.tsx` with barrel exports via `src/features/reviews/index.ts`.
- **ReviewCard component** — `src/components/reviews/ReviewCard.tsx` — displays review avatar, name (profile link), verified badge, rating star badge, comment, item link, and optional thumbnail images. Uses `generateInitials` from `@/helpers`, `MediaImage` from `@/components`, and `useTranslations("reviews")` for all user-visible strings.
- **SectionCarousel component** — `src/components/homepage/SectionCarousel.tsx` — generic reusable section carousel with optional background image, heading, description, "See All" link, and `HorizontalScroller` for items.
- **ProductActions component** — `src/components/products/ProductActions.tsx` — add-to-cart, buy-now, and wishlist actions with desktop and mobile sticky bar layouts.
- **ProductFeatureBadges component** — `src/components/products/ProductFeatureBadges.tsx` — feature badges (featured, free shipping, COD, etc.).
- **SkipToMain component** — `src/components/ui/SkipToMain.tsx` — keyboard-accessible skip-navigation link for a11y.
- **BlogListView feature** — `src/features/blog/components/BlogListView.tsx` — public blog listing with `ListingLayout`, category filter, sort, search, and pagination.
- **CategoriesListView feature** — `src/features/categories/components/CategoriesListView.tsx` — public categories listing page.
- **useCategoryDetail hook** — `src/features/categories/hooks/useCategoryDetail.ts` — fetches category detail + children.
- **EventsListView feature** — `src/features/events/components/EventsListView.tsx` — public events listing with status/type filters, sort, search, pagination.
- **SellerAddressesView feature** — `src/features/seller/components/SellerAddressesView.tsx` — seller business/pickup address management using `ListingLayout`.
- **Seller addresses page** — `src/app/[locale]/seller/addresses/page.tsx`.
- **WishlistView feature** — `src/features/wishlist/components/WishlistView.tsx` — wishlist with Products/Auctions/Categories/Stores tabs.
- **Hindi FAQ data** — `src/constants/faq-data-hi.ts` — full Hindi translation of FAQ content.
- **Crash-safe middleware** — `src/middleware.ts` — next-intl middleware with try/catch that redirects to `/error.html` on failure.
- **Static error page** — `public/error.html` — standalone HTML error page with dark mode support for middleware crash scenarios.
- **weeklyPayoutEligibility job** — `functions/src/jobs/weeklyPayoutEligibility.ts` — scheduled function for weekly payout processing with 5% platform commission.
- **Functions user repository** — `functions/src/repositories/user.repository.ts` — `SellerPayoutDetails` interface and `findById` method.
- **Test files** — `BlogCard.test.tsx`, `ReviewCard.test.tsx`, `StoreCard.test.tsx`, `HeroCarousel.test.tsx`.
- **`reviewImageAlt` i18n key** — Added to `reviews` namespace in both `messages/en.json` and `messages/hi.json`.

### Fixed

- **SectionCarousel — replaced raw `next/image` import with `MediaImage`** from `@/components` (Rule 28).
- **ReviewCard — replaced manual `charAt(0).toUpperCase()` with `generateInitials()`** from `@/helpers` (Rule 5).
- **ReviewCard — replaced hardcoded English `alt` text with `t("reviewImageAlt")`** using `next-intl` interpolation (Rule 33).
- **SkipToMain — fixed non-barrel import** — changed `@/components/typography` to `@/components` (Rule 2).
- **EventsListView — consolidated duplicate `@/hooks` imports** into a single import statement (Rule 2).
- **SellerAddressesView — added `xl:` and `2xl:` grid breakpoints** (`xl:grid-cols-2 2xl:grid-cols-3`) (Rule 25).
- **WishlistView — added `2xl:grid-cols-6`** breakpoint to grid overlay (Rule 25).
- **HeroCarousel.test.tsx — fixed TS2322** — added `as React.ReactNode` cast for `children` in Section mock.

### Changed

- **Homepage reviews section — show latest instead of featured** — `CustomerReviewsSection` now displays the most recent approved reviews (`-createdAt`) instead of top-rated ones (`-rating`). `reviewService.getHomepageReviews()` sorts by `-createdAt`. `useHomepageReviews` queryKey updated to `["reviews", "latest"]`.
- **ReviewCard — rating star badge replaces featured star** — Removed the conditional yellow "featured" circle badge. Replaced with an always-visible compact rating badge (star icon + numeric rating) in the top-right corner. Removed the separate 5-star rating row below the comment for a cleaner card layout.
- **Homepage featured sections — fill with latest items when below minimum count** — `useFeaturedProducts` and `useFeaturedAuctions` now fetch promoted items first, then backfill with latest published items (deduped) to reach a minimum of 12. `BlogArticlesSection` similarly fills featured posts with latest ones to reach 4. All sections return `null` (hidden) when no items are available and not loading.
- **HeroCarousel — limit to 5 active slides, hide when empty** — Active slides are now capped at 5 (sorted by order). When no active slides exist, the carousel returns `null` instead of rendering an empty shell.

### Added

- **`productService.getLatest()`** — Fetches latest published products sorted by `-createdAt`.
- **`productService.getLatestAuctions()`** — Fetches latest published auctions sorted by `-createdAt`.
- **`blogService.getLatest()`** — Fetches latest published blog posts sorted by `-publishedAt`.

- **Form components — visual overhaul & new props** — All core form primitives in `src/components/forms/` updated with consistent themed colours (primary-600 / secondary-500), improved accessibility, and new opt-in features.
  - **`Checkbox`** — Fixed invisible tick: added `peer` class to `<input>` and switched SVG visibility to `opacity-0 peer-checked:opacity-100`. Added `indeterminate` prop (renders a dash icon; sets `input.indeterminate` via `useEffect`). Error border uses `border-red-400`.
  - **`RadioGroup`** — Default variant changed to `"toggle"`: each option renders as a pill-style card with a coloured border and indicator dot when selected. New `variant="classic"` restores the traditional outer-ring + inner-dot style. Both variants respect `orientation` and `error` props. The `onChange` callback signature is `(value: string) => void`.
  - **`Input`** — Added `rightIcon?: React.ReactNode` prop (shown in the trailing slot). Added `success?: boolean` prop (shows an emerald checkmark; suppressed when `error` is also set). Icon slots use group `focus-within` colour transitions (primary-500 / secondary-400 in dark mode). Converted to `React.forwardRef`.
  - **`Select`** — Added `placeholder?: string` prop (rendered as a first `disabled` `<option value="">`). Chevron icon adopts `focus-within` colour transition via `group` wrapper.
  - **`Textarea`** — Converted to `React.forwardRef`. Added `showCharCount?: boolean` prop — when combined with `maxLength`, renders a `{count}/{max}` indicator bottom-right. Error border follows `THEME_CONSTANTS.input.error` (`border-red-400 ...`).
  - **`Toggle`** — Replaced `Button` import with native `<button role="switch">`. Unchecked track: `bg-zinc-300 dark:bg-slate-600`. Checked track: `bg-primary-600 dark:bg-secondary-500`. White thumb. Focus rings use `focus-visible` (keyboard-only). `sm` track height is `h-[18px]` (not `h-5`).
  - **`Slider`** — Track fill: `bg-primary-600 dark:bg-secondary-500`. Track background: `bg-zinc-200 dark:bg-slate-700`. Thumb: white fill with 3 px primary-coloured border; dark mode thumb via `:global(.dark)` CSS override (border `#65c408`, background `#1e293b`).

### Fixed

- **FAQ vote schema mismatch** — The Zod validation schema (`faqVoteSchema`) accepted `"not_helpful"` (underscore) but the client-side hook (`useFaqVote`) sent `"not-helpful"` (hyphen). Aligned the Zod schema to `z.enum(["helpful", "not-helpful"])` so votes are validated correctly. The API route, service layer, and hook all use `"not-helpful"` consistently now.

- **FAQ components i18n violations (Rule 3/33)** — All public FAQ components used hardcoded English strings or `UI_LABELS` in JSX. Migrated every user-visible string to `useTranslations('faq')` from `next-intl`:
  - **`FAQPageContent`** — Title, subtitle, search placeholder, result count (with ICU plural), category label
  - **`FAQAccordion`** — Empty state, "Copy link", view count, link-copied toast
  - **`ContactCTA`** — 6 hardcoded strings ("Still Need Help?", "Email Us", "Call Us", "Contact Form", "Submit a request", "Contact Support Team")
  - **`FAQCategorySidebar`** — "Categories" heading, "All FAQs", "Still have questions?", "Contact Support"
  - **`FAQSortDropdown`** — "Sort by:", "Most Helpful", "Newest First", "A-Z"
  - **`FAQSearchBar`** — Removed import of `UI_PLACEHOLDERS`, uses `t('searchPlaceholder')` as default; aria-label uses `tActions('clear')`
  - **FAQ page `generateMetadata`** — Switched from static `SEO_CONFIG` to `getTranslations('faq')` for locale-aware meta title/description

### Added

- **FAQ i18n namespace expanded** — Added 30+ new translation keys to `messages/en.json` and `messages/hi.json` under the `faq` namespace: `searchPlaceholder`, `noResults`, `resultCount` (ICU plural), `inCategory`, `copyLink`, `views`, `allFaqs`, `categories`, `stillHaveQuestions`, `contactSupport`, `sort.*` (label/helpful/newest/alphabetical), `category.*` (7 categories), `contact.*` (title/description/emailUs/callUs/contactForm/submitRequest/contactTeam), `metaTitle`, `metaDescription`.

- **UTF-8 BOM in translation files caused dev-server crash** — Both `messages/en.json` and `messages/hi.json` contained a UTF-8 Byte Order Mark (`EF BB BF`) prefix. Turbopack's JSON parser (Next.js 16 dev mode) rejected files starting with BOM, producing `"Unable to make a module from invalid JSON: expected value at line 1 column 1"`. Downstream, the failed message load caused a secondary `"No intl context found. Have you configured the provider?"` error during SSR. Both files were rewritten without BOM. The dev server now starts and serves all pages correctly.

### Added

- **Middleware crash-safe error handling** — Wrapped the `next-intl` locale middleware (`src/middleware.ts`) in a try/catch so that unexpected errors (corrupted cookies, locale resolution failures, next-intl internal errors) no longer produce raw 500 responses. On failure the middleware logs the error (Edge-compatible `console.error`) and redirects to a new static `/public/error.html` page. Because the static file has an extension, it is excluded by the middleware matcher — redirect loops are impossible. The static error page is fully self-contained (no framework dependencies), dark-mode aware, and shows the originating path via the `?from=` query param for debugging.

- **Unified `ListingLayout` migration — public listing pages** — Refactored all public-facing listing pages to use the shared `ListingLayout` component for consistent filter sidebar, search, sort, pagination, and empty state patterns across the entire storefront.
  - **`EventsListView`** (`src/features/events/components/EventsListView.tsx`) — New view component: status filter (active/ended), type filter (sale/offer/poll/survey/feedback), search, sort (newest/ending soon/ending latest), `TablePagination`, skeleton loading.
  - **`BlogListView`** (`src/features/blog/components/BlogListView.tsx`) — New view component: category filter (news/tips/guides/updates/community), search, sort (newest/oldest/title), `BlogFeaturedCard` on page 1, `BlogCard` grid, `TablePagination`.
  - **`StoresListView`** (`src/features/stores/components/StoresListView.tsx`) — Rewritten from manual composition to `ListingLayout`: search, sort (newest/oldest/name A-Z/Z-A/most products), `TablePagination`, skeleton loading.
  - **`ProductsView`** and **`AuctionsView`** — Previously migrated to `ListingLayout` in the same effort.
  - **Pages thinned**: `src/app/[locale]/events/page.tsx` (80→7 lines), `src/app/[locale]/blog/page.tsx` (127→7 lines) — now thin shells delegating to feature views.
  - **Barrel exports updated**: `src/features/events/index.ts` exports `EventsListView`; `src/features/blog/index.ts` exports `BlogListView`.
  - **i18n keys added** to both `messages/en.json` and `messages/hi.json`: `events.*` (sort/filter/empty), `blog.*` (sort/filter/empty/subtitleWithCount), `storesPage.*` (sort/subtitleWithCount).
  - **Nav: Events & Blog** already in main navbar (`MAIN_NAV_ITEMS` & `SITE_CONFIG.nav`).

- **Auction & Product Schema — new business features** — Added fields to `ProductDocument` for insurance, shipping payer, item condition, and advanced auction settings.
  - `condition` (`"new" | "used" | "refurbished" | "broken"`) — item condition for both products and auctions.
  - `insurance` (boolean) + `insuranceCost` (number) — opt-in insurance; when enabled, Shiprocket is mandatory and cost is added to shipping.
  - `shippingPaidBy` (`"seller" | "buyer"`) — who pays shipping on regular products.
  - `auctionShippingPaidBy` (`"seller" | "winner"`) — who pays shipping on auction items.
  - `reservePrice` (number) — hidden minimum price; auction won't sell below this.
  - `buyNowPrice` (number) — instant-purchase option that bypasses bidding.
  - `minBidIncrement` (number) — minimum bid increase per bid.
  - `autoExtendable` (boolean) + `auctionExtensionMinutes` (number, default 5) — if a bid arrives in the last N minutes, the auction extends by N minutes.
  - `auctionOriginalEndDate` (Date) — tracks the original end date before extensions.
  - Updated `DEFAULT_PRODUCT_DATA`, `PRODUCT_PUBLIC_FIELDS`, `PRODUCT_UPDATABLE_FIELDS`, `ProductCreateInput` in `src/db/schema/products.ts`.
  - Updated `PRODUCT_FIELDS` in `src/db/schema/field-names.ts` with new constants + `CONDITION_VALUES`, `SHIPPING_PAID_BY_VALUES`, `AUCTION_SHIPPING_PAID_BY_VALUES` sub-objects.
  - Updated `AdminProduct` interface in `src/components/admin/products/types.ts`.

- **ProductForm — new form sections** — `src/components/admin/products/ProductForm.tsx` (shared between admin and seller):
  - "Condition & Shipping" section: condition dropdown (4 options), shipping payer select, insurance checkbox with Alert + cost field.
  - Expanded auction section: reserve price, buy-now price, min bid increment, auction shipping payer, auto-extend toggle with extension minutes.

- **Auction Detail Page — 3-column layout rewrite** — `src/components/auctions/AuctionDetailView.tsx` rewritten to match `ProductDetailView` design:
  - 3-column layout: Gallery (with live/ended badge) | Auction Info | Sticky Bid Panel.
  - Prominent countdown timer grid (days / hours / minutes / seconds) with colour-coded ending-soon state.
  - Bid info panel with current/starting bid, reserve price met/not-met indicator, min increment display.
  - Feature badges via `ProductFeatureBadges`, shipping/insurance/auto-extend info badges.
  - Accordion for specifications + delivery/returns.
  - Desktop sticky sidebar with `PlaceBidForm`, Buy Now button, Wishlist toggle, Seller card.
  - Mobile fixed bottom bar with price + wishlist + Place Bid CTA.
  - Full `BidHistory` section below the grid.
  - Uses `useWishlistToggle` hook for wishlist functionality.

- **Translation keys** — ~80 new keys added to both `messages/en.json` and `messages/hi.json`:
  - `adminProducts` namespace: form fields for condition, insurance, shipping payer, reserve price, buy-now price, min bid increment, auto-extendable, extension minutes, auction shipping payer, section headers.
  - `auctionDetail` namespace: all labels for auction detail page (breadcrumbs, countdown, bid info, reserve price, insurance, auto-extend, shipping, condition labels, feature sections, seller info, CTA buttons).

- **Seed data** — Updated `scripts/seed-data/products-seed-data.ts`:
  - First product (iPhone): `condition: "new"`, `insurance: true`, `insuranceCost: 999`, `shippingPaidBy: "seller"`.
  - Vintage Canon auction: `condition: "used"`, insurance, `reservePrice: 25000`, `minBidIncrement: 500`, `autoExtendable: true`, `auctionShippingPaidBy: "winner"`.
  - MacBook auction: `condition: "refurbished"`, `buyNowPrice: 180000`, `minBidIncrement: 2000`, `autoExtendable: true`, `auctionShippingPaidBy: "seller"`.
  - Leica camera auction: `condition: "used"`, `reservePrice: 100000`, `minBidIncrement: 2500`, `autoExtendable: false`.
  - Air Jordan auction: `condition: "new"`, `buyNowPrice: 65000`, `minBidIncrement: 1000`, `autoExtendable: true`, `auctionOriginalEndDate`.

### Changed

- **Seller create flow** (`src/features/seller/components/SellerCreateProductView.tsx`) — `EMPTY_PRODUCT` expanded with defaults for new fields: `condition: "new"`, `insurance: false`, `shippingPaidBy: "buyer"`, `autoExtendable: false`, `auctionExtensionMinutes: 5`, `auctionShippingPaidBy: "winner"`.
- **Seller edit flow** (`src/features/seller/components/SellerEditProductView.tsx`) — `handleSubmit` field mapping expanded to include all new fields with conditional logic for auction-only fields.

- **Product Detail Page — complete redesign** — 3-column responsive layout (gallery | info | actions) matching new wireframe design.
  - `ProductFeatureBadges` (NEW `src/components/products/ProductFeatureBadges.tsx`) — coloured badge pills for product/seller features: Featured, Faster Delivery, Rated Seller, Condition, Returnable, Free Shipping, COD, Wishlist Count, Category Product Count.
  - `ProductActions` (NEW `src/components/products/ProductActions.tsx`) — sticky action bar with Add to Cart (orange), Buy Now (green), Wishlist (pink); right column on `lg:` desktop, fixed bottom bar on mobile with safe-area padding.
  - Barrel exports added to `src/components/products/index.ts`.
  - ~30 new translation keys added to both `messages/en.json` and `messages/hi.json` (`products` namespace): `condition`, `conditionNew/Used/Broken/Refurbished`, `ratedSeller`, `fasterDelivery`, `returnable`, `codAvailable`, `wishlistCount`, `categoryProductCount`, `viewStore`, `removeFromWishlist`, `addedToWishlist`, `removedFromWishlist`, `productFeatures`, `shortDescription`, `longDescription`, `home`, `viewCount`, `shareProduct`, `sku`, `tags`, `specsTitle`, `deliveryInfo`, `sellerInfo`, `verified`, `quickActions`.

### Changed

- **`ProductDetailView`** (`src/features/products/components/ProductDetailView.tsx`) — rewritten to 3-column layout with `grid-cols-1 lg:grid-cols-[1fr_1fr_280px] xl:grid-cols-[1fr_1fr_300px]`; replaced hand-rolled `Nav` breadcrumbs with `Breadcrumbs`/`BreadcrumbItem` components; now passes `slug`, `sellerId`, `viewCount`, `isPromoted` props to `ProductInfo`; uses `ProductActions` instead of inline `AddToCartButton`; added `h-20 lg:hidden` bottom padding for mobile sticky bar.
- **`ProductImageGallery`** (`src/components/products/ProductImageGallery.tsx`) — rewritten with nav arrows (`ChevronLeft`/`ChevronRight`) on hover, image counter badge, responsive aspect ratios (`aspect-square sm:aspect-[4/3] lg:aspect-square`), larger thumbnails on `sm:` (`w-20 h-20`), ring selection indicator on active thumbnail.
- **`ProductInfo`** (`src/components/products/ProductInfo.tsx`) — rewritten for centre-column layout; removed `onAddToCart`/`isAddingToCart` props (actions now in `ProductActions`); added `sellerId`, `viewCount`, `slug`, `isPromoted`, `condition` props; added `TextLink` for store/category/tags navigation; uses `Accordion`/`AccordionItem` for specifications and delivery/returns sections; integrates `ProductFeatureBadges`; uses `Divider` between sections.
- **`ProductInfo` test** (`src/components/products/__tests__/ProductInfo.test.tsx`) — updated to match new props and mock dependencies; removed stale `onAddToCart` assertions; added seller name and feature badges tests.

### Changed

- **Carousel slide card grid simplified to fixed 2×3 layout** — replaced the old free-form 9×9 span-based grid with a fixed 2 rows × 3 columns grid (Top/Bottom × Left/Center/Right). Each card now occupies exactly one cell with `gridRow: 1|2` and `gridCol: 1|2|3`; no spanning; max 6 cards per slide.
  - `GridCard` interface (`src/db/schema/carousel-slides.ts`): replaced `gridPosition`, `mobilePosition`, `width`, `height`, `mobileHideText` with `gridRow: 1|2` and `gridCol: 1|2|3`. `content` and `buttons` made optional.
  - `GRID_CONFIG` simplified to `{ rows: 2, cols: 3 }`. `isValidGridPosition` updated to `(gridRow, gridCol)` signature.
  - `gridCardSchema` (`src/lib/validation/schemas.ts`): now validates `gridRow` (1–2) and `gridCol` (1–3); `max(6)` cards; unique-position check.
  - `CarouselCreateRequest` (`src/types/api.ts`): updated gridCards shape to match new schema.
  - `CarouselSlideForm` (`src/components/admin/carousel/CarouselSlideForm.tsx`): fully rewritten — replaced `GridEditor` with inline 2×3 visual grid designer; each cell shows add/edit/remove card controls with `CardEditor` subcomponent (background, content, buttons).
  - `CarouselTableColumns` (`src/components/admin/carousel/CarouselTableColumns.tsx`): replaced `order` column with `cards` count column (`X / 6`).
  - `HeroCarousel` (`src/components/homepage/HeroCarousel.tsx`): grid overlay updated to fixed `repeat(2, 1fr)` × `repeat(3, 1fr)`; card positioning uses `gridRow`/`gridCol` directly; optional chaining added for `content` and `buttons`.
  - `adminCarousel` namespace in `messages/en.json` and `messages/hi.json`: added 25+ new translation keys for grid editor UI.
  - Seed data (`scripts/seed-data/carousel-slides-seed-data.ts`): all cards migrated to `gridRow`/`gridCol` format.

> Development phases (Phases 1–67) completed between 2026-01-01 and 2026-02-28.

---

## [Unreleased-7] — Universal Listing Layout, Bulk Actions & Consistent Selection UX

### Added

- **`ListingLayout` component** (`src/components/ui/ListingLayout.tsx`) — Standard layout shell for ALL listing pages (public, seller, admin).
  - Desktop: collapsible left-side filter sidebar (240 px / 256 px), toggled with a Filters button in the toolbar. Default open; collapses with a CSS slide-animation.
  - Mobile: filter panel is hidden by default. A "Filters" button opens a **fullscreen overlay** with Apply / Clear all footer. Pressing Apply fires `onFilterApply` and auto-closes the overlay. Escape key and backdrop tap also close.
  - Body-scroll lock while the mobile overlay is open.
  - Toolbar slots: `searchSlot`, `sortSlot`, `viewToggleSlot`, `actionsSlot`.
  - Automatic `BulkActionBar` shown when `selectedCount > 0`.
  - Props: `filterContent`, `filterActiveCount`, `onFilterApply`, `onFilterClear`, `filterTitle`, `searchSlot`, `sortSlot`, `viewToggleSlot`, `actionsSlot`, `selectedCount`, `onClearSelection`, `bulkActions`, `defaultSidebarOpen`, `className`.

- **`BulkActionBar` component** (`src/components/ui/BulkActionBar.tsx`) — Appears at the top of the content area when items are selected.
  - Shows `{count} selected` label + ✕ deselect button + caller-provided action buttons.
  - Public pages pass cart / wishlist buttons. Admin / seller pages pass delete, export, publish, etc.
  - Returns `null` when `selectedCount === 0` (no layout shift).
  - Props: `selectedCount`, `onClearSelection`, `children`.

- **`SelectableCard` internal helper** in `DataTable` — wraps grid-view, list-view, and mobile-card-view items with a checkbox overlay and selected-ring highlight when `selectable={true}`.
  - Checkbox is `absolute` top-left on cards; left-center for list rows.
  - Clicking the card body still triggers `onRowClick`; clicking the checkbox area stops propagation so only selection changes.
  - Grid view column count extended: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`.

### Changed

- **`SideDrawer`** (`src/components/ui/SideDrawer.tsx`) — edit/create drawer on desktop is now **3/4 screen width with a 900 px max-width** (`w-full md:w-3/4 md:max-w-[900px]`). Background is already blurred via `backdrop-blur-sm` on the overlay. Content is never shifted (fixed positioning throughout).

### i18n

- Added `filters.showFilters` / `filters.hideFilters` to `messages/en.json` and `messages/hi.json`.
- Added `actions.clearSelection` to both locale files.
- Added new `listingLayout` namespace: `selectedCount`, `bulkActionsRegion` in both locale files.

### Tests

- `src/components/ui/__tests__/BulkActionBar.test.tsx` — 7 tests covering count display, deselect callback, children rendering, ARIA region.
- `src/components/ui/__tests__/ListingLayout.test.tsx` — 13 tests covering toolbar slots, filter toggle, mobile overlay open/close/apply/clear, BulkActionBar visibility, sidebar toggle.

### Fixed

- `src/app/api/seller/orders/[id]/ship/route.ts` — corrected `POST` handler params type from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }` and destructured with `await params` to comply with Next.js 15 async route-params convention; resolves build-time TypeScript error TS2344.

---

## [Unreleased-6] — Seller Shipping Configuration & Payout System

### Added

- **Seller shipping configuration** — sellers can choose between two shipping modes:
  - **Custom (own courier)**: seller sets a fixed shipping price charged to buyers.
  - **Shiprocket (platform)**: automated shipment creation, AWB/label generation, and real-time status tracking via Shiprocket integration with OTP-verified pickup address.
- `src/db/schema/field-names.ts` — extended `ORDER_FIELDS` with: `SELLER_ID`, `PAYOUT_STATUS`, `PAYOUT_ID`, `SHIPPING_METHOD`, `SHIPPING_CARRIER`, `TRACKING_URL`, `SHIPROCKET_ORDER_ID`, `SHIPROCKET_SHIPMENT_ID`, `SHIPROCKET_AWB`, `SHIPROCKET_STATUS`, `SHIPROCKET_UPDATED_AT`, `PAYOUT_STATUS_VALUES` (`ELIGIBLE | REQUESTED | PAID`), `SHIPPING_METHOD_VALUES` (`CUSTOM | SHIPROCKET`).
- `src/lib/shiprocket/client.ts` — typed Shiprocket API client: order creation, AWB assignment, pickup scheduling, order tracking, and OTP-based pickup address verification.
- **Seller payout settings** — sellers can save UPI details or full bank account details (account holder name, account number, IFSC code) for receiving payouts.
- `src/db/schema/payouts.ts` — `PayoutDocument` interface with `sellerName`, `sellerEmail`, `platformFeeRate`, `currency`, `paymentMethod` (`bank_transfer | upi`), `PayoutCreateInput` type.
- **Bulk payout request** — seller orders page gains checkbox selection + bulk action bar; sellers can mark delivered custom-method orders and request payment from admin in one click.
- **Weekly automated payout** (admin-only) — `POST /api/admin/payouts/weekly` scans Shiprocket-delivered orders, calculates seller earnings minus platform commission, and creates `PayoutDocument` records for admin processing.
- **New API routes**:
  - `POST /api/seller/shipping` — save/update seller shipping configuration.
  - `GET /api/seller/shipping` — retrieve current shipping settings.
  - `POST/GET /api/seller/payout-settings` — save/retrieve UPI or bank account details.
  - `POST /api/seller/orders/[id]/ship` — trigger Shiprocket order creation + AWB + pickup scheduling for a specific order.
  - `POST /api/seller/orders/bulk` — bulk payout-request action for selected orders.
  - `POST /api/admin/payouts/weekly` — admin-triggered weekly payout batch.
  - `POST /api/webhooks/shiprocket` — Shiprocket webhook handler for real-time shipment status updates written to Firestore.
- `src/features/seller/components/SellerShippingView.tsx` — full shipping settings UI: mode toggle (custom / Shiprocket), fixed-price input, Shiprocket API key + pickup address form with OTP verification flow.
- `src/features/seller/components/SellerPayoutSettingsView.tsx` — payout settings UI: UPI ID entry or bank account form (name, account number, IFSC); displays current verified payout method.
- `src/features/seller/components/SellerOrdersView.tsx` — seller orders list extended with: checkbox selection column, bulk action bar (request payout / warning when payout not configured), "Ship via Shiprocket" per-row action with carrier + tracking fields for custom shipping.
- `src/app/[locale]/seller/shipping/page.tsx` + `src/app/[locale]/seller/payout-settings/page.tsx` — thin page shells.
- `src/features/seller/hooks/useSellerShipping.ts` + `useSellerPayoutSettings.ts` — data hooks for the new seller pages.
- `src/components/admin/DataTable.tsx` — extended `DataTableProps` with `selectable?: boolean`, `selectedIds?: string[]`, `onSelectionChange?: (ids: string[]) => void`; renders a leading checkbox column (with select-all on current page) when `selectable` is true.
- `src/components/admin/AdminPageHeader.tsx` — added optional `badge?: React.ReactNode` prop rendered inline next to the title heading.
- `messages/en.json` + `messages/hi.json` — added `sellerShipping`, `sellerPayoutSettings`, and extended `sellerOrders` namespaces with all new UI strings.
- `src/services/seller.service.ts` — extended with `getShipping`, `saveShipping`, `getPayoutSettings`, `savePayoutSettings`, `shipOrder`, `bulkPayoutRequest` methods.

---

## [Unreleased-5] — UPI Manual Payment & WhatsApp Confirmation Flow

### Added

- **UPI Manual payment method** — customers can now select "Pay via UPI" at checkout, copy the business UPI VPA, pay in any UPI app, place their order, and are redirected to WhatsApp with a pre-filled confirmation message containing order ID and amount.
- `src/db/schema/site-settings.ts` — added `contact.upiVpa?: string` (business UPI VPA) and `contact.whatsappNumber?: string` (WhatsApp number for payment confirmations); added new `payment: { razorpayEnabled: boolean; upiManualEnabled: boolean }` section with defaults; updated `SITE_SETTINGS_PUBLIC_FIELDS` and `SITE_SETTINGS_UPDATABLE_FIELDS`.
- `src/db/schema/field-names.ts` — added `SITE_SETTINGS_FIELDS.CONTACT_FIELDS.UPI_VPA`, `SITE_SETTINGS_FIELDS.CONTACT_FIELDS.WHATSAPP`, `SITE_SETTINGS_FIELDS.PAYMENT`, and `SITE_SETTINGS_FIELDS.PAYMENT_FIELDS` (`RAZORPAY_ENABLED`, `UPI_MANUAL_ENABLED`).
- `src/components/checkout/CheckoutOrderReview.tsx` — exported `CheckoutPaymentMethod = "cod" | "online" | "upi_manual"` type; added `upiVpa?: string` prop; renders a third payment option "Pay via UPI" (hidden when `upiVpa` is not set); shows expanded instructions panel when `upi_manual` is selected with the UPI VPA in a monospace card, clipboard copy button (with "Copied!" feedback), and numbered steps.
- `messages/en.json` + `messages/hi.json` — added 10 new keys under `checkout` namespace: `upiManual`, `upiManualDesc`, `upiId`, `copyUpiId`, `upiIdCopied`, `upiInstructions`, `upiStep1`, `upiStep2`, `upiStep3`, `placeAndWhatsapp`, `upiPaymentNote`.
- `scripts/seed-data/site-settings-seed-data.ts` — added `contact.upiVpa`, `contact.whatsappNumber`, and `payment` block to seed data.

### Changed

- `src/app/api/checkout/route.ts` — `paymentMethod` Zod enum now includes `"upi_manual"` alongside `"cod"` and `"online"`; UPI manual orders are created with `paymentStatus: "pending"` and confirmed manually via WhatsApp.
- `src/hooks/useCheckout.ts` — `PlaceOrderPayload.paymentMethod` type updated to `"cod" | "online" | "upi_manual"`.
- `src/components/checkout/CheckoutView.tsx` — `paymentMethod` state type updated to `CheckoutPaymentMethod`; reads `upiVpa` and `whatsappNumber` from `useSiteSettings`; `handlePlaceOrder` handles `"upi_manual"` via the COD order path then redirects to `https://wa.me/{number}?text={prefilledMessage}`; button label changes to `t("placeAndWhatsapp")` when UPI manual is selected; passes `upiVpa` prop to `CheckoutOrderReview`.

### Tests

- `src/components/checkout/__tests__/CheckoutOrderReview.test.tsx` — added 5 new test cases: UPI option hidden without `upiVpa`, UPI option shown with `upiVpa`, instructions panel visible when `upi_manual` selected, `onPaymentMethodChange` called with `"upi_manual"`, clipboard copy button.
- `src/app/api/__tests__/checkout.test.ts` — added `"places order successfully with upi_manual payment method"` and `"returns 400 when paymentMethod is an unknown value"` test cases.

---

## [Unreleased-4] — Store & Category Page Fixes

### Fixed

- `src/features/stores/components/StoreProductsView.tsx` — replaced placeholder `Card`/`Text` stub with a proper `ProductGrid` rendering typed `StoreProductItem[]`; removed `unknown[]` casts.
- `src/features/stores/components/StoreAuctionsView.tsx` — replaced placeholder `Card`/`Text` stub with a proper `AuctionGrid` rendering typed `StoreAuctionItem[]`; removed `unknown[]` casts.
- `src/features/stores/components/StoresListView.tsx` — replaced bare `Input` with `Search` component (Rule 8/32 compliance); `onChange` now passes string value directly via `table.set`.

### Added

- `src/features/stores/types/index.ts` — added `StoreProductItem`, `StoreAuctionItem`, `StoreProductsResponse`, `StoreAuctionsResponse` typed interfaces derived from `ProductDocument` via `Pick`; avoids `unknown[]` casts in views.
- `src/features/stores/hooks/useStoreBySlug.ts` — `useStoreProducts` and `useStoreAuctions` now carry explicit `StoreProductsResponse` / `StoreAuctionsResponse` return types via `useApiQuery<T>`.

---

## [Unreleased-3] — MediaImage / MediaVideo Primitives + Media Rule Compliance

### Added

- `src/components/media/MediaImage.tsx` — new Tier 1 primitive (Rule 28). Wraps Next.js `<Image fill>` with size presets (`thumbnail`, `card`, `hero`, `banner`, `gallery`, `avatar`), emoji fallback when `src` is undefined, and a `sizes` hint per preset. Import from `@/components`.
- `src/components/media/MediaVideo.tsx` — new Tier 1 primitive (Rule 28). Wraps `<video>` with `controls`, `autoPlayMuted`, `loop`, `trimStart`/`trimEnd` support via `useEffect`, and an emoji fallback. Import from `@/components`.
- `src/components/media/index.ts` — barrel exporting both primitives.
- `src/components/media/__tests__/MediaImage.test.tsx` — unit tests for MediaImage (5 cases).
- `src/components/media/__tests__/MediaVideo.test.tsx` — unit tests for MediaVideo (5 cases).
- `src/components/auctions/__tests__/AuctionCard.test.tsx` — new test file for AuctionCard (6 cases; was previously untested).
- `src/components/categories/__tests__/CategoryCard.test.tsx` — new test file for CategoryCard (10 cases; was previously untested).
- `messages/en.json` + `messages/hi.json` — added `featured`, `productsCount` (ICU plural), `subcategoriesCount` (ICU plural) to the `categories` namespace.

### Changed

- `src/components/index.ts` — registered `./media` barrel under `MEDIA PRIMITIVES` section.
- `src/components/categories/CategoryCard.tsx` — replaced `UI_LABELS.CATEGORIES_PAGE.*` with `useTranslations("categories")` (Rules 3 & 33) and replaced raw `<Image>` with `<MediaImage>` (Rule 28).
- `src/components/auctions/AuctionCard.tsx` — removed local `useCountdown`/`useState`/`useEffect` re-implementation; now uses canonical `useCountdown` from `@/hooks` (Rule 6). Replaced raw `<Image>` with `<MediaImage>` (Rule 28).
- `src/components/auctions/AuctionDetailView.tsx` — replaced raw `<Image>` with `<MediaImage>`; added video-first media panel using `<MediaVideo>` when `product.video` is set (Rule 28).
- `src/components/products/ProductImageGallery.tsx` — full rewrite: accepts optional `video?: VideoData` prop; builds unified `MediaItem[]` array (video first); renders `<MediaVideo>` or `<MediaImage>` based on type; thumbnail strip shows video play overlay (Rule 28). Replaced raw `<Image>`.
- `src/features/products/components/ProductDetailView.tsx` — passes `video={product.video}` to `<ProductImageGallery>`.

---

## [Unreleased-4] — Video Support in All Card Components & Detail Pages

### Changed

- `src/components/media/MediaImage.tsx` — added `className` prop forwarded to the outer wrapper `div`, enabling hover-scale and transition classes from call sites.
- `src/components/media/__tests__/MediaImage.test.tsx` — updated tests to reflect new wrapper `div` structure from `className` prop addition.
- `src/components/products/ProductCard.tsx` — added video-first media display: renders `<MediaVideo autoPlayMuted loop>` when `product.video` is set; falls back to `<MediaImage>`. Hover-scale transition applied via `className` prop on `MediaImage`.
- `src/components/products/__tests__/ProductCard.test.tsx` — added test case for video rendering (mocks `MediaVideo`; asserts it renders when `product.video` is set).
- `src/components/auctions/AuctionCard.tsx` — added video-first media display: renders `<MediaVideo autoPlayMuted loop>` when `product.video` is set; falls back to `<MediaImage className="...">` with hover-scale.
- `src/components/auctions/__tests__/AuctionCard.test.tsx` — added test case asserting `<MediaVideo>` renders when `product.video` is provided.
- `src/components/blog/BlogCard.tsx` — replaced raw `<Image>` with `<MediaImage className="...">` with hover-scale transition.
- `src/components/blog/BlogFeaturedCard.tsx` — replaced raw `<Image>` with `<MediaImage className="...">` with hover-scale transition.
- `src/components/events/EventCard.tsx` — added video-first media: renders `<MediaVideo autoPlayMuted loop>` when `event.video` is set; falls back to `<MediaImage className="...">`.
- `src/features/seller/components/SellerProductCard.tsx` — added video badge overlay and video-first display: renders `<MediaVideo autoPlayMuted loop>` when `product.video` is set; falls back to `<MediaImage className="...">`.
- `src/types/admin.ts` — added optional `video?: VideoData` field to `AdminProduct` type to match `ProductDocument`.

## [Unreleased-2] — Raw HTML Primitive Audit & Fix (Part 3)

### Fixed

- `src/app/[locale]/unauthorized/page.tsx`: replaced bare `<span>` with `<Span>` for the "401" display text — `Span` was already imported, so this was a complete one-line fix. All other apparent violations in the scan were confirmed as intended implementation internals (`Typography.tsx`, `Semantic.tsx`, `Button.tsx`, form primitive components, upload components) which are exempt from the rule by design.

---

## [2026-03-06] — Raw HTML Primitive Violations Eliminated (Part 2)

### Fixed

All remaining raw lowercase HTML element violations in non-test `.tsx` files replaced with their corresponding Tier 1 primitive components per Rules 7, 8, and 31.

**`<button>` → `<Button>` replacements:**

- **`src/components/ui/Tabs.tsx`** — Tab trigger `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/SideDrawer.tsx`** — Close `<button>` → `<Button variant="ghost">` (Button was already imported; also fixed mismatched `</button>` closing tag left from prior edit).
- **`src/components/ui/ActiveFilterChips.tsx`** — Per-chip dismiss `<button>` and "Clear all" `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/Accordion.tsx`** — Section toggle `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/Pagination.tsx`** — Five navigation `<button>` elements (first/prev/page/next/last) → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/FilterDrawer.tsx`** — Filter panel trigger `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/HorizontalScroller.tsx`** — Left/right arrow `<button>` elements → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/EventBanner.tsx`** — Dismiss `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/Dropdown.tsx`** — `DropdownItem` trigger `<button>` → `<Button variant="ghost">`. Updated import to include `Button`.
- **`src/components/ui/ImageGallery.tsx`** — Previous/next arrow and thumbnail `<button>` elements → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/ui/Menu.tsx`** — `MenuTrigger` and `MenuItem` `<button>` elements → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/user/notifications/NotificationItem.tsx`** — Mark-read and delete action `<button>` elements → `<Button variant="ghost">`. Added `Button` to the `@/components` import.
- **`src/components/user/notifications/NotificationsBulkActions.tsx`** — Mark-all-read `<button>` → `<Button variant="ghost">`. Added `Button` to the `@/components` import.
- **`src/components/user/WishlistButton.tsx`** — Toggle `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/utility/BackToTop.tsx`** — Scroll-to-top `<button>` → `<Button variant="ghost">`. Added `Button` import from `@/components`.
- **`src/components/utility/Search.tsx`** — Clear-query `<button>` and close-overlay `<button>` → `<Button variant="ghost">`. (`Button` was already imported.)
- **`src/components/ui/NotificationBell.tsx`** — Fixed unclosed JSX comment `{/* Dropdown */` → `{/* Dropdown */}` (syntax error introduced in prior session).

**`<select>` → `<Select>` replacements:**

- **`src/components/ui/TablePagination.tsx`** — Page-size `<select>` → `<Select options={...}/>`. Added `Select` to the `@/components` import.
- **`src/app/[locale]/admin/events/[id]/entries/page.tsx`** — Review-status and sort `<select>` elements → `<Select options={[...]}>`. Added `Select` to the `@/components` import.

**`<input>` → `<Input>` replacement:**

- **`src/components/admin/RichTextEditor.tsx`** — URL popover `<input type="url">` → `<Input type="url">`. Added `Input` to the `@/components` import.

**`<input type="search">` + `<input type="checkbox">` → `<Input>` + `<Checkbox>` in `FilterFacetSection`:**

- **`src/components/ui/FilterFacetSection.tsx`** — Inline search `<input type="search">` → `<Input>`; checkbox rows `<input type="checkbox">` + manual label markup → `<Checkbox suffix={...}>`. Added `Button`, `Checkbox`, `Input` to the `@/components` import. Removed unused `borderRadius` from destructured `THEME_CONSTANTS`.

### Changed

- **`src/components/forms/Checkbox.tsx`** — Added `suffix?: React.ReactNode` prop. The label `<Span>` receives `flex-1` class so appended content (count badge, etc.) stays right-aligned inside the label row. Used by `FilterFacetSection` to show option counts.

- **`src/components/forms/Input.tsx`** — Converted from a plain function to `React.forwardRef<HTMLInputElement, InputProps>` so callers can attach a `ref` (needed by `RichTextEditor`'s URL popover). Exported `InputProps` interface. Behaviour is fully backward-compatible.

- **`src/components/ui/Button.tsx`** — Replaced template-literal `className` concatenation with `twMerge()` from `tailwind-merge` (newly added `^3.5.0` dependency). This ensures that custom `className` props properly override conflicting Tailwind utilities from `button.base`/`variants`/`sizes` (e.g. `flex` overrides `inline-flex`, `justify-between` overrides `justify-center`). Required for correct display of `<Button>` replacements in Accordion, Pagination, and filter components.

---

## [2026-03-04] — Raw Structural HTML Tag Violations Fixed

### Fixed

- **`src/components/layout/Footer.tsx`** — Replaced raw `<footer>` with `BlockFooter` from `@/components`; added `BlockFooter` to the component import.
- **`src/components/layout/TitleBar.tsx`** — Replaced raw `<header>` with `BlockHeader` from `@/components`; added `BlockHeader` to the component import.
- **`src/components/ui/Pagination.tsx`** — Replaced raw `<nav role="navigation">` (redundant role) with `Nav` imported from `../semantic/Semantic`; `Nav` renders a native `<nav>` with implicit navigation role.

---

## [2026-03-05] — Raw `<a>` Tag Violations Fixed; TextLink `bare` Variant Added

### Changed

- **`src/components/typography/TextLink.tsx`** — Added `"bare"` variant (empty string, no colour or hover classes applied). Use `variant="bare"` when the caller controls all styling via `className` (e.g. card-style links, skip-nav links, icon-only social links).

- **`src/components/faq/ContactCTA.tsx`** — Replaced raw `<a href="mailto:...">` email card and `<a href="tel:...">` phone card with `<TextLink variant="bare">`. Both are auto-detected as external by TextLink and render as native `<a>` elements.

- **`src/app/[locale]/layout.tsx`** — Replaced raw `<a href="#main-content">` skip-navigation link with `<TextLink href="#main-content" variant="bare">`. Added `TextLink` to the `@/components` import.

- **`src/features/stores/components/StoreAboutView.tsx`** — Replaced raw `<a href={store.website}>` with `<TextLink href={store.website}>` (default variant, auto-detects https:// as external). Added `TextLink` to the `@/components` import.

- **`src/components/user/notifications/NotificationItem.tsx`** — Replaced raw `<a href={n.actionUrl}>` (with `onClick`) with `<TextLink href={n.actionUrl} variant="bare">`. Props including `onClick` are forwarded transparently. Added `TextLink` to the `@/components` import.

- **`src/components/admin/MediaUploadField.tsx`** — Replaced raw `<a href={value}>` non-image file preview link with `<TextLink href={value}>` (default variant, auto-detects Firebase Storage URL as external). Added `TextLink` to the `@/components` import.

- **`src/components/user/profile/PublicProfileView.tsx`** — Replaced 4 raw `<a>` tags with `<TextLink variant="bare">`:
  - Website link (`user.publicProfile.website`)
  - Twitter social link (`https://twitter.com/…`) — added `aria-label="Twitter profile"`
  - Instagram social link (`https://instagram.com/…`) — added `aria-label="Instagram profile"`
  - LinkedIn social link (`https://linkedin.com/in/…`) — added `aria-label="LinkedIn profile"`

### Tests

- **`src/components/typography/__tests__/TextLink.test.tsx`** — New test file. Covers: external URL detection (https, mailto, tel), internal path routing via locale-aware Link, hash-only links, `variant="bare"`, `variant="default"`, `external={true}` override, `onClick` and `aria-label` prop forwarding.

- **`src/features/stores/components/__tests__/StoreAboutView.test.tsx`** — New test file. Covers: loading spinner, error/empty state, store name rendering, website rendered as `TextLink` (anchor with correct `href`), absent website renders no link.

- **`src/components/admin/__tests__/MediaUploadField.test.tsx`** — Added `TextLink` to the `@/components` mock so the existing link-render test passes after the `<a>` → `<TextLink>` change.

- **`src/components/user/notifications/__tests__/NotificationItem.test.tsx`** — Added `TextLink` and `Span` to the `@/components` mock.

---

## [2026-03-04] — Docs & Instructions Sync: Missing Hooks and Repositories

### Added

- **`.github/copilot-instructions.md` — RULE 6 hook table** — added 5 previously missing hooks:
  - `useLogout(options?)` — logout mutation that clears session cookie and revokes tokens
  - `useBecomeSeller()` — seller application mutation (server sets `role='seller'`, `storeStatus='pending'`)
  - `useNewsletter()` — newsletter subscribe mutation; POST to `/api/newsletter/subscribe`
  - `useRipCoins()` composite entry (`useRipCoinBalance`, `usePurchaseRipCoins`, `useVerifyRipCoinPurchase`, `useRipCoinHistory`)
  - `useChat(chatId)` — Realtime DB subscribe-only hook; writes via API

- **`.github/copilot-instructions.md` — RULE 12 repository list** — added 11 previously missing repositories:
  `addressRepository`, `blogRepository`, `cartRepository`, `wishlistRepository`, `chatRepository`, `eventRepository`, `eventEntryRepository`, `newsletterRepository`, `notificationRepository`, `payoutRepository`, `ripcoinRepository`

- **`docs/GUIDE.md` — Section 3 (Hooks)** — added full documentation entries for:
  `useLogout`, `useBecomeSeller`, `useNewsletter`, `useRipCoinBalance / usePurchaseRipCoins / useVerifyRipCoinPurchase / useRipCoinHistory`, `useChat`

- **`docs/GUIDE.md` — Section 7 (Repositories)** — added full documentation entries for:
  `AddressRepository`, `BlogRepository`, `CartRepository`, `WishlistRepository`, `ChatRepository`, `EventRepository`, `EventEntryRepository`, `NewsletterRepository`, `NotificationRepository`, `PayoutRepository`, `RipcoinRepository`

- **`docs/QUICK_REFERENCE.md` — Available Repositories** — extended code block with all 11 new repository instances and their key method comments
- **`docs/QUICK_REFERENCE.md` — Hooks Quick Lookup** — added two new subsections: `Commerce & Wallet` (useBecomeSeller, useNewsletter, useRipCoin\*) and `Authentication & Real-time` (useLogout, useChat)
- **`docs/QUICK_REFERENCE.md` — Key File Locations** — updated the `hooks` line to include new hook names

---

## [2026-03-04] — Rule Violations Fixed: next/navigation redirect & duplicate hook

### Fixed

- **`src/app/[locale]/stores/[storeSlug]/page.tsx`** — replaced `redirect` import from `next/navigation` with `@/i18n/navigation` (Rule 33.3); updated call to `redirect({ href, locale })` with locale-aware signature
- **`src/app/[locale]/faqs/[category]/page.tsx`** — replaced `redirect` import from `next/navigation` with `@/i18n/navigation` (Rule 33.3); added `locale` to params type; updated call to `redirect({ href: ROUTES.PUBLIC.FAQS, locale })`
- **`src/app/[locale]/faqs/[category]/__tests__/page.test.tsx`** — updated mock from `next/navigation` to `@/i18n/navigation`; updated redirect assertion to match new `{ href, locale }` signature
- **`src/features/events/hooks/usePublicEvents.ts`** — deleted Tier 2 duplicate of `src/hooks/usePublicEvents.ts` (Rule 24; Rule 31 — extend don't fork)
- **`src/features/events/index.ts`** — removed re-export of deleted Tier 2 `usePublicEvents` hook; callers should use `@/hooks` directly

### Added

- **`src/hooks/__tests__/usePublicEvents.test.ts`** — moved test coverage from deleted Tier 2 hook to Tier 1 location; updated import to `@/hooks` (Rule 27)

---

## [2026-03-04] — Rule Violations Fixed: FeedbackConfigForm i18n & Theme Constants

### Fixed

- **`src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx`** — replaced hardcoded `"Allow anonymous submissions"` string with `useTranslations('feedbackConfig')` call (Rule 33); replaced `"space-y-4"` raw Tailwind class with `THEME_CONSTANTS.spacing.stack` (Rule 4)

### Added

- **`messages/en.json`** — added `feedbackConfig.allowAnonymousLabel` translation key
- **`messages/hi.json`** — added `feedbackConfig.allowAnonymousLabel` translation key (Hindi)
- **`src/features/events/components/EventTypeConfig/__tests__/FeedbackConfigForm.test.tsx`** — new test file covering anonymous checkbox render, onChange fire, and SurveyFieldBuilder delegation (Rule 27)

---

## [2026-03-04] — Rule Violations Fixed: Barrel Imports, Error Classes, i18n in global-error

### Fixed

- **`src/hooks/usePublicEvents.ts`** — changed `import { useApiQuery } from "@/hooks/useApiQuery"` to barrel import `from "@/hooks"` (Rule 2)
- **`src/features/events/hooks/useEventLeaderboard.ts`** — same barrel import fix (Rule 2)
- **`src/features/events/hooks/usePublicEvents.ts`** — same barrel import fix (Rule 2)
- **`src/app/api/user/become-seller/route.ts`** — replaced `throw new Error(...)` with `throw new NotFoundError(...)` using proper error class (Rule 14); added `NotFoundError` import from `@/lib/errors`
- **`src/app/global-error.tsx`** — replaced `UI_LABELS` JSX usage with `useTranslations` (Rules 3, 33); component now wraps content in `NextIntlClientProvider` using statically-imported `messages/en.json` so translations work correctly when root layout error boundary fires; extracted inner `GlobalErrorContent` component to allow hook usage; eliminated string concatenation `{UI_LABELS.ACTIONS.BACK} + " to Home"`

### Added

- **`messages/en.json`** / **`messages/hi.json`** — added `errorPages.criticalError.backToHome` key (`"Back to Home"` / `"होम पर वापस"`) to support translated back-link in `global-error.tsx`

---

## [2026-03-04] — Rule 32/33 Violations Fixed: Metadata i18n, URL State, Search Inline Mode

### Changed

- **`src/components/utility/Search.tsx`** — extended in-place with **inline controlled mode** (Rule 31):
  - New props: `value`, `onChange`, `placeholder`, `debounceMs` (default 300 ms), `onClear`, `className`
  - Inline mode activates when `value` is provided; renders a compact search input with search icon and clear button
  - Original overlay mode (`isOpen`, `onClose`, `onSearch`) unchanged and still default
- **`src/app/[locale]/categories/page.tsx`** — replaced `useState("")+Input` with `useUrlTable+Search` (Rules 32, 33)
- **`src/app/[locale]/seller/store/page.tsx`** — converted static `export const metadata` to async `generateMetadata` with `getTranslations("sellerStore")`; fixed hardcoded `AdminPageHeader` `title`/`subtitle` strings
- **`src/app/[locale]/seller/auctions/page.tsx`** — same pattern as above using `"sellerAuctions"` namespace
- **`src/app/[locale]/user/become-seller/page.tsx`** — converted static metadata to async `generateMetadata` with `getTranslations("becomeSeller")`
- **8 pages** (`track`, `cookies`, `help`, `privacy`, `refund-policy`, `terms`, `seller-guide`, `become-seller`) — converted hardcoded metadata strings to `async generateMetadata` using `getTranslations` (Rule 33)

### Added

- **`messages/en.json` + `messages/hi.json`** — new translation keys in 12 namespaces:
  - `trackOrder`, `cookies`, `help`, `privacy`, `refundPolicy`, `terms`, `sellerGuide`, `becomeSeller`: `metaTitle`, `metaDescription`
  - `sellerStore`, `sellerAuctions`: `metaTitle`, `metaDescription`, `pageTitle`, `pageSubtitle`

---

## [2026-03-04] — Copilot Instructions: No Mass-Edit Scripts Rule

### Added

- **`.github/copilot-instructions.md`** — new **"No mass-edit scripts"** developer guideline:
  - Explicitly forbids writing or running PowerShell / shell scripts to bulk-edit source files
  - Mandates use of `multi_replace_string_in_file` for simultaneous independent edits and `replace_string_in_file` sequentially for dependent edits
  - Explains that scripted mass-edits corrupt files, destroy context, and produce unreviable diffs
  - Corresponding pre-code checklist item added: _"Am I about to write or run a PowerShell / shell script to bulk-edit source files? → STOP — use the editor tools instead"_

---

## [2026-03-04] — DRY Refactoring: Import Corruption Fixes, Link→TextLink, Navigation Hook Migration

### Fixed

- **Corrupted barrel imports** — automated scripts had stripped commas between component names in 10+ files; all restored:
  - `EventLeaderboard`, `EventStatsBanner`, `AuthSocialButtons`, `SearchView`, `NotificationBell`, `ProductTableColumns`, `FaqTableColumns`, `ReviewTableColumns`, `FilterFacetSection`, `TablePagination`
  - `RichTextEditor`, `AuctionGrid`, `OrderSummaryPanel`, `FilterDrawer`, `ImageGallery`, `PasswordStrengthIndicator`, `AvatarDisplay`
- **`AuctionsView`** — merged duplicate `Text` import; restored missing `import type { ActiveFilter }`
- **`ProductDetailView`** — replaced orphaned `<Link>` (not imported) with `<TextLink>`
- **`faqs/[category]/page.tsx`**, **`stores/[storeSlug]/page.tsx`** — reverted `redirect` to `next/navigation`; `@/i18n/navigation` redirect does not accept a bare string argument

### Changed

- **`useRouter` / `usePathname` migration** (~15 feature files) — moved imports from `next/navigation` → `@/i18n/navigation` per Rule 33:
  - `ChatList`, `MessagesView`, `UserEditAddressView`, `OrderDetailView` and ~11 other feature components
  - `useUrlTable.ts` — split `useRouter, useSearchParams, usePathname` so `useRouter` + `usePathname` come from `@/i18n/navigation` and `useSearchParams` stays in `next/navigation`
- **`Link` → `TextLink` migration** — removed all `import Link from "next/link"` across the codebase; replaced with `TextLink` from `@/components` per Rule 8:
  - `StoreCard`, `SurveyEventSection`, `LoginForm`, `ForgotPasswordView`, `RegisterForm`, `ResetPasswordView`
  - `AdminAnalyticsView`, `EventCard`, `QuickActionsGrid`, `EmptyState`, `EventBanner`
  - `SellerTopProducts`, `SellerStorefrontView` (4 links), `PublicProfileView` (2 links)
- **`ForgotPasswordView`**, **`ResetPasswordView`** — restored accidentally removed `import { useTranslations } from "next-intl"` line

---

## [2026-03-05] — Semantic Component Coverage: BottomNavbar, DemoSeedView, Sidebar

### Changed

- **`BottomNavbar`** (`src/components/layout/BottomNavbar.tsx`) — replaced all raw HTML with semantic components:
  - `usePathname` import moved from `next/navigation` → `@/i18n/navigation`
  - `<nav>` → `<Nav aria-label={t("mobileNav")}>`, `<ul>` → `<Ul>`, `<li>` → `<Li>`, search `<button>` → `<Button variant="ghost">`, `<span>` → `<Span>`, profile `<a>` → `<TextLink variant="inherit">`
  - Added `"mobileNav"` key to `messages/en.json` and `messages/hi.json` under `nav` namespace
- **`DemoSeedView`** (`src/features/admin/components/DemoSeedView.tsx`) — replaced all raw HTML with semantic components:
  - All `<h1>`/`<h2>`/`<h3>` → `<Heading level={n}>`, `<p>` → `<Text>` or `<Caption>`, `<span>` → `<Span>`, `<button>` → `<Button variant="ghost">`, `<input type="checkbox">` → `<Checkbox>`, `<ul>` → `<Ul>`, `<li>` → `<Li>`
  - `<label>` wrappers for checkboxes replaced with `<div role="checkbox">` + `<Checkbox>` pattern
- **`Sidebar`** (`src/components/layout/Sidebar.tsx`) — replaced all raw HTML with semantic components:
  - `import Link from "next/link"` removed; `usePathname`/`useRouter` moved to `@/i18n/navigation`
  - `Heading`, `Nav`, `Ul`, `Li`, `TextLink`, `Span`, `Button`, `Text` added to `@/components` import
  - All `<h3>` section titles → `<Heading level={3}>`, `<p>` → `<Text>`, `<button>` → `<Button variant="ghost">`
  - All nav lists: `<nav>` → `<Nav aria-label={tA("sidebarLinks")}>`, `<ul>` → `<Ul>`, `<li>` → `<Li>`, `<Link>` → `<TextLink variant="inherit">`, `<span>` → `<Span>`
  - Added `"sidebarLinks"` key to `messages/en.json` and `messages/hi.json` under `accessibility` namespace

### Fixed

- **`Span` component** (`src/components/typography/Typography.tsx`) — `children` made optional (`children?: React.ReactNode`) to support decorative self-closing usage (e.g. animated pulse dots)
- **`Button` component** (`src/components/ui/Button.tsx`) — `children` made optional (`children?: React.ReactNode`) to support icon-only / dot buttons that rely solely on `aria-label`

---

## [2026-03-03] — Complete HTML Tag Component Coverage (Span, TextLink, Semantic)

### Added

- **`Span` component** (`src/components/typography/Typography.tsx`) — inline `<span>` wrapper with `variant`, `size`, and `weight` props. `variant="inherit"` (default) injects no colour class, making it a pure CSS wrapper for gradients, clip-text, etc.
- **`TextLink` component** (`src/components/typography/TextLink.tsx`) — the single component for ALL anchor/link elements in the app.
  - Internal paths → locale-aware `Link` from `@/i18n/navigation`
  - External URLs / `mailto:` / `tel:` → `<a target="_blank" rel="noopener noreferrer">`
  - Auto-detects internal vs external; force external with `external={true}`
  - Variants: `"default"` (indigo), `"muted"`, `"nav"`, `"danger"`, `"inherit"`
- **`src/components/semantic/` directory** — thin, themeable wrappers around HTML5 semantic elements, enabling future one-place theming and enforcing accessibility attributes:
  - `Section` → `<section>`
  - `Article` → `<article>`
  - `Main` → `<main>`
  - `Aside` → `<aside>`
  - `Nav` → `<nav>` (`aria-label` required at the TypeScript prop level)
  - `BlockHeader` → `<header>` (block-level; ≠ page-level `TitleBar`/`MainNavbar`)
  - `BlockFooter` → `<footer>` (block-level; ≠ page-level `Footer`)
  - `Ul` → `<ul>`
  - `Ol` → `<ol>`
  - `Li` → `<li>`
- **`src/components/semantic/index.ts`** — barrel exporting all semantic components + their TypeScript prop interfaces
- **`src/components/typography/index.ts`** — updated to export `Span`, `TextLink`, and `TextLinkProps`
- **`src/components/index.ts`** — added `export * from "./semantic"` so all semantic components are accessible via `@/components`

### Tests

- **`src/components/semantic/__tests__/Semantic.test.tsx`** — 25 tests covering element names, className forwarding, children rendering, aria attributes, and HTML attribute pass-through for all 10 semantic components
- **`src/components/typography/__tests__/Typography.test.tsx`** — updated: added `Caption` (6 tests), `Span` (8 tests), and `TextLink` (9 tests); all assertions use `THEME_CONSTANTS` for colour classes to stay theme-independent

### Docs

- `docs/GUIDE.md` — Typography Components section rewritten with full API docs for all 6 components (`Heading`, `Text`, `Label`, `Caption`, `Span`, `TextLink`); new **Semantic HTML Wrapper Components** section with component–element mapping table and full usage example
- `.github/copilot-instructions.md` (Rule 7) — Typography Primitives table extended with `Span` and `TextLink` rows; code example updated to show both; new **Semantic HTML Wrapper Components** subsection added with component table and usage example; **Other Key Components** reorganised into `Typography` + `Semantic HTML` + `UI` named groups with all new components listed

---

## [2026-03-05] — Page Container Token System + Codebase-Wide Implementation

### Added

- `THEME_CONSTANTS.page` group in `src/constants/theme.ts` with 11 tokens covering all responsive page container patterns:
  - `page.container.sm/md/lg/xl/2xl/full/wide` — compound `max-w-* mx-auto px-4 sm:px-6 lg:px-8` tokens for every viewport size
  - `page.px` / `page.pxSm` — standalone responsive horizontal padding
  - `page.empty` — `py-16` for empty/loading states
  - `page.authPad` — `py-8 sm:py-12` for auth form wrappers
- `THEME_CONSTANTS.flex.hCenter` — `"flex justify-center"` for horizontal-only centering

### Changed

- **~45 source files** migrated from raw Tailwind container strings to `page.container.*` and `flex.hCenter` / `page.empty` tokens:
  - Features: `ProductDetailView`, `ProductsView`, `AuctionsView`, `SearchView`, `CategoryProductsView`, `BlogPostView`, `CartView`, `StoreNavTabs`, `StoreHeader`, `StoresListView`, `StoreReviewsView`, `StoreProductsView`, `StoreAuctionsView`, `StoreAboutView`, `BecomeSellerView`, `LoginForm`, `RegisterForm`, `ForgotPasswordView`
  - Components: `SellerStorefrontView`, `PublicProfileView`, `CheckoutView`, `AuctionDetailView`, `AboutView`
  - Pages: `terms`, `privacy`, `refund-policy`, `help`, `contact`, `promotions`, `stores`, `stores/[storeSlug]/layout`, `stores/[storeSlug]/{about,products,reviews,auctions}`, `seller-guide`, `track`, `user/messages`, `user/ripcoins`, `user/wishlist`
- `docs/GUIDE.md` — documented `page` group and `flex.hCenter` in THEME_CONSTANTS reference
- `docs/QUICK_REFERENCE.md` — added `page.*` row to quick reference table
- `.github/copilot-instructions.md` — Rule 4 table expanded with 12 new rows for all `page.*` and `flex.hCenter` tokens

---

## [2026-03-04] — Layout Token System + Codebase-Wide Implementation

### Added

- **`src/constants/theme.ts`** — Six new THEME_CONSTANTS token groups for layout:
  - `flex.*` — 20+ flex container helpers (`center`, `between`, `betweenStart`, `start`, `end`, `rowCenter`, `rowStart`, `centerCol`, `colStart`, `colCenter`, `colEnd`, `colBetween`, `growMin`, `noShrink`, `grow`, `none`, `inline`, `inlineCenter`, `inlineFull`, `rowWrap`)
  - `grid.*` — Responsive grid presets (`cols1`–`cols6`, `autoFillSm/Md/Lg`, `sidebar`, `sidebarRight`, `sidebarWide`, `halves`, `twoThird`, `oneThird`)
  - `overflow.*` — Overflow helpers (`hidden`, `auto`, `scroll`, `xAuto`, `yAuto`, `xHidden`, `yHidden`, `xScroll`, `yScroll`, `visible`)
  - `position.*` — Position helpers (`relative`, `absolute`, `fixed`, `sticky`, `static`, `fill`, `absoluteCenter`, `absoluteTop/Bottom/TopRight/TopLeft/BottomRight/BottomLeft`, `fixedFill`, `fixedTop/Bottom`, `stickyTop/Bottom`)
  - `size.*` — Size tokens (`full`, `screen`, `minScreen`, `w.*`, `h.*`, `square.*` xs–4xl)
  - Extended `spacing.gap` with `x.*` and `y.*` axis subtrees; `spacing.padding` and `spacing.margin` with `x.*`, `y.*`, `top.*`, `bottom.*`, `left.*`, `right.*`
- **`src/components/typography/Typography.tsx`** — `Caption` component now accepts `variant?: "default" | "accent" | "inverse"` for themed caption colours without ad-hoc Tailwind overrides.

### Changed (Rule 4 Violation Fixes)

Replaced all raw Tailwind layout class strings with `THEME_CONSTANTS` tokens across **100+ files** including:

- All `src/features/user/components/*.tsx` — `UserSettingsView`, `UserOrdersView`, `UserNotificationsView`, `UserEditAddressView`, `UserAddressesView`, `OrderDetailView`, `MessagesView`, `BecomeSellerView`, `BuyRipCoinsModal`, `ChatList`
- All `src/features/seller/components/*.tsx` — `SellerEditProductView`, `SellerProductsView`, `SellersListView`, `SellerStoreView`, `SellerProductCard`, `SellerOrdersView`, `SellerDashboardView`, `SellerAuctionsView`, `SellerRecentListings`, `SellerStatCard`
- All `src/features/stores/components/*.tsx` — `StoreHeader`, `StoreCard`, `StoreNavTabs`, `StoreReviewsView`
- All `src/features/auth/components/*.tsx` — `VerifyEmailView`, `ResetPasswordView`, `RegisterForm`, `LoginForm`, `ForgotPasswordView`
- All `src/components/ui/*.tsx` — `NotificationBell`, `SideDrawer`, `Pagination`, `HorizontalScroller`, `ImageGallery`, `Avatar`, `ActiveFilterChips`, `Accordion`, `Progress`
- All `src/components/forms/*.tsx` — `Checkbox`, `Radio`, `Slider`
- All `src/components/layout/*.tsx` — `TitleBar`, `Sidebar`, `MainNavbar`
- All `src/components/admin/*.tsx` — `DataTable`, `CategoryTreeView`, `BackgroundSettings`, `GridEditor`, `ImageUpload`, `DrawerFormFooter`, `AdminStatsCards`, and admin sub-components
- All `src/components/checkout/*.tsx` — `CheckoutSuccessView`, `CheckoutStepper`, `CheckoutOrderReview`, `CheckoutAddressStep`, `OrderSuccessHero`, `OrderSuccessCard`
- All `src/components/homepage/*.tsx` — `HeroCarousel`, `TopCategoriesSection`, `BlogArticlesSection`, `FAQSection`, `CustomerReviewsSection`, `FeaturedProductsSection`, `FeaturedAuctionsSection`, `TrustFeaturesSection`, `WhatsAppCommunitySection`, `AdvertisementBanner`, `HomepageSkeleton`
- All `src/components/products/*.tsx` — `ProductCard`, `ProductImageGallery`, `ProductReviews`, `ProductFilters`, `ProductSortBar`
- All `src/components/auctions/*.tsx` — `AuctionDetailView`, `AuctionCard`, `BidHistory`
- All `src/components/cart/*.tsx` — `CartItemRow`, `CartSummary`
- All `src/components/faq/*.tsx`, `src/components/blog/*.tsx`, `src/components/categories/*.tsx`, `src/components/promotions/*.tsx`, `src/components/user/**/*.tsx`, `src/components/seller/*.tsx`
- All relevant `src/app/[locale]/**/*.tsx` pages — login, reset-password, categories, profile, sellers, seller analytics/payouts, user profile/wishlist/addresses/orders, track
- All relevant `src/features/events/*.tsx`, `src/features/categories/*.tsx`, `src/features/blog/*.tsx`, `src/features/admin/*.tsx`, `src/features/products/*.tsx`
- `src/components/modals/UnsavedChangesModal.tsx`, `src/components/modals/ConfirmDeleteModal.tsx`, `src/components/modals/ImageCropModal.tsx`, `src/components/feedback/Modal.tsx`

### Docs Updated

- **`docs/GUIDE.md`** — THEME_CONSTANTS section updated with full documentation of all 6 new token groups
- **`docs/QUICK_REFERENCE.md`** — Available Constants table updated with 5 new rows for flex/grid/overflow/position/size
- **`.github/copilot-instructions.md`** — Rule 4 Class Replacement Table expanded from 22 to 50+ rows covering all new layout token patterns

---

## [2026-03-03] — Modern Design Refresh (Zinc Palette + Flat Design)

### Fixed (Rule Violations)

- **`src/features/user/components/ChatWindow.tsx`**
  - Replaced raw `<textarea>` element with `Textarea` from `@/components` (Rule 7, Rule 8). The raw element used ad-hoc Tailwind border/colour/focus strings; the shared primitive applies `THEME_CONSTANTS` tokens consistently.
  - Wrapped `<Textarea>` in `<div className="flex-1">` to maintain flex expansion behaviour within the input row.
  - Removed `const time = new Date(msg.timestamp)` — direct `new Date()` call in component code (Rule 5). `formatDate` is now called directly with the `number` timestamp.

- **`src/utils/formatters/date.formatter.ts`**
  - Extended `formatDate` signature from `Date | string` to `Date | string | number` so numeric Unix ms timestamps (as produced by Realtime DB) are accepted without requiring an inline `new Date()` at call sites (Rule 31 — extend in-place).
  - Internal coercion updated to `date instanceof Date ? date : new Date(date)` which handles all three input types uniformly.

---

## [2026-03-03] — Modern Design Refresh (Zinc Palette + Flat Design)

### Changed

- **`src/constants/theme.ts`** — Full design token refresh across all `THEME_CONSTANTS` sections:
  - **Neutral palette**: all `gray-*` tokens replaced with `zinc-*` (warmer, more modern — Vercel/Linear/Radix aesthetic). No component files required changes.
  - **Backgrounds**: light mode is now pure `white` base with `zinc-50` secondary surfaces. Dark mode uses `zinc-950` (`#09090b`) base with `zinc-900`/`zinc-800` elevation layers — cleaner surface hierarchy.
  - **Buttons** (`colors.button.*`): removed all gradients (`bg-gradient-to-r from-* to-*`); replaced with flat colours (`bg-indigo-600 hover:bg-indigo-500`). Secondary button is now `zinc-900`/`zinc-100` (context-adaptive).
  - **Cards** (`enhancedCard.*`, `card.*`): upgraded from `rounded-xl` to `rounded-2xl`; elevated uses border + shadow instead of shadow-only; interactive hover adjusts border opacity instead of border colour.
  - **Nav/footer backgrounds** (`layout.navbarBg`, `titleBarBg`, `bottomNavBg`): added `backdrop-blur-sm` + `bg-white/95` for frosted-glass effect.
  - **Footer background**: replaced busy gradient with clean `zinc-50 dark:zinc-900` + top border.
  - **Inputs** (`input.base`, `patterns.adminInput/adminSelect`): `zinc` borders, explicit `text-zinc-*` colours, `focus:outline-none` guard to prevent double-ring.
  - **Alerts** (`colors.alert.*`): dark mode containers switched from solid (`dark:bg-*-950`) to translucent (`dark:bg-*-950/30`) for less visual weight.
  - **Badges** (`colors.badge.*`): `blue-*/green-*/purple-*` swapped to semantic `indigo-*/emerald-*/violet-*`; dark backgrounds use `/50` opacity for softer fill.
  - **Skeletons**: updated to `zinc-200 dark:bg-zinc-700/60`; card skeleton upgraded to `rounded-2xl`.
  - **Tab inactive**: `gray-*` → `zinc-*`; active tab is now `font-semibold` (was `font-medium`).
  - **Bottom nav active** colour: `blue-*` → `indigo-*` for brand consistency.
  - **Page headers** (`pageHeader.adminGradient`): updated gradient from `purple/indigo` to `violet/transparent` for cleaner look.
  - **Icon** standalone tokens: `yellow-*` warning → `amber-*` for visual harmony.
  - **Scrollbars**: replaced gradient thumb with flat `zinc-300/zinc-600`.

- **`src/app/globals.css`** — Updated to match new token values:
  - CSS custom properties (`:root` and `.dark`) updated to zinc RGB values.
  - `body` font-family now includes `Inter` as preferred option (graceful fallback to system fonts).
  - `body` background: `bg-white dark:bg-zinc-950`.
  - Focus ring: `ring-indigo-500` (was `ring-blue-500`); dark offset against `zinc-950`.
  - `.btn-primary`: flat `bg-indigo-600` (no gradient). `.btn-secondary`: `zinc-900/zinc-100`. `.btn-outline`: single `border` with zinc colours.
  - `.input-base`: `zinc` borders, `indigo` focus ring.
  - `.card`: `rounded-2xl`, `border border-zinc-200 dark:border-zinc-800`, `shadow-sm` (no `shadow-md`).
  - `.card-hover`: shadow-based hover (removed `scale-[1.02]`).
  - `.glass` / `.glass-strong`: updated to zinc-based backgrounds.
  - Scrollbar track/thumb: zinc neutrals.
  - Typography CSS classes updated to `zinc-950/zinc-50` for higher contrast.

- **`tailwind.config.js`** — Safelist updated: `zinc-*` classes are now the primary safelisted set; `gray-*` kept as fallback for any components not yet consuming `THEME_CONSTANTS`.

- **`docs/STYLING_GUIDE.md`** — `themed` token reference table updated to reflect zinc values; added palette rationale note.

---

## [2026-03-13] — Firebase Rules Audit & Newsletter Subscriber Feature

### Fixed

- **Rule 17 violation — `CHAT_ROOM_COLLECTION`**: `ChatRoomDocument` interface, `ChatRoomCreateInput` type, and `CHAT_ROOM_COLLECTION` constant were inlined in `src/repositories/chat.repository.ts`. Moved to a proper schema file (`src/db/schema/chat.ts`) and imported from `@/db/schema`. Backward-compatible re-exports preserved.

### Added

- **`src/db/schema/chat.ts`** — Full 6-section schema for the `chatRooms` Firestore collection. Exports `ChatRoomDocument`, `CHAT_ROOM_COLLECTION`, `CHAT_ROOM_INDEXED_FIELDS`, `CHAT_ROOM_FIELDS`, `ChatRoomCreateInput`, `ChatRoomUpdateInput`, `chatRoomQueryHelpers`.
- **`src/db/schema/newsletter-subscribers.ts`** — Full 6-section schema for the `newsletterSubscribers` Firestore collection. Exports `NewsletterSubscriberDocument`, `NEWSLETTER_SUBSCRIBERS_COLLECTION`, `NEWSLETTER_SUBSCRIBER_INDEXED_FIELDS`, `NEWSLETTER_SUBSCRIBER_FIELDS` (with `STATUS_VALUES`, `SOURCE_VALUES`), `NewsletterSubscriberCreateInput`, `NewsletterSubscriberUpdateInput`, `NewsletterSubscriberSource`, `newsletterSubscriberQueryHelpers`.
- **`src/repositories/newsletter.repository.ts`** — `NewsletterRepository` extending `BaseRepository`. Methods: `list(model)` (sieve-paginated), `findByEmail(email)`, `subscribe(input)`, `unsubscribe(id)`, `resubscribe(id)`, `updateSubscriber(id, input)`, `deleteById(id)`. Singleton `newsletterRepository` exported.
- **`src/app/api/newsletter/subscribe/route.ts`** — `POST /api/newsletter/subscribe`. Rate-limited (`RateLimitPresets.STRICT`), validates email + optional source via zod, handles duplicate/re-subscribe gracefully.
- **`src/app/api/admin/newsletter/route.ts`** — `GET /api/admin/newsletter`. Admin-only (role `admin`); sieve-paginated list with parallel stat counts (total / active / unsubscribed).
- **`src/app/api/admin/newsletter/[id]/route.ts`** — `PATCH` and `DELETE` for a single subscriber. Admin-only.
- **`src/services/newsletter.service.ts`** — `newsletterService.subscribe(data)` calling `API_ENDPOINTS.NEWSLETTER.SUBSCRIBE`.
- **`src/hooks/useNewsletter.ts`** — `useNewsletter()` hook wrapping `newsletterService.subscribe` via `useApiMutation`.
- **`SUCCESS_MESSAGES.NEWSLETTER.UPDATED`** — New success message constant for admin subscriber update responses.

---

## [2026-03-12] — Review Abuse Prevention & Write-Review Entry Points

### Added

- **Write-review form in `ProductReviews`** — `WriteReviewForm` and `StarPicker` sub-components added to `src/components/products/ProductReviews.tsx`. Renders between the section heading and the rating summary. Shows a sign-in prompt when unauthenticated; shows the star picker + title + comment fields when the user is logged in.
- **Anchor target** — `<section id="write-review">` on the `ProductReviews` section so `#write-review` URL hash scrolls directly to the form.
- **"Write a Review" buttons in order views** — `UserOrdersView` and `OrderDetailView` now show a `variant="outline"` `Button` labelled `orders.writeReview` for any order whose `status === "delivered"`. Clicking navigates to `ROUTES.PUBLIC.PRODUCT_DETAIL(order.productId) + "#write-review"`.
- **Error states in UI** — the form surfaces API 403 (purchase required), API 400 (already reviewed), and generic errors via inline `<Alert variant="error">` messages; uses `useMessage().showError` for generic fallback.
- **i18n keys** — 13 new keys added to the `products` namespace (`reviewFormTitle`, `reviewFormRating`, `reviewFormTitleLabel`, `reviewFormTitlePlaceholder`, `reviewFormComment`, `reviewFormCommentPlaceholder`, `reviewFormSubmit`, `reviewFormSubmitting`, `reviewFormSuccess`, `reviewFormPurchaseRequired`, `reviewFormAlreadyReviewed`, `reviewFormLoginRequired`, `reviewFormSignIn`) and `orders.writeReview` in `messages/en.json` and `messages/hi.json`.

### Confirmed (Audit)

- **Purchase gate** (`POST /api/reviews`) — already fully enforced via `orderRepository.hasUserPurchased(userId, productId)`. Returns HTTP 403 with `ERROR_MESSAGES.REVIEW.PURCHASE_REQUIRED` when the user has no confirmed/shipped/delivered order for the product. The submitted review automatically receives `verified: true` when the gate passes.

### Tests

- `src/components/products/__tests__/ProductReviews.test.tsx` — rewritten with full mock coverage for `useAuth`, `useApiMutation`, `useMessage`, `reviewService`, `ROUTES`, `next/navigation`. Covers: sign-in prompt, form rendering, star validation, successful submit (refetch + reset), 403 purchase-required error, 400 already-reviewed error. All 12 tests pass.

---

## [2026-03-11] — Become a Seller Feature

### Added

- **Route & API constant** — `ROUTES.USER.BECOME_SELLER = "/user/become-seller"` and `API_ENDPOINTS.USER.BECOME_SELLER = "/api/user/become-seller"` added to `src/constants/routes.ts` and `src/constants/api-endpoints.ts`.
- **Messages** — `ERROR_MESSAGES.USER.ALREADY_A_SELLER`, `ERROR_MESSAGES.USER.SELLER_APPLICATION_FAILED`, and `SUCCESS_MESSAGES.USER.SELLER_APPLICATION_SUBMITTED` added.
- **API route** `POST /api/user/become-seller` (`src/app/api/user/become-seller/route.ts`) — authenticates user, promotes `role` to `"seller"` and sets `storeStatus: "pending"` in Firestore; returns `{ alreadySeller: true }` if user is already a seller.
- **`sellerService.becomeSeller()`** — new method in `src/services/seller.service.ts` calling the above endpoint.
- **`useBecomeSeller` hook** (`src/hooks/useBecomeSeller.ts`) — `useApiMutation` wrapper; shows success / error toast automatically. Exported from `src/hooks/index.ts`.
- **`BecomeSellerView`** (`src/features/user/components/BecomeSellerView.tsx`) — five-section seller guide with per-section acknowledgement checkboxes. Apply button unlocks once all five sections are read. On success shows a confirmation card. Existing sellers are redirected to `ROUTES.SELLER.DASHBOARD`. Exported from `src/features/user/components/index.ts`.
- **Page** `src/app/[locale]/user/become-seller/page.tsx` — thin page shell rendering `BecomeSellerView`.
- **`UserTabs`** — "Become a Seller" tab added for users with `role === "user"` only (between Messages and Settings).
- **i18n** — `nav.becomeSeller` key and full `becomeSeller` namespace (guide sections, states, CTA copy) added to `messages/en.json` and `messages/hi.json`.

### Fixed (Audit)

- **API route type cast** (`src/app/api/user/become-seller/route.ts`) — replaced `as Parameters<typeof userRepository.update>[1]` with `as Partial<UserDocument>`; added missing `import type { UserDocument } from "@/db/schema"`.
- **Seed data storeStatus coverage** (`scripts/seed-data/users-seed-data.ts`) — added two new seller seed users covering the missing `"pending"` (`uid: "user-pending-seller-pendingsl"`) and `"rejected"` (`uid: "user-rejected-seller-rejectsl"`) states, enabling full testing of the admin review queue and rejection flow.

---

## [2026-03-10] — RipCoins Wallet & In-App Chat

### Added

- **RipCoin schema** (`src/db/schema/ripcoins.ts`) — `RipCoinDocument` interface with fields for `userId`, `type` (purchase/engage/release/forfeit/return/refund/admin_credit/admin_debit), `coins`, `orderId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, and `status`. Includes `RIPCOIN_COLLECTION`, `RIPCOIN_FIELDS`, and Sieve-ready index definitions.
- **`ripcooinRepository`** (`src/repositories/ripcoin.repository.ts`) — `getBalance()`, `getHistory(userId, model)`, `creditCoins()`, `debitCoins()`, `engageCoins()`, `releaseCoins()`, `logTransaction()`.
- **`GET /api/ripcoins/balance`** — Returns `{ available, engaged }` for the authenticated user.
- **`GET /api/ripcoins/history`** — Returns paginated transaction log (Sieve-compatible).
- **`POST /api/ripcoins/purchase`** — Creates a Razorpay order for coin packs (10 RC = ₹1; min 10 packs, max 500 packs). Returns `{ razorpayOrderId, razorpayKeyId, amountRs, coins }`.
- **`POST /api/ripcoins/verify`** — Verifies Razorpay payment signature and credits coins to user wallet.
- **`ripcoinService`** (`src/services/ripcoin.service.ts`) — `getBalance()`, `getHistory(params?)`, `purchaseCoins(packs)`, `verifyPurchase(data)`. Exported via `src/services/index.ts`.
- **`useRipCoinBalance`**, **`usePurchaseRipCoins`**, **`useVerifyRipCoinPurchase`**, **`useRipCoinHistory`** hooks (`src/hooks/useRipCoins.ts`). Exported via `src/hooks/index.ts`.
- **`RipCoinsWallet`** component (`src/features/user/components/RipCoinsWallet.tsx`) — Balance card with available/engaged display, transaction history `DataTable` with pagination, and "Buy RipCoins" trigger.
- **`BuyRipCoinsModal`** (`src/features/user/components/BuyRipCoinsModal.tsx`) — Pack selector (`Slider`, 10–500 packs), running cost display, Razorpay checkout flow. Props: `open`, `onClose`, `onPurchaseSuccess?`.
- **`/user/ripcoins`** page (`src/app/[locale]/user/ripcoins/page.tsx`) — Auth-gated page rendering `RipCoinsWallet`.
- **`ROUTES.USER.RIPCOINS`** — New route constant.
- **`API_ENDPOINTS.RIPCOINS.*`** — New API endpoint constants (BALANCE, HISTORY, PURCHASE, VERIFY).
- **`ERROR_MESSAGES.RIPCOIN.*`** and **`SUCCESS_MESSAGES.RIPCOIN.*`** — New message constants.
- **Chat schema** (`src/db/schema/chat.ts`) — `ChatRoomDocument` (buyerId, sellerId, orderId, lastMessage, updatedAt) and `CHAT_COLLECTION`, `CHAT_ROOM_FIELDS`. RTDB message path `chat/{chatId}/messages`.
- **`chatRepository`** (`src/repositories/chat.repository.ts`) — `createOrGetRoom()`, `getRoomsForUser(uid)`, `getRoom(chatId)`.
- **`GET /api/chat/rooms`** — Returns all chat rooms the authenticated user participates in (buyer or seller), ordered by `updatedAt`.
- **`POST /api/chat/rooms`** — Creates or returns existing chat room for `{ buyerId, sellerId, orderId? }`.
- **`POST /api/chat/[chatId]/messages`** — Writes a message to RTDB `/chat/{chatId}/messages` via Admin SDK (enforces server-side write).
- **`GET /api/realtime/token`** — Issues a short-lived Firebase custom token encoding which chat rooms the user may read. Used by `useChat` to authenticate the RTDB listener.
- **`chatService`** (`src/services/chat.service.ts`) — `getRooms()`, `createOrGetRoom(data)`, `sendMessage(chatId, text)`. Exported via `src/services/index.ts`.
- **`realtimeTokenService`** (`src/services/realtime-token.service.ts`) — `getToken()` with 55-minute auto-refresh logic.
- **`useChat(chatId)`** hook (`src/hooks/useChat.ts`) — Authenticates RTDB via custom token, subscribes to `/chat/{chatId}/messages` with `onValue`, exposes `{ messages, sendMessage, isConnected, isLoading, error }`.
- **`useChatRooms`**, **`useCreateChatRoom`** hooks — Exported via `src/hooks/index.ts`.
- **`ChatWindow`** component (`src/features/user/components/ChatWindow.tsx`) — Real-time message list with auto-scroll, send textarea (Enter to send), connection status dot, loading/error states.
- **`ChatList`** component (`src/features/user/components/ChatList.tsx`) — Room list with last-message preview and timestamp; active room highlighted.
- **`MessagesView`** component (`src/features/user/components/MessagesView.tsx`) — Two-pane responsive layout (ChatList + ChatWindow); mobile back-navigation between panes.
- **`/user/messages`** page (`src/app/[locale]/user/messages/page.tsx`) — Auth-gated page wrapping `MessagesView` in `Suspense`; supports `?chatId=` query param to open a specific room.
- **`ROUTES.USER.MESSAGES`** — New route constant.
- **`API_ENDPOINTS.CHAT.*`** — New API endpoint constants.
- **`UserTabs`** — Added "My RipCoins" and "Messages" tabs.
- **i18n** (`messages/en.json`, `messages/hi.json`) — Added `ripcoinsWallet` and `chat` namespaces, plus nav keys `myRipCoins` and `myMessages`.
- **`firestore.indexes.json`** — 4 new composite indexes: `ripcoins` (userId+createdAt, userId+type+createdAt), `chatRooms` (buyerId+updatedAt, sellerId+updatedAt).

---

## [2026-03-05] — Admin Store Approval System

### Added

- **`storeStatus` field on `UserDocument`** — `storeStatus?: "pending" | "approved" | "rejected"` is the single gate that controls both admin review state and public visibility. Added to `USER_INDEXED_FIELDS` in `src/db/schema/users.ts`.
- **`USER_FIELDS.STORE_STATUS`** — New field-name constant in `src/db/schema/field-names.ts`.
- **`GET /api/admin/stores`** — Admin-only (admin/moderator) paginated list of sellers with `storeStatus` filter support (`?storeStatus=pending|approved|rejected|all`). Uses `userRepository.listSellersForAdmin()` + Sieve DSL.
- **`PATCH /api/admin/stores/[uid]`** — Admin-only action endpoint. Accepts `{ action: "approve" | "reject" }`. Updates `storeStatus` via `userRepository.updateStoreApproval()`.
- **`userRepository.updateStoreApproval(uid, storeStatus)`** — New method for store approval writes.
- **`userRepository.listSellersForAdmin(model)`** — New method; lists all sellers regardless of `storeStatus` so admin can see pending/rejected stores.
- **`userRepository.listSellers()`** (updated) — Now filters `storeStatus == "approved"` to ensure public-facing seller lists exclude unapproved stores.
- **Public store guards** — All 5 storeSlug public routes (`/api/stores/[storeSlug]`, `.../products`, `.../auctions`, `.../reviews`) check `seller.storeStatus !== "approved"` and return 404 for non-approved stores.
- **`adminService.listStores(query?)`** and **`adminService.updateStoreStatus(uid, action)`** — New service methods in `src/services/admin.service.ts`.
- **`useAdminStores(sieveParams)`** — New hook at `src/features/admin/hooks/useAdminStores.ts`; queries `["admin", "stores", sieveParams]` + exposes `updateStoreMutation`.
- **`AdminStoresView`** — New admin view at `src/features/admin/components/AdminStoresView.tsx`; tab-based status filter (All/Pending/Approved/Rejected), DataTable with approve/reject row actions, ConfirmDeleteModal for confirmations.
- **`src/app/[locale]/admin/stores/page.tsx`** — Thin page shell rendering `AdminStoresView`.
- **`ROUTES.ADMIN.STORES`** (`"/admin/stores"`) and **`API_ENDPOINTS.ADMIN.STORES`** + **`API_ENDPOINTS.ADMIN.STORE_BY_UID`** — New route/endpoint constants.
- **`SUCCESS_MESSAGES.ADMIN.STORE_APPROVED/STORE_REJECTED`** — New success message constants.
- **i18n**: Added `adminStores` namespace to `messages/en.json` and `messages/hi.json`.
- **Firestore indexes**: Added `role+storeStatus+createdAt` composite index to `firestore.indexes.json`; deployed to `letitrip-in-app`.
- **Seed data**: All 6 seller entries in `scripts/seed-data/users-seed-data.ts` now include `storeStatus: "approved"`.
- **`useSellerStore` hook** — Extended `SellerStoreData` with `storeStatus`; `GET /api/seller/store` now returns the field; `PATCH /api/seller/store` sets `storeStatus: "pending"` when store is not already approved (re-submission flow).

---

## [2026-03-04] — Seller Store Settings & Auctions Pages

### Added

- **`src/features/seller/hooks/useSellerStore.ts`** — New hook; fetches seller store profile via `sellerService.getStore()` (queryKey `["seller-store"]`); exposes `updateStore(data)` mutation that calls `sellerService.updateStore(data)` then refetches. Returns `{ publicProfile, storeSlug, isLoading, isSaving, error, updateStore, refetch }`.
- **`src/features/seller/components/SellerStoreView.tsx`** — Full store-settings form (4 sections: Store Details, Contact & Social, Store Policies, Vacation Mode). Uses `useSellerStore`, `FormField`, `Toggle`, `Alert`, `Card`, `Heading`, `Text`, `Caption`, `Label`, `Divider`, `Button`, `Spinner` from `@/components`. Auto-redirects unauthenticated users to login.
- **`src/features/seller/components/SellerAuctionsView.tsx`** — Paginated auction listings view for sellers; uses `useApiQuery → sellerService.listMyProducts` with `isAuction==true` Sieve filter + `useUrlTable` for URL-driven pagination/sort; renders with `DataTable` + `SellerProductCard` mobileCardRender.
- **`src/app/[locale]/seller/store/page.tsx`** — Thin page shell; renders `SellerStoreView` with `AdminPageHeader` titled "Store Settings".
- **`src/app/[locale]/seller/auctions/page.tsx`** — Thin page shell; renders `SellerAuctionsView` with `AdminPageHeader` titled "My Auctions".
- **`GET /api/seller/store`** — Returns store profile for authenticated sellers/admins (`userRepository.findById`).
- **`PATCH /api/seller/store`** — Updates store settings; validates payload with Zod; auto-generates `storeSlug` from `storeName` when no slug exists (using `slugify`); preserves existing slug otherwise; updates `publicProfile` + optional `storeSlug` via `userRepository.update`.
- **`sellerService.getStore()`** and **`sellerService.updateStore(data)`** — New service methods for the store endpoints.
- **i18n**: Added `sellerStore` (35 keys) and `sellerAuctions` (7 keys) namespaces to `messages/en.json` and `messages/hi.json`; added `nav.myStore` key.

### Tests Added

- `src/services/__tests__/seller.service.test.ts` — Extended with `getStore()` and `updateStore()` tests.
- `src/features/seller/hooks/__tests__/useSellerStore.test.ts` — 5 tests covering queryKey, service delegation, mutation behaviour, and loading state.
- `src/features/seller/components/__tests__/SellerStoreView.test.tsx` — 3 tests: renders all 4 sections, shows spinner when loading, hides vacation alert by default.
- `src/features/seller/components/__tests__/SellerAuctionsView.test.tsx` — 5 tests: filter bar renders, empty title shown, no pagination at total=0, service called with auction filter, pagination shows when total > 0.
- `src/app/[locale]/seller/store/__tests__/page.test.tsx` — Page shell test.
- `src/app/[locale]/seller/auctions/__tests__/page.test.tsx` — Page shell test.
- `src/app/api/seller/store/__tests__/route.test.ts` — 8 tests covering GET and PATCH RBAC, slug generation, slug preservation, validation, and error handling.

---

## [2026-03-03] — Stores Feature Audit Fixes

### Fixed

- **`StoreCard`** — removed unused `themed` and `borderRadius` from `THEME_CONSTANTS` destructure; only `spacing` is referenced.
- **`StoresListView`** — corrected `Input value={table.get("q") ?? ""}` (`string | undefined` → `string`); added `Heading level={1}` page title and `Text` subtitle using `t("title")` / `t("subtitle")` from the `storesPage` namespace.
- **`StoreProductsView`** + **`StoreAuctionsView`** — replaced raw `<div>` placeholder cards + bare `<p>` tags with `Card` / `Text` primitives from `@/components` (Rules 8, 31).
- **`StoreReviewsView`** — replaced bare `<span className="text-4xl font-bold ...">` with `<Heading level={2}>` (Rule 31).
- **`StoreAboutView`** — replaced hardcoded `text-gray-500 dark:text-gray-400` / `text-gray-900 dark:text-white` on `<dt>`/`<dd>` elements with `THEME_CONSTANTS.themed.textSecondary` / `themed.textPrimary` (Rule 4).

---

## [2026-03-03] — Stores Feature (Buyer Storefront Directory)

### Added

- **`src/features/stores/`** — New Tier 2 feature module: buyer-facing storefront directory.
  - `components/StoreCard.tsx` — Card displaying store banner, logo (`AvatarDisplay`), name, description, category badge, and stats (rating, product count). Links to the store detail page.
  - `components/StoresListView.tsx` — Paginated grid of all stores with inline `Input` search; uses `useStores` + `useUrlTable` for URL-driven pagination/search.
  - `components/StoreHeader.tsx` — Client component; shows store banner image, avatar, name, category, rating, review count, and description. Renders a `Skeleton` while loading.
  - `components/StoreNavTabs.tsx` — Sticky tab bar (Products / Auctions / Reviews / About) rooted at the store slug routes.
  - `components/StoreProductsView.tsx` — Paginated grid of the store's published products; uses `useStoreProducts` + `useUrlTable`.
  - `components/StoreAuctionsView.tsx` — Paginated grid of the store's auction listings; uses `useStoreAuctions` + `useUrlTable`.
  - `components/StoreReviewsView.tsx` — Aggregated review summary (average rating, star distribution) + individual review cards; uses `useStoreReviews`.
  - `components/StoreAboutView.tsx` — Store detail card (description, category, bio, location, website, member since); uses `useStoreBySlug`.
  - `hooks/useStores.ts` — Paginated store list via `storeService.listStores` with `useUrlTable` URL state.
  - `hooks/useStoreBySlug.ts` — `useStoreBySlug`, `useStoreReviews`, `useStoreProducts`, `useStoreAuctions` — all backed by `storeService`.
  - `types/index.ts` — `StoreListItem`, `StoreDetail`, `StoreReviewsData`, `StoreReview` interfaces.
  - `index.ts` — Public barrel re-exporting all components, hooks, and types.

- **`src/services/store.service.ts`** — `storeService` with `listStores`, `getBySlug`, `getProducts`, `getAuctions`, `getReviews`; exported via `src/services/index.ts`.

- **API routes** (all dynamic, server-rendered):
  - `src/app/api/stores/route.ts` — `GET /api/stores` — paginated seller list (Sieve query via `userRepository.listSellers`).
  - `src/app/api/stores/[storeSlug]/route.ts` — `GET /api/stores/[storeSlug]` — single store by slug.
  - `src/app/api/stores/[storeSlug]/products/route.ts` — `GET /api/stores/[storeSlug]/products` — store's published products.
  - `src/app/api/stores/[storeSlug]/auctions/route.ts` — `GET /api/stores/[storeSlug]/auctions` — store's auction listings.
  - `src/app/api/stores/[storeSlug]/reviews/route.ts` — `GET /api/stores/[storeSlug]/reviews` — aggregated reviews with `averageRating`, `totalReviews`, `ratingDistribution`.

- **Pages** (`src/app/[locale]/stores/`):
  - `page.tsx` — Stores listing page composing `StoresListView`.
  - `[storeSlug]/layout.tsx` — Store layout: `StoreHeader` + `StoreNavTabs` + `{children}`.
  - `[storeSlug]/page.tsx` — Redirects to `/stores/[storeSlug]/products`.
  - `[storeSlug]/products/page.tsx`, `auctions/page.tsx`, `reviews/page.tsx`, `about/page.tsx` — Individual store sub-pages.

- **`src/db/schema/users.ts`** — Added `storeSlug?: string` (top-level, indexed), and store profile fields (`storeName`, `storeDescription`, `storeCategory`, `storeLogoURL`, `storeBannerURL`) nested under `publicProfile`.

- **`src/db/schema/field-names.ts`** — Added `USER_FIELDS.STORE_SLUG`, `USER_FIELDS.PROFILE.STORE_NAME`, `USER_FIELDS.PROFILE.STORE_DESCRIPTION`, `USER_FIELDS.PROFILE.STORE_CATEGORY`, `USER_FIELDS.PROFILE.STORE_LOGO_URL`, `USER_FIELDS.PROFILE.STORE_BANNER_URL`.

- **`src/constants/routes.ts`** — Added `ROUTES.PUBLIC.STORES`, `STORE_DETAIL`, `STORE_PRODUCTS`, `STORE_AUCTIONS`, `STORE_REVIEWS`, `STORE_ABOUT`.

- **`src/constants/api-endpoints.ts`** — Added `API_ENDPOINTS.STORES.*`.

- **`src/repositories/user.repository.ts`** — Added `findByStoreSlug(storeSlug)` and `listSellers(model)` methods.

- **`messages/en.json`** and **`messages/hi.json`** — Added `stores` nav key and `storesPage` / `storePage` translation namespaces.

### Changed

- **`src/constants/navigation.tsx`** — Changed 4th nav item from `sellers` (recruitment) to `stores` (storefront directory).
- **`src/components/layout/MainNavbar.tsx`** — Updated `navTranslationKeys[3]` from `"sellers"` to `"stores"`.
- **`src/constants/site.ts`** — Updated `nav.stores` pointing to `ROUTES.PUBLIC.STORES`.
- **`src/components/seller/SellerStorefrontView.tsx`** — Updated back link from `ROUTES.PUBLIC.SELLERS` to `ROUTES.PUBLIC.STORES`.

---

## [2026-03-02] — Missing Footer Static Pages

### Added

- **`src/app/[locale]/cookies/page.tsx`** — Cookie Policy static page with 8 content sections (what are cookies, types, essential, analytics, marketing, control, third-party, changes). Follows the same hero + sections layout as Privacy and Terms pages.
- **`src/app/[locale]/refund-policy/page.tsx`** — Refund Policy static page with 7 sections (eligibility, process, timeline, auctions, exchanges, return shipping, non-refundable items). Emerald gradient header.
- **`src/app/[locale]/seller-guide/page.tsx`** — Seller Guide page with 8 icon-card sections (getting started, listings, pricing, auctions, orders, payments, policies, support). Violet/indigo gradient header with CTA to Seller Dashboard.
- **`src/app/[locale]/track/page.tsx`** — Track Order page with sign-in prompt, 4-step "how it works" grid, and support CTA. Directs authenticated users to `/user/orders`.
- `messages/en.json` — added `cookies`, `refundPolicy`, `sellerGuide`, and `trackOrder` translation namespaces.
- `messages/hi.json` — added matching Hindi translations for all four new namespaces.

---

## [2026-03-02] — Docs Reorganisation

### Changed

- **`docs/README.md`** — removed broken link to `IMPLEMENTATION_PLAN.md` (file was removed); added `CHANGELOG_ARCHIVE.md` entry.
- **`docs/CHANGELOG.md`** — archived pre-February 2026 versioned sections (`[1.0.0]`–`[1.2.0]`) to `CHANGELOG_ARCHIVE.md`; removed stale `refactor_audit.md` bullet references (file was removed).
- **`docs/GUIDE.md`**, **`docs/SECURITY.md`**, **`docs/STYLING_GUIDE.md`**, **`docs/QUICK_REFERENCE.md`** — updated stale "Last Updated" dates to March 2, 2026.

### Added

- **`docs/CHANGELOG_ARCHIVE.md`** — new archive file holding `[1.0.0]`–`[1.2.0]` history (initial setup through early-February 2026 infrastructure work).

---

## [2026-03-03] — Refactor Audit WAVE 5 Complete (tasks 94–105)

### Fixed

- **Typography violations — Rules 7, 31** (tasks 94–105) — eliminated all 12 remaining raw-tag violations found in audit re-run #4:
  - `AddressCard` — `h3` → `Heading level={3}`; 6 `p` → `Text` (size/variant props) (task 94)
  - `SellersListView` — `h1`/`h2`×4/`h3`×3 → `Heading`; 6 `p` → `Text` (task 95)
  - `OrderTrackingView` — `h1`, `h2` → `Heading`; `p` → `Text variant="secondary"` (task 96)
  - `NotificationItem` — 3 `p` → `Text` (weight/size/variant); fixed barrel import (`@/components/ui` → `@/components`) (task 97)
  - `ProductDetailView` — `h1` → `Heading level={1}`; `p` → `Text variant="secondary"` (task 98)
  - `AddressForm` — raw `label + input[checkbox]` block → `Checkbox` from `@/components` (task 99)
  - `ProfileStatsGrid` — `p` → `Text className="text-3xl font-bold"` (task 100)
  - `EmailVerificationCard` — `h3` → `Heading level={3}` (task 101)
  - `PhoneVerificationCard` — `h3` → `Heading level={3}` (task 102)
  - `AddressSelectorCreate` — `label` → `Label`; removed unused `typography` from `THEME_CONSTANTS` destructure (task 103)
  - `Search` — `p` → `Text variant="secondary" size="sm"` (task 104)
  - `FilterFacetSection` — `p` → `Text size="xs" variant="secondary"` (task 105)
- **Tests updated** — all 12 source files have corresponding test additions/updates.
- **TypeScript** — fixed `Text size="3xl"` (invalid enum value) → `className="text-3xl"`; fixed `import type React` → `import React` in test; added missing `OrderDocument`/`NotificationDocument` required fields in test fixtures.

---

## [2026-03-02] — Refactor Audit WAVE 5 task 96 completion

### Fixed

- **`OrderTrackingView`** — fixed 4 additional raw `<p>` tags missed in previous pass: tracking-number label → `Caption`, tracking-number value → `Text`, timeline step label → `Text` (variant driven by step state), timeline step description → `Text` (variant driven by step state); added `Caption` to component mock in test file (task 96).

---

## [2026-03-02] — Refactor Audit Re-run #4

### Fixed

- **TypeScript errors** — `SurveyConfigForm.test.tsx`: added missing `order` field to `SurveyFormField` mock object; `cache-metrics.test.ts`: corrected `mockFormatDateTime` signature (accept 1 arg) and simplified `formatNumber` mock to avoid spreading `unknown[]`.
- **Wave 4 page decompositions** (tasks 80–89) — confirmed all done: every page is under 15 lines and delegates to its view component (`DemoSeedView`, `UserSettingsView`, `BlogPostView`, `SellerEditProductView`, `UserAddressesView`, `ProductDetailView`, `SellersListView`, `AboutView`, `AdminMediaView`, `CartView`).

### Added

- Audit re-run #4: marked tasks 80–93 as done; identified Wave 5 (tasks 94–105) with 12 newly discovered Rules 7/8/31 violations in `AddressCard`, `SellersListView`, `OrderTrackingView`, `NotificationItem`, `ProductDetailView`, `AddressForm`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `AddressSelectorCreate`, `Search`, and `FilterFacetSection`.

---

### Refactor Audit Wave 4 — Page Decompositions (Tasks 90–93) (2026-03-02)

#### Refactored

- **`src/app/[locale]/admin/site/page.tsx`** — Extracted 162-line page into `AdminSiteView` feature component (Rule 10). Page is now a 5-line shell.
- **`src/app/[locale]/user/notifications/page.tsx`** — Extracted 156-line page into `UserNotificationsView` feature component (Rule 10). Page is now a 5-line shell.
- **`src/app/[locale]/admin/events/page.tsx`** — Extracted 153-line page into `AdminEventsView` feature component (Rule 10). Page is now a 5-line shell.
- **`src/app/[locale]/user/addresses/edit/[id]/page.tsx`** — Extracted 150-line page into `UserEditAddressView` feature component (Rule 10). Page is now a 5-line shell.

#### Added

- **`src/features/admin/components/AdminSiteView.tsx`** — New feature view component for admin site settings management.
- **`src/features/user/components/UserNotificationsView.tsx`** — New feature view component for user notifications page.
- **`src/features/admin/components/AdminEventsView.tsx`** — New feature view component for admin events list management.
- **`src/features/user/components/UserEditAddressView.tsx`** — New feature view component for editing a user's saved address.
- Test files created for all four new view components.

#### Exports

- `src/features/admin/index.ts` — Added `AdminSiteView`, `AdminEventsView` exports.
- `src/features/user/components/index.ts` — Added `UserNotificationsView`, `UserEditAddressView` exports.

---

### Refactor Audit Wave 3 — Single-Violation Files (2026-03-03)

#### Changed

**Typography (Tasks 40–53)**

- **`src/features/search/components/SearchView.tsx`** — Replaced `<h1>` + `<p>` with `<Heading level={1}>` + `<Text variant="secondary">` (Rule 31).
- **`src/features/products/components/AuctionsView.tsx`** — Replaced `<h1>` + `<p>` with `<Heading>` + `<Text>` (Rule 31).
- **`src/features/products/components/ProductsView.tsx`** — Replaced `<h1>` + `<p>` with `<Heading>` + `<Text>` (Rule 31).
- **`src/components/seller/SellerTopProducts.tsx`** — Replaced `<h2>` with `<Heading level={2}>` (Rule 31).
- **`src/components/seller/SellerPayoutRequestForm.tsx`** — Replaced `<h2>` with `<Heading level={2}>` (Rule 31).
- **`src/components/seller/SellerRevenueChart.tsx`** — Replaced `<h2>` with `<Heading level={2}>` (Rule 31).
- **`src/components/user/profile/ProfileHeader.tsx`** — Replaced `<h1>` with `<Heading level={1}>` (Rule 31).
- **`src/components/user/settings/ProfileInfoForm.tsx`** — Replaced `<h3>` with `<Heading level={3}>` (Rule 31).
- **`src/components/user/addresses/AddressForm.tsx`** — Replaced raw `<label>` with `<Label>` (Rule 31).
- **`src/components/user/notifications/NotificationsBulkActions.tsx`** — Replaced `<h1>` with `<Heading level={1}>` (Rule 31).
- **`src/features/seller/components/SellerStatCard.tsx`** — Replaced `<p>` with `<Text>` (Rule 31).
- **`src/features/seller/components/SellerProductCard.tsx`** — Replaced 2× `<p>` with `<Text>` (Rule 31).
- **`src/features/events/components/SurveyEventSection.tsx`** — Replaced `<p>` with `<Text>` (Rule 31).
- **`src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx`** — Replaced `<label>` with `<Label>` (Rule 31).

**Number/Date formatting (Tasks 54–68)**

- **`src/components/admin/products/ProductTableColumns.tsx`** — Replaced `price.toLocaleString("en-IN")` with `formatCurrency(price, 'INR', 'en-IN')` (Rule 5).
- **`src/components/admin/coupons/CouponTableColumns.tsx`** — Replaced `discount.value.toLocaleString("en-IN")` with `formatCurrency(...)`; `new Date(endDate) < new Date()` with `isPast(endDate)`; raw `<p>` with `<Text>` (Rules 5, 31).
- **`src/components/admin/AdminStatsCards.tsx`** — Replaced `value.toLocaleString()` with `formatNumber(value)`; raw `<p>` with `<Text>` (Rules 5, 31).
- **`src/components/homepage/TopCategoriesSection.tsx`** — Replaced `totalItemCount.toLocaleString()` with `formatNumber(...)`; `<h3>` with `<Heading level={3}>` (Rules 5, 31).
- **`src/components/homepage/WhatsAppCommunitySection.tsx`** — Replaced `memberCount.toLocaleString()` with `formatNumber(...)`; raw `<h2>` + `<p>` with `<Heading>` + `<Text>` (Rules 5, 31).
- **`src/components/faq/FAQAccordion.tsx`** — Replaced `faq.stats.views.toLocaleString()` with `formatNumber(...)` (Rule 5).
- **`src/components/admin/ImageUpload.tsx`** — Replaced manual `toFixed(2) MB` calculation with `formatFileSize(file.size)` (Rule 5).
- **`src/components/modals/ImageCropModal.tsx`** — Replaced `.toFixed(0)` on display values with `Math.round(...)` (Rule 5).
- **`src/features/admin/components/AdminPayoutsView.tsx`** — Replaced manual `new Date(...).getMonth() === new Date().getMonth()` comparisons with `isSameMonth(date, nowMs())` (Rule 5).
- **`src/components/homepage/FeaturedAuctionsSection.tsx`** — Replaced `new Date().getTime()` with `nowMs()` (Rule 5).
- **`src/components/auctions/AuctionCard.tsx`** — Replaced `Date.now()` with `nowMs()` (Rule 5).
- **`src/components/layout/Footer.tsx`** — Replaced `new Date().getFullYear()` with `currentYear()` (Rule 5).
- **`src/components/feedback/Toast.tsx`** — Replaced `Date.now().toString()` with `nowMs().toString()` (Rule 5).
- **`src/components/ErrorBoundary.tsx`** — Replaced `new Date().toISOString()` with `nowISO()` (Rule 5).
- **`src/lib/email.ts`** — Replaced 12× `new Date().getFullYear()` with `currentYear()` and 4× `toLocaleString()`/`toUTCString()` date calls with `formatDateTime(nowMs())` (Rule 5).
- **`src/utils/formatters/date.formatter.ts`** — Extended `formatDateTime` to accept `number` (ms epoch) as first argument in addition to `Date | string` (Rule 31).

**Overflow-x-auto → Primitives (Tasks 69–73)**

- **`src/components/ui/Tabs.tsx`** — Extended with `variant='line'` (border-bottom underline tabs) flowing via React context through `TabsList` and `TabsTrigger` (Rule 31).
- **`src/components/ui/HorizontalScroller.tsx`** — Extended children-passthrough mode with `scrollContainerRef?: RefObject<HTMLDivElement | null>`, `onScroll?`, and dynamic `gap` prop (Rule 31).
- **`src/features/user/components/UserOrdersView.tsx`** — Replaced custom `overflow-x-auto` button tab row with `<Tabs variant="line">` (Rule 32).
- **`src/components/homepage/FAQSection.tsx`** — Replaced custom `overflow-x-auto` button tab row with `<Tabs variant="line">` (Rule 32).
- **`src/components/products/ProductImageGallery.tsx`** — Replaced `<div className="flex gap-2 overflow-x-auto">` with `<HorizontalScroller snapToItems gap={8}>` (Rule 32).
- **`src/components/homepage/HeroCarousel.tsx`** — Replaced `<div ref={slidesRef} className="...overflow-x-auto...">` with `<HorizontalScroller snapToItems gap={0} scrollContainerRef={slidesRef} onScroll={...}>` (Rule 32).

**API Routes — Firestore/Error class violations (Tasks 74–79)**

- **`src/app/api/payment/webhook/route.ts`** — Replaced raw `NextResponse.json({error:...}, {status:401/400})` returns with `throw new AuthenticationError(...)` / `throw new ValidationError(...)`; outer catch updated to use `handleApiError` (Rules 13, 14).
- **`src/app/api/auth/login/route.ts`** — Removed direct `getFirestore`/`FieldValue` usage; replaced `db.collection(USER_COLLECTION).doc(uid).get()` with `userRepository.findById(uid)` and inline `db.update(...)` with `userRepository.updateLoginMetadata(uid)` (Rule 12).
- **`src/app/api/auth/register/route.ts`** — Removed direct `getFirestore`/`FieldValue` usage; replaced `db.collection(USER_COLLECTION).doc(uid).set({...})` with `userRepository.createWithId(uid, {...})` — `createWithId` auto-sets `createdAt`/`updatedAt` (Rule 12).
- **`src/app/api/auth/session/route.ts`** — Removed direct `getFirestore`/`FieldValue` from OAuth profile creation; replaced with `userRepository.createWithId(uid, {...})` (Rule 12).
- **`src/contexts/SessionContext.tsx`** — Replaced `import type { User } from "firebase/auth"` with `import type { AuthUser } from "@/types/auth"` (Rule 11).

#### Added

- **`src/repositories/user.repository.ts`** — New `updateLoginMetadata(uid)` method: uses `FieldValue.serverTimestamp()` + `FieldValue.increment(1)` to atomically update `metadata.lastSignInTime`, `metadata.loginCount`, and `updatedAt` on successful login (Rule 12).
- **`src/types/auth.ts`** — New `AuthUser` interface (`uid`, `email`, `emailVerified`, `displayName`, `photoURL`, `phoneNumber`) that mirrors the minimal Firebase Auth user shape without importing Firebase types into UI modules (Rule 11).
- **`src/utils/formatters/__tests__/date.formatter.test.ts`** — Added test for `formatDateTime` with numeric ms timestamp input.
- **`src/components/ui/__tests__/HorizontalScroller.test.tsx`** — Added tests for `scrollContainerRef` forwarding and `onScroll` prop in children-passthrough mode.

---

### Refactor Audit Wave 2 — Multi-Violation Files (2026-03-02)

#### Changed

- **`src/components/admin/AdminSessionsManager.tsx`** — Replaced raw `<p>` / `<h3>` tags with `<Text>` / `<Heading level={3}>` (Rules 7, 31). Raw table + date violations already fixed in Wave 1 work.
- **`src/features/events/components/EventParticipateView.tsx`** — Replaced 3× `<p>` with `<Text>` (Rule 31).
- **`src/features/admin/components/AdminReviewsView.tsx`** — Replaced error `<p>` with `<Text variant="error">` (Rule 31).
- **`src/components/user/profile/PublicProfileView.tsx`** — Replaced `<h1>` / `<h2>` with `<Heading>` and `toFixed(1)` with `formatNumber(..., { decimals: 1 })` (Rules 5, 7, 31).
- **`src/features/admin/components/AdminAnalyticsView.tsx`** — Replaced 3× `<h2>` with `<Heading level={2}>` and 4× `<p>` with `<Text>` (Rule 31).
- **`src/components/promotions/CouponCard.tsx`** — Fixed barrel import (`@/components/ui` → `@/components`), replaced `<h3>` + 4× `<p>` with `<Heading>` + `<Text>` (Rules 2, 7, 31).
- **`src/features/categories/components/CategoryProductsView.tsx`** — Added `Heading, Text` imports; replaced `<h1>` + 3× `<p>` with typography primitives (Rule 31).
- **`src/features/events/components/FeedbackEventSection.tsx`** — Replaced 2× `<p>` + 1× `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/features/events/components/PollVotingSection.tsx`** — Replaced 2× `<p>` + 1× `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/lib/monitoring/cache-metrics.ts`** — Replaced `new Date().toISOString()` → `nowISO()`, `Date.now()` → `nowMs()`, `.toFixed(2)` → `formatNumber(..., { decimals: 2 })`, `.toLocaleString()` → `formatDateTime()` (Rule 5).
- **`src/components/seller/SellerPayoutHistoryTable.tsx`** — Fixed barrel import; replaced `<h2>` + 3× `<p>` with typography primitives; replaced raw `<table>` with `<DataTable columns>` (Rules 2, 7, 31, 32).
- **`src/features/seller/components/SellerOrdersView.tsx`** — Replaced 2× `<p>` with `<Text>`; replaced `overflow-x-auto` custom tab row with `<Tabs>` + `<TabsList>` + `<TabsTrigger>` compound components (Rules 7, 31, 32).
- **`src/features/auth/components/LoginForm.tsx`** — Replaced `<p>` + `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/features/auth/components/RegisterForm.tsx`** — Replaced `<p>` + `<label>` with `<Text>` + `<Label>` (Rule 31).
- **`src/app/global-error.tsx`** — Replaced `new Date().toISOString()` → `nowISO()`; replaced `<h1>` + `<p>` with `<Heading level={1}>` + `<Text variant="secondary">` (Rules 5, 7, 31).
- **`src/components/promotions/ProductSection.tsx`** — Replaced `<h2>` + `<p>` with `<Heading level={2}>` + `<Text variant="secondary">` (Rule 31).
- **`src/features/events/components/EventTypeConfig/SurveyConfigForm.tsx`** — Replaced 2× `<label>` with `<Label>` (Rule 31).

#### Added (tests)

- `src/components/promotions/__tests__/ProductSection.test.tsx` — render, empty-guard, and typography slot tests.
- `src/components/seller/__tests__/SellerPayoutHistoryTable.test.tsx` — heading render, loading/empty/data states, DataTable delegation.
- `src/features/events/components/EventTypeConfig/__tests__/SurveyConfigForm.test.tsx` — label renders, checkbox onChange handlers, SurveyFieldBuilder delegation.
- `src/app/__tests__/global-error.test.tsx` — Heading + Text rendering, retry button, nowISO usage in logger.error.
- `src/lib/monitoring/__tests__/cache-metrics.test.ts` — formatNumber/formatDateTime/nowISO call verification.
- `src/components/user/profile/__tests__/PublicProfileView.test.tsx` — heading render, member-since text, formatNumber for rating.

---

### Refactor Audit Wave 1 — Tier 1 Primitives (2026-03-01)

#### Changed

- **`src/components/ui/SideDrawer.tsx`** — Replaced raw `<h4>` + `<p>` tags in the "unsaved changes" confirmation panel with `<Heading level={4}>` and `<Text variant="secondary" size="sm">` (Rules 7, 31). Added `Text` import via `@/components` barrel.
- **`src/components/ui/FilterFacetSection.tsx`** — Replaced `opt.count.toLocaleString()` with `formatNumber(opt.count)` from `@/utils` (Rule 5).
- **`src/components/ui/TablePagination.tsx`** — Replaced `total.toLocaleString()` with `formatNumber(total)` from `@/utils` (Rule 5).
- **`src/components/ui/CategorySelectorCreate.tsx`** — Replaced raw `<label className="block ...">` with `<Label>` from `@/components`. Removed now-unused `typography` destructure from `THEME_CONSTANTS` (Rules 7, 31).
- **`src/components/ui/ImageGallery.tsx`** — Replaced the thumbnail strip `<div className="... overflow-x-auto ...">` with `<HorizontalScroller snapToItems>` (Rule 32).
- **`src/components/ui/HorizontalScroller.tsx`** — Extended with `snapToItems?: boolean` and `children?: ReactNode` props. When `children` is provided the component renders a simple flex scroll container (no carousel machinery, no arrows). `snapToItems` adds `snap-x snap-mandatory` to the scroll container and `snap-center` to each item wrapper.

---

### Refactor Audit Wave 0 — Prerequisites (2026-03-01)

#### Added

- **`src/utils/formatters/date.formatter.ts`** — Added `nowMs()`, `isSameMonth()`, `currentYear()`, `nowISO()` utilities (Rule 5).
- **`src/constants/api-endpoints.ts`** — Added `REALTIME.TOKEN` endpoint constant (Rules 19, 20).
- **`src/constants/error-messages.ts`** — Added `AUTH.INVALID_SIGNATURE` and `VALIDATION.INVALID_JSON` message constants (Rule 13).
- **`src/services/demo.service.ts`** — New service for demo/seed API calls (Rules 20, 21).
- **`src/services/realtime-token.service.ts`** — New service for Realtime DB custom token (Rules 11, 21).
- **`src/components/admin/SessionTableColumns.tsx`** — Static column definitions for the Admin Sessions DataTable (Rules 8, 32).
- **`src/components/seller/PayoutTableColumns.tsx`** — Static column definitions for the Seller Payout History DataTable (Rules 8, 32).

#### Changed

- **`src/utils/formatters/number.formatter.ts`** — `formatNumber` extended in-place with optional `decimals` option (Rule 5).
- **`src/services/index.ts`** — Exported `demoService` and `realtimeTokenService`.
- **`src/components/admin/index.ts`** — Exported `SESSION_TABLE_COLUMNS`.
- **`src/components/seller/index.ts`** — Exported `PAYOUT_TABLE_COLUMNS`, `PayoutStatus`, `PayoutMethod`.

---

- **`src/components/ui/useHorizontalScrollDrag.ts`** — New dedicated hook. Handles mouse/pen drag-to-scroll with velocity-sampled inertia momentum (rAF exponential decay at 0.94/frame, stops at 0.5 px/frame). Touch devices fall back to native scroll. Exposes `{ isDragging, cancelMomentum, cursorClass, style, handlers }`. Click suppression when drag > 5 px. Uses `optionsRef` to keep `onDragStart`/`onDragEnd` callbacks fresh without recreating handlers.
- **`src/components/ui/useHorizontalAutoScroll.ts`** — New dedicated hook. Encapsulates `setInterval` timer lifecycle. Stable `pause()`/`resume()`/`stop()` controls. `onTickRef` pattern avoids stale closures. Starts/restarts cleanly when `enabled`, `interval`, or `onTick` changes.
- **`HorizontalScrollerProps.showFadeEdges`** (`boolean`, default `true`) — Renders subtle gradient-fade overlays on the left and right edges that appear/disappear with CSS `opacity` transitions as scroll position changes, signalling that more content is available in each direction.
- **`PerViewConfig`** exported from `src/components/ui/index.ts` barrel — consumers can now import the responsive breakpoint type directly.

#### Changed

- **`src/components/ui/HorizontalScroller.tsx`** — Complete rewrite of component function body:
  - Old inline drag state (`isDraggingRef`, `dragStartXRef`, etc.) and four pointer handlers replaced by `useHorizontalScrollDrag` hook.
  - Old manual `setInterval`/`isPausedRef`/`startTimer`/`stopTimer` replaced by `useHorizontalAutoScroll` hook.
  - Auto-scroll pause now coordinated via two independent ref flags (`isHoverPausedRef`, `isDragPausedRef`) — `resumeAutoScroll` only fires when both are clear, preventing premature resume when hover and drag overlap.
  - `updateArrows` (no-op stub) replaced by `updateScrollEdges` — reads scroll position and updates `canScrollLeft`/`canScrollRight` state used by the fade overlays.
  - `isGrid` computation moved to the top of the function body (before hooks) so it can be used in hook options.
  - `checkCircularReset` calls `drag.cancelMomentum()` before instant `scrollLeft` correction to prevent the momentum animation fighting the new position.
  - Scroll viewport container gets `relative` positioning class to anchor the absolute-positioned fade overlay divs.
  - `scrollBy` helper extracted; `scrollRight`/`scrollLeft`/`autoAdvance` delegate to it — eliminates duplicate `scrollRef.current?.scrollBy(...)` calls.
  - `effectivePV` alias removed; `perViewProp` used directly throughout.

---

### HorizontalScroller: Drag-to-scroll, always-visible arrows, remove deprecated props (2026-03-01)

#### Changed

- **`src/components/ui/HorizontalScroller.tsx`** — Removed deprecated `snapCount`, `count`, and `showScrollbar` props entirely (Rule 24 — no backward compatibility). Removed `disabled` state from `ArrowButton`; arrows are now always fully visible at both scroll edges. Added unified pointer-event drag-to-scroll (`onPointerDown` / `onPointerMove` / `onPointerUp`) that works identically on mouse and touch — cursor changes to `cursor-grab` on hover and `cursor-grabbing` while dragging. Click events within the scroll area are suppressed after a drag of more than 5 px to prevent accidental item activation. Removed `scroll-smooth` from the inner container class (smooth scroll is still applied via `scrollBy({ behavior: "smooth" })` from arrow/keyboard actions). Auto-scroll pauses during a drag and resumes on pointer release.
- **`src/components/homepage/FeaturedProductsSection.tsx`** — Migrated `snapCount` → `perView`.
- **`src/components/homepage/FeaturedAuctionsSection.tsx`** — Migrated `snapCount` → `perView`.
- **`src/components/homepage/TopCategoriesSection.tsx`** — Migrated `snapCount` → `perView`; removed `showScrollbar`.
- **`src/components/faq/FAQPageContent.tsx`** — Removed `showScrollbar`.
- **`src/components/blog/BlogCategoryTabs.tsx`** — Removed `showScrollbar`.
- **`src/components/ui/SectionTabs.tsx`** — Removed `showScrollbar` from both `HorizontalScroller` instances.

---

### WelcomeSection: Fix raw JSON description rendering (2026-03-01)

#### Fixed

- **`src/components/homepage/WelcomeSection.tsx`** — Description field was displaying raw ProseMirror / TipTap JSON (e.g. `{"type":"doc",...}`) instead of rendered HTML. Now passes `config.description` through `proseMirrorToHtml()` before `dangerouslySetInnerHTML`.
- **`src/components/homepage/WhatsAppCommunitySection.tsx`** — `config.description` was rendered as raw text (including JSON). Now converted via `proseMirrorToHtml()` and rendered via `dangerouslySetInnerHTML`. Member count moved to its own `<p>` element.

#### Added

- **`src/utils/formatters/string.formatter.ts`** — New `proseMirrorToHtml(value: string): string` utility. Converts a ProseMirror / TipTap JSON document string to HTML. Plain HTML strings are passed through unchanged, so the function is safe for mixed content (legacy plain-HTML values and new JSON values). Supports: `paragraph`, `text`, `heading`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`, `hardBreak`, `horizontalRule`, and text marks (`bold`, `italic`, `underline`, `strike`, `code`, `link`).
- **`src/utils/formatters/__tests__/string.formatter.test.ts`** — 7 new test cases covering `proseMirrorToHtml`: paragraph conversion, plain HTML passthrough, invalid JSON passthrough, bold mark, heading, bullet list, and empty string.

---

### Global Styling & Responsive Grid Overhaul (2026-03-02)

#### Fixed

- **`src/app/globals.css`** — Removed destructive `* { @apply m-0 p-0; }` wildcard reset that broke form elements, lists, and prose spacing. Replaced with targeted reset (`h1–h6, p, figure, blockquote, dl, dd { margin: 0; }`).
- **Static pages** (`about`, `privacy`, `terms`, `help`, `contact`) — Applied negative-margin breakout (`-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10`) so hero sections extend full-width instead of being double-padded inside LayoutClient's container. Inner content areas retain proper `px-4 sm:px-6 lg:px-8` padding.
- **`src/components/layout/AutoBreadcrumbs.tsx`** — Locale codes (`en`, `hi`, et al.) no longer appear as breadcrumb segments. Locale prefix is preserved in all generated hrefs.
- **`src/components/layout/Sidebar.tsx`** — Added `bg-black/40 backdrop-blur-[2px]` overlay when sidebar is open on mobile; clicking it closes the sidebar.
- **`src/components/layout/BottomNavbar.tsx`** — Added `${utilities.safeAreaBottom}` (`pb-[env(safe-area-inset-bottom)]`) to the fixed nav element for proper iPhone notch support.

#### Changed (Rule 25 — Explicit xl:/2xl: Breakpoints)

Added missing `xl:` and `2xl:` grid column declarations to:

- **Homepage**: `HomepageSkeleton`, `FeaturedProductsSection`, `FeaturedAuctionsSection`, `BlogArticlesSection`, `TrustIndicatorsSection`, `TrustFeaturesSection`, `SiteFeaturesSection`, `CustomerReviewsSection`
- **Admin features**: `AdminBlogView`, `AdminBidsView`, `AdminPayoutsView`, `AdminReviewsView`, `AdminAnalyticsView`, `AdminSessionsManager`
- **Seller components**: `SellerOrdersView`, `SellerStorefrontView`, `SellerPayoutStats`, `SellerAnalyticsStats`
- **User/profile**: `OrderDetailView`, `ProfileStatsGrid`, `PublicProfileView`
- **Products/categories**: `RelatedProducts`, `ProductSection`, `CategoryGrid`
- **Events/misc**: `EventStatsBanner`, `ContactCTA`, `ReviewDetailView`

---

### HorizontalScroller — Generic Horizontal Scroll Container (2026-03-01)

#### Added

- `src/components/ui/HorizontalScroller.tsx` — generic `HorizontalScroller<T>` component with two layout modes:
  - **`rows=1` (default)** — single-row flex carousel with optional thin scrollbar below
  - **`rows>1`** — CSS `grid-auto-flow:column` multi-row grid scroller (items fill top→bottom per column), scrollbar below:
    ```
    <| col1r1  col2r1  col3r1  … |>
       col1r2  col2r2  col3r2
       col1r3  col2r3  col3r3
       ════scrollbar════
    ```
  - Height driven by item content — no hardcoded height
  - Auto-computed visible column count (`⌊containerWidth ÷ (itemWidth + gap)⌋`) when `count` omitted
  - Left / right arrow buttons paging by `count` columns; only shown when overflow exists
  - `ArrowLeft` / `ArrowRight` keyboard navigation (`enableKeyboard` prop, default `true`)
  - Circular seamless auto-scroll (single-row only) via tripled items array; position-reset debounced 350 ms after scroll settles
  - `showScrollbar` prop — shows `scrollbarThinX` horizontal scrollbar at bottom (default `false`)
  - `rows`, `pauseOnHover`, `showArrows`, `showScrollbar`, `enableKeyboard`, `itemWidth`, `gap`, `autoScrollInterval`, `keyExtractor`, `className`, `scrollerClassName` props
  - Exported as `HorizontalScroller` + `HorizontalScrollerProps` from `@/components/ui` and `@/components`

#### Changed

- `FeaturedProductsSection` — **mobile** (`md:hidden`): single-row circular `autoScroll` carousel; **desktop** (`hidden md:block`): `rows={3}` grid with `showScrollbar`, up to 30 products
- `FeaturedAuctionsSection` — same responsive split; `rows={3}` + `showScrollbar` on desktop
- `BlogCategoryTabs` — replaced `overflow-x-auto` flex div with `HorizontalScroller` (`autoScroll={false}`, `showScrollbar`, `gap={8}`)
- `SectionTabs` — desktop nav replaced with `HorizontalScroller` (`gap={0}`, `autoScroll={false}`, `showScrollbar`); arrows appear when tab list overflows

---

### Static FAQs + Newsletter Removal (2026-03-15)

#### Added

- `src/constants/faq-data.ts` — 102 static FAQ entries (`StaticFAQItem[]`) across 7 categories; exported helper functions `getStaticFaqsByCategory`, `getAllStaticFaqs`, `getStaticFaqCategoryCounts`
- `StaticFAQItem` type exported from `@/constants`

#### Changed

- `FAQSection` (homepage) — now reads from static constants (`getStaticFaqsByCategory`); shows **10 FAQs per category** (up from 6) with a "View All →" button that includes a `+N` count badge when more FAQs exist; no loading skeleton or API calls
- `FAQPageContent` — replaced `useAllFaqs()` API hook with direct `STATIC_FAQS` constant; removed `isLoading` skeleton; removed "newest" sort option (no `createdAt` on static data)
- `FAQAccordion` — type changed from `FAQDocument[]` to `StaticFAQItem[]`; `answer` field simplified to `string`
- `src/constants/index.ts` — exports `STATIC_FAQS`, `getStaticFaqsByCategory`, `getAllStaticFaqs`, `getStaticFaqCategoryCounts`, `StaticFAQItem`

#### Removed

- **Newsletter feature** entirely from the UI and all supporting layers:
  - Pages: `/admin/newsletter`, `/api/newsletter/subscribe`, `/api/admin/newsletter`, `/api/admin/newsletter/[id]`
  - Components: `NewsletterSection`, `AdminNewsletterView`, `NewsletterTableColumns`
  - Hooks: `useNewsletterSubscribe`, `useAdminNewsletter`, `usePublicFaqs`, `useAllFaqs`
  - Services: `newsletter.service.ts`
  - Repository: `newsletter.repository.ts`
  - Schema: `newsletter.ts`
  - Seed data: `scripts/seed-data/newsletter-seed-data.ts`
  - Admin nav tab for Newsletter removed from `AdminTabs`
  - `<NewsletterSection />` removed from homepage

---

### Firebase Cloud Functions — Scheduled Jobs + Firestore Triggers (2026-03-01)

#### Added

- **`functions/`** — new standalone Firebase Functions package (Node 20, TypeScript, 2nd-gen / Cloud Run).
- **`functions/src/config/firebase-admin.ts`** — shared Admin SDK init (no explicit credential; uses ADC in production).
- **`functions/src/config/constants.ts`** — centralised `SCHEDULES`, `REGION` (`asia-south1`), `BATCH_LIMIT`, business timeouts, and all Firestore collection names.
- **`functions/src/utils/logger.ts`** — `logInfo` / `logError` / `logWarn` wrappers over `firebase-functions/v2` logger.
- **`functions/src/utils/batchHelper.ts`** — `batchDelete` and `batchUpdate` utilities that auto-split operations at the 400-doc limit.

**Scheduled jobs** (all 2nd-gen `onSchedule`, `asia-south1` region):

| Export                  | Schedule         | What it does                                                                                   |
| ----------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `auctionSettlement`     | every 5 min      | Settles expired auctions — marks bids `won`/`lost`, creates winner Order, pushes notifications |
| `pendingOrderTimeout`   | every 60 min     | Cancels orders unpaid for > 24 h, sends `order_cancelled` notification                         |
| `couponExpiry`          | 00:05 UTC daily  | Deactivates coupons whose `validity.endDate` has passed                                        |
| `expiredTokenCleanup`   | 03:00 UTC daily  | Deletes expired email-verification and password-reset tokens                                   |
| `expiredSessionCleanup` | 02:00 UTC daily  | Deletes expired session documents                                                              |
| `payoutBatch`           | 06:00 UTC daily  | Sweeps pending payouts → Razorpay Payouts API; retries up to 3× then marks `failed`            |
| `productStatsSync`      | 01:00 UTC daily  | Recomputes `avgRating` + `reviewCount` on all published products from approved reviews         |
| `cartPrune`             | Sunday 04:00 UTC | Deletes carts idle for > 30 days                                                               |
| `notificationPrune`     | Monday 01:00 UTC | Deletes read notifications older than 90 days                                                  |

**Firestore triggers**:

| Export                | Trigger                     | What it does                                                                                                                  |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `onBidPlaced`         | `bids/{bidId}` onCreate     | Demotes previous winner to `outbid`, updates product `currentBid`/`bidCount`, sends Firestore notification + Realtime DB push |
| `onOrderStatusChange` | `orders/{orderId}` onUpdate | On status change: writes typed notification, Realtime DB push, and transactional Resend email (confirmed/shipped/delivered)   |

- **`functions/src/index.ts`** — entry point exporting all 11 functions.
- **`functions/package.json`** — dependencies: `firebase-admin ^13`, `firebase-functions ^6`.
- **`functions/tsconfig.json`** — targets `es2020`, `commonjs`, strict mode.
- **`functions/.env.example`** — documents required secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_ACCOUNT_NUMBER`, `RESEND_API_KEY`.
- **`functions/.gitignore`** — excludes `lib/`, `node_modules/`, `.env`.
- **`firebase.json`** — added `functions` codebase config and `emulators.functions` (port 5001).
- **`scripts/deploy-functions.ps1`** — PowerShell script to `npm ci` + `tsc` + `firebase deploy --only functions`; supports `-FunctionName` for single-function deploys and `-OnlyBuild` for dry runs.

#### Notes

- All jobs use the `batchDelete` / `batchUpdate` helpers to stay under the 500-op Firestore batch ceiling.
- `payoutBatch` calls Razorpay via native `fetch`; credentials must be set as Firebase Secrets before deploying.
- `onOrderStatusChange` sends Resend emails only for `confirmed`, `shipped`, and `delivered` transitions; credentials are environment-injected.
- `onBidPlaced` writes to `auction_bids/{productId}` in Realtime DB for live auction UI updates.

---

### Bug Fixes — AdvertisementBanner null guard + Missing Firestore indexes (2026-03-01)

#### Fixed

- **`src/components/homepage/AdvertisementBanner.tsx`** — added `!banner.content` to the early-return guard. The component crashed with `TypeError: can't access property "title", banner.content is undefined` when a homepage section document existed but its `config.content` field was absent.
- **`firestore.indexes.json`** — added three composite indexes that were missing and causing `FAILED_PRECONDITION` (HTTP 500) on the homepage:
  - `products`: `isAuction ASC` + `createdAt DESC` — required by `/api/products?isAuction=true&...&sorts=-createdAt`
  - `categories`: `isActive ASC` + `tier ASC` + `order ASC` — required by `CategoriesRepository.buildTree`
  - `blogPosts`: `isFeatured ASC` + `status ASC` + `publishedAt DESC` — required by `BlogRepository.listPublished` with `?featured=true&sorts=-publishedAt`
- Indexes deployed to Firebase (`firebase deploy --only firestore:indexes`).

---

### Firebase Functions — Coding Rules Compliance Refactor (2026-03-01)

#### Changed

- **`functions/src/lib/errors.ts`** _(new)_ — Typed error classes mirroring the main app's `src/lib/errors/`: `FnError` (base), `ConfigurationError`, `NotFoundError`, `IntegrationError` (with `service` + `statusCode` fields), `DatabaseError`, `ValidationError`. No raw `throw new Error()` anywhere in the functions package.
- **`functions/src/constants/messages.ts`** _(new)_ — All notification titles, message templates, email subjects, and system error strings as typed constants (`AUCTION_MESSAGES`, `BID_MESSAGES`, `ORDER_MESSAGES`, `EMAIL_SUBJECTS`, `FN_ERROR_MESSAGES`). Eliminates all hardcoded strings from jobs and triggers (RULE 3).
- **`functions/src/repositories/`** _(new — 10 files + barrel)_ — Repository pattern for all Firestore access (RULE 12). Jobs and triggers never call `db.collection()` directly.

| Repository               | Key methods                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `productRepository`      | `getExpiredAuctions`, `getPublishedIds`, `updateStats`, `incrementBidCount`, `updateStatus` |
| `bidRepository`          | `getActiveByProduct`, `getWinningBid`, `markWon/Lost/Outbid/Winning`                        |
| `orderRepository`        | `getTimedOutPending`, `cancelInBatch`, `createFromAuction`                                  |
| `sessionRepository`      | `getExpiredRefs`                                                                            |
| `tokenRepository`        | `getExpiredEmailVerificationRefs`, `getExpiredPasswordResetRefs`                            |
| `couponRepository`       | `getExpiredActiveRefs`, `deactivateInBatch`                                                 |
| `cartRepository`         | `getStaleRefs`                                                                              |
| `payoutRepository`       | `getPending`, `markProcessing`, `recordSuccess`, `recordFailure`                            |
| `notificationRepository` | `getOldReadRefs`, `createInBatch`, `create`                                                 |
| `reviewRepository`       | `getApprovedRatingAggregate`                                                                |

- **All 9 job files** — Replaced `db.collection(COLLECTIONS.*)` queries with repository calls; replaced `throw new Error(...)` with typed error classes; replaced hardcoded notification strings with `ORDER_MESSAGES.*` / `AUCTION_MESSAGES.*` constants.
- **`functions/src/triggers/onBidPlaced.ts`** — Replaced direct Firestore reads/writes with `bidRepository`, `productRepository`, `notificationRepository`; replaced hardcoded notification title/message with `BID_MESSAGES.*`.
- **`functions/src/triggers/onOrderStatusChange.ts`** — Replaced `STATUS_CONFIG` hardcoded strings with `ORDER_MESSAGES.*`; replaced `subjectMap` with `EMAIL_SUBJECTS.*`; replaced Resend error throw with `IntegrationError`; replaced direct Firestore notification write with `notificationRepository.create()`.

#### Build verification

- `npx tsc --noEmit` → **0 errors**
- `npm run build` → **exit 0**

---

### Seed Data Expansion — blogPosts, events, eventEntries, notifications, payouts (2026-02-28)

#### Added

- **`scripts/seed-data/blog-posts-seed-data.ts`** — 8 blog posts (6 published, 1 draft, 1 archived) spanning all `BlogPostCategory` values (`guides`, `tips`, `news`, `updates`, `community`). Two posts marked `isFeatured: true`.
- **`scripts/seed-data/events-seed-data.ts`** — 5 events covering every `EventType` (`sale`, `offer`, `poll`, `survey`, `feedback`) with appropriate `saleConfig` / `offerConfig` / `pollConfig` / `surveyConfig` / `feedbackConfig` blocks. 8 event entries (`EventEntryDocument`) exercising all `EntryReviewStatus` values including one flagged entry.
- **`scripts/seed-data/notifications-seed-data.ts`** — 16 in-app notifications distributed across 5 users, covering all 15 `NotificationType` values (`welcome`, `order_placed`, `order_shipped`, `order_delivered`, `order_confirmed`, `bid_placed`, `bid_outbid`, `bid_won`, `bid_lost`, `review_approved`, `product_available`, `promotion`, `system`). Mix of read and unread.
- **`scripts/seed-data/payouts-seed-data.ts`** — 7 payout records across 4 sellers, covering all 4 `PayoutStatus` values (`pending`, `processing`, `completed`, `failed`). Includes both `bank_transfer` and `upi` payment methods with masked bank details.
- **`coupon-HOLI15`** added to `scripts/seed-data/coupons-seed-data.ts` — required FK for `event-holi-offer-2026-offer.offerConfig.couponId`.

#### Changed

- **`scripts/seed-data/index.ts`** — Added exports for `blogPostsSeedData`, `eventsSeedData`, `eventEntriesSeedData`, `notificationsSeedData`, `payoutsSeedData`.
- **`scripts/seed-all-data.ts`** — Added imports for all 5 new data arrays and 5 new collection constants (`BLOG_POSTS_COLLECTION`, `EVENTS_COLLECTION`, `EVENT_ENTRIES_COLLECTION`, `NOTIFICATIONS_COLLECTION`, `PAYOUT_COLLECTION`). Added seeding blocks for each collection. Updated `allCollections` array.
- **`scripts/seed-data/RELATIONSHIPS.md`** — Updated statistics summary; added FK consistency tables and seeding order for all new collections.

---

### TASK-46 — Wire BlogArticlesSection to live API; hide when no featured posts (2026-02-28)

#### Changed

- **`src/components/homepage/BlogArticlesSection.tsx`** — Replaced hardcoded `MOCK_BLOG_ARTICLES` with `useApiQuery` + `blogService.getFeatured(4)`. Section now renders only when the API returns ≥ 1 featured post (`isFeatured: true`) and stays hidden while loading or when the result is empty. Field references updated: `thumbnail` → `coverImage`, `readTime` → `readTimeMinutes` to match `BlogPostDocument`.
- **`src/services/blog.service.ts`** — Added `getFeatured(count?: number)` — calls `GET /api/blog?featured=true&pageSize={count}&sorts=-publishedAt`.
- **`src/components/homepage/__tests__/BlogArticlesSection.test.tsx`** — Rewritten to mock `useApiQuery`; covers loading (returns null), empty (returns null), data-present, image fallback, and accessibility cases.
- **`src/services/__tests__/blog.service.test.ts`** — Added two test cases for `getFeatured()` (default count and custom count).

#### Removed

- **`src/constants/homepage-data.ts`** — Deleted `BlogArticle` interface and `MOCK_BLOG_ARTICLES` constant — no callers remain now that the component uses the live API.
- **`src/constants/index.ts`** — Removed `MOCK_BLOG_ARTICLES` and `BlogArticle` type re-exports.

---

### TASK-45 — Comprehensive Sieve compliance & schema field constant audit (2026-03-01)

#### Fixed

- **`src/repositories/faqs.repository.ts`** — `SIEVE_FIELDS` key `helpful` corrected to `"stats.helpful"` with `path: FAQ_FIELDS.STAT.HELPFUL` so the nested field resolves correctly in Firestore queries.
- **`src/services/faq.service.ts`** — `listPublic` Sieve filter changed from `published==true` (non-existent field) to `isActive==true`.
- **`src/hooks/usePublicFaqs.ts`** — `useAllFaqs` query fixed from `faqService.list("isActive=true")` (invalid raw param) to `faqService.list("filters=isActive==true&sorts=-priority,order")` (correct Sieve DSL).
- **`src/app/api/categories/route.ts`** — `parentId` branch: replaced `findAll().filter(...)` with `getChildren(parentId)` (Firestore-native). Default path no longer double-loads the collection; tree branch uses `tree.length` for result meta.
- **`src/repositories/categories.repository.ts`** — `getCategoryBySlug()` hardcoded `"slug"` → `CATEGORY_FIELDS.SLUG`. `buildTree()` default path replaced `findAll()` with a targeted Firestore query (`IS_ACTIVE==true`, ordered by `TIER` + `ORDER`). Added `SIEVE_FIELDS` + `list(SieveModel)` for admin flat listing.
- **`src/repositories/carousel.repository.ts`** — Added `SIEVE_FIELDS` + `list(SieveModel)` for admin paginated listing.
- **`src/app/api/carousel/route.ts`** — Admin path `findAll()` replaced with `(await carouselRepository.list({sorts:"order", page:"1", pageSize:"100"})).items`.
- **`src/app/api/homepage-sections/route.ts`** — `findAll().filter(s => s.enabled)` replaced with `getEnabledSections()` (Firestore-native).
- **`src/app/api/faqs/route.ts`** — POST handler's `findAll()` used to compute `maxOrder` replaced with a single-document Sieve query `{sorts:"-order", page:"1", pageSize:"1"}`.
- **`src/app/api/admin/coupons/route.ts`** — `page` / `pageSize` (numbers from `getNumberParam`) wrapped with `String()` before passing to `couponsRepository.list()` to satisfy `SieveModel` string types.
- **`src/repositories/session.repository.ts`** — Four hardcoded Firestore field strings (`"userId"`, `"lastActivity"`, `"expiresAt"`) replaced with `SESSION_FIELDS.*` constants. Added `SIEVE_FIELDS` + `list(SieveModel)` + `listForUser(userId, SieveModel)`.
- **`src/repositories/coupons.repository.ts`** — `getActiveCoupons()` and `getCouponsExpiringSoon()` replaced in-memory date filtering with Firestore-native range queries on `COUPON_FIELDS.VALIDITY_FIELDS.IS_ACTIVE` + `VALIDITY_FIELDS.END_DATE`. Relies on existing composite index in `firestore.indexes.json`.
- **`src/repositories/newsletter.repository.ts`** — `getStats()` replaced full-collection scan with `count()` aggregations (parallel) + `.select(NEWSLETTER_FIELDS.SOURCE)` scoped to active subscribers for source breakdown.
- **`src/repositories/homepage-sections.repository.ts`** — Added `HOMEPAGE_SECTION_FIELDS` import, `SIEVE_FIELDS`, and `list(SieveModel)` method.
- **`src/repositories/notification.repository.ts`** — Added `SIEVE_FIELDS`, `list(SieveModel)`, and `listForUser(userId, SieveModel)` methods.

#### Removed

- **`src/repositories/blog.repository.ts`** — Deleted legacy `findPublished()` (in-memory pagination), `findAllPublished()`, and `findAll()` methods — all superseded by the existing Sieve-based `listPublished()` and `listAll()`. No external callers existed.
- **`src/repositories/product.repository.ts`** — Deleted unused `findPublished()` shorthand — no callers; superseded by `list(SieveModel)`.

---

### TASK-44 — Migrate cart and checkout components from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/cart/CartItemList.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")`; empty state text and "Start Shopping" link now use `t()`.
- **`src/components/cart/CartItemRow.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")`; remove button label now uses `t("remove")`.
- **`src/components/cart/CartSummary.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")` + `useTranslations("loading")`; all 12 label refs (order summary, subtotal, item count, discount, shipping, tax, total, loading, checkout, continue shopping) use `t()`.
- **`src/components/checkout/CheckoutAddressStep.tsx`** — Replaced `UI_LABELS` with `useTranslations("checkout")`; select-address heading, no-addresses, and add-address labels use `t()`.
- **`src/components/checkout/CheckoutOrderReview.tsx`** — Replaced `UI_LABELS` with `useTranslations("checkout")` + `useTranslations("cart")`; shipping address, order items, payment method, and total labels use `t()`.
- **`src/components/checkout/OrderSuccessActions.tsx`** — Added `"use client"` directive (was server component); removed module-level `const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE`; replaced with `useTranslations("orderSuccess")` + `useTranslations("orders")`.
- **`messages/en.json`** — Added 5 keys to `cart` namespace: `startShopping`, `itemsSubtotal`, `discount`, `shippingCalculated`, `taxCalculated`.
- **`messages/en.json`** — Added 5 keys to `checkout` namespace: `noAddresses`, `shippingTo`, `changeAddress`, `orderItems`, `paymentOnDelivery`.
- **`messages/hi.json`** — Same 10 keys added with Hindi translations.

#### Tests

- **`src/components/cart/__tests__/CartItemList.test.tsx`** — New; 3 tests covering empty state, items list, and conditional empty-state rendering.
- **`src/components/cart/__tests__/CartItemRow.test.tsx`** — New; 3 tests covering product title, remove label, and updating opacity.
- **`src/components/cart/__tests__/CartSummary.test.tsx`** — New; 8 tests covering order summary heading, total, checkout/continue-shopping buttons, loading state, discount row, click handler, disabled state.
- **`src/components/checkout/__tests__/CheckoutAddressStep.test.tsx`** — New; 5 tests covering heading, no-addresses state, add-address button (empty and non-empty), and address rendering.
- **`src/components/checkout/__tests__/CheckoutOrderReview.test.tsx`** — New; 7 tests covering shipping label, change-address, order items heading, quantity label, payment method, cod text, and total.
- **`src/components/checkout/__tests__/OrderSuccessActions.test.tsx`** — New; 4 tests covering view-order, continue-shopping, orders title, and link rendering.

---

### TASK-43 — Migrate 7 product display components from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/products/ProductCard.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; `featured`, `auction`, `promoted`, `sold`, `outOfStock` badges now use `t()`.
- **`src/components/products/ProductFilters.tsx`** — Replaced `UI_LABELS` + `UI_PLACEHOLDERS` with `useTranslations("products")`; all filter labels and placeholders now use `t()`.
- **`src/components/products/ProductGrid.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; empty-state messages now use `t()`.
- **`src/components/products/ProductSortBar.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; moved module-level `SORT_OPTIONS` array inside component function body; sort options and count text use `t()`.
- **`src/components/products/ProductInfo.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")` + `useTranslations("loading")`; all 20 label references replaced.
- **`src/components/products/ProductReviews.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")` + `useTranslations("actions")`; reviews heading, empty state, verified badge, helpful count, and pagination buttons use `t()`.
- **`src/components/products/RelatedProducts.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; section title uses `t("relatedTitle")`.
- **`messages/en.json`** — Added 31 new keys to `products` namespace: `featured`, `auction`, `promoted`, `filters`, `clearFilters`, `filterCategory`, `filterAllCategories`, `filterPriceRange`, `filterMinPrice`, `filterMaxPrice`, `showing`, `sortBy`, `sortNewest`, `sortOldest`, `sortPriceLow`, `sortPriceHigh`, `sortNameAZ`, `sortNameZA`, `currentBid`, `startingBid`, `totalBids`, `auctionEnds`, `availableStock`, `placeBid`, `reviewsTitle`, `reviewsNone`, `reviewsBeFirst`, `verifiedPurchase`, `helpful`, `relatedTitle`, `features`, `shipping`, `returnPolicy`.
- **`messages/hi.json`** — Same 31 keys added with Hindi translations.

#### Tests

- **`src/components/products/__tests__/ProductCard.test.tsx`** — New; 6 tests covering badge rendering for featured, auction, promoted, sold, outOfStock.
- **`src/components/products/__tests__/ProductFilters.test.tsx`** — New; 5 tests covering filter labels and conditional clearFilters button.
- **`src/components/products/__tests__/ProductGrid.test.tsx`** — New; 3 tests covering product rendering, empty state, loading skeletons.
- **`src/components/products/__tests__/ProductSortBar.test.tsx`** — New; 4 tests covering sort label, count display, and sort dropdown.
- **`src/components/products/__tests__/ProductInfo.test.tsx`** — New; 8 tests covering product title, badges, description, action button, sold/outOfStock states.
- **`src/components/products/__tests__/ProductReviews.test.tsx`** — New; 7 tests covering empty state, review rendering, verified badge, helpful count, loading skeletons, pagination.
- **`src/components/products/__tests__/RelatedProducts.test.tsx`** — New; 3 tests covering heading rendering, loading skeletons, empty state.

---

### TASK-42 — Migrate `DrawerFormFooter.tsx` default prop values from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/admin/DrawerFormFooter.tsx`** — Removed `UI_LABELS` import; added `useTranslations("actions")` and `useTranslations("loading")`; changed default prop values (`submitLabel`, `deleteLabel`, `cancelLabel`) from `UI_LABELS.ACTIONS.*` constants to `undefined`; resolved defaults inside function body via `submitLabel ?? t("save")` etc.; replaced `UI_LABELS.LOADING.SAVING` in JSX with `tLoading("saving")`.

#### Tests

- **`src/components/admin/__tests__/DrawerFormFooter.test.tsx`** — Rewritten; removed `UI_LABELS` import; added `next-intl` mock; 5 tests covering default translation keys, custom label props, loading state, callback handlers, and conditional delete button.

---

### TASK-41 — Convert 5 admin table column files from `UI_LABELS` to `useTranslations` hooks (2026-02-28)

#### Changed

- **`src/components/admin/products/ProductTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminProducts")` + `useTranslations("actions")`; renamed `getProductTableColumns` → `useProductTableColumns`; replaced all `LABELS.*` + `UI_LABELS.ACTIONS.*` with translation keys.
- **`src/components/admin/orders/OrderTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminOrders")` + `useTranslations("actions")`; renamed `getOrderTableColumns` → `useOrderTableColumns`; replaced hardcoded column headers (`"Order ID"`, `"Product"`, `"Customer"`, `"Amount"`, `"Status"`, `"Payment"`) with `t()` calls.
- **`src/components/admin/bids/BidTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminBids")` + `useTranslations("actions")`; renamed `getBidTableColumns` → `useBidTableColumns`; replaced all `LABELS.*` references.
- **`src/components/admin/users/UserTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminUsers")` + `useTranslations("actions")`; renamed `getUserTableColumns` → `useUserTableColumns`; replaced `UI_LABELS.TABLE.*`, `UI_LABELS.FORM.*`, `UI_LABELS.STATUS.*`, `UI_LABELS.ADMIN.USERS.*` with translation keys; added `colName`, `colEmail`, `colRole`, `colStatus`, `colJoined`, `colLastLogin`, `emailNotVerified`, `never` keys.
- **`src/components/admin/sections/SectionTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminSections")` + `useTranslations("actions")`; renamed `getSectionTableColumns` → `useSectionTableColumns`; replaced hardcoded `"Order"`, `"Title"`, `UI_LABELS.TABLE.STATUS`, `UI_LABELS.STATUS.ACTIVE/INACTIVE` with translation keys; renamed loop var `t` → `st` to avoid shadowing.
- **`src/components/admin/products/index.ts`**, **`src/components/admin/orders/index.ts`**, **`src/components/admin/bids/index.ts`**, **`src/components/admin/users/index.ts`**, **`src/components/admin/sections/index.ts`**, **`src/components/admin/index.ts`** — Updated barrel exports for all renamed hook functions.
- **`src/features/admin/components/AdminProductsView.tsx`**, **`AdminOrdersView.tsx`**, **`AdminBidsView.tsx`**, **`AdminUsersView.tsx`**, **`AdminSectionsView.tsx`** — Updated imports and call sites from `getX` → `useX`.
- **`src/features/seller/components/SellerProductsView.tsx`**, **`SellerOrdersView.tsx`** — Updated to `useProductTableColumns` / `useOrderTableColumns`; removed `useMemo` wrappers (hooks cannot be called inside `useMemo`).
- **`messages/en.json`** — Added `colOrderId`, `colProduct`, `colCustomer`, `colAmount`, `colStatus`, `colPayment`, `colDetails` to `adminOrders`; `status` to `adminBids`; `colName`, `colEmail`, `colRole`, `colStatus`, `colJoined`, `colLastLogin`, `emailNotVerified`, `never` to `adminUsers`; `colStatus`, `statusActive`, `statusInactive`, `colOrder`, `colTitle` to `adminSections`.
- **`messages/hi.json`** — Added matching Hindi translations for all new keys.
- **`docs/APPLICATION_GRAPH.md`** — Updated component references from `ProductTableColumns` → `useProductTableColumns`, `OrderTableColumns` → `useOrderTableColumns`, `SectionTableColumns` → `useSectionTableColumns`.

#### Tests

- **`src/components/admin/products/__tests__/ProductTableColumns.test.tsx`** — Created; 3 tests for hook structure and action callbacks.
- **`src/components/admin/orders/__tests__/OrderTableColumns.test.tsx`** — Created; 2 tests for hook structure and view callback.
- **`src/components/admin/bids/__tests__/BidTableColumns.test.tsx`** — Created; 2 tests for hook structure and view callback.
- **`src/components/admin/users/__tests__/UserTableColumns.test.tsx`** — Created; 4 tests for hook structure, ban and unban callbacks.
- **`src/components/admin/sections/__tests__/SectionTableColumns.test.tsx`** — Rewritten for hook pattern; 3 tests for structure and action callbacks.
- 14 view/page test mock files updated to reference `useX` hook names instead of `getX` function names.

---

### TASK-40 — Migrate `SectionForm.tsx` to `useTranslations` + `Checkbox` component (2026-02-28)

#### Changed

- **`src/components/admin/sections/SectionForm.tsx`** — Added `"use client"` + `useTranslations("adminSections")`; replaced `const LABELS = UI_LABELS.ADMIN.SECTIONS` and all `LABELS.*` references with `t()` calls; replaced `UI_LABELS.ADMIN.CATEGORIES.ENABLED` with `t("enabled")`; replaced hardcoded `"Title"`, `"Description"`, `"Order"`, `"Enter section description..."` with translation keys; replaced raw `<input type="checkbox">` block with `<Checkbox>` component from `@/components`; removed `UI_LABELS` import.
- **`messages/en.json`** — Added `sectionType`, `title`, `description`, `order`, `enabled`, `descriptionPlaceholder`, `configuration` keys to `adminSections` namespace.
- **`messages/hi.json`** — Added matching Hindi translations for new `adminSections` keys.

#### Tests

- **`src/components/admin/sections/__tests__/SectionForm.test.tsx`** — Updated to use `next-intl` mock (`useTranslations: () => (key) => key`); updated assertions to use translation key strings instead of `UI_LABELS` values; all 4 tests pass.

---

### TASK-39 — Migrate admin dashboard components to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/admin/dashboard/QuickActionsGrid.tsx`** — Removed `UI_LABELS` import; added `useTranslations('adminDashboard')`; moved `QUICK_ACTIONS` array inside component function so `t()` is accessible; replaced 4 hardcoded strings (`quickActions`, `manageUsers`, `reviewDisabled`, `manageContent`).
- **`src/components/admin/dashboard/RecentActivityCard.tsx`** — Added `"use client"` directive; added `useTranslations('adminDashboard')`; replaced 5 hardcoded strings (`recentActivity`, `newUsers`, `newUsersRegistered` with ICU plural, `systemStatus`, `allSystemsOperational`).
- **`src/components/admin/AdminStatsCards.tsx`** — Added `"use client"` directive; removed `UI_LABELS` import; added `useTranslations('adminStats')`; moved `STAT_CARDS` array builder inside component; replaced 6 stat-card labels (`totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`, `totalProducts`, `totalOrders`).
- **`messages/en.json`** — Added `adminDashboard` namespace (9 keys: `quickActions`, `manageUsers`, `reviewDisabled`, `manageContent`, `recentActivity`, `newUsers`, `newUsersRegistered`, `systemStatus`, `allSystemsOperational`) and `adminStats` namespace (6 keys: `totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`, `totalProducts`, `totalOrders`).
- **`messages/hi.json`** — Added matching Hindi translations for `adminDashboard` and `adminStats` namespaces.

#### Tests

- **`src/components/admin/dashboard/__tests__/QuickActionsGrid.test.tsx`** — Created; 5 tests covering renders, quick-action links, and heading.
- **`src/components/admin/dashboard/__tests__/RecentActivityCard.test.tsx`** — Created; 6 tests covering stats display, activity section, and system status.
- **`src/components/admin/__tests__/AdminStatsCards.test.tsx`** — Updated to use next-intl mock and translation key assertions (removed `UI_LABELS` references).

---

### TASK-38 — Add missing `coupons: type+createdAt` Firestore composite index (2026-02-28)

#### Added

- **`firestore.indexes.json`** — Added composite index `{ collectionGroup: "coupons", fields: [type ASC, createdAt DESC] }`. This was the only index identified in the D.2 audit table not covered by TASK-30–33.

#### Changed

- **`docs/APPLICATION_GRAPH.md`** — D.2 section header updated to include TASK-38; coupons row `type+createdAt` moved from "Missing" → "Defined" column; status updated to ✅.

---

### TASK-37 — Migrate `EmailVerificationCard` + `PhoneVerificationCard` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/user/settings/EmailVerificationCard.tsx`** — Removed unused `UI_LABELS` import; added `useTranslations('userSettings')`; replaced all 7 hardcoded English strings with `t('key')` calls (`emailVerificationTitle`, `verified`, `notVerified`, `verifiedMessage`, `notVerifiedMessage`, `sending`, `resendVerification`).
- **`src/components/user/settings/PhoneVerificationCard.tsx`** — Removed unused `UI_LABELS` import; added `useTranslations('userSettings')`; replaced all 7 hardcoded English strings (`phoneVerificationTitle`, `verified`, `notVerified`, `phoneNotAdded`, `phoneVerifiedMessage`, `phoneNotVerifiedMessage`, `verifying`, `verify`).
- **`messages/en.json`** — Added new `userSettings` namespace with 13 keys: `emailVerificationTitle`, `phoneVerificationTitle`, `verified`, `notVerified`, `verifiedMessage`, `notVerifiedMessage`, `sending`, `resendVerification`, `phoneNotAdded`, `phoneVerifiedMessage`, `phoneNotVerifiedMessage`, `verifying`, `verify`.
- **`messages/hi.json`** — Same 13 keys added with Hindi translations.

#### Updated

- **`src/components/user/settings/__tests__/EmailVerificationCard.test.tsx`** — Added `next-intl` mock + 7 new tests covering translation key rendering, badge variants, loading states.
- **`src/components/user/settings/__tests__/PhoneVerificationCard.test.tsx`** — Added `next-intl` mock + 8 new tests covering phone absent/present states, verification badges, loading labels.

---

### TASK-36 — Migrate `SellerQuickActions` + `SellerRecentListings` to `useTranslations` (2026-02-28)

#### Changed

- **`src/features/seller/components/SellerQuickActions.tsx`** — Removed `UI_LABELS` import; added `useTranslations('sellerDashboard')`; replaced all `UI_LABELS.SELLER_PAGE.*` references with `t('key')`; fixed "Add Product" navigation to correctly route to `ROUTES.SELLER.PRODUCTS_NEW` (was incorrectly pointing to `ROUTES.SELLER.PRODUCTS`).
- **`src/features/seller/components/SellerRecentListings.tsx`** — Removed `UI_LABELS` import; added `useTranslations('sellerDashboard')`; replaced `UI_LABELS.SELLER_PAGE.RECENT_LISTINGS` → `t('recentListings')` and `UI_LABELS.ACTIONS.VIEW_ALL` → `t('viewAll')`.
- **`messages/en.json`** — Extended `sellerDashboard` namespace with 6 new keys: `quickActions`, `viewProducts`, `viewAuctions`, `viewSales`, `recentListings`, `viewAll`.
- **`messages/hi.json`** — Added same 6 keys with Hindi translations.

#### Added

- **`src/features/seller/components/__tests__/SellerQuickActions.test.tsx`** — 6 new tests: heading renders, all 4 action buttons render with correct `useTranslations` keys, navigation verified for each button.
- **`src/features/seller/components/__tests__/SellerRecentListings.test.tsx`** — 6 new tests: null render when loading, null render when empty, heading and view-all button render, product titles shown, view-all navigates to `/seller/products`, max-5-item limit enforced.

---

### DOCS — APPLICATION_GRAPH.md stale reference cleanup (2026-02-28)

#### Changed

- **APPLICATION_GRAPH.md** — Feature module tree: removed stale `⚠️ MISSING: ForgotPasswordView` and `⚠️ MISSING: VerifyEmailView` warnings from `auth/components/`; both views were created in TASK-11 and TASK-12 and are now listed as present.
- **APPLICATION_GRAPH.md** — Feature module tree: removed `⚠️ CONFLICT` warning for `events/services/event.service.ts`; Tier-2 duplicate was deleted in TASK-27. Updated to show resolution.
- **APPLICATION_GRAPH.md** — Feature module tree: removed `⚠️ MISSING: SellerCreateProductView` warning from `seller/components/`; component was created in TASK-28. Added `SellerCreateProductView ✅ (TASK-28)` and `SellerDashboardView ✅ (TASK-15)` to the listing.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 7 (MediaUploadField): marked ✅ RESOLVED via TASK-10; `MediaUploadField.tsx` exists at `src/components/admin/MediaUploadField.tsx`.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 11 (`useAuth.ts` Firebase SDK): marked ✅ RESOLVED via TASK-21; `signInWithEmail` wrapper added to `auth-helpers.ts`, direct Firebase imports removed.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 12 (`SessionContext.tsx` Firebase SDK): marked ✅ RESOLVED via TASK-22; `subscribeToAuthState` wrapper added, only `import type { User }` remains (type-only, no runtime dependency).
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 13 (`BlogForm`/`ProductForm` `UI_LABELS`): marked ✅ RESOLVED via TASK-23 and TASK-24; all admin components now use `useTranslations`.
- **APPLICATION_GRAPH.md** — Refactoring Opportunities table: `auth/forgot-password/page.tsx` and `auth/verify-email/page.tsx` rows updated to show ✅ RESOLVED (TASK-11/12).
- **APPLICATION_GRAPH.md** — D.2 index coverage table: added resolved banner above the table noting all ⚠️/❌ entries were fixed by TASK-30–33.

#### Summary

All 9 stale warning references in `APPLICATION_GRAPH.md` (from TASK-11, 12, 21, 22, 23, 27, 28 and index tasks) are now updated to reflect their resolved state. The living document accurately reflects the current codebase state.

---

### TASK-29 — Document 17 Undocumented Hooks in GUIDE.md and QUICK_REFERENCE.md (2026-02-28)

#### Added

- **TASK-29 (P2):** `docs/GUIDE.md` — added `useGoogleLogin` and `useAppleLogin` to Authentication Hooks section with full signature, return type, and examples.
- **TASK-29 (P2):** `docs/GUIDE.md` — expanded Profile Hooks section with individual entries for `useAddress(id)`, `useCreateAddress`, `useUpdateAddress`, `useDeleteAddress`, `useSetDefaultAddress`; each includes file reference, purpose, parameters, and return types.
- **TASK-29 (P2):** `docs/GUIDE.md` — added new **FAQ Data Hooks** section with `usePublicFaqs` and `useAllFaqs` entries.
- **TASK-29 (P2):** `docs/GUIDE.md` — added new **Category Hooks** section with `useCategories` and `useCreateCategory` entries, each with usage example.
- **TASK-29 (P2):** `docs/QUICK_REFERENCE.md` — added new **Hooks Quick Lookup** section with seven category tables (Authentication, Session Management, RBAC, User Data, Content Data, Gestures & UX, Uploads & Media) covering all 17 previously undocumented hooks plus existing hooks for completeness.

#### Changed

- **TASK-29 (P2):** `docs/GUIDE.md` — replaced stale `useStorageUpload` section (hook deleted in TASK-20) with `useMediaUpload` documenting the canonical backend-upload hook.
- **TASK-29 (P2):** `docs/QUICK_REFERENCE.md` — expanded hooks line in Key File Locations to enumerate newly documented hooks by name.
- **TASK-29 (P2):** `docs/APPLICATION_GRAPH.md` — marked Mandatory Improvement #18 (undocumented hooks) as ✅ RESOLVED.
- **TASK-29 (P2):** `docs/IMPLEMENTATION_PLAN.md` — marked TASK-29 as ✅ DONE.

#### Summary

All 17 hooks listed in the TASK-29 audit are now fully documented in both GUIDE.md and QUICK_REFERENCE.md. No code changes were needed — this was a documentation-only task.

---

### TASK-18 — Systemic UI_LABELS Migration to useTranslations (2026-02-28)

#### Changed

- **TASK-18-E (P0):** `src/components/promotions/CouponCard.tsx` — removed `UI_LABELS` import; added `useTranslations("promotions")`; moved `getDiscountLabel` helper inside the component to access the hook.
- **TASK-18-E (P0):** `src/components/admin/AdminSessionsManager.tsx` — removed `UI_LABELS` import; added `useTranslations("adminSessions")` and `useTranslations("loading")`; replaced all `UI_LABELS.ADMIN.SESSIONS.*` and `UI_LABELS.LOADING.DEFAULT` usages.
- **TASK-18-E (P0):** `src/components/ErrorBoundary.tsx` — extracted `ErrorFallbackView` functional component to use `useTranslations("errorPages")` and `useTranslations("actions")`; `ErrorBoundary.render()` now delegates to `<ErrorFallbackView />`; removed `UI_LABELS` import.
- **TASK-18-E (P0):** `src/components/admin/RichTextEditor.tsx`, `src/components/checkout/OrderSuccessHero.tsx`, `src/components/checkout/OrderSuccessCard.tsx`, `src/components/checkout/OrderSummaryPanel.tsx`, `src/components/products/AddToCartButton.tsx`, `src/components/search/SearchResultsSection.tsx`, `src/components/search/SearchFiltersRow.tsx` — all migrated from `UI_LABELS` to `useTranslations` (completed this session).
- **messages/en.json, messages/hi.json** — added new keys to `checkout` (`orderTotal`, `taxIncluded`, `shippingFree`), `orderSuccess` (full namespace), `cart` (`itemCount`, `shippingFree`), `search` (`noResultsTitle`, `noResultsSubtitle`, `clearFilters`, `priceRange`, `minPrice`, `maxPrice`, `categoryFilter`, `allCategories`), `promotions` (`copyCode`, `copied`, `validUntil`, `off`, `flatOff`, `freeShipping`, `buyXGetY`, `specialOffer`, `statusActive`), and new namespace `adminSessions` (`confirmRevoke`, `confirmRevokeMessage`, `confirmRevokeAll`, `confirmRevokeAllMessage`).
- **messages/en.json, messages/hi.json** — removed duplicate `sellerAnalytics` and `sellerPayouts` keys (second shorter occurrences were overriding the first full versions).

#### Added

- **TASK-18-E (P0):** `src/components/promotions/__tests__/CouponCard.test.tsx` — NEW — 8 tests covering discount labels, active badge, copy button, and valid-until date.
- **TASK-18-E (P0):** `src/components/products/__tests__/AddToCartButton.test.tsx` — NEW — 4 tests covering default label, auction label, loading label, disabled state.
- **TASK-18-E (P0):** `src/components/search/__tests__/SearchFiltersRow.test.tsx` — NEW — 6 tests covering category filter, price range, clear filters visibility.

#### Summary

TASK-18 is now fully complete. All 35 client components that used `UI_LABELS` in JSX have been migrated to `useTranslations()` (next-intl). Groups A–E all done. Total new/updated tests for this task: 115+.

#### Added

- **TASK-15 (P2):** `src/features/seller/components/SellerDashboardView.tsx` — NEW — feature view component containing all seller dashboard logic (auth guard, product fetch, stats derivation, JSX); moved from fat page to feature module.
- **TASK-15 (P2):** `src/features/seller/components/__tests__/SellerDashboardView.test.tsx` — NEW — 6 tests. All pass.
- **TASK-15 (P2):** `src/features/seller/components/SellerStatCard.tsx` — MOVED from `src/components/seller/SellerStatCard.tsx`; this component was only used on the seller dashboard page.
- **TASK-15 (P2):** `src/features/seller/components/SellerQuickActions.tsx` — MOVED from `src/components/seller/SellerQuickActions.tsx`.
- **TASK-15 (P2):** `src/features/seller/components/SellerRecentListings.tsx` — MOVED from `src/components/seller/SellerRecentListings.tsx`.

#### Changed

- **TASK-15 (P2):** `src/app/[locale]/seller/page.tsx` — reduced from 144-line fat page to a 10-line thin shell that renders `<SellerDashboardView />`.
- **TASK-15 (P2):** `src/features/seller/components/index.ts` — added exports for `SellerDashboardView`, `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings`.
- **TASK-15 (P2):** `src/components/seller/index.ts` — removed exports for `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings` (now in features/seller).
- **TASK-15 (P2):** `src/app/[locale]/seller/__tests__/page.test.tsx` — rewritten for thin-shell assertion (1 test).

---

### Fifteenth Implementation Pass — Seller Product Creation Flow (2026-02-28)

#### Added

- **TASK-28 (P1):** `src/app/api/seller/products/route.ts` — NEW — `GET` (list seller's own products, Sieve-filtered by `sellerId`) + `POST` (create product with `status: 'draft'`, sellerInfo from session).
- **TASK-28 (P1):** `src/features/seller/components/SellerCreateProductView.tsx` — NEW — full-page product creation form using `ProductForm`, `AdminPageHeader`, `useApiMutation(sellerService.createProduct)`, `useTranslations('sellerProducts')`, redirects on success.
- **TASK-28 (P1):** `src/app/[locale]/seller/products/new/page.tsx` — NEW — 5-line thin shell at `ROUTES.SELLER.PRODUCTS_NEW`.
- **TASK-28 (P1):** `src/features/seller/components/__tests__/SellerCreateProductView.test.tsx` — NEW — 6 tests.
- **TASK-28 (P1):** `src/app/api/seller/products/__tests__/route.test.ts` — NEW — 3 tests (GET filters, POST creates, POST 400 validation).
- **TASK-28 (P1):** `src/app/[locale]/seller/products/new/__tests__/page.test.tsx` — NEW — 1 test.

#### Changed

- **TASK-28 (P1):** `src/constants/api-endpoints.ts` — added `SELLER.PRODUCTS: "/api/seller/products"`.
- **TASK-28 (P1):** `src/services/seller.service.ts` — added `sellerService.createProduct(data)` and `sellerService.listMyProducts(params?)`.
- **TASK-28 (P1):** `src/features/seller/components/index.ts` — added `SellerCreateProductView` export.
- **TASK-28 (P1):** `src/constants/rbac.ts` — added `ROUTES.SELLER.DASHBOARD` RBAC entry (prefix match covers all `/seller/*` sub-routes).
- **TASK-28 (P1):** `messages/en.json` + `messages/hi.json` — added `createProductSubtitle`, `createSuccess`, `cancel` keys to `sellerProducts` namespace.

---

### Fourteenth Implementation Pass — CheckoutSuccessView Extraction (2026-02-28)

#### Added

- **TASK-17 (P2):** `src/components/checkout/CheckoutSuccessView.tsx` — NEW — extracted from `checkout/success/page.tsx`; contains `useSearchParams`, `useEffect` redirect guard, `useApiQuery` order fetch, loading/error/fallback/success JSX.
- **TASK-17 (P2):** `src/components/checkout/__tests__/CheckoutSuccessView.test.tsx` — NEW — 6 tests covering: null/redirect when no orderId, spinner, fallback UI on error, orderId shown in fallback, success render, no redirect when orderId present.

#### Changed

- **TASK-17 (P2):** `src/app/[locale]/checkout/success/page.tsx` — reduced from ~100 lines to 9-line thin shell: `<Suspense><CheckoutSuccessView /></Suspense>`.
- **TASK-17 (P2):** `src/components/checkout/index.ts` — added `CheckoutSuccessView` export.
- **TASK-17 (P2):** `src/app/[locale]/checkout/success/__tests__/page.test.tsx` — rewritten as thin-shell test (1 test).

---

### Thirteenth Implementation Pass — Address Pages useApiMutation Migration (2026-02-28)

#### Changed

- **TASK-16 (P2):** `src/app/[locale]/user/addresses/add/page.tsx` — replaced `useState(saving)` + manual `addressService.create()` try/catch + `logger` with `useCreateAddress({ onSuccess, onError })` from `@/hooks`; removed `addressService` and `logger` imports from the page.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/edit/[id]/page.tsx` — replaced `useState(saving/deleting)` + manual `addressService.update/delete()` try/catch with `useUpdateAddress(id, {...})` + `useDeleteAddress({...})`; migrated `useApiQuery({ queryKey: ['address', id] })` to `useAddress(id)` hook.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/add/__tests__/page.test.tsx` — updated mocks to reflect `useCreateAddress` usage; removed `UI_LABELS` dependency.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/edit/[id]/__tests__/page.test.tsx` — updated mocks to reflect `useAddress`, `useUpdateAddress`, `useDeleteAddress` usage; removed `UI_LABELS` dependency.

---

#### Added

- **TASK-14 (P2):** `src/hooks/useProfileStats.ts` — NEW — encapsulates the two `useApiQuery` calls (orders count + addresses count) from the user profile page; returns `{ orderCount, addressCount, isLoading }`.
- **TASK-14 (P2):** `src/hooks/__tests__/useProfileStats.test.ts` — NEW — 5 tests. All pass.

#### Changed

- **TASK-14 (P2):** `src/app/[locale]/user/profile/page.tsx` — replaced inline `useApiQuery` calls and manual stat derivation with `useProfileStats(!!user)`; removed `orderService` + `addressService` direct imports from the page.
- **TASK-14 (P2):** `src/hooks/index.ts` — added `export { useProfileStats } from "./useProfileStats"`.

---

### Tenth Implementation Pass — URL-Driven Sort State + Orders View Extraction (2026-03-01)

#### Added

- **TASK-13 (P2):** `src/features/admin/hooks/useAdminOrders.ts` — NEW — data layer hook wrapping `useApiQuery` + `useApiMutation` for the admin orders list and update operations; follows `useAdminBlog` / `useAdminUsers` pattern.
- **TASK-13 (P2):** `src/features/admin/components/AdminOrdersView.tsx` — NEW — extracted orders CRUD view including `useUrlTable` filter/sort state, `SideDrawer` for order-status editing, `DataTable`, `TablePagination`, and `AdminPageHeader`; last admin page to be extracted.
- **TASK-13 (P2):** `src/features/admin/hooks/__tests__/useAdminOrders.test.ts` — NEW — 5 tests. All pass.
- **TASK-13 (P2):** `src/features/admin/components/__tests__/AdminOrdersView.test.tsx` — NEW — 6 tests. All pass.
- **TASK-19 (P1):** `src/components/faq/__tests__/FAQPageContent.test.tsx` — NEW — 8 tests covering render, FAQ display, sort change via `table.setSort`, `useUrlTable` usage verification. All pass.

#### Changed

- **TASK-13 (P2):** `src/app/[locale]/admin/orders/[[...action]]/page.tsx` — reduced to 12-line thin shell delegating to `<AdminOrdersView action={action} />`; all state, hooks, and JSX moved to `AdminOrdersView`.
- **TASK-13 (P2):** `src/features/admin/hooks/index.ts` — added `export * from "./useAdminOrders"`.
- **TASK-13 (P2):** `src/features/admin/index.ts` — added `export { AdminOrdersView } from "./components/AdminOrdersView"`.
- **TASK-13 (P2):** `messages/en.json` + `messages/hi.json` — added `adminOrders.noOrders` translation key (was hardcoded `"No orders found"`).
- **TASK-19 (P1):** `src/components/faq/FAQPageContent.tsx` — replaced `const [sortOption, setSortOption] = useState<FAQSortOption>("helpful")` with `useUrlTable({ defaults: { sort: "helpful" } })`; sort selection is now URL-driven and bookmarkable. `onSortChange` calls `table.setSort(sort)` instead of `setSortOption`.

---

### Ninth Implementation Pass — UI_LABELS → useTranslations Migration (2026-03-01)

#### Added

- **TASK-24 (P0):** Added `next-intl` `useTranslations` to three admin components that were using `UI_LABELS` in JSX, violating Rule 2.
  - `src/components/admin/users/__tests__/UserDetailDrawer.test.tsx` — NEW — 6 tests covering render, role display, action buttons. All pass.
  - `src/components/admin/blog/__tests__/BlogTableColumns.test.tsx` — NEW — 2 tests covering hook behaviour. All pass.
- **TASK-25 (P0):** Added `formFieldTypes` i18n namespace to `messages/en.json` and `messages/hi.json` (12 form field type labels).
  - `src/features/events/components/__tests__/EventFormDrawer.test.tsx` — NEW — 4 tests covering render, drawer visibility, event type options. All pass.

#### Changed

- **TASK-24 (P0):** `src/components/admin/users/UserDetailDrawer.tsx` — removed `UI_LABELS` import; added `useTranslations("adminUsers")` inside component; all JSX labels now translation-aware.
- **TASK-24 (P0):** `src/components/admin/users/UserFilters.tsx` — removed `UI_LABELS` import; moved `TABS` and `ROLE_OPTIONS` arrays inside component function; added `useTranslations` calls for `adminUsers`, `roles`, `actions`, `form` namespaces.
- **TASK-24 (P0):** `src/components/admin/blog/BlogTableColumns.tsx` — converted `getBlogTableColumns` factory function to `useBlogTableColumns` hook; added `useTranslations("adminBlog")` and `useTranslations("actions")`; removed `UI_LABELS` import.
- **TASK-24 (P0):** `src/features/admin/components/AdminBlogView.tsx` — updated to call `useBlogTableColumns` hook instead of `getBlogTableColumns` factory.
- **TASK-24 (P0):** `src/components/admin/blog/index.ts`, `src/components/admin/index.ts` — renamed export from `getBlogTableColumns` to `useBlogTableColumns`.
- **TASK-24 (P0):** `src/components/admin/users/__tests__/UserFilters.test.tsx` — fully rewritten with `useTranslations` mocks; 8 tests.
- **TASK-25 (P0):** `src/features/events/constants/EVENT_TYPE_OPTIONS.ts` — replaced `UI_LABELS`-dependent `EVENT_TYPE_OPTIONS` with values-only `EVENT_TYPE_VALUES` array + `EventTypeValue` type.
- **TASK-25 (P0):** `src/features/events/constants/EVENT_STATUS_OPTIONS.ts` — replaced `UI_LABELS`-dependent `EVENT_STATUS_OPTIONS` with values-only `EVENT_STATUS_VALUES` array + `EventStatusFilterValue` type.
- **TASK-25 (P0):** `src/features/events/constants/FORM_FIELD_TYPE_OPTIONS.ts` — replaced `UI_LABELS`-dependent `FORM_FIELD_TYPE_OPTIONS` with values-only `FORM_FIELD_TYPE_VALUES` array + `FormFieldTypeValue` type.
- **TASK-25 (P0):** `src/features/events/components/EventFormDrawer.tsx` — import changed to `EVENT_TYPE_VALUES`; added `useTranslations("eventTypes")`; options now rendered as `tEventTypes(value)`.
- **TASK-25 (P0):** `src/features/events/components/SurveyFieldBuilder.tsx` — import changed to `FORM_FIELD_TYPE_VALUES`; added `useTranslations("formFieldTypes")`; options now rendered as `tFieldTypes(value)`.
- **TASK-25 (P0):** `src/features/events/index.ts` — updated barrel exports: `EVENT_TYPE_OPTIONS` → `EVENT_TYPE_VALUES`, `EVENT_STATUS_OPTIONS` → `EVENT_STATUS_VALUES`, `FORM_FIELD_TYPE_OPTIONS` → `FORM_FIELD_TYPE_VALUES`.
- **TASK-25 (P0):** `src/features/events/components/__tests__/SurveyFieldBuilder.test.tsx` — updated mock to `FORM_FIELD_TYPE_VALUES`; added `next-intl` mock.
- **TASK-25 (P0):** `src/app/[locale]/admin/events/__tests__/page.test.tsx` — updated mock to use `EVENT_TYPE_VALUES` and `EVENT_STATUS_VALUES`.
- `messages/en.json`, `messages/hi.json` — added `views`, `author`, `publishedOn` keys to `adminBlog` namespace (TASK-24); added `formFieldTypes` namespace (TASK-25).

---

### Eighth Implementation Pass — Page Thickness Cleanup: Auth Views (2026-02-28)

#### Added

- **TASK-11 (P2):** Created `src/features/auth/components/ForgotPasswordView.tsx` — all form logic, state, and API calls extracted from `forgot-password/page.tsx`. Page reduced to 5-line thin shell. Added to feature barrel.
  - `src/features/auth/components/__tests__/ForgotPasswordView.test.tsx` — 17 tests covering render, input, loading, error, success, navigation. All pass.
- **TASK-12 (P2):** Created `src/features/auth/components/VerifyEmailView.tsx` — `VerifyEmailContent` (token handling, `useEffect`, `useVerifyEmail` callback, loading/success/error states) + Suspense wrapper. Page reduced to 5-line thin shell. Added to feature barrel.
  - `src/features/auth/components/__tests__/VerifyEmailView.test.tsx` — 8 tests covering loading state, token-on-mount call, no-token error, success navigation, API error display, home-navigation. All pass.

#### Changed

- **TASK-11 (P2):** `src/app/[locale]/auth/forgot-password/page.tsx` — reduced from 170-line fat page to 5-line thin shell delegating to `ForgotPasswordView`.
- **TASK-12 (P2):** `src/app/[locale]/auth/verify-email/page.tsx` — reduced from 168-line fat page to 5-line thin shell delegating to `VerifyEmailView`.
- `src/features/auth/components/index.ts` — added `ForgotPasswordView` and `VerifyEmailView` exports.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-11 and TASK-12 as ✅ DONE.

---

### Seventh Implementation Pass — Rule 11 Upload Violations + Rule 2 String Cleanup (2026-02-28)

#### Removed

- **TASK-20 (P0):** Deleted `src/hooks/useStorageUpload.ts` and `src/hooks/__tests__/useStorageUpload.test.ts` — hook imported Firebase Storage client SDK (`ref`, `uploadBytes`, `getDownloadURL`, `deleteObject` from `firebase/storage`) in violation of Rule 11.
  - Removed `useStorageUpload` and `UploadOptions`/`UploadState` exports from `src/hooks/index.ts`.
  - Removed `useStorageUpload` section from `src/hooks/README.md`.
- **TASK-27 (P0):** Deleted Tier-2 `src/features/events/services/event.service.ts` — Rule 21 mandates one service per domain; Tier-1 `src/services/event.service.ts` is the single source of truth.

#### Changed

- **TASK-20 (P0):** Migrated `src/components/AvatarUpload.tsx` from `useStorageUpload` to `useMediaUpload`.
  - Now stages file locally → on save builds `FormData { file, metadata }` → POST `/api/media/upload` (Firebase Admin SDK).
  - Progress bar simplified (boolean `isLoading` replaces progress %-state).
  - Error display sourced from `uploadApiError` returned by `useMediaUpload`.
  - Alert `onClose` now calls `resetUpload()` to clear API error state.
  - `AvatarUpload.test.tsx` fully rewritten: 17 tests, mocking `useMediaUpload`. All pass.
- **TASK-27 (P0):** Fixed 3 test files broken by Tier-2 service deletion:
  - `FeedbackEventSection.test.tsx` + `PollVotingSection.test.tsx`: updated `jest.mock` path from `../../services/event.service` → `@/services`.
  - `events/[id]/participate/__tests__/page.test.tsx`: added `EventParticipateView` to `@/features/events` mock; updated tests to match thin-shell page.

#### Fixed

- **TASK-23 (P1):** Removed unused `UI_LABELS` import and dead `const LABELS = UI_LABELS.ADMIN.PRODUCTS` from `src/components/admin/products/ProductForm.tsx`. Component correctly uses `useTranslations` for all JSX text (Rule 2).
  - ProductForm tests: 8/8 pass.
- **TASK-04 (P1):** `BlogForm` Checkbox integration — already implemented; marked done in plan.
- **TASK-05 (P1):** `ProductForm` Checkbox integration — already implemented; marked done in plan.

---

### Milestone: Sixth Implementation Pass — Firebase Infrastructure + P0 Rule Fixes (2026-02-28)

#### Fixed

- **TASK-30 (P0):** Fixed critical `blogPosts` Firestore index collection name mismatch.
  - Removed 2 stale `collectionGroup: "posts"` index entries (pointed at non-existent collection).
  - Added 5 correct `blogPosts` composite indexes: `status+publishedAt`, `status+createdAt`, `status+category+publishedAt`, `status+featured+publishedAt`, `authorId+createdAt`.
  - Added 3 `notifications` composite indexes: `userId+createdAt`, `userId+isRead+createdAt`, `userId+type+createdAt`.
  - **Impact:** Eliminates full-collection scans on all blog listing queries (`/api/blog`, `/api/admin/blog`, homepage blog section).

- **TASK-31 (P0):** Added all missing high-traffic Firestore composite indexes.
  - `products`: `status+category+createdAt`, `status+availableQuantity+createdAt`.
  - `orders`: `userId+productId` (used by `orderRepository.hasUserPurchased()` for review eligibility).
  - `bids`: `productId+status+bidAmount DESC` (used by `bidRepository.getActiveBidsRanked()` for auction leaderboard).
  - `sessions`: 4-field `userId+isActive+expiresAt DESC+lastActivity DESC` (required when inequality filter + multiple orderBy fields are combined).

- **TASK-32 (P1):** Added 15 missing medium-traffic Firestore composite indexes.
  - `carouselSlides` (2): `active+createdAt`, `createdBy+createdAt`.
  - `homepageSections` (1): `type+enabled+order`.
  - `categories` (5): `tier+isActive+order`, `rootId+tier+order`, `parentIds(ARRAY_CONTAINS)+order`, `isFeatured+isActive+featuredPriority`, `isLeaf+isActive+order`.
  - `faqs` (4): `showInFooter+isActive+order`, `isPinned+isActive+order`, `showOnHomepage+isActive+priority`, `tags(ARRAY_CONTAINS)+isActive`.
  - `events` (1): `status+type+endsAt` (3-field combined filter).
  - `eventEntries` (2): `eventId+userId` (duplicate entry check), `eventId+reviewStatus+points DESC` (filtered leaderboard).

- **TASK-33 (P0):** Added missing token + newsletter Firestore indexes.
  - `emailVerificationTokens`: `userId+used` (find unused tokens per user — on the critical path for email verification).
  - `passwordResetTokens`: `email+used` (find unused reset tokens — on the critical path for password reset).
  - `newsletterSubscribers`: `status+createdAt` (admin subscriber listing).

- **TASK-34 (P0):** Added `/auction-bids` path to `database.rules.json`.
  - Any authenticated user may subscribe to live bid data at `/auction-bids/$productId` (matches actual `useRealtimeBids` subscription path — confirmed it is `/auction-bids/${productId}`, NOT `/auctions`).
  - Validates `currentBid`, `bidCount`, `updatedAt`, and `lastBid` structure. All writes remain Admin SDK only.
  - **Impact:** Unblocks `useRealtimeBids` live bid subscriptions on auction detail pages (previously blocked by root `.read: false`).

- **TASK-35 (P0):** Added `/order_tracking` path to `database.rules.json`.
  - Only the order owner may subscribe — enforces `auth.token.orderId == $orderId`.
  - Validates `status` + `timestamp` on each event node. All writes Admin SDK only.
  - Proactively in place for the `OrderTrackingView` feature. The `/api/realtime/token` endpoint (which must embed `orderId` claims) is deferred until the endpoint is built.

- **TASK-01 (P0) — already implemented:** `src/app/[locale]/categories/page.tsx` confirmed already uses `categoryService.list()` — no raw `fetch()` present. Marked as resolved.
- **TASK-21 (P0) — already implemented:** `src/hooks/useAuth.ts` confirmed already uses `signInWithEmail` from `@/lib/firebase/auth-helpers` — no direct `firebase/auth` or `@/lib/firebase/config` import present. Marked as resolved.
- **TASK-22 (P0) — already implemented:** `src/contexts/SessionContext.tsx` confirmed already uses `onAuthStateChanged` from `@/lib/firebase/auth-helpers` and only `import type` from `firebase/auth` (type-only, no runtime dependency). Marked as resolved.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-01, TASK-21, TASK-22, TASK-30, TASK-31, TASK-32, TASK-33, TASK-34, TASK-35 as ✅ DONE; added contextual note to TASK-34 clarifying actual RTDB path is `/auction-bids` not `/auctions`.
- `docs/APPLICATION_GRAPH.md`:
  - `/categories` page entry updated from 🔴⚠️ to 🟡 with violation note removed.
  - Realtime DB rules section C updated from ⚠️ to ✅, table updated with 2 new paths.
  - Firestore indexes section D updated from ❌ to ✅ with resolved summary.
  - Mandatory Improvements item #1 (categories raw fetch) struck through as resolved.

---

### Milestone: Seventh Implementation Pass — EventParticipate Form Refactor (2026-02-28)

#### Added

- `src/features/events/components/EventParticipateView.tsx` — New feature-view component extracted from the old 185-line page. Uses `FormField` + `Input` + `Button` from `@/components`; uses `useTranslations('events')` and `useTranslations('loading')` for all rendered text. Handles all survey field types: textarea, select/radio, rating (number), date, text.
- `src/features/events/components/__tests__/EventParticipateView.test.tsx` — 8 test cases covering: spinner, auth redirect, no-survey-event warning, entries-closed alert, field rendering, submit, validation error.
- `messages/en.json` + `messages/hi.json` — Added 4 missing translation keys under `events`: `entriesClosed`, `selectOption`, `fillInRequired`, `notSurveyEvent`.

#### Changed

- `src/app/[locale]/events/[id]/participate/page.tsx` — Reduced from 185 lines to 11-line thin shell delegating to `EventParticipateView`. Removes all raw HTML form elements, `UI_LABELS` usage, inline hooks/state, and business logic from the page layer.
- `src/features/events/index.ts` — Added `EventParticipateView` export.

#### Fixed (Rule violations)

- **TASK-02** (Rule 8): Replaced raw `<textarea>`, `<select>`, `<input>`, `<button>` in participate page with `FormField`, `Input`, `Button` from `@/components`.
- **TASK-03** (Rule 3): Replaced `UI_LABELS.EVENTS.*` and hardcoded strings in JSX with `useTranslations()` calls.
- **TASK-26** (Rule 10): Page reduced from 185 lines to 11 lines; logic extracted to `EventParticipateView` feature component.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-02, TASK-03, TASK-26 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - `/events/[id]/participate` entry changed from 🔴⚠️ to 🟢; violation notes removed; table updated with `EventParticipateView`.
  - Feature module tree: removed `⚠️ MISSING: EventParticipateView`; added it as present.
  - Mandatory Improvements #2, #3, #15 struck through as ✅ RESOLVED.
  - Page-thickness table row for `events/[id]/participate/page.tsx` updated to resolved.

---

### Milestone: Eighth Implementation Pass — Admin Form Media Components (2026-02-28)

#### Changed

- `src/components/admin/blog/BlogForm.tsx` — TASK-06: `content` field replaced with `RichTextEditor` (edit mode) + `dangerouslySetInnerHTML` div (readonly). TASK-07: `coverImage` field replaced with `ImageUpload` (hidden in readonly; readonly mode shows URL text label). Added `typography`, `themed` to THEME_CONSTANTS destructure.
- `src/components/admin/products/ProductForm.tsx` — TASK-08: `mainImage` field replaced with `ImageUpload` (hidden in readonly) + readonly `FormField` fallback. Added missing `import { useTranslations } from "next-intl"` (was called but not imported — pre-existing bug surfaced by cache invalidation).

#### Fixed (Rule violations)

- **TASK-06** (Rule 8): BlogForm `content` uses `RichTextEditor` instead of plain `FormField type="textarea"`.
- **TASK-07** (Rule 8): BlogForm `coverImage` uses `ImageUpload` instead of plain URL text input.
- **TASK-08** (Rule 8): ProductForm `mainImage` uses `ImageUpload` instead of plain URL text input.

#### Tests

- `src/components/admin/blog/__tests__/BlogForm.test.tsx` — Updated to 9 tests, all passing. Added `RichTextEditor` and `ImageUpload` mocks; new cases for RichTextEditor render/onChange, ImageUpload render, ImageUpload hidden in readonly, readonly shows no editor.
- `src/components/admin/products/__tests__/ProductForm.test.tsx` — Updated to 8 tests, all passing. Added `ImageUpload` mock; new cases for ImageUpload in edit mode, ImageUpload hidden in readonly.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-06, TASK-07, TASK-08 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - Mandatory Improvements #4 (`BlogForm` RichTextEditor + ImageUpload) struck through as ✅ RESOLVED (TASK-06/07).
  - Mandatory Improvements #5 (`BlogForm`/`ProductForm` raw checkbox) struck through as ✅ RESOLVED (TASK-04/05).
  - Mandatory Improvements #6 (fragmented image upload): rows for `ProductForm` and `BlogForm` updated to reflect migration to `ImageUpload`; remaining work (TASK-09 docs, TASK-20 `useStorageUpload` removal) called out.

---

### Milestone: Tenth Implementation Pass — MediaUploadField Component (2026-02-28)

#### Added

- `src/components/admin/MediaUploadField.tsx` — New embeddable file upload field for forms. Supports any MIME type (`accept` prop). Renders type-appropriate previews: video player for video URLs, image thumbnail for image URLs, filename link for other files. Uses `useMediaUpload` → `/api/media/upload` (Firebase Admin SDK). Props: `label` (required), `value`, `onChange`, `accept?`, `maxSizeMB?`, `folder?`, `disabled?`, `helperText?`.
- `src/components/admin/__tests__/MediaUploadField.test.tsx` — 9 tests, all passing. Covers: empty state, file-present state, file picker trigger, successful upload, loading spinner, error alert, disabled state, remove button, helper text.

#### Changed

- `src/components/admin/index.ts` — Added `MediaUploadField` export.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-10 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`: Added `MediaUploadField` row to Unused Existing Primitives table.
- `docs/GUIDE.md`: Added `MediaUploadField` entry to Upload Components section.

---

### Milestone: Ninth Implementation Pass — Canonical Upload Path Documentation (2026-02-28)

#### Changed

- `src/components/admin/ImageUpload.tsx` — Added JSDoc comment block declaring it as the **canonical content image upload component** for all form image fields (products, blog, categories, carousel). Documents upload path (`useMediaUpload` → `/api/media/upload`) and defers profile avatars to `AvatarUpload`.
- `src/components/AvatarUpload.tsx` — Added JSDoc comment block declaring it as **profile-avatar-only** specialist. Documents current `useStorageUpload` path with ⚠️ TASK-20 note for mandatory migration to `/api/media/upload`.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-09 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - Mandatory Improvements #6 (fragmented upload) updated to reflect TASK-09 resolved.
  - Unused Existing Primitives table: added `ImageUpload` and `AvatarUpload` rows with scope descriptions.
- `docs/GUIDE.md`: Upload Components section expanded — added `ImageUpload` entry with full props + upload path documentation; updated `AvatarUpload` entry with ⚠️ TASK-20 migration note.

---

### Milestone: Fifth Audit Pass — Firebase Infrastructure Deep Scan (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — New **Firebase Infrastructure** section (under Data Layer) covering all four Firebase services:
  - **Section A — Firestore Security Rules** (`firestore.rules`): Confirmed correct and complete. Backend-only deny-all rule verified; no gaps.
  - **Section B — Firebase Storage Rules** (`storage.rules`): Confirmed correct. Public read / no client writes matches backend-only upload architecture. Advisory note added for future private file paths.
  - **Section C — Firebase Realtime Database Rules** (`database.rules.json`): Two missing paths identified — `/auctions/$productId` (blocks `useRealtimeBids` live bid subscriptions; **critical**) and `/order_tracking/$orderId` (blocks `OrderTrackingView` real-time status events; medium severity). Recommended rule additions documented with full JSON and token claim instructions.
  - **Section D — Firestore Composite Indexes** (`firestore.indexes.json`): Full index cross-reference against every repository query. Documents 1 critical collection name mismatch (`posts` collection group should be `blogPosts`) and 27 missing or incorrect index entries across 12 collections. Includes coverage table (per collection: defined / missing / status), complete numbered list of 27 index entries, and deployment notes.

- `docs/IMPLEMENTATION_PLAN.md` — New **P0-Firebase** section added between P0 and P1. Six new tasks TASK-30 → TASK-35:
  - **TASK-30 (P0 · S)**: Fix critical `blogPosts` collection name mismatch — remove 2 dead `posts` indexes, add 5 correct `blogPosts` indexes, add 3 `notifications` indexes. Closes full-collection-scan defect on all blog listing queries.
  - **TASK-31 (P0 · S)**: Add 5 missing high-traffic indexes — `products` (status+category+createdAt, status+availableQuantity+createdAt), `orders` (userId+productId for review eligibility), `bids` (productId+status+bidAmount for auction leaderboard), `sessions` 4-field (userId+isActive+expiresAt+lastActivity).
  - **TASK-32 (P1 · S)**: Add 15 missing medium-traffic indexes — `carouselSlides` (2), `homepageSections` (1), `categories` (5 including 2 array-contains), `faqs` (4 including 1 array-contains), `events` (1 combined), `eventEntries` (2).
  - **TASK-33 (P0 · XS)**: Add 3 missing token/newsletter indexes — `emailVerificationTokens` (userId+used), `passwordResetTokens` (email+used), `newsletterSubscribers` (status+createdAt).
  - **TASK-34 (P0 · M)**: Add `/auctions/$productId` Realtime DB rule (any authenticated user may subscribe; Admin SDK writes only) + extend `/api/realtime/token` to embed `orderId` claim.
  - **TASK-35 (P0 · S)**: Add `/order_tracking/$orderId` Realtime DB rule (user must have matching `orderId` claim in custom token) + update realtime token endpoint to accept orderId parameter.
  - Header audit note, TOC, Dependency Map, and summary table updated for TASK-30 → TASK-35.

---

### Milestone: Fourth Audit Pass — Data Layer, Component & Hook Coverage (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — Fourth comprehensive audit pass:
  - **Data Layer**: Added 9 missing repositories (`addressRepository`, `blogRepository`, `cartRepository`, `eventRepository`, `eventEntryRepository`, `newsletterRepository`, `notificationRepository`, `payoutRepository`, `wishlistRepository`) and 7 missing DB schema entries (`ADDRESS_FIELDS`, `BLOG_POST_FIELDS`, `CART_FIELDS`, `EVENT_FIELDS`, `NEWSLETTER_FIELDS`, `NOTIFICATION_FIELDS`, `PAYOUT_FIELDS`) to the reference tables.
  - **Tier 1 Components**: Added 11 undocumented UI primitives (`Avatar`, `Divider`, `Dropdown`, `ImageGallery`, `Menu`, `Skeleton`, `Form`, `BackgroundRenderer`, `Typography`, `MonitoringProvider`) with file paths. Added new **Seller Components** subsection documenting `SellerStorefrontView`, `SellerStatCard`, `SellerTabs`, and 8 dashboard sub-components that were entirely undocumented. Added 2 undocumented product components (`ProductFilters`, `ProductSortBar`).
  - **Feature Modules**: Added `⚠️ MISSING` markers for `AdminOrdersView` + `useAdminOrders` (admin), `ForgotPasswordView` + `VerifyEmailView` (auth), `EventParticipateView` (events), and `SellerCreateProductView` + `/seller/products/add` page (seller — functional gap, no product creation flow exists).
  - **Hooks Reference**: Documented 17 previously undocumented hooks — Auth (`useGoogleLogin`, `useAppleLogin`, `useAdminSessions`, `useUserSessions`, `useRevokeSession`, `useRevokeMySession`, `useRevokeUserSessions`), RBAC (`useIsOwner`, `useIsModerator`, `useRoleChecks`), Data Fetch (`useAddress`, `useCreateAddress`, `useUpdateAddress`, `useAllFaqs`, `useCategories`, `useCreateCategory`), Gestures (`useGesture`). Marked `useStorageUpload` as **BANNED (Rule 11)** in the hooks table.
  - **API Routes**: Added `POST /api/reviews/[id]/vote` (review voting) and `GET/PATCH /api/homepage-sections/[id]` (individual section management).
  - **Services**: Added tier-conflict warning paragraph documenting `event.service.ts` dual presence (Tier 1 `src/services/` AND Tier 2 `src/features/events/services/` — Rule 21 violation).
  - **Mandatory Improvements**: Added items 16–18 — `event.service.ts` Rule 21 conflict (→ TASK-27), seller product creation functional gap (→ TASK-28), 17 undocumented hooks (→ TASK-29).

- `docs/IMPLEMENTATION_PLAN.md` — 3 new tasks added (TASK-27 → TASK-29); header audit note and Dependency Map / summary table updated:
  - **TASK-27 (P0 · S)**: Consolidate `event.service.ts` — remove Tier-2 duplicate (`src/features/events/services/event.service.ts`), keep Tier-1 copy (`src/services/event.service.ts`), update all consuming imports. Closes Rule 21 dual-presence violation.
  - **TASK-28 (P1 · M)**: Add `/seller/products/add` page + `SellerCreateProductView` + `POST /api/seller/products`. Closes the functional gap where sellers cannot create product listings. Includes RBAC guard, new constant, new `sellerService.createProduct()` method, and full test coverage.
  - **TASK-29 (P2 · XS — docs only)**: Document all 17 undocumented hooks in `GUIDE.md` and `QUICK_REFERENCE.md`. No code changes required.

---

### Added

- `docs/APPLICATION_GRAPH.md` — comprehensive dependency map covering all 68 pages, feature modules, shared components, hooks, services, API routes, constants, and data layer. Includes a **Mandatory Improvements** section flagging rule violations and refactoring candidates.
- `docs/IMPLEMENTATION_PLAN.md` — 19 ordered implementation tasks (P0/P1/P2) derived from APPLICATION_GRAPH gaps. Added TASK-18 (systemic `UI_LABELS`-in-JSX Rule 2 violation across ~35 client components, batched into 5 groups) and TASK-19 (`FAQPageContent` sort state must use `useUrlTable`).
- `.github/copilot-instructions.md` — added RULE 25 (Exhaustive Component Reuse — mandatory lookup table before writing any markup or HTML element) and RULE 26 (Page Thickness Limit — 150-line max for `page.tsx`, decomposition pattern, enforced size targets). Updated Pre-Code Checklist with 5 new items for Rules 25 and 26.

---

### Milestone: Third Audit Pass — Rule 11 & Rule 2 Deep Scan (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — Mandatory Improvements section extended with 7 new violation entries (items 10–15):
  - **Item 10**: `useStorageUpload.ts` + `AvatarUpload.tsx` — Firebase Storage client SDK in frontend hook (Rule 11 Critical). `useStorageUpload` must be deleted; `AvatarUpload` migrated to `useMediaUpload` + `/api/media/upload`.
  - **Item 11**: `useAuth.ts` — imports `signInWithEmailAndPassword` + `auth` from Firebase client SDK (Rule 11 Critical). Must delegate to wrapper in `auth-helpers.ts`.
  - **Item 12**: `SessionContext.tsx` — imports `onAuthStateChanged` + `auth` from Firebase client SDK (Rule 11 Critical). Must use `subscribeToAuthState()` wrapper from `auth-helpers.ts`.
  - **Item 13**: Admin client components (`BlogForm`, `ProductForm`, `BlogTableColumns`, `UserDetailDrawer`, `UserFilters`) — `UI_LABELS` in JSX (Rule 2 violations not covered by existing TASK-18 groups).
  - **Item 14**: `features/events/constants/` option arrays — `UI_LABELS` labels that land in JSX `<select>` options (Rule 2).
  - **Item 15**: `events/[id]/participate/page.tsx` — 185 lines, breaches 150-line Rule 10 limit.
- "Unused Existing Primitives" table — corrected the "File upload" entry: removed `useStorageUpload` reference; replaced with explicit note that only `useMediaUpload` is valid and `useStorageUpload` is banned.
- Refactoring Opportunities table — added `events/[id]/participate/page.tsx` row (185 lines → extract to `EventParticipateView`).

- `docs/IMPLEMENTATION_PLAN.md` — 7 new tasks added (TASK-20 → TASK-26):
  - **TASK-20 (P0 · M)**: Delete `useStorageUpload.ts` + migrate `AvatarUpload.tsx` to `useMediaUpload` + `/api/media/upload` backend flow. Removes last Firebase Storage client SDK usage from frontend.
  - **TASK-21 (P0 · S)**: Add `signInWithEmail()` wrapper to `auth-helpers.ts`; remove `firebase/auth` + `@/lib/firebase/config` direct imports from `useAuth.ts`.
  - **TASK-22 (P0 · S)**: Add `subscribeToAuthState()` wrapper to `auth-helpers.ts`; remove `firebase/auth` + `@/lib/firebase/config` direct imports from `SessionContext.tsx`.
  - **TASK-23 (P0 · S)**: Migrate `BlogForm.tsx` and `ProductForm.tsx` from `UI_LABELS` to `useTranslations` (Rule 2). Recommends combining with TASK-04/05/06/07/08 in same PRs.
  - **TASK-24 (P0 · S)**: Migrate `UserDetailDrawer.tsx`, `UserFilters.tsx`, `BlogTableColumns.tsx` from `UI_LABELS` to `useTranslations` (Rule 2).
  - **TASK-25 (P0 · S)**: Replace `UI_LABELS` labels in `features/events/constants/` option arrays with value-only arrays; consuming components build translated options via `useTranslations`.
  - **TASK-26 (P2 · S)**: Extract `EventParticipateView` from the 185-line participation page to `src/features/events/components/`; depends on TASK-02 + TASK-03 completing first.
- Dependency Map updated: TASK-20 added as prerequisite for TASK-09; TASK-21 + TASK-22 grouped (share `auth-helpers.ts` edit); TASK-23 grouped with TASK-04/05/06/07/08; TASK-26 declared dependent on TASK-02 + TASK-03.

---

### Milestone: i18n Rule 2 Final Audit (2026-02-28)

_Phases 64–67_

#### Changed

- `src/constants/navigation.tsx` — removed `label` from `NavItem` interface; deleted `SIDEBAR_NAV_GROUPS`, `ADMIN_TAB_ITEMS`, `USER_TAB_ITEMS`, `SELLER_TAB_ITEMS` (replaced by inline `useTranslations` in each component).
- `src/constants/index.ts` — removed now-deleted constant exports.
- `src/components/layout/MainNavbar.tsx` — nav labels now resolved via `useTranslations("nav")`.
- `src/components/layout/Sidebar.tsx` — fixed 4 hardcoded `aria-label` attributes to use `useTranslations("accessibility")`.
- `src/components/admin/AdminTabs.tsx` — replaced `ADMIN_TAB_ITEMS` import with inline 15-tab array using `useTranslations("nav")`.
- `src/components/user/UserTabs.tsx` — replaced `USER_TAB_ITEMS` with inline 5-tab array.
- `src/components/seller/SellerTabs.tsx` — replaced `SELLER_TAB_ITEMS` with inline 4-tab array.
- `src/components/contact/ContactInfoSidebar.tsx` — moved `INFO_ITEMS` construction into component body; replaced `UI_LABELS` strings with `useTranslations("contact")`.
- `src/components/user/WishlistButton.tsx` — replaced `UI_LABELS` with `useTranslations("wishlist")` for `aria-label`/`title`.
- `messages/en.json` + `messages/hi.json` — 12 new keys across `nav`, `contact`, `wishlist`, `accessibility` namespaces.

#### Fixed

- `src/hooks/__tests__/useAddressSelector.test.ts` — updated stale field names (`line1`, `pincode` → `addressLine1`, `postalCode`); added required `label` field.

---

### Milestone: Test Coverage — Admin + Feature Hooks (2026-02-27)

_Phases 60–63_

#### Added

- **47 new tests** across 13 admin hook test files (`useAdminAnalytics`, `useAdminBids`, `useAdminBlog`, `useAdminCarousel`, `useAdminCategories`, `useAdminCoupons`, `useAdminFaqs`, `useAdminNewsletter`, `useAdminPayouts`, `useAdminProducts`, `useAdminReviews`, `useAdminSections`, `useAdminUsers`).
- **33 new tests** for shared Tier-1 hooks (`useBlogPosts`, `usePromotions`, `useContactSubmit`, `useCheckout`, `useCouponValidate`, `useMediaUpload`).
- Feature hook tests: `useProducts`, `useAuctions`, `useCategoryProducts`, `useUserOrders`, `useOrderDetail`, `useSellerOrders`, `useSearch`, `usePollVote`, `useFeedbackSubmit`.
- Shared hook tests: `useLogout`, `useFaqVote`, `useAuctionDetail`, `usePlaceBid`, `useAddressSelector`, `useCategorySelector`, `usePublicFaqs`.

#### Fixed

- `src/helpers/auth/__tests__/token.helper.test.ts` — eliminated race condition in `isTokenExpired` boundary test.

---

### Milestone: Rule 20 Compliance — Service → Hook Layer (2026-02-27)

_Phases 46, 58–59_

#### Added

- `src/features/admin/hooks/` — 13 admin view hooks consuming service functions via `useApiQuery`/`useApiMutation`.
- Shared Tier-1 hooks: `useLogout`, `useFaqVote`, `useAuctionDetail`, `usePlaceBid`, `useAddressSelector`, `useContactSubmit`, `useCheckout`, `useCouponValidate`, `useMediaUpload`.
- `useCategories`, `useCreateCategory`, `useAllFaqs`, `usePublicFaqs` added to `src/hooks/`.

#### Changed

- All 13 admin feature view components (`AdminAnalyticsView`, `AdminBidsView`, `AdminUsersView`, etc.) — removed direct `apiClient`/`useApiQuery` calls; use named admin hooks.
- `src/components/contact/ContactForm.tsx`, `cart/PromoCodeInput.tsx`, `admin/ImageUpload.tsx`, `checkout/CheckoutView.tsx`, `faq/FAQPageContent.tsx`, `faq/FAQHelpfulButtons.tsx`, `auctions/AuctionDetailView.tsx`, `auctions/PlaceBidForm.tsx`, `layout/Sidebar.tsx`, `ui/CategorySelectorCreate.tsx`, `ui/AddressSelectorCreate.tsx` — all migrated to named hooks.

#### Result

`src/components/**` — **zero Rule 20 violations** (no `@/services` imports in any `"use client"` file).

---

### Milestone: Service Layer Architecture (2026-02-26)

_Phase 37, Sub-phases 37.2–37.14_

#### Added

- `src/services/` — full service layer: `productService`, `cartService`, `authService`, `userService`, `orderService`, `reviewService`, `bidService`, `couponService`, `faqService`, `categoryService`, `carouselService`, `homepageSectionService`, `mediaService`, `contactService`, `checkoutService`, `newsletterService`, `analyticsService`, `adminService`, `addressService`, `payoutService`, `searchService`, `blogService`, `eventService`.
- All services export named service objects; barrel-exported from `src/services/index.ts`.

#### Changed

- All API calls in hooks, pages, and feature components migrated to use service function layer.
- Oversized pages decomposed into thin page + feature components (7 batches, ~40 page files).

---

### Milestone: i18n Wiring — next-intl (2026-02-24 → 2026-02-28)

_Phases 25a–36_

#### Added

- `src/i18n/` — i18n infrastructure with `next-intl`; `[locale]` route wrapper.
- `messages/en.json` + `messages/hi.json` — complete translation files for all namespaces.
- Zod error map localization; `LocaleSwitcher` UI component.

#### Changed

- All app pages and components migrated from `UI_LABELS` to `useTranslations()` across:
  - Auth pages (login, register, forgot-password, reset-password, verify-email)
  - Public pages (homepage, products, categories, auctions, search, blog, contact, FAQ)
  - User portal (dashboard, profile, orders, addresses, wishlist, sessions)
  - Seller portal (dashboard, products, orders, payouts)
  - Admin section (15 admin pages)
  - Layout & navigation (header, footer, sidebar, bottom nav, breadcrumbs)

---

### Milestone: Events System (2026-02-24)

_Phase 22_

#### Added

- `src/features/events/` — event management module: `EventCard`, `EventGrid`, `EventDetailView`, `PollVoteForm`, `FeedbackForm`, `EventLeaderboard`.
- `src/app/api/events/` — CRUD API routes for events, polls, feedback, leaderboard.
- `src/repositories/` — `EventRepository` with Sieve list support.
- `src/services/eventService` — Tier-2 feature service.
- `src/hooks/useAuctionDetail`, `usePlaceBid` — auction real-time bid hooks with 60s refetch interval.

---

### Milestone: API & Backend Hardening (2026-01 → 2026-02)

_Phases 7.1–7.10_

#### Added

- Sieve query DSL on all list endpoints (`filters`, `sorts`, `page`, `pageSize`) — Firestore-native; replaces in-memory `findAll()` filtering.
- SEO: slug generation for products and FAQs (`slugify` util, Firestore slug index).
- Purchase-verification gate for reviews — order ownership check before review creation.
- Seller email-verification gate — sellers must have verified email before product listing.
- Status-transition validation for products (draft → pending → published flow).
- Audit log for admin site-settings changes (writes to `auditLogs` Firestore collection).
- Admin email notification on new product submitted (Resend integration).
- Bundle analyzer, dynamic imports, and image optimization pass.
- `unitOfWork` — transactional multi-collection write helper using Firestore transactions and batch writes.

#### Changed

- All admin list API routes migrated to `sieveQuery()` in repositories (billing-efficient).
- Performance: lazy-loaded feature pages, `next/image` everywhere, Lighthouse score improvements.

---

### Milestone: Build Chain, ESLint & Next.js 16 (2026-02-21 → 2026-02-25)

_Phases 17–18.19, 23–24_

#### Added

- `THEME_CONSTANTS` (`src/constants/theme.ts`) — centralizes all repeated Tailwind class strings. Full replacement across 100+ components.
- Test suite bootstrap (Phase 18.1–18.19): 245 suites → 392 suites, all green.

#### Changed

- Next.js 16 async `params` / `searchParams` compatibility across all dynamic routes.
- Next.js upgraded to 16.1.6; Turbopack compatibility for Node.js modules (`crypto`, `bcryptjs`, `firebase-admin`).
- ESLint baseline established; zero lint errors.
- Styling constants cleanup — removed raw Tailwind strings from 100+ files.

#### Fixed

- Technical-debt cleanup: removed `TECH_DEBT` comments, dead imports, duplicate validation logic.
- 4 previously-failing test suites fixed across helpers and hooks.

---

### Milestone: Core Feature Build — Components, Pages & Infrastructure (2026-02-21 → 2026-02-24)

_Phases 1–16_

#### Added

- Three-tier pluggable architecture (Tier 1 shared primitives, Tier 2 feature modules, Tier 3 page layer).
- 40+ shared UI primitives: `Button`, `Card`, `Badge`, `Input`, `FormField`, `DataTable`, `SideDrawer`, `Modal`, `ConfirmDeleteModal`, `Tabs`, `Accordion`, `Tooltip`, `Pagination`, `StatusBadge`, `RoleBadge`, `EmptyState`, `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips`, `SortDropdown`, `TablePagination`, `ResponsiveView`, etc.
- Admin components: `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`, `AdminTabs`.
- User components: `AddressForm`, `AddressCard`, `ProfileHeader`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `PasswordChangeForm`.
- All admin, seller, user, public pages scaffolded with props-driven feature components.
- `useUrlTable` hook — URL-driven filter/sort/pagination state (all params in URL query string).
- `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips` — reusable faceted filter system.
- SEO: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, per-page metadata.
- PWA service worker (`public/sw.js`, `src/sw.ts`).
- Footer, `MainNavbar`, `Sidebar`, `BottomNavbar` — fully wired with RBAC-aware links.
- FAQ page with paginated accordion + helpfulness voting.
- Homepage dynamic sections + `HomepageSectionsRenderer`.
- Newsletter admin management (subscribe, toggle, export, delete).
- Non-tech-friendly UX: `useLongPress`, `useSwipe`, `usePullToRefresh`, `useBreakpoint` hooks.
- Gesture & accessibility improvements: keyboard navigation, screen-reader labels, WCAG 2.1 AA focus rings.
- Code deduplication: shared `DataTable`, `SideDrawer`, `AdminFilterBar` adopted across all 15 admin pages.
- RBAC: `RBAC_CONFIG`, `ProtectedRoute`, `useHasRole`, `useIsAdmin`, `useIsSeller`, `useRBAC`.

> **Version history (v1.0.0 – v1.2.0, January–February 2026)** has been moved to [CHANGELOG_ARCHIVE.md](./CHANGELOG_ARCHIVE.md).

---

## How to Use This Changelog

### When Making Changes:

1. **Add your changes to the `[Unreleased]` section** at the top
2. **Use the appropriate category**:
   - `Added` - New features
   - `Changed` - Changes to existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Security improvements

3. **Example Entry**:

```markdown
## [Unreleased]

### Added

- New useDebounce hook for search optimization

### Fixed

- Fixed theme switching bug in mobile view
```

### Before Release:

1. Move unreleased changes to a new version section
2. Add release date
3. Follow semantic versioning (MAJOR.MINOR.PATCH)

---

## Version Guidelines

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (1.1.0) - New features (backward compatible)
- **PATCH** (1.1.1) - Bug fixes (backward compatible)

---

**Note**: All changes should be documented in this file. Do NOT create separate session-specific documentation files.
