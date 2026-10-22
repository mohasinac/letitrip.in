# tester

A Claude Code **plugin** that drives the LetItRip tester checklist (943 cases) with a
real browser and records a verdict per case.

Playwright drives; Claude judges. The checklist cases have no machine-readable oracle —
the expected outcome exists only as English, usually `BEFORE: … AFTER: …` — so the
thing doing the judging has to be able to read that.

## Layout

```
.claude-plugin/plugin.json   the manifest (only this file lives in here)
.mcp.json                    Playwright MCP, pinned, from node_modules
skills/run-tests/SKILL.md    the judgment contract → /tester:run-tests
scripts/
  lifecycle.mjs              backup → wipe → seed → (test) → wipe
  fetch-cases.mjs            checklist → per-page batch files
  record-verdicts.mjs        validate → Markdown → --publish
  run.mjs                    the harness: one headless Claude per batch
  lib/collections.mjs        🛑 the tier boundary
  lib/firestore.mjs          admin connection + host guard
  lib/controls.mjs           calibration controls
```

## 🛑 What a run destroys

It wipes the **seeded catalog** from a live project and re-seeds it. Three tiers,
declared in `scripts/lib/collections.mjs`:

- **PRESERVE** — `users` (Firestore **and** Firebase Auth), `addresses`, `sessions`,
  `siteSettings`. Never touched. Real accounts, logins, saved addresses and the
  encrypted live API keys all survive.
- **SEED_OWNED** — the catalog. Wiped and re-seeded.
- **CASCADE** — `carts`, `orders`, `bids`, `offers`, `payouts`, `eventEntries`,
  `couponUsage`, `notifications`, plus item-level pruning in `wishlists` / `history`.
  Deleted **only where a row references** something being wiped.

A collection that is not classified is **preserved**, not swept — `assertDeletable()`
throws on anything unlisted. `scripts/audit-tester-plugin-wiring.mjs` in the parent
repo then makes the omission visible.

`appkit/scripts/firebase-reset.mjs` must never be used here: it deletes every Auth
user. There is deliberately no `--full-reset` flag.

## Setup

```bash
# 1. One-time: create the bot + employee accounts. `users` is PRESERVED, so a run
#    never seeds them and login fails until this has been done once.
npx appkit-seed load --collections users

# 2. One-time: register the plugin so interactive sessions get /tester:run-tests
claude plugin marketplace add ./
claude plugin install tester@letitrip-tools

# 3. In .env.local — required, no default, must equal FIREBASE_ADMIN_PROJECT_ID
TESTER_TARGET_PROJECT=<project-id>
```

## Use

```bash
npm run tester:plan                                   # dry run, writes nothing
npm run tester:setup -- --yes-i-am <projectId> --window 90
npm run tester:claude                                 # 88 batches, resumable
node tester/scripts/record-verdicts.mjs --run <id> --publish
npm run tester:teardown -- --yes-i-am <projectId>
```

Interactively: `/tester:run-tests <groupKey>/<pageKey>` — the same skill the harness
invokes, so the contract cannot drift between the two.

**Publish before teardown.** Verdicts live in `testerChecklistResponses`, which the
teardown wipe deletes.

## Verdicts

`yes` / `no` / `null`. `null` means *could not test* and is a first-class answer —
guessing is worse than abstaining, because a fabricated `yes` is a false green on a
case a human would otherwise have run. Every `no` must cite evidence;
`record-verdicts.mjs` rejects one without.

Each batch carries two calibration controls whose answers the harness knows and the
tester is not told. A batch that gets either wrong has **all** its verdicts
quarantined — a tester that mis-answered a control has not shown it was testing.

## Gotchas, all verified rather than assumed

- The MCP server registers as **`plugin:tester:playwright`**, not `playwright`.
- `--setting-sources user` is what stops the parent repo's Stop hook (the full audit
  suite, 180s) firing on every turn. It also drops project skills, which is why the
  tester is a plugin supplied via `--plugin-dir`.
- At Claude Code 2.1.34 there is no `--bare`, no `--max-turns`, no
  `--permission-prompts`, and `--permission-mode` does not accept `auto`.
- An invalid MCP config is skipped **silently** and the run still exits 0, so
  `run.mjs` gates on `mcp_server_errors` in the `system/init` event, not the exit code.
- Use the **www** host and **unprefixed** paths: the apex 308s, and `/en/x` 307s to `/x`.
