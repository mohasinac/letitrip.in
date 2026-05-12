#!/usr/bin/env node
/**
 * probe-dev-heap-cap.mjs — find the smallest dev-server heap cap that stays
 * stable under light load, then add processing headroom.
 *
 * Background: bare `next dev` at idle sits at ~300 MB. The actual OOM in
 * the original forensics run came from the full dev quartet (Next dev +
 * appkit tsc watch + tailwind watch + prewarm) hitting URLs while HMR
 * cycled compiled modules. The relevant measurement is therefore *Next
 * dev under light load*, not at pure idle.
 *
 * Strategy per cap:
 *   1. Spawn `next dev --webpack` with --max-old-space-size=CAP.
 *   2. Wait for "Ready in" up to READY_TIMEOUT_MS.
 *   3. Drive light load: GET a rotating set of routes every PROBE_INTERVAL_MS
 *      so the compiler / HMR / route handlers exercise the heap.
 *   4. Sample server RSS every SAMPLE_INTERVAL_MS until SAMPLE_WINDOW_MS.
 *   5. If natural crash (we did not initiate the kill) → step up.
 *      If peak RSS / cap > STABILITY_RATIO → step up.
 *      Else → stable; report.
 *
 * Output: probe-results.json + recommended cap = round_up_to_step(peak + headroom).
 *
 * Env overrides:
 *   PROBE_START_CAP_MB   default 1024
 *   PROBE_STEP_MB        default 512
 *   PROBE_MAX_CAP_MB     default 6144
 *   PROBE_HEADROOM_MB    default 512
 *   PROBE_WINDOW_MS      default 120000 (2 min under load)
 *   PROBE_INTERVAL_MS    default 4000   (URL ping cadence)
 *   PROBE_PORT           default 3300   (avoid clashing with a running dev)
 */
import { spawn, spawnSync, execSync } from "child_process";
import fs from "fs";
import os from "os";

const START_CAP_MB = Number(process.env.PROBE_START_CAP_MB ?? 1024);
const STEP_MB = Number(process.env.PROBE_STEP_MB ?? 512);
const MAX_CAP_MB = Number(process.env.PROBE_MAX_CAP_MB ?? 6144);
const HEADROOM_MB = Number(process.env.PROBE_HEADROOM_MB ?? 512);
const SAMPLE_WINDOW_MS = Number(process.env.PROBE_WINDOW_MS ?? 120_000);
const SAMPLE_INTERVAL_MS = 5_000;
const PROBE_INTERVAL_MS = Number(process.env.PROBE_INTERVAL_MS ?? 4_000);
const STABILITY_RATIO = 0.85;
const READY_TIMEOUT_MS = 90_000;
const PORT = Number(process.env.PROBE_PORT ?? 3300);
const LOAD_ROUTES = [
  "/",
  "/bundles",
  "/products",
  "/auctions",
  "/api/products?pageSize=12",
  "/api/categories",
];

function mb(bytes) { return Math.round(bytes / 1024 / 1024); }
function nowIso() { return new Date().toISOString(); }
function log(...a) { console.log(`[probe ${nowIso()}]`, ...a); }

function rssOfPid(pid) {
  try {
    const out = execSync(
      `wmic process where "ProcessId=${pid}" get WorkingSetSize /format:value`,
      { encoding: "utf8" },
    );
    const m = out.match(/WorkingSetSize=(\d+)/);
    return m ? mb(Number(m[1])) : 0;
  } catch { return 0; }
}

function findNextServerPidUnder(parentPid) {
  try {
    const out = execSync(
      `wmic process where "ParentProcessId=${parentPid}" get ProcessId,CommandLine /format:csv`,
      { encoding: "utf8" },
    );
    for (const line of out.split("\n")) {
      if (line.includes("start-server") || line.includes("next dev")) {
        const cols = line.split(",");
        const pid = Number(cols[cols.length - 1]);
        if (Number.isFinite(pid) && pid > 0) return pid;
      }
    }
    return parentPid;
  } catch { return parentPid; }
}

async function hit(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(8_000) });
  } catch { /* probe-side timeout / refused → ignore, server-side metric is what matters */ }
}

