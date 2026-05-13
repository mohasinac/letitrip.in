#!/usr/bin/env node
/**
 * Smoke-prod orchestrator — runs every prod-suites/NN-*.mjs in order
 * against the live letitrip.in server.
 *
 * Loads .env.local so the Firebase Admin SA creds (needed for OTP bypass)
 * are available, then dynamically imports every NN-*.mjs file in
 * prod-suites/ and aggregates {pass, fail} totals.
 *
 * Usage:
 *   node scripts/qa/smoke-prod.mjs
 *   node scripts/qa/smoke-prod.mjs --only 03
 *   SMOKE_BASE_URL=https://staging.letitrip.in node scripts/qa/smoke-prod.mjs
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
  } catch {
    // No .env.local — rely on the process environment.
  }
}

await loadDotEnvLocal();

const args = process.argv.slice(2);
const onlyIdx = args.indexOf("--only");
const filter = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const suitesDir = path.join(__dirname, "prod-suites");
const entries = await readdir(suitesDir);
const suiteFiles = entries
  .filter((f) => /^\d{2}-.*\.mjs$/.test(f))
  .filter((f) => !filter || f.startsWith(filter))
  .sort();

console.log(
  `[smoke-prod] base=${process.env.SMOKE_BASE_URL || "https://www.letitrip.in"} suites=${suiteFiles.length}`,
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

console.log(
  `\n${"─".repeat(60)}\n[smoke-prod] ${totalPass}/${totalPass + totalFail} passed`,
);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
}
process.exit(totalFail === 0 ? 0 : 1);
