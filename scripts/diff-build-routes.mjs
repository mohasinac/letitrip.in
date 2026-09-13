#!/usr/bin/env node
/**
 * diff-build-routes.mjs — compare the route tables of two probe-build-memory runs.
 *
 * The failure mode this exists to catch: a config knob that "saves memory" by
 * silently dropping routes from the build. Peak RSS goes down, the build exits 0,
 * and the deployed site is missing pages. Memory numbers alone cannot distinguish
 * that from a real win, so every variant must be checked for route parity before
 * its saving is believed.
 *
 * It compares three things per run:
 *   - the set of route paths
 *   - each route's static/SSG/dynamic classification (a route silently becoming
 *     dynamic is a caching regression that costs money on every request)
 *   - the prerendered page count from "Generating static pages (N/N)"
 *
 * Usage:
 *   node scripts/diff-build-routes.mjs <baseline-variant> <candidate-variant>
 *   node scripts/diff-build-routes.mjs            # newest two runs
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, ".build-memory");

// Next's route table uses box-drawing prefixes and these legend markers.
const TREE = /^[├└┌]/;
const MARKERS = [
  { glyph: "○", kind: "static" },
  { glyph: "●", kind: "ssg" },
  { glyph: "ƒ", kind: "dynamic" },
];

function parseLog(file) {
  const text = readFileSync(file, "utf8");
  const routes = new Map();
  for (const raw of text.split(/\r?\n/)) {
    if (!TREE.test(raw)) continue;
    const hit = MARKERS.find((m) => raw.includes(m.glyph));
    if (!hit) continue;
    // Strip the tree prefix, the marker, and the trailing size columns.
    const after = raw.slice(raw.indexOf(hit.glyph) + 1).trim();
    const route = after.split(/\s{2,}/)[0].trim();
    if (route) routes.set(route, hit.kind);
  }
  const gen = text.match(/Generating static pages using (\d+) workers? \((\d+)\/(\d+)\)/);
  return { routes, prerendered: gen ? Number(gen[3]) : null, workers: gen ? Number(gen[1]) : null };
}

function newest(variant) {
  const logs = readdirSync(DIR)
    .filter((f) => f.endsWith(".log") && (!variant || f.startsWith(`${variant}-`)))
    .sort();
  if (logs.length === 0) throw new Error(`no build log for variant "${variant ?? "(any)"}" in .build-memory/`);
  return path.join(DIR, logs[logs.length - 1]);
}

if (!existsSync(DIR)) {
  console.error("No .build-memory/ — run scripts/probe-build-memory.mjs first.");
  process.exit(1);
}

const [aArg, bArg] = process.argv.slice(2);
let fileA, fileB;
if (aArg && bArg) {
  fileA = newest(aArg);
  fileB = newest(bArg);
} else {
  const logs = readdirSync(DIR).filter((f) => f.endsWith(".log")).sort();
  if (logs.length < 2) {
    console.error("Need at least two runs to diff.");
    process.exit(1);
  }
  fileA = path.join(DIR, logs[logs.length - 2]);
  fileB = path.join(DIR, logs[logs.length - 1]);
}

const A = parseLog(fileA);
const B = parseLog(fileB);
console.log(`baseline : ${path.basename(fileA)}  (${A.routes.size} routes, ${A.prerendered} prerendered)`);
console.log(`candidate: ${path.basename(fileB)}  (${B.routes.size} routes, ${B.prerendered} prerendered)`);
console.log("");

const missing = [...A.routes.keys()].filter((r) => !B.routes.has(r));
const added = [...B.routes.keys()].filter((r) => !A.routes.has(r));
const reclassified = [...A.routes.entries()]
  .filter(([r, k]) => B.routes.has(r) && B.routes.get(r) !== k)
  .map(([r, k]) => `${r}: ${k} -> ${B.routes.get(r)}`);

let bad = false;
const report = (label, list) => {
  if (list.length === 0) return;
  bad = true;
  console.log(`${label} (${list.length}):`);
  for (const x of list.slice(0, 25)) console.log(`  ${x}`);
  if (list.length > 25) console.log(`  … and ${list.length - 25} more`);
  console.log("");
};
report("🛑 ROUTES MISSING from candidate", missing);
report("routes ADDED in candidate", added);
report("🛑 RECLASSIFIED", reclassified);

if (A.prerendered !== B.prerendered) {
  bad = true;
  console.log(`🛑 prerendered page count changed: ${A.prerendered} -> ${B.prerendered}`);
}

if (!bad) {
  console.log(`✓ route parity holds — ${A.routes.size} routes, identical classification, ${A.prerendered} pages prerendered.`);
  process.exit(0);
}
process.exit(1);
