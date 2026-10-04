#!/usr/bin/env node
/*
 * Stop hook: keep the sequential tester phase loop going.
 *
 * Exit 0 -> the turn ends normally; anything printed goes to the human on stdout.
 * Exit 2 -> the turn is BLOCKED and this script's **stderr** is fed back to the
 *           assistant as its next instruction. Use `blockWith()`, never
 *           `console.log`. This header said "stdout" and was wrong for the whole
 *           life of the file, which is exactly how five messages ended up on the
 *           stream nobody reads.
 *
 * 🛑 WHY THIS EXISTS. Across one session the user had to type "continue", "why
 * stop?" and "do not stop" repeatedly, because the assistant treats writing a
 * status summary as a turn boundary. A memory entry was written about it and the
 * behaviour recurred anyway. A note is not a mechanism; this is the mechanism.
 *
 * 🛑 THIS SCRIPT CAN RE-INVOKE THE ASSISTANT INDEFINITELY. Three independent
 * safeguards, because a runaway loop here costs real money and real rate limit:
 *
 *   1. DEFAULT OFF. No state file, unreadable state file, or `active` anything
 *      other than exactly `true` -> exit 0. It can never switch itself on, and a
 *      corrupt file fails toward silence rather than toward spinning.
 *   2. AN OFF SWITCH A HUMAN CAN REACH IN ONE STEP. Delete the file, or set
 *      `active: false`. No code edit, no restart.
 *   3. A HARD BOUND. `continuations` increments on every fire; at
 *      `maxContinuations` it stands down loudly. The bound should never be
 *      reached — that is exactly why it must exist.
 *
 * The state file is also what makes the loop survive a context compaction: the
 * assistant does not have to remember which phase it is on, because the hook
 * tells it. That is the difference between a loop that resumes and one that
 * restarts from the beginning.
 *
 * 🛑 THERE IS DELIBERATELY NO `stop_hook_active` GUARD HERE, and it must stay that
 * way. Its sibling `check-on-stop.mjs` has one and needs it — an audit gate that
 * re-fires on its own block would spin. But for a CONTINUATION hook, firing on the
 * stop after its own block IS the mechanism; exiting 0 there would kill the loop on
 * its first iteration. `maxContinuations` is the bound that replaces it.
 *
 * ── MODES ─────────────────────────────────────────────────────────────────────
 * `mode` in the state file selects what is being continued. Default "tester", so a
 * state file written before plan mode behaves exactly as it always did.
 *
 *   "tester"  the phase loop (original behaviour)
 *   "plan"    a plan's ordered step list, read from a snapshot in the run dir
 *   "both"    both tracks, with the quota and health checks acting as a ROUTER:
 *             test while there is budget and production is healthy, otherwise
 *             advance the plan — code work reads no Firestore, so it is exactly
 *             what should continue when testing cannot.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { budgetStatus, formatDuration, ESTIMATED_READS_PER_BATCH } from "../../tester/scripts/lib/quota-budget.mjs";

const REPO = process.cwd();
const STATE = resolve(REPO, "tester/.tester-runs/loop-state.json");

/*
 * Test Run 3's documents. The three this used to point at — TESTING-PROGRESS.md,
 * TESTING-PHASE-STATUS.md and the TRIAGE-*.md family — were deleted with the
 * older runs' artifacts on 2026-09-28, along with the four scripts that wrote
 * them. A hook that names a deleted script fails silently in a try/catch and
 * reports "⚠ could not refresh", which reads as a transient glitch forever.
 */
/*
 * 🛑 DERIVED from the active run, not hard-coded to run 3.
 *
 * This was the literal "docs/TEST-RUN-3.md", so the hook reported refreshing
 * that document every turn while the loop was driving run-4 — which was true
 * of the spawns below until they were fixed, and then became a LIE about which
 * file had moved. `scripts/lib/test-run.mjs` already derives the per-run
 * document name the same way (`docs/TEST-RUN-${n}.md`); this mirrors it so the
 * status line names the file that actually changed.
 */
const CHECKLIST_DOC = (() => {
  try {
    const id = String(JSON.parse(readFileSync(STATE, "utf8")).runId ?? "");
    const n = /^run-(\d{1,3})$/.exec(id)?.[1];
    if (n) return `docs/TEST-RUN-${n}.md`;
  } catch {
    /* fall through to the historical default */
  }
  return "docs/TEST-RUN-3.md";
})();
const AUDIT_DOC = resolve(REPO, "docs/TEST-RUN-3-AUDIT.md");
const STATUS_SCRIPT = "scripts/test-run-status.mjs";
const TABLE_SCRIPT = "scripts/test-run-table.mjs";
const BATCHES_PER_CYCLE = 5;
const DEPLOY_EVERY_BATCHES = 25;

/**
 * Refresh the per-phase status file from the verdict files on disk.
 *
 * 🛑 Done HERE, on every fire, and not left to the assistant alone. A status
 * written as prose in a transcript is unreadable a day later and drifts every
 * time it is retyped — in one session a hand-kept tally reported 17 failures
 * where the verdict files held 15, because the prose had been counting
 * calibration controls. The file this writes counts from disk, so the numbers
 * cannot drift; the assistant is separately told to write the NARRATIVE at each
 * phase end, which is the part a script cannot produce.
 *
 * Never throws and never blocks: a reporting aid that can fail the loop would be
 * worse than no reporting aid.
 */
