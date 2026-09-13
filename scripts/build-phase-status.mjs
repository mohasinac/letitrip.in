#!/usr/bin/env node
/*
 * Write docs/TESTING-PHASE-STATUS.md — a per-phase status snapshot for the
 * current tester run.
 *
 * 🛑 WHY THIS EXISTS, and why it is a script rather than a habit.
 *
 * A long run produces its status as prose in a chat transcript, which is
 * exactly where it cannot be read later: the transcript is compacted, the
 * numbers drift as they are retyped, and "35 batches" becomes "about 35" and
 * then becomes wrong. Every number in the generated half of this file is
 * counted from the verdict files on disk. Nobody retypes anything.
 *
 * It is invoked two ways and both matter:
 *   1. By the assistant at the end of every phase (the stop hook tells it to).
 *   2. By the stop hook ITSELF on every fire, so the file is current even if a
 *      turn ended early, crashed, or was compacted away mid-phase.
 *
 * The hand-authored narrative lives in docs/TESTING-STATUS-<runId>.md and is
 * NOT touched here — a script can count answers, it cannot say which of them
 * mattered.
 *
 * Usage:  node scripts/build-phase-status.mjs [--run <runId>] [--quiet]
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO = process.cwd();
const STATE = resolve(REPO, "tester/.tester-runs/loop-state.json");
const OUT = resolve(REPO, "docs/TESTING-PHASE-STATUS.md");

const argv = process.argv.slice(2);
const quiet = argv.includes("--quiet");
const runFlag = argv.indexOf("--run");

function readState() {
  try {
    return JSON.parse(readFileSync(STATE, "utf8"));
  } catch {
    return null;
  }
}

const state = readState();
const runId = runFlag >= 0 ? argv[runFlag + 1] : state?.runId;

if (!runId) {
  if (!quiet) console.error("build-phase-status: no runId (pass --run, or have a readable loop-state.json)");
  process.exit(0); // never fail a caller — this is a reporting aid, not a gate
}

const verdictsDir = resolve(REPO, "tester/.tester-runs", runId, "verdicts");
if (!existsSync(verdictsDir)) {
  if (!quiet) console.error(`build-phase-status: no verdicts directory for ${runId}`);
  process.exit(0);
}

/* ── Count from disk. Nothing here is retyped from a transcript. ───────────── */

const phases = new Map(); // phase -> { batches, yes, no, null, quarantined, pages:Set }
let totals = { batches: 0, yes: 0, no: 0, nul: 0, quarantined: 0 };
const failures = []; // { phase, batch, id, label }

for (const file of readdirSync(verdictsDir).filter((f) => f.endsWith(".json"))) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(resolve(verdictsDir, file), "utf8"));
  } catch {
    continue;
  }
  const phase = Number(doc?.batch?.phase ?? 0);
  const key = doc?.batch?.key ?? file.replace(/\.json$/, "");
  if (!phases.has(phase)) phases.set(phase, { batches: 0, yes: 0, no: 0, nul: 0, quarantined: 0, pages: new Set() });
  const p = phases.get(phase);
  p.batches += 1;
  p.pages.add(key);
  totals.batches += 1;
  if (doc?.quarantined) {
    p.quarantined += 1;
    totals.quarantined += 1;
  }
  for (const v of doc?.verdicts ?? []) {
    // Controls are calibration, not coverage — they must not inflate the counts.
    if (typeof v?.id === "string" && v.id.startsWith("control-")) continue;
    if (v?.answer === "yes") { p.yes += 1; totals.yes += 1; }
    else if (v?.answer === "no") {
      p.no += 1; totals.no += 1;
      failures.push({ phase, batch: key, id: v.id, label: v.label ?? "" });
    } else { p.nul += 1; totals.nul += 1; }
  }
}

const answered = totals.yes + totals.no;
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

/* ── Render ────────────────────────────────────────────────────────────────── */

const phaseRows = [...phases.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([phase, p]) => {
    const ans = p.yes + p.no;
    return `| ${phase} | ${p.batches} | ${p.yes} | ${p.no} | ${p.nul} | ${ans ? pct(p.yes, ans) + "%" : "—"} | ${p.quarantined || "—"} |`;
  })
  .join("\n");

const nextPhase = Number(state?.nextPhase ?? 0);
const totalPhases = Number(state?.totalPhases ?? 35);
const done = [...phases.keys()].filter((n) => n > 0).sort((a, b) => a - b);

const failureList = failures.length
  ? failures
      .sort((a, b) => a.phase - b.phase)
      .map((f) => `- **P${f.phase}** \`${f.batch}\` — ${f.label || f.id}`)
      .join("\n")
  : "_None recorded._";

const md = `# Tester phase status — \`${runId}\`

Generated ${new Date().toISOString()} by \`scripts/build-phase-status.mjs\`.

> Every number below is counted from \`tester/.tester-runs/${runId}/verdicts/\`.
> Calibration controls are excluded — they measure the tester, not the product.
> The narrative companion is \`docs/TESTING-STATUS-${runId}.md\`; a script can
> count answers, it cannot say which of them mattered.

## Where the run is

- **Phases recorded:** ${done.length ? done.join(", ") : "none"} ${nextPhase ? `· **next: ${nextPhase} of ${totalPhases}**` : ""}
- **Batches recorded:** ${totals.batches}
- **Quarantined batches:** ${totals.quarantined}${totals.quarantined === 0 ? " ✓" : " 🛑"}

## Answers

| | count | share of answered |
|---|---|---|
| pass | ${totals.yes} | ${pct(totals.yes, answered)}% |
| fail | ${totals.no} | ${pct(totals.no, answered)}% |
| **answered** | **${answered}** | |
| could not test | ${totals.nul} | — |
| **total cases** | **${answered + totals.nul}** | |

${totals.nul > answered ? `> 🛑 **More cases could not be tested than were tested** (${totals.nul} vs ${answered}).\n> That ratio is a statement about the harness, not the product. See the\n> blocked-cause breakdown in the narrative companion before reading the pass\n> rate as coverage.\n` : ""}
## By phase

| phase | batches | pass | fail | blocked | pass rate | quarantined |
|---|---|---|---|---|---|---|
${phaseRows}

## Failures recorded so far

${failureList}

---

_Regenerate: \`node scripts/build-phase-status.mjs\`. The stop hook also runs it
on every fire, so this file stays current even if a turn ends early._
`;

writeFileSync(OUT, md);
if (!quiet) {
  console.log(
    `docs/TESTING-PHASE-STATUS.md: ${totals.batches} batches · ${totals.yes} pass · ${totals.no} fail · ${totals.nul} blocked · ${totals.quarantined} quarantined`,
  );
}
