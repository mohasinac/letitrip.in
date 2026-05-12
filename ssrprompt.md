# letitrip.in — SSR Working Prompt (Lane B · SSR Rearchitecture)

> **Paste at the start of every SSR-lane session.** Lane A (CRUD) uses `prompt.md`.
> Task status → `ssr-arch-tracker.md` (authoritative) · Deferred → `newchange.md` DEFERRED table · Architecture → `INSTRUCTIONS.md` · Slugs/media → `CLAUDE.md` · Lane plan → `~/.claude/plans/what-do-you-think-abundant-turing.md` · Reference template → `appkit/src/_internal/server/features/products/`

---

## 📌 UPDATE-CADENCE RULE (READ FIRST, EVERY SESSION)

**This file MUST be updated:**

1. **Before every commit** — the LAST / CURRENT / NEXT block below must reflect what the commit just did. If you commit without updating this file, the next session loses the thread.
2. **At session end** — collapse the prior CURRENT into LAST (keep only ONE last block), set CURRENT to the next ⏳ task, and prune the NEXT list.
3. **When Lane A (CRUD) finishes any session that affects a feature also on the SSR roadmap** — re-read `prompt.md` LAST block and copy any cross-lane note here under `[CROSS-LANE NOTES]`.

Skipping this rule is the same as breaking CLAUDE.md Rule #1.

---

## 📋 LANE B — SESSION STATE (single source of truth for "where are we")

> Keep exactly **1 LAST**, **1 CURRENT**, and a short **NEXT** list. Update on every commit.

### ✅ LAST COMPLETED — S4-funcs end-to-end (handlers + bindHttps + consumer rewrite) (2026-05-12)

- 12 new handlers ported to appkit (mediaTmpCleanup, pendingOrderTimeout, productStatsSync, positionsReconcile, payoutBatch, weeklyPayoutEligibility, onCategoryWrite, onProductWrite, onStoreWrite, adminAnalytics, storeAnalytics, listingProcessor) — appkit side now feature-complete (22 of 22)
- `runtime/adapters/firebase.ts` + `bindHttps` (shared-secret `x-internal-secret`, method allowlist, ValidationError → 4xx); `bindToFirebase.https` exposed; appkit `server-entry.ts` re-exports all handlers + new types
- `letitrip.in/functions/src/index.ts` rewritten as a thin barrel — every Cloud Function is one `bindToFirebase.{schedule|documentCreated|documentUpdated|documentWritten|https}(...)` line; 22 consumer source files + `lib/appkit.ts` re-export shim deleted
- `_internal/` stays brand-agnostic: Razorpay creds + `APP_BRAND_NAME` flow through `ctx.env(...)`
- Quality gates: tsc clean across appkit, letitrip.in, AND functions/; audit-violations / verify-entries / verify-css-build all 0; `audit-ssr-in-appkit` holds at baseline 8
- Commits: appkit `b108601` (server layers + handlers) + `afcebf5` (server-entry exports + bindHttps); parent `9169acca5` (tracker) + `857a0b41d` (functions rewrite)

### 🔄 CURRENT — none (between sessions)

**Next action when a session starts**: pick the first ⏳ from NEXT below, mark it 🔄 here AND in `ssr-arch-tracker.md`, add a `[ACTIVE-FEATURES]` line in `newchange.md`.

### ⏳ NEXT UP — Lane B queue (read `ssr-arch-tracker.md` Summary for full list)