function refreshPhaseStatus() {
  try {
    /*
     * The active run, re-read from the state file on each call — see the longer
     * note beside the TABLE_SCRIPT spawn below for why it is read here rather
     * than closed over from the module-level `runId` (temporal dead zone: the
     * first of this function's two call sites runs before that declaration).
     *
     * BOTH spawns need it. Fixing only the table still left the COUNTER writing
     * to the finished run's document every turn, which is most of what the
     * operator was seeing.
     */
    let activeRun = process.env.TEST_RUN_ID ?? "";
    try {
      activeRun = String(JSON.parse(readFileSync(STATE, "utf8")).runId ?? activeRun);
    } catch {
      /* no state file, or unreadable — fall back to the env/default behaviour */
    }
    const runEnv = activeRun ? { env: { ...process.env, TEST_RUN_ID: activeRun } } : {};

    const r = spawnSync(process.execPath, [STATUS_SCRIPT, "--quiet"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 30_000,
      ...runEnv,
    });
    /*
     * 🛑 The TABLE is refreshed here too, for the same reason the counter is.
     *
     * The hook told the assistant to "append the rows" at each cycle boundary
     * and nothing did — five batches and 26 cases went by with a live counter
     * above an empty document. Appending by hand was never going to hold
     * anyway: a second append doubles every row, and a verdict corrected later
     * sits next to its own stale copy.
     *
     * `test-run-table.mjs` REPLACES the block from the verdict files, so it is
     * idempotent and cannot drift from them. Failure is deliberately not fatal:
     * a hook that blocks the turn because a document could not be rewritten
     * stops the run over its own bookkeeping.
     */
    /*
     * 🛑 REGENERATE THE ACTIVE RUN'S TABLE, NOT WHATEVER THE SCRIPT DEFAULTS TO.
     *
     * This spawned with no TEST_RUN_ID, so `test-run-table.mjs` fell back to
     * run-3 and rewrote docs/TEST-RUN-3.md on EVERY turn — of a run that
     * finished at 255/255 and whose verdicts cannot change again. The only
     * thing that moved was its "Last updated" stamp, so each turn left a
     * one-line no-op diff in the working tree, and anyone watching that file
     * for progress saw a date tick while the run they were actually on
     * (run-4) looked frozen. Reported 2026-10-04 by the operator, who was
     * right: "run 4 has not updated a long and 3 gets dates only".
     *
     * 🛑 `runEnv` is computed at the top of this function rather than taken
     * from the module-level `runId`, which is declared well below here and
     * would be in its temporal dead zone: refreshPhaseStatus() is called
     * twice, and the FIRST call happens before that declaration. Closing over
     * it would turn this reporting aid into a ReferenceError on every turn —
     * the exact failure the "never throws and never blocks" note above exists
     * to prevent.
     */
    spawnSync(process.execPath, [TABLE_SCRIPT], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 30_000,
      ...runEnv,
    });
    return r.status === 0;
  } catch {
    return false;
  }
}

/**
 * The run, counted from disk. Never from prose, and never from this file.
 *
 * 🛑 An earlier run's hand-kept tally reported 17 failures where the verdict
 * files held 15 — it had been counting calibration controls, and nothing could
 * catch it, because the only other copy of the number WAS the prose. Every
 * figure the hook prints comes through here.
 *
 * Returns null rather than throwing: a reporting aid that can kill the loop
 * would be worse than no reporting aid.
 */
function runTally() {
  try {
    const r = spawnSync(process.execPath, [STATUS_SCRIPT, "--json"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 30_000,
    });
    if (r.status !== 0) return null;
    return JSON.parse(String(r.stdout ?? "null"));
  } catch {
    return null;
  }
}

