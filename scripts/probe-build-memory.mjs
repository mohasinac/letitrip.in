#!/usr/bin/env node
/**
 * probe-build-memory.mjs — per-PHASE peak memory and wall time for `next build`.
 *
 * Why this exists rather than reusing the two probes already in scripts/:
 *   - probe-dev-heap-cap.mjs is a dev-server binary search (spawns `next dev`,
 *     waits for "Ready in", drives HTTP load). None of that applies to a build.
 *   - next-memory-forensics.js is hard-wired to `next dev --webpack` and
 *     actively flags Turbopack as an anomaly.
 * Their free-RAM gate and process-tree walking are reused in spirit.
 *
 * The phase split is the whole point. The two phases of `next build` have
 * completely unrelated memory levers, and a harness that samples only the main
 * process is blind to the one that matters:
 *
 *   compile   — Turbopack runs in a WORKER THREAD (next/dist/build/index.js,
 *               `isolatedMemory: false`), so its Rust arena counts against
 *               MAIN-PROCESS RSS.
 *   prerender — N separate CHILD PROCESSES. Their count comes from
 *               `experimental.cpus`, which defaults to `os.cpus().length - 1`
 *               (next/dist/server/config-shared.js) — the HOST core count, not
 *               the container's cgroup quota. And next/dist/lib/worker.js
 *               DELETES --max-old-space-size from each of them
 *               (`isolatedMemory: true`), so worker count is the only control
 *               that exists over that phase.
 *
 * Usage:
 *   node scripts/probe-build-memory.mjs --variant baseline --cold
 *   node scripts/probe-build-memory.mjs --variant cpus2 --warm
 *   node scripts/probe-build-memory.mjs --variant dbg --cold -- --experimental-debug-memory-usage
 *
 * Anything after a bare `--` is forwarded to `next build` verbatim.
 *
 * Flags:
 *   --variant <name>   label for the results file (default "unnamed")
 *   --cold             wipe the build cache first (default)
 *   --warm             keep .next as-is
 *   --sample-ms <n>    sampler cadence (default 250)
 *   --out <dir>        results directory (default .build-memory/)
 *   --force            bypass the free-RAM pre-flight
 *   --dry-run          print the resolved plan and exit without building
 *
 * Env:
 *   PROBE_MIN_FREE_GB  free-RAM floor, default 6
 *
 * 🛑 Local numbers are RELATIVE (variant A vs variant B on the same box, same
 * cold/warm state, similar free RAM). They are NOT an absolute prediction of a
 * Vercel container: Windows working set is trimmable and a Linux cgroup kills
 * on something closer to private commit. Both are recorded; neither is truth.
 */
