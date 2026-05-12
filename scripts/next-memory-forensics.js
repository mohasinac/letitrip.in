#!/usr/bin/env node
/**
 * next-memory-forensics.js
 *
 * Forensics wrapper for the Next.js dev server.
 * Mirrors dev-next.mjs exactly (same bin path, same --webpack flag)
 * but pipes stdout/stderr through so it can intercept events, measure
 * memory, detect PostCSS/rebuild loops, and write structured logs.
 *
 * Usage:
 *   node scripts/next-memory-forensics.js
 *
 * Outputs to: memory-forensics-{timestamp}/
 *   master-log.txt          — timestamped event log
 *   metrics.ndjson          — structured metrics (memory, handles, mutations)
 *   process-tree.txt        — periodic WMIC process snapshots
 *   real-process-memory.txt — per-PID RSS from WMIC (actual server RSS)
 *   handles.txt             — active handle counts per type
 *   file-mutations.txt      — file-system events under .next/ and src/
 *   next-stdout.txt         — raw Next.js stdout
 *   next-stderr.txt         — raw Next.js stderr
 *   root-cause-analysis.txt — auto-flagged anomalies
 *   heap-{ts}.heapsnapshot  — V8 heap snapshots (this process, every 3min)
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync, execSync } = require("child_process");
const inspector = require("inspector");

// ---------------------------------------------------------------------------
// Setup output directory
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, `memory-forensics-${Date.now()}`);
fs.mkdirSync(OUT_DIR, { recursive: true });

const LOG_FILE         = path.join(OUT_DIR, "master-log.txt");
const METRICS_FILE     = path.join(OUT_DIR, "metrics.ndjson");
const ROOT_CAUSE_FILE  = path.join(OUT_DIR, "root-cause-analysis.txt");
const PROCESS_FILE     = path.join(OUT_DIR, "process-tree.txt");
const REAL_MEM_FILE    = path.join(OUT_DIR, "real-process-memory.txt");
const HANDLES_FILE     = path.join(OUT_DIR, "handles.txt");
const MUTATIONS_FILE   = path.join(OUT_DIR, "file-mutations.txt");
const STDOUT_FILE      = path.join(OUT_DIR, "next-stdout.txt");
const STDERR_FILE      = path.join(OUT_DIR, "next-stderr.txt");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function append(file, text) {
  try {
    fs.appendFileSync(file, text + "\n", { encoding: "utf8" });
  } catch (e) {
    console.error("LOG WRITE FAILED", e);
  }
}

function log(text) {
  const line = `[${new Date().toISOString()}] ${text}`;
  console.log(line);
  append(LOG_FILE, line);
}

function flag(text) {
  log(`⚠ ${text}`);
  append(ROOT_CAUSE_FILE, `[${new Date().toISOString()}] ${text}`);
}

function metric(obj) {
  append(METRICS_FILE, JSON.stringify({ ts: Date.now(), ...obj }));
}

function mb(bytes) {
  return Math.round(bytes / 1024 / 1024);
}

// ---------------------------------------------------------------------------
// Global error handlers
// ---------------------------------------------------------------------------

process.on("uncaughtException", (err) => {
  log("UNCAUGHT EXCEPTION");
  log(err.stack || err.message || String(err));
});

process.on("unhandledRejection", (err) => {
  log(`UNHANDLED REJECTION: ${err}`);
});

process.on("warning", (w) => {
  log(`NODE WARNING: ${w.name} — ${w.message}`);
});

// ---------------------------------------------------------------------------
// Spawn Next.js server — mirrors dev-next.mjs (+ Hobby parity)
// ---------------------------------------------------------------------------
//
// Memory & timeout caps mirror `scripts/dev-next.mjs` + CLAUDE.md Rule #6.
// The forensics run exercises the same Vercel Hobby ceiling the production
// build is bound to, so any leak found here is a leak that ships.
//
// Override individual caps with the matching DEV_* env vars (same names
// dev-next.mjs reads).

const HOBBY_LIMITS = {
  MEMORY_MB: 1024,
  FUNCTION_TIMEOUT_S: 10,
  BACKGROUND_TIMEOUT_S: 60,
  MAX_PAYLOAD_BYTES: 4.5 * 1024 * 1024,
  MAX_IMAGE_BYTES: 50 * 1024 * 1024,
};

const HEAP_CAP_MB = Number(
  process.env.DEV_FUNCTION_MEMORY_MB ?? HOBBY_LIMITS.MEMORY_MB,
);
// RSS exceeds heap (native, buffers, code). A 1.5x cap gives a reasonable
// "this is bigger than the budget" alarm without false-positives during
// startup compile.
const HIGH_RSS_FLAG_MB = Math.round(HEAP_CAP_MB * 1.5);
// Pre-flight free RAM gate — same value the dev-next.mjs guard uses.
const MIN_FREE_RAM_GB = 2;

// ---------------------------------------------------------------------------
// Pre-flight: refuse to start under the same conditions dev-next.mjs refuses.
// ---------------------------------------------------------------------------

if (!process.env.DEV_SKIP_MEM_CHECK) {
  const freeGb = os.freemem() / 1024 ** 3;
  if (freeGb < MIN_FREE_RAM_GB) {
    log(
      `Aborting: only ${freeGb.toFixed(2)} GB free (need ${MIN_FREE_RAM_GB} GB). ` +
        `Override DEV_SKIP_MEM_CHECK=1 to bypass.`,
    );
    process.exit(1);
  }
  log(`Memory check passed: ${freeGb.toFixed(2)} GB free.`);
}

log("STARTING NEXT FORENSICS");
log(`Output dir: ${OUT_DIR}`);
log(
  `Hobby parity — heap cap ${HEAP_CAP_MB} MB, RSS flag threshold ${HIGH_RSS_FLAG_MB} MB, ` +
    `function timeout ${HOBBY_LIMITS.FUNCTION_TIMEOUT_S} s, ` +
    `payload cap ${(HOBBY_LIMITS.MAX_PAYLOAD_BYTES / 1024 / 1024).toFixed(2)} MB.`,
);

const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--webpack"],
  {
    cwd: ROOT,
    shell: false,
    env: {
      ...process.env,
      // Mirror Hobby parity exports from dev-next.mjs so route-handler
      // middleware reads the same caps under forensics.
      VERCEL_TIER: process.env.VERCEL_TIER ?? "hobby",
      VERCEL_FUNCTION_MEMORY_MB: String(HEAP_CAP_MB),
      VERCEL_FUNCTION_TIMEOUT_S: String(
        process.env.DEV_FUNCTION_TIMEOUT_S ?? HOBBY_LIMITS.FUNCTION_TIMEOUT_S,
      ),
      VERCEL_BACKGROUND_TIMEOUT_S: String(
        process.env.DEV_BACKGROUND_TIMEOUT_S ?? HOBBY_LIMITS.BACKGROUND_TIMEOUT_S,
      ),
      VERCEL_MAX_PAYLOAD_BYTES: String(
        process.env.DEV_MAX_PAYLOAD_BYTES ?? HOBBY_LIMITS.MAX_PAYLOAD_BYTES,
      ),
      VERCEL_MAX_IMAGE_BYTES: String(
        process.env.DEV_MAX_IMAGE_BYTES ?? HOBBY_LIMITS.MAX_IMAGE_BYTES,
      ),
      NODE_OPTIONS: [
        `--max-old-space-size=${HEAP_CAP_MB}`,
        "--inspect=9230",
        "--heapsnapshot-near-heap-limit=5",
      ].join(" "),
    },
    // pipe so we can intercept — mirrors dev-next.mjs "inherit" behaviour
    // by forwarding to process.stdout/stderr manually
    stdio: ["inherit", "pipe", "pipe"],
  }
);

log(`Next.js server PID: ${child.pid}`);

function killTree() {
  if (child.pid) {
    log(`Killing process tree for PID ${child.pid}`);
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  }
}

process.on("SIGINT",  () => { log("SIGINT");  killTree(); process.exit(0); });
process.on("SIGTERM", () => { log("SIGTERM"); killTree(); process.exit(0); });
process.on("exit",    (code) => log(`PROCESS EXIT ${code}`));

child.on("exit", (code) => {
  log(`NEXT SERVER EXIT code=${code}`);
  killTree();
  process.exit(code ?? 0);
});

// ---------------------------------------------------------------------------
// stdout / stderr intercept
// ---------------------------------------------------------------------------

child.stdout.on("data", (d) => {
  const text = d.toString();
  process.stdout.write(text);
  append(STDOUT_FILE, text);

  const lower = text.toLowerCase();

  if (lower.includes("compiling") || lower.includes("compiled") || lower.includes("rebuilding")) {
    log("NEXT REBUILD DETECTED");
  }

  if (lower.includes("turbopack")) {
    flag("TURBOPACK ACTIVE — should be webpack");
  }

  if (lower.includes("ready in")) {
    log("SERVER READY");
  }

  if (lower.includes("error")) {
    log(`NEXT STDOUT ERROR: ${text.trim().slice(0, 200)}`);
  }
});

child.stderr.on("data", (d) => {
  const text = d.toString();
  process.stderr.write(text);
  append(STDERR_FILE, text);

  const lower = text.toLowerCase();

  if (lower.includes("heap out of memory") || lower.includes("javascript heap")) {
    flag("NODE OOM DETECTED");
  }

  if (lower.includes("postcss")) {
    flag("POSTCSS INVOLVEMENT DETECTED IN STDERR");
  }
});

// ---------------------------------------------------------------------------
// This-process memory (forensics script overhead)
// ---------------------------------------------------------------------------

function dumpSelfMemory() {
  const mem = process.memoryUsage();
  const data = {
    rssMB:          mb(mem.rss),
    heapTotalMB:    mb(mem.heapTotal),
    heapUsedMB:     mb(mem.heapUsed),
    externalMB:     mb(mem.external),
    arrayBuffersMB: mb(mem.arrayBuffers || 0),
    freeSystemMB:   mb(os.freemem()),
    totalSystemMB:  mb(os.totalmem()),
    uptimeS:        Math.round(process.uptime()),
  };
  metric({ type: "forensics_memory", ...data });

  // Live free-RAM warn: looser than the pre-flight 2 GB gate so we only
  // flag a real regression mid-run (compaction churn, RSS bleed).
  if (data.freeSystemMB < 1500) {
    flag(`SYSTEM MEMORY LOW: ${data.freeSystemMB}MB free (gate is ${MIN_FREE_RAM_GB} GB)`);
  }
}

// ---------------------------------------------------------------------------
// Real server RSS via WMIC (Windows) — actual Next.js server memory
// ---------------------------------------------------------------------------

function dumpRealProcessMemory() {
  try {
    const out = execSync(
      `wmic process where "name='node.exe'" get ProcessId,WorkingSetSize,CommandLine /format:csv`,
      { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 }
    );

    append(REAL_MEM_FILE, `\n=== ${new Date().toISOString()} ===\n${out}`);

    // Parse to find the start-server.js process (the actual Next.js server)
    const lines = out.split("\n").filter((l) => l.includes("start-server"));
    for (const line of lines) {
      const parts = line.split(",");
      const wss = parseInt(parts.find((p) => /^\d{6,}$/.test(p.trim())) || "0", 10);
      const rssMB = mb(wss);
      metric({ type: "server_rss", rssMB, heapCapMB: HEAP_CAP_MB });
      log(`SERVER RSS: ${rssMB}MB (cap ${HEAP_CAP_MB}MB, flag >${HIGH_RSS_FLAG_MB}MB)`);
      if (rssMB > HIGH_RSS_FLAG_MB) {
        flag(`HIGH SERVER RSS: ${rssMB}MB > ${HIGH_RSS_FLAG_MB}MB threshold`);
      }
    }
  } catch (e) {
    log(`REAL PROCESS MEMORY READ FAILED: ${e}`);
  }
}

// ---------------------------------------------------------------------------
// Process tree dump — detect zombie PostCSS/turbopack workers
// ---------------------------------------------------------------------------

const SUSPICIOUS = ["postcss", "tailwind", "turbopack", "watchpack"];

function dumpProcessTree() {
  try {
    const out = execSync(
      `wmic process where "name='node.exe'" get ProcessId,ParentProcessId,WorkingSetSize,CommandLine /format:list`,
      { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 }
    );

    append(PROCESS_FILE, `\n\n========== ${new Date().toISOString()} ==========\n\n${out}`);

    const lower = out.toLowerCase();
    for (const keyword of SUSPICIOUS) {
      const count = lower.split(keyword).length - 1;
      if (count > 3) {
        flag(`SUSPICIOUS PROCESS MULTIPLICATION: ${keyword} ×${count}`);
      }
    }

    // Count total node processes
    const nodeCount = (lower.match(/processid=/g) || []).length;
    metric({ type: "process_count", nodeCount });
    if (nodeCount > 8) {
      flag(`HIGH NODE PROCESS COUNT: ${nodeCount}`);
    }
  } catch (e) {
    log(`PROCESS TREE READ FAILED: ${e}`);
  }
}

// ---------------------------------------------------------------------------
// Active handles — detect FSWatcher leaks
// ---------------------------------------------------------------------------

function dumpHandles() {
  try {
    const handles = process._getActiveHandles();
    const grouped = {};
    for (const h of handles) {
      const name = h?.constructor?.name || "Unknown";
      grouped[name] = (grouped[name] || 0) + 1;
    }
    metric({ type: "handles", grouped });
    append(HANDLES_FILE, `\n=== ${new Date().toISOString()} ===\n${JSON.stringify(grouped, null, 2)}`);

    if ((grouped.FSWatcher || 0) > 500) {
      flag(`FSWATCHER LEAK: count=${grouped.FSWatcher}`);
    }
  } catch (e) {
    log(`HANDLE ANALYSIS FAILED: ${e}`);
  }
}

// ---------------------------------------------------------------------------
// .next/ mutation scan — detect infinite rebuild loops
// ---------------------------------------------------------------------------

function scanNextMutations() {
  const target = path.join(ROOT, ".next");
  if (!fs.existsSync(target)) return;

  let changed = 0;
  const RECENT_MS = 10_000;

  function walk(dir) {
    let items = [];
    try { items = fs.readdirSync(dir); } catch { return; }
    for (const item of items) {
      const full = path.join(dir, item);
      try {
        const stat = fs.statSync(full);
        if (Date.now() - stat.mtimeMs < RECENT_MS) changed++;
        if (stat.isDirectory()) walk(full);
      } catch {}
    }
  }

  walk(target);
  metric({ type: "next_mutation", changed });

  if (changed > 100) {
    flag(`REBUILD LOOP SUSPECTED: ${changed} files changed in last 10s`);
  }
}

// ---------------------------------------------------------------------------
// File mutation watcher — log all changes under .next/ and src/
// ---------------------------------------------------------------------------

function setupFileMutationWatcher() {
  for (const dir of [".next", "src"]) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) continue;
    try {
      fs.watch(full, { recursive: true }, (event, filename) => {
        append(MUTATIONS_FILE, `[${new Date().toISOString()}] ${dir}/${filename} ${event}`);
      });
      log(`WATCHING ${dir}/`);
    } catch (e) {
      log(`FAILED WATCHING ${dir}/: ${e}`);
    }
  }
}

// ---------------------------------------------------------------------------
// V8 heap snapshot — this process only (for forensics script leak detection)
// ---------------------------------------------------------------------------

async function takeHeapSnapshot() {
  return new Promise((resolve) => {
    try {
      const session = new inspector.Session();
      session.connect();
      const file = path.join(OUT_DIR, `heap-${Date.now()}.heapsnapshot`);
      session.on("HeapProfiler.addHeapSnapshotChunk", (m) => {
        fs.appendFileSync(file, m.params.chunk);
      });
      session.post("HeapProfiler.takeHeapSnapshot", null, () => {
        log(`HEAP SNAPSHOT: ${path.basename(file)}`);
        session.disconnect();
        resolve();
      });
    } catch (e) {
      log(`HEAP SNAPSHOT FAILED: ${e}`);
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// Interval schedule
// ---------------------------------------------------------------------------

setupFileMutationWatcher();

setInterval(dumpSelfMemory,       5_000);   // every 5s
setInterval(dumpHandles,         15_000);   // every 15s
setInterval(dumpRealProcessMemory, 10_000); // every 10s — actual server RSS
setInterval(dumpProcessTree,     20_000);   // every 20s
setInterval(scanNextMutations,   10_000);   // every 10s

setInterval(async () => {
  await takeHeapSnapshot();
}, 3 * 60 * 1000); // every 3 minutes
