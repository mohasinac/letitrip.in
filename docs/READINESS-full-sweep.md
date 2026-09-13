# Readiness for a full-catalogue sweep

Measured 2026-09-13 against live Firestore (1,188 cases, 35 phases). Everything
below is a measurement, not an estimate — and two of the measurements were wrong
first time, which is recorded because the correction is the useful part.

---

## Shipped this session (verified, not assumed)

> **Status 2026-09-13: committed AND deployed.** `npm run check` exit 0; indexes
> deployed and settled (27,852 READY, 0 CREATING); app deployed via
> `scripts/deploy.mjs` with its smoke test, SEO check and canonical check green.
> `/user/tester` now returns **200** with `X-Matched-Path: /en/user/tester`.
> Commits: appkit `0f0d8145`, tester `107f65b`, root `7f7a37032`.
>
> 🛑 **The seed flags are NOT live yet.** `requiresHumanChannel` and `needsReview`
> exist in appkit *source* only. `npx appkit-seed` runs from
> `node_modules/@mohasinac/appkit` (npm-pinned `^4.35.4`), so a reseed today
> writes the OLD shape. **Publish appkit before reseeding**, or the flags reach
> Firestore as `undefined` and the run reports the same misleading blocked count.

| | Root cause | How it was confirmed |
|---|---|---|
| `/user/tester` 404 | `.vercelignore` carried an **unanchored** `tester`. Gitignore semantics match at any depth, so it stripped `src/app/[locale]/user/tester/` from the Vercel upload — the route never existed in the build. Fixed to `/tester`. | `X-Matched-Path: /404` vs `/en/user/profile` + `X-Nextjs-Prerender: 1`; scratch-repo test proved `tester` excludes both paths and `/tester` only the submodule |
| admin blog list `FAILED_PRECONDITION` | Missing `blogPosts (isFeatured ASC, createdAt DESC)`. **Not** the list query in the URL — the *featured count probe*. `Promise.all` makes one rejection blank the whole list, which is why the page said "No blog posts found" while 19 posts existed. | Ran all five queries the route fires; four OK, that one returned the index-creation URL naming exactly those fields |
| `GET /api/admin/faqs/[id]` 404 | Two defects hidden by one `as any`: `create({id})` mints an auto-ID and writes `id` as *data* (so the POST response echoed the right slug while the doc lived elsewhere), and `"seo.slug"` as a create key is a **literal field name containing a dot** — dot paths are interpreted by `update()` only. | Raw doc `IfFYhCwFHsN1TmTyBjgk`: literal `"seo.slug"` present, nested `seo` null, stray `id` field. Seeded doc has the inverse |
| Inert cases batched as real ones | `fetch-cases.mjs` now drops cases with **nothing to assert**, not merely "no steps" — excluding all stepless cases would silence the staleness oracle beside it. | Watched it fire: skipped `demo-fixture-v2`, coverage read 4/4 rather than a misleading 4/5 |
| `requiresHumanChannel` | New flag wired schema → `AuthoredCase` → `CaseInput` → `group()` → `fetch-cases` → SKILL.md → report. 12 cases annotated (6 inbox, 6 Google). Report subtracts them from `blocked` so that number can reach zero. | appkit + consumer `tsc` both exit 0 |
| **`needsReview` had never once fired** | Found while wiring the above. `fetch-cases` reads it, SKILL.md documents it, `record-verdicts.mjs:608` renders it — but `group()` never forwarded it **and** `TesterChecklistItemDocument` never declared it. Six hops, two broken, no error anywhere. Root Cause #38. | `tsc` rejected the field, which is what exposed it |

---

## 🛑 Two measurements I got wrong, and why

**Fixture citations: first answer 57, real answer 11.** The first regex matched any
hyphenated word starting with a known slug prefix, and duly "found" missing fixtures
called `live-item`, `order-confirmed`, `brand-new`, `user-facing`, `store-count`.
Those are ordinary English in the prose. The fix is an **id-shape guard** (a real
fixture id has ≥3 dash-separated segments) plus **known-good controls** asserted
before any output is trusted. One control (`user-tester-qa`) reported `cited=false`
— that is a bad control, not a bad rule: the catalogue names testers by email.

**Human-channel candidates: 38 found, at most 27 eligible.** Six of them assert an
*absence* of email and are fully testable without an inbox. Flagging those would
convert real tests into documented non-tests — the exact misuse the schema comment
forbids. **Do not bulk-annotate this list.**

---

## Remaining work, in dependency order

### 1. Human channel — 27 candidates needing per-case judgement

Do **not** codemod. Read each and ask "could a headless browser settle this by
observing an absence, a bell row, or a server-side record?" If yes, it is not a
human-channel case.

**Definitely NOT eligible** (assert an absence — leave them testable):

