# Technical Debt Inventory

> **Created**: February 10, 2026
> **Purpose**: Catalog all TODO/FIXME markers and known technical debt in the codebase for visibility and prioritization.
> **Total markers**: ~179 across 29 files (24 resolved — middleware.ts)
> **Last audit**: February 10, 2026 — Copilot Instructions compliance audit

---

## Compliance Audit — February 10, 2026 ✅ COMPLETE

Full codebase audit against all 18 Copilot Instruction rules. Violations found and fixed:

### Rule 1: Barrel Imports — 26 violations fixed

| File                                      | Old Import                                | Fixed To         |
| ----------------------------------------- | ----------------------------------------- | ---------------- |
| 6 admin pages                             | `@/components/feedback`                   | `@/components`   |
| `useRBAC.ts`, `rbac.ts`                   | `@/helpers/auth`                          | `@/helpers`      |
| `cache-middleware.ts`, `cache-metrics.ts` | `@/classes/CacheManager`                  | `@/classes`      |
| `error-tracking.ts`                       | `@/classes/Logger`                        | `@/classes`      |
| `faq-variables.ts`                        | `@/repositories/site-settings.repository` | `@/repositories` |
| 12 schema/repo files                      | `@/utils/id-generators`                   | `@/utils`        |

### Rule 14: Hardcoded Routes — 1 violation fixed

| File                     | Hardcoded       | Fixed To            |
| ------------------------ | --------------- | ------------------- |
| `user/settings/page.tsx` | `"/auth/login"` | `ROUTES.AUTH.LOGIN` |

### Rule 15: Hardcoded API Paths — 2 violations fixed

| File                          | Hardcoded                      | Fixed To                                  |
| ----------------------------- | ------------------------------ | ----------------------------------------- |
| `user/addresses/add/page.tsx` | `"/api/user/addresses"`        | `API_ENDPOINTS.ADDRESSES.CREATE`          |
| `profile/[userId]/page.tsx`   | `` `/api/profile/${userId}` `` | `API_ENDPOINTS.PROFILE.GET_BY_ID(userId)` |

### Rule 2: Hardcoded Strings — 4 violations fixed

| File                        | Hardcoded                                           | Fixed To                                 |
| --------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `profile/[userId]/page.tsx` | `"User not found"`                                  | `ERROR_MESSAGES.USER.NOT_FOUND`          |
| `profile/[userId]/page.tsx` | `"This profile is private"`                         | `ERROR_MESSAGES.GENERIC.PROFILE_PRIVATE` |
| `profile/[userId]/page.tsx` | `"Failed to load profile"`                          | `ERROR_MESSAGES.GENERIC.INTERNAL_ERROR`  |
| `user/settings/page.tsx`    | `ERROR_MESSAGES.GENERIC.UPDATE_FAILED` (wrong path) | `ERROR_MESSAGES.USER.UPDATE_FAILED`      |

### Rule 17: No alert/confirm/prompt — 10 violations fixed

| File                              | Violation                      | Fixed With                         |
| --------------------------------- | ------------------------------ | ---------------------------------- |
| `carousel/[[...action]]/page.tsx` | 2× `alert()`                   | `useToast`                         |
| `users/[[...action]]/page.tsx`    | 3× `confirm()` + 1× `prompt()` | `ConfirmDeleteModal`               |
| `AdminSessionsManager.tsx`        | 2× `confirm()`                 | `ConfirmDeleteModal`               |
| `RichTextEditor.tsx`              | 2× `window.prompt()`           | Custom `UrlInputPopover` component |

### Rule 18: No console.log — 12 violations fixed

| File                                | Method             | Fixed With     |
| ----------------------------------- | ------------------ | -------------- |
| `user/settings/page.tsx`            | 2× `console.error` | `logger.error` |
| `user/addresses/add/page.tsx`       | 1× `console.error` | `logger.error` |
| `user/addresses/edit/[id]/page.tsx` | 3× `console.error` | `logger.error` |
| `profile/[userId]/page.tsx`         | 1× `console.error` | `logger.error` |
| `admin/site/page.tsx`               | 1× `console.log`   | `logger.info`  |
| `MonitoringProvider.tsx`            | 1× `console.log`   | `logger.info`  |
| `LayoutClient.tsx`                  | 1× `console.log`   | `logger.debug` |
| `Sidebar.tsx`                       | 1× `console.error` | `logger.error` |
| `FAQHelpfulButtons.tsx`             | 1× `console.error` | `logger.error` |

### Bonus: Pre-existing bug fixed