| # | Session | Scope | Concrete remaining work |
|---|---------|-------|------------------------|
| 1 | **S3-finish** | Catalog & Listings | Verified 2026-05-12: only stale "LetItRip" reference in `_internal/` is a JSDoc example in `shared/config/schema.ts:16` (intentional). Blog `authorName` fallback is `"Editorial Team"` (not "LetItRip") — tracker entry was stale. `bundles`/`grouped`/`sublisting` data layers already shipped. `BrandDetailPageView` alignment already shipped. **S3-finish effectively closed — reclassify ✅ on next sweep.** |
| 2 | **S4-funcs** | Functions migration batch 1 | ✅ Appkit side complete (2026-05-12): all 22 handlers + `bindHttps` adapter. Remaining: rewrite `letitrip.in/functions/src/{jobs,triggers,callable}/*.ts` → thin `bindToFirebase.{schedule\|documentWritten\|https}(...)` shims; `functions/src/index.ts` → 3-line `bindToFirebase(handlers)` barrel; `firebase deploy --only functions --dry-run` parity test |
| 3 | **S4-trans** | Checkout + payments server layers | `_internal/server/features/{checkout,payments}/` actions + data; preserve Razorpay webhook route shape |
| 4 | **S5-audit** | Per-user / Homepage / Search gaps | Sweep for any remaining server-layer holes (most done); audit consumer wiring for double-fetches |
| 5 | **S6** | Seller + Admin + Content | Admin/seller server layers; `ListingScaffold` + `DetailScaffold` extraction to `_internal/client/scaffolds/` |
| 6 | **S7** | Cross-cutting cleanup | Reduce `audit-ssr-in-appkit` baseline 8 → 0; sitemap/robots/manifest migrations; lift remaining `_transform.ts` files; additive `defineEslintConfig()` spread into `eslint.config.mjs` (do NOT wholesale replace) |
| 7 | **S1-tidy** | Foundation tail | Reclassify cli-move (premise stale — file has zero firebase-admin imports); `defineTailwindConfig()` adoption |

### [CROSS-LANE NOTES]

_Empty._ Add an entry here when Lane A (CRUD) ships something Lane B server layers should adapt to (new repository method, new domain type, new collection). Format: `YYYY-MM-DD [CRUD→SSR] <one-line>`.

---

## 🛤️ LANE DISCIPLINE — READ BEFORE TOUCHING ANY FILE

This repo runs two parallel Claude sessions in separate worktrees. You are **Lane B (SSR)**. Lane A (CRUD) edits `appkit/src/features/**`, `appkit/src/seed/**`, `src/app/api/**`, and `crud-tracker.md` in a different worktree at the same time. Step on its files and you create a merge conflict.

### Lane B may write (SSR)

- `appkit/src/_internal/server/**` — data layers (`data.ts`, `React.cache`), adapters, actions, metadata builders, OG renderers (`og.tsx`), barrels
- `appkit/src/_internal/shared/**` — types, Zod schemas, feature config constants
- `appkit/src/_internal/client/scaffolds/**` — `ListingScaffold`, `DetailScaffold`
- `appkit/src/server-entry.ts`, `appkit/src/client-entry.ts`
- `appkit/src/configs/**`, `appkit/tsconfig.*.json`, `appkit/package.json` exports map
- `appkit/functions/**` — Functions migration handlers + bindings
- `src/app/**/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/[locale]/robots.ts`, `manifest.ts`
- `src/app/[locale]/**/page.tsx` — **only to thin a shim** (>30 lines → ≤30) for a feature on Lane B's active list; cannot add render-prop wiring or rewire props (that's Lane A)
- `scripts/audit-ssr-in-appkit.mjs` + its baseline
- `ssr-arch-tracker.md` — **exclusive owner**
- `newchange.md` — append-only, prefix each block `[SSR]`

### Lane B is READ-ONLY on (do not write)

- `appkit/src/features/**`, `appkit/src/seed/**`, `appkit/src/ui/**`
- `src/app/api/**` (read to migrate logic out; do not change behaviour)
- `src/constants/**`, `src/components/**`
- `crud-tracker.md`

### Repository edits — additive only

You may **add** new methods to a repository if a data layer needs it, but **never** rename or remove methods Lane A may be calling. If a method must change shape, file a `[SSR→CRUD]` seam request at the top of `newchange.md` and pick a different task while you wait.

### Coordination protocol

Before touching any feature, read the top of `newchange.md` for the `[ACTIVE-FEATURES]` block:

