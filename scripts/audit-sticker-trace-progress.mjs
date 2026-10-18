#!/usr/bin/env node
/*
 * WHY: The stated requirement is "even if we fail we know which stage it died
 *      in". A stage that never reports is indistinguishable from a hang, and
 *      the gap only shows up on the day something breaks inside that stage —
 *      i.e. exactly when the information is needed and too late to add.
 * WHAT: Three rules over the sticker-trace progress channel.
 *
 *   R1  Every `stage:` passed to emitProgress names a real TRACE_STAGES member
 *       (or the two bookends, `queued` / `done`). A typo is silent: the node
 *       publishes a stage string no client maps, and the bar sits still.
 *   R2  Every member of TRACE_STAGES is emitted by at least one call site.
 *       🛑 PRECONDITION — see below.
 *   R3  No module may write the RTDB channel directly. One emitter, or the
 *       `updatedAt` key `cleanupRtdbEvents` prunes on gets written by a second
 *       path that forgets it, and that node is then pinned forever.
 *
 * 🛑 R2 HAS A PRECONDITION AND SAYS SO OUT LOUD.
 *
 * The emitter ships in Phase 5; its call sites are the coordinator, shard and
 * finalizer, which ship in Phase 7. Until those exist there is nothing to
 * cover, and a coverage rule over zero call sites passes trivially.
 *
 * A rule that goes quiet is as likely to have stopped looking as to have been
 * satisfied (Root Cause #84), so this one PRINTS its own state on every run and
 * names the file whose arrival activates it. It must never be possible to read
 * "clean" here and believe coverage was checked.
 *
 * Strict-zero on R1 and R3, no suppression marker: a stage either reports or
 * it does not.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APPKIT = path.join(ROOT, "appkit", "src");
const TYPES = path.join(
  APPKIT,
  "_internal/shared/features/sticker-trace/types.ts",
);
const EMITTER = path.join(
  APPKIT,
  "_internal/server/features/sticker-trace/progress.ts",
);
/*
 * 🛑 R2's precondition is THIS FILE existing, not "any call site exists".
 *
 * The first version gated on call-site count, and that was keyed on the wrong
 * signal: `actions.ts` legitimately emits `queued` and nothing else — starting
 * a run is not tracing it — so the moment that landed, R2 activated and
 * reported ten missing pipeline stages against a coordinator that does not
 * exist yet. A second confident, wrong backlog from the same rule.
 *
 * The coordinator is the module whose JOB is to walk decode -> exports, so its
 * existence is what makes "are all stages covered" a question with a real
 * answer. Phase 7 creates it.
 */
const COORDINATOR = path.join(
  APPKIT,
  "_internal/server/features/sticker-trace/coordinator.ts",
);

/** Strip comments so a documented example can never satisfy a rule. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const violations = [];

// -- the stage union, read from source rather than restated here ------------
if (!fs.existsSync(TYPES)) {
  console.error(`audit-sticker-trace-progress: cannot find ${path.relative(ROOT, TYPES)}`);
  process.exit(2);
}
const typesSrc = fs.readFileSync(TYPES, "utf8");
const unionBlock = /export const TRACE_STAGES = \[([\s\S]*?)\] as const;/.exec(typesSrc);
if (!unionBlock) {
  console.error("audit-sticker-trace-progress: TRACE_STAGES not found — did the union move?");
  process.exit(2);
}
const stages = [...unionBlock[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
const legal = new Set([...stages, "queued", "done"]);

if (stages.length === 0) {
  console.error("audit-sticker-trace-progress: TRACE_STAGES parsed EMPTY — refusing to pass");
  process.exit(2);
}

// -- scan ------------------------------------------------------------------
const emitterRel = path.relative(ROOT, EMITTER).replace(/\\/g, "/");
const files = [...walk(APPKIT), ...walk(path.join(ROOT, "src"))];
const emitted = new Set();
let callSites = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const src = stripComments(fs.readFileSync(file, "utf8"));

  // R1 + R2 — every `stage:` inside an emitProgress call.
  for (const m of src.matchAll(/emitProgress\s*\(\s*\{([\s\S]{0,400}?)\}\s*\)/g)) {
    const body = m[1];
    const stageMatch = /\bstage:\s*"([^"]+)"/.exec(body);
    if (!stageMatch) continue; // a variable stage — reported below, not guessed at
    /*
     * 🛑 The emitter's OWN internal calls are not call sites.
     *
     * `emitPartProgress` is a named wrapper inside progress.ts and carries a
     * literal `stage: "parts"`. Counting it activated R2 the moment the
     * emitter landed and reported ten missing stages against a module whose
     * consumers do not exist yet — a confident, wrong backlog. R1 still
     * applies here, because a typo in the wrapper's own literal is a real bug.
     */
    if (rel !== emitterRel) callSites++;
    const stage = stageMatch[1];
    if (!legal.has(stage)) {
      violations.push(
        `${rel}: emitProgress stage "${stage}" is not a TRACE_STAGES member ` +
          `(nor queued/done). A client maps no such stage, so the bar stops moving.`,
      );
    } else {
      emitted.add(stage);
    }
  }

  // R3 — only the emitter may touch the channel.
  if (rel !== emitterRel && /RTDB_PATHS\.STICKER_TRACE/.test(src)) {
    const prunerOk = rel.endsWith("jobs/core/cleanupRtdbEvents.ts");
    if (!prunerOk) {
      violations.push(
        `${rel}: writes/reads RTDB_PATHS.STICKER_TRACE directly. Route it through ` +
          `emitProgress — a second writer is how the \`updatedAt\` key ` +
          `cleanupRtdbEvents prunes on goes missing and the node is pinned forever.`,
      );
    }
  }
}

// -- R2, with its precondition stated -------------------------------------
const emitterExists = fs.existsSync(EMITTER);
let coverageActive = false;

if (!emitterExists) {
  violations.push(
    `the emitter is missing at ${emitterRel} — R1/R3 have nothing to anchor to.`,
  );
} else if (!fs.existsSync(COORDINATOR)) {
  console.log(
    "audit-sticker-trace-progress: 🛑 R2 (stage coverage) is INACTIVE — the\n" +
      `  coordinator does not exist yet (${path.relative(ROOT, COORDINATOR).replace(/\\/g, "/")}).\n` +
      `  It is the module that walks decode -> exports, so until it lands there is\n` +
      `  nothing that SHOULD emit all ${stages.length} stages. Phase 7 creates it and\n` +
      `  activates this rule. Right now ${callSites} call site(s) exist and this audit\n` +
      "  proves NOTHING about stage coverage.",
  );
} else {
  coverageActive = true;
  const missing = stages.filter((s) => !emitted.has(s));
  for (const s of missing) {
    violations.push(
      `TRACE_STAGES member "${s}" is never emitted by any emitProgress call. ` +
        `A stage that does not report is indistinguishable from a hang.`,
    );
  }
}

if (violations.length > 0) {
  console.error(`\naudit-sticker-trace-progress: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error("");
  process.exit(1);
}

console.log(
  `audit-sticker-trace-progress: clean — ${stages.length} stage(s) declared, ` +
    `${callSites} literal call site(s), coverage ${coverageActive ? "CHECKED" : "NOT checked"}.`,
);
