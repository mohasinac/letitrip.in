#!/usr/bin/env node
/**
 * audit-quick-form-drawer-schema — strict-zero.
 *
 * Every <QuickFormDrawer> JSX usage MUST pass a `schema={...}` prop. The
 * primitive itself (appkit/src/features/shell/QuickFormDrawer.tsx) becomes
 * the single field validator surface — manual required-field checks are
 * deleted in Track D.
 *
 * Exit 0 — clean.
 * Exit 1 — at least one QuickFormDrawer site without a schema prop.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOW = [
  join(ROOT, "appkit", "src", "features", "shell", "QuickFormDrawer.tsx"),
];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx"]);

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

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (ALLOW.includes(file)) continue;
    const src = readFileSync(file, "utf8");
    const matches = src.match(/<\s*QuickFormDrawer\b[^>]*>/g);
    if (!matches) continue;
    for (const tag of matches) {
      if (!/\bschema\s*=\s*\{/.test(tag)) {
        violations.push(`${relative(ROOT, file)} :: <QuickFormDrawer ...> without schema={...} prop`);
        break;
      }
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-quick-form-drawer-schema] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
