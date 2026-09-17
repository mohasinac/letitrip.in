#!/usr/bin/env node
/*
 * Generate test-runs/test-run-N.md for one tester run.
 *
 *   node scripts/tester-run-report.mjs --run <runId> --number N [--prev <runId>]
 *   node scripts/tester-run-report.mjs --number N --append-fix FIX-003 \
 *        --case <caseId> --fix-run 1 --retest-run 2 [--note "..."]
 *
 * 🛑 TWO RULES THIS FILE EXISTS TO ENFORCE
 *
 * RULE 3 — history is never overwritten. The generator writes a case's result
 * once. `--append-fix` ADDS lines beneath it and is incapable of editing the
 * `Test Run N Result:` line: it matches on the case heading and inserts after
 * the existing block. A fix can therefore never turn a recorded FAIL into a
 * PASS — only a later Test Run can do that.
 *
 * RULE 11 — a fix is not a pass. `Fix Run N: FIXED` and `Retest Required: YES`
 * are the strongest statements this script will ever write about a fixed case.
 *
 * The regression column is the reason the `--prev` diff exists: a case that was
 * PASS in run N-1 and FAIL in run N is the single most expensive kind of finding
 * and nothing in the harness surfaced it before.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  readRun, indexById, tally, classify, statusOf,
  PASS, FAIL, BLOCKED, CLASSIFICATION, esc, listRuns,
} from "./lib/tester-runs.mjs";

const OUT_DIR = "test-runs";

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const number = flag("number");
if (!number) {
  console.error("✗ --number N is required (which Test Run this is).");
  process.exit(2);
}
const outPath = join(OUT_DIR, `test-run-${number}.md`);

// ── --append-fix : back-annotate an existing run file ───────────────────────
if (flag("append-fix")) {
  const fixId = flag("append-fix");
  const caseId = flag("case");
  const fixRun = flag("fix-run", "?");
  const retestRun = flag("retest-run", "?");
  const note = flag("note", "");

  if (!caseId) {
    console.error("✗ --append-fix also needs --case <caseId>.");
    process.exit(2);
  }
  if (!existsSync(outPath)) {
    console.error(`✗ ${outPath} does not exist — generate the run report first.`);
    process.exit(2);
  }

  const src = readFileSync(outPath, "utf8");
  const heading = `#### ${caseId}`;
  const at = src.indexOf(heading);
  if (at === -1) {
    /*
     * Only FAILED and BLOCKED cases get a `#### <id>` block — passing cases are
     * a table row, because a passing case has no narrative to annotate. So a
     * miss here almost always means "that case passed in this run", which is
     * worth saying rather than leaving the caller to wonder.
     */
    const passedHere = src.includes(`| \`${caseId}\` |`);
    console.error(
      passedHere
        ? `✗ ${caseId} PASSED in ${outPath} — there is nothing to fix. Annotating a pass would be false history.`
        : `✗ ${caseId} does not appear in ${outPath} at all. Nothing annotated.`,
    );
    process.exit(1);
  }
  if (src.slice(at).startsWith(heading) && src.slice(at, at + 4000).includes(`Fix Reference: ${fixId}`)) {
    console.log(`= ${caseId} already carries ${fixId} — nothing to do.`);
    process.exit(0);
  }

  // Insert at the END of this case's block: just before the next heading, or EOF.
  const rest = src.slice(at + heading.length);
  const nextIdx = rest.search(/\n#{1,4} /);
  const insertAt = nextIdx === -1 ? src.length : at + heading.length + nextIdx;

  const block =
    `\n- Fix Run ${fixRun}: FIXED\n` +
    `- Fix Reference: ${fixId}\n` +
    `- Retest Required: YES\n` +
    `- Retest Run: Test Run ${retestRun}\n` +
    (note && note !== true ? `- Fix Note: ${esc(note)}\n` : "");

  writeFileSync(outPath, src.slice(0, insertAt) + block + src.slice(insertAt));

  // RULE 3 self-check: the original verdict line must survive.
  const after = readFileSync(outPath, "utf8");
  const blockAfter = after.slice(after.indexOf(heading), after.indexOf(heading) + 1200);
  if (!/- Test Run \d+ Result: (PASS|FAIL|BLOCKED)/.test(blockAfter)) {
    console.error("✗ RULE 3 VIOLATED — the original result line is gone. Reverting is on you.");
    process.exit(1);
  }
  console.log(`✓ ${caseId} annotated with ${fixId}; original result line intact.`);
  process.exit(0);
}

