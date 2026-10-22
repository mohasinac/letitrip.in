#!/usr/bin/env node
/*
 * Validate a batch's verdicts, check its calibration controls, and store them.
 *
 * Usage (from the consumer repo root):
 *   node tester/scripts/record-verdicts.mjs --run <id> --batch <f> --verdicts <f>
 *   node tester/scripts/record-verdicts.mjs --run <id> --finish    # gate → publish → report
 *   node tester/scripts/record-verdicts.mjs --run <id> --report    # write the Markdown only
 *   node tester/scripts/record-verdicts.mjs --run <id> --publish   # PUT to the API only
 *      … any of the last three + --force-report to override the gate
 *      … --finish + --no-publish to report without writing back
 *
 * Exit: 0 success, 1 validation failure / incomplete run / publish failure,
 *       2 misconfiguration.
 *
 * 🛑 THE GATE. `--report`, `--publish` and `--finish` all refuse to run against an
 *    incomplete run. A report built from 118 of 132 batches is byte-shaped exactly
 *    like a complete one — same sections, fewer rows — and a case absent from it
 *    reads as "fine" rather than "never tested". `--force-report` overrides, stamps
 *    the file INCOMPLETE above its own title, and still exits non-zero: a forced
 *    report is never a success.
 *
 * 🛑 PUBLISH BEFORE TEARDOWN. Verdicts land in testerChecklistResponses, which the
 *    teardown wipe deletes. `--finish` publishes automatically on a complete run,
 *    which is what retires that footgun; the Markdown lives outside .tester-runs/
 *    for the same reason.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { flag, loadEnvLocal } from "./lib/firestore.mjs";
import { controlExpectations, isControlId } from "./lib/controls.mjs";
import { verdictFileName } from "./lib/batch-keys.mjs";
import { requireEnv } from "./lib/credentials.mjs";

const REPO_ROOT = process.cwd();
const RUN_ID = String(flag("run", ""));
// Local by default, production opt-in — must match fetch-cases.mjs, whose
// header explains why (run-3 drove 255 batches at the live site and the
// resulting image load is what suspended the project).
const BASE_URL = String(flag("base-url", process.env.TESTER_BASE_URL ?? "http://localhost:3000"));

if (!RUN_ID) {
  console.error("✗ --run <id> is required.");
  process.exit(2);
}

loadEnvLocal(REPO_ROOT);
const RUNS_DIR = resolve(REPO_ROOT, "tester/.tester-runs", RUN_ID);
const VERDICT_DIR = resolve(RUNS_DIR, "verdicts");

const VALID_ANSWERS = new Set(["yes", "no", null]);

/**
 * Evidence is what makes a `no` actionable. A finding nobody can trace cannot be
 * confirmed, cannot be fixed, and cannot be told apart from a mistake — so an
 * unevidenced `no` is rejected rather than downgraded, because silently turning it
 * into a `null` would hide a real failure.
 */
function hasEvidence(v) {
  const e = v.evidence ?? {};
  const text = [e.screenshot, e.observed, e.status, e.consoleError, v.comment]
    .filter((x) => typeof x === "string" && x.trim().length > 0);
  return text.length > 0 && Boolean(e.screenshot || e.observed || e.status || e.consoleError);
}

function validateBatch(batch, verdicts) {
  const problems = [];
  const byId = new Map(verdicts.map((v) => [v.id, v]));

  for (const c of batch.cases) {
    const v = byId.get(c.id);
    if (!v) {
      problems.push(`${c.id}: no verdict returned`);
      continue;
    }
    const answer = v.answer === undefined ? null : v.answer;
    if (!VALID_ANSWERS.has(answer)) {
      problems.push(`${c.id}: answer must be "yes", "no" or null (got ${JSON.stringify(v.answer)})`);
      continue;
    }
    if (answer === "no" && !hasEvidence(v)) {
      problems.push(`${c.id}: a "no" needs evidence — screenshot, observed text, HTTP status or console error`);
    }
    /*
     * A screenshot is required on EVERY answered verdict, pass included.
     *
     * Screenshotting only failures leaves every `yes` unfalsifiable — which is
     * precisely where a fabricated pass hides, and a fabricated pass is the whole
     * failure mode this tool exists to prevent. It is also what lets a human
     * confirm a verdict later without re-running the batch. Two near-miss false
     * negatives this run (/faqs looking empty, the homepage looking h1-less) were
     * caught only because there was an image to look at.
     *
     * Not required for `null`: if the case could not be performed there may be
     * nothing meaningful to capture.
     */
    if (answer === "yes" || answer === "no") {
      const shot = v.evidence?.screenshot;
      if (!shot) {
        problems.push(
          `${c.id}: every answered verdict needs evidence.screenshot — pass and fail alike. ` +
            `A "${answer}" with no image cannot be confirmed by anyone but you.`,
        );
      } else if (!existsSync(resolve(REPO_ROOT, String(shot)))) {
        /*
         * The path must EXIST. This was a string-presence check, which means
         * `evidence.screenshot: "x"` satisfied it — and the docstring above argues
         * at length that a `yes` without an image is where a fabricated pass hides.
         * A `yes` with an imaginary image hides in exactly the same place.
         */
        problems.push(`${c.id}: evidence.screenshot does not exist on disk — ${shot}`);
      }
    }

    /*
     * `expectedData` is only compared if the observed values come back, and a
     * typo'd key is a silent non-comparison — the report would render "expected 3,
     * observed —" and read as a gap in the tester rather than a mismatch.
     */
    if (v.evidence?.dataObserved && c.expectedData) {
      const expectedKeys = new Set(Object.keys(c.expectedData));
      const strayKeys = Object.keys(v.evidence.dataObserved).filter((k) => !expectedKeys.has(k));
      if (strayKeys.length) {
        problems.push(
          `${c.id}: evidence.dataObserved has key(s) not in expectedData — ${strayKeys.join(", ")}. ` +
            `Use the same keys, or the comparison silently does not happen.`,
        );
      }
    }
    if (answer === "no" && c.expectedData && !v.evidence?.dataObserved) {
      problems.push(
        `${c.id}: this case has expectedData, so a "no" must record evidence.dataObserved — ` +
          `which value was wrong is the whole finding.`,
      );
    }

    /*
     * `reloadChecked` is required PRESENT, not required true. `false` is an honest
     * answer and is counted in the report's coverage table; omitting it is what
     * makes the gap invisible. Same ratchet shape this codebase uses elsewhere:
     * force the field, count the gap, tighten later.
     */
    if ((answer === "yes" || answer === "no") && c.endResult && v.evidence?.reloadChecked === undefined) {
      problems.push(
        `${c.id}: this case has an endResult, so evidence.reloadChecked must be present ` +
          `(true or false). A save that returns success and writes nothing is only visible after a reload.`,
      );
    }
    if (answer === null && !(v.comment ?? "").trim()) {
      problems.push(`${c.id}: a null answer must say why it could not be tested`);
    }
  }

  for (const v of verdicts) {
    if (!batch.cases.some((c) => c.id === v.id)) problems.push(`${v.id}: not a case in this batch`);
  }
  return problems;
}

