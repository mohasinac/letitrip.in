#!/usr/bin/env node
/*
 * Strongly-connected components in appkit's module graph — i.e. import cycles.
 *
 * A cycle is not merely untidy: a bundler cannot resolve it incrementally, and
 * it makes "which module owns this symbol" unanswerable, so every tool that
 * walks the graph (including the deep-import work this was written for) has to
 * special-case it.
 *
 * Measured at introduction, 2026-10-11: 14 components, 105 of 2,382 modules
 * trapped, largest 43 — `ui/components/*` importing into `features/media/*`
 * and `features/media/*` importing back into `ui/components/*`.
 *
 * 🛑 THIS IS A REPORTER WITH A RATCHET, NOT A STRICT-ZERO AUDIT. Breaking a
 * 43-module component is a real refactor, so the current counts are recorded
 * below and only a REGRESSION fails. Lower them as cycles are broken; never
 * raise them.
 *
 * Usage:
 *   node scripts/audit-import-cycles.mjs            enforce the ratchet
 *   node scripts/audit-import-cycles.mjs --list     print every cycle's members
 *
 * @tag domain:build
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "appkit/src");
const LIST = process.argv.includes("--list");

/*
 * The ratchet. Lower these as cycles are broken; a rise fails the audit.
 *
 * 2026-10-11: first measured 14 / 105 / 43 — but 3 of those 14 were artefacts of
 * not stripping comments (see stripComments below), so the real figure was
 * 11 / 98 / 43. Breaking the five relative self-imports of a package entry
 * (`../../../client`, `../../../..`) took it to 10 / 94 / 43 and dropped
 * server.ts's own graph from 2,067 modules to 1,509.
 *
 * 2026-10-13: the 43-module component's back-edge was nine `features/media/*`
 * files importing `ui/components/*` symbols via the `../../ui` BARREL instead
 * of each symbol's defining module (Root Cause #18) — `MediaImage.tsx`,
 * `AvatarUpload.tsx`, `MediaAvatar.tsx`, `MediaLightbox.tsx`,
 * `MediaPickerModal.tsx`, `MediaVideo.tsx`. Pointing each import at its
 * defining file (`Div.tsx`, `Layout.tsx`, `Typography.tsx`, `Button.tsx`,
 * `Input.tsx`, `Alert.tsx`, `Progress.tsx`, `Toast.tsx` — none of which import
 * back into `features/media` or the barrel) took it to 9 / 72 / 30 — a real
 * reduction, not a workaround, since the barrel re-export was never part of
 * appkit's public API contract for these internal cross-feature imports.
 */
const MAX_COMPONENTS = 9;
const MAX_TRAPPED = 72;
const MAX_LARGEST = 30;

function resolveSpec(from, spec) {
  if (!spec.startsWith(".")) return null;
  const base = resolve(dirname(from), spec);
  for (const c of [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (existsSync(c)) return c;
  }
  return null;
}

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(resolve(p));
  }
})(ROOT);

/*
 * 🛑 STRIP COMMENTS FIRST.
 *
 * The first version of this audit did not, and reported
 * `instrumentation/index.ts` as a self-referencing module on the strength of a
 * JSDoc EXAMPLE: ` * import { createInstrumentation } from "./";`. A graph that
 * counts documentation as an edge invents cycles, and an audit with a known
 * false positive is one people learn to ignore. Same mistake
 * `audit-observability-registration` made by matching a commented-out
 * registration.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(Math.max(0, m.length - p1.length)));
}

/* Adjacency over relative imports only — a bare specifier leaves the package. */
const adj = new Map();
for (const f of files) {
  const out = new Set();
  let src = "";
  try {
    src = stripComments(readFileSync(f, "utf8"));
  } catch {
    /* unreadable file contributes no edges */
  }
  for (const m of src.matchAll(/(?:from|import)\s*"([^"]+)"/g)) {
    const r = resolveSpec(f, m[1]);
    if (r && r !== f) out.add(r);
  }
  adj.set(f, [...out]);
}

/* Tarjan, iterative — the graph is deep enough to blow a recursive stack. */
let counter = 0;
const index = new Map();
const low = new Map();
const onStack = new Set();
const stack = [];
const sccs = [];

for (const root of adj.keys()) {
  if (index.has(root)) continue;
  const work = [[root, 0]];
  index.set(root, counter);
  low.set(root, counter);
  counter += 1;
  stack.push(root);
  onStack.add(root);

  while (work.length) {
    const frame = work[work.length - 1];
    const [v, i] = frame;
    const next = adj.get(v) ?? [];
    if (i < next.length) {
      frame[1] += 1;
      const w = next[i];
      if (!adj.has(w)) continue;
      if (!index.has(w)) {
        index.set(w, counter);
        low.set(w, counter);
        counter += 1;
        stack.push(w);
        onStack.add(w);
        work.push([w, 0]);
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v), index.get(w)));
      }
    } else {
      work.pop();
      if (work.length) {
        const parent = work[work.length - 1][0];
        low.set(parent, Math.min(low.get(parent), low.get(v)));
      }
      if (low.get(v) === index.get(v)) {
        const comp = [];
        let w;
        do {
          w = stack.pop();
          onStack.delete(w);
          comp.push(w);
        } while (w !== v);
        sccs.push(comp);
      }
    }
  }
}

const cycles = sccs.filter((c) => c.length > 1).sort((a, b) => b.length - a.length);
const trapped = cycles.reduce((n, c) => n + c.length, 0);
const largest = cycles.length ? cycles[0].length : 0;
const selfLoops = [...adj.entries()].filter(([f, ns]) => ns.includes(f)).map(([f]) => f);

const rel = (p) => p.replace(/\\/g, "/").replace(/^.*appkit\/src\//, "");

console.log(`appkit/src modules: ${files.length}`);
console.log(
  `cyclic components: ${cycles.length} (ratchet ${MAX_COMPONENTS}) · ` +
    `modules trapped: ${trapped} (ratchet ${MAX_TRAPPED}) · ` +
    `largest: ${largest} (ratchet ${MAX_LARGEST})`,
);
if (selfLoops.length) {
  console.log(`self-referencing modules: ${selfLoops.length}`);
  for (const f of selfLoops) console.log(`    ${rel(f)}`);
}

if (cycles.length) {
  console.log(`\ncomponent sizes: ${cycles.map((c) => c.length).join(", ")}`);
  if (LIST) {
    for (const [n, c] of cycles.entries()) {
      console.log(`\n▸ component ${n + 1} — ${c.length} modules`);
      for (const f of c.sort()) console.log(`    ${rel(f)}`);
    }
  } else {
    console.log("(run with --list to see members)");
  }
}

const problems = [];
if (cycles.length > MAX_COMPONENTS) problems.push(`components ${cycles.length} > ${MAX_COMPONENTS}`);
if (trapped > MAX_TRAPPED) problems.push(`trapped ${trapped} > ${MAX_TRAPPED}`);
if (largest > MAX_LARGEST) problems.push(`largest ${largest} > ${MAX_LARGEST}`);

if (problems.length) {
  console.error(`\n✗ import cycles REGRESSED: ${problems.join(" · ")}`);
  console.error("  Break the new cycle, or lower nothing — the ratchet only goes down.");
  process.exit(1);
}
console.log("\n✓ no cycle regression");
