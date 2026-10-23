#!/usr/bin/env node
/**
 * The posting rules, exercised against the real implementation.
 *
 * ## 🛑 An AUDIT, not a `*.test.ts`
 *
 * Unit tests are prohibited here and the reason is Root Cause #83: a mock is
 * a second implementation, and the one you assert against is always the one
 * you *believed in*. `/admin/team`'s test mocked `buildSieveFilters` as the
 * CORRECT behaviour while the real helper concatenated, so a live bug that
 * emptied the admin team list passed its test for as long as it existed.
 *
 * This file mocks nothing. It imports `assertBalanced` and `buildReversal`
 * from the shipped source and feeds them real shapes — the same stance
 * `verify-shipment-allocation-guard.mjs` takes, and for the same reason: a
 * wrong posting rule is caught just as well, with no exception to the
 * standing prohibition.
 *
 * ## 🛑 Every positive case is paired with a NEGATIVE CONTROL
 *
 * A guard that answers "fine" to everything passes every positive test ever
 * written. Root Cause #92's first `audit-trigger-self-write` matched a
 * variable merely NAMED `totalsUnchanged` while it was assigned `false`;
 * Root Cause #87's observability audit reported OK for precisely the state
 * it existed to catch. So each rule below is also fed an input that MUST be
 * refused, and the run fails if the refusal does not happen.
 *
 * ## 🛑 It imports the REAL `posting.ts`, via Node's own type stripping
 *
 * `node --experimental-strip-types` (22.6+; this repo is on 22.17) runs the
 * TypeScript source directly, so this audit executes the exact bytes the
 * application ships. No `appkit/dist` — comparing against a derived artefact
 * is the trap Root Cause #105 is about, where `audit-appkit-dist-sync`
 * reported "byte-identical" about two copies that were both two merges stale.
 *
 * The first draft transpiled the file in-memory with a regex. That was the
 * same mistake one level out: a hand-rolled stripper is a SECOND
 * IMPLEMENTATION of the compiler, and a test that asserts against one is
 * asserting against what its author believed (Root Cause #83). It also did
 * not work — `Unexpected token ')'` on the first run, which at least failed
 * loudly rather than quietly mis-parsing a rule into always-passing.
 *
 * The re-exec below is because the flag must be on the process that does the
 * importing, and the audit dispatcher invokes this file plainly.
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(HERE), "..");
const SRC = resolve(ROOT, "appkit/src/_internal/shared/features/ledger/posting.ts");

if (!process.env.POSTING_RULES_CHILD) {
  const r = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", HERE],
    { stdio: "inherit", env: { ...process.env, POSTING_RULES_CHILD: "1" } },
  );
  process.exit(r.status ?? 1);
}

const failures = [];
const fail = (rule, msg) => failures.push(`${rule}  ${msg}`);

let posting;
try {
  posting = await import(`file://${SRC.split("\\").join("/")}`);
} catch (err) {
  /*
   * 🛑 A LOAD FAILURE IS A FAILURE, never a skip. An audit that cannot read
   * its subject and exits 0 is the silent-zero shape — it reports the same
   * "clean" as one that read everything and approved it.
   */
  console.error(`[verify-posting-rules] could not load the posting rules: ${err?.message ?? err}`);
  process.exit(1);
}

const { assertBalanced, buildReversal, resolvePostingPeriod } = posting;

const line = (accountCode, debit, credit) => ({ accountCode, debit, credit });
const DATE = new Date(2026, 9, 15); // 15 Oct 2026, LOCAL — see periodOf.

function refuses(rule, what, input) {
  try {
    assertBalanced(input);
    fail(rule, `${what} was ACCEPTED. ${rule} does not hold.`);
  } catch (err) {
    if (err?.name !== "UnbalancedEntryError") {
      fail(rule, `${what} threw ${err?.name ?? "?"} rather than refusing cleanly: ${err?.message}`);
    }
  }
}

function accepts(rule, what, input) {
  try {
    return assertBalanced(input);
  } catch (err) {
    fail(rule, `${what} was REFUSED: ${err?.message}`);
    return null;
  }
}

