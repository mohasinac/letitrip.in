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

console.log(
  `[smoke-pw] base=${process.env.SMOKE_BASE_URL || "https://www.letitrip.in"} suites=${suiteFiles.length}`,
);

let totalPass = 0;
let totalFail = 0;
const failures = [];

for (const file of suiteFiles) {
  const full = path.join(suitesDir, file);
  console.log(`\n[${file}]`);
  try {
    const mod = await import(`file://${full.replace(/\\/g, "/")}`);
    const out = (await mod.run?.()) ?? [];
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
    totalFail++;
    failures.push(`${file} :: <crashed> :: ${err?.message}`);
    console.error(`  FAIL  <suite crashed>  ::  ${err?.message}`);
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
