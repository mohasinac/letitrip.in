#!/usr/bin/env node
/*
 * WHY: An 11-phase plan was approved with an explicit instruction not to stop
 *      between phases, and the session stopped anyway — twice — to report
 *      progress and ask what to prioritise. A written instruction that only
 *      the model remembers is not a mechanism; this is the mechanism.
 * WHAT: A Stop hook that refuses the turn while phases remain, and names the
 *       next one so the continuation has somewhere to go.
 *
 * 🛑 STAND DOWN BY DEFAULT. If the state file is absent, malformed, or marked
 * done, this exits 0 and says nothing. Several sessions run against this repo
 * concurrently, and a Stop hook that blocked every one of them until some
 * unrelated feature finished would be worse than the problem it solves.
 *
 * 🛑 BLOCKING MESSAGES GO TO STDERR. Exit 2 surfaces stderr to the model and
 * discards stdout — `tester-loop-continue.mjs` used `console.log` for all five
 * of its messages and therefore blocked every turn while delivering nothing,
 * for the entire life of the file (CLAUDE.md Root Cause #97). The exit code
 * looked right the whole time, which is why it went unnoticed.
 */

import fs from "node:fs";
import path from "node:path";

const STATE = path.join(process.cwd(), ".claude", "sticker-tracer-phases.json");

/** Exit 2 is "block the turn"; the text must go to stderr to be delivered. */
function block(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

let state;
try {
  state = JSON.parse(fs.readFileSync(STATE, "utf8"));
} catch {
  // No state file, or unreadable. Not our session — say nothing.
  process.exit(0);
}

if (!state || state.active !== true || !Array.isArray(state.phases)) process.exit(0);

const remaining = state.phases.filter((p) => !p.done);

if (remaining.length === 0) {
  process.stderr.write(
    "[sticker-tracer] All phases complete. Remove .claude/sticker-tracer-phases.json to stand this hook down.\n",
  );
  process.exit(0);
}

const done = state.phases.length - remaining.length;
const next = remaining[0];

block(
  [
    `[sticker-tracer] ${done}/${state.phases.length} phases complete — DO NOT STOP.`,
    ``,
    `NEXT: ${next.id} — ${next.title}`,
    ``,
    `Remaining: ${remaining.map((p) => p.id).join(", ")}`,
    ``,
    `Continue working. Mark a phase done by setting done:true in`,
    `.claude/sticker-tracer-phases.json, and rebase the worktree branch onto`,
    `latest main at each phase boundary before moving on.`,
    ``,
    `If genuinely blocked on something only the user can resolve, set`,
    `"active": false in that file and explain why — do not just stop.`,
  ].join("\n"),
);
