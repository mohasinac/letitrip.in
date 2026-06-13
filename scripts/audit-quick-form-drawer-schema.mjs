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
    // Match opening JSX tag across multiple lines. Lazy [\s\S]*? + ensure we
    // stop at the first `>` that closes the tag (not one inside an attribute
    // value — JSX attribute values use `{}` or `""` so a literal `>` outside
    // of a brace pair is the tag terminator).
    const tagPattern = /<\s*QuickFormDrawer\b((?:[^<>{}]|\{[^{}]*\}|"[^"]*"|'[^']*')*?)\/?\s*>/g;
    let m;
    let flagged = false;
    while ((m = tagPattern.exec(src)) !== null) {
      const attrs = m[1];
      if (!/\bschema\s*=\s*\{/.test(attrs)) {
        violations.push(`${relative(ROOT, file)} :: <QuickFormDrawer ...> without schema={...} prop`);
        flagged = true;
        break;
      }
    }
    if (flagged) continue;
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-quick-form-drawer-schema] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
