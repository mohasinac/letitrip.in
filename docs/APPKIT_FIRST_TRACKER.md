# Appkit-First Tracker

> Purpose: this is the authoritative execution contract for the letitrip.in to appkit migration.
> Use this file first when continuing migration work.
>
> Last updated: 2026-04-11
> Status: active

> Tracker reset: active queue restarted at Task 1 (Admin shells).

---

## Non-Negotiable Contract

letitrip.in must be appkit-first.

That means:

1. Reusable UI, view shells, feature hooks, read flows, and domain composition should live in appkit or `@mohasinac/*` packages.
2. letitrip.in should keep only project-specific composition, provider wiring, translations, route params, render-slot overrides, and genuinely local business logic.
3. If a piece of code could be reused by another project, do not build it in letitrip.in first. Build or extend it in appkit, then consume it from letitrip.in.
4. letitrip.in local feature files are allowed only as thin adapters, wrappers, override maps, route entrypoints, or hard blockers that cannot yet move.
5. When a local implementation and an appkit implementation both exist, the appkit implementation wins. The local one must become a thin adapter or be deleted.

---

## Default Decision Rules

Use these rules without re-asking the same architecture questions:

| Situation                                                                                | Default action                                                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A page/view exists only in letitrip.in but is reusable                                   | Create the shell in appkit first, then swap letitrip.in to a thin adapter                          |
| A local component differs only by labels, icons, routes, or callbacks                    | Keep behavior in appkit and inject customization from letitrip.in via props/render slots           |
| A local hook is a read-only query wrapper                                                | Move query logic to package/appkit and keep only endpoint/param adaptation locally if still needed |
| A local mutation contains letitrip-specific auth, Firebase, payment, or encryption logic | Keep mutation local until the provider or contract exists in packages                              |
| A local file is reusable but not yet exported from appkit                                | Add export in appkit, then replace local implementation                                            |
| A local implementation has no appkit extension point                                     | Extend appkit API first, then migrate letitrip.in                                                  |

If there is doubt, choose the option that reduces long-term local code in letitrip.in.

---

## What Stays Local

The following categories are allowed to remain local until package contracts catch up:

| Area                                                  | Why it stays local                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| Firebase session collection management                | letitrip-specific session tracking and revocation data                    |
| Encrypted PII repository flows                        | encryption-at-rest is local and not yet abstracted at provider level      |
| Cart write flow with single-document schema           | current appkit/cart package assumes item-level documents                  |
| Firestore subcollection-backed wishlist and addresses | current repository abstraction does not model subcollection paths cleanly |
| Razorpay and Shiprocket operational flows             | provider packages and contracts are incomplete                            |
| Copilot/chat/realtime/logging/demo tooling            | explicitly project-specific                                               |
| Aggregation-heavy admin analytics routes              | local response shape and cross-repo aggregation logic                     |

These are blockers, not excuses for keeping reusable presentation or read logic local.

---

## Customization Model

Appkit code must stay customizable from letitrip.in.

Preferred extension mechanisms:

1. Label maps for all user-facing strings.
2. Render props and slots for page sections, cards, empty states, toolbar controls, and actions.
3. Route adapters for local navigation shape.
4. Theme or class hooks only when a semantic prop API is not enough.
5. Typed data mappers when letitrip shape differs from package shape.

Avoid these patterns:

1. Copy-pasting full views into letitrip.in just to change a heading or button.
2. Forking package components into `src/features/**` for minor layout differences.
3. Keeping local query logic when appkit can own it.
4. Adding new reusable helpers under app-local folders instead of packages.

---

## Current Migration Rule

Coverage must be checked before any extraction edit.

For every remaining local feature, apply this order:

1. Run coverage audit: verify whether installed appkit/package exports already provide the required shell/component/hook/extension point.
2. If coverage exists, replace the local implementation with a thin letitrip adapter.
3. If coverage does not exist, add the missing reusable shell/API in appkit first.
4. Export it from appkit and release/update package version.
5. Switch letitrip.in to consume it.
6. Delete superseded local implementation code.
7. Run `npx tsc --noEmit` in letitrip.in.

Do not start from letitrip-first implementation and “extract later” unless a blocker makes that unavoidable.

### Pre-Extraction Coverage Gate (Mandatory)

Before editing source files for any extraction, confirm all items below:

1. Required package surface exists in the currently installed appkit/package version.
2. Required customization hooks exist (labels, render slots, callbacks, typed adapters).
3. No critical behavior would be lost by switching to the package surface.
4. If any check fails, log the gap in `Known Gaps To Close In Appkit` first, then implement package-side coverage.

If this gate is not satisfied, extraction must not proceed.

---

## Missing Coverage Protocol

When extraction is blocked by missing package coverage, do all of the following in the same work batch:

1. Record the gap in this tracker under `Known Gaps To Close In Appkit`.
2. Include exact blocker details: missing component/hook/slot/type/prop and the blocked letitrip file.
3. Mark whether a temporary local adapter is still acceptable or not.
4. Define the required package action: add API, export surface, release version, then consume it in letitrip.
5. After package release and adoption, remove or update the gap row with resolution status.

