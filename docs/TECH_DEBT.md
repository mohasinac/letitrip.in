# LetItRip — Technical Debt & Future Work Tracker

**Last Updated**: February 2026 (updated Feb 22 — 4 additional items resolved)
**Status**: All TODOs are intentional `TODO (Future)` roadmap notes — no blocking bugs.
**Total markers**: ~41 across 12 files (Phase 7.10 cleared 4 more items)

---

## Overview

All markers in this repo follow the `TODO (Future)` annotation pattern. They are **intentional documentation** of planned enhancements — not bugs, not broken code, not skipped tests. Each TODO is safe to ship as-is.

This document organises them by file and category so future phases can pick them up systematically.

---

## By File

### `src/types/api.ts` — 2 items

| Line | Description                                                                |
| ---- | -------------------------------------------------------------------------- |
| 6    | Phase 2 future additions header                                            |
| 447  | Settings diff tracking — compare old vs new to generate change log entries |

---

### `src/lib/validation/schemas.ts` — 18 items

| Line | Category            | Description                                                                                                                                |
| ---- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 6    | Phase 2 header      | Future validation additions                                                                                                                |
| 43   | Security            | ~~Domain whitelist for image URLs~~ ✅ Done — Phase 7.9 (`mediaUrlSchema`)                                                                 |
| 170  | Media               | ~~Video format validation (mp4/webm/ogg whitelist)~~ ✅ Done — Phase 7.9                                                                   |
| 171  | Media               | ~~Resolution validation (min width/height requirements)~~ ✅ Done — Phase 7.10 (`cropDataSchema` `minWidth`/`minHeight` params + refines)  |
| 191  | Search              | ~~Compound filter support (price range + category combined)~~ ✅ Done — Phase 7.10 (compound Sieve filter assembly in `GET /api/products`) |
| 253  | Content Policy      | ~~Prohibited words/content filter for titles and descriptions~~ ✅ Done — Phase 7.9                                                        |
| 254  | Seller Verification | ~~Require seller email verification before listing products~~ ✅ Done — Phase 7.4                                                          |
| 269  | Status Flow         | ~~Status transition validation (draft→published, not sold→draft)~~ ✅ Done — Phase 7.5                                                     |
| 335  | Categories          | Name uniqueness validation per parent (requires DB lookup)                                                                                 |
| 423  | Site Settings       | Deep nested validation for featuresEnabled, emailSettings, socialLinks                                                                     |
| 452  | Carousel            | ~~Cross-card overlap detection for 9×9 grid~~ ✅ Done — Phase 7.9                                                                          |
| 564  | Sections            | ~~Type-specific config validation per section type~~ ✅ Done — Phase 7.9                                                                   |
| 611  | Email Templates     | Variable syntax validation — verify `{{variableName}}` placeholders                                                                        |
| 719  | Media               | ~~Aspect ratio enforcement — verify width/height match declared aspectRatio~~ ✅ Done — Phase 7.9                                          |
| 797  | i18n                | i18n support for Zod error messages                                                                                                        |
| 812  | i18n                | Map field paths to localised error messages                                                                                                |

---

### `src/lib/monitoring/error-tracking.ts` — 3 items

| Line | Description                                                                         |
| ---- | ----------------------------------------------------------------------------------- |
| 113  | Firebase Crashlytics integration (pending `@react-native-firebase/crashlytics` SDK) |
| 312  | Set user in Crashlytics when SDK is added                                           |
| 328  | Clear user in Crashlytics on logout when SDK is added                               |

---

### `src/components/LayoutClient.tsx` — 1 item

| Line | Description                                                              |
| ---- | ------------------------------------------------------------------------ |
| 42   | ~~Fetch background settings from site settings API~~ ✅ Done — Phase 7.9 |

---

### `src/app/api/site-settings/route.ts` — 6 items

| Line    | Description                                                                |
| ------- | -------------------------------------------------------------------------- |
| 41      | ~~ETag support for conditional GET requests~~ ✅ Done — Phase 7.9          |
| 42      | Redis integration for distributed caching                                  |
| 98      | ~~Track changes in audit log on PUT~~ ✅ Done — Phase 7.6                  |
| 99      | Invalidate distributed caches (Redis) on PUT                               |
| 100     | ~~Send notification to all admins on settings change~~ ✅ Done — Phase 7.9 |
| 124–127 | Invalidate caches (Redis) + ~~audit trail~~ ✅ Done — Phase 7.6 on PATCH   |

---

### `src/app/api/reviews/route.ts` — 3 items

| Line | Description                                                                        |
| ---- | ---------------------------------------------------------------------------------- |
| 217  | ~~Verify user purchased the product before allowing a review~~ ✅ Done — Phase 7.3 |
| 218  | ~~Notify seller and admins on new review submission~~ ✅ Done — Phase 7.9          |
| 247  | ~~Enforcement point for purchase verification~~ ✅ Done — Phase 7.3                |

---

### `src/app/api/products/route.ts` — 2 items

| Line | Description                                                                   |
| ---- | ----------------------------------------------------------------------------- |
| 166  | ~~Generate SEO-friendly slug/ID for product URLs~~ ✅ Done — Phase 7.8        |
| 167  | ~~Notify admins when new product submitted for approval~~ ✅ Done — Phase 7.7 |

---

### `src/app/api/products/[id]/route.ts` — 4 items