async function probeOnce(capMb) {
  log(`>>> cap=${capMb} MB — booting next dev`);
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--webpack",
      "--port",
      String(PORT),
    ],
    {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_OPTIONS: `--max-old-space-size=${capMb}`,
        // Match prod parity envs so route handlers see them.
        VERCEL_TIER: "hobby",
        VERCEL_FUNCTION_MEMORY_MB: "2048",
      },
    },
  );

  let ready = false;
  let crashed = false;
  let crashReason = null;
  let deliberateKill = false;
  const rssSamples = [];

  const onText = (text) => {
    if (!ready && /Ready in /i.test(text)) ready = true;
    if (/JavaScript heap out of memory|Allocation failed/i.test(text)) {
      crashReason = "OOM";
    }
  };
  child.stdout.on("data", (d) => onText(d.toString()));
  child.stderr.on("data", (d) => onText(d.toString()));

  child.on("exit", (code) => {
    if (deliberateKill) return;
    if (!crashReason) crashReason = `exited code=${code}`;
    crashed = true;
  });

  const startWaitReady = Date.now();
  while (!ready && !crashed && Date.now() - startWaitReady < READY_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) {
    log(`!!! never reached Ready (${crashReason ?? "timeout"})`);
    deliberateKill = true;
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    await new Promise((r) => setTimeout(r, 3_000));
    return { capMb, ready: false, crashed, crashReason, peakRssMb: 0, samples: [] };
  }
  log(`    ready, sampling under light load for ${Math.round(SAMPLE_WINDOW_MS / 1000)}s`);

  // Drive load: stagger URL hits over the sample window.
  let routeIdx = 0;
  const baseUrl = `http://localhost:${PORT}`;
  const loadTimer = setInterval(() => {
    if (crashed) return;
    void hit(baseUrl + LOAD_ROUTES[routeIdx % LOAD_ROUTES.length]);
    routeIdx++;
  }, PROBE_INTERVAL_MS);

  const samplingStart = Date.now();
  const serverPid = findNextServerPidUnder(child.pid);
  log(`    next server pid=${serverPid}`);

  while (!crashed && Date.now() - samplingStart < SAMPLE_WINDOW_MS) {
    const rssMb = rssOfPid(serverPid);
    rssSamples.push({ t: Date.now() - samplingStart, rssMb });
    if (rssMb) log(`    rss=${rssMb}MB (cap ${capMb}MB)`);
    await new Promise((r) => setTimeout(r, SAMPLE_INTERVAL_MS));
  }

  clearInterval(loadTimer);
  deliberateKill = true;
  spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 3_000));

  const peakRssMb = rssSamples.reduce((m, s) => Math.max(m, s.rssMb), 0);
  return { capMb, ready: true, crashed, crashReason, peakRssMb, samples: rssSamples };
}

async function main() {
  const results = [];
  let stable = null;
  for (let cap = START_CAP_MB; cap <= MAX_CAP_MB; cap += STEP_MB) {
    const freeGb = os.freemem() / 1024 ** 3;
    log(`free RAM before run: ${freeGb.toFixed(2)} GB`);
    if (freeGb < 2.5) {
      log("!!! free RAM too low to run a fair probe; aborting");
      break;
    }
    const r = await probeOnce(cap);
    results.push(r);
    log(
      `<<< cap=${cap} ready=${r.ready} crashed=${r.crashed} ` +
        `peakRss=${r.peakRssMb}MB ratio=${(r.peakRssMb / cap).toFixed(2)} ` +
        `reason=${r.crashReason ?? "—"}`,
    );
    if (r.ready && !r.crashed && r.peakRssMb > 0 && r.peakRssMb / cap <= STABILITY_RATIO) {
      stable = r;
      break;
    }
  }

  fs.writeFileSync(
    "probe-results.json",
    JSON.stringify({ ts: nowIso(), START_CAP_MB, STEP_MB, HEADROOM_MB, results }, null, 2),
  );

  if (!stable) {
    log("XXX no stable cap found in range");
    process.exit(2);
  }
  const recommended = Math.ceil((stable.peakRssMb + HEADROOM_MB) / STEP_MB) * STEP_MB;
  log("=================================");
  log(`stable cap     : ${stable.capMb} MB`);
  log(`peak load RSS  : ${stable.peakRssMb} MB`);
  log(`+ headroom     : ${HEADROOM_MB} MB`);
  log(`recommended cap: ${recommended} MB`);
  log("=================================");
}

main().catch((e) => { console.error(e); process.exit(1); });
