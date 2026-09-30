#!/usr/bin/env node
/*
 * G4 — a fix must name the case that found it, and the entry must be machine-written.
 *
 * 🛑 WHY THIS SCRIPT EXISTS. The first fix of run 3 was appended to fixes.jsonl by
 * hand as `{"case": "..."}` while `tally()` read `f.caseId`. The fix was real, the
 * code was committed, the file was on disk — and the counter reported
 * `fixed 0/1 · open 1`, i.e. "this cycle may not advance". A number that exists to
 * be trusted over my memory had been handed a field name my memory invented.
 *
 * Hand-authoring a record that a script has to parse is the whole defect. So there
 * is now exactly one writer, it validates before appending, and it REFUSES an
 * entry whose case id is not a `no` in the recorded verdicts — because a fix that
 * names no failing case is the "refactor whatever I notice" drift G4 exists to stop.
 *
 * Usage:
 *   node scripts/test-run-record-fix.mjs \
 *     --case <caseId> \
 *     --summary "what was wrong and what changed" \
 *     --files "a/b.tsx,c/d.ts" \
 *     [--reverified pending|pending-deploy|deferred-to-milestone|pass|fail] \
 *     [--force]                 # append even if no recorded `no` names this case
 *
 * Exit: 0 appended · 1 refused · 2 bad usage.
 */

import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { FIXES_PATH, readVerdicts, isControlId, flag } from "./lib/test-run.mjs";

const caseId = flag("case");
const summary = flag("summary");
const filesRaw = flag("files");
const reverified = flag("reverified", "pending");

/*
 * 🛑 A CLOSED set, checked — not a documented suggestion.
 *
 * The usage line has always listed five values and nothing enforced them, so
 * `--reverified deferred` was accepted twice. `tally()` recognised only
 * `deferred-to-milestone` as a deferral, so those two entries counted as
 * FIXED and the counter reported two genuinely-unfixed defects as repaired.
 *
 * `deferred` is accepted as a permitted alias rather than rejected, because two
 * rows on disk already use it and rewriting history to satisfy a validator is
 * how a ledger stops being a record. The reader treats both as deferred; this
 * check only stops a SIXTH spelling appearing.
 */
const REVERIFIED_VALUES = new Set([
  "pending", // fixed, not yet re-driven
  "pending-deploy", // fixed in appkit; not live until the milestone publish
  "deferred", // alias of the below — two pre-existing rows use it
  "deferred-to-milestone", // diagnosed, evidenced, NOT fixed; in state.fixQueue
  "pass", // re-driven against production and confirmed
  "fail", // re-driven and still broken
]);
if (!REVERIFIED_VALUES.has(String(reverified))) {
  console.error(
    `🛑 --reverified "${reverified}" is not a recognised state.\n` +
      `   Allowed: ${[...REVERIFIED_VALUES].join(" | ")}\n` +
      `   A new spelling silently changes what the counter reports: an\n` +
      `   unrecognised value is treated as FIXED, which is how two open\n` +
      `   defects came to be counted as repaired.`,
  );
  process.exit(2);
}

if (typeof caseId !== "string" || !caseId || typeof summary !== "string" || !summary) {
  console.error("usage: --case <caseId> --summary <text> [--files a,b] [--reverified pending|pending-deploy|deferred-to-milestone|pass|fail]");
  process.exit(2);
}
if (isControlId(caseId)) {
  console.error(`🛑 ${caseId} is a calibration control. Controls are harness self-checks, not product defects.`);
  process.exit(1);
}

/*
 * The case must actually have failed. A fix ledger is a record of what testing
 * found — an entry naming a case nobody recorded a `no` against is either a typo
 * in the id (so the counter will never match it, the bug above) or work no case
 * asked for (so it belongs in TEST-RUN-3-OUTOFSCOPE.md instead).
 */
const failing = new Set();
for (const [, answers] of readVerdicts()) {
  for (const a of answers) if (a?.answer === "no" && a.id) failing.add(a.id);
}
if (!failing.has(caseId) && flag("force") !== true) {
  console.error(`🛑 no recorded 'no' for ${caseId}.`);
  console.error("   Either the id is wrong (check the verdict file), or no case found this —");
  console.error("   in which case it goes to docs/TEST-RUN-3-OUTOFSCOPE.md, not the fix ledger.");
  console.error("   Pass --force only when the verdict is genuinely not recorded yet.");
  process.exit(1);
}

const files =
  typeof filesRaw === "string" && filesRaw
    ? filesRaw
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];
const missing = files.filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`🛑 these files do not exist: ${missing.join(", ")}`);
  process.exit(1);
}

/* `caseId` is the canonical spelling. Never write `case` — see the header. */
const entry = {
  caseId,
  at: new Date().toISOString().slice(0, 10),
  summary,
  files,
  reverified,
};

/* Idempotent on (caseId, summary) so a re-run does not double-count a fix. */
if (existsSync(FIXES_PATH)) {
  const already = readFileSync(FIXES_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .some((l) => {
      try {
        const p = JSON.parse(l);
        return (p.caseId ?? p.case) === caseId && p.summary === summary;
      } catch {
        return false;
      }
    });
  if (already) {
    console.log(`= already recorded: ${caseId}`);
    process.exit(0);
  }
}

appendFileSync(FIXES_PATH, JSON.stringify(entry) + "\n", "utf8");
console.log(`✓ fix recorded for ${caseId} (${files.length} file(s), reverified=${reverified})`);