// ── generate ───────────────────────────────────────────────────────────────
const runId = flag("run");
if (!runId) {
  console.error("✗ --run <runId> is required.");
  process.exit(2);
}

const cur = readRun(runId);
if (cur.records.length === 0) {
  console.error(`✗ ${runId} has no verdicts. Nothing to report.`);
  process.exit(1);
}

/*
 * The predecessor. `--prev none` declares this run the BASELINE; an explicit
 * id wins; otherwise the run immediately before this one on disk.
 *
 * 🛑 `--prev none` is not a convenience. Four runs sit in .tester-runs/ and two
 * of them are PARTIAL exploratory passes (103 and 8 batches) rather than
 * complete runs. Diffing a full pass against a partial one manufactures
 * "regressions" out of cases the partial run simply never reached — the first
 * generation of this report did exactly that and claimed 3.
 *
 * A run with no predecessor gets an EMPTY regression set and says so. "No
 * previous run" and "no regressions" are different facts.
 */
let prevId = flag("prev", null);
if (prevId === "none") {
  prevId = null;
} else if (prevId === null) {
  const all = listRuns();
  const i = all.indexOf(runId);
  prevId = i > 0 ? all[i - 1] : null;
}
const prev = prevId ? readRun(prevId) : null;
const prevById = prev ? indexById(prev.records) : new Map();

const t = tally(cur.records);
const passed = cur.records.filter((r) => r.status === PASS);
const failed = cur.records.filter((r) => r.status === FAIL);
const blocked = cur.records.filter((r) => r.status === BLOCKED);
const accepted = blocked.filter((r) => r.requiresHumanChannel);
const realBlockers = blocked.filter((r) => !r.requiresHumanChannel);

const newFailures = [];
const repeatFailures = [];
const regressions = [];
for (const r of failed) {
  const p = prevById.get(r.id);
  if (!p) { if (prev) newFailures.push(r); continue; }
  if (p.status === PASS) regressions.push(r);
  else if (p.status === FAIL) repeatFailures.push(r);
  else newFailures.push(r);
}

const scopePath = join("tester/.tester-runs", runId, "scope.json");
let scope = null;
try { scope = JSON.parse(readFileSync(scopePath, "utf8")); } catch { /* optional */ }

const L = [];
const w = (s = "") => L.push(s);

w(`# Test Run ${number}`);
w();
w(`> Generated by \`scripts/tester-run-report.mjs\` from \`${runId}\`.`);
w(`> Historical results in this file are **never** rewritten. A fix appends to a`);
w(`> case's block; only a later Test Run can record a PASS (RULE 3, RULE 11).`);
w();

w(`## Run Metadata`);
w();
w(`| | |`);
w(`|---|---|`);
w(`| Run ID | \`${runId}\` |`);
w(`| Test Run number | ${number} |`);
w(`| Predecessor | ${prev ? `\`${prevId}\`` : "_none — this is the baseline run_"} |`);
w(`| Base URL | ${scope?.baseUrl ?? "_unrecorded_"} |`);
w(`| Started | ${scope?.startedAt ?? "_unrecorded_"} |`);
w(`| Scope filter | ${scope?.filters?.cases ? `\`${scope.filters.cases}\`` : "full catalogue"} |`);
w(`| Batches with verdicts | ${cur.batches.length}${scope?.batches ? ` / ${scope.batches.length} scoped` : ""} |`);
w(`| Cases answered | ${t.total} |`);
w(`| Quarantined batches | ${cur.quarantined.length} |`);
w();

w(`## Execution Progress`);
w();
if (scope?.batches) {
  const recorded = new Set(cur.batches.map((b) => b.key));
  const missing = scope.batches.filter((b) => !recorded.has(b.key));
  w(`- Scoped batches: **${scope.batches.length}**`);
  w(`- Recorded: **${cur.batches.length}**`);
  w(`- Outstanding: **${missing.length}**`);
  if (missing.length) {
    w();
    w(`Outstanding batches (first 25):`);
    w();
    for (const b of missing.slice(0, 25)) w(`- \`${b.key}\``);
    if (missing.length > 25) w(`- …and ${missing.length - 25} more`);
    w();
    w(`> 🛑 This run is **incomplete**. Per the spec a Test Run is not finished`);
    w(`> until every assigned case has a result, and a Fix Run must not begin.`);
  }
} else {
  w(`- Batches recorded: **${cur.batches.length}** (no scope.json — completeness unverifiable)`);
}
w();

