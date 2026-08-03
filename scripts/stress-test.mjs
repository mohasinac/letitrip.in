#!/usr/bin/env node
/**
 * stress-test.mjs — ramp concurrent connections against the local prod server
 * and report where Vercel Hobby tier limits are hit first
 * (10 s sync timeout · 2048 MB heap · Firestore connection saturation).
 *
 * Prereq: `npm run dev` must be running (next build + next start, ~500 MB).
 *
 * Usage:
 *   node scripts/stress-test.mjs [options]
 *   npm run stress-test [-- options]
 *
 * Options:
 *   --url=<base>          Target base URL           (default: http://localhost:3000)
 *   --endpoints=a,b,c     Comma-separated API paths (default: safe read-only set)
 *   --start=<n>           Starting concurrency       (default: 1)
 *   --max=<n>             Max concurrency to test    (default: 32)
 *   --duration=<s>        Seconds per level          (default: 10)
 *   --timeout=<ms>        Request abort threshold    (default: 10000 = Hobby sync limit)
 *   --json                Emit JSON summary after table
 *
 * Ceiling detection (auto-stop on any of):
 *   p99 > 9 000 ms   — 90% of the 10 s Hobby sync timeout
 *   timeouts > 0     — at least one hard timeout
 *   error rate > 5%  — server-side failures under load
 */

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const eq = a.indexOf("=");
      return eq === -1 ? [a.slice(2), true] : [a.slice(2, eq), a.slice(eq + 1)];
    }),
);

const BASE_URL    = args.url      ?? "http://localhost:3000";
const DURATION_S  = Number(args.duration ?? 10);
const DURATION_MS = DURATION_S * 1_000;
const TIMEOUT_MS  = Number(args.timeout  ?? 10_000);
const START_C     = Number(args.start    ?? 1);
const MAX_C       = Number(args.max      ?? 32);
const EMIT_JSON   = args.json === true || args.json === "true";

// Safe read-only routes: Firestore list calls, no writes, no third-party calls.
const DEFAULT_ENDPOINTS = [
  "/api/products?pageSize=20",
  "/api/categories",
  "/api/brands",
  "/api/faqs?pageSize=20",
];

const ENDPOINTS = args.endpoints
  ? args.endpoints.split(",").map((e) => e.trim())
  : DEFAULT_ENDPOINTS;

// Ceiling thresholds
const CEILING_P99_MS     = 9_000;  // 90% of 10 s Hobby sync limit
const CEILING_ERROR_RATE = 0.05;   // 5% error rate

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function pct(sortedArr, p) {
  if (!sortedArr.length) return 0;
  return sortedArr[Math.max(0, Math.ceil((p / 100) * sortedArr.length) - 1)];
}

function mb(bytes) {
  return Math.round(bytes / 1024 / 1024);
}

function nowIso() {
  return new Date().toISOString();
}

function log(...a) {
  console.log(`[stress ${nowIso()}]`, ...a);
}

// ---------------------------------------------------------------------------
// Run one concurrency level
// ---------------------------------------------------------------------------