```
[ACTIVE-FEATURES]
- products → Lane A (Tier V form polish)
- bundles → Lane B (S3 data layer)
```

- If your target feature is owned by Lane A, **pick a different task** — do not push through.
- When you start a task, prepend a line for your feature (`<feature> → Lane B (<S#> <task-name>)`); when done, remove it in the same commit that closes the task.

### Rebase cadence

At the start of every turn: `git fetch && git rebase origin/main`. Before every commit: `npm run check` exits 0. If you hit a merge conflict in a Lane A file, **abort the rebase and ping Lane A** — do not edit its file to resolve.

---

## 🛑 NON-NEGOTIABLE RULES (CLAUDE.md)

- **Rule #1** — stop and ask before any autonomous decision / scope deviation
- **Rule #2** — ✅ does not mean working; re-read source, never trust the tracker
- **Rule #3** — schema/logic change updates every caller + seed + types in the same session
- **Rule #4** — never fix without first verifying the bug is still present in the current source
- **Rule #5** — task is not done until `npm run check` exits 0

### Quality gate (Rule #5)

```bash
npm run check
```

Runs (fail-fast):
1. `tsc --noEmit` in `appkit/` (`check:types:appkit`)
2. `tsc --noEmit` in `letitrip.in/` (`check:types:app`)
3. `appkit/scripts/audit-violations.mjs` — `_internal/` boundary check
4. `appkit/scripts/verify-entries.mjs` — client entry firebase-admin free
5. `appkit/scripts/verify-css-build.mjs` — compiled CSS class completeness
6. `scripts/audit-ssr-in-appkit.mjs` — route-shim thresholds + sidecar + brand strings
7. `eslint src` — full lir/* rule set

The Stop hook runs `npm run check:audits` automatically each turn. **Treat any audit regression as your problem to fix in the same turn.**

### SSR-specific subset commands

- `npm run check:types` — both repos' tsc only
- `npm run check:audits` — fast (~2s)
- `node scripts/audit-ssr-in-appkit.mjs` — your primary metric; baseline currently 8

---

## 🧭 SSR GUIDING PRINCIPLE — Keep SSR Code in appkit

The default home for SSR code is **`appkit/src/_internal/server/features/<feature>/`**, not `letitrip.in/`. Only leave a thin shim in `letitrip.in/` when the Next.js framework forces it (route file location, edge runtime entry, conventional file names).

### What belongs in appkit (per feature)

| Layer | File | Purpose |
|-------|------|---------|
| Data fetch | `data.ts` | `getXForDetail(slug)` etc. with `React.cache` dedup |
| Adapter | `adapters.ts` | `OrderDocument → Order`, `toClientX(doc)` |
| Server actions | `actions.ts` | `"use server"` mutations, validation, repo calls |
| Metadata | `metadata.ts` | `buildXMetadata(doc, opts?) → Metadata` |
| OG renderer | `og.tsx` | `renderXOgImage(doc, opts?) → ImageResponse` |
| Sitemap | `data.ts` (`listSitemapX`) | `{ url, lastModified, changeFrequency, priority }[]` |
| Barrel | `index.ts` | Re-export public surface |
| Schemas/types | `_internal/shared/features/<feature>/` | Zod + TS types shared client+server |
| Constants | `_internal/shared/features/<feature>/config.ts` | Page sizes, limits, defaults |

### What MUST stay in `letitrip.in/`

- `page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts` — Next.js requires these paths. **Make them thin shims (≤30 lines).**
- `middleware.ts` / `proxy.ts` (Next.js 16+)
- API route handlers — they wire request/response to appkit server functions (Lane A territory)

### Encapsulation + Override Contract (re-read before adding any public function)

Every public function takes an optional final `opts?: XOptions` parameter, even if empty today. Every view component accepts at least one `renderXxx` slot prop. Override hierarchy (least → most invasive):

1. Config/tokens (`siteSettings.theme`, `LabelsProvider` partial map, `appkit.config.js`)
2. Options object (`renderXOgImage(doc, { theme, headline, layout: "compact" })`)
3. Render-prop slots (`<XDetailView renderActions={…}>`)
4. Adapter wrap (`const myToClient = (doc) => decorate(toClientX(doc))`)
5. Replace the call (call repository directly; skip the helper)
6. Fork via patch — only when the seam doesn't exist yet. File a tracker entry; ship the seam.

### Red flags

- A `_transform.ts` / `_adapter.ts` next to an API route that another page would also need → lift to `_internal/server/features/<feature>/adapters.ts`
- An `opengraph-image.tsx` with >40 lines of layout JSX → extract renderer to appkit
- A `page.tsx` that does any non-trivial Firestore querying or data shaping → move to `data.ts`
- Duplicate fetch logic in `page.tsx` + an API route → both should call the same appkit function
- Hardcoded `"LetItRip"`, `"letitrip.in"`, currency symbols, or route strings **inside `_internal/`** → pipe through `appkit.config.js` / `ROUTES` / `LabelsProvider`

---

## SESSION STATE

### 🔜 Next sessions (from `ssr-arch-tracker.md` Summary)

| Session | Scope | Status | Concrete remaining work |
|---------|-------|--------|------------------------|
| **S1** | Foundation | ✅ Done | Two stale items: (a) cli-move premise stale — reclassify; (b) `eslint.config.mjs` — additive spread `defineEslintConfig()` (do NOT wholesale replace — would delete 315 lines of lir/* rules) |
| **S2** | Reference: products | ✅ Done | Sitemap/manifest/robots migrations deferred — pick up in S7 |
| **S3** | Catalog & Listings | 🔄 In progress | bundles + grouped + sublisting data layers; `BrandDetailPageView` type alignment (`BrandDocument` ↔ `CategoryDocument` mismatch); 4 hardcoded `"LetItRip"` strings inside `_internal/` (incl. `_internal/server/features/blog/actions.ts:18`) |
| **S4** | Transactional + Functions batch 1 | ⚠️ Server layers done | Functions migration: `_internal/server/jobs/runtime/{types,adapters/firebase}.ts` + 7 handlers (promotions, onOrderCreate, onOrderStatusChange, auctionSettlement, autoPayoutEligibility, couponExpiry, offerExpiry); checkout + payments server layers; `firebase deploy --dry-run` parity |
| **S5** | Per-user + Homepage + Search | ⚠️ Server layers done | Consumer wiring gaps (mostly Lane A territory now); audit for any remaining server-layer holes |
| **S6** | Seller + Admin + Content | ⏳ Pending | Admin/seller server layers; `ListingScaffold` + `DetailScaffold` extraction |
| **S7** | Cross-cutting + cleanup | ⏳ Pending | Reduce `audit-ssr-in-appkit` baseline 8 → 0; sitemap/robots/manifest migrations; lift remaining one-off `_transform.ts` files |

---

## HOW TO WORK

### Before writing any code

```
1. Read ssr-arch-tracker.md → find the next ⏳ task, mark it 🔄
2. Read newchange.md [ACTIVE-FEATURES] block → confirm Lane A is NOT on the same feature
3. Read appkit/src/_internal/server/features/products/ as the template
4. Read every source file you will touch — never code from memory
5. Run: npm run check → must exit 0 before you begin
6. If context feels fuzzy (too many files in mind) → STOP and start a fresh session
```

### Per-task loop

```
1. PLAN      Write 3–5 bullets: which appkit files, which consumer shims (if any). Stop if a Lane A file appears.
2. LANE      Prepend [ACTIVE-FEATURES] line in newchange.md for this feature → Lane B
3. SCAFFOLD  Create the per-feature directory matching the layered template (data/adapters/actions/metadata/og/index)
4. CODE      Implement smallest correct change. Every public fn takes opts?. Every view accepts renderXxx.
5. EXPORT    Add new symbols to server-entry.ts (and client-entry.ts only if client-safe)
6. CHECK     npm run check → 0 errors (full gate)
7. AUDIT     node scripts/audit-ssr-in-appkit.mjs → no NEW violations (baseline 8 must not grow)
8. VERIFY    For OG renderers: curl http://localhost:3000/en/<route>/opengraph-image → 200 image/png
             For pages: curl … | grep <expected-content> → present in initial HTML (no JS)
9. COMMIT    feat(ssr)/wire(ssr)/refactor(ssr): one-line description (one task per commit)
10. TRACKER  Mark task ✅ in ssr-arch-tracker.md with one-line done note + timestamp
11. LANE-CLR Remove [ACTIVE-FEATURES] line in the same commit that closes the task
12. NEWCHANGE Prepend task entry to newchange.md prefixed [SSR]
13. PROMPT   Update 🔄 CURRENT task status in this file
```

### Per-task checklist

```
□ TRACKER     Marked 🔄 at start; marked ✅ with note at end (ssr-arch-tracker.md ONLY)
□ TEMPLATE    Feature dir has data.ts / adapters.ts / actions.ts / metadata.ts / og.tsx (if applicable) / index.ts
□ OPTS        Every new public fn accepts opts?: XOptions (even if empty)
□ SLOTS       Every new view component accepts at least one renderXxx slot prop
□ NO-HARDCODE No "LetItRip" / "letitrip.in" / currency symbols / hardcoded route strings inside _internal/
□ EXPORTS     Added to server-entry.ts; client-entry.ts only if client-safe (no firebase-admin in import chain)
□ SHIM        Consumer page.tsx / opengraph-image.tsx is ≤30 lines after this change
□ CHECK       npm run check exits 0
□ AUDIT       audit-ssr-in-appkit baseline did NOT grow (ideally shrank)
□ MANUAL      Browser-verified the affected route renders correctly with JS disabled (where applicable)
□ COMMIT      Correct format, one task only
□ NEWCHANGE   Prepended [SSR] block
□ PROMPT      This file updated (CURRENT status)
```

### End-of-session checklist

```
□ CHECK       npm run check exits 0 in BOTH repos
□ AUDIT       node scripts/audit-ssr-in-appkit.mjs — baseline same or reduced
□ FUNCTIONS   If Functions migration touched: firebase deploy --only functions --dry-run → no new triggers, no missing triggers
□ RECHECK     Scroll back through the session — every change discussed is present. Add ⏳ entries for anything deferred.
□ QUALITY     Read every new file for: opts?: parameter slot · renderXxx slots · no hardcoded strings · React.cache wrap on data fns · sideEffects safety
□ TRACKER     ssr-arch-tracker.md: tasks ✅ with timestamp; session row ✅; Summary updated
□ MEMORY      memory/project_ssr_status.md (NOT project_status.md — that's Lane A's) prepended with bullet summary
□ NEWCHANGE   newchange.md prepended with session entry: [SSR] + files-changed + deferred
□ PROMPT      This file: move session to LAST COMPLETED (keep only 1 block); set CURRENT to next session
□ APPKIT      npm run build in appkit/ — dist/ up to date. Do NOT npm publish unless user asks.
□ COMMIT      Code commit first; docs commit second; never batch unrelated tasks
```

---

## CODE STANDARDS (SSR-specific additions to prompt.md)

### Server vs client boundaries

```
appkit/src/_internal/client/**   → React components, hooks, providers. NO firebase-admin imports.
appkit/src/_internal/server/**   → data layers, actions, repositories. NO React client hooks.
appkit/src/_internal/shared/**   → types, Zod, constants. NO React, NO firebase-admin, NO _internal/client, NO _internal/server.
```

`audit-violations.mjs` enforces these. If it fails, fix the import — do not add an exception.

### React.cache discipline

Every data-fetch function exposed to a page+`generateMetadata` pair MUST be wrapped in `React.cache`:

```ts
import { cache } from "react";
export const getXForDetail = cache(async (slug: string) => { … });
```

This dedups the Firestore read between `generateMetadata` and the page render in the same request.

### OG renderer pattern

Reference: `appkit/src/_internal/server/features/products/og.tsx` + `src/app/[locale]/products/[slug]/opengraph-image.tsx` (23-line shim).

- Renderer returns `ImageResponse`. Pure JSX-in / JSX-out — no env reads, no global state.
- Consumer shim: fetch doc → call renderer → return. ≤30 lines.
- Theme accent + layout come from `opts`. Never hardcode.

### Turbopack client-bundle trap (re-read before exporting anything from index.ts)

`appkit/package.json "sideEffects": false` is the safety net. Never remove it.

| Export type | `index.ts` | `client-entry.ts` | `server-entry.ts` |
|-------------|:----------:|:-----------------:|:-----------------:|
| UI / hooks / ROUTES / tokens / pure constants | ✅ | ✅ | ❌ |
| Repositories | ✅ | ❌ | ✅ |
| firebase-admin providers, `"use server"` fns | ❌ | ❌ | ✅ |

Top-level (module-scope) calls to firebase-admin APIs in any appkit file = client-bundle break in Turbopack production. Use lazy getters (`getAdminDb()` etc.) only inside functions.

---

## QUICK REFERENCE

### Key files

| What | Where |
|------|-------|
| SSR task tracker | `ssr-arch-tracker.md` |
| Session log + deferred | `newchange.md` |
| Reference feature (S2 template) | `appkit/src/_internal/server/features/products/` |
| Reference OG shim | `src/app/[locale]/products/[slug]/opengraph-image.tsx` |
| Reference page shim (initialX wiring) | `src/app/[locale]/auctions/[id]/page.tsx` |
| Server entry | `appkit/src/server-entry.ts` |
| Client entry | `appkit/src/client-entry.ts` |
| Boundary audit | `appkit/scripts/audit-violations.mjs` |
| Route-shim threshold audit | `scripts/audit-ssr-in-appkit.mjs` |
| Functions root | `appkit/functions/src/` |
| Layered template doc | `ssr-arch-tracker.md` §Encapsulation + Override Contract |

### Commit format

```
feat(ssr): description
wire(ssr): description
refactor(ssr): description
chore(ssr): description

- file A — what changed
- file B — what changed
- Root cause / reason: one sentence
```

One task per commit. Never batch tasks. Never commit with check failures.

---

## WHAT NOT TO DO

```
✗ Make autonomous decisions — stop, write intent, wait for confirmation (CLAUDE.md Rule #1)
✗ Trust a ✅ tracker entry without re-reading the source file (CLAUDE.md Rule #2/4)
✗ Edit any path Lane A owns — features/**, seed/**, ui/**, api/**, constants/**, components/**, crud-tracker.md
✗ Mass-replace eslint.config.mjs with defineEslintConfig() — additive spread only (315 lines of lir/* rules would be deleted)
✗ Add a public function without an opts?: XOptions parameter (even if empty today)
✗ Add a view component without at least one renderXxx slot
✗ Hardcode "LetItRip" / "letitrip.in" / currency / route strings inside _internal/
✗ Add a top-level firebase-admin import to any file reachable from index.ts or client-entry.ts (Turbopack trap)
✗ Remove "sideEffects": false from appkit/package.json
✗ Skip React.cache on a data fn used by both page+generateMetadata
✗ Edit root firestore.indexes.json directly — edit appkit/firebase/base/ then run firebase-merge.mjs
✗ Bypass quality gates — npm run check must pass before every commit (Rule #5)
✗ Run git push unless the user asks
✗ npm publish appkit unless the user explicitly asks
✗ Run vercel --prod or firebase deploy unless the user explicitly asks
✗ Keep more than 1 LAST COMPLETED block in this file — drop oldest on every session end
```
