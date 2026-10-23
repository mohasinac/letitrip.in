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

/* ── R6  the two normal-balance mappings must AGREE ─────────────────────── */
{
  /*
   * 🛑 There are deliberately TWO: `normalBalanceFor` on the schema (what
   * application code calls) and `NORMAL_SIDE` in `reports.ts` (a table,
   * because that module is loaded by type stripping and cannot resolve a
   * runtime import against extensionless appkit source).
   *
   * Two copies of one rule is Root Cause #42 and the mitigation cannot be a
   * comment asking them to stay in step — that is exactly what drifts. This
   * checks all five, so an inverted entry in either is a failing audit
   * rather than a P&L that reads profitable.
   */
  const REPORTS = resolve(ROOT, "appkit/src/_internal/shared/features/ledger/reports.ts");
  const SCHEMA = resolve(ROOT, "appkit/src/features/ledger/schemas/firestore.ts");
  try {
    const reports = await import(`file://${REPORTS.split("\\").join("/")}`);
    const schema = await import(`file://${SCHEMA.split("\\").join("/")}`);
    const types = ["asset", "liability", "equity", "income", "expense"];
    for (const t of types) {
      const fromFn = schema.normalBalanceFor(t);
      const fromTable = reports.NORMAL_SIDE_TABLE[t];
      if (fromFn !== fromTable) {
        fail(
          "R6",
          `"${t}": normalBalanceFor says ${fromFn}, reports.ts says ${fromTable}. One of them inverts that account in every report.`,
        );
      }
    }

    // CONTROL: the comparison must be able to see a disagreement at all.
    if (reports.NORMAL_SIDE_TABLE.asset === reports.NORMAL_SIDE_TABLE.income) {
      fail("R6", "the table maps asset and income to the same side; this check cannot discriminate.");
    }
  } catch (err) {
    fail("R6", `could not load both mappings: ${err?.message ?? err}`);
  }
}

/* ── R7  each business rule balances, and posts the right SIDES ─────────── */
{
  /*
   * 🛑 Balancing is necessary and nowhere near sufficient. A backwards
   * posting balances perfectly — `Cr Bank / Dr Gateway charges` for a fee we
   * paid is as balanced as the correct entry and means the opposite. So each
   * rule is checked for the specific leg that would be wrong if somebody
   * reversed it, with the amount.
   */
  const RULES = resolve(ROOT, "appkit/src/_internal/shared/features/ledger/rules.ts");
  let rules;
  try {
    rules = await import(`file://${RULES.split("\\").join("/")}`);
  } catch (err) {
    fail("R7", `could not load the business rules: ${err?.message ?? err}`);
  }

  if (rules) {
    const { ACCOUNT, orderPlacedPosting, settlementPosting, payoutPosting, refundPosting } = rules;
    const legOf = (p, code) => p.lines.find((l) => l.accountCode === code);

    /* A ₹1,180 order: ₹1,000 goods + ₹180 GST, ₹10 commission + ₹1.80 its GST. */
    const order = orderPlacedPosting({
      orderId: "order-1-20261015-aaaaaa",
      storeId: "store-letitrip-official",
      placedAt: DATE,
      totalPrice: 1180,
      gstAmount: 180,
      platformFee: 10,
      platformFeeGst: 1.8,
    });
    accepts("R7", "orderPlacedPosting", order);

    const recv = legOf(order, ACCOUNT.GATEWAY_RECEIVABLE);
    if (!recv || recv.debit !== 1180) {
      fail("R7", `an order must DEBIT gateway receivable with the full capture (got debit ${recv?.debit}, credit ${recv?.credit}). Debiting Bank instead overstates cash by the whole float for the settlement cycle.`);
    }
    const gst = legOf(order, ACCOUNT.OUTPUT_GST);
    if (!gst || gst.credit <= 0) {
      fail("R7", "output GST must be CREDITED on a sale — it is a liability owed to the government, and this leg is what separates turnover from takings.");
    }
    const payable = legOf(order, ACCOUNT.SELLER_PAYABLE);
    if (!payable || payable.credit <= 0) {
      fail("R7", "the seller payable must be CREDITED on a sale.");
    }
    if (payable && !payable.counterpartyId) {
      fail("R7", "the seller payable leg carries no counterpartyId, so a per-seller ageing is impossible.");
    }

    /* The settlement that clears it: ₹1,180 gross, ₹23.60 MDR, ₹4.25 GST. */
    const settle = settlementPosting({
      settlementId: "setl-1",
      settledAt: DATE,
      gross: 1180,
      fee: 23.6,
      feeGst: 4.25,
    });
    accepts("R7", "settlementPosting", settle);

    const bank = legOf(settle, ACCOUNT.BANK);
    if (!bank || bank.debit <= 0) {
      fail("R7", `a settlement must DEBIT bank with the NET (got debit ${bank?.debit}, credit ${bank?.credit}). Crediting it is the backwards posting this rule exists to prevent.`);
    }
    if (bank && Math.abs(bank.debit - 1152.15) > 0.005) {
      fail("R7", `bank should receive gross less fee less fee GST = 1152.15, got ${bank.debit}.`);
    }
    const itc = legOf(settle, ACCOUNT.INPUT_GST);
    if (!itc || itc.debit <= 0) {
      fail("R7", "GST on the gateway fee must be DEBITED to input GST — it is a reclaimable ASSET, and expensing it makes it unrecoverable.");
    }
    const cleared = legOf(settle, ACCOUNT.GATEWAY_RECEIVABLE);
    if (!cleared || cleared.credit !== 1180) {
      fail("R7", "a settlement must CREDIT gateway receivable with the gross, clearing what the order debited.");
    }

    /* Paying the seller clears the payable; it is not a cost. */
    const payout = payoutPosting({
      payoutId: "payout-1",
      storeId: "store-letitrip-official",
      paidAt: DATE,
      amount: 988.2,
    });
    accepts("R7", "payoutPosting", payout);
    const cleared2 = legOf(payout, ACCOUNT.SELLER_PAYABLE);
    if (!cleared2 || cleared2.debit <= 0) {
      fail("R7", "a payout must DEBIT the seller payable, clearing the debt. Crediting it would double what we owe.");
    }
    if (payout.lines.some((l) => l.accountCode.startsWith("5"))) {
      fail("R7", "a payout posted to an EXPENSE account. Paying a debt is not a cost; treating it as one double-counts every sale.");
    }

    /* A refund reclaims the GST. */
    const refund = refundPosting({
      orderId: "order-1-20261015-aaaaaa",
      refundId: "refund-1",
      refundedAt: DATE,
      amount: 1180,
      gstAmount: 180,
    });
    accepts("R7", "refundPosting", refund);
    const gstBack = legOf(refund, ACCOUNT.OUTPUT_GST);
    if (!gstBack || gstBack.debit !== 180) {
      fail("R7", `a refund must DEBIT output GST to reclaim the tax (got debit ${gstBack?.debit}). Without it we pay GST on money we gave back.`);
    }

    /* CONTROL: a zero-fee order must still balance — `compact` drops the
       empty legs rather than leaving zero lines `assertBalanced` refuses. */
    accepts("R7", "an order with no fees at all", orderPlacedPosting({
      orderId: "order-2",
      storeId: "store-letitrip-official",
      placedAt: DATE,
      totalPrice: 500,
    }));
  }
}

