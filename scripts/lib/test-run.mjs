/*
 * Test Run 3 — the one place that knows where run state lives and how to count it.
 *
 * 🛑 EVERY NUMBER THIS RUN REPORTS IS COMPUTED HERE, FROM DISK. None is typed by
 * hand into a document, and that is the entire point of the module.
 *
 * WHY: a hand-kept tally in an earlier run reported 17 failures where the verdict
 * files held 15 — the prose had been counting calibration controls, and nobody
 * could tell, because the only other copy of the number was the prose itself. A
 * count that exists in two places has already drifted; it just has not been
 * noticed yet.
 *
 * So: `test-run-status.mjs` rewrites the counter block of docs/TEST-RUN-3.md from
 * `tally()`, the Stop hook calls it on every fire, and if a number looks wrong the
 * fix belongs in this file rather than in the document.
 *
 * @tag domain:tester
 * @tag layer:lib
 * @tag access:node-only
 * @tag consumers:test-run-{status,preflight,inflight,milestone}.mjs, claude-hooks/tester-loop-continue.mjs
 * @tag sideEffects:none — pure reads
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

export const RUN_ID = process.env.TEST_RUN_ID ?? "run-3";
export const REPO = process.cwd();

export const RUNS_DIR = resolve(REPO, "tester/.tester-runs");
export const RUN_DIR = resolve(RUNS_DIR, RUN_ID);
export const SCOPE_PATH = resolve(RUN_DIR, "scope.json");
export const CATALOGUE_PATH = resolve(RUN_DIR, "catalogue.json");
export const BATCHES_DIR = resolve(RUN_DIR, "batches");
export const VERDICTS_DIR = resolve(RUN_DIR, "verdicts");
export const SHOTS_DIR = resolve(RUN_DIR, "shots");
export const INFLIGHT_PATH = resolve(RUN_DIR, "INFLIGHT.json");
export const FIXES_PATH = resolve(RUN_DIR, "fixes.jsonl");
export const LOOP_STATE_PATH = resolve(RUNS_DIR, "loop-state.json");

export const CHECKLIST_DOC = resolve(REPO, "docs/TEST-RUN-3.md");
export const AUDIT_DOC = resolve(REPO, "docs/TEST-RUN-3-AUDIT.md");
export const OUTOFSCOPE_DOC = resolve(REPO, "docs/TEST-RUN-3-OUTOFSCOPE.md");

export const BATCHES_PER_CYCLE = 5;
export const DEPLOY_EVERY_BATCHES = 25;

/**
 * A calibration control, not a real checklist case.
 *
 * 🛑 Controls are EXCLUDED from every reported figure. They are harness
 * self-checks with answers the harness already knows; counting them inflates
 * both the numerator and the denominator and makes the pass rate meaningless.
 * This is the exact mistake the 17-vs-15 drift was.
 */
export function isControlId(id) {
  return typeof id === "string" && id.startsWith("control-");
}

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

export function readScope() {
  return readJson(SCOPE_PATH, null);
}

export function readCatalogue() {
  return readJson(CATALOGUE_PATH, null);
}

export function readInflight() {
  return readJson(INFLIGHT_PATH, null);
}

/**
 * Every recorded fix, newest last. Absent file is zero fixes, not an error.
 *
 * 🛑 `caseId` is normalised from either spelling, because both have been written.
 *
 * The first real entry in this run was hand-authored as `{"case": "..."}` while
 * `tally()` read `f.caseId`, so a fix that was genuinely made, committed and
 * sitting on disk was reported as `fixed 0/1 · open 1` — the counter said the
 * cycle could not advance, and it was right about the file and wrong about the
 * world. That is the worst failure available to a number whose whole job is to
 * be trusted over my memory.
 *
 * The real repair is `test-run-record-fix.mjs`, so no entry is hand-authored
 * again. This tolerant read is what keeps the rows already written countable.
 */
