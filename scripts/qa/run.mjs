#!/usr/bin/env node
/**
 * QA test runner — collapses the legacy `test:smoke[:only]`, `test:pw[:only]`,
 * and `test:audit[:existing]` script aliases into one dispatcher.
 *
 *   node scripts/qa/run.mjs smoke                    # = test:smoke
 *   node scripts/qa/run.mjs smoke --only             # = test:smoke:only
 *   node scripts/qa/run.mjs pw                       # = test:pw
 *   node scripts/qa/run.mjs pw --only 01             # = test:pw:only 01
 *   node scripts/qa/run.mjs audit                    # = test:audit
 *   node scripts/qa/run.mjs audit --use-existing     # = test:audit:existing
 *
 * Unknown flags are forwarded to the underlying suite runner.
 */

import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const SUITES = {
  smoke: { script: "scripts/qa/smoke-prod.mjs" },
  pw: { script: "scripts/qa/smoke-pw.mjs" },
  audit: { script: "scripts/qa/audit-browser.mjs", envFlags: { "--use-existing": { AUDIT_USE_EXISTING: "1" } } },
};

function usage(exitCode = 1) {
  console.error(
    [
      "Usage:",
      "  node scripts/qa/run.mjs <smoke|pw|audit> [...flags]",
      "",
      "Flags forwarded to underlying suite. Recognised here:",
      "  --use-existing  (audit only) — sets AUDIT_USE_EXISTING=1",
    ].join("\n"),
  );
  process.exit(exitCode);
}

const [, , suiteName, ...rest] = process.argv;
if (!suiteName) usage();

const suite = SUITES[suiteName];
if (!suite) {
  console.error(`✗ Unknown suite: ${suiteName}`);
  usage();
}

const env = { ...process.env };
const args = [];
for (const arg of rest) {
  const envMap = suite.envFlags?.[arg];
  if (envMap) {
    Object.assign(env, envMap);
  } else {
    args.push(arg);
  }
}

const res = spawnSync(process.execPath, [suite.script, ...args], {
  cwd: ROOT,
  env,
  stdio: "inherit",
});
if (res.error) {
  console.error(`✗ spawn error: ${res.error.message}`);
  process.exit(1);
}
process.exit(res.status ?? 1);
