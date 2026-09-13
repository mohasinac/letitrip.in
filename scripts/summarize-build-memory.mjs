#!/usr/bin/env node
/**
 * summarize-build-memory.mjs — collate every scripts/probe-build-memory.mjs run
 * into one table, newest last.
 *
 * The last column, MACHINE PEAK, is the only one that decides anything. The rest
 * is diagnosis: it tells you WHICH phase to attack, which is the thing a single
 * total hides. (Measured here 2026-09-13: capping the prerender worker pool from
 * 15 to 2 was correct and still left the build over budget, because the peak is
 * the compile phase — a conclusion no single-number harness could have reached.)
 *
 * Comparability rules, enforced by the warnings below rather than by convention:
 *   - Only compare runs with the same cacheMode. A warm run against a cold
 *     baseline is the easiest way to fake a win.
 *   - Watch `freeGB` — worker count and V8's default heap both key off system
 *     memory, and Windows trims working sets under pressure, so a run started
 *     with 1.4 GB free UNDER-reports against one started with 8 GB.
 *
 * Usage: node scripts/summarize-build-memory.mjs [--dir .build-memory] [--json]
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const dirArg = argv.indexOf("--dir");
const DIR = path.resolve(ROOT, dirArg !== -1 ? argv[dirArg + 1] : ".build-memory");

if (!existsSync(DIR)) {
  console.error(`No results directory at ${path.relative(ROOT, DIR)} — run scripts/probe-build-memory.mjs first.`);
  process.exit(1);
}

const runs = readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ file: f, ...JSON.parse(readFileSync(path.join(DIR, f), "utf8")) }))
  .sort((a, b) => new Date(a.ts) - new Date(b.ts));

if (runs.length === 0) {
  console.error("No runs recorded yet.");
  process.exit(1);
}

if (argv.includes("--json")) {
  console.log(JSON.stringify(runs, null, 2));
  process.exit(0);
}

const s = (v, w) => String(v ?? "-").padStart(w);
const sl = (v, w) => String(v ?? "-").padEnd(w);
const ph = (r, name, key) => r.phases?.[name]?.[key];

console.log("");
console.log(
  sl("variant", 28) + sl("cache", 6) + s("wrk", 4) + s("cmplS", 7) + s("cmplMB", 8) +
    s("prerS", 7) + s("prerMB", 8) + s("totS", 6) + s("PEAK_WS", 9) + s("commit", 8) + s("freeGB", 8),
);
console.log("-".repeat(94));
for (const r of runs) {
  console.log(
    sl(r.variant, 28) +
      sl(r.cacheMode, 6) +
      s(r.workerCountReported, 4) +
      s(Math.round((ph(r, "compile", "wallMs") ?? 0) / 1000), 7) +
      s(ph(r, "compile", "peakTreeWsMb"), 8) +
      s(Math.round((ph(r, "static-generation", "wallMs") ?? 0) / 1000), 7) +
      s(ph(r, "static-generation", "peakTreeWsMb"), 8) +
      s(Math.round(r.totalWallMs / 1000), 6) +
      s(r.machinePeakWsMb, 9) +
      s(r.machinePeakPfMb, 8) +
      s(r.host?.freeMemGbAtStart, 8) +
      (r.exitCode === 0 ? "" : `  <-- EXIT ${r.exitCode}`),
  );
}
console.log("");

// ── Replicate statistics ──────────────────────────────────────────────────
// Added after a hard lesson on 2026-09-13: two runs of a BYTE-IDENTICAL config
// measured 6563 MB and 8398 MB — a 1835 MB spread, larger than every per-knob
// delta that had been reported as a finding up to that point. Peak working set
// on Windows has a noise floor big enough to swallow the effects being hunted.
//
// So: n=1 is not a measurement. This block reports the spread so a single run
// can never again be quoted as a result, and flags any comparison whose delta
// is smaller than the observed within-variant noise.
const groups = new Map();
for (const r of runs) {
  const key = `${r.variant}|${r.cacheMode}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

let worstSpread = 0;
const repl = [...groups.entries()].filter(([, v]) => v.length > 1);
if (repl.length) {
  console.log("Replicates (same config, repeated) — spread is the noise floor:");
  console.log(sl("variant", 28) + s("n", 3) + s("medWS", 8) + s("minWS", 8) + s("maxWS", 8) + s("spread", 8) + s("medS", 7));
  console.log("-".repeat(70));
  for (const [key, rs] of repl) {
    const ws = rs.map((r) => r.machinePeakWsMb);
    const spread = Math.max(...ws) - Math.min(...ws);
    worstSpread = Math.max(worstSpread, spread);
    console.log(
      sl(key.split("|")[0], 28) + s(rs.length, 3) + s(median(ws), 8) +
        s(Math.min(...ws), 8) + s(Math.max(...ws), 8) + s(spread, 8) +
        s(median(rs.map((r) => Math.round(r.totalWallMs / 1000))), 7),
    );
  }
  console.log("");
  if (worstSpread > 0) {
    console.log(
      `⚠ NOISE FLOOR ≈ ${worstSpread} MB (largest within-config spread).\n` +
        `  Any between-config delta smaller than this is NOT a result. Wall time is\n` +
        `  far less noisy than peak RSS — prefer it when the memory signal is unclear.`,
    );
    console.log("");
  }
}

// Comparability warnings. Stated as warnings, not filters — a run under memory
// pressure is still data, it just cannot be read as an absolute.
const cold = runs.filter((r) => r.cacheMode === "cold");
const frees = runs.map((r) => r.host?.freeMemGbAtStart).filter((n) => typeof n === "number");
if (frees.length > 1 && Math.max(...frees) - Math.min(...frees) > 2) {
  console.log(
    `⚠ free RAM at start ranged ${Math.min(...frees)}–${Math.max(...frees)} GB across runs.\n` +
      `  Windows trims working sets under pressure, so the low-RAM runs UNDER-report.\n` +
      `  Treat cross-run deltas of less than ~10% as noise.`,
  );
}
if (cold.length > 1) {
  const best = cold.reduce((a, b) => (b.machinePeakWsMb < a.machinePeakWsMb ? b : a));
  const worst = cold.reduce((a, b) => (b.machinePeakWsMb > a.machinePeakWsMb ? b : a));
  if (best !== worst) {
    console.log(
      `cold best : ${best.variant} @ ${best.machinePeakWsMb} MB\n` +
        `cold worst: ${worst.variant} @ ${worst.machinePeakWsMb} MB\n` +
        `delta     : ${worst.machinePeakWsMb - best.machinePeakWsMb} MB`,
    );
  }
}
// Hobby's build container is 2 vCPU / 8 GB, fixed.
const HOBBY_MB = 8 * 1024;
for (const r of runs) {
  if (r.machinePeakPfMb > HOBBY_MB) {
    console.log(`⚠ ${r.variant} (${r.cacheMode}): private commit ${r.machinePeakPfMb} MB exceeds Hobby's ${HOBBY_MB} MB container.`);
  }
}
console.log("");