w(`## Result Summary`);
w();
w(`| Status | Count |`);
w(`|---|---|`);
w(`| PASS | ${t.PASS} |`);
w(`| FAIL | ${t.FAIL} |`);
w(`| BLOCKED | ${t.BLOCKED} |`);
w(`| — of which Accepted Exception | ${accepted.length} |`);
w(`| — genuine blockers | ${realBlockers.length} |`);
w(`| **Total** | **${t.total}** |`);
w();

const caseBlock = (r, prevRec) => {
  w(`#### ${r.id}`);
  w();
  w(`- Test Run ${number} Result: ${r.status}`);
  w(`- Case: ${esc(r.label) || "_unlabelled_"}`);
  w(`- Batch: \`${r.batchKey}\`${r.href ? ` · Page: \`${r.href}\`` : ""}`);
  if (r.status !== PASS) {
    w(`- Classification: ${classify(r, prevRec)}`);
    if (r.comment) w(`- Detail: ${esc(r.comment).slice(0, 600)}`);
    const ev = r.evidence ?? {};
    const bits = [];
    if (ev.status) bits.push(`HTTP ${ev.status}`);
    if (ev.observed) bits.push(esc(ev.observed).slice(0, 200));
    if (ev.consoleError) bits.push(`console: ${esc(ev.consoleError).slice(0, 120)}`);
    if (bits.length) w(`- Evidence: ${bits.join(" · ")}`);
    if (ev.failedAtStep) w(`- Failed at step: ${ev.failedAtStep}`);
    if (ev.screenshot) w(`- Screenshot: \`${ev.screenshot}\``);
    if (r.expectedBehaviour) w(`- Expected: ${esc(r.expectedBehaviour).slice(0, 300)}`);
    if (prevRec) w(`- Previous run (${prevId}): ${prevRec.status}`);
    if (r.requiresHumanChannel) w(`- Human channel required: ${esc(r.humanChannelReason)}`);
  }
  w();
};

w(`## Passed Cases`);
w();
w(`${passed.length} case(s) passed. Listed as a table — a passing case needs no narrative.`);
w();
if (passed.length) {
  w(`| Case | Batch |`);
  w(`|---|---|`);
  for (const r of passed) w(`| \`${r.id}\` | \`${r.batchKey}\` |`);
} else {
  w(`_None._`);
}
w();

w(`## Failed Cases`);
w();
if (failed.length) {
  for (const r of failed) caseBlock(r, prevById.get(r.id));
} else {
  w(`_None._`);
  w();
}

w(`## Blocked Cases`);
w();
w(`${realBlockers.length} genuine blocker(s); ${accepted.length} accepted exception(s) listed separately below.`);
w();
if (realBlockers.length) {
  for (const r of realBlockers) caseBlock(r, prevById.get(r.id));
} else {
  w(`_No genuine blockers._`);
  w();
}

w(`### Accepted Exceptions`);
w();
w(`Excluded from the blocker count by an explicit decision: these need a channel`);
w(`no automation can supply. They are permanently manual and are listed in every`);
w(`run so they can never be quietly forgotten.`);
w();
if (accepted.length) {
  w(`| Case | Channel required |`);
  w(`|---|---|`);
  for (const r of accepted) w(`| \`${r.id}\` | ${esc(r.humanChannelReason)} |`);
} else {
  w(`_None._`);
}
w();

w(`## New Failures`);
w();
if (!prev) {
  w(`_Not computable — this is the baseline run, so every failure is "new" by`);
  w(`definition and calling them that would be meaningless._`);
} else if (newFailures.length) {
  for (const r of newFailures) w(`- \`${r.id}\` — ${esc(r.label).slice(0, 100)}`);
} else {
  w(`_None._`);
}
w();

w(`## Repeated Failures`);
w();
if (!prev) {
  w(`_Not computable — no predecessor run._`);
} else if (repeatFailures.length) {
  w(`Failed in \`${prevId}\` and again here:`);
  w();
  for (const r of repeatFailures) w(`- \`${r.id}\` — ${esc(r.label).slice(0, 100)}`);
} else {
  w(`_None._`);
}
w();

