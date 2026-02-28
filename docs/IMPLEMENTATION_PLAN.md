# Implementation Plan

> Actionable tasks derived from the gaps identified in `APPLICATION_GRAPH.md`.
> Each task is self-contained and can be worked on independently unless a dependency is noted.
> Follow **Rule 23** (type-check → full tsc → build) and **Rule 24** (write tests per file changed) for every task.

---

## Table of Contents

1. [Priority Legend](#priority-legend)
2. [P0 — Rule Violations (break rules, fix now)](#p0--rule-violations)
3. [P0-Firebase — Firebase Config Violations (indexes, rules)](#p0-firebase--firebase-config-violations)
4. [P1 — Fragmented / Missing Component Usage (structural gaps)](#p1--fragmented--missing-component-usage)
5. [P2 — Page Thickness Refactors (thin pages that are too fat)](#p2--page-thickness-refactors)
6. [Dependency Map](#dependency-map)

> **Last audit:** 2026-02-28. Tasks TASK-01 → TASK-17 carried over from initial audit. TASK-18 → TASK-19 added from second audit pass. TASK-20 → TASK-26 added from third audit pass (2026-02-28) — Rule 11 Firebase SDK violations and additional Rule 2 / Rule 10 gaps discovered. TASK-27 → TASK-29 added from fourth audit pass (2026-02-28) — `event.service.ts` Rule 21 dual-presence conflict, missing seller product creation flow, and 17 undocumented hooks. **TASK-30 → TASK-35 added from fifth audit pass (2026-02-28)** — full Firebase infrastructure audit: critical `blogPosts` collection name mismatch in indexes, 27 missing composite indexes across 12 collections, and 2 missing Realtime DB path rules (`/auctions` and `/order_tracking`).

---

## Priority Legend

| Label  | Meaning                                                                          |
| ------ | -------------------------------------------------------------------------------- |
| **P0** | Violates a mandatory codebase rule — must be fixed before new features           |
| **P1** | Structural gap — existing primitive exists but isn't used, causing inconsistency |
| **P2** | Page is thicker than it should be — logic that belongs in a feature or hook      |

---

## P0 — Rule Violations

---

### ✅ TASK-01 · `categories/page.tsx` — replace raw `fetch()` with `categoryService` · P0 · DONE

**Rule violated:** Rule 19 (no raw `fetch()` in client code)
**File:** `src/app/[locale]/categories/page.tsx`

**What to do:**

1. Remove the inline `fetch(API_ENDPOINTS.CATEGORIES.LIST).then(r => r.json())` call inside `queryFn`.
2. Import `categoryService` from `@/services`.
3. Replace `queryFn` with `() => categoryService.list()`.
4. Confirm the return type matches what `CategoryGrid` expects.
5. Run `npx tsc --noEmit src/app/[locale]/categories/page.tsx` + `npm run build`.
6. Update / create `src/app/[locale]/categories/__tests__/page.test.tsx`.

**Before:**

```tsx
queryFn: () => fetch(API_ENDPOINTS.CATEGORIES.LIST).then((r) => r.json());
```

**After:**

```tsx
import { categoryService } from "@/services";
queryFn: () => categoryService.list();
```

---

### ✅ DONE — TASK-02 · `events/[id]/participate/page.tsx` — replace raw HTML form elements · P0

**Completed 2026-02-28.** All raw `<input>`, `<textarea>`, `<select>`, `<button>` replaced with `FormField`, `Input`, and `Button` from `@/components` inside `EventParticipateView`. Done together with TASK-03 and TASK-26.

---

### ✅ DONE — TASK-03 · `events/[id]/participate/page.tsx` — replace `UI_LABELS` with `useTranslations` · P0

**Completed 2026-02-28.** `UI_LABELS.EVENTS.*` and hardcoded strings replaced with `useTranslations('events')` in `EventParticipateView`. Added missing keys: `entriesClosed`, `selectOption`, `fillInRequired`, `notSurveyEvent` to both `messages/en.json` and `messages/hi.json`.

---

### ✅ DONE — TASK-04 · `BlogForm` — replace raw checkboxes with `Checkbox` component · P0

**Completed 2026-02-28.** `BlogForm.tsx` already uses `Checkbox` from `@/components` for `isFeatured`. Verified in code review.

**Rule violated:** Rule 6 (use existing components — `Checkbox` exists in `@/components`)
**File:** `src/components/admin/blog/BlogForm.tsx`

**What to do:**

1. Import `Checkbox` from `@/components`.
2. Replace the raw `<label><input type="checkbox" ...><span>{LABELS.FORM_FEATURED}</span></label>` block with:
   ```tsx
   <Checkbox
     label={t("blog.form.featured")}
     checked={post.isFeatured || false}
     onChange={(checked) => update({ isFeatured: checked })}
     disabled={isReadonly}
   />
   ```
3. Run type-check + build.
4. Update `src/components/admin/blog/__tests__/BlogForm.test.tsx`.

---

### ✅ DONE — TASK-05 · `ProductForm` — replace raw checkboxes with `Checkbox` component · P0

**Completed 2026-02-28.** `ProductForm.tsx` already uses `Checkbox` for `featured`, `isPromoted`, and `isAuction`. Verified in code review.

**Rule violated:** Rule 6 (use existing components)
**File:** `src/components/admin/products/ProductForm.tsx`

**What to do:**

1. Import `Checkbox` from `@/components`.
2. Replace all three raw checkbox blocks (`featured`, `isPromoted`, `isAuction`) with `<Checkbox label={...} checked={...} onChange={...} disabled={...} />`.
3. Run type-check + build.
4. Update `src/components/admin/products/__tests__/ProductForm.test.tsx`.

---

## P1 — Fragmented / Missing Component Usage

---

### ✅ DONE — TASK-06 · `BlogForm` — add `RichTextEditor` for post content body · P1

**Gap:** `content` field uses a plain 8-row textarea. `RichTextEditor` exists and is already used in `FaqForm` and `SectionForm` for exactly this purpose. Blog posts need formatting.
**File:** `src/components/admin/blog/BlogForm.tsx`
**Depends on:** Nothing (self-contained)

**What to do:**

1. Import `RichTextEditor` from `@/components`.
2. Replace the `<FormField name="content" type="textarea" rows={8} ...>` block with:
   ```tsx
   <RichTextEditor
     value={post.content || ""}
     onChange={(value) => update({ content: value })}
     disabled={isReadonly}
     placeholder={LABELS.FORM_CONTENT_PLACEHOLDER}
   />
   ```
3. Add `FORM_CONTENT_PLACEHOLDER` to `UI_LABELS.ADMIN.BLOG` in `src/constants/ui.ts` if it doesn't exist.
4. Run type-check + build.
5. Update `src/components/admin/blog/__tests__/BlogForm.test.tsx` — mock `RichTextEditor`.

---

### ✅ DONE — TASK-07 · `BlogForm` — replace URL text field for `coverImage` with `ImageUpload` · P1

**Gap:** `coverImage` is a plain text input expecting an image URL. `ImageUpload` exists and is used by `CategoryForm` and `CarouselSlideForm` for exactly this purpose.
**File:** `src/components/admin/blog/BlogForm.tsx`
**Depends on:** Nothing (self-contained; can be in same commit as TASK-06)

**What to do:**

1. Import `ImageUpload` from `@/components`.
2. Replace the `<FormField name="coverImage" type="text" ...>` with:
   ```tsx
   <ImageUpload
     label={LABELS.FORM_COVER}
     value={post.coverImage || ""}
     onChange={(url) => update({ coverImage: url })}
     disabled={isReadonly}
   />
   ```
3. Run type-check + build.
4. Update test.

---

### ✅ DONE — TASK-08 · `ProductForm` — replace URL text field for `mainImage` with `ImageUpload` · P1

**Gap:** `mainImage` is a plain `https://...` text input. Every other form with an image field uses `ImageUpload`.
**File:** `src/components/admin/products/ProductForm.tsx`
**Depends on:** Nothing

**What to do:**

1. Import `ImageUpload` from `@/components`.
2. Replace the `<FormField name="mainImage" type="text" placeholder="https://..." ...>` with:
   ```tsx
   <ImageUpload
     label={LABELS.MAIN_IMAGE_LABEL}
     value={product.mainImage || ""}
     onChange={(url) => update({ mainImage: url })}
     disabled={isReadonly}
   />
   ```
3. Run type-check + build.
4. Update `src/components/admin/products/__tests__/ProductForm.test.tsx`.

---

### ✅ DONE — TASK-09 · Unify image upload paths — document canonical approach and align `AvatarUpload` · P1

**Gap:** Three different upload mechanisms exist with no written contract:

- `AvatarUpload` → `useStorageUpload` → direct Firebase Storage client SDK
- `ImageUpload` → `useMediaUpload` → `/api/media/upload` (server-side, Firebase Admin)
- Plain text field → no upload at all

The canonical path for all content images (products, blog, categories, carousel) should be `ImageUpload` → `/api/media/upload` since it runs server-side and doesn't expose Storage credentials to the client.

**What to do:**

1. Add a comment block at the top of `src/components/admin/ImageUpload.tsx` documenting it as the **canonical image upload component** for all content.
2. Add a comment block at the top of `src/components/AvatarUpload.tsx` documenting it as a **profile-avatar-only** specialised variant (client-side Firebase Storage, supports crop flow).
3. Add a row to the **Unused Existing Primitives** table in `APPLICATION_GRAPH.md`:
   > `ImageUpload` — for any form field that needs an image URL
4. Update `docs/GUIDE.md` upload section to reference both components with their scope.
5. No code changes needed beyond comments + docs unless TASK-07 / TASK-08 are done first.

---

### ✅ DONE — TASK-10 · Create `MediaUploadField` — embeddable video/file upload for any form · P1

**Gap:** Video and file upload is only accessible on `/admin/media` as a standalone operation page. There is no component that can be dropped into `ProductForm`, `BlogForm`, or `EventFormDrawer` to attach a video and get back a URL.

**What to do:**

#### Step 1 — Create the component

Create `src/components/admin/MediaUploadField.tsx`:

```tsx
/**
 * MediaUploadField — embeddable single-file upload field for forms.
 * Uses /api/media/upload (server-side). Returns a URL string on success.
 * Use for product videos, blog cover videos, event media.
 * For images specifically, prefer <ImageUpload>.
 */
"use client";
import { useMediaUpload } from "@/hooks";
import { Button, Spinner, Alert } from "@/components";

interface MediaUploadFieldProps {
  label: string;
  value: string; // current URL (empty if none)
  onChange: (url: string) => void;
  accept?: string; // e.g. 'video/*' | 'image/*' | '*'
  disabled?: boolean;
}

export function MediaUploadField({
  label,
  value,
  onChange,
  accept = "*",
  disabled,
}: MediaUploadFieldProps) {
  // implementation using useMediaUpload()
}
```

#### Step 2 — Export via barrel

Add `MediaUploadField` to `src/components/index.ts`.

#### Step 3 — Optional: add to `ProductForm`

Add an optional `videoUrl` field to `ProductForm` using `<MediaUploadField accept="video/*" ...>`.

#### Step 4 — Tests

Create `src/components/admin/__tests__/MediaUploadField.test.tsx`.

#### Step 5 — Type-check + build

---

## P2 — Page Thickness Refactors

---

### TASK-11 · `auth/forgot-password/page.tsx` — extract to `ForgotPasswordView` feature component · P2

**File:** `src/app/[locale]/auth/forgot-password/page.tsx`
**Target:** `src/features/auth/components/ForgotPasswordView.tsx`

**What to do:**

1. Create `src/features/auth/components/ForgotPasswordView.tsx` — move all JSX, `useState`, `useRouter`, `useForgotPassword` logic into this component.
2. Reduce the page to:
   ```tsx
   import { ForgotPasswordView } from "@/features/auth";
   export default function Page() {
     return <ForgotPasswordView />;
   }
   ```
3. Export `ForgotPasswordView` from `src/features/auth/index.ts` and `src/features/auth/components/index.ts`.
4. Write `src/features/auth/components/__tests__/ForgotPasswordView.test.tsx`.
5. Type-check + build.

---

### TASK-12 · `auth/verify-email/page.tsx` — extract to `VerifyEmailView` feature component · P2

**File:** `src/app/[locale]/auth/verify-email/page.tsx`
**Target:** `src/features/auth/components/VerifyEmailView.tsx`

**What to do:** Same pattern as TASK-11.

1. Move all `useEffect`, `useState`, `useSearchParams`, `useVerifyEmail` logic into `VerifyEmailView`.
2. Reduce the page to a single-line render.
3. Export, test, type-check, build.

---

### TASK-13 · `admin/orders/page.tsx` — extract to `AdminOrdersView` feature component · P2

**File:** `src/app/[locale]/admin/orders/[[...action]]/page.tsx`
**Target:** `src/features/admin/components/AdminOrdersView.tsx`

**Why:** This is the only admin CRUD page that hasn't been extracted. All other admin views (`AdminProductsView`, `AdminUsersView`, etc.) delegate to `@/features/admin`. This page has ~100 lines of inline state + hooks + drawer logic.

**What to do:**

1. Create `AdminOrdersView` in `src/features/admin/components/AdminOrdersView.tsx` — move all hooks (`useApiQuery`, `useApiMutation`, `useMessage`, `useUrlTable`), state (`drawerOpen`, `selectedOrder`), and JSX into it.
2. Create `src/features/admin/hooks/useAdminOrders.ts` for the data layer — follows pattern of all existing `useAdmin*` hooks.
3. Reduce the page to:
   ```tsx
   import { AdminOrdersView } from "@/features/admin";
   export default function Page() {
     return <AdminOrdersView />;
   }
   ```
4. Export from barrels, write `useAdminOrders.test.ts` + `AdminOrdersView.test.tsx`.
5. Type-check + build.

---

### TASK-14 · `user/profile/page.tsx` — extract stat logic + delegate rendering · P2

**File:** `src/app/[locale]/user/profile/page.tsx`

**What to do:**

1. Create `src/hooks/useProfileStats.ts` — wraps `useApiQuery` calls for order count and address count, returns `{ orderCount, addressCount, isLoading }`.
2. Simplify the page to use `useProfileStats` and render only `ProfileHeader` + `ProfileStatsGrid` without manual data fetching inside the page.
3. Write `src/hooks/__tests__/useProfileStats.test.ts`.
4. Type-check + build.

---

### TASK-15 · `seller/page.tsx` — use `AdminStatsCards` instead of inline stat rendering · P2

**File:** `src/app/[locale]/seller/page.tsx`

**What to do:**

1. Remove direct `lucide-react` imports (`Package`, `Store`, `Gavel`, `FileText`) from the page.
2. Replace the four `<SellerStatCard>` renders with `<AdminStatsCards stats={mappedStats} />` — or if `SellerStatCard` is genuinely different, ensure it lives in `src/components/seller/` as a Tier-1 primitive, not in the page.
3. If `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings` are used only on this one page, move them into `src/features/seller/components/` and export via `@/features/seller`.
4. Type-check + build.

---

### TASK-16 · `user/addresses/add` + `edit` pages — use `useApiMutation` instead of direct service calls · P2

**Files:**

- `src/app/[locale]/user/addresses/add/page.tsx`
- `src/app/[locale]/user/addresses/edit/[id]/page.tsx`

**What to do:**

1. In both pages, replace direct `addressService.create()` / `addressService.update()` / `addressService.delete()` calls (with manual try/catch) with `useApiMutation` — gives consistent loading state, error normalisation, and `useMessage` toast integration.
2. Move shared form-submit logic into the existing `useAddressForm(id?)` hook if not already there, or into `useApiMutation`.
3. Remove `logger` import and direct class usage from pages — error handling belongs in the mutation hook.
4. Type-check + build + update tests.

---

### TASK-17 · `checkout/success/page.tsx` — extract to `CheckoutSuccessView` · P2

**File:** `src/app/[locale]/checkout/success/page.tsx`

**What to do:**

1. Create `src/components/checkout/CheckoutSuccessView.tsx` — move `useSearchParams`, `useEffect` redirect logic, `useApiQuery` order fetch, and JSX into this component.
2. Reduce page to:
   ```tsx
   import { CheckoutSuccessView } from "@/components";
   export default function Page() {
     return (
       <Suspense>
         <CheckoutSuccessView />
       </Suspense>
     );
   }
   ```
3. Write `src/components/checkout/__tests__/CheckoutSuccessView.test.tsx`.
4. Type-check + build.

---

### TASK-18 · Systemic `UI_LABELS` in JSX — migrate ~35 client components to `useTranslations` · P0

**Rule violated:** Rule 2 (no `UI_LABELS` in JSX client components — use `useTranslations`)
**Scope:** ~35 files across `src/components/ui/`, `src/components/homepage/`, `src/components/user/`, `src/components/seller/`, `src/components/admin/`, `src/components/checkout/`, `src/components/products/`, `src/components/search/`, `src/components/promotions/`

**This is the largest single rule violation in the codebase.** Every file below renders JSX and uses `UI_LABELS.*` instead of `useTranslations()`.

**Recommended batching strategy** — tackle one group per PR to keep each reviewable:

#### Group A — Shared UI primitives (highest impact; these feed every page)

| File                                           | UI_LABELS keys used                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `src/components/ui/SideDrawer.tsx`             | `ACTIONS.CLOSE`, `ACTIONS.DELETE`, `CONFIRM.*`, `ACTIONS.CANCEL/DISCARD` |
| `src/components/ui/FilterDrawer.tsx`           | `FILTERS.*`, `ACTIONS.CLEAR_ALL/APPLY_FILTERS`                           |
| `src/components/ui/FilterFacetSection.tsx`     | `FILTERS.SEARCH_IN`, `TABLE.NO_RESULTS/LOAD_MORE`                        |
| `src/components/ui/TablePagination.tsx`        | `TABLE.SHOWING/OF/RESULTS/PER_PAGE/PAGINATION_LABEL`                     |
| `src/components/ui/SortDropdown.tsx`           | `TABLE.SORT_BY`                                                          |
| `src/components/ui/ActiveFilterChips.tsx`      | `ACTIONS.CLEAR_ALL`                                                      |
| `src/components/ui/NotificationBell.tsx`       | `NOTIFICATIONS.*`                                                        |
| `src/components/ui/EventBanner.tsx`            | `EVENTS.SALE_BANNER/OFFER_BANNER`                                        |
| `src/components/ui/CategorySelectorCreate.tsx` | `FORM.CATEGORY`, `ACTIONS.ADD_CATEGORY`                                  |
| `src/components/ui/AddressSelectorCreate.tsx`  | `FORM.PICKUP_ADDRESS`, `ACTIONS.ADD_ADDRESS/SAVE`                        |

#### Group B — Homepage sections

| File                                                  | UI_LABELS keys used                                             |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `src/components/homepage/FeaturedAuctionsSection.tsx` | `HOMEPAGE.AUCTIONS.*`, `ACTIONS.VIEW_ALL_ARROW`                 |
| `src/components/homepage/CustomerReviewsSection.tsx`  | `HOMEPAGE.REVIEWS.*`                                            |
| `src/components/homepage/FAQSection.tsx`              | `FAQ.TITLE/SUBTITLE`, `EMPTY.NO_DATA`, `ACTIONS.VIEW_ALL_ARROW` |
| `src/components/categories/CategoryGrid.tsx`          | `CATEGORIES_PAGE.NO_CATEGORIES/NO_CATEGORIES_SUBTITLE`          |

#### Group C — User domain components

| File                                                             | UI_LABELS keys used                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| `src/components/user/settings/ProfileInfoForm.tsx`               | `PROFILE.*`, `FORM.*`, `ACTIONS.SAVE`, `LOADING.DEFAULT` |
| `src/components/user/settings/PasswordChangeForm.tsx`            | `FORM.*`, `LOADING.DEFAULT`, `ACTIONS.CHANGE_PASSWORD`   |
| `src/components/user/addresses/AddressCard.tsx`                  | `ACTIONS.EDIT/DELETE`                                    |
| `src/components/user/addresses/AddressForm.tsx`                  | `ACTIONS.CANCEL/SAVE`, `LOADING.DEFAULT`                 |
| `src/components/user/notifications/NotificationsBulkActions.tsx` | `NOTIFICATIONS.*`, `LOADING.SAVING`                      |
| `src/components/user/notifications/NotificationItem.tsx`         | `NOTIFICATIONS.*`, `ACTIONS.VIEW`                        |
| `src/components/user/profile/PublicProfileView.tsx`              | `PROFILE.*`, `ROLES.*`                                   |

#### Group D — Seller components

| File                                                 | Notes                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `src/components/seller/SellerAnalyticsStats.tsx`     | Full `SELLER_ANALYTICS` namespace                              |
| `src/components/seller/SellerPayoutRequestForm.tsx`  | `SELLER_PAYOUTS.*`, `ACTIONS.CANCEL/SUBMIT`, `LOADING.DEFAULT` |
| `src/components/seller/SellerPayoutStats.tsx`        | `SELLER_PAYOUTS.*`                                             |
| `src/components/seller/SellerPayoutHistoryTable.tsx` | `SELLER_PAYOUTS.*`                                             |
| `src/components/seller/SellerQuickActions.tsx`       | `SELLER_PAGE.*`                                                |
| `src/components/seller/SellerRecentListings.tsx`     | `SELLER_PAGE.*`, `ACTIONS.VIEW_ALL`                            |
| `src/components/seller/SellerRevenueChart.tsx`       | `SELLER_ANALYTICS` namespace                                   |
| `src/components/seller/SellerTopProducts.tsx`        | `SELLER_ANALYTICS` namespace                                   |

#### Group E — Admin, checkout, other

| File                                             | Notes                                        |
| ------------------------------------------------ | -------------------------------------------- |
| `src/components/admin/AdminSessionsManager.tsx`  | `ADMIN.SESSIONS.*`, `LOADING.DEFAULT`        |
| `src/components/admin/RichTextEditor.tsx`        | `ACTIONS.CONFIRM/CANCEL`                     |
| `src/components/checkout/OrderSuccessHero.tsx`   | `ORDER_SUCCESS_PAGE.*`                       |
| `src/components/checkout/OrderSummaryPanel.tsx`  | `CART.*`, `CHECKOUT.*`                       |
| `src/components/checkout/OrderSuccessCard.tsx`   | `ORDER_SUCCESS_PAGE.*`                       |
| `src/components/products/AddToCartButton.tsx`    | `PRODUCT_DETAIL.PLACE_BID`                   |
| `src/components/promotions/CouponCard.tsx`       | `PROMOTIONS_PAGE.*`, `STATUS.ACTIVE`         |
| `src/components/search/SearchResultsSection.tsx` | `SEARCH_PAGE.*`                              |
| `src/components/search/SearchFiltersRow.tsx`     | `SEARCH_PAGE.*`, `ACTIONS.SEARCH`            |
| `src/components/ErrorBoundary.tsx`               | `ERROR_PAGES.*`, `ACTIONS.TRY_AGAIN/GO_HOME` |

**Per-file steps:**

1. Add `const t = useTranslations('<namespace>')` inside the component function body.
2. Add the required keys to `messages/en.json` (copy the English string from `UI_LABELS`) and `messages/hi.json` (translate or stub with English initially).
3. Replace every `UI_LABELS.*` JSX reference with `t('key')`.
4. Run `npx tsc --noEmit <file>` after each file.
5. Update the component's test file — mock `useTranslations` as `(ns: string) => (key: string) => key`.

---

### TASK-19 · `FAQPageContent` — replace `useState` sort with `useUrlTable` · P1

**Rule violated:** `useUrlTable` is mandatory for any list with filter/sort controls (per Rule 5 docs)
**File:** `src/components/faq/FAQPageContent.tsx`

**Issue:** Sort selection (`helpful`, `recent`, `alphabetical`) is stored in a local `useState`, so it resets on navigation and is not bookmarkable.

**What to do:**

1. Import `useUrlTable` from `@/hooks`.
2. Replace:
   ```tsx
   const [sortOption, setSortOption] = useState<FAQSortOption>("helpful");
   ```
   with:
   ```tsx
   const table = useUrlTable({ defaults: { sort: "helpful" } });
   const sortOption = (table.get("sort") || "helpful") as FAQSortOption;
   ```
3. Replace `setSortOption(value)` with `table.setSort(value)`.
4. Run type-check + build.
5. Update `src/components/faq/__tests__/FAQPageContent.test.tsx`.

---

### ✅ TASK-20 · Delete `useStorageUpload` + migrate `AvatarUpload` to backend upload · P0 · DONE

**Completed 2026-02-28.** Deleted `useStorageUpload.ts` + test, removed export from `hooks/index.ts`, removed docs from `hooks/README.md`, migrated `AvatarUpload.tsx` to `useMediaUpload` (FormData → POST /api/media/upload), rewrote 17 tests. TS: 0 errors. Tests: 17/17 pass.

---

### ✅ TASK-21 · Remove Firebase Auth client SDK imports from `useAuth.ts` · P0 · DONE

**Rule violated:** Rule 11 — `src/hooks/` must NOT import from `@/lib/firebase/config` or `firebase/auth`
**File:** `src/hooks/useAuth.ts`

**Violations found:**

```ts
import { signInWithEmailAndPassword } from "firebase/auth"; // ❌
import { auth } from "@/lib/firebase/config"; // ❌
```

**Context:** `src/lib/firebase/auth-helpers.ts` already exists and is the designated home for all Firebase Auth client-side operations. It exports `signInWithGoogle`, `signInWithApple`, `resetPassword`, `applyEmailVerificationCode`, `getCurrentUser`, etc. The `useAuth.ts` hook already imports from `auth-helpers.ts` for those — it just skipped adding `signInWithEmailAndPassword` there.

**What to do:**

1. Open `src/lib/firebase/auth-helpers.ts`. Add an exported wrapper function:
   ```ts
   /**
    * Sign in with email + password using Firebase Auth client SDK.
    * Wraps signInWithEmailAndPassword so src/hooks/ never imports firebase/auth directly.
    */
   export async function signInWithEmail(
     email: string,
     password: string,
   ): Promise<UserCredential> {
     return signInWithEmailAndPassword(auth, email, password);
   }
   ```
2. In `src/hooks/useAuth.ts`:
   - Remove `import { signInWithEmailAndPassword } from "firebase/auth";`
   - Remove `import { auth } from "@/lib/firebase/config";`
   - Add `signInWithEmail` to the existing `auth-helpers` import.
   - Replace every call to `signInWithEmailAndPassword(auth, ...)` with `signInWithEmail(...)`.
3. Run `npx tsc --noEmit src/hooks/useAuth.ts`.
4. Update `src/hooks/__tests__/useAuth.test.ts` — mock `signInWithEmail` from `@/lib/firebase/auth-helpers`.

**Effort:** S (30–90 min)

---

### ✅ TASK-22 · Remove Firebase Auth client SDK imports from `SessionContext.tsx` · P0 · DONE

**Rule violated:** Rule 11 — `src/contexts/` must NOT import from `@/lib/firebase/config` or `firebase/auth`
**File:** `src/contexts/SessionContext.tsx`

**Violations found:**

```ts
import {
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth"; // ❌
import { auth } from "@/lib/firebase/config"; // ❌
```

**What to do:**

1. Open `src/lib/firebase/auth-helpers.ts`. Add an exported auth-state subscription wrapper:

   ```ts
   import type { User } from "firebase/auth";

   /**
    * Subscribe to Firebase Auth state changes.
    * Returns the unsubscribe function. Use this in contexts/SessionContext.tsx
    * so that src/contexts/ never imports firebase/auth or @/lib/firebase/config directly.
    */
   export function subscribeToAuthState(
     callback: (user: User | null) => void,
   ): () => void {
     return onAuthStateChanged(auth, callback);
   }
   ```

2. In `src/contexts/SessionContext.tsx`:
   - Remove `import { User, onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth";`
   - Remove `import { auth } from "@/lib/firebase/config";`
   - Import `subscribeToAuthState` from `@/lib/firebase/auth-helpers`.
   - Also import `type User` from `firebase/auth` — **type-only imports are allowed** since they are erased at compile time and have no runtime Firebase dependency:
     ```ts
     import type { User } from "firebase/auth"; // ✅ type-only
     import { subscribeToAuthState } from "@/lib/firebase/auth-helpers"; // ✅
     ```
   - Replace all calls to `firebaseOnAuthStateChanged(auth, ...)` with `subscribeToAuthState(...)`.
3. Run `npx tsc --noEmit src/contexts/SessionContext.tsx`.
4. Update `src/contexts/__tests__/SessionContext.test.tsx` — mock `subscribeToAuthState`.

**Effort:** S (30–90 min)

---

### ✅ DONE — TASK-23 · Migrate `BlogForm.tsx` and `ProductForm.tsx` `UI_LABELS` → `useTranslations` · P0

**Completed 2026-02-28.** `BlogForm.tsx` already uses `useTranslations` with no `UI_LABELS`. `ProductForm.tsx` was migrated: removed unused `UI_LABELS` import and dead `const LABELS` declaration.

**Rule violated:** Rule 2 (no `UI_LABELS` in JSX client components)
**Files:**

- `src/components/admin/blog/BlogForm.tsx`
- `src/components/admin/products/ProductForm.tsx`

**Both files are `"use client"` components that import `UI_LABELS` and use it for form labels directly in JSX.**

**What to do — `BlogForm.tsx`:**

1. Add `const t = useTranslations('admin.blog')` inside the component function body (not module scope).
2. Add all required keys to `messages/en.json` under `admin.blog.*` (copy exact English strings from `UI_LABELS.ADMIN.BLOG`).
3. Add stub translations to `messages/hi.json`.
4. Replace all `LABELS.*` (i.e. `UI_LABELS.ADMIN.BLOG.*`) references in JSX with `t('key')`.
5. Remove `const LABELS = UI_LABELS.ADMIN.BLOG` and the `UI_LABELS` import.

**What to do — `ProductForm.tsx`:**
Same pattern. Namespace: `admin.products`. Move all `UI_LABELS.ADMIN.PRODUCTS.*` and `UI_LABELS.ADMIN.COMMON.*` references in JSX to `t('key')`.

Note: Both files currently also have raw `<input type="checkbox">` elements — can be combined with TASK-04 and TASK-05 in the same commit.

**Per-file steps:**

1. `npx tsc --noEmit <file>` after each change.
2. Update `src/components/admin/blog/__tests__/BlogForm.test.tsx` and `src/components/admin/products/__tests__/ProductForm.test.tsx` — mock `useTranslations`.

**Effort:** S (30–90 min)

---

### TASK-24 · Migrate admin `UserDetailDrawer`, `UserFilters`, `BlogTableColumns` `UI_LABELS` → `useTranslations` · P0

**Rule violated:** Rule 2 (no `UI_LABELS` in JSX client components)
**Files:**

- `src/components/admin/users/UserDetailDrawer.tsx` — uses `UI_LABELS.ADMIN.USERS.*` in rendered JSX text and button labels
- `src/components/admin/users/UserFilters.tsx` — uses `UI_LABELS.ADMIN.USERS.*`, `UI_LABELS.ROLES.*`, `UI_LABELS.ACTIONS.SEARCH` in option arrays + filter labels rendered as JSX
- `src/components/admin/blog/BlogTableColumns.tsx` — uses `UI_LABELS.ACTIONS.EDIT` / `UI_LABELS.ACTIONS.DELETE` in action button text in JSX table columns

**What to do:**

1. For each file, add `const t = useTranslations('admin')` (or appropriate namespace) inside the component / column-builder function.
2. Add keys to `messages/en.json` and `messages/hi.json`.
3. Replace `UI_LABELS.*` JSX references with `t('key')`.
4. `npx tsc --noEmit` each file after changes.
5. Update tests: `UserDetailDrawer.test.tsx`, `UserFilters.test.tsx`, `BlogTableColumns.test.tsx`.

**Namespaces to use:**

- `UserDetailDrawer` → `useTranslations('admin.users')`
- `UserFilters` → `useTranslations('admin.users')` + `t('roles.*')`
- `BlogTableColumns` → `useTranslations('admin.blog')` + `t('common.actions.*')`

**Effort:** S (30–90 min)

---

### TASK-25 · Migrate `features/events/constants/` option arrays from `UI_LABELS` to translation-safe values · P0

**Rule violated:** Rule 2 (no `UI_LABELS` in JSX — labels from these arrays end up in `<select>` option text rendered as JSX)
**Files:**

- `src/features/events/constants/EVENT_TYPE_OPTIONS.ts`
- `src/features/events/constants/EVENT_STATUS_OPTIONS.ts`
- `src/features/events/constants/FORM_FIELD_TYPE_OPTIONS.ts`

**Issue:** These constants export arrays of `{ value, label }` objects where `label` is taken from `UI_LABELS.*`. The arrays are passed as `options` prop to `<FormField type="select">` components, which renders the label text as JSX — violating Rule 2.

**What to do:**

1. Convert each constant to a value-only array:

   ```ts
   // Before
   export const EVENT_TYPE_OPTIONS = [
     { value: "poll", label: UI_LABELS.EVENT_TYPES.POLL },
   ];

   // After
   export const EVENT_TYPE_VALUES = [
     "sale",
     "offer",
     "poll",
     "survey",
     "feedback",
   ] as const;
   export type EventTypeValue = (typeof EVENT_TYPE_VALUES)[number];
   ```

2. In the consuming components (`EventFormDrawer`, `SurveyFieldBuilder`, etc.), build the `options` array inline using `useTranslations('events')`:
   ```tsx
   const t = useTranslations("events");
   const typeOptions = EVENT_TYPE_VALUES.map((v) => ({
     value: v,
     label: t(`types.${v}`),
   }));
   ```
3. Add the required translation keys to `messages/en.json` and `messages/hi.json`.
4. Remove `UI_LABELS` imports from all three constant files.
5. Run `npx tsc --noEmit` on affected files + build.
6. Update any tests for the consuming components.

**Effort:** S (30–90 min)

---

### ✅ DONE — TASK-26 · Extract `events/[id]/participate/page.tsx` to `EventParticipateView` feature component · P2

**Completed 2026-02-28.** Created `src/features/events/components/EventParticipateView.tsx` with all hooks/state/JSX. Page reduced to 11-line thin shell. Exported via `src/features/events/index.ts`. Test: `EventParticipateView.test.tsx` — 8/8 passing. 6. `npm run build` must pass.

**Effort:** S (30–90 min)

---

### ✅ TASK-27 · Resolve `event.service.ts` Rule 21 dual-presence — consolidate to one tier · P0 · DONE

**Completed 2026-02-28.** Tier-2 `src/features/events/services/event.service.ts` deleted. Tier-1 `src/services/event.service.ts` is single source of truth. Fixed 3 broken test files: updated `PollVotingSection.test.tsx` and `FeedbackEventSection.test.tsx` mocks from deleted relative path → `@/services` barrel; updated `participate/page.test.tsx` to reflect thin-shell page (renders `EventParticipateView`). All 10 tests pass.

---

### TASK-28 · Add `/seller/products/add` page + `SellerCreateProductView` + `POST /api/seller/products` · P1

**Rule violated:** Functional gap — sellers currently have no mechanism to create new product listings.
**Missing files:**

- `src/app/[locale]/seller/products/add/page.tsx`
- `src/features/seller/components/SellerCreateProductView.tsx`
- `src/app/api/seller/products/route.ts` (or extend existing if the file exists but lacks `POST`)

**What to do:**

**Step 1 — API route**

1. Check `src/app/api/seller/products/route.ts`. If it exists but only has `GET`, add `POST` handler. If it does not exist, create it.
2. The `POST` handler must:
   - Verify session cookie → extract `uid`.
   - Validate request body with Zod schema (title, description, price, categoryId, images[], status).
   - Use `productRepository.create({ ...data, sellerId: uid, status: 'draft' })`.
   - Return `successResponse(newProduct, SUCCESS_MESSAGES.PRODUCT.CREATED)`.
   - Wrap in `handleApiError`.
3. Add `API_ENDPOINTS.SELLER.PRODUCTS_CREATE` to `src/constants/api-endpoints.ts` (or confirm `API_ENDPOINTS.SELLER.PRODUCTS` already covers `POST` by convention).
4. Add `sellerService.createProduct(data)` method to `src/services/seller.service.ts` (or `src/features/seller/services/`).
5. Export through the appropriate barrel.

**Step 2 — Feature view component**

1. Create `src/features/seller/components/SellerCreateProductView.tsx`.
2. Reuse the existing `ProductForm` component (check `src/components/products/` or `src/features/admin/components/` for the form). If it already accepts a `mode="create" | "edit"` prop, consume it directly.
3. On submit: call `sellerService.createProduct(formData)` via `useApiMutation`. On success, redirect to `/seller/products`.
4. Use `useTranslations('seller')` for all JSX text (Rule 2).
5. Use `THEME_CONSTANTS` for all repeated Tailwind classes (Rule 4).
6. Export from `src/features/seller/components/index.ts` and `src/features/seller/index.ts`.

**Step 3 — Page**

1. Create `src/app/[locale]/seller/products/add/page.tsx` as a thin shell (≤ 30 lines):
   ```tsx
   import { SellerCreateProductView } from "@/features/seller";
   export default function SellerAddProductPage() {
     return <SellerCreateProductView />;
   }
   ```
2. Protect the route — ensure `RBAC_CONFIG` in `src/constants/rbac.ts` has an entry for `/seller/products/add` with `allowedRoles: ['seller', 'admin']`.
3. Add `ROUTES.SELLER.PRODUCTS_ADD` to `src/constants/routes.ts` if not present.

**Step 4 — Tests**

1. Write `src/features/seller/components/__tests__/SellerCreateProductView.test.tsx`.
2. Write `src/app/api/seller/products/__tests__/route.test.ts` (or add `POST` cases to existing test file).
3. Run `npm test -- --testPathPattern=SellerCreateProductView` before handing back.

**Step 5 — Verification**

1. `npx tsc --noEmit` on all new/changed files.
2. `npm run build` must pass.

**Effort:** M (90–180 min)

---

### TASK-29 · Document 17 undocumented hooks in `GUIDE.md` and `QUICK_REFERENCE.md` · P2

**Rule violated:** None (docs-only gap — no code changes needed)
**Scope:** The following 17 hooks exist in `src/hooks/` but are absent from the GUIDE and Quick Reference:

| Hook                    | Category              | Location                             |
| ----------------------- | --------------------- | ------------------------------------ |
| `useGesture`            | Forms & UX (gestures) | `src/hooks/useGesture.ts`            |
| `useGoogleLogin`        | Auth                  | `src/hooks/useGoogleLogin.ts`        |
| `useAppleLogin`         | Auth                  | `src/hooks/useAppleLogin.ts`         |
| `useAdminSessions`      | Auth / Session        | `src/hooks/useAdminSessions.ts`      |
| `useUserSessions`       | Auth / Session        | `src/hooks/useUserSessions.ts`       |
| `useRevokeSession`      | Auth / Session        | `src/hooks/useRevokeSession.ts`      |
| `useRevokeMySession`    | Auth / Session        | `src/hooks/useRevokeMySession.ts`    |
| `useRevokeUserSessions` | Auth / Session        | `src/hooks/useRevokeUserSessions.ts` |
| `useIsOwner`            | RBAC                  | `src/hooks/useRBAC.ts`               |
| `useIsModerator`        | RBAC                  | `src/hooks/useRBAC.ts`               |
| `useRoleChecks`         | RBAC                  | `src/hooks/useRBAC.ts`               |
| `useAddress(id)`        | Data Fetch            | `src/hooks/useAddress.ts`            |
| `useCreateAddress`      | Data Fetch            | `src/hooks/useCreateAddress.ts`      |
| `useUpdateAddress`      | Data Fetch            | `src/hooks/useUpdateAddress.ts`      |
| `useAllFaqs`            | Data Fetch            | `src/hooks/useFaqs.ts`               |
| `useCategories`         | Data Fetch            | `src/hooks/useCategories.ts`         |
| `useCreateCategory`     | Data Fetch            | `src/hooks/useCreateCategory.ts`     |

**What to do:**

1. For each hook above, read the implementation file to capture its signature, return type, and usage pattern.
2. In `docs/GUIDE.md`, locate the Hooks reference section. Add a subsection entry for each hook following the existing format (description, import, parameters, return value, example).
3. In `docs/QUICK_REFERENCE.md`, add a row for each hook in the relevant "hooks" table.
4. No code changes needed. No `tsc` or build step required.

**Effort:** XS–S (docs only; ~15–30 min reading + writing per hook)

---

## P0-Firebase — Firebase Config Violations

> Discovered in fifth audit pass (2026-02-28). These tasks modify `firestore.indexes.json` and `database.rules.json` — infrastructure files. No TypeScript or build checks are required, but deployments must succeed via `firebase deploy`.

---

### ✅ TASK-30 · Fix critical `blogPosts` collection name mismatch + add core blog/notifications indexes · P0 · DONE

**Files:** `firestore.indexes.json`
**Severity:** Critical — the live `blogPosts` collection has zero composite indexes; all blog listing queries perform full collection scans.

**Root cause:** Two existing entries use `collectionGroup: "posts"` but the actual collection name is `blogPosts` (`BLOG_POSTS_COLLECTION = "blogPosts"` in `src/db/schema/blog-posts.ts`). The `posts` indexes are deployed to a non-existent collection and provide no value.

**What to do:**

1. Open `firestore.indexes.json`.
2. Delete the two existing `collectionGroup: "posts"` entries:
   - `posts: status (ASC) + publishedAt (DESC)`
   - `posts: status (ASC) + createdAt (DESC)`
3. Add these 5 `blogPosts` entries in their place:
   ```json
   { "collectionGroup": "blogPosts", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "publishedAt", "order": "DESCENDING" }] },
   { "collectionGroup": "blogPosts", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] },
   { "collectionGroup": "blogPosts", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "category", "order": "ASCENDING" },
                { "fieldPath": "publishedAt", "order": "DESCENDING" }] },
   { "collectionGroup": "blogPosts", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "featured", "order": "ASCENDING" },
                { "fieldPath": "publishedAt", "order": "DESCENDING" }] },
   { "collectionGroup": "blogPosts", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "authorId", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] }
   ```
4. Add these 3 `notifications` entries (currently zero indexes):
   ```json
   { "collectionGroup": "notifications", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "userId", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] },
   { "collectionGroup": "notifications", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "userId", "order": "ASCENDING" },
                { "fieldPath": "isRead", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] },
   { "collectionGroup": "notifications", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "userId", "order": "ASCENDING" },
                { "fieldPath": "type", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] }
   ```
5. Deploy: `firebase deploy --only firestore:indexes`
6. Monitor Firebase Console → Firestore → Indexes until all new entries show `READY`.

**Effort:** S (30–90 min — JSON edits + deploy monitoring)

---

### ✅ TASK-31 · Add missing high-traffic indexes: products, orders, bids, sessions · P0 · DONE

**Files:** `firestore.indexes.json`
**Why P0:** These collections are on the critical path for product listings, order views, bid management, and session validation. Missing indexes cause Firestore to reject queries or do full scans at scale.

**What to do:**

1. Add to `firestore.indexes.json`:

   **products (2 new):**

   ```json
   { "collectionGroup": "products", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "category", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] },
   { "collectionGroup": "products", "queryScope": "COLLECTION",
     "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "availableQuantity", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }] }
   ```

   **orders (1 new):**

   ```json
   {
     "collectionGroup": "orders",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "userId", "order": "ASCENDING" },
       { "fieldPath": "productId", "order": "ASCENDING" }
     ]
   }
   ```

   > Used by `orderRepository.hasUserPurchased(userId, productId)` — checks review eligibility before allowing a review submission.

   **bids (1 new):**

   ```json
   {
     "collectionGroup": "bids",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "productId", "order": "ASCENDING" },
       { "fieldPath": "status", "order": "ASCENDING" },
       { "fieldPath": "bidAmount", "order": "DESCENDING" }
     ]
   }
   ```

   > Used by `bidRepository.getActiveBidsRanked(productId)` — returns active bids ordered by amount descending (auction leaderboard).

   **sessions (1 new — 4-field):**

   ```json
   {
     "collectionGroup": "sessions",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "userId", "order": "ASCENDING" },
       { "fieldPath": "isActive", "order": "ASCENDING" },
       { "fieldPath": "expiresAt", "order": "DESCENDING" },
       { "fieldPath": "lastActivity", "order": "DESCENDING" }
     ]
   }
   ```

   > Required because `sessionRepository.getActiveSessions(userId)` chains `userId==X, isActive==true, expiresAt>now, orderBy expiresAt DESC, orderBy lastActivity DESC`. Firestore requires all orderBy fields to be in the composite index when an inequality filter is present.

2. Deploy: `firebase deploy --only firestore:indexes`
3. Monitor until `READY`.

**Effort:** S (30–90 min)

---

### ✅ TASK-32 · Add missing medium-traffic indexes: carousel, categories, faqs, homepageSections, events, eventEntries · P1 · DONE

**Files:** `firestore.indexes.json`

**What to do — add all entries below:**

```json
// carouselSlides (2 new)
{ "collectionGroup": "carouselSlides", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "active", "order": "ASCENDING" },
             { "fieldPath": "createdAt", "order": "DESCENDING" }] },
{ "collectionGroup": "carouselSlides", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "createdBy", "order": "ASCENDING" },
             { "fieldPath": "createdAt", "order": "DESCENDING" }] },

// homepageSections (1 new)
{ "collectionGroup": "homepageSections", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "type", "order": "ASCENDING" },
             { "fieldPath": "enabled", "order": "ASCENDING" },
             { "fieldPath": "order", "order": "ASCENDING" }] },

// categories (5 new)
{ "collectionGroup": "categories", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "tier", "order": "ASCENDING" },
             { "fieldPath": "isActive", "order": "ASCENDING" },
             { "fieldPath": "order", "order": "ASCENDING" }] },
{ "collectionGroup": "categories", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "rootId", "order": "ASCENDING" },
             { "fieldPath": "tier", "order": "ASCENDING" },
             { "fieldPath": "order", "order": "ASCENDING" }] },
{ "collectionGroup": "categories", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "parentIds", "arrayConfig": "CONTAINS" },
             { "fieldPath": "order", "order": "ASCENDING" }] },
{ "collectionGroup": "categories", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "isFeatured", "order": "ASCENDING" },
             { "fieldPath": "isActive", "order": "ASCENDING" },
             { "fieldPath": "featuredPriority", "order": "ASCENDING" }] },
{ "collectionGroup": "categories", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "isLeaf", "order": "ASCENDING" },
             { "fieldPath": "isActive", "order": "ASCENDING" },
             { "fieldPath": "order", "order": "ASCENDING" }] },

// faqs (4 new)
{ "collectionGroup": "faqs", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "showInFooter", "order": "ASCENDING" },
             { "fieldPath": "isActive", "order": "ASCENDING" },
             { "fieldPath": "order", "order": "ASCENDING" }] },
{ "collectionGroup": "faqs", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "isPinned", "order": "ASCENDING" },
             { "fieldPath": "isActive", "order": "ASCENDING" },
             { "fieldPath": "order", "order": "ASCENDING" }] },
{ "collectionGroup": "faqs", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "showOnHomepage", "order": "ASCENDING" },
             { "fieldPath": "isActive", "order": "ASCENDING" },
             { "fieldPath": "priority", "order": "ASCENDING" }] },
{ "collectionGroup": "faqs", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "tags", "arrayConfig": "CONTAINS" },
             { "fieldPath": "isActive", "order": "ASCENDING" }] },

// events (1 new)
{ "collectionGroup": "events", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
             { "fieldPath": "type", "order": "ASCENDING" },
             { "fieldPath": "endsAt", "order": "ASCENDING" }] },

// eventEntries (2 new)
{ "collectionGroup": "eventEntries", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "eventId", "order": "ASCENDING" },
             { "fieldPath": "userId", "order": "ASCENDING" }] },
{ "collectionGroup": "eventEntries", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "eventId", "order": "ASCENDING" },
             { "fieldPath": "reviewStatus", "order": "ASCENDING" },
             { "fieldPath": "points", "order": "DESCENDING" }] }
```

Deploy: `firebase deploy --only firestore:indexes`

**Effort:** S (30–90 min)

---

### ✅ TASK-33 · Add missing token and newsletter indexes · P0 · DONE

**Files:** `firestore.indexes.json`
**Why P0:** Token lookup by userId + used is on the critical path for email verification and password reset flows. Without these indexes, token verification may be slow or fail at scale.

**What to do — add all entries below:**

```json
// emailVerificationTokens (1 new)
{ "collectionGroup": "emailVerificationTokens", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "userId", "order": "ASCENDING" },
             { "fieldPath": "used", "order": "ASCENDING" }] },

// passwordResetTokens (1 new)
{ "collectionGroup": "passwordResetTokens", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "email", "order": "ASCENDING" },
             { "fieldPath": "used", "order": "ASCENDING" }] },

// newsletterSubscribers (1 new)
{ "collectionGroup": "newsletterSubscribers", "queryScope": "COLLECTION",
  "fields": [{ "fieldPath": "status", "order": "ASCENDING" },
             { "fieldPath": "createdAt", "order": "DESCENDING" }] }
```

Deploy: `firebase deploy --only firestore:indexes`

**Effort:** XS (< 30 min)

---

### ✅ TASK-34 · Add missing Realtime DB rules for `/auction-bids` + extend realtime token with orderId · P0 · DONE

> **Note:** Subscription path verified as `/auction-bids/${productId}` (from `useRealtimeBids.ts`). Rule added at `auction-bids.$productId`. The `/api/realtime/token` endpoint does not yet exist — orderId claim extension is deferred to the endpoint creation task.

**File:** `database.rules.json`, `src/app/api/realtime/token/route.ts`
**Severity:** High — `useRealtimeBids` on the auction detail page subscribes to `/auctions/$productId/bids` in the Realtime DB. The current rules have no `/auctions` path, so the root `.read: false` blocks all auction subscriptions. The auction-detail page's live bid feed is currently broken.

**What to do:**

**Step 1 — Add `/auctions` path to `database.rules.json`:**

```json
"auctions": {
  "$productId": {
    ".read": "auth != null",
    ".write": false,
    "bids": {
      "$bidId": {
        ".validate": "newData.hasChildren(['userId', 'amount', 'timestamp'])",
        "userId":    { ".validate": "newData.isString()" },
        "amount":    { ".validate": "newData.isNumber() && newData.val() > 0" },
        "timestamp": { ".validate": "newData.isNumber() || newData.val() == '.sv'" }
      }
    },
    "metadata": {
      ".validate": "newData.hasChildren(['currentBid', 'endTime'])",
      "currentBid": { ".validate": "newData.isNumber()" },
      "endTime":    { ".validate": "newData.isNumber()" }
    }
  }
}
```

> Any authenticated user can subscribe to an auction's live bid feed. Write is Admin SDK only.

**Step 2 — Deploy rules:**

```bash
firebase deploy --only database:rules
```

**Step 3 — Verify `useRealtimeBids` subscription path:**

1. Open `src/hooks/` (or wherever `useRealtimeBids` is implemented).
2. Confirm the subscription path is `/auctions/${productId}/bids` (not a different path like `/bids/${productId}`).
3. If the path differs, update the rule to match the actual path.

**Effort:** M (90–180 min — rule edit + deploy + path verification + test in browser)

---

### ✅ TASK-35 · Add missing Realtime DB rule for `/order_tracking` · P0 · DONE

> **Note:** Rule added to `database.rules.json`. No existing code uses this path yet — rule is proactively in place. The `orderId` claim injection into `/api/realtime/token` is deferred until the endpoint is created (no route file exists yet).

**File:** `database.rules.json`, `src/app/api/realtime/token/route.ts`
**Note:** Can be combined with TASK-34 in a single PR since both touch `database.rules.json`.

**What to do:**

**Step 1 — Add `/order_tracking` path to `database.rules.json`:**

```json
"order_tracking": {
  "$orderId": {
    ".read": "auth != null && auth.token.orderId == $orderId",
    ".write": false,
    "$event": {
      ".validate": "newData.hasChildren(['status', 'timestamp'])",
      "status":    { ".validate": "newData.isString()" },
      "timestamp": { ".validate": "newData.isNumber() || newData.val() == '.sv'" }
    }
  }
}
```

**Step 2 — Extend `/api/realtime/token` to embed `orderId` claim:**

1. Open `src/app/api/realtime/token/route.ts`.
2. Accept an optional `orderId` query parameter (or request body field).
3. Validate that the requesting user is the order owner (`orderRepository.findById(orderId).userId === session.uid`).
4. Include `orderId` in the custom token claims:
   ```ts
   const customToken = await getAdminAuth().createCustomToken(session.uid, {
     sessionId: session.sessionId,
     chatIds: Object.fromEntries(chatIds.map((id) => [id, true])),
     orderId: orderId ?? null, // NEW
     role: session.role,
   });
   ```
5. Update `realtimeTokenService.getToken(orderId?)` in the client service to pass the orderId.

**Step 3 — Verify `OrderTrackingView` subscription path:**

1. Confirm the subscription uses `/order_tracking/${orderId}` (not another path).
2. Adjust the rule path if needed.

**Step 4 — Deploy:**

```bash
firebase deploy --only database:rules
```

**Effort:** S (30–90 min)

---

## Dependency Map

Tasks that should be done in order due to shared files:

```
TASK-04 (BlogForm checkboxes)
TASK-06 (BlogForm RichTextEditor)   ─┐ same file — can be one PR
TASK-07 (BlogForm ImageUpload)      ─┤
TASK-23 (BlogForm UI_LABELS→t())    ─┘

TASK-05 (ProductForm checkboxes)
TASK-08 (ProductForm ImageUpload)   ─┐ same file — can be one PR
TASK-23 (ProductForm UI_LABELS→t()) ─┘

TASK-09 (document canonical upload) ─ do after TASK-07 + TASK-08 so docs reflect final state

TASK-10 (MediaUploadField) ─ independent; useful input for TASK-07/08 decisions

TASK-20 (delete useStorageUpload + migrate AvatarUpload) ─ independent; TASK-20 is a prerequisite
  for TASK-09 since docs should reference final upload design

TASK-21 (useAuth.ts Firebase imports) ─ independent
TASK-22 (SessionContext.tsx Firebase imports) ─ independent; can be same PR as TASK-21
  (both touch auth-helpers.ts to add wrapper functions)

TASK-02 + TASK-03 ─ same file, same PR
TASK-26 (EventParticipateView extraction) ─ AFTER TASK-02 + TASK-03 so the extracted component starts clean

TASK-11 + TASK-12 ─ different files, can be parallel

TASK-13 (AdminOrdersView) ─ independent

TASK-14, 15, 16, 17 ─ all independent of each other

TASK-18 groups A / B / C / D / E ─ all parallel-safe (different files)
  Each group within TASK-18 should be a single PR so tests + translations stay coherent

TASK-19 (FAQPageContent sort) ─ independent

TASK-24 (admin components UI_LABELS) ─ independent of other tasks; parallel-safe

TASK-25 (events constants UI_LABELS) ─ independent; can combine with TASK-03 if convenient

TASK-27 (event.service.ts consolidation) ─ independent; do before TASK-28
TASK-28 (seller product creation) ─ after TASK-27 (soft dependency)
TASK-29 (undocumented hooks docs) ─ fully independent
```

TASK-27 (event.service.ts consolidation) — independent; must complete before any TASK-28 work that touches eventService
TASK-28 (seller product creation) — independent; TASK-27 is a soft prerequisite only if the new API route calls eventService
TASK-29 (hook docs) — fully independent; no code dependencies
TASK-30 (blogPosts indexes) — independent; do BEFORE TASK-31 so both are deployed together
TASK-31 (high-traffic indexes) — after TASK-30 (same deploy batch)
TASK-32 (low-traffic indexes) — after TASK-31 (second deploy batch)
TASK-33 (token indexes) — independent; small; can be in same PR as TASK-30
TASK-34 (Realtime DB auction rules + token endpoint) — independent
TASK-35 (Realtime DB order_tracking rules) — can be same PR as TASK-34

| Task      | P   | Effort         | Depends on                           |
| --------- | --- | -------------- | ------------------------------------ |
| TASK-01   | P0  | XS             | —                                    |
| TASK-02   | P0  | S              | —                                    |
| TASK-03   | P0  | S              | TASK-02 (same file)                  |
| TASK-04   | P0  | XS             | —                                    |
| TASK-05   | P0  | XS             | —                                    |
| TASK-06   | P1  | S              | —                                    |
| TASK-07   | P1  | XS             | —                                    |
| TASK-08   | P1  | XS             | —                                    |
| TASK-09   | P1  | XS (docs only) | TASK-07, TASK-08, TASK-20            |
| TASK-10   | P1  | M              | —                                    |
| TASK-11   | P2  | S              | —                                    |
| TASK-12   | P2  | S              | —                                    |
| TASK-13   | P2  | M              | —                                    |
| TASK-14   | P2  | S              | —                                    |
| TASK-15   | P2  | S              | —                                    |
| TASK-16   | P2  | S              | —                                    |
| TASK-17   | P2  | S              | —                                    |
| TASK-18-A | P0  | M              | —                                    |
| TASK-18-B | P0  | S              | —                                    |
| TASK-18-C | P0  | M              | —                                    |
| TASK-18-D | P0  | M              | —                                    |
| TASK-18-E | P0  | M              | —                                    |
| TASK-19   | P1  | XS             | —                                    |
| TASK-20   | P0  | M              | —                                    |
| TASK-21   | P0  | S              | —                                    |
| TASK-22   | P0  | S              | TASK-21 (share auth-helpers.ts edit) |
| TASK-23   | P0  | S              | —                                    |
| TASK-24   | P0  | S              | —                                    |
| TASK-25   | P0  | S              | —                                    |
| TASK-26   | P2  | S              | TASK-02, TASK-03                     |
| TASK-27   | P0  | S              | —                                    |
| TASK-28   | P1  | M              | TASK-27 (soft)                       |
| TASK-29   | P2  | XS (docs only) | —                                    |
| TASK-30   | P0  | S              | —                                    |
| TASK-31   | P0  | S              | TASK-30 (same deploy)                |
| TASK-32   | P1  | S              | TASK-31 (second deploy batch)        |
| TASK-33   | P0  | XS             | —                                    |
| TASK-34   | P0  | M              | —                                    |
| TASK-35   | P0  | S              | TASK-34 (same file)                  |

TASK-18 groups (A→E) are independent of each other and parallel-safe.
TASK-19 is independent of all others.
TASK-21 and TASK-22 should be done in the same PR (both add wrappers to `auth-helpers.ts`).
TASK-23 should be combined with TASK-04 / TASK-05 / TASK-06 / TASK-07 / TASK-08 (same files, same PR).
TASK-27 should be done before TASK-28 to eliminate any ambiguity about which event service tier the new seller API route imports.
TASK-29 is docs-only and can be done any time without affecting code.
TASK-30 + TASK-31 + TASK-32 + TASK-33 all edit `firestore.indexes.json` — must be done sequentially or in one combined PR to avoid merge conflicts.
TASK-34 + TASK-35 both edit `database.rules.json` — should be one PR.

**Effort key:** XS = < 30 min · S = 30–90 min · M = 90–180 min
