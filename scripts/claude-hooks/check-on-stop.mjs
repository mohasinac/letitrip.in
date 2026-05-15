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
 *   - scripts/audit-html-wrappers.mjs            (raw HTML instead of appkit primitives + bare divs)
 *   - scripts/audit-code-quality.mjs             (long if-else, deep nesting, large fns, repeated strings)
 *   - scripts/audit-bom.mjs                      (UTF-8 BOM characters from PowerShell encoding)
 *   - scripts/audit-sieve-constants.mjs          (raw sort/filter strings — use sortBy()/sieveFilter())
 *   - appkit/scripts/audit-repository-fields.mjs (deprecated J13 Sieve fields + wrong stats.* sort paths)
 *   - scripts/audit-suspense-boundaries.mjs      (missing <Suspense> on RSC listing page shims)
 *   - scripts/audit-auth-gates.mjs               (pushWishlistOp/checkout without useAuthGate)
 *   - scripts/audit-inline-actions.mjs           (inline action IDs/labels duplicating registry)
 *   - appkit/scripts/audit-query-provider.mjs    (component both provides QueryClientProvider and calls react-query hooks)
 *
 * Baseline-drift audits: audit-ssr-in-appkit, audit-html-wrappers, audit-code-quality block
 * only when the violation count EXCEEDS the recorded baseline (regressions only).
 * audit-sieve-constants manages its own baseline internally (exits 0 on no regression).
 *
 * Total runtime: ~3–5s. Heavy gates (tsc + lint) live in `npm run check`.
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
  {
    label: "audit-html-wrappers",
    cmd: "node",
    args: ["scripts/audit-html-wrappers.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-code-quality",
    cmd: "node",
    args: ["scripts/audit-code-quality.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-bom",
    cmd: "node",
    args: ["scripts/audit-bom.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-sieve-constants",
    cmd: "node",
    args: ["scripts/audit-sieve-constants.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-repository-fields",
    cmd: "node",
    args: ["appkit/scripts/audit-repository-fields.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-suspense-boundaries",
    cmd: "node",
    args: ["scripts/audit-suspense-boundaries.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-auth-gates",
    cmd: "node",
    args: ["scripts/audit-auth-gates.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-inline-actions",
    cmd: "node",
    args: ["scripts/audit-inline-actions.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-query-provider",
    cmd: "node",
    args: ["scripts/audit-query-provider.mjs"],
    cwd: join(ROOT, "appkit"),
  },
];

// Baseline violation counts — block only on regressions (count > baseline).
// audit-ssr-in-appkit: 8 known violations (S2-deferred root files).
// audit-html-wrappers: 302 existing raw HTML / bare-div violations.
// audit-code-quality:  448 existing quality smells (repeated strings, large fns, deep nesting).
const SSR_BASELINE = 8;
const HTML_WRAPPERS_BASELINE = 302;
const CODE_QUALITY_BASELINE = 448;

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

  // Baseline-drift audits: only block on regressions, not on existing violations.
  const BASELINE_AUDITS = {
    "audit-ssr-in-appkit": SSR_BASELINE,
    "audit-html-wrappers": HTML_WRAPPERS_BASELINE,
    "audit-code-quality": CODE_QUALITY_BASELINE,
  };
  if (check.label in BASELINE_AUDITS) {
    const baseline = BASELINE_AUDITS[check.label];
    const out = (result.stdout || "") + (result.stderr || "");
    const m = out.match(/(\d+)\s+violation\(s\) found/);
    if (m) {
      const count = Number(m[1]);
      if (count <= baseline) continue;
      failures.push({
        label: check.label,
        output: `${count} violations (baseline ${baseline} — regression of ${count - baseline}).\n\n${out}`,
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