| File                | Issue                                          | Fix                      |
| ------------------- | ---------------------------------------------- | ------------------------ |
| `error-tracking.ts` | Literal `\n` characters in source (invalid TS) | Fixed to actual newlines |

### Rules with ZERO violations found

- Rule 3: THEME_CONSTANTS ✅
- Rule 4: Existing utils/helpers ✅
- Rule 5: Existing hooks ✅
- Rule 6: Existing components ✅
- Rule 7: Firebase SDK separation ✅
- Rule 8: Repository pattern ✅
- Rule 9: API route pattern ✅
- Rule 10: Error classes ✅ (context-specific `throw new Error` in hooks/components is acceptable)
- Rule 11: Singleton classes ✅
- Rule 12: RBAC ✅
- Rule 13: Collection names ✅
- Rule 16: Thin pages ✅

### Known pre-existing TS errors (not introduced by audit)

- `useAddresses.ts` — wrong API hook pattern, missing `ADDRESSES` on `USER` endpoint group
- `BlogArticlesSection.tsx` — missing `BLOG`, `VIEW_ALL`, `COLLECTIONS` constants
- `AdminSessionsManager.tsx` — `UI_LABELS.ADMIN.SESSIONS` not defined (uses `?.` fallback)
- `settings/page.tsx` — `SessionUser` missing `metadata` property
- `AdminTabs.tsx`, `UserTabs.tsx` — readonly array not assignable to mutable `SectionTab[]`
- `FAQSection.tsx` — `UI_LABELS.FAQS` should be `UI_LABELS.FAQ`
- `NewsletterSection.tsx` — missing `SUBSCRIBED`, `SUBSCRIBE`, `PRIVACY_NOTE` constants
- `useAuth.ts` — `ERROR_MESSAGES.AUTH.USER_NOT_FOUND` doesn't exist

---

## Summary by Priority

| Priority | Category                                         | Count  | Effort                                          |
| -------- | ------------------------------------------------ | ------ | ----------------------------------------------- |
| ~~High~~ | ~~Stubbed middleware~~ ✅ RESOLVED — delete file | ~~24~~ | ~~Large~~ — `createApiHandler` covers all needs |
| High     | API type definitions (Phase 2 wishlist)          | 47     | Medium — gradual as features are built          |
| Medium   | API route TODOs (feature implementation notes)   | 87     | Large — spread across 11 route files            |
| Medium   | Validation schemas (advanced rules)              | 23     | Medium — Zod schema enhancements                |
| Low      | Media processing stubs                           | 4      | Medium — requires `sharp` and `ffmpeg`          |
| Low      | Monitoring/error-tracking                        | 3      | Small — source map integration                  |
| Low      | Scattered single TODOs                           | 15     | Small — individual fixes                        |

---

## High Priority

### `src/types/api.ts` — 47 TODOs

Phase 2 feature wishlist for API type definitions. These are placeholder types and interfaces that need to be fleshed out as features are built (products, orders, reviews, bids, coupons, seller dashboard, analytics, notifications, etc.).

**Action**: Address incrementally as each feature is implemented. Not blocking.

### ~~`src/lib/api/middleware.ts` — 24 TODOs~~ ✅ RESOLVED

The entire file (~452 lines) was stubbed code with TODO markers. `createApiHandler` in `src/lib/api/api-handler.ts` fully replaces it (auth, role checks, Zod validation, rate limiting, error handling). The file has **zero imports** anywhere in the codebase — completely dead code.

**Action**: Delete `src/lib/api/middleware.ts`. Remove from deprecated functions list below. ~~24 TODOs resolved.~~

### `src/lib/validation/schemas.ts` — 23 TODOs

Zod validation schemas with TODOs for:

- Advanced password rules
- Custom email domain validation
- Phone number format validation
- Address field validation enhancements
- Product-specific validation rules

**Action**: Implement as form validation requirements solidify.

---

## Medium Priority — API Route TODOs

These are implementation notes within API route files, documenting planned features and improvements.

| File                                     | TODOs | Key Items                                                                                      |
| ---------------------------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| `src/app/api/reviews/route.ts`           | 15    | Pagination, rating distribution, purchase verification, duplicate prevention, moderation queue |
| `src/app/api/site-settings/route.ts`     | 14    | Settings validation, history tracking, cache invalidation, partial updates                     |
| `src/app/api/homepage-sections/route.ts` | 12    | Caching (CDN + Redis), personalization, section-specific config validation                     |
| `src/app/api/carousel/route.ts`          | 12    | Active slide limits, view analytics, grid position validation, caching                         |
| `src/app/api/faqs/route.ts`              | 11    | Search implementation, variable interpolation, category filtering, SEO slugs                   |
| `src/app/api/products/route.ts`          | 9     | Image upload handling, admin approval notifications, SEO ID generation                         |
| `src/app/api/products/[id]/route.ts`     | 4     | Related products, view counting, seller verification, soft delete                              |
| `src/app/api/categories/[id]/route.ts`   | 4     | Product reassignment on delete, slug uniqueness, nested categories                             |
| `src/app/api/categories/route.ts`        | 3     | Tree structure support, icon validation, position management                                   |

