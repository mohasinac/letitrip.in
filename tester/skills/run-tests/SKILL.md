---
name: run-tests
description: Work a batch of LetItRip tester-checklist cases against the live site with a real browser, and record a yes/no/null verdict with evidence for each. Use when asked to run the tester checklist, test a page, or produce a tester report.
allowed-tools:
  - mcp__plugin_tester_playwright__*
  - Bash(node tester/scripts/*)
  - Read
  - Write
---

# Working the tester checklist

You are the tester. A batch file gives you a list of cases for **one page** of the
checklist. For each case you navigate the real site, do what the case describes, and
record a verdict.

## The batch

```
node tester/scripts/next-batch.mjs --run <runId>
node tester/scripts/fetch-cases.mjs --run <runId> --page <groupKey>/<pageKey> --out <file>
```

`fetch-cases` also writes the run's `scope.json`, which is what
`record-verdicts --finish` gates on. Pass `--run` explicitly: it defaults to
`run-${Date.now()}`, so omitting it mints a fresh run directory every call and a
second page will not accumulate into the same scope.

If `next-batch` reports `[has fixtures]`, seed them before you start — and tear
them down when the batch is recorded, pass or fail. A retry that inherits
half-mutated state tests something nobody described:

```
node tester/scripts/seed-batch-fixtures.mjs --batch <groupKey>/<pageKey>
node tester/scripts/seed-batch-fixtures.mjs --batch <groupKey>/<pageKey> --teardown
```

🛑 **There is no runner.** `run.mjs`, `pool.mjs` and `sweep.mjs` were deleted on
2026-09-14: each spawned a headless Claude session per batch, and the Stop hook
re-issued the command every turn, so the loop re-created itself — roughly 300
sessions in a day. You work the batch yourself, here, in this session. Nothing
under `tester/scripts/` may spawn the `claude` binary again.

A case carries a **six-part procedure**. It was written by hand, against the source,
by someone who had read the code — it is a specification, not a hint.

```
{ id, label, description?, href?,
  roles?, startPage?, steps?, inputs?,
  expectedBehaviour?, expectedUiState?, expectedData?, endResult? }
```

### What you do

- **`steps` is the procedure. Follow it in order, one action at a time, in the UI.**
  Not a summary, not a suggestion. Do not merge two steps and do not invent a
  shortcut — the steps exist because two testers otherwise invent two different
  procedures and their results cannot be compared. If a step cannot be performed,
  that is the reason for a `null`: say **which step number** and why.
- **`inputs` are the literal values. Type them verbatim.** If `inputs.bidAmount` is
  `15000`, bid 15000 — not 15,001, not "something above the minimum". The field is
  machine-readable precisely so two runs produce diffable results; substituting a
  value silently destroys that.
- **`startPage` is where you begin.** Unprefixed (`/products`, not `/en/products`).
  It is *more specific* than `href`, which falls back to the page default — prefer
  `startPage` whenever both are present.
- **`roles`** says whose point of view the case is written from, and **the harness
  has already put you in it.** A batch browses as exactly one identity: the bot, a
  real admin, or **signed out**. You do not sign in or out yourself — and a case
  whose steps begin "Sign in as …" means the harness has already done so.
  - 🛑 **Running a batch INTERACTIVELY? Verify the identity on the first page, and
    close the browser before changing it.** The identity is selected by copying a
    session file over `tester/.tester-runs/session.json`, and the MCP server reads
    that file **when the browser context is created** — copying it over an already
    open browser changes nothing. `run.mjs` never hits this because the pool closes
    the browser between batches; `/tester:run-tests` in a live session does not.
    On 2026-09-13 this put an admin session on a `roles: ["buyer"]` page whose very
    next step was "edit your display name and bio" — one click from modifying a
    PRESERVE-tier account, which rule 5 forbids outright. Read the account name off
    the page before you touch anything, and `browser_close` after any swap.
  - A batch of `roles: ["guest"]` cases runs with **no session at all**. That is
    deliberate: you are the signed-out visitor the case describes. Do not try to
    sign in to "get further" — being blocked *is* frequently the expected result.
  - If the identity you observe genuinely contradicts the case's `roles` — you are
    signed in on a guest case, or signed out on a buyer one — that is a `null` with
    the reason. Do not half-test it, and do not work around it.

### What you judge against

- **`expectedBehaviour` and `expectedUiState` are checked SEPARATELY, and both must
  hold for a `yes`.** They are two fields because the gap between them is a real bug
  class: the write succeeds and the screen never updates, or the screen updates and
  nothing was written. If one holds and the other does not, the answer is `no` and
  your comment must say **which one failed**.
- **`endResult` is checked after a RELOAD.** Perform the steps, reload the page, and
  confirm it still holds. Record `evidence.reloadChecked: true` (or `false` if you
  did not get to it). This is the only oracle that catches the most common defect in
  this codebase — a save that returns success and writes nothing.
- **`expectedData` is compared key by key.** Read the actual value for each key off
  the screen and record it as `evidence.dataObserved` using the same keys. **Any key
  whose observed value differs makes the case a `no`**, however plausible the page
  looked. A screen that looks right with a wrong number is the failure this catches.
- **`label` is the claim** the whole case exists to settle.
- **`description`** is context. **When `steps` is present the procedure wins** — the
  description is historical and may predate it. On an older case with no steps it is
  the spec, usually `BEFORE: … AFTER: …`, and you test the **AFTER**.

- **`needsReview` / `reviewNote`** mean the case's own author was unsure about it —
  usually because the intended behaviour is not settled. Test it anyway, and if what
  you observe bears on the doubt the `reviewNote` names, say so in your comment. The
  report flags these separately so nobody reads such a verdict with more confidence
  than it deserves.

- **`requiresHumanChannel` / `humanChannelReason`** mean the case needs something this
  browser has not got — a real email inbox, or an interactive Google account. Answer
  **`null`** and say which channel was missing. Do **not** spend turns trying: there is
  no inbox to open and no Google credential to type, and a `yes` here would be
  fabricated coverage on a case nobody can automate. Go as far as the UI allows, note
  what you *could* confirm (the button exists, the "check your email" message appears),
  then abstain. These are reported under their own heading and subtracted from the
  blocked count, so abstaining costs nothing and guessing costs a false green.

A case with no `steps` is an older one-liner: work out the procedure yourself, and say
in your comment what you actually did, so the next person can repeat it.

**Cases within a batch may depend on state an earlier case left behind** — read each
case's `endResult` and you will see where. Work them in the order given. If a case's
precondition was already consumed by an earlier one, that is a `null` with the reason,
not a `no`.

## Verdicts

Exactly three values. Write them to the verdict file with `record-verdicts.mjs`.

| Verdict | Means | Requires |
|---|---|---|
| `yes` | You performed the check and the AFTER holds | — |
| `no` | You performed the check and the AFTER does **not** hold | **evidence** (see below) |
| `null` | You could **not** perform the check | a comment saying why |

**`null` is a first-class answer and you should use it freely.** A case needing a real
email inbox, real Razorpay/Meta credentials, a fixture that does not exist, or a
mutation you are not permitted to make is *not testable* — say so. A human tester will
pick it up.

> **Guessing is worse than abstaining.** A fabricated `yes` is a false green on a case
> a human would otherwise have run, and nobody will ever look at it again. If you did
> not actually observe the thing, the answer is `null`, not `yes`.

## Screenshot EVERY case — pass and fail alike

Take a screenshot at the moment of judgement for **every** verdict, `yes` included,
and put its path in `evidence.screenshot`. `record-verdicts.mjs` enforces this.

Screenshotting only failures is a trap: a `yes` with no image is unfalsifiable, and it
is exactly where a fabricated pass hides. Two of this run's near-misses — `/faqs`
appearing empty, the homepage appearing to have no `h1` — were caught *because
somebody looked at the picture*. The image is also what lets a human confirm your
verdict later without re-running anything.

Name them for the case: `.tester-runs/<runId>/shots/<case-key>-<pass|fail>.png`.

**Then actually look at it.** Do not screenshot and move on. Read the image and say in
your comment what it shows — the number on the badge, the text of the error, which
button is missing. A screenshot you did not read is decoration.

## Evidence is mandatory for every `no`

Beyond the screenshot, a `no` must carry at least one of:

- the exact rendered text you saw (quote it),
- an HTTP status and the URL that produced it,
- a console error or failed request from the browser log.

"It looked wrong" is not evidence. A verdict nobody can trace is worth nothing — it
cannot be confirmed, cannot be fixed, and cannot be distinguished from a mistake.

### For a failure, go one step further and find out WHY

Having seen it break as a user, then look at the console and the network panel and
report the cause alongside the symptom. A developer can act on *"the page shows 0
questions although the sidebar counts 14 matches, and /api/faqs returns all 62 rows
for every term, so the filtering is client-side"* — they cannot act on *"search is
broken"*. The symptom is what you saw; the cause is what you found afterwards. Give
both, in that order, and never let the cause replace the symptom.

## 🛑 Rule zero — you are a USER, not an API client

**Drive the UI. Type into the real inputs, click the real buttons, read the rendered
page.** You are testing what a human experiences, and a human never sees a JSON
response.

An API call is not a substitute, because it skips everything that actually breaks:
the form that never submits, the button wired to nothing, the value that saves and
renders as blank, the error the server returned and the page swallowed. Nearly every
bug in this codebase returns **HTTP 200** — a green API response is the least
informative thing you can look at.

So:

| Do | Not |
|---|---|
| Fill the search box and read the rendered results | `GET /api/products?q=…` |
| Click Place Bid and read what appears | POST the bid endpoint |
| Change a field, click Save, **reload**, look | PATCH and re-GET |

**When may you look at the network or an API?** Only to *explain* a failure you have
already seen in the UI. Sequence matters: observe the broken thing as a user first,
then open the network panel or console to say WHY. That ordering is the difference
between "the page shows 0 questions" (a finding) and "the endpoint ignores q" (its
cause) — the report wants both, in that order.

If a case genuinely cannot be reached through the UI, that is `null` with the reason,
not an API call standing in for it.

## How to test — six rules

**1. Never assert "the page loaded."**
A page that renders is not a page that works. Read the actual values on it.

**2. Where a case implies filtering, use a nonsense control — in the UI.**
Real term into the search box → results. Then `zzzznope` into the same box → the page
must show an empty state. Only the second one distinguishes "filtering" from
"returning everything". Same for tabs, chips and facets: confirm the visible result
set *changes*, not merely that rows appear.

**3. Wait for the page before judging it.**
This app hydrates client-side and the difference is not subtle. `/faqs` shows zero
questions at 2.5s and 62 at 6s; the homepage has no `h1` at 2.5s and exactly one at
3s. Judging early produces a confident, wrong `no` — this has already happened twice.
Wait for the content you are about to assert on, and if a page looks empty, wait
again before believing it.

**4. A save is not saved until you reload.**
Several of the worst bugs here returned a perfectly normal 200 and wrote nothing. For
any case about editing or saving: change it, save, **reload the page**, and confirm the
value survived. Reloading is the only oracle.

**5. Mutate the catalog freely — real accounts are not yours to touch.**
The catalog is wiped and re-seeded around every run, so buying, bidding, editing
listings and cancelling orders are all fair game. But **never** delete or modify a user
account, a login, a saved address, or Site Settings — those survive the run by design,
so damage there is the only permanent damage you can do.

**6. Never call `/api/auth/login`, `/api/auth/session` or `/api/auth/me`.**
They share one 10-requests-per-minute bucket keyed on IP. The harness has already
signed you in; a stray call burns the budget the rest of the run needs.

## Email cases — you CAN answer these now

Cases about email used to be `requiresHumanChannel` and were answered `null`
forever. They are ordinary cases now:

```bash
# 1. capture the timestamp BEFORE the action under test
node -e "console.log(Date.now())"

# 2. do the thing in the browser (register, place an order, save a setting…)

# 3. ask the mailbox
node tester/scripts/check-inbox.mjs --since <thatNumber> --subject "verify"
```

**`--since` is required and it is the whole correctness argument.** The mailbox
is shared across every case in every run, so "newest matching message" will
happily return one an earlier case left behind — which reads as a pass for an
email your action never sent. Capture the timestamp first, always.

**For a case that asserts NO email should arrive** — a kill switch honoured, an
opt-out respected, losing bidders left alone — add `--expect-none`. It waits the
full window and succeeds only on silence. Without it, "nothing arrived" is
unprovable: you wait and hope, and a slow inbox looks exactly like a working
suppression.

Read the exit code, and keep the three apart:

| exit | means | your verdict |
|---|---|---|
| 0 | the expectation held | `yes` |
| 1 | message missing (or present when `--expect-none`) | `no` — quote the output |
| 2 | **could not check** — no credentials, IMAP unreachable | `null` — say which |

🛑 **Exit 1 and exit 2 are not the same answer.** "The email did not arrive" is a
product defect; "I could not open the mailbox" is a harness problem. Collapsing
them reports a broken inbox as a broken feature.

## Calibration controls

Two cases in every batch have ids starting `control-`. They are not real checklist
cases — the harness knows their answers and uses them to check that you are actually
testing rather than pattern-matching. Answer them exactly as you would any other case.

They carry the same six-part procedure as every other case, and they are answered the
same way. Do not try to work out which is which — the answer to that question is not
knowable from the batch, and a batch that gets either control wrong has **all** its
verdicts held back, not just the control's.

If you find yourself about to mark a control the "obviously expected" way without
having looked, that is the signal this whole mechanism exists to catch. Look.

## Recording

```
node tester/scripts/record-verdicts.mjs --run <runId> --batch <batchFile> --verdicts <jsonFile>
```

Verdict file shape:

```json
[
  { "id": "checklist-buying-cart-remove-all-confirmation",
    "answer": "no",
    "comment": "Clicking Remove all deleted every line immediately. No dialog appeared.",
    "evidence": {
      "screenshot": "tester/.tester-runs/<runId>/shots/cart-remove-all-fail.png",
      "observed": "cart went from 3 items to 0 with no confirmation",
      "failedAtStep": 4,
      "reloadChecked": true,
      "dataObserved": { "cartLineCount": 0, "cartTotal": 0 }
    } }
]
```

Evidence fields, and when each is required:

| Field | Required when |
|---|---|
| `screenshot` | **every** answered verdict — `yes` and `no` alike. The path must exist on disk; the harness checks. |
| `observed` / `status` / `consoleError` | on a `no` — at least one |
| `failedAtStep` | on a `no`, when the case has `steps`. 1-based. Makes the failure reproducible in one line |
| `reloadChecked` | on any answered verdict whose case has `endResult`. Either value is fine — `false` is honest and is counted; omitting it is not |
| `dataObserved` | on a `no` whose case has `expectedData`. Same keys as `expectedData`. Record it on a `yes` too — the report counts how many passes were actually verified against their data, and an unverified pass is where the next false green will be |

Keep `comment` short and factual — it goes straight into the report a developer reads.
Say what you observed, not what you think caused it.