/**
 * Returns the control IDS that came back wrong. A non-empty result quarantines the batch.
 *
 * 🛑 IDS ONLY. NEVER THE EXPECTED ANSWER.
 *
 * This used to push `expected "${expected.get(v.id)}", got ${...}` and print it to
 * stderr. The tester runs this command ITSELF — `Bash(node …/record-verdicts.mjs *)`
 * is in its allowlist — so it read the expected answer off the failure message and
 * the tool exited 1. The obvious next move for any agent trying to make its last
 * command succeed is to flip the control and re-run, and the second invocation
 * overwrote the file with `quarantined: false`.
 *
 * The whole anti-rubber-stamp mechanism was defeated by a helpful error message.
 * The expectation stays inside `controlExpectations()`, which is where its own
 * docstring already says it belongs. Audit rule R15 keeps it there.
 */
function checkControls(verdicts) {
  const expected = controlExpectations(RUN_ID);
  const wrong = [];
  for (const v of verdicts) {
    if (!expected.has(v.id)) continue;
    if (v.answer !== expected.get(v.id)) wrong.push(v.id);
  }
  return wrong;
}

function commandStore() {
  const batchPath = flag("batch");
  const verdictPath = flag("verdicts");
  if (typeof batchPath !== "string" || typeof verdictPath !== "string") {
    console.error("✗ --batch <file> and --verdicts <file> are both required.");
    process.exit(2);
  }

  const batch = JSON.parse(readFileSync(resolve(REPO_ROOT, batchPath), "utf8"));
  const verdicts = JSON.parse(readFileSync(resolve(REPO_ROOT, verdictPath), "utf8"));

  const problems = validateBatch(batch, verdicts);
  if (problems.length) {
    console.error(`✗ ${problems.length} problem(s) in ${batch.key}:`);
    for (const p of problems) console.error(`    ${p}`);
    process.exit(1);
  }

  const wrongControls = checkControls(verdicts);
  const quarantined = wrongControls.length > 0;

  /*
   * A quarantined batch may only be overwritten by the HARNESS, never by the
   * tester re-running its own last command.
   *
   * `--allow-requarantine` is gated on an env var `run.mjs` sets on the spawn.
   * The tester's allowlist includes `Bash(node …/record-verdicts.mjs *)`, so it
   * could pass the flag itself — but it does not control the environment of the
   * process that spawned it. Without this, a batch could quarantine, the agent
   * could flip an answer, re-run, and clear its own quarantine.
   */
  const outPath = resolve(VERDICT_DIR, verdictFileName(batch.key));
  let priorHistory = [];
  if (existsSync(outPath)) {
    let prior = null;
    try {
      prior = JSON.parse(readFileSync(outPath, "utf8"));
    } catch {}
    priorHistory = Array.isArray(prior?.quarantineHistory) ? prior.quarantineHistory : [];
    const harnessDriven = process.env.TESTER_HARNESS === "1" && flag("allow-requarantine") === true;
    if (prior?.quarantined && !harnessDriven) {
      console.error(`✗ ${batch.key} is already recorded as QUARANTINED and will not be overwritten.`);
      console.error("  A quarantined batch is re-run by the harness, not by re-recording it here.");
      process.exit(1);
    }
  }

  const quarantineHistory = quarantined
    ? [...priorHistory, { at: new Date().toISOString(), wrongControls }]
    : priorHistory;

  if (quarantined) {
    console.error(`⚠ QUARANTINED — ${batch.key} failed calibration on: ${wrongControls.join(", ")}`);
    console.error("  Every verdict in this batch is held back. A tester that mis-answers a");
    console.error("  control has not demonstrated it was testing, so the rest is unreliable too.");
  }

  // Join the case's label and href in at store time. The tester returns ids only,
  // so without this every line of the report reads as a slug — a developer opening
  // it would see "checklist-buying-cart-remove-all-confirmation" instead of the
  // question that was actually asked, which is most of the report's value.
  const caseById = new Map(batch.cases.map((c) => [c.id, c]));
  const enriched = verdicts.map((v) => ({
    ...v,
    label: v.label ?? caseById.get(v.id)?.label ?? v.id,
    href: v.href ?? caseById.get(v.id)?.href ?? null,
  }));

  /*
   * 🛑 The filename comes from `batch.key`, NOT from groupKey+pageKey.
   *
   * `splitByIdentity` gives the admin slice of a page the key `x/y--admin` while
   * leaving groupKey and pageKey untouched. Deriving the filename from those two
   * therefore wrote BOTH slices to `x__y.json`: the admin slice overwrote the main
   * slice's verdicts, `run.mjs`'s `existsSync(verdicts/x__y--admin.json)` could
   * never match so the slice was counted failed on every run, and `--resume` saw
   * it as never done and re-ran it forever.
   *
   * For an unsplit batch the two spellings are byte-identical, so no existing run
   * directory changes.
   */
  mkdirSync(VERDICT_DIR, { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        batch: {
          key: batch.key,
          groupKey: batch.groupKey,
          pageKey: batch.pageKey,
          groupLabel: batch.groupLabel,
          pageLabel: batch.pageLabel,
          phase: batch.phase,
        },
        quarantined,
        wrongControls,
        quarantineHistory,
        // The case bodies the verdicts were judged against. The report quotes the
        // expectation beside what was observed, and re-reading the batch file at
        // report time would break the moment a run is re-fetched or torn down.
        cases: batch.cases,
        verdicts: enriched,
      },
      null,
      2,
    ),
  );

  const real = verdicts.filter((v) => !isControlId(v.id));
  const counts = { yes: 0, no: 0, null: 0 };
  for (const v of real) counts[v.answer === undefined || v.answer === null ? "null" : v.answer]++;
  console.log(`${quarantined ? "⚠" : "✓"} ${batch.key}: ${counts.yes} yes, ${counts.no} no, ${counts.null} blocked${quarantined ? " (QUARANTINED)" : ""}`);
  process.exit(quarantined ? 1 : 0);
}