export function readFixes() {
  if (!existsSync(FIXES_PATH)) return [];
  return readFileSync(FIXES_PATH, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .map((f) => ({ ...f, caseId: f.caseId ?? f.case ?? null }))
    .filter((f) => f.caseId);
}

/** Batch key -> its parsed batch file. */
export function readBatches() {
  if (!existsSync(BATCHES_DIR)) return new Map();
  const out = new Map();
  for (const f of readdirSync(BATCHES_DIR)) {
    if (!f.endsWith(".json")) continue;
    const b = readJson(resolve(BATCHES_DIR, f));
    if (b?.key) out.set(b.key, b);
  }
  return out;
}

/** Batch key -> its verdict array. */
export function readVerdicts() {
  if (!existsSync(VERDICTS_DIR)) return new Map();
  const out = new Map();
  for (const f of readdirSync(VERDICTS_DIR)) {
    if (!f.endsWith(".json")) continue;
    const v = readJson(resolve(VERDICTS_DIR, f));
    if (Array.isArray(v)) out.set(f.replace(/\.json$/, "").replace(/__/g, "/"), v);
    else if (Array.isArray(v?.verdicts)) out.set(v.key ?? f.replace(/\.json$/, "").replace(/__/g, "/"), v.verdicts);
  }
  return out;
}

/**
 * The whole run, counted.
 *
 * "Done" is deliberately stricter than "a verdict file exists": the file must
 * parse AND its ids must cover every non-control case in the batch. A partially
 * recorded batch is byte-shaped like a complete one, and treating it as done is
 * how a quarter of a catalogue once vanished from a report that read as finished.
 */
export function tally() {
  const scope = readScope();
  const batches = readBatches();
  const verdicts = readVerdicts();
  const fixes = readFixes();

  /*
   * 🛑 `fetch-cases` writes `scope.batches`, not `scope.rows`.
   *
   * This read `scope?.rows` and nothing else, so both totals were always 0 and
   * the counter block rendered "0 / ?" no matter how much had been recorded.
   * Found at the Phase 1 exit gate, before the run started: it would otherwise
   * have shown no denominator for all 255 batches, in the one file whose whole
   * job is to be the durable record of progress.
   *
   * `rows` is kept as a fallback rather than replaced, because a tally that
   * silently reports zero is worse than one that errors, and this is the shape
   * a future writer might reasonably emit.
   */
  const scopeRows = Array.isArray(scope?.batches)
    ? scope.batches
    : Array.isArray(scope?.rows)
      ? scope.rows
      : [];
  const batchesTotal = scopeRows.length;
  const casesTotal = scopeRows.reduce((n, r) => n + (Number(r.cases) || 0), 0);

  let pass = 0;
  let fail = 0;
  let abstain = 0;
  let manual = 0;
  let batchesDone = 0;
  let casesDone = 0;
  const failedCases = [];

  for (const row of scopeRows) {
    const key = row.key;
    const answers = verdicts.get(key);
    if (!Array.isArray(answers)) continue;

    const batch = batches.get(key);
    const realIds = (batch?.cases ?? []).map((c) => c.id).filter((id) => !isControlId(id));
    const answered = new Set(answers.filter((a) => !isControlId(a.id)).map((a) => a.id));
    const covered = realIds.length > 0 && realIds.every((id) => answered.has(id));
    if (covered || (!batch && answers.length > 0)) batchesDone += 1;

    for (const a of answers) {
      if (isControlId(a.id)) continue;
      casesDone += 1;
      const c = (batch?.cases ?? []).find((x) => x.id === a.id);
      if (a.answer === "yes") pass += 1;
      else if (a.answer === "no") {
        fail += 1;
        failedCases.push({ id: a.id, key, comment: a.comment ?? "" });
      } else {
        abstain += 1;
        if (c?.requiresHumanChannel) manual += 1;
      }
    }
  }

  /*
   * 🛑 THREE states, not two: fixed, DEFERRED, and open.
   *
   * `open` used to be "failed minus anything in the fix ledger", which left no
   * way to record a defect that has been diagnosed, evidenced and scheduled but
   * genuinely not repaired — G5's escape hatch had nowhere to write its result.
   * The only way to clear the blocker was to author a fix entry for a fix that
   * does not exist, which is exactly the lie `test-run-record-fix.mjs` was built
   * to make impossible (see its header, and the `case`-vs-`caseId` incident that
   * reported a real fix as unfixed).
   *
   * So a ledger entry carrying `reverified: "deferred-to-milestone"` counts as
   * DEFERRED: it stops blocking the cycle, and it is reported separately from
   * `fixed` so nobody can read the tally as "20 of 22 repaired" when two of
   * those are still outstanding work with a next step attached.
   */
  const DEFERRED = "deferred-to-milestone";
  const deferredIds = new Set(
    fixes.filter((f) => f.reverified === DEFERRED).map((f) => f.caseId),
  );
  const fixedIds = new Set(
    fixes.filter((f) => f.reverified !== DEFERRED).map((f) => f.caseId),
  );
  const fixed = failedCases.filter((f) => fixedIds.has(f.id)).length;
  const deferred = failedCases.filter(
    (f) => !fixedIds.has(f.id) && deferredIds.has(f.id),
  ).length;
  const open = failedCases.length - fixed - deferred;

  const cycle = Math.floor(batchesDone / BATCHES_PER_CYCLE) + 1;
  const totalCycles = Math.max(1, Math.ceil(batchesTotal / BATCHES_PER_CYCLE));
  const nextDeploy = (Math.floor(batchesDone / DEPLOY_EVERY_BATCHES) + 1) * DEPLOY_EVERY_BATCHES;

  return {
    runId: RUN_ID,
    batchesDone,
    batchesTotal,
    casesDone,
    casesTotal,
    pass,
    fail,
    abstain,
    fixed,
    deferred,
    manual,
    open,
    cycle,
    totalCycles,
    nextDeploy: Math.min(nextDeploy, batchesTotal || nextDeploy),
    failedCases,
    fixes,
  };
}

/** Batch keys in scope that have no complete verdict file yet, in scope order. */
export function pendingBatchKeys() {
  const scope = readScope();
  const rows = Array.isArray(scope?.rows) ? [...scope.rows] : [];
  rows.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const batches = readBatches();
  const verdicts = readVerdicts();

  return rows
    .filter((row) => {
      const answers = verdicts.get(row.key);
      if (!Array.isArray(answers)) return true;
      const batch = batches.get(row.key);
      if (!batch) return answers.length === 0;
      const realIds = (batch.cases ?? []).map((c) => c.id).filter((id) => !isControlId(id));
      const answered = new Set(answers.filter((a) => !isControlId(a.id)).map((a) => a.id));
      return !(realIds.length > 0 && realIds.every((id) => answered.has(id)));
    })
    .map((row) => row.key);
}

export function ensureRunDirs() {
  for (const d of [RUNS_DIR, RUN_DIR, BATCHES_DIR, VERDICTS_DIR, SHOTS_DIR]) {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }
}

export function writeJson(path, value) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

/** Minimal flag parser matching the tester harness's own shape. */
export function flag(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  if (next === undefined || next.startsWith("--")) return true;
  return next;
}