```
checklist-admin-site-system-messaging-kill-switch-spares-staff
checklist-admin-site-system-messaging-kill-switch-suppresses-user-mail
checklist-admin-site-system-scam-report-no-employee-blast
checklist-admin-site-system-site-settings-save-sends-no-email
checklist-community-support-support-tickets-ticket-reply-no-email-by-default
checklist-content-discovery-notifications-notification-losing-bidder-no-email
```

**Likely eligible** — each still needs reading:

```
[inbox]  account-auth/profile-settings   password-change-reset-link
[inbox]  admin/site-system               daily-digest-email-content
[inbox]  buying/my-orders                order-lifecycle-emails-arrive
[inbox]  buying/offers                   notification-email-is-a-real-email
[inbox]  buying/offers                   notification-optout-is-honoured-for-emi-and-payment
[inbox]  community-support/…             ticket-created-reaches-staff
[inbox]  community-support/…             ticket-reply-user-cannot-force-email
[inbox]  content-discovery/notifications notification-email-actually-arrives
[inbox]  content-discovery/notifications notification-email-opt-out-respected
[inbox]  content-discovery/notifications notification-ineligible-types-bell-only
[inbox]  content-discovery/notifications notification-type-sample
[inbox]  public-pages/auth-error-pages   forgot-reset-password-pages
[inbox]  public-pages/auth-error-pages   verify-email-page
[inbox]  selling/seller-orders           seller-new-order-notification-reaches-seller
[google] public-pages/auth-error-pages   auth-close-terminates-popup
[google] public-pages/auth-error-pages   oauth-loading-redirect
[sms]    buying/buying-checkout          checkout-otp-whatsapp-option
[sms]    buying/buying-checkout          checkout-otp-whatsapp-hidden-without-phone
```

`checklist-buying-browsing-search-homepage-prize-draws-section` matched on
"real payment" and is almost certainly a false positive.

### 2. Fixture gaps — 11 citations, ~6 genuine

Genuine, worth seeding:

```
offer-tester-sandbox-accepted        offers
offer-tester-sandbox-expiring        offers
offer-tester-sandbox-inbound         offers
group-tester-sandbox-bundle          groupedListings
scammer-fake-metal-fusion-preorder-agent   scammers
section-brand-beyblade / section-brand-takara-tomy   homepageSections (verify first)
```

Still prose, ignore: `order-of-magnitude`, `user-not-found`,
`classified-offer-is-the-purchase-path`, `offer-to-purchase-buyer-makes-offer`
(the last two are case-key fragments).

### 3. Rig fix 3 — `testerChecklistResponses` fixture

Three `admin/bug-hunter-rewards` cases need one existing tester submission.
The collection is **DERIVED** (wiped at setup). The correct shape is to keep it in
`DERIVED` *and* add it to **`SEED_TRANSACTIONAL`**, which is a restore list
orthogonal to the delete tiers — so stale verdicts are still wiped but the demo
fixtures come back. Doc id is deterministic: `${testerId}__${checklistItemId}`.
Needs a `no` answer credited to `user-tester-qa` ("Mock User 18") against
`checklist-admin-bug-hunter-rewards-demo-fixture`.

Per Root Cause #90 this is several edits, not one: seed file → `COLLECTION_MAP` →
the DATA map → `manifest.ts` → tier classification, and `audit-tester-plugin-wiring`
R1 will fail until the tier is declared.

### 4. Rig fix 4 — per-batch short-lived auction for `money-flows`

`money-flows/auction-win-to-payment` must watch an auction close, while 46 other
citations need `auction-tester-sandbox-cycle-1` **live**. One fixture, two
contradictory requirements. Fix is a per-batch manifest minting an auction ~2 min
out. Use `windowOffset()` from `tester-window.ts`, never a literal duration
(`audit-tester-plugin-wiring` R4 blocks it).

### 5. Ship

One appkit publish covers rig fixes 2–4 (seed data ships in the published dist;
`npx appkit-seed` runs from `node_modules`). Then:

```
claude plugin uninstall tester && claude plugin install tester@letitrip-tools
npm run check
npm run firebase -- generate && npm run firebase -- deploy --only indexes
node scripts/wait-for-indexes.mjs
node scripts/deploy.mjs
npx appkit-seed load --collections testerChecklistItems
```

🛑 The plugin cache **wins over `--plugin-dir`** — `run.mjs`'s freshness preflight
will refuse to start until the cache is refreshed (Root Cause #28's shape).

🛑 `appkit/firebase/base/` is **not** in the published tarball, and
`scripts/firebase.mjs` invokes `appkit/scripts/firebase-merge.mjs` by repo-relative
path — so the blogPosts index fix works from the local submodule with no publish.

---

## Open, not fixed

**`disabledRoutes` is absent from the public site-settings payload.** `src/proxy.ts`
reads `body.data.disabledRoutes` to 404 admin-disabled routes; the projection does
not emit it, so the gate is a silent no-op — the same capability Root Cause #82
already resurrected once, dead again by a different mechanism. It fails open, so
nothing is broken today; the admin feature simply does not work.