/** Phase 1 progress, read straight off the ledger's own rows. */
function auditProgress() {
  try {
    if (!existsSync(AUDIT_DOC)) return null;
    const rows = readFileSync(AUDIT_DOC, "utf8")
      .split("\n")
      .filter((l) => /^\|\s*`[^`/]+\/[^`]+`\s*\|/.test(l));
    if (rows.length === 0) return null;
    const done = rows.filter((l) => /\|\s*(audited|rewritten)\s*\|/.test(l)).length;
    const inFlight = rows.find((l) => /\|\s*in-flight\s*\|/.test(l));
    const nextPending = rows.find((l) => /\|\s*pending\s*\|/.test(l));
    const keyOf = (l) => l?.match(/^\|\s*`([^`]+)`/)?.[1] ?? null;
    return { total: rows.length, done, inFlight: keyOf(inFlight), next: keyOf(nextPending) };
  } catch {
    return null;
  }
}

/**
 * Stand down silently. Used for every ambiguous case.
 *
 * 🛑 Refreshes the phase-status file on the way out. The quiet exits — bound
 * reached, quota paused, production blocked — are precisely when a human comes
 * looking at the status, so leaving it stale on those paths would be backwards.
 * Skipped only when there is no state file at all, since then there is no run.
 */
function standDown(reason) {
  if (existsSync(STATE)) refreshPhaseStatus();
  if (reason) console.log(reason);
  process.exit(0);
}

/**
 * Block the stop and hand the assistant its next instruction.
 *
 * 🛑 THE MESSAGE MUST GO TO STDERR. Exit 2 surfaces **stderr** to the model —
 * `check-on-stop.mjs` has always done this correctly (`process.stderr.write`), and
 * this file did not: every one of its five messages used `console.log`, so for its
 * entire life the loop blocked the turn and delivered NOTHING. The harness reported
 * it plainly — "[tester-loop-continue.mjs]: No stderr output" — a blocked turn with
 * no instruction, which is the worst of both behaviours.
 *
 * Exists as one function so the next message added cannot reintroduce it. Exit 0
 * paths (`standDown`) keep using stdout: those are for the human reading the
 * terminal, not instructions for the model.
 */
function blockWith(message) {
  process.stderr.write(message.endsWith("\n") ? message : message + "\n");
  process.exit(2);
}

if (!existsSync(STATE)) standDown();

let state;
try {
  state = JSON.parse(readFileSync(STATE, "utf8"));
} catch {
  standDown("tester loop: state file is unreadable — standing down (delete it to silence this).");
}

// `=== true` and not a truthy check: "false", 0 and "" must all mean off.
if (state?.active !== true) standDown();

const runId = String(state.runId ?? "");
const nextPhase = Number(state.nextPhase ?? 0);
const totalPhases = Number(state.totalPhases ?? 35);
const continuations = Number(state.continuations ?? 0);
const maxContinuations = Number(state.maxContinuations ?? 500);

/*
 * Mode. "tester" is the original behaviour and stays the default, so a state file
 * written before plan mode existed behaves exactly as it did.
 *
 *   tester -> drive the phase loop (unchanged)
 *   plan   -> drive the plan's step list; no quota gate, because code work reads
 *             no Firestore and must keep moving while a run is paused
 *   both   -> the two tracks in the plan. Test when there is quota and production
 *             is healthy; otherwise advance the plan. That is the same decision a
 *             human would make, and it is why the budget check is a ROUTER here
 *             rather than a stop.
 */
const mode = String(state.mode ?? "tester");
const planStep = String(state.planStep ?? "");
const planSteps = Array.isArray(state.planSteps) ? state.planSteps.map(String) : [];
const planPath = String(state.planPath ?? "tester/.tester-runs/plan-snapshot.md");

/*
 * A runId is the only requirement now. `nextPhase` used to be part of this gate,
 * back when the loop counted phases and the assistant hand-incremented one after
 * each. Batches are worked in-session one at a time, so "what is left" is read
 * from the run itself — see outstandingBatches() — and a phase number is neither
 * needed nor trustworthy.
 */
const testerModeUsable = Boolean(runId);

if (mode === "fix-then-test" && !Array.isArray(state.fixQueue)) {
  standDown(
    `tester loop: mode "fix-then-test" but no fixQueue array in the state file — standing down.\n` +
      `  An ABSENT queue is not an empty one: absent means nobody wrote the list, and\n` +
      `  treating it as empty would flip straight to testing with every defect unfixed.`,
  );
}

if (mode === "tester" && !testerModeUsable) {
  standDown("tester loop: state file has no runId — standing down.");
}
if ((mode === "plan" || mode === "both") && !planStep) {
  standDown(`tester loop: mode "${mode}" but no planStep in the state file — standing down.`);
}

if (continuations >= maxContinuations) {
  standDown(
    `🛑 tester loop: hit maxContinuations (${maxContinuations}) and is standing down.\n` +
      `   This bound exists to stop a runaway; reaching it means something is wrong.\n` +
      `   Inspect ${STATE}, then raise maxContinuations or set active:false.`,
  );
}

/** Persist the incremented counter before exiting 2, or the bound never advances. */
function bump(extra = {}) {
  try {
    writeFileSync(
      STATE,
      JSON.stringify({ ...state, ...extra, continuations: continuations + 1, updatedAt: new Date().toISOString() }, null, 2),
    );
  } catch {
    /* a failed write must not crash the hook — worst case the bound advances slowly */
  }
}

/**
 * Pull ONE step out of the plan snapshot.
 *
 * 🛑 Deliberately returns only the matching line and the lines indented under it.
 * A Stop hook that dumps a 1,400-line plan into stderr on every fire is worse than
 * no hook — the instruction that matters gets buried in the one place the assistant
 * is guaranteed to read.
 *
 * Falls back to the bare step id: a missing or renamed snapshot must not stop the
 * loop, it just makes the reminder less useful.
 */
function planStepDetail(stepId) {
  try {
    const lines = readFileSync(resolve(REPO, planPath), "utf8").split("\n");
    /*
     * Anchored match first — that is the step's own line in a single-column list.
     *
     * Then a MID-LINE fallback, because the execution block lays the two tracks out
     * side by side ("A2  work them…   B2  the known 500s…"). Anchoring alone found
     * every A-track step and no B-track one, so the hook reported
     * "(not found in the snapshot)" for exactly half the plan — an instruction-less
     * block, which is the same failure as writing to the wrong stream.
     */
    /*
     * 🛑 ESCAPE the step id before it becomes a regex. `L+` is a real step name
     * and `+` is a quantifier — unescaped it compiles to "one or more L", which
     * matches the wrong line or throws. Every id goes through here.
     */
    const id = stepId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    /*
     * Strip the markdown a step id is DECORATED with before matching. The plan
     * writes steps three ways — `| **G2** | …` in the stage table, `**G2 — …**`
     * as a paragraph lead, and bare `G2  …` in a two-column block — and an
     * anchor of `^\s{0,4}G2\b` sees none of the first two. That silently
     * produced "(not found in the snapshot)", i.e. a block with no instruction,
     * which is the same failure mode as writing to the wrong stream (RC #97).
     */
    const bare = (l) => l.replace(/^[\s|*_>#-]+/, "");
    const anchored = new RegExp(`^${id}\\b`);
    const midline = new RegExp(`\\s${id}\\s{2,}\\S`);
    const starts = [];
    lines.forEach((l, i) => {
      if (anchored.test(bare(l)) || midline.test(l)) starts.push(i);
    });
    if (!starts.length) return null;

    /*
     * A step id appears MORE THAN ONCE — once as a one-line row in the stage
     * table, once as the paragraph that actually explains it. `findIndex` takes
     * the first, and the table always comes first, so the reminder used to be
     * the summary rather than the instructions. Take whichever match yields the
     * most prose; a table row yields exactly one line and always loses.
     */
    const blockAt = (start) => {
      const isTableRow = lines[start].trimStart().startsWith("|");
      const indent = lines[start].match(/^\s*/)[0].length;
      const out = [lines[start].trim()];
      for (let i = start + 1; i < lines.length; i++) {
        const l = lines[i];
        if (!l.trim()) break;
        // A paragraph's continuation lines are NOT indented in this plan, so an
        // indent test alone would stop at line one. Stop at the next heading,
        // the next table row, or the next bolded step lead instead.
        if (isTableRow) break;
        if (/^\s*(#|\||```|---)/.test(l)) break;
        if (l.match(/^\s*/)[0].length < indent) break;
        out.push("    " + l.trim());
      }
      return out;
    };
    let best = blockAt(starts[0]);
    for (const s of starts.slice(1)) {
      const b = blockAt(s);
      if (b.length > best.length) best = b;
    }
    return best.join("\n");
  } catch {
    return null;
  }
}

/** Emit the plan-mode instruction and block the stop. Never returns. */
function planContinue(why) {
  const idx = planSteps.indexOf(planStep);
  const position = idx >= 0 ? `step ${idx + 1} of ${planSteps.length}` : "step";
  const nextUp = idx >= 0 && idx + 1 < planSteps.length ? planSteps[idx + 1] : null;
  const detail = planStepDetail(planStep);

  bump({ blocked: null });
  blockWith(
    `▶ PLAN LOOP ACTIVE — ${planStep} (${position}, continuation ${continuations + 1})\n` +
      (why ? `  Routed here because: ${why}\n` : "") +
      `\n` +
      `  Do NOT end the turn. The plan is not finished.\n` +
      `\n` +
      `  CURRENT STEP — ${planStep}:\n` +
      (detail ? detail.split("\n").map((l) => "    " + l).join("\n") + "\n" : `    (not found in ${planPath})\n`) +
      `\n` +
      `  When it is genuinely done, set planStep=${nextUp ?? "(last — set active:false)"} in\n` +
      `  ${STATE}. The hook never infers completion: it reports what the state says,\n` +
      `  because a hook that guesses skips work, and skipped work here means an\n` +
      `  unfixed data-loss bug.\n` +
      `\n` +
      `  Every code change carries its CLAUDE.md edit in the SAME change — the plan's\n` +
      `  documentation table says which section.\n` +
      `\n` +
      `  🛑 STOP AND ASK instead of continuing if: a question to the user is pending,\n` +
      `  or the next action is a publish, deploy, reseed or any Firestore write.\n` +
      `  Permission to deploy is not permission to deploy unattended.\n` +
      `\n` +
      `  Full plan: ${planPath}\n` +
      `  Off switch: set active:false in the state file, or delete it.\n`,
  );
  process.exit(2);
}

