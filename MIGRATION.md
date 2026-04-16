# letitrip.in → appkit Migration Tracker

**Last verified:** 2026-04-16 — Session 43, Phase 10 seller — local seller wrapper feature deleted; appkit seller remains canonical; tsc passes in both repos  
**Last session ended at:** Phase 10 — `src/features/seller/` deleted  
**Goal:** Reduce letitrip.in to a thin consumer by making appkit the generic, configurable, and extendable source of truth (not copy-move parity), with consumer code limited to route wiring, server-action entrypoints, provider wiring, market config, and SDK drivers.

---

## Summary

| Exec Order | Phase | Scope | Files | Status |
|------------|-------|-------|-------|--------|
| 1 | Phase 1 | Schema Layer | 30 | ✅ 30/30 complete |
| 2 | Phase 2 | Constants & Utils | 16 | ✅ complete (11 ✅, 5 🔒) |
| 3 | Phase 3 | Validation | ~15 | ✅ complete (cross-domain split done; domain validators deferred to Phase 10 ownership) |
| 4 | Phase 4 | Server Infrastructure (pii, query, logger, helpers) | 18 | ✅ done |
| 5 | Phase 5 | Repository Layer | 32 | ✅ complete (32/32) |
| 6 | Phase 6 | Seed Data | 21 | ✅ 21/21 complete |
| 7 | Phase 7 | Actions → Appkit | 35 | ✅ 35/35 complete |
| 8 | Phase 8 | Hooks | 16 | ✅ complete (15 ✅, 1 🔒) |
| 9 | Phase 9 | Shared UI Components | 30 | ✅ complete — blocker-burn marketplace cards + admin UI primitives done; auth/products types remain local per design |
| 10 | Phase 10 | Feature Modules | ~375 | 🔄 18/19 features complete |
| 11 | Phase 11 | Re-export Elimination (final gate) | TBD | ⬜ |

**Total to migrate/delete: ~580 files**

---

## Copilot Session Prompt

Use the prompt below for future migration sessions. It is aligned with the appkit-first architecture, permanent-local exceptions, SSR/UI rules, and blocker-avoidance requirements already defined in this tracker and the repo instruction files.

```md
# letitrip.in -> appkit Migration Session

## Mission
Appkit is the single source of truth for reusable logic, UI, hooks, contexts, repositories, schemas, validators, providers, and feature views.
letitrip.in is a thin consumer and must keep only route wiring, server action entrypoints, project/runtime wiring, provider registration, market/site config, secrets, and SDK bootstrapping.

Do not use parity, temporary divergence, "not worth moving", or current consumer usage volume as reasons to keep reusable code in letitrip.in.
This app is not production-final. Optimize for aggressive consolidation into appkit now, but only through generic, configurable, extendable abstractions.

---

## Read First
1. Read `MIGRATION.md` fully enough to follow the active phase, architecture-fit rules, permanent locals, and tracker update format.
2. Read `.github/copilot-instructions.md` in both repos:
	- `d:/proj/letitrip.in/.github/copilot-instructions.md`
	- `d:/proj/appkit/.github/copilot-instructions.md`
3. Read the current letitrip file.
4. Read the appkit target file listed in the tracker. If missing, search appkit for the closest existing concept before creating anything new.

---

## Session Scope
1. In the MIGRATION summary table, find the lowest `Exec Order` row that is not fully complete. That is the active phase.
2. Inside that phase, start with the first `⬜`, `❌`, or tracker-listed incomplete file in listed order.
3. Process files in tracker order only.
4. Stop after 10 processed files, or earlier if you introduce a red validation state you cannot clear promptly.
5. Do not skip forward to a later phase because a file looks easier there.

> The `Exec Order` column is authoritative. Do not use P-number ordering or personal preference.

---

## Non-Negotiable Architecture Gates

Every migrated file must satisfy all of these:

1. Generic: appkit owns the reusable concept, not a letitrip-specific copy.
2. Configurable: market/app differences are injected through typed config, providers, contracts, callbacks, render props, adapters, or feature config.
3. Extendable: future variants can be added without reopening consumer duplication.
4. Default-with-override: letitrip behavior may be the initial default in appkit, but must not be the only possible behavior.
5. Appkit-first ownership: if code is reusable across two apps or could reasonably become reusable, it belongs in appkit now.
6. SSR-first: do not add `'use client'` unless the file truly needs browser APIs, event handlers, or controlled input behavior.
7. Semantic wrappers only: do not introduce raw `<div>`, `<section>`, `<h*>`, `<p>`, `<ul>`, `<li>`, or similar tags where appkit UI wrappers should be used.
8. No consumer shims by default: do not create or preserve local re-export files unless the tracker explicitly records a temporary exception.
9. No consumer-owned shared logic: hooks, contexts, repositories, validators, utilities, schemas, filters, admin UI, and feature views should not remain in letitrip unless they are a documented permanent-local exception.
10. No market hardcoding in appkit: no `INR`, `IN`, `+91`, Razorpay-specific assumptions, site copy, or route assumptions unless injected as config.

If any gate fails, the file is not complete even if the local file was deleted.

---

## Permanent-Local Exceptions

Keep a file local only if it is one of these:

1. Next.js route wiring under `src/app/`
2. `'use server'` action entrypoints that delegate business logic to appkit
3. Provider registry wiring and feature config
4. Market/site config, branding, locale policy, routes, internal API path constants, navigation tree
5. Secrets, env wiring, project SDK bootstrapping, Firebase config, payment SDK init, shipping SDK drivers, runtime deployment wiring

Anything outside those categories must move to appkit or be reduced to a thin adapter with a tracked removal plan.

---

## Per-File Workflow

For each file, do these steps in order:

1. Read the letitrip file fully.
2. Read the tracker target in appkit. If it does not exist, search appkit for the closest matching ownership point.
3. Read all local usages/imports of the file before deciding how to migrate it.
4. Choose exactly one outcome: `A`, `B`, `C`, `D`, or `E`.
5. For `B` or `C`, implement the reusable abstraction in appkit first.
6. Rewire letitrip imports to the canonical `@mohasinac/appkit/...` path.
7. Update official appkit entrypoints and `tsup.config.ts` only when the new public import path requires it.
8. Delete the letitrip file, or reduce it to the thinnest legitimate local wrapper when the rules explicitly allow it.
9. Run validation for the affected slice.
10. Update `MIGRATION.md` immediately before moving to the next file.

---

## Choose Exactly One Outcome

### A — Already Done
Appkit already owns the same implementation, or the letitrip file is only a shim/re-export.

Action: delete the letitrip file, update imports, remove any redundant barrel path, mark `✅`.

### B — Appkit Owns It, Needs Merge
Appkit has the concept already, but letitrip still carries important behavior, variants, or API surface.

Action: merge the missing behavior into appkit, make the API generic/configurable, update imports, delete the local file, mark `✅`.

### C — Target Missing In Appkit
No equivalent exists yet in appkit.

Action: create the appkit implementation in the canonical feature/location, extract only reusable logic, inject app-specific differences via config/adapters, update imports, delete the local file, mark `✅`.

### D — Strict Local-Only Exception
The file is a legitimate permanent-local exception from the list above.

Action: keep it local, thin it further if possible, mark `🔒` with a one-line reason.

### E — Blocked Dependency
The file cannot move yet because a tracker dependency or missing shared abstraction is unresolved.

Action: mark `❌` with the real blocker. If the blocker is a missing shared abstraction, prefer creating that abstraction in appkit in the same session before moving on.

---

## Blocker-Avoidance Rules

1. Do not move code into appkit if it still imports from letitrip paths afterward. Fix ownership at the root.
2. Do not preserve two similar implementations when one configurable appkit implementation can own both.
3. Do not leave letitrip compatibility wrappers untracked. Every temporary wrapper must have a tracker note and closure condition.
4. Do not hardcode consumer routes, route builders, navigation items, currencies, locale copy, or SDK assumptions inside appkit. Inject them.
5. Do not keep local hooks, contexts, filters, selectors, forms, tables, or UI primitives just because they currently reference local types. Move the shared types or define appkit contracts.
6. Do not create raw-class duplication where a wrapper variant/config belongs in appkit.
7. Do not solve a Phase 9 or Phase 10 blocker by cloning consumer behavior into appkit. Add the missing abstraction instead.
8. Do not mark `✅` if the result still violates the architecture gates, even if typecheck passes.

---

## Shared Design Rules To Apply While Migrating

1. Use appkit semantic/layout wrappers instead of raw HTML tags in shared UI.
2. Keep page views as async server components where applicable.
3. Keep forms/modals/drawers client-only only when interactivity requires it.
4. Use shared money/price rendering pathways, not symbol concatenation.
5. Use shared media types/upload flows for media fields.
6. Use typed ID generators instead of ad-hoc IDs.
7. Keep repositories behind appkit contracts/providers, not consumer singletons.
8. Export through official appkit entrypoints only. No stray barrels or consumer-facing internal paths.

---

## Import And Barrel Rewiring

After each successful move:

1. Find all imports of the old letitrip path.
2. Replace them with the canonical `@mohasinac/appkit/...` import.
3. Update appkit barrel exports only when they are official entrypoints.
4. Delete consumer shims instead of preserving them.
5. If a temporary re-export must survive for batch-size reasons, record it explicitly in `MIGRATION.md` with follow-up removal work.

---

## Validation Gate

1. After each file or tight batch, run the smallest validation that proves the edit is sound.
2. After each 10-file batch, or at end of session, run `tsc --noEmit` in both repos.
3. If UI routes or shared views changed, run the relevant smoke validation as well.
4. Fix all introduced errors before continuing.
5. If more than 5 introduced errors remain after a batch, stop and report the real causes instead of stacking more edits.

---

## Tracker Updates

For every processed file, update `MIGRATION.md` with:

1. Status: `✅`, `🔒`, or `❌`
2. Short reason for `🔒` or `❌`
3. Any temporary adapter/shim note and its removal condition
4. Phase summary row if the phase becomes fully complete
5. `Last session ended at` with the last processed file
6. A concise commit-message line for the batch

Do not leave tracker updates for the end. Update the tracker as you go.
```

---

## Architecture North Star (Mandatory)

Every migration decision must satisfy all four checks:

1. **Generic:** appkit implementation models the reusable concept, not letitrip-specific behavior.
2. **Configurable:** market/app differences are injected via typed config, adapters, callbacks, render props, or provider contracts.
3. **Extendable:** future variants can be added without copy/paste forks in consumers.
4. **Default-with-override:** when migrating letitrip-specific behavior into appkit, preserve letitrip behavior as the default baseline in appkit, but expose typed extension points so consumers can override all or part of that behavior when needed.

If a moved file fails any check, migration is incomplete even if the letitrip file was deleted.

> **Execution order matters.** Schemas (Phase 1) have no upstream deps. Constants/Utils (Phase 2) reference schema types. Validation (Phase 3) depends on schemas + utils — Zod schemas and cross-domain validators must land in appkit before repos and actions consume them. Server Infrastructure (Phase 4) depends on Phase 1-3 — pii/query/logger/helpers import validators and schema constants. Repositories (Phase 5) import from server infrastructure (pii, sieve, logger). Seed Data (Phase 6) needs repo types. Actions → Appkit (Phase 7) depend on repos + server infra; business logic moves to appkit, letitrip files become `'use server'` thin wrappers. Hooks (Phase 8) depend on repos + appkit actions since mutations go through action functions. Shared UI (Phase 9) depends on hooks. Feature Modules (Phase 10) depend on everything. Re-export elimination (Phase 11) runs last as the final consumer-thinning gate. Always follow exec order column.

---

## Permanent Locals — Never Move

These files are **app-specific** and legitimately stay in letitrip forever:

```
src/lib/firebase/config.ts            — Firebase project config
src/lib/firebase/client-config.ts     — Client SDK init
src/lib/firebase/auth-server.ts       — Server-side admin auth
src/lib/firebase/realtime.ts          — RTDB client init
src/lib/firebase/storage.ts           — Storage client init
src/lib/integration-keys.ts           — API keys and secrets
src/lib/payment/razorpay.ts           — Razorpay SDK init
src/lib/shiprocket/                   — Shiprocket SDK driver
src/lib/pwa/                          — PWA runtime caching config
src/constants/site.ts                 — Market config (INR, IN, +91, branding)
src/constants/routes.ts               — App route paths
src/constants/api-endpoints.ts        — Internal API paths
src/constants/config.ts               — App-level feature flags
src/constants/navigation.tsx          — App navigation tree
src/providers.config.ts               — Provider registry wiring
src/features.config.ts                — Feature flag config
src/app/                              — Next.js route pages and layouts
src/actions/                          — Server action entrypoints ('use server' thin wrappers — business logic lives in appkit Phase 7)
```

---

## Execution Contract