Use this template for each new gap entry:

| Gap                          | Needed change                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `<domain + missing surface>` | `<required appkit API/extension point> · blocked in <letitrip file path> · status: open/in-progress/resolved>` |

If no package publish is needed for a batch, explicitly state that in tracker updates.

---

## Status Snapshot

### Queue Reset (Current)

| Task                                                         | Status |
| ------------------------------------------------------------ | ------ |
| 1. Admin shells in appkit                                    | active |
| 2. Seller and user account shells in appkit                  | queued |
| 3. Product, cart, checkout, and events shells in appkit      | queued |
| 4. Homepage sections in appkit                               | queued |
| 5. Export and release package updates                        | queued |
| 6. Replace remaining letitrip local views with thin adapters | queued |

### Already shifted toward appkit-first

| Domain                                  | Status                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Auth UI fragments                       | partial migration complete                                              |
| Blog tabs and listing wrappers          | partial migration complete                                              |
| Events status badge and read wrappers   | partial migration complete                                              |
| Product feature badges and read hooks   | partial migration complete                                              |
| Store header and store grid shell usage | partial migration complete                                              |
| Wishlist page shell                     | migrated to appkit shell, but selection API still needs package support |
| Shared UI primitives                    | large extraction wave already completed into `@mohasinac/ui`            |

### Still needs new appkit shells first

| Domain              | Required work                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin               | dashboard stats extraction complete; user-table columns now partially package-backed; remaining dashboard, table, detail, and moderation shells still need package coverage |
| Seller              | addresses view now reuses shared package-backed AddressCard adapter; remaining seller list/detail/form shells still need package coverage                                   |
| User account        | address card extraction started (package-backed adapter); remaining orders, addresses flow shells, notifications, RC, and profile shells still need package coverage        |
| Products            | build remaining product detail and admin/editor shells in appkit                                                                                                            |
| Cart and checkout   | build appkit-first shells around local mutation constraints                                                                                                                 |
| Events and homepage | build section-level shells and configurable blocks in appkit                                                                                                                |

---

## Known Gaps To Close In Appkit

These are concrete package gaps currently preventing a fully clean appkit-first state:

| Gap                              | Needed change                                                                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wishlist bulk selection          | appkit wishlist shell needs selected IDs and bulk action extension points                                                                                                              |
| Admin data views                 | reusable appkit admin list/detail shells with slots and toolbar hooks                                                                                                                  |
| Admin dashboard shell export gap | add and publish `AdminDashboardView` and `QuickActionsPanel` exports in appkit admin surface · blocked in `src/features/admin/components/AdminDashboardView.tsx` · status: in-progress |
| Seller workspace views           | reusable seller dashboard and CRUD list shells                                                                                                                                         |
| User portal shells               | reusable account navigation and content section shells                                                                                                                                 |
| Product editor/detail sections   | reusable detail and authoring view sections                                                                                                                                            |
| Homepage blocks                  | appkit sections for hero, carousel, promos, collections, and merch blocks                                                                                                              |

Rule for updates: every newly encountered missing-coverage blocker must be added to this table before ending the batch.

### Package release note

- Package publish/update is required for this batch because the installed `@mohasinac/appkit@2.0.3` does not expose newly added admin surfaces needed by Task 1.
- Coverage has been added and build-verified in appkit source; letitrip extraction must wait for a released version that exports `AdminDashboardView` and `QuickActionsPanel`.

---

## Acceptance Criteria

A domain is considered migrated only when all of the following are true:

1. The primary shell or view comes from appkit or another `@mohasinac/*` package.
2. letitrip.in only supplies local labels, routes, render slots, and data adapters.
3. No duplicate reusable presentation logic remains in letitrip.in for that domain.
4. Reusable changes were made in appkit first, not patched only in letitrip.in.
5. `npx tsc --noEmit` passes in letitrip.in after the migration.

---

## Execution Order

Use this order for ongoing work unless a blocker forces a change:

1. Admin shells in appkit.
2. Seller and user account shells in appkit.
3. Product, cart, checkout, and events shells in appkit.
4. Homepage sections in appkit.
5. Export and release package updates.
6. Replace remaining letitrip local views with thin adapters.

---

## Working Notes For Future Runs

When continuing this migration, assume the following without re-asking:

1. The target is not “clean enough”; the target is appkit-first by default.
2. Extensibility must come from appkit APIs, not from local forks.
3. If an appkit API is missing, extend appkit rather than rebuilding locally.
4. Local code is acceptable only for blockers, app wiring, or thin adapters.
5. Historical docs may describe older partial-package strategy; this file overrides them for current migration direction.

---

## Related Docs

1. `docs/MIGRATION_PLAN.md` for historical package migration detail and blocker inventory.
2. `docs/CHANGELOG.md` for incremental execution history.
3. `README.md` documentation index for discovery.
