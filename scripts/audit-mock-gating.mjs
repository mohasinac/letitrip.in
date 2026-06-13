#!/usr/bin/env node
/**
 * audit-mock-gating — strict-zero.
 *
 * Mock and seed data may only be reached from the documented surfaces:
 *
 *   1. Source files under src/__mocks__/ are Jest mocks — exempt provided
 *      they carry an `// audit-mock-gating-ok: jest-only` header marker.
 *   2. Source files under appkit/src/seed/ are seed factories — fine.
 *   3. *.test.ts(x) and *.spec.ts(x) — exempt.
 *   4. src/app/api/demo/seed/route.ts is the only route allowed to import
 *      from appkit/src/seed/.
 *
 * Anything else importing from `mock-*` paths or appkit/src/seed/ fails.
 *
 * Exit 0 — clean.
 * Exit 1 — at least one violation.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".mjs"]);

const SEED_ROUTE = join(ROOT, "src", "app", "api", "demo", "seed", "route.ts");
const MOCKS_DIR = join("src", "__mocks__") + sep;
const SEED_DIR = join("appkit", "src", "seed") + sep;

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

function isTestFile(rel) {
  return /\.(test|spec)\.(ts|tsx|js|mjs)$/.test(rel);
}

const violations = [];
for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (isTestFile(rel)) continue;
    const src = readFileSync(file, "utf8");

    // Rule 1: __mocks__ files must carry the OK header marker.
    if (rel.startsWith(MOCKS_DIR)) {
      const head = src.slice(0, 500);
      if (!/audit-mock-gating-ok:\s*\S+/.test(head)) {
        violations.push(`${rel} :: __mocks__ file missing "// audit-mock-gating-ok: <reason>" header marker`);
      }
      continue;
    }

    // Rule 2 + 4: appkit/src/seed files are fine on their own.
    if (rel.startsWith(SEED_DIR)) continue;

    const cleaned = src
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|\s)\/\/[^\n]*/g, "$1 ");

    // Forbid imports from mock-* paths outside the allowed dirs already handled.
    if (/from\s+["'][^"']*mock-[\w\-]+["']/.test(cleaned)) {
      violations.push(`${rel} :: imports from a mock-* path outside __mocks__/, seed/, or tests`);
    }

    // Forbid imports from appkit/src/seed except the demo seed route.
    if (/from\s+["']@mohasinac\/appkit\/seed["']/.test(cleaned) && file !== SEED_ROUTE) {
      violations.push(`${rel} :: imports @mohasinac/appkit/seed outside the demo seed route`);
    }
    if (/from\s+["']\.\.[/\\][^"']*\/seed["']/.test(cleaned) && file !== SEED_ROUTE && !rel.startsWith(SEED_DIR)) {
      // Relative imports into appkit/src/seed — same restriction.
      violations.push(`${rel} :: relative import into appkit/src/seed outside the demo seed route`);
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-mock-gating] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