import { spawn } from "child_process";
import { rmSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BYTES_PER_GB = 1024 ** 3;

// ── args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const passthroughAt = argv.indexOf("--");
const ownArgs = passthroughAt === -1 ? argv : argv.slice(0, passthroughAt);
const buildArgs = passthroughAt === -1 ? [] : argv.slice(passthroughAt + 1);

function flagValue(name, fallback) {
  const i = ownArgs.indexOf(name);
  return i !== -1 && ownArgs[i + 1] ? ownArgs[i + 1] : fallback;
}
const VARIANT = flagValue("--variant", "unnamed");
const WARM = ownArgs.includes("--warm");
const SAMPLE_MS = Number(flagValue("--sample-ms", "250"));
const OUT_DIR = path.resolve(ROOT, flagValue("--out", ".build-memory"));
const FORCE = ownArgs.includes("--force");
const DRY_RUN = ownArgs.includes("--dry-run");
const MIN_FREE_GB = Number(process.env.PROBE_MIN_FREE_GB ?? 6);

const DIAG_FILE = path.join(ROOT, ".next", "diagnostics", "build-diagnostics.json");

const log = (m) => console.log(`[probe-build] ${m}`);

// ── pre-flight ────────────────────────────────────────────────────────────
const hostCpus = os.cpus().length;
const totalMemMb = Math.floor(os.totalmem() / 1024 / 1024);
const freeMemGbAtStart = os.freemem() / BYTES_PER_GB;

log(`variant=${VARIANT} mode=${WARM ? "warm" : "cold"} sample=${SAMPLE_MS}ms`);
log(`host: ${hostCpus} cpus, ${totalMemMb} MB total, ${freeMemGbAtStart.toFixed(1)} GB free`);
if (buildArgs.length) log(`extra next-build args: ${buildArgs.join(" ")}`);

if (!FORCE && freeMemGbAtStart < MIN_FREE_GB) {
  console.error(
    `\n[probe-build] Aborting: only ${freeMemGbAtStart.toFixed(1)} GB free, floor is ${MIN_FREE_GB} GB.\n` +
      `              Worker count and V8's default heap both key off system memory,\n` +
      `              so a run started low is not comparable to one started high.\n` +
      `              Close things, or pass --force / set PROBE_MIN_FREE_GB.\n`,
  );
  process.exit(2);
}

// ── cache state ───────────────────────────────────────────────────────────
// Cold means "no Turbopack build cache", which models a fresh CI runner or a
// Vercel build with no cache restore. It deliberately PRESERVES .next/dev —
// in dev, distDir becomes .next/dev (next/dist/server/config.js), so that
// subtree is the dev server's own 2 GB filesystem cache and has nothing to do
// with the build. Nuking it would just make the user's next `npm run dev:hot`
// slow for no measurement benefit.
function prepareCacheState() {
  const nextDir = path.join(ROOT, ".next");
  if (!WARM && existsSync(nextDir)) {
    const keep = new Set(["dev"]);
    for (const entry of readdirSync(nextDir)) {
      if (keep.has(entry)) continue;
      rmSync(path.join(nextDir, entry), { recursive: true, force: true });
    }
    log("cold: removed .next/* except .next/dev (the dev-server cache)");
  } else if (WARM) {
    log("warm: .next left intact");
  }
  // Always: the diagnostics file is never reset to a terminal state by Next,
  // so a stale one from an interrupted run would mislabel every early sample.
  rmSync(path.join(ROOT, ".next", "diagnostics"), { recursive: true, force: true });
}

// ── phase tracking ────────────────────────────────────────────────────────
// Primary source is Next's own marker file; stdout is the cross-check. Neither
// alone is sufficient: the file lags slightly, and the stdout strings are not a
// stable API.
const PHASES = ["startup", "compile", "type-checking", "static-generation", "trace"];
let currentPhase = "startup";
const phaseTimeline = []; // { phase, atMs, source }

function setPhase(next, source) {
  if (next === currentPhase) return;
  currentPhase = next;
  phaseTimeline.push({ phase: next, atMs: Date.now(), source });
  log(`phase -> ${next} (${source})`);
}

function pollDiagnostics() {
  try {
    const stage = JSON.parse(readFileSync(DIAG_FILE, "utf8")).buildStage;
    if (stage && PHASES.includes(stage)) setPhase(stage, "diagnostics");
  } catch {
    // Absent until Next writes it; absence is not an error.
  }
}

let workerCountReported = null;
let compiledInMessage = null;
let staticPagesTotal = null;

function parseStdout(chunk) {
  if (/Creating an optimized production build/.test(chunk)) setPhase("compile", "stdout");
  const compiled = chunk.match(/Compiled successfully in ([^\n\r]+)/);
  if (compiled) compiledInMessage = compiled[1].trim();
  const workers = chunk.match(/Collecting page data using (\d+) worker/);
  if (workers) {
    workerCountReported = Number(workers[1]);
    setPhase("static-generation", "stdout");
  }
  const gen = chunk.match(/Generating static pages \((\d+)\/(\d+)\)/);
  if (gen) {
    staticPagesTotal = Number(gen[2]);
    setPhase("static-generation", "stdout");
  }
  if (/Collecting build traces/.test(chunk)) setPhase("trace", "stdout");
}

// ── sampling ──────────────────────────────────────────────────────────────
// phase -> aggregates. treeWs/treePf are the whole build process tree; main* is
// just the root `next build` process, which is where the Turbopack arena lives.
const stats = new Map();
function bump(phase, { treeWsMb, treePfMb, mainWsMb, workerWsMb, nodeCount }) {
  let s = stats.get(phase);
  if (!s) {
    s = {
      samples: 0,
      firstMs: Date.now(),
      lastMs: Date.now(),
      peakTreeWsMb: 0,
      peakTreePfMb: 0,
      peakMainWsMb: 0,
      peakWorkerWsMb: 0,
      peakNodeCount: 0,
    };
    stats.set(phase, s);
  }
  s.samples += 1;
  s.lastMs = Date.now();
  s.peakTreeWsMb = Math.max(s.peakTreeWsMb, treeWsMb);
  s.peakTreePfMb = Math.max(s.peakTreePfMb, treePfMb);
  s.peakMainWsMb = Math.max(s.peakMainWsMb, mainWsMb);
  s.peakWorkerWsMb = Math.max(s.peakWorkerWsMb, workerWsMb);
  s.peakNodeCount = Math.max(s.peakNodeCount, nodeCount);
}

/** Descendants of rootPid (inclusive) within the node.exe list. */
function treeOf(procs, rootPid) {
  const byParent = new Map();
  for (const p of procs) {
    if (!byParent.has(p.ParentProcessId)) byParent.set(p.ParentProcessId, []);
    byParent.get(p.ParentProcessId).push(p);
  }
  const out = [];
  const seen = new Set();
  const stack = [rootPid];
  while (stack.length) {
    const pid = stack.pop();
    if (seen.has(pid)) continue;
    seen.add(pid);
    const self = procs.find((p) => p.ProcessId === pid);
    if (self) out.push(self);
    for (const child of byParent.get(pid) ?? []) stack.push(child.ProcessId);
  }
  return out;
}

// ── run ───────────────────────────────────────────────────────────────────
if (DRY_RUN) {
  log(`dry-run: would ${WARM ? "keep" : "wipe"} the build cache, then run:`);
  log(`  node node_modules/next/dist/bin/next build ${buildArgs.join(" ")}`);
  log(`results would land in ${OUT_DIR}`);
  process.exit(0);
}

prepareCacheState();
mkdirSync(OUT_DIR, { recursive: true });

const startedAt = Date.now();
const build = spawn(
  process.execPath,
  [path.join("node_modules", "next", "dist", "bin", "next"), "build", ...buildArgs],
  { cwd: ROOT, shell: false, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } },
);