w(`## Regressions`);
w();
if (!prev) {
  w(`_Not computable — no predecessor run to regress from. This is an absence of`);
  w(`data, not a clean result._`);
} else if (regressions.length) {
  w(`🛑 **${regressions.length} case(s) passed in \`${prevId}\` and fail here.** A`);
  w(`regression is the most expensive kind of finding: something that worked was`);
  w(`broken by a fix, so it belongs at the top of the next Fix Run.`);
  w();
  for (const r of regressions) {
    w(`- \`${r.id}\` — ${esc(r.label).slice(0, 90)}`);
    if (r.comment) w(`  - ${esc(r.comment).slice(0, 220)}`);
  }
} else {
  w(`None. Every case failing here was already failing or blocked in \`${prevId}\`.`);
}
w();

w(`## Root Cause Analysis`);
w();
w(`Failures grouped by batch, which is the cheapest honest grouping: cases in one`);
w(`batch share a page, an identity and usually a cause. Keyword clustering across`);
w(`batches is deliberately NOT done here — \`scripts/triage-findings.mjs\` does it`);
w(`properly against the same verdicts, and a second weaker clusterer would just`);
w(`disagree with it.`);
w();
if (failed.length || realBlockers.length) {
  const byBatch = new Map();
  for (const r of [...failed, ...realBlockers]) {
    if (!byBatch.has(r.batchKey)) byBatch.set(r.batchKey, []);
    byBatch.get(r.batchKey).push(r);
  }
  const sorted = [...byBatch.entries()].sort((a, b) => b[1].length - a[1].length);
  w(`| Batch | FAIL | BLOCKED | Cases |`);
  w(`|---|---|---|---|`);
  for (const [key, rs] of sorted) {
    const f = rs.filter((r) => r.status === FAIL).length;
    const b = rs.filter((r) => r.status === BLOCKED).length;
    w(`| \`${key}\` | ${f} | ${b} | ${rs.length} |`);
  }
  w();
  w(`Run \`node scripts/triage-findings.mjs --run ${runId}\` for signature-level`);
  w(`clustering across batch boundaries.`);
} else {
  w(`_Nothing to analyse._`);
}
w();

w(`## Required Fixes`);
w();
w(`_To be completed during Fix Run ${Number(number)} — one entry per ROOT CAUSE,`);
w(`not per failing case. ${failed.length} failure(s) and ${realBlockers.length}`);
w(`blocker(s) are candidates._`);
w();

w(`## Fix Status`);
w();
w(`_Populated by \`--append-fix\` as fixes land. Empty means no fix has been`);
w(`applied against this run yet._`);
w();

w(`## Cases Requiring Next Run`);
w();
const carry = [...failed, ...realBlockers];
w(`${carry.length} case(s) carry forward (FAIL + genuine BLOCKED; accepted`);
w(`exceptions excluded). Generate the id file with:`);
w();
w("```");
w(`node scripts/tester-carry-forward.mjs --run ${runId} --out tester/.tester-runs/run-${number}-carry.txt`);
w("```");
w();

w(`## Final Run Summary`);
w();
const cleanish = failed.length === 0 && realBlockers.length === 0;
w(`- PASS ${t.PASS} · FAIL ${t.FAIL} · BLOCKED ${t.BLOCKED} (${accepted.length} accepted)`);
w(`- Regressions: ${prev ? regressions.length : "n/a (baseline)"}`);
w(`- Quarantined batches: ${cur.quarantined.length}`);
w();
if (cleanish) {
  w(`**No genuine failures and no genuine blockers in this run.** Whether the`);
  w(`overall regression is CLEAN additionally requires that no fix is awaiting`);
  w(`verification — see \`test-traceability.md\`.`);
} else {
  w(`**Not clean.** ${failed.length} failure(s) and ${realBlockers.length}`);
  w(`blocker(s) remain; proceed to Fix Run ${Number(number)}.`);
}
w();

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(outPath, L.join("\n"));

console.log(`✓ ${outPath}`);
console.log(`  PASS ${t.PASS} · FAIL ${t.FAIL} · BLOCKED ${t.BLOCKED} (${accepted.length} accepted exception)`);
console.log(`  regressions: ${prev ? regressions.length : "n/a — no predecessor"}`);
