# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Development phases (Phases 1–67) completed between 2026-01-01 and 2026-02-28.
> All 392 test suites green — 3,712 tests (3,708 passed, 4 skipped). 0 TypeScript errors.

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

---

## [1.2.0] - 2026-02-05

### Added

- Centralized API client system (`src/lib/api-client.ts`)
- API endpoint constants (`src/constants/api-endpoints.ts`)
- React hooks for data fetching (`useApiQuery`) and mutations (`useApiMutation`)
- Authentication hooks (`useAuth.ts`) with 7 specialized hooks
- Profile management hooks (`useProfile.ts`)
- Error handling with `ApiClientError` class
- Automatic authentication via session cookies
- Request timeout handling (30s default)

### Changed

- Refactored profile page to use new hooks and components
- Refactored auth pages (forgot-password, reset-password, register, verify-email)
- Updated all pages to use `FormField` component
- Updated all pages to use `PasswordStrengthIndicator` component
- Replaced all direct `fetch()` calls with `apiClient`
- Reorganized hook exports in `src/hooks/index.ts`

### Fixed

- TypeScript errors in FormField component usage
- Error message constant references
- Password validation edge cases
- Form field type validation

### Deprecated

- `useApiRequest` hook (use `useApiQuery` or `useApiMutation`)
- Direct usage of `auth-utils` functions (use `useAuth` hooks)

### Removed

- Direct fetch calls from all pages
- Duplicate form validation logic
- Manual password strength calculations

### Security

- Added centralized error handling with status codes
- Implemented proper input validation on all forms
- Added timeout protection for API calls

---

## [1.1.0] - 2026-01-15

### Added

- Profile page with avatar upload
- Email verification functionality
- Password change feature
- Display name and phone number updates

### Changed

- Updated user profile schema
- Enhanced authentication flow

### Fixed

- Session persistence issues
- Profile image upload errors

---

## [1.0.0] - 2026-01-01

### Added

- Initial project setup with Next.js 16.1.1
- Authentication system with NextAuth v5
- User registration and login
- Mobile-first component library (40+ components)
- Dark mode support with theme context
- TypeScript configuration
- Tailwind CSS styling
- Testing setup with Jest
- Documentation structure

### Security

- CSRF protection
- Secure password hashing
- Environment variable management

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
