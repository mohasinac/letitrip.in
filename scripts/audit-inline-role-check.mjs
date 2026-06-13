#!/usr/bin/env node
/**
 * audit-inline-role-check — strict-zero.
 *
 * No source file may compare user.role to a string literal. Every role check
 * MUST go through a predicate (isAdminUser / isSellerUser / isModeratorUser /
 * isEmployeeUser / isBuyerUser) from
 * appkit/src/features/auth/role-predicates.ts.
 *
 * Allowed locations (definitions + permission resolution):
 *   - appkit/src/features/auth/role-predicates.ts
 *   - appkit/src/_internal/server/features/auth/permissions.ts
 *
 * Exit 0 — clean.
 * Exit 1 — inline `user.role === "x"` (or similar) found.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const ALLOWED = [
  join(ROOT, "appkit", "src", "features", "auth", "role-predicates.ts"),
  join(ROOT, "appkit", "src", "_internal", "server", "features", "auth", "permissions.ts"),
];
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

const PATTERN = /\b(?:user|session|profile|currentUser|me)\??\.role\s*(?:===|!==|==|!=)\s*["'](?:admin|user|seller|moderator|employee|buyer)["']/;

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (ALLOWED.includes(file)) continue;
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) {
        violations.push(`${relative(ROOT, file)}:${i + 1} :: inline role-string compare — use a predicate from role-predicates.ts`);
      }
    });
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-inline-role-check] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