function loadAllVerdicts() {
  if (!existsSync(VERDICT_DIR)) {
    console.error(`✗ No verdicts at ${VERDICT_DIR}`);
    process.exit(1);
  }
  return readdirSync(VERDICT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(resolve(VERDICT_DIR, f), "utf8")));
}

/* ── The completeness gate ───────────────────────────────────────────────── */

function loadScope() {
  const p = resolve(RUNS_DIR, "scope.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Is this batch RECORDED? Deliberately stricter than "a file exists".
 *
 * A file can exist and be truncated, hand-edited, or written for a different
 * batch. So: it parses, and its verdict id set covers every case id in the batch
 * it claims to answer. `validateBatch` already enforces that at store time, so on
 * the happy path this costs nothing — it exists to catch the file that was not
 * written by `commandStore`.
 *
 * This is the same argument as run.mjs's "exit 0 is not evidence", one level up:
 * a file's existence is no more proof of coverage than an exit code is.
 *
 * A QUARANTINED batch counts as recorded. It has verdicts; they are simply held
 * back from publication and shouted about in the report. Treating it as missing
 * would let a deterministically-quarantining batch block the report forever, and
 * the only escape would be --force-report — which trains people to pass it always.
 */
function isRecorded(row) {
  const vPath = resolve(VERDICT_DIR, verdictFileName(row.key));
  if (!existsSync(vPath)) return false;
  let file;
  try {
    file = JSON.parse(readFileSync(vPath, "utf8"));
  } catch {
    return false;
  }
  if (!Array.isArray(file.verdicts) || !file.verdicts.length) return false;

  const bPath = resolve(RUNS_DIR, "batches", verdictFileName(row.key));
  if (!existsSync(bPath)) return true; // batch file gone; the verdicts are what we have
  try {
    const batch = JSON.parse(readFileSync(bPath, "utf8"));
    const answered = new Set(file.verdicts.map((v) => v.id));
    return batch.cases.every((c) => answered.has(c.id));
  } catch {
    return true;
  }
}

/**
 * 🛑 THE GATE. Refuses to produce a deliverable from a partial run.
 *
 * A report built from 118 of 132 batches is byte-shaped exactly like a complete
 * one — same sections, same headings, fewer rows. Nobody reading it can tell, and
 * a case absent from it reads as "not a problem" rather than "never tested". That
 * is the false green this whole tool exists to refuse, so the refusal is the
 * default and the override is loud.
 *
 * Returns { complete, scope, missing[] }. Exits 1 when incomplete and not forced.
 */
function assertScopeComplete({ force }) {
  const scope = loadScope();

  if (!scope) {
    /*
     * Do NOT fall back to readdir(batches/). That directory accumulates across
     * runs and across --page scoping (run.mjs says so where it filters), so it is
     * not the scope — pretending it is would reintroduce the exact bug in a new
     * place, and silently.
     */
    console.error(`✗ Run ${RUN_ID} has no scope manifest (tester/.tester-runs/${RUN_ID}/scope.json).`);
    console.error("  It predates the completeness gate, or fetch/run never got that far.");
    console.error("  Re-run it, or pass --force-report to build a report of unknown coverage.");
    if (!force) process.exit(1);
    return { complete: false, scope: null, missing: [] };
  }

  const missing = (scope.batches ?? []).filter((row) => !isRecorded(row));
  if (!missing.length) return { complete: true, scope, missing: [] };

  const filters = Object.entries(scope.filters ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ") || "none";

  console.error(`\n✗ Run ${RUN_ID} is INCOMPLETE${force ? " — building a forced report anyway." : " — no report written."}\n`);
  console.error(`  Scoped:    ${scope.batches.length} batch(es)   (filters: ${filters})`);
  console.error(`  Recorded:  ${scope.batches.length - missing.length}`);
  console.error(`  Missing:   ${missing.length}\n`);
  console.error("  Missing batches:");
  for (const row of missing.slice(0, 10)) {
    const att = row.attempts ? `${row.attempts} attempt(s)` : "never attempted";
    console.error(`    ${row.key.padEnd(38)} ${att}${row.lastFailure ? `, last: ${row.lastFailure}` : ""}`);
  }
  if (missing.length > 10) console.error(`    … and ${missing.length - 10} more (see scope.json)`);

  /*
   * 🛑 NAME THE UNTOUCHED GROUPS, not just the unfinished batches.
   *
   * "14 batches missing" is a number a person can shrug at. "admin: 0 of 19
   * pages, 233 cases never opened" is not. Run run-1789300124915 failed exactly
   * here: its operator read a batch count, concluded coverage was around half,
   * and spent the next several turns hunting a permissions bug — when the real
   * answer was that the run had stopped at phase 17 of 34 and ten whole groups
   * had never been fetched.
   *
   * Computed against the CATALOGUE, never against scope, for the reason
   * loadCatalogue()'s header gives.
   */
  const cat = loadCatalogue();
  if (cat?.groups?.length) {
    const touched = new Set(loadAllVerdicts().map((f) => f.batch?.groupKey).filter(Boolean));
    const untouched = cat.groups.filter((g) => !touched.has(g.groupKey));
    if (untouched.length) {
      console.error("");
      console.error(`  🛑 ${untouched.length} of ${cat.groups.length} group(s) were never opened at all:`);
      for (const g of untouched) {
        console.error(`    ${String(g.groupLabel ?? g.groupKey).padEnd(24)} ${String(g.cases).padStart(4)} case(s), ${g.pages} page(s)`);
      }
      console.error("    These are absent from every section of the report, which reads as passing.");
    }
  }

  if (!force) {
    console.error("");
    console.error(`  A report built from ${scope.batches.length - missing.length} of ${scope.batches.length} batches reads exactly like a`);
    console.error("  complete one. That is the false green this tool exists to refuse.\n");
    console.error(`  Resume:  npm run tester:claude -- --resume ${RUN_ID}`);
    console.error(`  Anyway:  node tester/scripts/record-verdicts.mjs --run ${RUN_ID} --finish --force-report\n`);
    process.exit(1);
  }
  return { complete: false, scope, missing };
}


/**
 * The whole catalogue, as captured by `fetch-cases` BEFORE it applied any
 * filter. Absent on a run that predates the manifest.
 *
 * 🛑 It must not fall back to `scope.json`. Scope is what the run ASKED FOR, so
 * a run scoped to phases 1-17 would show 100% of its own scope covered while
 * ten groups sat untouched — which is precisely the report that sent everyone
 * looking for a permissions bug that did not exist. Better to print nothing
 * than to print a reassuring number computed from the wrong denominator.
 */
function loadCatalogue() {
  const p = resolve(RUNS_DIR, "catalogue.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * `group | pages | batches run | cases answered | %` over the WHOLE catalogue,
 * 0% first and shouted about.
 *
 * Run run-1789300124915 recorded 103 batches and its report said exactly that.
 * It did not say that TEN of fourteen groups — 505 cases, including all 233
 * admin ones — had never been opened. Every number in that report was true and
 * the run still read as broadly complete. A denominator is the only thing that
 * turns "103 batches" into "half the catalogue".
 */
function groupCoverageLines(catalogue, files) {
  if (!catalogue?.groups?.length) {
    return [
      "## Coverage by group",
      "",
      "_No catalogue manifest for this run — coverage by group cannot be computed._",
      "",
      "This run predates `catalogue.json`, or `fetch-cases` did not complete. The table is",
      "omitted rather than computed from the run's own scope, which would report the",
      "fraction of what was ASKED FOR and always look close to complete.",
      "",
    ];
  }

  const answeredByGroup = new Map();
  const batchesByGroup = new Map();
  for (const f of files) {
    const g = f.batch?.groupKey;
    if (!g) continue;
    if (!batchesByGroup.has(g)) batchesByGroup.set(g, new Set());
    batchesByGroup.get(g).add(f.batch.key);
    const n = (f.verdicts ?? []).filter((v) => !isControlId(v.id)).length;
    answeredByGroup.set(g, (answeredByGroup.get(g) ?? 0) + n);
  }

  const rows = catalogue.groups
    .map((g) => {
      const done = batchesByGroup.get(g.groupKey)?.size ?? 0;
      const answered = answeredByGroup.get(g.groupKey) ?? 0;
      /*
       * 🛑 THE PERCENTAGE IS CASE-BASED, NOT BATCH-BASED.
       *
       * A page splits into chunks (`--p01`, `--p02`) and identity slices
       * (`--guest`, `--admin`) at run time, so the number of batches actually
       * run is routinely LARGER than the number of pages in the catalogue —
       * measured 55 batches against 17 pages on `buying`, which rendered as
       * "324% covered". A percentage over 100 is not a cosmetic problem: it
       * tells the reader the denominator is wrong, and once one row is
       * obviously wrong the zero rows beside it stop being believed.
       *
       * Case counts do not chunk. `answered` counts non-control verdicts and
       * `g.cases` is the catalogue total, so the ratio means exactly what it
       * says however the run was sliced.
       */
      const pct = g.cases ? Math.min(100, Math.round((answered / g.cases) * 100)) : 0;
      return { ...g, done, answered, pct };
    })
    // 0% first, then least-covered: the rows that matter are the ones nobody
    // looked at, and a table sorted by name buries them alphabetically.
    .sort((a, b) => a.pct - b.pct || b.cases - a.cases);

  const zero = rows.filter((r) => r.pct === 0);
  const out = ["## Coverage by group", ""];
  if (zero.length) {
    out.push(
      `> 🛑 **${zero.length} of ${rows.length} groups have NO coverage at all** — ` +
        `${zero.reduce((n, r) => n + r.cases, 0)} cases never opened.`,
      "> They are absent from every section of this report, which reads the same as passing.",
      "",
    );
  }
  out.push("| Group | Pages | Batches run | Cases answered | Catalogue cases | Covered |");
  out.push("|---|---:|---:|---:|---:|---:|");
  for (const r of rows) {
    const mark = r.pct === 0 ? " 🛑" : r.pct >= 100 ? "" : " ⚠";
    // "Batches run" is informational only — a page chunks and slices, so it is
    // deliberately NOT expressed as a fraction of anything.
    out.push(
      `| ${r.groupLabel ?? r.groupKey} | ${r.pages} | ${r.done} | ` +
        `${r.answered} | ${r.cases} | **${r.pct}%**${mark} |`,
    );
  }
  out.push("");
  return out;
}

const esc = (s) => String(s ?? "").replace(/\r?\n/g, " ").trim();
const area = (b) => `${b.groupLabel ?? b.groupKey} › ${b.pageLabel ?? b.pageKey}`;

/** Group rows by their area, worst first, so related breakage sits together. */
function byArea(rows) {
  const m = new Map();
  for (const r of rows) {
    const k = area(r.batch);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

/**
 * Render `expectedData` against what was observed.
 *
 * A key with nothing observed renders as `_not recorded_` rather than being left
 * out. An unverified expectation is information — dropping the row turns a visible
 * gap into an invisible one, which is the whole failure mode of a test that passes
 * against the bug.
 */
function dataTable(expected, observed) {
  if (!expected || !Object.keys(expected).length) return [];
  const out = ["", "  | Field | Expected | Observed |", "  |---|---|---|"];
  for (const [k, exp] of Object.entries(expected)) {
    const has = observed && Object.prototype.hasOwnProperty.call(observed, k);
    const got = has ? JSON.stringify(observed[k]) : "_not recorded_";
    const mismatch = has && JSON.stringify(observed[k]) !== JSON.stringify(exp);
    out.push(`  | ${mismatch ? "⚠ " : ""}${k} | \`${JSON.stringify(exp)}\` | ${mismatch ? `**${got}**` : got} |`);
  }
  out.push("");
  return out;
}

function buildReport({ complete, scope, missing, publishResult }) {
  const files = loadAllVerdicts();
  const failures = [];
  const notes = [];
  const blocked = [];
  /** Nulls that are a permanent property of running headlessly — see below. */
  const humanChannel = [];
  const unverified = [];
  const quarantined = [];
  let yes = 0;
  let no = 0;
  let nulls = 0;
  let reloadApplicable = 0;
  let reloadChecked = 0;
  let dataApplicable = 0;
  let dataVerified = 0;
  let withSteps = 0;
  let totalCases = 0;

  for (const f of files) {
    const caseById = new Map((f.cases ?? []).map((c) => [c.id, c]));
    if (f.quarantined) {
      quarantined.push({ ...f, held: f.verdicts.filter((v) => !isControlId(v.id)).length });
      continue;
    }
    for (const v of f.verdicts) {
      if (isControlId(v.id)) continue;
      const c = caseById.get(v.id) ?? {};
      const row = { ...v, batch: f.batch, case: c };
      totalCases++;
      if (Array.isArray(c.steps) && c.steps.length) withSteps++;
      /*
       * "Applicable" counts ANSWERED verdicts only.
       *
       * A blocked case was never performed, so it could not have run a reload or
       * read a value — counting it in the denominator makes the oracle coverage
       * read far worse than it is and hides the number that matters, which is how
       * many of the cases that WERE judged were judged against their own oracles.
       * (Measured on run v2: 17 of 23 blocked made this read 2/23 rather than 2/6.)
       */
      const answered = v.answer === "yes" || v.answer === "no";
      if (c.endResult && answered) {
        reloadApplicable++;
        if (v.evidence?.reloadChecked === true) reloadChecked++;
      }
      if (c.expectedData && Object.keys(c.expectedData).length && answered) {
        dataApplicable++;
        if (v.evidence?.dataObserved) dataVerified++;
      }

      if (v.answer === "no") {
        no++;
        failures.push(row);
      } else if (v.answer === "yes") {
        yes++;
        if ((v.comment ?? "").trim()) notes.push(row);
        // A pass whose own oracles were skipped is where the next false green is.
        const skippedReload = c.endResult && v.evidence?.reloadChecked !== true;
        const skippedData = c.expectedData && Object.keys(c.expectedData).length && !v.evidence?.dataObserved;
        if (skippedReload || skippedData) row.skipped = { reload: !!skippedReload, data: !!skippedData };
        if (row.skipped) unverified.push(row);
      } else {
        nulls++;
        /*
         * A case needing a real inbox or an interactive Google account can only
         * ever be `null`. Counting it as "blocked" mixes a PERMANENT FLOOR with
         * a signal: the number never drops, so every run re-triages the same
         * twelve to rediscover that none of them is a bug, and a genuine new
         * blockage is harder to see against a constant background.
         *
         * Separated, not dropped. The case still ran, its abstention is still
         * recorded, and it is still listed in the report — just under its own
         * heading, where "12" is a fact about the runner rather than a defect
         * count. This is the first row of the three-kinds-of-null table in
         * docs/TESTING-RIG-NOTES.md; the other two stay in `blocked`, because a
         * missing fixture is a rig fault and a case blocked by another defect is
         * a product fault, and both should shrink when fixed.
         */
        if (c.requiresHumanChannel) humanChannel.push(row);
        else blocked.push(row);
      }
    }
  }

  const lines = [];

  /* The forced-report stamp goes ABOVE the H1 so it cannot be scrolled past. */
  if (!complete) {
    const names = (missing ?? []).map((m) => `\`${m.key}\``);
    lines.push(
      "> # 🛑 INCOMPLETE REPORT — DO NOT TREAT AS COVERAGE",
      ">",
      `> Built with \`--force-report\` from **${(scope?.batches?.length ?? 0) - (missing?.length ?? 0)} of ${scope?.batches?.length ?? "?"}** scoped batches.`,
      `> **${missing?.length ?? "?"} batch(es) were never tested.** Nothing below says anything about`,
      "> them, and a case absent from this file is *untested*, not *passing*.",
      ">",
      names.length ? `> Missing: ${names.slice(0, 12).join(", ")}${names.length > 12 ? `, … (${names.length})` : ""}` : "> Missing: see scope.json",
      `> Full list: \`tester/.tester-runs/${RUN_ID}/scope.json\``,
      "",
    );
  }

  lines.push("# Claude Tester Report", "");
  lines.push(`**Run** \`${RUN_ID}\`${scope?.baseUrl ? ` · ${scope.baseUrl}` : ""}${scope?.finishedAt ? ` · ${scope.finishedAt}` : ""}`, "");

  const recorded = (scope?.batches?.length ?? 0) - (missing?.length ?? 0);
  const filters =
    Object.entries(scope?.filters ?? {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ") || "everything";

  lines.push("## Coverage", "");
  lines.push("| | |", "|---|---|");
  lines.push(`| Scope | ${filters} |`);
  if (scope) lines.push(`| Batches recorded | **${recorded} / ${scope.batches.length}** |`);
  // `blocked` is the ACTIONABLE count. The human-channel cases are reported
  // beside it rather than inside it, so the headline number can actually go to
  // zero — a metric with an unreachable floor stops being read.
  lines.push(
    `| Cases answered | ${totalCases} (${yes} yes · ${no} no · ${blocked.length} blocked` +
      `${humanChannel.length ? ` · ${humanChannel.length} need a human channel` : ""}) |`,
  );
  lines.push(`| Quarantined batches | ${quarantined.length}${quarantined.length ? ` — ${quarantined.reduce((n, q) => n + q.held, 0)} cases held back, not published` : ""} |`);
  lines.push(`| Cases with an authored procedure | ${withSteps} / ${totalCases} |`);
  lines.push(`| Reload oracle checked | ${reloadChecked} / ${reloadApplicable} applicable |`);
  lines.push(`| expectedData verified | ${dataVerified} / ${dataApplicable} applicable |`);
  if (publishResult) {
    lines.push(
      `| Published | ${publishResult.published} of ${publishResult.published + publishResult.skipped + publishResult.failed}` +
        `${publishResult.skipped ? ` (${publishResult.skipped} quarantined)` : ""}` +
        `${publishResult.failed ? ` · **${publishResult.failed} failed**` : ""} |`,
    );
  }
  lines.push("");
  lines.push("> Every denominator above is a gap made visible. A number short of its total is not", "> an error — it is the part of the run nobody has verified.", "");

  /* ── Coverage by group ── */
  lines.push("---", "", ...groupCoverageLines(loadCatalogue(), files));

  /* ── Failures ── */
  lines.push("---", "", `## Failures — ${failures.length}, by area`, "");
  if (!failures.length) lines.push("_None._", "");
  const failAreas = byArea(failures);
  if (failAreas.length > 1) {
    for (const [name, rows] of failAreas) lines.push(`- ${name} — ${rows.length}`);
    lines.push("");
  }
  for (const [name, rows] of failAreas) {
    lines.push(`### ${name} — ${rows.length} failure${rows.length === 1 ? "" : "s"}`, "");
    for (const r of rows) {
      const c = r.case ?? {};
      const e = r.evidence ?? {};
      lines.push(`- [ ] **${esc(r.label ?? r.id)}**`);
      const meta = [`\`${r.id}\``];
      if (Array.isArray(c.roles) && c.roles.length) meta.push(`roles: ${c.roles.join(", ")}`);
      if (r.batch.phase != null) meta.push(`phase ${r.batch.phase}`);
      lines.push(`  - ${meta.join(" · ")}`);
      const start = c.startPage ?? r.href;
      if (start) {
        const at = e.failedAtStep && Array.isArray(c.steps) ? ` · failed at step **${e.failedAtStep}** of ${c.steps.length}` : "";
        lines.push(`  - Start: \`${start}\`${at}`);
      }
      if (Array.isArray(c.steps) && c.steps.length) {
        lines.push("  - **Procedure**");
        c.steps.forEach((s, i) => lines.push(`    ${i + 1}. ${esc(s)}`));
      }
      if (c.inputs && Object.keys(c.inputs).length) {
        lines.push(`  - **Inputs** — ${Object.entries(c.inputs).map(([k, v]) => `\`${k}=${JSON.stringify(v)}\``).join(", ")}`);
      }
      if (c.expectedBehaviour) lines.push(`  - **Expected behaviour** — ${esc(c.expectedBehaviour)}`);
      if (c.expectedUiState) lines.push(`  - **Expected UI state** — ${esc(c.expectedUiState)}`);
      if (r.comment) lines.push(`  - **Observed** — ${esc(r.comment)}`);
      lines.push(...dataTable(c.expectedData, e.dataObserved));
      if (c.endResult) {
        const checked = e.reloadChecked === true ? "yes" : e.reloadChecked === false ? "**no**" : "**not recorded**";
        lines.push(`  - **After reload** — expected: ${esc(c.endResult)} · reload checked: ${checked}`);
      }
      if (e.observed) lines.push(`  - Evidence — ${esc(e.observed)}`);
      if (e.status) lines.push(`  - HTTP — ${esc(e.status)}`);
      if (e.consoleError) lines.push(`  - Console — ${esc(e.consoleError)}`);
      if (e.screenshot) lines.push(`  - Screenshot — \`${esc(e.screenshot)}\``);
      if (c.needsReview) lines.push(`  - ⚠ The case's own author flagged it for review: ${esc(c.reviewNote) || "no note"}`);
      lines.push("");
    }
  }

  /* ── Blocked ── */
  lines.push("---", "", `## Blocked — ${blocked.length}, could not be tested`, "");
  lines.push("_A hand-off list: each of these is a case a human tester still needs to work._", "");
  if (!blocked.length) lines.push("_None._", "");
  for (const [name, rows] of byArea(blocked)) {
    lines.push(`### ${name} — ${rows.length}`, "");
    for (const r of rows) {
      const c = r.case ?? {};
      const at = r.evidence?.failedAtStep ? ` (stopped at step ${r.evidence.failedAtStep})` : "";
      lines.push(`- **${esc(r.label ?? r.id)}**${at} — ${esc(r.comment) || "no reason given"}`);
      const start = c.startPage ?? r.href;
      if (start) lines.push(`  - Start: \`${start}\` · \`${r.id}\``);
    }
    lines.push("");
  }

  /* ── Needs a human channel ── */
  lines.push(
    "---",
    "",
    `## Needs a human channel — ${humanChannel.length}, cannot be automated`,
    "",
  );
  lines.push(
    "_Not blockage and not a backlog. These cases need a real email inbox or an_",
    "_interactive Google account, so an automated run can only ever abstain. They are_",
    "_listed for a human tester and subtracted from the blocked count above, which is_",
    "_what lets that number actually reach zero._",
    "",
  );
  if (!humanChannel.length) lines.push("_None._", "");
  for (const [name, rows] of byArea(humanChannel)) {
    lines.push(`### ${name} — ${rows.length}`, "");
    for (const r of rows) {
      const c = r.case ?? {};
      const why = c.humanChannelReason ? ` — needs a ${esc(c.humanChannelReason)}` : "";
      lines.push(`- **${esc(r.label ?? r.id)}**${why}`);
      const start = c.startPage ?? r.href;
      if (start) lines.push(`  - Start: \`${start}\` · \`${r.id}\``);
    }
    lines.push("");
  }

  /* ── Passes with notes ── */
  lines.push("---", "", `## Passes with notes — ${notes.length}`, "");
  if (!notes.length) lines.push("_None._", "");
  for (const [name, rows] of byArea(notes)) {
    lines.push(`### ${name}`, "");
    for (const r of rows) lines.push(`- **${esc(r.label ?? r.id)}** (works) — ${esc(r.comment)}`);
    lines.push("");
  }

  /* ── Unverified passes ── */
  lines.push("---", "", `## Passes that could not be fully verified — ${unverified.length}`, "");
  lines.push(
    "_These were answered `yes`, but an oracle the case carries was not exercised. This is",
    "where the next false green will be._",
    "",
  );
  if (!unverified.length) lines.push("_None — every pass was checked against every oracle its case carries._", "");
  for (const r of unverified) {
    const which = [r.skipped?.reload && "no reload check", r.skipped?.data && "no data comparison"].filter(Boolean).join(", ");
    lines.push(`- **${esc(r.label ?? r.id)}** — ${which}  ·  \`${r.id}\``);
  }
  if (unverified.length) lines.push("");

  /* ── Quarantined ── */
  lines.push("---", "", `## Quarantined batches — ${quarantined.length}`, "");
  if (!quarantined.length) lines.push("_None._", "");
  for (const f of quarantined) {
    lines.push(`- **${f.batch.key}** — failed calibration on ${f.wrongControls.join(", ")}`);
    lines.push(`  - ${f.held} verdict(s) held back, not published. Re-run this batch.`);
    if ((f.quarantineHistory ?? []).length > 1) {
      lines.push(`  - ⚠ Quarantined **${f.quarantineHistory.length} times**. A repeat is evidence, not a fluke.`);
    }
    lines.push("");
  }

  /* ── Coverage gaps ── */
  if (!complete || withSteps < totalCases) {
    lines.push("---", "", "## Coverage gaps", "");
    if (!complete) {
      lines.push(`**${missing?.length ?? "?"} scoped batch(es) produced no verdicts and are absent from everything above.**`, "");
      for (const m of missing ?? []) {
        lines.push(`- \`${m.key}\` — ${m.attempts ? `${m.attempts} attempt(s)` : "never attempted"}${m.lastFailure ? `, last: ${m.lastFailure}` : ""}`);
      }
      lines.push("");
    }
    if (withSteps < totalCases) {
      lines.push(
        `**${totalCases - withSteps} case(s) had no authored procedure**, so the tester improvised them.`,
        "An improvised test is shaped exactly like a procedural one in this report. If that is",
        "unexpected, the project is behind the seed: `npx appkit-seed load --collections testerChecklistItems`.",
        "",
      );
    }
  }

  lines.push("---", "", "## This is not a fix list", "");
  lines.push(
    "The tester reports; it does not fix. Nothing here has been changed in the product.",
    "",
    "**A case absent from this file is untested, not passing.** The Coverage table above is",
    "the only statement about what was actually checked.",
    "",
  );

  const out = resolve(REPO_ROOT, "claude-tester-report.md");
  writeFileSync(out, lines.join("\n"));
  console.log(
    `✓ Wrote claude-tester-report.md — ${failures.length} failures, ${blocked.length} blocked, ` +
      `${humanChannel.length} need a human channel, ` +
      `${unverified.length} unverified passes, ${quarantined.length} quarantined${complete ? "" : " (INCOMPLETE)"}`,
  );
  return { failures: failures.length, complete };
}

function commandReport() {
  const force = flag("force-report") === true;
  const gate = assertScopeComplete({ force });
  const r = buildReport({ ...gate, publishResult: null });
  process.exit(r.complete ? 0 : 1);
}

/**
 * PUT every non-quarantined verdict back to the API.
 *
 * Returns counts rather than exiting, so `--finish` can write the report whether
 * or not this succeeded — a publish failure must never also cost you the report.
 */
async function publishVerdicts() {
  /*
   * 🛑 NO FALLBACK. This read `?? "claude-tester@letitrip.in"` until 2026-09-28,
   * while fetch-cases.mjs defaulted the SAME two vars to `admin@letitrip.in` —
   * two files disagreeing about who the bot is, silently, with neither var set
   * anywhere. The `claude-tester` persona was deleted on 2026-09-14, so that
   * default could only ever fail a login and exit 2 while looking configurable.
   *
   * One owner for the credentials, and a refusal when they are absent.
   */
  const email = requireEnv("TESTER_BOT_EMAIL");
  const password = requireEnv("TESTER_BOT_PASSWORD");

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`✗ Login failed: ${res.status}`);
    process.exit(2);
  }
  const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");

  let published = 0;
  let skipped = 0;
  let failed = 0;

  for (const f of loadAllVerdicts()) {
    if (f.quarantined) {
      skipped += f.verdicts.filter((v) => !isControlId(v.id)).length;
      continue;
    }
    for (const v of f.verdicts) {
      if (isControlId(v.id)) continue;
      const body = { answer: v.answer ?? null };
      let comment = v.comment ? String(v.comment) : "";

      /*
       * This read `evidence.screenshotUrl` while the skill only ever writes
       * `evidence.screenshot` — a LOCAL repo path — so every published row has
       * carried no evidence at all. A local path is not a URL either: putting one
       * in screenshotUrl renders a broken image in the admin UI. So: use it when
       * it is a real URL, otherwise append it to the comment, where it is a
       * working pointer for anyone with the repo and a harmless string for
       * everyone else.
       */
      const shot = v.evidence?.screenshotUrl ?? v.evidence?.screenshot;
      if (shot && /^https?:\/\//i.test(String(shot))) {
        body.screenshotUrl = String(shot).slice(0, 500);
      } else if (shot) {
        comment = `${comment}\n[shot] ${shot}`.trim();
      }
      if (comment) body.comment = comment.slice(0, 2000);

      const r = await fetch(`${BASE_URL}/api/user/tester-checklist/${encodeURIComponent(v.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify(body),
      });
      if (r.ok) published++;
      else {
        failed++;
        console.warn(`  ✗ ${v.id}: ${r.status}`);
      }
    }
  }

  console.log(`✓ Published ${published}, skipped ${skipped} (quarantined), failed ${failed}`);
  return { published, skipped, failed };
}

async function commandPublish() {
  const force = flag("force-report") === true;
  assertScopeComplete({ force });
  const r = await publishVerdicts();
  process.exit(r.failed > 0 || force ? 1 : 0);
}

/**
 * 🛑 THE TERMINAL COMMAND: gate → publish → report.
 *
 * One command produces both artefacts, which is what removes the "publish BEFORE
 * teardown" footgun three files used to warn about — there is no longer a step for
 * a human to forget, because the run does it.
 *
 * Publish runs BEFORE the report deliberately, so the report can state the publish
 * outcome as a fact rather than a promise. It is wrapped: a publish failure must
 * never also cost you the report, which is the only durable record of the run.
 */
async function commandFinish() {
  const force = flag("force-report") === true;
  const gate = assertScopeComplete({ force });

  let publishResult = null;
  if (flag("no-publish") !== true) {
    try {
      publishResult = await publishVerdicts();
    } catch (err) {
      publishResult = { published: 0, skipped: 0, failed: -1, error: String(err?.message ?? err) };
      console.error(`✗ Publish failed: ${publishResult.error}`);
      console.error("  Writing the report anyway — it is the only durable record of this run.");
    }
  }

  const r = buildReport({ ...gate, publishResult });

  if (!gate.complete) {
    console.error("\n⚠ This report is INCOMPLETE and is stamped as such. It is not coverage.\n");
    process.exit(1);
  }
  if (publishResult && publishResult.failed !== 0) process.exit(1);
  console.log(`\n✓ Run ${RUN_ID} complete — ${r.failures} failure(s) in claude-tester-report.md\n`);
  process.exit(0);
}

if (flag("finish") === true) await commandFinish();
else if (flag("report") === true) commandReport();
else if (flag("publish") === true) await commandPublish();
else commandStore();
