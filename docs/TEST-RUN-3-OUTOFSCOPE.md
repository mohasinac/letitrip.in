# Test Run 3 — noticed, not chased

**G4.** Every fix in [TEST-RUN-3.md](TEST-RUN-3.md) names the case id that found
it. Anything noticed that **no case found** is recorded here and left alone.

## Why this file exists

The run's fix policy is "fix everything before advancing". Without a fence, that
becomes "refactor whatever I notice", which is the main way a long run wanders
off and stops producing coverage. A defect spotted in passing is real work — it
is just not *this* run's work, and the run is not the right instrument for
deciding that.

Recording it costs one line. Chasing it costs a cycle.

## Rules

- One line per item, with **evidence** — the same standard as a `no` verdict.
  "Looks wrong" is not an entry.
- **Do not fix it.** If it turns out to block a case later, the case will find it
  and it becomes an ordinary in-scope defect with a row in the main table.
- Reviewed at each **deploy milestone**, where each item is either promoted to a
  new gap case (so a future run tests it properly) or left standing with a reason.
- Phase 1 sends product defects here too. Phase 1 changes **cases**, not features.

## Items

| Found during | What | Evidence | Disposition |
|---|---|---|---|
| Phase 0 | `TempPass123!` and `admin@letitrip.in` are committed in `README.md` and four `scripts/seed-*.mjs`, one in a `console.log`. If production Auth still has that account with that password, that is a live credential in version control | `scripts/seed-admin-only.mjs:206`, `scripts/seed-test-users.mjs:74`, `scripts/create-test-auth-users.mjs:45`, `scripts/test-storage-flow.mjs:78`, `README.md` ×3 | **Raised to the user.** Not a test finding; needs a decision about rotating the seeded password, which would also change `tester/.env` |
| Phase 0 | `TesterChecklistItemUpdateInput` omits every six-part field (`roles`, `startPage`, `steps`, `inputs`, `expectedBehaviour`, `expectedUiState`, `expectedData`, `endResult`), so the admin catalogue editor cannot edit a case's procedure — seed is the only authoring path | `appkit/src/features/tester/schemas/firestore.ts` | Left standing. Seed-only authoring is arguably correct; the editor should say so rather than silently accept a no-op |
| Phase 0 | `GET /api/user/tester-checklist` gates `adminOnly` on `isEffectiveAdminUser(profile)` and never reads `profile.canTestAdmin`, though the schema comment says `adminOnly` means "isTester && canTestAdmin (or real admins)" | `src/app/api/user/tester-checklist/route.ts` | Left standing. Only the "(or real admins)" half is implemented, which is why admin batches browse as the real admin |
| Phase 1 · `buying/image-tile-layout` | **`ConcernCard` and `ConcernGrid` are dead code.** `ConcernCard` is rendered only by `ConcernGrid`; `ConcernGrid` has no consumer anywhere in `src/` or `appkit/src/`. Both are exported from appkit's public `index.ts`, which is why a grep of the barrel makes them look alive | `appkit/src/features/categories/components/ConcernCard.tsx`, `ConcernGrid.tsx`, exported at `appkit/src/index.ts:4644,4647` | Not chased — Phase 1 changes cases, not features. The **case** was the actionable half and is deleted: it pointed at `/categories` (and `/` via its overlay) and the component renders on neither, so it could only ever be answered "could not test". Note Root Cause #68 discusses `ConcernCard` as a live surface, so this went dead after that was written. Either mount it or delete it — a public export with no consumer is the shape `feedback_no_speculative_infra` warns about |
