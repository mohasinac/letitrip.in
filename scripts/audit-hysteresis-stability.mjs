#!/usr/bin/env node
/**
 * audit-hysteresis-stability — a two-threshold latch must not oscillate.
 *
 * ## The bug this exists for
 *
 * `useTabsOverflow` crashed EVERY `/stores/[slug]/*` page in production with
 * React #185 (maximum update depth exceeded). The rule was:
 *
 *     const hasArrows = previous ? overflow > ARROW_SLACK_PX   // stay:  > 64
 *                                : overflow > EPSILON;         // enter: > 1
 *
 * and its stability proof assumed that mounting the arrows changes `overflow`
 * by exactly `ARROW_SLACK_PX`. A CSS rule 100 lines away in another file
 * (`.appkit-tabs-shell[data-arrows="true"] .appkit-tabs-list { scrollbar-width:
 * none }`) also hides the scrollbar when the arrows mount, so the real figure
 * was ~49px. For any strip overflowing by 2..15px the two thresholds each
 * implied the other, forever.
 *
 * ## 🛑 The checkable property — no dataflow analysis required
 *
 * The proof above needed a magnitude the file could not measure. This rule
 * needs none, because oscillation follows from the THRESHOLDS ALONE:
 *
 *   enter (currently off): value > B   ->  turn ON
 *   stay  (currently on):  value > A   ->  stay ON, else turn OFF
 *
 * If **A > B**, then every value v with B < v <= A satisfies "enter" while off
 * and fails "stay" while on. That is a flip every render, and it holds for ANY
 * feedback magnitude including zero — so it is unstable by construction, not
 * by accident of layout.
 *
 * If **A <= B**, no such v exists and the latch is stable for every feedback
 * magnitude. That is the fix: the threshold went from `> 64` to `> -64`.
 *
 * Measured against the real pre-fix and post-fix code by simulating both over
 * feedback magnitudes {0,15,32,49,64} and values -200..200: the old rule
 * oscillates at 0, 15, 32 and 49 and is stable at exactly 64 — the single
 * value its comment assumed. The new rule is stable at all five.
 *
 * ## Scope
 *
 * Deliberately narrow: a conditional expression whose TEST reads a
 * "previous"-ish identifier and whose two branches compare the SAME left-hand
 * expression against two NUMERIC thresholds. Anything it cannot resolve to two
 * numbers is reported as UNRESOLVED rather than skipped silently — a rule that
 * quietly ignores what it cannot parse is how `audit-ciphertext-to-ui` v1
 * printed "clean" over a live bug.
 *
 * Suppression: `// audit-hysteresis-ok: <reason>` on the line, or anywhere in
 * the contiguous comment block directly above it.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const MARKER = "audit-hysteresis-ok";
const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];

/**
 * Named constants this audit can resolve to numbers. A hysteresis is almost
 * always written against named thresholds, so without this the rule would
 * report everything as UNRESOLVED and be useless.
 *
 * Resolved per file from `const NAME = <number>` declarations, so there is no
 * hand-maintained table to drift.
 */
function collectNumericConsts(src) {
  const out = new Map();
  const re = /\bconst\s+([A-Za-z_$][\w$]*)\s*(?::\s*number\s*)?=\s*(-?\d+(?:\.\d+)?)\s*;/g;
  let m;
  while ((m = re.exec(src)) !== null) out.set(m[1], Number(m[2]));
  return out;
}

function resolveNumber(token, consts) {
  const t = token.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (consts.has(t)) return consts.get(t);
  // `-NAME` — the exact shape the fix uses.
  const neg = t.match(/^-\s*([A-Za-z_$][\w$]*)$/);
  if (neg && consts.has(neg[1])) return -consts.get(neg[1]);
  return null;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, p1) => p1);
}

function hasMarker(lines, idx) {
  if ((lines[idx] ?? "").includes(MARKER)) return true;
  for (let i = idx - 1; i >= 0; i--) {
    const line = (lines[i] ?? "").trim();
    const isComment =
      line.startsWith("//") ||
      line.startsWith("/*") ||
      line.startsWith("*") ||
      line.endsWith("*/") ||
      line === "";
    if (!isComment) return false;
    if (line.includes(MARKER)) return true;
  }
  return false;
}

function collect(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === "dist" || e === ".next") continue;
    const full = join(dir, e);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) collect(full, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

/**
 * `prev ? <lhs> <op> <A> : <lhs> <op> <B>`
 *
 * The same `<lhs>` on both sides is what makes the two thresholds comparable;
 * different left-hand sides are two different questions and this rule says
 * nothing about them.
 */
const HYSTERESIS = new RegExp(
  String.raw`\b([A-Za-z_$][\w$.]*)\s*\?\s*([A-Za-z_$][\w$.]*)\s*(>=?)\s*([^?:]+?)\s*:\s*([A-Za-z_$][\w$.]*)\s*(>=?)\s*([^;,)\n]+)`,
  "g",
);

const PREV_HINT = /prev|previous|current|was|is[A-Z]|had/i;

const findings = [];

for (const dir of SCAN_DIRS) {
  for (const file of collect(dir)) {
    const raw = readFileSync(file, "utf8");
    if (!/\?/.test(raw)) continue;
    const code = stripComments(raw);
    const consts = collectNumericConsts(code);
    const rawLines = raw.split("\n");

    let m;
    HYSTERESIS.lastIndex = 0;
    while ((m = HYSTERESIS.exec(code)) !== null) {
      const [full, testVar, lhsA, opA, thrA, lhsB, opB, thrB] = m;
      // Both branches must measure the same thing, and the test must look like
      // "what is the current state" rather than an unrelated condition.
      if (lhsA !== lhsB) continue;
      if (!PREV_HINT.test(testVar)) continue;
      if (opA !== opB) continue;

      const line = code.slice(0, m.index).split("\n").length - 1;
      if (hasMarker(rawLines, line)) continue;

      const a = resolveNumber(thrA, consts);
      const b = resolveNumber(thrB, consts);
      const rel = relative(ROOT, file).replace(/\\/g, "/");

      if (a === null || b === null) {
        findings.push({
          file: rel,
          line: line + 1,
          rule: "UNRESOLVED_HYSTERESIS",
          detail:
            `Could not resolve both thresholds to numbers (stay=\`${thrA.trim()}\`, ` +
            `enter=\`${thrB.trim()}\`). Reported rather than skipped: a latch this ` +
            `audit cannot evaluate is exactly the one nobody else is checking either.`,
          snippet: full.trim().slice(0, 120),
        });
        continue;
      }

      // STAY stricter than ENTER -> every value in (enter, stay] flips forever.
      if (a > b) {
        findings.push({
          file: rel,
          line: line + 1,
          rule: "OSCILLATING_HYSTERESIS",
          detail:
            `stay threshold (${a}) is STRICTER than enter (${b}). Every measured ` +
            `value in (${b}, ${a}] satisfies "enter" while off and fails "stay" ` +
            `while on, so it flips every render — for ANY feedback magnitude, ` +
            `including zero. Make the stay threshold <= the enter threshold.`,
          snippet: full.trim().slice(0, 120),
        });
      }
    }
  }
}

if (findings.length === 0) {
  console.log("audit-hysteresis-stability: clean ✓");
  process.exit(0);
}

console.error(`audit-hysteresis-stability: ${findings.length} finding(s)\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  [${f.rule}]`);
  console.error(`    ${f.detail}`);
  console.error(`    ${f.snippet}\n`);
}
console.error(`Suppression: // ${MARKER}: <reason>`);
process.exit(1);
