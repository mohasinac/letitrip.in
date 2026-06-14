#!/usr/bin/env node
/**
 * Audit dispatcher — single entry point that replaces the 49 individual
 * `audit:*` npm script aliases and the 50-command `check:audits` chain.
 *
 * Each AUDITS entry describes one check. The runner spawns `node` for the
 * given script (or `npm` for the appkit delegate), preserves the original
 * order of the legacy `check:audits` chain, and reports pass/fail.
 *
 *   node scripts/run-audits.mjs                     # run all (fail-fast)
 *   node scripts/run-audits.mjs --all               # explicit, same as above
 *   node scripts/run-audits.mjs --all --no-fail-fast
 *   node scripts/run-audits.mjs ssr-in-appkit       # single audit by name
 *   node scripts/run-audits.mjs hex-tokens --fix    # forward --fix where supported
 *   node scripts/run-audits.mjs --list              # print registry and exit
 *
 * Passthrough: any unknown flag after the audit name is forwarded to the
 * underlying script (e.g. `--verbose`).
 */

import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Order mirrors the legacy `check:audits` && chain. Don't reorder without
// reviewing scripts/claude-hooks/check-on-stop.mjs — that hook calls the
// underlying audit-*.mjs files directly, not this dispatcher, so the
// ordering invariant here is purely about reproducing legacy output.
const AUDITS = [
  // appkit's own audit suite (runs in ./appkit cwd)
  { name: "appkit", kind: "npm-prefix", prefix: "./appkit", script: "check:audits" },

  // root-side
  { name: "ssr-in-appkit",                   script: "scripts/audit-ssr-in-appkit.mjs" },
  { name: "og-coverage",                     script: "appkit/scripts/verify-og-coverage.mjs" },
  { name: "hex-tokens",                      script: "scripts/audit-hex-tokens.mjs", supportsFix: true },
  { name: "config-factories",                script: "scripts/audit-config-factories.mjs" },
  { name: "html-wrappers",                   script: "scripts/audit-html-wrappers.mjs" },
  { name: "code-quality",                    script: "scripts/audit-code-quality.mjs" },
  { name: "bom",                             script: "scripts/audit-bom.mjs" },
  { name: "suspense-boundaries",             script: "scripts/audit-suspense-boundaries.mjs" },
  { name: "auth-gates",                      script: "scripts/audit-auth-gates.mjs" },
  { name: "inline-actions",                  script: "scripts/audit-inline-actions.mjs" },
  { name: "product-form-shell",              script: "scripts/audit-product-form-shell.mjs" },
  { name: "dashboard-padding",               script: "scripts/audit-dashboard-padding.mjs" },
  { name: "user-pages-overhaul",             script: "scripts/audit-user-pages-overhaul.mjs" },
  { name: "root-cause",                      script: "scripts/audit-root-cause.mjs" },
  { name: "dark-mode",                       script: "scripts/audit-dark-mode.mjs" },
  { name: "gitignore",                       script: "scripts/audit-gitignore.mjs" },
  { name: "typography",                      script: "scripts/audit-typography.mjs" },
  { name: "inline-styles",                   script: "scripts/audit-inline-styles.mjs" },
  { name: "env-alignment",                   script: "scripts/audit-env-alignment.mjs" },
  { name: "sieve-constants",                 script: "scripts/audit-sieve-constants.mjs" },
  { name: "toast-coverage",                  script: "scripts/audit-toast-coverage.mjs" },
  { name: "auth-gate-derivation",            script: "scripts/audit-auth-gate-derivation.mjs" },
  { name: "registry-constants",              script: "scripts/audit-route-nav-field-constants.mjs" },
  { name: "spinner-defaults",                script: "scripts/audit-spinner-defaults.mjs" },
  { name: "silent-fetch-catch",              script: "scripts/audit-silent-fetch-catch.mjs" },
  { name: "listing-pagesize",                script: "scripts/audit-listing-pagesize.mjs" },
  { name: "jsx-text-comments",               script: "scripts/audit-jsx-text-comments.mjs" },
  { name: "seed-external-urls",              script: "scripts/audit-seed-external-urls.mjs" },
  { name: "raw-form-input",                  script: "scripts/audit-raw-form-input.mjs" },
  { name: "sticky-offsets",                  script: "scripts/audit-sticky-offsets.mjs" },
  { name: "firebase-alias",                  script: "scripts/audit-firebase-alias.mjs" },
  { name: "semantic-colors",                 script: "scripts/audit-semantic-colors.mjs" },
  { name: "functions-registry-completeness", script: "scripts/audit-functions-registry-completeness.mjs" },
  { name: "payment-provider-import",         script: "scripts/audit-payment-provider-import.mjs" },
  { name: "shipping-provider-import",        script: "scripts/audit-shipping-provider-import.mjs" },
  { name: "mock-flag-production",            script: "scripts/audit-mock-flag-production.mjs" },
  { name: "orphan-dev-routes",               script: "scripts/audit-orphan-dev-routes.mjs" },
  { name: "checkout-bypass",                 script: "scripts/audit-checkout-bypass.mjs" },
  { name: "auth-rate-limit",                 script: "scripts/audit-auth-rate-limit.mjs" },
  { name: "inline-session-cookie",           script: "scripts/audit-inline-session-cookie.mjs" },
  { name: "inline-role-check",               script: "scripts/audit-inline-role-check.mjs" },
  { name: "route-rbac",                      script: "scripts/audit-route-rbac.mjs" },
  { name: "page-rbac",                       script: "scripts/audit-page-rbac.mjs" },
  { name: "mock-gating",                     script: "scripts/audit-mock-gating.mjs" },
  { name: "form-schema",                     script: "scripts/audit-form-schema.mjs" },
  { name: "quick-form-drawer-schema",        script: "scripts/audit-quick-form-drawer-schema.mjs" },
  { name: "media-direct-upload",             script: "scripts/audit-media-direct-upload.mjs" },
  { name: "firestore-storage-urls",          script: "scripts/audit-firestore-storage-urls.mjs" },
  { name: "raw-img-src",                     script: "scripts/audit-raw-img-src.mjs" },
  { name: "finalize-magic-bytes",            script: "scripts/audit-finalize-magic-bytes.mjs" },
  { name: "storage-rules-shape",             script: "scripts/audit-storage-rules-shape.mjs" },
  // W6 — error contract / silent-failure gates (workstreams 1, 3, 5)
  { name: "silent-body-parse",               script: "scripts/audit-silent-body-parse.mjs" },
  { name: "server-action-envelope",          script: "scripts/audit-server-action-envelope.mjs" },
  { name: "usemutation-onerror",             script: "scripts/audit-usemutation-onerror.mjs" },
];

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = { all: false, list: false, fix: false, failFast: true };
  const passthrough = [];
  let name = null;

  for (const arg of args) {
    if (arg === "--all") flags.all = true;
    else if (arg === "--list") flags.list = true;
    else if (arg === "--fix") flags.fix = true;
    else if (arg === "--no-fail-fast") flags.failFast = false;
    else if (arg.startsWith("--")) passthrough.push(arg);
    else if (!name) name = arg;
    else passthrough.push(arg);
  }

  if (!name && !flags.list) flags.all = true;
  return { name, flags, passthrough };
}