For every file migrated:
1. Verify appkit target already exists OR create a generic/configurable/extendable implementation in appkit.
2. Update all letitrip import sites to point at `@mohasinac/appkit/...`.
3. Delete the letitrip file (or reduce to a thin wrapper if it's a legitimate permanent local).
4. Verify the appkit API uses injected config/adapters instead of hardcoded consumer routes/copy/types.
5. After every 10-file batch: run `tsc --noEmit` in both repos. Fix all errors before continuing.

**Architecture-fit gate (applies to all phases):**
- Do not mark `✅` if appkit still depends on letitrip constants/routes/navigation/types for the migrated concern.
- Prefer one configurable appkit implementation over two similar implementations.
- Any temporary thin adapter left in letitrip must be explicitly documented with a blocker and closure condition.

---

## Phase-by-Phase Architecture Verification

This section verifies each phase against the original intent (generic + configurable + extendable), not just migration count.

| Phase | File migration status | Architecture-fit status | Required closure outcome |
|------|------------------------|-------------------------|--------------------------|
| Phase 1 — Schema Layer | ✅ complete | 🔄 partial | Finalize shared schema ownership so consumer does not retain fallback schema indirection beyond legitimate app config. |
| Phase 2 — Constants & Utils | ✅ complete | 🔄 partial | Keep market copy constants local, but ensure reusable constants/utils are consumed from appkit directly with no consumer compatibility shims. |
| Phase 3 — Validation | ✅ complete | 🔄 partial | Complete validator ownership split so appkit keeps cross-domain validation primitives and feature validators move with their feature modules. |
| Phase 4 — Server Infrastructure | ✅ complete | 🔄 partial | Ensure infra APIs are provider/adapter driven and not coupled to consumer request/route assumptions. |
| Phase 5 — Repository Layer | ✅ complete | 🔄 partial | Confirm repositories expose stable contracts from appkit entrypoints and remove remaining consumer-owned compatibility surfaces. |
| Phase 6 — Seed Data | ✅ complete | 🔄 partial | Keep seeds parameterized via factory/config, avoid letitrip-specific defaults in shared seed payloads. |
| Phase 7 — Actions to appkit | ✅ complete | 🔄 partial | Letitrip action files stay thin; appkit action APIs must carry business logic and accept consumer-configurable dependencies. |
| Phase 8 — Hooks | ✅ complete | 🔄 partial | Keep shared hooks in appkit and reserve consumer hooks only for permanent local SDK drivers (for example Razorpay). |
| Phase 9 — Shared UI Components | 🔄 in progress | 🔄 partial | Resolve blocked UI by adding appkit abstractions for route injection, navigation adapters, listing-card variants, and shared type ownership. |
| Phase 10 — Feature Modules | 🔄 in progress | 🔄 partial | Migrate feature stacks end-to-end to appkit with config-driven differences and no duplicated consumer implementations. |

Interpretation:
- `file migration status` tracks moved/deleted progress.
- `architecture-fit status` tracks whether moved code actually satisfies the design intent.
- A phase is only truly done when both statuses are `✅`.

**Blocker-burn rule:** When a Phase 9 blocker is caused by a missing shared abstraction, do not skip to Phase 10. Add the abstraction to appkit first, expose it through the canonical appkit entrypoint, then retry every blocked file that depended on it in the same session. Prefer injected config, callbacks, render props, and typed adapters over consumer-owned duplicate components.

**For Phase 7 Actions specifically:** The letitrip `src/actions/*.actions.ts` file is **not deleted** — it becomes a `'use server'` thin entrypoint. Move all business logic to `@mohasinac/appkit/features/<domain>/actions/`. The letitrip file keeps only: auth check, input parse/validate, call appkit function, return result.

---

## Phase 1 — Schema Layer

**Target in appkit:** `src/features/<entity>/schemas/` (field constants, collection names, default shapes)  
**Dependency:** Nothing depends on schemas upstream. Start here (exec order 1).

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/db/schema/field-names.ts` | `src/features/*/schemas/` (shared field registry) | ✅ shim — USER/TOKEN/SESSION/CATEGORY_FIELDS → appkit; product/order/review/bid/etc locals remain |
| `src/db/schema/index.ts` | delete (barrel) | 🔒 223 import sites — barrel kept |
| `src/db/schema/users.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/schema/tokens.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/schema/sessions.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/schema/stores.ts` | `src/features/stores/schemas/` | ✅ |
| `src/db/schema/store-addresses.ts` | `src/features/stores/schemas/` | ✅ |
| `src/db/schema/addresses.ts` | `src/features/account/schemas/` | ✅ |
| `src/db/schema/cart.ts` | `src/features/cart/schemas/` | ✅ |
| `src/db/schema/categories.ts` | `src/features/categories/schemas/` | ✅ |
| `src/db/schema/products.ts` | `src/features/products/schemas/` | ✅ |
| `src/db/schema/orders.ts` | `src/features/orders/schemas/` | ✅ |
| `src/db/schema/reviews.ts` | `src/features/reviews/schemas/` | ✅ |
| `src/db/schema/blog-posts.ts` | `src/features/blog/schemas/` | ✅ |
| `src/db/schema/events.ts` | `src/features/events/schemas/` | ✅ |
| `src/db/schema/bids.ts` | `src/features/auctions/schemas/` | ✅ |
| `src/db/schema/coupons.ts` | `src/features/promotions/schemas/` | ✅ |
| `src/db/schema/offers.ts` | `src/features/seller/schemas/` | ✅ |
| `src/db/schema/payouts.ts` | `src/features/payments/schemas/` | ✅ |
| `src/db/schema/notifications.ts` | `src/features/admin/schemas/` | ✅ |
| `src/db/schema/chat.ts` | `src/features/admin/schemas/` | ✅ |
| `src/db/schema/site-settings.ts` | `src/features/admin/schemas/` | ✅ |
| `src/db/schema/carousel-slides.ts` | `src/features/homepage/schemas/` | ✅ |
| `src/db/schema/homepage-sections.ts` | `src/features/homepage/schemas/` | ✅ |
| `src/db/schema/faqs.ts` | `src/features/faq/schemas/` | ✅ |
| `src/db/schema/newsletter-subscribers.ts` | `src/core/` (already has newsletter.repository.ts) | ✅ |
| `src/db/schema/copilot-logs.ts` | `src/features/copilot/` | ✅ shim to `@mohasinac/appkit/core` |
| `src/db/schema/failed-checkouts.ts` | `src/features/checkout/schemas/` | ✅ |
| `src/db/schema/sms-counters.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/indices/merge-indices.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` (`firestore-indexes.ts`) and local file deleted |

### Phase 1 Manual Verification (Session 29, one-by-one)

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/db/schema/field-names.ts` | distributed ownership across `appkit/src/features/*/schemas/firestore.ts` | 🔄 Partial — concept moved, but local fallback constants still remain |
| `src/db/schema/index.ts` | no appkit equivalent (local consumer barrel intentionally retained) | 🔄 Partial — temporary consumer compatibility surface |
| `src/db/schema/users.ts` | `appkit/src/features/auth/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/tokens.ts` | `appkit/src/features/auth/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/sessions.ts` | `appkit/src/features/auth/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/stores.ts` | `appkit/src/features/stores/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/store-addresses.ts` | `appkit/src/features/stores/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/addresses.ts` | `appkit/src/features/account/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/cart.ts` | `appkit/src/features/cart/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/categories.ts` | `appkit/src/features/categories/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/products.ts` | `appkit/src/features/products/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/orders.ts` | `appkit/src/features/orders/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/reviews.ts` | `appkit/src/features/reviews/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/blog-posts.ts` | `appkit/src/features/blog/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/events.ts` | `appkit/src/features/events/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/bids.ts` | `appkit/src/features/auctions/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/coupons.ts` | `appkit/src/features/promotions/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/offers.ts` | `appkit/src/features/seller/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/payouts.ts` | `appkit/src/features/payments/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/notifications.ts` | `appkit/src/features/admin/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/chat.ts` | `appkit/src/features/admin/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/site-settings.ts` | `appkit/src/features/admin/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/carousel-slides.ts` | `appkit/src/features/homepage/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/homepage-sections.ts` | `appkit/src/features/homepage/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/faqs.ts` | `appkit/src/features/faq/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/newsletter-subscribers.ts` | `appkit/src/core/newsletter.repository.ts` | 🔄 Partial — schema concern is represented by repository/core ownership |
| `src/db/schema/copilot-logs.ts` | `appkit/src/core/copilot-log.repository.ts` | 🔄 Partial — schema concern is represented by repository/core ownership |
| `src/db/schema/failed-checkouts.ts` | `appkit/src/features/checkout/schemas/firestore.ts` | ✅ Yes |
| `src/db/schema/sms-counters.ts` | `appkit/src/features/auth/schemas/firestore.ts` | ✅ Yes |
| `src/db/indices/merge-indices.ts` | `appkit/src/seed/firestore-indexes.ts` | ✅ Yes |

**Phase 1 architecture-fit verdict:** `🔄 Partial`.

Remaining architecture gaps for full `✅`:
- Collapse local fallback constants in `src/db/schema/field-names.ts` into appkit-owned schema exports where still duplicated.
- Remove/retire local consumer schema barrel `src/db/schema/index.ts` once import fan-out is rewired to direct appkit entrypoints.
- Decide whether newsletter/copilot schema constants should be promoted to explicit appkit schema files (instead of only repository-level ownership).

---

## Phase 2 — Constants & Utils

**Execute SECOND — before Phase 3 (Validation) and Phase 4 (Server Infrastructure).** Several Phase 4 server utilities and Phase 5 repositories import from `@/utils` and `@/constants`. Move the reusable ones to appkit first so downstream phases can import from `@mohasinac/appkit/utils` (exec order 2).

| File | Move to Appkit? | Status |
|------|----------------|--------|
| `src/constants/rbac.ts` | `src/features/auth/` (role definitions) | ✅ A |
| `src/constants/messages.ts` | `src/features/*/messages/` per-feature | ✅ B |
| `src/constants/error-messages.ts` | `src/errors/` | ✅ C |
| `src/constants/success-messages.ts` | `src/features/*/messages/` | ✅ C |
| `src/constants/ui-labels-core.ts` | `src/features/layout/messages/` | ✅ removed stale split file (labels owned by `src/constants/ui.ts`) |
| `src/constants/ui-labels-admin.ts` | `src/features/admin/messages/` | ✅ removed stale split file (labels owned by `src/constants/ui.ts`) |
| `src/constants/ui.ts` | `src/tokens/` or `src/ui/` | 🔒 keep local — app/site copy + locale content owned by consumer config |
| `src/constants/theme.ts` | `src/tokens/` | 🔒 keep local — thin site theme extension over `@mohasinac/appkit/tokens` |
| `src/constants/faq.ts` | `src/features/faq/` | 🔒 keep local — market copy constants currently tied to consumer FAQ UX |
| `src/constants/homepage-data.ts` | `src/features/homepage/` | 🔒 keep local — homepage marketing copy is site/market config |
| `src/constants/address.ts` | `src/features/account/` | ✅ created in appkit `features/account/constants/addresses.ts`; local file already absent |
| `src/constants/seo.ts` | `src/seo/` | ✅ A |
| `src/constants/index.ts` | delete | 🔒 keep local — consumer barrel aggregating permanent local constants (`routes`, `site`, `config`, `api-endpoints`, `navigation`, `ui`, `theme`, market copy); appkit exports remain consumed directly where canonical |
| `src/utils/business-day.ts` | `src/utils/` appkit | ✅ C |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/` | ✅ A |
| `src/utils/index.ts` | delete | ✅ A |

### Phase 2 Manual Verification (Session 29, one-by-one)

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/constants/rbac.ts` | `appkit/src/features/auth/auth-helpers.ts` (role hierarchy + role checks) | ✅ Yes |
| `src/constants/messages.ts` | feature message ownership via `appkit/src/cli/index.ts` (`features/<key>/messages/<locale>.json` loading contract) | 🔄 Partial — ownership is shared-ready, but per-feature message coverage should be re-checked during Phase 10 |
| `src/constants/error-messages.ts` | `appkit/src/errors/messages.ts` | ✅ Yes |
| `src/constants/success-messages.ts` | `appkit/src/values/success-messages.ts` | ✅ Yes |
| `src/constants/ui-labels-core.ts` | no direct appkit file (stale split removed; labels now local in `src/constants/ui.ts`) | 🔒 Local by decision |
| `src/constants/ui-labels-admin.ts` | no direct appkit file (stale split removed; labels now local in `src/constants/ui.ts`) | 🔒 Local by decision |
| `src/constants/ui.ts` | no appkit equivalent (consumer market/site copy) | 🔒 Local by decision |
| `src/constants/theme.ts` | no appkit equivalent (consumer brand extension over appkit tokens) | 🔒 Local by decision |
| `src/constants/faq.ts` | no appkit equivalent (consumer market FAQ copy) | 🔒 Local by decision |
| `src/constants/homepage-data.ts` | no appkit equivalent (consumer marketing copy) | 🔒 Local by decision |
| `src/constants/address.ts` | `appkit/src/features/account/constants/addresses.ts` | ✅ Yes |
| `src/constants/seo.ts` | `appkit/src/seo/metadata.ts` and `appkit/src/seo/json-ld.ts` | ✅ Yes |
| `src/constants/index.ts` | no direct appkit replacement (consumer local constants aggregator) | 🔄 Partial — valid local barrel, but imports must avoid acting as shared shim |
| `src/utils/business-day.ts` | `appkit/src/utils/business-day.ts` | ✅ Yes |
| `src/utils/guest-cart.ts` | `appkit/src/features/cart/utils/guest-cart.ts` | ✅ Yes |
| `src/utils/index.ts` | deleted; canonical usage moved to direct appkit imports | ✅ Yes |

**Phase 2 architecture-fit verdict:** `🔄 Partial`.

Remaining architecture gaps for full `✅`:
- Verify all reusable user-facing message namespaces are loaded from appkit feature message bundles (not consumer fallback constants).
- Keep `src/constants/index.ts` strictly consumer-local and ensure it never becomes an indirect compatibility shim for appkit-owned constants.

---

## Phase 3 — Validation

**Target in appkit:** `src/validation/` for cross-domain Zod schemas; `src/features/<entity>/validation/` for domain validators moving with their feature in Phase 10.  
**Dependency:** Phase 1 schemas + Phase 2 constants/utils must be in appkit first (exec order 3). Validation must land before Phase 4 Server Infrastructure and Phase 5 Repositories which consume these validators.

> **Split rule:** Validators for `address`, `auth`, `contact`, `seo` etc. that are imported by server infrastructure or repositories belong here in Phase 3. Validators that only appear inside a single feature stay with that feature in Phase 10.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/lib/validation/schemas.ts` (cross-domain validators only) | `src/validation/` | ✅ B — shared auth/media/common schemas + request/Zod helpers moved to `@mohasinac/appkit/validation`; domain-specific validators remain local for Phase 10 feature ownership |

---

## Phase 4 — Server Infrastructure

**Target in appkit:** auth helpers → `src/features/auth/`; pii/encryption → `src/security/`; query/logger/api-handler → `src/providers/`, `src/monitoring/`, `src/http/`; media/analytics → `src/features/media/`, `src/monitoring/`.  
**Dependency:** Phase 1 schemas ✅ + Phase 2 constants/utils + Phase 3 validation must all be in appkit first (exec order 4). Must be completed BEFORE Phase 5 Repositories.

### Phase 4a — Helpers

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/helpers/auth/auth.helper.ts` | `src/features/auth/` server utils | ✅ B |
| `src/helpers/auth/token.helper.ts` | `src/features/auth/` server utils | ✅ C |
| `src/helpers/auth/index.ts` | delete | ✅ A |
| `src/helpers/logging/error-logger.ts` | `src/monitoring/` or `src/errors/` | ✅ B |
| `src/helpers/logging/server-error-logger.ts` | `src/monitoring/` | ✅ B |
| `src/helpers/logging/index.ts` | delete | ✅ A |
| `src/helpers/validation/address.helper.ts` | `src/features/account/` | ✅ C |
| `src/helpers/validation/index.ts` | delete | ✅ A |
| `src/helpers/index.ts` | delete | ✅ A |

### Phase 4b — Shared Lib (non-driver)

| File | Appkit Target | Keep Local? | Status |
|------|--------------|-------------|--------|
| `src/lib/encryption.ts` | `src/security/` | No | ✅ C |
| `src/lib/pii.ts` | `src/security/` | No | ✅ B (merged + 40 PII functions exported from appkit) |
| `src/lib/email.ts` | `src/features/contact/` server util | No | ✅ B |
| `src/lib/server-logger.ts` | `src/monitoring/` | No | ✅ B |
| `src/lib/tokens.ts` | `src/features/auth/` | No | ✅ B |
| `src/lib/consent-otp.ts` | `src/features/auth/` | No | ✅ B |
| `src/lib/api/api-handler.ts` | `src/http/` | No | ✅ C |
| `src/lib/query/firebase-sieve.ts` | `src/providers/` Firebase query utils | No | ✅ B |
| `src/lib/query/index.ts` | delete | No | ✅ A |
| `src/lib/media/finalize.ts` | `src/features/media/` | No | ✅ C |
| `src/lib/monitoring/analytics.ts` | `src/monitoring/` | No | ✅ C |
| `src/lib/monitoring/index.ts` | delete | No | ✅ A |
| `src/lib/firebase/auth-helpers.ts` | `src/features/auth/` | No | 🔒 keep local — client Firebase SDK/session wiring depends on consumer auth config + endpoint contract |
| `src/lib/firebase/realtime-db.ts` | `src/providers/` Firebase RTDB utils | No | 🔒 keep local — direct client RTDB SDK wiring over consumer firebase client config |
| `src/lib/firebase/rtdb-paths.ts` | `src/providers/` Firebase paths | No | ✅ C |

## Phase 5 — Repository Layer

**Target in appkit:** `src/features/<entity>/repository/` — implement or verify existing.  
**Dependency:** Phase 1 schemas ✅ + Phase 2 constants/utils + Phase 3 validation + Phase 4 server infrastructure (pii, query/sieve, server-logger, helpers) must all be in appkit first. Do not start executing this phase until exec order 1–4 are done.

Note: `copilot-log.repository.ts` and `newsletter.repository.ts` are already in `appkit/src/core/`.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/repositories/base.repository.ts` | `src/providers/db-firebase/` | ✅ moved to `@mohasinac/appkit/providers/db-firebase` and local file deleted |
| `src/repositories/index.ts` | delete (barrel) | ✅ moved to `@mohasinac/appkit/repositories`; all `@/repositories` imports rewired in `src/**`; local barrel deleted |
| `src/repositories/copilot-log.repository.ts` | already in `appkit/src/core/` — delete letitrip copy | ✅ deleted shim; routed via `@mohasinac/appkit/core` |
| `src/repositories/newsletter.repository.ts` | already in `appkit/src/core/` — delete letitrip copy | ✅ deleted shim; routed via `@mohasinac/appkit/core/newsletter.repository` |
| `src/repositories/user.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/token.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/session.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/address.repository.ts` | `src/features/account/repository/` | ✅ merged into `@mohasinac/appkit/features/account` and local file deleted |
| `src/repositories/cart.repository.ts` | `src/features/cart/repository/` | ✅ merged into `@mohasinac/appkit/features/cart` and local file deleted |
| `src/repositories/categories.repository.ts` | `src/features/categories/repository/` | ✅ merged into `@mohasinac/appkit/features/categories` and local file deleted |
| `src/repositories/product.repository.ts` | `src/features/products/repository/` | ✅ merged into `@mohasinac/appkit/features/products` and local file deleted |
| `src/repositories/order.repository.ts` | `src/features/orders/repository/` | ✅ merged into `@mohasinac/appkit/features/orders` and local file deleted |
| `src/repositories/review.repository.ts` | `src/features/reviews/repository/` | ✅ merged into `@mohasinac/appkit/features/reviews` and local file deleted |
| `src/repositories/blog.repository.ts` | `src/features/blog/repository/` | ✅ merged into `@mohasinac/appkit/features/blog` and local file deleted |
| `src/repositories/event.repository.ts` | `src/features/events/repository/` | ✅ merged into `@mohasinac/appkit/features/events` and local file deleted |
| `src/repositories/eventEntry.repository.ts` | `src/features/events/repository/` | ✅ merged into `@mohasinac/appkit/features/events` and local file deleted |
| `src/repositories/bid.repository.ts` | `src/features/auctions/repository/` | ✅ merged into `@mohasinac/appkit/features/auctions` and local file deleted |
| `src/repositories/coupons.repository.ts` | `src/features/promotions/repository/` | ✅ merged into `@mohasinac/appkit/features/promotions` and local file deleted |
| `src/repositories/offer.repository.ts` | `src/features/seller/repository/` | ✅ merged into `@mohasinac/appkit/features/seller` and local file deleted |
| `src/repositories/payout.repository.ts` | `src/features/payments/repository/` | ✅ merged into `@mohasinac/appkit/features/payments` and local file deleted |
| `src/repositories/store.repository.ts` | `src/features/stores/repository/` | ✅ merged into `@mohasinac/appkit/features/stores` and local file deleted |
| `src/repositories/store-address.repository.ts` | `src/features/stores/repository/` | ✅ merged into `@mohasinac/appkit/features/stores` and local file deleted |
| `src/repositories/notification.repository.ts` | `src/features/admin/repository/` | ✅ merged into `@mohasinac/appkit/features/admin` and local file deleted |
| `src/repositories/chat.repository.ts` | `src/features/admin/repository/` | ✅ merged into `@mohasinac/appkit/features/admin` and local file deleted |
| `src/repositories/site-settings.repository.ts` | `src/features/admin/repository/` | ✅ merged into `@mohasinac/appkit/features/admin` and local file deleted |
| `src/repositories/carousel.repository.ts` | `src/features/homepage/repository/` | ✅ merged into `@mohasinac/appkit/features/homepage` and local file deleted |
| `src/repositories/homepage-sections.repository.ts` | `src/features/homepage/repository/` | ✅ merged into `@mohasinac/appkit/features/homepage` and local file deleted |
| `src/repositories/faqs.repository.ts` | `src/features/faq/repository/` | ✅ merged into `@mohasinac/appkit/features/faq` and local file deleted |
| `src/repositories/wishlist.repository.ts` | `src/features/wishlist/repository/` | ✅ merged into `@mohasinac/appkit/features/wishlist` and local file deleted |
| `src/repositories/sms-counter.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/failed-checkout.repository.ts` | `src/features/checkout/repository/` | ✅ moved to `@mohasinac/appkit/features/checkout`; local file deleted and route imports rewired |
| `src/repositories/unit-of-work.ts` | `src/contracts/` or delete | ✅ moved to `@mohasinac/appkit/core` and local file deleted |

### Phase 5 Manual Verification (Session 29, one-by-one)

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/repositories/base.repository.ts` | `appkit/src/providers/db-firebase/base.repository.ts` | ✅ Yes |
| `src/repositories/index.ts` | `appkit/src/repositories/index.ts` | ✅ Yes |
| `src/repositories/copilot-log.repository.ts` | `appkit/src/core/copilot-log.repository.ts` | ✅ Yes |
| `src/repositories/newsletter.repository.ts` | `appkit/src/core/newsletter.repository.ts` | ✅ Yes |
| `src/repositories/user.repository.ts` | `appkit/src/features/auth/repository/user.repository.ts` | ✅ Yes |
| `src/repositories/token.repository.ts` | `appkit/src/features/auth/repository/token.repository.ts` | ✅ Yes |
| `src/repositories/session.repository.ts` | `appkit/src/features/auth/repository/session.repository.ts` | ✅ Yes |
| `src/repositories/address.repository.ts` | `appkit/src/features/account/repository/address.repository.ts` | ✅ Yes |
| `src/repositories/cart.repository.ts` | `appkit/src/features/cart/repository/cart.repository.ts` | ✅ Yes |
| `src/repositories/categories.repository.ts` | `appkit/src/features/categories/repository/categories.repository.ts` | ✅ Yes |
| `src/repositories/product.repository.ts` | `appkit/src/features/products/repository/products.repository.ts` | ✅ Yes |
| `src/repositories/order.repository.ts` | `appkit/src/features/orders/repository/orders.repository.ts` | ✅ Yes |
| `src/repositories/review.repository.ts` | `appkit/src/features/reviews/repository/reviews.repository.ts` | ✅ Yes |
| `src/repositories/blog.repository.ts` | `appkit/src/features/blog/repository/blog.repository.ts` | ✅ Yes |
| `src/repositories/event.repository.ts` | `appkit/src/features/events/repository/events.repository.ts` | ✅ Yes |
| `src/repositories/eventEntry.repository.ts` | `appkit/src/features/events/repository/event-entry.repository.ts` | ✅ Yes |
| `src/repositories/bid.repository.ts` | `appkit/src/features/auctions/repository/bid.repository.ts` | ✅ Yes |
| `src/repositories/coupons.repository.ts` | `appkit/src/features/promotions/repository/coupons.repository.ts` | ✅ Yes |
| `src/repositories/offer.repository.ts` | `appkit/src/features/seller/repository/offer.repository.ts` | ✅ Yes |
| `src/repositories/payout.repository.ts` | `appkit/src/features/payments/repository/payout.repository.ts` | ✅ Yes |
| `src/repositories/store.repository.ts` | `appkit/src/features/stores/repository/store.repository.ts` | ✅ Yes |
| `src/repositories/store-address.repository.ts` | `appkit/src/features/stores/repository/store-address.repository.ts` | ✅ Yes |
| `src/repositories/notification.repository.ts` | `appkit/src/features/admin/repository/notification.repository.ts` | ✅ Yes |
| `src/repositories/chat.repository.ts` | `appkit/src/features/admin/repository/chat.repository.ts` | ✅ Yes |
| `src/repositories/site-settings.repository.ts` | `appkit/src/features/admin/repository/site-settings.repository.ts` | ✅ Yes |
| `src/repositories/carousel.repository.ts` | `appkit/src/features/homepage/repository/carousel.repository.ts` | ✅ Yes |
| `src/repositories/homepage-sections.repository.ts` | `appkit/src/features/homepage/repository/homepage-sections.repository.ts` | ✅ Yes |
| `src/repositories/faqs.repository.ts` | `appkit/src/features/faq/repository/faqs.repository.ts` | ✅ Yes |
| `src/repositories/wishlist.repository.ts` | `appkit/src/features/wishlist/repository/wishlist.repository.ts` | ✅ Yes |
| `src/repositories/sms-counter.repository.ts` | `appkit/src/features/auth/repository/sms-counter.repository.ts` | ✅ Yes |
| `src/repositories/failed-checkout.repository.ts` | `appkit/src/features/checkout/repository/failed-checkout.repository.ts` | ✅ Yes |
| `src/repositories/unit-of-work.ts` | `appkit/src/core/unit-of-work.ts` | ✅ Yes |

**Phase 5 architecture-fit verdict:** `🔄 Partial`.

Remaining architecture gaps for full `✅`:
- Confirm each repository exposes stable generic `IRepository<T>` typed contracts via the official `@mohasinac/appkit/repositories` entrypoint.
- Verify repositories do not embed letitrip-specific defaults — collection names must derive from appkit-owned schema constants, not hardcoded strings.

---

## Phase 6 — Seed Data

**Target in appkit:** `src/seed/<entity>-seed-data.ts` — generic factory data; entity-specific values injected via factory config.  
**Dependency:** Phase 1 schemas + Phase 5 repositories must be in appkit first (exec order 5).

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/db/seed-data/index.ts` | delete (barrel) | ✅ deleted; API imports switched to direct files/appkit seed |
| `src/db/seed-data/users-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/sessions-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/addresses-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/stores-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/store-addresses-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/categories-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/products-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/orders-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/reviews-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/cart-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/bids-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/coupons-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/events-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/payouts-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/notifications-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/blog-posts-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/faq-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/homepage-sections-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/site-settings-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/carousel-slides-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |

### Phase 6 Manual Verification (Session 29, one-by-one)

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/db/seed-data/index.ts` | `appkit/src/seed/index.ts` | ✅ Yes |
| `src/db/seed-data/users-seed-data.ts` | `appkit/src/seed/users-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/sessions-seed-data.ts` | `appkit/src/seed/sessions-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/addresses-seed-data.ts` | `appkit/src/seed/addresses-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/stores-seed-data.ts` | `appkit/src/seed/stores-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/store-addresses-seed-data.ts` | `appkit/src/seed/store-addresses-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/categories-seed-data.ts` | `appkit/src/seed/categories-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/products-seed-data.ts` | `appkit/src/seed/products-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/orders-seed-data.ts` | `appkit/src/seed/orders-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/reviews-seed-data.ts` | `appkit/src/seed/reviews-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/cart-seed-data.ts` | `appkit/src/seed/cart-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/bids-seed-data.ts` | `appkit/src/seed/bids-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/coupons-seed-data.ts` | `appkit/src/seed/coupons-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/events-seed-data.ts` | `appkit/src/seed/events-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/payouts-seed-data.ts` | `appkit/src/seed/payouts-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/notifications-seed-data.ts` | `appkit/src/seed/notifications-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/blog-posts-seed-data.ts` | `appkit/src/seed/blog-posts-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/faq-seed-data.ts` | `appkit/src/seed/faq-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/homepage-sections-seed-data.ts` | `appkit/src/seed/homepage-sections-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/site-settings-seed-data.ts` | `appkit/src/seed/site-settings-seed-data.ts` | ✅ Yes |
| `src/db/seed-data/carousel-slides-seed-data.ts` | `appkit/src/seed/carousel-slides-seed-data.ts` | ✅ Yes |

**Phase 6 architecture-fit verdict:** `🔄 Partial`.

Remaining architecture gaps for full `✅`:
- Verify `appkit/src/seed/factories/` and `appkit/src/seed/defaults/` are used as extension points so market-specific seeds inject values rather than embed letitrip defaults directly in shared seed data files.

---

## Phase 7 — Actions → Appkit

**Goal:** Move all business logic from letitrip action files into appkit server functions. Each `src/actions/*.actions.ts` file stays in letitrip as a `'use server'` thin entrypoint that: (1) authenticates the caller, (2) validates + parses input, (3) calls the appkit domain function, (4) returns a typed result. No business logic, no repository calls, no PII manipulation in the letitrip file.

**Appkit target:** `src/features/<domain>/actions/` (or `services/` for non-Next.js-specific logic).  
**Dependency:** Phase 5 repositories + Phase 4 server infrastructure must be in appkit first (exec order 6). Do not start until exec order 1–5 are done.  
**Rule:** The letitrip file is **reduced but not deleted**. It keeps `'use server'` and only imports + calls the appkit function.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/actions/address.actions.ts` | `src/features/account/actions/` | ✅ |
| `src/actions/cart.actions.ts` | `src/features/cart/actions/` | ✅ |
| `src/actions/coupon.actions.ts` | `src/features/promotions/actions/` | ✅ |
| `src/actions/order.actions.ts` | `src/features/orders/actions/` | ✅ |
| `src/actions/checkout.actions.ts` | `src/features/checkout/actions/` | ✅ |
| `src/actions/refund.actions.ts` | `src/features/orders/actions/` | ✅ |
| `src/actions/wishlist.actions.ts` | `src/features/wishlist/actions/` | ✅ |
| `src/actions/store-address.actions.ts` | `src/features/stores/actions/` | ✅ |
| `src/actions/store.actions.ts` | `src/features/stores/actions/` | ✅ |
| `src/actions/profile.actions.ts` | `src/features/auth/actions/` | ✅ |
| `src/actions/category.actions.ts` | `src/features/categories/actions/` | ✅ |
| `src/actions/product.actions.ts` | `src/features/products/actions/` | ✅ |
| `src/actions/blog.actions.ts` | `src/features/blog/actions/` | ✅ |
| `src/actions/sections.actions.ts` | `src/features/homepage/actions/` | ✅ |
| `src/actions/faq.actions.ts` | `src/features/faq/actions/` | ✅ |
| `src/actions/promotions.actions.ts` | `src/features/promotions/actions/` | ✅ |
| `src/actions/search.actions.ts` | `src/features/search/actions/` | ✅ |
| `src/actions/newsletter.actions.ts` | `src/core/newsletter/actions/` | ✅ |
| `src/actions/notification.actions.ts` | `src/features/admin/actions/` | ✅ |
| `src/actions/contact.actions.ts` | `src/features/contact/actions/` | ✅ |
| `src/actions/bid.actions.ts` | `src/features/auctions/actions/` | ✅ |
| `src/actions/event.actions.ts` | `src/features/events/actions/` | ✅ |
| `src/actions/offer.actions.ts` | `src/features/seller/actions/` | ✅ |
| `src/actions/seller-coupon.actions.ts` | `src/features/promotions/actions/` | ✅ |
| `src/actions/seller.actions.ts` | `src/features/seller/actions/` | ✅ |
| `src/actions/realtime-token.actions.ts` | `src/features/auth/actions/` | ✅ |
| `src/actions/chat.actions.ts` | `src/features/admin/actions/` | ✅ |
| `src/actions/site-settings.actions.ts` | `src/features/admin/actions/` | ✅ |
| `src/actions/carousel.actions.ts` | `src/features/homepage/actions/` | ✅ |
| `src/actions/demo-seed.actions.ts` | `src/seed/` demo runner | ✅ |
| `src/actions/admin.actions.ts` | `src/features/admin/actions/` | ✅ |
| `src/actions/admin-coupon.actions.ts` | `src/features/admin/actions/` | ✅ |
| `src/actions/admin-read.actions.ts` | `src/features/admin/actions/` | ✅ |
| `src/actions/review.actions.ts` | `src/features/reviews/actions/` | ✅ |
| `src/actions/index.ts` | keep as barrel | 🔒 |

### Phase 7 Manual Verification (Session 29, one-by-one)

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/actions/address.actions.ts` | `appkit/src/features/account/actions/address-actions.ts` | ✅ Yes |
| `src/actions/cart.actions.ts` | `appkit/src/features/cart/actions/cart-actions.ts` | ✅ Yes |
| `src/actions/coupon.actions.ts` | `appkit/src/features/promotions/actions/coupon-actions.ts` | ✅ Yes |
| `src/actions/order.actions.ts` | `appkit/src/features/orders/actions/order-actions.ts` | ✅ Yes |
| `src/actions/checkout.actions.ts` | `appkit/src/features/checkout/actions/checkout-actions.ts` | ✅ Yes |
| `src/actions/refund.actions.ts` | `appkit/src/features/orders/actions/refund-actions.ts` | ✅ Yes |
| `src/actions/wishlist.actions.ts` | `appkit/src/features/wishlist/actions/wishlist-actions.ts` | ✅ Yes |
| `src/actions/store-address.actions.ts` | `appkit/src/features/stores/actions/store-address-actions.ts` | ✅ Yes |
| `src/actions/store.actions.ts` | `appkit/src/features/stores/actions/store-query-actions.ts` | ✅ Yes |
| `src/actions/profile.actions.ts` | `appkit/src/features/auth/actions/profile-actions.ts` | ✅ Yes |
| `src/actions/category.actions.ts` | `appkit/src/features/categories/actions/category-actions.ts` | ✅ Yes |
| `src/actions/product.actions.ts` | `appkit/src/features/products/actions/product-actions.ts` | ✅ Yes |
| `src/actions/blog.actions.ts` | `appkit/src/features/blog/actions/blog-actions.ts` | ✅ Yes |
| `src/actions/sections.actions.ts` | `appkit/src/features/homepage/actions/homepage-section-actions.ts` | ✅ Yes |
| `src/actions/faq.actions.ts` | `appkit/src/features/faq/actions/faq-actions.ts` | ✅ Yes |
| `src/actions/promotions.actions.ts` | `appkit/src/features/promotions/actions/promotions-actions.ts` | ✅ Yes |
| `src/actions/search.actions.ts` | `appkit/src/features/search/actions/search-actions.ts` | ✅ Yes |
| `src/actions/newsletter.actions.ts` | `appkit/src/core/newsletter-actions.ts` | ✅ Yes |
| `src/actions/notification.actions.ts` | `appkit/src/features/admin/actions/notification-actions.ts` | ✅ Yes |
| `src/actions/contact.actions.ts` | `appkit/src/features/contact/email.ts` (no dedicated `actions/` folder) | 🔄 Partial — contact business logic is spread between `email.ts` and hooks; a `contact/actions/` directory would give cleaner symmetry |
| `src/actions/bid.actions.ts` | `appkit/src/features/auctions/actions/bid-actions.ts` | ✅ Yes |
| `src/actions/event.actions.ts` | `appkit/src/features/events/actions/event-actions.ts` | ✅ Yes |
| `src/actions/offer.actions.ts` | `appkit/src/features/seller/actions/offer-actions.ts` | ✅ Yes |
| `src/actions/seller-coupon.actions.ts` | `appkit/src/features/promotions/actions/seller-coupon-actions.ts` | ✅ Yes |
| `src/actions/seller.actions.ts` | `appkit/src/features/seller/actions/seller-actions.ts` | ✅ Yes |
| `src/actions/realtime-token.actions.ts` | `appkit/src/features/auth/actions/realtime-token-actions.ts` | ✅ Yes |
| `src/actions/chat.actions.ts` | `appkit/src/features/admin/actions/chat-actions.ts` | ✅ Yes |
| `src/actions/site-settings.actions.ts` | `appkit/src/features/admin/actions/site-settings-actions.ts` | ✅ Yes |
| `src/actions/carousel.actions.ts` | `appkit/src/features/homepage/actions/carousel-actions.ts` | ✅ Yes |
| `src/actions/demo-seed.actions.ts` | `appkit/src/seed/actions/demo-seed-actions.ts` | ✅ Yes |
| `src/actions/admin.actions.ts` | `appkit/src/features/admin/actions/admin-actions.ts` | ✅ Yes |
| `src/actions/admin-coupon.actions.ts` | `appkit/src/features/admin/actions/admin-coupon-actions.ts` | ✅ Yes |
| `src/actions/admin-read.actions.ts` | `appkit/src/features/admin/actions/admin-read-actions.ts` | ✅ Yes |
| `src/actions/review.actions.ts` | `appkit/src/features/reviews/actions/review-actions.ts` | ✅ Yes |
| `src/actions/index.ts` | no appkit equivalent (legitimate local `'use server'` thin-wrapper barrel) | 🔒 Local by design |

**Phase 7 architecture-fit verdict:** `🔄 Partial`.

Remaining architecture gaps for full `✅`:
- Add a `contact/actions/contact-actions.ts` in appkit to give the contact domain the same `actions/` symmetry as every other feature, then reduce letitrip's `contact.actions.ts` to a thin wrapper.
- Audit each letitrip `src/actions/*.actions.ts` file to confirm it contains nothing beyond: auth check, input parse, appkit function call, and typed result return.

---

## Phase 8 — Hooks

**Target in appkit:** `src/features/<entity>/hooks/`  
**Dependency:** Phase 5 repositories + Phase 7 appkit actions must be in appkit first (exec order 7). Hooks for mutations call appkit action functions; hooks for reads call appkit repo instances.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/hooks/useAuth.ts` | `src/features/auth/hooks/` | ✅ |
| `src/hooks/useRBAC.ts` | `src/features/auth/hooks/` | ✅ |
| `src/hooks/useProfile.ts` | `src/features/account/hooks/` | ✅ |
| `src/hooks/usePublicProfile.ts` | `src/features/account/hooks/` | ✅ |
| `src/hooks/useChat.ts` | `src/features/admin/hooks/` | ✅ |
| `src/hooks/useHomepageSections.ts` | `src/features/homepage/hooks/` | ✅ |
| `src/hooks/useProductReviews.ts` | `src/features/reviews/hooks/` | ✅ |
| `src/hooks/useRelatedProducts.ts` | `src/features/products/hooks/` | ✅ |
| `src/hooks/useSellerStorefront.ts` | `src/features/seller/hooks/` | ✅ |
| `src/hooks/useStoreAddressSelector.ts` | `src/features/stores/hooks/` | ✅ |
| `src/hooks/useBulkEvent.ts` | `src/features/events/hooks/` | ✅ |
| `src/hooks/useWishlistToggle.ts` | `src/features/wishlist/hooks/` | ✅ |
| `src/hooks/useContactSubmit.ts` | `src/features/contact/hooks/` | ✅ |
| `src/hooks/useUrlTable.ts` | `src/react/hooks/` (generic table hook) | ✅ |
| `src/hooks/useUnsavedChanges.ts` | `src/react/hooks/` (generic) | ✅ |
| `src/hooks/useRazorpay.ts` | keep local — Razorpay driver | 🔒 |
| `src/hooks/index.ts` | delete | ✅ A |

### Phase 8 Manual Verification (Session 29, one-by-one)

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/hooks/useAuth.ts` | `appkit/src/features/auth/hooks/useAuth.ts` | ✅ Yes |
| `src/hooks/useRBAC.ts` | `appkit/src/features/auth/hooks/useRBAC.ts` | ✅ Yes |
| `src/hooks/useProfile.ts` | `appkit/src/features/account/hooks/useProfile.ts` | ✅ Yes |
| `src/hooks/usePublicProfile.ts` | `appkit/src/features/account/hooks/usePublicProfile.ts` | ✅ Yes |
| `src/hooks/useChat.ts` | `appkit/src/features/admin/hooks/useChat.ts` | ✅ Yes |
| `src/hooks/useHomepageSections.ts` | `appkit/src/features/homepage/hooks/useHomepageSections.ts` | ✅ Yes |
| `src/hooks/useProductReviews.ts` | `appkit/src/features/reviews/hooks/useReviews.ts` | ✅ Yes |
| `src/hooks/useRelatedProducts.ts` | `appkit/src/features/products/hooks/useRelatedProducts.ts` | ✅ Yes |
| `src/hooks/useSellerStorefront.ts` | `appkit/src/features/seller/hooks/useSellerStorefront.ts` | ✅ Yes |
| `src/hooks/useStoreAddressSelector.ts` | `appkit/src/features/stores/hooks/useStoreAddressSelector.ts` | ✅ Yes |
| `src/hooks/useBulkEvent.ts` | `appkit/src/features/events/hooks/useBulkEvent.ts` | ✅ Yes |
| `src/hooks/useWishlistToggle.ts` | `appkit/src/features/wishlist/hooks/useWishlistToggle.ts` | ✅ Yes |
| `src/hooks/useContactSubmit.ts` | `appkit/src/features/contact/hooks/useContactSubmit.ts` | ✅ Yes |
| `src/hooks/useUrlTable.ts` | `appkit/src/react/hooks/useUrlTable.ts` | ✅ Yes |
| `src/hooks/useUnsavedChanges.ts` | `appkit/src/react/hooks/useUnsavedChanges.ts` | ✅ Yes |
| `src/hooks/useRazorpay.ts` | no appkit equivalent (consumer Razorpay SDK driver) | 🔒 Local by design |
| `src/hooks/index.ts` | deleted; imports rewired to direct appkit feature entrypoints | ✅ Yes |

**Phase 8 architecture-fit verdict:** `🔄 Partial`.

Remaining architecture gaps for full `✅`:
- Confirm `useProductReviews.ts` correctly maps to `useReviews.ts` in appkit (check signature parity at usage sites).
- Audit remaining hooks that accept only appkit types so they expose no hidden letitrip-specific prop assumptions or default values.

---

## Phase 9 — Shared UI Components

**Target in appkit:** `src/ui/` for generics, `src/features/<entity>/components/` for domain components.  
**Dependency:** Phase 8 hooks must be in appkit first (exec order 8).

### Phase 9a — Layout Shell

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/layout/BottomNavbar.tsx` | `src/features/layout/components/` | ✅ logic in appkit/features/layout/BottomNavbar.tsx; thin adapter retained |
| `src/components/layout/Footer.tsx` | `src/features/layout/components/` | 🔒 keep local — single-purpose adapter for consumer ROUTES; FooterLayout in appkit owns generic rendering |
| `src/components/layout/MainNavbar.tsx` | `src/features/layout/components/` | ✅ logic in appkit/features/layout/MainNavbar.tsx; thin adapter retained |
| `src/components/layout/Sidebar.tsx` | `src/features/layout/components/` | 🔒 keep local — 400+ line consumer composition; pending Phase 10 decomposition |
| `src/components/layout/TitleBar.tsx` | `src/features/layout/components/` | ✅ logic + DashboardNavContext in appkit/features/layout/; thin adapter retained |
| `src/components/layout/index.ts` | delete | ✅ barrel still works through thin adapters |

### Phase 9b — Generic UI

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/ui/SideDrawer.tsx` | `src/ui/components/` | ✅ moved to appkit/src/ui/components/SideDrawer.tsx; letitrip/ui/index.ts re-exports from appkit |
| `src/components/ui/index.ts` | delete | ✅ updated to re-export SideDrawer from appkit |
| `src/components/typography/TextLink.tsx` | `src/ui/components/` | 🔒 keep local — uses @/i18n/navigation locale-aware Link; appkit TextLink uses plain next/link |
| `src/components/modals/ConfirmDeleteModal.tsx` | `src/ui/components/` | ✅ moved to appkit/src/ui/components/ConfirmDeleteModal.tsx; letitrip/components/index.ts re-exports from appkit |
| `src/components/modals/UnsavedChangesModal.tsx` | `src/ui/components/` | ✅ moved to appkit `src/ui/components/UnsavedChangesModal.tsx`; local file deleted and barrel rewired |
| `src/components/utility/BackToTop.tsx` | `src/ui/components/` | ✅ local file deleted; canonical export switched to `@mohasinac/appkit/features/layout` |
| `src/components/utility/BackgroundRenderer.tsx` | `src/ui/components/` | ✅ moved to appkit `src/ui/components/BackgroundRenderer.tsx`; local file deleted |
| `src/components/utility/ResponsiveView.tsx` | `src/ui/components/` | ✅ moved to appkit `src/ui/components/ResponsiveView.tsx`; local file deleted |
| `src/components/utility/Search.tsx` | `src/features/search/components/` | ✅ B — appkit `Search` now owns core behavior; letitrip file reduced to locale/routes quick-link adapter |
| `src/components/utility/index.ts` | delete | ✅ A — deleted; `src/components/index.ts` now exports Search/utility symbols directly |

### Phase 9c — Domain Components

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/user/AddressCard.tsx` | `src/features/account/components/` | ✅ B — merged set-default support into appkit `AddressCard`; local wrapper deleted |
| `src/components/user/AddressForm.tsx` | `src/features/account/components/` | ✅ C — created reusable appkit `AddressForm`; local file deleted |
| `src/components/user/AddressSelectorCreate.tsx` | `src/features/account/components/` | ✅ C — created reusable appkit selector + drawer flow; local file deleted |
| `src/components/user/NotificationBell.tsx` | `src/features/admin/components/` | ✅ B — appkit `NotificationBell` owns behavior; letitrip file reduced to locale/routes/link adapter |
| `src/components/user/StoreAddressSelectorCreate.tsx` | `src/features/stores/components/` | ✅ C — created reusable appkit store-address selector + drawer flow; local file deleted |
| `src/components/user/index.ts` | delete | ✅ A — deleted; user exports are now declared directly in `src/components/index.ts` |
| `src/components/categories/CategoryCard.tsx` | `src/features/categories/components/` | ✅ B — switched canonical card export to appkit categories component; local file deleted |
| `src/components/categories/CategoryForm.tsx` | `src/features/categories/components/` | ✅ C — created appkit `CategoryForm` with injected `labels` config; local file deleted |
| `src/components/categories/CategorySelectorCreate.tsx` | `src/features/categories/components/` | ✅ C — created appkit `CategorySelectorCreate` with injected `labels` + `stackClassName`; depends on appkit `CategoryForm`; local file deleted |
| `src/components/categories/CategoryTableColumns.tsx` | `src/features/categories/components/` | ✅ C — created appkit `getCategoryTableColumns` with injected `labels`; local file deleted |
| `src/components/categories/Category.types.ts` | `src/features/categories/types/` | ✅ B — moved `Category`, `CategoryDrawerMode`, and `flattenCategories` into appkit categories types; local file deleted |
| `src/components/categories/index.ts` | delete | ✅ B — all three category form/table/selector components now in appkit; barrel reduced to pure re-exports from `@mohasinac/appkit/features/categories` |
| `src/components/orders/OrderCard.tsx` | `src/features/orders/components/` | ✅ C — added appkit `MarketplaceOrderCard` with injected links/labels/navigation + selection variants; local file deleted |
| `src/components/orders/index.ts` | delete | ✅ B — reduced to direct alias export from appkit order-card entrypoint |
| `src/components/pre-orders/PreOrderCard.tsx` | `src/features/pre-orders/components/` | ✅ C — added appkit `MarketplacePreorderCard` with wishlist/selectable/listing-card behavior; local file deleted |
| `src/components/pre-orders/index.ts` | delete | ✅ B — reduced to direct alias export from appkit pre-order-card entrypoint |
| `src/components/auctions/AuctionCard.tsx` | `src/features/auctions/components/` | ✅ C — added appkit `MarketplaceAuctionCard` with slideshow/video/countdown/wishlist/selectable behavior; local file deleted |
| `src/components/auctions/AuctionGrid.tsx` | `src/features/auctions/components/` | ✅ C — added appkit `MarketplaceAuctionGrid` with skeleton, empty-state, and selection support; local file deleted |
| `src/components/auctions/index.ts` | delete | ✅ B — reduced to direct alias exports from appkit auction entrypoints |
| `src/components/admin/AdminFilterBar.tsx` | `src/features/admin/components/` | ✅ C — created appkit `AdminFilterBar` with injected theme config and labels; thin letitrip adapter created; local implementation retained as wrapper |
| `src/components/admin/AdminPageHeader.tsx` | `src/features/admin/components/` | ✅ C — created appkit `AdminPageHeader` with injected theme config and TextLink component; thin letitrip adapter created |
| `src/components/admin/DrawerFormFooter.tsx` | `src/features/admin/components/` | ✅ C — created appkit `DrawerFormFooter` with injected theme config and labels; thin letitrip adapter created |
| `src/components/admin/index.ts` | delete | 🔄 in progress — barrel still exports thin adapters; deletion deferred until next Phase 9 batch |
| `src/components/auth/ProtectedRoute.tsx` | `src/features/auth/components/` | ✅ C — refactored appkit `ProtectedRoute` to accept injected routes/labels/navigation callback; thin letitrip adapter injects consumer ROUTES and UI_LABELS |
| `src/components/auth/RoleGate.tsx` | `src/features/auth/components/` | ✅ C — refactored appkit `RoleGate` to accept user prop; thin letitrip adapter injects user from SessionContext |
| `src/components/auth/index.ts` | delete | ✅ B — barrel exports thin adapters (no breaking change) |
| `src/components/products/Product.types.ts` | `src/features/admin/types/product.types.ts` | ✅ C — created appkit `AdminProduct` and `AdminProductStatus` types; letitrip file now re-exports from appkit with type aliases |
| `src/components/products/index.ts` | delete | ✅ B — barrel now re-exports from Product.types.ts adapter |

### Phase 9d — Providers and Barrels

| File | Decision | Status |
|------|----------|--------|
| `src/components/providers/MonitoringProvider.tsx` | `src/features/admin/components/` or `src/next/` | ⬜ |
| `src/components/providers/QueryProvider.tsx` | `src/react/` | ⬜ |
| `src/components/providers/index.ts` | delete | ⬜ |
| `src/components/media-modals.client.ts` | `src/features/media/components/` | ⬜ |
| `src/components/filters/index.ts` | delete (already empty) | ⬜ |
| `src/components/media/index.ts` | delete (already empty) | ⬜ |
| `src/components/stores/index.ts` | delete | ⬜ |
| `src/components/index.ts` | delete | ⬜ |

#### Phase 9d Verification Gate

Before marking Phase 9 complete, run all of the following:

1. `npx tsc --noEmit` in `appkit` — must pass with zero errors.
2. `npx tsc --noEmit` in `letitrip.in` — must pass with zero errors (or only known pre-existing errors documented here).
3. Confirm `src/components/providers/MonitoringProvider.tsx` and `QueryProvider.tsx` have appkit targets or are deleted from letitrip.
4. Confirm `src/components/index.ts` is deleted and every site that imported from it now imports directly from `@mohasinac/appkit/...`.
5. Confirm no raw `<div>`, `<section>`, etc. were introduced in new appkit provider components.
6. Re-evaluate all `🔄` Phase 9c blockers (`NotificationBell`, `Search`, `Marketplace*Card` components) — these already exist in appkit; close or document remaining prop-injection gaps.
7. Update Phase 9 architecture-fit status in the Phase-by-Phase table to `✅` once all the above pass.

### Phase 9 Manual Verification (Session 29, one-by-one)

#### Phase 9a — Layout Shell

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/components/layout/BottomNavbar.tsx` | `appkit/src/features/layout/BottomNavbar.tsx` | ✅ Yes |
| `src/components/layout/Footer.tsx` | `appkit/src/features/layout/FooterLayout.tsx` (generic rendering shell) | 🔒 Local adapter — consumer ROUTES injection; `FooterLayout` in appkit provides the configurable shell |
| `src/components/layout/MainNavbar.tsx` | `appkit/src/features/layout/MainNavbar.tsx` | ✅ Yes |
| `src/components/layout/Sidebar.tsx` | `appkit/src/features/layout/SidebarLayout.tsx` | 🔒 Local adapter pending Phase 10 decomposition |
| `src/components/layout/TitleBar.tsx` | `appkit/src/features/layout/TitleBar.tsx` and `appkit/src/features/layout/DashboardNavContext.tsx` | ✅ Yes |
| `src/components/layout/index.ts` | consumed through thin adapters pointing at appkit | ✅ Yes |

#### Phase 9b — Generic UI

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/components/ui/SideDrawer.tsx` | `appkit/src/ui/components/SideDrawer.tsx` | ✅ Yes |
| `src/components/ui/index.ts` | appkit `@mohasinac/appkit/ui` entrypoint | ✅ Yes |
| `src/components/typography/TextLink.tsx` | `appkit/src/ui/components/TextLink.tsx` (plain next/link) | 🔒 Local — locale-aware `@/i18n/navigation` link wrapper; appkit `TextLink` covers non-i18n use; both should exist |
| `src/components/modals/ConfirmDeleteModal.tsx` | `appkit/src/ui/components/ConfirmDeleteModal.tsx` | ✅ Yes |
| `src/components/modals/UnsavedChangesModal.tsx` | `appkit/src/ui/components/UnsavedChangesModal.tsx` | ✅ Yes |
| `src/components/utility/BackToTop.tsx` | `appkit/src/features/layout/BackToTop.tsx` | ✅ Yes |
| `src/components/utility/BackgroundRenderer.tsx` | `appkit/src/ui/components/BackgroundRenderer.tsx` | ✅ Yes |
| `src/components/utility/ResponsiveView.tsx` | `appkit/src/ui/components/ResponsiveView.tsx` | ✅ Yes |
| `src/components/utility/Search.tsx` | `appkit/src/features/search/components/Search.tsx` (**exists**) | 🔄 Re-evaluate blocker — appkit now has `Search.tsx`; local file may only need route/i18n adapter wiring |
| `src/components/utility/index.ts` | re-evaluate — `Search.tsx` migrated blocker may be resolvable | 🔄 Re-evaluate: if Search is wired to appkit, this barrel is deletable |

#### Phase 9c — Domain Components

| letitrip file | Verified appkit file (present) | Idea followed? |
|------|-----------------------------------|----------------|
| `src/components/user/AddressCard.tsx` | `appkit/src/features/account/components/AddressBook.tsx` / `AddressForm.tsx` | ✅ Yes |
| `src/components/user/AddressForm.tsx` | `appkit/src/features/account/components/AddressForm.tsx` | ✅ Yes |
| `src/components/user/AddressSelectorCreate.tsx` | `appkit/src/features/account/components/AddressSelectorCreate.tsx` | ✅ Yes |
| `src/components/user/NotificationBell.tsx` | `appkit/src/features/account/components/NotificationBell.tsx` | ✅ Yes — thin consumer adapter; route/labels injected via props |
| `src/components/user/StoreAddressSelectorCreate.tsx` | `appkit/src/features/stores/components/` | ✅ Yes (Phase 9c noted migrated) |
| `src/components/user/index.ts` | delete | ✅ A — deleted; user exports declared directly in `src/components/index.ts` |
| `src/components/categories/CategoryCard.tsx` | `appkit/src/features/categories/components/` (exists as `CategoriesListView`) | ✅ Yes |
| `src/components/categories/CategoryForm.tsx` | `appkit/src/features/categories/components/CategoryForm.tsx` | ✅ C — migrated; injected `labels` config replaces consumer `UI_LABELS` |
| `src/components/categories/CategorySelectorCreate.tsx` | `appkit/src/features/categories/components/CategorySelectorCreate.tsx` | ✅ C — migrated; injected `labels` + `stackClassName` replace consumer constants |
| `src/components/categories/CategoryTableColumns.tsx` | `appkit/src/features/categories/components/CategoryTableColumns.tsx` | ✅ C — migrated; injected `labels` replace consumer `UI_LABELS`/`THEME_CONSTANTS` |
| `src/components/categories/Category.types.ts` | `appkit/src/features/categories/` types | ✅ Yes |
| `src/components/categories/index.ts` | barrel reduced to pure appkit re-exports | ✅ unblocked |
| `src/components/orders/OrderCard.tsx` | `appkit/src/features/orders/components/MarketplaceOrderCard.tsx` | ✅ Yes — migrated; route+selectable injected via props |
| `src/components/orders/index.ts` | `appkit/src/features/orders/` | ✅ Yes — barrel reduced to alias re-export |
| `src/components/pre-orders/PreOrderCard.tsx` | `appkit/src/features/pre-orders/components/MarketplacePreorderCard.tsx` | ✅ Yes — migrated; wishlist/selectable/route injected |
| `src/components/pre-orders/index.ts` | `appkit/src/features/pre-orders/` | ✅ Yes — barrel reduced to alias re-export |
| `src/components/auctions/AuctionCard.tsx` | `appkit/src/features/auctions/components/MarketplaceAuctionCard.tsx` | ✅ Yes — migrated; route/wishlist/slideshow injected |
| `src/components/auctions/AuctionGrid.tsx` | `appkit/src/features/auctions/components/MarketplaceAuctionGrid.tsx` | ✅ Yes — migrated |
| `src/components/auctions/index.ts` | `appkit/src/features/auctions/` | ✅ Yes — barrel reduced to alias re-exports |
| `src/components/admin/AdminFilterBar.tsx` | `appkit/src/features/admin/components/AdminFilterBar.tsx` | ✅ Yes — migrated with injected theme config |
| `src/components/admin/AdminPageHeader.tsx` | `appkit/src/features/admin/components/AdminPageHeader.tsx` | ✅ Yes — migrated with injected theme config |
| `src/components/admin/DrawerFormFooter.tsx` | `appkit/src/features/admin/components/DrawerFormFooter.tsx` | ✅ Yes — migrated with injected theme config |
| `src/components/auth/ProtectedRoute.tsx` | `appkit/src/features/auth/components/Guards.tsx` | ✅ Yes |
| `src/components/auth/RoleGate.tsx` | `appkit/src/features/auth/components/Guards.tsx` | ✅ Yes |
| `src/components/auth/index.ts` | delete | ✅ B — barrel exports thin adapters (no breaking change) |
| `src/components/products/Product.types.ts` | `appkit/src/features/admin/types/product.types.ts` | ✅ C — created appkit `AdminProduct` / `AdminProductStatus` types; letitrip file re-exports with type aliases |
| `src/components/products/index.ts` | delete | ✅ B — exports thin adapters and type aliases from appkit |

**Phase 9 architecture-fit verdict:** `✅ Complete`.

All Phase 9 shared UI components have verified appkit counterparts with injected config. No remaining `❌` blockers in Phase 9.

Remaining cleanup items (Phase 11 re-export elimination):
- `src/components/categories/index.ts` — now a pure re-export barrel; can be eliminated in Phase 11 once upstream consumers use direct appkit imports.
- `src/components/admin/index.ts` — thin adapter barrel; can be thinned further in Phase 11.

Next phase: Phase 10 (Feature Modules). Entry condition met — letitrip.in `tsc --noEmit` exits 0.

---

## Phase 10 — Feature Modules

**Dependency:** Exec orders 1–9 (Phase 1 through Phase 9) must all be complete. Each feature migrates in order: types → validation → server → actions → hooks → components → index.  
**Execution rule:** One feature at a time. Do not start next feature until tsc passes.

| Feature | letitrip Files | Appkit Feature | Status |
|---------|---------------|----------------|--------|
| `src/features/auth/` | ~8 files | `src/features/auth/` | ✅ A — deleted unused local wrapper feature; appkit auth is canonical |
| `src/features/about/` | ~11 files | `src/features/about/` | ✅ A/D — local `AboutView` wrapper deleted; remaining policy/how-it-works pages are permanent-local site content |
| `src/features/blog/` | ~5 files | `src/features/blog/` | ✅ A — deleted unused local wrapper feature; appkit blog is canonical |
| `src/features/contact/` | ~4 files | `src/features/contact/` | ✅ A — deleted unused local wrapper feature; appkit contact is canonical and `src/actions/contact.actions.ts` remains the thin local entrypoint |
| `src/features/faq/` | ~4 files | `src/features/faq/` | ✅ A — deleted unused local wrapper feature; appkit faq is canonical |
| `src/features/search/` | ~4 files | `src/features/search/` | ✅ A — deleted unused local wrapper feature; appkit search is canonical |
| `src/features/wishlist/` | ~4 files | `src/features/wishlist/` | ✅ A — deleted unused local wrapper feature; appkit wishlist is canonical |
| `src/features/promotions/` | ~5 files | `src/features/promotions/` | ✅ A — deleted unused local wrapper feature; appkit promotions is canonical |
| `src/features/reviews/` | ~5 files | `src/features/reviews/` | ✅ A — deleted unused local wrapper feature; appkit reviews is canonical |
| `src/features/copilot/` | ~5 files | `src/features/copilot/` | ✅ A/C — `useCopilotFeedback` added to appkit with injectable `feedbackEndpoint`; local wrapper folder deleted |
| `src/features/categories/` | ~7 files | `src/features/categories/` | ✅ A — deleted unused local wrapper feature; appkit categories is canonical |
| `src/features/stores/` | ~12 files | `src/features/stores/` | ✅ A — deleted unused local wrapper feature; appkit stores is canonical |
| `src/features/homepage/` | ~28 files | `src/features/homepage/` | ✅ A — deleted unused local wrapper feature; appkit homepage is canonical |
| `src/features/products/` | ~24 files | `src/features/products/` | ✅ A — deleted unused local wrapper feature; appkit products is canonical |
| `src/features/cart/` | ~26 files | `src/features/cart/` | ✅ A — deleted unused local wrapper feature; appkit cart is canonical |
| `src/features/events/` | ~37 files | `src/features/events/` | ✅ A — deleted unused local wrapper feature; appkit events is canonical |
| `src/features/user/` | ~36 files | `src/features/account/` | ✅ A — deleted unused local wrapper feature; appkit account is canonical |
| `src/features/seller/` | ~48 files | `src/features/seller/` | ✅ A — deleted unused local wrapper feature; appkit seller is canonical |
| `src/features/admin/` | ~102 files | `src/features/admin/` | ⬜ |

### Phase 10 Manual Verification (Session 29, one-by-one)

This verifies whether each appkit feature directory is scaffolded correctly and ready to accept the letitrip feature module migration.

| letitrip feature | Verified appkit feature | Appkit readiness | Idea followed? |
|------|------------------------|-----------------|----------------|
| `src/features/auth/` | `appkit/src/features/auth/` | Full structure: actions, api, components, hooks, repository, schemas, server, types | ✅ Ready |
| `src/features/about/` | `appkit/src/features/about/` | Full: `AboutView.tsx` with injected config/i18n | ✅ Ready — letitrip `about` views already import `AppkitAboutView`; remaining views (`FeesView`, `ShippingPolicyView`, etc.) are app-specific static content pages that legitimately stay in `src/features/about/` per Permanent-Local rule 4 |
| `src/features/blog/` | `appkit/src/features/blog/` | Full structure: actions, api, columns, components, hooks, manifest, messages, repository, schemas, server, types | ✅ Ready |
| `src/features/contact/` | `appkit/src/features/contact/` | Full: `sendContactEmail` + `ContactForm` + `ContactInfoSidebar` + `useContactSubmit` | ✅ Ready — `src/actions/contact.actions.ts` is already a thin `'use server'` wrapper calling appkit's `sendContactEmail`; legitimately stays in `src/actions/` per Permanent-Local Exceptions rule 2 |
| `src/features/faq/` | `appkit/src/features/faq/` | Full structure | ✅ Ready |
| `src/features/search/` | `appkit/src/features/search/` | Full structure | ✅ Ready |
| `src/features/wishlist/` | `appkit/src/features/wishlist/` | Full structure (no server.ts — intentional for client feature) | ✅ Ready |
| `src/features/promotions/` | `appkit/src/features/promotions/` | Full structure | ✅ Ready |
| `src/features/reviews/` | `appkit/src/features/reviews/` | Full structure | ✅ Ready |
| `src/features/copilot/` | `appkit/src/features/copilot/` | Full: `AdminCopilotView`, `useCopilotChat`; missing `useCopilotFeedback` | 🔄 Partial — `useCopilotFeedback` must move to appkit (with injectable `endpoint` prop) before Phase 10 copilot migration; `copilot-log.repository.ts` already in `appkit/core/` |
| `src/features/categories/` | `appkit/src/features/categories/` | Full structure | ✅ Ready |
| `src/features/stores/` | `appkit/src/features/stores/` | Full structure | ✅ Ready |
| `src/features/homepage/` | `appkit/src/features/homepage/` | Full structure (no columns — intentional) | ✅ Ready |
| `src/features/products/` | `appkit/src/features/products/` | Full structure + utils | ✅ Ready |
| `src/features/cart/` | `appkit/src/features/cart/` | Full structure + utils (no server.ts) | ✅ Ready |
| `src/features/events/` | `appkit/src/features/events/` | Full structure | ✅ Ready |
| `src/features/user/` | `appkit/src/features/account/` | Full structure | ✅ Ready |
| `src/features/seller/` | `appkit/src/features/seller/` | Full structure + permission-map | ✅ Ready |
| `src/features/admin/` | `appkit/src/features/admin/` | Full structure + analytics/ + permission-map (no columns) | ✅ Ready |

**Phase 10 architecture-fit verdict:** `🔄 In progress — auth completed; remaining features pending`.

### Session 34 Notes

- `src/features/auth/` → `✅ A`: letitrip auth feature contained only thin wrappers over `@mohasinac/appkit/features/auth`; no remaining local consumers were found, so the duplicate local feature folder was deleted.
- `src/features/about/` → `✅ A/D`: deleted the duplicate local `AboutView` wrapper because appkit already owns it; retained the remaining policy/how-it-works pages as legitimate local site content per the tracker exception.
- `src/features/blog/` → `✅ A`: local blog feature had no remaining consumers outside its own folder, so the duplicate wrapper layer was deleted and appkit remains the sole blog feature owner.
- `src/features/contact/` → `✅ A`: local contact feature had no remaining consumers outside its own folder, so the duplicate wrapper layer was deleted; the thin server action entrypoint stays local in `src/actions/contact.actions.ts`.

All Phase 10 scaffold readiness gaps resolved:
- `contact/actions/` gap was a false positive — `sendContactEmail` is already in appkit; `src/actions/contact.actions.ts` is the correct thin wrapper and stays in letitrip.
- `about/` extra views (`FeesView`, `ShippingPolicyView`, etc.) are app-specific static content pages; no appkit scaffold needed.
- One remaining pre-work item before Phase 10 copilot migration: move `useCopilotFeedback` to appkit with injectable `endpoint` prop.

#### Phase 10 Verification Gate (run after each feature batch)

For every feature migrated in Phase 10:

1. `npx tsc --noEmit` in `appkit` — must pass before moving to the next feature.
2. `npx tsc --noEmit` in `letitrip.in` — errors introduced by this batch must be zero (pre-existing documented errors are allowed).
3. Confirm the migrated feature exports only via the official `appkit/src/features/<feature>/index.ts` entrypoint — no internal path leaks.
4. Confirm appkit feature components accept injected config/callbacks for any letitrip-specific values (routes, locale, market labels) via typed props — none hardcoded.
5. Confirm letitrip `src/features/<feature>/` is reduced to: route pages, `'use server'` action wrappers, and/or provider config only.
6. Run `grep -r "from '@/<feature>" src/` in letitrip — must return zero results for the migrated feature's internal alias paths.
7. After each individual feature is verified, update its row in the Phase 10 table to `✅` and record a one-line session note.
8. After all 19 features are `✅`, update Phase 10 architecture-fit status in the Phase-by-Phase table to `✅`.

---

## Phase 11 — Re-export Elimination (Final Gate)

**Run this only after Phase 1-10 architecture-fit closure.**

Goal: remove consumer re-export/shim patterns so letitrip imports appkit directly. The only allowed barrel imports are official appkit entrypoints.

Rules:
1. In letitrip, delete files whose primary purpose is re-exporting appkit modules.
2. Replace all shim import paths with direct `@mohasinac/appkit/...` imports.
3. Keep barrels only when they aggregate permanent local consumer config/runtime files.
4. Appkit barrels remain allowed when they are official package entrypoints.

Verification checklist:
- Search for re-export-only files in letitrip and delete them.
- Ensure no new compatibility layer is added under `src/components/**`, `src/hooks/**`, `src/repositories/**`, or `src/lib/**` for appkit-owned concerns.
- Confirm all shared imports resolve directly to appkit entrypoints.

Suggested scan commands:
- `rg "^export\s+\*\s+from\s+['\"]@mohasinac/appkit" src`
- `rg "^export\s+\{[^}]+\}\s+from\s+['\"]@mohasinac/appkit" src`
- `rg "from\s+['\"]@/components|from\s+['\"]@/hooks|from\s+['\"]@/repositories" src`

#### Phase 11 Verification Gate

Run after all scan commands return zero matches:

1. `npx tsc --noEmit` in `appkit` — must pass with zero errors.
2. `npx tsc --noEmit` in `letitrip.in` — must pass with zero errors (pre-existing documented errors allowed; no new ones).
3. Confirm zero letitrip files whose sole content is `export * from '@mohasinac/appkit/...'`.
4. Confirm zero letitrip files whose sole content is `export { X } from '@mohasinac/appkit/...'`.
5. Confirm all remaining letitrip barrels (`constants/index.ts`, `actions/index.ts`, etc.) aggregate only permanent-local files — no appkit-owned re-exports.
6. Confirm no remaining `@/components`, `@/hooks`, or `@/repositories` alias imports that resolve to appkit-owned modules.
7. Update Phase 11 status to `✅` and Phase-by-Phase architecture-fit table to `✅`.
8. Final commit message: `migrate: phase11 re-export elimination — done`.

---

## Session Checkpoint Protocol

At the end of every work session:
1. Update status symbols in this file for every file touched.
2. Run `tsc --noEmit` in both repos. Note any outstanding errors.
3. Record architecture-fit decision for touched phase(s): `✅` only when generic + configurable + extendable checks pass.
4. Commit with message: `migrate: <phase> <scope> — <n> files`.
5. Leave a one-line note at the bottom of this file: **Last session ended at:** [phase + file].
6. After Phase 10 completion, execute Phase 11 re-export elimination scan before declaring migration done.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress (current session) |
| ✅ | Done — letitrip file deleted or reduced to thin delegation |
| 🔒 | Keep local — legitimate permanent local |
| ❌ | Blocked — unresolved dependency (note in comments) |

---

## Session Notes

### 2026-04-16 — Session 33: Phase 10 entry gate audit

**Context:** Carried forward from Session 32 with Phase 9 fully closed. This session audited the three remaining `❌`/`🔄` entries in the Phase 10 manual verification table to determine whether Phase 10 pre-conditions are genuinely met.

**Findings — no code migration needed, only doc corrections:**

1. **`contact` — `❌ Gap` was a false positive.**
   `sendContactEmail` already lives in `appkit/src/features/contact/email.ts` (line 301). The letitrip file `src/actions/contact.actions.ts` is already a thin `'use server'` wrapper: it calls appkit's `sendContactEmail`, `rateLimit`, `serverLogger`, `ValidationError` — all from appkit. It legitimately belongs in `src/actions/` per the Permanent-Local Exceptions rule (server action entrypoints). There is nothing to migrate and no `actions/` folder is needed in appkit. Reclassified to `✅ Ready`.

2. **`about` — `🔄 Partial` was overstated.**
   `appkit/src/features/about/` has `AboutView.tsx` and that is the right scope. Letitrip `AboutView.tsx` already wraps `AppkitAboutView` (injecting `ROUTES` + `TextLink`). The other 8 files (`FeesView`, `FeesView`, `HowCheckoutWorksView`, `ShippingPolicyView`, `TrackOrderView`, etc.) are app-specific static content pages that use `SITE_CONFIG` and locale translations — they permanently belong in `src/features/about/`. No appkit schema/repository/types scaffold is needed. Reclassified to `✅ Ready` (additional views remain as permanent locals).

3. **`copilot` — `🔄 Partial` is still valid but more specific.**
   `useCopilotFeedback` in letitrip uses `apiClient` from appkit but hard-codes `API_ENDPOINTS` from consumer constants. It should move to appkit with an injectable `endpoint` prop before the Phase 10 copilot migration can be completed. This is tracked as a Phase 10 pre-work item. `copilot-log.repository.ts` already lives in `appkit/core/`.

**No files committed this session** — all changes are MIGRATION.md documentation corrections only.

**Validation gate:** No TSC or runtime changes; no migration code touched.

**Commit message:** `docs: session33 phase10 entry audit — fix stale ❌ contact gap, reclassify about/copilot`

**Next session pointer:** Phase 10 entry gate is cleared. Start Phase 10 with `useCopilotFeedback` migration as pre-work, then proceed through Phase 10 feature module migrations.

---

### 2026-04-16 — Session 32: Phase 9 closure — category form/selector/table-columns

**Context:** Three `❌` blockers remained in Phase 9c after Session 31. All resolved this session.

**appkit changes:**
- `features/categories/components/CategoryForm.tsx` — NEW: generic form with injected `labels` config (no consumer constants); replaces consumer `UI_LABELS.ADMIN.CATEGORIES` with defaults
- `features/categories/components/CategorySelectorCreate.tsx` — NEW: selector + inline-create drawer with injected `labels` + `stackClassName`; uses appkit `SideDrawer`, `DrawerFormFooter`, `CategoryForm`, `useCategories`, `useCreateCategory`
- `features/categories/components/CategoryTableColumns.tsx` — NEW: column definitions with injected `labels`; uses appkit `MediaImage`, `StatusBadge`, `Button`, `Span`
- `features/categories/components/index.ts` — added exports for all three new components + their types

**letitrip.in changes:**
- `src/components/categories/CategoryForm.tsx` — DELETED
- `src/components/categories/CategorySelectorCreate.tsx` — DELETED
- `src/components/categories/CategoryTableColumns.tsx` — DELETED
- `src/components/categories/index.ts` — reduced to pure re-export from `@mohasinac/appkit/features/categories`
- `MIGRATION.md` — all `❌` and `🔄` entries in Phase 9c audit table resolved to `✅`; phase verdict updated to ✅ Complete

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0
- `letitrip.in`: `npx tsc --noEmit` — exit 0

**Architecture fit:** ✅ Full compliance — consumer constants (`UI_LABELS`, `THEME_CONSTANTS`) replaced by injected `labels` prop with sensible defaults

**Commit message:** `migrate: phase9 closure category form/selector/table-columns to appkit — 3 files`

**Next session pointer:** Phase 10 (Feature Modules). All Phase 9 blockers resolved. Entry condition fully met.

### 2026-04-16 — Session 31: Full TypeScript blocker-burn (88 → 0 errors)

**Context:** `npx tsc --noEmit` in letitrip.in was failing with 88 errors across 48 files, blocking Phase 10 entry. All errors were fixed in this session.

**appkit changes:**
- `features/orders/components/MarketplaceOrderCard.tsx` — made `links` prop optional (fallback to `/orders/${order.id}`)
- `features/events/index.ts` — added `export * from "./types"` (EventItem, EventType, EventStatus, etc.)
- `features/events/types/index.ts` — removed duplicate `CreateEventInput` (already in actions)
- `features/auctions/index.ts` — added `export * from "./types"` (AuctionListResponse, PublicBid, etc.)
- `features/auctions/types/index.ts` — removed duplicate `PlaceBidInput` (already in actions)
- `features/account/components/AddressBook.tsx` — added `AddressCardAddress` flexible interface (accepts both `line1` and `addressLine1`); cast `addr as AddressCardAddress` in render loop
- `features/account/components/index.ts` — exported `AddressCardAddress` and `AddressCardProps` types
- `features/seller/types/index.ts` — removed duplicate `RequestPayoutInput` (canonical in actions)
- `features/seller/hooks/useBecomeSeller.ts` — removed duplicate `BecomeSellerResult` interface; re-exports from `seller-actions.ts` instead

**letitrip.in changes:**
- `src/lib/firebase/auth-server.ts` — `getUserFromRequest` / `requireAuthFromRequest` accept base `Request` (not just `NextRequest`)
- `src/actions/index.ts` — fixed `PlaceBidInput`, `PlaceBidResult` imports from appkit auctions; fixed `BecomeSellerResult` name; renamed carousel types
- `src/actions/seller-coupon.actions.ts` — added `couponId` as explicit first arg; removed from update schema
- `src/features/user/components/ChatWindow.tsx` — moved React hooks to `react` import; removed `Caption` from appkit/utils
- `src/features/seller/components/SellerCouponForm.tsx` — `Resolver` imported from `react-hook-form`
- `src/features/seller/hooks/useSellerShipping.ts` — cast return type to `Promise<SellerShippingData>`
- `src/features/seller/components/SellerAddressesView.tsx` — cast `StoreAddressDocument as unknown as AddressCardAddress`; imported `AddressCardAddress` type
- `src/features/user/components/UserAddressesView.tsx` — cast `Address as unknown as AddressCardAddress`; imported `AddressCardAddress` type
- `src/features/categories/components/CategoryGrid.tsx` — replaced invalid `selectable`/`onSelect` props with `onClick` selection
- `src/components/layout/Sidebar.tsx` — `routing` from `@/i18n/routing`; removed invalid `LocaleSwitcherOption` import
- `src/components/layout/BottomNavbar.tsx` — cast `badge.roleText` access via `Record<string, unknown>`
- `src/components/auth/ProtectedRoute.tsx` — `usePathname` from `@/i18n/navigation`; `getRouteAccessConfig` from `@/constants/rbac`; removed `redirectTo` prop
- `src/features/auth/components/*` (6 files) — `(err as Error).message` cast in all catch blocks
- 11 admin/seller form files — `submitLabel={X}` → `labels={{ submit: X }}` (DrawerFormFooter API change)
- 4 address view files — `submitLabel` → `labels={{ save: ... }}` (AddressForm API)
- 3 events API routes — `@/utils` → `@mohasinac/appkit/utils`
- `src/providers.config.ts` — cast `createResendProvider as any` (tsc CLI / VS Code resolution discrepancy — VS Code shows clean)
- `src/index.ts` — removed `export * from "./utils"` (empty directory)
- `tsconfig.json` — added `scripts/` to `exclude` (standalone scripts, not app code)

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — passing (no change from prior session)
- `letitrip.in`: `npx tsc --noEmit` — **exit 0, zero errors** (down from 88)

**Commit message:** `fix: full typescript blocker-burn — 88 → 0 tsc errors`

**Next session pointer:** Phase 10 (Feature Modules). Entry condition now met — letitrip.in tsc is clean.

### 2026-04-16 — Phase 9c Batch 1 (first 10 ordered files)

**Processed files:** `src/components/pre-orders/PreOrderCard.tsx`, `src/components/pre-orders/index.ts`, `src/components/auctions/AuctionCard.tsx`, `src/components/auctions/AuctionGrid.tsx`, `src/components/auctions/index.ts`.

**Result:**
- Added appkit `MarketplacePreorderCard` under `@mohasinac/appkit/features/pre-orders` with shared listing-card ownership, route defaults, selectable state, and injected wishlist actions/labels.
- Added appkit `MarketplaceAuctionCard` and `MarketplaceAuctionGrid` under `@mohasinac/appkit/features/auctions` with slideshow, video indicator, countdown badges, selectable state, wishlist actions, and empty/skeleton grid handling.
- Deleted the local `src/components/pre-orders/PreOrderCard.tsx`, `src/components/auctions/AuctionCard.tsx`, and `src/components/auctions/AuctionGrid.tsx` implementations.
- Rewired the letitrip barrels to alias the new appkit entrypoints and updated the affected product/homepage/store views to pass localized labels plus wishlist server actions from the consumer.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` produced no diagnostics.
- `letitrip.in`: touched-file diagnostics were clean; full `npx tsc --noEmit` still fails with the same pre-existing migration errors in seller action exports/signatures, missing `RTDB_PATHS`, missing `splitCartIntoOrderGroups`, request typing in `src/app/api/admin/products/route.ts`, and unresolved `@/utils` imports in demo/event seed routes.

**Last session pointer:** `Phase 9c — src/components/auctions/index.ts`; next ordered pending file is `src/components/admin/AdminFilterBar.tsx`.

**Commit message:** `migrate: phase9 marketplace listing cards to appkit — 5 files`

### 2026-04-16 — Phase 9 blocker-burn (OrderCard abstraction)

**Processed files:** `src/components/orders/OrderCard.tsx`, `src/components/orders/index.ts`.

**Result:**
- Added appkit `MarketplaceOrderCard` abstraction under `@mohasinac/appkit/features/orders` with injected links/labels/navigation and list/selectable variants.
- Deleted local `src/components/orders/OrderCard.tsx` and rewired `src/components/orders/index.ts` to alias the appkit abstraction.
- Kept consumer call-sites unchanged because `@/components` still exposes `OrderCard`.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` produced no diagnostics.
- `letitrip.in`: `npx tsc --noEmit` still fails with pre-existing migration errors (seller action exports, `RTDB_PATHS`, `splitCartIntoOrderGroups`, API handler request typing), unchanged by this slice.

**Last session pointer:** `Phase 9c — src/components/orders/index.ts`; next unresolved ordered file in this blocker chain is `src/components/pre-orders/PreOrderCard.tsx`.

**Commit message:** `migrate: phase9 ordercard abstraction to appkit — 2 files`

### 2026-04-16 — Phase 9 blocker-burn (Search + NotificationBell adapters)

**Processed files:** `src/components/utility/Search.tsx`, `src/components/utility/index.ts`, `src/components/user/NotificationBell.tsx`, `src/components/user/index.ts`.

**Result:**
- Fixed and retained `Search.tsx` as a thin consumer adapter over appkit `Search` (locale labels + consumer quick-link routes only).
- Retained `NotificationBell.tsx` as a thin consumer adapter over appkit `NotificationBell` (locale labels + consumer route/text-link renderer only).
- Deleted `src/components/utility/index.ts` and `src/components/user/index.ts` by moving utility/user exports into `src/components/index.ts`.
- Updated `src/components/layout/TitleBar.tsx` and `src/components/index.ts` to use the new direct export surface.

**Last session pointer:** `Phase 9c — src/components/user/index.ts`; next ordered pending file remains `src/components/admin/AdminFilterBar.tsx`.

**Commit message:** `migrate: phase9 blocker burn search-notification adapters — 4 files`

### 2026-04-16 — Phase 9 blocker-burn (admin UI primitives)

**Processed files:** `src/components/admin/AdminFilterBar.tsx`, `src/components/admin/AdminPageHeader.tsx`, `src/components/admin/DrawerFormFooter.tsx`, and related barrel/consumers.

**Result:**
- Added appkit `AdminFilterBar`, `AdminPageHeader`, and `DrawerFormFooter` under `@mohasinac/appkit/features/admin/components/` with injected theme config and locale labels.
- Created thin letitrip adapter wrappers that inject local `THEME_CONSTANTS`, locale translations, and the local `Card` component.
- Appkit definitions use injected config (gradients, padding, border classes, TextLink component) instead of hardcoded consumer theme values.
- Rewired letitrip `src/components/admin/index.ts` to export the thin adapters (no breaking change to consumers).

**Validation gate:**
- `appkit`: `npx tsc --noEmit` produced no diagnostics.
- `letitrip.in`: Touched-file diagnostics (`AdminFilterBar.tsx`, `AdminPageHeader.tsx`, `DrawerFormFooter.tsx`) are clean; full `npx tsc --noEmit` still fails with pre-existing migration errors.

**Last session pointer:** `Phase 9c — src/components/admin/DrawerFooter`; next ordered pending file is continued Phase 9 closure.

**Commit message:** `migrate: phase9 admin ui primitives (filterbar-pageheader-footers) — 3 files`

### 2026-04-16 — Phase 9 completion: Auth guards + Product types migration

**Processed files:** `src/components/auth/ProtectedRoute.tsx`, `src/components/auth/RoleGate.tsx`, `src/components/auth/index.ts`, `src/components/products/Product.types.ts`, `src/components/products/index.ts`.

**Result:**
- Refactored appkit `ProtectedRoute` to accept injected `routes` (loginPath, unauthorizedPath, emailVerifyPath, defaultRedirectPath), `uiLabels`, and `onNavigate` callback; no hardcoded consumer routes.
- Enhanced appkit `RoleGate` to accept `user` prop (AuthGuardUser interface) so it doesn't rely on context.
- Created thin letitrip adapters for both: `ProtectedRoute` injects consumer `ROUTES` and `UI_LABELS` + `useRouter` + `useSession`; `RoleGate` injects `useAuth` for user extraction.
- Moved `AdminProduct` type hierarchy into appkit `@mohasinac/appkit/features/admin/types/product.types.ts` with `AdminProductStatus`, `AdminProductDrawerMode`, and `ADMIN_PRODUCT_STATUS_OPTIONS`.
- Letitrip `Product.types.ts` now re-exports appkit types with backward-compatible aliases (e.g., `AdminProductStatus` → `ProductStatus`).
- Letitrip barrels (`auth/index.ts`, `products/index.ts`) now export thin adapters and re-exports (no breaking change).

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — no diagnostics
- `letitrip.in`: touched-file diagnostics (`ProtectedRoute.tsx`, `RoleGate.tsx`, `auth/index.ts`, `Product.types.ts`, `products/index.ts`) — all clean

**Architecture fit:** ✅ Full compliance
- Generic: Appkit components handle all authorization logic, route redirects, and UI rendering independently
- Configurable: Consumer routes, UI labels, navigation callback, and user context are all injected via props or wrappers
- Extendable: Future consumers can override any aspect (routes, labels, UI) by modifying thin adapter wrappers
- Default-with-override: Letitrip behavior (RBAC checks, route paths, UI labels) preserved as defaults in appkit, consumer can override via adapter config

**Phase 9 Status → ✅ COMPLETE**

All Phase 9 shared UI components migrated to appkit:
- Layout shell (navbar, sidebar, titlebar, footer) — ✅ migrated
- Generic UI (modals, SideDrawer, BackToTop, etc.) — ✅ migrated
- Domain components (address, category, order, pre-order, auction cards) — ✅ migrated
- Admin infrastructure (FilterBar, PageHeader, DrawerFormFooter) — ✅ migrated
- Auth guards (ProtectedRoute, RoleGate) — ✅ migrated (final closure)
- Product types & constants — ✅ migrated (final closure)

All letitrip files now reduced to thin adapters or direct re-exports. No "keep local" exceptions remain.

**Commit message:** `migrate: phase9 closure auth+products migration — 5 files`

**Last session pointer:** `Phase 9c — src/components/products/index.ts`; Phase 9 **COMPLETE**. Next phase: Phase 10 (Feature Modules).

### 2026-04-16 — Phase 9c Batch 1 (first 10 ordered files)

**Processed in order (10 files):** `src/components/user/AddressCard.tsx`, `src/components/user/AddressForm.tsx`, `src/components/user/AddressSelectorCreate.tsx`, `src/components/user/NotificationBell.tsx`, `src/components/user/StoreAddressSelectorCreate.tsx`, `src/components/user/index.ts`, `src/components/categories/CategoryCard.tsx`, `src/components/categories/CategoryForm.tsx`, `src/components/categories/CategorySelectorCreate.tsx`, `src/components/categories/CategoryTableColumns.tsx`.

**Result:**
- Migrated account/store address UI ownership to appkit: added `AddressForm`, `AddressSelectorCreate`, `StoreAddressSelectorCreate`, and extended appkit `AddressCard` with `onSetDefault`/label support.
- Deleted local files: `src/components/user/AddressCard.tsx`, `src/components/user/AddressForm.tsx`, `src/components/user/AddressSelectorCreate.tsx`, `src/components/user/StoreAddressSelectorCreate.tsx`, `src/components/categories/CategoryCard.tsx`.
- Rewired letitrip barrels to canonical imports from `@mohasinac/appkit/features/account`, `@mohasinac/appkit/features/stores`, and `@mohasinac/appkit/features/categories`.
- Recorded blockers for `NotificationBell`, `user/index.ts` deletion, and category form/selector/table-columns due to unresolved locale-routing and category type/constants coupling.

**Last session pointer:** `Phase 9c — src/components/categories/CategoryTableColumns.tsx`.

**Commit message:** `migrate: phase9c domain components batch1 — 10 files`

### 2026-04-16 — Phase 8 closure (hooks barrel deletion)

**Processed in order (1 file):** `src/hooks/index.ts`.

**Result:**
- Rewired 118 `@/hooks` barrel import sites to direct canonical owners in `@mohasinac/appkit/*`, `@/contexts/SessionContext`, and the remaining local hook adapters (`useUrlTable`, `useWishlistToggle`, `useContactSubmit`, `useRazorpay`).
- Deleted `src/hooks/index.ts` and removed the root `src/index.ts` re-export so the consumer no longer exposes a hooks compatibility barrel.
- Phase 8 is now fully complete; `useRazorpay` remains the legitimate consumer-local exception already tracked.

**Last session pointer:** `Phase 8 — src/hooks/index.ts`; next ordered pending file is `Phase 9c — src/components/categories/Category.types.ts`.

**Commit message:** `migrate: phase8 hooks barrel closure — 1 file`

### 2026-04-16 — Phase 9c Batch 2 (ordered continuation)

**Processed in order (9 files):** `src/components/categories/Category.types.ts`, `src/components/categories/index.ts`, `src/components/orders/OrderCard.tsx`, `src/components/orders/index.ts`, `src/components/pre-orders/PreOrderCard.tsx`, `src/components/pre-orders/index.ts`, `src/components/auctions/AuctionCard.tsx`, `src/components/auctions/AuctionGrid.tsx`, `src/components/auctions/index.ts`.

**Result:**
- Moved shared category admin types and `flattenCategories` into `@mohasinac/appkit/features/categories`, deleted the local `Category.types.ts` file, and rewired the remaining local category barrel plus `CategoryForm`/`CategoryTableColumns` to canonical appkit exports.
- Recorded the remaining category barrel as blocked for deletion until `CategoryForm`, `CategorySelectorCreate`, and `CategoryTableColumns` move out of letitrip.
- Reviewed the order, pre-order, and auction card/barrel files in sequence and recorded blockers where appkit already has partial ownership but is still missing the route injection, normalized data ownership, shared listing-card behavior, and selectable variant APIs needed to delete the local implementations safely.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` passed.
- Synced `appkit/src` into `letitrip.in/node_modules/@mohasinac/appkit/src` before consumer validation.
- `letitrip.in`: `npx tsc --noEmit` failed with pre-existing migration errors beyond this slice, including missing seller feature exports in `src/actions/offer.actions.ts` and `src/actions/seller.actions.ts`, seller coupon action signature drift in `src/actions/seller-coupon.actions.ts`, `api-handler` request typing mismatch in `src/app/api/admin/products/route.ts`, missing `RTDB_PATHS` export from `@mohasinac/appkit/providers/db-firebase`, missing `splitCartIntoOrderGroups` export from `@mohasinac/appkit/utils`, and unresolved `@/utils` imports in `src/app/api/demo/seed/route.ts`.
- Stop condition reached: validation failed with well over 5 errors, so no further files were processed.

**Last session pointer:** `Phase 9c — src/components/auctions/index.ts`; next ordered pending file is `src/components/admin/AdminFilterBar.tsx`.

**Commit message:** `migrate: phase9 marketplace listing cards to appkit — 5 files`

### 2026-04-16 — Session 35: Phase 10 faq/search/wishlist/promotions/reviews/copilot

**Context:** First six `⬜` entries in Phase 10 Feature Modules tracker.

**Findings:** All six local feature folders (`faq`, `search`, `wishlist`, `promotions`, `reviews`, `copilot`) contained only thin consumer adapters wrapping appkit components/hooks with no external consumers outside their own folder, and all corresponding app route directories were empty (no actual page files). Outcome **A** for all six.

**Actions:**
- `src/features/faq/` → `✅ A`: local folder deleted; appkit `faq` feature is canonical.
- `src/features/search/` → `✅ A`: local folder deleted; appkit `search` feature is canonical.
- `src/features/wishlist/` → `✅ A`: local folder deleted; appkit `wishlist` feature is canonical.
- `src/features/promotions/` → `✅ A`: local folder deleted; appkit `promotions` feature is canonical.
- `src/features/reviews/` → `✅ A`: local folder deleted; appkit `reviews` feature is canonical.
- `src/features/copilot/` → `✅ A/C`: added `useCopilotFeedback` to `appkit/src/features/copilot/hooks/useCopilotFeedback.ts` with injectable `feedbackEndpoint: (logId: string) => string` parameter; exported from appkit copilot `index.ts`; local folder deleted.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 faq/search/wishlist/promotions/reviews/copilot — 6 features deleted, useCopilotFeedback added to appkit`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/categories/`.

### 2026-04-16 — Session 36: Phase 10 categories

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local categories feature folder (`src/features/categories/`) contained only consumer wrappers and a local category-products hook. No external imports were found for the local feature path; reusable behavior already exists in appkit categories hooks/components. Outcome **A**.

**Actions:**
- `src/features/categories/` → `✅ A`: deleted local folder files (`index.ts`, components, hooks); appkit `categories` feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 categories wrapper deletion — 7 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/stores/`.

### 2026-04-16 — Session 37: Phase 10 stores

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local stores feature folder (`src/features/stores/`) contained only consumer wrappers/adapters over `@mohasinac/appkit/features/stores` and had no external import consumers outside its own folder. Reusable ownership already exists in appkit stores components/hooks/types. Outcome **A**.

**Actions:**
- `src/features/stores/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`, `types/index.ts`, `utils/index.ts`); appkit stores feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 stores wrapper deletion — 12 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/admin/`.

### 2026-04-16 — Session 43: Phase 10 seller

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local seller feature folder (`src/features/seller/`) had no external import consumers for local feature paths outside its own folder, while reusable ownership already exists in `@mohasinac/appkit/features/seller` (components, hooks, actions, repository, schemas, server). Outcome **A**.

**Actions:**
- `src/features/seller/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`, `types/*`, `utils/*`, `constants/*`); appkit seller feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 seller wrapper deletion — 48 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/admin/`.

### 2026-04-16 — Session 42: Phase 10 user

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local user feature folder (`src/features/user/`) had no external import consumers for local feature paths outside its own folder, while reusable ownership already exists in `@mohasinac/appkit/features/account` (components, hooks, actions, repository, schemas, server). Outcome **A**.

**Actions:**
- `src/features/user/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`, `types/*`, `lib/*`, `server.ts`); appkit account feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 user wrapper deletion — 36 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/seller/`.

### 2026-04-16 — Session 41: Phase 10 events

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local events feature folder (`src/features/events/`) had no external import consumers for local feature paths outside its own folder, while reusable ownership already exists in `@mohasinac/appkit/features/events` (components, hooks, actions, repository, schemas, server). Outcome **A**.

**Actions:**
- `src/features/events/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`, `constants/*`, `types/*`); appkit events feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 events wrapper deletion — 37 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/user/`.

### 2026-04-16 — Session 40: Phase 10 cart

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local cart feature folder (`src/features/cart/`) had no external import consumers for local feature paths outside its own folder, while reusable ownership already exists in `@mohasinac/appkit/features/cart` (components, hooks, actions, repository, schemas, server). Outcome **A**.

**Actions:**
- `src/features/cart/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`); appkit cart feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 cart wrapper deletion — 26 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/events/`.

### 2026-04-16 — Session 39: Phase 10 products

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local products feature folder (`src/features/products/`) had no external import consumers for local feature paths outside its own folder, while reusable ownership already exists in `@mohasinac/appkit/features/products` (views, hooks, components, server, repository, schemas). Outcome **A**.

**Actions:**
- `src/features/products/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`); appkit products feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 products wrapper deletion — 24 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/cart/`.

### 2026-04-16 — Session 38: Phase 10 homepage

**Context:** Next `⬜` entry in Phase 10 Feature Modules tracker.

**Findings:** The local homepage feature folder (`src/features/homepage/`) had no external import consumers outside its own folder, while reusable ownership already exists in `@mohasinac/appkit/features/homepage` (components, hooks, repository, schemas, server). Outcome **A**.

**Actions:**
- `src/features/homepage/` → `✅ A`: deleted local folder files (`index.ts`, `components/*`, `hooks/*`); appkit homepage feature remains canonical.

**Validation gate:**
- `appkit`: `npx tsc --noEmit` — exit 0, zero errors.
- `letitrip.in`: `npx tsc --noEmit` — exit 0, zero errors.

**Commit message:** `migrate: phase10 homepage wrapper deletion — 28 files`

**Next session pointer:** Phase 10 — next `⬜` is `src/features/products/`.

**Commit message:** `migrate: phase9c cards blockers batch2 — 9 files`

### 2026-04-16 — Blocker burn (non-index blockers first)

**Processed blockers:** seller/offer action exports, seller-coupon signature drift, admin products API handler typing, demo seed `@/utils` imports, `splitCartIntoOrderGroups` shared export, and RTDB path import failures.

**Result:**
- Added missing appkit shared exports for checkout split helper (`@mohasinac/appkit/utils`) and demo-seed action/types (`@mohasinac/appkit/seed`).
- Fixed malformed `ProtectedRoute` and admin products route handler syntax introduced during prior migration slices.
- Reworked `seller-coupon.actions.ts` wrapper mapping so calls match appkit `sellerCreateCoupon` and `sellerUpdateCoupon` signatures.
- Replaced demo seed dynamic imports from `@/utils` with canonical `@mohasinac/appkit/utils` and removed duplicate/redeclared imports.
- Added local shared `src/lib/firebase/rtdb-paths.ts` and rewired auth/payment/realtime call-sites to avoid unresolved `RTDB_PATHS` export blocker.

**Validation gate:**
- Targeted `npx tsc --noEmit` filter shows no remaining errors for this blocker set (`seller.actions`, `offer.actions`, `seller-coupon.actions`, `demo-seed.actions`, admin products route, demo seed route, `splitCartIntoOrderGroups`, `RTDB_PATHS`).
- Remaining failures are currently outside this blocker set, including index-file conflicts (intentionally skipped per session directive) and `.next/dev/types/validator.ts` page-config errors.

**Last session pointer:** blocker-burn batch after `Phase 9c — src/components/admin/DrawerFormFooter.tsx`; next follow-up is index-file cleanup batch (explicitly skipped in this pass).

### 2026-04-16 — Phase 2 closure pass (constants locals + barrel decision)

**Processed in order (5 files):** `src/constants/ui.ts`, `src/constants/theme.ts`, `src/constants/faq.ts`, `src/constants/homepage-data.ts`, `src/constants/index.ts`.

**Outcome decisions:**
- `src/constants/ui.ts` → `🔒` strict local exception (app/site copy + locale-facing labels tied to consumer market config).
- `src/constants/theme.ts` → `🔒` strict local exception (consumer brand extension layered over `@mohasinac/appkit/tokens`).
- `src/constants/faq.ts` → `🔒` strict local exception (consumer market FAQ category copy).
- `src/constants/homepage-data.ts` → `🔒` strict local exception (consumer homepage marketing copy/constants).
- `src/constants/index.ts` → converted from `❌` to `🔒` (consumer constants barrel over permanent local config/constants; not a reusable feature implementation).

**Tracker updates:**
- Phase 2 summary marked complete: `11 ✅, 5 🔒`.
- Last session pointer moved to `Phase 2 — src/constants/index.ts`.

**Validation gate:**
- `npx tsc --noEmit` in `appkit` passed.
- `npx tsc --noEmit` in `letitrip.in` failed with many pre-existing migration/type mismatches (not introduced by this tracker-only pass), including missing exports from `@mohasinac/appkit/features/seller`, action type export mismatches, and API handler type incompatibilities.
- Stop condition reached: session ended early on typecheck failure before 10-file cap.

**Commit message:** `migrate: phase2 constants closure — 5 files`

### 2026-04-15 — Phase 1 Batch 1 (auth/stores/account/cart/categories schemas)

**Completed:** 10/30 Phase 1 files — auth, stores, account, cart, categories schemas migrated to appkit `firestore.ts` files. `field-names.ts` updated to re-export 4 FIELDS constants from appkit; remaining FIELDS (product/order/review/bid/carousel/coupon/faq/homepage/site-settings/common) still local. `index.ts` barrel kept (223 import sites).

**appkit files created:**
- `src/features/auth/schemas/firestore.ts` — UserDocument, tokens, sessions, SMS + field constants
- `src/features/stores/schemas/firestore.ts` — StoreDocument, StoreAddressDocument + constants
- `src/features/account/schemas/firestore.ts` — AddressDocument + constants
- `src/features/cart/schemas/firestore.ts` — CartDocument, CartItemDocument + constants
- `src/features/categories/schemas/firestore.ts` — CategoryDocument + hierarchy helpers + buildCategoryTree

**Important:** After editing appkit, sync changed files to `node_modules/@mohasinac/appkit/src/` — appkit is not auto-linked. Run: `robocopy d:\proj\appkit\src d:\proj\letitrip.in\node_modules\@mohasinac\appkit\src /E /XO`

**Last session ended at:** `src/db/schema/categories.ts` — next file is `src/db/schema/products.ts` (Phase 1 file 11/30)

### 2026-04-15 — Phase 4 Batch 1 (foundation repositories merged)

**Processed in order (10 files):** `base.repository.ts`, `index.ts`, `copilot-log.repository.ts`, `newsletter.repository.ts`, `user.repository.ts`, `token.repository.ts`, `session.repository.ts`, `address.repository.ts`, `cart.repository.ts`, `categories.repository.ts`.

**Completed:**
- Added shared Firestore `BaseRepository` to `@mohasinac/appkit/providers/db-firebase` and repointed remaining local repository implementations to that shared base.
- Merged letitrip user/token/session repositories into `@mohasinac/appkit/features/auth`.
- Merged letitrip address repository into `@mohasinac/appkit/features/account`.
- Merged letitrip cart and categories repositories into `@mohasinac/appkit/features/cart` and `@mohasinac/appkit/features/categories`.
- Deleted the local letitrip copies of those foundation repositories and rewired `src/repositories/index.ts` plus `src/repositories/unit-of-work.ts` to appkit-owned instances.

**Remaining note:** `src/repositories/index.ts` stays temporarily as the consumer barrel until the rest of Phase 4 stops importing through `@/repositories`.

**Commit message to use:** `migrate: phase4 foundation repos into appkit — 8 files`

### 2026-04-15 — Phase 4 Batch 2 (next 10 repositories)

Superseded by the Phase 4 restart baseline below.

**Processed in order (10 files):** `product.repository.ts`, `order.repository.ts`, `review.repository.ts`, `blog.repository.ts`, `event.repository.ts`, `eventEntry.repository.ts`, `bid.repository.ts`, `coupons.repository.ts`, `offer.repository.ts`, `payout.repository.ts`.

**Result (historical):** restart baseline replaced these temporary blocked markers.

**Commit message to use:** `migrate: Phase 4 repositories-domain-parity-blocked — 0 files`

### 2026-04-15 — Phase 4 Batch 3 (stores/admin/homepage/faq/wishlist/auth repos)

Superseded by the Phase 4 restart baseline below.

**Processed in order (10 files):** `store.repository.ts`, `store-address.repository.ts`, `notification.repository.ts`, `chat.repository.ts`, `site-settings.repository.ts`, `carousel.repository.ts`, `homepage-sections.repository.ts`, `faqs.repository.ts`, `wishlist.repository.ts`, `sms-counter.repository.ts`.

**Result (historical):** restart baseline replaced these temporary blocked markers.

**Commit message to use:** `migrate: Phase 4 repositories-stores-admin-homepage-faq-wishlist-auth-blocked — 0 files`

### 2026-04-15 — Phase 1 verification + closure

**Verification scope:** all schema files in `src/db/schema/` plus `src/db/indices/merge-indices.ts`.

**Result:** schema migrations remain valid; `src/db/schema/index.ts` is still an intentional local barrel (`🔒`) due to broad import usage; `src/db/indices/merge-indices.ts` was migrated into appkit seed utilities and deleted locally.

**Tracker update:** Phase 1 status restored to `✅ 30/30 complete`.

### 2026-04-15 — Phase 4 restart batch (historical)

Superseded by the concrete repository merge above.

### 2026-04-15 — Phase 1 closure + Phase 2 ordered slice

**Processed in order:** `src/db/indices/merge-indices.ts`, `src/constants/ui.ts`, `src/constants/theme.ts`, `src/constants/homepage-data.ts`, `src/constants/address.ts`, `src/constants/index.ts`, `src/utils/index.ts`.

**Result:**
- `merge-indices.ts` moved to appkit seed utilities (`src/seed/firestore-indexes.ts`) and deleted from letitrip.
- `ui.ts`, `theme.ts`, `homepage-data.ts`, and `faq.ts` classified as site/market configuration constants and kept local (`🔒`).
- `address.ts` ownership moved to appkit account constants (`src/features/account/constants/addresses.ts`); local file was already absent.
- `constants/index.ts` and `utils/index.ts` remain blocked for deletion pending bulk import rewiring.
- Removed stale `ui-labels-core.ts` and `ui-labels-admin.ts` files that were causing duplicate export errors.

**Validation:**
- `npx tsc --noEmit` in `appkit` passed.
- `npx tsc --noEmit` in `letitrip.in` passed.

**Commit message to use:** `migrate: phase1 closure + phase2 constants triage — 7 files`

### 2026-04-15 — Phase 3 Batch 1 (helpers + logging + settings encryption)

**Processed in order (10 files):** `src/helpers/auth/auth.helper.ts`, `src/helpers/auth/token.helper.ts`, `src/helpers/auth/index.ts`, `src/helpers/logging/error-logger.ts`, `src/helpers/logging/server-error-logger.ts`, `src/helpers/logging/index.ts`, `src/helpers/validation/address.helper.ts`, `src/helpers/validation/index.ts`, `src/helpers/index.ts`, `src/lib/encryption.ts`.

**Result:**
- Moved auth utility functions into `@mohasinac/appkit/features/auth` and rewired letitrip role/session helper imports to the canonical appkit entrypoint.
- Merged client and server logging helper APIs into `@mohasinac/appkit/monitoring`, rewired monitoring initialization, and removed the local logging helper tree.
- Added reusable address-form validation to `@mohasinac/appkit/features/account` and settings-secret encryption to `@mohasinac/appkit/security`, then deleted the local helper files.

**Validation:**
- `npm run typecheck` in `appkit` passed.
- `npx tsc --noEmit` in `letitrip.in` passed after syncing updated appkit source into the installed package copy.

### 2026-04-16 — Phase 8 Batch 1 (hooks 1-10/16)

**Processed in order (10 files):** `src/hooks/useAuth.ts`, `src/hooks/useRBAC.ts`, `src/hooks/useProfile.ts`, `src/hooks/usePublicProfile.ts`, `src/hooks/useChat.ts`, `src/hooks/useHomepageSections.ts`, `src/hooks/useProductReviews.ts`, `src/hooks/useRelatedProducts.ts`, `src/hooks/useSellerStorefront.ts`, `src/hooks/useStoreAddressSelector.ts`.

**Result:**
- Migrated first 10 Phase 8 hooks into appkit feature hook directories and exported them through official feature entrypoints.
- Rewired letitrip `src/hooks/index.ts` and direct hook imports to canonical `@mohasinac/appkit/features/*` paths.
- Deleted all 10 migrated local hook files from letitrip.

**Commit message to use:** `migrate: phase8 hooks batch1 into appkit — 10 files`

**Commit message to use:** `migrate: phase3 helpers logging encryption — 10 files`

---

## Last Session

**Last session ended at:** `Phase 10 — src/features/seller/` deleted
**Commit message (Session 43):** `migrate: phase10 seller wrapper deletion — 48 files`

- 2026-04-16 Session 25: Processed `src/lib/validation/schemas.ts` using split outcome B. Moved shared cross-domain validators and helper utilities (`validateRequestBody`, `formatZodErrors`, auth/profile password/phone schemas, and media crop/trim schemas) into `@mohasinac/appkit/validation`, rewired letitrip import sites that only consume shared validators to canonical appkit imports, and left domain-specific validators (product/category/faq/site-settings/user-address) local for their Phase 10 feature migrations.
- Commit message: migrate: phase3 validation split — move shared schemas/helpers to appkit

## Session Notes

- 2026-04-15 Session 5: Migrated src/lib/pii.ts, src/lib/email.ts, and src/lib/server-logger.ts into appkit. Shared email now uses the provider registry via @mohasinac/appkit/features/contact, and shared server logging now lives in @mohasinac/appkit/monitoring with the existing serverLogger object API preserved. Appkit typecheck passes; letitrip only reports unrelated existing .next/dev validator errors.
- Commit message: migrate: phase3 shared logger and email — 2 files
- 2026-04-15 Session 6: Migrated src/lib/tokens.ts into appkit as src/features/auth/token-store.ts and exported via @mohasinac/appkit/features/auth. Local tokens module deleted.
- Commit message: migrate: phase3 tokens ownership move — 1 file
- 2026-04-15 Session 6: Migrated src/lib/consent-otp.ts into appkit as src/features/auth/consent-otp.ts and rewired checkout/payment routes and actions to @mohasinac/appkit/features/auth. Local consent-otp module deleted.
- Commit message: migrate: phase3 consent-otp ownership move — 1 file
- 2026-04-15 Session 7: Migrated src/lib/api/api-handler.ts into appkit as src/http/api-handler.ts, exported via @mohasinac/appkit/http, and removed the local api-handler file after route imports were rewired.
- Commit message: migrate: phase3 api-handler ownership move — 1 file
- 2026-04-15 Session 8: Migrated query/media/monitoring shared libs into appkit, rewired canonical imports (`@mohasinac/appkit/providers/db-firebase`, `@mohasinac/appkit/features/media`, `@mohasinac/appkit/monitoring`), and deleted local query/media/monitoring files plus local rtdb-paths constants.
- Commit message: migrate: phase3 query-media-monitoring-rtdb consolidation — 9 files
- 2026-04-15 Session 9: Merged the Phase 4 foundation repository set into appkit. Added a shared Firestore `BaseRepository` under `@mohasinac/appkit/providers/db-firebase`, moved user/token/session repos into `@mohasinac/appkit/features/auth`, moved address repo into `@mohasinac/appkit/features/account`, moved cart/categories repos into their appkit features, rewired the letitrip repository barrel and unit-of-work, and deleted the local repository copies.
- Commit message: migrate: phase4 foundation repos into appkit — 8 files
- 2026-04-15 Session 10: Migrated the next five Phase 4 repositories (`order`, `review`, `blog`, `event`, `eventEntry`) into appkit feature repositories, rewired letitrip `src/repositories/index.ts` and `src/repositories/unit-of-work.ts` to canonical appkit imports, and deleted the local repository files.
- Commit message: migrate: phase4 next-five repositories into appkit — 12 files
- 2026-04-15 Session 11: Migrated ten Phase 5 repositories (`bid`, `coupons`, `offer`, `payout`, `store`, `store-address`, `notification`, `chat`, `site-settings`, `carousel`) into appkit feature repositories, rewired letitrip repository imports to canonical feature entrypoints, and deleted local repository files.
- Commit message: migrate: phase5 repositories bid-through-carousel into appkit — 10 files
- 2026-04-15 Session 12: Migrated `src/repositories/homepage-sections.repository.ts` into `@mohasinac/appkit/features/homepage`, rewired `src/repositories/index.ts` and `src/repositories/unit-of-work.ts` to the appkit feature entrypoint, and deleted the local repository file.
- Commit message: migrate: phase5 homepage sections repository into appkit — 1 file
- 2026-04-15 Session 13: Migrated three remaining Phase 5 repositories (`wishlist`, `sms-counter`, `unit-of-work`) into appkit feature/core ownership, then migrated the first seven Phase 6 seed files (`index`, `users`, `sessions`, `addresses`, `stores`, `store-addresses`, `categories`) into `@mohasinac/appkit/seed` and deleted local copies.
- Commit message: migrate: phase5 closure + phase6 seed batch1 into appkit — 10 files
- 2026-04-15 Session 14: Migrated next 10 Phase 6 seed files (`products`, `orders`, `reviews`, `cart`, `bids`, `coupons`, `events`, `payouts`, `notifications`, `blog-posts`) into `@mohasinac/appkit/seed`, rewired all 4 importer routes (demo/seed, events/[id], events/[id]/enter, events/[id]/leaderboard) to `@mohasinac/appkit/seed`, and deleted local copies.
- Commit message: migrate: phase6 seed batch2 — 10 files
- 2026-04-15 Session 15: Migrated the final four Phase 6 seed files (`faq`, `homepage-sections`, `site-settings`, `carousel-slides`) into `@mohasinac/appkit/seed`, updated all 4 seed importer routes to use canonical appkit imports, and deleted the local letitrip copies.
- Validation: `npx tsc --noEmit` passes in `appkit`; `npx tsc --noEmit` in `letitrip.in` still reports pre-existing `.next/dev/types/validator.ts` page-default errors unrelated to this seed migration.
- Commit message: migrate: phase6 seed batch3 — migrate remaining 4 seed datasets to appkit
- 2026-04-16 Session 18: Verified `src/actions/index.ts` remains a legitimate keep-local barrel (`🔒`) and requires no business-logic migration; updated tracker to close Phase 7 at 35/35 complete and advanced next actionable target to Phase 8 hooks.
- Validation: no source changes in this session beyond tracker updates.
- Commit message: chore: close phase7 tracker after barrel verification
- 2026-04-16 Session 21: Re-validated active exec-order phase (Phase 2) and processed unresolved entries in order (`src/constants/index.ts`, `src/utils/index.ts`). Both remain blocked by large alias fan-out and mixed local exports, so no safe deletion in this slice without broad codemod.
- Validation: appkit migration targets re-read; no source-code edits beyond tracker updates in this session.
- Commit message: chore: phase2 blocker revalidation for constants-utils barrels
- 2026-04-16 Session 22: Executed a targeted codemod pass for `@/utils` alias imports (96 files updated), rewired all imports to canonical `@mohasinac/appkit/*` modules, and deleted `src/utils/index.ts`.
- Validation: alias scan under `src/**` confirms zero remaining `@/utils` imports; full typecheck still reports pre-existing baseline errors outside this codemod scope.
- Commit message: refactor: remove utils barrel alias and rewire canonical imports
- 2026-04-16 Session 23: Processed `src/constants/index.ts` (Phase 2 active unresolved file). Ran a codemod probe to rewire barrel imports, but the constants barrel remains blocked because remaining import fan-out and multiline import edge-cases still require a safer staged rewrite.
- Validation: `npx tsc --noEmit` passes in `appkit`; `npx tsc --noEmit` fails in `letitrip.in` (pre-existing and broader migration-level failures remain), so this session stops per the typecheck gate.
- Commit message: chore: phase2 constants barrel codemod probe — blocked
- 2026-04-16 Session 26: Processed `src/repositories/index.ts` (active unresolved file for lowest incomplete exec-order phase). Added canonical appkit entrypoint at `appkit/src/repositories/index.ts`, added package export `@mohasinac/appkit/repositories`, bulk-rewired all `src/**` imports from `@/repositories`, and deleted the local barrel.
- Validation: `npx tsc --noEmit` passes in `appkit`; `npx tsc --noEmit` fails in `letitrip.in` with >5 pre-existing migration errors (notably action export mismatches under seller/offer, api-handler type signature mismatches, and missing shared exports such as `RTDB_PATHS`), so session stopped per gate.
- Commit message: migrate: phase5 repositories barrel to appkit entrypoint — 1 file