/* ── R1  a balanced entry is accepted, and its totals are right ─────────── */
{
  const ok = accepts("R1", "a balanced two-leg entry", {
    entryDate: DATE,
    sourceEvent: "order-placed",
    sourceId: "order-1-20261015-aaaaaa",
    narration: "Sale",
    lines: [line("1100", 1180, 0), line("4100", 0, 1000), line("2200", 0, 180)],
  });
  if (ok) {
    if (Math.abs(ok.totalDebit - 1180) > 0.001 || Math.abs(ok.totalCredit - 1180) > 0.001) {
      fail("R1", `totals wrong: ${ok.totalDebit} / ${ok.totalCredit}, expected 1180 / 1180.`);
    }
    if (ok.period !== "2026-10") {
      fail("R1", `period "${ok.period}" for 15 Oct 2026, expected "2026-10".`);
    }
  }
}

/* ── R1b  the period is LOCAL, and this test can actually tell ──────────── */
{
  /*
   * 🛑 THE FIRST VERSION OF THIS CHECK WAS DECORATION.
   *
   * It asserted `periodOf(15 Oct) === "2026-10"`, which is true under a UTC
   * derivation as well — so flipping `getMonth()` to `getUTCMonth()` as a
   * negative control changed nothing and the audit still said OK. A check
   * that passes under both implementations tests neither (Root Cause #92:
   * "a check a variable name satisfies is decoration").
   *
   * A date can only discriminate if local and UTC fall in DIFFERENT months,
   * so it is built from the machine's own offset: the first instant of a
   * month, which for any timezone ahead of UTC is still the previous month
   * in UTC. That is exactly the real-world case — a 00:30 IST order on the
   * 1st belongs to the new GSTR-1 period and UTC would file it in the old.
   */
  const offsetMin = -new Date(2026, 10, 1).getTimezoneOffset(); // +330 in IST
  if (offsetMin === 0) {
    /*
     * 🛑 SAID OUT LOUD rather than skipped silently. On a UTC machine the
     * two derivations agree for every input, so this property is genuinely
     * unobservable here — and an audit that quietly drops a rule reports the
     * same "clean" as one that checked it.
     */
    console.warn(
      "[verify-posting-rules] R1b NOT CHECKED: this machine is on UTC, where local and UTC periods never differ. Run it on an IST machine (or in the bom1 region) to exercise it.",
    );
  } else {
    const justAfterMidnight = new Date(2026, 10, 1, 0, 30); // 1 Nov 00:30 local
    const got = assertBalanced({
      entryDate: justAfterMidnight,
      sourceEvent: "order-placed",
      narration: "Sale just after midnight",
      lines: [line("1100", 100, 0), line("4100", 0, 100)],
    }).period;
    const utc = `${justAfterMidnight.getUTCFullYear()}-${String(justAfterMidnight.getUTCMonth() + 1).padStart(2, "0")}`;
    if (got === utc) {
      fail(
        "R1b",
        `a 1 Nov 00:30 local sale was filed in "${got}" — the UTC month. Every such order lands in the PREVIOUS GSTR-1 period.`,
      );
    }
    if (got !== "2026-11") {
      fail("R1b", `expected "2026-11" for a 1 Nov 00:30 local sale, got "${got}".`);
    }
  }
}

/* ── R2  the float tolerance is real, in BOTH directions ────────────────── */
{
  /*
   * A three-way GST split of 100.00 at 18% produces legs that do not sum
   * exactly in binary. The entry is correct and must be accepted.
   */
  accepts("R2", "an entry whose legs differ by a float epsilon", {
    entryDate: DATE,
    sourceEvent: "order-placed",
    narration: "GST split",
    lines: [line("1100", 0.1 + 0.2, 0), line("4100", 0, 0.3)],
  });

  // CONTROL: a real 0.01 imbalance must still be refused. A tolerance
  // wide enough to swallow this is a tolerance that hides posting bugs.
  refuses("R2", "a 0.01 imbalance", {
    entryDate: DATE,
    sourceEvent: "order-placed",
    narration: "Off by a hundredth",
    lines: [line("1100", 100.01, 0), line("4100", 0, 100.0)],
  });
}