/**
 * Batch rows recorded, counted from the VERDICT FILES rather than the document.
 *
 * 🛑 This read `docs/TESTING-PROGRESS.md` and counted its table rows until
 * 2026-09-28 — i.e. it counted the prose, which is the artifact most likely to
 * be wrong and the one a human edits by hand. Counting the document to report on
 * the document is circular: it can only ever confirm what someone typed.
 */
function consolidatedCount() {
  const t = runTally();
  if (t) return t.batchesDone;
  try {
    return readFileSync(resolve(REPO, CHECKLIST_DOC), "utf8").split("\n").filter((l) => /^\|\s*`/.test(l)).length;
  } catch {
    return 0;
  }
}

/* ── fix-then-test mode ──────────────────────────────────────────────────────
 *
 * Two phases, in order, driven entirely from the state file:
 *
 *   phase "fix"   drain `fixQueue` — every known defect — and do NOT test.
 *   phase "test"  re-drive the recorded failures AND the blocked cases.
 *
 * 🛑 The phases are separate ON PURPOSE, and the ordering is the whole point.
 * Interleaving them is what made the previous cycle expensive: a fix shipped
 * mid-run is not exercised by the batches already recorded, so the run ends
 * carrying failures whose fix nobody re-drove, and the next run re-finds them.
 * Fix everything first, deploy once, then test once against a build that has
 * all of it.
 *
 * The flip is MECHANICAL — `fixQueue` empty means phase "test" — so the
 * assistant cannot declare itself done early, and cannot forget to move on.
 * The hook never infers that an entry is fixed; removing it from the queue is
 * an explicit edit, for the same reason `planStep` is.
 */
function fixThenTestContinue() {
  const queue = Array.isArray(state.fixQueue) ? state.fixQueue.map(String) : [];
  const phase = queue.length > 0 ? "fix" : "test";

  if (phase === "fix") {
    const head = queue[0];
    bump({ blocked: null, phase: "fix" });
    blockWith(
      `▶ FIX PHASE — ${queue.length} defect(s) outstanding (continuation ${continuations + 1})\n` +
        `\n` +
        `  Do NOT end the turn, and do NOT run tester batches yet. Testing happens\n` +
        `  only once the queue is empty, against a build that carries every fix.\n` +
        `\n` +
        `  NEXT: ${head}\n` +
        `\n` +
        `  Remaining: ${queue.slice(1).join(" · ") || "(none — this is the last one)"}\n` +
        `\n` +
        `  For each: find the ROOT CAUSE, fix it, and sweep for the same shape\n` +
        `  elsewhere — every defect this run has produced more than one instance.\n` +
        `  Record it in the findings md file as you go.\n` +
        `\n` +
        `  When one is genuinely fixed, REMOVE it from fixQueue in ${STATE}.\n` +
        `  The hook never infers completion — an entry leaves the queue only when\n` +
        `  you take it out, because a hook that guesses skips an unfixed bug.\n` +
        `\n` +
        `  🛑 A fix is not done because it typechecks. It is done when the failing\n` +
        `  behaviour has been re-driven, or when you have said plainly that it has\n` +
        `  not been.\n` +
        `\n` +
        `  Off switch: set active:false in the state file.\n`,
    );
  }

  bump({ blocked: null, phase: "test" });
  blockWith(
    `▶ TEST PHASE — fixQueue is empty (continuation ${continuations + 1})\n` +
      `\n` +
      `  Every queued fix is done. Now re-drive the SUPERSET:\n` +
      `    • every case recorded "no"    → tester/.tester-runs/pass2-failed-ids.txt\n` +
      `    • every case recorded null    → tester/.tester-runs/pass2-blocked-ids.txt\n` +
      `\n` +
      `  Blocked cases are included deliberately. Many were blocked BY the defects\n` +
      `  just fixed — a save that wrote nothing blocks every case downstream of it —\n` +
      `  so a run that re-tests only the failures leaves that coverage unrecovered.\n` +
      `\n` +
      `  Rules that do not change: drive the UI, screenshot every verdict, a "no"\n` +
      `  needs evidence, and null stays first-class. A case that still cannot be\n` +
      `  tested is null again with the reason — not a guess.\n` +
      `\n` +
      `  Prerequisite: production must carry the fixes. If it does not, deploy\n` +
      `  first — testing a build without them re-records the same failures.\n` +
      `\n` +
      `  Off switch: set active:false in the state file.\n`,
  );
}

if (mode === "fix-then-test") {
  fixThenTestContinue();
}

/* ── audit mode — Test Run 3 Phase 1 ────────────────────────────────────────
 *
 * Drive the page-by-page catalogue audit from docs/TEST-RUN-3-AUDIT.md.
 *
 * 🛑 THE LEDGER IS THE STATE, NOT THIS FILE. The next page is read off the
 * document every fire, so a compaction loses nothing and there is no counter to
 * hand-increment — the same argument as tester mode reading pending batches from
 * the verdict files rather than from a phase number somebody typed.
 *
 * No quota gate and no health gate: the audit reads source, not Firestore, and
 * is exactly what should continue while a run is paused for either reason.
 */
if (mode === "audit") {
  const a = auditProgress();
  if (!a) {
    standDown(
      `tester loop: mode "audit" but docs/TEST-RUN-3-AUDIT.md has no page rows.\n` +
        `  Generate it: node scripts/test-run-build-audit-ledger.mjs`,
    );
  }
  if (!a.inFlight && !a.next) {
    standDown(
      `✓ audit loop: all ${a.total} pages are audited or rewritten.\n` +
        `  Phase 1 exit gate:\n` +
        `    npm run check\n` +
        `    npx appkit-seed delete --yes --collections testerChecklistItems\n` +
        `    npx appkit-seed load  --collections testerChecklistItems\n` +
        `    node tester/scripts/fetch-cases.mjs --run ${runId || "run-3"}\n` +
        `  Then switch mode to "tester" in ${STATE} and Phase 2 begins.`,
    );
  }
  bump({ blocked: null });
  const page = a.inFlight ?? a.next;
  blockWith(
    `▶ AUDIT LOOP ACTIVE — ${a.done}/${a.total} pages done (continuation ${continuations + 1})\n` +
      `\n` +
      `  Do NOT end the turn. ${a.total - a.done} page(s) remain. A status summary is\n` +
      `  not a turn boundary — end on a tool call that advances disk state.\n` +
      `\n` +
      (a.inFlight
        ? `  🛑 RESUME: ${page} is marked in-flight — a previous turn stopped inside it.\n` +
          `     Re-read it from the top rather than trusting a partial pass.\n\n`
        : `  NEXT PAGE: ${page}\n\n`) +
      `  1. Mark it in-flight in docs/TEST-RUN-3-AUDIT.md.\n` +
      `\n` +
      `  2. Read the overlay and its catalogue entries:\n` +
      `       appkit/src/features/tester/seed-data/authored/${String(page).replace("/", "__")}.ts\n` +
      `\n` +
      `  3. Read THE ACTUAL SOURCE it tests — the route under src/app/[locale]/**, its\n` +
      `     view component, its API route. Not the old docs, and not CLAUDE.md's\n` +
      `     description of the feature: those being out of date is WHY this phase exists.\n` +
      `\n` +
      `  4. Per case, check the six parts against what the code does — startPage\n` +
      `     resolves, steps name controls that still exist, inputs are literal and\n` +
      `     their fixture ids still seeded, expectedBehaviour/expectedUiState quote\n` +
      `     text the code actually renders, expectedData is readable off the screen,\n` +
      `     endResult names what survives a reload. Rewrite what drifted, in place.\n` +
      `\n` +
      `  5. npm run check green — tsc is the real per-field gate, since AuthoredCase\n` +
      `     declares its six fields non-optional and the audits do not check presence.\n` +
      `\n` +
      `  6. Mark audited or rewritten, with a one-line note on what changed.\n` +
      `\n` +
      `  🛑 A PRODUCT defect noticed here goes to docs/TEST-RUN-3-OUTOFSCOPE.md and is\n` +
      `     NOT fixed. Phase 1 changes cases, not features.\n` +
      `\n` +
      `  Procedure: .claude/skills/test-run-loop/SKILL.md\n` +
      `  Off switch: set active:false in ${STATE}, or delete it.\n`,
  );
}

/* ── Pure plan mode ────────────────────────────────────────────────────────
 *
 * Straight to the plan step. No quota gate and no production-health gate: code
 * work reads no Firestore and is exactly what SHOULD continue while a run is
 * paused — the loop's own blocked message already says "prepare fixes" as the
 * useful thing to do meanwhile.
 */
if (mode === "plan") {
  if (planSteps.length && planSteps.indexOf(planStep) === planSteps.length - 1) {
    standDown(
      `✓ plan loop: ${planStep} is the last step in planSteps.\n` +
        `  Set active:false in ${STATE} once it is done.`,
    );
  }
  planContinue();
}

/* ── What is still pending? ──────────────────────────────────────────────────
 *
 * The loop's whole job is "do not end the turn while cases are pending", so the
 * gate has to be PENDING CASES — not a phase counter that someone increments by
 * hand and that says nothing about whether a batch actually recorded.
 *
 * Delegated to `next-batch.mjs` rather than reimplemented here, because that
 * script already owns the definition of "recorded", and it is deliberately
 * stricter than "a verdict file exists": the file must parse AND its verdict ids
 * must cover every case in the batch. Two copies of that rule would drift, and
 * the copy that drifted would be the one silently skipping batches.
 *
 * It spawns nothing (that is its stated purpose), so calling it from a hook that
 * runs every turn costs one short node process and carries no session risk.
 */
function outstandingBatches() {
  const r = spawnSync(
    process.execPath,
    ["tester/scripts/next-batch.mjs", "--run", runId, "--all"],
    { cwd: REPO, encoding: "utf8", timeout: 60_000 },
  );
  /*
   * stdout is one batch key per line and nothing else — next-batch.mjs sends all
   * commentary to stderr for exactly this reason.
   *
   * Matched on SHAPE (`group/page`, optionally `--guest`/`--p02`, optionally the
   * `[has fixtures]` marker) rather than by skipping known prefixes. The prefix
   * approach is what broke this: the "nothing outstanding" hint line
   * `node tester/scripts/record-verdicts.mjs …` has no ✓, so it counted as a
   * pending batch and a finished run could never release the loop. A positive
   * shape test cannot be fooled by a line nobody anticipated.
   */
  const keys = String(r.stdout ?? "")
    .split("\n")
    .map((l) => l.trim().replace(/\s*\[has fixtures\]\s*$/, ""))
    .filter((l) => /^[a-z0-9-]+\/[a-z0-9-]+(--[a-z0-9]+)*$/.test(l));
  return { keys, failed: r.status !== 0 && keys.length === 0, stderr: String(r.stderr ?? "") };
}

const pending = outstandingBatches();

/*
 * ── The SECOND half of the loop's job: a fix cycle every N batches ───────────
 *
 * "Finish every batch" alone produces a run that discovers fifty bugs and ships
 * none of them, and every batch after the first keeps retesting a known-broken
 * build. So the gate is BOTH: do not end the turn while cases are pending, and
 * do not keep testing while findings are unshipped.
 *
 * `recorded` is DERIVED — total scope minus what next-batch still lists — never
 * a counter anyone increments. A hand-maintained counter is precisely what the
 * old `nextPhase` bookkeeping got wrong: it drifted from the verdicts it claimed
 * to describe, and nothing reported the drift.
 *
 * `lastFixAtRecorded` is the only stored half, and it moves exactly once per
 * cycle — when the fixes are shipped and re-verified.
 */
function scopeTotal() {
  try {
    const p = resolve(REPO, "tester/.tester-runs", runId, "scope.json");
    return (JSON.parse(readFileSync(p, "utf8")).batches ?? []).length;
  } catch {
    return 0;
  }
}

/*
 * 🛑 Default 25, and it MUST equal `deployEveryBatches`.
 *
 * It defaulted to 5, which is the cycle length rather than the milestone
 * interval — so the gate demanded a fix-and-ship after five batches while the
 * agreed publish cadence was twenty-five, and the state file had to override it
 * by hand. Since 2026-09-29 the two are one event by design: fixes land in a
 * single phase AT the deploy, because an appkit fix is not live on production
 * until then and cannot be re-driven before it. A fix phase on any other
 * cadence produces fixes nobody can verify.
 */
const fixCycleEvery = Number(state.fixCycleEvery ?? 25);
const lastFixAtRecorded = Number(state.lastFixAtRecorded ?? 0);
/*
 * 🛑 The deploy gate needs its own marker, for the same reason the fix gate has
 * one. `deployDue` below is pure arithmetic — `doneCount % 25 === 0` — with no
 * memory of whether a deploy actually happened, so at batch 50 it re-fired on
 * every turn until batch 51 was recorded, long after the milestone shipped.
 *
 * That is not merely noise: `test-run-milestone.mjs` opens with
 * `npm version patch` on appkit, so obeying a stale prompt publishes a version
 * with NO source change behind it. At milestone 2 the deploy was done by hand
 * (appkit 4.42.3 + scripts/deploy.mjs, smoke and SEO green) and the prompt kept
 * demanding it — one compliant re-run would have shipped 4.42.4 for nothing.
 */
const lastDeployAtRecorded = Number(state.lastDeployAtRecorded ?? 0);
const recorded = Math.max(0, scopeTotal() - pending.keys.length);
const sinceLastFix = recorded - lastFixAtRecorded;
/*
 * Due on the cadence — OR at the end of the run with anything at all unfixed.
 *
 * The second half is not a detail. Without it a run whose last batches land
 * mid-cadence (say 2 short of 5) stands down with those findings never triaged
 * and never shipped: the cadence says "not yet", and then there is no "later".
 * Caught by writing the expected exit code for that state before the code.
 */
const fixCycleDue =
  fixCycleEvery > 0 &&
  (sinceLastFix >= fixCycleEvery || (pending.keys.length === 0 && sinceLastFix > 0));

/*
 * A scope we cannot read is NOT "nothing left to do". Standing down here would
 * silently end the run on a typo'd runId or a missing manifest, which reads
 * exactly like success. Block and say so instead.
 */
if (pending.failed) {
  bump({ blocked: null });
  blockWith(
    `▶ TESTER LOOP — could not determine what is pending for run ${runId}.\n\n` +
      `  next-batch.mjs did not return a batch list. That is NOT the same as\n` +
      `  "the run is finished" — fix it before ending the turn.\n\n` +
      (pending.stderr ? pending.stderr.trim().split("\n").map((l) => "    " + l).join("\n") + "\n\n" : "") +
      `    node tester/scripts/next-batch.mjs --run ${runId} --all\n\n` +
      `  Off switch: set active:false in ${STATE}.\n`,
  );
}

/* ── Finished? ───────────────────────────────────────────────────────────────
 *
 * Only once the LAST fix cycle has been run. Standing down with findings still
 * unshipped would end the run on exactly the work it exists to produce.
 */
if (pending.keys.length === 0 && !fixCycleDue) {
  standDown(
    `✓ tester loop: every batch in run ${runId} has recorded verdicts.\n` +
      `  Run the final gate, then set active:false in ${STATE}:\n` +
      `    node tester/scripts/record-verdicts.mjs --run ${runId} --finish\n` +
      `  It must write a report WITHOUT --force-report. Anything less means a batch never recorded.`,
  );
}

/* ── Fix cycle due? ────────────────────────────────────────────────────────── */
if (fixCycleDue) {
  bump({ blocked: null });
  blockWith(
    `▶ FIX CYCLE DUE — run ${runId} · ${recorded} batch(es) recorded, ${sinceLastFix} since the last fix\n` +
      `\n` +
      `  Do NOT test another batch. ${pending.keys.length} remain, and they will keep\n` +
      `  re-finding whatever is already broken until it ships.\n` +
      `\n` +
      `  1. Collect EVERYTHING outstanding — three sources, not one:\n` +
      `       node ${STATUS_SCRIPT}          # open defects, computed from disk\n` +
      `       state.fixQueue in ${STATE}\n` +
      `         └─ G5 overflows: diagnosed, evidenced, each with a recorded nextStep.\n` +
      `            These are the ones a per-batch gate could never have cleared.\n` +
      `       docs/TEST-RUN-3-OUTOFSCOPE.md\n` +
      `         └─ real findings no case owned. Promote to a gap case or leave\n` +
      `            standing — but DECIDE, per entry. An untouched list is a list\n` +
      `            nobody reads by milestone three.\n` +
      `\n` +
      `     Also re-drive every ledger entry marked reverified:pending-deploy —\n` +
      `     those fixes are on disk and were never verifiable, because an appkit\n` +
      `     change is not live until this deploy. That list is the whole reason\n` +
      `     fixing waits for this phase.\n` +
      `\n` +
      `  2. ROOT-CAUSE each one to a file and line — not a symptom. RE-VERIFY it\n` +
      `     against live production first (Rule #4): a route that 404s in a report\n` +
      `     is usually the report.\n` +
      `\n` +
      `  3. Fix it. Add the audit or the tester case if the class can recur.\n` +
      `\n` +
      `  4. npm run check must exit 0.\n` +
      `\n` +
      `  5. SHIP what the fix needs:\n` +
      `       src/ only        → node scripts/deploy.mjs\n` +
      `       appkit/          → commit, bump, build, npm publish, POLL npm until\n` +
      `                          installable (4-7 min is propagation, NOT a failed\n` +
      `                          publish — never republish), repin, rebuild\n` +
      `                          functions/lib, then deploy\n` +
      `       function/trigger → FUNCTIONS_DISCOVERY_TIMEOUT=120 npm run firebase deploy -- --only functions\n` +
      `\n` +
      `  6. RE-DRIVE the failed case against production and confirm it now passes.\n` +
      `     A fix nobody re-tested is a hypothesis.\n` +
      `\n` +
      `  7. Then, and only then, set lastFixAtRecorded=${recorded} in ${STATE}.\n` +
      `     That marker is what releases this gate — nothing else advances it.\n` +
      `\n` +
      `  Off switch: set active:false in the state file, or delete it.\n`,
  );
}

/* ── Daily free-tier budget ────────────────────────────────────────────────
 *
 * 🛑 THE RUN MUST NOT TAKE PRODUCTION DOWN FOR REAL USERS.
 *
 * The tester drives real page loads, and those read Firestore on the same project
 * the live site uses. On 2026-09-11 a run consumed 47K of the 50K daily reads and
 * production began serving 500s — the run did not merely spend its own budget, it
 * broke the site for everyone and then recorded the wreckage as defects.
 *
 * So the loop stops itself at HALF the daily quota, leaving the rest for real
 * visitors, scheduled Functions and the admin surfaces.
 */
const budget = budgetStatus(state);
if (budget.exhausted && mode === "both") {
  /*
   * Two tracks, and one of them costs no quota. Testing is out of budget for the
   * day, so advance the plan instead of idling — this is the router the plan's
   * "Track A / Track B" split exists for.
   */
  planContinue(
    `testing is out of daily quota (${budget.used}/${budget.limit} batches, ` +
      `resets in ${formatDuration(budget.resetInMs)}) — code work costs none`,
  );
}
if (budget.exhausted) {
  bump({ blocked: "daily-quota-budget" });
  blockWith(
    `⏸ TESTER LOOP PAUSED — daily free-tier budget reached
` +
      `
` +
      `  ${budget.used}/${budget.limit} batches run today (Pacific day ${budget.today}),
` +
      `  about ${budget.estimatedReadsUsed.toLocaleString()} Firestore reads of the 50,000/day free tier.
` +
      `  The remaining half is deliberately left for real visitors and scheduled jobs.
` +
      `
` +
      `  Quota resets in ${formatDuration(budget.resetInMs)} (midnight America/Los_Angeles).
` +
      `
` +
      `  DO NOT run another phase today. Wait with a harness-tracked background job:
` +
      `    Bash(run_in_background: true):
` +
      `      node -e "setTimeout(()=>process.exit(0), ${budget.resetInMs})" && echo QUOTA_RESET
` +
      `
` +
      `  Work that costs no quota meanwhile: re-verify suspect findings against source,
` +
      `  prepare fixes, keep npm run check green.
`,
  );
  process.exit(2);
}

/* ── Blocked? Re-check rather than trusting a stale flag ───────────────────── */
let blocked = state.blocked ?? null;
let healthLine = "";
if (blocked) {
  const health = spawnSync(process.execPath, ["tester/scripts/verify-prod-health.mjs", "--json"], {
    cwd: REPO,
    encoding: "utf8",
    timeout: 60_000,
  });
  let healthy = false;
  try {
    healthy = JSON.parse(String(health.stdout ?? "{}")).healthy === true;
  } catch {
    healthy = false;
  }
  if (healthy) {
    blocked = null;
    healthLine = "  Health:   ✓ RECOVERED — the block has cleared, resume testing";
  } else if (mode === "both") {
    /*
     * Production is degraded, so testing would record evidenced-and-wrong verdicts
     * — but the code track is unaffected and is the right thing to do while
     * waiting. Route rather than idle.
     */
    planContinue(`production is still degraded (${blocked}) — testing now would record wrong verdicts`);
  } else {
    bump({ blocked });
    /*
     * Still blocked. Exit 2 so the loop stays alive, but tell the assistant to
     * WAIT rather than test — a tight spin here would burn turns and rate limit
     * for hours while production is down.
     */
    blockWith(
      `⏸ TESTER LOOP BLOCKED — ${blocked}\n` +
        `\n` +
        `  Production is still degraded. DO NOT run a phase: every verdict recorded\n` +
        `  now would be evidenced and wrong.\n` +
        `\n` +
        `  Do this instead — a harness-tracked background wait that notifies on exit,\n` +
        `  so the loop continues without spinning:\n` +
        `\n` +
        `    Bash(run_in_background: true):\n` +
        `      until node tester/scripts/verify-prod-health.mjs >/dev/null 2>&1; do sleep 600; done; echo RECOVERED\n` +
        `\n` +
        `  While waiting, useful work that needs NO quota:\n` +
        `    - re-read the open defects (node ${STATUS_SCRIPT}) against source\n` +
        `    - continue the Phase 1 page audit — it reads no Firestore at all\n` +
        `    - prepare (do not apply) fixes for the confirmed-real ones\n` +
        `    - keep npm run check green\n`,
    );
    process.exit(2);
  }
}

/* ── Normal: tell the assistant exactly what to run next ───────────────────── */
bump({ blocked: null });
const statusFresh = refreshPhaseStatus();

const nextKey = pending.keys[0];
const t = runTally();

/*
 * Milestone awareness. The cycle is 5 batches and the deploy is every 25, and
 * both are computed from the recorded count rather than tracked by hand — the
 * same argument as everything else here: a counter kept in prose is a counter
 * that has already drifted.
 */
const doneCount = t?.batchesDone ?? 0;
const openDefects = t?.open ?? 0;
const sinceCycle = doneCount % BATCHES_PER_CYCLE;
const cycleDue = doneCount > 0 && sinceCycle === 0;
const deployDue =
  doneCount > 0 &&
  doneCount % DEPLOY_EVERY_BATCHES === 0 &&
  lastDeployAtRecorded < doneCount;

const milestone = deployDue
  ? `  🛑 DEPLOY MILESTONE DUE — ${doneCount} batches recorded.\n` +
    `       node scripts/test-run-milestone.mjs\n` +
    `     Standing authorisation for this run only. Do it BEFORE the next batch, so\n` +
    `     later batches test the fixed code.\n` +
    `     Then set lastDeployAtRecorded=${doneCount} in ${STATE} — that marker is what\n` +
    `     releases this prompt, exactly as lastFixAtRecorded releases the fix gate.\n` +
    `     Without it the gate re-fires every turn, and obeying a stale one publishes\n` +
    `     an appkit patch with no source change behind it.\n` +
    `\n` +
    `     ▸ CHECK BEFORE RUNNING IT, or you ship that empty patch yourself. The\n` +
    `       script decides by git-diffing the appkit submodule against\n` +
    `       lastMilestoneSha, so a pointer that was already PUBLISHED outside a\n` +
    `       milestone still reads as changed and it bumps anyway:\n` +
    `         node -e "const a=require('./appkit/package.json').version,\\\n` +
    `           p=require('./package.json').dependencies['@mohasinac/appkit'];\\\n` +
    `           console.log(a,p)"   &&  npm view @mohasinac/appkit version\n` +
    `       Local version == pin == npm latest, with a clean appkit tree?\n` +
    `       Then pass --skip-appkit. Bumping would publish a version identical in\n` +
    `       source to the one already live.\n` +
    `     ▸ The marker asserts a VERIFIED deploy. Set it only after the smoke test\n` +
    `       of /, /en/products and /api/site-settings passes — a green Vercel build\n` +
    `       is not proof the site runs (Root Cause #69: READY, 500 on every route).\n` +
    `       Never set it to silence this prompt.\n\n`
  : cycleDue
    ? `  ▸ CYCLE COMPLETE — ${doneCount} batches. Do NOT hand-write rows into\n` +
      `    ${CHECKLIST_DOC} — this hook already regenerated its table from the\n` +
      `    verdict files. To refresh it yourself: node scripts/test-run-table.mjs\n` +
      `    (idempotent; --check exits 1 when the document is stale).\n` +
      `    Neither a row nor a count is ever typed; both come from disk.\n\n`
    : "";

/*
 * 🛑 CHANGED 2026-09-29, at the user's direction: an open defect NO LONGER
 * blocks the next batch. Testing and fixing are separate phases.
 *
 * This used to read "no batch advances until they are fixed and re-driven",
 * which is the rule the run started with. In practice it made every batch a
 * mixed workload — drive two cases, then spend the rest of the turn tracing a
 * defect through four layers, rebuilding appkit, and re-running the gate — and
 * the fixes could not be verified anyway, because an appkit change is not live
 * on production until the deploy milestone. So each one was recorded
 * `pending-deploy` and re-driven at batch 25 regardless. The per-batch gate was
 * buying nothing that the milestone was not already going to buy.
 *
 * Now: a batch RECORDS. Batches 1–25 accumulate verdicts, then one fix phase
 * clears the whole backlog at the milestone, where the publish and deploy make
 * the fixes re-drivable in the same pass. `fixCycleEvery === deployEveryBatches
 * === 25` is what ties the two together, and the two must stay equal — a fix
 * phase without a deploy leaves every fix unverifiable, which is the state this
 * change exists to stop paying for.
 *
 * WHAT IS GIVEN UP, stated plainly: batches 2–25 run against code that does not
 * carry batch 1's fixes, so a later batch can rediscover a defect an earlier one
 * already found. That is why every ledger entry carries the batch number and
 * `reverified: pending-deploy` — the re-drive list at the milestone is computed,
 * not remembered.
 *
 * The defect count is still surfaced on every continuation, because a number
 * nobody sees is a number that drifts (G2). It is now information, not a gate.
 */
const defectLine =
  openDefects > 0
    ? `  ▸ ${openDefects} open defect(s) recorded — NOT a blocker. Fixes happen in one\n` +
      `    phase at the batch-${fixCycleEvery} milestone, together with the deploy that\n` +
      `    makes them re-drivable. Keep testing; do not start fixing mid-batch.\n` +
      `     node ${STATUS_SCRIPT}          # lists them\n\n`
    : "";

blockWith(
  `▶ TESTER LOOP ACTIVE — run ${runId} · ${pending.keys.length} batch(es) PENDING (continuation ${continuations + 1})\n` +
    `\n` +
    `  Do NOT end the turn. Cases are still pending. A status summary is not a turn\n` +
    `  boundary — end on a tool call that advances disk state.\n` +
    `\n` +
    defectLine +
    milestone +
    `  NEXT BATCH:  ${nextKey}\n` +
    `\n` +
    `  0. FIRST, always — a batch may have died mid-flight:\n` +
    `       node scripts/test-run-inflight.mjs --check\n` +
    `     Non-zero means tear down and RESTART that batch from case 1. Never resume:\n` +
    `     nothing on disk can establish the fixtures are in the state case N expects.\n` +
    `\n` +
    `  1. Preflight (FATAL — health, stale plugin cache, read budget, check):\n` +
    `       node scripts/test-run-preflight.mjs\n` +
    `\n` +
    `  2. Work that batch YOURSELF, in THIS session. There is no runner to call:\n` +
    `     run.mjs / pool.mjs / sweep.mjs were deleted 2026-09-14 because each\n` +
    `     spawned one headless Claude session per batch (~300 in one day).\n` +
    `     Nothing under tester/scripts/ may spawn the claude binary again.\n` +
    `       node tester/scripts/fetch-cases.mjs --run ${runId} --page ${nextKey ?? "<key>"} --out <file>\n` +
    `       node scripts/test-run-inflight.mjs --start ${nextKey ?? "<key>"} --identity <role>\n` +
    `       node tester/scripts/seed-batch-fixtures.mjs --batch ${nextKey ?? "<key>"}   # if it has one\n` +
    `     then drive the browser HERE with the Playwright MCP, and record:\n` +
    `       node tester/scripts/record-verdicts.mjs --run ${runId} --batch <f> --verdicts <f>\n` +
    `       node tester/scripts/seed-batch-fixtures.mjs --batch ${nextKey ?? "<key>"} --teardown\n` +
    `       node scripts/test-run-inflight.mjs --done\n` +
    `\n` +
    `  3. A verdict is yes / no / null. "null — could not test" is FIRST CLASS and is\n` +
    `     always better than a guess: a fabricated pass is a false green on a case a\n` +
    `     human would otherwise have run. Every "no" cites evidence, and EVERY\n` +
    `     verdict — passes included — carries a screenshot that exists on disk.\n` +
    `\n` +
    `  4. RE-VERIFY each failure against live production BEFORE fixing it (Rule #4).\n` +
    `     A route that exists in source but 404s in a report is usually the report.\n` +
    `     Any "this whole page is empty" claim is re-driven from a fresh navigation\n` +
    `     first — a previous run recorded two brand pages as empty and they held 20\n` +
    `     and 8 products.\n` +
    `\n` +
    `  5. A fix must NAME the case that found it, and is appended to\n` +
    `     tester/.tester-runs/${runId}/fixes.jsonl. Anything noticed that no case\n` +
    `     found goes to docs/TEST-RUN-3-OUTOFSCOPE.md and is NOT chased.\n` +
    `\n` +
    `  Procedure: tester/skills/run-tests/SKILL.md (batch) ·\n` +
    `             .claude/skills/test-run-loop/SKILL.md (cycle)\n` +
    `\n` +
    `  Nothing to hand-increment: this loop ends when every batch in scope.json has\n` +
    `  recorded verdicts, and it recomputes that each turn.\n` +
    `\n` +
    (healthLine ? healthLine + "\n" : "") +
    (t
      ? `  Progress: ${t.batchesDone}/${t.batchesTotal || "?"} batches · ${t.casesDone}/${t.casesTotal || "?"} cases · ` +
        `pass ${t.pass} fail ${t.fail} null ${t.abstain}\n`
      : `  Progress: ${consolidatedCount()} batch(es) recorded\n`) +
    `  Status:   ${statusFresh ? `✓ ${CHECKLIST_DOC} counter refreshed from disk` : `⚠ could not refresh ${CHECKLIST_DOC}`}\n` +
    `  Off switch: set active:false in the state file, or delete it.\n`,
);
process.exit(2);
