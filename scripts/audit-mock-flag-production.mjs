#!/usr/bin/env node
/**
 * audit-mock-flag-production — strict-zero.
 *
 * Enforces the Track H invariant: no seed data, default config, or migration
 * may set `useMockPayment: true` or `useMockShipping: true`. The production
 * default for both flags MUST be `false`. The resolver throws at runtime if a
 * production deployment is ever started with either flag true — this audit
 * makes the same statement at source-of-truth level so the mistake is caught
 * before deploy.
 *
 * Exit 0 — clean
 * Exit 1 — any violator listed.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".mjs"]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ([...EXTS].some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const PATTERNS = [
  /\buseMockPayment\s*:\s*true\b/,
  /\buseMockShipping\s*:\s*true\b/,
];

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    // Exempt: the audit script itself; the resolver test fixtures (none yet).
    if (rel.includes(join("scripts", "audit-mock-flag-production.mjs"))) continue;
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    for (const pat of PATTERNS) {
      if (pat.test(src)) {
        violations.push(`${rel} :: contains ${pat.source}`);
      }
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-mock-flag-production] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