function printList() {
  const widest = Math.max(...AUDITS.map((a) => a.name.length));
  for (const a of AUDITS) {
    const target = a.kind === "npm-prefix" ? `npm --prefix ${a.prefix} run ${a.script}` : `node ${a.script}`;
    const fix = a.supportsFix ? " (supports --fix)" : "";
    console.log(`  ${a.name.padEnd(widest)}  ${target}${fix}`);
  }
}

function runAudit(audit, { fix, passthrough }) {
  const extra = [...passthrough];
  if (fix && audit.supportsFix) extra.push("--fix");

  let cmd, args, opts;
  if (audit.kind === "npm-prefix") {
    cmd = process.platform === "win32" ? "npm.cmd" : "npm";
    args = ["--prefix", audit.prefix, "run", audit.script, ...(extra.length ? ["--", ...extra] : [])];
    // Node 20+ requires shell:true to spawn .cmd/.bat on Windows.
    opts = { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" };
  } else {
    cmd = process.execPath;
    args = [audit.script, ...extra];
    opts = { cwd: ROOT, stdio: "inherit" };
  }

  const t0 = Date.now();
  const res = spawnSync(cmd, args, opts);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (res.error) {
    console.error(`  ✗ ${audit.name} — spawn error: ${res.error.message}`);
    return { ok: false, code: 1, elapsed };
  }
  return { ok: res.status === 0, code: res.status ?? 1, elapsed };
}

function main() {
  const { name, flags, passthrough } = parseArgs(process.argv);

  if (flags.list) {
    printList();
    process.exit(0);
  }

  // Single audit by name
  if (name && !flags.all) {
    const audit = AUDITS.find((a) => a.name === name);
    if (!audit) {
      console.error(`✗ Unknown audit: ${name}`);
      console.error(`Run "node scripts/run-audits.mjs --list" to see available audits.`);
      process.exit(2);
    }
    const { ok, code } = runAudit(audit, { fix: flags.fix, passthrough });
    process.exit(ok ? 0 : code);
  }

  // All audits
  const failures = [];
  for (const audit of AUDITS) {
    const { ok, code, elapsed } = runAudit(audit, { fix: flags.fix, passthrough });
    if (!ok) {
      failures.push({ name: audit.name, code });
      console.error(`✗ ${audit.name} failed (${elapsed}s, exit ${code})`);
      if (flags.failFast) {
        process.exit(code || 1);
      }
    }
  }

  if (failures.length) {
    console.error(`\n${failures.length} audit(s) failed: ${failures.map((f) => f.name).join(", ")}`);
    process.exit(failures[0].code || 1);
  }
}

main();