let buildLog = "";
for (const stream of [build.stdout, build.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    process.stdout.write(chunk); // tee, so a failing build is still debuggable
    buildLog += chunk;
    parseStdout(chunk);
  });
}

const sampler = spawn(
  "powershell",
  [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    path.join(ROOT, "scripts", "lib", "proc-sampler.ps1"),
    "-IntervalMs",
    String(SAMPLE_MS),
  ],
  { cwd: ROOT, shell: false, stdio: ["ignore", "pipe", "ignore"] },
);

let samplerBuf = "";
let samplerErrors = 0;
sampler.stdout.setEncoding("utf8");
sampler.stdout.on("data", (chunk) => {
  samplerBuf += chunk;
  const lines = samplerBuf.split(/\r?\n/);
  samplerBuf = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.trim()) continue;
    let tick;
    try {
      tick = JSON.parse(line);
    } catch {
      samplerErrors += 1;
      continue;
    }
    if (tick.err) {
      samplerErrors += 1;
      continue;
    }
    // ConvertTo-Json emits a bare object when the array has one element.
    const procs = Array.isArray(tick.p) ? tick.p : tick.p ? [tick.p] : [];
    pollDiagnostics();

    const tree = treeOf(procs, build.pid);
    if (tree.length === 0) return;
    const toMb = (b) => b / 1024 / 1024;
    const treeWsMb = tree.reduce((a, p) => a + toMb(p.WorkingSetSize ?? 0), 0);
    // PageFileUsage is reported in KB.
    const treePfMb = tree.reduce((a, p) => a + (p.PageFileUsage ?? 0) / 1024, 0);
    const main = tree.find((p) => p.ProcessId === build.pid);
    const mainWsMb = main ? toMb(main.WorkingSetSize ?? 0) : 0;

    bump(currentPhase, {
      treeWsMb,
      treePfMb,
      mainWsMb,
      workerWsMb: treeWsMb - mainWsMb,
      nodeCount: tree.length,
    });
  }
});

