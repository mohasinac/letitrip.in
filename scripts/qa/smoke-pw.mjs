#!/usr/bin/env node
/**
 * Playwright orchestrator — runs every playwright-prod/pw-NN-*.mjs in order
 * against the live letitrip.in server. Single Chromium browser shared
 * across suites; one context per role (anon/buyer/seller/admin) reused.
 *
 * Usage:
 *   node scripts/qa/smoke-pw.mjs
 *   node scripts/qa/smoke-pw.mjs --only 01
 *   SMOKE_HEADLESS=0 SMOKE_SLOW_MO=200 node scripts/qa/smoke-pw.mjs
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadDotEnvLocal() {
  const envPath = path.resolve(__dirname, "..", "..", ".env.local");
  try {
    const text = await readFile(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

await loadDotEnvLocal();

const args = process.argv.slice(2);
const onlyIdx = args.indexOf("--only");
const filter = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const suitesDir = path.join(__dirname, "playwright-prod");
const entries = await readdir(suitesDir);
const suiteFiles = entries
  .filter((f) => /^pw-\d{2}-.*\.mjs$/.test(f))
  .filter((f) => !filter || f.includes(`-${filter}-`))
  .sort();

// Per-suite wall-clock budget (ms). Sized to test type:
//   page-crawl   → 4 min  (navigation + light assertions per page)
//   interaction  → 3 min  (clicks, toolbar, buyer flow)
//   CRUD create  → 6 min  (nav + fills + API wait + URL change per entity)
//   CRUD edit    → 6 min  (fetch ID + nav + fill + submit per entity)
//   bulk         → 5 min  (2× nav per page + checkbox interactions)
//   visuals/a11y → 2 min  (fast DOM checks on a few pages)
const SUITE_TIMEOUTS_MS = {
  "pw-01": 4 * 60_000,  // public page crawl (~40 pages)
  "pw-02": 5 * 60_000,  // auth + toolbar interactions (OAuth popup timing needs headroom)
  "pw-03": 2 * 60_000,  // buyer add-to-cart flow
  "pw-04": 4 * 60_000,  // seller + admin dashboard crawl (~35 pages)
  "pw-05": 2 * 60_000,  // visual checks (~5 pages)
  "pw-06": 2 * 60_000,  // faqs + reviews (~3 pages)
  "pw-07": 4 * 60_000,  // admin list routes (~35 pages)
  "pw-08": 4 * 60_000,  // admin detail/form routes (~25 pages)
  "pw-09": 6 * 60_000,  // admin CRUD create (10 entities × nav+fill+submit)
  "pw-10": 6 * 60_000,  // admin CRUD edit  (9 entities × fetchId+nav+fill+submit)
  "pw-11": 5 * 60_000,  // admin bulk actions (21 pages × 2 visits + interactions)
  "pw-12": 6 * 60_000,  // store all routes (~30 pages, Razorpay checkout flow)
  "pw-13": 3 * 60_000,  // store CRUD create+edit (8 pages)
  "pw-14": 4 * 60_000,  // user all routes (~25 pages + 3 CRUD)
  "pw-15": 2 * 60_000,  // public expanded deep content (~10 pages)
  "pw-16": 2 * 60_000,  // accessibility audit (~8 pages × 8 checks)
  "pw-17": 4 * 60_000,  // media upload flow (sign+PUT+finalize × 3 uploads + error cases)
};

console.log(
  `[smoke-pw] base=${process.env.SMOKE_BASE_URL || "https://www.letitrip.in"} suites=${suiteFiles.length}`,
);

let totalPass = 0;
let totalFail = 0;
const failures = [];

for (const file of suiteFiles) {
  const full = path.join(suitesDir, file);
  console.log(`\n[${file}]`);

  const suiteKey = file.match(/^(pw-\d{2})/)?.[1];
  const budgetMs = SUITE_TIMEOUTS_MS[suiteKey] ?? 5 * 60_000;

  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`[suite-timeout] exceeded ${budgetMs / 1000}s`)),
      budgetMs,
    );
  });

  try {
    const mod = await import(`file://${full.replace(/\\/g, "/")}`);
    const out = await Promise.race([mod.run?.() ?? Promise.resolve([]), timeoutPromise]);
    clearTimeout(timeoutHandle);
    for (const r of out) {
      const tag = r.ok ? "PASS" : "FAIL";
      console.log(`  ${tag}  ${r.name}  ::  ${r.detail ?? ""}`);
      if (r.ok) totalPass++;
      else {
        totalFail++;
        failures.push(`${file} :: ${r.name} :: ${r.detail ?? ""}`);
      }
    }
  } catch (err) {
    clearTimeout(timeoutHandle);
    totalFail++;
    const isTimeout = err?.message?.startsWith("[suite-timeout]");
    if (isTimeout) {
      failures.push(`${file} :: <timed out> :: exceeded ${budgetMs / 1000}s`);
      console.error(`  FAIL  <suite timed out>  ::  exceeded ${budgetMs / 1000}s`);
    } else {
      failures.push(`${file} :: <crashed> :: ${err?.message}`);
      console.error(`  FAIL  <suite crashed>  ::  ${err?.message}`);
    }
  }
}

const { closeBrowser } = await import("./playwright-prod/_pw-setup.mjs");
await closeBrowser();

console.log(
  `\n${"─".repeat(60)}\n[smoke-pw] ${totalPass}/${totalPass + totalFail} passed`,
);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
}
process.exit(totalFail === 0 ? 0 : 1);
