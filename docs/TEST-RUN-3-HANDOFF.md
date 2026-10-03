# Test Run 3 — handoff at batch 204

## State (all computed from disk, nothing hand-typed)

    204/255 batches · 1069/1847 cases · 51 outstanding
    pass 397 · fail 186 · null 486
    lastDeployAtRecorded 200   (verified: smoke test green)
    lastFixAtRecorded    203   (verified: fix re-driven in production)

Working tree clean. Next batch: `admin/site-system--p3` — **not claimed**,
cases already fetched to
`tester/.tester-runs/run-3/batches/admin__site-system--p3.json`.

## Start here — the cheapest high-value work

### 1. `/api/faqs` missing index — same class fixed today, known remedy

**33 recorded occurrences** of `9 FAILED_PRECONDITION: The query requires an
index`, visible on `/admin/maintenance/server-errors`. Remedy is exactly what
worked for the seller sorts this session:

1. Reproduce the FAQ query against Firestore **with a control** (a query that
   should succeed) — that is what pins the cause instead of guessing.
2. Read the required index out of the thrown error.
3. Add to `appkit/firebase/base/firestore.indexes.json`.
4. `npm run firebase -- generate` → `deploy --only indexes` → `wait-for-indexes.mjs`.
5. Re-drive. A fix nobody re-tested is a hypothesis.

### 2. React #418 — now operational, not cosmetic, and still unowned

981 of 1606 `serverErrors` rows are `CLIENT_WINDOW_ERROR` hydration mismatches
(**61%**). They crowd the recent window, so a `limit(12)` query returns only
hydration noise and real 500s look unrecorded — which is exactly the mistake I
made and corrected this session.

Recorded on: `/admin/{ads,contact,media,site,blog,events/new,offers,stores,
notifications,analytics}`, `/admin/stores/{slug}/view`,
`/brands/brand-independent-keepers`, and a public category page.

**No case owns this. Write one.** Consider whether client errors belong in the
same collection as server errors, or need separate retention.

### 3. Then work the triage index in `docs/TEST-RUN-3-FIXPHASE.md`

Ranked by blast radius — money/data integrity first, cosmetic last. 129
`fixQueue` entries vs 113 open defects is past what one phase absorbs, so
ranking matters more than draining in discovery order.

## Standing constraints — do not relax these

- **Never save Site Settings.** PRESERVE tier, one "Save all changes" over a
  37-group singleton, 21 live API keys behind it. Refused all run. Baseline for
  whoever does it with a human present: `docs/TEST-RUN-3-SITESETTINGS-BASELINE.json`.
- **Never call** `/api/auth/login|session|me` — one 10-req/min IP bucket.
- **Never modify** a user account, login, saved address, or Site Settings.
- A claimed batch **restarts from case 1** (G1). Never resume mid-batch.

## Two traps that cost me time — don't repeat them

- **Print the match context before filing a credential leak.** Twice a broad
  regex matched i18n LABELS (`"metaPageAccessToken":"Meta Page Access Token"`),
  not values. Both would have been false security findings.
- **Bash cwd persists between calls.** A `cd` into the appkit submodule silently
  broke a later root `git add` (and an `echo` printed success over the failure).
  Use absolute paths.
- **Include `\.` when scanning for float artifacts.** Without it
  `227453.66999999998` reads as two separate implausible integers.