function stopSampler() {
  if (sampler.pid) {
    spawn("taskkill", ["/PID", String(sampler.pid), "/T", "/F"], { stdio: "ignore" });
  }
}
process.on("SIGINT", () => {
  stopSampler();
  process.exit(130);
});

build.on("exit", (code) => {
  stopSampler();
  const totalWallMs = Date.now() - startedAt;

  const phases = {};
  let machinePeakWsMb = 0;
  let machinePeakPfMb = 0;
  for (const [phase, s] of stats) {
    phases[phase] = {
      samples: s.samples,
      wallMs: s.lastMs - s.firstMs,
      peakTreeWsMb: Math.round(s.peakTreeWsMb),
      peakTreePfMb: Math.round(s.peakTreePfMb),
      peakMainWsMb: Math.round(s.peakMainWsMb),
      peakWorkerWsMb: Math.round(s.peakWorkerWsMb),
      peakNodeCount: s.peakNodeCount,
    };
    machinePeakWsMb = Math.max(machinePeakWsMb, s.peakTreeWsMb);
    machinePeakPfMb = Math.max(machinePeakPfMb, s.peakTreePfMb);
  }

  const result = {
    variant: VARIANT,
    cacheMode: WARM ? "warm" : "cold",
    exitCode: code,
    ts: new Date(startedAt).toISOString(),
    buildArgs,
    host: { cpus: hostCpus, totalMemMb, freeMemGbAtStart: Number(freeMemGbAtStart.toFixed(2)) },
    sampleMs: SAMPLE_MS,
    samplerErrors,
    // The literal worker count Next printed. If a `cpus` override did not take,
    // THIS is where it shows — not in the memory numbers.
    workerCountReported,
    compiledInMessage,
    staticPagesTotal,
    phaseTimeline,
    phases,
    totalWallMs,
    machinePeakWsMb: Math.round(machinePeakWsMb),
    machinePeakPfMb: Math.round(machinePeakPfMb),
  };

  const stamp = new Date(startedAt).toISOString().replace(/[:.]/g, "-");
  const outFile = path.join(OUT_DIR, `${VARIANT}-${WARM ? "warm" : "cold"}-${stamp}.json`);
  writeFileSync(outFile, JSON.stringify(result, null, 2));
  writeFileSync(path.join(OUT_DIR, `${VARIANT}-${WARM ? "warm" : "cold"}-${stamp}.log`), buildLog);

  console.log("");
  log("──────────────────────────────────────────────");
  log(`variant        : ${VARIANT} (${WARM ? "warm" : "cold"})`);
  log(`exit code      : ${code}`);
  log(`workers printed: ${workerCountReported ?? "(not seen)"}`);
  for (const [phase, p] of Object.entries(phases)) {
    log(
      `${phase.padEnd(17)}: ${String(Math.round(p.wallMs / 1000)).padStart(4)}s  ` +
        `tree ${String(p.peakTreeWsMb).padStart(5)} MB  ` +
        `main ${String(p.peakMainWsMb).padStart(5)} MB  ` +
        `workers ${String(p.peakWorkerWsMb).padStart(5)} MB  ` +
        `procs ${p.peakNodeCount}`,
    );
  }
  log(`total wall     : ${Math.round(totalWallMs / 1000)}s`);
  log(`MACHINE PEAK   : ${Math.round(machinePeakWsMb)} MB working set / ${Math.round(machinePeakPfMb)} MB private commit`);
  if (samplerErrors) log(`sampler errors : ${samplerErrors} (investigate if large)`);
  log(`written        : ${path.relative(ROOT, outFile)}`);
  log("──────────────────────────────────────────────");

  process.exit(code ?? 0);
});