/* ── R3  the four per-line rules, each with its own control ─────────────── */
refuses("R3", "a single-legged entry", {
  entryDate: DATE,
  sourceEvent: "manual-journal",
  narration: "One leg",
  lines: [line("1100", 100, 0)],
});

refuses("R3", "a negative amount", {
  entryDate: DATE,
  sourceEvent: "manual-journal",
  narration: "Negated rather than swapped",
  lines: [line("1100", -100, 0), line("4100", -100, 0)],
});

refuses("R3", "a line carrying both a debit and a credit", {
  entryDate: DATE,
  sourceEvent: "manual-journal",
  narration: "Both sides",
  lines: [line("1100", 100, 40), line("4100", 0, 60)],
});

refuses("R3", "a zero line", {
  entryDate: DATE,
  sourceEvent: "manual-journal",
  narration: "Zero",
  lines: [line("1100", 100, 0), line("4100", 0, 100), line("5900", 0, 0)],
});

/* ── R4  a reversal SWAPS, and does not negate or back-date ─────────────── */
{
  const original = {
    id: "je-001",
    narration: "Sale",
    lines: [line("1100", 1180, 0), line("4100", 0, 1000), line("2200", 0, 180)],
  };
  const later = new Date(2026, 10, 3); // 3 Nov, a month after the original.
  const rev = buildReversal(original, later, "wrong account");

  for (const l of rev.lines) {
    if (l.debit < 0 || l.credit < 0) {
      fail("R4", `reversal line ${l.accountCode} is NEGATED, not swapped. A negated leg breaks the non-negative rule and a Tally export rejects it.`);
    }
  }
  const bank = rev.lines.find((l) => l.accountCode === "1100");
  if (!bank || bank.credit !== 1180 || bank.debit !== 0) {
    fail("R4", `the 1180 debit to 1100 did not become a 1180 credit (got debit ${bank?.debit}, credit ${bank?.credit}).`);
  }
  accepts("R4", "the reversal itself", { ...rev, narration: rev.narration });

  if (rev.entryDate.getTime() !== later.getTime()) {
    fail("R4", "the reversal was back-dated to the original. That silently reopens a period a GST return was filed from — the lock's whole purpose.");
  }
  if (rev.sourceEvent !== "reversal" || rev.sourceId !== "je-001") {
    fail("R4", `the reversal does not point at its original (sourceEvent "${rev.sourceEvent}", sourceId "${rev.sourceId}").`);
  }
}

/* ── R5  a locked period defers; it never silently re-dates ─────────────── */
{
  const locked = new Set(["2026-10"]);
  const isLocked = (p) => locked.has(p);

  const open = resolvePostingPeriod("2026-11", isLocked, "2026-11");
  if (open.period !== "2026-11" || open.deferred) {
    fail("R5", `an OPEN period was altered (got "${open.period}", deferred ${open.deferred}).`);
  }

  const late = resolvePostingPeriod("2026-10", isLocked, "2026-11");
  if (late.period !== "2026-11" || !late.deferred) {
    fail("R5", `a late correction did not defer to the open period (got "${late.period}", deferred ${late.deferred}).`);
  }
  if (!late.deferred) {
    fail("R5", "the deferral was not FLAGGED. A move nobody is told about makes the lock invisible, which is worse than no lock.");
  }

  // CONTROL: nowhere to post must throw rather than pick something.
  try {
    resolvePostingPeriod("2026-10", () => true, "2026-11");
    fail("R5", "both periods locked was ACCEPTED. It must refuse rather than choose a period for the caller.");
  } catch {
    /* expected */
  }
}

/* ── report ─────────────────────────────────────────────────────────────── */
if (failures.length === 0) {
  console.log("[verify-posting-rules] OK — 6 rules, each with a negative control.");
  process.exit(0);
}
console.error(`\n[verify-posting-rules] ${failures.length} failure(s):\n`);
for (const f of failures) console.error(`  ✗ ${f}`);
console.error("");
process.exit(1);
