# CLAUDE.md — LetItRip Project Guide

> Read this file at the start of every session. It is the single source of truth for project context, rules, and data references that are not already in the code.
>
> **Brand name**: **LetItRip** — always this exact casing in UI copy, messages, and documentation. Domain is letitrip.in but the brand display name is LetItRip. Never write "LetiTrip", "Letitrip", or "Let It Rip".
>
> **Tracker** → `crud-tracker.md` (SSR rearchitecture rows folded in 2026-05-12). **Working prompt** → `prompt.md`. The lane-split experiment with `ssr-arch-tracker.md` / `ssrprompt.md` was wound down 2026-05-12 — reunified into the single tracker + prompt. SSR architectural rules live below in § "SSR Architecture"; duplication keep-vs-consolidate criteria in § "Duplication Decision Framework".

## Index

- [🛑 Rule #1 — Stop and Ask Before Deciding](#-rule-1--stop-and-ask-before-deciding)
- [🛑 Rule #2 — ✅ Does Not Mean Working](#-rule-2---does-not-mean-working)
- [🛑 Rule #3 — Schema/Logic Changes Must Update Older Functionality](#-rule-3--schemalogic-changes-must-update-older-functionality)
- [🛑 Rule #4 — Never Fix Without Verifying It Is Actually Broken](#-rule-4--never-fix-without-verifying-it-is-actually-broken)
- [🛑 Rule #5 — Definition of Done: All Quality Gates Pass](#-rule-5--definition-of-done-all-quality-gates-pass)
- [🛑 Rule #6 — Code Within Vercel Hobby Tier Limits](#-rule-6--code-within-vercel-hobby-tier-limits)
- [Firebase Functions & Firestore Budget](#firebase-functions--firestore-budget-blaze-free-tier)
- [🛑 Rule #7 — All CTAs Must Use the Action Registry](#-rule-7--all-ctas-must-use-the-action-registry)
- [🛑 Rule #8 — Never Defer Work](#-rule-8--never-defer-work)
- [🛑 Rule #9 — Forms & Inputs Must Use Appkit Primitives](#-rule-9--forms--inputs-must-use-appkit-primitives)
- [🛑 Rule #10 — Never Run Dev Server or Deploy Without Explicit Request](#-rule-10--never-run-dev-server-or-deploy-without-explicit-request)
- [Project Summary](#project-summary)
- [Key Files to Read Before Any Session](#key-files-to-read-before-any-session)
- [Seed Data Reference](#seed-data-reference)
- [Slug Prefix System](#slug-prefix-system-enforced-everywhere)
- [ID Generators Reference](#id-generators-reference)
- [Media Filename Slug Patterns](#media-filename-slug-patterns)
- [Appkit Patterns](#appkit-patterns-re-read-before-writing-any-component)
- [Seed API Reference](#seed-api-reference)
- [Firebase Infra Scripts](#firebase-infra-scripts-appkitscripts)
- [CSS Variable Reference](#css-variable-reference-sticky-positioning)
- [appkit Export Rules](#appkit-export-rules)
- [Appkit Publish & Deploy Rules](#appkit-publish--deploy-rules)
- [SSR Architecture](#ssr-architecture)
- [Listing Types Reference](#listing-types-reference)
- [Categories & Brands Reference](#categories--brands-reference)
- [Duplication Decision Framework](#duplication-decision-framework)
- [Recurrent Root Cause Patterns](#recurrent-root-cause-patterns)
- [Known TS Patterns to Avoid](#known-ts-patterns-to-avoid)
- [CTA Registry Rules](#cta-registry-rules)
- [Codebase Exports Catalog](#codebase-exports-catalog)
- [UI Primitive Rules](#ui-primitive-rules)
- [Animation Rules](#animation-rules)
- [Media Upload Rules](#media-upload-rules)

---

## 🛑 RULE #1 — STOP AND ASK BEFORE DECIDING

**Never make autonomous decisions.** Before you:
- Choose between two implementation approaches
- Skip any part of a spec because it "seems like over-engineering"
- Mark a task ✅ based on your own judgement
- Deviate in any way from the description in `crud-tracker.md`
- Add, remove, or rename any field, route, component, or file beyond the scope of what was asked

**STOP. Write out what you're about to do and WHY. Wait for the user to confirm before writing any code.**

One question costs nothing. A wrong autonomous decision has compounded across many sessions in this project and caused regressions that required parallel sessions to fix. Do not be the cause of the next one.

---

## 🛑 RULE #2 — ✅ DOES NOT MEAN WORKING

Many tasks marked ✅ in `crud-tracker.md` have regressions in the browser. The user is aware and may be fixing them in a parallel session. When you touch any ✅ area:
1. Re-read the source files — never code from memory or tracker descriptions alone.
2. If you find it is broken, change the tracker status to ⚠️ (done-but-verify) and add a note.
3. Never assume a ✅ task is correct just because it was previously marked done.

---

## 🛑 RULE #3 — SCHEMA/LOGIC CHANGES MUST UPDATE OLDER FUNCTIONALITY

When implementing a new feature that changes a schema, data model, API contract, or shared logic:

1. **Identify all existing callers** — search for every component, hook, repository method, API route, or seed file that touches the changed field/type.
2. **Update them in the same session** — do not leave older code inconsistent with the new schema. Partial updates create silent runtime bugs that are hard to trace.
3. **Verify the seed data** — if a Firestore collection schema changes, update the corresponding seed file in `appkit/src/seed/` so new seed documents match the new shape.
4. **Update types** — if a TypeScript type in `appkit/src/features/*/types.ts` changes, search for all downstream casts, spreads, and destructures and update them too.

**Why:** In this project, schema drift across sessions (hooks not updated when API contracts change, seed data not reflecting new required fields) has caused silent failures that surface only at runtime.

---

## 🛑 RULE #4 — NEVER FIX SOMETHING WITHOUT VERIFYING IT IS ACTUALLY BROKEN

Before touching any code in response to a bug report, plan note, or memory entry:

1. **Read the current source file** — do not rely on bug descriptions from memory files, plans, or old session notes.
2. **Confirm the bug is present** — if the code already handles the case correctly, mark the bug resolved and move on without writing any code.
3. **Check when the file was last modified** — `git log -1 -- <file>` tells you whether it was already fixed in a recent session.

**Why:** All 8 bugs documented in the appkit bug catalog (BUG-1 through BUG-8) were verified in Session 89 and found to be already fixed. Acting on stale bug reports caused unnecessary re-implementation risk. Plan files and memory entries describe what was true when written — not necessarily what is true now.

---

## 🛑 RULE #5 — DEFINITION OF DONE: ALL QUALITY GATES PASS

Before reporting any code change as complete, run the full quality gate set:

```
npm run check
```

This runs (in order, fail-fast):
1. `tsc --noEmit` in `appkit/` (`check:types:appkit`)
2. `tsc --noEmit` in `letitrip.in/` (`check:types:app`)
3. `appkit/scripts/audit-violations.mjs` — `_internal/` boundary check
4. `appkit/scripts/verify-entries.mjs` — client entry firebase-admin free
5. `appkit/scripts/verify-css-build.mjs` — compiled CSS class completeness
6. `scripts/audit-ssr-in-appkit.mjs` — route-shim thresholds + sidecar files + brand strings inside `_internal/`
7. `eslint src` — full lir/* rule set

For lint-fixable issues use `npm run check:fix` (runs `lint:fix` first, then full check).

**Subset commands** for fast iteration:
- `npm run check:types` — both repos' tsc only
- `npm run check:audits` — all audit scripts (~5–10s total); thin alias of `npm run audit:all`
- `npm run check:lint` — eslint on both `src` and `appkit/src`

**Audit dispatcher** (replaces the 49 legacy `audit:*` script aliases):
- `npm run audit:all` — run every audit in registry order (fail-fast)
- `npm run audit <name>` — run one audit by name (`npm run audit ssr-in-appkit`)
- `npm run audit:fix` — run all audits forwarding `--fix` where supported (hex-tokens today)
- `npm run audit:list` — print the registry
- Registry lives at [scripts/run-audits.mjs](scripts/run-audits.mjs); to add an audit, add a new entry to the `AUDITS` array there. **Don't** add a per-audit script alias to `package.json`.

**Other dispatchers**:
- `npm run firebase <generate|deploy|reset>` — replaces `firebase:generate`/`firebase:deploy[:rules|:indexes]`/`firebase:reset[:all]`. `--only indexes` and `--only rules` are convenience shortcuts.
- `npm run test:qa <smoke|pw|audit>` — replaces `test:smoke[:only]`/`test:pw[:only]`/`test:audit[:existing]`. Forwards `--only`, `--use-existing`, etc.

**Stop hook automation**: `.claude/settings.json` runs the fast audits (`check:audits`) automatically at end of every Claude turn via `scripts/claude-hooks/check-on-stop.mjs`. Failures block the turn and surface to the assistant for fixing. **Every audit is now strict zero-tolerance** — there is no baseline-drift mode; any violation `> 0` fails the audit. Legitimate dynamic patterns are handled by explicit per-line suppression markers (`// audit-inline-style-ok`, `// toast-handled-by-hook`, `// toast-intentionally-silent`, `// reexport-from-internal-ok`, `// audit-sieve-views-ok`, `// audit-variant-ok` — primitives whose internal CSS the audit must allow) at the site of the decision, each with a brief reason. tsc + lint are excluded from the Stop hook because they are too slow per-turn; run `npm run check` manually before commits.

**Pre-commit**: the `pre-commit` npm script is wired to `npm run check`. If you have a git hook runner installed, use it.

**A task is not complete until `npm run check` exits 0.** Do not mark a task ✅ in any tracker, do not write a session summary, do not propose a commit, until the full gate passes.

---

## 🛑 RULE #6 — CODE WITHIN VERCEL HOBBY (FLUID COMPUTE) TIER LIMITS

This project deploys to Vercel **Hobby** with **Fluid Compute enabled** (1 vCPU Standard, 2 GB function memory, Node 22.x, region `iad1`). Every API route, server action, and Server Component you write must respect the ceilings below. Local dev (`npm run dev:hot`) enforces these via `VERCEL_HOBBY_TIER=1` in `scripts/dev-next.mjs`. The default `npm run dev` (build+start) runs a production server that matches Vercel's runtime behavior.

**Build machine exception (2026-08-20)**: the account was upgraded to **Pro** specifically to move the *build machine* off Hobby's 8 GB Standard tier to a 16 GB Enhanced machine (`vercel.json` has no explicit build-machine override — Enhanced is now the account default) — Turbopack's build-time peak RSS for this app (~5.7–6.2 GB, verified locally) didn't reliably fit in Hobby's real available headroom, causing repeated OOM/SIGKILL build failures even though the code itself was correct (see the 2026-08-20 server-only-leak saga below and Root Cause #24-adjacent findings). **This is a build-time-only exception.** Every *runtime* ceiling below (function memory, timeouts, payload, quotas) is still deliberately treated as Hobby-tier and must keep being respected when writing new code — the Pro upgrade was not an invitation to write less defensive code or lean on higher runtime limits Pro would otherwise unlock. The goal is to avoid inflating Vercel usage/credit consumption beyond what the build-machine fix required.

| Limit | Ceiling | Env var | Implication for new code |
|------|---------|---------|--------------------------|
| Function memory | **2048 MB** (Fluid Standard) | `VERCEL_FUNCTION_MEMORY_MB` | Don't buffer entire collections into memory. Stream Firestore results, paginate, never load > a few MB at once. **This is also the empirically-derived dev-server heap cap** (probe-dev-heap-cap.mjs 2026-05-12 showed 1024 MB OOMs the dev server under load; 1536 MB survives but exceeds the cap in RSS; 1536 + 512 MB headroom = 2048 MB). `package.json` `dev:only` sets `NODE_OPTIONS=--max-old-space-size=2048`. |
| Sync function timeout | **10 s** | `VERCEL_FUNCTION_TIMEOUT_S` | A request that fans out to many Firestore reads must batch + early-return. No N+1 loops over hundreds of docs in one handler. Offload long work to a Firebase Function. |
| Background function timeout | **60 s** | `VERCEL_BACKGROUND_TIMEOUT_S` | The hard ceiling for any handler we mark `runtime: "nodejs"` and let run async. Anything heavier belongs in `functions/`. |
| Request payload | **4.5 MB** | `VERCEL_MAX_PAYLOAD_BYTES` | Never accept raw image bytes in JSON. Use the `/api/media` signed-URL upload flow. |
| Image optimization input | **50 MB** | `VERCEL_MAX_IMAGE_BYTES` | Reject `next/image` sources larger than this; pre-resize on upload. |
| Build machine memory | **16 GB** (Pro Enhanced, since 2026-08-20 — was 8 GB Hobby Standard) | — | Build output per function still caps at 250 MB compressed; don't pull large native modules into `src/app/api/**`. This is a build-time-only exception — see the callout above. |
| Fluid Active CPU | 4 h / 30 d on Hobby | dashboard | Cache aggressively. Every cold start counts. |
| Function invocations | 1 M / 30 d on Hobby | dashboard | Same reasoning — caching > invoking. |

**Hard rules when writing new code:**

1. **API routes**: paginate every list endpoint (`pageSize <= 50`), never `findAll().map()` without a bound. Return early on auth/validation failures.
2. **Server actions / RSC data fetches**: budget yourself to ~3 sequential Firestore round-trips. Parallelise the rest with `Promise.all`. If you need more, hand off to a Firebase Function and return a job ID.
3. **Heavy work** (PDFs, sharp transforms, batch settlements, prize raffles, payout runs) belongs in `functions/` — never in a Next.js API route. The 10 s timeout will kill it in production even when local seems fine.
4. **Uploads**: bytes never go through Next.js. Client → signed URL → Firebase Storage → media slug returned. The 4.5 MB request cap makes any direct upload route a regression waiting to happen.
5. **Caching**: every public GET should set `Cache-Control: public, max-age=…, s-maxage=…, stale-while-revalidate=…` so the Hobby compute quota survives traffic. Cold-start prevention is **disabled** on this project, so every uncached miss is a real cold start.
6. **Logging**: don't `console.log` per-row inside loops — Hobby's log buffer drops at ~4 KB/s. Aggregate before logging.

**Verification** (only when the user asks to run/verify locally — see [Rule #10](#-rule-10--never-run-dev-server-or-deploy-without-explicit-request)): `npm run dev` prints a `[dev-next] Vercel Hobby parity ON — memory=2048 MB …` banner confirming the caps are wired. To debug a specific route under the prod cap, hit it locally; the same 10 s / 2048 MB ceiling is in effect.

---

## Firebase Functions & Firestore Budget (Blaze Free Tier)

> The Firebase-side equivalent of Rule #6's Vercel table. This project runs on the **Blaze** (pay-as-you-go) plan — required for Cloud Functions — but stays within Blaze's *included free quota* wherever practical, since this is a low-traffic hobby/demo site, not a funded business. "Free" below means "covered by the standing Google Cloud free tier that persists on Blaze," not Spark-only limits.

| Resource | Free tier ceiling | Current usage | Implication |
|---|---|---|---|
| Cloud Functions invocations | 2,000,000 / month | Scheduled-function traffic alone is ~50–60K/month across all cron jobs (see inventory below) — nowhere close to the ceiling even before counting real user-triggered invocations. | Not a cost risk at this traffic level. Don't add unbounded per-request Functions triggers (e.g. a Firestore trigger that fires on every write of a hot collection) without checking this stays true. |
| Cloud Scheduler jobs | **3 free jobs per billing account** (billed per registered job, not per invocation — additional jobs are ~$0.10/job/month) | **28 scheduled functions = 28 Scheduler jobs** (~$2.50/month) as of 2026-08 (27 predates this session; `testerSandboxRefresh` — every-4h tester-sandbox revert+prune, see Tester QA Program below — added this session per this row's own accepted-cost policy). | **Known, accepted cost** — the alternative (consolidating same-cadence functions into shared dispatcher functions to shrink job count toward the free 3) was evaluated and explicitly deferred: it touches 27+ working functions for a few dollars/month of savings, more engineering risk than it's worth right now. Don't "discover" this again and churn on it — it's a documented tradeoff, not a bug. Revisit only if Scheduler costs grow materially (e.g. from adding many more distinct-cadence jobs). |
| Firestore reads/writes/deletes | 50,000 reads / 20,000 writes / 20,000 deletes per day (resets ~midnight Pacific), 1 GiB storage, 10 GiB egress/month | Low at current traffic. | **Prefer pre-computed rollups over per-request full-collection scans** — this is the actual lever that matters more than Functions invocation count. See `revenueRollup` (`appkit/src/_internal/server/jobs/core/revenueRollup.ts`) for the pattern: a daily scheduled Function pre-aggregates into a small singleton doc, and the API route becomes a single-doc read instead of scanning every order on every dashboard load. Apply the same pattern to any other unbounded per-request Firestore scan found in the future. |
| Realtime Database | 1 GiB stored, 10 GiB downloaded/month (Spark-only free allowance; Blaze is pay-as-you-go beyond a much smaller included amount) | Used only for the `bulk_events` ping channel (async job status) — tiny payloads, short-lived. | Low risk; don't start storing large or long-lived data in RTDB. |
| Cloud Storage | ~5 GB "Always Free" (separate from Firebase's own quotas, a GCP account-level allowance) | Media uploads (product images, etc.) | Already routed through the watermark/proxy pipeline (Media Architecture rules) — no action needed here specifically for budget, just keep following those existing rules. |

**When adding a new scheduled Function**: prefer folding new periodic work into an *existing* cadence bucket (there's already a `every 5 minutes`, `every 15 minutes`, and several `daily` slots — see the inventory in `appkit/src/_internal/server/functions/scheduled.ts`) only when it's a natural fit; otherwise a new distinct-cadence job is fine — the marginal Scheduler cost (~$0.10/month) is intentionally accepted per the row above rather than a blocker to route around.

**When a Vercel API route looks like a 10s-timeout risk** (unbounded Firestore scan, external API call with no bound, PDF/image processing): default to the existing Async Job Primitive (`enqueueJob()` → `JOB_RUNNERS` registry → `onJobCreated` Firestore trigger) before reaching for a new dedicated Firebase Function type — it's the same underlying Cloud Functions budget either way, but reuses the established job-status UX (`useBulkEvent`) instead of inventing a new client-polling pattern each time.

**Known follow-up, not yet done**: `src/app/api/media/crop/route.ts` and `src/app/api/media/trim/route.ts` both run `sharp` (native binary) synchronously in-process — real 10s-timeout risk on large images, and `media/trim` already has a comment noting it needs to move to Firebase Functions. Migrating these requires adding `sharp` to the Firebase Functions runtime dependencies (native binary — needs verification it deploys cleanly) and a new HTTPS Function endpoint; deferred as a distinct, riskier follow-up rather than rushed alongside the lower-risk migrations (`newsletterExport` job, `revenueRollup` scheduled Function) done in the same session as this table was added.

---

## 🛑 RULE #7 — ALL CTAs MUST USE THE ACTION REGISTRY

**Every CTA, bulk action, and row action MUST be defined in the action registry.** No exceptions, no "we'll wire it later."

### Source-of-truth files

| File | What it holds |
|------|--------------|
| `appkit/src/_internal/shared/actions/action-registry.ts` | `ACTIONS` tree — resource buckets mapping action-id → `ActionDef` (label, ariaLabel, kind, permissions, confirmation, listingTypeScope, iconKey) |
| `appkit/src/features/products/constants/action-defs.ts` | `ACTION_META`, `ROW_ACTION_META`, `FORM_ACTION_META`, `DASHBOARD_QUICK_ACTION_META` + preset arrays (`ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, etc.) |

### Hard rules

1. **No inline action objects.** Never write `{ id: "delete", label: "Delete", variant: "danger" }` or `{ label: "Approve", onClick: ... }` directly in a view component. Always reference `ACTIONS.{RESOURCE}["action-id"]`, `ROW_ACTION_META[ROW_ACTION_ID.X]`, or a preset array.
2. **BulkActionBar** — actions array MUST come from `ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, or `LISTING_BULK_ACTIONS` preset. Map preset IDs to `{ ...ROW_ACTION_META[id], onClick: handler }`.
3. **RowActionMenu** — actions array MUST come from `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, or `USER_ROW_ACTIONS` preset.
4. **Destructive actions** — every action with `kind: "danger"` or `destructive: true` MUST have a `confirmation` config in `action-registry.ts`. Missing confirmation = immediate irreversible execution.
5. **`<Button action={...}>`** — use the appkit Button's `action` prop to auto-resolve label, ariaLabel, variant, and confirmation dialog from an ActionDef.
6. **New actions** — add to BOTH registries: `ACTIONS.{RESOURCE}["new-action"]` in `action-registry.ts` AND the relevant preset array in `action-defs.ts`. Never create an action that only exists inline.
7. **No `window.confirm()`** — all confirmation dialog strings live in the `ActionDef.confirmation` field.

**Why:** Inline action definitions bypass centralized label management, permission gating, confirmation dialogs, and i18n overrides. Destructive actions without `confirmation` config execute immediately with no user warning. This has caused data loss in prior sessions.

---

## 🛑 RULE #8 — NEVER DEFER WORK

**Complete every task in the current session. Do not defer work to future sessions.**

When implementing a feature, fix, or refactoring:

1. **Finish what you start.** If a task has sub-parts, implement all of them now. Do not write "deferred to S7" or "will be done in a follow-up session."
2. **No partial implementations.** Do not ship a feature with placeholder stubs, TODO comments pointing to future sessions, or half-wired UI that "just needs the backend."
3. **No "deferred to next session" tracker entries.** If a task is in scope, complete it. If it cannot be completed because of a blocking dependency (e.g., a third-party API key that doesn't exist yet), say so explicitly and explain the blocker — don't just mark it deferred.
4. **Fix what you break.** If your changes break an adjacent feature, fix it in the same session. Do not log it as a known issue for later.
5. **Seed data, types, tests, audits** — if your change requires updates to seed data, TypeScript types, audit baselines, or related components, do them now. Not later.
6. **A new page needs its nav entry in the same commit.** A `page.tsx` under `admin/`, `store/`, or `user/` with no sidebar link is exactly as incomplete as a feature with no backend — see Root Cause Pattern #37.

**Why:** Deferred work accumulates across sessions and creates compounding regressions. Every "we'll do it next session" becomes a stale TODO that the next session may not even be aware of. The cost of finishing now is always lower than the cost of context-switching back to it later.

---

## 🛑 RULE #9 — FORMS & INPUTS MUST USE APPKIT PRIMITIVES

**Raw `<form>` / `<input>` / `<select>` / `<textarea>` are banned in product code.** Every form goes through the appkit form primitives:

| Need | Use |
|---|---|
| Compact single-step form (login, address, contact) | [`<Form>`](appkit/src/ui/components/Form.tsx) — wraps `<form>` + mounts `FormShellContext.Provider` automatically |
| Wizard / multi-step with auto-save + publish | [`<FormShell>`](appkit/src/features/shell/FormShell.tsx) (drawer chrome) + [`<StepForm>`](appkit/src/features/shell/StepForm.tsx) (step engine) — state/context comes from [`FormShellProvider`/`useFormShellState`](appkit/src/ui/forms/FormShell.tsx), which `<Form>` also consumes |
| Text input | [`<FieldInput name="…" label="…">`](appkit/src/ui/forms/FieldInput.tsx) |
| Single-select | [`<FieldSelect>`](appkit/src/ui/forms/FieldSelect.tsx) for ≤5 options; [`<PaginatedSelect>`](appkit/src/ui/components/PaginatedSelect.tsx) for >5 |
| Multi-line text | [`<FieldTextarea>`](appkit/src/ui/forms/FieldTextarea.tsx) |
| Checkbox | [`<FieldCheckbox>`](appkit/src/ui/forms/FieldCheckbox.tsx) |
| Submit button | [`<Button action={ACTIONS.<RESOURCE>["…"]}>`](appkit/src/ui/components/Button.tsx) — auto-resolves label, ariaLabel, variant, confirmation |

### Rules

1. **No raw `<form>`, `<input>`, `<select>`, `<textarea>` in `.tsx` outside the primitives themselves.** Enforced by [`scripts/audit-raw-form-input.mjs`](scripts/audit-raw-form-input.mjs).
2. **Schema-driven validation.** Define a Zod schema in `appkit/src/features/<feature>/schemas/`. Parse in the submit handler; for each issue, call `setFieldError(issue.path[0], issue.message)` from the `<Form>` render-prop helpers.
3. **The render-prop form of `<Form>` exposes helpers**: `{ setFieldError, clearErrors, hasErrors }`. Use it whenever the submit handler needs to surface inline errors (the common case).
4. **Manual `useState<string | null>(null)` for error display is forbidden.** Use `FormShellContext` — `FieldInput` already wires `aria-invalid` + the error `<Text role="alert">` block.
5. **Submit buttons use `<Button action={…}>`** — never inline `{ id, label, variant }`. Destructive submits MUST have a `confirmation` config on the ActionDef (Rule #7).
6. **Server-side error → inline field error.** When the API returns `{ ok: false, code, error }`, look up `ERROR_DISPLAY_MAP[code] ?? error` and pipe it into `setFieldError("<targetFieldName>", message)`. The error renders on the field, not a banner.
7. **Per-line escape hatch**: `// audit-raw-form-input-ok: <reason>` on the same line OR the line above. Reserve for genuinely irreducible cases (native `<input type="color">` picker, dev tools).

### Canonical example

```tsx
import { Form, FieldInput, Button } from "@mohasinac/appkit/ui";
import { loginSchema } from "../schemas";

<Form onSubmit={(e) => e.preventDefault()} className="space-y-4">
  {({ setFieldError, clearErrors }) => (
    <>
      <FieldInput name="email" type="email" label="Email" required value={email} onChange={setEmail} />
      <FieldInput name="password" type="password" label="Password" required value={password} onChange={setPassword} />
      <Button
        type="submit"
        isLoading={isPending}
        onClick={async () => {
          clearErrors();
          const parsed = loginSchema.safeParse({ email, password });
          if (!parsed.success) {
            for (const issue of parsed.error.issues) setFieldError(String(issue.path[0]), issue.message);
            return;
          }
          await onSubmit(parsed.data);
        }}
      >
        Sign in
      </Button>
    </>
  )}
</Form>
```

**Why:** Raw `<form>`/`<input>` bypasses Zod validation, FormShell context-driven errors, dirty tracking, `aria-invalid` / `aria-describedby` wiring, i18n labels, and the ACTIONS-registry submit-button pattern. The canonical primitives give all of that for free in one consistent shape across every surface.

---

## 🛑 RULE #10 — NEVER RUN DEV SERVER OR DEPLOY WITHOUT EXPLICIT REQUEST

**Never run `npm run dev`, `npm run dev:hot`, `vercel --prod`, `node scripts/deploy.mjs`, `npm publish` (in `appkit/`), or any Firebase deploy command (`npm run firebase deploy*`) unless the user explicitly asks for that specific action in that specific message.**

1. **Verification does not require a running server.** Prefer `npx tsc --noEmit`, `npm run check` / `npm run check:audits` / `npm run check:lint`, and reading the source to confirm a change is correct. If a change genuinely can only be verified by seeing it render (a UI/CSS change), say so explicitly and ask before starting the dev server — don't start it preemptively "just in case."
2. **Seed/data work never needs a dev server or a deploy.** `npx appkit-seed load/delete/status` talks directly to Firestore via firebase-admin — it does not need `npm run dev` running, and it has no relationship to Vercel deployment at all. Don't start the dev server as a side effect of seed work, and don't suggest deploying after a seed-data change (seed data lives in Firestore and `appkit/dist`, not in a Vercel build).
3. **This overrides the "Default" framing in [Dev Workflow](#dev-workflow) below.** That section describes the dev server as a recommended default workflow *for the user's own use* — it is not standing permission for the assistant to launch it autonomously.
4. **This does not relax [Appkit Publish & Deploy Rules](#appkit-publish--deploy-rules) below — it tightens it.** Publishing appkit to npm and deploying to Vercel already required an explicit ask; this rule makes explicit that the same applies to `npm run dev`/`dev:hot`, which had previously been treated as a low-stakes default anyone could run anytime.

**Why:** Long-running dev-server processes and deploys are exactly the kind of action that should never be taken as a side effect of an unrelated task — they consume the user's compute/quota, can collide with a dev server or deploy the user already has running in another terminal, and (for Vercel) push changes to production. If a task's completion genuinely can't be confirmed without one of these, stop and ask first rather than running it "to be safe."

---

## Project Summary

**LetItRip** — India's largest collectibles marketplace. Monorepo:

| Folder | Purpose |
|--------|---------|
| `d:\proj\letitrip.in\` | Next.js 15 app (App Router) — pages, API routes, public UI |
| `d:\proj\letitrip.in\appkit\` | Internal component library — UI primitives, feature views, Firestore schemas, seed data, repositories |

**Stack**: Next.js 15 (App Router) · Firebase (Firestore + Auth + Storage) · Tailwind CSS · TypeScript · `@mohasinac/appkit` (local package)

---

## Dev Workflow

> 🛑 See [Rule #10](#-rule-10--never-run-dev-server-or-deploy-without-explicit-request) — this section describes commands for the **user's own use**, not standing permission for the assistant to launch a dev server. Don't run either command below unless explicitly asked in that message.

| Command | Memory | Feedback loop | Best for |
|---------|--------|---------------|----------|
| `npm run dev` | ~500 MB | Rebuild ~15-45s | Server logic, low-RAM machines |
| `npm run dev:hot` | ~3.5 GB | Hot-reload <1s | UI iteration, CSS tweaks, live preview |

### `npm run dev` — Build-and-Serve (default)

Runs `scripts/dev-light.mjs`: appkit build → Tailwind CSS → `next build` → `next start`. The production server uses ~300-500 MB vs ~3.5 GB for the hot-reload dev server.

- **First run**: ~60-120s (cold `next build`)
- **Subsequent runs**: ~15-45s (incremental via `.next/cache/`)
- **To rebuild after code changes**: Ctrl+C, then `npm run dev` again
- **Prewarm is unnecessary**: all routes pre-compiled by `next build`
- **Do NOT delete `.next/`** between runs — the cache enables fast incremental rebuilds

`next.config.js` sets `cacheMaxMemorySize: 0` so the production server uses disk cache only, keeping heap low.

### `npm run dev:hot` — Hot-Reload (when needed)

Traditional dev server with webpack HMR + file watchers. Uses ~3.5 GB. Best for rapid UI iteration. Same as the old `npm run dev`.

---

## Key Files to Read Before Any Session

| File | Purpose |
|------|---------|
| `crud-tracker.md` | Master task list — authoritative. Read before every session. |
| `newchange.md` | Session log + deferred items. Check DEFERRED table before starting. |
| `appkit/src/seed/` | All seed data files |
| `appkit/scripts/seed-cli.mjs` | Seed loader/deleter CLI (`npx appkit-seed load\|delete\|status`) — the `/demo/seed` route + SeedPanel referenced in older docs no longer exist |
| `codebaseexports.md` | Comprehensive export catalog — every component, hook, action, route, constant, type, util, registry, schema, seed file. Read before creating anything new. |
| `docs.letitrip.in` (when live) | Authoritative deep docs — developer (UI/server/API), buyer help, seller guides, employee/admin guides. `appkit/index.md` + `src/index.md` remain the in-editor quick-reference. See Tier DX in `crud-tracker.md` for build status. |

---

## Seed Data Reference

> **Updated 2026-08-19** — this section was badly stale (documented a ~Session-77 catalog that no longer exists) and has been corrected against the actual current seed source + a live `npx appkit-seed status` run. The old `/demo/seed` route + SeedPanel described in earlier revisions of this doc **do not exist** — seeding is done via the standalone CLI. See [Seed API Reference](#seed-api-reference) below (also corrected).
>
> **The product catalog is deliberately narrowed to a single franchise (Beyblade)** for a coherent small demo dataset rather than a sprawling multi-brand catalog — see the header comment in `appkit/src/seed/categories-seed-data.ts`. Only **3 real stores** exist (`store-letitrip-official`, `store-beyblade-arena`, `store-tester-qa-seller`) and **16 real products**, all Beyblade, all under `store-beyblade-arena` except the tester-sandbox fixtures. `brands` was merged into `categories` (`categoryType:"brand"`) years ago — there is no standalone brands collection or seed file; do not resurrect one.

### Collection Inventory (30 collections, verified 2026-08-19)

#### Core Foundation

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **users** (18 seeded) | id=slug (`user-`), displayName, email, role (`user`/`seller`/`moderator`/`employee`/`admin`), emailVerified, photoURL, bio, stats | email, phoneNumber, displayName | role, email, createdAt | 1 admin (`user-admin-letitrip`) + 2 real sellers (`user-tyson-blader` owns `store-beyblade-arena`, `user-tester-qa` owns `store-tester-qa-seller`) + remaining ~15 buyer personas. Auth record + Firestore profile. PII encrypted via HMAC blind indices (`emailIndex`, `phoneIndex`). Role predicates: `isAdminUser` / `isSellerUser` / `isModeratorUser` / `isEmployeeUser` / `isBuyerUser` from `@mohasinac/appkit` (SB-UNI-E). |
| **addresses** (3 seeded) | id, ownerType (`user`/`store`), ownerId, label, fullName, phone, addressLine1, city, state, postalCode, country, isDefault | fullName, phone, addressLine1 | ownerType, ownerId, isDefault, createdAt | **Top-level** collection (SB-UNI-A 2026-05-13). Discriminated by `ownerType` — holds both buyer delivery addresses AND store pickup addresses. Replaced the two prior subcollections `users/{uid}/addresses` + `stores/{slug}/addresses`. PII encrypted via `addressesRepository.createWithId` override. Composite indices `(ownerType, ownerId, createdAt desc)` + `(ownerType, ownerId, isDefault)`. |
| **couponUsage** (4 seeded, per-user) | id=couponId, userId, couponCode, usageCount, lastUsedAt, orders[] | — | — | Subcollection `users/{uid}/couponUsage/{couponId}`. Tracks per-user coupon redemption count + all order IDs. Written by `couponsRepository.applyCoupon()` at checkout (fire-and-forget). Read by `getUserCouponUsageCount()` during coupon validation to enforce `perUserLimit`. |
| **stores** (3 seeded) | id=slug (`store-`), ownerId, storeName, storeDescription, storeLogoURL, storeBannerURL, status, isVerified, shippingConfig, payoutDetails, stats | payoutDetails.upiVpa, payoutDetails.accountNumber | ownerId, status, isVerified | `store-letitrip-official` (platform's own store, owner `user-admin-letitrip`), `store-beyblade-arena` (the real seller catalog, owner `user-tyson-blader`), `store-tester-qa-seller` (owner `user-tester-qa`, backs the Tester QA Program). No other stores exist — any seed content referencing a different `storeId` is a bug. |
| **storeAddresses** (3 seeded) | id, storeId, label, fullName, phone, addressLine1, city, state, pincode, isPickupLocation | fullName, phone | storeId | Pickup locations per store; storeSlug MUST match store-* prefix exactly. Written into the same top-level `addresses` collection as user addresses (`ownerType:"store"`) — there is no separate `stores/{slug}/addresses` subcollection. |
| **brands: none — merged into categories.** | — | — | — | `categoryType:"brand"` rows inside `categories` (currently `brand-takara-tomy`, `brand-beyblade`). Use `categoriesRepository.findBySlugAndType(slug, "brand")` / `findActiveBrands()`. See Known TS Patterns table below (SB-UNI-C). |
| **categories** (17 seeded) | id=slug (`category-`), name, slug, parentId, rootId, tier (1/2/3), path, isLeaf, isFeatured, showOnHomepage, display.{icon, coverImage, color, showInMenu}, categoryType (`"listing" \| "brand" \| "bundle"`) | — | parentId, rootId, isLeaf, isFeatured, showOnHomepage, categoryType | Single root: `category-spinning-tops`, 4 generation leaves (`category-beyblade-{original,metal,burst,x}`), 2 brand rows, 5 `categoryType:"bundle"` pricing-bundle rows (SB-UNI-D — see `bundleProductIds`/`bundlePrice`/`bundleQueryRule`, kept in sync on stock change by `syncBundlesForProduct`; `bundleOriginalTotal` — sum of member prices, added 2026-08-19 — drives the discount-% badge via `computeBundleDiscount()`, refreshed daily by `bundleStockSync`). |

#### Listings & Bids

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **products** (30 seeded) | id=slug (`product-`/`auction-`/`preorder-`/`prizedraw-`/`classified-`/`digitalcode-`), storeId, brandSlug, categorySlug, price (INR rupees, decimal), currency:"INR", status, condition, images[] (now 2-3 per item on standard products + auctions), video?, customFields[], customSections[], isFeatured, isPromoted, isNew, isOnSale, listingType | — | storeId, brandSlug, categorySlug, status, isFeatured, isPromoted, price, createdAt | 18 real Beyblade items (12 standard — incl. 4 video-demo fixtures, see below — + 2 auctions — one with a video, see below — + 1 pre-order + 1 prize-draw + 1 classified + 1 digital-code) + 12 tester-sandbox fixtures (2 standard + 2 auctions + 1 pre-order + 1 prize-draw + 1 classified + 1 digital-code + 1 live + 1 art + 1 stickers + 1 bundle-parent — the art/stickers pair added 2026-08-19 so the store detail page's listing-type dropdown has real data on every option). `ProductDocument.video` (2026-08-19) **now has a public rendering path** — `ProductGalleryClient` appends it as a trailing gallery slide (poster thumbnail + play badge); clicking it opens `ImageLightbox` in theater mode. A raw-file `video.url` renders a native `<video controls>` element (zoom/rotate transform still applies, same as image slides); a YouTube-sourced `video.url` (from `MediaUploadField`'s "YouTube" tab) renders a `youtube-nocookie.com` iframe embed instead (`getYouTubeVideoId()`, fixed 2026-08-21 — Recurrent Root Cause Pattern #49) since a native `<video>` element can't play a YouTube watch-page URL. Video-demo fixtures, one per source: `product-beyblade-original-dragoon-f-video-demo` + `product-beyblade-x-dran-sword-video-demo` (raw file, Google's public sample-video bucket), `product-beyblade-metal-dark-bull-video-demo` (YouTube), `product-beyblade-burst-spryzen-video-demo` (raw file, Wikimedia Commons) — plus `auction-beyblade-original-dragoon-storm` carries a YouTube video too, covering a non-standard listing type. `video.url` stays raw/unwrapped for every source per Root Cause #27 (the media proxy is image-only); `video.thumbnailUrl` stays `seedExtMedia()`-wrapped, it's an image. |
| **bids** (8 seeded) | id, productId (= auction slug), bidderId, amount (INR rupees, decimal), status (active/outbid/won/cancelled), bidTime | — | productId, bidderId, status, bidTime | `productId` must match auction slug exactly (SL6 constraint) |
| **groupedListings** (3 seeded) | id, slug, title, description, productIds[], coverImage, groupTheme (`related`/`character`/`lineage`/`set`/`generic`), minActiveMembers, activeMemberCount, visibilityStatus, isActive, isFeatured, storeId?, brandSlug?, categorySlug?, createdBy | — | storeId, brandSlug, categorySlug, isActive, isFeatured, groupTheme, visibilityStatus | **Not a pricing construct** — SB-UNI-V re-scoped this from an old bundle-like shape to a horizontal "you might also like" theme-group scroller with no pricing semantics (pricing bundles live on `categories` instead, see above). `onProductStockChange` recomputes `activeMemberCount`/`visibilityStatus` when a member's stock changes. |

#### Transactional

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **orders** (50 seeded) | id (`order-{itemCount}-{YYYYMMDD}-{rand6}`), buyerId, storeId, items[], totalAmount (INR rupees, decimal), paymentMethod, paymentId, shippingAddress, trackingNumber, carrier, status (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED/REFUNDED/RETURN_REQUESTED) | shippingAddress.fullName, shippingAddress.phone | buyerId, storeId, status, createdAt | All 7 statuses seeded. `generateOrderId`'s random suffix is now a **deterministic hash** (fixed 2026-08-19 — it used to be `Math.random()`, which meant every `appkit-seed load` silently created 50 fresh duplicate orders and `status`/`delete` could never see what a prior run had written). |
| **carts** (4 seeded) | id, userId (null=guest), sessionId, items[], updatedAt | — | userId, sessionId | — |
| **wishlists** (3 seeded) | id (=`wishlist-{userSlug}`), userId, items[]: {productId, productType, addedAt, priceAtAdd, productSnapshot}, updatedAt | — | userId, updatedAt | **One doc per user** at top-level. id === slug. items[] hard-capped at WISHLIST_MAX (20) — server returns 409 `WISHLIST_FULL` on overflow. All mutations wrapped in Firestore txn. Idempotent re-add is a no-op. |
| **history** (3 seeded) | id (=`history-{userSlug}`), userId, items[]: {productId, productType, viewedAt, productSnapshot}, updatedAt | — | userId, updatedAt | **One doc per user** at top-level. id === slug. items[] soft-capped at HISTORY_MAX (50) — silent FIFO evict oldest. Re-visit removes any existing entry for productId and unshifts new entry to position 0. Guest users mirror to `localStorage["letitrip:history"]`; on login `/api/user/history/merge` upserts + dedups by productId (newest viewedAt wins) + trims to 50. |
| **coupons** (10 seeded) | id (`coupon-`), code, name, type (percentage/fixed/free_shipping/buy_x_get_y), scope (admin/seller), sellerId?, discount.{value, maxDiscount, minPurchase}, usage.{totalLimit, perUserLimit, currentUsage}, validity.{startDate, endDate, isActive}, restrictions.{firstTimeUserOnly, combineWithSellerCoupons, applicableProducts, applicableCategories} | — | code, validity.isActive, validity.startDate, validity.endDate, type, createdBy | Current codes: `ARENA25`, `ARENAVIP`, `BLADER50`, `BUYNOW10`, `FREESHIP499`, `LIMITEDSET`, `NEWBLADER`, `REHAN10`, `SEALED20`, `TOURNAMENT2026` — all renamed 2026-08-19 off leftover Yu-Gi-Oh-themed codes (`POKEMON25`, `TOKYOTOYS10`, etc. from stores that no longer exist). |
| **reviews** (65 seeded) | id (`review-`), storeId, productId, buyerId, rating (1-5), title, body, images[] (populated on ~15-20% of reviews), video? (raw unwrapped external URL — see gotcha below), isVerifiedPurchase, sellerResponse?, helpfulCount, publishedAt | — | storeId, productId, buyerId, rating, isVerifiedPurchase, publishedAt | All against the real 14-product Beyblade catalog (multiple reviews per product is expected/normal). `review.video.url` renders via a raw `<video src>` in `ReviewDetailShell.tsx` — it is NOT routed through `/api/media/ext` (image-only proxy, 400s on non-image content-types), so `video.url` must stay unwrapped (don't call `seedExtMedia()` on it); `video.thumbnailUrl` still should be wrapped, it's an image. |
| **payouts** (10 seeded) | id, storeId, sellerId, amount (INR rupees, decimal), status (PENDING/PROCESSING/PAID/FAILED), periodStart, periodEnd, ordersIncluded[], paymentMethod, transactionId? | — | storeId, sellerId, status, createdAt | — |

#### Content & Marketing

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **blogPosts** (21 seeded) | id (`blog-`), title, slug, excerpt, content (rich HTML, now carries 2-3 inline embedded images on rewritten posts), coverImage, youtubeId, authorId, category, tags[], status (draft/published), isFeatured, readTimeMinutes, views, publishedAt | — | slug, category, status, isFeatured, authorId, publishedAt | Rewritten 2026-08-19 off a stale Yu-Gi-Oh theme onto the real Beyblade catalog (17 published + 2 draft + 1 archived, per the file's own header). `BlogPostDocument` has no gallery field — extra images go inline in `content` HTML, not a separate array. |
| **events** (13 seeded) | id (`event-`), title, slug, type (sale/offer/poll/survey/feedback/raffle/spin_wheel/**lottery**), status, tags[], startsAt, endsAt, stats.{totalEntries, approvedEntries}, createdBy. **SB9 raffle fields** (optional): hasRaffle, raffleType (open_raffle/top_n_scorers/top_n_participants/spin_wheel), raffleTopN, rafflePrize, rafflePrizeCouponId, raffleWinnerUserId, raffleWinnerDisplayName, raffleWinnerEntryId, raffleTriggeredAt, raffleEntryCount. **Spin fields**: spinPrizes[] ({id,label,couponId?,weight,isActive}), spinMaxPerUser, spinWindowStart, spinWindowEnd. **Lottery fields**: `lotteryConfig` ({totalSlots, pricingMode, slots[], ...} — see `features/lottery/types.ts`). | — | type, status, startsAt, createdBy, hasRaffle | Already comprehensive across all 8 event types before this session's rewrite (2 poll/survey/sale/raffle/spin_wheel/feedback/offer + 2 lottery) — only the Yu-Gi-Oh-themed narrative content needed fixing, the type coverage was fine. `EventDocument` has no gallery field either — extra images go inline in `description` HTML. |
| **eventEntries** (5 seeded) | id, eventId, userId, userDisplayName, userEmail, status (CONFIRMED/WAITLISTED/CANCELLED), createdAt. **SB9 spin fields**: raffleEligible?, spinUsed?, spinPrizeId?, spinPrizeCouponCode?, spinWonAt?. | userEmail | eventId, userId, status, createdAt | Composite indices `(eventId, status, points DESC)` + `(eventId, status, createdAt)` for raffle pool queries. |
| **carouselSlides** (6 seeded) | id (`slide-`), title, order, active, background.{type, url, mobileUrl, dimOverlay}, cards[], settings.{autoplayDelayMs, height}, createdBy | — | active, order, createdBy, createdAt | 5 active (MAX_ACTIVE_SLIDES=5), 1 inactive. background.type: image/video/color/gradient. **Gotcha (hit 2026-08-19)**: `background.type:"video"` renders via a raw `<video>` element (`MediaVideo`/`HeroCarousel`) — the `url` must be a raw unwrapped external MP4, NOT passed through `seedExtMedia()` (that helper routes through `/api/media/ext`, an image-only proxy that 400s on `video/mp4`). `thumbnail` should still be `seedExtMedia()`-wrapped, it's an image. |
| **homepageSections** (24 seeded) | id (`section-`), type (21 section types), order, enabled, config (type-specific shape) | — | type, order, enabled | All active section types seeded. Config shape varies per type — see `appkit/src/features/homepage/schemas/firestore.ts` |
| **faqs** (63 seeded) | id (`faq-`), question, answer.{text, format:"html"}, category, seo.slug, tags[], searchTokens[], showOnHomepage, showInFooter, isPinned, priority, order, isActive, stats.{views, helpful} | — | category, seo.slug, tags, searchTokens, showOnHomepage, isPinned, priority, isActive, stats.helpful, createdAt | Categories: Shipping/Returns/Payments/Auctions/Pre-orders. Never referenced Yu-Gi-Oh content — untouched by the 2026-08-19 rewrite. |

#### System & Config

| Collection | Key Fields | PII Fields | Indexed Fields | Notes |
|-----------|-----------|-----------|----------------|-------|
| **notifications** (23 seeded) | id (`notif-`), userId, type (10 types), title, body, isRead, entityId, entityType, createdAt | — | userId, type, isRead, entityId, createdAt | Covers all 10 notification types, mixed read/unread. `AdminNotificationsView` gained a "View details" row action (2026-08-21) → `ViewNotificationModal` — was list-only before, no way to see full body/payload/link. |
| **adminAuditLog** (0 seeded — grows organically from real admin actions) | id (Firestore auto-ID), actorUid, actorName?, action (closed enum — see below), targetType, targetId, targetLabel?, reason?, metadata?, createdAt | — | actorUid, action, targetType, createdAt | Added 2026-08-21 (Admin Audit Log MVP). Queryable record of high-value privileged admin actions — NOT an exhaustive every-write-path audit trail. Single write-site: `recordAdminAction()` (`appkit/src/_internal/server/features/audit-log/actions.ts`), best-effort/non-blocking (a failed audit write never fails the underlying action). Instrumented actions (`AdminAuditActionValues`): `user_hard_ban` (hardBanCascade.ts), `user_soft_ban`/`user_unban` (soft-ban/unban routes), `checkout_bypass` (admin checkout-bypass route), `coupon_update` (adminUpdateCoupon), `payout_mark_paid` (adminUpdatePayout, only when status→paid), `store_status_change` (admin store PATCH route), `user_role_change` (adminUpdateUser, only when role actually changes). Admin-only list UI at `/admin/audit-log` (`AdminAuditLogView` + `ViewAuditLogEntryModal`), nav entry under Finance. The only "logs" surface before this (`/admin/maintenance/cloud-logs`) is raw Google Cloud Logging infra output — not actor/action semantics — and still exists unchanged for that purpose. |
| **sessions** (5 seeded) | id, userId, isActive, expiresAt, lastActivity, deviceInfo.{browser, os, device, ip (masked)}, location.country | deviceInfo.ip | userId, isActive, expiresAt, lastActivity, createdAt | IP masked — never returned to client |
| **siteSettings** (1 doc) | Singleton doc at `site_settings/global`. 12 groups: branding, appearance, announcementBanner, seoDefaults, contactSocial, watermark, fees, integrations (API keys), shipping, auctionConfig, platformLimits, legalPages. Feature flags. Carousel + section defaults. **`aboutContent`** (2026-08-19, typed via `AboutContentDocument` in `appkit/src/features/about/schemas/firestore.ts` — no longer a loose `Record<string,string>`): hero title/subtitle, mission, `howItems[]`, `valueItems[]`, `milestones[]`, and a `teamMembers[]` "Meet the Team" section (name/role/bio/photo + `isFounder`/`isDeveloper` flags) — admin-editable via Site Settings → About tab, rendered by `<AboutView>` at `/about`. | integrations.* (all API keys) | — | Single doc. VA8 admin form overwrites these. API keys are empty strings in seed — set via admin UI. |

---

## Slug Prefix System (enforced everywhere)

| Resource | Prefix | Example |
|----------|--------|---------|
| Product (standard) | `product-` | `product-hot-wheels-redline-vintage` |
| Auction | `auction-` | `auction-pokemon-charizard-1st-edition` |
| Pre-order | `preorder-` | `preorder-dbz-goku-ultra-ego` |
| Store | `store-` | `store-mistys-water-cards` |
| Category | `category-` | `category-action-figures` |
| Brand | `brand-` | `brand-hot-wheels` |
| Event | `event-` | `event-summer-holo-sale-2026` |
| Blog post | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `review-` | `review-charizard-psa9-ravi-20260508` |
| User profile | `user-` | `user-mohsin-c` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-summer20` |
| Section | `section-` | `section-hot-wheels-franchise` |
| Nav item | `nav-` | `nav-new-arrivals` |
| Sub-listing | `sublisting-` | `sublisting-base-set-charizard-108-120` |
| Carousel slide | `slide-` | `slide-hero-homepage` |
| Order | `order-` | `order-3-20260508-a1b2c3` |
| Bid | `bid-` | `bid-charizard-psa9-ravi-20260508-x7y8z9` |
| Payout | `payout-` | `payout-mistys-cards-20260508-q1w2e3` |
| Notification | `notif-` | `notif-order-shipped-001` |
| Grouped listing | `group-` | `group-pokemon-starter-bundle` |
| Support ticket | `ticket-` | `ticket-order-issue-ravi-20260508` |
| Scammer profile | `scammer-` | `scammer-9876543210-at-paytm` |
| Wishlist (per user) | `wishlist-` | `wishlist-user-mohsin-c` |
| History (per user) | `history-` | `history-user-mohsin-c` |
| Product feature | `feature-` | `feature-free-shipping` |
| Classified listing (SB-UNI-F) | `classified-` | `classified-vintage-funko-bangalore-meetup` |
| Digital-code listing (SB-UNI-F) | `digitalcode-` | `digitalcode-steam-cyberpunk-2077` |
| Live-item listing (SB-UNI-F) | `live-` | `live-axolotl-leucistic-juvenile` |
| Catalog product (SB-UNI-L) | `catalog-` | `catalog-pokemon-charizard-base-set-4-102` |
| Procurement shipment | `shipment-` | `shipment-acme-toys-20260811-a1b2c3` |
| Personal catalogue item | `mycatalog-` | `mycatalog-user-mohsin-c-vintage-hotwheels-20260811-x1y2z3` — deliberately distinct from the unrelated `catalog-` prefix (SB-UNI-L master-catalog) |
| Tester QA checklist item | `checklist-` | `checklist-buying-checkout-payment-proof-upload` — admin-managed test-case catalog (Tier QA, 2026-08-17) |
| Offer | `offer-` | `offer-charizard-psa9-ravikumar-20260819-x7y8z9` — buyer-to-seller price offer on a listing (`generateOfferId()`) |

**Semantic generator ID, no slug prefix** (Firestore auto-ID): shipment lots (`shipmentLots`) and shipment items (`shipmentItems`) — FK-linked children of a shipment via `shipmentId`/`lotId`, never referenced by human-readable slug.

**Pure slugs** (`id === slug`, no timestamp/random): products, stores, categories, brands, blog, events, FAQs, sections, nav items, carousel slides, user profiles, coupons, sub-listings, scammer profiles, wishlists, history, product features.

> **User profile caveat (verified 2026-08-19)**: the `user-*` slug only applies to **seed/Admin-SDK-created personas**, where a custom Firebase Auth UID can be set at creation time (`admin.auth().createUser({ uid: "user-mohsin-c", ... })`). Every **real** signup path — `src/app/api/auth/register/route.ts`, `src/app/api/auth/google/callback/route.ts`, `src/app/api/auth/session/route.ts` — calls `userRepository.createWithId(uid, ...)` with the actual Firebase-assigned Auth UID (e.g. `vDF3ZZ9W8VX8SOSOfjgSmkTCBO53`), never a generated slug. This is intentional and required: `id === uid` is what lets every auth-gated request look up the user doc in O(1) from the verified ID token's `uid` claim, and Firebase itself assigns that UID — the app has no way to override it for organic signups even if it wanted to. `generateUserId`/`createUserId` (the `user-*` slug generator) is wired only into `UserRepository`'s generic `.create()`, which no real signup path calls. Don't treat a real user's raw-UID document ID as a bug.

**Semantic generator IDs** (slug-like prefix + date + random suffix, NOT Firestore auto-IDs):
- orders → `order-{itemCount}-{YYYYMMDD}-{rand6}`
- bids → `bid-{productName}-{userFirstName}-{YYYYMMDD}-{rand6}`
- reviews → `review-{productName}-{userFirstName}-{YYYYMMDD}`
- payouts → `payout-{sellerName}-{YYYYMMDD}-{rand6}`
- offers → `offer-{productPrefix}-{buyerPrefix}-{YYYYMMDD}-{rand6}`

**True Firestore auto-IDs** (no prefix, no slug): carts, eventEntries, notifications, sessions, jobs.

---

## ID Generators Reference

> All runtime (production) ID generation lives in one file: [`appkit/src/utils/id-generators.ts`](appkit/src/utils/id-generators.ts). Every generator follows the same contract — accepts a typed input object with an optional `customId?: string`; when `customId` is non-empty it's returned as-is (lets callers bring their own ID without duplicating generator logic), otherwise the function slugifies the relevant fields per the [Slug Prefix System](#slug-prefix-system-enforced-everywhere) above.

**Full catalog** (all exported from the same file): `generateCategoryId`, `generateUserId`, `generateProductId`, `generateAuctionId`, `generatePreOrderId`, `generateReviewId`, `generateOrderId`, `generateFAQId`, `generateChecklistItemId`, `generateCouponId`, `generateCarouselId`, `generateHomepageSectionId`, `generateBidId`, `generateBlogPostId`, `generatePayoutId`, `generateShipmentId`, `generateCatalogueItemId`, `generateOfferId`, `generateBarcodeFromId`, `generateQRCodeData`, plus the media-filename family (`generateMediaFilename`, `generateCroppedImageFilename`, `generateTrimmedVideoFilename`, `validateMediaFilename`, `deriveContextTypeFromFilename` — see [Media Filename Slug Patterns](#media-filename-slug-patterns) below). **Not ID generation, but lives in the same file**: `generateBarcodeId(productId)` — async, `globalThis.crypto.subtle.digest("SHA-1", ...)` over the product id → `LIR-XXXXXXXX` (8 uppercase hex chars), deterministic per product, used for the scannable product barcode (distinct from `generateBarcodeFromId`, which derives a 12-digit numeric barcode straight from an existing id's digits).

**Random suffixes use real crypto randomness, on purpose**: `generateRandomString(length)` (module-private helper, used by `generateOrderId`/`generateBidId`/`generatePayoutId`/etc. for their `{rand6}` suffix) calls `globalThis.crypto.getRandomValues()` — genuinely non-deterministic, which is **correct** for production: a real order/bid/payout is created exactly once and just needs a collision-safe suffix, never regenerated.

### 🛑 Seed data must NEVER reuse this random-suffix pattern directly

**Why this is its own callout (root-caused 2026-08-19, see Root Cause Pattern #25 below):** `appkit/src/seed/orders-seed-data.ts` used to have its own *local* `generateOrderId` helper (same name, unrelated to the canonical one above) that called `Math.random()` for its suffix. Because seed files are re-imported (and thus re-executed top-to-bottom) on every single `npx appkit-seed load` / `status` / `delete` invocation, a random suffix generated at *import time* is different every run — so `load` silently created 50 fresh duplicate orders every time instead of upserting the same 50, and `status`/`delete` could never compute the correct existing-doc count because they were checking for IDs that were never actually written (they'd been randomly regenerated since the last `load`).

**The fix, and the pattern to reuse anywhere a seed file needs a stable "random-looking" suffix**: derive the suffix deterministically from stable inputs (e.g. a small string hash of the record's natural key — buyer id + product id + loop index, or whatever uniquely identifies that fixture row) instead of `Math.random()`. See the `seededSuffix()` helper in `orders-seed-data.ts` for the canonical small implementation (`Math.imul` string hash → unsigned → base36, padded to a fixed width). **Never import the canonical `generateOrderId`/`generateRandomString` from `id-generators.ts` into a seed file to "fix" this** — that would just reintroduce the same non-determinism the seed environment can't tolerate; seed files need their own deterministic variant even when the target ID *shape* (prefix-count-date-suffix) matches the runtime generator's output format.

### `generateProductId` / `generateAuctionId` / `generatePreOrderId` are dead code — the "Pure slugs" claim below is accurate

These three generators (and the `createProductId`/`createAuctionId`/`createPreOrderId` wrappers around them in `appkit/src/features/products/schemas/firestore.ts:634-650`) build a **compound** id — `product-{name}-{category}-{condition}-{sellerName}-{count}` — which looks like it would contradict the [Slug Prefix System](#slug-prefix-system-enforced-everywhere)'s claim that products are "Pure slugs (`id === slug`)". Verified 2026-08-19: `createProductId`/`createAuctionId`/`createPreOrderId` have **zero callers anywhere in the codebase**, and the generators they wrap are only reachable through those wrappers. The real product/auction/pre-order creation path assigns a plain slug directly (matching the real seed data and production ids, e.g. `product-hot-wheels-redline-vintage`) — never these compound generators. Don't resurrect a call site for them under the assumption they're the "correct" way to generate a product id; they're unused legacy code that predates the current slug-based creation flow.

---

## Media Filename Slug Patterns

All media files use SEO slugs via `generateMediaFilename(ctx)` in `appkit/src/utils/id-generators.ts`. Files are stored in Firebase Storage (private), served via `/api/media/[...slug]` Vercel proxy. Never write raw `firebasestorage.googleapis.com` URLs into Firestore.

> **Updated 2026-08-19** against the actual `MediaFilenameContext` union and switch in `id-generators.ts:632-754` — the table below previously didn't match the real generator output (no `{YYYYMMDD}`/no `{category}`/`{store}` segments on most types); verify against source before trusting docs from memory (Root Cause #11).

| Context Type | Pattern | Example |
|---|---|---|
| `user-avatar` | `user-{first}-{last}-avatar.{ext}` | `user-ravi-kumar-avatar.webp` |
| `store-logo` | `store-{store}-logo.{ext}` | `store-mistys-water-cards-logo.webp` |
| `store-banner` | `store-{store}-banner.{ext}` | `store-mistys-water-cards-banner.webp` |
| `brand-logo` | `brand-{brand}-logo.{ext}` | `brand-hot-wheels-logo.webp` |
| `brand-banner` | `brand-{brand}-banner.{ext}` | `brand-hot-wheels-banner.webp` |
| `category-image` | `category-{name}-image.{ext}` | `category-action-figures-image.webp` |
| `product-image` | `product-{name}-{category}-{store}-image-{n}.{ext}` | `product-charizard-psa9-trading-cards-mistys-water-cards-image-1.webp` |
| `product-video` | `product-{name}-{category}-{store}-video-{n}.{ext}` | `product-charizard-psa9-trading-cards-mistys-water-cards-video-1.mp4` |
| `auction-image` | `auction-{name}-{category}-{store}-image-{n}.{ext}` | `auction-charizard-1st-edition-trading-cards-mistys-water-cards-image-1.webp` |
| `preorder-image` | `preorder-{name}-{category}-{store}-image-{n}.{ext}` | `preorder-goku-ultra-ego-action-figures-mistys-water-cards-image-1.webp` |
| `review-image` | `review-{productId}-image-{n}.{ext}` | `review-hot-wheels-redline-image-1.webp` |
| `review-video` | `review-{productId}-video-1.{ext}` | `review-hot-wheels-redline-video-1.mp4` |
| `blog-image` / `blog-cover` / `blog-content-image` / `blog-additional-image` | `blog-{title}-{category}-image-{n}.{ext}` — all four context types dispatch to the same `generateBlogImageFilename` generator; nothing in the filename distinguishes cover vs. content vs. additional | `blog-how-to-grade-pokemon-cards-collectibles-image-1.webp` |
| `event-image` / `event-cover` / `event-winner-image` / `event-additional-image` | `event-{title}-image-{n}.{ext}` — all four context types dispatch to the same `generateEventImageFilename` generator | `event-pokemon-tournament-june-image-1.webp` |
| `rich-text-image` | `rich-text-{entity}-{name}-image-{n}.{ext}` | `rich-text-blog-post-how-to-grade-pokemon-cards-image-1.webp` |
| `carousel-image` | `carousel-{title}-image.{ext}` | `carousel-hero-homepage-image.webp` |
| `catalogue-image` | `catalogue-image-{item}-{n}.{ext}` | `catalogue-image-vintage-hotwheels-1.webp` |
| `invoice` | `invoice-{orderId}-{YYYYMMDD}.pdf` | `invoice-order-3-20260508-a1b2c3-20260508.pdf` |
| `payout-doc` | `payout-doc-{seller}-{YYYYMMDD}.pdf` | `payout-doc-mistys-water-cards-20260508.pdf` |
| `shipping-proof` | `shipping-proof-{orderId}-{YYYYMMDD}.{ext}` | `shipping-proof-order-3-20260508-a1b2c3-20260819.pdf` |
| `refund-proof` | `refund-proof-{orderId}-{refundId}-{YYYYMMDD}.{ext}` | `refund-proof-order-3-20260508-a1b2c3-refund-1-20260819.pdf` |
| `payment-proof` | `payment-proof-{orderId}-{buyerName}-{YYYYMMDD}.{ext}` | `payment-proof-order-3-20260508-a1b2c3-ravi-kumar-20260819.jpg` |
| `tester-screenshot` | `tester-screenshot-{checklistItemId}-{testerName}-{YYYYMMDD}.{ext}` | `tester-screenshot-buying-checkout-payment-proof-upload-qa-tester-20260819.jpg` |

Only `invoice`/`payout-doc`/`shipping-proof`/`refund-proof`/`payment-proof`/`tester-screenshot` embed a date — every image/video context type is a pure content-derived slug (no timestamp), so re-uploading the same product/store/category name overwrites the prior file at the same storage path.

**Mechanically enforced, not just documented (2026-08-19)**: `appkit/scripts/audit-media-filename-generators.mjs` (registered in `scripts/run-audits.mjs`, runs in `npm run check`) statically cross-checks every `generateMediaFilename()` dispatcher case against `MEDIA_FILENAME_PATTERNS` so the table above and `validateMediaFilename()` can't silently drift apart again (the W1-51 incident described at `id-generators.ts:757-778`).

---

## Appkit Patterns (re-read before writing any component)

| Pattern | Where to look |
|---------|-------------|
| UI primitives | `appkit/src/ui/components/` — Button, Input, Select, Toggle, Badge, Checkbox, Modal, SideDrawer, SideModal, Stack, Row, Container, Section, Div, Text, Heading |
| Feature views | `appkit/src/features/[domain]/components/` — always search here before creating a new component |
| Repositories | `appkit/src/repositories/` — one repository per collection, never query Firestore directly from API routes |
| Seed data | `appkit/src/seed/` — one file per collection; `manifest.ts` for lightweight preview data |
| API routes | `src/app/api/[resource]/route.ts` — GET list + POST create; `[id]/route.ts` — GET/PUT/DELETE |
| API constants | `src/constants/api.ts` — all API endpoint strings in `API_ROUTES` object |
| Route constants | `appkit/src/next/routing/route-map.ts` — all page paths in `ROUTES` object; never hardcode strings |
| Nav group configs | `src/constants/navigation.tsx` — `ADMIN_NAV_GROUPS`, `STORE_NAV_GROUPS`, `USER_NAV_GROUPS`, `SIDEBAR_SUPPORT_LINKS`, `FOOTER_LINK_GROUPS`, `MAIN_NAV_ITEMS`; never define inline in layout files |
| Schema types | `appkit/src/features/[domain]/schemas/firestore.ts` — source of truth for all Firestore document shapes |

---

## Seed API Reference

> **Corrected 2026-08-19** — `POST /api/demo/seed` and `src/components/dev/SeedPanel.tsx` documented here previously **do not exist** in the current codebase (removed at some point, this doc never caught up). Seeding is done by the standalone `appkit-seed` CLI (`appkit/scripts/seed-cli.mjs`, exposed as npm bins `appkit-seed` / `appkit-seed-add` / `appkit-seed-remove`). It talks directly to Firestore via firebase-admin using the consumer's `.env.local` credentials — no dev server needed.

**Usage** (from `letitrip.in/` project root):
```
npx appkit-seed status                              # show seed-vs-db counts per collection
npx appkit-seed load                                 # upsert all collections (idempotent)
npx appkit-seed load --collections blogPosts,events   # subset
npx appkit-seed load --dry-run                        # plan without writing
npx appkit-seed delete --yes                          # purge all (skip confirmation prompt)
npx appkit-seed delete --yes --collections orders      # purge a subset
```

Flags: `--collections a,b`, `--dry-run`, `--yes`, `--verbose`, `--service-account <path>`. There is no `brands` collection — see the note at the top of [Seed Data Reference](#seed-data-reference).

**Windows `file:./appkit` gotcha** (hit 2026-08-19): `npm install` does not reliably resync `node_modules/@mohasinac/appkit` with local `appkit/` source changes on this machine — it can silently keep serving a stale cached copy of `appkit/scripts/*.mjs` and `appkit/dist/*` even after `npm install` reports "up to date" and even after `rm -rf node_modules/@mohasinac/appkit && npm install`. If a fix to `appkit/scripts/seed-cli.mjs` or a `appkit/src/seed/*.ts` change doesn't seem to take effect after `cd appkit && npm run build`, verify with `diff node_modules/@mohasinac/appkit/scripts/seed-cli.mjs appkit/scripts/seed-cli.mjs` (and same for `dist/`) — if they differ, manually resync: `rm -rf node_modules/@mohasinac/appkit/scripts node_modules/@mohasinac/appkit/dist && cp -r appkit/scripts node_modules/@mohasinac/appkit/scripts && cp -r appkit/dist node_modules/@mohasinac/appkit/dist`.

---

## Firebase Infra Scripts (appkit/scripts/)

> Use these when the environment needs a hard reset or index deploy is stuck.

| Script | When to use |
|--------|------------|
| `firebase-reset.mjs [--dry-run]` | Full wipe: deletes all Firestore docs + Auth users, redeploys indexes + functions. Always re-seed via `npx appkit-seed load` afterward. |
| `firebase-delete-indexes.mjs` | Clears all composite indexes via REST API. Run **before** `npm run firebase:deploy` when getting 409 "already exists" errors. |

### Firebase Config File Locations (no duplicates)

| Location | Role | Tracked? |
|----------|------|----------|
| `appkit/firebase/base/*` | Source-of-truth templates — edit these | Yes (appkit repo) |
| `appkit/firebase/reset/*` | Minimal configs for `firebase-reset.mjs` | Yes (appkit repo) |
| Root `firebase.json` | Firebase CLI config (must be at project root) | Yes |
| Root `functions/` | Cloud Functions barrel — binds appkit handlers | Yes |
| Root `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `database.rules.json` | Generated by `npm run firebase:generate` | No (gitignored) |

**Never create Firebase config files at `appkit/` root.** The merge script reads from `appkit/firebase/base/` and writes to the consumer root. Any copy at `appkit/` root is redundant and will go stale. To edit rules or indexes, edit `appkit/firebase/base/` and run `npm run firebase:generate`.

**Index source of truth**: `appkit/firebase/base/firestore.indexes.json` → run `firebase-merge.mjs` → `firestore.indexes.json` (root). Never edit the root file directly.

**Seed data rule (J13 — updated 2026-05-12, SB1-G Phase 4)**: Every product document MUST have `listingType: "standard" | "auction" | "pre-order" | "prize-draw" | "bundle"` set. The legacy `isAuction` / `isPreOrder` booleans have been REMOVED from `ProductDocument`; all queries now use `where("listingType", "==", X)` against the `listingType+...` composite indexes. Canonical accessors: `isAuctionListing(p)` / `isPreOrderListing(p)` / `isStandardListing(p)` / `normalizeListingType(p)` — exported from `@mohasinac/appkit` and `@mohasinac/appkit/client`. CartItem snapshots also carry `listingType` (not booleans). The seed wrappers in `products-{auctions,preorders,standard}-seed-data.ts` are the canonical write sites — `.map(p => ({ ...p, listingType: "auction" as const }))`.

---

## CSS Variable Reference (sticky positioning)

`AppLayoutShell` writes `--header-height` to `:root` at runtime — the measured height of its sticky header (title bar + navbar combined). Use it for all sticky offsets:

```tsx
// Correct:
<div className="sticky z-30" style={{ top: "var(--header-height, 0px)" }}>

// Also correct (Tailwind):
<div className="sticky top-[var(--header-height,0px)] z-30">
```

Other CSS variables:
- `--appkit-color-primary` / `--appkit-color-secondary` — theme colors (never use raw hex)
- `--appkit-z-modal`, `--appkit-z-dropdown`, `--appkit-z-overlay` — z-index tokens (never use integers)
- `--glow-color`, `--glow-ring`, `--glow-strong` — themed glow effects

---

## appkit Export Rules

> **Always enforce these when touching `appkit/src/index.ts`, `appkit/src/client.ts`, or `appkit/src/server.ts`.**

### What belongs where

| Export type | `index.ts` (main) | `client.ts` | `server.ts` |
|-------------|:-----------------:|:-----------:|:-----------:|
| UI components, hooks, ROUTES, tokens | ✅ | ✅ | ❌ |
| Pure constants (SCAM_TYPES, slug patterns, etc.) | ✅ | ✅ | ❌ |
| Repositories (`scammerRepository`, etc.) | ✅ | ❌ | ✅ |
| Firebase Admin providers (`getAdminDb`, `getAdminAuth`, `getAdminStorage`, `firebaseStorageProvider`, `firebaseDbProvider`) | ❌ | ❌ | ✅ |
| Server actions (`"use server"` functions) | ✅ | ❌ | ✅ |

### Why this matters (the Turbopack client-bundle trap)

Local dev uses **webpack**, which respects the `externals` function in `next.config.js` — firebase-admin is silently externalized even if it leaks into the main index. **Vercel prod uses Turbopack**, which ignores webpack `externals`. Turbopack strictly follows the full import chain from every module included in `dist/index.js`. If any re-exported symbol's module chain reaches `firebase-admin` (which has a **static top-level** `import from "firebase-admin/app"`), Turbopack will include `child_process`/`fs` in the **client** bundle → build failure.

**`"sideEffects": false`** in `appkit/package.json` is the safety net: it tells both webpack and Turbopack to eliminate any re-exported module whose symbols are not actually consumed. Never remove this flag.

### Rules

```
✗ Never add a top-level (module-scope) call to firebase-admin APIs in any appkit file
✗ Never export from providers/db-firebase or providers/storage-firebase in index.ts
✗ Never export server-only code in client.ts
✓ Server providers live in server.ts + their own subpath (providers/db-firebase, providers/storage-firebase)
✓ When adding a new provider or repository to index.ts, check: does its import chain reach firebase-admin?
```

---

## Appkit Local Dev vs Publish Rules

### 🛑 LOCAL DEVELOPMENT — use `file:./appkit` (default)

During normal development, appkit is consumed as a local symlink. **Never publish to npm during a development session unless explicitly asked.**

```
letitrip/package.json:  "@mohasinac/appkit": "file:./appkit"
```

Run `npm run watch:appkit` in one terminal — changes to `appkit/src/` are compiled into `appkit/dist/` automatically and picked up by the Next.js dev server immediately. No version bump, no npm publish needed.

### ✅ PUBLISH TO NPM — only when explicitly asked by the user

When the user says "publish appkit" or "release appkit":

```
1. Commit all appkit source changes first (no uncommitted source)
2. Bump version in appkit/package.json  (patch = +0.0.1, minor = +0.1.0)
3. npm run build   (in appkit/)
4. npm publish     (in appkit/)
5. Update letitrip/package.json  "@mohasinac/appkit": "^X.Y.Z"
6. Remove appkit/src/** lines from tsconfig.json  (see tsconfig rule below)
7. Delete package-lock.json + npm install  (lockfile must resolve from npm, not file:)
8. npx tsc --noEmit  (both repos, must be 0 errors)
9. Commit appkit/package.json + letitrip/package.json + package-lock.json + tsconfig.json
```

**Why `file:` works locally but not on Vercel**: `appkit/dist/` is gitignored. Vercel CLI respects gitignore when uploading, so `dist/` is excluded. `npm ci` with a `file:` dep links to a dist-less directory → build failure. The npm registry version ships `dist/` inside the tarball.

### 🛑 tsconfig.json `include` — must match the pin mode

| Consumer pin | `appkit/src/**` in `tsconfig.json` include | Why |
|---|---|---|
| `"file:./appkit"` (local dev) | **YES — include both lines** | VSCode sees appkit types live without rebuilding dist |
| `"^X.Y.Z"` (npm registry) | **NO — remove both lines** | Types come from `dist/*.d.ts`; keeping them causes Vercel Linux OOM/crash after 5–8 min (Root Cause #23) |

Switching modes? Update `tsconfig.json` immediately — it is the most common cause of "local passes, Vercel fails".

### ✅ DEPLOY TO VERCEL PRODUCTION — only when explicitly asked

Use the pre-flight deploy script which catches the most common mistakes before they reach Vercel:

```powershell
node scripts/deploy.mjs
```

Or manually:

```powershell
# 1. Confirm lockfile resolves from npm (not file:./appkit)
# In package-lock.json, node_modules/@mohasinac/appkit should show
# "resolved": "https://registry.npmjs.org/..." NOT "link": true

# 2. Confirm tsconfig.json does NOT include appkit/src/**
# (should find 0 matches)

# 3. Full quality gate
npm run check

# 4. Deploy
vercel --prod
```

Auto-deploy on push is disabled (`vercel.json` → `"deploymentEnabled": false`). Always use `node scripts/deploy.mjs` or `vercel --prod` explicitly.

**Danger sign**: if `package-lock.json` shows `"resolved": "appkit"` with `"link": true` after switching to npm, the lockfile still points to the local directory. Delete it and re-run `npm install`.

---

## SSR Architecture

> Folded in from the wound-down `ssr-arch-tracker.md` / `ssrprompt.md` on 2026-05-12. These are non-negotiable rules for every new feature and every Tier RA retrofit.

### Guiding Principle — code defaults to appkit

Default home for SSR + feature code: **`appkit/src/_internal/server/features/<feature>/`** (server) or **`appkit/src/_internal/client/features/<feature>/`** (client). Consumer `letitrip.in/` files are thin shims (≤30 lines) when the Next.js framework forces a specific path (`page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `middleware.ts` / `proxy.ts`).

### Layered template per feature

```
appkit/src/_internal/server/features/<feature>/
├── data.ts        // getXForDetail(slug, opts?), listX(opts?) — wrap in React.cache when shared between page+generateMetadata
├── adapters.ts    // toClientX(doc) — Firestore doc → API/client shape
├── actions.ts     // "use server" mutations, validation, repo calls
├── metadata.ts    // buildXMetadata(doc, opts?) → Metadata
├── og.tsx         // renderXOgImage(doc, opts?) → ImageResponse  (when applicable)
└── index.ts       // barrel — re-export public surface

appkit/src/_internal/shared/features/<feature>/
├── config.ts      // page sizes, limits, defaults
├── types.ts       // TS types shared client+server
└── schema.ts      // Zod validators
```

### Encapsulation + Override Contract

Every public function takes an optional final `opts?: XOptions` parameter (even if empty today). Every view component accepts at least one `renderXxx` slot prop. Override hierarchy (least → most invasive):

1. **Config / tokens** — `siteSettings.theme`, `LabelsProvider` partial map, `appkit.config.js`.
2. **Options object** — `renderXOgImage(doc, { theme, headline, layout: "compact" })`.
3. **Render-prop slots** — `<XDetailView renderActions={(ctx) => <MyActions/>}>`.
4. **Adapter wrap** — `const myToClient = (doc) => decorate(toClientX(doc))`.
5. **Replace the call** — call repository directly; skip the helper.
6. **Fork via patch** — only when the seam doesn't exist yet. File a tracker entry; ship the seam in appkit.

### `React.cache` discipline

Every data-fetch function exposed to a page+`generateMetadata` pair MUST be wrapped in `React.cache`:

```ts
import { cache } from "react";
export const getXForDetail = cache(async (slug: string) => { ... });
```

### Audit baseline

`scripts/audit-ssr-in-appkit.mjs` runs as part of `npm run check`. Baseline is **8** (S2-deferred root files); only regressions block. Goal: drive to **0** (tracker row `X-audit-baseline`).

### Red flags

- A `_transform.ts` / `_adapter.ts` next to an API route → lift to `_internal/server/features/<feature>/adapters.ts`.
- An `opengraph-image.tsx` with >40 lines of layout JSX → extract renderer to appkit.
- A `page.tsx` with non-trivial Firestore querying → move to `data.ts`.
- Duplicate fetch logic in `page.tsx` + an API route → both should call the same appkit function.
- Hardcoded `"LetItRip"` / `"letitrip.in"` / currency / route strings inside `_internal/` → pipe through `appkit.config.js` / `ROUTES` / `LabelsProvider`.

---

## Listing Types Reference

> Added 2026-08-20 (S-listings-parity session) to close the "no uniqueness properly defined or documented" gap that caused every non-standard listing type to feel like it "reverts to standard." Single source of truth for what actually differs per listing type — read this before touching any `_internal/shared/listing-types/*` plugin, any `*DetailPageView.tsx`, or seed data for a specific type.

**Registry**: `appkit/src/_internal/shared/listing-types/_registry.ts` — `pluginFor(type)` / `LISTING_TYPE_REGISTRY` is the canonical accessor for everything in the table below except capabilities (`capabilities.ts`, same directory) and seed fixture counts.

| Type | Slug prefix | Detail route | Capabilities (`canAddToCart`/`canBid`/etc.) | Card badge | Related-items strategy | Seed fixtures (permanent catalog) |
|---|---|---|---|---|---|---|
| `standard` | `product-` | `/products/{slug}` | cart | — (default, no badge) | 4-signal: category/brand/tags/store | 10, full `customFields`/`customSections`/`specifications` |
| `auction` | `auction-` | `/auctions/{slug}` | bid + BIN (`buyNowPrice`, only while `!bidsHaveStarted`) | "Auction" (`bg-warning-surface`) | Dedicated "Similar Auctions" grid (same-type, unexpired) **+** the 4-signal carousels | 8 — incl. closed/won, reserve-not-met, Buy-Now-only |
| `pre-order` | `preorder-` | `/pre-orders/{slug}` | cart (deposit-based) | "Pre-Order" (`bg-info-surface`) | 4-signal | 7 — all 3 `preOrderProductionStatus` values, sold-out, non-cancellable |
| `prize-draw` | `prizedraw-` | `/prize-draws/{slug}` | cart (entry-based, `prizeDrawMode:"reveal"\|"lottery"`) | "Prize Draw" (`bg-primary`) | 4-signal | 6 — partial-sold, closed/revealed with real winners, nearly-sold-out |
| `classified` | `classified-` | `/classified/{slug}` | **no cart** (`cartLine:"blocked"`) — contact-seller/chat only | "Classified" (`bg-secondary`) | 4-signal | 7 — 5 cities, all 3 `contactMethod` values, mixed shipping/negotiable |
| `digital-code` | `digitalcode-` | `/digital-codes/{slug}` | cart, instant fulfillment | "Digital Code" (`bg-success-surface`) | 4-signal | 7 — auto-claim + manual-email, partial/sold-out pools, expiring codes |
| `live` | `live-` | `/live/{slug}` | cart, requires `vendorVerified` + jurisdiction check | "Live Item" (`bg-danger-surface`) | 4-signal | 3 — deliberately small, off-catalog-theme (see note below) |
| `art` | `art-` | `/products/{slug}` (intentional — standard checkout flow, no dedicated route) | cart | "Art Print" (`bg-primary-700`) | 4-signal | 5 — Beyblade fan-art, varied size/material/finish/editionSize |
| `stickers` | `sticker-` | `/products/{slug}` (intentional, same reason as art) | cart | "Sticker Sheet" (`bg-primary-700`) | 4-signal | 5 — sticker sheets, same `ProductPrintMeta` variety |
| `bundle` | — | `/bundles/{slug}` | N/A — a `categoryType:"bundle"` row on `categories`, not a `listingType` | N/A (not a product card) | "Related Bundles" — sibling active bundles (categories feature has no product-based 4-signal shape) | 5 (pre-existing, unchanged this session) |

**4-signal** = `computeRelatedItems()` (`appkit/src/_internal/server/features/products/data.ts`) — same-category / same-brand / tag-overlap / same-store, each capped at 8 and filtered for per-type invalid states (ended auctions, closed prize-draws, sold-out pre-orders, depleted digital-code pools). Rendered via `<RelatedItemsSection>` (`appkit/src/features/products/components/RelatedItemsSection.tsx`).

**`groupedListings`** (admin/seller-authored theme scroller, `appkit/src/features/grouped/`) now has a public renderer — `<GroupedListingsCarousel>` (`appkit/src/features/grouped/components/`), fed by `getGroupsWithItemsForProduct()` — and appears on every product-based detail page above the 4-signal carousels. Previously fully built with zero public consumers.

**`live` off-theme note**: `species`/`jurisdictionAllowed`/CITES fields only make sense for live animals/plants, which doesn't fit this catalog's Beyblade-only theme (`categories-seed-data.ts` header). The 3 seed fixtures (a dog, a reptile, a bonsai) are explicitly off-catalog demo content to exercise the feature, not meant to read as in-theme merchandise — `art`/`stickers` were reframed as Beyblade fan-art/stickers instead since those genuinely fit.

**Personal catalogue** (`appkit/src/features/catalogue/`, `mycatalog-` prefix) is a **separate feature**, not a `listingType` — a user's private photo inventory of owned items, optionally public, with an approval workflow to promote an item into a real marketplace listing (`linkedProductId`/`linkedProductSlug`). Public per-item detail page: `/catalogue/{ownerSlug}/{itemId}` (added this session — previously had no route at all). The owner's full catalogue grid lives at `/profile/{userId}/catalogue` (`PublicProfileView`'s "Catalogue" tab), not at a standalone `/catalogue/{ownerSlug}` page.

---

## Categories & Brands Reference

> Added 2026-08-21. Brands are `CategoryDocument` rows discriminated by `categoryType:"brand"` — not a separate collection. See `appkit/src/features/categories/schemas/firestore.ts` for the full field list.

**Editorial fields** (both category and brand rows): `highlights?: string[]` (short "why shop this" bullets) and `faqs?: { question, answer }[]` — rendered via the shared `<CategoryHighlightsAndFaqSection>` (`appkit/src/features/categories/components/`) on both `CategoryDetailPageView.tsx` and `BrandDetailPageView.tsx`. Renders nothing when both arrays are empty — safe to leave unset on non-Beyblade-catalog rows (bundles, sublistings).

**Brand-only fields**: `brandWebsite`, `brandCountry`, `brandFounded` — rendered in an "About this brand" panel on `BrandDetailPageView.tsx`. `brandBannerImage` was removed 2026-08-21 (dead field — never seeded, never rendered; the hero banner has always used `display.coverImage`, which is what the admin editor's "Cover Image" input controls).

**Bundle-only field**: `brandSlug?: string` on `categoryType:"bundle"` rows — which brand a bundle belongs to, set via a brand picker in `AdminBundleEditorView.tsx`. **Distinct** from `bundleQueryRule.filter.brandSlug`, which is a query *filter* used only by `bundleQueryRule.type==="dynamic"` rules to auto-resolve members — the top-level `brandSlug` is the bundle's own brand tag regardless of how its members are resolved (static or dynamic), and is what `BrandDetailPageView.tsx`'s bundle tab filters on. Not every bundle needs one — a genuinely cross-brand bundle (see `bundle-every-generation-starter-pack` in seed data) leaves it unset.

**`GroupedListingsCarousel`** extends to category/brand pages via `getGroupsForCategory()`/`getGroupsForBrand()` (`appkit/src/_internal/server/features/grouped/data.ts`) and `GroupedListingsRepository.findByCategorySlug()`/`findByBrandSlug()` — same `isActive`+`visibilityStatus:"visible"` eligibility filter as the product-page version, hydrated with ALL member products (not "other members" — a category/brand-scoped group isn't anchored to "the current item," unlike a product page's version).

**`BrandDetailTabs.tsx`/`CategoryDetailTabs.tsx` duplication is intentional** — two near-identical components (same filter/visibility logic, brand-scoped vs. category-scoped, `CategoryDetailTabs` has an extra "Stores" tab `BrandDetailTabs` lacks). Per the Duplication Decision Framework below, this is exactly 2 copies with different domain semantics — do not consolidate without a 3rd copy (Rule of Three) or a bug-fix multiplier forcing the issue.

---

## Duplication Decision Framework

> Run this against every cross-tier / cross-feature overlap before extracting OR before leaving duplication in place.

### Keep the duplication when ANY of these holds

1. **Different domain semantics.** E.g. admin sidebar nav vs store sidebar nav: shared structure, different meaning. Unifying would require >3 conditional props.
2. **Rule of Three.** Only 2 copies today. Extract on the 3rd, not the 2nd. Two copies is observation; three is a pattern.
3. **Lifetime is short.** One copy is being deprecated within 2 sessions.
4. **Lane / API boundary.** One copy lives in appkit's public surface (consumer-overridable); the other lives in `_internal/` (project-specific). Consolidating breaks the override seam.
5. **Customization point.** The duplicate *is* the override seam (consumer wraps appkit primitive with project-specific behavior).

### Consolidate when ANY of these holds

1. **≥3 copies** — Rule of Three trigger.
2. **Bug-fix multiplier** — a single bug fix would require >1 commits across copies.
3. **Same prop surface** — copies accept the same parameters and return the same shape.
4. **Migration artifact** — duplication only exists because of pre-layered structure.
5. **Test-burden multiplier** — same logic tested N times in N test files.

### Where the consolidated version goes

- Used by ≥2 features → `appkit/src/_internal/client/` or `appkit/src/ui/` (client); `appkit/src/_internal/server/` (server).
- Used by exactly 1 feature → `appkit/src/_internal/{client|server}/features/<feature>/`.
- Used only in `letitrip.in/` and not generic → keep in `src/components/` until a second consumer appears.

### Specific call-out — sidebar layouts

The 4 layout shells (`AdminLayoutShell`, `StoreLayoutShell`, `UserLayoutShell`, public `LayoutShellClient`):
- **Keep** the 4 wrappers — genuinely different domain semantics.
- **Consolidate** the structural shell into appkit's `<AppShell>` — each wrapper passes its `renderNav` / `renderHeader` slots to one shared `<AppShell>` underneath.
- Tracked as `3-shell-adopt` + `LL-dashboard-*` in `crud-tracker.md`.

---

## Recurrent Root Cause Patterns

> These patterns have caused multiple bugs across many sessions. Treat each as a red flag during code review and implementation. The bug IDs in parentheses are the first known instance — see the [Known Bugs plan](../../Users/mohsi/.claude/plans/in-our-git-hirsoty-elegant-lagoon.md) for full history.

| # | Pattern | Red flag to watch for |
|---|---------|----------------------|
| 1 | **Use `listingType`, not the dropped booleans** | The legacy `isAuction` / `isPreOrder` booleans were removed in SB1-G Phase 4 (2026-05-12). All product queries use `where("listingType", "==", X)`. All consumer code reads via `isAuctionListing(p)` / `isPreOrderListing(p)` / `normalizeListingType(p)` from `@mohasinac/appkit`. See J13 above. |
| 2 | **Missing Firestore composite indexes** | Queries with multiple `where` + `orderBy` throw `FAILED_PRECONDITION` silently in prod. Add to `appkit/firebase/base/firestore.indexes.json` and deploy. Never add indexes to the root `firestore.indexes.json` directly (J13). |
| 3 | **Tailwind class purging** | Any class generated only inside appkit (not in `./src/**`) is purged in prod unless safelisted in `tailwind.config.js` or pre-compiled into `dist/tailwind-utilities.css` (HF87-1). |
| 4 | **SSR shape mismatches** | Repository methods return `FirebaseSieveResult`; page views expect domain-specific shapes (e.g. `{ posts: [] }`). Always transform before passing as `initialData` (J14). |
| 5 | **Component prop API drift** | appkit component props evolve (`open` → `isOpen`, `showToast(obj)` → `showToast(msg, variant)`). Always read the component source before using it — never assume the API from memory (HF86-4, HF89-wa). |
| 6 | **Vercel Lambda dynamic require — outputFileTracingIncludes** | Any package loaded via dynamic `require()` at Lambda cold-start but not statically imported is missing from the bundle → `MODULE_NOT_FOUND` in prod. Fix: add `"./node_modules/<pkg>/**"` to `defaultOutputFileTracingIncludes["/api/**"]` in `appkit/src/configs/next.ts`, bump appkit patch version, redeploy. **Critical anti-patterns**: (a) never use `@scope/**` broad globs — `@firebase/**` includes the entire client SDK (~200MB+) and causes the Vercel "Deploying outputs..." step to time out/fail; (b) the `@firebase/database` package alone is 8.8MB, making it a build-timeout risk even as a specific glob. **How to find the real missing packages**: run `node scripts/trace-firebase-full.mjs` from project root — it dynamically traces all packages loaded by `firebase-admin/firestore` including a live Firestore call. The confirmed runtime list as of appkit v2.7.9 is in `appkit/src/configs/next.ts`. **Deployment failure symptom**: build completes in ~6m but "Deploying outputs..." fails (Error status, 10-45m duration) = output bundle too large. |
| 7 | **Dual `@types/react` instances** | appkit pinning a specific `@types/react` version creates dual instances. Use `peerDependencies` + `overrides` in root `package.json` (HF89-ts). |
| 8 | **Slot-shell render props not passed** | Calling any appkit view shell with zero render props renders a layout skeleton with no content. Always check that all `renderXxx` props are wired on every page that uses the shell. |
| 9 | **`createWithId` bypasses BaseRepository hooks** | Any PII encryption, validation, or other override in `BaseRepository` is skipped when `createWithId` is called directly. Always override `createWithId` in the subclass (HF86-3). |
| 10 | **CSS @import of node_modules in globals.css** | Turbopack inlines `@import` before PostCSS runs, breaking tailwindcss + autoprefixer. Always import pre-compiled CSS from node_modules via JS (`import "pkg/styles"` in `layout.tsx` — never `@import` in CSS) (CSS-import). |
| 11 | **Stale bug/plan descriptions** | Plan files and memory entries describe what was true when written. Always verify by reading the current source file before writing any fix. Never act on a bug description without confirming the bug still exists (Rule #4). |
| 12 | **Missing `"use client"` on client-hook files** | Any appkit file that imports `useTranslations` / `useState` / `useEffect` / `useRouter` / `useSearchParams` / `usePathname` (or any React hook / next-intl / next/navigation hook) MUST have `"use client"` as its **first line**. Without it, Next.js treats the file as a Server Component. When the server render fails, React attempts a client-side recovery render without `NextIntlClientProvider` context → `"context not found"` crash. The stop hook runs `appkit/scripts/audit-use-client.mjs` after every turn and blocks on any regression. |
| 13 | **Double router.replace race condition** | Never call `table.set(key, v)` followed immediately by `table.setPage(1)` in the same handler. `table.set()` for any key not in `NON_RESETTING_KEYS` (`page`, `pageSize`, `view`) already resets page automatically via a single `router.replace()`. A subsequent `setPage(1)` reads **stale** `useSearchParams()` output and issues a second `router.replace()` that overwrites the first URL update — the toolbar sort/filter appears to do nothing. Use only `table.set(key, v)`. The stop hook runs `appkit/scripts/audit-double-navigation.mjs` after every turn and blocks on any regression. The audit catches both same-line (`table.set(...); table.setPage(`)`) and **multi-line** (set on line N, setPage on line N+1) patterns — a full sweep of 17 instances across 12 files was completed 2026-05-15. |
| 14 | **Firebase dual-module instance** | `appkit/node_modules/firebase` and root `node_modules/firebase` are separate package copies. If webpack resolves `firebase/app` to two different instances, the Firebase app registry is split: `initializeApp()` registers the app in one instance, but `getAuth()` / `getFirestore()` look it up in the other and find nothing → `"No Firebase App '[DEFAULT]' has been created"`. Fix is in `defineNextConfig`'s webpack config: `config.resolve.alias["firebase"] = path.resolve(cwd, "node_modules/firebase")` forces all `firebase/*` imports to the root copy. Never remove this alias. |
| 15 | **Never use appkit `<Button>` as a toggle switch — use `<Toggle>`** | Using `<Button role="switch">` to build a toggle pill causes the Button's internal padding and display styles to override custom sizing classes (`w-10 h-6 rounded-full`), so the toggle renders as a plain grey circle instead of a pill with a sliding thumb. Use the appkit `<Toggle checked onChange size>` primitive instead — it renders a native `<button role="switch">` internally with correct pill styling. The `BUTTON_AS_TOGGLE` rule in `audit-code-quality.mjs` blocks on any regression. |
| 16 | **Inline action definitions bypass the CTA registry** | Every CTA, bulk action, and row action MUST use the ACTIONS registry (`action-registry.ts`) or ACTION_META / ROW_ACTION_META / ADMIN_BULK_ACTIONS / SELLER_BULK_ACTIONS constants (`action-defs.ts`). Inline `{ id: "delete", label: "Delete", variant: "danger" }` objects in BulkActionBar or RowActionMenu bypass centralized label management, permission gating, confirmation dialogs, and i18n overrides. Destructive actions (delete, cancel, ban, suspend) without `confirmation` config on their ActionDef are especially dangerous — they execute immediately with no user confirmation. See § "CTA Registry Rules" below. |
| 17 | **`useSearchParams()` requires `<Suspense>` in Next.js 16 production** | Every appkit listing view calls `useUrlTable()` → `useSearchParams()`. In `next start` (production mode), calling `useSearchParams()` without a `<Suspense>` boundary triggers the error boundary → "Something went wrong". Fix: the admin/store/user dashboard layouts AND the root `[locale]/layout.tsx` wrap `{children}` in `<Suspense>`. Never remove these boundaries. New dashboard sub-layouts should also include `<Suspense>` around `{children}`. |
| 18 | **No re-exports — import from the defining module** | Never create barrel re-exports (`export { X } from "./internal/thing"`) for convenience. Every import must point to the file that **defines** the symbol. Barrel re-exports in `index.ts` / `client.ts` / `server.ts` are only for appkit's **public API contract** — UI components, hooks, types, and constants that external consumers actually need. Internal utilities, shared hooks used only inside appkit views, and implementation details stay internal. This prevents import chain bloat, circular dependencies, and the Turbopack client-bundle trap (Root Cause #6). During Phase 11 (W5-1/W5-2), all existing convenience re-exports will be pruned and consumer imports rewritten to point directly at defining modules. |
| 19 | **Peer-dep duplicates in `appkit/node_modules/` cause Turbopack dual-instance crashes** | Running `cd appkit && npm install` populates `appkit/node_modules/` with every peer-dependency *and* their transitive runtime deps. Turbopack 16 resolves appkit-internal imports to those local copies while the consumer's imports resolve to the consumer-root copy. Singleton modules (React contexts, registries) end up as two separate instances in the same SSR bundle, and `useContext` reads the wrong one. This caused the 2026-06-10/11 "No QueryClient set" prod outage (duplicate `@tanstack/query-core` carrying its own `QueryClientContext`). The fix is enforced by `appkit/scripts/dedupe-peer-deps.mjs` (wired as both `postinstall` and the first step of `build`). **Rules**: (a) never remove that script or its `package.json` wiring; (b) if a new peer-dep is added that ships a React context via a transitive package, append the transitive's name to `TRANSITIVE_RUNTIME_DUPS` inside the script; (c) when diagnosing similar errors, decode the failing chunk's source map (`.next/server/chunks/ssr/<chunk>.map`) — if the original-position source path goes through `appkit/node_modules/<pkg>/...`, this pattern is in play. |
| 20 | **Public appkit prop / hook signature changes must update consumer call sites in the same commit** | Renaming, removing, or retyping a publicly-exported prop (e.g. `open` → `isOpen`), changing a hook return-shape (`showToast(obj)` → `showToast(msg, variant)`), or dropping an exported symbol from `index.ts` / `client.ts` / `server.ts` MUST be paired with the consumer-side update in the same commit. Consumer code is silently typechecked against the bundled `dist/*.d.ts` from `file:./appkit`, so a half-finished change typechecks locally (where the source still has the old export from working memory) but breaks the moment the dist is rebuilt or the consumer reads a stale type. Always run `npm --prefix appkit run build` and `npx tsc --noEmit` in the consumer after touching any exported appkit surface. |
| 21 | **Three-layer style system — Theme (colours + fonts) → Tokens (fixed scales) → Variants (the only styling API). Raw HTML wrappers, raw className utilities on primitives, and `THEME_CONSTANTS` interpolation bypass the variant system.** | The single source of truth for every styling intent: (a) **colours + fonts** flow through `--appkit-color-*` / `--appkit-font-*` written by `<ThemeProvider>` on `<html>`; (b) **everything else** (spacing, radii, shadows, breakpoints, motion, gradients) lives in fixed token maps in `appkit/src/tokens/`; (c) every primitive (`<Text>`, `<Card>`, `<Section>`, `<StickyToolbar>`, `<MediaImage>`, …) exposes typed variant enums — never raw className. Admin custom themes go through Site Settings → Themes (`<ThemeManagerView>`); the registry-aware `<ThemeProvider registry={buildThemeRegistry(siteSettings.theme)}>` mounts in `LayoutShellClient` and writes the active record's tokens to `<html>` at runtime. Two built-in themes (`default-light` = cobalt+lime, `default-dark` = hot-pink) cannot be deleted; the `audit-theme-drift` script verifies they stay aligned with the matching `tokens.css` blocks. Gradients flow through `--appkit-gradient-*` so `<Text gradient="brand">`, `<Section tone="page-header">`, `<Card variant="gradient-…">` re-style automatically per theme. Raw `bg-gradient-to-*` utilities are flagged by `audit-html-wrappers/RAW_GRADIENT_UTILITY`. Inline `style={{ color: … }}` / `backgroundColor` / `borderColor` is flagged by `audit-inline-styles/INLINE_COLOR_OVERRIDE`. New primitives shipped 2026-06-14: `Anchor`, `MediaAudio`, `Iframe`, `HorizontalRule`, `Fieldset`/`Legend`, `Details`/`Summary`, `Dialog`, `StickyToolbar`, `IconBox`, `Kbd`, `Quote`, `Show`/`Hide`, `FallbackShell`, `HotspotMarker`, plus 10 `Email*` primitives. SiteLogo no longer accepts `className`; pick `size: "sm"|"md"|"lg"|"xl"|"hero"` + `tone: "brand"|"mono"|"inverse"|"on-primary"` — gradient stops still consume `--appkit-color-primary-*` so any theme restyles the logo. |
| 22 | **Suppression-marker spray instead of fixing the root cause** | When a strict-zero audit is failing, the only legitimate close is a real fix — a primitive extension, a Zod migration, a type narrowing, a behaviour change. Adding a per-line `// audit-X-ok: <reason>` marker to silence the violation is **not progress** — it is the violation hidden from the counter. Markers are reserved for **architecturally irreducible** cases (TS structural escapes, primitive-internal `className`, type-guard params that TS forces to `unknown`). Each marker carries a *specific* reason, not boilerplate. The lesson cost: 2026-06-17 sprayed ~133 `audit-variant-ok` markers across 16 files under the heading of "Phase 14 burn-down progress" — that work was rolled back and the variant plan reassigned to a separate session because the markers hid violations without removing className tokens. Before adding any marker, ask: "does a primitive variant exist or can be added to absorb this?" If yes, extend the primitive or rewrite the call site. Only mark when the answer is provably no (e.g. dynamic className from runtime data with no representable enum). |
| 23 | **`appkit/src/**` in consumer `tsconfig.json` breaks Vercel Linux builds** | The consumer `tsconfig.json` must NOT include `appkit/src/**/*.ts` or `appkit/src/**/*.tsx` when the consumer pin is `"@mohasinac/appkit": "^X.Y.Z"` (npm registry). Including those paths causes the consumer TypeScript compiler to compile thousands of appkit source files alongside consumer code. On Windows this succeeds (case-insensitive FS, local dev cache). On Vercel's Linux build servers it fails: either OOM during compilation or case-sensitivity errors in appkit's import paths that don't surface on Windows. Symptom: local `npm run build` passes, Vercel `npm run build` exits 1 after 5–8 minutes with no accessible error log. Fix: delete the two `appkit/src/**` lines from `tsconfig.json` — types are already provided by `dist/*.d.ts` in `node_modules/@mohasinac/appkit`. The `scripts/deploy.mjs` pre-flight check enforces this. **When to re-add them**: only if you switch back to `file:./appkit` for local development (the lines are needed so VSCode sees appkit types without a full `npm run build` of the dist). |
| 24 | **A top-level `import ... from "node:X"` anywhere in a file reachable from `index.ts`/`client.ts` fails the Turbopack production build — even if no client code ever consumes that symbol** | Turbopack resolves a module's full static import graph before any tree-shaking pass. If a file has a static top-level import of a Node builtin (`node:module`, `node:fs`, etc.) and that file is reachable from the client bundle through ANY re-export chain — even a shared barrel file that also exports genuinely client-safe symbols from OTHER files — Turbopack hard-fails with `the chunking context (unknown) does not support external modules (request: node:X)` on every page, in production only (local `next dev`/webpack tolerates it). **Moving which barrel re-exports the symbol is not a fix** — 2026-08-17's first attempt moved `pii-encrypt.ts`'s exports from `index.ts` to `server.ts`, but `index.ts` still imported OTHER, unrelated symbols (`redactPii`, rbac) from the same shared `security/index.ts` barrel that also re-exported `pii-encrypt.ts` — so the poisoned import was still statically reachable. **Real fix**: (a) the Node-only code must use a bare, non-static runtime call (`require("crypto")` inside a function body, never `import { createRequire } from "node:module"` at module scope) so bundlers doing static graph construction never see it; (b) any environment lacking an ambient `require` (a standalone pure-ESM script) must provide its own via `globalThis.require = createRequire(import.meta.url)` before importing appkit, rather than appkit's source code working around one caller in a way that breaks every other consumer; (c) if a file genuinely mixes Node-only code with client-safe code (e.g. `pii-encrypt.ts` had 6 crypto-free display-masking helpers mixed in with AES/HMAC functions), split the file — don't just re-route the barrel. See `asciiDiagrams.md` → "Architecture > PII Encryption vs Display Masking" for the full incident writeup and verification method. |
| 25 | **`Math.random()` (or any other non-deterministic value) inside a seed data file breaks `appkit-seed load`/`status`/`delete` idempotency** | Seed files are freshly re-imported (and therefore fully re-executed) on every single CLI invocation. Any field computed with `Math.random()`, `Date.now()` used as an ID component (as opposed to just a display timestamp), or similar non-stable output means the SAME conceptual fixture gets a DIFFERENT document ID every run — `load` never upserts, it creates fresh duplicates every time; `status`/`delete` can never find what a previous `load` actually wrote, because they're computing a brand-new random ID to look for. Root-caused 2026-08-19 in `orders-seed-data.ts`'s local `generateOrderId` helper (50 orders, silently duplicating on every reseed). Fix: derive any "random-looking" suffix deterministically from the fixture's own stable identity (index, natural key) via a small string hash — see [ID Generators Reference](#id-generators-reference) above for the exact pattern and why the canonical runtime `generateOrderId`/`generateRandomString` in `id-generators.ts` must NOT be reused here. |
| 26 | **Narrowing/pruning a seed catalog (fewer stores, fewer products) without updating every file that referenced the old catalog leaves dangling foreign keys** | This project's product catalog was deliberately narrowed to a single coherent franchise (Beyblade) at some point, and `products-standard-seed-data.ts` / `stores-seed-data.ts` / `categories-seed-data.ts` / most of `users-seed-data.ts` were updated to match — but ~20 other seed files (blog posts, events, reviews, orders, notifications, addresses, carts, conversations, etc.) kept referencing the old, now-deleted stores/products/personas. One phantom store id (`store-kaiba-corp-cards`) alone had 52+ references across the codebase pointing at a store that didn't exist in `stores-seed-data.ts` at all — found only by grepping `storeId:` across every seed file and diffing against the real store list. Root-caused + fixed 2026-08-19 (see [Seed Data Reference](#seed-data-reference)'s "narrowed to Beyblade" callout). **Whenever a seed catalog is narrowed, immediately grep every OTHER seed file for the old ids being removed** (`storeId:`, `productId:`, the old uid, etc.) — don't assume "I only touched the catalog files" means nothing else references them. |
| 27 | **Not every media field renders through the same pipeline — image-only proxies 400 on video, and vice versa** | `/api/media/ext` (backing `seedExtMedia()`) explicitly checks `contentType.startsWith("image/")` and 400s on anything else — it exists to watermark third-party **images**, nothing else. But `background.type:"video"` on carousel slides and `review.video`/`ReviewDetailShell.tsx` both render via a raw `<video src>` element (`MediaVideo` or an inline `<video>` tag) that expects a directly-playable URL, never routed through that proxy. Wrapping a video URL in `seedExtMedia()` (or conversely, expecting an unwrapped video URL to get watermarked like an image) silently breaks playback — found twice in the same session (carousel background video, then flagged proactively before repeating it in review videos). **Before adding any `url`/`video`/`thumbnail` field to seed data, check how the consuming component actually renders it** — grep the component for `MediaVideo`, `<video`, or `resolveMediaUrl` to see whether it expects a raw external URL or a proxied one; don't assume every media field follows the same wrapping convention. |
| 28 | **On this Windows setup, `npm install` does not reliably resync a `file:./appkit` dependency's non-`dist` files (e.g. `appkit/scripts/*.mjs`) — even a full `rm -rf node_modules/@mohasinac/appkit && npm install`** | `node_modules/@mohasinac/appkit` is a real copy, not a symlink/junction, on this machine (`Get-Item ... | Select LinkType` returns empty). `npm run build` inside `appkit/` only refreshes `appkit/dist/` at the source, which the linked copy also does not pick up automatically. A source fix to `appkit/scripts/seed-cli.mjs` (or any non-compiled file the `bin` entries point at) can silently keep failing with the pre-fix behavior indefinitely even after multiple `npm install` runs report "up to date" or "added N packages." **Verification, not assumption**: after any fix to a file under `appkit/scripts/` or a rebuild of `appkit/dist/`, run `diff node_modules/@mohasinac/appkit/scripts/<file> appkit/scripts/<file>` (and the `dist/` equivalent) before trusting the CLI reflects the fix. If they differ, manually resync: `rm -rf node_modules/@mohasinac/appkit/scripts node_modules/@mohasinac/appkit/dist && cp -r appkit/scripts node_modules/@mohasinac/appkit/scripts && cp -r appkit/dist node_modules/@mohasinac/appkit/dist`. |
| 29 | **`<Select>`'s outer wrapper div — not the caller's `className` — is the real flex child, so sizing utilities passed via `className` are silently inert** | `Select.tsx`'s non-`bare` render path wraps the actual `<select>` in an outer `<div className="appkit-select">` (`width: 100%`, no shrink/basis constraint) — that outer div is what becomes the flex child whenever `<Select>` sits inside a `<Row>`/flex container, but the component's `className` prop only ever reaches the inner `<select>`. A caller passing `flex-shrink-0` / `min-w-*` / `max-w-*` / `flex-1` via `className` to constrain the dropdown's width in a flex row gets no effect — the wrapper's `width: 100%` wins and the Select balloons, squeezing or over-stretching past its siblings. Root-caused 2026-08-19 in the header search bar (`Search.tsx`) after commit `c315347d6` swapped a raw `<select className="flex-shrink-0">` for `<Select className="flex-shrink-0">`; a sweep found 6 more affected call sites (`AdminMediaView.tsx`, `SellerProductsView.tsx`, `ConsultationForm.tsx`, `StoreProductsView.tsx`, `wishlist/page.tsx`). Fix: `Select.tsx` now has a dedicated `wrapperClassName` prop that applies to the real wrapper div — `className` keeps sizing/styling the inner `<select>` exactly as before (non-breaking for the ~30 other existing callers). Enforced going forward by `scripts/audit-select-wrapper-classname.mjs` (strict-zero, wired into both `npm run check:audits` and the Stop hook). |
| 31 | **Every `catch` block must call `normalizeError(err)` before doing anything else with the thrown value** | Enforced project-wide by `appkit/scripts/audit-catch-normalize.mjs` (strict-zero, registered in `scripts/run-audits.mjs`, runs in `npm run check`) — `normalizeError()` (`appkit/src/errors/normalize.ts`) turns the caught `unknown` into a typed `NormalizedError` discriminated union before the catch body does anything with it (log it, inspect `.message`, etc.), so `unknown` never escapes a catch clause into downstream logic. Accepted patterns: `normalizeError(<var>)` within the next few lines, a bare re-throw, an immediate `return`, or a `// audit-catch-raw-ok: <reason>` marker for genuine exceptions. This was already an audited standard before this session but had never been written down in CLAUDE.md — if you see a bare `catch (err) { console.log(err) }` or similar with no `normalizeError` call, that's the violation this audit blocks. |
| 32 | **A raster/vector icon primitive that renders via Tailwind `h-*`/`md:h-*` size classes cannot be dropped into `<FallbackShell>`** | `FallbackShell` (`appkit/src/ui/components/FallbackShell.tsx`) exists specifically for `ErrorBoundary`/`app/global-error.tsx` — the point where the Tailwind CSS tree may not have loaded at all, so it deliberately inlines every style via the `style={{}}` prop instead of className. Adding `<SiteMark>` (or any other Tailwind-classed primitive) there for branding purposes defeats that guarantee — the icon would render unsized (or not at all) in exactly the scenario the shell exists to survive. When asked to add a brand mark to "error/empty states," check whether the target is a real crash boundary (skip it) or a normal-render empty/404 state like `<EmptyState icon={…}>` or `NotFoundView` (safe — full Tailwind context available). |
| 30 | **SSR `initialData` frozen forever by `staleTime: Infinity` — the SSR filter-builder must compute the exact same default filters as the client's bare-URL state, or the wrong data renders (first paint, or the next refetch under a mismatched query key)** | Every public listing hook built on React Query (`useProducts`, `useEvents`, `useReviews`, `useStores`, `useAuctions`, `useBlogPosts`, `useFaqList` — all in `appkit/src/features/*/hooks/*.ts`) sets `staleTime: Infinity` whenever SSR-fetched `initialData` is supplied, so React Query never refetches that exact query key again. Two concrete sub-bugs found 2026-08-19: (a) a client `*IndexListing.tsx` component computes a "Show X" toggle default (e.g. `dateFrom: showEnded ? … : new Date().toISOString()` in `AuctionsIndexListing.tsx`, `inStock: showSold ? undefined : true` in `ProductsIndexListing.tsx`/`PreOrdersIndexListing.tsx`) that its paired SSR `*ListView.tsx`/`*PageView.tsx` filter-builder didn't mirror — fixed in `AuctionsListView.tsx`, `ProductsIndexPageView.tsx`, `ArtStickersListView.tsx`, `PreOrdersListView.tsx`; (b) `/api/products/route.ts`'s `buildFilters` applied a `status` filter only when the caller explicitly sent one (unlike `/api/events`, `/api/reviews`, `/api/stores`, which all already force a safe default/always-on filter server-side) — since `useProducts()` never sends `status` at all, every client-driven refetch across 12 public listing components silently dropped the published-only guard. Fixed by defaulting `status` to `published` inside the route itself (mirrors `/api/events`'s `hasStatusFilter` pattern) rather than patching each of the 12 callers. No dashboard (admin/store/user) page passes SSR `initialData` at all, so this bug class structurally cannot occur there. Enforced going forward by `scripts/audit-listing-filter-parity.mjs` (strict-zero, wired into both `npm run check:audits` and the Stop hook) — it asserts the known SSR-default tokens stay present in each registered file; extend its two registries whenever a new SSR+client listing pair or a new "Show X" toggle is added. |
| 31 | **A currency-unit migration (paise → decimal rupees) doesn't finish at the storage layer — the audit that guards it must also cover `.int()` Zod constraints, seed-data literals, plain-text "paise" mentions, and SCREAMING_SNAKE_CASE `_PAISE` constants, not just `*100`/`/100` arithmetic** | The 2026-05 paise→rupees migration (`ab50e4c3`/`6354739a8`) correctly converted every Firestore read/write path, but a 2026-08-19 whole-codebase sweep (triggered by a ₹1,499 product showing an "EMI Available" badge meant only for orders ≥₹10,000) found ~20 more leftover spots the original `audit-money-units.mjs` (which only caught `*Paise`/`InPaise` identifiers and `*100`/`/100` arithmetic) couldn't see: (a) **missing eligibility-threshold logic** — the EMI badge itself checked only the site-wide flag, never price or the seller's opt-in, a bug class no static grep can catch, only code review; (b) **six duplicated local money-formatters** (`paise()`/`rupees()`/`formatINR()`/`fmt()` in `src/app/**`) that divided already-rupee values by 100 a second time; (c) **`.int()` Zod constraints** surviving on money fields (`offerAmount`, `refundedAmount`, coupon `price` fields, `amountLost`) that reject legitimate decimal amounts like ₹1,499.50; (d) **a seed-data file** (`shipments-seed-data.ts`) with paise-scale literals (`price: 95_000_00`) inflating procurement profit projections 100x; (e) **plain-text "paise" mentions** in JSDoc/UI labels/placeholders (an admin coupon form literally labeled a rupee field "(paise, optional)" — a live 100x data-entry risk) that don't match any identifier-shaped regex; (f) a `SCREAMING_SNAKE_CASE` constant (`AUCTION_MIN_BID_INCREMENT_PAISE`) that evaded detection because underscore is a `\w` character — no regex `\b` boundary exists between `_` and `PAISE`. `audit-money-units.mjs` was extended with `INT_ON_MONEY_FIELD`, `STALE_PAISE_WORD`, and `SCREAMING_PAISE_SUFFIX` checks (still strict-zero, same `// audit-money-units-ok: <reason>` suppression marker) to catch (c)/(e)/(f) going forward. **When touching a currency-unit migration (or reviewing one already "done"), grep for `.int()` near `MONEY_WORD`-shaped field names and for the bare word "paise" case-insensitively — not just `*100`/`/100` — and manually verify any threshold-gated feature flag actually checks the threshold, since that class of bug has no static signature.** |
| 32 | **Tester QA checklist `href` deep links have no compile-time or runtime tie to real routes, so route renames/relocations/deletions silently rot them** | `TesterChecklistItemDocument.href` (`appkit/src/features/tester/schemas/firestore.ts`) is a bare `z.string().max(300)` — nothing checks it against `ROUTES`/`route-map.ts` or an actual page under `src/app/[locale]/**`. Root-caused 2026-08-19: the seed data (`appkit/src/features/tester/seed-data/tester-checklist-seed-data.ts`) had 7 stale `href` values — `/login` and `/register` (real routes are `/auth/login` / `/auth/register`), `/user/wishlist` ×2 (real route is top-level `/wishlist`, not nested under `/user`), and `/store/inventory/print` (page deleted, superseded by `/store/print-center`) — silently 404ing the tester's "Go test this →" button. Enforced going forward by `scripts/audit-tester-checklist-hrefs.mjs` (strict-zero, registered in `scripts/run-audits.mjs` and wired into `npm run check:audits` / the Stop hook) — it extracts every seeded `href` and confirms it resolves to a real static page under `src/app/[locale]/**`, suggesting the nearest real route on failure. No suppression marker — a checklist item either has a working `href` or omits the field entirely (it's optional). |
| 33 | **A `FilterChipGroup`/status-tab `id` that doesn't exactly match a value the target Firestore field can hold returns zero rows forever, with no error anywhere** | `id` gets passed straight into `sieveFilter(field, SIEVE_OP.EQ, id)`; Firestore `==` is byte-exact (confirmed via the Sieve adapter source — no case coercion happens for filter *values*, only field *names*), so a wrong word, wrong case, or an aspirational value that was never a real stored status (e.g. treating `isSold`/`auctionEndDate` — derived signals, not stored status values — as if they were `status=="sold"`/`status=="ended"`) silently breaks the chip. Found live in 8+ places in one 2026-08-19 sweep: seller Products ("Sold", "Active"→should be "Published"), Auctions ("Ended"/"Cancelled" — no such status exists; "ended" is `auctionEndDate` vs now, not stored), Prize Draws (same), Pre-orders (same), Orders (uppercase ids vs lowercase stored values), Offers ("Rejected"→real value is "Declined"), and admin Products ("Pending"→should be "Pending"'s real value `in_review`) and Events ("Published"→not a real `EventStatus` value). **Red flag: any new status/type filter-tab array — always grep the real schema/type union it's supposed to filter before trusting the array's `id`s**, never assume from the label text. Enforced going forward by `scripts/audit-filter-tab-enums.mjs` (strict-zero, registered in `scripts/run-audits.mjs`, runs in `npm run check`) — it cross-checks every registered `ADMIN_*_TABS`/`SELLER_*_TABS` array in `filter-tabs.ts` against its real backing enum's own schema/types file. Extend its `REGISTRY` map whenever a new status/type tab array is added. |
| 34 | **`appkit/src/constants/field-names.ts` calls itself canonical but is stale in places — verify against the feature's own schema file before trusting it** | Confirmed two concrete disagreements during the 2026-08-19 sweep: `EVENT_FIELDS.STATUS_VALUES` includes a `"published"` value the real `EventStatus` type (`appkit/src/features/events/types/index.ts`) never had (`draft\|active\|paused\|ended\|cancelled` only); `SCAMMER_FIELDS.STATUS_VALUES` is missing the real `"removed"` value that `ScammerStatusValues` (`appkit/src/features/scams/schemas/firestore.ts`) actually has. Don't propagate a pattern (a filter-tab array, a status badge map, a Sieve field allowlist) from `field-names.ts` alone — cross-check the feature's own `schemas/firestore.ts` or `types/index.ts`, which is what `audit-filter-tab-enums.mjs` (Root Cause #33) does by design. |
| 35 | **`ListingViewConfig.toggles`** (`appkit/src/features/admin/components/DataListingView.tsx`) **is the standard mechanism for admin/seller "hide-by-default" boolean quick-filters — it existed with zero consumers before 2026-08-19** | Mirrors the public `ListingToolbar.toggles` pattern (pill toggles like "Show sold"/"Show ended" already used on public listing pages) — same `{ label, active, onChange }` shape, rendered inline in the sticky toolbar instead of buried in the filter drawer. When adding a new admin/seller derived-state toggle (a boolean that isn't a real multi-value status, e.g. "hide already-paid payouts," "hide resolved tickets," "hide sold auctions"), use this config field with a second, independent `useUrlTable()` call reading/writing the same URL param `DataListingView`'s own internal table also reads (safe — `useUrlTable` has no local state, multiple instances against the same URL stay in sync) — don't invent a bespoke `FilterChipGroup` pair for what's fundamentally a boolean, and don't reach for `!=` if the "hide N of M values" shape needs excluding more than one value: Firestore allows at most one `!=` clause per query and requires any inequality filter's field to be the first `orderBy`, so multi-value exclusion against an arbitrary default sort must use pipe-joined `EQ` (`sieveFilter(field, SIEVE_OP.EQ, "a\|b\|c")` — sievejs parses same-field `\|` as an OR-group, which the Firestore adapter upgrades to a `.where(..,"in",..)` query, with no such restriction) listing the values to *keep*, not the ones to exclude. |
| 36 | **Two unrelated `OrderStatus` types exist in appkit with different value sets — the public barrel exports the wrong (narrower) one** | `appkit/src/features/orders/types/index.ts` declares `OrderStatus` as `pending\|confirmed\|processing\|shipped\|delivered\|cancelled\|refunded\|return_requested\|returned` (9 values, matches `OrderStatusValues`/the real `orders` collection). `appkit/src/features/account/types/index.ts` independently declares its *own* `OrderStatus` — `placed\|pending\|confirmed\|processing\|shipped\|delivered\|cancelled\|returned\|refunded` — missing `return_requested`, with an extra `placed` no order ever has. `appkit/src/index.ts` re-exports `OrderStatus` from `./features/account/index`, so any consumer importing `type OrderStatus` from `@mohasinac/appkit` silently gets the narrower account/ version — assigning `OrderStatusValues.RETURN_REQUESTED` (a real, correct value) to a `OrderStatus[]`-typed array then fails to typecheck. Root-caused 2026-08-19 fixing `src/app/api/user/orders/route.ts`'s `VALID_STATUSES` list. **Workaround, not a fix**: don't type against the barrel's `OrderStatus` for anything involving `return_requested` — use `Set<string>`/no type annotation instead, matching what the fixed route now does. The real fix (renaming one of the two types and repointing the barrel, then auditing every consumer of the wrong one) is out of scope for a single-route fix and needs its own session. |
| 37 | **A `page.tsx` with no nav entry, or a nav entry with no `page.tsx`, silently ships as "half done"** | A whole-app admin/store/user nav audit (2026-08-19) found ~25 instances of a real, fully-built feature (working view + API) with zero sidebar entry — `/admin/grouped-listings`, `/store/grouped-listings`, `/store/listing-templates`, the `/user` dashboard hub, plus ~17 more store pages — reachable only by typing the exact URL. The inverse also existed: `/admin/carousels` (list page) rendered the wrong component entirely (the flat slide editor, not a named-carousel list), and a 7-route family (order/moderation/report/item-request/scammer/support-ticket detail + a permissions catalog) had nav-adjacent `ROUTES.ADMIN.*` constants with no `page.tsx` ever built behind them. Also found: two genuine feature duplicates that both went unwired at the same time — a legacy `ProductTemplateDocument`-based "Templates" feature superseded by, but never removed in favor of, the newer `ListingTemplateDocument`-based one; and a degraded `/store/inventory/print` duplicate of the real `/store/print-center` (same component, `store={null}`, no data). **Whenever a new `page.tsx` is added under `admin/`, `store/`, or `user/`, add its nav entry in the same commit; whenever a new nav entry is added, confirm the target `page.tsx` already exists.** Enforced going forward by `scripts/audit-nav-page-wiring.mjs` (strict-zero on dead nav links — a nav href with no matching `page.tsx` fails `npm run check`; report-only, non-blocking on the inverse — a page with no nav entry — since legitimate sub-routes like `new/`, `[id]/edit/`, `/view` are expected to exist without one). No suppression marker — a nav entry either points at a real page or it doesn't. |
| 38 | **A hand-rolled admin LIST endpoint serializer silently drops fields the sibling PATCH schema accepts — the write succeeds, the list read lies, and a list-backed editor destructively re-saves the wrong default** | Root-caused 2026-08-19 starting from a report that admin couldn't edit a user's tester flags. `src/app/api/admin/users/route.ts`'s `serializeUser()` never picked up `isTester`/`canTestAdmin` after they were added to `updateUserSchema` in the sibling `[uid]/route.ts` — the PATCH write persisted correctly, but the LIST GET response omitted them entirely. Traced into the consumer: `AdminUsersView.tsx` seeds `AdminUserEditorView`'s "current value" props from the list row (always `undefined` → editor state defaults to `false`), and the save handler **unconditionally** re-sends that wrong default on every save — so editing *any other field* on a real tester silently stripped their tester flags. A broader sweep found the identical (and more severe) bug in `src/app/api/admin/stores/route.ts` — missing `isVerified`/`isFeatured`/`capabilities`/`adminNotes`/`suspensionReason` — where saving any unrelated field on an already-verified store silently un-verified it and reset its custom capabilities to the two-item default. `isFeatured` additionally had **no prop path at all** between `AdminStoresView.tsx` and `AdminStoreEditorView.tsx` (not just a stripped API field) — a second, independent way the same symptom can occur. **The single-item GET endpoint returning the raw, unstripped document while the LIST endpoint hand-picks a narrower field set is the reliable tell** — check for that asymmetry whenever adding a field to an admin PATCH schema. Enforced going forward by `scripts/audit-list-serializer-parity.mjs` (strict-zero, registered in `scripts/run-audits.mjs`) — a small `REGISTRY` cross-checks each PATCH schema's fields against its paired list serializer's fields (regex/brace-walk based, no TS compiler in the loop, matching `audit-filter-tab-enums.mjs`'s precedent). Fields that are genuinely safe to omit (never unconditionally sent, nothing reads them back from a list row) go in that registry entry's `allow` array with the reasoning recorded inline — not a silent skip. |
| 39 | **A CREATE handler's field *transform* (wrapping a value in an object, deriving a value, writing a nested dot-path) isn't automatically mirrored by the sibling UPDATE handler even when both accept the same field name — this is a different bug from #38 (missing field), and #38's audit can't catch it** | Found in a 2026-08-19 sweep specifically hunting shape drift (not presence drift): `src/app/api/admin/faqs/route.ts`'s POST wraps a flat `answer: string` into `{text, format:"html"}` and writes `slug` to the nested `"seo.slug"` dot-path — the sibling PATCH originally just spread the raw body straight into Firestore, so editing an existing FAQ's answer would have written a plain string into a field every reader expects to be `{text,format}`. Same class, more instances: `src/app/api/store/sublisting-categories/[id]/route.ts` didn't recompute `seo.title`/`seo.description` on rename (page metadata frozen at creation); `src/app/api/store/grouped-listings/[id]/route.ts` and its admin counterpart didn't recompute `activeMemberCount` from `productIds.length` on PATCH (stale until an unrelated background job happened to fire); `src/app/api/admin/events/[id]/route.ts` skipped the staged-media finalize calls (`finalizeStagedMediaField`/`Object`/`ObjectArray`) that create runs, orphaning newly-uploaded images in Storage `tmp/`. **Not every apparent instance is a bug** — checked whether `events`' `slug` (derived from `title` on create, never recomputed on update, and title *is* PATCH-editable) was the same pattern, and it isn't: categories/brands/bundles all establish "slug is immutable after creation, the update schema doesn't even accept it" as the deliberate codebase convention, so leaving events' slug frozen too is *consistent*, and auto-recomputing it would risk breaking existing bookmarks/links — verify against sibling resources' established behavior before assuming divergence is a bug. **When adding a field to a CREATE handler that requires any transform beyond a straight write, grep the sibling UPDATE handler for the same field and confirm it applies the identical transform — not just that it accepts the field.** No dedicated audit script for this class yet (each instance found needed a different transform shape); `audit-list-serializer-parity.mjs` (#38) only catches field-presence drift on the list-vs-PATCH axis, not shape drift on the create-vs-PATCH axis. |
| 40 | **`PATCH /api/admin/coupons/[id]` never called `couponsRepository.update()` at all — every coupon edit except activate/deactivate silently did nothing while returning a 200 that echoed the submission back as if it had saved** | Found in the same 2026-08-19 shape-parity sweep as #39, but a different and more severe failure mode: the handler destructured `{ action, validity, ...updateData }` from the validated body, handled `action === "activate"/"deactivate"` (which do call real repository methods, `deactivateCoupon`/`reactivateCoupon`, touching only `"validity.isActive"`), and for every other case just returned `successResponse({ id, ...updateData }, "Coupon updated")` — **no write to Firestore happened at any point** for `name`/`description`/`discount`/`usage`/`restrictions`, or `validity.startDate`/`endDate`. This is the most severe finding across three rounds of the same investigation, precisely *because* the response looked identical to a successful save — there was no error, no stale-display tell, nothing to notice short of reloading and comparing. Fixed by actually calling `couponsRepository.update()`, plus merging (not wholesale-replacing) `validity`/`restrictions` against the existing document — the seller-side sibling (`src/app/api/store/coupons/[id]/route.ts`) already called `.update()` correctly but had the exact wholesale-replace risk on `validity` (a caller sending only `{isActive:false}` would have wiped `startDate`/`endDate`), fixed the same way. **When a PATCH handler's "success" path doesn't end in a repository write call, or the write call it does make only touches one narrow field while the response echoes back a much larger body, that's the tell** — grep for the repository's real write methods actually being invoked, don't infer persistence from the response shape. |
| 41 | **A dismissible global-chrome control (floating button, banner) that persists its dismissal to `sessionStorage`/`localStorage` reads as "gone forever" if the component itself never unmounts across client-side navigation** | Root-caused 2026-08-19: `appkit/src/features/layout/BackToTop.tsx` wrote its dismiss state to `sessionStorage` (intent per its own comment: "hide for the rest of the browser session... re-appears on next page load"). But the component is mounted once inside `AppLayoutShell`, which persists across Next.js client-side route changes without remounting — so in a single tab session, one click hid the button until the tab was closed, with no visible way to re-enable it. This matched the user report exactly ("clicked close once, never came back") even though the code was arguably "working as designed" for a *full page reload* — the design intent itself was the bug for a persistent-shell component. **Fixed** by dropping the storage persistence entirely and adding a `usePathname()`-driven effect that resets the dismissed state on every route change, so the control is guaranteed to reappear on the next navigation, not just the next full reload/tab. **When building or reviewing any dismissible chrome control, check whether its parent shell remounts on navigation** — if it doesn't (true for anything mounted in a persistent layout, which is most global chrome in an App Router app), storage-backed "session" dismissal needs a route-change reset or it reads as permanently broken. |
| 42 | **A denormalised "mirror" field that's supposed to always equal a nested rule/config value silently diverges the moment ANY write path sets the nested value without also setting the mirror — every reader that only checks the mirror then sees empty/stale data with no error** | Root-caused 2026-08-19: `CategoryDocument.bundleProductIds` is documented as "mirror of `bundleQueryRule.productIds` for static rules, kept for index-friendly queries" — the two admin/store bundle API routes correctly set both together, but the tester-sandbox seed row set only `bundleQueryRule.productIds`, leaving `bundleProductIds` (and thus `bundleOriginalTotal`, once added) empty. Every public bundle reader (`listBundleMembers`, `MarketplaceBundleCard`, `FeaturedBundlesSection`) reads the mirror directly, so the bundle silently rendered as "0 items" with no error anywhere — exactly the shape of Root Cause #38's list/PATCH field-presence drift, but on a seed-vs-mirror axis instead of a list-endpoint-vs-PATCH-schema axis. The same class showed up a second time in the same investigation: a Tier-GP product-group parent (`groupChildSlugs` on the parent) had no matching `groupId` set on its children, so `findByGroupId`'s direct query (`where("groupId","==",id)`) resolved only the parent — the mirror-less side of a parent↔child relationship is just as fragile as a rule↔mirror pair. **Fixed both as data (added the missing mirror fields) and as code** — `listBundleMembers`/`resolveBundleMemberIds` now fall back to `bundleQueryRule.productIds` whenever the `bundleProductIds` mirror is empty, so a bundle can never render as empty again just because one write path forgot the mirror. **Whenever a schema field is documented as "mirrors X" or "denormalised from X," grep every write path that sets X and confirm it also sets the mirror — and prefer making the *reader* resilient to a missing mirror (fall back to deriving from X) over only fixing today's seed data, since the next hand-written fixture or admin action will make the same mistake.** |
| 43 | **A selection-callback prop being merely *wired* on a bulk-selectable card must never silently disable primary navigation — only an actively in-progress selection may do that** | Root-caused 2026-08-20: `InteractiveProductCard.tsx`'s `onSelect` branch rendered `<ProductCard>` without forwarding the `href` prop at all — `ProductCard`'s own `if (href && !selectionMode) return <Link>...` logic only wraps in a `<Link>` when nothing is actively selected, so omitting `href` entirely (instead of passing it through and letting that internal check gate on `isSelected`) meant any card supporting bulk-selection lost ALL click/tap navigation the instant a selection callback was merely passed in — regardless of whether the user had selected anything. A sweep of every other `BaseListingCard.Checkbox` consumer (`InteractiveStoreCard`, `EventCard`, `MarketplaceBundleCard`, `MarketplacePreorderCard`, `MarketplacePrizeDrawCard`, `MarketplaceOrderCard`, `BlogFeaturedCard`, `MarketplaceAuctionCard`, plus the admin/store/user dashboard card-view (`AdminViewCards.tsx`) and table-row (`DataTable.tsx`'s `SelectableRow`) renderers) found all of them already correct — each wraps its nav target in an unconditional `<Link>`/`<TextLink href>` or derives its click handler (`onRowClick ?? rowHref`) with zero reference to the selection prop, with only the checkbox itself gated on `onSelect`/`onToggleSelect` being present. `CouponCard.tsx` was confirmed out of scope entirely — it has no navigation target at all (action-only: copy/claim/edit/delete buttons), so the bug class cannot apply. **Fixed** by forwarding `href={href}` unconditionally in `InteractiveProductCard`'s selection branch. Enforced going forward by `scripts/audit-selectable-card-navigation.mjs` (strict-zero, registered in `scripts/run-audits.mjs`) — a small `REGISTRY` of components asserts each one's nav marker (`href={...}`/`onClick={handleClick}`) sits outside its selection-conditional's bracket span (or, for `InteractiveProductCard`'s inverted branch-on-`onSelect` shape, that the nav marker is still present *inside* the branch). **When adding `onSelect`/selection support to any card or row component, verify navigation still works with zero items selected but a selection handler wired** — that's the exact state the bug hid in. |
| 44 | **A client-side RBAC gate that reads `useSession()`/`useAuth()` fields directly (instead of deferring to its own data fetch's live response) goes stale for up to 5 minutes after an admin grants/revokes access** | Root-caused 2026-08-20: `SessionContext` only refreshes `role`/`isTester`/`canTestAdmin`/`disabled`/`storeId` periodically (every 5 minutes, piggybacked on the session-activity ping) or on a hard reload/re-login — never on ordinary client-side navigation. `TesterHubView.tsx` gated its whole render on `!user?.isTester && !isAdminUser(user)` computed from that cached snapshot, even though the SAME component already calls `useQuery` against `/api/user/tester-checklist`, which re-resolves `isTester`/`canTestAdmin` fresh from Firestore on every request — so a tester an admin had *just* flagged still saw "Testers only" until the periodic refresh caught up. **Fixed** two ways: (a) `TesterHubView.tsx` now gates on the query's own 403 (`query.isError && (query.error as {status?:number})?.status === 403`) instead of the cached field, making the decision exactly as fresh as the API it's already calling; (b) the shared `RoleGuard`/`ProtectedRoute` layout guard (used on every `/admin`, `/store`, `/user` page) has the identical bug but *worse* UX (hard-redirects to `/unauthorized` before the page's own data fetch ever mounts, affecting a buyer who just got approved as a seller, or a user an admin just un-banned) — since `ProtectedRoute` has no fetch of its own to defer to, `RoleGuard` instead calls the pre-existing `refreshUser()` once per mount (before `ProtectedRoute` evaluates its authorization decision) so the check is fresh on every navigation into a role-gated layout, not just eventually. Enforced going forward by `scripts/audit-rbac-gate-staleness.mjs` (strict-zero, registered in `scripts/run-audits.mjs`) — flags a component that reads an RBAC field off `useSession()`/`useAuth()`, uses it in an early-return `<Alert variant="warning"\|"error"\|"danger">` denial, and also calls `useQuery`/`apiClient.get` in the same file, unless it already defers to a `query.isError`/`403` check. `RoleGuard.tsx`/`Guards.tsx` are explicitly exempted (structurally different fix — forced refresh, not a query-403 defer) rather than false-flagged. **When adding a new RBAC-gated component with its own data fetch, gate on the fetch's own auth failure, not a cached session field — the API is always the freshest source of truth for a permission that could change between page loads.** |
| 45 | **A schema field's TypeScript type can silently diverge from what every write path actually produces — always verify the type against the Firestore schema and the write call sites, not just what "looks right"** | Root-caused 2026-08-20: `Review.images` (the API/client-facing type) was declared `ReviewImage[]` (`{url, thumbnailUrl}` objects), but `ReviewDocument.images` (the Firestore schema) was `string[]`, and every write path (`useCreateReview.ts`, `review-actions.ts`'s `finalizeStagedMediaArray`, seed data) consistently produced plain strings — the object shape was never real data, anywhere. Every render call site that trusted the wrong type (`img.thumbnailUrl ?? img.url`) silently got `undefined` for both properties, so `MediaImage` fell back to its placeholder icon for every review photo, everywhere: `ReviewDetailShell.tsx` (grid + lightbox + thumbnail strip), `ReviewsList.tsx`, `ReviewModal.tsx`, and two independent server-side `Review`-shape builders (`profile-actions.ts`'s `getSellerReviews`, `ProductDetailPageView.tsx`'s `toReview()`) that each *re-derived the same wrong transform* (`.map((url) => ({url}))`) independently, confirming the bad type had been copy-pasted from rather than caught by a single source of truth. **Fixed** by correcting `Review.images`/`CreateReviewInput.images` to `string[]` and removing the now-fictional `ReviewImage` type — the resulting cascade of `string[]` vs `{url}[]` type errors from `tsc` found all 4 additional call sites the initial grep-based sweep had missed, which a type-correctness fix (not a runtime patch) surfaces for free. **When a "type mismatch" bug is suspected, fix the type declaration itself and let `tsc` enumerate every affected call site — don't just patch the one render location a bug report points at.** A sibling bug in the same investigation (`OrderDocumentItem` never had an `image` field at all, so real checkout orders never carried a per-item thumbnail) reinforces the same lesson from the other direction: a missing field is invisible to `tsc` because nothing type-checks against a field that was never declared, so schema completeness needs an explicit sweep of every write site, not just a compile-clean signal. |
| 46 | **A privileged write endpoint that accepts a "confirmation" field in its request schema is not the same as that field being verified — a Zod shape check (non-empty, differs from X) is not an identity check** | Root-caused 2026-08-20: `POST /api/user/change-password` required `currentPassword` in its Zod schema (non-empty, must differ from `newPassword`) but the handler never read it — `getAdminAuth().updateUser(uid, {password})` overwrote the account's password unconditionally for whatever `uid` the session cookie carried. The only REAL current-password check (`reauthenticateWithCredential`) happened entirely in the Firebase client SDK, in the browser — trivially bypassed by calling the API directly with a stolen/leaked session cookie (XSS, log leak), and even the legitimate client-side flow (`reauthenticateAndChangePassword()`) applied the new password immediately upon reauthentication, before any further verification could gate it. **Fixed** by adding a server-verified email OTP step (`appkit/src/features/auth/password-change-otp.ts`, mirroring the existing Tier PP checkout-value-OTP pattern — same crypto primitives via reuse not duplication) and, critically, splitting `IClientAuthProvider.reauthenticateAndChangePassword` (reauth + apply, one step, no room for a gate) into `reauthenticateOnly` (verify only, no side effect) + relying on the server route to apply the change only after `isPasswordChangeOtpVerified()` passes — a session-hijacker now also needs access to the account's inbox. **When reviewing any privileged write endpoint (password change, payout details, payment method changes, admin role grants), check whether the "proof" field the schema requires is actually READ and VERIFIED by the handler, not just shape-validated — and check whether the client-side flow applies the sensitive change as a side effect of an earlier step, before whatever gate you're adding would ever run.** |
| 47 | **A Sieve field config for a Firestore Timestamp field that's filterable (`canFilter: true`) but has no `parseValue` makes every GTE/LTE/GT/LT filter on it silently match ZERO documents — with no error, anywhere** | Root-caused 2026-08-20 from a report that live (non-ended) auctions were invisible on `/auctions` unless the user clicked "Show ended". The public auctions page's default view builds `auctionEndDate>=<now-as-ISO-string>`; `@mohasinac/sievejs`'s default `convertValue()` (`node_modules/@mohasinac/sievejs/src/processor.js`) only coerces `"true"`/`"false"`/numeric strings, so the ISO string reached the Firebase adapter unchanged and became `.where("auctionEndDate", ">=", "<iso-string>")` — but `auctionEndDate` is stored as a Firestore **Timestamp**, and Firestore requires an inequality filter's query value to match the field's stored type, so the query matched nothing. Clicking "Show ended" didn't reveal ended auctions — it removed the (broken) date filter entirely, so everything reappeared, including the live ones the user wanted. This was a DIFFERENT, deeper bug than the same day's earlier "bounded-fetch ordering" fix in `src/app/api/products/route.ts` (which only covers the fallback path taken when sort ≠ the filtered date field — the default view's sort DOES match, so it took the "safe" direct-Firestore-push path straight into this bug). **Fixed** by adding `SieveFieldConfig.parseValue` (`appkit/src/providers/db-firebase/sieve.ts` — sievejs already threads a per-field `parseValue` hook through `convertValue()`, appkit just never exposed or used it) plus a `parseSieveDateValue(raw) => Date` helper, then wiring `parseValue: parseSieveDateValue` onto every genuinely-Timestamp, filterable Sieve field across **27 repository files** (`auctionEndDate`, `preOrderDeliveryDate`, `createdAt`, `updatedAt`, `expiresAt`, `startsAt`/`endsAt`, `orderDate`, `publishedAt`, `validity.startDate`/`validity.endDate`, etc. — not just the one field the bug report pointed at). **Enforced going forward** by `scripts/audit-sieve-date-fields.mjs` (strict-zero, registered in `scripts/run-audits.mjs` and the Stop hook) — flags any Sieve field config whose key looks like a Timestamp field (`...At`/`...Date`/`...Time` suffix, plus a small named-exception list for outliers like `lastActivity`) and is filterable but missing `parseValue`. **Two follow-up hardenings (same day, prompted by "does the audit cover every check-function path")**: (a) the audit originally only scanned `*.repository.ts` files, but a Sieve field config doesn't have to live there — `PRODUCT_FEATURE_SIEVE_FIELDS` lives in `features/products/schemas/product-features.ts` and is imported into its repository — so the audit now scans every `.ts`/`.tsx` file under `appkit/src` (comment-stripped first, so its own docstring example can't false-positive); (b) `BaseRepository`/`FirebaseRepository`'s older `findAll()` query method (`appkit/src/providers/db-firebase/base.ts`) parses filters with a completely separate `coerceValue()` that has no `SieveFieldConfig`/`parseValue` mechanism at all — nothing for a static audit to inspect — so `coerceValue()` itself was hardened to auto-detect ISO-8601-shaped strings and convert them to `Date`, closing that path's identical vulnerability at the root instead of policing it. **When adding any new filterable field to a repository's `SIEVE_FIELDS`/`*_SIEVE_FIELDS` config (wherever it's defined), check whether it's stored as a Firestore Timestamp — if so it needs `parseValue: parseSieveDateValue`, not just `{canFilter: true, canSort: true}`.** |
| 48 | **A per-listing-type `detailRoute()` that silently defaults to the standard product page — and a shared "doc → card" mapper that drops the `listingType` field — are the SAME bug class at two different hops, and both make a listing "revert to standard"** | Root-caused 2026-08-20 from the user's report that every non-standard listing type reverts to the standard product page. Hop 1: `_internal/shared/listing-types/{classified,digital-code,live}/config.ts` all hardcoded `detailRoute: (idOrSlug) => ROUTES.PUBLIC.PRODUCT_DETAIL(idOrSlug)` despite each type having a real, working, dedicated route (`CLASSIFIED_DETAIL`/`DIGITAL_CODE_DETAIL`/`LIVE_DETAIL` in `route-map.ts`) — every card/carousel/link that resolves via `pluginFor(type).detailRoute()` (the main grid, related carousels, group/sublisting sections, review links, compare overlay, seller profiles) sent these 3 types to the wrong page; only a store's own type-specific listing page and the sitemap linked correctly. **Fixed** by pointing each config at its real route. Hop 2, found while building the fix: `toProductItem()` (the shared Firestore-doc → card-grid mapper feeding `RelatedProductsCarousel`/`GroupedListingsCarousel`) never copied `listingType` onto the returned `ProductItem` — so even with hop 1 fixed, any auction/pre-order/etc. surfaced in a *related-items* carousel still linked to `/products/{slug}` because `pluginFor(item.listingType ?? "standard")` silently fell back to standard. **Whenever a "listing reverts to standard" bug is reported, check both the type's own `detailRoute()` config AND every doc→card mapper in the link's specific render path — a card can carry the right data through nine correct fields and still route wrong because of the tenth (`listingType`) being dropped in a shared mapper.** See [Listing Types Reference](#listing-types-reference) for the full per-type route/badge/related-items table this session produced. |
| 49 | **A field's "raw playable URL" contract can have more than one legitimate shape — every renderer of that field must handle all of them, not just the one the renderer's author had in mind** | Root-caused 2026-08-21 from a screenshot showing "No video with supported format and MIME type found" on a live-listing detail page. `MediaUploadField` (`appkit/src/features/media/upload/MediaUploadField.tsx`) has always had a real, intentional "YouTube" tab (`showYoutube`) that stores `video.url` as a `youtube.com/watch?v=...` URL — but every consumer of that field (`ProductGalleryClient` → `ImageLightbox`'s theater-mode video branch, and `MediaVideo` — used both on public detail pages and inside the upload form's own preview panel) unconditionally rendered a raw `<video src>`, which cannot play a YouTube watch-page URL. The input path supported a source the output path never learned to render — a half-wired feature, same shape as Root Cause #48 but on a media-source axis instead of a listing-type axis. **Fixed** by adding `getYouTubeVideoId()` (`appkit/src/utils/media-url.ts`) and checking it first in both renderers, falling back to a `youtube-nocookie.com/embed/<id>` iframe (matching the existing pattern already used for blog-post YouTube embeds in `BlogPostView.tsx`) instead of the native `<video>` element. Also gave the lightbox's video/embed area a real min-width/min-height on mobile vs. desktop (it was collapsing to the browser's ~300×150px default whenever a src failed to resolve) and wired the lightbox's dead "Maximize2" button — it had been an exact duplicate of the zoom-reset button — to the real Fullscreen API. **Whenever a field's value can come from more than one input source (a picker with multiple tabs/modes, a schema union, an optional transform), grep every render site for that field and confirm each one branches on the source, not just the one shape the renderer was originally written against.** Seed data previously had zero permanent fixtures exercising the YouTube-source path (the only reproduction was an ephemeral manual edit that a reseed would silently wipe out) — `products-standard-seed-data.ts` and `products-auctions-seed-data.ts` now each carry a YouTube-sourced video-demo fixture alongside the pre-existing raw-file ones, plus a second raw-external-host (Wikimedia Commons) fixture for source diversity. A real `MediaUploadField` file-upload can't be reproduced from seed data (no Storage object exists for a seeded URL to point at) — that path is a tester-checklist manual test case instead. |
| 50 | **A `maskPublicX()` PII helper that only spreads its input (`{ ...doc }`) instead of actually calling the mask function is invisible at every layer except a human reading the auction's public Bid History and recognizing a real bidder's name** | Root-caused 2026-08-21 while adding bidder identity to the public Bid History section. `maskPublicBid()` (`appkit/src/security/pii-mask.ts`) existed, was correctly wired into `listBidsByProduct()` (the actual public read path), and was named identically to its working sibling `maskPublicReview()` — but its body was `return { ...bid }`, a no-op that never called `maskName()`. Every real bidder's full display name was being sent to the public product page unmasked; `BidHistory.tsx`'s default row renderer just never displayed the field at all (only amount + date), so the leak was silent even from the browser network tab unless someone actually inspected the JSON payload. **Fixed** by making `maskPublicBid()` call `maskName(bid.userName)`, matching `maskPublicReview()`'s real implementation, and giving `BidHistory.tsx`'s default row a visible masked-name (falling back to a partial-id `Bidder ***xxxx` when no name is present) so the field's presence is now eyeball-verifiable, not just a silent JSON field. **When a `maskPublicX()`/`redactX()`/similar PII helper exists, don't trust its name — read its body and confirm it actually transforms the sensitive field, especially if nothing downstream currently renders that field (a masking bug with no visible symptom can ship and sit for a long time).** No audit script covers this class yet — it requires reading a function body's actual logic against its name, not a greppable pattern. |
| 51 | **An admin editor's field LABELS can describe the opposite of what the fields actually do — always trace label → local state → save payload → server mapping function → schema field → renderer, not just "does a field exist for this concept"** | Root-caused 2026-08-21 in `AdminBrandEditorView.tsx`: the form had a "Logo" input and a "Banner" input, side by side. Tracing the actual data flow: "Logo" → `logoURL` → `brandInputToCategoryFields()` → `display.coverImage` → the field the brand detail page's hero actually renders as its full-bleed background banner. "Banner" → `bannerURL` → `brandBannerImage` → a schema field with **zero readers anywhere in the codebase** (confirmed by grep) — every brand's uploaded "banner" image was silently discarded from the user's perspective, saved to a field nothing ever displays. The labels were not just confusing, they described the reverse of reality. Same investigation also found `brandWebsite`/`brandCountry`/`brandFounded` were seeded with real data and even accepted by the API schema, but never rendered anywhere on the brand page (a rendering gap, not a data gap — same shape as Root Cause #38), and a matching bug in `renderBrandOg()` (`appkit/src/_internal/server/features/brands/og.tsx`) which read `doc?.logoURL` — a field that doesn't exist on `CategoryDocument` at all, so the brand OG card's logo image was always `undefined`, silently. **Fixed**: removed the dead `brandBannerImage` field entirely (no speculative "maybe useful later" field survives a null-usage grep — see `feedback_no_speculative_infra`), relabeled "Logo" → "Cover Image" to match what it controls, added the missing `country`/`founded` inputs the backend already accepted, added an "About this brand" panel actually rendering website/country/founded, and fixed the OG reader to use `display.coverImage`. **When an admin form has two similarly-named fields for the same concept (Logo vs. Banner, Icon vs. Image, etc.), don't assume the labels are accurate — trace each one's full write path to its actual schema field and confirm a reader exists for that exact field, not just for "an image field on this document."** |
| 52 | **A list row that renders `Order {id}` / a raw GUID instead of the denormalized item info sitting right there on the same document, and a slot-shell view rendered with zero render-props (Root Cause #8) rendering nothing — are the SAME class of bug: a UI surface that never got wired up to data that was already present, not a missing-data problem** | Root-caused 2026-08-21 from the user's report "if i am seeing a order in a list i should know that this order was for this item instead of random guid." `AdminOrdersView.tsx`'s `mapRows` and `SellerOrdersView.tsx`'s `mapRows` both built `primary: "Order {id}"` from the raw order id, never reading the `items[]` array (`productTitle`/`image`) that's denormalized onto every order specifically so list/detail UI never needs an extra fetch (see `OrderDocumentItem` in the Slug Prefix System section). Fixed by reading `items[0].productTitle`/`.image` (+ "`+N more`" suffix) for the row's primary label/thumbnail, keeping the id de-emphasized in a secondary line. The exact same investigation found `/user/orders/[id]/track/page.tsx` rendering `<UserOrderTrackView />` with **zero render-props** — a live instance of the pre-documented Root Cause #8 pattern — and traced it to a second, deeper gap: `orderDocumentToOrder()` (`appkit/src/_internal/server/features/orders/adapters.ts`) never mapped `orderDate`/`shippingDate`/`deliveryDate`/`cancellationDate`/`trackingUrl` from `OrderDocument` onto the client-facing `Order` type at all, even though every field already existed on the Firestore document — the buyer tracking page wasn't just unwired, the adapter it would have needed didn't expose the data either. **Fixed** both layers: extended the adapter, then built `<OrderStatusTimeline>` (`appkit/src/features/orders/components/OrderStatusTimeline.tsx`) from the real per-status dates (no fabricated/estimated timeline — statuses with no dedicated date field render without a timestamp rather than a guessed one) and wired the track page's render-props. **Whenever a list/detail surface looks "bland" or "blank," check two things before assuming data needs to be added: (a) does the denormalized/already-fetched shape already carry what's needed, just unread by the row-mapper or adapter; (b) is a slot-shell component being rendered with its render-props actually supplied.** Both are UI-wiring gaps, not backend gaps, and neither needs a schema change to fix. Extended to admin order/store/user/payout detail pages (Order Phase A–G, 2026-08-21) — `AdminOrderEditorView`/`AdminStoresView`/`AdminUsersView`/`AdminPayoutsView` all gained "Open full page" row actions alongside their existing drawers, landing on new `/admin/{orders,stores,users,payouts}/[id]/view` pages; `SellerOrderDetailPanel`/`SellerPayoutDetailContent` were extracted as shared content components so the list drawer and the new standalone page (`/store/{orders,payouts}/[id]/view`) render from one implementation instead of two that could drift. |
| 53 | **A package's `exports["."]` entry point can silently resolve to a DIFFERENT source file than the one a barrel-export grep finds — two same-named-but-unrelated classes can both exist, with the wrong one being what consumers actually get at runtime** | Root-caused 2026-08-21 while fixing the exact "generic/minified-React error on validation failure" bug this session started from. `appkit/src/index.ts` correctly re-exports the real `ValidationError` (`appkit/src/errors/validation-error.ts`, `constructor(message, fields?: unknown)` — the one `mapToHttpError`/`handleApiError` actually `instanceof`-check to extract `.issues` for a 400 response) — but `appkit/src/index.ts` is NOT what bare `import { ValidationError } from "@mohasinac/appkit"` resolves to. The package's `exports["."] .types`/`.import` fields point at `appkit/src/server-entry.ts`, which re-exported a completely different, structurally-unrelated `ValidationError` from `_internal/shared/errors/index.ts` (`constructor(message, field?: string)`, extends `AppkitError extends Error` — not `AppError`). Every `throw new ValidationError(...)` at a real consumer call site (~100+ across `src/actions/*.ts` and `src/app/api/**/route.ts`) constructed an instance `mapToHttpError`'s `err instanceof ValidationError` check could never match, so it fell through every classified branch to the generic 500 `"An internal error occurred"` fallback — the exact shape of the originally-reported bug, and almost certainly its true root cause (deeper than the FormErrorSummary/StepForm wiring gaps this session also fixed, which were real but secondary). The shadow class wasn't dead code — `_internal/shared/features/{auctions,events,promotions,wishlist}/errors.ts` genuinely subclass it (`AuctionEndedError extends ExpiredError`, `WishlistCapError extends CapacityError`, etc.), so it couldn't just be deleted. **Fixed** by re-pointing `server-entry.ts`'s `ValidationError`/`NotFoundError`/`ConflictError` re-exports to the real `./errors/index` versions (verified first: every one of the ~100+ real call sites only ever passes 0 or 1 positional args matching the real classes' `(message, data?)` shape, so the swap is behavior-preserving) — `AppkitError`/`UnauthorizedError`/`CapacityError`/`ExpiredError` (no real-module counterpart, no confirmed instanceof-mismatch bug) stayed on the `_internal/shared/errors` source. **When a "thrown error class doesn't get caught/classified correctly" bug is suspected, check `package.json`'s `exports` map for the actual resolved entry file — don't assume a barrel-file grep hit is what a bare top-level import actually resolves to at runtime, especially in a package with multiple entry points (`.`, `/client`, `/server`, etc.).** |

---

## Known TS Patterns to Avoid

| Anti-pattern | Correct alternative |
|-------------|---------------------|
| `<Button onClick={() => router.push(...)}>` | `<Link href={ROUTES.*}>` with styled-button via `asChild` |
| Hardcoded `href="/products"` | `href={ROUTES.PUBLIC.PRODUCTS}` |
| `router.push("/admin/products")` hardcoded string | `router.push(String(ROUTES.ADMIN.PRODUCTS))` |
| Inline nav groups in layout files | Import from `@/constants/navigation` — `ADMIN_NAV_GROUPS` / `STORE_NAV_GROUPS` / `USER_NAV_GROUPS` |
| Raw hex in CSS or `style={}` | `var(--appkit-color-*)` or Tailwind semantic token |
| `<SiteLogo className="h-7 md:h-9 lg:h-10" />` | `<SiteLogo size="md" />` — the catalogued `size` enum (`sm`/`md`/`lg`/`xl`/`hero`) carries the responsive height; `tone` selects gradient vs mono. |
| `<a href="https://…">…</a>` for external links | `<Anchor href="https://…">…</Anchor>` — typed `tone`/`underline`; auto-applies `target` / `rel`. Internal Next.js routes use `<TextLink>`. |
| `<img src="…">` | `<MediaImage src="…" alt="…" size="card">` — always proxied through `/api/media/…` so the watermark applies. |
| `<iframe src="…" />` | `<Iframe src="…" title="…" aspect="video" rounded="lg" />` — sandbox + aspect baked into typed enums. |
| `<hr />` | `<HorizontalRule tone="accent" spacing="comfortable" />` — `tone="accent"` consumes the themed `--appkit-gradient-accent-divider`. |
| `<fieldset>…</fieldset>` / `<legend>…</legend>` | `<Fieldset tone="default" padding="md">` + `<Legend>` primitives. |
| `<details><summary>…</summary>…</details>` | `<Details tone="card" defaultOpen={false}>` + `<Summary>` primitives. |
| `<dialog>` for native top-layer dialogs | `<Dialog open={isOpen} onClose={…} padding="md">…</Dialog>` (`<Modal>` is the portal variant). |
| `<kbd>Ctrl</kbd>` | `<Kbd size="sm" tone="brand">Ctrl</Kbd>`. |
| `<q>…</q>` / inline `<blockquote>` | `<Quote tone="muted">…</Quote>` (set `block` for `<blockquote>`). |
| `<div className="sticky top-[calc(var(--header-height,0px)+44px)] z-10 bg-white/95 backdrop-blur-sm border-b">` | `<StickyToolbar offset="header+nav" tone="translucent" border>`. |
| `<div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-primary-50">` | `<IconBox size="md" tone="brand" rounded="xl">`. |
| `<div className="absolute" style={{ left: `${xPct}%`, top: `${yPct}%` }}>` | `<HotspotMarker xPct={x} yPct={y} size="md" tone="brand" shape="dot">`. |
| `<audio src="…" controls>` | `<MediaAudio src="…" controls="full" />` — flows through the media proxy. |
| `hidden sm:block` className on a consumer wrapper | `<Show above="sm">` / `<Hide below="md">` primitives — hydration-safe; consumer code never authors raw breakpoint prefixes. |
| `bg-gradient-to-r from-primary-50 to-secondary-50` className | Pick a primitive variant backed by `--appkit-gradient-*` — `<Section tone="page-header">`, `<Card variant="gradient-…">`, `<Text gradient="brand">`. `audit-html-wrappers/RAW_GRADIENT_UTILITY` blocks new gradient utilities. |
| `style={{ color: "#3570fc" }}` / `backgroundColor` / `borderColor` inline | Use a primitive `color` / `surface` / `tone` variant. `audit-inline-styles/INLINE_COLOR_OVERRIDE` blocks new inline colour writes. Add `// audit-inline-style-ok: <reason>` only for legitimate dynamic colour pickers. |
| Raw `<table><tr><td>…</td></tr></table>` in an email template | Compose `<EmailDoc><EmailContainer><EmailRow><EmailColumn>` from `@mohasinac/appkit/server`. These render email-client-compatible HTML via `renderToStaticMarkup`. |
| `<div>` fallback UI in `ErrorBoundary` / `global-error.tsx` with hand-rolled inline styles | `<FallbackShell tone="danger" title="…" description="…" actions={…}>` — primitive ships its own critical CSS so it renders without Tailwind. |
| Importing `THEME_CONSTANTS` from `@/constants/theme` or `@mohasinac/appkit/tokens` for new code | Use a primitive variant (`<Card variant="…">`, `<Section tone="…">`, `<Badge variant="…">`). The two remaining importers are scheduled for removal as part of the consumer sweep. |
| `z-[50]` arbitrary Tailwind | `var(--appkit-z-modal)` CSS variable |
| `as unknown as SomeThing` | Fix the underlying type mismatch — ask if unsure |
| Skipping `npx tsc --noEmit` | Always run in BOTH `letitrip.in/` and `appkit/` before committing |
| `@import "@mohasinac/appkit/styles"` in `globals.css` | `import "@mohasinac/appkit/styles"` in `layout.tsx` — Turbopack inlines CSS @imports before PostCSS runs, breaking tailwindcss + autoprefixer with "Unknown AST node type 0". Always import pre-compiled node_modules CSS via JS imports, not CSS @import. |
| Exporting firebase-admin providers from `appkit/src/index.ts` | Move to `server.ts` only — they leak into client bundles via Turbopack (see appkit Export Rules above) |
| Removing `"sideEffects": false` from `appkit/package.json` | This flag is required; without it Turbopack bundles the full firebase-admin chain into client bundles |
| `"@mohasinac/appkit": "^X.Y.Z"` (npm) in letitrip `package.json` during local dev | Use `file:./appkit` for local dev; only switch to npm version when deploying or when user asks to publish |
| Building and publishing appkit with uncommitted source changes | Always commit first — the build compiles from the working tree, so the published dist may not match git history |
| Inline `{ id: "delete", label: "Delete", variant: "danger" }` in BulkActionBar | Use `ADMIN_BULK_ACTIONS.products` / `SELLER_BULK_ACTIONS.products` preset arrays from `action-defs.ts`, referencing `ROW_ACTION_META[ROW_ACTION_ID.DELETE]` for label + destructive flag |
| Inline `{ label: "Approve", onClick: ... }` in RowActionMenu | Use `ROW_ACTION_META[ROW_ACTION_ID.APPROVE].label` or `ACTIONS.ADMIN["approve-product"].label` from the registries |
| Hardcoded confirmation `window.confirm("Delete?")` | Use `ACTIONS.ADMIN["..."].confirmation` or add a `confirmation` field to the ActionDef in `action-registry.ts` — `<Button action={...}>` opens the confirm dialog automatically |
| Destructive bulk/row action with no confirmation dialog | Every `kind: "danger"` action MUST have a `confirmation` config in `action-registry.ts` — missing confirmation on delete/cancel/ban = immediate execution with no user confirmation |
| Re-exporting a symbol just to create a barrel alias | Import directly from the defining module. No `export { X } from "./internals"` in index/client/server barrels unless X is part of the package's public API. Consumer code must import from the file that defines the symbol, not from a barrel re-export. |
| Adding a new re-export to `appkit/src/index.ts` or `client.ts` | Only export symbols that are part of appkit's **public API contract** (UI components, hooks, types, constants consumers actually need). Internal utilities, shared hooks used only inside appkit views, and implementation details stay internal — import them directly within appkit, never re-export for convenience. |
| Raw `<form onSubmit>` in product code | `<Form onSubmit={…}>{({ setFieldError, clearErrors }) => …}</Form>` — auto-mounts FormShellContext.Provider. See Rule #9. |
| Raw `<input>` / `<select>` / `<textarea>` for form fields | `<FieldInput>` / `<FieldSelect>` (or `<PaginatedSelect>` for >5 options) / `<FieldTextarea>`. See Rule #9. |
| `<Select className="flex-shrink-0 min-w-[140px]">` inside a flex row | `<Select wrapperClassName="flex-shrink-0 min-w-[140px]">` — `className` only styles the inner `<select>`; `wrapperClassName` sizes the actual flex-child wrapper div. Enforced by `audit-select-wrapper-classname.mjs`. Root Cause #29. |
| Manual `useState<string \| null>(null)` for inline form error | Call `setFieldError("<fieldName>", message)` from the `<Form>` render-prop helpers. FieldInput / FieldSelect / FieldTextarea / FieldCheckbox all wire `aria-invalid` + role="alert" error block automatically. |
| Hand-rolled `if (!email || !/.+@.+/.test(email))` validation in submit handler | Define a Zod schema in `appkit/src/features/<feature>/schemas/<name>.ts`, call `schema.safeParse(values)`, iterate `parsed.error.issues` → `setFieldError(issue.path[0], issue.message)`. |
| Hardcoded `top-16` / `top-20` / `top-[64px]` on a sticky element | `top-[var(--header-height,0px)]` — enforced by `audit-sticky-offsets.mjs`. The header height changes with breakpoint, mobile keyboard, and announcement banner state. |
| Removing the Firebase webpack/Turbopack `firebase` alias from `next.config.js` or `defineNextConfig` | Never — `audit-firebase-alias.mjs` enforces both. Removing either alias causes the dual-module-instance prod outage (Root Cause #14). |
| `appkit/src/**/*.ts` in consumer `tsconfig.json` `include` when using the npm version | Remove both `appkit/src/**` lines whenever the consumer pin is `^X.Y.Z` (npm registry). Local Windows builds succeed; Vercel Linux builds OOM or hit case-sensitivity errors after 5–8 minutes. Types come from `dist/*.d.ts`. See Root Cause #23 and `scripts/deploy.mjs` pre-flight check. |

---

## CTA Registry Rules

> Every CTA, button, bulk action, and row action in the platform is registered in two complementary files. **Never hardcode labels, variants, or confirmation copy inline in view components.**

### Registry files (source of truth)

| File | What it holds | When to use |
|------|--------------|-------------|
| `appkit/src/_internal/shared/actions/action-registry.ts` | `ACTIONS` tree — 23 resource buckets, each mapping action-id → `ActionDef` (label, ariaLabel, kind, permissions, confirmation, listingTypeScope, iconKey) | Use `ACTIONS.{RESOURCE}["action-id"]` for label, confirmation, and permission checks. Wire to `<Button action={...}>` for auto-confirmation + auto-variant. |
| `appkit/src/features/products/constants/action-defs.ts` | `ACTION_META` (Tier 1 public CTAs), `ROW_ACTION_META` (Tier 2 row/table actions), `FORM_ACTION_META` (Tier 3 form footers), `DASHBOARD_QUICK_ACTION_META` (Tier 4 dashboard shortcuts). Presets: `ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, `USER_ROW_ACTIONS`, `FORM_FOOTER_PRESET`, `DETAIL_ACTIONS`, `MOBILE_PRIMARY_ACTIONS`, `LISTING_BULK_ACTIONS`. | Use preset arrays to populate BulkActionBar and RowActionMenu. Use `ROW_ACTION_META[ROW_ACTION_ID.DELETE]` for label + icon + destructive flag. |

### Rules for every view component

1. **BulkActionBar** — actions array MUST reference `ADMIN_BULK_ACTIONS`, `SELLER_BULK_ACTIONS`, or `LISTING_BULK_ACTIONS` preset. Map preset IDs to `{ ...ROW_ACTION_META[id], onClick: handler }`. Never hardcode `{ id: "delete", label: "Delete", variant: "danger" }` inline.
2. **RowActionMenu** — actions array MUST reference `ADMIN_ROW_ACTIONS`, `SELLER_ROW_ACTIONS`, or `USER_ROW_ACTIONS` preset for the entity type. Use `ROW_ACTION_META[id].label` for labels and `ROW_ACTION_META[id].destructive` for visual hints. Never hardcode `{ label: "Approve", onClick: ... }` inline.
3. **Destructive actions** — every action with `kind: "danger"` or `destructive: true` MUST have a `confirmation` config in `action-registry.ts`. Missing confirmation = immediate irreversible execution with no user warning.
4. **`<Button action={...}>`** — the appkit Button component auto-resolves label, ariaLabel, variant, and confirmation dialog from an ActionDef. Use it instead of manual `<Button variant="danger" onClick={...}>Delete</Button>`.
5. **New actions** — add to BOTH registries: `ACTIONS.{RESOURCE}["new-action"]` in `action-registry.ts` AND the relevant preset array in `action-defs.ts`. Never create an action that only exists as an inline object in one view component.
6. **Confirmation copy** — all confirmation dialog strings (title, body, confirmLabel) live in the `ActionDef.confirmation` field. Never write `window.confirm()` or inline modal copy in view components.

---

## Theme / Tokens / Variants Architecture

> Shipped 2026-06-14. The single source of truth for every styling intent. Replaces ad-hoc className strings, `THEME_CONSTANTS` interpolation, raw `<div className=…>` wrappers, and `style={{ color }}` overrides.

### Three layers

1. **Theme layer (substitutable)** — colours + fonts only.
   - `--appkit-color-*` (primary / secondary / cobalt / accent / bg / surface / surface-elevated / surface-input / border / border-subtle / text / text-muted / text-faint / text-on-primary / success / warning / error / info / focus-ring + 50/100/.../950 ramps) and `--appkit-font-*` (display / sans / editorial / mono).
   - Themed shadows + gradients: `--appkit-shadow-glow`, `--appkit-shadow-glow-pink`, `--appkit-gradient-{brand,brand-tri,accent,accent-divider,page-header,section-warm,section-cool,section-mesh,accent-banner,promotion,spotlight,whatsapp-card,glass,card-indigo,card-teal,card-amber,card-rose,logo}`.
   - First-paint defaults baked into `[appkit/src/tokens/tokens.css](appkit/src/tokens/tokens.css)` (`:root` + `[data-theme="dark"]`, plus seed presets `cobalt-night` and `sunset`).
   - Runtime application by [`appkit/src/_internal/client/theme/ThemeProvider.tsx`](appkit/src/_internal/client/theme/ThemeProvider.tsx) (re-exported via `appkit/src/theme/index.ts` so the `audit-appkit-reexports` rule stays green). Tracks `localStorage["appkit:theme-mode"]` (`light`/`dark`/`auto`) and `prefers-color-scheme`; writes the chosen record's tokens + gradients to `<html>` as inline CSS custom properties.
   - Mounted by [`src/app/[locale]/LayoutShellClient.tsx`](src/app/[locale]/LayoutShellClient.tsx) as `<ThemeProvider registry={buildThemeRegistry(siteSettings.theme)}>`. Consumer code never authors its own `<style>` blocks.

2. **Tokens layer (fixed scales)** — not user-configurable.
   - Spacing (`appkit-space-*`), radii (`appkit-radius-*`), shadows (`appkit-shadow-*`), z-index (`appkit-z-*`), motion (`appkit-duration-*` + `appkit-ease-*`), typography sizes (`appkit-text-*xs`–`5xl`), letter-spacing (`appkit-tracking-*`), line-heights (`appkit-leading-*`).
   - `appkit/src/ui/components/surface-tokens.ts` exposes `SURFACE_MAP` (incl. status-tinted surfaces — `success-surface`, `danger-surface`, `warning-surface`, `info-surface`), `PADDING_MAP` / `PADDING_PRESETS` (incl. `toolbar`, `card-tight`, `hero`), `GAP_PRESETS` (`dense` / `comfortable` / `loose` / `section` / `hero`), `ROUNDED_MAP`, `BORDER_MAP`, `SHADOW_MAP`.
   - `appkit/src/tokens/motion.ts` exposes `SPRING_SNAPPY`, `SPRING_GENTLE`, `MOTION_PRESETS` (14 keys).
   - `Layout.style.css` mirrors the gap presets as `.appkit-gap--{dense,comfortable,loose,section,hero}` classes consumed by `<Stack gap>`/`<Row gap>`.

3. **Variants layer (the only styling API)** — typed enums on every primitive.
   - `<Card variant>`, `<Badge variant>`, `<Button variant>`, `<Section tone>`, `<Stack gap surface padding>`, `<Text color size weight transform truncate numeric italic family align gradient>`, `<Heading color level …>`, `<SiteLogo size tone>`, `<StickyToolbar offset tone padding>`, `<IconBox size tone rounded>`, `<MediaImage src alt size>`, `<MediaVideo>`, `<MediaAudio controls>`, `<HotspotMarker xPct yPct size tone>`, `<HorizontalRule tone spacing>`, `<Anchor href tone underline>`, `<Iframe src title aspect sandbox>`, `<Show above>` / `<Hide below>`, etc.
   - Variants own the responsive behaviour internally — consumer code does not author `sm:` / `md:` / `lg:` prefixes.
   - Email rendering uses the parallel `<EmailDoc>` / `<EmailContainer>` / `<EmailRow>` / `<EmailColumn>` / `<EmailButton>` / `<EmailLink>` / `<EmailImage>` / `<EmailDivider>` / `<EmailFooter>` primitives at `appkit/src/features/email/` — table-based inline-styled markup that email clients render correctly.

### Admin custom themes

`siteSettings.theme` (schema: [`appkit/src/features/admin/schemas/firestore.ts`](appkit/src/features/admin/schemas/firestore.ts) → `SiteSettingsTheme`) stores:
- `themes: ThemeRecord[]` — admin-authored records.
- `defaultLightThemeId: string` — applied when the user's effective mode resolves to `"light"`.
- `defaultDarkThemeId: string` — applied when the user's effective mode resolves to `"dark"`.

Two built-in records (`default-light` = cobalt + lime, `default-dark` = hot-pink) cannot be deleted; the admin can clone either as a starting point. `<ThemeManagerView>` (Site Settings → Themes tab) is the editor — create/duplicate/edit/delete + gradient editor + set-default per mode + live preview iframe.

### Drift protection

- [`scripts/audit-theme-drift.mjs`](scripts/audit-theme-drift.mjs) — verifies the TS theme presets (`appkit/src/tokens/themes/default-light.ts`, `default-dark.ts`) stay aligned with the `:root` and `[data-theme="dark"]` blocks in `tokens.css`. Strict-zero. Registered in [`scripts/run-audits.mjs`](scripts/run-audits.mjs) and [`scripts/claude-hooks/check-on-stop.mjs`](scripts/claude-hooks/check-on-stop.mjs).
- [`scripts/audit-html-wrappers.mjs`](scripts/audit-html-wrappers.mjs) `RAW_GRADIENT_UTILITY` — flags `bg-gradient-to-*` / `from-*` / `to-*` / `via-*` outside primitive sources. Baseline-drift at 62 today; drive to 0 as the consumer sweep migrates each callsite to a primitive variant.
- [`scripts/audit-inline-styles.mjs`](scripts/audit-inline-styles.mjs) `INLINE_COLOR_OVERRIDE` — flags `style={{ color }}` / `backgroundColor` / `borderColor`. Strict-zero. Suppression marker `// audit-inline-style-ok: <reason>` for legitimate dynamic colour pickers.
- Primitive source directories (`appkit/src/ui/components/**`, `appkit/src/ui/forms/**`, `appkit/src/ui/rich-text/**`, `appkit/src/features/email/**`, `appkit/src/features/media/**`, `appkit/src/_internal/client/**`) own the underlying CSS — that's the only place raw utility classes / inline styles are allowed. Suppression marker `// audit-variant-ok: <reason>` for primitive-internal `className` that the audit must allow.

### Rules

1. **Never author raw className for colour, surface, padding, gap, radius, border, shadow, sizing, gradient, sticky offset, or responsive breakpoint.** Pick a primitive variant.
2. **Never write `style={{ color }}` / `backgroundColor` / `borderColor`.** Use a primitive `color` / `surface` / `tone` variant.
3. **Never use `bg-gradient-to-*` utilities outside a primitive source file.** Pick `<Section tone="…">`, `<Card variant="gradient-…">`, or `<Text gradient="…">`.
4. **Never import `THEME_CONSTANTS` in new code.** Consumer-side `THEME_CONSTANTS` is being removed; everything new uses primitive variants.
5. **`<SiteLogo>` does not accept `className`.** Use `size` (`sm`/`md`/`lg`/`xl`/`hero`) and `tone` (`brand`/`mono`/`inverse`/`on-primary`).
6. **Add new admin colours through Site Settings → Themes**, not `globals.css`. Drift between TS presets and `tokens.css` blocks is hard-blocked.

---

## Codebase Exports Catalog

> **`codebaseexports.md`** at project root is the comprehensive catalog of every export from every source file in the monorepo. It covers UI components, feature views, repositories, hooks, server actions, API routes, constants, types, utils, registries, schemas, seed data, page shims, config, tokens, routes, and Firebase jobs.

### Maintenance Rule

**After every code change that adds, removes, renames, or moves an export**, update `codebaseexports.md` to reflect the change. This includes:

1. **New component/function/constant** — add a row to the appropriate section table.
2. **Renamed export** — update the export name in the table.
3. **Deleted export** — remove the row.
4. **Moved file** — update the file path.
5. **New feature domain** — add a new subsection.
6. **Changed props/signature** — update the Props/Signature column.

**Why:** This catalog prevents duplicate work (e.g., building a store products page when an admin products page already exists that differs only by storeId). It is the single reference for "what exists where" and must stay current.

**When to read it:** Before creating any new component, view, hook, or utility — check if one already exists. Before any refactoring session — understand the blast radius.

---

## 🛑 RULE — CHECK INDEX FILES BEFORE CREATING ANYTHING NEW

Before writing any new component, hook, utility, constant, or server action:
1. Read `appkit/index.md` to check if appkit already exports what you need.
2. Read `src/index.md` to check if the consumer layer already has it.
3. Read `codebaseexports.md` (auto-generated catalog) for a broader cross-repo sweep.

**If it exists, import and reuse it. Never duplicate.**

After every session that adds, renames, or removes an export, update the relevant `index.md`.

---

## UI Primitive Rules

> Enforced by `audit-typography.mjs`, `audit-html-wrappers.mjs`, `audit-inline-styles.mjs`, and `audit-code-quality.mjs`. Baselines prevent regressions; new code must use primitives.

### Raw HTML Tag Rules

| Instead of | Use |
|------------|-----|
| `<span className="text-sm text-zinc-500">` | `<Span size="sm" color="muted">` |
| `<strong>` / `<b>` | `<Span weight="bold">` or `<Span weight="semibold">` |
| `<p className="...">` | `<Text>` with props |
| `<h1>` through `<h6>` | `<Heading level={1}>` through `<Heading level={6}>` |
| `<small>` | `<Span size="xs">` or `<Text size="xs">` |
| `<em>` | `<Span className="italic">` |
| `<div>` with layout intent | `<Stack>`, `<Row>`, `<Section>`, `<Container>` |
| `<table>` | `<Table>` from `@mohasinac/appkit` Semantic primitives |

### Select / Dropdown Rules

**Any selection input — filter, form field, bulk-assign, taxonomy picker, role picker, etc. — with MORE THAN 5 options MUST use `<PaginatedSelect>` from `@mohasinac/appkit`.** No exceptions.

| Option count | Component | Mode |
|---|---|---|
| ≤ 5 | `<Select>` / `<FieldSelect>` (native) or inline `<Checkbox>` group | — |
| > 5 single-select | `<PaginatedSelect value onChange loadOptions>` | default (multiple omitted) |
| > 5 multi-select | `<PaginatedSelect multiple value onChange loadOptions>` | `multiple` |
| Any of the above + "+ Create new" | add `createLabel` + `renderCreateForm` OR `createFields`+`onCreateSubmit` | works in both modes |

`<PaginatedSelect>` lives at `appkit/src/ui/components/PaginatedSelect.tsx` and replaces the previous trio (`DynamicSelect` / `InlineCreateSelect` / `PaginatedMultiSelect` — all removed). The create flow opens a `SideDrawer` (custom form via `renderCreateForm`) or a `QuickFormDrawer` (auto-generated from `createFields`), and the newly created option is auto-selected.

Rules:
1. **>5 options = search is mandatory.** Never render a long native `<select>`, `<option>` list, or stacked checkbox list — users cannot scan it.
2. **One primitive, two modes.** Use `multiple` when the user picks N values (renders chips + checkboxes); omit it for single-select (renders a label + auto-closes on pick).
3. **Async pagination.** Pass `loadOptions(query, page) => Promise<AsyncPage<PaginatedSelectOption>>` for server-side search; the component handles debounce, "Load more", and merging across pages.
4. **Static options too.** If a constant list has >5 entries, pass it via the `options` prop; the component filters in-memory against `query`.
5. **Inline create.** Any place a user might legitimately need a new value (categories, brands, tags, addresses, payout accounts, etc.), pass `createLabel` + `renderCreateForm` (custom form) or `createFields`+`onCreateSubmit` (auto-generated `QuickFormDrawer`).
6. **No bespoke search-dropdowns.** Don't roll your own `<input>` + filtered `<ul>` — `PaginatedSelect` already handles keyboard nav, ARIA, selected-chip semantics, and the create-drawer wiring.
7. **Type imports.** Use `PaginatedSelectOption<V>` and `AsyncPage<T>` from `@mohasinac/appkit/ui` for `loadOptions` factory signatures.

### Color Token Rules

| Instead of | Use |
|------------|-----|
| `text-red-600` / `bg-red-50` (error/danger context) | `text-error` / `bg-error-surface` |
| `text-green-600` / `bg-green-50` (success context) | `text-success` / `bg-success-surface` |
| `text-amber-600` / `bg-amber-50` (warning context) | `text-warning` / `bg-warning-surface` |
| `text-blue-600` / `bg-blue-50` (info context) | `text-info` / `bg-info-surface` |
| `text-zinc-*` / `bg-zinc-*` (neutral) | Acceptable — zinc/slate are structural neutrals |
| `#3570fc` / `#8393b2` raw hex | `var(--appkit-color-primary)` or Tailwind token |

Centralized status colors live in `src/constants/theme.ts` (`THEME_CONSTANTS.badge.*`, `.accent.*`, `.colors.alert.*`). Reference those constants for status styling; don't duplicate raw classes.

### Surface & Padding Props

Layout primitives (`Stack`, `Row`, `Grid`, `Container`, `Section`, `Div`) accept:
- `surface`: `"none"` | `"default"` | `"muted"` | `"subtle"` | `"inset"` | `"card"` | `"elevated"` | `"interactive"` | `"glass"` | `"form"`
- `padding`: `"none"` | `"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"` | `"card"` | `"section"` | `"page"` | `"inline"`
- `rounded`, `border`, `shadow` — similar token maps

Prefer props over raw className for these concerns. `className` is the escape hatch.

### Inline Style Rules

`style={{}}` is blocked by `audit-inline-styles.mjs` (baseline 473). Acceptable exceptions:
- CSS custom properties (`style={{ "--var": value }}`)
- Dynamic values impossible with classes (`style={{ top: offset }}`)
- Third-party library requirements
- Allowlisted files: RichTextRenderer, ImageCropModal, ImageEditor, VideoTrimModal, CameraCapture, MediaSlider, HeroCarousel, SpinWheelView

---

## Firebase Functions Registry

> Track A — every Firebase function is declared once as a typed `FunctionDefinition` record. There is no manual `bindToFirebase.{schedule,documentCreated,https}` call in consumer code.

**Pattern**:

```ts
// appkit/src/_internal/server/functions/{scheduled,firestore,https}/<name>.ts
import { defineFunction } from "../define";
import { handlerFn } from "../../jobs/handlers";

export const myJob = defineFunction({
  name: "myJob",
  description: "What it does (one line).",
  trigger: { kind: "schedule", cron: "every 15 minutes" },
  handler: handlerFn,
  options: { region: "asia-south1", timeoutSeconds: 300, memory: "256MiB" },
});
```

**HTTPS definitions** must declare `options.secretEnvVar` and (optionally) `options.secrets` — the type forces this at compile time and `audit-functions-registry-completeness` re-asserts at runtime.

**Consumer extension** (`functions/src/consumer-functions.ts`):

```ts
export const CONSUMER_FUNCTIONS: readonly FunctionDefinition[] = [
  defineFunction({ name: "myCustomJob", /* ... */ }),
];
```

The merge order in `functions/src/index.ts` is `mergeFunctionRegistries(APPKIT_FUNCTIONS, CONSUMER_FUNCTIONS)` — consumer-side overrides require `options.overrides: "<shadowed-name>"` and throw otherwise. `Object.assign(exports, bindAllFromRegistry(REGISTRY))` is the canonical wiring; no other binding call is permitted (enforced by audit).

---

## Async Job Primitive (2026-08-15)

> The pattern for any admin action that would exceed the Vercel Hobby 10s sync-function ceiling (Rule #6). **Vercel routes never do heavy work — they enqueue a job and return.** All actual processing runs inside a Firebase Function. See `asciiDiagrams.md` → "Async Job Primitive" for the full flow diagram.

**Collection**: `jobs` (pure Firestore auto-ID, see slug table above). `appkit/src/features/jobs/schemas/firestore.ts` — `JobDocument { jobType, status, payload, requestedBy, result?, error?, startedAt?, finishedAt? }`, `JobStatusValues` (`pending`/`processing`/`done`/`failed`).

**A route's entire job-related responsibility**:

```ts
const { jobId, customToken } = await enqueueJob({
  jobType: "myJobType",
  payload: { /* jobType-specific */ },
  requestedBy: user!.uid,
});
return successResponse({ jobId, customToken }, "Job started");
```

`enqueueJob()` (`appkit/src/features/jobs/actions/enqueue-job.ts`) writes the `jobs/{jobId}` doc, best-effort-seeds `bulk_events/{jobId}` in RTDB, and mints a custom token carrying `{ bulkJobId: jobId }` (must match this exact claim name — it's what `appkit/firebase/base/database.rules.json`'s `bulk_events` rule checks). Nothing else. It never runs the job.

**All real work runs in `onJobCreated`** (`appkit/src/_internal/server/functions/firestore.ts`, `documentCreated` trigger on `jobs/{jobId}`, `timeoutSeconds: 300`, `memory: "512MiB"`) — dispatches by `job.jobType` through the `JOB_RUNNERS` registry (`appkit/src/_internal/server/jobs/core/jobRunners.ts`), marks the job doc `processing`→`done`/`failed`, and best-effort pings `bulk_events/{jobId}` with a `BulkActionResult`-shaped payload on completion. Add a new job type by registering a `JobRunner` (`(payload, ctx) => Promise<JobRunResult>`) in `JOB_RUNNERS` — never add a second dispatch point.

**Client side** — reuse `useBulkEvent({ rtdbPath: RTDB_PATHS.BULK_EVENTS })` (`appkit/src/features/events/hooks/useBulkEvent.ts`): `subscribe(jobId, customToken)` after the enqueue call resolves, watch `status` for `"success"`/`"failed"`/`"timeout"`, read `result.summary` for the toast. Don't build a new job-status hook — this one already exists and is the intended consumer.

**Current job types**: `payoutsWeekly` (wraps the scheduled `runWeeklyPayoutEligibility` — the manual-trigger route and the cron share one implementation, never two), `hardBanCascade` (the 8-stage user hard-ban cascade, extracted verbatim off the Vercel route it used to block).

**Not every bulk/heavy action needs this.** A bounded `Promise.all` over ≤50 rows (see `src/app/api/store/products/bulk-location/route.ts`, `src/app/api/admin/users/bulk/route.ts`) is fine as a plain synchronous route — reach for the job primitive only when the work is genuinely unbounded or already timing out.

---

## Tester QA Program (Tier QA, 2026-08-17)

> Dedicated human testers work through a persistent, admin-managed checklist against a shared, disposable test sandbox. Full plan: `C:\Users\mohsi\.claude\plans\give-me-a-tester-optimized-ocean.md`.

**Role model**: a tester's `role` stays `"seller"` — every existing seller-gated dashboard/API/payout/analytics check works unmodified. A separate `isTester?: boolean` on `UserDocument`/`SessionUser` (orthogonal to `role`, not a role-string comparison, so `audit-inline-role-check.mjs` doesn't apply) unlocks the Tester Hub and auto-approves the tester's store (`becomeSeller`/`createStore` in `appkit/src/features/seller/actions/seller-actions.ts` branch **both** `UserDocument.storeStatus` and `StoreDocument.status`/`isPublic` — they are two distinct fields; only flipping the user-doc one leaves the store invisible, since public-visibility checks gate on `StoreDocument.status`).

**Checklist catalog vs. responses — two collections, not one**: `testerChecklistItems` is the admin-authored catalog of test cases (CRUD via `/admin/tester-checklist`, direct clone of the FAQ admin feature). `testerChecklistResponses` is one doc per `(tester, case)`, upserted by a **deterministic doc ID** — `` `${testerId}__${checklistItemId}` `` — via `set({merge:true})`, never a duplicate-creating `add()`. This is what makes Yes/No answers + comments + screenshots survive a page reload. Each item's optional `href` deep-links a tester straight to the feature under test, opening in a new tab (`TesterChecklistStepRow.tsx`'s `<Anchor target="_blank" rel="noopener noreferrer">`) — it must be a real, existing route, either a static page (a bare string matching `route-map.ts`'s values, not a `ROUTES.*` reference) or a dynamic-route deep link whose trailing segment is a known seed-data fixture id (e.g. `/auctions/auction-tester-sandbox-won`) — enforced strict-zero by `scripts/audit-tester-checklist-hrefs.mjs` (Recurrent Root Cause Pattern #32 above).

**Standards for adding future checklist items & sandbox fixtures (2026-08-21):**
1. Every checklist item should resolve to a working `href`. `tester-checklist-seed-data.ts`'s `group()` helper resolves `href: c.href ?? page.href` — set a page-level default (on the `pages[]` object passed to `group()`) once per page rather than hand-annotating every case, and only add a case-level override when that specific case is about one particular fixture (point it at the fixture's real dynamic-route slug, e.g. `/prize-draws/prizedraw-tester-sandbox-1`, not the generic listing page).
2. New tester-sandbox fixtures with a generated/looped id (a template literal like `` `auction-tester-sandbox-cycle-${i + 1}` `` instead of a plain string) are picked up automatically by `audit-tester-checklist-hrefs.mjs`'s known-id scan — it matches both `id: "literal"` and `` id: `template-${expr}` `` shapes. No audit changes needed when adding more fixtures this way.
3. When adding a new sandbox-scoped collection (or extending which collections count as "sandbox"), extend the single exported `SANDBOX_COLLECTIONS` constant in `testerSandboxCleanup.ts` and mirror it into `testerSandboxRefresh.ts`'s `SEED_BY_COLLECTION` map — the daily TTL cleanup and the 4-hour revert+prune refresh (below) must stay in sync on what "sandbox" means; don't redefine the collection list a third time.
4. Any time-sensitive tester-sandbox fixture (auction end dates, TTL expiry, etc.) must use a `Date.now()`-relative offset computed at module-import time, never a fixed calendar date — this is what lets it "re-arm" correctly on every reseed/refresh cycle instead of going permanently stale. See `AUCTION_CYCLE_STAGGER_HOURS` in `products-tester-seed-data.ts` for the incrementing-id-loop pattern (avoids hand-typed id collisions when staggering multiple fixtures of the same kind).

**Test-data tagging** — any collection that can hold shared, disposable tester-sandbox data (`categories`, `stores`, `products`, `blogPosts`, `events`) carries two new optional fields: `isTestData?: boolean` and `testDataExpiresAt?: Date`. Seed fixtures live in `appkit/src/features/tester/seed-data/` (deliberately **not** `appkit/src/seed/`) and are merged into the existing seed-cli automatically — no separate admin trigger. `testDataExpiresAt` is recomputed fresh on every seed run, so re-seeding refreshes the expiry.

**Visibility — application-layer filter, not a Firestore query clause.** `filterTestDataForViewer()`/`filterSingleTestData()` (`@mohasinac/appkit/server`, defined in `appkit/src/_internal/server/features/tester/visibility.ts`) strip `isTestData:true` items post-fetch unless the viewer is a tester or admin. **Never** add `where("isTestData", "!=", true)` to a query — Firestore inequality filters silently exclude every document that doesn't have the field set at all, which is every pre-existing real document (the field is new and optional). Applied today to the store listing/detail read paths (`store-query-actions.ts`, `/api/stores`); category/blog/event listing routes need the identical one-line treatment when touched next.

**Cleanup — scheduled + manual, one shared core.** `testerSandboxCleanup` (Firebase Function, daily) and `node appkit/scripts/purge-tester-sandbox.mjs` (`npm run tester:purge-sandbox`, immediate force-purge) both call `runTesterSandboxCleanup(ctx, { force })` — never duplicate this logic. It cascades into `bids` referencing a deleted test product (bids hold only a live `productId` FK, no snapshot — an orphaned bid is meaningless). It deliberately leaves `orders`/`reviews`/`wishlists`/`history` untouched even when they reference a deleted test product, because all four denormalize the fields they display (title/price/image) — only the "view product" link 404s, which is acceptable for disposable test data.

**Refresh — every 4 hours, distinct from the daily cleanup above.** `testerSandboxRefresh` (Firebase Function, `appkit/src/_internal/server/jobs/core/testerSandboxRefresh.ts`, `runTesterSandboxRefresh(ctx)`) reverts every *still-live* sandbox fixture (`categories`/`stores`/`products`/`blogPosts`/`events` where `isTestData:true`, plus the sandbox `bids`) back to its canonical seeded shape via `merge:true` upserts, and deletes any `isTestData` doc not in the known seed-id set — i.e. a tester-created extra (cloned product, new bid) rather than an edit to an existing fixture. Added 2026-08-21 because multiple testers sharing one live sandbox could edit or bid on a fixture and pollute it for the next tester until the 7-day TTL cleanup happened to catch it — this closes that gap without waiting on expiry. Scoped to the tester sandbox only; the permanent Beyblade catalog is never touched by either job. The tester-sandbox auction fixtures (`products-tester-seed-data.ts`) are staggered 1h/2h/3h-out (`auction-tester-sandbox-cycle-{1,2,3}`, generated from a loop, plus the always-ended `auction-tester-sandbox-won`) so this 4-hour cycle reliably lets testers watch a live auction actually end mid-session.

**Known gap**: `npm run check` does not run an actual `next build`, so it cannot catch Turbopack-level bundling regressions (e.g. a `node:module`-importing file becoming reachable from a client chunk). If touching anything in this tier's import chain, also run a real `npm run build` before calling a change done.

**Feedback export — one Markdown report, two consumers.** `TesterChecklistResponseRepository.getMarkdownReport(siteOrigin)` (2026-08-17) is the single source of the export shape: it joins every answered response against the `testerChecklistItems` catalog for readable labels, then groups into an **Issues** section (every `"no"` answer — checkbox list with tester name, comment, screenshot link, deep link, review status) and a **Notes on passing cases** section (every `"yes"` that still left a comment — usually styling/readability feedback). `node appkit/scripts/export-tester-feedback.mjs` (`npm run tester:export-feedback`) mirrors this exact logic as a standalone CLI, writing `tester-feedback-report.md` at the repo root (gitignored) for a human or a future Claude session to `Read` directly — no live Firestore query needed. `GET /api/admin/tester-feedback/export` streams the same Markdown as a download via the "Download Report" button on `AdminTesterFeedbackView` (`ACTIONS.ADMIN["export-tester-feedback"]`). **When changing the report shape, update both** — the CLI script and `getMarkdownReport()` must stay in sync; there is no single shared implementation between the two runtimes (Node CLI vs. an appkit repository method invoked from a Next.js route).

---

## Provider Resolution (Payment + Shipping)

> Track H, revised in the manual-first refactor (2026-08); mock provider removed entirely (2026-08-17) — `IPaymentProvider` / `IShippingProvider` are abstract base classes (not interfaces), so every implementation `extends` one shared contract. Manual is the default and only shipping provider; manual is the default payment provider, with Razorpay available but disabled by default. Shiprocket has been removed entirely — no code, schema fields, or seed data reference it.

**Payment**: `ManualPaymentProvider` (`appkit/src/providers/payment-manual/`) is the default — buyer pays via bank transfer/UPI outside the app and uploads a reference (UTR) + proof, which the seller/admin manually confirms (the existing `paymentProofUrl`/`paymentTransactionId` fields on `OrderDocument`). `RazorpayProvider` (`appkit/src/providers/payment-razorpay/`) remains fully implemented and registrable, gated behind `siteSettings.payment.razorpayEnabled` (default `false`). **There is no mock payment provider.** `MockRazorpayProvider`, `resolvePaymentProvider`, and `siteSettings.featureFlags.useMockPayment` were deleted entirely (2026-08-17) — local/CI payment-flow testing requires real Razorpay test-mode keys.

**Shipping**: `ManualShippingProvider` (`appkit/src/providers/shipping-manual/`) is the only implementation — sellers enter carrier name + tracking number/URL directly (`customShipOrder` in `appkit/src/features/seller/actions/seller-actions.ts` is the actual write path). It makes no external API calls, so there is no mock and no `useMockShipping` flag — nothing to choose between.

**Routes** call `getProviders().payment.X()` / `getProviders().shipping.X()`; `providers.config.ts` always populates both (never `undefined`). No source outside `appkit/src/providers/payment-razorpay/**` or `appkit/src/providers/payment-manual/**` may import the `razorpay` npm package or implement `IPaymentProvider` directly, enforced by `audit-payment-provider-import`. No source outside `appkit/src/providers/shipping-manual/**` may implement `IShippingProvider` directly, enforced by `audit-shipping-provider-import` (the Shiprocket-specific host check was removed along with the provider).

**Webhook simulation**: none. The admin-only `POST /api/admin/dev/emit-payment-webhook` endpoint was deleted along with the mock provider it drove. New routes under `src/app/api/dev/**` are blocked by `audit-orphan-dev-routes`.

**Admin checkout bypass** (`siteSettings.featureFlags.adminCheckoutBypass`) is the **single** legitimate way to skip OTP + payment for testing. It is read only by `src/app/api/admin/checkout-bypass/route.ts`, must be wrapped by `createRouteHandler({ roles: ROLES_ADMIN_ONLY, permission: "settings:write" })`, and every invocation logs `actorUid` + `reason`. Enforced by `audit-checkout-bypass`.

---

## Form Authoring Pattern

> Track D — every form ships with a Zod schema. There is no manual validation mode.

**Components**:
- `<FormShell>` (`appkit/src/features/shell/FormShell.tsx`) + `<StepForm schema={zodSchema} ...>` (`appkit/src/features/shell/StepForm.tsx`) for multi-step / split-preview wizards.
- `useFormShellState(zodSchema)` (`appkit/src/ui/forms/FormShell.tsx`) for caller-owned layouts — also the state/context provider `<Form>` and the wizard both consume internally.
- `<QuickFormDrawer schema={zodSchema} fields={...}>` for compact 1–3 field inline edits.

**Inputs**: `<FieldInput>`, `<FieldSelect>`, `<FieldTextarea>`, `<PaginatedSelect>` (any selection > 5 options). Raw `<form onSubmit>`, `<input>`, `<select>`, `<textarea>` are blocked by `audit-raw-form-input`. `react-hook-form` is installed for transitive consumers but is not the appkit authoring path.

**Audits**: every `<FormShell>` and `useFormShellState(...)` callsite must reference a Zod schema (`audit-form-schema`). Every `<QuickFormDrawer>` must pass a `schema` prop (`audit-quick-form-drawer-schema`).

**Error summary** (added 2026-08-21): every form using `<FormShell schema={...}>`, `useFormShellState(schema)`, or `<Form schema={...}>` MUST also render `<FormErrorSummary />` (`appkit/src/ui/forms/FormErrorSummary.tsx`) somewhere near its Submit/Save/Publish button. It reads `FormShellContext` directly (no required props), lists every current error live — not gated on `touched`, so it updates on every change, not just on submit — and, when the context carries `fieldToStepIndex` (populated by a step wizard), tags each error with its owning step and makes it clickable to jump there via `goToStep`. This **supplements** per-field inline errors, it does not replace them. Enforced by `audit-form-error-summary` (strict-zero, suppression `// audit-form-error-summary-ok: <reason>`).

**`applyZodIssues(issues, setFieldError)`** (`appkit/src/ui/forms/FormShell.tsx`) keys errors by the full dotted/indexed Zod path (`issue.path.map(String).join(".")`, e.g. `"video.duration"`, `"images.2"`) — not just `issue.path[0]` — so nested-field issues don't collapse onto one map entry and silently drop all but the last.

**Two more strict-zero audits guard this pattern from regressing**:
- `audit-dead-underscore-prop` — flags any object-destructure alias (`{ real: _alias }`) or array-destructure alias (`const [a, _b] = useState(...)`) that's bound and never referenced again anywhere else in the file. This is the exact defect class that caused `FormShell.tsx`'s `schema: _schema` (received, silently discarded) and `StepForm.tsx`'s `_setFieldErrors` (declared, never called) bugs. Suppression `// audit-dead-underscore-prop-ok: <reason>` on the declaration line or the contiguous comment block immediately above it (multi-line word-wrapped explanations are scanned, not just the single line directly above).
- `audit-unvalidated-safeparse` — flags a `.safeParse(...)` call whose result isn't piped into `setFieldError`/`setErrors`/`applyZodIssues`/`throw new ValidationError(...)` within a short window afterward — catches "validation ran but the result went nowhere," distinct from "no schema at all" (which `audit-form-schema` already covers). Suppression `// audit-unvalidated-safeparse-ok: <reason>`.

---

## RBAC + Mocks Gating

> Tracks B + C — every privileged surface is guarded; every mock surface is dev-only; role string compares are forbidden.

**API routes** under `src/app/api/**/route.ts`: every exported verb wraps `createRouteHandler({ auth, roles, permission })` or carries `// rbac-public: <reason>` above the export. `roles` + `permission` are both required unless the export carries `// rbac-scope-enforced-in-handler: <reason>`. Enforced by `audit-route-rbac`.

**Dashboard pages** under `src/app/[locale]/{admin,store,user}/`: every `page.tsx` must have an ancestor layout that calls `makeAdminSectionLayout(permission)` or renders `<RoleGuard role={...}>`. Enforced by `audit-page-rbac`.

**Role checks**: never compare `user.role === "x"` inline. Always use the predicate (`isAdminUser(user)`, `isSellerUser(user)`, etc.) from [appkit/src/features/auth/role-predicates.ts](appkit/src/features/auth/role-predicates.ts). Enforced by `audit-inline-role-check`.

**Session cookie reads**: the only file allowed to call `cookies().get("__session")` is [src/lib/firebase/auth-server.ts](src/lib/firebase/auth-server.ts). Every other site uses `getServerSessionUser()` / `requireAuthFromRequest()`. Enforced by `audit-inline-session-cookie`.

**Auth routes**: every handler under `src/app/api/auth/**/route.ts` must call `applyRateLimit(request, RateLimitPresets.<AUTH|PASSWORD_RESET|OAUTH>)`. Enforced by `audit-auth-rate-limit`.

**Mocks**: `src/__mocks__/*` files are Jest-only and carry `// audit-mock-gating-ok: jest-only` at the head. Seed data lives in `appkit/src/seed/` and is consumed only by `appkit/scripts/seed-cli.mjs` (via the compiled `@mohasinac/appkit` package export, not a source-path import) — no `letitrip.in/` app code should import from `appkit/src/seed/` at all. `audit-mock-gating.mjs`'s carve-out for the old `src/app/api/demo/seed/route.ts` is now unreachable since that route doesn't exist, but the rule it enforces (nothing else may import seed data) still holds.

---

## Media Architecture

> Track E — bytes never traverse the application server.

**Upload flow**: client → `POST /api/media/sign` (header-only) → browser PUT to GCS signed URL → `POST /api/media/finalize` (header-only, magic-byte verification + structured `422 MIME_MISMATCH` on disagreement).

**Read flow**: `/media/<slug>` proxy streams the GCS object through Sharp watermarking for images, raw pipe for non-images. Input cap 50 MB. Response `Cache-Control: public, max-age=2592000, immutable, stale-while-revalidate=86400`.

**Rules**:
- No `request.formData()`, `request.body` (binary), `request.arrayBuffer()`, `request.blob()` in any API route except `/api/media/sign` and `/api/media/finalize` (header-only). Enforced by `audit-media-direct-upload`.
- No raw `firebasestorage.googleapis.com` / `storage.googleapis.com/v0/` URL anywhere in source. Only `src/app/api/media/**`, `appkit/src/_internal/server/storage/**`, and the `seedExtMedia` helper definition may reference these hosts. Enforced by `audit-firestore-storage-urls`.
- No JSX `src="https://..."` pointing at Firebase Storage, GCS, or googleusercontent (except `lh3.googleusercontent.com` for unfinalized Google OAuth photos). Enforced by `audit-raw-img-src`.
- Storage rules at [appkit/firebase/base/storage.rules](appkit/firebase/base/storage.rules) stay `allow read: if true` / `allow write: if false`. Enforced by `audit-storage-rules-shape`.
- `/api/media/finalize` always runs `fileTypeFromBuffer()` magic-byte detection and emits structured `422 MIME_MISMATCH` on disagreement. Enforced by `audit-finalize-magic-bytes`.

### Watermark fallback chain (2026-08-19)

The image/video watermark is no longer just "text or an admin-uploaded image" — `resolveEffectiveWatermark()` (`src/lib/watermark/resolve-effective-watermark.ts`) is the single source of truth for what actually gets stamped, with a 4-tier fallback:

1. Explicit admin override — `siteSettings.watermark.type === "image"` with a real `imageUrl` the admin uploaded via Site Settings.
2. The bundled brand icon mark (`public/logo.svg`, `DEFAULT_MARKER_ASSET_PATH`) — always shipped with the app, read straight off local disk (no Storage round-trip) by `loadWatermarkImageBuffer()` in `src/app/api/media/_watermark.ts`.
3. The admin-configured wordmark image (`siteSettings.logo.url`), if set.
4. Plain site-name text (the original always-available default).

Both consumers call the **same** resolver so they can never drift apart:
- `src/app/api/media/_watermark.ts`'s `loadWatermarkConfig()` (server, sharp composite for images) calls `resolveEffectiveWatermark()` directly.
- `GET /api/site-settings` (`src/app/api/site-settings/route.ts`) computes `effectiveWatermark` once and returns it alongside the raw `watermark` field — the raw field stays untouched so `AdminSiteSettingsView`'s edit form keeps showing what's actually saved, while `MediaVideo.tsx`'s client-side overlay (video can't be sharp-composited on Hobby tier — see Media Architecture above) reads `siteSettings.effectiveWatermark ?? siteSettings.watermark`.

If an image tier fails to load (e.g. an admin-uploaded override was deleted from Storage), `applyWatermark()` degrades to the text tier rather than silently skipping the watermark — the previous behavior (`!wmExists → return source unmodified`) is gone.

**Icon mark vs. wordmark — two separate primitives, not one component with two faces**: `<SiteMark>` (`appkit/src/ui/components/SiteMark.tsx`) renders the icon glyph (inlined path data lifted from `public/logo.svg`, gradient recolored via the same `--appkit-logo-stop-*` tokens `<SiteLogo>` uses); `<SiteLogo>` renders the "LetItRip.in" text wordmark. They're placed together (mark before/above text) in the header (`TitleBarLayout`, centered on desktop / prefixed on mobile), the homepage hero card (`WelcomeSection`), `PageLoader` (as a rotating spinner), `LoginForm`/`RegisterForm`, and `NotFoundView` — never inside `<FallbackShell>`, which deliberately avoids Tailwind-class dependencies for last-resort crash boundaries.

---

## Animation Rules

> `motion` (v12.x) is installed in appkit. All animation primitives are in `appkit/src/ui/components/Motion.tsx`.

### Available Components

| Component | Use for |
|-----------|---------|
| `FadeIn` | Fade-in on mount (opacity 0→1) |
| `SlideUp` | Slide up + fade on mount |
| `ScaleIn` | Scale in from 95% + fade |
| `Collapse` | Accordion expand/collapse |
| `SlideIn` | Slide from edge (side prop) |
| `AnimatedList` | Staggered children animation |
| `AnimatedDiv` / `AnimatedStack` / `AnimatedRow` | motion-enabled layout primitives |
| `PressScale` / `HoverLift` | Micro-interaction wrappers |
| `Draggable` / `Swipeable` | Gesture-enabled containers |

### Rules

1. **All motion components are `"use client"`** — never import in server components.
2. **`useReducedMotion()`** is respected automatically — all components check `prefers-reduced-motion` and skip animation when enabled.
3. **Server components cannot use motion** — if a server component needs animation, the animated section must be a separate client component.
4. **Modal/Drawer/SideModal** already have AnimatePresence wired — don't add extra motion wrappers around them.
5. **Card `animate` prop** — use `animate="hoverLift"`, `"pressScale"`, `"hoverScale"`, or `"both"` instead of custom motion.
6. **DataTable card grid** uses `AnimatedList` by default — no extra wiring needed.
7. **Toast** has AnimatePresence — individual toasts slide in/out automatically.

### Spring Tokens

Defined in `appkit/src/tokens/motion.ts`:
- `SPRING_SNAPPY` — fast UI (200ms feel)
- `SPRING_GENTLE` — smooth overlays (300ms feel)
- `SPRING_BOUNCY` — playful interactions
- `DURATION_*` — `FAST` (150ms), `NORMAL` (250ms), `SLOW` (400ms), `ENTER` (300ms), `EXIT` (200ms)

---

## Media Upload Rules

> Upload flow: Client → signed URL → Firebase Storage → media slug returned. Bytes never go through Next.js (4.5 MB request cap).

### Components

| Component | Purpose |
|-----------|---------|
| `MediaUploadField` | Full upload field with preview, progress, remove. Supports `multiple` prop. |
| `ImageUpload` | Image-specific upload with optional `enableAdvancedCrop` for crop/rotate/zoom. |
| `ImageEditor` | Advanced crop/rotate/zoom modal (react-advanced-cropper). |

### Rules

1. **Never upload bytes through API routes** — use the signed-URL flow (`/api/media/sign` → PUT to Storage → `/api/media/finalize`).
2. **All Firestore URLs use `/media/<slug>`** — never store raw `firebasestorage.googleapis.com` URLs.
3. **`generateMediaFilename(ctx)`** generates SEO slugs — always pass the correct context type and slug.
4. **tmp/ prefix** — uploads start in `tmp/` path; `finalize` moves to permanent path. Aborted uploads are auto-cleaned by `mediaTmpCleanup` Firebase Function.
5. **Image editor** — enable via `enableAdvancedCrop` prop on `ImageUpload`. Supports aspect ratio presets (Free/1:1/4:3/16:9/3:2), rotate, flip.
6. **Multi-select** — pass `multiple` to `MediaUploadField` for batch upload. Files upload sequentially with individual progress.
7. **FormShell Zod validation** — pass `schema` prop to auto-validate on publish; `validateOnChange` for live validation.

---

## 🛑 RULE — ENV FILE SYNC & CLIENT EXPOSURE

1. **Before every session**, verify that every env var read in code has a corresponding entry in `.env.local`. Run `npm run audit env-alignment` to catch missing/unused vars.
2. **Never add a `NEXT_PUBLIC_` prefix** to a secret or server-only variable (Firebase Admin keys, Razorpay secret, PII keys, internal secrets). If the code only runs server-side, the prefix is wrong.
3. **Never pass unnecessary env vars** as props or context to client components. Read them in Server Components or API routes and pass only the derived, sanitised values downstream.
4. **No new env vars** without a corresponding entry in `.env.local` (for local dev) and a note in `newchange.md` explaining what the key does and where to get its value.

---

## End-of-Plan Checklist

Run these steps **in order** at the end of every plan session before marking anything ✅ — **except** steps 2 (appkit publish), 3–4 (Firebase deploys), 5 (smoke test — needs a running server), and 6 (Vercel deploy), which are all gated by [Rule #10](#-rule-10--never-run-dev-server-or-deploy-without-explicit-request) and only run when the user explicitly asks for that specific step in that message. Step 1 (`npm run check`, no server/deploy involved) is the only one that's still an unconditional default.

### 1 — Quality Gate

```bash
npm run check
```

Must exit 0. Fix all failures before proceeding.

### 2 — Appkit Publish (only when explicitly asked)

```bash
# a. Commit all appkit source changes first
# b. Bump version in appkit/package.json (patch = +0.0.1, minor = +0.1.0)
npm run build              # inside appkit/
npm publish                # inside appkit/
# c. Update letitrip/package.json "@mohasinac/appkit": "^X.Y.Z"
# d. Remove appkit/src/** lines from tsconfig.json include[]
# e. Delete package-lock.json + npm install
# f. npx tsc --noEmit   (both repos, must be 0 errors)
# g. Commit: appkit/package.json + letitrip/package.json + lock + tsconfig
```

If using `file:./appkit` locally (normal dev): skip publish entirely.

### 3 — Firebase Indexes + Rules (if schema/index changed)

```bash
npm run firebase generate
npm run firebase deploy --only indexes
node scripts/wait-for-indexes.mjs    # wait until CREATING=0
npm run firebase deploy --only rules
```

If indexes had stale entries causing 409:

```bash
node appkit/scripts/firebase-delete-indexes.mjs
npm run firebase deploy --only indexes
node scripts/wait-for-indexes.mjs
```

### 4 — Firebase Functions (if functions/ changed)

```bash
npm run firebase deploy --only functions
```

Confirm no `MODULE_NOT_FOUND` in cold-start logs after deploy.

### 5 — Smoke Test

```bash
npm run test:qa smoke
```

Must exit 0.

### 6 — Vercel Deploy (only when explicitly asked)

```bash
node scripts/deploy.mjs
```

Pre-flight checks: lockfile resolves from npm registry, `tsconfig.json` excludes `appkit/src/**`, `npm run check` passes. Then deploys via `vercel --prod`.

### 7 — Update Index Files

After any export addition, rename, or removal:
- Update `appkit/index.md`
- Update `src/index.md`