| Line | Phase   | Description                              |
| ---- | ------- | ---------------------------------------- |
| 6    | Phase 2 | Future GET enhancements header           |
| 49   | Phase 3 | PATCH/update enhancements header         |
| 87   | Phase 3 | Seller permission checks header          |
| 156  | Phase 3 | DELETE soft-delete implementation header |

---

### `src/app/api/homepage-sections/route.ts` — 3 items

| Line | Description                                                                          |
| ---- | ------------------------------------------------------------------------------------ |
| 47   | Personalisation based on user segments                                               |
| 112  | ~~Validate section-specific config structure per type (schema)~~ ✅ Done — Phase 7.9 |
| 142  | ~~Enforcement point for type-based config validation~~ ✅ Done — Phase 7.9           |

---

### `src/app/api/faqs/route.ts` — 1 item

| Line | Description                                                           |
| ---- | --------------------------------------------------------------------- |
| 208  | ~~Generate SEO-friendly slug for FAQ permalinks~~ ✅ Done — Phase 7.8 |

---

### `src/app/api/carousel/route.ts` — 3 items

| Line | Description                                                                                 |
| ---- | ------------------------------------------------------------------------------------------- |
| 46   | Analytics: track views per slide                                                            |
| 108  | ~~Validate grid card positions for non-overlapping placement~~ ✅ Done — Phase 7.9 (schema) |
| 140  | ~~Enforcement point for grid overlap validation~~ ✅ Done — Phase 7.9 (schema)              |

---

### `src/app/api/categories/route.ts` — 2 items

| Line    | Description                                      |
| ------- | ------------------------------------------------ |
| 6       | Phase 2 header — future list/create enhancements |
| 54, 152 | Phase 3 headers — bulk operations, tree fetching |

---

### `src/app/api/categories/[id]/route.ts` — 4 items

| Line | Phase   | Description                                      |
| ---- | ------- | ------------------------------------------------ |
| 6    | Phase 3 | GET single category enhancements                 |
| 46   | Phase 4 | PATCH enhancements + parent change cascade       |
| 87   | Phase 4 | Permission checks for category edits             |
| 149  | Phase 4 | DELETE cascade soft-deletion of child categories |

---

## Priority Groupings

### High Impact (unblock real features)

| Item                                     | File                       | Description           | Status              |
| ---------------------------------------- | -------------------------- | --------------------- | ------------------- |
| Purchase verification for reviews        | `api/reviews/route.ts:217` | Prevents fake reviews | ✅ Done — Phase 7.3 |
| Seller email verification before listing | `schemas.ts:254`           | Security gate         | ✅ Done — Phase 7.4 |
| Status transition validation             | `schemas.ts:269`           | Data integrity        | ✅ Done — Phase 7.5 |

### Medium Impact (production hardening)

| Item                                       | File                               | Description                                   |
| ------------------------------------------ | ---------------------------------- | --------------------------------------------- |
| ~~ETag / Redis caching for site-settings~~ | `api/site-settings/route.ts:41-42` | ✅ ETag Done — Phase 7.9; Redis still pending |
| ~~Audit log for settings changes~~         | `api/site-settings/route.ts:98`    | ✅ Done — Phase 7.6                           |
| ~~Admin notification on new product~~      | `api/products/route.ts:167`        | ✅ Done — Phase 7.7                           |
| ~~Notify seller on new review~~            | `api/reviews/route.ts:218`         | ✅ Done — Phase 7.9                           |

### Low Impact / Nice-to-Have

| Item                                  | Files                      | Description                                                                                                            |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| SEO slugs for products & FAQs         | `api/products`, `api/faqs` | ✅ Done — Phase 7.8                                                                                                    |
| ~~Domain whitelist (mediaUrlSchema)~~ | `schemas.ts:43`            | ✅ Done — Phase 7.9                                                                                                    |
| ~~Video format validation~~           | `schemas.ts:170`           | ✅ Done — Phase 7.9                                                                                                    |
| ~~Prohibited words filter~~           | `schemas.ts:253`           | ✅ Done — Phase 7.9                                                                                                    |
| ~~Carousel grid overlap~~             | `schemas.ts:452`           | ✅ Done — Phase 7.9                                                                                                    |
| ~~Section type-specific config~~      | `schemas.ts:564`           | ✅ Done — Phase 7.9                                                                                                    |
| ~~Aspect ratio enforcement~~          | `schemas.ts:719`           | ✅ Done — Phase 7.9                                                                                                    |
| ~~LayoutClient background fetch~~     | `LayoutClient.tsx:42`      | ✅ Done — Phase 7.9                                                                                                    |
| Crashlytics integration               | `lib/monitoring`           | Crash tracking                                                                                                         |
| Carousel slide analytics              | `api/carousel/route.ts:46` | ~~Analytics~~ ✅ Done — Phase 7.10 (`incrementViews` fire-and-forget + `stats.views` field on `CarouselSlideDocument`) |
| i18n for Zod error messages           | `schemas.ts:797,812`       | Internationalisation                                                                                                   |

---

## Blocked Items (external dependency)

| Item                 | Blocker                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| Firebase Crashlytics | `@react-native-firebase/crashlytics` SDK not installed                  |
| 6.5 PWA Icons        | Design assets needed (192px + 512px PNG) → update `src/app/manifest.ts` |

---

## Notes

- All `TODO (Future)` comments are **safe to ship**. None represent broken behaviour.
- The codebase has **0 TypeScript errors** (verified `npx tsc --noEmit` February 13, 2026).
- Naming convention: `TODO (Future)` = intentional roadmap note; `FIXME` = blocking bug (none currently exist in `src/`).