async function runLevel(concurrency) {
  const results   = [];  // { latencyMs, ok, timedOut }
  const memSamples = [];
  const levelStart = Date.now();
  let reqCursor = 0;

  const memInterval = setInterval(() => {
    memSamples.push(process.memoryUsage().heapUsed);
  }, 500);

  async function worker() {
    while (Date.now() - levelStart < DURATION_MS) {
      const ep  = ENDPOINTS[reqCursor++ % ENDPOINTS.length];
      const url = `${BASE_URL}${ep}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const t0 = Date.now();
      let ok = false;
      let timedOut = false;
      try {
        const res = await fetch(url, { signal: controller.signal });
        ok = res.ok;
        await res.text().catch(() => {}); // drain so the connection is released
      } catch (e) {
        timedOut = e.name === "AbortError";
      } finally {
        clearTimeout(timer);
      }
      results.push({ latencyMs: Date.now() - t0, ok, timedOut });
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  clearInterval(memInterval);

  return { results, memSamples };
}

// ---------------------------------------------------------------------------
// Summarise
// ---------------------------------------------------------------------------

function summarize({ results, memSamples }) {
  const total = results.length;
  if (!total) return null;
  const latencies  = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const errors     = results.filter((r) => !r.ok && !r.timedOut).length;
  const timeouts   = results.filter((r) => r.timedOut).length;
  const rps        = +(total / DURATION_S).toFixed(1);
  const p50        = pct(latencies, 50);
  const p95        = pct(latencies, 95);
  const p99        = pct(latencies, 99);
  const peakHeapMb = memSamples.length ? mb(Math.max(...memSamples)) : 0;
  const errorRate  = (errors + timeouts) / total;
  return { total, rps, p50, p95, p99, errors, timeouts, peakHeapMb, errorRate };
}

// ---------------------------------------------------------------------------
// ASCII table
// ---------------------------------------------------------------------------

// Column widths: Level  Req/s  p50   p95   p99   Errors  Timeouts  Heap(MB)
const COL_W   = [7,     8,     7,    7,    7,    7,      9,        9];
const HEADERS = ["Level","Req/s","p50","p95","p99","Errors","Timeouts","Heap(MB)"];

function pad(s, w) { return String(s).padEnd(w); }

function printHeader() {
  console.log("");
  console.log(HEADERS.map((h, i) => pad(h, COL_W[i])).join("  "));
  console.log(COL_W.map((w) => "-".repeat(w)).join("  "));
}

function printRow(c, s, ceilingMsg) {
  const cols = [
    `${c}x`,
    s.rps,
    `${s.p50}ms`,
    `${s.p95}ms`,
    `${s.p99}ms`,
    s.errors,
    s.timeouts,
    s.peakHeapMb,
  ];
  const line = cols.map((v, i) => pad(v, COL_W[i])).join("  ");
  console.log(ceilingMsg ? `${line}  ⚠  ${ceilingMsg}` : line);
}

// ---------------------------------------------------------------------------
// Concurrency sequence: 1, 2, 4, 8, 16, 32, ...
// ---------------------------------------------------------------------------

function* levels(start, max) {
  yield start;
  let c = start === 1 ? 2 : start * 2;
  while (c <= max) {
    yield c;
    c *= 2;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n[stress-test] url=${BASE_URL}`);
  console.log(`[stress-test] endpoints: ${ENDPOINTS.join(", ")}`);
  console.log(`[stress-test] ${DURATION_S}s per level · timeout=${TIMEOUT_MS}ms · max=${MAX_C}x`);

  const allLevels = [];
  let ceilingHit  = false;
  let ceilingLevel = null;

  printHeader();

  for (const c of levels(START_C, MAX_C)) {
    log(`running ${c}x concurrent for ${DURATION_S}s …`);
    const raw = await runLevel(c);
    const s   = summarize(raw);
    if (!s) { log(`${c}x: no requests completed`); continue; }

    allLevels.push({ concurrency: c, ...s });

    let ceilingMsg = null;
    if (s.timeouts > 0) {
      ceilingMsg = `${s.timeouts} timeout(s) — Hobby 10s sync limit hit`;
    } else if (s.p99 > CEILING_P99_MS) {
      ceilingMsg = `p99 ${s.p99}ms > ${CEILING_P99_MS}ms (90% of Hobby 10s limit)`;
    } else if (s.errorRate > CEILING_ERROR_RATE) {
      ceilingMsg = `error rate ${(s.errorRate * 100).toFixed(1)}% > 5%`;
    }

    printRow(c, s, ceilingMsg);

    if (ceilingMsg) {
      ceilingHit = true;
      ceilingLevel = c;
      console.log(`\n[stress-test] Ceiling reached at ${c}x — ${ceilingMsg}`);
      break;
    }
  }

  if (!ceilingHit) {
    console.log(
      `\n[stress-test] No ceiling detected up to ${MAX_C}x concurrent.` +
      ` Try --max=${MAX_C * 2} to probe higher.`,
    );
  }

  if (EMIT_JSON) {
    const report = {
      ts: nowIso(),
      config: {
        baseUrl:    BASE_URL,
        endpoints:  ENDPOINTS,
        durationS:  DURATION_S,
        timeoutMs:  TIMEOUT_MS,
        startC:     START_C,
        maxC:       MAX_C,
      },
      levels:  allLevels,
      ceiling: ceilingHit ? { concurrency: ceilingLevel } : null,
    };
    console.log("\n--- JSON report ---");
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
