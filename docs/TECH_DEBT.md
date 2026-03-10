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

## ~~TD-002~~ — ✅ RESOLVED 2026-03-10 — `useApiQuery` / `useApiMutation` adapter files deleted

**Files:** ~~`src/hooks/useApiQuery.ts`~~, ~~`src/hooks/useApiMutation.ts`~~

**Resolution:** Both adapter files were deleted in Stage C4 (2026-03-09). All callers were
migrated to call `useQuery`/`useMutation` directly from `@tanstack/react-query`. Zero
remaining callers verified by grep. This debt item is closed.

---

## ~~TD-003~~ — ✅ RESOLVED 2026-03-10 — Services layer mutations converted to Server Actions

**File:** `src/services/` (mutation methods deleted; read-only services remain as apiClient wrappers)

**Resolution:** Stage G1 + H3 complete (2026-03-10). All mutation service methods were
deleted and replaced by Server Actions in `src/actions/`. Pure-passthrough mutation services
(contact, newsletter, payment-event, demo) were deleted entirely. Read-only services remain
as thin apiClient wrappers which is acceptable for the current architecture.
This debt item is closed.

---

## ~~TD-004~~ — ✅ RESOLVED 2026-03-10 — `THEME_CONSTANTS` pure Tailwind aliases deleted

**File:** ~~`src/constants/theme.ts`~~

**Resolution:** Stage F1 + H4 complete (2026-03-10). The `spacing.gap.*`, `spacing.padding.*`,
`spacing.margin.*`, `borderRadius.*` pure-alias entries were deleted from `THEME_CONSTANTS`.
Call sites now use direct Tailwind classes. This debt item is closed.
