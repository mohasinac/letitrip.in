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
const PROGRESS = resolve(REPO, "docs/TESTING-PROGRESS.md");
const PHASE_STATUS = "docs/TESTING-PHASE-STATUS.md";

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
    const r = spawnSync(process.execPath, ["scripts/build-phase-status.mjs", "--quiet"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 30_000,
    });
    return r.status === 0;
  } catch {
    return false;
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

/** Consolidated batch rows, read from the progress document. */
function consolidatedCount() {
  try {
    return readFileSync(PROGRESS, "utf8").split("\n").filter((l) => /^\|\s*`/.test(l)).length;
  } catch {
    return 0;
  }
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

const fixCycleEvery = Number(state.fixCycleEvery ?? 5);
const lastFixAtRecorded = Number(state.lastFixAtRecorded ?? 0);
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
      `  1. Collect this cycle's failures:\n` +
      `       node scripts/triage-findings.mjs --run ${runId} --out docs/TRIAGE-${runId}.md\n` +
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
        `    - re-read suspect findings in docs/TRIAGE-${runId}.md against source\n` +
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

blockWith(
  `▶ TESTER LOOP ACTIVE — run ${runId} · ${pending.keys.length} batch(es) PENDING (continuation ${continuations + 1})\n` +
    `\n` +
    `  Do NOT end the turn. Cases are still pending.\n` +
    `\n` +
    `  NEXT BATCH:  ${nextKey}\n` +
    `\n` +
    `  1. Health gate (FATAL — if it exits 1, set blocked:"firestore-quota" in the\n` +
    `     state file and wait; do not test):\n` +
    `       node tester/scripts/verify-prod-health.mjs\n` +
    `\n` +
    `  2. Work that batch YOURSELF, in THIS session. There is no runner to call:\n` +
    `     run.mjs / pool.mjs / sweep.mjs were deleted 2026-09-14 because each\n` +
    `     spawned one headless Claude session per batch (~300 in one day).\n` +
    `     Nothing under tester/scripts/ may spawn the claude binary again.\n` +
    `       node tester/scripts/fetch-cases.mjs --run ${runId} --page ${nextKey ?? "<key>"} --out <file>\n` +
    `       node tester/scripts/seed-batch-fixtures.mjs --batch ${nextKey ?? "<key>"}   # if it has one\n` +
    `     then drive the browser HERE with the Playwright MCP, and record:\n` +
    `       node tester/scripts/record-verdicts.mjs --run ${runId} --batch <f> --verdicts <f>\n` +
    `       node tester/scripts/seed-batch-fixtures.mjs --batch ${nextKey ?? "<key>"} --teardown\n` +
    `\n` +
    `     🛑 The INSTALLED plugin copy is stale — its SKILL.md predates this flow and\n` +
    `     its scripts/ still contains the deleted harness. Read the repo's\n` +
    `     tester/skills/run-tests/SKILL.md for the procedure; do not invoke the skill.\n` +
    `\n` +
    `  3. A verdict is yes / no / null. "null — could not test" is FIRST CLASS and is\n` +
    `     always better than a guess: a fabricated pass is a false green on a case a\n` +
    `     human would otherwise have run. Every "no" cites evidence.\n` +
    `\n` +
    `  4. RE-VERIFY each failure against live production BEFORE fixing it (Rule #4).\n` +
    `     A route that exists in source but 404s in a report is usually the report.\n` +
    `\n` +
    `  5. Triage by ROOT CAUSE, not per symptom:\n` +
    `       node scripts/triage-findings.mjs --run ${runId} --out docs/TRIAGE-${runId}.md\n` +
    `\n` +
    `  Nothing to hand-increment: this loop ends when every batch in scope.json has\n` +
    `  recorded verdicts, and it recomputes that each turn.\n` +
    `\n` +
    (healthLine ? healthLine + "\n" : "") +
    `  Progress: ${consolidatedCount()} batch rows consolidated\n` +
    `  Status:   ${statusFresh ? `✓ ${PHASE_STATUS} refreshed from disk` : `⚠ could not refresh ${PHASE_STATUS}`}\n` +
    `  Off switch: set active:false in the state file, or delete it.\n`,
);
process.exit(2);
