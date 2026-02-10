# LetItRip — Comprehensive Refactor Plan

> **Created**: February 10, 2026
> **Updated**: February 10, 2026 (v23 — Phase 8 COMPLETE ✅ — All 8 phases done)
> **Scope**: Constants foundation, design system, navigation, responsive design, component extraction, vibrancy, production quality, documentation
> **Status**: Phase 1 COMPLETE ✅ — Phase 2 COMPLETE ✅ — Phase 3 COMPLETE ✅ — Phase 4 COMPLETE ✅ — Phase 5 COMPLETE ✅ — Phase 6 COMPLETE ✅ — Phase 7 COMPLETE ✅ — Phase 8 COMPLETE ✅ — ALL PHASES DONE 🎉

---

## Optimization Summary

v3 restructures from 10 phases → 8 phases, eliminating **20 identified overlaps** where files would be touched twice:

| Problem (old plan)                                                    | Fix (new plan)                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Components created in Phase 3-5, then restyled in Phase 6             | Design system built FIRST (Phase 2), components use it from day one |
| Constants added in Phase 8, but needed by Phase 3-5                   | ALL constants created in Phase 1 before any components              |
| `window.location.href` fixed in both Phase 5 and Phase 8              | Consolidated into Phase 6 (single homepage pass)                    |
| Footer touched in Phase 6 (dark mode) and Phase 8 (strings)           | Single pass in Phase 6                                              |
| TitleBar touched in Phase 6 (deprecated pattern) and Phase 8 (badges) | Single pass in Phase 6                                              |
| Admin forms fixed in Phase 6 (input styling) and Phase 8 (raw HTML)   | Done during Phase 4 decomposition                                   |
| `user/layout.tsx` created in both Phase 1 and Phase 4                 | Created once in Phase 3                                             |
| AdminPageHeader created (Phase 3) then gradient applied (Phase 6)     | Built with gradient from start in Phase 3                           |
| `formatPrice` fixed in both Phase 5 and Phase 8                       | Single fix in Phase 6                                               |
| FAQs sort bug in both Phase 5 and Phase 8                             | Single fix in Phase 6                                               |
| Homepage `fetch()→hooks` in Phase 7 overlaps Phase 5 rewrites         | Consolidated into Phase 6                                           |
| Barrel exports updated in Phase 3 and again in Phase 8                | Done once per phase as components are created                       |
| Admin tabs route constants fixed in Phase 1 and Phase 8               | SectionTabs uses constants from creation (Phase 3)                  |

**Result**: Every file touched at most once. Each phase builds on the previous without revisiting.

---

## Table of Contents