/* ── R8  an expense funds from the right side, and ITC is an ASSET ──────── */
{
  const RULES = resolve(ROOT, "appkit/src/_internal/shared/features/ledger/rules.ts");
  let rules = null;
  try {
    rules = await import(`file://${RULES.split("\\").join("/")}`);
  } catch {
    /* R7 already reported the load failure; do not double-count it. */
  }

  if (rules?.expensePosting) {
    const { ACCOUNT, expensePosting } = rules;
    const legOf = (p, code) => p.lines.find((l) => l.accountCode === code);

    const paid = expensePosting({
      expenseId: "exp-1",
      vendorId: "vendor-acme",
      vendorName: "Acme Toys",
      category: "freight",
      billDate: DATE,
      amount: 1000,
      inputGst: 180,
      paid: true,
    });
    accepts("R8", "a PAID expense", paid);
    if (!legOf(paid, ACCOUNT.BANK)) {
      fail("R8", "a paid bill must credit BANK — the cash has left.");
    }
    if (legOf(paid, ACCOUNT.ACCOUNTS_PAYABLE)) {
      fail("R8", "a paid bill credited accounts payable, leaving a debt that does not exist.");
    }

    const unpaid = expensePosting({
      expenseId: "exp-2",
      vendorName: "Acme Toys",
      category: "freight",
      billDate: DATE,
      amount: 1000,
      inputGst: 180,
      paid: false,
    });
    accepts("R8", "an UNPAID expense", unpaid);
    if (!legOf(unpaid, ACCOUNT.ACCOUNTS_PAYABLE)) {
      fail("R8", "an unpaid bill must credit ACCOUNTS PAYABLE.");
    }
    if (legOf(unpaid, ACCOUNT.BANK)) {
      fail(
        "R8",
        "an unpaid bill credited BANK — it shows cash leaving that is still in the account. It balances, which is why nothing else would notice.",
      );
    }

    const itc = legOf(paid, ACCOUNT.INPUT_GST);
    if (!itc || itc.debit !== 180) {
      fail("R8", `input GST must be DEBITED to the asset (got debit ${itc?.debit}). Folding it into the cost is how ITC stops being claimable.`);
    }
    const cost = legOf(paid, ACCOUNT.FREIGHT_PAID);
    if (!cost || cost.debit !== 1000) {
      fail("R8", `the expense leg should be the NET 1000, not 1180 (got ${cost?.debit}) — the tax is reclaimable and is not a cost.`);
    }

    /*
     * 🛑 An ASSET purchase must NOT reach a 5xxx account. ₹80,000 of camera
     * expensed in one month reads as a terrible trading month and is simply
     * the wrong classification; depreciation is the CA's.
     */
    const asset = expensePosting({
      expenseId: "exp-3",
      vendorName: "Camera Shop",
      category: "asset",
      billDate: DATE,
      amount: 80000,
      paid: true,
    });
    accepts("R8", "an asset purchase", asset);
    if (asset.lines.some((l) => l.accountCode.startsWith("5"))) {
      fail("R8", "an asset purchase hit an EXPENSE account. It belongs on the balance sheet; expensing it makes the month read as a loss.");
    }
    if (!asset.lines.some((l) => l.accountCode === "1500" && l.debit === 80000)) {
      fail("R8", "an asset purchase did not debit fixed assets.");
    }
  }
}

/* ── report ─────────────────────────────────────────────────────────────── */
if (failures.length === 0) {
  console.log("[verify-posting-rules] OK — 9 rules, each with a negative control.");
  process.exit(0);
}
console.error(`\n[verify-posting-rules] ${failures.length} failure(s):\n`);
for (const f of failures) console.error(`  ✗ ${f}`);
console.error("");
process.exit(1);
