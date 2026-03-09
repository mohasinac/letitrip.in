# Technical Debt

Tracked issues that require upstream fixes before they can be resolved in this codebase.

---

## TD-001 — Turbopack chunk-generation bug with large `as const` objects

**File:** `next.config.js` (see `turbopack: {}` configuration)

**Symptom:** Production builds crash with `EcmascriptModuleContent::new_merged` when using
`next build` with Turbopack enabled. The error occurs when Next.js encounters deeply-nested
`as const` object declarations (e.g. `THEME_CONSTANTS`, `API_ENDPOINTS`, `ERROR_MESSAGES`).

**Affected version:** Next.js 16.1.1 with Turbopack

**Workaround:** Production builds use `next build --webpack` (webpack). Turbopack is enabled
only for `next dev --turbopack` (local development). See `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build"
  }
}
```

**Upstream issue:** <https://github.com/vercel/next.js/issues> — search "EcmascriptModuleContent new_merged"

**Resolution:** Upgrade Next.js once the Turbopack chunk-generation fix is released. After
upgrading, remove the `turbopack: {}` workaround comment from `next.config.js` and verify
that `next build --turbopack` succeeds.

**Impact:** Development server (Turbopack) is fast. Production builds are marginally slower
(webpack) but fully functional. No user-facing impact.

---

## TD-002 — `useApiQuery` / `useApiMutation` — thin TanStack adapters pending full migration

**Files:** `src/hooks/useApiQuery.ts`, `src/hooks/useApiMutation.ts`

**State:** These were rewritten as thin `useQuery`/`useMutation` TanStack wrappers in Stage C
(2026-03-09). All 150+ callers were intentionally left unchanged to minimise migration scope.

**Debt:** The hooks should eventually be deleted (Stage C sub-wave A) once all callers are
migrated to call `useQuery`/`useMutation` from `@tanstack/react-query` directly.

**Resolution:** Migrate callers feature-by-feature. Run the verification grep before deleting:

```bash
grep -rl "useApiQuery\|useApiMutation" src --include="*.ts" --include="*.tsx"
# Must return empty before deleting the adapter files
```

---

## TD-003 — Services layer: pure-passthrough `apiClient` wrappers

**File:** `src/services/` (35 service files)

**State:** All 35 service files are pure `apiClient` wrappers — no transformation, caching,
or orchestration. The call chain is 7 hops: Component → hook → service → apiClient → HTTP →
API route → repository → Firestore.

**Plan:** Stage G1 — Convert mutation services to Server Actions in `src/actions/`. Delete
pure-passthrough read services. This collapses the chain to 2-3 hops for mutations.

**Resolution:** Tracked in `MASTER_PLAN.md` §3.2 and Stage G1.

---

## TD-004 — `THEME_CONSTANTS.spacing.{gap,padding,margin}` pure Tailwind aliases

**File:** `src/constants/theme.ts`

**State:** The `spacing.gap.*`, `spacing.padding.*`, and `spacing.margin.*` entries are plain
Tailwind class aliases (e.g. `spacing.gap.md = "gap-4"`). They add one level of indirection
with zero semantic value.

**Plan:** Stage F1 — Delete these entries and replace call sites with direct Tailwind classes.
`borderRadius.*` entries may also be candidates for removal if they are pure aliases.

**Resolution:** Tracked in `MASTER_PLAN.md` §4.2 and Stage F1.
