#!/usr/bin/env node
/**
 * Claude Code Stop hook — runs the fast quality gates after each assistant turn.
 *
 * Runs:
 *   - appkit/scripts/audit-violations.mjs        (boundary check)
 *   - appkit/scripts/verify-entries.mjs          (client entry firebase-admin free)
 *   - appkit/scripts/verify-css-build.mjs        (compiled CSS class completeness)
 *   - scripts/audit-ssr-in-appkit.mjs            (route shim thresholds + sidecar + brand strings)
 *   - appkit/scripts/audit-use-client.mjs        (missing "use client" on client-hook files)
 *   - appkit/scripts/audit-double-navigation.mjs (table.set + table.setPage race condition)
 *
 * Total runtime: ~2–3s. Heavy gates (tsc + lint) live in `npm run check`.
 *
 * Exit semantics for Claude Code Stop hook:
 *   - exit 0 → silent pass
 *   - exit 2 → blocks the stop and surfaces stderr to the model so it can fix
 *   - other  → non-blocking error shown to user
 *
 * Reads stop_hook_active from stdin to avoid infinite loops; if true, exits 0.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

// Read hook input from stdin to detect re-entry; bail if Claude is already
// responding to a previous block from this same hook.
let payload = {};
try {
  const raw = readFileSync(0, "utf8");
  if (raw.trim()) payload = JSON.parse(raw);
} catch {
  // No stdin or non-JSON; treat as empty payload.
}
if (payload.stop_hook_active === true) process.exit(0);

const checks = [
  {
    label: "audit-violations",
    cmd: "node",
    args: ["scripts/audit-violations.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "verify-entries",
    cmd: "node",
    args: ["scripts/verify-entries.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "verify-css-build",
    cmd: "node",
    args: ["scripts/verify-css-build.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-ssr-in-appkit",
    cmd: "node",
    args: ["scripts/audit-ssr-in-appkit.mjs"],
    cwd: ROOT,
  },
  {
    label: "verify-og-coverage",
    cmd: "node",
    args: ["appkit/scripts/verify-og-coverage.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-use-client",
    cmd: "node",
    args: ["scripts/audit-use-client.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-double-navigation",
    cmd: "node",
    args: ["scripts/audit-double-navigation.mjs"],
    cwd: join(ROOT, "appkit"),
  },
];

// audit-ssr-in-appkit baseline: 8 known violations (S2-deferred root files).
// Block only on regression (count > baseline), not on baseline itself.
const SSR_BASELINE = 8;

const failures = [];

for (const check of checks) {
  if (!existsSync(join(check.cwd, check.args[0]))) {
    failures.push({ label: check.label, output: `script not found: ${check.args[0]}` });
    continue;
  }
  const result = spawnSync(check.cmd, check.args, {
    cwd: check.cwd,
    encoding: "utf8",
    shell: false,
  });
  if (result.status === 0) continue;

  // Special handling for audit-ssr-in-appkit: allow baseline drift only.
  if (check.label === "audit-ssr-in-appkit") {
    const out = (result.stdout || "") + (result.stderr || "");
    const m = out.match(/(\d+)\s+violation\(s\) found/);
    if (m) {
      const count = Number(m[1]);
      if (count <= SSR_BASELINE) continue;
      failures.push({
        label: check.label,
        output: `${count} violations (baseline ${SSR_BASELINE} — regression of ${count - SSR_BASELINE}).\n\n${out}`,
      });
      continue;
    }
  }
  failures.push({
    label: check.label,
    output: (result.stdout || "") + (result.stderr || ""),
  });
}

if (failures.length === 0) process.exit(0);

const banner =
  "\n========================================================\n" +
  "Quality gate failure — fix before reporting work complete.\n" +
  "Run `npm run check` locally for the full set including tsc + lint.\n" +
  "========================================================\n";

process.stderr.write(banner);
for (const f of failures) {
  process.stderr.write(`\n[${f.label}]\n${f.output}\n`);
}
process.exit(2);