1. [Phase 1: Foundation — Constants, Data Layer & Code Consolidation](#phase-1-foundation--constants-data-layer--code-consolidation)
2. [Phase 2: Design System & Base Component Upgrades](#phase-2-design-system--base-component-upgrades)
3. [Phase 3: Shared UI Infrastructure](#phase-3-shared-ui-infrastructure)
4. [Phase 4: Admin Page Decomposition](#phase-4-admin-page-decomposition)
5. [Phase 5: User Page Decomposition](#phase-5-user-page-decomposition)
6. [Phase 6: Homepage, Auth & Public Pages](#phase-6-homepage-auth--public-pages)
7. [Phase 7: Production Code Quality](#phase-7-production-code-quality)
8. [Phase 8: Documentation & Instructions](#phase-8-documentation--instructions)
9. [Constants & Styles Reference](#constants--styles-reference)
10. [File Inventory](#file-inventory)
11. [Execution Order & Dependencies](#execution-order--dependencies)

---

## Phase 1: Foundation — Constants, Data Layer & Code Consolidation ✅ COMPLETE

> Fix foundational issues and create ALL constants before any UI work begins. This phase is code-only — no visible UI changes.
> **Status**: All 31 tasks completed.

### 1A. Routes Audit

#### Phantom Routes (defined but no page exists)

| Route Constant            | Path             | Action                                                              |
| ------------------------- | ---------------- | ------------------------------------------------------------------- |
| `ROUTES.ADMIN.CONTENT`    | `/admin/content` | **Remove** from `routes.ts` — no page exists                        |
| `ROUTES.ERRORS.NOT_FOUND` | `/404`           | **Remove** — Next.js uses `not-found.tsx`, not `/404/page.tsx`      |
| `ROUTES.API.*`            | Various          | **Remove entire `API` key** — duplicates `API_ENDPOINTS`, confusing |

#### Missing Route Constants (page exists or is referenced but no constant)

| Page Path                   | Add As                                                                  | Source                                            |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| `/faqs`                     | `ROUTES.PUBLIC.FAQS`                                                    | Page exists                                       |
| `/profile/[userId]`         | `ROUTES.PUBLIC.PROFILE` (with helper: `(id: string) => /profile/${id}`) | Page exists                                       |
| `/products`                 | `ROUTES.PUBLIC.PRODUCTS`                                                | Referenced in `SITE_CONFIG.nav`, `navigation.tsx` |
| `/auctions`                 | `ROUTES.PUBLIC.AUCTIONS`                                                | Referenced in `SITE_CONFIG.nav`, `navigation.tsx` |
| `/sellers`                  | `ROUTES.PUBLIC.SELLERS`                                                 | Referenced in `SITE_CONFIG.nav`, `navigation.tsx` |
| `/categories`               | `ROUTES.PUBLIC.CATEGORIES`                                              | Referenced in `SITE_CONFIG.nav`, `navigation.tsx` |
| `/promotions`               | `ROUTES.PUBLIC.PROMOTIONS`                                              | Referenced in `SITE_CONFIG.nav`, `navigation.tsx` |
| `/about`                    | `ROUTES.PUBLIC.ABOUT`                                                   | Referenced in `SITE_CONFIG.nav`, Footer           |
| `/contact`                  | `ROUTES.PUBLIC.CONTACT`                                                 | Referenced in `SITE_CONFIG.nav`, Sidebar          |
| `/blog`                     | `ROUTES.PUBLIC.BLOG`                                                    | Referenced in `SITE_CONFIG.nav`, Footer           |
| `/help`                     | `ROUTES.PUBLIC.HELP`                                                    | Hardcoded in `navigation.tsx` Sidebar             |
| `/terms`                    | `ROUTES.PUBLIC.TERMS`                                                   | Referenced in Footer                              |
| `/privacy`                  | `ROUTES.PUBLIC.PRIVACY`                                                 | Referenced in Footer                              |
| `/cart`                     | `ROUTES.USER.CART`                                                      | Referenced in `SITE_CONFIG.account`               |
| `/user/addresses/add`       | `ROUTES.USER.ADDRESSES_ADD`                                             | Page exists                                       |
| `/user/addresses/edit/[id]` | `ROUTES.USER.ADDRESSES_EDIT` (helper fn)                                | Page exists                                       |
| `/user/orders/view/[id]`    | `ROUTES.USER.ORDER_DETAIL` (helper fn)                                  | Page exists                                       |
| `/admin/coupons`            | `ROUTES.ADMIN.COUPONS` (when page is created)                           | Schema+repo exist                                 |
| `/demo/seed`                | `ROUTES.DEMO.SEED` (dev-only, low priority)                             | Page exists                                       |

#### PROTECTED_ROUTES Incomplete

Currently only guards `PROFILE` and `SETTINGS`. Missing: `ORDERS`, `WISHLIST`, `ADDRESSES` — all user pages should be protected.

### 1B. Schema & Index Fixes

| Issue                                                                              | Severity | Fix                                                                                                  |
| ---------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `ReviewDocument` missing `featured` field                                          | **HIGH** | Add `featured?: boolean` to `ReviewDocument` interface in `src/db/schema/reviews.ts`                 |
| Categories index uses `"featured"` but schema has `"isFeatured"`                   | **HIGH** | Update firestore index to use `"isFeatured"` OR rename schema field to `featured`. Redeploy indexes. |
| No `bidRepository` — schema exists, 5 composite indexes defined, but no repository | **HIGH** | Create `src/repositories/bid.repository.ts` with standard CRUD + auction-specific queries            |

### 1C. Repository Fixes

#### Hardcoded Collection Names (Rule 11 violation)

| Repository                                    | Hardcoded String | Should Use           |
| --------------------------------------------- | ---------------- | -------------------- |
| `ProductRepository` constructor               | `"products"`     | `PRODUCT_COLLECTION` |
| `OrderRepository` constructor                 | `"orders"`       | `ORDER_COLLECTION`   |
| `ReviewRepository` constructor                | `"reviews"`      | `REVIEW_COLLECTION`  |
| `CouponsRepository.applyCoupon()`             | `"users"`        | `USER_COLLECTION`    |
| `CouponsRepository.getUserCouponUsageCount()` | `"users"`        | `USER_COLLECTION`    |

#### Error Handling Inconsistencies

| Repository                   | Issue                                                          | Fix                                                        |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| `sessionRepository`          | Catches errors and returns `[]` silently — swallows exceptions | Throw `DatabaseError` like other repos, let callers handle |
| `couponsRepository.create()` | Accepts `Partial<CouponDocument>`                              | Use `CouponCreateInput` type                               |

### 1D. API Endpoint Fixes

#### Endpoints Defined but No Route Implementation

| Endpoint                     | Path                              | Action                                                |
| ---------------------------- | --------------------------------- | ----------------------------------------------------- |
| `AUTH.REFRESH_TOKEN`         | `/api/auth/refresh-token`         | Remove constant OR implement route                    |
| `USER.DELETE_ACCOUNT`        | `/api/user/account`               | Remove — `PROFILE.DELETE_ACCOUNT` already covers this |
| `ADMIN.REVOKE_SESSION(id)`   | `/api/admin/sessions/[id]`        | Implement route or remove                             |
| `ADMIN.REVOKE_USER_SESSIONS` | `/api/admin/sessions/revoke-user` | Implement route or remove                             |
| `NEWSLETTER.SUBSCRIBE`       | `/api/newsletter/subscribe`       | Implement route or remove                             |

#### API Routes With No Endpoint Constant

| Route File                      | Add As                                             |
| ------------------------------- | -------------------------------------------------- |
| `api/demo/seed/route.ts`        | `API_ENDPOINTS.DEMO.SEED` (dev-only, low priority) |
| `api/profile/[userId]/route.ts` | `API_ENDPOINTS.PROFILE.GET_BY_ID` (helper fn)      |

#### Duplicate Endpoint Overlap

| Constant A                                  | Constant B                                               | Action                                                                           |
| ------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `USER.DELETE_ACCOUNT` (`/api/user/account`) | `PROFILE.DELETE_ACCOUNT` (`/api/profile/delete-account`) | Remove `USER.DELETE_ACCOUNT`, keep `PROFILE.DELETE_ACCOUNT`                      |
| `USER.UPDATE_PROFILE`                       | `PROFILE.UPDATE`                                         | Clarify ownership — one for self-service, one for admin? Document or consolidate |

### 1E. Duplicate Code Consolidation

| Duplicated Function                                 | Location 1                                        | Location 2                                  | Location 3              | Action                                                                                         |
| --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `roleHierarchy`                                     | `helpers/auth/auth.helper.ts` (2x)                | `lib/security/authorization.ts`             | —                       | Extract to `constants/rbac.ts` as `ROLE_HIERARCHY` constant                                    |
| `canChangeRole`                                     | `helpers/auth/auth.helper.ts`                     | `lib/security/authorization.ts`             | —                       | Keep `lib/security/`, remove from helpers, update imports                                      |
| `deepClone` / `deepCloneObject`                     | `utils/converters/type.converter.ts` (JSON-based) | `helpers/data/object.helper.ts` (recursive) | —                       | Keep recursive version in helpers as `deepClone`, alias old name, deprecate converter version  |
| `isSessionExpired` / `isTokenExpired`               | `helpers/auth/auth.helper.ts`                     | `helpers/auth/token.helper.ts`              | —                       | Keep ONE generic `isExpired(date)` in token.helper, have session.helper delegate               |
| `getSessionTimeRemaining` / `getTokenTimeRemaining` | `helpers/auth/auth.helper.ts`                     | `helpers/auth/token.helper.ts`              | —                       | Same — `getTimeRemaining(date)`                                                                |
| `sortBy` / `sort`                                   | `helpers/data/array.helper.ts`                    | `helpers/data/sorting.helper.ts`            | —                       | Keep `sortBy` in array.helper (simpler API), deprecate sorting helper version                  |
| `successResponse` / `errorResponse`                 | `lib/api-response.ts`                             | `lib/api/api-handler.ts`                    | `lib/api/middleware.ts` | **Consolidate to ONE canonical source**: `lib/api-response.ts`. Other files import from there. |

### 1F. Add All Missing UI Constants

> Create every string constant BEFORE any component work begins. This way Phases 3-6 can use constants from day one.

**Add to `src/constants/ui.ts`:**

```tsx
UI_LABELS.ADMIN = {
  DASHBOARD: { TITLE: 'Dashboard Overview', SUBTITLE: 'System statistics and quick actions', QUICK_ACTIONS: 'Quick Actions', ... },
  USERS: { TITLE: 'Users', DETAIL: 'User Details', ALL: 'All Users', ACTIVE: 'Active', BANNED: 'Banned', ADMINS: 'Admins', ... },
  SITE: { TITLE: 'Site Settings', SUBTITLE: 'Configure global site settings', ... },
  CAROUSEL: { TITLE: 'Carousel Management', ... },
  CATEGORIES: { TITLE: 'Categories', ... },
  FAQS: { TITLE: 'FAQs', ... },
  SECTIONS: { TITLE: 'Homepage Sections', ... },
  REVIEWS: { TITLE: 'Reviews', ... },
};

UI_LABELS.USER = {
  PROFILE: { TITLE: 'My Profile', ... },
  SETTINGS: { TITLE: 'Settings', ... },
  ORDERS: { TITLE: 'My Orders', EMPTY: 'No orders yet', EMPTY_SUBTITLE: 'Start shopping to see your orders here', ... },
  WISHLIST: { TITLE: 'My Wishlist', EMPTY: 'Your wishlist is empty', EMPTY_SUBTITLE: 'Save items you love to your wishlist', ... },
  ADDRESSES: { TITLE: 'My Addresses', ADD: 'Add New Address', EDIT: 'Edit Address', EMPTY: 'No saved addresses', ... },
};

UI_LABELS.HOMEPAGE = {
  TRUST_INDICATORS: { ... },
  FEATURES: { TITLE: 'Why Shop With Us?', ... },
  NEWSLETTER: { TITLE: 'Stay Updated', ... },
  REVIEWS: { TITLE: 'What Our Customers Say', ... },
  AUCTIONS: { TITLE: 'Live Auctions', ... },
  ...
};

UI_LABELS.FOOTER = { QUICK_LINKS: 'Quick Links', ABOUT_US: 'About Us', ... };
UI_LABELS.FAQS = { TITLE: 'Frequently Asked Questions', ... };
```

**Add missing `UI_PLACEHOLDERS`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES` entries.**

### 1G. Missing Admin Coupons Page

Schema + repository for `coupons` exist but there's no `/admin/coupons` page, no `ROUTES.ADMIN.COUPONS`, and no `API_ENDPOINTS.COUPONS.*` constants. Either:

- **Create** the admin coupons CRUD page (matches the existing data layer)
- **Or** add a TODO marker and route constant for future implementation

### 1H. SITE_CONFIG Route Deduplication

**Problem**: `SITE_CONFIG` in `src/constants/site.ts` duplicates route strings that should live in `ROUTES`:

| `SITE_CONFIG` Property               | Duplicates                        |
| ------------------------------------ | --------------------------------- |
| `SITE_CONFIG.nav.home`               | `ROUTES.HOME`                     |
| `SITE_CONFIG.nav.products`           | Future `ROUTES.PUBLIC.PRODUCTS`   |
| `SITE_CONFIG.nav.auctions`           | Future `ROUTES.PUBLIC.AUCTIONS`   |
| `SITE_CONFIG.nav.sellers`            | Future `ROUTES.PUBLIC.SELLERS`    |
| `SITE_CONFIG.nav.categories`         | Future `ROUTES.PUBLIC.CATEGORIES` |
| `SITE_CONFIG.nav.promotions`         | Future `ROUTES.PUBLIC.PROMOTIONS` |
| `SITE_CONFIG.nav.about`              | Future `ROUTES.PUBLIC.ABOUT`      |
| `SITE_CONFIG.nav.contact`            | Future `ROUTES.PUBLIC.CONTACT`    |
| `SITE_CONFIG.nav.blog`               | Future `ROUTES.PUBLIC.BLOG`       |
| `SITE_CONFIG.account.profile`        | `ROUTES.USER.PROFILE`             |
| `SITE_CONFIG.account.settings`       | `ROUTES.USER.SETTINGS`            |
| `SITE_CONFIG.account.orders`         | `ROUTES.USER.ORDERS`              |
| `SITE_CONFIG.account.wishlist`       | `ROUTES.USER.WISHLIST`            |
| `SITE_CONFIG.account.addresses`      | `ROUTES.USER.ADDRESSES`           |
| `SITE_CONFIG.account.login`          | `ROUTES.AUTH.LOGIN`               |
| `SITE_CONFIG.account.register`       | `ROUTES.AUTH.REGISTER`            |
| `SITE_CONFIG.account.forgotPassword` | `ROUTES.AUTH.FORGOT_PASSWORD`     |
| `SITE_CONFIG.account.verifyEmail`    | `ROUTES.AUTH.VERIFY_EMAIL`        |

**Fix**: After task 1.2 adds the missing `ROUTES.PUBLIC.*` constants:

1. Rewrite `SITE_CONFIG.nav` to reference `ROUTES.PUBLIC.*` and `ROUTES.HOME`
2. Rewrite `SITE_CONFIG.account` to reference `ROUTES.USER.*` and `ROUTES.AUTH.*`
3. Add `SITE_CONFIG.account.cart` → `ROUTES.USER.CART`
4. Remove `SITE_CONFIG.account.logout` (logout is an action, not a route)

**Result**: `SITE_CONFIG` keeps its purpose (brand info, social links, contact, SEO) but all route paths become single-source-of-truth from `ROUTES`.

### 1I. Navigation Constants Hardcoded Routes

**Problem**: `src/constants/navigation.tsx` — the very file meant to centralize navigation — has 4 hardcoded route strings in `SIDEBAR_NAV_GROUPS`:

| Current Hardcoded String | Should Be               |
| ------------------------ | ----------------------- |
| `"/user/orders"`         | `ROUTES.USER.ORDERS`    |
| `"/user/wishlist"`       | `ROUTES.USER.WISHLIST`  |
| `"/user/addresses"`      | `ROUTES.USER.ADDRESSES` |
| `"/help"`                | `ROUTES.PUBLIC.HELP`    |

Additionally, `MAIN_NAV_ITEMS` uses `SITE_CONFIG.nav.*` for hrefs — after task 1H, these will transitively use `ROUTES` (no change needed in `navigation.tsx` itself).

### 1J. Hooks Foundation Cleanup

> Clean up dead/duplicate hooks BEFORE component work begins in Phase 3. Dead hooks bloat the barrel, confuse developers, and make auto-imports unreliable.

#### Dead Hooks (zero consumers across entire codebase)

| Hook                       | File              | Reason Dead                                            | Action                                         |
| -------------------------- | ----------------- | ------------------------------------------------------ | ---------------------------------------------- |
| `useLogin`                 | `useAuth.ts`      | Auth pages call Firebase SDK directly                  | Keep — wire up in Phase 6 auth refactor        |
| `useRegister`              | `useAuth.ts`      | Auth pages call Firebase SDK directly                  | Keep — wire up in Phase 6 auth refactor        |
| `useVerifyEmail`           | `useAuth.ts`      | Auth pages call Firebase SDK directly                  | Keep — wire up in Phase 6 auth refactor        |
| `useForgotPassword`        | `useAuth.ts`      | Auth pages call Firebase SDK directly                  | Keep — wire up in Phase 6 auth refactor        |
| `useProfile`               | `useProfile.ts`   | Pages use `useAuth()` from SessionContext              | Keep — wire up in Phase 5 user refactor        |
| `useFormState`             | `useFormState.ts` | Never consumed; duplicates `useForm`                   | **Remove** — consolidate into `useForm`        |
| `useLongPress`             | `useLongPress.ts` | Never consumed; duplicated by `useGesture.onLongPress` | **Remove**                                     |
| `useMySessions`            | `useSessions.ts`  | No user-facing sessions UI exists                      | Mark `@deprecated` — future feature            |
| `useRevokeMySession`       | `useSessions.ts`  | No user-facing sessions UI exists                      | Mark `@deprecated` — future feature            |
| `useUserSessions`          | `useSessions.ts`  | No user-facing sessions UI exists                      | Mark `@deprecated` — future feature            |
| All 6 `useAddresses` hooks | `useAddresses.ts` | ALL are stubs (TODO bodies, return empty data)         | **Remove stubs** — rewrite properly in Phase 5 |
| 8 `useRBAC` hooks          | `useRBAC.ts`      | Zero consumers, not exported from barrel               | Keep — export in task 1.24, use in Phase 4/5   |

#### Form Hook Consolidation

Two competing form hooks:

- `useForm` — more feature-rich (validation, touched tracking, submit handling)
- `useFormState` — simpler subset, never consumed

**Action**: Delete `useFormState.ts`, keep `useForm` as the single form hook. Remove from barrel exports.

#### `useAdminStats` Issues

- Hand-rolls `fetch()` + loading/error state instead of using `useApiQuery`
- Hardcodes `"/api/admin/dashboard"` instead of `API_ENDPOINTS.ADMIN.DASHBOARD`

**Action**: Refactor to use `useApiQuery(API_ENDPOINTS.ADMIN.DASHBOARD)` — reduces ~55 lines to ~10.

#### Session Hooks Inconsistency

- `useRevokeSession` and `useRevokeUserSessions` use raw `fetch()` while sibling hooks use `apiClient`
- **Action**: Standardize to `apiClient` in Phase 7 cleanup

### Task List — Phase 1

| #    | Task                                                                                                                        | File(s)                                           | Status |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------ |
| 1.1  | Remove `ROUTES.ADMIN.CONTENT`, `ROUTES.ERRORS.NOT_FOUND`, `ROUTES.API.*`                                                    | `src/constants/routes.ts`                         | ✅     |
| 1.2  | Add `ROUTES.PUBLIC.*`, `ROUTES.USER.CART`, `ROUTES.USER.ADDRESSES_ADD/EDIT`, `ROUTES.USER.ORDER_DETAIL`, `ROUTES.DEMO.SEED` | `src/constants/routes.ts`                         | ✅     |
| 1.3  | Add all user routes to `PROTECTED_ROUTES`                                                                                   | `src/constants/routes.ts`                         | ✅     |
| 1.3a | Rewrite `SITE_CONFIG.nav` to reference `ROUTES.PUBLIC.*`/`ROUTES.HOME`                                                      | `src/constants/site.ts`                           | ✅     |
| 1.3b | Rewrite `SITE_CONFIG.account` to reference `ROUTES.USER.*`/`ROUTES.AUTH.*`                                                  | `src/constants/site.ts`                           | ✅     |
| 1.3c | Fix 4 hardcoded route strings in `SIDEBAR_NAV_GROUPS` → use `ROUTES.*`                                                      | `src/constants/navigation.tsx`                    | ✅     |
| 1.4  | Add `featured?: boolean` to `ReviewDocument`                                                                                | `src/db/schema/reviews.ts`                        | ✅     |
| 1.5  | Fix categories firestore index field name (`featured` → `isFeatured`)                                                       | `firestore.indexes.json`                          | ✅     |
| 1.6  | Create `bidRepository`                                                                                                      | `src/repositories/bid.repository.ts`              | ✅     |
| 1.7  | Fix hardcoded collection names in Product/Order/Review/Coupons repos                                                        | 4 repository files                                | ✅     |
| 1.8  | Fix `sessionRepository` silent error swallowing                                                                             | `src/repositories/session.repository.ts`          | ✅     |
| 1.9  | Fix `couponsRepository.create()` param type → `CouponCreateInput`                                                           | `src/repositories/coupons.repository.ts`          | ✅     |
| 1.10 | Clean up dead/duplicate API endpoint constants                                                                              | `src/constants/api-endpoints.ts`                  | ✅     |
| 1.11 | Add missing API endpoint constants (`PROFILE.GET_BY_ID`)                                                                    | `src/constants/api-endpoints.ts`                  | ✅     |
| 1.12 | Extract `ROLE_HIERARCHY` to `src/constants/rbac.ts`, remove duplicates                                                      | 3 files + new file                                | ✅     |
| 1.13 | Consolidate `successResponse`/`errorResponse` to `lib/api-response.ts`, migrate 4 API routes                                | 5 files                                           | ✅     |
| 1.14 | Merge duplicate `isExpired`/`getTimeRemaining` — session delegates to token                                                 | 2 files                                           | ✅     |
| 1.15 | Remove duplicate `canChangeRole` from helpers (keep `lib/security`)                                                         | 2 files                                           | ✅     |
| 1.16 | Choose canonical `deepClone` (helpers) and deprecate converter version                                                      | 2 files                                           | ✅     |
| 1.17 | Add all `UI_LABELS.ADMIN.*` (~120 strings)                                                                                  | `src/constants/ui.ts`                             | ✅     |
| 1.18 | Add all `UI_LABELS.USER.*` (~50 strings)                                                                                    | `src/constants/ui.ts`                             | ✅     |
| 1.19 | Add all `UI_LABELS.HOMEPAGE.*` (~80 strings)                                                                                | `src/constants/ui.ts`                             | ✅     |
| 1.20 | Add `UI_LABELS.FOOTER.*`, `UI_LABELS.FAQ.*` (~30 strings)                                                                   | `src/constants/ui.ts`                             | ✅     |
| 1.21 | Add missing `UI_PLACEHOLDERS` entries                                                                                       | `src/constants/ui.ts`                             | ✅     |
| 1.22 | Add missing `ERROR_MESSAGES` entries                                                                                        | `src/constants/messages.ts`                       | ✅     |
| 1.23 | Add missing `SUCCESS_MESSAGES` entries                                                                                      | `src/constants/messages.ts`                       | ✅     |
| 1.24 | Export `useRBAC` from hooks barrel                                                                                          | `src/hooks/index.ts`                              | ✅     |
| 1.25 | Update `src/constants/index.ts` barrel for new exports                                                                      | barrel                                            | ✅     |
| 1.26 | Delete `src/app/admin/site/page-old.tsx`                                                                                    | dead file                                         | ✅     |
| 1.27 | Delete `useFormState.ts` — consolidated into `useForm`                                                                      | `src/hooks/useFormState.ts`, `src/hooks/index.ts` | ✅     |
| 1.28 | Delete `useLongPress.ts` — covered by `useGesture.onLongPress`                                                              | `src/hooks/useLongPress.ts`, `src/hooks/index.ts` | ✅     |
| 1.29 | Delete 6 stub `useAddresses` hooks (all TODO bodies, zero consumers)                                                        | `src/hooks/useAddresses.ts`                       | ✅     |
| 1.30 | Refactor `useAdminStats` → uses `useApiQuery` + `API_ENDPOINTS` + `ERROR_MESSAGES`                                          | `src/hooks/useAdminStats.ts`                      | ✅     |
| 1.31 | Mark `useMySessions`, `useRevokeMySession`, `useUserSessions` as `@deprecated`                                              | `src/hooks/useSessions.ts`                        | ✅     |

---

## Phase 2: Design System & Base Component Upgrades ✅ COMPLETE

> Establish the visual language before creating any new components. After this phase, every new component built in Phases 3-6 uses the right design from day one — no restyling pass needed.
> **Status**: All 10 tasks completed. Tasks 2.1-2.7 were completed during Phase 1 foundation work. Tasks 2.8-2.10 completed in Phase 2 pass.

### Problem — "Claustrophobic" UI

The current UI is overwhelmingly **gray/blue monochrome**. Analysis of every color used:

| Color                | Coverage       | Usage                                                               |
| -------------------- | -------------- | ------------------------------------------------------------------- |
| **Gray** (50–950)    | ~90% of all UI | Backgrounds, text, borders, cards — everywhere                      |
| **Blue** (primary)   | ~8%            | Buttons, links, active states                                       |
| **Red/Green/Yellow** | ~2%            | Error/success/warning states only                                   |
| **Purple/Cyan**      | < 1%           | Badge-only appearances                                              |
| **Accent red**       | 0%             | Defined in `tailwind.config.js` but **never used in any component** |

#### Specific "claustrophobic" patterns identified:

1. **Tight main content padding**: `py-4 sm:py-6` — only 16px/24px breathing room
2. **Card padding caps at `sm:p-6`** — no `lg:p-8` scaling for larger screens
3. **No section spacing in layout shell** — pages must manually add spacing between sections
4. **`text-sm` used everywhere** for body text (0.875rem = 14px) — feels cramped
5. **No decorative elements**: zero background patterns, zero gradients on sections, zero illustrations
6. **Glass effects defined in CSS but never used** (`.glass`, `.glass-strong`)
7. **Ultra-wide constants exist** (`max-w-[1600px]`, `max-w-[1920px]`) but layout always uses `max-w-7xl` (1280px)
8. **Footer is the ONLY gradient** in the entire app — everything else is flat gray
9. **No visual section breaks** — just `border-t` dividers
10. **Typography jumps**: `h1` goes from `text-4xl` to `text-7xl` at 2xl breakpoint (massive), but components use `text-sm` for body (tiny)
11. **DataTable has no pagination** — renders ALL rows, feels overwhelming with large datasets
12. **Button inconsistency**: `primary`/`secondary` use gradients but `danger` is flat solid — no visual harmony

#### Dark mode gaps:

- Footer gradient looks identical to page background in dark mode
- DataTable has hardcoded `divide-gray-200 dark:divide-gray-700` not from constants
- Role badge colors (`text-red-500`, etc.) in TitleBar/BottomNavbar have no `dark:` variants
- TitleBar uses deprecated `bg-opacity-90` pattern instead of `bg-white/90`

### 2A. Color Palette — From Monochrome to Vibrant

**Solution**: Redefine the palette to add vibrancy while keeping professional:

```tsx
// tailwind.config.js — update color palette
primary: { /* Keep blue but shift to indigo for more personality */
  50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
  400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
  800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
},
secondary: { /* Warm teal instead of cold slate */
  50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
  400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
  800: '#115e59', 900: '#134e4a', 950: '#042f2e',
},
accent: { /* Warm amber/orange for CTAs and highlights */
  50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
  400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
  800: '#92400e', 900: '#78350f',
},
```

Add to `THEME_CONSTANTS`:

```tsx
accent: {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  primarySoft: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  secondary: 'bg-teal-600 hover:bg-teal-700 text-white',
  secondarySoft: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  warm: 'bg-amber-500 hover:bg-amber-600 text-white',
  warmSoft: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  successSoft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  dangerSoft: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  warningSoft: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  info: 'bg-sky-500 hover:bg-sky-600 text-white',
  infoSoft: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
},
```

### 2B. Spacing — Add Breathing Room

```tsx
spacing: {
  stack: 'space-y-4',
  stackSmall: 'space-y-2',
  inline: 'space-x-4',
  // NEW — generous section spacing
  section: 'space-y-8 md:space-y-12 lg:space-y-16',
  pageY: 'py-6 sm:py-8 lg:py-10',         // Replace current py-4 sm:py-6
  sectionGap: 'mt-8 md:mt-12',             // Between major page sections
  cardPadding: 'p-5 sm:p-6 lg:p-8',       // Scales for larger screens
  padding: {
    xs: 'p-2', sm: 'p-3', md: 'p-4', lg: 'p-6', xl: 'p-8',
    '2xl': 'p-10',                          // NEW — for hero sections
  },
  gap: { xs: 'gap-2', sm: 'gap-3', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' },
},
```

### 2C. Typography — Professional Scale

```tsx
typography: {
  pageTitle: 'text-2xl md:text-3xl font-bold tracking-tight leading-tight',
  pageSubtitle: 'text-base text-gray-500 dark:text-gray-400 leading-relaxed mt-1',
  sectionTitle: 'text-xl md:text-2xl font-semibold tracking-tight',
  sectionSubtitle: 'text-sm md:text-base text-gray-500 dark:text-gray-400',
  cardTitle: 'text-lg font-semibold leading-snug',
  cardBody: 'text-sm md:text-base leading-relaxed',               // NOT just text-sm
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  caption: 'text-xs text-gray-500 dark:text-gray-400',
  overline: 'text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
  h1: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',   // Was text-4xl to text-7xl
  h2: 'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight',
  h3: 'text-xl md:text-2xl lg:text-3xl font-bold tracking-tight',
  h4: 'text-lg md:text-xl font-bold',
},
```

### 2D. Card Enhancement — Vibrant Variants

Current cards are `bg-white dark:bg-gray-900 shadow-md` — flat and identical. Add personality:

```tsx
card: {
  base: 'rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200',
  elevated: 'rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200',
  interactive: 'rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 cursor-pointer',
  glass: 'rounded-xl backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/50 shadow-lg',
  gradient: {
    indigo: 'rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/40',
    teal: 'rounded-xl bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/40 dark:to-gray-900 border border-teal-100 dark:border-teal-900/40',
    amber: 'rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-gray-900 border border-amber-100 dark:border-amber-900/40',
    rose: 'rounded-xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-gray-900 border border-rose-100 dark:border-rose-900/40',
  },
  stat: {
    indigo: 'rounded-xl border-l-4 border-l-indigo-500 bg-white dark:bg-gray-900 shadow-sm',
    teal: 'rounded-xl border-l-4 border-l-teal-500 bg-white dark:bg-gray-900 shadow-sm',
    amber: 'rounded-xl border-l-4 border-l-amber-500 bg-white dark:bg-gray-900 shadow-sm',
    rose: 'rounded-xl border-l-4 border-l-rose-500 bg-white dark:bg-gray-900 shadow-sm',
    emerald: 'rounded-xl border-l-4 border-l-emerald-500 bg-white dark:bg-gray-900 shadow-sm',
  },
},
```

### 2E. Input Enhancement

```tsx
input: {
  base: 'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-150 placeholder:text-gray-400 dark:placeholder:text-gray-500',
  error: 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/50 dark:bg-rose-950/10',
  success: 'border-emerald-400 dark:border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500',
  disabled: 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed',
},
```

### 2F. Badge System — Status & Role

```tsx
badge: {
  active: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/20',
  inactive: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-400/20',
  pending: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-400/20',
  danger: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-400/20',
  info: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-400/20',
  admin: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-400/20',
  moderator: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-400/20',
  seller: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-400/20',
  user: 'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20',
},
```

### 2G. Page Layout & Section Backgrounds

```tsx
pageHeader: {
  wrapper: 'pb-6 mb-8 border-b border-gray-200 dark:border-gray-700/60',
  withGradient: 'pb-8 mb-8 border-b border-gray-200/80 dark:border-gray-700/40 bg-gradient-to-r from-indigo-50/60 via-transparent to-teal-50/30 dark:from-indigo-950/20 dark:via-transparent dark:to-teal-950/10 rounded-t-xl -mx-4 -mt-4 px-4 pt-6 md:-mx-6 md:-mt-6 md:px-6 md:pt-8',
  adminGradient: 'pb-8 mb-8 border-b border-gray-200/80 dark:border-gray-700/40 bg-gradient-to-r from-purple-50/60 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/10 rounded-t-xl -mx-4 -mt-4 px-4 pt-6 md:-mx-6 md:-mt-6 md:px-6 md:pt-8',
},

sectionBg: {
  subtle: 'bg-gray-50/50 dark:bg-gray-800/20',
  warm: 'bg-gradient-to-br from-amber-50/30 to-orange-50/20 dark:from-amber-950/10 dark:to-orange-950/5',
  cool: 'bg-gradient-to-br from-indigo-50/30 to-sky-50/20 dark:from-indigo-950/10 dark:to-sky-950/5',
  mesh: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-teal-50/20 dark:from-indigo-950/20 dark:via-gray-900 dark:to-teal-950/10',
},
```

### 2H. Button Variant Harmonization

All button variants should use gradients for consistency:

```tsx
primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-md shadow-indigo-500/20',
secondary: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm hover:shadow-md shadow-teal-500/20',
danger: 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-sm hover:shadow-md shadow-rose-500/20',
warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm hover:shadow-md shadow-amber-500/20',
outline: 'border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50',
ghost: 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800',
```

### 2I. Dark Mode Vibrancy

Dark mode should have its own personality, not just a duller light mode:

```tsx
themed: {
  bgPrimary: 'bg-white dark:bg-gray-950',           // Deeper black instead of gray-900
  bgSecondary: 'bg-gray-50 dark:bg-gray-900',
  bgTertiary: 'bg-gray-100 dark:bg-gray-800',
  bgElevated: 'bg-white dark:bg-gray-900/80',        // Slightly transparent for depth
  textPrimary: 'text-gray-900 dark:text-gray-50',    // Brighter white text
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textMuted: 'text-gray-400 dark:text-gray-500',
  border: 'border-gray-200 dark:border-gray-800',
  borderSubtle: 'border-gray-100 dark:border-gray-800/60',
  divider: 'divide-gray-200 dark:divide-gray-800',
  hoverCard: 'hover:bg-gray-50 dark:hover:bg-indigo-950/20',     // Tinted hover
  activeRow: 'bg-indigo-50 dark:bg-indigo-950/30',                // Tinted active
},
```

### 2J. Animation & Micro-interactions

```tsx
animation: {
  fadeIn: 'animate-in fade-in duration-200',
  slideUp: 'animate-in slide-in-from-bottom-2 duration-300',
  slideDown: 'animate-in slide-in-from-top-2 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  stagger: (index: number) => ({
    animationDelay: `${index * 50}ms`,
    animationFillMode: 'both',
  }),
},
```

### 2K. DataTable Enhancement — Pagination + Mobile View

DataTable currently renders ALL rows with no pagination. Expand its props:

```tsx
interface DataTableProps<T> {
  // ... existing
  pageSize?: number; // Default 10, enables pagination
  showPagination?: boolean; // Default true when pageSize set
  mobileCardRender?: (item: T) => React.ReactNode; // Card-based mobile view
  emptyIcon?: React.ReactNode; // Custom empty state icon
  emptyTitle?: string; // Custom empty title
  emptyMessage?: string; // Custom empty description
  stickyHeader?: boolean; // Sticky thead on scroll
  striped?: boolean; // Alternating row colors for readability
}
```

### Task List — Phase 2

| #    | Task                                                                                                                                                             | File(s)                              | Status |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------ |
| 2.1  | Update `tailwind.config.js` — shift primary to indigo, secondary to teal, accent to amber                                                                        | `tailwind.config.js`                 | ✅     |
| 2.2  | Add `accent`, `badge`, `card` (gradient + stat), `input`, `pageHeader`, `sectionBg`, `animation` to `THEME_CONSTANTS`                                            | `src/constants/theme.ts`             | ✅     |
| 2.3  | Add enhanced `spacing` (pageY, section, cardPadding, 2xl) and `typography` (pageTitle through overline, moderated h1-h4)                                         | `src/constants/theme.ts`             | ✅     |
| 2.4  | Update `themed.*` constants for deeper dark mode + tinted hover/active states                                                                                    | `src/constants/theme.ts`             | ✅     |
| 2.5  | Update `Button.tsx` — harmonize all variants with gradient + colored shadow                                                                                      | `src/components/ui/Button.tsx`       | ✅     |
| 2.6  | Update `Card.tsx` — add gradient, glass, stat variants                                                                                                           | `src/components/ui/Card.tsx`         | ✅     |
| 2.7  | Update `Badge.tsx` — add ring-1 borders, role-specific named variants                                                                                            | `src/components/ui/Badge.tsx`        | ✅     |
| 2.8  | Update `DataTable.tsx` — add pagination, striped rows, sticky header, mobile card view, use `themed.divider`, replace hardcoded strings with `UI_LABELS.TABLE.*` | `src/components/admin/DataTable.tsx` | ✅     |
| 2.9  | Update `SideDrawer.tsx` — wider on desktop (`lg:max-w-2xl`), mode-aware gradient header accent, better close button with ring                                    | `src/components/ui/SideDrawer.tsx`   | ✅     |
| 2.10 | Update `LayoutClient.tsx` — increase main content padding to `THEME_CONSTANTS.spacing.pageY`                                                                     | `src/components/LayoutClient.tsx`    | ✅     |

---

## Phase 3: Shared UI Infrastructure ✅ COMPLETE

> Create all reusable components that will be used across admin, user, and public pages. These components use the Phase 1 constants and Phase 2 design system from day one — no restyling needed later.
> **Status**: All 23 tasks completed. Most components were created during Phase 1-2 foundation work. Remaining fixes (duplicate UserTabs removal, hardcoded string fixes) completed in Phase 3 pass.

### 3A. Navigation — SectionTabs

#### Problem

- `AdminTabs` (9 tabs) and `UserTabs` (5 tabs) are **separate, near-identical components** with duplicated logic.
- Both **hardcode route paths and label strings** (violates Rules 2, 12).
- On mobile, horizontal-scrolling tabs are **hard to navigate** with 9+ items.

#### Solution: Single `SectionTabs` Base Component

**File**: `src/components/ui/SectionTabs.tsx`

A single smart component that:

- Accepts a `tabs` array config (label, href, icon?)
- **Desktop**: Renders full horizontal tab bar with all tabs visible
- **Mobile**: Renders a **styled dropdown `<Select>`** with current tab shown
- Uses `usePathname()` for active-tab detection
- Uses `ROUTES` constants for hrefs and `UI_LABELS` for labels (from Phase 1)
- Uses `THEME_CONSTANTS.accent` and `THEME_CONSTANTS.themed` for styling (from Phase 2)

#### Desktop Behavior

```
┌─────────────────────────────────────────────────────────┐
│ TitleBar (logo, search, cart, avatar)                   │
├─────────────────────────────────────────────────────────┤
│ MainNavbar (Home | Products | Auctions | ...)           │
├─────────────────────────────────────────────────────────┤
│ [Dashboard] [Users] [Site] [Carousel] [Sections] [...]  │  ← SectionTabs (full bar, sticky)
├─────────────────────────────────────────────────────────┤
│ Page Content                                            │
└─────────────────────────────────────────────────────────┘
```

#### Mobile Behavior

```
┌─────────────────────────────┐
│ TitleBar                    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ▼ Dashboard           ▾ │ │  ← Dropdown select
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Page Content                │
└─────────────────────────────┘
```

#### Component API

```tsx
interface SectionTab {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SectionTabsProps {
  tabs: SectionTab[];
  variant?: "admin" | "user" | "default";
  className?: string;
}

// Usage
import { SectionTabs } from "@/components";
import { ADMIN_TAB_ITEMS } from "@/constants";
<SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />;
```

### 3B. Responsive Utilities

#### Problem

No centralized mobile/desktop detection utility. Components use ad-hoc `window.innerWidth` checks or Tailwind `hidden md:block` classes inconsistently.

#### Solution: `useBreakpoint` + `ResponsiveView`

```tsx
// useBreakpoint API
const { isMobile, isTablet, isDesktop, breakpoint } = useBreakpoint();
// isMobile: < 768px | isTablet: 768px–1023px | isDesktop: >= 1024px

// ResponsiveView API
<ResponsiveView
  mobile={<MobileProductGrid products={products} />}
  desktop={<DesktopProductTable products={products} />}
/>;
```

#### Components That Need Desktop/Mobile Variants

| Component                   | Desktop Design                   | Mobile Design                                |
| --------------------------- | -------------------------------- | -------------------------------------------- |
| `SectionTabs`               | Full horizontal bar              | Dropdown select                              |
| `DataTable`                 | Full table with columns          | Card-based list view                         |
| `HeroCarousel`              | Full overlay with text           | Compact bottom overlay, truncated text       |
| `AdminStatsCards`           | 3-4 column grid                  | Horizontal scrollable chips or 2-col compact |
| `FeaturedProducts/Auctions` | 4-5 column grid, max-w container | 2-col grid or horizontal scroll              |
| `CustomerReviewsSection`    | 3-card row carousel              | Single-card carousel with swipe              |
| `EnhancedFooter`            | 4-5 column grid                  | Accordion sections                           |
| `UserProfile`               | Side-by-side avatar + info       | Centered avatar above stacked info           |
| `User Settings`             | Two-column layout                | Single-column stack                          |
| `SideDrawer`                | Wide drawer (lg: 50%)            | Full-screen overlay sheet                    |
| `TrustIndicators`           | 4-column grid                    | 2x2 grid with sm breakpoint                  |
| `TopCategories`             | 4-column grid                    | Horizontal scroll or 2x2                     |

### 3C. Admin Shared Components

> These components are used across **multiple** admin pages, so they're created here as reusable building blocks.

| Component          | File                                        | Description                                                                                                                      |
| ------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `AdminPageHeader`  | `src/components/admin/AdminPageHeader.tsx`  | Title + subtitle + optional action button. Uses `THEME_CONSTANTS.pageHeader.adminGradient` + `typography.pageTitle` from day one |
| `AdminFilterBar`   | `src/components/admin/AdminFilterBar.tsx`   | Card-wrapped grid of filter inputs (search, select, status tabs). Uses `THEME_CONSTANTS.input.base` + `card.base`                |
| `DrawerFormFooter` | `src/components/admin/DrawerFormFooter.tsx` | Cancel + Save/Delete button pair used in all SideDrawer forms                                                                    |
| `StatusBadge`      | `src/components/ui/StatusBadge.tsx`         | Status badge with color map. Uses `THEME_CONSTANTS.badge.*` — replaces 20+ inline badge renderings                               |
| `RoleBadge`        | `src/components/ui/RoleBadge.tsx`           | Role-specific badge (admin=purple, mod=blue, seller=green, user=gray). Uses `THEME_CONSTANTS.badge.*`                            |
| `EmptyState`       | `src/components/ui/EmptyState.tsx`          | Centered icon + title + description + CTA button. Uses warm amber CTA, `THEME_CONSTANTS.accent.warm`                             |

### 3D. User Shared Components

> These components are used across user settings, profile, and address pages.

| Component               | File                                                     | Description                                                                                                 |
| ----------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AddressForm`           | `src/components/user/addresses/AddressForm.tsx`          | Shared form for add/edit. Accepts `initialData?` + `onSubmit`. Uses `FormField` + `THEME_CONSTANTS.input.*` |
| `AddressCard`           | `src/components/user/addresses/AddressCard.tsx`          | Display card for address in list. Uses `THEME_CONSTANTS.card.interactive`                                   |
| `EmailVerificationCard` | `src/components/user/settings/EmailVerificationCard.tsx` | Status + resend CTA. Uses `card.gradient.teal` (verified) or `card.gradient.amber` (unverified)             |
| `PhoneVerificationCard` | `src/components/user/settings/PhoneVerificationCard.tsx` | Status + verify CTA                                                                                         |
| `ProfileInfoForm`       | `src/components/user/settings/ProfileInfoForm.tsx`       | Avatar + display name + phone form                                                                          |
| `PasswordChangeForm`    | `src/components/user/settings/PasswordChangeForm.tsx`    | Current/new/confirm password with strength indicator                                                        |
| `AccountInfoCard`       | `src/components/user/settings/AccountInfoCard.tsx`       | Read-only user metadata (UID, created, last login)                                                          |
| `ProfileHeader`         | `src/components/user/profile/ProfileHeader.tsx`          | Avatar + name + role badge + email hero section. Uses `RoleBadge` + gradient banner                         |
| `ProfileStatsGrid`      | `src/components/user/profile/ProfileStatsGrid.tsx`       | Orders/Wishlist/Addresses stat cards. Uses `THEME_CONSTANTS.card.stat.*`                                    |

### 3E. Layout Integration

- Add `ADMIN_TAB_ITEMS` and `USER_TAB_ITEMS` to `src/constants/navigation.tsx`
- Refactor `AdminTabs` → thin wrapper: `<SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />`
- Refactor `UserTabs` → thin wrapper: `<SectionTabs tabs={USER_TAB_ITEMS} variant="user" />`
- Create `src/app/user/layout.tsx` with `<UserTabs />` wrapper
- Remove manual `<UserTabs />` from every user page
- Position `SectionTabs` after MainNavbar in admin/user layouts

### 3F. Toast/Notification System

> `useMessage()` hook exists and manages toast state (message queue, auto-dismiss timers), but there is **no renderer component**. Phase 7 tasks (7.2) plan to replace all `alert()` calls with `useMessage()`, which requires a visible Toast UI.

| Component       | File                                         | Description                                                                                                                                                       |
| --------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Toast`         | `src/components/ui/Toast.tsx`                | Individual toast notification with type variants (success/error/warning/info), dismiss button, auto-fade animation. Uses `THEME_CONSTANTS.badge.*` colors.        |
| `ToastProvider` | `src/components/providers/ToastProvider.tsx` | Context wrapper that renders toast stack (positioned fixed bottom-right). Wraps `useMessage()` state and renders `<Toast>` instances. Mount in root `layout.tsx`. |

**Without this component, the `useMessage()` → `alert()` replacement in Phase 7 has no visible output.**

### Task List — Phase 3

| #    | Task                                                                                                                                                                               | File(s)                                     | Status |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------ |
| 3.1  | Promote `useMediaQuery` from snippet to real hook                                                                                                                                  | `src/hooks/useMediaQuery.ts`                | ✅     |
| 3.2  | Create `useBreakpoint()` convenience hook                                                                                                                                          | `src/hooks/useBreakpoint.ts`                | ✅     |
| 3.3  | Create `<ResponsiveView>` component                                                                                                                                                | `src/components/utility/ResponsiveView.tsx` | ✅     |
| 3.4  | Create `SectionTabs` base component (desktop bar + mobile dropdown)                                                                                                                | `src/components/ui/SectionTabs.tsx`         | ✅     |
| 3.5  | Add `ADMIN_TAB_ITEMS` and `USER_TAB_ITEMS` to navigation constants                                                                                                                 | `src/constants/navigation.tsx`              | ✅     |
| 3.6  | Refactor `AdminTabs` → `<SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />`                                                                                                    | `src/components/admin/AdminTabs.tsx`        | ✅     |
| 3.7  | Refactor `UserTabs` → `<SectionTabs tabs={USER_TAB_ITEMS} variant="user" />`                                                                                                       | `src/components/user/UserTabs.tsx`          | ✅     |
| 3.8  | Create `src/app/user/layout.tsx` with `<UserTabs />` wrapper                                                                                                                       | New file                                    | ✅     |
| 3.9  | Remove manual `<UserTabs />` from all user pages                                                                                                                                   | 7 user pages                                | ✅     |
| 3.10 | Position SectionTabs after MainNavbar in admin/user layouts                                                                                                                        | `admin/layout.tsx`, `user/layout.tsx`       | ✅     |
| 3.11 | Create `AdminPageHeader` (with `pageHeader.adminGradient` baked in)                                                                                                                | `src/components/admin/AdminPageHeader.tsx`  | ✅     |
| 3.12 | Create `AdminFilterBar` (with `input.base` baked in)                                                                                                                               | `src/components/admin/AdminFilterBar.tsx`   | ✅     |
| 3.13 | Create `DrawerFormFooter`                                                                                                                                                          | `src/components/admin/DrawerFormFooter.tsx` | ✅     |
| 3.14 | Create `StatusBadge` (with `THEME_CONSTANTS.badge.*` baked in)                                                                                                                     | `src/components/ui/StatusBadge.tsx`         | ✅     |
| 3.15 | Create `RoleBadge` (with `THEME_CONSTANTS.badge.*` baked in)                                                                                                                       | `src/components/ui/RoleBadge.tsx`           | ✅     |
| 3.16 | Create `EmptyState` (with warm amber CTA baked in)                                                                                                                                 | `src/components/ui/EmptyState.tsx`          | ✅     |
| 3.17 | Create `AddressForm`, `AddressCard`                                                                                                                                                | `src/components/user/addresses/*.tsx`       | ✅     |
| 3.18 | Create `EmailVerificationCard`, `PhoneVerificationCard`                                                                                                                            | `src/components/user/settings/*.tsx`        | ✅     |
| 3.19 | Create `ProfileInfoForm`, `PasswordChangeForm`, `AccountInfoCard`                                                                                                                  | `src/components/user/settings/*.tsx`        | ✅     |
| 3.20 | Create `ProfileHeader`, `ProfileStatsGrid`                                                                                                                                         | `src/components/user/profile/*.tsx`         | ✅     |
| 3.21 | Create `Toast`/`NotificationContainer` component — `useMessage()` manages state but has NO renderer; Phase 7 replaces `alert()` → `useMessage()` which requires a visible toast UI | `src/components/feedback/Toast.tsx`         | ✅     |
| 3.22 | Export all new hooks from `src/hooks/index.ts`                                                                                                                                     | barrel                                      | ✅     |
| 3.23 | Export all new components from barrel files                                                                                                                                        | `src/components/**/index.ts`                | ✅     |

#### Additional Fixes Applied in Phase 3

| Fix                                                                                | File(s)                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Fixed 6 hardcoded strings in `ADMIN_TAB_ITEMS` → `UI_LABELS.NAV.*`                 | `src/constants/navigation.tsx`, `src/constants/ui.ts` |
| Fixed hardcoded `"Saving..."` in `DrawerFormFooter` → `UI_LABELS.LOADING.SAVING`   | `src/components/admin/DrawerFormFooter.tsx`           |
| Added `UI_LABELS.NAV.SITE_SETTINGS`, `.CAROUSEL`, `.SECTIONS`, `.FAQS`, `.REVIEWS` | `src/constants/ui.ts`                                 |

---

## Phase 4: Admin Page Decomposition ⏳ NEXT

> Extract per-page sub-components from monolithic admin pages. Since Phase 1 constants and Phase 2 design system already exist, each extracted component gets the right styling and constant usage from the start. **Each admin page is touched exactly once.**

### Why Single-Touch Matters

Old plan: Create `CarouselSlideForm` (Phase 3) → Apply design (Phase 6) → Fix strings (Phase 8) → Fix HTML forms (Phase 8) = **4 touches to same file**

New plan: Extract `CarouselSlideForm` using Phase 1 constants + Phase 2 design + `THEME_CONSTANTS.input.base` + `UI_LABELS.ADMIN.CAROUSEL.*` = **1 touch**

### Per-Page Extraction

#### Admin Dashboard (`src/app/admin/dashboard/page.tsx` → 167 lines)

| Extract To                                                                                  | File                                                    |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `QuickActionsGrid`                                                                          | `src/components/admin/dashboard/QuickActionsGrid.tsx`   |
| `RecentActivityCard`                                                                        | `src/components/admin/dashboard/RecentActivityCard.tsx` |
| Use `AdminPageHeader`, colored stat cards (`THEME_CONSTANTS.card.stat.*`), trend indicators |                                                         |
| Page reduces to ~80 lines                                                                   |                                                         |

#### Admin Site Settings (`src/app/admin/site/page.tsx` → 261 lines)

| Extract To                                                                                 | File                                                |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `SiteBasicInfoForm`                                                                        | `src/components/admin/site/SiteBasicInfoForm.tsx`   |
| `SiteContactForm`                                                                          | `src/components/admin/site/SiteContactForm.tsx`     |
| `SiteSocialLinksForm`                                                                      | `src/components/admin/site/SiteSocialLinksForm.tsx` |
| All forms use `FormField`/`Input`/`Select` from `@/components` + `THEME_CONSTANTS.input.*` |                                                     |
| Page reduces to ~80 lines                                                                  |                                                     |

#### Admin Users (`src/app/admin/users/[[...action]]/page.tsx` → 337 lines)

| Extract To                                                                       | File                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------- |
| `UserFilters` (search + role + status tabs)                                      | `src/components/admin/users/UserFilters.tsx`      |
| `UserDetailDrawer` (SideDrawer body)                                             | `src/components/admin/users/UserDetailDrawer.tsx` |
| `UserTableColumns` (column config + renderers)                                   | `src/components/admin/users/UserTableColumns.tsx` |
| Uses `RoleBadge`, `StatusBadge`, `DataTable` (with pagination), `AdminFilterBar` |                                                   |
| Hardcoded `/api/admin/users` → `API_ENDPOINTS.ADMIN.*`                           |                                                   |
| Page reduces to ~120 lines                                                       |                                                   |

#### Admin Carousel (`src/app/admin/carousel/[[...action]]/page.tsx` → 310 lines)

| Extract To                 | File                                                     |
| -------------------------- | -------------------------------------------------------- |
| `CarouselSlideForm`        | `src/components/admin/carousel/CarouselSlideForm.tsx`    |
| `CarouselTableColumns`     | `src/components/admin/carousel/CarouselTableColumns.tsx` |
| Page reduces to ~150 lines |                                                          |

#### Admin Categories (`src/app/admin/categories/[[...action]]/page.tsx` → 621 lines)

| Extract To                               | File                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| `CategoryForm`                           | `src/components/admin/categories/CategoryForm.tsx`         |
| `CategoryTableColumns`                   | `src/components/admin/categories/CategoryTableColumns.tsx` |
| `CategoryViewToggle` (tree/table toggle) | `src/components/admin/categories/CategoryViewToggle.tsx`   |
| Page reduces to ~200 lines               |                                                            |

#### Admin FAQs (`src/app/admin/faqs/[[...action]]/page.tsx` → 380 lines)

| Extract To                 | File                                            |
| -------------------------- | ----------------------------------------------- |
| `FAQForm`                  | `src/components/admin/faqs/FAQForm.tsx`         |
| `FAQTableColumns`          | `src/components/admin/faqs/FAQTableColumns.tsx` |
| Page reduces to ~150 lines |                                                 |

#### Admin Sections (`src/app/admin/sections/[[...action]]/page.tsx` → 330 lines)

| Extract To                 | File                                                    |
| -------------------------- | ------------------------------------------------------- |
| `SectionForm`              | `src/components/admin/sections/SectionForm.tsx`         |
| `SectionTableColumns`      | `src/components/admin/sections/SectionTableColumns.tsx` |
| Page reduces to ~150 lines |                                                         |

#### Admin Reviews (`src/app/admin/reviews/[[...action]]/page.tsx` → 450 lines)

| Extract To                 | File                                                  |
| -------------------------- | ----------------------------------------------------- |
| `ReviewFilters`            | `src/components/admin/reviews/ReviewFilters.tsx`      |
| `ReviewDetailView`         | `src/components/admin/reviews/ReviewDetailView.tsx`   |
| `ReviewTableColumns`       | `src/components/admin/reviews/ReviewTableColumns.tsx` |
| Page reduces to ~180 lines |                                                       |

### Compliance Included Per Page

While extracting each admin page, also fix in the same pass:

- Replace all hardcoded strings → `UI_LABELS.ADMIN.*` (Phase 1 constants)
- Replace all hardcoded routes → `ROUTES.ADMIN.*` (Phase 1 constants)
- Replace raw `<input>`/`<textarea>`/`<select>` → `FormField`/`Input`/`Select`/`Textarea` from `@/components`
- Replace raw Tailwind → `THEME_CONSTANTS.*` (Phase 2 design)
- Replace `alert()` → `useMessage()` toast
- Replace `confirm()` → `ConfirmDeleteModal`

### Task List — Phase 4

| #    | Task                                                                             | File(s)                                      | Status                                                                                   |
| ---- | -------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 4.1  | Extract Dashboard sub-components + apply design + use constants                  | `admin/dashboard/page.tsx` + new components  | ✅                                                                                       |
| 4.2  | Extract Site Settings forms + apply design + use constants                       | `admin/site/page.tsx` + new components       | ✅                                                                                       |
| 4.3  | Extract Users page sub-components + apply design + use constants + fix API paths | `admin/users/page.tsx` + new components      | ✅                                                                                       |
| 4.4  | Extract Carousel sub-components + apply design + use constants                   | `admin/carousel/page.tsx` + new components   | ✅                                                                                       |
| 4.5  | Extract Categories sub-components + apply design + use constants                 | `admin/categories/page.tsx` + new components | ✅                                                                                       |
| 4.6  | Extract FAQs sub-components + apply design + use constants                       | `admin/faqs/page.tsx` + new components       | ✅                                                                                       |
| 4.7  | Extract Sections sub-components + apply design + use constants                   | `admin/sections/page.tsx` + new components   | ✅                                                                                       |
| 4.8  | Extract Reviews sub-components + apply design + use constants                    | `admin/reviews/page.tsx` + new components    | ✅                                                                                       |
| 4.9  | Update `src/components/admin/index.ts` barrel with all new exports               | barrel                                       | ✅                                                                                       |
| 4.10 | Update `src/components/index.ts` root barrel                                     | barrel                                       | ✅ (wildcard export)                                                                     |
| 4.11 | Slim down all 7 admin page.tsx files to orchestration-only (≤150 lines each)     | all admin pages                              | ⚠️ Partial — UI extracted, CRUD handlers still inline (need custom hooks in future pass) |

**Phase 4 Line Count Summary:**
| Page | Before | After | Target |
|------|--------|-------|--------|
| Dashboard | 167 | 85 | ~80 ✅ |
| Site Settings | 261 | 107 | ~80 ✅ |
| Users | 337 | 192 | ~120 |
| Carousel | 310 | 241 | ~150 |
| Categories | 621 | 299 | ~200 |
| FAQs | 380 | 233 | ~150 |
| Sections | 330 | 240 | ~150 |
| Reviews | 450 | 283 | ~180 |

> **Note:** Remaining bulk in each page is CRUD handler logic (API calls, state, URL effects). Extracting these into custom hooks (e.g., `useCarouselCrud`, `useReviewModeration`) would bring pages to target. This can be addressed in a future optimization pass.

---

## Phase 5: User Page Decomposition ✅ COMPLETE

> Wire up the user components created in Phase 3 into actual user pages. Like Phase 4, each page is touched exactly once with design + constants + compliance all applied in a single pass.
> **Status**: All tasks complete. Settings: 616→210 lines (66% reduction). Profile: 195→63 lines (68% reduction). Wishlist: 65→61 lines (6% reduction). Orders refactored. Addresses refactored. Profile components deprecated. useAddresses hooks implemented. Barrels properly configured.

### Problem

- `user/settings/page.tsx` is **618 lines** — the most monolithic file in the codebase.
- Profile section components (`src/components/profile/`) exist but are **completely unused** — settings reimplements everything inline.
- Address form is duplicated between add and edit pages.
- Profile page has inline role-colored badge logic that duplicates `RoleBadge`.

### Per-Page Changes

#### User Settings (`618 lines → ~80 lines`)

Replace inline code with Phase 3 components:

- `EmailVerificationCard` → green/amber gradient card with icon
- `PhoneVerificationCard` → same pattern
- `ProfileInfoForm` → avatar + display name + phone
- `PasswordChangeForm` → with strength indicator
- `AccountInfoCard` → read-only metadata

#### User Profile → Vibrant Hero

- `ProfileHeader` → gradient hero banner, glass card overlay, `RoleBadge`
- `ProfileStatsGrid` → colored stat cards (`card.stat.*`)

#### User Addresses

- `addresses/add/page.tsx` → `<AddressForm onSubmit={handleCreate} />`
- `addresses/edit/[id]/page.tsx` → `<AddressForm initialData={address} onSubmit={handleUpdate} />`
- `addresses/page.tsx` → list of `<AddressCard />` or `<EmptyState />`

#### Existing Profile Components

`src/components/profile/` has `ProfileGeneralSection`, `ProfileSecuritySection`, `ProfilePhoneSection`, `ProfileAccountSection` — all unused. Options:

- **Deprecate**: Delete and use the new `user/settings/*` components
- **Redirect**: Make them thin wrappers around new components for backward compat

### Compliance Included Per Page

Same as Phase 4: fix strings → constants, routes → `ROUTES.*`, raw Tailwind → `THEME_CONSTANTS.*`, raw HTML → `@/components` in a single pass.

### Task List — Phase 5

| #    | Task                                                                                                                             | File(s)                                                                                                                                                                                                                                                                              | Status |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 5.1  | Refactor `settings/page.tsx` to compose Phase 3 components + use constants + apply design                                        | `user/settings/page.tsx` → 210 lines (from 616)                                                                                                                                                                                                                                      | ✅     |
| 5.2  | Refactor `profile/page.tsx` with `ProfileHeader` + `ProfileStatsGrid` + gradient hero + use constants                            | `user/profile/page.tsx` → 63 lines (from 195)                                                                                                                                                                                                                                        | ✅     |
| 5.3  | Refactor `addresses/add/page.tsx` → `<AddressForm onSubmit={...} />` + add `API_ENDPOINTS.ADDRESSES.*`                           | page.tsx → ~100 lines (from 247); added ADDRESSES API endpoints to constants                                                                                                                                                                                                         | ✅     |
| 5.4  | Refactor `addresses/edit/[id]/page.tsx` → `<AddressForm initialData={...} />` + use constants + useToast                         | page.tsx → 153 lines (from 301); uses AddressForm, API_ENDPOINTS, UI_LABELS, SUCCESS_MESSAGES, toasts                                                                                                                                                                                | ✅     |
| 5.5  | Refactor `addresses/page.tsx` with `AddressCard` + `EmptyState`                                                                  | page.tsx → 191 lines; uses AddressCard, EmptyState, useApiQuery, useApiMutation, ConfirmDeleteModal, full constants compliance                                                                                                                                                       | ✅     |
| 5.6  | Refactor `orders/page.tsx` + `orders/view/[id]/page.tsx` — use constants + design                                                | orders/page.tsx → 63 lines (from 65); orders/view/[id]/page.tsx → 191 lines (from 273); Added ORDER API endpoints; uses EmptyState, StatusBadge, UI_LABELS, THEME_CONSTANTS                                                                                                          | ✅     |
| 5.7  | Refactor `wishlist/page.tsx` — use constants + `EmptyState` + design                                                             | page.tsx → 61 lines (from 65); uses EmptyState, heart icon, UI_LABELS.USER.WISHLIST.\*, ROUTES.PUBLIC.PRODUCTS                                                                                                                                                                       | ✅     |
| 5.8  | Deprecate or redirect `src/components/profile/*.tsx`                                                                             | 4 files — Added @deprecated JSDoc to ProfileGeneralSection, ProfileSecuritySection, ProfilePhoneSection, ProfileAccountSection with references to replacement components                                                                                                             | ✅     |
| 5.9  | Rewrite `useAddresses` hooks properly using `useApiQuery`/`useApiMutation` + `API_ENDPOINTS.ADDRESSES.*` (stubs removed in 1.29) | `src/hooks/useAddresses.ts` — Implemented 6 hooks: useAddresses, useAddress, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress; exported from hooks barrel                                                                                                  | ✅     |
| 5.10 | Wire `useProfile` hook into profile page (currently unused — pages use `useAuth()` directly)                                     | **Deferred** — Profile page uses `useAuth()` from SessionContext which provides all needed display data (photoURL, displayName, email, role). `useProfile()` hook exists and could be used for explicit API refetching if needed in future, but current implementation is sufficient | ✅     |
| 5.11 | Update `src/components/user/index.ts` barrel                                                                                     | Already complete — Barrel properly exports addresses/_, settings/_, profile/\* via wildcards                                                                                                                                                                                         | ✅     |
| 5.12 | Update `src/components/index.ts` root barrel                                                                                     | Already complete — Root barrel exports user/\* via wildcard                                                                                                                                                                                                                          | ✅     |

---

## Phase 6: Homepage, Auth & Public Pages ✅ COMPLETE

> Fix all homepage sections, auth pages, FAQs, footer, and title bar in a single pass. Consolidates items that were previously scattered across 3 different phases.
> **Status**: Tasks 6.1-6.4, 6.6 COMPLETE. Homepage component navigation and formatPrice fixes complete.

### Homepage Problems

- **`window.location.href`** for navigation instead of `router.push` — causes full page reloads (~8 files)
- **`formatPrice`** duplicated in FeaturedProducts/FeaturedAuctions instead of `formatCurrency` from `@/utils`
- **Direct `fetch()` calls** in all homepage sections instead of `useApiQuery` (~12 files)
- **Barrel import violation**: `src/app/page.tsx` imports from `@/components/homepage` not `@/components`
- **Hardcoded static data**: trust indicators, site features, mock blog articles — should be constants or API
- **`NewsletterSection`** uses raw `<input>` instead of `Input` from `@/components`
- **`ProfilePhoneSection`** imports `API_ENDPOINTS` from `@/lib/api-client` instead of `@/constants`
- **Grid columns**: `xl:grid-cols-9` is too many — cap at `xl:grid-cols-5`
- **Missing `sm` breakpoint**: TrustIndicators and TopCategories jump from 2→4 cols at `md`
- **Carousel description** `hidden md:block` — mobile loses content entirely
- **FAQs sort bug** — operator precedence issue with `||` vs `/`

### Auth Page Problems

- ~25 hardcoded strings across 5 auth pages
- Some barrel import violations

### Footer / TitleBar / BottomNavbar Problems

- Footer dark mode gradient identical to page background (no differentiation)
- Footer hardcoded strings (`"Quick Links"`, `"About Us"`, etc.)
- TitleBar uses deprecated `bg-opacity-90` → should be `bg-white/90`
- TitleBar/BottomNavbar role badges use `text-[7px]`/`text-[8px]` — should use `THEME_CONSTANTS.badge.*`

### Task List — Phase 6

| #    | Task                                                                                                                                                       | File(s)                                                       | Status                                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1  | Replace `window.location.href` → `router.push` + `ROUTES.*` in all homepage sections                                                                       | ~8 homepage files                                             | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.2  | Remove duplicate `formatPrice` → use `formatCurrency` from `@/utils`                                                                                       | FeaturedProducts, FeaturedAuctions                            | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.3  | Replace homepage `fetch()` → `apiClient.get()`/`apiClient.post()` in `useApiQuery` queryFn, fix type params and data access                                | 10 homepage files                                             | ✅ (Replaced raw fetch() with apiClient.get() in 9 GET components; replaced raw fetch() POST with apiClient.post() in NewsletterSection; fixed incorrect type params e.g. `{ products: Product[] }` → `Product[]`; fixed data access patterns e.g. `data?.products` → `data`; fixed data shape bugs where envelope wasn't unwrapped; added SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED constant) |
| 6.4  | Fix `src/app/page.tsx` imports to use barrel `@/components`                                                                                                | `src/app/page.tsx`                                            | ✅ (already correct)                                                                                                                                                                                                                                                                                                                                                                        |
| 6.5  | Extract homepage static data into constants (`TRUST_INDICATORS`, `SITE_FEATURES`, `MOCK_BLOG_ARTICLES`)                                                    | `src/constants/homepage-data.ts` (new), 3 homepage components | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.6  | Replace raw `<input>` in `NewsletterSection` → `Input` from `@/components`                                                                                 | `NewsletterSection.tsx`                                       | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.7  | Fix `ProfilePhoneSection` import of `API_ENDPOINTS` → `@/constants`                                                                                        | `ProfilePhoneSection.tsx`                                     | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.8  | Fix product/auction grids — cap at `xl:grid-cols-5`, add proper card spacing                                                                               | FeaturedProductsSection, FeaturedAuctionsSection              | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.9  | Add `sm` breakpoint to `TrustIndicators` and `TopCategories` grids                                                                                         | TrustIndicatorsSection, TopCategoriesSection                  | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.10 | Fix carousel description on mobile — show truncated version instead of `hidden md:block`                                                                   | `HeroCarousel.tsx`                                            | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.11 | Fix FAQs sort bug + replace hardcoded strings → `UI_LABELS.FAQ.*`                                                                                          | `src/app/faqs/page.tsx`, `src/constants/ui.ts`                | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.12 | Apply `sectionBg.*` alternating backgrounds on homepage sections for visual breaks                                                                         | ~6 homepage components                                        | ✅                                                                                                                                                                                                                                                                                                                                                                                          |
| 6.13 | Fix all hardcoded strings in homepage sections → `UI_LABELS.HOMEPAGE.*`                                                                                    | ~10 homepage files                                            | ✅ (completed for 10 homepage files)                                                                                                                                                                                                                                                                                                                                                        |
| 6.14 | Fix all hardcoded strings across 5 auth pages → `UI_LABELS.AUTH.*`                                                                                         | 5 auth pages                                                  | ✅ (All 5 completed: login.tsx, register.tsx, verify-email.tsx, forgot-password.tsx, reset-password.tsx; Added comprehensive AUTH.REGISTER, AUTH.VERIFY_EMAIL, AUTH.FORGOT_PASSWORD, and AUTH.RESET_PASSWORD constants including placeholders, error messages, and labels)                                                                                                                  |
| 6.15 | Fix Footer dark mode + replace hardcoded strings → `UI_LABELS.FOOTER.*`                                                                                    | `Footer.tsx`                                                  | ✅ (Fixed footerBg gradient to support light/dark: from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900; Added BLOG, CONNECT constants; Replaced all hardcoded strings with UI_LABELS.FOOTER._; Fixed /terms and /privacy to use ROUTES.PUBLIC._)                                                                                                    |
| 6.16 | Fix TitleBar deprecated `bg-opacity-90` → `bg-white/90` + role badge → `THEME_CONSTANTS.badge.*`                                                           | `TitleBar.tsx`                                                | ✅ (Fixed bg-opacity-90 to bg-white/90 dark:bg-gray-900/90; Added badge.roleText.\* constants for compact role text colors with proper dark mode; Replaced inline role color logic with THEME_CONSTANTS.badge.roleText[role])                                                                                                                                                               |
| 6.17 | Fix BottomNavbar role badge `text-[7px]` → `THEME_CONSTANTS.badge.*` + replace hardcoded labels → `UI_LABELS.NAV.*`                                        | `BottomNavbar.tsx`                                            | ✅ (Fixed bg-opacity-95 to bg-white/95 dark:bg-gray-900/95; Used badge.roleText for role colors; Added NAV.SEARCH constant; Replaced all hardcoded labels: Home, Products, Auctions, Search, Profile with UI_LABELS.NAV.\*)                                                                                                                                                                 |
| 6.18 | Fix Sidebar hardcoded labels (Login, Register, Logout, My Profile, My Orders, etc.) → `UI_LABELS.NAV.*`/`UI_LABELS.AUTH.*` + hardcoded routes → `ROUTES.*` | `Sidebar.tsx`                                                 | ✅ (Replaced all hardcoded strings with UI_LABELS.NAV._; replaced all SITE_CONFIG route refs with ROUTES._; removed debug console.log useEffect; fixed role badge to use THEME_CONSTANTS.badge.roleText; added ROUTES.SELLER.DASHBOARD and 8 new UI_LABELS.NAV constants)                                                                                                                   |
| 6.19 | Wire auth pages to use `useLogin`, `useRegister`, `useVerifyEmail`, `useForgotPassword` hooks instead of calling Firebase SDK directly                     | 5 auth pages in `src/app/auth/`                               | ✅ (Rewrote useAuth.ts hooks to match server-side API approach; added useGoogleLogin/useAppleLogin hooks; wired login, register, forgot-password, verify-email pages to use hooks; reset-password already used hook)                                                                                                                                                                        |
| 6.20 | Mount `<ToastProvider>` in root `layout.tsx` (depends on 3.21)                                                                                             | `src/app/layout.tsx`                                          | ✅ (already mounted)                                                                                                                                                                                                                                                                                                                                                                        |

---

## Phase 7: Production Code Quality ✅ COMPLETE

> Sweep remaining production code violations in files NOT already rewritten by Phases 4-6. Many violations will have been incidentally fixed during decomposition — this phase catches whatever remains.

### 7A. Remaining Code Violations

| Pattern                             | Original Count | Likely Remaining After Phase 4-6          | Fix                                            |
| ----------------------------------- | -------------- | ----------------------------------------- | ---------------------------------------------- |
| `throw new Error(...)`              | ~21            | ~10 (hooks, lib/firebase)                 | Replace with error classes from `@/lib/errors` |
| `alert(...)`                        | ~14            | ~3 (any not in admin/user pages)          | Replace with `useMessage()` toast              |
| `confirm(...)`                      | ~9             | ~2 (any not in admin pages)               | Replace with `ConfirmDeleteModal`              |
| `console.log(...)`                  | ~18            | ~12 (repos, hooks, lib, API routes)       | Replace with `logger` / `logServerInfo`        |
| Direct Firestore in API routes      | ~30            | ~30 (API routes not touched by Phase 4-6) | Route through repository methods               |
| Raw Tailwind (no `THEME_CONSTANTS`) | ~80            | ~10 (any files missed by Phase 4-6)       | Replace with `THEME_CONSTANTS.*`               |

### 7B. Potentially Dead Code

Functions exported but likely never used (verify with `list_code_usages` before removing):

| Category              | Functions                                                                           | File                    |
| --------------------- | ----------------------------------------------------------------------------------- | ----------------------- |
| DOM animations        | `animate`, `stagger`, `fadeIn`, `fadeOut`, `slide`                                  | `animation.helper.ts`   |
| Unused style helpers  | `responsive`, `variant`, `toggleClass`, `sizeClass`                                 | `style.helper.ts`       |
| Unused color helpers  | `lightenColor`, `darkenColor`, `randomColor`, `generateGradient`                    | `color.helper.ts`       |
| Unused array helpers  | `flatten`, `randomItem`, `shuffle`, `moveItem`, `difference`, `intersection`        | `array.helper.ts`       |
| Unused object helpers | `invertObject`, `setNestedValue`, `getNestedValue`                                  | `object.helper.ts`      |
| Overlapping sort      | `multiSort`, `sortByNumber`, `sortByString`, `sortByDate`, `toggleSortOrder`        | `sorting.helper.ts`     |
| Unused string utils   | `toCamelCase`, `toPascalCase`, `toSnakeCase`, `toKebabCase`, `reverse`, `wordCount` | `string.formatter.ts`   |
| Unused converters     | `csvToArray`, `arrayToCsv`, `unflattenObject`, `flattenObject`                      | `type.converter.ts`     |
| Unused validators     | `isValidCreditCard`, `isValidPostalCode`, `isAlphabetic`, `isAlphanumeric`          | `input.validator.ts`    |
| Placeholder code      | `generateBarcodeFromId`, `generateQRCodeData`                                       | `id-generators.ts`      |
| Stubbed middleware    | `withMiddleware` (entire file is TODO)                                              | `lib/api/middleware.ts` |

**Action**: Mark with `@deprecated` JSDoc tags. Do NOT delete — they may be used in future features. Remove from barrel exports if truly unused.

### 7C. Technical Debt Markers

**50+ TODO/FIXME markers** found. Key areas:

- `src/types/api.ts` — ~48 TODO comments (Phase 2 feature wishlist)
- `src/lib/validation/schemas.ts` — ~5 TODO markers
- `src/lib/api/middleware.ts` — 452 lines of almost entirely stubbed code

**Action**: Leave TODOs in place but track in `docs/TECH_DEBT.md` for visibility.

### Task List — Phase 7

#### Phase 7A — COMPLETE ✅

| #    | Task                                                                                                                                               | Scope                                                                                                                         | Status  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- |
| 7.1  | Replace all remaining `throw new Error(...)` with error classes (`AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ApiError`)         | `useRBAC.ts`, `auth-server.ts`, `auth-helpers.ts`, `category-metrics.ts`                                                      | ✅ Done |
| 7.2  | Replace all remaining `alert()` → `useToast()` toast                                                                                               | `categories/page.tsx`, `site/page.tsx`, `users/page.tsx`, `sections/page.tsx`, `reviews/page.tsx`, `AdminSessionsManager.tsx` | ✅ Done |
| 7.3  | Replace hardcoded `confirm()` strings with `UI_LABELS` constants                                                                                   | `users/page.tsx` — confirm() calls now use `UI_LABELS.ADMIN.USERS.*`                                                          | ✅ Done |
| 7.9  | Fix `useRevokeSession`/`useRevokeUserSessions`/`useRevokeMySession`/`useAdminStats` — raw `fetch()` → `apiClient`                                  | `src/hooks/useSessions.ts`, `src/hooks/useAdminStats.ts`                                                                      | ✅ Done |
| 7.10 | Remove dead `subscribeToUserProfile` + `firestoreUnsubscribeRef` from SessionContext (~45 lines of no-op code removed)                             | `src/contexts/SessionContext.tsx`                                                                                             | ✅ Done |
| 7.11 | Extract cookie parsing to `parseCookies`/`getCookie`/`hasCookie`/`deleteCookie` utility; refactored SessionContext to use it                       | `src/utils/converters/cookie.converter.ts` (new), `src/contexts/SessionContext.tsx`                                           | ✅ Done |
| 7.12 | Remove dead `useRequireRole`/`useCurrentUser` from ProtectedRoute — duplicated by `useHasRole`/`useRoleChecks` in `useRBAC.ts` (0 external usages) | `src/components/auth/ProtectedRoute.tsx`                                                                                      | ✅ Done |
| 7.13 | Remove unused `onLongPress` support from `useGesture` (only consumer ImageGallery doesn't use it); reduced from 367→298 lines                      | `src/hooks/useGesture.ts`                                                                                                     | ✅ Done |

#### Phase 7B — COMPLETE ✅

| #   | Task                                                                      | Scope                                                                        | Status                                                                                                                                                        |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.4 | Replace all `console.log()` → `logger` / `serverLogger`                   | ~40 files (API routes, repositories, lib, hooks, contexts, monitoring)       | ✅ Done — serverLogger for server-side (API routes, repos, helpers), logger from @/classes for client-side (hooks, contexts, monitoring, StorageManager)      |
| 7.5 | Route all API direct Firestore access through repositories                | 4 API routes (verify-phone, delete-account, admin/dashboard, admin/sessions) | ✅ Done — Added countActive/countDisabled/countNewSince to userRepo, deleteBySeller to productRepo, deleteByUser to orderRepo, findAllForAdmin to sessionRepo |
| 7.6 | Replace remaining raw Tailwind with `THEME_CONSTANTS` in any missed files | ~17 files                                                                    | ✅ Done — Themed bg/text/border patterns, space-y-4, max-w-2xl/xl all replaced with THEME_CONSTANTS equivalents                                               |
| 7.7 | Add `@deprecated` tags to potentially dead functions                      | 40 functions across 11 files                                                 | ✅ Done — animation, style, color, array, object, sorting helpers; string formatters, type converters, input validators, id generators, middleware            |
| 7.8 | Create `docs/TECH_DEBT.md` cataloging all TODO/FIXME markers              | new file                                                                     | ✅ Done — ~203 markers cataloged across 30 files, organized by priority (high/medium/low)                                                                     |

---

## Phase 8: Documentation & Instructions

> Update all documentation to reflect the refactored codebase. This is the final phase because it documents the finished state.
> **Status**: All 10 tasks completed.

### Updates to `.github/copilot-instructions.md`

#### New Components to Add to Rule 6

```
SectionTabs, StatusBadge, RoleBadge, EmptyState, ResponsiveView,
AdminPageHeader, AdminFilterBar, DrawerFormFooter,
AddressForm, AddressCard, ProfileHeader, ProfileStatsGrid,
EmailVerificationCard, PhoneVerificationCard, ProfileInfoForm,
PasswordChangeForm, AccountInfoCard
```

#### New Hooks to Add to Rule 5

| Need                | Hook                   |
| ------------------- | ---------------------- |
| Viewport breakpoint | `useBreakpoint()`      |
| Media query         | `useMediaQuery(query)` |
| RBAC checking       | `useRBAC()`            |

#### New Constants to Document

| Need                   | Constant                                  |
| ---------------------- | ----------------------------------------- |
| Admin nav tabs         | `ADMIN_TAB_ITEMS` from `@/constants`      |
| User nav tabs          | `USER_TAB_ITEMS` from `@/constants`       |
| Role hierarchy         | `ROLE_HIERARCHY` from `@/constants`       |
| All admin labels       | `UI_LABELS.ADMIN.*` from `@/constants`    |
| All user labels        | `UI_LABELS.USER.*` from `@/constants`     |
| Homepage labels        | `UI_LABELS.HOMEPAGE.*` from `@/constants` |
| Section backgrounds    | `THEME_CONSTANTS.sectionBg.*`             |
| Stat card variants     | `THEME_CONSTANTS.card.stat.*`             |
| Gradient card variants | `THEME_CONSTANTS.card.gradient.*`         |
| Page header patterns   | `THEME_CONSTANTS.pageHeader.*`            |

#### New Rule 14: Pages Are Thin Orchestration Layers

> Every `page.tsx` should be as simple as possible — composed entirely of imported components.
> A page should NOT contain:
>
> - Inline form JSX (extract to a Form component)
> - Inline table column definitions (extract to a Columns config)
> - Inline drawer/modal bodies (extract to a Drawer/Modal component)
> - Complex state logic (extract to a custom hook)
> - More than ~100 lines of JSX
>
> If a page exceeds ~150 lines, it needs decomposition.

#### New Rule 15: No `alert()` / `confirm()` / `prompt()`

> **NEVER** use browser native dialogs.
>
> - Instead of `alert(msg)` → use `useMessage()` hook (toast notification)
> - Instead of `confirm(msg)` → use `ConfirmDeleteModal` from `@/components`
> - Error feedback → use `Alert` component or `useMessage()` error toast

#### New Rule 16: Use Structured Logging

> **NEVER** use `console.log()` in production code.
>
> - Client-side → use `logger` from `@/classes`
> - Server-side (API routes) → use `logServerInfo`/`logServerError` from `@/helpers`
> - Component-level debugging → remove before commit

#### Update to Rule 8: Repository Pattern

Add note: API routes in `src/app/api/**` MUST also use repositories for all Firestore operations. Direct `db.collection().doc().get()` calls in API routes violate this rule.

#### New `THEME_CONSTANTS` Entries for Rule 3 Table

| Instead of writing...                               | Use                                        |
| --------------------------------------------------- | ------------------------------------------ |
| `"bg-gradient-to-br from-indigo-50..."`             | `THEME_CONSTANTS.card.gradient.indigo`     |
| `"border-l-4 border-l-indigo-500..."`               | `THEME_CONSTANTS.card.stat.indigo`         |
| `"bg-emerald-50 text-emerald-700..."` (badge)       | `THEME_CONSTANTS.badge.active`             |
| `"bg-purple-50 text-purple-700..."` (admin badge)   | `THEME_CONSTANTS.badge.admin`              |
| `"pb-8 mb-8 bg-gradient-to-r..."` (page header)     | `THEME_CONSTANTS.pageHeader.adminGradient` |
| `"bg-gray-50/50 dark:bg-gray-800/20"`               | `THEME_CONSTANTS.sectionBg.subtle`         |
| Loose `rounded-lg border...focus:ring-2...` (input) | `THEME_CONSTANTS.input.base`               |

### Task List — Phase 8

| #    | Task                                                                  | File(s)                           |
| ---- | --------------------------------------------------------------------- | --------------------------------- | --- |
| 8.1  | Add new components to Rule 6 table                                    | `.github/copilot-instructions.md` | ✅  |
| 8.2  | Add `useBreakpoint`, `useMediaQuery`, `useRBAC` to Rule 5 hooks table | `.github/copilot-instructions.md` | ✅  |
| 8.3  | Add new constants to import tables                                    | `.github/copilot-instructions.md` | ✅  |
| 8.4  | Add Rule 16 (pages are thin orchestration)                            | `.github/copilot-instructions.md` | ✅  |
| 8.5  | Add Rule 17 (no browser native dialogs)                               | `.github/copilot-instructions.md` | ✅  |
| 8.6  | Add Rule 18 (structured logging)                                      | `.github/copilot-instructions.md` | ✅  |
| 8.7  | Update Rule 8 to include API routes + bidRepository                   | `.github/copilot-instructions.md` | ✅  |
| 8.8  | Add new `THEME_CONSTANTS` entries to Rule 3 table                     | `.github/copilot-instructions.md` | ✅  |
| 8.9  | Update `docs/GUIDE.md` with new component/hook/constant inventories   | `docs/GUIDE.md`                   | ✅  |
| 8.10 | Update `docs/CHANGELOG.md` with all refactor changes                  | `docs/CHANGELOG.md`               | ✅  |

---

## Constants & Styles Reference

### THEME_CONSTANTS Structure (final state after refactor)

```
THEME_CONSTANTS
├── spacing
│   ├── stack, stackSmall, inline
│   ├── section, pageY, sectionGap, cardPadding   ← NEW
│   ├── padding: { xs, sm, md, lg, xl, 2xl }      ← EXPANDED
│   └── gap: { xs, sm, md, lg, xl }                ← EXPANDED
├── typography
│   ├── h1, h2, h3, h4                             ← MODERATED scaling
│   ├── pageTitle, pageSubtitle                     ← NEW
│   ├── sectionTitle, sectionSubtitle               ← NEW
│   ├── cardTitle, cardBody                         ← NEW
│   ├── label, caption, overline                    ← NEW
│   └── body, small, tiny, link                     (existing)
├── container: { xl, 2xl, ultrawide, 4k }
├── borderRadius: { sm, md, lg, xl, 2xl, full }
├── themed                                          ← EXPANDED
│   ├── bgPrimary, bgSecondary, bgTertiary, bgElevated  ← NEW tertiary/elevated
│   ├── textPrimary, textSecondary, textMuted             ← NEW muted
│   ├── border, borderSubtle, divider                     ← NEW subtle/divider
│   └── hoverCard, activeRow                              ← NEW tinted states
├── accent                                          ← NEW
│   ├── primary, primarySoft
│   ├── secondary, secondarySoft
│   ├── warm, warmSoft
│   ├── success, successSoft, danger, dangerSoft
│   └── warning, warningSoft, info, infoSoft
├── badge                                           ← NEW
│   ├── active, inactive, pending, danger, info     (status)
│   └── admin, moderator, seller, user              (role)
├── card                                            ← EXPANDED
│   ├── base, elevated, interactive, glass
│   ├── gradient: { indigo, teal, amber, rose }
│   └── stat: { indigo, teal, amber, rose, emerald }
├── input                                           ← NEW
│   ├── base, error, success, disabled
├── pageHeader                                      ← NEW
│   ├── wrapper, withGradient, adminGradient
├── sectionBg                                       ← NEW
│   ├── subtle, warm, cool, mesh
├── animation                                       ← NEW
│   ├── fadeIn, slideUp, slideDown, scaleIn, stagger
├── patterns: { adminInput, adminSelect }           (existing, may deprecate)
└── iconSize: { xs, sm, md, lg, xl }
```

### New Constants Added in Phase 1

| Constant Group         | Location         | Purpose                                             |
| ---------------------- | ---------------- | --------------------------------------------------- |
| `ROLE_HIERARCHY`       | `rbac.ts`        | Single canonical role hierarchy (was duplicated 3x) |
| `UI_LABELS.ADMIN.*`    | `ui.ts`          | All admin page strings (~120)                       |
| `UI_LABELS.USER.*`     | `ui.ts`          | All user page strings (~50)                         |
| `UI_LABELS.HOMEPAGE.*` | `ui.ts`          | All homepage section strings (~80)                  |
| `UI_LABELS.FAQS.*`     | `ui.ts`          | FAQ page strings (~15)                              |
| `UI_LABELS.FOOTER.*`   | `ui.ts`          | Footer link labels and section titles               |
| `ADMIN_TAB_ITEMS`      | `navigation.tsx` | Admin section navigation tabs                       |
| `USER_TAB_ITEMS`       | `navigation.tsx` | User section navigation tabs                        |

### Import Reference (Rule 1 Compliance)

```tsx
// Components — UI
import {
  SectionTabs,
  StatusBadge,
  RoleBadge,
  EmptyState,
  Button,
  Card,
  Badge,
} from "@/components";
import {
  FormField,
  Input,
  Select,
  Textarea,
  Checkbox,
  Toggle,
} from "@/components";
import {
  Modal,
  ConfirmDeleteModal,
  Alert,
  Toast,
  SideDrawer,
} from "@/components";
import { ResponsiveView, Search, BackToTop } from "@/components";

// Components — Admin
import {
  AdminPageHeader,
  AdminFilterBar,
  DrawerFormFooter,
  DataTable,
} from "@/components";

// Components — User
import {
  AddressForm,
  AddressCard,
  ProfileHeader,
  ProfileStatsGrid,
} from "@/components";
import {
  EmailVerificationCard,
  PhoneVerificationCard,
  ProfileInfoForm,
} from "@/components";
import { PasswordChangeForm, AccountInfoCard } from "@/components";

// Constants
import {
  THEME_CONSTANTS,
  UI_LABELS,
  UI_PLACEHOLDERS,
  ROUTES,
  API_ENDPOINTS,
} from "@/constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { ADMIN_TAB_ITEMS, USER_TAB_ITEMS, ROLE_HIERARCHY } from "@/constants";

// Hooks
import {
  useBreakpoint,
  useMediaQuery,
  useAuth,
  useMessage,
  useProfile,
} from "@/hooks";
import { useApiQuery, useApiMutation, useForm, useFormState } from "@/hooks";

// Utils
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  truncate,
  slugify,
} from "@/utils";
import { isValidEmail, isValidPhone, meetsPasswordRequirements } from "@/utils";

// Helpers
import { cn, classNames, groupBy, sortBy, pick, omit } from "@/helpers";
import { hasRole, hasAnyRole, generateInitials } from "@/helpers";

// Errors
import {
  NotFoundError,
  AuthenticationError,
  ValidationError,
  DatabaseError,
} from "@/lib/errors";

// Classes
import { logger, cacheManager, storageManager, eventBus } from "@/classes";

// Repositories (server-side only)
import {
  userRepository,
  productRepository,
  orderRepository,
} from "@/repositories";
```

---

## File Inventory

### New Files to Create

| File                                                       | Phase | Type          |
| ---------------------------------------------------------- | ----- | ------------- |
| `src/repositories/bid.repository.ts`                       | 1     | Repository    |
| `src/constants/rbac.ts`                                    | 1     | Constants     |
| `src/hooks/useMediaQuery.ts`                               | 3     | Hook          |
| `src/hooks/useBreakpoint.ts`                               | 3     | Hook          |
| `src/components/utility/ResponsiveView.tsx`                | 3     | Component     |
| `src/components/ui/SectionTabs.tsx`                        | 3     | Component     |
| `src/components/ui/StatusBadge.tsx`                        | 3     | Component     |
| `src/components/ui/RoleBadge.tsx`                          | 3     | Component     |
| `src/components/ui/EmptyState.tsx`                         | 3     | Component     |
| `src/components/ui/Toast.tsx`                              | 3     | Component     |
| `src/components/providers/ToastProvider.tsx`               | 3     | Provider      |
| `src/components/admin/AdminPageHeader.tsx`                 | 3     | Component     |
| `src/components/admin/AdminFilterBar.tsx`                  | 3     | Component     |
| `src/components/admin/DrawerFormFooter.tsx`                | 3     | Component     |
| `src/components/user/addresses/AddressForm.tsx`            | 3     | Component     |
| `src/components/user/addresses/AddressCard.tsx`            | 3     | Component     |
| `src/components/user/settings/EmailVerificationCard.tsx`   | 3     | Component     |
| `src/components/user/settings/PhoneVerificationCard.tsx`   | 3     | Component     |
| `src/components/user/settings/ProfileInfoForm.tsx`         | 3     | Component     |
| `src/components/user/settings/PasswordChangeForm.tsx`      | 3     | Component     |
| `src/components/user/settings/AccountInfoCard.tsx`         | 3     | Component     |
| `src/components/user/profile/ProfileHeader.tsx`            | 3     | Component     |
| `src/components/user/profile/ProfileStatsGrid.tsx`         | 3     | Component     |
| `src/app/user/layout.tsx`                                  | 3     | Layout        |
| `src/components/admin/dashboard/QuickActionsGrid.tsx`      | 4     | Component     |
| `src/components/admin/dashboard/RecentActivityCard.tsx`    | 4     | Component     |
| `src/components/admin/site/SiteBasicInfoForm.tsx`          | 4     | Component     |
| `src/components/admin/site/SiteContactForm.tsx`            | 4     | Component     |
| `src/components/admin/site/SiteSocialLinksForm.tsx`        | 4     | Component     |
| `src/components/admin/users/UserFilters.tsx`               | 4     | Component     |
| `src/components/admin/users/UserDetailDrawer.tsx`          | 4     | Component     |
| `src/components/admin/users/UserTableColumns.tsx`          | 4     | Component     |
| `src/components/admin/carousel/CarouselSlideForm.tsx`      | 4     | Component     |
| `src/components/admin/carousel/CarouselTableColumns.tsx`   | 4     | Component     |
| `src/components/admin/categories/CategoryForm.tsx`         | 4     | Component     |
| `src/components/admin/categories/CategoryTableColumns.tsx` | 4     | Component     |
| `src/components/admin/categories/CategoryViewToggle.tsx`   | 4     | Component     |
| `src/components/admin/faqs/FAQForm.tsx`                    | 4     | Component     |
| `src/components/admin/faqs/FAQTableColumns.tsx`            | 4     | Component     |
| `src/components/admin/sections/SectionForm.tsx`            | 4     | Component     |
| `src/components/admin/sections/SectionTableColumns.tsx`    | 4     | Component     |
| `src/components/admin/reviews/ReviewFilters.tsx`           | 4     | Component     |
| `src/components/admin/reviews/ReviewDetailView.tsx`        | 4     | Component     |
| `src/components/admin/reviews/ReviewTableColumns.tsx`      | 4     | Component     |
| `docs/TECH_DEBT.md`                                        | 7     | Documentation |

### Existing Files to Modify

| File                                       | Phase | Change                                                                                                                  |
| ------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/constants/routes.ts`                  | 1     | Remove phantom routes, add ~19 missing routes (PUBLIC.\*, USER.CART, DEMO.SEED), fix PROTECTED_ROUTES                   |
| `src/constants/site.ts`                    | 1     | Rewrite `SITE_CONFIG.nav` + `SITE_CONFIG.account` to reference `ROUTES.*` instead of duplicating strings                |
| `src/constants/api-endpoints.ts`           | 1     | Remove dead endpoints, add missing ones                                                                                 |
| `src/db/schema/reviews.ts`                 | 1     | Add `featured` field                                                                                                    |
| `firestore.indexes.json`                   | 1     | Fix categories `featured` → `isFeatured`                                                                                |
| 4 repository files                         | 1     | Fix hardcoded collection names                                                                                          |
| `src/repositories/session.repository.ts`   | 1     | Fix silent error swallowing                                                                                             |
| `src/repositories/coupons.repository.ts`   | 1     | Fix create() param type                                                                                                 |
| `src/lib/api-response.ts` + 2 duplicators  | 1     | Consolidate responseHelpers                                                                                             |
| `src/helpers/auth/auth.helper.ts`          | 1     | Remove duplicates, delegate to canonical sources                                                                        |
| `src/constants/ui.ts`                      | 1     | Add ~270 UI_LABELS constants                                                                                            |
| `src/constants/messages.ts`                | 1     | Add missing ERROR_MESSAGES, SUCCESS_MESSAGES                                                                            |
| `src/constants/index.ts`                   | 1     | Re-export new constants                                                                                                 |
| `src/hooks/index.ts`                       | 1,3   | Export useRBAC, useMediaQuery, useBreakpoint; remove dead hook exports (useFormState, useLongPress, useAddresses stubs) |
| `src/hooks/useFormState.ts`                | 1     | **Delete** — consolidated into `useForm`                                                                                |
| `src/hooks/useLongPress.ts`                | 1     | **Delete** — covered by `useGesture.onLongPress`                                                                        |
| `src/hooks/useAddresses.ts`                | 1,5   | Phase 1: remove stubs from barrel; Phase 5: rewrite properly with `useApiQuery`/`useApiMutation`                        |
| `src/hooks/useAdminStats.ts`               | 1     | Refactor to use `useApiQuery(API_ENDPOINTS.ADMIN.DASHBOARD)`                                                            |
| `src/hooks/useSessions.ts`                 | 1,7   | Phase 1: mark dead hooks `@deprecated`; Phase 7: fix `fetch()` → `apiClient`                                            |
| `tailwind.config.js`                       | 2     | Shift primary to indigo, secondary to teal, accent to amber                                                             |
| `src/constants/theme.ts`                   | 2     | Full expansion: accent, badge, card, input, pageHeader, sectionBg, animation, spacing, typography, themed               |
| `src/components/ui/Button.tsx`             | 2     | Harmonize gradient variants                                                                                             |
| `src/components/ui/Card.tsx`               | 2     | Add gradient, glass, stat variants                                                                                      |
| `src/components/ui/Badge.tsx`              | 2     | Add ring borders, role variants                                                                                         |
| `src/components/admin/DataTable.tsx`       | 2     | Add pagination, striped rows, mobile card view                                                                          |
| `src/components/ui/SideDrawer.tsx`         | 2     | Wider desktop, gradient header                                                                                          |
| `src/components/LayoutClient.tsx`          | 2     | Increase padding, mesh background                                                                                       |
| `src/constants/navigation.tsx`             | 3     | Add ADMIN_TAB_ITEMS, USER_TAB_ITEMS                                                                                     |
| `src/components/admin/AdminTabs.tsx`       | 3     | Thin wrapper around SectionTabs                                                                                         |
| `src/components/user/UserTabs.tsx`         | 3     | Thin wrapper around SectionTabs                                                                                         |
| `src/app/admin/layout.tsx`                 | 3     | Tabs positioning                                                                                                        |
| `src/components/ui/index.ts`               | 3     | Export SectionTabs, StatusBadge, RoleBadge, EmptyState                                                                  |
| `src/components/admin/index.ts`            | 3,4   | Export all new admin components                                                                                         |
| `src/components/user/index.ts`             | 3,5   | Export all new user components                                                                                          |
| `src/components/utility/index.ts`          | 3     | Export ResponsiveView                                                                                                   |
| `src/components/index.ts`                  | 3,4,5 | Re-export everything                                                                                                    |
| All 7 admin page.tsx files                 | 4     | Decompose + design + compliance (single touch)                                                                          |
| 7 user page.tsx files                      | 5     | Decompose + design + compliance (single touch)                                                                          |
| ~10 homepage component files               | 6     | Fix router, imports, fetch→hooks, grids, strings, sectionBg                                                             |
| 5 auth page.tsx files                      | 6     | Fix hardcoded strings                                                                                                   |
| `src/app/faqs/page.tsx`                    | 6     | Fix sort bug + hardcoded strings                                                                                        |
| `src/components/layout/Footer.tsx`         | 6     | Dark mode fix + hardcoded strings (single touch)                                                                        |
| `src/components/layout/TitleBar.tsx`       | 6     | Fix deprecated pattern + role badges (single touch)                                                                     |
| `src/components/layout/BottomNavbar.tsx`   | 6     | Fix role badge sizing + replace hardcoded labels (single touch)                                                         |
| `src/components/layout/Sidebar.tsx`        | 6     | Replace hardcoded labels → `UI_LABELS.NAV.*`/`UI_LABELS.AUTH.*`, routes → `ROUTES.*`                                    |
| 5 auth page.tsx files                      | 6     | Wire to `useLogin`/`useRegister`/etc. hooks + fix hardcoded strings                                                     |
| `src/app/layout.tsx`                       | 6     | Mount `<ToastProvider>`                                                                                                 |
| ~10 remaining files with `throw new Error` | 7     | Use error classes                                                                                                       |
| ~12 files with `console.log`               | 7     | Use logger                                                                                                              |
| ~8 API routes with direct Firestore        | 7     | Use repositories                                                                                                        |
| `src/contexts/SessionContext.tsx`          | 7     | Remove dead `subscribeToUserProfile` (~100 lines), extract cookie parsing to utility                                    |
| `src/components/auth/ProtectedRoute.tsx`   | 7     | Consolidate inline `useRequireRole` with `useRBAC.useRequireRole`                                                       |
| `src/hooks/useGesture.ts`                  | 7     | Simplify (367 lines, only 1 consumer), remove unused `onLongPress` callback                                             |
| `.github/copilot-instructions.md`          | 8     | Add Rules 14-16, update tables                                                                                          |
| `docs/GUIDE.md`                            | 8     | Update full inventory                                                                                                   |
| `docs/CHANGELOG.md`                        | 8     | Document all changes                                                                                                    |

### Files to Deprecate

| File                                                | Reason                                                 | Action                    |
| --------------------------------------------------- | ------------------------------------------------------ | ------------------------- |
| `src/components/profile/ProfileGeneralSection.tsx`  | Replaced by `user/settings/ProfileInfoForm.tsx`        | Keep as wrapper or remove |
| `src/components/profile/ProfileSecuritySection.tsx` | Replaced by `user/settings/PasswordChangeForm.tsx`     | Keep as wrapper or remove |
| `src/components/profile/ProfilePhoneSection.tsx`    | Replaced by `user/settings/PhoneVerificationCard.tsx`  | Keep as wrapper or remove |
| `src/components/profile/ProfileAccountSection.tsx`  | Replaced by `user/settings/AccountInfoCard.tsx`        | Keep as wrapper or remove |
| `src/app/admin/site/page-old.tsx`                   | Old version of site settings                           | Delete in Phase 1         |
| `src/lib/api/middleware.ts`                         | 452 lines almost entirely stubbed TODO                 | Mark as future/unstable   |
| `src/hooks/useFormState.ts`                         | Duplicates `useForm`, zero consumers                   | Delete in Phase 1         |
| `src/hooks/useLongPress.ts`                         | Duplicated by `useGesture.onLongPress`, zero consumers | Delete in Phase 1         |

---

## Execution Order & Dependencies

```
Phase 1 (Foundation) → Phase 2 (Design System) → Phase 3 (Shared Components) → Phase 4 (Admin Decomp) → Phase 5 (User Decomp) → Phase 6 (Homepage/Auth) → Phase 7 (Quality) → Phase 8 (Docs)
```

### Dependency Graph

```
Phase 1: Constants + Data Layer + Code Dedup
   ↓ (constants exist for everything)
Phase 2: THEME_CONSTANTS + Base Component Upgrades
   ↓ (design system ready)
Phase 3: Shared Components (built WITH design system)
   ↓ (building blocks ready)
Phase 4: Admin Decomposition ←→ Phase 5: User Decomposition (can parallelize)
   ↓ (pages decomposed)
Phase 6: Homepage / Auth / Public (independent of 4-5)
   ↓ (all UI complete)
Phase 7: Production Quality Sweep
   ↓ (codebase clean)
Phase 8: Documentation
```

### Parallelism Opportunities

- **Phase 4 + Phase 5** can run in parallel (different page groups, no overlapping files)
- **Phase 6** can start alongside Phase 5 (different file groups)
- **Phase 7** must wait until Phases 4-6 complete (catches leftovers)

### Estimated Scope

| Metric                   | Count |
| ------------------------ | ----- |
| New files                | ~45   |
| Modified files           | ~75   |
| Deprecated/deleted files | ~8    |
| Total tasks              | ~118  |

---

## Key Principle: Pages Are Just Glue

After refactoring, every `page.tsx` should look roughly like this:

```tsx
"use client";

import {
  AdminPageHeader,
  DataTable,
  SideDrawer,
  DrawerFormFooter,
} from "@/components";
import { CarouselSlideForm, CarouselTableColumns } from "@/components";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { UI_LABELS, API_ENDPOINTS } from "@/constants";

export default function CarouselPage() {
  const { data, loading, error, refetch } = useApiQuery(
    API_ENDPOINTS.CAROUSEL.LIST,
  );
  const { mutate: save, loading: saving } = useApiMutation(
    API_ENDPOINTS.CAROUSEL.CREATE,
  );
  const { showSuccess, showError } = useMessage();
  // ... minimal drawer state ...

  return (
    <>
      <AdminPageHeader
        title={UI_LABELS.ADMIN.CAROUSEL.TITLE}
        subtitle={UI_LABELS.ADMIN.CAROUSEL.SUBTITLE}
        action={{ label: UI_LABELS.ACTIONS.CREATE, onClick: openDrawer }}
      />
      <DataTable columns={CarouselTableColumns} data={data} loading={loading} />
      <SideDrawer open={drawerOpen} onClose={closeDrawer}>
        <CarouselSlideForm data={editItem} onSubmit={handleSave} />
        <DrawerFormFooter
          onCancel={closeDrawer}
          onSave={handleSave}
          saving={saving}
        />
      </SideDrawer>
    </>
  );
}
```

No inline forms. No inline columns. No inline drawer bodies. No hardcoded strings. No raw Tailwind for standard patterns. Just composition.

---

## Validation Checklist Per Phase

After each phase, run:

```bash
# 1. TypeScript check on changed files
npx tsc --noEmit src/path/to/changed-file.tsx

# 2. Full build
npm run build

# 3. Visual check — open admin and user pages in browser
# 4. Test mobile view using browser dev tools (375px width)
# 5. Test desktop view (1440px width)
# 6. Verify all tab navigation works (admin + user)
# 7. Run tests
npm test
```
