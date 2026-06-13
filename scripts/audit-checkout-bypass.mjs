#!/usr/bin/env node
/**
 * audit-checkout-bypass — strict-zero.
 *
 * Track H makes `siteSettings.featureFlags.adminCheckoutBypass` the single,
 * audited bypass surface. Rules:
 *
 *   1. Only `src/app/api/admin/checkout-bypass/route.ts` may read or write
 *      the `adminCheckoutBypass` flag at runtime.
 *   2. That route MUST be wrapped by createRouteHandler with admin-only roles
 *      and the `settings:write` permission.
 *   3. Every bypass invocation MUST be logged with `actorUid` and `reason`
 *      fields so the audit trail captures who used it and why.
 *
 * Exit 0 — clean
 * Exit 1 — any rule above violated.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TARGET_ROUTE = join(ROOT, "src", "app", "api", "admin", "checkout-bypass", "route.ts");
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

const violations = [];

// Rule 1 — only the bypass route may reference the flag.
const FLAG = /\badminCheckoutBypass\b/;
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (file === TARGET_ROUTE) continue;
    const rel = relative(ROOT, file);
    // Schema definition + admin site-settings UI need to *describe* the flag.
    // Allow those by requiring "definition" or "schema" or "site-settings" in path.
    if (rel.includes("schemas") || rel.includes("seed") || rel.includes("admin/site-settings")) continue;
    const src = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
    if (FLAG.test(src)) {
      violations.push(`${rel} :: references adminCheckoutBypass outside the bypass route + schema/seed/admin UI`);
    }
  }
}

// Rules 2-3 — inspect the route file shape.
let routeSrc = null;
try { routeSrc = readFileSync(TARGET_ROUTE, "utf8"); } catch { routeSrc = null; }

if (routeSrc === null) {
  violations.push(`${relative(ROOT, TARGET_ROUTE)} missing — Track H requires this route to exist with the audit shape below.`);
} else {
  const cleaned = routeSrc
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
  if (!/\bcreateRouteHandler\s*\(/.test(cleaned)) {
    violations.push(`${relative(ROOT, TARGET_ROUTE)} :: handler not wrapped in createRouteHandler`);
  }
  if (!/ROLES_ADMIN_ONLY\b/.test(cleaned) && !/roles\s*:\s*\[\s*["']admin["']\s*\]/.test(cleaned)) {
    violations.push(`${relative(ROOT, TARGET_ROUTE)} :: createRouteHandler not gated to ROLES_ADMIN_ONLY`);
  }
  if (!/permission\s*:\s*["']settings:write["']/.test(cleaned)) {
    violations.push(`${relative(ROOT, TARGET_ROUTE)} :: createRouteHandler missing permission: "settings:write"`);
  }
  if (!/\bactorUid\b/.test(cleaned)) {
    violations.push(`${relative(ROOT, TARGET_ROUTE)} :: bypass log missing actorUid field`);
  }
  if (!/\breason\b/.test(cleaned)) {
    violations.push(`${relative(ROOT, TARGET_ROUTE)} :: bypass log missing reason field`);
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-checkout-bypass] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