**Action**: Address as each feature area is built out. These serve as useful implementation guides.

---

## Low Priority

### Media Processing — 4 TODOs

| File                              | TODOs | Description                                                  |
| --------------------------------- | ----- | ------------------------------------------------------------ |
| `src/app/api/media/crop/route.ts` | 2     | Image cropping with `sharp` library (currently returns stub) |
| `src/app/api/media/trim/route.ts` | 2     | Video trimming with `ffmpeg` (currently returns stub)        |

**Action**: Implement when media processing features are needed. Requires adding `sharp` and `ffmpeg` dependencies.

### Monitoring — 3 TODOs

| File                                   | TODOs | Description                                                 |
| -------------------------------------- | ----- | ----------------------------------------------------------- |
| `src/lib/monitoring/error-tracking.ts` | 3     | Source map support, error deduplication, Sentry integration |

**Action**: Implement when production error monitoring is set up.

### Scattered TODOs — 15 across 11 files

| File                                              | Count | Description                                   |
| ------------------------------------------------- | ----- | --------------------------------------------- |
| `src/constants/api-endpoints.ts`                  | 2     | Additional endpoint constants for future APIs |
| `src/app/user/addresses/edit/[id]/page.tsx`       | 3     | Address edit form enhancements                |
| `src/app/user/addresses/add/page.tsx`             | 1     | Address add form enhancement                  |
| `src/app/user/orders/view/[id]/page.tsx`          | 1     | Order detail view enhancement                 |
| `src/app/user/orders/page.tsx`                    | 1     | Orders list enhancement                       |
| `src/app/user/profile/page.tsx`                   | 1     | Profile page enhancement                      |
| `src/app/admin/site/page.tsx`                     | 1     | Save settings API integration                 |
| `src/app/api/auth/forgot-password/route.ts`       | 1     | Email service integration                     |
| `src/app/api/auth/register/route.ts`              | 1     | Email service integration                     |
| `src/app/api/auth/send-verification/route.ts`     | 1     | Email service integration                     |
| `src/hooks/useAuth.ts`                            | 1     | Auth hook enhancement                         |
| `src/components/LayoutClient.tsx`                 | 1     | Layout enhancement                            |
| `src/constants/homepage-data.ts`                  | 1     | Homepage data structure                       |
| `src/components/homepage/BlogArticlesSection.tsx` | 1     | Blog feature placeholder                      |
| `src/components/faq/FAQAccordion.tsx`             | 1     | FAQ accordion enhancement                     |

---

## Deprecated Functions (Phase 7B)

40 functions across 11 files have been marked `@deprecated` as potentially unused. See the function list in `docs/REFACTOR_PLAN.md` Phase 7B, Task 7.7.

**Key files with deprecated functions:**

- `src/helpers/ui/animation.helper.ts` — DOM animation utilities (5 functions)
- `src/helpers/ui/style.helper.ts` — Style utility functions (4 functions)
- `src/helpers/ui/color.helper.ts` — Color manipulation (4 functions)
- `src/helpers/data/array.helper.ts` — Array utilities (6 functions)
- `src/helpers/data/object.helper.ts` — Object utilities (3 functions)
- `src/helpers/data/sorting.helper.ts` — Sorting utilities (5 functions)
- `src/utils/formatters/string.formatter.ts` — String formatters (6 functions)
- `src/utils/converters/type.converter.ts` — Type converters (4 functions)
- `src/utils/validators/input.validator.ts` — Input validators (4 functions)
- `src/utils/id-generators.ts` — ID generators (2 functions)
- ~~`src/lib/api/middleware.ts`~~ — ✅ RESOLVED: delete file, `createApiHandler` is the replacement

**Action**: Monitor usage over time. Remove from barrel exports if confirmed unused after feature development stabilizes. Do not delete — some may be needed for future features.

---

## Maintenance Notes

- Run `grep -rn "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | wc -l` to get current count
- Review this document quarterly and remove items that have been resolved
- When implementing a feature, check this document for related TODOs to address
